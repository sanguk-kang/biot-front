/**
*
*   <ul>
*       <li>Device 기능 HTML Template</li>
*   </ul>
*   @module app/device/common/device-template
*   @requires app/core/util
*   @requires app/device/common/device-util
*/

define("device/common/device-template", ["device/common/device-util", "device/common/device-constants"], function(DeviceUtil, Constants){
	"use strict";

	var kendo = window.kendo;
	var Util = window.Util;
	var I18N = window.I18N;
	var Settings = window.GlobalSettings;
	var globalLocale = Settings.getLocale();
	var temperatureSettings = Settings.getTemperature();
	var temperatureUnit = temperatureSettings.unit;

	//deprecated
	var multiDetailListTemplate = function(data, showTypeIcon){
		var mode = "", status = "", name = "", statusDisplayText = "",
			operations = data.operations, modes = data.modes;
		name = data.name;
		status = Util.getStatus(data);
		var hasAlarm = false;
		if(status){
			status = status.split(".");
			if(status.length > 1){
				statusDisplayText = status[0];
				if(!Util.isOnlyNormalType(data) || status[0] == "Alarm"){
					statusDisplayText += "(" + status[1] + ")";
				}
				status = status[1];
			}else{
				statusDisplayText = status[0];
				//Disconnected, LowBattery, OutOfBounds
				status = "Off";
			}
			if(status[0] == "Alarm"){
				hasAlarm = true;
			}
		}

		mode = data.modes;
		//Mode 표시 기준 필요.
		if(hasAlarm){
			mode = status[0];
		}else if(mode && mode.length > 0){
			mode = Util.getDisplayMode(modes, operations);
		}

		var cssType = "";
		var type = data.type;
		//실내기를 제외하고 모두 기기 타입 아이콘을 표시한다.
		if(showTypeIcon && type && type.indexOf("AirConditioner.") == -1){
			cssType = Util.getDisplayClassType(data);
		}

		var deviceIcon = "<span class='detail-img " + status + " " + mode + " " + cssType + "'></span>";
		name = "<span data-bind='text: name'>" + Util.decodeHtml(name) + "</span>";									//[2018-04-16][해당 함수 스코프범위내에 이미 name이 선언되어있어 var제거]
		status = "<span class='panel-item-temp'><span>" + Util.getStatusI18N(statusDisplayText) + "</span></span>";	//[2018-04-16][해당 함수 스코프범위내에 이미 status이 선언되어있어 var제거]
		return (deviceIcon + name + status);
	};

	/**
	*   <ul>
	*   <li>상세 팝업 리스트 Template</li>
	*   </ul>
	*   @function multiDetailListDualTemplate
	*   @param {Object} data - 기기 정보
	*   @param {Boolean} isRegister - Registration View 여부
	*   @param {Boolean} isSelected - 선택 상태 여부
	*   @returns {HTMLString} - 상세 팝업 리스트를 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*
	*/
	var multiDetailListDualTemplate = function(data, isRegister, isSelected){
		var mode = "", status = "", name = "", statusDisplayText = "",
			operations = data.operations, modes = data.modes;


		var isAsset = typeof data.assets_types_id !== 'undefined' ? true : false;
		var bindName = "name";
		if(isAsset){
			/*var assetName = data.assets_types_name;
			var subAssetName = data.subAssetType;
			name = assetName;
			if(subAssetName){
				name += " / "+subAssetName;
			}*/
			if(typeof data.number !== 'undefined' && data.number !== null && data.number !== ""){
				name = data.number;
				bindName = "number";
			}else if(data.devices && data.devices[0]){
				name = data.devices[0].dms_devices_name;
				bindName = "devices[0].dms_devices_name";
			}

		}else{
			name = data.name;
		}

		status = Util.getStatus(data);

		var hasAlarm = false;
		if(status){
			status = status.split(".");
			if(status.length > 1){
				statusDisplayText = status[0];
				if(!Util.isOnlyNormalType(data) || status[0] == "Alarm"){
					statusDisplayText += "(" + status[1] + ")";
				}
				status = status[1];
			}else{
				statusDisplayText = status[0];
				//Disconnected, LowBattery, OutOfBounds
				status = "Off";
			}
			if(status[0] == "Alarm"){
				hasAlarm = true;
			}
		}

		mode = data.modes;
		//Mode 표시 기준 필요.
		if(hasAlarm){
			mode = status[0];
		}else if(mode && mode.length > 0){
			mode = Util.getDisplayMode(modes, operations);
		}

		var type = data.type;
		var cssType = "";
		var positionType = Util.getPositionType(data);
		if(isAsset){
			if(isRegister){
				//위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
				if(positionType != "-" && positionType == "Movable"){
					cssType = "asset " + data.assets_types_name.toLowerCase() + " movable-reg";
				}else{
					cssType = "asset " + data.assets_types_name.toLowerCase() + " reg";
				}
			}else{
				//위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
				if(positionType != "-" && positionType == "Movable"){
					cssType = "asset " + data.assets_types_name.toLowerCase() + " " + status + " movable";
				}
				cssType = "asset " + data.assets_types_name.toLowerCase() + " " + status;

			}
		}else if(isRegister){
			//위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
			if(positionType != "-" && positionType == "Movable"){
				cssType = Util.getDisplayClassType(data) + " movable-reg";
			}else{
				cssType = Util.getDisplayClassType(data) + " reg";
			}
		}else if(type.indexOf("AirConditioner.") != -1){	 //실내기를 제외하고, 모니터링에서 기기 타입 아이콘을 표시한다.
			cssType = status + " " + mode;
		}else if(positionType != "-" && positionType == "Movable"){	//위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
			cssType = status + " " + mode + " " + Util.getDisplayClassType(data) + " movable";
		}else{
			cssType = status + " " + mode + " " + Util.getDisplayClassType(data);
		}
		//	[2018-04-16][아래 원본과 같이 else 문안에 if문이 유일하게 되지않도록 else if문으로 수정]
		// else{
		//     //실내기를 제외하고, 모니터링에서 기기 타입 아이콘을 표시한다.
		//     if(type.indexOf("AirConditioner.") != -1){
		//         cssType = status + " " + mode;
		//     }else{
		//         //위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
		//         if(positionType != "-" && positionType == "Movable"){
		//             cssType = status + " " + mode + " " + Util.getDisplayClassType(data) + " movable";
		//         }else{
		//             cssType = status + " " + mode + " " + Util.getDisplayClassType(data);
		//         }
		//     }
		// }

		if(isSelected){
			cssType += " selected";
		}

		var deviceIcon = "<span class='detail-img " + cssType + "'></span>";
		//[2018-04-16][해당 함수 스코프범위내에 이미 name,status 선언되어있어 var제거]
		name = "<span data-bind='text: " + bindName + "'>" + Util.decodeHtml(name) + "</span>";
		status = "<span class='panel-item-temp'><span>" + Util.getStatusI18N(statusDisplayText) + "</span></span>";
		return (deviceIcon + name + status);
	};

	var multiDetailRegisterListTemplate = function(data){
		var mode = "", status = "", name = "", statusDisplayText = "",
			operations = data.operations, modes = data.modes, type = data.type;
		name = data.name;
		var hasAlarm = false;
		var regCss = "unreg";
		if(data.registrationStatus == "Registered"){
			regCss = "reg";
		}
		status = Util.getStatus(data);

		if(status){
			status = status.split(".");
			if(status.length > 1){
				statusDisplayText = status[0];
				if(!Util.isOnlyNormalType(data) || status[0] == "Alarm"){
					statusDisplayText += "(" + status[1] + ")";
				}
				status = status[1];
			}else{
				statusDisplayText = status[0];
				//Disconnected, LowBattery, OutOfBounds
				status = "Off";
			}
			if(status[0] == "Alarm"){
				hasAlarm = true;
			}
		}

		if(status[0] == "Alarm"){
			hasAlarm = true;
		}

		if(hasAlarm){
			mode = status[0];
		}else if(mode && mode.length > 0){
			mode = Util.getDisplayMode(modes, operations);
		}

		type = Util.getDisplayClassType(data);

		var deviceIcon = "<span class='detail-img " + regCss + " " + type + "'></span>";
		//[2018-04-16][해당 함수 스코프범위내에 이미 name,status 선언되어있어 var제거]
		name = "<span data-bind='text: name'>" + Util.decodeHtml(name) + "</span>";
		status = "<span class='panel-item-temp'><span>" + statusDisplayText + "</span></span>";
		return (deviceIcon + name + status);
	};

	/**
	*   <ul>
	*   <li>Monitoring - Map View 우측 리스트 Template</li>
	*   </ul>
	*   @function mapListTemplate
	*   @param {Object} data - 기기 정보
	*   @returns {HTMLString} - Map View 우측 리스트를 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*
	*/
	var mapListTemplate = function(data){
		// var statusDisplayText;	//[2018-04-16][statusDisplayText 할당만 받고 사용되지않아 주석처리]
		var hasAlarm = false,
			operations = data.operations, type = data.type,
			modes = data.modes, mappedType = data.mappedType,
			name = data.name, id = data.id;

		var status = Util.getStatus(data);
		if(status){
			status = status.split(".");
			if(status.length > 1){
				// statusDisplayText = status[0];
				if(!Util.isOnlyNormalType(data) || status[0] == "Alarm"){
					// statusDisplayText += "("+status[1]+")";
				}
				status = status[1];
			}else{
				// statusDisplayText = status[0];
				//Disconnected, LowBattery, OutOfBounds
				status = "Off";
			}
			if(status[0] == "Alarm"){
				hasAlarm = true;
			}
		}
		var mode = data.modes;

		if(hasAlarm){
			mode = status[0];
		}else if(mode && mode.length > 0){
			mode = Util.getDisplayMode(modes, operations);
		}

		var item = '<div class="device-map-panel-list-item">';
		//or device type
		var deviceIcon = "<span class='detail-img " + status + " " + mode + "' data-status='" + status + "' data-mode='" + mode + "' data-type='" + type + "' data-mapped-type='" + mappedType + "'></span>";
		var text = "<div class='detail-text'><span class='id'>" + id + "</span><span class='name'>" + Util.decodeHtml(name) + "</span></div>";
		var detailIcon = "<span class='ic ic-info' data-id='" + id + "'></span>";
		var html = item + deviceIcon + text + detailIcon + "</div>";
		return html;
	};
	/**
	*   <ul>
	*   <li>Registration - Map View 우측 리스트 Template</li>
	*   </ul>
	*   @function mapListRegTemplate
	*   @param {Object} data - 기기 정보
	*   @returns {HTMLString} - Map View 우측 리스트를 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*
	*/
	var mapListRegTemplate = function(data){
		// var statusDisplayText;	//[2018-04-16][statusDisplayText 할당만 받고 사용되지않아 주석처리]
		var hasAlarm = false,
			operations = data.operations, type = data.type, modes = data.modes,
			mappedType = data.mappedType, name = data.name, id = data.id;

		var status = Util.getStatus(data);
		if(status){
			status = status.split(".");
			if(status.length > 1){
				// statusDisplayText = status[0];
				if(!Util.isOnlyNormalType(data) || status[0] == "Alarm"){
					// statusDisplayText += "("+status[1]+")";
				}
				status = status[1];
			}else{
				// statusDisplayText = status[0];
				//Disconnected, LowBattery, OutOfBounds
				status = "Off";
			}
			if(status[0] == "Alarm"){
				hasAlarm = true;
			}
		}
		var mode = data.modes;

		if(hasAlarm){
			mode = status[0];
		}else if(mode && mode.length > 0){
			mode = Util.getDisplayMode(modes, operations);
		}

		type = data.type;		//[2018-04-16][type 변수는 상위에 이미 선언되있어 var를 제거 ]
		var cssType = Util.getDisplayClassType(data);


		var item = '<div class="device-map-panel-list-item">';
		//or device type
		var deviceIcon = "<span class='detail-img reg " + cssType + "' data-status='" + status + "' data-mode='" + mode + "' data-type='" + type + "' data-mapped-type='" + mappedType + "'></span>";
		var text = "<div class='detail-text'><span class='id'>" + id + "</span><span class='name'>" + Util.decodeHtml(name) + "</span></div>";
		var detailIcon = "<span class='ic ic-info' data-id='" + id + "'></span>";
		var html = item + deviceIcon + text + detailIcon + "</div>";
		return html;
	};

	/**
	*   <ul>
	*   <li>Asset Monitoring - Map View 우측 리스트 Template</li>
	*   </ul>
	*   @function assetMapListRegTemplate
	*   @param {Object} data - 기기 정보
	*   @returns {HTMLString} - Map View 우측 리스트를 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*
	*/
	var assetMapListRegTemplate = function(data){
		// var statusDisplayText;									//[2018-04-16][해당변수는 선언후 할당만 받고 미사용 주석처리]
		// var hasAlarm = false,									//[2018-04-16][해당변수는 선언후 할당만 받고 미사용 주석처리]
		//     operations = data.operations, type = data.type,		//[2018-04-16][해당변수는 선언후 할당만 받고 미사용 주석처리]
		//     //Asset은 자산 번호 및 자산 유형 이름을 ID/NAME으로 표시
		//     mappedType = data.mappedType;						//[2018-04-16][해당변수는 선언후 할당만 받고 미사용 주석처리]
		var name = data.assets_types_name, number = data.number, id = data.id;

		var subAssetName = data.subAssetType;
		if(subAssetName){
			name += " / " + subAssetName;
		}

		var status = Util.getStatus(data);
		if(status){
			status = status.split(".");
			if(status.length > 1){
				// statusDisplayText = status[0];
				if(!Util.isOnlyNormalType(data) || status[0] == "Alarm"){
					// statusDisplayText += "("+status[1]+")";
				}
				status = status[1];
			}else{
				// statusDisplayText = status[0];
				//Disconnected, LowBattery, OutOfBounds
				status = "Off";
			}
			if(status[0] == "Alarm"){
				// hasAlarm = true;
			}
		}

		// var type = data.type;		//[2018-04-16][해당변수는 선언후 할당만 받고 미사용 주석처리]
		var cssType;
		var positionType = Util.getPositionType(data);
		//위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
		if(positionType != "-" && positionType == "Movable"){
			cssType = Util.getDisplayClassType(data) + " movable";
		}else{
			cssType = Util.getDisplayClassType(data);
		}

		var item = '<div class="device-map-panel-list-item">';
		//or device type
		var deviceIcon = "<span class='detail-img asset " + status + " " + cssType + "' data-status='" + status + "'></span>";
		var text = "<div class='detail-text'><span class='id'>" + number + "</span><span class='name'>" + Util.decodeHtml(name) + "</span></div>";
		var detailIcon = "<span class='ic ic-info' data-id='" + id + "'></span>";
		var html = item + deviceIcon + text + detailIcon + "</div>";
		return html;
	};

	/**
	*   <ul>
	*   <li>Map View 우측 리스트 Template</li>
	*   </ul>
	*   @function mapListDualTemplate
	*   @param {Object} data - 기기 정보
	*   @param {Boolean} isRegister - Registration 상태로 표시할지에 대한 여부
	*   @returns {HTMLString} - Map View 우측 리스트를 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*
	*/
	var mapListDualTemplate = function(data, isRegister){
		// var statusDisplayText;	//[2018-04-16][해당변수는 선언후 할당만 받고 미사용 주석처리]
		var hasAlarm = false,
			operations = data.operations, type = data.type,
			modes = data.modes, mappedType = data.mappedType,
			name = data.name, id = data.id;

		var status = Util.getStatus(data);
		if(status){
			status = status.split(".");
			if(status.length > 1){
				// statusDisplayText = status[0];
				if(!Util.isOnlyNormalType(data) || status[0] == "Alarm"){
					// statusDisplayText += "("+status[1]+")";
				}
				status = status[1];
			}else{
				// statusDisplayText = status[0];
				//Disconnected, LowBattery, OutOfBounds
				status = "Off";
			}
			if(status[0] == "Alarm"){
				hasAlarm = true;
			}
		}
		var mode = data.modes;

		if(hasAlarm){
			mode = status[0];
		}else if(mode && mode.length > 0){
			mode = Util.getDisplayMode(modes, operations);
		}

		type = data.type;		//[2018-04-16][상위에 이미 선언되어 var제거]
		var cssType = "";
		var positionType = Util.getPositionType(data);
		if(isRegister){
			//위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
			if(positionType != "-" && positionType == "Movable"){
				cssType = Util.getDisplayClassType(data) + " movable-reg";
			}else{
				cssType = Util.getDisplayClassType(data) + " reg";
			}
		}else if(type.indexOf("AirConditioner.") != -1){		 		//실내기를 제외하고, 모니터링에서 기기 타입 아이콘을 표시한다.
			cssType = status + " " + mode;
		}else if(positionType != "-" && positionType == "Movable"){		 //위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
			cssType = status + " " + mode + " " + Util.getDisplayClassType(data) + " movable";
		}else{
			cssType = status + " " + mode + " " + Util.getDisplayClassType(data);
		}
		//	[2018-04-16][else문안에 유일한 명령어가 if문이 안되도록 수정]
		// else{
		//     //실내기를 제외하고, 모니터링에서 기기 타입 아이콘을 표시한다.
		//     if(type.indexOf("AirConditioner.") != -1){
		//         cssType = status + " " + mode;
		//     }else{
		//         //위치 타입이 이동형인 경우 풍선 모양 아이콘으로 표시한다.
		//         if(positionType != "-" && positionType == "Movable"){
		//             cssType = status + " " + mode + " " + Util.getDisplayClassType(data) + " movable";
		//         }else{
		//             cssType = status + " " + mode + " " + Util.getDisplayClassType(data);
		//         }
		//     }
		// }

		var item = '<div class="device-map-panel-list-item">';
		//or device type
		var deviceIcon = "<span class='detail-img " + cssType + "' data-status='" + status + "' data-mode='" + mode + "' data-type='" + type + "' data-mapped-type='" + mappedType + "'></span>";
		var text = "<div class='detail-text'><span class='id'>" + id + "</span><span class='name'>" + Util.decodeHtml(name) + "</span></div>";
		var detailIcon = "<span class='ic ic-info' data-id='" + id + "'></span>";
		var html = item + deviceIcon + text + detailIcon + "</div>";
		return html;
	};

	/**
	*   <ul>
	*   <li>Group 제어 기기 리스트 Template</li>
	*   </ul>
	*   @function detailPopupGroupListTemplate
	*   @param {Object} data - 기기 정보
	*   @returns {HTMLString} - Group 제어 기기 리스트를 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*
	*/
	var detailPopupGroupListTemplate = function(data){
		var name = data.dms_devices_name, id = data.dms_devices_id, type = data.dms_devices_type, mappedType = data.dms_devices_mappedType;
		var item = '<div class="device-detail-popup-group-list-item">';
		//or device type
		if(mappedType != "ControlPoint"){
			type = mappedType || type;
		}
		type = Util.getDisplayClassType(type);
		var deviceIcon = "<span class='detail-img reg selected " + type + "'></span>";
		var text = "<div class='detail-text'><span class='id'>" + id + "</span><span class='name'>" + Util.decodeHtml(name) + "</span></div>";
		var html = item + deviceIcon + text + "</div>";
		return html;
	};

	/**
	*   <ul>
	*   <li>Device 내 Grid View Card를 표시하기 위한 Template</li>
	*   </ul>
	*   @function getDeviceCardTemplate
	*   @param {Object} data - 기기 정보
	*   @returns {HTMLString} - Device 내 Grid View Card를 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*
	*/
	var getDeviceCardTemplate = function(data){
		var status = Util.getStatus(data);
		status = status.replace(".", "-");
		var location = DeviceUtil.getLocation(data);

		var container = $("<div/>");
		var subContainer = $("<div/>").addClass("engCardWrap").attr("data-uid", data.uid).attr("data-id", data.id);
		if(data.selected){
			subContainer.addClass("k-state-selected");
		}
		var divMain = $("<div/>").addClass("engCard " + status);
		var divIcon = $("<div/>").addClass("tb icon");

		var divSubIcon = $("<div/>").addClass("bound");

		var type = data.type;
		var mappedType = data.mappedType;

		var isAsset = typeof data.assets_types_id !== 'undefined' ? true : false;

		var className = "ic-energy";
		if(type){
			if(type.indexOf("Light") != -1
			   || (mappedType && mappedType.indexOf("Light") != -1)){
				className = "ic-light";
			}else if(type.indexOf("SmartPlug") != -1){
				className = "ic-smartplug";
			}else if(type.indexOf("Temperature") != -1
					 || type.indexOf("Humidity") != -1
					 || (mappedType && mappedType.indexOf("Temperature") != -1)
					 || (mappedType && mappedType.indexOf("Humidity") != -1)){
				className = "ic-temperature";
			}else if(type.indexOf("Gateway") != -1){
				className = "ic-gateway";
			}else if(type.indexOf("Beacon") != -1){
				className = "ic-beacon";
			}else if(type.indexOf("CCTV") != -1){
				className = "ic-cctv";
			}else if(type.indexOf("Motion") != -1
					|| (mappedType && mappedType.indexOf("Motion") != -1)){
				className = "ic-motion";
			}
		}else if(isAsset){
			//Asset(자산) 유형에 따라 아이콘을 표시한다.
			className = "asset " + data.assets_types_name.toLowerCase();
		}

		var spanSubIcon = $("<span/>").addClass("dvcic " + className);
		divSubIcon.append(spanSubIcon);
		divIcon.append(divSubIcon);
		divMain.append(divIcon);


		var divTextWrap = $("<div/>").addClass("txtwrap");
		var split = status.split("-");
		var desc = "";
		if(split[0] == "Normal"){
			//Energy Meter는 Normal 대신, 소비량을 표시한다.
			var unit;
			if((type && type.indexOf("Meter") != -1) || (mappedType && mappedType.indexOf("Meter") != -1)){
				if(type == "Meter.Gas" || mappedType == "Meter.Gas"){
					unit = Util.CHAR.Gas;
				}else if(type == "Meter.WattHour" || mappedType == "Meter.WattHour"){
					unit = Util.CHAR.WattHour;
				}else if(type == "Meter.Water" || mappedType == "Meter.Water"){
					unit = Util.CHAR.Water;
				}else{
					unit = "";
				}
				status = DeviceUtil.getMeterCurrentConsumption(data);
				status += "<span class='unit'>" + unit + "</span>";

			//Temp. & Humi. 는 Normal 대신 온/습도 표시
			}else if((type && type.indexOf("Temperature") != -1) || (mappedType && mappedType.indexOf("Temperature") != -1)){
				status = DeviceUtil.getTempHumiTemperature(data, true);
				unit = Util.CHAR[Settings.getTemperature().unit];
				status += "<span class='unit'>" + unit + "</span>";
			}else if((type && type.indexOf("Humidity") != -1) || (mappedType && mappedType.indexOf("Humidity") != -1)){
				unit = Util.CHAR.Humidity;
				status = DeviceUtil.getTempHumiHumidity(data, true);
				status += "<span class='unit'>" + unit + "</span>";
			}else if ((type && type.indexOf("Motion") != -1) || (mappedType && mappedType.indexOf("Motion") != -1)){
				status = DeviceUtil.getMotionPresence(data);
			}else{
				status = split[0];
				if(!Util.isOnlyNormalType(data) || status[0] == "Alarm"){
					status += "(" + split[1] + ")";
				}
			}
		}else{
			//Alarm
			status = split[1];
			var alarm = Util.getRecentAlarm(data);
			//alarm = { name : "Sys_166"};

			if(alarm){
				//N/W 사는 상세 Description을 표시한다.
				if(isAsset || (type && (type == "Beacon" || type == "Gateway" || type == "CCTV"))){
					desc = Util.getAlarmDescription(alarm.name);
				}else{                //가전사는 Code 까지만 표기한다.
					desc = "Code " + alarm.name;
				}
			}
		}

		var pStatus = $("<p/>").addClass("cardName ellp").html(Util.getStatusI18N(status));
		var pDesc = $("<p/>").addClass("cardDesc ellp").text(desc);
		var pLocation = $("<p/>").addClass("loc ellp").text(location);
		var name = "";
		if(isAsset){
			/*var assetName = data.assets_types_name;
			var subAssetName = data.subAssetType;
			name = assetName;
			if(subAssetName){
				name += " / "+subAssetName;
			}*/
			name = data.number;
		}else{
			name = data.name;
		}
		var pName = $("<p/>").addClass("dvc ellp").text(name);
		var detailIcon = $("<i/>").addClass("ic ic-info").attr("data-id", data.id);

		divTextWrap.append(pStatus);
		divTextWrap.append(pDesc);
		divTextWrap.append(pLocation);
		divTextWrap.append(pName);
		divTextWrap.append(detailIcon);

		divMain.append(divTextWrap);

		subContainer.append(divMain);
		container.append(subContainer);
		return container.html();
	};

	/**
	*   <ul>
	*   <li>기기 타입 별 Statistic View 최상단 고정행를 표시하기 위한 Template</li>
	*   </ul>
	*   @function getStatisticRow
	*   @param {Object} e - List가 DataBound 될 때 전달되는 Event 객체
	*   @param {Boolean}isAsset - 자산 여부
	*   @param {Boolean}isBeacon - 비콘 여부
	*   @returns {HTMLString} - Statistic View 최상단 고정행을 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*
	*/
	var getStatisticRow = function(e, isAsset, isBeacon){
		var sender = e.sender;
		var data = sender.dataSource.view();
		var allData = $.grep(data, function(evt){ return evt.name.toLowerCase() == "all"; });
		if(allData && allData.length){
			var element = sender.element;
			element.find(".customStatisticRowStyles").remove();
			var item = sender.items().first().clone();
			item.attr("data-uid", "");
			item.data("uid", "");
			var cells = item.find("td[role='gridcell']");
			if(!cells.length) return;

			var title = "-";

			allData = allData[0];
			sender.dataSource.remove(allData);

			title = allData.name;
			$(cells.get(0)).html(title);
			if(isAsset){
				var subAssetNum = typeof allData.numberOfSubAssetTypes !== 'undefined' ? allData.numberOfSubAssetTypes : "-";
				var registerAssetNum = typeof allData.numberOfRegisteredAssets !== 'undefined' ? allData.numberOfRegisteredAssets : "-";
				var normalAssetNum = typeof allData.numberOfNormalDevices !== 'undefined' ? allData.numberOfNormalDevices : "-";
				var disconnectedAssetNum = typeof allData.numberOfDisconnectedDevices !== 'undefined' ? allData.numberOfDisconnectedDevices : "-";
				var lowBatteryAssetNum = typeof allData.numberOfLowBatteryDevices !== 'undefined' ? allData.numberOfLowBatteryDevices : "-";
				var outOfBoundAssetNum = typeof allData.numberOfOutOfBoundsDevices !== 'undefined' ? allData.numberOfOutOfBoundsDevices : "-";
				$(cells.get(1)).html(subAssetNum);
				$(cells.get(2)).html(registerAssetNum);
				$(cells.get(3)).html(normalAssetNum);
				$(cells.get(4)).html(disconnectedAssetNum);
				$(cells.get(5)).html(lowBatteryAssetNum).addClass("text-err");
				$(cells.get(6)).html(outOfBoundAssetNum).addClass("text-err");
			}else if(isBeacon){
				$(cells.get(1)).html(statisticBeaconRegister(allData));
				$(cells.get(2)).html(statisticBeaconPositionType(allData));
				$(cells.get(3)).html(statisticBeaconNormal(allData));
				$(cells.get(4)).html(statisticBeaconDisconnected(allData));
				$(cells.get(5)).html(statisticBeaconWrongLocation(allData));
				$(cells.get(6)).html(statisticBeaconLowBattery(allData));
				$(cells.get(7)).html(statisticBeaconSchdules(allData));		//[2018-04-16][statisticBeaconSchedules 함수가 존재하지않아 해당구문은 주석처리][2018-04-17][statisticBeaconSchedules -> statisticBeaconSchdules 수정]
				$(cells.get(8)).html(statisticBeaconRules(allData));
			}else{
				var registeredDevice = statisticNumberOfRegisteredDevice(allData);
				var criticalDevices = statisticNumberOfCritical(allData);
				var warningDevices = statisticNumberOfWarning(allData);
				var onDevice = statisticNumberOfOnDevices(allData);
				var offDevice = statisticNumberOfOffDevices(allData);
				$(cells.get(1)).html(registeredDevice);
				//SAC Indoor 통계 뷰
				var cellLength = cells.length;
				if(cellLength == 7){
					var indoorDevices, ventilatorDevices, DHWDevices, offIndoorDevices, offVentilatorDevices, offDHWDevices, schedules;
					indoorDevices = typeof allData.numberOfOnIndoorDevices !== 'undefined' ? allData.numberOfOnIndoorDevices : "-";
					ventilatorDevices = typeof allData.numberOfOnVentilatorDevices !== 'undefined' ? allData.numberOfOnVentilatorDevices : "-";
					DHWDevices = typeof allData.numberOfOnDHWDevices !== 'undefined' ? allData.numberOfOnDHWDevices : "-";
					offIndoorDevices = typeof allData.numberOfOffIndoorDevices !== 'undefined' ? allData.numberOfOffIndoorDevices : "-";
					offVentilatorDevices = typeof allData.numberOfOffVentilatorDevices !== 'undefined' ? allData.numberOfOffVentilatorDevices : "-";
					offDHWDevices = typeof allData.numberOfOffDHWDevices !== 'undefined' ? allData.numberOfOffDHWDevices : "-";
					schedules = typeof allData.numberOfSchedules !== 'undefined' ? allData.numberOfSchedules : "-";
					$(cells.get(2)).html(indoorDevices + "/" + ventilatorDevices + "/" + DHWDevices);
					$(cells.get(3)).html(offIndoorDevices + "/" + offVentilatorDevices + "/" + offDHWDevices);
					$(cells.get(4)).html(criticalDevices).addClass("text-err");
					$(cells.get(5)).html(warningDevices).addClass("text-err");
					$(cells.get(6)).html(schedules);
				}else if(cellLength == 6){      //On Off가 존재하는 타 기기 타입
					$(cells.get(2)).html(onDevice);
					$(cells.get(3)).html(offDevice);
					$(cells.get(4)).html(criticalDevices).addClass("text-err");
					$(cells.get(5)).html(warningDevices).addClass("text-err");
				}else if(cellLength == 5){      //Off가 없는 기기 타입 (e.g : Energy Meter)
					var normalDevice;
					normalDevice = statisticNumberOfNormalDevices(allData);

					$(cells.get(2)).html(normalDevice);
					$(cells.get(3)).html(criticalDevices).addClass("text-err");
					$(cells.get(4)).html(warningDevices).addClass("text-err");
				}
			}
			item.addClass("customStatisticRowStyles");
			var thead = element.find(".k-grid-header table thead");
			thead.append(item);
		}
	};

	var getStatisticRowAsset = function(e){
		getStatisticRow(e, true);
	};

	var getStatisticRowBeacon = function(e){
		getStatisticRow(e, false, true);
	};

	var statisticNumberOfWarning = function(data){
		var value = typeof data.numberOfWarningDevices !== 'undefined' ? data.numberOfWarningDevices : "-";
		return '<span class="text-err">' + value + '</span>';
	};

	var statisticNumberOfCritical = function(data){
		var value = typeof data.numberOfCriticalDevices !== 'undefined' ? data.numberOfCriticalDevices : "-";
		return '<span class="text-err">' + value + '</span>';
	};

	var statisticNumberOfRegisteredDevice = function(data){
		var value = typeof data.numberOfRegisteredDevices !== 'undefined' ? data.numberOfRegisteredDevices : "-";
		return value;
	};

	var statisticNumberOfNormalDevices = function(data){
		var value = typeof data.numberOfNormalDevices !== 'undefined' ? data.numberOfNormalDevices : "-";
		return value;
	};

	var statisticNumberOfOnDevices = function(data){
		var value = typeof data.numberOfOnDevices !== 'undefined' ? data.numberOfOnDevices : "-";
		return value;
	};

	var statisticNumberOfOnIndoorDevices = function(data){
		var value = "";
		var indoor = typeof data.numberOfOnIndoorDevices !== "undefined" ? data.numberOfOnIndoorDevices : "-";
		var ventilator = typeof data.numberOfOnVentilatorDevices !== "undefined" ? data.numberOfOnVentilatorDevices : "-";
		var dhw = typeof data.numberOfOnDHWDevices !== "undefined" ? data.numberOfOnDHWDevices : "-";
		value = indoor + "/" + ventilator + "/" + dhw;
		return value;
	};

	var statisticNumberOfOffDevices = function(data){
		var value = typeof data.numberOfOffDevices !== 'undefined' ? data.numberOfOffDevices : "-";
		return value;
	};

	var statisticNumberOfOffIndoorDevices = function(data){
		var value = "";
		var indoor = typeof data.numberOfOffIndoorDevices !== "undefined" ? data.numberOfOffIndoorDevices : "-";
		var ventilator = typeof data.numberOfOffVentilatorDevices !== "undefined" ? data.numberOfOffVentilatorDevices : "-";
		var dhw = typeof data.numberOfOffDHWDevices !== "undefined" ? data.numberOfOffDHWDevices : "-";
		value = indoor + "/" + ventilator + "/" + dhw;
		return value;
	};

	var statisticAssetFloor = function(data){
		//Sub Asset Type
		var value = "-";
		if(data.isSubAsset){
			return "";
		}
		// else{
		//     value = data.name ? data.name : "-";
		// }
		//[2018-04-16][if문 안에 return문이 있어 else문을 제거]
		value = data.name ? data.name : "-";
		return value;
	};

	var statisticAssetTypes = function(data){
		var value = "-";
		if(data.isSubAsset){
			var assetType = typeof data.assets_types_name !== 'undefined' ? data.assets_types_name : "-";
			var subAssetType = typeof data.assets_subAssetType !== 'undefined' ? (" / " + data.assets_subAssetType) : "";
			value = assetType + subAssetType;
		}else{
			value =  typeof data.numberOfSubAssetTypes !== 'undefined' ? data.numberOfSubAssetTypes : "-";
		}
		return value;
	};

	var statisticAssetRegisteredAssets = function(data){
		var value = typeof data.numberOfRegisteredAssets !== 'undefined' ? data.numberOfRegisteredAssets : "-";
		return value;
	};

	var statisticAssetNormalDevices = function(data){
		var value = typeof data.numberOfNormalDevices !== 'undefined' ? data.numberOfNormalDevices : "-";
		return value;
	};

	var statisticAssetCriticalDevices = function(data){
		var value = typeof data.numberOfCriticalDevices !== 'undefined' ? data.numberOfCriticalDevices : "-";
		return value;
	};

	var statisticAssetWarningDevices = function(data){
		var value = typeof data.numberOfWarningDevices !== 'undefined' ? data.numberOfWarningDevices : "-";
		return value;
	};

	var statisticAssetDisconnectedDevices = function(data){
		var value = typeof data.numberOfDisconnectedDevices !== 'undefined' ? data.numberOfDisconnectedDevices : "-";
		return value;
	};

	var statisticAssetOutOfBoundsDevices = function(data){
		var value = typeof data.numberOfOutOfBoundsDevices !== 'undefined' ? data.numberOfOutOfBoundsDevices : "-";
		return "<span class='text-err'>" + value + "</span>";
	};

	var statisticAssetLowBatteryDevices = function(data){
		var value = typeof data.numberOfLowBatteryDevices !== 'undefined' ? data.numberOfLowBatteryDevices : "-";
		return "<span class='text-err'>" + value + "</span>";
	};

	var getStatusTemplate = function(data){
		//[2018-04-16][변수선언후 미사용 주석처리]
		// var container = $("<div/>");
		// var span = $("<span/>");
		var value = Util.getStatus(data);
		value = value.replace(".", "-");
		return "<div><span class='circle-icon " + value + "'></span></div>";
	};

	var getAssetStatusTemplate = function(data){
		var status = Util.getAssetStatus(data);
		status = status.replace(".", "-");
		return "<div><span class='circle-icon " + status + "'></span></div>";
	};

	var assetTypeListTemplate = function(data){
		var name = data.name;
		var cssType = name.toLowerCase();

		var deviceIcon = "<span class='detail-img asset " + cssType + "'></span>";
		var htmlName = "<span data-bind='text: name'>" + Util.decodeHtml(name) + "</span>";	//[2018-04-16][변수명 name -> htmlName 수정]
		var status = "<span class='panel-item-temp'><span></span></span>";
		return (deviceIcon + htmlName + status);
	};

	var statisticBeaconRegister = function(data){
		var registeredDevice = statisticNumberOfRegisteredDevice(data);
		return "<div class='tb beacon'><span class='tbc col-1'>" + registeredDevice + "</span></div>";
	};

	var statisticBeaconPositionType = function(data){
		var fixedDevice = typeof data.numberOfFixedDevices !== 'undefined' ? data.numberOfFixedDevices : "-";
		var movableDevice = typeof data.numberOfMovableDevices !== 'undefined' ? data.numberOfMovableDevices : "-";
		return "<div class='tb beacon'><span class='tbc col-2'>" + I18N.prop("FACILITY_DEVICE_BEACON_TYPE_FIXED_TYPE") + "</span><span class='tbc col-3'>" + fixedDevice + "</span></div>" +
				"<div class='tb beacon'><span class='tbc col-2'>"  + I18N.prop("FACILITY_DEVICE_BEACON_TYPE_MOVABLE_TYPE") + "</span><span class='tbc col-3'>" + movableDevice + "</span></div>";
	};

	var statisticBeaconNormal = function(data){
		var fixedNormalDevice = typeof data.numberOfFixedNormalDevices !== 'undefined' ? data.numberOfFixedNormalDevices : "-";
		var movableNormalDevice = typeof data.numberOfMovableNormalDevices !== 'undefined' ? data.numberOfMovableNormalDevices : "-";
		return "<div class='tb beacon'><span class='tbc col-4'>" + fixedNormalDevice + "</span></div><div class='tb beacon'><span class='tbc col-4'>" + movableNormalDevice + "</span></div>";
	};

	var statisticBeaconDisconnected = function(data){
		var fixedDevice = typeof data.numberOfFixedCriticalDevices !== 'undefined' ? data.numberOfFixedCriticalDevices : "-";
		var movableDevice = typeof data.numberOfMovableCriticalDevices !== 'undefined' ? data.numberOfMovableCriticalDevices : "-";
		return "<div class='tb beacon'><span class='tbc col-5'>" + fixedDevice + "</span></div><div class='tb beacon'><span class='tbc col-5'>" + movableDevice + "</span></div>";
	};

	var statisticBeaconWrongLocation = function(data){
		var fixedDevice = typeof data.numberOfFixedWarningDevices !== 'undefined' ? data.numberOfFixedWarningDevices : "-";
		var movableDevice = typeof data.numberOfMovableWarningDevices !== 'undefined' ? data.numberOfMovableWarningDevices : "-";
		return "<div class='tb text-err beacon'><span class='tbc col-6'>" + fixedDevice + "</span></div><div class='tb text-err beacon'><span class='tbc col-6'>" + movableDevice + "</span></div>";
	};

	var statisticBeaconLowBattery = function(data){
		var fixedDevice = typeof data.numberOfFixedLowBatteryDevices !== 'undefined' ? data.numberOfFixedLowBatteryDevices : "-";
		var movableDevice = typeof data.numberOfMovableLowBatteryDevices !== 'undefined' ? data.numberOfMovableLowBatteryDevices : "-";
		return "<div class='tb text-err beacon'><span class='tbc col-7'>" + fixedDevice + "</span></div><div class='tb text-err beacon'><span class='tbc col-7'>" + movableDevice + "</span></div>";
	};

	var statisticBeaconSchdules = function(data){
		var fixedDevice = typeof data.numberOfFixedSchedules !== 'undefined' ? data.numberOfFixedSchedules : "-";
		var movableDevice = typeof data.numberOfMovableSchedules !== 'undefined' ? data.numberOfMovableSchedules : "-";
		return "<div class='tb beacon'><span class='tbc col-8'>" + fixedDevice + "</span></div><div class='tb beacon'><span class='tbc col-8'>" + movableDevice + "</span></div>";
	};

	var statisticBeaconRules = function(data){
		var fixedDevice = typeof data.numberOfFixedRules !== 'undefined' ? data.numberOfFixedRules : "-";
		var movableDevice = typeof data.numberOfMovableRules !== 'undefined' ? data.numberOfMovableRules : "-";
		return "<div class='tb beacon'><span class='tbc col-9'>" + fixedDevice + "</span></div><div class='tb beacon'><span class='tbc col-9'>" + movableDevice + "</span></div>";
	};

	/**
	*   <ul>
	*   <li>기기 상세 팝업에서 기기 상세 정보 내 기기 상태를 아이콘과 다국어가 적용된 Text로 표시하기 위한 Template</li>
	*   </ul>
	*   @function detailStatusIconTemplate
	*   @param {Object} dataItem - 기기 정보
	*   @returns {HTMLString} - 기 상세 팝업에서 기기 상세 정보 내 기기 상태를 아이콘과 다국어가 적용된 Text를 표시 하기위한 HTML String
	*   @alias module:app/device/common/device-template
	*/
	var detailStatusIconTemplate = function(dataItem){
		var status = Util.getStatus(dataItem);
		var splits = status.split(".");
		var icon = "<span class='circle-icon detail-popup " + splits[0] + "-" + splits[1] + "'></span>";

		if(status.indexOf("Alarm") > -1){
			var container = $("<div/>");
			status = status.replace(".", "-");
			var alarm = Util.getRecentAlarm(dataItem);
			var type = alarm.type;
			var i18nType = I18N.prop("FACILITY_DEVICE_STATUS_POPUP_" + type.toUpperCase());
			type = i18nType ? i18nType : type;
			var spanCurrent = $("<span/>").addClass(status).text(type + " " + I18N.prop("COMMON_CODE") + " " + alarm.name);
			var spanDesc = $("<span/>").text(Util.getAlarmDescription(alarm.name));

			container.append(icon);
			container.append(spanCurrent);
			container.append("<br>");
			container.append(spanDesc);
			return container.html();
		}
		//[2018-04-16][return문 존재해서 else문을 제거]
		var statusDisplayText = splits[0];
		//var normalStatus = icon + splits[0];
		if(!Util.isOnlyNormalType(dataItem) || status[0] == "Alarm"){
			statusDisplayText += "(" + splits[1] + ")";
		}
		var i18nStatus = Util.getStatusI18N(statusDisplayText);
		return icon + i18nStatus;

	};

	var detailIconTemplateById = function(data){
		var id = data.id;
		return '<span class="ic ic-info" data-num="detail" data-id=' + id + ' data-event="devicedetail"></span>';
	};

	var indoorLegendTemplate = '<div class="flyoutBox">' +
		'<ul class="legendList">' +
			'<li><span class="disc g"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_ON") + '</li>' +
			'<li><span class="disc m"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_OFF") + '</li>' +
			'<li><span class="disc r"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL") + '</li>' +
			'<li><span class="disc y"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_WARNING") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-peak"></Label>' + I18N.prop("FACILITY_INDOOR_STATUS_PEAK") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-deforest"></Label>' + I18N.prop("FACILITY_INDOOR_STATUS_DEFROST") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-filter" ></Label>' + I18N.prop("FACILITY_INDOOR_STATUS_FILTER_WARNING") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-rc-disable"></Label>' + I18N.prop("FACILITY_INDOOR_STATUS_RC_OFF") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-rock"></Label>' + I18N.prop("FACILITY_INDOOR_STATUS_OPERATION_LIMIT") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-thurmo"></Label>' + I18N.prop("FACILITY_INDOOR_TEMPERATURE_LIMIT") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-schedule"></Label>' + I18N.prop("FACILITY_DEVICE_SAC_INDOOR_SCHEDULE") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-spi"></Label>' + I18N.prop("FACILITY_INDOOR_CONTROL_SPI") + '</li>' +
			'<li data-bind="invisible : hideIndoorLegend"><Label class="ic-antifreeze"></Label>' + I18N.prop("FACILITY_INDOOR_STATUS_FREEZE_PROTECTION") + '</li>' +
		'</ul>' +
	'</div>';

	var beaconLegendTemplate = '<div class="flyoutBox lg">' +
		'<ul class="legendList">' +
			'<li><span class="disc g"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL") + '</li>' +
			'<li class="no-block"><span class="disc r"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL") + '</li>' +
			'<li class="no-block"><span class="disc y"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_WARNING") + '</li>' +
		'</ul>' +
		'<ul class="legendList">' +
			'<li><span class="disc gr"></span>' + I18N.prop("FACILITY_DEVICE_BEACON_TYPE_FIXED") + '</li>' +
			'<li><span class="disc measured gr"></span>' + I18N.prop("FACILITY_DEVICE_BEACON_TYPE_MOVABLE") + '</li>' +
		'</ul>' +
	'</div>';

	var pointLegendTemplate = '<div class="flyoutBox">' +
		'<ul class="legendList">' +
			'<li><span class="disc g"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_ON") + '</li>' +
			'<li><span class="disc m"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_OFF") + '</li>' +
		'</ul>' +
	'</div>';

	var baseLegendTemplate = '<div class="flyoutBox">' +
			'<ul class="legendList">' +
				'<li><span class="disc g"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL") + '</li>' +
				'<li><span class="disc r"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL") + '</li>' +
				'<li><span class="disc y"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_WARNING") + '</li>' +
			'</ul>' +
		'</div>' +
	'</div>';

	var legendTemplate = //'<img src="url(../../src/main/resources/static-dev/imgages/flyout-legends.png)" alt="" class="flyTail" />' +
		'<div class="flyoutBox">' +
			'<ul class="legendList">' +
				'<li><span class="disc g"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_ON") + '</li>' +
				'<li><span class="disc m"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_OFF") + '</li>' +
				'<li><span class="disc r"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL") + '</li>' +
				'<li><span class="disc y"></span>' + I18N.prop("FACILITY_DEVICE_STATUS_WARNING") + '</li>' +
			'</ul>' +
		'</div>' +
	'</div>';

	var indoorTemperatureListTemplate = function(data){
		var container = $("<div/>");
		var divCurrent = $("<div/>");
		var alarm = Util.getRecentAlarm(data);
		var status = Util.getStatus(data).replace(".", "-");
		var spanCurrent;
		if(alarm){
			var value = I18N.prop("COMMON_CODE") + " " + alarm.name;
			spanCurrent = $("<span/>").addClass(status).text(value);
			divCurrent.append(spanCurrent);
			container.append(divCurrent);
		}else{
			var temperatures = DeviceUtil.getTemperatures(data, true);
			var current, desired;
			current = temperatures.current;
			desired = temperatures.desired;

			spanCurrent = $("<span/>").addClass(status).addClass("current").text(current);
			var spanDesired = $("<span/>").addClass(status).addClass("set").text(desired);
			divCurrent.append(spanDesired);
			divCurrent.append(" / ");
			divCurrent.append(spanCurrent);
			container.append(divCurrent);

			if(temperatures.dhwDesired || temperatures.dhwCurrent){
				var divDhw = $("<div/>");
				var spanDhwCurrent = $("<span/>").addClass(status).addClass("current").text(temperatures.dhwCurrent);
				var spanDhwDesired = $("<span/>").addClass(status).addClass("set").text(temperatures.dhwDesired);

				divDhw.append(spanDhwDesired);
				divDhw.append(" / ");
				divDhw.append(spanDhwCurrent);
				container.append(divDhw);
			}
		}

		return container.html();
	};

	var indoorCardTemplate = function(data){
		var mode = Util.getDisplayMode(data.modes, data.operations);
		var status = Util.getStatus(data);
		status = status.replace(".", "-");
		var model;
		if(data.information && data.information.modelName){
			model = "I" + data.information.modelName.toUpperCase().replace(/\s/gi, "").replace("+", "PLUS");
		}

		var container = $("<div/>");

		var subContainer = $("<div/>").addClass("card-item").attr("data-uid", data.uid).attr("data-id", data.id);
		if(data.selected){
			subContainer.addClass("k-state-selected");
		}
		var divMain = $("<div/>");

		var divIcon = $("<div/>").addClass("icon-line");
		var divCard = $("<div/>").addClass("card-info");
		var divLeft = $("<div/>").addClass("left");
		var divRight = $("<div/>").addClass("right");
		var spanModeText = $("<span/>").addClass("type").addClass(status);

		var divName = $("<div/>").addClass("item-bottom");
		//이름이 없을 경우에 대한 방어코드 필요하며, 이름 없을 경우 undefined 로 표시 요청 SAM-291
		var name = data.name;
		if(name && name.length > 10){
			name = name.substring(0, 10);
			name += "...";
		}
		var spanName = $("<span/>").addClass("device-type-img " + model).text(name);
		var alarm = Util.getRecentAlarm(data);

		//css class와 영문 표시에 사용되는 변수
		var engMode;
		if(alarm){
			engMode = "error";

			divMain.addClass("card-back " + status);
			spanModeText.text(" ");
			divIcon.append("<div class='icon empty'/>");
			// for(var i = 0, length = icons.length; i < length; i++){
			// 	divIcon.append('<div class="icon ' + icons[i] + '"/>');
			// }
			var alarmTxt = status.split("-")[1];
			alarmTxt = I18N.prop("FACILITY_INDOOR_MODE_" + alarmTxt.toUpperCase());
			alarmTxt = "<span class='error'>" + alarmTxt + "</p><p>" + I18N.prop("COMMON_CODE") + " " + alarm.name + "</p>";
			var spanCurrent = $("<span/>").addClass("error " + status).html(alarmTxt);
			divRight.append(spanCurrent);
			divName.addClass("error");
		}else{
			if(mode === "HotWater") mode = "HeatStorage";

			engMode = DeviceUtil.convertDisplayName(mode);
			var displayMode;
			//한글일 경우에 I18N을 적용한다.
			if(globalLocale == "ko"){
				displayMode = Util.getModeToI18N(mode);
			}else{
			//영문일 경우 Text 자르기를 수행한다. (기존 Grid View 정책)
				displayMode = engMode;
			}

			// SMAR-958 HeatSt -> H.Water로변경요청. mode를 변경 안하는 이유는 에서 사용하기 때문.
			if(displayMode === "HeatStorage") spanModeText.text("H.Water");
			else spanModeText.text(displayMode);

			var icons = DeviceUtil.getGridIcon(data);
			var temperatures = DeviceUtil.getTemperatures(data);

			var current, desired, unit;
			current = temperatures.current;
			desired = temperatures.desired;
			unit = temperatures.unit;

			var iconLength = icons.length;
			if(iconLength){
				for(var i = 0, length = icons.length; i < length; i++){
					divIcon.append('<div class="icon ' + icons[i] + '"/>');
				}
			}else{
				divIcon.append("<div class='icon empty'/>");
			}

			var spanDesireTemp = $("<span/>").addClass(status).addClass("set");

			if(temperatures.isWaterout)
				$("<div/>").addClass("icon ic-dhwtemp-card").appendTo(spanDesireTemp);

			$("<em/>").text(I18N.prop("FACILITY_INDOOR_SET")).appendTo(spanDesireTemp);
			spanDesireTemp.append(desired);
			spanDesireTemp.attr('data-content', unit);

			var spanCurrentTemp = $("<span/>").addClass(status).addClass("current");
			$("<em/>").text(I18N.prop("FACILITY_INDOOR_CURRENT")).appendTo(spanCurrentTemp);
			spanCurrentTemp.append(current);
			spanCurrentTemp.attr('data-content', unit);

			divRight.append(spanDesireTemp);
			divRight.append(spanCurrentTemp);
		}
		var spanModeIcon = $("<span/>").addClass("device-img " + engMode + " " + status);

		divLeft.append(spanModeText);
		divLeft.append(spanModeIcon);

		divCard.append(divLeft);
		divCard.append(divRight);

		divName.append(spanName);
		divName.append('<i class="ic ic-info" data-id=' + data.id + '>');

		divMain.append(divIcon);
		divMain.append(divCard);
		divMain.append(divName);

		subContainer.append(divMain);
		container.append(subContainer);
		return container.html();
	};

	var outdoorDropDownListTemplate = kendo.template('<span title="" class="k-widget k-dropdown k-header common-grid-dropdown sac-indoor-dropdownlist"' +
		'unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="" aria-disabled="false" aria-busy="false"' +
		'aria-activedescendant="80142285-e564-4717-88fa-3dd3d64ad025" data-field="#=field#">' +
		'<span unselectable="on" class="k-dropdown-wrap #if(disabled){#k-state-disabled#}else{#k-state-default#}#">' +
		'<span unselectable="on" class="k-input">#=text#</span>' +
		'<span unselectable="on" class="k-select" aria-label="select">' +
		'<span class="k-icon k-i-arrow-60-down"></span></span></span>' +
		'<input class="sac-indoor-dropdownlist current-limit" data-value="#=value#" style="display: none;">' +
		'</span>');

	var outdoorCurrentLimitTemplate = function(data){
		var value = "-";
		var textValue;
		var conditioner = data["airConditioner"];
		var outdoorUnit;
		if(conditioner){
			outdoorUnit = conditioner.outdoorUnit;
			if(outdoorUnit){
				value = outdoorUnit.electricCurrentControl;
				if(!value) value = "-";
				textValue = value;
				if(!isNaN(value)){
					textValue += "%";
				}else{
					textValue = I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_SELF_CONTROL");
				}
			}
		}

		var container = $("<div/>");
		$("<span/>").addClass("sac-indoor-span-left").text(I18N.prop("FACILITY_INDOOR_CURRENT") + ": " + textValue).appendTo(container);

		var airConditioner = data.airConditioner;
		var disabled = false;
		if(airConditioner){
			outdoorUnit = airConditioner.outdoorUnit;
		}
		if(outdoorUnit){
			disabled = !outdoorUnit.electricCurrentControlSupported;
		}

		if(value == "-") value = Constants.outdoorControlConfig.electricCurrentControl[0].value;
		$(outdoorDropDownListTemplate({ value : value, text : textValue, disabled : disabled, field : "electricCurrentControl"}))
			.addClass('outdoor-dropdownlist')
			.appendTo(container);

		return container.html();
	};

	var outdoorHeatingCapacityCalibrationTemplate = function(data){
		var value = "-";
		var conditioner = data["airConditioner"];
		var textValue;
		var outdoorUnit;
		if(conditioner){
			outdoorUnit = conditioner.outdoorUnit;
			if(outdoorUnit){
				value = outdoorUnit.heatingCapacityCalibration;
				if(!value) value = "-";
				textValue = value;
				if(!isNaN(value)){
					textValue += "kg/cm²";
				}else{
					textValue = I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_SELF_CONTROL");
				}
			}
		}

		var container = $("<div/>");
		$("<span/>").addClass("sac-indoor-span-left").text(I18N.prop("FACILITY_INDOOR_CURRENT") + ": " + textValue).appendTo(container);

		var airConditioner = data.airConditioner;
		var disabled = false;
		if(airConditioner){
			outdoorUnit = airConditioner.outdoorUnit;
		}
		if(outdoorUnit){
			disabled = !outdoorUnit.heatingCapacityCalibrationSupported;
		}

		if(value == "-") value = Constants.outdoorControlConfig.heatingCapacityCalibration[0].value;
		$(outdoorDropDownListTemplate({ value : value, text : textValue, disabled : disabled, field : "heatingCapacityCalibration"}))
			.addClass('outdoor-dropdownlist')
			.appendTo(container);

		return container.html();
	};

	var outdoorCoolingCapacityCalibrationTemplate = function(data){
		var value = "-";
		var conditioner = data["airConditioner"];
		var textValue;
		var outdoorUnit;
		if(conditioner){
			outdoorUnit = conditioner.outdoorUnit;
			if(outdoorUnit){
				value = outdoorUnit.coolingCapacityCalibration;
				if(!value) value = "-";
				if(value != "SelfControl"){
					var cools = Constants.outdoorControlConfig.coolingCapacityCalibration[temperatureUnit];
					var find = $.grep(cools, function(e){ return e.value == value; });
					textValue = find[0] ? find[0].text : "-";
				}else{
					textValue = I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_SELF_CONTROL");
				}
			}
		}

		var container = $("<div/>");
		$("<span/>").addClass("sac-indoor-span-left").appendTo(container).text(I18N.prop("FACILITY_INDOOR_CURRENT") + ": " + textValue);

		var airConditioner = data.airConditioner;
		var disabled = false;
		if(airConditioner){
			outdoorUnit = airConditioner.outdoorUnit;
		}
		if(outdoorUnit){
			disabled = !outdoorUnit.coolingCapacityCalibrationSupported;
		}

		if(value == "-") value = Constants.outdoorControlConfig.coolingCapacityCalibration[temperatureUnit][0].value;
		$(outdoorDropDownListTemplate({ value : value, text : textValue, disabled : disabled, field : "coolingCapacityCalibration"}))
			.addClass('cooling-capacity-calibaration-dropdownlist')
			.addClass('outdoor-dropdownlist')
			.appendTo(container);

		return container.html();
	};

	var pointTypeTemplate = function(data){
		var type = data.type.replace("ControlPoint.", "");
		return type;
	};

	var pointValueTemplate = function(data){
		if(!data.controlPoint){
			return "-";
		}
		var value = data.controlPoint.value;
		var type = data.type;

		var template;
		if(type.indexOf("AO") != -1 || type.indexOf("AV") != -1){
			template = '<input class="device-point-numeric" data-type="aoav" value="' + value + '" style="width:50%; text-align:center;"/><button class="device-point-sendbtn">' + I18N.prop("COMMON_BTN_SEND") + '</button>';
			return template;
		}else if(type.indexOf("DO") != -1 || type.indexOf("DV") != -1){
			template = '<input class="device-point-numeric" data-type="dodv" value="' + value + '" style="width:50%; text-align:center;"/><button class="device-point-sendbtn">' + I18N.prop("COMMON_BTN_SEND") + '</button>';
			return template;
		}
		return value;
	};

	var gatewayListZigbeeTemplate = function(data){
		var status = DeviceUtil.getZigbeeStatus(data);
		var splits = status.split(".");
		var icon = "<span class='circle-icon detail-popup " + splits[0] + "-" + splits[1] + "'></span>";
		return icon;
	};

	var gatewayListBleTemplate = function(data){
		var status = DeviceUtil.getBleStatus(data);
		var splits = status.split(".");
		var icon = "<span class='circle-icon detail-popup " + splits[0] + "-" + splits[1] + "'></span>";
		return icon;
	};

	var gatewayListBleInterfaceTemplate = function(data){
		var i, max = 3;
		var status, splits, icon = "";
		for( i = 0; i < max; i++ ){
			status = DeviceUtil.getBleInterfaceStatus(data, i);
			splits = status.split(".");
			icon += "<span class='beacon-status'><span class='circle-icon detail-popup " + splits[0] + "-" + splits[1] + "'></span></span>";
		}
		return icon;
	};

	var bleMacAddressTemplate = function(data){
		var uuid = DeviceUtil.getBleMacAddress(data);
		return "<span class='ellipse'>" + uuid + "</span>";
	};

	var bleUUIDTemplate = function(data){
		var uuid = DeviceUtil.getBleUUID(data);
		return "<span class='ellipse'>" + uuid + "</span>";
	};

	return {
		mapListTemplate : mapListTemplate,
		multiDetailListTemplate : multiDetailListTemplate,
		detailPopupGroupListTemplate : detailPopupGroupListTemplate,
		multiDetailRegisterListTemplate : multiDetailRegisterListTemplate,
		multiDetailListDualTemplate : multiDetailListDualTemplate,
		mapListRegTemplate : mapListRegTemplate,
		mapListDualTemplate : mapListDualTemplate,
		getDeviceCardTemplate : getDeviceCardTemplate,
		statisticNumberOfCritical: statisticNumberOfCritical,
		statisticNumberOfWarning : statisticNumberOfWarning,
		statisticNumberOfRegisteredDevice : statisticNumberOfRegisteredDevice,
		statisticNumberOfNormalDevices : statisticNumberOfNormalDevices,
		statisticNumberOfOnDevices : statisticNumberOfOnDevices,
		statisticNumberOfOnIndoorDevices : statisticNumberOfOnIndoorDevices,
		statisticNumberOfOffDevices: statisticNumberOfOffDevices,
		statisticNumberOfOffIndoorDevices : statisticNumberOfOffIndoorDevices,
		getStatusTemplate : getStatusTemplate,
		getStatisticRow : getStatisticRow,
		getAssetStatusTemplate: getAssetStatusTemplate,
		assetMapListRegTemplate: assetMapListRegTemplate,
		getStatisticRowAsset : getStatisticRowAsset,
		getStatisticRowBeacon : getStatisticRowBeacon,
		statisticAssetFloor: statisticAssetFloor,
		statisticAssetTypes: statisticAssetTypes,
		statisticAssetRegisteredAssets : statisticAssetRegisteredAssets,
		statisticAssetNormalDevices : statisticAssetNormalDevices,
		statisticAssetCriticalDevices : statisticAssetCriticalDevices,
		statisticAssetWarningDevices : statisticAssetWarningDevices,
		statisticAssetDisconnectedDevices : statisticAssetDisconnectedDevices,
		statisticAssetLowBatteryDevices : statisticAssetLowBatteryDevices,
		statisticAssetOutOfBoundsDevices : statisticAssetOutOfBoundsDevices,
		assetTypeListTemplate : assetTypeListTemplate,
		statisticBeaconRegister : statisticBeaconRegister,
		statisticBeaconPositionType : statisticBeaconPositionType,
		statisticBeaconNormal : statisticBeaconNormal,
		statisticBeaconDisconnected : statisticBeaconDisconnected,
		statisticBeaconWrongLocation : statisticBeaconWrongLocation,
		statisticBeaconLowBattery : statisticBeaconLowBattery,
		statisticBeaconSchdules : statisticBeaconSchdules,
		statisticBeaconRules : statisticBeaconRules,
		detailStatusIconTemplate: detailStatusIconTemplate,
		detailIconTemplateById : detailIconTemplateById,
		indoorLegendTemplate : indoorLegendTemplate,
		beaconLegendTemplate : beaconLegendTemplate,
		pointLegendTemplate: pointLegendTemplate,
		baseLegendTemplate : baseLegendTemplate,
		legendTemplate : legendTemplate,
		indoorTemperatureListTemplate : indoorTemperatureListTemplate,
		indoorCardTemplate : indoorCardTemplate,
		outdoorDropDownListTemplate : outdoorDropDownListTemplate,
		outdoorCurrentLimitTemplate : outdoorCurrentLimitTemplate,
		outdoorHeatingCapacityCalibrationTemplate : outdoorHeatingCapacityCalibrationTemplate,
		outdoorCoolingCapacityCalibrationTemplate : outdoorCoolingCapacityCalibrationTemplate,
		pointTypeTemplate : pointTypeTemplate,
		pointValueTemplate : pointValueTemplate,
		gatewayListZigbeeTemplate : gatewayListZigbeeTemplate,
		gatewayListBleTemplate : gatewayListBleTemplate,
		gatewayListBleInterfaceTemplate : gatewayListBleInterfaceTemplate,
		bleMacAddressTemplate : bleMacAddressTemplate,
		bleUUIDTemplate : bleUUIDTemplate
	};

});

//# sourceURL=device/common/device-template.js
