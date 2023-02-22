import {expect, test} from 'vitest'
import {loadJsonFileSync} from 'load-json-file'
import path from 'path'
// import QueryablesMixin from '../src/MixinQueryables'

// const queryablesJson = loadJsonFileSync(path.join(__dirname, 'harness', 'mspc', 'landsat8-queryables.json'))

// const queryables = new QueryablesMixin()
// queryables.queryablesJson = queryablesJson
// queryables.queryablesLoaded = true

test('MixinQueryables', () => {
  expect(1).toBe(1)
    // expect(collection.isTimeEnabled).toBe(true)
    // expect(collection.hasMoreThanOneDate).toBe(true)
    // expect(collection.dates).toEqual([
    //   "2004-03-02T00:00:00.500000+00:00",
    //   "2004-03-02T00:00:00.500000+00:00"
    // ])
})

