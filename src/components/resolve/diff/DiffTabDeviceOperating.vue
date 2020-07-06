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
    name: "DiffTabDeviceOperating",
    props: {},
    data: function () {
      return {
        submenuList: [{
            key: "ResolveDiffDeviceOperatingTime",
            title: "운전시간"
          },/*
          {
            key: "ResolveDiffDeviceOperatingRate",
            title: "운전율"
          },*/
          {
            key: "ResolveDiffDeviceOperatingRate",
            title: "가동율"
          },
          {
            key: "ResolveDiffDeviceOperatingInefficiency",
            title: "비효율"
          },
          {
            key: "ResolveDiffDeviceOperatingTemperature",
            title: "온도"
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