<template>
  <h2 style="margin-bottom: 20px;">Collection</h2>
  <div v-if="collection !== undefined" style="margin-bottom: 40px;">
    <h3 style="margin-bottom: 20px;">{{collection.titleOrId}}</h3>
    <p v-html="collection.descriptionAsHtml"></p>
    <div v-if="collection.rawJson">
      <a-tag v-for="keyword in collection.rawJson.keywords" style="margin-bottom: 5px;">{{keyword}}</a-tag>
    </div>
    
    <ARow style="margin-top: 20px;">
      <ACol :span="8">
        <strong>Item Count</strong>
      </ACol>
      <ACol :span="16">
        <p>{{numberOfItems}}</p>
      </ACol>
    </ARow>

    <ARow>
      <ACol :span="8">
        <strong>License</strong>
      </ACol>
      <ACol :span="16">
        <p v-if="licenseLink === null">Unknown</p>
        <p v-else-if="licenseLink.link">
          <a :href="licenseLink.link.href" target="_blank">{{licenseLink.licenseName}}</a>
        </p>
        <p v-else>{{licenseLink.licenseName}}</p>
      </ACol>
    </ARow>

    <ARow>
      <ACol :span="8">
        <strong>Temporal Extent</strong>
      </ACol>
      <ACol :span="16">
        <p>{{dates}}</p>
      </ACol>
    </ARow>

  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'CollectionOverview',
  props: ['collection'],
  watch: {
    async collection () {
      await this.collection.checkTotalNumberOfItems()
    }
  },
  computed: {
    numberOfItems () {
      if (this.collection === null || this.collection === undefined) return 'Unknown'
      return this.collection.numberOfItems === null ? 'Unknown' : `${this.collection.numberOfItems.toLocaleString()}`
    },
    dates () {
      if (this.collection.dates[0] === null && this.collection.dates[1] === null) return 'Unknown'
      const d1 = dayjs(this.collection.dates[0]).format('DD MMM YYYY')
      const d2 = this.collection.dates[1] === null ? 'present' : dayjs(this.collection.dates[1]).format('DD MMM YYYY')
      return `${d1} - ${d2}`
    },
    licenseLink () {
      return this.collection.licenseTypeAndLink
    }
  }
}
</script>