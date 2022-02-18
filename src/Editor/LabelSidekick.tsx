import * as React from 'react'
import {Store} from 'reactive-lens'
import {style} from 'typestyle'

import * as G from '../Graph'
import * as Utils from '../Utils'
import * as record from '../record'

import * as ReactUtils from '../ReactUtils'

import * as Model from './Model'
import {Taxonomy, TaxonomyGroup} from './Config'
import { getI18n } from 'react-i18next';

const i18n = getI18n()

const LabelSidekickStyle = style({
  ...Utils.debugName('LabelSidekickStyle'),

  $nest: {
    '& .entry': {
      cursor: 'pointer',
      padding: '0 5px',
    },
    '& .cursor': {
      background: '#c2e0ff',
      borderRadius: 5,
      padding: '0 5px',
    },
    '& .selected': {
      color: 'blue',
      fontWeight: 700,
    },
    '& ul ul': {
      paddingLeft: 10,
      marginRight: 5,
      marginLeft: 0,
    },
    '&': {
      zIndex: 20,
      position: ['-webkit-sticky', 'sticky'],
      marginRight: '10px',
      margin: 0,
      padding: 1,
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '92vh',
    },
    '& > * > button': {
      width: '47%',
      marginBottom: '5px',
    },
    '& .taxonomy': {
      overflowY: 'auto',
    },
  },
})

interface DropdownProps {
  taxonomy: Taxonomy
  selected: string[]
  onChange(t: { label: string; key: string; desc: string; }, value: boolean): void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  mode: Model.Mode
  extraInput?: {get: () => string | undefined; set: (value: string) => void}
}
interface DropdownState {
  cursor: number
}

export class Dropdown extends React.Component<DropdownProps, DropdownState> {
  constructor(props: DropdownProps) {
    super(props)
    this.state = {
      cursor: 0,
    }
  }

