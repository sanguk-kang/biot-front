<template>
<div class="layout_wrap_side" tabNo="1">

    <!-- s: view type top-->
    <div class="content_title_wrap">
        <ul class="right_area icon_type">
            <li><button id="btnDeviceTotalListView" class="ic ic-list" :class="{'active': viewTypeForDeviceTotal == 1}" @click="setViewType(1)">목록보기</button></li>
            <li><button id="btnDeviceTotalTilesView" class="ic ic-tile" :class="{'active': viewTypeForDeviceTotal == 2}" @click="setViewType(2)">타일보기</button></li>
            <li>
                <div class="search_input_wrap">
                    <input id="txtSearchInputForDeviceTotal" class="k-input" type="text" placeholder="검색 내용 입력">
                    <span class="ic ic-bt-input-remove"></span>
                    <span class="ic ic-bt-input-search"></span>
                </div>
            </li>
        </ul>
    </div>
    <!-- e: view type top-->

    <!-- s: list view filter-->
    <div class="content_title_wrap no_title" v-if="viewTypeForDeviceTotal == 1">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceTotal :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceTotalDataSource' style="width:180px" @change="changeDdDeviceGroupForDeviceTotal"></ddDeviceGroupForDeviceTotal></li>
            <li><ddDeviceSubGroupForDeviceTotal :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceTotalDataSource' style="width:180px"></ddDeviceSubGroupForDeviceTotal></li>
            <li><ddDeviceTypeForDeviceTotal :isCheckType='true' :selectboxData='ddDeviceTypeForDeviceTotalDataSource' style="width:150px"></ddDeviceTypeForDeviceTotal></li>
            <li><ddDeviceStatusForDeviceTotal :isCheckType='true' :selectboxData='ddDeviceStatusForDeviceTotalDataSource' style="width:150px"></ddDeviceStatusForDeviceTotal></li>
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
                                <th>실내기</th>
                                <td><span class="ic_dot normal_on"></span>정상 (켜짐)</td>
                                <td><span class="ic_dot normal_off"></span>정상 (꺼짐)</td>
                                <td><span class="ic_dot error"></span>에러</td>
                                <td><span class="ic_dot warning"></span>경고</td>
                            </tr>
                            <tr>
                                <th>실외기</th>
                                <td><span class="ic_dot normal_on"></span>정상 (켜짐)</td>
                                <td><span class="ic_dot normal_off"></span>정상 (꺼짐)</td>
                                <td><span class="ic_dot error"></span>에러</td>
                                <td><span class="ic_dot warning"></span>경고</td>
                            </tr>
                            <tr>
                                <th>에너지미터</th>
                                <td><span class="ic_dot normal_on"></span>정상</td>
                                <td><span class="ic_dot error"></span>에러</td>
                                <td><span class="ic_dot warning"></span>경고</td>
                            </tr>
                            <tr>
                                <th>조명</th>
                                <td><span class="ic_dot normal_on"></span>켜짐</td>
                                <td><span class="ic_dot normal_off"></span>꺼짐</td>
                            </tr>
                            <tr>
                                <th>공기청정기</th>
                                <td><span class="ic_dot normal_on"></span>켜짐</td>
                                <td><span class="ic_dot normal_off"></span>꺼짐</td>
                            </tr>
                            <tr>
                                <th>K-weather</th>
                                <td><span class="ic_dot normal_on"></span>정상</td>
                                <td><span class="ic_dot error"></span>에러</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- e:Legend box-->
            </li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceTotalListCount" class="selected_text">{{checkedCountTextForListView}}</span></li>
            <li><button id="btnDetailForDeviceTotal" class="k-button" :disabled="deviceTotalList.length == 0 || checkedTotalCountForListView == 0" @click="openDetailForDeviceTotal($event, null)">상세정보</button></li>
        </ul>
    </div>
    <!-- e: list view filter-->

    <!-- s: grid view filter-->
    <div class="content_title_wrap no_title" v-if="viewTypeForDeviceTotal == 2">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceTotal2 :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceTotal2DataSource' style="width:180px"></ddDeviceGroupForDeviceTotal2></li>
            <li><ddDeviceSubGroupForDeviceTotal2 :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceTotal2DataSource' style="width:180px"></ddDeviceSubGroupForDeviceTotal2></li>
            <li><ddDeviceTypeForDeviceTotal2 :isCheckType='true' :selectboxData='ddDeviceTypeForDeviceTotal2DataSource' style="width:150px"></ddDeviceTypeForDeviceTotal2></li>
            <li><ddDeviceStatusForDeviceTotal2 :isCheckType='true' :selectboxData='ddDeviceStatusForDeviceTotal2DataSource' style="width:150px"></ddDeviceStatusForDeviceTotal2></li>
            <li><button id="btnDeviceTotalTilesListAll" class="k-button input_w9">전체 선택</button></li>
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
                                <th>실내기</th>
                                <td><span class="ic_dot normal_on"></span>정상 (켜짐)</td>
                                <td><span class="ic_dot normal_off"></span>정상 (꺼짐)</td>
                                <td><span class="ic_dot error"></span>에러</td>
                                <td><span class="ic_dot warning"></span>경고</td>
                            </tr>
                            <tr>
                                <th>실외기</th>
                                <td><span class="ic_dot normal_on"></span>정상 (켜짐)</td>
                                <td><span class="ic_dot normal_off"></span>정상 (꺼짐)</td>
                                <td><span class="ic_dot error"></span>에러</td>
                                <td><span class="ic_dot warning"></span>경고</td>
                            </tr>
                            <tr>
                                <th>에너지미터</th>
                                <td><span class="ic_dot normal_on"></span>정상</td>
                                <td><span class="ic_dot error"></span>에러</td>
                                <td><span class="ic_dot warning"></span>경고</td>
                            </tr>
                            <tr>
                                <th>조명</th>
                                <td><span class="ic_dot normal_on"></span>켜짐</td>
                                <td><span class="ic_dot normal_off"></span>꺼짐</td>
                            </tr>
                            <tr>
                                <th>공기청정기</th>
                                <td><span class="ic_dot normal_on"></span>켜짐</td>
                                <td><span class="ic_dot normal_off"></span>꺼짐</td>
                            </tr>
                            <tr>
                                <th>K-weather</th>
                                <td><span class="ic_dot normal_on"></span>정상</td>
                                <td><span class="ic_dot error"></span>에러</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- e:Legend box-->
            </li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceTotalListCount2" class="selected_text">{{selectedCountTextForGridView}}</span></li>
            <li><button id="btnDetailForDeviceTotal2" class="k-button" disabled="disabled">상세정보</button></li>
        </ul>
    </div>
    <!-- e: grid view filter-->

    <!-- s:site lsit wrap -->
    <div class="site-list-wrap">
        <!-- s: 컨텐츠 -->
        <section class="content_view" v-if="viewTypeForDeviceTotal == 1">
            <!-- s: 기본 list-->
            <div id="deviceTotalGrid" class="g-table">
                <table>
                    <colgroup>
                        <col style="width:10%">
                        <col style="width:15%">
                        <col style="width:20%">
                        <col style="width:10%">
                        <col><!-- schedule 25% -->
                        <col style="width:10%">
                        <col style="width:10%">
                    </colgroup>
                    <thead>
                    <tr>
                        <th><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAllForListView"><label class="k-checkbox-label single" for="ched_all"></label></span></th>
                        <th>디바이스 타입<i class="ic_sort"></i></th>
                        <th>디바이스 이름<i class="ic_sort"></i></th>
                        <th>상태<i class="ic_sort"></i></th>
                        <th>그룹 이름<i class="ic_sort"></i></th>
                        <th>스케줄<i class="ic_sort"></i></th>
                        <th>상세정보</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="deviceTotalList.length == 0">
                        <td colspan="8" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지 않습니다.</td>
                    </tr>
                    <tr v-for="(rowData, rowIdx) in deviceTotalList" :key="rowData.id">
                        <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" :id="rowData.id" :value="rowIdx" @click="chkChangeForListView($event)" v-model="checkedForListView"><label class="k-checkbox-label single" :for="rowData.id"></label></span></td>
                        <td>{{rowData.deviceType}}</td>
                        <td class="tal"><p class="ellipsis">{{rowData.label}}</p><p class="ellipsis">{{rowData.id}}</p></td>
                        <td>
                            <span :class="getRepresentativeStatusClass(rowData.representativeStatus)"></span>
                        </td>
                        <td class="tal"><p class="ellipsis">{{getGroupName(rowData.group)}}</p></td>
                        <td class="tal"><p class="ellipsis">{{getScheduleStr(rowData.schedules)}}</p></td>
                        <td>
                            <div class="openDetailForDeviceTotal" style="cursor:'pointer'" @click="openDetailForDeviceTotal($event, rowData)"><span class='ic ic-info'></span></div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- e: 기본 list-->
        </section>
        <!-- e: 컨텐츠 -->
        <!-- s: 컨텐츠 -->
        <section class="content_view" v-if="viewTypeForDeviceTotal == 2">
            <p class="content_title">Group Nam1</p>
            <!-- s: Grid list-->
            <div class="gridview_list">
                <ul>
                    <li>
                        <div class="card-item k-state-selected">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info">
                                <div class="left">
                                    <span class="type Normal-On">자동</span>
                                    <span class="device-img Auto Normal-On"></span>
                                </div>
                                <div class="right">
                                    <span class="Normal-On set" data-content="°C"><em>Set</em>99.0</span>
                                    <span class="Normal-Off current" data-content="°C"><em>Current</em>-</span>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line">
                                <div class="icon ic-rock"></div>
                                <div class="icon ic-thurmo"></div>
                                <div class="icon ic-schedule"></div>
                                <div class="icon ic-spi"></div>
                                <div class="icon ic-antifreeze"></div>
                            </div>
                            <div class="card-info">
                                <div class="left">
                                    <span class="type Alarm-Warning">자동</span>
                                    <span class="device-img Auto Normal-On"></span>
                                </div>
                                <div class="right">
                                    <span class="Normal-On set" data-content="°C"><em>Set</em>99.0</span>
                                    <span class="Normal-Off current" data-content="°C"><em>Current</em>-</span>
                                </div>
                            </div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" ></i></div>
                        </div>
                    </li>
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
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">Cool</span><span class="device-img Cool Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">Heat</span><span class="device-img Heat Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">Dry</span><span class="device-img Dry Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">Fan</span><span class="device-img Fan Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">CoolSt</span><span class="device-img CoolSt Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-On">Hot water</span><span class="device-img HeatSt Normal-On"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">자동</span><span class="device-img Auto Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">자동</span><span class="device-img Auto Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">자동</span><span class="device-img Auto Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">자동</span><span class="device-img Auto Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                        </div>
                    </li>
                    <li>
                        <div class="card-item">
                            <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                            <div class="card-info"><div class="left"><span class="type Normal-Off">자동</span><span class="device-img Auto Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                            <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
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
                    <li class="open"><!--open-->
                        <div class="arr_right">실내기</div>
                        <div class="inner_box" style="height: 340px;"><!-- d: 컨텐츠 높이값 가변-->
                            <div><button class="colorbox k-button selected" ><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>
                            <p class="inner_tit">실내기 운전모드</p>
                            <ul class="button_wrap five">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode0" type="radio" name="rgIndoorMode" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" ><label class="icon ic-less-g" for="indoorMode0"></label></div>
                                        </div>
                                        <p>무풍</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode1" type="radio" name="rgIndoorMode" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-cool-g" for="indoorMode1"></label></div>
                                        </div>
                                        <p>냉방</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode2" type="radio" name="rgIndoorMode" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-heat-g" for="indoorMode2"></label></div>
                                        </div>
                                        <p>난방</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode3" type="radio" name="rgIndoorMode" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-dry-g" for="indoorMode3"></label></div>
                                        </div>
                                        <p>제습</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode4" type="radio" name="rgIndoorMode" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-g" for="indoorMode4"></label></div>
                                        </div>
                                        <p>송풍</p>
                                    </div>
                                </li>
                            </ul>
                            <ul class="button_wrap two">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode5" type="radio" name="rgIndoorMode" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" ><label class="icon ic-coolwater-g" for="indoorMode5"></label></div>
                                        </div>
                                        <p>축냉</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode6" type="radio" name="rgIndoorMode2" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-hotwater-g" for="indoorMode6"></label></div>
                                        </div>
                                        <p>축열</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="inner_tit">온도</p>
                            <ul class="pinnerlist">
                                <li><input id="numericBox" maxLength="5" /></li>
                                <li><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="설정" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" style="display: inline-block;" aria-valuemin="18" aria-valuemax="30" aria-valuenow="24"><input id="inpTemperature0" title="설정" data-bind="invisible:inpTemperature0" data-role="customnumericbox" role="spinbutton" style="display: none;" class="k-input block-key-event" type="text" aria-disabled="false" aria-valuemin="18" min="18" aria-valuemax="30" max="30" aria-valuenow="24"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-name">설정</span><span class="control-numeric-unit">℃</span></span></li>
                            </ul>
                            <p class="inner_tit">풍량</p>
                            <ul class="button_wrap four">
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
                            </ul>
                            <p class="inner_tit">기류제어</p>
                            <ul class="button_wrap two">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="WindDirection0" type="radio" name="rgIndoorWindDirection0" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-wind-vertical-g" for="WindDirection0"></label></div>
                                        </div>
                                        <p>상하</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="WindDirection1" type="radio" name="rgIndoorWindDirection0" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-wind-fix-g" for="WindDirection1"></label></div>
                                        </div>
                                        <p>고정</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="inner_tit">운전모드 제한</p>
                            <ul class="button_wrap three">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="OperationLimit0" type="radio" name="rgIndoorOperationLimit" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-cool-g" for="OperationLimit0"></label></div>
                                        </div>
                                        <p>냉방전용</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="OperationLimit1" type="radio" name="rgIndoorOperationLimit" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-heat-g" for="OperationLimit1"></label></div>
                                        </div>
                                        <p>난방전용</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="OperationLimit2" type="radio" name="rgIndoorOperationLimit" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-nolimit-g" for="OperationLimit2"></label></div>
                                        </div>
                                        <p>제한없음</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="inner_tit">실내온도 제한</p>
                            <ul class="pinnerlist">
                                <li>
                                    <div class="tb" data-bind="invisible:btnTempLimit1" style=""><button id="btnTempLimit1" class="bound btncontrol k-button selected" data-role="customcontrolbutton" role="button" aria-disabled="false" tabindex="0">난방 상한</button><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="30.0" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" aria-valuemin="16" aria-valuemax="30" aria-valuenow="30" style="display: inline-block;"><input id="inpTempLimit1" data-role="customnumericbox" role="spinbutton" class="k-input block-key-event" type="text" aria-disabled="false" style="display: none;" aria-valuemin="16" min="16" aria-valuemax="30" max="30" aria-valuenow="30"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase k-state-disabled" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-unit">℃</span></span></div>
                                </li>
                                <li>
                                    <div class="tb" data-bind="invisible:btnTempLimit1" style=""><button id="btnTempLimit1" class="bound btncontrol k-button selected" data-role="customcontrolbutton" role="button" aria-disabled="false" tabindex="0">난방 상한</button><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="30.0" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" aria-valuemin="16" aria-valuemax="30" aria-valuenow="30" style="display: inline-block;"><input id="inpTempLimit1" data-role="customnumericbox" role="spinbutton" class="k-input block-key-event" type="text" aria-disabled="false" style="display: none;" aria-valuemin="16" min="16" aria-valuemax="30" max="30" aria-valuenow="30"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase k-state-disabled" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-unit">℃</span></span></div>
                                </li>
                            </ul>
                            <p class="inner_tit">토출온도 제어</p>
                            <div><button class="colorbox k-button " ><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>
                        </div>
                    </li>
                    <li class=""><!--open-->
                        <div class="arr_right">환기</div>
                        <div class="inner_box" style="height: 340px;"><!-- d: 컨텐츠 높이값 가변-->
                            <div><button class="colorbox k-button selected" ><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>
                            <p class="inner_tit">Ventilator mode</p>
                            <ul class="button_wrap four">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="heatauto0" type="radio" name="heatauto" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-heatauto-g" for="heatauto0"></label></div>
                                        </div>
                                        <p>자동</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="heatauto1" type="radio" name="heatauto" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-heatex-g" for="heatauto1"></label></div>
                                        </div>
                                        <p>전열</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="heatauto2" type="radio" name="heatauto" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-heatbyp-g" for="heatauto2"></label></div>
                                        </div>
                                        <p>보통</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="heatauto3" type="radio" name="heatauto" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-heatsleep-g" for="heatauto3"></label></div>
                                        </div>
                                        <p>정음</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="inner_tit">Ventilator fan speed</p>
                            <ul class="button_wrap four">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode20" type="radio" name="rgIndoorFanSpeed2" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-auto-g" for="indoorMode20"></label></div>
                                        </div>
                                        <p>Auto</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode21" type="radio" name="rgIndoorFanSpeed2" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-less-g" for="indoorMode21"></label></div>
                                        </div>
                                        <p>무풍</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode22" type="radio" name="rgIndoorFanSpeed2" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-mid-g" for="indoorMode22"></label></div>
                                        </div>
                                        <p>Mid</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="indoorMode23" type="radio" name="rgIndoorFanSpeed2" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-fan-high-g" for="indoorMode23"></label></div>
                                        </div>
                                        <p>High</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li class=""><!--open-->
                        <div class="arr_right">급탕</div>
                        <div class="inner_box" style="height: 340px;"><!-- d: 컨텐츠 높이값 가변-->
                            <div><button class="colorbox k-button selected" ><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>
                            <p class="inner_tit">온도</p>
                            <ul class="pinnerlist">
                                <li><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="설정" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" style="display: inline-block;" aria-valuemin="18" aria-valuemax="30" aria-valuenow="24"><input id="inpTemperature0" title="설정" data-bind="invisible:inpTemperature0" data-role="customnumericbox" role="spinbutton" style="display: none;" class="k-input block-key-event" type="text" aria-disabled="false" aria-valuemin="18" min="18" aria-valuemax="30" max="30" aria-valuenow="24"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-name">설정</span><span class="control-numeric-unit">℃</span></span></li>
                            </ul>
                            <p class="inner_tit">DHW mode</p>
                            <ul class="button_wrap four">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="dhweco0" type="radio" name="dhweco" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-dhweco-g" for="dhweco0"></label></div>
                                        </div>
                                        <p>절약</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="dhweco1" type="radio" name="dhweco" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-dhwstand-g" for="dhweco1"></label></div>
                                        </div>
                                        <p>표준</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="dhweco2" type="radio" name="dhweco" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-dhwpower-g" for="dhweco2"></label></div>
                                        </div>
                                        <p>파워</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="dhweco3" type="radio" name="dhweco" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-dhwforce-g" for="dhweco3"></label></div>
                                        </div>
                                        <p>강제</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="inner_tit">DHW upper temp. limit</p>
                            <ul class="pinnerlist">
                                <li>
                                    <div class="tb" data-bind="invisible:btnTempLimit1" style=""><button id="btnTempLimit1" class="bound btncontrol k-button selected" data-role="customcontrolbutton" role="button" aria-disabled="false" tabindex="0">ON/OFF</button><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="30.0" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" aria-valuemin="16" aria-valuemax="30" aria-valuenow="30" style="display: inline-block;"><input id="inpTempLimit1" data-role="customnumericbox" role="spinbutton" class="k-input block-key-event" type="text" aria-disabled="false" style="display: none;" aria-valuemin="16" min="16" aria-valuemax="30" max="30" aria-valuenow="30"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase k-state-disabled" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-unit">℃</span></span></div>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li class=""><!--open-->
                        <div class="arr_right">옵션</div>
                        <div class="inner_box" style="height: 300px;">
                            <p class="inner_tit">Remote control</p>
                            <ul class="button_wrap btn_two">
                                <li><button class="colorbox k-button selected" >Permit</button></li>
                                <li><button class="colorbox k-button " >Prohibition</button></li>
                            </ul>
                            <p class="inner_tit">Filter reset</p>
                            <div><button class="colorbox k-button selected" ><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>
                            <p class="inner_tit">SPI setting</p>
                            <div><button class="colorbox k-button selected" ><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>
                        </div>
                    </li>
                </ul>
            </div>
            <!--e:디바이스-->
        </section>
        <!-- e: Site List Area -->
    </div>
    <!-- e:site lsit wrap -->

    <DeviceDetailModal ref="deviceDetailModal"  v-bind:deviceDetailList="selectedDeviceTotalList"></DeviceDetailModal>
