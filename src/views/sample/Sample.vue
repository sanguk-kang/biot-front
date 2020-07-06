<template>
  <div class="content">
    <div class="sample_content">
        <div style="color:red">
            공통 컴포넌트 기능들의 옵션을 각 아이템 별로 적어주시면 좋겠습니다.<br/>
            공통 컴포넌트들을 사용하는데 기능이 변경되어 되던게 안되는 현상이 있어 다시 옵션을 찾거나 하는 일이 잦습니다.<br/>
            예) Date picker에서 년도 기능 선택 시 좌우 (이전 연도, 다음 연도) 버튼이 갑자기 사라짐.
            <br/><br/>
            그리고 통합되었거나, 폐기된 컴포넌트가 있다면 미리 고지해주시거나, 대체 컴포넌트 안내가 있었으면 좋겠습니다.<br/>
            예) 드롭다운 셀렉터가 처음에 [단일 선택] 및 [다]중 선택] 2가지로 나누어졌는데 단일 선택 드롭다운이 갑자기 다중 선택이 되버림.<br/>
            히스토리를 보니까 VueDropdown 컴포넌트가 2가지 역할을 수행하다가 단일 선택은 el-selector로 변경되면서 폐기되었네요.
            <br/><br/>
            답변 : 7월3일 금요일 10:57 AM 슬랙을 통하여 해당 내용 가이드문서 현행화 이후 공지드렸으며, 현재 공통작업이 같이 진행되고 있음에 따라 불편한 사항을 최대한 줄일려고 노력중입니다.<br/>
            슬랙에 현재 일요일 기준으로 다시 이야기하여 개발하시는 분들 다 초대하시거나 아니면 전달 잘 부탁드린다고 적어놨습니다. <br/>
            해당 파일은 퍼블리셔 작업파일을 옮겨 놓음으로 월요일 저녁에 위에 작성한 글은 삭제 하겠으며, 계속 수정하는 내용 현행화하도록 하겠습니다. 감사합니다.
        </div>
      <div>
        <strong>모달 샘플</strong>
      </div>
      <!-- 300 모달 시작 -->
      <button type="button" @click='openModalName("1")' class="btn_normal">기본 모달 샘플 스타일 - width300px;</button>
      <VueModalSample ref="modalName"></VueModalSample>
      <!-- 300 모달 끝 -->

      <!-- 820 모달 시작 -->
      <button type="button" @click='openModalName("2")' class="btn_normal">Accordion 리스트 모달 샘플 스타일 - width820px;</button>
      <VueModalSampleAcc ref='VueModalSampleAcc'></VueModalSampleAcc>
      <!-- 820 모달 끝 -->

      <!-- 1560 모달 시작 -->
      <button type="button" @click='openModalName("3")' class="btn_normal">상세정보 보기 모달 샘플 스타일 - width1560px;</button>
      <VueModalSampleView ref="VueModalSampleView"></VueModalSampleView>
      <!-- 1560 모달 끝 -->

      <!-- 1860 모달 시작 -->
      <button type="button" @click='openModalName("4")' class="btn_normal">카톡 알람 설정 모달 샘플 스타일 - width1860px;</button>
      <VueModalSampleBig ref="VueModalSampleBig"></VueModalSampleBig>
      <!-- 1860 모달 끝 -->
    </div>

    <div class="sample_content" id="calendal">
      <div>
        <strong>날짜 샘플</strong>
      </div>
      <VueDatePick v-model="startDate" class="inp_calendar">
        <template v-slot:default="{toggle, inputValue}">
          <button @click="toggle"> {{ inputValue || 'Start Date btn' }} </button>
          <span unselectable="on" class="k-select" aria-label="select" role="button" aria-controls="endDatePicker_dateview"><span class="ic_wrap ic-bt-input-calendar"></span></span><!--ic_wrap 수정0630--->
        </template>
      </VueDatePick>
      <span> ~ </span>
      <VueDatePick v-model="endDate" class="inp_calendar">
        <template v-slot:default="{toggle, inputValue}">
          <button @click="toggle"> {{ inputValue || 'End Date btn' }} </button>
          <span unselectable="on" class="k-select" aria-label="select" role="button" aria-controls="endDatePicker_dateview"><span class="ic_wrap ic-bt-input-calendar"></span></span><!--ic_wrap 수정0630--->
        </template>
      </VueDatePick>
      <!-- elementUI -->
      <div>
          <strong>날짜 샘플 - elementUI</strong>
      </div>
      <div id="el_calendar">
      <el-date-picker
                v-model="elStartDate"
                type="date"
                placeholder="Pick a date"
                default-value="2020-06-24"
                >
                </el-date-picker>
      <span> ~ </span>
      <el-date-picker
                v-model="elEndDate"
                type="date"
                placeholder="Pick a date"
                default-value="2020-08-30">
                </el-date-picker>
      </div>
      <div>
        <strong>날짜 샘플 - 큰달력 (운영관리 > OP-2102.html)</strong>
      </div>


    </div>
    <div class="sample_content">
        <div>
            <strong>날짜 선택 input - 분석/ 비고분석 /RE-1101.html</strong>
        </div>
        <div class="calendar-input">
            <button class="ic ic-date-prev ">이전달</button>
            <button class="ic ic-date-current">2020-05</button>
            <button class="ic ic-date-next">다음달</button>
        </div>
    </div>

    <div class="sample_content">
        <div>
            <strong>TimePicker</strong>
        </div>
        <!-- TimePicker 시작 -->
        <el-time-select
            v-model="timeValue"
            :picker-options="{
                start: '08:30',
                step: '00:15',
                end: '18:30'
            }"
            placeholder="Select time">
        </el-time-select>
        <!-- TimePicker 끝 -->
    </div>

    <div class="sample_content">
      <div>
        <strong>셀렉트 샘플</strong>
      </div>
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
    </div>

    <div class="sample_content">
      <div>
        <strong>드랍다운(체크박스) 샘플</strong>
      </div>
      <!-- 드랍다운(체크박스) 시작 -->
      <VueDropdown v-model="dropDownValue" :selectboxData='selectboxData' :isCheckType="true" :allText="'전체'" @change="getItem"></VueDropdown>
      <!-- 드랍다운(체크박스) 끝 -->
    </div>

    <div class="sample_content">
      <div>
        <strong>드랍다운 샘플 (추가 생플 : 운영관리 > 폴더 이미지들어가는 형식 OP-2101.html) - 재작업 필요</strong>
      </div>
      <!-- 드랍다운 아이콘 추가 형식 시작-->
      <VueDropdown v-model="dropIconValue" :selectboxData='selectboxData' :allText="'전체'" @change="getItem"></VueDropdown>
      <!-- 드랍다운 아이콘 추가 형식 끝-->
    </div>

    <div class="sample_content">
      <div>
        <strong>ElementUI Dropdown - 임시샘플</strong>
      </div>
      <!-- ElementUI Dropdown 시작-->
        <el-select
            v-model="elDropdownVal"
            multiple
            collapse-tags
            style=""
            placeholder="Select">
            <el-option
            v-for="item in selectboxData"
            :key="item.value"
            :label="item.key"
            :value="item.value">
            </el-option>
        </el-select>
      <!-- ElementUI Dropdown 끝-->
    </div>

