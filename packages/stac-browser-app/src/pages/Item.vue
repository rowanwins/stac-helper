<template>
    <MainLayout id="collectionsPage">

      <template #first-col-content>
        <CollectionOverview v-if="parentType === 'Collection'" :collection="parent"/>
        <CatalogOverview v-else-if="parentType === 'Catalog'" :catalog="parent"/>

        <AButton type="primary" ghost style="margin-top: 20px;" @click="backToParent">
          <template #icon><ArrowLeftOutlined /></template>
          Back to {{parentType}}
        </AButton>
      </template>

      <template #second-col-content>
        <Item :item="item"/>
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
import CatalogOverview from '@/components/CatalogOverview.vue'
import Item from '@/components/Item.vue'
import LeafletMap from '@/components/LeafletMap.vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'

export default {
  name: 'ItemPage',
  components: {
    MainLayout,
    CollectionOverview,
    CatalogOverview,
    Item,
    LeafletMap,
    ArrowLeftOutlined
  },
  computed: {
    parent () {
      return this.item.parent
    },
    parentType () {
      if (this.parent === null) return null
      return this.parent.stacType
    },
    item () {
      return this.$store.getters.selectedStac
    }
  },

  methods: {
    backToParent () {
      const parentUrl = this.parent.linkToSelf
      this.$store.dispatch('addOrSelectStacReferenceInStore', this.parent)
      this.$router.push(`/external/${parentUrl}`)
    },
    mapIsReady (LeafletMap) {
      this.LeafletMap = LeafletMap
      if (this.item !== undefined) this.addItemThingsToMap()
    },
    async addItemThingsToMap () {
      this.LeafletMap.fitToBounds(this.item.bbox)
      this.LeafletMap.addCollectionItemOutline(this.item.rawJson)
      if (this.item.overviewUrl) this.LeafletMap.addCollectionItemOverviewAsset(this.item, this.errorLoadingOverview)
      else if (this.item.overviewUrl === null && this.item.thumbnailUrl) this.LeafletMap.addCollectionItemThumbnailAsset(this.item, this.errorLoadingOverview)
    },
    errorLoadingOverview () {
      this.LeafletMap.addCollectionItemThumbnailAsset(this.item)
    }
  }
}

</script>