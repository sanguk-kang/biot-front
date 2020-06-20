define("hmi/view-model/hmi-vm", ["device/common/device-constants", "device/common/device-api", "hmi/model/hmi-model", "hmi/view-model/base-vm",
	"hmi/config/popup-config", "hmi/hmi-common", "hmi/hmi-util", "hmi/hmi-api", "hmi/hmi-canvas"],
function(DeviceConstants, DeviceApi, HmiModel, BaseViewModel, PopupConfig, HmiCommon, HmiUtil, HmiApi, HmiCanvas){

	var kendo = window.kendo;
	var I18N = window.I18N, Util = window.Util, Session = window.Session;
	var LoadingPanel = window.CommonLoadingPanel, Loading = new LoadingPanel();
	var toastPopup = HmiCommon.toastPopup;
	var msgDialog = PopupConfig.msgDialog, confirmDialog = PopupConfig.confirmDialog, folderDeleteConfirmDialog = PopupConfig.folderDeleteConfirmDialog;
	var BaseClass = BaseViewModel.BaseViewModelClass;
	var detailDialog = PopupConfig.monitoringDetailPopup, bindingDetailPopup = PopupConfig.bindingDetailPoup;
	var userRole = Session.getUserRole();
	var Cookie = window.Cookies;

	var FILE_TAB_INDEX = 0;
	var CONTROL_TAB_INDEX = 1;

	var ToolbarButton = function(config){
		return BaseViewModel.extendConfig(BaseViewModel.ToolbarButtonConfig, config);
	};

	var monitoringViewModelClass = BaseClass.extend({
		viewModel : {
			filters : [
				BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig, {
					id : "hmi-file-select",
					name : "file",
					optionLabel : I18N.prop("HMI_SELECT_FILE"),
					popupClass : "hmi-file-select"
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-monitoring-fullscreen",
					name : "fullscreen",
					text : I18N.prop("COMMON_FULL_SCREEN")
				})
			],
			actions : [
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-create-btn",
					name : "create",
					text : I18N.prop("COMMON_BTN_CREATE")
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-edit-btn",
					name : "edit",
					text : I18N.prop("COMMON_BTN_EDIT"),
					disabled : true
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-delete-btn",
					name : "delete",
					text : I18N.prop("COMMON_BTN_DELETE"),
					disabled : true
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-detail-btn",
					name : "detail",
					text : I18N.prop("COMMON_BTN_DETAIL"),
					disabled : true
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-fold-btn",
					name : "fold",
					text : '',
					disabled : true
				})
			],
			buttons : [
				ToolbarButton({ id : "hmi-tool-fullscreen", name : "fullscreen", cssClass : "ic-map-full-screen", disabled : false, title : I18N.prop("COMMON_FULL_SCREEN") }),
				ToolbarButton({ id : "hmi-tool-zoomin", name : "zoomin", cssClass : "ic-map-zoom-in", disabled : true, title : I18N.prop("HMI_TOOLBAR_ZOOM_IN") }),
				ToolbarButton({ id : "hmi-tool-zoomout", name : "zoomout", cssClass : "ic-map-zoom-out", disabled : true, title : I18N.prop("HMI_TOOLBAR_ZOOM_OUT") }),
				ToolbarButton({ id : "hmi-tool-defaultzoom", name : "defaultzoom", cssClass : "ic-map-default-zoom", disabled : true, title : I18N.prop("HMI_DEFAULT_ZOOM") })
			]
		},
		init : function(element){
			var that = this;
			this._isInit = true;
			BaseClass.fn.init.call(that, element);
			that.initFileListAndControlPanel(element);
			that.getGraphicFiles().always(function(){
				that.initCanvas();
				that.attachToolbarEvt();
				var currentTabInfo = that.tab.getCurrentTabCanvasInfo();
				that.setCanvasInfo(currentTabInfo);
				that.setCanvasInfoCurrentTab(currentTabInfo);
				//HMI 메뉴 진입 시, 파일이 존재할 경우 첫번째 파일을 Open한다.
				var fileList = that.fileList;
				var files = fileList.getFiles();
				//Cookie에서 파일리스트 펼침 정보를 가져옴.
				var expandedData = Cookie.get(HmiCommon.DEFAULT_COOKIE_FILE_LIST_KEY);
				expandedData = HmiUtil.parseCookieDataToExpandInfo(expandedData, true);
				that.fileList.setExpandedData(expandedData);

				HmiApi.getUserSettings().done(function(data){
					if (data.panelFolded) that.trigger("click", "fold");
					if (data.activeTab.id) {
						that.setUserSettings(data);
					} else if(files.length > 0){
						//개인 저장 정보가 없을 경우 빈 탭 표시.
						// that.fileList.select(files[0], true);
						that._isInit = false;
					}
				}).fail(function(msg){
					msgDialog.message(msg);
					msgDialog.open();
				});
			});
		},
		initFileListAndControlPanel : function(element){
			var that = this;
			that.panelElement = element = $('.hmi-monitoring-file-control-wrapper');
			that.initFileControlTab(element);
			that.panelElement.show();
			that.initFileList(element);
			that.initControlPanel(element);
		},
		initFileControlTab : function(element){
			var that = this;
			var tabElement = $(element).find(".hmi-monitoring-file-control-tab");
			that.fileControlTab = tabElement.kendoCommonTabStrip({ isTopMenu : false, useScrollButton : false }).data("kendoCommonTabStrip");
			that.fileControlTab.activateTab(tabElement.find(".k-first"));
			that.fileControlTab.disableTab(CONTROL_TAB_INDEX, true);
		},
		initControlPanel : function(element){
			var that = this;
			var controlPanelElement = $(element).find(".hmi-monitoring-control");
			that.controlTab = controlPanelElement.kendoControlTab({ change : that._changeControlPanelEvt.bind(that) }).data("kendoControlTab");
			var expandCollapseEvt = that.expandCollapseControlEvt.bind(that);
			that.controlTab.bind("expand",expandCollapseEvt);
			that.controlTab.bind("collapse",expandCollapseEvt);
			that.controlPanelTimer = [];

			//Control Panel은 DOM에 접근하여 접/펼침 동작을 하므로 초기화 하면서 set 한다.
			var expandedData = Cookie.get(HmiCommon.DEFAULT_COOKIE_CONTROL_PANEL_KEY);
			expandedData = HmiUtil.parseCookieDataToExpandInfo(expandedData);
			that.controlTab.setExpandedData(expandedData);
		},
		_changeControlPanelEvt : function(e){
			var that = this, item = e.item, index = e.index, subIndex = e.subIndex, mode = e.mode;
			var deferreds = [];
			var controlSet = DeviceConstants.controlSet[index];
			if(typeof subIndex !== "undefined"){
				controlSet = controlSet[subIndex];
				index = (index * 10) + subIndex;
			}
			var timer = that.controlPanelTimer;
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

			var selectedData = that.getSelectedIndoorDevices();
			// [BIOTFE-802][FE][디바이스] 제어패널 제어시 제어내용을 곧 바로 Frontend에 반영 필요 -> PANEL_REFRESH_TIME 변경 (10초 -> 1초)
			timer[index] = setTimeout(function(){
				var i, id, put, length = selectedData.length;
				if(length === 1){
					id = selectedData[0].id;
					deferreds.push(DeviceApi.patchGroupAttr(id, controlSet["apiName"], send));
				}else{
					put = {};
					put["dms_devices_ids"] = [];
					put["control"] = {};
					put["control"][controlSet["apiName"]] = send;

					for(i = 0; i < length; i++){
						put["dms_devices_ids"].push(selectedData[i].id);
					}

					deferreds.push(DeviceApi.multiControl(put));
				}

				$.when.apply($, deferreds).always(function(){});
			}, DeviceConstants.TIME_OUT);
		},
		getSelectedIndoorDevices : function(e){
			var that = this, hmiCanvas = that.canvas, rappidCanvas = hmiCanvas.canvas;
			return rappidCanvas.getSelectedIndoorDevices();
		},
		//Monitoring Canvas에서 실내기 클릭 시, 호출됨.
		onSelectIndoorDevice : function(e){
			var that = this;
			var devices = e.items;
			var element = that.element;
			var isFold = that.panelFolded;
			//제어패널 업데이트
			that.controlTab.setDataSource(devices);

			//클릭하여 선택된 기기와 선택된 전체 디바이스
			//제어패널 탭이 활성화되어있지 않으면 활성화
			that.fileControlTab.activateTabFromIndex(CONTROL_TAB_INDEX);
			if (isFold) element.removeClass('fold');

			//선택된 디바이스가 존재하지 않을 경우 파일 탭 활성화
			if(devices.length < 1){
				that.fileControlTab.activateTabFromIndex(FILE_TAB_INDEX);
				that.fileControlTab.disableTab(CONTROL_TAB_INDEX, true);
				if (isFold) element.addClass('fold');
			}else{
				that.fileControlTab.disableTab(CONTROL_TAB_INDEX, false);
			}
		},
		initFileList : function(element){
			var that = this;
			var fileListElement = $(element).find(".hmi-monitoring-file-list");
			that.fileList = fileListElement.kendoHmiFileList().data("kendoHmiFileList");
			that.fileList.bind("change", that.changeTreeList.bind(that));
			that.fileList.bind("edit", that.clickEditBtnEvt.bind(that));
			that.fileList.bind("delete", that.clickDeleteBtnEvt.bind(that));
			that.fileList.bind("detail", that.clickDetailBtnEvt.bind(that));
			that.fileList.bind("create", that.createFileTreeListEvt.bind(that));
			that.fileList.bind("dragend", that.dragEndTreeListEvt.bind(that));
			var expandCollapseEvt = that.expandCollapseFileListEvt.bind(that);
			that.fileList.bind("expand", expandCollapseEvt);
			that.fileList.bind("collapse", expandCollapseEvt);
		},
		getGraphicFiles : function(){
			var that = this;
			Loading.open();
			return HmiApi.getFiles().done(function(files){
				if(files.length < 1 && (userRole != "Manager")){
					msgDialog.message(I18N.prop("HMI_NO_GRAPHICS"));
					msgDialog.open();
				}

				that.fileList.setDataSource(HmiModel.createTreeDataSource(files));
				Loading.close();

				if(that.canvas){
					//파일을 선택한 상태이어서 이미 로딩 중인 파일이 있을 경우 Refresh
					if(that.loadedGraphicId && that.loadedGraphicName != I18N.prop("HMI_EMPTY_TAB")){
						var ds = that.fileList.treeList.dataSource;
						var loadedFile = ds.get(that.loadedGraphicId);
						if(loadedFile) that.fileList.select(loadedFile, true);
					}
				}
			}).fail(function(msg){
				msgDialog.message(msg);
				msgDialog.open();
			});
		},
		setUserSettings : function(data) {
			var that = this;
			var openedTab = $.extend(true, [], data.openedTab);
			var deferred = [];
			var tab;
			var len = 0;
			Loading.open();
			that._isAddTabWithFile = true;
			openedTab.forEach(function(item){
				deferred.push(HmiApi.getFile(item.id));
				len++;
			});
			if (len == 0) {
				Loading.close();
				that._isInit = false;
				that._isAddTabWithFile = false;
				return;
			}
			$.when.apply(that, deferred).done(function(){
				var closeBtn = $(that.tab.scrollbar.scrollArea[0]).find('.ic-close').eq(0);
				closeBtn.trigger('click');
				if (len > 1) {
					$.each(arguments, function(idx, file){
						if (typeof file != 'object') return;
						if (Array.isArray(file)) file = file[0];
						tab = openedTab[idx];
						that.tab.addTab(tab.name, tab.id, tab.zoomLevel);
						that.canvas.load(tab.name, file);
						that.canvas.setZoomLevel(tab.zoomLevel);
					});
				} else if (len == 1){
					tab = openedTab[0];
					that.tab.addTab(tab.name, tab.id, tab.zoomLevel);
					that.canvas.load(tab.name, arguments[0]);
					that.canvas.setZoomLevel(tab.zoomLevel);
				}
				that.tab.selectById(data.activeTab.id);
				that.fileList.selectById(data.activeTab.id);
				that._isInit = false;
				that._isAddTabWithFile = false;
			}).fail(function(msg){
				that._isInit = false;
				that._isAddTabWithFile = false;
				that.checkNoFileError(msg);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		initCanvas: function(){
			var that = this;
			var currentTabIndex = that.tab.getCurrentTabIndex();
			var canvasElement = that.element.find(".hmi-monitoring-canvas").eq(currentTabIndex);
			// var canvasWrapper = canvasElement.closest(".hmi-content-view");
			var canvasWrapper = canvasElement.closest(".hmi-monitoring-canvas-wrapper");
			that.canvas = new HmiCanvas(canvasElement, { editable : false, createView : that, wrapper : canvasWrapper });
		},
		attachEvent : function(){
			var that = this;

			var fileDropDownList = that.getFilterViewModel("file");
			fileDropDownList.set("select", that.selectFileDropDownListEvt.bind(that));
			fileDropDownList.set("open", that.openFileDropDownListEvt.bind(that));

			var fullScreenBtn = that.getFilterViewModel("fullscreen");
			fullScreenBtn.set("click", that.clickFullScreenBtnEvt.bind(that));

			var createBtn = that.getActionViewModel("create");
			createBtn.set("click", that.clickCreateBtnEvt.bind(that));
			createBtn.set("disabled", userRole == "Manager");

			detailDialog.bind("onSaved", that.detailDialogSaveEvt.bind(that));
			detailDialog.bind("onDeleted", that.clickDeleteBtnEvt.bind(that));
			detailDialog.element.on("click", ".ic-info.binding", that.clickDetailBindingEvt.bind(that));
		},
		attachToolbarEvt : function(){
			var that = this;
			var button = that.getToolbarViewModel("fullscreen");
			button.set("click", that.clickFullScreenBtnEvt.bind(that));

			button = that.getToolbarViewModel("zoomin");
			button.set("click", function(){
				var hmiCanvas = that.canvas;
				var canvas = hmiCanvas.canvas;
				canvas.zoomIn();
			});

			button = that.getToolbarViewModel("zoomout");
			button.set("click", function(){
				var hmiCanvas = that.canvas;
				var canvas = hmiCanvas.canvas;
				canvas.zoomOut();
			});

			button = that.getToolbarViewModel("defaultzoom");
			button.set("click", function(){
				var hmiCanvas = that.canvas;
				var canvas = hmiCanvas.canvas;
				canvas.defaultZoom();
				that.canvasCenterAlign("all");
			});
		},
		getToolbarViewModel : function(name){
			var that = this;
			var button, buttons = that.viewModel.buttons;
			var i, length;
			length = buttons.length;
			for ( i = 0; i < length; i++ ){
				button = buttons[i];
				if (button.name == name) return button;
			}
		},
		clickFullScreenBtnEvt : function(e){
			var that = this;
			that.setFullScreen(!that._isFullScreen);
		},
		setFullScreen : function(isEnabled){
			var that = this;
			that._isFullScreen = isEnabled;
			if(isEnabled){
				that.element.addClass("full-screen");
			}else{
				that.element.removeClass("full-screen");
			}
			if (that.canvas) that.canvas.canvasCenterAlign("all");
		},
		refreshToolbarBtnState : function(){
			var that = this;
			var button = that.getToolbarViewModel("zoomin");
			button.set("disabled", !that.isAbleZoom("zoomin"));

			button = that.getToolbarViewModel("zoomout");
			button.set("disabled", !that.isAbleZoom("zoomout"));

			button = that.getToolbarViewModel("defaultzoom");
			button.set("disabled", !that.isAbleZoom("defaultzoom"));
		},
		isAbleZoom : function(type){
			if (!this.isSelectedFile()) return false;
			var canvas = this.canvas.canvas;
			var zoomLevel = canvas.getZoomLevel();
			if (type == "zoomin") {
				return HmiCommon.DEFAULT_MAX_ZOOM_LEVEL > zoomLevel;
			} else if (type == "zoomout") {
				return HmiCommon.DEFAULT_MIN_ZOOM_LEVEL < zoomLevel;
			} else if (type == "defaultzoom") {
				return true;
			}
			return false;
		},
		isSelectedFile : function(){
			var id = this.loadedGraphicId;
			if (typeof id !== "undefined" && !(typeof id == "string" && id.indexOf(HmiCommon.DEFAULT_EMPTY_TAB_PREFIX) != -1)) return true;
			return false;
		},
		clickCreateBtnEvt : function(e){
			var that = this;
			HmiCommon.SoundPlayer.stop();
			that.stopPolling();
			that.trigger("click", "create", e);
		},
		clickEditBtnEvt : function(e){
			var that = this;
			var data = e.item;
			if(data){
				if(data.isFolder){
					//폴더 편집 완료 시 콜백, API 호출 처리
					that.editFolderEvt(e);
				}else{
					var fileId = data.id;
					HmiCommon.SoundPlayer.stop();
					that.stopPolling();
					that.trigger("click", "edit", { id : fileId, file : data});
				}
			}
		},
		clickDeleteBtnEvt : function(e){
			var that = this, detailDialogResult = e.result;
			var data = e.item, isFile = !data.isFolder;
			var deleteEvt = that.deleteFile.bind(that, data, detailDialogResult, false);
			var onlyFolderDeleteEvt = that.deleteFile.bind(that, data, detailDialogResult, true);
			var confirm;
			if(isFile){
				confirm = confirmDialog;
				confirm.message(I18N.prop("HMI_FILE_DELETE_POPUP"));
				confirm.setConfirmActions({ yes : deleteEvt });
			}else{
				confirm = folderDeleteConfirmDialog;
				confirm.message(I18N.prop("HMI_CONFIRM_DELETE_FOLDER"));
				confirm.setActions(1, { action : onlyFolderDeleteEvt });
				confirm.setActions(2, { action : deleteEvt });
			}
			confirm.open();
		},
		deleteFile : function(data, result, isOnlyFolder){
			var that = this, fileList = that.fileList;
			Loading.open();
			fileList.apiDeleteFile(data, isOnlyFolder).done(function(msg){
				that.selectFileDropDownListEvt({ dataItem : { id : null, name : null } });
				that.resetCurrentTab();
				if(result) detailDialog.close();
				msgDialog.message(msg);
				msgDialog.open();
			}).fail(function(msg){
				that.checkNoFileError(msg);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		clickDetailBtnEvt : function(e){
			var fileObj = e.item;
			//var graphicDeviceInfo = that.canvas.graphicDeviceInfo;
			Loading.open();
			HmiApi.getFile(fileObj.id).done(function(data){
				var cells = data.cells ? data.cells : [];
				var info = HmiUtil.getGraphicDeviceInfo(cells);
				if(fileObj instanceof kendo.data.ObservableObject){
					fileObj = fileObj.toJSON();
				}
				var detailData = $.extend(true, {}, fileObj);
				detailData.graphicDeviceInfo = info;
				detailDialog.setDataSource([detailData]);
				detailDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		clickDetailBindingEvt : function(e){
			var detailData = detailDialog.getSelectedData();
			var devices = detailData.graphicDeviceInfo.devices;
			if(devices instanceof kendo.data.ObservableArray){
				devices = devices.toJSON();
			}
			bindingDetailPopup.setDataSource(devices);
			bindingDetailPopup.open();
		},
		detailDialogSaveEvt : function(e){
			var that = this, result = e.result, sender = e.sender;
			var id = result.id, name = result.name;
			Loading.open();
			var fileList = that.fileList;
			var ds = fileList.treeList.dataSource;
			if(name) name = $.trim(name);
			HmiApi.patchFile({id : id, name : name}).done(function(){
				sender.success();
				var fileItem = ds.get(id);
				if(fileItem) fileItem.set("name", name);
				toastPopup.show(I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"));
			}).fail(function(msg){
				that.checkNoFileError(msg);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		changeTreeList : function(e){
			var that = this;
			var item = e.item;

			//폴더가 아니고 파일인지 체크
			if(item.isFolder) return;

			//더블 클릭 인지 체크
			if(e.isDoubleClick){
				var tab = that.tab.getTabLiById(item.id);
				if (tab) {
					that.selectFileDropDownListEvt({ dataItem : item });
					return;
				}
				that._isAddTabWithFile = true;
				if (!that.tab.addTab()){
					toastPopup.show(I18N.prop('HMI_TAB_MAX_REACHED'));
					that._isAddTabWithFile = false;
					return;
				}
				that._isAddTabWithFile = false;
			}
			that.selectFileDropDownListEvt({ dataItem : item });
		},
		createFileTreeListEvt : function(e){
			//파일 생성의 경우 생성 후 이동
			var that = this, item = e.item;
			Loading.open();
			that.fileList.apiPostFile(item).done(function(resultFile){
				//파일 생성의 경우 생성 후 이동
				if(!resultFile.isFolder){
					//var newId = HmiCommon.DEFAULT_EMPTY_TAB_PREFIX + '0';
					//Name 대신 file로 객체로 변경 필요
					var newCanvasInfo = {id: resultFile.id, name : resultFile.name, file : resultFile, isNew : true};
					that.clickCreateBtnEvt(newCanvasInfo);
				}
			}).fail(function(msg){
				that.checkNoFileError(msg);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		editFolderEvt : function(e){
			var item = e.item;
			Loading.open();
			return HmiApi.patchFile(item).done(function(res){
				e.success();
			}).fail(function(msg){
				e.fail();
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		dragEndTreeListEvt : function(e){
			var that = this, fileList = that.fileList;
			//var source = e.source, target = e.target, orderedItems = e.orderedItems;
			Loading.open();
			fileList.apiPatchReOredredFiles().done(function(){

			}).fail(function(msg){
				that.checkNoFileError(msg);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		afterTabOrderChangeEvt : function(){
			this.putUserSettings();
		},
		beforeTabChangeEvt : function(e) {
			BaseClass.fn.beforeTabChangeEvt.call(this, e);
		},
		afterTabChangeEvt : function(e) {
			BaseClass.fn.afterTabChangeEvt.call(this, e);
			var canvasInfo = this.tab.getCurrentTabCanvasInfo();
			if (!this._isAddTabWithFile) {
				var id = canvasInfo.id;
				if (typeof id == 'string' && id.indexOf('empty') != -1) {
					this.fileList.treeList.clearSelection();
					this.fileList.editButton.prop('disabled', true);
					this.fileList.deleteButton.prop('disabled', true);
				} else {
					this.fileList.selectById(id);
				}
			}
			this.refreshToolbarBtnState();
			if (this.canvas) this.canvas.panningScroll();
			this.putUserSettings();
		},
		addedTabEvt : function(canvasInfo){
			BaseClass.fn.addedTabEvt.call(this, canvasInfo);
			if (!this._isAddTabWithFile) {
				this.fileList.treeList.clearSelection();
				this.fileList.editButton.prop('disabled', true);
				this.fileList.deleteButton.prop('disabled', true);
			} else {
				this.canvas.show();
				this.refreshToolbarBtnState();
			}
		},
		deletedTabEvt : function(id, isCurrentTab){
			BaseClass.fn.deletedTabEvt.call(this, id, isCurrentTab);
			if (!isCurrentTab) this.putUserSettings();
		},
		resetCurrentTab : function(){
			var that = this;
			var tab = that.tab;
			// 현재 탭 정보 제거
			var currentTabInfo = tab.getCurrentTabCanvasInfo();
			that.removeTabCanvasInfo(currentTabInfo.id);

			// 새 빈탭 정보 입력
			var newTabId = tab.getEmptyId();
			var newTabInfo = {id: newTabId, name: I18N.prop("HMI_EMPTY_TAB")};
			that.canvas.clear();
			that.canvas.hide();
			that.setCanvasInfo(newTabInfo);
			that.setCanvasInfoCurrentTab(newTabInfo);
			that.refreshToolbarBtnState();

			// 파일리스트 선택 해제
			that.fileList.treeList.clearSelection();
			// 삭제버튼 비활성화
			that.fileList.editButton.prop('disabled', true);
			that.fileList.deleteButton.prop('disabled', true);
		},
		selectFileDropDownListEvt : function(e){
			var that = this;
			var id = e.dataItem.id;
			var name = e.dataItem.name;
			var zoomLevel = e.dataItem.zoomLevel || 100;
			var isDisabled = (id === "" || id === null || typeof id === "undefined") ? true : false;
			var editBtn = that.getActionViewModel("edit");
			if(userRole == "Manager") editBtn.set("disabled", true);
			else editBtn.set("disabled", isDisabled);

			var deleteBtn = that.getActionViewModel("delete");
			if(userRole == "Manager") deleteBtn.set("disabled", true);
			else deleteBtn.set("disabled", isDisabled);

			var detailBtn = that.getActionViewModel("detail");
			detailBtn.set("disabled", isDisabled);

			if (id === null && name === null) return;

			var tab = that.tab.getTabLiById(id);
			if (tab) {
				that.tab.selectById($(tab).data('id'));
			} else {
				that._isChangeTab = true;
				var currentId = that.loadedGraphicId;
				that.removeTabCanvasInfo(currentId);
				var canvasInfo = {id: id, name: name, zoomLevel: zoomLevel};
				that.tab.setCurrentTabCanvasInfo(canvasInfo);
				that.setCanvasInfo(canvasInfo);
				that.canvas.show();
				that.canvas.clear();
				that.loadedGraphicId = id;
				that.loadedGraphicName = name;
				if(!isDisabled) that.getFile(id, name);
				that.refreshToolbarBtnState();
				that.putUserSettings();
				that._isChangeTab = false;
			}
		},
		putUserSettings : function() {
			if (this._isInit) return;
			var that = this;
			var openedTabInfo = that.tab.getCurrentOpenedTabInfo();
			HmiApi.putUserSettings({panelFolded : that.panelFolded, tabInfo : openedTabInfo});
		},
		onHyperLinkClickEvt : function(e) {
			var that = this;
			that.fileList.selectById(e.id);
			that.selectFileDropDownListEvt({dataItem: e});
		},
		openFileDropDownListEvt : function(e){
			var that = this;
			var sender = e.sender;
			var canvas = that.canvas;
			var canvasElement = canvas.element;
			var canvasWrapper = canvasElement.closest(".hmi-content-view");
			var OPTION_LABEL_HEIGHT = 36;
			var LIST_MARGIN_TOP = 10;
			//var wrapper = sender.wrapper;
			var height = canvasWrapper.height();
			sender.setOptions({ height : height });
			//sender.popup.element.height(height);
			sender.popup.element.css("max-height", height);
			//sender.list.height(height);
			sender.list.css("max-height", height);
			var scroller = sender.list.find(".k-list-scroller");
			//scroller.height(height);
			scroller.css("max-height", height - OPTION_LABEL_HEIGHT - LIST_MARGIN_TOP);
			scroller.css("height", "auto");
			//sender.ul.height(height);
			sender.ul.css("height", "auto");
		},
		getFile : function(id, fileName){
			var that = this;
			Loading.open();
			HmiApi.getFile(id).done(function(data){
				that.canvas.clear();
				that.canvas.load(fileName, data);
			}).fail(function(msg){
				that.checkNoFileError(msg);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		startPolling : function(){
			var tabCanvasInfo = this._tabCanvasInfo;
			var canvasInfo, canvas;
			var graphicDeviceInfo;
			var cntBindingObjects;
			for (var id in tabCanvasInfo) {
				canvasInfo = tabCanvasInfo[id];
				canvas = canvasInfo.canvas;
				if (!canvas) continue;
				canvas.stopPolling();
				graphicDeviceInfo = canvas.getGraphicDeviceInfo();
				if (!canvas.isEditable){
					cntBindingObjects = graphicDeviceInfo.cntBindingObjects;
					if (cntBindingObjects > 0){
						canvas.startPolling();
					} else {
						canvas.stopPolling();
					}
				}
			}
		},
		stopPolling : function(){
			var tabCanvasInfo = this._tabCanvasInfo;
			var canvasInfo, canvas;
			for (var id in tabCanvasInfo) {
				canvasInfo = tabCanvasInfo[id];
				canvas = canvasInfo.canvas;
				if (canvas) canvas.stopPolling();
			}
		},
		canvasCenterAlign : function(dir) {
			if (!dir) dir = "x";
			var canvas = this.canvas;
			if (!canvas) return;
			canvas.canvasCenterAlign(dir);
		},
		panelFoldEvt : function(isFold) {
			this.panelFolded = isFold;
			// this.canvasCenterAlign('x');
			this.putUserSettings();
		},
		checkNoFileError : function(msg) {
			if (msg.indexOf(I18N.prop('HMI_NOT_EXIST_FILE_ERROR')) != -1) { //존재하지 않는 파일일 때 빈탭으로 표시하도록
				this.resetCurrentTab();
				this.putUserSettings();
			}
		},
		hide : function(){
			this.canvas && this.canvas.clear();
			this.element.hide();
			this.tab.hide();
			this.panelElement.hide();
		},
		show : function(graphicFileId, graphicFileName, isNew){
			var that = this;
			that.getGraphicFiles().always(function(){
				that.element.show();
				that.tab.show();
				that.panelElement.show();
				if (that.isSelectedFile()) {
					var fileList = that.fileList;
					var fileDataSource = fileList.treeList.dataSource;
					var prevFile;
					if (!fileDataSource.get(graphicFileId) && isNew) {
						prevFile = fileList.getRecentSelectedFile();
						graphicFileId = prevFile.id;
						graphicFileName = prevFile.name;
					}
					if (that.loadedGraphicId == graphicFileId){
						that.getFile(graphicFileId, graphicFileName);
					} else if (typeof graphicFileId == "string" && graphicFileId.indexOf(HmiCommon.DEFAULT_EMPTY_TAB_PREFIX) != -1) {
						that.getFile(that.loadedGraphicId, that.loadedGraphicName);
					} else {
						that.fileList.selectById(graphicFileId);
						that.selectFileDropDownListEvt({dataItem: {id: graphicFileId, name: graphicFileName}});
					}
				}
				//Cookie에서 파일리스트 펼침 정보를 가져옴.
				var expandedData = Cookie.get(HmiCommon.DEFAULT_COOKIE_FILE_LIST_KEY);
				expandedData = HmiUtil.parseCookieDataToExpandInfo(expandedData, true);
				that.fileList.setExpandedData(expandedData);

				that.startPolling();
			});
		},
		clear : function(){
			this.canvas.clear();
		},
		expandCollapseControlEvt : function(e){
			//제어패널이 접히고 펼쳐질 때 접기/펴기 상태를 얻는다.
			//해당 상태를 쿠키에 저장한다.
			//Set 사용은 이 콜백 함수아 아니고인스턴스 Initialize 후에 최초에 1회  쿠키에 저장된 데이터로 Set 한다.
			var data = e.expandedData;
			data = HmiUtil.convertExpandInfoToCookieData(data);
			var key = HmiCommon.DEFAULT_COOKIE_CONTROL_PANEL_KEY;
			Cookie.set(key, data);
			//var sender = e.sender;
			//sender.setExpandedData(data);
		},
		expandCollapseFileListEvt : function(e){
			//파일리스트의 폴더가 접히고 펼쳐질 때 접기/펴기 상태를 얻는다.
			//해당 상태를 쿠키에 저장한다.
			//Set 사용은 이 콜백 함수아 아니고인스턴스 Initialize 후에 최초에 1회  쿠키에 저장된 데이터로 Set 한다.
			var data = e.expandedData;
			data = HmiUtil.convertExpandInfoToCookieData(data);
			var key = HmiCommon.DEFAULT_COOKIE_FILE_LIST_KEY;
			Cookie.set(key, data);
			//var sender = e.sender;
			//sender.setExpandedData(data);
		},
		setCurrentTabZoomLevel : function(level) {
			BaseClass.fn.setCurrentTabZoomLevel.call(this, level);
			if (!this._isChangeTab) this.putUserSettings();
		}
	});

	return {
		ViewModelClass : monitoringViewModelClass
	};
});
//# sourceURL=hmi/view-model/hmi-vm.js
