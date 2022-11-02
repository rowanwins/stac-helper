<template>
  <ARow style="margin: -10px 0px 20px 0px; float: right;">

    <a-popover 
      placement="bottom"
      id="shareableUrl"
      @visibleChange="onSharePopover"
    >
      <template #content>
        <h4>Create Sharable URL</h4>
        <p v-if="generatingShareId"><loading-outlined /> generating share link</p>
        <p v-else>{{shareLink}}</p>

        <a-checkbox v-model:checked="includeAppState">
          Include App State (eg selected tabs)
        </a-checkbox>
        <br/>

        <a-button style="margin-top: 5px;" size="small" @click="copyShareLink">
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
        <h4>Source STAC URL</h4>
        <a :href="stacLink" target="_blank">
          <a-button size="small" style="margin-right: 10px;">
            <template #icon>
              <icon>
                <template #component>
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="1.2em" height="1.2em" viewBox="0 0 1024 1024">
                    <path d="m807.024003 203.55743-189.2 23.5c-6.6.8-9.3 8.8-4.7 13.5l54.7 54.7-153.5 153.499999c-3.098671 3.129382-3.098671 8.170618 0 11.3l45.1 45.1c3.1 3.1 8.2 3.1 11.3 0l153.6-153.6 54.7 54.7c2.153492 2.152395 5.348163 2.883777 8.223606 1.882697 2.875443-1.00108 4.925194-3.558298 5.276394-6.582697l23.4-189.1c.335688-2.448049-.493384-4.912154-2.240615-6.659385-1.747231-1.74723-4.211336-2.576303-6.659385-2.240615Z"/>
                    <path d="M476 211c19.882251 0 36 16.117749 36 36 0 19.88225-16.117749 36-36 36H281v461.004l462.652.047.348057-196.11488c.034926-19.683397 15.860287-35.649181 35.468489-35.932297l.595333-.003767c19.88222.03528 35.971344 16.181603 35.936121 36.063823l-.411821 232.055298c-.035238 19.858731-16.144905 35.93612-36.003668 35.93612L244.996276 816C225.11548 815.997943 209 799.880796 209 780V247c0-19.882251 16.117749-36 36-36h231Z"/>
                  </svg>
                </template>
              </icon>
            </template>
            Open
          </a-button>
        </a>

        <a-button size="small" @click="copySourceLink">
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
import Icon, { LinkOutlined, ShareAltOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import assignDeep from 'assign-deep'
import equal from 'deep-eql'

export default {
  props: ['stac-entity', 'page-state'],
  data () {
    return {
      includeAppState: true,
      lastShareContentCreated: null,
      shareId: null,
      generatingShareId: false
    }
  },
  components: {
    LinkOutlined,
    ShareAltOutlined,
    CopyOutlined,
    LoadingOutlined,
    Icon
  },
  computed: {
    stacLink () {
      return this.stacEntity.linkToSelf
    },
    baseUrl () {
      return window.location.toString()
    },
    shareLink () {
      const baseUrl = window.location.toString()
      if (!this.includeAppState) return baseUrl

      return `${baseUrl}#${this.shareId}`
    }
  },
  methods: {
    async copySourceLink () {
      await this.copyToClipboard(this.stacLink)
    },
    async onSharePopover (isVisible) {
      if (isVisible) {

        if (!this.includeAppState) return this.baseUrl

        // If the last shareable page was the same as this one let's bail
        if (equal(this.lastShareContentCreated, this.pageState)) {
          return 
        }
        this.shareId = null
        this.generatingShareId = true

        const res = await fetch('https://stac-share-server.glitch.me/', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.pageState)
        })
        this.shareId = await res.json()
        this.lastShareContentCreated = assignDeep({}, this.pageState)
        // this.shareId = await this.uploadFile(this.pageState, preSignedPost)
        this.generatingShareId = false

      }
    },
    async uploadFile (file, presignedPost) {
      const formData = new FormData();
      formData.append("Content-Type", "application/json");
      Object.entries(presignedPost.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", new File([JSON.stringify(file)], "file.json", {
        type: "application/json",
      }));

      await fetch(presignedPost.url, {
        method: "POST",
        mode: 'no-cors',
        body: formData,
      });
      
      return presignedPost.fields.key.split('public/')[1];
    },
    async copyToClipboard (content) {
      console.log(content)
      const unsecuredCopyToClipboard = (text) => { const textArea = document.createElement("textarea"); textArea.value=text; document.body.appendChild(textArea); textArea.focus();textArea.select(); try{document.execCommand('copy')}catch(err){console.error('Unable to copy to clipboard',err)}document.body.removeChild(textArea)};
      if (window.isSecureContext && navigator.clipboard) {
          await navigator.clipboard.writeText(content);
      } else {
        unsecuredCopyToClipboard(content);
      }
    },
    async copyShareLink () {
      await this.copyToClipboard(this.shareLink)
    },
  }
}
</script>

<style>
.ant-popover {
  width: 300px!important;
}
</style>
