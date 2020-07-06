<template>
  <div id="app">
    <div id="main" :class="cssMenu">
      <layoutNav v-if="this.viewNav" @change="menuChange" :menuType="menuType"></layoutNav>
      <!-- TAB page -->
      <layoutPage v-if="pageType"></layoutPage>
      <!-- Dashboard page -->
      <layoutPageSub v-else></layoutPageSub>
    </div>
  </div>
</template>



<script>
import LayoutPage from "@/components/layout/Page.vue";
import LayoutPageSub from "@/components/layout/PageSub.vue";
import LayoutNav from '@/components/layout/Nav.vue'
import {mapActions} from 'vuex'

export default {
  name: "App",
  components: { LayoutPage, LayoutNav, LayoutPageSub },
  watch: {
    $route(to) {
      this.initLayout(to);
      console.log('route > ', this.viewNav, this.viewAside, this.pageType);
    }
  },
  data: function() {
    return {
      viewNav: false,
      viewAside: false,
      cssMenu: '',
      menuType: 'sidelist',
      pageType: true,
      initLoding: false
    };
  },
  methods: {
    ...mapActions('app', ['getCommonCode']),
    menuChange(param) {
      if (param) {
        this.cssMenu = 'main-hide-floor-nav hide-sidebar';
        this.menuType = 'sidebar';
      } else {
        this.cssMenu = 'main-hide-floor-nav ';
        this.menuType = 'sidelist';
      }
    },
    initLayout(route) {
      this.viewNav = route.meta.navEnable;
      this.viewAside = route.meta.asideEnable;
      this.pageType = route.meta.pageType;
    }
  },
  created() {
    this.cssMenu = 'main-hide-floor-nav';
    this.initLayout(this.$route);
    // 공통코드 
    // this.getCommonCode();
  },
  beforeMount() {
    // this.getCommonCode();
  }
};
</script>

<style lang="scss">
// @import '~vue-date-pick/dist/vueDatePick.css';

@import "./assets/css/common.css";
@import "./assets/css/signin.css";
@import "./assets/css/device.css";
@import "./assets/css/dashboard.css";
@import "./assets/css/component.css";
@import "./assets/css/content.css";
@import "./assets/css/layout.css";
@import "./assets/css/app/font.css";





</style>