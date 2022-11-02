<template>

  <h2>{{details.name}} Class</h2>
  <p v-html="details.description"></p>

  <h3 style="margin-top: 30px">Usage</h3>

  <pre class="codeFormatting">
<code>  import {Catalog} from 'stac-helper'
  
  const catalog = new Catalog({})
</code></pre>

  <h3 style="margin-top: 30px">Constructor Arguments</h3>
  <ATable class="ant-table-striped" :data-source="arguments" :columns="constructorColumns" :pagination="false"
    :row-class="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" size="small">
    <template #bodyCell="{ column, record }">
      <span v-html="record[column.key]"></span>
    </template>
  </ATable>

  <h3 style="margin-top: 30px">Properties</h3>

  <ATable class="ant-table-striped" :data-source="properties" :columns="methodColumns" :pagination="false"
    :row-class="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" size="small">
    <template #bodyCell="{ column, record }">
      <span v-html="record[column.key]"></span>
    </template>
  </ATable>

  <h3 style="margin-top: 30px">Methods</h3>

  <ATable class="ant-table-striped" :data-source="methods" :columns="methodColumns" :pagination="false"
    :row-class="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" size="small">
    <template #bodyCell="{ column, record }">
      <span v-html="record[column.key]"></span>
    </template>
  </ATable>
</template>

<script>

export default {
  name: 'ClassDoco',
  props: ['details'],
  computed: {
    properties() {
      return this.details.properties
    },
    methods() {
      return this.details.methods
    },
    arguments () {
      return this.details.params
    }
  },
  data() {
    return {
      constructorColumns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          width: 250
        },
        {
          title: 'Type',
          dataIndex: 'type',
          key: 'type',
        },
        {
          title: 'Default',
          dataIndex: 'default',
          key: 'default',
        },
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
        }
      ],
      methodColumns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          width: 250
        },
        {
          title: 'Returns',
          dataIndex: 'returns',
          key: 'returns',
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

<style>
  .codeFormatting {
    padding: 12px;
    background-color: #f6f6f6;
    border: 4px solid #c8c8c8;
    width: 100%;
    min-width: 100%;
    margin-top: 24px;
    overflow: auto;
  }
  </style>