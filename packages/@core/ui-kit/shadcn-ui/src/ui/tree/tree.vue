<script lang="ts" setup>
import type { Arrayable } from '@vueuse/core';
import type { FlattenedItem } from 'radix-vue';

import type { ClassType, Recordable } from '@vben-core/typings';

import type { TreeProps } from './types';

import { onMounted, ref, watchEffect } from 'vue';

import { ChevronRight, IconifyIcon } from '@vben-core/icons';
import { cn, get } from '@vben-core/shared/utils';

import { TreeItem, TreeRoot } from 'radix-vue';

import { Checkbox } from '../checkbox';

const props = withDefaults(defineProps<TreeProps>(), {
  allowClear: false,
  autoCheckParent: true,
  bordered: false,
  checkStrictly: false,
  defaultExpandedKeys: () => [],
  defaultExpandedLevel: 0,
  disabled: false,
  disabledField: 'disabled',
  expanded: () => [],
  iconField: 'icon',
  labelField: 'label',
  multiple: false,
  showIcon: true,
  transition: true,
  valueField: 'value',
  childrenField: 'children',
});

const emits = defineEmits<{
  expand: [value: FlattenedItem<Recordable<any>>];
  select: [value: FlattenedItem<Recordable<any>>];
}>();

interface InnerFlattenItem<T = Recordable<any>, P = number | string> {
  hasChildren: boolean;
  level: number;
  parents: P[];
  value: T;
}

function flatten<T = Recordable<any>, P = number | string>(
  items: T[],
  childrenField: string = 'children',
  level = 0,
  parents: P[] = [],
): InnerFlattenItem<T, P>[] {
  const result: InnerFlattenItem<T, P>[] = [];
  items.forEach((item) => {
    const children = get(item, childrenField) as Array<T>;
    const val = {
      hasChildren: Array.isArray(children) && children.length > 0,
      level,
      parents: [...parents],
      value: item,
    };
    result.push(val);
    if (val.hasChildren)
      result.push(
        ...flatten(children, childrenField, level + 1, [
          ...parents,
          get(item, props.valueField),
        ]),
      );
  });
  return result;
}

const flattenData = ref<Array<InnerFlattenItem>>([]);
const modelValue = defineModel<Arrayable<number | string>>();
const expanded = ref<Array<number | string>>(props.defaultExpandedKeys ?? []);

const treeValue = ref();

onMounted(() => {
  watchEffect(() => {
    flattenData.value = flatten(props.treeData, props.childrenField);
    updateTreeValue();
    if (
      props.defaultExpandedLevel !== undefined &&
      props.defaultExpandedLevel > 0
    )
      expandToLevel(props.defaultExpandedLevel);
  });
});

function getItemByValue(value: number | string) {
  return flattenData.value.find(
    (item) => get(item.value, props.valueField) === value,
  )?.value;
}

function updateTreeValue() {
  const val = modelValue.value;
  if (val === undefined) {
    treeValue.value = undefined;
  } else {
    if (Array.isArray(val)) {
      const filteredValues = val.filter((v) => {
        const item = getItemByValue(v);
        return item && !get(item, props.disabledField);
      });
      treeValue.value = filteredValues.map((v) => getItemByValue(v));

      if (filteredValues.length !== val.length) {
        modelValue.value = filteredValues;
      }
    } else {
      const item = getItemByValue(val);
      if (item && !get(item, props.disabledField)) {
        treeValue.value = item;
      } else {
        treeValue.value = undefined;
        modelValue.value = undefined;
      }
    }
  }
}

function updateModelValue(val: Arrayable<Recordable<any>>) {
  if (Array.isArray(val)) {
    const filteredVal = val.filter((v) => !get(v, props.disabledField));
    modelValue.value = filteredVal.map((v) => get(v, props.valueField));
  } else {
    if (val && !get(val, props.disabledField)) {
      modelValue.value = get(val, props.valueField);
    }
  }
}

function expandToLevel(level: number) {
  const keys: string[] = [];
  flattenData.value.forEach((item) => {
    if (item.level <= level - 1) {
      keys.push(get(item.value, props.valueField));
    }
  });
  expanded.value = keys;
}

function collapseNodes(value: Arrayable<number | string>) {
  const keys = new Set(Array.isArray(value) ? value : [value]);
  expanded.value = expanded.value.filter((key) => !keys.has(key));
}

function expandNodes(value: Arrayable<number | string>) {
  const keys = [...(Array.isArray(value) ? value : [value])];
  keys.forEach((key) => {
    if (expanded.value.includes(key)) return;
    const item = getItemByValue(key);
    if (item) {
      expanded.value.push(key);
    }
  });
}

function expandAll() {
  expanded.value = flattenData.value
    .filter((item) => item.hasChildren)
    .map((item) => get(item.value, props.valueField));
}

function collapseAll() {
  expanded.value = [];
}

function isNodeDisabled(item: FlattenedItem<Recordable<any>>) {
  return props.disabled || get(item.value, props.disabledField);
}

