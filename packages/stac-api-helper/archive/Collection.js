import Item from './Item.js'
import Search from './Search.js'
import PagesOfItems from './PagesOfItems.js'
import {getWithJsonResponse} from './utils'
import bboxPolygon from '@turf/bbox-polygon'
import {Parser, HtmlRenderer} from 'commonmark'

const reader = new Parser()
const writer = new HtmlRenderer({safe: true, smart: true})

export default class Collection extends PagesOfItems {
    constructor (id, collection, catalog) {
        super()
        this.id = id
        this.details = collection
        this._catalog = catalog
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

    get titleOrId () {
        return this.title ? this.title : this.id
    }

    get title () {
        return this.details.title
    }

    get description () {
        return this.details.description
    }

    get descriptionAsHtml () {
        return writer.render(reader.parse(this.description))
    }

    get collectionUrl () {
        if (this.details.links.findIndex(i => i.rel === 'self') !== -1) {
            return this.details.links.find(i => i.rel === 'self').href
        }
        return this.collectionItemsUrl.replace('/items', '')
    }

    get collectionItemsUrl () {
        const items = this.details.links.find(i => i.rel === 'items')
        if (items) return items.href
        return null
    }

    get catalogUrl () {
        const root = this.details.links.find(i => i.rel === 'root')
        if (root) return root.href
        return null
    }

    get thumbnailUrl () {
        if (this.details.assets === undefined || this.numberOfAssets === 0) return null
        for (const [key, value] of Object.entries(this.details.assets)) {
            if ('roles' in value) {
                if (value.roles.indexOf('thumbnail') > -1) {
                    return this.details.assets[key].href
                }
            }
        }
        return null
    }

    get isTimeEnabled () {
        return this.details.extent.temporal.interval[0] !== null
    }

    get hasMoreThanOneDate () {
        if (!this.isTimeEnabled) return null
        return this.details.extent.temporal.interval[0] !== this.details.extent.temporal.interval[1]
    }

    get dates () {
        if (!this.isTimeEnabled) return null
        return this.details.extent.temporal.interval[0]
    }

    get bbox () {
        return this.details.extent.spatial.bbox[0]
    }

    get bboxAsGeojsonFeature () {
        return bboxPolygon(this.bbox)
    }

    get _firstPageItemsUrl () {
        return `${this.collectionItemsUrl}`
    }

    get licenseTypeAndLink () {
        return {
            licenseName: this.details.license,
            link: this.details.links.find(l => l.rel === 'license')
        }
    }

    async checkNumberOfItems () {
        if (this.numberOfItems !== null) return this.numberOfItems
        if (this.collectionItemsUrl === null) return null
        const json = await getWithJsonResponse(`${this.collectionItemsUrl}?limit=1`)
        if (json !== null) {
            this.numberOfItems = null
            if (json.numberMatched) this.numberOfItems = json.numberMatched
            if (json.features.length === 0) this.numberOfItems = 0
            return this.numberOfItems
        }
        return null
    }

    async getSampleOfCollectionItems (number) {
        number = number ? number : 1
        const response = await fetch(`${this.collectionItemsUrl}?limit=${number}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) return null
        const json = await response.json()
        return json.features.map(f => new Item(f.id, f, this))
    }

    // async paginateThroughAllCollectionItems () {
    //     await paginateThroughResults(`${this.collectionItemsUrl}?limit=20`, this._populateItems.bind(this))
    // }

    createSearch () {
        const search = new Search(this._catalog)
        search.collections([this.id])
        return search
    }

    setCatalog (catalog) {
        this._catalog = catalog
    }
}
