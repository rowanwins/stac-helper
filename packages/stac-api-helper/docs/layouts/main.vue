<template>
  <div>
    <ARow id="wideContent" type="flex" style="flex-wrap: nowrap;">
      <ACol
        id="firstCol"
        flex="0 0 300px"
      > 
        <ARow id="logoArea" type="flex" align="middle" style="cursor: pointer;" @click="headHome">
          <ACol flex="0 0 60px">
            <img src="/stac_logo.png" height="50" />
          </ACol>

          <ACol flex="1 1 auto">
            <h1 style="margin-bottom:0px; color: #0F3542;">STAC HELPER</h1>
          </ACol>
        </ARow>

        <ARow style="margin-top: 60px;">
          <ACol span="24">
            <h4 @click="navigateTo({path: '/about'})">About</h4>
            <h4 @click="navigateTo({path: '/example-usage'})">Example Usage</h4>


            <h3 class="" style="font-weight: 600;margin-top: 30px;">API</h3>
            <h3 class="subsection">Core Classes</h3>
            <h4 :class="{ active: routeName === 'api-catalog' }" @click="navigateTo({path: '/api/catalog'})">Catalog</h4>
            <h4 @click="navigateTo({path: '/api/collection'})">Collection</h4>
            <h4 @click="navigateTo({path: '/api/item'})">Item</h4>
            <h4 @click="navigateTo({path: '/api/itemcollection'})">ItemCollection</h4>
            <h4 @click="navigateTo({path: '/api/search'})">Search</h4>

            <h3 class="subsection" style="margin-top: 20px;">Utilities</h3>
            <h4>createStacEntityFromLink</h4>
            <h4>detectStacType</h4>
            <h4>getLinkByRelType</h4>
            <h4>getNextLinkObj</h4>
            <h4>getPrevLinkObj</h4>
          </ACol>


        </ARow>
      </ACol>

      <ACol id="secondCol">
        <slot />
        <div style="height: 80px"></div>
      </ACol>

    </ARow>
  </div>
</template>

<script>

export default {
  name: 'MainLayout',
  computed: {
    routeName () {
      return this.$route.name
    }
  },
  methods: {
    headHome () {
      // this.$router.push('/')
    }
  }
}
</script>

<style lang="less">

#wideContent {
  height: 100vh;

  h2 {
    font-weight: 200;
    font-size: 1.8rem;
  }

  h3 {
    font-weight: 400;
    font-size: 1rem;
  }

  h4 {
    &:hover {
      color: #19b8b2;
      // padding-left: 2px;
    }
  }

  .active {
    font-weight: 600;
    // border-left: 2px solid #19b8b2;
    // padding-left: 3px;
  }

  .subsection {
    font-size: 0.8rem;
    text-transform: uppercase;
    color: #909090;
    font-weight: 600;
  }

  #firstCol {
    padding: 48px 24px;
    background: #F6F7F8;
    height: 100vh;
    position: fixed;
    width: 300px;
    h2 {
      margin-bottom: 0px;
    }
    #logoArea {
      margin-bottom: 40px;
      h1 {
        font-size: 1.3rem;
      }
    }
  }

  #secondCol {
    padding: 48px;
    height: 100vh;
    margin-left: 300px;
  }
}
</style>
