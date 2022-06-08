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

        <ATabs v-model:activeKey="activeTab" :animated="false" >
          <ATabPane key="collections" tab="Collections" class="cardStyleLight" :disabled="catalog.collections.length === 0">
              <ListCollections :collections="catalog.collections" @set-selected-collection="selectCollection"/>
              <ARow v-if="loadingChildren" >
                <ASkeleton active/>
              </ARow>
          </ATabPane>

          <ATabPane key="catalogs" tab="Catalogs" class="cardStyleLight" :disabled="catalog.catalogs.length === 0">
              <ListCatalogs :catalogs="catalog.catalogs" @set-selected-catalog="selectCatalog"/>
              <ARow v-if="loadingChildren" >
                <ASkeleton active/>
              </ARow>
          </ATabPane>

          <ATabPane key="items" tab="Items" class="cardStyleLight" :disabled="catalog.items.length === 0">
            <ListItems :items="catalog.items" @set-selected-item="selectItem"/>
            <ARow v-if="loadingChildren" >
              <ASkeleton active/>
            </ARow>
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
  props: {
    loadingChildren: {
      type: Boolean,
      default: false
    }
  },
  components: {
    TwoColLayout,
    CatalogOverview,
    ArrowLeftOutlined,
    ListCatalogs,
    ListCollections
  },
  data () {
    return {
      activeTab: 'collections'
    }
  },
  computed: {
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
      if (!this.catalog.hasParent || this.catalog.isRoot || this.parent === null) return null
      return this.$store.getters.selectedStac.parent.stacType
    },
    backButtonText () {
      return this.parentType !== null ? `Back to ${this.parentType}` : 'Back to catalogs list'
    }
  },
  watch: {
    // We watch the catalog in case we've navigated from 
    // one catalog to another nested catalog
    catalog: {
      handler () {
        if (this.catalog.collections.length === 0 && this.catalog.catalogs.length > 0) {
          this.activeTab = 'catalogs'
        } else if (this.catalog.collections.length > 0 && this.catalog.catalogs.length === 0) {
          this.activeTab = 'collections'
        }
      },
      immediate: true,
      deep: true
    }
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
      await this.$store.dispatch('addOrSelectStacReferenceInStore', collection)
      this.$router.push(`/external/${collectionUrl}`)
    },
    async selectCatalog (catalog) {
      const catalogUrl = catalog.linkToSelf
      await this.$store.dispatch('addOrSelectStacReferenceInStore', catalog)
      this.$router.push(`/external/${catalogUrl}`)
    },
    async selectItem (item) {
      const stacUrl = item.linkToSelf
      await this.$store.dispatch('addOrSelectStacReferenceInStore', item)
      this.$router.push(`/external/${stacUrl}`)
    }
  }
}

</script>

<style lang="less">

</style>