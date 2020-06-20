define("hmi/hmi-canvas", ["hmi/hmi-common", "hmi/hmi-api", "hmi/hmi-util", "hmi/config/popup-config",
	"hmi/config/rappid-canvas"], function(HmiCommon, HmiApi, HmiUtil, PopupConfig, RappidCanvas){
	var kendo = window.kendo, moment = window.moment;
	var Util = window.Util;
	var I18N = window.I18N;
	var Mousetrap = window.Mousetrap;
	var confirmDialog = PopupConfig.confirmDialog, msgDialog = PopupConfig.msgDialog,
		refreshConfirmDialog = PopupConfig.refreshConfirmDialog;
	var CanvasClass = RappidCanvas.RappidCanvas;

	var Howl = window.Howl;
	var Loading = HmiUtil.Loading;
	var localStorage = window.localStorage;

	var POLLING_TIME = 5000;

	var legendTemplate = function(isEditable) {
		var monitoringLegend = "<li>" +
				"<i class='ic ic-device-on'></i>" + I18N.prop("HMI_LEGEND_DEVICE_ON") +
			"</li>" +
			"<li>" +
				"<i class='ic ic-device-off'></i>" + I18N.prop("HMI_LEGEND_DEVICE_OFF") +
			"</li>" +
			"<li>" +
				"<i class='ic ic-critical'></i>" + I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL") +
			"</li>" +
			"<li class='vertical'>" +
				"<i class='ic ic-warning'></i>" + I18N.prop("FACILITY_DEVICE_STATUS_WARNING") +
			"</li>" +
			"<li>" +
				"<i class='ic ic-very-bad'></i>" + I18N.prop("HMI_LEGEND_VERY_BAD") +
			"</li>" +
			"<li>" +
				"<i class='ic ic-bad'></i>" + I18N.prop("HMI_LEGEND_BAD") +
			"</li>" +
			"<li>" +
				"<i class='ic ic-normal'></i>" + I18N.prop("HMI_LEGEND_NORMAL") +
			"</li>" +
			"<li class='vertical'>" +
				"<i class='ic ic-good'></i>" + I18N.prop("HMI_LEGEND_GOOD") +
			"</li>" +
			"<li>" +
				"<i class='ic ic-connected-contact'></i>" + I18N.prop("HMI_LEGEND_CONNECTED_CONTACT") +
			"</li>" +
			"<li>" +
				"<i class='ic ic-disconnected-contact'></i>" + I18N.prop("HMI_LEGEND_DISCONNECTED_CONTACT") +
			"</li>";

		var editLegend = "<li>" +
				"<i class='ic ic-warning'></i>" + I18N.prop("HMI_BINDING_ERROR") +
			"</li>";

		var template = "<div class='hmi-legend-wrapper'>" +
			"<i class='ic ic-help'></i>" +
			I18N.prop("COMMON_LEGEND") +
			"<div class='hmi-legend'>" +
				"<ul class='hmi-legend-list'>" +
					(isEditable ? editLegend : monitoringLegend) +
				"</ul>" +
			"</div>" +
		"</div>";

		return template;
	};

	var HmiCanvas = kendo.Class.extend({
		options : {
			canvasClass : CanvasClass,
			soundPlayerClass : Howl,
			wrapper : null,
			createView : null,
			editable : false,
			width : HmiCommon.DEFAULT_CANVAS_WIDTH,
			height : HmiCommon.DEFAULT_CANVAS_HEIGHT
		},
		init : function(element, options){
			var that = this;
			that.options = $.extend(true, {}, that.options, options);
			that.element = $(element);
			var id = $(that.element).attr("id");
			if(!id){
				id = "hmi-canvas-" + kendo.guid();
				that.element.attr("id", id);
			}
			that.isEditable = that.options.editable;
			that.createView = that.options.createView;
			that.wrapper = that.options.wrapper;
			that.noGraphicWrapper = that.wrapper.find('.hmi-no-graphic-wrapper');
			that.width = that.options.width;
			that.height = that.options.height;
			var CanvasClass = that.options.canvasClass;
			that.options.baseCanvas = that;
			that.canvas = new CanvasClass(that.element, id, that.options);

			//fileList에 접근하여 파일의 sortOrder 정보를 얻어오기 위하여 변수 할당.
			var fileListEl = $(".hmi-monitoring-file-control-wrapper .hmi-monitoring-file-list");
			that.fileList = fileListEl.data("kendoHmiFileList");

			// localStorage에 캔버스를 등록한다
			var localStorageHmiCanvas = localStorage.getItem('hmiCanvas') || '{}';
			localStorageHmiCanvas = JSON.parse(localStorageHmiCanvas);
			localStorageHmiCanvas[id] = {};
			localStorage.setItem('hmiCanvas', JSON.stringify(localStorageHmiCanvas));
			//this.onResize();

			that.wrapper.append(kendo.template(legendTemplate(that.isEditable)));
			that.legend = that.wrapper.find('.hmi-legend-wrapper');

			if (!that.isEditable) that.hide();
		},
		attachBeforeUnloadEvt : function(){
			var that = this;
			var createView = that.createView;
			window.onbeforeunload = function(e){
				if(!createView._isSaved) return false;
			};
		},
		detachBeforeUnloadEvt : function(){
			window.onbeforeunload = null;
		},
		load : function(fileName, data){
			var that = this;
			that.stopPolling();
			HmiCommon.SoundPlayer.stop();
			that.canvas.clear();
			that.canvas.setBackground(null);
			if(that.isEditable) {
				that.attachBeforeUnloadEvt();
				that.canvas.attachKeyboardEvt();
			}
			//this.onResize();
			that.canvas.isCreate = false;
			that.canvas.load(fileName, data);
			var graphicDeviceInfo = that.getGraphicDeviceInfo();
			if(!that.isEditable){
				//그래픽 파일 정보를 수집하고 Polling을 시작한다.
				var cntBindingObjects = graphicDeviceInfo.cntBindingObjects;
				//var isPushBtnPresent = graphicDeviceInfo.isPushBtnPresent;
				//if(cntBindingObjects == 1 && isPushBtnPresent){
				//	that.stopPolling();
				if (cntBindingObjects  > 0) {
					// if there is a mapped object then start polling or else not required
					that.startPolling();
				} else {
					that.stopPolling();
				}
			}else{	//편집 모드에서 1회 업데이트한다.
				graphicDeviceInfo = that.getGraphicDeviceInfo();
				that.pollingEvt();
			}
		},
		//생성
		create : function(){
			var that = this;
			var innerCanvas = that.canvas;
			that.stopPolling();
			HmiCommon.SoundPlayer.stop();
			innerCanvas.clear();
			innerCanvas.setBackground(null);
			innerCanvas.isCreate = true;
			if(that.isEditable) {
				that.attachBeforeUnloadEvt();
				innerCanvas.attachKeyboardEvt();
			}
		},
		save : function(fileId, fileName){
			var that = this, ajax, dfd = new $.Deferred(), fileList = that.fileList;
			confirmDialog.message(I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_SAVE"));
			confirmDialog.setConfirmActions({
				yes : function(){
					Loading.open();
					that.canvas.save().done(function(data){
						//생성 후 탭이 생성되므로 file ID는 항상 존재한다.
						if(fileId) ajax = fileList.apiPutFile({ id : fileId, name : fileName }, data);
						else console.error("no file id to save.");
						//else ajax = HmiApi.postFile(fileName, data);

						ajax.done(function(resultFile){
							if(that.canvas.isCreate){
								//생성 후 한번은 저장 시도 하였음.
								that.canvas.isCreate = false;
								require(["hmi/hmi-create"], function(HmiCreate){
									HmiCreate.setGraphicFileInfo(data, resultFile);
								});
							}
							dfd.resolve();
						}).fail(function(msg){
							if(msg.indexOf("41332") != -1){
								msg = I18N.prop("HMI_DUPLICATED_FILE_NAME", fileName);
							}
							msgDialog.message(msg);
							msgDialog.open();
							dfd.reject();
						}).always(function(){
							Loading.close();
						});
						//저장 후 편집 모드 유지
						/*require(["hmi/hmi-create"], function(HmiCreate){
							HmiCreate.close();
						});*/
					});
				},
				no : function(){}
			});
			confirmDialog.open();
			return dfd.promise();
		},
		setBackground : function(source){
			this.canvas.setBackground(source);
		},
		import : function(file){
			var dfd = new $.Deferred();
			this.canvas.import(file).done(function(){
				dfd.resolve();
			}).fail(function(){
				dfd.reject();
			});
			return dfd.promise();
		},
		export : function(fileName){
			this.canvas.export(fileName);
		},
		clear : function(){
			this.canvas.clear();
		},
		getColor : function(button){
			return this.canvas.getColor(button.name);
		},
		changeColor : function(button, color){
			this.canvas.changeColor(button.name, color);
		},
		createbasicShape : function(value){
			this.canvas.createbasicShape(value);
		},
		textAlign : function(value){
			this.canvas.textAlign(value);
		},
		setLineWidth : function(size){
			this.canvas.setLineWidth(size);
		},
		onResize : function(){
			var that = this;
			var width = that.element.width(), height = that.element.height();
			that.canvas.setDimension(width, height);
		},
		onDrop : function(e){
			var that = this;
			that.canvas.onDrop(e);
		},
		onPaletteDoubleClick : function(e){
			var that = this;
			that.canvas.onPaletteDoubleClick(e);
		},
		onPaletteClick : function(e){
			var that = this;
			that.canvas.onPaletteClick(e);
		},
		hasGraphicElements : function(){
			var that = this;
			var lines = that.canvas.lines;
			var figures = that.canvas.figures;
			return (lines.getSize() > 0 || figures.getSize() > 0);
		},
		getToolbarButtonDisabledState : function(){
			var that = this;
			return that.canvas.getToolbarButtonDisabledState();
		},
		getGraphicDeviceInfo : function(){
			var that = this;
			var graphicDeviceInfo = that.canvas.getGraphicDeviceInfo();
			that.graphicDeviceInfo = graphicDeviceInfo;
			return graphicDeviceInfo;
		},
		startPolling : function(withoutFirstRequest){
			var that = this;
			that.stopPolling();
			if(withoutFirstRequest){	//요소 제어 시, 폴링 주기를 Refresh 할 때의 처리
				that.pollingInterval = setInterval(that.pollingEvt.bind(that), POLLING_TIME);
			}else{
				Loading.open();
				that.pollingEvt().done(function(){
					that.pollingInterval = setInterval(that.pollingEvt.bind(that), POLLING_TIME);
					Loading.close();
				});
			}
		},
		stopPolling : function(){
			var that = this;
			clearInterval(that.pollingInterval);
		},
		pollingEvt : function(){
			var dfd = new $.Deferred();
			var that = this;
			var graphicDeviceInfo = that.graphicDeviceInfo;
			var deviceIds = graphicDeviceInfo.ids;
			if (deviceIds.length > 0) {
				HmiApi.getDevicesForPolling(deviceIds).done(function(devices){
					that.canvas.updateCanvasInPolling(devices);
				}).always(function(){
					dfd.resolve();
				});
			} else {
				dfd.resolve();
			}

			//00시에 10초 후 Refresh 하겠다는 Confirm Popup 표시
			//취소 버튼 클릭 시 유지
			//취소 버튼 클릭 후 00시가 아니면 다시 00시에 Confirm Popup을 표시하도록 Flag 값 변경
			//1회만 Open되게 하기 위하여 localStorage 사용
			var m = moment();
			var h = m.hour();

			var isRefreshConfirmOpened = window.localStorage.getItem("hmiRefreshConfirmOpened");
			if(h == HmiCommon.REFRESH_CONFIRM_HOURS &&
				(isRefreshConfirmOpened === null || isRefreshConfirmOpened == "false")){
				window.localStorage.setItem("hmiRefreshConfirmOpened", true);
				refreshConfirmDialog.message(I18N.prop("HMI_REFRESH_CONFIRM_MSG"));
				refreshConfirmDialog.setConfirmActions({
					yes : function(){},
					no : function(){
						clearTimeout(that._refreshConfirmTimeout);
					}
				});
				refreshConfirmDialog.open();
				that._refreshConfirmTimeout = setTimeout(function(){
					window.location.reload(true);
				}, HmiCommon.REFRESH_CONFIRM_TIMEOUT);
			}else if(h != HmiCommon.REFRESH_CONFIRM_HOURS && isRefreshConfirmOpened == "true"){
				window.localStorage.setItem("hmiRefreshConfirmOpened", false);
			}

			return dfd.promise();
		},
		// 탭이 비활성화 되었을때 localStorage에 graph 정보를 저장, 활성화 되었을때 localStorage에서 graph정보를 가져와서 import함
		changeToBackground : function(isBackground) {
			var hmiCanvas;
			var canvas = this.canvas;
			var graphJSON;
			var id = $(this.element).attr("id");
			canvas._isBackground = isBackground;

			hmiCanvas = localStorage.getItem('hmiCanvas') || '{}';
			hmiCanvas = JSON.parse(hmiCanvas);
			if (isBackground) {
				graphJSON = canvas.graph.toJSON();
				hmiCanvas[id] = graphJSON;
				localStorage.setItem('hmiCanvas', JSON.stringify(hmiCanvas));
			} else {
				graphJSON = hmiCanvas[id];
				canvas.graph.fromJSON(graphJSON);
				if (this.isEditable) {
					var cm = canvas.commandManager;
					this.createView.updateUndoRedoButtonState(cm.hasUndo(), cm.hasRedo());
					canvas.attachKeyboardEvt();
				}
			}
		},
		hasModels : function() {
			var innerCanvas = this.canvas;
			if (!innerCanvas.graph) return false;
			var models = innerCanvas.graph.getCells();
			if (models.length == 0) return false;
			return true;
		},
		setZoomLevel : function(level) {
			var innerCanvas = this.canvas;
			if (!innerCanvas.graph) return false;
			innerCanvas.setZoomLevel(level);
		},
		panningScroll : function() {
			var innerCanvas = this.canvas;
			innerCanvas.panningScroll();
		},
		canvasCenterAlign : function(dir) {
			if (!dir) dir = "x";
			this.canvas.canvasCenterAlign(dir);
		},
		hide : function(){
			this.noGraphicWrapper.show();
			this.canvas.hide();
			this.legend.hide();
		},
		show : function(){
			this.noGraphicWrapper.hide();
			this.canvas.show();
			this.legend.show();
		},
		destroy : function(){
			var that = this;
			HmiCommon.SoundPlayer.stop();
			that.stopPolling();
		}
	});

	return HmiCanvas;
});
//# sourceURL=hmi/hmi-canvas.js
