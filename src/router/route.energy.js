/**
 * pageType: true(메뉴가 존재하는 내부 사용 타입), false(전체 화면 타입) 
 * navEnable: true(메뉴가 존재하는 경우), (메뉴가 없는 경우) 
 * asideEnable: 현재 미사용 컬럼 () 
 * headerEnable: true(header 존재함), false(header 없음)
 */
import EnergyReduce       from '@/views/energy/EnergyReduce.vue';
import EnergyDetect       from '@/views/energy/EnergyDetect.vue';

const routeEnergy = [
    {
        path: '/energy/reduce',        name: 'EnergyReduce',       component: EnergyReduce,
        meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
    },
    {
        path: '/energy/detect',        name: 'EnergyDetect',       component: EnergyDetect,
        meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
    }
];

export default routeEnergy
