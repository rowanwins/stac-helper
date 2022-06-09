<template>
  <ARow
    v-for="item in items"
    :key="item.id"
    @mouseover="$emit('item-mouse-over', item)"
    @mouseout="$emit('item-mouse-out')"
    class="cardStyle"
    type="flex"
    style="flex-wrap: nowrap; margin-bottom: 10px;"
  >
    <ACol
      flex="0 0 80px"
      v-if="itemHasUsableThumbnail(item)"
    >
      <img
        :src="itemUsableThumbnail(item)" 
        style="height: 50px;"
      />
    </ACol>
    <ACol flex="0 0 auto">
      <p 
        style="font-weight: 500; margin-bottom: 5px; cursor: pointer;"
        @click="$emit('set-selected-item', item)"
      >
        {{item.id}}
      </p>
      <p style="font-size: 0.8rem; margin-bottom: 0px;">
        {{formatDateTime(item)}} UTC
      </p>            
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
  emits: ['set-selected-item', 'item-mouse-over', 'item-mouse-out'],
  methods: {
    formatDateTime (item) {
      function format (d) {
        return dayjs(d).utc().format('DD MMM YYYY HH:mm:ss')
      }
      if (item.datetime === null && item.datetimeRange === null) return 'N/A'
      if (item.datetimeRange !== null) return `${format(item.datetimeRange[0])} to ${format(item.datetimeRange[1])}`
      if (item.datetime !== null) return format(item.datetime)
      return 'N/A'
    },
    itemHasUsableThumbnail (item) {
      return item.validHttpThumbnailUrl !== null || item.validHttpOverviewUrl !== null
    },
    itemUsableThumbnail (item) {
      return item.validHttpThumbnailUrl !== null ? item.validHttpThumbnailUrl : item.validHttpOverviewUrl
    }
  }
}
</script>