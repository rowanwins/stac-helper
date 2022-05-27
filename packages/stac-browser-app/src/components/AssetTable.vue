<template>
  <ATable
    :dataSource="assetsAsArray"
    :columns="columns"
    rowKey="title"
    size="small"
    class="ant-table-striped"
    :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
    :pagination="false"
    :showHeader="false"
  />
</template>

<script>

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
          }
        ]
    }
  },
  computed: {
    assetsAsArray () {
      return Object.values(this.assets)
    }
  }
}
</script>