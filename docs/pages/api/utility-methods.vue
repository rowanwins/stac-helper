<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper - Utility Methods</Title>
    </Head>

    <h2>Utility Methods</h2>
    
    <UtilityMethod 
      v-for="(method, idx) in methods"
      :key="idx" 
      :method="method"
    />

  </NuxtLayout>
</template>

<script>
import config from '../../assets/config.json'
import UtilityMethod from '../../components/utility-method.vue'

const utilityNames = [
  'getNextLinkObj',
  'getPrevLinkObj',
  'getLinkByRelType',
  'detectStacType',
  'loadUrlOrLink',
  'createStacEntityFromUrlOrLink'
]

export default {
  name: 'UtilityMethods',
  computed: {
    methods () {
      return config.filter(c => utilityNames.indexOf(c.name) > -1)
    },
  },
  components: {
    UtilityMethod
  }
}
</script>
