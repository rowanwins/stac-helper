<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper - Catalog Class</Title>
    </Head>

    <ClassDoco :details="catalogDetails" />

  </NuxtLayout>
</template>

<script>
import config from '../../assets/config.json'
import ClassDoco from '../../components/class.vue'

export default {
  name: 'Catalog',
  computed: {
    catalogDetails () {
      return config.find(c => c.name === 'Catalog')
    },
  },
  components: {
    ClassDoco
  }
}
</script>