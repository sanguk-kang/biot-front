<template>
    <!-- s:site list -->
    <sweet-modal ref="multiSiteInfo"  width="370px">
        <!-- 모달 기본 스타일 S -->
        <div style="width:330; height:380">
            <!-- <div class="sweet_modal_content"> -->
                <!-- <div class="site_wrap"> -->
                    <ul class="site_list">
                        <li v-for="item in dataObj" :key="item.key">
                            <div :class="changeClassAll(item.value.type)">
                                <div class="site_name"><span class="name">{{item.value.a}} {{item.value.type}}</span></div>
                                <ul class="state_per">
                                    <li>
                                        <p class="text_per">{{item.value.b}}</p>
                                        <p class="text_num">{{item.value.c}}</p>
                                        <p class="text_state">{{item.value.d}}</p>
                                    </li>
                                    <li class="onoff">
                                        <p class="text_per">{{item.value.e}}</p>
                                        <p class="text_num">{{item.value.f}}</p>
                                        <p class="text_state">{{item.value.g}} </p>
                                    </li>
                                </ul>
                                <div class="usage">
                                    <p class="title">Electricity Usage</p>
                                    <p class="result"><strong>{{item.value.h}}</strong>kWh</p>
                                </div>
                                <ul class="condition">
                                    <li class="critical"><span class="title">Critical</span><span class="num">{{item.value.i}}</span></li>
                                    <li class="warning"><span class="title">Warning</span><span class="num">{{item.value.j}}</span></li>
                                    <li class="energylos"><span class="title">Energy Los</span><span class="num">{{item.value.k}}</span></li>
                                    <li class="maintenance"><span class="title">Maintenance</span><span class="num">{{item.value.l}}</span></li>
                                </ul>
                                <ul class="result_wrap">
                                    <li>
                                        <div :class="changeClassColor(item.value.m)" >
                                            <p class="air">Air Quality</p>
                                            <p class="result">{{item.value.m}}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div :class="changeClassColor(item.value.n)">
                                            <p class="air">Air Comfort Degree</p>
                                            <p class="result">{{item.value.n}}</p>
                                        </div>
                                    </li>
                                </ul>
                                <button class="ic ic-info" v-if="item.value.type !== 'all'" @click="goDetailDashboard(item.value.type)"></button>
                            </div>
                        </li>
                    </ul>
                <!-- </div> -->
            <!-- </div> -->
        </div> 
    </sweet-modal>
    <!-- s:site list -->
</template>

<script>
var app_url = process.env.VUE_APP_URL;
export default {
    name: "MultiSiteInfo",
    props: ["popDataObj"],
    components: { 
    },
    watch: {},
    data: function() {
        return {
            dataObj: []
        }
    },
    methods : {
        
        openModal() {
            this.$refs.multiSiteInfo.open();
        },
        goDetailDashboard(arg){
            if (arg == "single") {
                this.$router.push({name : "SingleSite"});
                //window.open(app_url+"/singlesite", "_blank");
            } else if (arg == "multi") {
                //this.$router.push({name : "singlesite"});
                window.open(app_url+"/singlesite", "_blank");
            }
        },
        changeClassAll(arg) {
            var className ="";
            if(arg == "all"){
                className = "card_wrap all";
            } else {
                className = "card_wrap";
            }
            return className;
        },
        changeClassColor(arg) {
            var className ="";
            if(arg == "Bad") {
                className = "verypoor";

            } else if(arg == "Poor"){
                className = "poor";

            } else if(arg == "Good") {
                className = "good";

            } else if(arg == "Normal"){
                className = "normal";

            } else {
                className = "";
            }
            return className;
        }, 
    },
    created(){
        this.dataObj = this.popDataObj;
    },
    mounted()
    {

    },
    destroyed()
    {

    },        
};
</script>