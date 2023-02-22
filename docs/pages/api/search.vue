<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper - Search Class</Title>
    </Head>

    <ClassDoco :details="details" />

  </NuxtLayout>
</template>

<script>
import config from '../../assets/config.json'
import ClassDoco from '../../components/class.vue'

export default {
  name: 'Search',
  computed: {
    details () {
      return config.find(c => c.name === 'Search')
    }
  },
  components: {
      ClassDoco
  }
}
</script>
