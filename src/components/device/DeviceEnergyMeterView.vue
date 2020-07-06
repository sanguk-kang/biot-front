<template>
<div class="layout_wrap_side" tabNo="4">
    <!-- s: view type top-->
    <div class="content_title_wrap">
        <ul class="right_area icon_type">
            <li><button id="btnDeviceEnergyMeterListView" class="ic ic-list" :class="{'active': viewTypeForDeviceEnergyMeter == 1}" @click="setViewType(1)">목록보기</button></li>
            <li><button id="btnDeviceEnergyMeterTilesView" class="ic ic-tile" :class="{'active': viewTypeForDeviceEnergyMeter == 2}" @click="setViewType(2)">타일보기</button></li>
            <li>
                <div class="search_input_wrap">
                    <input id="txtSearchInputForDeviceEnergyMeter" class="k-input" type="text" placeholder="검색 내용 입력">
                    <span class="ic ic-bt-input-remove"></span>
                    <span class="ic ic-bt-input-search"></span>
                </div>
            </li>
        </ul>
    </div>
    <!-- e: view type top-->

    <!-- s: list view filter-->
    <div class="content_title_wrap no_title" v-if="viewTypeForDeviceEnergyMeter == 1">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceEnergyMeter :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceEnergyMeterDataSource' style="width:180px"></ddDeviceGroupForDeviceEnergyMeter></li>
            <li><ddDeviceSubGroupForDeviceEnergyMeter :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceEnergyMeterDataSource' style="width:180px"></ddDeviceSubGroupForDeviceEnergyMeter></li>
            <li><ddDeviceTypeForDeviceEnergyMeter :isCheckType='true' :selectboxData='ddDeviceTypeForDeviceEnergyMeterDataSource' style="width:150px"></ddDeviceTypeForDeviceEnergyMeter></li>
            <li><ddDeviceStatusForDeviceEnergyMeter :isCheckType='true' :selectboxData='ddDeviceStatusForDeviceEnergyMeterDataSource' style="width:150px"></ddDeviceStatusForDeviceEnergyMeter></li>
            <li><span class="ic-bar"></span></li>
            <li><a href="#" class="btn_legend" @mouseenter="showLegend()" @mouseleave="hideLegend()">범례</a>
                <!-- s:Legend box-->
                <div class="toolbox" :class="{'hide':!isLegendView}" style="left:-105px;top:40px;"><!-- d: 위치값 가변, hide 삭제시 보여짐 hide-->
                    <ul class="legend_list">
                        <li><span class="ic_dot normal_on"></span>정상</li>
                        <li><span class="ic_dot error"></span>에러</li>
                        <li><span class="ic_dot warning"></span>경고</li>
                    </ul>
                </div>
                <!-- e:Legend box-->
            </li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceEnergyMeterListCount" class="selected_text">{{checkedCountTextForListView}}</span></li>
            <li><button id="btnDetailForDeviceEnergyMeter" class="k-button" :disabled="deviceEnergyMeterList.length == 0 || checkedTotalCountForListView == 0" @click="openDetailForDeviceEnergyMeter($event, null)">상세정보</button></li>
        </ul>
    </div>
    <!-- e: list view filter-->

    <!-- s: grid view filter-->
    <div class="content_title_wrap no_title" v-if="viewTypeForDeviceEnergyMeter == 2">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceEnergyMeter2 :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceEnergyMeter2DataSource' style="width:180px"></ddDeviceGroupForDeviceEnergyMeter2></li>
            <li><ddDeviceSubGroupForDeviceEnergyMeter2 :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceEnergyMeter2DataSource' style="width:180px"></ddDeviceSubGroupForDeviceEnergyMeter2></li>
            <li><ddDeviceTypeForDeviceEnergyMeter2 :isCheckType='true' :selectboxData='ddDeviceTypeForDeviceEnergyMeter2DataSource' style="width:150px"></ddDeviceTypeForDeviceEnergyMeter2></li>
            <li><ddDeviceStatusForDeviceEnergyMeter2 :isCheckType='true' :selectboxData='ddDeviceStatusForDeviceEnergyMeter2DataSource' style="width:150px"></ddDeviceStatusForDeviceEnergyMeter2></li>
            <li><button id="btnDeviceEnergyMeterTilesListAll" class="k-button input_w9">전체 선택</button></li>
            <li><span class="ic-bar"></span></li>
            <li><a href="#" class="btn_legend" @mouseenter="showLegend()" @mouseleave="hideLegend()">범례</a>
                <!-- s:Legend box-->
                <div class="toolbox" :class="{'hide':!isLegendView}" style="left:-105px;top:40px;"><!-- d: 위치값 가변, hide 삭제시 보여짐 hide-->
                    <ul class="legend_list">
                        <li><span class="ic_dot normal_on"></span>정상</li>
                        <li><span class="ic_dot error"></span>에러</li>
                        <li><span class="ic_dot warning"></span>경고</li>
                    </ul>
                </div>
                <!-- e:Legend box-->
            </li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceEnergyMeterListCount2" class="selected_text">{{selectedCountTextForGridView}}</span></li>
            <li><button id="btnDetailForDeviceEnergyMeter2" class="k-button" disabled="disabled">상세정보</button></li>
        </ul>
    </div>
    <!-- e: grid view filter-->

    <!-- s:site lsit wrap -->
    <div class="site-list-wrap">
        <!-- s: 컨텐츠 -->
        <section class="content_view" v-if="viewTypeForDeviceEnergyMeter == 1">
            <!-- s: 기본 list-->
            <div id="deviceEnergyMeterGrid" class="g-table">
                <table>
                    <colgroup>
                        <col style="width:5%">
                        <col style="width:23%">
                        <col style="width:10%">
                        <col style="width:14%">
                        <col style="width:10%">
                        <col style="width:10%">
                        <col><!-- width:23% -->
                        <col style="width:5%">
                    </colgroup>
                    <thead>
                    <tr>
                        <th><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAllForListView"><label class="k-checkbox-label single" for="ched_all"></label></span></th>
                        <th>디바이스 이름<i class="ic_sort"></i></th>
                        <th>상태<i class="ic_sort"></i></th>
                        <th>에너지 미터 타입<i class="ic_sort"></i></th>
                        <th>카테고리<i class="ic_sort"></i></th>
                        <th>현재소비량<i class="ic_sort"></i></th>
                        <th>그룹 이름<i class="ic_sort"></i></th>
                        <th>상세정보</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="deviceEnergyMeterList.length == 0">
                        <td colspan="8" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지 않습니다.</td>
                    </tr>
                    <tr v-for="(rowData, rowIdx) in deviceEnergyMeterList" :key="rowData.id">
                        <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" :id="rowData.id" :value="rowIdx" @click="chkChangeForListView($event)" v-model="checkedForListView"><label class="k-checkbox-label single" :for="rowData.id"></label></span></td>
                        <td class="tal"><p class="ellipsis">{{rowData.label}}</p><p class="ellipsis">{{rowData.id}}</p></td>
                        <td>
                            <span :class="getRepresentativeStatusClass(rowData.representativeStatus)"></span>
                        </td>
                        <td>{{getMeterTypeName(rowData.deviceSubType)}}</td>
                        <td>{{rowData.meterUnit.category}}</td>
                        <td>{{getConsumptionText(rowData.representativeStatus,rowData.meterUnit.reading)}}</td>
                        <td class="tal"><p class="ellipsis">{{getGroupName(rowData.group)}}</p></td>
                        <td>
                            <div class="openDetailForDeviceEnergyMeter" style="cursor:'pointer'" @click="openDetailForDeviceEnergyMeter($event, rowData)"><span class='ic ic-info'></span></div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- e: 기본 list-->
        </section>
        <!-- e: 컨텐츠 -->

        <!-- s: 컨텐츠 -->
        <section class="content_view" v-if="viewTypeForDeviceEnergyMeter == 2">
            <p class="content_title">Group Nam1</p>
            <!-- s: Grid list-->
            <div class="gridview_list">
                <ul>
                    <li>
                        <div class="card-item engCardWrap k-state-selected">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-On"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-On">3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-Off"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-Off" >3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap critical">
                            <div class="card-info">
                                <div class="left"><span class="device-img error Alarm-Critical"></span></div>
                                <div class="right"><span class="Alarm-Critical" >Critical<br/> Code 4578787l</span></div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap warning">
                            <div class="card-info">
                                <div class="left"><span class="device-img error Alarm-Warning"></span></div>
                                <div class="right"><span class="Alarm-Warning" >Warning<br/> Code 4578787</span></div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-On"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-On">3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-Off"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-Off" >3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-Off"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-Off" >3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-Off"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-Off" >3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-Off"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-Off" >3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-Off"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-Off" >3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item engCardWrap">
                            <div class="card-info">
                                <div class="left">
                                    <span class="device-img energyM Normal-Off"></span>
                                </div>
                                <div class="right">
                                    <p class="engt" >현재 소비량</p>
                                    <p class="engt_num Normal-Off" >3,825.9 kWh</p>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                </ul>
            </div>
            <!-- e: Grid list-->

            <p class="content_title">Group Nam2 > Group2-1</p>
            <!-- s: Grid list-->
            <div class="gridview_list">
                <ul>
                    <li>
                        <div class="card-item critical">
                            <div class="card-info">
                                <div class="left"><span class="device-img error Alarm-Critical"></span></div>
                                <div class="right"><span class="Alarm-Critical" >Critical<br/> Code 4578787l</span></div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item warning">
                            <div class="card-info">
                                <div class="left"><span class="device-img error Alarm-Warning"></span></div>
                                <div class="right"><span class="Alarm-Warning" >Warning<br/> Code 4578787</span></div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                </ul>
            </div>
            <!-- e: Grid list-->
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

    <!-- Detail Popup -->
    <DeviceDetailModal ref="deviceDetailModal"  v-bind:deviceDetailList="selectedDeviceEnergyMeterList"></DeviceDetailModal>
