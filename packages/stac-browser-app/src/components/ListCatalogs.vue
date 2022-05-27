<template>
    <ARow v-for="catalog in catalogs" type="flex" align="top" class="cardStyle itemInListOfStacThings">
      <ACol :span="17">
        <h3 @click="selectCatalog(catalog)">{{catalog.titleOrId}}</h3>
        <p class="wrapper" v-html="catalog.descriptionAsHtml"></p>
      </ACol>
  </ARow>
</template>

<script>
export default {
  name: 'ListOfCatalogs',
  props: ['catalogs'],
  emits: ['set-selected-catalog'],
  methods: {
    selectCatalog (catalog) {
      this.$emit('set-selected-catalog', catalog)
    }
  }
}
</script>