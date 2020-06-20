define("operation/rule/view-model/rule-create-vm", ["operation/core", "operation/schedule/config/schedule-common",
	   "operation/schedule/config/schedule-template"], function(CoreModule, Common, Template){
	var kendo = window.kendo;
	var moment = window.moment;
	var Util = window.Util;
	var Settings = window.GlobalSettings;
	var I18N = window.I18N;
	var MainWindow = window.MAIN_WINDOW;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	var MAX_RULE_CONDITION_SIZE = 24;
	var temperatureSettings = Settings.getTemperature();
	var unitType = temperatureSettings.unit;
	var unit = Util.CHAR[unitType];
	var step = temperatureSettings.increment;
	var isFahrenheit = (unitType == "Fahrenheit") ? true : false;

	var typeOrdering = Settings.getDeviceTypeOrdering();
	//Temperature_Humidity에 대한 처리
	//Sensor.Temperatured와 Humidity를 추가한다.
	var typeIndex = typeOrdering.indexOf("Sensor.Temperature_Humidity");
	if(typeIndex != -1){
		typeOrdering.splice(typeIndex, 0, "Sensor.Humidity");
		typeOrdering.splice(typeIndex, 0, "Sensor.Temperature");
	}

	var typeFilterDataSource = Util.getControllableDeviceTypeDataSource();

	var typeQuery = ["AirConditioner.*", "ControlPoint.AO", "ControlPoint.DO", "Beacon", "Gateway", "Light", "CCTV"];

	var typeFilterText = {
		"AirConditioner" : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"),
		"AirConditionerOutdoor" : I18N.prop("FACILITY_DEVICE_TYPE_SAC_OUTDOOR"),
		"ControlPoint" : I18N.prop("FACILITY_DEVICE_TYPE_POINT"),
		"Meter" : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"),
		"Beacon" : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"),
		"IoT Gateway" : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"),
		"Light" : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"),
		"CCTV" : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"),
		"Printer" : I18N.prop("FACILITY_DEVICE_TYPE_PRINTER")
	};

	var createStep = $(".schedule-create-step-list");

	var MainViewModel = kendo.observable({
		mapBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		listBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		filters : [
			{
				type : "noneLabelDropdowncheckbox",
				id : "device-type-list",
				invisible : false,      //숨김 여부
				disabled : false,       //비활성화 여부
				options : {                 //생성될 위젯의 옵션
					selectAllText : I18N.prop("FACILITY_DEVICE_TYPE_ALL"),
					emptyText: I18N.prop("FACILITY_RULE_CREATE_RULE_CHECK_DROPDOWNLIST_EMPTYTEXT"),
					dataTextField: "text",              //반영되지 않는 옵션의 경우 device-base.html 템플릿 수정 필요
					dataValueField: "value",
					animation: false,
					autoBind : false,
					showSelectAll: true,
					dataSource: typeFilterDataSource,
					select : function(){},
					click : function(){}
				}
			},
			{
				type : "dropdownlist",
				id : "device-sub-type-list",
				disabled : true,
				invisible : false,
				options : {
					optionLabel : I18N.prop("FACILITY_DEVICE_TYPE_SUB"),
					dataTextField: "displayType",
					dataValueField: "type",
					animation: false,
					dataSource: [],
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			},
			{
				type : "button",
				id : "device-select-all",
				text : Common.MSG.TXT_SELECT_ALL,
				invisible : false,
				disabled : false,
				options : {
					click : function(){}
				}
			},
			{
				type : "template",
				invisible : true,
				id : "schedule-step-title",
				// template : "<span class='schedule-step-title' data-bind='invisible: invisible, text: options.stepTitle ,attr: { id : id }'></span>",
				template : "<span class='schedule-step-title' data-bind='invisible: invisible ,attr: { id : id }'></span>",
				options : {
					stepTitle : I18N.prop("FACILITY_SCHEDULE_DATETIME_SETTING")
				}
			}
		],
		actions : [
			{
				type : "template",
				id : "spanSelectedCount",
				template : "<span class='text-view'><span data-bind='text: options.selectedText'></span></span>",
				options : {
					selectedText : I18N.prop("FACILITY_DEVICE_NO_SELECTED")
				}
			},
			{
				type : "button",
				id : "create-prev",
				text : I18N.prop("COMMON_BTN_PREV"),
				invisible : false,
				disabled : true,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			},
			{                                           //버튼 타입 filter 영역과 동일함.
				type : "button",
				id : "create-load",
				text : I18N.prop("COMMON_BTN_LOAD"),
				invisible : false,
				disabled : false,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			},
			{
				type : "button",
				id : "create-next",
				text : I18N.prop("COMMON_BTN_NEXT"),
				invisible : false,
				disabled : true,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			},
			{
				type : "button",
				id : "create-btn",
				text : I18N.prop("COMMON_BTN_CREATE"),
				invisible : true,
				disabled : false,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			}
		],
		category : {
			invisible : true,
			selected : {
				num : 0,
				active : false,
				click : function(){}
			},
			all : {     //floor
				num : 0,
				text : I18N.prop("COMMON_ALL"),
				active : false,
				click : function(){}
			},
			group : {
				num : 0,
				active : false,
				click : function(){}
			}
		},
		hideMapPanel : false,
		hideSchedulePanel : true,
		hidePanel : false,
		isAlarmLog : false,
		isEdit: false,
		editLoadReady: false,
		notRegistered: false
	});

	var DEFAULT_NUMERIC_MIN = -1000000;
	var DEFAULT_NUMERIC_MAX = 1000000;

	var DOUBLE_NUMERIC_MIN = -1.79e+308;
	var DOUBLE_NUMERIC_MAX = 1.79e+308;
	//[2018-04-12][해당변수를 사용하는 코드가 주석처리되어 미사용 코드가되어 주석처리함]
	//실내기 설정 온도
	// var CONDITION_ROOM_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	// var CONDITION_ROOM_MIN = isFahrenheit ? 46 : 8;
	// var CONDITION_ROOM_MAX = isFahrenheit ? 86 : 30;

	//[2018-04-12][해당변수를 사용하는 코드가 주석처리되어 미사용 코드가되어 주석처리함]
	//급탕 설정 온도
	// var CONDITION_DHW_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	// var CONDITION_DHW_MIN = isFahrenheit ? Util.getFahrenheit(-5) : -5;
	// var CONDITION_DHW_MAX = isFahrenheit ? Util.getFahrenheit(80) : 80;

	//[2018-04-12][해당변수를 사용하는 코드가 주석처리되어 미사용 코드가되어 주석처리함]
	//출수 설정 온도
	// var CONDITION_WATER_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	// var CONDITION_WATER_MIN = isFahrenheit ? 14 : -10;
	// var CONDITION_WATER_MAX = isFahrenheit ? 176 : 80;

	//[2018-04-12][해당변수를 사용하는 코드가 주석처리되어 미사용 코드가되어 주석처리함]
	/*
		현재 온도, 급탕 현재 온도, 현재 토출 온도
	*/
	// var CONDITION_CURRENT_TEMP_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	// var CONDITION_CURRENT_TEMP_MIN = isFahrenheit ? -67 : -55;
	// var CONDITION_CURRENT_TEMP_MAX = isFahrenheit ? 185 : 85;
	// // 난방 토출 온도
	// var CONDITION_HEAT_DISCHARGE_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	// var CONDITION_HEAT_DISCHARGE_MIN = isFahrenheit ? 64 : 18;
	// var CONDITION_HEAT_DISCHARGE_MAX = isFahrenheit ? 109 : 43;
	// // 냉방 토출 온도
	// var CONDITION_COOL_DISCHARGE_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	// var CONDITION_COOL_DISCHARGE_MIN = isFahrenheit ? 46 : 8;
	// var CONDITION_COOL_DISCHARGE_MAX = isFahrenheit ? 77 : 25;

	var errorCodeList = [];
	var errorCodeListForIndex, errorCodeListMax = 999;
	// var errorCode;		//[2018-04-12][변수선언후 미사용]
	for( errorCodeListForIndex = 0; errorCodeListForIndex <= errorCodeListMax; errorCodeListForIndex++ ){
		errorCodeList.push({
			text : errorCodeListForIndex,
			value : "Dev_" + errorCodeListForIndex
		});
	}

	var statusDataSource = {};
	statusDataSource["AirConditioner.Indoor.General"] = [
	//실내기 전원
		{
			text : I18N.prop("FACILITY_RULE_STATUS_INDOOR_POWER"),
			value : "operations-AirConditioner.Indoor.General-power",
			comparison : "boolean",
			valueList : [{
				text : I18N.prop("FACILITY_DEVICE_STATUS_ON"),
				value : "On"
			},{
				text : I18N.prop("FACILITY_DEVICE_STATUS_OFF"),
				value : "Off"
			}]
		},{ //환기 전원
			text : I18N.prop("FACILITY_RULE_STATUS_VENTILATOR_POWER"),
			value : "operations-AirConditioner.Indoor.Ventilator-power",
			comparison : "boolean",
			valueList : [{
				text : I18N.prop("FACILITY_DEVICE_STATUS_ON"),
				value : "On"
			},{
				text : I18N.prop("FACILITY_DEVICE_STATUS_OFF"),
				value : "Off"
			}]
		},{
			text : I18N.prop("FACILITY_RULE_STATUS_DHW_POWER"),
			value : "operations-AirConditioner.Indoor.DHW-power",
			comparison : "boolean",
			valueList : [{
				text : I18N.prop("FACILITY_DEVICE_STATUS_ON"),
				value : "On"
			},{
				text : I18N.prop("FACILITY_DEVICE_STATUS_OFF"),
				value : "Off"
			}]
		},{ //실내기 모드
			text : I18N.prop("FACILITY_RULE_STATUS_INDOOR_MODE"),
			value : "modes-AirConditioner.Indoor.General-mode",
			comparison : "string",
			valueList :[{ text : I18N.prop("FACILITY_INDOOR_MODE_AUTO"), value : "Auto" }, { text : I18N.prop("FACILITY_INDOOR_MODE_COOL"), value : "Cool" },
				   { text : I18N.prop('FACILITY_INDOOR_MODE_HEAT'), value : "Heat" }, { text : I18N.prop("FACILITY_INDOOR_MODE_DRY"), value : "Dry" },
				{ text: I18N.prop("FACILITY_INDOOR_MODE_FAN"), value: "Fan" }, { text: I18N.prop("FACILITY_INDOOR_MODE_COOLSTORAGE"), value: "CoolStorage" },
				{ text: I18N.prop("FACILITY_INDOOR_MODE_HOTWATER"), value: "HeatStorage" }]
		},{ //환기 모드
			text : I18N.prop("FACILITY_RULE_STATUS_VENTILATOR_MODE"),
			value : "modes-AirConditioner.Indoor.Ventilator-mode",
			comparison : "string",
			valueList :[{ text : I18N.prop("FACILITY_INDOOR_MODE_AUTO"), value : "Auto" }, { text : I18N.prop("FACILITY_INDOOR_MODE_HEATEX"), value : "HeatExchange" },
				   { text : I18N.prop("FACILITY_INDOOR_MODE_BYPASS"), value : "ByPass" }, { text : I18N.prop("FACILITY_INDOOR_MODE_SLEEP"), value : "Sleep" }]
		},{ //급탕 모드
			text : I18N.prop("FACILITY_RULE_STATUS_DHW_MODE"),
			value : "modes-AirConditioner.Indoor.DHW-mode",
			comparison : "string",
			valueList :[{ text : I18N.prop("FACILITY_INDOOR_MODE_ECO"), value : "Eco" }, { text : I18N.prop("FACILITY_INDOOR_MODE_STANDARD"), value : "Standard" },
				   { text : I18N.prop("FACILITY_INDOOR_MODE_POWER"), value : "Power" }, { text : I18N.prop("FACILITY_INDOOR_MODE_FORCE"), value : "Force" }]
		},{ //현재 온도
			text : I18N.prop("FACILITY_RULE_STATUS_INDOOR_CURRENT_TEMPERATURE"),
			value : "temperatures-AirConditioner.Indoor.Room-current",
			comparison : "int",
			//min : CONDITION_CURRENT_TEMP_MIN,
			//max : CONDITION_CURRENT_TEMP_MAX,
			//desired : CONDITION_CURRENT_TEMP_DESIRED
			//point : CONDITION_CURRENT_TEMP_DESIRED,
			min : DEFAULT_NUMERIC_MIN,
			max : DEFAULT_NUMERIC_MAX,
			point : null,
			format : "n0"
		},
		{   //급탕 현재온도
			text : I18N.prop("FACILITY_RULE_STATUS_DHW_CURRENT_TEMPERATURE"),
			value : "temperatures-AirConditioner.Indoor.DHW-current",
			comparison : "int",
			//min : CONDITION_CURRENT_TEMP_MIN,
			//max : CONDITION_CURRENT_TEMP_MAX,
			//desired : CONDITION_CURRENT_TEMP_DESIRED
			//point : CONDITION_CURRENT_TEMP_DESIRED,
			min : DEFAULT_NUMERIC_MIN,
			max : DEFAULT_NUMERIC_MAX,
			point : null,
			format : "n0"
		},
		{ //실내기 설정 온도
			text : I18N.prop("FACILITY_RULE_STATUS_INDOOR_SET_TEMPERATURE"),
			value : "temperatures-AirConditioner.Indoor.Room-desired",
			comparison : "int",
			//min : CONDITION_ROOM_MIN,
			//max : CONDITION_ROOM_MAX,
			//desired : CONDITION_ROOM_DESIRED
			//point : CONDITION_ROOM_DESIRED,
			min : DEFAULT_NUMERIC_MIN,
			max : DEFAULT_NUMERIC_MAX,
			point : null,
			format : "n0"
		},{ //급탕 설정 온도
			text : I18N.prop("FACILITY_RULE_STATUS_DHW_SET_TEMPERATURE"),
			value : "temperatures-AirConditioner.Indoor.DHW-desired",
			comparison : "int",
			//min : CONDITION_DHW_MIN,
			//max : CONDITION_DHW_MAX,
			//desired : CONDITION_DHW_DESIRED,
			//point : CONDITION_DHW_DESIRED,
			min : DEFAULT_NUMERIC_MIN,
			max : DEFAULT_NUMERIC_MAX,
			point : null,
			format : "n0"
		},{ //출수 설정 온도
			text : I18N.prop("FACILITY_RULE_STATUS_WATER_OUT_SET_TEMPERATURE"),
			value : "temperatures-AirConditioner.Indoor.WaterOutlet-desired",
			comparison : "int",
			//min : CONDITION_WATER_MIN,
			//max : CONDITION_WATER_MAX,
			//desired : CONDITION_WATER_DESIRED,
			//point : CONDITION_WATER_DESIRED,
			min : DEFAULT_NUMERIC_MIN,
			max : DEFAULT_NUMERIC_MAX,
			point : null,
			format : "n0"
		},{//현재 토출 온도
			text : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_CURRENT_TEMPERATURE"),
			// value : "temperatures-DischargeAir-current",
			value : "temperatures-AirConditioner.DischargeAir-current",								//[2018-04-30][temperatures-DischargeAir-current → temperatures-AirConditioner.DischargeAir-current]
			comparison : "int",
			//min : CONDITION_CURRENT_TEMP_MIN,
			//max : CONDITION_CURRENT_TEMP_MAX,
			//desired : CONDITION_CURRENT_TEMP_DESIRED,
			//point : CONDITION_CURRENT_TEMP_DESIRED,
			min : DEFAULT_NUMERIC_MIN,
			max : DEFAULT_NUMERIC_MAX,
			point : null,
			format : "n0"
		},{//난방 토출 설정 온도
			text : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_HEAT_TEMPERATURE"),
			// value : "temperatures-DischargeAir.Heat-desired",
			value : "temperatures-AirConditioner.DischargeAir.Heat-desired",			//[2018-04-30][temperatures-DischargeAir.Heat-desired → temperatures-AirConditioner.DischargeAir.Heat-desired]
			comparison : "int",
			//min : CONDITION_HEAT_DISCHARGE_MIN,
			//max : CONDITION_HEAT_DISCHARGE_MAX,
			//desired : CONDITION_HEAT_DISCHARGE_DESIRED,
			//point : CONDITION_HEAT_DISCHARGE_DESIRED,
			min : DEFAULT_NUMERIC_MIN,
			max : DEFAULT_NUMERIC_MAX,
			point : null,
			format : "n0"
		},{//냉방 토출 설정 온도
			text : I18N.prop("FACILITY_RULE_STATUS_DISCHARGE_COOL_TEMPERATURE"),
			// value : "temperatures-DischargeAir.Cool-desired",
			value : "temperatures-AirConditioner.DischargeAir.Cool-desired",			//[2018-04-30][temperatures-DischargeAir.Cool-desired → temperatures-AirConditioner.DischargeAir.Cool-desired]
			comparison : "int",
			//min : CONDITION_COOL_DISCHARGE_MIN,
			///max : CONDITION_COOL_DISCHARGE_MAX,
			//desired : CONDITION_COOL_DISCHARGE_DESIRED,
			//point : CONDITION_COOL_DISCHARGE_DESIRED,
			min : DEFAULT_NUMERIC_MIN,
			max : DEFAULT_NUMERIC_MAX,
			point : null,
			format : "n0"
		},{ //실내기 풍량
			text : I18N.prop("FACILITY_RULE_STATUS_FAN_SPEED"),
			comparison : "string",
			value : "winds-AirConditioner.Indoor.General.Speed-wind",
			valueList :[{ text : I18N.prop("FACILITY_CONTROL_INDOOR_FAN_SPEED_AUTO"), value : "Auto" }, { text : I18N.prop("FACILITY_INDOOR_CONTROL_LOW"), value : "Low" },
				   { text : I18N.prop("FACILITY_INDOOR_CONTROL_MID"), value : "Mid" }, { text : I18N.prop("FACILITY_INDOOR_CONTROL_HIGH"), value : "High" },
				   { text : I18N.prop("FACILITY_INDOOR_CONTROL_TURBO"), value : "Turbo" }]
		},{ //ERV 풍량
			text : I18N.prop("FACILITY_RULE_STATUS_VENTILATOR_FAN_SPEED"),
			comparison : "string",
			value : "winds-AirConditioner.Indoor.Ventilator.Speed-wind",
			valueList :[{ text : I18N.prop("FACILITY_INDOOR_CONTROL_LOW_MID"), value : "Mid" }, { text : I18N.prop("FACILITY_INDOOR_CONTROL_HIGH"), value : "High" },
				   { text : I18N.prop("FACILITY_INDOOR_CONTROL_TURBO"), value : "Turbo" }]
		},/*{ //기류 제어 풍량
		text : "Wind Direction",
		comparison : "string",
		value : "winds-AirConditioner.Indoor.General.Direction-wind",
		valueList :[{ text : "Swing", value : "Swing" }, { text : "Wide", value : "Wide" },
				   { text : "Spot", value : "Spot" }, { text : "Mid", value : "Mid" },
				   { text : "LeftRight", value : "LeftRight" }, { text : "UpDown", value : "UpDown" },
				   { text : "All", value : "All" }, { text : "Fix", value : "Fix" }]
	},*/{ //value 값 확인 필요
			text : I18N.prop("FACILITY_RULE_STATUS_ERROR_CODE"),
			comparison : "string",
			// value : "alarms-name",
			value : "alarms-alarms_name",			//[2018-04-30][alarms-name → alarms-alarms_name]
			valueList : errorCodeList
		}];


	var outdoorValues = {
		electricCurrentControl : [
			{value : "SelfControl",text : I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_SELF_CONTROL")},
			{value : 50,text : "50%"},
			{value : 55,text : "55%"},
			{value : 60,text : "60%"},
			{value : 65,text : "65%"},
			{value : 70,text : "70%"},
			{value : 75,text : "75%"},
			{value : 80,text : "80%"},
			{value : 85,text : "85%"},
			{value : 90,text : "90%"},
			{value : 95,text : "95%"},
			{value : 100,text : "100%"}
		],
		coolingCapacityCalibration : {
			"Celsius" : [
						 {value : "SelfControl",text : I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_SELF_CONTROL")},
						 {value : "5~7",text : "5~7°C"},
						 {value : "7~9",text : "7~9°C"},
						 {value : "9~11",text : "9~11°C"},
						 {value : "10~12",text : "10~12°C"},
						 {value : "11~13",text : "11~13°C"},
						 {value : "12~14",text : "12~14°C"},
						 {value : "13~15",text : "13~15°C"}
						 ],
			"Fahrenheit" : [
					 {value : "SelfControl",text : I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_SELF_CONTROL")},
					 {value : "5~7",text : "41~45°F"},
					 {value : "7~9",text : "45~48°F"},
					 {value : "9~11",text : "48~52°F"},
					 {value : "10~12",text : "50~54°F"},
					 {value : "11~13",text : "52~55°F"},
					 {value : "12~14",text : "54~57°F"},
					 {value : "13~15",text : "55~59°F"}
			]},
		heatingCapacityCalibration : [
			{value : "SelfControl",text : I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_SELF_CONTROL")},
			{value : 25,text : "25kg/cm²"},
			{value : 26,text : "26kg/cm²"},
			{value : 27,text : "27kg/cm²"},
			{value : 28,text : "28kg/cm²"},
			{value : 29,text : "29kg/cm²"},
			{value : 30,text : "30kg/cm²"},
			{value : 31,text : "31kg/cm²"},
			{value : 32,text : "32kg/cm²"},
			{value : 33,text : "33kg/cm²"}
		]
	};

	//Value 확인 필요
	statusDataSource["AirConditionerOutdoor"] = [{
		text : I18N.prop("FACILITY_RULE_STATUS_CURRENT_LIMIT"),
		value : "airConditioner-outdoorUnit-electricCurrentControl",
		comparison : "string",
		valueList : outdoorValues.electricCurrentControl
	},{
		text : I18N.prop("FACILITY_RULE_STATUS_COOLING_CAPACITY_CALIBRATION"),
		comparison : "string",
		value : "airConditioner-outdoorUnit-coolingCapacityCalibration",
		valueList : outdoorValues.coolingCapacityCalibration[unitType]
	},{
		text : I18N.prop("FACILITY_RULE_STATUS_HEATING_CAPACITY_CALIBRATION"),
		comparison : "string",
		value : "airConditioner-outdoorUnit-heatingCapacityCalibration",
		valueList : outdoorValues.heatingCapacityCalibration
	},{
		text : I18N.prop("FACILITY_DEVICE_OUTDOOR_TEMPERATURE"),
		// comparison : "string",		//[2018-04-12][중복선언되어 상단 주석처리]
		value : "temperatures-AirConditioner.Outdoor-current",
		comparison : "int",
		//min : CONDITION_CURRENT_TEMP_MIN,
		//max : CONDITION_CURRENT_TEMP_MAX,
		//desired : CONDITION_CURRENT_TEMP_DESIRED,
		//point : CONDITION_CURRENT_TEMP_DESIRED,
		min : DEFAULT_NUMERIC_MIN,
		max : DEFAULT_NUMERIC_MAX,
		point : null,
		format : "n0"
	}];

	statusDataSource["ControlPoint"] = [{
		text : "DI/DO",
		comparison : "string",
		value : "controlPoint-value_DIDO",
		format : "n0",
		min : 0,
		max : 1,
		point : null
	},{
		text : "AI/AO",
		comparison : "int",
		value : "controlPoint-value_AIAO",
		format : "n1",
		//32bit double min max
		min : DOUBLE_NUMERIC_MIN,
		max : DOUBLE_NUMERIC_MAX,
		point : null
	}];

	statusDataSource["Light"] = [{
		text : I18N.prop("FACILITY_INDOOR_CONTROL_POWER"),
		value : "operations-General-power",
		comparison : "boolean",
		valueList : [{
			text : I18N.prop("FACILITY_DEVICE_STATUS_ON"),
			value : "On"
		},{
			text : I18N.prop("FACILITY_DEVICE_STATUS_OFF"),
			value : "Off"
		}]
	},{
		text : I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS"),
		value : "lights-1-dimmingLevel",
		comparison : "int",
		min : DEFAULT_NUMERIC_MIN,
		max : DEFAULT_NUMERIC_MAX,
		point : null,
		format : "n0"
	}];

	statusDataSource["Sensor.Temperature"] = [{
		text : I18N.prop("COMMON_TEMPERATURE"),
		value : "temperatures-General-current",
		comparison : "int",
		format : "n1",
		//32bit double min max
		min: DEFAULT_NUMERIC_MIN,
		max: DEFAULT_NUMERIC_MAX,
		point : null
	}];

	statusDataSource["Sensor.Humidity"] = [{
		text : I18N.prop("COMMON_HUMIDITY"),
		value : "humidities-1-current",
		comparison : "int",
		format : "n1",
		//32bit double min max
		min: DEFAULT_NUMERIC_MIN,
		max: DEFAULT_NUMERIC_MAX,
		point : null
	}];

	statusDataSource["Sensor.Motion"] = [{
		text : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE"),
		value : "presences-1-detected",
		comparison : "boolean",
		valueList : [{
			text : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_PRESENCE"),
			value : true
		},{
			text : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_ABSENCE"),
			value : false
		}]
	}];

	statusDataSource["Meter"] = [{
		text : I18N.prop("FACILITY_DEVICE_CURRENT_CONSUMPTION_UPPER"),
		value : "meters-1-reading",
		comparison : "int",
		format : "n1",
		//32bit double min max
		min : DOUBLE_NUMERIC_MIN,
		max : DOUBLE_NUMERIC_MAX,
		point : null
	}];

	function openMsgDialog(msg){
		var dialog = $("<div/>").kendoCommonDialog({
			isCustomActions : true,
			actions : [{
				text : I18N.prop("COMMON_BTN_OK"),
				action : function(e){
					e.sender.close();
					e.sender.destroy();
					e.sender.element.remove();
				}
			}]
		}).data("kendoCommonDialog");
		dialog.message(msg);
		dialog.open();
	}

	//허용하지 않는 문자와 MIN/MAX 값을 넘었을 경우의 팝업 표시
	function checkPointValueKeyUp(){
		var self = $(this);
		var value = self.val();
		var numeric = self.data("kendoNumericTextBox");
		//음수 가능
		var isNegative = numeric.options.min < 0 ? true : false;
		var beforeValue; //[2018-04-12][상위에 선언]
		var format = numeric.options.format;
		format = format.replace("n", "");

		var regExp;
		//소수점 존재
		if(format != "" && format != "0"){
			if(isNegative){
				regExp = /^[0-9.-]+$/;
			}else{
				regExp = /^[0-9.]+$/;
			}
		}else if(isNegative){	//소수점 존재하지 않음
			regExp = /^[0-9-]+$/;
		}else{
			regExp = /^[0-9]+$/;
		}


		//[2018-04-12][if문 수정]
		// else{  //소수점 존재하지 않음
		//     if(isNegative){
		//         regExp = /^[0-9-]+$/;
		//     }else{
		//         regExp = /^[0-9]+$/;
		//     }
		// }

		if(value != "" && !value.match(regExp)){
			beforeValue = numeric.beforeValue;
			if(typeof beforeValue !== 'undefined' || beforeValue !== null){
				beforeValue = Number(beforeValue);
				self.val(beforeValue);
				//popup
				openMsgDialog(I18N.prop("COMMON_INVALID_CHARACTER"));
				return;
			}
		}

		var min = numeric.min();
		var numericMax = numeric.max();
		if(min && numericMax && value != ""){
			value = Number(value);
			min = Number(min);
			numericMax = Number(numericMax);

			if(value < min || value > numericMax){
				//popup
				beforeValue = numeric.beforeValue;
				numeric.value(beforeValue);
				openMsgDialog(I18N.prop("COMMON_INVALID_MIN_MAX", min, numericMax));
				return;
			}
		}

		ConditionViewModel.trigger("change", { keyUpValue : value });
	}

	function checkPointValueChange(e){
		var self = $(this);
		var value = self.val();
		var numeric = self.data("kendoNumericTextBox");
		numeric.beforeValue = value;
	}

	var comparisonDataSource = {
		double : ["=", ">=", "<=", ">", "<", "!="],
		string : ["=", "!="]
	};

	function calculationChange(e){
		//var data = e.sender.dataItem();
		var data = { value : e.sender.value() };
		//var data = e.dataItem;
		var parent = this.parent();
		parent = parent.parent();
		var index = parent.indexOf(this);
		var devices = this.devices;

		if(data.value == "Average"){
			this.set("showAddDeviceBtn", true);

			//합/차에서 평균으로 변경할 경우
			if(devices.length > 1){
				devices[1].set("showRemoveBtn", true);
			}
		}else{
			if(data.value == "Addition" || data.value == "Subtraction"){
				var isUpdate = this.calculation.isUpdate;
				//편집 일 경우에는 추가하지 않는다.
				if(this.devices.length < 2 && !isUpdate){
					parent.addDevice(index);
				}else if(this.devices.length > 2){
					devices.splice(2, devices.length - 1);
				}
				//편귱에서 합/차로 변경할 경우
				if(devices.length > 1){
					devices[1].set("showRemoveBtn", false);
				}
			}else if(data.value == "SingleStatus" || data.value == ""){
				if(this.devices.length > 1){
					devices.splice(1, devices.length - 1);
				}
			}
			this.set("showAddDeviceBtn", false);
		}

		//[2018-05-08][단일값이 평균 합차는 double int 만 계산되기에 double,int을 하나도 포함하지않은 모션센서를 제외시킵니다.]
		//[2018-05-08][정확한 명세가 나오기전까지 해당 로직 임시 주석처리 ]
		// if(data.value !== "SingleStatus" ){
		// 	// var newType = $.extend({}, deviceBlockListItem.type, true);
		// 	var newType = deviceBlockListItem.type;
		// 	var newTypeLength = newType.dataSource.length;
		// 	for(var i = 0; i < newTypeLength; i++){
		// 		if(newType.dataSource[i].type.indexOf('Sensor.Motion') !== -1){
		// 			newType.dataSource.splice(i,1);
		// 			break;
		// 		}
		// 	}
		// }
	}

	function statusChange(e){
		var data = e.sender.dataItem();
		//var data = e.dataItem;
		console.info(data);
		// var sender = e.sender;			//[2018-04-12][선언후 미사용]
		var element = e.sender.element;
		var valueWrapper = element.closest(".status-list-wrapper").siblings(".value-list-wrapper");
		// var devices = this.devices;		//[2018-04-12][사용되는 코드가 주석처리되어 미사용상태 주석처리]
		var max,min;		//[2018-04-12][상위에 변수선언]

		if(data.comparison == "string" || data.comparison == "boolean"){
			this.comparison.options.set("dataSource", comparisonDataSource.string);
		}else{
			this.comparison.options.set("dataSource", comparisonDataSource.double);
		}

		var value;
		if(data.valueList){
			this.valueTemperature.set("invisible", true);
			this.valueTemperature.set("disabled", true);
			this.valueInput.set("invisible", true);
			this.valueInput.set("disabled", true);

			this.valueList.set("invisible", false);
			this.valueList.set("disabled", false);
			this.valueList.options.set("dataSource", data.valueList);

		}else if(typeof data.desired !== 'undefined'){
			this.valueList.set("invisible", true);
			this.valueList.set("disabled", true);
			this.valueInput.set("invisible", true);
			this.valueInput.set("disabled", true);
			var valueTemperatureElem = valueWrapper.find("input.value-temperature[data-role='customnumericbox']");
			min = data.min;
			max = data.max;
			var desired = data.desired;
			var valueTemperature = valueTemperatureElem.data("kendoCustomNumericBox");

			valueTemperature.min(min);
			valueTemperature.max(max);
			this.valueTemperature.set("invisible", false);

			value = this.valueTemperature.get("value");

			//Min Max Refresh를 위함.
			this.valueTemperature.set("disabled", true);
			this.valueTemperature.set("disabled", false);

			if(typeof value === 'undefined' || value === null || value === ""){
				this.valueTemperature.set("value", desired);
			}else{
				if(typeof value == "string"){
					value = Number(value);
				}
				this.valueTemperature.set("value", value);
			}

		}else if(typeof data.point !== 'undefined'){
			this.valueList.set("invisible", true);
			this.valueList.set("disabled", true);
			this.valueTemperature.set("invisible", true);
			this.valueTemperature.set("disabled", true);

			var valueInputElem = valueWrapper.find("input.value-input[data-role='numerictextbox']");
			min = data.min;
			max = data.max;
			var format = data.format;
			var point = data.point;

			valueInputElem.off("keyup").on("keyup", checkPointValueKeyUp);
			valueInputElem.off("change").on("change", checkPointValueChange);

			var valueInput = valueInputElem.data("kendoNumericTextBox");
			valueInput.min(min);
			valueInput.max(max);
			valueInput.setOptions({format : format});


			//var i, max = devices.length;
			/*var val;
			for( i = 0; i < max; i++ ){
				val = devices[i].id.get("value");
				if(val.controlPoint && val.controlPoint.value !== undefined){
					val = val.controlPoint.value;
				}
			}

			if(val){
				this.valueInput.set("value", val);
			}else{*/
			//기본 값은 빈 값.

			value = this.valueInput.get("value");
			if(typeof value === 'undefined' || value === null || value === ""){
				this.valueInput.set("value", point);
				valueInput.beforeValue = point;
			}else{
				if(value < min || value > max){
					value = point;
					this.valueInput.set("value", point);
				}
				valueInput.beforeValue = value;
			}

			//}

			this.valueInput.set("invisible", false);

			//Min Max Refresh를 위함.
			this.valueInput.set("disabled", true);
			this.valueInput.set("disabled", false);
		}else{
			this.valueList.set("invisible", true);
			this.valueList.set("disabled", true);
			this.valueTemperature.set("invisible", true);
			this.valueTemperature.set("disabled", true);
			this.valueInput.set("invisible", true);
			this.valueInput.set("disabled", true);
		}
	}

	function buildingChange(e){
		//var data = e.sender.dataItem();
		//var data = e.dataItem;
		//var buildingId = data.id;
		var buildingId = e.sender.value();
		var self = this;
		var max;
		// console.log(buildingId);
		if(buildingId){
			Loading.open();
			$.ajax({
				url : "/foundation/space/floors?foundation_space_buildings_id=" + buildingId
			}).done(function(data){
				resetTypeStatusValue.bind(self)();
				data.sort(function(a, b){
					return a.sortOrder - b.sortOrder;
				});
				max = data.length;
				for(var i = 0; i < max; i++ ){
					data[i].name = Util.getFloorName(data[i]);
				}
				self.floor.set("dataSource", data);
				self.floor.set("disabled", false);
				if(MainViewModel.editLoadReady){
					self.zone.set('value', '');
					self.type.set("value", '');
					self.id.set("value", '');
				}
			}).fail(function(){									//[2018-04-12][xhq 파라메타를 사용하는 콘솔이 주석처리되어 미사용변수가됨 파라메타 제거]
				// var msg = Util.parseFailResponse(xhq);		//[2018-04-12][해당 변수를 사용하는 콘솔이 주석처리되어 미사용변수가됨 주석처리]
				// console.error(msg);
			}).always(function(){
				Loading.close();
			});
		}else{
			self.floor.set("disabled", true);
			self.zone.set("disabled", true);
			self.type.set("disabled", true);
			self.id.set("disabled", true);
		}
	}

	function floorChange(e){
		//var data = e.sender.dataItem();
		//var data = e.dataItem;
		//var floorId = data.id;
		var floorId = e.sender.value();
		var self = this;
		if(floorId){
			Loading.open();
			$.ajax({
				url : "/foundation/space/zones?foundation_space_floors_id=" + floorId
			}).done(function(data){
				data.sort(function(a, b){
					return a.sortOrder - b.sortOrder;
				});
				if(data && $.isArray){
					data.unshift({
						name : I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY_ZONE"),
						id : "none"
					});
					data.unshift({
						name : I18N.prop("FACILITY_DEVICE_ALL_ZONE"),
						id : "all"
					});
				}
				// self.zone.set("dataSource", data);
				// self.zone.set("disabled", false);
				checkEnableChange(self,e, data);
				resetTypeStatusValue.bind(self)();
				if(MainViewModel.editLoadReady){
					self.zone.set('value', '');
					self.type.set("value", '');
					self.id.set("value", '');
				}
			}).fail(function(){								//[2018-04-12][xhq 파라메타를 사용하는 콘솔이 주석처리되어 미사용변수가됨 파라메타 제거]
				// var msg = Util.parseFailResponse(xhq);	//[2018-04-12][해당 변수를 사용하는 콘솔이 주석처리되어 미사용변수가됨 주석처리]
				// console.error(msg);
			}).always(function(){
				Loading.close();
			});
		}else{
			self.zone.set("disabled", true);
			self.type.set("disabled", true);
			self.id.set("disabled", true);
		}
	}

	function zoneChange(e){
		//var data = e.dataItem;
		//var zoneId = data.id;
		resetTypeStatusValue.bind(this)();

		var zoneId = e.sender.value();
		if(zoneId){
			this.type.set("disabled", false);
			var type = this.type.get("value");
			// var disabled = this.type.get("disabled");		//[2018-04-12][변수 선언후 미사용]
			if(type){
				if(type instanceof kendo.data.ObservableObject){
					type = type.type;
					e.type = type;
				}
				//[2018-05-04][존변경시 선택되어있는 타입이있다면 기기를 리플레쉬할수있도록 cascade를 call]
				e.zoneId = zoneId;
				e.data.type.cascade.call(this, e);
			}
		}else{
			this.type.set("disabled", true);
			this.id.set("disabled", true);
		}
	}

	function typeChange(e,event){
		//var data = e.dataItem;
		//var type = data.type;

		//[2018-05-08][기존 로직 주석처리 아래 생성]
		// var type = e.type || e.sender.value();
		var self = this, type;

		resetTypeStatusValue.bind(this)();

		if(self === window){
			self = e;
			e = event;
		}else{
			type = e.sender.value();
		}

		var buildingId = self.building.get("value");
		if(buildingId instanceof kendo.data.ObservableObject){
			buildingId = buildingId.id;
		}

		var floorId = self.floor.get("value");
		if(floorId instanceof kendo.data.ObservableObject){
			floorId = floorId.id;
		}
		var zoneId = self.zone.get("value");
		if(zoneId instanceof kendo.data.ObservableObject){
			zoneId = zoneId.id;
		}
		zoneId = e.zoneId || zoneId;

		var q = "?";
		var mq = "";
		// q += "foundation_space_buildings_id=" + buildingId + "&";
		// q += "foundation_space_floors_id=" + floorId + "&";
		if(zoneId && zoneId !== "none" && zoneId !== "all"){
			q += "foundation_space_zones_ids=" + zoneId + "&";
		}
		if(zoneId === "none"){
			q += "foundation_space_floors_id=" + floorId + "&";
			q += "foundation_space_zones_ids=" + 0 + "&";
		}
		if(zoneId === "all"){
			q += "foundation_space_floors_id=" + floorId + "&";
		}

		//[2018-05-04][생성,편집시 value에 값이 있거나 value.type에 있는경우가 있어 이를 분기하는 로직]
		// type = e.sender.value();
		var optionLabel = e.sender.options.optionLabel;
		if(optionLabel !== I18N.prop("FACILITY_DEVICE_TYPE")){
			if(typeof self.type.value !== 'undefined' && self.type.value !== null){
				if(typeof self.type.value === 'string'){
					type = self.type.value;
				}
				if(typeof self.type.value.type !== 'undefined' && self.type.value.type !== null && self.type.value.type !== ''){
					type = self.type.value.type;
				}
			}
		}


		var mappedType;
		//ControlPoint MappedTypes
		if(type == "Sensor.Temperature" || type == "Sensor.Humidity" ||
		   type.indexOf("Meter") != -1 || type == "Light" || type == "Sensor.Motion"){
			mappedType = type;
			if(type == "Meter"){
				mappedType = "Meter.*";
			}
			mq = q + "types=ControlPoint.*&";
			mq += "registrationStatuses=Registered&";
		}

		q += "types=" + type + "&";
		if(type.indexOf("ControlPoint") != -1){
			q += "mappedTypes=ControlPoint&";
		}

		q += "registrationStatuses=Registered";

		var reqArr = [];
		if(type){

			Loading.open();
			var typeDevices = [], mappedTypeDevices = [];
			reqArr.push($.ajax({
				url : "/dms/devices" + q
			}).done(function(data){
				typeDevices = data;
			}));

			if(mappedType){
				mq += ("mappedTypes=" + mappedType);
				reqArr.push($.ajax({
					url : "/dms/devices" + mq
				}).done(function(data){
					mappedTypeDevices = data;
				}));
			}

			$.when.apply(self, reqArr).fail(function(){			//[2018-04-12][xhq 파라메타를 사용하는 콘솔이 주석처리되어 미사용변수가됨 파라메타 제거]
				// var msg = Util.parseFailResponse(xhq);		//[2018-04-12][해당 변수를 사용하는 콘솔이 주석처리되어 미사용변수가됨 주석처리]
				// console.error(msg);
			}).always(function(){
				var i, j, max, size, item, mappedItem, isExist = false;
				max = typeDevices.length; size = mappedTypeDevices.length;

				//중복 체크
				for( i = 0; i < size; i++ ){
					mappedItem = mappedTypeDevices[i];
					isExist = false;
					for( j = 0; j < max; j++ ){
						item = typeDevices[j];
						if(mappedItem.id == item.id){
							isExist = true;
							break;
						}
					}
					if(!isExist){
						typeDevices.push(mappedItem);
					}
				}
				typeDevices.sort(function(a, b){
					return a.name.localeCompare(b.name);
				});

				self.id.set("dataSource", typeDevices);
				self.id.set("disabled", false);

				if(MainViewModel.get('notRegistered')){
					createStep.find("li:not(li:eq(0),li:eq(1))").removeClass("enabled");
					createStep.find("li:eq(1)").click();
					MainViewModel.actions[3].set("disabled", true);
					openMsgDialog(I18N.prop("FACILITY_RULE_CONDITION_LOSE_ERROR"));
					MainViewModel.set('notRegistered', false);
				}

				Loading.close();
			});

		}else{
			self.id.set("disabled", true);
		}
	}

	function idChange(e){
		//var data = e.dataItem;
		var dataItem = e.sender.dataItem();

		resetTypeStatusValue.bind(this)();

		if(dataItem){
			if(dataItem.type){
				this.id.set("type", dataItem.type);
			}
			if(dataItem.mappedType){
				this.id.set("mappedType", dataItem.mappedType);
			}
			if(dataItem.name){
				this.id.set("name", dataItem.name);
			}
		}
		var type = this.type.get("value");
		if(type instanceof kendo.data.ObservableObject){
			type = type.type;
		}
		var parent = this.parent();
		parent = parent.parent();
		//var displayType = Util.getDetailDisplayType(type);
		var statusDs;
		if(type.indexOf("AirConditioner.") != -1){
			statusDs = statusDataSource["AirConditioner.Indoor.General"];
		}else if(type.indexOf("Outdoor") != -1){
			statusDs = statusDataSource["AirConditionerOutdoor"];
		}else if(type.indexOf("ControlPoint") != -1){
			statusDs = $.extend([], statusDataSource["ControlPoint"]);
			if(typeof dataItem.type !== 'undefined'){
				if(dataItem.type.indexOf("AO") !== -1 ||  dataItem.type.indexOf("AI") !== -1){
					statusDs.splice(0,1);
				}else{
					statusDs.splice(1,1);
				}
			}
		}else if(type.indexOf("Light") != -1){
			statusDs = statusDataSource["Light"];
		}else if(type == "Sensor.Humidity"){
			statusDs = statusDataSource["Sensor.Humidity"];
			// [2018-04-12][현재 if문 아래 주석처리된 if문이 있었음 eslint떄문에 조치]
			/*else if(type.indexOf("Temperature_") != -1){
				statusDs = statusDataSource["Sensor.Temperature_Humidity"];
			}*/
		}else if(type == "Sensor.Temperature"){
			statusDs = statusDataSource["Sensor.Temperature"];
		}else if(type.indexOf("Motion") != -1){
			statusDs = statusDataSource["Sensor.Motion"];
		}else if(type.indexOf("Meter") != -1){
			statusDs = statusDataSource["Meter"];
		}else{
			statusDs = [];
		}
		//[2018-05-08][기존로직]
		parent.status.options.set("dataSource", statusDs);

		if(parent.status.options.value !== null){
			//[2018-09-04][매핑타입이 있는 기기중에서 기기타입을 관제점으로 변경시 Status 상태값이 맞지않아 정상적으로 진행되지않아 예외처리]
			var matchStatusValue = false;
			for(var checkValueIndex = 0, statusDsLength = statusDs.length; checkValueIndex < statusDsLength; checkValueIndex++){
				if(statusDs[checkValueIndex].value.indexOf(parent.status.options.value) !== -1){
					matchStatusValue = true;
					break;
				}
			}
			if(matchStatusValue === false){
				createStep.find("li:not(li:eq(0),li:eq(1))").removeClass("enabled");
				createStep.find("li:eq(1)").click();
				MainViewModel.actions[3].set("disabled", true);
				openMsgDialog(I18N.prop("FACILITY_RULE_CONDITION_MISS_MATCH_ERROR"));
			}
		}

		//[2018-05-08][계산값이 단일값이 아니라면 조건상태에 String Boolean을 제외하는 로직]
		//[2018-05-08][SRS문서 기준 실외온도는 int 값이지만 백엔드에서 에러가 출력하여 해당 로직은 임시 주석처리 ]
		// var filter, dataSource;
		// if(parent.calculation.options.value !== 'SingleStatus'){
		// 	filter = {
		// 		logic: "or",
		// 		filters: [
		// 			{ field: "comparison", operator: "contains", value: "int" },
		// 			{ field: "comparison", operator: "contains", value: "double" }
		// 		]
		// 	};
		// }else{
		// 	filter = {};
		// }
		// dataSource = new kendo.data.DataSource({
		// 	data:statusDs,
		// 	filter: filter
		// });
		// parent.status.options.set("dataSource", dataSource);
		if (MainViewModel.get('editLoadReady') === false && ConditionViewModel.get("isUpdate") === true) {
			setTimeout(function(){
				ConditionViewModel.set("isUpdate", false);
				MainViewModel.set('editLoadReady', true);
			}, 1000);
		}
	}

	function resetTypeStatusValue () {
		if(!MainViewModel.editLoadReady) return;
		var parent = this.parent();
		parent = parent.parent();

		parent.status.options.set('value', null);
		parent.comparison.options.set('value', null);
		parent.valueInput.set('value', null);
		parent.valueList.set('value', null);
	}

	function checkEnableChange(that,event,data) {
		var self = that;
		var buildingId = self.building.get("value");
		if(buildingId instanceof kendo.data.ObservableObject){
			buildingId = buildingId.id;
		}

		var floorId = self.floor.get("value");
		if(floorId instanceof kendo.data.ObservableObject){
			floorId = floorId.id;
		}
		var zoneId = self.zone.get("value");
		if(zoneId instanceof kendo.data.ObservableObject){
			zoneId = zoneId.id;
		}
		var typeId = self.type.get("value");
		if(typeId instanceof kendo.data.ObservableObject){
			typeId = typeId.type;
		}
		// var deviceName = self.id.get('value');


		var buildingDisabled = self.building.disabled;
		var floorDisabled = self.floor.disabled;
		var zoneDisabled = self.zone.disabled;
		var typeDisabled = self.type.disabled;
		var idDisabled = self.id.disabled;
		if(!buildingDisabled && !floorDisabled && !zoneDisabled && !typeDisabled && !idDisabled &&
			(buildingId !== "" && typeof buildingId !== 'undefined' && buildingId !== null) &&
			(floorId !== "" && typeof floorId !== 'undefined' && floorId !== null) &&
			(zoneId !== "" && typeof zoneId !== 'undefined' && zoneId !== null) &&
			(typeId !== "" && typeof typeId !== 'undefined' && typeId !== null)
		){
			// typeChange(self,event);
			// self.zone.set("value",'');
			// self.type.set("value",'');
			// self.id.set("value",'');
		}else{
			self.zone.set("dataSource", data);
			self.zone.set("disabled", false);
		}
	}

	var ruleBlockListItem = {
		calculation : {
			isUpdate : false,
			disabled : false,
			invisible : false,
			options : {
				// optionLabel : I18N.prop("FACILITY_RULE_CALCULATION"),
				dataTextField: "text",
				dataValueField: "value",
				value : "SingleStatus",
				dataSource: [{
					text : I18N.prop("FACILITY_RULE_SINGLE_STATUS"),
					value : "SingleStatus"
				}, {
					text : I18N.prop("FACILITY_RULE_ADDITION"),
					value : "Addition"
				}, {
					text : I18N.prop("FACILITY_RULE_SUBTRACTION"),
					value : "Subtraction"
				}, {
					text : I18N.prop("FACILITY_RULE_AVERAGE"),
					value : "Average"
				}],
				select : function(){},
				change : calculationChange,
				cascade : calculationChange
			}
		},
		showAddDeviceBtn : false,
		devices : [],
		status : {
			disabled : false,
			invisible : false,
			options : {
				optionLabel : I18N.prop("COMMON_STATUS"),
				dataTextField: "text",
				dataValueField: "value",
				value : null,
				dataSource: [],
				select : function(){},
				change : statusChange,
				cascade : statusChange,
				dataBound : function(e){
					var parent = this.parent();
					parent = parent.parent();
					if(!parent.get("isUpdate")){
						this.status.options.set("value", null);
						this.valueList.set("invisible", true);
						this.valueList.set("disabled", true);
						this.valueTemperature.set("invisible", true);
						this.valueTemperature.set("disabled", true);
						this.valueInput.set("invisible", true);
						this.valueInput.set("disabled", true);
					}
				}
			}
		},
		comparison : {
			disabled : false,
			invisible : false,
			options : {
				optionLabel : I18N.prop("FACILITY_RULE_COMPARISON"),
				value : null,
				dataSource: [],
				select : function(e){
					// var data = e.dataItem;
					// console.info(data);

				}
			}
		},
		valueList : {
			disabled : false,
			invisible : true,
			value : null,
			options : {
				optionLabel : I18N.prop("FACILITY_RULE_SELECT_VALUE"),
				dataTextField: "text",
				dataValueField: "value",
				dataSource: [],
				select : function(e){

				}
			}
		},
		valueTemperature : {
			disabled : false,
			invisible : true,
			unit : unit,
			step : step,
			value : null
		},
		valueInput : {
			disabled : false,
			invisible : true,
			value : null
		},
		duration : {
			disabled : false,
			invisible : false,
			options : {
				optionLabel : I18N.prop("FACILITY_RULE_NO_DURATION"),
				value : null,
				dataTextField: "text",
				dataValueField: "value",
				dataSource: [{
					text : I18N.prop("FACILITY_RULE_1_MIN"),
					value : "P1M"
				},{
					text : I18N.prop("FACILITY_RULE_2_MIN"),
					value : "P2M"
				},{
					text : I18N.prop("FACILITY_RULE_3_MIN"),
					value : "P3M"
				},{
					text : I18N.prop("FACILITY_RULE_5_MIN"),
					value : "P5M"
				},{
					text : I18N.prop("FACILITY_RULE_7_MIN"),
					value : "P7M"
				},{
					text : I18N.prop("FACILITY_RULE_10_MIN"),
					value : "P10M"
				},{
					text : I18N.prop("FACILITY_RULE_15_MIN"),
					value : "P15M"
				},{
					text : I18N.prop("FACILITY_RULE_1_HOUR"),
					value : "P1H"
				}],
				select : function(e){

				}
			}
		},
		isAnd : true,
		isOr : false,
		clickAndBtn : function(e){
			this.set("isAnd", true);
			this.set("isOr", false);
		},
		clickOrBtn : function(e){
			this.set("isAnd", false);
			this.set("isOr", true);
		},
		// showAddDeviceBtn : false,		//[2018-04-12][상단에 동일 내용 동일명으로 선언된 키가 존재 주석처리]
		showRemoveBtn : false,
		showOperator : false,
		showAddBtn : true
	};

	var deviceBlockListItem = {
		building : {
			invisible : false,
			disabled : false,
			optionLabel : I18N.prop("SPACE_BUILDING"),
			dataTextField: "name",
			dataValueField: "id",
			value : null,
			dataSource: [],
			select : function(){},
			//change : buildingChange,
			change : function(){},
			cascade : buildingChange
		},
		floor : {
			invisible : false,
			disabled : true,
			value : null,
			optionLabel : I18N.prop("SPACE_FLOOR"),
			dataTextField: "name",
			dataValueField: "id",
			dataSource: [],
			select : function(){},
			//change : floorChange,
			change : function(){},
			cascade : floorChange
		},
		zone : {
			invisible : false,
			disabled : true,
			value : null,
			optionLabel : I18N.prop("SPACE_ZONE"),
			dataTextField: "name",
			dataValueField: "id",
			dataSource: [],
			select : function(e){},
			//change : zoneChange,
			change : function(){},
			cascade : zoneChange
		},
		type : {
			invisible : false,
			disabled : true,
			value : null,
			optionLabel : I18N.prop("FACILITY_DEVICE_TYPE"),
			dataTextField: "displayType",
			dataValueField: "type",
			dataSource: [],
			select : function(){},
			//change : typeChange,
			change : function(){},
			cascade : typeChange
		},
		id : {
			invisible : false,
			disabled : true,
			value : null,
			optionLabel : I18N.prop("FACILITY_DEVICE_DEVICE_NAME"),
			dataTextField: "name",
			dataValueField: "id",
			dataSource: [],
			select : function(){},
			//change : idChange,
			change : function(){},
			cascade : idChange,
			dataBound : function(e){
				/*this.id.set("value", null);
				var parent = this.parent();
				parent = parent.parent();
				parent.status.options.set("dataSource", []);*/
				var parent = this.parent();
				parent = parent.parent();
				var root = parent.parent();
				root = root.parent();
				//Edit를 수행하여 업데이트 중이 아닐 때만 동작한다.
				if(!root.get("isUpdate")){
					parent.status.options.set("value", null);
					parent.valueList.set("invisible", true);
					parent.valueList.set("disabled", true);
					parent.valueTemperature.set("invisible", true);
					parent.valueTemperature.set("disabled", true);
					parent.valueInput.set("invisible", true);
					parent.valueInput.set("disabled", true);
				}
			}
		},
		showRemoveBtn : false
	};


	var ConditionViewModel = kendo.observable({
		init : function(){
			this.set("isUpdate", false);
			this.set("rules", []);
		},
		default : function(){
			this.init();
			this.addRule();
		},
		isUpdate : false,
		isValid : function(e){
			var rule, rules = this.rules;
			var i, max = rules.length;
			var isValid = false;
			//조건 마다 조건 값이 전부 선택되어야 다음 Step으로 넘어갈 수 있다.
			var j, size, devices, device;
			for( i = 0; i < max; i++ ){
				rule = rules[i];
				isValid = false;
				isValid = (!rule.calculation.get("disabled")
							&& !rule.calculation.get("invisible")
							&& rule.calculation.options.get("value") !== null
							&& typeof rule.calculation.options.get("value") !== 'undefined'
							&& rule.calculation.options.get("value") !== "");
				if(!isValid){
					return false;
				}

				isValid = (!rule.comparison.get("disabled")
							&& !rule.comparison.get("invisible")
							&& rule.comparison.options.get("value") !== null
							&& typeof rule.comparison.options.get("value") !== 'undefined'
							&& rule.comparison.options.get("value") !== "");
				if(!isValid){
					return false;
				}

				devices = rule.devices;
				if(!devices){
					return false;
				}
				size = devices.length;
				for( j = 0; j < size; j++ ){
					device = devices[j];
					isValid = (device.id.get("value") !== null
								&& typeof device.id.get("value") !== 'undefined'
								&& device.id.get("value") !== "");
					if(!isValid){
						return false;
					}
				}

				isValid = ((!rule.valueList.get("disabled")
							&& !rule.valueList.get("invisible")
							&& rule.valueList.get("value") !== null
							&& typeof rule.valueList.get("value") !== 'undefined'
							&& rule.valueList.get("value") !== "")
						   || (!rule.valueTemperature.get("disabled")
							&& !rule.valueTemperature.get("invisible")
							&& rule.valueTemperature.get("value") !== null
							&& typeof rule.valueTemperature.get("value") !== 'undefined'
							&& rule.valueTemperature.get("value") !== "")
						   || (!rule.valueInput.get("disabled")
							&& !rule.valueInput.get("invisible")
							&& rule.valueInput.get("value") !== null
							&& typeof rule.valueInput.get("value") !== 'undefined'
							&& rule.valueInput.get("value") !== ""));

				//입력 필드의 Key Up 이벤트 처리
				if(typeof e.keyUpValue !== 'undefined'){
					if(e.keyUpValue !== null && e.keyUpValue !== ""){
						isValid = true;
					}else{
						isValid = false;
					}
				}

				if(!isValid){
					return false;
				}

				//하나라도 False면 False

			}
			//전부 true
			return isValid;
		},
		rules : [],
		//click 이벤트는 selector Dom으로 바인딩 필요. 클릭 이벤트에서 아래 함수 호출
		addRule : function(onlyRule){
			var newItem = $.extend({}, ruleBlockListItem, true);
			this.rules.push(newItem);
			var index = this.rules.length - 1;
			if(!onlyRule){
				this.addDevice(index);
			}
			if(index > 0){
				this.rules[index].set("showRemoveBtn", true);
				this.rules[index - 1].set("showOperator", true);
			}

			var length = this.rules.length;
			if(length >= MAX_RULE_CONDITION_SIZE){
				this.rules[index].set("showAddBtn", false);
			}
		},
		//click 이벤트는 selector Dom으로 바인딩 필요. 클릭 이벤트에서 아래 함수 호출
		removeRule : function(index){
			var rules = this.rules;
			if(rules[index]){
				rules.splice(index, 1);
				if(index > 0){
					var length = rules.length;
					rules[length - 1].set("showOperator", false);
				}
			}
		},
		//Rule 편집 시, 데이터를 읽어 Set 한다.
		updateRule : function(rule, ruleDeviceDs){
			ConditionViewModel.addRule(true);
			var viewRules = ConditionViewModel.rules;
			var viewRuleIndex = viewRules.length - 1;
			var viewRule = viewRules[viewRuleIndex];
			var viewDevice, viewDeviceIndex;
			viewRule.calculation.isUpdate = true;
			viewRule.calculation.options.set("value", rule.calculation);
			// viewRule.calculation.isUpdate = false;
			var buildingId, floorId, zoneId, type, mappedType, name, id,
				locations, device, devices = rule.devices;
			var mainType;
			var i, max = devices.length;
			// var query; //[2018-04-12][변수 선언후 미사용]

			for( i = 0; i < max; i++ ){
				device = devices[i];
				id = device.dms_devices_id;
				type = device.dms_devices_type;
				mappedType = device.dms_devices_mappedType;

				device = ruleDeviceDs.get(id);
				name = device.name;
				ConditionViewModel.addDevice(viewRuleIndex);
				viewDeviceIndex = viewRule.devices.length - 1;
				viewDevice = viewRule.devices[viewDeviceIndex];

				if(!device){
					console.error("there is no device id is " + id);
					continue;
				}

				locations = device.locations;
				if(locations && locations[0]){
					locations = locations[0];
					buildingId = locations.foundation_space_buildings_id;
					floorId = locations.foundation_space_floors_id;
					zoneId = locations.foundation_space_zones_id;
					viewDevice.building.set("value", buildingId);
					viewDevice.floor.set("value", floorId);
					if(zoneId){
						viewDevice.zone.set("value", zoneId);
					}else{
						viewDevice.zone.set("value", "none");
					}
				}

				mainType = type;
				if(mappedType != "ControlPoint"){
					mainType = mappedType || type;
				}

				if(mainType.indexOf("AirConditioner.") != -1){
					viewDevice.type.set("value", "AirConditioner.*");
				}else if(mainType.indexOf("AirConditionerOutdoor") != -1){
					viewDevice.type.set("value", "AirConditionerOutdoor");
				}else if(mainType.indexOf("ControlPoint") != -1){
					viewDevice.type.set("value", "ControlPoint.*");
				}else if(mainType.indexOf("Meter") != -1){
					viewDevice.type.set("value", "Meter.*");
				}else if(mainType.indexOf("Light") != -1){
					viewDevice.type.set("value", "Light");
				}else if(mainType == "Sensor.Humidity"){
					viewDevice.type.set("value", "Sensor.Humidity");
					// [2018-04-12][현재 if문 아래 주석처리된 if문이 있었음 eslint떄문에 조치]
					/*else if(type.indexOf("Temperature_") != -1){
						viewDevice.type.set("value", "Sensor.Temperature_Humidity");
					}*/
				}else if(mainType == "Sensor.Temperature"){
					viewDevice.type.set("value", "Sensor.Temperature");
				}else if(mainType.indexOf("Motion") != -1){
					viewDevice.type.set("value", "Sensor.Motion");
				}

				viewDevice.id.set("type", type);
				viewDevice.id.set("mappedType", mappedType);
				viewDevice.id.set("value", id);
				viewDevice.id.set("name", name);
			}


			//DI/DO, AI/AO 의 value가 같으므로 이를 구분하여 Status 드롭다운 리스트에 표시하기 위하여 값을 임의로 추가한다.
			var monitor = rule.monitor;
			if(mainType.indexOf("ControlPoint") != -1){
				if(mainType.indexOf("DI") != -1 || mainType.indexOf("DO") != -1){
					monitor += "_DIDO";
				}else if(mainType.indexOf("AI") != -1 || mainType.indexOf("AO") != -1){
					monitor += "_AIAO";
				}
			}
			// console.log("edit rule monitor :" + monitor);

			viewRule.status.options.set("value", monitor);
			var operator = rule.operator;
			if(operator == "=="){
				operator = "=";
			}
			viewRule.comparison.options.set("value", operator);
			viewRule.duration.options.set("value", rule.duration);
			viewRule.valueList.set("value", rule.value);
			viewRule.valueTemperature.set("value", rule.value);
			viewRule.valueInput.set("value", rule.value);

			if(rule.logicOpr == "OR"){
				viewRule.set("isOr", true);
				viewRule.set("isAnd", false);
			}else if(rule.logicOpr == "AND"){
				viewRule.set("isAnd", true);
				viewRule.set("isOr", false);
			}
		},
		indexOf : function(rule){
			var rules = this.rules;
			var i, max = rules.length;
			for( i = 0; i < max; i++ ){
				if(rule === rules[i]){
					return i;
				}
			}
			return -1;
		},
		//click 이벤트는 selector Dom으로 바인딩 필요. 클릭 이벤트에서 아래 함수 호출
		addDevice : function(index){
			var newItem = $.extend({}, deviceBlockListItem, true);
			var rules = this.rules;

			var buildingList = MainWindow.getCurrentBuildingList();
			//현재 건물 리스트
			newItem.building.dataSource = buildingList;

			//설치된 기기 타입 리스트
			var deviceTypeList = Util.getInstalledTypeList();
			var displayType, type, deviceTypeDs = [];
			var i, max = deviceTypeList.length;

			//SRS에 명시된 제공 기기 타입은 3가지다.
			/*deviceTypeDs = [{
				displayType : "SAC Indoor",
				type : "AirConditioner.*"
			}, {
				displayType : "SAC Outdoor",
				type : "AirConditionerOutdoor"
			}, {
				displayType : "Point",
				type : "ControlPoint.*"
			}];*/

			//순서 적용
			max = typeOrdering.length;		//[2018-04-12][상위에 이미선언되있는 변수가 존재 i는 제거 max는 할당만하도록 수정]
			//console.log(typeOrdering);
			for( i = 0; i < max; i++ ){
				type = typeOrdering[i];
				//설치되지 않은 기기 타입은 표시하지 않는다.
				if(!Util.isInstalledType(type, true)){
					continue;
				}
				displayType = Util.getDetailDisplayTypeDeviceI18N(type, true);
				if(type.indexOf("Indoor") != -1){
					deviceTypeDs.push({
						displayType : displayType,
						type : "AirConditioner.*"
					});
				}else if(type.indexOf("Outdoor") != -1){
					deviceTypeDs.push({
						displayType : displayType,
						type : "AirConditionerOutdoor"
					});
				}else if(type.indexOf("Point") != -1){
					deviceTypeDs.push({
						displayType : displayType,
						type : "ControlPoint.*"
					});
				}else if(type.indexOf("Light") != -1){
					deviceTypeDs.push({
						displayType : displayType,
						type : "Light"
					});
				}else if(type == "Sensor.Humidity"){
					deviceTypeDs.push({
						displayType : displayType,
						type : "Sensor.Humidity"
					});
					// [2018-04-12][현재 if문 아래 주석처리된 if문이 있었음 eslint떄문에 조치]
					/*else if(type.indexOf("Temperature_") != -1){
						deviceTypeDs.push({
							displayType : displayType,
							type : "Sensor.Temperature_Humidity"
						});
					}*/
				}else if(type == "Sensor.Temperature"){
					deviceTypeDs.push({
						displayType : displayType,
						type : "Sensor.Temperature"
					});
				}else if(type.indexOf("Motion") != -1){
					deviceTypeDs.push({
						displayType : displayType,
						type : "Sensor.Motion"
					});
				}else if(type.indexOf("Meter") != -1){
					deviceTypeDs.push({
						displayType : displayType,
						type : "Meter.*"
					});
				}
			}


			newItem.type.dataSource = deviceTypeDs;

			var rule = rules[index];
			if(rule){
				rule.devices.push(newItem);
			}
			var deviceIndex = rule.devices.length - 1;
			console.info("device index : " + deviceIndex);
			var calculationValue = rule.calculation.options.get("value");

			if(calculationValue == "Average"){
				if(deviceIndex > 0){
					rule.devices[deviceIndex].set("showRemoveBtn", true);
				}
				if(rule.devices.length == 5){
					rule.set("showAddDeviceBtn", false);
				}else{
					rule.set("showAddDeviceBtn", true);
				}
			}
		},
		removeDevice : function(ruleIndex, deviceIndex){
			var rules = this.rules;
			if(rules[ruleIndex] && rules[ruleIndex].devices[deviceIndex]){
				rules[ruleIndex].devices.splice(deviceIndex, 1);
				if(rules[ruleIndex].devices.length == 5){
					rules[ruleIndex].set("showAddDeviceBtn", false);
				}else{
					rules[ruleIndex].set("showAddDeviceBtn", true);
				}
			}
		}
	});

	var INDOOR_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	var INDOOR_MIN = isFahrenheit ? 64 : 18;
	var INDOOR_MAX = isFahrenheit ? 86 : 30;

	var INDOOR_WATER_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	// var INDOOR_WATER_MIN = isFahrenheit ? 59 : 15;			[2018-04-12][변수선언 할당후 미사용]
	// var INDOOR_WATER_MAX = isFahrenheit ? 176 : 80;			[2018-04-12][변수선언 할당후 미사용]

	var DHW_DESIRED = isFahrenheit ? Util.getFahrenheit(40) : 40;
	var DHW_MIN = isFahrenheit ? Util.getFahrenheit(5) : 5;
	var DHW_MAX = isFahrenheit ? Util.getFahrenheit(85) : 85;

	var PRE_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	var PRE_MIN = isFahrenheit ? Util.getFahrenheit(18) : 18;
	var PRE_MAX = isFahrenheit ? Util.getFahrenheit(30) : 30;

	var OperationViewModel = kendo.observable({
		/*Date Time*/
		startDate : new Date(),
		endDate : new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
		startDateDisplay : moment(new Date()).format("L").replace(/\./g, "-"),
		// younghun
		endDateDisplay : moment(new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())).format("L").replace(/\./g, "-"),
		times : [],
		isEndless : false,
		isAllDay : true,
		isAllDayValue : false,
		daysOfWeekJoin : "",
		daysOfWeek : {
			mon : false,
			tue : false,
			wed : false,
			thu : false,
			fri : false,
			sat : false,
			sun : false
		},
		daysOfWeekDisabled : {
			mon : false,
			tue : false,
			wed : false,
			thu : false,
			fri : false,
			sat : false,
			sun : false
		},
		timesDisplay : "",
		/*Input Field Date Format 변경*/
		converDateFormat : function(date){
			var result = moment(date).format("L").replace(/\./g, "-");
			return result;
		},
		/*Url*/
		convertDateFormatForURL : function(date){
			var result = moment(date).format("YYYY-MM-DDTHH:mm:ss");
			return result;
		},
		dateTimeInit : function(){
			var sd = new Date();
			this.set("startDate", sd);
			var ed = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
			this.set("endDate", ed);

			sd = moment(sd).format("L").replace(/\./g, "-");
			this.set("startDateDisplay", sd);

			ed = moment(ed).format("L").replace(/\./g, "-");
			this.set("endDateDisplay", ed);
			this.set("timesDisplay", "");
			this.set("times", []);
			this.set("isEndless", false);
			this.set("isAllDay", true);
			this.set("isAllDayValue", false);
			this.daysOfWeek.set("mon", false);
			this.daysOfWeek.set("tue", false);
			this.daysOfWeek.set("wed", false);
			this.daysOfWeek.set("thu", false);
			this.daysOfWeek.set("fri", false);
			this.daysOfWeek.set("sat", false);
			this.daysOfWeek.set("sun", false);
		},
		dateTimeDefault : function(){
			this.init();
			this.daysOfWeek.set("mon", true);
			this.daysOfWeek.set("tue", true);
			this.daysOfWeek.set("wed", true);
			this.daysOfWeek.set("thu", true);
			this.daysOfWeek.set("fri", true);
			this.daysOfWeek.set("sat", true);
			this.daysOfWeek.set("sun", true);
		},
		clickAllDay : function(e){
			var isChecked = $(e.target).prop("checked");
			this.set("isAllDayValue", isChecked);
		},
		isTimePickerValid : function(e){
			var times = this.get("times");
			var i, max = times.length;
			var pickers = $(".datetime-pickers-list");
			if(max > 0){
				var tmpStartTime,tmpEndTime;
				var returnValue = [];
				var timepicker;
				var startOverStatus = false;

				for(i = 0; i < max; i++){
					tmpStartTime = Number(moment(times[i].startTime).format('YYMMDDHHmmss'));
					tmpEndTime = Number(moment(times[i].endTime).format('YYMMDDHHmmss'));
					if(tmpStartTime >= tmpEndTime){
						returnValue.push({startOver: times[i].startTime});
						startOverStatus = true;
					}
					for(var j = 0; j < max; j++){
						if(i != j){
							var circuitStartTime = Number(moment(times[j].startTime).format('YYMMDDHHmmss'));
							var circuitEndTime = Number(moment(times[j].endTime).format('YYMMDDHHmmss'));
							if((tmpStartTime >= circuitStartTime  && circuitEndTime >= tmpStartTime)  ){
								returnValue.push({DuplicateTime: {startTime: times[j].startTime, endTime: times[j].endTime}});
								returnValue.push({DuplicateTime: {startTime: times[i].startTime, endTime: times[i].endTime}});
							}
						}
					}
				}

				var lang = window.GlobalSettings.getLocale();
				var timepickerWidth = lang === "ko" ? 'width: 25.5vh' : 'width: 27.5vh';
				max = returnValue.length;
				pickers.find("input[data-role='commontimepicker']").each(function(){
					timepicker = $(this).data("kendoCommonTimePicker");
					timepicker.hideMessage();
					var cssEmel;
					for(i = 0; i < max; i++){
						if(typeof returnValue[i].startOver !== 'undefined'){
							if(timepicker.value() === returnValue[i].startOver){
								timepicker.showInvalidMesage(I18N.prop("FACILITY_RULE_CREATE_START_TIME_OVER"));
								cssEmel = timepicker.element.parent().parent().parent().find('.k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg.common-time-picker-invalid-msg')[0];
								cssEmel.setAttribute('style',timepickerWidth);
								return returnValue;
							}
						}

						if(!startOverStatus && typeof returnValue[i].DuplicateTime !== 'undefined'){
							if(returnValue[i].DuplicateTime.startTime === timepicker.value() || returnValue[i].DuplicateTime.endTime === timepicker.value()){
								timepicker.showInvalidMesage(I18N.prop("FACILITY_RULE_CREATE_EXISTING_START_END_TIME_OVER"));
								cssEmel = timepicker.element.parent().parent().parent().find('.k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg.common-time-picker-invalid-msg')[0];
								cssEmel.setAttribute('style',timepickerWidth);
							}
						}
					}
				});
				return returnValue;
			}
		},
		isDateTimeValid : function(e){
			var i, day, max;		//[2018-04-12][상단에 선언]
			if(e.field && (e.field == "startDate" || e.field == "endDate")){
				var sd = this.get("startDate");
				var ed = this.get("endDate");
				var mSd = moment(sd);
				var mEd = moment(ed);

				if(mEd.isBefore(mSd)){
					this.set("endDate", sd);
					ed = sd;
					mEd = mSd;
				}

				var isEdit = MainViewModel.get('isEdit');
				if(!isEdit){
					var nowDate = new Date();
					var mNowDate = moment(nowDate);
					if(mSd.isBefore(mNowDate)){
						this.set("startDate", new Date(mNowDate.add(1, 'seconds')));
						sd = nowDate;
						mSd = mNowDate;
					}
				}

				var weekDiff = mEd.diff(mSd, 'week');
				// var ed, sd, dayDiff;	//[2018-04-12][ed sd 중복선언과 동시에 선언후 미사용 dayDiff 선언후 미사용 주석처리]

				var isEndless = this.get("isEndless");

				if(!isEndless && weekDiff == 0){
					var m = moment(mSd);
					max = m.day() + 7;
					for( i = m.day(); i < max; i++ ){
						day = moment(m).day(i);

						if(day.isBetween(mSd, mEd, 'day', '[]')){
							this.disableDaysOfWeek(i, false);
						}else{
							//disable day checkbox
							this.disableDaysOfWeek(i, true);
						}
					}
				}else if(isEndless){
					max = 7;
					for( i = 0; i < max; i++ ){
						this.disableDaysOfWeek(i, false);
					}
				}
			}

			var times = this.get("times");
			max = times.length;
			var displayTxt = "";
			// var startTime, endTime;		[2018-04-12][변수 선언후 미사용 주석처리]
			//시작 시간 / 종료 시간 요약 텍스트
			if(times[0]){
				displayTxt += moment(times[0].startTime).format("HH:mm");
				displayTxt += "~";
				displayTxt += moment(times[0].endTime).format("HH:mm");
			}

			if((max - 1) > 0){
				displayTxt += " (+" + (max - 1) + ")";
			}
			if(displayTxt){
				this.set("timesDisplay", displayTxt);
			}

			var pickers = $(".datetime-pickers-list");

			//All Day 일 경우 데이트 피커 비활성화
			var isAllDay = this.get("isAllDay");
			pickers.find("input[data-role='commontimepicker']").each(function(){
				var timepicker = $(this).data("kendoCommonTimePicker");
				timepicker.enable(!isAllDay);
			});
			if(isAllDay){
				if (times.length > 0) {
					var startTime = new Date(moment().startOf('day'));
					var endTime = new Date(moment().endOf('day'));
					var resetExecutionTimeList = times[0];
					if (MainViewModel.editLoadReady && ((!moment(startTime).isSame(moment(resetExecutionTimeList.startTime), 'time') &&
						!moment(endTime).isSame(moment(resetExecutionTimeList.endTime), 'time')) ||
						times.length >= 2)) {
						resetExecutionTimeList.startTime = startTime;
						resetExecutionTimeList.endTime = endTime;
						OperationViewModel.set("times", [resetExecutionTimeList]);
					}
				}
				if (!pickers.find(".datetime-timepickers .bt.minus").hasClass('disabled')) pickers.find(".datetime-timepickers .bt.minus").addClass("disabled");
			}else{
				pickers.find(".datetime-timepickers .bt.minus").removeClass("disabled");
			}

			//맨 처음 시작 시간이 1개일 경우 시간 삭제 버튼 비활성화
			if(times.length == 1){
				pickers.find(".datetime-timepickers .bt.minus").addClass("disabled");
			}else if(!isAllDay){
				pickers.find(".datetime-timepickers .bt.minus").removeClass("disabled");
			}

			//this.timesDisplay
			var daysOfWeek = this.get("daysOfWeek");
			var rpArr = [];
			var val = daysOfWeek.mon ? "Mon" : "";
			if(val){
				rpArr.push(val);
			}
			val = daysOfWeek.tue ? "Tue" : "";
			if(val){
				rpArr.push(val);
			}
			val = daysOfWeek.wed ? "Wed" : "";
			if(val){
				rpArr.push(val);
			}
			val = daysOfWeek.thu ? "Thu" : "";
			if(val){
				rpArr.push(val);
			}
			val = daysOfWeek.fri ? "Fri" : "";
			if(val){
				rpArr.push(val);
			}
			val = daysOfWeek.sat ? "Sat" : "";
			if(val){
				rpArr.push(val);
			}
			val = daysOfWeek.sun ? "Sun" : "";
			if(val){
				rpArr.push(val);
			}

			max = rpArr.length;		//[2018-04-12][i제거 max 할당]
			for( i = 0; i < max; i++ ){
				rpArr[i] = I18N.prop("FACILITY_SCHEDULE_" + rpArr[i].toUpperCase());
			}

			this.set("daysOfWeekJoin", rpArr.join(", "));

			var isValid = false;
			isValid = this.daysOfWeek.get("mon") || this.daysOfWeek.get("tue")
				|| this.daysOfWeek.get("wed") || this.daysOfWeek.get("thu")
				|| this.daysOfWeek.get("fri") || this.daysOfWeek.get("sat") || this.daysOfWeek.get("sun");
			return isValid;
		},
		daysOfWeeksArr : ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
		disableDaysOfWeek : function(day, isDisabled){
			if(day > 6){
				day = day % 7;
			}
			var key = this.daysOfWeeksArr[day];
			this.daysOfWeekDisabled.set(key, isDisabled);
			if(isDisabled && this.daysOfWeek.get(key)){
				this.daysOfWeek.set(key, false);
			}else if(!isDisabled && !this.daysOfWeek.get(key)){
				this.daysOfWeek.set(key, true);
			}
		},
		/*Rule Alarm & Log*/
		isAlarmLog : false,
		alarmRadioChecked : "Warning",
		/*Control Panel Operation*/
		operation : {
			indoor : {
				init : function(){
					var indoor = this;
					indoor.power.set("disabled", false);
					indoor.power.set("checked", false);
					indoor.power.set("active", false);
					indoor.operation.set("checked", false);
					var mode, modes = indoor.operation.mode;
					var i, max = modes.length;
					for( i = 0; i < max; i++ ){
						mode = modes[i];
						mode.set("active", false);
					}
					indoor.temperature.set("checked", false);
					indoor.temperature.set("desired", INDOOR_DESIRED);
					indoor.temperature.set("unit", unit);
					indoor.temperature.set("step", step);
					indoor.waterTemp.set("checked", false);
					indoor.waterTemp.set("desired", INDOOR_WATER_DESIRED);
					indoor.waterTemp.set("unit", unit);
					indoor.waterTemp.set("step", step);

					//이전 선택 값 초기화
					var key;
					var beforeValue = indoor.power.beforeValue;
					for( key in beforeValue ){
						beforeValue[key] = null;
					}
				},
				setDisabled : function(){
					var indoor = this;
					indoor.init();
					indoor.power.set("disabled", true);
				},
				power : {
					disabled : false,
					checked : false,
					active : false,
					text: function(){
						return OperationPowerText.call(this);
					},
					click : function(){
						var indoor = this.operation.indoor;
						var isActive = indoor.power.get("active");
						indoor.power.set("active", !isActive);
					},
					beforeValue : {
						powerActive : null,
						operationChecked : null,
						auto : null,
						cool : null,
						heat : null,
						dry : null,
						fan : null,
						coolSt : null,
						hotWater : null,
						waterChecked : null,
						temperChecked : null
					},
					checkClick : function(e){
						var indoor = this.operation.indoor;
						var beforeValue = indoor.power.beforeValue;
						var target = $(e.target);
						var checked = target.prop("checked");
						if(checked){
							if(beforeValue.powerActive !== null){
								indoor.power.set("active", beforeValue.powerActive);
								beforeValue.powerActive = null;
							}else{      //선택했던 값이 없으면 Default
								indoor.power.set("active", true);
							}

							if(beforeValue.operationChecked !== null){
								indoor.operation.set("checked", beforeValue.operationChecked);
								beforeValue.operationChecked = null;
							}else{      //선택했던 값이 없으면 Default
								indoor.operation.set("checked", true);
							}

							var hasMode = false;
							if(beforeValue.auto !== null){
								indoor.operation.mode[0].set("active", beforeValue.auto);
								hasMode = true;
								beforeValue.auto = null;
							}
							if(beforeValue.cool !== null){
								indoor.operation.mode[1].set("active", beforeValue.cool);
								hasMode = true;
								beforeValue.cool = null;
							}
							if(beforeValue.heat !== null){
								indoor.operation.mode[2].set("active", beforeValue.heat);
								hasMode = true;
								beforeValue.heat = null;
							}
							if(beforeValue.dry !== null){
								indoor.operation.mode[3].set("active", beforeValue.dry);
								hasMode = true;
								beforeValue.dry = null;
							}
							if(beforeValue.fan !== null){
								indoor.operation.mode[4].set("active", beforeValue.fan);
								hasMode = true;
								beforeValue.fan = null;
							}
							if(beforeValue.coolSt !== null){
								indoor.operation.mode[5].set("active", beforeValue.coolSt);
								hasMode = true;
								beforeValue.coolSt = null;
							}
							if(beforeValue.hotWater !== null){
								indoor.operation.mode[6].set("active", beforeValue.hotWater);
								hasMode = true;
								beforeValue.hotWater = null;
							}

							if(!hasMode){
								indoor.operation.mode[0].set("active", true);
							}

							if(beforeValue.temperChecked !== null){
								indoor.temperature.set("checked", beforeValue.temperChecked);
								beforeValue.temperChecked = null;
							}else{      //선택했던 값이 없으면 Default
								indoor.temperature.set("checked", true);
							}
							if(beforeValue.waterChecked !== null){
								indoor.waterTemp.set("checked", beforeValue.waterChecked);
								beforeValue.waterChecked = null;
							}else{      //선택했던 값이 없으면 Default
								indoor.waterTemp.set("checked", true);
							}
						}else{
							beforeValue.powerActive = indoor.power.get("active");
							if(indoor.power.get("active")){
								indoor.power.set("active", false);
							}
							beforeValue.operationChecked = indoor.operation.get("checked");
							beforeValue.auto = indoor.operation.mode[0].get("active");
							beforeValue.cool = indoor.operation.mode[1].get("active");
							beforeValue.heat = indoor.operation.mode[2].get("active");
							beforeValue.dry = indoor.operation.mode[3].get("active");
							beforeValue.fan = indoor.operation.mode[4].get("active");
							beforeValue.coolSt = indoor.operation.mode[5].get("active");
							beforeValue.hotWater = indoor.operation.mode[6].get("active");
							if(indoor.operation.get("checked")){
								indoor.operation.set("checked", false);
								indoor.operation.mode[0].set("active", false);
								indoor.operation.mode[1].set("active", false);
								indoor.operation.mode[2].set("active", false);
								indoor.operation.mode[4].set("active", false);
								indoor.operation.mode[5].set("active", false);
								indoor.operation.mode[6].set("active", false);
							}

							beforeValue.temperChecked = indoor.temperature.get("checked");
							if(indoor.temperature.get("checked")){
								indoor.temperature.set("checked", false);
							}
							beforeValue.waterChecked = indoor.waterTemp.get("checked");
							if(indoor.waterTemp.get("checked")){
								indoor.waterTemp.set("checked", false);
							}
						}
					}
				},
				operation : {
					checked : false,
					active : false,
					checkClick : function(e){
						var target = $(e.target);
						var checked = target.prop("checked");
						var indoor = this.operation.indoor;
						var beforeValue = indoor.power.beforeValue;
						var mode = indoor.operation.mode;
						if(checked){
							if(beforeValue.auto !== null){
								indoor.operation.mode[0].set("active", beforeValue.auto);
								beforeValue.auto = null;
							}
							if(beforeValue.cool !== null){
								indoor.operation.mode[1].set("active", beforeValue.cool);
								beforeValue.cool = null;
							}
							if(beforeValue.heat !== null){
								indoor.operation.mode[2].set("active", beforeValue.heat);
								beforeValue.heat = null;
							}
							if(beforeValue.dry !== null){
								indoor.operation.mode[3].set("active", beforeValue.dry);
								beforeValue.dry = null;
							}
							if(beforeValue.fan !== null){
								indoor.operation.mode[4].set("active", beforeValue.fan);
								beforeValue.fan = null;
							}
							if(beforeValue.coolSt !== null){
								indoor.operation.mode[5].set("active", beforeValue.coolSt);
								beforeValue.coolSt = null;
							}
							if(beforeValue.hotWater !== null){
								indoor.operation.mode[6].set("active", beforeValue.hotWater);
								beforeValue.hotWater = null;
							}
						}else{
							beforeValue.auto = mode[0].get("active");
							beforeValue.cool = mode[1].get("active");
							beforeValue.heat = mode[2].get("active");
							beforeValue.dry = mode[3].get("active");
							beforeValue.fan = mode[4].get("active");
							beforeValue.coolSt = mode[5].get("active");
							beforeValue.hotWater = mode[6].get("active");
							if(mode[0].get("active")){
								mode[0].set("active", false);
							}
							if(mode[1].get("active")){
								mode[1].set("active", false);
							}
							if(mode[2].get("active")){
								mode[2].set("active", false);
							}
							if(mode[3].get("active")){
								mode[3].set("active", false);
							}
							if(mode[4].get("active")){
								mode[4].set("active", false);
							}
							if(mode[5].get("active")){
								mode[5].set("active", false);
							}
							if(mode[6].get("active")){
								mode[6].set("active", false);
							}
							if(indoor.temperature.get("checked")){
								indoor.temperature.set("checked", false);
							}
							if(indoor.waterTemp.get("checked")){
								indoor.waterTemp.set("checked", false);
							}
						}
					},
					mode : [
						{
							active : false,
							name : "Auto",
							click : function(){
								var indoor = this.operation.indoor;
								var oper = indoor.operation;
								var mode = oper.mode;
								var isActive = mode[0].get("active");
								mode[0].set("active", !isActive);
								mode[1].set("active", false);
								mode[2].set("active", false);
								mode[3].set("active", false);
								mode[4].set("active", false);
								mode[5].set("active", false);
								mode[6].set("active", false);
								indoor.checkTempActive(isActive);
								if(!isActive){
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 59 : 15;
									max = isFahrenheit ? 176 : 80;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							}
						},
						{
							active : false,
							name : "Cool",
							click : function(){
								var indoor = this.operation.indoor;
								var oper = indoor.operation;
								var mode = oper.mode;
								var isActive = mode[1].get("active");
								mode[1].set("active", !isActive);
								mode[0].set("active", false);
								mode[2].set("active", false);
								mode[3].set("active", false);
								mode[4].set("active", false);
								mode[5].set("active", false);
								mode[6].set("active", false);
								indoor.checkTempActive(isActive);
								if(!isActive){
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 14 : -10;
									max = isFahrenheit ? 77 : 25;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							}
						},
						{
							active : false,
							name : "Heat",
							click : function(){
								var indoor = this.operation.indoor;
								var oper = indoor.operation;
								var mode = oper.mode;
								var isActive = mode[2].get("active");
								mode[2].set("active", !isActive);
								mode[0].set("active", false);
								mode[1].set("active", false);
								mode[3].set("active", false);
								mode[4].set("active", false);
								mode[5].set("active", false);
								mode[6].set("active", false);
								indoor.checkTempActive(isActive);
								if(!isActive){
									var min = isFahrenheit ? 61 : 16;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 59 : 15;
									max = isFahrenheit ? 176 : 80;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							}
						},
						{
							active : false,
							name : "Dry",
							click : function(){
								var indoor = this.operation.indoor;
								var oper = indoor.operation;
								var mode = oper.mode;
								var isActive = mode[3].get("active");
								mode[3].set("active", !isActive);
								mode[0].set("active", false);
								mode[1].set("active", false);
								mode[2].set("active", false);
								mode[4].set("active", false);
								mode[5].set("active", false);
								mode[6].set("active", false);
								indoor.checkTempActive(isActive);
								if(!isActive){
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 59 : 15;
									max = isFahrenheit ? 176 : 80;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							}
						},
						{
							active : false,
							name : "Fan",
							click : function(){
								var indoor = this.operation.indoor;
								var oper = indoor.operation;
								var mode = oper.mode;
								var isActive = mode[4].get("active");
								mode[4].set("active", !isActive);
								mode[0].set("active", false);
								mode[1].set("active", false);
								mode[2].set("active", false);
								mode[3].set("active", false);
								mode[5].set("active", false);
								mode[6].set("active", false);
								indoor.checkTempActive(!isActive);
							}
						},
						{
							active : false,
							name : "CoolStorage",
							click : function(){
								var indoor = this.operation.indoor;
								var oper = this.operation.indoor.operation;
								var mode = oper.mode;
								var isActive = mode[5].get("active");
								mode[5].set("active", !isActive);
								mode[0].set("active", false);
								mode[2].set("active", false);
								mode[1].set("active", false);
								mode[3].set("active", false);
								mode[4].set("active", false);
								mode[6].set("active", false);
								indoor.checkTempActive(isActive);
								if(!isActive){
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 14 : -10;
									max = isFahrenheit ? 77 : 25;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							}
						},
						{
							active : false,
							name : "HeatStorage",
							click : function(){
								var indoor = this.operation.indoor;
								var oper = indoor.operation;
								var mode = oper.mode;
								var isActive = mode[6].get("active");
								mode[6].set("active", !isActive);
								mode[0].set("active", false);
								mode[1].set("active", false);
								mode[2].set("active", false);
								mode[3].set("active", false);
								mode[4].set("active", false);
								mode[5].set("active", false);
								indoor.checkTempActive(isActive);
								if(!isActive){
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 59 : 15;
									max = isFahrenheit ? 176 : 80;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							}
						}

					]
				},
				checkTempActive : function(isActive){
					var indoor = this;
					if(isActive){
						if(indoor.temperature.get("checked")){
							indoor.temperature.set("checked", false);
						}
						if(indoor.waterTemp.get("checked")){
							indoor.waterTemp.set("checked", false);
						}
					}
				},
				temperature : {
					checked : false,
					desired : INDOOR_DESIRED,
					min : INDOOR_MIN,   //Device Temperatures 정보에서 계산
					max : INDOOR_MAX,
					unit : unit,
					step : step
				},
				waterTemp : {
					checked : false,
					desired : INDOOR_DESIRED,
					min : INDOOR_MIN,   //Device Temperatures 정보에서 계산
					max : INDOOR_MAX,
					unit : unit,
					step : step
				}
			},
			ventilator : {
				init : function(){
					var ventilator = this;
					ventilator.power.set("disabled", false);
					ventilator.power.set("checked", false);
					ventilator.power.set("active", false);
					ventilator.operation.set("checked", false);
					ventilator.operation.mode[0].set("active", false);
					ventilator.operation.mode[1].set("active", false);
					ventilator.operation.mode[2].set("active", false);
					ventilator.operation.mode[3].set("active", false);
					//이전 선택 값 초기화
					var key;
					var beforeValue = ventilator.power.beforeValue;
					for( key in beforeValue ){
						beforeValue[key] = null;
					}
				},
				setDisabled : function(){
					var ventilator = this;
					ventilator.init();
					ventilator.power.set("disabled", true);
				},
				power : {
					disabled : false,
					checked : false,
					active : false,
					text: function(){
						return OperationPowerText.call(this);
					},
					click : function(){
						var isActive = this.operation.ventilator.power.get("active");
						this.operation.ventilator.power.set("active", !isActive);
					},
					beforeValue : {
						powerActive : null,
						operationChecked : null,
						auto : null,
						heatex : null,
						bypass : null,
						sleep : null
					},
					checkClick : function(e){
						var ventilator = this.operation.ventilator;
						var beforeValue = ventilator.power.beforeValue;
						var target = $(e.target);
						var checked = target.prop("checked");
						if(checked){
							if(beforeValue.powerActive !== null){
								ventilator.power.set("active", beforeValue.powerActive);
								beforeValue.powerActive = null;
							}else{      //선택했던 값이 없으면 Default
								ventilator.power.set("active", true);
							}
							if(beforeValue.operationChecked !== null){
								ventilator.operation.set("checked", beforeValue.operationChecked);
								beforeValue.operationChecked = null;
							}else{      //선택했던 값이 없으면 Default
								ventilator.operation.set("checked", true);
							}

							var hasMode = false;

							if(beforeValue.auto !== null){
								ventilator.operation.mode[0].set("active", beforeValue.auto);
								hasMode = true;
								beforeValue.auto = null;
							}
							if(beforeValue.heatex !== null){
								ventilator.operation.mode[1].set("active", beforeValue.heatex);
								hasMode = true;
								beforeValue.heatex = null;
							}
							if(beforeValue.bypass !== null){
								ventilator.operation.mode[2].set("active", beforeValue.bypass);
								hasMode = true;
								beforeValue.bypass = null;
							}
							if(beforeValue.sleep !== null){
								ventilator.operation.mode[3].set("active", beforeValue.sleep);
								hasMode = true;
								beforeValue.sleep = null;
							}
							//선택했던 값이 없으면 Default
							if(!hasMode){
								ventilator.operation.mode[0].set("active", true);
							}

						}else{
							beforeValue.powerActive = ventilator.power.get("active");
							if(ventilator.power.get("active")){
								ventilator.power.set("active", false);
							}
							beforeValue.operationChecked = ventilator.operation.get("checked");
							beforeValue.auto = ventilator.operation.mode[0].get("active");
							beforeValue.heatex = ventilator.operation.mode[1].get("active");
							beforeValue.bypass = ventilator.operation.mode[2].get("active");
							beforeValue.sleep = ventilator.operation.mode[3].get("active");
							if(ventilator.operation.get("checked")){
								ventilator.operation.set("checked", false);
								ventilator.operation.mode[0].set("active", false);
								ventilator.operation.mode[1].set("active", false);
								ventilator.operation.mode[2].set("active", false);
								ventilator.operation.mode[3].set("active", false);
							}
						}
					}
				},
				operation : {
					active : false,
					checked : false,
					checkClick : function(e){
						var target = $(e.target);
						var checked = target.prop("checked");
						var ventilator = this.operation.ventilator;
						var beforeValue = ventilator.power.beforeValue;
						if(checked){
							if(beforeValue.auto !== null){
								ventilator.operation.mode[0].set("active", beforeValue.auto);
								beforeValue.auto = null;
							}
							if(beforeValue.heatex !== null){
								ventilator.operation.mode[1].set("active", beforeValue.heatex);
								beforeValue.heatex = null;
							}
							if(beforeValue.bypass !== null){
								ventilator.operation.mode[2].set("active", beforeValue.bypass);
								beforeValue.bypass = null;
							}
							if(beforeValue.sleep !== null){
								ventilator.operation.mode[3].set("active", beforeValue.sleep);
								beforeValue.sleep = null;
							}
						}else{
							var mode = ventilator.operation.mode;
							beforeValue.auto = mode[0].get("active");
							beforeValue.heatex = mode[1].get("active");
							beforeValue.bypass = mode[2].get("active");
							beforeValue.sleep = mode[3].get("active");
							if(mode[0].get("active")){
								mode[0].set("active", false);
							}
							if(mode[1].get("active")){
								mode[1].set("active", false);
							}
							if(mode[2].get("active")){
								mode[2].set("active", false);
							}
							if(mode[3].get("active")){
								mode[3].set("active", false);
							}
						}
					},
					mode : [
						{
							active : false,
							name : "Auto",
							click : function(){
								var mode = this.operation.ventilator.operation.mode;
								var isActive = mode[0].get("active");
								mode[0].set("active", !isActive);
								mode[1].set("active", false);
								mode[2].set("active", false);
								mode[3].set("active", false);
							}
						},
						{
							active : false,
							name : "HeatEx",
							click : function(){
								var mode = this.operation.ventilator.operation.mode;
								var isActive = mode[1].get("active");
								mode[1].set("active", !isActive);
								mode[0].set("active", false);
								mode[2].set("active", false);
								mode[3].set("active", false);
							}
						},
						{
							active : false,
							name : "Bypass",
							click : function(){
								var mode = this.operation.ventilator.operation.mode;
								var isActive = mode[2].get("active");
								mode[2].set("active", !isActive);
								mode[0].set("active", false);
								mode[1].set("active", false);
								mode[3].set("active", false);
							}
						},
						{
							active : false,
							name : "Sleep",
							click : function(){
								var mode = this.operation.ventilator.operation.mode;
								var isActive = mode[3].get("active");
								mode[3].set("active", !isActive);
								mode[0].set("active", false);
								mode[1].set("active", false);
								mode[2].set("active", false);
							}
						}
					]
				}
			},
			dhw : {
				init : function(){
					var dhw = this;
					dhw.power.set("disabled", false);
					dhw.power.set("checked", false);
					dhw.power.set("active", false);
					dhw.operation.set("checked", false);
					dhw.operation.mode[0].set("active", false);
					dhw.operation.mode[1].set("active", false);
					dhw.operation.mode[2].set("active", false);
					dhw.operation.mode[3].set("active", false);
					dhw.temperature.set("checked", false);
					dhw.temperature.set("desired", DHW_DESIRED);
					dhw.temperature.set("unit", unit);
					dhw.temperature.set("step", step);
					//이전 선택 값 초기화
					var key;
					var beforeValue = dhw.power.beforeValue;
					for( key in beforeValue ){
						beforeValue[key] = null;
					}
				},
				setDisabled : function(){
					var dhw = this;
					dhw.init();
					dhw.power.set("disabled", true);
				},
				power : {
					disabled : false,
					checked : false,
					active : false,
					text: function(){
						return OperationPowerText.call(this);
					},
					click : function(){
						var isActive = this.operation.dhw.power.get("active");
						this.operation.dhw.power.set("active", !isActive);
					},
					beforeValue : {
						powerActive : null,
						operationChecked : null,
						eco : null,
						standard : null,
						power : null,
						force : null,
						temperChecked : null
					},
					checkClick : function(e){
						var dhw = this.operation.dhw;
						var beforeValue = dhw.power.beforeValue;
						var target = $(e.target);
						var checked = target.prop("checked");
						if(checked){
							if(beforeValue.powerActive !== null){
								dhw.power.set("active", beforeValue.powerActive);
								beforeValue.powerActive = null;
							}else{      //선택했던 값이 없으면 Default
								dhw.power.set("active", true);
							}
							if(beforeValue.operationChecked !== null){
								dhw.operation.set("checked", beforeValue.operationChecked);
								beforeValue.operationChecked = null;
							}else{      //선택했던 값이 없으면 Default
								dhw.operation.set("checked", true);
							}

							var hasMode = false;
							if(beforeValue.eco !== null){
								dhw.operation.mode[0].set("active", beforeValue.eco);
								hasMode = true;
								beforeValue.eco = null;
							}
							if(beforeValue.standard !== null){
								dhw.operation.mode[1].set("active", beforeValue.standard);
								hasMode = true;
								beforeValue.standard = null;
							}
							if(beforeValue.power !== null){
								dhw.operation.mode[2].set("active", beforeValue.power);
								hasMode = true;
								beforeValue.power = null;
							}
							if(beforeValue.force !== null){
								dhw.operation.mode[3].set("active", beforeValue.force);
								hasMode = true;
								beforeValue.force = null;
							}

							if(!hasMode){
								dhw.operation.mode[1].set("active", true);
							}

							if(beforeValue.temperChecked !== null){
								dhw.temperature.set("checked", beforeValue.temperChecked);
								beforeValue.temperChecked = null;
							}else{      //선택했던 값이 없으면 Default
								dhw.temperature.set("checked", true);
							}
						}else{
							beforeValue.powerActive = dhw.power.get("active");
							if(dhw.power.get("active")){
								dhw.power.set("active", false);
							}
							beforeValue.operationChecked = dhw.operation.get("checked");
							beforeValue.eco = dhw.operation.mode[0].get("active");
							beforeValue.standard = dhw.operation.mode[1].get("active");
							beforeValue.power = dhw.operation.mode[2].get("active");
							beforeValue.force = dhw.operation.mode[3].get("active");
							if(dhw.operation.get("checked")){
								dhw.operation.set("checked", false);
								dhw.operation.mode[0].set("active", false);
								dhw.operation.mode[1].set("active", false);
								dhw.operation.mode[2].set("active", false);
								dhw.operation.mode[3].set("active", false);
							}
							beforeValue.temperChecked = dhw.temperature.get("checked");
							if(dhw.temperature.get("checked")){
								dhw.temperature.set("checked", false);
							}
						}
					}
				},
				operation : {
					active : false,
					checked : false,
					checkClick : function(e){
						var target = $(e.target);
						var checked = target.prop("checked");

						var dhw = this.operation.dhw;
						var beforeValue = dhw.power.beforeValue;
						if(checked){
							if(beforeValue.eco !== null){
								dhw.operation.mode[0].set("active", beforeValue.eco);
								beforeValue.eco = null;
							}
							if(beforeValue.standard !== null){
								dhw.operation.mode[1].set("active", beforeValue.standard);
								beforeValue.standard = null;
							}
							if(beforeValue.power !== null){
								dhw.operation.mode[2].set("active", beforeValue.power);
								beforeValue.power = null;
							}
							if(beforeValue.force !== null){
								dhw.operation.mode[3].set("active", beforeValue.force);
								beforeValue.force = null;
							}
						}else{
							var mode = dhw.operation.mode;
							beforeValue.operationChecked = dhw.operation.get("checked");
							beforeValue.eco = dhw.operation.mode[0].get("active");
							beforeValue.standard = dhw.operation.mode[1].get("active");
							beforeValue.power = dhw.operation.mode[2].get("active");
							beforeValue.force = dhw.operation.mode[3].get("active");
							if(mode[0].get("active")){
								mode[0].set("active", false);
							}
							if(mode[1].get("active")){
								mode[1].set("active", false);
							}
							if(mode[2].get("active")){
								mode[2].set("active", false);
							}
							if(mode[3].get("active")){
								mode[3].set("active", false);
							}
							if(dhw.temperature.get("checked")){
								dhw.temperature.set("checked", false);
							}
						}
					},
					mode : [
						{
							active : false,
							name : "Eco",
							click : function(){
								var dhw = this.operation.dhw;
								var mode = dhw.operation.mode;
								var isActive = mode[0].get("active");
								mode[0].set("active", !isActive);
								mode[1].set("active", false);
								mode[2].set("active", false);
								mode[3].set("active", false);
								dhw.checkTempActive(isActive);
							}
						},
						{
							active : false,
							name : "Standard",
							click : function(){
								var dhw = this.operation.dhw;
								var mode = dhw.operation.mode;
								var isActive = mode[1].get("active");
								mode[1].set("active", !isActive);
								mode[0].set("active", false);
								mode[2].set("active", false);
								mode[3].set("active", false);
								dhw.checkTempActive(isActive);
							}
						},
						{
							active : false,
							name : "Power",
							click : function(){
								var dhw = this.operation.dhw;
								var mode = dhw.operation.mode;
								var isActive = mode[2].get("active");
								mode[2].set("active", !isActive);
								mode[0].set("active", false);
								mode[1].set("active", false);
								mode[3].set("active", false);
								dhw.checkTempActive(isActive);
							}
						},
						{
							active : false,
							name : "Force",
							click : function(){
								var dhw = this.operation.dhw;
								var mode = dhw.operation.mode;
								var isActive = mode[3].get("active");
								mode[3].set("active", !isActive);
								mode[0].set("active", false);
								mode[1].set("active", false);
								mode[2].set("active", false);
								dhw.checkTempActive(isActive);
							}
						}
					]
				},
				checkTempActive : function(isActive){
					var dhw = this;
					if(isActive){
						if(dhw.temperature.get("checked")){
							dhw.temperature.set("checked", false);
						}
					}
				},
				temperature : {
					checked : false,
					desired : DHW_DESIRED,
					min : DHW_MIN,   //Device Temperatures 정보에서 계산
					max : DHW_MAX,
					unit : unit,
					step : step
				}
			},
			remoteControl : {
				disabled : false,
				checked : false,
				init : function(){
					var remoteControl = this;
					remoteControl.set("disabled", false);
					remoteControl.set("checked", false);
					remoteControl.control[0].set("active", false);
					remoteControl.control[1].set("active", false);
					remoteControl.control[2].set("active", false);
				},
				setDisabled : function(){
					var remoteControl = this;
					remoteControl.init();
					remoteControl.set("disabled", true);
				},
				checkClick : function(){
					var control = this.operation.remoteControl.control;
					var remoteControl = this.operation.remoteControl;
					var remoteControlChecked = remoteControl.get('checked');

					//[2018-08-31][리모컨제어 체크박스 클릭시 리모컨 허용 기본값으로 설정]
					control[0].set("active", !remoteControlChecked);

					// if(control[0].get("active")){
					// 	control[0].set("active", false);
					// }
					if(control[1].get("active")){
						control[1].set("active", false);
					}
					if(control[2].get("active")){
						control[2].set("active", false);
					}
				},
				control : [
					{
						active : false,
						name : "Allowed",
						click : function(){
							var control = this.operation.remoteControl.control;
							var isActive = control[0].get("active");
							control[0].set("active", !isActive);
							control[1].set("active", false);
							control[2].set("active", false);
						}
					},
					{
						active : false,
						name : "NotAllowed",
						click : function(){
							var control = this.operation.remoteControl.control;
							var isActive = control[1].get("active");
							control[1].set("active", !isActive);
							control[0].set("active", false);
							control[2].set("active", false);
						}
					},
					{
						active : false,
						name : "ConditionallyAllowed",
						click : function(){
							var control = this.operation.remoteControl.control;
							var isActive = control[2].get("active");
							control[2].set("active", !isActive);
							control[1].set("active", false);
							control[0].set("active", false);
						}
					}
				]
			},
			point : {
				aoav : {
					disable : false,
					checked : false,
					value : "0.0",
					min : 0,
					max : 100,
					decimals : 1,
					init : function(){
						var aoav = this;
						aoav.set("disabled", false);
						aoav.set("checked", false);
						aoav.set("value", "0.0");
					},
					setDisabled : function(){
						var aoav = this;
						aoav.init();
						aoav.set("disabled", true);
					}
				},
				dodv : {
					disable : false,
					checked : false,
					active : false,
					beforeValue : {
						active : null
					},
					text: function(){
						return OperationPowerText.call(this);
					},
					click : function(){
						var control = this.operation.point.dodv;
						var isActive = control.get("active");
						control.set("active", !isActive);
					},
					checkClick : function(e){
						var target = $(e.target);
						var checked = target.prop("checked");
						var control = this.operation.point.dodv;
						var beforeValue = control.beforeValue;
						if(checked){
							if(beforeValue.active !== null){
								control.set("active", beforeValue.active);
								beforeValue.active = null;
							}else{      //선택했던 값이 없으면 Default
								control.set("active", true);
							}
						}else{
							beforeValue.active = control.get("active");
							if(control.get("active")){
								control.set("active", false);
							}
						}
					},
					init : function(){
						var dodv = this;
						dodv.set("disabled", false);
						dodv.set("checked", false);
						dodv.set("active", false);
						//이전 선택 값 초기화
						var key;
						var beforeValue = dodv.beforeValue;
						for( key in beforeValue ){
							beforeValue[key] = null;
						}
					},
					setDisabled : function(){
						var dodv = this;
						dodv.init();
						dodv.set("disabled", true);
					}
				}
			},
			light : {
				disabled : false,
				power : {
					beforeValue : {
						active : null
					},
					disabled : false,
					checked : false,
					active : false,
					text: function(){
						return OperationPowerText.call(this);
					},
					click : function(){
						var light = this.operation.light;
						var isActive = light.power.get("active");
						light.power.set("active", !isActive);
					},
					checkClick : function(e){
						var target = $(e.target);
						var checked = target.prop("checked");
						var light = this.operation.light;
						var beforeValue = light.power.beforeValue;
						if(checked){
							if(beforeValue.active !== null){
								light.power.set("active", beforeValue.active);
								beforeValue.active = null;
							}else{      //선택했던 값이 없으면 Default
								light.power.set("active", true);
							}
						}else{
							beforeValue.active = light.power.get("active");
							if(light.power.get("active")){
								light.power.set("active", false);
							}
						}
					}
				},
				checked : false,
				value : 50,
				slide : function(e){
					var light = this.operation.light;
					light.set("value", e.value);
				},
				init : function(){
					var light = this;
					light.power.set("active", false);
					light.power.set("checked", false);
					light.set("checked", false);
					light.set("disabled", false);
					light.set("value", 50);

					//이전 선택 값 초기화
					var key;
					var beforeValue = light.power.beforeValue;
					for( key in beforeValue ){
						beforeValue[key] = null;
					}
				},
				setDisabled : function(){
					var light = this;
					light.init();
					light.set("disabled", true);
				}
			},
			pre : {
				disable : false,
				checked : false,
				init : function(){
					var pre = this;
					pre.set("checked", false);
					pre.set("disabled", false);
					pre.set("radioChecked", false);
					pre.cool.set("value", PRE_DESIRED);
					pre.cool.set("disabled", true);
					pre.cool.set("unit", unit);
					pre.cool.set("step", step);
					pre.heat.set("value", PRE_DESIRED);
					pre.heat.set("disabled", true);
					pre.heat.set("unit", unit);
					pre.heat.set("step", step);

					//이전 선택 값 초기화
					var key;
					var beforeValue = this.beforeValue;
					for( key in beforeValue ){
						beforeValue[key] = null;
					}
				},
				setDisabled : function(){
					var pre = this;
					this.init();
					pre.set("disabled", true);
					pre.cool.set("disabled", true);
					pre.heat.set("disabled", true);
				},
				radioChecked : "PreCooling",
				beforeValue : {
					radioChecked : null
				},
				checkClick : function(e){
					var pre = this.operation.pre;
					var beforeValue = pre.beforeValue;

					if(!pre.get("checked")){    //enabled
						if(beforeValue.radioChecked !== null){
							pre.set("radioChecked", beforeValue.radioChecked);
							var value = beforeValue.radioChecked == "PreCooling" ? true : false;
							pre.cool.set("disabled", !value);
							pre.heat.set("disabled", value);
							beforeValue.radioChecked = null;
						}else{
							pre.set("radioChecked", "PreCooling");
							pre.cool.set("disabled", false);
							pre.heat.set("disabled", true);
						}
					}else{
						beforeValue.radioChecked = pre.get("radioChecked");
						pre.set("radioChecked", false);
						pre.cool.set("disabled", true);
						pre.heat.set("disabled", true);
					}
				},
				change : function(){
					var pre = this.operation.pre;
					if(pre.get("radioChecked") == "PreCooling"){
						pre.cool.set("disabled", false);
						pre.heat.set("disabled", true);
					}else if(pre.get("radioChecked") == "PreHeating"){
						pre.heat.set("disabled", false);
						pre.cool.set("disabled", true);
					}
				},
				cool : {
					disabled : true,
					value : PRE_DESIRED,
					min : PRE_MIN,
					max : PRE_MAX,
					unit : unit,
					step : step
				},
				heat : {
					disabled : true,
					value : PRE_DESIRED,
					min : PRE_MIN,
					max : PRE_MAX,
					unit : unit,
					step : step
				}
			}
		},
		//SAC Indoor 모드 선택 시, Temperature MIN/MAX 값 설정을 위한 함수
		setTempMinMax : function(e, tempElem, waterTempElem){
			if(tempElem.length < 1 || waterTempElem.length < 1){
				return;
			}
			var tempNumericBox = tempElem.data("kendoCustomNumericBox");
			var waterTempNumericBox = waterTempElem.data("kendoCustomNumericBox");
			var indoor = this.operation.indoor;
			var field = e.field;
			var min, max, desired, checked;

			if(field == "operation.indoor.temperature.min"){
				checked = indoor.temperature.get("checked");
				desired = indoor.temperature.get("desired");
				min = indoor.temperature.get("min");
				tempNumericBox.min(min);
				if(desired < min){
					indoor.temperature.set("desired", min);
				}else if(checked){
					tempNumericBox.enable(false);
					tempNumericBox.enable(true);
				}
			}else if(field == "operation.indoor.temperature.max"){
				checked = indoor.temperature.get("checked");
				desired = indoor.temperature.get("desired");
				max = indoor.temperature.get("max");
				tempNumericBox.max(max);
				if(desired > max){
					indoor.temperature.set("desired", max);
				}else if(checked){
					tempNumericBox.enable(false);
					tempNumericBox.enable(true);
				}
			}else if(field == "operation.indoor.waterTemp.min"){
				checked = indoor.waterTemp.get("checked");
				desired = indoor.waterTemp.get("desired");
				min = indoor.waterTemp.get("min");
				waterTempNumericBox.min(min);
				if(desired < min){
					indoor.waterTemp.set("desired", min);
				}else if(checked){
					waterTempNumericBox.enable(false);
					waterTempNumericBox.enable(true);
				}
			}else if(field == "operation.indoor.waterTemp.max"){
				checked = indoor.waterTemp.get("checked");
				desired = indoor.waterTemp.get("desired");
				max = indoor.waterTemp.get("max");
				waterTempNumericBox.max(max);
				if(desired > max){
					indoor.waterTemp.set("desired", max);
				}else if(checked){
					waterTempNumericBox.enable(false);
					waterTempNumericBox.enable(true);
				}
			}
		},
		checkActive : function(){
			var indoor = this.operation.indoor;
			var indoorMode = indoor.operation.mode;
			var isActive = indoorMode[0].get("active") || indoorMode[1].get("active") || indoorMode[2].get("active") || indoorMode[3].get("active") || indoorMode[5].get("active") || indoorMode[6].get("active");
			indoor.operation.set("active", isActive);

			var dhw = this.operation.dhw;
			var dhwMode = dhw.operation.mode;
			isActive = dhwMode[0].get("active") || dhwMode[1].get("active") || dhwMode[2].get("active") || dhwMode[3].get("active");
			dhw.operation.set("active", isActive);
		},
		init : function(){
			this.set("alarmRadioChecked", "Warning");
			this.dateTimeInit();
			var operation = this.operation;
			var indoor = operation.indoor;
			indoor.init();

			var ventilator = operation.ventilator;
			ventilator.init();

			var dhw = operation.dhw;
			dhw.init();

			var remoteControl = operation.remoteControl;
			remoteControl.init();

			var point = operation.point;
			point.aoav.init();
			point.dodv.init();

			var light = operation.light;
			light.init();

			var pre = operation.pre;
			pre.init();
		},
		defaultIndoor : function(){
			var operation = this.operation;
			var indoor = operation.indoor;
			indoor.power.set("checked", true);
			indoor.power.set("active", true);
			indoor.operation.set("checked", true);
			indoor.operation.mode[0].set("active", true);
			indoor.temperature.set("checked", true);
			indoor.temperature.set("desired", INDOOR_DESIRED);
		},
		defaultVentilator : function(){
			var operation = this.operation;
			var ventilator = operation.ventilator;
			ventilator.power.set("checked", true);
			ventilator.power.set("active", true);
			ventilator.operation.set("checked", true);
			ventilator.operation.mode[0].set("active", true);
		},
		defaultDhw : function(){
			var operation = this.operation;
			var dhw = operation.dhw;
			dhw.power.set("checked", true);
			dhw.power.set("active", true);
			dhw.operation.set("checked", true);
			dhw.operation.mode[1].set("active", true);
			dhw.temperature.set("checked", true);
			dhw.temperature.set("desired", DHW_DESIRED);
		},
		defaultRemoteControl : function(){
			var operation = this.operation;
			var remoteControl = operation.remoteControl;
			remoteControl.set("checked", true);
			remoteControl.control[0].set("active", true);
		},
		defaultControlPoint : function(){
			var operation = this.operation;
			var point = operation.point;
			point.aoav.set("checked", true);
			point.aoav.set("value", "0.0");
			point.dodv.set("checked", true);
			point.dodv.set("active", true);
		},
		defaultAoav : function(){
			var operation = this.operation;
			var point = operation.point;
			point.aoav.set("checked", true);
			point.aoav.set("value", "0.0");
		},
		defaultDodv : function(){
			var operation = this.operation;
			var point = operation.point;
			point.dodv.set("checked", true);
			point.dodv.set("active", true);
		},
		defaultLight : function(){
			var operation = this.operation;
			var light = operation.light;
			light.power.set("checked", true);
			light.power.set("active", true);
			light.set("checked", true);
			light.set("value", 50);
		},
		defaultPre : function(){
			var operation = this.operation;
			var pre = operation.pre;
			pre.set("checked", true);
			pre.set("radioChecked", "PreCooling");
			pre.cool.set("value", PRE_DESIRED);
			pre.cool.set("disabled", false);
		},
		default : function(){		//[2018-04-12][selectedDevices 파라메타를 사용하는 코드가 주석처리됨 미사용되어 제거]
			this.init();
			//Device Type?
			/*if(!selectedDevices){
				this.defaultIndoor();
				this.defaultVentilator();
				this.defaultDhw();
				this.defaultRemoteControl();
				this.defaultControlPoint();
				this.defaultLight();
				this.defaultPre();
			}*/
			this.dateTimeDefault();
		},
		checkDeviceType : function(datas, isEdit){
			var type, data;
			var i, max = datas.length;

			var hasIndoor, hasVentilator, hasDhw, hasLight, hasAoav, hasDodv;
			//
			for( i = 0; i < max; i++ ){
				data = datas[i];
				type = data.type;
				if(type.indexOf("AirConditioner.") != -1){
					type = Util.getIndoorType(data);
					if(type.indexOf("General") != -1){
						hasIndoor = true;
					}else if(type.indexOf("Ventilator") != -1){
						hasVentilator = true;
					}else if(type.indexOf("DHW") != -1){
						hasDhw = true;
					}
				}else if(type.indexOf("Light") != -1){
					hasLight = true;
				}else if(type.indexOf("AO") != -1 || type.indexOf("AV") != -1){
					hasAoav = true;
				}else if(type.indexOf("DO") != -1 || type.indexOf("DV") != -1){
					hasDodv = true;
				}

				if(hasIndoor && hasVentilator && hasDhw && hasLight && hasAoav && hasDodv){
					break;
				}
			}

			if(!hasIndoor){
				this.operation.indoor.setDisabled();
				this.operation.pre.setDisabled();
				this.operation.remoteControl.setDisabled();
			}else{
				this.operation.indoor.init();
				this.operation.pre.init();
				this.operation.remoteControl.init();
				if(!isEdit){
					this.defaultIndoor();
					this.defaultPre();
					this.defaultRemoteControl();
				}
			}

			if(!hasVentilator){
				this.operation.ventilator.setDisabled();
			}else{
				this.operation.ventilator.init();
				if(!isEdit){
					this.defaultVentilator();
				}
			}

			if(!hasDhw){
				this.operation.dhw.setDisabled();
			}else{
				this.operation.dhw.init();
				if(!isEdit){
					this.defaultDhw();
				}
			}

			if(!hasAoav){
				this.operation.point.aoav.setDisabled();
			}else{
				this.operation.point.aoav.init();
				if(!isEdit){
					this.defaultAoav();
				}
			}

			if(!hasDodv){
				this.operation.point.dodv.setDisabled();
			}else{
				this.operation.point.dodv.init();
				if(!isEdit){
					this.defaultDodv();
				}
			}

			if(!hasLight){
				this.operation.light.setDisabled();
			}else{
				this.operation.light.init();
				if(!isEdit){
					this.defaultLight();
				}
			}
		},
		isValid : function(e){
			var isValid = false;
			var dateTimeValid = this.isDateTimeValid(e);

			var isAlarmLog = this.get("isAlarmLog");
			if(isAlarmLog){
				return dateTimeValid;
			}

			var operation = this.operation;
			var indoor = operation.indoor;
			isValid = indoor.power.get("checked");
			 if(isValid && dateTimeValid) return isValid;

			isValid = indoor.operation.get("checked")
				&& (indoor.operation.mode[0].get("active")
					|| indoor.operation.mode[1].get("active")
					|| indoor.operation.mode[2].get("active")
					|| indoor.operation.mode[3].get("active")
					|| indoor.operation.mode[4].get("active")
					|| indoor.operation.mode[5].get("active")
					|| indoor.operation.mode[6].get("active"));

			if(isValid && dateTimeValid) return isValid;

			isValid = indoor.temperature.get("checked");
			 if(isValid && dateTimeValid) return isValid;

			var ventilator = operation.ventilator;
			isValid = ventilator.power.get("checked");
			 if(isValid && dateTimeValid) return isValid;

			isValid = ventilator.operation.get("checked")
				&& (ventilator.operation.mode[0].get("active")
					|| ventilator.operation.mode[1].get("active")
					|| ventilator.operation.mode[2].get("active")
					|| ventilator.operation.mode[3].get("active"));
			 if(isValid && dateTimeValid) return isValid;

			var dhw = operation.dhw;
			isValid = dhw.power.get("checked");
			 if(isValid && dateTimeValid) return isValid;

			isValid = dhw.operation.get("checked")
				&& (dhw.operation.mode[0].get("active")
					|| dhw.operation.mode[1].get("active")
					|| dhw.operation.mode[2].get("active")
					|| dhw.operation.mode[3].get("active"));
			if(isValid && dateTimeValid) return isValid;

			isValid = dhw.temperature.get("checked");
			if(isValid && dateTimeValid) return isValid;

			var remoteControl = operation.remoteControl;
			isValid = remoteControl.get("checked")
				&& (remoteControl.control[0].get("active")
					|| remoteControl.control[1].get("active")
					|| remoteControl.control[2].get("active"));
			if(isValid && dateTimeValid) return isValid;

			var point = operation.point;
			isValid = point.aoav.get("checked") || this.operation.point.dodv.get("checked");
			if(isValid && dateTimeValid) return isValid;

			isValid = point.aoav.get("checked") || this.operation.point.dodv.get("checked");
			if(isValid && dateTimeValid) return isValid;

			var pre = operation.pre;
			isValid = pre.get("checked") && (!pre.cool.get("disabled") || !pre.heat.get("disabled"));
			if(isValid && dateTimeValid) return isValid;

			var light = operation.light;
			isValid = light.power.get("checked") || light.get("checked");
			if(isValid && dateTimeValid) return isValid;

			return isValid;
		},
		validation : function(){
			/*var isPower = this.operation.indoor.power.get("checked");
			this.operation.indoor.operation.set("checked", isPower);
			var isOper = this.operation.indoor.operation.get("checked");

				&& (this.operation.indoor.operation.mode[0].get("active")
					|| this.operation.indoor.operation.mode[1].get("active")
					|| this.operation.indoor.operation.mode[2].get("active"));*/

		}
	});

	var CreationViewModel = kendo.observable({
		/*Rule Alarm & Log*/
		isAlarmLog : false,
		alarmType : "",
		alarmTypeText : "",
		name : "",
		description : "",
		remoteControl :"",
		startDate : "",
		endDate : "",
		selectedNum : 0,
		exceptionalDays : [],
		daysOfWeek : [],
		daysOfWeekJoin : "",
		executionTimes : [],
		rules : [],
		control : {
			operations : [],
			modes : [],
			temperatures : [],
			configuration : {
				remoteControl : ""
			}
		},
		hasRemoteControl : false,
		hasAoPoint : false,
		hasDoPoint : false,
		isAllDay : true,
		legendType : [ false, false, false, false, false ],
		legendTypeText : "SAC Indoor",
		remoteControlText : "",
		init : function(){
			this.set("name", "");
			this.set("description", "");
			this.set("remoteControl", "");
			this.set("alarmType", "");
			this.set("startDate", "");
			this.set("endDate", "");
			this.set("selectedNum", 0);
			this.set("exceptionalDays", []);
			this.set("rules", []);
			this.set("daysOfWeek", []);
			this.set("daysOfWeekJoin", "");
			this.set("executionTimes", []);
			this.control.set("operations", []);
			this.control.set("modes", []);
			this.control.set("temperatures", []);
			this.control.configuration.set("remoteControl", "");
			this.set("hasRemoteControl", false);
			this.set("hasAoControl", false);
			this.set("hasDoControl", false);
			this.set("isAllDay", true);
		},
		setLegendType : function(data){
			var obj = Template.getEventTemplateType(data);
			var types = this.legendType;
			var i, max = types.length;
			for( i = 0; i < max; i++ ){
				this.set("legendType[" + i + "]", false);
			}
			if(typeof obj.type !== 'undefined' && obj.type !== null){
				this.set("legendType[" + obj.type + "]", true);
			}

			if(obj.text){
				this.set("legendTypeText", obj.text);
			}
		},
		setRemoteControlText : function(){
			var remoteControl = this.control.configuration.get("remoteControl");
			if(!remoteControl){
				return;
			}
			if(remoteControl == "Allowed"){
				remoteControl = I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL_ENABLE");
			}else{
				remoteControl = I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL_DISABLE");
			}
			this.set("remoteControlText", remoteControl);
		}
	});

	var OperationPowerText = function(){
		var isActive = this.get("active");
		var isChecked = this.get('checked');
		var result = '';
		if(!isActive){ result = I18N.prop("FACILITY_OFF");} else{result = I18N.prop("FACILITY_ON");}
		if(!isChecked) {result = I18N.prop("FACILITY_ON_OFF");}
		return result;
	};

	var Views = {
		map : {
			view : null,
			widget : null,
			routeUrl : "/map",
			show : null
		},
		list : {
			selected : {
				routeUrl : "/list/selected",
				view : null,
				widget : null
			},
			floor : {
				routeUrl : "/list/floor",
				view : null,
				widget : null
			},
			group : {
				routeUrl : "/list/group",
				view : null,
				widget: null
			},
			show : null
		},
		condition : {
			routeUrl : "/condition",
			view : null,
			widget : null,
			show : null,
			name : I18N.prop("FACILITY_RULE_CONDITION_SETTING")
		},
		operation : {
			routeUrl : "/operation",
			view : null,
			widget : null,
			show : null,
			name : I18N.prop("FACILITY_SCHEDULE_OPERATION_SETTING")
		},
		creation : {
			routeUrl : "/creation",
			view : null,
			widget : null,
			show : null,
			name : I18N.prop("FACILITY_SCHEDULE_CREATION_SETTING")
		}
	};

	return {
		Views : Views,
		MainViewModel : MainViewModel,
		ConditionViewModel : ConditionViewModel,
		OperationViewModel : OperationViewModel,
		CreationViewModel : CreationViewModel,
		typeFilterDataSource : typeFilterDataSource,
		typeFilterText : typeFilterText,
		typeQuery : typeQuery,
		statusDataSource : statusDataSource
	};
});

//For Debug
//# sourceURL=operation/rule/rule-create-vm.js
