<template>
  <ARow
    type="flex"
    style="margin-bottom: 20px;"
    class="cardStyleSlimPadding"
  >
    <ACol :span="24">
      <ARow @click="toggleShowFilter" class="filterTitleRow">
        <ACol flex="30px">
          <PlusCircleFilled v-if="!showFilter"/>
          <MinusCircleFilled v-else />
        </ACol>
        <ACol flex="auto">
          <p style="margin-bottom: 0px;">FILTERS</p>
        </ACol>
        <ACol flex="200px">
          <p style="margin-bottom: 0px; float:right;">{{numberSearchItemsText}}</p>
        </ACol>
      </ARow>
      <div v-show="showFilter">
        <ARow
          style="margin-top: 10px"
        >
          <ACol :span="15">
              <ARow style="margin-bottom: 4px; width: 100%;">
                <AButton
                  @click.stop="startRectangle"
                  block
                  >
                  <gateway-outlined />
                  Draw Area of Interest
                  <CheckCircleOutlined v-if="bboxIsSet" style="color:#08b2ad;"/>
                </AButton>
              </ARow>
              <ARow style="margin-bottom: 4px; width: 100%;">
                <ARangePicker
                  v-model:value="searchFilter.standardFilter.datetime"
                  :disabled-date="disabledDate"
                  style="width: 100%;"
                />
              </ARow>
          </ACol>

            <ACol :span="8" :offset="1">
              <ARow style="margin-bottom: 4px; width: 100%; float: right;">
                <AButton
                  block
                  @click="filter"
                  :disabled="!anyFilterPropertiesSet || applyingFilter"
                  type="primary"
                >
                  <template #icon>
                    <SyncOutlined spin v-if="applyingFilter"/>
                    <CheckCircleOutlined v-if="collectionIsFiltered"/>
                  </template>
                  Apply Filters
                </AButton>
              </ARow>
              <ARow style="float: right; width: 100%;">
                <AButton
                  block
                  @click="reset"
                  :disabled="!anyFilterPropertiesSet || applyingFilter"
                  ghost
                  type="primary"
                >
                  Clear
                </AButton>
              </ARow>
            </ACol>
        </ARow>

        <ARow style="width: 100%; margin-top: 8px;" v-if="queryables.length > 0">

          <QueryableInput 
            v-for="(userAddedQueryable, index) in searchFilter.standardFilter.filters"
            :key="index"
            :queryable="userAddedQueryable"
            :queryable-index="index"
            @remove-filter="removeFilter"
          />

          <a-popover placement="bottomLeft" trigger="click" v-model:visible="addQueryableVisible">
            <template #content>
              <div class="queryablesList">
                <p :key="queryable.titleOrId" v-for="queryable in queryables" @click="addQueryable(queryable)">
                  {{queryable.titleOrId}} <span class="inputType">| {{queryable.inputType}}</span>
                </p>                    
              </div>
            </template>

            <ATag @click="addQueryableVisible = true" class="addQueryableTag">
              <plus-outlined />
              Add More Filters
            </ATag>
          </a-popover>
        </ARow>
      </div>
    </ACol>
  </ARow>
</template>

<script>
import {
  PlusCircleFilled,
  PlusOutlined,
  MinusCircleFilled,
  DownOutlined,
  GatewayOutlined,
  SyncOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import calcBbox from '@turf/bbox'
import dayjs from 'dayjs'
import QueryableInput from '@/components/QueryableInput.vue'

export default {
  name: 'ItemsFilter',
  components: {
    PlusCircleFilled,
    PlusOutlined,
    MinusCircleFilled,
    GatewayOutlined,
    SyncOutlined,
    DownOutlined,
    CheckCircleOutlined,
    QueryableInput
},
  props: [
    'leafletMap',
    'applyingFilter',
    'collectionOrFilteredCollection',
    'originalCollection'
  ],
  data () {
    return {
      showFilter: false,
      addQueryableVisible: false
    }
  },
  computed: {
    queryables () {
        if (this.originalCollection === null) return []
        return this.originalCollection.queryablesArray        
    },
    searchFilter () {
      return this.$store.state.searchFilter
    },
    bboxIsSet () {
      return this.searchFilter.standardFilter.bbox !== null
    },
    collection () {
      if (this.$store.getters.selectedStacType !== 'Collection') return null
      return this.$store.getters.selectedStac
    },
    searchItemCount () {
      if (!this.collectionIsFiltered) return null
      if (this.originalCollection) return this.collectionOrFilteredCollection.numberOfItems
      return null
    },
    numberSearchItemsText () {
      if (this.collectionOrFilteredCollection === null || this.searchItemCount === null) return ''
      return `${this.searchItemCount.toLocaleString()} items matched `
    },
    anyFilterPropertiesSet () {
      return this.searchFilter.anyFilterPropertiesSet
    },
    numberFilterPropertiesSet () {
      return this.searchFilter.numberFilterPropertiesSet
    },
    searchCollection () {
      return this.$store.state.searchCollection
    },
    collectionIsFiltered () {
      return this.$store.getters.collectionIsFiltered
    }
  },
  emits: ['filter', 'filter-cleared', 'start-rectangle-draw', 'finish-rectangle-draw'],
  methods: {
    disabledDate (date) {
      if (this.originalCollection.dates[0] !== null) {
        const startDate = dayjs(this.originalCollection.dates[0])
        if (date.isBefore(startDate)) return true
      }        
      if (this.originalCollection.dates[1] !== null) {
        const endDate = dayjs(this.originalCollection.dates[1])
        if (date.isAfter(endDate)) return true
      }
      return false
    },
    removeFilter (queryableIndex) {
      this.searchFilter.standardFilter.filters.splice(queryableIndex, 1)
    },
    addQueryable (queryable) {
      this.searchFilter.standardFilter.filters.push({
        value: null,
        operator: null,
        queryable
      })
      this.addQueryableVisible = false
    },
    toggleShowFilter() {
      this.showFilter = !this.showFilter;
    },
    async startRectangle () {
      this.$emit('start-rectangle-draw')
      this.leafletMap.clearDrawnLayers()
      this.leafletMap.startRectangeDraw()
      const rectangleGeojson = await this.leafletMap.awaitDrawnRectangle()
      this.searchFilter.standardFilter.bbox = calcBbox(rectangleGeojson)
      this.$emit('finish-rectangle-draw')
    },
    filter () {
      this.$emit('filter', this.searchFilter.standardFilter)
    },
    reset () {
      this.searchFilter.clearFilters()
      this.leafletMap.clearDrawnLayers()
      if (this.searchCollection) {
        this.$store.commit('setSearchCollection', null)
        this.$store.commit('setPageResultsIndex', 1)
        this.$emit('filter-cleared')
      }
    }
  }
}
</script>

<style lang="less">
  @import '@/styles/theme.less';

.filterTitleRow{
  :hover {
    cursor: pointer;
  }
}

.addQueryableTag {
  cursor: pointer;
  transition: 0.1s;
  background-color: #28576a;
  color: white;
  &:hover {
    background-color: #1b485a;
  }
}

.queryablesList {
  p {
    margin: 2px 0px;
    cursor: pointer;
    color: @grey-800;
    &:hover {
      color: @grey-900;
      .inputType {
        color: @grey-800;
      }
    }
  }
  .inputType {
    font-size: 0.8rem;
    margin-left: 10px;
    color: @grey-500;
  }
}
</style>