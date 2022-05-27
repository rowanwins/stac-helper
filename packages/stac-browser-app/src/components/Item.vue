<template>
  <div v-if="item !== undefined">
    <ARow type="flex" align="middle" style="margin-bottom: 20px;">
        <ACol :span="8">
          <h2>Item</h2>
        </ACol>
      </ARow>

      <div class="cardStyle" style="margin-bottom: 20px;">
        <p style="margin-bottom: 0px;">ID: {{item.id}}</p>
      </div>

      <ATabs v-model:activeKey="activeTab" :animated="false">
        <ATabPane key="metadata" tab="Metadata" class="cardStyleLight">
          <ItemMetadata :item="item.rawJson"/>
        </ATabPane>
        <ATabPane key="assets" tab="Assets" class="cardStyleLight">
          <AssetTable :assets="item.rawJson.assets"/>
        </ATabPane>
        <ATabPane key="links" tab="Links" class="cardStyleLight">
          <ItemLinks :item="item.rawJson"/>
        </ATabPane>
      </ATabs>
  </div>
</template>

<script>
import {LeftOutlined} from '@ant-design/icons-vue'
import AssetTable from './AssetTable.vue'
import ItemMetadata from './ItemMetadata.vue'
import ItemLinks from './ItemLinks.vue'

export default {
  name: 'Item',
  components: {
    LeftOutlined,
    AssetTable,
    ItemMetadata,
    ItemLinks
},
  props: ['item'],
  data () {
    return {
      activeTab: 'metadata'
    }
  }
}
</script>

<style lang="less">

</style>