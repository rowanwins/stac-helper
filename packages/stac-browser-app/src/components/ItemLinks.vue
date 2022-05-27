<template>
  <p v-for="link in validLinks">
    <a :href="link.href" target="_blank">{{link.title}}</a>
  </p>
</template>

<script>
const linkTypesToIgnore = ['root', 'self', 'collection', 'parent']

export default {
  name: 'ItemLinks',
  props: ['item'],
  computed: {
    validLinks () {
      return this.item.links.filter(l => linkTypesToIgnore.indexOf(l.rel) === -1)
    }
  }
}
</script>