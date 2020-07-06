//comparison-model.js
/**
	*
	*   <ul>
	*       <li>comparison에 관련된 공통 값 설정 작업</li>
	*   </ul>
	*   @module app/energy/consumptionandtarget/comparison-model
	*   @returns {Object} Model -메세지 object
	*   @returns {Object} modelData - text object
	*   @returns {Array} temperatureData- device 그룹 필터 실행
	*   @returns {Array} temperatureData- device 그룹 필터 실행
	*   @returns {Array} createDataSource- device 그룹 필터 실행
	*   @returns {Array} reqTemperatureDataToServer- device 그룹 필터 실행
	*   @returns {Array} reqEnergyDataToServer- device 그룹 필터 실행
	*   @returns {Array} mockTemperatureData- device 그룹 필터 실행
	*   @returns {Array} mockEnergyData- device 그룹 필터 실행
	*   @returns {Array} data- device 그룹 필터 실행
	*/
define("energy/consumptionandtarget/model/comparison-model", [], function() {
	"use strict";
	/*Kendo Model을 정의한다.*/
	/*아래는 예시로 서버 Response에 맞춰 정의 필요.*/
	var kendo = window.kendo;
	var Model = kendo.data.Model.define({
		id: "id",
		fields: {
			name: {
				name: "Name"
			},
			description: {
				name: "Description"
			},
			activated: {
				name: "Activation",
				type: "boolean"
			},
			startDate: {
				name: "Start Date",
				type: "date"
			},
			endDate: {
				name: "End Date",
				type: "date"
			},
			daysOfWeek: {
				name: "Repeat Days",
				type: "object",
				defaultValue: []
			},
			exceptionalDays: {
				name: "Execeptional Days",
				type: "object",
				defaultValue: []
			},
			executionTimes: {
				name: "Execution Time",
				type: "object",
				defaultValue: []
			},
			devices: {
				name: "Devices",
				type: "object",
				defaultValue: []
			},
			"control": {
				name: "Operations",
				type: "object",
				defaultValue: {}
			}
		}
	});

	/* 	GET /temperature?year=yyyy&month=mm&day=dd
			returns: Average outdoor temperature by hourly/daily/monthly as per the params
		GET /temperature?floorId=fff&year=yyyy&month=mm&day=dd
		GET /energy/target/{device_group_id}?year=yyyy&meterType=WattHour
			returns: monthly target energy comparison for the given device group id as per the params
	*/
	var temperatureData = [];
	var modelData = [];
	var data = {};

	//Promise Object for Request Temperature Data
	var reqTemperatureDataToServer = function(URL){
		var temperatureUrl = "/energy/temperature?" + URL;
		return $.ajax({
			url: temperatureUrl
		});
	};

	//Promise Object for Request Energy Data
	var reqEnergyDataToServer = function(URL){
		var energyUrl = "/energy/consumption/group?" + URL;
		//var energyUrl = "/energy/consumption/group?year=2017&month=1&day=1&dms_meter_type=Meter.WattHour&dms_group_ids=10001";
		return $.ajax({
			url: energyUrl
		});
	};

	//Mock Data - Temperature
	var mockTemperatureData = function(){
		var monthly = {
			"monthly": [{
				"month": 1,
				'degree': 20
			},
			{
				"month": 2,
				'degree': 20
			},
			{
				"month": 3,
				'degree': 20
			},
			{
				"month": 4,
				'degree': 33
			},
			{
				"month": 5,
				'degree': 28
			},
			{
				"month": 6,
				'degree': 17
			},
			{
				"month": 7,
				'degree': 21
			},
			{
				"month": 8,
				'degree': 22
			},
			{
				"month": 9,
				'degree': 24
			},
			{
				"month": 10,
				'degree': 20
			},
			{
				"month": 11,
				'degree': 27
			},
			{
				"month": 12,
				'degree': 23
			}]
		};//월
		var daily = {
			"daily": [{
				"day": 1,
				'degree': 20
			},
			{
				"day": 2,
				'degree': 20
			},
			{
				"day": 3,
				'degree': 20
			},
			{
				"day": 4,
				'degree': 21
			},
			{
				"day": 5,
				'degree': 20
			},
			{
				"day": 6,
				'degree': 20
			},
			{
				"day": 7,
				'degree': 23
			},
			{
				"day": 8,
				'degree': 20
			},
			{
				"day": 9,
				'degree': 20
			},
			{
				"day": 10,
				'degree': 33
			},
			{
				"day": 11,
				'degree': 20
			},
			{
				"day": 12,
				'degree': 20
			},
			{
				"day": 13,
				'degree': 20
			},
			{
				"day": 14,
				'degree': 20
			},
			{
				"day": 15,
				'degree': 20
			},
			{
				"day": 16,
				'degree': 20
			},
			{
				"day": 17,
				'degree': 15
			},
			{
				"day": 18,
				'degree': 20
			},
			{
				"day": 19,
				'degree': 20
			},
			{
				"day": 20,
				'degree': 20
			},
			{
				"day": 21,
				'degree': 20
			},
			{
				"day": 22,
				'degree': 20
			},
			{
				"day": 23,
				'degree': 30
			},
			{
				"day": 24,
				'degree': 20
			},
			{
				"day": 25,
				'degree': 20
			},
			{
				"day": 26,
				'degree': 20
			},
			{
				"day": 27,
				'degree': 40
			},
			{
				"day": 28,
				'degree': 20
			},
			{
				"day": 29,
				'degree': 20
			},
			{
				"day": 30,
				'degree': 20
			},
			{
				"day": 31,
				'degree': 20
			}]
		};//일
		var timely = {
			"hourly": [{
				"hour": '0',
				'degree': 20
			},
			{
				"hour": 1,
				'degree': 20
			},
			{
				"hour": 2,
				'degree': 15
			},
			{
				"hour": 3,
				'degree': 20
			},
			{
				"hour": 4,
				'degree': 25
			},
			{
				"hour": 5,
				'degree': 30
			},
			{
				"hour": 6,
				'degree': 20
			},
			{
				"hour": 7,
				'degree': 30
			},
			{
				"hour": 8,
				'degree': 20
			},
			{
				"hour": 9,
				'degree': 20
			},
			{
				"hour": 10,
				'degree': 20
			}]
		};//시간

		return {
			monthly: monthly,
			daily: daily,
			timely: timely
		};
	};

	//Mock Data - Energy
	var mockEnergyData = function(){
		//Mock Data - Energy
		var monthly = {
			"monthly": [
				{
					"group_name": "GroupAirConditioner1",
					"monthly": [
						{
							"month": 1,
							"total": 812.24,
							"sac": 405.52,
							"light": 203.36,
							"others": 203.36
						},
						{
							"month": 2,
							"total": 807.7399999999999,
							"sac": 403.41999999999996,
							"light": 202.16,
							"others": 202.16
						},
						{
							"month": 3,
							"total": 862.5,
							"sac": 459.98,
							"light": 201.26,
							"others": 201.26
						},
						{
							"month": 4,
							"total": 918.87,
							"sac": 481.42999999999995,
							"light": 218.72,
							"others": 218.72
						},
						{
							"month": 5,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						},
						{
							"month": 6,
							"total": 953.5400000000001,
							"sac": 506.82,
							"light": 223.36,
							"others": 223.36
						},
						{
							"month": 7,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 8,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 9,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 10,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 11,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 12,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						}
					]
				},
				{
					"group_name": "GroupAirconditionerOutdoor2",
					"monthly": [
						{
							"month": 1,
							"total": 610.08,
							"sac": 203.36,
							"light": 203.36,
							"others": 203.36
						},
						{
							"month": 2,
							"total": 606.48,
							"sac": 202.16,
							"light": 202.16,
							"others": 202.16
						},
						{
							"month": 3,
							"total": 603.78,
							"sac": 201.26,
							"light": 201.26,
							"others": 201.26
						},
						{
							"month": 4,
							"total": 656.16,
							"sac": 218.72,
							"light": 218.72,
							"others": 218.72
						},
						{
							"month": 5,
							"total": 638.13,
							"sac": 212.71,
							"light": 212.71,
							"others": 212.71
						},
						{
							"month": 6,
							"total": 670.08,
							"sac": 223.36,
							"light": 223.36,
							"others": 223.36
						},
						{
							"month": 7,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 8,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 9,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 10,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 11,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 12,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						}
					]
				},
				{
					"group_name": "GroupAirConditioner3",
					"monthly": [
						{
							"month": 1,
							"total": 812.24,
							"sac": 405.52,
							"light": 203.36,
							"others": 203.36
						},
						{
							"month": 2,
							"total": 807.7399999999999,
							"sac": 403.41999999999996,
							"light": 202.16,
							"others": 202.16
						},
						{
							"month": 3,
							"total": 862.5,
							"sac": 459.98,
							"light": 201.26,
							"others": 201.26
						},
						{
							"month": 4,
							"total": 918.87,
							"sac": 481.42999999999995,
							"light": 218.72,
							"others": 218.72
						},
						{
							"month": 5,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						},
						{
							"month": 6,
							"total": 953.5400000000001,
							"sac": 506.82,
							"light": 223.36,
							"others": 223.36
						},
						{
							"month": 7,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 8,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 9,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 10,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 11,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"month": 12,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						}
					]
				}
			],
			"unit": "kWh"
		};//월
		var daily = {
			"daily": [
				{
					"group_name": "GroupAirConditioner1",
					"daily": [
						{
							"day": 1,
							"total": 812.24,
							"sac": 405.52,
							"light": 203.36,
							"others": 203.36
						},
						{
							"day": 2,
							"total": 807.7399999999999,
							"sac": 403.41999999999996,
							"light": 202.16,
							"others": 202.16
						},
						{
							"day": 3,
							"total": 862.5,
							"sac": 459.98,
							"light": 201.26,
							"others": 201.26
						},
						{
							"day": 4,
							"total": 918.87,
							"sac": 481.42999999999995,
							"light": 218.72,
							"others": 218.72
						},
						{
							"day": 5,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						},
						{
							"day": 6,
							"total": 953.5400000000001,
							"sac": 506.82,
							"light": 223.36,
							"others": 223.36
						},
						{
							"day": 7,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"day": 5,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						},
						{
							"day": 9,
							"total": 807.7399999999999,
							"sac": 403.41999999999996,
							"light": 202.16,
							"others": 202.16
						},
						{
							"day": 10,
							"total": 918.87,
							"sac": 481.42999999999995,
							"light": 218.72,
							"others": 218.72
						},
						{
							"day": 11,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						}
					]
				},
				{
					"group_name": "GroupAirconditionerOutdoor2",
					"daily": [
						{
							"day": 1,
							"total": 812.24,
							"sac": 405.52,
							"light": 203.36,
							"others": 203.36
						},
						{
							"day": 2,
							"total": 807.7399999999999,
							"sac": 403.41999999999996,
							"light": 202.16,
							"others": 202.16
						},
						{
							"day": 3,
							"total": 862.5,
							"sac": 459.98,
							"light": 201.26,
							"others": 201.26
						},
						{
							"day": 4,
							"total": 918.87,
							"sac": 481.42999999999995,
							"light": 218.72,
							"others": 218.72
						},
						{
							"day": 5,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						},
						{
							"day": 6,
							"total": 953.5400000000001,
							"sac": 506.82,
							"light": 223.36,
							"others": 223.36
						},
						{
							"day": 7,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"day": 5,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						},
						{
							"day": 9,
							"total": 807.7399999999999,
							"sac": 403.41999999999996,
							"light": 202.16,
							"others": 202.16
						},
						{
							"day": 10,
							"total": 918.87,
							"sac": 481.42999999999995,
							"light": 218.72,
							"others": 218.72
						},
						{
							"day": 11,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						}
					]
				},
				{
					"group_name": "GroupAirConditioner3",
					"daily": [
						{
							"day": 1,
							"total": 812.24,
							"sac": 405.52,
							"light": 203.36,
							"others": 203.36
						},
						{
							"day": 2,
							"total": 807.7399999999999,
							"sac": 403.41999999999996,
							"light": 202.16,
							"others": 202.16
						},
						{
							"day": 3,
							"total": 862.5,
							"sac": 459.98,
							"light": 201.26,
							"others": 201.26
						},
						{
							"day": 4,
							"total": 918.87,
							"sac": 481.42999999999995,
							"light": 218.72,
							"others": 218.72
						},
						{
							"day": 5,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						},
						{
							"day": 6,
							"total": 953.5400000000001,
							"sac": 506.82,
							"light": 223.36,
							"others": 223.36
						},
						{
							"day": 7,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						},
						{
							"day": 5,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						},
						{
							"day": 9,
							"total": 807.7399999999999,
							"sac": 403.41999999999996,
							"light": 202.16,
							"others": 202.16
						},
						{
							"day": 10,
							"total": 918.87,
							"sac": 481.42999999999995,
							"light": 218.72,
							"others": 218.72
						},
						{
							"day": 11,
							"total": 911.4900000000001,
							"sac": 486.07000000000005,
							"light": 212.71,
							"others": 212.71
						}
					]
				}
			],
			"unit": "kWh"
		};//일
		var timely = {
			"hourly": [
				{
					"group_name": "GroupAirConditioner1",
					"hourly": [
						{
							"hour": 0,
							"total": 610.08,
							"sac": 203.36,
							"light": 203.36,
							"others": 203.36
						},
						{
							"hour": 1,
							"total": 808.64,
							"sac": 404.32,
							"light": 202.16,
							"others": 202.16
						},
						{
							"hour": 2,
							"total": 805.04,
							"sac": 402.52,
							"light": 201.26,
							"others": 201.26
						},
						{
							"hour": 3,
							"total": 914.8800000000001,
							"sac": 477.44000000000005,
							"light": 218.72,
							"others": 218.72
						},
						{
							"hour": 4,
							"total": 900.84,
							"sac": 475.41999999999996,
							"light": 212.71,
							"others": 212.71
						},
						{
							"hour": 5,
							"total": 943.44,
							"sac": 496.72,
							"light": 223.36,
							"others": 223.36
						},
						{
							"hour": 6,
							"total": 923.84,
							"sac": 496.91999999999996,
							"light": 213.46,
							"others": 213.46
						},
						{
							"hour": 7,
							"total": 808.64,
							"sac": 404.32,
							"light": 202.16,
							"others": 202.16
						},
						{
							"hour": 8,
							"total": 805.04,
							"sac": 402.52,
							"light": 201.26,
							"others": 201.26
						},
						{
							"hour": 9,
							"total": 914.8800000000001,
							"sac": 477.44000000000005,
							"light": 218.72,
							"others": 218.72
						},
						{
							"hour": 10,
							"total": 900.84,
							"sac": 475.41999999999996,
							"light": 212.71,
							"others": 212.71
						},
						{
							"hour": 11,
							"total": 808.64,
							"sac": 404.32,
							"light": 202.16,
							"others": 202.16
						},
						{
							"hour": 12,
							"total": 805.04,
							"sac": 402.52,
							"light": 201.26,
							"others": 201.26
						},
						{
							"hour": 13,
							"total": 914.8800000000001,
							"sac": 477.44000000000005,
							"light": 218.72,
							"others": 218.72
						},
						{
							"hour": 14,
							"total": 900.84,
							"sac": 475.41999999999996,
							"light": 212.71,
							"others": 212.71
						},
						{
							"hour": 15,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 176.17
						},
						{
							"hour": 16,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 136.17
						},
						{
							"hour": 17,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 176.17
						},
						{
							"hour": 18,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 76.17
						},
						{
							"hour": 19,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 176.17
						},
						{
							"hour": 20,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 76.17
						},
						{
							"hour": 21,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 176.17
						},
						{
							"hour": 22,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 76.17
						},
						{
							"hour": 23,
							"total": 465.64,
							"sac": 240.04,
							"light": 43.51,
							"others": 176.17
						}
					]
				},
				{
					"group_name": "GroupAirconditionerOutdoor2",
					"hourly": [
						{
							"hour": 0,
							"total": 610.08,
							"sac": 203.36,
							"light": 203.36,
							"others": 203.36
						},
						{
							"hour": 1,
							"total": 606.48,
							"sac": 202.16,
							"light": 202.16,
							"others": 202.16
						},
						{
							"hour": 2,
							"total": 603.78,
							"sac": 201.26,
							"light": 201.26,
							"others": 201.26
						},
						{
							"hour": 3,
							"total": 656.16,
							"sac": 218.72,
							"light": 218.72,
							"others": 218.72
						},
						{
							"hour": 4,
							"total": 638.13,
							"sac": 212.71,
							"light": 212.71,
							"others": 212.71
						},
						{
							"hour": 5,
							"total": 670.08,
							"sac": 223.36,
							"light": 223.36,
							"others": 223.36
						},
						{
							"hour": 6,
							"total": 640.38,
							"sac": 213.46,
							"light": 213.46,
							"others": 213.46
						}
					]
				}
			],
			"unit": "kWh"
		};//시간

		return {
			monthly: monthly,
			daily: daily,
			timely: timely
		};
	};

	//Preprocess data from server for datasource on UI
	var createDataSource = function(list) {
		return list;
	};

	return {
		Model: Model,
		modelData: modelData,
		temperatureData: temperatureData,
		createDataSource: createDataSource,
		reqTemperatureDataToServer: reqTemperatureDataToServer,
		reqEnergyDataToServer: reqEnergyDataToServer,
		mockTemperatureData: mockTemperatureData,
		mockEnergyData: mockEnergyData,
		data: data
	};
});

//# sourceURL=energy/comparison/model/comparison-model.js
