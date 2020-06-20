/**
*
*   <ul>
*       <li>Facility - Rule에서 표시할 상세 팝업 옵션 값 설정</li>
*       <li>Rule/Rule Alarm & Log 상세 팝업 등의 인스턴스를 생성한다.</li>
*       <li>Message/Confirm Dialog 등의 인스턴스를 생성한다.</li>
*   </ul>
*   @module app/operation/rule/common/widget
*   @requires config
*   @requires lib/moment
*
*/
define("operation/rule/common/widget", ["device/common/device-template","operation/rule/template/rule-template",
	"operation/schedule/config/schedule-template", "device/common/device-util",
	   "operation/rule/model/rule-model"], function(DeviceTemplate, RuleTemplate, ScheduleTemplate, DeviceUtil, RuleModel){
	var moment = window.moment;
	var I18N = window.I18N;
	var Util = window.Util;
	var Settings = window.GlobalSettings;
	var kendo = window.kendo;

	var createNewWidget = function(id, Widget, options){
		var elem = $("<div/>").attr("id", id);
		return new Widget(elem, options);
	};
	var msgDialog, msgDialogElem = $("<div/>");
	var confirmDialog, confirmDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");
	confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");


	var ruleDetailPopup, ruleDetailPopupElem = $("#rule-detail-popup");
	var ruleAlarmDetailPopup, ruleAlarmDetailPopupElem = $("#rule-alarm-detail-popup");
	var deviceDetailPopup, deviceDetailPopupElem = $("#device-detail-popup");

	var ruleLoadPopup, ruleLoadPopupElem = $("#rule-load-popup");
	var ruleAlarmLoadPopup, ruleAlarmLoadPopupElem = $("#rule-alarm-load-popup");

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

	var daysOfWeekSequence = { "Mon" : 0, "Tue" : 1, "Wed" : 2, "Thu" : 3, "Fri" : 4, "Sat" : 5, "Sun" : 6 };
	/**
	*   <ul>
	*   <li>Rule 상세 팝업에서 쓰이는 Widget 인스턴스 생성을 위한 scheme 옵션</li>
	*   </ul>
	*   @type {Object}
	*   @name ruleDetailScheme
	*   @alias module:app/operation/rule/common/widget
	*/
	var ruleDetailScheme = {
		id: "id",
		groupName : {
			updated : {
				template : "<div class='group blue'>" + I18N.prop("COMMON_LAST_UPDATE") + "</div>"
			},
			created : {
				template : "<div class='group blue'>" + I18N.prop("FACILITY_SCHEDULE_CREATE_CREATION_TITLE") + "</div>"
			},
			dateTime : {
				template: "<div class='group'>" + I18N.prop("FACILITY_SCHEDULE_CREATE_DATE_AND_TIME_TITLE") + "</div>"
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
				type : "grid",
				name : I18N.prop("FACILITY_DEVICE_DEVICE"),
				gridDataSource : function(data){
					var devices = data.devices;
					// var obj;	[2018-04-12][미사용]
					if(devices){
						var i, max = devices.length;
						var type;
						for( i = 0; i < max; i++ ){
							type = devices[i].dms_devices_mappedType || devices[i].dms_devices_type;
							devices[i].displayType = Util.getDetailDisplayTypeDeviceI18N(type, true);
						}
					}

					return devices;
				},
				gridOptions : $.extend({}, defautGridOpt, {
					hideHeader : true,
					columns : [
						{
							template : DeviceTemplate.detailPopupGroupListTemplate,
							field : "displayType",
							groupHeaderTemplate : function(data){
								var value = data.value;
								//Type 처리
								var count = "";
								var text = "-";
								if(value){
									text = Util.getDisplayType(value);
								}
								if(data.count){
									count = data.count;
									/*if(count > 999){
										count = "999+";
									}*/
									text += " (" + count + ")";
								}

								return text;
							}
						}
					],
					group : [
						{ field : "displayType", aggregates : [ { field: "displayType", aggregate : "count" }]}
					]
				})
			},
			locations : {
				type : "grid",
				name : I18N.prop("COMMON_LOCATION"),
				gridDataSource : function(data){
					var devices =  data.devices;
					var list = [];
					var i, max = devices.length;
					var location, checkDuplicate = [];
					for( i = 0; i < max; i++ ){
						location = devices[i].location;
						if(checkDuplicate.indexOf(location) == -1){
							checkDuplicate.push(location);
							list.push({ locationGroup : "1", location : location });
						}
					}
					return list;
				},
				gridOptions : $.extend({}, defautGridOpt, {
					hideHeader : true,
					columns : [
						{
							//template : DeviceTemplate.detailPopupGroupListTemplate,
							field : "locationGroup",
							template : function(data){
								return data.location;
							},
							groupHeaderTemplate : function(data){
								var value = data.value;
								//Type 처리
								var count = "";
								var text = "-";
								if(value){
									text = I18N.prop("FACILITY_SCHEDULE_LOCATION_SETTING");
								}
								if(data.count){
									count = data.count;
									/*if(count > 999){
										count = "999+";
									}*/
									text += " (" + count + ")";
								}

								return text;
							}
						}
					],
					group : [
						{ field : "locationGroup", aggregates : [ { field: "locationGroup", aggregate : "count" }]}
					]
				})
			},
			condition : {
				type : "grid",
				name : I18N.prop("FACILITY_RULE_CONDITION"),
				gridDataSource : function(data){
					var condition = data.condition;
					var rules, list = [];

					if(condition && condition.rules){
						rules = condition.rules;
						var i, max = rules.length;
						var rule, checkDuplicate = [];
						for( i = 0; i < max; i++ ){
							rule = rules[i];
							rule = RuleTemplate.detailConditionTemplate(rule);
							if(checkDuplicate.indexOf(rule) == -1){
								checkDuplicate.push(rule);
								list.push({ conditionGroup : "1", condition : rule });
							}
						}
					}

					return list;
				},
				gridOptions : $.extend({}, defautGridOpt, {
					hideHeader : true,
					columns : [
						{
							//template : DeviceTemplate.detailPopupGroupListTemplate,
							field : "conditionGroup",
							template : function(data){
								return data.condition;
							},
							groupHeaderTemplate : function(data){
								var value = data.value;
								//Type 처리
								var count = "";
								var text = "-";
								if(value){
									text = I18N.prop("FACILITY_RULE_CONDITION_SETTING");
								}
								if(data.count){
									count = data.count;
									/*if(count > 999){
										count = "999+";
									}*/
									text += " (" + count + ")";
								}

								return text;
							}
						}
					],
					group : [
						{ field : "conditionGroup", aggregates : [ { field: "conditionGroup", aggregate : "count" }]}
					]
				})
			},
			date : {
				groupName : "dateTime",
				type : "text",
				name : I18N.prop("COMMON_DATE"),
				template : function(data){
					var startDate = "-";
					var endDate = "-";

					var date = data.startDate || data.start;
					if(date){
						startDate = moment(date).format("L").replace(/\./g, "-");
					}
					date = data.endDate || data.end;
					date = new Date(date);
					if(date){
						var year = date.getFullYear();
						if(year == RuleModel.MAX_END_DATE_YEAR){
							endDate = I18N.prop("FACILITY_SCHEDULE_ENDLESS");
						}else{
							endDate = moment(date).format("L").replace(/\./g, "-");
						}
					}

					return startDate + " ~ " + endDate;
				}
			},
			daysOfWeek : {
				groupName : "dateTime",
				type : "text",
				name : I18N.prop("FACILITY_SCHEDULE_REPEAT"),
				template : function(data){
					var value = "None";

					if(data.daysOfWeek && data.daysOfWeek.length > 0){
						var arr = $.extend(true, [], data.daysOfWeek);
						arr.sort(function(a, b){
							return daysOfWeekSequence[a] - daysOfWeekSequence[b];
						});
						var i, max = arr.length;
						for( i = 0; i < max; i++ ){
							arr[i] = I18N.prop("FACILITY_SCHEDULE_" + arr[i].toUpperCase());
						}
						value = arr.join(", ");
					}

					return value;
				}
			},
			excecutionTimes : {
				groupName : "dateTime",
				type : "grid",
				name : I18N.prop("COMMON_TIME"),
				gridDataSource : function(data){
					var times =  data.times;
					var list = [];
					var time, startTime, endTime;
					if(times){
						var i, max = times.length;
						var displayType = Settings.getTimeDisplay();
						for( i = 0; i < max; i++){
							time = times[i];
							startTime = time.startTime;
							endTime = time.endTime;

							startTime = startTime.split(":");
							startTime = startTime[0] + ":" + startTime[1];
							endTime = endTime.split(":");
							endTime = endTime[0] + ":" + endTime[1];
							if(displayType == "12Hour"){
								startTime = Util.convertAmPm(startTime);
								endTime = Util.convertAmPm(endTime);
							}
							time = startTime + " - " + endTime;
							list.push({ executionGroup : "1", executionTimes : time });
						}
					}else{
						list.push({executionGroup : "1", executionTimes : I18N.prop("FACILITY_RULE_ALL_DAY")});
					}
					return list;
				},
				gridOptions : $.extend({}, defautGridOpt, {
					hideHeader : true,
					columns : [
						{
							//template : DeviceTemplate.detailPopupGroupListTemplate,
							field : "executionGroup",
							template : function(data){
								var time = data.executionTimes;
								return time;
							},
							groupHeaderTemplate : function(data){
								var value = data.value;
								//Type 처리
								var count = "";
								var text = "-";
								if(value){
									text = I18N.prop("FACILITY_SCHEDULE_TIME_SETTING");
								}
								if(data.count){
									count = data.count;
									/*if(count > 999){
										count = "999+";
									}*/
									text += " (" + count + ")";
								}

								return text;
							}
						}
					],
					group : [
						{ field : "executionGroup", aggregates : [ { field: "executionGroup", aggregate : "count" }]}
					]
				})
			},
			operation : {
				type : "text",
				name : I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_TITLE"),
				template : function(data){
					var modes, operations, temperatures, configuration, controlPoint, lights, algorithm = data.algorithm;
					var i, max, value;
					// var modesHtml, operHtml, tempHtml, configHtml;//[2018-04-12][미사용]
					var unit = Settings.getTemperature().unit;
					var html = "-";
					var deviceTypes = data.deviceTypes, deviceType, deviceControl, deviceControlObj;
					if(!deviceTypes){
						return html;
					}

					var control = {
						operations : [],
						temperatures : [],
						modes : [],
						configuration : {},
						aoControlPoint : {},
						doControlPoint : {},
						lights : []
					};

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
						var id, mode, power, desired, subType = "";
						modes = control.modes;
						if(modes){
							subType = "";
							max = modes.length;
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
								html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + mode + '</div></div></dd>';
							}
						}

						operations = control.operations;
						if(operations){
							subType = "";
							max = operations.length;
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
								html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + power + '</div></div></dd>';
							}
						}

						lights = control.lights;
						if(lights){
							max = lights.length;
							for( i = 0; i < max; i++ ){
								value = lights[i].dimmingLevel;
								html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + " " + I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS") + '</span> :&nbsp;</div><div class="tbc">' + value + '</div></div></dd>';
							}
						}

						temperatures = control.temperatures;
						if(temperatures){
							subType = "";
							max = temperatures.length;
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
								html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + desired + '<span>' + Util.CHAR[unit] + '</span></div></div></dd>';
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
								html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL") + '</span> :&nbsp;</div><div class="tbc">' + remoteControl + '</div></div></dd>';
							}
						}

						controlPoint = control.aoControlPoint;
						if(controlPoint && controlPoint.value){
							html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>AO ' + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + '</span> :&nbsp;</div><div class="tbc">' + controlPoint.value + '</div></div></dd>';
						}

						controlPoint = control.doControlPoint;
						if(controlPoint && controlPoint.value){
							html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>DO ' + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + '</span> :&nbsp;</div><div class="tbc">' + controlPoint.value + '</div></div></dd>';
						}

						if(algorithm){
							var algorithmMode = algorithm.mode;		//[2018-04-12][상위에 똑같은 변수명이 선언되있어 변수명을 mode -> algorithmMode 수정]
							if(algorithmMode == "PreCooling"){
								value = algorithm.preCoolingTemperature;
								algorithmMode = "PRE_COOLING";
							}else{
								value = algorithm.preHeatingTemperature;
								algorithmMode = "PRE_HEATING";
							}
							html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + I18N.prop("FACILITY_INDOOR_" + algorithmMode) + '</span> :&nbsp;</div><div class="tbc">' + value + '<span>' + Util.CHAR[unit] + '</span></div></div></dd>';
						}
					}
					return html;
				}
			},
			alarmType : {
				type : "text",
				name : I18N.prop("FACILITY_RULE_ALARM_LOG_TYPE"),
				template : function(data){
					var val = "-";
					var alarmType = data.alarmType;
					if(alarmType){
						var i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_" + alarmType.toUpperCase());
						val = i18nVal ? i18nVal : alarmType;
					}
					return val;
				}
			},
			description : {
				type : "text",
				name : I18N.prop("COMMON_DESCRIPTION"),
				template : function(data){
					var value = data.description ? data.description : "-";
					return Util.decodeHtml(value);
				}
			}
		}
	};

	var selectedDetailFilter = function(data){
		var alarmType = data.alarmType;
		if (alarmType && alarmType !== 'None'){
			return ["operation", "devices", "locations"];
		}
		return ["alarmType"];

	};
	/**
	*   <ul>
	*   <li>Rule 에서 쓰이는 공용 상세 팝업의 기본 옵션</li>
	*   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	*   </ul>
	*   @type {Object}
	*   @name ruleDetailPopupConfig
	*   @alias module:app/operation/rule/common/widget
	*/
	var ruleDetailPopupConfig = {
		title : I18N.prop("COMMON_BTN_DETAIL"),
		width: 652,
		height: 830,
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			EDIT : 2
		},
		contentViewModel : {
			detailType : I18N.prop("COMMON_GENERAL")
		},
		//<button class="device-detail-header-history-btn k-button" data-bind="events: {click : clickHistoryBtn }">History</button>
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		listTemplate : RuleTemplate.scheduleDetailListTemplate,
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

					e.sender.trigger("onDelete", { result : result, results : results  });
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
			var popup = e.sender;
			popup.setActions(BTN.CLOSE, { disabled : false });
			if(type == "single"){
				popup.setActions(BTN.EDIT, { visible : true });
				popup.setActions(BTN.DELETE, { visible : true });
			}else if(type == "multi"){
				popup.setActions(BTN.EDIT, { visible : false });
				popup.setActions(BTN.DELETE, { visible : false });
			}
		},
		scheme : ruleDetailScheme,
		selectedDetailFilter : selectedDetailFilter
	};
	/**
	*   <ul>
	*   <li>Rule 생성 화면에서 쓰이는 기기 상세 팝업의 기본 옵션</li>
	*   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	*   </ul>
	*   @type {Object}
	*   @name deviceDetailPopupConfig
	*   @alias module:app/operation/rule/common/widget
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
			detailType : I18N.prop("COMMON_GENERAL")
		},
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		listTemplate : DeviceTemplate.multiDetailListDualTemplate,
		headerTemplate : "<span>" + I18N.prop("FACILITY_DEVICE_SELECTED_DEVICE") + ": <span>#:count #</span></span>",
		isCustomActions : true,
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
	*   <li>Rule 생성 화면에서 쓰이는 Load 팝업의 기본 옵션</li>
	*   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	*   </ul>
	*   @type {Object}
	*   @name ruleLoadPopupConfig
	*   @alias module:app/operation/rule/common/widget
	*/
	var ruleLoadPopupConfig = {
		title : I18N.prop("FACILITY_SCHEDULE_LOAD_RULE"), //Date
		width: 884,
		height: 830,
		isOnlyMulti : true,
		gridOptions : {
			columns : [
				{ field: "checked", width: 37, sortable: false },
				{ field: "name", title: I18N.prop("FACILITY_RULE_RULE_CONTROL_NAME"), sortable: true, width: 180, template: RuleTemplate.scheduleDetailNameTemplate },
				{ field: "condition", title: I18N.prop("FACILITY_RULE_CONDITION"), sortable: true, width: 200, template: RuleTemplate.conditionListTemplate },
				{ field: "operations", title: I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_TITLE"), width: 400, template: RuleTemplate.loadOperationListTemplate, sortable: false }
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
		headerTemplate : '<span>' + I18N.prop("COMMON_TOTAL") + " " + I18N.prop("FACILITY_RULE_RULE_CONTROL") + ': <span>#=count#</span></span>',
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CANCEL"),
				visible : true,
				disabled : false,
				action : function(e){
					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			},
			{
				text : I18N.prop("COMMON_BTN_SELECT"),
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
		scheme : ruleDetailScheme,
		selectedDetailFilter : selectedDetailFilter
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log 생성 화면에서 쓰이는 Load 팝업의 기본 옵션</li>
	*   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
	*   </ul>
	*   @type {Object}
	*   @name ruleAlarmLoadPopupConfig
	*   @alias module:app/operation/rule/common/widget
	*/
	var ruleAlarmLoadPopupConfig = {
		title : I18N.prop("FACILITY_SCHEDULE_LOAD_RULE_ALARM_LOG"),
		width: 884,
		height: 830,
		isOnlyMulti : true,
		gridOptions : {
			columns : [
				{ field : "checked", width : 37, sortable:false},
				{ field : "name", title : I18N.prop("FACILITY_RULE_RULE_ALARM_LOG_NAME"), sortable : true, width : 200, template : RuleTemplate.scheduleDetailNameTemplate },
				{ field : "condition", title : I18N.prop("FACILITY_RULE_CONDITION"), sortable : true, width : 200, template : RuleTemplate.conditionListTemplate},
				{ field : "alarmType", title : I18N.prop("FACILITY_RULE_ALARM_LOG_TYPE"), width : 200,
				 template : function(data){
						var logTypeDef = {
							"Warning": I18N.prop("FACILITY_DEVICE_STATUS_POPUP_WARNING"),
							"Critical": I18N.prop("FACILITY_DEVICE_STATUS_POPUP_CRITICAL")
						};
						var val = "-";
						var alarmType = data.alarmType;
						if (alarmType){
							val = logTypeDef[alarmType] ? logTypeDef[alarmType] : "-";
						}
						return val;
				 }, sortable : false}
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
		headerTemplate : '<span>' + I18N.prop("COMMON_TOTAL") + " " + I18N.prop("FACILITY_RULE_RULE_ALARM_LOG") + ': <span>#=count#</span></span>',
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CANCEL"),
				visible : true,
				disabled : false,
				action : function(e){
					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			},
			{
				text : I18N.prop("COMMON_BTN_SELECT"),
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
		scheme : ruleDetailScheme,
		selectedDetailFilter : selectedDetailFilter
	};
	/**
	*   <ul>
	*   <li>Rule 상세 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	*   </ul>
	*   @function getRuleDetailPopup
	*   @returns {kendoWidgetInstance} - Rule 상세 팝업 Widget 인스턴스
	*   @alias module:app/operation/rule/common/widget
	*/
	var getRuleDetailPopup = function(){
		ruleDetailPopupConfig.headerTemplate = "<span>" + I18N.prop("FACILITY_RULE_SELECTED_RULE") + ": <span>#:count #</span></span>";
		ruleDetailPopup = ruleDetailPopupElem.kendoDetailDialog(ruleDetailPopupConfig).data("kendoDetailDialog");
		return ruleDetailPopup;
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log 상세 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	*   </ul>
	*   @function getRuleAlarmDetailPopup
	*   @returns {kendoWidgetInstance} - Rule Alarm & Log 상세 팝업 Widget 인스턴스
	*   @alias module:app/operation/rule/common/widget
	*/
	var getRuleAlarmDetailPopup = function(){
		ruleDetailPopupConfig.headerTemplate = "<span>" + I18N.prop("FACILITY_RULE_SELECTED_RULE_ALARM") + ": <span>#:count #</span></span>";
		ruleAlarmDetailPopup = ruleAlarmDetailPopupElem.kendoDetailDialog(ruleDetailPopupConfig).data("kendoDetailDialog");
		return ruleAlarmDetailPopup;
	};
	/**
	*   <ul>
	*   <li>기기 상세 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	*   </ul>
	*   @function getDeviceDetailPopup
	*   @returns {kendoWidgetInstance} - 기기 상세 팝업 Widget 인스턴스
	*   @alias module:app/operation/rule/common/widget
	*/
	var getDeviceDetailPopup = function(){
		deviceDetailPopup = deviceDetailPopupElem.kendoDetailDialog(deviceDetailPopupConfig).data("kendoDetailDialog");
		return deviceDetailPopup;
	};
	/**
	*   <ul>
	*   <li>Rule Load 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	*   </ul>
	*   @function getRuleLoadPopup
	*   @returns {kendoWidgetInstance} - Rule Load 팝업 Widget 인스턴스
	*   @alias module:app/operation/rule/common/widget
	*/
	var getRuleLoadPopup = function(){
		ruleLoadPopup = ruleLoadPopupElem.kendoDetailDialog(ruleLoadPopupConfig).data("kendoDetailDialog");
		return ruleLoadPopup;
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log Load 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
	*   </ul>
	*   @function getRuleLoadPopup
	*   @returns {kendoWidgetInstance} - Rule Alarm & Log Load 팝업 Widget 인스턴스
	*   @alias module:app/operation/rule/common/widget
	*/
	var getRuleAlarmLogLoadPopup = function(){
		ruleAlarmLoadPopup = ruleAlarmLoadPopupElem.kendoDetailDialog(ruleAlarmLoadPopupConfig).data("kendoDetailDialog");
		return ruleAlarmLoadPopup;
	};

	return {
		createNewWidget : createNewWidget,
		confirmDialog : confirmDialog,
		msgDialog : msgDialog,
		getRuleDetailPopup : getRuleDetailPopup,
		getRuleAlarmDetailPopup : getRuleAlarmDetailPopup,
		getDeviceDetailPopup : getDeviceDetailPopup,
		getRuleLoadPopup : getRuleLoadPopup,
		getRuleAlarmLogLoadPopup : getRuleAlarmLogLoadPopup
	};

});
//# sourceURL=operation/rule/common/widget.js