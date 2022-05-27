import {getNextObj, getWithJsonResponse} from './utils'
import Item from './Item'

export default class PagesOfItems {
    constructor () {
        this._pageIndex = 0
        this._itemsByPages = this._getDefaultItemsByPage()
        this.numberOfItems = null
        this._nextPageObj = null
        this._pageSize = 12
    }

    get items () {
        const out = []
        Object.keys(this._itemsByPages).forEach(p => out.push(...this._itemsByPages[p]))
        return out
    }

    _getDefaultItemsByPage () {
        return {
            temp: []
        }
    }

    clearExistingItemPages () {
        this._itemsByPages = this._getDefaultItemsByPage()
        this._pageIndex = 0
    }

    clearTempItems () {
        this._itemsByPages.temp = []
    }

    addTempItem (item) {
        this._itemsByPages.temp.push(item)
    }

    setPageSize (pageSize) {
        this._pageSize = pageSize
        this._nextPageObj = null
        return this
    }

    async _retrieveJson () {
        let url = null
        if (this._nextPageObj === null && this.collectionItemsUrl !== null) {
            url = `${this._firstPageItemsUrl}?limit=${this._pageSize}`
        } else url = this._nextPageObj.href

        if (this._nextPageObj === undefined || !url) return null
        const json = await getWithJsonResponse(url)
        return json
    }

    async getNextPageOfCollectionItems () {
        this._pageIndex = this._pageIndex + 1
        const json = await this._retrieveJson()
        if (json === null) {
            this._nextItemsPageUrl = undefined
            return null
        }
        this._itemsByPages[this._pageIndex] = json.features.map(f => new Item(f.id, f, this))
        this._nextPageObj = getNextObj(json)
        return this._itemsByPages[this._pageIndex]
    }

    getPageOfItemsByIndex (index) {
        return this._itemsByPages[index]
    }

    getItemById (id) {
        return this.items.find(i => i.id === id)
    }
}
