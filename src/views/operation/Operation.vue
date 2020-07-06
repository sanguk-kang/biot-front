<template>
<div class="content">
    <TabPage></TabPage>
    <component v-bind:is="currentTabComponent"></component>
</div>
</template>

<script>
import TabPage from "@/components/operation/OperationTab";
import OperationAlarm from "./OperationAlarm";

export default {
  name: "App",
  components: { 
    TabPage,
    OperationAlarm,
  },
  watch: {},
  data: function() {
    return {
        currentTab: 'OperationAlarm'
    }
  },
  methods : {
  },
  computed: {
    currentTabComponent () {
      switch (this.currentTab) {
        case 'OperationAlarm':
          return 'OperationAlarm'
        default:
          return 'OperationAlarm'
      }
    }
  }
};
</script>


<style lang="scss" scoped>

</style>