<template>
  <MetadataTables :groups="groups"/>
</template>

<script>
import StacFields from '@radiantearth/stac-fields'

export default {
  name: 'CollectionMetadata',
  props: ['collection'],
  data () {
    return {
      groups: []
    }
  },
  mounted () {
    if (this.collection) {
      this.groups = [
        ...StacFields.formatSummaries(this.collection),
        ...StacFields.formatCollection(this.collection, key => key.indexOf(':') > -1)
      ]
    }
  }
}
</script>
