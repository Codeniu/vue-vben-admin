<template>
  <div class="object-info">
    <h3>{{ isActiveing ? '元素信息' : '画布信息' }}</h3>
    <template v-if="isActiveing">
      <div class="info-item">
        <label>类型：</label>
        <span>{{ getObjectType(selectedObject.type) }}</span>
      </div>
      <div class="info-item">
        <label>名称：</label>
        <input
          v-model="selectedObject.name"
          @input="updateObjectName"
          type="text"
          style="display: inline-block; width: 160px"
          placeholder="输入元素名称"
        />
      </div>
      <div class="info-item">
        <div class="action-buttons">
          <button class="delete-btn" @click="deleteSelected">删除元素</button>
          <button class="export-btn" @click="exportSelectedObject">
            导出元素
          </button>
        </div>
      </div>
      <div class="info-item">
        <label>位置：</label>
        <span>
          X: {{ Math.round(selectedObject.left) }}, Y:
          {{ Math.round(selectedObject.top) }}
        </span>
      </div>
      <div class="info-item" v-if="selectedObject.width !== undefined">
        <label>尺寸：</label>
        <div class="size-inputs">
          <label> 宽：</label>
          <input
            type="number"
            v-model="selectedObject.width"
            @input="updateObjectSize"
            class="size-input"
            placeholder="宽度"
          />
          <label> 高：</label>
          <input
            type="number"
            v-model="selectedObject.height"
            @input="updateObjectSize"
            class="size-input"
            placeholder="高度"
          />
        </div>
      </div>
      <div class="info-item" v-if="selectedObject.radius !== undefined">
        <label>半径：</label>
        <input
          type="number"
          v-model="selectedObject.radius"
          @input="updateObjectRadius"
          class="size-input"
          placeholder="半径"
        />
      </div>
      <div class="info-item">
        <label>填充：</label>
        <input
          type="color"
          v-model="selectedObject.fill"
          @input="updateObjectColor"
        />
      </div>
      <div class="info-item">
        <label>边框：</label>
        <input
          type="color"
          v-model="selectedObject.stroke"
          @input="updateObjectStroke"
        />
      </div>
      <div class="info-item">
        <label>边框宽度：</label>
        <input
          type="number"
          v-model="selectedObject.strokeWidth"
          @input="updateObjectStrokeWidth"
          class="size-input"
          placeholder="边框宽度"
        />
      </div>

      <div class="info-item">
        <label>层级：</label>
        <div class="layer-buttons">
          <button @click="layerElement(LayerCommand.TOP)">置顶</button>
          <button @click="layerElement(LayerCommand.BOTTOM)">置底</button>
          <button @click="layerElement(LayerCommand.UP)">上移</button>
          <button @click="layerElement(LayerCommand.DOWN)">下移</button>
        </div>
      </div>
      <div class="info-item">
        <label>翻转：</label>
        <div class="flip-buttons">
          <button
            @click="toggleFlipX"
            :class="{ active: selectedObject.flipX }"
          >
            水平翻转
          </button>
          <button
            @click="toggleFlipY"
            :class="{ active: selectedObject.flipY }"
          >
            垂直翻转
          </button>
        </div>
      </div>
      <div class="info-item">
        <label>旋转：</label>
        <div class="rotate-controls">
          <input
            type="number"
            v-model="selectedObject.angle"
            @input="updateObjectAngle"
            class="angle-input"
            placeholder="角度"
          />
          <div class="rotate-buttons">
            <button @click="rotateLeft">左转45°</button>
            <button @click="rotateRight">右转45°</button>
          </div>
        </div>
      </div>
    </template>

    <template v-if="!isActiveing">
      <div class="info-item">
        <label>画布尺寸：</label>
        <div class="size-inputs">
          <label>宽：</label>
          <input
            type="number"
            v-model="canvasProperties.width"
            @input="updateCanvasProperties"
            class="size-input"
            placeholder="宽度"
          />
          <label>高：</label>
          <input
            type="number"
            v-model="canvasProperties.height"
            @input="updateCanvasProperties"
            class="size-input"
            placeholder="高度"
          />
        </div>
      </div>
      <div class="info-item">
        <label>背景色：</label>
        <input
          type="color"
          v-model="canvasProperties.backgroundColor"
          @input="updateCanvasProperties"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import {
  selectedObject,
  canvasProperties,
  updateCanvasProperties,
  deleteSelected,
  updateObjectColor,
  updateObjectStroke,
  updateObjectName,
  toggleFlipX,
  toggleFlipY,
  updateObjectAngle,
  rotateLeft,
  rotateRight,
  updateObjectSize,
  updateObjectRadius,
  updateObjectStrokeWidth,
} from '../hooks/useCanvas';
import useHandleTools from '../hooks/useHandleTools';
import { LayerCommand } from '#/types/elements';
import useCanvasExport from '../hooks/useCanvasExport';

const { exportActive } = useCanvasExport();
const { layerElement } = useHandleTools();

// 导出选中元素的JSON数据
const exportSelectedObject = () => {
  exportActive();
};

// 获取对象类型的中文描述
const getObjectType = (type: string) => {
  const typeMap: Record<string, string> = {
    rect: '矩形',
    circle: '圆形',
    triangle: '三角形',
    iText: '文本',
  };
  return typeMap[type] || type;
};

// 计算当前是否选中元素
const isActiveing = computed(() => selectedObject.value);
</script>
<style scoped>
button {
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

.color-picker {
  display: flex;
  gap: 8px;
  align-items: center;
}

.object-info {
  width: 300px;
  padding: 20px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.object-info h3 {
  margin: 0 0 16px;
  color: #333;
}

.info-item {
  margin-bottom: 12px;
}

.info-item label {
  display: inline-block;
  color: #666;
}

.info-item input {
  display: inline-block;
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.info-item span {
  color: #333;
}

.flip-buttons {
  display: flex;
  gap: 8px;
}

.flip-buttons button {
  padding: 4px 8px;
  font-size: 12px;
}

.flip-buttons button.active {
  background-color: #2196f3;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.delete-btn {
  flex: 1;
  background-color: #f44336;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.export-btn {
  flex: 1;
  background-color: #2196f3;
}

.export-btn:hover {
  background-color: #1976d2;
}

.import-btn {
  position: relative;
  overflow: hidden;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
}

.layer-buttons {
  display: flex;
  gap: 8px;
}

.layer-buttons button {
  padding: 4px 8px;
  font-size: 12px;
}

.rotate-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.angle-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.rotate-buttons {
  display: flex;
  gap: 8px;
}

.rotate-buttons button {
  padding: 4px 8px;
  font-size: 12px;
}

.size-inputs {
  display: flex;
  gap: 8px;
}

.size-input {
  width: 120px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
