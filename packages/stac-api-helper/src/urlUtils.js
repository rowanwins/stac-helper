import URI from 'urijs'
import resolveRelative from 'resolve-relative-url'

export function isValidHttpUrl (url) {
    if (url === null) return false
    if (url.indexOf('s3://') > -1) return false
    return true
}

export function isRelativeUrl (href) {
    const uri = new URI(href)
    return uri.is('relative')
}

export function createValidFetchUrl (link, parent) {
    const url = typeof link === 'string' ? link : link.href
    const isRelative = isRelativeUrl(url)
    if (!isRelative) {
        return new URL(url).toString()
    } else {
        const parentUrl = parent.url !== null ? parent.url : parent.linkToSelf
        const out = resolveRelative(url, parentUrl)
        return out
    }
}
