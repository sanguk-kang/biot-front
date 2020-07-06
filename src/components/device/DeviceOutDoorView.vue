<template>
<div class="layout_wrap_side" tabNo="3">
    <!-- s: grid top-->
    <div class="content_title_wrap">
        <ul class="right_area icon_type">
            <li><button id="btnDeviceOutDoorListView" class="ic ic-list active viewTypeForDeviceOutDoor" viewNo="1">목록보기</button></li>
            <!-- <li><button id="btnDeviceOutDoorTilesView" class="ic ic-tile viewTypeForDeviceOutDoor" viewNo="2">타일보기</button></li> -->
            <li>
                <div class="search_input_wrap">
                    <input id="txtSearchInputForDeviceOutDoor" class="k-input" type="text" placeholder="검색 내용 입력">
                    <span class="ic ic-bt-input-remove"></span>
                    <span class="ic ic-bt-input-search"></span>
                </div>
            </li>
        </ul>
    </div>
    <!-- e: grid top-->

    <!-- s: grid top filter-->
    <div class="content_title_wrap no_title viewWrapForDeviceOutDoor" viewNo="1">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceOutDoor :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceOutDoorDataSource' style="width:180px"></ddDeviceGroupForDeviceOutDoor></li>
            <li><ddDeviceSubGroupForDeviceOutDoor :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceOutDoorDataSource' style="width:180px"></ddDeviceSubGroupForDeviceOutDoor></li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceOutDoorListCount" class="selected_text">{{checkedCountTextForListView}}</span></li>
            <li><button id="btnDetailForDeviceOutDoor" class="k-button" :disabled="deviceOutDoorList.length == 0 || checkedTotalCountForListView == 0" @click="openDetailForDeviceOutDoor($event, null)">상세정보</button></li>
        </ul>
    </div>
    <!-- e: grid top filter-->

    <!-- s:site lsit wrap -->
    <div class="site-list-wrap">
        <!-- s: 컨텐츠 -->
        <section class="content_view viewWrapForDeviceOutDoor" viewNo="1">
            <!-- s: 기본 list-->
            <div id="deviceOutDoorGrid" class="g-table">
                <table>
                    <colgroup>
                        <col style="width:5%">
                        <col style="width:25%">
                        <col style="width:20%">
                        <col style="width:20%">
                        <col style="width:20%">
                        <col style="width:10%">
                    </colgroup>
                    <thead>
                    <tr>
                        <th><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAllForListView"><label class="k-checkbox-label single" for="ched_all"></label></span></th>
                        <th>디바이스 이름<i class="ic_sort"></i></th>
                        <th>잔류 제한<i class="ic_sort"></i></th>
                        <th>난방 용량 보정<i class="ic_sort"></i></th>
                        <th>냉방 용량 보전<i class="ic_sort"></i></th>
                        <th>상세정보</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="deviceOutDoorList.length == 0">
                        <td colspan="6" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지 않습니다.</td>
                    </tr>
                    <tr v-for="(rowData, rowIdx) in deviceOutDoorList" :key="rowData.id">
                        <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" :id="rowData.id" :value="rowIdx" @click="chkChangeForListView($event)" v-model="checkedForListView"><label class="k-checkbox-label single" :for="rowData.id"></label></span></td>
                        <td class="tal"><p class="ellipsis">{{rowData.label}}</p><p class="ellipsis">{{rowData.id}}</p></td>
                        <td>현재: {{rowData.airConditionerOutdoorUnit.electricCurrentControl == 'SelfControl' ? '자체제어' : rowData.airConditionerOutdoorUnit.electricCurrentControl}}
                            <select v-model="rowData.airConditionerOutdoorUnit.electricCurrentControl" @change="changeElectricCurrentControl($event,rowData)">
                                <option value="SelfControl" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == 'SelfControl'">자체제어</option>
                                <option value="50" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '50'">50%</option>
                                <option value="55" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '55'">55%</option>
                                <option value="60" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '60'">60%</option>
                                <option value="65" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '65'">65%</option>
                                <option value="70" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '70'">70%</option>
                                <option value="75" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '75'">75%</option>
                                <option value="80" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '80'">80%</option>
                                <option value="85" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '85'">85%</option>
                                <option value="90" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '90'">90%</option>
                                <option value="95" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '95'">95%</option>
                                <option value="100" :selected="rowData.airConditionerOutdoorUnit.electricCurrentControl == '100'">100%</option>
                            </select>
                        </td>
                        <td>현재: {{rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == 'SelfControl' ? '자체제어' : rowData.airConditionerOutdoorUnit.heatingCapacityCalibration}}
                            <select v-model="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration" @change="changeHeatingCapacityCalibration($event,rowData)">
                                <option value="SelfControl" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == 'SelfControl'">자체제어</option>
                                <option value="25" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '25'">25kg/cm²</option>
                                <option value="26" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '26'">26kg/cm²</option>
                                <option value="27" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '27'">27kg/cm²</option>
                                <option value="28" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '28'">28kg/cm²</option>
                                <option value="29" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '29'">29kg/cm²</option>
                                <option value="30" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '30'">30kg/cm²</option>
                                <option value="31" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '31'">31kg/cm²</option>
                                <option value="32" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '32'">32kg/cm²</option>
                                <option value="33" :selected="rowData.airConditionerOutdoorUnit.heatingCapacityCalibration == '33'">33kg/cm²</option>
                            </select>
                        </td>
                        <td>현재: {{rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == 'SelfControl' ? '자체제어' : rowData.airConditionerOutdoorUnit.coolingCapacityCalibration}}
                            <select v-model="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration" @change="changeCoolingCapacityCalibration($event,rowData)">
                                <option value="SelfControl" :selected="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == 'SelfControl'">자체제어</option>
                                <option value='5~7' :selected="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == '5~7'">5~7℃</option>
                                <option value='7~9' :selected="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == '7~9'">7~9℃</option>
                                <option value='9~11' :selected="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == '9~11'">9~11℃</option>
                                <option value='10~12' :selected="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == '10~12'">10~12℃</option>
                                <option value='11~13' :selected="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == '11~13'">11~13℃</option>
                                <option value='12~14' :selected="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == '12~14'">12~14℃</option>
                                <option value='13~15' :selected="rowData.airConditionerOutdoorUnit.coolingCapacityCalibration == '13~15'">13~15℃</option>
                            </select>
                        </td>
                        <td>
                            <div class="openDetailForDeviceOutDoor" style="cursor:'pointer'" @click="openDetailForDeviceOutDoor($event, rowData)"><span class='ic ic-info'></span></div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- e: 기본 list-->
        </section>
        <!-- e: 컨텐츠 -->

        <!-- s: Site List Area -->
        <section class="site-list">
            <!-- s: 상단 영역-->
            <ul class="title_area">
                <li class="active">Site</li>
            </ul>
            <div class="search_area">

                <div class="search_input_wrap">
                    <input class="k-input" type="text" placeholder="Group name">
                    <span class="ic ic-bt-input-remove" style="display:block;"></span>
                    <span class="ic ic-bt-input-search"></span>
                </div>
            </div>
            <!-- e: 상단 영역-->
            <!-- s: scroll 영역-->
            <div class="scroll_wrap only_site" style=" height:550px;"><!-- D: 세로 스크롤영역이 tbody 와 동일하게 height 가변-->
                <ul class="depth1" style="width: 300px;"><!-- D: 가로 스크롤영역이 가장 긴 텍스트 넓이 값으로 가변-->

                    <li><div class="ic_fold open"><span class="name">Site Name 1 (30)</span><a href="#" class="ic_detail">상세보기</a></div>
                        <ul class="depth2">
                            <li><div class="ic_fold open"><span class="name">Site Name 1-1</span></div>
                                <ul class="depth3">
                                    <li><div class="ic_fold open"><span class="name">Site Name 1-1-1</span></div>
                                        <ul class="depth4">
                                            <li class="active"><div class="ic_fold"><span class="name">Site Name 1-1-1-1</span></div></li>
                                            <li><div class="ic_fold"><span class="name">Site Name 1-1-1-2</span></div></li>
                                            <li><div class="ic_fold no_fold"><span class="name">Site Name 1-1-1-3</span></div></li>
                                            <li><div class="ic_fold no_fold"><span class="name">Site Name 1-1-1-4</span></div></li>
                                        </ul>
                                    </li>
                                    <li><div class="ic_fold "><span class="name">Site Name 1-1-2</span></div></li>
                                    <li><div class="ic_fold no_fold"><span class="name">Site Name 1-1-3</span></div></li>
                                    <li><div class="ic_fold no_fold"><span class="name">Site Name 1-1-4</span></div></li>
                                </ul>
                            </li>
                            <li><div class="ic_fold "><span class="name">Site Name 1-2</span></div></li>
                            <li><div class="ic_fold no_fold"><span class="name">Site Name 1-3</span></div></li>
                            <li><div class="ic_fold no_fold"><span class="name">Site Name 1-2</span></div></li>
                        </ul>
                    </li>
                    <li class="active"><div class="ic_fold"><span class="name">GroupGroupGroupGroupGroupG3</span></div></li>
                    <li><div class="ic_fold no_fold"><span class="name">GroupGroup4</span></div></li>
                    <li><div class="ic_fold"><span class="name">GroupGroup5</span></div></li>
                </ul>
            </div>
            <!-- e: scroll 영역-->
        </section>
    </div>
    <!-- e:site lsit wrap -->

    <!-- Detail Popup -->
    <DeviceDetailModal ref="deviceDetailModal"  v-bind:deviceDetailList="selectedDeviceOutDoorList"></DeviceDetailModal>
