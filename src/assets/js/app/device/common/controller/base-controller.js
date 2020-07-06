define("device/common/controller/base-controller", ["device/common/device-api", "device/common/device-util","device/common/device-constants", "device/common/config/popup-config",
	"device/common/device-template"], function(Api, DeviceUtil, Constants, PopupConfig, Template){

	var kendo = window.kendo;
	var MainWindow = window.MAIN_WINDOW;
	var LoadingPanel = window.CommonLoadingPanel;
	var msgDialog = PopupConfig.messageDialog;
	var confirmDialog = PopupConfig.confirmDialog;
	var I18N = window.I18N;
	var DEFAULT_PAGE_SIZE = 50;
	var searchKeyDownTimeout = null;

	var BaseController = kendo.Class.extend({
		init : function(e){
			this._createDataSource();
			this.loadingPanel = new LoadingPanel();
			this.deviceTabPanel = e.sender;
			this.element = e.contentElement;
			this.tabIndex = e.selectedIdx;
			this.tabLayout = e.tabLayout;
			this.deviceTypeKey = this.tabLayout.key;
			this.innerLayouts = e.innerLayouts;
			this.viewModel = e.viewModel;
			this.nameFilter = [];
			this.typeFilter = [];
			this.statusFilter = [];
			this.zoneFilter = [];
			this.modeFilter = [];
			this.controlPanelElement = this.element.find(".device-control-panel");
			this.registrationMapListElement = this.element.find(".device-registration-map-panel");
			this.monitoringMapListElement = this.element.find(".device-monitoring-map-panel");
			MainWindow.disableBuidingTotal(false);
			MainWindow.disableFloorAllBtn(false);
			this.initComponent();
			this.attachEvent();
		},
		_createDataSource : function(){
			self.zoneDataSource = new kendo.data.DataSource({ data : [] });
		},
		initComponent : function(){	//컴포넌트 초기화
			var registerationLayout = this.getLayoutViewModel("registration");
			if(registerationLayout) this.registrationMapView = registerationLayout.dataViews.map;

			//상세 팝업
			var tabkey = this.deviceTypeKey;
			this.detailPopup = PopupConfig.getDetailPopup(tabkey);

			//맵 뷰 우측 리스트
			var options = this.getRegisterMapListOptions();
			this.registrationMapList = this.registrationMapListElement.kendoDeviceTabGroupGrid(options).data("kendoDeviceTabGroupGrid");

			//맵 뷰 우측 리스트 2 (서비스 - 자산의 경우 자산, 비콘 별개로 동작하므로 2개의 리스트가 존재한다.)
			options = this.getMonitoringMapListOptions();
			if(options) this.monitoringMapList = this.monitoringMapListElement.kendoDeviceTabGroupGrid(options).data("kendoDeviceTabGroupGrid");

			//모니터링 / 등록 탭 한개만 표시시 탭 숨김
			if(this.innerLayouts.length < 2) this.element.find('.device-panel-layout-buttons').hide();
		},
		attachEvent : function(){	//이벤드 바인딩
			var self = this;

			//Monitoring, Registration 전환
			self.deviceTabPanel.bind("changeInnerLayout", self.onChangeInnerLayout.bind(self));
			//Statistic, List, Map, Grid View 전환
			self.deviceTabPanel.bind("changeDataLayout", self.onChangeDataLayout.bind(self));

			if(self.registrationMapList){
				//Register Map View 에서 우측 리스트 클릭 시(선택 시) 드래그 앤 드롭 초기화
				self.registrationMapListElement.on('click','.map-panel-list-container .k-grid-content.no-header .device-map-panel-list-item', self.initListDragDropEvt.bind(this));
				//Register Map View 우측 리스트에서 그룹을 펼치는 이벤트
				self.registrationMapList.bind("expand", self.expandRegistrationMapListTab.bind(self));
				//Register Map View 우측 리스트에서 기기 선택 시 이벤트
				self.registrationMapList.bind("change", self.onRegistrationMapListChangeSelection.bind(self));
			}

			//기기 및 기기 정보 텍스트 박스 드래그 앤 드롭 이벤트
			if(self.registrationMapView){
				var registerMapWidget = self.registrationMapView.widget;
				registerMapWidget.bind("dragend", self.dragEndDeviceEvt.bind(self));
			}

			//전체 선택 버튼 이벤트
			var selectAllBtn = self.getFilterViewModel(Constants.FILTER_NAME.SELECTALL);
			if(selectAllBtn) selectAllBtn.options.set("click", self.clickSelectAllEvt.bind(self));

			//상세 정보 버튼 이벤트
			var detailBtn = self.getActionViewModel(Constants.ACTION_NAME.DETAIL);
			if(detailBtn) detailBtn.options.set("click", self.clickDetailBtnEvt.bind(self));

			//상세 정보 아이콘 이벤트
			$(".device-content-wrapper").on("click", ".k-widget .ic-info", self.clickDetailIconEvt.bind(self));

			var viewModel = self.viewModel;
			//등록 화면 리스트 뷰 내 등록/미등록 버튼
			var registrationStatusButtons = viewModel.registrationStatusButtons;
			if(registrationStatusButtons){
				var registerBtnInRegistration = registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.REGISTER];
				if(registerBtnInRegistration) registerBtnInRegistration.set("click", self.clickRegisterInRegistration.bind(self));
				var unregisterBtnInRegistration = registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER];
				if(unregisterBtnInRegistration) unregisterBtnInRegistration.set("click",self.clickUnregisterInRegistration.bind(self));
			}

			//등록 버튼 이벤트
			var registerBtn = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			if(registerBtn) registerBtn.options.set("click", self.clickRegisterBtnEvt.bind(self));

			//삭제 버튼 이벤트
			var deleteBtn = self.getActionViewModel(Constants.ACTION_NAME.DELETE);
			if(deleteBtn) deleteBtn.options.set("click", self.clickDeleteBtnEvt.bind(self));

			//상세 팝업 이벤트
			if(self.detailPopup){
				self.detailPopup.bind("onSaved", self.saveDetailPopupEvt.bind(self));
				self.detailPopup.bind("onRegister", self.registerDetailPopupEvt.bind(self));
				self.detailPopup.bind("onDeregister", self.deregisterDetailPopupEvt.bind(self));
			}

			//모니터링 뷰에서 주기적으로 Refresh 이벤트
			self.refreshInterval = setInterval(self.intervalRefreshData.bind(self), Constants.ALL_TIME_INTERVAL);

			//필터 이벤트
			self.attachFilterEvt();

			//검색
			self.viewModel.set("searchKeyDown", self.keydownSearchEvt.bind(self));
			self.viewModel.set("searchClick", self.clickSearchEvt.bind(self));
		},
		attachFilterEvt : function(){
			var self = this;
			//기기 타입 별로 상속받아 구현
			//base controller에는 공통 필터인 Zone Filter만을 구현
			var zoneFilter = self.getFilterViewModel(Constants.FILTER_NAME.ZONE);
			if(zoneFilter){
				zoneFilter.options.set("selectionChanged", function(e){
					self.zoneFilter = [];
					var values = e.newValue;
					var length = values.length;
					var count = e.count;

					if(length === 0){
						self.zoneFilter.push(DeviceUtil.filter1Depth("locations", "foundation_space_zones_id", void 0));			//[16-04-2018]undefined 선언 -jw.lim
					}else if(length !== count && count !== 0) {
						for(var i = 0; i < length; i++){
							self.zoneFilter.push(DeviceUtil.filter1Depth("locations", "foundation_space_zones_id", values[i]));
						}
					}
					self.applyCurrentFilter();
				});
			}
		},
		keydownSearchEvt : function(e){
			var self = this;
			// if (searchKeyDownTimeout) clearTimeout(searchKeyDownTimeout);

			if(e.keyCode == 13){
				self.keydownClickSearchTriggerEvt(e);

			}

			// searchKeyDownTimeout = setTimeout(function () {
			// 	self.keydownClickSearchTriggerEvt(e);
			// }, 1000);
		},
		keydownClickSearchTriggerEvt : function(e) {
			var value = $(e.target).val();
			this.viewModel.set("searchFieldValue", value);
			this.clickSearchEvt(e);
		},
		clickSearchEvt : function(e){
			var self = this;
			//비활성화 상태일 경우. 입력 상태가 없을 경우는 없는대로 필터링을 걸어 검색 상태를 해제를한다.
			if(!self.viewModel.get("enableSearch")) return;

			self.applyCurrentFilter();
		},
		intervalRefreshData : function(){
			var self = this;
			if(self.refreshTimeout){
				clearTimeout(self.refreshTimeout);
				self.refreshTimeout = null;
			}
			self.refreshTimeout = setTimeout(self.onRefreshData.bind(self), Constants.TIMEOUT * 2);
		},
		onRefreshData : function(){
			var self = this, currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName,
				currentViewWidget = currentViewInfo.dataViewWidget;
			//Refresh가 완료되지 않았거나 상세 팝업 편집 시에는 리프레시를 하지 않는다.
			if(self.isRefreshing || (self.detailPopup && self.detailPopup.isEditable)) return;
			if(layoutName == "monitoring"){
				self.loadingPanel.open(currentViewWidget.element);
				self.refreshDeviceData(true).always(function(){
					self.loadingPanel.close();
				});
			}
		},
		saveDetailPopupEvt : function(e){
			var self = this;
			self.patchInDetailPopupEvt(e, true);
		},
		registerDetailPopupEvt : function(e){
			var self = this, detailPopup = e.sender;
			confirmDialog.message(I18N.prop("FACILITY_DEVICE_REGISTER_CONFIRM"));
			confirmDialog.setConfirmActions({
				yes : function(){
					self.patchInDetailPopupEvt(e);
				},
				no : function(){
					detailPopup.fail();
				}
			});
			confirmDialog.open();
		},
		deregisterDetailPopupEvt : function(e){
			var self = this, detailPopup = e.sender;
			confirmDialog.message(I18N.prop("FACILITY_DEVICE_DEREGISTER_CONFIRM"));
			confirmDialog.setConfirmActions({
				yes : function(){
					self.patchInDetailPopupEvt(e);
				},
				no : function(){
					detailPopup.fail();
				}
			});
			confirmDialog.open();
		},
		patchInDetailPopupEvt : function(e, isEditDeviceInfo){
			var self = this;
			var isHideMessagePopup = e.hideMessagePopup;
			var detailPopup = e.sender, results = e.results ? e.results : [e.result];
			if(!results) return;
			var dialogType = detailPopup.dialogType;
			//console.log(results);
			self.loadingPanel.open(detailPopup.element);
			self.onPatchInDetailPopupEvt(results);
			Api.patchDevices(results).done(function(){
				detailPopup.success(); //상세 팝업에 수정된 데이터를 반영
				self.loadingPanel.close();
				var msg;
				if(dialogType == "register" || (dialogType == "deregister" && !isEditDeviceInfo)){
					msg = dialogType == "register" ? I18N.prop("FACILITY_DEVICE_REGISTER_RESULT") : I18N.prop("FACILITY_DEVICE_DEREGISTER_RESULT");
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
		onPatchInDetailPopupEvt : function(results){
			var item, i, max = results.length;
			var locations;
			for( i = 0; i < max; i++ ){
				item = results[i];
				locations = item.locations;
				if(locations && locations[0] && locations[0].nameDisplayCoordinate){
					item.nameDisplayCoordinate = locations[0].nameDisplayCoordinate;
					delete locations[0].nameDisplayCoordinate;
				}
			}
		},
		clickRegisterInRegistration : function(e){
			var self = this;
			var registrationStatusButtons = self.viewModel.registrationStatusButtons;
			var registerBtn = registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.REGISTER];
			var unregisterBtn = registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER];
			var isActive = registerBtn.get("active");
			if(isActive) return;
			registerBtn.set("active", true);
			unregisterBtn.set("active", false);

			//등록 클릭 시, 등록 버튼의 텍스트를 '등록해제'로 표시
			var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			registerButton.set("text", Constants.TEXT["DEREGISTER"]);
			//self.deviceTabPanel.changeDataLayout("list");

			//미등록 기기 리스트에서 필터를 걸었을 경우에 대비한 필터 초기화
			self.onInitializeFilter();

			self.loadingPanel.open();
			self.refreshDeviceData(false).always(function(){
				self.loadingPanel.close();
			});
		},
		clickUnregisterInRegistration : function(e){
			var self = this;
			var registrationStatusButtons = self.viewModel.registrationStatusButtons;
			var registerBtn = registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.REGISTER];
			var unregisterBtn = registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER];
			var isActive = unregisterBtn.get("active");
			if(isActive) return;
			unregisterBtn.set("active", true);
			registerBtn.set("active", false);
			//미등록 클릭 시, 등록 버튼의 텍스트를 '등록'으로 표시
			var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			registerButton.set("text", Constants.TEXT["REGISTER"]);

			//미등록 기기 리스트이므로 필터 초기화
			self.onInitializeFilter();

			self.loadingPanel.open();
			self.refreshDeviceData(false).always(function(){
				self.loadingPanel.close();
			});
		},
		clickSelectAllEvt : function(e){
			var self = this, selectAllBtn = self.getFilterViewModel(Constants.FILTER_NAME.SELECTALL);
			var text = selectAllBtn.get("text");
			if(text === Constants.TEXT.SELECTALL){
				selectAllBtn.set("text", Constants.TEXT.DESELECTALL);
				self.selectAll();
			}else if(text == Constants.TEXT.DESELECTALL){
				selectAllBtn.set("text", Constants.TEXT.SELECTALL);
				self.unselectAll();
			}
		},
		clickRegisterBtnEvt : function(e){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var registrationStatus = currentViewInfo.registrationStatus,
				dataViewName = currentViewInfo.dataViewName, dataViewWidget = currentViewInfo.dataViewWidget;
			var selectedData = [], dialogType, isEditable = false;

			if(dataViewName == "map" && registrationStatus == "NotRegistered"){		//미등록 탭 선택 상태
				if(self.registrationMapList) selectedData = self.registrationMapList.getSelectedData();
				dialogType = "register";	//등록 팝업을 표시한다.
				isEditable = true;
			}else{
				selectedData = dataViewWidget.getSelectedData();
				if(registrationStatus == "Registered"){
					//등록 해제
					confirmDialog.message(I18N.prop("FACILITY_DEVICE_DEREGISTER_CONFIRM"));
					confirmDialog.setConfirmActions({
						yes : function(){
							self.loadingPanel.open();
							Api.patchRegistrationStatus(selectedData, "NotRegistered").always(function(){
								//기기 정보를 Refresh한다.
								self.refreshDeviceData(false).always(function(){
									self.loadingPanel.close();
									msgDialog.message(I18N.prop("FACILITY_DEVICE_DEREGISTER_RESULT"));
									msgDialog.open();
								});
							});
						}
					});
					confirmDialog.open();
					return;
				}
				//등록
				dialogType = "register";
			}
			self.openDetailPopup(selectedData, dialogType, isEditable);
		},
		clickDeleteBtnEvt : function(e){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var registrationStatus = currentViewInfo.registrationStatus,
				dataViewName = currentViewInfo.dataViewName, dataViewWidget = currentViewInfo.dataViewWidget;
			var selectedData = [];

			if(dataViewName == "map" && registrationStatus == "NotRegistered"){		//미등록 탭 선택 상태
				if(self.registrationMapList){
					selectedData = self.registrationMapList.getSelectedData();
					//미등록 기기 탭을 활성화 하고 맵에서 기기를 선택했을 경우이다.
					if(selectedData.length == 0) selectedData = dataViewWidget.getSelectedData();
				}
			}else{
				selectedData = dataViewWidget.getSelectedData();
			}
			//삭제
			confirmDialog.message(I18N.prop("FACILITY_DEVICE_DELETE_CONFIRM"));
			confirmDialog.setConfirmActions({
				yes : function(){
					self.loadingPanel.open();
					var data, ids = [], i, max = selectedData.length;
					for( i = 0; i < max; i++ ){
						data = selectedData[i];
						ids.push(data.id);
					}
					Api.deleteDevices(ids).always(function(){
						//기기 정보를 Refresh한다.
						self.refreshDeviceData(false).always(function(){
							self.loadingPanel.close();
							msgDialog.message(I18N.prop("FACILITY_DEVICE_DELETE_RESULT"));
							msgDialog.open();
						});
					});
				}
			});
			confirmDialog.open();
		},
		clickDetailIconEvt : function(e){
			var self = this, id = $(e.target).data("id");
			self.openDetailPopup([{ id : id }]);
		},
		clickDetailBtnEvt : function(e){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName, widget = currentViewInfo.dataViewWidget;
			var selectedData = [];
			var dialogType;
			if(layoutName == "registration" && viewName == "map" && self.registrationMapList &&
				self.registrationMapList.selectedIndex == Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER){
				selectedData = self.registrationMapList.getSelectedData();

				//미등록 기기 탭을 활성화 하고 맵에서 기기를 선택했을 경우이다.
				if(selectedData.length == 0){
					selectedData = widget.getSelectedData();
					dialogType = "deregister";
				}
			}else{
				selectedData = widget.getSelectedData();
			}
			self.openDetailPopup(selectedData, dialogType);
		},
		openDetailPopup : function(selectedData, dialogType, isEditable){
			var self = this, i, ids, max = selectedData.length;
			var currentViewInfo = self.getCurrentViewInfo(), layoutName = currentViewInfo.innerLayoutName,
				registrationStatus = currentViewInfo.registrationStatus;

			if(!dialogType){
				//등록 뷰에서 상세 팝업의 기기 아이콘 템플릿 적용을 위하여 dialogType 값을 할당한다.
				if(layoutName == "registration"){
					if(registrationStatus == "Registered") dialogType = "deregister";
					else dialogType = "register";
				}
			}

			if(max){
				self.loadingPanel.open();
				ids = [];
				for( i = 0; i < max; i++ ){
					ids.push(selectedData[i].id);
				}
				Api.getDeviceWithMultipleID(ids).done(function(data){
					var ds = new kendo.data.DataSource({
						data : data,
						pageSize : DEFAULT_PAGE_SIZE
					});
					ds.read();
					self.detailPopup.setDialogType(dialogType);
					self.detailPopup.setDataSource(ds);
					self.detailPopup.open(dialogType);
					if(isEditable) self.detailPopup.buttons[4].click();
				}).always(function(){
					self.loadingPanel.close();
				});
			}
		},
		onFloorChanged : function(currentFloor){
			var self = this;
			var floor = currentFloor.floor, building = currentFloor.building,
				floorId = floor.id, buildingId = building.id,
				isTotalBuilding = buildingId == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID, isAllFloor = floorId == MainWindow.FLOOR_NAV_FLOOR_ALL_ID;
			var currentViewInfo = self.getCurrentViewInfo(), currentLayoutName = currentViewInfo.innerLayoutName, currentViewName = currentViewInfo.dataViewName;
			self.viewModel.set("searchFieldValue", "");

			self.zoneFilter = [];
			self._getZoneData(floorId, isTotalBuilding, isAllFloor).always(function(){
				//Default는 선택한 View 유지.
				//기기 타입 탭 선택 후, 특정 View 버튼을 클릭하지 않았다면 currentViewName은 null 상태이다.
				var newViewName = currentViewName;
				if(currentLayoutName == "monitoring"){
					//Map View에서 전체 빌딩 또는 전체 층 선택 시,
					if(currentViewName == "map" && (isTotalBuilding || isAllFloor)){
						//Map View에서 전체 층 선택 시, Statistic으로 이동
						newViewName = "statistic";

					}else if(currentViewName == "statistic" && (!isTotalBuilding && !isAllFloor)){
						newViewName = "map";	//Statistic View에서 특정 층 선택했을 경우 Map View로 이동
					}
				}else if(currentLayoutName == "registration"){
					newViewName = "map";	//Registration 일 경우 Map View로 이동
				}

				self.deviceTabPanel.trigger("changeInnerLayout", { viewName : newViewName });
			});
		},
		_getZoneData : function(floorId, isTotalBuilding, isAllFloor){
			var dfd = new $.Deferred();
			var self = this;
			var zoneFilter = self.getFilterViewModel(Constants.FILTER_NAME.ZONE);

			if(isTotalBuilding || isAllFloor){
				if(zoneFilter){
					zoneFilter.options.set("disabled", true);
					//DropDownCheckboxList에서 데이터가 없을 경우 selectAllText가 표시되지 않아 임의의 아이템 1개를 Set.
					zoneFilter.options.set("dataSource", [{ id : void 0, name : I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY_ZONE") }]);
				}
				//맵 리스트 패널 템플릿에서 기기들을 Zone으로 Grouping 하여 표시하고, Map View에 zoneDataSource를 Set하기 위하여 내부적으로 존 정보를 들고 있는다.
				self.zoneDataSource = new kendo.data.DataSource({ data : [] });
				dfd.resolve();
			}else{
				if(zoneFilter) zoneFilter.options.set("disabled", false);
				self.loadingPanel.open();
				Api.getZone(floorId).done(function(zoneData){
					if(zoneFilter){
						var zoneFilterData = $.extend(true, [], zoneData);
						zoneFilterData.unshift({ id : void 0, name : I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY_ZONE") });
						zoneFilter.options.set("dataSource", zoneFilterData);
					}
					//맵 리스트 패널 템플릿에서 기기들을 Zone으로 Grouping 하여 표시하고, Map View에 zoneDataSource를 Set하기 위하여 내부적으로 존 정보를 들고 있는다.
					self.zoneDataSource = new kendo.data.DataSource({ data : zoneData });
					self.zoneDataSource.read();
					self.loadingPanel.close();
					dfd.resolve();
				}).fail(function(){
					dfd.reject();
				});
			}

			return dfd.promise();
		},
		onChangeInnerLayout : function(e){
			var self = this;
			var currentViewInfo = self.getCurrentViewInfo(), currentLayoutName = currentViewInfo.innerLayoutName;
			var newViewName = e.viewName;

			//기기 타입 탭 선택 후, 특정 View 버튼을 클릭하지 않았다면 currentViewName은 null 상태이다.
			if(!newViewName){
				//Dashboard 등에서 카드 클릭하여 이동 시, LocalStorage에 저장된 View
				var linkViewType = window.localStorage.getItem("deviceViewType");
				if(linkViewType){
					newViewName = linkViewType.toLowerCase();
					window.localStorage.removeItem("deviceViewType");
				}else{
					//Settings에 설정된 기본 뷰 타입
					newViewName = DeviceUtil.getDefaultView();
				}
			}

			var resultView;
			if(currentLayoutName == "registration"){
				resultView = self.onRegistrationLayout();
				if(resultView) newViewName = resultView;
			}else if(currentLayoutName == "monitoring"){
				resultView = self.onMonitoringLayout();
				if(resultView) newViewName = resultView;
			}

			//Router 전환을 위하여 trigger가 아닌 changeDataLayout을 직접 호출해준다.
			self.deviceTabPanel.changeDataLayout(newViewName);
		},
		onMonitoringLayout : function(){
			var self = this;
			var currentFloor = MainWindow.getCurrentFloor();
			var building = currentFloor.building, buildingId = building.id,
				isTotalBuilding = buildingId == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID;

			//층 네비게이션 상태
			if(isTotalBuilding){
				MainWindow.disableBuidingTotal(false);
				MainWindow.disableFloorAllBtn(true);
			}else{
				MainWindow.disableBuidingTotal(false);
				MainWindow.disableFloorAllBtn(false);
			}

			//Data View 버튼
			self.setViewBtnEnabled("grid", true);
			self.setViewBtnEnabled("map", true);
			self.setViewBtnEnabled("list", true);
			self.setViewBtnEnabled("statistic", true);

			//검색 필드 활성화
			self.viewModel.set("enableSearch", true);

			//Actions 버튼 상태
			//등록 버튼 미표시
			var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			registerButton.options.set("invisible", true);

			//Filter 상태
			//Zone Filter 표시
			var zoneFilter = self.getFilterViewModel(Constants.FILTER_NAME.ZONE);
			if(zoneFilter) zoneFilter.options.set("invisible", false);

			return null;
		},
		onRegistrationLayout : function(){
			var self = this;
			//층 네비게이션 상태
			MainWindow.disableFloorAllBtn(true);
			MainWindow.disableBuidingTotal(true);

			//Data View 버튼
			self.setViewBtnEnabled("grid", false);
			self.setViewBtnEnabled("statistic", false);
			self.setViewBtnEnabled("map", true);

			//Actions 버튼 상태
			//등록 버튼 표시
			var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			registerButton.options.set("invisible", false);
			//등록 뷰 진입 시, 등록 버튼의 텍스트를 등록해제로 표시
			registerButton.set("text", Constants.TEXT["DEREGISTER"]);

			//Filter 상태
			//Zone Filter 숨김
			var zoneFilter = self.getFilterViewModel(Constants.FILTER_NAME.ZONE);
			if(zoneFilter) zoneFilter.options.set("invisible", true);

			//검색 필드 비활성화
			// self.viewModel.set("enableSearch", false);
			//검색 필드 활성화
			self.viewModel.set("enableSearch", true);

			//Registration 전환 시에는 무조건 Map View로 진입한다.
			return "map";
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

			if(currentLayoutName == "monitoring"){
				//층이 존재하지 않을 경우 Map View 비할성화
				if(!isTotalBuilding && !hasFloor){
					self.setViewBtnEnabled("map", false);
					//층이 존재하지 않고, Map View 일 경우 List View로 이동
					if(newViewName == "map"){
						newViewName = "list";
						self.deviceTabPanel.changeDataLayout(newViewName);
					}
					return;
				}

				if(newViewName == "map"){	//이동할 뷰가 Map View 일 때
					//전체 빌딩에서 Map View 선택했을 경우 최상위 빌딩으로 이동
					if(isTotalBuilding){
						MainWindow.clickTopBuilding(false);
						return;
					}else if(isAllFloor){
						MainWindow.clickTopFloor();//전체 층에서 Map View를 선택했을 경우, 첫번째 층으로 이동
						return;
					}
				}else if(newViewName == "statistic"){ //이동할 뷰가 Statistic View 일 때
					if(!isTotalBuilding && !isAllFloor){
						MainWindow.clickAllFloor(); //특정 층일 경우, 전체 층으로 이동
						return;
					}
				}
			}else if(currentLayoutName == "registration"){
				//등록은 전체 빌딩에서 어느 뷰를 선택하든 최상위 빌딩으로 이동
				if(isTotalBuilding){
					MainWindow.clickTopBuilding(false);
					return;
				}else if(hasFloor && isAllFloor){	//등록은 전체 층에서 어느 뷰를 선택하든 최상위 층으로 이동
					MainWindow.clickTopFloor();
					return;
				}

				//층 존재하지 않을 경우 Monitoring의 List View로 이동
				if(!hasFloor){
					// newViewName = "list";
					msgDialog.message(I18N.prop("FACILITY_DEVICE_NO_FLOOR_MSG"));
					msgDialog.open();
					// self.deviceTabPanel.changeInnerLayout("monitoring");
					// self.deviceTabPanel.changeDataLayout(newViewName);
					self.onChangeDataView(currentLayoutName, newViewName, currentViewWidget);
					self.viewModel.set("hideRegisterArea", true);
					self.viewModel.set("hideRightPanel", true);
					self.viewModel.set("hideControlPanel", true);
					self.viewModel.set("hideLightControlPanel", true);
					self.viewModel.set("hideMapPanel", true);
					return;
				}
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
		onChangeDataView : function(layoutName, viewName, widget){
			var self = this, viewModel = self.viewModel;

			//필터 초기화
			if (self.prevLayoutName != layoutName || self.prevViewName != viewName) {
				self.onInitializeFilter();
			}
			self.prevLayoutName = layoutName;
			self.prevViewName = viewName;
			// self.applyCurrentFilter(true);

			viewModel.set("hideRegisterArea", true);
			viewModel.set("hideRightPanel", true);
			viewModel.set("hideControlPanel", true);
			viewModel.set("hideLightControlPanel", true);
			viewModel.set("hideMapPanel", true);

			if(viewName == "list"){
				if(layoutName != "monitoring"){
					//기기명으로 소팅한다.
					widget.dataSource.sort([ { field : "name", dir : "asc" }]);
					viewModel.set("hideRegisterArea", false);
					viewModel.registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.REGISTER].set("active", true);
					viewModel.registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER].set("active", false);
					var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
					registerButton.set("text", Constants.TEXT["DEREGISTER"]);
				}
			}

			//통계 뷰에 따라 Filter, Action 영역을 표시/숨김
			if(viewName == "statistic"){
				viewModel.set("hideSelectArea", true);
				viewModel.set("enableSearch", false);
			}else{
				viewModel.set("hideSelectArea", false);
			}

			var zoneFilter = self.getFilterViewModel(Constants.FILTER_NAME.ZONE);
			if(viewName == "map"){
				//Map View에서는 Zone Filter 숨김
				if(zoneFilter) zoneFilter.options.set("invisible", true);

				if(layoutName == "monitoring"){
					widget.setOptions({ isRegisterView : false, canDragDeviceIcon : false });
					viewModel.set("hideRegistrationMapPanel", true);
					viewModel.set("hideMonitoringMapPanel", false);
				}else if(layoutName == "registration"){
					widget.setOptions({ isRegisterView : true, canDragDeviceIcon : true });
					//뷰 변경 시, 맵 뷰 리스트의 탭은 기본적으로 등록 탭으로 표시한다.
					if(self.registrationMapList) self.registrationMapList.selectTab(Constants.REGISTRATION_STATUS_BUTTONS.REGISTER);
					viewModel.set("hideRegistrationMapPanel", false);
					viewModel.set("hideMonitoringMapPanel", true);
				}

				//Map View는 rightPanel과 MapPanel이 표시된다.
				viewModel.set("hideRightPanel", false);
				viewModel.set("hideMapPanel", false);

				//현재 Map View의 사이즈를 계산하여 Map View의 기기 위치 및 이미지가 표시되므로,
				//Right Panel이 보여졌을 때, 현재 층의 정보를 Map View에 Set 한다.
				var currentFloor = MainWindow.getCurrentFloor();
				var floor = currentFloor.floor;
				widget.setFloor(floor);
				widget.setZoneDataSource(self.zoneDataSource);
			}else if(layoutName == "monitoring" && zoneFilter){	//모니터링의 다른 뷰에서는 Zone Filter 표시
				zoneFilter.options.set("invisible", false);
			}

			widget.unbind("change");
			widget.bind("change", self.onWidgetChangeSelection.bind(self));
			//hideRightPanel, hideControlPanel, hideMapPanel, hideMonitoringMapPanel, hideRegistrationMapPanel 등의 View 업데이트는 기기 타입별로 상속받아 확장 구현 필요.
		},
		refreshDeviceData : function(isRefresh, layoutName, viewName, dataViewWidget, registrationStatus){
			var self = this, currentFloor = MainWindow.getCurrentFloor(), floor = currentFloor.floor, building = currentFloor.building,
				floorId = floor.id, buildingId = building.id, dfd = new $.Deferred();

			self.isRefreshing = true;
			var currentViewInfo = self.getCurrentViewInfo();
			if(!layoutName) layoutName = currentViewInfo.innerLayoutName;
			if(!viewName) viewName = currentViewInfo.dataViewName;
			if(!registrationStatus) registrationStatus = currentViewInfo.registrationStatus;
			if(!dataViewWidget) dataViewWidget = currentViewInfo.dataViewWidget;

			//등록 뷰의 Map 뷰는 미등록 기기 탭과 동시에 표시되는 경우가 있으므로 등록 기기 Refresh를 수행하고, 맵 리스트 뷰는 별도로 리프레시한다.
			if(layoutName == "registration" && viewName == "map"){
				registrationStatus = "Registered";
			}

			var ajax;
			if(viewName == "statistic"){
				ajax = self.getStatisticData(buildingId, floorId);
			}else{
				ajax = self.getDeviceData({ viewName : viewName, layoutName : layoutName,
					widget : dataViewWidget, registrationStatus : registrationStatus, isRefresh : isRefresh });
			}

			//현재 뷰에 대한 기기 정보 API를 요청하여 가져온다
			ajax.fail(function(data){
				var msg = DeviceUtil.getDeviceRegistrationFailMsg(data);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(data){
				if(!data){
					dfd.resolve();
					return;
				}

				//현재 표시되고 있는 Widget의 DataSource를 업데이트한다.
				var ds = dataViewWidget.dataSource;
				var newDs = self.createDataSource(data, ds);
				dataViewWidget.setDataSource(newDs);

				var reqArr = [];
				//기기 데이터를 업데이트 한 후에
				//등록 뷰 일 경우 등록/미등록 기기 개수를 가져온다.
				if(layoutName == "registration"){
					reqArr.push(self.getRegisteredDeviceNum());
				}
				$.when.apply(this, reqArr).fail(function(xhq){
					var msg = DeviceUtil.getDeviceRegistrationFailMsg(xhq);
					msgDialog.message(msg);
					msgDialog.open();
				}).always(function(){
					self.onAfterRefreshData(isRefresh, layoutName, viewName, dataViewWidget, newDs);
					dfd.resolve();
					self.isRefreshing = false;
				});
			});

			return dfd.promise();
		},
		onAfterRefreshData : function(isRefresh, layoutName, viewName, dataViewWidget, newDataSource){
			var self = this;
			//총 기기 개수, 표시 개수 표시 업데이트
			//self.unselectAll();
			var selectedData = dataViewWidget.getSelectedData();
			self.setSelectedDataNum(selectedData);

			if(viewName == "map"){
				if(isRefresh){
					if(self.monitoringMapList){	//아래 2라인은 자산에서 쓰인다. 공용화 될 수 있으므로 아래 포함.
						if(layoutName == "monitoring") self.monitoringMapList.setDataSource(newDataSource, false, true);
						else if(layoutName == "registration") self.registrationMapList.setDataSource(newDataSource, false, true);
					}else if(self.registrationMapList && self.registrationMapList.selectedIndex == Constants.REGISTRATION_STATUS_BUTTONS.REGISTER){ //맵 뷰 리스트를 리프레시한다.
						self.registrationMapList.setDataSource(newDataSource, false, true);
					}
				}else{ //맵뷰 리스트를 리프레시한다. 맵뷰 리스트를 Refresh 하면서 셀렉션 상태가 풀린다.
					if(layoutName == "monitoring" && self.monitoringMapList) self.monitoringMapList.selectTab(self.monitoringMapList.selectedIndex, true);
					if(layoutName == "registration" && self.registrationMapList) self.registrationMapList.selectTab(self.registrationMapList.selectedIndex, true);
				}
			}
		},
		//뷰가 변경되었을 때 필터, 검색 필드 등을 초기화한다.
		onInitializeFilter : function(){
			var self = this, viewModel = self.viewModel;
			//필터 초기화
			self.typeFilter = [];
			self.statusFilter = [];
			self.zoneFilter = [];
			self.modeFilter = [];

			viewModel.set("searchFieldValue", "");
			var type, filter, filtersViewModel = viewModel.filters;
			var i, max = filtersViewModel.length;
			for( i = 0; i < max; i++ ){
				filter = filtersViewModel[i];
				type = filter.type;
				//드롭다운 체크박스 리스트의 경우 전체 선택이 Default이다.
				if(type == "dropdowncheckbox"){
					filter = $("#" + filter.id).data("kendoDropDownCheckBox");
					filter.selectAll();
				}else if(type == "dropdownlist"){	//기본 드롭다운리스트 일 경우 ViewModel로 바인딩된 값을 -1로 처리
					filter.options.set("value", -1);
				}
			}
		},
		getCurrentFilter : function(){
			var self = this, filter = [];
			var currentViewInfo = self.getCurrentViewInfo();
			var viewName = currentViewInfo.dataViewName, registrationStatus = currentViewInfo.registrationStatus,
				layoutName = currentViewInfo.innerLayoutName;

			if(layoutName == "registration" && viewName == "list" && registrationStatus == "NotRegistered") return [];

			filter = DeviceUtil.getAccureFilter(filter, self.typeFilter, self.statusFilter, self.zoneFilter, self.modeFilter);
			var keywords = self.viewModel.get("searchFieldValue");
			if(keywords) {
				var searchFilter = { logic : "or", filters : [] };
				searchFilter.filters.push(DeviceUtil.filter0Depth("id", "contains", keywords));
				searchFilter.filters.push(DeviceUtil.filter0Depth("name", "contains", keywords));
				searchFilter.filters.push(DeviceUtil.filter1Depth("controlPoint", "tagName", keywords));
				filter.filters.push(searchFilter);
			}

			if(filter.filters.length == 0) return [];
			return filter;
		},
		applyCurrentFilter : function(doNotUpdateRegisteredNumber){
			var self = this;
			var currentViewInfo = self.getCurrentViewInfo(), filters = self.getCurrentFilter();
			var widget = currentViewInfo.dataViewWidget, viewName = currentViewInfo.dataViewName, registrationStatus = currentViewInfo.registrationStatus,
				layoutName = currentViewInfo.innerLayoutName;
			var ds = widget.dataSource;
			self.unselectAll();

			var reqArr = [];
			reqArr.push(self.refreshDeviceData(false));
			self.loadingPanel.open();
			$.when.apply(this, reqArr).always(function () {
				if (!self._isSelectingTab) self.loadingPanel.close();
				if(layoutName == "registration"){
					if(registrationStatus == "NotRegistered"){
						if(viewName == "map"){
							ds.filter(filters);
						}else if(viewName == "list"){ //맵 뷰의 미등록 탭 또는 리스트 뷰의 미등록 리스트는 필터링을 걸지 않는다.
							ds.filter([]);
						}
					}else{
						ds.filter(filters);
					}

					//Data View 가 변경되며 진입시에는 필터가 초기화되므로 아래 기기 개수 업데이트가 필요없다.
					// if(!doNotUpdateRegisteredNumber){
					// 	self.loadingPanel.open();
					// 	self.getRegisteredDeviceNum().always(function(){
					// 		self.loadingPanel.close();
					// 		self.setSelectedDataNum([]);
					// 	});
					// }else{
					// 	self.setSelectedDataNum([]);
					// }
					self.setSelectedDataNum([]);
				}else{
					ds.filter(filters);
					self.setSelectedDataNum([]);
				}

				if(viewName == "map"){
					if(layoutName == "registration" && self.registrationMapList) self.registrationMapList.selectTab(self.registrationMapList.selectedIndex, true, true);
					if(layoutName == "monitoring" && self.monitoringMapList) self.monitoringMapList.selectTab(Constants.REGISTRATION_STATUS_BUTTONS.REGISTER, true);
					//registration map list를 monitoring map view에서 재사용하는 Case
					if(layoutName == "monitoring" && self.registrationMapList){
						if(self.registrationMapList.element.is(":visible")) self.registrationMapList.selectTab(Constants.REGISTRATION_STATUS_BUTTONS.REGISTER, true);
					}
				}
			});
		},
		getStatisticData : function(buildingId, floorId){
			var self = this, deviceTypeKey = self.deviceTypeKey, dfd = new $.Deferred();
			if(buildingId == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID
				|| floorId === MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
				Api.getStatisticByKey(deviceTypeKey).done(function(resData){
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
		getDeviceData : function(e){
			var self = this;
			var viewName = e.viewName, widget = e.widget,
				registrationStatus = e.registrationStatus, page = e.page, size = e.size,
				isRefresh = e.isRefresh, thenCallback = e.thenCallback, deviceType = self.deviceTypeKey;

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

			var ajax = Api.getDeviceWithType(deviceType, [registrationStatus], pageOptions, null, self._getFilteredObj());

			if(thenCallback) ajax.then(thenCallback);

			return ajax;
		},
		_isPossibleScrolling : function(totalItemSize, currentItemSize, totalPageSize, currentPageSize){
			//아이템이 모두 로딩했는지 개수 및 페이지 체크
			if(totalItemSize <= currentItemSize) return false;

			if(totalPageSize < currentPageSize + 1) return false;

			//스크롤 중인지 체크
			if(self._isScrolling) return false;

			return true;
		},
		_appendPaginationData : function(grid, dataSource, paginationData){
			var self = this;
			var currentData = dataSource.data();
			var currentDataList = currentData.toJSON();
			var appendData = paginationData.data;
			var i, max = appendData.length;
			for( i = 0; i < max; i++ ){
				appendData[i].selected = false;
			}
			paginationData.data = currentDataList.concat(appendData);
			var newDs = self.createDataSource(paginationData, dataSource);
			grid.setDataSource(newDs);
		},
		scrollEndEvt : function(e){					//등록/모니터링 리스트 기기 스크롤 페이징(온더디멘드) 이벤트
			var self = this, ds = e.sender, pageSize = ds.pageSize();
			var total = ds.data().length, page = Math.ceil(total / DEFAULT_PAGE_SIZE),
				totalPage = ds.pagingTotalPage, totalSize = ds.pagingTotal;
			var grid = e.grid;	//현재 스크롤 엔드 이벤트가 발생한 Grid
			if(!self._isPossibleScrolling(totalSize, total, totalPage, page)) return;
			// console.log("[scroll end]total size : " + totalSize);
			// console.log("[scroll end] total page : " + totalPage);
			// console.log("[scroll end] current size : " + ds.data().length);
			// console.log("[scroll end] current page : " + page);
			self._isScrolling = true;
			self.loadingPanel.open();
			var currentViewInfo = self.getCurrentViewInfo();
			var viewName = currentViewInfo.dataViewName, registrationStatus = currentViewInfo.registrationStatus;
			self.getDeviceData({ page : page + 1,
				size : pageSize,
				viewName : viewName,
				registrationStatus : registrationStatus,
				widget : grid,
				thenCallback: function(data){
					self._appendPaginationData(grid, ds, data);
					//기기 표시 개수 업데이트
					var selectedData = grid.getSelectedData();
					self.setSelectedDataNum(selectedData);
					self.loadingPanel.close();
					self._isScrolling = false;
				}
			});
		},
		getRegisteredDeviceNum : function(){
			var self = this, deviceTypeKey = self.deviceTypeKey, currentViewInfo = self.getCurrentViewInfo();
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
				reqArr.push(Api.getDeviceWithType(deviceTypeKey, ["Registered"],
					{ typeQuery : { page : 1, size : 5 },
						mappedTypeQuery : { page : 1, size : 5}}, null, self._getFilteredObj()).done(function(data){
					registeredNum = data.total;
				}));
			}
			//Pagination API를 통해서 등록 기기 총합을 가져온다 mappedType까지 포함하여 호출한다.
			reqArr.push(Api.getDeviceWithType(deviceTypeKey, ["NotRegistered"], { typeQuery : { page : 1, size : 5 },
				mappedTypeQuery : { page : 1, size : 5}}, null, self._getFilteredObj()).done(function(data){
				unregisteredNum = data.total;
			}));

			return $.when.apply(this, reqArr).always(function(){
				self.setRegisteredNum(registeredNum, unregisteredNum);
			});
		},
		setRegisteredNum : function(registeredNum, unregisteredNum){
			var self = this, viewModel = self.viewModel;
			viewModel.registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.REGISTER].set("count", registeredNum);
			viewModel.registrationStatusButtons[Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER].set("count", unregisteredNum);
			if(self.registrationMapList){
				self.registrationMapList.tabViewModel[Constants.REGISTRATION_STATUS_BUTTONS.REGISTER].set("count", registeredNum);
				self.registrationMapList.tabViewModel[Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER].set("count", unregisteredNum);
			}
		},
		createDataSource : function(data, beforeDs){
			//페이지 네이션 데이터
			var self = this;
			var total, totalPage;
			if(data.data){
				total = data.total;
				totalPage = Math.ceil(total / DEFAULT_PAGE_SIZE);
				data = data.data;
			}
			if(typeof data.length == 'undefined'){
				data = [];
			}

			var ds = beforeDs;
			var filter = self.getCurrentFilter(), sort = ds.sort();

			//새로운 데이터 소스를 생성한다.
			var newDataSource = new kendo.data.DataSource({
				data : data,
				pageSize : DEFAULT_PAGE_SIZE
			});
			newDataSource.read();
			//선택 상태 동기화
			var selectedData = new kendo.data.Query(ds.data()).filter({ field : "selected", operator : "eq", value : true}).toArray();
			var item, i, max = selectedData.length;
			for( i = 0; i < max; i++ ){
				item = selectedData[i];
				item = newDataSource.get(item.id);
				if(item) item.selected = true;
			}

			//이전 데이터소스의 Filter 적용
			if(filter) newDataSource.filter(filter);

			//이전 데이터소스의 Sort 적용
			if(sort) newDataSource.sort(sort);

			newDataSource.bind("scrollend", self.scrollEndEvt.bind(self));

			newDataSource.pagingTotal = total;
			newDataSource.pagingTotalPage = totalPage;
			return newDataSource;
		},
		setSelectedDataNum : function(selectedData){
			var self = this, deviceTabPanel = self.deviceTabPanel;

			var isSelected = selectedData.length > 0 ? true : false;
			//선택 상태에 따라 Actions 버튼 활성화 또는 비활성화
			deviceTabPanel.setEnableActions(!isSelected);

			//선택 상태에 따라 전체 선택 버튼 텍스트 변경
			var selectAllBtn = self.getFilterViewModel(Constants.FILTER_NAME.SELECTALL);
			if(isSelected) selectAllBtn.set("text", Constants.TEXT.DESELECTALL);
			else selectAllBtn.set("text", Constants.TEXT.SELECTALL);

			//선택 개수 표시 업데이트
			var selectedTextVm = self.getActionViewModel(Constants.ACTION_NAME.SELECTEDTEXT);
			selectedTextVm.options.set("selectedText", DeviceUtil.calcScreenBySelect(selectedData, self.getTotalSize(), self.getDisplaySize()));
		},
		getTotalSize : function(){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName,
				widget = currentViewInfo.dataViewWidget, registrationStatus = currentViewInfo.registrationStatus;

			if(layoutName != "monitoring"){
				//등록
				if(viewName == "map"){
					if(registrationStatus == "Registered"){
						return widget.dataSource.data().length;
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
		getDisplaySize : function(){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName,
				widget = currentViewInfo.dataViewWidget, registrationStatus = currentViewInfo.registrationStatus;

			var ds = widget.dataSource;
			var registrationMapList = self.registrationMapList;
			var filter, data, query;

			if(layoutName != "monitoring"){
				if(viewName == "map" && registrationStatus == "NotRegistered"){
					//맵 뷰에서 미등록 기기 탭을 선택한 경우 미등록 기기 탭 리스트의 개수를 표시한다.
					if(registrationMapList){
						var unregisteredList = registrationMapList.tabGrids[Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER];
						return unregisteredList.dataSource.data().length;
					}
				}
			}
			filter = ds.filter();
			data = ds.data();
			query = new kendo.data.Query(data);
			if(filter){
				query = query.filter(filter);
			}
			query = query.toArray();
			return query.length;
		},
		onWidgetChangeSelection : function(e){
			var self = this;
			var widget = e.sender;
			var selectedData = widget.getSelectedData(), currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName;
			var registrationMapList = self.registrationMapList;

			var registerBtn = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			var blockBtn = self.getActionViewModel(Constants.ACTION_NAME.BLOCK);
			var deleteBtn = self.getActionViewModel(Constants.ACTION_NAME.DELETE);
			var detailBtn = self.getActionViewModel(Constants.ACTION_NAME.DETAIL);
			var viewBtn = self.getActionViewModel(Constants.ACTION_NAME.VIEW);

			var isSelected = selectedData.length > 0;

			//미등록 기기 탭에서 기기 선택 후 다시 Map에서 등록된 기기를 선택할 경우
			//미등록 기기 탭 리스트의 선택 상태를 초기화한다.
			if(isSelected && viewName === "map" && registrationMapList.selectedIndex == Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER){
				var unregisteredSelectedData = registrationMapList.getSelectedData();
				if(unregisteredSelectedData.length > 0){
					registrationMapList.unselectAll();
				}
			}

			self.setSelectedDataNum(selectedData);

			//Map + Unregistered 상태일 경우 Map에서 선택 시, 활성화하지 않는다.
			if(registrationMapList.selectedIndex == Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER &&
				layoutName == "registration" && viewName == "map"){
				registerBtn.options.set("disabled", true);
			}else{
				registerBtn.options.set("disabled", !isSelected);
			}
			if(blockBtn) blockBtn.options.set("disabled", !isSelected);

			if(deleteBtn) deleteBtn.options.set("disabled", !isSelected);

			detailBtn.options.set("disabled", !isSelected);

			if(viewBtn){
				if(selectedData.length == 1) viewBtn.options.set("disabled", !isSelected);
				else viewBtn.options.set("disabled", true);
			}

			self.onWidgetChangeRegistrationMapList(viewName, layoutName, selectedData);
			//if(indexView !== constants.VIEW["STATISTIC"] && isMonitoring) controlPanelData.setDataSource(selectedData);
		},
		onWidgetChangeRegistrationMapList : function(viewName, layoutName, selectedData){
			var self = this;
			var registrationMapList = self.registrationMapList;
			registrationMapList.unselectAll();
			if(viewName === "map" && layoutName != "monitoring"){
				registrationMapList.selectByData(selectedData);
			}
		},
		selectAll : function(){
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, viewName = currentViewInfo.dataViewName, widget = currentViewInfo.dataViewWidget;

			var selectedData;
			if(layoutName == "registration" && viewName == "map" && self.registrationMapList &&
				self.registrationMapList.selectedIndex == Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER){
				self.registrationMapList.selectAll();
				//선택한 맵 리스트에서 드래그 앤 드롭이 가능하도록 초기화
				self.registrationMapListElement.find('.map-panel-list-container .k-grid-content.no-header .device-map-panel-list-item').each(function(){
					self.initListDragDropEvt( { currentTarget : this });
				});
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
			//제어패널 setDatasource extend 필요
		},
		unselectAll : function(){
			var self = this, currentViewInfo = self.getCurrentViewInfo(), widget = currentViewInfo.dataViewWidget;

			widget.unselectAll();
			if(self.registrationMapList) self.registrationMapList.unselectAll();
			if(self.monitoringMapList) self.monitoringMapList.unselectAll();
			self.setSelectedDataNum([]);

			//제어패널 setDatasource extend 필요
		},
		getRegisterMapListOptions : function(){
			var self = this;
			var options = {
				dataSource : [],
				hasNewDataSource : false,
				hasSelectedModel : true,
				type : "hybrid",
				filterTab : [
					{
						template : "<span data-bind='text: name'></span><span>(<span data-bind='text: count'></span>)</span>",
						listStyle : "treeList",
						widgetOptions : { enableShiftSelection : true },
						listOptions : {
							column : {
								template : self._mapListRegisteredTabTemplate.bind(self),
								headerTemplate : MainWindow.getCurrentFloorName,
								groupHeaderTemplate : self._mapListGroupHeaderTemplate.bind(self)
							},
							group : [
								{ field : "locations[0].foundation_space_zones_id", aggregate : "count" }
							]
						}
					},
					{
						template : "<span data-bind='text: name'></span><span>(<span data-bind='text: count'></span>)</span>",
						hideHeader : true,
						widgetOptions : { scrollable : { virtual : true } },
						listOptions : {
							column : {
								template : Template.mapListRegTemplate
							},
							sort : [
								{ field : "name", dir : "asc" }
							]
						}
					}
				],
				tabViewModel : [
					{
						name : I18N.prop("FACILITY_DEVICE_REGISTERED"),
						click : function(){},
						count : 0
					},
					{
						name : I18N.prop("FACILITY_DEVICE_UNREGISTERED"),
						click : function(){},
						count : 0
					}
				],
				activateTab : self.activateRegistrationMapListTab.bind(self)
			};
			return options;
		},
		expandRegistrationMapListTab : function(e){
			var currentViewInfo = this.getCurrentViewInfo();
			//Map Widget
			var mapWidget = currentViewInfo.dataViewWidget;
			var ds = mapWidget.dataSource;
			var model = e.model;
			var mapList = e.sender;
			mapList.setDataSourceExpand(model, ds);
			return false;
		},
		activateRegistrationMapListTab : function(e){
			var index = e.index;
			var mapList = e.sender;
			var self = this, currentViewInfo = self.getCurrentViewInfo();
			var layoutName = currentViewInfo.innerLayoutName, mapWidget = currentViewInfo.dataViewWidget,
				registrationStatus = currentViewInfo.registrationStatus;

			var registerButton = self.getActionViewModel(Constants.ACTION_NAME.REGISTER);
			var ajax, dfd, data;
			self._isSelectingTab = true;
			self.loadingPanel.open();
			if(index == Constants.REGISTRATION_STATUS_BUTTONS.REGISTER){
				//등록 탭 클릭 시, 등록 버튼의 텍스트를 '등록해제'로 표시
				registerButton.set("text", Constants.TEXT["DEREGISTER"]);
				//등록 탭은 Map View에서 데이터를 가져와 등록 기기 리스트를 표시
				ajax = (function(){
					dfd = new $.Deferred();
					data = mapWidget.dataSource.data();
					dfd.resolve(data);
					return dfd.promise();
				})();
			}else if(index == Constants.REGISTRATION_STATUS_BUTTONS.UNREGISTER){
				//미등록 탭 클릭 시, 등록 버튼의 텍스트를 '등록'으로 표시
				registerButton.set("text", Constants.TEXT["REGISTER"]);
				//미등록 기기 리스트 표시
				ajax = self.getDeviceData({ viewName : "map", layoutName : layoutName,
					widget : mapList, registrationStatus : registrationStatus});
			}

			ajax.always(function(result){
				self._isSelectingTab = false;
				if(!result) return;

				//선택 상태 초기화
				self.unselectAll();
				var ds = mapList.dataSource;
				var newDs = self.createDataSource(result, ds);
				//false - 필터 적용을 유지한다. true - activateTab 이벤트를 Trigger 하지 않도록 한다.
				mapList.setDataSource(newDs, false, true);
				//현재 총 기기 개수, 표시 개수 텍스트 업데이트
				self.setSelectedDataNum([]);
				self.loadingPanel.close();
			});
		},
		onRegistrationMapListChangeSelection : function(e){
			var self = this, mapList = e.sender;
			var currentViewInfo = self.getCurrentViewInfo(), widget = currentViewInfo.dataViewWidget;
			var selectedData;
			//등록 기기 탭
			if(mapList.selectedIndex == Constants.REGISTRATION_STATUS_BUTTONS.REGISTER){
				//Map View의 아이템을 선택한다.
				selectedData = mapList.getSelectedData();
				widget.unselectAll();
				var i, item, max = selectedData.length;
				//Shift로 다수 개의 아이템을 Selection 할 Case 처리를 위하여 e.item이 아닌 현재 맵 우측 리스트에서 선택된 아이템을 Map에서 모두 선택
				for( i = 0; i < max; i++ ){
					item = selectedData[i];
					widget.selectDevice(item.id , item.selected);
				}
				//selectedData = widget.getSelectedData();
			//미등록 기기 탭
			}else{
				widget.unselectAll();
				selectedData = mapList.getSelectedData();
			}
			self.setSelectedDataNum(selectedData);
		},
		getMonitoringMapListOptions : function(){
			//it will be extended by service-asset-controller.
			return null;
		},
		_mapListRegisteredTabTemplate : function(data){
			var self = this;
			if(data.treeGroup) return self._mapListGroupHeaderTemplate(data);
			if(data.isDummy) return Template.mapListRegTemplate(data);
			var viewInfo = self.getCurrentViewInfo();
			return Template.mapListDualTemplate(data, viewInfo.innerLayoutName !== "monitoring");
		},
		_mapListGroupHeaderTemplate : function(data){
			var self = this;
			var ds = self.zoneDataSource;
			var zoneData = ds.data();
			var query, value, text = "-";
			value = data.value;
			query = new kendo.data.Query(zoneData).filter({ value : value, operator : "eq", field : "id" }).toArray();
			if(query.length) text = query[0].name;
			return text;
		},
		/*
			Map View List에서 Drag & Drop이 가능하도록 초기화한다.
		*/
		initListDragDropEvt : function(e){
			var self = this;
			var target = $(e.currentTarget);
			var registerMapList = this.registrationMapList;
			var selectedRows = registerMapList.select();
			var selectedData = registerMapList.getSelectedData();
			var deviceIcon = target.find(".detail-img");
			var registerMapWidget = self.registrationMapView.widget;
			registerMapWidget.deviceDragDrop({ selectedRows : selectedRows, deviceIconElem : deviceIcon, selectedData : selectedData });
			registerMapWidget.unbind("drop");
			registerMapWidget.bind("drop", self.dropEndDeviceEvt.bind(this));
		},
		dropEndDeviceEvt : function(e){
			var self = this, devices = e.devices;
			var deviceIcon = e.deviceIcon;
			self.loadingPanel.open();
			Api.patchDevices(devices).done(function(){
				//기기 데이터를 업데이트한다.
				self.refreshDeviceData(false).always(function(){
					// self.loadingPanel.close();
				});
			}).fail(function(xhq){
				self.loadingPanel.close();
				self.registrationMapView.widget._removeDeviceIcon(deviceIcon);
				var msg = DeviceUtil.getDeviceRegistrationFailMsg(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			});
		},
		dragEndDeviceEvt : function(e){
			var self = this, devices = e.devices;
			self.loadingPanel.open();
			Api.patchDevices(devices).done(function(){
				//기기 데이터를 업데이트한다.
				self.refreshDeviceData(false).always(function(){
					// self.loadingPanel.close();
				});
			}).fail(function(xhq){
				self.loadingPanel.close();
				var msg = DeviceUtil.getDeviceRegistrationFailMsg(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			});
		},
		setViewBtnEnabled : function(viewName, isEnabled){
			var self = this, viewBtnList = self.viewModel.viewButtons;
			var i, max = viewBtnList.length;
			for( i = 0; i < max; i++ ){
				if(viewBtnList[i].viewName == viewName){
					viewBtnList[i].set("disabled", !isEnabled);
					break;
				}
			}
		},
		getCurrentViewInfo : function(){
			var currentLayoutName = this.tabLayout.curInnerLayoutName;
			var result = {
				innerLayoutName : null,
				dataViewName : null,
				registrationStatus : null
			};
			result.innerLayoutName = currentLayoutName;
			result.dataViewName = this.deviceTabPanel.currentViewName;
			result.dataViewWidget = this.deviceTabPanel.currentWidget;

			if(result.innerLayoutName == "monitoring"){
				result.registrationStatus = "Registered";
			}else if(result.innerLayoutName == "registration"){
				if(result.dataViewName == "map"){
					var registrationMapList = this.registrationMapList;
					if(registrationMapList) result.registrationStatus = registrationMapList.selectedIndex === 0 ? "Registered" : "NotRegistered";
					else result.registrationStatus = "Registered";
				}else if(result.dataViewName == "list"){
					var registrationBtns = this.viewModel.registrationStatusButtons;
					var i, max = registrationBtns.length;
					for( i = 0; i < max; i++ ){
						if(registrationBtns[i].active) break;
					}
					if(i == 0) result.registrationStatus = "Registered";
					else if(i == 1) result.registrationStatus = "NotRegistered";
					else if(i == 2) result.registrationStatus = "Blocked";
				}
			}else if(result.innerLayoutName == "block"){
				result.registrationStatus = "Blocked";
			}
			return result;
		},
		getFilterWidget : function(filterName){
			var viewModel = this.getFilterViewModel(filterName);
			if(viewModel){
				var type = viewModel.type;
				var id = viewModel.id;
				var namespace = "";
				if(type == "dropdownlist") namespace = "kendoDropDownList";
				else if(type == "dropdowncheckbox") namespace = "kendoDropDownCheckBox";
				else if(type == "button") namespace = "kendoButton";
				else if(type == "combobox") namespace = "kendoCombobox";
				return $("#" + id).data(namespace);
			}
			return null;
		},
		getLayoutViewModel : function(layoutName){
			var self = this, innerLayout, innerLayouts = self.innerLayouts;
			var i, max = innerLayouts.length;
			for( i = 0; i < max; i++ ){
				innerLayout = innerLayouts[i];
				if(layoutName == innerLayout.layoutName){
					return innerLayout;
				}
			}
			return null;
		},
		getFilterViewModel : function(filterName){
			var self = this, viewModel = self.viewModel, filters = viewModel.filters;
			return self._getFilterOrAction(filterName, filters);
		},
		getActionViewModel : function(actionName){
			var self = this, viewModel = self.viewModel, actions = viewModel.actions;
			return self._getFilterOrAction(actionName, actions);
		},
		_getFilterOrAction : function(name, viewModelList){
			var i, max = viewModelList.length;
			for( i = 0; i < max; i++ ){
				if(viewModelList[i].name == name){
					return viewModelList[i];
				}
			}
			return null;
		},
		_getFilteredObj : function () {
			var self = this;
			//현재 filter의 정보를 추출
			var typeFilter = self.typeFilter && self.typeFilter[0], statusFilter = self.statusFilter,
				modeFilter = self.modeFilter && self.modeFilter[0], zoneFilter = self.zoneFilter, value;

			typeFilter = typeFilter && typeFilter.filters && typeFilter.filters[0] || typeFilter;

			var filteredType = typeFilter ? typeFilter.value : null, filteredStatuses = [],
				filteredMode = modeFilter ? modeFilter : {}, filteredZones = [],
				filteredDeviceName = self.viewModel.searchFieldValue || null;

			statusFilter.forEach(function(item){
				value = item.filters ? item.filters[0].value : item.value;
				if (value !== 'none') filteredStatuses.push(value);
			});
			zoneFilter.forEach(function(item) {
				filteredZones.push(item.value != "undefined" ? item.value : 0);
			});
			return {type: filteredType, statuses: filteredStatuses, mode: filteredMode, zones : filteredZones, name : filteredDeviceName};
		},
		destroy : function(){
			var self = this;
			self.zoneDataSource = new kendo.data.DataSource({ data : [] });
			clearInterval(self.refreshInterval);
			clearTimeout(self.refreshTimeout);
		}
	});

	return BaseController;
});
//# sourceURL=device/common/controller/base-controller.js
