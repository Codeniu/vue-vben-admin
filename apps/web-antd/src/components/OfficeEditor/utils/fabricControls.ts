import { PiBy180, toFixed } from './common';
import { noop } from '@vueuse/core';
import {
  Control,
  controlsUtils,
  FabricObject,
  Point,
  type TDegree,
  type TPointerEvent,
  type Transform,
  type TransformActionHandler,
} from 'fabric';
import * as fabric from 'fabric';

/**
 * 旋转图标
 */
const rotateIcon = (angle: number) => {
  return `url("data:image/svg+xml,<svg height='20' width='20' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><g fill='none' transform='rotate(${angle} 16 16)'><path fill='white' d='M18.24 5.37C11.41 6.04 5.98 11.46 5.32 18.26L0 18.26L7.8 26L15.61 18.27L10.6 18.27C11.21 14.35 14.31 11.25 18.24 10.64L18.24 15.55L26 7.78L18.24 0L18.24 5.37Z'></path><path fill='black' d='M19.5463 6.61441C12.4063 6.68441 6.61632 12.4444 6.56632 19.5644L3.17632 19.5644L7.80632 24.1444L12.4363 19.5644L9.18632 19.5644C9.24632 13.8844 13.8563 9.28441 19.5463 9.22441L19.5463 12.3844L24.1463 7.78441L19.5463 3.16441L19.5463 6.61441Z'></path></g></svg>") 12 12,auto`;
};
/**
 * 获取旋转控件
 */
const getRotateControl = (angle: number): Partial<Control> => ({
  sizeX: 16,
  sizeY: 16,
  actionHandler: (eventData, transformData, x, y) => {
    transformData.target.canvas?.setCursor(
      rotateIcon(transformData.target.angle + angle),
    );
    return rotationWithSnapping(eventData, transformData, x, y);
  },
  cursorStyleHandler: (eventData, control, fabricObject) => {
    return rotateIcon(fabricObject.angle + angle);
  },
  render: noop,
  actionName: 'rotate',
});
/**
 * 旋转吸附，按住shift键，吸附15度角
 */
const rotationWithSnapping = (
  eventData: TPointerEvent,
  transform: Transform,
  x: number,
  y: number,
) => {
  const { shiftKey } = eventData;
  const { target } = transform;
  const { rotationWithSnapping } = controlsUtils;
  let snapAngle: TDegree | undefined;
  if (shiftKey) {
    snapAngle = target.snapAngle;
    target.snapAngle = 15;
  }
  const res = rotationWithSnapping(eventData, transform, x, y);
  if (snapAngle) {
    target.snapAngle = snapAngle;
  }
  return res;
};

export const changeObjectHeight: TransformActionHandler = (
  eventData: TPointerEvent,
  transform: Transform,
  x: number,
  y: number,
) => {
  const localPoint = controlsUtils.getLocalPoint(
    transform,
    transform.originX,
    transform.originY,
    x,
    y,
  );

  //  make sure the control changes width ONLY from it's side of target
  const { target } = transform;
  if (
    (transform.originY === 'top' && localPoint.y > 0) ||
    (transform.originY === 'bottom' && localPoint.y < 0)
  ) {
    const strokeWidth = target.strokeWidth ? target.strokeWidth : 0;
    if (!target.scaleY) return false;
    const strokePadding =
      strokeWidth / (target.strokeUniform ? target.scaleY : 1);
    const oldHeight = target.height;
    const newHeight = Math.ceil(
      Math.abs((localPoint.y * 1) / target.scaleY) - strokePadding,
    );
    target.set('height', Math.max(newHeight, 0));
    return oldHeight !== target.height;
  }
  return false;
};

export const changeObjectCurvature: TransformActionHandler = (
  eventData: TPointerEvent,
  transform: Transform,
  x: number,
  y: number,
) => {
  const target = transform.target as any;
  const localPoint = controlsUtils.getLocalPoint(
      transform,
      transform.originX,
      transform.originY,
      x,
      y,
    ),
    strokePadding =
      target.strokeWidth / (target.strokeUniform ? target.scaleX : 1),
    multiplier = transform.originY === 'center' ? 2 : 1,
    cy =
      ((localPoint.y +
        target.controls[transform.corner].offsetY -
        target.height / 2 +
        target._contentOffsetY) *
        multiplier) /
        target.scaleY -
      strokePadding;

  const textHeight = target.calcTextHeight();

  let radius;
  if (Math.abs(cy) <= textHeight / 2) {
    radius = 0;
  } else {
    radius = cy > 0 ? cy - textHeight / 2 : cy + textHeight / 2;
  }

  target.set(radius);
  return false;
};

