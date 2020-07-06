/**
*
*   <ul>
*       <li>b.IoT 공용 Javascript Utility</li>
*       <li>기기의 데이터 파싱, 기기 타입 관련 처리 함수 등으로 이루어져있다.</li>
*   </ul>
*   @module app/core/util
*   @requires config
*   @requires lib/moment
*
*
*/

(function(window, $){
	var kendo = window.kendo;
	var moment = window.moment;

	/*설치된 기기 정보 리스트를 저장한다.
		Default는 전체 타입이며, Main 에서 서버에서 받아온 데이터로 덮어씌운다.*/
	// var installedTypes = [
	// 	"AirConditioner.AHU", "AirConditioner.Chiller", "AirConditioner.DuctFresh", "AirConditioner.EHS", "AirConditioner.ERV", "AirConditioner.ERVPlus", "AirConditioner.FCU", "AirConditioner.Indoor", "AirConditionerOutdoor", "AirConditionerController.DMS", "AirConditionerController.WirelessDDC", "Beacon", "CCTV", "ControlPoint", "ControlPoint.AI", "ControlPoint.AO", "ControlPoint.AV", "ControlPoint.DI", "ControlPoint.DO", "ControlPoint.DV", "DemandController", "Gateway", "Light", "Meter.Calori", "Meter.Gas", "Meter.Water", "Meter.WattHour", "Printer", "Sensor.Humidity", "Sensor.Motion", "Sensor.Temperature", "Sensor.Temperature_Humidity", "SmartPlug", "Etc"
	// ];
	var installedTypes = [];

	var STATIC_IMAGE_URL = "../../src/main/resources/static-dev/images/";

	/**
	*
	*   $.ajax 수행 후 Fail(500,400~404)로 응답되는 경우에 대한 메시지 처리를 한다.
	*
	*   @function parseFailResponse
	*   @param {jQueryXhqObject} xhq - $.ajax 수행 시, Fail Callback으로 전달되는 jQueryXhqObject
	*   @returns {String} - Parsing된 Message
	*   @alias module:app/core/util
	*
	*/
	var parseFailResponse = function(xhq){
		var msg;
		if(xhq && xhq.responseJSON){
			var jsonMsg = xhq.responseJSON;
			// var code = jsonMsg.code || jsonMsg.status;
			if(jsonMsg.code && jsonMsg.message){
				msg = "[Error Code : " + xhq.responseJSON.code + "] " + xhq.responseJSON.message;
			}else{
				msg = xhq.responseText;
			}
		}else if(xhq.responseText){
			msg = xhq.responseText;
		}else{
			msg = xhq;
		}

		return msg;
	};

	/**
	*
	*   정수 1자리를 2자리수로 변경한다. (e.g : 1 -> 01)
	*
	*   @function sliceNum
	*   @param {Number} number - 정수
	*   @returns {String} - 변경된 String
	*   @alias module:app/core/util
	*
	*/
	//1 -> 01, 10-> 10
	var sliceNum = function(number){
		if(number < 100){
			return ("0" + number).slice(-2);
		}else if(number > 100){
			return ("0" + number).slice(-3);
		}
	};

	/**
	*
	*   Zone(Polygon)의 중앙 좌표를 구한다.
	*
	*   @function getCentroid
	*   @param {Array} coord - Zone(Polygon)의 좌표 값
	*   @returns {Array} - 중앙 좌표 값
	*   @alias module:app/core/util
	*
	*/
	var getCentroid = function (coord){
		var center = coord.reduce(function (x,y) {
			return [x[0] + y[0] / coord.length, x[1] + y[1] / coord.length];
		}, [0,0]);
		return center;
	};

	/**
	*   <ul>
	*   <li>기기 타입 별로 실제 type 값과 Display 값을 Key/Value로 할당한 Object</li>
	*   <li>(e.g : "AirConditioner" : {"Indoor" : { type : "AirConditioner.Indoor", displayType : "Indoor" }})</li>
	*
	*   @type {Object}
	*   @name DeviceType
	*   @memberof module:app/core/util
	*   @alias module:app/core/util
	*
	*/
	//Device Type List
	//KEY : Display Text, Value : Real Value
	var DeviceType = {
		"AirConditioner" : {
			"Indoor" : {
				type  : "AirConditioner.Indoor",
				displayType : "Cassette/Duct"
			},
			"AHU" : {
				type : "AirConditioner.AHU",
				displayType : "AHU"
			},
			"Chiller" : {
				type : "AirConditioner.Chiller",
				displayType : "DVM Chiller"
			},
			"EHS" : {
				type : "AirConditioner.EHS",
				displayType : "EHS"
			},
			"ERV" : {
				type : "AirConditioner.ERV",
				displayType : "ERV"
			},
			"ERVPlus" : {
				type : "AirConditioner.ERVPlus",
				displayType : "ERV Plus"
			},
			"FCU" : {
				type : "AirConditioner.FCU",
				displayType : "FCU"
			},
			"SFCU" : {
				type : "AirConditioner.SFCU",
				displayType : "FCU"
			},
			"DuctFresh" : {
				type : "AirConditioner.DuctFresh",
				displayType : "Fresh Duct"
			}
		},
		"AirConditionerController" : {
			"DMS" : {
				type : "AirConditionerController.DMS",
				displayType : "DMS"
			},
			"WirelessDDC" : {
				type : "AirConditionerController.WirelessDDC",
				displayType : "Wireless DDC"
			}
		},
		"AirConditionerOutdoor" : {
			type : "AirConditionerOutdoor",
			displayType : "SAC Outdoor"
		},
		"Beacon" : {
			type : "Beacon",
			displayType : "Beacon"
		},
		"CCTV" : {
			type : "CCTV",
			displayType : "CCTV"
		},
		"Peak" : {
			type: "Peak",
			displayType: "Peak"
		},
		"ControlPoint" : {
			"AI" : {
				type : "ControlPoint.AI",
				displayType : "AI"
			},
			"AO" : {
				type : "ControlPoint.AO",
				displayType : "AO"
			},
			"AV" : {
				type : "ControlPoint.AV",
				displayType : "AV"
			},
			"DI" : {
				type : "ControlPoint.DI",
				displayType : "DI"
			},
			"DO" : {
				type : "ControlPoint.DO",
				displayType : "DO"
			},
			"DV" : {
				type : "ControlPoint.DV",
				displayType : "DV"
			}
		},
		"DemandController" : {
			type : "DemandController",
			displayType : "DemandController"
		},
		"Gateway" : {
			type : "Gateway",
			displayType : "IoT AP"
		},
		"Light" : {
			type : "Light",
			displayType : "Light"
		},
		"SmartPlug" : {
			type : "SmartPlug",
			displayType : "SmartPlug"
		},
		"Meter" : {
			"WattHour" : {
				type : "Meter.WattHour",
				displayType : "WattHour"
			},
			"Gas" : {
				type : "Meter.Gas",
				displayType : "Gas"
			},
			"Water" : {
				type : "Meter.Water",
				displayType : "Water"
			},
			"Calori" : {
				type : "Meter.Calori",
				displayType : "Calori"
			}
		},
		"Printer" : {
			type : "Printer",
			displayType : "Printer"
		},
		"Sensor" : {
			"Humidity" : {
				type : "Sensor.Humidity",
				displayType : "Humidity Sensor"
			},
			"Motion" : {
				type : "Sensor.Motion",
				displayType : "Motion Sensor"
			},
			"Temperature" : {
				type : "Sensor.Temperature",
				displayType : "Temperature Sensor"
			},
			"Temperature_Humidity" : {
				type : "Sensor.Temperature_Humidity",
				displayType : "Temp. & Humi. Sensor"
			}
		},
		"Etc" : {
			type : "Etc",
			displayType : "Etc"
		},
		"PointType" : {
			"Point" : {
				type: "ControlPoint",
				displayType: "Point"
			},
			"Light" : {
				type : "Light",
				displayType : "Light"
			},
			"Temperature" : {
				type : "Sensor.Temperature",
				displayType : "Temperature Sensor"
			},
			"Humidity" : {
				type : "Sensor.Humidity",
				displayType : "Humidity Sensor"
			},
			"Motion" : {
				type : "Sensor.Motion",
				displayType : "Motion Sensor"
			},
			"WattHour" : {
				type : "Meter.WattHour",
				displayType : "WattHour"
			},
			"Etc" : {
				type : "Etc",
				displayType : "Etc"
			}
		}
	};

	/**
	*
	*   해당하는 상위 기기 Type의 하위 기기 Type List를 가져온다.
	*
	*   @function getDeviceTypeList
	*   @param {String} type - 상위 기기 타입 값 (e.g : "ControlPoint")
	*   @param {Boolean} isOnlyControlable - 제어 가능한 기기 타입 여부
	*   @returns {Array} - 하위 기기 타입 리스트 (e.g : ["AI" : {
				type : "ControlPoint.AI",
				displayType : "AI"
			},
			"AO" : {
				type : "ControlPoint.AO",
				displayType : "AO"
			},
			"AV" : {
				type : "ControlPoint.AV",
				displayType : "AV"
			},..])
	*   @alias module:app/core/util
	*
	*/
	var getDeviceTypeList = function(type, isOnlyControlable){
		var key, subKey, results = [];
		var first, second;
		//All Type
		if(!type){
			for(key in DeviceType){
				first = DeviceType[key];
				if(first && first.type && first.displayType){
					//설치된 기기 정보만 가져온다.
					if(isInstalledType(first.type)){
						results.push(first);
					}
				}else if(first){
					for(subKey in first){
						second = first[subKey];
						if(second && second.type && second.displayType){
							//설치된 기기 정보만 가져온다.
							if(isInstalledType(second.type)){
								results.push(second);
							}
						}
					}
				}
			}
		}else if(type && $.isArray(type)){
			var i, max = type.length;
			for( i = 0; i < max; i++ ){
				first = DeviceType[type[i]];
				if(first && first.type && first.displayType){
					if(isInstalledType(first.type)){
						results.push(first);
					}
				}else if(first){
					for(key in first){
						second = first[key];
						if(second && second.type && second.displayType){
							if(isInstalledType(second.type)){
								results.push(second);
							}
						}
					}
				}
			}
		}else{
			first = DeviceType[type];
			if(first && first.type && first.displayType){
				if(isInstalledType(first.type)){
					results.push(first);
				}
			}else if(first){
				for(key in first){
					second = first[key];
					if(second && second.type && second.displayType){
						if(isInstalledType(second.type)){
							results.push(second);
						}
					}
				}
			}
		}

		//Default로 AV, DV 삭제
		if(isOnlyControlable){
			removeNoControlableType(results);
		}

		return results;
	};

	/**
	*
	*   하위 기기 타입 리스트 중 제어 불가한 리스트를 삭제한다.
	*
	*   @function removeNoControlableType
	*   @param {Array} results - 하위 기기 타입 리스트
	*   @returns {Array} - 제어 불가한 하위 기기 타입이 삭제된 하위 기기 타입 리스트
	*   @alias module:app/core/util
	*
	*/
	var removeNoControlableType = function(results){
		var i, item, max = results.length;
		for( i = max - 1; i >= 0; i-- ){
			item = results[i];
			if(item.displayType == "AI"){
				results.splice(i, 1);
			}

			if(item.displayType == "DI"){
				results.splice(i, 1);
			}
		}
	};

	/**
	*   <ul>
	*   <li>Schedule, Rule 등 기능들에 쓰이는 기기 제어 타입</li>
	*   <li>(e.g : "AirConditioner.Indoor.Ventilator", "AirConditioner.Indoor.General.Direction"</li>
	*
	*   @type {Object}
	*   @name detailControlTypes
	*   @memberof module:app/core/util
	*   @alias module:app/core/util
	*
	*/
	var detailControlTypes = ["AirConditioner.Indoor.General", "AirConditioner.Indoor.Ventilator", "AirConditioner.Indoor.DHW", "AirConditioner.DHW", "AirConditioner.Indoor.Room", "AirConditioner.Indoor.WaterOutlet", "AirConditioner.Indoor.DischargeAir", "AirConditioner.Indoor.General.Speed", "AirConditioner.Indoor.Ventilator.Speed", "AirConditioner.Indoor.General.Direction"];

	/**
	*
	*   기기 타입 값을 Display Text로 변환한다.
	*
	*   @function getDisplayType
	*   @param {String} type - 기기 타입
	*   @returns {String} - 기기 타입의 Display Text
	*   @alias module:app/core/util
	*
	*/
	var getDisplayType = function(type){
		if(!type){
			return "-";
		}
		if(type == "AirConditioner"){
			type = "AirConditioner.Indoor";
		}
		//console.log("type = " + type);
		if(detailControlTypes.indexOf(type) != -1){
			var split = type.split(".");
			if(split.length > 3){
				return "SAC " + split[1] + " (" + split[2] + ", " + split[3] + ")";
			}else if(split.length > 2){
				return "SAC " + split[1] + " (" + split[2] + ")";
			}
			return "SAC Indoor " + " (" + split[1] + ")";
		}

		if(type == "General"){
			return "Light";
		}

		if(type == "ControlPoint"){
			return "Point";
		}

		if(type == "Meter"){
			return "Energy Meter";
		}

		if(type == "Unknown"){
			return "Unknown";
		}

		var first, second, splits = type.split(".");
		first = DeviceType[splits[0]];
		if(first){
			if(splits.length > 1){
				second = first[splits[1]];
				if(second){
					return second.displayType;
				}
			}else{
				return first.displayType;
			}
		}
		return type;
	};


	/**
	*
	*   <p>기기 타입 값을 Display Text로 변환한다. (상세 팝업용)</p>
	*   <p>상세 팝압에서는 하위 기기 타입과 상관 없이 실내기면 실내기 실외기면 실외기로만 표시함.</p>
	*   @function getDetailDisplayType
	*   @param {String} type - 기기 타입
	*   @param {Boolean} isMainType - 상위 기기타입 Display 여부 (ControlPoint -> Point)
	*   @returns {String} - 기기 타입의 Display Text
	*   @alias module:app/core/util
	*
	*/
	var getDetailDisplayType = function(type, isMainType){
		if(!type){
			return "-";
		}
		if(type.indexOf("AirConditionerOutdoor") != -1){
			return "SAC Outdoor";
		}else if(type.indexOf("AirConditioner") != -1){
			if(type.indexOf("Controller") != -1){
				var sub = type.split(".")[1];
				if(sub == "DMS"){
					return "DMS";
				}else if(sub == "WirelessDDC"){
					return "Wireless DDC";
				}
			}else{
				return "SAC Indoor";
			}
		}else if(type.indexOf("Meter") != -1){ // SRS에 Energy Meter정의 안되어있음.
			return "Energy Meter";
		}else if(type.indexOf("Light") != -1){ // SRS에 Light정의 안되어있음.
			return "Light";
		}else if(type.indexOf("SmartPlug") != -1){
			return "SmartPlug";
		}else if(type.indexOf("ControlPoint") != -1){
			if(isMainType){
				return "Point";
			}
			if(type.indexOf("AO") != -1){
				return "AO";
			}else if(type.indexOf("AI") != -1){
				return "AI";
			}else if(type.indexOf("AV") != -1){
				return "AV";
			}else if(type.indexOf("DI") != -1){
				return "DI";
			}else if(type.indexOf("DO") != -1){
				return "DO";
			}else if(type.indexOf("DV") != -1){
				return "DV";
			}
		}else if(type.indexOf("Sensor") != -1){
			if(type.indexOf("Temperature_Humidity") != -1){
				return "Temp. & Humi. Sensor";
			}else if(type.indexOf("Temperature") != -1){
				return "Temperature Sensor";
			}else if(type.indexOf("Humidity") != -1){
				return "Humidity Sensor";
			}else if(type.indexOf("Motion") != -1){
				return "Motion Sensor";
			}
		}else if(type.indexOf("Gateway") != -1){
			return "IoT AP";
		}else if(type.indexOf("Beacon") != -1){
			return "Beacon";
		}else if(type.indexOf("CCTV") != -1){
			return "CCTV";
		}

		return type;
	};

	/**
	*
	*   <p>mappedType까지 체크하여 기기 타입 값을 Display Text로 변환한다.</p>
	*
	*   @function getDetailDisplayTypeDevice
	*   @param {Object} device - 기기 정보 (/dms/devices [GET]을 통해 가져온 기기 정보)
	*   @param {Boolean} isMainType - 상위 기기타입 Display 여부 (ControlPoint -> Point)
	*   @returns {String} - 기기 타입의 Display Text
	*   @alias module:app/core/util
	*
	*/
	var getDetailDisplayTypeDevice = function(device, isMainType){
		if(device.mappedType && device.mappedType != "ControlPoint"){
			return getDetailDisplayType(device.mappedType, isMainType);
		}
		return getDetailDisplayType(device.type, isMainType);
	};

	/**
	*
	*   <p>mappedType까지 체크하여 기기 타입 값을 Display Text로 변환하고, 다국어를 적용한다.</p>
	*
	*   @function getDetailDisplayTypeDeviceI18N
	*   @param {Object} device - 기기 정보 (/dms/devices [GET]을 통해 가져온 기기 정보)
	*   @param {Boolean} isMainType - 상위 기기타입 Display 여부 (ControlPoint -> Point)
	*   @returns {String} - i18N 다국어가 적용된 기기 타입의 Display Text
	*   @alias module:app/core/util
	*
	*/
	var getDetailDisplayTypeDeviceI18N = function(device, isMainType){
		var I18N = window.I18N;
		var type = device;
		if(typeof device == "string"){
			type = getDetailDisplayType(device, isMainType);
		}else{
			type = getDetailDisplayTypeDevice(device, isMainType);
		}
		var i18nVal = type.replace(/ & /g, "_").replace(/ /g, "_")
			.replace(/Temp\./g, "Temperature").replace(/Humi\./g, "Humidity").replace(/\./g, "_");
		//console.log(i18nVal.toUpperCase());
		i18nVal = I18N.prop("FACILITY_DEVICE_TYPE_FILTER_" + i18nVal.toUpperCase());
		type = i18nVal ? i18nVal : type;
		return type;
	};

	/**
	*
	*   <p>기기 타입의 이미지를 표시하기위한 CSS Class 값을 가져온다.</p>
	*   <p>.detail-img와 같이 쓰이는 CSS Class 값이다.</p>
	*   @function getDisplayClassType
	*   @param {Object} data - 기기 정보 (/dms/devices [GET]을 통해 가져온 기기 정보)
	*   @returns {String} - 기기타입에 해당하는 CSS Class 값
	*   @alias module:app/core/util
	*
	*/
	var getDisplayClassType = function(data){
		if(!data){
			return "";
		}

		if(typeof data.assets_types_name !== 'undefined'){
			return data.assets_types_name.toLowerCase();
		}

		var type, mappedType;
		if(typeof data == "object"){
			mappedType = data.mappedType;
			type = data.type;
		}else{
			type = data;
		}

		if(!type){
			return "";
		}

		if(type.indexOf("AirConditionerOutdoor") != -1){
			return "Outdoor";
		}else if(type.indexOf("AirConditioner") != -1){
			return "Indoor";
		}else if(type.indexOf("Meter") != -1
				 || (mappedType && mappedType.indexOf("Meter") != -1)){
			return "Meter";
		}else if(type.indexOf("Light") != -1
				 || (mappedType && mappedType.indexOf("Light") != -1)){
			return "Light";
		}else if(type.indexOf("SmartPlug") != -1){
			return "SmartPlug";
		}else if(type.indexOf("Temperature") != -1
		   || type.indexOf("Humidity") != -1
		   || (mappedType && mappedType.indexOf("Temperature") != -1)
		   || (mappedType && mappedType.indexOf("Humidity") != -1)){
			return "Temp";
		}else if(type.indexOf("Motion") != -1
				 || (mappedType && mappedType.indexOf("Motion") != -1)){
			return "Motion";
		}else if(type.indexOf("ControlPoint") != -1){
			if(type.indexOf("AO") != -1){
				return "AO";
			}else if(type.indexOf("AI") != -1){
				return "AI";
			}else if(type.indexOf("AV") != -1){
				return "AV";
			}else if(type.indexOf("DI") != -1){
				return "DI";
			}else if(type.indexOf("DO") != -1){
				return "DO";
			}else if(type.indexOf("DV") != -1){
				return "DV";
			}
		}else if(type.indexOf("Gateway") != -1){
			return "Gateway";
		}else if(type.indexOf("Beacon") != -1){
			return "Beacon";
		}else if(type.indexOf("CCTV") != -1){
			return "CCTV";
		}else if(type.indexOf("Asset") != -1){
			return "Asset";
		}

		return type;
	};

	//Schedule, Rule 에서 쓰이는 General Type
	var getGeneralType = function(type){
		if(!type){
			return "";
		}

		if(type.indexOf("AirConditioner.") != -1){
			return "AirConditioner.Indoor";
		}

		return type;
	};

	/**
	*
	*   <ul>
	*   <li>Display Type을 본래의 Type 값으로 변환한다.</li>
	*   </ul>
	*   @function getOriginalType
	*   @param {String} displayType - 기기 타입의 Display Text
	*   @returns {String} - 기기 타입 값
	*   @alias module:app/core/util
	*
	*/
	var getOriginalType = function(displayType){
		if(!displayType){
			return;
		}
		var key, subKey, first, second;
		for( key in DeviceType ){
			first = DeviceType[key];
			if(first.displayType && first.displayType == displayType){
				return first.type;
			}
			for(subKey in first){
				second = first[subKey];
				if(second.displayType && second.displayType == displayType){
					return second.type;
				}
			}
		}
	};

	/**
	*
	*   <ul>
	*   <li>현재 실내기 모드와 전원 값을 파싱하여 구한다.</li>
	*   </ul>
	*   @function makeModeObj
	*   @param {Array} modes - 실내기의 modes List (/dms/devices [GET]을 통하여 가져온 데이터)
	*   @param {Arrya} operations - 실내기의 operations List (/dms/devices [GET]을 통하여 가져온 데이터)
	*   @returns {Object} - 현재 실내기의 operations, modes 값을 담은 Object
	*   @alias module:app/core/util
	*
	*/
	var makeModeObj = function(modes, operations){
		var i, max;
		var operObj = {};
		var modeObj = {};

		if(operations){
			max = operations.length;
			if(operations && max > 0){
				for( i = 0; i < max; i++ ){
					operObj[operations[i].id] = operations[i].power;
				}
			}
		}

		if(modes){
			max = modes.length;

			if(modes && max > 0){
				for( i = 0; i < max; i++ ){
					var temp = modes[i];
					if(temp.mode === "Normal") temp.mode = "ByPass";
					else if(temp.mode === "HeatStorage") temp.mode = "HotWater";
					modeObj[temp.id] = temp.mode;
				}
			}
		}

		return {"oper" : operObj, "mode" : modeObj};
	};

	/**
	*
	*   <ul>
	*   <li>현재 기기 정보의 최근 알람 정보를 구한다.</li>
	*   </ul>
	*   @function getRecentAlarm
	*   @param {Object} data - 기기 정보 (/dms/devices [GET]을 통하여 가져온 데이터)
	*   @returns {Object} - 최근 발생한 알람 정보 (id, type, name, time)
	*   @alias module:app/core/util
	*
	*/
	var getRecentAlarm = function(data){
		var alarm;
		var alarms = data.alarms;
		//N/W Asset(자산)의 최근 알람
		if(typeof data.assets_types_id !== 'undefined'){
			alarms = [];
			var devices = data.devices;
			var i, max = devices.length;
			var deviceAlarms;
			for( i = 0; i < max; i++ ){
				deviceAlarms = devices[i].dms_devices_alarms;
				if(deviceAlarms instanceof kendo.data.ObservableArray){
					deviceAlarms = deviceAlarms.toJSON();
				}
				alarms = alarms.concat(deviceAlarms);
			}
		}

		if(alarms && alarms.length){
			alarms.sort(function(a,b){
				// return (a.alarms_type < b.alarms_type) ? -1 : (a.alarms_eventTime > b.alarms_eventTime) ? 0 : 1;
				var comparedEventTime = (a.alarms_eventTime > b.alarms_eventTime) ? 0 : 1;
				var result = (a.alarms_type < b.alarms_type) ? -1 : comparedEventTime;
				return result;
			});

			alarm = {};
			alarm.id = alarms[0].alarms_id;
			alarm.type = alarms[0].alarms_type;
			alarm.name = alarms[0].alarms_name;
			alarm.time = alarms[0].alarms_eventTime;
		}
		return alarm;
	};

	var getLightStatus = function(data){
		if(data.controlPoint.value > 0){
			return "Normal.On";
		}
		return "Normal.Off";
	};

	var getSmartPlugStatus = function(data){	// 0831 - add smart plug
		if(data.controlPoint.value > 0){
			return "Normal.On";
		}
		return "Normal.Off";
	};

	/**
	*   <ul>
	*   <li>Normal.Off가 존재하지 않는 기기 타입 리스트</li>
	*   <li>기기 정보의 representativeStatus를 보고 ON/OFF를 표시한다.</li>
	*   @type {Object}
	*   @name representativeStatusType
	*   @memberof module:app/core/util
	*   @alias module:app/core/util
	*
	*/
	var representativeStatusType = ["Beacon", "CCTV", "Gateway", "Sensor.Motion",
		"Sensor.Temperature_Humidity", "Sensor.Temperature", "Sensor.Humidity", "Meter.Gas", "Meter.WattHour", "Light", "ControlPoint"];

	/**
	*
	*   <ul>
	*   <li>현재 기기 정보 또는 자산 정보의 상태 정보를 구한다.</li>
	*   </ul>
	*   @function getStatus
	*   @param {Object} data - 기기 정보 또는 자산 정보 (/dms/devices [GET]을 통하여 가져온 데이터 또는 /assets [GET]을 통하여 가져온 데이터)
	*   @returns {String} - 현재 기기 상태 {"Normal.On", "Normal.Off", "Alarm.Warning", "Alarm.Critical"}
	*   @alias module:app/core/util
	*
	*/
	var getStatus = function(data){
		var type = null;
		var mappedType = data.mappedType;
		var alarms = getRecentAlarm(data);

		type = data.type;
		if(type && !alarms){
			//Light로 변환된 ControlPoint의 상태
			//알람이 없을 경우.
			if( !alarms && type.indexOf("ControlPoint") != -1 ){
				//Light는 AO AI DO DI Value에 따라 ON/OFF 표시
				//Light를 lights와 operations로 통합 08/30
				/*if((type.indexOf("AO") != -1 || type.indexOf("AI") != -1
					|| type.indexOf("DI") != -1 || type.indexOf("DO") != -1) && (mappedType && mappedType.indexOf("Light") != -1)){
					if(data.controlPoint && data.controlPoint.value){
						return getLightStatus(data);
					}
				}*/

				//이외 mappedType 존재하는 경우
				if(mappedType && representativeStatusType.indexOf(mappedType) != -1){
					return getRepresentativeStatus(data);
				}
			}

			//N/W 사 기기와 Motion Sensor, Temp&Humi Sensor, Meter 등은 getRepresentativeStatus로 확인한다.
			if(representativeStatusType.indexOf(type) != -1){
				return getRepresentativeStatus(data);
			}
		}

		//Asset 일 경우
		if(typeof data.assets_types_id !== 'undefined' && !alarms){
			return getAssetStatus(data);
		}

		var result = makeModeObj(data.modes, data.operations);
		var operObj = result.oper;
		var name;
		if(alarms){
			name = alarms.name;
			type = alarms.type;
			//Beacon에는 Disconnected, Wrong Location, Low Battery 등의 알람이 존재한다.
			if(/*(type && type == "Beacon") || */typeof data.assets_types_id !== 'undefined'){
				if(name == "Dev_10002"){    //Network Error -> Disconnected
					return "Alarm.Critical";
				}else if(name == "Dev_10003"){   //Wrong Location
					return "Alarm.Critical";
				}else if(name == "Dev_10004"){   //Low Battery
					return "Alarm.Warning";
				}else if(type == "Critical"){
					return "Alarm.Critical";
				}
				return "Alarm.Warning";
			}else if(alarms.type === "Critical"){
				return "Alarm.Critical";
			}
			return "Alarm.Warning";
		} else if(!result) {
			return "-";
		} else if(operObj["AirConditioner.Indoor.General"] == "On"
		   || operObj["AirConditioner.Indoor.DHW"] == "On"
		   || operObj["AirConditioner.Indoor.Ventilator"] == "On"
		   || operObj["AirConditioner.Outdoor"] == "On"
		   || operObj["General"] == "On") {//ControlPoint, Light, Meter On 추가
			return "Normal.On";
		}
		return "Normal.Off";
	};

	/**
	*
	*   <ul>
	*   <li>실내기, Point의 ON/OFF 정보를 가져온다.</li>
	*   </ul>
	*   @function getNormalStatus
	*   @param {Object} data - 기기 정보 (/dms/devices [GET]을 통하여 가져온 데이터)
	*   @returns {String} - 현재 기기 상태 {"Normal.On", "Normal.Off"}
	*   @alias module:app/core/util
	*
	*/
	var getNormalStatus = function(data){
		var type = data.type;
		var mappedType = data.mappedType;
		if( type && type.indexOf("ControlPoint") != -1 ){
			//Light는 AO AI DO DI Value에 따라 ON/OFF 표시
			if((type.indexOf("AO") != -1 || type.indexOf("AI") != -1
				|| type.indexOf("DI") != -1 || type.indexOf("DO") != -1) && (mappedType && mappedType.indexOf("Light") != -1)){
				if(data.controlPoint && data.controlPoint.value){
					return getLightStatus(data);
				}
			}
		}

		var result = makeModeObj(data.modes, data.operations);
		if(!result) return "-";

		var operObj = result.oper;

		if(operObj["AirConditioner.Indoor.General"] == "On"
		   || operObj["AirConditioner.Indoor.DHW"] == "On"
		   || operObj["AirConditioner.Indoor.Ventilator"] == "On"
		   || operObj["AirConditioner.Outdoor"] == "On"
		   || operObj["General"] == "On") { //ControlPoint, Light, Meter On 추가
			return "Normal.On";
		}

		return "Normal.Off";
	};


	/**
	*
	*   <ul>
	*   <li>representativeStatus로 기기의 ON/OFF 정보를 가져온다</li>
	*   <li>N/W사 기기 정보에서 representativeStatus 어트리뷰트가 다시 추가되어 추가된 이력이 있으나, getStatus()로 통합됨.</li>
	*   </ul>
	*   @function getRepresentativeStatus
	*   @param {Object} data - 기기 정보 (/dms/devices [GET]을 통하여 가져온 데이터)
	*   @returns {String} - 현재 기기 상태 {"Normal.On", "Normal.Off"}
	*   @alias module:app/core/util
	*
	*/
	var getRepresentativeStatus = function(data){
		var status = data.representativeStatus || data.dms_devices_representativeStatus;
		if(status == "Normal"){
			//ControlPoint의 경우 전원 상태가 표시되어야 하므로 분기 (2018-08-30)
			if (data.mappedType === "ControlPoint") {
				var result = makeModeObj(data.modes, data.operations);
				if(!result) return "-";

				var operObj = result.oper;

				if(operObj["AirConditioner.Indoor.General"] == "On"
				   || operObj["AirConditioner.Indoor.DHW"] == "On"
				   || operObj["AirConditioner.Indoor.Ventilator"] == "On"
				   || operObj["AirConditioner.Outdoor"] == "On"
				   || operObj["General"] == "On") { //ControlPoint, Light, Meter On 추가
					return "Normal.On";
				}

				return "Normal.Off";
			} else if (data.mappedType === "Light" && (data.type.indexOf("DI") != -1 || data.type.indexOf("DO") != -1)) {	//Light value에 따른 분기 추가 (2018-11-13)
				if (data.controlPoint.value == 1) {
					return "Normal.On";
				}
				return "Normal.Off";
			}
			//Beacon 및 Asset 은 Off가 존재하지 않음.
			//Normal은 UI에서 Normal On으로 인식하여, 표시한다. (초록색)
			return "Normal.On";
			//return getNormalStatus(data);
		}
		return status;
	};

	/**
	*
	*   <ul>
	*   <li>자산의 상태 정보를 가져온다.</li>
	*   <li>N/W사 Service-Asset 기능으로 인하여 추가된 이력이 있으나, getStatus()로 통합됨.</li>
	*   </ul>
	*   @function getAssetStatus
	*   @param {Object} data - 자산 정보 (/assets [GET]을 통하여 가져온 데이터)
	*   @returns {String} - 현재 기기 상태 {"Normal.On", "Normal.Off", "Alarm.Critical", "Alarm.Warning"}
	*   @alias module:app/core/util
	*
	*/
	var getAssetStatus = function(data){
		var value = "-";
		var devices = data.devices;
		if(devices && devices[0]){
			var status, statuses = [], i, max = devices.length;
			for( i = 0; i < max; i++ ){
				status = getRepresentativeStatus(devices[i]);
				statuses.push(status);
			}
			if(statuses.indexOf("Alarm.Critical") != -1){
				return "Alarm.Critical";
			}else if(statuses.indexOf("Alarm.Warning") != -1){
				return "Alarm.Warning";
			}
			return "Normal.On";
		}
		value = "Normal.On";
		return value;
	};

	/**
	*
	*   <ul>
	*   <li>상태 정보를 디국어가 적용된 Text로 변환한다.</li>
	*   </ul>
	*   @function getStatusI18N
	*   @param {String} status - 기기 상태 정보
	*   @returns {String} - 다국어가 적용된 기기 상태 정보
	*   @alias module:app/core/util
	*
	*/
	var getStatusI18N = function(status){
		var I18N = window.I18N;
		var i18nStatus = status.replace(/\(/g, "_").replace(/\)/g, "");
		i18nStatus = I18N.prop("FACILITY_DEVICE_STATUS_POPUP_" + i18nStatus.toUpperCase());
		i18nStatus = i18nStatus ? i18nStatus : status;
		return i18nStatus;
	};

	/**
	*
	*   <ul>
	*   <li>실내기의 대표 Mode 값을 가져온다</li>
	*   </ul>
	*   @function getDisplayMode
	*   @param {Array} modes  - 실내기의 modes 리스트
	*   @param {Array} operations  - 실내기의 operations 리스트
	*   @param {Boolean} isDetail  - 상세 팝업에 표시 여부
	*   @returns {Object} - 실내기의 대표 모드 값
	*   @alias module:app/core/util
	*
	*/
	var getDisplayMode = function(modes, operations, isDetail){
		var result = makeModeObj(modes, operations);
		var operObj = result.oper;
		var modeObj = result.mode;

		if(!operObj && !modeObj) return;

		if(modeObj["AirConditioner.Indoor.General"] && modeObj["AirConditioner.Indoor.DHW"]){
			if(isDetail) {
				return modeObj["AirConditioner.Indoor.General"] + ", " + modeObj["AirConditioner.Indoor.DHW"];
			}
			if(operObj["AirConditioner.Indoor.General"] == "On" && operObj["AirConditioner.Indoor.DHW"] == "Off") {
				return modeObj["AirConditioner.Indoor.General"];
			}
			return modeObj["AirConditioner.Indoor.DHW"];
		} else if(modeObj["AirConditioner.Indoor.General"] && modeObj["AirConditioner.Indoor.Ventilator"]){
			if(isDetail) {
				return modeObj["AirConditioner.Indoor.Ventilator"] + ", " + modeObj["AirConditioner.Indoor.General"];
			}
			return modeObj["AirConditioner.Indoor.Ventilator"];
		} else if(modeObj["AirConditioner.Indoor.DHW"]){
			return modeObj["AirConditioner.Indoor.DHW"];
		} else if(modeObj["AirConditioner.Indoor.Ventilator"] || modeObj["AirConditioner.Ventilator"]){
			return modeObj["AirConditioner.Indoor.Ventilator"] || modeObj["AirConditioner.Ventilator"];
		} else if(modeObj["AirConditioner.Indoor.General"]){
			return modeObj["AirConditioner.Indoor.General"];
		} else if(modeObj["AirConditioner.Outdoor"]){
			return modeObj["AirConditioner.Outdoor"];
		}
	};

	/**
	*
	*   <ul>
	*   <li>실내기, 실외기의 Mode 값을 다국어로 변환한다.</li>
	*   </ul>
	*   @function getMoeToI18N
	*   @param {String} mode  - Mode 값
	*   @returns {String} - 다국어로 전환된 Mode 값 Text
	*   @alias module:app/core/util
	*
	*/
	var getModeToI18N = function(mode){
		var I18N = window.I18N;
		var locale, i18nMode;
		var split = mode.split(", ");
		var length = split.length;
		var displayText = "";
		if(length > 1){
			var i;
			for( i = 0; i < length; i++ ){
				i18nMode = split[i];
				i18nMode = i18nMode.toUpperCase();
				locale = I18N.prop("FACILITY_INDOOR_MODE_" + i18nMode);
				locale = locale ? locale : mode;
				displayText += locale;
				if(i != length - 1){
					displayText += ", ";
				}
			}
		}else{
			i18nMode = mode.toUpperCase();
			locale = I18N.prop("FACILITY_INDOOR_MODE_" + i18nMode);
			displayText = locale ? locale : mode;
		}
		return displayText;
	};

	/**
	*
	*   <ul>
	*   <li>실내기, 실외기의 대표 모드를 얻어 다국어로 변환한다.</li>
	*   <li>getDisplayMode(), getModeToI18N() 함수를 호출한다.</li>
	*   </ul>
	*   @function getDisplayMoeToI18N
	*   @param {Array} modes  - 실내기, 실외기의 modes 리스트
	*   @param {Array} operations  - 실내기, 실외기의 operations 리스트
	*   @param {Boolean} isDetail  - 상제 팝업 표시 여부
	*   @param {String} delimeter  - 모드가 다수 개일 경우 구분자로 표시할 텍스트
	*   @returns {String} - 다국어로 전환된 대표 Mode 값 Text
	*   @alias module:app/core/util
	*
	*/
	var getDisplayModeI18N = function(modes, operations, isDetail, delimeter){
		var mode = getDisplayMode(modes, operations, isDetail);
		mode =  getModeToI18N(mode);
		if(delimeter){
			mode = mode.split(", ");
			mode = mode.join(delimeter);
		}
		return mode;
	};

	//deprecated
	var getIndoorType = function(data){
		if(!data || !data.modes){
			return "";
		}

		var mode, modes = data.modes;
		var i, max = modes.length;
		var result = {};
		for( i = 0; i < max; i++ ){
			mode = modes[i];
			result[mode.id] = mode.mode;
		}
		if(result["AirConditioner.Indoor.General"] && result["AirConditioner.Indoor.Ventilator"]){
			return "AirConditioner.Indoor.Ventilator";
		}else if(result["AirConditioner.Indoor.DHW"]){
			return "AirConditioner.Indoor.DHW";
		}else if(result["AirConditioner.Indoor.General"]){
			return "AirConditioner.Indoor.General";
		}else if(result["AirConditioner.Indoor.Ventilator"]){
			return "AirConditioner.Indoor.Ventilator";
		}
		return "";
	};

	/**
	*   <ul>
	*   <li>단위 별, 단위에 해당하는 문자열을 Key/Value로 유지하는 객체</li>
	*   <li>(e.g : {"Celsius : "°C""})</li>
	*   <li>Fahrenheit, Celsius, Gas, Watthour, Water, Humidity의 단위 표시 문자열이 존재한다.</li>
	*
	*   @type {Object}
	*   @name CHAR
	*   @memberof module:app/core/util
	*   @alias module:app/core/util
	*
	*/
	var CHAR = {
		Fahrenheit : "℉",
		Celsius : "°C",
		Gas : "m³",
		WattHour : "kWh",
		Water : "L",
		Humidity : "%"
	};

	/**
	*
	*   <ul>
	*   <li>섭씨 온도 값을 화씨 온도 단위로 변환한다.</li>
	*   </ul>
	*   @function getFahrenheit
	*   @param {Number} celsius  - 섭씨 온도 값
	*   @param {Boolean} hasUnit  - 단위를 븥여 값을 리턴할지의 여부
	*   @returns {String} - 화씨로 변환된 온도 값
	*   @alias module:app/core/util
	*
	*/
	var getFahrenheit = function(celsius, hasUnit){
		var value = celsius * 1.8 + 32;
		value = value.toFixed(1);
		if(hasUnit){
			value += CHAR.Fahrenheit;
		}
		return value;
	};

	/**
	*
	*   <ul>
	*   <li>화씨 온도 값을 섭씨 온도 단위로 변환한다.</li>
	*   </ul>
	*   @function getCelsius
	*   @param {Number} fahrenheit  - 화씨 온도 값
	*   @param {Boolean} hasUnit  - 단위를 븥여 값을 리턴할지의 여부
	*   @returns {String} - 섭씨로 변환된 온도 값
	*   @alias module:app/core/util
	*
	*/
	var getCelsius = function(fahrenheit, hasUnit){
		var value = (fahrenheit - 32) / 1.8;
		value = value.toFixed(1);
		if(hasUnit){
			value += CHAR.Celsius;
		}
		return value;
	};

	/**
	*
	*   <ul>
	*   <li>현재 공통 설정에 설정된 온도 단위에 따라 온도 값를 변환한다.</li>
	*   </ul>
	*   @function getTemperature
	*   @param {Number} value  - 온도 값
	*   @param {Boolean} hasUnit  - 단위를 븥여 값을 리턴할지의 여부
	*   @returns {String} - 현재 공통 설정에 설정된 온도 단위로 변환된 온도 값
	*   @alias module:app/core/util
	*
	*/
	var getTemperature = function(value, hasUnit){
		var Settings = window.GlobalSettings;
		var unit = Settings.getTemperature().unit;
		if(unit == "Fahrenheit"){
			return getFahrenheit(value, hasUnit);
		}
		return getCelsius(value, hasUnit);
	};

	//deprecated
	var parseLocation = function(location){
		if(!location){
			return {};
		}
		var split = location.split(", ");
		var building = split[0] ? split[0] : "";
		var floor = split[1] ? split[1] : "";
		var type = "";
		if(floor){
			if(floor.indexOf("B") != -1){
				type = "B";
			}else if(floor.indexOf("F") != -1){
				type = "F";
			}else{
				type = "None";
			}
			floor = floor.replace(type, "");
		}
		var zone = split[2] ? split[2] : "";
		return {
			foundation_space_buildings_name : building,
			foundation_space_floors_name : floor,
			foundation_space_floors_type : type,
			foundation_space_zones_name : zone
		};
	};

	/**
	*
	*   <ul>
	*   <li>Alarm Code를 다국어가 적용된 Description으로 변환한다.</li>
	*   </ul>
	*   @function getAlarmDescription
	*   @param {String} name  - 알람 코드
	*   @param {String} arg  - properties에 인자를 표시할 경우, 인자를 전달하여 호출한다.
	*   @returns {String} - 다국어가 적용된 Description Text
	*   @alias module:app/core/util
	*
	*/
	var getAlarmDescription = function(name, arg){
		var I18N = window.I18N;
		var text = I18N.prop("ALARM_CODE_" + name, arg);
		text = text ? text : "-";
		return text;
	};

	/**
	*
	*   <ul>
	*   <li>System Log Code를 다국어가 적용된 Description으로 변환한다.</li>
	*   </ul>
	*   @function getSystemLogOperationType
	*   @param {String} name  - System Log 코드
	*   @param {String} arg  - properties에 인자를 표시할 경우, 인자를 전달하여 호출한다.
	*   @returns {String} - 다국어가 적용된 Description Text
	*   @alias module:app/core/util
	*
	*/
	var getSystemLogOperationType = function(name, arg){
		var I18N = window.I18N;
		var text = I18N.prop("SYSTEM_LOG_TYPE_" + name, arg);
		text = text ? text : "-";
		return text;
	};

	/**
	*
	*   <ul>
	*   <li>Alarm의 Event Time 속성을 moment.js 를 통해 Display Text로 변환한다. (e.g : 2017-04-13 13:24:13)</li>
	*   </ul>
	*   @function setAlarmEventTime
	*   @param {Object} data  - Alarm 정보
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/util
	*
	*/
	var setAlarmEventTime = function(data){
		var time = data.timestamp || data.eventTime;
		if(time){
			data.eventTime = moment(time).format("LLL");
		}
	};

	/**
	*
	*   <ul>
	*   <li>Alarm의 name 속성을 description으로 변경한다.</li>
	*   <li>Rule Alarm일 경우 description으로 변경한다.</li>
	*   <li>다른 Alarm일 경우 다국어가 적용된 description으로 변경한다.</li>
	*   </ul>
	*   @function setAlarmDescription
	*   @param {Object} data  - Alarm 정보
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/util
	*
	*/
	var setAlarmDescription = function(data){
		if(data.name){
			//Rule Alarm Description 처리
			data.code = data.name;
			if(data.name.indexOf("Rule") != -1){
				data.isRule = true;
				data.name = data.description;
			}else{
				data.isRule = false;
				data.name = getAlarmDescription(data.name);
			}
		}
	};

	/**
	*
	*   <ul>
	*   <li>Alarm의 location 속성이 Object일 경우, Alarm 정보에 desciption, foundation_space_buildings_id, foundation_space_floors_id, foundation_space_zones_id 속성으로 할당한다.</li>
	*   </ul>
	*   @function setAlarmLocation
	*   @param {Object} data  - Alarm 정보
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/util
	*
	*/
	var setAlarmLocation = function(data){
		var location = data.location;
		if(location){
			if(typeof location == "object"){
				data.location = location.description;
				data.foundation_space_buildings_id = location.foundation_space_buildings_id;
				data.foundation_space_floors_id = location.foundation_space_floors_id;
				data.foundation_space_zones_id = location.foundation_space_zones_id;
			}
		}else{
			data.location = "-";
		}
	};

	/**
	*
	*   <ul>
	*   <li>Alarm 정보를 Front-end에서 사용하게 하기 위하여 변환한다.</li>
	*   <li>setAlarmEventTime(), setAlarmDescription(), setAlarmLocation()을 호출한다.</li>
	*   </ul>
	*   @function setAlarmData
	*   @param {Object} data  - Alarm 정보
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/util
	*
	*/
	var setAlarmData = function(data){
		setAlarmEventTime(data);
		setAlarmDescription(data);
		setAlarmLocation(data);
	};

	/**
	*
	*   <ul>
	*   <li>제어 이력 정보의 키 값을 다국어가 적용된 Description으로 변환한다.</li>
	*   </ul>
	*   @function getHistoryOperation
	*   @param {String} name  - 제어 이력 키 값
	*   @returns {String} - 다국어가 적용된 Description
	*   @alias module:app/core/util
	*
	*/
	var getHistoryOperation = function(name){
		var I18N = window.I18N;
		var text = I18N.prop("FACILITY_HISTORY_OPERATION_" + name);
		text = text ? text : name;
		return text;
	};

	/**
	*
	*   <ul>
	*   <li>제어 이력 정보의 키 값을 다국어가 적용된 Description으로 변환한다.</li>
	*   </ul>
	*   @function getHistoryOperationValue
	*   @param {String} name  - 제어 이력 키 값
	*   @param {String} arg  - 가변 텍스트에 적용할 인자
	*   @returns {String} - 다국어가 적용된 Description
	*   @alias module:app/core/util
	*
	*/
	var getHistoryOperationValue = function(name, arg) {
		var I18N = window.I18N;
		var text = I18N.prop(name, arg);
		text = text ? text : name;
		return text;
	};

	/**
	*
	*   <ul>
	*   <li>24시간 형식의 시간 값을 12시간의 AM, PM 형식으로 변환한다.</li>
	*   </ul>
	*   @function convertAmPm
	*   @param {String} time  - 시간 값 (e.g : "14:30:00")
	*   @returns {String} - AM/PM이 적용된 시간 값 (e.g : "PM 02:30")
	*   @alias module:app/core/util
	*
	*/
	// 시간 am/pm 형식 변경 함수
	function convertAmPm(time){
		if(time.indexOf("AM") != -1 || time.indexOf("PM") != -1){
			return time;
		}
		var result, ampm, h, m;
		var tmp = time.split(":");
		h = tmp[0];
		m = tmp[1];

		if(h <= 11 && h >= 0){
			ampm = "AM";
		}else if(h >= 12 && h <= 23){
			ampm = "PM";
			if(h > 12){
				h = h - 12;
			}
		}
		if((h + "").length < 2){
			h = "0" + h;
		}

		result = ampm + " " + h + ":" + m;
		return result;
	}

	/**
	*
	*   <ul>
	*   <li>날짜/시간 값을 moment.js를 통하여 HH:mm:ss 형식으로 변환한다.</li>
	*   </ul>
	*   @function convertTimeFormat
	*   @param {String} date  - UTC 날짜/시간 값
	*   @returns {String} - "HH:mm:ss" 형식으로 변환된 시간 값 Text(e.g : "14:30:00")
	*   @alias module:app/core/util
	*
	*/
	function convertTimeFormat(date){
		var result = moment(date).format("HH:mm:ss");
		return result;
	}
	/**
	*
	*   <ul>
	*   <li>날짜/시간 값을 moment.js를 통하여 "YYYY-MM-DD HH:mm:ss" 형식으로 변환한다.</li>
	*   </ul>
	*   @function convertDateFormat
	*   @param {String} date  - UTC 날짜/시간 값
	*   @returns {String} - "YYYY-MM-DD HH:mm:ss" 형식으로 변환된 시간 값 Text(e.g : "2017-10-27 14:30:00")
	*   @alias module:app/core/util
	*
	*/
	function convertDateFormat(date){
		var result = moment(date).format("L").replace(/\./g, "-");
		return result;
	}

	/**
	*
	*   <ul>
	*   <li>AM/PM 12시간 형식의 시간 값을 24시간 형식의 시간 값으로 변경한다.</li>
	*   </ul>
	*   @function convertFullHours
	*   @param {String} time  - AM/PM이 포함된 시간 값(e.g : "PM 02:30:00")
	*   @returns {String} - 24시간 형식으로 변환된 시간 값 Text(e.g : "14:30:00")
	*   @alias module:app/core/util
	*
	*/
	function convertFullHours(time){
		if(time.indexOf("AM") == -1 && time.indexOf("PM") == -1){
			return time;
		}

		time = time.split(" ");
		var amPm = time[0];
		var hour = time[1];
		hour = hour.split(":");

		if(amPm == "PM"){
			hour[0] = (Number(hour[0]) + 12);
		}
		return hour[0] + ":" + hour[1] + ":00";
	}

	/**
	*
	*   <ul>
	*   <li>Polygon의 coordinates 좌표 값을 저장할 때, 첫번째 좌표 값과 동일한 값을 가지는 마지막 좌표 값을 삭제한다.</li>
	*   <li>해당 좌표 값은 API 호출하여 DB 저장 시에는 필요한 값이나 SVG 렌더링 시에는 불필요한 값이기 때문이다.</li>
	*   </ul>
	*   @function removeSameLastPoint
	*   @param {Array} coordinate  - Polygon(주로 Zone)의 좌표 값
	*   @returns {Array} - 마지막 좌표 값이 삭제된 좌표 값
	*   @alias module:app/core/util
	*
	*/
	var removeSameLastPoint = function(coordinate){
		var length = coordinate.length;
		var firstPoint = coordinate[0];
		var lastPoint = coordinate[length - 1];
		if(firstPoint[0] == lastPoint[0]
			&& firstPoint[1] == lastPoint[1]){
			coordinate.pop();
		}
	};

	var getRealZoneCoordinate = function(coordinate){
		if(coordinate && coordinate[0]){
			coordinate = coordinate[0];
			//remove last point for geoJSON.
			return removeSameLastPoint(coordinate);
		}
	};

	/**
	*
	*   <ul>
	*   <li>Polygon(Zone)의 좌표 값을 통해 중앙 좌표 값을 얻는다.</li>
	*   </ul>
	*   @function getZoneCenterCoordinate
	*   @param {Array} coordinate  - Polygon(주로 Zone)의 좌표 값
	*   @returns {Array} - Polygon(Zone)의 중앙 좌표 값
	*   @alias module:app/core/util
	*
	*/
	var getZoneCenterCoordinate = function(coordinate){
		coordinate = getRealZoneCoordinate(coordinate);
		return getCentroid(coordinate);
	};

	/**
	*
	*   <ul>
	*   <li>기기 등록 시, 기기의 기본 좌표 값을 설정한다.</li>
	*   </ul>
	*   @function setAutoLocation
	*   @param {Object} result - 등록될 기기 정보
	*   @param {kendojQueryWidget} registrationMapWidget  - Map View Widget 인스턴스
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/util
	*
	*/
	var setAutoLocation = function(result, registrationMapWidget){
		if(!result){
			return;
		}

		/*if(result.registrationStatuses && result.registrationStatuses == "NotRegistered"){
			return;
		}*/

		var MainWindow = window.MAIN_WINDOW;
		var floorData = MainWindow.getCurrentFloor();
		var building = floorData.building;
		var floor = floorData.floor;
		var isAsset = false;
		if(typeof result.assets_types_id !== 'undefined'){
			isAsset = true;
		}
		var location;
		if(isAsset){
			location = result.location;
			if(!location){
				result.location = {};
				location = result.location;
			}
		}else{
			if(!result.locations){
				result.locations = [];
			}

			if(!result.locations[0]){
				result.locations.push({});
			}

			location = result.locations[0];
			if(!location.id){
				location.id = "Fixed";
			}
		}

		if(!location.foundation_space_buildings_id && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			location.foundation_space_buildings_id = building.id;
		}

		if(!location.foundation_space_floors_id && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			location.foundation_space_floors_id = floor.id;
		}

		//null 이거나 undefined의 경우는 상세 조회 팝업에서 빌딩/층 선택 후 Zone을 선택하지 않았을 경우에 해당함.
		if(location.foundation_space_zones_id === null || typeof location.foundation_space_zones_id == 'undefined'){
			var point = {
				type : "Point",
				coordinates : null
			};
			var mapWidget = registrationMapWidget;
			var centerPoint, centerZoneId;
			if(!mapWidget){
				console.error("there is no map widget it's not possible to get center zone.");
				return;
			}
			//Zone이 없고 좌표 또한 없을 경우 Map의 중앙 좌표 값 적용
			if(!location.geometry && !result.nameDisplayCoordinate){	//기기 정보 텍스트 박스 이동이 아닐 경우에만 적용
				centerPoint = mapWidget.getCenter();
				point.coordinates = centerPoint;
				location.geometry = point;
			}

			/*중앙 Zone에 포함여부를 알기 위해서는 현재 선택한 층과 같은 층일 때 밖에 체크 못함. (Map View를 참조하기때문)*/
			if(location.foundation_space_floors_id == floor.id){
				centerZoneId = mapWidget.getCenterZoneId();
				if(centerZoneId){
					location.foundation_space_zones_id = Number(centerZoneId);
				}
			}else{	//기기 정보 텍스트 박스 이동이 아닐 경우에만 적용
				/**/
				/*Zone이 없고 다른 층 이동 시에 Map의 중앙 좌표 값 적용*/
				centerPoint = mapWidget.getCenter();
				point.coordinates = centerPoint;
				location.geometry = point;
			}
			if(!isAsset){
				location.foundation_space_zones_id = 0;
			}
		}
	};

	/**
	*
	*   <ul>
	*   <li>서버로부터 설치된 기기 타입 리스트를 가져와 저장한다.</li>
	*   </ul>
	*   @function getInstalledTypesFromServer
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/util
	*
	*/
	var getInstalledTypesFromServer = function(){
		return $.ajax({
			url : "/dms/devices/installedTypes"
		}).then(function(data){
			if(data && data.dms_devices_types){

				installedTypes = data.dms_devices_types;
				var i, max, mappedType, mappedTypes = data.dms_devices_mappedTypes;
				//installedTypes = installedTypes.concat(mappedTypes);

				//중복 체크하여 mappedType을 추가
				if(mappedTypes && mappedTypes.length > 0){
					max = mappedTypes.length;
					for( i = 0; i < max; i++ ){
						mappedType = mappedTypes[i];
						if(installedTypes.indexOf(mappedType) == -1){
							installedTypes.push(mappedType);
						}
					}
				}

				installedTypes.sort();
			}
		});
	};

	/**
	*
	*   <ul>
	*   <li>현재 저장된 설치된 기기 타입 리스트를 가져온다.</li>
	*   </ul>
	*   @function getInstalledTypeList
	*   @returns {Array} - 설치된 기기 타입 리스트
	*   @alias module:app/core/util
	*
	*/
	var getInstalledTypeList = function(){
		return installedTypes;
	};

	/**
	*
	*   <ul>
	*   <li>상위 기기타입의 하위 기기타입이 설치되어 있는지 체크한다.</li>
	*   </ul>
	*   @function checkInstalledSubType
	*   @returns {Boolean} - 설치된 기기 타입 존재 여부
	*   @param {Object} type - 상위 기기타입
	*   @param {Boolean} allowEmpty - 설치된 기기 타입 리스트가 존재하지 않는 것을 허용하는지의 여부
	*   @alias module:app/core/util
	*
	*/
	var checkInstalledSubType = function(type, allowEmpty){
		var i, installedType, max = installedTypes.length;
		if(max == 0 && !allowEmpty){
			return true;
		}
		for( i = 0; i < max; i++ ){
			installedType = installedTypes[i];
			if(installedType.indexOf(type + ".") != -1){
				return true;
			}
		}
		return false;
	};

	/**
	*
	*   <ul>
	*   <li>기기 타입이 설치되어 있는지 체크한다.</li>
	*   </ul>
	*   @function isInstalledType
	*   @returns {Boolean} - 설치된 기기 타입 존재 여부
	*   @param {Object} type - 기기 타입
	*   @param {Object} allowEmpty - 설치된 기기 타입 리스트가 존재하지 않는 것을 허용하는지의 여부
	*   @param {Boolean} isOnlyTempHumi - 온/습도 센서 기기 타입의 설치 여부를 Sensor.Temperature_Humidty 값으로만 체크하는지의 여부
	*   @alias module:app/core/util
	*
	*/
	var isInstalledType = function(type, allowEmpty, isOnlyTempHumi){
		//Length가 0인 경우는 최초 아무것도 설치되지 않은 상태로 해당 Case에 대한 예외처리를 한다.
		if(installedTypes.length == 0 && !allowEmpty){
			return true;
		}

		if(installedTypes.indexOf(type) != -1){
			return true;
		}

		/*SAC Indoor 전체에 대한 설치 정보. 하나라도 있으면 존재하는 것으로 true*/
		if(type.indexOf("AirConditioner") != -1){
			var i, installedType, max = installedTypes.length;
			for( i = 0; i < max; i++ ){
				installedType = installedTypes[i];
				if(installedType.indexOf("AirConditioner.") != -1){
					return true;
				}
			}
		}

		/*ControlPoint 전체에 대한 설치 정보. 하나라도 있으면 존재하는 것으로 true*/
		if(type == "ControlPoint"){
			return checkInstalledSubType("ControlPoint", allowEmpty);
		}

		/*Meter 전체에 대한 설치 정보. 하나라도 있으면 존재하는 것으로 true*/
		//Energy Consumption/Target 시, 설치된 Meter Type만 보여야함. 주석처리. by dragon
		if(type == "Meter"){
			return checkInstalledSubType("Meter", allowEmpty);
		}

		/*Sensor 전체에 대한 설치 정보. 하나라도 있으면 존재하는 것으로 true*/
		if(type == "Sensor"){
			return checkInstalledSubType("Sensor", allowEmpty);
		}

		if(type == "AirConditionerController"){
			return checkInstalledSubType("AirConditionerController", allowEmpty);
		}

		//Temperature Humidity의 경우 Temperature 나 Humidity 둘 중 하나라도 있으면 True
		if(type == "Sensor.Temperature_Humidity"){
			if(!isOnlyTempHumi){
				if(installedTypes.indexOf("Sensor.Temperature") != -1
				  || installedTypes.indexOf("Sensor.Humidity") != -1){
					return true;
				}
			}
		}

		return false;
	};

	/**
    *
    *   <ul>
    *   <li>해당 기기타입이 에너지 분배를 지원하는 기기타입인지 체크 한다.</li>
    *   </ul>
    *   @function isSupportEnergyDistributionType
    *   @returns {Boolean} - 에너지 분배 지원 여부
    *   @param {String} indoorUnitType - 기기 타입
    *   @alias module:app/core/util
    *
    */
	var isSupportEnergyDistributionType = function(indoorUnitType) {
		//에너지 분배를 지원하는 실내기 서브 타입.
		var supportEnergyDistributionTypes = [
			"AirConditioner.Indoor.Cassette1Way",
			"AirConditioner.Indoor.Cassette2Way",
			"AirConditioner.Indoor.Cassette4Way",
			"AirConditioner.Indoor.Cassette360",
			"AirConditioner.Indoor.Ceiling",
			"AirConditioner.Indoor.Console",
			"AirConditioner.Indoor.Bottom",
			"AirConditioner.Indoor.PAC",
			"AirConditioner.Indoor.AHU",
			"AirConditioner.Indoor.Duct",
			"AirConditioner.Indoor.DuctFresh",
			"AirConditioner.Indoor.FCU.Cassette1Way",
			"AirConditioner.Indoor.FCU.Cassette2Way",
			"AirConditioner.Indoor.FCU.Cassette4Way",
			"AirConditioner.Indoor.FCU.Cassette360"
		];
		var i, max = supportEnergyDistributionTypes.length;
		for(i = 0; i < max; i++) {
		    if( indoorUnitType == supportEnergyDistributionTypes[i]) return true;
		}
		return false;
	};

	/**
	*
	*   <ul>
	*   <li>층 정보로 부터 Display되는 층 이름을 가져온다</li>
	*   <li>F는 뒤 에 표시되며, B는 앞에 표시된다. None은 표시되지 않는다.</li>
	*   </ul>
	*   @function getFloorName
	*   @returns {String} - 층 이름
	*   @param {Object} floor - 층 정보(/foundation/space/floors [GET]에서 가져온 데이터)
	*   @alias module:app/core/util
	*
	*/
	var getFloorName = function(floor){
		var name = floor.name;
		var type = floor.type;
		if(type == "F"){
			name = name + type;
		}else if(type == "B"){
			name = type + name;
		}else if(!name){
			name = "-";
		}
		return name;
	};

	var getQueryFromFloor = function(floorData, isOnlyBuilding, isOnlyFloor, attr){
		var query = "?";
		var MainWindow = window.MAIN_WINDOW;
		if(floorData){
			var buildingId = floorData.building.id;
			var floorId = floorData.floor.id;

			if(isOnlyFloor){
				if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID
				   && floorId && floorId == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
					query += "foundation_space_buildings_id=" + buildingId + "&";
				}
			}else if(buildingId && buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
				query += "foundation_space_buildings_id=" + buildingId + "&";
			}

			if(!isOnlyBuilding){
				if(floorId && floorId != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
					query += "foundation_space_floors_id=" + floorId + "&";
				}
			}
		}

		if(attr && attr.length > 0){
			query += ("attributes=" + attr.join(","));
		}
		return query;
	};


	//Normal Off가 존재하지 않는 기기 타입
	var onlyNormalType = ["Sensor.Temperature", "Sensor.Temperature_Humidity","Sensor.Humidity", "Meter.WattHour",
		"Meter.Gas", "Meter.Calori", "Meter.Water", "Beacon", "Sensor.Motion", "CCTV", "Gateway"];

	/**
	*
	*   <ul>
	*   <li>Normal.Off, Normal.On이 아닌 Normal로 표시되어야 하는 타입인지 체크한다.</li>
	*   </ul>
	*   @function isOnlyNormalType
	*   @param {Object} data - 기기 정보
	*   @returns {Boolean} - Normal로 표시되는 기기 타입인지의 여부
	*   @alias module:app/core/util
	*
	*/
	var isOnlyNormalType = function(data){
		var type = data.type;
		var mappedType = data.mappedType;
		type = mappedType || type;

		if(typeof data.assets_types_id !== 'undefined'){
			return true;
		}

		if(onlyNormalType.indexOf(type) != -1){
			return true;
		}
		return false;
	};

	//deprecated
	var networkDeviceType = ["Gateway", "CCTV", "Beacon"];
	var isNetworkDevice = function(data){
		if(typeof data.assets_types_id !== 'undefined'){
			return true;
		}
		var type = data.type;
		if(type && networkDeviceType.indexOf(type) != -1){
			return true;
		}
		return false;
	};

	/**
	*
	*   <ul>
	*   <li>기기 또는 자산의 위치 타입을 가져온다.</li>
	*   </ul>
	*   @function getPositionType
	*   @param {Object} data - 기기 정보 또는 자산 정보
	*   @returns {String} - "Fixed" 또는 "Movable"
	*   @alias module:app/core/util
	*
	*/
	var getPositionType = function(data){
		if(typeof data.assets_types_id !== 'undefined'){
			return data.mobilityType;
		}
		return getBeaconPositionType(data);
	};

	/**
	*
	*   <ul>
	*   <li>비콘의 위치 타입을 가져온다.</li>
	*   </ul>
	*   @function getBeaconPositionType
	*   @param {Object} data - 기기 정보
	*   @returns {String} - "Fixed" 또는 "Movable"
	*   @alias module:app/core/util
	*
	*/
	var getBeaconPositionType = function(data){
		var val = "-";
		var conf = data.configuration;
		if(conf && conf.mobilityType){
			val = conf.mobilityType;
			val = val ? val : "-";
		}
		return val;
	};

	/**
	*
	*   <ul>
	*   <li>비콘의 위치 타입에 해당하는 locations 객체를 가져온다.</li>
	*   </ul>
	*   @function  getBeaconTypeLocation
	*   @param {Object} data - 기기 정보
	*   @param {String} type - "Fixed" 또는 "Movable"
	*   @returns {Object} - "Fixed" 또는 "Mesaured"에 해당하는 locations 객체
	*   @alias module:app/core/util
	*
	*/
	var getBeaconTypeLocation = function(data, type){
		var id;
		if(type == "Fixed"){
			id = type;
		}else if(type == "Movable"){
			id = "Measured";
		}else{
			return {};
		}
		return getBeaconLocation(data, id);
	};

	/**
	*
	*   <ul>
	*   <li>비콘의 위치 타입에 해당하는 locations 객체를 가져온다.</li>
	*   </ul>
	*   @function  getBeaconLocation
	*   @param {Object} data - 기기 정보
	*   @param {String} id - "Fixed" 또는 "Mesured"
	*   @returns {Object} - "Fixed" 또는 "Mesaured"에 해당하는 locations 객체
	*   @alias module:app/core/util
	*
	*/
	var getBeaconLocation = function(data, id){
		var locations = data.locations;
		if(typeof data.assets_types_id !== 'undefined' && data.devices && data.devices[0]){
			locations = data.devices[0].dms_devices_locations;
		}
		if(locations && locations[0]){
			var i, max = locations.length;
			for( i = 0; i < max; i++ ){
				if(locations[i].id == id){
					return locations[i];
				}
			}
		}
		return {};
	};

	/**
	*
	*   <ul>
	*   <li>XSS 방어를 위하여 치환된 < 와 > 문자열을 HTML에 정상적으로 표시하기위하여 재치환한다.</li>
	*   <li>DOM에 표시되는 Text에 대하여 문자열을 치환하기 위한 함수이다.</li>
	*   </ul>
	*   @function  decodeHtml
	*   @param {String} html - HTML String
	*   @returns {String} - 문자열이 치환된 HTML String
	*   @alias module:app/core/util
	*
	*/
	var decodeHtml = function(html){
		if(!html){
			return html;
		}
		return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	};

	/**
	*
	*   <ul>
	*   <li>Schedule에서 모드 값을 다국어가 적용된 Text로 HTML을 표시하기 위한 템플릿 함수</li>
	*   </ul>
	*   @function getScheduleMode
	*   @param {String} id - mode 객체의 id
	*   @param {String} mode - mode Text
	*   @returns {String} - HTML String
	*   @alias module:app/core/util
	*
	*/
	var getScheduleMode = function(id, mode){
		var subType = "";
		var html = "";
		var I18N = window.I18N;
		if(id.indexOf("Ventilator") != -1){
			subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_VENTILATOR") + ")";
		}else if(id.indexOf("DHW") != -1){
			subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_DHW") + ")";
		}
		id = getDetailDisplayTypeDeviceI18N(id) + subType + " " + I18N.prop("FACILITY_DEVICE_SAC_INDOOR_MODE");
		mode = I18N.prop("FACILITY_INDOOR_MODE_" + mode.toUpperCase());
		html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + mode + '</div></div></dd>';
		return html;
	};

	/**
	*
	*   <ul>
	*   <li>Schedule에서 전원 값을 다국어가 적용된 Text로 HTML을 표시하기 위한 템플릿 함수</li>
	*   </ul>
	*   @function getScheduleOperation
	*   @param {String} id - operation 객체의 id
	*   @param {String} power - power Text
	*   @returns {String} - HTML String
	*   @alias module:app/core/util
	*
	*/
	var getScheduleOperation = function(id, power){
		var subType = "";
		var html = "";
		var I18N = window.I18N;
		if(id == "General"){
			id = getDetailDisplayTypeDeviceI18N("Light");
		}else{
			if(id.indexOf("Ventilator") != -1){
				subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_VENTILATOR") + ")";
			}else if(id.indexOf("DHW") != -1){
				subType = "(" + I18N.prop("FACILITY_DEVICE_TYPE_DHW") + ")";
			}
			id = getDetailDisplayTypeDeviceI18N(id);
		}
		id = id + subType + " " + I18N.prop("FACILITY_INDOOR_CONTROL_POWER");
		power = I18N.prop("FACILITY_DEVICE_STATUS_" + power.toUpperCase());
		html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + power + '</div></div></dd>';
		return html;
	};

	/**
	*
	*   <ul>
	*   <li>Schedule에서 조명 밝기 값을 다국어가 적용된 Text로 HTML을 표시하기 위한 템플릿 함수</li>
	*   </ul>
	*   @function getScheduleLight
	*   @param {Number} value - 조명 밝기 값
	*   @returns {String} - HTML String
	*   @alias module:app/core/util
	*
	*/
	var getScheduleLight = function(value){
		var I18N = window.I18N;
		var html = "";
		html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + " " + I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS") + '</span> :&nbsp;</div><div class="tbc">' + value + '</div></div></dd>';
		return html;
	};

	/**
	*
	*   <ul>
	*   <li>Schedule에서 온도 값을 다국어가 적용된 Text로 HTML을 표시하기 위한 템플릿 함수</li>
	*   </ul>
	*   @function getScheduleTemperatures
	*   @param {String} id - temperature 객체의 id 값
	*   @param {Number} desired - 설정 온도 값
	*   @returns {String} - HTML String
	*   @alias module:app/core/util
	*
	*/
	var getScheduleTemperatures = function(id, desired){
		var unit = window.GlobalSettings.getTemperature().unit;
		var html = "", subType = "";
		var I18N = window.I18N;
		if(id.indexOf("Room") != -1){
			subType = "(" + I18N.prop("FACILITY_INDOOR_SET_TEMPERATURE") + ")";
		}else if(id.indexOf("DHW") != -1){
			subType = "(" + I18N.prop("FACILITY_INDOOR_DHW_SET_TEMPERATURE") + ")";
		}else if(id.indexOf("WaterOutlet") != -1){
			subType = "(" + I18N.prop("FACILITY_INDOOR_WATER_OUT_SET_TEMP") + ")";
		}
		id = getDetailDisplayTypeDeviceI18N(id) + subType;
		html += '<dd class="dotText"><div class="tb"><div class="tbc"><span>' + id + '</span> :&nbsp;</div><div class="tbc">' + desired + '<span>' + CHAR[unit] + '</span></div></div></dd>';
		return html;
	};

	//XSS filter 코드
	//서버로부터 받은 값이 string인 경우에는 필터를 적용
	//다른 타입인 경우는 그대로 리턴
	//파라미터 level이 1인 경우는 방어에 방해되는 요소를 제거한 값을 리턴.
	var getValueFilteredForXSS = function(strTemp, level) {
		var type = typeof strTemp;

		if(type == "string") {
			if (typeof level == 'undefined' || level == 0) {
				strTemp = strTemp.replace(/\</g, "&lt;");
				strTemp = strTemp.replace(/\>/g, "&gt;");
			} else if (typeof level != 'undefined' && level == 1) {
				strTemp = strTemp.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g,"");
			}
		}

		return strTemp;
	};

	//에너지 미터 타입 사용 드랍다운리스트 dataSource
	var getEnergyMeterTypeList = function() {
		var I18N = window.I18N;
		var typeList = [
			{text : I18N.prop('ENERGY_METER_TYPE_WATTHOUR'), value : "Meter.WattHour"},
			{text : I18N.prop('ENERGY_METER_TYPE_GAS'), value : "Meter.Gas"},
			{text : I18N.prop('ENERGY_METER_TYPE_WATER'), value : "Meter.Water"}
		];

		//설치되지 않은 기기 타입 삭제
		var i, deviceType, max = typeList.length;
		for( i = max - 1; i >= 0; i-- ){
			deviceType = typeList[i];
			deviceType = deviceType.value;
			if(!(isInstalledType(deviceType, true))){
				typeList.splice(i, 1);
			}
		}
		return typeList;
	};

	//스케쥴, 제어로직 관련 전체 기기타입 드랍다운리스트 dataSource
	var getControllableDeviceTypeDataSource = function() {
		var I18N = window.I18N;
		var typeFilterDataSource = [
			{text : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"), value : "AirConditioner."},
			//{text : I18N.prop("FACILITY_DEVICE_TYPE_SAC_OUTDOOR"), value : "AirConditionerOutdoor"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_POINT"), value : "ControlPoint"},
			//{text : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"), value : "Meter"},
			//{text : I18N.prop("FACILITY_DEVICE_TYPE_TEMPERATURE_SENSOR"), value : "Sensor.Temperature"},
			//{text : I18N.prop("FACILITY_DEVICE_TYPE_HUMIDITY_SENSOR"), value : "Sensor.Humidity"},
			//{text : I18N.prop("FACILITY_DEVICE_TYPE_TEMP_AND_HUMIDITY_SENSOR"), value : "Sensor.Temperature_Humidity"},
			//{text : I18N.prop("FACILITY_DEVICE_TYPE_MOTION_SENSOR"), value : "Sensor.Motion"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"), value : "Beacon"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"), value : "CCTV"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"), value : "Gateway"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"), value : "Light"}//,
			//{text : I18N.prop("FACILITY_DEVICE_TYPE_PRINTER"), value : "Printer"}
		];

		var idx, deviceType, maximum = typeFilterDataSource.length;
		for( idx = maximum - 1; idx >= 0; idx-- ){
			deviceType = typeFilterDataSource[idx];
			deviceType = deviceType.value;
			if(!(isInstalledType(deviceType, true))){
				typeFilterDataSource.splice(idx, 1);
			}
		}
		return typeFilterDataSource;
	};

	//전체 기기타입 드랍다운리스트 dataSource
	var getTotalDeviceTypeDataSource = function() {
		var I18N = window.I18N;
		var typeFilterDataSource = [
			{text : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"), value : "AirConditioner."},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_SAC_OUTDOOR"), value : "AirConditionerOutdoor"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_POINT"), value : "ControlPoint"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"), value : "Meter"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_TEMPERATURE_SENSOR"), value : "Sensor.Temperature"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_HUMIDITY_SENSOR"), value : "Sensor.Humidity"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_TEMP_AND_HUMIDITY_SENSOR"), value : "Sensor.Temperature_Humidity"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_MOTION_SENSOR"), value : "Sensor.Motion"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"), value : "Beacon"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"), value : "CCTV"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"), value : "Gateway"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"), value : "Light"},
			{text : I18N.prop("FACILITY_DEVICE_TYPE_PRINTER"), value : "Printer"}
		];

		var i, deviceType, max = typeFilterDataSource.length;
		for( i = max - 1; i >= 0; i-- ){
			deviceType = typeFilterDataSource[i];
			deviceType = deviceType.value;
			if(!(isInstalledType(deviceType, true, true))){
				typeFilterDataSource.splice(i, 1);
			}
		}
		return typeFilterDataSource;
	};

	var _setter = function(field, value){
		var self = this;
		var fields = field.split(".");
		var i, max = fields.length;
		var idx, arrIdx;
		for( i = 0; i < max; i++ ){
			arrIdx = null;
			field = fields[i];
			idx = field.indexOf("["); //현재 중첩된 Array 미지원
			if(idx != -1){ //Array
				arrIdx = field.substring(idx + 1, field.length - 1);
				field = field.substring(0, idx);
				if(typeof self[field] === "undefined"){
					self[field] = [];
				}
				self = self[field];
				if( i == (max - 1) ){
					self[arrIdx] = value;
					return;
				}else if(typeof self[arrIdx] === "undefined"){
					self[arrIdx] = {};
				}
				self = self[arrIdx];
			}else if( i < (max - 1)){
				if(typeof self[field] === "undefined"){
					self[field] = {};
				}
				self = self[field];
			}else{
				self[field] = value;
				return;
			}
		}

	};

	var setter = function(obj, field, value){
		_setter.call(obj, field, value);
	};

	var _getter = function(field){
		var value = this;
		var fields = field.split(".");
		var i, max = fields.length;
		var idx, arrIdx;
		for( i = 0; i < max; i++ ){
			field = fields[i];
			idx = field.indexOf("[");  //현재 중첩된 Array 미지원
			if(idx != -1){ //Array
				arrIdx = field.substring(idx + 1, field.length - 1);
				field = field.substring(0, idx);
				value = value[field];
				if(typeof value !== "undefined") value = value[arrIdx];
			}else{
				value = value[field];
			}

			if(typeof value === "undefined") return null;
			else if(i == (max - 1)) return value;
		}
	};

	var getter = function(obj, field){
		return _getter.call(obj, field);
	};

	var getFloorDataWithImage = function(floorId){
		var dfd = new $.Deferred();
		var mainWindow = window.MAIN_WINDOW;
		var floorObj = {};
		$.ajax({ url : "/foundation/space/floors/" + floorId}).done(function(floor){
			floorObj = floor;
		}).fail(function(xhq){
			dfd.reject(xhq);
		}).always(function(){
			$.ajax({ url : "/foundation/space/floors/" + floorId + "/image",
				dataType:"binary"
			}).fail(function(){
				floorObj.image = null;
				floorObj.imageWidth = 0;
				floorObj.imageHeight = 0;
				dfd.resolve(floorObj);
			}).done(function(image){
				floorObj.image = image;
				if(image){
					floorObj.imageUrl = URL.createObjectURL(image);
					mainWindow.setFloorImageInfo({ floor : floorObj }).always(function(){
						dfd.resolve(floorObj);
					});
				}else{
					floorObj.imageWidth = 0;
					floorObj.imageHeight = 0;
					dfd.resolve(floorObj);
				}
			});
		});

		return dfd.promise();
	};

	//Flat Object 전용
	var refineDataFieldsFromModel = function(object, KendoModel){
		var kendoModel = new KendoModel();
		var fields = kendoModel.fields;
		//var idField = kendoModel.idField;
		var key;
		for( key in object ){
			if(typeof fields[key] === "undefined") delete object[key];
			else if(typeof object[key] === "undefined") delete object[key];
		}
		return object;
	};

	var isPointInPolygon = function (point, vs) {
	    var x = point[0], y = point[1];
	    var inside = false;
	    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
	        var xi = vs[i][0], yi = vs[i][1];
	        var xj = vs[j][0], yj = vs[j][1];
	        var intersect = ((yi > y) != (yj > y))
	            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	        if (intersect) inside = !inside;
	    }
	    return inside;
	};

	var getCenterMap = function(floorImageWidth, floorImageHeight){
		var centerCoordinate;
		var defaultMapWidth = kendo.ui.CommonMapView.fn.options.DEFAULT_WIDTH_SIZE;
		var defaultMapHeight = kendo.ui.CommonMapView.fn.options.DEFAULT_HEIGHT_SIZE;
		if(!floorImageWidth || !floorImageHeight
			|| floorImageWidth < defaultMapWidth || floorImageHeight < defaultMapHeight){
			floorImageWidth = defaultMapWidth;
			floorImageHeight = defaultMapHeight;
		}
		centerCoordinate = [floorImageWidth / 2, floorImageHeight / 2];
		return centerCoordinate;
	};

	var getCenterZoneId = function(zones, centerCoordinate){
		if(!centerCoordinate) centerCoordinate = getCenterMap();
		var zoneCoordinate,zoneId = 0, zone, i, max = zones.length;
		for( i = 0; i < max; i++ ){
			zone = zones[i];
			zoneCoordinate = zone.geometry.coordinates[0];
			if(isPointInPolygon(centerCoordinate, zoneCoordinate)){
				zoneId = zone.id;
				break;
			}
		}
		return zoneId;
	};

	var isValidColor = function(htmlColor){
		return /^#([A-Fa-f0-9]{6}$)/.test(htmlColor);
	};

	var getImageUrl = function(url){
		return STATIC_IMAGE_URL + url;
	};

	var convertNumberFormat = function(value) {
		var num = null;
		if (!value) return value;
		num = Number(value);

		if( value === null || typeof value == "undefined") return value;
		if(isNaN(num)) return value; //넘버 타입이 아닌 경우 그대로 리턴.

		//num이 지수라면,
		if(num.toString().toLowerCase().indexOf('e') != -1 && typeof value == "string") {
			if(value.split('.').length == 2) {
				var underNum = Number('0.' + value.split('.')[1]);
				if(underNum >= 0.1) return value.split('.')[0] + '.' + value.split('.')[1][0];
				return value.split('.')[0];
			}
			return value;
		}

		if(num > 0) {
			if(num - Math.floor(num) >= 0.09999999999999432) return Math.floor(num * 10 ) / 10; //들어온 숫자값의 소수점 자리의 값이 0.1 이상일떄 소수점 첫째자리까지 리턴.
			return Math.floor(num); // 소수점 자리의 값이 0.1 미만인 경우 정수자리만 리턴.
		}
		//value 값이 음수인 경우.
		num *= -1;
		if(num - Math.floor(num) >= 0.09999999999999432) return (Math.floor(num * 10 ) / 10) * -1;
		if(Math.floor(num) === 0) return 0;
		return Math.floor(num) * -1;
	};

	var getNewGUID = function () {
		function s4() {
			return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	};

	var getChartOptionsForFiveChartSection = function (max, min) {
		var i, maxStr, minStr, largestDigit, secondLargestDigit, newMax, newMin, newMajorUnit, chartOption;

		// max 값 수정
		if(max > 10) {
			maxStr = max.toString();
			largestDigit = maxStr[0];
			secondLargestDigit = maxStr[1];
			if(secondLargestDigit < 5) {
				secondLargestDigit = 5;
			} else {
				secondLargestDigit = 0;
				largestDigit = (Number(largestDigit) + 1).toString();
			}

			newMax = Number(largestDigit * 10 + secondLargestDigit);
			for(i = 0; i < (Math.floor(maxStr)).toString().length - 2; i++) {
				newMax = newMax * 10;
			}

			if(newMax < 100 && newMax > 50) {
				newMax = 100;
			}

			if(newMax < 50) {
				newMax = 50;
			}

		} else {
			newMax = max;
		}

		// min 값 수정
		if(min < 0) {
			if(min < -10) {
				minStr = min.toString();
				largestDigit = minStr[1];
				secondLargestDigit = minStr[2];
				if(secondLargestDigit < 5) {
					secondLargestDigit = 5;
				} else {
					secondLargestDigit = 0;
					largestDigit = (Number(largestDigit) + 1).toString();
				}

				newMin = Number(largestDigit * 10 + secondLargestDigit) * -1;
				for(i = 0; i < minStr.length - 3; i++) {
					newMin = newMin * 10;
				}
			} else {
				newMin = 10 * -1;
			}

		} else {
			newMin = 0;
		}

		// majorUnit 값 수정
		newMajorUnit = (newMax - newMin) / 5;

		chartOption = {
			newMax: newMax,
			newMin: newMin,
			newMajorUnit: newMajorUnit
		};

		return chartOption;
	};

	//ES6 [...arg] 문법 치환
	var toConsumableArray = function(arr) {
		var arr2 = Array(arr.length);
		if (Array.isArray(arr)) {
			for (var i = 0; i < arr.length; i++) {
				arr2[i] = arr[i];
			}
			return arr2;
		}
		return Array.from(arr);
	};

	//Unicode 스트링까지 길이 체크 가능
	var getStringLength = function(str){
		if(typeof str !== "undefined" && str !== null){
			return [].concat(toConsumableArray(str)).length;
		}
		return str;
	};

	var addBuildDateQuery = function(url){
		if(url) url += ("?v=" + window.BUILD_DATE);
		return url;
	};

	window.Util = {
		parseFailResponse : parseFailResponse,
		sliceNum : sliceNum,
		getCentroid : getCentroid,
		getDisplayType : getDisplayType,
		getDisplayClassType : getDisplayClassType,
		getDetailDisplayType : getDetailDisplayType,
		getDetailDisplayTypeDevice : getDetailDisplayTypeDevice,
		getDetailDisplayTypeDeviceI18N : getDetailDisplayTypeDeviceI18N,
		getOriginalType : getOriginalType,
		getIndoorType : getIndoorType,
		getDeviceTypeList : getDeviceTypeList,
		getDisplayMode : getDisplayMode,
		getDisplayModeI18N : getDisplayModeI18N,
		getFahrenheit : getFahrenheit,
		getCelsius : getCelsius,
		getTemperature : getTemperature,
		getStatus : getStatus,
		getRecentAlarm : getRecentAlarm,
		CHAR : CHAR,
		parseLocation : parseLocation,
		getAlarmDescription : getAlarmDescription,
		setAlarmEventTime : setAlarmEventTime,
		setAlarmDescription : setAlarmDescription,
		setAlarmData : setAlarmData,
		convertAmPm : convertAmPm,
		convertTimeFormat : convertTimeFormat,
		convertFullHour : convertFullHours,
		convertDateFormat : convertDateFormat,
		convertNumberFormat: convertNumberFormat,
		removeSameLastPoint : removeSameLastPoint,
		getZoneCenterCoordinate : getZoneCenterCoordinate,
		setAutoLocation : setAutoLocation,
		getInstalledTypesFromServer : getInstalledTypesFromServer,
		isInstalledType : isInstalledType,
		isSupportEnergyDistributionType : isSupportEnergyDistributionType,
		getInstalledTypeList : getInstalledTypeList,
		getHistoryOperation: getHistoryOperation,
		getHistoryOperationValue: getHistoryOperationValue,
		getFloorName : getFloorName,
		getQueryFromFloor : getQueryFromFloor,
		getGeneralType : getGeneralType,
		getSmartPlugStatus : getSmartPlugStatus,
		getNormalStatus : getNormalStatus,
		getRepresentativeStatus : getRepresentativeStatus,
		getSystemLogOperationType : getSystemLogOperationType,
		isOnlyNormalType : isOnlyNormalType,
		getAssetStatus : getAssetStatus,
		isNetworkDevice : isNetworkDevice,
		getModeToI18N : getModeToI18N,
		getPositionType : getPositionType,
		getBeaconPositionType : getBeaconPositionType,
		getBeaconTypeLocation : getBeaconTypeLocation,
		getBeaconLocation : getBeaconLocation,
		getStatusI18N : getStatusI18N,
		decodeHtml : decodeHtml,
		getScheduleMode : getScheduleMode,
		getScheduleOperation : getScheduleOperation,
		getScheduleLight : getScheduleLight,
		getScheduleTemperatures : getScheduleTemperatures,
		getValueFilteredForXSS: getValueFilteredForXSS,
		getEnergyMeterTypeList: getEnergyMeterTypeList,
		getControllableDeviceTypeDataSource: getControllableDeviceTypeDataSource,
		getTotalDeviceTypeDataSource: getTotalDeviceTypeDataSource,
		getter : getter,
		setter : setter,
		getFloorDataWithImage : getFloorDataWithImage,
		refineDataFieldsFromModel : refineDataFieldsFromModel,
		isPointInPolygon : isPointInPolygon,
		getCenterMap : getCenterMap,
		getCenterZoneId : getCenterZoneId,
		isValidColor : isValidColor,
		getImageUrl : getImageUrl,
		getNewGUID : getNewGUID,
		getChartOptionsForFiveChartSection: getChartOptionsForFiveChartSection,
		getStringLength : getStringLength,
		addBuildDateQuery : addBuildDateQuery
	};


})(window, jQuery);
