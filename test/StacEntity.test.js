import {expect, test} from 'vitest'
import {loadJsonFileSync} from 'load-json-file'
import path from 'path'
import {Item, Collection} from '../src/internal'

const collectionJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'collection.json'))
const itemJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'item.json'))

const landsat8CollectionJson = loadJsonFileSync(path.join(__dirname, 'harness', 'mspc', 'landsat8-collection.json'))
const landsat8ItemJson = loadJsonFileSync(path.join(__dirname, 'harness', 'mspc', 'landsat8-item.json'))

const collectionParent = new Collection(collectionJson, '')

test('StacEntity - Item', () => {
    const item = new Item(itemJson, '', collectionParent)

    expect(item.stacType).toEqual('Item')
    expect(item.titleOrId).toEqual("170a3181-9971-45b7-9c19-02d95c9a0562")
    expect(item.title).toEqual(null)
    expect(item.descriptionAsHtml).toEqual(null)
    expect(item.linkToSelf).toEqual('https://explorer.sandbox.dea.ga.gov.au/stac/collections/aster_aloh_group_composition/items/170a3181-9971-45b7-9c19-02d95c9a0562')
    expect(item.hasParent).toEqual(true)
    expect(item.linkToParent).toEqual('https://explorer.sandbox.dea.ga.gov.au/stac/collections/aster_aloh_group_composition')
    expect(item.isRoot).toEqual(false)
    expect(item.hasRoot).toEqual(true)
    expect(item.linkToRoot).toEqual('https://explorer.sandbox.dea.ga.gov.au/stac')
    expect(item.parentIsRoot).toEqual(false)
    expect(item.hasAssets).toEqual(true)
    expect(item.numberOfAssets).toEqual(1)
    expect(item.thumbnailUrl).toEqual(null)
    expect(item.overviewUrl).toEqual(null)
    expect(item.validHttpThumbnailUrl).toEqual(null)
    expect(item.validHttpOverviewUrl).toEqual(null)
    expect(item.parentType).toEqual('Collection')
    expect(item.licenseTypeAndLink).toEqual(null)

})

const landsatCollection = new Collection(landsat8CollectionJson, '')

test('StacEntity - Landsat8 Item', () => {
    const item = new Item(landsat8ItemJson, '', landsatCollection)

    expect(item.stacType).toEqual('Item')
    expect(item.hasAssets).toEqual(true)
    expect(item.overviewUrl).toEqual('https://planetarycomputer.microsoft.com/api/data/v1/item/preview.png?collection=landsat-8-c2-l2&item=LC08_L2SP_202033_20220327_02_T1&assets=SR_B4&assets=SR_B3&assets=SR_B2&color_formula=gamma+RGB+2.7%2C+saturation+1.5%2C+sigmoidal+RGB+15+0.55')
    expect(item.validHttpOverviewUrl).toEqual('https://planetarycomputer.microsoft.com/api/data/v1/item/preview.png?collection=landsat-8-c2-l2&item=LC08_L2SP_202033_20220327_02_T1&assets=SR_B4&assets=SR_B3&assets=SR_B2&color_formula=gamma+RGB+2.7%2C+saturation+1.5%2C+sigmoidal+RGB+15+0.55')
})

test('StacEntity - Landsat8 Collection', () => {

  expect(landsatCollection.titleOrId).toEqual("Landsat 8 Collection 2 Level-2")
  
  // Note some quirky syntax here from the commonmark output, the line seems to need to finish split.
  expect(landsatCollection.descriptionAsHtml).toBe(`<p>The <a href="https://landsat.gsfc.nasa.gov/">Landsat</a> program has been imaging the Earth since 1972; it provides a comprehensive, continuous archive of the Earth's surface.  <a href="https://www.usgs.gov/core-science-systems/nli/landsat/landsat-8">Landsat 8</a> is the most recent satellite in the Landsat series.  Launched in 2013, Landsat 8 captures data in eleven spectral bands: ten optical/IR bands from the <a href="https://landsat.gsfc.nasa.gov/landsat-8/operational-land-imager">Operational Land Imager</a> (OLI) instrument, and two thermal bands from the <a href="https://landsat.gsfc.nasa.gov/landsat-8/thermal-infrared-sensor-tirs">Thermal Infrared Sensor</a> (TIRS) instrument.  This dataset represents the global archive of Level-2 Landsat 8 data from <a href="https://www.usgs.gov/core-science-systems/nli/landsat/landsat-collection-2">Landsat Collection 2</a>.  Images are stored in <a href="https://www.cogeo.org/">cloud-optimized GeoTIFF</a> format.</p>
`)

  expect(landsatCollection.licenseTypeAndLink).toEqual({
    licenseName: 'proprietary',
    link: {
      "rel": "license",
      "href": "https://www.usgs.gov/core-science-systems/hdds/data-policy",
      "title": "Public Domain"
    }
  })
})
