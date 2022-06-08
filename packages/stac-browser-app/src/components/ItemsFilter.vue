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

      <ARow
        v-show="showFilter"
        style="margin-top: 10px"
      >
         <ACol :span="18">
            <ARow style="margin-bottom: 4px;">
              <AButton @click.stop="startRectangle" style="width: 220px">
                <gateway-outlined />
                Draw Area of Interest
                </AButton>
            </ARow>
            <ARow>
              <ARangePicker v-model:value="standardFilters.datetime" style="width: 220px"/>
            </ARow>
         </ACol>

          <ACol :span="6">
            <ARow style="margin-bottom: 4px; float: right;">
              <AButton
                style="width: 140px;"
                @click="filter"
                :disabled="!anyFilterPropertiesSet || applyingFilter"
                type="primary"
              >
                <template #icon>
                  <SyncOutlined spin v-if="applyingFilter"/>
                </template>
                Apply Filters
              </AButton>
            </ARow>
            <ARow style="float: right;">
              <AButton
                style="width: 140px;"
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
    </ACol>
  </ARow>
</template>

<script>
import {PlusCircleFilled,MinusCircleFilled, GatewayOutlined, SyncOutlined} from '@ant-design/icons-vue'
import calcBbox from '@turf/bbox'
import equal from 'deep-eql'

export default {
  name: 'ItemsFilter',
  components: {
    PlusCircleFilled,
    MinusCircleFilled,
    GatewayOutlined,
    SyncOutlined
  },
  props: ['leafletMap', 'applyingFilter'],
  data () {
    return {
      showFilter: false,
      standardFilters: this.defaultFilter()
    }
  },
  computed: {
    searchCollection () {
      return this.$store.state.searchCollection
    },
    searchItemCount () {
      if (this.searchCollection) return this.searchCollection.numberOfItems
      return null
    },
    numberSearchItemsText () {
      if (this.searchCollection === null || this.searchItemCount === null) return ''
      return `${this.searchItemCount.toLocaleString()} items matched `
    },
    anyFilterPropertiesSet () {
      return !equal(this.standardFilters, this.defaultFilter()) 
    },
    numberFilterPropertiesSet () {
      const defaultFilter = this.defaultFilter()
      let count = 0
      for (const [key, value] of Object.entries(this.standardFilters)) {
        if (!equal(value, defaultFilter[key])) count++
      }
      return count
    }
  },
  emits: ['filter', 'clear-filter', 'start-rectangle-draw', 'finish-rectangle-draw'],
  methods: {
    defaultFilter () {
      return {
        bbox: null,
        datetime: []
      }
    },
    toggleShowFilter() {
      this.showFilter = !this.showFilter;
    },
    async startRectangle () {
      this.$emit('start-rectangle-draw')
      this.leafletMap.clearDrawnLayers()
      this.leafletMap.startRectangeDraw()
      const rectangleGeojson = await this.leafletMap.awaitDrawnRectangle()
      this.standardFilters.bbox = calcBbox(rectangleGeojson)
      this.$emit('finish-rectangle-draw')
    },
    filter () {
      this.$emit('filter', this.standardFilters)
    },
    reset () {
      this.standardFilters = this.defaultFilter()
      this.leafletMap.clearDrawnLayers()
      if (this.searchCollection) this.$emit('clear-filter')
    }
  }
}
</script>

<style lang="less">
.filterTitleRow{
  :hover {
    cursor: pointer;
  }
}
</style>