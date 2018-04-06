import * as CodeMirror from 'codemirror'
import * as React from 'react'
import {Store, Lens, Undo} from 'reactive-lens'
import * as Utils from './Utils'

import * as D from './Diff'
import {Graph} from './Graph'
import * as G from './Graph'
import * as L from './LadderView'
import * as RD from './RichDiff'
import * as T from './Token'

import {VNode} from './LadderView'

export const ManualMarkClassName = 'ManualMark'
export const HoverClassName = 'Hover'

function Wrap(h: HTMLElement, k: () => void) {
  return (
    <div
      ref={el => {
        if (el) {
          while (el && el.lastChild) {
            el.removeChild(el.lastChild)
          }
          el.appendChild(h)
          k()
        }
      }}
    />
  )
}

export interface CMVN {
  node: VNode
  cm: CodeMirror.Editor
}

function CM(opts: CodeMirror.EditorConfiguration): CMVN {
  const div = document.createElement('div')
  const cm = CodeMirror(div, {lineWrapping: true, ...opts})
  return {node: Wrap(div, () => cm.refresh()), cm}
}

function defaultTabBehaviour(cm: CodeMirror.Editor) {
  ;(cm.on as any)('keydown', (_: any, e: KeyboardEvent) => {
    if (e.key == 'Tab') {
      ;(e as any).codemirrorIgnore = true
    }
  })
}

export interface Cursor {
  head: number
  anchor: number
}

export interface State {
  readonly graph: Undo<Graph>
  readonly hover_id?: string
  readonly subspan?: G.Subspan
}

export function GraphEditingCM(store: Store<State>): CMVN {
  /* Note that we don't show the last character of the graph in the code mirror.
  It must necessarily be whitespace anyway. */
  const history = store.at('graph')
  const graph = history.at('now')

  function undo() {
    history.modify(Undo.undo)
  }
  function redo() {
    history.modify(Undo.redo)
  }

  const extraKeys = {
    'Ctrl-Z': () => undo(),
    'Ctrl-Y': () => redo(),
    'Cmd-Z': () => undo(),
    'Cmd-Y': () => redo(),
  }

  const {cm, node} = CM({extraKeys, tabindex: 3})
  defaultTabBehaviour(cm)
  cm.setValue(G.target_text(graph.get()))

  const {Index} = PositionUtils(cm, graph)

  cm.on('beforeChange', (_, change) => {
    if (change.origin == 'undo') {
      change.cancel()
      undo()
    } else if (change.origin == 'redo') {
      change.cancel()
      redo()
    }
  })

  function update_cursor() {
    const g = graph.get()
    const text = G.target_text(g)
    const doc = cm.getDoc()
    const head = doc.indexFromPos(doc.getCursor('head'))
    const anchor = doc.indexFromPos(doc.getCursor('anchor'))
    Utils.setIfChanged(
      store.at('subspan'),
      G.sentence_subspans_around_positions(graph.get(), [head, anchor])
    )
  }

  cm.on('cursorActivity', _ =>
    store.transaction(() => {
      update_cursor()
      Utils.setIfChanged(store.at('hover_id'), undefined)
    })
  )

  cm.on('change', (_, change) => {
    /* if (change.origin == 'drag') {
        change.cancel()
      } else if (change.origin == 'paste') {
        // drag-and-drop makes this paste (yes!):
        change.cancel()
        paste()
      } */
    if (change.origin != 'setValue') {
      store.transaction(() => {
        const g = graph.get()
        history.modify(Undo.advance)
        graph.set(G.set_target(g, cm.getDoc().getValue() + ' '))
        set_marks()
        update_cursor()
      })
    }
  })

  function graph_to_cm() {
    const graph_text = G.target_text(graph.get()).slice(0, -1)
    const editor_text = cm.getDoc().getValue()
    if (graph_text !== editor_text) {
      cm.setValue(graph_text)
      // TODO: set the cursor to the end of the change, maybe G.set_target can tell us
      set_marks()
      update_cursor()
    }
  }

  cm.getWrapperElement().addEventListener('mousemove', e => {
    const i = Index.fromCoords(e)
    const {edge} = i.toEdge()
    store.transaction(() => {
      Utils.setIfChanged(store.at('hover_id'), edge ? edge.id : undefined)
    })
  })

  function set_marks() {
    cm.operation(() => {
      const doc = cm.getDoc()
      doc.getAllMarks().map(m => m.clear())
      const g = graph.get()
      const em = G.edge_map(g)
      const hover_id = store.get().hover_id
      let i = 0
      g.target.forEach(tok => {
        const n = tok.text.length
        const e = em.get(tok.id)
        function mark_me(opts: CodeMirror.TextMarkerOptions) {
          const from = doc.posFromIndex(i)
          const to = doc.posFromIndex(i + n - (tok.text.match(/\s$/) || '').length)
          doc.markText(from, to, opts)
        }
        e && e.manual && mark_me({className: ManualMarkClassName})
        if (e) {
          mark_me({className: L.hoverClass(hover_id, e.id)})
        }
        i += n
      })
    })
  }

  store.on(() => {
    graph_to_cm()
    set_marks()
  })

  graph_to_cm()

  return {node, cm}
}

function PositionUtils(cm: CodeMirror.Editor, graph: Store<Graph>) {
  class Edge {
    constructor(public readonly edge: G.Edge | null) {}
  }

  class Token {
    constructor(public readonly token: T.Token | null) {}

    toEdge() {
      if (this.token) {
        const g = graph.get()
        const em = G.edge_map(g)
        const edge = em.get(this.token.id)
        if (edge) {
          return new Edge(edge)
        }
      }
      return new Edge(null)
    }
  }

  class Index {
    constructor(public readonly index: number | null) {}

    static fromCoords(e: {pageX: number; pageY: number}): Index {
      const coord = cm.coordsChar({left: e.pageX, top: e.pageY})
      if (!(('outside' in coord) as any)) {
        const g = graph.get()
        return new Index(cm.getDoc().indexFromPos(coord))
      } else {
        return new Index(null)
      }
    }

    toEdge() {
      return this.toToken().toEdge()
    }

    toToken(): Token {
      if (this.index) {
        const g = graph.get()
        const {token} = T.token_at(G.target_texts(g), this.index)
        if (token in g.target) {
          return new Token(g.target[token])
        }
      }
      return new Token(null)
    }
  }
  return {Edge, Token, Index}
}
