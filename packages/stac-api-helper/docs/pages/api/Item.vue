<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper - Item Class</Title>
    </Head>
    
    <ClassDoco :details="details" />

  </NuxtLayout>
</template>

<script>
import config from '../../assets/config.json'
import ClassDoco from '../../components/class.vue'

export default {
  name: 'Item',
  computed: {
    details () {
      return config.find(c => c.name === 'Item')
    },
  },
  components: {
      ClassDoco
  }
}
</script>
