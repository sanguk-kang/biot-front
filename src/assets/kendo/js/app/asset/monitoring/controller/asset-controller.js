define("asset/monitoring/controller/asset-controller", ["asset/core",
	"device/common/controller/base-controller", "device/common/device-api", "device/common/device-util",
	"device/common/device-constants", "device/common/device-template",
	"asset/monitoring/asset-api", "asset/monitoring/model/asset-model", "asset/monitoring/model/asset-type-model", "asset/monitoring/config/popup-config"],
function(ModuleUtil, BaseController, DeviceApi, DeviceUtil, Constants, Template, AssetApi, AssetModel, AssetTypeModel, AssetPopupConfig){

	var kendo = window.kendo, MainWindow = window.MAIN_WINDOW, I18N = window.I18N, Util = window.Util;
	var DEFAULT_PAGE_SIZE = 50;
	var msgDialog = AssetPopupConfig.messageDialog;
	var confirmDialog = AssetPopupConfig.confirmDialog;
	var assetTypePopup = AssetPopupConfig.assetTypePopup;

	var AssetController = BaseController.extend({
		initComponent : function(){	//컴포넌트 초기화
			var registerationLayout = this.getLayoutViewModel("registration");
			if(registerationLayout) this.registrationMapView = registerationLayout.dataViews.map;

			//상세 팝업
			var tabkey = this.deviceTypeKey;
			this.detailPopup = AssetPopupConfig.getDetailPopup(tabkey);

			//맵 뷰 우측 리스트
			var options = this.getRegisterMapListOptions();
			this.registrationMapList = this.registrationMapListElement.kendoDeviceTabGroupGrid(options).data("kendoDeviceTabGroupGrid");

			//맵 뷰 우측 리스트 2 (서비스 - 자산, 비콘 별개로 동작하므로 2개의 리스트가 존재한다.)
			options = this.getMonitoringMapListOptions();
			if(options) this.monitoringMapList = this.monitoringMapListElement.kendoDeviceTabGroupGrid(options).data("kendoDeviceTabGroupGrid");

		},
		onRefreshData : function(){
			var self = this, currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName,
				currentViewWidget = currentViewInfo.dataViewWidget, viewName = currentViewInfo.dataViewName;
			//Refresh가 완료되지 않았거나 상세 팝업 편집 시에는 리프레시를 하지 않는다.
			if(self.isRefreshing || (self.detailPopup && self.detailPopup.isEditable)) return;

			//자산은 등록 맵 뷰에서도 리프레시한다.
			self.loadingPanel.open(currentViewWidget.element);
			if(layoutName == "monitoring" || (layoutName == "registration" && viewName == "map")){
				self.refreshDeviceData(true).always(function(){
					self.loadingPanel.close();
				});
			}
		},
		attachEvent : function(){
			var self = this;
			BaseController.fn.attachEvent.call(self);

			//Monitoring Map View 우측 리스트에서 그룹을 펼치는 이벤트
			self.monitoringMapList.bind("expand", self.expandRegistrationMapListTab.bind(self));
			//Monitoring Map View 우측 리스트에서 기기 선택 시 이벤트
			self.monitoringMapList.bind("change", self.onRegistrationMapListChangeSelection.bind(self));

			//등록 맵 뷰 리스트로부터 드래그 앤 드롭으로 기기 등록이 되지 않도록 이벤트 바인딩을 해제한다.
			self.registrationMapListElement.off("click");

			//자산 유형 버튼
			var assetTypeBtn = self.getActionViewModel(Constants.ACTION_NAME.ASSET_TYPE);
			assetTypeBtn.options.set("click", self.clickAssetTypeBtnEvt.bind(self));

			//자산 유형 팝업 삭제 버튼 이벤트
			assetTypePopup.bind("onDelete", self.deleteAssetTypePopupEvt.bind(self));

			//상세 팝업 삭제 이벤트
			self.detailPopup.bind("onDelete", self.deleteDetailPopupEvt.bind(self));
		},
		clickRegisterBtnEvt : function(e){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var registrationStatus = currentViewInfo.registrationStatus,
				dataViewName = currentViewInfo.dataViewName, dataViewWidget = currentViewInfo.dataViewWidget;
			var selectedData = [], dialogType;

			if(dataViewName == "map" && registrationStatus == "NotRegistered"){		//미등록 기기 탭 선택 상태
				selectedData = self.registrationMapList.getSelectedData();
			}else{
				selectedData = dataViewWidget.getSelectedData();
			}
			dialogType = "register";
			self.openDetailPopup(selectedData, dialogType, true);
		},
		clickDeleteBtnEvt : function(e){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var registrationStatus = currentViewInfo.registrationStatus,
				dataViewName = currentViewInfo.dataViewName, dataViewWidget = currentViewInfo.dataViewWidget,
				layoutName = currentViewInfo.innerLayoutName, results = e.results, detailPopup = e.sender;
			var selectedData = [];

			//상세 팝업에서 삭제를 호출 할 때 results가 없을 경우는 각 Data View에서 선택한 경우
			if(results){
				selectedData = results;
			}else if(dataViewName == "map" && registrationStatus == "NotRegistered"){		//미등록 탭 선택 상태
				if(self.registrationMapList) selectedData = self.registrationMapList.getSelectedData();
			}else{
				selectedData = dataViewWidget.getSelectedData();
			}

			var confirmMsg = I18N.prop("FACILITY_DEVICE_DELETE_CONFIRM"), resultMsg = I18N.prop("SERVICE_ASSET_DELETE_DEVICE_RESULT");
			if(layoutName == "monitoring"){
				confirmMsg = I18N.prop("SERVICE_ASSET_DELETE_CONFIRM");
				resultMsg = I18N.prop("SERVICE_ASSET_DELETE_RESULT");
			}
			//삭제
			confirmDialog.message(confirmMsg);
			confirmDialog.setConfirmActions({
				yes : function(){
					self.loadingPanel.open();
					var asset, device, assetIds = [], deviceIds = [], i, max = selectedData.length;
					for( i = 0; i < max; i++ ){
						asset = selectedData[i];
						assetIds.push(asset.id);
						device = asset.devices;
						if(device && device[0]){
							device = device[0];
							deviceIds.push(device.dms_deivces_id);
						}
					}
					var apiFunc, ids;
					if(layoutName == "monitoring"){
						apiFunc = AssetApi.deleteAssets;
						ids = assetIds;
					}else if(layoutName == "registration"){
						apiFunc = DeviceApi.deleteDevices;
						ids = deviceIds;
					}

					apiFunc(ids).always(function(){
						if(detailPopup && detailPopup.close) detailPopup.close();
						//기기 정보를 Refresh한다.
						self.refreshDeviceData(false).always(function(){
							self.loadingPanel.close();
							msgDialog.message(resultMsg);
							msgDialog.open();
						});
					});
				}
			});
			confirmDialog.open();
		},
		clickAssetTypeBtnEvt : function(e){
			var self = this;
			AssetApi.getAssetTypes().done(function(data){
				data = AssetTypeModel.createAssetTypePopupModel(data);
				assetTypePopup.setDataSource(data);
				assetTypePopup.open();
				assetTypePopup.grid.bind("change", self.changeAssetTypeListEvt.bind(self));
			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			});
		},
		changeAssetTypeListEvt : function(e){
			var item = e.item;
			//Row를 선택할 경우 Sub Asset 체크박스 전부를 체크한다.
			//Row를 해제할 경우 전부 체크 해제한다.
			if(item){
				//실제 DataSource
				// console.log(e.sender.contentViewModel);
				var subAsset, subAssetTypes = item.subAssetTypes;
				//바인딩 된 Display되는 데이터 뷰 모델
				var vmSubAssetTypes = assetTypePopup.contentViewModel.subAssetTypes;
				var i, max = subAssetTypes.length;

				for(i = 0; i < max; i++ ){
					subAsset = subAssetTypes[i];
					subAsset.set("checked", item.selected);
					//모든 아이템이 접혀 있을 경우에는 존재하지 않을 수 있으므로, 존재유무를 체크한다.
					if(vmSubAssetTypes){
						subAsset = vmSubAssetTypes[i];
						subAsset.set("checked", item.selected);
					}
				}
			}
		},
		deleteAssetTypePopupEvt : function(e){
			var self = this, results = e.results;
			if(results.length < 1){
				msgDialog.message(I18N.prop("SERVICE_ASSET_TYPE_DELETE_NO_SELECT"));
				msgDialog.open();
				return;
			}
			confirmDialog.message(I18N.prop("SERVICE_ASSET_TYPE_DELETE_CONFIRM"));
			confirmDialog.setConfirmActions({
				yes : function(){
					self.loadingPanel.open(assetTypePopup.element);
					AssetApi.patchAssetTypes(results).done(function(){
						var msg = I18N.prop("SERVICE_ASSET_TYPE_DELETE_RESULT");
						msgDialog.message(msg);
						msgDialog.open();
					}).fail(function(xhq){
						var msg = Util.parseFailResponse(xhq);
						msgDialog.message(msg);
						msgDialog.open();
					}).always(function(){
						//Dialog에서 삭제
						var data = AssetTypeModel.createAssetTypePopupModel(results);
						assetTypePopup.setDataSource(data);
						self.loadingPanel.close();
						//List 및 다른 DataSource에서 삭제
					});
				}
			});
			confirmDialog.open();
		},
		deleteDetailPopupEvt : function(e){
			var self = this, results = e.results ? e.results : [e.result];
			e.results = results;
			self.clickDeleteBtnEvt(e);
		},
		patchInDetailPopupEvt : function(e){
			var self = this;
			var isHideMessagePopup = e.hideMessagePopup;
			var detailPopup = e.sender, results = e.results ? e.results : [e.result];
			if(!results) return;
			var dialogType = detailPopup.dialogType;
			//console.log(results);
			self.loadingPanel.open(detailPopup.element);

			var apiFunc;
			if(dialogType == "register") apiFunc = AssetApi.postAssets;	//자산 등록
			else apiFunc = AssetApi.patchAssets; //자산 편집

			//API를 호출하기위해 불필요 어트리뷰트를 제거하고, 자산과 연동된 기기 정보를 가져온다.
			var devices = AssetModel.getAssetDeviceInfo(results, dialogType);

			var reqArr = [];
			//자산 API 호출
			reqArr.push(apiFunc(results));
			//자산과 연동된 dms API 호출
			if(devices.length) reqArr.push(DeviceApi.patchDevices(devices));

			$.when.apply(this, reqArr).done(function(){
				detailPopup.success(); //상세 팝업에 수정된 데이터를 반영
				self.loadingPanel.close();
				var msg;
				if(dialogType == "register"){
					msg = I18N.prop("FACILITY_DEVICE_REGISTER_RESULT");
					detailPopup.close();
					msgDialog.message(msg);
					msgDialog.open();
				}else{
					msg = I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED");
					msgDialog.message(msg);
					//조명, 스마트 플러그 제어의 경우 메시지 팝업을 표시하지 않는다.
					//상세 팝업 편집의 경우 상세 팝업 안에 팝업을 표시한다.
					if(!isHideMessagePopup) msgDialog.open(detailPopup.element);
				}
				self.loadingPanel.open();
				self.refreshDeviceData(false).always(function(){
					self.loadingPanel.close();
				});
			}).fail(function(xhq){
				detailPopup.fail(); //상세 팝업에 수정된 데이터를 원래대로 롤백

				self.loadingPanel.close();
				var msg = DeviceUtil.getDeviceRegistrationFailMsg(xhq);
				msgDialog.message(msg);
				msgDialog.open(detailPopup.element);
			});
		},
		clickRegisterInRegistration : function(e){
			var self = this;
			BaseController.fn.clickRegisterInRegistration.call(self);
			var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			//자산의 등록 버튼은 항상 등록으로 표시
			registerButton.set("text", Constants.TEXT["REGISTER"]);
		},
		attachFilterEvt : function(){
			var self = this;
			BaseController.fn.attachFilterEvt.call(self);
			var statusFilter = self.getFilterViewModel(Constants.FILTER_NAME.STATUS);
			statusFilter.options.set("select", function(e){
				var currentViewInfo = self.getCurrentViewInfo();
				var layoutName = currentViewInfo.innerLayoutName;
				var statusFilters = self.statusFilter = [];
				var value = e.dataItem.value;
				if(value !== ""){
					if(layoutName == "monitoring"){
						statusFilters.push({ field : "devices", operator: function(item, val){			//[13-04-2018]중복된 코드 변환 : value -> val -jw.lim
							if(val == "") return true;
							//연계 디바이스가 없고 정상일 경우 표시
							//연계 디바이스가 없고 정상이 아닐 경우 미표시
							if(!item || !item.length){
								if(val == "Normal") return true;
								return false;
							}
							var i, length = item.length;
							for(i = 0; i < length; i++){
								if(item[i].dms_devices_representativeStatus == val){
									return true;
								}
							}

						}, value : value});
					}else{
						statusFilters.push(DeviceUtil.filter0Depth("representativeStatus", "eq", value));
					}
				}
				self.applyCurrentFilter();
			});

			var assetTypeFilter = self.getFilterViewModel(Constants.FILTER_NAME.ASSET_TYPE);
			assetTypeFilter.options.set("select", function(e){
				var assetTypeFilters = self.typeFilter = [];
				var value = e.dataItem.id;
				if(value !== ""){
					assetTypeFilters.push(DeviceUtil.filter0Depth("assets_types_id", "eq", value));
				}
				self.applyCurrentFilter();
			});

			var positionTypeFilter = self.getFilterViewModel(Constants.FILTER_NAME.TYPE);
			positionTypeFilter.options.set("select", function(e){
				var positionTypeFilters = self.modeFilter = [];
				var value = e.dataItem.value;
				if(value !== ""){
					positionTypeFilters.push(DeviceUtil.filter0Depth("mobilityType", "eq", value));
				}
				self.applyCurrentFilter();
			});
		},
		openDetailPopup : function(selectedData, dialogType, isRegisterButton){
			var self = this, i, ids, max = selectedData.length;
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName;

			//등록 또는 상세/편집 팝업
			if(layoutName == "registration") dialogType = "register";
			else dialogType = null;

			self.detailPopup.setDialogType(dialogType);

			if(max){
				self.loadingPanel.open();
				var assetTypes = [];
				AssetApi.getAssetTypes().done(function(data){
					assetTypes = AssetTypeModel.createAssetTypePopupModel(data);
				}).fail(function(xhq){
					var msg = Util.parseFailResponse(xhq);
					msgDialog.message(msg);
					msgDialog.open();
				}).always(function(){
					AssetPopupConfig.setAssetTypes(assetTypes);
					ids = [];
					for( i = 0; i < max; i++ ){
						ids.push(selectedData[i].id);
					}

					var apiFunction;
					if(layoutName == "monitoring"){
						apiFunction = AssetApi.getAssetWithMultipleID;
					}else{
						apiFunction = DeviceApi.getDeviceWithMultipleID;
					}
					apiFunction(ids).done(function(data){
						if(layoutName == "registration") data = AssetModel.convertBeaconToAssetModel(data);

						var ds = new kendo.data.DataSource({
							data : data,
							pageSize : DEFAULT_PAGE_SIZE
						});
						ds.read();

						self.detailPopup.setDataSource(data);
						self.detailPopup.open(dialogType);
						if(isRegisterButton) self.detailPopup.buttons[4].click(); //등록 버튼 클릭 시, 상세 팝업을 연 후 바로 등록 화면으로 전환시킨다.
					}).always(function(){
						self.loadingPanel.close();
					});
				});
			}
		},
		onMonitoringLayout : function(){
			var self = this;
			BaseController.fn.onMonitoringLayout.call(self);
			//등록/미등록 탭을 숨긴다.
			self.monitoringMapList.hideTab(true);

			//삭제 버튼 표시
			var deleteBtn = self.getActionViewModel(Constants.ACTION_NAME.DELETE);
			deleteBtn.options.set("invisible", false);

			//자산 타입, 위치 타입 필터 표시
			var assetTypeFilter = self.getFilterViewModel(Constants.FILTER_NAME.ASSET_TYPE);
			assetTypeFilter.options.set("invisible", false);
			var positionTypeFilter = self.getFilterViewModel(Constants.FILTER_NAME.TYPE);
			positionTypeFilter.options.set("invisible", false);
		},
		onRegistrationLayout : function(){
			var self = this;
			var view = BaseController.fn.onRegistrationLayout.call(self);
			//등록/미등록 탭을 표시한다.
			self.registrationMapList.hideTab(false);

			//삭제 버튼 표시
			var deleteBtn = self.getActionViewModel(Constants.ACTION_NAME.DELETE);
			deleteBtn.options.set("invisible", false);

			//자산 타입, 위치 타입 필터 미표시
			var assetTypeFilter = self.getFilterViewModel(Constants.FILTER_NAME.ASSET_TYPE);
			assetTypeFilter.options.set("invisible", true);
			var positionTypeFilter = self.getFilterViewModel(Constants.FILTER_NAME.TYPE);
			positionTypeFilter.options.set("invisible", true);

			return view;
		},
		onChangeDataView : function(layoutName, viewName, widget){
			var self = this;
			BaseController.fn.onChangeDataView.call(self, layoutName, viewName, widget);
			if(viewName == "map"){
				if(layoutName == "monitoring") widget.setOptions( { isRegisterView : false, canDragDeviceIcon : false });
				else if(layoutName == "registration") widget.setOptions( { isRegisterView : true, canDragDeviceIcon : false });
			}

			var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			//자산의 등록 버튼은 항상 등록으로 표시
			registerButton.set("text", Constants.TEXT["REGISTER"]);

		},
		setSelectedDataNum : function(selectedData){
			var self = this;
			BaseController.fn.setSelectedDataNum.call(self, selectedData);

			var assetTypeBtn = self.getActionViewModel(Constants.ACTION_NAME.ASSET_TYPE);
			//자산 유형 버튼은 기기/자산 선택 상태와 관련없이 항상 활성화 상태이다.
			assetTypeBtn.options.set("disabled", false);
		},
		onWidgetChangeRegistrationMapList : function(viewName, layoutName, selectedData){
			var self = this;
			if(viewName === "map"){
				if(layoutName == "monitoring"){
					var monitoringMapList = self.monitoringMapList;
					monitoringMapList.selectByData(selectedData);
				}else if(layoutName == "registration"){
					var registrationMapList = self.registrationMapList;
					registrationMapList.selectByData(selectedData);
				}
			}
		},
		selectAll : function(){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName, widget = currentViewInfo.dataViewWidget;

			var selectedData;
			if(layoutName == "registration" && viewName == "map" && self.registrationMapList &&
				self.registrationMapList.selectedIndex == Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER){
				self.registrationMapList.selectAll();
				selectedData = self.registrationMapList.getSelectedData();
			}else{
				//Grid Widget(List, Grid View)에 필터가 적용된 View 기준으로 전체 선택을 위하여 true를 전달
				//Map은 파라미터 상관없이 View 기준으로 선택됨.
				widget.selectAll(true);
				if(self.registrationMapList) self.registrationMapList.selectAll();
				if(self.monitoringMapList) self.monitoringMapList.selectAll();
				selectedData = widget.getSelectedData();
			}
			self.setSelectedDataNum(selectedData);

			return selectedData;
		},
		getDeviceData : function(e){
			var self = this;
			var viewName = e.viewName, widget = e.widget,
				registrationStatus = e.registrationStatus, page = e.page, size = e.size,
				isRefresh = e.isRefresh, thenCallbackFunc = e.thenCallbackFunc;

			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName;

			if(!page) page = 1;
			if(!size){
				//Refresh의 경우 전체 데이터를 다 가져와서 Refresh 한다.
				if(isRefresh) size = widget.dataSource.data().length;
				else size = DEFAULT_PAGE_SIZE;
			}

			//Scroll로 Data를 가져오는 중이거나, 현재 리프레시하려는 Widget에 데이터가 존재하지 않을 경우 Refresh는 동작하지 않는다.
			if(isRefresh && (self._isScrolling || size == 0)){
				var dfd = new $.Deferred();
				dfd.resolve();
				return dfd.promise();
			}

			var pageOptions;
			//Map View가 아니거나, Map View에서 미등록 기기 리스트 탭일 경우 Pagenation 옵션을 포함하여 호출한다.
			if(viewName != "map" || (viewName == "map" && registrationStatus == "NotRegistered" ) ){
				pageOptions = {
					typeQuery : { page : page, size : size },
					mappedTypeQuery : { page : page, size : size }
				};
			}

			var ajax;
			if(layoutName == "registration"){
				ajax = DeviceApi.getDeviceWithType("Beacon", [registrationStatus], pageOptions);
			}else {
				ajax = AssetApi.getAssets();
			}

			if(thenCallbackFunc) ajax.then(thenCallbackFunc);

			return ajax;
		},
		getStatisticData : function(buildingId, floorId){
			var self = this, dfd = new $.Deferred();
			if(buildingId == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID
				|| floorId === MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
				AssetApi.getStatistic().done(function(resData){
					self.deviceTabPanel.setStatisticDatasource(DeviceUtil.convertStatistic(buildingId, resData));
					dfd.resolve();
				}).fail(function(){
					dfd.reject();
				});
			}else{
				dfd.resolve();
			}
			return dfd.promise();
		},
		getRegisteredDeviceNum : function(){
			var self = this, deviceTypeKey = "Beacon", currentViewInfo = self.getCurrentViewInfo();
			var reqArr = [];
			var widget = currentViewInfo.dataViewWidget;
			var ds = widget.dataSource;
			var registeredNum, unregisteredNum;

			//현재 필터가 걸려있을 경우 등록된 기기 개수는 필터를 적용한 개수로 표시한다.
			var filter = self.getCurrentFilter();
			if(!$.isArray(filter)){
				var dsData = ds.data();
				var query = new kendo.data.Query(dsData).filter(filter).toArray();
				registeredNum = query.length;
			}else{
				//Pagination API를 통해서 등록 기기 총합을 가져온다 mappedType까지 포함하여 호출한다.
				reqArr.push(DeviceApi.getDeviceWithType(deviceTypeKey, ["Registered"],
					{ typeQuery : { page : 1, size : 5 },
						mappedTypeQuery : { page : 1, size : 5}}).done(function(data){
					registeredNum = data.total;
				}));
			}
			//Pagination API를 통해서 등록 기기 총합을 가져온다 mappedType까지 포함하여 호출한다.
			reqArr.push(DeviceApi.getDeviceWithType(deviceTypeKey, ["NotRegistered"], { typeQuery : { page : 1, size : 5 },
				mappedTypeQuery : { page : 1, size : 5}}).done(function(data){
				unregisteredNum = data.total;
			}));

			return $.when.apply(this, reqArr).always(function(){
				self.setRegisteredNum(registeredNum, unregisteredNum);
			});
		},
		getCurrentFilter : function(){
			var self = this, filter = [];
			var currentViewInfo = self.getCurrentViewInfo();
			var viewName = currentViewInfo.dataViewName, registrationStatus = currentViewInfo.registrationStatus,
				layoutName = currentViewInfo.innerLayoutName;

			if(layoutName == "registration" && viewName == "list" && registrationStatus == "NotRegistered") return [];

			filter = DeviceUtil.getAccureFilter(filter, self.typeFilter, self.statusFilter, self.zoneFilter, self.modeFilter);
			var keywords = self.viewModel.get("searchFieldValue");

			if(keywords){
				//모니터링은 경우 자산 유형 이름, 등록인 경우 기기 이름
				if(layoutName == "monitoring") filter.filters.push(DeviceUtil.filter0Depth("assets_types_name", "contains", keywords));
				else if(layoutName == "registration") filter.filters.push(DeviceUtil.filter0Depth("name", "contains", keywords));
			}

			if(filter.filters.length == 0) filter = [];

			//등록 뷰에서 자산에 등록되지 않은 비콘만 표시되어야한다.
			if(layoutName == "registration"){
				var noAssetFilter = DeviceUtil.filterHasListAttrItem("assets", false);
				if(filter.filters) filter.filters.push(noAssetFilter);
				else if($.isArray(filter)) filter = noAssetFilter;
			}

			return filter;
		},
		_mapListAssetTabTemplate : function(data){
			var self = this;
			if(data.treeGroup) return self._mapListGroupHeaderTemplate(data);
			return Template.assetMapListRegTemplate(data);
		},
		getTotalSize : function(){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName,
				widget = currentViewInfo.dataViewWidget, registrationStatus = currentViewInfo.registrationStatus;

			if(layoutName != "monitoring"){
				//등록
				if(viewName == "map"){
					if(registrationStatus == "Registered"){
						//자산이 없는 비콘으로 필터링 된 개수가 총 개수이다.
						var query = new kendo.data.Query(widget.dataSource.data()).filter(DeviceUtil.filter0Depth("assets[0]", "eq", void 0)).toArray();
						return query.length;
					}else if(this.registrationMapList){
						return this.registrationMapList.tabViewModel[Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER].get("count");
					}
				}else if(viewName == "list"){
					return widget.dataSource.pagingTotal;
				}
			}else if(viewName == "map"){
				return widget.dataSource.data().length;
			}
			return widget.dataSource.pagingTotal;
		},
		getMonitoringMapListOptions : function(){
			var self = this;

			return {
				dataSource : [],
				hasNewDataSource : false,
				hasSelectedModel : true,
				type : "hybrid",
				filterTab : [
					{
						template : "<span data-bind='text: name'></span><span>(<span data-bind='text: count'></span>)</span>",
						listStyle : "treeList",
						listOptions : {
							column : {
								template : self._mapListAssetTabTemplate.bind(self),
								headerTemplate : MainWindow.getCurrentFloorName,
								field : "location.foundation_space_zones_id",
								groupHeaderTemplate : self._mapListGroupHeaderTemplate.bind(self)
							},
							group : [
								{ field : "location.foundation_space_zones_id", aggregate : "count" }
							]
						}
					}
				],
				tabViewModel : [
					{
						name : I18N.prop("FACILITY_DEVICE_REGISTERED"),
						click : function(){},
						count : 0
					}
				],
				activateTab : self.activateRegistrationMapListTab.bind(self)
			};
		},
		activateRegistrationMapListTab : function(e){
			var self = this;
			BaseController.fn.activateRegistrationMapListTab.call(self, e);
			var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			//자산의 등록 버튼은 항상 등록으로 표시
			registerButton.set("text", Constants.TEXT["REGISTER"]);
		}
	});

	var assetController = {
		"Asset" : AssetController
	};

	var getAssetController = function(type){
		var Controller = assetController[type];

		if(!Controller){
			console.error("There is no controller for type : " + type);
		}

		return Controller;
	};

	return {
		getAssetController : getAssetController
	};
});
//# sourceURL=asset/monitoring/controller/asset-controller.js