</div>
</template>

<script>
import axios from '@/api/axios.js';
import strUtils from "@/utils/stringUtils.js";

import ddDeviceGroupForDeviceTotal from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceTotal from "@/components/custom/VueDropdown.vue";
import ddDeviceTypeForDeviceTotal from "@/components/custom/VueDropdown.vue";
import ddDeviceStatusForDeviceTotal from "@/components/custom/VueDropdown.vue";

import ddDeviceGroupForDeviceTotal2 from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceTotal2 from "@/components/custom/VueDropdown.vue";
import ddDeviceTypeForDeviceTotal2 from "@/components/custom/VueDropdown.vue";
import ddDeviceStatusForDeviceTotal2 from "@/components/custom/VueDropdown.vue";

import DeviceDetailModal from "@/components/device/popup/DeviceDetailModal.vue";

export default {
    name : "DeviceTotalView",
    components : {
        ddDeviceGroupForDeviceTotal, ddDeviceSubGroupForDeviceTotal, ddDeviceTypeForDeviceTotal, ddDeviceStatusForDeviceTotal,
        ddDeviceGroupForDeviceTotal2, ddDeviceSubGroupForDeviceTotal2, ddDeviceTypeForDeviceTotal2, ddDeviceStatusForDeviceTotal2,
        DeviceDetailModal
    },
    props : ["viewTypeForDeviceTotal"],
    data : function()
    {
        return {
            checkedTotalCountForListView: 0,
            checkedForListView: [],
            checkedCountTextForListView: '선택된 디바이스가 없습니다.',
            selectedCountTextForGridView: 0,

            selectedDeviceTotalList: [],

            isLegendView : false,
            ddDeviceGroupForDeviceTotalDataSource: [],
            ddDeviceGroupForDeviceTotal2DataSource: [],
            ddDeviceSubGroupForDeviceTotalDataSource: [],
            ddDeviceSubGroupForDeviceTotal2DataSource: [],
            ddDeviceTypeForDeviceTotalDataSource: [
                {
                    value: '전체 디바이스 타입',
                    key: '',
                    checked: false
                },
                {
                    value: 'Cassette/Duct',
                    key: 'AirConditioner_Indoor',
                    checked: false
                },
                {
                    value: 'AHU',
                    key: 'AirConditioner_AHU',
                    checked: false
                },
                {
                    value: 'DVM Chiller',
                    key: 'AirConditioner_Chiller',
                    checked: false
                },
                {
                    value: 'EHS',
                    key: 'AirConditioner_EHS',
                    checked: false
                },
                {
                    value: 'ERV',
                    key: 'AirConditioner_ERV',
                    checked: false
                },
                {
                    value: 'ERV Plus',
                    key: 'AirConditioner_ERVPlus',
                    checked: false
                },
                {
                    value: 'FCU',
                    key: 'AirConditioner_FCU',
                    checked: false
                },
                {
                    value: 'Fresh Duct',
                    key: 'AirConditioner_DuctFresh',
                    checked: false
                },
            ],
            ddDeviceTypeForDeviceTotal2DataSource: [
                {
                    value: '전체 디바이스 타입',
                    key: '',
                    checked: false
                },
                {
                    value: 'Cassette/Duct',
                    key: 'AirConditioner_Indoor',
                    checked: false
                },
                {
                    value: 'AHU',
                    key: 'AirConditioner_AHU',
                    checked: false
                },
                {
                    value: 'DVM Chiller',
                    key: 'AirConditioner_Chiller',
                    checked: false
                },
                {
                    value: 'EHS',
                    key: 'AirConditioner_EHS',
                    checked: false
                },
                {
                    value: 'ERV',
                    key: 'AirConditioner_ERV',
                    checked: false
                },
                {
                    value: 'ERV Plus',
                    key: 'AirConditioner_ERVPlus',
                    checked: false
                },
                {
                    value: 'FCU',
                    key: 'AirConditioner_FCU',
                    checked: false
                },
                {
                    value: 'Fresh Duct',
                    key: 'AirConditioner_DuctFresh',
                    checked: false
                },
            ],
            ddDeviceStatusForDeviceTotalDataSource: [
                {
                    value: '전체상태',
                    key: '',
                    checked: false
                },
                {
                    value: '정상 (켜짐)',
                    key: 'Normal.On',
                    checked: false
                },
                {
                    value: '정상 (켜짐)',
                    key: 'Normal.Off',
                    checked: false
                },
                {
                    value: '에러',
                    key: 'Alarm.Critical',
                    checked: false
                },
                {
                    value: '경고',
                    key: 'Alarm.Warning',
                    checked: false
                },
            ],
            ddDeviceStatusForDeviceTotal2DataSource: [
                {
                    value: '전체상태',
                    key: '',
                    checked: false
                },
                {
                    value: '정상 (켜짐)',
                    key: 'Normal.On',
                    checked: false
                },
                {
                    value: '정상 (켜짐)',
                    key: 'Normal.Off',
                    checked: false
                },
                {
                    value: '에러',
                    key: 'Alarm.Critical',
                    checked: false
                },
                {
                    value: '경고',
                    key: 'Alarm.Warning',
                    checked: false
                },
            ],

            deviceTotalList : [
                {
                    "id": "00:FF:0E:00:05:01:D99E1A2645_2591392241111",
                    "label": "test name1111",
                    "mappedType": "",
                    "description": "test des",
                    "representativeStatus": "Normal",
                    "schedules": [
                        {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                        }
                    ],
                    "alarms": [],
                    "configuration": "",
                    "modes": [
                        {
                        "property": "AirConditioner_Indoor_IndoorMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "HeatStorage",
                            "Fan",
                            "Heat",
                            "CoolStorage",
                            "Cool",
                            "Dry"
                        ],
                        "mode": "Auto"
                        },
                        {
                        "property": "AirConditioner_Indoor_ErvMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "Sleep",
                            "HeatExchange",
                            "Normal"
                        ],
                        "mode": "None"
                        },
                        {
                        "property": "AirConditioner_Indoor_DhwMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Eco",
                            "Force",
                            "Standard",
                            "Power"
                        ],
                        "mode": "Eco"
                        },
                        {
                        "property": "AirConditioner_Indoor_OperationLimit",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "HeatOnly",
                            "CoolOnly",
                            "NoLimit"
                        ],
                        "mode": "None"
                        }
                    ],
                    "operations": [
                        {
                        "id": "AirConditioner_Indoor_IndoorPower",
                        "power": "on"
                        },
                        {
                        "id": "AirConditioner_Indoor_DhwPower",
                        "power": "off"
                        },
                        {
                        "id": "AirConditioner_Indoor_ErvPower",
                        "power": "on"
                        }
                    ],
                    "temperatures": [
                        {
                        "id": "AirConditioner.Indoor.Room",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 20,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW",
                        "enabled": "",
                        "unit": "",
                        "current": 40,
                        "desired": 45,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW.Limit",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 50,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir",
                        "enabled": false,
                        "unit": "",
                        "current": "",
                        "desired": "",
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir.Cool",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 0,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        }
                    ],
                    "winds": [
                        {
                        "id": "AirConditioner_Indoor_IndoorFanSpeed",
                        "supportedWinds": "",
                        "wind": "None"
                        },
                        {
                        "id": "AirConditioner_Indoor_IndoorWindDirection",
                        "supportedWinds": "",
                        "wind": "None"
                        }
                    ],
                    "deviceType": "18G001",
                    "deviceSubType": "19G003",
                    "deviceRegistrationStatus": true,
                    "group": {
                        "dms_groups_id": 3,
                        "dms_groups_name": "test group 02-1"
                    },
                    "peakInterfaceModuleConnected": "",
                    "installationInformation": "",
                    "panelConfigurationInformation": "",
                    "indoorUnitType": "",
                    "defrost": "",
                    "filterResetRequired": "",
                    "peakPowerControl": "off",
                    "spi": "off",
                    "stillAir": "off",
                    "temperatureReference": "Celsius",
                    "chiller": ""
                },
                {
                    "id": "00:FF:0E:00:05:01:D99E1A2645_2591392242222",
                    "label": "test name2222",
                    "mappedType": "",
                    "description": "test des",
                    "representativeStatus": "Normal",
                    "schedules": [
                        {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                        }
                    ],
                    "alarms": [],
                    "configuration": "",
                    "modes": [
                        {
                        "property": "AirConditioner_Indoor_IndoorMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "HeatStorage",
                            "Fan",
                            "Heat",
                            "CoolStorage",
                            "Cool",
                            "Dry"
                        ],
                        "mode": "Auto"
                        },
                        {
                        "property": "AirConditioner_Indoor_ErvMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "Sleep",
                            "HeatExchange",
                            "Normal"
                        ],
                        "mode": "None"
                        },
                        {
                        "property": "AirConditioner_Indoor_DhwMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Eco",
                            "Force",
                            "Standard",
                            "Power"
                        ],
                        "mode": "Eco"
                        },
                        {
                        "property": "AirConditioner_Indoor_OperationLimit",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "HeatOnly",
                            "CoolOnly",
                            "NoLimit"
                        ],
                        "mode": "None"
                        }
                    ],
                    "operations": [
                        {
                        "id": "AirConditioner_Indoor_IndoorPower",
                        "power": "on"
                        },
                        {
                        "id": "AirConditioner_Indoor_DhwPower",
                        "power": "off"
                        },
                        {
                        "id": "AirConditioner_Indoor_ErvPower",
                        "power": "on"
                        }
                    ],
                    "temperatures": [
                        {
                        "id": "AirConditioner.Indoor.Room",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 20,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW",
                        "enabled": "",
                        "unit": "",
                        "current": 40,
                        "desired": 45,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW.Limit",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 50,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir",
                        "enabled": false,
                        "unit": "",
                        "current": "",
                        "desired": "",
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir.Cool",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 0,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        }
                    ],
                    "winds": [
                        {
                        "id": "AirConditioner_Indoor_IndoorFanSpeed",
                        "supportedWinds": "",
                        "wind": "None"
                        },
                        {
                        "id": "AirConditioner_Indoor_IndoorWindDirection",
                        "supportedWinds": "",
                        "wind": "None"
                        }
                    ],
                    "deviceType": "18G001",
                    "deviceSubType": "19G003",
                    "deviceRegistrationStatus": true,
                    "group": {
                        "dms_groups_id": 3,
                        "dms_groups_name": "test group 02-1"
                    },
                    "peakInterfaceModuleConnected": "",
                    "installationInformation": "",
                    "panelConfigurationInformation": "",
                    "indoorUnitType": "",
                    "defrost": "",
                    "filterResetRequired": "",
                    "peakPowerControl": "off",
                    "spi": "off",
                    "stillAir": "off",
                    "temperatureReference": "Celsius",
                    "chiller": ""
                },
                {
                    "id": "00:FF:0E:00:05:01:D99E1A2645_2591392243333",
                    "label": "test name3333",
                    "mappedType": "",
                    "description": "test des",
                    "representativeStatus": "Normal",
                    "schedules": [
                        {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                        }
                    ],
                    "alarms": [],
                    "configuration": "",
                    "modes": [
                        {
                        "property": "AirConditioner_Indoor_IndoorMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "HeatStorage",
                            "Fan",
                            "Heat",
                            "CoolStorage",
                            "Cool",
                            "Dry"
                        ],
                        "mode": "Auto"
                        },
                        {
                        "property": "AirConditioner_Indoor_ErvMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "Sleep",
                            "HeatExchange",
                            "Normal"
                        ],
                        "mode": "None"
                        },
                        {
                        "property": "AirConditioner_Indoor_DhwMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Eco",
                            "Force",
                            "Standard",
                            "Power"
                        ],
                        "mode": "Eco"
                        },
                        {
                        "property": "AirConditioner_Indoor_OperationLimit",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "HeatOnly",
                            "CoolOnly",
                            "NoLimit"
                        ],
                        "mode": "None"
                        }
                    ],
                    "operations": [
                        {
                        "id": "AirConditioner_Indoor_IndoorPower",
                        "power": "on"
                        },
                        {
                        "id": "AirConditioner_Indoor_DhwPower",
                        "power": "off"
                        },
                        {
                        "id": "AirConditioner_Indoor_ErvPower",
                        "power": "on"
                        }
                    ],
                    "temperatures": [
                        {
                        "id": "AirConditioner.Indoor.Room",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 20,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW",
                        "enabled": "",
                        "unit": "",
                        "current": 40,
                        "desired": 45,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW.Limit",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 50,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir",
                        "enabled": false,
                        "unit": "",
                        "current": "",
                        "desired": "",
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir.Cool",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 0,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        }
                    ],
                    "winds": [
                        {
                        "id": "AirConditioner_Indoor_IndoorFanSpeed",
                        "supportedWinds": "",
                        "wind": "None"
                        },
                        {
                        "id": "AirConditioner_Indoor_IndoorWindDirection",
                        "supportedWinds": "",
                        "wind": "None"
                        }
                    ],
                    "deviceType": "18G001",
                    "deviceSubType": "19G003",
                    "deviceRegistrationStatus": true,
                    "group": {
                        "dms_groups_id": 3,
                        "dms_groups_name": "test group 02-1"
                    },
                    "peakInterfaceModuleConnected": "",
                    "installationInformation": "",
                    "panelConfigurationInformation": "",
                    "indoorUnitType": "",
                    "defrost": "",
                    "filterResetRequired": "",
                    "peakPowerControl": "off",
                    "spi": "off",
                    "stillAir": "off",
                    "temperatureReference": "Celsius",
                    "chiller": ""
                },
                {
                    "id": "00:FF:0E:00:05:01:D99E1A2645_2591392244444",
                    "label": "test name4444",
                    "mappedType": "",
                    "description": "test des",
                    "representativeStatus": "Normal",
                    "schedules": [
                        {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                        }
                    ],
                    "alarms": [],
                    "configuration": "",
                    "modes": [
                        {
                        "property": "AirConditioner_Indoor_IndoorMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "HeatStorage",
                            "Fan",
                            "Heat",
                            "CoolStorage",
                            "Cool",
                            "Dry"
                        ],
                        "mode": "Auto"
                        },
                        {
                        "property": "AirConditioner_Indoor_ErvMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "Sleep",
                            "HeatExchange",
                            "Normal"
                        ],
                        "mode": "None"
                        },
                        {
                        "property": "AirConditioner_Indoor_DhwMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Eco",
                            "Force",
                            "Standard",
                            "Power"
                        ],
                        "mode": "Eco"
                        },
                        {
                        "property": "AirConditioner_Indoor_OperationLimit",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "HeatOnly",
                            "CoolOnly",
                            "NoLimit"
                        ],
                        "mode": "None"
                        }
                    ],
                    "operations": [
                        {
                        "id": "AirConditioner_Indoor_IndoorPower",
                        "power": "on"
                        },
                        {
                        "id": "AirConditioner_Indoor_DhwPower",
                        "power": "off"
                        },
                        {
                        "id": "AirConditioner_Indoor_ErvPower",
                        "power": "on"
                        }
                    ],
                    "temperatures": [
                        {
                        "id": "AirConditioner.Indoor.Room",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 20,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW",
                        "enabled": "",
                        "unit": "",
                        "current": 40,
                        "desired": 45,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW.Limit",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 50,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir",
                        "enabled": false,
                        "unit": "",
                        "current": "",
                        "desired": "",
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir.Cool",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 0,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        }
                    ],
                    "winds": [
                        {
                        "id": "AirConditioner_Indoor_IndoorFanSpeed",
                        "supportedWinds": "",
                        "wind": "None"
                        },
                        {
                        "id": "AirConditioner_Indoor_IndoorWindDirection",
                        "supportedWinds": "",
                        "wind": "None"
                        }
                    ],
                    "deviceType": "18G001",
                    "deviceSubType": "19G003",
                    "deviceRegistrationStatus": true,
                    "group": {
                        "dms_groups_id": 3,
                        "dms_groups_name": "test group 02-1"
                    },
                    "peakInterfaceModuleConnected": "",
                    "installationInformation": "",
                    "panelConfigurationInformation": "",
                    "indoorUnitType": "",
                    "defrost": "",
                    "filterResetRequired": "",
                    "peakPowerControl": "off",
                    "spi": "off",
                    "stillAir": "off",
                    "temperatureReference": "Celsius",
                    "chiller": ""
                },
                {
                    "id": "00:FF:0E:00:05:01:D99E1A2645_2591392245555",
                    "label": "test name5555",
                    "mappedType": "",
                    "description": "test des",
                    "representativeStatus": "Normal",
                    "schedules": [
                        {
                        "schedules_id": "",
                        "schedules_name": "",
                        "schedules_activated": ""
                        }
                    ],
                    "alarms": [],
                    "configuration": "",
                    "modes": [
                        {
                        "property": "AirConditioner_Indoor_IndoorMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "HeatStorage",
                            "Fan",
                            "Heat",
                            "CoolStorage",
                            "Cool",
                            "Dry"
                        ],
                        "mode": "Auto"
                        },
                        {
                        "property": "AirConditioner_Indoor_ErvMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Auto",
                            "Sleep",
                            "HeatExchange",
                            "Normal"
                        ],
                        "mode": "None"
                        },
                        {
                        "property": "AirConditioner_Indoor_DhwMode",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "Eco",
                            "Force",
                            "Standard",
                            "Power"
                        ],
                        "mode": "Eco"
                        },
                        {
                        "property": "AirConditioner_Indoor_OperationLimit",
                        "description": "",
                        "enabled": "",
                        "supportedModes": [
                            "HeatOnly",
                            "CoolOnly",
                            "NoLimit"
                        ],
                        "mode": "None"
                        }
                    ],
                    "operations": [
                        {
                        "id": "AirConditioner_Indoor_IndoorPower",
                        "power": "on"
                        },
                        {
                        "id": "AirConditioner_Indoor_DhwPower",
                        "power": "off"
                        },
                        {
                        "id": "AirConditioner_Indoor_ErvPower",
                        "power": "on"
                        }
                    ],
                    "temperatures": [
                        {
                        "id": "AirConditioner.Indoor.Room",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 20,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW",
                        "enabled": "",
                        "unit": "",
                        "current": 40,
                        "desired": 45,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DHW.Limit",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 50,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir",
                        "enabled": false,
                        "unit": "",
                        "current": "",
                        "desired": "",
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        },
                        {
                        "id": "AirConditioner.Indoor.DischargeAir.Cool",
                        "enabled": "",
                        "unit": "",
                        "current": "",
                        "desired": 0,
                        "increment": "",
                        "minimum": "",
                        "maximum": ""
                        }
                    ],
                    "winds": [
                        {
                        "id": "AirConditioner_Indoor_IndoorFanSpeed",
                        "supportedWinds": "",
                        "wind": "None"
                        },
                        {
                        "id": "AirConditioner_Indoor_IndoorWindDirection",
                        "supportedWinds": "",
                        "wind": "None"
                        }
                    ],
                    "deviceType": "18G001",
                    "deviceSubType": "19G003",
                    "deviceRegistrationStatus": true,
                    "group": {
                        "dms_groups_id": 3,
                        "dms_groups_name": "test group 02-1"
                    },
                    "peakInterfaceModuleConnected": "",
                    "installationInformation": "",
                    "panelConfigurationInformation": "",
                    "indoorUnitType": "",
                    "defrost": "",
                    "filterResetRequired": "",
                    "peakPowerControl": "off",
                    "spi": "off",
                    "stillAir": "off",
                    "temperatureReference": "Celsius",
                    "chiller": ""
                },
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
        changeDdDeviceGroupForDeviceTotal(seletedItems)
        {
            console.log("changeDdDeviceGroupForDeviceTotal seletedItems=",seletedItems);

            this.ddDeviceSubGroupForDeviceTotalDataSource = [];
            if(seletedItems && seletedItems.length > 0)
            {
                var selectedItemsCount = seletedItems.length;
                for(var i=0;i<selectedItemsCount;i++)
                {
                    //선택한 디바이스 그룹에 소속된 디바이스 서브 그룹들 존재하면 서브 그룹 콤보에 설정
                    var subGroupList = seletedItems[i].subGroupResources;
                    var subGroupListCount = subGroupList.length;

                    for(var j=0;j<subGroupListCount;j++)
                    {
                        this.ddDeviceSubGroupForDeviceTotalDataSource.push(
                        {
                            "key": subGroupList[j].id,
                            "value": subGroupList[j].name,
                            "checked": false,
                        });
                    }
                }
            }
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
                schedulesStr = schedules[0].schedules_activated;
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
                    var deviceSubGroupData = [];
                    var resultList = res.data;
                    resultList.forEach(function(rowData)
                    {
                        var subGroupResourcesObj = rowData.subGroupResources;
                        deviceGroupData.push({
                            "key": rowData.id,
                            "value": rowData.name,
                            "checked": false,
                            "subGroupResources" : subGroupResourcesObj
                        });

                        if(subGroupResourcesObj && subGroupResourcesObj.length > 0)
                        {
                            var subGroupResourcesObjCount = subGroupResourcesObj.length;
                            for(var i=0;i<subGroupResourcesObjCount;i++)
                            {
                                deviceSubGroupData.push({
                                    "key": subGroupResourcesObj[i].id,
                                    "value": subGroupResourcesObj[i].name,
                                    "checked": false,
                                });
                            }
                        }
                    });

                    this.ddDeviceGroupForDeviceTotalDataSource = deviceGroupData;
                    this.ddDeviceGroupForDeviceTotal2DataSource = deviceGroupData;
                    this.ddDeviceSubGroupForDeviceTotalDataSource = deviceSubGroupData;
                    this.ddDeviceSubGroupForDeviceTotal2DataSource = deviceSubGroupData;
                    console.log("/dms/groups ddDeviceGroupForDeviceTotalDataSource=", this.ddDeviceGroupForDeviceTotalDataSource);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                console.log('/dms/groups error', error);
                // 승인대기 및 라이선스
            });
        },

        
        getDeviceTotalList()
        {
            //디바이스 그룹 콤보 설정
            // var apiHeader = {
            //     headers: {
            //         'accept': 'application/vnd.samsung.biot.v1+json;charset=UTF-8',
            //     }
            // }

            var params =
            {
                "deviceRegisterStatus": true,
                "deviceTypes" : "AirConditioner&deviceTypes=AirConditionerOutdoor&deviceTypes=Meter&deviceTypes=Airpurifier",
                "siteId": "D99E1A2645",
                "userId": "webadmin",
                "userRoleType": 101,
            };

            axios.getApi('/dms/devices', params).then(res => {
                // 정상
                if(res.status == 200)
                {
                    this.deviceTotalList = res.data;
                    console.log("/dms/devices deviceTotalList=", this.deviceTotalList);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                console.log('/dms/devices error', error);
                // 승인대기 및 라이선스
            });
        },
        openDetailForDeviceTotal(event, selectedRowData)
        {
            console.log('openDetailForDeviceTotal open event=', event+" this.checkedForListView=",this.checkedForListView+" selectedRowData=",selectedRowData);
            this.selectedDeviceTotalList = [];
            console.log('000>>>', selectedRowData);
            if (!strUtils.isEmpty(selectedRowData)) {
                console.log('1111>>>>>>>>>>>>>>', selectedRowData);
                this.selectedDeviceTotalList.push(selectedRowData);
            }
            else
            {
                var checkedForListViewCount = this.checkedForListView.length;
                for(var i=0;i<checkedForListViewCount;i++)
                {
                    var checkedRowIdx = this.checkedForListView[i];
                    var tempRowData = this.deviceTotalList[checkedRowIdx];
                    this.selectedDeviceTotalList.push(tempRowData);
                }
            }

            this.$refs.deviceDetailModal.openModal();
        }
    },

    computed: {
        checkAllForListView: {
            get: function () {
                return this.deviceTotalList ? this.checkedForListView.length == this.deviceTotalList.length : false;
            },
            set: function (value) {
                var checkedForListView = [];
                if (value) {
                    this.deviceTotalList.forEach(function (item, rowIdx) { checkedForListView.push(rowIdx); });
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
        //
        console.log("DeviceTotalView Tab Call!!");

        this.initSearch();
        this.getDeviceTotalList();
    },
    mounted()
    {
    },
    destroyed()
    {

    }
}
</script>