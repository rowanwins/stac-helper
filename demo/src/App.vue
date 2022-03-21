<template>
  <ARow style="padding: 100px" :gutter="100">
    <ACol :span="12">
      <h3>Catalog Url</h3>
      <a-input v-model:value="url" placeholder="STAC Endpoint" @change="retrieveData" />

      <h3 style="margin-top:40px;">Collections</h3>
      <a-select
        v-model:value="selectedCollectionTitle"
        style="width: 100%"
        :options="availableCollections"
        @change="selectCollection"
      />

      <div v-if="collection !== null">
        <h3 style="margin-top:40px;">{{collectionTitle}}</h3>
        <p>Total Items in Collection: {{numberItems}}</p>
        <p>{{readableDates}}</p>
        <h4>
          Filters
        </h4>
        <ARow>
          <ACol :span="6">
            <AButton @click="startPolygon">Select Area</AButton>
          </ACol>
          <ACol :span="18">
            <a-range-picker
              v-model:value="dateRange"
              :disabled-date="checkDate"
              @change="changeDates"
            />
          </ACol>
        </ARow>


        <h3 style="margin-top:20px;">Collection Items</h3>
        <ARow v-for="(i, index) in items" style="margin-bottom: 10px; background: #eee; padding: 10px;">
          <ACol :span="8">
            <img :src="thumbnails[index]" style="height: 100px;" >
          </ACol>
          <ACol :span="16">
            <h4>{{i.title}}</h4>
            <p>{{i.datetime}}</p>
            <a v-bind:href="i.itemUrl" target="_blank">
              <AButton>Open in STAC catalog</AButton>
            </a>
          </ACol>
        </ARow>
      </div>
    </ACol>

    <ACol :span="12">
      <div id='map' style='width: 100%; height: 600px;'></div>
    </ACol>
  </ARow>
</template>

<script>

