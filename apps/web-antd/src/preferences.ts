import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    defaultAvatar:'', // 默认头像
    enablePreferences:false, // 是否启用配置
  },
  copyright: {
    companyName: '九域腾龙信息工程有限公司',
    companySiteLink: '',
    date: '2025',
    enable: true,
  },
  theme: {
    mode: 'light',
  },
  logo: {
    enable: true,
    source: '/logo.png',
  },
  widget: {
    fullscreen: false,
    globalSearch: false,
    languageToggle: false,
    lockScreen: false,
    notification: false, // 通知
    refresh: false,
    themeToggle: false,
    sidebarToggle: true,
  },
});
