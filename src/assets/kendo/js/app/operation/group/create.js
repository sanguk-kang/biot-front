/**
*
*   <ul>
*       <li>Group 생성 기능</li>
*       <li>기기를 선택하여 Group을 생성한다.</li>
*       <li>Group을 편집한다.</li>
*   </ul>
*   @module app/operation/group/create
*   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
*   @param {Object} ViewModel - Group 생성 뷰 제어를 위한 View Model
*   @param {Object} GroupModel - Group 정보 및 리스트 생성을 위한 Model
*   @param {Object} DeviceModel - 기기 정보 Model
*   @param {Object} DeviceTemplate - 기기 정보 표시를 위한 Template
*   @param {Object} DeviceUtil - 기기 정보를 얻기 위한 DeviceUtil
*   @param {Object} Common - Group 기능 내에서 공통으로 쓰이는 공용 Util
*   @param {Object} Widget - Group 기능 내에서 쓰이는 Dialog 등의 Widget
*   @requires app/main
*   @requires app/operation/group/config/group-create-vm
*   @requires app/operation/group/config/group-model
*   @requires app/device/common/device-model
*   @requires app/device/common/device-template
*   @requires app/device/common/device-util
*   @requires app/operation/group/config/group-common
*   @requires app/operation/group/config/group-widget
*
*/
define("operation/group/create", ["operation/core", "operation/group/config/group-create-vm",
	"operation/group/config/group-model", "device/common/device-model",
	"device/common/device-template", "device/common/device-util",
	"operation/group/config/group-common",
	"operation/group/config/group-widget"],function(CoreModule, ViewModel, GroupModel, DeviceModel, DeviceTemplate, DeviceUtil, Common, Widget){

	"use strict";
	//decide to destroy or keep view

	var Device = DeviceModel.Device;
	var kendo = window.kendo;
	var MainWindow = window.MAIN_WINDOW;
	var Util = window.Util;
	var I18N = window.I18N;
	var Settings = window.GlobalSettings;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();
	var groupCreateTab, groupCreateTabElem = $("#group-create-tab");
	var groupTab, groupTabElem = $("#group-common-tab");
	var energyDistributionCheckboxElem = $("#group-create-energy-distribution-checkbox");

	var routeUrl = "/create";
	var viewContent = $("#group-view");
	var nameField = $("#group-create-name");

	var Router = new kendo.Router();
	var Layout = new kendo.Layout("<div id='group-view-content' class='group-view-content'></div>");
	var confirmDialog = Widget.confirmDialog;
	var msgDialog = Widget.msgDialog;

	var mapListPanel, mapListPanelElem = $("#map-panel"), detailPopup;
	var typeFilter, subTypeFilter;
	var curViewName = "";

	var FILTER_ENUM = { TYPE : 0, SUB_TYPE : 1, SELECT_ALL : 2};
	var ACTION_ENUM = { SELECTED_NUM : 0, SAVE : 1, CANCEL : 2};
	var MAP_LIST_ENUM = { SELECTED_TAB : 0, FLOOR_TAB : 1 };

	var isFloorList = false, isEdit = false, isInitialized = false;
	var isAppliedGroupForViewModel = false; //최초 로드된 그룹 데이터가 뷰모델에 적용되었는지 여부.
	var isAppliedLoadedGroupData = false; //최초 로드된 그룹 데이터가 ds 에 적용되었는지 여부.

	var loadedGroupData;
	var buildingList = [];
	var floorList = [];
	var typeOrderingList = [];

	/*
		View Model
	*/
	var Views = ViewModel.Views, MainViewModel = ViewModel.MainViewModel;

	/**
	*   <ul>
	*   <li>Group 생성 기능을 초기화한다.</li>
	*   <li>공용 UI Component를 초기화한다.</li>
	*   <li>현재 건물/층의 기기 정보를 API를 호출하여 서버로부터 받아오고, View를 업데이트한다.</li>
	*   <li>사용자 이벤트 동작을 바인딩한다.</li>
	*   </ul>
	*   @function init
	*   @param {Object} groupData - 그룹 편집 시, 전달되는 Group 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var init = function(groupData){
		//Edit
		Loading.open();
		groupCreateTab = groupCreateTabElem.data("kendoCommonTabStrip");
		groupTab = groupTabElem.data("kendoCommonTabStrip");
		var tab = groupCreateTab.select();

		//그룹 네임 필드의 값과 validate 상태 값 초기화.
		nameField.val("");
		nameField.siblings(".ic-bt-input-remove").hide();
		if(nameField.data("kendoCommonValidator")){
			nameField.data("kendoCommonValidator").hideMessages();
		}

		if(typeFilter){
			typeFilter.selectAll();
			disableSubTypeFilter();
		}
		if(groupData){
			isEdit = true;
			loadedGroupData = groupData;
			tab.find("a.text").text(Common.MSG.TXT_EDIT_GROUP);
		//Create
		}else{
			isEdit = false;
			loadedGroupData = GroupModel.createModel();
			tab.find("a.text").text(Common.MSG.TXT_CREATE_GROUP);
		}

		var curFloor = MainWindow.getCurrentFloor();
		isAppliedGroupForViewModel = false;
		isAppliedLoadedGroupData = false;

		if(isInitialized){
			var ds = Views.list.selected.widget.dataSource;
			ds.data([]);
			ds = Views.list.floor.widget.dataSource;
			ds.data([]);
			ds = Views.map.widget.dataSource;
			ds.data([]);

			changeFloor(curFloor);
		}else{              //First Execution. Initial View.
			var element = groupCreateTab.contentElement(0);
			kendo.bind($(element), MainViewModel);
			createView();
			attachEvent();
			isInitialized = true;
			typeOrderingList = getTypeOrderingList();
			changeFloor(curFloor);
		}
	};

	/**
	*   <ul>
	*   <li>Group 생성 기능의 View를 초기화한다.</li>
	*   <li>List, Map View, Map View List 등의 UI Component를 초기화한다.</li>
	*   <li>Map/List View 전환을 위한 Router와 View를 초기화한다.</li>
	*   </ul>
	*   @function createView
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var createView = function(){
		//init router
		var list = [];

		Router.bind("init", routerInit);

		//map view
		var options = {
			zoneDataSource : list,
			dataSource : list,
			isRegisterView : true,
			canDragDeviceIcon : false,
			showDeviceValue : false
		};

		Views.map.widget = Common.createNewWidget("create-group-map", kendo.ui.CommonMapView, options);
		Views.map.view = new kendo.View(Views.map.widget.element);
		Router.route(Views.map.routeUrl, routerEvt.bind(Router, Views.map.view));

		var deviceListOptions = {                  //초기화 할 Widget의 Option 값
			columns : [
				{ field: "type", title: I18N.prop("FACILITY_DEVICE_TYPE"), width:100, template : Util.getDetailDisplayTypeDeviceI18N },
				{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:100 },
				{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:100 },
				{ field: "locations", title: I18N.prop("FACILITY_HISTORY_LOCATION"), width:100, template : DeviceUtil.getLocation, sortable : { compare : DeviceUtil.sortableLocation }},
				{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), width:100, template : DeviceUtil.getGroup, sortable : { compare : DeviceUtil.sortableGroup }},
				{ field: "detail", title: I18N.prop("FACILITY_HISTORY_DETAIL"), width:80,sortable: false, template:'<span class="ic ic-info" data-id="#: id #"></span>'}
			],
			dataSource: [],
			height: "100%",
			sortable: true,
			filterable: false,
			pageable: false,
			hasSelectedModel : true,
			selectable : "multiple row",
			scrollable : { virtual : true }
		};

		Views.list.selected.widget = Common.createNewWidget("group-create-selected-list", kendo.ui.Grid, deviceListOptions);
		Views.list.selected.view = new kendo.View(Views.list.selected.widget.wrapper);
		Router.route(Views.list.selected.routeUrl, routerEvt.bind(Router, Views.list.selected.view));

		Views.list.floor.widget = Common.createNewWidget("group-create-floor-list", kendo.ui.Grid, deviceListOptions);
		Views.list.floor.view = new kendo.View(Views.list.floor.widget.wrapper);
		Router.route(Views.list.floor.routeUrl, routerEvt.bind(Router, Views.list.floor.view));

		var curFloorName = MainWindow.getCurrentFloorName();

		mapListPanel = mapListPanelElem.kendoDeviceTabGroupGrid({
			dataSource : [],
			hasNewDataSource : false,
			hasSelectedModel : true,
			type : "hybrid",
			filterTab : [{
				hideHeader : true,
				template : "<span data-bind='text: name'></span><span>(<span data-bind='text: count'></span>)</span>",
				listStyle : "treeList",
				widgetOptions : {
					expand : function(e){
						var widget = Views.list.selected.widget;
						var ds = widget.dataSource;
						var model = e.model;
						if(model.field.indexOf("displayType") != -1){
							mapListPanel.setDataSourceExpand(model, ds);
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
				listStyle : "treeList",
				hideHeader : true,
				widgetOptions : {
					expand : function(e){
						var widget = Views.list.floor.widget;
						var ds = widget.dataSource;
						var model = e.model;
						if(model.field.indexOf("displayType") != -1){
							mapListPanel.setDataSourceExpand(model, ds);
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
					]/*,
					sort : [{ field : "name", dir : "asc" }]*/
				}
			}],
			tabViewModel : [
				{
					name : I18N.prop("COMMON_SELECTED"),
					click : function(){},
					count : 0
				},
				{
					name : curFloorName,
					click : function(){},
					count : 0
				}
			],
			activateTab : function(e){
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
			change : selectWidgetEvt
		}).data("kendoDeviceTabGroupGrid");

		detailPopup = Widget.getDetailPopup();

		Router.start();
	};

	/**
	*   <ul>
	*   <li>Group 생성 기능의 이벤트를 바인딩한다.</li>
	*   <li>필터 드롭다운리스트 동작의 이벤트를 바인딩 한다.</li>
	*   <li>그룹 이름 등의 입력 필드에 대한 이벤트를 바인딩 한다.</li>
	*   <li>각 버튼 및 리스트 전환 등의 이벤트를 바인딩한다.</li>
	*   </ul>
	*   @function attachEvent
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var attachEvent = function(){
		//search remove input
		var element = groupCreateTab.contentElement(0);
		element = $(element);
		element.on("keyup", ".group-create-name-wrapper input", function(e){
			var clearBtn = $(this).siblings(".ic-bt-input-remove");
			if(clearBtn.length > 0){
				if($(this).val()){
					if(!clearBtn.is(":visible")){
						clearBtn.show();
					}
				}else{
					clearBtn.hide();
				}
			}
		});

		element.on("click", ".group-create-name-wrapper .ic.ic-bt-input-remove", function(e){
			var self = $(this);
			var input = self.siblings("input");
			input.val("");
			if(input.data("kendoCommonValidator")){
				input.data("kendoCommonValidator").validate();
			}
			self.hide();
		});

		//type dropdown
		typeFilter = $("#" + MainViewModel.filters[FILTER_ENUM.TYPE].id).data("kendoDropDownCheckBox");
		subTypeFilter = $("#" + MainViewModel.filters[FILTER_ENUM.SUB_TYPE].id).data("kendoDropDownList");
		typeFilter.selectAll();
		typeFilter.bind("selectionChanged", function(e){
			var value, length = e.newValue.length;
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
				/*if(value == "ControlPoint"){
					var i, max = list.length;
					for( i = max-1;i >=0 ; i-- ){
						if(list[i].displayType == "AV"){
							list.splice(i, 1);
						}else if(list[i].displayType == "DV"){
							list.splice(i, 1);
						}
					}
					//DO, AO로 표시되어야한다.
					list.reverse();
				}*/

				//Meter는 다국어를 적용해야한다.
				if(value == "Meter"){
					max = list.length;
					var arr = [], type, displayType, i18nVal;
					for( i = 0; i < max; i++ ){
						type = list[i].type;
						displayType = list[i].displayType;
						i18nVal = type.replace(".", "_").toUpperCase();
						i18nVal = I18N.prop("FACILITY_DEVICE_TYPE_FILTER_" + i18nVal.toUpperCase());
						displayType = i18nVal ? i18nVal : displayType;
						arr.push({
							type : type,
							displayType : displayType
						});
					}
					list = arr;
				}

				//SFCU는 FCU로 통합되어야한다.
				if(value == "AirConditioner"){
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

		Views.list.selected.widget.bind("change", selectWidgetEvt);
		Views.list.floor.widget.bind("change", selectWidgetEvt);
		Views.map.widget.bind("change", selectWidgetEvt);


		MainViewModel.category.selected.set("click", function(isForce){
			if(MainViewModel.category.selected.get("active") == true && !isForce){
				return;
			}
			MainViewModel.category.selected.set("active", true);
			MainViewModel.category.floor.set("active", false);
			Router.navigate(Views.list.selected.routeUrl);
			var ds = Views.list.selected.widget.dataSource;
			isFloorList = false;

			MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", true);
			if(subTypeFilter.value()){
				MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", true);
			}

			ds.group([]);
			applyDsFilter();
		});

		MainViewModel.category.floor.set("click", function(){
			if(MainViewModel.category.floor.get("active") == true){
				return;
			}
			MainViewModel.category.floor.set("active", true);
			MainViewModel.category.selected.set("active", false);

			Router.navigate(Views.list.floor.routeUrl);
			var ds = Views.list.floor.widget.dataSource;
			isFloorList = true;

			var isChecked = energyDistributionCheckboxElem.prop("checked");
			if(isChecked) {
				// 에너지 분배 체크박스의 체크 여부에 기기 타입 필터 및 기기 서브 타입 필터 disabled set.
				MainViewModel.filters[FILTER_ENUM.TYPE].set('disabled', true);
				MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set('disabled', true);
			} else {
				MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", false);
				if(subTypeFilter.value()){
					MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", false);
				}
			}

			ds.group([]);
			applyDsFilter();
		});

		MainViewModel.actions[ACTION_ENUM.SAVE].options.set("click", function(){
			//Create
			var isValidate = true;
			isValidate = nameField.data("kendoCommonValidator").validate();
			if(!isValidate){
				return;
			}

			Loading.open();
			getGroupDataFromViewModel(loadedGroupData);
			var data = loadedGroupData.toJSON();
			if(!data.description){
				delete data.description;
			}
			//temp
			if(isEdit){
				$.ajax({
					url : "/dms/groups/" + data.id,
					method : "PATCH",
					data : data
				}).done(function(){
					require(["operation/group/group"], function(groupMain){
						groupMain.closeCreateBtnEvt();
					});
					msgDialog.message(Common.MSG.TXT_EDIT_GROUP_RESULT);
					msgDialog.open();
				}).fail(function(xhq){
					var msg = Util.parseFailResponse(xhq);
					msgDialog.message(msg);
					msgDialog.open();
				}).always(function(){
					Loading.close();
				});
			}else{
				delete data.id;
				$.ajax({
					url : "/dms/groups",
					method : "POST",
					data : data
				}).done(function(){
					require(["operation/group/group"], function(groupMain){
						groupMain.closeCreateBtnEvt();
					});
					msgDialog.message(Common.MSG.TXT_CREATE_GROUP_RESULT);
					msgDialog.open();
				}).fail(function(xhq){
					var msg = Util.parseFailResponse(xhq);
					if (xhq.responseJSON && xhq.responseJSON.code === 41321) {
						msg = Common.MSG.TXT_MAXIMUM_NUMBER_OF_GROUP;
					}

					msgDialog.message(msg);
					msgDialog.open();
				}).always(function(){
					Loading.close();
				});
			}
		});

		MainViewModel.actions[ACTION_ENUM.CANCEL].options.set("click", function(){
			confirmDialog.message(Common.MSG.TXT_CANCEL_GROUP_CONFIRM);
			confirmDialog.setConfirmActions({
				yes : function(){
					groupCreateTab.hide();
					groupTab.show();
				}
			});
			confirmDialog.open();
		});

		Views.list.selected.widget.element.on("click", "tbody tr td .ic-info", onDetailRowEvt);
		Views.list.floor.widget.element.on("click", "tbody tr td .ic-info", onDetailRowEvt);
		mapListPanel.element.on("click", "tbody tr td .ic-info", onDetailRowEvt);

		CoreModule.on("onfloorchange", changeFloor);
		//에너지 분배 그룹 체크 버튼 이벤트 핸들링.
		energyDistributionCheckboxElem.on('change', handleEnergyDistributionCheckBoxEvt);
	};

	/**
	*   <ul>
	*   <li>에너지 분배 그룹 체크박스 이벤트를 핸들링 한다.</li>
	*   </ul>
	*   @function handleEnergyDistributionCheckBoxEvt
	*	@param {Event} e - 이벤트 객체.
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var handleEnergyDistributionCheckBoxEvt = function(e) {
		var isChecked = e.target.checked;

		if(isChecked) {
			//기존 기기타입 및 서브 타입 필터링 모두 초기화.
			typeFilter.selectAll();
			disableSubTypeFilter();
			// 에너지 분배 체크박스의 체크 여부에 기기 타입 필터 및 기기 서브 타입 필터 disabled set.
			MainViewModel.filters[FILTER_ENUM.TYPE].set('disabled', true);
			MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set('disabled', true);
			unselectAll(); // 에너지 분배 체크 박스가 체크 되었다면, 이전의 선택된 모든기기 의 선택을 해제 한다.
		} else if(!(MainViewModel.listBtn.active && MainViewModel.category.selected.active)) {
			// 리스트 뷰에서 '선택' 카테고리 일때에만 항상 기기타입 필터가 disabled 상태가 유지 되게 조건 추가.
			MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", false);
			if(subTypeFilter.value()){
				MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", false);
			}
		}
		applyDsFilter();
	};

	/**
	*   <ul>
	*   <li>Router를 초기화한다.</li>
	*   </ul>
	*   @function routerInit
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var routerInit = function(){
		Router.replace(routeUrl, true);
		Layout.render(viewContent);
	};

	/**
	*   <ul>
	*   <li>Router를 동작시켜 View를 전환한다.</li>
	*   </ul>
	*   @function routerInit
	*   @param {KendoView} view - 전환될 View
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var routerEvt = function(view){
		try{
			Layout.showIn("#group-view-content", view);
		}catch(e){
			Layout.showIn("#group-view-content", view);
		}
	};

	/**
	*   <ul>
	*   <li>Ajax 호출 시, 실패에 대한 메시지를 팝업시킨다.</li>
	*   </ul>
	*   @function failResp
	*   @param {jQueryXHQObject} xhq - jQuery XHQ Object
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var failResp = function(xhq){
		var msg = Util.parseFailResponse(xhq);
		msgDialog.message(msg);
		msgDialog.open();
	};
	/**
	*   <ul>
	*   <li>층 변경 시, 호출되는 콜백 함수. 선택한 빌딩/층에 따라 기기 정보들을 서버로부터 받아와 View를 업데이트하고, 선택한 Filter 조건에 맞게 Filter를 수행한다.</li>
	*   </ul>
	*   @function changeFloor
	*   @param {Object} curFloor - 현재 선택한 빌딩/층에 대한 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var changeFloor = function(curFloor){
		//apply filter floor list
		var floorName = MainWindow.getCurrentFloorName();
		mapListPanel.tabViewModel[MAP_LIST_ENUM.FLOOR_TAB].set("name", floorName);
		MainViewModel.category.floor.set("text", floorName);
		setViewData(curFloor, loadedGroupData);
	};
	/**
	*   <ul>
	*   <li>서브 기기 타입 필터를 비활성화 한다.</li>
	*   </ul>
	*   @function disableSubTypeFilter
	*   @returns {void}
	*   @alias module:app/operation/group/create
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
	*   <li>현재 표시된 View 기준으로 선택한 Filter 조건에 따라 기기 정보 View를 Filtering하여 View를 업데이트한다.</li>
	*   </ul>
	*   @function applyDsFilter
	*   @param {Object} floorData - 현재 선택한 빌딩/층 정보 객체
	*   @param {Array} types - 필터에서 선택한 기기 타입 리스트
	*   @param {Array} subType - 필터에서 선택한 서브 기기 타입
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var applyDsFilter = function(floorData, types, subType){
		if(!floorData){
			floorData = MainWindow.getCurrentFloor();
		}

		var floor = floorData.floor,
			building = floorData.building;

		if(!types || types == "All"){
			types = typeFilter.value();
			types = types ? types.split(",") : types;
		}

		if(!subType){
			subType = subTypeFilter.value();
		}

		var type, i, max;
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
		if(types && types.length > 0){
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
				max = split.length;
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

		// 에너지 분배 지원 기기타입 필터.
		var supportEnergyDistributionTypeFilter = {
			logic : "and", filters:[{field:"airConditioner", operator : function(item) {
				return typeof item != "undefined" ? Util.isSupportEnergyDistributionType(item.indoorUnitType) : false;
			}}]
		};
		if(energyDistributionCheckboxElem.prop("checked")) {
			allFilters.filters.push(supportEnergyDistributionTypeFilter);
			mapFilters.filters.push(supportEnergyDistributionTypeFilter);
		}

		var listDs = Views.list.floor.widget.dataSource;
		var mapDs = Views.map.widget.dataSource;

		var selectFilter = { logic : "and", filters : [{ field : "selected", operator : "eq", value : true}]};
		var unselectFilter = { logic : "and", filters : [{ field : "selected", operator : "eq", value : false}]};

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

		if(energyDistributionCheckboxElem.prop("checked")) {
			totalFilter.push(supportEnergyDistributionTypeFilter);
		}

		totalFilter.push(unselectFilter);

		var unselectedData = new kendo.data.Query(data).filter(totalFilter).toArray();
		setUnselectedDeviceNum(unselectedData.length);
		// 전체 선택 버튼 상태에서, 만약 선택되지 않은 기기가 없다면 disabled 상태 설정.
		if(MainViewModel.filters[FILTER_ENUM.SELECT_ALL].get('text') == Common.MSG.TXT_SELECT_ALL) {
			if(unselectedData.length != 0) { // 기기가 없는 경우, 전체선택/해제 버튼 disable 설정.
				MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set('disabled', false);
			} else {
				MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set('disabled', true);
			}
		}
	};

	/**
	*   <ul>
	*   <li>현재 선택한 빌딩/층에 따라 Zone, 층, 기기 정보, Group 정보 리스트를 서버로부터 API호출을 통하여 받아오고, View를 업데이트한다.</li>
	*   </ul>
	*   @function setViewData
	*   @param {Object} floorData - 현재 선택한 빌딩/층 정보 객체
	*   @param {Object} groupData - Group 편집 시, 전달된 Group 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var setViewData = function(floorData, groupData){
		Loading.open();

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
				getCurrentFloorDevices(floorData).done(function(deviceList){
					var ds = new kendo.data.DataSource({
						data : deviceList,
						pageSize : 50
					});

					ds.read();
					applyGroupData(ds, groupData).done(function(){
						if(!isAppliedGroupForViewModel) applyGroupForViewModel(groupData);

						var floor = floorData.floor, building = floorData.building;
						var filters = [];
						if(building && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
							filters.push(DeviceUtil.filter1Depth("locations", "foundation_space_buildings_id", building.id));
						}

						if(floor && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
							filters.push(DeviceUtil.filter1Depth("locations", "foundation_space_floors_id", floor.id));
						}

						ds.filter(filters);
						//mapListPanel.options.filterTab[1].listOptions.filter = filters;
						//mapListPanel.options.filterTab[1].listOptions.filter.push({ field : 'selected', operator : 'eq', value : false});

						Views.list.floor.widget.setDataSource(ds);
						Views.list.selected.widget.setDataSource(ds);
						//->applyDsFilter() 호출 시, dataSource가 업데이트 되어 중복이므로 삭제
						//if(building && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID && floor && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
						//    mapListPanel.setDataSource(ds, true);
						//}

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
							// 생성하는 그룹 또는 일반그룹 이면 맵에서, 기기타입 필터 disabled 초기값을 false 로 설정하고 '분배그룹' 이라면 true 로 설정한다.
							MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", !(groupData.type == "" || groupData.type == "General"));
						}else if(curViewName == "list"){
							ds.group([]);
							// 생성하는 그룹 또는 일반그룹 이면서 리스트에서 층을 선택되어 있었다면, 기기타입 필터 disabled 초기값을 false 로 설정하고 '분배그룹' 이라면 true 로 설정한다.
							if(MainViewModel.category.floor.get("active")) {
								MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", !(groupData.type == "" || groupData.type == "General"));
							}
						}
					}).fail(failResp).always(function(){
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
						Loading.close();
					});
				}).fail(failResp);
			});
		});
	};

	/**
	*   <ul>
	*   <li>현재 View에서 입력한 Group 이름, 선택 기기 정보들을 통하여 Group 정보를 Set한다.</li>
	*   </ul>
	*   @function getGroupDataFromViewModel
	*   @param {Object} loadedGroup - 생성/수정할 Group 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var getGroupDataFromViewModel = function(loadedGroup){
		var name = nameField.val();
		var type = energyDistributionCheckboxElem.prop("checked") == false ? "General" : "EnergyDistribution";
		loadedGroup.set("name", name);
		loadedGroup.set("type", type);

		var ds = Views.list.floor.widget.dataSource;
		var data = ds.data();

		var i, max = data.length;
		var idList = [];
		for( i = 0; i < max; i++ ){
			if(data[i].selected){
				idList.push(data[i].id);
			}
		}

		loadedGroup.set("dms_devices_ids", idList);
	};

	/**
	*   <ul>
	*   <li>현재 로드된 Group 정보에 따라 Name 필드의 UI를 업데이트한다.</li>
	*   </ul>
	*   @function applyGroupForViewModel
	*   @param {Object} loadedGroup - 생성/수정할 Group 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var applyGroupForViewModel = function(loadedGroup){
		var name = loadedGroup.name ? loadedGroup.name : "";
		var type = typeof loadedGroup.type != "undefined" ? loadedGroup.type : "General";

		nameField.val(name);
		energyDistributionCheckboxElem.prop("checked", type == "EnergyDistribution"); // 에너지 분배 그룹 타입 체크박스.
		isAppliedGroupForViewModel = true; // 로드된 데이터를 뷰모델에 적용했다고 표시.
	};

	/**
	*   <ul>
	*   <li>현재 생성/수정할 Group 정보 객체의 기기 ID를 통하여 기기 선택 상태를 업데이트한다.</li>
	*   </ul>
	*   @function applyGroupData
	*   @param {kendoDataSource} deviceDataSource - 현재 View(Widget)에서 가지고 있는 KendoDataSource 인스턴스
	*   @param {Object} loadedGroup - 생성/수정할 Group 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*
	*/
	var applyGroupData = function(deviceDataSource, loadedGroup){
		var dfd = new $.Deferred();
		var floorDs = Views.list.floor.widget.dataSource;
		var floorData = floorDs.data();

		var selectedData = new kendo.data.Query(floorData).filter({
			logic : 'and',
			filters : [{ field : "selected", operator : "eq", value : true}]
		}).toArray();

		//Apply Loaded Group
		var idList = loadedGroup.dms_devices_ids ? loadedGroup.dms_devices_ids : [];
		if(idList.length > 0 && !isAppliedLoadedGroupData){
			$.ajax({
				url : "/dms/devices?ids=" + idList.join(",")
			}).done(function(data){
				var i, max = data.length;
				var id, device, item;
				data = applyDeviceModel(data);
				for( i = 0; i < max; i++ ){
					device = data[i];
					id = device.id;
					item = deviceDataSource.get(id);
					if(item){
						item.set("selected", true);
					//Group에 저장된 다른 빌딩의 Device 정보의 경우 현재 빌딩/층으로 쿼리한 디바이스 리스트에 존재하지 않으므로, Add하여 준다.
					}else{
						device.selected = true;
						deviceDataSource.add(device);
					}
				}
			}).fail(failResp).always(function(){
				addSelectedData(deviceDataSource, selectedData);
				dfd.resolve();
			});
			isAppliedLoadedGroupData = true; //최초 로드시에만 ds에 선택 그룹 데이터 설정헀다고 표시.
		}else{
			addSelectedData(deviceDataSource, selectedData);
			dfd.resolve();
		}

		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>현재 View의 기기 선택 상태를 업데이트한다.</li>
	*   </ul>
	*   @function addSelectedData
	*   @param {kendoDataSource} dataSource - 현재 View(Widget)에서 가지고 있는 KendoDataSource 인스턴스
	*   @param {Array} selectedData - 선택한 기기 리스트
	*   @returns {void}
	*   @alias module:app/operation/group/create
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
	*   <li>현재 설정된 기기 타입 순서 정보를 가져온다.</li>
	*   </ul>
	*   @function getTypeOrderingList
	*   @returns {Array} 기기 타입 순서 설정에 따른 기기 타입 리스트
	*   @alias module:app/operation/group/create
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

	/**
	*   <ul>
	*   <li>현재 선택한 빌딩/층 정보에 따라 API를 호출하여 Zone 정보 리스트를 서버로부터 가져온다.</li>
	*   </ul>
	*   @function getZoneData
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {jQuqery.Deferred} - 제이쿼리 디퍼드 객체
	*   @alias module:app/operation/group/create
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
	*   <li>현재 선택한 빌딩/층 정보에 따라 API를 호출하여 층 정보 리스트를 서버로부터 가져온다.</li>
	*   </ul>
	*   @function getFloorData
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {jQuqery.Deferred} - 제이쿼리 디퍼드 객체
	*   @alias module:app/operation/group/create
	*/
	var getFloorData = function(floorData){
		var dfd = new $.Deferred();
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
	*   <li>현재 빌딩/층 정보에 따라 기기 정보 리스트를 서버로부터 가져온다.</li>
	*   </ul>
	*   @function getCurrentFloorDevices
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {jQuqery.Deferred} - 제이쿼리 디퍼드 객체
	*   @alias module:app/operation/group/create
	*/
	var getCurrentFloorDevices = function(floorData){
		var query = getQueryFromFloor(floorData);
		if(query.indexOf("&") != -1){
			query += "&";
		}
		query += "registrationStatuses=Registered&";
		query += "attributes=id,name,type,mappedType,registrationStatus,locations,groups,airConditioner&";
		query += "types=" + ViewModel.typeQuery.join(",");

		return $.ajax({url : "/dms/devices" + query}).then(applyDeviceModel);
	};

	/**
	*   <ul>
	*   <li>현재 빌딩/층 정보에 따라 API 호출을 위한 쿼리 파라미터를 생성한다.</li>
	*   </ul>
	*   @function getQueryFromFloor
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @param {Boolean}isOnlyBuilding - 빌딩 쿼리만 생성할지의 여부
	*   @param {Array}attr - 특정 Attribute만 가져올 시, Attribute의 리스트
	*   @returns {String} API 호출을 위한 쿼리 파라미터
	*   @alias module:app/operation/group/create
	*/
	var getQueryFromFloor = function(floorData, isOnlyBuilding, attr){
		var query = "?";
		if(floorData){
			var buildingId = floorData.building.id;
			var floorId = floorData.floor.id;

			if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
				query += "foundation_space_buildings_id=" + buildingId + "&";
			}

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
	*   <li>Map 또는 List로 View를 전환한다.</li>
	*   </ul>
	*   @function showViewEvent
	*   @param {String}viewName - View 이름
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*/
	var showViewEvent = function(viewName){
		MainWindow.disableFloorNav(false);
		var curFloor = MainWindow.getCurrentFloor();
		if(curFloor.floor.id == MainWindow.FLOOR_NAV_FLOOR_ALL_ID
		   || curFloor.building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID ){
			MainViewModel.mapBtn.set("disabled", true);
		}else{
			MainViewModel.mapBtn.set("disabled", false);
		}

		if(viewName == "map"){
			mapViewShow();
		}else if(viewName == "list"){
			listViewShow();
		}
	};
	/**
	*   <ul>
	*   <li>Map View로 전환 시, View 상태를 업데이트한다.</li>
	*   </ul>
	*   @function mapViewShow
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*/
	var mapViewShow = function(){
		subTypeFilter = $("#" + MainViewModel.filters[FILTER_ENUM.SUB_TYPE].id).data("kendoDropDownList");

		mapListPanel.selectTab(0, true);
		MainViewModel.mapBtn.set("active", true);
		MainViewModel.listBtn.set("active", false);

		MainViewModel.set("hidePanel", false);
		MainViewModel.set("hideMapPanel", false);

		var isChecked = energyDistributionCheckboxElem.prop("checked");
		if(isChecked) {
			MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", true);
			MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disable", false);
		}else {
			MainViewModel.filters[FILTER_ENUM.TYPE].set("disabled", false);
			if(subTypeFilter.value()) {
				MainViewModel.filters[FILTER_ENUM.SUB_TYPE].set("disabled", false);
			}
		}
	};

	/**
	*   <ul>
	*   <li>List View로 전환 시, View 상태를 업데이트한다.</li>
	*   </ul>
	*   @function listViewShow
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*/
	var listViewShow = function(){
		MainViewModel.listBtn.set("active", true);
		MainViewModel.mapBtn.set("active", false);

		MainViewModel.set("hidePanel", true);
		MainViewModel.set("hideMapPanel", false);
	};

	/**
	*   <ul>
	*   <li>현재 표시된 View에서 기기 선택 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function selectWidgetEvt
	*	@param {Event} e - 이벤트 객체.
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*/
	var selectWidgetEvt = function(e){
		//devices : 공용 Map View의 "change" 이벤트 콜백 시, 선택 상태 변경된 기기 리스트 인자
		//item : 공용 Grid 및 TabGroupGrid "change" 이벤트 콜백 시, 선택 상태 변경된 기기 아이템 인자
		var sender = e.sender, items = e.item ? [e.item] : e.devices;

		if(items){
			var isMapView = sender instanceof kendo.ui.CommonMapView && curViewName == "map";
			var item, i, max = items.length;
			var listItem, ds = Views.list.floor.widget.dataSource;
			for (i = 0; i < max; i++) {
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
	*   <li>전체 선택/전체 선택 해제 버튼 클릭 시, 호출되는 Callback 함수 </li>
	*   </ul>
	*   @function selectAllEvt
	*	@param {Event} e - 이벤트 객체.
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*/
	var selectAllEvt = function(e){
		var text = this.get("text");

		if(text == Common.MSG.TXT_SELECT_ALL){
			selectAll();
			this.set("text", Common.MSG.TXT_UNSELECT_ALL);
		}else{
			unselectAll();
			this.set("text", Common.MSG.TXT_SELECT_ALL);
		}
	};

		//called only in registration
	/**
	*   <ul>
	*   <li>기기를 전체 선택하고, View를 Update한다.</li>
	*   </ul>
	*   @function selectAll
	*   @returns {void}
	*   @alias module:app/operation/group/create
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
		// 에너지 분배 지원 기기타입 필터.
		var supportEnergyDistributionTypeFilter = {
			logic : "and", filters:[{field:"airConditioner", operator : function(item) {
				return typeof item != "undefined" ? Util.isSupportEnergyDistributionType(item.indoorUnitType) : false;
			}}]
		};
		if(energyDistributionCheckboxElem.prop("checked")) {
			allFilters.filters.push(supportEnergyDistributionTypeFilter);
		}

		var unselectedData = new kendo.data.Query(data).filter(allFilters).toArray();

		max = unselectedData.length;
		for( i = 0; i < max; i++ ){
			unselectedData[i].selected = true;
		}

		Views.map.widget.selectAll();
		applyDsFilter();
	};

	/**
	*   <ul>
	*   <li>기기를 전체 선택해제하고, View를 Update한다.</li>
	*   </ul>
	*   @function unselectAll
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*/
	var unselectAll = function(){
		Views.list.floor.widget.clearSelection();
		Views.map.widget.unselectAll();
		applyDsFilter();
	};
	/**
	*   <ul>
	*   <li>싱세 아이콘 클릭 시 호출되는 Callback 함수, 기기 ID를 통하여 API를 호출하고, 응답된 데이터로 기기 상세 팝업을 표시한다.</li>
	*   </ul>
	*   @function onDetailRowEvt
	*	@param {Event} e - 상세아이콘 클릭 이벤트 객체.
	*   @returns {void}
	*   @alias module:app/operation/group/create
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
	*   <li>기기 선택 개수에 따라 기기 선택 상태 텍스트와 버튼들의 활성화/바활성화 상태를 업데이트한다.</li>
	*   </ul>
	*   @function setSelectedDeviceNum
	*   @param {Number}selectedNum - 선택한 기기 개수
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*/
	var setSelectedDeviceNum = function(selectedNum){
		var totalNum = MainViewModel.category.floor.get("num");
		if(typeof totalNum == "string"){
			totalNum = totalNum.replace("+", "");
		}

		if(selectedNum != 0 && totalNum == selectedNum){
			MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set("text", Common.MSG.TXT_UNSELECT_ALL);
		}

		if(selectedNum < 1){
			MainViewModel.actions[ACTION_ENUM.SELECTED_NUM].options.set("selectedText", I18N.prop("FACILITY_DEVICE_NO_SELECTED"));
			MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set("text", Common.MSG.TXT_SELECT_ALL);
			MainViewModel.actions[ACTION_ENUM.SAVE].set("disabled", true);
		}else{
			/*if(selectedNum > 999){
				selectedNum = "999+";
			}*/
			MainViewModel.actions[ACTION_ENUM.SELECTED_NUM].options.set("selectedText", I18N.prop("FACILITY_DEVICE_SELECTED", selectedNum));
			MainViewModel.filters[FILTER_ENUM.SELECT_ALL].set("text", Common.MSG.TXT_UNSELECT_ALL);
			MainViewModel.actions[ACTION_ENUM.SAVE].set("disabled", false);
		}
		mapListPanel.tabViewModel[MAP_LIST_ENUM.SELECTED_TAB].set("count", selectedNum);
		MainViewModel.category.selected.set("num", selectedNum);
	};

	/**
	*   <ul>
	*   <li>선택되지 않은 기기 개수를 업데이트한다.</li>
	*   </ul>
	*   @function setUnselectedDeviceNum
	*   @param {Number} num - 선택되지 않은 기기 개수
	*   @returns {void}
	*   @alias module:app/operation/group/create
	*/
	var setUnselectedDeviceNum = function(num){
		/*if(num > 999){
			num = "999+";
		}*/
		MainViewModel.category.floor.set("num", num);
		mapListPanel.tabViewModel[MAP_LIST_ENUM.FLOOR_TAB].set("count", num);
	};

	/**
	*   <ul>
	*   <li>Map View 우측 기기 리스트 중 Building 그룹을 표시하기 위한 Template</li>
	*   </ul>
	*   @function buildingGroupHeaderTemplate
	*   @param {Object}data - 빌딩 그루핑 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
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
	*   <li>Map View 우측 기기 리스트 중 Floor 그룹을 표시하기 위한 Template</li>
	*   </ul>
	*   @function floorGroupHeaderTemplate
	*   @param {Object}data - 층 그루핑 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
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
	*   <li>Map View 우측 기기 리스트 중 기기 타입 그룹을 표시하기 위한 Template</li>
	*   </ul>
	*   @function typeGroupHeaderTemplate
	*   @param {Object}data - 기기 타입 그루핑 정보 객체
	*   @returns {void}
	*   @alias module:app/operation/group/create
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

	return {
		init : init
	};
});

//# sourceURL=operation-group-create.js