<!--Alert 메세지 샘플-->
    <div class="sample_content">
      <div>
        <strong>Alert 메세지 샘플</strong>
      </div>
      <el-button type="text" @click="openAlert">Click to open the alert Box</el-button>
    </div>

<!--Confirm 메세지 샘플-->
    <div class="sample_content">
      <div>
        <strong>Confirm 메세지 샘플</strong>
      </div>
      <el-button type="text" @click="openConfirm">Click to open the confirm Box</el-button>
    </div>

    <div class="sample_content">
      <div>
        <strong>차트 샘플</strong>
      </div>
      <div>
        <VueGoogleChart></VueGoogleChart>
      </div>
    </div>

    <div class="sample_content">
      <div>
        <strong>공지사항 테이블 - 공지사항 테이블 하단만 페이징 나옵니다.</strong>
      </div>
      <!-- 공지사항 테이블 시작 -->
      <div class="g-table notice_gd">
          <table>
              <colgroup>
                  <col style="width:90px">
                  <col style="width:450px">
                  <col style="width:60px">
                  <col style="width:100px">
                  <col style="width:60px">
                </colgroup>
              <thead>
              <tr>
                  <th>No</th>
                  <th>Title</th>
                  <th>File</th>
                  <th>Date</th>
                  <th>상태</th>
              </tr>
              </thead>
              <tbody>
              <tr class="bg_notice">
                  <td><span class="ic_notice">Notice</span></td>
                  <td><a href="#">Download the Step By Step Easy Troubleshoot Guide Guide VerVerVerVer</a></td>
                  <td><span class="notice_file"></span></td>
                  <td>2020-03-01</td>
                  <td><span class="ic_dot electricity"></span></td>
              </tr>
              <tr class="bg_notice">
                  <td><span class="ic_pop">POP</span></td>
                  <td><a href="#">Download the Step By Step Easy Troubleshoot Guide Guide VerVerVerVer</a></td>
                  <td><span class="notice_file"></span></td>
                  <td>2020-03-01</td>
                  <td><span class="ic_dot normal_on"></span></td>
              </tr>
              <tr>
                  <td>8</td>
                  <td><a href="#">Download the Step By Step Easy </a></td>
                  <td><span class="notice_file"></span></td>
                  <td>2020-03-01</td>
                  <td><span class="ic_dot error"></span></td>
              </tr>
              <tr>
                  <td>7</td>
                  <td><a href="#">Download the Step By Step Easy</a></td>
                  <td><span class="notice_file"></span></td>
                  <td>2020-03-01</td>
                  <td><span class="ic_dot warning"></span></td>
              </tr>
              </tbody>
          </table>
      </div>
      <!-- 공지사항 테이블 끝 -->

      <!-- 페이징 시작 -->
      <div class="g-paging">
          <a href="#" class="btn_first">처음가기</a>
          <a href="#" class="btn_pre">이전가기</a>
          <ul class="paging_list">
              <li><a href="#" class="k-state-selected">1</a></li>
              <li><a href="#">2</a></li>
              <li><a href="#">3</a></li>
              <li><a href="#">4</a></li>
              <li><a href="#">5</a></li>
              <li><a href="#">6</a></li>
              <li><a href="#">7</a></li>
              <li><a href="#">8</a></li>
              <li><a href="#">9</a></li>
              <li><a href="#">10</a></li>
          </ul>
          <a href="#" class="btn_next">다음가기</a>
          <a href="#" class="btn_last">맨끝가기</a>
      </div>
      <!-- 페이징 끝 -->
    </div>

    <div class="sample_content">
      <div>
        <strong>기본 테이블 스타일</strong>
      </div>
      <!-- 테이블 시작 -->
        <div class="g-table">
                <table>
                    <colgroup>
                        <col style="width:10%">
                        <col style="width:10%">
                        <col style="width:10%">
                        <col style="width:10%">
                        <col style="width:10%">
                        <col style="width:10%">
                        <col style="width:10%">
                        <col style="width:10%">
                        <col style="width:10%">
                    </colgroup>
                    <thead>
                    <tr>
                        <th><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched_all"><label class="k-checkbox-label single" for="ched_all"></label></span></th>
                        <th>User Type<i class="ic_sort"></i></th>
                        <th>ID<i class="ic_sort"></i></th>
                        <th>Name<i class="ic_sort"></i></th>
                        <th>Phone<i class="ic_sort"></i></th>
                        <th>E-mail<i class="ic_sort"></i></th>
                        <th>Corporate Name<i class="ic_sort"></i></th>
                        <th>position</th>
                        <th>가입일 <i class="ic_sort"></i></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched1"><label class="k-checkbox-label single" for="ched1"></label></span></td>
                        <td><span class="highlighted-ing">진행중</span></td>
                        <td><span class="highlighted-error">경고성</span></td>
                        <td></td>
                        <td><input type="text" class="k-input" placeholder="이름"></td>
                        <td><span class="detail-img reg selected Indoor"></span></td>
                        <td>
                            <input type="radio" class="k-radio type-radio" name="radio" value="" id="radio1">
                            <label class="k-radio-label" for="radio1">사용</label>
                            <input type="radio" class="k-radio type-radio" name="radio" value="" id="radio2" checked="">
                            <label class="k-radio-label" for="radio2">사용안함</label>
                        </td>
                        <td><button class="k-button btn_w1">이력</button></td>
                        <td><span class="ic ic-info"></span></td>
                    </tr>
                    <tr>
                        <td><span class="radioLabel"><input type="radio" class="k-radio" name="radio" id="rd1"><label class="k-radio-label single" for="rd1"></label></span></td>
                        <td class="tal"><a href="#" class="btn_text">Single Site</a></td>
                        <td class="tar">우측정렬</td>
                        <td><span class="highlighted-ing">진행중</span></td>
                        <td class="tal"><span class="ic_new">new</span>Name name 1</td>
                        <td>
                            <!-- 드랍다운 아이콘 추가 형식 시작-->
                            <VueDropdown v-model="dropIconValue" :isCheckType="null" :selectboxData='selectboxData' :allValue='true' :allText="'전체'"></VueDropdown>
                            <!-- 드랍다운 아이콘 추가 형식 끝-->
                        </td>
                        <td>_Corporate Name</td>
                        <td>_position</td>
                        <td>2020-03-20 14:54</td>
                    </tr>
                    <tr>
                        <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched3"><label class="k-checkbox-label single" for="ched3"></label></span></td>
                        <td class="tal"><span class="icon_site">Installer</span></td>
                        <td>_ID</td>
                        <td>_Name</td>
                        <td>010-2525-6666</td>
                        <td>hong88@naver.com</td>
                        <td>_Corporate Name</td>
                        <td>_position</td>
                        <td>2020-03-20 14:54</td>
                    </tr>
                    <tr>
                        <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched3"><label class="k-checkbox-label single" for="ched3"></label></span></td>
                        <td class="tal"><span class="icon_site noimg">Installer</span></td>
                        <td>_ID</td>
                        <td>_Name</td>
                        <td>010-2525-6666</td>
                        <td>hong88@naver.com</td>
                        <td>_Corporate Name</td>
                        <td>_position</td>
                        <td>2020-03-20 14:54</td>
                    </tr>
                    </tbody>
                </table>
            </div>
      <!-- 테이블 끝 -->
    </div>

    <div class="sample_content">
        <div>
          <strong>리스트 없는 테이블</strong>
        </div>
        <!-- 리스트 없는 경우 테이블 시작 -->
        <div class="g-table">
            <table>
                <colgroup>
                    <col style="width:10%">
                    <col style="width:10%">
                    <col style="width:10%">
                    <col style="width:10%">
                    <col style="width:10%">
                    <col style="width:10%">
                    <col style="width:10%">
                    <col style="width:10%">
                    <col style="width:10%">
                </colgroup>
                <thead>
                <tr>
                    <th><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched_all"><label class="k-checkbox-label single" for="ched_all"></label></span></th>
                    <th>User Type<i class="ic_sort"></i></th>
                    <th>ID<i class="ic_sort"></i></th>
                    <th>Name<i class="ic_sort"></i></th>
                    <th>Phone<i class="ic_sort"></i></th>
                    <th>E-mail<i class="ic_sort"></i></th>
                    <th>Corporate Name<i class="ic_sort"></i></th>
                    <th>position</th>
                    <th>가입일 <i class="ic_sort"></i></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td colspan="9" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지 않습니다.</td>
                </tr>
                </tbody>
            </table>
        </div>
        <!-- 리스트 없는 경우 테이블 끝 -->
    </div>

    <div class="sample_content">
        <div>
          <strong>컨텐츠 tab</strong>
        </div>
        <!-- 컨텐츠 이동 메뉴 tab 시작 - 유지보수 MA-1001 -->
        <div class="content_title_wrap">
            <ul class="dash_tab">
                <li class="active"><a href="#tabcont1">서비스 안내 </a></li>
                <li><a href="#tabcont2">유지보수</a></li>
                <li><a href="#tabcont3">종합세척</a></li>
                <li><a href="#tabcont4">에너지 절감 솔루션</a></li>
            </ul>
        </div>
        <!-- 컨텐츠 이동 메뉴 tab 끝 - 유지보수 MA-1001 -->
    </div>

    <div class="sample_content">
        <div>
          <strong>카드형식 보기</strong>
        </div>
        <!-- 카드형식 리스트 시작-->
        <div class="gridview_list all_list"><!-- 전체 일때만 all_list 추가-->
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
                        <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info"></i></div>
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
                        <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info"></i></div>
                    </div>
                </li>

                <li>
                    <div class="card-item">
                        <div class="icon-line"><div class="icon ic-rock"></div><div class="icon ic-thurmo"></div></div>
                        <div class="card-info"><div class="left"><span class="type Normal-Off">Dry</span><span class="device-img Dry Normal-Off"></span></div><div class="right"><span class="Normal-Off set" data-content="°C"><em>설정</em>24.0</span><span class="Normal-Off current" data-content="°C"><em>현재</em>-</span></div></div>
                        <div class="item-bottom"><span class="device-type-img I4WAY">11.00.03</span><i class="ic ic-info" data-id="00:FF:0B:00:03:01:SZVK9690-656D-27"></i></div>
                    </div>
                </li>
            </ul>
        </div>
        <!-- 카드형식 리스트 끝-->
    </div>

    <div class="sample_content">
        <div>
          <strong>롱카드형식 보기</strong>
        </div>
        <!-- 롱카드형식 리스트 시작-->
        <div> <!--class="site_wrap"-->
            <ul class="site_list">
                <li>
                    <div class="card_wrap all">
                        <div class="site_name"><span class="name">All Site Status</span></div>
                        <ul class="state_per">
                            <li>
                                <p class="text_per">42.3%</p>
                                <p class="text_num">(150)</p>
                                <p class="text_state">Operation Rate</p>
                            </li>
                            <li class="onoff">
                                <p class="text_per">50.2%</p>
                                <p class="text_num">(1036/1097)</p>
                                <p class="text_state">ON/OFF </p>
                            </li>
                        </ul>
                        <div class="usage">
                            <p class="title">Electricity Usage</p>
                            <p class="result"><strong>1,058,241</strong>kWh</p>
                        </div>
                        <ul class="condition">
                            <li class="critical"><span class="title">Critical</span><span class="num">10,999</span></li>
                            <li class="warning"><span class="title">Warning</span><span class="num">10,999</span></li>
                            <li class="energylos"><span class="title">Energy Los</span><span class="num">10,999</span></li>
                            <li class="maintenance"><span class="title">Maintenance</span><span class="num">10,999</span></li>
                        </ul>
                        <ul class="result_wrap">
                            <li>
                                <div class="good">
                                    <p class="air">Air Quality</p>
                                    <p class="result">Good</p>
                                </div>
                            </li>
                            <li>
                                <div class="normal">
                                    <p class="air">Air Comfort Degree</p>
                                    <p class="result">Normal</p>
                                </div>
                            </li>
                        </ul>
                        <button class="ic ic-info"></button>
                    </div>
                </li>
                <li>
                    <div class="card_wrap">
                        <div class="site_name"><span class="name">No Data Case</span></div>
                        <ul class="state_per">
                            <li>
                                <p class="text_per">-%</p>
                                <p class="text_num">(0)</p>
                                <p class="text_state">Operation Rate</p>
                            </li>
                            <li class="onoff">
                                <p class="text_per">-%</p>
                                <p class="text_num">(0/0)</p>
                                <p class="text_state">ON/OFF </p>
                            </li>
                        </ul>
                        <div class="usage">
                            <p class="title">Electricity Usage</p>
                            <p class="result"><strong>-</strong>kWh</p>
                        </div>
                        <ul class="condition">
                            <li class="critical"><span class="title">Critical</span><span class="num">0</span></li>
                            <li class="warning"><span class="title">Warning</span><span class="num">0</span></li>
                            <li class="energylos"><span class="title">Energy Los</span><span class="num">0</span></li>
                            <li class="maintenance"><span class="title">Maintenance</span><span class="num">0</span></li>
                        </ul>
                        <ul class="result_wrap">
                            <li>
                                <div class="">
                                    <p class="air">Air Quality</p>
                                    <p class="result">-</p>
                                </div>
                            </li>
                            <li>
                                <div class="">
                                    <p class="air">Air Comfort Degree</p>
                                    <p class="result">-</p>
                                </div>
                            </li>
                        </ul>
                        <button class="ic ic-info"></button>
                    </div>
                </li>
                <li>
                    <div class="card_wrap">
                        <div class="site_name"><span class="name">Multi Site Name NameNameName</span><span class="num">(132)</span></div>
                        <ul class="state_per">
                            <li>
                                <p class="text_per">42.3%</p>
                                <p class="text_num">(150)</p>
                                <p class="text_state">Operation Rate</p>
                            </li>
                            <li class="onoff">
                                <p class="text_per">50.2%</p>
                                <p class="text_num">(1036/1097)</p>
                                <p class="text_state">ON/OFF </p>
                            </li>
                        </ul>
                        <div class="usage">
                            <p class="title">Electricity Usage</p>
                            <p class="result"><strong>1,058,241</strong>kWh</p>
                        </div>
                        <ul class="condition">
                            <li class="critical"><span class="title">Critical</span><span class="num">10,999</span></li>
                            <li class="warning"><span class="title">Warning</span><span class="num">99</span></li>
                            <li class="energylos"><span class="title">Energy Los</span><span class="num">1</span></li>
                            <li class="maintenance"><span class="title">Maintenance</span><span class="num">101</span></li>
                        </ul>
                        <ul class="result_wrap">
                            <li>
                                <div class="poor">
                                    <p class="air">Air Quality</p>
                                    <p class="result">Good</p>
                                </div>
                            </li>
                            <li>
                                <div class="verypoor">
                                    <p class="air">Air Comfort Degree</p>
                                    <p class="result">Normal</p>
                                </div>
                            </li>
                        </ul>
                        <button class="ic ic-info"></button>
                    </div>
                </li>
                <li>
                    <div class="card_wrap">
                        <div class="site_name"><span class="name">Multi Site</span><span class="num">(32)</span></div>
                        <ul class="state_per">
                            <li>
                                <p class="text_per">42.3%</p>
                                <p class="text_num">(150)</p>
                                <p class="text_state">Operation Rate</p>
                            </li>
                            <li class="onoff">
                                <p class="text_per">50.2%</p>
                                <p class="text_num">(1036/1097)</p>
                                <p class="text_state">ON/OFF </p>
                            </li>
                        </ul>
                        <div class="usage">
                            <p class="title">Electricity Usage</p>
                            <p class="result"><strong>1,058,241</strong>kWh</p>
                        </div>
                        <ul class="condition">
                            <li class="critical"><span class="title">Critical</span><span class="num">10,999</span></li>
                            <li class="warning"><span class="title">Warning</span><span class="num">10,999</span></li>
                            <li class="energylos"><span class="title">Energy Los</span><span class="num">10,999</span></li>
                            <li class="maintenance"><span class="title">Maintenance</span><span class="num">10,999</span></li>
                        </ul>
                        <ul class="result_wrap">
                            <li>
                                <div class="good">
                                    <p class="air">Air Quality</p>
                                    <p class="result">Good</p>
                                </div>
                            </li>
                            <li>
                                <div class="normal">
                                    <p class="air">Air Comfort Degree</p>
                                    <p class="result">Normal</p>
                                </div>
                            </li>
                        </ul>
                        <button class="ic ic-info"></button>
                    </div>
                </li>
            </ul>
        </div>
        <!-- 롱카드형식 리스트 끝-->
    </div>

    <div class="sample_content">
        <div>
          <strong>우측-site tree</strong>
        </div>
        <!-- tree 시작 -->
        <div class="site-list">
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
        </div>
        <!-- tree 끝 -->
    </div>

    <div class="sample_content">
        <div>
          <strong>우측-site</strong>
        </div>
        <!-- 폴더 구조 시작-->
        <div class="site-list">
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
            <div class="scroll_wrap only_site result" style=" height:550px;"><!-- D: 세로 스크롤영역이 tbody 와 동일하게 height 가변-->
                <ul class="depth1" style="width: 260px;"><!-- D: 가로 스크롤영역이 가장 긴 텍스트 넓이 값으로 가변-->
                    <li><div class="default">Total : 4</div></li>
                    <li><div class="ic_fold no_fold"><span class="name">Group 1 <span class="result">AA</span>A</span></div><a href="#" class="ic_close">삭제</a></li>
                    <li><div class="ic_fold no_fold"><span class="name">Group 2 <span class="result">AA</span>A</span></div><a href="#" class="ic_close">삭제</a></li>
                    <li><div class="ic_fold no_fold"><span class="name">Group 3 <span class="result">AA</span>A</span></div><a href="#" class="ic_close">삭제</a></li>
                    <li><div class="ic_fold no_fold"><span class="name">Group 4 <span class="result">AA</span>A</span></div><a href="#" class="ic_close">삭제</a></li>
                </ul>
            </div>
            <!-- e: scroll 영역-->
        </div>
        <!-- 폴더 구조 끝-->
    </div>

    <div class="sample_content">
        <div>
          <strong>우측-리모콘</strong>
        </div>
        <!-- 리모콘 시작 -->
        <div class="site-list">
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
        </div>
        <!-- 리모콘 끝 -->
      </div>

  </div>
