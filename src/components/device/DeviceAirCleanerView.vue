<template>
<div class="layout_wrap_side" tabNo="9">
    <!-- s: view type top-->
    <div class="content_title_wrap">
        <ul class="right_area icon_type">
            <li><button id="btnDeviceAirCleanerListView" class="ic ic-list" :class="{'active': viewTypeForDeviceAirCleaner == 1}" @click="setViewType(1)">목록보기</button></li>
            <li><button id="btnDeviceAirCleanerTilesView" class="ic ic-tile" :class="{'active': viewTypeForDeviceAirCleaner == 2}" @click="setViewType(2)">타일보기</button></li>
            <li>
                <div class="search_input_wrap">
                    <input id="txtSearchInputForDeviceAirCleaner" class="k-input" type="text" placeholder="검색 내용 입력">
                    <span class="ic ic-bt-input-remove"></span>
                    <span class="ic ic-bt-input-search"></span>
                </div>
            </li>
        </ul>
    </div>
    <!-- e: view type top-->

    <!-- s: list view filter-->
    <div class="content_title_wrap no_title" v-if="viewTypeForDeviceAirCleaner == 1">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceAirCleaner :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceAirCleanerDataSource' style="width:180px"></ddDeviceGroupForDeviceAirCleaner></li>
            <li><ddDeviceSubGroupForDeviceAirCleaner :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceAirCleanerDataSource' style="width:180px"></ddDeviceSubGroupForDeviceAirCleaner></li>
            <li><ddDeviceStatusForDeviceAirCleaner :isCheckType='true' :selectboxData='ddDeviceStatusForDeviceAirCleanerDataSource' style="width:150px"></ddDeviceStatusForDeviceAirCleaner></li>
            <li><span class="ic-bar"></span></li>
            <li><a href="#" class="btn_legend" @mouseenter="showLegend()" @mouseleave="hideLegend()">범례</a>
                <!-- s:Legend box-->
                <div class="toolbox" :class="{'hide':!isLegendView}" style="left:-205px;top:40px;"><!-- d: 위치값 가변, hide 삭제시 보여짐-->
                    <div class="l_table">
                        <table>
                            <colgroup>
                                <col style="width: 110px;">
                                <col style="width: 150px;">
                                <col style="width: 150px;">
                                <col style="width: 150px;">
                                <col >
                            </colgroup>
                            <tbody>
                            <tr>
                                <th>상태</th>
                                <td><span class="ic_dot airQ_normal_bg"></span> 켜짐</td>
                                <td><span class="ic_dot airQ_none_bg"></span> 꺼짐</td>
                                <td></td>
                                <td></td>

                            </tr>
                            <tr>
                                <th>공기질</th>
                                <td><span class="ic_dot airQ_normal_bg"></span> 좋음</td>
                                <td><span class="ic_dot airQ_comfort_bg"></span> 보통</td>
                                <td><span class="ic_dot airQ_poor_bg"></span> 나쁨</td>
                                <td><span class="ic_dot airQ_verypoor_bg"></span> 매우나쁨</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- e:Legend box-->
            </li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceAirCleanerListCount" class="selected_text">{{checkedCountTextForListView}}</span></li>
            <li><button id="btnDetailForDeviceAirCleaner" class="k-button" :disabled="deviceAirCleanerList.length == 0 || checkedTotalCountForListView == 0" @click="openDetailForDeviceAirCleaner($event, null)">상세정보</button></li>
        </ul>
    </div>
    <!-- e: list view filter-->

    <!-- s: grid view filter-->
    <div class="content_title_wrap no_title" v-if="viewTypeForDeviceAirCleaner == 2">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceAirCleaner2 :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceAirCleaner2DataSource' style="width:180px"></ddDeviceGroupForDeviceAirCleaner2></li>
            <li><ddDeviceSubGroupForDeviceAirCleaner2 :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceAirCleaner2DataSource' style="width:180px"></ddDeviceSubGroupForDeviceAirCleaner2></li>
            <li><ddDeviceStatusForDeviceAirCleaner2 :isCheckType='true' :selectboxData='ddDeviceStatusForDeviceAirCleaner2DataSource' style="width:150px"></ddDeviceStatusForDeviceAirCleaner2></li>
            <li><button id="btnDeviceAirCleanerTilesListAll" class="k-button input_w9">전체 선택</button></li>
            <li><span class="ic-bar"></span></li>
            <li><a href="#" class="btn_legend" @mouseenter="showLegend()" @mouseleave="hideLegend()">범례</a>
                <!-- s:Legend box-->
                <div class="toolbox" :class="{'hide':!isLegendView}" style="left:-205px;top:40px;"><!-- d: 위치값 가변, hide 삭제시 보여짐-->
                    <div class="l_table">
                        <table>
                            <colgroup>
                                <col style="width: 110px;">
                                <col style="width: 150px;">
                                <col style="width: 150px;">
                                <col style="width: 150px;">
                                <col >
                            </colgroup>
                            <tbody>
                            <tr>
                                <th>상태</th>
                                <td><span class="ic_dot airQ_normal_bg"></span> 켜짐</td>
                                <td><span class="ic_dot airQ_none_bg"></span> 꺼짐</td>
                                <td></td>
                                <td></td>

                            </tr>
                            <tr>
                                <th>공기질</th>
                                <td><span class="ic_dot airQ_normal_bg"></span> 좋음</td>
                                <td><span class="ic_dot airQ_comfort_bg"></span> 보통</td>
                                <td><span class="ic_dot airQ_poor_bg"></span> 나쁨</td>
                                <td><span class="ic_dot airQ_verypoor_bg"></span> 매우나쁨</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- e:Legend box-->
            </li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceAirCleanerListCount2" class="selected_text">{{selectedCountTextForGridView}}</span></li>
            <li><button id="btnDetailForDeviceAirCleaner2" class="k-button" disabled="disabled">상세정보</button></li>
        </ul>
    </div>
    <!-- e: grid view filter-->

    <!-- s:site lsit wrap -->
    <div class="site-list-wrap">
        <!-- s: 컨텐츠 -->
        <section class="content_view" v-if="viewTypeForDeviceAirCleaner == 1">
            <!-- s: 기본 list-->
            <div id="deviceAirCleanerGrid" class="g-table">
                <table>
                    <colgroup>
                        <col style="width:3%">
                        <col style="width:12%">
                        <col style="width:8%">
                        <col style="width:8%">
                        <col style="width:8%">
                        <col style="width:8%">
                        <col style="width:8%">
                        <col style="width:8%">
                        <col style="width:8%">
                        <col><!-- width:19% -->
                        <col style="width:6%">
                        <col style="width:5%">
                    </colgroup>
                    <thead>
                    <tr>
                        <th><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAllForListView"><label class="k-checkbox-label single" for="ched_all"></label></span></th>
                        <th>디바이스 이름<i class="ic_sort"></i></th>
                        <th>상태<i class="ic_sort"></i></th>
                        <th>공기질<i class="ic_sort"></i></th>
                        <th>PM10<i class="ic_sort"></i></th>
                        <th>PM2.5<i class="ic_sort"></i></th>
                        <th>PM1.0<i class="ic_sort"></i></th>
                        <th>가스<i class="ic_sort"></i></th>
                        <th>필터<i class="ic_sort"></i></th>
                        <th>그룹 이름<i class="ic_sort"></i></th>
                        <th>스케쥴<i class="ic_sort"></i></th>
                        <th>상세정보</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="deviceAirCleanerList.length == 0">
                        <td colspan="12" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지 않습니다.</td>
                    </tr>
                    <tr v-for="(rowData, rowIdx) in deviceAirCleanerList" :key="rowData.id">
                        <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" :id="rowData.id" :value="rowIdx" @click="chkChangeForListView($event)" v-model="checkedForListView"><label class="k-checkbox-label single" :for="rowData.id"></label></span></td>
                        <td class="tal"><p class="ellipsis">{{rowData.label}}</p><p class="ellipsis">{{rowData.id}}</p></td>
                        <td>
                            <span :class="getRepresentativeStatusClass(rowData.representativeStatus)"></span>
                        </td>
                        <td>
                            <span :class="getAirQualityStatusClassName(rowData.airpurifierUnit.airQuality)"></span>
                        </td>
                        <td>{{rowData.airpurifierUnit.pm10_0}}</td>
                        <td>{{rowData.airpurifierUnit.pm2_5}}</td>
                        <td>{{rowData.airpurifierUnit.pm1_0}}</td>
                        <td>{{rowData.airpurifierUnit.purity}}</td>
                        <td>{{rowData.airpurifierUnit.dustLevel}}</td>
                        <td class="tal"><p class="ellipsis">{{getGroupName(rowData.group)}}</p></td>
                        <td class="tal"><p class="ellipsis">{{getScheduleStr(rowData.schedules)}}</p></td>
                        <td>
                            <div class="openDetailForDeviceAirCleaner" style="cursor:'pointer'" @click="openDetailForDeviceAirCleaner($event, rowData)"><span class='ic ic-info'></span></div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- e: 기본 list-->
        </section>
        <!-- e: 컨텐츠 -->

        <!-- s: 컨텐츠 -->
        <section class="content_view" v-if="viewTypeForDeviceAirCleaner == 2">
            <p class="content_title">Group Nam1</p>
            <!-- s: Grid list-->
            <div class="gridview_list">
                <ul>
                    <li>
                        <div class="card-item  k-state-selected">
                            <div class="icon-line"><div class="icon ic-filter-0"></div></div>
                            <div class="card-info">
                                <div class="left">
                                    <span class="type Normal-Off">Auto</span>
                                    <span class="device-img Auto Normal-Off"></span>
                                </div>
                                <div class="right">
                                    <div class="air_group both">
                                        <span class="title airQ_none">Quality</span>
                                        <span class="state airQ_none">Normal</span>
                                    </div>

                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img noicon">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item  ">
                            <div class="icon-line"><div class="icon ic-filter-1"></div></div>
                            <div class="card-info">
                                <div class="left">
                                    <span class="type Normal-On">Auto</span>
                                    <span class="device-img Auto Normal-On"></span>
                                </div>
                                <div class="right">
                                    <div class="air_group both">
                                        <span class="title">Quality</span>
                                        <span class="state st_normal">Normal</span>
                                    </div>

                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img noicon">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item  ">
                            <div class="icon-line"><div class="icon ic-filter-2"></div></div>
                            <div class="card-info">
                                <div class="left">
                                    <span class="type Normal-On">Auto</span>
                                    <span class="device-img Auto Normal-On"></span>
                                </div>
                                <div class="right">
                                    <div class="air_group both">
                                        <span class="title">Quality</span>
                                        <span class="state st_normal">Normal</span>
                                    </div>

                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img noicon">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item  ">
                            <div class="icon-line"><div class="icon ic-filter-3"></div></div>
                            <div class="card-info">
                                <div class="left">
                                    <span class="type Normal-On">Auto</span>
                                    <span class="device-img Auto Normal-On"></span>
                                </div>
                                <div class="right">
                                    <div class="air_group both">
                                        <span class="title">Quality</span>
                                        <span class="state st_normal">Normal</span>
                                    </div>

                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img noicon">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item  ">
                            <div class="icon-line"><div class="icon ic-filter-4"></div></div>
                            <div class="card-info">
                                <div class="left">
                                    <span class="type Normal-On">Auto</span>
                                    <span class="device-img Auto Normal-On"></span>
                                </div>
                                <div class="right">
                                    <div class="air_group both">
                                        <span class="title">Quality</span>
                                        <span class="state st_normal">Normal</span>
                                    </div>

                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img noicon">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item  critical">
                            <div class="card-info">
                                <div class="left"><span class="device-img error Alarm-Critical"></span></div>
                                <div class="right"><span class="Alarm-Critical" >Critical<br/> Code 4578787l</span></div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img noicon">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item  warning">
                            <div class="card-info">
                                <div class="left"><span class="device-img error Alarm-Warning"></span></div>
                                <div class="right"><span class="Alarm-Warning" >Warning<br/> Code 4578787</span></div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img noicon">11.00.03</span><i class="ic ic-info" ></i></div>
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
            <ul class="title_area tabmenu">
                <li class="active">리모콘</li>
                <li>사이트</li>
            </ul>
            <!-- e: 상단 영역-->
            <!-- s:디바이스 -->
            <div class="p_device">
                <ul class="control_panel">
                    <li class="open">
                        <div class="arr_right">공기청정기</div>
                        <div class="inner_box" style="height: 490px;"><!-- d: 높이값 가변-->
                            <div><button class="colorbox k-button selected" ><span class="icwrap"><i class="icon power"></i>ON</span></button></div>
                            <p class="inner_tit">풍량</p>
                            <ul class="button_wrap five">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode0" type="radio" name="rgIndoorFanSpeed" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-auto-g" for="indoorMode0"></label></div>
                                        </div>
                                        <p>Auto</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode1" type="radio" name="rgIndoorFanSpeed" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-low-g" for="indoorMode1"></label></div>
                                        </div>
                                        <p>Low</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode2" type="radio" name="rgIndoorFanSpeed" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-mid-g" for="indoorMode2"></label></div>
                                        </div>
                                        <p>Mid</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode3" type="radio" name="rgIndoorFanSpeed" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-high-g" for="indoorMode3"></label></div>
                                        </div>
                                        <p>High</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode4" type="radio" name="rgIndoorFanSpeed" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-turbo-g" for="indoorMode4"></label></div>
                                        </div>
                                        <p>High</p>
                                    </div>
                                </li>
                            </ul>

                            <p class="inner_tit">취침 운전</p>
                            <div><button class="colorbox k-button selected" ><span class="icwrap"><i class="icon power"></i>ON</span></button></div>
                        </div>
                    </li>

                </ul>
            </div>
            <!--e:디바이스-->
        </section>
        <!-- e: Site List Area -->

        <!-- Detail Popup -->
        <DeviceDetailModal ref="deviceDetailModal"  v-bind:deviceDetailList="selectedDeviceAirCleanerList"></DeviceDetailModal>
    </div>
