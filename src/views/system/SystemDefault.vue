<template>
<div class="content">

    <!--s: tabmenu -->
    <defectTab @toggle="toggleTab"></defectTab>
    <!--e: tabmenu -->

    <!--s: main contents -->
    <defectUnitSetting v-if="target == 'unit'" ></defectUnitSetting>
    <defectDisplaySetting v-if="target == 'display'"></defectDisplaySetting>
    <defectSiteInfo v-else></defectSiteInfo>

    <!-- e:main contents -->

</div>
</template>

<script>
import DefectTab from "@/components/system/DefectTab";
import DefectDisplaySetting from "@/components/system/DefectDisplaySetting";
import DefectSiteInfo from "@/components/system/DefectSiteInfo";
import DefectUnitSetting from "@/components/system/DefectUnitSetting";

export default {
  name: "SystemDefault",
  components: { DefectTab, DefectDisplaySetting, DefectSiteInfo, DefectUnitSetting},
  watch: {},
  data: function() {
      return {
          target: 'unit'
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