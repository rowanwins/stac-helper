<template>
  <ATable
    :dataSource="assetsAsArray"
    :columns="columns"
    rowKey="id"
    size="small"
    class="ant-table-striped assetTable"
    :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
    :pagination="false"
    :showHeader="false"
  >
    <template #bodyCell="{ column, record }">

      <template v-if="column.key === 'title'">
        <span class="assetTitle">{{record.title ? record.title : record.key}}</span>
      </template>

      <template v-if="column.key === 'operation'">
        <AButton type="primary" shape="circle" ghost @click="downloadAsset(record)">
          <template #icon>
            <download-outlined />
          </template>
        </AButton>
      </template>

      <template v-if="column.key === 'roles'">
          <ATag v-for="role in record.roles">
            {{role}}
          </ATag>
      </template>

    </template>

    <template #expandedRowRender="{ record }">
      <div style="padding: 20px">
        <AssetMetadata :asset="record"/>
      </div>
    </template>
  </ATable>
</template>

<script>
import {DownloadOutlined} from '@ant-design/icons-vue'
import AssetMetadata from '@/components/AssetMetadata.vue'

export default {
  name: 'AssetTable',
  props: ['assets'],
  data () {
    return {
      columns: [
          {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
          },
          {
            title: 'Roles',
            key: 'roles',
            align: 'right',
            width: 100
          },
          {
            title: '',
            key: 'operation',
            align: 'right',
            width: 50
          }
        ]
    }
  },
  components: {
    AssetMetadata,
    DownloadOutlined
  },
  computed: {
    assetsAsArray () {
      const arr = Object.values(this.assets)
      const keys = Object.keys(this.assets)
      arr.forEach((a, i) => {
        a.key = keys[i]
        a.id = i
      })
      return arr
    }
  },
  methods: {
    async downloadAsset (asset) {
      const response = await fetch(asset.href, {
        method: 'GET',
      })
      const data = await response.blob()

      const fileURL = window.URL.createObjectURL(new Blob([data]))
      const fileLink = document.createElement('a')
      fileLink.href = fileURL
      const pathParts = asset.href.split('/')
      fileLink.setAttribute('download', pathParts[pathParts.length - 1])
      document.body.appendChild(fileLink)
      fileLink.click()
    }
  }
}
</script>

<style lang="less">
.assetTable {
  .assetTitle {
    line-break: normal;
  }
}
</style>
