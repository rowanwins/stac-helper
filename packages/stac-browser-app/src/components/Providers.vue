<template>
  <ARow v-for="provider in providers" type="flex" align="middle">
    <ACol :span="12">
      <p>
        <a :href="provider.url" target="_blank">{{provider.name}}</a>
      </p>
    </ACol>
    <ACol :span="12" >
      <p>
      <ATag v-for="role in provider.roles" style="float: right;">
        {{role}}
      </ATag>
      </p>  
    </ACol>
  </ARow>
</template>

<script>
export default {
  name: 'Providers',
  props: ['providers']
}
</script>