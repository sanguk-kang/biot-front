/**
*
*   <ul>
*       <li>Rule/Rule Alarm & Log 생성 기능</li>
*       <li>제어기기/조건/알람/날짜시간/제어요소들을 선택하여 Rule 또는 Rule Alarm & Log를 생성한다.</li>
*       <li>Rule 또는 Rule Alarm & Log를 편집한다.</li>
*   </ul>
*   @module app/operation/rule/rule-create
*   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
*   @param {Object} ViewModel - Rule 생성 뷰 제어를 위한 View Model
*   @param {Object} RuleModel - Rule, Rule Alarm & Log 정보 및 리스트 생성을 위한 Model
*   @param {Object} DeviceTemplate - 기기 정보 표시를 위한 Template
*   @param {Object} DeviceUtil - 기기 정보를 얻기 위한 DeviceUtil
*   @param {Object} Common - Rule 기능 내에서 공통으로 쓰이는 공용 Util
*   @param {Object} Widget - Rule 기능 내에서 쓰이는 Dialog 등의 Widget
*   @param {Object} GroupModel - 그룹 정보 및 리스트 생성을 위한 Model
*   @param {Object} DeviceModel - 기기 정보 Model
*   @param {Object} RuleAlarmModel - Rule Alarm & Log 정보 Model
*   @requires app/main
*   @requires app/operation/rule/view-model/rule-create-vm
*   @requires app/operation/rule/model/rule-model
*   @requires app/device/common/device-template
*   @requires app/device/common/device-util
*   @requires app/operation/rule/common/common
*   @requires app/operation/rule/common/widget
*   @requires app/operation/group/config/group-model
*   @requires app/device/common/device-model
*   @requires app/operation/rule/rule-alarm-model
*
*/
define("operation/rule/rule-create", ["operation/core", "operation/rule/view-model/rule-create-vm",
	"operation/rule/model/rule-model",
	"device/common/device-template", "device/common/device-util",
	"operation/rule/common/common",
	"operation/rule/common/widget",
	"operation/group/config/group-model","device/common/device-model","operation/rule/model/rule-alarm-model"],
function(CoreModule, ViewModel, RuleModel, DeviceTemplate,
			 DeviceUtil, Common, Widget, GroupModel, DeviceModel, RuleAlarmModel){
	"use strict";
	//decide to destroy or keep view

	var Device = DeviceModel.Device;
	var kendo = window.kendo;
	var MainWindow = window.MAIN_WINDOW;
	var Util = window.Util;
	var LoadingPanel = window.CommonLoadingPanel;
	var Settings = window.GlobalSettings;
	var moment = window.moment;
	var I18N = window.I18N;
	var Loading = new LoadingPanel();
	var confirmDialog = Widget.confirmDialog;
	var msgDialog = Widget.msgDialog;

	var ruleCreateTab, ruleCreateTabElem = $("#rule-create-tab");
	var loadedRuleData;
	var routeUrl = "/create";

	var viewContent = $("#rule-create-view");
	var Router = new kendo.Router();
	var Layout = new kendo.Layout("<div id='rule-view-content' class='schedule-view-content'></div>");
	var ContentBlock;

	var mapListPanel, mapListPanelElem = $("#map-panel"), detailPopup, loadPopup, alarmLoadPopup;
	var creationPanel, creationPanelElem;
	var createStep = $(".schedule-create-step-list");
	var typeFilter, subTypeFilter;
	var currentVm;
	var typeOrderingList = [];

	// var isMap, selectedIndex = [];		//[2018-04-12][변수 선언이후 미사용 주석처리]
	var floorList = [], groupList = [], buildingList = [];
	// var deviceDs = [], zoneList = [];		//[2018-04-12][변수 선언 할당 이후 미사용 주석처리]
	var isInitialized = false;
	// var isProgramaticSelect = false;		//[2018-05-02][기존 사용되던 코드가 주석처리되어 미사용 주석처리]
	var isForceNext = false;
	var isFloorList = false;
	// var isRuleUpdating = false;		//[2018-04-12][변수 선언이후 미사용 주석처리]

	var curViewName = "";

	var FILTER_ENUM = { TYPE : 0, SUB_TYPE : 1, SELECT_ALL : 2, STEP_TITLE : 3 };
	var ACTION_ENUM = { SELECTED_NUM : 0, PREV : 1, LOAD : 2, NEXT: 3, CREATE : 4};
	var MAP_LIST_ENUM = { SELECTED_TAB : 0, FLOOR_TAB : 1 };


	var includeGroupTypes = ["Light", "ControlPoint.AO", "ControlPoint.DO"];
	/*
		View Model
	*/
	var Views = ViewModel.Views, MainViewModel = ViewModel.MainViewModel,
		ConditionViewModel = ViewModel.ConditionViewModel, OperationViewModel = ViewModel.OperationViewModel,
		CreationViewModel = ViewModel.CreationViewModel;

	var isEdit = false;
	var isLoaded = false;
	var isLoadedRule = false;
	var isRuleAlarm = false;

	var isEditing = false;
	/**
	*   <ul>
		*   <li>Rule 생성 기능을 초기화한다.</li>
		*   <li>공용 UI Component를 초기화한다.</li>
		*   <li>현재 건물/층의 기기 정보를 API를 호출하여 서버로부터 받아오고, View를 업데이트한다.</li>
		*   <li>사용자 이벤트 동작을 바인딩한다.</li>
	*   </ul>
	*   @function init
	*   @param {Object} ruleData - Rule/Rule Alarm & Log 편집 시, 전달되는 Rule 정보 객체
	*   @param {Boolean} isLoad - Load Popup으로 스케쥴을 불러오는지에 대한 여부
	*   @param {Boolean} isAlarm - Rule Alarm & Log 생성/편집 인지에 대한 여부
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var init = function(ruleData, isLoad, isAlarm){
		isEditing = true;
		//Edit
		isRuleAlarm = isAlarm;

		if(isRuleAlarm){
			MainWindow.disableFloorNav(true);
		}else{
			MainWindow.disableFloorNav(false);
		}

		//불러오기
		isLoaded = isLoad;

		Loading.open();
		ruleCreateTab = ruleCreateTabElem.data("kendoCommonTabStrip");
		var tab = ruleCreateTab.select();

		MainViewModel.actions[ACTION_ENUM.PREV].options.click();
		MainViewModel.actions[ACTION_ENUM.PREV].options.click();
		MainViewModel.actions[ACTION_ENUM.PREV].options.click();

		//Step 활성화 상태 초기화
		createStep.find("li").removeClass("enabled");
		//View Model 초기화
		ConditionViewModel.init();
		OperationViewModel.init();
		CreationViewModel.init();
		MainViewModel.set("isAlarmLog", isAlarm);
		OperationViewModel.set("isAlarmLog", isAlarm);
		CreationViewModel.set("isAlarmLog", isAlarm);

		if(typeFilter){
			typeFilter.selectAll();
		}
		if(ruleData && !isLoad){
			isEdit = true;
			MainViewModel.actions[ACTION_ENUM.CREATE].set("text", I18N.prop("COMMON_BTN_SAVE"));
			loadedRuleData = ruleData;
			if(isAlarm){
				tab.find("a.text").text(I18N.prop("FACILITY_RULE_EDIT_RULE_ALARM_LOG"));
			}else{
				tab.find("a.text").text(I18N.prop("FACILITY_RULE_EDIT_RULE_CONTROL"));
			}

		//Create
		}else{
			isEdit = false;
			MainViewModel.actions[ACTION_ENUM.CREATE].set("text", I18N.prop("COMMON_BTN_CREATE"));
			if(isAlarm){
				tab.find("a.text").text(I18N.prop("FACILITY_RULE_CREATE_NEW_RULE_ALARM_LOG"));
			}else{
				tab.find("a.text").text(I18N.prop("FACILITY_RULE_CREATE_NEW_RULE_CONTROL"));
			}

			if(isLoad){
				isLoadedRule = true;
				loadedRuleData = ruleData;
			}else{
				isLoadedRule = false;
				loadedRuleData = RuleModel.createModel();
				ConditionViewModel.default();
				OperationViewModel.default();
				MainViewModel.set('editLoadReady', true);
			}
		}
		MainViewModel.set('isEdit',isEdit);

		var curFloor = MainWindow.getCurrentFloor();

		if(isInitialized){
			//setViewData(curFloor, loadedRuleData);
			var ds = Views.list.selected.widget.dataSource;
			ds.data([]);
			ds = Views.list.floor.widget.dataSource;
			ds.data([]);
			ds = Views.list.group.widget.dataSource;
			ds.data([]);
			ds = Views.map.widget.dataSource;
			ds.data([]);
			return changeFloor(curFloor);
		}          //First Execution. Initial View.
		var element = ruleCreateTab.contentElement(0);
		kendo.bind($(element), MainViewModel);
		createView();
		ContentBlock = $(element).find(".schedule-create-content .schedule-content-block");
		attachEvent();
		isInitialized = true;
		typeOrderingList = getTypeOrderingList();
		return changeFloor(curFloor);

		//Views.map.widget.dataSource.filter({field:"deviceName", operator : "contains", value : ""});
	};
	/**
	*   <ul>
	*   	<li>서브 기기 타입 필터를 비활성화 한다.</li>
	*   </ul>
	*   @function disableSubTypeFilter
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var disableSubTypeFilter = function(){
		MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", true);
		subTypeFilter.setOptions({optionLabel : I18N.prop("FACILITY_DEVICE_TYPE_SUB")});
		var ds = new kendo.data.DataSource({
			data : []
		});
		subTypeFilter.setDataSource(ds);
	};
	/**
	*   <ul>
		*   <li>Rule 생성 기능의 이벤트를 바인딩한다.</li>
		*   <li>필터 드롭다운리스트 동작의 이벤트를 바인딩 한다.</li>
		*   <li>Step 및 각 버튼들 및 리스트 전환 등의 이벤트를 바인딩한다.</li>
	*   </ul>
	*   @function attachEvent
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var attachEvent = function(){
		//type dropdown

		typeFilter = $("#" + MainViewModel.filters[FILTER_ENUM.TYPE].id).data("kendoDropDownCheckBox");
		subTypeFilter = $("#" + MainViewModel.filters[FILTER_ENUM.SUB_TYPE].id).data("kendoDropDownList");
		typeFilter.selectAll();
		typeFilter.bind("selectionChanged", function(e){
			var value, length = e.newValue.length;
			//var filters = Views.
			var i, max;
			if(length == ViewModel.typeFilterDataSource.length){ //select all
				disableSubTypeFilter();
				e.newValue = "All";
			}else if(length > 1 || length == 0){
				disableSubTypeFilter();
				//filter
			}else{
				value = e.newValue[0];
				value = value.replace(".", "");
				var list = Util.getDeviceTypeList(value, true);
				if(value == "ControlPoint"){
					// var i, max = list.length;			//[2018-04-12][아래에 사용되는 코드와 동일하기에 상위에 선언하도록 수정]
					max = list.length;
					for( i = max - 1; i >= 0; i-- ){
						if(list[i].displayType == "AV"){
							list.splice(i, 1);
						}else if(list[i].displayType == "DV"){
							list.splice(i, 1);
						}
					}
					//DO, AO로 표시되어야한다.
					list.reverse();
				}

				//SFCU는 FCU로 통합되어야한다.
				if(value == "AirConditioner"){
					// var i, max = list.length;			//[2018-04-12][아래에 사용되는 코드와 동일하기에 상위에 선언하도록 수정]
					max = list.length;
					list = $.extend(true, [], list);
					for( i = max - 1; i >= 0; i-- ){
						if(list[i].type == "AirConditioner.SFCU"){
							list.splice(i, 1);
						}
						if(list[i].type == "AirConditioner.FCU"){
							list[i].type = "AirConditioner.FCU,AirConditioner.SFCU";
						}
					}
				}

				if((list.length == 1 && list[0].type == value) || (list.length < 1)){
					disableSubTypeFilter();
				}else{
					var text = ViewModel.typeFilterText[value];
					var allText = (I18N.prop("COMMON_ALL") + " " + text + " " + I18N.prop("FACILITY_DEVICE_TYPE"));
					var ds = new kendo.data.DataSource({
						data : list
					});

					ds.read();

					//Option Label을 Refresh 하기 위함.
					disableSubTypeFilter();
					MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", false);
					subTypeFilter.setOptions({optionLabel : {
						displayType : allText,
						type : "All"
					}});

					subTypeFilter.setDataSource(ds);
				}
			}
			applyDsFilter(null, e.newValue);

		});
		MainViewModel.filters[FILTER_ENUM.SUB_TYPE].options.set("select", function(e){
			console.info(e);
			if(e.dataItem){
				applyDsFilter(null, null, e.dataItem.type);
			}
		});

		MainViewModel.filters[FILTER_ENUM.SELECT_ALL].options.set("click", selectAllEvt);

		MainViewModel.mapBtn.set("click", function(){
			if(MainViewModel.mapBtn.get("active") == true){
				return;
			}
			//disable all btn
			curViewName = "map";
			MainViewModel.category.set("invisible", true);
			Router.navigate(Views.map.routeUrl);
			showViewEvent(curViewName);
			if(MainViewModel.filters[FILTER_ENUM.TYPE].get("disabled")){
				MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", false);
				if(subTypeFilter.value()){
					MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", false);
				}
			}
		});

		MainViewModel.listBtn.set("click", function(){
			if(MainViewModel.listBtn.get("active") == true){
				return;
			}
			//enable all btn
			curViewName = "list";
			MainViewModel.category.set("invisible", false);
			MainViewModel.category.selected.click(true);
			showViewEvent(curViewName);
		});

		createStep.on("click", "li", function(){
			var self = $(this);
			if(!self.hasClass("enabled")){
				return;
			}
			var viewName = self.data("view");
			self.siblings("li").removeClass("active");
			self.addClass("active");

			var prevLi = self.prev();
			var nextLi = self.next();
			if(prevLi.length < 1){
				MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", true);
			}else{
				MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", false);
			}
			if(nextLi.length < 1){
				MainViewModel.actions[ACTION_ENUM.NEXT].set("invisible", true);
				MainViewModel.actions[ACTION_ENUM.CREATE].set("invisible", false);
			}else{
				MainViewModel.actions[ACTION_ENUM.CREATE].set("invisible", true);
				MainViewModel.actions[ACTION_ENUM.NEXT].set("invisible", false);
				MainViewModel.actions[ACTION_ENUM.NEXT].set("disabled", false);
			}

			// MainViewModel.filters[FILTER_ENUM.STEP_TITLE].options.set("stepTitle", Views[viewName].name);

			if(viewName == "map"){
				var floorData = MainWindow.getCurrentFloor();
				if(floorData.floor.id == MainWindow.FLOOR_NAV_FLOOR_ALL_ID
				   || floorData.building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID ){
					MainViewModel.mapBtn.set("disabled", true);
					MainViewModel.listBtn.click();
				}else{
					MainViewModel.mapBtn.set("disabled", false);
					MainViewModel.mapBtn.click();
				}
			}else{
				Router.navigate(Views[viewName].routeUrl);
				showViewEvent(viewName);

				//[2018-09-14][알람로그 클릭시 생성시에는 날짜시간옵션이 무조건 닫힌상태로 동작]
				if(viewName === 'operation' && !isEdit){
					var targetElem = $("#exceptionalList");
					targetElem.removeClass("active");
					targetElem.slideUp();
				}
			}
		});

		//prev
		MainViewModel.actions[ACTION_ENUM.PREV].options.set("click", function(){
			var curActive = createStep.find("li.active");
			var prevLi = curActive.prev();
			if(prevLi.length > 0){
				var viewName = prevLi.data("view");
				curActive.removeClass("active");
				prevLi.addClass("active");

				if(prevLi.prev().length < 1){
					MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", true);
				}else{
					MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", false);
				}

				MainViewModel.actions[ACTION_ENUM.CREATE].set("invisible", true);
				MainViewModel.actions[ACTION_ENUM.NEXT].set("invisible", false);

				// MainViewModel.filters[FILTER_ENUM.STEP_TITLE].options.set("stepTitle", Views[viewName].name);

				if(viewName == "map"){
					var floorData = MainWindow.getCurrentFloor();
					if(floorData.floor.id == MainWindow.FLOOR_NAV_FLOOR_ALL_ID
					   || floorData.building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID ){
						MainViewModel.mapBtn.set("disabled", true);
						MainViewModel.listBtn.click();
					}else{
						MainViewModel.mapBtn.set("disabled", false);
						MainViewModel.mapBtn.click();
					}
				}else{
					Router.navigate(Views[viewName].routeUrl);
					showViewEvent(viewName);
				}
			}
		});

		//next
		MainViewModel.actions[ACTION_ENUM.NEXT].options.set("click", function(){
			var curActive = createStep.find("li.active");
			var nextLi = curActive.next();
			if(nextLi.length > 0){
				var viewName = nextLi.data("view");
				curActive.removeClass("active");
				nextLi.addClass("active");
				nextLi.addClass("enabled");
				if(nextLi.next().length < 1){
					MainViewModel.actions[ACTION_ENUM.NEXT].set("invisible", true);
					MainViewModel.actions[ACTION_ENUM.CREATE].set("invisible", false);
				}else{
					MainViewModel.actions[ACTION_ENUM.NEXT].set("disabled", false);
				}
				MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", false);
				// MainViewModel.filters[FILTER_ENUM.STEP_TITLE].options.set("stepTitle", Views[viewName].name);
				Router.navigate(Views[viewName].routeUrl);
				if(viewName === 'operation' && !isEdit){
					var targetElem = $("#exceptionalList");
					targetElem.removeClass("active");
					targetElem.slideUp();
				}
				showViewEvent(viewName);
			}
		});

		//Load
		MainViewModel.actions[ACTION_ENUM.LOAD].options.set("click", function(){
			Loading.open();
			$.ajax({
				url : "/rules"
			}).done(function(data){
				var dataSource;
				if(isRuleAlarm){
					dataSource = RuleAlarmModel.createDataSource(data, RuleModel.Model);
					alarmLoadPopup.setDataSource(dataSource);
					alarmLoadPopup.open();
				}else{
					dataSource = RuleModel.createDataSource(data, RuleModel.Model);
					loadPopup.setDataSource(dataSource);
					loadPopup.open();
				}
			}).fail(function(){
				var dataSource = RuleModel.createDataSource(RuleModel.MockData, RuleModel.Model);
				loadPopup.setDataSource(dataSource);
				loadPopup.open();
			}).always(function(){
				Loading.close();
			});
		});

		loadPopup.bind("onChecked", function(e){
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.SELECT, { disabled : false });
		});
		alarmLoadPopup.bind("onChecked", function(e){
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.SELECT, { disabled : false });
		});

		loadPopup.bind("onSelect", function(e){
			var result = e.result;
			loadPopup.close();
			unselectAll();
			init(result, true, isRuleAlarm).always(function(){
				isForceNext = true;
				MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
				MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
				MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
				MainViewModel.actions[ACTION_ENUM.PREV].options.click();
				MainViewModel.actions[ACTION_ENUM.PREV].options.click();
				MainViewModel.actions[ACTION_ENUM.PREV].options.click();
				isForceNext = false;
			});
		});
		alarmLoadPopup.bind("onSelect", function(e){
			var result = e.result;
			alarmLoadPopup.close();
			unselectAll();
			init(result, true, isRuleAlarm).always(function(){
				isForceNext = true;
				MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
				MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
				MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
				MainViewModel.actions[ACTION_ENUM.PREV].options.click();
				MainViewModel.actions[ACTION_ENUM.PREV].options.click();
				isForceNext = false;
			});
		});

		Views.list.selected.widget.bind("change", selectWidgetEvt);
		Views.list.floor.widget.bind("change", selectWidgetEvt);
		Views.list.group.widget.bind("change", selectGroupEvt);
		Views.map.widget.bind("change", selectWidgetEvt);		//[2018-05-02][mapview 신규 적용 selectMapEvt -> selectWidgetEvt]


		MainViewModel.category.selected.set("click", function(isForce){
			if(MainViewModel.category.selected.get("active") == true && !isForce){
				return;
			}
			MainViewModel.category.selected.set("active", true);
			MainViewModel.category.all.set("active", false);
			MainViewModel.category.group.set("active", false);
			MainWindow.disableFloorNav(false);

			Router.navigate(Views.list.selected.routeUrl);
			currentVm = Views.list.selected.widget;
			var ds = currentVm.dataSource;
			// var curFloor = MainWindow.getCurrentFloor();		//[2018-04-12][해당변수를 사용하는 코드가 모두 주석처리되어 미사용처리됨 주석처리]
			isFloorList = false;

			MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", true);
			if(subTypeFilter.value()){
				MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", true);
			}

			ds.group([]);
			//ds.filter([{ field : "selected", operator : "eq", value : true}]);
			applyDsFilter();
		});

		MainViewModel.category.all.set("click", function(){
			if(MainViewModel.category.all.get("active") == true){
				return;
			}
			MainViewModel.category.all.set("active", true);
			MainViewModel.category.selected.set("active", false);
			MainViewModel.category.group.set("active", false);
			MainWindow.disableFloorNav(false);

			Router.navigate(Views.list.floor.routeUrl);
			currentVm = Views.list.floor.widget;
			var ds = currentVm.dataSource;
			//var curFloor = MainWindow.getCurrentFloor();
			isFloorList = true;

			MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", false);
			if(subTypeFilter.value()){
				MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", false);
			}

			ds.group([]);
			applyDsFilter();
		});

		MainViewModel.category.group.set("click", function(){
			if(MainViewModel.category.group.get("active") == true){
				return;
			}

			MainViewModel.category.all.set("active", false);
			MainViewModel.category.selected.set("active", false);
			MainViewModel.category.group.set("active", true);
			MainWindow.disableFloorNav(true);

			Router.navigate(Views.list.group.routeUrl);
			currentVm = Views.list.group.widget;
			var ds = currentVm.dataSource;
			//var curFloor = MainWindow.getCurrentFloor();
			isFloorList = false;

			MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", true);
			if(subTypeFilter.value()){
				MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", true);
			}

			ds.group([]);
			applyDsFilter();
		});

		MainViewModel.actions[ACTION_ENUM.CREATE].options.set("click", function(){
			//Create
			var isValidate = true;
			isValidate = $("#schedule-create-name").data("kendoCommonValidator").validate();
			if(!isValidate){
				return;
			}
			var descElem = $("#schedule-create-description");
			isValidate = descElem.data("kendoCommonValidator").validate();
			if(!isValidate){
				return;
			}

			var msg = "";		//[2018-04-12][하위에 재선언되는 msg변수들은 모두 사용전 초기화되는것을 확인 변수할당만 하도록수정]
			if(isEdit){
				if(isRuleAlarm){
					msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_EDIT_RULE_ALARM_LOG");
				}else{
					msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_EDIT_RULE");
				}
			}else if(isRuleAlarm){
				msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_CREATE_RULE_ALARM_LOG");
			}else{
				msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_CREATE_RULE");
			}
			//[2018-04-12][아래코드를 상단처럼 수정]
			// else{
			//     if(isRuleAlarm){
			//         msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_CREATE_RULE_ALARM_LOG");
			//     }else{
			//         msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_CREATE_RULE");
			//     }
			// }

			confirmDialog.message(msg);

			confirmDialog.setConfirmActions({
				yes : function(){
					Loading.open();
					getRuleDataFromViewModel(loadedRuleData);
					var data = loadedRuleData.toJSON();

					//[2018-08-31][시분으로 수정후 백엔드에서 시분초포맷 유지시키기 위해 추가]
					for(var timeIndex = 0; timeIndex < data.times.length; timeIndex++){
						data.times[timeIndex].startTime = data.times[timeIndex].startTime + ":00";
						data.times[timeIndex].endTime = data.times[timeIndex].endTime + ":00";
					}

					if(data.control){
						delete data.control;
					}
					if(!data.description){
						delete data.description;
					}
					setTimeForRequest(data, true);

					if(isRuleAlarm){
						delete data.control;
						delete data.devices;
						delete data.deviceTypes;
					}else{
						data.alarmType = 'None';
					}

					//temp
					if(isEdit){
						//[2018-05-02][제어로직, 조건알람 정보 PATCH 시 명세서에 정의되지 않거나 불필요한 정보 전송되고 있음 수정]
						var rulesLength = data.condition.rules.length;
						for(var i = 0; i < rulesLength; i++){
							var rulesDevicesLength = data.condition.rules[i].devices.length;
							for(var j = 0; j < rulesDevicesLength; j++){
								if(typeof data.condition.rules[i].devices[j].dms_devices_name !== 'undefined'){
									delete data.condition.rules[i].devices[j].dms_devices_name;
								}
								if(typeof data.condition.rules[i].devices[j].dms_devices_type !== 'undefined'){
									delete data.condition.rules[i].devices[j].dms_devices_type;
								}
								if(typeof data.condition.rules[i].devices[j].location !== 'undefined'){
									delete data.condition.rules[i].devices[j].location;
								}
							}
						}

						if(typeof data.title !== 'undefined'){
							delete data.title;
						}
						if(typeof data.checked !== 'undefined'){
							delete data.checked;
						}
						if(typeof data.created !== 'undefined'){
							delete data.created;
						}
						if(typeof data.updated !== 'undefined'){
							delete data.updated;
						}
						if (typeof data.alarmType !== 'undefined') {
							delete data.alarmType;
						}

						$.ajax({
							url : "/rules/" + data.id,
							method : "PATCH",
							data : data
						}).done(function(){
							msg = "";
							var namespace = "operation/rule/rule";
							if(isRuleAlarm){
								msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_RULE_ALARM_LOG_CREATION_EDIT");
								namespace = "operation/rule/rule-alarm";
							}else{
								msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_RULE_CONTROL_CREATION_EDIT");
							}
							msgDialog.message(msg);
							msgDialog.open();

							require([namespace], function(mainModule){
								mainModule.closeCreateBtnEvt();
							});
						}).fail(function(xhq){
							msg;
							if(xhq.status == 400 || xhq.status == 500){
								msg = I18N.prop("FACILITY_RULE_CALCULATION_ERROR");
							}else{
								msg = Util.parseFailResponse(xhq);
							}
							msgDialog.message(msg);
							msgDialog.open();
						}).always(function(){
							Loading.close();
						});
					}else{
						//[2018-05-02][제어로직, 조건알람 정보 POST 시 FrontEnd 에서 불필요한 정보를 포함하여 전송하고 있음. 삭제 필요 : id]
						if(typeof data.id !== 'undefined'){
							delete data.id;
						}
						ObjectPropertiesNullRemove(data);
						$.ajax({
							url : "/rules",
							method : "POST",
							data : data
						}).done(function(){
							msg = "";
							var namespace = "operation/rule/rule";
							if(isRuleAlarm){
								msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_RULE_ALARM_LOG_CREATION");
								namespace = "operation/rule/rule-alarm";
							}else{
								msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_RULE_CONTROL_CREATION");
							}

							msgDialog.message(msg);
							msgDialog.open();
							require([namespace], function(mainModule){
								mainModule.closeCreateBtnEvt();
							});
						}).fail(function(xhq){
							msg;
							if(xhq.status == 400 || xhq.status == 500){
								msg = I18N.prop("FACILITY_RULE_CALCULATION_ERROR");
							}else{
								msg = Util.parseFailResponse(xhq);
							}
							msgDialog.message(msg);
							msgDialog.open();
						}).always(function(){
							Loading.close();
						});
					}
				}
			});
			confirmDialog.open();
		});


		Views.list.selected.widget.element.on("click", "tbody tr td .ic-info", onDetailRowEvt);
		Views.list.floor.widget.element.on("click", "tbody tr td .ic-info", onDetailRowEvt);
		Views.list.group.widget.element.on("click", "tbody tr td .ic-info", onGroupDetailRowEvt);
		mapListPanel.element.on("click", "tbody tr td .ic-info", onDetailRowEvt);

		CoreModule.on("onfloorchange", changeFloor);

		//Condition View Rule 추가 버튼 이벤트
		ContentBlock.on("click", ".rule-condition .add-rule-btn", function(){
			// var ruleCondition = $(this).closest(".rule-condition");		//[2018-04-12][변수선언 할당이후 미사용 주석처리]
			ConditionViewModel.addRule();
			console.info("add rule");
			console.info(ConditionViewModel.rules);
		});

		//Condition View Rule 삭제 버튼 이벤트
		ContentBlock.on("click", ".rule-condition .remove-rule-btn", function(){
			var ruleCondition = $(this).closest(".rule-condition");
			var index = ruleCondition.index();
			ConditionViewModel.removeRule(index);
		});

		//Condition View Rule 기기 추가 버튼 이벤트
		ContentBlock.on("click", ".rule-condition .add-device-btn", function(){
			var ruleCondition = $(this).closest(".rule-condition");
			var index = ruleCondition.index();
			ConditionViewModel.addDevice(index);
		});

		ContentBlock.on("click", ".rule-condition .remove-device-btn", function(){
			var self = $(this);
			var deviceCondition = self.closest(".rule-condition-device");
			var deviceIndex = deviceCondition.index();
			var ruleCondition = deviceCondition.closest(".rule-condition");
			var ruleIndex = ruleCondition.index();
			ConditionViewModel.removeDevice(ruleIndex, deviceIndex);
		});

		//Creation View Name, Description 입력 시, 처리
		ContentBlock.on("keyup", "#schedule-create-name", function(){
			var nameField = $(this);
			var name = nameField.val();
			var descField = $("#schedule-create-description");
			var desc = descField.val();
			var isValidate;
			var isDescValidate;
			// if(isRuleAlarm){
			// 	if(!name || !desc){
			// 		MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", true);
			// 	}else{
			// 		isValidate = nameField.data("kendoCommonValidator").validate();		//[2018-04-12][해당 if코드에서 두번 선언이 되는것을 상위에 올려 해결 사용전 초기화확인]
			// 		isValidate = isValidate || descField.data("kendoCommonValidator").validate();
			// 		MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", !isValidate);
			// 	}
			// } else if(!name){
			// 	MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", true);
			// } else{
			// 	isValidate = nameField.data("kendoCommonValidator").validate();
			// 	MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", !isValidate);
			// }

			//[2018-08-31][설명 300자 넘어갈시 저장 비활성화 로직 추가 상단코드는 주석처리]
			isValidate = nameField.data("kendoCommonValidator").validate();
			isDescValidate = descField.data("kendoCommonValidator").validate();
			isValidate = isValidate && isDescValidate;
			MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", !isValidate);

			//[2018-04-12][상단 else if 문으로 수정]
			// else{
			//     if(!name){
			//         MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", true);
			//     }else{
			//         isValidate = nameField.data("kendoCommonValidator").validate();
			//         MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", !isValidate);
			//     }
			// }


		});

		ContentBlock.on("keyup", "#schedule-create-description", function(){
			var descField = $(this);
			var desc = descField.val();
			var nameField = $("#schedule-create-name");
			var name = nameField.val();
			var isValidate;
			var isDescValidate;
			// if(isRuleAlarm){
			// 	if(!name || !desc){
			// 		MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", true);
			// 	}else{
			// 		isValidate = nameField.data("kendoCommonValidator").validate();
			// 		isValidate = isValidate && descField.data("kendoCommonValidator").validate();
			// 		MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", !isValidate);
			// 	}
			// }else if(!name){
			// 	MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", true);
			// }else{
			// 	isValidate = nameField.data("kendoCommonValidator").validate();
			// 	isDescValidate = descField.data("kendoCommonValidator").validate();
			// 	isValidate = isValidate && isDescValidate;
			// 	MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", !isValidate);
			// }

			//[2018-08-31][설명 300자 넘어갈시 저장 비활성화 로직 추가 상단코드는 주석처리]
			isValidate = nameField.data("kendoCommonValidator").validate();
			isDescValidate = descField.data("kendoCommonValidator").validate();
			isValidate = isValidate && isDescValidate;
			MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", !isValidate);

			//[2018-04-12][상단 else if 문으로 수정]
			// else{
			//     if(!name){
			//         MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", true);
			//     }else{
			//         isValidate = nameField.data("kendoCommonValidator").validate();
			//         MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", !isValidate);
			//     }
			// }
		});

		//날짜 시간 옵션 Slide Up/Down

		ContentBlock.on("click", ".schedule-datetime .createFrm .tb .arr", function(){
			var target = $(this).data("target");
			var targetElem = $("#" + target);
			if(targetElem.hasClass("active")){
				targetElem.slideUp();
				targetElem.removeClass("active");
				//updateDisableStatus(targetElem);
			}else{
				targetElem.slideDown();
				targetElem.addClass("active");
				//updateDisableStatus(targetElem);
			}
		});

		ContentBlock.on("click", ".datetime-pickers-wrapper .bt.minus", function(){
			var btn = $(this);
			if(btn.hasClass("disabled")){
				return;
			}
			var pickers = btn.closest(".datetime-timepickers");
			var index = pickers.index();
			var executionTimeList = OperationViewModel.get("times");

			executionTimeList.splice(index, 1);
			//executionTimeList.sort();
			OperationViewModel.set("executionTime", executionTimeList);
			//checkExecutionTimes();
		});


		ContentBlock.on("click", ".datetime-pickers-wrapper .bt.plus", function(){
			var btn = $(this);
			if(btn.hasClass("disabled")){
				return;
			}
			var executionTimeList = OperationViewModel.get("times");
			var startTime = new Date(moment().startOf('day'));
			var endTime = new Date(moment().endOf('day'));
			// endTime.setHours(endTime.getHours() + 1);

			var value = {
				startTime : startTime,
				endTime : endTime
			};

			executionTimeList.push(value);

			OperationViewModel.set("times", executionTimeList);

			//checkExecutionTimes();
			//최초 추가 시, view model change 이벤트에서 DOM 이 없어서 제어 못하므로 추가
			if(executionTimeList.length == 1){
				ContentBlock.find(".schedule-datetime .datetime-pickers-wrapper .bt.minus").addClass("disabled");
			}
		});


		ConditionViewModel.bind("change", function(e){
			if(!ConditionViewModel.get("isUpdate") && e.field != "isUpdate"){
				var isValid = this.isValid(e);
				MainViewModel.actions[ACTION_ENUM.NEXT].set("disabled", !isValid);
				enableNextStep(isValid);
			}
		});


		OperationViewModel.bind("change", function(e){
			if(e.field &&
			   (e.field == "operation.indoor.temperature.min"
				|| e.field == "operation.indoor.temperature.max"
				|| e.field == "operation.indoor.waterTemp.min"
				|| e.field == "operation.indoor.waterTemp.max")){
				this.setTempMinMax(e, $("#indoor-temp"), $("#indoor-water-temp"));
			}
			this.checkActive();
			var isValid = this.isValid(e);

			var isDateTimeValid = false;
			var executionList = OperationViewModel.get("times");
			if(!executionList || executionList.length < 1){
				isDateTimeValid = isValid && false;
			}else{
				isDateTimeValid = isValid && true;
				if(executionList.length == 1){
					ContentBlock.find(".schedule-datetime .datetime-pickers-wrapper .bt.minus").addClass("disabled");
				}else{
					ContentBlock.find(".schedule-datetime .datetime-pickers-wrapper .bt.minus").removeClass("disabled");
				}
			}
			isValid = (isValid && isDateTimeValid);

			var isTimePickValid = this.isTimePickerValid(e);
			if(typeof isTimePickValid !== 'undefined'){
				if(isTimePickValid.length > 0){
					isValid = false;
				}
			}

			MainViewModel.actions[ACTION_ENUM.NEXT].set("disabled", !isValid);
			enableNextStep(isValid);
		});
	};
	/**
	*   <ul>
	*   	<li>다음 Step 아이콘을 활성화/비활성화 한다.</li>
	*   </ul>
	*   @function enableNextStep
	*   @param {Boolean}isEnabled - 활성화 여부
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var enableNextStep = function(isEnabled){
		if(isForceNext){
			return;
		}
		var curStep = createStep.find("li.active");
		var nextStepAll = curStep.nextAll("li");
		var nextStep = curStep.next("li");
		if(nextStep.length > 0){
			if(isEnabled){
				curStep.addClass("enabled");
				nextStep.addClass("enabled");
			}else{
				curStep.removeClass("enabled");
				nextStepAll.removeClass("enabled");
			}
		}
	};
	/**
	*   <ul>
	*   	<li>현재 표시된 View 기준으로 선택한 Filter 조건에 따라 기기 정보 View를 Filtering하여 View를 업데이트한다.</li>
	*   </ul>
	*   @function applyDsFilter
	*   @param {Object} floorData - 현재 선택한 빌딩/층 정보 객체
	*   @param {Array} types - 필터에서 선택한 기기 타입 리스트
	*   @param {Array} subType - 필터에서 선택한 서브 기기 타입
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var applyDsFilter = function(floorData, types, subType){
		if(!floorData){
			floorData = MainWindow.getCurrentFloor();
		}

		var floor = floorData.floor;
		var building = floorData.building;

		if(!types || types == "All"){		//[2018-05-02][mapview 신규 적용 !types -> !types || types == "All"]
			types = typeFilter.value();
			types = types ? types.split(",") : types;
		}

		if(!subType){
			subType = subTypeFilter.value();
		}

		var type, i, max;		//[2018-04-12][subType은 파라메타로 이미존재하고 할당값이 없기에 선언을 취소 floor는 이미 동일한 변수명에 동일한 변수할당을 하고있기에 선언취소]
		var allFilters = { logic : "and", filters : [] };
		var mapFilters = { logic : "and", filters : [] };
		var buildingFilter, floorFilter;

		var isFloorFilter = false;
		var isUnselectedFilter = false;
		if((curViewName == "map" && mapListPanel.selectedIndex == 1)
			   || (curViewName == "list" && isFloorList)){
		   isFloorFilter = true;
		   isUnselectedFilter = true;
		}

		var isSelectedFilter = false;
		if((curViewName == "map" && mapListPanel.selectedIndex == 0)
		   || (curViewName == "list" && !isFloorList)){
			isSelectedFilter = true;
		}

		if(building && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			buildingFilter = DeviceUtil.filter1Depth("locations", "foundation_space_buildings_id", building.id);
			if(isFloorFilter){
				allFilters.filters.push(buildingFilter);
			}
			mapFilters.filters.push(buildingFilter);
		}


		if(floor && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			floorFilter = DeviceUtil.filter1Depth("locations", "foundation_space_floors_id", floor.id);
			if(isFloorFilter){
				allFilters.filters.push(floorFilter);
			}
			mapFilters.filters.push(floorFilter);
		}

		var typeFilters = { logic : "or", filters : [] };
		if(types && types.length > 0){		//[2018-05-02][mapview 신규 적용 types && types != "All" && types.length > 0 -> types && types.length > 0]
			max = types.length;
			for( i = 0; i < max; i++ ){
				type = types[i];
				if(type){
					//Control Point는 mappedType만으로 필터링한다.
					if(type != "ControlPoint"){
						typeFilters.filters.push({ field : "type", operator : "contains", value : type });
					}
					//mappedType 추가
					typeFilters.filters.push({ field : "mappedType", operator : "contains", value : type });
				}
			}
			if(!isSelectedFilter){
				allFilters.filters.push(typeFilters);
			}
			mapFilters.filters.push(typeFilters);
		}

		var subTypeFilters = { logic : "and", filters : [] };
		if(subType && subType != "All"){
			var split = subType.split(",");
			if(split.length > 1){
				// var i;					//[2018-04-12][해당 max는 재선언이 불필요하므로 제거]
				max = split.length;		//[2018-04-12][해당 max는 재선언이 불필요하므로 할당만 하도록 수정]
				var multiFilter = { logic : "or", filters : [] };
				for( i = 0; i < max; i++ ){
					multiFilter.filters.push({ field : "type", operator : "eq", value : split[i] });
				}
				subTypeFilters.filters.push(multiFilter);
			}else{
				subTypeFilters.filters.push({ field : "type", operator : "eq", value : subType });
			}

			if(!isSelectedFilter){
				allFilters.filters.push(subTypeFilters);
			}
			mapFilters.filters.push(subTypeFilters);
		}

		var listDs = Views.list.floor.widget.dataSource;
		var mapDs = Views.map.widget.dataSource;

		var selectFilter = { logic : "and", filters : [{ field : "selected", operator : "eq", value : true}]};
		var unselectFilter = { logic : "and", filters : [{ field : "selected", operator : "eq", value : false}]};
		// var selectedNum, v;		//[2018-04-12][해당변수들은 선언이후 미사용으로 주석처리]

		//listDs.filter(allFilters);

		if(isSelectedFilter){    //selected
			allFilters.filters.push(selectFilter);
		}

		if(isUnselectedFilter){
			allFilters.filters.push(unselectFilter);
		}

		var listWidget = Views.list.floor.widget;
		var selectedWidget = Views.list.selected.widget;
		var scrollTop, selScrollTop;
		if(listWidget.virtualScrollable){
			scrollTop = listWidget.virtualScrollable.verticalScrollbar.scrollTop();
		}
		if(selectedWidget.virtualScrollable){
			selScrollTop = selectedWidget.virtualScrollable.verticalScrollbar.scrollTop();
		}
		listDs.filter(allFilters);
		if(listWidget.virtualScrollable){
			listWidget.virtualScrollable.verticalScrollbar.scrollTop(scrollTop);
		}
		if(selectedWidget.virtualScrollable){
			selectedWidget.virtualScrollable.verticalScrollbar.scrollTop(selScrollTop);
		}

		if(curViewName == "map"){
			mapListPanel.setDataSource(listDs, false, true, true);
			var tabGrid = mapListPanel.tabGrids[mapListPanel.selectedIndex];
			var tabGridDs = tabGrid.dataSource;
			tabGridDs.filter(allFilters);
			//mapListPanel.applyTreeFilter(tabGridDs, allFilters);

			//[2018-05-02][mapview 신규 적용]
			//현재 List View 일 때에도 필터링 할 경우 불필요하게 맵뷰의 기기들을 재렌더링하는 현상을 방지하기 위하여
			//현재 View가 Map View 일 때만, 필터를 건다.
			//List View에서 필터를 걸고 Map View로 이동한 경우 TabGroupGrid의 activateTab 이벤트 내 applyDsFilter() 호출로 인하여 아래 코드가 호출되며,
			//Map View 이동 시, Map View가 필터링 된다.
			mapDs.filter(mapFilters);
		}


		var data = listDs.data();
		var selectedData = new kendo.data.Query(data).filter({
			logic : 'and',
			filters : [{ field : "selected", operator : "eq", value : true}]
		}).toArray();
		setSelectedDeviceNum(selectedData.length);

		var f, totalFilter = [];
		if(building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			f = {logic : 'and', filters: [buildingFilter]};
			totalFilter.push(f);
		}

		if(floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			f = {logic : 'and', filters: [floorFilter]};
			totalFilter.push(f);
		}

		if(typeFilters.filters.length > 0){
			totalFilter.push(typeFilters);
		}

		if(subTypeFilters.filters.length > 0){
			totalFilter.push(subTypeFilters);
		}

		totalFilter.push(unselectFilter);

		//var totalData = new kendo.data.Query(data).filter(totalFilter).toArray();
		//setTotalDeviceNum(totalData.length);

		var unselectedData = new kendo.data.Query(data).filter(totalFilter).toArray();
		setUnselectedDeviceNum(unselectedData.length);
	};
	/**
	*   <ul>
	*   	<li>현재 선택한 빌딩/층에 따라 Zone, 층, 기기 정보, Group 정보 리스트를 서버로부터 API호출을 통하여 받아오고, View를 업데이트한다.</li>
	*   </ul>
	*   @function setViewData
	*   @param {Object} floorData - 현재 선택한 빌딩/층 정보 객체
	*   @param {Object} ruleData - Rule 편집/Load 시, 전달된 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var setViewData = function(floorData, ruleData){
		var dfd = new $.Deferred();
		Loading.open();
		//console.log("floor data from set view data");
		//console.log(floorData);
		//console.log(floorData.floor);
		//console.log(floorData.floor.imageUrl);
		//group 추가 필요
		getZoneData(floorData).done(function(zoneList){
			Views.map.widget.setFloor(floorData.floor);
			Views.map.widget.setZoneDataSource(zoneList);
			Views.map.widget.setDataSource([]);
		}).fail(failResp).always(function(){
			getFloorData(floorData).done(function(list){
				floorList = list;
				buildingList = MainWindow.getCurrentBuildingList();
			}).fail(failResp).always(function(){
				getCurrentFloorGroup(floorData).done(function(gList){
					console.info("group");
					console.info(gList);
					groupList = gList;
					MainViewModel.category.group.set("num", groupList.length);
					var groupDs = new kendo.data.DataSource({
						data : groupList
					});
					groupDs.read();
					Views.list.group.widget.setDataSource(groupDs);
				}).fail(failResp).always(function(){
					getCurrentFloorDevices(floorData).done(function(deviceList){
						var ds = new kendo.data.DataSource({
							data : deviceList,
							pageSize : 50
						});

						ds.read();
						// deviceDs = ds;		//[2018-04-12][변수 할당이후 미사용 주석처리]
						applyRuleData(ds, ruleData).done(function(){
							applyRuleForViewModel(ruleData).always(function(){
								var floor = floorData.floor, building = floorData.building;
								// var floorView;		//[2018-04-12][변수 선언이후 미사용 주석처리]
								var filters = [];
								if(building && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
									filters.push(DeviceUtil.filter1Depth("locations", "foundation_space_buildings_id", building.id));
								}

								if(floor && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
									filters.push(DeviceUtil.filter1Depth("locations", "foundation_space_floors_id", floor.id));
								}

								ds.filter(filters);
								//mapListPanel.options.filterTab[1].listOptions.filter = filters;

								Views.list.floor.widget.setDataSource(ds);
								Views.list.selected.widget.setDataSource(ds);
								//->applyDsFilter() 호출 시, dataSource가 업데이트 되어 중복이므로 삭제
								//if(building && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID && floor && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
								//    mapListPanel.setDataSource(ds, true);
								//}

								if(creationPanel){
									creationPanel.setDataSource(ds);
								}

								//Map은 별도의 데이터 소스를 사용
								if(building && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID && floor && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
									var datas = ds.data();
									datas = datas.toJSON();
									datas = new kendo.data.DataSource({
										data : datas
									});
									datas.read();
									Views.map.widget.setDataSource(datas);
								}else{
									Views.map.widget.setDataSource(new kendo.data.DataSource({data : []}));
								}

								if(curViewName == "map"){
									mapListPanel.selectTab(mapListPanel.selectedIndex, true);
								}else if(curViewName == "list"){
									ds.group([]);
								}else if(creationPanel){
									//선택한 리스트만 보이도록 Filter, Group Refresh
									creationPanel.selectTab(creationPanel.selectedIndex, true);
								}

								if(floorData.floor.id == MainWindow.FLOOR_NAV_FLOOR_ALL_ID
								   || floorData.building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID ){
									MainViewModel.mapBtn.set("disabled", true);
									MainViewModel.listBtn.click();
								}else{
									MainViewModel.mapBtn.set("disabled", false);
									if(curViewName == "list"){
										MainViewModel.listBtn.click();
									}else{
										MainViewModel.mapBtn.click();
									}
								}
								applyDsFilter();
								if(isEdit){
									isForceNext = true;
									MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
									MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
									MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
									isForceNext = false;
									if(isRuleAlarm){
										createStep.find("li:eq(1)").click();
									}else{
										createStep.find("li:eq(0)").click();
									}
								}else if(isRuleAlarm){
									isForceNext = true;
									MainViewModel.actions[ACTION_ENUM.NEXT].options.click();
									isForceNext = false;
									createStep.find("li:eq(1)").click();
								}

								Loading.close();
								dfd.resolve();
							});
						}).fail(failResp);
					}).fail(failResp);
				});
			});
		});
		return dfd.promise();
	};

	var applyGroupModel = function(data){
		return GroupModel.createDataSource(data, null, true);
	};
	/**
	*   <ul>
	*   	<li>현재 설정된 기기 타입 순서 정보를 가져온다.</li>
	*   </ul>
	*   @function getTypeOrderingList
	*   @returns {Array} 기기 타입 순서 설정에 따른 기기 타입 리스트
	*   @alias module:app/operation/rule/rule-create
	*/
	var getTypeOrderingList = function(){
		var orderingList = Settings.getDeviceTypeOrdering();
		var displayOrderingList = [];
		var type, displayType, i, max = orderingList.length;
		for( i = 0; i < max; i++ ){
			type = orderingList[i];
			displayType = Util.getDetailDisplayType(type, true);
			displayOrderingList.push(i + "_" + displayType);
			if(type == "Sensor.Temperature_Humidity"){
				displayOrderingList.push(i + "_" + Util.getDetailDisplayType("Sensor.Temperature", true));
				displayOrderingList.push(i + "_" + Util.getDetailDisplayType("Sensor.Humidity", true));
			}
		}
		return displayOrderingList;
	};

	var getOrderedType = function(displayType){
		var i, type, max = typeOrderingList.length;
		for( i = 0; i < max; i++ ){
			type = typeOrderingList[i];
			if(type.indexOf(displayType) != -1){
				return type;
			}
		}
	};

	var applyDeviceModel = function(data){
		if(!data){
			return [];
		}
		var results = [];

		var device, displayType, i, max = data.length;
		for( i = 0; i < max; i++ ){
			device = data[i];
			if(device.locations && !device.locations[0]){
				device.locations[0] = {};
			}
			device.selected = false;
			displayType = Util.getDetailDisplayType(device.mappedType || device.type, true);
			displayType = getOrderedType(displayType);
			device.displayType = displayType;
			device = new Device(device);
			results.push(device);
		}
		return results;
	};

	var failResp = function(xhq){
		var msg = Util.parseFailResponse(xhq);
		msgDialog.message(msg);
		msgDialog.open();
	};

	/**
	*  현재 선택한 빌딩/층 정보에 따라 API를 호출하여 Zone 정보 리스트를 서버로부터 가져온다.
	*   @function getZoneData
	*   @param {Object} floorData - 현재 선택한 빌딩/층 정보 객체
	*	@alias module:app/operation/rule/rule-create
	*   @return {jQuqery.Deferred} - jQuqery.Deferred 성공 실패 여부값 리턴
	*/
	var getZoneData = function(floorData){
		var dfd = new $.Deferred();
		var floor = floorData.floor;
		var building = floorData.building;

		if(!floor || !floor.id || floor.id == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			dfd.resolve([]);
			return dfd.promise();
		}else if(!building || !building.id || building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID ){
			dfd.resolve([]);
			return dfd.promise();
		}

		var query = getQueryFromFloor(floorData);
		return $.ajax({
			url : "/foundation/space/zones" + query
		});
	};
	/**
	*   <ul>
	*   	<li>현재 선택한 빌딩/층 정보에 따라 API를 호출하여 빌딩 정보 리스트를 서버로부터 가져온다.</li>
	*   </ul>
	*   @function getBuildingData
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {jQuqery.Deferred}	- jQuqery.Deferred 성공 실패 여부값 리턴
	*   @alias module:app/operation/rule/rule-create
	*/
	// var getBuildingData = function(floorData){		//[2018-04-12][선언이후로 미사용 주석처리]
	//     var dfd = new $.Deferred();
	//     // var floor = floorData.floor;		//[2018-04-12][선언이후로 미사용 주석처리]
	//     var building = floorData.building;
	//     if(!building || !building.id || building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID ){
	//         dfd.resolve([]);
	//         return dfd.promise();
	//     }
	//     var query = getQueryFromFloor(null, true, ["id, name"]);
	//     return $.ajax({
	//         url : "/foundation/space/buildings"+query
	//     });
	// };
	/**
	*   <ul>
	*   	<li>현재 선택한 빌딩/층 정보에 따라 API를 호출하여 층 정보 리스트를 서버로부터 가져온다.</li>
	*   </ul>
	*   @function getFloorData
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {jQuqery.Deferred}	- jQuqery.Deferred 성공 실패 여부값 리턴
	*   @alias module:app/operation/rule/rule-create
	*/
	var getFloorData = function(floorData){
		var dfd = new $.Deferred();
		// var floor = floorData.floor;		//[2018-04-12][선언이후로 미사용 주석처리]
		var building = floorData.building;
		if(!building || !building.id || building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID ){
			dfd.resolve([]);
			return dfd.promise();
		}

		var query = getQueryFromFloor(null, true, ["id, name, type"]);
		return $.ajax({
			url : "/foundation/space/floors" + query
		});
	};
	/**
	*   <ul>
	*   	<li>Rule 정보 내 기기 ID 값 정보들에 따라 기기 ID 리스트를 생성한다.</li>
	*   </ul>
	*   @function getDeviceIdFromRule
	*   @param {Object}loadedRule - 생성/편집할 Rule 정보 객체
	*   @returns {Array} - Device ID 리스트
	*   @alias module:app/operation/rule/rule-create
	*/
	var getDeviceIdFromRule = function(loadedRule){
		var deviceIdList = [];
		var deviceList = loadedRule.devices;
		if(!deviceList){
			return [];
		}
		var i, max = deviceList.length;
		var device;
		for( i = 0; i < max; i++ ){
			device = deviceList[i];
			deviceIdList.push(device.dms_devices_id);
		}

		return deviceIdList;
	};
	/**
	*   <ul>
	*   	<li>기기 정보 ID 값 리스트에 따라 API를 호출하여 기기 정보 리스트를 서버로부터 가져온다.</li>
	*   </ul>
	*   @function getDeviceFromIdList
	*   @param {Array}deviceIdList - 기기 ID 리스트
	*   @returns {jQuqery.Deferred}	- jQuqery.Deferred 성공 실패 여부값 리턴
	*   @alias module:app/operation/rule/rule-create
	*/
	// var getDeviceFromIdList = function(deviceIdList){		//[2018-04-12][선언이후로 미사용 주석처리]
	//     deviceIdList = deviceIdList.join(",");
	//     return $.ajax({url : "/dms/devices?ids="+deviceIdList}).then(applyDeviceModel);
	// };
	/**
	*   <ul>
	*   	<li>현재 생성/편집할 Rule 정보 객체의 기기 ID 값들을 통하여 기기 선택 상태를 업데이트한다.</li>
	*   </ul>
	*   @function applyRuleData
	*   @param {kendoDataSource} deviceDataSource - 현재 View(Widget)에서 가지고 있는 KendoDataSource 인스턴스
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var applyRuleData = function(deviceDataSource, loadedRule){
		var dfd = new $.Deferred();

		var ds = Views.list.floor.widget.dataSource;
		var data = ds.data();

		// var floorData = MainWindow.getCurrentFloor();		//[2018-04-12][선언이후로 미사용 주석처리]
		// var floor = floorData.floor;						//[2018-04-12][선언이후로 미사용 주석처리]

		var selectedData = new kendo.data.Query(data).filter({
			logic : 'and',
			filters : [{ field : "selected", operator : "eq", value : true}]
		}).toArray();

		//Apply Loaded Schedule
		var idList = getDeviceIdFromRule(loadedRule);

		if(idList.length > 0){
			$.ajax({
				url : "/dms/devices?ids=" + idList.join(",")
			}).done(function(ajaxData){			//[2018-04-12][상위에 동일 변수명이 선언되어 이를 수정하기위해 변수명 data -> ajaxData로 수정]
				var i, max = ajaxData.length;
				var id, device, item;
				data = applyDeviceModel(ajaxData);
				for( i = 0; i < max; i++ ){
					device = data[i];
					id = device.id;
					item = deviceDataSource.get(id);
					if(item){
						item.set("selected", true);
					//Schedule에 저장된 다른 빌딩의 Device 정보의 경우 현재 빌딩/층으로 쿼리한 디바이스 리스트에 존재하지 않으므로, Add하여 준다.
					}else{
						device.selected = true;
						deviceDataSource.add(device);
					}
				}
			}).fail(failResp).always(function(){
				addSelectedData(deviceDataSource, selectedData);
				dfd.resolve();
			});
		}else{
			addSelectedData(deviceDataSource, selectedData);
			dfd.resolve();
		}

		return dfd.promise();
	};
	/**
	*   <ul>
	*   	<li>현재 View의 기기 선택 상태를 업데이트한다.</li>
	*   </ul>
	*   @function addSelectedData
	*   @param {kendoDataSource} dataSource - 현재 View(Widget)에서 가지고 있는 KendoDataSource 인스턴스
	*   @param {Array} selectedData - 선택한 기기 리스트
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var addSelectedData = function(dataSource, selectedData){
		//Apply Already Selected Device Data
		var data, selectedItem;
		var item, i, max = selectedData.length;
		for( i = 0; i < max; i++ ){
			selectedItem = selectedData[i];
			item = dataSource.get(selectedItem.id);
			if(!item){
				dataSource.add(selectedItem);
			}else{
				item.set("selected", true);
			}
		}

		data = dataSource.data();
		selectedData = new kendo.data.Query(data).filter({
			logic : 'and',
			filters : [{ field : "selected", operator : "eq", value : true}]
		}).toArray();

		setSelectedDeviceNum(selectedData.length);
	};
	/**
	*   <ul>
	*   	<li>현재 빌딩/층 정보에 따라 기기 정보 리스트를 서버로부터 가져온다.</li>
	*   </ul>
	*   @function getCurrentFloorDevices
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {jQuqery.Deferred}	- jQuqery.Deferred 성공 실패 여부값 리턴
	*   @alias module:app/operation/rule/rule-create
	*/
	var getCurrentFloorDevices = function(floorData){
		var query = getQueryFromFloor(floorData);
		// var url = "/dms/devices"+query;	//[2018-04-12][변수 선언 할당 이후 미사용 주석처리]
		if(query.indexOf("&") != -1){
			query += "&";
		}
		query += "registrationStatuses=Registered&";
		query += "attributes=id,name,type,mappedType,registrationStatus,locations,groups&";
		query += "types=" + ViewModel.typeQuery.join(",");

		return $.ajax({url : "/dms/devices" + query}).then(applyDeviceModel);
	};
	/**
	*   <ul>
	*   	<li>현재 빌딩/층 정보에 따라 그룹 정보 리스트를 서버로부터 가져온다.</li>
	*   </ul>
	*   @function  getCurrentFloorGroup
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {jQuqery.Deferred}	- jQuqery.Deferred 성공 실패 여부값 리턴
	*   @alias module:app/operation/rule/rule-create
	*/
	var getCurrentFloorGroup = function(floorData){
		var query = getQueryFromFloor(floorData, null, null, true);
		return $.ajax({url : "/dms/groups/summary/listView" + query}).then(applyGroupModel);
	};
	/**
	*   <ul>
	*   	<li>현재 빌딩/층 정보에 따라 API 호출을 위한 쿼리 파라미터를 생성한다.</li>
	*   </ul>
	*   @function getQueryFromFloor
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @param {Boolean}isOnlyBuilding - 빌딩 쿼리만 생성할지의 여부
	*   @param {Array}attr - 특정 Attribute만 가져올 시, Attribute의 리스트
	*   @param {Boolean}isOnlyFloor - 층 쿼리만 생성할지의 여부
	*   @returns {String} API 호출을 위한 쿼리 파라미터
	*   @alias module:app/operation/rule/rule-create
	*/
	var getQueryFromFloor = function(floorData, isOnlyBuilding, attr, isOnlyFloor){
		var query = "?";
		if(floorData){
			var buildingId = floorData.building.id;
			var floorId = floorData.floor.id;

			if(isOnlyFloor){
				if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID
				   && floorId && floorId == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
					query += "foundation_space_buildings_id=" + buildingId + "&";
				}
			}else if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
				query += "foundation_space_buildings_id=" + buildingId + "&";
			}
			//[2018-04-12][if문 수정]
			// else{
			//     if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			//         query += "foundation_space_buildings_id="+buildingId+"&";
			//     }
			// }

			if(!isOnlyBuilding){

				if(floorId && floorId != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
					query += "foundation_space_floors_id=" + floorId + "&";
				}
			}
		}

		if(attr && attr.length > 0){
			query += ("attributes=" + attr.join(","));
		}
		return query;
	};
	/**
	*   <ul>
	*   	<li>특정 그룹의 기기 정보 리스트를 가져온다.</li>
	*   </ul>
	*   @function getGroupDeviceInfo
	*   @param {String|Number}groupId - 특정 그룹의 id 값
	*   @returns {jQuery.Deferred}	- jQuqery.Deferred 성공 실패 여부값 리턴
	*   @alias module:app/operation/rule/rule-create
	*/
	var getGroupDeviceInfo = function(groupId){
		var dfd = new $.Deferred();
		var url = "/dms/groups/" + groupId + "/listView";
		$.ajax({
			url : url
		}).done(function(data){
			var devices = data.devices;
			var i, max = devices.length;
			var ids = [];
			var type;
			for( i = 0; i < max; i++ ){
				type = devices[i].dms_devices_type;
				//실내기가 아니고, 허용된 그룹 타입이 아니면 Pass
				if(type.indexOf("AirConditioner.") == -1 && type.indexOf("ControlPoint") == -1 && includeGroupTypes.indexOf(type) == -1){
					continue;
				}
				ids.push(devices[i].dms_devices_id);
			}
			var curFloor = MainWindow.getCurrentFloor();
			var floorQuery = getQueryFromFloor(curFloor);
			floorQuery += ("ids=" + ids.join(","));
			//[2018-05-08][제어로직 편집 또는 생성시 그룹이 전체 0개를 클릭시 백엔드에서 값을 주지않아 에러문이 출력되던 현상을 막기위해 id값이 없다면 예외처리하기위해 if 설정]
			if(ids.length > 0){
				$.ajax({
					url : "/dms/devices" + floorQuery
				}).done(function(ajaxData){			//[2018-04-12][data 파라메타는 상위에서 이미 사용중임 변수명 data -> ajaxData로 수정]
					// var i, max = ajaxData.length;	//[2018-04-12][상위에 있는 변수를 할당하도록 수정]
					max = ajaxData.length;
					var mappedType;				//[2018-04-12][type 상위에 있는 변수를 할당하도록 type 제거]
					for( i = max - 1; i >= 0; i-- ){
						type = ajaxData[i].type;
						mappedType = ajaxData[i].mappedType;
						if(mappedType != "ControlPoint"){
							type = mappedType || type;
						}
						//실내기가 아니고, 허용된 그룹 타입이 아니면 삭제
						if(type.indexOf("AirConditioner.") == -1 && includeGroupTypes.indexOf(type) == -1){
							ajaxData.splice(i, 1);
						}
					}
					dfd.resolve(ajaxData);
				}).fail(function(xhq){
					dfd.reject(xhq);
				});
			}else{
				var msg = I18N.prop("FACILITY_RULE_CREATE_GROUP_SELECT_NONE_ERROR");
				msgDialog.message(msg);
				msgDialog.open();
				dfd.reject('');
			}
		}).fail(function(xhq){
			dfd.reject(xhq);
		});

		return dfd.promise();
	};
	/**
	*   <ul>
		*   <li>Ryke 생성 기능의 View를 초기화한다.</li>
		*   <li>List, Map View, Map View List 등의 UI Component를 초기화한다.</li>
		*   <li>Map/List View 전환을 위한 Router와 View를 초기화한다.</li>
		*   <li>생성 Step 별 View 전환을 위한 Router와 View를 초기화한다.</li>
	*   </ul>
	*   @function createView
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var createView = function(){
		//init router
		var list = [];

		Router.bind("init", routerInit);

		//map view
		// var elem = $("<div/>");		//[2018-04-12][변수 선언 할당후 미사용 주석처리]

		var options = {
			zoneDataSource : list,
			dataSource : list,
			isRegisterView : true,
			canDragDeviceIcon : false,
			showDeviceValue : false,
			showDeviceInfoCheckbox : false
		};

		Views.map.widget = Widget.createNewWidget("schedule-create-map", kendo.ui.CommonMapView, options);
		Views.map.view = new kendo.View(Views.map.widget.wrapper);
		Router.route(Views.map.routeUrl, routerEvt.bind(Router, Views.map.view));


		var deviceListOptions = {                  //초기화 할 Widget의 Option 값
			columns : [
			   { field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:100 },
			   { field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:100 },
			   { field: "locations", title: I18N.prop("COMMON_LOCATION"), width:100, template : DeviceUtil.getLocation, sortable : { compare : DeviceUtil.sortableLocation }},
			   { field: "group", title: I18N.prop("FACILITY_SCHEDULE_CREATE_GROUP"), width:100, template : DeviceUtil.getGroup, sortable : { compare : DeviceUtil.sortableGroup } },
			   { field: "detail", title: I18N.prop("COMMON_BTN_DETAIL"), width:80,sortable: false, template:'<span class="ic ic-info" data-id="#: id #"></span>'}
			],
			dataSource: [],
			height: "100%",
			// scrollable: true,		//[2018-04-12][하단에 동일 키값 선언 상위 주석처리]
			sortable: true,
			filterable: false,
			pageable: false,
			hasSelectedModel : true,
			selectable : "multiple row",
			scrollable : { virtual : true }
		};

		var groupListOptions = {
			columns : [
				{
					field : "dms_groups_name",
					title : I18N.prop("FACILITY_GROUP_GROUP_NAME"),
					width: 150
				},
				{
					field : "total",
					title : I18N.prop("COMMON_TOTAL"),
					sortable: false,
					resizable : false,
					template : function(data){
						var types = data.deviceTypes;
						var i, max, type;
						max = types.length;
						var totalNum = 0;
						for( i = 0; i < max; i++ ){
							type = types[i].dms_devices_type;
							if(type && type.indexOf("AirConditioner.") != -1){
								if(types[i].numberOfDevices){
									totalNum += types[i].numberOfDevices;
								}
							}
						}

						var value = 0;
						max = includeGroupTypes.length;
						for( i = 0; i < max; i++ ){
							if(typeof data[includeGroupTypes[i]] !== 'undefined'){
								value = data[includeGroupTypes[i]];
								totalNum += value;
							}
						}

						return totalNum;
					}
				},
				{
					title : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"),
					field : "AirConditioner",
					sortable: false,
					resizable : false,
					template : function(data){
						var types = data.deviceTypes;
						var i, max, type;
						max = types.length;
						var totalNum = 0;
						for( i = 0; i < max; i++ ){
							type = types[i].dms_devices_type;
							if(type && type.indexOf("AirConditioner.") != -1){
								if(types[i].numberOfDevices){
									totalNum += types[i].numberOfDevices;
								}
							}
						}
						return totalNum;
					}
				},
				{
					title : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"),
					field : "Light",
					sortable: false,
					resizable : false,
					template : function(data){
						var value = 0;
						if(typeof data["Light"] !== 'undefined'){
							value = data["Light"];
						}
						return value;
					}
				},
				{
					title : I18N.prop("FACILITY_DEVICE_TYPE_POINT"),
					field : "ControlPoint",
					sortable: false,
					resizable : false,
					template : function(data){
						var value = 0;
						if(typeof data["ControlPoint.AO"] !== 'undefined'){
							value += data["ControlPoint.AO"];
						}

						if(typeof data["ControlPoint.DO"] !== 'undefined'){
							value += data["ControlPoint.DO"];
						}

						return value;
					}
				},
				{ field: "detail", title: I18N.prop("COMMON_BTN_DETAIL"), width:80,sortable: false, template:'<span class="ic ic-info" data-id="#: dms_groups_id #"></span>'}
			],
			dataSource : [],
			height: "100%",
			scrollable: true,
			groupable : false,
			sortable: true,
			filterable: false,
			resizable : true,
			pageable: false,
			hasSelectedModel : true,
			selectable : "multiple row"
		};

		Views.list.selected.widget = Widget.createNewWidget("schedule-create-selected-list", kendo.ui.Grid, deviceListOptions);
		Views.list.selected.view = new kendo.View(Views.list.selected.widget.wrapper);
		Router.route(Views.list.selected.routeUrl, routerEvt.bind(Router, Views.list.selected.view));

		Views.list.floor.widget = Widget.createNewWidget("rule-create-floor-list", kendo.ui.Grid, deviceListOptions);
		Views.list.floor.view = new kendo.View(Views.list.floor.widget.wrapper);
		Router.route(Views.list.floor.routeUrl, routerEvt.bind(Router, Views.list.floor.view));

		Views.list.group.widget = Widget.createNewWidget("rule-create-group-list", kendo.ui.Grid, groupListOptions);
		Views.list.group.view = new kendo.View(Views.list.group.widget.wrapper);
		Router.route(Views.list.group.routeUrl, routerEvt.bind(Router, Views.list.group.view));

		Views.condition.view = new kendo.View($("#rule-condition-template"), { model : ConditionViewModel, evalTemplate: true});
		Router.route(Views.condition.routeUrl, routerEvt.bind(Router, Views.condition.view));

		Views.operation.view = new kendo.View($("#schedule-operation-template"), { model : OperationViewModel, evalTemplate: true});
		Router.route(Views.operation.routeUrl, routerEvt.bind(Router, Views.operation.view));

		Views.creation.view = new kendo.View($("#schedule-creation-template"), { model : CreationViewModel, evalTemplate: true});
		Router.route(Views.creation.routeUrl, routerEvt.bind(Router, Views.creation.view));

		var curFloorName = MainWindow.getCurrentFloorName();

		mapListPanel = mapListPanelElem.kendoDeviceTabGroupGrid({
			dataSource : [],
			hasNewDataSource : false,
			hasSelectedModel : true,
			type : "hybrid",
			filterTab : [
				{
					hideHeader : true,
					template : "<span data-bind='text: name'></span><span>(<span data-bind='text: count'></span>)</span>",
					listStyle : "treeList",
					widgetOptions : {
						expand : function(e){
							var widget = Views.list.selected.widget;
							var ds = widget.dataSource;
							var model = e.model;
							if(model.field.indexOf("displayType") != -1){
								mapListPanel.setDataSourceExpand(model, ds, true);
							}

							return false;
						}
					},
					listOptions : {
						column : {
							template : function(data){
								if(data.treeGroup && data.field){
									if(data.field.indexOf("buildings_id") != -1){
										return buildingGroupHeaderTemplate(data);
									}else if(data.field.indexOf("floors_id") != -1){
										return floorGroupHeaderTemplate(data);
									}else if(data.field.indexOf("displayType") != -1){
										return typeGroupHeaderTemplate(data);
									}
								}
								return DeviceTemplate.mapListRegTemplate(data);
							}
						},
						/*filter : {
						logic : "and",
						filters : [
							{
								field : 'selected',
								operator : 'eq',
								value : true
							}
						]
					},*/
						group : [
							{ field : "locations[0].foundation_space_buildings_id", dir : "desc",
								aggregates : [ { field: "locations[0].foundation_space_buildings_id", aggregate : "count" }]},
							{ field : "locations[0].foundation_space_floors_id", dir : "desc",
								aggregates : [ { field: "locations[0].foundation_space_floors_id", aggregate : "count" }]},
							{ field : "displayType", aggregates : [ { field: "displayType", aggregate : "count" }]}
						]/*,
					sort : [{ field : "name", dir : "asc" }]*/
					}
				},
				{
					template : "<span data-bind='text: name'></span><span>(<span data-bind='text: count'></span>)</span>",
					hideHeader : true,
					listStyle : "treeList",
					widgetOptions : {
						expand : function(e){
							var widget = Views.list.floor.widget;
							var ds = widget.dataSource;
							var model = e.model;
							if(model.field.indexOf("displayType") != -1){
								mapListPanel.setDataSourceExpand(model, ds, true);
							}
							return false;
						}
					},
					listOptions : {
						column : {
						//field : "displayType",
							template : function(data){
								if(data.treeGroup && data.field){
									if(data.field.indexOf("buildings_id") != -1){
										return buildingGroupHeaderTemplate(data);
									}else if(data.field.indexOf("floors_id") != -1){
										return floorGroupHeaderTemplate(data);
									}else if(data.field.indexOf("displayType") != -1){
										return typeGroupHeaderTemplate(data);
									}
								}
								return DeviceTemplate.mapListRegTemplate(data);
							}
						},
						/*filter : {
						logic : "and",
						filters : [
							{ field : "locations[0].foundation_space_floors_id", operator :"eq", value : "" }
						]
					},*/
						group : [
							{ field : "locations[0].foundation_space_buildings_id", dir : "desc",
								aggregates : [ { field: "locations[0].foundation_space_buildings_id", aggregate : "count" }]},
							{ field : "locations[0].foundation_space_floors_id", dir : "desc",
								aggregates : [ { field: "locations[0].foundation_space_floors_id", aggregate : "count" }]},
							{ field : "displayType", aggregates : [ { field: "displayType", aggregate : "count" }]}
						]
					}
				}
			],
			tabViewModel : [
				{
					name : I18N.prop("COMMON_SELECTED"),
					click : function(){

					},
					count : 0
				},
				{
					name : curFloorName,
					click : function(){

					},
					count : 0
				}
			],
			activateTab : function(e){
			//var index = e.index;
				if(typeFilter && subTypeFilter){
					applyDsFilter();
				}
				var index = e.index;
				var ds;
				if(index == 0){
					ds = Views.list.selected.widget.dataSource;
				}else{
					ds = Views.list.floor.widget.dataSource;
				}
				e.sender.setDataSource(ds, true, true);
			},
			change :selectWidgetEvt
		}).data("kendoDeviceTabGroupGrid");

		detailPopup = Widget.getDeviceDetailPopup();
		loadPopup = Widget.getRuleLoadPopup();
		alarmLoadPopup = Widget.getRuleAlarmLogLoadPopup();

		Router.start();
	};

	/**
	*   <ul>
	*   	<li>층 변경 시, 호출되는 콜백 함수. 선택한 빌딩/층에 따라 기기 정보들을 서버로부터 받아와 View를 업데이트하고, 선택한 Filter 조건에 맞게 Filter를 수행한다.</li>
	*   </ul>
	*   @function changeFloor
	*   @param {Object} curFloor - 현재 선택한 빌딩/층에 대한 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var changeFloor = function(curFloor){
		//apply filter floor list
		var floorName = MainWindow.getCurrentFloorName();
		mapListPanel.tabViewModel[MAP_LIST_ENUM.FLOOR_TAB].set("name", floorName);
		MainViewModel.category.all.set("text", floorName);
		if(!isEditing){
			return;
		}
		return setViewData(curFloor, loadedRuleData);
	};

	/*
		View Event
	*/
	/**
	*   <ul>
	*   	<li>Map, List 또는 생성 Step 별 View를 전환 시, View의 요소들을 업데이트 한다.</li>
	*   </ul>
	*   @function showViewEvent
	*   @param {String}viewName - View 이름
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var showViewEvent = function(viewName){
		if(viewName == "map"){
			MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", true);
			mapViewShow();
		}else if(viewName == "list"){
			MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", true);
			listViewShow();
		}else if(viewName == "operation"){
			operationViewShow();
		}else if(viewName == "condition"){
			conditionViewShow();
		}else if(viewName == "creation"){
			creationViewShow();
		}
	};

	/**
	*   <ul>
	*   	<li>기기 선택 뷰가 표시될 때의 View를 업데이트한다.</li>
	*   </ul>
	*   @function deviceViewShow
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var deviceViewShow = function(){
		MainWindow.disableFloorNav(false);
		MainViewModel.filters[FILTER_ENUM.TYPE].set("invisible", false);
		MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("invisible", false);
		MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set("invisible", false);
		MainViewModel.filters[FILTER_ENUM.STEP_TITLE].set("invisible", true);

		var curFloor = MainWindow.getCurrentFloor();
		if(curFloor.floor.id == MainWindow.FLOOR_NAV_FLOOR_ALL_ID
		   || curFloor.building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID ){
			MainViewModel.mapBtn.set("disabled", true);
		}else{
			MainViewModel.mapBtn.set("disabled", false);
		}

		MainViewModel.listBtn.set("disabled", false);
	};
	/**
	*   <ul>
	*   	<li>Map 뷰가 표시될 때의 View를 업데이트한다.</li>
	*   </ul>
	*   @function mapViewShow
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var mapViewShow = function(){
		deviceViewShow();
		mapListPanel.selectTab(0, true);
		MainViewModel.mapBtn.set("active", true);
		MainViewModel.listBtn.set("active", false);

		MainViewModel.set("hidePanel", false);
		MainViewModel.set("hideMapPanel", false);
		MainViewModel.set("hideSchedulePanel", true);
		Views.map.widget.invalidateSize(false);
	};
	/**
	*   <ul>
	*   	<li>List 뷰가 표시될 때의 View를 업데이트한다.</li>
	*   </ul>
	*   @function listViewShow
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var listViewShow = function(){
		deviceViewShow();
		MainViewModel.listBtn.set("active", true);
		MainViewModel.mapBtn.set("active", false);

		MainViewModel.set("hidePanel", true);
		MainViewModel.set("hideMapPanel", false);
		MainViewModel.set("hideSchedulePanel", false);
	};
	/**
	*   <ul>
	*   	<li>날짜/시간, 운영, 생성 뷰가 표시될 때의 View를 업데이트한다.</li>
	*   </ul>
	*   @function scheduleViewShow
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var scheduleViewShow = function(){
		MainWindow.disableFloorNav(true);
		MainViewModel.mapBtn.set("disabled", true);
		MainViewModel.mapBtn.set("active", false);
		MainViewModel.listBtn.set("disabled", true);
		MainViewModel.listBtn.set("active", false);
		MainViewModel.category.set("invisible", true);

		MainViewModel.filters[FILTER_ENUM.TYPE].set("invisible", true);
		MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("invisible", true);
		MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set("invisible", true);
		MainViewModel.filters[FILTER_ENUM.STEP_TITLE].set("invisible", false);
	};
	/**
	*   <ul>
	*   	<li>조건 설정 뷰가 표시될 때의 View를 업데이트한다.</li>
	*   </ul>
	*   @function conditionViewShow
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var conditionViewShow = function(){
		scheduleViewShow();
		MainViewModel.set("hidePanel", true);
		MainViewModel.set("hideMapPanel", true);
		MainViewModel.set("hideSchedulePanel", false);
		ConditionViewModel.trigger("change");

		//ALarm Log는 Condition이 첫번째 스텝이다. 이전 버튼 비활성화 및 기기 선택 택스트 Hide 처리한다.
		if(isRuleAlarm){
			MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", true);
			ContentBlock.closest(".schedule-create-content").find(".text-view").hide();
		}else{
			MainViewModel.actions[ACTION_ENUM.PREV].set("disabled", false);
			ContentBlock.closest(".schedule-create-content").find(".text-view").show();
		}
	};
	/**
	*   <ul>
	*   	<li>운영 뷰가 표시될 때의 View를 업데이트한다.</li>
	*   </ul>
	*   @function operationViewShow
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var operationViewShow = function(){
		scheduleViewShow();
		MainViewModel.set("hidePanel", true);
		MainViewModel.set("hideMapPanel", true);
		MainViewModel.set("hideSchedulePanel", false);

		applyOperationViewModel(loadedRuleData);
		OperationViewModel.trigger("change");

	};
	/**
	*   <ul>
	*   	<li>셍성 뷰가 표시될 때의 View를 업데이트한다.</li>
	*   </ul>
	*   @function creationViewShow
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var creationViewShow = function(){
		getRuleDataForCreationView(loadedRuleData);

		scheduleViewShow();
		MainViewModel.set("hidePanel", true);
		MainViewModel.set("hideMapPanel", true);
		MainViewModel.set("hideSchedulePanel", true);

		var ds = Views.list.selected.widget.dataSource;
		var data = ds.data();
		var selectedData = new kendo.data.Query(data).filter({
			logic : 'and',
			filters : [{ field : "selected", operator : "eq", value : true}]
		}).toArray();

		if(!creationPanelElem){
			//Router로 View를 불러오므로 Creation View가 라우터에서 불릴 때, 최초 생성
			creationPanelElem = $("#schedule-creation-table-grid");
			creationPanelElem.on("click", "tbody tr td .ic-info", onDetailRowEvt);
			creationPanel = creationPanelElem.kendoDeviceTabGroupGrid({
				dataSource : ds, hasNewDataSource : false, hideTab : true, selectable : false,
				type : "hybrid",
				filterTab : [{
					hideHeader : true,
					template : "<span data-bind='text: name'></span><span>(<span data-bind='text: count'></span>)</span>",
					listStyle : "treeList",
					widgetOptions : {
						expand : function(e){
							var model = e.model;
							if(model.field.indexOf("displayType") != -1){
								ds = Views.list.selected.widget.dataSource;				//[2018-04-12][ds, data, selectedData 상위에 있는 변수와 동일하므로 주석처리]
								data = ds.data();
								selectedData = new kendo.data.Query(data).filter({
								    logic : 'and',
								    filters : [{ field : "selected", operator : "eq", value : true}]
								}).toArray();
								var newDs = new kendo.data.DataSource({
									data : selectedData
								});
								newDs.read();
								creationPanel.setDataSourceExpand(model, newDs);
							}

							return false;
						}
					},
					listOptions : {
						column : {
							template : function(listData){				//[2018-04-12][data변수명이 상위에 선언되있어서 이를 수정하기위해 data -> listData 수정]
								if(listData.treeGroup && listData.field){
									if(listData.field.indexOf("buildings_id") != -1){
										return buildingGroupHeaderTemplate(listData);
									}else if(listData.field.indexOf("floors_id") != -1){
										return floorGroupHeaderTemplate(listData);
									}else if(listData.field.indexOf("displayType") != -1){
										return typeGroupHeaderTemplate(listData);
									}
								}
								return DeviceTemplate.mapListRegTemplate(listData);
							}
						},
						filter : {
							logic : "and",
							filters : [
								{
									field : 'selected',
									operator : 'eq',
									value : true
								}
							]
						},
						group : [
							{ field : "displayType", aggregates : [ { field: "displayType", aggregate : "count" }]}
						]/*,
						sort : [{ field : "name", dir : "asc" }]*/
					}
				}],
				tabViewModel : [{name : "",click : function(){},count : 0}]
			}).data("kendoDeviceTabGroupGrid");
		}else{
			//Creation View에서 보일 디바이스 리스트 Group Filter 리프레시
			creationPanel.selectTab(0, true);
		}

		var creationDs = new kendo.data.DataSource({
			data : selectedData
		});
		creationDs.read();
		creationPanel.setDataSource(creationDs);

		var selectedNum = selectedData.length;
		/*if(selectedNum > 999){
			selectedNum = "999+";
		}*/
		CreationViewModel.set("selectedNum", selectedNum);

		var descElem = $("#schedule-create-description");
		var nameField = $("#schedule-create-name");
		var name = nameField.val();
		var desc = descElem.val();

		nameField.data("kendoCommonValidator").hideMessages();
		descElem.data("kendoCommonValidator").hideMessages();

		if(isRuleAlarm){
			descElem.prop("required", true);
			if(!name || !desc){
				MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", true);
			}else{
				MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", false);
			}
		}else{
			descElem.prop("required", false);
			descElem.data("kendoCommonValidator").validate();
			descElem.data("kendoCommonValidator").hideMessages();
			if(!name){
				MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", true);
			}else{
				MainViewModel.actions[ACTION_ENUM.CREATE].set("disabled", false);
			}
		}
	};

	var routerInit = function(){
		Router.replace(routeUrl, true);
		Layout.render(viewContent);
	};

	var routerEvt = function(view){
		try{
			closeDatePicker();
			Layout.showIn("#rule-view-content", view);
		}catch(e){
			Layout.showIn("#rule-view-content", view);
		}

	};
	/**
	*   <ul>
	*   	<li>기기 선택 개수에 따라 기기 선택 상태 텍스트와 버튼들의 활성화/바활성화 상태를 업데이트한다.</li>
	*   </ul>
	*   @function setSelectedDeviceNum
	*   @param {Number}selectedNum - 선택한 기기 개수
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var setSelectedDeviceNum = function(selectedNum){
		var totalNum = MainViewModel.category.all.get("num");
		if(typeof totalNum == "string"){
			totalNum = totalNum.replace("+", "");
		}

		if(selectedNum != 0 && totalNum == selectedNum){
			MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set("text", Common.MSG.TXT_UNSELECT_ALL);
		}

		if(selectedNum < 1){
			MainViewModel.actions[ACTION_ENUM.SELECTED_NUM].options.set("selectedText", I18N.prop("FACILITY_DEVICE_NO_SELECTED"));
			MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set("text", I18N.prop("COMMON_BTN_SELECT_ALL"));
			MainViewModel.actions[ACTION_ENUM.NEXT].set("disabled", true);
			enableNextStep(false);
		}else{
			// var str = selectedNum > 1 ? "devices" : "device";		//[2018-04-12][변수선언뒤 미사용 주석처리]
			/*if(selectedNum > 999){
				selectedNum = "999+";
			}*/
			MainViewModel.actions[ACTION_ENUM.SELECTED_NUM].options.set("selectedText", I18N.prop("FACILITY_DEVICE_SELECTED", selectedNum));
			MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set("text", I18N.prop("COMMON_BTN_DESELECT_ALL"));
			MainViewModel.actions[ACTION_ENUM.NEXT].set("disabled", false);
			enableNextStep(true);
		}
		MainViewModel.category.selected.set("num", selectedNum);
		mapListPanel.tabViewModel[MAP_LIST_ENUM.SELECTED_TAB].set("count", selectedNum);
	};
	/**
	*   <ul>
	*   	<li>전체 기기 개수를 업데이트한다.</li>
	*   </ul>
	*   @function setTotalDeviceNum
	*   @param {Number} totalNum - 전체 기기 개수
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	// var setTotalDeviceNum = function(totalNum){		//[2018-04-12][해당함수를 사용하는 코드가 주석처리되어 미사용함수로 바뀌어 주석처리]
	//     /*if(totalNum > 999){
	//         totalNum = "999+";
	//     }*/
	//
	//     mapListPanel.tabViewModel[MAP_LIST_ENUM.FLOOR_TAB].set("count", totalNum);
	// };
	/**
	*   <ul>
	*   	<li>선택되지 않은 기기 개수를 업데이트한다.</li>
	*   </ul>
	*   @function setUnselectedDeviceNum
	*   @param {Number} num - 선택되지 않은 기기 개수
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var setUnselectedDeviceNum = function(num){
		/*if(num > 999){
			num = "999+";
		}*/

		MainViewModel.category.all.set("num", num);
		mapListPanel.tabViewModel[MAP_LIST_ENUM.FLOOR_TAB].set("count", num);
	};


	/**
	*   <ul>
	*   	<li>List View에서 그룹 선택 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function selectGroupEvt
	*   @param {Object} e -
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var selectGroupEvt = function(e){
		var selectedItem = e.item;
		var id = selectedItem.dms_groups_id;
		var isSelected = e.item.selected;
		Loading.open();
		getGroupDeviceInfo(id).done(function(groupDevices){
			var devices = applyDeviceModel(groupDevices);
			var floorListDs = Views.list.floor.widget.dataSource;
			//Apply Group Data
			var i, max = devices.length;
			// var id, item, device;		//[2018-04-12][id 재선언 금지]
			var item, device;		//[2018-04-12][id 재선언 금지]

			for( i = 0; i < max; i++ ){
				device = devices[i];
				id = device.id;
				item = floorListDs.get(id);
				if(item){
					item.selected = isSelected;
					Views.map.widget.selectDevice(item.id, item.selected);	//Map View 선택 [2018-05-02][mapview 신규 적용]
				}
			}
			applyDsFilter();
			//[2018-05-08][그룹이 0인 상태를 예외처리 하기위해 fail selected false 추가 fail always 분리]
		}).fail(function(){
			selectedItem.set('selected',false);
		}).always(function(){
			Loading.close();
		});
	};
	// /**
	// *   <ul>
	// *   	<li>현재 표시된 View에서 기기 선택 시, 호출되는 Callback 함수</li>
	// *   </ul>
	// *   @function selectWidgetEvt
	// *   @param {Object} e -
	// *   @returns {void}
	// *   @alias module:app/operation/rule/rule-create
	// */
	// var selectWidgetEvt = function(e){
	// 	// var selectedItem = e.item;		//[2018-04-12][선언후 미사용]
	// 	//var ids = Views.list.floor.widget.getSelectedIds();

	// 	var ds = Views.list.floor.widget.dataSource;
	// 	//var data = ds.data();
	// 	var data = ds.data();
	// 	var selectedData = new kendo.data.Query(data).filter({
	// 		logic : 'and',
	// 		filters : [{ field : "selected", operator : "eq", value : true}]
	// 	}).toArray();
	// 	setSelectedDeviceNum(selectedData.length);

	// 	if(e.item){
	// 		if(curViewName == "map"){
	// 			if(e.item.selected){
	// 				isProgramaticSelect = true;
	// 				Views.map.widget.select({ id : e.item.id});
	// 				isProgramaticSelect = false;
	// 			}else{
	// 				isProgramaticSelect = true;
	// 				Views.map.widget.unselect({ id : e.item.id});
	// 				isProgramaticSelect = false;
	// 				/*if(mapListPanel.selectedIndex == 0){
	// 					applyDsFilter();
	// 				}*/
	// 			}
	// 		}/*else if(curViewName == "list" && !isFloorList){
	// 			if(!e.item.selected){
	// 				applyDsFilter();
	// 			}
	// 		}*/
	// 		var listItem = ds.get(e.item.id);
	// 		if(listItem) listItem.selected = e.item.selected;
	// 		applyDsFilter();
	// 	}

	// };

		/**
	 *   <ul>
	 *   <li>현재 표시된 View에서 기기 선택 시, 호출되는 Callback 함수</li>
	 *   </ul>
	 *   @function selectWidgetEvt
	 *	@param {Event} e - Event 객체
	 *   @returns {void}
	 *   @alias module:app/operation/schedule/create
	 */
	var selectWidgetEvt = function(e){
		//devices : 공용 Map View의 "change" 이벤트 콜백 시, 선택 상태 변경된 기기 리스트 인자
		//item : 공용 Grid 및 TabGroupGrid "change" 이벤트 콜백 시, 선택 상태 변경된 기기 아이템 인자
		var sender = e.sender, items = e.item ? [e.item] : e.devices;

		if(items){
			var isMapView = sender instanceof kendo.ui.CommonMapView && curViewName == "map";
			var item, i, max = items.length;
			var listItem, ds = Views.list.floor.widget.dataSource;
			for( i = 0; i < max; i++ ){
				item = items[i];
				//Map View가 아닌 층/선택 리스트 또는 맵 우측 리스트에서 선택을 하였을 때, Map View의 기기 선택 상태를 업데이트한다.
				if(!isMapView) Views.map.widget.selectDevice(item.id, item.selected);
				listItem = ds.get(item.id);
				//층 기기 리스트의 선택상태를 업데이트한다.
				if(listItem) listItem.selected = item.selected;
			}
			applyDsFilter();
		}
	};

	/**
	*   <ul>
	*   	<li>전체 선택/전체 선택 해제 버튼 클릭 시, 호출되는 Callback 함수 </li>
	*   </ul>
	*   @function selectAllEvt
	*   @param {Object} e -
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var selectAllEvt = function(e){
		var text = this.get("text");
		// var isSelect;		//[2018-04-12][선언후 미사용]

		if(text == I18N.prop("COMMON_BTN_SELECT_ALL")){
			selectAll();
			this.set("text", I18N.prop("COMMON_BTN_DESELECT_ALL"));
		}else{
			unselectAll();
			this.set("text", I18N.prop("COMMON_BTN_SELECT_ALL"));
		}
	};

	/**
	*   <ul>
	*   	<li>기기를 전체 선택하고, View를 Update한다.</li>
	*   </ul>
	*   @function selectAll
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var selectAll = function(){
		//현재 층에 해당하는 Device 정보만 Select하기 위해 View만 Select 처리
		var ds = Views.list.floor.widget.dataSource;
		//Views.list.floor.widget.selectAll(true);
		var data = ds.data();

		var floorData = MainWindow.getCurrentFloor();
		var building = floorData.building, floor = floorData.floor;

		//필터링 된 데이터 즉, 뷰 데이터만 selected 값을 true로 변경한다.
		//dataSource.view() 를 사용할 경우, 현재 표시되는 뷰에 따라 데이터가 달라지므로,
		//data()로 전체 데이터를 갖고 필터링 걸어 selected 값을 변경한다.
		var buildingFilter, floorFilter, allFilters = { logic : "and", filters : [] };
		if(building && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			buildingFilter = DeviceUtil.filter1Depth("locations", "foundation_space_buildings_id", building.id);
			allFilters.filters.push(buildingFilter);
		}


		if(floor && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			floorFilter = DeviceUtil.filter1Depth("locations", "foundation_space_floors_id", floor.id);
			allFilters.filters.push(floorFilter);
		}

		var types = typeFilter.value();
		types = types ? types.split(",") : types;

		var subType = subTypeFilter.value();

		var i, max, type, typeFilters = { logic : "or", filters : [] };
		if(types && types != "All" && types.length > 0){
			max = types.length;
			for( i = 0; i < max; i++ ){
				type = types[i];
				if(type){
					//Control Point는 mappedType만으로 필터링한다.
					if(type != "ControlPoint"){
						typeFilters.filters.push({ field : "type", operator : "contains", value : type });
					}
					//mappedType 추가
					typeFilters.filters.push({ field : "mappedType", operator : "contains", value : type });
				}
			}
			allFilters.filters.push(typeFilters);
		}

		var subTypeFilters = { logic : "and", filters : [] };
		if(subType && subType != "All"){
			var split = subType.split(",");
			if(split.length > 1){
				// var i, max = split.length;	//[2018-04-12][i 재선언 제거 max는 할당만 하도록수정]
				max = split.length;
				var multiFilter = { logic : "or", filters : [] };
				for( i = 0; i < max; i++ ){
					multiFilter.filters.push({ field : "type", operator : "eq", value : split[i] });
				}
				subTypeFilters.filters.push(multiFilter);
			}else{
				subTypeFilters.filters.push({ field : "type", operator : "eq", value : subType });
			}
			allFilters.filters.push(subTypeFilters);
		}

		// var selectFilter = { logic : "and", filters : [{ field : "selected", operator : "eq", value : false}]};		//[2018-04-12][선언후 미사용]

		var unselectedData = new kendo.data.Query(data).filter(allFilters).toArray();

		// var i, max = unselectedData.length;		//[2018-04-12][i 재선언 제거 max는 할당만 하도록수정]
		max = unselectedData.length;
		for( i = 0; i < max; i++ ){
			unselectedData[i].selected = true;
		}

		Views.map.widget.selectAll();
		applyDsFilter();
	};
	/**
	*   <ul>
	*   	<li>기기를 전체 선택해제하고, View를 Update한다.</li>
	*   </ul>
	*   @function unselectAll
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var unselectAll = function(){
		Views.list.floor.widget.clearSelection();
		Views.map.widget.unselectAll();
		applyDsFilter();
	};
	/**
	*   <ul>
	*   	<li>싱세 아이콘 클릭 시 호출되는 Callback 함수, 기기 ID를 통하여 API를 호출하고, 응답된 데이터로 기기 상세 팝업을 표시한다.</li>
	*   </ul>
	*   @function onDetailRowEvt
	*   @param {Object} e -
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var onDetailRowEvt = function(e){
		var id = $(this).data("id");
		//var item = Views.list.floor.widget.dataSource.get(id);
		Loading.open();
		$.ajax({
			url : "/dms/devices/" + id
		}).done(function(data){
			detailPopup.setDataSource([data]);
			detailPopup.open();
		}).fail(failResp).always(function(){
			Loading.close();
		});

		detailPopup.open();
	};
	/**
	*   <ul>
	*   	<li>현재 로드된 Schedule 정보에 따라 날짜/시간 View의 UI를 업데이트한다.</li>
	*   </ul>
	*   @function applyDateTimeViewModel
	*   @param {Object} e - 생성/수정할 Schedule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var onGroupDetailRowEvt = function(e){
		var id = $(this).data("id");
		Loading.open();
		getGroupDeviceInfo(id).done(function(data){
			detailPopup.setDataSource(data);
			detailPopup.open();
		}).fail(failResp).always(function(){
			Loading.close();
		});
	};
	/**
	*   <ul>
	*   	<li>현재 로드된 Rule 정보에 따라 조건 설정 View의 UI를 업데이트한다.</li>
	*   </ul>
	*   @function applyConditionViewModel
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var applyConditionViewModel = function(loadedRule){
		var dfd = new $.Deferred();

		var condition = loadedRule.condition;

		if(condition && condition.rules && condition.rules.length > 0 && (isEdit || isLoadedRule)){
			var idList = [];
			var ruleDeviceList = [];
			var rule, devices, rules = condition.rules;
			// var viewRule;	//[2018-04-12][선언후 미사용]
			var i, j, length, max = rules.length;
			rules.sort(function(a, b){
				return a.order - b.order;
			});

			//Building, Floor, Zone 정보를 가져오기 위해 ID List를 생성하고,
			//해당 ID List로 디바이스 정보를 가져온 후에 View Model을 적용한다.
			for( i = 0; i < max; i++ ){
				rule = rules[i];
				devices = rule.devices;
				length = devices.length;
				for( j = 0; j < length; j++ ){
					idList.push(devices[j].dms_devices_id);
				}
			}

			Loading.open();
			MainViewModel.set('editLoadReady', false);
			MainViewModel.set('notRegistered', false);
			$.ajax({
				url : "/dms/devices?ids=" + idList.join(",")
			}).done(function(data){
				for(var index = 0; index < data.length; index++){
					if(data[index].registrationStatus === "NotRegistered"){
						MainViewModel.set('notRegistered', true);
					}
				}
				ruleDeviceList = data;
				ruleDeviceList = new kendo.data.DataSource({
					data : data
				});
				ruleDeviceList.read();
			}).fail(failResp).always(function(){
				// 층, 존, 디바이스 정보와 Rule 정보를 Set 한다.
				ConditionViewModel.set("isUpdate", true);
				for( i = 0; i < max; i++ ){
					rule = rules[i];
					ConditionViewModel.updateRule(rule, ruleDeviceList);
				}

				setTimeout(function(){
					// ConditionViewModel.set("isUpdate", false);
					// MainViewModel.set('editLoadReady', true);
				}, 4000);
				Loading.close();
				dfd.resolve();
			});
		}else{
			dfd.resolve();
		}
		return dfd.promise();
	};

	/**
	*   <ul>
	*   	<li>현재 로드된 Rule 정보에 따라 운영 View의 UI를 업데이트한다.</li>
	*   </ul>
	*   @function applyOperationViewModel
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var applyOperationViewModel = function(loadedRule){
		/*DateTime*/
		var startDate = loadedRule.startDate;
		var endDate = loadedRule.endDate;
		var daysOfWeek = loadedRule.daysOfWeek;
		var executionTime = loadedRule.times;

		var sd, ed;					//[2018-04-12][초기화를 모두 하므로 재선언 필요없이 전역에 사용하도록 수정]
		var i, max, key;		//[2018-04-12][해당변수들은 재선언되는 경우가많아 이를 수정하기위해서 변수명으로 수정하지않고 해당 스코프 함수범위에 사용하는 i, max, key는 사용전 초기화 되는것을 확인 재선언을 지우고 상위변수에 할당하도록 수정]

		if(daysOfWeek){
			max = daysOfWeek.length;
			// var key;
			for( i = 0; i < max; i++ ){
				key = daysOfWeek[i].toLowerCase();
				OperationViewModel.daysOfWeek.set(key, true);
			}
		}

		if(startDate){
			sd = new Date(startDate);
			OperationViewModel.startDate = sd;
			OperationViewModel.set("startDateDisplay", Util.convertDateFormat(sd));
			OperationViewModel.set('startDate',startDate);		//[2018-05-02][편집시 운영 날짜에서 설정된 날짜가 아닌 현재날짜로 출력되던현상 수정]
		}

		if(endDate){
			ed = new Date(endDate);		//[2018-04-12][var 제거]
			var year = ed.getFullYear();
			if(year == RuleModel.MAX_END_DATE_YEAR){
				ed = new Date(sd.getFullYear(), sd.getMonth() + 1, sd.getDate());
				OperationViewModel.set("isEndless", true);
			}
			var formattedEd = Util.convertDateFormat(ed);
			OperationViewModel.endDate = ed;
			OperationViewModel.set("endDateDisplay", formattedEd);
			OperationViewModel.set('endDate', formattedEd);			//[2018-05-02][편집시 운영 날짜에서 설정된 날짜가 아닌 현재날짜로 출력되던현상 수정]
		}

		if(executionTime){
			var timesJson = executionTime.toJSON();
			max = timesJson.length;
			var timesArr = [];
			var startTime, endTime, date, split;
			// var isAlldayTime = false;			//[2018-04-12][변수선언후 미사용]
			for( i = 0; i < max; i++ ){
				startTime = timesJson[i].startTime;
				endTime = timesJson[i].endTime;
				date = new Date();
				split = startTime.split(":");
				console.info(split);
				date.setHours(split[0]);
				date.setMinutes(split[1]);
				date.setSeconds(0);
				startTime = date;
				split = endTime.split(":");
				date = new Date();
				date.setHours(split[0]);
				date.setMinutes(split[1]);
				date.setSeconds(0);
				console.info(split);
				endTime = date;

				timesArr.push({
					startTime : startTime,
					endTime : endTime
				});
			}
			OperationViewModel.set("times", timesArr);
			// console.log(OperationViewModel.get("isAllDayValue"));
			if(isEdit && !OperationViewModel.get("isAllDayValue")){
				OperationViewModel.set("isAllDay", false);
			}
		}else{
			//null 일 경우 AllDay True
			sd = new Date();		//[2018-04-12][var 제거]
			ed = new Date();		//[2018-04-12][var 제거]
			//ed.setHours(sd.getHours()+1);
			// sd.setHours(0);
			// sd.setMinutes(0);
			// sd.setSeconds(0);
			// ed.setHours(23);
			// ed.setMinutes(59);
			// ed.setSeconds(59);
			sd = moment(sd).set({hour:0,minute:0,second:0}).format("HH:mm:ss");
			ed = moment(ed).set({hour:23,minute:59,second:59}).format("HH:mm:ss");
			// sd = moment(sd).format("HH:mm:ss");
			// ed = moment(ed).format("HH:mm:ss");
			var times = OperationViewModel.get("times");
			times.push({ startTime : sd, endTime : ed});
			OperationViewModel.set("isAllDay", true);
			OperationViewModel.set("isAllDayValue", true);
		}

		if(isRuleAlarm){
			var alarmType = loadedRule.alarmType;
			if(alarmType){
				OperationViewModel.set("alarmRadioChecked", alarmType);
			}
			return;
		}

		var deviceTypes = loadedRule.deviceTypes;
		var control = {
			operations : [],
			temperatures : [],
			modes : [],
			configuration : {},
			aoControlPoint : {},
			doControlPoint : {},
			lights : []
		};
		if(deviceTypes){
			// var i;
			max = deviceTypes.length;
			var deviceType, deviceControl, deviceControlObj;
			for( i = 0; i < max; i++ ){
				deviceType = deviceTypes[i];
				deviceControl = deviceType.control;
				if(deviceControl){
					if(deviceControl.operations){
						deviceControlObj = deviceControl.operations;
						if(deviceControlObj instanceof kendo.data.ObservableArray){
							deviceControlObj = deviceControlObj.toJSON();
						}
						control.operations = control.operations.concat(deviceControlObj);
					}
					if(deviceControl.temperatures){
						deviceControlObj = deviceControl.temperatures;
						if(deviceControlObj instanceof kendo.data.ObservableArray){
							deviceControlObj = deviceControlObj.toJSON();
						}
						control.temperatures = control.temperatures.concat(deviceControlObj);
					}
					if(deviceControl.modes){
						deviceControlObj = deviceControl.modes;
						if(deviceControlObj instanceof kendo.data.ObservableArray){
							deviceControlObj = deviceControlObj.toJSON();
						}
						control.modes = control.modes.concat(deviceControlObj);
					}
					if(deviceControl.configuration){
						control.configuration = deviceControl.configuration;
					}

					if(deviceType.dms_devices_type.indexOf("AO") != -1 && deviceControl.controlPoint){
						control.aoControlPoint = deviceControl.controlPoint;
					}

					if(deviceType.dms_devices_type.indexOf("DO") != -1 && deviceControl.controlPoint){
						control.doControlPoint = deviceControl.controlPoint;
					}

					if(deviceControl.lights){
						control.lights = deviceControl.lights;
					}
				}
			}
		}
		loadedRule.control = control;

		/*Control Panel*/
		var loadedRuleControl = loadedRule.control;			//[2018-04-12][기존 control -> loadedRuleControl 수정]
		var algorithm = loadedRule.algorithm;
		var operations = loadedRuleControl.operations,
			temperatures = loadedRuleControl.temperatures,
			modes = loadedRuleControl.modes,
			configuration = loadedRuleControl.configuration,
			aoControlPoint = loadedRuleControl.aoControlPoint,
			doControlPoint = loadedRuleControl.doControlPoint,
			lights = loadedRuleControl.lights;

		var KEYS = {
			"AirConditioner.Indoor" : "indoor",
			"AirConditioner.Indoor.Room" : "indoor",
			// "AirConditioner.Indoor.Room" : "indoor",		//[2018-04-12][동일 내용으로 중복선언 주석처리]
			"AirConditioner.Indoor.Room.Auto" : "indoor",
			"AirConditioner.Indoor.Room.Heat" : "indoor",
			"AirConditioner.Indoor.Room.Cool" : "indoor",
			"AirConditioner.Indoor.General" : "indoor",
			"AirConditioner.Indoor.WaterOutlet" : "indoor",
			"AirConditioner.Indoor.DHW" : "dhw",
			"AirConditioner.DHW" : "dhw",
			// "AirConditioner.Indoor.DHW" : "dhw",			//[2018-04-12][동일 내용으로 중복선언 주석처리]
			"AirConditioner.Indoor.Ventilator" : "ventilator",
			"ControlPoint" : "point",
			"ControlPoint.AO" : "point.aoav",
			"ControlPoint.AV" : "point.aoav",
			"ControlPoint.DO" : "point.dodv",
			"ControlPoint.DV" : "point.dodv",
			"General" : "light"
		};

		var power, op, id;		//[2018-04-12][상위에 선언 모두 초기화확인]
		var viewModel = OperationViewModel.operation;
		if(operations){
			// var i, key;
			max = operations.length;
			for( i = 0; i < max; i++ ){
				op = operations[i];
				id = op.id;
				key = KEYS[id];
				power = op.power;
				//power = power == "On" ? true : false;
				if(viewModel[key] && !viewModel[key].power.get("disabled")){
					if(power){
						viewModel[key].power.set("checked", power);
					}
					if(power == "On"){
						viewModel[key].power.set("active", power);
					}
				}
			}
		}

		if(modes){
			var mode, operModes, j, oper, length;
			max = modes.length;
			for( i = 0; i < max; i++ ){
				op = modes[i];
				id = op.id;
				key = KEYS[id];
				mode = op.mode;
				if(viewModel[key]){
					oper = viewModel[key].operation;
				}

				if(!oper || viewModel[key].power.get("disabled")){
					continue;
				}
				if(key == "light" && viewModel[key].get("disabled")){
					continue;
				}

				operModes = oper.mode;

				length = operModes.length;
				for( j = 0; j < length; j++ ){
					if(operModes[j].name == mode){
						viewModel[key].operation.set("checked", true);
						operModes[j].set("active", true);
					}
				}
			}
		}

		if(temperatures){
			var desired;
			max = temperatures.length;
			for( i = 0; i < max; i++ ){
				op = temperatures[i];
				id = op.id;
				key = KEYS[id];

				desired = op.desired;
				if(viewModel[key] && !viewModel[key].power.get("disabled")){
					if(id.indexOf("Water") != -1){
						viewModel[key].waterTemp.set("checked", true);
						viewModel[key].waterTemp.set("desired", desired);
					}else{
						viewModel[key].temperature.set("checked", true);
						viewModel[key].temperature.set("desired", desired);
					}
				}
			}
		}

		if(aoControlPoint && aoControlPoint.value !== null && typeof aoControlPoint.value !== 'undefined'){
			if(!viewModel.point.aoav.get("disabled")){
				viewModel.point.aoav.set("checked", true);
				viewModel.point.aoav.set("value", aoControlPoint.value);
			}
		}

		if(doControlPoint && doControlPoint.value !== null && typeof doControlPoint.value !== 'undefined'){
			if(!viewModel.point.dodv.get("disabled")){
				viewModel.point.dodv.set("checked", true);
				var onOff = doControlPoint.value == 1 ? true : false;
				viewModel.point.dodv.set("active", onOff);
			}
		}

		if(lights && lights.length > 0){
			lights = lights[0];
			if(!viewModel.light.get("disabled")){
				viewModel.light.set("checked", true);
				viewModel.light.set("value", lights.dimmingLevel);
			}
		}

		var remoteControl;	//[2018-04-12][control 변수명 -> remoteControl]
		if(configuration && configuration.remoteControl){
			remoteControl = configuration.remoteControl;
			if(!viewModel.remoteControl.get("disabled")){
				viewModel.remoteControl.set("checked", true);
				max = viewModel.remoteControl.control.length;

				for( i = 0; i < max; i++ ){
					if(remoteControl == viewModel.remoteControl.control[i].name){
						viewModel.remoteControl.set("checked", true);
						viewModel.remoteControl.control[i].set("active", true);
						break;
					}
				}
			}
		}

		if(algorithm && !viewModel.pre.get("disabled")){
			if(algorithm.enabled){
				viewModel.pre.set("checked", true);
			}
			if(algorithm.mode == "PreCooling"){
				viewModel.pre.cool.set("value", algorithm.preCoolingTemperature);
				viewModel.pre.cool.set("disabled", false);
			}else if(algorithm.mode == "PreHeating"){
				viewModel.pre.heat.set("value", algorithm.preHeatingTemperature);
				viewModel.pre.heat.set("disabled", false);
			}
			viewModel.pre.set("radioChecked", algorithm.mode);
		}

	};
	/**
	*   <ul>
	*   	<li>현재 로드된 Rule 정보에 따라 생성 View의 UI를 업데이트한다.</li>
	*   </ul>
	*   @function applyCreationViewModel
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*
	*/
	var applyCreationViewModel = function(loadedRule){
		if(loadedRule.description){
			CreationViewModel.set("description", loadedRule.description);
		}

		if(loadedRule.name){
			CreationViewModel.set("name", loadedRule.description);
		}
	};
	/**
	*   <ul>
	*   	<li>현재 생성/수정할 Rule 정보를 현재 조건 설정, 생성 View에 반영되도록 View를 업데이트한다.</li>
	*   </ul>
	*   @function applyRuleForViewModel
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var applyRuleForViewModel = function(loadedRule){
		if(loadedRule.title && !loadedRule.name){
			loadedRule.name = loadedRule.title;
		}

		if(loadedRule.end){
			loadedRule.endDate = loadedRule.end;
		}

		if(loadedRule.start){
			loadedRule.startDate = loadedRule.start;
		}

		return applyConditionViewModel(loadedRule).always(function(){
			applyCreationViewModel(loadedRule);
		});
		//applyOperationViewModel(loadedRule);
	};
	/**
	*   <ul>
	*  		<li>현재 생성/수정할 Rule 정보의 실행시간, 시작/종료 날짜 데이터를 API호출 하기위한 데이터 형식으로 업데이트한다.</li>
	*   </ul>
	*   @function setTimeForRequest
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @param {Boolean} isFinalStep -마지막 생성 버튼을 클릭하여 생성하는 Case의 여부
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var setTimeForRequest = function(loadedRule){		//[2018-04-12][isFinalStep 사용하는 구문들이 기존에 주석처리되어 미사용 파라메타로 되어 제거함]
		var startDate = OperationViewModel.startDate;
		startDate = moment(startDate).format("YYYY-MM-DD");
		var endDate = OperationViewModel.endDate;
		var isEndless = OperationViewModel.isEndless;
		var isAllDay = OperationViewModel.isAllDay;
		endDate = moment(endDate).format("YYYY-MM-DD");

		/*if(isFinalStep && executionTimeList){

			if(Settings.getTimeDisplay() == "12Hour"){
				max = executionTimeList.length;

				for( i = 0; i < max; i++){
					startTime = executionTimeList[i].startTime;
					endTime = executionTimeList[i].endTime;
					executionTimeList[i].startTime = Util.convertFullHours(startTime);
					executionTimeList[i].endTime = Util.convertFullHours(endTime);
				}
			}
		}*/

		//loadedRule.times = executionTimeList;
		//datecheck
		loadedRule.startDate = startDate;
		loadedRule.endDate = endDate;
		if(isEndless){
			//if(isFinalStep){
			// loadedRule.endDate = null;
			loadedRule.endDate = RuleModel.MAX_END_DATE;	//[2018-08-16][BIOTFE-285] "무기한" 일 경우 endDate 에 2099-12-31 로 전송하도록 수정 요청
			/*}else{
				loadedRule.endDate = endDate;
			}*/
		}
		// 종일 확인
		if(isAllDay){
			loadedRule.times = null;
		}
	};

	/**
	*   <ul>
	*   	<li>조건 설정에서 선택한 제어 요소의 상태 값으로 해당 상태 값의 Display Text를 가져온다.</li>
	*   </ul>
	*   @function getStatusText
	*   @param {String} monitor - 제어 요소
	*   @param {String} value - 선택한 상태 값
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var getStatusText = function(monitor, value){
		var key, statusDs = ViewModel.statusDataSource;
		var i, max, monitors, valueText = value, valueList;
		var j, size;
		for( key in statusDs ){
			monitors = statusDs[key];
			max = monitors.length;
			for( i = 0; i < max; i++ ){
				if( monitor == monitors[i].value ){
					monitor = monitors[i].text;
					valueList = monitors[i].valueList;
					if(valueList){
						size = valueList.length;
						for( j = 0; j < size; j++ ){
							if(valueList[j].value == value){
								valueText = valueList[j].text;
							}
						}
						return {
							statusText : monitor,
							valueText : valueText
						};
					}
					return {
						statusText : monitor,
						valueText : value
					};

				}
			}
		}
		return {
			statusText : monitor,
			valueText : value
		};
	};
	/**
	*   <ul>
	*   	<li>현재 생성/수정할 Rule 정보를 현재 조건 설정 View에서 설정한 데이터로 업데이트한다.</li>
	*   </ul>
	*   @function getDataFromConditionViewModel
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var getDataFromConditionViewModel = function(loadedRule){
		var viewRules = ConditionViewModel.rules;

		if(!loadedRule.condition){
			loadedRule.condition = {};
		}

		if(!loadedRule.condition.rules){
			loadedRule.condition.rules = [];
		}
		// var rules = loadedRule.condition.rules;		//[2018-04-12][해당변수 선언이후로 미사용 주석처리]
		var i, j, length, max = viewRules.length;

		var rule;

		var viewRule, ruleArr = [];
		var id, type, name, device, isAnd, isOr;
		// var devices, valueText; //[2018-04-12][해당변수들은 선언이후로 미사용 주석처리]
		var calculation, operator, monitor, value, duration, split;
		for( i = 0; i < max; i++ ){
			rule = { devices : [] };
			rule.order = i + 1;
			viewRule = viewRules[i];
			calculation = viewRule.calculation.options.get("value");
			if(calculation instanceof kendo.data.ObservableObject){
				calculation = calculation.value;
			}
			rule.calculation = calculation;
			operator = viewRule.comparison.options.get("value");
			if(operator instanceof kendo.data.ObservableObject){
				operator = operator.value;
			}
			if(operator == "="){
				operator = "==";
			}
			rule.operator = operator;

			monitor = viewRule.status.options.get("value");
			if(monitor instanceof kendo.data.ObservableObject){
				rule.statusText = monitor.text;
				monitor = monitor.value;
			}

			if(monitor !== 'alarms-alarms_name'){
				// DI/DO, AI/AO 구분을 위하여 임의로 생성된 스트링을 제거한다.
				split = monitor.split("_");
				if(split.length > 1){
					monitor = split[0];
				}
			}
			rule.monitor = monitor;

			if(!viewRule.valueList.get("invisible")){
				value = viewRule.valueList.get("value");
			}else if(!viewRule.valueTemperature.get("invisible")){
				value = viewRule.valueTemperature.get("value");
			}else if(!viewRule.valueInput.get("invisible")){
				var tmpValue = viewRule.valueInput.get("value");
				if(String(tmpValue).indexOf(".") !== -1){
					// tmpValue = Number(tmpValue.toFixed(1));
					tmpValue = Util.convertNumberFormat(tmpValue);
				}
				if(monitor === "controlPoint-value"){
					value = String(tmpValue); // [2018-06-25][[BIOTFE-57]관제점 값 String 으로 수정]
				}else{
					value = tmpValue;
				}
			}else if(isLoaded && isForceNext){
				//Load 시에는 invisible 상태에서 Next Step을 밟으므로 invisible 상태와 관계 없이 Value를 가져온다.
				//invisible 상태는 Status가 변경되어야하는데, DropDownList에서 ID 변경 후 API 호출이 발생한 뒤 변경되므로
				//위 방식으로는 Sync를 맞출 수 없음.
				value = viewRule.valueList.get("value") || viewRule.valueTemperature.get("value") || viewRule.valueInput.get("value");
			}

			if(value instanceof kendo.data.ObservableObject){
				rule.valueText = value.text;
				value = value.value;
			}
			rule.value = value;

			if(!rule.statusText || !rule.valueText){
				var obj = getStatusText(monitor, value);
				rule.statusText = rule.statusText ? rule.statusText : obj.statusText;
				rule.valueText = rule.valueText ? rule.valueText : obj.valueText;
			}

			duration = viewRule.duration.options.get("value");

			if(duration instanceof kendo.data.ObservableObject){
				duration = duration.value;
			}
			rule.duration = duration;

			isAnd = viewRule.get("isAnd");
			isOr = viewRule.get("isOr");

			//단일 Rule이거나 마지막 Rule인 경우, logicOpr 전송안함.
			if(i != max - 1){
				if(isAnd){
					rule.logicOpr = "AND";
				}else if(isOr){
					rule.logicOpr = "OR";
				}
			}

			length = viewRule.devices.length;
			for( j = 0; j < length; j++ ){
				device = viewRule.devices[j];
				id = device.id.get("value");
				if(id instanceof kendo.data.ObservableObject){
					name = id.name;
					type = id.type;
					id = id.id;
				}else{
					type = device.id.get("type");
					name = device.id.get("name");
				}
				type = Util.getGeneralType(type);
				/*type = device.type.get("value");
				if(type instanceof kendo.data.ObservableObject){
					type = type.type;
				}*/

				rule.devices.push({
					dms_devices_id : id,
					dms_devices_type : type,
					dms_devices_name : name
				});
			}
			ruleArr.push(rule);
		}

		loadedRule.condition.rules = ruleArr;
	};

	var DeviceKeys = {
		indoor : "AirConditioner.Indoor.General",
		ventilator : "AirConditioner.Indoor.Ventilator",
		dhw : "AirConditioner.Indoor.DHW",
		point : "ControlPoint"
	};
	/**
	*   <ul>
	*   	<li>현재 생성/수정할 Rule 정보를 현재 운영 View에서 설정한 데이터로 업데이트한다.</li>
	*   </ul>
	*   @function getDataFromOperationViewModel
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var getDataFromOperationViewModel = function(loadedRule){
		/*
			DateTime
		*/
		setTimeForRequest(loadedRule);
		var daysOfWeek = OperationViewModel.get("daysOfWeek");
		var executionTime = OperationViewModel.get("times");
		var i, max, obj;

		var rpArr = [];
		var val = daysOfWeek.mon ? "Mon" : "";
		if(val){
			rpArr.push(val);
		}
		val = daysOfWeek.tue ? "Tue" : "";
		if(val){
			rpArr.push(val);
		}
		val = daysOfWeek.wed ? "Wed" : "";
		if(val){
			rpArr.push(val);
		}
		val = daysOfWeek.thu ? "Thu" : "";
		if(val){
			rpArr.push(val);
		}
		val = daysOfWeek.fri ? "Fri" : "";
		if(val){
			rpArr.push(val);
		}
		val = daysOfWeek.sat ? "Sat" : "";
		if(val){
			rpArr.push(val);
		}
		val = daysOfWeek.sun ? "Sun" : "";
		if(val){
			rpArr.push(val);
		}

		loadedRule.daysOfWeek = rpArr;
		// var split;			//[2018-04-12][해당변수는 선언이후로 미사용 주석처리]
		// var i, max;			//[2018-04-12][변수들은 함수내에 상위 지역변수로 선언되있음 해당변수들은 변수를 사용하기전 초기화되는것을 확인 상위변수를 사용해도 무방하다고판단 수정 ]
		var startTime, endTime;

		var timesList = [];

		if(executionTime){
			max = executionTime.length;
			for( i = 0; i < max; i++ ){
				startTime = executionTime[i].startTime;
				endTime = executionTime[i].endTime;
				if(startTime instanceof Date){
					// startTime = Util.convertTimeFormat(startTime);		//[2018-08-31][시분초에서 시분으로 수정 해당 함수는 시분초를 리턴하기에 주석처리]
					startTime = moment(startTime).format("HH:mm");
				}

				if(endTime instanceof Date){
					// endTime = Util.convertTimeFormat(endTime);			//[2018-08-31][시분초에서 시분으로 수정 해당 함수는 시분초를 리턴하기에 주석처리]
					endTime = moment(endTime).format("HH:mm");
				}
				timesList.push({
					startTime : startTime,
					endTime : endTime
				});
			}
		}

		loadedRule.set("times",timesList);

		//var ds = mapListPanel.dataSource;
		var ds = Views.list.floor.widget.dataSource;
		var data = ds.data();
		var selectedDevices = new kendo.data.Query(data).filter({
			logic : 'and',
			filters : [{ field : "selected", operator : "eq", value : true}]
		}).toArray();

		max = selectedDevices.length;				//[2018-04-12][i는 제거 max는 할당만 하도록 수정 ]
		var type, selectedDevicesTmp;				//[2018-04-12][data변수는 상위에 이미 선언되어 변수명을 selectedDevicesTmp으로 수정 obj는 사용전 초기화하는것을 확인 상위에 선언하도록 수정]
		var devices = [];
		for( i = 0; i < max; i++ ){
			obj = {};
			selectedDevicesTmp = selectedDevices[i];
			obj.dms_devices_id = selectedDevicesTmp.id;
			obj.dms_devices_name = selectedDevicesTmp.name;
			type = selectedDevicesTmp.type;
			//[2018-05-09][Util.getGeneralType AirConditioner AirConditioner.Indoor 수정하는 메소드 향후 AirConditioner 통합할떄 주의 dms_device_type]
			type = Util.getGeneralType(type);
			obj.dms_devices_type = type;
			if(selectedDevicesTmp.locations && selectedDevicesTmp.locations[0]){
				obj.location = selectedDevicesTmp.locations[0].description;
			}
			devices.push(obj);
		}

		loadedRule.devices = devices;

		/*
			Rule Alarm & Log
		*/
		if(isRuleAlarm){
			if(!loadedRule.alarmType){
				loadedRule.alarmType = {};
			}
			loadedRule.alarmType = OperationViewModel.get("alarmRadioChecked");
		}

		/*
			Control Panel & Algorithm(Pre Cooling & Heating)
		*/

		if(!loadedRule.control){
			loadedRule.control = {};
		}

		var operations = OperationViewModel.operation;
		var indoor = operations.indoor;
		var ventilator  = operations.ventilator;
		var dhw = operations.dhw;
		var light = operations.light;
		var operArr = [];
		var modes;			//[2018-04-12][i, max, obj,변수들은 함수내에 상위 지역변수로 선언되있음 해당변수들은 변수를 사용하기전 초기화되는것을 확인 상위변수를 사용해도 무방하다고판단 수정 ]
		/*Power*/
		if(indoor.power.checked){
			obj = {
				id : DeviceKeys.indoor
			};
			if(indoor.power.active){
				obj.power = "On";
			}else{
				obj.power = "Off";
			}
			operArr.push(obj);
		}

		if(ventilator.power.checked){
			obj = {
				id : DeviceKeys.ventilator
			};
			if(ventilator.power.active){
				obj.power = "On";
			}else{
				obj.power = "Off";
			}
			operArr.push(obj);
		}

		if(dhw.power.checked){
			obj = {
				id : DeviceKeys.dhw
			};
			if(dhw.power.active){
				obj.power = "On";
			}else{
				obj.power = "Off";
			}
			operArr.push(obj);
		}

		var indoorOperObj = {
			dms_devices_type : "AirConditioner.Indoor",
			// dms_devices_type : "AirConditioner",		//[2018-05-09][Rule 에서만 국지적으로 "AirConditioner" 로 사용하도록 변경 필요 이슈 수정]
			control : {}
		};

		if(operArr.length > 0){
			//Server로 Request 하기 위한 데이터
			indoorOperObj.control.operations = operArr;
		}

		var lightOperObj = {
			dms_devices_type : "Light",
			control : {}
		};
		var lightOperArr = [];

		if(light.power.checked){
			obj = {
				id : "General"
			};

			obj.power = light.power.active ? "On" : "Off";
			lightOperArr.push(obj);
			lightOperObj.control.operations = lightOperArr;
			operArr = operArr.concat(lightOperArr);
		}


		if(operArr.length > 0){
			//Creation View에서 표시하기 위한 데이터
			loadedRule.control.operations = operArr;
		}else{
			delete loadedRule.control.operations;
		}

		var modesArr = [];
		// var indoorTemp = "";		//[2018-04-12][기존 해당변수를 사용하는 코드가 주석처리되어 미사용변수가 되어 주석처리함]
		if(indoor.operation.checked){
			modes = indoor.operation.mode;
			max = modes.length;
			for(i = 0; i < max; i++){
				if(modes[i].active){
					// indoorTemp = modes[i].name;		//[2018-04-12][기존 해당변수를 사용하는 코드가 주석처리되어 미사용변수가 되어 주석처리함]
					obj = {
						id : DeviceKeys.indoor,
						mode : modes[i].name
					};
					modesArr.push(obj);
				}
			}
		}

		if(ventilator.operation.checked){
			modes = ventilator.operation.mode;
			max = modes.length;
			for(i = 0; i < max; i++){
				if(modes[i].active){
					obj = {
						id : DeviceKeys.ventilator,
						mode : modes[i].name
					};
					modesArr.push(obj);
				}
			}
		}

		if(dhw.operation.checked){
			modes = dhw.operation.mode;
			max = modes.length;
			for(i = 0; i < max; i++){
				if(modes[i].active){
					obj = {
						id : DeviceKeys.dhw,
						mode : modes[i].name
					};
					modesArr.push(obj);
				}
			}
		}

		if(modesArr.length > 0){
			//Creation View에서 표시하기 위한 데이터
			loadedRule.control.modes = modesArr;
			//서버로 Request 하기 위한 데이터
			indoorOperObj.control.modes = modesArr;
		}else{
			delete loadedRule.control.modes;
		}

		var temperatures;
		var temperArr = [];
		var id;
		if(indoor.temperature.checked){
			temperatures = indoor.temperature;
			id = DeviceKeys.indoor.replace(".General", ".Room");
			//id += indoorTemp;
			obj = {
				id : id,
				desired : temperatures.get("desired")
			};
			temperArr.push(obj);
		}

		var waterTemp;
		if(indoor.waterTemp.checked){
			waterTemp = indoor.waterTemp;
			id = DeviceKeys.indoor.replace(".General", ".WaterOutlet");
			//id += indoorTemp;
			obj = {
				id : id,
				desired : waterTemp.get("desired")
			};
			temperArr.push(obj);
		}


		if(dhw.temperature.checked){
			temperatures = dhw.temperature;
			obj = {
				id : DeviceKeys.dhw,
				desired : temperatures.get("desired")
			};
			temperArr.push(obj);
		}

		if(temperArr.length > 0){
			//Creation View에서 표시하기 위한 데이터
			loadedRule.control.temperatures = temperArr;
			//Server로 Request 하기 위한 데이터
			indoorOperObj.control.temperatures = temperArr;
		}else{
			delete loadedRule.control.temperatures;
		}

		var control, controlObj = {};
		if(operations.remoteControl.checked){
			control = operations.remoteControl.control;
			max = control.length;
			for( i = 0; i < max; i++ ){
				if(control[i].active){
					controlObj = {
						remoteControl : control[i].name
					};
				}
			}
		}

		if(!$.isEmptyObject(controlObj)){
			//Creation View에서 표시하기 위한 데이터
			loadedRule.control.configuration = controlObj;
			//Server로 Request 하기 위한 데이터
			indoorOperObj.control.configuration = controlObj;
		}else{
			delete loadedRule.control.configuration;
		}

		var aoavPointObj = {
			dms_devices_type : "ControlPoint.AO",
			control : {}
		};

		var dodvPointObj = {
			dms_devices_type : "ControlPoint.DO",
			control : {}
		};

		var value, aoavControlPoint = {};
		if(operations.point.aoav.checked){
			value = operations.point.aoav.get("value");
			if(typeof value == "number") value = value.toString();
			aoavControlPoint.value = value;
			//Server로 Request 하기 위한 데이터
			aoavPointObj.control.controlPoint = aoavControlPoint;
		}

		var dodvControlPoint = {};
		if(operations.point.dodv.checked){
			value = operations.point.dodv.get("active") ? 1 : 0;
			if(typeof value == "number") value = value.toString();
			dodvControlPoint.value = value;
			//Server로 Request 하기 위한 데이터
			dodvPointObj.control.controlPoint = dodvControlPoint;
		}

		//Creation View에서 표시하기 위한 데이터
		//Creation View에서 표시하기 위한 데이터
		if(!$.isEmptyObject(aoavControlPoint)){
			loadedRule.control.aoControlPoint = aoavControlPoint;
		}else{
			delete loadedRule.control.aoControlPoint;
		}

		if(!$.isEmptyObject(dodvControlPoint)){
			loadedRule.control.doControlPoint = dodvControlPoint;
		}else{
			delete loadedRule.control.doControlPoint;
		}

		var lights = [];
		if(operations.light.checked){
			value = operations.light.get("value");
			lights.push({
				id : 1,
				dimmingLevel : value
			});
			//Creation View에서 표시하기 위한 데이터
			loadedRule.control.lights = lights;
			//서버 전송을 위한 데이터
			lightOperObj.control.lights = lights;
		}else{
			delete loadedRule.control.lights;
		}

		// var pre = {};		//[2018-04-12][변수선언 할당이후 미사용 주석처리]
		var isDisabled = operations.pre.cool.get("disabled") && operations.pre.heat.get("disabled");
		if(operations.pre.checked && !isDisabled){
			if(!loadedRule.algorithm){
				loadedRule.algorithm = {};
			}
			loadedRule.algorithm.enabled = true;
			var radioChecked = operations.pre.get("radioChecked");
			if(radioChecked == "PreCooling"){
				loadedRule.algorithm.mode = radioChecked;
				value = operations.pre.cool.get("value");
				loadedRule.algorithm.preCoolingTemperature = value;

			}else if(radioChecked == "PreHeating"){
				loadedRule.algorithm.mode = radioChecked;
				value = operations.pre.heat.get("value");
				loadedRule.algorithm.preHeatingTemperature = value;
			}
		}

		var deviceTypes = loadedRule.deviceTypes;
		var typeControl;
		if(deviceTypes){
			max = deviceTypes.length;
			if(!$.isEmptyObject(indoorOperObj.control)){
				typeControl = null;
				for( i = 0; i < max; i++){
					if(deviceTypes[i].dms_devices_type.indexOf("AirConditioner.Indoor") != -1){
					// if(deviceTypes[i].dms_devices_type.indexOf("AirConditioner") != -1){		//[2018-05-09][Rule 에서만 국지적으로 "AirConditioner" 로 사용하도록 변경 필요 이슈 수정]
						deviceTypes[i].control = indoorOperObj.control;
						typeControl = deviceTypes[i].control;
						break;
					}
				}
				if(!typeControl){
					loadedRule.deviceTypes.push(indoorOperObj);
				}
			}else{
				for( i = max - 1; i >= 0; i--){
					if(deviceTypes[i].dms_devices_type.indexOf("AirConditioner.Indoor") != -1){
					// if(deviceTypes[i].dms_devices_type.indexOf("AirConditioner") != -1){		//[2018-05-09][Rule 에서만 국지적으로 "AirConditioner" 로 사용하도록 변경 필요 이슈 수정]
						deviceTypes.splice(i, 1);
					}
				}
			}
			max = deviceTypes.length;
			if(!$.isEmptyObject(lightOperObj.control)){
				typeControl = null;
				for( i = 0; i < max; i++){
					if(deviceTypes[i].dms_devices_type.indexOf("Light") != -1){
						deviceTypes[i].control = lightOperObj.control;
						typeControl = deviceTypes[i].control;
						break;
					}
				}
				if(!typeControl){
					loadedRule.deviceTypes.push(lightOperObj);
				}
			}else{
				for( i = max - 1; i >= 0; i--){
					if(deviceTypes[i].dms_devices_type.indexOf("Light") != -1){
						deviceTypes.splice(i, 1);
					}
				}
			}
			max = deviceTypes.length;
			if(!$.isEmptyObject(aoavPointObj.control)){
				typeControl = null;

				for( i = 0; i < max; i++){
					if(deviceTypes[i].dms_devices_type.indexOf("ControlPoint.AO") != -1){
						deviceTypes[i].control = aoavPointObj.control;
						typeControl = deviceTypes[i].control;
						break;
					}
				}
				if(!typeControl){
					loadedRule.deviceTypes.push(aoavPointObj);
				}
			}else{
				for( i = max - 1; i >= 0; i--){
					if(deviceTypes[i].dms_devices_type.indexOf("ControlPoint.AO") != -1){
						deviceTypes.splice(i, 1);
					}
				}
			}
			max = deviceTypes.length;
			if(!$.isEmptyObject(dodvPointObj.control)){
				typeControl = null;

				for( i = 0; i < max; i++){
					if(deviceTypes[i].dms_devices_type.indexOf("ControlPoint.DO") != -1){
						deviceTypes[i].control = dodvPointObj.control;
						typeControl = deviceTypes[i].control;
						break;
					}
				}
				if(!typeControl){
					loadedRule.deviceTypes.push(dodvPointObj);
				}
			}else{
				for( i = max - 1; i >= 0; i--){
					if(deviceTypes[i].dms_devices_type.indexOf("ControlPoint.DO") != -1){
						deviceTypes.splice(i, 1);
					}
				}
			}
		}
	};
	/**
	*   <ul>
	*   	<li>현재 생성/수정할 Rule 정보를 현재 생성 View에서 설정한 데이터로 업데이트한다.</li>
	*   </ul>
	*   @function getDataFromOperationViewModel
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var getDataFromCreationViewModel = function(loadedRule){
		//var name = CreationViewModel.get("name");
		//var description = CreationViewModel.get("description");
		var name = $("#schedule-create-name").val();
		var description = $("#schedule-create-description").val();
		loadedRule.name = name;
		loadedRule.description = description;
		// $("#schedule-create-name").data("kendoCommonValidator").validate('name', false)
	};

	/**
	*   <ul>
	*   	<li>현재 생성/수정할 Rule 정보를 생성 View에 표시하기 위하여 생성 View의 ViewModel을 업데이트한다.</li>
	*   </ul>
	*   @function getRuleDataForCreationView
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var getRuleDataForCreationView = function(loadedRule){
		getDataFromConditionViewModel(loadedRule);
		getDataFromOperationViewModel(loadedRule);
		if(!isEdit){
			loadedRule.activated = true;
		}
		var startDate = loadedRuleData.startDate;
		var endDate = loadedRuleData.endDate;
		var name = loadedRuleData.name;
		var description = loadedRuleData.description;
		CreationViewModel.set("name", name);
		CreationViewModel.set("description", description);
		var nameField = $("#schedule-create-name");
		nameField.val(name);

		if(isRuleAlarm){
			nameField.attr("placeholder", I18N.prop("FACILITY_RULE_ENTER_RULE_ALARM_NAME"));
		}else{
			nameField.attr("placeholder", I18N.prop("FACILITY_RULE_ENTER_RULE_NAME"));
		}

		var descElem = $("#schedule-create-description");
		if(!descElem.data("kendoCommonValidator")){
			descElem.kendoCommonValidator( { type : descElem.data("type")} );
		}
		descElem.val(description);

		var rules = loadedRuleData.condition.rules ? loadedRuleData.condition.rules : [];
		CreationViewModel.set("rules", rules);

		CreationViewModel.set("startDate", startDate);
		CreationViewModel.set("endDate", endDate);

		CreationViewModel.set("startDateDisplay", Util.convertDateFormat(startDate));
		var endDateDisplay = endDate ? Util.convertDateFormat(endDate) : I18N.prop("FACILITY_SCHEDULE_ENDLESS");
		CreationViewModel.set("endDateDisplay", endDateDisplay);
		CreationViewModel.set("daysOfWeek", loadedRuleData.daysOfWeek);
		if(loadedRuleData.daysOfWeek){
			var arr = $.extend(true, [], loadedRuleData.daysOfWeek);
			var i, max = arr.length;
			for( i = 0; i < max; i++ ){
				arr[i] = I18N.prop("FACILITY_SCHEDULE_" + arr[i].toUpperCase());
			}
			CreationViewModel.set("daysOfWeekJoin", arr.join(", "));
		}

		loadedRuleData.times.sort();
		var executionTimes = loadedRuleData.times.toJSON();
		CreationViewModel.set("executionTimes", executionTimes);
		//All Day
		var allDay = OperationViewModel.get("isAllDay");
		CreationViewModel.set("isAllDay", allDay);

		if(isRuleAlarm){
			var alarmType = loadedRuleData.alarmType;
			CreationViewModel.set("alarmType", alarmType);
			CreationViewModel.set("alarmTypeText", I18N.prop("FACILITY_DEVICE_STATUS_" + alarmType.toUpperCase()));
		}
		var operations = loadedRuleData.control.operations ? loadedRuleData.control.operations : [];
		CreationViewModel.set("control.operations", operations);
		var modes = loadedRuleData.control.modes ? loadedRuleData.control.modes : [];
		CreationViewModel.set("control.modes", modes);
		var temperatures = loadedRuleData.control.temperatures ? loadedRuleData.control.temperatures : [];
		CreationViewModel.set("control.temperatures", temperatures);
		var configuration = loadedRuleData.control.configuration ? loadedRuleData.control.configuration : {};
		CreationViewModel.set("hasRemoteControl", !$.isEmptyObject(configuration));
		CreationViewModel.set("control.configuration", configuration);
		CreationViewModel.setRemoteControlText();
		var controlPoint = loadedRuleData.control.aoControlPoint ? loadedRuleData.control.aoControlPoint : {};
		CreationViewModel.set("hasAoPoint", !$.isEmptyObject(controlPoint));
		CreationViewModel.set("control.aoControlPoint", controlPoint);
		controlPoint = loadedRuleData.control.doControlPoint ? loadedRuleData.control.doControlPoint : {};
		CreationViewModel.set("hasDoPoint", !$.isEmptyObject(controlPoint));
		CreationViewModel.set("control.doControlPoint", controlPoint);
		var lights = loadedRuleData.control.lights ? loadedRuleData.control.lights : [];
		CreationViewModel.set("control.lights", lights);
	};

	/**
	*   <ul>
	*   	<li>현재 생성/수정할 Rule 정보를 조건 설정, 운영, 생성 View에서 설정한 데이터로 업데이트한다.</li>
	*   </ul>
	*   @function getRuleDataFromViewModel
	*   @param {Object} loadedRule - 생성/수정할 Rule 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var getRuleDataFromViewModel = function(loadedRule){
		getDataFromConditionViewModel(loadedRule);
		//duration 이 존재하지 않는 경우 서버에 요청 전 attribute를 삭제하여 전송한다.
		var rules, condition = loadedRule.condition;
		if(condition && condition.rules){
			rules = condition.rules;
			var i, max = rules.length;
			for( i = 0; i < max; i++ ){
				if(!rules[i].duration){
					rules[i].duration = "P0M";
				}
				delete rules[i].statusText;
				delete rules[i].valueText;
			}
		}
		getDataFromOperationViewModel(loadedRule);
		getDataFromCreationViewModel(loadedRule);
	};

	var destroy = function(){

	};

	function getEditState(){
		return isEditing;
	}

	function setEditState(state){
		isEditing = state;
	}

	function getRuleAlarmState(){
		return isRuleAlarm;
	}
	/**
	*   <ul>
	*   	<li>Map View 우측 기기 리스트 중 Building 그룹을 표시하기 위한 Template</li>
	*   </ul>
	*   @function buildingGroupHeaderTemplate
	*   @param {Object}data - 빌딩 그루핑 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var buildingGroupHeaderTemplate = function(data){
		//building
		var value = data.value;
		var text = "-";
		var count = "";

		if(value){
			var i, building, max = buildingList.length;
			for( i = 0; i < max; i++ ){
				building = buildingList[i];
				if(building.id == value){
					text = building.name;
					break;
				}
			}
		}
		var aggregates = data.aggregates;
		if(aggregates && aggregates["locations[0].foundation_space_buildings_id"] && aggregates["locations[0].foundation_space_buildings_id"].count){
			count = aggregates["locations[0].foundation_space_buildings_id"].count;
			/*if(count > 999){
				count = "999+";
			}*/
			text += " (" + count + ")";
		}

		return text;
	};
	/**
	*   <ul>
	*   	<li>Map View 우측 기기 리스트 중 Floor 그룹을 표시하기 위한 Template</li>
	*   </ul>
	*   @function floorGroupHeaderTemplate
	*   @param {Object}data - 층 그루핑 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var floorGroupHeaderTemplate = function(data){
		//floor 처리
		var value = data.value;
		var text = "-";
		var count = "";

		if(value){
			var i, floor, max = floorList.length;
			for( i = 0; i < max; i++ ){
				floor = floorList[i];
				if(floor.id == value){
					if(floor.type == "F"){
						text = floor.name + floor.type;
					}else if(floor.type == "B"){
						text = floor.type + floor.name;
					}else{
						text = floor.name;
					}
					break;
				}
			}
		}
		var aggregates = data.aggregates;
		if(aggregates && aggregates["locations[0].foundation_space_floors_id"] && aggregates["locations[0].foundation_space_floors_id"].count){
			count = aggregates["locations[0].foundation_space_floors_id"].count;
			/*if(count > 999){
				count = "999+";
			}*/
			text += " (" + count + ")";
		}

		return text;
	};
	/**
	*   <ul>
	*   	<li>Map View 우측 기기 리스트 중 기기 타입 그룹을 표시하기 위한 Template</li>
	*   </ul>
	*   @function typeGroupHeaderTemplate
	*   @param {Object}data - 기기 타입 그루핑 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var typeGroupHeaderTemplate = function(data){
		var value = data.value;
		//Type 처리
		var count = "";
		var text = "-";
		if(value){
			value = value.split("_");
			text = Util.getDetailDisplayTypeDeviceI18N(value[1]);
		}
		var aggregates = data.aggregates;
		if(aggregates && aggregates.displayType && aggregates.displayType.count){
			count = aggregates.displayType.count;
			/*if(count > 999){
				count = "999+";
			}*/
			text += " (" + count + ")";
		}

		return text;
	};
	//[2018-05-02][UI 에서 특정 Attribute 값을 선택하지 않을 시 null 처리 된 Attribute 는 전송하지 않도록 수정 필요 : endDate, times 등 문제를 해결하기위해 만든 함수]
	//해당함수는 객체를 깊은복사를 하지않기 떄문에 데이터 원형만 파라메타로 넣는것을 권장합니다
	/**
	*   <ul>
	*   	<li>Object 원형을 받아 Null이 있는지 체크하는 함수</li>
	*   </ul>
	*   @function ObjectPropertiesNullRemove
	*   @param {Object}obj -
	*   @returns {void}
	*   @alias module:app/operation/rule/rule-create
	*/
	var ObjectPropertiesNullRemove = function(obj) {
		for (var key in obj) {
			if (obj[key] === null)
				delete obj[key];
		}
		return true;
	};

	function closeDatePicker(){
		var startTime = $("#schedule-create-start-time-input");
		var endTime = $("#schedule-create-end-time-input");
		if(startTime.data("kendoCommonDatePicker")) startTime.data("kendoCommonDatePicker").close();
		if(endTime.data("kendoCommonDatePicker")) endTime.data("kendoCommonDatePicker").close();
	}

	return {
		init : init,
		destroy : destroy,
		setEditState : setEditState,
		getEditState : getEditState,
		isRuleAlarm : getRuleAlarmState,
		closeDatePicker : closeDatePicker
	};

});
//For Debug
//# sourceURL=facility-rule/create.js
