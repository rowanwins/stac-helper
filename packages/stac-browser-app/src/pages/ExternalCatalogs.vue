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
import {Catalog} from '@stac/stac-api-helper'
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
        // catalogs: [
          // {
          //   title: 'Digital Earth Australia',
          //   description: 'DEA is a platform that uses spatial data recorded by satellites orbiting our planet to detect physical changes across Australia in unprecented scale.',
          //   url: 'https://explorer.sandbox.dea.ga.gov.au/stac'
          // },
          // {
          //   title: 'Earth Search',
          //   description: 'A STAC API of AWS Public Datasets.',
          //   url: 'https://earth-search.aws.element84.com/v0'
          // },
          // {
          //   title: 'Microsoft Planetary Computer',
          //   description: 'Searchable spatio-temporal metadata describing Earth science datasets hosted by the Microsoft Planetary Computer.',
          //   url: 'https://planetarycomputer.microsoft.com/api/stac/v1'
          // },
          // {
          //   title: 'Microsoft Planetary Computer - Staging',
          //   description: 'Searchable spatio-temporal metadata describing Earth science datasets hosted by the Microsoft Planetary Computer.',
          //   url: 'https://planetarycomputer-staging.microsoft.com/api/stac/v1'
          // }
        // ]
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

      this.loadingCatalog = true
      let catalogData = null
      try {
        const response = await fetch(selectedCatalog.url)
        if (!response.ok) {
            this.loadingCatalog = false
            notification.error({
              message: "Error",
              description: `Could not load ${selectedCatalog.title} catalog.`,
              duration: null,
            });
            return
        }
        catalogData = await response.json()
      } catch (e) {
        this.loadingCatalog = false
        notification.error({
          message: "Error",
          description: `Could not load ${selectedCatalog.title} catalog.`,
          duration: null,
        });
        return
      }

      const catalog = new Catalog(catalogData)
      // const catalogUrl = catalog.linkToSelf.replace('https://', '')
      const catalogUrl = catalog.linkToSelf

      this.$store.commit('addStacThing', {
        id: catalogUrl,
        stacThing: catalog
      })
      await catalog.loadChildren()
      this.loadingCatalog = false

      this.$store.commit('setSelectedStacId', catalogUrl)
      this.$router.push(`/external/${catalogUrl}`)
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