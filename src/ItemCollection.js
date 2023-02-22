import {loadUrlOrLink, getPrevLinkObj, getNextLinkObj} from './utils.js'
import {Item} from './internal.js'

/**
 * Works with a {@link https://github.com/radiantearth/stac-api-spec/blob/main/fragments/itemcollection/README.md|STAC Item Collection},
 * which is returned from searches or when paginating through items of a STAC Collection.
 * @class
 */
export class ItemCollection {

    /**
     * Create a ItemCollection class.
     * @param {json} json - The raw json of the stac item
     * @param {Collection|Search|null} parent - The parent class that created this, either a Collection or a Search.
     * @param {ItemCollection|null} prevItemCollection - The previous Item Collection from the same parent
     * @param {ItemCollection|null} nextItemCollection - The next Item Collection from the same parent
     * @param {json|null} linkThatCreatedThis - The link object that was used to retrieve the json for this item collection.
     */
    constructor (json, parent = null, prevItemCollection = null, nextItemCollection = null, linkThatCreatedThis = null) {

        /**
         * The json of the stac entity
         * @type {json}
         * @public
         */
        this.rawJson = json

        /**
         * The parent stac entity class
         * @type {StacEntity|Search|null}
         * @public
         */
        this.parent = parent

        // Need to make sure we apply the corrent paremt.
        // It could accidentally make the Search class a parent
        const itemParent = parent ? 'stacType' in parent ? parent : parent.parent : null

        /**
         * An array of Item objects created from the STAC Items
         * @type {Item[]}
         * @public
         */
        this.pageItems = this.rawJson.features.map(f => new Item(f, null, itemParent))

        /**
         * A pointer to the previous Item Collection from the same parent
         * @type {ItemCollection|null}
         * @private
         */
        this._prevItemCollection = prevItemCollection

        /**
         * A pointer to the next Item Collection from the same parent
         * @type {ItemCollection|null}
         * @private
         */
        this._nextItemCollection = nextItemCollection

        /**
         * The JSON Link Object that was used to retrieve the data for this ItemCollection.
         * This will often be the `next` or `prev` link from another page.
         * @type {JSON|null}
         */
        this.linkThatCreatedThis = linkThatCreatedThis

        Object.freeze(this.rawJson)
    }

    /**
     * Get's a string of the stac type as 'ItemCollection'
     * @return {string}
     */
    get stacType () {
        return 'ItemCollection'
    }

    /**
    * Returns the "prev" or "previous" rel StacLink if it exists, or null
     * @return {JSON}
    */
    get prevLink () {
        return getPrevLinkObj(this.rawJson)
    }

    /**
     * Returns a boolean indicating if the ItemCollection has a previous page link
     * @return {boolean}
     */
    get hasPrevLink () {
        if (this.prevLink === null) return false
        return true
    }

    /**
     * Returns the "next" rel StacLink if it exists, or null
     * @return {JSON}
     */
    get nextLink () {
        return getNextLinkObj(this.rawJson)
    }

    /**
     * Returns a boolean indicating if the ItemCollection has a next page link
     * @return {boolean}
     */
    get hasNextLink () {
        if (this.nextLink === null) return false
        return true
    }

    /**
     * Loads (if required) and returns the previous page of the ItemCollection from the same parent.
     * @return {Promise<ItemCollection | null>}
     */
    async loadPrevPage () {
        if (!this.hasPrevLink || this.prevLink === null) return null

        if (this._prevItemCollection === null) {
            const json = await loadUrlOrLink(this.prevLink)
            if (json !== null) {
                this._prevItemCollection = new ItemCollection(json, this.parent, null, this, this.prevLink)
            }
        }

        if (this.parent !== null) this.parent.activeItemsCollectionPage = this._prevItemCollection
        return this._prevItemCollection
    }

    /**
     * Loads (if required) and returns the next page of ItemCollection from the same parent
     * @return {Promise<ItemCollection | null>}
     */
    async loadNextPage () {
        if (!this.hasNextLink || this.nextLink === null) return null

        if (this._nextItemCollection === null) {
            const json = await loadUrlOrLink(this.nextLink)
            if (json !== null) {
                this._nextItemCollection = new ItemCollection(json, this.parent, this, null, this.nextLink)
            }
        }

        if (this.parent !== null) this.parent.activeItemsCollectionPage = this._nextItemCollection
        return this._nextItemCollection
    }

}