</div>
</template>

<script>
import axios from '@/api/axios.js';
// import strUtils from "@/utils/stringUtils.js";

import ddDeviceGroupForDeviceOutDoor from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceOutDoor from "@/components/custom/VueDropdown.vue";

import DeviceDetailModal from "@/components/device/popup/DeviceDetailModal.vue";

export default {
    name : "DeviceOutDoorView",
    components : {ddDeviceGroupForDeviceOutDoor, ddDeviceSubGroupForDeviceOutDoor, DeviceDetailModal},
    props : ["viewTypeForDeviceOutDoor"],
    data : function()
    {
        return {
            checkedTotalCountForListView: 0,
            checkedForListView: [],
            checkedCountTextForListView: '선택된 디바이스가 없습니다.',

            selectedDeviceOutDoorList: [],
            isLegendView : false,

            ddDeviceGroupForDeviceOutDoorDataSource: [],
            ddDeviceSubGroupForDeviceOutDoorDataSource: [],
            deviceOutDoorList: [
                {
                    "id": "00:FF:0E:01:00:D99E1A2645_1591392246666",
                    "label": "DVM Inverter/DVM S",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": [
                    {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                    }
                    ],
                    "alarms": "",
                    "configuration": "",
                    "modes": [
                    {
                        "property": "AirConditioner_Outdoor_CurrentRestriction",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    },
                    {
                        "property": "AirConditioner_Outdoor_HeatCapacityCorrection",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    },
                    {
                        "property": "AirConditioner_Outdoor_CoolCapacityCorrection",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    }
                    ],
                    "operations": [
                    {
                        "id": "AirConditioner_Outdoor_Power",
                        "power": "off"
                    }
                    ],
                    "temperatures": [],
                    "winds": [],
                    "deviceType": "AirConditionerOutdoor",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": {
                    "electricCurrentControlSupported": true,
                    "coolingCapacityCalibrationSupported": true,
                    "heatingCapacityCalibrationSupported": true,
                    "electricCurrentControl": "100",
                    "coolingCapacityCalibration": "5~7",
                    "heatingCapacityCalibration": "25"
                    },
                    "meterUnit": "",
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:0E:02:00:D99E1A2645_1591392246666",
                    "label": "DVM Inverter/DVM S",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": [
                    {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                    }
                    ],
                    "alarms": "",
                    "configuration": "",
                    "modes": [
                    {
                        "property": "AirConditioner_Outdoor_CurrentRestriction",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    },
                    {
                        "property": "AirConditioner_Outdoor_HeatCapacityCorrection",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    },
                    {
                        "property": "AirConditioner_Outdoor_CoolCapacityCorrection",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    }
                    ],
                    "operations": [
                    {
                        "id": "AirConditioner_Outdoor_Power",
                        "power": "off"
                    }
                    ],
                    "temperatures": [],
                    "winds": [],
                    "deviceType": "AirConditionerOutdoor",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": {
                    "electricCurrentControlSupported": true,
                    "coolingCapacityCalibrationSupported": true,
                    "heatingCapacityCalibrationSupported": true,
                    "electricCurrentControl": "100",
                    "coolingCapacityCalibration": "5~7",
                    "heatingCapacityCalibration": "25"
                    },
                    "meterUnit": "",
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:0E:00:00:D99E1A2645_1591392246666",
                    "label": "DVM Inverter/DVM S",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": [
                    {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                    }
                    ],
                    "alarms": "",
                    "configuration": "",
                    "modes": [
                    {
                        "property": "AirConditioner_Outdoor_CurrentRestriction",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    },
                    {
                        "property": "AirConditioner_Outdoor_HeatCapacityCorrection",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    },
                    {
                        "property": "AirConditioner_Outdoor_CoolCapacityCorrection",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    }
                    ],
                    "operations": [
                    {
                        "id": "AirConditioner_Outdoor_Power",
                        "power": "off"
                    }
                    ],
                    "temperatures": [],
                    "winds": [],
                    "deviceType": "AirConditionerOutdoor",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": {
                    "electricCurrentControlSupported": true,
                    "coolingCapacityCalibrationSupported": true,
                    "heatingCapacityCalibrationSupported": true,
                    "electricCurrentControl": "100",
                    "coolingCapacityCalibration": "5~7",
                    "heatingCapacityCalibration": "25"
                    },
                    "meterUnit": "",
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:0E:00:02:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": [
                    {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                    }
                    ],
                    "alarms": "",
                    "configuration": "",
                    "modes": [
                    {
                        "property": "AirConditioner_Outdoor_CurrentRestriction",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    },
                    {
                        "property": "AirConditioner_Outdoor_HeatCapacityCorrection",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    },
                    {
                        "property": "AirConditioner_Outdoor_CoolCapacityCorrection",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                        "Heat",
                        "Cool"
                        ],
                        "mode": "None"
                    }
                    ],
                    "operations": [
                    {
                        "id": "AirConditioner_Outdoor_Power",
                        "power": "off"
                    }
                    ],
                    "temperatures": [],
                    "winds": [],
                    "deviceType": "AirConditionerOutdoor",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": 46,
                    "dms_groups_name": "그룹3-2"
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": {
                    "electricCurrentControlSupported": true,
                    "coolingCapacityCalibrationSupported": true,
                    "heatingCapacityCalibrationSupported": true,
                    "electricCurrentControl": "100",
                    "coolingCapacityCalibration": "5~7",
                    "heatingCapacityCalibration": "25"
                    },
                    "meterUnit": "",
                    "airpurifierUnit": ""
                }
            ],
        }
    },
    methods: {
        chkChangeForListView: function(event)
        {
            event.target.checked ? ++ this.checkedTotalCountForListView : -- this.checkedTotalCountForListView;
            this.checkedCountTextForListView = this.checkedTotalCountForListView > 0 ? this.checkedTotalCountForListView + '개의 디바이스가 선택되었습니다.' : '선택된 디바이스가 없습니다.';
        },
        changeElectricCurrentControl(event,rowData)
        {
            var val = event.target.value;
            var deviceId = rowData.id;
            console.log("changeElectricCurrentControl val="+val+", deviceId="+deviceId);
            //잔류제한 수치 수정 - rest api 호출
        },
        changeHeatingCapacityCalibration(event,rowData)
        {
            var val = event.target.value;
            var deviceId = rowData.id;
            console.log("changeHeatingCapacityCalibration val="+val+", deviceId="+deviceId);
            //난방 용량 보정 - rest api 호출
        },
        changeCoolingCapacityCalibration(event,rowData)
        {
            var val = event.target.value;
            var deviceId = rowData.id;
            console.log("changeCoolingCapacityCalibration val="+val+", deviceId="+deviceId);
            //냉방 용량 보정 - rest api 호출
        },
        initSearch()
        {
            //디바이스 그룹 콤보 설정
            // var apiHeader = {
            //     headers: {
            //         'accept': 'application/vnd.samsung.biot.v1+json;charset=UTF-8',
            //     }
            // }

            var params =
            {
                "siteId": "D99E1A2645",
            };

            axios.getApi('/dms/groups', params).then(res => {
                // 정상
                if(res.status == 200)
                {
                    var deviceGroupData = [];
                    var resultList = res.data;
                    resultList.forEach(function(rowData){
                        deviceGroupData.push({
                            "key": rowData.id,
                            "value": rowData.name,
                            "checked": false,
                        });
                    });

                    this.ddDeviceGroupForDeviceOutDoorDataSource = deviceGroupData;
                    console.log("/dms/groups ddDeviceGroupForDeviceOutDoorDataSource=", this.ddDeviceGroupForDeviceOutDoorDataSource);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                console.log('/dms/groups error', error);
                // 승인대기 및 라이선스
            });
        },
        getDeviceOutDoorList()
        {
            //실내기 조회
            // var apiHeader = {
            //     headers: {
            //         'accept': 'application/vnd.samsung.biot.v1+json;charset=UTF-8',
            //     }
            // }

            var params =
            {
                "deviceRegisterStatus": true,
                "deviceTypes": "AirConditionerOutdoor",
                "siteId": "D99E1A2645",
                "userId": "webadmin",
                "userRoleType": 101,
            };

            axios.getApi('/dms/devices', params).then(res => {
                // 정상
                if(res.status == 200)
                {
                    this.deviceOutDoorList = res.data;
                    console.log("/dms/devices deviceOutDoorList=", this.deviceOutDoorList);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                console.log('/dms/devices error', error);
                // 승인대기 및 라이선스
            });
        },
        openDetailForDeviceOutDoor(event, selectedRowData)
        {
            console.log('openDetailForDeviceOutDoor open event=', event+" this.checkedForListView=",this.checkedForListView+" selectedRowData=",selectedRowData);
            this.selectedDeviceOutDoorList = [];

            if(selectedRowData)
            {
                this.selectedDeviceOutDoorList.push(selectedRowData);
            }
            else
            {
                var checkedForListViewCount = this.checkedForListView.length;
                for(var i=0;i<checkedForListViewCount;i++)
                {
                    var checkedRowIdx = this.checkedForListView[i];
                    var tempRowData = this.deviceOutDoorList[checkedRowIdx];
                    this.selectedDeviceOutDoorList.push(tempRowData);
                }
            }

            this.$refs.deviceDetailModal.openModal();
        }
    },
    computed: {
        checkAllForListView: {
            get: function () {
                return this.deviceOutDoorList ? this.checkedForListView.length == this.deviceOutDoorList.length : false;
            },
            set: function (value) {
                var checkedForListView = [];
                if (value) {
                    this.deviceOutDoorList.forEach(function (item, rowIdx) { checkedForListView.push(rowIdx); });
                }

                this.checkedForListView = checkedForListView;

                if(this.checkedForListView.length > 0) {
                    this.checkedTotalCountForListView = this.checkedForListView.length;
                    this.checkedCountTextForListView = this.checkedForListView.length + '개의 디바이스가 선택되었습니다.';
                } else {
                    this.checkedTotalCountForListView = 0;
                    this.checkedCountTextForListView = '선택된 디바이스가 없습니다.';
                }
            }
        }
    },
    created()
    {
        console.log("DeviceOutDoorView Tab Call!!");
        this.initSearch();
        this.getDeviceOutDoorList();
    },
    mounted()
    {

    },
    destroyed()
    {

    }
}
</script>