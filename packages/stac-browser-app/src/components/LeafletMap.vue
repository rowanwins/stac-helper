<template>
  <div
    id="mapDiv"
    style="height: 100%; width: 100%;"
  />
</template>
      
<script>
import LeafletMap from '@/models/LeafletMap'
// import MaplibreMap from '@/models/MaplibreMap'

export default {
  name: 'MapLibreMap',
  emits: ['map-ready'],
  async mounted () {
    const leafletMap = new LeafletMap()
    await leafletMap.setupMap("mapDiv")
    this.$emit('map-ready', leafletMap)

    // const maplibreMap = new MaplibreMap()
    // await maplibreMap.setupMap("mapDiv")
    // this.$emit('map-ready', maplibreMap)
  }
}
</script>


<style lang="less">

#leafletmap {
  height: 100%
}
</style>