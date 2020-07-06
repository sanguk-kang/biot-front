<template>
<div class="content">
    <TabPage @toggle="toggleTab"></TabPage>
    <component v-bind:is="currentTabComponent"></component>
</div>
</template>

<script>
import TabPage from "@/components/operation/OperationTab";
import OperationErrorList from "@/components/operation/OperationErrorList";
export default {
  name: "OperationAlarm",
  components: { 
    TabPage,
    OperationErrorList,
  },
  watch: {},
  data: function() {
    return {
        target: null,
    }
  },
  methods: {
    toggleTab(param) {
        this.target = param;
    }
  },
  computed: {
    currentTabComponent () {
      switch (this.currentTab) {
        case '0':
          return 'OperationErrorList'
        default:
          return 'OperationErrorList'
      }
    }
  }
  
};
</script>


<style lang="scss" scoped>

</style>