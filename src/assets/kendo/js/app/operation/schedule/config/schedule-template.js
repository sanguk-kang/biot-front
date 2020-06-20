/**
 *
 *   <ul>
 *       <li>Schedule 기능 내 공용 Template</li>
 *       <li>Schedule 기능 내 데이터 표시를 위한 HTML Template을 제공한다.</li>
 *   </ul>
 *   @module app/operation/schedule/config/schedule-template
 *   @requires config
 *
 */
//[13-04-2018]안쓰는 코드 주석 : DeviceTemplate -jw.lim
// define("operation/schedule/config/schedule-template", [], function(DeviceTemplate){
define("operation/schedule/config/schedule-template", [], function(){
	// var MainWindow = window.MAIN_WINDOW;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
	var kendo = window.kendo;
	var Util = window.Util;
	var I18N = window.I18N;
	var Settings = window.GlobalSettings;

	var schedulerLegends = [
		{ className : "indoor", displayText : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR")},
		{ className : "light", displayText : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT")},
		{ className : "indoorlight", displayText : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR") + " + " + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT")},
		{ className : "others", displayText : I18N.prop("FACILITY_DEVICE_OTHERS")},
		{ className : "pause", displayText : I18N.prop("COMMON_PAUSE")}
	];
	/**
	 *   <ul>
	 *   <li>Schedule 정보 내 기기 타입 별 Text와 색상을 표시하기 위한 CSS Class 값을 리턴한다.</li>
	 *   </ul>
	 *   @function getEventTemplateType
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {Object} - Schedule의 타입 및 색상 CSS Class 값이 담긴 객체
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var getEventTemplateType = function(data){
		var devices = data.devices;
		var type = 3;
		if(!data.activated){
			type = 4;
		}else{
			var deviceType, mappedType;
			var hasSacIndoor, hasLight;
			if(devices && devices.length > 0){
				var i, max = devices.length;
				// var device;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
				hasSacIndoor = false;
				hasLight = false;
				for( i = 0; i < max; i++ ){
					deviceType = devices[i].dms_devices_type;
					mappedType = devices[i].dms_devices_mappedType;
					if(deviceType.indexOf("AirConditioner") != -1){
						hasSacIndoor = true;
					}

					if(deviceType.indexOf("Light") != -1 || (mappedType && mappedType.indexOf("Light") != -1)){
						hasLight = true;
					}
				}
			}
			if(hasSacIndoor && hasLight){
				type = 2;
			}else if(hasSacIndoor){
				type = 0;
			}else if(hasLight){
				type = 1;
			}else{
				type = 3;
			}
		}
		data.type = type;
		// var text = "", className = "";			//[13-04-2018]안쓰는 코드 주석 -jw.lim
		var legend = schedulerLegends[type];
		var returnObj = {
			type : type
		};
		if(legend){
			returnObj.text = legend.displayText;
			returnObj.className = legend.className;
		}
		return returnObj;
	};
	/**
	 *   <ul>
	 *   <li>Schedule 정보의 기기 타입 별 색상을 표시하기 위한 CSS Class 값을 리턴한다.</li>
	 *   </ul>
	 *   @function getEventTemplateClass
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - Schedule의 타입에 해당하는 색상 CSS Class 값
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var getEventTemplateClass = function(data){
		var className = "";
		var obj = getEventTemplateType(data);
		if(obj.className){
			className = obj.className;
		}
		return className;
	};
	/**
	 *   <ul>
	 *   <li>Schedule 상세 팝업 리스트의 Operating/Pause 상태를 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function scheduleActivatedTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - Operating/Pause 를 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var scheduleActivatedTemplate = function(data){
		var oper = data.activated ? I18N.prop("FACILITY_SCHEDULE_ACTIVATED") : I18N.prop("FACILITY_SCHEDULE_NOT_ACTIVATED");
		var status = "<span class='panel-item-temp schedule-status'><span>" + oper + "</span></span>";
		return status;
	};
	/**
	 *   <ul>
	 *   <li>Schedule 상세 팝업 리스트의 Operating/Pause 버튼을 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function scheduleDetailBtnTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - Operating/Pause 버튼을 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var scheduleDetailBtnTemplate = function(data){
		var operCss = data.activated ? "ic ic-action-pause" : "ic ic-action-play";
		var status = scheduleActivatedTemplate(data);
		var btn = "<span class='action-button-wrapper'><button class='k-button action-button " + operCss + "'></button></span>";

		return btn + status;
	};
	/**
	 *   <ul>
	 *   <li>Schedule 상세 팝업 리스트의 스케쥴 이름을 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function scheduleLoadDetailNameTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - 스케쥴 이름을 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var scheduleLoadDetailNameTemplate = function(data){
		data.name = data.name || data.title;
		data.title = data.name;
		var name = data.name;

		return "<span class='grid-cell-two-line-ellipsis'>" + Util.decodeHtml(name) + "</span>";
	};
	/**
	 *   <ul>
	 *   <li>Schedule 상세 팝업 리스트의 스케쥴 이름을 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function scheduleDetailNameTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - 스케쥴 이름을 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var scheduleDetailNameTemplate = function(data){
		data.name = data.name || data.title;
		data.title = data.name;
		var name = data.name;

		return "<span class='td-padding-left'>" + Util.decodeHtml(name) + "</span>";
	};
	/**
	 *   <ul>
	 *   <li>Schedule 상세 팝업 리스트의 스케쥴 이름과 Pause/Operating 상태를 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function scheduleDetailNameTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - 스케쥴 이름과 Pause/Operating 상태를 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var scheduleDetailListTemplate = function(data){
		var name = scheduleDetailNameTemplate(data);
		var actionBtn = scheduleDetailBtnTemplate(data);
		return (name + actionBtn);
	};

	/**
	 *   <ul>
	 *   <li>Schedule 상세/More/Load 팝업 리스트의 스케쥴의 운영상태를 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function operationListTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - 상세/More/Load 팝업 리스트의 스케쥴의 운영상태를 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var operationListTemplate = function(data){
		if(data.field === "scheduleDay") return;
		var i, max, txt = "", operations;
		// var type;					//[13-04-2018]안쓰는 코드 주석 -jw.lim
		var span = "<span>";

		var deviceTypes = typeof data.deviceTypes !== 'undefined' ? data.deviceTypes : [];
		var deviceType, deviceControl, deviceControlObj;

		var control = {
			operations : [],
			temperatures : [],
			modes : [],
			configuration : {},
			aoControlPoint : {},
			doControlPoint : {},
			lights : []
		};

		var algorithm = data.algorithm;

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
			var modes = control.modes;
			var temperatures = control.temperatures;
			var configuration = control.configuration,
				aoControlPoint = control.aoControlPoint,
				doControlPoint = control.doControlPoint,
				lights = control.lights;
			operations = control.operations;

			var count = 0;

			var hasDisplay = false;
			var subType = "";
			var id, value;
			if(modes && modes.length > 0){
				count += modes.length;

				if(!hasDisplay){
					id = modes[0].id;
					value = modes[0].mode;
					if(id.indexOf("Ventilator") != -1){
						subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_VENTILATOR") + ")";
					}else if(id.indexOf("DHW") != -1){
						subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_DHW") + ")";
					}
					id = Util.getDetailDisplayTypeDeviceI18N(id) + subType + " " + I18N.prop("FACILITY_DEVICE_SAC_INDOOR_MODE");
					value = I18N.prop("FACILITY_INDOOR_MODE_" + value.toUpperCase());
					txt = id + " : " + value;
					hasDisplay = true;
				}
			}

			subType = "";
			if(operations && operations.length > 0){
				count += operations.length;

				if(!hasDisplay){
					id = operations[0].id;
					value = operations[0].power;
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
					value = I18N.prop("FACILITY_DEVICE_STATUS_" + value.toUpperCase());

					txt = id + " : " + value;
					hasDisplay = true;
				}
			}

			subType = "";
			if(temperatures && temperatures.length > 0){
				count += temperatures.length;
				if(!hasDisplay){
					id = temperatures[0].id;
					value = temperatures[0].desired;
					if(id.indexOf("Room") != -1){
						subType = "(" + I18N.prop("FACILITY_INDOOR_SET_TEMPERATURE") + ")";
					}else if(id.indexOf("DHW") != -1){
						subType = "(" + I18N.prop("FACILITY_INDOOR_DHW_SET_TEMPERATURE") + ")";
					}else if(id.indexOf("WaterOutlet") != -1){
						subType = "(" + I18N.prop("FACILITY_INDOOR_WATER_OUT_SET_TEMP") + ")";
					}
					id = Util.getDetailDisplayTypeDeviceI18N(id) + subType;
					txt = id + ":" + value + Util.CHAR.Celsius;
					hasDisplay = true;
				}
			}

			if(configuration && configuration.remoteControl){
				count += 1;
				if(!hasDisplay){
					var remoteControlValText = configuration.remoteControl === 'Allowed' ? I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_PERMIT") : I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_PROHIBIT");
					txt = I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL") + " : " + remoteControlValText;
				}
			}

			if(lights && lights.length > 0){
				count += lights.length;
				if(!hasDisplay){
					txt = I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + " " + I18N.prop("LIGHT_BRIGHTNESS") + " : " + lights[0].dimmingLevel;
				}
			}

			var controlPoint = aoControlPoint;
			if(controlPoint && typeof controlPoint.value !== "undefined"){			//[13-04-2018]undefined check -jw.lim
				count += 1;
				if(!hasDisplay){
					txt = "AO " + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + " : " + controlPoint.value;
				}
			}

			controlPoint = doControlPoint;
			if(controlPoint && typeof controlPoint.value !== "undefined"){			//[13-04-2018]undefined check -jw.lim
				count += 1;
				if(!hasDisplay){
					txt = "DO " + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + " : " + controlPoint.value;
				}
			}

			// 예냉, 예열 운영 표시
			if(typeof algorithm !== 'undefined'){
				var mode = algorithm.mode, modeText = "";
				var unit = Settings.getTemperature().unit;

				value = mode == "PreCooling" ? algorithm.preCoolingTemperature : algorithm.preHeatingTemperature;
				modeText = mode == "PreCooling" ? "PRECOOLING" : "PREHEATING";
				count += 1;
				if(!hasDisplay){
					value = Util.convertNumberFormat(Number(value).toFixed(1));
					txt = I18N.prop("FACILITY_INDOOR_" + modeText) + " : " + value + Util.CHAR[unit];
					hasDisplay = true;
				}
			}

			if(count > 0){
				count -= 1;
			}

			if(count > 0){
				/*if(count > 999){
					count = "999";
				}*/
				txt += " (+" + count + ")";
			}
		}
		span = span + txt + "</span>";
		return span;
	};

	/**
	 *   <ul>
	 *   <li>More 팝업 리스트의 스케쥴의 운영 상태와 Operating/Pause 상태를 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function moreOperationListTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - More 팝업 리스트의 스케쥴의 운영 상태와 Operating/Pause 상태를 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var moreOperationListTemplate = function(data){
		var operation = operationListTemplate(data);
		var actionBtn = scheduleDetailBtnTemplate(data);
		return operation + actionBtn;
	};

	/**
	 *   <ul>
	 *   <li>팝업 리스트에 스케쥴의 실행시간을 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function executionTimeListTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - 팝업 리스트에 스케쥴의 실행시간을 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var executionTimeListTemplate = function(data){
		if(data.field === "scheduleDay") return;
		var txt = "-";
		var time, times = data.executionTimes;
		var max = times.length;
		if(max > 0){
			time = times[0];
			time = time.split(":");
			time = time[0] + ":" + time[1];
			txt = time;
			if(max > 1){
				txt += " (+" + (max - 1) + ")";
			}
		}
		data.times = txt;
		return txt;
	};

	/**
	 *   <ul>
	 *   <li>More Popup 리스트 내 Schedule Checkbox를 Schedule Type 색상 별로 HTML String으로 표시한다.</li>
	 *   </ul>
	 *   @function checkboxCellTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - More Popup 리스트 내 Schedule Type 색상 별 체크박스 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var checkboxCellTemplate = function(data){
		var className = getEventTemplateClass(data);
		var uid = data.uid;
		var checked = data.checked ? "checked" : "";
		return '<div class="schedule-checkbox-cell ' + className + '"><span class="checkbox-wrapper"><input type="checkbox" id="check_' + uid + '" class="k-checkbox" ' + checked + '/><label for="check_' + uid + '" class="k-checkbox-label"></label></span></div>';
	};
	/**
	 *   <ul>
	 *   <li>Load Popup 리스트 내 Schedule Radio 버튼을 Schedule Type 색상 별로 HTML String으로 표시한다.</li>
	 *   </ul>
	 *   @function radioCellTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - Load Popup 리스트 내 Schedule Type 색상 별 라디오 버튼 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var radioCellTemplate = function(data){
		var className = getEventTemplateClass(data);
		var uid = data.uid;
		var checked = data.checked ? "checked" : "";
		return '<div class="schedule-checkbox-cell ' + className + '"><span class="checkbox-wrapper"><input type="radio" id="check_' + uid + '" class="k-radio" ' + checked + '/><label for="check_' + uid + '" class="k-radio-label"></label></span></div>';
	};

	var detailPopupGroupListTemplate = function(data){
		var name = data.dms_devices_name, id = data.dms_devices_id;
		var location = typeof data.location == 'undefined' || data.location === null ? '' : data.location;
		var item = '<div class="device-detail-popup-group-list-item">';

		var locationStrArray = location.split(', ');
		var buildingInfo = locationStrArray.length <= 2 ? location : locationStrArray[0] + ', ' + locationStrArray[1];
		var zoneInfo = locationStrArray.length < 3 ? '' : locationStrArray[2];

		var text = "<div class='detail-text'><div class='name-and-id'><div class='name'>" + Util.decodeHtml(name) + "</div><div class='id'>" + id + "</div></div><div class='location-wrapper'><div class='location-building'>" + buildingInfo + "</div><div class='location-zone'>" + zoneInfo + "</div></div></div>";
		var html = item + text + "</div>";
		return html;
	};

	var scheduleUpdatedDateTemplate = function(data) {
		var updatedDate = data.updated.date;
		var moment = window.moment;
		return moment(updatedDate).format("YYYY-MM-DD");
	};

	var daysOfWeekTemplate = function(data) {
		if (data.field === "folder.groupName") return;
		var daysOfWeekSequence = { "Mon" : 0, "Tue" : 1, "Wed" : 2, "Thu" : 3, "Fri" : 4, "Sat" : 5, "Sun" : 6 };
		var txt = "-";
		var configurations = data.configurations;
		var daysOfWeek = configurations[0].daysOfWeek;
		if (daysOfWeek && daysOfWeek.length > 0) {
			var arr = $.extend(true, [], daysOfWeek);
			arr.sort(function (a, b) {
				return daysOfWeekSequence[a] - daysOfWeekSequence[b];
			});
			var i, max = arr.length;
			for (i = 0; i < max; i++) {
				arr[i] = I18N.prop("FACILITY_SCHEDULE_" + arr[i].toUpperCase());
			}
			txt = arr.join(", ");
		}

		var configurationsLength = configurations.length;
		if (configurationsLength - 1 > 0) {
			txt += " (+" + (configurationsLength - 1) + ")";
		}
		return txt;
	};

	/**
	 *   <ul>
	 *   <li>Schedule 상세/More/Load 팝업 리스트의 스케쥴의 운영상태를 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function configuOperationListTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @param {Boolean} noHtml - html 리턴 여부
	 *   @returns {String} - 상세/More/Load 팝업 리스트의 스케쥴의 운영상태를 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var configuOperationListTemplate = function(data, noHtml){
		var i, max, txt = "", operations;
		var span = "<span>";
		var configurations = data.configurations;
		var deviceTypes, deviceType, deviceControl, deviceControlObj;
		var algorithm;

		var count = 0;
		var hasDisplay = false;
		if (data.field === "folder.groupName") return;
		if(!configurations){
			span = span + "-</span>";
			return span;
		}

		var control = {};

		for (var configuIndex = 0; configuIndex < configurations.length; configuIndex++) {
			deviceTypes = configurations[configuIndex].deviceTypes;
			algorithm = configurations[configuIndex].algorithm;

			control = {
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
				var modes = control.modes;
				var temperatures = control.temperatures;
				var configuration = control.configuration,
					aoControlPoint = control.aoControlPoint,
					doControlPoint = control.doControlPoint,
					lights = control.lights;
				operations = control.operations;

				var subType = "";
				var id, value;
				if(modes && modes.length > 0){
					count += modes.length;

					if(!hasDisplay){
						id = modes[0].id;
						value = modes[0].mode;
						if(id.indexOf("Ventilator") != -1){
							subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_VENTILATOR") + ")";
						}else if(id.indexOf("DHW") != -1){
							subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_DHW") + ")";
						}
						id = Util.getDetailDisplayTypeDeviceI18N(id) + subType + " " + I18N.prop("FACILITY_DEVICE_SAC_INDOOR_MODE");
						value = I18N.prop("FACILITY_INDOOR_MODE_" + value.toUpperCase());
						txt = id + " : " + value;
						hasDisplay = true;
					}
				}

				subType = "";
				if(operations && operations.length > 0){
					count += operations.length;

					if(!hasDisplay){
						id = operations[0].id;
						value = operations[0].power;
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
						value = I18N.prop("FACILITY_DEVICE_STATUS_" + value.toUpperCase());

						txt = id + " : " + value;
						hasDisplay = true;
					}
				}

				subType = "";
				if(temperatures && temperatures.length > 0){
					count += temperatures.length;
					if(!hasDisplay){
						id = temperatures[0].id;
						value = temperatures[0].desired;
						if(id.indexOf("Room") != -1){
							subType = "(" + I18N.prop("FACILITY_INDOOR_SET_TEMPERATURE") + ")";
						}else if(id.indexOf("DHW") != -1){
							subType = "(" + I18N.prop("FACILITY_INDOOR_DHW_SET_TEMPERATURE") + ")";
						}else if(id.indexOf("WaterOutlet") != -1){
							subType = "(" + I18N.prop("FACILITY_INDOOR_WATER_OUT_SET_TEMP") + ")";
						}
						id = Util.getDetailDisplayTypeDeviceI18N(id) + subType;
						txt = id + ":" + value + Util.CHAR.Celsius;
						hasDisplay = true;
					}
				}

				if(configuration && configuration.remoteControl){
					count += 1;
					if(!hasDisplay){
						var remoteControlValText = configuration.remoteControl === 'Allowed' ? I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_PERMIT") : I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_PROHIBIT");
						txt = I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL") + " : " + remoteControlValText;
						hasDisplay = true;
					}
				}

				if(lights && lights.length > 0){
					count += lights.length;
					if(!hasDisplay){
						txt = I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + " " + I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS") + " : " + lights[0].dimmingLevel;
						hasDisplay = true;
					}
				}

				var controlPoint = aoControlPoint;
				if(controlPoint && typeof controlPoint.value !== "undefined"){			//[13-04-2018]undefined check -jw.lim
					count += 1;
					if(!hasDisplay){
						txt = "AO " + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + " : " + controlPoint.value;
						hasDisplay = true;
					}
				}

				controlPoint = doControlPoint;
				if(controlPoint && typeof controlPoint.value !== "undefined"){			//[13-04-2018]undefined check -jw.lim
					count += 1;
					if(!hasDisplay){
						txt = "DO " + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + " : " + controlPoint.value;
						hasDisplay = true;
					}
				}

				// 예냉, 예열 운영 표시
				if(typeof algorithm !== 'undefined'){
					var mode = algorithm.mode;
					var unit = Settings.getTemperature().unit;
					if(mode == "PreCooling"){
						value = algorithm.preCoolingTemperature;
						mode = "PRECOOLING";
					}else{
						value = algorithm.preHeatingTemperature;
						mode = "PREHEATING";
					}
					count += 1;
					if(!hasDisplay){
						value = Util.convertNumberFormat(Number(value).toFixed(1));
						txt = I18N.prop("FACILITY_INDOOR_" + mode) + " : " + value + Util.CHAR[unit];
						hasDisplay = true;
					}
				}
			}
		}
		if(count > 0){
			count -= 1;
		}

		if(count > 0){
			// if(count > 999){
			// 	count = "999";
			// }
			txt += " (+" + count + ")";
		}
		if (!noHtml) span = span + txt + "</span>";
		else return txt;
		return span;
	};

	/**
	 *   <ul>
	 *   <li>팝업 리스트에 스케쥴의 실행시간을 표시하는 HTML String으로 리턴한다.</li>
	 *   </ul>
	 *   @function executionTimeListTemplate
	 *   @param {Object} data - Schedule 정보 객체
	 *   @returns {String} - 팝업 리스트에 스케쥴의 실행시간을 표시하는 HTML String
	 *   @alias module:app/operation/schedule/config/schedule-template
	 */
	var configuExecutionTimeListTemplate = function(data){
		if(data.field === "folder.groupName") return;
		var txt = "-";
		var time, times = data.configurations[0].executionTimes;
		var max = times.length;
		if(max > 0){
			time = times[0];
			time = time.split(":");
			time = time[0] + ":" + time[1];
			txt = time;
			if(max > 1){
				txt += " (+" + (max - 1) + ")";
			}
		}
		data.times = txt;
		return txt;
	};

	return {
		detailPopupGroupListTemplate : detailPopupGroupListTemplate,
		scheduleDetailListTemplate : scheduleDetailListTemplate,
		scheduleDetailNameTemplate : scheduleDetailNameTemplate,
		operationListTemplate : operationListTemplate,
		scheduleActivatedTemplate: scheduleActivatedTemplate,
		scheduleUpdatedDateTemplate  : scheduleUpdatedDateTemplate,
		moreOperationListTemplate : moreOperationListTemplate,
		executionTimeListTemplate : executionTimeListTemplate,
		getEventTemplateClass : getEventTemplateClass,
		checkboxCellTemplate : checkboxCellTemplate,
		radioCellTemplate : radioCellTemplate,
		getEventTemplateType : getEventTemplateType,
		daysOfWeekTemplate: daysOfWeekTemplate,
		configuOperationListTemplate: configuOperationListTemplate,
		configuExecutionTimeListTemplate: configuExecutionTimeListTemplate,
		scheduleLoadDetailNameTemplate: scheduleLoadDetailNameTemplate
	};
});

//For Debug
//# sourceURL=schedule-template.js