</div>
</template>

<script>
import axios from '@/api/axios.js';
import strUtils from "@/utils/stringUtils.js";

import ddDeviceGroupForDeviceEnergyMeter from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceEnergyMeter from "@/components/custom/VueDropdown.vue";
import ddDeviceTypeForDeviceEnergyMeter from "@/components/custom/VueDropdown.vue";
import ddDeviceStatusForDeviceEnergyMeter from "@/components/custom/VueDropdown.vue";

import ddDeviceGroupForDeviceEnergyMeter2 from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceEnergyMeter2 from "@/components/custom/VueDropdown.vue";
import ddDeviceTypeForDeviceEnergyMeter2 from "@/components/custom/VueDropdown.vue";
import ddDeviceStatusForDeviceEnergyMeter2 from "@/components/custom/VueDropdown.vue";

import DeviceDetailModal from "@/components/device/popup/DeviceDetailModal.vue";

export default {
    name : "DeviceEnergyMeterView",
    components : {
        ddDeviceGroupForDeviceEnergyMeter, ddDeviceSubGroupForDeviceEnergyMeter, ddDeviceTypeForDeviceEnergyMeter,ddDeviceStatusForDeviceEnergyMeter,
        ddDeviceGroupForDeviceEnergyMeter2, ddDeviceSubGroupForDeviceEnergyMeter2, ddDeviceTypeForDeviceEnergyMeter2, ddDeviceStatusForDeviceEnergyMeter2,
        DeviceDetailModal
    },
    props : ["viewTypeForDeviceEnergyMeter"],
    data : function()
    {
        return {
            checkedTotalCountForListView: 0,
            checkedForListView: [],
            checkedCountTextForListView: '선택된 디바이스가 없습니다.',
            selectedCountTextForGridView: 0,

            selectedDeviceEnergyMeterList: [],

            isLegendView : false,
            tilesAllSelected : true,

            ddDeviceGroupForDeviceEnergyMeterDataSource: [],
            ddDeviceGroupForDeviceEnergyMeter2DataSource: [],
            ddDeviceSubGroupForDeviceEnergyMeterDataSource: [],
            ddDeviceSubGroupForDeviceEnergyMeter2DataSource: [],
            /* 에너지미터 타입 - Meter_WattHour, Meter_Gas, Meter_Water */
            ddDeviceTypeForDeviceEnergyMeterDataSource : [
                {"value": "전체 에너지미터 타입", "key": "Meter*"},
                {"value": "전력량계", "key": "WattHour"}, /* Electronic(WattHour)*/
                {"value": "가스량계", "key": "Gas"},
                {"value": "수도량계", "key": "Water"},
            ],
            ddDeviceTypeForDeviceEnergyMeter2DataSource : [
                {"value": "전체 에너지미터 타입", "key": "Meter*"},
                {"value": "전력량계", "key": "Meter_WattHour"},
                {"value": "가스량계", "key": "Meter_Gas"},
                {"value": "수도량계", "key": "Meter_Water"},
            ],
            ddDeviceStatusForDeviceEnergyMeterDataSource : [
                {"value": "전체상태", "key": ""},
                {"value": "정상", "key": "Normal.On"},
                {"value": "에러", "key": "Alarm.Critical"},
                {"value": "경고", "key": "Alarm.Warning"},
            ],
            ddDeviceStatusForDeviceEnergyMeter2DataSource : [
                {"value": "전체상태", "key": ""},
                {"value": "정상", "key": "Normal.On"},
                {"value": "에러", "key": "Alarm.Critical"},
                {"value": "경고", "key": "Alarm.Warning"},
            ],
            deviceEnergyMeterList : [
                {
                    "id": "00:FF:10:00:D99E1A2645_1591392246666",
                    "label": "16",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:01:00:D99E1A2645_1591392246666",
                    "label": "16.1",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "SAC",
                    "connectedDeviceType": "AirConditionerOutdoor",
                    "reading": 45
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:02:00:D99E1A2645_1591392246666",
                    "label": "16.2",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "SAC",
                    "connectedDeviceType": "AirConditionerOutdoor",
                    "reading": 45
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:03:00:D99E1A2645_1591392246666",
                    "label": "16.3",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "SAC",
                    "connectedDeviceType": "AirConditionerOutdoor",
                    "reading": 45
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:04:00:D99E1A2645_1591392246666",
                    "label": "16.4",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "SAC",
                    "connectedDeviceType": "AirConditionerOutdoor",
                    "reading": 45
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:05:00:D99E1A2645_1591392246666",
                    "label": "16.5",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "SAC",
                    "connectedDeviceType": "AirConditionerOutdoor",
                    "reading": 45
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:06:00:D99E1A2645_1591392246666",
                    "label": "16.6",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "SAC",
                    "connectedDeviceType": "AirConditionerOutdoor",
                    "reading": 45
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:07:00:D99E1A2645_1591392246666",
                    "label": "16.7",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "SAC",
                    "connectedDeviceType": "AirConditionerOutdoor",
                    "reading": 45
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:20:00:D99E1A2645_1591392246666",
                    "label": "32",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:01:34:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:02:34:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:03:34:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": 46,
                    "dms_groups_name": "그룹3-2"
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:04:34:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:05:34:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": 7,
                    "dms_groups_name": "test group 04-1"
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:06:34:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:07:34:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                },
                {
                    "id": "00:FF:10:08:34:D99E1A2645_2591392242222",
                    "label": "",
                    "mappedType": "",
                    "description": "",
                    "representativeStatus": "Normal",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Meter",
                    "deviceSubType": "Electronic",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": {
                    "category": "",
                    "connectedDeviceType": "",
                    "reading": 0
                    },
                    "airpurifierUnit": ""
                }
            ],
        }
    },
    methods: {
        setViewType(viewType)
        {
            this.$emit("changeViewType",viewType)
        },
        showLegend()
        {
            this.isLegendView = true;
        },
        hideLegend()
        {
            this.isLegendView = false;
        },
        chkChangeForListView: function(event)
        {
            event.target.checked ? ++ this.checkedTotalCountForListView : -- this.checkedTotalCountForListView;
            this.checkedCountTextForListView = this.checkedTotalCountForListView > 0 ? this.checkedTotalCountForListView + '개의 디바이스가 선택되었습니다.' : '선택된 디바이스가 없습니다.';
        },
        getRepresentativeStatusClass(representativeStatus)
        {
            var representativeStatusClassName = "";
            if("Normal" == representativeStatus)
            {
                representativeStatusClassName = "ic_dot normal_on";
            }else if("Error" == representativeStatus)
            {
                representativeStatusClassName = "ic_dot error";
            }else if("Warn" == representativeStatus)
            {
                representativeStatusClassName = "ic_dot warning";
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

                    this.ddDeviceGroupForDeviceEnergyMeterDataSource = deviceGroupData;
                    this.ddDeviceGroupForDeviceEnergyMeter2DataSource = deviceGroupData;
                    console.log("/dms/groups ddDeviceGroupForDeviceEnergyMeterDataSource=", this.ddDeviceGroupForDeviceEnergyMeterDataSource);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                console.log('/dms/groups error', error);
                // 승인대기 및 라이선스
            });
        },
        getDeviceEnergyMeterList()
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
                "deviceTypes": "Meter",
                "siteId": "D99E1A2645",
                "userId": "webadmin",
                "userRoleType": 101,
            };

            axios.getApi('/dms/devices', params).then(res => {
                // 정상
                if(res.status == 200)
                {
                    this.deviceEnergyMeterList = res.data;
                    console.log("/dms/devices deviceEnergyMeterList11=", this.deviceEnergyMeterList);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                this.deviceEnergyMeterList = [];
                console.log('/dms/devices error', error);
                // 승인대기 및 라이선스
            });
        },
        openDetailForDeviceEnergyMeter(event, selectedRowData)
        {
            console.log('openDetailForDeviceEnergyMeter open event=', event+" this.checkedForListView=",this.checkedForListView+" selectedRowData=",selectedRowData);
            this.selectedDeviceEnergyMeterList = [];

            if(selectedRowData)
            {
                this.selectedDeviceEnergyMeterList.push(selectedRowData);
            }
            else
            {
                var checkedForListViewCount = this.checkedForListView.length;
                for(var i=0;i<checkedForListViewCount;i++)
                {
                    var checkedRowIdx = this.checkedForListView[i];
                    var tempRowData = this.deviceEnergyMeterList[checkedRowIdx];
                    this.selectedDeviceEnergyMeterList.push(tempRowData);
                }
            }

            this.$refs.deviceDetailModal.openModal();
        }
    },
    computed: {
        checkAllForListView: {
            get: function () {
                return this.deviceEnergyMeterList ? this.checkedForListView.length == this.deviceEnergyMeterList.length : false;
            },
            set: function (value) {
                var checkedForListView = [];
                if (value) {
                    this.deviceEnergyMeterList.forEach(function (item, rowIdx) { checkedForListView.push(rowIdx); });
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
        console.log("DeviceEnergyMeterView Tab Call!!");
        this.initSearch();
        this.getDeviceEnergyMeterList();
    },
    mounted()
    {

    },
    destroyed()
    {

    }
}
</script>