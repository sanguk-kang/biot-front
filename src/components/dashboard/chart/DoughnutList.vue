<template>
<div class="card-item groupCard_Wrap">
    <div class="group_name">
        <span class="name">{{groupName}}</span>
    </div>
    <div class="card-info">
        <div class="left">
            <!-- <img src="@/assets/images/dashboard/2003_1.png"> -->
            <Doughnut :datacollection="Datacollection"></Doughnut>
        </div>
        <div class="right">
            <span class="title" data-content="kWh">{{groupkwh}}</span>
            <span class="state txt_green">{{groupReduction}}% Reduction</span>
            <!-- <span :class="changeClassColor('state txt_green')">{{groupReduction}}% Reduction</span> -->
        </div>
    </div>
</div>
</template>

<script>

import Doughnut from '@/components/dashboard/chart/DoughnutChart';
export default {
    name: "DoughnutChart",
    props: ["groupName","groupkwh","groupReduction"],
    components: {
        Doughnut
    },
    data() {
        return {
            Datacollection: {
                //Data to be represented on x-axis
                //labels: ['January',''],
                datasets: [
                    {
                        backgroundColor: ['#f87979'],
                        data: [40,60]
                    }
                ]
            },
        }
    },
    computed: {
    },
    methods: {
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
    created() {
    },
    mounted() {
        
    },
    destroyed() {
    }
}
</script>