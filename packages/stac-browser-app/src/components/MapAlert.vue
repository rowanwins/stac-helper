<template>
  <div id="placeMarkerAlert">
    <AAlert
      :message="msg"
      type="info"
      :close-text="closeText"
      closable
      @close="onClose"
    >
      <template #description>
         <slot name="msg-slot" />
      </template>
    </AAlert>
  </div>
</template>

<script>

export default {
  name: 'PlaceMarkerText',
  props: {
    msg: {
      type: String,
      default: ''
    },
    closeText: {
      type: String,
      default: ''
    }
  },
  emits: ['alert-closed'],
  methods: {
    onClose () {
      this.$emit('alert-closed')
    }
  }
}
</script>

<style lang="less">
  @import '@/styles/theme.less';

  #placeMarkerAlert {
    position: absolute;
    top: 20px;
    z-index: 1000;
    width: 100%;
    pointer-events: none;
    .ant-alert {
      width: 350px;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
      pointer-events: auto;
      .ant-alert-message {
        font-size: 0.9rem;
        margin-bottom: 0px;
      }
      .ant-alert-close-text {
        font-weight: 700;
        color: @text-color;
      }
    }
  }
</style>
