<template>
  <ARow
    v-for="item in items"
    :key="item.id"
    @mouseover="highlightItem(item)"
    @mouseout="removeHighlight"
    class="cardStyle"
    type="flex"
    style="flex-wrap: nowrap; margin-bottom: 10px;"
  >
    <ACol flex="0 0 80px" v-if="item.thumbnailUrl !== null && item.thumbnailUrl.indexOf('s3:') === -1 || item.overviewUrl !== null ">
      <img :src="item.thumbnailUrl  ? item.thumbnailUrl : item.overviewUrl" style="height: 50px;"/>
    </ACol>
    <ACol flex="0 0 auto">
      <p style="font-weight: 500; margin-bottom: 5px; cursor: pointer;" @click="selectItem(item)">{{item.id}}</p>
      <p style="font-size: 0.8rem; margin-bottom: 0px;">{{formatDateTime(item.datetime)}} UTC</p>            
    </ACol>
  </ARow>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export default {
  name: 'ListOfItems',
  props: ['items'],
  emits: ['set-selected-item', 'highlight-item', 'remove-highlight'],
  methods: {
    highlightItem (item) {
      this.$emit('highlight-item', item)
    },
    removeHighlight () {
      this.$emit('remove-highlight')
    },
    formatDateTime (d) {
      return dayjs(d).utc().format('DD MMM YYYY HH:mm:ss')
    },
    selectItem (item) {
      this.$emit('set-selected-item', item)
    }
  }
}
</script>