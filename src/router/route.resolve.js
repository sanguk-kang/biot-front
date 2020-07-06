import DeviceOperatingTime from '@/views/resolve/diff/DeviceOperatingTime.vue';
import DeviceOperatingRate from '@/views/resolve/diff/DeviceOperatingRate.vue';
import DeviceOperatingInefficiency from '@/views/resolve/diff/DeviceOperatingInefficiency.vue';
import DeviceOperatingTemperature from '@/views/resolve/diff/DeviceOperatingTemperature.vue';
import EnergyConsumptionTrend from '@/views/resolve/diff/EnergyConsumptionTrend.vue';
import EnergyGoalSetting from '@/views/resolve/diff/EnergyGoalSetting.vue';
import EnergySavingHistory from '@/views/resolve/diff/EnergySavingHistory.vue';
import QualityComfortDiagram from '@/views/resolve/diff/QualityComfortDiagram.vue';
import QualityCleanliness from '@/views/resolve/diff/QualityCleanliness.vue';
import ResolveHistory from '@/views/resolve/ResolveHistory.vue';

const routeResolve = [
    {
        path: '/resolve/diff/DeviceOperatingTime', name: 'ResolveDiffDeviceOperatingTime',
        component: DeviceOperatingTime,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: '/resolve/diff/DeviceOperatingRate', name: 'ResolveDiffDeviceOperatingRate',
        component: DeviceOperatingRate,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: '/resolve/diff/DeviceOperatingRate', name: 'ResolveDiffDeviceOperatingRate',
        component: DeviceOperatingRate,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: '/resolve/diff/DeviceOperatingInefficiency', name: 'ResolveDiffDeviceOperatingInefficiency',
        component: DeviceOperatingInefficiency,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: '/resolve/diff/DeviceOperatingTemperature', name: 'ResolveDiffDeviceOperatingTemperature',
        component: DeviceOperatingTemperature,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },


    {
        path: '/resolve/diff/EnergyConsumptionTrend', name: 'ResolveDiffEnergyConsumptionTrend',
        component: EnergyConsumptionTrend,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: '/resolve/diff/EnergyGoalSetting', name: 'ResolveDiffEnergyGoalSetting',
        component: EnergyGoalSetting,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: '/resolve/diff/EnergySavingHistory', name: 'ResolveDiffEnergySavingHistory',
        component: EnergySavingHistory,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },

    {
        path: '/resolve/diff/QualityComfortDiagram', name: 'ResolveDiffQualityComfortDiagram',
        component: QualityComfortDiagram,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: '/resolve/diff/QualityCleanliness', name: 'ResolveDiffQualityCleanliness',
        component: QualityCleanliness,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: '/resolve/history', name: 'ResolveHistory', component: ResolveHistory,
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    },
    {
        path: `/resolve/report/multi-site-viewer/:index`, name: 'ResolveReportMultiSiteViewer',
        component: () => import('@/views/resolve/ResolveReportMultiSite'),
        meta: { pageType: false, navEnable: false, asideEnable: false, headerEnable: false }
    },
    {
        path: `/resolve/report/single-site-viewer/:index`, name: 'ResolveReportSingleSiteViewer',
        component: () => import('@/views/resolve/ResolveReportSingleSite'),
        meta: { pageType: false, navEnable: false, asideEnable: false, headerEnable: false }
    },
    {
        path: '/resolve/report', name: 'ResolveReport',
        component: () => import('@/views/resolve/ResolveReport'),
        meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
    }
];

export default routeResolve