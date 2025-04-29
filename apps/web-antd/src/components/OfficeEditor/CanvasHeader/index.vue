<template>
  <div class="toolbar">
    <button @click="addRect">墙体 -</button>
    <button @click="addRectVertical">墙体 |</button>
    <button @click="addRoom">房间</button>
    <button @click="addCircle">圆形</button>
    <button @click="addTriangle">三角形</button>
    <button @click="addText">文本</button>
    <button @click="clearCanvas">清空</button>
    <button @click="undo" title="撤销 (Ctrl+Z)">撤销</button>
    <button @click="exportCanvas">导出</button>
    <button class="import-btn">
      导入
      <input
        type="file"
        accept=".json"
        @change="handleFileImport"
        class="file-input"
      />
    </button>
    <button @click="handlePreview">预览JSON</button>

    <!-- 吸附功能控制按钮 -->
    <button @click="toggleSnap" title="元素吸附">
      吸附{{ snapEnabled ? '✓' : '' }}
    </button>

    <!-- 辅助线显示控制按钮 -->
    <button @click="toggleGuides" title="显示辅助线">
      辅助线{{ showGuides ? '✓' : '' }}
    </button>

    <span>{{ zoom }}</span>
  </div>

  <contextHolder />
</template>

<script setup lang="ts">
import { h, onMounted, onUnmounted } from 'vue';
import * as fabric from 'fabric';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

import { storeToRefs } from 'pinia';
import { useFabricStore } from '#/store';

import useCanvas from '../hooks/useCanvas';
import { undo } from '../hooks/useUndo';
import useCanvasExport from '../hooks/useCanvasExport';
import { currentColor, setPainter } from '../hooks/useCanvas';
import {
  toggleSnap,
  toggleGuides,
  snapEnabled,
  showGuides,
} from '../hooks/useSnap';

const fabricStore = useFabricStore();
const { zoom } = storeToRefs(fabricStore);

// 添加快捷键监听
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undo();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// 添加矩形
const addRect = () => {
  const [canvas] = useCanvas();

  if (!canvas) return;

  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 20,
    fill: currentColor.value,
    stroke: '#000000',
    strokeWidth: 1,
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
};

const addRectVertical = () => {
  const [canvas] = useCanvas();

  if (!canvas) return;

  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 20,
    height: 200,
    fill: currentColor.value,
    stroke: '#000000',
    strokeWidth: 1,
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
};

const addRoom = () => {
  const [canvas] = useCanvas();

  if (!canvas) return;

  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 200,
    fill: '',
    stroke: '#797979',
    strokeWidth: 20,
    strokeUniform: true, // 使边框均匀分布
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
};

// 添加圆形
const addCircle = () => {
  const [canvas] = useCanvas();

  if (!canvas) return;

  const circle = new fabric.Circle({
    left: 100,
    top: 100,
    radius: 50,
    fill: currentColor.value,
    stroke: '#000000',
    strokeWidth: 1,
  });

  canvas.add(circle);
  canvas.setActiveObject(circle);
};

// 添加三角形
const addTriangle = () => {
  const [canvas] = useCanvas();

  if (!canvas) return;

  const triangle = new fabric.Triangle({
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    fill: currentColor.value,
    stroke: '#000000',
    strokeWidth: 1,
  });

  canvas.add(triangle);
  canvas.setActiveObject(triangle);
};

// 添加文本
const addText = () => {
  const [canvas] = useCanvas();

  if (!canvas) return;

  const text = new fabric.IText('双击编辑文本', {
    left: 100,
    top: 100,
    fontSize: 20,
    fill: currentColor.value,
  });

  canvas.add(text);
  canvas.setActiveObject(text);
};

// 清空画布
const clearCanvas = () => {
  const [canvas] = useCanvas();
  if (!canvas) return;
  canvas.clear();
  setPainter();
  canvas.renderAll();
};

// 导出画布内容
const { exportImage, exportJSON, getJSONData } = useCanvasExport();
const exportCanvas = () => {
  const btnStyle = {
    margin: '10px',
    padding: '8px 16px',
    backgroundColor: '#4096FF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const [canvas] = useCanvas();
  if (!canvas) return;

  modal.confirm({
    title: '选择导出类型',
    okText: '确定',
    cancelText: '取消',
    content: h('div', [
      h(
        'button',
        {
          style: btnStyle,
          onClick: () => {
            exportJSON();
            Modal.destroyAll();
          },
        },
        'JSON数据',
      ),
      h(
        'button',
        {
          style: btnStyle,
          onClick: () => {
            exportImage();
            Modal.destroyAll();
          },
        },
        '图片',
      ),
    ]),
  });
};

// 处理文件导入
const handleFileImport = (event: Event) => {
  const [canvas] = useCanvas();

  const input = event.target as HTMLInputElement;
  if (!input.files?.length || !canvas) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      canvas?.loadFromJSON(json, () => {
        canvas?.renderAll();
      });
    } catch (error) {
      console.error('导入失败:', error);
    }
  };

  reader.readAsText(file);
  input.value = ''; // 重置input，允许重复导入相同文件
};

const [modal, contextHolder] = Modal.useModal();
const showConfirm = (str: string) => {
  modal.confirm({
    title: 'JSON 数据',
    width: 1000,
    okText: '确定',
    cancelText: '取消',
    icon: h(ExclamationCircleOutlined),
    content: h('div', { style: 'color:red;height:600px;overflow:auto;' }, str),
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
    class: 'test',
  });
};

// 预览JSON
const handlePreview = () => {
  const [canvas] = useCanvas();

  if (!canvas) return;
  const json = getJSONData();
  showConfirm(JSON.stringify(json));
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

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
</style>
