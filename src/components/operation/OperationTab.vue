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
    name : "OperationTab",
    components : {},
    props : [],
    data: function() {
        return {
            tabList: [
                {
                    key: "0",
                    value: "에러/경고",
                    isActive: true
                },
                {
                    key: "1",
                    value: "비효율",
                    isActive: false
                },
                {
                    key: "2",
                    value: "유지보수",
                    isActive: false
                },
                {
                    key: "3",
                    value: "관리자 알람",
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