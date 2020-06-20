/**
 *
 *   <ul>
 *       <li>시스템을 사용하는 사용자들의 정보를 열람 및 관리한다.</li>
 *       <li>사용자 추가 또는 사용자 정보를 편집 및 삭제한다.</li>
 *       <li>단일 또는 복수 사용자들의 정보에 대해 상세팝업 조회가 가능하다.</li>
 *   </ul>
 *   @module app/accountsettings/authmgmt
 *   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
 *   @requires app/main
 */
define("accountsettings/authmgmt/account-authmgmt", [], function() {
	var kendo = window.kendo, I18N = window.I18N, moment = window.moment, Util = window.Util;
	var MainWindow = window.MAIN_WINDOW;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	var menuKeys = ['Dashboard', 'HMI', 'Device', 'Device-All', 'Device-AirConditioner.Indoor', 'Device-AirConditionerOutdoor', 'Device-Sensor.Temperature_Humidity', 'Device-Light', 'Device-Sensor.Motion', 'Device-ControlPoint', 'Device-Meter', 'Device-Gateway', 'Device-Beacon', 'Device-CCTV', 'Device-SmartPlug', 'Device-Etc', 'Operation', 'Operation-Alarm', 'Operation-Schedule', 'Operation-Rule', 'Operation-Group', 'History', 'History-Report', 'History-TrendLog', 'History-SystemLog', 'Energy', 'Energy-Summary', 'Energy-ConsumptionAndTarget', 'Energy-SamsungSAC', 'Asset'];
	var adminAdditionalMenuKeys = ['ControlAreaSettings', 'AccountSettings', 'DeviceSettings', 'EnergySettings', 'SystemSettings'];
	var menuDefaultData = {
		"policy": {
			"menus": [
				{"resource": "Dashboard", "permission": "None", display: true},
				{"resource": "HMI", "permission": "None", display: true},
				{"resource": "Device", "permission": "None", display: true},
				{"resource": "Device-All", "permission": "None", display: true},
				{"resource": "Device-AirConditioner.Indoor", "permission": "None", display: true},
				{"resource": "Device-AirConditionerOutdoor", "permission": "None", display: true},
				{"resource": "Device-Sensor.Temperature_Humidity", "permission": "None", display: true},
				{"resource": "Device-Light", "permission": "None", display: true},
				{"resource": "Device-Sensor.Motion", "permission": "None", display: true},
				{"resource": "Device-ControlPoint", "permission": "None", display: true},
				{"resource": "Device-Meter", "permission": "None", display: true},
				{"resource": "Device-Gateway", "permission": "None", display: true},
				{"resource": "Device-Beacon", "permission": "None", display: true},
				{"resource": "Device-CCTV", "permission": "None", display: true},
				{"resource": "Device-SmartPlug", "permission": "None", display: true},
				{"resource": "Device-Etc", "permission": "None", display: true},
				{"resource": "Operation", "permission": "None", display: true},
				{"resource": "Operation-Alarm", "permission": "None", display: true},
				{"resource": "Operation-Schedule", "permission": "None", display: true},
				{"resource": "Operation-Rule", "permission": "None", display: true},
				{"resource": "Operation-Group", "permission": "None", display: true},
				{"resource": "History", "permission": "None", display: true},
				{"resource": "History-Report", "permission": "None", display: true},
				{"resource": "History-TrendLog", "permission": "None", display: true},
				{"resource": "History-SystemLog", "permission": "None", display: true},
				{"resource": "Energy", "permission": "None", display: true},
				{"resource": "Energy-Summary", "permission": "None", display: true},
				{"resource": "Energy-ConsumptionAndTarget", "permission": "None", display: true},
				{"resource": "Energy-SamsungSAC", "permission": "None", display: true},
				{"resource": "Asset", "permission": "None", display: true}
			]
		}
	};

	var profileDialog, profileDialogElem;

	var COMMON_MESSAGE_NOTI_CHANGES_SAVED = I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED");

	// MenuConfig 디스플레이 타입 정의 객체
	var menuConfigDisplayDefinition = {
		"Dashboard": I18N.prop("SETTINGS_MENUCONFIGURE_DASHBOARD"),
		"Energy": I18N.prop("SETTINGS_MENUCONFIGURE_ENERGY"),
		"Energy-Summary": I18N.prop("SETTINGS_MENUCONFIGURE_SUMMARY"),
		"Energy-ConsumptionAndTarget": I18N.prop("SETTINGS_MENUCONFIGURE_CONSUMPTION"),
		"Energy-SamsungSAC": I18N.prop("SETTINGS_MENUCONFIGURE_SAC_MONITORING"),
		"Target": I18N.prop("SETTINGS_MENUCONFIGURE_TARGET"),
		"SacEnergyMonitoring": I18N.prop("SETTINGS_MENUCONFIGURE_SAC_ENERGY_MONITORING"),
		"PowerDistribution": I18N.prop("SETTINGS_MENUCONFIGURE_POWER_DISTRIBUTION"),
		"Facility": "Facility",
		"Operation-Group": I18N.prop("SETTINGS_MENUCONFIGURE_GROUP"),
		"Operation-Schedule": I18N.prop("SETTINGS_MENUCONFIGURE_SCHEDULE"),
		"Operation-Rule": I18N.prop("SETTINGS_MENUCONFIGURE_RULE"),
		"HMI": I18N.prop("SETTINGS_MENUCONFIGURE_HMI"),
		"History-TrendLog": I18N.prop("SETTINGS_MENUCONFIGURE_TREND_LOG"),
		"Device": I18N.prop("SETTINGS_MENUCONFIGURE_DEVICE"),
		"Device-All": I18N.prop("COMMON_ALL"),
		"Device-AirConditioner.Indoor": I18N.prop("SETTINGS_MENUCONFIGURE_SAC_INDOOR"),
		"Device-AirConditionerOutdoor": I18N.prop("SETTINGS_MENUCONFIGURE_SAC_OUTDOOR"),
		"Device-Sensor.Temperature_Humidity": I18N.prop("SETTINGS_MENUCONFIGURE_TEMP_HUM"),
		"Device-Light": I18N.prop("SETTINGS_MENUCONFIGURE_LIGHT"),
		"Device-SmartPlug": I18N.prop("SETTINGS_MENUCONFIGURE_SMART_PLUG"), // 0831 - add smart plug
		"Device-Sensor.Motion": I18N.prop("SETTINGS_MENUCONFIGURE_MOTION"),
		"Device-ControlPoint": I18N.prop("SETTINGS_MENUCONFIGURE_POINT"),
		"Device-Meter": I18N.prop("SETTINGS_MENUCONFIGURE_METER"),
		"Device-Etc": I18N.prop("SETTINGS_MENUCONFIGURE_ETC"),
		"Space": "Space",
		"Building": I18N.prop("SETTINGS_MENUCONFIGURE_BUILDING"),
		"Membershp": "Membership",
		"Tenant": I18N.prop("SETTINGS_MENUCONFIGURE_TENANT"),
		"Manager": I18N.prop("SETTINGS_MENUCONFIGURE_MANAGER"),
		"Authority": I18N.prop("SETTINGS_MENUCONFIGURE_AUTHORITY"),
		"Notice": "Notice",
		"Operation-Alarm": I18N.prop("SETTINGS_MENUCONFIGURE_ALARM"),
		"History-SystemLog": I18N.prop("SETTINGS_MENUCONFIGURE_SYSTEM_LOG"),
		"Settings": "Settings",
		"Common": I18N.prop("SETTINGS_MENUCONFIGURE_COMMON"),
		"Display": I18N.prop("SETTINGS_MENUCONFIGURE_DISPLAY"),
		"Data": I18N.prop("SETTINGS_MENUCONFIGURE_DATA"),
		"SAC": I18N.prop("SETTINGS_MENUCONFIGURE_SAC"),
		"BACnet": I18N.prop("SETTINGS_MENUCONFIGURE_BAC_NET"),
		"Diagnosis": I18N.prop("SETTINGS_MENUCONFIGURE_DIAGNOSIS"),
		"Device-Gateway": I18N.prop("SETTINGS_MENUCONFIGURE_GATEWAY"),
		"Device-Beacon": I18N.prop("SETTINGS_MENUCONFIGURE_BEACON"),
		"Device-CCTV": I18N.prop("SETTINGS_MENUCONFIGURE_CCTV"),
		"Asset": I18N.prop("SETTINGS_MENUCONFIGURE_ASSET"),
		"OpenAPI": I18N.prop("SETTINGS_MENUCONFIGURE_OPEN_API"),
		"MenuConfigure": I18N.prop("SETTINGS_MENUCONFIGURE_MENU_CONFIGURE"),
		"Information": I18N.prop("SETTINGS_MENUCONFIGURE_INFORMATION"),
		"VirtaulPoint": I18N.prop("SETTINGS_MENUCONFIGURE_VIRTUAL_POINT"),
		"Algorithm": I18N.prop("SETTINGS_MENUCONFIGURE_ALGORITHM"),
		"HistoryOfOperation": I18N.prop("SETTINGS_MENUCONFIGURE_HISTORY_OF_OPERATION"),
		"DemandMonitoring": I18N.prop("SETTINGS_MENUCONFIGURE_DEMAND_MONITORING"),
		"EnergyLossDetection": I18N.prop("SETTINGS_MENUCONFIGURE_ENERGY_LOSS_DETECTION"),
		"Operation" : I18N.prop("SETTINGS_MENUCONFIGURE_OPERATION"),
		"History" : I18N.prop("SETTINGS_MENUCONFIGURE_HISTORY"),
		"ControlAreaSettings" : I18N.prop("SETTINGS_MENUCONFIGURE_CONTROLAREA_SETTINGS"),
		"AccountSettings" : I18N.prop("SETTINGS_MENUCONFIGURE_ACCOUNT_SETTINGS"),
		"DeviceSettings" : I18N.prop("SETTINGS_MENUCONFIGURE_DEVICE_SETTINGS"),
		"EnergySettings" : I18N.prop("SETTINGS_MENUCONFIGURE_ENERGY_SETTINGS"),
		"SystemSettings" : I18N.prop("SETTINGS_MENUCONFIGURE_SYSTEM_SETTINGS"),
		"History-Report" : I18N.prop("SETTINGS_MENUCONFIGURE_REPORT")

	};

	var tabElem, tab;
	var menuConfigContainer, menuConfigGrid, menuConfigContents, menuConfigSaveBtn;
	var menuConfigMessageElem, menuConfigMessage;
	var gridElem, grid;

	var menuConfigViewModel;
	var menuConfigData;

	var getUserAjax = function(){
		return $.ajax({
			url: "/ums/users?roles=Manager&registrationStatus=Approved&exposePolicy=true"
		});
	};

	var profileDialogFunc = function(selectData){
		profileDialog = profileDialogElem.kendoDetailDialog({
			title : I18N.prop("COMMON_MY_PROFILE"),     //다이얼로그 제목
			dataSource : selectData,                          //상세 팝업에 렌더링 할 데이터
			hasDelete : false,                          //삭제 버튼을 생성하지 않는다. 현재 상세 팝업은 Default로 조회모드에서 : 편집/삭제/닫기, 편집모드에서 : 저장/취소 버튼이 생성된다.
			height : 600,                               //다이얼로그 높이
			width : 652,                                //다이얼로그 너비
			headerTemplate : "<span class='cell' data-bind='text: id'></span> <span class='cell'>(<span data-bind='text: name'></span>)</span>",    //다이얼로그 타이틀 바로 아래 타이틀 텍스트에 표시할 템플릿을 설정한다.
			scheme : {                                  //데이터의 모델 정의
				id: "id",                               //REST API에서 Model의 ID의 Key 값은 모두 "id" 이다.
				fields : {                              //각 필드 별 정의
					role : {
						type : "text",                  //type은 "email", "text", "select", "grid", "object", "datetime" 등이 존재한다.
						name : I18N.prop("COMMON_MANAGER_TYPE")    //다국어가 적용된 해당 필드의 이름.
					},
					name : {
						type : "text",                              //타입이 "text"일 경우 편집 모드에서는 Default로 Input을 생성
						name : I18N.prop("COMMON_NAME"),
						editCss : {                                 //편집 모드에서 Input에 적용될 CSS
							width : "100%"
						},
						hasInputRemoveBtn : true,                   //편집 모드에서 Input 우측에 삭제 버튼이 생성되도록 하는 옵션
						validator : {type : "name", required : true}    //편집 모드에서 Input에 Validator를 적용할지 설정
					},
					id : {
						type : "text",
						name : I18N.prop("COMMON_ID")
					},
					mobilePhoneNumber : {
						type : "text",
						name : I18N.prop("COMMON_PHONE_NUM"),
						editCss : {
							width : "100%"
						},
						hasInputRemoveBtn : true,
						validator : true                            //Validator를 true로 설정 시, 자동으로 필드의 key 값인 "mobilePhoneNumber"를 Validator Option으로 적용한다. Boolean 뿐만 아니라 Object로 설정 가능하다.
					},
					email : {
						type : "email",
						name : I18N.prop("COMMON_EMAIL"),
						editCss : {
							width : "100%"
						},
						hasInputRemoveBtn : true,
						template : "<a mailto:'#:email#'>#if(email){##:email##}else{#-#}#</a>",
						validator : true                        //Validator를 true로 설정 시, 자동으로 필드의 key 값인 "email"을 Validator Option으로 적용한다. Boolean 뿐만 아니라 Object로 설정 가능하다.
					},
					joinDate : {
						type : "datetime",
						name : I18N.prop("COMMON_MY_PROFILE_SIGNUP_DATE"),
						format : "YYYY/MM/DD hh:mm"                                              //type이 "datetime"일 경우 format을 지정할 수 있다. 이는 moment.js의 format을 따른다.
					},
					lastLogin : {
						type : "text",
						name : I18N.prop("COMMON_MY_PROFILE_LASTEST_SIGN_IN"),
						template : function(data){
							var val = "-";
							if(data.lastLogin){
								var m = moment(data.lastLogin);
								val = m.format("YYYY/MM/DD hh:mm");
							}

							return val;
						}
					},
					policy: {
						type: 'text',
						name: I18N.prop('ACCOUNT_SETTING_MANAGE_BUILDING'),
						template: function(data) {
							var policy = data.policy;
							var bdgs = policy && policy.foundation_space_buildings_ids || [];
							var i, bdgLength = bdgs.length || 0;
							var ul = $('<ul/>').addClass('mgbuilding');
							if (bdgLength == 0) {
								return '-';
							}

							for (i = 0; i < bdgLength; i++) {
								ul.append($('<li/>').html(getBuildingNameById(bdgs[i])));
							}
							return ul;
						}
					}
				}
			}
		}).data("kendoDetailDialog");
		profileDialogElem.css('overflow', 'auto');
		profileDialog.setActions(profileDialog.BTN.EDIT, {visible : false} );
		profileDialog.open();
	};

	/**
	 *
	 *   메뉴 구성 탭 모듈을 초기화 한다.
	 *
	 *   @function init
	 *   @returns {void} - 리턴값 없음
	 *   @alias module:common
	 *
	 */
	//초기화 함수
	var init = function() {
		initView();
		initComponent();
		initGrid();
		attachMenuConfigEvt();
	};

	var initView = function () {
		tabElem = $('#authmgmt-tab-strip');
		tab = tabElem.find('.authmgmt-tab-list li').eq(0);
		profileDialogElem = $("<div class='auth-detail-dialog'/>");
		menuConfigContainer = $("#settings-common-menuconfig").find(".sac-menuconfig-container");
		menuConfigGrid = menuConfigContainer.find('#menuconfig-contents-grid').empty();
		gridElem = $('<div id="manager-view-grid"/>').appendTo(menuConfigGrid);
		menuConfigContents = menuConfigContainer.find("#menuconfig-contents-checkbox");
		menuConfigSaveBtn = menuConfigContainer.find(".k-button[data-event=menuconfigsave]");
		menuConfigMessageElem = $("#authmgmt-account-message-popup");
	};

	var initComponent = function () {
		// 팝업
		menuConfigMessage = menuConfigMessageElem.kendoCommonDialog().data("kendoCommonDialog");
	};

	var initGrid = function () {
		Loading.open();
		getUserAjax().done(function(data) {
			grid = gridElem.kendoGrid({
				columns : [
					{field: 'name', width: "120px", title:I18N.prop('SETTINGS_DEVICE_NAME')},
					{field: 'id', width: "120px", title:'ID'},
					{template: function(item){
						return "<span class='grid-detail-btn' data-id='" + item.id + "' data-bind='events: { click: clickDetail }'></span>";
					}, sortable: false, field: 'detailInfo', title: I18N.prop('COMMON_BTN_DETAIL'), width: "50px"}
				],
				width: 490,
				height: '100%',
				dataSource: data,
				scrollable: true,
				groupable : false,
				sortable: true,
				filterable: false,
				pageable: false,
				hasCheckedModel : true,
				setCheckedAttribute : true
			}).data("kendoGrid");
			menuConfigSaveBtn.kendoButton({
				enable: false
			});
			attachGridEvent();
			userMenuDataProcessing();
		}).fail(function(xhq) {
			menuConfigMessage.message(Util.parseFailResponse(xhq));
			menuConfigMessage.open();
		}).always(function() {
			Loading.close();
		});
	};

	var attachGridEvent = function () {
		grid.bind("checked", function(e){
			var checkedData = grid.getCheckedData();
			if (checkedData.length === 0) {
				menuConfigSaveBtn.data('kendoButton').enable(false);
			}
			checkedData = checkedData.length > 0 ? checkedData : void 0;
			userMenuDataProcessing(checkedData);
		});

		gridElem.on('click', '.grid-detail-btn', function (e) {
			profileDialogFunc(grid.dataSource.get(e.target.dataset.id));
		});
	};
	/**
	 *
	 *   사용자 그리드에서 체크된 사용자 메뉴구성 데이터를 가공하고 바인딩 시키는 함수
	 *
	 *   @function userMenuDataProcessing
	 * 	 @param {Object} checkData - 사용자 AND 처리된 체크 메뉴구성 데이타
	 *   @returns {Void} - 그리드에서 사용자별 체크한 메뉴구성을 모델에 맞춰 데이터를 가공하여 해당 모델을 템플릿에 바인딩시킨다
	 *   @alias module:common
	 *
	 */
	var userMenuDataProcessing = function(checkData){
		var i, j, k, menu, menuName;
		var finMenuConfigData = [];
		var mainMenuIndex = {};
		var curMenuConfig = MainWindow.getMenuConfig();

		var cappedData = {};

		if (typeof checkData !== 'undefined') {
			cappedData = {policy: {menus : []}};
			for (i = 0; i < menuKeys.length; i++) {
				for (j = 0; j < checkData[0].policy.menus.length; j++) {
					if (menuKeys[i] === checkData[0].policy.menus[j].resource) {
						cappedData.policy.menus.push($.extend(true, {}, checkData[0].policy.menus[j]));
					}
				}
			}

			for (i = 1; i < checkData.length; i++) {
				for (j = 0; j < cappedData.policy.menus.length; j++) {
					for (k = 0; k < checkData[i].policy.menus.length; k++) {
						if (cappedData.policy.menus[j].resource === checkData[i].policy.menus[k].resource) {
							if (cappedData.policy.menus[j].permission === 'Full' && checkData[i].policy.menus[k].permission === 'None') {
								cappedData.policy.menus[j].permission = 'None';
							}

						}
					}
				}
			}
		}

		menuConfigData = typeof checkData === 'undefined' ? $.extend(true, {}, menuDefaultData) : $.extend(true, {}, cappedData);

		var menuResource, curMenu;
		for (i = 0; i < menuConfigData.policy.menus.length; i++) {
			menu = menuConfigData.policy.menus[i];
			menuResource = menu.resource;
			menu.permission = menu.permission === 'Full' ? true : false;
			menu.displayName = menuConfigDisplayDefinition[menuResource];
			if (menuResource.indexOf('-') === -1) {
				menu.mainEnabled = true;
				menu.subEnabled = true;
				menu.disabled = checkData && checkData.length > 0 ? false : true;
				curMenu = curMenuConfig[menuResource.toLowerCase()];
				if (!curMenu) continue;
				menu.display = !curMenu.isHiddenMenu;
				finMenuConfigData.push(menu);
				menu.mainMenuClick = function (e) {
					var value = !this.permission, subMenu;
					if (this.subMenus) {
						for (var idx = 0; idx < this.subMenus.length; idx++) {
							subMenu = this.subMenus[idx];
							subMenu.set('permission', value);
						}
					}
				};
			}
		}
		var splitMenu, subMenuTabs, subMenuConfig;
		for (i = 0; i < finMenuConfigData.length; i++) {
			mainMenuIndex[finMenuConfigData[i].resource] = i;
			for (j = 0; j < menuConfigData.policy.menus.length; j++) {
				menu = menuConfigData.policy.menus[j];
				if (menu.mainEnabled) {
					continue;
				}
				splitMenu = menu.resource.split('-');
				menuName = splitMenu[0];
				if (finMenuConfigData[i].resource !== menuName) {
					continue;
				}
				if (typeof finMenuConfigData[i].subMenus === 'undefined') {
					finMenuConfigData[i].subMenus = [];
				}
				if (menuName === 'Device') {
					subMenuTabs = curMenuConfig[menuName.toLowerCase()].tabs;
					subMenuConfig = subMenuTabs.find(function(tabConfig){
						return tabConfig.name === splitMenu[1];
					});
					menu.display = subMenuConfig && subMenuConfig.enabled || false;
				} else {
					subMenuTabs = curMenuConfig[menuName.toLowerCase()].subMenu;
					subMenuConfig = subMenuTabs[splitMenu[1].toLowerCase()] || {};
					menu.display = !subMenuConfig.isHiddenMenu;
				}
				finMenuConfigData[i].subMenus.push(menu);
				menu.subMenuClick = function (e) {
					var index = mainMenuIndex[this.resource.split('-')[0]];
					var superMenu = menuConfigViewModel.menuConfigData[index];
					var value = !this.permission;
					this.permission = value;
					if (value) {
						superMenu.set('permission', value);
					} else {
						superMenu.set('permission', checkAllSubMenus(superMenu));
					}
				};
			}
		}
		function checkAllSubMenus(superMenu) {
			var subMenus = superMenu.get('subMenus');
			for (var idx = 0; idx < subMenus.length; idx++) {
				if (subMenus[idx].permission) {
					return true;
				}
			}
			return false;
		}

		// 최종 가공된 데이터 모델 생성 후 바인딩
		menuConfigViewModel = kendo.observable({
			menuConfigData: finMenuConfigData
		});
		kendo.bind(menuConfigContents, menuConfigViewModel);

	};

	/**
	 *
	 *   메뉴 구성 탭, 저장버튼 및 각 체크박스에 이벤트를 등록한다.
	 *
	 *   @function attachMenuConfigEvt
	 *   @returns {void} - 리턴값 없음
	 *   @alias module:common
	 *
	 */
	// 이벤트 바인딩
	var attachMenuConfigEvt = function() {
		tab.on('click', function (e) {
			var target = $(e.currentTarget);
			if(target.hasClass('k-state-active')) return;
			menuConfigGrid.empty();
			gridElem = $('<div id="manager-view-grid"/>').appendTo(menuConfigGrid);
			initGrid();
		});

		// 체크박스
		menuConfigContents.on("click", "input.k-checkbox", function() {
			var self = $(this);
			var value = self.attr("id");
			var spanDisplay = self.closest(".item").find("span.display");
			var container = self.closest(".sac-menuconfig-container");
			var saveBtn = container.find(".k-button[data-event=menuconfigsave]");

			spanDisplay.text(menuConfigDisplayDefinition[value]);
			if (grid && grid.getCheckedData().length > 0) {
				saveBtn.data("kendoButton").enable(true);
			}
		});

		// Save 버튼
		menuConfigSaveBtn.on("click", function() {		//[2018-04-06][e 파라메타 미사용 제거]
			var self = $(this);
			var users = grid.getCheckedData();
			var patchData = menuConfigViewModel.get('menuConfigData'), menus = [], subMenu;
			var i, j, patchObj = [];
			for (i = 0; i < patchData.length; i++) {
				menus.push({resource: patchData[i].resource, permission: patchData[i].permission ? 'Full' : 'None'});
				if (patchData[i].subMenus) {
					subMenu = patchData[i].subMenus;
					for (j = 0; j < subMenu.length; j++) {
						menus.push({resource: subMenu[j].resource, permission: subMenu[j].permission ? 'Full' : 'None'});
					}
				}
			}
			for (i = 0; i < adminAdditionalMenuKeys.length; i++) {
				menus.push({resource: adminAdditionalMenuKeys[i], permission: 'None'});
			}
			for (i = 0; i < users.length; i++) {
				patchObj.push({id: users[i].id, policy: {menus: menus}});
			}
			Loading.open();
			$.ajax({
				url: '/ums/users',
				method: 'patch',
				data: patchObj
			}).done(function () {
				menuConfigMessage.message(COMMON_MESSAGE_NOTI_CHANGES_SAVED);
				self.data("kendoButton").enable(false);
				for (i = 0; i < users.length; i++) {
					users[i].policy.menus = menus;
				}
			}).fail(function(data) {
				menuConfigMessage.message(data.responseText);
			}).always(function() {
				menuConfigMessage.open();
				Loading.close();
			});
		});

	};

	var getBuildingNameById = function (bid) {
		var buildingList = MainWindow.getCurrentBuildingList(), bname = '';
		$.each(buildingList, function (idx, val) {
			if (val.id === bid) {
				bname = val.name;
				return false;
			}
		});
		return bname;
	};

	return {
		init: init
	};
});

//# sourceURL=accountmgmt/account-authmgmt.js
