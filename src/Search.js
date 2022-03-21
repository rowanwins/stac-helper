import Item from './Item.js'
import {paginateThroughResults} from './utils.js'
import queryString from 'query-string'

export default class Search {
    constructor (catalog) {
        this._catalog = catalog

        this._params = {
            bbox: null,
            collections: null,
            limit: 100,
            datetime: null,
            query: null,
            fields: {
                include: [],
                exclude: []
            }
        }

        this.results = []
    }

    get searchUrl () {
        return this._catalog.details.links.find(l => l.rel === 'search').href
    }

    get _usingAdvancedParams () {
        return this._params.fields.include.length > 0 || this._params.query !== null
    }

    bbox (bbox) {
        this._params.bbox = bbox
        return this
    }

    collections (collections) {
        this._params.collections = collections
        return this
    }

    itemLimitPerRequest (limit) {
        this._params.limit = limit
        return this
    }

    between (from, to) {
        if (from === null) from = '..'
        if (to === null) to = '..'
        this._params.datetime = `${from}/${to}`
        return this
    }

    query (query) {
        if (!this._catalog.supportsSearchQueryExtension) {
            console.error('Query Extension not supported by this STAC service')
            return this
        }
        this._params.query = query
        return this
    }

    filter (filter) {
        if (!this._catalog.supportsSearchFilterExtension) {
            console.error('Query Extension not supported by this STAC service')
            return this
        }
        this._params.filter = filter
        return this
    }

    fields (fields) {
        if (!this._catalog.supportsSearchFieldsExtension) {
            console.error('Fields Extension not supported by this STAC service')
            return this
        }
        this._params.fields = fields
        return this
    }

    _clearPreviousResults () {
        this.results = []
    }

    get _clonedParamsWithNullsRemoved () {
        const temp = Object.assign({}, this._params)
        for (const [key, value] of Object.entries(temp)) {
            if (value === null) delete temp[key]
        }
        if (!this._usingAdvancedParams) {
            delete temp.fields
            delete temp.query
        }
        return temp
    }

    async _getFirstPageJsonUsingPost (overrideLimit) {
        if (overrideLimit) this._clonedParamsWithNullsRemoved.limit = 0

        const response = await fetch(this.searchUrl, {
            method: 'POST',
            body: JSON.stringify(this._clonedParamsWithNullsRemoved),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return null
        const json = await response.json()
        return json
    }

    async _getFirstPageJson (overrideLimit) {
        if (overrideLimit) this._clonedParamsWithNullsRemoved.limit = 0
        const qs = queryString.stringify(this._clonedParamsWithNullsRemoved, {
            arrayFormat: 'comma',
            encode: false
        })
        const response = await fetch(`${this.searchUrl}?${qs}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return null
        const json = await response.json()
        return json
    }

    async getFirstPageOfResults () {
        this._clearPreviousResults()
        const json = this._usingAdvancedParams ? await this._getFirstPageJsonUsingPost() : await this._getFirstPageJson()
        this._populateResults({data: json})
    }

    async paginateThroughAllSearchResults () {
        this._clearPreviousResults()
        const json = await this._getFirstPageJson()
        this._populateResults({data: json})
        const next = json.links.find(l => l.rel === 'next')
        if (next !== undefined) await paginateThroughResults(next.href, this._populateResults.bind(this))
    }

    _populateResults (payload) {
        if (payload.data === null) return
        payload.data.features.forEach(f => this.results.push(new Item(f.id, f, this)))
    }

    async checkNumberOfSearchResults () {
        const json = this._usingAdvancedParams ? await this._getFirstPageJsonUsingPost(true) : await this._getFirstPageJson(true)
        return json.numberMatched
    }
}
