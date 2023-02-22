<template>

  <ATable class="ant-table-striped" :data-source="rowData" :columns="methodColumns" :pagination="false"
    :row-class="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" size="small">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
          <div v-if="'arguments' in record" >
            <div v-if="record.arguments.length === 0">{{ record.name }}()</div>
            <div style="display: inline-block;" v-else>{{ record.name }}(
              <span v-for="(argument, idx) in record.arguments">
                <br/>&nbsp;	&nbsp;<span v-html="argument.type"></span>{{idx < record.arguments.length - 1 ? ',' : ''}}
              </span>
              <br/>)
            </div>            
          </div>
          <div v-else>
            {{ record.name }}
          </div>


      </template>
      <template v-else>
        <span v-html="record[column.key]"></span>
      </template>
    </template>
  </ATable>

</template>

<script>

export default {
  name: 'MethodsTable',
  props: ['rowData'],
  data() {
    return {
      methodColumns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          width: 200
        },
        {
          title: 'Returns',
          dataIndex: 'returns',
          key: 'returns',
          width: 250
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