/**
 * 获取通用控件属性
 */
const getHornControl = {
  cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
  actionHandler: controlsUtils.scalingEqually,
  actionName: 'scaling',
};

const changeWidth = controlsUtils.wrapWithFireEvent(
  'scaling',
  controlsUtils.wrapWithFixedAnchor(controlsUtils.changeWidth),
);

const changeHeight = controlsUtils.wrapWithFireEvent(
  'scaling',
  controlsUtils.wrapWithFixedAnchor(changeObjectHeight),
);

export const getWidthHeight = (fabricObject: FabricObject, noFixed = false) => {
  const objScale = fabricObject.getObjectScaling();
  const point = fabricObject._getTransformedDimensions({
    scaleX: objScale.x,
    scaleY: objScale.y,
  });
  if (!noFixed) {
    point.setX(toFixed(point.x));
    point.setY(toFixed(point.y));
  }
  return point;
};

/**
 * 更新ml, mr, mt, mb的控件大小
 */
const setCornersSize = (object: FabricObject) => {
  if (!object.canvas) return;
  const zoom = object.canvas.getZoom();
  const size = getWidthHeight(object).scalarMultiply(zoom);
  const controls = object.controls;
  const cornersH = ['ml', 'mr'];
  cornersH.forEach((corner) => {
    controls[corner].sizeX = object.cornerSize;
    controls[corner].sizeY = size.y;
    controls[corner].touchSizeX = object.touchCornerSize;
    controls[corner].touchSizeY = size.y;
  });
  const cornersV = ['mt', 'mb'];
  cornersV.forEach((corner) => {
    controls[corner].sizeX = size.x;
    controls[corner].sizeY = object.cornerSize;
    controls[corner].touchSizeX = size.x;
    controls[corner].touchSizeY = object.touchCornerSize;
  });
};

/**
 * 计算当前控件的位置
 */
const positionHandler: Control['positionHandler'] = (
  dim,
  finalMatrix,
  fabricObject,
  currentControl,
) => {
  return new Point(
    currentControl.x * dim.x + currentControl.offsetX,
    currentControl.y * dim.y + currentControl.offsetY,
  ).transform(finalMatrix);
};

export type TControlSet = Record<string, Control>;

