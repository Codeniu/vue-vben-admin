<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createDept, getDeptList, updateDept } from '#/api/system/dept';
import { $t } from '#/locales';
import { z } from '#/adapter/form';

const formSchema = [
  {
    component: 'ApiTreeSelect',
    componentProps: {
      allowClear: true,
      api: getDeptList,
      class: 'w-full',
      labelField: 'name',
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'pid',
    label: '办公地点',
  },

  {
    component: 'InputNumber',
    fieldName: 'name',
    label: '楼层',
    rules: z.number(),
    componentProps: {
      min: 0,
      max: 10,
      step: 1,
      class: 'w-full',
    },
  },

  {
    component: 'Input',
    fieldName: 'name',
    label: '房间号',
    rules: z.string(),
  },

  {
    component: 'ApiTreeSelect',
    componentProps: {
      allowClear: true,
      api: getDeptList,
      class: 'w-full',
      labelField: 'name',
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'pid',
    label: '管理员',
  },

  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: $t('common.enabled'), value: 1 },
        { label: $t('common.disabled'), value: 0 },
      ],
      optionType: 'button',
    },
    defaultValue: 1,
    fieldName: 'status',
    label: $t('system.dept.status'),
  },
  {
    component: 'Textarea',
    componentProps: {
      maxLength: 50,
      rows: 3,
      showCount: true,
      class: 'w-full',
    },
    fieldName: 'remark',
    label: $t('system.dept.remark'),
    rules: z
      .string()
      .max(50, $t('ui.formRules.maxLength', [$t('system.dept.remark'), 50]))
      .optional(),
  },
];

const emit = defineEmits(['success']);
const formData = ref<SystemDeptApi.SystemDept>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['办公室'])
    : $t('ui.actionTitle.create', ['办公室']);
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: formSchema,
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        await (formData.value?.id
          ? updateDept(formData.value.id, data)
          : createDept(data));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemDeptApi.SystemDept>();
      if (data) {
        if (data.pid === 0) {
          data.pid = undefined;
        }
        formData.value = data;
        formApi.setValues(formData.value);
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm"> 重置 </Button>
      </div>
    </template>
  </Modal>
</template>
