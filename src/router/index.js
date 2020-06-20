import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',            name: 'Main',
    component: () => import('../views/Main.vue'),
    meta: { navEnable: false , asideEnable: false}
  },
  {
    path: '/login',       name: 'Login',
    component: () => import('../views/common/Login.vue'),
    meta: { navEnable: false , asideEnable: false}
  },
  {
    path: '/sample',       name: 'Sample',
    component: () => import('../views/sample/Sample.vue'),
    meta: { navEnable: true , asideEnable: false }
  },
  {
    path: '/sample2',       name: 'Sample2',
    component: () => import('../views/sample/Sample2.vue'),
    meta: { navEnable: true , asideEnable: false }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/dashboard/Dashboard.vue"),
    meta: { navEnable: true, asideEnable: false }
  },
  {
    path: '/errorPage',       name: 'ErrorPage',
    component: () => import('../views/common/ErrorPage.vue'),
    meta: { navEnable: true , asideEnable: false}
  },
  {
    path: '*', redirect: '/',
    meta: { navEnable: false , asideEnable: false }
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

// 라우팅이 일어나기 전
router.beforeEach((to, from, next) => {
  console.log('>> before router')
  next();
})

export default router