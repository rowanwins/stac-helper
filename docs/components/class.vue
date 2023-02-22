<template>

  <h2>{{details.name}} Class</h2>
  <p v-html="details.description"></p>

  <h3 style="margin-top: 30px">Constructor Arguments</h3>
  <ParametersTable :row-data="arguments"/>

  <h3 style="margin-top: 30px">Properties</h3>
  <MethodsTable :row-data="properties" />


  <h3 style="margin-top: 30px">Methods</h3>
  <MethodsTable :row-data="methods" />
</template>

<script>
import MethodsTable from './methods-table.vue'
import ParametersTable from './parameters-table.vue'

export default {
  name: 'ClassDoco',
  props: ['details'],
  components: {
    MethodsTable,
    ParametersTable
  },
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
}
</script>

<style>

  </style>