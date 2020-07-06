define("history/trendlog/config/popup-config", ["history/trendlog/config/trendlog-template",
	"history/trendlog/trendlog-util",
	"history/trendlog/trendlog-model"
], function(TrendlogTemplate, TrendlogUtil, Model){
	var I18N = window.I18N;
	// var MainWindow = window.MAIN_WINDOW;				//[2018-04-12][선언후 미사용 변수 주석처리]
	var Util = window.Util;
	// var Settings = window.GlobalSettings;			//[2018-04-12][선언후 미사용 변수 주석처리]
	// var LoadingPanel = window.CommonLoadingPanel;	//[2018-04-12][선언후 미사용 변수 주석처리]
	var moment = window.moment;
	// var Loading = new LoadingPanel();				//[2018-04-12][선언후 미사용 변수 주석처리]
	var confirmDialogElem = $("<div/>");
	var confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");

	var trendlogCreatePopup, trendlogCreatePopupElem = $("#popup-create-trendlog");
	var trendlogAddPopup, trendlogAddPopupElem = $("#popup-add-trendlog");
	var trendlogSingleDetailPopup, trendlogSingleDetailPopupElem = $("#popup-detail-single-trendlog");
	var trendlogMultiDetailPopup, trendlogMultiDetailPopupElem = $("#popup-detail-multi-trendlog");
	var trendlogHistoryPopup, trendlogHistoryPopupElem = $("#popup-history-single-trendlog");
	var trendlogDetailPopup, trendlogDetailPopupElem = $("#trendlog-detail-popup");

	var trendlogCreateScheme = {
		id: "id",
		fields : {}
	};
	var trendlogCreatePopupConfig = {
		title : I18N.prop("FACILITY_TRENDLOG_CREATE_NEW_TRENDLOG"),
		width: 1260,
		height: 800,
		isOnlyMulti : false,
		buttonsIndex : {
			CLOSE : 0,
			SAVE : 1,
			EDITSAVE : 2
		},
		headerTemplate : "",
		contentTemplate : "<div class='detail-dialog-content'>" +
							"<div id='trendlog-trendlogname-box' class='trendlog-create-header'>" +
								 "<div class='tbc' style='width:210px;'>" +
									"<span class='btxt textBlock'>" +
										I18N.prop("FACILITY_TRENDLOG_NAME") +
									"</span>" +
								 "</div>" +
								 "<div class='tbc'>" +
									 "<div class='blockFrm'>" +
										"<input type='text' style='color:black;' id='trendlog-name-input' editmode='hide' class='popup-input k-input common-validator textInput' data-role='commonvalidator'>" +
									 "</div>" +
								 "</div>" +
							"</div>" +
							"<div id='trendlog-loginterval-box' class='trendlog-create-header trendlog-edit-box'>" +
								"<div id='log-interval-wrapper' style='width:210px; float:left;'>" +
									 "<span class='btxt textBlock'>" +
										I18N.prop("FACILITY_TRENDLOG_LOG_INTERVAL") +
									 "</span>" +
								"</div>" +
								"<div class='dropdownwrapper' style='display:table;float:left;margin-top:10px;margin-right:8px;width:100px;'>" +
										"<input id='trendlog-number-dropdown' type='text' data-event='numberdrop' data-role='dropdownlist' style='display:none;'>" +
								"</div>" +
								"<div class='dropdownwrapper' style='display:table;margin-top:10px;'>" +
										"<input id='trendlog-period-dropdown' type='text' data-event='perioddrop' data-role='dropdownlist' style='display:none;'>" +
								"</div>" +
							"</div>" +
							"<div id='trendlog-loginterval-box' class='trendlog-create-header trendlog-edit-box' style='border-bottom:none;'>" +
								 "<span class='btxt textBlock'>" +
									I18N.prop("FACILITY_TRENDLOG_LOGGING_PROPERTY") +
								 "</span>" +
							"</div>" +
							"<div class='blank10'>" +
							"</div>" +
							"<div class='top-block-box trendlog-edit-box' style='height:75px;'>" +
								"<div id='trendlog-create-grid-count' class='subject btxt textBlock' style='float:left;'>" +
									I18N.prop("COMMON_TOTAL") + " (0)" +
								"</div>" +
								"<div class='listBtns' style='float:right;'>" +
									"<span style='margin-right:20px;color:#0081c6;font-size:14px;font-weight:600;'>(" + I18N.prop("FACILITY_TRENDLOG_TOTAL_NUMBER_OF_LOGGING_PROPERTY") + ") ≤ 12</span>" +
									"<button id='trendlog-create-add-btn' class='k-button' style='width:79px;margin-right:10px;'>" + I18N.prop("COMMON_BTN_ADD") + "</button>" +
									"<button id='trendlog-create-delete-btn' class='k-button' style='width:79px;margin-right:10px;'>" + I18N.prop("COMMON_BTN_DELETE") + "</button>" +
								"</div>" +
							"</div>" +
							"<div id='trendlog-create-grid-elem' class='trendlog-edit-box'>" +
							"</div>" +
						  "</div>",
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				disabled : false,
				action : function(e){
					e.sender.trigger("onClose");
					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE"),
				visible : true,
				action : function(e){
					e.sender.trigger("onSave", { sender : e.sender });

					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE"),
				visible : true,
				action : function(e){
					e.sender.trigger("onEditSave", { sender : e.sender });
					return false;
				}
			}
		],
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		onTypeChange : function(e){
			// var type = e.type;		//[2018-04-12][선언후 미사용 변수 주석처리]
			var BTN = e.sender.BTN;
			var popup = e.sender;
			popup.setActions(BTN.CLOSE, { disabled : false });
			popup.setActions(BTN.SAVE, { disabled : false });
			//[2018-04-12][공백코드 주석처리]
			// if(type == "single"){
			//
			// }else if(type == "multi"){
			//
			// }
		},
		scheme : trendlogCreateScheme
	};

	var trendlogCreateAddConfig = {
		title : I18N.prop("FACILITY_TRENDLOG_ADD_PROPERTY"),
		width: 554,
		height: 820,
		isOnlyMulti : false,
		buttonsIndex : {
			CLOSE : 0,
			PREV : 1,
			NEXT : 2,
			SAVE : 3,
			EDITSAVE : 4
		},
		headerTemplate : "",
		contentTemplate : "<div id='trendlog-device-panel' class='detail-dialog-content'>" +
							"<div id='trendlog-trendlogname-box' class='trendlog-create-header'>" +
								 "<div class='tbc' style='width:210px;'>" +
									"<span id='trendlog-add-device-cnt' class='btxt textBlock'>" +
										I18N.prop("COMMON_SELECTED") + " : 0" +
									"</span>" +
								 "</div>" +
							"</div>" +
							"<div id='trendlog-loginterval-box' style='border-bottom:none;' class='trendlog-create-header'>" +
								 "<div id='log-interval-wrapper'>" +
									 "<input type='text' data-event='typedrop' data-role='dropdownlist' style='display:none;'>" +
								 "</div>" +
							"</div>" +
							"<div class='search-box' style='width:100%;' data-bind='invisible: searchField.invibisible'>" +
								"<input id='trendlog-add-input' type='text' class='k-textbox' placeholder='" + I18N.prop("COMMON_ENTER_SEARCH_TERMS") + "'/>" +
								"<button id='trendlog-add-search-btn' class='search-btn ic ic-bt-input-search'>" + I18N.prop("COMMON_BTN_SEARCH") + "</button>" +
							"</div>" +
							"<div id='trendlog-device-grid-elem' style='margin-top:10px;'>" +
							"</div>" +
						  "</div>" +
						  ////
						  "<div id='trendlog-property-panel' class='detail-dialog-content'>" +
							"<div id='trendlog-trendlogname-box' class='trendlog-create-header'>" +
								 "<div class='tbc' style='width:210px;'>" +
									"<span id='trendlog-add-property-cnt' class='btxt textBlock'>" +
										I18N.prop("COMMON_SELECTED") + " : 0" +
									"</span>" +
								 "</div>" +
							"</div>" +
							"<div id='trendlog-loginterval-box' style='border-bottom:none;' class='trendlog-create-header'>" +
								 "<div id='log-interval-wrapper'>" +
									 "<input type='text' data-event='typedropcopy' data-role='dropdownlist' style='display:none;'>" +
								 "</div>" +
							"</div>" +
							"<div class='search-box' style='width:100%;' data-bind='invisible: searchField.invibisible'>" +
								"<input id='trendlog-property-input' type='text' class='k-textbox' placeholder='" + I18N.prop("COMMON_ENTER_SEARCH_TERMS") + "'/>" +
								"<button id='trendlog-property-search-btn' class='search-btn ic ic-bt-input-search'>" + I18N.prop("COMMON_BTN_SEARCH") + "</button>" +
							"</div>" +
							"<div id='trendlog-property-grid-elem' style='margin-top:10px;overflow:auto;'>" +
							"</div>" +
						  "</div>",
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				disabled : false,
				action : function(e){

					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
					var BTN = e.sender.BTN;
					e.sender.setActions(BTN.NEXT, {visible : true});
					e.sender.setActions(BTN.NEXT, {disabled : true});
					e.sender.setActions(BTN.PREV, {disabled : true});
					e.sender.setActions(BTN.SAVE, {visible : false});
					$("#trendlog-device-panel").show();
					$("#trendlog-property-panel").hide();
				}
			},
			{
				text : I18N.prop("COMMON_BTN_PREV"),
				visible : true,
				disabled : true,
				action : function(e){
					var BTN = e.sender.BTN;
					e.sender.setActions(BTN.NEXT, {visible : true});
					e.sender.setActions(BTN.PREV, {disabled : true});
					e.sender.setActions(BTN.SAVE, {visible : false});
					e.sender.trigger("onPrev");
					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_NEXT"),
				visible : true,
				disabled : true,
				action : function(e){
					//var result, results;
					//result = e.sender.getSelectedData();
					//if(e.sender.dataSource.total() > 1){
					//results = e.sender.dataSource.data();
					//}
					//e.sender.trigger("onEdit", { result : result, results : results });
					var BTN = e.sender.BTN;
					e.sender.setActions(BTN.NEXT, {visible : false});
					e.sender.setActions(BTN.SAVE, {visible : true});
					e.sender.setActions(BTN.PREV, {disabled : false});
					e.sender.trigger("onNext");
					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE"),
				id : "trendlog-add-save-btn",
				visible : false,
				disabled : true,
				action : function(e){
					//TODO SAVE
					var BTN = e.sender.BTN;
					//var deviceGrid = $("#trendlog-device-grid-elem").data("kendoGrid");
					var deviceGrid = $("#trendlog-device-grid-elem").data("kendoDeviceTabGroupGrid");
					var propertyGrid = $("#trendlog-property-grid-elem").data("kendoGrid");

					//var checkedDeviceData = deviceGrid.getCheckedData();
					var checkedDeviceData = deviceGrid.getSelectedData();
					var checkedPropertyData = propertyGrid.getCheckedData();

					// console.log(checkedDeviceData);
					// console.log(checkedPropertyData);

					e.sender.trigger("onSave", { checkedDeviceData : checkedDeviceData, checkedPropertyData : checkedPropertyData });
					e.sender.close();
					e.sender.setActions(BTN.NEXT, {disabled : true});

					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE"),
				id : "trendlog-add-editsave-btn",
				visible : false,
				disabled : true,
				action : function(e){
					//TODO SAVE
					var BTN = e.sender.BTN;
					// var deviceGrid = $("#trendlog-device-grid-elem").data("kendoGrid");		//[2018-04-12][선언후 미사용 변수 주석처리]
					var propertyGrid = $("#trendlog-property-grid-elem").data("kendoGrid");

					var checkedPropertyData = propertyGrid.getCheckedData();
					var originalData = e.sender.dataSource._data[0];

					// console.log(checkedPropertyData);

					e.sender.trigger("onEditSave", { originalData : originalData, checkedPropertyData : checkedPropertyData });
					//e.sender.close();
					e.sender.setActions(BTN.NEXT, {disabled : true});

					return false;
				}
			}
		],
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		onTypeChange : function(e){
			var type = e.type;
			var BTN = e.sender.BTN;
			var popup = e.sender;
			if(type == "edit"){
				//TODO
				popup.setActions(BTN.PREV, {visible : false});
				popup.setActions(BTN.NEXT, {visible : false});
				popup.setActions(BTN.SAVE, {visible : false});
				popup.setActions(BTN.SAVE, {disabled : true});
				popup.setActions(BTN.EDITSAVE, {visible : true});
				popup.setActions(BTN.EDITSAVE, {disabled : true});
			}else if(type == "create"){
				popup.setActions(BTN.PREV, {visible : true});
				popup.setActions(BTN.NEXT, {visible : true});
				popup.setActions(BTN.SAVE, {visible : false});
				popup.setActions(BTN.SAVE, {disabled : true});
				popup.setActions(BTN.EDITSAVE, {visible : false});
				popup.setActions(BTN.EDITSAVE, {disabled : true});
			}
		},
		close : function(e){
			// console.log(e);
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.NEXT, {visible : true});
			e.sender.setActions(BTN.PREV, {disabled : true});
			e.sender.setActions(BTN.SAVE, {visible : false});
			$("#trendlog-device-panel").show();
			$("#trendlog-property-panel").hide();
		},
		scheme : trendlogCreateScheme
	};

	var trendlogSingleDetailConfig = {
		title : I18N.prop("FACILITY_HISTORY_DETAIL"),
		width: 652,
		height: 690,
		isOnlyMulti : false,
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			EDIT : 2
		},
		headerTemplate : "",
		contentTemplate : "<div id='trendlog-detail-single-panel' class='detail-dialog-content' style='overflow:auto;height:530px;'>" +
							"<div class='popBody'>" +
								"<div class='subjectBox'>" +
									"<div id='trendlog-details-name' class='name'>Trend log name 1</div>" +
									"<div id='trendlog-details-status' class='status'>Operating</div>" +
									"<div class='added'><button type='button' id='trendlog-details-icon' class='commonBtn icOnly ic ic-action-pause'></button></div>" +
								"</div>" +
								"<div class='popScroller mCustomScrollbar _mCS_6 mCS-autoHide mCS_no_scrollbar'>" +
									"<div id='mCSB_6' class='mCustomScrollBox mCS-light mCSB_vertical mCSB_inside' tabindex='0' style='max-height: none;'>" +
										"<div id='mCSB_6_container' class='mCSB_container mCS_y_hidden mCS_no_scrollbar_y' style='position:relative; top:0; left:0;' dir='ltr'>" +
											"<div class='detailBox'>" +
												"<ul class='statusList'>" +
													"<li>" +
														"<div class='name btxt' style='width:210px;'>" + I18N.prop("FACILITY_TRENDLOG_LAST_UPDATE") + "</div>" +
														"<div id='trendlog-details-lastupdate' class='detail' style='width:210px;'></div>" +
													"</li>" +
													"<li>" +
														"<div class='name btxt' style='width:210px;'>" + I18N.prop("FACILITY_TRENDLOG_LOG_INTERVAL") + "</div>" +
														"<div id='trendlog-details-loginterval' class='detail' style='width:210px;'></div>" +
													"</li>" +
													"<li style='padding-bottom:0px;'>" +
														"<div class='name btxt' style='width:210px;vertical-align:top;'>" + I18N.prop("FACILITY_TRENDLOG_LOGGING_PROPERTY") + "</div>" +
														"<div id='trendlog-details-total' class='detail' style='border-bottom-width: 2px;border-bottom-style: solid;border-bottom-color:rgb(222, 222, 222);padding-bottom:15px;'>" + I18N.prop("COMMON_TOTAL") + " (0)" +
														"</div>" +
													"</li>" +
													"<li class='dvc' style='padding-top:0px;'>" +
														"<div class='name btxt' style='width:210px;vertical-align:top;'>" +
														"</div>" +
														"<div class='detail' style='vertical-align:top;'>" +
															"<ul id='trendlog-details-ul' class='dvcDetailList'>" +
															//append by trendlog-model.js->createDetailModel


															"</ul>" +
														"</div>" +

													"</li>" +
												"</ul>" +
											"</div>" +
										"</div>" +
									"</div>" +
								"</div>" +
							"</div>" +
						  "</div>",
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				disabled : false,
				action : function(e){

					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
					// var BTN = e.sender.BTN;		//[2018-04-12][선언후 미사용 변수 주석처리]
				}
			},
			{
				text : I18N.prop("COMMON_BTN_DELETE"),
				visible : true,
				disabled : false,
				action : function(e){
					confirmDialog.message(I18N.prop("FACILITY_TRENDLOG_CHECK_DELETE_TRENDLOG"));
					confirmDialog.setConfirmActions({
						yes : function(){
							// console.log(e);

							e.sender.trigger("onDelete", { e : e });

						}
					});
					confirmDialog.open();
					// var BTN = e.sender.BTN;		//[2018-04-12][선언후 미사용 변수 주석처리]
					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_EDIT"),
				visible : true,
				disabled : false,
				action : function(e){
					e.sender.trigger("onEdit", { e : e });

					$("#trendlog-device-panel").hide();
					$("#trendlog-property-panel").show();
					return false;
				}
			}
		],
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		onTypeChange : function(e){

		},
		close : function(e){
			// console.log(e);
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.EDIT, {disabled : true});
		},
		scheme : trendlogCreateScheme
	};

	var trendlogMultiDetailConfig = {
		title : "Details",
		width: 652,
		height: 690,
		isOnlyMulti : true,
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			EDIT : 2
		},
		headerTemplate : "",
		contentTemplate : "<div class='detail-dialog-content'>" +
							"<div class='subjectBox'>" +
								"<div id='trendlog-details-cnt' class='name' style='border-bottom-width: 2px;border-bottom-style: solid;border-bottom-color: rgb(222, 222, 222);' >Selected : 1</div>" +
							"</div>" +
							"<ul id='trendlog-detail-multi-panel' style='overflow:auto;height:490px;'>" +
							//append by js
							"</ul>" +
						  "</div>",
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				disabled : false,
				action : function(e){

					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			}
		],
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		onTypeChange : function(e){

		},
		close : function(e){
			// console.log(e);
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.EDIT, {disabled : true});
		},
		scheme : trendlogCreateScheme
	};

	// var exceptionalDetailScheme = {			//[2018-04-12][선언후 미사용 함수 주석처리]
	//     id: "id",
	//     fields : {
	//         title : {
	//             type : "text",
	//             name : I18N.prop("FACILITY_SCHEDULE_EXCEPTIONAL_DAY_NAME"),
	//             editable : true,
	//             template : TrendlogTemplate.scheduleDetailNameTemplate,
	//             validator : {
	//                 type : "name",
	//                 required : true
	//             },
	//             hasInputRemoveBtn : true,
	//             editCss : {
	//                 width : "100%"
	//             }
	//         },
	//         date : {
	//             type : "text",
	//             name : I18N.prop("COMMON_DATE"),
	//             editable : true,
	//             editTemplate : '<input data-role="commondatepicker" data-is-start="true" data-bind="value: fields.start, events:{ open: getOldStartDate, change : changeStartTime }" data-format="yyyy-MM-dd" title="datepicker" style="width: 46.5%;"/><span style="margin-left:10px;margin-right:10px;">-</span><input data-role="commondatepicker" data-is-end="true" data-bind="value:fields.end, events:{ open: getOldEndDate, change : changeEndTime }" data-format="yyyy-MM-dd" title="datepicker" style="width: 46.5%;"/>',
	//             editViewModel : {
	//                 fields : {
	//                     start : new Date(),
	//                     end : new Date(),
	//                     oldStartDate: null,
	//                     oldEndDate: null
	//                 },
	//                 getOldStartDate: function(e){
	//                     var st = this.get("fields.start");
	//                     this.set("fields.oldStartDate", st);
	//                 },
	//                 getOldEndDate: function(e){
	//                     var ed = this.get("fields.end");
	//                     this.set("fields.oldEndDate", ed);
	//                 },
	//                 changeStartTime : function(e){
	//                     //time check
	//                     var st = this.get("fields.start");
	//                     var ed = this.get("fields.end");
	//                     var oldSt = this.get("fields.oldStartDate");
	//                     var nowDate = new Date();
	//                     var resultDate;
	//
	//                     if(st < nowDate){ // StartDate가 오늘보다 이전인 경우 오늘로 보정
	//                         this.set("fields.start", nowDate);
	//                     }
	//                     if(st > ed){ // StartDate가 EndDate보다 늦을 경우 원래의 값 복구
	//                         if(oldSt !== null){
	//                             this.set("fields.start", oldSt);
	//                         }
	//                     }
	//
	//                     resultDate = this.get("fields.start");
	//                     resultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate(), 0, 0, 0);
	//                     this.set("fields.start", resultDate);
	//
	//                     var dialog = $(e.sender.element).closest(".k-content").data("kendoDetailDialog");
	//                     if(dialog){
	//                         dialog.enableSaveBtn();
	//                     }
	//                     console.log(this.get("fields.start"));
	//                 },
	//                 changeEndTime : function(e){
	//                     //time check
	//                     var st = this.get("fields.start");
	//                     var ed = this.get("fields.end");
	//                     var oldEd = this.get("fields.oldEndDate");
	//                     var nowDate = new Date();
	//                     var resultDate;
	//
	//                     if(ed < nowDate){ // EndDate가 오늘보다 이전인 경우 오늘로 보정
	//                         this.set("fields.end", new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 23, 59, 59));
	//                     }
	//                     if(st > ed){ // StartDate가 EndDate보다 늦을 경우 원래의 값 복구
	//                         if(oldEd !== null){
	//                             this.set("fields.end", oldEd);
	//                         }
	//                     }
	//
	//                     resultDate = this.get("fields.end");
	//                     resultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate(), 23, 59, 59);
	//                     this.set("fields.end", resultDate);
	//
	//                     var dialog = $(e.sender.element).closest(".k-content").data("kendoDetailDialog");
	//                     if(dialog){
	//                         dialog.enableSaveBtn();
	//                     }
	//                     console.log(this.get("fields.end"));
	//                 }
	//             },
	//             template : function(data){
	//                 data.fields = {};
	//                 data.start = data.start || data.startDate;
	//                 data.end = data.end || data.endDate;
	//                 var startDate = data.startDate || data.start;
	//                 var endDate = data.endDate || data.end;
	//                 if(!data.fields){
	//                     data.fields.start = startDate;
	//                     data.fields.end = endDate;
	//                 }
	//
	//                 startDate = moment(startDate).format("L").replace(/\./g, "-");
	//                 endDate = moment(endDate).format("L").replace(/\./g, "-");
	//                 return startDate + " ~ " + endDate;
	//             }
	//         },
	//         description : {
	//             type : "text",
	//             name : I18N.prop("COMMON_DESCRIPTION"),
	//             // validator : {
	//             //     type : "description"
	//             // },		//[2018-04-12][이미 선언되어있음 주석처리]
	//             editCss : {
	//                 width : "100%"
	//             },
	//             validator : true,
	//             hasInputRemoveBtn : true,
	//             editable : true
	//         }
	//     }
	// };


	var trendlogHistoryConfig = {
		title : I18N.prop("FACILITY_TRENDLOG_TRENDLOG_HISTORY"),
		width: 1294,
		height: 900,
		isOnlyMulti : true,
		buttonsIndex : {
			CLOSE : 0
		},
		headerTemplate : "",
		contentTemplate : "<div id='trendlog-history-single-panel' class='detail-dialog-content' style='overflow:auto;height:770px;'>" +
							"<div class='popBody'>" +
							"<div class='subjectBox'>" +
								"<div id='trendlog-history-name' class='name'>Trend log name 1</div>" +
							"</div>" +
							"<div class='historyHead'>" +
								"<div class='subject' style='height:40px;'>" + I18N.prop("FACILITY_TRENDLOG_HISTORY_OPTION") + "</div>" +
							"</div>" +

							//graph head box
							"<div class='historyHead graphHeadBox'>" +
								"<ul>" +
									"<li class='opened trendlog-collapse' style='border-bottom-width:2px;border-bottom-style:solid;border-bottom-color:rgb(222, 222, 222);padding-bottom:15px;'>" +
										"<div class='tb'>" +
											"<div class='tbc title' style='width:193px;'>" + I18N.prop("FACILITY_HISTORY_PERIOD") + "</div>" +
											"<div class='tbc'>" +
												"<div class='dateFrm'>" +
													"<label>" + I18N.prop("FACILITY_SCHEDULE_START_DATE") + "</label>" +
													"<div class='blockFrm date' >" +
														"<input id='trendlog-start-datepicker' data-role='commondatepicker' type='text'>" +
														"<a href='#' class='btCalendar'></a>" +
													"</div>" +
													"<div class='blockFrm time' style='margin-left:50px;'>" +
														"<input id='trendlog-start-timepicker' data-role='commontimepicker' type='text'>" +
														"<a href='#' class='btClock'></a>" +
													"</div>" +
												"</div>" +
											"</div>" +
											"<div class='tbc'>" +
												"<div class='dateFrm'>" +
													"<label>" + I18N.prop("FACILITY_SCHEDULE_END_DATE") + "</label>" +
													"<div class='blockFrm date'>" +
														"<input id='trendlog-end-datepicker' data-role='commondatepicker' type='text'>" +
														"<a href='#' class='btCalendar'></a>" +
													"</div>" +
													"<div class='blockFrm time' style='margin-left:50px;'>" +
														"<input id='trendlog-end-timepicker' data-role='commontimepicker' type='text'>" +
														"<a href='#' class='btClock'></a>" +
													"</div>" +
												"</div>" +
											"</div>" +
											"<div data-template='excelexport-action-filter-template' data-bind='source:actions'></div>" +
											"<div class='added'><span id='trendlog-expander' class='k-icon t-i-collapse'></span></div>" +
										"</div>" +
									"</li>" +
								"</ul>" +

							"</div>" +

							//graph property box
							"<div class='detailBox graphHeadBox' id='trendlog-history-propertybox'>" +
								"<div class='historyHead'>" +
									"<div class='logHistoryLabelBox'>" +
										"<div class='graphTitle'>" + I18N.prop("FACILITY_TRENDLOG_LOGGING_PROPERTY") + "</div>" +
										"<div class='graphColor'>" +
											"<ul id='trendlog-history-name-ul'>" +
											//append by js
											"</ul>" +
										"</div>" +
										"<div class='graphLine'>" +
											"<ul id='trendlog-history-property-ul'>" +
											//append by js
											"</ul>" +
										"</div>" +
										"<div class='blanktbc'></div>" +
									"</div>" +
								"</div>" +
		// "<ul class='statusList' style='height:40px;'>" +
		// 	"<button id='history-view-btn' class='k-button' style='float:right;width:79px;'>" + I18N.prop("COMMON_BTN_VIEW") + "</button>" +
		// "</ul>" +
							"</div>" +

							//list head box
							"<div class='historyHead listHeadBox' style='height: 120px;border-bottom: none;display:none;'>" +
								"<div class='tb' style='height:60px;'>" +
									"<div class='tbc' style='width:50%'><span class='titletext'>" + I18N.prop("FACILITY_TRENDLOG_PERIOD") + "</span><span id='trendlog-history-list-period' class='detail'>2016-07-01</span></div>" +
									"<div class='tbc'><span class='titletext'>" + I18N.prop("FACILITY_TRENDLOG_LOGGING_PROPERTY") + "</span><span id='trendlog-history-properties-cnt' class='detail'>12 Properties</span></div>" +
									"<div class='tbc arr'></div>" +
								"</div>" +
							"</div>" +

							//grid header Btn 기본이 hide 상태
							"<div id='trendlogBtnGroups' style='display:none;height: 60px;border-top: 1px solid #d6d6d6;margin-top: 20px;'>" +
								"<div class='top-block-box'>" +
									"<div class='trendlogBtns'>" +
										"<span class='chart-sub-desc'>" + I18N.prop("FACILITY_TRENDLOG_POPUP_NOT_DISPLAY_CHAR_ATTRIBUTE_GRAPH") + "</span>" +
										"<ul class=''>" +
											"<li>" +
												"<button id='trendlog-history-list' class='ic ic-view-list'></button>" +
											"</li>" +
											"<li>" +
												"<button id='trendlog-history-graph' class='ic ic-view-graph active'></button>" +
											"</li>" +
										"</ul>" +
									"</div>" +
								"</div>" +
							"</div>" +

							//graph chart
							"<div class='graphHeadBox'>" +
								"<div id='trendlog-history-chart'>" +

								"</div>" +
							"</div>" +

							//list grid
							"<div class='listHeadBox'>" +
								"<div id='trendlog-history-grid-elem'>" +

								"</div>" +
							"</div>" +

						"</div>" +
					  "</div>",

		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				disabled : false,
				action : function(e){

					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			}
		],
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		onTypeChange : function(e){

		},
		close : function(e){
			// console.log(e);
			// var BTN = e.sender.BTN;		//[2018-04-12][선언후 미사용 변수 주석처리]
		},
		scheme : trendlogCreateScheme
	};

	/*
		Name 편집 수정으로 인해 Detail Popup 수정
	*/
	var defautGridOpt = {
		height: "100%",
		scrollable: true,
		sortable: false,
		filterable: false,
		pageable: false
	};
	var trendLogDetailScheme = {
		id: "id",
		fields : {
			name : {
				type : "text",
				name : I18N.prop("COMMON_NAME"),
				editable : true,
				validator : {
					type : "name",
					required : true
				},
				hasInputRemoveBtn : true,
				editCss : {
					width : "100%"
				}
			},
			updatedTime : {
				type : "text",
				name : I18N.prop("FACILITY_TRENDLOG_LAST_UPDATE"),
				template : function(data){
					var val = "-";
					if(data.updatedTime){
						val = data.updatedTime;
						val = moment(val).format("LLL").replace(/\./g, "-");
					}
					return val;
				}
			},
			interval : {
				type : "text",
				name : I18N.prop("FACILITY_TRENDLOG_LOG_INTERVAL"),
				template : function(data){
					var val = "-";
					if(data.originalInterval){
						var interval = data.originalInterval;
						val = TrendlogUtil.intervalToString(moment.duration(interval), interval);
					}
					return val;
				}
			},
			devices : {
				type : "grid",
				name : I18N.prop("FACILITY_TRENDLOG_LOGGING_PROPERTY"),
				gridDataSource : function(data){
					var devices =  data.devices;
					/*var i, max = devices.length;
					var list = [];
					var device;

					for( i= 0; i < max; i++){
						device = devices[i];
						list.push({ deviceGroup : "1", devices : device });
					}*/

					//return list;
					return devices;
				},
				gridOptions : $.extend({}, defautGridOpt, {
					hideHeader : true,
					columns : [
						{
							//template : DeviceTemplate.detailPopupGroupListTemplate,
							field : "dms_devices_name",
							template : function(data){
								var val = "-";
								if(data.dms_trendLogs_properties_list_keys){
									var keys = data.dms_trendLogs_properties_list_keys;
									var i, max = keys.length;
									var key, i18nVal, text = "";
									for( i = 0; i < max; i++ ){
										key = Model.getPropertiesNameByKey(keys[i]);
										key = key ? key : "-";
										i18nVal = I18N.prop("FACILITY_TRENDLOG_PROPERTY_" + key.toUpperCase());
										key = i18nVal ? i18nVal : key;
										text += key;
										if( i != max - 1){
											text += ", ";
										}
									}
									val = text;
								}
								return val;
							},
							groupHeaderTemplate : function(data){
								var value = data.value;
								//Type 처리
								// var count = "";		//[2018-04-12][선언후 사용코드가 주석처리되어 미사용변수처리됨 주석처리]
								var text = "-";
								if(value){
									text = Util.decodeHtml(value);
								}
								/*if(data.count){
									count = data.count;
									text += " ("+count+")";
								}*/

								return text;
							}
						}
					],
					group : [
						//{ field : "logging", aggregates : [ { field: "executionGroup", aggregate : "count" }]}
						{field : "dms_devices_name"}
					]
				})
			}
		}
	};
	var trendLogDetailConfig = {
		title : I18N.prop("FACILITY_HISTORY_DETAIL"),
		width: 652,
		height: 690,
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			EDIT : 2,
			CANCEL : 3,
			SAVE : 4
		},
		//<button class="device-detail-header-history-btn k-button" data-bind="events: {click : clickHistoryBtn }">History</button>
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type"></span></div><div class="detail-dialog-detail-content-field-list"></div>',
		listTemplate : TrendlogTemplate.trendLogDetailListTemplate,
		headerTemplate : "<span>" + I18N.prop("COMMON_SELECTED") + ": <span>#:count #</span></span>",
		isCustomActions : true,
		onTypeChange : function(e){
			var type = e.type;
			var exceptPopup = e.sender;
			var BTN = e.sender.BTN;

			var selectedData = e.sender.getSelectedData();

			if(type == "single"){
				exceptPopup.setActions(BTN.CLOSE, { visible : true });
				exceptPopup.setActions(BTN.DELETE, { visible : true });
				exceptPopup.setActions(BTN.EDIT, { visible : true });

				//Single 상태에서는 Pause 상태에 따라 Edit, Delete 버튼을 Enable/Disable 한다.
				//Pause 상태에서만 활성화 됨.
				//Multi일 경우에는 DELETE, EDIT 버튼이 표시되지 않는다.
				if(selectedData.enabled){
					exceptPopup.setActions(BTN.DELETE, { disabled : false });
					exceptPopup.setActions(BTN.EDIT, { disabled : false });
				}else{
					exceptPopup.setActions(BTN.DELETE, { disabled : false });
					exceptPopup.setActions(BTN.EDIT, { disabled : false });
				}

				exceptPopup.setActions(BTN.SAVE, { visible : false });
				exceptPopup.setActions(BTN.CANCEL, { visible : false });
			}else if(type == "edit"){
				exceptPopup.setEditable(true);
				exceptPopup.setActions(BTN.SAVE, { visible : true });
				exceptPopup.setActions(BTN.CANCEL, { visible : true });
				exceptPopup.setActions(BTN.EDIT, { visible : false });
				exceptPopup.setActions(BTN.CLOSE, { visible : false });
				exceptPopup.setActions(BTN.DELETE, { visible : false });
			}else if(type == "multi"){
				exceptPopup.setActions(BTN.SAVE, { visible : false });
				exceptPopup.setActions(BTN.CANCEL, { visible : false });
				exceptPopup.setActions(BTN.EDIT, { visible : false });
				exceptPopup.setActions(BTN.CLOSE, { visible : true });
				exceptPopup.setActions(BTN.DELETE, { visible : false });
			}
		},
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				action : function(e){
					e.sender.trigger("onClose");
					if(e.sender.isEditable){
						e.sender.setEditable(false);
					}
					//e.sender.close();
					e.sender.trigger("onClosed");
				}
			},
			{
				text : I18N.prop("COMMON_BTN_DELETE"),
				visible : true,
				action : function(e){

					var result, results;
					result = e.sender.getSelectedData();
					if(e.sender.dataSource.total() > 1){
						results = e.sender.dataSource.data();
					}

					e.sender.trigger("onDelete", { result : result, results : results  });
					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_EDIT"),
				visible : true,
				action : function(e){
					e.sender.trigger("onEdit");
					//e.sender.setEditable(true);
					e.sender.trigger("onEdited");
					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_CANCEL"),
				visible : false,
				action : function(e){
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
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE"),
				visible : false,
				disabled : true,
				action : function(e){
					e.sender.trigger("onSave");
					// var type = e.sender.dialogType;		//[2018-04-12][선언후 미사용 변수 주석처리]
					//save trigger save with selected data
					var result, results, data;
					data = e.sender.getSelectedData();		//[2018-04-12][var 제거]
					result = e.sender.save();
					if(result === false){
						return false;
					}
					result.id = data.id;
					if(e.sender.dataSource.total() > 1){
						results = e.sender.saveAll(null, true);
					}
					e.sender.trigger("onSaved", {
						sender : e.sender, result : result, results : results
					});
					e.sender.setEditable(false);
					return false;
				}
			}
		],
		scheme : trendLogDetailScheme
	};

	var getTrendlogCreatePopup = function(){
		trendlogCreatePopup = trendlogCreatePopupElem.kendoDetailDialog(trendlogCreatePopupConfig).data("kendoDetailDialog");
		return trendlogCreatePopup;
	};

	var getTrendlogAddPopup = function(){
		trendlogAddPopup = trendlogAddPopupElem.kendoDetailDialog(trendlogCreateAddConfig).data("kendoDetailDialog");
		return trendlogAddPopup;
	};

	var getTrendlogSingleDetailPopup = function(){
		trendlogSingleDetailPopup = trendlogSingleDetailPopupElem.kendoDetailDialog(trendlogSingleDetailConfig).data("kendoDetailDialog");
		return trendlogSingleDetailPopup;
	};

	var getTrendlogMultiDetailPopup = function(){
		trendlogMultiDetailPopup = trendlogMultiDetailPopupElem.kendoDetailDialog(trendlogMultiDetailConfig).data("kendoDetailDialog");
		return trendlogMultiDetailPopup;
	};

	var getTrendlogHistoryPopup = function(){
		trendlogHistoryPopup = trendlogHistoryPopupElem.kendoDetailDialog(trendlogHistoryConfig).data("kendoDetailDialog");
		// kendo.bind($(".historyHead.graphHeadBox"), excelExpotViewModel);
		return trendlogHistoryPopup;
	};

	var getTrendlogDetailPopup = function(){
		trendlogDetailPopup = trendlogDetailPopupElem.kendoDetailDialog(trendLogDetailConfig).data("kendoDetailDialog");
		return trendlogDetailPopup;
	};


	return {
		getTrendlogCreatePopup : getTrendlogCreatePopup,
		getTrendlogAddPopup : getTrendlogAddPopup,
		getTrendlogSingleDetailPopup : getTrendlogSingleDetailPopup,
		getTrendlogMultiDetailPopup : getTrendlogMultiDetailPopup,
		getTrendlogHistoryPopup : getTrendlogHistoryPopup,
		getTrendlogDetailPopup : getTrendlogDetailPopup
	};

});

//# sourceURL=history/trendlog/config/popup-config.js