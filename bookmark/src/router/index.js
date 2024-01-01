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
    path: '/edit/bookmark-:id',
    name: 'edit',
    props: true,
    component: () => import(/* webpackChunkName: "Edit" */ '../views/Edit.vue')
  },
  {
    path: '/create/bookmark-:id',
    name: 'create',
    props: true,
    component: () => import(/* webpackChunkName: "Create" */ '../views/Create.vue')
  },
  {
    path: '/setting',
    name: 'setting',
    component: () => import(/* webpackChunkName: "Setting" */ '../views/Setting.vue')
  },
  {
    path: '/recent',
    name: 'recent',
    component: () => import(/* webpackChunkName: "Recent" */ '../views/Recent.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
