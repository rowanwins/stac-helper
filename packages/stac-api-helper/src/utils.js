import {Catalog, Collection, Item, ItemCollection} from './internal.js'

/**
 * Returns a StacLink, or null based on a rel type
 * @private
 */
export function getLinkByRelType (json, rel) {
    if (!json.links) return null
    const link = json.links.find(l => l.rel === rel)
    if (link) return link
    return null
}

/**
 * Returns the "next" rel StacLink, or null
 * @private
 */
export function getNextLinkObj (json) {
    return getLinkByRelType(json, 'next')
}

/**
 * Returns the "prev" or "previous" rel StacLink, or null
 * @private
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

export async function loadLink (link) {
    let json = null
    if ('method' in link && link.method === 'POST') {
        json = await postWithJsonResponse(link.href, link.body)
    } else {
        json = await getWithJsonResponse(link.href)
    }
    return json
}

export async function loadLinkAndCreateStacThing (link, parent) {
    const data = await loadLink(link)
    if (data === null) return null
    const stacType = sniffStacType(data)
    if (stacType === null) return null
    return createStacItemFromDataAndType(data, stacType, link.href, parent, link)
}
