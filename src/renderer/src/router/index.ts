import { createRouter, createWebHashHistory } from 'vue-router';
import { ROUTE_NAMES } from '@renderer/constant/route';
import { getToken } from '@renderer/utils/auth';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
  }
}

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.home,
      meta: { title: '首页' },
      component: () => import('@renderer/views/home/index.vue'),
    },
  ],
});

router.beforeEach((to) => {
  // 登录页自身必须可达，否则下面的跳转会无限套自己
  if (to.name === ROUTE_NAMES.login) return true;
  if (!to.meta.requiresAuth || getToken()) return true;

  if (router.hasRoute(ROUTE_NAMES.login)) {
    return { name: ROUTE_NAMES.login, query: { redirect: to.fullPath } };
  }

  // 业务未注册登录页时无处可去，拒绝进入而不能放行
  return { name: ROUTE_NAMES.home };
});

router.afterEach((to) => {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'ViteElectronBase';
  document.title = to.meta.title ? `${to.meta.title} - ${appTitle}` : appTitle;
});

export default router;
