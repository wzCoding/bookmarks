import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/info/bookmark-:id',
    name: 'info',
    props: true,
    component: () => import(/* webpackChunkName: "Info" */ '../views/Info.vue')
  },
  {
    path: '/edit',
    name: 'edit',
    component: () => import(/* webpackChunkName: "Info" */ '../views/Edit.vue')
  },
  {
    path: '/update',
    name: 'update',
    component: () => import(/* webpackChunkName: "Info" */ '../views/Update.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
