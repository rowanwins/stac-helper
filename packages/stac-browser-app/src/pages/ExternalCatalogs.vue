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
        <ARow v-else>
          <ACol :span="24">
            <SimpleListFilter @filter-changed="filterChanged"/>
            <ARow
              v-for="catalog in filteredCatalogs"
              type="flex"
              align="middle"
              class="externalCatalog cardStyle"
            >
              <ACol :span="24">
                <h3 @click="loadCatalog(catalog)">{{catalog.title}}</h3>
                <p style="margin-bottom: 0px;">{{catalog.summary}}</p>
              </ACol>
            </ARow>
          </ACol>
        </ARow>
        
      </template>
    </TwoColLayout>
</template>


<script>
import TwoColLayout from '@/layouts/TwoColLayout.vue'
import SimpleListFilter from '@/components/Base/SimpleListFilter.vue'

import {initialiseFromUrl} from '@stac/stac-api-helper'
import { notification } from "ant-design-vue"

export default {
  name: 'ExternalCatalogs',
  components: {
    TwoColLayout,
    SimpleListFilter
  },
  data () {
    return {
        loadingCatalogs: false,
        loadingCatalog: false,
        filterText: ''
    }
  },
  computed: {
    catalogs () {
      return this.$store.state.allExternalCatalogs
    },
    filteredCatalogs () {
      if (this.filterText === '') return this.catalogs
      const ftLower = this.filterText.toLowerCase()
      return this.catalogs.filter(c => {
        return c.title.toLowerCase().indexOf(ftLower) > -1 || c.summary.toLowerCase().indexOf(ftLower) > -1
      })
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
    filterChanged (filterText) {
      this.filterText = filterText
    },
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