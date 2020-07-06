<template>
    <div class="content">

        <!--s: tabmenu -->
        <maintain-tab @toggle="toggleTab"></maintain-tab>
        <!--e: tabmenu -->

        <!--s: main contents -->
        <maintain-customer-info v-if="target == 'customer'" ></maintain-customer-info>
        <maintain-other-company-info v-if="target == 'other'"></maintain-other-company-info>
        <maintain-diagnosis-info v-else></maintain-diagnosis-info >
        <!-- e:main contents -->

    </div>
</template>

<script>
    import MaintainTab from "@/components/system/MaintainTab";
    import MaintainCustomerInfo from "@/components/system/MaintainCustomerInfo";
    import MaintainOtherCompanyInfo from "@/components/system/MaintainOtherCompanyInfo";
    import MaintainDiagnosisInfo from "@/components/system/MaintainDiagnosisInfo";

    export default {
        name: "SystemMaintain",
        components: { MaintainTab, MaintainCustomerInfo, MaintainOtherCompanyInfo, MaintainDiagnosisInfo},
        watch: {},
        data: function() {
            return {
                target: 'customer'
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