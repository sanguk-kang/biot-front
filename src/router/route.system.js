/**
 * pageType: true(메뉴가 존재하는 내부 사용 타입), false(전체 화면 타입) 
 * navEnable: true(메뉴가 존재하는 경우), (메뉴가 없는 경우) 
 * asideEnable: 현재 미사용 컬럼 () 
 * headerEnable: true(header 존재함), false(header 없음)
 */
import System             from '@/views/system/System.vue';
import SystemDefault      from '@/views/system/SystemDefault.vue';
import SystemElectric     from '@/views/system/SystemElectric.vue';
import SystemLicense      from '@/views/system/SystemLicense.vue';
import SystemConnection   from '@/views/system/SystemConnection.vue';
import SystemAccount      from '@/views/system/SystemAccount.vue';
import SystemAuth         from '@/views/system/SystemAuth.vue';
import SystemSite         from '@/views/system/SystemSite.vue';
import SystemPayment      from '@/views/system/SystemPayment.vue';
import SystemContent      from '@/views/system/SystemContent.vue';
import SystemMaintain     from '@/views/system/SystemMaintain.vue';

const routeSystem = [
  {
    path: "/system",        name: "System",       component: System,
    meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/default',        name: 'SystemDefault',       component: SystemDefault,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/electric',        name: 'SystemElectric',       component: SystemElectric,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/license',        name: 'SystemLicense',       component: SystemLicense,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/connection',        name: 'SystemConnection',       component: SystemConnection,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/account',        name: 'SystemAccount',       component: SystemAccount,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/auth',        name: 'SystemAuth',       component: SystemAuth,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/site',        name: 'SystemSite',       component: SystemSite,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/payment',        name: 'SystemPayment',       component: SystemPayment,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/content',        name: 'SystemContent',       component: SystemContent,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/system/maintain',        name: 'SystemMaintain',       component: SystemMaintain,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  }
];

export default routeSystem
