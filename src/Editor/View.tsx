import * as React from 'react'
import {Store, Lens, Undo} from 'reactive-lens'
import * as typestyle from 'typestyle'

import * as G from '../Graph'
import * as Utils from '../Utils'
import * as record from '../record'

import * as ReactUtils from '../ReactUtils'
import {Close, Button, VNode} from '../ReactUtils'

import * as Model from './Model'
import {DropZone} from './DropZone'
import * as CM from './CodeMirror'
import {config, label_sort, taxonomy_has_label, label_taxonomy, label_args, taxonomy_is_expanded} from './Config'
import {configSwell} from './swellData'

import * as EditorTypes from '../EditorTypes'

import {LabelSidekick} from './LabelSidekick'
import {ImportExport} from './ImportExport'
import * as GV from '../GraphView'

import * as Manual from '../Doc/Manual'
import {Severity} from './Validate'
import {anonymize_when, anonfixGraph, is_anon_label} from './Anonymization'
import {anonService} from '../AnonService'

import '../i18n/config';
import { Translation, getI18n } from 'react-i18next';
import { none } from 'ramda'

import "@fontsource/ibm-plex-sans";

typestyle.cssRaw(`
body > div {
  height: 100%
}
`)

const header_height = '172px'
const footer_height = '384px'

const i18n = getI18n()

