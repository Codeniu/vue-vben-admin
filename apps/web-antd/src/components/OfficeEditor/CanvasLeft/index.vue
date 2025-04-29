<template>
  <div class="template-container">
    <button @click="addTemplate('wall')">墙体模板</button>
    <button @click="addTemplate('room')">房间模板</button>
    <button @click="addTemplate('circle')">圆形模板</button>
    <button @click="addTemplate('triangle')">三角形模板</button>
    <button @click="addTemplate('desk')">
      <img src="./assets/desk.svg" height="40px" width="40px" />
    </button>
  </div>
</template>

<script setup lang="ts">
import * as fabric from 'fabric';
import useCanvas, { setCanvasTransform } from '../hooks/useCanvas';
import { deskGroup } from './templates';
import { nonid } from '../utils/common';

const emit = defineEmits(['add-template']);

const addTemplate = async (type: string) => {
  const [canvas] = useCanvas();
  if (!canvas) return;

  let template: fabric.Object;

  switch (type) {
    case 'wall':
      template = new fabric.Rect({
        left: 100,
        top: 100,
        width: 200,
        height: 20,
        fill: '#ccc',
        stroke: '#000',
        strokeWidth: 1,
      });
      break;
    case 'room':
      await canvas.loadFromJSON(deskGroup);
      canvas.renderAll();
      setCanvasTransform();
      emit('add-template', canvas);
      return;
    case 'circle':
      template = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: '#ccc',
        stroke: '#000',
        strokeWidth: 1,
      });
      break;
    case 'triangle':
      template = new fabric.Triangle({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: '#ccc',
        stroke: '#000',
        strokeWidth: 1,
      });
      break;
    // 工位基本单元
    case 'desk':
      fabric.FabricImage.fromURL(
        '/src/components/OfficeEditor/CanvasLeft/assets/desk-no-shadow.svg',
      ).then((img) => {
        img.set({
          id: nonid(8), // 生成id
          ownType: 'desk',
          left: 100,
          top: 100,
        });
        template = img;
        canvas.add(template);
        canvas.setActiveObject(template);
        emit('add-template', template);
      });
      return;
    default:
      return;
  }

  canvas.add(template);
  canvas.setActiveObject(template);
  emit('add-template', template);
};
</script>

<style scoped>
.template-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
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
</style>
