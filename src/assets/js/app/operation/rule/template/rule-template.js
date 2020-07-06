/**
*
*   <ul>
*       <li>Rule 기능 내 공용 Template</li>
*       <li>Rule 기능 내 데이터 표시를 위한 HTML Template을 제공한다.</li>
*   </ul>
*   @module app/operation/rule/template/rule-template
*   @requires config
*
*/
define("operation/rule/template/rule-template", [], function(){
	// var MainWindow = window.MAIN_WINDOW;		//[2018-04-12][변수 선언후 미사용]
	var Util = window.Util;
	var I18N = window.I18N;
	var kendo = window.kendo;

	var schedulerLegends = [
		{ className : "indoor", displayText : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR")},
		{ className : "light", displayText : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT")},
		{ className : "indoorlight", displayText : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR") + " + " + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT")},
		{ className : "others", displayText : I18N.prop("FACILITY_DEVICE_OTHERS")},
		{ className : "pause", displayText : I18N.prop("COMMON_PAUSE")}
	];

	var RuleMonitorText = {
		"operations-AirConditioner.Indoor.General-power" : I18N.prop("FACILITY_RULE_STATUS_INDOOR_POWER"),
		"operations-AirConditioner.Indoor.Ventilator-power" : I18N.prop("FACILITY_RULE_STATUS_VENTILATOR_POWER"),
		"operations-AirConditioner.Indoor.DHW-power" : I18N.prop("FACILITY_RULE_STATUS_DHW_POWER"),
		"modes-AirConditioner.Indoor.General-mode" : I18N.prop("FACILITY_RULE_STATUS_INDOOR_MODE"),
		"modes-AirConditioner.Indoor.Ventilator-mode" : I18N.prop("FACILITY_RULE_STATUS_VENTILATOR_MODE"),
		"modes-AirConditioner.Indoor.DHW-mode" : I18N.prop("FACILITY_RULE_STATUS_DHW_MODE"),
		"temperatures-AirConditioner.Indoor.Room-current" : I18N.prop("FACILITY_RULE_STATUS_INDOOR_CURRENT_TEMPERATURE"),
		"temperatures-AirConditioner.Indoor.DHW-current" : I18N.prop("FACILITY_RULE_STATUS_DHW_CURRENT_TEMPERATURE"),
		"temperatures-AirConditioner.Indoor.Room-desired" : I18N.prop("FACILITY_RULE_STATUS_INDOOR_SET_TEMPERATURE"),
		"temperatures-AirConditioner.Indoor.DHW-desired" : I18N.prop("FACILITY_RULE_STATUS_DHW_SET_TEMPERATURE"),
		"temperatures-AirConditioner.Indoor.WaterOutlet-desired" : I18N.prop("FACILITY_RULE_STATUS_WATER_OUT_SET_TEMPERATURE"),
		// "temperatures-DischargeAir-current" : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_CURRENT_TEMPERATURE"),
		// "temperatures-DischargeAir.Heat-desired" : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_HEAT_TEMPERATURE"),
		// "temperatures-DischargeAir.Cool-desired" : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_COOL_TEMPERATURE"),
		"temperatures-AirConditioner.DischargeAir-current" : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_CURRENT_TEMPERATURE"),	//[2018-04-30][temperatures-DischargeAir-current → temperatures-AirConditioner.DischargeAir-current 수정]
		"temperatures-AirConditioner.DischargeAir.Heat-desired" : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_HEAT_TEMPERATURE"),	//[2018-04-30][temperatures-DischargeAir.Heat-desired → temperatures-AirConditioner.DischargeAir.Heat-desired 수정]
		"temperatures-AirConditioner.DischargeAir.Cool-desired" : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_COOL_TEMPERATURE"),	//[2018-04-30][temperatures-DischargeAir.Cool-desired → temperatures-AirConditioner.DischargeAir.Cool-desired 수정]
		"winds-AirConditioner.Indoor.General.Speed-wind" : I18N.prop("FACILITY_RULE_STATUS_FAN_SPEED"),
		"winds-AirConditioner.Indoor.Ventilator.Speed-wind" : I18N.prop("FACILITY_RULE_STATUS_VENTILATOR_FAN_SPEED"),
		// "alarms-name" : I18N.prop("FACILITY_RULE_STATUS_ERROR_CODE"),
		"alarms-alarms_name" : I18N.prop("FACILITY_RULE_STATUS_ERROR_CODE"),		//[2018-04-30][alarms-alarms_name → alarms-alarms_name 수정]
		"airConditioner-outdoorUnit-electricCurrentControl" : I18N.prop("FACILITY_RULE_STATUS_CURRENT_LIMIT"),
		"airConditioner-outdoorUnit-coolingCapacityCalibration" : I18N.prop("FACILITY_RULE_STATUS_COOLING_CAPACITY_CALIBRATION"),
		"airConditioner-outdoorUnit-heatingCapacityCalibration" : I18N.prop("FACILITY_RULE_STATUS_HEATING_CAPACITY_CALIBRATION"),
		"temperatures-AirConditioner.Outdoor-current" : I18N.prop("FACILITY_DEVICE_OUTDOOR_TEMPERATURE"),
		"controlPoint-value" : I18N.prop("FACILITY_POINT_VALUE"),
		"operations-General-power" : I18N.prop("FACILITY_INDOOR_CONTROL_POWER"),
		"lights-1-dimmingLevel" : I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS"),
		"temperatures-General-current" : I18N.prop("COMMON_TEMPERATURE"),
		"humidities-1-current" : I18N.prop("COMMON_HUMIDITY"),
		"presences-1-detected" : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE"),
		"meters-1-reading" : I18N.prop("FACILITY_DEVICE_CURRENT_CONSUMPTION_UPPER")
	};

	var RuleValueText = {
		"On" : I18N.prop("FACILITY_DEVICE_STATUS_ON"),
		"Off" : I18N.prop("FACILITY_DEVICE_STATUS_OFF"),
		"Auto" : I18N.prop("FACILITY_INDOOR_MODE_AUTO"),
		"Cool" : I18N.prop("FACILITY_INDOOR_MODE_COOL"),
		"Heat" : I18N.prop('FACILITY_INDOOR_MODE_HEAT'),
		"Dry" : I18N.prop("FACILITY_INDOOR_MODE_DRY"),
		"Fan" : I18N.prop("FACILITY_INDOOR_MODE_FAN"),
		"CoolStorage" : I18N.prop("FACILITY_INDOOR_MODE_COOLSTORAGE"),
		"HeatStorage" : I18N.prop("FACILITY_INDOOR_MODE_HOTWATER"),
		"HeatExchange" : I18N.prop("FACILITY_INDOOR_MODE_HEATEX"),
		"ByPass" : I18N.prop("FACILITY_INDOOR_MODE_BYPASS"),
		"Sleep" : I18N.prop("FACILITY_INDOOR_MODE_SLEEP"),
		"Eco" : I18N.prop("FACILITY_INDOOR_MODE_ECO"),
		"Standard" : I18N.prop("FACILITY_INDOOR_MODE_STANDARD"),
		"Power" : I18N.prop("FACILITY_INDOOR_MODE_POWER"),
		"Force" : I18N.prop("FACILITY_INDOOR_MODE_FORCE"),
		"Low" : I18N.prop("FACILITY_INDOOR_CONTROL_LOW"),
		"Mid" : I18N.prop("FACILITY_INDOOR_CONTROL_MID"),
		"High" : I18N.prop("FACILITY_INDOOR_CONTROL_HIGH"),
		"Turbo" : I18N.prop("FACILITY_INDOOR_CONTROL_TURBO"),
		"SelfControl" : I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_SELF_CONTROL"),
		"true" : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_PRESENCE"),
		"false" : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_ABSENCE")
	};

	var getEventTemplateType = function(data){
		var devices = data.devices;
		var type = 3;
		var hasSacIndoor, hasLight;		//[2018-04-12][변수 상위에 선언]
		if(!data.activated){
			type = 4;
		}else{
			if(devices && devices.length > 0){
				var i, max = devices.length;
				// var device;		//[2018-04-12][변수 선언후 미사용]
				hasSacIndoor = false;		//[2018-04-12][var 제거]
				hasLight = false;
				for( i = 0; i < max; i++ ){
					if(devices[i].dms_devices_type.indexOf("AirConditioner") != -1){
						hasSacIndoor = true;
					}

					if(devices[i].dms_devices_type.indexOf("Light") != -1){
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
		// var text = "", className = "";			[2018-04-12][변수선언후 미사용 주석처리]
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
	*   <li>Rule 상세 팝업 리스트의 Operating/Pause 상태를 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function scheduleActivatedTemplate
	*   @param {Object} data - Rule 정보 객체
	*   @returns {String} - Operating/Pause 를 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var scheduleActivatedTemplate = function(data){
		var oper = data.activated ? I18N.prop("COMMON_OPERATING") : I18N.prop("COMMON_PAUSE");
		var status = "<span class='panel-item-temp schedule-status'><span>" + oper + "</span></span>";
		return status;
	};
	/**
	*   <ul>
	*   <li>Rule 상세 팝업 리스트의 Operating/Pause 버튼을 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function scheduleDetailBtnTemplate
	*   @param {Object} data - Rule 정보 객체
	*   @returns {String} - Operating/Pause 버튼을 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var scheduleDetailBtnTemplate = function(data){
		var operCss = data.activated ? "ic ic-action-pause" : "ic ic-action-play";
		var status = scheduleActivatedTemplate(data);
		var btn = "<span class='action-button-wrapper'><button class='k-button action-button " + operCss + "'></button></span>";

		return btn + status;
	};
	/**
	*   <ul>
	*   <li>Rule 상세 팝업 리스트의 스케쥴 이름을 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function scheduleDetailNameTemplate
	*   @param {Object} data - Rule 정보 객체
	*   @returns {String} - 스케쥴 이름을 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var scheduleDetailNameTemplate = function(data){
		data.name = data.name || data.title;
		data.title = data.name;
		var name = data.name;

		return "<span class='td-padding-left'>" + Util.decodeHtml(name) + "</span>";
	};
	/**
	*   <ul>
	*   <li>Rule 상세 팝업 리스트의 스케쥴 이름과 Pause/Operating 상태를 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function scheduleDetailNameTemplate
	*   @param {Object} data - Rule 정보 객체
	*   @returns {String} - Rule 이름과 Pause/Operating 상태를 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var scheduleDetailListTemplate = function(data){
		var name = scheduleDetailNameTemplate(data);
		var actionBtn = scheduleDetailBtnTemplate(data);
		return (name + actionBtn);
	};
	/**
	*   <ul>
	*   <li>Rule 상세/Load 팝업 리스트의 Rule 운영상태를 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function operationListTemplate
	*   @param {Object} data - Rule 정보 객체
	*   @returns {String} - 상세/Load 팝업 리스트의 Rule 운영상태를 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var operationListTemplate = function(data){
		var i, max, txt = "", operations;		//[2018-04-12][type 변수 선언후 미사용 제거]
		var span = "<span>";

		var deviceTypes = data.deviceTypes, deviceType, deviceControl, deviceControlObj;
		if(!deviceTypes){
			span = span + "-</span>";
			return span;
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
			var modes = control.modes;
			operations = control.operations;		//[2018-04-12][상단에 이미 선언되어있고 할당이되지않은상태]
			var temperatures = control.temperatures;
			var configuration = control.configuration,
				aoControlPoint = control.aoControlPoint,
				doControlPoint = control.doControlPoint,
				lights = control.lights;

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
					txt = I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL") + " : " + configuration.remoteControl;
				}
			}

			if(lights && lights.length > 0){
				count += lights.length;
				if(!hasDisplay){
					txt = I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + " " + I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS") + " : " + lights[0].dimmingLevel;
				}
			}

			var controlPoint = aoControlPoint;
			if(controlPoint && typeof controlPoint.value !== 'undefined'){
				count += 1;
				if(!hasDisplay){
					txt = "AO " + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + " : " + controlPoint.value;
				}
			}

			controlPoint = doControlPoint;	//[2018-04-12][상단에 이미선언]
			if( controlPoint && typeof controlPoint.value !== 'undefined'){
				count += 1;
				if(!hasDisplay){
					txt = "DO " + I18N.prop("FACILITY_HISTORY_OPERATION_CONTROLPOINT_VALUE") + " : " + controlPoint.value;
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
	*   <li>Rule 상세/Load 팝업 리스트의 Rule 조건을 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function conditionTemplate
	*   @param {Object} rule - Rule 정보 객체
	*   @returns {String} - 상세/Load 팝업 리스트의 Rule 조건을 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var conditionTemplate = function(rule){
		var operator = rule.operator;
		operator = operator === '==' ? '=' : operator;
		var monitor = rule.monitor ? rule.monitor : "-";
		var value = rule.value ? rule.value : "-";
		monitor = RuleMonitorText[monitor] ? RuleMonitorText[monitor] : monitor;
		value = RuleValueText[value] ? RuleValueText[value] : value;
		return monitor + " : " + operator + " : " + value;
	};
	/**
	*   <ul>
	*   <li>Rule 상세/Load 팝업 리스트의 Rule 조건을 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function detailConditionTemplate
	*   @param {Object} rule - Rule 정보 객체
	*   @returns {String} - 상세/Load 팝업 리스트의 Rule 조건을 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var detailConditionTemplate = function(rule){
		var operator = rule.operator;
		operator = operator === '==' ? '=' : operator;
		var monitor = rule.monitor ? rule.monitor : "-";
		var value = rule.value ? rule.value : "-";
		monitor = RuleMonitorText[monitor] ? RuleMonitorText[monitor] : monitor;
		value = RuleValueText[value] ? RuleValueText[value] : value;
		if(rule.devices){
			var i, max = rule.devices.length;
			var devices = "";
			var name;
			for( i = 0; i < max; i++ ){
				name = rule.devices[i].dms_devices_name;
				name = name ? name : "-";
				devices += name;
				if(i != max - 1){
					devices += ", ";
				}
			}
			return "<div>" + monitor + " : " + operator + " : " + value + "</div><div>" + devices + "</div>";
		}
	};
	/**
	*   <ul>
	*   <li>Rule 리스트/상세/Load 팝업 리스트의 Rule 조건을 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function conditionListTemplate
	*   @param {Object} data - Rule 정보 객체
	*   @returns {String} - 리스트/상세/Load 팝업 리스트의 Rule 조건을 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var conditionListTemplate = function(data){
		var val = "-";
		var rules, condition = data.condition;
		if(condition){
			rules = condition.rules;
			if(rules && rules.length > 0){
				var max = rules.length;		//[2018-04-12][미사용 i 변수 제거]
				var rule = rules[0];

				val = conditionTemplate(rule);

				if(max > 1){
					val += " (+" + (max - 1) + ")";
				}
			}
		}

		return val;
	};

	var moreOperationListTemplate = function(data){
		var operation = operationListTemplate(data);
		var actionBtn = scheduleDetailBtnTemplate(data);
		return operation + actionBtn;
	};
	/**
	*   <ul>
	*   <li>Rule 리스트/상세/Load 팝업 리스트의 Rule 운영을 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function loadOperationListTemplate
	*   @param {Object} data - Rule 정보 객체
	*   @returns {String} - 리스트/상세/Load 팝업 리스트의 Rule 운영을 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var loadOperationListTemplate = function(data){
		var operation = operationListTemplate(data);
		var status = scheduleActivatedTemplate(data);
		return operation + status;
	};
	/**
	*   <ul>
	*   <li>팝업 리스트에 Rule의 실행시간을 표시하는 HTML String으로 리턴한다.</li>
	*   </ul>
	*   @function executionTimeListTemplate
	*   @param {Object} data - Rule 정보 객체
	*   @returns {String} - 팝업 리스트에 Rule의 실행시간을 표시하는 HTML String
	*   @alias module:app/operation/rule/template/rule-template
	*/
	var executionTimeListTemplate = function(data){
		var txt = "-";
		var time, times = data.executionTimes;
		if(times){
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
		}
		return txt;
	};

	var checkboxCellTemplate = function(data){
		var className = getEventTemplateClass(data);
		var uid = data.uid;
		var checked = data.checked ? "checked" : "";
		return '<div class="schedule-checkbox-cell ' + className + '"><span class="checkbox-wrapper"><input type="checkbox" id="check_' + uid + '" class="k-checkbox" ' + checked + '/><label for="check_' + uid + '" class="k-checkbox-label"></label></span></div>';
	};

	var radioCellTemplate = function(data){
		var className = getEventTemplateClass(data);
		var uid = data.uid;
		var checked = data.checked ? "checked" : "";
		return '<div class="schedule-checkbox-cell ' + className + '"><span class="checkbox-wrapper"><input type="radio" id="check_' + uid + '" class="k-radio" ' + checked + '/><label for="check_' + uid + '" class="k-radio-label"></label></span></div>';
	};


	return {
		scheduleDetailListTemplate : scheduleDetailListTemplate,
		scheduleDetailNameTemplate : scheduleDetailNameTemplate,
		operationListTemplate : operationListTemplate,
		conditionListTemplate : conditionListTemplate,
		conditionTemplate : conditionTemplate,
		detailConditionTemplate : detailConditionTemplate,
		moreOperationListTemplate : moreOperationListTemplate,
		loadOperationListTemplate : loadOperationListTemplate,
		executionTimeListTemplate : executionTimeListTemplate,
		getEventTemplateClass : getEventTemplateClass,
		checkboxCellTemplate : checkboxCellTemplate,
		radioCellTemplate : radioCellTemplate,
		getEventTemplateType : getEventTemplateType
	};
});
//# sourceURL=operation/rule-template.js