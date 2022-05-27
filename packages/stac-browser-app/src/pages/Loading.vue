<template>
    <TwoColLayout id="loadingPage">

      <template #first-col-content>
        <p>
          Loading STAC Reference <SyncOutlined spin style="margin-left: 10px;"/>
        </p>
      </template>

      <template #second-col-content>
        <ASkeleton active/>
      </template>
    </TwoColLayout>
</template>

<script>
import TwoColLayout from '@/layouts/TwoColLayout.vue'
import { SyncOutlined } from '@ant-design/icons-vue'

export default {
  name: 'Loading',
  components: {
    TwoColLayout,
    SyncOutlined
  }
}

</script>