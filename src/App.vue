<template>
  <div id="app">
    <div id="main" class="main-hide-floor-nav">
      <layoutHeader></layoutHeader>
      <layoutPage></layoutPage>
      <layoutFooter></layoutFooter>
    </div>
  </div>
</template>

<style src="@/assets/kendo/css/common.css"></style>
<style src="@/assets/kendo/css/signin.css"></style>
<style src="@/assets/kendo/css/device.css"></style>
<style src="@/assets/kendo/css/dashboard.css"></style>
<style src="@/assets/kendo/css/component.css"></style>
<style src="@/assets/kendo/css/content.css"></style>
<style src="@/assets/kendo/css/layout.css"></style>
<style src="@/assets/kendo/css/app/font.css"></style>

<script>
import LayoutHeader from "@/components/layout/Header.vue";
import LayoutFooter from "@/components/layout/Footer.vue";
import LayoutPage from "@/components/layout/Page.vue";

export default {
  name: "App",
  components: { LayoutHeader, LayoutFooter, LayoutPage },
  data: function() {
    return {
      type: ""
    };
  }
};
</script>

<style lang="scss">
#app {
  width: 100%;
  height: inherit;
}
</style>