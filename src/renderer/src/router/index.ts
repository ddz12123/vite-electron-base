import { createRouter, createWebHashHistory } from 'vue-router';

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
      name: 'Home',
      meta: { title: '首页' },
      component: () => import('@renderer/views/home/index.vue'),
    },
  ],
});

router.afterEach((to) => {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'ViteElectronBase';
  document.title = to.meta.title ? `${to.meta.title} - ${appTitle}` : appTitle;
});

export default router;
