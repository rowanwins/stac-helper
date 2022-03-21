
export default class Item {
    constructor (id, itemJson, collection) {
        this.id = id
        this.itemJson = itemJson
        this._collection = collection
        this._catalog = collection._catalog
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

    get assetTitles () {
        return Object.keys(this.itemJson.assets)
    }

    get numberOfAssets () {
        return Object.keys(this.itemJson.assets).length
    }
}
