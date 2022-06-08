<template>
    <TwoColLayout id="externalCatalogsPage">

      <template #first-col-content>
        <p>Welcome to STAC Browser</p>
      </template>

      <template #second-col-content>
        <ARow v-if="loadingCatalogs">
          <h3>Loading catalogs...</h3> 
          <ASkeleton active />
        </ARow>
        <ARow v-else-if="loadingCatalog">
          <h3>Loading catalog...</h3> 
          <ASkeleton active />
        </ARow>
        <ARow 
          v-else
          v-for="catalog in catalogs"
          type="flex"
          align="middle"
          class="externalCatalog cardStyle"
        >
          <ACol :span="24">
            <h3 @click="loadCatalog(catalog)">{{catalog.title}}</h3>
            <p style="margin-bottom: 0px;">{{catalog.summary}}</p>
            <!-- <p>{{catalog.description}}</p> -->
          </ACol>
        </ARow>

      </template>
    </TwoColLayout>
</template>


<script>
import TwoColLayout from '@/layouts/TwoColLayout.vue'
import {initialiseFromUrl} from '@stac/stac-api-helper'
import { notification } from "ant-design-vue"

export default {
  name: 'ExternalCatalogs',
  components: {
    TwoColLayout
  },
  data () {
    return {
        loadingCatalogs: false,
        loadingCatalog: false
    }
  },
  computed: {
    catalogs () {
      return this.$store.state.allExternalCatalogs
    }
  },
  async mounted () {
    if (this.catalogs.length === 0) {
      this.loadingCatalogs = true
      const response = await fetch('https://stacindex.org/api/catalogs')
      const data = await response.json()   
      data.forEach(catalog => this.$store.commit('addToAllExternalCatalogs', catalog))   
      this.loadingCatalogs = false
    }
  },
  methods: {
    async loadCatalog (selectedCatalog) {

      if (this.$store.getters.stacReferenceIsInStore(selectedCatalog.url)) {
        this.$store.commit('setSelectedStacId', selectedCatalog.url)
        this.$router.push(`/external/${selectedCatalog.url}`)
        return
      }

      this.loadingCatalog = true
      try {
        const stacThing = await initialiseFromUrl(selectedCatalog.url)

        if (stacThing === null) {
          notification.error({
            message: "Error",
            description: 'The STAC reference could not be parsed, redirecting to home.',
            duration: null,
          })
          this.loadingCatalog = false
        } else {
          await this.$store.dispatch('addOrSelectStacReferenceInStore', stacThing)
          this.loadingCatalog = false
          this.$router.push(`/external/${stacThing.linkToSelf}`)
        }
      } catch {
        notification.error({
          message: "Error",
          description: `Could not load ${selectedCatalog.title} catalog.`,
          duration: null,
        })
        this.loadingCatalog = false
      }
    }
  }
}

</script>

<style lang="less" scoped>
.externalCatalog {
  margin-bottom: 12px;
  h3 {
    cursor: pointer;
  }
  h3:hover {
    color: #3dc2be;
  }
}
</style>