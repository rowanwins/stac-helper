<template>
  <ARow
    type="flex"
    align="middle"
    style="margin-bottom: 20px;"
    class="cardStyleSlimPadding"
  >
    <ACol flex="0 0 60px">
      <p class="filterLabel">Filter</p>
    </ACol>
    <ACol flex="auto">
      <AInput v-model:value="value" @change="filter"/>
    </ACol>

  </ARow>
</template>

<script>

export default {
  name: 'SimpleListFilter',
  data () {
    return {
      value: ''
    }
  },
  emits: ['filter-changed'],
  methods: {
    filter () {
      this.$emit('filter-changed', this.value)
    }
  }
}
</script>

<style lang="less">
@import '@/styles/colors.less';

  .filterLabel {
    font-size: 0.8rem;
    text-transform: uppercase;
    font-weight: 700;
    color: @grey-800;
    margin-bottom: 0px;
  }
</style>