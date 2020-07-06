<template>
    <sweet-modal ref="deviceDetailModal" overlay-theme="dark" id="sweet_modal_style">
        <!-- 모달 기본 스타일 S -->
        <div style="width:820px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title" v-on:close="closeModal">
                상세정보
            </div>
            <!-- 모달 제목 영역 E-->

            <!-- Accordion 모달 내용 영역 S-->
            <div class="sweet_modal_stitle" v-if="detailList.length > 1">
                <p class="stitle">{{ detailList.length }}개의 디바이스 선택</p>
                <!-- <p class="date">정상</p> -->
            </div>

            <div class="sweet_modal_content">
                <div class="toggle_list">
                    <ul>
                        <li v-for="(rowData, rowIdx) in detailList" :key="rowIdx">
                            <template v-if="rowData.deviceType == 'AirConditioner'">
                                <!-- DeviceInDoor(18G001) -->
                                <div class="title open">
                                    <span class="detail-img On Heat "></span>{{ rowData.label }}
                                    <p class="date">정상(켜짐)</p>
                                </div>

                                <table class="pop_table view_type">
                                    <colgroup>
                                        <col style="width: 210px;">
                                        <col>
                                    </colgroup>

                                    <tbody>
                                        <tr>
                                            <th>디바이스 타입</th>
                                            <td>실내기</td>
                                        </tr>
                                        <tr>
                                            <th>디바이스 ID</th>
                                            <td>{{ rowData.id }}</td>
                                        </tr>
                                        <tr>
                                            <th>디바이스 이름</th>
                                            <td v-if="isMofity == false">{{ rowData.label }}</td>
                                            <td v-else-if="isMofity == true">
                                                <div class="input_wrap input_w3">
                                                    <input type="text" class="k-input" v-model="rowData.label" v-bind:maxlength="100">
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>상태</th>
                                            <td><span :class="getRepresentativeStatusClass(rowData.representativeStatus)"></span></td>
                                        </tr>
                                        <tr>
                                            <th>운전모드</th>
                                            <td>난방</td>
                                        </tr>
                                        <tr>
                                            <th>설정온도</th>
                                            <td>23.0℉</td>
                                        </tr>
                                        <tr>
                                            <th>현재온도</th>
                                            <td>23.0℉</td>
                                        </tr>
                                        <tr>
                                            <th>리모컨 제어</th>
                                            <td>리모컨 허용</td>
                                        </tr>
                                        <tr>
                                            <th>그룹</th>
                                            <td>-</td>
                                        </tr>
                                        <tr>
                                            <th>모델</th>
                                            <td>Duct</td>
                                        </tr>
                                        <tr>
                                            <th>펌웨어 버전</th>
                                            <td>2016-12-22</td>
                                        </tr>
                                        <tr>
                                            <th>설명</th>
                                            <td v-if="isMofity == false">{{rowData.description}}</td>
                                            <td v-else-if="isMofity == true">
                                                <div class="input_wrap input_w3">
                                                    <input type="text" class="k-input" v-model="rowData.description" v-bind:maxlength="300">
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </template>
                            <template v-if="rowData.deviceType == 'AirConditionerOutdoor'">
                                <!-- DeviceOutDoor -->
                                <div class="title open">
                                    <span class="detail-img On Heat "></span>{{ rowData.label }}
                                    <p class="date">정상(켜짐)</p>
                                </div>

                                <table class="pop_table view_type">
                                    <colgroup>
                                        <col style="width: 210px;">
                                        <col>
                                    </colgroup>

                                    <tbody>
                                        <tr>
                                            <th>디바이스 타입</th>
                                            <td>실외기</td>
                                        </tr>
                                        <tr>
                                            <th>디바이스 ID</th>
                                            <td>{{rowData.id}}</td>
                                        </tr>
                                        <tr>
                                            <th>디바이스 이름</th>
                                            <td v-if="isMofity == false">{{ rowData.label }}</td>
                                            <td v-else-if="isMofity == true">
                                                <div class="input_wrap input_w3">
                                                    <input type="text" class="k-input" v-model="rowData.label" v-bind:maxlength="100">
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>상태</th>
                                            <td><span :class="getRepresentativeStatusClass(rowData.representativeStatus)"></span></td>
                                        </tr>
                                        <tr>
                                            <th>운전모드</th>
                                            <td>난방</td>
                                        </tr>
                                        <tr>
                                            <th>실외온도</th>
                                            <td>23.0℉</td>
                                        </tr>
                                        <tr>
                                            <th>리모컨 제어</th>
                                            <td>리모컨 허용</td>
                                        </tr>
                                        <tr>
                                            <th>그룹</th>
                                            <td>{{getGroupName(rowData.group)}}</td>
                                        </tr>
                                        <tr>
                                            <th>모델</th>
                                            <td>Duct</td>
                                        </tr>
                                        <tr>
                                            <th>펌웨어 버전</th>
                                            <td>2016-12-22</td>
                                        </tr>
                                        <tr>
                                            <th>설명</th>
                                            <td v-if="isMofity == false">{{rowData.description}}</td>
                                            <td v-else-if="isMofity == true">
                                                <div class="input_wrap input_w3">
                                                    <input type="text" class="k-input" v-model="rowData.description" v-bind:maxlength="300">
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </template>

                            <template v-if="rowData.deviceType == 'Meter'">
                                <!-- EnergyMeter -->
                                <div class="title open">
                                    <span class="detail-img On Heat "></span>{{rowData.label}}
                                    <p class="date">정상</p>
                                </div>

                                <table class="pop_table view_type">
                                    <colgroup>
                                        <col style="width: 210px;">
                                        <col>
                                    </colgroup>
                                    <tbody>
                                    <tr>
                                        <th>디바이스 타입</th>
                                        <td>에너지미터</td>
                                    </tr>
                                    <tr>
                                        <th>디바이스 이름</th>
                                        <td v-if="isMofity == false">{{ rowData.label }}</td>
                                        <td v-else-if="isMofity == true">
                                            <div class="input_wrap input_w3">
                                                <input type="text" class="k-input" v-model="rowData.label" v-bind:maxlength="100">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>디바이스 이름</th>
                                        <td>{{rowData.label}}</td>
                                    </tr>
                                    <tr>
                                        <th>에너지 미터 타입</th>
                                        <td>{{getMeterTypeName(rowData.deviceSubType)}}</td>
                                    </tr>
                                    <tr>
                                        <th>소비 카테고리 타입</th>
                                        <td>{{rowData.meterUnit.category}}</td>
                                    </tr>
                                    <tr>
                                        <th>SAC 연결 타입</th>
                                        <td>{{rowData.meterUnit.connectedDeviceType}}</td>
                                    </tr>
                                    <tr>
                                        <th>상태</th>
                                        <td><span :class="getRepresentativeStatusClass(rowData.representativeStatus)"></span></td>
                                    </tr>
                                    <tr>
                                        <th>그룹</th>
                                        <td>{{getGroupName(rowData.group)}}</td>
                                    </tr>
                                    <tr>
                                        <th>현재 소비량</th>
                                        <td>{{getConsumptionText(rowData.representativeStatus,rowData.meterUnit.reading)}}</td>
                                    </tr>
                                    <tr>
                                        <th>제조사</th>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <th>모델</th>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <th>펌웨어 버전</th>
                                        <td>2016-12-22</td>
                                    </tr>
                                    <tr>
                                        <th>설명</th>
                                        <td v-if="isMofity == false">{{rowData.description}}</td>
                                        <td v-else-if="isMofity == true">
                                            <div class="input_wrap input_w3">
                                                <input type="text" class="k-input" v-model="rowData.description" v-bind:maxlength="300">
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </template>

                            <template v-if="rowData.deviceType == 'Airpurifier'">
                                <!-- Airpurifier -->
                                <div class="title open">
                                    <span class="detail-img On Heat "></span>{{rowData.label}}
                                    <p class="date">정상</p>
                                </div>

                                <table class="pop_table view_type">
                                    <colgroup>
                                        <col style="width: 210px;">
                                        <col>
                                    </colgroup>
                                    <tbody>
                                    <tr>
                                        <th>디바이스타입</th>
                                        <td>공기청정기</td>
                                    </tr>
                                    <tr>
                                        <th>디바이스 ID</th>
                                        <td>{{rowData.id}}</td>
                                    </tr>
                                    <tr>
                                        <th>디바이스 이름</th>
                                        <td v-if="isMofity == false">{{ rowData.label }}</td>
                                        <td v-else-if="isMofity == true">
                                            <div class="input_wrap input_w3">
                                                <input type="text" class="k-input" v-model="rowData.label" v-bind:maxlength="100">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>상태</th><!-- 켜짐/꺼짐 -->
                                        <td><span :class="getRepresentativeStatusClass(rowData.representativeStatus)"></span></td>
                                    </tr>
                                    <tr>
                                        <th>공기질</th>
                                        <td>
                                            <span :class="getAirQualityStatusClassName(rowData.airpurifierUnit.airQuality)"></span><span class="airQ_verypoor">매우나쁨</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>PM10</th>
                                        <td><span class="airQ_normal">보통 ( {{rowData.airpurifierUnit.pm10_0}}㎍/㎥ )</span></td>
                                    </tr>
                                    <tr>
                                        <th>PM2.5</th>
                                        <td><span class="airQ_verypoor">매우나쁨 ({{rowData.airpurifierUnit.pm2_5}} ㎍/㎥)</span></td>
                                    </tr>
                                    <tr>
                                        <th>PM1.0</th>
                                        <td><span class="airQ_verypoor">매우나쁨 ({{rowData.airpurifierUnit.pm1_0}} ㎍/㎥)</span></td>
                                    </tr>
                                    <tr>
                                        <th>가스</th>
                                        <td><span class="airQ_normal">보통 ( {{rowData.airpurifierUnit.purity}}㎍/㎥ )</span></td>
                                    </tr>
                                    <tr>
                                        <th>필터</th>
                                        <td>{{rowData.airpurifierUnit.dustLevel}}</td>
                                    </tr>
                                    <tr>
                                        <th>그룹</th>
                                        <td>{{getGroupName(rowData.group)}}</td>
                                    </tr>
                                    <tr>
                                        <th>마지막 업데이트 시간</th>
                                        <td>2020-05-01 25:15:31</td>
                                    </tr>
                                    <tr>
                                        <th>설명</th>
                                        <td v-if="isMofity == false">{{rowData.description}}</td>
                                        <td v-else-if="isMofity == true">
                                            <div class="input_wrap input_w3">
                                                <input type="text" class="k-input" v-model="rowData.description" v-bind:maxlength="300">
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </template>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- Accordion 모달 내용 영역 E-->

            <!-- 모달 전체 버튼 영역 S-->
            <div class="sweet_modal_buttongroup">
                <button type="button" v-if="isMofity == false" v-on:click="changeEditMode" class="k-button">편집</button>
                <button type="button" v-else-if="isMofity == true" v-on:click="saveDeviceEdit" class="k-button">저장</button>
                <button type="button"  v-on:click="closeModal" class="k-button">닫기</button>
            </div>
            <!-- 모달 전체 버튼 영역 E-->
        </div>
        <!-- 모달 기본 스타일 E -->
    </sweet-modal>
