function getNextObj (page) {
    return page.links.find(l => l.rel === 'next')
}

export async function getPageResults (pageUrl, callback) {
    const response = await fetch(pageUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (!response.ok) {
        callback({
            msg: `Error calling ${pageUrl}`,
            data: null
        })
        return
    }
    const json = await response.json()
    const nextPageDefinition = getNextObj(json)
    callback({
        msg: 'Data retrieved',
        data: json,
        nextPageUrl: nextPageDefinition !== null ? nextPageDefinition.href : null
    })
}

export async function paginateThroughResults (nextUrl, callback) {
    while (nextUrl !== null) {
        const response = await fetch(nextUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            callback({
                msg: `Error calling ${nextUrl}`,
                data: null
            })
            nextUrl = null
        }
        const nextPageJson = await response.json()
        callback({
            msg: 'Progress',
            data: nextPageJson
        })
        const nextNext = getNextObj(nextPageJson)
        if (nextNext === undefined) {
            callback({
                msg: 'Done',
                data: null
            })
            nextUrl = null
        } else {
            nextUrl = nextNext.href
        }
    }
}
