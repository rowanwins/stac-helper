import {Catalog, Collection, Item, ItemCollection} from './internal.js'

/**
 * Finds the first STAC Link object based on the rel type, if none are found then returns null
 * @param {json} json - A stac document
 * @param {string} rel - A relationship type
 * @return {json | null} The STAC Link json or null
 */
export function getLinkByRelType (json, rel) {
    if (!json.links) return null
    const link = json.links.find(l => l.rel === rel)
    if (link) return link
    return null
}

/**
 * Returns the "next" rel type STAC Link object, or null if not present
 * @param {json} json - A stac document
 * @return {json | null} The STAC Link json or null
 */
export function getNextLinkObj (json) {
    return getLinkByRelType(json, 'next')
}

/**
 * Returns the "prev" or "previous" rel type STAC Link object, or null if not present. The spec nominates 'prev' as the correct rel type, however some implementations use 'previous'.
 * @param {json} json - A stac document
 * @return {json | null} The STAC Link json or null
 */
export function getPrevLinkObj (json) {
    const previous = getLinkByRelType(json, 'previous')
    if (previous !== null) return previous
    const prev = getLinkByRelType(json, 'prev')
    if (prev !== null) return prev
    return null
}

export async function getWithJsonResponse (pageUrl) {
    const response = await fetch(pageUrl, {
        method: 'GET'
    })
    if (!response.ok) {
        return null
    }
    const json = await response.json()
    return json
}

export async function postWithJsonResponse (pageUrl, body) {
    const response = await fetch(pageUrl, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (!response.ok) {
        return null
    }
    const json = await response.json()
    return json
}

export function getValueFromObjectUsingPath (object, path) {
    if (object === null || typeof object !== 'object') {
        return null
    }
    object = object[path[0]]
    if (typeof object !== 'undefined' && path.length > 1) {
        return getValueFromObjectUsingPath(object, path.slice(1))
    }
    return object
}

/**
 * Returns the Stac type of a STAC document
 * @param {json} data - A STAC document
 * @return {string | null} One of 'Catalog', 'Collection', 'Item', 'ItemCollection', 'CatalogCollections', or null if the document type can't be detected.
 */
export function sniffStacType (data) {
    if (typeof data.type === 'string') {
        const dataType = data.type.toUpperCase();
        if (dataType === 'CATALOG') {
            return 'Catalog'
        } else if (dataType === 'COLLECTION') {
            return 'Collection'
        } else if (dataType === 'FEATURE') {
            return 'Item'
        } else if (dataType === 'FEATURECOLLECTION') {
            return 'ItemCollection'
        }
    }
    if ('collections' in data) {
        return 'CatalogCollections'
    } else if ('license' in data && 'extent' in data) {
        return 'Collection'
    }

    return null
}

/**
 * Returns the STAC type of a STAC document. One of 'Catalog', 'Collection', 'Item', 'ItemCollection', 'CatalogCollections', or null if the document type can't be detected.
 * @param {json} data - A STAC document
 * @return {string | null}
 */
export function detectStacType (data) {
    return sniffStacType(data)
}


export function createStacItemFromDataAndType (data, stacType, url, parent, linkThatCreatedThis) {
    if (stacType === 'Catalog') {
        return new Catalog(data, url, parent, linkThatCreatedThis)
    } else if (stacType === 'Collection') {
        return new Collection(data, url, parent, linkThatCreatedThis)
    } else if (stacType === 'Item') {
        return new Item(data, url, parent, linkThatCreatedThis)
    } else if (stacType === 'ItemCollection') {
        return new ItemCollection(data, parent, null, null, linkThatCreatedThis)
    }
    return null
}

/**
 * Loads a url or STAC link object using a fetch request, and returns the raw JSON.
 * @param {string | json} urlOrLink A url string, or a STAC link object
 * @return {Promise<json | null>} Returns the raw JSON document, or null if the urlOrLink can't be loaded.
 */
export async function loadUrlOrLink (urlOrLink) {
    let json = null
    if (typeof urlOrLink === 'string') {
        json = await getWithJsonResponse(urlOrLink)
    } else if ('method' in urlOrLink && urlOrLink.method === 'POST') {
        json = await postWithJsonResponse(urlOrLink.href, urlOrLink.body)
    } else {
        json = await getWithJsonResponse(urlOrLink.href)
    }
    return json
}

/**
 * Returns a StacEntity class from either a URL or a STAC link object
 * @param {string | json} urlOrLink A url string, or a STAC link object
 * @param {StacEntity | null} [parent] An optional parent Stac Entity that will be attached to the result
 * @return {Promise<StacEntity | null>} A StacEntity class, or null if the urlOrLink can't be loaded or detected.
 */
export async function createStacEntityFromUrlOrLink (urlOrLink, parent) {
    const data = await loadUrlOrLink(urlOrLink)
    if (data === null) return null
    const stacType = sniffStacType(data)
    if (stacType === null) return null
    const plainUrl = typeof urlOrLink === 'string' ? urlOrLink : urlOrLink.href
    return createStacItemFromDataAndType(data, stacType, plainUrl, parent, urlOrLink)
}
