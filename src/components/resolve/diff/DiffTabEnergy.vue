<template>
  <div class="content_title_wrap">
    <ul class="dash_tab">
      <li v-for="submenu in submenuList" :key="submenu.key" :class="{'active': currentRouteName == submenu.key}">
        <router-link :to="{name: submenu.key}">{{submenu.title}}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: "DiffTabEnergy",
    props: {},
    data: function () {
      return {
        submenuList: [{
            key: "ResolveDiffEnergyConsumptionTrend",
            title: "소비트렌드"
          },
          {
            key: "ResolveDiffEnergyGoalSetting",
            title: "목표설정"
          },
          {
            key: "ResolveDiffEnergySavingHistory",
            title: "절감내역"
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