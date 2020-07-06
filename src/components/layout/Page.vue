<template>
  <div class="main_content">
      <layoutHeader v-if="isHeaderView"></layoutHeader>
      <router-view />
      <layoutFooter></layoutFooter>
  </div>
</template>

<script>
import LayoutHeader from "@/components/layout/Header.vue";
import LayoutFooter from "@/components/layout/Footer.vue";

export default {
    name: "Page",
    components: { LayoutHeader, LayoutFooter },
    props: [],
    watch: {
        $route(to) {
            this.isHeaderView = to.meta.headerEnable;
        }
    },
    data: function() {
        return {
            isHeaderView: false
        };
    },
    methods: {},
    created() {
        console.log("page created >>>>>");
        this.isHeaderView = this.$route.meta.headerEnable;
    },
    mounted() {},
    destroyed() {}
    };
</script>

<style lang="scss">

</style>