<template>
    <ARow v-for="collection in collections" type="flex" align="top" class="cardStyle itemInListOfStacThings">
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
  emits: ['set-selected-collection'],
  methods: {
    selectCollection (collection) {
      this.$emit('set-selected-collection', collection)
    }
  }
}
</script>