<template>
    <TwoColLayout id="catalogPage" v-if="isCatalogReady">

      <template #first-col-content>
        <CatalogOverview :catalog="catalog"/>
        <AButton type="primary" ghost style="margin-top: 20px;" @click="backToParentOrExternalCatalogs">
          <template #icon><ArrowLeftOutlined /></template>
            {{backButtonText}}
        </AButton>
      </template>

      <template #second-col-content>

        <ATabs v-model:activeKey="activeTab" :animated="false">
          <ATabPane key="collections" tab="Collections" class="cardStyleLight">
              <ListCollections :collections="catalog.collections" @set-selected-collection="selectCollection"/>
          </ATabPane>

          <ATabPane key="catalogs" tab="Catalogs" class="cardStyleLight">
              <ListCatalogs :catalogs="catalog.catalogs" @set-selected-catalog="selectCatalog"/>
          </ATabPane>

          <ATabPane key="items" tab="Items" class="cardStyleLight">
            <ListItems :items="catalog.items" @set-selected-item="selectItem"/>
          </ATabPane>
        </ATabs>

      </template>
    </TwoColLayout>
</template>

<script>
import TwoColLayout from '@/layouts/TwoColLayout.vue'
import CatalogOverview from '@/components/CatalogOverview.vue'
import ListCatalogs from '@/components/ListCatalogs.vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import ListCollections from '@/components/ListCollections.vue'

export default {
  name: 'Catalog',
  components: {
    TwoColLayout,
    CatalogOverview,
    ArrowLeftOutlined,
    ListCatalogs,
    ListCollections
},
  data () {
    return {
      dataReady: false,
      activeTab: 'collections'
    }
  },
  computed: {
    catalogLength () {
      if (this.dataReady) return `(${this.catalog.collections.length})`
      return 
    },
    isCatalogReady () {
      return this.catalog !== undefined
    },
    catalog () {
      return this.$store.getters.selectedStac
    },
    parent () {
      return this.$store.getters.selectedStac.parent
    },
    parentType () {
      if (!this.catalog.hasParent || this.parent === null) return null
      return this.$store.getters.selectedStac.parent.stacType
    },
    backButtonText () {
      return this.parentType !== null ? `Back to ${this.parentType}` : 'Back to catalogs list'
    }
  },
  async mounted () {
    if (this.catalog.items.length === 0 && this.catalog.collections.length === 0 && this.catalog.catalogs.length === 0) {
      await this.catalog.loadChildren()
    } 
    this.dataReady = true
  },
  methods: {
    backToParentOrExternalCatalogs () {
      if (this.parentType !== null) {
        if (this.parentType === 'Catalog') this.selectCatalog(this.catalog.parent)
        if (this.parentType === 'Collection') this.selectCollection(this.catalog.parent)
      } else this.$router.push({name: 'external-catalogs'})
    },
    async selectCollection (collection) {
      const collectionUrl = collection.linkToSelf
      await this.$store.dispatch('addThingToStoreAndSetAsSelected', collection)
      this.$router.push(`/external/${collectionUrl}`)
    },
    async selectCatalog (catalog) {
      const catalogUrl = catalog.linkToSelf
      await this.$store.dispatch('addThingToStoreAndSetAsSelected', catalog)
      if (catalog.collections.length === 0 && catalog.catalogs.length > 0) {
        this.activeTab = 'catalogs'
      } else if (catalog.collections.length > 0 && catalog.catalogs.length === 0) {
        this.activeTab = 'collections'
      }
      this.$router.push(`/external/${catalogUrl}`)
    },
    async selectItem (item) {
      const stacUrl = item.linkToSelf
      await this.$store.dispatch('addThingToStoreAndSetAsSelected', item)
      this.$router.push(`/external/${stacUrl}`)
    }
  }
}

</script>

<style lang="less">

</style>