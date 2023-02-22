<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper - Collection Class</Title>
    </Head>

    <ClassDoco :details="details" />

  </NuxtLayout>
</template>

<script>
import config from '../../assets/config.json'
import ClassDoco from '../../components/class.vue'

export default {
  name: 'Collection',
  computed: {
    details () {
      return config.find(c => c.name === 'Collection')
    }
  },
  components: {
      ClassDoco
  }
}
</script>
