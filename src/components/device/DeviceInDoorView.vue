<template>
<div class="layout_wrap_side" tabNo="2">
    <!-- s: viwe type top-->
    <div class="content_title_wrap">
        <ul class="right_area icon_type">
            <li><button id="btnDeviceInDoorListView" class="ic ic-list" :class="{'active': viewTypeForDeviceInDoor == 1}" @click="setViewType(1)">목록보기</button></li>
            <li><button id="btnDeviceInDoorTilesView" class="ic ic-tile" :class="{'active': viewTypeForDeviceInDoor == 2}" @click="setViewType(2)">타일보기</button></li>
            <li>
                <div class="search_input_wrap">
                    <input id="txtSearchInputForDeviceInDoor" class="k-input" type="text" placeholder="검색 내용 입력">
                    <span class="ic ic-bt-input-remove"></span>
                    <span class="ic ic-bt-input-search"></span>
                </div>
            </li>
        </ul>
    </div>
    <!-- e: viwe type top-->

    <!-- s: list view filter-->
    <div class="content_title_wrap no_title" v-if="viewTypeForDeviceInDoor == 1">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceInDoor :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceInDoorDataSource' style="width:180px"></ddDeviceGroupForDeviceInDoor></li>
            <li><ddDeviceSubGroupForDeviceInDoor :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceInDoorDataSource' style="width:180px"></ddDeviceSubGroupForDeviceInDoor></li>
            <li><ddDeviceTypeForDeviceInDoor :isCheckType='true' :selectboxData='ddDeviceTypeForDeviceInDoorDataSource' style="width:150px"></ddDeviceTypeForDeviceInDoor></li>
            <li><ddDeviceStatusForDeviceInDoor :isCheckType='true' :selectboxData='ddDeviceStatusForDeviceInDoorDataSource' style="width:150px"></ddDeviceStatusForDeviceInDoor></li>
            <li><ddDeviceModeForDeviceInDoor :isCheckType='true' :selectboxData='ddDeviceModeForDeviceInDoorDataSource' style="width:150px"></ddDeviceModeForDeviceInDoor></li>
            <li><span class="ic-bar"></span></li>
            <li><a href="#" class="btn_legend" @mouseenter="showLegend()" @mouseleave="hideLegend()">범례</a>
                <!-- s:Legend box-->
                <div class="toolbox" :class="{'hide':!isLegendView}" style="left:-105px;top:40px;"><!-- d: 위치값 가변, hide 삭제시 보여짐 hide-->
                    <ul class="legend_list">
                        <li><span class="ic_dot normal_on"></span>정상(켜짐)</li>
                        <li><span class="ic_dot normal_off"></span>정상(꺼짐)</li>
                        <li><span class="ic_dot error"></span>에러</li>
                        <li><span class="ic_dot warning"></span>경고</li>
                    </ul>
                </div>
                <!-- e:Legend box-->
            </li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceInDoorListCount" class="selected_text">{{checkedCountTextForListView}}</span></li>
            <li><button id="btnDetailForDeviceInDoor" class="k-button" :disabled="deviceInDoorList.length == 0 || checkedTotalCountForListView == 0" @click="openDetailForDeviceInDoor($event, null)">상세정보</button></li>
        </ul>
    </div>
    <!-- e: list view filter-->

    <!-- s: grid view filter-->
    <div class="content_title_wrap no_title" v-if="viewTypeForDeviceInDoor == 2">
        <ul class="flex_left">
            <li><ddDeviceGroupForDeviceInDoor2 :isCheckType='true' :selectboxData='ddDeviceGroupForDeviceInDoor2DataSource' style="width:180px"></ddDeviceGroupForDeviceInDoor2></li>
            <li><ddDeviceSubGroupForDeviceInDoor2 :isCheckType='true' :selectboxData='ddDeviceSubGroupForDeviceInDoor2DataSource' style="width:180px"></ddDeviceSubGroupForDeviceInDoor2></li>
            <li><ddDeviceTypeForDeviceInDoor2 :isCheckType='true' :selectboxData='ddDeviceTypeForDeviceInDoor2DataSource' style="width:150px"></ddDeviceTypeForDeviceInDoor2></li>
            <li><ddDeviceStatusForDeviceInDoor2 :isCheckType='true' :selectboxData='ddDeviceStatusForDeviceInDoor2DataSource' style="width:150px"></ddDeviceStatusForDeviceInDoor2></li>
            <li><ddDeviceModeForDeviceInDoor2 :isCheckType='true' :selectboxData='ddDeviceModeForDeviceInDoor2DataSource' style="width:150px"></ddDeviceModeForDeviceInDoor2></li>
            <li><button id="btnDeviceInDoorTilesListAll" class="k-button input_w9">전체 선택</button></li>
            <li><span class="ic-bar"></span></li>
            <li><a href="#" class="btn_legend" @mouseenter="showLegend()" @mouseleave="hideLegend()">Legend</a>
                <!-- s:Legend box-->
                <div class="toolbox" :class="{'hide':!isLegendView}" style="left:-105px;top:40px;"><!-- d: 위치값 가변, hide 삭제시 보여짐 hide-->
                    <ul class="legend_list">
                        <li><span class="ic_dot normal_on"></span>Normal (ON)</li>
                        <li><span class="ic_dot normal_off"></span>Normal (OFF)</li>
                        <li><span class="ic_dot error"></span>Critical</li>
                        <li><span class="ic_dot warning"></span>Warning</li>
                    </ul>
                    <ul class="legend_list">
                        <li><span class="ic ic-peak"></span>Peak</li>
                        <li><span class="ic ic-deforest"></span>Defrost</li>
                        <li><span class="ic ic-filter"></span>Filter Warning</li>
                        <li><span class="ic ic-rc-disable"></span>Disable RC</li>
                    </ul>
                    <ul class="legend_list">
                        <li><span class="ic ic-rock"></span>Operation limit</li>
                        <li><span class="ic ic-thurmo"></span>Temp. limit</li>
                        <li><span class="ic ic-schedule"></span>Schedule</li>
                        <li><span class="ic ic-spi"></span>SPI</li>
                    </ul>
                    <ul class="legend_list">
                        <li><span class="ic ic-antifreeze"></span>Freeze Protection</li>
                    </ul>
                </div>
                <!-- e:Legend box-->
            </li>
        </ul>
        <ul class="right_area">
            <li><span id="lblSelectedDeviceInDoorListCount2" class="selected_text">{{selectedCountTextForGridView}}</span></li>
            <li><button id="btnDetailForDeviceInDoor2" class="k-button" disabled="disabled">상세정보</button></li>
        </ul>
    </div>
    <!-- e: grid view filter-->

    <!-- s:site list wrap -->
    <div class="site-list-wrap">
        <!-- s: 컨텐츠 -->
        <section class="content_view" v-if="viewTypeForDeviceInDoor == 1">
            <!-- s: 기본 list-->
            <div id="deviceInDoorGrid" class="g-table">
                <table>
                    <colgroup>
                        <col style="width:5%">
                        <col style="width:22%">
                        <col style="width:10%">
                        <col style="width:10%">
                        <col style="width:15%">
                        <col><!-- schedule 25% -->
                        <col style="width:5%">
                        <col style="width:5%">
                    </colgroup>
                    <thead>
                    <tr>
                        <th><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAllForListView"><label class="k-checkbox-label single" for="ched_all"></label></span></th>
                        <th>디바이스 이름<i class="ic_sort"></i></th>
                        <th>상태<i class="ic_sort"></i></th>
                        <th>모드<i class="ic_sort"></i></th>
                        <th>온도(설정/현재)<i class="ic_sort"></i></th>
                        <th>그룹 이름<i class="ic_sort"></i></th>
                        <th>스케줄<i class="ic_sort"></i></th>
                        <th>상세정보</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="deviceInDoorList.length == 0">
                        <td colspan="7" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지 않습니다.</td>
                    </tr>
                    <tr v-for="(rowData, rowIdx) in deviceInDoorList" :key="rowData.id">
                        <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" :id="rowData.id" :value="rowIdx" @click="chkChangeForListView($event)" v-model="checkedForListView"><label class="k-checkbox-label single" :for="rowData.id"></label></span></td>
                        <td class="tal"><p class="ellipsis">{{rowData.label}}</p><p class="ellipsis">{{rowData.id}}</p></td>
                        <td>
                            <span :class="getRepresentativeStatusClass(rowData.representativeStatus)"></span>
                        </td>
                        <td>{{getDeviceModeText(rowData.modes)}}</td>
                        <td>{{getTemperaturesText(rowData.temperatures)}}</td>
                        <td><p class="ellipsis">{{getGroupName(rowData.group)}}</p></td>
                        <td class="tal"><p class="ellipsis">{{getScheduleStr(rowData.schedules)}}</p></td>
                        <td>
                            <div class="openDetailForDeviceInDoor" style="cursor:'pointer'" @click="openDetailForDeviceInDoor($event, rowData)"><span class='ic ic-info'></span></div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- e: 기본 list-->
        </section>
        <!-- e: 컨텐츠 -->

        <!-- s: 컨텐츠 -->
        <section class="content_view" v-if="viewTypeForDeviceInDoor == 2">
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
                            <p class="inner_tit">Indoor Unit Mode</p>
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
                            <p class="inner_tit">Temperature</p>
                            <ul class="pinnerlist">
                                <li><input id="numericBox" maxLength="5" /></li>
                                <li><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="설정" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" style="display: inline-block;" aria-valuemin="18" aria-valuemax="30" aria-valuenow="24"><input id="inpTemperature0" title="설정" data-bind="invisible:inpTemperature0" data-role="customnumericbox" role="spinbutton" style="display: none;" class="k-input block-key-event" type="text" aria-disabled="false" aria-valuemin="18" min="18" aria-valuemax="30" max="30" aria-valuenow="24"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-name">설정</span><span class="control-numeric-unit">℃</span></span></li>
                                <li><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="설정" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" style="display: inline-block;" aria-valuemin="18" aria-valuemax="30" aria-valuenow="24"><input id="inpTemperature0" title="설정" data-bind="invisible:inpTemperature0" data-role="customnumericbox" role="spinbutton" style="display: none;" class="k-input block-key-event" type="text" aria-disabled="false" aria-valuemin="18" min="18" aria-valuemax="30" max="30" aria-valuenow="24"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-name">설정</span><span class="control-numeric-unit">℃</span></span></li>
                            </ul>
                            <p class="inner_tit">Fan Speed</p>
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
                            <p class="inner_tit">Wind Direction</p>
                            <ul class="button_wrap four">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="WindDirection0" type="radio" name="rgIndoorWindDirection0" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-wind-vertical-g" for="WindDirection0"></label></div>
                                        </div>
                                        <p>Vertical</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="WindDirection1" type="radio" name="rgIndoorWindDirection0" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-wind-fix-g" for="WindDirection1"></label></div>
                                        </div>
                                        <p>Horizontal</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="WindDirection0" type="radio" name="rgIndoorWindDirection0" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-wind-mid-g" for="WindDirection0"></label></div>
                                        </div>
                                        <p>Mid</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="WindDirection1" type="radio" name="rgIndoorWindDirection0" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-wind-swing-g" for="WindDirection1"></label></div>
                                        </div>
                                        <p>Swing</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="inner_tit">Mode Limit</p>
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
                            <p class="inner_tit">Indoor Temperature Limit</p>
                            <ul class="pinnerlist">
                                <li>
                                    <div class="tb" data-bind="invisible:btnTempLimit1" style=""><button id="btnTempLimit1" class="bound btncontrol k-button selected" data-role="customcontrolbutton" role="button" aria-disabled="false" tabindex="0">난방 상한</button><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="30.0" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" aria-valuemin="16" aria-valuemax="30" aria-valuenow="30" style="display: inline-block;"><input id="inpTempLimit1" data-role="customnumericbox" role="spinbutton" class="k-input block-key-event" type="text" aria-disabled="false" style="display: none;" aria-valuemin="16" min="16" aria-valuemax="30" max="30" aria-valuenow="30"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase k-state-disabled" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-unit">℃</span></span></div>
                                </li>
                                <li>
                                    <div class="tb" data-bind="invisible:btnTempLimit1" style=""><button id="btnTempLimit1" class="bound btncontrol k-button selected" data-role="customcontrolbutton" role="button" aria-disabled="false" tabindex="0">난방 상한</button><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="30.0" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" aria-valuemin="16" aria-valuemax="30" aria-valuenow="30" style="display: inline-block;"><input id="inpTempLimit1" data-role="customnumericbox" role="spinbutton" class="k-input block-key-event" type="text" aria-disabled="false" style="display: none;" aria-valuemin="16" min="16" aria-valuemax="30" max="30" aria-valuenow="30"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase k-state-disabled" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-unit">℃</span></span></div>
                                </li>
                            </ul>
                            <p class="inner_tit">Discharge Temp Control</p>
                            <div><button class="colorbox k-button " ><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>
                            <p class="inner_tit">Water out temp. limit</p>
                            <ul class="pinnerlist">
                                <li>
                                    <div class="tb" data-bind="invisible:btnTempLimit1" style=""><button id="btnTempLimit1" class="bound btncontrol k-button selected" data-role="customcontrolbutton" role="button" aria-disabled="false" tabindex="0">ON/OFF</button><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="30.0" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" aria-valuemin="16" aria-valuemax="30" aria-valuenow="30" style="display: inline-block;"><input id="inpTempLimit1" data-role="customnumericbox" role="spinbutton" class="k-input block-key-event" type="text" aria-disabled="false" style="display: none;" aria-valuemin="16" min="16" aria-valuemax="30" max="30" aria-valuenow="30"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase k-state-disabled" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-unit">℃</span></span></div>
                                </li>
                            </ul>
                            <p class="inner_tit">Operation pattern</p>
                            <ul class="button_wrap three">
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="Operation0" type="radio" name="Operation" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-pattall-g" for="Operation0"></label></div>
                                        </div>
                                        <p>Simultaneous</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="Operation1" type="radio" name="Operation" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-pattrotate-g" for="Operation1"></label></div>
                                        </div>
                                        <p>Sequential</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="buttonbound">
                                        <div class="background">
                                            <input id="Operation2" type="radio" name="Operation" value="Auto" class="c-radio">
                                            <div class="colorbox c-radio-label" data-value="Auto"><label class="icon ic-patteff-g" for="Operation2"></label></div>
                                        </div>
                                        <p>Efficiency</p>
                                    </div>
                                </li>
                            </ul>
                            <p class="inner_tit">Optimum water temp. control</p>
                            <div><button class="colorbox k-button " ><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>
                            <p class="inner_tit">Quiet mode</p>
                            <div><button class="colorbox k-button " ><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>
                            <p class="inner_tit">Snow protection</p>
                            <div><button class="colorbox k-button " ><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>
                            <p class="inner_tit">Demand setting</p>
                            <ul class="pinnerlist">
                                <li>
                                    <div class="tb" data-bind="invisible:btnTempLimit1" style=""><button id="btnTempLimit1" class="bound btncontrol k-button selected" data-role="customcontrolbutton" role="button" aria-disabled="false" tabindex="0">ON/OFF</button><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap control-custom-wrap k-state-default"><input type="text" class="k-formatted-value k-input" title="30.0" tabindex="0" placeholder="-" role="spinbutton" aria-disabled="false" aria-valuemin="16" aria-valuemax="30" aria-valuenow="30" style="display: inline-block;"><input id="inpTempLimit1" data-role="customnumericbox" role="spinbutton" class="k-input block-key-event" type="text" aria-disabled="false" style="display: none;" aria-valuemin="16" min="16" aria-valuemax="30" max="30" aria-valuenow="30"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase k-state-disabled" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-unit">℃</span></span></div>
                                </li>
                            </ul>
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

    <DeviceDetailModal ref="deviceDetailModal"  v-bind:deviceDetailList="selectedDeviceInDoorList"></DeviceDetailModal>
