import {expect, test} from 'vitest'
import {loadJsonFileSync} from 'load-json-file'
import * as utils from '../src/utils'
import path from 'path'

const catalogJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'catalog.json'))
const collectionJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'collection.json'))
const collectionItemsJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'collection-items.json'))
const collectionItems2Json = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'collection-items-page2.json'))
const itemJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'item.json'))
const eoJson = loadJsonFileSync(path.join(__dirname, 'harness', 'mspc', 'eo-cc-queryable-definition.json'))

test('getLinkByRelType', () => {
    const link = utils.getLinkByRelType(catalogJson, 'search')
    expect(link).toEqual({
        'title': 'Item Search',
        'rel': 'search',
        'type': 'application/json',
        'href': 'https://explorer.sandbox.dea.ga.gov.au/stac/search'
    })

    expect(utils.getLinkByRelType(catalogJson, 'foo')).toEqual(null)
})

test('getNextLinkObj', () => {
    const link = utils.getNextLinkObj(collectionItemsJson)
    expect(link).toEqual({
        'rel': 'next',
        'href': 'https://explorer.sandbox.dea.ga.gov.au/stac/search?collections=aster_aloh_group_composition&limit=20&_o=20&_full=True'
    })

    const link2 = utils.getNextLinkObj(catalogJson)
    expect(link2).toEqual(null)
})

test('getPrevLinkObj', () => {
    const link2 = utils.getPrevLinkObj(collectionItems2Json)
    expect(link2).toEqual({
        'rel': 'prev',
        'href': 'https://explorer.sandbox.dea.ga.gov.au/stac/collections/aster_aloh_group_composition/items',
        'type': 'application/json'
    })
})


test('sniffStacType', () => {
    expect(utils.sniffStacType(collectionItemsJson)).toEqual('ItemCollection')
    expect(utils.sniffStacType(collectionItems2Json)).toEqual('ItemCollection')
    expect(utils.sniffStacType(catalogJson)).toEqual('Catalog')
    expect(utils.sniffStacType(collectionJson)).toEqual('Collection')
    expect(utils.sniffStacType(itemJson)).toEqual('Item')
})


test('createStacItemFromDataAndType', () => {
    const out = utils.createStacItemFromDataAndType(catalogJson, 'Catalog', '')
    expect(out.stacType).toEqual('Catalog')

    const out2 = utils.createStacItemFromDataAndType(collectionJson, 'Collection', '')
    expect(out2.stacType).toEqual('Collection')

    const out3 = utils.createStacItemFromDataAndType(itemJson, 'Item', '')
    expect(out3.stacType).toEqual('Item')

    const out4 = utils.createStacItemFromDataAndType(collectionItemsJson, 'ItemCollection')
    expect(out4.stacType).toEqual('ItemCollection')
})


test('getValueFromObjectUsingPath', () => {
    const str = '#/definitions/fields/properties/eo:cloud_cover'
    const hashComponents = str.replace('#/', '').split('/')
    const out = utils.getValueFromObjectUsingPath(eoJson, hashComponents)
    expect(out).toEqual({
        "title": "Cloud Cover",
        "type": "number",
        "minimum": 0,
        "maximum": 100
    })
})
