import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Draw from 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import bboxPoly from '@turf/bbox-polygon'
// import hashed from 'hashed'

export default class LeafletMap {
  constructor () {
    this.map = null
    this.drawControl = null
    this._editableLayers = null
    this._highlightLayer = null
  }

  /**
   * Creates a maplibre-gl map object
   * @async
   * @param {String} divId The div where the map will be rendered
   * @returns {Promise} Returns a promise which resolves when the maplibre-gl map is loaded
  */
  setupMap (divId) {
    this.map = L.map(divId, {
      center: [0, 0],
      zoom: 0,
      draw: {
        rectangle: true
      }
    })

    this._editableLayers = L.geoJSON({
      type: 'FeatureCollection',
      features: []
    }, {
      style: function () {
        return {
          color: '#49c5c1',
          fillOpacity: 0,
          weight: 2
        }
      }     
    }).addTo(this.map)

    this._highlightLayer = L.geoJSON({
      type: 'FeatureCollection',
      features: []
    }, {
      style: function () {
        return {color: 'yellow'}
      }     
    }).addTo(this.map)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	    subdomains: 'abcd',
	    maxZoom: 20
    }).addTo(this.map)
  }

  fitToBounds (bounds) {
    this.map.fitBounds([[bounds[1], bounds[0]], [bounds[3], bounds[2]]], {
      padding: [20, 20]
    })
  }

  _addGeoJsonLayer (geojson, style) {
    return L.geoJSON(geojson, {
      style
    }).addTo(this.map)
  }
  
  addCollectionBbox (collection) {
    this._addGeoJsonLayer(collection.bboxAsGeojsonFeature, function () {
      return {
        color: '#0f3542',
        fillOpacity: 0,
        weight: 2
      }
    })
  }
  
  addCollectionItems (items) {
    this._collectionItemLyr = this._addGeoJsonLayer({
      type: 'FeatureCollection',
      features: items.map(i => i.rawJson)
    }, function () {
      return {
        color: '#49c5c1',
        fillOpacity: 0.5,
        weight: 2
      }
    })
  }

  updateCollectionItems (items) {
    if (this._collectionItemLyr) {
      this._collectionItemLyr.clearLayers()
      this._collectionItemLyr.addData({
        type: 'FeatureCollection',
        features: items.map(i => i.rawJson)
      })
    } else {
      this.addCollectionItems(items)
    }
  }

  clearHighlightLayer () {
    this._highlightLayer.clearLayers()
  }

  highlightCollectionItem (item) {
    this._highlightLayer.clearLayers()
    this._highlightLayer.addData({
      type: 'FeatureCollection',
      features: [item]
    })
  }

  addCollectionItemOutline (item) {
    this._addGeoJsonLayer(item, function () {
      return {
        color: '#49c5c1',
        fillOpacity: 0,
        weight: 2
      }
    })
  }

  async addCollectionItemThumbnailAsset (item, errorCallback) {
    if (item.validHttpThumbnailUrl) {
      const lyr = L.imageOverlay(item.validHttpThumbnailUrl, [
        [item.bbox[3], item.bbox[2]],
        [item.bbox[1], item.bbox[0]]
      ]).addTo(this.map)
      if (errorCallback) lyr.on('error', errorCallback)
    }
  }

  async addCollectionItemOverviewAsset (item, errorCallback) {
    if (item.validHttpOverviewUrl) {
      const lyr = L.imageOverlay(item.validHttpOverviewUrl, [
        [item.bbox[3], item.bbox[2]],
        [item.bbox[1], item.bbox[0]]
      ]).addTo(this.map)
      if (errorCallback) lyr.on('error', errorCallback)
    }
  }

  clearDrawnLayers () {
    this._editableLayers.clearLayers()
  }

  startRectangeDraw () {
    this._temp = new L.Draw.Rectangle(this.map, {
      showArea: false,
      shapeOptions: {
        color: '#49c5c1',
        weight: 2
      }
    })
    this._temp.enable()
  }

  awaitDrawnRectangle () {
    return new Promise((resolve) => {
      this.map.on(L.Draw.Event.CREATED, (e) => {
        this._temp.disable()
        this._editableLayers.addLayer(e.layer)
        resolve(e.layer.toGeoJSON())
      })
    }) 
  }

  addFilterBoundingBoxLayerFromBounds (bounds) {
    const poly = bboxPoly(bounds)
    this._editableLayers.addData(poly)
  }
}