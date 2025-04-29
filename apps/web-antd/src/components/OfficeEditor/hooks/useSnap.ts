import { ref } from 'vue';
import * as fabric from 'fabric';

// 吸附功能配置
const SNAP_THRESHOLD = 10; // 吸附阈值，当对象之间的距离小于此值时触发吸附
const SNAP_GRID = 20; // 网格吸附大小
const snapEnabled = ref(true); // 是否启用吸附功能
const showGuides = ref(true); // 是否显示辅助线

// 辅助线对象
let horizontalGuide: fabric.Line | null = null;
let verticalGuide: fabric.Line | null = null;

// 初始化辅助线
const initGuideLines = (canvas: fabric.Canvas) => {
  if (!canvas) return;

  // 监听对象移动事件，用于实现吸附功能
  canvas.on('object:moving', (e) => handleObjectMoving(e, canvas));

  // 创建水平辅助线
  horizontalGuide = new fabric.Line([0, 0, 0, 0], {
    name: 'modifyPolyline',
    stroke: '#00aeff',
    strokeWidth: 1,
    selectable: false,
    evented: false,
    strokeDashArray: [5, 5],
    visible: false,
  });

  // 创建垂直辅助线
  verticalGuide = new fabric.Line([0, 0, 0, 0], {
    name: 'modifyPolyline',
    stroke: '#00aeff',
    strokeWidth: 1,
    selectable: false,
    evented: false,
    strokeDashArray: [5, 5],
    visible: false,
  });

  // 添加辅助线到画布
  canvas.add(horizontalGuide);
  canvas.add(verticalGuide);
};

// 隐藏辅助线
const hideGuideLines = () => {
  if (!horizontalGuide || !verticalGuide) return;

  horizontalGuide.set({ visible: false });
  verticalGuide.set({ visible: false });
};

// 显示辅助线
const showGuideLines = (canvas: fabric.Canvas) => {
  if (!canvas || !horizontalGuide || !verticalGuide || !showGuides.value)
    return;

  horizontalGuide.set({ visible: true });
  verticalGuide.set({ visible: true });
};

// 获取对象的边界信息
const getObjectBounds = (obj: any) => {
  const width = obj.getScaledWidth();
  const height = obj.getScaledHeight();
  const left = obj.left;
  const top = obj.top;

  return {
    top,
    left,
    bottom: top + height,
    right: left + width,
    width,
    height,
  };
};

