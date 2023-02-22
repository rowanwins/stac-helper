import {expect, test} from 'vitest'
import {loadJsonFileSync} from 'load-json-file'
import path from 'path'
import {ItemCollection, Collection} from '../src/internal'
import 'vi-fetch/setup';

const collectionJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'collection.json'))
const itemCollectionJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'collection-items.json'))

const collection = new Collection(collectionJson, 'https://explorer.sandbox.dea.ga.gov.au/stac/collections/aster_aloh_group_composition')
const itemsCollection = new ItemCollection(itemCollectionJson, collection)

test('ItemCollection', () => {
    expect(itemsCollection.stacType).toBe('ItemCollection')
    
    expect(itemsCollection.prevLink).toEqual(null)
    expect(itemsCollection.hasPrevLink).toEqual(false)
    
    expect(itemsCollection.nextLink).toEqual({
      rel: 'next',
      href: 'https://explorer.sandbox.dea.ga.gov.au/stac/search?collections=aster_aloh_group_composition&limit=20&_o=20&_full=True'
    })
    expect(itemsCollection.hasNextLink).toEqual(true)
})

