import Collection from './Collection.js'
import Search from './Search.js'
import Item from './Item.js'
import {sniffStacType, getWithJsonResponse} from './utils.js'
import {createValidFetchUrl} from './urlUtils'
import {Parser, HtmlRenderer} from 'commonmark'

const reader = new Parser()
const writer = new HtmlRenderer({safe: true, smart: true})

export default class Catalog {
    constructor (rootUrl, details, parent) {
        this._rootUrl = rootUrl
        this.details = details ? details : null
        this.parent = parent ? parent : null

        this.collectionsJson = null
        this.collections = []
        this.catalogs = []
        this.items = []
    }

    async _initialise () {
        const response = await fetch(`${this._rootUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return
        this.details = await response.json()
    }

    get catalogUrl () {
        return this._rootUrl
    }

    get title () {
        return this.details.title
    }

    get description () {
        return this.details.description
    }

    get collectionTitles () {
        return this.collections.map(c => c.title)
    }

    get supportsSearchFieldsExtension () {
        return this._checkConformsExtension('item-search#fields')
    }

    get supportsSearchFilterExtension () {
        return this._checkConformsExtension('item-search#filter')
    }

    get supportsSearchQueryExtension () {
        return this._checkConformsExtension('item-search#query')
    }

    get supportsSearchContextExtension () {
        return this._checkConformsExtension('item-search#context')
    }

    get supportsSearchSortExtension () {
        return this._checkConformsExtension('item-search#sort')
    }

    get supportsItemSearch () {
        return this._checkConformsExtension('item-search')
    }

    get hasCollectionsUrl () {
        return this._likelyCollectionsUrl !== null
    }

    get hasParent () {
        return this.parent !== null
    }

    get rootUrl () {
        const r = this.details.links.find(l => l.rel === 'root')
        if (r) return r.href
        return null
    }

    get _selfUrl () {
        const r = this.details.links.find(l => l.rel === 'self')
        if (r) return r.href
        return null
    }

    get _likelyCollectionsUrl () {
        const link = this.details.links.find(l => {
            return l.rel === 'data' || 
            l.title === 'Collections' || 
            l.title === 'collections' || 
            l.rel === 'children' && l.href.endsWith('/collections')
        })
        if (link === undefined) return null
        return link.href
    }

    get childrenLinks () {
        let childs = this.details.links.filter(l => l.rel === 'child')
        if (childs.length === 0) childs = this.details.links.filter(l => l.rel === 'children')
        if (childs.length === 0) childs = this.details.links.filter(l => l.rel === 'data' && l.href.indexOf('collections'))
        return childs
    }

    get childrenItemLinks () {
        return this.details.links.filter(l => l.rel === 'item')
    }

    get descriptionAsHtml () {
        return writer.render(reader.parse(this.description))
    }

    async getCollections () {
        if (!this.hasCollectionsUrl) return
        const response = await fetch(`${this._likelyCollectionsUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return
        this.collectionsJson = await response.json()
        this.collectionsJson.collections.forEach(c => this.collections.push(new Collection(c.id, c, this)))
    }

    async getChildren () {
        if (!this.childrenLinks.length === 0) return
        for (let index = 0; index < this.childrenLinks.length; index++) {
            const child = this.childrenLinks[index];
            const validUrl = createValidFetchUrl(child, this)
            const childData = await getWithJsonResponse(validUrl)
            if (childData !== null) {
                const stacType = sniffStacType(childData)

                if (stacType === 'Catalog') {
                    this.catalogs.push(new Catalog(child.href, childData, this))
                } else if (stacType === 'Collection') {
                    this.collections.push(new Collection(childData.id, childData, this))
                } else if (stacType === 'CatalogCollections') {
                    childData.collections.forEach((c2) => {
                        this.collections.push(new Collection(c2.id, c2, this))
                    })
                } else if (stacType === 'Item') {
                    this.items.push(new Item(childData.id, childData, this))
                }
            }
        }

        for (let index = 0; index < this.childrenItemLinks.length; index++) {
            const child = this.childrenItemLinks[index];
            const validUrl = createValidFetchUrl(child, this)
            const childData = await getWithJsonResponse(validUrl)
            if (childData !== null) {
                this.items.push(new Item(childData.id, childData, this))
            }
        }
    }

    getCollectionById (id) {
        return this.collections.find(c => c.id === id)
    }

    getCollectionByTitle (title) {
        return this.collections.find(c => c.title === title)
    }

    _checkConformsExtension (partial) {
        return this.details.conformsTo.indexOf(`https://api.stacspec.org/v1.0.0-beta.5/${partial}`) > -1
    }

    createSearch () {
        if (!this.supportsItemSearch) return null
        const search = new Search(this)
        return search
    }

}
