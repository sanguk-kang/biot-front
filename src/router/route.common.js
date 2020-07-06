/**
 * pageType: true(메뉴가 존재하는 내부 사용 타입), false(전체 화면 타입) 
 * navEnable: true(메뉴가 존재하는 경우), (메뉴가 없는 경우) 
 * asideEnable: 현재 미사용 컬럼 () 
 * headerEnable: true(header 존재함), false(header 없음)
 */
import Login from '@/views/common/Login.vue';
import ConfirmChangingPasswordModal from '@/views/common/sign-in/ConfirmChangingPasswordModal.vue';
import ChangePasswordModal from '@/views/common/sign-in/ChangePasswordModal.vue';
import TermsConditionModal from '@/views/common/sign-in/TermsConditionModal.vue';
import TermsConditionEnteringTest from '@/views/common/sign-in/TermsConditionEnteringTest.vue';
import TermsContentsModal from '@/views/common/sign-in/TermsContentsModal.vue';
import MemberGeneral      from '@/views/common/MemberGeneral.vue';
import MemberPartner      from '@/views/common/MemberPartner.vue';
import MemberTypeSelect   from '@/views/common/MemberTypeSelect.vue';
import Agreement          from '@/views/common/Agreement.vue';
import JoinComplet        from '@/views/common/JoinComplet.vue';
import AuthenticateForChangingPassword from '@/views/common/sign-in/AuthenticateForChangingPassword.vue';
import ConfirmChangingPassword from '@/views/common/sign-in/ConfirmChangingPassword.vue';
import ChangePassword from '@/views/common/sign-in/ChangePassword.vue';

const routeCommon = [
    {
        path: '/login',         name: 'Login',        component: Login,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: false }
    },
    {
        path: '/confirmChangingPasswordModal',        name: 'ConfirmChangingPasswordModal',       component: ConfirmChangingPasswordModal,
        meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
    },
    {
        path: '/changePasswordModal',        name: 'ChangePasswordModal',       component: ChangePasswordModal,
        meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
    },
    {
        path: '/termsConditionModal',        name: 'TermsConditionModal',       component: TermsConditionModal,
        meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
    },
    {
        path: '/termsConditionEnteringTest',        name: 'TermsConditionEnteringTest',       component: TermsConditionEnteringTest,
        meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
    },
    {
        path: '/termsContentsModal',        name: 'TermsContentsModal',       component: TermsContentsModal,
        meta: { pageType: true, navEnable: true , asideEnable: false, headerEnable: true }
    },
    // sign out
    {
        path: '/memberTypeSelect',              name: 'MemberTypeSelect',         component: MemberTypeSelect,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: false }
    },
    {
        path: '/joinComplet',              name: 'JoinComplet',         component: JoinComplet,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: false }
    },
    {
        path: '/agreement',              name: 'Agreement',         component: Agreement,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: false }
    },
    {
        path: '/memberGeneral',              name: 'MemberGeneral',         component: MemberGeneral,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: false }
    },
    {
        path: '/memberPartner',              name: 'MemberPartner',         component: MemberPartner,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: false }
    },
    {
        path: '/authenticateForChangingPassword',        name: 'AuthenticateForChangingPassword',       component: AuthenticateForChangingPassword,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: true }
    },
    {
        path: '/confirmChangingPassword',        name: 'ConfirmChangingPassword',       component: ConfirmChangingPassword,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: true }
    },
    {
        path: '/changePassword',        name: 'ChangePassword',       component: ChangePassword,
        meta: { pageType: false, navEnable: false , asideEnable: false, headerEnable: true }
    }
];

export default routeCommon