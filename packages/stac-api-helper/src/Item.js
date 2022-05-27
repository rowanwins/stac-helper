import aggregation from 'aggregation/es6'
import {StacThing} from './internal.js'
import calcBbox from '@turf/bbox'

export class Item extends aggregation(StacThing) {
    get stacType () {
        return 'Item'
    }

    get collectionUrl () {
        return this.rawJson.links.find(i => i.rel === 'collection').href
    }

    get collectionId () {
        return this.rawJson.collection
    }

    get hasAssets () {
        return 'assets' in this.rawJson
    }

    get datetime () {
        if ('datetime' in this.rawJson.properties && this.rawJson.properties.datetime !== null) return this.rawJson.properties.datetime
        if ('created' in this.rawJson.properties) return this.rawJson.properties.created
        if ('date' in this.rawJson.properties) return this.rawJson.properties.date
        return null
    }

    get bbox () {
        if (this.rawJson.bbox) return this.rawJson.bbox
        return calcBbox(this.rawJson)
    }
}
