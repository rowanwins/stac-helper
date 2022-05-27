<template>
    <MainLayout id="collectionsPage"  v-if="isCollectionReady">

      <template #first-col-content>
        <CollectionOverview :collection="collection"/>
        <AButton type="primary" ghost style="margin-top: 20px;" @click="backToCatalog">
          <template #icon><ArrowLeftOutlined /></template>
          Back to Catalog
        </AButton>
      </template>

      <template #second-col-content>
        <ATabs v-model:activeKey="activeTab" :animated="false">
          <ATabPane key="items" tab="Items" class="cardStyleLight">
            <CollectionItems 
              v-if="collection"
              :items="items"
              :leaflet-map="leafletMap"
              :loading-items="!dataReady"
              :page-index="pageResultsIndex"
              @set-selected-item="setSelectedItem"
              @get-next-page="getNextPage"
              @get-prev-page="getPrevPage"
              @set-page-size="pageSizeSet"
              @filter="filterCalled"
              @clear-filter="filterCleared"
            />
            <div v-if="collectionIsEmpty">
              <a-alert message="No items in this collection." type="warning" />
            </div>
          </ATabPane>

          <ATabPane key="metadata" tab="Metadata" class="cardStyleLight">
            <ItemMetadata :collection="collection.rawJson"/>
          </ATabPane>

          <ATabPane key="poviders" tab="Providers" class="cardStyleLight">
            <a-alert 
              v-if="collection.numberOfProviders === 0"
              message="No providers for this collection."
              type="warning" 
            />
            <ARow v-else v-for="provider in collection.rawJson.providers" type="flex" align="middle">
              <ACol :span="12">
                <p>
                  <a :href="provider.url" target="_blank">{{provider.name}}</a>
                </p>
              </ACol>
              <ACol :span="12" >
                <p>
                <ATag v-for="role in provider.roles" style="float: right;">
                  {{role}}
                </ATag>
                </p>  
              </ACol>
            </ARow>
          </ATabPane>

          <ATabPane key="catalogs" tab="Catalogs" class="cardStyleLight" v-if="collection.catalogs.length > 0">
            <ListCatalogs :catalogs="collection.catalogs" @set-selected-catalog="selectCatalog"/>
          </ATabPane>

        </ATabs>

      </template>

      <template #third-col-content>
        <LeafletMap
          @map-ready="mapIsReady"
        />
      </template>

    </MainLayout>
</template>

<script>
import MainLayout from '@/layouts/MainLayout.vue'
import CollectionOverview from '@/components/CollectionOverview.vue'
import CollectionItems from '@/components/CollectionItems.vue'
import LeafletMap from '@/components/LeafletMap.vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import ItemMetadata from '@/components/ItemMetadata.vue'
import ListCatalogs from '@/components/ListCatalogs.vue'

