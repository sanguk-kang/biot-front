define("device/common/device-constants", [], function(){
	"use strict";

	var I18N = window.I18N;

	var TIME_OUT = 1500;
	var ALL_TIME_INTERVAL = 40000;
	var PANEL_REFRESH_TIME = 1000;
	var BEACON_TIME_INTERVAL = 5000;
	var DISPLAY_NAME_MAX = 6;

	var INDOOR_TYPE = [ "AirConditioner.Indoor", "AirConditioner.AHU", "AirConditioner.Chiller", "AirConditioner.EHS", "AirConditioner.ERV", "AirConditioner.ERVPlus", ["AirConditioner.FCU", "AirConditioner.SFCU"], "AirConditioner.DuctFresh" ];
	var OUTDOOR_TYPE = ["AirConditioneromOutdoor"];

	var POINT_TYPE = [ "ControlPoint.AI", "ControlPoint.AO", "ControlPoint.DI", "ControlPoint.DO",
					   "ControlPoint.AV", "ControlPoint.DV"];

	var ENERGY_TYPE = [ "Meter.WattHour", "Meter.Gas", "Meter.Water", "Meter.Calorimeter"];
	var SENSOR_TEMP_HUM_TYPE = ["Sensor.Temperature_Humidity", "Sensor.Humidity", "Sensor.Temperature"];

	var STATUS = [ "Normal.On", "Normal.Off", "Alarm.Critical", "Alarm.Warning" ];
	var BEACON_STATUS = [ "Normal", "Disconnected", "WrongLocation", "LowBattery" ];

	//var BEACON_LOCATION_TYPE = ["Fixed", "Measured"];
	var BEACON_LOCATION_TYPE = ["Fixed", "Movable"];

	var ONOFF = ["On", "Off"];
	var MODE = [ {mode : "Auto", id : "AirConditioner.Indoor.General"},
				 {mode : "Cool", id : "AirConditioner.Indoor.General"},
				 {mode : "Heat", id : "AirConditioner.Indoor.General"},
				 {mode : "Dry", id : "AirConditioner.Indoor.General"},
				 {mode : "Fan", id : "AirConditioner.Indoor.General"},
				 {mode : "CoolStorage", id : "AirConditioner.Indoor.General"},
				 {mode : "HeatStorage", id : "AirConditioner.Indoor.General"},
				 {mode : "vAuto", id : "AirConditioner.Indoor.Ventilator"},
				 {mode : "HeatExchange", id : "AirConditioner.Indoor.Ventilator"},
				 {mode : "ByPass", id : "AirConditioner.Indoor.Ventilator"},
				 {mode : "Sleep", id : "AirConditioner.Indoor.Ventilator"},
				 {mode : "Eco", id : "AirConditioner.Indoor.DHW"},
				 {mode : "Standard", id : "AirConditioner.Indoor.DHW"},
				 {mode : "Power", id : "AirConditioner.Indoor.DHW"},
				 {mode : "Force", id : "AirConditioner.Indoor.DHW"}
				 ];

	var TEXT = {
		"SELECTALL" : I18N.prop("COMMON_BTN_SELECT_ALL"),
		"DESELECTALL" : I18N.prop("COMMON_BTN_DESELECT_ALL"),
		"REGISTER" : I18N.prop("COMMON_BTN_REGISTER"),
		"DEREGISTER" : I18N.prop("COMMON_BTN_DEREGISTER"),
		"VIEW" : I18N.prop("COMMON_BTN_VIEW"),
		"DELETE" : I18N.prop("COMMON_BTN_DELETE")
	};

	var INNER_LAYOUT = {
		"MONITORING" : 0,
		"REGISTRATION" : 1
	};

	var FILTER = {
		"TYPE" : 0,
		"STATUS" : 1,
		"MODE" : 2,
		"ZONE" : 3,
		"SELECTALL" : 4,
		"REGEND" : 5
	};

	var ASSET_FILTER = {
		"TYPE" : 0,
		"LOCATION" : 1,
		"STATUS" : 2,
		"ZONE" : 3,
		"SELECTALL" : 4
	};

	var ACTION = {
		"REGISTER" : 1,
		"DETAIL" : 2
	};

	var BEACON_ACTION = {
		"BLOCK" : 1,
		"DELETE" : 2,
		"REGISTER" : 3,
		"DETAIL" : 4
	};

	var NW_ACTION = {
		"DELETE" : 1,
		"REGISTER" : 2,
		"DETAIL" : 3,
		"VIEW" : 4
	};

	var ASSET_ACTION = {
		"ASSET_TYPE" : 1,
		"EXPORT" : 2,
		"IMPORT" : 3,
		"REGISTER" : 4,
		"DELETE" : 5,
		"DETAIL" : 6
	};

	var VIEW = {
		"STATISTIC" : 0,
		"MAP" : 1,
		"LIST": 2,
		"GRID" : 3
	};

	var SEARCH = {
		"EDIT" : 0,
		"BUTTON" : 1
	};

	var FILTER_NAME = {
		"SELECTALL" : "selectAll",
		"ZONE" : "zone",
		"STATUS" : "status",
		"TYPE" : "type",
		"MODE" : "mode",
		"ASSET_TYPE" : "assetType"
	};

	var ACTION_NAME = {
		"DETAIL" : "detail",
		"REGISTER" : "register",
		"DELETE" : "delete",
		"BLOCK" : "block",
		"SELECTEDTEXT" : "selectedText",
		"VIEW" : "view",
		"ASSET_TYPE" : "assetType"
	};

	var REGISTRATION_STATUS_BUTTONS = {
		"REGISTER" : 0,
		"UNREGISTER" : 1
	};

	var displayShort = [
		{value : "CoolStorage", display : "CoolSt"},
		{value : "HeatStorage", display : "HeatSt"},
		{value : "HeatExchange", display : "HeatEx"}
	];


	//실내기 제어
	//id별도 정리 필요
	var controlSet = [[{apiName : "operations", id : "AirConditioner.Indoor.General", parameter: "power"},
					   {apiName : "operations", id : "AirConditioner.Indoor.Ventilator", parameter: "power"},
					   {apiName : "operations", id : "AirConditioner.Indoor.DHW", parameter: "power"}], //0

					  {apiName : "modes", id : "AirConditioner.Indoor.General", parameter: "mode"}, //1
					  {apiName : "winds", id : "AirConditioner.Indoor.General.Speed", parameter: "wind"}, //2
					  {}, // 3
					  {apiName : "modes", id : "AirConditioner.Indoor.ModeLimit", parameter: "mode"}, //4
					  [{apiName : "temperatures", id : "AirConditioner.Indoor.Room.Cool.Limit", parameter: "enabled"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.Room.Heat.Limit", parameter: "enabled"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.WaterOutlet.Cool.Limit", parameter: "enabled"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.WaterOutlet.Heat.Limit", parameter: "enabled"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.DHW.Limit", parameter: "enabled"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.DHW.Limit", parameter: "enabled"}], // 5
					  [{apiName : "configuration", parameter: "remoteControl"},
					   {apiName : "airConditioner", parameter: "filterResetRequired"},
					   {apiName : "airConditioner", parameter: "spi"},
					   {apiName : "airConditioner", parameter: "stillAir"}], //6
					  {apiName : "winds", id : "AirConditioner.Indoor.General.Direction", parameter: "wind"}, //7
					  {apiName : "winds", id : "AirConditioner.Indoor.General.Direction", parameter: "wind"}, //8
					  {apiName : "modes", id : "AirConditioner.Indoor.Ventilator", parameter: "mode"}, //9
					  {apiName : "winds", id : "AirConditioner.Indoor.Ventilator.Speed", parameter: "wind"}, //10
					  {apiName : "modes", id : "AirConditioner.Indoor.DHW", parameter: "mode"}, //11
					  [{apiName : "airConditioner", parameter: "chiller", underParameter : "waterLaw"},
					   {apiName : "airConditioner", parameter: "chiller", underParameter : "quiet"},
					   {apiName : "airConditioner", parameter: "chiller", underParameter : "forcedFan"},
					   {apiName : "airConditioner", parameter: "chiller", underParameter : "demand"}], //12
					  {apiName : "airConditioner", parameter: "chiller", underParameter : "mccMode"}, //13

					  [{apiName : "temperatures", id : "AirConditioner.Indoor.Room.Cool.Limit", parameter: "desired"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.Room.Heat.Limit", parameter: "desired"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.WaterOutlet.Cool.Limit", parameter: "desired"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.WaterOutlet.Heat.Limit", parameter: "desired"},
					   {apiName : "temperatures", id : "AirConditioner.Indoor.DHW.Limit", parameter: "desired"}], //14

					   [{apiName : "temperatures", id : "AirConditioner.Indoor.Room", parameter: "desired"},
						   {apiName : "temperatures", id : "AirConditioner.Indoor.WaterOutlet", parameter: "desired"},
						   {apiName : "temperatures", id : "AirConditioner.Indoor.DischargeAir", parameter: "desired", Heat : "AirConditioner.Indoor.DischargeAir.Heat", Cool : "AirConditioner.Indoor.DischargeAir.Cool"},
						   {apiName : "temperatures", id : "AirConditioner.Indoor.DHW", parameter: "desired"},
						   {apiName : "temperatures", id : "AirConditioner.Indoor.DischargeAir", parameter: "enabled"}], // 15
						   {apiName : "modes", id : "AirConditioner.Indoor.General", parameter: "mode"}, //16
						   {apiName : "airConditioner", parameter: "chiller", underParameter : "demandLevel"} // 17
					  ];

	//실외기 제어 Config
	var outdoorControlConfig = {
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

	var LIGHT_CONTROL = {
		POWER: 0,
		DIMMING: 1
	};

	return {
		TIME_OUT : TIME_OUT,
		ALL_TIME_INTERVAL : ALL_TIME_INTERVAL,
		PANEL_REFRESH_TIME : PANEL_REFRESH_TIME,
		BEACON_TIME_INTERVAL : BEACON_TIME_INTERVAL,
		DISPLAY_NAME_MAX : DISPLAY_NAME_MAX,
		INDOOR_TYPE : INDOOR_TYPE,
		OUTDOOR_TYPE : OUTDOOR_TYPE,
		POINT_TYPE : POINT_TYPE,
		ENERGY_TYPE : ENERGY_TYPE,
		SENSOR_TEMP_HUM_TYPE : SENSOR_TEMP_HUM_TYPE,
		STATUS : STATUS,
		BEACON_STATUS : BEACON_STATUS,
		BEACON_ACTION : BEACON_ACTION,
		BEACON_LOCATION_TYPE : BEACON_LOCATION_TYPE,
		ASSET_FILTER: ASSET_FILTER,
		ASSET_ACTION : ASSET_ACTION,
		ONOFF : ONOFF,
		MODE : MODE,
		TEXT : TEXT,
		FILTER : FILTER,
		ACTION : ACTION,
		NW_ACTION : NW_ACTION,
		VIEW : VIEW,
		SEARCH : SEARCH,
		displayShort : displayShort,
		controlSet : controlSet,
		outdoorControlConfig : outdoorControlConfig,
		INNER_LAYOUT : INNER_LAYOUT,
		FILTER_NAME : FILTER_NAME,
		ACTION_NAME : ACTION_NAME,
		REGISTRATION_STATUS_BUTTONS : REGISTRATION_STATUS_BUTTONS,
		LIGHT_CONTROL : LIGHT_CONTROL
	};
});

//# sourceURL=device/common/device-contants.js
