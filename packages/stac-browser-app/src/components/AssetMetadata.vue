<template>
  <MetadataTables :groups="groups"/>
</template>

<script>
import StacFields from '@radiantearth/stac-fields'

export default {
  name: 'AssetMetadata',
  props: ['asset'],
  computed: {
    groups () {
      return StacFields.formatAsset(this.asset, null)
    }
  }
}
</script>
