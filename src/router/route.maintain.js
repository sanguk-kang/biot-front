/**
 * pageType: true(메뉴가 존재하는 내부 사용 타입), false(전체 화면 타입) 
 * navEnable: true(메뉴가 존재하는 경우), (메뉴가 없는 경우) 
 * asideEnable: 현재 미사용 컬럼 () 
 * headerEnable: true(header 존재함), false(header 없음)
 */
import Maintenance        from '@/views/maintain/MaintainInfo.vue';
import MaintainInfo       from '@/views/maintain/MaintainInfo.vue';
import MaintainDefect     from '@/views/maintain/MaintainDefect.vue';
import MaintainInspection from '@/views/maintain/MaintainInspection.vue';
import MaintainPanel      from '@/views/maintain/MaintainPanel.vue';

const routeMaintain = [
  {
    path: "/maintain",   name: "Maintenance",  component: Maintenance,
    meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
  },
  {
    path: '/maintain/info',        name: 'MaintainInfo',       component: MaintainInfo,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/maintain/defect',        name: 'MaintainDefect',       component: MaintainDefect,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/maintain/inspection',        name: 'MaintainInspection',       component: MaintainInspection,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/maintain/panel',        name: 'MaintainPanel',       component: MaintainPanel,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  }
];

export default routeMaintain
