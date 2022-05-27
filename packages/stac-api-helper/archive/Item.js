import bbox from '@turf/bbox'

export class Item {
    constructor (id, itemJson, parent) {
        this.id = id
        this.itemJson = itemJson
        this._parent = parent
        // this._catalog = collection ? collection._catalog : null
    }

    get title () {
        return this.itemJson.properties.title
    }

    get datetime () {
        if ('datetime' in this.itemJson.properties) return this.itemJson.properties.datetime
        return null
    }

    get itemUrl () {
        return this.itemJson.links.find(i => i.rel === 'self').href
    }

    get collectionUrl () {
        return this.itemJson.links.find(i => i.rel === 'collection').href
    }

    get collectionId () {
        return this.itemJson.collection
    }

    get hasAssets () {
        return 'assets' in this.itemJson
    }

    get assetTitles () {
        if (!this.hasAssets) return null
        return Object.keys(this.itemJson.assets)
    }

    get numberOfAssets () {
        if (!this.hasAssets) return 0
        return Object.keys(this.itemJson.assets).length
    }

    get bbox () {
        return bbox(this.itemJson)
    }

    get thumbnailUrl () {
        if (this.numberOfAssets === 0) return null
        for (const [key, value] of Object.entries(this.itemJson.assets)) {
            if ('roles' in value) {
                if (value.roles.indexOf('thumbnail') > -1) {
                    return this.itemJson.assets[key].href
                }
            }
        }
        return null
    }

    get overviewUrl () {
        if (this.numberOfAssets === 0) return null
        for (const [key, value] of Object.entries(this.itemJson.assets)) {
            if ('roles' in value) {
                if (value.roles.indexOf('overview') > -1) {
                    return this.itemJson.assets[key].href
                }
            }
        }
        return null
    }
}
