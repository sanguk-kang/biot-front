define("operation/rule/model/rule-model", function(){
	"use strict";

	var moment = window.moment;

	var MAX_END_DATE_YEAR = 2099;
	var MAX_END_DATE_MONTH = 12;
	var MAX_END_DATE_DAY = 31;
	var MAX_END_DATE = "2099-12-31";

	var MockData = [
	  {
			"id": 1,
			"name": "Rule Control #1",
			"description": "This rule is good in Freeze-up season",
			"activated": false,  // default value is false
			"startDate": "2017-06-01",
			"endDate": "2017-06-30",  // for endless date endDate should be absent
			"daysOfWeek": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			"times": [ { "startTime" : "00:00:00", "endTime": "06:00:00" },  // if it is null, It is for always (00.00.00 - 23.59.00)
						  { "startTime" : "08:00:00", "endTime" : "10:00:00" }
			],
			"condition" : { // One or more than one rule with OR/AND condition
				"rules" : [
					{
						"order" : 1,  // This field is used for order in which rule is created and required for OR/AND condition
						"calculation":"SingleStatus",  // values : SingleStatus, Addition, Subtraction, Average
						"devices" :  [ {  // only 1 device for SingleStatus, only 2 devices info for Addition, Subtraction and 1 to 5 devices for Average type.
							"dms_devices_id" : "d112001",
							"dms_devices_type" : "AirConditioner.Indoor"
						}],
						"operator" : "==",   // < , ≤ , > , ≥ , ＝ , ≠
						"monitor" : "operations-AirConditioner.Indoor.General-power", // Monitoring Factor, Mentioned below
						"value"  : "On", // value will be depends on what Monitor is selected
						"duration" : "P10M" , // PnM as per ISO 8601 Standard, P(Period) n(number), M(Minute)  e.x P10M : period 10 minute. Currently only Minute is supported
						"logicOpr" : "OR" // values:{"AND", "OR"} Required, If there is more than one rule. For last rule, it is not required.
					} ]
			},
					   "created": {
				"date": "2017-02-27T13:00:00",
				"ums_users_name": "Julia"
			},
			"updated": {
				"date": "2017-02-27T18:00:00",
				"ums_users_name": "James"
			},
			"devices": [{   // List of devices for control command or alarm log type will be sent
				"dms_devices_id": "d112002",
				"dms_devices_name": "sac_indoor112002",
				"dms_devices_type": "AirConditioner.Indoor",
				"location": "A Zone #2"
			},{   // List of devices for control command or alarm log type will be sent
				"dms_devices_id": "d112003",
				"dms_devices_name": "sac_indoor112003",
				"dms_devices_type": "AirConditioner.Indoor",
				"location": "A Zone #2"
			},{   // List of devices for control command or alarm log type will be sent
				"dms_devices_id": "d112004",
				"dms_devices_name": "sac_indoor112004",
				"dms_devices_type": "AirConditioner.Indoor",
				"location": "A Zone #2"
			}
				   ],
			"deviceTypes" : [
				{
					dms_devices_type : "AirConditioner.Indoor",
					control : {
						"operations": [{
							"id": "AirConditioner.Indoor.General",
							"power": "On"
						}],
						"temperatures": [{
							"id": "AirConditioner.Indoor",
							"desired": 30
						}],
						"modes": [{
							"id": "AirConditioner.Indoor.General",
							"mode": "Cool"
						}],
						"configuration": {
							"remoteControl": "Allowed"
						}
					}
				}
			]
		},
		{
			"id": 2,
			"name": "Alarm & Log #1",
			"description": "This rule is good in Freeze-up season",
			"activated": false,  // default value is false
			"startDate": "2017-06-15",
			"endDate": "2017-07-15",  // for endless date endDate should be absent
			"daysOfWeek": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			"times": [ { "startTime" : "00:00:00", "endTime": "06:00:00" },  // if it is null, It is for always (00.00.00 - 23.59.00)
						  { "startTime" : "08:00:00", "endTime" : "10:00:00" }
			],
			"condition" : { // One or more than one rule with OR/AND condition
				"rules" : [
					{
						"order" : 1,  // This field is used for order in which rule is created and required for OR/AND condition
						"calculation":"SingleStatus",  // values : SingleStatus, Addition, Subtraction, Average
						"devices" :  [ {  // only 1 device for SingleStatus, only 2 devices info for Addition, Subtraction and 1 to 5 devices for Average type.
							"dms_devices_id" : "d112001",
							"dms_devices_type" : "AirConditioner.Indoor"
						}],
						"operator" : "==",   // < , ≤ , > , ≥ , ＝ , ≠
						"monitor" : "operations-AirConditioner.Indoor.General-power", // Monitoring Factor, Mentioned below
						"value"  : "On", // value will be depends on what Monitor is selected
						"duration" : "P10M" , // PnM as per ISO 8601 Standard, P(Period) n(number), M(Minute)  e.x P10M : period 10 minute. Currently only Minute is supported
						"logicOpr" : "OR" // values:{"AND", "OR"} Required, If there is more than one rule. For last rule, it is not required.
					} ]
			},
					   "created": {
				"date": "2017-02-27T13:00:00",
				"ums_users_name": "Julia"
			},
			"updated": {
				"date": "2017-02-27T18:00:00",
				"ums_users_name": "James"
			},
			"devices": [{   // List of devices for control command or alarm log type will be sent
				"dms_devices_id": "d112002",
				"dms_devices_name": "sac_indoor112002",
				"dms_devices_type": "AirConditioner.Indoor",
				"location": "A Zone #2"
			},{   // List of devices for control command or alarm log type will be sent
				"dms_devices_id": "d112003",
				"dms_devices_name": "sac_indoor112003",
				"dms_devices_type": "AirConditioner.Indoor",
				"location": "A Zone #2"
			},{   // List of devices for control command or alarm log type will be sent
				"dms_devices_id": "d112004",
				"dms_devices_name": "sac_indoor112004",
				"dms_devices_type": "AirConditioner.Indoor",
				"location": "A Zone #2"
			}],
			"deviceTypes" : [
				{
					dms_devices_type : "AirConditioner.Indoor",
					control : {
						"operations": [{
							"id": "AirConditioner.Indoor.General",
							"power": "On"
						}],
						"temperatures": [{
							"id": "AirConditioner.Indoor",
							"desired": 24.4
						}],
						"modes": [{
							"id": "AirConditioner.Indoor.General",
							"mode": "Cool"
						}],
						"configuration": {
							"remoteControl": "Allowed"
						}
					}
				}
			],
			"alarm" : {
				"logType" : "Critical"  // "Critical" , "Warning" // In case rule is for Rule alarm and Log
			}
		}];

	var kendo = window.kendo;
	var RuleModel = kendo.data.Model.define({
		id: "id",
		fields: {
			name: {
				name: "Name"
			},
			description : {
				name: "Description"
			},
			activated : {
				name : "Activation",
				type : "boolean"
			},
			startDate : {
				name : "Start Date",
				type : "date"
			},
			endDate : {
				name : "End Date",
				type : "date"
			},
			daysOfWeek : {
				name : "DaysOfWeek",
				type : "object",
				defaultValue : []
			},
			times : {
				name : "Execution Time",
				type : "object",
				defaultValue : []
			},
			condition : {
				name : "Condition",
				type : "object",
				defaultValue : {}
			},
			devices : {
				name : "Devices",
				type : "object",
				defaultValue : []
			},
			control : {
				name : "Operations",
				type : "object",
				defaultValue : {}
			},
			alarmType : {
				name: "AlarmType"
			}
		}
	});

	var createDataSource = function(list){
		var item, i, max = list.length;

		for( i = max - 1; i >= 0; i-- ){
			item = list[i];
			if (item.alarmType && item.alarmType !== 'None'){
				list.splice(i, 1);
				continue;
			}
			item.startDate = setDate(item.startDate);
			if(item.endDate){
				item.endDate = setDate(item.endDate, true);
			}else{
				var d = new Date();
				d.setFullYear(MAX_END_DATE_YEAR);
				item.endDate = d;
			}

			//item.executionTimes.sort();
		}
		return list;
	};

	var setDate = function(date, isEndDate){
		var d = new Date(date);
		if(isEndDate){
			d.setHours(23);
			d.setSeconds(59);
			d.setMinutes(59);
		}else{
			d.setHours(0);
			d.setSeconds(0);
			d.setMinutes(0);
		}
		return d;
	};

	var createModel = function(data){
		var m = new RuleModel(data);
		if(data){
			return m;
		}

		var sd = new Date();
		var ed = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
		m.set("startDate", sd);
		m.set("endDate", ed);
		var st = new Date();
		var et = new Date();

		//AllDay가 Default 이므로 Default 시작 시간 00:00 종료 시간 23:59
		// st.setHours(0);
		// st.setMinutes(0);
		// et.setHours(23);
		// et.setMinutes(59);

		// st = moment(st).format("HH:mm:ss");
		// et = moment(et).format("HH:mm:ss");
		st = moment(st).set({hour:0,minute:0,second:0}).format("HH:mm:ss");
		et = moment(et).set({hour:23,minute:59,second:59}).format("HH:mm:ss");
		// console.log("create new rule model");
		// console.log(st);
		// console.log(et);

		m.set("times", [{ startTime : st, endTime: et}]);
		m.set("condition", {});
		m.set("control", {});
		m.set("deviceTypes", []);

		m.control.set("operation", []);
		m.control.set("temperatures", []);
		m.control.set("modes", []);
		m.control.set("configuration", {});
		//m.control.configuration.set("remoteControl", "None");
		return m;
	};

	return {
		MockData : MockData,
		createDataSource : createDataSource,
		createModel : createModel,
		MAX_END_DATE_YEAR : MAX_END_DATE_YEAR,
		MAX_END_DATE_MONTH : MAX_END_DATE_MONTH,
		MAX_END_DATE_DAY : MAX_END_DATE_DAY,
		MAX_END_DATE : MAX_END_DATE
	};
});
//# sourceURL=operation/rule/model/rule-model.js