import Collection from './Collection.js'
import Search from './Search.js'

export default class Catalog {
    constructor (rootUrl) {
        this._rootUrl = rootUrl
        this.details = null

        this.collectionsJson = null
        this.collections = []
    }

    async _initialise () {
        const response = await fetch(`${this._rootUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return
        this.details = await response.json()
    }

    get title () {
        return this.details.title
    }

    get collectionTitles () {
        return this.collections.map(c => c.title)
    }

    get supportsSearchFieldsExtension () {
        return this._checkConformsExtension('item-search#fields')
    }

    get supportsSearchFilterExtension () {
        return this._checkConformsExtension('item-search#filter')
    }

    get supportsSearchQueryExtension () {
        return this._checkConformsExtension('item-search#query')
    }

    get supportsSearchContextExtension () {
        return this._checkConformsExtension('item-search#context')
    }

    get supportsSearchSortExtension () {
        return this._checkConformsExtension('item-search#sort')
    }

    get supportsItemSearch () {
        return this._checkConformsExtension('item-search')
    }

    get _likelyCollectionsUrl () {
        const link = this.details.links.find(l => l.title === 'Collections' || l.title === 'collections' || l.rel === 'children' && l.href.endsWith('/collections'))
        return link.href
    }

    async getCollections () {
        const response = await fetch(`${this._likelyCollectionsUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return
        this.collectionsJson = await response.json()
        this.collectionsJson.collections.forEach(c => this.collections.push(new Collection(c.id, c, this)))
    }

    getCollectionByTitle (title) {
        return this.collections.find(c => c.title === title)
    }

    _checkConformsExtension (partial) {
        return this.details.conformsTo.indexOf(`https://api.stacspec.org/v1.0.0-beta.5/${partial}`) > -1
    }

    createSearch () {
        if (!this.supportsItemSearch) return null
        const search = new Search(this)
        return search
    }

}
