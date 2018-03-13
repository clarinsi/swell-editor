import {qc, graph_no_ws} from './Common'
import {Gen} from 'proptest'
import * as QC from 'proptest'
import * as G from '../src/Graph'

import * as iosaas from '../src/iosaas'
import * as png from '../src/png'
import * as ImageServer from '../src/ImageServer'
import fetch from 'node-fetch'

import 'mocha'
import {expect} from 'chai'

import * as http from 'http'
import * as fs from 'fs'
import * as Utils from '../src/Utils'

describe('png metadata (note: whitespace normalized, only .graph considered)', async () => {
  const port = 3001
  const server = `http://localhost:${port}`
  const png_url = (d: iosaas.Data) =>
    `${server}/i.png?${encodeURIComponent(d.source_string)}//${encodeURIComponent(d.target_string)}`
  const metadata_url = (d: iosaas.Data) =>
    `${server}/metadata.json?${encodeURIComponent(png_url(d))}`
  let shutdown: () => Promise<void>
  before(async () => {
    shutdown = await iosaas.serve(3001)
  })
  Utils.range(8).map(s0 => {
    const size = (s0 + 1) * 12
    it(`roundtrips graph of size ${size}`, async () => {
      const g = graph_no_ws.sample(size)
      const data = iosaas.graph_to_data(g)
      // const data2 = await ImageServer.metadata_from_url(iosaas.image, png_url(data))
      // expect(data2.graph).to.deep.equal(data.graph)
      const data3 = await fetch(metadata_url(data)).then(x => x.json())
      expect(data3.graph).to.deep.equal(data.graph)
    })
  })
  after(async () => {
    await shutdown()
  })
})
