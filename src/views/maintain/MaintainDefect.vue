<template>
    <div class="content">
        <!--s: tabmenu -->
        <defectTab @toggle="toggleTab"></defectTab>
        <!--e: tabmenu -->

        <!--s: main contents -->
        <defectHistoryList v-if="target == 'defect'"></defectHistoryList>
        <defectDiagnosisList v-else ></defectDiagnosisList>
        <!-- e:main contents -->
    </div>
</template>

<script>
import DefectTab from "@/components/maintain/DefectTab";
import DefectHistoryList from "@/components/maintain/DefectHistoryList";
import DefectDiagnosisList from "@/components/maintain/DefectDiagnosisList";

export default {
    name: "MaintainDefect",
    components: { DefectTab, DefectHistoryList, DefectDiagnosisList },
    props: [],
    data: function() {
        return {
            target: 'defect'
        }
    },
    methods: {
        toggleTab(param) {
            this.target = param;
        }
    },
    created() {
    },
    mounted() {
    },
    destroyed() {
    }
}

</script>