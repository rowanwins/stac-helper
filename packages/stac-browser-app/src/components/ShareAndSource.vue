<template>
  <ARow style="margin: -10px 0px 20px 0px; float: right;">

    <a-popover 
      placement="bottom"
    >
      <template #content>
        <h4>Create Sharable URL</h4>
        <p>{{shareLink}}</p>

        <a-checkbox v-model:checked="includeAppState">
          Include App State (eg selected tabs)
        </a-checkbox>
        <br/>

        <a-button size="small" @click="copyShareLink">
          <template #icon><copy-outlined /></template>
            Copy Link
        </a-button>
      </template>

      <AButton size="small" style="margin-right: 10px;">
        <template #icon><share-alt-outlined /></template>
      </AButton>
    </a-popover>

    <a-popover 
      placement="bottom"
    >
      <template #content>
        <h4>Original Source URL</h4>
        <a :href="stacLink" target="_blank">
          <a-button size="small" style="margin-right: 10px;">
            <template #icon></template>
            Open in new window
          </a-button>
        </a>

        <a-button size="small">
          <template #icon><copy-outlined /></template>
            Copy Link
        </a-button>

      </template>

      <AButton size="small" style="margin-right: 10px;">
        <template #icon><link-outlined /></template>
      </AButton>
    </a-popover>

  </ARow>
</template>

<script>
import { LinkOutlined, ShareAltOutlined, CopyOutlined } from '@ant-design/icons-vue'
import {stringify} from 'query-string'

export default {
  props: ['stac-thing', 'page-state'],
  data () {
    return {
      shareVisible: false,
      includeAppState: true
    }
  },
  components: {
    LinkOutlined,
    ShareAltOutlined,
    CopyOutlined
  },
  computed: {
    stacLink () {
      return this.stacThing.linkToSelf
    },
    shareLink () {
      const baseUrl = window.location.toString()
      if (!this.includeAppState) return baseUrl
      const qs = stringify(this.pageState)
      return `${baseUrl}?${qs}`
    }
  },
  methods: {
    async copyShareLink () {
      await navigator.clipboard.writeText(this.shareLink)
    }
  }
}
</script>

