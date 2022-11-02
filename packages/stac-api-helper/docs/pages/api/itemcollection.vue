<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper - ItemCollection Class</Title>
    </Head>

    <ClassDoco :details="details" />

  </NuxtLayout>
</template>

<script>
import config from '../../assets/config.json'
import ClassDoco from '../../components/class.vue'

export default {
  name: 'ItemCollection',
  computed: {
    details () {
      return config.find(c => c.name === 'ItemCollection')
    }
  },
  components: {
      ClassDoco
  }
}
</script>
