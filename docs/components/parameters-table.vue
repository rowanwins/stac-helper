<template>
    <ATable class="ant-table-striped" :data-source="rowData" :columns="columns" :pagination="false"
    :row-class="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" size="small">
    <template #bodyCell="{ column, record }">
      <span v-html="record[column.key]"></span>
    </template>
  </ATable>

</template>

<script>

  export default {
    name: 'ParametersTable',
    props: ['rowData'],
    data() {
      return {
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200
          },
          {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 150
          },
          {
            title: 'Default',
            dataIndex: 'default',
            key: 'default',
            width: 100
          },
          {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
          }
        ]
      }
    }
  }
  </script>
  