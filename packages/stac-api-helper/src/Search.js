import aggregation from 'aggregation/es6'
import PaginatorMixin from './MixinPaginator.js'
import {EmptyClass} from './internal.js'
import {postWithJsonResponse} from './utils'

export class Search extends aggregation(EmptyClass, PaginatorMixin) {
    constructor (root, parent = null) {
        super()
        this._root = root
        this.parent = parent

        this._params = {
            bbox: null,
            collections: null,
            datetime: null,
            query: null,
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

    async _retrieveJson () {
        let body = null
        if (this._nextPageObj === null) body = this._clonedParamsWithNullsRemoved
        else body = this._nextPageObj.body

        const json = await postWithJsonResponse(this.searchUrl, body)
        return json
    }
}
