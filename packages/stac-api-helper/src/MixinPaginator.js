import {getNextObj, getWithJsonResponse} from './utils'
import {Item} from './internal.js'

export default class PaginatorMixin {
    initializer () {
        this._pageIndex = 0
        this._itemsByPages = this._getDefaultItemsByPage()
        this.numberOfItems = null
        this._nextPageObj = null
        this._pageSize = 12
    }

    get allItems () {
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
        } else if (this._nextPageObj !== null) url = this._nextPageObj.href

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
        const parentForItem = this.stacType ? this : this.parent
        this._itemsByPages[this._pageIndex] = json.features.map(f => new Item(f, null, parentForItem))
        this._nextPageObj = getNextObj(json)
        return this._itemsByPages[this._pageIndex]
    }

    getPageOfItemsByIndex (index) {
        return this._itemsByPages[index]
    }

    getItemById (id) {
        return this.items.find(i => i.id === id)
    }

    async checkTotalNumberOfItems () {
        if (this.numberOfItems !== null) return this.numberOfItems
        if (this._firstPageItemsUrl === null) return null
        const json = await getWithJsonResponse(`${this._firstPageItemsUrl}?limit=1`)
        if (json !== null) {
            this.numberOfItems = null
            if (json.numberMatched) this.numberOfItems = json.numberMatched
            if (json.features.length === 0) this.numberOfItems = 0
            return this.numberOfItems
        }
        return null
    }
}
