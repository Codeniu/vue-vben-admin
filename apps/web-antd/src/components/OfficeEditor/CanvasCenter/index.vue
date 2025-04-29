<template>
  <div class="canvas-container" ref="wrapperRef">
    <canvas ref="canvasRef" class="background-grid"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useFabricStore } from '#/store';
import { initEditor } from '../hooks/useCanvas';

const fabricStore = useFabricStore();
const { wrapperRef, canvasRef } = storeToRefs(fabricStore);

onMounted(async () => {
  if (canvasRef.value) {
    await initEditor();
  }
});
</script>

<style scoped lang="scss">
.canvas-container {
  width: 100%;
  height: calc(100vh - 200px);
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.background-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 8px;
  --color: #dedcdc;

  z-index: 999;
  background-image:
    linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 0,
      transparent 75%,
      var(--color) 0
    ),
    linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 0,
      transparent 75%,
      var(--color) 0
    );
  background-position:
    var(--offsetX) var(--offsetY),
    calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}
</style>
