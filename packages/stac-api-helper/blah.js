import initialiseCatalog from './src/entry.js'
import fetch, {Headers, Request, Response} from 'node-fetch'

if (!globalThis.fetch) { //eslint-disable-line
    globalThis.fetch = fetch  //eslint-disable-line
    globalThis.Headers = Headers //eslint-disable-line
    globalThis.Request = Request //eslint-disable-line
    globalThis.Response = Response //eslint-disable-line
}


async function getData () {
    const catalog = await initialiseCatalog('https://explorer.prod.dea.ga.gov.au/stac')
    await catalog.getCollections()
    console.log(catalog.collectionTitles)
    // const collection = catalog.getCollectionByTitle('aster_aloh_group_composition')
    // const numItems = await collection.checkNumberOfCollectionItems()
    // await collection.paginateThroughAllCollectionItems()

    // const searcher = catalog.createSearch()
    // searcher
    //   .limit(20)
    //   .collections('wofs_albers')
    //   .bbox([135, -45, 140, -37])
    //   .between('1989-08-15', '1990-11-15')

    // const numResults = await searcher.checkNumberOfSearchMatches()
    // await searcher.paginateThroughAllSearchResults()

}

getData()
