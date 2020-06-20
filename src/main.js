import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import moment from "moment";
import VueMomentJS from "vue-momentjs";
import jQuery from "jquery";
import $ from "jquery";

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
