<template>
  <CatalogPage v-if="stacType === 'Catalog'"/>
  <CollectionPage v-else-if="stacType === 'Collection'"/>
  <ItemPage v-else-if="stacType === 'Item'"/>
  <LoadingPage v-else />
</template>

<script>
import ItemPage from '@/pages/Item.vue';
import CollectionPage from '@/pages/Collection.vue';
import CatalogPage from '@/pages/Catalog.vue';
import LoadingPage from '@/pages/Loading.vue';
import {initialiseFromUrl} from '@stac/stac-api-helper'

export default {
  name: "Stac",
  props: {
    stacUrl: {
      type: String,
      default: null
    },
  },
  components: {
    ItemPage,
    CollectionPage,
    CatalogPage,
    LoadingPage
  },
  computed: {
    stacType () {
      return this.$store.getters.selectedStacType
    },
    selectedStac () {
      return this.$store.getters.selectedStac
    }
  },
  beforeRouteEnter(to, from, next) {
    // This is called on the first mount of the app
    // When there is a stac url in the page url
    next(async (vm) => {
      if (from.name === undefined) {
        await vm.loadNewItem(window.location.pathname.split('/external/')[1])
      }
    })
  },
  async beforeRouteUpdate (to, from) {
    // This gets called on subsequent page navigations when in the app
    const newStacUrl = to.params.stacUrl
    if (newStacUrl in this.$store.state.stacItems) {
      this.$store.commit('setSelectedStacId', newStacUrl)
      return
    } else {
      await this.loadNewItem(newStacUrl)
    }
  },
  methods: {
    async loadNewItem (stacUrl) {
      const stacThing = await initialiseFromUrl(stacUrl)
      if (stacThing.stacType !== 'Item')  await stacThing.loadChildren()
      if (stacThing.stacType === 'Collection') await stacThing.checkTotalNumberOfItems()

      if (stacThing.hasParent) {
        const parent = await stacThing.loadParent()
        if (parent.stacType === 'Collection') await parent.checkTotalNumberOfItems()
      }

      if (!stacThing.hasParent && stacThing.hasRoot) {
        const root = await stacThing.loadRoot()
        stacThing.parent = root
      }
      
      this.$store.commit('addStacThing', {
        id: stacUrl,
        stacThing
      })
      
      if (stacThing.parent) {
        this.$store.commit('addStacThing', {
          id: stacThing.parent.linkToSelf,
          stacThing: stacThing.parent
        })        
      }

      this.$store.commit('setSelectedStacId', stacUrl)

    }
  }
}
</script>