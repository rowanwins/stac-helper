import bboxPolygon from '@turf/bbox-polygon'

export default class ExtentMixin {

  get isTimeEnabled () {
    return this.rawJson.extent.temporal.interval[0] !== null
}

    get hasMoreThanOneDate () {
        if (!this.isTimeEnabled) return null
        return this.rawJson.extent.temporal.interval[0] !== this.rawJson.extent.temporal.interval[1]
    }

    get dates () {
        if (!this.isTimeEnabled) return null
        return this.rawJson.extent.temporal.interval[0]
    }

    get bbox () {
        return this.rawJson.extent.spatial.bbox[0]
    }

    get bboxAsGeojsonFeature () {
        return bboxPolygon(this.bbox)
    }
}
