import bboxPolygon from '@turf/bbox-polygon'

/**
 * This provides methods used for Extent Objects, found on Collections, it is not used directly.
 * @mixin
 */
export default class ExtentMixin {

    get isTimeEnabled ()  {
        return this.rawJson.extent.temporal.interval[0] !== null
    }

    get hasMoreThanOneDate () {
        if (!this.isTimeEnabled) return false
        return this.rawJson.extent.temporal.interval[0] !== this.rawJson.extent.temporal.interval[1]
    }

    get dates () {
        if (!this.isTimeEnabled) return null
        return this.rawJson.extent.temporal.interval[0]
    }

    /**
     * Gets the first `bbox` property of the ExtentObject.
     * @return {number[]} Array of coordinates
     */
    get bbox () {
        return this.rawJson.extent.spatial.bbox[0]
    }

    /**
     * Gets the bbox as a GeoJSON Polygon object
     * @return {JSON} A GeoJSON Polygon
     */
    get bboxAsGeojsonFeature () {
        return bboxPolygon(this.bbox)
    }
}
