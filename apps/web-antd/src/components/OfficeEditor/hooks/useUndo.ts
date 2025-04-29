import { ref } from 'vue';
import useCanvas, { setCanvasTransform } from './useCanvas';
import { calculateDiff } from '../utils/useDiff';
import useCanvasExport from './useCanvasExport';

// 操作历史栈配置
const MAX_HISTORY_LENGTH = 20; // 最大历史记录数
const historyStack = ref<Array<{ state: any; diff: any }>>([]); // 存储状态和差异
const currentHistoryIndex = ref(-1);

const { getJSONData } = useCanvasExport();

// 保存当前状态到历史栈
// 待优化
export const saveToHistory = () => {
  const [canvas] = useCanvas();
  if (!canvas) return;

  // 移除当前索引之后的所有历史记录
  if (currentHistoryIndex.value < historyStack.value.length - 1) {
    historyStack.value = historyStack.value.slice(
      0,
      currentHistoryIndex.value + 1,
    );
  }

  // 获取当前状态
  const currentState = getJSONData();

  // 过滤掉辅助线对象
  // 辅助线会在撤销操作后通过initGuideLines重新初始化
  if (currentState.objects && Array.isArray(currentState.objects)) {
    currentState.objects = currentState.objects.filter((obj: any) => {
      // 根据辅助线的特征进行过滤
      // 检查name属性和其他辅助线特征
      return !(
        obj.name === 'modifyPolyline' ||
        (obj.type === 'line' &&
          obj.strokeDashArray &&
          obj.selectable === false &&
          obj.evented === false)
      );
    });
  }

  const previousState =
    currentHistoryIndex.value >= 0
      ? historyStack.value[currentHistoryIndex.value].state
      : { objects: [] };

  // 计算差异并保存
  const diff = calculateDiff(previousState, currentState);
  historyStack.value.push({ state: currentState, diff });
  currentHistoryIndex.value++;

  // 限制历史栈大小
  if (historyStack.value.length > MAX_HISTORY_LENGTH) {
    historyStack.value.shift();
    currentHistoryIndex.value--;
  }
};

// 撤销操作
export const undo = () => {
  //   console.log('undo', currentHistoryIndex.value)

  const [canvas] = useCanvas();

  if (!canvas || currentHistoryIndex.value <= 0) return;

  currentHistoryIndex.value--;
  const previousState = historyStack.value[currentHistoryIndex.value].state;

  // 应用状态
  canvas.loadFromJSON(previousState, () => {
    canvas?.renderAll();
    setCanvasTransform();

    // 重新初始化辅助线，确保撤销后辅助线吸附功能仍然生效
    import('./useSnap').then(({ initGuideLines }) => {
      initGuideLines(canvas);
    });
  });
};
