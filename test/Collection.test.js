import {expect, test} from 'vitest'
import {loadJsonFileSync} from 'load-json-file'
import path from 'path'
import {Catalog, Collection} from '../src/internal'

const collectionJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'collection.json'))
const catalogJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'catalog.json'))

const catalogParent = new Catalog(catalogJson, 'https://explorer.sandbox.dea.ga.gov.au/stac')
const collection = new Collection(
  collectionJson,
  'https://explorer.sandbox.dea.ga.gov.au/stac/collections/aster_aloh_group_composition',
  catalogParent
)

test('Collection', () => {
    expect(collection.stacType).toBe('Collection')
    expect(collection.collectionItemsLink).toEqual({
      href: 'https://explorer.sandbox.dea.ga.gov.au/stac/collections/aster_aloh_group_composition/items',
      rel: "items"
    })
    expect(collection.numberOfProviders).toBe(0)
})

test('Collection - Search', async () => {
    const search = await collection.createSearch()
    expect(search._params.collections).toEqual(['aster_aloh_group_composition'])
})
