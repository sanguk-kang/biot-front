<template>
<div class="content">
    <DeviceTabHead :currentTabNo="currentTabNo" @move="moveTab"></DeviceTabHead>
    <DeviceTotalView v-if="currentTabNo == 1" :dataList="dataList" :viewTypeForDeviceTotal="viewTypeForDeviceTotal" @changeViewType="changeViewTypeForDeviceTotal"></DeviceTotalView>
    <DeviceInDoorView v-else-if="currentTabNo == 2" :viewTypeForDeviceInDoor="viewTypeForDeviceInDoor" @changeViewType="changeViewTypeForDeviceInDoor"></DeviceInDoorView>
    <DeviceOutDoorView v-else-if="currentTabNo == 3"></DeviceOutDoorView>
    <DeviceEnergyMeterView v-else-if="currentTabNo == 4" :viewTypeForDeviceEnergyMeter="viewTypeForDeviceEnergyMeter" @changeViewType="changeViewTypeForDeviceEnergyMeter"></DeviceEnergyMeterView>
    <DeviceAirCleanerView v-else-if="currentTabNo == 9" :viewTypeForDeviceAirCleaner="viewTypeForDeviceAirCleaner" @changeViewType="changeViewTypeForDeviceAirCleaner"></DeviceAirCleanerView>
</div>
</template>

<script>
import DeviceTabHead from "@/components/device/DeviceTabHead.vue";
import DeviceTotalView from "@/components/device/DeviceTotalView.vue";
import DeviceInDoorView from "@/components/device/DeviceInDoorView.vue";
import DeviceOutDoorView from "@/components/device/DeviceOutDoorView.vue";
import DeviceEnergyMeterView from "@/components/device/DeviceEnergyMeterView.vue";
import DeviceAirCleanerView from "@/components/device/DeviceAirCleanerView.vue";

export default {
  name: "App",
  props:[],
  components: { DeviceTabHead, DeviceTotalView, DeviceInDoorView, DeviceOutDoorView, DeviceEnergyMeterView, DeviceAirCleanerView },
  watch: {},
  data: function() {
    return {
      currentTabNo: 1,
      viewTypeForDeviceTotal: 1,
      viewTypeForDeviceInDoor: 1,
      viewTypeForDeviceEnergyMeter: 1,
      viewTypeForDeviceShowcase: 1,
      viewTypeForDeviceFreezer: 1,
      viewTypeForDeviceLight: 1,
      viewTypeForDeviceAirQualitySensor: 1,
      viewTypeForDeviceAirCleaner: 1,
      viewTypeForDeviceKWeather: 1,

      dataList: {},

    }
  },
  methods : {

    moveTab(tabId) {
      console.log("currnet tab no=", tabId);
      this.currentTabNo = tabId;
    },

    changeViewTypeForDeviceTotal(viewType)
    {
      console.log("currnet viewTypeForDeviceTotal=", viewType);
      this.viewTypeForDeviceTotal = viewType;
    },

    changeViewTypeForDeviceInDoor(viewType)
    {
      console.log("currnet viewTypeForDeviceInDoor=", viewType);
      this.viewTypeForDeviceInDoor = viewType;
    },

    changeViewTypeForDeviceEnergyMeter(viewType)
    {
      console.log("currnet viewTypeForDeviceEnergyMeter=", viewType);
      this.viewTypeForDeviceEnergyMeter = viewType;
    },

    changeViewTypeForDeviceAirCleaner(viewType)
    {
      console.log("currnet viewTypeForDeviceAirCleaner=", viewType);
      this.viewTypeForDeviceAirCleaner = viewType;
    },

    select() {
      // axios
      //this.dataList = res.data;
    }
  }
};
</script>


<style lang="scss" scoped>
// .site_wrap{
//     min-width: 1630px;
//     overflow: initial;
//     margin-top: 60px;
//     height: calc(100% - 102px);    
//     padding: 0 30px;
// }
</style>