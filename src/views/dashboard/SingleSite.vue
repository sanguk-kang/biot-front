<template>
    <div class="content">
        <!-- <div> -->
            <SingleTab :currentTabNo="currentTabNo" @move="moveTab"></SingleTab>
            <SingleTotal v-if="currentTabNo == 1"></SingleTotal>
            <SingleMovement v-else-if="currentTabNo == 2" :propDataObj="operationData"></SingleMovement>
            <SingleEnergy v-else-if="currentTabNo == 3"></SingleEnergy>
            <SingleAir v-else-if="currentTabNo == 4"></SingleAir>
        </div>
    <!-- </div> -->
</template>

<script>
import axios from '@/api/axios.js';
import SingleTab from "@/components/dashboard/single/SingleTab";
import SingleTotal from "@/components/dashboard/single/SingleTotal";
import SingleMovement from "@/components/dashboard/single/SingleMovement";
import SingleEnergy from "@/components/dashboard/single/SingleEnergy";
import SingleAir from "@/components/dashboard/single/SingleAir";

export default {
    name: "SingleSite",
    props: [],
    components: { 
        SingleTab,
        SingleTotal,
        SingleMovement,
        SingleEnergy,
        SingleAir
    },
    watch: {},
    data: function() {
        return {
            currentTabNo: 1,
            isDiaplay : false,
            operationData:[{
                groupName:"서울시교육청",
                groupkwh: 14254 ,
                groupReduction: 1.2 
            },
            {
                groupName:"경기도교육청",
                groupkwh: 12254 ,
                groupReduction: 1.3 
            }]
        }
    },
    methods : {
        moveTab(tabId) {
            console.log("currnet tab no=", tabId);
            this.currentTabNo = tabId;

            var params;
            if(tabId == 2){
                params =
                {
                    "userId": "webadmin",
                    "siteType":"single",  // single , multi
                    "siteId":"111",
                    "tabType":"operation"  //sum, operation, energy, air
                };
                this.callApi(params);
            }
            //  else if(tabId == 3){ {
                
            // }
        },
        callApi(params) {
            console.log("[SingleSite Air API]" +params.tabType);
            // var params =
            // {
            //     "userId": "webadmin",
            //     "siteType":"single",  // single , multi
            //     "tabType":"sum"  //sum, operation, energy, air
            // };
            //api/ums/user/{userId:.+}/siteType/{siteType:.+}/tabType/{tabType:.+}/dashboardCards
            axios.getApi('/ums/user/'+params.userId+'/siteType/'+params.siteType+'/tabType/'+params.tabType+'/dashboardCards',params).then(res => {
                // 정상
                if(res.status == 200)
                {
                    console.log("[API] : 정상 ");
                    
                    // var resultList = res.data;
                    // resultList.forEach(function(rowData){
                    //     this.operationData.push({
                    //         "key": rowData.id,
                    //         "value": rowData.name,
                    //         "checked": false,
                    //     });
                    // });
                    // this.propsData.push(this.operationData);
                    

                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                var errCode = error.response.status;
                    if(errCode == 401) {
                        this.alert.openAlert("API", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        }
    },
    created(){
        
    },
    mounted()
    {},
    destroyed()
    {

    },        
};
</script>