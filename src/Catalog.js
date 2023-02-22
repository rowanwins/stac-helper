import aggregation from 'aggregation/es6.js'
import {StacEntity, Search} from './internal.js'
import ChildrenMixin from './MixinChildren.js'
import QueryablesMixin from './MixinQueryables.js'

/**
 * A Class for working with a {@link https://github.com/radiantearth/stac-spec/blob/master/catalog-spec/catalog-spec.md|STAC Catalog} object
 * @class
 * @extends StacEntity
 * @augments ChildrenMixin
 * @augments QueryablesMixin
 */
export class Catalog extends aggregation(StacEntity, ChildrenMixin, QueryablesMixin) {

    /**
     * Gets the Stac Type of 'Catalog'
     * @return {string} Catalog
     */
    get stacType () {
        return 'Catalog'
    }

    /**
     * Creates a new Search Class pre-populated to search this collection.
     * @return {Search}
     */
    async createSearch () {
        const se = this
        const root = await se.loadRoot()
        const search = new Search(root, se)
        return search
    }
}
