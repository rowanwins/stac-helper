import {loadLink, getPrevLinkObj, getNextLinkObj} from './utils'
import {Item} from './internal.js'

export class ItemCollection {

    constructor (rawJson, parent = null, prevItemCollection = null, nextItemCollection = null) {
        this.rawJson = rawJson
        this.parent = parent
        this._pageItems = null
        this._prevItemCollection = prevItemCollection
        this._nextItemCollection = nextItemCollection

        Object.freeze(this.rawJson)
    }

    get stacType () {
        return 'ItemCollection'
    }

    /**
    * Returns the "next" rel StacLink, or null
    */
    get prevLink () {
        return getPrevLinkObj(this.rawJson)
    }

    /**
     * Returns a boolean indicating if the ItemCollection has a previous page link
     */
    get hasPrevLink () {
        if (this.prevLink === null) return false
        return true
    }

    /**
     * Returns the "next" rel StacLink, or null
     */
    get nextLink () {
        return getNextLinkObj(this.rawJson)
    }

    /**
     * Returns a boolean indicating if the ItemCollection has a next page link
     */
    get hasNextLink () {
        if (this.nextLink === null) return false
        return true
    }

    get pageItems () {
        if (this._pageItems !== null) return this._pageItems
        this._pageItems = this.rawJson.features.map(f => new Item(f, null, this.parent))
        return this._pageItems
    }

    async loadPrevPage () {
        if (!this.hasPrevLink || this.prevLink === null) return null

        if (this._prevItemCollection === null) {
            const json = await loadLink(this.prevLink)
            if (json !== null) {
                this._prevItemCollection = new ItemCollection(json, this.parent, null, this)
            }
        }

        if (this.parent !== null) this.parent.activeItemsCollectionPage = this._prevItemCollection
        return this._prevItemCollection
    }

    async loadNextPage () {
        if (!this.hasNextLink || this.nextLink === null) return null

        if (this._nextItemCollection === null) {
            const json = await loadLink(this.nextLink)
            if (json !== null) {
                this._nextItemCollection = new ItemCollection(json, this.parent, this, null)
            }
        }

        if (this.parent !== null) this.parent.activeItemsCollectionPage = this._nextItemCollection
        return this._nextItemCollection
    }

}
