<template>
  <div
    id="leafletmap"
    style="height: 100%; width: 100%;"
  />
</template>
      
<script>
import LeafletMap from '@/models/LeafletMap'

export default {
  name: 'MapLibreMap',
  emits: ['map-ready'],
  async mounted () {
    const leafletMap = new LeafletMap()
    await leafletMap.setupMap("leafletmap")
    this.$emit('map-ready', leafletMap)
  }
}
</script>


<style lang="less">
// @import '@/styles/theme.less';

#leafletmap {
  height: 100%
}
</style>