/**
*
*   <ul>
*       <li>Facility - Group에서 표시할 상세 팝업 옵션 값 설정</li>
*       <li>상세 팝업 및 그룹 제어 팝업의 인스턴스를 생성한다.</li>
*   </ul>
*   @module app/operation/group/config/group-widget
*   @requires config
*   @requires lib/moment
*
*/
define("operation/group/config/group-widget", ["operation/core", "device/common/device-util", "device/common/device-template", "operation/group/config/group-template", "operation/group/config/group-control-vm"], function(CoreModule, DeviceUtil, DeviceTemplate, GroupTemplate, ControlViewModel){
	var I18N = window.I18N;
	var Util = window.Util;
	var moment = window.moment;
	var kendo = window.kendo;

	var detailPopup, detailPopupElem = $("#device-detail-popup");
	var groupControlPopup, groupControlPopupElem = $("#group-control-popup");

	var msgDialog, msgDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");

	var confirmDialog, confirmDialogElem = $("<div/>");
	confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");


	/*History Pop-up Start*/
	/* History Mockup Data - Youngun */
	var historyData = [
		{
		   controlledTime: "2016-08-27 16:30",
		   location: {
			   building: "A Building",
			   floor: "30F",
			   zone: "Meeting Room A"
		   },
		   devices: {
			   Indoor: [
					{ icon:"", deviceId: "Device01", deviceName: "Device01" },
					{ icon: "", deviceId: "Device02", deviceName: "DeviceName02" }
				]
		   },
		   group: ["Group A", "Group B"],
		   controlBy: "Quaduron",
		   controlType: "Manual control",
		   operation: "• SAC Indoor : On - Cool (18 °C)"
		},
		{
		   controlledTime: "2016-08-27 16:30",
		   location: {
			   building: "A Building",
			   floor: "30F",
			   zone: "Meeting Room A"
		   },
		   devices: {
			   Indoor: [
					{ icon:"", deviceId: "Device01", deviceName: "Device01" },
					{ icon: "", deviceId: "Device02", deviceName: "DeviceName02" }
				]
		   },
		   group: ["Group A", "Group B"],
		   controlBy: "Quaduron",
		   controlType: "Manual control",
		   operation: "• SAC Indoor : On - Cool (18 °C)"
		}
	];
	/* History column Data - Youngun */
	var historyColumns = [
		  { field: "controlledTime", title: "Controlled Time" },
		  { field: "location", title: "Location", sortable: false, template: "#: location.building #, #: location.floor #, #: location.zone #" },
		  { field: "devices", title: "Devices", sortable: false, template: "Indoor #: devices.Indoor.length #" },
		  { field: "controlBy", title: "Control By", sortable: false },
		  { field: "controlType", title: "Control Type", sortable: false },
		  { field: "operation", title: "Operation", sortable: false }
		  // { title: "Detail", template: "<span class='ic ic-info' data-event='detail'></span>", sortable: false, width: "66px" }
	];

	var historyPop = $("#popup-history").kendoPopupSingleWindow({title: "History", width: "1296px"});
	historyPop.closest(".popup-window").addClass("popup-device-history");

	// Grid in History Popup - Youngun
	var historyGrid = $(".popup-device-history .device-history-grid").kendoGrid({
		dataSource: [],
		scrollable: true,
		sortable: true,
		height: "100%",
		columns: historyColumns
	});

	// History Calendar - Youngun
	var nowDate = new Date();
	var startDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
	var selectStartDate = startDate;
	var selectEndDate = nowDate; // 선택된 날짜

	historyPop.find(".toolbar").find(".item.start").find("input[data-role=startDate]").val(convertDateFormat(selectStartDate)); // Start Date 기본값
	historyPop.find(".toolbar").find(".item.end").find("input[data-role=endDate]").val(convertDateFormat(selectEndDate)); // End Date 기본값

	// 캘린더
	var historyDatePopupStart = historyPop.find("li.start .device-history-calendar").kendoPopupSingleWindow({
		title: "Date Picker",
		width: "365px",
		height: "460px",
		modal: false,
		resizable: false,
		scrollable: false,
		visible: false,
		draggable: false
	});

	historyDatePopupStart.closest(".popup-window").addClass("dateStart");
	var historyDatePopupEnd = historyPop.find("li.end .device-history-calendar").kendoPopupSingleWindow({
		title: "Date Picker",
		width: "365px",
		height: "460px",
		modal: false,
		resizable: false,
		scrollable: false,
		visible: false,
		draggable: false
	});

	historyDatePopupEnd.closest(".popup-window").addClass("dateEnd");

	// 타임피커 - start
	var historyTimePopupStart = $("#popup-timepicker-start").kendoPopupSingleWindow({
		title: "Time Picker",
		width: "500px",
		height: "320px",
		modal: false,
		resizable: false,
		scrollable: false,
		visible: false,
		draggable: false
	});

	var startTimeIpt = $("#popup-history").find(".toolbar-content.date").find(".item.start").find("[data-role=startTime]");
	startTimeIpt.val("00:00");
	// 타임피커 - end
	var historyTimePopupEnd = $("#popup-timepicker-end").kendoPopupSingleWindow({
		title: "Time Picker",
		width: "500px",
		height: "320px",
		modal: false,
		resizable: false,
		scrollable: false,
		visible: false,
		draggable: false
	});
	var endTimeIpt = $("#popup-history").find(".toolbar-content.date").find(".item.end").find("[data-role=endTime]");
	endTimeIpt.val("00:00");
	// 타임 피커 생성
	createTimePicker(historyTimePopupStart, startTimeIpt);
	createTimePicker(historyTimePopupEnd, endTimeIpt);

	function createTimePicker(myWindow, ipt){ // 팝업창 Root DOM jquery 객체와 값을 넣을 input 태그 jquery객체를 인자로 넣는다.
		var timePicker = myWindow.find(".timepicker");
		var okBtn = myWindow.find(".popup-footer").find("button[data-event=ok]");
		var cancelBtn = myWindow.find(".popup-footer").find("button[data-event=cancel]");
		var h = "00";
		var m = "00";
		var result;
		var minuteData = [];
		for(var i = 0; i < 60; i++){
			var min;
			if(i < 10){ min = "0" + i; }else{ min = "" + i;}
			minuteData.push(min);
		}

		// var chr = $("<span> : </span>");
		// console.log(timePicker);
		// timePicker.find(".k-dropdown").eq(0).after(chr);
		myWindow.css({backgroundColor: "#f7f7f7"});
		myWindow.find(".popup-header").css({ borderBottom: 0 });
		myWindow.find(".popup-container").css({ height: "200px" });
		timePicker.css({ textAlign: "center", marginTop: "80px" });
		timePicker.find(".k-dropdown").css({ width: "150px"});
		timePicker.find(".k-dropdown-wrap").css({
			top: "-7px",
			left: "-11px",
			width: "109px"
		});
		timePicker.find(".k-icon").css({
			top: "16px",
			right: "5px"
		});

		okBtn.on("click", function() {
			result = h + ":" + m;
			ipt.val(result);
			myWindow.data("kendoPopupSingleWindow").close();
		});
		cancelBtn.on("click", function(){
			myWindow.data("kendoPopupSingleWindow").close();
		});
	}

	/* History 팝업 버튼 - Youngun */
	// Start date
	historyPop.kendoPopupSingleWindow("addEventToFactory", "#popup-history .item.start [data-event=calendar]", "singleDeviceHistoryCalendarStartOpen", function(e){
		var startCalendar = $(".popup-window.dateStart").find(".device-history-calendar");
		startCalendar.kendoPopupSingleWindow("openWindowPopup");
		startCalendar.closest(".popup-window").css({ top: "212px", left: "759px" });
	});
	// End date
	historyPop.kendoPopupSingleWindow("addEventToFactory", "#popup-history .item.end [data-event=calendar]", "singleDeviceHistoryCalendarEndOpen", function(e){
		var endCalendar = $(".popup-window.dateEnd").find(".device-history-calendar");
		endCalendar.kendoPopupSingleWindow("openWindowPopup");
		endCalendar.closest(".popup-window").css({ top: "212px", left: "1188px" });
	});
	// 캘린더 내부의 Ok 버튼
	historyPop.kendoPopupSingleWindow("addEventToFactory", ".device-history-calendar .popup-footer [data-event=ok]", "singleDeviceHistoryCalendarOk", function(e){
		var target = $(e.target);
		var myWindow = target.closest(".popup-window");
		var toolbar = historyPop.find(".toolbar");
		var periodDays = (selectEndDate.getTime() - selectStartDate.getTime()) / (1000 * 60 * 60 * 24); // End date와 start date의 차이 일수

		if(periodDays > 365){ // 차이가 365 또는 366일보다 크면 End date의 1년 전으로 Start date를 지정한다.
			selectStartDate = new Date(selectEndDate.getFullYear(), selectEndDate.getMonth(), selectEndDate.getDate());
			selectStartDate.setYear(selectEndDate.getFullYear() - 1);
		}
		if((selectEndDate - nowDate) > 0){ // End Date가 오늘보다 뒤이면 End Date를 오늘 날짜로 한다.
			selectEndDate = new Date();
		}
		if(selectStartDate > selectEndDate){
			selectStartDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
		}

		toolbar.find(".item.start").find("input[data-role=startDate]").val(convertDateFormat(selectStartDate)); // 캘린더에서 선택한 날짜 input에 반영 -Start
		toolbar.find(".item.end").find("input[data-role=endDate]").val(convertDateFormat(selectEndDate)); // 캘린더에서 선택한 날짜 input에 반영 - End

		if(myWindow.hasClass("dateStart")){
			//    historyDatePopupStart.data("kendoPopupSingleWindow").close();
			$(".popup-window.dateStart .device-history-calendar").data("kendoPopupSingleWindow").close();
		}else if(myWindow.hasClass("dateEnd")){
			$(".popup-window.dateEnd .device-history-calendar").data("kendoPopupSingleWindow").close();
			//    historyDatePopupEnd.data("kendoPopupSingleWindow").close();
		}
	});
	// Time Picker Start
	historyPop.kendoPopupSingleWindow("addEventToFactory", "#popup-history .item.start [data-event=timepicker]", "singleDeviceHistoryTimePickerStartOpen", function(e){
		historyTimePopupStart.kendoPopupSingleWindow("openWindowPopup");
		historyTimePopupStart.closest(".popup-window").css({ top: "212px", left: "890px" });
	});
	// Time Picker End
	historyPop.kendoPopupSingleWindow("addEventToFactory", "#popup-history .item.end [data-event=timepicker]", "singleDeviceHistoryTimePickerEndOpen", function(e){
		historyTimePopupEnd.kendoPopupSingleWindow("openWindowPopup");
		historyTimePopupEnd.closest(".popup-window").css({ top: "212px", left: "1320px" });
	});

	/* History 팝업 관련 함수 - Youngun */
	// 날짜 포맷 변경 함수
	function convertDateFormat(date){
		var result = moment(date).format("L").replace(/\./g, "-");
		return result;
	}

	/*History End*/
	/**
	*   <ul>
	*   <li>Group에서 쓰이는 공용 상세 팝업의 기본 옵션</li>
	*   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	*   </ul>
	*   @type {Object}
	*   @name deviceDetailPopupConfig
	*   @alias module:app/operation/group/config/group-widget
	*/
	var deviceDetailPopupConfig = {
		title : I18N.prop("COMMON_BTN_DETAIL"),
		width: 652,
		height: 830,
		buttonsIndex : {
			CLOSE : 0,
			EDIT : 1,
			CANCEL : 2,
			SAVE : 3,
			REGISTER : 4,
			DEREGISTER : 5,
			DELETE : 6
		},
		contentViewModel : {
			clickHistoryBtn : function(){
				historyGrid.data("kendoGrid").dataSource.data(historyData); // History 그리드 데이터 바인딩
				historyPop.kendoPopupSingleWindow("openWindowPopup"); // History 팝업 오픈
			},
			detailType : I18N.prop("COMMON_GENERAL")
		},
		//<button class="device-detail-header-history-btn k-button" data-bind="events: {click : clickHistoryBtn }">History</button>
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		listTemplate : DeviceTemplate.multiDetailListDualTemplate,
		headerTemplate : "<span>" + I18N.prop("FACILITY_DEVICE_SELECTED_DEVICE") + ": <span>#:count #</span></span>",
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				action : function(e){
					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			}
		],
		scheme : {
			id: "id",
			fields : {
				type : {
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_TYPE"),
					template : Util.getDetailDisplayTypeDeviceI18N
				},
				id : {
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_DEVICE_ID")
				},
				name : {
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_DEVICE_NAME")
				},
				representativeStatus : {
					type : "text",
					name : I18N.prop("COMMON_STATUS"),
					template : DeviceTemplate.detailStatusIconTemplate
				},
				modes : {
					type : "text",
					name : I18N.prop("FACILITY_INDOOR_CONTROL_OPERATION_MODE"),
					template : function(dataItem){
						var modes = dataItem.modes;
						if(modes && modes.length > 0){
							return Util.getDisplayModeI18N(modes, dataItem.operations, true);
						}
						return "-";
					}
				},
				setTemperature : {
					type : "text",
					name : I18N.prop("FACILITY_INDOOR_SET_TEMPERATURE"),
					template : DeviceUtil.setTemperatures
				},
				currentTemperature : {
					type : "text",
					name : I18N.prop("FACILITY_INDOOR_CURRENT_TEMPERATURE"),
					template : DeviceUtil.curTemperatures
				},
				configuration : {
					type : "text",
					name : I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL"),
					template : function(dataItem){
						var conf = dataItem.configuration;
						if(conf && conf.remoteControl){
							if(conf.remoteControl === "Allowed") return I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL_ENABLE");
							else if(conf.remoteControl === "NotAllowed") return I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL_DISABLE");
							return I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_CONDITIONAL");
						// return conf.remoteControl;
						}
						return "-";
					}
				},
				locations : {
					type : "text",
					name : I18N.prop("COMMON_LOCATION"),
					template : DeviceUtil.getLocation
				},
				groups : {
					type : "text",
					name : I18N.prop("FACILITY_GROUP_GROUP"),
					template : DeviceUtil.getGroup
				},
				information : {
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_MODEL"),
					template : function(dataItem){
						var val = "-", info = dataItem.information;
						if(info && info.modelName){
							val = info.modelName;
							var i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_POPUP_MODEL_" + val.toUpperCase());
							val = i18nVal ? i18nVal : val;
						}
						return val;
					}
				},
				firmwareVersion : {
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_FIRMWARE_VERSION"),
					template : DeviceUtil.getFirmwareVersion
				},
				description : {
					type : "text",
					name : I18N.prop("COMMON_DESCRIPTION")
				}
			}
		}
	};

	var controlTemplate = kendo.template(GroupTemplate.groupControlTemplate);
	controlTemplate = controlTemplate(ControlViewModel.viewModel);

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
	/**
	*   <ul>
	*   <li>Group에서 쓰이는 그룹 제어 팝업의 옵션</li>
	*   </ul>
	*   @type {Object}
	*   @name groupControlPopupConfig
	*   @alias module:app/operation/group/config/group-widget
	*/
	var groupControlPopupConfig = {
		title : I18N.prop("FACILITY_GROUP_CONTROL"),
		width: 932,
		height: 888,
		buttonsIndex : {
			CLOSE : 0
		},
		groupListOptions : {
			dataSource : [],
			hasNewDataSource : false,
			hasSelectedModel : true,
			hideTab : true,
			type : "hybrid",
			filterTab : [{
				hideHeader : true,
				listStyle : "treeList",
				widgetOptions : {
					expand : function(e){
						var ds = groupControlPopup.dataSource;
						var model = e.model;
						groupControlPopup.groupList.setDataSourceExpand(model, ds);
						return false;
					}
				},
				listOptions : {
					column : {
						template : function(data){
							if(data.treeGroup && data.field){
								if(data.field.indexOf("displayType") != -1){
									return typeGroupHeaderTemplate(data);
								}
							}
							return "<div class='detail-dialog-header detail-multi-dialog-header'>" + DeviceTemplate.multiDetailListTemplate(data, true) + "</div>";
						}
					},
					group : [
						{ field : "displayType", aggregates : [ { field: "displayType", aggregate : "count" }]}
					]/*,
					sort : [{ field : "name", dir : "asc" }]*/
				}
			}]
		},
		gridOptions : {
			hasSelectedModel : true,
			setSelectedAttribute : true,
			selectable : "row multiple",
			columns : [
				{
					field : "displayType", hidden : true, groupHeaderTemplate : function(data){
						var value = data.value;
						var text = "-";
						if(value){
							value = value.split("_");
							text = Util.getDetailDisplayTypeDeviceI18N(value[1]);
						}
						var count = data.count ? data.count : "-";
						return '<span>' + text + '<span>' + ' (<span>' + count + '</span>)';
					}
				},
				{
					headerTemplate : "",
					template : function(data){
						return DeviceTemplate.multiDetailListTemplate(data, true);
					}
				}
			],
			scrollable : {
				virtual : true
			}
		},
		headerViewModel : {
			deviceNum : 0,
			selectedNum : 0,
			groupName : ""
		},
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		headerTemplate : '<span><span data-bind="text: groupName"></span> (<span data-bind="text:deviceNum"></span>)</span><span class="selected-num"><span>' + I18N.prop("FACILITY_DEVICE_SELECTED_DEVICE") + ' : <span data-bind="text:selectedNum"></span></span></span>',
		contentTemplate : '<div class="group-control-dialog detail-dialog-content device-dialog-content" style="width:592px;"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div>' + controlTemplate + '</div>',
		listTemplate : function(data){
			return DeviceTemplate.multiDetailListTemplate(data, true);
		},
		isCustomActions : true,
		hasDetail : false,
		isOnlyMulti : true,
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				action : function(e){
					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			}
		],
		onTypeChange : function(e){
			var dialog = e.sender;
			var arg = e.type;

			var groupId = arg.groupId;

			var vm = ControlViewModel.viewModel;
			vm.init(dialog, groupId);

			var controlElem = dialog.contentElem.find(".group-control-dialog-control");
			console.info(controlElem);

			//선택된 기기 타입의 제어 패널만 Display 한다.
			kendo.unbind(controlElem);
			kendo.bind(controlElem, vm);

			var key, control, invisible = arg.invisible;
			if(invisible){
				for(key in invisible){
					control = vm.get(key);
					control.set("invisible", invisible[key]);
				}
			}

			var currentValue = arg.currentValue;
			// console.log(currentValue);
			//선택된 기기들의 대표 현재 값을 반영한다.
			vm.light.set("value", currentValue.dimmingLevel);
			vm.light.power.set("active", currentValue.light);
			vm.light.power.set("mixed", currentValue.mixed);
			vm.point.aoav.set("value", currentValue.aoav);
			vm.point.dodv.set("active", currentValue.dodv);
			vm.point.dodv.set("mixed", currentValue.dodvMixed);

			var indoorList = arg.indoorList;
			//최초 Data를 Set한다.
			//vm.indoorControlPanel.set("invisible", false);
			var indoorControlElem = dialog.contentElem.find(".control-panel");
			//제어 패널 초기화
			var indoorControlPanel = indoorControlElem.kendoControlTab({
				groupMode : true,
				change : ControlViewModel.indoorControl
			}).data("kendoControlTab");

			//grid.element.find(".k-grid-header").hide();
			//var ds = grid.dataSource;
			// var ds = e.sender.dataSource;
			//var data = ds.data();
			// var data = ds.data();
			//리스트 그룹핑
			//ds.group([{ field : "displayType", aggregate : "count",
			//                aggregates : [ { field: "displayType", aggregate : "count" }]}]);

			//console.log("indoor set data");
			// console.log(data);

			//SAC Indoor 타입에 대하여 실내기 제어 패널에 데이터를 Set
			indoorControlPanel.setDataSource(indoorList);
			ControlViewModel.indoorControlPanelInvisible(indoorControlPanel);
		}
	};

	/**
	*   <ul>
	*   <li>공용 상세 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	*   </ul>
	*   @function getDetailPopup
	*   @returns {kendoWidgetInstance} - 공용 상세 팝업 Widget 인스턴스
	*   @alias module:app/operation/group/config/group-widget
	*/
	var getDetailPopup = function(){
		detailPopup = detailPopupElem.kendoDetailDialog(deviceDetailPopupConfig).data("kendoDetailDialog");
		return detailPopup;
	};
	/**
	*   <ul>
	*   <li>그룹 제어 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	*   </ul>
	*   @function getGroupControlPopup
	*   @returns {kendoWidgetInstance} - 그룹 제어 팝업 Widget 인스턴스
	*   @alias module:app/operation/group/config/group-widget
	*/
	var getGroupControlPopup = function(){
		groupControlPopup = groupControlPopupElem.kendoDetailDialog(groupControlPopupConfig).data("kendoDetailDialog");
		return groupControlPopup;
	};

	return {
		msgDialog : msgDialog,
		confirmDialog : confirmDialog,
		getDetailPopup : getDetailPopup,
		getGroupControlPopup : getGroupControlPopup
	};
});

//# sourceURL=operation-group-widget.js