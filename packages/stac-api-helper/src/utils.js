import {Catalog, Collection, Item} from './internal.js'

export function getNextObj (page) {
    return page.links.find(l => l.rel === 'next')
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

// export async function paginateThroughResults (nextUrl, callback) {
//     while (nextUrl !== null) {
//         const response = await fetch(nextUrl, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         })
//         if (!response.ok) {
//             callback({
//                 msg: `Error calling ${nextUrl}`,
//                 data: null
//             })
//             nextUrl = null
//         }
//         const nextPageJson = await response.json()
//         callback({
//             msg: 'Progress',
//             data: nextPageJson
//         })
//         const nextNext = getNextObj(nextPageJson)
//         if (nextNext === undefined) {
//             callback({
//                 msg: 'Done',
//                 data: null
//             })
//             nextUrl = null
//         } else {
//             nextUrl = nextNext.href
//         }
//     }
// }

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
            return 'Items'
        }
    }
    if ('collections' in data) {
        return 'CatalogCollections'
    } else if ('license' in data && 'extent' in data) {
        return 'Collection'
    } else {
        return 'Catalog'
    }
}

export function createStacItemFromDataAndType (data, stacType, url, parent) {
    if (stacType === 'Catalog') {
        return new Catalog(data, url, parent)
    } else if (stacType === 'Collection') {
        return new Collection(data, url, parent)
    } else if (stacType === 'Item') {
        return new Item(data, url, parent)
    }
    return null
}