// 处理对象移动事件，实现吸附功能
const handleObjectMoving = (e: any, canvas: fabric.Canvas) => {
  if (!canvas || !snapEnabled.value) return;

  const movingObject = e.target;
  const objBounds = getObjectBounds(movingObject);

  // 初始化吸附状态
  let snapHorizontal = false;
  let snapVertical = false;

  // 隐藏辅助线
  if (horizontalGuide && verticalGuide) {
    horizontalGuide.set({ visible: false });
    verticalGuide.set({ visible: false });
  }

  // 获取画布中的所有对象
  const objects = canvas.getObjects().filter((obj: any) => {
    return (
      obj !== movingObject &&
      obj !== horizontalGuide &&
      obj !== verticalGuide &&
      obj.name !== 'painter' && // 排除背景
      obj.visible !== false
    );
  });

  // 网格吸附
  if (SNAP_GRID > 0) {
    // 水平方向网格吸附
    const gridSnapX = Math.round(movingObject.left / SNAP_GRID) * SNAP_GRID;
    if (Math.abs(gridSnapX - movingObject.left) < SNAP_THRESHOLD) {
      movingObject.set({ left: gridSnapX });
      snapVertical = true;

      // 显示垂直辅助线
      if (verticalGuide && showGuides.value) {
        const zoom = canvas.getZoom();
        const vpt = canvas.viewportTransform;
        const lineX = gridSnapX * zoom + vpt[4];

        verticalGuide.set({
          x1: lineX,
          y1: 0,
          x2: lineX,
          y2: canvas.height,
          visible: true,
        });
      }
    }

    // 垂直方向网格吸附
    const gridSnapY = Math.round(movingObject.top / SNAP_GRID) * SNAP_GRID;
    if (Math.abs(gridSnapY - movingObject.top) < SNAP_THRESHOLD) {
      movingObject.set({ top: gridSnapY });
      snapHorizontal = true;

      // 显示水平辅助线
      if (horizontalGuide && showGuides.value) {
        const zoom = canvas.getZoom();
        const vpt = canvas.viewportTransform;
        const lineY = gridSnapY * zoom + vpt[5];

        horizontalGuide.set({
          x1: 0,
          y1: lineY,
          x2: canvas.width,
          y2: lineY,
          visible: true,
        });
      }
    }
  }

  // 对象之间的吸附
  for (const obj of objects) {
    const targetBounds = getObjectBounds(obj);

    // 如果还没有水平吸附，检查水平方向的吸附点
    if (!snapHorizontal) {
      // 顶部对齐
      if (Math.abs(objBounds.top - targetBounds.top) < SNAP_THRESHOLD) {
        movingObject.set({ top: targetBounds.top });
        snapHorizontal = true;

        // 显示水平辅助线
        if (horizontalGuide && showGuides.value) {
          const zoom = canvas.getZoom();
          const vpt = canvas.viewportTransform;
          const lineY = targetBounds.top * zoom + vpt[5];

          horizontalGuide.set({
            x1: 0,
            y1: lineY,
            x2: canvas.width,
            y2: lineY,
            visible: true,
          });
        }
      }
      // 底部对齐
      else if (
        Math.abs(objBounds.bottom - targetBounds.bottom) < SNAP_THRESHOLD
      ) {
        movingObject.set({ top: targetBounds.bottom - objBounds.height });
        snapHorizontal = true;

        // 显示水平辅助线
        if (horizontalGuide && showGuides.value) {
          const zoom = canvas.getZoom();
          const vpt = canvas.viewportTransform;
          const lineY = targetBounds.bottom * zoom + vpt[5];

          horizontalGuide.set({
            x1: 0,
            y1: lineY,
            x2: canvas.width,
            y2: lineY,
            visible: true,
          });
        }
      }
      // 中心对齐
      else if (
        Math.abs(
          objBounds.top +
            objBounds.height / 2 -
            (targetBounds.top + targetBounds.height / 2),
        ) < SNAP_THRESHOLD
      ) {
        movingObject.set({
          top:
            targetBounds.top + targetBounds.height / 2 - objBounds.height / 2,
        });
        snapHorizontal = true;

        // 显示水平辅助线
        if (horizontalGuide && showGuides.value) {
          const zoom = canvas.getZoom();
          const vpt = canvas.viewportTransform;
          const lineY =
            (targetBounds.top + targetBounds.height / 2) * zoom + vpt[5];

          horizontalGuide.set({
            x1: 0,
            y1: lineY,
            x2: canvas.width,
            y2: lineY,
            visible: true,
          });
        }
      }
    }

    // 如果还没有垂直吸附，检查垂直方向的吸附点
    if (!snapVertical) {
      // 左侧对齐
      if (Math.abs(objBounds.left - targetBounds.left) < SNAP_THRESHOLD) {
        movingObject.set({ left: targetBounds.left });
        snapVertical = true;

        // 显示垂直辅助线
        if (verticalGuide && showGuides.value) {
          const zoom = canvas.getZoom();
          const vpt = canvas.viewportTransform;
          const lineX = targetBounds.left * zoom + vpt[4];

          verticalGuide.set({
            x1: lineX,
            y1: 0,
            x2: lineX,
            y2: canvas.height,
            visible: true,
          });
        }
      }
      // 右侧对齐
      else if (
        Math.abs(objBounds.right - targetBounds.right) < SNAP_THRESHOLD
      ) {
        movingObject.set({ left: targetBounds.right - objBounds.width });
        snapVertical = true;

        // 显示垂直辅助线
        if (verticalGuide && showGuides.value) {
          const zoom = canvas.getZoom();
          const vpt = canvas.viewportTransform;
          const lineX = targetBounds.right * zoom + vpt[4];

          verticalGuide.set({
            x1: lineX,
            y1: 0,
            x2: lineX,
            y2: canvas.height,
            visible: true,
          });
        }
      }
      // 中心对齐
      else if (
        Math.abs(
          objBounds.left +
            objBounds.width / 2 -
            (targetBounds.left + targetBounds.width / 2),
        ) < SNAP_THRESHOLD
      ) {
        movingObject.set({
          left:
            targetBounds.left + targetBounds.width / 2 - objBounds.width / 2,
        });
        snapVertical = true;

        // 显示垂直辅助线
        if (verticalGuide && showGuides.value) {
          const zoom = canvas.getZoom();
          const vpt = canvas.viewportTransform;
          const lineX =
            (targetBounds.left + targetBounds.width / 2) * zoom + vpt[4];

          verticalGuide.set({
            x1: lineX,
            y1: 0,
            x2: lineX,
            y2: canvas.height,
            visible: true,
          });
        }
      }
    }

    // 如果已经找到了水平和垂直的吸附点，就不再继续查找
    if (snapHorizontal && snapVertical) break;
  }
};

// 切换吸附功能
const toggleSnap = () => {
  snapEnabled.value = !snapEnabled.value;
};

// 切换辅助线显示
const toggleGuides = () => {
  showGuides.value = !showGuides.value;
};

export {
  initGuideLines,
  hideGuideLines,
  showGuideLines,
  handleObjectMoving,
  toggleSnap,
  toggleGuides,
  snapEnabled,
  showGuides,
};
