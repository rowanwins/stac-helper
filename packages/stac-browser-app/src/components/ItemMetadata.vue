<template>
  <div v-for="group in groupsWithPropertiesAsArray">
    <h4 class="metadataGroupHeading">{{group.label === '' ? 'General' : group.label}}</h4>
    <ATable
      :dataSource="group.properties"
      :columns="columns"
      rowKey="label"
      size="small"
      class="ant-table-striped metadataTable"
      :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      :showHeader="false"
      :pagination="false"
      style="margin-bottom: 30px;"
    >
      <template #header="{ record }">
        <div v-html="record.label" style="font-weight: 500;"></div>
      </template>
      <template #value="{ record }">
        <div v-html="record.formatted"></div>
      </template>
    </ATable>
  </div>
</template>

<script>
import StacFields from '@radiantearth/stac-fields'

export default {
  name: 'ItemMetadata',
  props: ['item', 'collection'],
  data () {
    return {
      groups: [],
      columns: [
          {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            width: '30%',
            align: 'right',
            slots: { customRender: 'header' }
          },
          {
            title: 'Value',
            dataIndex: 'formatted',
            key: 'formatted',
            slots: { customRender: 'value' }
          }
      ]
    }
  },
  computed: {
    groupsWithPropertiesAsArray () {
      return this.groups.map(g => {
        return {
          label: g.label,
          properties: Object.values(g.properties)
        }
      })
    }
  },
  mounted () {
    if (this.item) {
      this.groups = StacFields.formatItemProperties(this.item) 
    } else if (this.collection) {
      this.groups = [
        ...StacFields.formatSummaries(this.collection),
        ...StacFields.formatCollection(this.collection, key => key.indexOf(':') > -1)
      ]
    }
  }

}
</script>

<style lang="less">
.metadataGroupHeading {
  text-transform: uppercase;
  border-bottom: 2px solid #0f354249;
  padding-bottom: 4px;
}

.metadataTable {
  td {
    vertical-align: top;
  }
  ol, ul {
    padding-left: 16px;
  }
  dt {
    display: inline;
  }
}
</style>