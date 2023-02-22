import {sniffStacType, getWithJsonResponse, createStacItemFromDataAndType} from './utils.js'
import {createValidFetchUrl} from './urlUtils.js'

/**
 * This provides methods used for child stac items, it is not used directly.
 * @mixin
 */
export default class ChildrenMixin {

    /**
     * Initialiser for mixin
     */
    initializer () {

        /**
         * Whether the children references have been loaded.
         * @type {boolean}
        */
        this.childrenLoaded = false

        /**
         * An array of Item classes, populated once the children are loaded.
         * @type {Array<Item>}
        */
        this.items = []

        /**
         * An array of Catalog classes, populated once the children are loaded.
         * @type {Array<Catalog>}
        */
        this.catalogs = []

        /**
         * An array of Catalog classes, populated once the children are loaded.
         * @type {Array<Collection>}
        */
        this.collections = []

        // /**
        //  * A number of STAC Items available directly as children
        //  * @type {number}
        //  * @public
        // */
        // this.numberOfStaticItems = 0
    }

    /**
     * Returns a boolean indicating that children exist
     * @return {boolean}
     */
    get hasSomeChildren () {
        return this.items.length > 0 || this.catalogs.length > 0 || this.collections.length > 0
    }

    /**
     * Returns the number of child links found in the raw JSON
     * @return {number}
     */
    get numberOfChildren () {
        return this.childrenLinks.length && this.childrenItemLinks.length
    }

    /**
     * Returns an array of links to children of the entity. These could be collections or catalogs.
     * @return {JSON[]}
     */
    get childCatalogOrCollectionLinks () {
        // This should be the most common link type
        let childs = this.rawJson.links.filter(l => l.rel === 'child')

        // The following cases capture other implementations
        // DigitalEarthAustralia has both child and children
        if (this.rawJson.links.findIndex(l => l.rel === 'children') > -1) childs = this.rawJson.links.filter(l => l.rel === 'children')
        if (this.rawJson.links.findIndex(l => l.rel === 'data') > -1) childs = this.rawJson.links.filter(l => l.rel === 'data' && l.type === 'application/json')
        if (childs.length === 0) childs = this.rawJson.links.filter(l => l.rel === 'data' && l.href.indexOf('collections') && l.type === 'application/json')

        return childs
    }

    /**
     * Returns an array of links to Item's
     * @return {JSON[]}
     */
    get childrenItemLinks () {
        return this.rawJson.links.filter(l => l.rel === 'item')
    }

    _loadChild (child) {
        return new Promise((resolve, reject) => {
            try {
                const validUrl = createValidFetchUrl(child, this)
                getWithJsonResponse(validUrl)
                    .then((data) => {
                        if (data !== null) {
                            const stacType = sniffStacType(data)
                            if (stacType === 'Catalog') this.catalogs.push(createStacItemFromDataAndType(data, stacType, validUrl, this))
                            else if (stacType === 'Collection') this.collections.push(createStacItemFromDataAndType(data, stacType, validUrl, this))
                            else if (stacType === 'CatalogCollections') {
                                data.collections.forEach((c2) => {
                                    this.collections.push(createStacItemFromDataAndType(c2, 'Collection', null, this))
                                })
                            } else if (stacType === 'Item') {
                                this.items.push(createStacItemFromDataAndType(data, stacType, validUrl, this))
                                // this.numberOfStaticItems++
                            }
                            resolve()
                        }
                        reject(new Error('Could not retrieve child'))
                    })
                    .catch(() => {
                        reject(new Error('Could not retrieve child'))
                    })

            } catch (e) {
                reject(new Error('Could not retrieve child'))
            }
        })
    }

    async loadChildren () {
        if (this.childrenLoaded) return Promise.resolve()

        return new Promise((resolve) => {

            let part1Done = false
            let part2Done = false

            const promises1 = this.childCatalogOrCollectionLinks.map(child => this._loadChild(child))
            Promise.allSettled(promises1).then(() => {
                part1Done = true
                if (part1Done && part2Done) {
                    this.childrenLoaded = true
                    resolve()
                }
            })

            const promises2 = this.childrenItemLinks.map(child => this._loadChild(child))
            Promise.allSettled(promises2).then(() => {
                part2Done = true
                if (part1Done && part2Done) {
                    this.childrenLoaded = true
                    resolve()
                }
            })
        })
    }

    /**
     * Returns a STAC Entity from the children
     * @param {string} id - The id to search for
     * @return {StacEntity | null}
     */
    getChildById (id) {
        if (this.items.findIndex(i => i.id === id) > -1) return this.items.find(i => i.id === id)
        if (this.catalogs.findIndex(i => i.id === id) > -1) return this.catalogs.find(c => c.id === id)
        if (this.collections.findIndex(i => i.id === id) > -1) return this.collections.find(c => c.id === id)
        return null
    }
}
