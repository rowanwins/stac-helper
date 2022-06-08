<template>
    <SimpleListFilter @filter-changed="filterChanged"/>
    <ARow v-for="catalog in catalogs" type="flex" align="top" class="cardStyle itemInListOfStacThings">
      <ACol :span="17">
        <h3 @click="selectCatalog(catalog)">{{catalog.titleOrId}}</h3>
        <p class="wrapper" v-html="catalog.descriptionAsHtml"></p>
      </ACol>
  </ARow>
</template>

<script>
import SimpleListFilter from '@/components/Base/SimpleListFilter.vue'

export default {
  name: 'ListOfCatalogs',
  props: ['catalogs'],
  emits: ['set-selected-catalog'],
  components: {
    SimpleListFilter
  },
  data () {
    return {
      filterText: ''
    }
  },
  computed: {
    filteredCatalogs () {
      if (this.filterText === '') return this.catalogs
      const ftLower = this.filterText.toLowerCase()
      return this.catalogs.filter(c => {
        return c.titleOrId.toLowerCase().indexOf(ftLower) > -1 || 
          (c.descriptionAsHtml !== null && c.descriptionAsHtml.toLowerCase().indexOf(ftLower) > -1)
      })
    }
  },
  methods: {
    selectCatalog (catalog) {
      this.$emit('set-selected-catalog', catalog)
    },
    filterChanged (filterText) {
      this.filterText = filterText
    }
  }
}
</script>