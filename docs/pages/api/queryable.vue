<template>
  <NuxtLayout name="main">

    <Head>
      <Title>STAC Helper - Queryable Class</Title>
    </Head>

    <ClassDoco :details="details" />

  </NuxtLayout>
</template>

<script>
import config from '../../assets/config.json'
import ClassDoco from '../../components/class.vue'

export default {
  name: 'Queryable',
  computed: {
    details () {
      return config.find(c => c.name === 'Queryable')
    }
  },
  components: {
      ClassDoco
  }
}
</script>
