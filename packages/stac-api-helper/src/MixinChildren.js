import {sniffStacType, getWithJsonResponse, createStacItemFromDataAndType} from './utils.js'
import {createValidFetchUrl} from './urlUtils.js'

export default class ChildrenMixin {
    initializer () {
        this.childrenLoaded = false
        this.items = []
        this.catalogs = []
        this.collections = []
        this.numberOfStaticItems = 0
    }

    get hasSomeChildren () {
        return this.items.length > 0 || this.catalogs.length > 0 || this.collections.length > 0
    }

    get childrenLinks () {
        let childs = this.rawJson.links.filter(l => l.rel === 'child')
        if (this.rawJson.links.findIndex(l => l.rel === 'children') > -1) childs = this.rawJson.links.filter(l => l.rel === 'children')
        if (this.rawJson.links.findIndex(l => l.rel === 'data') > -1) childs = this.rawJson.links.filter(l => l.rel === 'data' && l.type === 'application/json')
        if (childs.length === 0) childs = this.rawJson.links.filter(l => l.rel === 'data' && l.href.indexOf('collections') && l.type === 'application/json')
        return childs
    }

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
                                this.numberOfStaticItems++
                            }
                            resolve()
                        }
                        reject()
                    })
                    .catch(() => {
                        reject()
                    })

            } catch (e) {
                reject()
            }
        })
    }

    async loadChildren () {
        if (this.childrenLoaded) return Promise.resolve()
        return new Promise((resolve) => {
            if (!this.childrenLinks.length === 0) resolve()
            let part1Done = false
            let part2Done = false

            const promises1 = this.childrenLinks.map(child => this._loadChild(child))
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

    getChildById (id) {
        if (this.items.findIndex(i => i.id === id) > -1) return this.items.find(i => i.id === id)
        if (this.catalogs.findIndex(i => i.id === id) > -1) return this.catalogs.find(c => c.id === id)
        if (this.collections.findIndex(i => i.id === id) > -1) return this.collections.find(c => c.id === id)
        return null
    }
}
