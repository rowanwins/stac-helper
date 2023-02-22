<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper - Stac Entity Class</Title>
    </Head>

    <ClassDoco :details="details" />

  </NuxtLayout>
</template>

<script>
import config from '../../assets/config.json'
import ClassDoco from '../../components/class.vue'

export default {
  name: 'StacEntity',
  computed: {
    details () {
      return config.find(c => c.name === 'StacEntity')
    }
  },
  components: {
      ClassDoco
  }
}
</script>
