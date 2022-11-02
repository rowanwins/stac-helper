<template>
  <CatalogPage v-if="stacType === 'Catalog'" :loading-children="loadingChildren"/>
  <CollectionPage v-else-if="stacType === 'Collection'" :loading-children="loadingChildren" :share-data="shareData"/>
  <ItemPage v-else-if="stacType === 'Item'"/>
  <LoadingPage v-else />
</template>

<script>
import ItemPage from '@/pages/Item.vue';
import CollectionPage from '@/pages/Collection.vue';
import CatalogPage from '@/pages/Catalog.vue';
import LoadingPage from '@/pages/Loading.vue';
import {initialiseFromUrl} from '@stac/stac-api-helper'
import { notification } from "ant-design-vue"

export default {
  name: "Stac",
  props: {
    stacUrl: {
      type: String,
      default: null
    },
  },
  data () {
    return {
      loadingChildren: false,
      shareData: null
    }
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
    // This is called on the first mount of this component (used for all stac references)
    next(async (vm) => {
      
      // If someone loaded the app using a STAC URL
      if (from.name === undefined) {
        const coreUrl = window.location.pathname.split('/external/')[1]

        // Reinstate any app params that were part of a Share URL
        let hash = window.location.hash
        if (hash !== '') {
          const url = `https://stac-share.s3.amazonaws.com/public/${hash.replace('#', '')}`
          const res = await fetch(url, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
            }
          });
          vm.shareData = await res.json()
        }
        await vm.loadNewItem(coreUrl)
        window.location.hash = ''
      } else if (from.name === 'external-catalogs') {
        // If someone came to the page via the external catalogs page
        vm.loadChildren()
      }
    })
  },
  async beforeRouteUpdate (to, from) {
    // This condition happens we we force clear the hash after a share
    if (from.hash.length > 0 && to.hash.length === 0) return

    // This gets called on subsequent page navigations when in the app
    const newStacUrl = to.params.stacUrl
    if (this.$store.getters.stacReferenceIsInStore(newStacUrl)) {
      this.$store.commit('setSelectedStacId', newStacUrl)
      this.loadChildren()
      return
    } else {
      await this.loadNewItem(newStacUrl)
    }
  },
  methods: {
    async loadNewItem (stacUrl) {

      if (stacUrl === null || stacUrl === undefined || stacUrl === '') {
        notification.error({
          message: "Error",
          description: 'A STAC Url was not provided provided, redirecting to home.',
          duration: null,
        })
        this.headHome()
        return
      }

      try {
        const stacThing = await initialiseFromUrl(stacUrl)
        console.log(stacThing)
        
        if (stacThing === null) {
          this.throwNotificationError('The STAC reference could not be parsed, redirecting to home.')
          this.headHome()
        } else {
          await this.$store.dispatch('addOrSelectStacReferenceInStore', stacThing)
          this.loadChildren()
          if (stacThing.stacType == 'Collection') stacThing.retrieveQueryables()
        }
      } catch (err) {
        console.log(err)
        this.throwNotificationError('STAC url could not be loaded, redirecting to home.')
        this.headHome()
      }
    },
    loadChildren () {
      if (this.stacType !== 'Item') {
        if (!this.selectedStac.childrenLoaded) {
          this.loadingChildren = true
          const promises = []
          promises.push(this.selectedStac.loadChildren())
          
          if ('activeItemsCollectionPage' in this.selectedStac) {

            // If parsedParams.page exists it means a Share URL to a particular page of items was used
            if (this.shareData !== null && this.shareData.page) {
              promises.push(this.selectedStac.loadActiveItemCollection(this.shareData.page))
            } else {
              promises.push(this.selectedStac.loadActiveItemCollection())
            }
          }
          Promise.allSettled(promises)
          .then(() => {
            this.loadingChildren = false
          })
        }
      }
    },
    headHome () {
      this.$router.push('/')
    },
    throwNotificationError (msg) {
      notification.error({
        message: "Error",
        description: msg,
        duration: null,
      })
    }
  }
}
</script>