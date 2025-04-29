import { getObjectsBoundingBox } from '../utils/fabric';
import useCanvas, { getPainter } from './useCanvas';
import { Point } from 'fabric';
import * as fabric from 'fabric';

export default () => {
  const [canvas] = useCanvas();

  // 获取所有元素
  const objects = canvas.getObjects();

  // 获取所有元素的边界框
  const boundingBox = getObjectsBoundingBox(objects);

  // console.log({ boundingBox, objects, arr: canvas.getObjects() })

  const painter = getPainter();
  const painterBox = painter
    ? getObjectsBoundingBox([painter as fabric.Object])
    : null;

  let left = 0,
    top = 0;
  let centerPoint = canvas.getCenterPoint();
  let width = canvas.getWidth(),
    height = canvas.getHeight();

  // 导出全部的元素，不裁剪
  if (boundingBox) {
    centerPoint = new Point(boundingBox.centerX, boundingBox.centerY);
    width = boundingBox.width;
    height = boundingBox.height;
    left = boundingBox.centerX - boundingBox.width / 2;
    top = boundingBox.centerY - boundingBox.height / 2;
  }

  // 导出画布大小的元素, 裁剪
  if (painterBox) {
    centerPoint = new Point(painterBox.centerX, painterBox.centerY);
    width = painterBox.width;
    height = painterBox.height;
    left = painterBox.centerX - painterBox.width / 2;
    top = painterBox.centerY - painterBox.height / 2;
  }

  return {
    width,
    height,
    left,
    top,
    centerPoint,
  };
};
