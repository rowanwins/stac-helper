<template>
    <MainLayout id="collectionsPage"  v-if="isCollectionReady">

      <template #first-col-content>
        <CollectionOverview :collection="collection"/>
        <AButton
          v-if="parent !== null"
          type="primary"
          ghost
          style="margin-top: 20px;"
          @click="backToParent"
        >
          <template #icon><ArrowLeftOutlined /></template>
          Back to {{parentType}}
        </AButton>
        <AButton v-else disabled>
          <template #icon><ArrowLeftOutlined /></template>
          NO PARENT FOUND
        </AButton>
      </template>

      <template #second-col-content>
        <ATabs v-model:activeKey="activeTab" :animated="false">
          <ATabPane key="items" tab="Items" class="cardStyleLight" :disabled="items.length === 0">
            <CollectionItems 
              v-if="collection"
              :items="items"
              :leaflet-map="leafletMap"
              :loading-items="loadingChildren || !dataReady"
              :page-index="pageResultsIndex"
              :applying-filter="applyingFilter"
              @set-selected-item="setSelectedItem"
              @get-next-page="getNextPage"
              @get-prev-page="getPrevPage"
              @set-page-size="setPageSize"
              @filter="filterCalled"
              @clear-filter="filterCleared"
              @start-rectangle-draw="drawing = true"
              @finish-rectangle-draw="drawing = false"
            />
            <div v-if="collectionIsEmpty">
              <a-alert message="No items in this collection." type="warning" />
            </div>
          </ATabPane>

          <ATabPane key="metadata" tab="Metadata" class="cardStyleLight">
            <CollectionMetadata :collection="collection.rawJson"/>
          </ATabPane>

          <ATabPane key="poviders" tab="Providers" class="cardStyleLight">
            <AAlert 
              v-if="collection.numberOfProviders === 0"
              message="No providers for this collection."
              type="warning" 
            />
            <Providers v-else :providers="collection.rawJson.providers"/>
          </ATabPane>

          <ATabPane key="catalogs" tab="Catalogs" class="cardStyleLight" :disabled="collection.catalogs.length === 0">
            <ListCatalogs :catalogs="collection.catalogs" @set-selected-catalog="selectCatalog"/>
          </ATabPane>

          <ATabPane key="collections" tab="Collections" class="cardStyleLight" :disabled="collection.collections.length === 0">
            <ListCollections :collections="collection.collections" @set-selected-collection="selectCollection"/>
          </ATabPane>

        </ATabs>

      </template>

      <template #third-col-content>
        <LeafletMap @map-ready="mapIsReady"/>
        <MapAlert v-if="drawing" msg="Click and drag to create a bounding box."/>
      </template>

    </MainLayout>
</template>

<script>
import MainLayout from '@/layouts/MainLayout.vue'
import CollectionOverview from '@/components/CollectionOverview.vue'
import CollectionItems from '@/components/CollectionItems.vue'
import LeafletMap from '@/components/LeafletMap.vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import CollectionMetadata from '@/components/CollectionMetadata.vue'
import ListCatalogs from '@/components/ListCatalogs.vue'
import MapAlert from '@/components/MapAlert.vue'
import Providers from '@/components/Providers.vue'

export default {
  name: 'CollectionPage',
  components: {
    MainLayout,
    CollectionOverview,
    CollectionItems,
    LeafletMap,
    ArrowLeftOutlined,
    CollectionMetadata,
    ListCatalogs,
    Providers,
    MapAlert
  },
  props: {
    loadingChildren: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      drawing: false,
      activeTab: 'items',
      dataReady: false,
      applyingFilter: false,
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
      if (this.$store.getters.selectedStacType !== 'Collection') return null
      return this.$store.getters.selectedStac
    },
    parent () {
      if (this.collection === null) return null
      return this.collection.parent
    },
    parentType () {
      if (this.parent === null) return null
      return this.collection.parent.stacType
    },
    filteredCollection () {
      return this.$store.state.searchCollection
    },
    collectionOrFilteredCollection () {
      return this.filteredCollection === null ? this.collection : this.filteredCollection
    }
  },
  watch: {
    // We watch the collection id in case we've navigated from 
    // one collection to another nested collection
    'collection.id': {
      handler () {
        this.onChildrenLoaded()
      },
      immediate: true
    },
    'collection.childrenLoaded': {
      handler () {
        this.onChildrenLoaded()
      }
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

  },
  methods: {
    onChildrenLoaded () {
      if (this.collection === null || !this.collection.childrenLoaded) return
      this.items = this.collectionOrFilteredCollection.items

      if (this.collection.items.length === 0 && this.collection.catalogs.length > 0) {
        this.activeTab = 'catalogs'
      } else if (this.collection.items.length === 0 && this.collection.collections.length > 0) {
        this.activeTab = 'collections'
      } else if (this.collection.catalogs.length === 0 && this.collection.items.length > 0) {
        this.activeTab = 'items'
      }      
    },
    async setSelectedItem (item) {
      await this.$store.dispatch('addOrSelectStacReferenceInStore', item)
      this.$router.push(`/external/${item.linkToSelf}`)
    },
    async selectCatalog (catalog) {
      await this.$store.dispatch('addOrSelectStacReferenceInStore', catalog)
      this.$router.push(`/external/${catalog.linkToSelf}`)
    },
    async selectCollection (collection) {
      await this.$store.dispatch('addOrSelectStacReferenceInStore', collection)
      this.items = []
      this.$store.commit('setSearchCollection', null)
      this.$store.commit('setPageResultsIndex', 1)

      this.$router.push(`/external/${collection.linkToSelf}`)
    },
    async backToParent () {
      const tmp = this.collection
      this.$store.commit('setPageResultsIndex', 1)
      this.$store.commit('setSearchCollection', null)

      if (tmp.hasParent) {
        this.$store.commit('setSelectedStacId', tmp.linkToParent)
        this.$router.push(`/external/${tmp.linkToParent}`)
        return
      }
      // Sometimes there seem to be weird circular references
      // eg maxar collections sometimes point to themselves
      if (tmp.hasRoot && !tmp.isRoot) {
        this.$store.commit('setSelectedStacId', tmp.linkToRoot)
        this.$router.push(`/external/${tmp.linkToRoot}`)
      } else if (tmp.parent) {
        this.$store.commit('setSelectedStacId', tmp.parent.url)
        this.$router.push(`/external/${tmp.parent.url}`)
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
      this.applyingFilter = true
      this.dataReady = false
      
      const filteredCollection = await this.collection.createSearch()
      filteredCollection.setPageSize(this.pageSize)
      if (filter.bbox !== null) filteredCollection.bbox(filter.bbox)
      if (filter.datetime.length > 0) filteredCollection.between(filter.datetime[0].toISOString(), filter.datetime[1].toISOString())
      
      this.$store.commit('setPageResultsIndex', 1)
      this.items = await filteredCollection.getNextPageOfCollectionItems()
      await filteredCollection.checkNumberOfItems()
      this.$store.commit('setSearchCollection', filteredCollection)
      this.leafletMap.updateCollectionItems(this.items)

      this.dataReady = true
      this.applyingFilter = false

    },
    filterCleared () {
      this.$store.commit('setSearchCollection', null)
      this.items = this.collection.getPageOfItemsByIndex(1)
      this.leafletMap.updateCollectionItems(this.items)
    },
    async setPageSize (pageSize) {
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