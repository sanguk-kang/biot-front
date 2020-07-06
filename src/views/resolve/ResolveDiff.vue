<template>
<div class="content">
   <DeviceOperatingTime></DeviceOperatingTime>
</div>
</template>

<script>
//import TabPage from "@/views/sample/SampleTabPage.vue";
import DeviceOperatingTime from '@/views/resolve/diff/DeviceOperatingTime.vue'

export default {
  name: "App",
  components: {
      DeviceOperatingTime
   },
  watch: {},
  data: function() {
    return {
        
    }
  }
};
</script>


<style lang="scss" scoped>

</style>
