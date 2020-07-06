/**
 *
 */
define("device/common/device-model", [], function(){
	//Code의 품질을 위하여 "use strict" 적용
	"use strict";
	var kendo = window.kendo;

	var Device = kendo.data.Model.define({

		//		alarms : "alarms",

		id: "id",
		fields: {
			alarms: {
				type: "object",
				editType: null
			},
			networks: {
				type: "object"
			},
			parentId: {
				type: "string"
			},
			winds: {type : "object"},
			registrationStatus : {
				type: "string",
				options: [
					{text: "NotRegistered", value: "0"},
					{text: "Registered", value: "1"},
					{text: "Deleted", value: "1"}
				]
			},
			name: {type : "string"},
			information : {type : "object"},
			subordinateIds: {type : "object"},
			operations: {type : "object"},
			mappedType : {
				type: "string",
				options: [
					{text: "ControlPoint", value: "0"},
					{text: "Light", value: "1"},
					{text: "Meter.WattHour", value: "2"},
					{text: "Sensor.Humidity", value: "3"},
					{text: "Sensor.Motion", value: "4"},
					{text: "Sensor.Temperature", value: "5"}
				]
			},
			representativeStatus : {
				type: "string",
				options: [
					{text: "Normal.On", value: "0"},
					{text: "Normal.Off", value: "1"},
					{text: "Alarm.Critical", value: "2"},
					{text: "Alarm.Warning", value: "3"},
					{text: "Alarm.NetworkError", value: "4"},
					{text: "Disconnected", value: "5"},
					{text: "LowBattery", value: "6"},
					{text: "OutOfBounds", value: "7"}
				]
			},
			modes: {type : "object"},
			controlPoint: {type: "object"},
			groups: {type: "object"},
			//			configuration: {type: configuration},
			configuration: {type: "object"},
			light :{type : "object"},
			type: {type : "string"},
			id: {type : "string"},
			schedules: {type : "object"},
			description: {type : "string"},
			locations: {type : "object"},
			airConditioner: {type : "object"},
			/*"air-conditioner.outdoorUnit.electricCurrentControl": {name : "Current Limit"},
			"air-conditioner.outdoorUnit.coolingCapacityCalibration": {name : "Cooling Capacity Callibration"},
			"air-conditioner.outdoorUnit.heatingCapacityCalibration": {name : "Heating Capacity Callibration"},*/
			temperatures: {type: "object"}
		}
	});

	var DevicePopup = kendo.data.Model.define({
		id: "id",
		fields: {
			//[23-04-2018]중복된 변수 선언 -jw.lim
			// "type": {
			// 	name: "Device Type",
			// 	type: "string",
			// 	editType: null
			// },
			"id": {
				name: "Device ID",
				type: "string",
				editType: null
			},
			"name": {
				name: "Device NAME",
				type: "string",
				editType: "input"
			},
			"representativeStatus": {
				name: "Status",
				type: "string",
				editType: null
			},
			"modes": {
				name: "Operation Mode",
				type: "string",
				editType: null
			},
			"temperatureS": {
				name: "Set Temperature",
				type: "string",
				editType: null
			},
			"temperatureC": {
				name: "Current Temperature",
				type: "string",
				editType: null
			},
			"locations": {
				name: "Location",
				type: "string",
				editType: "select"
			},
			"groups": {
				name: "Group",
				type: "string",
				editType: null
			},
			"control-point": {
				name: "Remote Control",
				type: "string",
				editType: "input"
			},
			"model": {
				name: "Model",
				type: "string",
				editType: null
			},
			"type": {
				name: "Type",
				type: "string",
				editType: null
			},
			"version": {
				name: "Firmware Version",
				type: "string",
				editType: null
			},
			"description": {
				name: "Description",
				type: "string",
				editType: "input"
			}

		}
	});

	return {
		Device : Device,
		DevicePopup : DevicePopup
	};
});
