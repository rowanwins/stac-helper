export * from './internal.js'
import {getWithJsonResponse, sniffStacType, createStacItemFromDataAndType} from './utils.js'

export async function initialiseFromUrl (url) {
    let jsonData = null
    try {
        jsonData = await getWithJsonResponse(url)
    } catch (e) {
        throw new Error(`Could not retrieve json from ${url}`)
    }
    if (jsonData !== null) {
        const stacType = sniffStacType(jsonData)
        return createStacItemFromDataAndType(jsonData, stacType, url, null)
    }

    return null
}
