import { ref } from 'vue';
import type { ImageFormat } from 'fabric';
import useCanvas from './useCanvas';
import useCenter from './useCenter';

const propertiesToInclude = [
  'id',
  'name', // 内置属性 工位使用人姓名
  'ownType', // 内置属性 'desk'  标识该对象为一个工位
  'layer',
  'isShow',
  'editable',
  'color',
  'axis',
  'mask',
  'padding',
  'cropKey',
  'cropPath',
  'cropSize',
  'fill',
  'selectable',
  'evented',
  'fillType',
  'fillURL',
  'fillRepeat',
  'lockMovementX',
  'lockMovementY',
  'objectCaching',
  'transparentCorners',
  'codeOption',
  'codeContent',
  'background',
  'hasBorders',
  'originSrc',
  'radius',
  'curvature',
  'effect',
  'reverse',
  'startStyle',
  'endStyle',
  'effects',
  'mask',
  'originSrc',
  'originWidth',
  'originHeight',
  'globalCompositeOperation',
];

export default () => {
  const Exporting = ref(false);
  // 导出图片
  const exportImage = (format: ImageFormat = 'png', quality: number = 1) => {
    Exporting.value = true;
    const [canvas] = useCanvas();
    const { left, top, width, height } = useCenter();
    const zoom = canvas.getZoom();
    console.log({ left, top, width, height, zoom });
    const viewportTransform = canvas.viewportTransform;

    const activeObject = canvas.getActiveObject();
    if (activeObject) canvas.discardActiveObject();
    canvas.set({ background: 'rgba(255,255,255,0)' });
    canvas.renderAll();

    // 导出图片的范围为全部元素不会裁剪

    const result = canvas.toDataURL({
      multiplier: 1 / zoom, // 调整输出图片的缩放比例
      quality: quality, // 图片质量
      format: format, // 输出格式
      width: width * zoom, // 导出宽度（考虑缩放）
      height: height * zoom, // 导出高度（考虑缩放）
      left: left * zoom + viewportTransform[4], // 左边距（考虑缩放和视图变换）
      top: top * zoom + viewportTransform[5], // 上边距（考虑缩放和视图变换）
    });

    const link = document.createElement('a');
    link.href = result;
    link.download = `office-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Exporting.value = false;
  };

  const getJSONData = () => {
    const [canvas] = useCanvas();
    const serializer = canvas.toObject(propertiesToInclude);
    return serializer;
  };

  // 导出json
  const exportJSON = () => {
    const serializer = getJSONData();
    const blob = new Blob([JSON.stringify(serializer)]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `office-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导出当前选中的元素
  const exportActive = () => {
    const [canvas] = useCanvas();
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const serializer = activeObject.toObject(propertiesToInclude);
      const blob = new Blob([JSON.stringify(serializer)]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = activeObject.name
        ? `${activeObject.name}.json`
        : `el-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return {
    exportImage,
    exportJSON,
    Exporting,
    exportActive,
    getJSONData,
  };
};