</div>
</template>

<script>
import axios from '@/api/axios.js';
import strUtils from "@/utils/stringUtils.js";

import ddDeviceGroupForDeviceAirCleaner from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceAirCleaner from "@/components/custom/VueDropdown.vue";
import ddDeviceStatusForDeviceAirCleaner from "@/components/custom/VueDropdown.vue";

import ddDeviceGroupForDeviceAirCleaner2 from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceAirCleaner2 from "@/components/custom/VueDropdown.vue";
import ddDeviceStatusForDeviceAirCleaner2 from "@/components/custom/VueDropdown.vue";

import DeviceDetailModal from "@/components/device/popup/DeviceDetailModal.vue";

export default {
    name : "DeviceAirCleanerView",
    components : {
        ddDeviceGroupForDeviceAirCleaner, ddDeviceSubGroupForDeviceAirCleaner,ddDeviceStatusForDeviceAirCleaner,
        ddDeviceGroupForDeviceAirCleaner2, ddDeviceSubGroupForDeviceAirCleaner2, ddDeviceStatusForDeviceAirCleaner2,
        DeviceDetailModal
    },
    props : ["viewTypeForDeviceAirCleaner"],
    data : function()
    {
        return {
            checkedTotalCountForListView: 0,
            checkedForListView: [],
            checkedCountTextForListView: '선택된 디바이스가 없습니다.',
            selectedCountTextForGridView: 0,

            selectedDeviceAirCleanerList: [],

            isLegendView : false,
            tilesAllSelected : true,
            ddDeviceGroupForDeviceAirCleanerDataSource: [],
            ddDeviceGroupForDeviceAirCleaner2DataSource: [],
            ddDeviceSubGroupForDeviceAirCleanerDataSource: [],
            ddDeviceSubGroupForDeviceAirCleaner2DataSource: [],
            ddDeviceStatusForDeviceAirCleanerDataSource : [
                {"value": "전체상태", "key": ""},
                {"value": "켜짐", "key": "Normal.On"},
                {"value": "꺼짐", "key": "Normal.Off"},
            ],
            ddDeviceStatusForDeviceAirCleaner2DataSource : [
                {"value": "전체상태", "key": ""},
                {"value": "켜짐", "key": "Normal.On"},
                {"value": "꺼짐", "key": "Normal.Off"},
            ],
            deviceAirCleanerList : [
                {
                    "id": "69d7d3b7-a71a-f76e-29da-3c7b28cd8f32",
                    "label": "",
                    "mappedType": "",
                    "description": "휴게실공청기",
                    "representativeStatus": "",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Airpurifier",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": "",
                    "airpurifierUnit": {
                    "locationId": "d967fd4e-f1f5-4577-87a0-6bc8edd2fe86",
                    "roomId": "4a26940c-0758-4ef3-aed3-b6fa3883b193",
                    "deviceTypeId": "91ff5406-8146-4509-9a6a-ffc45dd43883",
                    "deviceTypeName": "Samsung OCF Air Purifier",
                    "deviceNetworkType": "UNKNOWN",
                    "dustLevel": 5,
                    "fineDustLevel": 5,
                    "veryFineDustLevel": 5,
                    "airQuality": "",
                    "purity": "",
                    "pm10_0": "",
                    "pm2_5": "",
                    "pm1_0": ""
                    }
                },
                {
                    "id": "9a80c618-4568-9162-946c-249ec9250640",
                    "label": "",
                    "mappedType": "",
                    "description": "베스핀공청기",
                    "representativeStatus": "",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Airpurifier",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": "",
                    "airpurifierUnit": {
                    "locationId": "d967fd4e-f1f5-4577-87a0-6bc8edd2fe86",
                    "roomId": "4a26940c-0758-4ef3-aed3-b6fa3883b193",
                    "deviceTypeId": "91ff5406-8146-4509-9a6a-ffc45dd43883",
                    "deviceTypeName": "Samsung OCF Air Purifier",
                    "deviceNetworkType": "UNKNOWN",
                    "dustLevel": 30,
                    "fineDustLevel": 13,
                    "veryFineDustLevel": 11,
                    "airQuality": "",
                    "purity": "",
                    "pm10_0": "",
                    "pm2_5": "",
                    "pm1_0": ""
                    }
                },
                {
                    "id": "f61f3a35-9a22-6715-5d26-6f30fff12ce7",
                    "label": "",
                    "mappedType": "",
                    "description": "Suwon_4F_공청기",
                    "representativeStatus": "",
                    "schedules": "",
                    "alarms": "",
                    "configuration": "",
                    "modes": "",
                    "operations": "",
                    "temperatures": "",
                    "winds": "",
                    "deviceType": "Airpurifier",
                    "deviceSubType": "",
                    "deviceRegistrationStatus": true,
                    "group": {
                    "dms_groups_id": "",
                    "dms_groups_name": ""
                    },
                    "airConditionerIndoorUnit": "",
                    "airConditionerOutdoorUnit": "",
                    "meterUnit": "",
                    "airpurifierUnit": {
                    "locationId": "d967fd4e-f1f5-4577-87a0-6bc8edd2fe86",
                    "roomId": "4a26940c-0758-4ef3-aed3-b6fa3883b193",
                    "deviceTypeId": "91ff5406-8146-4509-9a6a-ffc45dd43883",
                    "deviceTypeName": "Samsung OCF Air Purifier",
                    "deviceNetworkType": "UNKNOWN",
                    "dustLevel": 7,
                    "fineDustLevel": 7,
                    "veryFineDustLevel": 5,
                    "airQuality": "",
                    "purity": "",
                    "pm10_0": "",
                    "pm2_5": "",
                    "pm1_0": ""
                    }
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
        getScheduleStr(schedules)
        {
            var schedulesStr;

            //스케쥴
            if(schedules.length > 0 && !strUtils.isEmpty(schedules[0].schedules_activated))
            {
                schedulesStr = schedules[0].schedules_activated ? "O" : "";
            }else
            {
                schedulesStr = "X";
            }

            return schedulesStr;
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

                    this.ddDeviceGroupForDeviceAirCleanerDataSource = deviceGroupData;
                    this.ddDeviceGroupForDeviceAirCleaner2DataSource = deviceGroupData;
                    console.log("/dms/groups ddDeviceGroupForDeviceAirCleanerDataSource=", this.ddDeviceGroupForDeviceAirCleanerDataSource);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                console.log('/dms/groups error', error);
                // 승인대기 및 라이선스
            });
        },
        getDeviceAirCleanerList()
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
                "deviceTypes": "Airpurifier",
                "siteId": "D99E1A2645",
                "userId": "webadmin",
                "userRoleType": 101,
            };

            axios.getApi('/dms/devices', params).then(res => {
                // 정상
                if(res.status == 200)
                {
                    this.deviceAirCleanerList = res.data;
                    console.log("/dms/devices deviceAirCleanerList=", this.deviceAirCleanerList);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                this.deviceAirCleanerList = [];
                console.log('/dms/devices error', error);
                // 승인대기 및 라이선스
            });
        },
        openDetailForDeviceAirCleaner(event, selectedRowData)
        {
            console.log('openDetailForDeviceAirCleaner open event=', event+" this.checkedForListView=",this.checkedForListView+" selectedRowData=",selectedRowData);
            this.selectedDeviceAirCleanerList = [];

            if(selectedRowData)
            {
                this.selectedDeviceAirCleanerList.push(selectedRowData);
            }
            else
            {
                var checkedForListViewCount = this.checkedForListView.length;
                for(var i=0;i<checkedForListViewCount;i++)
                {
                    var checkedRowIdx = this.checkedForListView[i];
                    var tempRowData = this.deviceAirCleanerList[checkedRowIdx];
                    this.selectedDeviceAirCleanerList.push(tempRowData);
                }
            }

            this.$refs.deviceDetailModal.openModal();
        },
    },
    computed: {
        checkAllForListView: {
            get: function () {
                return this.deviceAirCleanerList ? this.checkedForListView.length == this.deviceAirCleanerList.length : false;
            },
            set: function (value) {
                var checkedForListView = [];
                if (value) {
                    this.deviceAirCleanerList.forEach(function (item, rowIdx) { checkedForListView.push(rowIdx); });
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
        console.log("DeviceAirCleanerView Tab Call!!");
        this.initSearch();
        this.getDeviceAirCleanerList();
    },
    mounted()
    {

    },
    destroyed()
    {

    }
}
</script>