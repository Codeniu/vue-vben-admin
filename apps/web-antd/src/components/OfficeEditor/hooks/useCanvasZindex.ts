import type { CanvasElement } from '#/types/canvas';
import type { Canvas } from 'fabric';

/**
 * @description 画布层级管理 Hook
 * @description 将画布中 id 为 PAINTER 的元素始终置底
 *
 * @example
 * ```ts
 * const { setZindex } = useCanvasZindex()
 * setZindex(canvas)
 * ```
 *
 * @returns {Object} 包含 setZindex 方法的对象
 * - setZindex: 设置画布元素层级顺序的方法
 */

export default () => {
  const setZindex = (canvas: Canvas) => {
    canvas.sendObjectToBack(
      canvas
        .getObjects()
        .filter((ele) => (ele as CanvasElement).id === 'PAINTER')[0],
    );
  };
  return {
    setZindex,
  };
};
