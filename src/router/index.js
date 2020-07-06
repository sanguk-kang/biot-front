import Vue                from 'vue';
import VueRouter          from 'vue-router';

import routeCommon        from './route.common';
import routeDashboard     from './route.dashboard';
import routeDevice        from './route.device';
import routeEnergy        from './route.energy';
import routeMaintain      from './route.maintain';
import routeOperation     from './route.operation';
import routeResolve       from './route.resolve';
import routeSystem        from './route.system';

import ErrorPage          from '@/views/common/ErrorPage.vue';
import Main               from '@/views/Main.vue';

import Sample             from '@/views/sample/Sample.vue';
import SampleChart        from '@/views/sample/chart/VueChartJS.vue';


Vue.use(VueRouter)

const routes = [
  {
    path: '/',              name: 'Main',         component: Main,
    meta: { pageType: true, navEnable: false , asideEnable: false, headerEnable: false }
  },
  {
    path: '/errorPage',     name: 'ErrorPage',    component: ErrorPage,
    meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: false }
  },
  {
    path: '*', redirect: ErrorPage,
    meta: { pageType: true, navEnable: false , asideEnable: false, headerEnable: false }
  },
  {
    path: '/sample',        name: 'Sample',       component: Sample,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/sampleChart',        name: 'SampleChart',       component: SampleChart,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  }
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes : [
    ...routes,
    ...routeCommon,
    ...routeDashboard,
    ...routeDevice,
    ...routeEnergy,
    ...routeMaintain,
    ...routeOperation,
    ...routeResolve,  // add resolve routes
    ...routeSystem
  ]
})

// 라우팅이 일어나기 전
router.beforeEach((to, from, next) => {
  console.log('>> before router')
  next();
})

export default router