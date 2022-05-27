<template>
  <div>
    <ARow id="wideContent" type="flex" style="flex-wrap: nowrap;">
      <ACol
        id="firstCol"
        flex="0 0 380px"
      > 
        <ARow id="logoArea" type="flex" align="middle" style="cursor: pointer;" @click="headHome">
          <ACol flex="0 0 60px">
            <img src="/stac_logo.png" height="50"/>
          </ACol>
          <ACol flex="1 1 auto">
            <h1 style="margin-bottom:0px; color: #0F3542;">STAC BROWSER</h1>
          </ACol>
        </ARow>
        <slot name="first-col-content" />
      </ACol>

      <ACol flex="auto" id="secondCol">
        <slot name="second-col-content" />
      </ACol>
    </ARow>
  </div>
</template>

<script>

export default {
  name: 'TwoColLayout',
  methods: {
    headHome () {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="less">
@import '@/styles/theme.less';

#wideContent {
  height: 100vh;

  h2 {
    font-weight: 200;
    font-size: 1.8rem;
  }

  h3 {
    font-weight: 400;
    font-size: 1.4rem;
  }

  #firstCol {
    padding: 48px;
    background: #F6F7F8;
    height: 100%;
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
    overflow-y: scroll;
  }
}
</style>
