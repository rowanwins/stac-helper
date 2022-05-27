import URI from 'urijs';

export function isRelativeUrl (href) {
    const uri = new URI(href)
    return uri.is('relative')
}

export function createValidFetchUrl (link, parent) {
    const url = typeof link === 'string' ? link : link.href
    const isRelative = isRelativeUrl(url)
    if (!isRelative) {
        return new URL(url)
    } else {
        const u = new URI(parent.linkToSelf)
        return u.filename(url).toString()
    }
}
