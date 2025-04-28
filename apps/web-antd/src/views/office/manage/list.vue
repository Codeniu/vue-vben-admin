<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { getMenuList } from '#/api/system/menu';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '根据办公地点搜索',
      },
      defaultValue: '',
      fieldName: 'category',
      label: '办公地点',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入房间号',
      },
      fieldName: 'productName',
      label: '房间号',
    },

    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'Color1',
            value: '1',
          },
          {
            label: 'Color2',
            value: '2',
          },
        ],
        placeholder: '请选择所属业务组',
      },
      fieldName: 'color',
      label: '所属业务组',
    },

    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入管理员姓名',
      },
      fieldName: 'price',
      label: '管理员',
    },
    // {
    //   component: 'DatePicker',
    //   fieldName: 'datePicker',
    //   label: 'Date',
    // },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: true,
};

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { align: 'left', title: '办公地点', type: 'checkbox', width: 100 },
    { field: 'category', title: '楼层' },
    { field: 'color', title: '房间号' },
    { field: 'productName', title: '所属业务组' },
    { field: 'price', title: '管理员' },
    { field: 'releaseDate', formatter: 'formatDateTime', title: '工位数' },
  ],
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        message.success(`Query params: ${JSON.stringify(formValues)}`);
        return await getMenuList();
      },
    },
  },
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-ignore 正式环境时有完整的类型声明
    search: true,
  },
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });

const onCreate = () => {};
</script>

<template>
  <div class="vp-raw w-full">
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create') }}
        </Button>
      </template>
    </Grid>
  </div>
</template>
