<template>
  <div v-if="items">

    <ItemsFilter
      :leaflet-map="leafletMap"
      @filter="filterCalled"
      @clear-filter="clearFilter"
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
            :options="pageSizeOptions"
          />
          <AButton size="small" type="primary" ghost style="margin-right: 10px;" :disabled="pageIndex === 1 || loadingItems" @click="getPrevPage">
            <left-outlined />
            Prev Page
          </AButton>
          <AButton size="small" type="primary" ghost :disabled="loadingItems" @click="getNextPage">
            Next Page
            <right-outlined />
          </AButton>
        </div>
      </ACol>
    </ARow>


    <div v-if="items.length > 0 && !loadingItems">
      <ListItems :items="items" @set-selected-item="selectItem" @highlight-item="highlightItem" @remove-highlight="removeHighlightItem"/>
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
  props: ['items', 'pageIndex', 'loadingItems', 'leafletMap'],
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
  emits: ['get-next-page', 'get-prev-page', 'filter', 'clear-filter', 'set-page-size', 'set-selected-item'],
  methods: {
    formatDateTime (d) {
      return dayjs(d).utc().format('DD MMM YYYY HH:mm:ss')
    },
    clearFilter () {
      this.$emit('clear-filter')
    },
    filterCalled (filter) {
      this.$emit('filter', filter)
    },
    selectItem (item) {
      this.$emit('set-selected-item', item)
    },
    setPageSize (pageSize) {
      this.pageSize = pageSize
      this.$emit('set-page-size', pageSize)
    },
    getNextPage () {
      this.$emit('get-next-page')
    },
    getPrevPage () {
      this.$emit('get-prev-page')
    },
    highlightItem (item) {
      this.leafletMap.highlightCollectionItem(item.rawJson)
    },
    removeHighlightItem () {
      this.leafletMap.clearHighlightLayer()
    }
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