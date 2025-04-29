// 计算两个状态之间的差异
export const calculateDiff = (oldState: any, newState: any) => {
  const diff: any = {};
  // 遍历新状态的所有对象
  newState.objects?.forEach((newObj: any, index: number) => {
    const oldObj = oldState.objects?.[index];
    if (!oldObj) {
      // 新增的对象
      diff[index] = { type: 'add', object: newObj };
    } else if (JSON.stringify(newObj) !== JSON.stringify(oldObj)) {
      // 修改的对象
      diff[index] = { type: 'modify', object: newObj };
    }
  });
  // 检查删除的对象
  oldState.objects?.forEach((oldObj: any, index: number) => {
    if (!newState.objects?.[index]) {
      diff[index] = { type: 'delete' };
    }
  });
  return diff;
};

// 应用差异到状态
export const applyDiff = (state: any, diff: any) => {
  const newState = JSON.parse(JSON.stringify(state));
  Object.entries(diff).forEach(([index, change]: [string, any]) => {
    const idx = parseInt(index);
    switch (change.type) {
      case 'add':
      case 'modify':
        if (!newState.objects) newState.objects = [];
        newState.objects[idx] = change.object;
        break;
      case 'delete':
        newState.objects.splice(idx, 1);
        break;
    }
  });
  return newState;
};
