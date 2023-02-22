import aggregation from 'aggregation/es6.js'

import {StacEntity, Search} from './internal.js'
import ChildrenMixin from './MixinChildren.js'
import ExtentMixin from './MixinExtent.js'
import QueryablesMixin from './MixinQueryables.js'
import ItemCollectionsMixin from './MixinItemCollections.js'
import {getLinkByRelType} from './utils.js'

/**
 * A Class for working with a {@link https://github.com/radiantearth/stac-spec/blob/master/collection-spec/collection-spec.md|STAC Collection} object
 * @class
 * @extends StacEntity
 * @augments ChildrenMixin
 * @augments ItemCollectionsMixin
 * @augments QueryablesMixin
 * @augments ExtentMixin
 */
export class Collection extends aggregation(StacEntity, ChildrenMixin, ItemCollectionsMixin, QueryablesMixin, ExtentMixin) {

    /**
     * Gets the Stac Type of 'Collection'
     * @return {string} Collection
     */
    get stacType () {
        return 'Collection'
    }

    /**
     * Gets the Link object to the collections items using the `items` relationship.
     * @return {JSON} Link Object
     */
    get collectionItemsLink () {
        const itemsLink = getLinkByRelType(this.rawJson, 'items')
        if (itemsLink === null) return null
        return itemsLink
    }

    /**
     * Gets the number of providers
     * @return {number} The number of providers. 0 if providers array is not present.
     */
    get numberOfProviders () {
        if (this.rawJson.providers) return this.rawJson.providers.length
        return 0
    }

    /**
     * Creates a new Search Class pre-populated to search this collection.
     * @return {Search}
     */
    async createSearch () {
        const se = this
        const root = await se.loadRoot()
        const search = new Search(root, se)
        search.collections([se.id])
        return search
    }

}
