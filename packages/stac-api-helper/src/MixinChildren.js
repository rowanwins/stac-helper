import {sniffStacType, getWithJsonResponse, createStacItemFromDataAndType} from './utils.js'
import {createValidFetchUrl} from './urlUtils.js'

export default class ChildrenMixin {
    initializer () {
        this.items = []
        this.catalogs = []
        this.collections = []
        this.numberOfStaticItems = 0
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

    async loadChildren () {
        return new Promise((resolve) => {
            if (!this.childrenLinks.length === 0) resolve()
            let part1Done = false
            let part2Done = false

            const promises1 = this.childrenLinks.map((child) => {
                const validUrl = createValidFetchUrl(child, this)
                return getWithJsonResponse(validUrl)
            })

            Promise.all(promises1).then((values) => {
                values.forEach((childData) => {
                    if (childData !== null) {
                        const stacType = sniffStacType(childData)
                        if (stacType === 'Catalog') this.catalogs.push(createStacItemFromDataAndType(childData, stacType, this))
                        else if (stacType === 'Collection') this.collections.push(createStacItemFromDataAndType(childData, stacType, this))
                        else if (stacType === 'CatalogCollections') {
                            childData.collections.forEach((c2) => {
                                this.collections.push(createStacItemFromDataAndType(c2, 'Collection', this))
                            })
                        } else if (stacType === 'Item') {
                            this.items.push(createStacItemFromDataAndType(childData, stacType, this))
                            this.numberOfStaticItems++
                        }
                    }
                })
                part1Done = true
                if (part1Done && part2Done) resolve()
            });

            const promises2 = this.childrenItemLinks.map((child) => {
                const validUrl = createValidFetchUrl(child, this)
                return getWithJsonResponse(validUrl)
            })

            Promise.all(promises2).then((values) => {
                values.forEach((childData) => {
                    if (childData !== null) this.items.push(createStacItemFromDataAndType(childData, 'Item', this))
                })
                part2Done = true
                if (part1Done && part2Done) resolve()
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
