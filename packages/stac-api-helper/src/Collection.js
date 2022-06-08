import aggregation from 'aggregation/es6'

import {StacThing, Search} from './internal.js'
import ChildrenMixin from './MixinChildren.js'
import ExtentMixin from './MixinExtent.js'
import PaginatorMixin from './MixinPaginator.js'

export class Collection extends aggregation(StacThing, ChildrenMixin, ExtentMixin, PaginatorMixin) {
    get stacType () {
        return 'Collection'
    }

    get collectionItemsUrl () {
        const items = this.rawJson.links.find(i => i.rel === 'items')
        if (items) return items.href
        return null
    }

    get _firstPageItemsUrl () {
        if (this.collectionItemsUrl === null) return null
        return `${this.collectionItemsUrl}`
    }

    get numberOfProviders () {
        if ('providers' in this.rawJson) return this.rawJson.providers.length
        return null
    }

    async createSearch () {
        const root = await this.loadRoot()
        const search = new Search(root, this)
        search.collections([this.id])
        return search
    }
}
