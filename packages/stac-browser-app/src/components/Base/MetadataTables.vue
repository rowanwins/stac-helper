<template>
  <div class="metadataTables">
    <div class="metadataSection" v-for="group in groupsWithPropertiesAsArray">
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
      >
        <template #bodyCell="{ column, record }">

          <template v-if="column.key === 'label'">
            <div v-html="record.label" style="font-weight: 500;"></div>
          </template>
          <template v-if="column.key === 'formattedValue'">
            <div v-html="record.formatted"></div>
          </template>

        </template>

      </ATable>
    </div>
  </div>
  
</template>

<script>
import StacFields from '@radiantearth/stac-fields'

export default {
  name: 'MetadataTables',
  props: ['groups'],
  data () {
    return {
      columns: [
          {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            width: '30%',
            align: 'right'
          },
          {
            title: 'Value',
            dataIndex: 'formatted',
            key: 'formattedValue'
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
    } else if (this.asset) {
      this.groups = StacFields.formatAsset(this.asset, null)
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


.metadataSection:not(:last-child) {
  margin-bottom: 30px;  
}

.metadataTable {
  td {
    vertical-align: top;
  }
  ol, ul {
    padding-left: 16px;
  }
  dl {
    display: grid;
    grid-template-columns: max-content auto;
  }

  dt {
    grid-column-start: 1;
    margin-right: 12px;
  }

  dd {
    grid-column-start: 2;
  }
}
</style>