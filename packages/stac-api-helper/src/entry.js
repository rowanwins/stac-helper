export * from './internal.js'
import {getWithJsonResponse, sniffStacType, createStacItemFromDataAndType} from './utils'

export async function initialiseFromUrl (url) {
    let childData = null
    try {
        childData = await getWithJsonResponse(url)
    } catch (e) {
        throw new Error(`Could not retrieve json from ${url}`)
    }
    if (childData !== null) {
        const stacType = sniffStacType(childData)
        return createStacItemFromDataAndType(childData, stacType, url, null)
    }

    return null
}
