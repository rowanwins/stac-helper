import {expect, test} from 'vitest'
import {loadJsonFileSync} from 'load-json-file'
import path from 'path'
import {Item, Collection} from '../src/internal'

const collectionJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'collection.json'))
const itemJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'item.json'))

const collectionParent = new Collection(collectionJson, '')

test('Item', () => {
    const item = new Item(itemJson, '', collectionParent)

    expect(item.stacType).toEqual('Item')
    expect(item.collectionUrl).toEqual('https://explorer.sandbox.dea.ga.gov.au/stac/collections/aster_aloh_group_composition')
    expect(item.hasAssets).toEqual(true)
    expect(item.datetime).toBe('2004-03-02T00:00:00.500000Z')
    expect(item.datetimeRange).toBe(null)
    expect(item.bbox).toEqual([
        141.3597762249145,
        -16.000103182734,
        145.485054102524,
        -10.2856586
    ])

    expect(item.bboxAsGeojsonFeature).toEqual({
        type: 'Feature',
        properties: {},
        bbox: [
            141.3597762249145,
            -16.000103182734,
            145.485054102524,
            -10.2856586
        ],
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [141.3597762249145, -16.000103182734],
                    [145.485054102524, -16.000103182734],
                    [145.485054102524, -10.2856586],
                    [141.3597762249145, -10.2856586],
                    [141.3597762249145, -16.000103182734],
                ]
            ]
        }
    })
})
