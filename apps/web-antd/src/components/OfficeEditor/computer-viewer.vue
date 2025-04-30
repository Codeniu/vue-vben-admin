<template>
  <div class="editor">
    <div class="layout-content flex">
      <div class="layout-content-center">
        <div class="center-header"><CanvasHeader /></div>

        <div class="center-body">
          <CanvasCenter />
        </div>
      </div>

      <slot name="right"> </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CanvasCenter from './CanvasCenter/index.vue';
import CanvasHeader from './CanvasHeader/index.vue';
</script>

<style lang="less" scoped>
.editor {
  height: calc(100vh - 180px);
}

.layout-content {
  height: calc(100% - 40px);
  display: flex;
  gap: 1rem;
}
.layout-content-center {
  width: calc(100% - 50px - 160px - 260px);

  .center-header {
    position: relative;
    border-bottom: 1px solid #eee;
    background-color: #f5f5f5;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    font-size: 12px;
    user-select: none;
  }

  .center-body {
    background-color: #eee;
  }

  .center-affix {
    border-left: 1px solid #eee;
  }
}
</style>
