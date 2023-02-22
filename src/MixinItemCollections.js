import objectAssignDeep from 'object-assign-deep'

import {loadUrlOrLink, createStacEntityFromUrlOrLink} from './utils.js'

/**
 * This provides properties and methods for working with STAC Collections and Searches
 * that provide ItemCollection responses, it is not used directly.
 * @mixin
 */
export default class ItemCollectionsMixin {

    /**
     * Initialiser for mixin
     */
    initializer () {
        /**
         * The total number of items present in the collection or search results.
         * Requires `checkTotalNumberOfItems` to be called to be called.
         * Note: some STAC API's implementations do not return this information.
         * @return {number|null}
         */
        this.numberOfItems = null

        /**
         * The most recent ItemCollection that has been loaded
         * @return {ItemCollection|null}
         */
        this.activeItemsCollectionPage = null

        /**
         * The total number of items present in the collection or search results.
         * Requires `checkTotalNumberOfItems` to be called to be called.
         * Note: some STAC API's implementations do not return this information.
         * @type {number|null}
         * @private
         */
        this._pageSizeLimit = 12
    }

    get itemCollectionEntryLink () {
        if (this.stacType === 'Collection') return this.collectionItemsLink
        if ('searchUrl' in this) return this.entrySearchResultsLink
        return null
    }

    /**
     * Sets the `limit` parameter for how many items will be included in the response.
     * @param {number} limit - A number indicating how many items to include in the response.
     * @return {this}
     */
    limit (limit) {
        this._pageSizeLimit = limit
        return this
    }

    /**
     * Sends a request to check the total number of items present in the collection or search results
     * by limiting the result count to 1 and using the `numberMatched` field in the response.
     * Note: some STAC API's implementations do not return the `numberMatched` information.
     * TODO: Extend to also use {@link https://github.com/stac-api-extensions/context|Context Extension} where present.
     * @return {Promise<number | null>}
     */
    async checkTotalNumberOfItems () {
        if (this.numberOfItems !== null) return this.numberOfItems
        if (this.itemCollectionEntryLink === null) return null
        const limitedSearch = objectAssignDeep.noMutate({}, this.itemCollectionEntryLink)
        if (limitedSearch.method === 'POST') {
            limitedSearch.body.limit = 1
        } else if (limitedSearch.href.indexOf('limit=') === -1) {
            limitedSearch.href = `${limitedSearch.href}?limit=1`
        }

        const json = await loadUrlOrLink(limitedSearch)
        if (json !== null) {
            this.numberOfItems = null
            if (json.numberMatched) this.numberOfItems = json.numberMatched
            if (json.features.length === 0) this.numberOfItems = 0
            return this.numberOfItems
        }
        return null
    }

    /**
     * Loads a page of results, returning an ItemCollection.
     * @param {json|null} link - A link object to load (eg a next or prev link). If null then users the entry point for the collection items or search.
     * @return {Promise<ItemCollection | null>}
     */
    async loadActiveItemCollection (link = null) {
        let linkWasNull = false
        if (link === null) {
            link = this.itemCollectionEntryLink
            linkWasNull = true
        }

        const sizeLimitedLink = objectAssignDeep.noMutate({}, link)
        if (linkWasNull) {
            if (sizeLimitedLink.method === 'POST') {
                sizeLimitedLink.body.limit = this._pageSizeLimit
            } else if (sizeLimitedLink.href.indexOf('limit=') === -1) {
                sizeLimitedLink.href = `${sizeLimitedLink.href}?limit=${this._pageSizeLimit}`
            }
        }

        this.activeItemsCollectionPage = await createStacEntityFromUrlOrLink(sizeLimitedLink, this)
        return this.activeItemsCollectionPage
    }

}