const topStyle = typestyle.style({
  ...Utils.debugName('topStyle'),
  fontFamily: '"IBM Plex Sans", sans-serif',
  color: '#222',
  display: 'grid',

  gridGap: '0px 5px',
  margin: '0 auto',
  alignItems: 'start',
  gridTemplate: `
    "header   header header"  ${header_height}
    "sidekick main   summary" 1fr
    "footer   footer footer"  ${footer_height}
  / 250px     3fr    minmax(180px, 1fr)
  `,
  minHeight: '100%',

  $nest: {
    ...record.flatten(
      'sidekick main summary header footer'.split(' ').map(area => ({
        [`& > .${area}`]: {
          gridArea: area,
          height: '100%',
        },
      }))
    ),
    '& .header.box': {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      padding:0,
      paddingBottom: '5px',
      marginBottom: '5px',
      borderTop: 'none',
      height: 'auto'
    },
    '& .red-header': {
      position:'relative',
      height: '64px',
      paddingLeft: '32px',
      background: '#e12a26',
    },
    '& .red-header .logo img': {
      marginTop: '16px',
      height: '32px',
    },
    '& .red-header-menu-items': {
      position: 'absolute',
      top: 0,
      right: '32px',
    },
    '& .red-header-menu-items>button,.red-header-menu-items>a': {
      color: 'white',
      lineHeight: '64px',
      background: 'none',
      border: 'none',
      textDecoration: 'none',
      margin:0,
      marginLeft:'24px',
      fontSize: '16px',
      padding:0,
      display:'inline-block'
    },
    '& .white-header': {
      background:'white',
      height:'72px',
      position:'relative',
      textAlign:'right',
      paddingRight:'24px',
    },
    '& .white-header-share': {
      cursor:'pointer',
      display: 'inline-block',
      marginTop: '24px',
      marginLeft:'16px',
      padding:'4px',
    },
    '& .white-header-share:hover': {
      background:'#f5f5f5'
    },
    '& .white-header-share img': {
      width:'24px',
    },
    '& .sidekick > div': {
      top: `${header_height}`,
    },
    '& .content': {
      height: '100%',
    },
    '& .footer.box': {
      background: '#161616',
      bottom: 0,
      zIndex: 20,
      borderTop:'none',
      color: 'white'
    },
    '& .footer h5': {
      paddingTop: '24px',
      color: '#b3b3b3',
      fontSize: '12px',
      lineHeight: '1.33',
      letterSpacing: '0.32px',
      fontWeight: 'normal'
    },
    '& .footer .footer-container': {
      display: 'flex',
      width: '100%',
      paddingLeft:'32px',
      paddingRight:'32px',
    },
    '& .footer .footer-column-1': {
      position: 'relative',
      width: '12.5%',
      height: '224px',
      display: 'block',
      flex: '0 0 12.5%',
      borderLeft: '1px solid #666666',
      paddingLeft: '24px',
    },
    '& .footer .footer-column-2': {
      position: 'relative',
      width: '25%',
      height: '224px',
      display: 'block',
      flex: '0 0 25%',
      borderLeft: '1px solid #666666',
      paddingLeft: '24px',
    },
    '& .footer .footer-column-2 p': {
      fontSize: '12px',
      fontWeight: 'normal',
      lineHeight: 1.33,
      letterSpacing: '0.32px',
      marginTop:0,
      marginBottom:0,
      
    },
    '& .footer .footer-column-2 p a': {
      color: 'white',
      textDecoration: 'none',
    },
    '& .footer .footer-column-2 p.text-grey-70': {
      color: '#b3b3b3',
      
    },
    '& .footer .to-bottom': {
      position: 'absolute',
      bottom: '0',
      left: '24px',
      right: '24px',
    },
    '& .footer .footer-column-1 .to-bottom': {
      maxWidth: '100px;'
    },
    '& .footer .footer-column-2 .to-bottom': {
      maxWidth: '300px;'
    },
    '& .footer img': {
      width: '100%',
    },
    '& .menu .box': {
      position: 'absolute',
      top: header_height,
      right: 0,
      zIndex: 100,
      maxWidth: '180px',
    },
    '& .menu button': {
      appearance: 'none',
      '-moz-appearance': 'none',
      '-webkit-appearance': 'none',
      borderWidth: 0,
      background: 'none',
      display: 'block',
      width: '100%',
      textAlign: 'left',
      margin: 0,
      padding: '.2em',
      $nest: {
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, .1)',
        },
        '&:disabled': {
          opacity: 0.5,
        },
        '&:disabled:hover': {
          backgroundColor: 'inherit',
        },
      },
    },
    '& .CodeMirror, & textarea': {
      border: '1px solid #ddd',
      height: 'auto',
      paddingBottom: '1em',
      lineHeight: '1.5em',
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
    '& .CodeMirror .cm-resize-handle': {
      display: 'block',
      position: 'absolute',
      bottom: 0,
      right: 0,
      zIndex: 99,
      width: '18px',
      height: '18px',
      boxShadow: 'inset -1px -1px 0 0 silver',
      cursor: 'nwse-resize',
    },
    [`& .${CM.ManualMarkClassName}`]: {
      color: '#26a',
    },
    '& .box': {
      background: 'hsl(0,0%,96%)',
      borderTop: '2px hsl(220,65%,65%) solid',
      boxShadow: '2px 2px 3px 0px hsla(0,0%,0%,0.2)',
      borderRadius: '0px 0px 2px 2px',
      padding: '3px',
    },
    '& .vsep': {
      marginBottom: '10px',
    },
    '& .inline': {
      display: 'inline-block',
    },
    '& pre.pre-box, & .pre-box pre': {
      fontSize: '0.85em',

      padding: '0.25em',
    },
    '& pre': {
      whiteSpace: 'pre-wrap',
    },
    '& .doc img': {
      maxWidth: '100%',
    },
    '& .TopPad': {
      paddingTop: '1em',
    },
    '& path': {
      stroke: '#222',
    },
    '& input': {
      width: '100%',
      fontFamily: 'inherit',
      color: 'inherit',
    },
    '& .graphView': {
      position: 'relative',
      overflowY: 'auto',
      resize: 'vertical',
      marginTop: '1em',
    },
    '& .graphView ul': {
      zIndex: 10,
      cursor: 'pointer',
    },
    '& .Selectable': {
      padding: '2px',
      border: '1px solid transparent',
      borderRadius: '3px',
    },
    '& .hovering .hover .Selectable:not(.Selected), & .hovering path.hover, & .hovering .hover path': {
      background: '#8882',
    },
    '& .Selected': {
      background: 'hsla(220,65%,65%, .3)',
      borderColor: 'hsl(220,65%,65%)',
    },
    [`& .cm-hovering span.hover:not(.${CM.SelectedMarkClassName})`]: {
      background: '#8882',
    },
    [`& .${CM.SelectedMarkClassName}`]: {
      background: 'hsla(220,65%,65%, .3)',
    },
    '& button': {
      fontFamily: '"IBM Plex Sans", sans-serif',
      fontSize: '0.85em',
      marginRight: '5px',
      marginBottom: '5px',
    },
    '& button:last-child': {
      marginRight: 0,
    },
    '& .error, & .warning': {
      whiteSpace: 'pre-wrap',
      padding: '15px',
      marginBottom: '20px',
      border: '1px solid transparent',
      borderRadius: '4px',
    },
    '& .error': {
      backgroundColor: '#f2dede',
      borderColor: '#ebccd1',
      color: '#a94442',
    },
    '& .warning': {
      backgroundColor: '#f2e9de',
      borderColor: '#ebebd1',
      color: '#a99942',
    },
    '& .comment-pane textarea': {
      display: 'block',
      width: '100%',
      resize: 'vertical',
    },
    '& .float_right > *': {
      float: 'right',
    },
    '& .close': {
      float: 'right',
      textDecoration: 'none',
      opacity: 0.4,
    },
    '& .close:hover': {
      opacity: 0.8,
    },
  },
})

