/**
 *
 *   <ul>
 *       <li>캘린더 팝업 내에서 날짜를 선택하여 입력 칸에 반영할 수 있다.</li>
 *       <li>Kendo UI의 Calendar 위젯을 상속받아 커스터마이징</li>
 *   </ul>
 *   @module app/widget/device-selecter
 *   @requires app/main
 */
(function(window, $){
	var kendo = window.kendo, ui = kendo.ui;
	var DetailDialog = ui.DetailDialog;
	var Util = window.Util;

	var FILTER = { field: "view", operator: "eq", value: false };
	var SELECTED_FILTER = { field: "view", operator: "eq", value: true };
	var SELECTED_GRID_PAGE_SIZE = 10;
	var GROUP_SORT = { field: "name", dir: "asc", compare: function(a, b) {
		return a.name.localeCompare(b.name, 'en', {
			numeric: true
		});
	  }};
	var typeOrderingList = [];
	var typeQuery = ["AirConditioner.*", "ControlPoint.AO", "ControlPoint.DO", "Beacon", "Gateway", "Light", "CCTV"];

	var Device = kendo.data.Model.define({
		//		alarms : "alarms",
		id: "id",
		fields: {
			alarms: {
				type: "object",
				editType: null
			},
			networks: {
				type: "object"
			},
			parentId: {
				type: "string"
			},
			winds: {type : "object"},
			registrationStatus : {
				type: "string",
				options: [
					{text: "NotRegistered", value: "0"},
					{text: "Registered", value: "1"},
					{text: "Deleted", value: "1"}
				]
			},
			name: {type : "string"},
			information : {type : "object"},
			subordinateIds: {type : "object"},
			operations: {type : "object"},
			mappedType : {
				type: "string",
				options: [
					{text: "ControlPoint", value: "0"},
					{text: "Light", value: "1"},
					{text: "Meter.WattHour", value: "2"},
					{text: "Sensor.Humidity", value: "3"},
					{text: "Sensor.Motion", value: "4"},
					{text: "Sensor.Temperature", value: "5"}
				]
			},
			representativeStatus : {
				type: "string",
				options: [
					{text: "Normal.On", value: "0"},
					{text: "Normal.Off", value: "1"},
					{text: "Alarm.Critical", value: "2"},
					{text: "Alarm.Warning", value: "3"},
					{text: "Alarm.NetworkError", value: "4"},
					{text: "Disconnected", value: "5"},
					{text: "LowBattery", value: "6"},
					{text: "OutOfBounds", value: "7"}
				]
			},
			modes: {type : "object"},
			controlPoint: {type: "object"},
			groups: {type: "object"},
			//			configuration: {type: configuration},
			configuration: {type: "object"},
			light :{type : "object"},
			type: {type : "string"},
			id: {type : "string"},
			schedules: {type : "object"},
			description: {type : "string"},
			locations: {type : "object"},
			airConditioner: {type : "object"},
			/*"air-conditioner.outdoorUnit.electricCurrentControl": {name : "Current Limit"},
			"air-conditioner.outdoorUnit.coolingCapacityCalibration": {name : "Cooling Capacity Callibration"},
			"air-conditioner.outdoorUnit.heatingCapacityCalibration": {name : "Heating Capacity Callibration"},*/
			temperatures: {type: "object"}
		}
	});

	/*
	 * attr0 : 0depth attribute
	 * attr1 : 1depth attribute
	 */
	/**
	*   <ul>
	*   <li>kendoDataSource에서 Filter할 객체 정보를 얻는다.</li>
	*   </ul>
	*   @function filter1Depth
	*   @param {String}attr0 - 필터링할 필드 Attribute
	*   @param {String}attr1 - 1Depth 아래의 필터링할 필드 Attribute
	*   @param {String|Number|Boolean}val - 필터링할 Value
	*   @returns {Object} - Filter Object
	*   @alias module:app/device/common/device-util
	*/
	var filter1Depth = function(attr0, attr1, val){
		var id;
		if(val === "vAuto"){
			id = "AirConditioner.Indoor.Ventilator";
			val = "Auto";
		}
		return { field : attr0, operator: function(item, value){
			if(value == "") return true;
			if(!item || !item.length) return;

			var i, length = item.length;
			if(value == "undefined"){
				for( i = 0; i < length; i++ ){
					if(typeof item[i][attr1] === 'undefined'){
						return true;
					}
				}
			}else{
				for(i = 0; i < length; i++){
					if(item[i][attr1] == value){
						if(id){
							 if(id === item[i]["id"]) return true;
							 return;
						}
						return true;
					}
				}
			}
			return;
		}, value : val};
	};

	/**
	 *   <ul>
	 *   <li>현재 설정된 기기 타입 순서 정보를 가져온다.</li>
	 *   </ul>
	 *   @function getTypeOrderingList
	 *   @returns {Array} 기기 타입 순서 설정에 따른 기기 타입 리스트
	 *   @alias module:app/operation/schedule/create
	 */
	var getTypeOrderingList = function(){
		var Settings = window.GlobalSettings;
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

	var applyGroupModel = function(data){
		if(!data){
			return [];
		}
		return data;
	};

	/**
	 *   <ul>
	 *   <li>현재 빌딩/층 정보에 따라 기기 정보 리스트를 서버로부터 가져온다.</li>
	 *   </ul>
	 *   @function getCurrentFloorDevices
	 *   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	 *   @returns {jQuqery.Deferred} -
	 *   @alias module:app/operation/schedule/create
	 */
	var getCurrentFloorDevices = function(floorData){
		var query = getQueryFromFloor(floorData);
		if(query.indexOf("&") != -1){
			query += "&";
		}
		query += "registrationStatuses=Registered&";
		query += "attributes=id,name,type,mappedType,registrationStatus,locations,groups&";
		query += "types=" + typeQuery.join(",");

		return $.ajax({url : "/dms/devices" + query}).then(applyDeviceModel);
	};
	/**
	 *   <ul>
	 *   <li>현재 빌딩/층 정보에 따라 그룹 정보 리스트를 서버로부터 가져온다.</li>
	 *   </ul>
	 *   @function  getCurrentFloorGroup
	 *   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	 *   @returns {jQuqery.Deferred} -
	 *   @alias module:app/operation/schedule/create
	 */
	var getCurrentFloorGroup = function(floorData){
		var query = getQueryFromFloor(floorData, null, null, true);
		// var url = "/dms/groups/summary/listView";
		var url = "/dms/groups";
		return $.ajax({url : url + query}).then(applyGroupModel);
	};
	/**
	 *   <ul>
	 *   <li>현재 빌딩/층 정보에 따라 API 호출을 위한 쿼리 파라미터를 생성한다.</li>
	 *   </ul>
	 *   @function getQueryFromFloor
	 *   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	 *   @param {Boolean}isOnlyBuilding - 빌딩 쿼리만 생성할지의 여부
	 *   @param {Array}attr - 특정 Attribute만 가져올 시, Attribute의 리스트
	 *   @param {Boolean}isOnlyFloor - 층 쿼리만 생성할지의 여부
	 *   @returns {String} API 호출을 위한 쿼리 파라미터
	 *   @alias module:app/operation/schedule/create
	 */
	var getQueryFromFloor = function(floorData, isOnlyBuilding, attr, isOnlyFloor){
		var MainWindow = window.MAIN_WINDOW;
		var query = "?";
		if(floorData){
			var buildingId = floorData.building.id;
			var floorId = floorData.floor.id;
			var zoneId = floorData.zone.id;

			if(isOnlyFloor){
				if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID
					&& floorId && floorId == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
					query += "foundation_space_buildings_id=" + buildingId + "&";
				}
			//[13-04-2018]ESLint룰 적용으로 인한 코드 수정 -jw.lim
			// }else{
			//     if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			//         query += "foundation_space_buildings_id="+buildingId+"&";
			//     }
			// }
			}else if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
				query += "foundation_space_buildings_id=" + buildingId + "&";
			}

			if(!isOnlyBuilding){

				if(floorId && floorId != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
					query += "foundation_space_floors_id=" + floorId + "&";
				}
			}

			if(zoneId && zoneId !== "none" && zoneId !== "all"){
				query += "foundation_space_zones_id=" + zoneId + "&";
			}
			if(zoneId === "none"){
				query += "foundation_space_zones_id=" + 0 + "&";
			}
		}

		if(attr && attr.length > 0){
			query += ("attributes=" + attr.join(","));
		}
		return query;
	};

	function checkEnableChange(event,data) {
		var self = this;
		var buildingId = self.building.get("value");
		if(buildingId instanceof kendo.data.ObservableObject){
			buildingId = buildingId.id;
		}

		var floorId = self.floor.get("value");
		if(floorId instanceof kendo.data.ObservableObject){
			floorId = floorId.id;
		}
		var zoneId = self.zone.get("value");
		if(zoneId instanceof kendo.data.ObservableObject){
			zoneId = zoneId.id;
		}
		var typeId = self.type.get("value");
		if(typeId instanceof kendo.data.ObservableObject){
			typeId = typeId.type;
		}
		// var deviceName = self.id.get('value');


		var buildingDisabled = self.building.enabled;
		var floorDisabled = self.floor.enabled;
		var zoneDisabled = self.zone.enabled;
		var typeDisabled = self.type.enabled;
		var idDisabled = self.id.enabled;
		if(buildingDisabled && floorDisabled && zoneDisabled && typeDisabled && idDisabled &&
			(buildingId !== "" && typeof buildingId !== 'undefined' && buildingId !== null) &&
			(floorId !== "" && typeof floorId !== 'undefined' && floorId !== null) &&
			(zoneId !== "" && typeof zoneId !== 'undefined' && zoneId !== null) &&
			(typeId !== "" && typeof typeId !== 'undefined' && typeId !== null)
		){
			//
		}else{
			self.zone.set("dataSource", data);
			self.zone.set("enabled", true);
		}
	}
	function uniqueArray(array, keyword) {
		for (var index = 0; index < array.length; index++) {
			if (array[index] === keyword) return true;
		}
		return false;
	}
	function getUniqueObjectArray(array, key) {
		var tempArray = [];
		var resultArray = [];
		for(var i = 0; i < array.length; i++) {
			var item = array[i];
			if(uniqueArray(tempArray, item[key])) {
				continue;
			} else {
				resultArray.push(item);
				tempArray.push(item[key]);
			}
		}
		return resultArray;
	}

	var CommonDeviceSelecter = ui.DetailDialog.extend({
		options: {
			name: "CommonDeviceSelecter",
			height: 830,
			width : 1176,
			title: '',
			type: "single",
			timeout: 0,
			events : [
				"onSave",
				"onSaved",
				"onClose",
				"onClosed"
			],
			contentViewModel: null
		},
		/**
		 *
		 *   위젯을 초기화하며 캘린더 팝업 및 내부 버튼 UI요소를 생성한다. - 최초 1번 실행
		 *
		 *   @function init
		 *	 @param {HTMLElement} element - 엘리먼트.
		 *	 @param {Object} options - 캘린더 위젯 초기 옵션 객체.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-calender
		 *
		 */
		init: function(element, options){
			var that = this;
			that._initOptions();
			that._setLoadingPanel();
			options = $.extend({}, that.options, options);
			DetailDialog.fn.init.call(that, element, options);
			that.msgDialog = null;
			that.selectableGrid = null;
			that.selectedGrid = null;
			that.selectableGroupGrid = null;
			that.selectedGroupGrid = null;
			that.selectIds = [];
			that.data = null;
			that.viewModel = null;
			that.confirmDialog;
			that.beforeScroll = {
				all: {
					selected: 0,
					selectable: 0
				},
				group: {
					selected: 0,
					selectable: 0
				}
			};
			that._Filter = [FILTER];
			that._setSetting();
			that._parseDataSource();
			// that._initComponent();
			that._attchEvent();
			if (options.selectIds) that.selectIds;
		},
		_setLoadingPanel: function(){
			var LoadingPanel = window.CommonLoadingPanel;
			var Loading = new LoadingPanel();
			var self = this;
			this.Loading = {
				open: function(){ Loading.open(self.wrapper); },
				close: function(){ Loading.close(self.wrapper); }
			};
		},
		_Loading: function() {
			return this.Loading;
		},
		_setViewData: function(){
			var that = this;
			var reqArr = [];

			reqArr.push(getCurrentFloorGroup());
			reqArr.push(getCurrentFloorDevices());

			$.when.apply(self, reqArr).fail(function(){
			}).always(function(groupData, deviceData){
				deviceData = that._sortDevcieData(deviceData);
				groupData = that._sortGroupData(groupData);

				that._parsingTotalDeviceData(deviceData);
				that._parsingTotalGroupData(groupData);
				that._parsingGroupData(groupData, deviceData);
				that._parsingTotalDeviceData(deviceData);
				that._parsingGridData(deviceData);
				that._setGridDataSoruce();
				that.Loading.close();
				that.trigger("onLoad");
			});
		},
		_sortDevcieData: function(deviceData) {
			return deviceData.sort( function (a, b) {
				return a.name.localeCompare(b.name, 'en', {
					numeric: true
				});
			});
		},
		_sortGroupData: function(groupData) {
			return groupData.sort( function (a, b) {
				return a.name.localeCompare(b.name, 'en', {
					numeric: true
				});
			});
		},
		_parsingTotalOrigineData: function(deviceData) {
			var item, result = [];
			for(var i = 0, max = deviceData.length; i < max; i++) {
				item = deviceData[i];
				result[item.id] = item;
			}
			this.contentViewModel.totalOriginData = result;
		},
		_parsingTotalGroupData: function(groupData) {
			var item, result = {};
			for(var i = 0, max = groupData.length; i < max; i++) {
				item = groupData[i];
				result[item.id] = { index: i, devicesIds: item.dms_devices_ids };
			}
			this.contentViewModel.totalGroupData = result;
		},
		_parsingGroupData: function(groupData) {
			var self = this;
			var groupItem, deviceId;
			for(var i = groupData.length - 1; i >= 0; i--) {
				groupItem = groupData[i];
				for (var j = groupItem.dms_devices_ids.length - 1; j >= 0; j--) {
					deviceId = groupItem.dms_devices_ids[j];
					if (!self.contentViewModel.totalDeviceData[deviceId]) {
						groupItem.dms_devices_ids.splice(j, 1);
					}
				}
				if(groupItem.dms_devices_ids.length === 0) groupData.splice(i, 1);
			}
			// groupData.forEach(function (groupItem) {
			// 	groupItem.dms_devices_ids.forEach(function(deviceId, index) {
			// 		if (!self.contentViewModel.totalDeviceData[deviceId]) groupItem.dms_devices_ids.splice(index, 1);
			// 	});
			// });
			this.contentViewModel.set('groupData', groupData);
			this._setGroupGridDataSoruce();
		},
		_parsingGridData: function(deviceList) {
			var that = this;
			that.contentViewModel.set('deviceData', deviceList);
		},
		_parsingTotalDeviceData: function(deviceList, isChangeFloor) {
			var result = {};
			for(var i = 0, max = deviceList.length; i < max; i++) {
				result[deviceList[i].id] = { index: i };
			}
			if (!isChangeFloor) this.contentViewModel.totalDeviceData = $.extend(true, {}, result);
			this.contentViewModel.totalSelectableDeviceDate = result;
		},
		_setSetting: function(){
			typeOrderingList = getTypeOrderingList();
		},
		_initOptions : function(){
			var I18N = window.I18N;
			var that = this;

			var TEMPLATE =
			"<div class='device-selecter-wrapper'>" +
				// Selectable START
				"<div class='sect selectable'>" +
					"<div class='selectable-header device-selecter-header'>" +
						"<span>" + I18N.prop('FACILITY_SCHEDULE_DEVICE') + "</span>" +
					"</div>" +
					"<div class='selectable-content'>" +
						"<div class='selectable-top-tab'>" +
							"<ul class='selecter-tab-inner'>" +
								"<li data-bind='css:{selected: isAllSelected}, click: clickdAllDevice' ><span class='k-link'>" + I18N.prop('COMMON_ALL') + "</span> <span>( <span data-bind='text: selectableCount.all'></span><span>" + I18N.prop('FACILITY_SCHEDULE_COUNT') + "</span> )</span></li>" +
								"<li data-bind='css:{selected: isGroupSelected}, click: clickGroup'><span class='k-link'>" + I18N.prop('FACILITY_GROUP_GROUP') + "</span> <span>( <span data-bind='text: selectableCount.group'></span><span>" + I18N.prop('FACILITY_SCHEDULE_COUNT') + "</span> )</span></li>" +
							"</ul>" +
						"</div>" +
						"<div class='search-filter-wrap'>" +
							"<div class='search-box'>" +
								"<input type='text' class='k-textbox' data-bind='value: search.value }' placeholder='" + I18N.prop('FACILITY_DEVICE_SEARCH_PLACEHOLDER') + "'>" +
								"<span class='search-rmv-btn ic ic-bt-input-remove' data-bind='events: {click: search.removeBtn.click}, visible: search.removeBtn.isVisible'></span>" +
								"<button class='search-btn ic ic-bt-input-search' data-bind='events: { click: search.click }' >" + I18N.prop('COMMON_BTN_SEARCH') + "</button>" +
							"</div>" +
						"</div>" +
						"<div class='all-device' data-bind='visible: isVisible'>" +
							"<div class='sort-filter-wrap'>" +
								"<input id='device-selecter-sort-building' class='sort-item building' data-role='dropdownlist' data-text-field='name' data-value-field='id' data-option-label='" + I18N.prop('FACILITY_SCHEDULE_BUILDING') + "'  " +
								"data-bind='value: building.value, source: building.dataSource, enabled: building.enabled, events: { cascade: building.events.cascade }' ></input >" +

								"<input id='device-selecter-sort-floor' class='sort-item floor' data-role='dropdownlist' data-text-field='name' data-value-field='id' data-option-label='" + I18N.prop('FACILITY_DEVICE_ENERGY_METER_FLOOR') + "'  " +
								"data-bind='value: floor.value, source: floor.dataSource, enabled: floor.enabled, events: { cascade: floor.events.cascade }' ></input >" +

								"<input id='device-selecter-sort-zone' class='sort-item zone' data-role='dropdownlist' data-text-field='name' data-value-field='id' data-option-label='" + I18N.prop('COMMON_ZONE') + "'  " +
								"data-bind='value: zone.value, source: zone.dataSource, enabled: zone.enabled, events: { cascade: zone.events.cascade }' ></input >" +

								"<input id='device-selecter-sort-type' class='sort-item type' data-role='dropdowncheckbox' data-text-field='text' data-value-field='value' data-option-label='false' data-select-all-text='" + I18N.prop('FACILITY_SCHEDULE_DEVICE_TYPE_ALL') + "'  " +
								"data-bind='source: type.dataSource, enabled: type.enabled, events: { updatedText: type.events.updatedText, selectionChanged: type.events.selectionChanged }' ></input >" +

								"<input id='device-selecter-sort-id' class='sort-item id' data-role='dropdownlist' data-text-field='displayType' data-value-field='type' data-option-label='" + I18N.prop("FACILITY_SCHEDULE_DEVICE_SUB_TYPE") + "'  " +
								"data-bind='value: id.value, source: id.dataSource, enabled: id.enabled, events: { change: id.events.change }' ></input >" +
							"</div>" +
							"<div class='selectable-grid all'></div>" +
						"</div>" +
						"<div class='group-device' data-bind='invisible: isVisible'>" +
							"<div class='sort-filter-wrap'>" +
								"<ul class='radio-list'>" +
									"<li>" +
										"<input type='radio' name='radio-list' id='group-all' value='all' class='k-radio' data-bind='checked: groupRadio.selectedGroupType, events: { change: groupRadio.onChange }'>" +
										"<label class='k-radio-label' for='group-all'>" + I18N.prop('COMMON_ALL') + "</label>" +
									"</li>" +
									"<li class='general'>" +
										"<input type='radio' name='radio-list' id='group-general' value='General' class='k-radio' data-bind='checked: groupRadio.selectedGroupType, events: { change: groupRadio.onChange }'>" +
										"<label class='k-radio-label' for='group-general'>" + I18N.prop('COMMON_GENERAL') + "</label>" +
									"</li>" +
									"<li>" +
										"<input type='radio' name='radio-list' id='group-energy-distribution' value='energyDistribution' class='k-radio' data-bind='checked: groupRadio.selectedGroupType, events: { change: groupRadio.onChange }'>" +
										"<label class='k-radio-label' for='group-energy-distribution'>" + I18N.prop('ENERGY_ENERGY_DISTRIBUTION') + "</label>" +
									"</li>" +
								"</ul>" +
							"</div>" +
							"<div class='selectable-grid group'></div>" +
						"</div>" +
					"</div>" +
					"<div class='grid-selected-count' data-bind='visible: isVisible'><span data-bind='visible: selectableItemVisible.all'> <span data-bind='text: selectableItemCount.all'></span>" + I18N.prop('FACILITY_SCHEDULE_SELECTED_COUNT') + " </span></div>" +
					"<div class='grid-selected-count' data-bind='invisible: isVisible'><span data-bind='visible: selectableItemVisible.group'> <span data-bind='text: selectableItemCount.group'></span>" + I18N.prop('FACILITY_SCHEDULE_SELECTED_COUNT') + "</span></div>" +
				"</div>" +
				// Selectable END

				// BUTTON START
				"<div class='sect buttons'>" +
					"<button type='button' class='k-button select' data-bind='click: btn.clickSelectBtn'><i class='ic-arrow' />▶</button>" +
					"<button type='button' class='k-button deselect' data-bind='click: btn.clickDeSelectBtn'><i class='ic-arrow' />◀</button>" +
				"</div>" +
				// BUTTON END

				// Selected START
				"<div class='sect selected'>" +
					"<div class='selected-header device-selecter-header'>" +
						"<span>" + I18N.prop('FACILITY_DEVICE_SELECTER_TITLE') + "</span>" +
						"<span class='selected-device-count' data-bind='text: selectedDeviceCount'></span>" +
					"</div>" +
					"<div class='selected-content'>" +
						"<div class='selected-top-tab'>" +
							"<ul class='selecter-tab-inner'>" +
								"<li data-bind='css:{selected: isAllSelected}, click: clickdAllDevice'><span class='k-link'>" + I18N.prop('COMMON_ALL') + "</span> <span>( <span data-bind='text: selectedCount.all'></span><span>" + I18N.prop('FACILITY_SCHEDULE_COUNT') + "</span> )</span></li>" +
								"<li data-bind='css:{selected: isGroupSelected}, click: clickGroup'><span class='k-link'>" + I18N.prop('FACILITY_GROUP_GROUP') + "</span> <span>( <span data-bind='text: selectedCount.group'></span><span>" + I18N.prop('FACILITY_SCHEDULE_COUNT') + "</span> )</span></li>" +
							"</ul>" +
						"</div>" +
						"<div class='all-device' data-bind='visible: isVisible'>" +
							"<div class='selected-grid all'></div>" +
						"</div>" +
						"<div class='group-device' data-bind='invisible: isVisible'>" +
							"<div class='selected-grid group'></div>" +
						"</div>" +
					"</div>" +
					"<div class='grid-selected-count' data-bind='visible: isVisible'><span data-bind='visible: selectedItemVisible.all'> <span data-bind='text: selectedItemCount.all'></span>" + I18N.prop('FACILITY_SCHEDULE_SELECTED_COUNT') + " </span></div>" +
					"<div class='grid-selected-count' data-bind='invisible: isVisible'><span data-bind='visible: selectedItemVisible.group'> <span data-bind='text: selectedItemCount.group'></span>" + I18N.prop('FACILITY_SCHEDULE_SELECTED_COUNT') + " </span></div>" +
				"</div>" +
			// Selected END
			"</div>";

			var actions = [
				{
					text : I18N.prop("COMMON_BTN_CLOSE"),
					visible : true,
					disabled : false,
					action : function(e){
						e.sender.trigger("onClose");
					}
				},
				{
					text : I18N.prop("COMMON_BTN_SAVE"),
					visible : true,
					disabled : false,
					action : that._onSave.bind(that)
				},
				{
					text : I18N.prop("COMMON_BTN_EDIT"),
					visible : false,
					disabled : false,
					action : function(e){
					}
				}
			];
			var buttonsIndex = {
				CLOSE : 0,
				EDIT : 2,
				CANCEL : 3,
				SAVE : 1,
				REGISTER : 4,
				DEREGISTER : 5,
				DELETE : 6
			};
			var isCustomActions = true;
			var detailContentTemplate = TEMPLATE;
			var typeFilterDataSource = Util.getControllableDeviceTypeDataSource();

			var contentViewModel = kendo.observable({
				totalDeviceData: {},
				totalGroupData: {},
				totalSelectableDeviceDate: {},
				deviceData: null,
				groupData: null,
				zoneDeviceData: [],
				selectableCount: {
					all: 0,
					group: 0
				},
				selectedCount: {
					all: 0,
					group: 0
				},
				selectableItemVisible: {
					all: 0,
					group: 0
				},
				selectedItemVisible: {
					all: 0,
					group: 0
				},
				selectableItemCount: {
					all: 0,
					group: 0
				},
				selectedItemCount: {
					all: 0,
					group: 0
				},
				search: {
					value: '',
					click: that._onSearchKeyword.bind(that),
					removeBtn: {
						click: that._onRemoveKeyword.bind(that),
						isVisible: false
					}
				},
				floorData: { building: {id: ''}, floor: {id: ''}, zone: {id: ''} },
				building: {
					index: 0,
					value: null,
					dataSource: [],
					enabled: true,
					events: {
						change: function() {},
						cascade: that.buildingChange
					}
				},
				floor: {
					index: 0,
					value: null,
					dataSource: [],
					enabled: false,
					events: {
						change: function() {},
						cascade: that.floorChange
					}
				},
				zone: {
					index: 0,
					value: null,
					dataSource: [],
					enabled: false,
					events: {
						change: function() {},
						cascade: that.zoneChange
					}
				},
				type: {
					index: 0,
					value: null,
					dataSource: typeFilterDataSource,
					enabled: true,
					// noSelectText: '',
					events: {
						change: function() {},
						updatedText: that._updatedText,
						selectionChanged: that.typeChange,
						setGridFiler: that._setGridFilter.bind(that),
						subTypeFilter: that._subTypeFilter.bind(that)
					}
				},
				id: {
					index: 0,
					value: { type: null },
					dataSource: [],
					enabled: false,
					events: {
						change: that.subTypeChange,
						cascade: that.subTypeChange
					}
				},
				btn: {
					clickSelectBtn: that._clickSelectBtn.bind(that),
					clickDeSelectBtn: that._clickDeSelectBtn.bind(that)
				},
				isAllSelected: true,
				isGroupSelected: false,
				isVisible: true,
				clickdAllDevice: that._onClickAllDeviceTab.bind(that),
				clickGroup: that._onClickGroupTab.bind(that),
				selectedDeviceCount: I18N.prop('FACILITY_SCHEDULE_CREATE_SELECTED_DEVICE', 0),
				groupRadio: {
					selectedGroupType: 'all',
					onChange: that._onChangeGroupType.bind(that)
				},
				events: {
					setGridFiler: that._setGridFilter.bind(that),
					Loading: that._Loading.bind(that)
				}
			});

			that.options.title = I18N.prop("FACILITY_SCHEDULE_SELECT_DEVICE");
			that.options.actions = actions;
			that.options.buttonsIndex = buttonsIndex;
			that.options.isCustomActions = isCustomActions;
			that.options.detailContentTemplate = detailContentTemplate;
			that.options.contentViewModel = contentViewModel;
			that.options.onTypeChange = that._onTypeChangeEvt.bind(that);
		},
		_parseDataSource: function(){
		},
		_reset: function() {
			var contentViewModel = this.contentViewModel;
			var ddlList = ['building', 'floor', 'zone'];
			var i, item;
			for (i = 0; i < ddlList.length; i++) {
				item = ddlList[i];
				contentViewModel[item].set('value', null);
				contentViewModel[item].set('dataSource', []);
				contentViewModel[item].set('enabled', item === 'building');
			}
			contentViewModel.type.set('value', null);
			contentViewModel.id.set('value', { type: null });
			contentViewModel.id.set('dataSource', []);
			contentViewModel.id.set('enabled', false);
			contentViewModel.groupRadio.set('selectedGroupType', 'all');

			var selectTextList = ['selectableItemVisible', 'selectedItemVisible', 'selectableItemCount', 'selectedItemCount'];
			for (i = 0; i < selectTextList.length; i++) {
				item = selectTextList[i];
				contentViewModel[item].set('all', 0);
				contentViewModel[item].set('group', 0);
			}
		},
		_onSave: function(e) {
			this.trigger('onSave', {
				sender : e.sender,
				result : this._selectedDeviceData()
			});
		},
		_onClickAllDeviceTab: function(e) {
			var viewModel = this.contentViewModel;
			this.beforeScroll.group.selectable = this.selectableGroupGrid.wrapper.find(".k-scrollbar").scrollTop();
			this.beforeScroll.group.selected = this.selectedGroupGrid.wrapper.find(".k-scrollbar").scrollTop();
			viewModel.set('isVisible', true); viewModel.set('isAllSelected', true); viewModel.set('isGroupSelected', false);
			this.selectableGrid.virtualScrollable.repaintScrollbar();
			this.selectedGrid.virtualScrollable.repaintScrollbar();
			this.selectableGrid.wrapper.find(".k-scrollbar").scrollTop(this.beforeScroll.all.selectable);
			this.selectedGrid.wrapper.find(".k-scrollbar").scrollTop(this.beforeScroll.all.selected);
			this._gridSetScrollTop(true);
		},
		_onClickGroupTab: function(e) {
			var viewModel = this.contentViewModel;
			this.beforeScroll.all.selectable = this.selectableGrid.wrapper.find(".k-scrollbar").scrollTop();
			this.beforeScroll.all.selected = this.selectedGrid.wrapper.find(".k-scrollbar").scrollTop();
			viewModel.set('isVisible', false); viewModel.set('isAllSelected', false); viewModel.set('isGroupSelected', true);
			this.selectableGroupGrid.virtualScrollable.repaintScrollbar();
			this.selectedGroupGrid.virtualScrollable.repaintScrollbar();
			this.selectableGroupGrid.wrapper.find(".k-scrollbar").scrollTop(this.beforeScroll.group.selectable);
			this.selectedGroupGrid.wrapper.find(".k-scrollbar").scrollTop(this.beforeScroll.group.selected);
			this._gridSetScrollTop(true);
		},
		_sortSelectedDeviceView :function(a, b){
			return a.view - b.view;
		},
		_sortSelectedDeviceLength :function(a, b){
			return b.devicesIds.length - a.devicesIds.length;
		},
		_syncDeviceList: function(selectedGroupGridData, selectableGroupGridData, totalSelectableDate, deviceData, totalData, selectedGridData) {
			var selItem, i, j, max, devicesIds, view, devicesIdsMax;
			var sortAscGroupGridData = selectedGroupGridData.sort(function(a, b){ return a.view - b.view; });
			// var item;
			for(i = 0, max = sortAscGroupGridData.length; i < max; i++) {
				selItem = sortAscGroupGridData[i];
				// item = selectableGroupGridData[i];
				devicesIds = selItem.devicesIds;
				view = selItem.view;
				devicesIdsMax = devicesIds.length;
				// if (view === viewType) continue;
				for (j = 0; j < devicesIdsMax; j++) {
					if (totalSelectableDate[devicesIds[j]]) {
						if (deviceData[totalSelectableDate[devicesIds[j]].index]) deviceData[totalSelectableDate[devicesIds[j]].index].view = view;
					}
					if (totalData[devicesIds[j]]) {
						if (selectedGridData[totalData[devicesIds[j]].index]) selectedGridData[totalData[devicesIds[j]].index].view = view;
					}
				}
			}
		},
		_syncSelectDeviceList: function(selectedGroupGridData, selectableGroupGridData, totalData, selectedGridData) {
			var item, selItem, i, j, max, devicesIds, view, devicesIdsMax;
			var selctedDeviceCount = 0,
				changeGroupDeviceList = [];
			for(i = 0, max = selectedGroupGridData.length; i < max; i++) {
				selctedDeviceCount = 0;
				selItem = selectedGroupGridData[i];
				item = selectableGroupGridData[i];
				devicesIds = selItem.devicesIds;
				devicesIdsMax = devicesIds.length;

				for (j = 0; j < devicesIdsMax; j++) {
					if (totalData[devicesIds[j]]) {
						if (selectedGridData[totalData[devicesIds[j]].index]) {
							if (selectedGridData[totalData[devicesIds[j]].index].view) selctedDeviceCount++;
						}
					}
				}
				view = selctedDeviceCount === devicesIdsMax;
				if (view !== item.view) changeGroupDeviceList.push(devicesIds);
				selItem.view = view;
				item.view = view;
			}
			return changeGroupDeviceList;
		},
		_changeGroupSyncDevice: function(deviceList, totalSelectableDate, deviceData, totalData, selectedGridData, viewType) {
			var i, max, devicesIds, devicesIdsMax, j, view = !viewType;
			for(i = 0, max = deviceList.length; i < max; i++) {
				devicesIds = deviceList[i];
				devicesIdsMax = devicesIds.length;
				for (j = 0; j < devicesIdsMax; j++) {
					if (totalSelectableDate[devicesIds[j]]) {
						if (deviceData[totalSelectableDate[devicesIds[j]].index]) deviceData[totalSelectableDate[devicesIds[j]].index].view = view;
					}
					if (totalData[devicesIds[j]]) {
						if (selectedGridData[totalData[devicesIds[j]].index]) selectedGridData[totalData[devicesIds[j]].index].view = view;
					}
				}
			}
		},
		_syncDevice: function(isDeviceAll, viewType) {
			var selectedGrid = this.selectedGrid;
			var selectableGroupGrid = this.selectableGroupGrid;
			var selectedGroupGrid = this.selectedGroupGrid;
			var selectableGroupGridData = selectableGroupGrid.dataSource.data().map(function(value){return value;}).sort(this._sortSelectedDevice).sort(this._sortSelectedDeviceLength);
			var selectedGroupGridData = selectedGroupGrid.dataSource.data().map(function(value){return value;}).sort(this._sortSelectedDevice).sort(this._sortSelectedDeviceLength);
			// var selectableGroupGridData = selectableGroupGrid.dataSource.data();
			// var selectedGroupGridData = selectedGroupGrid.dataSource.data();

			// var selectableGridData = selectableGrid.dataSource.data();
			var deviceData = this.contentViewModel.get('deviceData');
			var selectedGridData = selectedGrid.dataSource.data();

			var totalData = this.contentViewModel.totalDeviceData;
			var totalSelectableDate = this.contentViewModel.totalSelectableDeviceDate;
			if (!isDeviceAll) {
				this._syncDeviceList(selectedGroupGridData, selectableGroupGridData, totalSelectableDate, deviceData, totalData, selectedGridData, viewType);
				// this._syncSelectDeviceList(selectedGroupGridData, selectableGroupGridData, totalData, selectedGridData, viewType)
				// this._changeGroupSyncDevice(this._syncSelectDeviceList(selectedGroupGridData, selectableGroupGridData, totalData, selectedGridData, viewType), totalSelectableDate, deviceData, totalData, selectedGridData, viewType);
			} else {
				// this._syncSelectDeviceList(selectedGroupGridData, selectableGroupGridData, totalData, selectedGridData, viewType);
			}
			this.selectableGrid.dataSource.page(this.selectableGrid.dataSource.page());
			this.selectedGrid.dataSource.page(this.selectedGrid.dataSource.page());
			this.selectableGroupGrid.dataSource.page(this.selectableGroupGrid.dataSource.page());
			this.selectedGroupGrid.dataSource.page(this.selectedGroupGrid.dataSource.page());

			this.selectableGrid.dataSource.filter(this.selectableGrid.dataSource.filter());
			this.selectedGrid.dataSource.filter(this.selectedGrid.dataSource.filter());
			this.selectableGroupGrid.dataSource.filter(this.selectableGroupGrid.dataSource.filter());
			this.selectedGroupGrid.dataSource.filter(this.selectedGroupGrid.dataSource.filter());

			this.selectableGroupGrid.dataSource.sort(GROUP_SORT);
			this.selectedGroupGrid.dataSource.sort(GROUP_SORT);

			this._setGridFilter(true);

		},
		_onChangeGroupType: function(e) {
			var groupType = this.contentViewModel.groupRadio.get('selectedGroupType');
			var filters = [FILTER];
			if (groupType !== 'all') filters.push({ field : "type", operator : "eq", value : groupType });
			this.selectableGroupGrid.dataSource.filter(filters);
		},
		_gridSetScrollTop: function(customTop) {
			if (!customTop) {
				this.selectableGrid.dataSource.page(1);
				this.selectedGrid.dataSource.page(1);
				this.selectableGrid.wrapper.find(".k-scrollbar").scrollTop(0);
				this.selectedGrid.wrapper.find(".k-scrollbar").scrollTop(0);
			} else {
				this.selectableGrid.virtualScrollable.verticalScrollbar.trigger('scroll');
				this.selectedGrid.virtualScrollable.verticalScrollbar.trigger('scroll');
				this.selectableGroupGrid.virtualScrollable.verticalScrollbar.trigger('scroll');
				this.selectedGroupGrid.virtualScrollable.verticalScrollbar.trigger('scroll');
			}
		},
		_changeAllGridDataSet: function() {
			var selectableGridDataLength = this.selectableGrid.getSelectedData().filter(function(item) {return !item.view;}).length;
			var selectedGridDataLength = this.selectedGrid.getSelectedData().filter(function(item) {return item.view;}).length;
			this.contentViewModel.selectableItemVisible.set('all', selectableGridDataLength > 0);
			this.contentViewModel.selectedItemVisible.set('all', selectedGridDataLength > 0);
			this.contentViewModel.selectableItemCount.set('all', selectableGridDataLength);
			this.contentViewModel.selectedItemCount.set('all', selectedGridDataLength);
		},
		_changeGroupGridDataSet: function() {
			var selectableGridDataLength = this.selectableGroupGrid.getSelectedData().length;
			var selectedGridDataLength = this.selectedGroupGrid.getSelectedData().length;
			this.contentViewModel.selectableItemVisible.set('group', selectableGridDataLength > 0);
			this.contentViewModel.selectedItemVisible.set('group', selectedGridDataLength > 0);
			this.contentViewModel.selectableItemCount.set('group', selectableGridDataLength);
			this.contentViewModel.selectedItemCount.set('group', selectedGridDataLength);
		},
		_attchGridEvent: function() {
			var that = this;
			that.selectableGrid.bind("change", function(e){
				that._changeAllGridDataSet();
			});
			that.selectedGrid.bind("change", function(e){
				that._changeAllGridDataSet();
			});
			that.selectableGroupGrid.bind("change", function(e){
				that._changeGroupGridDataSet();
			});
			that.selectedGroupGrid.bind("change", function(e){
				that._changeGroupGridDataSet();
			});
		},
		_initComponent: function(){
			var mainWindow = window.MAIN_WINDOW;
			var buildingList = mainWindow.getCurrentBuildingList();
			// 빌딩 data 추가
			this.contentViewModel.building.set('dataSource', buildingList);
			this.Loading.open();
			// this.wrapper.find('.selectable-grid div.k-grid-header').show();
			// this.wrapper.find('.selected-grid div.k-grid-header').show();
			this._initSelectableGrid();
			this._initSelectedGrid();
			this._initGroupGrid();
			this._attchGridEvent();
			this._setViewData();
			// this.wrapper.find('.selectable-grid div.k-grid-header').hide();
			// this.wrapper.find('.selected-grid div.k-grid-header').hide();

			// test
			window.selectableGrid = this.selectableGrid;
			window.selectedGrid = this.selectedGrid;
		},
		_setSearchFilter: function(filters, isVisible) {
			// 기존 서치필터 삭제
			var filterItem;
			for(var i = 0, max = filters.filters.length; i < max; i++) {
				filterItem = filters.filters[i];
				if (filterItem.search) filters.filters.splice(i, 1);
			}
			// 공백일경우 진행하지않음
			var searchValue = this.contentViewModel.search.get('value');
			if (searchValue === '') return filters;

			var searchFilters = { logic : "or", filters : [], search: true };
			searchFilters.filters.push({ field: "name", operator: function(value) {
				return value.indexOf(searchValue) !== -1;
			}, value: searchValue });
			if(isVisible) searchFilters.filters.push({ field: "id", operator: function(value) {
				return value.indexOf(searchValue) !== -1;
			}, value: searchValue });
			filters.filters.push(searchFilters);
			return filters;
		},
		_onSearchKeyword: function() {
			var isVisible = this.contentViewModel.get('isVisible');
			var selectableGrid = isVisible ? this.selectableGrid : this.selectableGroupGrid;
			selectableGrid.dataSource.filter(this._setSearchFilter(selectableGrid.dataSource.filter(), isVisible));
		},
		_onRemoveKeyword: function() {
			this.contentViewModel.search.set('value', '');
		},
		_setSelectGridDataSoruce: function(viewType, isDeviceAll, setPage, dblclickId) {
			var selectableGrid = isDeviceAll ? this.selectableGrid : this.selectableGroupGrid;
			var selectedGrid = isDeviceAll ? this.selectedGrid : this.selectedGroupGrid;
			var selectableGridData = selectableGrid.dataSource.data();
			var selectedGridData = selectedGrid.dataSource.data();
			var totalData;
			var selectedTotalData;
			var selGridData = !viewType ? selectableGridData : selectedGridData;
			var refreshGridData = viewType ? selectableGridData : selectedGridData;
			var item;
			if (isDeviceAll) {
				totalData = viewType ? this.contentViewModel.totalSelectableDeviceDate : this.contentViewModel.totalDeviceData;
				selectedTotalData = !viewType ? this.contentViewModel.totalSelectableDeviceDate : this.contentViewModel.totalDeviceData;
			} else {
				totalData = this.contentViewModel.totalGroupData;
				selectedTotalData = this.contentViewModel.totalGroupData;
			}

			if (dblclickId) {
				if (totalData[dblclickId]) {
					item = refreshGridData[totalData[dblclickId].index];
				}
				if (item) item.view = !viewType;
				if (selectedTotalData[dblclickId]) {
					item = selGridData[selectedTotalData[dblclickId].index];
				}
				if (item) item.view = !viewType;
				selectableGrid.clearSelection();
				selectedGrid.clearSelection();
			}

			for(var i = 0, max = selGridData.length; i < max; i++) {
				if(selGridData[i].selected) {
					selGridData[i].view = !viewType;
					item = null;
					if (totalData[selGridData[i].id]) {
						item = refreshGridData[totalData[selGridData[i].id].index];
					}
					if (item) item.view = !viewType;
				}
			}

			var filterSelectableGrid = selectableGrid.dataSource.filter();
			var selectableGridPage = selectableGrid.dataSource.page();
			var selectableGridDataSource = new kendo.data.DataSource({
				pageSize: 8,
				data: selectableGridData,
				filter: filterSelectableGrid,
				sort: GROUP_SORT
			});
			selectableGridDataSource.read();
			var selectedGridPage = selectedGrid.dataSource.page();
			var selectedGridDataSource = new kendo.data.DataSource({
				pageSize: SELECTED_GRID_PAGE_SIZE,
				data: selectedGridData,
				filter: SELECTED_FILTER,
				sort: GROUP_SORT
			});
			selectedGridDataSource.read();
			selectableGrid.setDataSource(selectableGridDataSource);
			selectedGrid.setDataSource(selectedGridDataSource);
			if(setPage) {
				var selectableGridTotalPages = selectableGrid.dataSource.totalPages();
				var selectedGridTotalPages = selectedGrid.dataSource.totalPages();
				selectableGridPage = selectableGridPage > selectableGridTotalPages ? selectableGridTotalPages : selectableGridPage;
				selectedGridPage = selectedGridPage > selectedGridTotalPages ? selectedGridTotalPages : selectedGridPage;

				selectableGrid.dataSource.page(selectableGridPage);
				selectedGrid.dataSource.page(selectedGridPage);
			}

			selectableGrid.clearSelection();
			selectedGrid.clearSelection();
			this._setGridFilter(true);
		},
		_clickSelectBtn: function() {
			var isDeviceAll = this.contentViewModel.get('isVisible');
			this._setSelectGridDataSoruce(false, isDeviceAll, true);
		},
		_clickDeSelectBtn: function() {
			var isDeviceAll = this.contentViewModel.get('isVisible');
			this._setSelectGridDataSoruce(true, isDeviceAll, true);
		},
		_setGridFilter: function(noScrollTop) {
			var filters = [FILTER];
			this._setTypeFilter(filters);
			this._setSubTypeFilter(filters);
			this.getLoactionFilter(filters);
			var deviceData = this.contentViewModel.get('deviceData');
			var totalDeviceData = this.contentViewModel.totalDeviceData;
			var selectedGridData = this.selectedGrid.dataSource.data();
			var item, max, getItem;
			var selectableGridData = [];
			if (!deviceData) return;
			max = deviceData.length;
			for (var i = 0; i < max; i++) {
				item = deviceData[i];
				if (totalDeviceData[item.id]) getItem = selectedGridData[totalDeviceData[item.id].index];
				// getItem = selectedGridDS.get(item.id);
				if (getItem) item.view = getItem.view;
				else item.view = false;
				selectableGridData[i] = { id: item.id, name: item.name, locations: item.locations, type: item.type, mappedType:item.mappedType, view: item.view };
			}
			var selectableGridDataSource = new kendo.data.DataSource({
				pageSize: 8,
				data: selectableGridData,
				filter: filters
			});
			this.selectableGrid.setDataSource(selectableGridDataSource);

			this._gridSetScrollTop(noScrollTop);
			this._parsingTotalDeviceData(deviceData, true);
			this.Loading.close();
		},
		_setTypeFilter: function(filters) {
			var types = this.contentViewModel.type.get('value');
			if (!types) return;
			var typeFilters = { logic : "or", filters : [] };
			var type, i, max;
			types = types.newValue;
			if(types.length > 0){
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
			}
			filters.push(typeFilters);
		},
		_setSubTypeFilter: function(filters) {
			var subTypeFilters = { logic : "and", filters : [] };
			var subType = this.contentViewModel.id.get('value');
			var i, max;
			subType = subType.type;
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
				filters.push(subTypeFilters);
			}
		},
		getLoactionFilter: function(filters){
			// var MainWindow = window.MAIN_WINDOW;
			var floorData = this.contentViewModel.get('floorData');
			// var floor = floorData.floor, building = floorData.building;
			var zone = floorData.zone;
			var zoneId = zone.id;
			// if(building && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			// 	filters.push(filter1Depth("locations", "foundation_space_buildings_id", building.id));
			// }
			// if(floor && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			// 	filters.push(filter1Depth("locations", "foundation_space_floors_id", floor.id));
			// }
			if(zone && zoneId != 'all'){
				if (zoneId === 'none') zoneId = 0;
				filters.push(filter1Depth("locations", "foundation_space_zones_id", zone.id));
			}
		},
		_setGridDataSoruce: function() {
			var deviceData = this.contentViewModel.get('deviceData');
			var item, max;
			var selectableGridData = [];
			var selectedGridData = [];
			max = deviceData.length;
			for (var i = 0; i < max; i++) {
				item = deviceData[i];
				if (item) {
					selectableGridData.push({ id: item.id, name: item.name, locations: item.locations, mappedType: item.mappedType, type: item.type, view: false });
					selectedGridData.push({ id: item.id, name: item.name, locations: item.locations, mappedType: item.mappedType, type: item.type, view: false });
				}
			}

			if (this.selectIds.length > 0) {
				var selectIds = this.selectIds;
				var totalDeviceData = this.contentViewModel.totalDeviceData;
				var totalSelectableDeviceDate = this.contentViewModel.totalSelectableDeviceDate;
				for (var j = 0, selectIdsMax = selectIds.length; j < selectIdsMax; j++) {
					if (totalSelectableDeviceDate[selectIds[j]]) selectableGridData[totalSelectableDeviceDate[selectIds[j]].index].view = true;
					if (totalDeviceData[selectIds[j]]) selectedGridData[totalDeviceData[selectIds[j]].index].view = true;
				}
			}
			var selectableGridDataSource = new kendo.data.DataSource({
				pageSize: 8,
				data: selectableGridData,
				filter: { field: "view", operator: "eq", value: false }
			});
			this.selectableGrid.setDataSource(selectableGridDataSource);
			// this.selectableGrid.dataSource.page(0);

			var selectedGridDataSource = new kendo.data.DataSource({
				pageSize: SELECTED_GRID_PAGE_SIZE,
				data: selectedGridData,
				filter: SELECTED_FILTER
			});
			this.selectedGrid.setDataSource(selectedGridDataSource);
			// this.selectedGrid.dataSource.page(0);
		},
		_setGroupGridDataSoruce: function() {
			var groupData = this.contentViewModel.get('groupData');
			var item, max;
			var selectableGridData = [];
			var selectedGridData = [];
			max = groupData.length;
			for (var i = 0; i < max; i++) {
				item = groupData[i];
				selectableGridData[i] = { id: item.id, name: item.name, type: item.type, devicesIds: item.dms_devices_ids, view: false };
				selectedGridData[i] = { id: item.id, name: item.name, type: item.type, devicesIds: item.dms_devices_ids, view: false };
			}
			var selectableGridDataSource = new kendo.data.DataSource({
				pageSize: 8,
				data: selectableGridData,
				filter: FILTER,
				sort: GROUP_SORT
			});
			this.selectableGroupGrid.setDataSource(selectableGridDataSource);
			// this.selectableGroupGrid.dataSource.page(0);

			var selectedGridDataSource = new kendo.data.DataSource({
				pageSize: SELECTED_GRID_PAGE_SIZE,
				data: selectedGridData,
				filter: SELECTED_FILTER,
				sort: GROUP_SORT
			});
			this.selectedGroupGrid.setDataSource(selectedGridDataSource);
			// this.selectedGroupGrid.dataSource.page(0);
		},
		_initGroupGrid: function() {
			// group selectable grid
			var that = this;
			var el;
			this.contentViewModel.set('isVisible', false);
			this.contentViewModel.set('isVisible', false);

			el = this.wrapper.find(".selectable-grid.group");
			this.selectableGroupGrid = el.kendoGrid({
				dataSource: [],
				columns: [
					{ field: "id", title: "id", template: "<div>#: data.name # </div>" }
				],
				height: 484,
				scrollable: {
					virtual: true
				},
				groupable : false,
				sortable: true,
				filterable: false,
				pageable: false,
				useSingleSelection: true,
				selectable : "multiple row",    //기존 Grid의 선택 이벤트를 off하려면 false로 하여도 무관. model은 유지되며, model에 따라 선택 상태로 렌더링 됨.
				hasSelectedModel : true,        //selected 프로퍼티를 통하여 Model에 select 상태를 유지하도록 하게 함.
				setSelectedAttribute : true,     //데이터가 selected 프로퍼티를 갖게 함. (이미 존재할 경우 true로 하지 않아도 됨)
				noRecords: {
					template: "<div></div>"
				}
			}).data("kendoGrid");

			// group selected grid
			el = this.wrapper.find(".selected-grid.group");
			this.selectedGroupGrid = el.kendoGrid({
				dataSource: [],
				columns: [
					{ field: "id", title: "id", template: "<div>#: data.name # </div>" }
				],
				height: 576,
				scrollable: {
					virtual: true
				},
				groupable : false,
				sortable: true,
				filterable: false,
				pageable: false,
				useSingleSelection: true,
				selectable : "multiple row",    //기존 Grid의 선택 이벤트를 off하려면 false로 하여도 무관. model은 유지되며, model에 따라 선택 상태로 렌더링 됨.
				hasSelectedModel : true,        //selected 프로퍼티를 통하여 Model에 select 상태를 유지하도록 하게 함.
				setSelectedAttribute : true,     //데이터가 selected 프로퍼티를 갖게 함. (이미 존재할 경우 true로 하지 않아도 됨)
				noRecords: {
					template: "<div></div>"
				}
			}).data("kendoGrid");
			this.selectedGroupGrid.bind("dataBound", function(e){
				that._countSelectedDevcie();
			});

			this.contentViewModel.set('isVisible', true);
			this.contentViewModel.set('isVisible', true);
		},
		_initSelectableGrid: function() {
			// 미선택 그리드
			var el = this.wrapper.find(".selectable-grid.all");
			this.selectableGrid = el.kendoGrid({
				dataSource: [],
				columns: [
					{ field: "device", title: "Device", template: "<div class='name'>#: data.name # </div><div class='id'>#: data.id#</div>" }
				],
				height: 484,
				scrollable: {
					virtual: true
				},
				groupable : false,
				sortable: true,
				filterable: false,
				pageable: false,
				useSingleSelection: true,
				selectable : "multiple row",    //기존 Grid의 선택 이벤트를 off하려면 false로 하여도 무관. model은 유지되며, model에 따라 선택 상태로 렌더링 됨.
				hasSelectedModel : true,        //selected 프로퍼티를 통하여 Model에 select 상태를 유지하도록 하게 함.
				setSelectedAttribute : true,     //데이터가 selected 프로퍼티를 갖게 함. (이미 존재할 경우 true로 하지 않아도 됨)
				noRecords: {
					template: "<div></div>"
				}
			}).data("kendoGrid");
		},
		_initSelectedGrid: function(){
			// 선택 그리드
			var that = this;
			var el = this.wrapper.find(".selected-grid.all");
			this.selectedGrid = el.kendoGrid({
				dataSource: [],
				columns: [
					{ field: "id", title: "ID", template: "<div class='name'>#: data.name # </div><div class='id'>#: data.id#</div>" }
				],
				height: 576,
				scrollable: {
					virtual: true
				},
				groupable : false,
				sortable: true,
				filterable: false,
				pageable: false,
				useSingleSelection: true,
				selectable : "multiple row",    //기존 Grid의 선택 이벤트를 off하려면 false로 하여도 무관. model은 유지되며, model에 따라 선택 상태로 렌더링 됨.
				hasSelectedModel : true,        //selected 프로퍼티를 통하여 Model에 select 상태를 유지하도록 하게 함.
				setSelectedAttribute : true,     //데이터가 selected 프로퍼티를 갖게 함. (이미 존재할 경우 true로 하지 않아도 됨)
				noRecords: {
					template: "<div></div>"
				}
			}).data("kendoGrid");

			// this.selectedGrid.bind("change", function(e){
			// });
			this.selectedGrid.bind("dataBound", function(e){
				that._countSelectedDevcie();
			});
		},
		_selectedDeviceData: function() {
			var that = this;
			var result = [];
			var data = that.selectedGrid.dataSource.data();
			var selcetedData = new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : "view", operator : "eq", value : true}]
			}).toArray();
			this.contentViewModel.selectableCount.set('all', data.length - selcetedData.length);
			this.contentViewModel.selectedCount.set('all', selcetedData.length);
			result = selcetedData;

			var devicesIds = {};
			var selectedGroupData = [];
			var deviceData = that.contentViewModel.deviceData, totalDeviceData = that.contentViewModel.totalDeviceData;
			data = that.selectedGroupGrid.dataSource.data();
			selectedGroupData = new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : "view", operator : "eq", value : true}]
			}).toArray();
			for(var i = 0; i < selectedGroupData.length; i++) {
				selectedGroupData[i].devicesIds.forEach(function(value){
					if (totalDeviceData[value].index) devicesIds[value] = deviceData[totalDeviceData[value].index];
				});
			}
			for (var prop in devicesIds) {
				result.push(devicesIds[prop]);
			}
			this.contentViewModel.selectableCount.set('group', data.length - selectedGroupData.length);
			this.contentViewModel.selectedCount.set('group', selectedGroupData.length);

			return getUniqueObjectArray(result, 'id');
		},
		_countSelectedDevcie: function() {
			var data = this._selectedDeviceData();
			this.contentViewModel.set('selectedDeviceCount', window.I18N.prop('FACILITY_SCHEDULE_CREATE_SELECTED_DEVICE', data.length));
		},
		_attchEvent: function(){
			var that = this;
			var contentViewModel = this.contentViewModel;
			$(that.wrapper).keydown(function (e) {
				if (!that.selectableGrid) return;
				var gridData, selectedStatus;
				if (e.ctrlKey && e.keyCode === 65) {
					var isVisible = contentViewModel.get('isVisible');
					var selectableGrid = isVisible ? that.selectableGrid : that.selectableGroupGrid;
					gridData = selectableGrid.dataSource.data();
					selectedStatus = gridData.reduce(function(acc, cur){
						return !!acc && !!cur.selected;
					}, true);
					if(selectedStatus) selectableGrid.clearSelection();
					else selectableGrid.selectAll(true);
				}
			});

			that.wrapper.on("keyup", function(key) {
				if (key.keyCode === 13) {
					var val = that.wrapper.find('.search-box input').val();
					contentViewModel.search.set('value', val);
					contentViewModel.search.click();
				}
			});

			$(that.wrapper).on("dblclick", ".selectable-grid.all tr", function(e) {
				var id = $(e.currentTarget).data('id');
				that._setSelectGridDataSoruce(false, true, true, id);
			});
			$(that.wrapper).on("dblclick", ".selected-grid.all tr", function(e) {
				var id = $(e.currentTarget).data('id');
				that._setSelectGridDataSoruce(true, true, true, id);
			});
			$(that.wrapper).on("dblclick", ".selectable-grid.group tr", function(e) {
				var id = $(e.currentTarget).data('id');
				that._setSelectGridDataSoruce(false, false, true, id);
			});
			$(that.wrapper).on("dblclick", ".selected-grid.group tr", function(e) {
				var id = $(e.currentTarget).data('id');
				that._setSelectGridDataSoruce(true, false, true, id);
			});

			$(that.wrapper).on("input", ".search-box input", function(e) {
				contentViewModel.search.removeBtn.set("isVisible", this.value.length > 0);
			});
		},
		_onTypeChangeEvt: function(){
			// console.log(e);
		},
		buildingChange: function(e){
			var buildingId = e.sender.value();
			var self = this;
			var max;
			if (buildingId === '') {
				buildingId = 0;
				self.floor.set("enabled", false);
				self.zone.set("enabled", false);
				self.floor.set("value", '');
				self.zone.set("value", '');
			}
			if(buildingId || buildingId === 0){
				self.floorData.building.id = buildingId;
				self.floorData.floor.set('id', '');
				self.floorData.zone.set('id', '');
				self.type.events.selectionChanged.call(this);
				$.ajax({
					url : "/foundation/space/floors?foundation_space_buildings_id=" + buildingId
				}).done(function(data){
					data.sort(function(a, b){
						return a.sortOrder - b.sortOrder;
					});
					max = data.length;
					for(var i = 0; i < max; i++ ){
						data[i].name = Util.getFloorName(data[i]);
					}
					self.floor.set("dataSource", data);
					self.floor.set("enabled", buildingId !== 0);
				}).fail(function(){
				}).always(function(){
				});
			}
		},
		floorChange: function(e){
			var I18N = window.I18N;
			var floorId = e.sender.value();
			var self = this;
			if(floorId){
				self.floorData.floor.id = floorId;
				self.floorData.zone.set('id', '');
				self.type.events.selectionChanged.call(this);
				$.ajax({
					url : "/foundation/space/zones?foundation_space_floors_id=" + floorId
				}).done(function(data){
					data.sort(function(a, b){
						return a.sortOrder - b.sortOrder;
					});
					if(data && $.isArray){
						data.unshift({
							name : I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY_ZONE"),
							id : "none"
						});
						data.unshift({
							name : I18N.prop("FACILITY_DEVICE_ALL_ZONE"),
							id : "all"
						});
					}
					// self.zone.set("dataSource", data);
					// self.zone.set("enabled", false);
					checkEnableChange.bind(self)(e, data);
				}).fail(function(){
				}).always(function(){
				});
			}else{
				self.zone.set("enabled", false);
				self.zone.set("value", '');
				// self.type.set("enabled", false);
				// self.id.set("enabled", false);
			}
		},
		zoneChange: function(e){
			var self = this;
			var zoneId = e.sender.value();
			if(zoneId){
				self.floorData.zone.id = zoneId;
				self.type.set("enabled", true);
				self.type.events.selectionChanged.call(this);
			}else{
				// this.type.set("enabled", false);
				// this.id.set("enabled", false);
			}
		},
		_updatedText: function(e) {
			var sender = e.sender;
			var selectedItems = sender.getSelectedItems();
			var inputTag = sender.element.parent().find('.k-dropdown-wrap .k-input');
			if (selectedItems.length === 0) {
				inputTag.text(sender.options.selectAllText);
			} else if (selectedItems.length === 1) {
				inputTag.text(selectedItems[0].innerText);
			}
		},
		typeChange: function(e){
			this.events.Loading().open();
			var self = this;
			var type = e;
			if (type) self.type.value = type;
			self.type.events.subTypeFilter(type);

			var floorData = self.get('floorData');
			var buildingId = self.floorData.building.get('id');
			var floorId = self.floorData.floor.get('id');
			var zoneId =  self.floorData.zone.get('id');
			if(floorId instanceof kendo.data.ObservableObject){
				zoneId = zoneId.id;
			}
			var q = "?";
			var mq = "";
			if(buildingId && buildingId !== '') {
				q += "foundation_space_buildings_id=" + buildingId + "&";
			}
			if(floorId && floorId !== '') {
				q += "foundation_space_floors_id=" + floorId + "&";
			}
			if(zoneId && zoneId !== "none" && zoneId !== "all"){
				q += "foundation_space_zones_id=" + zoneId + "&";
			}
			if(zoneId === "none"){
				q += "foundation_space_floors_id=" + floorId + "&";
				q += "foundation_space_zones_id=" + 0 + "&";
			}
			if(zoneId === "all"){
				q += "foundation_space_floors_id=" + floorId + "&";
			}

			var mappedType;
			//ControlPoint MappedTypes
			// if (type) {
			// 	if(type == "Sensor.Temperature" || type == "Sensor.Humidity" ||
			// 	type.indexOf("Meter") != -1 || type == "Light" || type == "Sensor.Motion"){
			// 		mappedType = type;
			// 		if(type == "Meter"){
			// 			mappedType = "Meter.*";
			// 		}
			// 		mq = q + "types=ControlPoint.*&";
			// 		mq += "registrationStatuses=Registered&";
			// 	}
			// 	q += "types=" + type + "&";
			// 	if(type.indexOf("ControlPoint") != -1){
			// 		q += "mappedTypes=ControlPoint&";
			// 	}
			// }
			q += "registrationStatuses=Registered";

			var reqArr = [];
			var typeDevices = [], mappedTypeDevices = [];
			reqArr.push(getCurrentFloorDevices(floorData).done(function(data){
				typeDevices = data;
			}));

			if(mappedType){
				mq += ("mappedTypes=" + mappedType);
				reqArr.push($.ajax({
					url : "/dms/devices" + mq
				}).done(function(data){
					mappedTypeDevices = data;
				}));
			}

			$.when.apply(self, reqArr).fail(function(){			//[2018-04-12][xhq 파라메타를 사용하는 콘솔이 주석처리되어 미사용변수가됨 파라메타 제거]
				// var msg = Util.parseFailResponse(xhq);		//[2018-04-12][해당 변수를 사용하는 콘솔이 주석처리되어 미사용변수가됨 주석처리]
				// console.error(msg);
			}).always(function(){
				var i, j, max, size, item, mappedItem, isExist = false;
				max = typeDevices.length; size = mappedTypeDevices.length;

				//중복 체크
				for( i = 0; i < size; i++ ){
					mappedItem = mappedTypeDevices[i];
					isExist = false;
					for( j = 0; j < max; j++ ){
						item = typeDevices[j];
						if(mappedItem.id == item.id){
							isExist = true;
							break;
						}
					}
					if(!isExist){
						typeDevices.push(mappedItem);
					}
				}
				typeDevices = typeDevices.sort(function(a, b){
					return a.name.localeCompare(b.name, 'en', {
						numeric: true
					});
				});
				self.set("deviceData", typeDevices);
				// self.id.set("enabled", true);
				self.id.set("enabled", !!type);
				self.type.events.setGridFiler();

				var selectedTypes = self.type.get('value');
				var isEnabled = false;
				if (selectedTypes) {
					if (selectedTypes.newValue.length === 1) isEnabled = selectedTypes.newValue[0] == "AirConditioner." || selectedTypes.newValue[0] == "ControlPoint";
				}
				self.id.set("enabled", isEnabled);
			});
		},
		subTypeChange: function(e){
			var self = this;
			var subTypeId = e.sender.value();
			if(subTypeId){
				self.id.value.type = subTypeId;
				self.type.events.setGridFiler();
			}
		},
		_subTypeFilter: function(e) {
			if(!e) return;
			var I18N = window.I18N;
			var self = this.contentViewModel;
			var id = self.get('id');
			var typeFilterText = {
				"AirConditioner" : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"),
				"AirConditionerOutdoor" : I18N.prop("FACILITY_DEVICE_TYPE_SAC_OUTDOOR"),
				"ControlPoint" : I18N.prop("FACILITY_DEVICE_TYPE_POINT"),
				"Meter" : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"),
				"Beacon" : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"),
				"IoT Gateway" : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"),
				"Light" : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"),
				"CCTV" : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"),
				"Printer" : I18N.prop("FACILITY_DEVICE_TYPE_PRINTER")
			};
			var subTypeFilter = this.wrapper.find('input.sort-item.id').data('kendoDropDownList');
			var typeFilterDataSource = self.get('type').dataSource.length;
			var _disableSubTypeFilter = function(){
				id.set("enabled", false);
				subTypeFilter.setOptions({optionLabel : I18N.prop("FACILITY_SCHEDULE_DEVICE_SUB_TYPE")});
				id.set('dataSource', []);
				id.set('value', {type:null});
				return;
			};
			var value, length = e.newValue.length;

			if(length == typeFilterDataSource.length){ //select all
				_disableSubTypeFilter();
				e = "All";
			}else if(length > 1 || length === 0){
				_disableSubTypeFilter();
			}else{
				value = e.newValue[0];
				value = value.replace(".", "");
				var list = Util.getDeviceTypeList(value, true);
				var i, max;
				if(value == "ControlPoint"){
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
					_disableSubTypeFilter();
				}else{
					var text = typeFilterText[value];
					var allText = (I18N.prop("COMMON_ALL") + " " + text + " " + I18N.prop("FACILITY_DEVICE_TYPE"));
					//Option Label을 Refresh 하기 위함.
					_disableSubTypeFilter();
					id.set("enabled", true);
					subTypeFilter.setOptions({optionLabel : {
						displayType : allText,
						type : "All"
					}});
					id.set('dataSource', list);
				}
			}
		},
		open: function(){
			DetailDialog.fn.open.call(this);
			this._initComponent();
		},
		close: function() {
			this.contentViewModel.search.set('value', '');
			this._reset();
			DetailDialog.fn.close.call(this);
		},
		selectByIds: function(ids) {
			this.selectIds = ids;
			if (this.selectedGrid) {
				if (this.selectedGrid.dataSource.data().length > 0) {
					this._setGridDataSoruce();
				}
			}
		}
	});

	ui.plugin(CommonDeviceSelecter);
})(window, jQuery);
//# sourceURL=device-selecter.js
