<template>
  <div class="main_content full">
      <layoutHeader v-if="isHeaderView"></layoutHeader>
      <router-view />
      <layoutFooter></layoutFooter>
  </div>
</template>

<script>
import LayoutHeader from "@/components/layout/Header.vue";
import LayoutFooter from "@/components/layout/Footer.vue";

export default {
  name: "PageSub",
  components: { LayoutHeader, LayoutFooter },
  props: [],
  watch: {
    $route(to) {
        this.isHeaderView = to.meta.headerEnable;
    }
  },
  data: function() {
    return {
    };
  },
  methods: {},
  created() {
    console.log("pageSub created >>>>>");
    this.isHeaderView = this.$route.meta.headerEnable;
  },
  mounted() {},
  destroyed() {}
};
</script>

<style lang="scss">

</style>