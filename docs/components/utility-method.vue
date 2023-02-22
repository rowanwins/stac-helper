<template>
  <div class="method" :id="method.name">
    <h2>{{method.name}}</h2>
    <p>{{method.description}}</p>

    <h3 style="margin-top: 30px">Arguments</h3>
    <ParametersTable :row-data="method.params"/>

    <h3 style="margin-top: 30px">Returns</h3>
    <p v-html="method.returns"></p>

  </div>
</template>

<script>
  import ParametersTable from './parameters-table.vue'

  export default {
    name: 'UtilityMethod',
    props: ['method'],
    components: {
      ParametersTable
    }
  }
  </script>

  <style>
    .method {
      padding: 24px;
      background: #F6F7F8;
      margin-bottom: 48px;
      border: 2px solid #e9e9e9;
      transition: 1s;
    }

    .methodHighlight {
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      transition: 1s;
    }
  </style>