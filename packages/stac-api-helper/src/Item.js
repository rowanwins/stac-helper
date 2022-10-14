import aggregation from 'aggregation/es6'
import {StacEntity} from './internal.js'
import calcBbox from '@turf/bbox'
import {getLinkByRelType} from './utils'

export class Item extends aggregation(StacEntity) {

    get stacType () {
        return 'Item'
    }

    get collectionUrl () {
        if (this.rawJson.links === undefined) return null
        const r = getLinkByRelType(this.rawJson, 'collection')
        if (r === null) return null
        return r.href
    }

    // get collectionId (): string {
    //     return this.rawJson.collection
    // }

    get hasAssets () {
        return 'assets' in this.rawJson
    }

    get datetime () {
        const se = this
        if ('datetime' in se.rawJson.properties && se.rawJson.properties.datetime !== null) return se.rawJson.properties.datetime
        if ('created' in se.rawJson.properties) return se.rawJson.properties.created
        if ('date' in se.rawJson.properties) return se.rawJson.properties.date
        return null
    }

    get datetimeRange () {
        if ('start_datetime' in this.rawJson.properties) {
            return [this.rawJson.properties.start_datetime, this.rawJson.properties.end_datetime]
        }
        return null
    }

    get bbox () {
        if (this.rawJson.bbox) return this.rawJson.bbox
        return calcBbox(this.rawJson)
    }
}
