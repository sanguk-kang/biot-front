<template>
    <div class="tab_page_bg">
        <div class="tab_page" role="alert">
            <ul>
                <li v-for="item in tabObj" :key="item.id" class="tabItem" :class="{'active': currentTabNo == item.key}" :tabNo="item.key" @click="tabChange($event, item)" :id="item.id">
                    <span  class="t-link">{{item.name}}</span></li>
            </ul>
        </div>
    </div>
</template>

<script>

export default {
    name : "SingleTab",
    components : {},
    props : ["currentTabNo"],
    data: function() {
        return {
            isDiaplay : false,
            tabObj: [{
                key: "1",
                name: "종합현황",
                id: "singleTotal"
            },
            {
                key: "2",
                name: "운전현황",
                id: "SingleMovement"
            },
            {
                key: "3",
                name: "에너지",
                id: "SingleEnergy"
            },
            {
                key: "4",
                name: "공기질",
                id: "SingleAir"
            }]
            
        }
    },
    methods: {
        tabChange: function(e, item) {
            // this.tabList.forEach(function(tab) {
            //     tab.isActive = false;
            // });

            // item.isActive = true;

            this.$emit('move', item.key);
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