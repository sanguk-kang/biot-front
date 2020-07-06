/**
 * pageType: true(메뉴가 존재하는 내부 사용 타입), false(전체 화면 타입) 
 * navEnable: true(메뉴가 존재하는 경우), (메뉴가 없는 경우) 
 * asideEnable: 현재 미사용 컬럼 () 
 * headerEnable: true(header 존재함), false(header 없음)
 */
import Operation          from '@/views/operation/Operation.vue';
import OperationAlarm     from '@/views/operation/OperationAlarm.vue';
import OperationSchedule  from '@/views/operation/OperationSchedule.vue';
import OperationRuleCtrl  from '@/views/operation/OperationRuleCtrl.vue';
import OperationRuleAlert from '@/views/operation/OperationRuleAlert.vue';
import OperationGroup     from '@/views/operation/OperationGroup.vue';

const routeOperation = [
  {
    path: "/operation",     name: "Operation",    component: Operation,
    meta: { pageType: true, navEnable: true, asideEnable: false, headerEnable: true }
  },
  {
    path: '/operation/alarm',        name: 'OperationAlarm',       component: OperationAlarm,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/operation/schedule',        name: 'OperationSchedule',       component: OperationSchedule,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/operation/ruleCtrl',        name: 'OperationRuleCtrl',       component: OperationRuleCtrl,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/operation/ruleAlert',        name: 'OperationRuleAlert',       component: OperationRuleAlert,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  },
  {
    path: '/operation/group',        name: 'OperationGroup',       component: OperationGroup,
    meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
  }
];

export default routeOperation