</template>

<script>
// import axios from "@/api/axios.js";
import strUtils from "@/utils/stringUtils.js";

export default {
    name: "DeviceDetailModal",
    components: {},
    props: [ 'deviceDetailList' ],
    data: function() {
        return {
            isMofity : false,
            detailList: [],
            /* 에너지미터 타입 - Meter_WattHour, Meter_Gas, Meter_Water */
            ddDeviceTypeForDeviceEnergyMeterDataSource : [
                {"value": "전체 에너지미터 타입", "key": "Meter*"},
                {"value": "전력량계", "key": "WattHour"}, /* Electronic(WattHour)*/
                {"value": "가스량계", "key": "Gas"},
                {"value": "수도량계", "key": "Water"},
            ],
        }
    },
    watch: {
        deviceDetailList() {
            this.init();
        }
    },
    methods: {
        init() {
            this.detailList = JSON.parse(JSON.stringify(this.deviceDetailList)); //{...this.deviceDetailList};
        },
        openModal() {
            console.log("*** openModal");
            console.log(this.deviceDetailList);
            this.$refs.deviceDetailModal.open();
            //this.search();
        },
        closeModal() {
            this.isMofity = false;
            this.$refs.deviceDetailModal.close();
        },
        changeEditMode()
        {
            this.isMofity = !this.isMofity;
        },
        saveDeviceEdit()
        {
            console.log("this.detailList=",this.detailList);
        },
        getRepresentativeStatusClass(representativeStatus)
        {
            var representativeStatusClassName = "";
            if("Normal" == representativeStatus)
            {
                representativeStatusClassName = "circle-icon detail-popup Normal-On";
            }else if("Error" == representativeStatus)
            {
                representativeStatusClassName = "circle-icon detail-popup Error";
            }else if("Warn" == representativeStatus)
            {
                representativeStatusClassName = "circle-icon detail-popup Warning";
            }

            return representativeStatusClassName;
        },
        getMeterTypeName(deviceSubType)
        {
            var meterTypeName = "-";
            if(deviceSubType.length > 0)
            {
                var count = this.ddDeviceTypeForDeviceEnergyMeterDataSource.length;
                var key;
                for(var i=0;i<count;i++)
                {
                    key = this.ddDeviceTypeForDeviceEnergyMeterDataSource[i].key;
                    if(key == deviceSubType)
                    {
                        meterTypeName = this.ddDeviceTypeForDeviceEnergyMeterDataSource[i].value;
                        break; 
                    }
                }
            }

            return meterTypeName;
        },
        //현재소비량(전력소비량)
        getConsumptionText(representativeStatus,consumption)
        {
            var consumptionStr;

            if("Error" == representativeStatus)
            {
                consumptionStr = "error code";
            }else if("Warn" == representativeStatus)
            {
                consumptionStr = "warn code";
            }else if(consumption)
            {
                consumptionStr = consumption+" kWh";
            }else
            {
                consumptionStr = "-";
            }

            return consumptionStr;
        },
        getAirQualityStatusClassName(status)
        {
            var airQualityStatusClassName = "";
            if("good" == status)
            {
                airQualityStatusClassName = "ic_dot airQ_normal_bg";
            }else if("normal" == status)
            {
                airQualityStatusClassName = "ic_dot airQ_comfort_bg";
            }else if("bad" == status)
            {
                airQualityStatusClassName = "ic_dot airQ_poor_bg";
            }else if("very_bad" == status)
            {
                airQualityStatusClassName = "ic_dot airQ_verypoor_bg";
            }

            return airQualityStatusClassName;
        },
        getGroupName(group)
        {
            var groupNameStr;

            //그룹이름
            if(group && !strUtils.isEmpty(group.dms_groups_name))
            {
                groupNameStr = group.dms_groups_name;
            }else
            {
                groupNameStr = "";
            }

            // if(!Bespin.isEmpty(group.dms_groups_name))
            // {
            //     groupNameMap.put(group.dms_groups_name,group.dms_groups_name);
            // }else
            // {
            //     groupNameMap.put('noGroup',"");
            // }

            // group = 
            // {
            //     tdClass : "tal",
            //     dom: $('<p>',{'class':'ellipsis'}).html(groupNameStr),
            //     evt: {},
            //     value: rowData.group,
            // };
            return groupNameStr;
        },
        // search() {
        //     console.log("[ API ]  : (POP) 디바이스 상세정보 (/api/device/device)");
        //     // console.log(this.idList)
        //     // console.log(JSON.stringify(this.idList))

        //     var list = [ { faultId: '1' }, { faultId: '2' } ];

        //     axios.getApi(/sms/maintenance/getFaultHistoryDetail', list).then(response => {
        //         this.deviceDetailList = response.data;
        //     }).catch(function (error) {
        //         var errCode = error.response.status;
        //         if(errCode == 400) {
        //             this.openAlert("API", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
        //         }
        //     });
        // }
    },
    created() {
        console.log("DeviceDetailModal.vue created() call!!");
        this.init();
    },
    mounted() {
    },
    destroyed() {
    }
}
</script>

<style lang="scss" scoped>

tr.pop_table_subtitle > th {
    color: #000000;
    font-weight: bold;
}

</style>