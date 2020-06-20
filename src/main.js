import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import moment from "moment";
import VueMomentJS from "vue-momentjs";
import jQuery from "jquery";
import $ from "jquery";

import { SweetModal, SweetModalTab } from 'sweet-modal-vue';
Vue.component('sweet-modal', SweetModal);
Vue.component('sweet-modal-tab', SweetModalTab);

import VueDatePick from 'vue-date-pick';
Vue.use(VueDatePick);

import VueGoogleCharts from 'vue-google-charts'
Vue.use(VueGoogleCharts)

window.jQuery = jQuery;
window.$ = jQuery;

Vue.config.productionTip = false;
Vue.use(VueMomentJS, moment);

new Vue({
  router,
  store,
  $,
  jQuery,
  render: h => h(App)
}).$mount("#app");
