<template>
  <div>
    <ItemsFilter
      :leaflet-map="leafletMap"
      :applying-filter="applyingFilter"
      @start-rectangle-draw="$emit('start-rectangle-draw')"
      @finish-rectangle-draw="$emit('finish-rectangle-draw')"
      @filter="$emit('filter', $event)"
      @filter-cleared="$emit('filter-cleared')"
    /> 

    <ARow type="flex" align="middle" style="margin-bottom: 20px;">
      <ACol :span="24">
        <div style="float:right;">
          <span style="margin-right: 10px;">Page Size</span>
          <ASelect
            size="small"
            :value="pageSize"
            style="width: 55px; margin-right: 10px;"
            @change="setPageSize"
            :disabled="itemsLength < pageSize"
            :options="pageSizeOptions"
          />
          <AButton
            size="small"
            type="primary"
            ghost
            style="margin-right: 10px;"
            :disabled="pageIndex === 1 || loadingItems || itemsLength < pageSize"
            @click="getPrevPage"
          >
            <left-outlined />
            Prev Page
          </AButton>
          <AButton
            size="small"
            type="primary"
            ghost
            :disabled="loadingItems || itemsLength < pageSize"
            @click="getNextPage"
          >
            Next Page
            <right-outlined />
          </AButton>
        </div>
      </ACol>
    </ARow>

    <div v-if="items && itemsLength > 0 && !loadingItems">
      <ListItems
        :items="items"
        @set-selected-item="$emit('set-selected-item', $event)"
        @item-mouse-over="$emit('item-mouse-over', $event)"
        @item-mouse-out="$emit('item-mouse-out')"/>
    </div>
    <ARow v-if="loadingItems" >
      <ASkeleton active/>
    </ARow>
  </div>
</template>

<script>
import {LeftOutlined, RightOutlined} from '@ant-design/icons-vue'
import ItemsFilter from './ItemsFilter.vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import ListItems from './ListItems.vue'
dayjs.extend(utc)

export default {
  name: 'CollectionItems',
  props: ['collectionOrFilteredCollection', 'items', 'loadingItems', 'leafletMap', 'applyingFilter'],
  components: {
    LeftOutlined,
    RightOutlined,
    ItemsFilter,
    ListItems
  },
  data () {
    return {
      pageSize: 12,
      pageSizeOptions: [{label: '12', value: 12}, {label: '24', value: 24}, {label: '48', value: 48}]
    }
  },
  computed: {
    itemsLength () {
      if (this.items === null) return 0
      return this.items.length
    },
    pageIndex () {
      return this.$store.state.pageResultsIndex
    }
  },
  emits: [
    'set-item-data-loading',
    'item-page-changed',
    'item-mouse-over',
    'item-mouse-out',
    'filter',
    'filter-cleared',
    'set-page-size',
    'set-selected-item',
    'start-rectangle-draw',
    'finish-rectangle-draw'
  ],
  methods: {
    formatDateTime (d) {
      return dayjs(d).utc().format('DD MMM YYYY HH:mm:ss')
    },
    setPageSize (pageSize) {
      this.pageSize = pageSize
      this.$emit('set-page-size', pageSize)
    },
    async getNextPage () {
      const newPageIndex = this.pageIndex + 1
      const existingItems = this.collectionOrFilteredCollection.getPageOfItemsByIndex(newPageIndex)
      if (!existingItems) {
        this.$emit('set-item-data-loading',true)
        await this.collectionOrFilteredCollection.getNextPageOfCollectionItems()
        this.$emit('set-item-data-loading', false)
      }
      this.$store.commit('setPageResultsIndex', newPageIndex)
      this.$emit('item-page-changed')
    },
    getPrevPage () {
      this.$store.commit('setPageResultsIndex', this.pageIndex - 1)
      this.$emit('item-page-changed')
    },
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/colors.less';

.cardStyle:hover {
    background: @grey-200;
    border-color: @grey-300;
}
</style>