import Item from './Item.js'
import Search from './Search.js'
import {paginateThroughResults, getPageResults} from './utils.js'

export default class Collection {
    constructor (id, collection, catalog) {
        this.id = id
        this.details = collection
        this._catalog = catalog

        this.items = []

        this._nextItemsPageUrl = null
    }

    get title () {
        return this.details.title
    }

    get description () {
        return this.details.description
    }

    get collectionItemsUrl () {
        return this.details.links.find(i => i.rel === 'items').href
    }

    get isTimeEnabled () {
        return this.details.extent.temporal.interval[0] !== null
    }

    get hasMoreThanOneDate () {
        if (!this.isTimeEnabled) return null
        return this.details.extent.temporal.interval[0] !== this.details.extent.temporal.interval[1]
    }

    get bbox () {
        return this.details.extent.spatial.bbox
    }

    get _firstPageItemsUrl () {
        return `${this.collectionItemsUrl}?limit=20`
    }

    async checkNumberOfCollectionItems () {
        const response = await fetch(`${this.collectionItemsUrl}?limit=0`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return null
        const json = await response.json()
        return json.numberMatched
    }

    async getSampleOfCollectionItems (number) {
        number = number ? number : 1
        const response = await fetch(`${this.collectionItemsUrl}?limit=${number}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return null
        const json = await response.json()
        return json.features.map(f => new Item(f.id, f, this))
    }

    async getNextPageOfCollectionItems (appendToItems) {
        const url = this._nextItemsPageUrl === null ? this._firstPageItemsUrl : this._nextItemsPageUrl
        if (appendToItems) await getPageResults(url, this._populateItems.bind(this))
        else {
            await getPageResults(url, this._returnItems.bind(this))
        }
    }

    async paginateThroughAllCollectionItems () {
        await paginateThroughResults(`${this.collectionItemsUrl}?limit=20`, this._populateItems.bind(this))
    }

    _returnItems (payload) {
        if (payload.data === null) return []
        const out = payload.data.features.map(f => new Item(f.id, f, this))
        return out
    }

    _populateItems (payload) {
        if (payload.data === null) return
        payload.data.features.forEach(f => this.items.push(new Item(f.id, f, this)))
    }

    createSearch () {
        const search = new Search(this._catalog)
        search.collections(this.id)
        return search
    }
}
