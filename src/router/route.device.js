/**
 * pageType: true(메뉴가 존재하는 내부 사용 타입), false(전체 화면 타입) 
 * navEnable: true(메뉴가 존재하는 경우), (메뉴가 없는 경우) 
 * asideEnable: 현재 미사용 컬럼 () 
 * headerEnable: true(header 존재함), false(header 없음)
 */

import DeviceMgmt         from '@/views/device/DeviceMgmt.vue';
import DeviceEnergy       from '@/views/device/DeviceEnergy.vue';

const routeDevice = [
  // device
  {
    path: '/device/mgmt',        name: 'DeviceMgmt',       component: DeviceMgmt,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  // ESS energy
  {
    path: '/device/energy',        name: 'DeviceEnergy',       component: DeviceEnergy,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  }
];

export default routeDevice
