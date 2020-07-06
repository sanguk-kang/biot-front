define("operation/rule/model/rule-alarm-model", function(){
	"use strict";

	// var moment = window.moment;		//[2018-04-12][변수선언후 미사용 주석처리]
	var MAX_END_DATE_YEAR = 2099;

	var MockData = [
	  {
			"id": 1,
			"name": "Alarm Log #1",
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
		},
		{
			"id": 2,
			"name": "Rule Control #1",
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
			]
		}];

	var createDataSource = function(list){
		var item, i, max = list.length;

		for( i = max - 1; i >= 0; i-- ){
			item = list[i];
			if (!item.alarmType || item.alarmType === 'None'){
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

	return {
		MockData : MockData,
		createDataSource : createDataSource
	};
});
//# sourceURL=operation/rule/model/rule-alarm-model.js