  render() {
    const props = this.props
    const {taxonomy, selected, mode} = this.props
    const {cursor} = this.state
    const labels = Utils.flatMap(taxonomy, getLabels)

    function getLabels(taxGroup:TaxonomyGroup){
      const labels: string[] = []
      taxGroup.entries.forEach(function (entr) {
        labels.push(entr.label)
      })
      taxGroup.subgroups.forEach(function (taxSubGroup) {
        taxSubGroup.entries.forEach(function (entr) {
          labels.push(entr.label)
        })
        taxSubGroup.subgroups.forEach(function (taxSubSubGroup) {
          taxSubSubGroup.entries.forEach(function (entr) {
            labels.push(entr.label)
          })
        })
      })
      return labels
    }

    function isSelected(l: string) {
      return selected.some(s => s === l)
    }

    function isDigit(l: string) {
      return /^\d+$/.test(l)
    }

    function set(t: { label: string; key: string; desc: string; }) {
      props.onChange(t, true)
    }

    function unset(t: { label: string; key: string; desc: string; }) {
      props.onChange(t, false)
    }

    function toggle(t: { label: string; key: string; desc: string; }, ) {
      if (isSelected(t.key)) {
        unset(t)
      } else {
        set(t)
      }
    }

    function wrap(c: number, currentLabels: string[]) {
      const N = currentLabels.length
      return (c + N) % N
    }

    function new_cursor(base: number, currentLabels: string[], sign: 1 | -1 = 1, m = /.*/): number {
      for (let i = 0; i < currentLabels.length; i++) {
        const c = wrap(base + i * sign, currentLabels)
        if (m.test(currentLabels[c])) {
          return c
        }
      }
      return cursor
    }

    const liberal_re = (s: string) => new RegExp('^' + s.split('').join('-?'), 'i')

    const entry_span = (t: { label: string; key: string; desc: string; }, c?: number) => {
      const classes = (cursor == c ? ' cursor' : '') + (isSelected(t.key) ? ' selected' : '')
      return (
        <span
          className={'entry' + classes}
          onMouseOver={evt => {
            // Only on mouse move, not when triggered by scroll.
            if (c && (!evt || evt.nativeEvent.movementX || evt.nativeEvent.movementY))
              this.setState({cursor: c})
          }}
          onMouseDown={e => {
            toggle(t)
            e.preventDefault()
          }}>
          {t.label}
        </span>
      )
    }

    const is_expanded = (g: TaxonomyGroup) => {
      if ('is_expanded' in g) {
        return g.is_expanded
      }
      return false
    }

    const has_subgroups = (g: TaxonomyGroup) => {
      if ('subgroups' in g) {
        return g.subgroups.length > 0
        // return false
      }
      return false
    }

    const list = Utils.expr(() => {
      let c = 0
      return (
        <ul className="taxonomy" ref="taxonomy">
          {props.mode == Model.modes.anonymization &&
            selected.filter(isDigit).map(i => <li key={'d' + i}>{entry_span({ label: i + '', key: i + '', desc: ''})}</li>)}
          {taxonomy.map((g, i) => (
            <li key={i}>
              <b>
                <span
                  className={'entry'}
                  onMouseOver={evt => {
                    // Only on mouse move, not when triggered by scroll.
                    if (c && (!evt || evt.nativeEvent.movementX || evt.nativeEvent.movementY))
                      this.setState({cursor: c})
                  }}
                  onMouseDown={e => {
                    g.is_expanded = !g.is_expanded
                    this.forceUpdate()
                    e.preventDefault()
                  }}>
                  {is_expanded(g) ? '- ' + g.group : '+ ' + g.group}
                </span>
              </b>
              <ul>
                {
                  has_subgroups(g) ? 
                    is_expanded(g) ?
                      g.subgroups.map((sg, j) => { return(
                        <li key={'i' + i + 'j' + j}>
                          <b>
                            <span
                              className={'entry'}
                              onMouseOver={evt => {
                                // Only on mouse move, not when triggered by scroll.
                                if (c && (!evt || evt.nativeEvent.movementX || evt.nativeEvent.movementY))
                                  this.setState({cursor: c})
                              }}
                              onMouseDown={e => {
                                sg['is_expanded'] = !sg['is_expanded']
                                this.forceUpdate()
                                e.preventDefault()
                              }}>
                              {is_expanded(sg) ? '- ' + sg.group : '+ ' + sg.group}
                            </span>
                          </b>
                          <ul>
                            {is_expanded(sg) ?
                              sg.entries.map((e, i) => {
                                return (
                                  <li ref={'tax_item' + c} key={i} title={e.desc}>
                                    {entry_span(e, c++)}
                                  </li>
                                )
                              }) : '' 
                            }
                          </ul>
                        </li> )}) : ''
                    :
                    is_expanded(g) ?
                      g.entries.map((e, i) => {
                        return (
                          <li ref={'tax_item' + c} key={i} title={e.desc}>
                            {entry_span(e, c++)}
                          </li>
                        )
                      }) : ''
                }
              </ul>
            </li>
          ))}
        </ul>
      )
    })
    const scrollToCursor = (cursor: number) => {
      const parent = this.refs['taxonomy'] as any
      const height = parent.clientHeight + parent.scrollTop
      const parentTop = parent.offsetTop

      if ((this.refs['tax_item' + cursor] as any) !== undefined) {
        const offsetTop = (this.refs['tax_item' + cursor] as any).offsetTop - parentTop

        if (offsetTop + 50 > height) {
          parent.scrollTop = offsetTop
        } else if (offsetTop - 30 < parent.scrollTop) {
          parent.scrollTop = offsetTop - 30
        }
      }
    }

    const input = (
      <input
        onMouseDown={e => e.currentTarget.focus()}
        ref={e => {
          if (e && document.activeElement && !/\bkeepfocus\b/.test(document.activeElement.className)) {
            const x = window.scrollX
            const y = window.scrollY
            e.focus()
            window.scrollTo(x, y)
          }
        }}
        placeholder={
          mode == Model.modes.anonymization
            ? this.props.extraInput
              ? 'Extra input'
              : 'Filter / numeric label'
            : i18n.t('other.enter_filter_text')
        }
        onKeyDown={e => {
          const t = e.target as HTMLInputElement
          const openLabels = Model.getOpenLabels(taxonomy)
          if (e.key === 'Enter') {
            const a = this
            if (this.props.extraInput) {
              this.props.extraInput.set(t.value)
              t.value = ''
            } else if (isDigit(t.value)) {
              toggle({ label: t.value, key: t.value, desc: ''})
              t.value = ''
            } else {
              toggle({ label: openLabels[0][cursor], key: openLabels[1][cursor], desc: ''})
              t.value = ''
            }
            e.preventDefault()
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            const c = new_cursor(cursor + 1, openLabels[0], 1)
            this.setState({cursor: c})
            scrollToCursor(c)
            e.preventDefault()
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            const c = new_cursor(cursor - 1, openLabels[0], -1)
            this.setState({cursor: c})
            scrollToCursor(c)
            e.preventDefault()
          } else if (e.key === 'Tab') {
            if (e.shiftKey) {
              const c = new_cursor(cursor - 1, openLabels[0], -1, liberal_re(t.value))
              this.setState({cursor: c})
              scrollToCursor(c)
            } else {
              const c = new_cursor(cursor + 1, openLabels[0], 1, liberal_re(t.value))
              this.setState({cursor: c})
              scrollToCursor(c)
            }
            e.preventDefault()
          } else if (!e.altKey && !e.ctrlKey && !e.metaKey) {
            if (e.key === 'Backspace' && t.value == '' && selected.length > 0) {
              unset({ label: selected[selected.length - 1], key: selected[selected.length - 1], desc: ''})
            } else if (e.key === 'Backspace' && (t.value.length == 0 || t.value.length == 1)){
                // Model.expandParents(taxonomy, selected)
            } else {
              const filterQuery = e.key === 'Backspace' ? t.value.substring(0, t.value.length - 1) : t.value + e.key

              Model.expandFilterText(taxonomy, selected, filterQuery)
              const openLabels = Model.getOpenLabels(taxonomy)
              const c = new_cursor(0, openLabels[0], 1, liberal_re(filterQuery))
              this.setState({cursor: c})
              scrollToCursor(c)
            }
          }
          this.props.onKeyDown && this.props.onKeyDown(e)
        }}
      />
    )

    return (
      <React.Fragment>
        {input}
        {list}
      </React.Fragment>
    )
  }
}

