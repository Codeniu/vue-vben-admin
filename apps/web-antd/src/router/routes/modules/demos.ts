import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        meta: {
          title: '组件使用演示',
        },
        name: 'AntDesignDemos',
        path: '/demos/ant-design',
        component: () => import('#/views/demos/antd/index.vue'),
      },
      {
        meta: {
          title: '办公室编辑',
        },
        name: 'OfficeEditor',
        path: '/demos/office-editor',
        component: () => import('#/views/demos/office-editor/index.vue'),
      },
      {
        meta: {
          title: '办公室查看',
        },
        name: 'OfficeViewer',
        path: '/demos/office-viewer',
        component: () => import('#/views/demos/office-viewer/index.vue'),
      },
    ],
  },
];

export default routes;
