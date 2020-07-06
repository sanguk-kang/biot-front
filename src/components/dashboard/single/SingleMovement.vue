<!--싱글사이트 > 운전형황 -->
<template>
    <!-- 페이지 tab 나오는 기본 화면-->
    <!-- <div class="content">
        <TabPage></TabPage>페이지 tab -->
        <div class="layout_wrap_side">
            <!-- 카드상자영역 시작 -->
            <div class="drawer_wrap">
                <!-- 1X1 시작 -->
                <div class="d_card w1 h1">
                    <div class="d_card_name">
                        Site name 1
                    </div>
                    <div class="d_card_con">
                        <ul class="d_card_info">
                            <li>
                                <span class="stit">Outdoor Temp.</span>
                                <span class="info" data-content="℃">7.36</span>
                            </li>
                            <li>
                                <span class="stit">Outdoor Hum.</span>
                                <span class="info" data-content="%">30 </span>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- 1X1 끝 -->

                <!-- 1X1 시작 -->
                <div class="d_card w1 h1">
                    <div class="d_card_name">
                        Outdoor temperature
                    </div>
                    <div class="d_card_con">
                        <ul class="d_card_info one">
                            <li>
                                <p class="stit">Temperature Sensor</p>
                                <p class="info"><strong>7.36 </strong>˚c</p>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- 1X1 끝 -->

                <!-- 2X2 시작 -->
                <div class="d_card w2 h2">
                    <div class="d_card_name">
                        Used Time Top 5 of Day : 2X2
                    </div>
                    <div class="d_card_con">
                        <!-- 그래프 영역 -->
                        <img src="@/assets/images/dashboard/2002_2.png" alt="샘플이미지">
                    </div>
                </div>
                <!-- 2X2 끝 -->
            </div>
            <!-- 카드상자영역 끝 -->
            <!-- 검색필터 영역 시작-->
            <div class="content_title_wrap no_title">
                <ul class="flex_left">
                    <li class="select_w1">
                        <!-- 셀렉트 박스 시작 -->
                        <el-select v-model="elSelectVal" placeholder="Select">
                            <el-option
                            v-for="item in selectboxData"
                            :key="item.value"
                            :label="item.key"
                            :value="item.value">
                            </el-option>
                        </el-select>
                        <!-- 셀렉트 박스 끝 -->
                    </li>
                    <li class="select_w1" >
                        <!-- 비활성화 셀렉트 박스 시작 -->
                        <el-select v-model="elSelectVal" placeholder="Select">
                            <el-option
                            v-for="item in selectboxData"
                            :key="item.value"
                            :label="item.key"
                            :value="item.value">
                            </el-option>
                        </el-select>
                        <!-- 비활성화 셀렉트 박스 끝 -->    
                    </li>
                    <li class="select_w1">
                        <!-- 셀렉트 박스 시작 -->
                        <el-select v-model="elSelectVal" placeholder="Select">
                            <el-option
                            v-for="item in selectboxData"
                            :key="item.value"
                            :label="item.key"
                            :value="item.value">
                            </el-option>
                        </el-select>
                        <!-- 셀렉트 박스 끝 -->    
                    </li>
                    <li class="select_w1">
                        <!-- 셀렉트 박스 시작 -->
                        <el-select v-model="elSelectVal" placeholder="Select">
                            <el-option
                            v-for="item in selectboxData"
                            :key="item.value"
                            :label="item.key"
                            :value="item.value">
                            </el-option>
                        </el-select>
                        <!-- 셀렉트 박스 끝 -->    
                    </li>
                </ul>
            </div>
            <!-- 검색필터 영역 끝-->
            
            <!-- 사용전력 현황 시작-->
            <div class="gridview_list">
                <ul>
                    <li v-for="item in propDataObj" :key="item.key">
                        <DoughnutChart :groupName="item.groupName" :groupkwh="item.groupkwh" :groupReduction="item.groupReduction"></DoughnutChart>
                    </li>
                    <!-- <li>
                        <div class="card-item groupCard_Wrap critical">
                            <div class="group_name">
                                <span class="name">Group Name</span>
                            </div>
                            <div class="card-info">
                                <div class="left"><span class="device-img error Alarm-Critical"></span></div>
                                <div class="right"><span class="Alarm-Critical">Critical<br> Code 4578787l</span></div>
                            </div>
                        </div>
                    </li> -->
                    <!-- <li>
                        <div class="card-item groupCard_Wrap warning">
                            <div class="group_name">
                                <span class="name">Group Name</span>
                            </div>
                            <div class="card-info">
                                <div class="left"><span class="device-img error Alarm-Warning"></span></div>
                                <div class="right"><span class="Alarm-Warning">Warning<br> Code 4578787</span></div>
                            </div>
                        </div>
                    </li> -->
                    <!-- <li>
                        <div class="card-item groupCard_Wrap k-state-selected">
                            <div class="group_name">
                                <span class="name">Group Name Group Name Group N2</span>
                            </div>
                            <div class="card-info">
                                <div class="left">
                                    <img src="@/assets/images/dashboard/2003_1.png">
                                </div>
                                <div class="right">
                                    <span class="title" data-content="kWh">14,254 </span>
                                    <span class="state txt_blue">1.2% Reduction</span>
                                </div>
                            </div>
                        </div>
                    </li> -->
                </ul>
            </div>

        </div>
    <!-- </div> -->
</template>


<script>
import DoughnutChart from '@/components/dashboard/chart/DoughnutList';
export default {
    name: "SingleMovement",
    props: ["propDataObj"],
    components: {
        DoughnutChart
    },
    watch: {
        selectValue(val) {
            console.log('watch selectValue:', val);
        },
        dropDownValue(val) {
            console.log('watch dropDownValue(val):', val);
        },
        dropIconValue(val) {
            console.log('watch dropIconValue:', val);
        }
    },
    data() {
        return {
            // select 변수
            elSelectVal: '',
            selectboxData: [
                {
                value: '스타벅스',
                key: 'starbucks'
                },
                {
                value: '커피빈',
                key: 'coffeebean'
                },
                {
                value: '투썸플레이스',
                key: 'twosome'
                }
            ],
        }
    },
    computed: {
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