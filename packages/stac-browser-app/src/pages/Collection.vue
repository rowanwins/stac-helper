<template>
    <MainLayout id="collectionsPage"  v-if="isCollectionReady">

      <template #first-col-content>
        <CollectionOverview :collection="collection"/>
        <AButton
          v-if="parentOrRoot !== null"
          type="primary"
          ghost
          style="margin-top: 20px;"
          @click="backToParentOrRoot"
        >
          <template #icon><ArrowLeftOutlined /></template>
          Back to {{parentOrRootType}}
        </AButton>
        <AButton v-else disabled>
          <template #icon><ArrowLeftOutlined /></template>
          NO PARENT OR ROOT FOUND
        </AButton>
      </template>

      <template #second-col-content>
        <ARow>
          <ACol :span="24">
            <ShareAndSource :stac-entity="collection" :page-state="pageState"/>
          </ACol>
        </ARow>
        <ATabs v-model:activeKey="activeTab" :animated="false">
          <ATabPane key="items" tab="Items" class="cardStyleLight" :disabled="!hasChildItems">
            <CollectionItems 
              :collection-or-filtered-collection="collectionOrFilteredCollection"
              :items="items"
              :leaflet-map="leafletMap"
              :loading-items="loadingChildrenOrItems"
              :applying-filter="applyingFilter"
              @item-mouse-over="highlightItem"
              @item-mouse-out="removeHighlightItem"
              @item-page-changed="onItemPageChange"
              @set-item-data-loading="setDataReady"
              @set-selected-item="setSelectedItem"
              @set-page-size="setPageSize"
              @filter="filterCalled"
              @filter-cleared="filterCleared"
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

          <ATabPane key="catalogs" tab="Catalogs" class="cardStyleLight" :disabled="!hasChildCatalogs">
            <ListCatalogs :catalogs="collection.catalogs" @set-selected-catalog="selectCatalog"/>
          </ATabPane>

          <ATabPane key="collections" tab="Collections" class="cardStyleLight" :disabled="!hasChildCollections">
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
import ShareAndSource from '@/components/ShareAndSource.vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import CollectionMetadata from '@/components/CollectionMetadata.vue'
import ListCatalogs from '@/components/ListCatalogs.vue'
import MapAlert from '@/components/MapAlert.vue'
import Providers from '@/components/Providers.vue'
import { stringify } from 'qs'
export default {
  name: 'CollectionPage',
  components: {
    MainLayout,
    CollectionOverview,
    CollectionItems,
    LeafletMap,
    ArrowLeftOutlined,
    ShareAndSource,
    CollectionMetadata,
    ListCatalogs,
    Providers,
    MapAlert
  },
  props: {
    loadingChildren: {
      type: Boolean,
      default: false
    },
    shareData: {
      type: Object,
      default () {
        return null
      }
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
      leafletMap: null,
      mapItemsAdded: false,
    }
  },
  mounted () {
    if (this.shareData !== null) {
      this.activeTab = this.shareData.tab
      this.$store.commit('setPageSize', this.shareData.pageSize)

      setTimeout(() => {
        const unwatch = this.$watch('collection.queryablesLoaded', (queryablesLoaded) => {
            if (queryablesLoaded !== false) {
              this.searchFilter.populateFromSerialisedJson(this.shareData.filter, this.collection)
              setTimeout(() => unwatch(), 100)
            }
          }, {
            immediate: true,
            deep: true
          })      
        }, 300)

    }
  },
  computed: {
    pageSize () {
      return this.$store.state.pageResultSize
    },
    pageState () {
      const state = {
        tab: this.activeTab,
        pageSize: this.pageSize
      }
      if (this.collectionOrFilteredCollection !== null && this.collectionOrFilteredCollection.activeItemsCollectionPage) {
        state.page = this.collectionOrFilteredCollection.activeItemsCollectionPage.linkThatCreatedThis
      }
      if (this.searchFilter.anyFilterPropertiesSet) {
        state.filter = this.searchFilter.asSerialisableJson
        if (this.leafletMap !== null) this.leafletMap.addFilterBoundingBoxLayerFromBounds(this.searchFilter.standardFilter.bbox)
      }      
      return state
    },
    items () {
      if (this.collectionOrFilteredCollection === null) return []     
      if (this.collectionOrFilteredCollection.activeItemsCollectionPage !== null) {
        return this.collectionOrFilteredCollection.activeItemsCollectionPage.pageItems
      }

      // Items could be from a static collection
      if (this.collectionOrFilteredCollection.childrenLoaded && this.collectionOrFilteredCollection.hasSomeChildren) {
        return this.collectionOrFilteredCollection.items
      }

      return []
    },
    loadingChildrenOrItems () {
      if (this.loadingChildren) return true
      if (!this.dataReady) return true
      return false
    },
    hasChildItems () {
      if (this.loadingChildren) return false
      if (this.items === null) return false
      return this.items.length > 0
    },
    hasChildCollections () {
      if (this.loadingChildren) return false
      return this.collection.collections.length > 0
    },
    hasChildCatalogs () {
      if (this.loadingChildren) return false
      return this.collection.catalogs.length > 0
    },
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
    parentOrRoot () {
      if (this.collection === null) return null
      if (this.collection.hasParent) return this.collection.parent
      // Sometimes there seem to be weird circular references
      // eg maxar collections sometimes point to a root of themselves
      if (this.collection.hasRoot && !this.collection.isRoot) return this.$store.getters.stacReferenceUsingUrl(this.collection.linkToRoot)
      return null
    },
    parentOrRootType () {
      if (this.parentOrRoot === null) return null
      return this.parentOrRoot.stacType
    },
    filteredCollection () {
      return this.$store.state.searchCollection
    },
    collectionOrFilteredCollection () {
      return this.filteredCollection === null ? this.collection : this.filteredCollection
    },
    searchFilter () {
      return this.$store.state.searchFilter
    }
  },
  watch: {
    // We watch the collection id in case we've navigated from 
    // one collection to another nested collection
    // because we'll want to switch the active tab
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
    },
    loadingChildrenOrItems: {
      handler (value) {
        if (!value && !this.mapItemsAdded && this.leafletMap !== null) this.addCollectionThingsToMap()
      }
    }
  },
  methods: {
    setDataReady (isLoading) {
      this.dataReady = !isLoading
    },
    async onChildrenLoaded () {
      if (this.collection === null || !this.collection.childrenLoaded) return
     
      this.dataReady = true

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
      this.$store.commit('setSearchCollection', null)
      this.$store.commit('setPageResultsIndex', 1)

      this.$router.push(`/external/${collection.linkToSelf}`)
    },
    async backToParentOrRoot () {
      const tmp = this.parentOrRoot
      this.$store.commit('setPageResultsIndex', 1)
      this.$store.commit('setSearchCollection', null)
      this.$store.commit('setSelectedStacId', tmp.linkToSelf)
      this.$router.push(`/external/${tmp.linkToSelf}`)
    },
    mapIsReady (LeafletMap) {
      this.leafletMap = LeafletMap
      // Sometimes the data will be ready before the map
      // In which case we add the data now
      if (!this.mapItemsAdded && this.dataReady) this.addCollectionThingsToMap()
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
    highlightItem (item) {
      this.leafletMap.highlightCollectionItem(item.rawJson)
    },
    removeHighlightItem () {
      this.leafletMap.clearHighlightLayer()
    },
    onItemPageChange () {
      this.leafletMap.updateCollectionItems(this.items)
    },
    async filterCalled () {
      this.applyingFilter = true
      this.dataReady = false
      
      const filteredCollection = await this.collection.createSearch()
      this.searchFilter.populateStacApiHelperSearchClass(filteredCollection, this.pageSize)
      await filteredCollection.loadActiveItemCollection()
      await filteredCollection.checkTotalNumberOfItems()
      this.$store.commit('setSearchCollection', filteredCollection)
      this.leafletMap.updateCollectionItems(this.items)

      this.dataReady = true
      this.applyingFilter = false
    },
    filterCleared () {
      this.leafletMap.updateCollectionItems(this.items)
    },
    async setPageSize (pageSize) {
      this.pageSize = pageSize

      if (this.filteredCollection !== null) {
        await this.filterCalled()
      } else {
        this.dataReady = false
        this.collection.setPageSizeLimit(pageSize)
        await this.collection.loadActiveItemCollection()
        this.leafletMap.updateCollectionItems(this.items)
        this.dataReady = true
      }
    }
  }
}

</script>