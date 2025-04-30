<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { Button, message } from 'ant-design-vue';
import { Plus } from '@vben/icons';
import { Page, useVbenModal } from '@vben/common-ui';

import type { VbenFormProps } from '#/adapter/form';
import type { OnActionClickParams, VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteDept, getExampleTableApi } from '#/api';

import Form from './modules/form.vue';

// import { getMenuList } from '#/api/system/menu';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const formOptions: VbenFormProps = {
  actionButtonsReverse: true, // 查询在前，重置在后
  wrapperClass: 'grid-cols-5', // 设置表单布局为5列
  showCollapseButton: false, // 控制表单是否显示折叠按钮
  collapsed: false, // 默认展开
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

  // 提交按钮配置项
  submitButtonOptions: {
    content: '查询',
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: true,
  handleSubmit() {
    gridApi.query();
  },
};

function onEdit(row: any) {
  formModalApi.setData(row).open();
}

function onAppend(row: any) {
  formModalApi.setData({ pid: row.id }).open();
}

function onCreate() {
  formModalApi.setData(null).open();
}

// 删除
function onDelete(row: any) {
  const hideLoading = message.loading({
    content: `正在删除${row.name}`,
    duration: 0,
    key: 'action_process_msg',
  });
  // todo
  deleteDept(row.id)
    .then(() => {
      message.success({
        content: '删除成功',
        key: 'action_process_msg',
      });
      gridApi.query();
    })
    .catch(() => {
      hideLoading();
    });
}

// 表格操作按钮回调
function onActionClick({ code, row }: OnActionClickParams<any>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    default: {
      break;
    }
  }
}

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    // labelField: 'id',
  },
  columns: [
    { type: 'checkbox', width: 50 },
    { title: '序号', type: 'seq', width: 50 },
    { field: 'place', title: '办公地点', width: 100 },
    { field: 'category', title: '楼层' },
    { field: 'color', title: '房间号' },
    { field: 'productName', title: '所属业务组' },
    { field: 'price', title: '管理员' },
    // {
    //   field: 'releaseDate',
    //   formatter: 'formatDateTime', // 时间格式化
    //   title: '更新时间',
    // },
    {
      field: 'releaseDate',
      title: '工位数',
      cellRender: {
        name: 'CellLink',
        // props: { text: '设置' }, // 如果不传text的值则显示表格数据
      },
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          'delete', // 默认的删除按钮
          {
            code: 'append',
            text: '设置工位',
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 200,
    },
  ],
  keepSource: true,

  // height: 'auto',

  // 是否开启分页
  pagerConfig: {
    enabled: true,
  },

  // 配置数据请求接口(使用次方式主要是为了跟表单做配合)
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        // message.success(`Query params: ${JSON.stringify(formValues)}`);

        // 分页关闭
        // return await getMenuList();

        // 分页开启
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },

  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-ignore
    search: true,
  },
  data: [],
};

onMounted(() => {
  // getMenuList().then((res: any) => {
  //   dataSource.value = res || [];
  //   gridApi.setState({
  //     gridOptions: {
  //       data: res || [],
  //     },
  //   });
  // });
});

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function refreshGrid() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate" class="mr-4">
          <Plus class="size-4" />
          新增
        </Button>
        <Button type="primary" @click="onCreate"> 导出 </Button>
      </template>
    </Grid>
  </Page>
</template>
