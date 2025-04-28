import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:storefront-sharp',
      order: 9997,
      title: $t('office.title'),
    },
    name: 'Office',
    path: '/office',
    component: () => import('#/views/office/manage/list.vue'),

    // children: [
    //   {
    //     path: '/office/manage',
    //     name: 'OfficeManage',
    //     meta: {
    //       icon: 'mdi:account-group',
    //       title: $t('office.manage.title'),
    //     },
    //     component: () => import('#/views/office/manage/list.vue'),
    //   },
    // ],
  },
];

export default routes;
