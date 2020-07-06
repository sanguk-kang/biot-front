<template>
    <div class="content">
        <!--s: tabmenu -->
        <panelTab></panelTab>
        <!--e: tabmenu -->

        <!--s: main contents -->
        <panelList></panelList>
        <!-- e:main contents -->
    </div>
</template>

<script>
import panelTab from "@/components/maintain/PanelTab";
import panelList from "@/components/maintain/PanelList";

export default {
    name: "MaintainPanel",
    components: { panelTab, panelList },
    props: [],
    data: function() {
        return {

        }
    },
    methods: {
    },
    created() {
    },
    mounted() {
    },
    destroyed() {
    }
}

</script>