export default {
  name: 'CollectionPage',
  components: {
    MainLayout,
    CollectionOverview,
    CollectionItems,
    LeafletMap,
    ArrowLeftOutlined,
    ItemMetadata,
    ListCatalogs
},
  data () {
    return {
      activeTab: 'items',
      dataReady: false,
      collectionIsEmpty: false,
      searchIsEmpty: false,
      items: [],
      leafletMap: null,
      mapItemsAdded: false,
      pageSize: 12
    }
  },
  computed: {
    pageResultsIndex () {
      return this.$store.state.pageResultsIndex
    },
    isCollectionReady () {
      return this.collection !== null || this.collection !== undefined
    },
    collection () {
      return this.$store.getters.selectedStac
    },
    filteredCollection () {
      return this.$store.state.searchCollection
    },
    collectionOrFilteredCollection () {
      return this.filteredCollection === null ? this.collection : this.filteredCollection
    }
  },
  async mounted () {
    // If we've only loaded a single item from a collection
    // because that was our app entrypoint
    if (this.collectionOrFilteredCollection.allItems.length < 2) {
      this.collectionOrFilteredCollection.clearTempItems()
      const items = await this.collectionOrFilteredCollection.getNextPageOfCollectionItems()
      if (items !== null) this.items = items
    } else if (this.collectionOrFilteredCollection.allItems.length > 1) {
      const items = this.collectionOrFilteredCollection.getPageOfItemsByIndex(this.pageResultsIndex)
      if (items !== null) this.items = items
    }

    if ((this.items === null || this.items.length === 0) && this.collectionOrFilteredCollection.items.length > 0) {
      this.items = this.collectionOrFilteredCollection.items
    }

    if (!this.mapItemsAdded && this.leafletMap !== null) this.addCollectionThingsToMap()

    this.dataReady = true

    if (this.collection.numberOfItems === null) {
      this.collection.checkTotalNumberOfItems()
      .then(count => {
        if (count === 0) this.collectionIsEmpty = true
      })
    } else if (this.collection.numberOfItems === 0) {
      this.collectionIsEmpty = true
    }

  },
  // watch: {
  //   async collection () {
  //     console.log('watcher called')

  //     if (this.collectionOrFilteredCollection === undefined || this.collectionOrFilteredCollection === null) return
  //     if (this.$store.getters.selectedStacType !== 'Collection') return
  //     this.items = await this.collectionOrFilteredCollection.getNextPageOfCollectionItems()
  //     if (!this.mapItemsAdded && this.collectionOrFilteredCollection !== undefined && this.leafletMap !== null) {
  //       this.addCollectionThingsToMap()
  //     }
  //   }
  // },
  methods: {
    setSelectedItem (item) {
      const stacUrl = item.linkToSelf
      this.$store.commit('addStacThing', {
        id: stacUrl,
        stacThing: item
      })
      this.$store.commit('setSelectedStacId', null)
      this.$router.push(`/external/${stacUrl}`)
    },
    async selectCatalog (catalog) {
      await this.$store.dispatch('addThingToStoreAndSetAsSelected', catalog)
      this.$router.push(`/external/${catalog.linkToSelf}`)
    },
    async backToCatalog () {
      const tmp = this.collection
      this.$store.commit('setSelectedStacId', null)
      this.$store.commit('setPageResultsIndex', 1)
      this.$store.commit('setSearchCollection', null)
      if (tmp.hasParent) {
        this.$router.push(`/external/${tmp.linkToParent}`)
        return
      }
      if (tmp.hasRoot) {
        this.$router.push(`/external/${tmp.linkToRoot}`)
      }
    },
    async getNextPage () {
      this.$store.commit('setPageResultsIndex', this.pageResultsIndex + 1)
      const existingItems = this.collectionOrFilteredCollection.getPageOfItemsByIndex(this.pageResultsIndex)
      if (!existingItems) {
        this.dataReady = false
        this.items = await this.collectionOrFilteredCollection.getNextPageOfCollectionItems()
        this.dataReady = true
      } else {
        this.items = existingItems
      }

      this.leafletMap.updateCollectionItems(this.items)
    },
    getPrevPage () {
      this.$store.commit('setPageResultsIndex', this.pageResultsIndex - 1)
      this.items = this.collectionOrFilteredCollection.getPageOfItemsByIndex(this.pageResultsIndex)
      this.leafletMap.updateCollectionItems(this.items)
    },
    mapIsReady (LeafletMap) {
      this.leafletMap = LeafletMap
      if (this.collectionOrFilteredCollection !== undefined) {
        if (this.collectionOrFilteredCollection.stacType === 'Collection' && this.collectionOrFilteredCollection.allItems.length > 0) this.addCollectionThingsToMap()
        if (!this.collectionOrFilteredCollection.stacType && this.collectionOrFilteredCollection.allItems.length > 0) this.addCollectionThingsToMap()
      }
    },
    addCollectionThingsToMap () {
      this.mapItemsAdded = true
      this.leafletMap.fitToBounds(this.collection.bbox)
      this.leafletMap.addCollectionBbox(this.collection)
      this.leafletMap.addCollectionItems(this.items)
      if (this.filteredCollection !== null) {
        this.leafletMap.clearDrawnLayers()
        this.leafletMap.addFilterBoundingBoxLayerFromBounds(this.filteredCollection._params.bbox)
      }
    },
    async filterCalled (filter) {
      const filteredCollection = await this.collection.createSearch()
      
      filteredCollection.setPageSize(this.pageSize)
      if (filter.bbox !== null) filteredCollection.bbox(filter.bbox)
      if (filter.datetime.length > 0) filteredCollection.between(filter.datetime[0].toISOString(), filter.datetime[1].toISOString())
      this.$store.commit('setPageResultsIndex', 1)

      this.dataReady = false
      this.items = await filteredCollection.getNextPageOfCollectionItems()
      await filteredCollection.checkNumberOfItems()
      this.$store.commit('setSearchCollection', filteredCollection)

      this.dataReady = true

      this.leafletMap.updateCollectionItems(this.items)
    },
    filterCleared () {
      this.$store.commit('setSearchCollection', null)
      this.items = this.collection.getPageOfItemsByIndex(1)
      this.leafletMap.updateCollectionItems(this.items)
    },
    async pageSizeSet (pageSize) {
      this.pageSize = pageSize
      this.$store.commit('setPageResultsIndex', 1)
      this.collection.clearExistingItemPages()
      this.collection.setPageSize(pageSize)
      if (this.filteredCollection !== null) {
        this.filteredCollection.clearExistingItemPages()
        this.filteredCollection.setPageSize(pageSize)
        this.dataReady = false
        this.items = await this.filteredCollection.getNextPageOfCollectionItems()
        await this.collection.getNextPageOfCollectionItems()
        this.dataReady = true
      } else {
        this.dataReady = false
        this.items = await this.collection.getNextPageOfCollectionItems()
        this.dataReady = true
    }
      this.leafletMap.updateCollectionItems(this.items)
    }
  }
}

</script>