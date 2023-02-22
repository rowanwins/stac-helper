import aggregation from 'aggregation/es6.js'
import calcBbox from '@turf/bbox'
import bboxPolygon from '@turf/bbox-polygon'

import {StacEntity} from './internal.js'
import {getLinkByRelType} from './utils.js'

/**
 * A Class for working with a {@link https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md|STAC Item} object
 * @class
 * @extends StacEntity
 */
export class Item extends aggregation(StacEntity) {

    /**
     * Gets the Stac Type of 'Item'
     * @return {string} Item
     */
    get stacType () {
        return 'Item'
    }

    /**
     * Returns the collection url that the item belongs to, or null.
     * @return {string|null}
     */
    get collectionUrl () {
        if (this.rawJson.links === undefined) return null
        const r = getLinkByRelType(this.rawJson, 'collection')
        if (r === null) return null
        return r.href
    }

    /**
     * Returns a boolean indicating if the Item has assets
     * @return {boolean}
     */
    get hasAssets () {
        if (!('assets' in this.rawJson)) return false
        if (Object.keys(this.rawJson.assets).length === 0) return false
        return true
    }

    /**
     * Gets the mandatory datetime property of the 'Item'. Also provides some fallbacks for bad implementations.
     * @return {string|null} ISO datetime string or null
     */
    get datetime () {
        const se = this
        if ('datetime' in se.rawJson.properties && se.rawJson.properties.datetime !== null) return se.rawJson.properties.datetime

        // Can't remember where I encountered these but probably some old implementation
        if ('created' in se.rawJson.properties) return se.rawJson.properties.created
        if ('date' in se.rawJson.properties) return se.rawJson.properties.date
        return null
    }

    /**
     * Gets the `start_datetime` and `end_datetime` property of the 'Item' if present, otherwise returns null.
     * @return {string[]|null} Array of ISO datetime strings or null
     */
    get datetimeRange () {
        if ('start_datetime' in this.rawJson.properties) {
            return [this.rawJson.properties.start_datetime, this.rawJson.properties.end_datetime]
        }
        return null
    }

    /**
     * Gets the `bbox` property of the Item. If a `bbox` property is not present, even though it should be,
     * the bbox is calculated from the `geometry`.
     * @return {number[]} Array of coordinates
     */
    get bbox () {
        if (this.rawJson.bbox) return this.rawJson.bbox
        return calcBbox(this.rawJson)
    }

    /**
     * Gets the bbox as a GeoJSON Polygon object
     * @return {JSON} A GeoJSON Polygon
     */
    get bboxAsGeojsonFeature () {
        return bboxPolygon(this.bbox)
    }
}
