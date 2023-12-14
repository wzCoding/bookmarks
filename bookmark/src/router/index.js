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
    props:true,
    component: () => import(/* webpackChunkName: "Create" */ '../views/Create.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
