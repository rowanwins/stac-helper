import aggregation from 'aggregation/es6'
import PaginatorMixin from './MixinPaginator.js'
import {EmptyClass} from './internal.js'
import {postWithJsonResponse, getWithJsonResponse} from './utils'

export class Search extends aggregation(EmptyClass, PaginatorMixin) {
    constructor (root, parent = null) {
        super()
        this._root = root
        this.parent = parent

        this._params = {
            bbox: null,
            collections: null,
            datetime: null,
            filter: null,
            fields: {
                include: [],
                exclude: []
            }
        }
    }

    get searchUrl () {
        return this._root.rawJson.links.find(l => l.rel === 'search').href
    }

    get _usingAdvancedParams () {
        return this._params.fields.include.length > 0 || this._params.filter !== null
    }

    bbox (bbox) {
        this._params.bbox = bbox
        return this
    }

    collections (collections) {
        this._params.collections = collections
        return this
    }

    between (from, to) {
        if (from === null) from = '..'
        if (to === null) to = '..'
        this._params.datetime = `${from}/${to}`
        return this
    }

    filter (filter) {
        // if (!this._root.supportsSearchFilterExtension) {
        //     console.error('Filter Extension not supported by this STAC service')
        //     return this
        // }
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
            if (key === 'filter') continue
            if (value === null) delete temp[key]
        }
        delete temp.filter
        if (this._params.filter !== null && Object.keys(this._params.filter).length > 0) {
            Object.assign(temp, this._params.filter)
        }
        delete temp.fields

        temp.limit = this._pageSize
        return temp
    }

    async checkNumberOfItems () {
        if (this.numberOfItems !== null) return this.numberOfItems

        const body = this._clonedParamsWithNullsRemoved
        body.limit = 1
        const json = await postWithJsonResponse(this.searchUrl, body)
        let number = null
        if (json.numberMatched) number = json.numberMatched
        if (json.context && json.context.matched) {
            number = json.context.matched
        }
        this.numberOfItems = number
        return number
    }

    async _getNextPage () {
        let json = null

        if (this._nextPageObj === null) {
            json = await postWithJsonResponse(this.searchUrl, this._clonedParamsWithNullsRemoved)
        } else if (this._nextPageObj !== null && 'method' in this._nextPageObj && this._nextPageObj.method === 'POST') {
            json = await postWithJsonResponse(this._nextPageObj.href, this._nextPageObj.body)
        } else if (this._nextPageObj !== null) {
            json = await getWithJsonResponse(this._nextPageObj.href)
        }

        return json
    }
}
