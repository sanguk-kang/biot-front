/**
 *
 *   <ul>
 *       <li>Facility - Schedule에서 표시할 상세 팝업 옵션 값 설정</li>
 *       <li>스케쥴/예외일 상세 팝업 및 스케쥴/예외일 More 팝업 등의 인스턴스를 생성한다.</li>
 *       <li>Message/Confirm Dialog 등의 인스턴스를 생성한다.</li>
 *   </ul>
 *   @module app/operation/schedule/config/popup-config
 *   @requires config
 *   @requires lib/moment
 *
 */

define("operation/schedule/config/popup-config", ["device/common/device-util", "device/common/device-template",
	"operation/schedule/config/schedule-template", "operation/schedule/model"], function(DeviceUtil, DeviceTemplate, ScheduleTemplate, ScheduleModel){
	var kendo = window.kendo;
	var I18N = window.I18N;
	var Settings = window.GlobalSettings;
	// var MainWindow = window.MAIN_WINDOW;				//[13-04-2018]안쓰는 코드 주석 -jw.lim
	var Util = window.Util;
	// var Settings = window.GlobalSettings;			//[13-04-2018]중복된 코드 주석 -jw.lim
	// var LoadingPanel = window.CommonLoadingPanel;	//[13-04-2018]안쓰는 코드 주석 -jw.lim
	var moment = window.moment;
	// var Loading = new LoadingPanel();				//[13-04-2018]안쓰는 코드 주석 -jw.lim
	var detailPopup, detailPopupElem = $("#device-detail-popup");
	var exceptPopup, exceptPopupElem = $("#except-detail-popup");
	var scheduleDetailPopup, scheduleDetailPopupElem = $("#schedule-detail-popup");
	var scheduleMorePopup, scheduleMorePopupElem = $("#schedule-more-popup");
	var exceptionalMorePopup, exceptionalMorePopupElem = $("#schedule-exceptional-more-popup");
	var scheduleLoadPopup, scheduleLoadPopupElem = $("#schedule-load-popup");
	var folderSelectPopup, folderSelectPopupElem = $("#folder-select-popup");

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
	var initStartDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
	var selectStartDate = initStartDate;
	var selectEndDate = nowDate; // 선택된 날짜
	// var selectTime;				//[13-04-2018]안쓰는 코드 주석 -jw.lim

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
	//[13-04-2018]사용하지 않는 변수 할당 해제 -jw.lim
	// var startCalendar = historyDatePopupStart.find(".calendar").kendoCalendar({
	historyDatePopupStart.find(".calendar").kendoCalendar({
		// culture: "de-DE",
		value: initStartDate,
		footer: false,
		change: function(){
			var value = this.value();
			selectDate(value, "start");
		}
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
	//[13-04-2018]사용하지 않는 변수 할당 해제 -jw.lim
	// var endCalendar = historyDatePopupEnd.find(".calendar").kendoCalendar({
	historyDatePopupEnd.find(".calendar").kendoCalendar({
		// culture: "de-DE",
		value: nowDate,
		footer: false,
		change: function(){
			var value = this.value();
			selectDate(value, "end");
		}
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
		var hourData = [ "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
						 "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23" ];
		var minuteData = [];
		for(var i = 0; i < 60; i++){
			var min;
			if(i < 10){ min = "0" + i; }else{ min = "" + i;}
			minuteData.push(min);
		}
		//[13-04-2018]사용하지 않는 변수 할당 해제 -jw.lim
		// var hourSelector = timePicker.find("input.hour").kendoDropDownList({
		timePicker.find("input.hour").kendoDropDownList({
			dataSource: hourData,
			change: function(){ h = this.value();}
		});
		//[13-04-2018]사용하지 않는 변수 할당 해제 -jw.lim
		// var minuteSelector = timePicker.find("input.minute").kendoDropDownList({
		timePicker.find("input.minute").kendoDropDownList({
			dataSource: minuteData,
			change: function(){ m = this.value(); }
		});
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
		var startCalendarPopup = $(".popup-window.dateStart").find(".device-history-calendar");
		startCalendarPopup.kendoPopupSingleWindow("openWindowPopup");
		startCalendarPopup.closest(".popup-window").css({ top: "212px", left: "759px" });
	});
	// End date
	historyPop.kendoPopupSingleWindow("addEventToFactory", "#popup-history .item.end [data-event=calendar]", "singleDeviceHistoryCalendarEndOpen", function(e){
		var endCalendarPopup = $(".popup-window.dateEnd").find(".device-history-calendar");
		endCalendarPopup.kendoPopupSingleWindow("openWindowPopup");
		endCalendarPopup.closest(".popup-window").css({ top: "212px", left: "1188px" });
	});
	// 캘린더 내부의 Ok 버튼
	historyPop.kendoPopupSingleWindow("addEventToFactory", ".device-history-calendar .popup-footer [data-event=ok]", "singleDeviceHistoryCalendarOk", function(e){
		var target = $(e.target);
		var myWindow = target.closest(".popup-window");
		var toolbar = historyPop.find(".toolbar");
		var periodDays = (selectEndDate.getTime() - selectStartDate.getTime()) / (1000 * 60 * 60 * 24); // End date와 start date의 차이 일수
		var tmpDate = new Date();

		if(periodDays > 365){ // 차이가 365 또는 366일보다 크면 End date의 1년 전으로 Start date를 지정한다.
			selectStartDate = new Date(selectEndDate.getFullYear(), selectEndDate.getMonth(), selectEndDate.getDate());
			selectStartDate.setYear(selectEndDate.getFullYear() - 1);
		}
		if((selectEndDate - tmpDate) > 0){ // End Date가 오늘보다 뒤이면 End Date를 오늘 날짜로 한다.
			selectEndDate = new Date();
		}
		if(selectStartDate > selectEndDate){
			selectStartDate = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), 1);
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
	// 캘린더에서 선택한 날짜 체크
	function selectDate(date, type){
		if(type === "start"){
			selectStartDate = date;
		}else if(type === "end"){
			selectEndDate = date;
		}
	}

	/*History End*/

	var daysOfWeekSequence = { "Mon" : 0, "Tue" : 1, "Wed" : 2, "Thu" : 3, "Fri" : 4, "Sat" : 5, "Sun" : 6 };


	/*
		New Detail Pop-up Base Configuration
	 */

	var defautGridOpt = {
		height: "100%",
		scrollable: true,
		sortable: false,
		filterable: false,
		pageable: false
	};


	/**
	 *   <ul>
	 *   <li>Schedule 상세 팝업에서 쓰이는 Widget 인스턴스 생성을 위한 scheme 옵션</li>
	 *   </ul>
	 *   @type {Object}
	 *   @name scheduleDetailScheme
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var scheduleDetailScheme = {
		id: "id",
		groupName : {
			updated : {
				template : "<div class='group blue'>" + I18N.prop("COMMON_LAST_UPDATE") + "</div>"
			},
			created : {
				template : "<div class='group blue'>" + I18N.prop("FACILITY_SCHEDULE_CREATE_CREATION_TITLE") + "</div>"
			},
			device: {
				template: "<div class='group'>" + I18N.prop("FACILITY_SCHEDULE_DEVICE") + '</div>'
			},
			period: {
				template: "<div class='group'>" + I18N.prop("FACILITY_SCHEDULE_PERIOD") + '</div>'
			},
			timeAndOperation: {
				template: "<div class='group'>" + I18N.prop("FACILITY_SCHEDULE_TIME_AND_OPERATION_SETTINGS") + "</div>"
			},
			time: {
				template: "<div class='group blue'>" + I18N.prop("COMMON_TIME") + "</div>"
			},
			operation: {
				template: "<div class='group blue'>" + I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_TITLE") + "</div>"
			},
			exceptionDay: {
				template: "<div class='group'>" + I18N.prop("FACILITY_SCHEDULE_EXCEPTION_DAY") + "</div>"
			},
			description: {
				template: "<div class='group'>" + I18N.prop("FACILITY_SCHEDULE_DESCRIPTION") + "</div>"
			}
		},
		fields : {
			updatedDate : {
				groupName : "updated",
				type : "text",
				name : I18N.prop("COMMON_DATE"),
				template : function(data){
					var value = "-";
					if(data.updated && data.updated.date){
						value = moment(data.updated.date).format("LLL").replace(/\./g, "-");
					}
					return value;
				}
			},
			updatedUser : {
				groupName : "updated",
				type : "text",
				name : I18N.prop("COMMON_MANAGER"),
				template : function(data){
					var value = "-";
					if(data.updated && data.updated.ums_users_name){
						value = data.updated.ums_users_name;
					}

					return Util.decodeHtml(value);
				}
			},
			createdDate : {
				groupName : "created",
				type : "text",
				name : I18N.prop("COMMON_DATE"),
				template : function(data){
					var value = "-";
					if(data.created && data.created.date){
						value = moment(data.created.date).format("LLL").replace(/\./g, "-");
					}
					return value;
				}
			},
			createdUser : {
				groupName : "created",
				type : "text",
				name : I18N.prop("COMMON_MANAGER"),
				template : function(data){
					var value = "-";
					if(data.created && data.created.ums_users_name){
						value = data.created.ums_users_name;
					}
					return Util.decodeHtml(value);
				}
			},
			devices : {
				groupName : "device",
				type : "grid",
				name : I18N.prop("FACILITY_DEVICE_DEVICE"),
				gridDataSource : function(data){
					var devices = data.devices;
					// var obj;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
					if(devices){
						var i, max = devices.length;
						var type, isMainType;
						for( i = 0; i < max; i++ ){
							if(devices[i].dms_devices_mappedType != "ControlPoint") {
								type = devices[i].dms_devices_mappedType || devices[i].dms_devices_type;
								isMainType = true;
							} else {
								type = devices[i].dms_devices_type;
								isMainType = false;
							}
							devices[i].displayType = Util.getDetailDisplayType(type, isMainType);
						}
					}

					return devices;
				},
				gridOptions : $.extend({}, defautGridOpt, {
					hideHeader : true,
					columns : [
						{
							template : ScheduleTemplate.detailPopupGroupListTemplate,
							field : "displayType",
							groupHeaderTemplate : function(data){
								var value = data.value;
								var type = Util.getDisplayClassType(value);
								var deviceIcon = "<span class='detail-img reg selected " + type + "'></span>";
								//Type 처리
								var count = "";
								var text = "-";
								if(value){
									//text = Util.getDisplayType(value);
									text = Util.getDetailDisplayTypeDeviceI18N(value);
								}
								if(data.count){
									count = data.count;
									/*if(count > 999){
										count = "999+";
									}*/
									text += " (" + count + ")";
								}

								return deviceIcon + text;
							}
						}
					],
					group : [
						{ field : "displayType", aggregates : [ { field: "displayType", aggregate : "count" }]}
					],
					dataBound: function(e) {
						var tr = this.element.find('tr');
						var i, len = tr.length;
						//last-child 클래스 추가.
						for(i = 1; i < len; i++) {
							this.collapseRow(tr[i]);
							if(i == len - 1) {
								tr[i].classList.add('last-child');
							} else if(tr[i].nextSibling.classList.contains('k-grouping-row')) tr[i].classList.add('last-child');
							else
						}
						//k-grouping-row 클래스에 해당하는 요소 영역에 클릭 이벤트로 expand/collapse 함수 등록
						for(i = 0; i < len; i++) {
							if(tr[i].classList.contains('k-grouping-row')) {
								$(tr[i]).on('click', function(e) {
									if(typeof e.target !== 'undefined' && e.target !== null && (e.target.classList.contains('k-i-expand') || e.target.classList.contains('k-i-collapse'))) {
										return;
									}
									if(typeof e.currentTarget !== 'undefined' && e.currentTarget !== null) {
										if($(e.currentTarget).find('a.k-i-expand').length > 0) $(e.currentTarget).find('a.k-i-expand').trigger('click');
										else $(e.currentTarget).find('a.k-i-collapse').trigger('click');
									}
								});
							}
						}
					}
				})
			},
			period: {
				groupName: "period",
				type: "text",
				name: "period",
				template: function(data) {
					var startDate = "-";
					var endDate = "-";

					var date = data.startDate || data.start;
					if(date){
						startDate = moment(date).format("L").replace(/\./g, "-");
					}
					date = data.endDate || data.end;
					if(date){
						var year = moment(date).year();
						if(year == ScheduleModel.MAX_END_DATE_YEAR){
							endDate = I18N.prop("FACILITY_SCHEDULE_ENDLESS");
						}else{
							endDate = moment(date).format("L").replace(/\./g, "-");
						}
					}
					return startDate + " ~ " + endDate;
				}
			},
			timeAndOperation: {
				groupName: "timeAndOperation",
				type : "text",
				name : 'timeAndOperation',
				template : function(){
					return '';
				}
			},
			time : {
				groupName : "time",
				name : I18N.prop("COMMON_TIME"),
				type:  kendo.ui.GridStyleDropDownList,
				widgetOptions: {
					index: 0,
					valuePrimitive: true,
					dataTextField: "text",
					dataValueField: "value"
				},
				widgetDataSource: function(data) {
					if (!data.configurations) return;
					var configurations = data.configurations;
					var list = [];
					for (var j = 0; j < configurations.length; j++) {
						var times = configurations[j].executionTimes;
						var i, max = times.length;
						var time, value, text, operation, daysOfWeek;
						for( i = 0; i < max; i++){
							time = times[i];
							time = time.split(":");
							time = time[0] + ":" + time[1];
							operation = ScheduleTemplate.configuOperationListTemplate({configurations: [configurations[j]]}, true);
							daysOfWeek = ScheduleTemplate.daysOfWeekTemplate({configurations : [configurations[j]]});
							text = time + ' / ' + operation + ' / ' + daysOfWeek;
							value = kendo.guid() + '-time-' + j;
							list.push({ value : value, text : text });
						}
					}
					list = list.sort(function(a, b){ return a.text.localeCompare(b.text); });
					return list;
				},
				widgetDisplaySetter: function(e) {
					var widget = e.widget;
					var sender = e.sender;
					widget.bind('onChange', function(evt) {
						var value = evt.event.sender.value();
						var dataSource = sender.dataSource.at(0);
						dataSource.selectedTime = value.substr(value.lastIndexOf('-time-') + 6);
						if(sender.updateDisplayField) {
							sender.updateDisplayField('operation');
						}
					});
					var ddl = $(widget.element.find('#grid-style-dropdownlist')).data('kendoDropDownList');
					ddl._triggerChange();
				}
			},
			operation : {
				groupName : "operation",
				type : "text",
				name : I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_TITLE"),
				template : function(data){
					var modes, operations, temperatures, configuration, controlPoint, lights, algorithm;
					var deviceTypes , deviceType, deviceControl, deviceControlObj;
					// var modesHtml, operHtml, tempHtml, configHtml;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
					var i, max, value;
					var unit = Settings.getTemperature().unit;
					var html = "-";
					var configurations = data.configurations;
					var initialSelectedTime;
					if(!configurations){
						return html;
					}
					// if (data.selectedTime) {
					// 	data.beforeScrollTop
					// }
					if(typeof data.selectedTime === 'undefined' || data.selectedTime === "") {
						if (!data.configurations) return;
						var configurations = data.configurations;
						var list = [];
						for (var j = 0; j < configurations.length; j++) {
							var times = configurations[j].executionTimes;
							var i, max = times.length;
							var time, value, text, operation, daysOfWeek;
							for( i = 0; i < max; i++){
								time = times[i];
								time = time.split(":");
								time = time[0] + ":" + time[1];
								operation = ScheduleTemplate.configuOperationListTemplate({configurations: [configurations[j]]}, true);
								daysOfWeek = ScheduleTemplate.daysOfWeekTemplate({configurations : [configurations[j]]});
								text = time + ' / ' + operation + ' / ' + daysOfWeek;
								value = kendo.guid() + '-time-' + j;
								list.push({ value : value, text : text });
							}
						}
						list = list.sort(function(a, b){ return a.text.localeCompare(b.text); });
						initialSelectedTime = list[0].value.substr(list[0].value.lastIndexOf('-time-') + 6);
					}

					var selectedTime = data.selectedTime || initialSelectedTime;
					for(var configIndex = 0, configLengthMax = configurations.length; configIndex < configLengthMax; configIndex++) {
						configurations[configIndex].selected = false;
					}
					configurations[selectedTime].set('selected', true);
					deviceTypes = configurations[selectedTime].deviceTypes;
					algorithm = configurations[selectedTime].algorithm;
					var control = {
						operations : [],
						temperatures : [],
						modes : [],
						configuration : {},
						aoControlPoint : {},
						doControlPoint : {},
						lights : []
					};

					if(typeof deviceTypes === 'undefined') deviceTypes = [];
					max = deviceTypes.length;
					for( i = 0; i < max; i++ ){
						deviceType = deviceTypes[i];
						deviceControl = deviceType.control;
						if(deviceControl){
							if(deviceControl.operations){
								deviceControlObj = deviceControl.operations;
								if(deviceControlObj instanceof kendo.data.ObservableArray){
									deviceControlObj = deviceControlObj.toJSON();
								}
								control.operations = control.operations.concat(deviceControlObj);
							}
							if(deviceControl.temperatures){
								deviceControlObj = deviceControl.temperatures;
								if(deviceControlObj instanceof kendo.data.ObservableArray){
									deviceControlObj = deviceControlObj.toJSON();
								}
								control.temperatures = control.temperatures.concat(deviceControlObj);
							}
							if(deviceControl.modes){
								deviceControlObj = deviceControl.modes;
								if(deviceControlObj instanceof kendo.data.ObservableArray){
									deviceControlObj = deviceControlObj.toJSON();
								}
								control.modes = control.modes.concat(deviceControlObj);
							}
							if(deviceControl.configuration){
								control.configuration = deviceControl.configuration;
							}

							if(deviceType.dms_devices_type.indexOf("AO") != -1 && deviceControl.controlPoint){
								control.aoControlPoint = deviceControl.controlPoint;
							}

							if(deviceType.dms_devices_type.indexOf("DO") != -1 && deviceControl.controlPoint){
								control.doControlPoint = deviceControl.controlPoint;
							}

							if(deviceControl.lights){
								control.lights = deviceControl.lights;
							}
						}
					}

					if(control){
						html = "";
						var id, mode, power, desired, subType;
						modes = control.modes;
						if(modes){
							max = modes.length;
							subType = "";
							for( i = 0; i < max; i++ ){
								id = modes[i].id;
								mode = modes[i].mode;
								if(id.indexOf("Ventilator") != -1){
									subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_VENTILATOR") + ")";
								}else if(id.indexOf("DHW") != -1){
									subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_DHW") + ")";
								}
								id = Util.getDetailDisplayTypeDeviceI18N(id) + subType + " " + I18N.prop("FACILITY_DEVICE_SAC_INDOOR_MODE");
								mode = I18N.prop("FACILITY_INDOOR_MODE_" + mode.toUpperCase());
								html += '<div class="popup-text-wrapper"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + mode + '</div></div></div>';
							}
						}

						operations = control.operations;
						if(operations){
							max = operations.length;
							subType = "";
							for( i = 0; i < max; i++ ){
								id = operations[i].id;
								power = operations[i].power;
								if(id == "General"){
									id = Util.getDetailDisplayTypeDeviceI18N("Light");
								}else{
									if(id.indexOf("Ventilator") != -1){
										subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_VENTILATOR") + ")";
									}else if(id.indexOf("DHW") != -1){
										subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_DHW") + ")";
									}
									id = Util.getDetailDisplayTypeDeviceI18N(id);
								}
								id = id + subType + " " + I18N.prop("FACILITY_INDOOR_CONTROL_POWER");
								power = I18N.prop("FACILITY_DEVICE_STATUS_" + power.toUpperCase());
								html += '<div class="popup-text-wrapper"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + power + '</div></div></div>';
							}
						}

						lights = control.lights;
						if(lights){
							max = lights.length;
							for( i = 0; i < max; i++ ){
								value = lights[i].dimmingLevel;
								html += '<div class="popup-text-wrapper"><div class="tb"><div class="tbc"><span>' + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + " " + I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS") + '</span> :&nbsp;</div><div class="tbc">' + value + '</div></div></div>';
							}
						}

						temperatures = control.temperatures;
						if(temperatures){
							max = temperatures.length;
							subType = "";
							for( i = 0; i < max; i++ ){
								id = temperatures[i].id;
								if(id.indexOf("Room") != -1){
									subType = "(" + I18N.prop("FACILITY_INDOOR_SET_TEMPERATURE") + ")";
								}else if(id.indexOf("DHW") != -1){
									subType = "(" + I18N.prop("FACILITY_INDOOR_DHW_SET_TEMPERATURE") + ")";
								}else if(id.indexOf("WaterOutlet") != -1){
									subType = "(" + I18N.prop("FACILITY_INDOOR_WATER_OUT_SET_TEMP") + ")";
								}
								desired = temperatures[i].desired;
								id = Util.getDetailDisplayTypeDeviceI18N(id) + subType;
								html += '<div class="popup-text-wrapper"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + desired + '<span>' + Util.CHAR[unit] + '</span></div></div></div>';
							}
						}

						configuration = control.configuration;
						if(configuration){
							if(configuration.remoteControl){
								var remoteControl = configuration.remoteControl;
								if(remoteControl == "Allowed"){
									remoteControl = I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL_ENABLE");
								}else{
									remoteControl = I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL_DISABLE");
								}
								html += '<div class="popup-text-wrapper"><div class="tb"><div class="tbc"><span>' + I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL") + '</span> :&nbsp;</div><div class="tbc">' + remoteControl + '</div></div></div>';
							}
						}

						controlPoint = control.aoControlPoint;
						if(controlPoint && (typeof controlPoint.value !== 'undefined' && controlPoint.value !== null)){
							html += '<div class="popup-text-wrapper"><div class="tb"><div class="tbc"><span>AO ' + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + '</span> :&nbsp;</div><div class="tbc">' + controlPoint.value + '</div></div></div>';
						}

						controlPoint = control.doControlPoint;
						if(controlPoint && (typeof controlPoint.value !== 'undefined' && controlPoint.value !== null)){
							html += '<div class="popup-text-wrapper"><div class="tb"><div class="tbc"><span>DO ' + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + '</span> :&nbsp;</div><div class="tbc">' + controlPoint.value + '</div></div></div>';
						}

						if(algorithm){
							mode = algorithm.mode;
							if(mode == "PreCooling"){
								value = algorithm.preCoolingTemperature;
								mode = "PRECOOLING";
							}else{
								value = algorithm.preHeatingTemperature;
								mode = "PREHEATING";
							}
							html += '<div class="popup-text-wrapper"><div class="tb"><div class="tbc"><span>' + I18N.prop("FACILITY_INDOOR_" + mode) + '</span> :&nbsp;</div><div class="tbc">' + value + '<span>' + Util.CHAR[unit] + '</span></div></div></div>';
						}
					}

					return html;
				}
			},
			exceptionDay: {
				groupName: "exceptionDay",
				type: "grid",
				name: I18N.prop("FACILITY_SCHEDULE_EXCEPTION_DAY"),
				gridDataSource : function(data) {
					return data.exceptionalDays;
				},
				gridOptions: $.extend({}, defautGridOpt, {
					hideHeader : false,
					columns: [{
						field: "name",
						width: 224,
						title: I18N.prop("COMMON_NAME"),
						template: function(data) {
							return typeof data.name != 'undefined' ? data.name : '-';
						}
					},{
						field: "preiod",
						width: 124,
						title: I18N.prop("FACILITY_SCHEDULE_PERIOD"),
						template: function(data) {
							var startDate = "-", endDate = "-";
							if(data.startDate){
								startDate = moment(data.startDate).format("L").replace(/\./g, "-");
							}

							if(data.endDate) {
								endDate = moment(data.endDate).format("L").replace(/\./g, "-");
							}

							if(startDate == "-" && endDate == "-") return "-";
							if(startDate === endDate) return endDate;
							return startDate + " ~<br>" + endDate;
						}
					}, {
						field: "description",
						width: 300,
						title: I18N.prop("FACILITY_SCHEDULE_DESCRIPTION"),
						template: function(data) {
							return typeof data.description != 'undefined' ? data.description : '-';
						}
					}],
					noRecords: {
						template: "<div class='no-records-text'>" + I18N.prop('FACILITY_SCHEDULE_NO_EXCEPTION_DAY') + "</div>"
					}
				})
			},
			description : {
				groupName: "description",
				type : "text",
				name : I18N.prop("COMMON_DESCRIPTION"),
				template : function(data){
					var value = data.description ? data.description : "-";
					return Util.decodeHtml(value);
				}
			}
		}
	};

	/**
	 *   <ul>
	 *   <li>예외일 상세 팝업에서 쓰이는 Widget 인스턴스 생성을 위한 scheme 옵션</li>
	 *   </ul>
	 *   @type {Object}
	 *   @name exceptionalDetailScheme
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var exceptionalDetailScheme = {
		id: "id",
		fields : {
			title : {
				type : "text",
				name : I18N.prop("FACILITY_SCHEDULE_EXCEPTIONAL_DAY_NAME"),
				editable : true,
				template : ScheduleTemplate.scheduleDetailNameTemplate,
				validator : {
					type : "name",
					required : true
				},
				hasInputRemoveBtn : true,
				editCss : {
					width : "100%"
				}
			},
			date : {
				type : "text",
				name : I18N.prop("COMMON_DATE"),
				editable : true,
				editTemplate : '<input data-role="commondatepicker" data-is-start="true" data-bind="value: fields.start, events:{ open: getOldStartDate, change : changeStartTime }" data-format="yyyy-MM-dd" title="datepicker" style="width: 46.5%;"/><span style="display:inline-block;width:7%;text-align:center;"><span>-</span></span><input data-role="commondatepicker" data-is-end="true" data-bind="value:fields.end, events:{ open: getOldEndDate, change : changeEndTime }" data-format="yyyy-MM-dd" title="datepicker" style="width: 46.5%;"/>',
				editViewModel : {
					fields : {
						start : null,
						end : null,
						oldStartDate: null,
						oldEndDate: null
					},
					init : function(e){
						if(!this.fields.start) this.fields.start = new Date();
						if(!this.fields.end) this.fields.end = new Date();
					},
					getOldStartDate: function(e){
						var st = this.get("fields.start");
						this.set("fields.oldStartDate", st);
					},
					getOldEndDate: function(e){
						var ed = this.get("fields.end");
						this.set("fields.oldEndDate", ed);
					},
					changeStartTime : function(e){
						//time check
						var st = this.get("fields.start");
						var ed = this.get("fields.end");
						var resultDate;
						var todayDate = new Date();

						//하기 사양 v1.1에서 삭제
						if(st < todayDate){ // StartDate가 오늘보다 이전인 경우 오늘로 보정
							this.set("fields.start", todayDate);
						}
						resultDate = this.get("fields.start");
						resultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate(), 0, 0, 0);
						this.set("fields.start", resultDate);

						// StartDate가 EndDate보다 늦거나, End Date가 Start Date보다 빠를 경우, EndDate를 StartDate에 맞추도록 수정
						if(st > ed || ed < st){
							resultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate(), 23, 59, 59);
							this.set("fields.end", resultDate);
						}

						var dialog = $(e.sender.element).closest(".k-content").data("kendoDetailDialog");
						if(dialog){
							dialog.enableSaveBtn();
						}
						// console.log(this.get("fields.start"));
					},
					changeEndTime : function(e){
						//time check
						var st = this.get("fields.start");
						var ed = this.get("fields.end");
						var resultDate;
						//v1.1에서 사향 삭제
						/*if(ed < tmpDate){ // EndDate가 오늘보다 이전인 경우 오늘로 보정
							this.set("fields.end", new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 23, 59, 59));
						}*/
						// StartDate가 EndDate보다 늦거나, End Date가 Start Date보다 빠를 경우, EndDate를 StartDate에 맞추도록 수정
						if(st > ed || ed < st) resultDate = st;
						else resultDate = this.get("fields.end");

						resultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate(), 23, 59, 59);
						this.set("fields.end", resultDate);

						var dialog = $(e.sender.element).closest(".k-content").data("kendoDetailDialog");
						if(dialog){
							dialog.enableSaveBtn();
						}
						// console.log(this.get("fields.end"));
					}
				},
				template : function(data){
					data.fields = {};
					data.start = data.start || data.startDate;
					data.end = data.end || data.endDate;
					var startDate = data.startDate || data.start;
					var endDate = data.endDate || data.end;
					if(!data.fields){
						data.fields.start = startDate;
						data.fields.end = endDate;
					}

					startDate = moment(startDate).format("L").replace(/\./g, "-");
					endDate = moment(endDate).format("L").replace(/\./g, "-");
					return startDate + " ~ " + endDate;
				}
			},
			description : {
				type : "text",
				name : I18N.prop("COMMON_DESCRIPTION"),
				validator : {
					type : "description"
				},
				editCss : {
					width : "100%"
				},
				// validator : true,
				hasInputRemoveBtn : true,
				editable : true
			}
		}
	};

	var deleteSchedule = function(e) {
		var result;
		result = this.dataSource.get(this.contentViewModel.id);
		this.trigger("onDelete", { result : result });
	};
	var editSchedule = function(e) {
		var result;
		result = this.dataSource.get(this.contentViewModel.id);
		this.trigger("onEdit", { result : result });
	};
	/**
	 *   <ul>
	 *   <li>스케쥴에서 쓰이는 공용 상세 팝업의 기본 옵션</li>
	 *   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	 *   </ul>
	 *   @type {Object}
	 *   @name scheduleDetailPopupConfig
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var scheduleDetailPopupConfig = {
		title : I18N.prop("COMMON_BTN_DETAIL"),
		initialCollapse: false,
		width: 822,
		height: 830,
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			EDIT : 2
		},
		contentViewModel : {
			detailType : I18N.prop("COMMON_GENERAL"),
			deleteSchedule: deleteSchedule,
			editSchedule: editSchedule
		},

		//<button class="device-detail-header-history-btn k-button" data-bind="events: {click : clickHistoryBtn }">History</button>
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General<span></div><div class="detail-dialog-detail-content-field-list"></div><div class="schedule-action-box"><button class="k-button delete" data-bind="click: deleteSchedule">' + I18N.prop("COMMON_BTN_DELETE") + '</button><button class="k-button edit" data-bind="click: editSchedule">' + I18N.prop("COMMON_BTN_EDIT") + '</button></div>',
		listTemplate : ScheduleTemplate.scheduleDetailListTemplate,
		headerTemplate : "<span><span>#:count#</span>" + I18N.prop("FACILITY_SCHEDULE_SELECTED_SCHEDULE") + "</span>",
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

					e.sender.trigger("onDelete", { result : result, results : results });
					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_EDIT"),
				visible : true,
				action : function(e){
					var result, results;
					result = e.sender.getSelectedData();
					if(e.sender.dataSource.total() > 1){
						results = e.sender.dataSource.data();
					}
					e.sender.trigger("onEdit", { result : result, results : results });
					return false;
				}
			}
		],
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		onTypeChange : function(e){
			var type = e.type;
			var BTN = e.sender.BTN;
			var senderScheduleDetailPopup = e.sender;
			senderScheduleDetailPopup.setActions(BTN.CLOSE, { disabled : false });
			if(type == "single"){
				senderScheduleDetailPopup.setActions(BTN.EDIT, { visible : true });
				senderScheduleDetailPopup.setActions(BTN.DELETE, { visible : true });
			}else if(type == "multi"){
				senderScheduleDetailPopup.setActions(BTN.EDIT, { visible : false });
				senderScheduleDetailPopup.setActions(BTN.DELETE, { visible : false });
			}
		},
		scheme : scheduleDetailScheme
	};
	var sortName = function(a, b, descending) {
		return a.title.localeCompare(b.title, 'en', {
			numeric: true
		});
	};
	/**
	 *   <ul>
	 *   <li>스케쥴 생성 화면에서 쓰이는 Load 팝업의 기본 옵션</li>
	 *   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	 *   </ul>
	 *   @type {Object}
	 *   @name loadPopupConfig
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var loadPopupConfig = {
		title : I18N.prop("FACILITY_SCHEDULE_LOAD_SCHEDULE"), //Date
		width: 822,
		height: 830,
		isOnlyMulti : true,
		initialCollapse: false,
		gridOptions : {
			columns : [
				{ field : "checked", template : ScheduleTemplate.radioCellTemplate, width : 45, sortable: false},
				/*KendoScheduler 바인딩 시, 어트리뷰트가 name->title로 변환되므로 Scheduler에서 사용되는 More Popup은 title로 지정*/
				{ field : "title", title : I18N.prop("FACILITY_SCHEDULE_SCHEDULE_NAME"), sortable : { compare: sortName }, width : 194, template : ScheduleTemplate.scheduleLoadDetailNameTemplate },
				{ field : "updated.date", title : I18N.prop("FACILITY_SCHEDULE_LAST_UPDATE"), sortable : true, width : 134, template : ScheduleTemplate.scheduleUpdatedDateTemplate, attributes: {"class": "td-text-center"}},
				{ field : "operations", title : I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_TITLE"), width : 164, template : ScheduleTemplate.configuOperationListTemplate, sortable : false},
				{ field : "status", title : I18N.prop("COMMON_STATUS"), width : 100, template : ScheduleTemplate.scheduleActivatedTemplate, sortable : false}
			],
			sortable : true,
			hasRadioModel : true
		},
		buttonsIndex : {
			CANCEL : 0,
			SELECT : 1
		},
		onTypeChange : function(e){
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.CANCEL, { disabled : false });
			e.sender.setActions(BTN.SELECT, { disabled : true });
		},
		contentViewModel : {
			detailType : I18N.prop("COMMON_GENERAL")
		},
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		//listTemplate : ScheduleTemplate.scheduleDetailListTemplate,
		headerTemplate : '<span>' + I18N.prop("COMMON_TOTAL") + ': <span>#=count#</span></span>',
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
			},
			{
				text : I18N.prop("COMMON_BTN_LOAD"),
				visible : true,
				disabled : true,
				action : function(e){
					var result, results;
					results = e.sender.grid.getCheckedData();
					if(results.length > 0){
						result = results[0];
						e.sender.trigger("onSelect", { result : result, results : results });
					}

					return false;
				}
			}
		],
		scheme : scheduleDetailScheme
	};

	var selectFolderPopupConfig = {
		title : I18N.prop("FACILITY_SCHEDULE_CREATE_SELECT_FOLDER"),
		width: 404,
		height: 468,
		isOnlyMulti : true,
		initialCollapse: false,
		gridOptions : {
			showGridHeader: false,
			columns : [
				{ field : "checked", template : ScheduleTemplate.radioCellTemplate, width : 37, sortable:false},
				/*KendoScheduler 바인딩 시, 어트리뷰트가 name->title로 변환되므로 Scheduler에서 사용되는 More Popup은 title로 지정*/
				{ field : "name", sortable : false }
				// { field : "times", title : I18N.prop("COMMON_TIME"), sortable : true, width : 120, template : ScheduleTemplate.executionTimeListTemplate},
				// { field : "operations", title : I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_TITLE"), width : 460, template : ScheduleTemplate.loadOperationListTemplate, sortable : false}
			],
			sortable : true,
			hasRadioModel : true
		},
		buttonsIndex : {
			CLOSE : 0,
			SAVE : 1
		},
		onTypeChange : function(e){
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.CLOSE, { disabled : false });
			e.sender.setActions(BTN.SAVE, { disabled : false });
		},
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '',
		//listTemplate : ScheduleTemplate.scheduleDetailListTemplate,
		headerTemplate : '',
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
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE"),
				visible : true,
				disabled : false,
				action : function(e){
					var result, results;
					results = e.sender.grid.getCheckedData();
					if(results.length > 0){
						result = results[0];
						e.sender.trigger("onSelect", { result : result, results : results });
					}

					return false;
				}
			}
		]
	};

	/**
	 *   <ul>
	 *   <li>스케쥴 화면에서 쓰이는 More 팝업의 기본 옵션</li>
	 *   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	 *   </ul>
	 *   @type {Object}
	 *   @name morePopupConfig
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var morePopupConfig = {
		title : I18N.prop("FACILITY_SCHEDULE_MORE_SCHEDULE"), //Date
		width: 884,
		height: 830,
		isOnlyMulti : true,
		gridOptions : {
			columns : [
				{ field : "checked", template : ScheduleTemplate.checkboxCellTemplate, width : 37, sortable:false},
				/*KendoScheduler 바인딩 시, 어트리뷰트가 name->title로 변환되므로 Scheduler에서 사용되는 More Popup은 title로 지정*/
				{ field : "title", title : I18N.prop("FACILITY_SCHEDULE_SCHEDULE_NAME"), sortable : true, width : 200, template : ScheduleTemplate.scheduleDetailNameTemplate },
				{ field : "times", title : I18N.prop("COMMON_TIME"), sortable : true, width : 120, template : ScheduleTemplate.configuExecutionTimeListTemplate},
				{ field : "operations", title : I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_TITLE"), width : 460, template : ScheduleTemplate.moreOperationListTemplate, sortable : false}
			],
			sortable : true,
			hasCheckedModel : true
		},
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			EDIT : 2
		},
		onTypeChange : function(e){
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.CLOSE, { disabled : false });
			e.sender.setActions(BTN.EDIT, { disable : true });
			e.sender.setActions(BTN.DELETE, { disabled : true });
		},
		contentViewModel : {
			detailType : I18N.prop("COMMON_GENERAL")
		},
		headerViewModel : {
			checkedNum : 0
		},
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		//listTemplate : ScheduleTemplate.scheduleDetailListTemplate,
		headerTemplate : '<span> <span data-bind="text: checkedNum"></span> ' + I18N.prop("FACILITY_SCHEDULE_SELECTED_SCHEDULE") + '<ul class="k-reset k-header k-scheduler-views legend"><li class="scheduler-legend"><i class="square indoor"></i><span class="legend-text">' + I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR") + '</span></li><li class="scheduler-legend"><i class="square light"></i><span class="legend-text">' + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + '</span></li><li class="scheduler-legend"><i class="square indoorlight"></i><span class="legend-text">' + I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR") + ' + ' + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + '</span></li><li class="scheduler-legend"><i class="square others"></i><span class="legend-text">' + I18N.prop("FACILITY_DEVICE_OTHERS") + '</span></li><li class="scheduler-legend"><i class="square pause"></i><span class="legend-text">' + I18N.prop("COMMON_PAUSE") + '</span></li></ul></span>',
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
			},
			{
				text : I18N.prop("COMMON_BTN_DELETE"),
				visible : true,
				disabled : true,
				action : function(e){
					var result, results;
					results = e.sender.grid.getCheckedData();
					if(results.length > 0){
						result = results[0];
						e.sender.trigger("onDelete", { result : result, results : results });
					}

					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_EDIT"),
				visible : true,
				disabled : true,
				action : function(e){
					var result, results;
					results = e.sender.grid.getCheckedData();
					if(results.length > 0){
						result = results[0];
						e.sender.trigger("onEdit", { result : result, results : results });
					}
					return false;
				}
			}
		],
		scheme : scheduleDetailScheme
	};
	/**
	 *   <ul>
	 *   <li>예외일 화면에서 쓰이는 More 팝업의 기본 옵션</li>
	 *   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	 *   </ul>
	 *   @type {Object}
	 *   @name exceptionalMorePopupConfig
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var exceptionalMorePopupConfig = {
		title : I18N.prop("FACILITY_SCHEDULE_MORE_EXCEPTIONAL_DAYS"), //Date
		width: 884,
		height: 830,
		isOnlyMulti : true,
		gridOptions : {
			columns : [
				/*KendoScheduler 바인딩 시, 어트리뷰트가 name->title로 변환되므로 Scheduler에서 사용되는 More Popup은 title로 지정*/
				{ field : "title", title : I18N.prop("FACILITY_SCHEDULE_EXCEPTIONAL_DAY_NAME"), sortable : true, width : 200, template : ScheduleTemplate.scheduleDetailNameTemplate },
				{ field : "description", title : I18N.prop("COMMON_DESCRIPTION"), width : 460, sortable : false, template : function(data){
					var txt = "-";
					txt = data.description ? data.description : txt;
					return Util.decodeHtml(txt);
				}}
			],
			sortable : true,
			hasCheckedModel : true
		},
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			EDIT : 2
		},
		onTypeChange : function(e){
			// var type = e.type;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.CLOSE, { disabled : false });
			e.sender.setActions(BTN.EDIT, { disabled : true });
			e.sender.setActions(BTN.DELETE, { disabled : true });
		},
		/*contentViewModel : {
			detailType : "General"
		},*/
		headerViewModel : {
			checkedNum : 0
		},
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"></div><div class="detail-dialog-detail-content-field-list"></div>',
		headerTemplate : '<span>' + I18N.prop("FACILITY_SCHEDULE_SELECTED_EXCEPTIONAL_DAYS") + ': <span data-bind="text: checkedNum"></span></span>',
		isCustomActions : true,

		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				disabled : false,
				action : function(e){
					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			},
			{
				text : I18N.prop("COMMON_BTN_DELETE"),
				visible : true,
				disabled : true,
				action : function(e){
					var result, results;
					results = e.sender.grid.getCheckedData();
					if(results.length > 0){
						result = results[0];
						e.sender.trigger("onDelete", { result : result, results : results });
					}

					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_EDIT"),
				visible : true,
				disabled : true,
				action : function(e){
					var result, results;
					results = e.sender.grid.getCheckedData();
					if(results.length > 0){
						result = results[0];
						e.sender.trigger("onEdit", { result : result, results : results });

					}
					return false;
				}
			}
		],
		scheme : exceptionalDetailScheme
	};
	/**
	 *   <ul>
	 *   <li>스케쥴 생성 화면에서 쓰이는 기기 상세 팝업의 기본 옵션</li>
	 *   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	 *   </ul>
	 *   @type {Object}
	 *   @name deviceDetailPopupConfig
	 *   @alias module:app/operation/schedule/config/popup-config
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
				// var data = detailPopup.getSelectedData();				//[13-04-2018]안쓰는 코드 주석 -jw.lim
				//
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
							//                            return conf.remoteControl;
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
	/**
	 *   <ul>
	 *   <li>예외일 화면에서 쓰이는 예외일 상세 팝업의 기본 옵션</li>
	 *   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	 *   </ul>
	 *   @type {Object}
	 *   @name exceptionalConfig
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var exceptionalConfig = {
		title : I18N.prop("COMMON_BTN_DETAIL"),
		width: 652,
		height: 352,
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			EDIT : 2,
			CANCEL : 3,
			SAVE : 4
		},
		contentViewModel : {
			clickHistoryBtn : function(){
				// var data = detailPopup.getSelectedData();				//[13-04-2018]안쓰는 코드 주석 -jw.lim
				//
				historyGrid.data("kendoGrid").dataSource.data(historyData); // History 그리드 데이터 바인딩
				historyPop.kendoPopupSingleWindow("openWindowPopup"); // History 팝업 오픈
			},
			detailType : I18N.prop("COMMON_GENERAL")
		},
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"></div><div class="detail-dialog-detail-content-field-list"></div>',
		listTemplate : function(data){
			var name = data.name = data.title || data.name;
			name = name ? name : "";
			data.title = name;
			return "<span data-bind='text: title'>" + Util.decodeHtml(name) + "</span>";
		},
		headerTemplate : "<span>" + I18N.prop("FACILITY_SCHEDULE_SELECTED_EXCEPTIONAL_DAYS") + ": <span>#:count #</span></span>",
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		onTypeChange : function(e){
			var type = e.type;
			var senderExceptPopup = e.sender;
			var BTN = e.sender.BTN;
			if(type == "create"){
				senderExceptPopup.setEditable(true);
				senderExceptPopup.setActions(BTN.SAVE, { visible : true });
				senderExceptPopup.setActions(BTN.CANCEL, { visible : true });

				senderExceptPopup.setActions(BTN.EDIT, { visible : false });
				senderExceptPopup.setActions(BTN.CLOSE, { visible : false });
				senderExceptPopup.setActions(BTN.DELETE, { visible : false });
			}else if(type == "detail"){
				senderExceptPopup.setActions(BTN.SAVE, { visible : false });
				senderExceptPopup.setActions(BTN.CANCEL, { visible : false });

				senderExceptPopup.setActions(BTN.CLOSE, { visible : true });

				var data = senderExceptPopup.dataSource;
				if(data.total() > 1){
					senderExceptPopup.setActions(BTN.DELETE, { visible : false });
					senderExceptPopup.setActions(BTN.EDIT, { visible : false });
					senderExceptPopup.wrapper.css({width : 652, height : 830});
					senderExceptPopup.element.css({height : 701});
				}else{
					senderExceptPopup.setActions(BTN.DELETE, { visible : true });
					senderExceptPopup.setActions(BTN.EDIT, { visible : true });
					senderExceptPopup.wrapper.css({width : 652, height : 352});
					senderExceptPopup.element.css({height : 223});
				}
			}else if(type == "edit"){
				senderExceptPopup.setEditable(true);
				senderExceptPopup.setActions(BTN.SAVE, { visible : true });
				senderExceptPopup.setActions(BTN.CANCEL, { visible : true });

				senderExceptPopup.setActions(BTN.EDIT, { visible : false });
				senderExceptPopup.setActions(BTN.CLOSE, { visible : false });
				senderExceptPopup.setActions(BTN.DELETE, { visible : false });
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

					e.sender.trigger("onDelete", { result : result, results : results });
					return false;
				}
			},
			{
				text : I18N.prop("COMMON_BTN_EDIT"),
				visible : true,
				action : function(e){
					e.sender.trigger("onEdit");
					e.sender.setEditable(true);
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
						if(e.sender.dialogType == "create"){
							e.sender.close();
						}
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
					// var type = e.sender.dialogType;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
					//save trigger save with selected data
					var result, results;
					var data = e.sender.getSelectedData();
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
		scheme : exceptionalDetailScheme
	};


	/**
	 *   <ul>
	 *   <li>스케쥴 상세 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	 *   </ul>
	 *   @function getScheduleDetailPopup
	 *   @returns {kendoWidgetInstance} - 스케쥴 상세 팝업 Widget 인스턴스
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var getScheduleDetailPopup = function(){
		scheduleDetailPopup = scheduleDetailPopupElem.kendoDetailDialog(scheduleDetailPopupConfig).data("kendoDetailDialog");
		var editScheduleFunc = editSchedule.bind(scheduleDetailPopup);
		var deleteScheduleFunc = deleteSchedule.bind(scheduleDetailPopup);
		// scheduleDetailPopup.options.contentViewModel.editSchedule = editScheduleFunc;
		scheduleDetailPopup.setOptions({
			contentViewModel: {
				detailType: I18N.prop("COMMON_GENERAL"),
				editSchedule: editScheduleFunc,
				deleteSchedule: deleteScheduleFunc
			}
		});

		return scheduleDetailPopup;
	};
	/**
	 *   <ul>
	 *   <li>스케쥴 More 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	 *   </ul>
	 *   @function getScheduleMorePopup
	 *   @returns {kendoWidgetInstance} - 스케쥴 More 팝업 Widget 인스턴스
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var getScheduleMorePopup = function(){
		scheduleMorePopup = scheduleMorePopupElem.kendoDetailDialog(morePopupConfig).data("kendoDetailDialog");
		return scheduleMorePopup;
	};
	/**
	 *   <ul>
	 *   <li>기기 상세 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	 *   </ul>
	 *   @function getDetailPopup
	 *   @returns {kendoWidgetInstance} - 기기 상세 팝업 Widget 인스턴스
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var getDetailPopup = function(){
		detailPopup = detailPopupElem.kendoDetailDialog(deviceDetailPopupConfig).data("kendoDetailDialog");
		return detailPopup;
	};
	/**
	 *   <ul>
	 *   <li>예외일 More 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	 *   </ul>
	 *   @function getExceptionalMorePopup
	 *   @returns {kendoWidgetInstance} - 예외일 More 팝업 Widget 인스턴스
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var getExceptionalMorePopup = function(){
		exceptionalMorePopup = exceptionalMorePopupElem.kendoDetailDialog(exceptionalMorePopupConfig).data("kendoDetailDialog");
		return exceptionalMorePopup;
	};
	/**
	 *   <ul>
	 *   <li>예외일 상세 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	 *   </ul>
	 *   @function getExceptionalPopup
	 *   @returns {kendoWidgetInstance} - 예외일 상세 팝업 Widget 인스턴스
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var getExceptionalPopup = function(){
		exceptPopup = exceptPopupElem.kendoDetailDialog(exceptionalConfig).data("kendoDetailDialog");
		return exceptPopup;
	};
	/**
	 *   <ul>
	 *   <li>스케쥴 Load 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	 *   </ul>
	 *   @function getLoadPopup
	 *   @returns {kendoWidgetInstance} - 스케쥴 Load 팝업 Widget 인스턴스
	 *   @alias module:app/operation/schedule/config/popup-config
	 */
	var getLoadPopup = function(){
		scheduleLoadPopup = scheduleLoadPopupElem.kendoDetailDialog(loadPopupConfig).data("kendoDetailDialog");
		return scheduleLoadPopup;
	};

	var getSelectFolderPopup = function() {
		folderSelectPopup = folderSelectPopupElem.kendoDetailDialog(selectFolderPopupConfig).data("kendoDetailDialog");
		return folderSelectPopup;
	};


	return {
		getDetailPopup : getDetailPopup,
		getExceptionalPopup : getExceptionalPopup,
		getScheduleDetailPopup : getScheduleDetailPopup,
		getScheduleMorePopup : getScheduleMorePopup,
		getExceptionalMorePopup : getExceptionalMorePopup,
		getLoadPopup : getLoadPopup,
		getSelectFolderPopup : getSelectFolderPopup,
		daysOfWeekSequence : daysOfWeekSequence
	};

});

//# sourceURL=operation/schedule/config/popup-config.js
