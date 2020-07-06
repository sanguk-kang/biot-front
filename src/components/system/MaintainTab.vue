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
        name : "MaintainTab",
        components : {},
        props : [],
        data: function() {
            return {
                tabList: [
                    {
                        key: "customer",
                        value: "고객정보",
                        isActive: true
                    },
                    {
                        key: "other",
                        value: "타사기기 고객센터",
                        isActive: false
                    },
                    {
                        key: "diagnosis",
                        value: "진단계수 관리",
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