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
                        key: "unit",
                        value: "단위설정",
                        isActive: true
                    },
                    {
                        key: "display",
                        value: "화면설정",
                        isActive: false
                    },
                    {
                        key: "siteInfo",
                        value: "사이트 정보",
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