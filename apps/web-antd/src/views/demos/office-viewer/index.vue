<template>
  <div>
    <span class="text-4xl font-bold">新浦大厦19层1908号</span>
    <OfficeViewer>
      <template #right>
        <div>
          <template v-if="isActiveing">
            <Form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
              <h3 class="text-2xl font-bold">工位基本信息</h3>
              <FormItem label="工位编号">
                <span>
                  {{ selectedObject.id }}
                </span>
              </FormItem>

              <FormItem label="工位属性">
                <Select
                  ref="select"
                  v-model:value="selectedObject.sideType"
                  style="width: 100%"
                  :options="[
                    {
                      value: '临时工位',
                      label: '临时工位',
                    },
                    {
                      value: '测试工位',
                      label: '测试工位',
                    },
                  ]"
                ></Select>
              </FormItem>

              <FormItem label="使用人员">
                <Input
                  v-model:value="selectedObject.name"
                  @input="updateObjectName"
                />
              </FormItem>

              <h3 class="text-2xl font-bold">工位审批信息</h3>

              <h3 class="text-2xl font-bold">历史使用情况</h3>

              <div style="width: 400px; height: 300px; overflow: auto">
                {{ selectedObject.id }}
              </div>
            </Form>
          </template>

          <template v-else>
            <div>
              <h3>工位总数量16个，空闲7个，使用中7个</h3>

              <h3>工位申请信息：待审批2条，已审批20条</h3>

              <Button @click="exportJSON">导出</Button>
            </div>
          </template>
        </div>
      </template>
    </OfficeViewer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'OfficeEditorViewer',
});

import { nextTick, onMounted, computed } from 'vue';
import * as fabric from 'fabric';
import { Form, FormItem, Input, Select, Button } from 'ant-design-vue';

import OfficeViewer from '#/components/OfficeEditor/computer-viewer.vue';
import { deskGroup } from '#/components/OfficeEditor/CanvasLeft/templates';

import useCanvas, {
  setCanvasTransform,
  selectedObject,
} from '#/components/OfficeEditor/hooks/useCanvas';
import { nonid } from '#/components/OfficeEditor/utils/common';
import useCanvasExport from '#/components/OfficeEditor/hooks/useCanvasExport';
const { exportJSON } = useCanvasExport();

// 更新对象名称
const updateObjectName = () => {
  const [canvas] = useCanvas();
  if (!canvas) return;

  if (!canvas || !selectedObject.value) return;

  const activeObject: any = canvas.getActiveObject();

  if (activeObject) {
    // 更新组合对象的name属性
    activeObject.name = selectedObject.value.name;

    // 查找并更新文本对象
    const objects = activeObject.getObjects();
    const textObject = objects.find(
      (obj: any) => obj.ownType === 'deskOwnerName',
    );
    if (textObject) {
      textObject.set('text', selectedObject.value.name || '未分配');
      canvas.renderAll();
    }
  }
};

// 获取对象类型的中文描述
// const getObjectType = (type: string) => {
//   const typeMap: Record<string, string> = {
//     rect: '矩形',
//     circle: '圆形',
//     triangle: '三角形',
//     iText: '文本',
//   }
//   return typeMap[type] || type
// }

// 计算当前是否选中元素
const isActiveing = computed(() => selectedObject.value);

// 初始化模板
const addTemplate = async () => {
  const [canvas] = useCanvas();
  if (!canvas) return;

  await canvas.loadFromJSON(deskGroup);

  // 遍历所有对象并锁定移动
  canvas.getObjects().forEach((obj: any) => {
    // 锁定移动、缩放和旋转属性，防止用户误操作或修改对象的属性
    obj.set({
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });

    if (obj.ownType === 'desk') {
      // 创建文本对象
      const deskOwnerText = obj.name || '未分配';

      const text = new fabric.IText(deskOwnerText, {
        ownType: 'deskOwnerName',
        left: obj.getCenterPoint().x,
        top: obj.getCenterPoint().y + 10,
        fontSize: 14,
        fill: '#333',
        textAlign: 'center',
        originX: 'center',
        originY: 'bottom',
      });

      // 创建组合
      const group = new fabric.Group([obj, text], {
        left: obj.left,
        top: obj.top,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });

      group.set('id', nonid(8));
      group.set('ownType', 'desk-group');
      group.set('number', obj.number); // 工位编号
      group.set('name', obj.name || '未分配'); // 人员名称

      // 替换原对象
      canvas.remove(obj);
      canvas.add(group);
    }
  });
  canvas.renderAll();
  setCanvasTransform();
};

onMounted(async () => {
  await nextTick();

  addTemplate();
});
</script>
