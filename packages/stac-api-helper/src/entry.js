export * from './internal.js'
import {getWithJsonResponse, sniffStacType, createStacItemFromDataAndType} from './utils'

export async function initialiseFromUrl (url) {
    const childData = await getWithJsonResponse(url)
    if (childData !== null) {
        const stacType = sniffStacType(childData)
        return createStacItemFromDataAndType(childData, stacType)
    }
    return null
}
