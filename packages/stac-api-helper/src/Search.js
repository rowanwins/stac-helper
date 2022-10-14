import aggregation from 'aggregation/es6'
import ItemCollectionsMixin from './MixinItemCollections'
import {EmptyClass} from './EmptyClass'
import {getLinkByRelType} from './utils.js'

export class Search extends aggregation(EmptyClass, ItemCollectionsMixin) {

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
        const searchLink = getLinkByRelType(this._root.rawJson, 'search')
        if (searchLink === null) return null
        return searchLink.href
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

    get entrySearchResultsLink () {
        return {
            method: 'POST',
            href: this.searchUrl,
            body: this._clonedParamsWithNullsRemoved
        }
    }
}