import initialiseCatalog from '../../src/entry.js'
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import {bboxPolygon, bbox} from '@turf/turf'
import GeoTIFF, { fromUrl } from 'geotiff'
import { SourceUrl } from '@chunkd/source-url'
import {CogTiff} from '@cogeotiff/core'
import { bboxToTile } from '@mapbox/tilebelt'
import dayjs from 'dayjs'
import moment from 'moment'
export default {
  name: 'App',
  data () {
    return {
      url: 'https://explorer.prod.dea.ga.gov.au/stac',
      catalog: null,
      retrievingCollections: false,
      availableCollections: [],
      selectedCollectionTitle: null,
      collection: null,
      numberItems: 0,
      items: [],
      imgSrc: null,
      dateRange: [],
      drawControl: null,
      bbox: null,
    }
  },
  computed: {
    thumbnails () {
      return this.items.map(i => {
        const url = i.itemJson.assets[i.assetTitles[0]].href.replace('s3://dea-public-data', 'https://dea-public-data.s3.amazonaws.com')
        return `https://rqizhugeq5.execute-api.ap-southeast-2.amazonaws.com/cog/preview?url=${url}&max_size=512&colormap_name=cfastie`
      })
    },
    momentDates () {
      if (this.collection === null) return ''
      const start = moment(this.collection.details.extent.temporal.interval[0][0])
      if (this.collection.details.extent.temporal.interval[0][1] === null) return [start, null]
      const end = moment(this.collection.details.extent.temporal.interval[0][1])
      return [start, end]
    },
    readableDates () {
      if (this.collection === null) return ''
      const start = dayjs(this.collection.details.extent.temporal.interval[0][0])
      if (this.collection.details.extent.temporal.interval[0][1] === null) return `${start.format('DD/MM/YYYY')} - ...`

      const end = dayjs(this.collection.details.extent.temporal.interval[0][1])
      return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`
    },
    collectionTitle () {
      if (this.collection === null) return ''
      return this.collection.title
    }
  },
  mounted () {
    this.retrieveData()
    this.createMap()
  },
  methods: {
    async startPolygon () {
      this.drawControl.changeMode('draw_polygon')
      const f = await this.awaitDrawnFeature()
      this.bbox = bbox(f)
      await this.searchCollectionItems()
      this.stopDraw()
    },
    stopDraw () {
      this.drawControl.changeMode('simple_select')
      this.drawControl.deleteAll()
    },
    checkDate (date1) {
      return date1.isBefore(this.momentDates[0]) || date1.isAfter(this.momentDates[1])
    },
    awaitDrawnFeature () {
      return new Promise((resolve) => {
        this.map.once('draw.create', function (e) {
          resolve(e.features[0])
        })
      })
    },
    createMap () {
      this.map = new Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [0, 0],
        zoom: 1
      })
      this.drawControl = new MapboxDraw({
        displayControlsDefault: false
      })
      this.map.addControl(this.drawControl)


      
      this.map.on('load', () => {
        this.setupCollectionLayers()     
        this.setupCollectionDatasetsLayers() 
      })
    },
    setupCollectionLayers () {
      this.map.addSource('collection-src', {
        'type': 'geojson',
        'data': {type: 'FeatureCollection', features: []}
      })

      this.map.addLayer({
        'id': 'collection-bbox-lyr',
        'type': 'fill',
        'source': 'collection-src',
        'layout': {},
        'paint': {
          'fill-color': '#088',
          'fill-opacity': 0.1  
        }
      })

      this.map.addLayer({
        'id': 'collection-bbox-outline-lyr',
        'type': 'line',
        'source': 'collection-src',
        'paint': {
          'line-color': '#088',
          'line-width': 2
        }
      })
    },
    setupCollectionDatasetsLayers () {
      this.map.addSource('collection-datasets-src', {
        'type': 'geojson',
        'data': {type: 'FeatureCollection', features: []}
      })

      this.map.addLayer({
        'id': 'collection-dataset-lyr',
        'type': 'fill',
        'source': 'collection-datasets-src',
        'layout': {},
        'paint': {
          'fill-color': 'red',
          'fill-opacity': 0.01  
        }
      })

      this.map.addLayer({
        'id': 'collection-dataset-outline-lyr',
        'type': 'line',
        'source': 'collection-datasets-src',
        'paint': {
          'line-color': 'red',
          'line-width': 2
        }
      })
    },
    zoomToAndPlotCollectionExtent() {
      this.map.getSource('collection-src').setData(bboxPolygon(this.collection.bbox[0]))
      this.map.fitBounds(this.collection.bbox[0], {padding: 100})
    },
    async retrieveData () {
      this.catalog = await initialiseCatalog(this.url)
      this.retrievingCollections = true
      await this.catalog.getCollections()
      this.retrievingCollections = false
      const collections = this.catalog.collectionTitles.map(t => {
        return {value: t, title: t}
      })
      this.availableCollections = collections
      this.selectedCollection = collections[0].value
    },
    async selectCollection (title) {
      this.bbox = null
      this.dateRange = []
      this.collection = this.catalog.getCollectionByTitle(title)
      this.zoomToAndPlotCollectionExtent()
      this.numberItems = await this.collection.checkNumberOfCollectionItems()

      this.searchCollectionItems()
      // const keys = Object.keys(this.items[0].itemJson.assets)
      // const url = this.items[0].itemJson.assets[keys[0]].href.replace('s3://dea-public-data', 'https://dea-public-data.s3.amazonaws.com')

      // const tiff = await fromUrl(url)
      // const data = await tiff.readRasters({
      //   bbox: this.items.bbox,
      //   width: 256,
      //   height: 256
      // })

      // const img = new ImageData(data.width, data.height)
      // data[0].forEach((v, i) => img.data[i] === v)
      // this.imgSrc = this.imageDataToImg(img)
    },
    async searchCollectionItems () {
      const searcher = this.collection.createSearch()
      searcher.itemLimitPerRequest(20)

      if (this.dateRange[0]) searcher.between(this.dateRange[0].toISOString(), this.dateRange[1].toISOString())
      if (this.bbox !== null) searcher.bbox(this.bbox)

      await searcher.getFirstPageOfResults()

      this.items = searcher.results
      this.map.getSource('collection-datasets-src').setData({
        type: 'FeatureCollection',
        features: this.items.map(i => i.itemJson)
      })
    },
    changeDates (dates) {
      this.searchCollectionItems()
    },
    imageDataToImg (imagedata) {
      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')
      canvas.width = imagedata.width
      canvas.height = imagedata.height
      ctx.putImageData(imagedata, 0, 0)
      return canvas.toDataURL()
    }
  } 
}
</script>

<style>
</style>
