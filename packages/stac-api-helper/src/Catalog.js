import aggregation from 'aggregation/es6'
import {StacEntity} from './internal.js'
import ChildrenMixin from './MixinChildren.js'

/**
 * A Class for working with a {@link https://github.com/radiantearth/stac-spec/blob/master/catalog-spec/catalog-spec.md|STAC Catalog object}
 * @class
 * @extends StacEntity
 * @augments ChildrenMixin
 */
export class Catalog extends aggregation(StacEntity, ChildrenMixin) {

    /**
     * Gets the Stac Type of 'Catalog'
     * @return {string} Catalog
     */
    get stacType () {
        return 'Catalog'
    }
}
