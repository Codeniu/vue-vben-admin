import { FabricObject, util, Point } from 'fabric';

/**
 * @description 从 fabric 对象数组中计算边界框
 * @param {FabricObject[]} objects - fabric 对象数组
 * @param {boolean} [ignoreOffset] - 是否忽略偏移量
 * @returns {{
 *   centerX: number,
 *   centerY: number,
 *   width: number,
 *   height: number
 * } | null} 返回边界框的中心点坐标和尺寸，如果数组为空则返回 null
 */
export const getObjectsBoundingBox = (
  objects: FabricObject[],
  ignoreOffset?: boolean,
) => {
  if (objects.length === 0) {
    return null;
  }
  const objectBounds: Point[] = [];
  objects.forEach((object) => {
    const objCenter = object.getRelativeCenterPoint();
    let sizeVector = object._getTransformedDimensions().scalarDivide(2);
    if (object.angle) {
      const rad = util.degreesToRadians(object.angle),
        sine = Math.abs(util.sin(rad)),
        cosine = Math.abs(util.cos(rad)),
        rx = sizeVector.x * cosine + sizeVector.y * sine,
        ry = sizeVector.x * sine + sizeVector.y * cosine;
      sizeVector = new Point(rx, ry);
    }
    objectBounds.push(
      objCenter.subtract(sizeVector),
      objCenter.add(sizeVector),
    );
  });

  const { left, top, width, height } =
    util.makeBoundingBoxFromPoints(objectBounds);
  const size = new Point(width, height);
  const relativeCenter = (
    !ignoreOffset ? new Point(left, top) : new Point()
  ).add(size.scalarDivide(2));
  const center = relativeCenter.transform([1, 0, 0, 1, 0, 0]);

  return {
    centerX: center.x,
    centerY: center.y,
    width: size.x,
    height: size.y,
  };
};