</template>

<script>
import VueModalSample from '@/views/sample/custom/VueModalSample';
import VueModalSampleAcc from '@/views/sample/custom/VueModalSampleAcc';
import VueModalSampleView from '@/views/sample/custom/VueModalSampleView';
import VueModalSampleBig from '@/views/sample/custom/VueModalSampleBig';
import VueDatePick from "vue-date-pick/src/vueDatePick";
import VueGoogleChart from "@/views/sample/custom/VueGoogleChart";
import VueDropdown from "@/components/custom/VueDropdown";
import { mapState } from 'vuex'

export default {
  name: "Sample",
  props: [],
  components: {
    VueModalSample,
    VueModalSampleAcc,
    VueModalSampleView,
    VueModalSampleBig,
    VueDatePick,
    VueGoogleChart,
    VueDropdown
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
      // date pick 변수
      startDate: '',
      endDate: '',
      // element date pick
      elStartDate: '',
      elEndDate: '',

      // timepicker
      timeValue: '',

      // element
      elSelectVal: '',
      elDropdownVal: '',

      // select 변수
      selectValue: {},
      dropDownValue: [],
      dropIconValue: {},
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
      ]
    }
  },
  computed: {
    ...mapState('app', ['testData']),
  },
  methods: {
    getItem(item) {
      console.log('Dropdown Result Item', item);
    },
    // modal 함수
    openModalName(param) {
        if (param === "1") {
            this.$refs.modalName.openModal();
        } else if (param === "2") {
            this.$refs.VueModalSampleAcc.openModal();
        } else if (param === "3") {
            this.$refs.VueModalSampleView.openModal();
        } else {
            this.$refs.VueModalSampleBig.openModal();
        }
        console.log('모달 클릭');
    },

    // alert 함수
    openAlert() {
      this.$alert('This is a message', 'Title', {
        title: "alert test",
        confirmButtonText: 'OK',
        dangerouslyUseHTMLString: true,
        callback: action => {
          console.log(action);
        }
      });
    },

    // confirm 함수
    openConfirm() {
        this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
          title: "confirm test",
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: '',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          dangerouslyUseHTMLString: true
        }).then(() => {
          console.log('Delete completed');
        }).catch(() => {
          console.log('Delete canceled');
        });
      }
  },
  created() {
  },
  mounted() {
      console.log('test vuex state', this.testData);
  },
  destroyed() {
  }
}
</script>

<style lang="scss" scoped>
  .sample_content{
    margin:30px 50px;
    &:first-child{
      margin-top:50px;
    }
  }
    .sample_content > div > strong{
        margin: 50px 0px 30px;
        font-size: 18px;
        background-color: #666;
        color: #f2f2ff;
        display: block;
        padding: 15px;
    }
    .sample_content > div > strong::before{
        content: ">";
        margin-right: 7px;
    }
    .sample_content > button{
        display: block;
        margin: 7px;
        padding: 15px;
    }
</style>
