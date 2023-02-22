<template>
  <div>
    <ARow id="wideContent" type="flex" style="flex-wrap: nowrap;">
      <ACol id="firstCol" flex="0 0 300px">
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
            <a @click="navigateTo({path: '/example-usage'})">Example Usage</a>

            <p style="font-size: 1rem; font-weight: 600; margin-top: 30px;">API</p>
            <p class="subsection">Core Classes</p>
            <a :class="{ active: routeName === 'api-catalog' }" @click="navigateTo({path: '/api/catalog'})">Catalog</a>
            <a @click="navigateTo({path: '/api/collection'})">Collection</a>
            <a @click="navigateTo({path: '/api/item'})">Item</a>
            <a @click="navigateTo({path: '/api/itemcollection'})">ItemCollection</a>
            <a @click="navigateTo({path: '/api/search'})">Search</a>
            <a @click="navigateTo({path: '/api/queryable'})">Queryable</a>

            <p class="subsection" style="margin-top: 20px;">Base Classes</p>
            <a @click="navigateTo({path: '/api/stac-entity'})">STAC Entity</a>


            <p class="subsection" style="margin-top: 20px;">Utility Methods</p>
            <a @click="navigateTo({
                path: '/api/utility-methods',
                hash: '#createStacEntityFromUrlOrLink'
            })">createStacEntityFromUrlOrLink</a>
            <a @click="navigateTo({
                path: '/api/utility-methods',
                hash: '#detectStacType'
            })">detectStacType</a>
            <a @click="navigateTo({
                path: '/api/utility-methods',
                hash: '#getLinkByRelType'
            })">getLinkByRelType</a>
            <a @click="navigateTo({
                path: '/api/utility-methods',
                hash: '#getNextLinkObj'
            })">getNextLinkObj</a>
            <a @click="navigateTo({
                path: '/api/utility-methods',
                hash: '#getPrevLinkObj'
            })">getPrevLinkObj</a>
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
    routeName() {
      return this.$route.name
    }
  },
  methods: {
    headHome() {
      this.$router.push('/')
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
    margin-bottom: 5px;
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

    a {
      font-weight: 400;
      font-size: 0.9rem;
      display: block;
      margin-bottom: 5px;
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

    p {
      line-height: 1.6rem;
    }
    li {
      margin-bottom: 5px;
    }

    a {
      display: inline-block;
      position: relative;
      color: #09B3AD;
    }

    a::after {
      content: '';
      position: absolute;
      display: inline-block;
      height: 1em;
      width: 0%;
      border-bottom: 2px solid;
      margin-top: 10px;
      transition: 0.3s;
      left: 50%;
    }

    a:hover::after {
      width: 100%;
      left: 0%;
    }

  }
}
</style>
