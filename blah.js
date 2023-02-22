import {createStacEntityFromUrlOrLink} from './src/entry.js'

import fetch, {Headers, Request, Response} from 'node-fetch'

if (!globalThis.fetch) { //eslint-disable-line
    globalThis.fetch = fetch  //eslint-disable-line
    globalThis.Headers = Headers //eslint-disable-line
    globalThis.Request = Request //eslint-disable-line
    globalThis.Response = Response //eslint-disable-line
}
const catalog = await createStacEntityFromUrlOrLink('https://planetarycomputer.microsoft.com/api/stac/v1/')

const searcher = await catalog.createSearch()

searcher
  .limit(20)
  .collections(['landsat-8-c2-l2'])
  .bbox([135, -45, 140, -37])
  .between('2020-08-15', '2020-11-15')

const numResults = await searcher.checkTotalNumberOfItems()
const pageOfResults = await searcher.loadActiveItemCollection()

if (pageOfResults.hasNextLink) {
    const anotherPage = await pageOfResults.loadNextPage()
}