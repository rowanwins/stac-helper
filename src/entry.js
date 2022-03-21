import Catalog from './Catalog.js'

export default async function initialiseCatalog (url) {
    const catalog = new Catalog(url)
    await catalog._initialise()
    return catalog
}
