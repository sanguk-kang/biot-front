define("device/common/controller/device-controller", ["device/common/controller/base-controller", "device/common/device-api", "device/common/device-util","device/common/device-constants", "device/common/config/popup-config"], function(BaseController, Api, DeviceUtil, Constants, PopupConfig){

	var kendo = window.kendo;
	var MainWindow = window.MAIN_WINDOW;
	var I18N = window.I18N;
	var msgDialog = PopupConfig.messageDialog;
	//var confirmDialog = PopupConfig.confirmDialog;

	/*
	*
	*	실내기(SAC Indoor) 기기 탭
	*
	*/

	var SacIndoorController = BaseController.extend({
		init : function(e){
			var self = this;
			BaseController.fn.init.call(this, e);
			self.controlPanelTimer = [];
			self.panelRefreshTimer = null;
		},
		initComponent : function(){
			var self = this;
			BaseController.fn.initComponent.call(self);

			this.controlPanel = this.controlPanelElement.kendoControlTab({
				change : self._changeControlPanelEvt.bind(self)
			}).data("kendoControlTab");
		},
		attachFilterEvt : function(){
			var self = this;
			BaseController.fn.attachFilterEvt.call(self);
			var typeFilter = self.getFilterViewModel(Constants.FILTER_NAME.TYPE);
			typeFilter.options.set("select", function(e){
				var typeFilters = self.typeFilter = [];
				var value = e.dataItem.value;
				if(value !== ""){
					value = Constants.INDOOR_TYPE[value];
					if($.isArray(value)){
						var i, max = value.length;
						var multiFilter = { logic : "or", filters : [] };
						for( i = 0; i < max; i++){
							multiFilter.filters.push(DeviceUtil.filter0Depth("type", "eq", value[i]));
						}
						typeFilters.push(multiFilter);
					}else{
						typeFilters.push(DeviceUtil.filter0Depth("type", "eq", value));
					}
				}
				self.applyCurrentFilter();
			});
			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0) {
					statusFilters.push(DeviceUtil.filter0Depth("status", "eq", "none"));
				}else if (length !== Constants.STATUS.length){
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						var value = status.split(".")[1];
						switch(value){
						case "On":
						case "Off": statusFilters.push(DeviceUtil.filterStatusNoAlarm("operations", "power", value, "alarms")); break;
						case "Critical": statusFilters.push(DeviceUtil.filter1Depth("alarms", "alarms_type", value)); break;
						case "Warning": statusFilters.push(DeviceUtil.filter1DepthNone("alarms", "alarms_type", value)); break;
						default: break;
						}
					}
				}
				self.applyCurrentFilter();
			});
			var modeFilter = self.getFilterViewModel(Constants.FILTER_NAME.MODE);
			modeFilter.options.set("select", function(e){
				var modeFilters = self.modeFilter = [];
				var value = e.dataItem.value;
				if(value !== ""){
					var filter = DeviceUtil.filter1Depth("modes", "mode", Constants.MODE[value - 1].mode);
					filter.id = Constants.MODE[value - 1].id;
					modeFilters.push(filter);
				}
				self.applyCurrentFilter();
			});
		},
		onMonitoringLayout : function(){
			var self = this;
			BaseController.fn.onMonitoringLayout.call(self);

			self.setViewBtnEnabled("statistic", true);
			self.setViewBtnEnabled("map", true);
			self.setViewBtnEnabled("list", true);
			self.setViewBtnEnabled("grid", true);
		},
		selectAll : function(){
			var self = this;
			var selectedData = BaseController.fn.selectAll.call(self);
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName;
			if(layoutName == "monitoring") self.controlPanel.setDataSource(selectedData);
		},
		unselectAll : function(){
			var self = this;
			BaseController.fn.unselectAll.call(self);
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName;
			if(layoutName == "monitoring") self.controlPanel.setDataSource([]);
		},
		onAfterRefreshData : function(isRefresh, layoutName, viewName, dataViewWidget, newDataSource){
			var self = this;
			BaseController.fn.onAfterRefreshData.call(self, isRefresh, layoutName, viewName, dataViewWidget, newDataSource);
			var selectedData = dataViewWidget.getSelectedData();
			self.controlPanel.setDataSource(selectedData);
		},
		onWidgetChangeSelection : function(e){
			var self = this;
			BaseController.fn.onWidgetChangeSelection.call(self, e);
			var widget = e.sender;
			var selectedData = widget.getSelectedData();
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName;
			if(layoutName == "monitoring" && viewName !== "statistic") self.controlPanel.setDataSource(selectedData);
		},
		onChangeDataView : function(layoutName, viewName, widget){
			var self = this;
			BaseController.fn.onChangeDataView.call(self, layoutName, viewName, widget);
			var viewModel = self.viewModel;
			viewModel.set("hideMonitoringMapPanel", true);
			if(layoutName == "monitoring" && viewName !== "statistic"){
				viewModel.set("hideRightPanel", false);
				viewModel.set("hideControlPanel", false);
				viewModel.set("hideMapPanel", true);
				//실내기용 추가 범례 숨김/표시 처리
				if(viewName === "grid"){
					viewModel.set("hideIndoorLegend", false);
				}else{
					viewModel.set("hideIndoorLegend", true);
				}
			}else{
				viewModel.set("hideControlPanel", true);
			}
		},
		_changeControlPanelEvt : function(e){	//제어패널 동작 시, 발생하는 이벤트로 제어 API를 호출한다.
			var self = this, item = e.item, index = e.index, subIndex = e.subIndex, mode = e.mode;

			var deferreds = [];

			var controlSet = Constants.controlSet[index];
			if(typeof subIndex !== "undefined"){
				controlSet = controlSet[subIndex];
				index = (index * 10) + subIndex;
			}

			var timer = self.controlPanelTimer;
			if(timer[index]){
				clearTimeout(timer[index]);
				timer[index] = void 0;
			}

			var object = {}, send;
			// id가 constant에 포함되어있지 않다면, id가 들어가지 않는 배열형태가 아니다.
			if(controlSet["id"]){
				object["id"] = controlSet["id"];
				if(mode) object["id"] = controlSet[mode];
				object[controlSet["parameter"]] = item.value;
				send = [];
				send.push(object);
			}else{
				//chiller와 같은 경우는 1depth가 더있다. 따라서 underParameter가 있다면 현재 파라미터 안에 1depth를 더 생성하여준다.
				if(controlSet["underParameter"]){
					object[controlSet["parameter"]] = {};
					object[controlSet["parameter"]][controlSet["underParameter"]] = item.value;
				}else{
					object[controlSet["parameter"]] = item.value;
				}

				send = object;
			}

			clearInterval(self.refreshInterval);
			clearTimeout(self.refreshTimeout);
			var currentDataWidget = self.deviceTabPanel.currentWidget;
			var selectedData = currentDataWidget.getSelectedData();
			// [BIOTFE-802][FE][디바이스] 제어패널 제어시 제어내용을 곧 바로 Frontend에 반영 필요 -> PANEL_REFRESH_TIME 변경 (10초 -> 1초)
			timer[index] = setTimeout(function(){
				var i, id, put, length = selectedData.length;
				if(length === 1){
					id = selectedData[0].id;
					deferreds.push(Api.patchGroupAttr(id, controlSet["apiName"], send));
				}else{
					put = {};
					put["dms_devices_ids"] = [];
					put["control"] = {};
					put["control"][controlSet["apiName"]] = send;

					for(i = 0; i < length; i++){
						put["dms_devices_ids"].push(selectedData[i].id);
					}

					deferreds.push(Api.multiControl(put));
				}

				$.when.apply($, deferreds).always(function(){
					if (self.panelRefreshTimer){
						clearTimeout(self.panelRefreshTimer);
						self.panelRefreshTimer = null;
					}
					self.panelRefreshTimer = setTimeout(function () {
						self.loadingPanel.open();
						self.refreshDeviceData(true).always(function(){
							self.loadingPanel.close();
							self.refreshInterval = setInterval(self.intervalRefreshData.bind(self), Constants.ALL_TIME_INTERVAL);
						});
					}, Constants.PANEL_REFRESH_TIME);
				});
			}, Constants.TIME_OUT);
			// var currentDataWidget = self.deviceTabPanel.currentWidget;
			// var selectedData = currentDataWidget.getSelectedData();
			// var i, id, put, length = selectedData.length;
			// if(length === 1){
			// 	id = selectedData[0].id;
			// 	deferreds.push(Api.patchGroupAttr(id, controlSet["apiName"], send));
			// }else{
			// 	put = {};
			// 	put["dms_devices_ids"] = [];
			// 	put["control"] = {};
			// 	put["control"][controlSet["apiName"]] = send;
			//
			// 	for(i = 0; i < length; i++){
			// 		put["dms_devices_ids"].push(selectedData[i].id);
			// 	}
			//
			// 	deferreds.push(Api.multiControl(put));
			// }
			//
			// self.loadingPanel.open();
			// $.when.apply($, deferreds).always(function(){
			// 	self.refreshDeviceData(true).always(function(){
			// 		self.loadingPanel.close();
			// 		self.refreshInterval = setInterval(self.intervalRefreshData.bind(self), Constants.ALL_TIME_INTERVAL);
			// 	});
			// });
		},
		destroy : function () {
			var self = this;
			BaseController.fn.destroy.call(self);
			clearTimeout(self.panelRefreshTimer);
		}
	});
	/*
	*
	*	All View 탭
	*
	*/

	var AllViewController = SacIndoorController.extend({
		attachFilterEvt : function(){
			var self = this;
			BaseController.fn.attachFilterEvt.call(self);
			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0) {
					statusFilters.push(DeviceUtil.filter0Depth("status", "eq", "none"));
				}else if (length !== Constants.STATUS.length){
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						var value = status.split(".")[1];
						switch(value){
						case "On":
						case "Off": statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "Normal")); break;
						case "Critical": statusFilters.push(DeviceUtil.filter1Depth("alarms", "alarms_type", value)); break;
						case "Warning": statusFilters.push(DeviceUtil.filter1DepthNone("alarms", "alarms_type", value)); break;
						default: break;
						}
					}
				}
				self.applyCurrentFilter();
			});
		},
		onMonitoringLayout : function(){
			var self = this;
			BaseController.fn.onMonitoringLayout.call(self);
			MainWindow.disableBuidingTotal(true);
			MainWindow.disableFloorAllBtn(true);

			self.setViewBtnEnabled("list", false);
			self.setViewBtnEnabled("statistic", false);
			self.setViewBtnEnabled("grid", false);
			return "map";
		},
		selectAll : function(){
			var self = this;
			var selectedData = BaseController.fn.selectAll.call(self);
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName;
			if(layoutName == "monitoring") self.controlPanel.setDataSource(self._getIndoorDevices(selectedData));
		},
		onAfterRefreshData : function(isRefresh, layoutName, viewName, dataViewWidget, newDataSource){
			var self = this;
			BaseController.fn.onAfterRefreshData.call(self, isRefresh, layoutName, viewName, dataViewWidget, newDataSource);
			var selectedData = dataViewWidget.getSelectedData();
			self.controlPanel.setDataSource(self._getIndoorDevices(selectedData));
		},
		onWidgetChangeSelection : function (e) {
			var self = this;
			BaseController.fn.onWidgetChangeSelection.call(self, e);
			var widget = e.sender;
			var selectedData = widget.getSelectedData();
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName;
			if(layoutName == "monitoring" && viewName !== "statistic") self.controlPanel.setDataSource(self._getIndoorDevices(selectedData));
		},
		onChangeDataLayout : function(e){
			var self = this;
			var currentFloor = MainWindow.getCurrentFloor(), floor = currentFloor.floor, building = currentFloor.building,
				floorId = floor.id, buildingId = building.id, floorList = MainWindow.getCurrentFloorList(),
				isTotalBuilding = buildingId == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID, isAllFloor = floorId == MainWindow.FLOOR_NAV_FLOOR_ALL_ID;

			var currentViewInfo = self.getCurrentViewInfo(), currentLayoutName = currentViewInfo.innerLayoutName,
				currentViewWidget = currentViewInfo.dataViewWidget;
			var newViewName = e.viewName;

			//모든 Widget 데이터 초기화
			self.deviceTabPanel.setViewWidgetDatasource([]);
			self.deviceTabPanel.setStatisticDatasource([]);
			self.deviceTabPanel.setZoneDatasource([], { imageUrl : null });

			var hasFloor = floorList.length > 0;


			if(isTotalBuilding){
				MainWindow.clickTopBuilding(false);
				return;
			}else if(hasFloor && isAllFloor){
				MainWindow.clickTopFloor();//전체 층에서 Map View를 선택했을 경우, 첫번째 층으로 이동
				return;
			}else if(!hasFloor){
				msgDialog.message(I18N.prop("FACILITY_DEVICE_NO_FLOOR_MONITORING_MSG"));
				msgDialog.open();
				return;
			}

			//View를 업데이트한다.
			self.onChangeDataView(currentLayoutName, newViewName, currentViewWidget);

			//Device Data를 가져와 Widget에 Set한다.
			self.loadingPanel.open();
			self.refreshDeviceData(false, currentLayoutName, newViewName, currentViewWidget).always(function(){
				if(newViewName == "map"){
					//모니터링 맵뷰 리스트가 존재할 경우에는 등록 뷰 일 때만 리프레시한다. (자산)
					if(self.monitoringMapList){
						//우측 맵 리스트를 Refresh 하도록 selectTab을 호출
						if(currentLayoutName == "registration"){
							self.registrationMapList.selectTab(Constants.REGISTRATION_STATUS_BUTTONS.REGISTER, true);
						}else if(currentLayoutName == "monitoring"){
							self.monitoringMapList.selectTab(Constants.REGISTRATION_STATUS_BUTTONS.REGISTER, true);
						}
					}else if(self.registrationMapList){	//모니터링 맵뷰 리스트가 존재하지 않을 경우에는 무조건 리프레시한다. (에너지미터, 게이트웨이, 비콘 센서 등)
						self.registrationMapList.selectTab(Constants.REGISTRATION_STATUS_BUTTONS.REGISTER, true);
					}
				}
				self.loadingPanel.close();
			});
		},
		_getIndoorDevices : function(selectedData) {
			var query = new kendo.data.Query(selectedData).filter({field: "type", operator: "contains", value: "AirConditioner."});
			return query.toArray();
		}
	});

	/*
	*
	*	실외기(SAC Outdoor) 기기 탭
	*
	*/
	var SacOutdoorController = BaseController.extend({
		onMonitoringLayout : function(){
			var self = this;
			BaseController.fn.onMonitoringLayout.call(self);
			self.setViewBtnEnabled("map", false);
			self.setViewBtnEnabled("statistic", false);
			self.setViewBtnEnabled("grid", false);
			//실외기는 모니터링이 리스트만 존재
			return "list";
		},
		onRegistrationLayout : function(){
			var self = this;
			var view = BaseController.fn.onRegistrationLayout.call(self);
			self.setViewBtnEnabled("map", true);
			return view;
		},
		onChangeDataView : function(layoutName, viewName, widget){
			var self = this;
			BaseController.fn.onChangeDataView.call(self, layoutName, viewName, widget);
			if(layoutName == "monitoring") self.setViewBtnEnabled("map", false);
		}
	});

	/*
	*
	*	꽌제점(ControlPoint) 기기 탭
	*
	*/

	var ControlPointController = BaseController.extend({
		onMonitoringLayout : function(){
			var self = this;
			BaseController.fn.onMonitoringLayout.call(self);
			self.setViewBtnEnabled("map", false);
			self.setViewBtnEnabled("statistic", false);
			self.setViewBtnEnabled("grid", false);
			//관제점은 모니터링이 리스트만 존재
			return "list";
		},
		onRegistrationLayout : function(){
			var self = this;
			var view = BaseController.fn.onRegistrationLayout.call(self);
			self.setViewBtnEnabled("map", true);
			return view;
		},
		onChangeDataView : function(layoutName, viewName, widget){
			var self = this;
			BaseController.fn.onChangeDataView.call(self, layoutName, viewName, widget);
			if(layoutName == "monitoring") self.setViewBtnEnabled("map", false);
		},
		attachEvent : function(){
			var self = this;
			BaseController.fn.attachEvent.call(self);
			var monitoringLayout = self.innerLayouts[Constants.INNER_LAYOUT.MONITORING];
			var listView = monitoringLayout.dataViews.list;
			var listGrid = listView.widget;
			//Control Point 값 Send 클릭 이벤트
			listGrid.element.on("click", ".device-point-sendbtn", function(){
				var tr = $(this).closest("tr");
				var id = tr.data("id");
				var ds = listGrid.dataSource;
				var item = ds.get(id);
				var fieldWrapper = $(this).siblings(".device-point-numeric");
				var input = fieldWrapper.find("input");
				var numVal, value = input.val();
				if(value){
					input.data("beforeValue", value);
					numVal = Number(value);
					if(isNaN(numVal)) numVal = value;
					self.loadingPanel.open();
					Api.patchControlPointValue(item.id, numVal).always(function(){
						item.controlPoint.value = value;
						self.loadingPanel.close();
					});
				}
			});
		},
		attachFilterEvt : function(){
			var self = this;
			BaseController.fn.attachFilterEvt.call(self);
			var typeFilter = self.getFilterViewModel(Constants.FILTER_NAME.TYPE);
			typeFilter.options.set("select", function(e){
				var typeFilters = self.typeFilter = [];
				var value = e.dataItem.value;
				if(value !== ""){
					typeFilters.push(DeviceUtil.filter0Depth("type", "eq", Constants.POINT_TYPE[value]));
				}
				self.applyCurrentFilter();
			});

			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0) {
					statusFilters.push(DeviceUtil.filter0Depth("status", "eq", "none"));
				}else if (length !== Constants.STATUS.length){
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						var value = status.split(".")[1];
						switch(value){
						case "On":
						case "Off": statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "Normal")); break;
						case "Critical": statusFilters.push(DeviceUtil.filter1Depth("alarms", "alarms_type", value)); break;
						case "Warning": statusFilters.push(DeviceUtil.filter1DepthNone("alarms", "alarms_type", value)); break;
						default: break;
						}
					}
				}
				self.applyCurrentFilter();
			});
		}
	});

	var EnergyMeterController = BaseController.extend({
		onMonitoringLayout : function(){
			var self = this;
			BaseController.fn.onMonitoringLayout.call(self);
			//등록/미등록 탭을 숨긴다.
			self.registrationMapList.hideTab(true);
		},
		onRegistrationLayout : function(){
			var self = this;
			var view = BaseController.fn.onRegistrationLayout.call(self);
			//등록/미등록 탭을 표시한다.
			self.registrationMapList.hideTab(false);
			return view;
		},
		onChangeDataView : function(layoutName, viewName, widget){
			var self = this, viewModel = self.viewModel;
			BaseController.fn.onChangeDataView.call(self, layoutName, viewName, widget);

			//RegistrationMapList의 등록 탭을 Monitoring에서도 재사용한다.
			if(layoutName == "monitoring"){
				viewModel.set("hideMonitoringMapPanel", true);
				viewModel.set("hideRegistrationMapPanel", false);
			}
		},
		attachFilterEvt : function(){
			var self = this;
			BaseController.fn.attachFilterEvt.call(self);
			var typeFilter = self.getFilterViewModel(Constants.FILTER_NAME.TYPE);
			typeFilter.options.set("select", function(e){
				var typeFilters = self.typeFilter = [];
				var value = e.dataItem.value;
				if(value !== ""){
					var filter = { logic : "or", filters : []};
					filter.filters.push(DeviceUtil.filter0Depth("type", "eq", Constants.ENERGY_TYPE[value]));
					filter.filters.push(DeviceUtil.filter0Depth("mappedType", "eq", Constants.ENERGY_TYPE[value]));
					typeFilters.push(filter);
				}
				self.applyCurrentFilter();
			});

			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0) {
					statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "none"));
				}else if(length !== Constants.STATUS.length) {
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						var value = status.split(".")[1];
						switch(value){
						case "On": statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "Normal")); break;
						case "Off": statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "Normal.Off")); break;
						case "Critical": statusFilters.push(DeviceUtil.filter1Depth("alarms", "alarms_type", value)); break;
						case "Warning": statusFilters.push(DeviceUtil.filter1DepthNone("alarms", "alarms_type", value)); break;
						default: break;
						}
					}
				}
				self.applyCurrentFilter();
			});
		},
		onWidgetChangeRegistrationMapList : function(viewName, layoutName, selectedData){
			var self = this;
			var registrationMapList = self.registrationMapList;
			registrationMapList.unselectAll();
			if(viewName === "map"){
				registrationMapList.selectByData(selectedData);
			}
		},
		openDetailPopup : function(selectedData, dialogType, isEditable){
			var self = this;
			self.detailPopup.hasConnectedDevices = {};
			BaseController.fn.openDetailPopup.call(self, selectedData, dialogType, isEditable);
		},
		patchInDetailPopupEvt : function(e, isEditDeviceInfo){
			var self = this, popup = e.sender, hasConnectedDevices = popup.hasConnectedDevices || {}, results = e.results || [e.result];
			var index, id, data, meters;
			for(index = 0; index < results.length; index++){
				data = results[index];
				if(!data.mappedType) delete data.mappedType;
				id = data.id;
				meters = data.meters && data.meters[0] || {};
				if((hasConnectedDevices[id] && !DeviceUtil.isEnableEnergyMappingType(data)) || (meters.connectedDevices && meters.connectedDevices.length == 0)) meters.connectedDevices = [];
			}
			popup.hasConnectedDevices = {};
			BaseController.fn.patchInDetailPopupEvt.call(self, e, isEditDeviceInfo);
		}
	});

	var SensorMotionController = BaseController.extend({
		onMonitoringLayout : function(){
			var self = this;
			BaseController.fn.onMonitoringLayout.call(self);
			//등록/미등록 탭을 숨긴다.
			self.registrationMapList.hideTab(true);
		},
		onRegistrationLayout : function(){
			var self = this;
			var view = BaseController.fn.onRegistrationLayout.call(self);
			//등록/미등록 탭을 표시한다.
			self.registrationMapList.hideTab(false);
			return view;
		},
		onChangeDataView : function(layoutName, viewName, widget){
			var self = this, viewModel = self.viewModel;
			BaseController.fn.onChangeDataView.call(self, layoutName, viewName, widget);

			//RegistrationMapList의 등록 탭을 Monitoring에서도 재사용한다.
			if(layoutName == "monitoring"){
				viewModel.set("hideMonitoringMapPanel", true);
				viewModel.set("hideRegistrationMapPanel", false);
			}
		},
		attachFilterEvt : function(){
			var self = this;
			BaseController.fn.attachFilterEvt.call(self);
			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0) {
					statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "none"));
				}else if(length !== Constants.STATUS.length) {
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						var value = status.split(".")[1];
						switch(value){
						case "On":
						case "Off": statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "Normal")); break;
						case "Critical": statusFilters.push(DeviceUtil.filter1Depth("alarms", "alarms_type", value)); break;
						case "Warning": statusFilters.push(DeviceUtil.filter1DepthNone("alarms", "alarms_type", value)); break;
						default: break;
						}
					}
				}
				self.applyCurrentFilter();
			});
		},
		onWidgetChangeRegistrationMapList : function(viewName, layoutName, selectedData){
			var self = this;
			var registrationMapList = self.registrationMapList;
			registrationMapList.unselectAll();
			if(viewName === "map"){
				registrationMapList.selectByData(selectedData);
			}
		}
	});

	var LightController = SensorMotionController.extend({
		init: function(e){
			var self = this;
			SacIndoorController.fn.init.call(self, e);
		},
		initComponent: function(){
			var self = this;
			SensorMotionController.fn.initComponent.call(self);
			self._lightControlPanelInit();
		},
		onChangeDataView : function(layoutName, viewName, widget){
			var self = this;
			SensorMotionController.fn.onChangeDataView.call(self, layoutName, viewName, widget);
			var viewModel = self.viewModel;
			viewModel.set("hideMonitoringMapPanel", true);
			if(layoutName == "monitoring" && viewName !== "statistic"){
				viewModel.set("hideRightPanel", false);
				viewModel.set("hideLightControlPanel", false);
				viewModel.set("hideMapPanel", true);
				self._lightControlPanelInit();
			}else{
				viewModel.set("hideLightControlPanel", true);
			}
		},
		selectAll : function(){
			var self = this;
			SensorMotionController.fn.selectAll.call(self);
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName;
			if(layoutName == "monitoring") self._lightControlPanelSetData();
		},
		unselectAll : function(){
			var self = this;
			SensorMotionController.fn.unselectAll.call(self);
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName;
			if(layoutName == "monitoring") self._lightControlPanelSetData();
		},
		onAfterRefreshData : function(isRefresh, layoutName, viewName, dataViewWidget, newDataSource){
			var self = this;
			SensorMotionController.fn.onAfterRefreshData.call(self, isRefresh, layoutName, viewName, dataViewWidget, newDataSource);
			self._lightControlPanelSetData();
		},
		onWidgetChangeSelection : function(e){
			var self = this;
			SensorMotionController.fn.onWidgetChangeSelection.call(self, e);
			self._lightControlPanelSetData();
		},
		pageChangeEvt : function(e){
			var self = this;
			SensorMotionController.fn.pageChangeEvt.call(self, e);
			self._lightControlPanelSetData();
		},
		attachFilterEvt : function(){
			var self = this;
			SensorMotionController.fn.attachFilterEvt.call(self);
			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0) {
					statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "none"));
				}else if(length !== Constants.STATUS.length) {
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						var value = status.split(".")[1];
						switch(value){
						case "On":
						case "Off": statusFilters.push(DeviceUtil.filterStatusNoAlarm("operations", "power", value, "alarms")); break;
						case "Critical": statusFilters.push(DeviceUtil.filter1Depth("alarms", "alarms_type", value)); break;
						case "Warning": statusFilters.push(DeviceUtil.filter1DepthNone("alarms", "alarms_type", value)); break;
						default: break;
						}
					}
				}
				self.applyCurrentFilter();
			});
		},
		_lightControlPanelInit: function() {
			var self = this;
			var light = self.viewModel.lightPanel;

			light.power.set('click', self._changeLightPowerEvt.bind(self));
			light.power.set('invisible', true);
			light.dimmingLevel.set('invisible', true);
			light.dimmingLevel.set('slide', self._changeLightValueEvt.bind(self));
		},
		_lightControlPanelSetData: function() {
			var self = this;
			var widget = self.getCurrentViewInfo().dataViewWidget;
			var light = self.viewModel.lightPanel;
			var selectedData = widget.getSelectedData();
			var lights = new kendo.data.Query(selectedData).filter({
				logic : 'or',
				filters : [{ field : "type", operator : "eq", value : "Light"},
						   { field : "mappedType", operator : "eq", value : "Light"}]
			}).toArray();
			//Light Dimming Level
			//Light On/Off
			var device, dimmingLevel = 0, dimmingCount = 0, level, lightPower, power;
			var i, max = lights.length;
			var type;
			if(max > 0){
				var hasPower = false;
				var hasDimmingLevel = false;
				var hasLightOn = false;
				var hasLightOff = false;
				for( i = 0; i < max; i++ ){
					device = lights[i];
					type = device.type;
					if(type){
						if(type.indexOf("AO") != -1){
							hasDimmingLevel = true;
						}else if(type.indexOf("DO") != -1){
							hasPower = true;
						}else if(type == "Light"){//type이 Light인 경우
							hasDimmingLevel = true;
							hasPower = true;
						}
					}
					//AI, DI는 제어 불가
					if(type.indexOf("AI") == -1 && type.indexOf("DI") == -1){
						level = DeviceUtil.getDimmingLevel(device);
						if(level != "-" ){
							level = level.replace("%", "");
							level = Number(level);
							dimmingLevel += level;
							dimmingCount++;
						}
						power = window.Util.getNormalStatus(device);
						if(power == "Normal.On"){
							hasLightOn = true;
						}else{
							hasLightOff = true;
						}
						power = power == "Normal.On" ? true : false;
						if(typeof lightPower === "undefined"){
							lightPower = power;
						}
						lightPower = power || lightPower;
					}
				}
				if(dimmingCount != 0){
					dimmingLevel = Math.round(dimmingLevel / dimmingCount);
				}
				light.dimmingLevel.set("value", dimmingLevel);
				light.dimmingLevel.set("invisible", !hasDimmingLevel);
				light.power.set("invisible", !hasPower);

				light.set('noSelected', true);
				if(hasLightOn && hasLightOff){
					light.power.set("mixed", true);
					light.power.set("active", true);
				}else{
					light.power.set("active", lightPower);
					light.power.set("mixed", false);
				}
			}else{
				light.set('noSelected', false);
				light.dimmingLevel.set("invisible", true);
				light.power.set("invisible", true);
			}
		},
		_changeLightPowerEvt: function(e) {
			var self = this, power = self.viewModel.lightPanel.get('power'), active = power.get('active'), mixed = power.get('mixed');
			if (mixed || !active) {
				active = true;
			} else {
				active = false;
			}
			self._changeLightControlPanelEvt({index: Constants.LIGHT_CONTROL.POWER, data: active});
		},
		_changeLightValueEvt: function(e) {
			this._changeLightControlPanelEvt({index: Constants.LIGHT_CONTROL.DIMMING, data: e.value});
		},
		_changeLightControlPanelEvt: function(e) {
			var self = this;
			var index = e.index, data = e.data;
			var timer = self.controlPanelTimer;
			if (timer[index]) {
				clearTimeout(timer[index]);
				timer[index] = void 0;
			}

			var power = power = self.viewModel.lightPanel.get('power'), dimmingLevel = self.viewModel.lightPanel.get('dimmingLevel');
			var widget = self.getCurrentViewInfo().dataViewWidget;
			var selectedData = widget.getSelectedData(), i, length = selectedData.length, device, type;
			var patchData = [];
			if (index == Constants.LIGHT_CONTROL.POWER) {
				power.set('mixed', false);
				power.set('active', data);
				for (i = 0; i < length; i++) {
					device = selectedData[i];
					type = device.type;
					if (device.operations && device.operations[0]) {
						if (type.indexOf("ControlPoint.DO") != -1 && typeof device.controlPoint != 'undefined') {
							device.controlPoint.value = data ? 1 : 0;
						} else {
							device.operations[0].power = data;
						}
					}
				}
			} else if (index == Constants.LIGHT_CONTROL.DIMMING) {
				dimmingLevel.set('value', data);
				for (i = 0; i < length; i++) {
					device = selectedData[i];
					type = device.type;
					if (device.lights && device.lights[0]) {
						device.lights[0].dimmingLevel = data;
					}
				}
			}
			clearInterval(self.refreshInterval);
			clearTimeout(self.refreshTimeout);
			timer[index] = setTimeout(function () {
				for (i = 0; i < length; i++) {
					device = selectedData[i];
					type = device.type;
					if (index == Constants.LIGHT_CONTROL.POWER) {
						if (type.indexOf("ControlPoint.DO") != -1) {
							patchData.push({id: device.id, controlPoint: {value: data ? 1 : 0}});
						} else {
							patchData.push({id: device.id, operations: [{id: 'General', power: data ? 'On' : 'Off'}]});
						}
					} else if (index == Constants.LIGHT_CONTROL.DIMMING) {
						patchData.push({id: device.id, lights: [{id: 1, dimmingLevel: data}]});
					}
				}

				Api.patchDevices(patchData).always(function(){
					if (self.panelRefreshTimer){
						clearTimeout(self.panelRefreshTimer);
						self.panelRefreshTimer = null;
					}
					self.panelRefreshTimer = setTimeout(function () {
						self.loadingPanel.open();
						self.refreshDeviceData(true).always(function(){
							self.loadingPanel.close();
							self.refreshInterval = setInterval(self.intervalRefreshData.bind(self), Constants.ALL_TIME_INTERVAL);
						});
					}, Constants.PANEL_REFRESH_TIME);

				});
			}, Constants.TIME_OUT);
		},
		destroy: function () {
			var self = this;
			SacIndoorController.fn.destroy.call(self);
		}
	});

	var SensorTemperatureHumidityController = SensorMotionController.extend({
		attachFilterEvt : function(){
			var self = this;
			SensorMotionController.fn.attachFilterEvt.call(self);
			var typeFilter = self.getFilterViewModel(Constants.FILTER_NAME.TYPE);
			typeFilter.options.set("select", function(e){
				var typeFilters = self.typeFilter = [];
				var value = e.dataItem.value;
				if(value !== ""){
					var filter = { logic : "or", filters : []};
					filter.filters.push(DeviceUtil.filter0Depth("type", "eq", Constants.SENSOR_TEMP_HUM_TYPE[value]));
					filter.filters.push(DeviceUtil.filter0Depth("mappedType", "eq", Constants.SENSOR_TEMP_HUM_TYPE[value]));
					typeFilters.push(filter);
				}
				self.applyCurrentFilter();
			});
		}
	});

	var GatewayController = SensorMotionController.extend({
		onMonitoringLayout : function(){
			var self = this;
			SensorMotionController.fn.onMonitoringLayout.call(self);
			//삭제 버튼 미표시
			var deleteBtn = self.getActionViewModel("delete");
			deleteBtn.options.set("invisible", true);
		},
		onRegistrationLayout : function(){
			var self = this;
			var view = SensorMotionController.fn.onRegistrationLayout.call(self);

			//삭제 버튼 표시
			var deleteBtn = self.getActionViewModel("delete");
			deleteBtn.options.set("invisible", false);
			return view;
		},
		attachFilterEvt : function(){
			var self = this;
			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0) {
					statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "none"));
				}else if(length !== Constants.STATUS.length) {
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						var value = status.split(".")[1];
						switch(value){
						case "On": statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "Normal")); break;
						case "Critical": statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "Alarm.Critical")); break;
						case "Warning": statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "Alarm.Warning")); break;
						default: break;
						}
					}
				}
				self.applyCurrentFilter();
			});
		}
	});

	var BeaconController = GatewayController.extend({
		attachFilterEvt : function(){
			var self = this;
			BaseController.fn.attachFilterEvt.call(self);
			var typeFilter = self.getFilterViewModel(Constants.FILTER_NAME.TYPE);
			typeFilter.options.set("select", function(e){
				var typeFilters = self.typeFilter = [];
				var value = e.dataItem.value;
				if(value !== ""){
					typeFilters.push(DeviceUtil.filter1DepthObj("configuration", "mobilityType", Constants.BEACON_LOCATION_TYPE[value]));
				}
				self.applyCurrentFilter();
			});
			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0){
					statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "none"));
				}else if(length !== Constants.BEACON_STATUS.length) {
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						if(status == "Normal.On") status = "Normal";
						statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", status));
					}
				}
				self.applyCurrentFilter();
			});
		}
	});

	var CCTVController = GatewayController.extend({
		attachEvent : function(){
			var self = this;
			GatewayController.fn.attachEvent.call(self);

			//View 버튼 이벤트 바인딩
			var viewBtn = self.getActionViewModel("view");
			viewBtn.options.set("click", self.clickViewBtnEvt.bind(self));
		},
		clickViewBtnEvt : function(e){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName, widget = currentViewInfo.dataViewWidget;
			var selectedData = [];
			if(layoutName == "registration" && viewName == "map" && self.registrationMapList &&
				self.registrationMapList.selectedIndex == Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER){
				selectedData = self.registrationMapList.getSelectedData();

				//미등록 기기 탭을 활성화 하고 맵에서 기기를 선택했을 경우이다.
				if(selectedData.length == 0) selectedData = widget.getSelectedData();
			}else{
				selectedData = widget.getSelectedData();
			}

			//현재 선택된 기기 IP 주소 정보를 읽어 새창 표시
			var i, ipAddress, data, max = selectedData.length;
			var gap, width = 640, height = 480;
			if(length < 31){
				for( i = 0; i < max; i++ ){
					data = selectedData[i];
					ipAddress = DeviceUtil.getIpAddress(data);
					if(ipAddress !== "-"){
						if(max == 1){	//1개의 경우
							ipAddress = "http://" + ipAddress;
							window.open(ipAddress, "", "width=" + width + ",height=" + height + ",location=0");
						}else{	//다수개의 경우
							gap = i * 100;
							window.open(ipAddress, "_blank", "width=" + width + ",height=" + height + ", left=" + gap + ", top=" + gap);
						}
					}
				}
			}else{
				var msg = "You cannot open over 30 windows for the same time.";
				msgDialog.message(msg);
				msgDialog.open();
			}
		},
		onMonitoringLayout : function(){
			var self = this;
			GatewayController.fn.onMonitoringLayout.call(self);
		},
		onRegistrationLayout : function(){
			var self = this;
			var view = GatewayController.fn.onRegistrationLayout.call(self);
			return view;
		}
	});

	var SmartPlugController = SensorMotionController.extend({
		attachFilterEvt : function(){
			var self = this;
			SensorMotionController.fn.attachFilterEvt.call(self);
			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("selectionChanged", function(e){
				var statusFilters = self.statusFilter = [];
				var values = e.newValue;
				var length = values.length;
				if(length === 0) {
					statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", "none"));
				}else if(length !== Constants.STATUS.length) {
					for(var i = 0; i < length; i++){
						var status = Constants.STATUS[values[i] - 1];
						var value = status.split(".")[1];
						switch(value){
						case "On":
						case "Off": statusFilters.push(DeviceUtil.filterStatusNoAlarm("operations", "power", value, "alarms")); break;
						case "Critical": statusFilters.push(DeviceUtil.filter1Depth("alarms", "alarms_type", value)); break;
						case "Warning": statusFilters.push(DeviceUtil.filter1DepthNone("alarms", "alarms_type", value)); break;
						default: break;
						}
					}
				}
				self.applyCurrentFilter();
			});
		}
	});

	var deviceController = {
		"All" : AllViewController,
		"AirConditioner.Indoor" : SacIndoorController,
		"AirConditionerOutdoor" : SacOutdoorController,
		"ControlPoint" : ControlPointController,
		"Meter" : EnergyMeterController,
		"Light" : LightController,
		"Sensor.Motion" : SensorMotionController,
		"Sensor.Temperature_Humidity" : SensorTemperatureHumidityController,
		"Gateway" : GatewayController,
		"Beacon" : BeaconController,
		"SmartPlug" : SmartPlugController,
		"CCTV" : CCTVController
	};

	var getDeviceController = function(deviceType){
		var DeviceController = deviceController[deviceType];

		if(!DeviceController){
			console.error("There is no controller for type : " + deviceType);
		}

		return DeviceController;
	};

	return {
		getDeviceController : getDeviceController
	};
});
//# sourceURL=device/common/controller/device-controller.js
