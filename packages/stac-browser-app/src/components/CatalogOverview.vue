<template>
  <h2 style="margin-bottom: 20px;">Catalog</h2>
  <div v-if="catalog !== undefined">
    <h3 style="margin-bottom: 20px;">{{catalog.titleOrId}}</h3>
    <p style="margin-bottom: 40px;" v-html="catalog.descriptionAsHtml"></p>
  </div>
</template>

<script>
export default {
  name: 'CatalogOverview',
  props: ['catalog']
}
</script>