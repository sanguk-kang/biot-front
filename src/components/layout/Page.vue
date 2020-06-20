<template>
  <div style="height: 100%;">
    <layoutNav v-if="this.viewNav"></layoutNav>
    <router-view />
    <layoutAside v-if="this.viewAside"></layoutAside>
  </div>
</template>

<script>
import LayoutNav from '@/components/layout/Nav.vue'
import LayoutAside from '@/components/layout/Aside.vue'

export default {
  name: "Page",
  components: { LayoutNav, LayoutAside },
  props: [],
  watch: {
    $route(to) {
      this.viewNav = to.meta.navEnable;
      this.viewAside = to.meta.asideEnable;
      console.log("viewNav, viewAside", this.viewNav, this.viewAside);
    }
  },
  data: function() {
    return {
      viewNav: false,
      viewAside: false
    };
  },
  methods: {},
  created() {
    console.log("page created >>>>>");
  },
  mounted() {},
  destroyed() {}
};
</script>

<style lang="scss">

</style>