/**
 * pageType: true(메뉴가 존재하는 내부 사용 타입), false(전체 화면 타입) 
 * navEnable: true(메뉴가 존재하는 경우), (메뉴가 없는 경우) 
 * asideEnable: 현재 미사용 컬럼 () 
 * headerEnable: true(header 존재함), false(header 없음)
 */

import Dashboard          from '@/views/dashboard/Dashboard.vue';
import ExtendMap          from '@/views/dashboard/ExtendMap.vue';
import SingleSite         from '@/views/dashboard/SingleSite.vue';
import SiteList           from '@/views/dashboard/SiteList.vue';

const routeDashboard = [
    {
        path: "/dashboard",     name: "Dashboard",    component: Dashboard,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: "/extendMap",     name: "ExtendMap",    component: ExtendMap,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: "/siteList",     name: "SiteList",    component: SiteList,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: "/singlesite",     name: "SingleSite",    component: SingleSite,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    }
];

export default routeDashboard
