define("hmi/config/popup-config", ["hmi/hmi-common", "hmi/hmi-util", "hmi/hmi-api", "hmi/model/hmi-model"], function(HmiCommon, HmiUtil, HmiApi, HmiModel){
	"use strict";

	var I18N = window.I18N, kendo = window.kendo, draw2d = window.draw2d;
	var Util = window.Util;
	var moment = window.moment;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	var HEADER_CHECKBOX_TEMPALTE = '<input type="checkbox" id="grid-header-chkbox" class="k-checkbox grid-header-checkbox"><label class="k-checkbox-label grid-header-checkbox-label" for="grid-header-chkbox"></label>';
	var DIALOG_CONTENT_TEMPLATE = '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>';
	var TABLE_INSERT_DIALOG_CONTENT_TEMPLATE = "<div class='detail-dialog-content device-dialog-content'>" +
											"<div class='hmi-table-insert-dialog-row'>" +
												"<div class='hmi-table-insert-dialog-col'>" + I18N.prop("HMI_TABLE_COL_NUMBER") + "</div>" +
												"<div class='hmi-table-insert-dialog-col'><input data-role='numerictextbox' data-bind='events:{change : changeCol, spin : changeCol }, value : col' type='number' min='1' max='" + HmiCommon.DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT + "' data-format='n0' class='hmi-table-spin-numeric'/></div>" +
											"</div>" +
											"<div class='hmi-table-insert-dialog-row'>" +
												"<div class='hmi-table-insert-dialog-col'>" + I18N.prop("HMI_TABLE_ROW_NUMBER") + "</div>" +
												"<div class='hmi-table-insert-dialog-col'><input data-role='numerictextbox' data-bind='events:{change : changeRow, spin : changeRow }, value : row' type='number' min='1' max='" + HmiCommon.DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT + "' data-format='n0' class='hmi-table-spin-numeric'/></div>" +
											"</div>" +
											"<div class='detail-dialog-detail-content'></div>" +
										"</div>";

	var msgDialog, msgDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");
	var confirmDialog, confirmDialogElem = $("<div/>");
	confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");
	var refreshConfirmDialog, refreshConfirmDialogElem = $("<div/>");
	refreshConfirmDialog = refreshConfirmDialogElem.kendoCommonDialog({
		type : "confirm"
	}).data("kendoCommonDialog");
	refreshConfirmDialog.setActions(0, {
		text : I18N.prop("COMMON_BTN_CANCEL")
	});
	refreshConfirmDialog.setActions(1, {
		text : I18N.prop("COMMON_BTN_OK")
	});
	var folderDeleteConfirmDialog, folderDeleteConfirmDialogElem = $("<div/>");
	folderDeleteConfirmDialog = folderDeleteConfirmDialogElem.kendoCommonDialog({
		type : "confirm",
		actions : [{
			text : I18N.prop("COMMON_BTN_CLOSE"),
			action : function(e){ e.sender.close(); }
		}, {
			text : I18N.prop("HMI_CONFIRM_FOLDER_ONLY"),
			action : function(e){ e.sender.close(); }
		}, {
			text : I18N.prop("HMI_CONFIRM_FOLDER_AND_CONTENTS"),
			action : function(e){ e.sender.close(); }
		}]
	}).data("kendoCommonDialog");

	function commonCloseBtnEvt(e){
		e.sender.trigger("onClose");
		if(e.sender.isEditable){
			e.sender.setEditable(false);
		}
		//e.sender.close();
		e.sender.trigger("onClosed");
	}

	function commonDeleteBtnEvt(e){
		var data = e.sender.getSelectedData();
		var result = {};
		result.id = data.id;
		e.sender.trigger("onDeleted", { result : result, item : result });
		return false;
	}

	function commonEditBtnEvt(e){
		e.sender.trigger("onEdit");
		e.sender.setEditable(true);
		e.sender.setActions(e.sender.BTN.DELETE, { visible : false });
		e.sender.trigger("onEdited");
		return false;
	}

	function commonCancelBtnEvt(e){
		e.sender.confirmDialog
			.message(I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_CANEL"));

		var cancel = function(){
			e.sender.trigger("onCancel");
			e.sender.cancelDataSource();
			e.sender.setEditable(false);
			e.sender.setDialogType(e.sender.dialogType);
			e.sender.hideInvalidMessage();
			e.sender.hideRemoveBtn();
			e.sender.trigger("onCanceled");
		};

		if(e.sender.hasChanged){
			e.sender.confirmDialog.setConfirmActions({
				yes : function(){
					cancel();
				}
			});
			e.sender.confirmDialog.open();

		}else{
			cancel();
		}

		return false;
	}

	function commonSaveBtnEvt(e){
		e.sender.trigger("onSave");
		var editFields = e.sender.editFields;

		//저장 시, Text Field의 값을 trim
		if(editFields && editFields.name){
			var nameField = editFields.name;
			var name = nameField.val();
			if(name) nameField.val($.trim(name));
		}
		//save trigger save with selected data
		var result;
		result = e.sender.save();
		if(!result){
			return false;
		}
		e.sender.trigger("onSaved", { sender : e.sender, result : result });
		e.sender.setActions(e.sender.BTN.DELETE, { visible : true });
		e.sender.setEditable(false);
		if(monitoringDetailTooltip) monitoringDetailTooltip.refresh();
		return false;
	}

	function hyperLinkSaveBtnEvt(e){
		var selectedData = e.sender.getSelectedData();
		var data = selectedData.toJSON();
		e.sender.trigger("onSaved", { sender : e.sender, result : data });
		e.sender.close();
		msgDialog.message(I18N.prop("COMMON_MESSAGE_NOTI_SAVED"));
		msgDialog.open();
		return false;
	}

	var defaultGridOptions = {
		height: "100%",
		scrollable: false,
		sortable: false,
		filterable: false,
		pageable: false,
		rowHeaders: true
	};

	//표 삽입 시, Confirm Popup
	var tableInsertConfig = {
		title : I18N.prop("HMI_TABLE_INSERT"),
		width : 400,
		height : 270,
		isCustomActions : true,
		buttonsIndex : {
			CLOSE : 0,
			SAVE : 1
		},
		contentTemplate : TABLE_INSERT_DIALOG_CONTENT_TEMPLATE,
		//detailContentTemplate : "",
		//headerTemplate : "<span><span/>",
		contentViewModel : {
			row : 1,
			col : 1,
			changeCol : function(e){
				/*var value = e.sender.value;
				e.sender.value()
				this.set("col", value);*/
			},
			changeRow : function(e){
				/*var value = e.sender.value;
				this.set("row", value);*/
			}
		},
		onTypeChange : function(e){
			var element = e.sender.element;
			element.on("keyup", ".hmi-table-spin-numeric[data-role='numerictextbox']", function(){
				var self = $(this);
				var numeric = self.data("kendoNumericTextBox");
				var max = numeric.options.max;
				var min = numeric.options.min;
				var value = self.val();
				value = Number(value);
				if(value > max){
					self.val(max);
				}else if(value < min){
					self.val(min);
				}
			});
		},
		actions : [
			{text : I18N.prop("COMMON_BTN_CANCEL"),visible : true ,action : commonCloseBtnEvt},
			{text : I18N.prop("HMI_INSERT"),visible : true, action : function(e){
				var sender = e.sender;
				var viewModel = sender.contentViewModel;
				var result = {
					row : viewModel.get("row"),
					col : viewModel.get("col")
				};
				e.sender.setActions(e.sender.BTN.SAVE, { visible : true });
				e.sender.trigger("onSaved", { sender : e.sender, result : result });
			}}
		]
	};

	var monitoringDetailConfig = {
		title : I18N.prop("COMMON_BTN_DETAIL"),
		width: 652,
		height: 830,
		buttonsIndex : {
			CLOSE : 0,
			EDIT: 1,
			CANCEL : 2,
			SAVE : 3,
			DELETE : 4
		},
		contentViewModel : {
			detailType : I18N.prop("COMMON_GENERAL")
		},
		contentTemplate : DIALOG_CONTENT_TEMPLATE,
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		headerTemplate : "<span class='hmi-monitoring-detail-file-name' data-bind='text:name, attr:{title:name}'></span>",
		isCustomActions : true,
		actions : [
			{text : I18N.prop("COMMON_BTN_CLOSE"),visible : true ,action : commonCloseBtnEvt},
			{text : I18N.prop("COMMON_BTN_EDIT"),visible : true, action : commonEditBtnEvt},
			{text : I18N.prop("COMMON_BTN_CANCEL"),visible : false, action : commonCancelBtnEvt},
			{text : I18N.prop("COMMON_BTN_SAVE"),visible : false, action : commonSaveBtnEvt},
			{text : I18N.prop("COMMON_BTN_DELETE"),visible : true, action : commonDeleteBtnEvt}
		],
		scheme : {
			id : "id",
			groupName : {
				detailProperties : {
					template: "<div class='group'>" + I18N.prop("HMI_DETAIL_PROPERTY") + "</div>"
				}
			},
			fields : {
				name : {
					type : "text",
					name : I18N.prop("HMI_FILE_NAME"),
					editCss : { width : "100%" },
					validator : { type : "hmiGraphicName", required : true },
					hasInputRemoveBtn : true,
					editable : true
				},
				createdDate : {
					type : "text",
					name : I18N.prop("HMI_CREATE_DATE"),
					template : function(data){
						var m = moment(data.createdDate);
						return m.format("LLL").replace(/\./g, "-");
					}
				},
				detailInfo : {
					groupName : "detailProperties",
					type : "grid",
					name : "",
					valueFieldDisplayType : "row",
					gridDataSource : function(data){
						//data.
						var graphicInfo = data.graphicDeviceInfo;
						var list = [
							{ indicator : I18N.prop("COMMON_TOTAL"), count : graphicInfo.totalFiguresSize, limit : 600 },
							{ indicator : I18N.prop("HMI_VECTOR_GRAPHICS"), count : graphicInfo.cntVectorGraphicObjects, limit : 600 },
							{ indicator : I18N.prop("HMI_GROUP_SHAPES"), count : graphicInfo.cntGroupedObjects, limit : 70 },
							{ indicator : I18N.prop("HMI_ROTATED_OBJECTS"), count : graphicInfo.cntRotatedObjects, limit : 100 },
							{ indicator : I18N.prop("HMI_BINDING_OBJECTS"), count : graphicInfo.cntBindingObjects, limit : 70, detail : true }
						];
						return list;
					},
					gridOptions : $.extend({}, true, defaultGridOptions, {
						columns : [
							{ title : I18N.prop("HMI_PERFORMANCE_INDICATOR"), field : "indicator", width : "43%" },
							{ title : I18N.prop("HMI_COUNT"), field : "count", width : "43%" },
							//{ title : I18N.prop("HMI_SUGGESTED_LIMIT"), field : "limit", width : "20%"}, 제약 수량 삭제 v1.1
							{ title : " ", field : "detail", template : function(data){
								if(data.detail) return "<span class='ic ic-info binding'><span>";
								return "";
							}, width : 30}
						]
					})
				}
			}
		},
		onTypeChange : function(e){
			if(monitoringDetailTooltip) monitoringDetailTooltip.refresh();
		}
	};

	var bindingDetailConfig = {
		title : I18N.prop("HMI_BINDING_OBJECTS"), //Date
		width: 820,
		height: 830,
		isOnlyMulti : true,
		hasDetail : false,
		gridOptions : $.extend({}, true, defaultGridOptions, {
			scrollable : true,
			columns : [
				{ field : "type", title : I18N.prop("HMI_INPUT_OUTPUT_TYPE"), width : "33.3%", template : function(data){
					var isNotRegistered = HmiUtil.isInvalidDevice(data) ? "invalid-device" : "";
					return "<span class='" + isNotRegistered + "'>" + data.type + "</span>";
				}},
				{ field : "name", title : I18N.prop("HMI_NAME"), width : "33.3%", template : function(data){
					var isNotRegistered = HmiUtil.isInvalidDevice(data) ? "invalid-device" : "";
					return "<span class='" + isNotRegistered + "'>" + data.name + "</span>";
				} },
				{ field : "mappedType", title : I18N.prop("FACILITY_DEVICE_TYPE_ALL"), width : "33.3%", template : function(data){
					var isNotRegistered = HmiUtil.isInvalidDevice(data) ? "invalid-device" : "";
					var text = "-";
					if(HmiUtil.isControlPointType(data.type)){
						text = Util.getDetailDisplayTypeDeviceI18N(data.mappedType);
					}else{
						text = HmiUtil.getI18NIndoorType(data);
					}
					return "<span class='" + isNotRegistered + "'>" + text + "</span>";
				} }
			]
		}),
		buttonsIndex : {
			CLOSE : 0
		},
		contentTemplate : DIALOG_CONTENT_TEMPLATE,
		//detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		//listTemplate : function(data){ return data; },
		headerTemplate : '<span>' + I18N.prop("COMMON_TOTAL") + ': <span>#=count#</span></span>',
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				disabled : false,
				action : commonCloseBtnEvt
			}
		]
	};

	var hyperLinkPopupConfig = {
		title : I18N.prop("HMI_HYPER_LINK"),
		width: 654,
		height: 826,
		buttonsIndex : {
			CLOSE : 0,
			SAVE : 1
		},
		isCustomActions : true,
		actions : [
			{text : I18N.prop("COMMON_BTN_CLOSE"),visible : true ,action : commonCloseBtnEvt},
			{text : I18N.prop("COMMON_BTN_SAVE"),visible : true, action : hyperLinkSaveBtnEvt}
		],
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="hmi-hyperlink-popup">' +
			'<div class="title">' + I18N.prop("HMI_FILE_LIST") + '</div>' +
			'<div class="file-list-wrapper"><div class="hmi-hyperlink-file-list"></div></div>' +
			'<div class="title">' + I18N.prop("HMI_SELECTED_FILE") + '</div>' +
			'<div class="content" data-bind="text : file.name"></div>' +
			'</div>',
		contentViewModel : {
			file : {
				name : "-"
			}
		},
		onTypeChange : function(e){
			var popup = e.sender;
			var BTN = e.sender.BTN;
			popup.setEditable(true);
			popup.setActions(BTN.SAVE, { visible : true });
			popup.setActions(BTN.CLOSE, { visible : true });
			var element = popup.element;
			var currentData = popup.getSelectedData();
			var contentViewModel = popup.contentViewModel;
			contentViewModel.file.set("name", currentData.name);

			var fileListEl = element.find(".hmi-hyperlink-file-list");
			if(!fileListEl.data("kendoHmiFileList")){
				popup.fileList = fileListEl.kendoHmiFileList({
					searchable : false,
					creatable : false,
					editable : false,
					deletable : false,
					treeListOptions : {
						isOnlyChildrenSelectable : true,
						editable : false
					}
				}).data("kendoHmiFileList");
				popup.fileList.bind("change", function(evt){
					var item = evt.item;
					contentViewModel.file.set("name", item.name);
					var data = popup.getSelectedData();
					data.id = item.id;
					data.name = item.name;
					if(data.isFolder) popup.disableSaveBtn();
					else popup.enableSaveBtn();
				});
			}

			Loading.open(popup.element);
			HmiApi.getFiles().done(function(files){
				popup.fileList.setDataSource(HmiModel.createTreeDataSource(files));
				//선택 상태로 만든다.
				if(currentData){
					var id = currentData.id;
					var ds = popup.fileList.treeList.dataSource;
					var item = ds.get(id);
					if(item) popup.fileList.select(item, true);
				}
			}).always(function(){
				Loading.close();
			});
		}
	};

	var monitoringDetailPopup, monitoringDetailPopupElem = $("<div id='hmi-monitoring-detail-popup'/>");
	monitoringDetailPopup = monitoringDetailPopupElem.kendoDetailDialog(monitoringDetailConfig).data("kendoDetailDialog");
	var monitoringDetailTooltip = monitoringDetailPopupElem.kendoTooltip({
		filter : ".detail-dialog-header",
		wrapperCssClass : "hmi-palette-tooltip",
		content : function(e){
			var target = e.target;
			var fileNameEl = target.find("span.hmi-monitoring-detail-file-name");
			return fileNameEl.attr("title");
		},
		position : "bottom"
	}).data("kendoToolTip");

	var bindingDetailPopup, bindingDetailPopupElem = $("<div id='hmi-monitoring-binding-detail-popup'/>");
	bindingDetailPopup = bindingDetailPopupElem.kendoDetailDialog(bindingDetailConfig).data("kendoDetailDialog");

	var tableInsertDialog, tableInsertDialogElem = $("<div class='hmi-table-insert-confirm-popup'/>");
	tableInsertDialog = tableInsertDialogElem.kendoDetailDialog(tableInsertConfig).data("kendoDetailDialog");

	var hyperLinkDialog, hyperLinkDialogElem = $("<div class='hmi-hyperlink-detail-popup'></div>");
	hyperLinkDialog = hyperLinkDialogElem.kendoDetailDialog(hyperLinkPopupConfig).data("kendoDetailDialog");

	var HmiPopupConfig = {
		msgDialog : msgDialog,
		confirmDialog : confirmDialog,
		refreshConfirmDialog : refreshConfirmDialog,
		tableInsertDialog : tableInsertDialog,
		monitoringDetailPopup : monitoringDetailPopup,
		bindingDetailPoup : bindingDetailPopup,
		hyperLinkPopup : hyperLinkDialog,
		folderDeleteConfirmDialog : folderDeleteConfirmDialog
	};
	window.HmiPopupConfig = HmiPopupConfig;
	return HmiPopupConfig;
});
//# sourceURL=hmi/config/popup-config.js
