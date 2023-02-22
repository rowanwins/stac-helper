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

test('MixinExtent', () => {
    expect(collection.isTimeEnabled).toBe(true)
    expect(collection.hasMoreThanOneDate).toBe(true)
    expect(collection.dates).toEqual([
      "2004-03-02T00:00:00.500000+00:00",
      "2004-03-02T00:00:00.500000+00:00"
    ])

    expect(collection.bbox).toEqual([
      112.917275536606,
      -43.79261862769363,
      153.640054299875,
      -10.28565859999998
    ])

    expect(collection.bboxAsGeojsonFeature).toEqual({
      type: 'Feature',
      properties: {},
      bbox: [
        112.917275536606,
        -43.79261862769363,
        153.640054299875,
        -10.28565859999998
      ],
      geometry: {
          type: 'Polygon',
          coordinates: [
              [
                  [112.917275536606, -43.79261862769363],
                  [153.640054299875, -43.79261862769363],
                  [153.640054299875, -10.28565859999998],
                  [112.917275536606, -10.28565859999998],
                  [112.917275536606, -43.79261862769363],
              ]
          ]
      }
  })

  })