export function View(store: Store<Model.State>, cms: Record<G.Side, CM.CMVN>): VNode {
  // const { t } = useTranslation(['ns1', 'ns2']);
  const state = store.get()
  const graph = Model.graphStore(store)
  const readonly = Model.is_target_readonly(state.mode)

  const visibleGraph = Model.visibleGraph(store)

  const advance = Model.make_history_advance_function(store)

  const manual_page = state.manual !== undefined && Manual.manual[state.manual]

  const svlink_data = state.svlink !== undefined && configSwell.corrAnno[state.svlink]

  store.at('hover_id').ondiff(hover_id => {
    const graphViewElement = document.querySelector<HTMLElement>('.graphView')
    if (!graphViewElement) return
    const edgeElement = graphViewElement.querySelector<HTMLElement>(`[data-edge=${hover_id}]`)
    edgeElement && Utils.scrollIntoView(graphViewElement, edgeElement)
  })

  const sv_part = () =>
    svlink_data && (
      Model.setSvlink(store, state.svlink))
    
  const manual_part = () =>
    manual_page && (
      <div className="main" style={{minHeight: '18em'}}>
        {Manual.slugs.map(slug => (
          <span key={slug}>
            {state.manual === slug ? (
              slug.replace('_', ' ')
            ) : (
              <ReactUtils.A
                title={slug.replace('_', ' ')}
                text={slug.replace('_', ' ')}
                onMouseDown={e => {
                  e.stopPropagation()
                  Model.setManualTo(store, slug)
                }}
              />
            )}{' '}
          </span>
        ))}
        {manual_page && (
          <React.Fragment>
            <Close onMouseDown={() => Model.setManualTo(store, undefined)} title="Close manual" />
            {manual_page.text}
            {G.equal(manual_page.target, graph.get(), true) && (
              <i style={{color: 'darkgreen'}}>Correct!</i>
            )}
          </React.Fragment>
        )}
      </div>
    )

  function full_manual() {
    return (
      <div className={topStyle}>
        <div className="main">
          <div className="content">
            <Close onMouseDown={() => Model.setManualTo(store, undefined)} title="Close manual" />
            {Manual.slugs.map(slug => {
              const page = Manual.manual[slug]
              if (page) {
                const m = anonymize_when(page.mode == 'anonymization')
                return (
                  <React.Fragment>
                    {page.text}
                    <i>Initial view:</i>
                    <div className={Model.is_target_readonly(page.mode) ? ' NoManualBlue' : ''}>
                      <GV.GraphView graph={m(page.graph, store.at('pseudonyms'))} />
                    </div>
                    <i>Target view:</i>
                    <div className={Model.is_target_readonly(page.mode) ? ' NoManualBlue' : ''}>
                      <GV.GraphView graph={m(page.target, store.at('pseudonyms'))} />
                    </div>
                    <ReactUtils.A
                      title={'Try this!'}
                      text={'Try this!'}
                      onMouseDown={e => {
                        e.stopPropagation()
                        Model.setManualTo(store, slug)
                      }}
                    />
                  </React.Fragment>
                )
              }
            })}
          </div>
        </div>
      </div>
    )
  }

  function main() {
    const hovering = Model.isHovering(store)
    const visible_graph = Model.visibleGraph(store)
    // Limit the rich diff to the visible graph.
    const rich_diff = state.rich_diff && state.rich_diff.filter(d => visible_graph.edges[d.id])
    const units = Model.compactStore(store)
    const label_mode = (mode: string, label: string) =>
      G.is_comment_label(label) ||
      (mode == Model.modes.anonymization ? is_anon_label(label) : taxonomy_has_label(mode, label))
    const label_expanded = (mode: string, label: string) =>
      taxonomy_is_expanded(mode, label)

    return (
      <div className="content">
        {ShowErrors(store.at('errors'))}
        {manual_part()}
        {sv_part()}
        {state.show.source_text && (
          <div className="TopPad">
            <Translation>{(t) => <em>{t('main.source_text')}:</em>}</Translation>
            <div className={hovering ? 'cm-hovering' : ''}>{cms.source.node}</div>
            <div>
              {!!state.backend ||
                Button(i18n.t('main.copy_to_target'), '', () =>
                  advance(() => graph.modify(g => G.init_from(G.source_texts(g))))
                )}
            </div>
          </div>
        )}
        {state.show.target_text && (
          <div className="TopPad">
            <Translation>{(t) => <em>{t('main.target_text')}:</em>}</Translation>
            <div className={hovering ? 'cm-hovering' : ''}>{cms.target.node}</div>
          </div>
        )}
        <br></br>
        {Button(click_replace(store.at('automatic_rendering').get()), '', () => store.at('automatic_rendering').modify(b => !b))}
        <div
          className={'vsep' + (hovering ? ' hovering' : '') + (readonly ? ' NoManualBlue' : '')}
          style={{minHeight: '10em'}}>
          <GV.GraphView
            mode={state.mode}
            side={state.side_restriction}
            orderChangingLabel={s => config.order_changing_labels[s]}
            graph={visible_graph}
            richDiff={rich_diff}
            hoverId={state.hover_id}
            onHover={hover_id => store.update({hover_id})}
            selectedIds={Object.keys(state.selected)}
            generation={state.generation}
            labelMode={label_mode}
            labelExpanded={label_expanded}
            labelSort={label_sort}
            onSelect={(ids, only) => Model.onSelect(store, ids, only)}
          />
        </div>
        {state.show.validation && ShowMessages(store)}
        {state.show.image_link && ImageWebserviceAddresses(visible_graph, Model.inAnonMode(state))}
        {state.show.graph && (
          <div className="box pre-box">
            <pre>{Utils.show(visibleGraph)}</pre>
            <h3>Paste graph</h3>
            <input
              onChange={e => {
                try {
                  const g = JSON.parse(e.currentTarget.value)
                  G.is_graph(g) && store.at('graph').modify(Undo.advance_to(g))
                  e.currentTarget.value = 'ok!'
                } catch {}
              }}></input>
          </div>
        )}
        {state.show.diff && (
          <pre className="box pre-box">{Utils.show(G.enrichen(visibleGraph))}</pre>
        )}
        {state.show.examples && (
          <div className="TopPad">
            <em>Examples:</em>
            {config.examples.map((e, i) => (
              <div key={i}>
                <div>
                  {Button('\u21ea', 'load example', () =>
                    advance(() => units.set({source: e.source, target: e.source}))
                  )}
                  {!e.target ? (
                    <div />
                  ) : (
                    Button('\u21eb', 'see example analysis', () =>
                      advance(() => units.set({source: e.source, target: e.target}))
                    )
                  )}
                  <span>{e.source}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {state.doc && (
          <div className="box doc">
            <Close onMouseDown={() => store.at('doc').set(undefined)} title="Close" />
            {Button('open in new window', '', () => {
              window.open(state.doc)
              store.at('doc').set(undefined)
            })}
            {state.doc_node && <div dangerouslySetInnerHTML={{__html: state.doc_node.outerHTML}} />}
          </div>
        )}
      </div>
    )
  }

  const show_store = (show: Model.Show) => store.at('show').via(Lens.key(show))

  function header() {
    const history = Model.history(store)

    const toggle = (show: Model.Show) => show_store(show).modify(b => (b ? undefined : true))

    const toggle_button = (show: Model.Show, enabled?: boolean, label = show) =>
      Button(show_hide_str(state.show[show]) + i18n.t('options.' + label), '', () => toggle(show), enabled, true)

    const exit_reanonymization = (mode: Model.Mode) => {
      // The done status needs to go from false to true at validation.
      const real_done = store.at('done').get()
      store.at('done').set(false)
      // Overwrite source tokens, then save.
      Model.validation_transaction(store, s => {
        s.at('done').set(true)
        s.at('graph')
          .at('now')
          .set(anonfixGraph(Model.visibleGraph(store)))
      })
      const validation_success = store.at('done').get()
      store.at('done').set(real_done)
      if (validation_success) {
        Model.save(store)
        Model.report(store, 'Anonymization changed during ' + mode)
        // After save, switch mode.
        const unsub = store.at('version').ondiff(() => {
          store.at('mode').set(mode)
          unsub()
        })
      }
    }

    const mode_switcher = (mode: Model.Mode, enable_in_any_mode: boolean = false) =>
      Button(
        i18n.t('options.switch_to') + ` ${Model.mode_label(mode)}`,
        '',
        Model.inAnonfixMode(state)
          ? () => exit_reanonymization(mode)
          : () => store.at('mode').set(mode),
        state.mode !== mode && (!state.backend || state.start_mode == mode || enable_in_any_mode)
      )

    return (
      <React.Fragment>
        <div className={'red-header'}>
          <a href={"/"} className={'logo'}><img src={require("../../static/logo.svg")}/></a>
          <div className={'red-header-menu-items'}>
            <a href="">{i18n.t('redHeader.about')}</a>
            {
              Button(
                i18n.t('headerButtons.opposite_language'),
                i18n.t('headerButtons.opposite_language_description'),
                () => {
                  
                  if(i18n.language === 'en-US'){
                    i18n.changeLanguage('sl');
                  } else {
                    i18n.changeLanguage('en-US');
                  }
                  window.location.reload();
                }
              )}
              </div>
        </div>
        
        <div className={'white-header'}>
            <a className={'white-header-share'} onClick={e => {
              window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(window.location.href)+'&fbrefresh=true','facebook-share-dialog','width=626,height=436')
            }}>
                <img src={require("../../static/logo--facebook.svg")} alt="Facebook" />
            </a>
            <a className={'white-header-share'} onClick={e => {
              window.open("https://twitter.com/share?url="+encodeURIComponent(window.location.href)+"&text="+document.title+'&hashtags=cjvt,svala', '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');return false;
            }}>
                <img src={require("../../static/logo--twitter.svg")} alt="Twitter"/>
            </a>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
          <div>
            {Button(i18n.t('headerButtons.undo'), '', history.undo, history.canUndo())}
            {Button(i18n.t('headerButtons.redo'), '', history.redo, history.canRedo())}
          </div>
          <div style={{fontWeight: 'bold'}}>
            {Model.mode_label(state.mode)} { state.import_file == undefined ? '' : `(${state.import_file})` } {state.essay ? `– essay ${state.essay}` : ''}{' '}
            {!Model.can_modify(state).state && '(read-only)'}
          </div>
          <div>
            {!!state.backurl && (
              <a
                style={{margin: '3px 8px', fontSize: '0.9em', opacity: 0.8}}
                href={state.backurl}
                onClick={e => {
                  Model.validateState(store, true)
                  const messages = store.at('validation_messages').get()
                  if (
                    messages.length &&
                    !confirm(messages.map(m => m.message).join('\n') + '\n\nLeave anyway?')
                  ) {
                    e.preventDefault()
                  }
                }}>
                back
              </a>
            )}
            
            {state.done !== undefined &&
              !Model.inAnonfixMode(state) &&
              Button(state.done ? 'not done' : 'done', 'toggle between done and not done', () =>
                Model.validation_transaction(store, s => s.at('done').modify(b => !b), true)
              )}
            {toggle_button('options')}
          </div>
        </div>
        {state.show.options && (
          <div className="menu">
            <div className="box">
              <ImportExport store={store}/>
              <hr />
              {toggle_button('source_text')}
              {toggle_button('target_text')}
              {RestrictionButtons(store.at('side_restriction'))}
              {Button(i18n.t('options.fit_graph'), i18n.t('options.fit_graph_description'), () => fitGraph())}
              {Button(
                i18n.t('options.show_full_graph'),
                i18n.t('options.show_full_graph_description'),
                () => {
                  store.transaction(() => {
                    Model.setSelection(store, [])
                    Model.setSubspanIncluding(store, [])
                  })
                }
              )}
              <hr />
              {state.mode == Model.modes.anonymization &&
                Button(
                  'use pseudonymizer service',
                  'Add pseudonymization labels using the automatic rule-based pseudonymizer',
                  () =>
                    anonService(
                      state.backend
                        ? state.backend.replace(/tasks\/.*/, 'annotation/pseuws')
                        : config.pseuws_url,
                      Model.graphStore(store),
                      store.at('pseudonyms'),
                      e => Model.flagError(store, e)
                    )
                )}
              {Model.visible_button('validate') ? Button('validate', '', () => Model.validateState(store, true)): ''}
              {Model.visible_button(Model.modes.anonymization.toString()) ? mode_switcher(Model.modes.anonymization, true) : ''}
              {Model.visible_button(Model.modes.normalization.toString()) ? mode_switcher(Model.modes.normalization) : ''}
              {Model.visible_button(Model.modes.correctannot.toString()) ? mode_switcher(Model.modes.correctannot) : ''}
              {Model.visible_button(Model.modes.correctannot_slo.toString()) ? mode_switcher(Model.modes.correctannot_slo) : ''}
              {Model.visible_button(Model.modes.correctannot_kost.toString()) ? mode_switcher(Model.modes.correctannot_kost) : ''}
              <hr />
              {toggle_button('graph')}
              {toggle_button('diff')}
              <hr />
              {Button(
                state.manual === undefined ? i18n.t('options.manual') : i18n.t('options.exit_manual'),
                'toggle showing manual',
                () => Model.setManualTo(store, state.manual ? undefined : 'manual')
              )}
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }

  const selected_edges = G.token_ids_to_edges(visibleGraph, Object.keys(store.get().selected))
  const selected_only_edge = selected_edges.length === 1 ? selected_edges[0] : undefined
  const selected_source = selected_only_edge
    ? G.partition_ids(visibleGraph)(selected_only_edge.ids).source
    : []
  const selected_only_source = selected_source.length ? selected_source[0].id : undefined

  return state.manual === 'print' ? (
    full_manual()
  ) : (
    <div
      className={topStyle}
      style={{position: 'relative'}}
      onMouseDown={() => show_store('options').set(undefined)}>
      <div className="header box">{header()}</div>
      <div className="sidekick">
        <LabelSidekick
          store={store}
          taxonomy={state.taxonomy[state.mode]}
          mode={state.mode}
          extraInput={
            selected_only_edge &&
            selected_only_source &&
            selected_only_edge.labels.some(l => !!label_args[l])
              ? {
                  get: () => {
                    const args = store.get().pseudonym_args[selected_only_source]
                    return args ? args.join(' ') : undefined
                  },
                  set: (value: string) => {
                    store.at('pseudonym_args').update({[selected_only_source]: value.split(' ')})
                  },
                }
              : undefined
          }
          disabled={!Model.can_modify(state).state}
        />
      </div>
      <div className="main" onMouseDown={e => Model.deselect(store)}>
        <DropZone
          webserviceURL={config.image_ws_url}
          onDrop={d =>
            advance(() => {
              Model.disconnectBackend(store, () => {
                graph.set(d.graph)
                store.update({
                  mode: d.anon_mode ? Model.modes.anonymization : Model.modes.normalization,
                })
              })
            })
          }>
          {main()}
        </DropZone>
      </div>
      {Summary(store)}
      <div className="footer box">
        <div className="footer-container">
        <div className="footer-column-1">
          <h5>Izdal</h5>
          <div className="to-bottom">
            <a className="uni-logo" href="https://www.uni-lj.si/" target="_blank">
                <img src={require("../../static/unilj_logo.svg")}/>
            </a>
          </div>
        </div>
        <div className="footer-column-1">
          <h5>Upravljanje vira</h5>
          <div className="to-bottom" style={{bottom: '-11.5%'}}>
            <p>
                <a href="https://www.cjvt.si" target="_blank" >
                    <img src={require("../../static/cjvt_logo.svg")} />
                </a>
            </p>
          </div>
        </div>
        <div className="footer-column-1">
          <h5>Podporniki</h5>
          <div className="to-bottom" style={{bottom: '-11.5%'}}>
              <p style={{marginBottom: '8px'}}>
                  <a href="https://slovenscina.eu/" target="_blank">
                      <img src={require("../../static/rsdo_logo.svg")} style={{width: '70%'}}/>
                  </a>
              </p>
              <p style={{marginBottom: '8px'}}>
                  <a href="https://www.gov.si/drzavni-organi/ministrstva/ministrstvo-za-kulturo/" target="_blank">
                      <img src={require("../../static/mzk.svg")}/>
                  </a>
              </p>
              <p>
                  <a href="https://www.arrs.si/sl/" target="_blank">
                      <img src={require("../../static/ARRSLogo_2016.svg")}/>
                  </a>
              </p>
          </div>
        </div>
        <div className="footer-column-1">
          <h5>Prenos vira</h5>
          <div className="to-bottom">
            <p><a href="https://github.com/clarinsi/classla" target="_blank"><img src={require("../../static/clarin_logo.svg")} /></a></p>
          </div>
        </div>
        <div className="footer-column-2">
          <h5>Dostopnost vira</h5>
          <div className="to-bottom">
            <p>Delo je dostopno pod licenco <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</a></p>
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank"><img src={require("../../static/by-sa.svg")} style={{width:'40%',marginTop:'16px'}}/></a>
          </div>
        </div>
        <div className="footer-column-2">
          <h5>Kontakt</h5>
          <div className="to-bottom">
            <div style={{float:'left',width:'45%'}}>
                <p>Center za jezikovne vire in tehnologije</p>
                <br/>
                <p className="text-grey-70">Večna pot 113<br/>
                    SI-1000 Ljubljana</p>
            </div>
            <div style={{float:'right',width:'45%'}}>
                <p className="text-grey-70">Telefon</p>
                <p><a href="">+386 1 479 82 99</a></p>
                <br/>
                <p className="text-grey-70">Email</p>
                <p><a href="mailto:info@cjvt.si">info@cjvt.si</a></p>
            </div>
        </div>
        </div>
        </div>
        <span style={{opacity: 0.8, fontSize: '0.9em'}}>
          {state.essay && state.backend && (
            <span style={{float: 'right', opacity: 0.9}}>
              {`${state.version ? 'revision ' + state.version + ' of' : 'saving'} essay ${
                state.essay
              } at `}
              <code style={{fontSize: '0.95em'}}>{state.backend}</code>
            </span>
          )} 
        </span>
      </div>
    </div>
  )
}

/** Auto-size the spaghetti. */
function fitGraph() {
  const gv = document.querySelector('.graphView') as HTMLElement | null
  const footer = document.querySelector('.footer') as HTMLElement | null
  if (!gv || !footer) return
  // Pull spaghetti bottom down to wrapper bottom.
  // Subtracting a few pixels is necessary for some reason.
  gv.style.height = `${window.innerHeight - footer.offsetHeight - gv.offsetTop - 5}px`
}

function show_hide_str(b: boolean | undefined) {
  return b ? i18n.t('options.hide') + ' ' : i18n.t('options.show') + ' '
}

function click_replace(b: boolean | undefined) {
  return b ? i18n.t('main.spaghetti_button_text_disable') : i18n.t('main.spaghetti_button_text_enable')
}

function RestrictionButtons(store: Store<G.Side | undefined>): VNode[] {
  return G.sides.map(k =>
    Button(
      show_hide_str(store.get() !== G.opposite(k)) + i18n.t(`options.${k}`) + ` ` + i18n.t('options.in_graph'),
      '',
      // Undefined means show both.
      () => store.set(store.get() === undefined ? G.opposite(k) : undefined),
      store.get() !== k
    )
  )
}

function ShowErrors(store: Store<Record<string, true>>) {
  return record.traverse(store.get(), (_, msg) => (
    <div className="error" key={msg}>
      <Close
        title="dismiss"
        onMouseDown={e => {
          store.via(Lens.key(msg)).set(undefined)
          e.preventDefault()
        }}
      />

      {msg}
    </div>
  ))
}

function ShowMessages(store: Store<Model.State>) {
  const messageStore = store.at('validation_messages')
  return messageStore.get().map((message, i) => (
    <div className={message.severity} key={i}>
      {// Errors should prevent action, so error messages indicate an error that has not actually happened.
      // They will disappear on the next validation, but we should also let the user dismiss them manually.
      message.severity == Severity.ERROR && (
        <Close
          title="dismiss"
          onMouseDown={e => {
            messageStore.modify(ms => ms.slice(0, i).concat(ms.slice(i + 1)))
            e.preventDefault()
          }}
        />
      )}

      {message.message}

      {String(message.subject).indexOf('e-') === 0 && <span>: {Edge(store, message.subject)}</span>}
    </div>
  ))
}

function Summary(store: Store<Model.State>) {
  return (
    <div className="summary">
      {ShowComments(store)}
      {store.get().mode === Model.modes.anonymization
        ? LabelUsage(store, l => /^\d+$/.test(l), 'source')
        : LabelUsage(store, l => label_taxonomy(l) !== Model.modes.anonymization)}
    </div>
  )
}

function ShowComments(store: Store<Model.State>) {
  const g = Model.currentGraph(store)
  const setGraphComment = Utils.debounce(1000, (comment: string) =>
    Model.graphStore(store).modify(g => G.set_comment(g, comment))
  )
  const setEdgeComment = Utils.debounce(1000, (edgeId: string, comment: string) =>
    Model.graphStore(store).modify(g => G.comment_edge(g, edgeId, comment))
  )
  if (G.empty(g)) return null
  return (
    <div>
      <div className="comment-pane box vsep">
        <Translation>{(t) => <p>{t('summary.document_comment')}</p>}</Translation>
        <textarea
          // Prevent refocusing to label filter field.
          className={'keepfocus'}
          // Avoid deselecting.
          onMouseDown={ev => ev.stopPropagation()}
          onChange={ev => setGraphComment(ev.target.value)}
          defaultValue={g.comment}
          disabled={!Model.can_modify(store.get()).state}
        />
      </div>
    </div>
  )
}

function ImageWebserviceAddresses(g: G.Graph, anon_mode: boolean) {
  const escape = (s: string) =>
    encodeURIComponent(s)
      .replace('(', '%28')
      .replace(')', '%29')
  const data: EditorTypes.Data = EditorTypes.graph_to_data(g, anon_mode)
  const st = EditorTypes.data_to_string(data)
  const url = `${config.image_ws_url}/png?${escape(st)}`
  return (
    <pre
      className={'box pre-box'}
      style={{whiteSpace: 'normal', wordBreak: 'break-all', overflowX: 'hidden'}}>
      {url}
    </pre>
  )
}

/** Lists edges for each label in use. */
export function LabelUsage(
  store: Store<Model.State>,
  label_filter?: (l: string) => boolean,
  side?: G.Side
) {
  const g = Model.currentGraph(store)
  const obs_class = (labels: string[]) => (labels.some(l => -1 != l.indexOf('!')) ? ' OBS ' : '')
  return (
    <div>
      {record.traverse(
        G.label_edge_map(g, label_filter),
        (es, label) => (
          <div key={label} className="box vsep">
            <div className={GV.BorderCell + obs_class([label])}>
              <div>{label}</div>
            </div>
            <ul>
              {es.map(e => (
                <li key={e.id}>{Edge(store, e.id, side)}</li>
              ))}
            </ul>
          </div>
        ),
        true
      )}
    </div>
  )
}

/** Visualizes an edge. */
export function Edge(store: Store<Model.State>, id: string, side?: G.Side) {
  const g = Model.currentGraph(store)
  const in_edge = (t: G.Token) => g.edges[id].ids.includes(t.id)
  const tokens = {
    source: g.source.filter(in_edge),
    target: g.target.filter(in_edge),
  }
  const tids = side ? tokens[side].map(t => t.id) : g.edges[id].ids
  return (
    <span
      onClick={() => Model.setSelection(store, tids)}
      style={{cursor: 'pointer', textDecoration: 'underline'}}>
      {side
        ? G.text(tokens[side])
        : `${G.text(tokens.source).trim()}—${G.text(tokens.target).trim()}`}
    </span>
  )
}
