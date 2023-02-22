import {expect, test} from 'vitest'
import {loadJsonFileSync} from 'load-json-file'
import path from 'path'
import {Catalog} from '../src/internal'

const catalogJson = loadJsonFileSync(path.join(__dirname, 'harness', 'dea', 'catalog.json'))

test('Catalog', () => {
    const catalog = new Catalog(catalogJson, '')

    expect(catalog.stacType).toEqual('Catalog')
})