export const defaultControls = (): TControlSet => ({
  size: new Control({
    x: 0,
    y: 0.5,
    cursorStyleHandler: () => '',
    offsetY: 14,
    sizeX: 0.0001,
    sizeY: 0.0001,
    touchSizeX: 0.0001,
    touchSizeY: 0.0001,
    render: (ctx, left, top, styleOverride, fabricObject: FabricObject) => {
      // todo: 支持组内反转的对象
      ctx.save();
      ctx.translate(left, top);

      const calcRotate = () => {
        const objectAngle = fabricObject.group
          ? fabricObject.getTotalAngle()
          : fabricObject.angle;
        const angleInRadians = objectAngle * PiBy180;
        const x = Math.sin(angleInRadians);
        const y = Math.cos(angleInRadians);
        const angle =
          Math.abs(x) > Math.abs(y)
            ? Math.sign(x) * 90
            : Math.sign(y) * 90 - 90;
        return (objectAngle - angle) * PiBy180;
      };

      ctx.rotate(calcRotate());

      const fontSize = 12;
      ctx.font = `${fontSize}px Tahoma`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const { x, y } = getWidthHeight(fabricObject);
      const text = `${x} × ${y}`;
      const width = ctx.measureText(text).width + 8;
      const height = fontSize + 6;

      // 背景
      ctx.fillStyle = '#0066ff';
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.fill();

      // 文字
      ctx.fillStyle = '#fff';
      ctx.fillText(text, 0, 1);
      ctx.restore();
    },
    positionHandler: (
      dim,
      finalMatrix,
      fabricObject: FabricObject,
      currentControl,
    ) => {
      const activeObject =
        fabricObject.canvas?.getActiveObject instanceof Function
          ? fabricObject.canvas?.getActiveObject()
          : null;

      if (activeObject && activeObject === fabricObject) {
        const angle = fabricObject.getTotalAngle();

        const angleInRadians = angle * PiBy180;

        const x = Math.sin(angleInRadians);
        const y = Math.cos(angleInRadians);

        if (Math.abs(x) >= Math.abs(y)) {
          const sign = Math.sign(x);
          currentControl.x = sign / 2;
          currentControl.y = 0;
          currentControl.offsetX = sign * 14;
          currentControl.offsetY = 0;
        } else {
          const sign = Math.sign(y);
          currentControl.x = 0;
          currentControl.y = sign / 2;
          currentControl.offsetX = 0;
          currentControl.offsetY = sign * 14;
        }

        // 更新其它corners大小，放到这里一起更新，来防止多次运行
        setCornersSize(fabricObject);
      }

      return positionHandler(dim, finalMatrix, fabricObject, currentControl);
    },
  }),

  // tlr , trr , brr , blr ：四个角的旋转控制点，分别对应0度、90度、180度和270度旋转
  tlr: new Control({
    x: -0.5,
    y: -0.5,
    offsetX: -4,
    offsetY: -4,
    ...getRotateControl(0),
  }),

  trr: new Control({
    x: 0.5,
    y: -0.5,
    offsetX: 4,
    offsetY: -4,
    ...getRotateControl(90),
  }),

  brr: new Control({
    x: 0.5,
    y: 0.5,
    offsetX: 4,
    offsetY: 4,
    ...getRotateControl(180),
  }),

  blr: new Control({
    x: -0.5,
    y: 0.5,
    offsetX: -4,
    offsetY: 4,
    ...getRotateControl(270),
  }),

  // ml , mr ：左右两侧的宽度缩放控制点
  ml: new Control({
    x: -0.5,
    y: 0,
    actionHandler: controlsUtils.scalingXOrSkewingY,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'scaling',
    render: noop,
  }),

  mr: new Control({
    x: 0.5,
    y: 0,
    actionHandler: controlsUtils.scalingXOrSkewingY,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'scaling',
    render: noop,
  }),

  // mt , mb ：上下两侧的高度缩放控制点
  mb: new Control({
    x: 0,
    y: 0.5,
    actionHandler: controlsUtils.scalingYOrSkewingX,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'scaling',
    render: noop,
  }),

  mt: new Control({
    x: 0,
    y: -0.5,
    actionHandler: controlsUtils.scalingYOrSkewingX,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: 'scaling',
    render: noop,
  }),

  // tl , tr , bl , br ：四个角的控制点
  tl: new Control({
    x: -0.5,
    y: -0.5,
    ...getHornControl,
  }),

  tr: new Control({
    x: 0.5,
    y: -0.5,
    ...getHornControl,
  }),

  bl: new Control({
    x: -0.5,
    y: 0.5,
    ...getHornControl,
  }),

  br: new Control({
    x: 0.5,
    y: 0.5,
    ...getHornControl,
  }),
});

// 用于创建对象调整大小的控制点
export const resizeControls = (): TControlSet => ({
  // 左侧控制点
  mr: new Control({
    x: 0.5,
    y: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    render: noop,
  }),
  // 右侧控制点
  ml: new Control({
    x: -0.5,
    y: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    render: noop,
  }),
  // 顶部控制点
  mt: new Control({
    x: 0,
    y: -0.5,
    actionHandler: changeHeight,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    render: noop,
  }),
  // 底部控制点
  mb: new Control({
    x: 0,
    y: 0.5,
    actionHandler: changeHeight,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    render: noop,
  }),
});

// 初始化控制点样式
export const initControlStyle = () => {
  // FabricObject.ownDefaults.borderColor = mode.value === 'view' ? 'red' : '#41B883'

  fabric.InteractiveFabricObject.ownDefaults = {
    ...fabric.InteractiveFabricObject.ownDefaults,
    borderColor: '#F04135',
    cornerStrokeColor: '#F04135',
    cornerColor: '#F04135',
    cornerStyle: 'rect',
    padding: 10,
    // cornerDashArray: [1, 1],
    // borderDashArray: [1, 1, 1],
    cornerSize: 8, // 设置为0时，将隐藏所有角点
    borderScaleFactor: 1, // 设置为1时，将使对象的边框始终与对象的尺寸相同
    transparentCorners: true, // 设置为true时，将隐藏所有角点
    centeredScaling: true, // 设置为true时，将使对象围绕其中心点进行缩放
    objectCaching: false, // 设置为true时，将使对象的缓存失效
  };
};

export const textboxControls = (): TControlSet => ({
  ...defaultControls(),
  ...resizeControls(),
});
