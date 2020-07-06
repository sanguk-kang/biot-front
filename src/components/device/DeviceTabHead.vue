<template>
<!--s: tabmenu -->
<div class="tab_page_bg">
    <div id="deviceTabMenu" class="tab_page" role="alert">
        <ul>
            <li v-for="item in tabObj" :key="item.id" class="tabItem" :class="{'active': currentTabNo == item.key}" :tabNo="item.key" @click="tabChange($event, item)" :id="item.id"><span  class="t-link">{{item.name}}</span></li>

            <!-- <li class="tabItem active" tabNo="1"><span id="tabDeviceTotal" class="t-link">전체</span></li>
            <li class="tabItem" tabNo="2"><span id="tabDeviceInDoor" class="t-link">실내기</span></li>
            <li class="tabItem" tabNo="3"><span id="tabDeviceOutDoor" class="t-link">실외기</span></li>
            <li class="tabItem" tabNo="4"><span id="tabDeviceEnergyMeter" class="t-link">에너지 미터</span></li>
            <li class="tabItem" tabNo="5"><span id="tabDeviceShowcase" class="t-link">쇼케이스</span></li>
            <li class="tabItem" tabNo="6"><span id="tabDeviceFreezer" class="t-link">냉동고</span></li>
            <li class="tabItem" tabNo="7"><span id="tabDeviceLight" class="t-link">조명</span></li>
            <li class="tabItem" tabNo="8"><span id="tabDeviceAirQualitySensor" class="t-link">공기질 센서</span></li>
            <li class="tabItem" tabNo="9"><span id="tabDeviceAirCleaner" class="t-link">공기청정기</span></li>
            <li class="tabItem" tabNo="10"><span id="tabDeviceKWeather" class="t-link">K-weather</span></li> -->
        </ul>
    </div>
</div>
<!--e: tabmenu -->
</template>

<script>
export default {
    name : "DeviceTabHeader",
    props: ["currentTabNo"],
    data: function(){
        return {
            isDiaplay : false,
            tabObj: [{
                key: "1",
                name: "전체",
                id: "tabDeviceTotal"
            },
            {
                key: "2",
                name: "실내기",
                id: "tabDeviceInDoor"
            },
            {
                key: "3",
                name: "실외기",
                id: "tabDeviceOutDoor"
            },
            {
                key: "4",
                name: "에너지",
                id: "tabDeviceEnergyMeter"
            },
            {
                key: "9",
                name: "공기청정기",
                id: "tabDeviceAirCleaner"
            }
            
            ]
            
        }
    },

    methods : {
        tabChange(e, item) {
            console.log(">>>> test ", e, item);
            //var selectedTabLi = document.getElementById(item.id);
            //selectedTabLi.classList.toggle("active");

            // 탭화면이동
            this.$emit("move", item.key);
        }
    },

    created(){
        console.log(this.tabNo);
    },
    mounted()
    {},
    destroyed()
    {

    },
}
</script>
