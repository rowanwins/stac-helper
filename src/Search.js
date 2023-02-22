import aggregation from 'aggregation/es6.js'

import ItemCollectionsMixin from './MixinItemCollections.js'
import {EmptyClass} from './EmptyClass.js'
import {getLinkByRelType} from './utils.js'

/**
 * An Class for retriving a {@link https://github.com/radiantearth/stac-api-spec/blob/main/fragments/itemcollection/README.md|STAC Item Collection},
 * either from global searches across a STAC Catalog, or within a particular STAC Collection
 * @class
 * @augments ItemCollectionsMixin
 */
export class Search extends aggregation(EmptyClass, ItemCollectionsMixin) {

    /**
     * @param {Catalog} root - The root Catalog class
     * @param {StacEntity} [parent = null] - The class that created this search. Could be a root Catalog, or Collection for a limited search.
     */
    constructor (root, parent = null) {
        super()

        /**
         * The root STAC Catalog
         * @type {Catalog}
         * @private
         */
        this._root = root

        /**
         * The parent class that created this search class
         * @type {StacEntity}
         * @public
         */
        this.parent = parent

        this._params = {
            bbox: null,
            ids: null,
            collections: null,
            datetime: null,
            filter: null,
            limit: null,
            fields: {
                include: [],
                exclude: []
            }
        }
    }

    /**
     * Gets the base search url
     * @return {string | null} A url string
     */
    get searchUrl () {
        const searchLink = getLinkByRelType(this._root.rawJson, 'search')
        if (searchLink === null) return null
        return searchLink.href
    }

    /**
     * Gets a boolean indicating that the server supports GET search requests
     * GET support is mandatory according to the STAC spec.
     * @return {boolean} true
     */
    get supportsGetRequests () {
        return true
    }

    /**
     * Gets a boolean indicating that the server supports POST search requests.
     * POST support is optional according to the STAC spec.
     * @return {boolean}
     */
    get supportsPostRequests () {
        return this._root.rawJson.links.find(l => l.rel === 'search' && l.method === 'POST') !== undefined
    }

    get _usingAdvancedParams () {
        return this._params.fields.include.length > 0 || this._params.filter !== null
    }

    /**
     * Sets the `id` search parameter to search for particular STAC Items
     * @param {Array<string>} ids - An array of strings
     * @return {this}
     */
    ids (ids) {
        if (typeof ids === 'string') {
            console.error('The ids parameter must be an array')
            return this
        }
        this._params.ids = ids
        return this
    }

    /**
     * Sets the `bbox` search parameter
     * @param {Array<number>} bbox - An array of numbers
     * @return {this}
     */
    bbox (bbox) {
        this._params.bbox = bbox
        return this
    }

    /**
     * Sets the `collections` search parameter, accepts either a single string or an array of strings.
     * @param {string | Array<string>} collections - An string or array of strings
     * @return {this}
     */
    collections (collections) {
        if (typeof collections === 'string') {
            this._params.collections = [collections]
            return this
        }
        this._params.collections = collections
        return this
    }

    /**
     * Sets the `datetime` search parameter for a single date
     * @param {string} datetime - An ISO datestring
     * @return {this}
     */
    datetime (datetime) {
        this._params.datetime = datetime
        return this
    }

    /**
     * Sets the `datetime` search parameter to a daterange. If either from or to are set to null then relevant portion of the query is set to '..' indicating no to or from date and to search an open range.
     * @param {string | null} from - An ISO datestring. If null is set to '..' indicating no from date.
     * @param {string | null} to - An ISO datestring. If null is set to '..' indicating no to date.
     * @return {this}
     */
    between (from, to) {
        if (from === null) from = '..'
        if (to === null) to = '..'
        this._params.datetime = `${from}/${to}`
        return this
    }

    filter (filter) {
        if (!this._root.supportsSearchFilterExtension) {
            console.error('Filter Extension not supported by this STAC service')
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

    get _paramsAsString () {
        const searchParams = new URLSearchParams()
        for (const [key, value] of Object.entries(this._params)) {
            if (key === 'filter' || key === 'fields') continue
            if (value !== null) {
                searchParams.append(key, value)
            }
        }
        if (this._pageSizeLimit) searchParams.append('limit', this._pageSizeLimit)
        return searchParams.toString()
    }

    get entrySearchResultsLink () {
        if (!this.supportsPostRequests) {
            const fullUrl = `${this.searchUrl}?${this._paramsAsString}`
            return {
                method: 'GET',
                href: fullUrl
            }
        }

        return {
            method: 'POST',
            href: this.searchUrl,
            body: this._clonedParamsWithNullsRemoved
        }
    }
}
