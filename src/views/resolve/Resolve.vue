<template>
<div class="content">
    <TabPage></TabPage>
    <div class="side_wrap">
        <!-- 정렬방식 및 검색 영역-->
        <div class="content_title_wrap">
            <ul class="right_area icon_type">
                <li><button class="ic ic-list active">목록보기</button></li>
                <li><button class="ic ic-tile">타일보기</button></li>
                <li>
                    <div class="search_input_wrap">
                        <input class="k-input" type="text" placeholder="검색 내용 입력">
                        <span class="ic ic-bt-input-remove"></span>
                        <span class="ic ic-bt-input-search"></span>
                    </div>
                </li>
            </ul>
        </div>
        <!-- filter 영역 -->
        <div class="content_title_wrap no_title">
            <ul class="flex_left">
                <li><span title="" class="k-widget k-dropdown k-header" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="dropDownList1_listbox" aria-disabled="false" aria-busy="false" aria-activedescendant="f3b99af0-32fb-485a-9007-c830e05d6948" style=""><span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">알람 타입</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList1" data-role="dropdownlist" style="display: none;"></div></span></li>
                <li><span title="" class="k-widget k-dropdown k-header" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" aria-owns="dropDownList2_listbox" aria-disabled="true" aria-busy="false" aria-activedescendant="ed0ce676-1a38-44d8-bd5b-165420dd0903" style=""><span unselectable="on" class="k-dropdown-wrap k-state-disabled"><span unselectable="on" class="k-input">알람 타입</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList2" data-role="dropdownlist" disabled="disabled" style="display: none;"></div></span></li>
                <li><span title="" class="k-widget k-dropdown k-header" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="dropDownList3_listbox" aria-disabled="false" aria-busy="false" style=""><span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">전체</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList3" data-role="dropdowncheckbox" style="display: none;"></div></span></li>
                <li><span title="" class="k-widget k-dropdown k-header" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="dropDownList4_listbox" aria-disabled="false" aria-busy="false" aria-activedescendant="0e8852ea-bc9e-4c44-9e76-22d42a8fd15c" style=""><span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">알람 타입</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList4" data-role="dropdownlist" style="display: none;"></div></span></li>
                <li><span class="ic-bar"></span></li>
                <li><a href="#" class="btn_legend">Legend</a>
                    <!-- s:Legend box-->
                    <div class="toolbox hide" style="left:-205px;top:40px;"><!-- d: 위치값 가변, hide 삭제시 보여짐-->
                        <div class="l_table">
                            <table>
                                <colgroup>
                                    <col style="width: 110px;">
                                    <col style="width: 150px;">
                                    <col style="width: 150px;">
                                    <col style="width: 150px;">
                                    <col>
                                </colgroup>
                                <tbody>
                                <tr>
                                    <th>실내기</th>
                                    <td><span class="ic_dot normal_on"></span> 정상(켜짐)</td>
                                    <td><span class="ic_dot normal_off"></span> 정상(꺼짐)</td>
                                    <td><span class="ic_dot error"></span> 에러</td>
                                    <td><span class="ic_dot warning"></span> 경고</td>
                                </tr>
                                <tr>
                                    <th>실외기</th>
                                    <td><span class="ic_dot normal_on"></span> 정상(켜짐)</td>
                                    <td><span class="ic_dot normal_off"></span> 정상(꺼짐)</td>
                                    <td><span class="ic_dot error"></span> 에러</td>
                                    <td><span class="ic_dot warning"></span> 경고</td>
                                </tr>
                                <tr>
                                    <th>에너지미터</th>
                                    <td><span class="ic_dot normal_on"></span> 정상(켜짐)</td>
                                    <td><span class="ic_dot normal_off"></span> 정상(꺼짐)</td>
                                    <td><span class="ic_dot warning"></span> 경고</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <th>조명</th>
                                    <td><span class="ic_dot normal_on"></span> 정상(켜짐)</td>
                                    <td><span class="ic_dot normal_off"></span> 정상(꺼짐)</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <th>공기청정기</th>
                                    <td><span class="ic_dot normal_on"></span> 정상(켜짐)</td>
                                    <td><span class="ic_dot normal_off"></span> 정상(꺼짐)</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <th>K.weather</th>
                                    <td><span class="ic_dot normal_on"></span> 정상(켜짐)</td>
                                    <td><span class="ic_dot error"></span> 에러</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- e:Legend box-->
                </li>
            </ul>
            <ul class="right_area">
                <li><span class="selected_text">99대중 99대가 표시되었습니다.</span></li>
                <li><button class="k-button" disabled="disabled">상세정보</button></li>
            </ul>
        </div>
        <!-- 본문 내용-->
        <div class="site-list-wrap">
            <!-- s: 컨텐츠 -->
            <section class="content_view">
                <!-- s: 기본 list-->
                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width:5%">
                            <col style="width:12%">
                            <col style="width:20%">
                            <col style="width:10%">
                            <col>
                            <col style="width:10%">
                            <col style="width:10%">
                        </colgroup>
                        <thead>
                        <tr>
                            <th><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched_all"><label class="k-checkbox-label single" for="ched_all"></label></span></th>
                            <th>디바이스 타입  <i class="ic_sort"></i></th>
                            <th>디바이스 이름  <i class="ic_sort up"></i></th>
                            <th>상태 <i class="ic_sort"></i></th>
                            <th>그룹 이름  <i class="ic_sort"></i></th>
                            <th>스케줄 <i class="ic_sort"></i></th>
                            <th>상세정보</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched2"><label class="k-checkbox-label single" for="ched2"></label></span></td>
                            <td>실내기</td>
                            <td class="tal">
                                <p class="ellipsis">FCU_B3_11</p>
                                <p class="ellipsis desc_text">00:FF:0D:02:1A:01:SNSG7788-632Y-31</p>
                            </td>
                            <td><span class="ic_dot normal_on"></span></td>
                            <td class="tal"><p class="ellipsis">Group Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1</p></td>
                            <td>O</td>
                            <td><span class="ic ic-info"></span></td>
                            </tr>
                        <tr>
                            <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched2"><label class="k-checkbox-label single" for="ched2"></label></span></td>
                            <td>실내기</td>
                            <td class="tal">
                                <p class="ellipsis">FCU_B3_11</p>
                                <p class="ellipsis desc_text">00:FF:0D:02:1A:01:SNSG7788-632Y-31</p>
                            </td>
                            <td><span class="ic_dot normal_on"></span></td>
                            <td class="tal"><p class="ellipsis">Group Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1</p></td>
                            <td>X</td>
                            <td><span class="ic ic-info"></span></td>
                        </tr>
                        <tr>
                            <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched2"><label class="k-checkbox-label single" for="ched2"></label></span></td>
                            <td>실내기</td>
                            <td class="tal">
                                <p class="ellipsis">FCU_B3_11</p>
                                <p class="ellipsis desc_text">00:FF:0D:02:1A:01:SNSG7788-632Y-31</p>
                            </td>
                            <td><span class="ic_dot error"></span></td>
                            <td class="tal"><p class="ellipsis">Group Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1</p></td>
                            <td>O</td>
                            <td><span class="ic ic-info"></span></td>
                        </tr>
                        <tr>
                            <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched2"><label class="k-checkbox-label single" for="ched2"></label></span></td>
                            <td>실내기</td>
                            <td class="tal">
                                <p class="ellipsis">FCU_B3_11</p>
                                <p class="ellipsis desc_text">00:FF:0D:02:1A:01:SNSG7788-632Y-31</p>
                            </td>
                            <td><span class="ic_dot warning"></span></td>
                            <td class="tal"><p class="ellipsis">Group Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1</p></td>
                            <td>O</td>
                            <td><span class="ic ic-info"></span></td>
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
                                <div><button class="colorbox k-button selected"><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>
                                <p class="inner_tit">Indoor Unit Mode</p>
                                <ul class="button_wrap five">
                                    <li>
                                        <div class="buttonbound">
                                            <div class="background">
                                                <input id="indoorMode0" type="radio" name="rgIndoorMode" value="Auto" class="c-radio">
                                                <div class="colorbox c-radio-label"><label class="icon ic-less-g" for="indoorMode0"></label></div>
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
                                                <div class="colorbox c-radio-label"><label class="icon ic-coolwater-g" for="indoorMode5"></label></div>
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
                                    <li><span class="k-widget k-numerictextbox control-numeric-bound" style=""><span class="k-numeric-wrap k-state-default control-custom-wrap"><input type="text" class="k-formatted-value k-input" title="" tabindex="0" placeholder="100" role="spinbutton" aria-valuemin="100" aria-valuemax="60000" aria-disabled="false" style="display: inline-block;"><input id="numericBox" maxlength="5" data-role="customnumericbox" role="spinbutton" class="k-input" type="text" aria-valuemin="100" aria-valuemax="60000" style="display: none;" aria-disabled="false"><span class="k-select control-custom-box"><span unselectable="on" class="k-link k-link-increase" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 up"></span></span><span unselectable="on" class="k-link k-link-decrease" aria-label="" title=""><span unselectable="on" class="k-icon c-i-arrow-60 down"></span></span></span></span><span class="control-numeric-unit">ms</span></span></li>
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
                                <div><button class="colorbox k-button "><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>

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
                                <div><button class="colorbox k-button "><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>

                                <p class="inner_tit">Quiet mode</p>
                                <div><button class="colorbox k-button "><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>

                                <p class="inner_tit">Snow protection</p>
                                <div><button class="colorbox k-button "><span class="icwrap"><i class="icon power"></i>OFF</span></button></div>

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
                                <div><button class="colorbox k-button selected"><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>
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
                                <div><button class="colorbox k-button selected"><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>

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
                                    <li><button class="colorbox k-button selected">Permit</button></li>
                                    <li><button class="colorbox k-button ">Prohibition</button></li>
                                </ul>

                                <p class="inner_tit">Filter reset</p>
                                <div><button class="colorbox k-button selected"><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>

                                <p class="inner_tit">SPI setting</p>
                                <div><button class="colorbox k-button selected"><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button></div>

                            </div>
                        </li>
                    </ul>
                </div>
                <!--e:디바이스-->
            </section>
            <!-- e: Site List Area -->
        </div>
    </div>
</div>
</template>

<script>
import TabPage from "@/views/sample/SampleTabPage.vue";

export default {
  name: "App",
  components: { TabPage },
  watch: {},
  data: function() {
    return {}
  }
};
</script>


<style lang="scss" scoped>

</style>
