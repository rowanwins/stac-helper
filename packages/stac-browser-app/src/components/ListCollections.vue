<template>
    <SimpleListFilter @filter-changed="filterChanged"/>
    <ARow v-for="collection in filteredCollections" type="flex" align="top" class="cardStyle itemInListOfStacThings">
      <ACol :span="17">
        <h3 @click="selectCollection(collection)">{{collection.titleOrId}}</h3>
        <p class="wrapper hiddenParas" v-html="collection.descriptionAsHtml"></p>
      </ACol>
      <ACol :span="6" :offset="1">
        <img 
          v-if="collection.thumbnailUrl !== null"
          :src="collection.thumbnailUrl"
          style="width: 100%;"
        >
      </ACol>
  </ARow>
</template>

<script>
import SimpleListFilter from '@/components/Base/SimpleListFilter.vue'

export default {
  name: 'ListOfCollections',
  props: {
    collections: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    SimpleListFilter
  },
  data () {
    return {
      filterText: ''
    }
  },
  computed: {
    filteredCollections () {
      if (this.filterText === '') return this.collections
      const ftLower = this.filterText.toLowerCase()
      return this.collections.filter(c => {
        return c.titleOrId.toLowerCase().indexOf(ftLower) > -1 || 
          (c.descriptionAsHtml !== null && c.descriptionAsHtml.toLowerCase().indexOf(ftLower) > -1)
      })
    }
  },
  emits: ['set-selected-collection'],
  methods: {
    selectCollection (collection) {
      this.$emit('set-selected-collection', collection)
    },
    filterChanged (filterText) {
      this.filterText = filterText
    }
  }
}
</script>