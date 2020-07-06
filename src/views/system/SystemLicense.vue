<template>
<div class="content">
    <!--s: tabmenu -->
    <license-tab @toggle="toggleTab"></license-tab>
    <!--e: tabmenu -->

    <!--s: main contents -->
    <license-list v-if="target == 'license'"></license-list>
    <!-- e:main contents -->
</div>
</template>

<script>
import LicenseTab from "@/components/system/LicenseTab";
import LicenseList from "@/components/system/LicenseList";

export default {
  name: "SystemLicense",
  components: { LicenseTab, LicenseList },
  watch: {},
  data: function() {
    return {
        target: 'license'
    }
  },
    methods: {
        toggleTab(param) {
            this.target = param;
        }
    },
};
</script>


<style lang="scss" scoped>

</style>