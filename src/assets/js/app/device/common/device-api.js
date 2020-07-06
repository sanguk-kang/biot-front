/**
*
*   <ul>
*       <li>Device 기능 API</li>
*   </ul>
*   @module app/device/common/device-api
*   @requires app/core/util
*
*/

define("device/common/device-api", ["device/common/device-model"], function(model){
	"use strict";

	var MainWindow = window.MAIN_WINDOW;
	var Device = model.Device;

	//GET API를 호출하기 위하여, 기기 Type 별로 필요한 types attribute들을 매핑
	var typesQuery = {
		"AirConditioner.Indoor" : ["AirConditioner.*"],
		"AirConditionerOutdoor" : ["AirConditionerOutdoor"],
		"ControlPoint" : ["ControlPoint.*"],
		"Meter" : ["Meter*"],
		"Sensor.Temperature_Humidity" : ["Sensor.Temperature_Humidity", "Sensor.Temperature", "Sensor.Humidity"],
		"Light" : ["Light"],
		"SmartPlug" : ["SmartPlug"],
		"Sensor.Motion" : ["Sensor.Motion"],
		"Gateway" : ["Gateway"],
		"Beacon" : ["Beacon"],
		"CCTV" : ["CCTV"]
	};

	//TypeFilter시 mappedTypes와 type에 따라 두 번 호출되는 Type들 정리
	var filteredMappedTypesQuery = {
		"ControlPoint" : {
			mappedTypes :  "ControlPoint"
		},
		"Meter" : {
			types : "ControlPoint.*"
		},
		"Sensor.Temperature_Humidity" : {
			types : "ControlPoint.*"
		}
	};

	///dms/devices types 쿼리 별 mappedTypes 값을 매핑한 Object
	var mappedTypesQuery = {
		"ControlPoint.*" : {
			mappedTypes : ["ControlPoint"]
		},
		Light : {
			types : ["ControlPoint.*"],
			mappedTypes : ["Light"]
		},
		"Meter*" : {
			types : ["ControlPoint.*"],
			mappedTypes : ["Meter*"]
		},
		"Sensor.Temperature_Humidity" : {
			types : ["ControlPoint.*"],
			mappedTypes : ["Sensor.Humidity", "Sensor.Temperature", "Sensor.Temperature_Humidity"]
		},
		"Sensor.Motion" : {
			types : ["ControlPoint.*"],
			mappedTypes : ["Sensor.Motion"]
		}
	};

	//Status query용 map
	var statusQuery = {
		//On / Off는 AirConditioner. 전용
		"On" : {
			representativeStatuses : "Normal.On"
		},
		"Off" : {
			representativeStatuses : "Normal.Off"
		},
		"Critical" : {
			representativeStatuses : "Alarm.Critical"
		},
		"Warning" : {
			representativeStatuses : "Alarm.Warning"
		},
		"Normal" : {
			representativeStatuses : "Normal"
		},
		"Alarm.Critical" : {
			representativeStatuses : "Alarm.Critical"
		},
		"Alarm.Warning" : {
			representativeStatuses : "Alarm.Warning"
		}
	};

	/**
	*
	*   기기 1개의 데이터를 얻기 위하여 API를 요청한다.
	*
	*   @function getDeviceWithID
	*   @param {Number|String} deviceID - GET 할 기기의 ID 값
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var getDeviceWithID = function(deviceID){
		var url = "/dms/devices/" + deviceID;

		return $.ajax({
			url: url
		});
	};

	/**
	*
	*   기기 다 수개의 데이터를 얻기 위하여 API를 요청한다.
	*
	*   @function getDeviceWithMultipleID
	*   @param {Array} deviceIDs - GET 할 기기의 ID 리스트
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var getDeviceWithMultipleID = function(deviceIDs){
		var url = "/dms/devices";

		if(deviceIDs){
			var text = "";
			for(var i = 0, len = deviceIDs.length; i < len; i++){
				text += deviceIDs[i];
				text += ",";
			}
			url += "?ids=" + text.substr(0, text.length - 1);
		}


		return $.ajax({
			url: url
		});
	};

	/**
	*
	*   기기 타입 별 기기 정보 리스트를 얻기 위하여 API를 요청한다.
	*
	*   @function getDeviceWithType
	*   @param {Array} deviceTypeKey - API를 콜하는 현재 Tab의 기기 타입. 해당 값으로 typesQuery와 캐핑하여 요청할 기기 타입 리스트를 얻는다.
	*   @param {Array} registrationStatuses - 요청할 기기의 등록 상태 리스트
	*   @param {Object} arg - 기타 API를 요청하기 위한 파라미터 (e.g : page, size 등)
	*   @param {Boolean} noBlock - 기기 타입이 Beacon 일 때, API 호출 시, registrationStatuses에 Block 상태를 포함하지 않을지의 여무
	*   @param {Boolean} filterObj - filter 적용중일 때, filtering 된 value만 호출(type, mode, status, zone, name)
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var getDeviceWithType = function(deviceTypeKey, registrationStatuses, arg, noBlock, filterObj){
		var types;
		if($.isArray(deviceTypeKey)) types = deviceTypeKey;
		else types = typesQuery[deviceTypeKey] ? typesQuery[deviceTypeKey] : [];

		var dfd = new $.Deferred();

		// var dataum;		//[2018-04-16][선언후 미할당 미사용 주석처리]

		var url = "/dms/devices";
		var text = "";

		var typeQueryParameter = {}, mappedTypeQueryParameter = {};

		//null과 undefined 둘다 체크하도록 변경
		var type, hasMappedTypes = false, mappedUrl = "";
		var queryType, queryMappedType;
		var status, queryStatus = "";
		var forIndex, len;

		filterObj = filterObj ? filterObj : {};
		var filteredType = filterObj.type, filteredMode = filterObj.mode || {}, filteredStatuses = filterObj.statuses || [], filteredZones = filterObj.zones || [], filteredDeviceName = filterObj.name && filterObj.name.replace(/\s/g, '+') || null;

		//Beacon은 type filter시 query가 다르므로 제외
		if(filteredType && types[0] != "Beacon") {
			queryType = filteredMappedTypesQuery[deviceTypeKey] && filteredMappedTypesQuery[deviceTypeKey].types;
			queryMappedType = filteredMappedTypesQuery[deviceTypeKey] && filteredMappedTypesQuery[deviceTypeKey].mappedTypes;

			typeQueryParameter.types = filteredType;
			if (queryMappedType) {
				typeQueryParameter.mappedTypes = queryMappedType;
			}
			if (queryType) {
				mappedTypeQueryParameter.types = queryType;
				mappedTypeQueryParameter.mappedTypes = filteredType;
			}
		}else if(types){
			for(forIndex = 0, len = types.length; forIndex < len; forIndex++){			//[2018-04-16][for문 i 중복선언으로 변수명 기존 i -> forIndex 수정]
				type = types[forIndex];
				//현재 Type에 대한 mappedType이 존재하는지 확인한다.
				if(!hasMappedTypes && mappedTypesQuery[type]){
					hasMappedTypes = true;
					queryType = mappedTypesQuery[type].types;
					queryMappedType = mappedTypesQuery[type].mappedTypes;
					if(queryType){
						queryType = queryType.join(",");
						queryMappedType = queryMappedType.join(",");
						mappedUrl = url + "?types=" + queryType + "&mappedTypes=" + queryMappedType;
						mappedTypeQueryParameter.types = queryType;
						mappedTypeQueryParameter.mappedTypes = queryMappedType;
					}else{
						queryMappedType = queryMappedType.join(",");
					}
				}
				text += type;
				text += ",";
			}
			//url += "?types=" + text.substr(0, text.length-1);
			typeQueryParameter.types = text.substr(0, text.length - 1);
		}

		//Status Filter용 query 생성
		if(filteredStatuses.length > 0) {
			for (forIndex = 0, len = filteredStatuses.length; forIndex < len; forIndex++) {
				status = filteredStatuses[forIndex];
				status = statusQuery[status];
				if(status.representativeStatuses) {
					if (queryStatus.indexOf(status.representativeStatuses) == -1) {
						queryStatus += status.representativeStatuses + ',';
					}
				}
			}
			if (queryStatus && queryStatus.lastIndexOf(',') === queryStatus.length - 1) {
				queryStatus = queryStatus.substr(0, queryStatus.length - 1);
			}
			typeQueryParameter.representativeStatuses = queryStatus;
		}

		//Mode Filter용 query 생성(AirConditioner. 전용)
		if(filteredMode.value && filteredMode.id){
			typeQueryParameter.equals = filteredMode.value;
			typeQueryParameter.equalsAttribute = "modes-" + filteredMode.id + "-mode";
		}

		if(filteredZones.length > 0) {
			typeQueryParameter.foundation_space_zones_id = filteredZones.join(",");
		}

		if(filteredDeviceName) {
			typeQueryParameter.contains = filteredDeviceName;
			typeQueryParameter.containsAttributes = "id,name,controlPoint-tagName";
		}

		//층이 선택되었을 경우 선택된 빌딩과 층에 대한 Device 정보만 가져온다.
		var buildingId, floorId;
		var floorData = MainWindow.getCurrentFloor();
		var building = floorData.building;
		var floor = floorData.floor;

		if(building.id && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			buildingId = building.id;
		}

		if(floor.id && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			floorId = floor.id;
		}

		//Default는 전체 기기
		if(!registrationStatuses){
			registrationStatuses = "Registered,NotRegistered";
			if(url.indexOf("Beacon") != -1 && !noBlock){
				registrationStatuses += ",Blocked";
			}
		}else{
			registrationStatuses = registrationStatuses.join(",");
		}

		//NotRegistered는 전체 빌딩, 층을 가져와야한다.
		if(registrationStatuses.indexOf("NotRegistered") != -1){
			buildingId = null;
			floorId = null;
		}

		if(buildingId){
			typeQueryParameter.foundation_space_buildings_id = buildingId;
		}

		if(floorId){
			typeQueryParameter.foundation_space_floors_id = floorId;
		}


		//무조건 Registered, NotRegistered Device만 가져온다.
		//text = text ? "&" : "";
		//url += (text+"registrationStatuses=Registered,NotRegistered");
		/*if(url.indexOf("Beacon") != -1 && !noBlock){
			registrationStatuses += ",Blocked";
		}*/
		typeQueryParameter.registrationStatuses = registrationStatuses;

		if(!$.isEmptyObject(mappedTypeQueryParameter)){
			mappedTypeQueryParameter.registrationStatuses = registrationStatuses;
			mappedTypeQueryParameter.foundation_space_buildings_id = buildingId;
			mappedTypeQueryParameter.foundation_space_floors_id = floorId;
			//mappedUrl += (text+"registrationStatuses=Registered,NotRegistered");

			if(queryStatus){
				mappedTypeQueryParameter.representativeStatuses = queryStatus;
			}
			//Mode Filter용 query 생성(AirConditioner. 전용)
			if(filteredMode.value && filteredMode.id){
				mappedTypeQueryParameter.equals = filteredMode.value;
				mappedTypeQueryParameter.equalsAttribute = "modes-" + filteredMode.id + "-mode";
			}
			if(filteredZones.length > 0) {
				mappedTypeQueryParameter.foundation_space_zones_id = filteredZones.join(",");
			}
			if(filteredDeviceName) {
				mappedTypeQueryParameter.contains = filteredDeviceName;
				mappedTypeQueryParameter.containsAttributes = "id,name,controlPoint-tagName";
			}
		}


		//mappedTypes가 존재하는 타입이지만 mappedTypes Url이 생성되지 않았을 경우, 일반 기기 타입 쿼리에 mappedTypes 쿼리를 추가한다.
		if(hasMappedTypes && !mappedUrl){
			//url += "&mappedTypes="+queryMappedType;
			typeQueryParameter.mappedTypes = queryMappedType;
		}

		if(arg){
			if(arg.typeQuery) typeQueryParameter = $.extend(typeQueryParameter, arg.typeQuery);
			if(arg.mappedTypeQuery) mappedTypeQueryParameter = $.extend(mappedTypeQueryParameter, arg.mappedTypeQuery);
		}

		//mappedType 기기까지 가져온다.
		var reqArr = [];
		var mappedDevices = [], devices = [];
		var mappedPage, typePage;

		if(mappedTypeQueryParameter.registrationStatuses){
			url = "/dms/devices";
			if(mappedTypeQueryParameter.types){
				url += "?types=" + mappedTypeQueryParameter.types;
				delete mappedTypeQueryParameter.types;
			}
			if(mappedTypeQueryParameter.mappedTypes){
				url += url.indexOf('?') != -1 ? '&' : '?';
				url += "mappedTypes=" + mappedTypeQueryParameter.mappedTypes;
				delete mappedTypeQueryParameter.mappedTypes;
			}
			if(mappedTypeQueryParameter.representativeStatuses){
				url += url.indexOf('?') != -1 ? '&' : '?';
				url += "representativeStatuses=" + mappedTypeQueryParameter.representativeStatuses;
				delete mappedTypeQueryParameter.representativeStatuses;
			}
			if(mappedTypeQueryParameter.foundation_space_zones_id) {
				url += url.indexOf('?') != -1 ? '&' : '?';
				url += "foundation_space_zones_id=" + mappedTypeQueryParameter.foundation_space_zones_id;
				delete mappedTypeQueryParameter.foundation_space_zones_id;
			}

			reqArr.push($.ajax({
				url : url,
				data : mappedTypeQueryParameter
			}).then(function(data){
				//Pagenation
				if(data.page){
					mappedDevices = data.data;
					mappedPage = data.page;
				}else{
					mappedDevices = data;
				}
			}).fail(function(xhq){
				dfd.reject(xhq);
			}));
		}
		url = "/dms/devices";
		if(typeQueryParameter.types){
			url += "?types=" + typeQueryParameter.types;
			//Beacon의 type filter시 equals query 추가
			if (typeQueryParameter.types == "Beacon" && filteredType) {
				url += "&equals=" + filteredType + "&equalsAttribute=configuration-mobilityType";
			}
			delete typeQueryParameter.types;
		}
		if(typeQueryParameter.mappedTypes){
			url += url.indexOf('?') != -1 ? '&' : '?';
			url += "mappedTypes=" + typeQueryParameter.mappedTypes;
			delete typeQueryParameter.mappedTypes;
		}

		if(typeQueryParameter.registrationStatuses.split(",").length > 1){
			url += url.indexOf('?') != -1 ? '&' : '?';
			url += "registrationStatuses=" + typeQueryParameter.registrationStatuses;
			delete typeQueryParameter.registrationStatuses;
		}
		if(typeQueryParameter.representativeStatuses){
			url += url.indexOf('?') != -1 ? '&' : '?';
			url += "representativeStatuses=" + typeQueryParameter.representativeStatuses;
			delete typeQueryParameter.representativeStatuses;
		}
		if(typeQueryParameter.foundation_space_zones_id) {
			url += url.indexOf('?') != -1 ? '&' : '?';
			url += "foundation_space_zones_id=" + typeQueryParameter.foundation_space_zones_id;
			delete typeQueryParameter.foundation_space_zones_id;
		}

		reqArr.push($.ajax({
			url: url,
			data : typeQueryParameter
		}).then(function(data){
			if(data.page){
				typePage = data.page;
				devices = data.data;
			}else{
				devices = data;
			}
		}).fail(function(xhq){
			dfd.reject(xhq);
		}));

		$.when.apply(this, reqArr).always(function(){
			var i, j, max, size, item, mappedItem, isExist = false;
			max = devices.length;
			size = mappedDevices.length;

			//중복체크
			for( i = 0; i < size; i++ ){
				mappedItem = mappedDevices[i];
				isExist = false;
				for( j = 0; j < max; j++ ){
					item = devices[j];
					if(mappedItem.id == item.id){
						isExist = true;
						break;
					}
				}
				if(!isExist){
					devices.push(mappedItem);
				}
			}

			max = devices.length;
			var results = [];
			for( i = 0; i < max; i++ ){
				item = devices[i];
				if(item.locations && !item.locations[0]){
					item.locations[0] = {};
				}
				if(!item.assets){
					item.assets = [];
				}
				item.selected = false;
				item = new Device(item);
				results.push(item);
			}

			if(typePage || mappedPage){
				var resultObj = {
					data : results,
					total : 0
				};
				if(typePage){
					resultObj.typePage = typePage;
					resultObj.total += typePage.totalElements;
				}

				if(mappedPage){
					resultObj.mappedTypePage = mappedPage;
					resultObj.total += mappedPage.totalElements;
				}

				dfd.resolve(resultObj);
			}else{
				dfd.resolve(results);
			}
		});

		return dfd.promise();
	};

	/**
	*
	*   기기 타입 별 기기의 통계 데이터를 응답 받기 위하여 Statistic API를 호출한다.
	*
	*   @function getStatisticByKey
	*   @param {String} key - 요청할 기기 타입
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var getStatisticByKey = function(key){
		var url;
		switch(key){
		case "AirConditioner.Indoor" : url = "/dms/devices/statisticView/AirConditioner"; break;
		case "Meter" : url = "/dms/devices/statisticView/Meter"; break;
		case "Sensor.Temperature_Humidity" : url = "/dms/devices/statisticView/Sensor.Temperature_Humidity"; break;
		case "Light" : url = "/dms/devices/statisticView/Light"; break;
		case "Sensor.Motion" : url = "/dms/devices/statisticView/Sensor.Motion"; break;
		case "Gateway" : url = "/dms/devices/statisticView/Gateway"; break;
		case "CCTV" : url = "/dms/devices/statisticView/CCTV"; break;
		case "Beacon" : url = "/dms/devices/statisticView/Beacon"; break;
		case "Asset" : url = "/dms/devices/statisticView/Asset"; break;
		case "SmartPlug" : url = "/dms/devices/statisticView/SmartPlug"; break;
		default:
		}

		var floorData = MainWindow.getCurrentFloor();

		if(floorData.building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			url += "?exposeFloors=false";
		}

		return $.ajax({
			url : url
		}).then(function(buildingData){
			if(!buildingData){
				buildingData = [];
			}

			return buildingData;
		});
	};

	/**
	*
	*   1개의 기기 삭제를 위하여 [DELETE] API를 호출한다.
	*
	*   @function deleteDevice
	*   @param {String|Number} deviceId - 삭제할 기기의 ID 값
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var deleteDevice = function(deviceId){

		var url = "/dms/devices/" + deviceId;

		return $.ajax({
			url: url,
			method: "DELETE"
		});
	};

	/**
	*
	*   다 수개의 기기 삭제를 위하여 [DELETE] API를 호출한다.
	*
	*   @function deleteDevices
	*   @param {Array} ids - 삭제할 기기의 ID 값 리스트
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var deleteDevices = function(ids){
		var i, max = ids.length;
		var reqArr = [];
		for( i = 0; i < max; i++ ){
			reqArr.push(deleteDevice(ids[i]));
		}
		return $.when.apply(this, reqArr);
	};

	/**
	*
	*   1개의 기기 정보 수정를 위하여 [PATCH] API를 호출한다.
	*
	*   @function patchDevice
	*   @param {Array} deviceId - 수정할 기기의 ID 값
	*   @param {Object} device - 수정할 기기 정보
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var patchDevice = function(deviceId, device){
		var url = "/dms/devices/" + deviceId;

		return $.ajax({
			url: url,
			method: "PATCH",
			data: device
		});
	};

	/**
	*
	*   다수 개의 기기 정보 수정를 위하여 [PATCH] API를 호출한다.
	*
	*   @function patchDevices
	*   @param {Array} devices - 수정할 기기 정보 리스트
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var patchDevices = function(devices){
		var url = "/dms/devices";

		return $.ajax({
			url : url,
			method : "PATCH",
			data : devices
		});
	};

	/**
	*
	*   기기 제어를 위하여 /multiControl API를 호출한다.
	*
	*   @function multiControl
	*   @param {Array} data - 제어할 기기 정보 리스트
	*   @returns {jQuery.Deferred} - jQuery.Deferred
	*   @alias module:app/device/common/device-api
	*
	*/
	var multiControl = function(data){
		var url = "/dms/devices/multiControl";

		return $.ajax({
			url : url,
			method : "PUT",
			data : data
		});
	};

	//1개 실내기의 제어패널 API를 호출할 때 쓰인다.
	var patchGroupAttr = function(deviceId, name, parameter){
		var url = "/dms/devices/" + deviceId + "/" + name + "/";

		return $.ajax({
			url: url,
			method: "PATCH",
			data: parameter
		});
	};

	var patchOutdoorCurrentLimit = function(e){
		var value = e.value;
		var item = e.item;
		return $.ajax({
			url : "/dms/devices/" + item.id + "/airConditioner",
			method : "PATCH",
			data : {
				outdoorUnit: {
					electricCurrentControl : value
				}
			}
		}).done(function(){
			if(item.airConditioner && item.airConditioner.outdoorUnit && item.airConditioner.outdoorUnit.electricCurrentControl){
				item.airConditioner.outdoorUnit.electricCurrentControl = value;
			}
		});
	};

	var patchOutdoorHeatingCapacityCalibration = function(e){
		var value = e.value;
		var item = e.item;

		$.ajax({
			url : "/dms/devices/" + item.id + "/airConditioner",
			method : "PATCH",
			data : {
				outdoorUnit: {
					heatingCapacityCalibration : value
				}
			}
		}).done(function(){
			if(item.airConditioner && item.airConditioner.outdoorUnit && item.airConditioner.outdoorUnit.heatingCapacityCalibration){
				item.airConditioner.outdoorUnit.heatingCapacityCalibration = value;
			}
		});
	};

	var patchOutdoorCoolingCapacityCalibration = function(e){
		var value = e.value;
		var item = e.item;

		$.ajax({
			url : "/dms/devices/" + item.id + "/airConditioner",
			method : "PATCH",
			data : {
				outdoorUnit: {
					coolingCapacityCalibration : value
				}
			}
		}).done(function(){
			if(item.airConditioner && item.airConditioner.outdoorUnit && item.airConditioner.outdoorUnit.coolingCapacityCalibration){
				item.airConditioner.outdoorUnit.coolingCapacityCalibration = value;
			}
		});
	};

	var getZone = function(floorId, hasNoZoneData){
		return $.ajax({
			url : "/foundation/space/zones?foundation_space_floors_id=" + floorId
		}).then(function(zoneData){
			if(!zoneData) zoneData = [];

			zoneData.sort(function(a, b){
				return a.sortOrder - b.sortOrder;
			});

			if(hasNoZoneData) zoneData.unshift({ id : void 0, name : "No Zone"});

			return zoneData;
		});
	};

	//locations값이 없이 Patch하므로 기기 등록 외 NotRegistered, Blocked 등에 쓰인다.
	var patchRegistrationStatus = function(selectedData, registrationStatus){
		var device, devices = [], data, i, max = selectedData.length;
		for( i = 0; i < max; i++ ){
			data = selectedData[i];
			device = { id : data.id };
			device.registrationStatus = registrationStatus;
			devices.push(device);
		}
		return patchDevices(devices);
	};

	var patchControlPointValue = function(id, value){
		if (typeof value === 'number') value = value.toString();
		return $.ajax({
			url : "/dms/devices/" + id + "/controlPoint",
			method : "PATCH",
			data : {
				value : value
			}
		});
	};

	return {
		getStatisticByKey : getStatisticByKey,
		getDeviceWithType : getDeviceWithType,
		getDeviceWithID : getDeviceWithID,
		getDeviceWithMultipleID : getDeviceWithMultipleID,
		patchDevice : patchDevice,
		patchDevices : patchDevices,
		deleteDevice : deleteDevice,
		multiControl : multiControl,
		patchGroupAttr: patchGroupAttr,
		deleteDevices : deleteDevices,
		patchOutdoorCurrentLimit : patchOutdoorCurrentLimit,
		patchOutdoorHeatingCapacityCalibration : patchOutdoorHeatingCapacityCalibration,
		patchOutdoorCoolingCapacityCalibration : patchOutdoorCoolingCapacityCalibration,
		getZone : getZone,
		patchRegistrationStatus : patchRegistrationStatus,
		patchControlPointValue : patchControlPointValue
	};
});

//# sourceURL=device/common/device-api.js
