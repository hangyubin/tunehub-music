import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/Search.vue'),
  },
  {
    path: '/toplists',
    name: 'Toplists',
    component: () => import('@/pages/Toplists.vue'),
  },
  {
    path: '/toplist/:id',
    name: 'ToplistDetail',
    component: () => import('@/pages/ToplistDetail.vue'),
  },
  {
    path: '/playlist/:id',
    name: 'PlaylistDetail',
    component: () => import('@/pages/PlaylistDetail.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
