<template>
  <MetadataTables :groups="groups"/>
</template>

<script>
import StacFields from '@radiantearth/stac-fields'

export default {
  name: 'AssetMetadata',
  props: ['asset'],
  data () {
    return {
      groups: []
    }
  },
  mounted () {
    if (this.asset) this.groups = StacFields.formatAsset(this.asset, null)
  }

}
</script>
