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
    name: "DiffTabQuality",
    props: {},
    data: function () {
      return {
        submenuList: [{
            key: "ResolveDiffQualityComfortDiagram",
            title: "쾌적도 트렌드"
          },
          {
            key: "ResolveDiffQualityCleanliness",
            title: "청정도 트렌드"
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