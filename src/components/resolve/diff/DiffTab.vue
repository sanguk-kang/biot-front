<template>
  <div class="tab_page_bg">
    <div class="tab_page" role="alert">
      <ul>
        <li v-for="tab in tabList" :key="tab.key" :class="{'active': tab.submenuList.includes(currentRouteName)}">
          <router-link class="t-link" :to="{name: tab.key}">{{tab.title}}</router-link>
        </li>
      </ul>
    </div>
    <div>
      tab 하단 부분 배경색 변경 됩니다.
    </div>
  </div>
</template>

<script>
  export default {
    name: "DiffTab",
    props: {
      tabID: {
        type: String,
        default: null
      }
    },
    data: function () {
      return {
        tabList: [{
            key: "ResolveDiffDeviceOperatingTime",
            title: "기기 운영",
            submenuList: [
              "ResolveDiffDeviceOperatingTime",
              "ResolveDiffDeviceOperatingRate",
              "ResolveDiffDeviceOperatingInefficiency",
              "ResolveDiffDeviceOperatingTemperature"
            ]
          },
          {
            key: "ResolveDiffEnergyConsumptionTrend",
            title: "에너지",
            submenuList: [
              "ResolveDiffEnergyConsumptionTrend",
              "ResolveDiffEnergyGoalSetting",
              "ResolveDiffEnergySavingHistory"
            ]
          },
          {
            key: "ResolveDiffQualityComfortDiagram",
            title: "공기질",
            submenuList: [
              "ResolveDiffQualityComfortDiagram",
              "ResolveDiffQualityCleanliness"
            ]
          },
        ]
      }
    },
    computed: {
      currentRouteName() {
        return this.$route.name;
      }
    }
  }
</script>