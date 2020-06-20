//Main JS
/**
*
*   <ul>
*       <li>메인 화면의 메뉴 사이드바, 층 네비게이션(FNB), 상단 네비게이션(GNB)을 제어한다.</p>
*       <li>전체 모듈에 공통적으로 적용되어야할 사항 (Observer로 하위 모듈에 이벤트 전달, Websocket 접속 등)을 수행한다.
*   </ul>
*   @module app/main
*   @param {Object} data - menu.json과 /menus API를 호출하여 응답되는 메뉴 정보
*   @param {Object} GlobalObserver - main 모듈과 각 단위 기능의 모듈에서 FNB 이벤트 등에 대한 Pub/Sub를 수행할 수 있는 Observer 모듈
*   @param {Object} Module - require.js로 정의된 각 단위 기능의 하위 모듈을 실행하고, 해당 모듈에 공용으로 전달해줄 Util 또는 Data를 전달하기 위한 인스턴스 생성이 가능한 Class
*
*   @requires config - /foundation/settings API 호출을 통하여 Settings 정보를 관리하는 모듈
*   @requires app/core/observer
*   @requires app/core/module
*   @requires app/core/util
*
*/
(function(window, $){
	window.kendo.ui.progress($("body"), true);
	require(["domReady"], function(domReady){
		"use strict";
		domReady(function(){
			require(["json!/front/menus", "core/observer", "core/module"], function(data, GlobalObserver, Module){
				var moment = window.moment;
				var Cookie = window.Cookies;
				var I18N;
				var MSG_MAIN_SIGNOUT_CONFIRM = "Do you want to sign out?";
				var MSG_MENU_OPEN_FAIL = "Failed to initalize menu.";
				// var MSG_NO_SPACE = "There is no registered space information.";
				// var MSG_NO_FLOOR = "There is no registered floor information.";
				// var MSG_NO_DEVICE = "There is no registered device information.";

				var FLOOR_NAV_BUILDING_TOTAL_ID = 0;
				var FLOOR_NAV_BUILDING_TOTAL = "TOTAL";
				var FLOOR_NAV_FLOOR_ALL = "ALL";
				var FLOOR_NAV_FLOOR_ALL_ID = "all";
				var SIGNIN_MENU_KEY = "signin";
				// var MY_PROFILE_MENU_KEY = "profile";

				var localStorage = window.localStorage;
				var Session = window.Session;
				var GlobalSettings = window.GlobalSettings;
				var Util = window.Util;
				var LoadingPanel = window.CommonLoadingPanel;
				var webSocket = window.CommonWebSocket;
				var WindowXssFilter = window.xssFilter;
				var xssFilter = new WindowXssFilter();

				var FRONT_END_URL = "/front";
				var menuConfig = data, kendo = window.kendo;
				var curMenuConfig, curFloor;
				var SCROLL_BAR_SIZE = 14;
				var BTN_UTIL_HEIGHT = 80;

				var msgDialog, msgDialogElem = $("<div/>");
				var confirmDialog, confirmDialogElem = $("<div/>");
				var Loading = new LoadingPanel();

				//Main
				var mainElem = $("#main"),
					mainHeader = $("#main-header");

				//Sidebar
				var sidebarMenu = $("#main-sidebar-menu");
				var sidebarTopLogo = sidebarMenu.find(".main-sidebar-top");
				var sidebarMenuList = sidebarMenu.find(".main-sidebar-menu-list");
				var sidebarHidden = sidebarMenu.find(".main-sidebar-hidden");
				var sidebarMenuIconList = sidebarHidden.find('.main-sidebar-menu-icon-list');
				var sidebarHiddenTopInfo = sidebarHidden.find('.top-info');
				var triggeredBySidebarBtn = true;
				var COOKIE_KEY_HIDE_MAIN_SIDEBAR = "hideMainSidebar";

				//sidebar first & last line
				var sidebarMenuListLines = sidebarMenuList.find(".main-sidebar-menu-list-line");
				var sidebarMenuListUl = sidebarMenuList.find("> ul");
				var sidebarUtilBtnWrapper = sidebarMenu.find(".btn-util");
				var sidebarUtilBtnBox = sidebarUtilBtnWrapper.find(".btn-box");
				var floorBuildingCombo = sidebarMenu.find(".main-sidebar-floor-nav-building-select");

				var floorNav = $("#main-sidebar-floor-nav");
				// var floorBuildingCombo = floorNav.find(".main-sidebar-floor-nav-building-select");
				var floorTop = floorNav.find(".main-sidebar-floor-nav-top");
				var floorAllBtn = floorNav.find(".main-sidebar-floor-nav-all");
				var floorNavList = floorNav.find(".main-sidebar-floor-list");
				var isHiddenFloorNav = false;
				var isDisabledFloorNav = false;
				var floorListTopBtn, floorListBottomBtn;

				//Top Navigation
				var topNav = mainHeader.find(".main-top-nav");
				var topNavError = topNav.find(".main-top-nav-alarm.error");
				var topNavWarning = topNav.find(".main-top-nav-alarm.warning");
				var topNavUser = topNav.find(".main-top-nav-user-icon");
				var topNavNotiListTemplate = topNav.find(".main-top-nav-alarm-tooltip");
				var topNavUserTooltipTemplate = topNav.find(".main-top-nav-user-tooltip");
				var notiToastTemplate = topNav.find(".main-top-nav-noti-toast-template");
				var notiListPopup;
				var notiToast, toastElem = topNav.find(".main-top-nav-noti");
				var ruleToast, ruleToastElem = topNav.find('.main-top-nav-noti-rule');
				var ruleToastTemplate = topNav.find('.main-top-nav-noti-rule-toast-template');
				var webSocketAlarmList = [];

				//Menu Info
				var activeMenu, activeMenuName, activeSubMenu, activeSubMenuName;
				var currentLocale = "en";

				//My Profile
				var myProfileModule;

				//Alarm List For Floor
				var isClick = false;
				var isMoveAllFloor = true;


			   /**
				*
				* main 모듈을 초기화한다.
				*
				* @function init
				* @returns {void}
				* @alias module:main
				*/
				var init = function(){
					GlobalSettings.loadSettings().done(function(){
						Util.getInstalledTypesFromServer().always(function(){
							I18N = window.I18N;
							currentLocale = GlobalSettings.getLocale();
							_setI18NString();
							attachXssFilter();
							getMenuInfo();
							initComponent();
							initTopNav().always(function(){
								initWebSocket();
								initFloor().always(function(){
									initSidebar();
									initCoreModule(activeMenuName);
									initModule(activeMenuName, activeSubMenuName);
									initProfileDialog();
								});
							});
						});
					}).fail(function(xhq, status, e){
						msgDialogElem.kendoCommonDialog({
							message : "[" + status + "]Failed to load setings.json\n" + e,
							visible : true
						});
					});
				};

				var _setI18NString = function(){
					MSG_MAIN_SIGNOUT_CONFIRM = I18N.prop("COMMON_MAIN_SIGNOUT_CONFIRM");
					//FLOOR_NAV_BUILDING_TOTAL = I18N.prop("COMMON_FLOOR_NAV_TOTAL");
					//FLOOR_NAV_FLOOR_ALL = I18N.prop("COMMON_FLOOR_NAV_ALL");
				};

			   /*XSS 필터 이벤트를 Attach 한다.*/
			   /**
				*
				*   <ul>
				*   <li>Document <body>의 모든 입력 필드에 XssFilter를 적용한다.</li>
				*   </ul>
				*   @function attachXssFilter
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var attachXssFilter = function(){
					$("body").on("change", "input.k-input, input[type=text], input[type=password], textarea", function(){
						var self = $(this);
						var value = self.val();
						var filteredValue = xssFilter.filter(value);
						if(value != filteredValue){
							self.val(filteredValue);
						}
					});
				};

			   /**
				*
				*   <ul>
				*   <li>특정 URL로 접속한 현재 페이지의 메뉴 정보를 가져온다.</li>
				*   <li>현재 페이지가 하위 탭 메뉴로 구성되어있을 경우, 하위 Tab 메뉴의 활성화 여부를 window.MENU_TABS_ENABLED 객체에 저장한다.</li>
				*   </ul>
				*   @function getMenuInfo
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var getMenuInfo = function(){
					var urlParsedMenu = getActiveMenuFromURL();

					activeMenu = getActiveMenu();
					activeMenuName = activeMenu.data("name");

					//this is hidden menu.
					if(!activeMenuName){
						activeMenuName = urlParsedMenu.menuName;
					}

					curMenuConfig = menuConfig[activeMenuName];
					if(curMenuConfig.subMenu){
						activeSubMenu = activeMenu.find(".main-sidebar-sub-menu-item.active");
						activeSubMenuName = activeSubMenu.data("name");
						if(!activeSubMenuName){
							activeSubMenuName = urlParsedMenu.subMenuName;
						}
						curMenuConfig = curMenuConfig.subMenu[activeSubMenuName];
					}

					//Tab Menu
					window.MENU_TABS_ENABLED = {};

					if(curMenuConfig && curMenuConfig.tabs){
						var i, max, name, enabled;
						var tabs = curMenuConfig.tabs;
						max = tabs.length;
						for( i = 0; i < max; i++){
							name = tabs[i].name;
							enabled = tabs[i].enabled;
							window.MENU_TABS_ENABLED[name] = enabled;
						}
					}
				};

			   /**
				*
				*   <ul>
				*   <li>Message, Confirm Dialog, Toast(알람 노티 팝업) 등의 UI Component를 초기화한다.</li>
				*   <li>My Profile (app/profile) 모듈을 불러온다.</li>
				*   </ul>
				*   @function initComponent
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var initComponent = function(){
					msgDialogElem.kendoCommonDialog();
					msgDialog = msgDialogElem.data("kendoCommonDialog");
					//SignOut Confirm Dialog
					confirmDialogElem.kendoCommonDialog({
						type: "confirm",
						confirmActions : {
							yes : logout
						}
					});
					confirmDialog = confirmDialogElem.data("kendoCommonDialog");
					toastElem.kendoMainToast({
						templates : [
							{
								type : "mainNoti",
								template : notiToastTemplate.html()
							}
						]/*,
						position : {
							pinned : true
						}*/
					});
					notiToast = toastElem.data("kendoMainToast");
					ruleToast = ruleToastElem.kendoRuleToast({
						templates: [{
							type: 'ruleNoti',
							template: ruleToastTemplate.html()
						}]
					}).data('kendoRuleToast');

					ruleToast.bind('afterOpen', sendWebSocektMessage);
					ruleToast.bind('afterClose', sendWebSocektMessage);
				};

			  /**
			   *
			   *   <ul>
			   *   <li>Profile 다이얼로그를 초기화 하는 함수.</li>
			   *   </ul>
			   *   @function initProfileDialog
			   *   @returns {void} - 리턴 값 없음
			   *   @alias module:app/main
			   *
			   */
				var initProfileDialog = function() {
					require(["profile/profile"], function(profileModule){
						// console.log(profileModule);
						myProfileModule = profileModule;
						myProfileModule.init();
					});
				};
			   /**
				*
				*   <ul>
				*   <li>WebSocket 연결을 수행한다.</li>
				*   <li>WebSocket 응답 콜백을 등록한다.</li>
				*   <li>응답 콜백에서는 Websocket으로부터 수신된 메시지를 파싱하고, 메시징 따라 알람 카운트, 알람 노티, 강제 로그 아웃 등을 수행한다.</li>
				*   </ul>
				*   @function initWebSocket
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var initWebSocket = function(){
					webSocket.connect();
					webSocket.on("receive", function(resp){
						var type;
						if(resp){
							resp = $.extend({}, resp);
							type = resp.type;
							if(type == "Notification"){
								//강제 로그아웃 메시지
								if(resp.name == "ForcedLogout"){
									msgDialog.message(I18N.prop("COMMON_FORCE_LOGOUT"));
									msgDialog.open();
									msgDialog.setActions(0, {
										action : function(e){
											//Session.clearSession();
											goToMenu(SIGNIN_MENU_KEY);
										}
									});
									setTimeout(function(){
										//Session.clearSession();
										goToMenu(SIGNIN_MENU_KEY);
									}, 5000);
									return;
								}
							}
							Util.setAlarmData(resp);
							if(type != "Request"){
								if(type == "Critical"){
									addErrorNoti(resp);
								}else if(type == "Warning"){
									addWarningNoti(resp);
								}
							}
						}
					});
				};

			   /**
				*
				*   <ul>
				*   <li>상단 GNB의 에러/경고 팝업 UI Component를 초기화한다.</li>
				*   <li>API(/alarms/statisticView)를 호출하여 Alarm 카운트 및 알람 정보 리스트를 Set한다. </li>
				*   <li>상단 GNB의 사용자 아이콘 클릭 시, 툴팁 UI Component를 초기화한다.</li>
				*   </ul>
				*   @function initTopNav
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var initTopNav = function(){
					topNav.kendoMainNavTooltip({
						filter: "span.main-top-nav-alarm",
						content: kendo.template(topNavNotiListTemplate.html()),
						width: 374,
						height : 393,
						showOn : "click",
						autoHide : false,
						animation : false,
						position: "bottom"
					});

					topNavUser.kendoMainNavTooltip({
						content: kendo.template(topNavUserTooltipTemplate.html()),
						showOn : "click",
						width : 200,
						autoHide : false,
						animation : false,
						popupCss : {
							"margin-top" : 9
						},
						position: "bottom",
						events : {
							myProfile : myProfile,
							signOut : signOut
						}
					});
					topNavUser.data('kendoMainNavTooltip').show();
					topNavUser.data('kendoMainNavTooltip').hide();
					topNavUser.data('kendoMainNavTooltip').popup.wrapper.addClass('tooltip-top-nav-user');

					notiListPopup = topNav.data("kendoMainNavTooltip");

					return getAlarmList().done(function(alarmData){
						var errorNotiList = alarmData.criticalAlarms;
						var errorNum = alarmData.criticalNum;
						var warningNotiList = alarmData.warningAlarms;
						var warningNum = alarmData.warningNum;

						setErrorNotiNum(errorNum);
						notiListPopup.setErrorList(errorNotiList);
						setWarningNotiNum(warningNum);
						notiListPopup.setWarningList(warningNotiList);
					});
				};

			   /**
				*
				*   <ul>
				*   <li>좌측 FNB의 알람 상태를 업데이트한다. 층별 에러/경고 등의 아이콘을 표시한다.</li>
				*   </ul>
				*   @function updateFloorAlarm
				*   @param {Object} alarmData - 알람 정보 객체
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var updateFloorAlarm = function(alarmData){
					var buildingId = alarmData.foundation_space_buildings_id,
						floorId = alarmData.foundation_space_floors_id,
						alarmType = alarmData.type,
						messageType = alarmData.messageType;

					var currentFloor = getCurrentFloor();
					var building = currentFloor.building;
					var curBuildingId = building.id;

					//현재 선택한 빌딩일 경우 업데이트
					if(curBuildingId != buildingId){
						return;
					}
					if(floorId){
						var a = floorNavList.find(".main-sidebar-floor-num[data-id='" + floorId + "']");
						var warningNum = a.attr("data-warning");
						warningNum = (!warningNum  || warningNum == "undefined") ? 0 : Number(warningNum);
						var criticalNum = a.attr("data-critical");
						criticalNum = (!criticalNum || criticalNum == "undefined") ? 0 : Number(criticalNum);

						var icon = a.siblings("i");
						if(messageType == "REGISTRATION"){
							if(alarmType == "critical"){
								criticalNum++;
								a.attr("data-critical", criticalNum);
							}else if(alarmType == "warning"){
								warningNum++;
								a.attr("data-warning", warningNum);
							}
						}else if(messageType == "CANCELLATION"){
							if(alarmType == "critical"){
								criticalNum--;
								a.attr("data-critical", criticalNum);
							}else if(alarmType == "warning"){
								warningNum--;
								a.attr("data-warning", warningNum);
							}
						}

						//Critical Alarm을 우선순위로 표시한다.
						if(criticalNum > 0){
							icon.removeClass("warning");
							icon.addClass("main-sidebar-floor-alarm critical");
						}else if(warningNum > 0){
							icon.removeClass("critical");
							icon.addClass("main-sidebar-floor-alarm warning");
						}else{
							icon.removeClass("main-sidebar-floor-alarm");
							icon.removeClass("critical");
							icon.removeClass("warning");
						}
					}
				};

			   /**
				*
				*   <ul>
				*   <li>상단 GNB의 에러 개수를 절정한다.</li>
				*   </ul>
				*   @function setErrorNotiNum
				*   @param {Number} num - 설정할 에러 개수
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var setErrorNotiNum = function(num){
					/*if(num > 999){
						num = "999+";
					}*/
					topNavError.text(num);
				};

			   /**
				*
				*   <ul>
				*   <li>서버로부터 Alarm(에러/경고) 리스트와 개 수 정보를 가져온다. (/alarm/statisticView)</li>
				*   </ul>
				*   @function getAlarmList
				*   @returns {jQuery.Deferred} - jQuery.Deferred 객체
				*   @alias module:app/main
				*
				*/
				var getAlarmList = function(){
					return $.ajax({
						url : "/alarms/statisticView",
						pagenation : false,
						data : { size : 50 }
					}).then(function(resp){
						var criticalAlarms = resp.unresolvedCriticalAlarms;
						var criticalNum = resp.numberOfUnresolvedCriticalAlarms;
						var warningAlarms = resp.unresolvedWarningAlarms;
						var warningNum = resp.numberOfUnresolvedWarningAlarms;

						return { criticalAlarms : criticalAlarms, criticalNum : criticalNum,
							warningAlarms : warningAlarms, warningNum : warningNum };
					});
				};

				//stub code
				//deprecated
				// var getErrorNotiList = function(){
				//     return $.ajax({
				//         url : "/alarms/statisticView",
				//         pagenation : false,
				//         data : { size : 50 }
				//     }).then(function(data){
				//         var alarms = data.unresolvedCriticalAlarms;
				//         var num = data.numberOfUnresolvedCriticalAlarms;
				//         return { alarms : alarms, num : num };
				//     });
				// };

			   /**
				*
				*   <ul>
				*   <li>상단 GNB의 경고 개수를 절정한다.</li>
				*   </ul>
				*   @function setWarningNotiNum
				*   @param {Number} num - 설정할 경고 개수
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var setWarningNotiNum = function(num){
					/*if(num > 999){
						num = "999+";
					}*/
					topNavWarning.text(num);
				};

				//deprecated
				// var getWarningNotiList = function(){
				//     return $.ajax({
				//         url : "/alarms/statisticView",
				//         pagenation : false,
				//         data : { size : 50 }
				//         //&types=Warning
				//     }).then(function(data){
				//         var alarms = data.unresolvedWarningAlarms;
				//         var num = data.numberOfUnresolvedWarningAlarms;
				//         return { alarms : alarms, num : num};
				//     });
				// };

			   /**
				*
				*   <ul>
				*   <li>Websoket으로 수신된 알람(에러)의 개수를 업데이트하고, 관련 정보의 노티를 팝업시킨다.</li>
				*   </ul>
				*   @function addErrorNoti
				*   @param {Object} resp - 알람 정보 객체
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var addErrorNoti = function(resp){
					var isRule = resp.isRule;
					var code = resp.code;
					var size = topNavError.text();
					size = size.replace("+", "");
					size = Number(size);
					if(resp.messageType == "REGISTRATION"){
						if(notiListPopup.addError(resp)){
							size = size + 1;
						}
					}else if(resp.messageType == "CANCELLATION"){
						if(notiListPopup.removeError(resp)){
							size = size - 1;
						}
					}

					setErrorNotiNum(size);
					resp.type = "critical";

					// 알람 코드 Sys_5001인 경우도 룰 알람팝업 적용
					if(code == 'Sys_5001'){
						isRule = true;
					}

					if(resp.messageType == "REGISTRATION"){
						if(isRule){
							if (resp.eventTime) {
								resp.eventTime = moment(resp.eventTime).format('YYYY-MM-DD HH:mm');
							}
							ruleToast.show(resp, 'ruleNoti');
						}else{
							notiToast.show(resp, "mainNoti");
						}
					}else if(resp.messageType == "CANCELLATION"){
						if(isRule){
							ruleToast.closePopup(resp);
						}
					}
					updateFloorAlarm(resp);
				};

			   /**
				*
				*   <ul>
				*   <li>Websoket으로 수신된 알람(경고)의 개수를 업데이트하고, 관련 정보의 노티를 팝업시킨다.</li>
				*   </ul>
				*   @function addWarningNoti
				*   @param {Object} resp - 알람 정보 객체
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var addWarningNoti = function(resp){
					var isRule = resp.isRule;
					var code = resp.code;
					var size = topNavWarning.text();
					size = size.replace("+", "");
					size = Number(size);
					if(resp.messageType == "REGISTRATION"){
						if(notiListPopup.addWarning(resp)){
							size = size + 1;
						}
					}else if(resp.messageType == "CANCELLATION"){
						if(notiListPopup.removeWarning(resp)){
							size = size - 1;
						}
					}

					setWarningNotiNum(size);
					resp.type = "warning";

					// 알람 코드 Sys_5001인 경우도 룰 알람팝업 적용
					if(code == 'Sys_5001'){
						isRule = true;
					}

					if(resp.messageType == "REGISTRATION"){
						if(isRule){
							if (resp.eventTime) {
								resp.eventTime = moment(resp.eventTime).format('YYYY-MM-DD HH:mm');
							}
							ruleToast.show(resp, 'ruleNoti');
						}else{
							notiToast.show(resp, "mainNoti");
						}
					}else if(resp.messageType == "CANCELLATION"){
						if(isRule){
							ruleToast.closePopup(resp);
						}
					}

					updateFloorAlarm(resp);
				};

				// Rule & 접속끊김 알람발생 시 WebSocekt을 통해 메시지 전송
				var sendWebSocektMessage = function(e){
					var isOpen = e.isOpen;
					var content = e.data;
					var alarmList = webSocketAlarmList, listItem = null;
					var itv = {};
					var popUpOpenElapsedTime = 0;
					var sendObj = {};

					if(isOpen){ // 팝업창 표시 경우
						// 최초 생성시 전송
						sendObj = {
							id: content.alarmUuid,
							access_token: window.Session.getAuthToken(),
							alarms_name: content.code,
							dms_devices_id: content.deviceId,
							popUpOpenElapsedTime: popUpOpenElapsedTime
						};
						webSocket.send(sendObj);

						// 주기적 웹소캣 메시지 전송
						itv.alarmUuid = content.alarmUuid;
						itv.intervalItem = setInterval(function(){
							popUpOpenElapsedTime += 3;
							sendObj.popUpOpenElapsedTime = popUpOpenElapsedTime;
							webSocket.send(sendObj);
						}, 3000);
						alarmList.push(itv);
					}else{ // 팝업창 비활성화
						sendObj = {
							id: content.alarmUuid,
							access_token: window.Session.getAuthToken(),
							alarms_name: content.code,
							dms_devices_id: content.deviceId,
							popUpOpenElapsedTime: -1
						};
						webSocket.send(sendObj);

						// 팝업창 비활성화 이후 주기적 전송 콜백 해제
						for(var i = alarmList.length - 1; i >= 0; i--){
							listItem = alarmList[i];
							if(listItem.alarmUuid == content.alarmUuid){
								clearInterval(listItem.intervalItem);
								listItem = null;
								alarmList.splice(i, 1);
								break;
							}
						}
					}
				};

			   /**
				*
				*   <ul>
				*   <li>서버로부터 건물 정보를 가져온다(/foundation/space/buildings)</li>
				*   </ul>
				*   @function getBuildingList
				*   @returns {jQuery.Deferred} - jQuery.Deferred 객체
				*   @alias module:app/main
				*
				*/
				var getBuildingList = function(){
					return $.ajax({
						url : "/foundation/space/buildings"
					});
				};

			   /**
				*
				*   <ul>
				*   <li>서버로부터 층 정보를 가져온다(/foundation/space/floors)</li>
				*   </ul>
				*   @function getFloorList
				*   @param {Number|String} buildingId - 층 정보 리스트를 가져올 건물(빌딩)의 ID 값
				*   @returns {jQuery.Deferred} - jQuery.Deferred 객체
				*   @alias module:app/main
				*
				*/
				var getFloorList = function(buildingId){
					// buildingId = buildingId == 0 ? 0 : buildingId;
					if(buildingId == 0){
						var dfd = new $.Deferred();
						dfd.resolve([]);
						return dfd.promise();
					}
					return $.ajax({
						url : "/foundation/space/floors",
						data : {
							foundation_space_buildings_id : buildingId
						}
					});
				};

			   /**
				*
				*   <ul>
				*   <li>빌딩 정보 리스트로 FNB의 층 선택 드롭다운리스트를 초기화하거나, 빌딩 정보 Data를 새롭게 Set 한다.</li>
				*   <li>빌딩 개수에 따라 FNB UI에 대한 처리를 한다.</li>
				*   </ul>
				*   @function renderBuildingList
				*   @param {Array} resp - 빌딩 정보 객체 리스트
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var renderBuildingList = function(resp){
					var isSingleBuilding = false;
					var length = resp.length;

					//Singlie Building Mode 제거 2017.4.27 (0개 일때 DropDownList Hide)
					if(length >= 1){
						resp.sort(function(a, b){
							return a.sortOrder - b.sortOrder;
						});
						resp.unshift({
							name : FLOOR_NAV_BUILDING_TOTAL,
							id : 0
						});
						length = resp.length;
					}else{
						isSingleBuilding = true;
					}

					for(var i = 0; i < length; i++){
						resp[i]["isDisabled"] = false;
					}

					var dropDownList = floorBuildingCombo.data("kendoDropDownList");
					if(dropDownList){
						var dataSource = new kendo.data.DataSource({
							data : resp
						});
						dropDownList.setDataSource(dataSource);
						dropDownList.value(FLOOR_NAV_BUILDING_TOTAL_ID);
						dropDownList.trigger("change");
					}else{
						/*var templateItem = '# if (isDisabled) { #<span class= "k-state-disabled">#: name #</span># } else { #<span class="">#: name #</span>#} #';*/
						dropDownList = floorBuildingCombo.kendoDropDownList({
							animation : false,
							height: 363,
							dataTextField: "name",
							dataValueField: "id",
							dataSource : resp,
							popupClass : "main-building-select-container-wrapper",
							select: function(e){
								if(e.dataItem.isDisabled){
									e.preventDefault();
								}
							},
							//template: kendo.template(templateItem)
							valueTemplate : function(item){
								var text = item.name;
								var id = item.id;
								if(currentLocale != "en" && id == FLOOR_NAV_BUILDING_TOTAL_ID){
									text = I18N.prop("COMMON_FLOOR_NAV_TOTAL");
								}
								return "<span>" + text + "</span>";
							},
							template : function(item){
								var text = item.name;
								var id = item.id;
								if(currentLocale != "en" && id == FLOOR_NAV_BUILDING_TOTAL_ID){
									text = I18N.prop("COMMON_FLOOR_NAV_TOTAL");
								}
								var disabled = item.isDisabled;
								var disabledCss = disabled ? "k-state-disabled" : "";
								return "<span class='" + disabledCss + "'>" + Util.decodeHtml(text) + "</span>";
							}
						}).data("kendoDropDownList");
						//to ignore common dropdownlist style
						dropDownList.popup.element.addClass("main-building-select-container");
					}

					if(isSingleBuilding){
						floorBuildingCombo.data("kendoDropDownList").wrapper.hide();
						floorTop.css("height", 80);
					}else{
						floorBuildingCombo.data("kendoDropDownList").wrapper.show();
						floorTop.css("height", 80);
					}
				};

					/**
				*
				*   <ul>
				*   <li>층 정보 리스트를 새롭게 Set 한다.</li>
				*   </ul>
				*   @function setFloorList
				*   @param {Array} list - 층 정보 객체 리스트
				*   @returns {jQuery.Deferred} - jQuery.Deferred 객체
				*   @alias module:app/main
				*
				*/
				var setFloorList = function(list){
					var currentFloor = getCurrentFloor();
					renderFloorList(list, currentFloor);
					floorAllBtn.trigger("click");
				};

					/**
				*
				*   <ul>
				*   <li>현재 FNB에 그려진 층 정보를 리스트로 반환한다.</li>
				*   </ul>
				*   @function getCurrentFloorList
				*   @returns {Array} - 층 정보 리스트
				*   @alias module:app/main
				*
				*/
				var getCurrentFloorList = function(){
					var floorList = [];
					floorNavList.find(".main-sidebar-floor-num-li").each(function(){
						var a = $(this).find("a");
						var obj = {
							id : a.data("id"),
							value : a.data("value"),
							type : a.data("type")
						};
							//sort order 대로 정렬된 대로 array 생성
						floorList.unshift(obj);
					});
					return floorList;
				};

					/**
				*
				*   <ul>
				*   <li>현재 그려진 FNB에 특정 층 정보를 추가한다.</li>
				*   </ul>
				*   @function addFloor
				*   @param {Object} info - 층 정보 객체
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var addFloor = function(info){
					//info = { id : "", value"" }
					var li, a, icon, text;
					li = $("<li/>").addClass("main-sidebar-floor-num-li");
					a = $("<a/>").addClass("main-sidebar-floor-num");
					a.attr({
						"data-id" : info.id,
						"data-value" : info.value,
						"data-type" : info.type
					});
					if(info.type == "F"){
						text = info.value + info.type;
					}else if(info.type == "B"){
						text = info.type + info.value;
					}else{
						text = info.value;
					}
					a.text(text);
					a.appendTo(li);
					icon = $("<i/>").addClass("main-sidebar-floor-alarm " + info.alarmType);
					icon.appendTo(li);

					var scrollableList = floorNavList.find(".mCSB_container");
					if(scrollableList.length > 0){
						scrollableList.prepend(li);
					}else{
						floorNavList.prepend(li);
					}
				};

					/**
				*
				*   <ul>
				*   <li>현재 그려진 FNB에 특정 층 정보를 삭제한다.</li>
				*   </ul>
				*   @function removeFloor
				*   @param {String|Number} id - 특정 층의 ID 값
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var removeFloor = function(id){
					var floor = findFloor(id);
					if(floor){
						floor.remove();
					}
				};

			   /**
				*
				*   <ul>
				*   <li>현재 그려진 FNB에 특정 층 정보를 수정한다.</li>
				*   </ul>
				*   @function editFloor
				*   @param {String|Number} id - 특정 층의 ID 값
				*   @param {String} value - 특정 층의 이름 값
				*   @param {alarmType} alarmType - 특정 층의 알람 타입 값 {"critical", "warning"}
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var editFloor = function(id, value, alarmType){
					var floor = findFloor(id), a;
					if(floor){
						if(value){
							a = floor.find(".main-sidebar-floor-num");
							a.attr("data-value", value);
							a.text(Util.sliceNum(value) + "F");
						}

						if(alarmType){
							floor.find(".main-sidebar-floor-alarm");
							floor.removeClass("warning");
							floor.removeClass("critical");
							floor.addClass(alarmType);
						}
					}
				};

			   /**
				*
				*   <ul>
				*   <li>현재 그려진 FNB에 특정 층 정보를 가져온한다.</li>
				*   </ul>
				*   @function findFloor
				*   @param {String|Number} id - 특정 층의 ID 값
				*   @returns {jQueryElem} - FNB 내 특정 층의 요소
				*   @alias module:app/main
				*
				*/
				var findFloor = function(id){
					var floorElem;
					var scrollableList = floorNavList.find(".mCSB_container");
					if(scrollableList.length > 0){
						floorElem = scrollableList.find(".main-sidebar-floor-num[data-id='" + id + "']");
					}else{
						floorElem = floorNavList.find(".main-sidebar-floor-num[data-id='" + id + "']");
					}
					if(floorElem.length < 1){
						console.error("there is no floor is " + id);
						return null;
					}

					floorElem = floorElem.closest(".main-sidebar-floor-num-li");
					return floorElem;
				};

			   /**
				*
				*   <ul>
				*   <li>서버로부터 응답된 빌딩 정보 리스트를 FNB에 렌더링한다.</li>
				*   </ul>
				*   @function setBuildingList
				*   @param {Array} list - 빌딩 정보 객체 리스트
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var setBuildingList = function(list){
					//list = [{ id : "", value : "" }, ...]
					renderBuildingList(list);
				};

			   /**
				*
				*   <ul>
				*   <li>현재 빌딩 정보 리스트를 FNB의 DropDownList에서 가져온다. (Total은 제외.)</li>
				*   </ul>
				*
				*   @function getCurrentBuildingList
				*   @returns {Array} - 건물 정보 리스트
				*   @alias module:app/main
				*
				*/
				var getCurrentBuildingList = function(){
					var dropDownList = floorBuildingCombo.data("kendoDropDownList");
					if(!dropDownList){
						return [];
					}
					var dataArr = dropDownList.dataSource.data();
					//remove total
					dataArr = dataArr.slice(1, dataArr.length);
					return dataArr;
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 DropDownList에 빌딩 정보를 추가한다.</li>
				*   </ul>
				*
				*   @function getCurrentBuildingList
				*   @returns {void} - 리턴 값 없음
				*   @param {Object} info - 빌딩 정보 객체
				*   @alias module:app/main
				*
				*/
				var addBuilding = function(info){
					//info = { id : "", value : "" }
					var dropDownList = floorBuildingCombo.data("kendoDropDownList");
					dropDownList.dataSource.add(info);
					//dropDownList.trigger("change");
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 DropDownList에 특정 빌딩 정보를 삭제한다.</li>
				*   </ul>
				*
				*   @function removeBuilding
				*   @returns {void} - 리턴 값 없음
				*   @param {String|Number} id - 빌딩 정보 ID 값
				*   @alias module:app/main
				*
				*/
				var removeBuilding = function(id){
					var dropDownList = floorBuildingCombo.data("kendoDropDownList");
					var findData = dropDownList.dataSource.get(id);
					if(!data){
						console.error("there is no building is " + id);
						return;
					}
					//selected item
					var selectedData = dropDownList.dataItem();
					dropDownList.dataSource.remove(findData);
					if(findData === selectedData){
						dropDownList.select(0);
						dropDownList.trigger("change");
					}
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 DropDownList에 특정 빌딩 정보의 층 이름을 수정한다.</li>
				*   </ul>
				*
				*   @function removeBuilding
				*   @returns {void} - 리턴 값 없음
				*   @param {String|Number} id - 수정할 빌딩 정보 ID 값
				*   @param {String} value - 수정할 층 이름
				*   @alias module:app/main
				*
				*/
				var editBuilding = function(id, value){
					var dropDownList = floorBuildingCombo.data("kendoDropDownList");
					var findData = dropDownList.dataSource.get(id);
					if(!data){
						console.error("there is no building is " + id);
						return;
					}
					findData.set("name", value);
					//dropDownList.trigger("change");
				};

			   /**
				*
				*   <ul>
				*   <li>서버로부터 응답된 층 정보 리스트를 FNB에 렌더링한다.</li>
				*   </ul>
				*   @function renderFloorList
				*   @param {Array} floorList - 층 정보 객체 리스트
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var renderFloorList = function(floorList){
					var i, max = floorList.length;
					var floor, li, a, icon, fragment = $("<div/>");

					//sort floor data for sort order
					floorList.sort(function(prev, next){
						return prev.sortOrder - next.sortOrder;
					});
					var text;
					var alarms;
					for( i = 0; i < max; i++ ){
						floor = floorList[i];
						li = $("<li/>").addClass("main-sidebar-floor-num-li");
						a = $("<a/>").addClass("main-sidebar-floor-num");

						alarms = floor.alarms;
						if(alarms){
							floor.criticalNum = alarms.numberOfCriticalDevices;
							floor.warningNum = alarms.numberOfWarningDevices;
							//Critical을 우선으로 표시한다.
							if(alarms.numberOfCriticalDevices > 0){
								floor.alarmType = "critical";
							}else if(alarms.numberOfWarningDevices > 0){
								floor.alarmType = "warning";
							}
						}

						a.attr({
							"data-id" : floor.id,
							"data-value" : floor.name,
							"data-type" : floor.type,
							"data-warning" : floor.warningNum,
							"data-critical" : floor.criticalNum
						});

						if(floor.type == "F"){
							text = floor.name + floor.type;
						}else if(floor.type == "B"){
							text = floor.type + floor.name;
						}else{
							text = floor.name;
						}
						a.text(text);
						a.appendTo(li);
						icon = $("<i/>");

						if(floor.alarmType){
							icon.addClass("main-sidebar-floor-alarm " + floor.alarmType);
						}

						icon.appendTo(li);
						fragment.append(li);
					}

					var scrollableList = floorNavList.find(".mCSB_container");
					if(scrollableList.length > 0){
						scrollableList.html(fragment.html());
					}else{
						floorNavList.html(fragment.html());
					}

					return true;
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 건물 정보 리스트를 서버로부터 받아와 재렌더링(Refresh)한다.</li>
				*   </ul>
				*   @function refreshBuildingList
				*   @returns {jQuery.Deferred} - jQuery.Deferred
				*   @alias module:app/main
				*
				*/
				var refreshBuildingList = function(){
					var dfd = new $.Deferred();
					getBuildingList().done(function(resp){
						renderBuildingList(resp);
						dfd.resolve();
					}).fail(function(){
						dfd.reject();
					});

					return dfd.promise();
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 층 정보 리스트를 서버로부터 받아와 재렌더링(Refresh)한다.</li>
				*   </ul>
				*   @function refreshFloorList
				*   @returns {jQuery.Deferred} - jQuery.Deferred
				*   @alias module:app/main
				*
				*/
				var refreshFloorList = function(){
					var dfd = new $.Deferred();
					var currentFloor =  getCurrentFloor();
					getFloorList(currentFloor.building.id).done(function(resp){
						renderFloorList(resp, currentFloor.building);
						dfd.resolve();
					}).fail(function(){
						dfd.reject();
					});
					return dfd.promise();
				};

			   /**
				*
				*   <ul>
				*   <li>FNB를 초기화한다.</li>
				*   <li>메뉴 정보에 따라 FNB를 Hide 하거나 disable 한다.</li>
				*   <li>건물 및 층 정보 리스트를 서버로부터 가져와 렌더링 한다.</li>
				*   <li>Local Storage에 저장된 건물/층 선택 정보에 따라 건물/층을 선택한다. (Default는 Total)</li>
				*   <li>단위 기능에 Observer 모듈을 통해 현재 선택한 건물/층 정보를 Publish 한다.</li>
				*   <li>FNB의 스크롤 동작을 초기화한다.</li>
				*   </ul>
				*   @function initFloor
				*   @returns {jQuery.Deferred} - jQuery.Deferred
				*   @alias module:app/main
				*
				*/
				var initFloor = function(){
					var dfd = new $.Deferred();

					if(isFloorNavHide()){
						isHiddenFloorNav = true;
						dfd.resolve();
						return dfd.promise();
					}

					if(isFloorNavDisabled()){
						isDisabledFloorNav = true;
					}

					getBuildingList().done(function(resp){
						renderBuildingList(resp);
						if(!resp || resp.length < 1){
							//msgDialog.message(MSG_NO_SPACE);
							//msgDialog.open();
						}
						var floor, building, li;

						//get current floor data in local storage or null
						curFloor = getCurrentFloor();

						if(curFloor){
							floor = curFloor.floor;
							building = curFloor.building;
						}

						if(building){
							floorBuildingCombo.data("kendoDropDownList").select(function(dataItem){
								return dataItem.id == building.id;
							});
						}else{
							//default building value.
							building = {};
							var dataItem = floorBuildingCombo.data("kendoDropDownList").dataItem();
							if(dataItem){
								building.id = dataItem.id;
								building.value = dataItem.name;
							}else{
								building.id = FLOOR_NAV_BUILDING_TOTAL_ID;
								building.value = FLOOR_NAV_BUILDING_TOTAL;
							}
						}

						getFloorList(building.id).done(function(floorData){
							if((!floorData || floorData.length < 1) && building.id != 0){
								//msgDialog.message(MSG_NO_FLOOR);
								//msgDialog.open();
								disableFloorList(true);
							}

							renderFloorList(floorData, building);
							if(floor && floor.id){
								if(floor.id == FLOOR_NAV_FLOOR_ALL_ID){
									li = floorAllBtn;
								}else{
									li = floorNavList.find("a.main-sidebar-floor-num[data-id='" + floor.id + "']")
										.closest("li.main-sidebar-floor-num-li");
								}
								floorNavSelect(li);
							}else{
								//default floor value
								curFloor = floorNavSelect(floorAllBtn);
								setCurrentFloor(curFloor);
							}

							floorBuildingCombo.data("kendoDropDownList").bind("open", function(e){
								isMoveAllFloor = true;
								isClick = "open";
							});

							floorBuildingCombo.data("kendoDropDownList").bind("change", selectBuildingEvt);

							floorNavList.mCustomScrollbar({
								scrollButtons:{enable:true,scrollType:"stepped"},
								snapAmount:250,
								mouseWheel: {
									enable : true,
									scrollAmount : 250
								},
								scrollbarPosition:"outside",
								callbacks : {
									onCreate : function(){
										floorListTopBtn = floorNavList.find(".mCSB_buttonUp");
										floorListBottomBtn = floorNavList.find(".mCSB_buttonDown");
									},
									onInit : function(){
										disableFloorListBtn(true, true);
									},
									onTotalScroll : function(){
										//console.info("on total scroll");
										//bottom
										disableFloorListBtn(true);
									},
									onTotalScrollBack : function(){
										//console.info("on total scrollback");
										//top
										disableFloorListBtn(true, true);
									},
									onScroll : function(){
										//console.info("on scroll");
										disableFloorListBtn(false);
									},
									onOverflowYNone : function(){
										//floorNavList.mCustomScrollbar("disable", true);
										disableFloorListBtn(true);
										disableFloorListBtn(true, true);
									},
									onOverflowY:function(){
										disableFloorListBtn(false);
										//floorNavList.mCustomScrollbar("update");
									}
								}
							});

							floorNav.on("click", ".main-sidebar-floor-num-li", floorNavEvt);
							floorAllBtn.on("click", floorNavEvt);

							if(isDisabledFloorNav){
								disableFloorNav(true);
								curFloor = null;
							}

							if(building.id == FLOOR_NAV_BUILDING_TOTAL_ID
							   && building.value == FLOOR_NAV_BUILDING_TOTAL){
								disableFloorList(true);
								disableFloorAllBtn(true);
							}
							dfd.resolve();
						}).fail(function(xhq){
							hideFloorNav(true);
							ajaxFailCallback(xhq, dfd);
						});
					}).fail(function(xhq){
						hideFloorNav(true);
						ajaxFailCallback(xhq, dfd);
					});
					return dfd.promise();
				};

				var moveScrollToActiveFloor = function(){
					var floors = floorNavList.find('.main-sidebar-floor-num-li');
					var activeFloor = floorNavList.find('.main-sidebar-floor-num-li.active');
					var idx = floors.index(activeFloor);
					var p = -1 * $(".main-sidebar-floor-list").find('.main-sidebar-floor-num-li.active').outerHeight() * idx + 100;
					var opts = {scrollInertia:0};
					// var scrollContainer = floorNavList.find('.mCSB_container');
					if(activeFloor.length > 0){
						floorNavList.mCustomScrollbar('scrollTo', p, opts);
						setTimeout(function(){
							// scrollContainer.css('top', -1 * (activeFloor.offset().top - 81));
							floorNavList.mCustomScrollbar('scrollTo', p, opts);
						}, 10);
					}
				};

				var ajaxFailCallback = function(xhq, dfd){
					var msg = "";
					if(xhq.responseText && xhq.responseText.indexOf("Permission") != -1){
						msg = I18N.prop("COMMON_NOT_AUTHORIZED");
					}else{
						msg = Util.parseFailResponse(xhq);
					}

					msgDialog.message(msg);
					msgDialog.open();

					if(dfd){
						dfd.reject();
					}
				};

			   /**
				*
				*   <ul>
				*   <li>현재 페이지에서 FNB가 Hidden 상태인지 체크한다.</li>
				*   </ul>
				*   @function isFloorNavHide
				*   @returns {Boolean} - Hidden 상태 여부
				*   @alias module:app/main
				*
				*/
				var isFloorNavHide = function(){
					return (isHiddenFloorNav || mainElem.hasClass("main-hide-floor-nav"));
				};

			   /**
				*
				*   <ul>
				*   <li>현재 페이지에서 FNB가 disable 상태인지 체크한다.</li>
				*   </ul>
				*   @function isFloorNavDisabled
				*   @returns {Boolean} - disable 상태 여부
				*   @alias module:app/main
				*
				*/
				var isFloorNavDisabled = function(){
					return (isDisabledFloorNav || curMenuConfig.isDisabledFloorNav);
				};

			   /**
				*
				*   <ul>
				*   <li>FNB를 숨기거나 표시한다.</li>
				*   </ul>
				*   @function hideFloorNav
				*   @param {Boolean} isHide - 숨김 여부
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var hideFloorNav = function(isHide){
					if(isHide){
						isHiddenFloorNav = true;
						mainElem.addClass("main-hide-floor-nav");
						floorNav.hide();
					}else{
						isHiddenFloorNav = false;
						mainElem.removeClass("main-hide-floor-nav");
						floorNav.show();
					}
				};

			   //Select Building Combobox Event
			   /**
				*
				*   <ul>
				*   <li>FNB의 건물 DropDownList에서 특정 건물을 선택했을 때, 호출되는 콜백 함수</li>
				*   <li>해당 건물의 층 리스트를 서버로부터 받아와 FNB에 다시 렌더링한다.</li>
				*   <li>현재 선택한 건물 및 층 정보를 localStorage에 저장한다.(Default 선택은 최상위 층)</li>
				*   <li>단위 기능에 Observer 모듈을 통해 현재 선택한 건물/층 정보를 Publish 한다.</li>
				*   </ul>
				*   @function selectBuldingEvt
				*   @param {Boolean} e - 빌딩 선택 이벤트 핸들러 호출 시 전달되는 이벤트 객체
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var selectBuildingEvt = function(e){
					//var val = this.value();
					//var text = this.text();
					var item = this.dataItem();
					var val, text, des, indexes, sortOrder;
					if(item){
						val = item.id;
						text = item.name;
						des = item.description;
						indexes = item.indexes;
						sortOrder = item.sortOrder;
					}else{
						val = FLOOR_NAV_BUILDING_TOTAL_ID;
						text = FLOOR_NAV_BUILDING_TOTAL;
					}

					if(val == FLOOR_NAV_BUILDING_TOTAL_ID){
						disableFloorList(true);
						disableFloorAllBtn(true);
						floorAllBtn.trigger("click");
						return false;
					}
					disableFloorList(false);

					getFloorList(val).done(function(floorData){
						renderFloorList(floorData, {id : val, name : text});
					}).fail(function(xhq){
						ajaxFailCallback(xhq);
					}).always(function(resp){
						//floorNavList.find("li.main-sidebar-floor-num-li:first-child").trigger("click");
						//선택에 따라 All Floor가 선택되는 경우도 있지만, 제일 상위 층을 선택하는 경우도 있다.

						if(resp.length){
							if(isMoveAllFloor) clickAllFloor();
							else clickTopFloor();
						}else{
							curFloor = {
								floor : {
									id : FLOOR_NAV_FLOOR_ALL_ID,
									value : FLOOR_NAV_FLOOR_ALL
								},
								building : {
									id : val,
									value : text,
									description: des,
									indexes: indexes,
									sortOrder: sortOrder
								}
							};

							setCurrentFloor(curFloor);
							publishFloorDataObserver(curFloor);
						}
					});
					e.preventDefault();
					return false;
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 층을 선택했을 경우에 호출되는 콜백 함수</li>
				*   <li>FNB에 선택한 층을 활성화 표시한다.</li>
				*   <li>현재 선택한 건물 및 층 정보를 localStorage에 저장한다.(Default 선택은 최상위 층)</li>
				*   <li>단위 기능에 Observer 모듈을 통해 현재 선택한 건물/층 정보를 Publish 한다.</li>
				*   </ul>
				*   @function selectBuldingEvt
				*   @param {Event} e - 층 선택 이벤트 핸들러 호출 시 전달되는 이벤트 객체
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
					//Floor Navigation Click Event
				var floorNavEvt = function(e){
					if(e.originalEvent || isClick === "open") isClick = true;
					else isClick = false;

					curFloor = floorNavSelect($(this));
					setCurrentFloor(curFloor);
					publishFloorData();
				};

			   /**
				*
				*   <ul>
				*   <li>서버로부터 현재 선택한 건물 및 층 정보를 가져온다.</li>
				*   <li>단위 기능에 Observer 모듈을 통해 현재 선택한 건물/층 정보를 Publish 한다.</li>
				*   </ul>
				*   @function publishFloorData
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var publishFloorData = function(){
					curFloor = getCurrentFloor();
					var hasRequest = false;
					if(curFloor.building.id != FLOOR_NAV_BUILDING_TOTAL_ID){
						hasRequest = true;
						Loading.open();
						//get current building data
						$.ajax({
							url : "/foundation/space/buildings/" + curFloor.building.id
						}).done(function(buildingData){
							curFloor.building = $.extend(curFloor.building, buildingData);
							if(curFloor.floor.id != FLOOR_NAV_FLOOR_ALL_ID){
								$.ajax({
									url : "/foundation/space/floors/" + curFloor.floor.id
								}).done(function(floorData){
									curFloor.floor = $.extend(curFloor.floor, floorData);
									if(curFloor.floor.imageFileName){
										$.ajax({
											url : "/foundation/space/floors/" + curFloor.floor.id + "/image",
											dataType : "binary"
										}).done(function(image){
											curFloor.floor.image = image;
											if(image){
												curFloor.floor.imageUrl = URL.createObjectURL(image);
												setFloorImageInfo(curFloor).always(function(){
													Loading.close();
													publishFloorDataObserver(curFloor);
												});
											}else{
												curFloor.floor.imageWidth = 0;
												curFloor.floor.imageHeight = 0;
												Loading.close();
												publishFloorDataObserver(curFloor);
											}
										}).fail(function(){
											curFloor.floor.image = null;
											curFloor.floor.imageWidth = 0;
											curFloor.floor.imageHeight = 0;
											Loading.close();
											publishFloorDataObserver(curFloor);
										});
									}else{
										Loading.close();
										publishFloorDataObserver(curFloor);
									}

								}).fail(function(){
									Loading.close();
									publishFloorDataObserver(curFloor);
								});
							}else{
								Loading.close();
								publishFloorDataObserver(curFloor);
							}
						}).fail(function(){
							Loading.close();
							publishFloorDataObserver(curFloor);
						});
					}

					if(!hasRequest){
						publishFloorDataObserver(curFloor);
					}
				};

				var setFloorImageInfo = function(floorInfo){
					var floor = floorInfo.floor, imgUrl = floor.imageUrl;
					var dfd = new $.Deferred();
					var image = new Image();
					image.src = imgUrl;
					image.onload = function(){
						floor.imageWidth = this.width;
						floor.imageHeight = this.height;
						dfd.resolve();
					};
					image.onerror = function(){
						floor.imageWidth = 0;
						floor.imageHeight = 0;
						dfd.reject();
					};
					return dfd.promise();
				};

			   /**
				*
				*   <ul>
				*   <li>단위 기능에 Observer 모듈을 통해 "onfloorchagne 이벤트 타입으로 현재 선택한 건물/층 정보를 Publish 한다.</li>
				*   </ul>
				*   @function publishFloorData
				*   @param {Object} floorData - 층 선택 이벤트 핸들러 호출 시 전달되는 이벤트 객체
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var publishFloorDataObserver = function(floorData){
					try{
						GlobalObserver.publish("onfloorchange", floorData);
					}catch(e){
						console.error(e);
					}
				};

				var clickAllFloor = function(){
					floorAllBtn.trigger("click");
				};

				var clickTopFloor = function(){
					floorNavList.find(".main-sidebar-floor-num-li:eq(0)").trigger("click");
				};

					//제일 상위의 Building을 선택할때는 2가지 경우가있다. AllFloor 를 선택하는 경우와 제일 상위 층을 선택하는 경우.
				var clickTopBuilding = function(isAll){
					disableFloorAllBtn(false);

					var view = floorBuildingCombo.data("kendoDropDownList");
					if(view.dataSource.data().length > 1){
						view.select(1);
						view.trigger("change");
						isMoveAllFloor = isAll;
					}
				};

				var isOriginalClick = function(){
					return isClick;
				};

				// var selectBuilding = function(id, value){
				//     if(id){
				//         floorBuildingCombo.select(function(dataItem){
				//             return dataItem.id == id;
				//         });
				//     }
				//
				//     if(value){
				//         floorBuildingCombo.select(function(dataItem){
				//             return dataItem.name == value;
				//         });
				//     }
				// };

				// var selectFloor = function(id, value){
				//     var elem;
				//     if(id){
				//         elem = floorNavList.find("li.main-sidebar-floor-num-li[data-id='"+id+"']");
				//     }
				//
				//     if(value){
				//         elem = floorNavList.find("li.main-sidebar-floor-num-li[data-value='"+value+"']");
				//     }
				//
				//     elem.trigger("click");
				// };

			   //Select Floor Element
			   /**
				*
				*   <ul>
				*   <li>FNB에서 층 선택 시, 요소를 통해 현재의 건물/층 정보(id, name)를 가져온다.</li>
				*   </ul>
				*   @function floorNavSelect
				*   @param {jQueryElement} elem - FNB에서 선택한 층의 요소
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var floorNavSelect = function(elem){
					var self = elem;
					var numElem = self.find(".main-sidebar-floor-num");
					var isAllBtn = false;
					var buildingId, buildingValue, floorId, floorValue, floorType;
					if(elem.get(0) === floorAllBtn.get(0)){
						isAllBtn = true;
						numElem = floorAllBtn;
					}

					if(!self.hasClass("active")){
						if(isAllBtn){
							floorNavList.find(".main-sidebar-floor-num-li.active").removeClass("active");
						}else{
							floorAllBtn.removeClass("active");
							self.siblings(".active").removeClass("active");
						}
						self.addClass("active");
					}
					var dropDownList = floorBuildingCombo.data("kendoDropDownList");
					var item = dropDownList.dataItem();
					if(item){
						buildingId = item.id;
						buildingValue = item.name;
					}else{
						buildingId = FLOOR_NAV_BUILDING_TOTAL_ID;
						buildingValue = FLOOR_NAV_BUILDING_TOTAL;
					}

					floorId = numElem.data("id");
					floorValue = numElem.data("value");
					floorType = numElem.data("type");

					var naviObj = {
						building : {
							id : buildingId,
							value : buildingValue
						},
						floor : {
							id : floorId,
							value : floorValue,
							type : floorType
						}
					};

					return naviObj;
				};

			   /**
				*
				*   <ul>
				*   <li>FNB를 활성화/비활성화 한다.</li>
				*   </ul>
				*   @function disableFloorNav
				*   @param {boolean} isDisabled - 활성화/비활성화 여부
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var disableFloorNav = function(isDisabled){
					var elemDisabled = floorNav.find('.disabled'),
						floor = getCurrentFloor().floor,
						floorId = floor.id, floorType = floor.type,
						activeFloorListItem = floorNavList.find('.main-sidebar-floor-num[data-id=' + floorId + '][data-type=' + floorType + ']').closest('.main-sidebar-floor-num-li');

					var currentFloor = getCurrentFloor();

					if(isDisabled){
						if(elemDisabled.length > 0){
							elemDisabled.removeClass('disabled');
						}
						if(activeFloorListItem.length > 0){
							activeFloorListItem.removeClass('active');
						}
						floorNav.addClass("disabled");
						floorNav.prop("disabled", true);
						floorNav.append(createLoadingMask());
						floorBuildingCombo.data("kendoDropDownList").enable(false);
						floorBuildingCombo.data("kendoDropDownList").value(0);
						sidebarHiddenTopInfo.addClass('disabled');
						isDisabledFloorNav = true;
					}else{
						if(activeFloorListItem.length > 0){
							activeFloorListItem.addClass('active');
						}
						floorNav.removeClass("disabled");
						floorNav.prop("disabled", false);
						floorNav.find(".floor-nav-mask").remove();
						floorBuildingCombo.data("kendoDropDownList").enable(true);
						floorBuildingCombo.data("kendoDropDownList").value(currentFloor.building.id);
						sidebarHiddenTopInfo.removeClass('disabled');
						isDisabledFloorNav = false;
					}
				};

			   /**
				*
				*   <ul>
				*   <li>FNB 내 층 리스트를 활성화/비활성화 한다.</li>
				*   </ul>
				*   @function disableFloorList
				*   @param {boolean} isDisabled - 활성화/비활성화 여부
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var disableFloorList = function(isDisabled){
					if(isDisabled){
						floorAllBtn.addClass("disabled");
						floorNavList.addClass("disabled");
						var height = floorBuildingCombo.data("kendoDropDownList").wrapper.height();
						floorNav.append(createLoadingMask(height));
					}else{
						floorAllBtn.removeClass("disabled");
						floorNavList.removeClass("disabled");
						floorNav.find(".floor-nav-mask").remove();
					}
				};

			   /**
				*
				*   <ul>
				*   <li>FNB 리스트 내 네비게이션(화살표) 버튼을 활성화/비활성화 한다.</li>
				*   </ul>
				*   @function disableFloorListBtn
				*   @param {boolean} isDisabled - 활성화/비활성화 여부
				*   @param {boolean} isTop - 상단/하단 버튼 여부
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var disableFloorListBtn = function(isDisabled, isTop){
					var mask;
					if(isDisabled){
						if(isTop){
							mask = createFloorListBtnMask(isTop);
							floorListTopBtn.addClass("disabled");
							floorNavList.append(mask);
						}else{
							mask = createFloorListBtnMask();
							floorListBottomBtn.addClass("disabled");
							floorNavList.append(mask);
						}
					}else{
						floorNavList.find(".floor-nav-mask").remove();
						floorListTopBtn.removeClass("disabled");
						floorListBottomBtn.removeClass("disabled");
					}
				};

			   /**
				*
				*   <ul>
				*   <li>FNB 내 빌딩 선택 드롭다운리스트를 활성화/비활성화한다.</li>
				*   </ul>
				*   @function disableBuidingCombo
				*   @param {boolean} isDisabled - 활성화/비활성화 여부
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var disableBuidingCombo = function(isDisabled){
					floorBuildingCombo.data("kendoDropDownList").enable(!isDisabled);
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 빌딩 선택 드롭다운리스트 내 Total을 활성화/비활성화한다.</li>
				*   </ul>
				*   @function disableBuidingTotal
				*   @param {boolean} isDisabled - 활성화/비활성화 여부
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var disableBuidingTotal = function(isDisabled){
					if(floorBuildingCombo.data("kendoDropDownList").dataSource){
						var ds = floorBuildingCombo.data("kendoDropDownList").dataSource;
						if(ds.total() > 0){
							ds.get(0).set("isDisabled", isDisabled);
						}
					}
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 전체 층 버튼을 활성화/비활성화한다.</li>
				*   </ul>
				*   @function disableFloorAllBtn
				*   @param {boolean} isDisabled - 활성화/비활성화 여부
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var disableFloorAllBtn = function(isDisabled){
					if(isDisabled){
						floorAllBtn.addClass("disabled");
						var mask = createFloorAllBtnMask();
						floorTop.append(mask);
					}else{
						floorTop.find(".floor-nav-mask").remove();
						floorAllBtn.removeClass("disabled");
					}
				};

			   /**
				*
				*   <ul>
				*   <li>FNB 층 리스트의 네비게이션 (화살표)버튼 클릭을 막기 위한 투명한 요소를 생성한다.</li>
				*   </ul>
				*   @function createFloorListBtnMask
				*   @param {boolean} isTop - 상단/하단 여부
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var createFloorListBtnMask = function(isTop){
					var css = {
						width : "100%",
						height : "21px",
						left : "0px",
						"z-index": "100",
						position :"absolute"
					};
					if(isTop){
						css.top = "-21px";
					}else{
						css.bottom = "-21px";
					}
					return $("<div/>").addClass("floor-nav-mask").css(css);
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 전체 층 버튼 클릭을 막기 위한 투명한 요소를 생성한다.</li>
				*   </ul>
				*   @function createFloorAllBtnMask
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var createFloorAllBtnMask = function(){
					var css = {
						width : "100%",
						height : floorAllBtn.outerHeight(),
						top : floorAllBtn.offset().top,
						left : "0px",
						"z-index": "100",
						position :"absolute"
					};
					return $("<div/>").addClass("floor-nav-mask").css(css);
				};

			   /**
				*
				*   <ul>
				*   <li>FNB의 클릭을 막기 위한 투명한 요소를 생성한다.</li>
				*   </ul>
				*   @function createLoadingMask
				*   @param {Number|String} top - 투명한 요소가 생성될 영역의 Top 좌표 값
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var createLoadingMask = function(top){
					if(!top){
						top = "0px";
					}
					return $("<div/>").addClass("floor-nav-mask").css({
						width : "100%",
						height : "100%",
						top : top,
						left : "0px",
						"z-index": "100",
						position :"absolute"
					});
				};

				//deprecated
				// var disableFloorNavEvt = function(evt){
				//     evt.preventDefault();
				//     evt.isDefaultPrevented();
				//     evt.stopPropagation();
				//     evt.isPropagationStopped();
				//     evt.stopImmediatePropagation();
				//     evt.isImmediatePropagationStopped();
				//     return false;
				// };

			   /**
				*
				*   <ul>
				*   <li>현재 선택되어있는 빌딩/층 정보를 localStorage로부터 가져온다.</li>
				*   <li>Default는 전체 빌딩, 전체 층이다.</li>
				*   </ul>
				*   @function getCurrentFloor
				*   @returns {Object} - 빌딩, 층 정보 객체
				*   @alias module:app/main
				*
				*/
				var getCurrentFloor = function(){
					var floorId, floorVal, floorType, buildingId, buildingVal;
					if(!curFloor){
						floorId = localStorage.getItem("floorId");
						floorVal = localStorage.getItem("floorValue");
						floorType = localStorage.getItem("floorType");
						buildingId = localStorage.getItem("buildingId");
						buildingVal = localStorage.getItem("buildingValue");
						if(!floorId || !buildingId || !floorVal || !buildingVal){
							curFloor = {
								floor : {
									id : FLOOR_NAV_FLOOR_ALL_ID,
									value : FLOOR_NAV_FLOOR_ALL,
									type : null
								},
								building : {
									id : FLOOR_NAV_BUILDING_TOTAL_ID,
									value : FLOOR_NAV_BUILDING_TOTAL
								}
							};
							return curFloor;
						}
						curFloor = {
							floor : {
								id : floorId,
								value : floorVal,
								type : floorType
							},
							building : {
								id : buildingId,
								value : buildingVal
							}
						};
					}
					return curFloor;
				};

			   /**
				*
				*   <ul>
				*   <li>현재 선택되어있는 층 이름을 가져온다.</li>
				*   </ul>
				*   @function getCurrentFloorName
				*   @returns {String} - 층 이름
				*   @alias module:app/main
				*
				*/
				var getCurrentFloorName = function(){
					var currentFloor = getCurrentFloor();
					var floor = currentFloor.floor;
					var building = currentFloor.building;
					if(building.id == FLOOR_NAV_BUILDING_TOTAL_ID
					   || floor.id == FLOOR_NAV_FLOOR_ALL_ID){
						return I18N.prop("COMMON_FLOOR_NAV_ALL");
					}
					var name = floor.name ? floor.name : floor.value;
					if(floor.type == "F"){
						return name + floor.type;
					}else if(floor.type == "B"){
						return floor.type + name;
					}
					return name;
				};

			   /**
				*
				*   <ul>
				*   <li>LocalStorage에 층 정보를 저장한다.</li>
				*   </ul>
				*   @function setCurrentFloor
				*   @param {Object}floorObj - 건물/층 정보 객체
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var setCurrentFloor = function(floorObj){
					if(!floorObj){
						return;
					}
					if(!floorObj.floor){
						return;
					}
					localStorage.setItem("floorId", floorObj.floor.id);
					localStorage.setItem("floorValue", floorObj.floor.value);
					localStorage.setItem("floorType", floorObj.floor.type);

					if(!floorObj.building){
						return;
					}

					localStorage.setItem("buildingId", floorObj.building.id);
					localStorage.setItem("buildingValue", floorObj.building.value);
				};

					//For User Profile Tooltip
					//Sign Out
			   /**
				*
				*   <ul>
				*   <li>상단 GNB 사용자 아이콘 클릭 시, 툴팁에서 로그아웃을 선택했을 때 호출되는 Callback 함수</li>
				*   <li>로그아웃 여부를 묻는 Confirm Dialog를 팝업시킨다.</li>
				*   </ul>
				*   @function signOut
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var signOut = function(){
					topNavUser.data("kendoMainNavTooltip").hide();
					confirmDialog.message(MSG_MAIN_SIGNOUT_CONFIRM);
					confirmDialog.open();
				};
			   /**
				*
				*   <ul>
				*   <li>로그아웃을 수행한다.</li>
				*   </ul>
				*   @function logout
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var logout = function(){
					//다른 계정으로 로그인하여서 Session이 유효하지 않을 경우의 처리
					var authorization;
					if(Session.getAuthToken() === null){
						authorization = "Bearer " + window.sessionStorage.getItem(Session.KEYS.AUTH_TOKEN);
						//goToMenu(SIGNIN_MENU_KEY);
						//return;
					}
					$.ajax({
						url : "/api/logout",
						headers : {
							Authorization : authorization,
							Accept : "application/json"
						},
						method : "POST"
					}).always(function(){
						//정상적으로 로그아웃을 시도할 때만 Session을 클리어한다.
						if(!authorization){
							Session.clearSession();
						}
						window.onbeforeunload = null;
						goToMenu(SIGNIN_MENU_KEY);
					});
				};

				//Go My Profile
				//deprecated
				var myProfile = function(){
					//goToMenu(MY_PROFILE_MENU_KEY);
					topNavUser.data("kendoMainNavTooltip").hide();
					myProfileModule.open();
				};

				// Main Sidebar 표시 / 숨김
				var hideMainMenuSidebar = function(isHide){
					var btnElem = null;
					if (isHide) {
						btnElem = sidebarUtilBtnBox.find(".btn.hide");
					} else {
						btnElem = sidebarUtilBtnBox.find(".btn.show");
					}
					triggeredBySidebarBtn = true;
					btnElem.click();
					// window.resize();
				};

			   /**
				*
				*   <ul>
				*   <li>좌측 LNB 사이드 바 동작(메뉴 접기/펴기 동작, 메뉴 선택 등)을 위한 이벤트를 바인딩한다.</li>
				*   </ul>
				*   @function initSidebar
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var initSidebar = function(){
					var sidebarTopLogoHeight = sidebarTopLogo.height();
					var sidebarMenuListBottom = sidebarMenuList.css("bottom").replace("px", "");
					var sidebarMenuLinesHeight = 1 * sidebarMenuListLines.length;
					var floorScrollBtnHeight, floorTopHeight;
					var currentActiveSubItem = sidebarMenuListUl.find('.main-sidebar-sub-menu-item.active');
					var iconTooltip = sidebarMenu.find('.main-sidebar-menu-icon-item-tag');
					var liIconItems = sidebarMenuIconList.find('.main-sidebar-menu-icon-item');
					var hoveredIcon = null, iconPos = {};

					if(!isHiddenFloorNav){
						floorScrollBtnHeight = 21;
						floorTopHeight = floorTop.outerHeight();
					}

					var clientMinWidth = Number(mainElem.css("min-width").replace("px", ""));

					sidebarMenuList.mCustomScrollbar({mouseWheel:true});

					//resize sidebar menu list and and floor navigation
					$(window).on("resize", function(){
						var windowHeight = $(this).height();
						var windowWidth = $(this).width();
						var widthScrollSize = SCROLL_BAR_SIZE;
						if(windowWidth >= clientMinWidth){
							widthScrollSize = 0;
						}

						//caculate height include height of width scroll size
						var calcHeight = windowHeight - sidebarTopLogoHeight - sidebarMenuListBottom - sidebarMenuLinesHeight - widthScrollSize - BTN_UTIL_HEIGHT;

						sidebarMenuList.height(calcHeight);

						if(!isHiddenFloorNav){
							calcHeight = windowHeight - floorTopHeight - floorScrollBtnHeight - widthScrollSize;
							floorNavList.height(calcHeight);
						}
					});

					$(window).trigger("resize");

					sidebarMenu.on("click", ".main-sidebar-menu-item", function(){
						var self = $(this);
						var name = self.data("name");
						if(self.find(".main-sidebar-menu-sub-list").length < 1){
							setTimeout(function(){
								goToMenu(name);
							},0);
							return false;
						}
						if(!self.hasClass("active")){
							//Close Another Sub-Menu
							self.siblings(".main-sidebar-menu-item.active").each(function(){
								var menuItem = $(this);
								slideUpSubMenu(menuItem);
							});

							//Open Sub-Menu
							slideDownSubMenu(self);

						}else{
							slideUpSubMenu(self);
						}

						$(window).trigger("resize");
					});

					sidebarMenu.on("click", ".main-sidebar-sub-menu-item", function(){
						var self = $(this);
						var name = self.closest(".main-sidebar-menu-item").data("name");
						var subName = self.data("name");
						if(!self.hasClass("active")){
							self.siblings(".active").removeClass("active");
							self.addClass("active");
						}
						goToMenu(name, subName);
						return false;
					});

					// 사이드 바 표시/숨김
					sidebarUtilBtnWrapper.show();
					sidebarUtilBtnBox.on('click', '.btn', function(e){
						var self = $(this);
						var eventName = self.attr('event-name');
						var prevLi = sidebarMenuListUl.find('.main-sidebar-menu-item.active'),
							targetLi = null,
							currentMenuName = '',
							activeItemName = '', isExpand = true;
						var onChangeSidebarParam = null;
						var isHide = false;


						if(eventName == 'hide'){
							isHide = true;
							$('body').addClass('hide-sidebar');
							mainElem.addClass('hide-sidebar');
							currentMenuName = window.location.pathname.split('/')[2];
							targetLi = sidebarMenuIconList.find('.main-sidebar-menu-icon-item[data-name=' + currentMenuName + ']');
							targetLi.siblings().removeClass('active');
							targetLi.addClass('active');
							slideUpSubMenu(prevLi);
							isExpand = false;
						}else if(eventName == 'show'){
							isHide = false;
							$('body').removeClass('hide-sidebar');
							mainElem.removeClass('hide-sidebar');
							activeItemName = sidebarMenuIconList.find('.main-sidebar-menu-icon-item.active').attr('data-name');
							targetLi = sidebarMenuList.find('li[data-name=' + activeItemName + ']');
							slideDownSubMenu(targetLi);
							isExpand = true;
						}

						if(triggeredBySidebarBtn) {
							Cookie.set(COOKIE_KEY_HIDE_MAIN_SIDEBAR, isHide);
						}

						if(currentActiveSubItem.length > 0){
							currentActiveSubItem.addClass('active');
						}

						onChangeSidebarParam = {
							type: 'changeSidebarState',
							isExpand: isExpand,
							width: sidebarMenu.width(),
							height: sidebarMenu.height()
						};

						triggeredBySidebarBtn = true;
						$(window).trigger(onChangeSidebarParam);
					});

					// 사이드 바 숨김 시 축소된 메뉴 아이콘
					sidebarMenuIconList.on('click', '.main-sidebar-menu-icon-item', function(e){
						var clickedLi = $(e.target).closest('.main-sidebar-menu-icon-item');
						var btnShow = sidebarUtilBtnBox.find('.btn.show');

						clickedLi.siblings().removeClass('active');
						clickedLi.addClass('active');
						triggeredBySidebarBtn = false;
						btnShow.click();
					});

					// 사이드 바 숨김 시 메뉴 아이콘 hover
					liIconItems.hover(function(e){
						hoveredIcon = $(e.target);
						iconTooltip.text(hoveredIcon.attr('tooltip-name'));
						iconPos.top = hoveredIcon.offset().top + 20;
						iconPos.left = hoveredIcon.offset().left + 65;
						iconPos.display = 'block';
						iconTooltip.css(iconPos);
					}, function(e){
						hoveredIcon = $(e.target);
						iconPos.display = 'none';
						iconTooltip.css(iconPos);
					});

					// 사이드 바 숨김 시 축소된 빌딩 콤보 아이콘
					sidebarHidden.find('.top-info').on('click', function(e){
						if($(e.target).hasClass('disabled')){
							return;
						}
						floorBuildingCombo.data('kendoDropDownList').open();
					});

					// Set state of main sidebar in cookie
					var cookieValue = Cookie.get(COOKIE_KEY_HIDE_MAIN_SIDEBAR);
					var parsedCookieValue = null;
					if (cookieValue === null || typeof cookieValue === "undefined") {
						Cookie.set(COOKIE_KEY_HIDE_MAIN_SIDEBAR, false);
					}
					cookieValue = Cookie.get(COOKIE_KEY_HIDE_MAIN_SIDEBAR);
					parsedCookieValue = (cookieValue == "true");
					hideMainMenuSidebar(parsedCookieValue);
				};

			   /**
				*
				*   <ul>
				*   <li>좌측 LNB 사이드 바 메뉴의 펴기 에니메이션 효과를 발생시킨다.</li>
				*   </ul>
				*   @function slideDownSubMenu
				*   @param {jQueryElement} elem - 선택한 메뉴의 DOM 요소(Element)
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var slideDownSubMenu = function(elem){
					var subMenu = elem.find("ul");
					if(subMenu.length > 0){
						subMenu.slideDown({duration:300,
							complete:function(){
								elem.addClass("active");
								$(window).trigger("resize");
							}
						});
					}
					elem.addClass("active");
				};

			   /**
				*
				*   <ul>
				*   <li>좌측 LNB 사이드 바 메뉴의 접기 에니메이션 효과를 발생시킨다.</li>
				*   </ul>
				*   @function slideUpSubMenu
				*   @param {jQueryElement} elem - 선택한 메뉴의 DOM 요소(Element)
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var slideUpSubMenu = function(elem){
					var subMenu = elem.find("ul");
					if(subMenu.length > 0){
						subMenu.slideUp({duration:300,
							complete:function(){
								elem.removeClass("active");
								$(window).trigger("resize");
							}
						});
					}
					elem.removeClass("active");
				};

				// var _getPrevMenu = function(elem){
				//     var prev = elem.prev();
				//     if(!prev.length){
				//         prev = $(sidebarMenuListLines[0]);
				//     }
				//     return prev;
				// };

				// var _getNextMenu = function(elem){
				//     var next = elem.next();
				//     if(!next.length){
				//         next = $(sidebarMenuListLines[1]);
				//     }
				//     return next;
				// };

			   /**
				*
				*   <ul>
				*   <li>현재 페이지의 메뉴에 해당하는 Core Module을 생성한다.</li>
				*   </ul>
				*   @function initCoreModule
				*   @param {String} name - 선택한 메뉴의 키 값(e.g : "dashboard", e.g:"energy")
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var initCoreModule = function(name){
					//load html
					define(name + "/core", [], function(){
						return new Module(name);
					});
				};

			   /**
				*
				*   <ul>
				*   <li>선택한 페이지의 메뉴에 해당하는 URL로 페이지를 이동한다.</li>
				*   </ul>
				*   @function goToMenu
				*   @param {String} menuName - 선택한 메뉴의 상위 키 값(e.g : "dashboard", e.g:"energy")
				*   @param {String} subMenuName - 선택한 메뉴의 상위 키 값(e.g : "summary", e.g:"consumption")
				*   @returns {void} - 리턴 값 없음
				*   @alias module:app/main
				*
				*/
				var goToMenu = function(menuName, subMenuName){
					//kendo.ui.progress($("body"), true);

					var link = window.location.protocol + "//" + window.location.host + FRONT_END_URL + "/" + menuName;
					if(subMenuName){
						link += "/" + subMenuName;
					}
					window.location.href = link;
					return;
				};

				var initModule = function(activeMenuKey, activeSubMenuKey){
					//Dom 렌더링 후 active class에 따라 서브메뉴 실행
					setTimeout(function(){
						loadModuleJs(activeMenuKey, activeSubMenuKey);
					},0);
				};

			   /**
				*
				*   <ul>
				*   <li>현재 활성화 되어있는 사이드바 메뉴의 요소를 가져온다.</li>
				*   </ul>
				*   @function getActiveMenu
				*   @returns {jQueryElement} - 현재 활성화되어있는 메뉴 요소
				*   @alias module:app/main
				*
				*/
				var getActiveMenu = function(){
					return sidebarMenuListUl.find(".main-sidebar-menu-item.active");
				};

			   /**
				*
				*   <ul>
				*   <li>URL로부터 현재 활성화 되어있는 메뉴 키를 가져온다.</li>
				*   </ul>
				*   @function getActiveMenuFromURL
				*   @returns {Object} - 상위 메뉴 이름과 하위 메뉴 이름 정보를 가진 객체
				*   @alias module:app/main
				*
				*/
				var getActiveMenuFromURL = function(){
					var urlSplit = window.location.pathname.replace("/front/", "").split("/");
					var menuName, subMenuName;
					if(urlSplit.length > 1){
						menuName = urlSplit[0];
						subMenuName = urlSplit[1];
					}else{
						menuName = urlSplit[0];
					}

					return {
						menuName : menuName,
						subMenuName : subMenuName
					};
				};

				// var getActiveMenuName = function(){
				//     return getActiveMenu().data("name");
				// };
				// var getActiveSubMenu = function(){
				//     return getActiveMenu().find(".main-sidebar-sub-menu-item.active");
				// };
				// var getActiveSubMenuName = function(){
				//     return getActiveSubMenu().data("name");
				// };

			   /**
				*
				*   <ul>
				*   <li>단위 기능의 JS를 RequireJS로 비동기 로딩한다.</li>
				*   <li>기 생성된 Module의 인스턴스인 CoreModule을 단위 기능에 전달한다.</li>
				*   <li>최초 현재 선택되어 있는 빌딩/층 정보를 Observer를 통하여 Publish 한다.</li>
				*   </ul>
				*   @function loadModuleJs
				*   @param {String} name - 상위 메뉴 이름
				*   @param {String} subName - 하위 메뉴 이름
				*   @returns {void} - 없음
				*   @alias module:app/main
				*
				*/
				var loadModuleJs = function(name, subName){
					//Create View
					if(!curMenuConfig.mainJs){
						console.error("Menu Load Failed : there is no mainJs for" + name + ">" + subName);
						return;
					}

					//서브메뉴 JSP 분리로 인하여 삭제
					//var templatePath ="text!/front/templates/"+curModuleName+"/"+config.template;
					//파일 확장자 코드 수정 필요
					var mainJsPath = name + "/";
					if(subName) mainJsPath += (subName + "/");

					mainJsPath = mainJsPath + curMenuConfig.mainJs;
					//View Model 및 Template 적용 제외 추후 검토 후 적용 예정
					//var templateDataPath = curModuleName+"/"+subName+"/"+config.templateData;
					require([name + "/core"/*, templatePath, templateDataPath*/], function(){
						//module js load
						require([mainJsPath], function(){
							window.kendo.ui.progress($("body"), false);
							publishFloorData();
							moveScrollToActiveFloor();
						}, function(e){
							console.error(e);
							window.kendo.ui.progress($("body"), false);
							msgDialog.message(MSG_MENU_OPEN_FAIL);
							msgDialog.open();
						});
					});
				};

				var getMenuConfig = function(){
					return menuConfig;
				};

				/*
					Main Window Initialize
				*/
				init();

				window.MAIN_WINDOW = {
					/*Alarm & Noti*/
					addErrorNoti : addErrorNoti,
					addWarningNoti : addWarningNoti,
					/*Floor Navigation Control*/
					disableFloorNav : disableFloorNav,
					disableFloorList : disableFloorList,
					disableBuidingCombo : disableBuidingCombo,
					disableFloorAllBtn : disableFloorAllBtn,
					disableBuidingTotal : disableBuidingTotal,
					setCurrentFloor : setCurrentFloor,
					setFloorImageInfo : setFloorImageInfo,
					getCurrentFloor : getCurrentFloor,
					getCurrentFloorName : getCurrentFloorName,
					setFloorList : setFloorList,
					addFloor : addFloor,
					removeFloor : removeFloor,
					editFloor : editFloor,
					setBuildingList : setBuildingList,
					addBuilding : addBuilding,
					removeBuilding : removeBuilding,
					editBuilding : editBuilding,
					clickAllFloor : clickAllFloor,
					clickTopFloor : clickTopFloor,
					clickTopBuilding : clickTopBuilding,
					isOriginalClick : isOriginalClick,
					refreshBuildingList : refreshBuildingList,
					refreshFloorList : refreshFloorList,
					getCurrentBuildingList : getCurrentBuildingList,
					getCurrentFloorList : getCurrentFloorList,
					getMenuConfig : getMenuConfig,
					/*Logout*/
					logout : logout,
					goToMenu : goToMenu,
					hideMainMenuSidebar: hideMainMenuSidebar,
					FLOOR_NAV_BUILDING_TOTAL_ID : FLOOR_NAV_BUILDING_TOTAL_ID,
					FLOOR_NAV_BUILDING_TOTAL : FLOOR_NAV_BUILDING_TOTAL,
					FLOOR_NAV_FLOOR_ALL : FLOOR_NAV_FLOOR_ALL,
					FLOOR_NAV_FLOOR_ALL_ID : FLOOR_NAV_FLOOR_ALL_ID
				};

				return window.MAIN_WINDOW;
			});
		});
	});
})(window, jQuery);
