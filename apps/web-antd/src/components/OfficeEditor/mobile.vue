<template>
  <div class="yft-design">
    <div class="layout-content">
      <!-- <MobileThumb class="layout-mobile-thumb" />  -->
      <div class="layout-mobile-center">
        <div class="center-header">
          <CanvasHeader />
        </div>
        <div class="center-body">
          <CanvasCenter />
        </div>
        <div class="center-footer">footer</div>
      </div>
    </div>
    <div class="layout-barcode">
      <svg id="barcode"></svg>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CanvasCenter from './CanvasCenter/index.vue';
import CanvasHeader from './CanvasHeader/index.vue';
</script>

<style lang="less" scoped>
.yft-design {
  height: 100%;
}
.layout-content {
  height: calc(100% - 40px);
  display: flex;
}
.layout-mobile-thumb {
  position: absolute;
  z-index: 10;
  width: 160px;
  height: 100%;
  display: flex;
  flex-shrink: 0;
  border-right: solid 1px #eee;
  background-color: #fff;
  flex-direction: column;
  user-select: none;
  transition:
    left 0.5s linear,
    right 0.5s linear;
}
.layout-mobile-center {
  width: 100%;

  .center-header {
    position: relative;
    border-bottom: 1px solid #eee;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    font-size: 13px;
    user-select: none;
    height: 40px;
  }
  .center-body {
    height: calc(100% - 40px);
  }
  .center-footer {
    height: 40px;
    position: relative;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
    line-height: 1.5;
    display: flex;
    justify-content: space-between;
  }
}
.layout-barcode {
  position: absolute;
  top: -200px;
}
</style>