</div>
</template>

<script>
import axios from '@/api/axios.js';
import strUtils from "@/utils/stringUtils.js";

import ddDeviceGroupForDeviceInDoor from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceInDoor from "@/components/custom/VueDropdown.vue";
import ddDeviceTypeForDeviceInDoor from "@/components/custom/VueDropdown.vue";
import ddDeviceStatusForDeviceInDoor from "@/components/custom/VueDropdown.vue";
import ddDeviceModeForDeviceInDoor from "@/components/custom/VueDropdown.vue";

import ddDeviceGroupForDeviceInDoor2 from "@/components/custom/VueDropdown.vue";
import ddDeviceSubGroupForDeviceInDoor2 from "@/components/custom/VueDropdown.vue";
import ddDeviceTypeForDeviceInDoor2 from "@/components/custom/VueDropdown.vue";
import ddDeviceStatusForDeviceInDoor2 from "@/components/custom/VueDropdown.vue";
import ddDeviceModeForDeviceInDoor2 from "@/components/custom/VueDropdown.vue";

import DeviceDetailModal from "@/components/device/popup/DeviceDetailModal.vue";

export default {
    name : "DeviceInDoorView",
    components : {
        ddDeviceGroupForDeviceInDoor, ddDeviceSubGroupForDeviceInDoor, ddDeviceTypeForDeviceInDoor,ddDeviceStatusForDeviceInDoor, ddDeviceModeForDeviceInDoor,
        ddDeviceGroupForDeviceInDoor2, ddDeviceSubGroupForDeviceInDoor2, ddDeviceTypeForDeviceInDoor2, ddDeviceStatusForDeviceInDoor2, ddDeviceModeForDeviceInDoor2,
        DeviceDetailModal
    },
    props : ["viewTypeForDeviceInDoor"],
    data : function()
    {
        return {
            checkedTotalCountForListView: 0,
            checkedForListView: [],
            checkedCountTextForListView: '선택된 디바이스가 없습니다.',
            selectedCountTextForGridView: 0,

            selectedDeviceInDoorList: [],

            isLegendView : false,
            tilesAllSelected : true,
            ddDeviceGroupForDeviceInDoorDataSource: [],
            ddDeviceGroupForDeviceInDoor2DataSource: [],
            ddDeviceSubGroupForDeviceInDoorDataSource: [],  //전체 실내기 타입 -- .Indoor,AirConditioner.AHU,AirConditioner.Chiller,AirConditioner.EHS,AirConditioner.ERV,AirConditioner.ERVPlus,AirConditioner.FCU,AirConditioner.DuctFresh
            ddDeviceSubGroupForDeviceInDoor2DataSource: [],
            ddDeviceTypeForDeviceInDoorDataSource : [
                {"value": "전체 실내기 타입", "key": "AirConditioner"},
                {"value": "Cassette/Duct", "key": "AirConditioner_Indoor"},
                {"value": "AHU", "key": "AirConditioner_AHU"},
                {"value": "DVM Chiller", "key": "AirConditioner_Chiller"},
                {"value": "EHS", "key": "AirConditioner_EHS"},
                {"value": "ERV", "key": "AirConditioner_ERV"},
                {"value": "ERV Plus", "key": "AirConditioner_ERVPlus"},
                {"value": "FCU", "key": "AirConditioner_FCU"},
                {"value": "Fresh Duct", "key": "AirConditioner_DuctFresh"},
            ],
            ddDeviceTypeForDeviceInDoor2DataSource : [
                {"value": "전체 실내기 타입", "key": "AirConditioner"},
                {"value": "Cassette/Duct", "key": "AirConditioner_Indoor"},
                {"value": "AHU", "key": "AirConditioner_AHU"},
                {"value": "DVM Chiller", "key": "AirConditioner_Chiller"},
                {"value": "EHS", "key": "AirConditioner_EHS"},
                {"value": "ERV", "key": "AirConditioner_ERV"},
                {"value": "ERV Plus", "key": "AirConditioner_ERVPlus"},
                {"value": "FCU", "key": "AirConditioner_FCU"},
                {"value": "Fresh Duct", "key": "AirConditioner_DuctFresh"},
            ],
            ddDeviceStatusForDeviceInDoorDataSource : [
                {"value": "전체상태", "key": ""},
                {"value": "정상(켜짐)", "key": "Normal.On"},
                {"value": "정상(껴짐)", "key": "Normal.Off"},
                {"value": "에러", "key": "Alarm.Critical"},
                {"value": "경고", "key": "Alarm.Warning"},
            ],
            ddDeviceStatusForDeviceInDoor2DataSource : [
                {"value": "전체상태", "key": ""},
                {"value": "정상(켜짐)", "key": "Normal.On"},
                {"value": "정상(껴짐)", "key": "Normal.Off"},
                {"value": "에러", "key": "Alarm.Critical"},
                {"value": "경고", "key": "Alarm.Warning"},
            ],
            ddDeviceModeForDeviceInDoorDataSource : [
                {"value": "자동",          "key": "Auto", "id" : "AirConditioner.Indoor.General"},
                {"value": "냉방",          "key": "Cool", "id" : "AirConditioner.Indoor.General"},
                {"value": "난방",          "key": "Heat", "id" : "AirConditioner.Indoor.General"},
                {"value": "제습",          "key": "Dry", "id" : "AirConditioner.Indoor.General"},
                {"value": "송풍",          "key": "Fan", "id" : "AirConditioner.Indoor.General"},
                {"value": "축냉",          "key": "CoolStorage", "id" : "AirConditioner.Indoor.General"},
                {"value": "축열",          "key": "HeatStorage", "id" : "AirConditioner.Indoor.General"},
                {"value": "자동 (환기)",   "key": "vAuto", "id" : "AirConditioner.Indoor.Ventilator"},
                {"value": "전열",          "key": "HeatExchange", "id" : "AirConditioner.Indoor.Ventilator"},
                {"value": "보통",          "key": "ByPass", "id" : "AirConditioner.Indoor.Ventilator"},
                {"value": "정음",          "key": "Sleep", "id" : "AirConditioner.Indoor.Ventilator"},
                {"value": "절약",          "key": "Eco", "id" : "AirConditioner.Indoor.DHW"},
                {"value": "표준",          "key": "Standard", "id" : "AirConditioner.Indoor.DHW"},
                {"value": "파워",          "key": "Power", "id" : "AirConditioner.Indoor.DHW"},
                {"value": "강제",          "key": "Force", "id" : "AirConditioner.Indoor.DHW"}
            ],
            ddDeviceModeForDeviceInDoor2DataSource : [
                {"value": "자동",          "key": "Auto", "id" : "AirConditioner.Indoor.General"},
                {"value": "냉방",          "key": "Cool", "id" : "AirConditioner.Indoor.General"},
                {"value": "난방",          "key": "Heat", "id" : "AirConditioner.Indoor.General"},
                {"value": "제습",          "key": "Dry", "id" : "AirConditioner.Indoor.General"},
                {"value": "송풍",          "key": "Fan", "id" : "AirConditioner.Indoor.General"},
                {"value": "축냉",          "key": "CoolStorage", "id" : "AirConditioner.Indoor.General"},
                {"value": "축열",          "key": "HeatStorage", "id" : "AirConditioner.Indoor.General"},
                {"value": "자동 (환기)",   "key": "vAuto", "id" : "AirConditioner.Indoor.Ventilator"},
                {"value": "전열",          "key": "HeatExchange", "id" : "AirConditioner.Indoor.Ventilator"},
                {"value": "보통",          "key": "ByPass", "id" : "AirConditioner.Indoor.Ventilator"},
                {"value": "정음",          "key": "Sleep", "id" : "AirConditioner.Indoor.Ventilator"},
                {"value": "절약",          "key": "Eco", "id" : "AirConditioner.Indoor.DHW"},
                {"value": "표준",          "key": "Standard", "id" : "AirConditioner.Indoor.DHW"},
                {"value": "파워",          "key": "Power", "id" : "AirConditioner.Indoor.DHW"},
                {"value": "강제",          "key": "Force", "id" : "AirConditioner.Indoor.DHW"}
            ],
            deviceInDoorList : [],
        }
    },
    // watch: {
    //     test(val){
    //         console.log('test', val);

    //     }
    // },
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
        getDeviceModeText(modes)
        {
            var deviceModeText = "-";
            if(modes.length > 0)
            {
                //rowData.modes[0].mode
                var count = this.ddDeviceModeForDeviceInDoorDataSource.length;
                var key;
                for(var i=0;i<count;i++)
                {
                    key = this.ddDeviceModeForDeviceInDoorDataSource[i].key;
                    if(key == modes[0].mode)
                    {
                        deviceModeText = this.ddDeviceModeForDeviceInDoorDataSource[i].value;
                        break; 
                    }
                }
            }

            return deviceModeText;
        },

        getTemperaturesText(temperatures)
        {
            var temperaturesStr;
            //온도
            if(temperatures.length > 1)
            {
                temperaturesStr = temperatures[0].current+" ℃ / "+temperatures[1].current+" ℃";
            }else if(temperatures.length == 1)
            {
                temperaturesStr = temperatures[0].current+" ℃";
            }else
            {
                temperaturesStr = "-";
            }

            return temperaturesStr;
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
                    var resultList = res.data;
                    resultList.forEach(function(rowData){
                        deviceGroupData.push({
                            "key": rowData.id,
                            "value": rowData.name,
                            "checked": false,
                        });
                    });

                    this.ddDeviceGroupForDeviceInDoorDataSource = deviceGroupData;
                    this.ddDeviceGroupForDeviceInDoor2DataSource = deviceGroupData;
                    console.log("/dms/groups ddDeviceGroupForDeviceInDoorDataSource=", this.ddDeviceGroupForDeviceInDoorDataSource);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                console.log('/dms/groups error', error);
                // 승인대기 및 라이선스
            });
        },
        getDeviceInDoorlList()
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
                "deviceTypes": "AirConditioner",
                "siteId": "D99E1A2645",
                "userId": "webadmin",
                "userRoleType": 101,
            };

            axios.getApi('/dms/devices', params).then(res => {
                // 정상
                if(res.status == 200)
                {
                    this.deviceInDoorList = res.data;
                    console.log("/dms/devices deviceInDoorList=", this.deviceInDoorList);
                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                console.log('/dms/devices error', error);
                // 승인대기 및 라이선스
            });
        },
        openDetailForDeviceInDoor(event, selectedRowData)
        {
            console.log('openDetailForDeviceInDoor open event=', event+" this.checkedForListView=",this.checkedForListView+" selectedRowData=",selectedRowData);
            this.selectedDeviceInDoorList = [];

            if(!strUtils.isEmpty(selectedRowData))
            {
                this.selectedDeviceInDoorList.push(selectedRowData);
            }
            else
            {
                var checkedForListViewCount = this.checkedForListView.length;
                for(var i=0;i<checkedForListViewCount;i++)
                {
                    var checkedRowIdx = this.checkedForListView[i];
                    var tempRowData = this.deviceInDoorList[checkedRowIdx];
                    this.selectedDeviceInDoorList.push(tempRowData);
                }
            }

            
            this.$refs.deviceDetailModal.openModal();
        }
    },
    computed: {
        checkAllForListView: {
            get: function () {
                return this.deviceInDoorList ? this.checkedForListView.length == this.deviceInDoorList.length : false;
            },
            set: function (value) {
                var checkedForListView = [];
                if (value) {
                    this.deviceInDoorList.forEach(function (item, rowIdx) { checkedForListView.push(rowIdx); });
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
        console.log("DeviceInDoorView Tab Call!!");
        this.initSearch();
        this.getDeviceInDoorlList();
    },
    mounted()
    {

    },
    destroyed()
    {

    }
}
</script>