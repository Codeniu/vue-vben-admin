import useCanvas from './useCanvas';
import { LayerCommand } from '#/types/elements';
import useCanvasZindex from './useCanvasZindex';

export default () => {
  // 处理层级显示
  const layerElement = (command: LayerCommand) => {
    const [canvas] = useCanvas();
    if (!canvas) return;
    const { setZindex } = useCanvasZindex();

    const handleElement = canvas.getActiveObject();
    if (!handleElement) return;
    switch (command) {
      case LayerCommand.UP:
        canvas.bringObjectForward(handleElement);
        break;
      case LayerCommand.DOWN:
        canvas.sendObjectBackwards(handleElement);
        break;
      case LayerCommand.TOP:
        canvas.bringObjectToFront(handleElement);
        break;
      case LayerCommand.BOTTOM:
        canvas.sendObjectToBack(handleElement);
        break;
      default:
        break;
    }
    setZindex(canvas);
    canvas.renderAll();
  };

  return {
    layerElement,
  };
};
