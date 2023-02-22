import {expect, test} from 'vitest'
import {loadJsonFileSync} from 'load-json-file'
import path from 'path'
import {Queryable} from '../src/Queryable'
import { mockGet } from 'vi-fetch';

const allQueryablesJson = loadJsonFileSync(path.join(__dirname, 'harness', 'mspc', 'landsat8-queryables.json'))
const eoJson = loadJsonFileSync(path.join(__dirname, 'harness', 'mspc', 'eo-cc-queryable-definition.json'))
const cclQueryable = allQueryablesJson.properties['landsat:cloud_cover_land']
const ccQueryable = allQueryablesJson.properties['eo:cloud_cover']

test('Queryable', () => {
    const queryable = new Queryable('landsat:cloud_cover_land', cclQueryable)

    expect(queryable.id).toEqual('landsat:cloud_cover_land')
    expect(queryable.titleOrId).toEqual('Cloud Cover Land')
    expect(queryable._requiresReferenceJson).toEqual(false)
    expect(queryable.usableDefinition).toEqual({
      "title": "Cloud Cover Land",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    })
    
    expect(queryable.inputType).toEqual('number')
})


test('Queryable with Reference', async () => {
  const queryable = new Queryable('eo:cloud_cover', ccQueryable)
  mockGet('https://stac-extensions.github.io/eo/v1.0.0/schema.json#/definitions/fields/properties/eo:cloud_cover').willResolve(eoJson);

  expect(queryable._rawJson).toEqual({
    "$ref": "https://stac-extensions.github.io/eo/v1.0.0/schema.json#/definitions/fields/properties/eo:cloud_cover"
  })

  expect(queryable.titleOrId).toEqual('eo:cloud_cover')
  expect(queryable.id).toEqual('eo:cloud_cover')
  expect(queryable._requiresReferenceJson).toEqual(true)

  await queryable.getReference()

  expect(queryable._referenceJson).toEqual({
    "title": "Cloud Cover",
    "type": "number",
    "minimum": 0,
    "maximum": 100
  })

  expect(queryable.usableDefinition).toEqual({
    "title": "Cloud Cover",
    "type": "number",
    "minimum": 0,
    "maximum": 100
  })

  expect(queryable.titleOrId).toEqual('Cloud Cover')
  expect(queryable.inputType).toEqual('number')

})