export function LabelSidekick({
  store,
  taxonomy,
  mode,
  extraInput,
  disabled,
}: {
  store: Store<Model.State>
  taxonomy: Taxonomy
  mode: Model.Mode
  extraInput?: {get: () => string | undefined; set: (value: string) => void}
  disabled?: boolean
}) {
  const graph = store.at('graph').at('now')
  const selected = Object.keys(store.get().selected)
  const advance = Model.make_history_advance_function(store)
  if (selected.length > 0) {
    const edges = G.token_ids_to_edges(graph.get(), selected)
    const labels = Utils.uniq(Utils.flatMap(edges, e => e.labels))
    return (
      <div
        className={
          'sidekick box ' + LabelSidekickStyle + ' ' + ReactUtils.clean_ul + ' ' + 'mode-' + mode
        }
        onMouseDown={e => {
          e.stopPropagation()
          e.preventDefault()
        }}>
        <div>
          {Model.actionButtons[mode].map(action =>
            ReactUtils.Button(
              Model.actionButtonNames[action],
              Model.actionDescriptions[action] + `\n\n` + i18n.t('actionButtonNames.shortcut') + `: ${Model.actionKeyboard[action]}`,
              () => Model.performAction(store, action)
            )
          )}
        </div>
        <Dropdown
          taxonomy={taxonomy}
          selected={labels}
          mode={mode}
          onChange={(t, value) =>
            !disabled &&
            Model.validation_transaction(store, store =>
              advance(() => {
                t == null ? Model.updateDropdown(store, selected) :
                Model.setLabel(store, selected, t, value)
              })
            )
          }
          onKeyDown={e => {
            const key = (e.altKey || e.metaKey ? 'Alt-' : '') + (e.shiftKey ? 'Shift-' : '') + e.key
            const action = record.reverse_lookup(Model.actionKeyboard, key)
            if (action) {
              Model.performAction(store, action)
            }
            // e.preventDefault()
          }}
          extraInput={extraInput}
        />
      </div>
    )
  }
  return null
}
