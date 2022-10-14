import aggregation from 'aggregation/es6'

import {StacEntity, Search} from './internal.js'
import ChildrenMixin from './MixinChildren.js'
import ExtentMixin from './MixinExtent.js'
import QueryablesMixin from './MixinQueryables.js'
import ItemCollectionsMixin from './MixinItemCollections'
import {getLinkByRelType} from './utils.js'

export class Collection extends aggregation(StacEntity, ChildrenMixin, ItemCollectionsMixin, ExtentMixin, QueryablesMixin) {

    get stacType () {
        return 'Collection'
    }

    get collectionItemsLink () {
        const itemsLink = getLinkByRelType(this.rawJson, 'items')
        if (itemsLink === null) return null
        return itemsLink
    }

    get numberOfProviders () {
        if (this.rawJson.providers) return this.rawJson.providers.length
        return null
    }

    async createSearch () {
        const se = this
        const root = await se.loadRoot()
        const search = new Search(root, se)
        search.collections([se.id])
        return search
    }


}
