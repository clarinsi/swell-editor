import * as React from 'react'
import {Button} from '../ReactUtils'
import * as G from '../Graph'
import {Store, Lens, Undo} from 'reactive-lens'
import * as Model from './Model'
import * as Utils from '../Utils'
import { getI18n } from 'react-i18next';

const i18n = getI18n()

export function ImportExport({store}: {store: Store<Model.State>}) {
  function TextInputWithFocusButton() {
  // initialise with null, but tell TypeScript we are looking for an HTMLInputElement
      const inputEl = React.useRef<HTMLInputElement>(null);
      const onImportButtonClick = () => {
        if(inputEl && inputEl.current) {
          inputEl.current.click()
        } 
      }
      const onExportButtonClick = () => {
        
        const viewGraph = Model.viewGraph(store)
        const text = Utils.show(viewGraph)

        const element = document.createElement("a")
        const file = new Blob([text], {type: 'text/plain'})
        element.href = URL.createObjectURL(file)
        const import_file = store.at('import_file').get()
        if (import_file){
          element.download = String(store.at('import_file').get())
        } else {
          element.download = 'unknown.json'
        }
        document.body.appendChild(element)
        element.click()
      }
      const inputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = function(event: Event){
          if(event && event.target) {
            const text = String(reader.result)
            try {
              const g = JSON.parse(text)
              G.is_graph(g) && store.at('graph').modify(Undo.advance_to(g))
            } catch (error) {}
          }
        }
        if(e && e.target && e.target.files){
          reader.readAsText(e.target.files[0])

          store.at('import_file').set(e.target.files[0].name)
        }

      }
      return (
        <>
          { /* in addition, inputEl only can be used with input elements. Yay! */ }
          <input type='file' id='file' onChange={(e: React.ChangeEvent<HTMLInputElement>) => inputChange(e)} ref={inputEl} style={{display: 'none'}}/>
          {Button(i18n.t('options.import_graph'), '', () => onImportButtonClick())}
          <input id="myInput" style={{display: 'none'}}/>
          {Button(i18n.t('options.export_graph'), '', () => onExportButtonClick())}
        </>
      );
    }

  return (
      <div>
        {TextInputWithFocusButton()}
      </div>)
}
