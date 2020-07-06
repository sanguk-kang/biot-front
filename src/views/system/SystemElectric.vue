<template>
<div class="content">
    <!--s: tabmenu -->
    <electric-tab @toggle="toggleTab"></electric-tab>
    <!--e: tabmenu -->

    <!--s: main contents -->
    <electric-list v-if="target == 'electric'"></electric-list>
    <!-- e:main contents -->
</div>
</template>

<script>
import ElectricTab from "@/components/system/ElectricTab";
import ElectricList from "@/components/system/ElectricList";

export default {
  name: "SystemElectric",
  components: { ElectricTab, ElectricList },
  watch: {},
  data: function() {
    return {
        target: 'electric'
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