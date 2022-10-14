import {loadLink, loadLinkAndCreateStacThing} from './utils'
import objectAssignDeep from 'object-assign-deep'

export default class ItemCollectionsMixin {

    initializer () {
        this.numberOfItems = null
        this.activeItemsCollectionPage = null
        this._pageSizeLimit = 12
    }

    get itemCollectionEntryLink () {
        if (this.stacType === 'Collection') return this.collectionItemsLink
        if ('searchUrl' in this) return this.entrySearchResultsLink
        return null
    }

    setPageSizeLimit (limit) {
        this._pageSizeLimit = limit
    }

    async checkTotalNumberOfItems () {
        if (this.numberOfItems !== null) return this.numberOfItems
        const limitedSearch = objectAssignDeep.noMutate({}, this.itemCollectionEntryLink)
        if (limitedSearch.method === 'POST') {
            limitedSearch.body.limit = 1
        } else {
            limitedSearch.href = `${limitedSearch.href}?limit=1`
        }

        const json = await loadLink(limitedSearch)
        if (json !== null) {
            this.numberOfItems = null
            if (json.numberMatched) this.numberOfItems = json.numberMatched
            if (json.features.length === 0) this.numberOfItems = 0
            return this.numberOfItems
        }
        return null
    }

    async loadActiveItemCollection (link = null) {
        if (link === null) link = this.itemCollectionEntryLink

        const sizeLimitedLink = objectAssignDeep.noMutate({}, link)

        if (sizeLimitedLink.method === 'POST') {
            sizeLimitedLink.body.limit = this._pageSizeLimit
        } else {
            sizeLimitedLink.href = `${sizeLimitedLink.href}?limit=${this._pageSizeLimit}`
        }

        this.activeItemsCollectionPage = await loadLinkAndCreateStacThing(sizeLimitedLink, this)
    }

}
