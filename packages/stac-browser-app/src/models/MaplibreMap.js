import maplibre from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// import Draw from 'leaflet-draw'
// import 'leaflet-draw/dist/leaflet.draw.css'
import bboxPoly from '@turf/bbox-polygon'
import assignDeep from 'assign-deep'

export default class MaplibreMap {
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
    return new Promise((resolve) => {
      
      this.map = new maplibre.Map({
        container: divId,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [0, 0],
        zoom: 0,
        minZoom: -2
      })




    // this._editableLayers = L.geoJSON({
    //   type: 'FeatureCollection',
    //   features: []
    // }, {
    //   style: function () {
    //     return {
    //       color: '#49c5c1',
    //       fillOpacity: 0,
    //       weight: 2
    //     }
    //   }     
    // }).addTo(this.map)

    this.map.on('load', async () => {
      this._editableLayersSrc = this._createEmptyGeojsonSource('editable-src')
      this._collectionItemsLayersSrc = this._createEmptyGeojsonSource('collection-items-src')
      this._bboxLayerSrc = this._createEmptyGeojsonSource('bbox-src')
      resolve()
    })
  
  })

    // this._highlightLayer = L.geoJSON({
    //   type: 'FeatureCollection',
    //   features: []
    // }, {
    //   style: function () {
    //     return {color: 'yellow'}
    //   }     
    // }).addTo(this.map)

    // this._addGeoJsonLayer(collection.bboxAsGeojsonFeature, function () {
    //   return {
    //     color: '#0f3542',
    //     fillOpacity: 0,
    //     weight: 2
    //   }
    // })

  }

  _createFillLyr (srcId, lyrId, paintOptions) {
    this.map.addLayer({
      'id': lyrId,
      'type': 'fill',
      'source': srcId,
      'paint': paintOptions
    })
  }
  
  _createLineLyr (srcId, lyrId, paintOptions) {
    this.map.addLayer({
      'id': lyrId,
      'type': 'line',
      'source': srcId,
      'paint': paintOptions
    })
  }

  _createRasterLyr (srcId, lyrId) {
    this.map.addLayer({
      'id': lyrId,
      'type': 'raster',
      'source': srcId
    })
  }

  _createEmptyGeojsonSource (id) {
    this.map.addSource(id, {
      'type': 'geojson',
      promoteId: 'id',
      'data': {"type": "FeatureCollection", "features": []}
    })
  }

  fitToBounds (bounds) {
    this.map.fitBounds(bounds, {
      padding: 10
    })
  }

  _setGeojsonDataOnSource(srcId, data) {
    this.map.getSource(srcId).setData(data)
  }
 
  addCollectionBbox (collection) {
    this._setGeojsonDataOnSource('bbox-src', collection.bboxAsGeojsonFeature)
    this._createLineLyr('bbox-src', 'collection-bbox-lyr', {
      'line-width': 2,
      'line-color': '#0f3542'
    })
  }
  
  addCollectionItems (items) {
    const srcId = 'collection-items-src'
    const fc = {
      type: 'FeatureCollection',
      features: items.map(i => {
        return assignDeep({id: i.rawJson.id, properties: {id: i.rawJson.id}}, i.rawJson)
      })
    }
    this._setGeojsonDataOnSource(srcId, fc)

    this._createFillLyr(srcId, 'collection-items-fill-lyr', {
      'fill-opacity': 0.5,
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'isSelected'], false],
        'yellow',
        '#49c5c1'
      ],
    })

    this._createLineLyr(srcId, 'collection-items-line-lyr', {
      'line-width': 2,
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'isSelected'], false],
        'yellow',
        '#49c5c1'
      ],
    })
  }

  updateCollectionItems (items) {
    const fc = {
      type: 'FeatureCollection',
      features: items.map(i => {
        return assignDeep({id: i.rawJson.id, properties: {id: i.rawJson.id}}, i.rawJson)
      })
    }
    this._setGeojsonDataOnSource('collection-items-src', fc)
  }

  clearHighlightLayer () {
    this.map.removeFeatureState({
      source: 'collection-items-src',
    })
  }

  highlightCollectionItem (item) {
    this.clearHighlightLayer()

    this.map.setFeatureState({
      source: 'collection-items-src',
      id: item.id,
    }, {
      isSelected: true
    })
  }

  addCollectionItemOutline (item) {

    // this._createLineLyr('bbox-src', 'collection-items-line-lyr', {
    //   'line-width': 2,
    //   'line-color': '#49c5c1'
    // })

  }

  _addImageSrc (srcId, url, bbox) {

    this.map.addSource(srcId, {
      type: 'image',
      url: url,
      coordinates: [
        [bbox[0], bbox[3]],
        [bbox[2], bbox[3]],
        [bbox[2], bbox[1]],
        [bbox[0], bbox[1]]
      ]
    });
  }

  async addCollectionItemThumbnailAsset (item, errorCallback) {
    if (item.validHttpThumbnailUrl) {
      const srcId = `${item.titleOrId}-thumbnail-src`
      this._addImageSrc(srcId, item.validHttpThumbnailUrl, item.bbox)
      this._createRasterLyr(srcId, `${item.titleOrId}-thumbnail-lyr`)

      // if (errorCallback) lyr.on('error', errorCallback)
    }
  }

  async addCollectionItemOverviewAsset (item, errorCallback) {
    if (item.validHttpOverviewUrl) {
      const srcId = `${item.titleOrId}-overview-src`
      this._addImageSrc(srcId, item.validHttpOverviewUrl, item.bbox)
      this._createRasterLyr(srcId, `${item.titleOrId}-overview-lyr`)
      // if (errorCallback) lyr.on('error', errorCallback)
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