<template>
    <div class="tab_page_bg">
        <div class="tab_page" role="alert">
            <ul>
                <li v-for="item in tabList" v-bind:key="item.key" v-on:click="toggleTab(item)" v-bind:class="{active:item.isActive}">
                    <span class="t-link">{{ item.value }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>

export default {
    name : "DefectTab",
    components : {},
    props : [],
    data: function() {
        return {
            tabList: [
                {
                    key: "defect",
                    value: "고장이력",
                    isActive: true
                },
                {
                    key: "diagnosis",
                    value: "진단현황",
                    isActive: false
                }
            ]
        }
    },
    methods: {
        toggleTab: function(item) {
            this.tabList.forEach(function(tab) {
                tab.isActive = false;
            });

            item.isActive = true;

            this.$emit('toggle', item.key);
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