function onToggle(item: FlattenedItem<Recordable<any>>) {
  emits('expand', item);
}
function onSelect(item: FlattenedItem<Recordable<any>>, isSelected: boolean) {
  if (isNodeDisabled(item)) {
    return;
  }

  if (
    !props.checkStrictly &&
    props.multiple &&
    props.autoCheckParent &&
    isSelected
  ) {
    flattenData.value
      .find((i) => {
        return (
          get(i.value, props.valueField) === get(item.value, props.valueField)
        );
      })
      ?.parents?.forEach((p) => {
        if (Array.isArray(modelValue.value) && !modelValue.value.includes(p)) {
          modelValue.value.push(p);
        }
      });
  }
  updateTreeValue();
  emits('select', item);
}

defineExpose({
  collapseAll,
  collapseNodes,
  expandAll,
  expandNodes,
  expandToLevel,
  getItemByValue,
});
</script>
<template>
  <TreeRoot
    :get-key="(item) => get(item, valueField)"
    :get-children="(item) => get(item, childrenField)"
    :items="treeData"
    :model-value="treeValue"
    v-model:expanded="expanded as string[]"
    :default-expanded="defaultExpandedKeys as string[]"
    :propagate-select="!checkStrictly"
    :multiple="multiple"
    :disabled="disabled"
    :selection-behavior="allowClear || multiple ? 'toggle' : 'replace'"
    @update:model-value="updateModelValue"
    v-slot="{ flattenItems }"
    :class="
      cn(
        'text-blackA11 container select-none list-none rounded-lg p-2 text-sm font-medium',
        $attrs.class as unknown as ClassType,
        bordered ? 'border' : '',
      )
    "
  >
    <div class="w-full" v-if="$slots.header">
      <slot name="header"> </slot>
    </div>
    <TransitionGroup :name="transition ? 'fade' : ''">
      <TreeItem
        v-for="item in flattenItems"
        v-slot="{
          isExpanded,
          isSelected,
          isIndeterminate,
          handleSelect,
          handleToggle,
        }"
        :key="item._id"
        :style="{ 'padding-left': `${item.level - 0.5}rem` }"
        :class="
          cn('cursor-pointer', getNodeClass?.(item), {
            'data-[selected]:bg-accent': !multiple,
            'cursor-not-allowed': isNodeDisabled(item),
          })
        "
        v-bind="
          Object.assign(item.bind, {
            onfocus: isNodeDisabled(item) ? 'this.blur()' : undefined,
            disabled: isNodeDisabled(item),
          })
        "
        @select="
          (event: any) => {
            if (isNodeDisabled(item)) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            if (event.detail.originalEvent.type === 'click') {
              event.preventDefault();
            }
            onSelect(item, event.detail.isSelected);
          }
        "
        @toggle="
          (event: any) => {
            if (event.detail.originalEvent.type === 'click') {
              event.preventDefault();
            }
            !isNodeDisabled(item) && onToggle(item);
          }
        "
        class="tree-node focus:ring-grass8 my-0.5 flex items-center rounded px-2 py-1 outline-none focus:ring-2"
      >
        <ChevronRight
          v-if="
            item.hasChildren &&
            Array.isArray(item.value[childrenField]) &&
            item.value[childrenField].length > 0
          "
          class="size-4 cursor-pointer transition"
          :class="{ 'rotate-90': isExpanded }"
          @click.stop="
            () => {
              handleToggle();
              onToggle(item);
            }
          "
        />
        <div v-else class="h-4 w-4">
          <!-- <IconifyIcon v-if="item.value.icon" :icon="item.value.icon" /> -->
        </div>
        <Checkbox
          v-if="multiple"
          :checked="isSelected && !isNodeDisabled(item)"
          :disabled="isNodeDisabled(item)"
          :indeterminate="isIndeterminate && !isNodeDisabled(item)"
          @click="
            (event: MouseEvent) => {
              if (isNodeDisabled(item)) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              handleSelect();
            }
          "
        />
        <div
          class="flex items-center gap-1 pl-2"
          @click="
            (event: MouseEvent) => {
              if (isNodeDisabled(item)) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              event.stopPropagation();
              event.preventDefault();
              handleSelect();
            }
          "
        >
          <slot name="node" v-bind="item">
            <IconifyIcon
              class="size-4"
              v-if="showIcon && get(item.value, iconField)"
              :icon="get(item.value, iconField)"
            />
            {{ get(item.value, labelField) }}
          </slot>
        </div>
      </TreeItem>
    </TransitionGroup>
    <div class="w-full" v-if="$slots.footer">
      <slot name="footer"> </slot>
    </div>
  </TreeRoot>
</template>
<style lang="scss" scoped>
.container {
  position: relative;
  padding: 0;
  list-style-type: none;
}

.item {
  box-sizing: border-box;
  width: 100%;
  height: 30px;
  background-color: #f3f3f3;
  border: 1px solid #666;
}

/* 1. 声明过渡效果 */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. 声明进入和离开的状态 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. 确保离开的项目被移除出了布局流
      以便正确地计算移动时的动画效果。 */
.fade-leave-active {
  position: absolute;
}
</style>
