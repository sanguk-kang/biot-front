/**
*
*   <ul>
*       <li>Device 기능 Utility</li>
*   </ul>
*   @module app/device/common/device-util
*   @requires app/core/util
*
*/


define("device/common/device-util", ["device/common/device-constants"], function(constants){
	"use strict";

	var MENU  = "Facility.Device";

	var MainWindow = window.MAIN_WINDOW;
	var Settings = window.GlobalSettings;
	var CommonUtil = window.Util;
	var I18N = window.I18N;
	var kendo = window.kendo;

	/**
	*   <ul>
	*   <li>Settings에서 설정된 기본 뷰 타입을 가져온다</li>
	*   </ul>
	*   @function getDefaultView
	*   @returns {String} - 기본 뷰 타입
	*   @alias module:app/device/common/device-util
	*
	*/
	var getDefaultView = function(){
		var defaultViews = Settings.getDefaultViewType();
		var length = defaultViews.length;
		var deviceDefaultView = "statistic";

		for(var i = 0; i < length; i++ ){
			if(defaultViews[i].menu == MENU){
				deviceDefaultView = defaultViews[i].view;
				deviceDefaultView = deviceDefaultView.toLowerCase();
				break;
			}
		}
		return deviceDefaultView;
	};

	/**
	*   <ul>
	*   <li>FNB에 전체 층이 선택 여부를 체크한다.</li>
	*   </ul>
	*   @function isAllFloorCheck
	*   @returns {Boolean} - 전체 층 선택 여부
	*   @alias module:app/device/common/device-util
	*
	*/
	var isAllFloorCheck = function(){
		var isAllFloor = false;
		var currentFloor = MainWindow.getCurrentFloor();
		if(currentFloor && currentFloor.floor){
			if(currentFloor.floor.value == "ALL"){
				isAllFloor = true;
			}
		}
		return isAllFloor;
	};

	/**
	*   <ul>
	*   <li>View 표시 조건에 따른 FNB 건물/층 이동, View 전환 여부를 체크한다.</li>
	*   </ul>
	*   @function goClick
	*   @param {Boolean}isMonitoring - Monitoring View 여부
	*   @param {Boolean}isFloorChange - 층 변경 여부
	*   @param {String|Number}floorID - 층 정보 ID 값
	*   @param {Number}indexCurrent - 현재 View Index (Statistic, List, Map, Grid)
	*   @returns {Object} - 조건에 따른 FNB 건물/층 이동, View 전환 정보
	*   @alias module:app/device/common/device-util
	*
	*/
	var goClick = function(isMonitoring, isFloorChange, floorID, indexCurrent){
		var go = {};

		var indexView;
		if(typeof indexCurrent === 'undefined'){
			var savedType = window.localStorage.getItem("deviceViewType");
			if(savedType){
				indexView = constants.VIEW[savedType];
				window.localStorage.removeItem("deviceViewType");
			}else{
				indexView = constants.VIEW[getDefaultView().toUpperCase()];
			}
		}else{
			indexView = indexCurrent;
		}

		if(isMonitoring){
			//FloorNavigation 변경 시.
			if(isFloorChange){

				//navigation 변경으로 바뀐 floorID로 들어옴.
				if(floorID == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID || floorID == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
					if(indexView === constants.VIEW["MAP"]){
						indexView = constants.VIEW["STATISTIC"];
					}
				}else if(indexView === constants.VIEW["STATISTIC"]){
					indexView = constants.VIEW["MAP"];
				}
			}else if(indexView === constants.VIEW["MAP"]){
				if(floorID == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
					go["building"] = true;
				}else if(floorID == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){

					//true면 첫번째 층으로 이동.
					go["floor"] = true;
				}
			}else if(indexView === constants.VIEW["STATISTIC"]){
				if(floorID != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID && floorID != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
					//false면 all floor로 이동.
					go["floor"] = false;
				}
			}
			// else{	//view button list변경 시
			// 	if(indexView === constants.VIEW["MAP"]){
			// 		if(floorID == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			// 			go["building"] = true;
			// 		}else if(floorID == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			//
			// 			//true면 첫번째 층으로 이동.
			// 			go["floor"] = true;
			// 		}
			// 	}else if(indexView === constants.VIEW["STATISTIC"]){
			// 		if(floorID != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID && floorID != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			// 			//false면 all floor로 이동.
			// 			go["floor"] = false;
			// 		}
			// 	}
			// }
		}else{
			//if(isFloorChange){
			//if(floorID == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID || floorID == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			//go["building"] = true;
			//}
			//}

			//// Monitoring -> Registration 의 변경으로 Total빌딩일떄는 첫번째 빌딩의 첫번쨰 층으로 이동되게.
			//else{
			if(floorID == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
				go["building"] = true;
			}else if(floorID == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){	// All Floor일때 첫번쨰 층으로 이동되게/

				//true면 첫번째 층으로 이동.
				go["floor"] = true;
			}
			//}

			//이때는 무조건 Map View이다.
			indexView = constants.VIEW["MAP"];
		}


		//첫번쨰 floor층 이동인데 빌딩에 등록된 floor가 없는 케이스가 있다. 이때는 All Floor로 이동.
		if(go.floor && !MainWindow.getCurrentFloorList().length){
			go["floor"] = false;
			go["noFloor"] = true; // Map Button 을 disabled해주기 위해 존재.
		}

		//// 빌딩 변경과 관련되어있을 때,
		//else if(go.building !== undefined){

		//// 첫번째 building이동인 등록된 빌딩이 없을 때,
		//if(go.building && !MainWindow.getCurrentBuildingList().length){
		//go["building"] = false;
		//}
		//else{
		//// 첫번째 building이동 시 빌딩이 변경되므로 floor list정보를 다시 받아와야 한다.
		//}
		//}

		go["view"] = indexView;
		return go;

	};

	/**
	*   <ul>
	*   <li>기기 상태 정보를 얻는다.</li>
	*   </ul>
	*   @function getStatus
	*   @param {Object}data - 기기 정보 객체
	*   @returns {String} - 기기 상태 정보
	*   @alias module:app/device/common/device-util
	*
	*/
	var getStatus = function(data){
		return CommonUtil.getStatus(data);
	};

	/**
	*   <ul>
	*   <li>기기 위치 정보를 Text로 얻는다.</li>
	*   </ul>
	*   @function getLocation
	*   @param {Object}data - 기기 정보 객체
	*   @returns {String} - 기기 위치 정보 Text
	*   @alias module:app/device/common/device-util
	*/
	var getLocation = function(data){

		var value = data.locations;
		var text = "-";
		if(typeof data.assets_types_id !== 'undefined'){
			return getAssetLocation(data);
		}

		if(value){
			if(value.length > 0){

				text = "";
				var temp = value[0];

				if(temp.description){
					return temp.description;
				}

				if(temp.foundation_space_buildings_id){
					text += temp.foundation_space_buildings_id + " ";
				}

				if(temp.foundation_space_floors_id){
					text += temp.foundation_space_floors_id;
				}
			}
		}
		return text;
	};

	/**
	*   <ul>
	*   <li>기기의 현재 위치 정보를 Text로 얻는다.</li>
	*   </ul>
	*   @function getCurrentLocation
	*   @param {Object}data - 기기 정보 객체
	*   @returns {String} - 기기 현재 위치 정보 Text
	*   @alias module:app/device/common/device-util
	*/
	var getCurrentLocation = function(data){
		var value = data.locations;
		var i, max, text = "-";

		if(value){
			max = value.length;
			for( i = 0; i < max; i++ ){
				if(value[i].id == "Measured"){
					text = "";
					var temp = value[i];

					if(temp.description){
						return temp.description;
					}

					if(temp.foundation_space_buildings_id){
						text += temp.foundation_space_buildings_id + " ";
					}

					if(temp.foundation_space_floors_id){
						text += temp.foundation_space_floors_id;
					}
					break;
				}
			}
		}
		return text;
	};

	/**
	*   <ul>
	*   <li>기기의 그룹 정보를 Text로 얻는다.</li>
	*   </ul>
	*   @function getGroup
	*   @param {Object}data - 기기 정보 객체
	*   @returns {String} - 기기 그룹 정보 Text
	*   @alias module:app/device/common/device-util
	*/
	var getGroup = function(data){

		var value = data.groups;
		var text = "-";

		if(value){
			var length = value.length;
			if(length > 0){

				text = "";
				text = value[0].dms_groups_name;	//[2018-04-16][var 제거]
				if(text){
					if(length > 1){
						text += "(+" + (length - 1) + ")";
					}
				}

				/*for(var i = 0; i < length; i++){
					var name = value[i].dms_groups_name;
					if(name)
						text += name;

					if(i != length-1){
						text += ", "
					}
				}*/
			}
		}
		return CommonUtil.decodeHtml(text);
	};

	/**
	*   <ul>
	*   <li>실내기 모드의 텍스트 길이를 제한한다.</li>
	*   </ul>
	*   @function convertDisplayName
	*   @param {String}mode - 모드 텍스트
	*   @returns {String} - 길이가 제한된 모드 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var convertDisplayName = function(mode){
		if(mode && mode.length > constants.DISPLAY_NAME_MAX){
			return mode.substr(0, constants.DISPLAY_NAME_MAX);
		}
		return mode;
	};

	/*
	 * [key]
	 * isWaterout
	 * desired
	 * current
	 * unit
	 */
	/**
	*   <ul>
	*   <li>실내기 모드에 따른 현재/설정 온도를 표시하기 위한 각 모드 별 텍스트 데이터를 얻는다. </li>
	*   </ul>
	*   @function getTemperatures
	*   @param {Object}data - 기기 정보 객체
	*   @param {Boolean}hasUnit - 단위를 붙여 표시하는지의 여부
	*   @returns {Object} - 실내기 모드 별 설정/현재 온도 정보 객체
	*   @alias module:app/device/common/device-util
	*/
	var getTemperatures = function(data, hasUnit){
		var temperatures = data.temperatures, airConditioner = data.airConditioner;
		var current = "-", desired = "-", dhwDesired, dhwCurrent;
		var isWaterout = false;
		var unit;
		var temp;		//[2018-04-16][temp 상위에 선언하고 기존 var 문 제거]

		if(airConditioner && airConditioner.temperatureReference){
			if(airConditioner.temperatureReference.indexOf("WaterOutlet") > -1) isWaterout = true;
		}

		if(temperatures){
			var length = temperatures.length;
			if(length > 0){

				if(isWaterout){
					temp = $.grep(temperatures, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet"; });
					if(temp && temp.length){
						temp = temp[0];
						if(typeof temp.desired !== 'undefined')  desired = temp.desired.toFixed(1);
					}
				}


				temp = $.grep(temperatures, function(e){ return e.id == "AirConditioner.Indoor.Room"; });
				if(temp && temp.length){
					temp = temp[0];
					if(!isWaterout) if(typeof temp.desired !== 'undefined') desired = temp.desired.toFixed(1);
					if(typeof temp.current !== 'undefined') current = temp.current.toFixed(1);
				}

				temp = $.grep(temperatures, function(e){ return e.id == "AirConditioner.Indoor.DHW"; });
				if(temp && temp.length){
					temp = temp[0];
					if(typeof temp.desired !== 'undefined') dhwDesired = temp.desired.toFixed(1);
					if(typeof temp.current !== 'undefined') dhwCurrent = temp.current.toFixed(1);
				}

				temp = $.grep(temperatures, function(e){ return e.id == "AirConditioner.Outdoor"; });
				if(temp && temp.length){
					temp = temp[0];
					if(typeof temp.desired !== 'undefined') desired = temp.desired.toFixed(1);
					if(typeof temp.current !== 'undefined') current = temp.current.toFixed(1);
				}
			}
		}

		//모드가 송풍모드이면 설정온도는 - 로 표시된다.
		var modes = data.modes;
		if(modes){
			temp = $.grep(modes, function(e){ return e.id == "AirConditioner.Indoor.General" && e.mode == "Fan"; });
			if(temp && temp.length) desired = "-";
		}

		var tempSetting = Settings.getTemperature();
		if(tempSetting.unit === "Celsius"){
			unit = "°C";
		}else{
			unit = "℉";
			//if(desired !== "-") desired = Util.getFahrenheit(desired, hasUnit);
			//if(current !== "-") current = Util.getFahrenheit(current, hasUnit);

			//if(dhwDesired) dhwDesired = Util.getFahrenheit(dhwDesired, hasUnit);
			//if(dhwCurrent) dhwCurrent = Util.getFahrenheit(dhwCurrent, hasUnit);
		}
		if(desired !== "-" && hasUnit) desired += unit;
		if(current !== "-" && hasUnit) current += unit;

		if(dhwDesired && hasUnit) dhwDesired += unit;
		if(dhwCurrent && hasUnit) dhwCurrent += unit;

		return {isWaterout : isWaterout, desired : desired, current : current, unit : unit, dhwDesired : dhwDesired, dhwCurrent : dhwCurrent};
	};

	/**
	*   <ul>
	*   <li>화면에 표시할 현재 온도 텍스트를 얻는다.</li>
	*   </ul>
	*   @function curTemperatures
	*   @param {Object}data - 기기 정보 객체
	*   @returns {String} - 현재 온도 표시 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var curTemperatures = function(data){
		var temp = getTemperatures(data, true);
		var dhwCurrent = temp["dhwCurrent"];

		if(dhwCurrent) return temp["current"] + ", " + dhwCurrent;
		return temp["current"];
	};

	/**
	*   <ul>
	*   <li>화면에 표시할 설정 온도 텍스트를 얻는다.</li>
	*   </ul>
	*   @function setTemperatures
	*   @param {Object}data - 기기 정보 객체
	*   @returns {String} - 설정 온도 표시 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var setTemperatures = function(data){
		var temp = getTemperatures(data, true);
		var dhwDesired = temp["dhwDesired"];

		if(dhwDesired) return temp["desired"] + ", " + dhwDesired;
		return temp["desired"];
	};
	/**
	*   <ul>
	*   <li>화면에 표시할 실외 온도 텍스트를 얻는다.</li>
	*   </ul>
	*   @function curOutdoorTemperatures
	*   @param {Object}data - 기기 정보 객체
	*   @returns {String} - 실외 온도 표시 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var curOutdoorTemperature = function(data){		//[2018-04-16][파라메타 hasUnit 미사용 제거]
		var temp = getTemperatures(data, true);
		return temp["current"];
	};

	//	var getRecentAlarm = function(data){
	//		var alarm;
	//		var alarms = data.alarms;
	//		if(alarms && alarms.length){
	//			alarms.sort(function(a,b){return a.alarms_type < b.alarms_type ? -1 : a.alarms_eventTime > b.alarms_eventTime ? 0 : 1;});
	//
	//			alarm = {};
	//			alarm.id = alarms[0].alarms_id;
	//			alarm.type = alarms[0].alarms_type;
	//			alarm.name = alarms[0].alarms_name;
	//			alarm.time = alarms[0].alarms_eventTime;
	//		}
	//		return alarm;
	//	};

	/*
	 * 최대 5개 상태까지 표시
	 * 우선 순위 : Peak > RC OFF > Operation limit > Temp. limit > Defrost > Filter Warning > Schedule > MDS > SPI > Freeze Protection
	 */
	/**
	*   <ul>
	*   <li>실내기 모드 별 표시할 Icon의 CSS Class를 얻는다.</li>
	*   </ul>
	*   @function getGridIcon
	*   @param {Object}data - 기기 정보 객체
	*   @returns {Array} - CSS Class 정보 리스트
	*   @alias module:app/device/common/device-util
	*/
	var getGridIcon = function(data){
		var cnt = 0;
		var displays = [];

		// 1) Peak, /airConditioner의 powerPeakControl가 On이면, 피크 제어중.
		var airConditioner = data.airConditioner;
		if(airConditioner){
			var powerPeakControl = airConditioner.peakPowerControl;
			if(powerPeakControl && powerPeakControl === "On" && cnt < 5){
				displays[cnt++] = "ic-peak";
			}
		}

		// 2) 리모컨 금지, /configuration의 remoteControl가 NotAllowed이면, 리모컨 금지중.
		var configuration = data.configuration;
		if(configuration){
			var remoteControl = configuration.remoteControl;
			if(remoteControl && remoteControl === "NotAllowed" && cnt < 5 ){
				displays[cnt++] = "ic-rc-disable";
			}
		}

		// 3) 운전모드 제한, /modes의 AirConditioner.Indoor.ModeLimit이 CoolOnly 또는 HeatOnly이면, 운전모드 제한중.
		var modes = data.modes;
		if(modes){
			var opmodeLimit = $.grep(modes, function(e){ return e.id == "AirConditioner.Indoor.ModeLimit"; });
			var limit = opmodeLimit[0] ? opmodeLimit[0].mode : void 0;
			if(limit && (limit === "HeatOnly" || limit === "CoolOnly") && cnt < 5){
				displays[cnt++] = "ic-rock";
			}
		}

		/*
		 4) 설정온도 제한,
		 /temperatures/ 확인
		 - 실내온도 제한 : AirConditioner.Indoor.Room.Cool.Limit의 enabled가 true면 제한중.
					   AirConditioner.Indoor.Room.Heat.Limit 의 enabled가 true면 제한중.
		 - 출수온도 제한 : AirConditioner.Indoor.WaterOutlet.Cool.Limit의 enabled값이 true면 제한중.
					   AirConditioner.Indoor.WaterOutlet.Heat.Limit의 enabled값이 true면 제한중.
		 - 급탕온도 제한 : AirConditioner.Indoor.DHW.Limit의 enabled값이 true면 제한중.
		 */
		var temperatures = data.temperatures;
		if(temperatures){
			var grepData = [];
			grepData.push($.grep(temperatures, function(e){ return e.id == "AirConditioner.Indoor.Room.Cool.Limit"; }));
			grepData.push($.grep(temperatures, function(e){ return e.id == "AirConditioner.Indoor.Room.Heat.Limit"; }));
			grepData.push($.grep(temperatures, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.Cool.Limit";}));
			grepData.push($.grep(temperatures, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.Heat.Limit";}));
			grepData.push($.grep(temperatures, function(e){ return e.id == "AirConditioner.Indoor.DHW.Limit"; }));

			var isEnabled = false;
			var length = grepData.length;
			for(var i = 0; i < length; i++){
				var temp = grepData[i][0];
				if(temp && temp.enabled){
					isEnabled = true;
					break;
				}
			}

			if(isEnabled && cnt < 5){
				displays[cnt++] = "ic-thurmo";
			}
		}

		if(airConditioner){
			// 5) 제상, /airConditioner의 defrost이 On이면, 제상임.
			var defrost = airConditioner.defrost;
			if(defrost && defrost === "On" && cnt < 5){
				displays[cnt++] = "ic-deforest";
			}

			// 6) 필터교체, /airConditioner의 filterResetRequired가 true이면, 필터 교체 대상.
			var filterResetRequired = airConditioner.filterResetRequired;
			if(filterResetRequired && cnt < 5){
				displays[cnt++] = "ic-filter";
			}
		}

		// 7) 스케줄, /schedules에서 금일 실행될 스케줄이 있으면, 스케줄 적용.
		var schedules = data.schedules;
		if(schedules && schedules.length > 0 && cnt < 5){
			displays[cnt++] = "ic-schedule";
		}

		if(airConditioner){

			// 8) SPI, /airConditioner의 spi가 On이면, SPI 운전중.
			var spi = airConditioner.spi;
			if(spi && spi === "On" && cnt < 5){
				displays[cnt++] = "ic-spi";
			}

			// 9) 동파운전, /airConditioner/chiller의 freezeProtection이 On이면, 동파운전중임.
			var chiller = airConditioner.chiller;
			if(chiller){
				var freezeProtection = chiller.freezeProtection;
				if(freezeProtection && freezeProtection === "On" && cnt < 5){
					displays[cnt++] = "ic-antifreeze";
				}
			}
		}

		return displays;
	};

	//deprecated
	var columnMode = function(data){

		var container = $("<div/>");
		var span = $("<span/>");
		var value = data.modes;

		if(value){
			if(value.length) value = value[0].mode;
			else value = "-";
		}else value = "-";

		span.text(value).appendTo(container);
		return container.html();
	};


	/*
	 * attr0 : 0depth attribute
	 * attr1 : 1depth attribute
	 */
	/**
	*   <ul>
	*   <li>kendoDataSource에서 Filter할 객체 정보를 얻는다.</li>
	*   </ul>
	*   @function filter1Depth
	*   @param {String}attr0 - 필터링할 필드 Attribute
	*   @param {String}attr1 - 1Depth 아래의 필터링할 필드 Attribute
	*   @param {String|Number|Boolean}val - 필터링할 Value
	*   @returns {Object} - Filter Object
	*   @alias module:app/device/common/device-util
	*/
	var filter1Depth = function(attr0, attr1, val){
		var id;
		if(val === "vAuto"){
			id = "AirConditioner.Indoor.Ventilator";
			val = "Auto";
		}
		return { field : attr0, operator: function(item, value){
			if(value == "") return true;
			if(!item || !item.length) return;

			var i, length = item.length;
			if(value == "undefined"){
				for( i = 0; i < length; i++ ){
					if(typeof item[i][attr1] === 'undefined'){
						return true;
					}
				}
			}else{
				for(i = 0; i < length; i++){
					if(item[i][attr1] == value){
						if(id){
							 if(id === item[i]["id"]) return true;
							 return;
						}
						return true;
					}
				}
			}


		}, value : val};
	};

	//[]가 아닌 {} 속성인 어트리뷰트에 대한 Filter1Depth
	/**
	*   <ul>
	*   <li>kendoDataSource에서 Filter할 객체 정보를 얻는다.</li>
	*   </ul>
	*   @function filter1DepthObj
	*   @param {String}attr0 - 필터링할 필드 Attribute
	*   @param {String}attr1 - 1Depth 아래의 필터링할 필드 Attribute
	*   @param {String|Number|Boolean}val - 필터링할 Value
	*   @returns {Object} - Filter Object
	*   @alias module:app/device/common/device-util
	*/
	var filter1DepthObj = function(attr0, attr1, val){
		return { field : attr0, operator : function(item, value){
			if(value == "") return true;
			if(!item) return;

			if(value == "undefined"){
				if(typeof item[attr1] === 'undefined'){
					return true;
				}
			}else if(item[attr1] == value){
				return true;
			}
		}, value : val};
	};

	var filter1DepthNone = function(attr0, attr1, val){
		return { field : attr0, operator: function(item, value){
			if(value == "") return true;
			if(!item || !item.length) return;

			var length = item.length;
			for(var i = 0; i < length; i++){
				if(item[i][attr1] != value){
					return;
				}
			}

			return true;
		}, value : val};
	};

	// None은 키는있지만 값이 없는것을 체크하고 Null은 해당 key가 존재하는지를 체크.
	var filter1DepthNull = function(attr0){
		return { field : attr0, operator: function(item){		//[2018-04-16][파라메타 value 미사용 제거]
			if(!item) return;
			var length = item.length;
			if(length === 0) return true;

		}};
	};

	var filter2Depth = function(attr0, attr1, attr2, val){
		return { field : attr0, operator: function(item, value){
			if(value == "") return true;
			if(!item || !item.length) return;

			val = val == "undefined" ? void 0 : val;
			var i, length = item.length;
			var j, max, attr1Item, attr2Item;
			for(i = 0; i < length; i++){
				attr1Item = item[i][attr1];
				if(!attr1Item || !attr1Item.length) return;
				max = attr1Item.length;
				for( j = 0; j < max; j++ ){
					attr2Item = attr1Item[j][attr2];
					if(typeof attr2Item !== 'undefined'){
						if($.isFunction(value)){
							value = value(attr2Item);
						}
						if(attr2Item == value){
							return true;
						}
					}
				}
			}

		}, value : val};
	};

	/*
	 * attr : group attribute
	 * attr0 : 1depth attribute
	 * val0 : value of attr0
	 * attr1 : 1depth attribute
	 * val1 : value of attr1
	 *
	 */
	var filterStatusNoAlarm = function(group0, attr0, val0, group1){
		var filters = [];
		if(val0 === "On")
			filters.push(filter1Depth(group0, attr0, val0));
		else
			filters.push(filter1DepthNone(group0, attr0, val0));

		filters.push(filter1DepthNull(group1));

		var filter = { logic : "and", filters : filters };
		return filter;
	};

	/*
	 * attr0 : 0depth attribute
	 *
	 */
	var filter0Depth = function(attr0, oper, val){
		return { field : attr0, operator: oper, value : val};
	};

	var filter0DepthEmptyList = function(attr0){
		return { field : attr0, operator: function(item){
			if(!item || !item.length){
				return;
			}
			return true;
		}};
	};

	var filterHasListAttrItem = function(listAttributeName, hasListItem){
		return { field : listAttributeName, operator : function(item){
			if(!item || !item.length) return !hasListItem;
			return hasListItem;
		}};
	};

	/**
	*   <ul>
	*   <li>/statisticView API를 통하여 응답된 통계 데이터를 UI에 표시하도록 파싱한다.</li>
	*   </ul>
	*   @function convertStatistic
	*   @param {Number|String}buildingID - 현재 선택한 건물의 ID 값
	*   @param {Array}data - 서버로부터 응답된 통계 데이터
	*   @param {Boolean}isAsset - 자산 통계 여부
	*   @returns {Array} - Statistic View에 표시하기 위한 List Data
	*   @alias module:app/device/common/device-util
	*/
	var convertStatistic = function(buildingID, data, isAsset){		//[2018-04-16][isBeacon 파라메타 미사용 제거]
		var convertData = [];
		var i,length,obj;		//[2018-04-16][중복선언되었던 변수들 상위로 선언]

		if(buildingID == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			for(i = 0, length = data.length; i < length; i++){
				obj = {};
				$.each(data[i], function(key, value) {
					if(key === "foundation_space_buildings_id"){
						key = "id";
					}else if(key === "foundation_space_buildings_name"){
						key = "name";
					}
					obj[key] = value;
				});
				convertData.push(obj);
			}
		}else{
			for(i = 0, length = data.length; i < length; i++){
				if(buildingID == data[i].foundation_space_buildings_id){
					var floors = data[i].floors;

					for(var j = 0, flength = floors.length; j < flength; j++){
						obj = {};
						$.each(floors[j], function(key, value) {
							if(key === "foundation_space_floors_id"){
								key = "id";
							}else if(key === "foundation_space_floors_name"){
								key = "name";

								var type = obj["type"];
								if(type === "B") value = type + value;
								else if(type == "F") value = value + type;
							}else if(key === "foundation_space_floors_type"){
								key = "type";
							}
							obj[key] = value;
						});
						convertData.push(obj);
						if(isAsset){
							var assetTypes = floors[j].assetTypes;
							var assetName;
							if(assetTypes){
								var k, l, max, size = assetTypes.length;
								var subAssetTypes, subTypeObj;
								for( k = 0; k < size; k++ ){
									assetName = assetTypes[k].assets_types_name;
									subAssetTypes = assetTypes[k].subAssetTypes;
									max = subAssetTypes.length;
									for( l = 0; l < max; l++ ){
										subTypeObj = $.extend({}, obj, subAssetTypes[l]);
										subTypeObj.isSubAsset = true;
										subTypeObj.assets_types_name = assetName;
										convertData.push(subTypeObj);
									}
								}
							}
						}
					}

					var allData = $.extend({}, data[i]);
					allData.id = allData.foundation_space_buildings_id;
					allData.name = "All";
					convertData.push(allData);

					break;
				}
			}
		}

		return convertData;
	};

	/**
	*   <ul>
	*   <li>Type, Status, Zone, Mode 등의 필터 정보를 조합하여 Multi Filtering이 가능한 Object를 얻는다.</li>
	*   </ul>
	*   @function getAccureFilter
	*   @param {Array}accureFilters - 빌딩/층/등록상태 필터 정보 리스트
	*   @param {Array}typeFilters - 타입 필터 정보 리스트
	*   @param {Array}statusFilters - 상태 필터 정보 리스트
	*   @param {Array}zoneFilters - 존 필터 정보 리스트
	*   @param {Array}modeFilters - 모드 필터 정보 리스트
	*   @returns {Array} - 멀티 필터링을 하기 위한 필터 정보 리스트
	*   @alias module:app/device/common/device-util
	*/
	var getAccureFilter = function(accureFilters, typeFilters, statusFilters, zoneFilters, modeFilters){
		var logicAccureFilter;
		if(!(accureFilters && accureFilters.length)){
			logicAccureFilter = { logic : "and", filters : [] };
		}else{
			logicAccureFilter = { logic : "and", filters : accureFilters };
		}


		if(typeFilters && typeFilters.length){
			var logicTypeFilter = { logic : "and", filters : typeFilters };
			logicAccureFilter.filters.push(logicTypeFilter);
			//logicAccureFilter = { logic : "and", filters : [logicAccureFilter, logicTypeFilter] };
		}

		if(statusFilters && statusFilters.length){
			var logicStatusFilter = { logic : "or", filters : statusFilters };
			logicAccureFilter.filters.push(logicStatusFilter);
			//logicAccureFilter = { logic : "and", filters : [logicAccureFilter, logicStatusFilter] };
		}

		if(zoneFilters && zoneFilters.length){
			var logicZoneFilter = { logic : "or", filters : zoneFilters };
			logicAccureFilter.filters.push(logicZoneFilter);
			//logicAccureFilter = { logic : "and", filters : [logicAccureFilter, logicZoneFilter] };
		}

		if(modeFilters && modeFilters.length){
			var logicModeFilter = { logic : "or", filters : modeFilters };
			logicAccureFilter.filters.push(logicModeFilter);
			//logicAccureFilter = { logic : "and", filters : [logicAccureFilter, logicModeFilter] };
		}
		return logicAccureFilter;
	};


	var getAccureFilterOlder = function(accureFilters, typeFilters, statusFilters, zoneFilters, modeFilters){
		var logicAccureFilter;
		if(!(accureFilters && accureFilters.length)){
			logicAccureFilter = { logic : "and", filters : [] };
		}else{
			logicAccureFilter = { logic : "and", filters : accureFilters };
		}


		if(typeFilters && typeFilters.length){
			var logicTypeFilter = { logic : "and", filters : typeFilters };
			logicAccureFilter = { logic : "and", filters : [logicAccureFilter, logicTypeFilter] };
		}

		if(statusFilters && statusFilters.length){
			var logicStatusFilter = { logic : "or", filters : statusFilters };
			logicAccureFilter = { logic : "and", filters : [logicAccureFilter, logicStatusFilter] };
		}

		if(zoneFilters && zoneFilters.length){
			var logicZoneFilter = { logic : "or", filters : zoneFilters };
			logicAccureFilter = { logic : "and", filters : [logicAccureFilter, logicZoneFilter] };
		}

		if(modeFilters && modeFilters.length){
			var logicModeFilter = { logic : "or", filters : modeFilters };
			logicAccureFilter = { logic : "and", filters : [logicAccureFilter, logicModeFilter] };
		}
		return logicAccureFilter;
	};

	/**
	*   <ul>
	*   <li>기기 선택 상태 텍스트를 얻는다.</li>
	*   </ul>
	*   @function calcScreenBySelect
	*   @param {Array}data - 선택한 기기 리스트
	*   @param {Number}total - 전체 기기 개수
	*   @param {Number}display - 표시된 기기 개수
	*   @returns {String} - 다국어가 적용된 기기 선택 상태 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var calcScreenBySelect = function(data, total, display){
		var cnt = data.length;
		var cntText;
		if(cnt > 0){
			/*if(cnt > 999){
				cnt = "999+";
			}*/
			cntText = I18N.prop("FACILITY_DEVICE_SELECTED", cnt);
		}else if(typeof total === 'undefined' || typeof display === 'undefined') cntText = "";	//cntText = I18N.prop("FACILITY_DEVICE_NO_SELECTED");
		else cntText = I18N.prop("FACILITY_DEVICE_NO_SELECTED_TOTAL", total, display);
		//[2018-04-16][else안에 유일한명령어 if문인 문제를 해결하기위해 else if문을 선언하여 수정]


		return cntText;
	};

	var calcScreenByOnlySelect = function(data){
		var cnt = data.length;
		var cntText;
		if(cnt > 0){
			/*if(cnt > 999){
				cnt = "999+";
			}*/
			cntText = I18N.prop("FACILITY_DEVICE_SELECTED", cnt);
		}else{
			cntText = I18N.prop("FACILITY_DEVICE_NO_SELECTED");
		}

		return cntText;
	};

	/**
	*   <ul>
	*   <li>Energy Meter Category Type을 얻는다.</li>
	*   </ul>
	*   @function getMeterCategoryType
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 다국어가 적용된 Energy Meter Category Type텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getMeterCategoryType = function(data){
		var i, meters, max, category, val = "-";
		meters = data.meters;
		if(meters){
			val = "";
			max = meters.length;
			for( i = 0; i < max; i++ ){
				category = meters[i].category;
				if(category){
					if(category == "AirConditionerAll"){
						category = "SAC";
					}
					val += category;
					if(i != (max - 1)){
						val += ", ";
					}
				}
			}
			val = val ? val : "Others";
			val = val.toUpperCase();
			val = I18N.prop("FACILITY_DEVICE_ENERGY_METER_CATEGORY_TYPE_" + val);
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>Energy Meter Type을 얻는다.</li>
	*   </ul>
	*   @function getMeterCategoryType
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 다국어가 적용된 Energy Meter Type 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getMeterType = function(data){
		var value = "-";
		var type = data.type;
		if(type){
			if(type.indexOf("ControlPoint") != -1){
				type = data.mappedType;
			}
			value = CommonUtil.getDisplayType(type);
			value = value ? value : "WattHour";
			value = value.toUpperCase();
			value = I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_" + value);
			//Meter Type이 아니지만, Meter Type을 표시하는 경우, WATTHOUR가 기본 값.
			if(!value){
				value = I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_WATTHOUR");
			}
		}

		return value;
	};
	/**
	*   <ul>
	*   <li>Energy Meter 현재 소비량을 얻는다.</li>
	*   </ul>
	*   @function getMeterCategoryType
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Energy Meter 현재 소비량
	*   @alias module:app/device/common/device-util
	*/
	var getMeterCurrentConsumption = function(data){
		var i, meters, max, val = "", current;
		var type = data.type;
		if(type && type.indexOf("ControlPoint") != -1){
			var controlPoint = data.controlPoint;
			if(controlPoint && typeof controlPoint.value !== 'undefined'){
				// val = kendo.toString(controlPoint.value, '0.0').replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				val = CommonUtil.convertNumberFormat(controlPoint.value);
			}
		}else{
			meters = data.meters;
			if(meters){
				max = meters.length;
				for( i = 0; i < max; i++ ){
					//current = meters[i].readingToday;
					current = CommonUtil.convertNumberFormat(meters[i].reading);
					if(current !== null && typeof current !== 'undefined'){
						val += current;
						if(i != (max - 1)){
							val += ", ";
						}
					}
				}
			}
		}

		val = val != "" ? val : "-";
		return val;
	};

	/**
	*   <ul>
	*   <li>기기 타입에 따른 현재 소비량과 소비량 단위를 얻는다.</li>
	*   </ul>
	*   @function getMeterCurrentConsumptionUnit
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Energy Meter 현재 소비량과 단위가 합쳐진 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getMeterCurrentConsumptionUnit = function(data){
		var type = data.type, mappedType = data.mappedType;
		var unit = "";
		var Util = window.Util;
		if(type == "Meter.Gas" || mappedType == "Meter.Gas"){
			unit = Util.CHAR.Gas;
		}else if(type == "Meter.WattHour" || mappedType == "Meter.WattHour"){
			unit = Util.CHAR.WattHour;
		}else if(type == "Meter.Water" || mappedType == "Meter.Water"){
			unit = Util.CHAR.Water;
		}else{
			unit = "";
		}
		var val = getMeterCurrentConsumption(data);
		return val + unit;
	};

	/**
	*   <ul>
	*   <li>밝기 값을 얻는다.</li>
	*   </ul>
	*   @function getDimmingLevel
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 밝기 값 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getDimmingLevel = function(data){
		var val = "-";
		// var type = data.type;		//[2018-04-16][해당변수를 사용하던 기존 코드가 주석처리되어 미사용변수가됨 주석처리]
		//Lights로 통합
		/*if(type && type.indexOf("ControlPoint") != -1 &&
		   //AO/AI인 경우 ControlPoint Value로 밝기 표시
		   (type.indexOf("AO") != -1 || type.indexOf("AI") != -1)){
			if(data.controlPoint && data.controlPoint.value !== undefined){
				val = data.controlPoint.value+"%";
			}
		}else{*/
		var level, light = data.lights || data.light;
		if(light && light[0]){
			light = light[0];
			level = light.dimmingLevel;
			if(typeof level === 'undefined'){
				val = "-";
			}else{
				val = Math.round(level) + "%";
			}
		}
		//}
		return val;
	};
	/**
	*   <ul>
	*   <li>온도 또는 습도 값 텍스트를 얻는다.</li>
	*   </ul>
	*   @function getTempHumiTemperature
	*   @param {Object}data - 기기 정보
	*   @param {Boolean}noUnit - 단위를 표시하지 않는지의 여부
	*   @returns {String} - 온도 또는 습도 값 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getTempHumiTemperature = function(data, noUnit){
		var val = "-";
		var unit, temp = data.temperatures;
		var type = data.type;
		//Temp.로 변환된 ControlPoint 일 경우
		if(type && type.indexOf("ControlPoint") != -1){
			var mappedType = data.mappedType;
			if(mappedType && mappedType.indexOf("Temperature") != -1){
				var controlPoint = data.controlPoint;
				if(controlPoint && typeof controlPoint.value !== 'undefined'){
					val = controlPoint.value;
				}
			}
		}else if(temp && temp[0]){
			temp = temp[0];
			val = temp.current;
		}

		val = CommonUtil.convertNumberFormat(val);
		if(val != "-" && !noUnit){
			var tempSetting = Settings.getTemperature();
			if(tempSetting.unit === "Celsius"){
				unit = "°C";
			}else{
				unit = "℉";
			}
			val += unit;
		}

		return val;
	};

	var getTempHumiHumidity = function(data, noUnit){
		var val = "-";
		var unit, humi = data.humidities;
		var type = data.type;
		//Humi.로 변환된 ControlPoint 일 경우
		if(type && type.indexOf("ControlPoint") != -1){
			var mappedType = data.mappedType;
			if(mappedType && mappedType.indexOf("Humidity") != -1){
				var controlPoint = data.controlPoint;
				if(controlPoint && typeof controlPoint.value !== 'undefined'){
					val = controlPoint.value;
				}
			}
		}else if(humi && humi[0]){
			humi = humi[0];
			val = humi.current;
		}

		val = CommonUtil.convertNumberFormat(val);
		if(val != "-" && !noUnit){
			unit = "%";
			val += unit;
		}

		return val;
	};

	/**
	*   <ul>
	*   <li>모션 센서의 부재/재부재 상태를 다국어가 적용된 텍스트로 얻는다.</li>
	*   </ul>
	*   @function getMotionPresence
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 다국어가 적용된 부재/재부재 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getMotionPresence = function(data){
		var val = "-";
		var presence = data.presences;
		if(presence && presence[0]){
			presence = presence[0];
			val = presence.detected;
			val = val ? I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_PRESENCE") : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_ABSENCE");
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>기기의 IP주소를 얻는다.</li>
	*   </ul>
	*   @function getIpAddress
	*   @param {Object}data - 기기 정보
	*   @returns {String} - IP 주소
	*   @alias module:app/device/common/device-util
	*/
	var getIpAddress = function(data){
		var val = "-";
		var type, key, network = data.networks;
		if(network && network[0]){
			network = network[0];
			type = data.type;
			//Type 별 참조하는 Key가 다르다.
			if(type == "CCTV"){
				key = "ethernet";
			}else{
				key = "ethernet";
			}
			if(network[key]){
				val = network[key].ipAddress;
				val = val ? val : "-";
			}
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>기기의 WIFI IP주소를 얻는다.</li>
	*   </ul>
	*   @function getIpAddress
	*   @param {Object}data - 기기 정보
	*   @returns {String} - WIFI IP 주소
	*   @alias module:app/device/common/device-util
	*/
	var getWifiIpAddress = function(data){
		var val = "-";
		var network = data.networks;
		// var type, key;		//[2018-04-16][변수선언후 미사용 주석처리]

		if(network && network[1]){
			network = network[1];
			//console.log("[getWifiIpAddress : " + network.wifi.ipAddress + "]");
			if(network.wifi){
				val = network.wifi.ipAddress;
				val = val ? val : "-";
			}
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>기기의 맥 주소를 얻는다.</li>
	*   </ul>
	*   @function getMacAddress
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 맥 주소
	*   @alias module:app/device/common/device-util
	*/
	var getMacAddress = function(data){
		var val = "-";
		var type, key, network = data.networks;
		if(network && network[0]){
			network = network[0];
			type = data.type;
			//Type 별 참조하는 Key가 다르다.
			if(type == "CCTV"){
				key = "ethernet";
			}else{
				key = "ethernet";
			}

			if(network[key]){
				val = network[key].macAddress;
				val = val ? val : "-";
			}
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>기기의 WIFI 맥 주소를 얻는다.</li>
	*   </ul>
	*   @function getWifiMacAddress
	*   @param {Object}data - 기기 정보
	*   @returns {String} - WIFI 맥 주소
	*   @alias module:app/device/common/device-util
	*/
	var getWifiMacAddress = function(data){

		var val = "-";
		var network = data.networks;
		// var type, key;		//[2018-04-16][변수선언후 미사용]

		if(network && network[1]){
			network = network[1];
			//console.log("[getWifiMacAddress : " + network.wifi.macAddress + "]");
			if(network.wifi){
				val = network.wifi.macAddress;
				val = val ? val : "-";
			}
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>기기의 WIFI 채널을 얻는다.</li>
	*   </ul>
	*   @function getWifiChannel
	*   @param {Object}data - 기기 정보
	*   @returns {String} - WIFI 채널
	*   @alias module:app/device/common/device-util
	*/
	var getWifiChannel = function(data){
		var val = "-";
		// var type, key;		//[2018-04-16][변수선언후 미사용 주석처리]
		var network = data.networks;
		if(network && network[1]){
			network = network[1];
			//console.log("[getWifiChannel : " + network.wifi.channel + "]");
			if(network.wifi){
				val = network.wifi.channel;
				val = val ? val : "-";
			}
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>기기의 WIFI RSSI를 얻는다.</li>
	*   </ul>
	*   @function getWifiRssi
	*   @param {Object}data - 기기 정보
	*   @returns {String} - WIFI RSSI
	*   @alias module:app/device/common/device-util
	*/
	var getWifiRssi = function(data){
		var val = "-";
		// var type, key;	//[2018-04-16][변수선언후 미사용 주석처리]
		var network = data.networks;
		if(network && network[1]){
			network = network[1];
			//console.log("[getWifiRssi : " + network.wifi.rssi + "]");
			if(network.wifi){
				val = network.wifi.rssi;
				val = val ? val : "-";
			}
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>CCTV 기기의 WIFI 상태를 얻는다.</li>
	*   </ul>
	*   @function getCCTVWifiStatus
	*   @param {Object}data - 기기 정보
	*   @returns {String} - CCTV 기기의 WIFI 상태
	*   @alias module:app/device/common/device-util
	*/
	var getCCTVWifiStatus = function(data){
		var val = "-";
		// var i, max;		//[2018-04-16][변수선언후 미사용 주석처리]
		var alarms, alarmType, network = data.networks;
		if(network && network[1]){
			network = network[1];
			if(!network.connected){
				val = "Disconnected";
			}else{
				alarms = data.alarms;
				if(alarms && alarms.length > 0){
					//alarms_name = CCTV_WIFI_STATUS
					alarms.sort(function(a, b){
						a = a.alarms_event ? a.alarms_event : "-";
						b = b.alarms_event ? b.alarms_event : "-";

						return b.localeCompare(a);
					});
					alarmType = alarms[0].alarms_type;
					if(alarmType == "Critical"){
						val = "Connected (Poor)";
					}else if(alarmType == "Warning"){
						val = "Connected (Fair)";
					}
				}else{
					val = "Connected (Good)";
				}
			}

			val = val ? val : "-";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>CCTV 기기의 Data 상태를 얻는다.</li>
	*   </ul>
	*   @function getCCTVDataStatus
	*   @param {Object}data - 기기 정보
	*   @returns {String} - CCTV 기기의 Data 상태
	*   @alias module:app/device/common/device-util
	*/
	var getCCTVDataStatus = function(data){
		var val = "Off";
		// var i, max;	//[2018-04-16][변수 미사용 주석처리]
		var cctvs = data.cctvs;
		if(cctvs && cctvs[0]){
			cctvs = cctvs[0];
			if(cctvs.dataStatus == "On") {
				val = "On";
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>CCTV 기기의 WIFI 타입을 얻는다.</li>
	*   </ul>
	*   @function getCCTVDataStatus
	*   @param {Object}data - 기기 정보
	*   @returns {String} - CCTV 기기의 WIFI 타입
	*   @alias module:app/device/common/device-util
	*/
	var getCCTVWifiType = function(data){
		var val = "-";
		var network = data.networks;
		if(network && network[1]){
			network = network[1];
			if(network.type == "WiFi2.4GHz"){
				val = "2.4GHz";
			}else if(network.type == "WiFi5GHz"){
				val = "5GHz";
			}

			val = val ? val : "-";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>CCTV 기기의 WIFI Tx Power를 얻는다.</li>
	*   </ul>
	*   @function getCCTVDataStatus
	*   @param {Object}data - 기기 정보
	*   @returns {String} - CCTV 기기의 WIFI Tx Power
	*   @alias module:app/device/common/device-util
	*/
	var getCCTVWifiTxPower = function(data){
		var val = "-";
		var network = data.wifi;
		if(network){
			val = network.txPower;
			val = val ? val : "-";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>CCTV 기기의 WIFI Channel Utilization을 얻는다.</li>
	*   </ul>
	*   @function getCCTVWifiTotal
	*   @param {Object}data - 기기 정보
	*   @returns {String} - CCTV 기기의 WIFI Channel Utilization
	*   @alias module:app/device/common/device-util
	*/
	var getCCTVWifiTotal = function(data){
		var val = "-";
		var network = data.wifi;
		if(network){

			network = network.statistics;
			if(network && network.channelUtilization){
				val = network.channelUtilization.total;
				val = val ? val : "-";
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>CCTV 기기의 WIFI None-WIFI Channel Utilization을 얻는다.</li>
	*   </ul>
	*   @function getCCTVWifiNoneWifi
	*   @param {Object}data - 기기 정보
	*   @returns {String} - CCTV 기기의 WIFI None-WIFI Channel Utilization
	*   @alias module:app/device/common/device-util
	*/
	var getCCTVWifiNoneWifi = function(data){
		var val = "-";
		var network = data.wifi;
		if(network){
			network = network.statistics;
			if(network && network.channelUtilization){
				val = network.channelUtilization["non802.11"];
				val = val ? val : "-";
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>CCTV 기기의 WIFI Interferer 리스트를 얻는다.</li>
	*   </ul>
	*   @function getCCTVWifiInterfererDataSource
	*   @param {Object}data - 기기 정보
	*   @returns {Array} - CCTV 기기의 WIFI Interferer 리스트
	*   @alias module:app/device/common/device-util
	*/
	var getCCTVWifiInterfererDataSource = function(data){
		var list = [];
		var network = data.wifi;
		if(network){
			network = network.statistics;
			if(network && network.interferers){
				list = network.interferers;
			}
		}
		return list;
	};
	/**
	*   <ul>
	*   <li>Gateway 기기의 네트워크 인터페이스 데이터를 얻는다.</li>
	*   </ul>
	*   @function getNetworkInterface
	*   @param {Object}data - 기기 정보
	*   @param {String}type - 인터페이스 타입 {"Zigbee", "BLE"}
	*   @param {String}bleRole - BLE 비콘 Role {"Scanner", "Advertiser"}
	*   @param {Number}index - 참조하려는 networks 리스트의 인덱스
	*   @returns {Object} - Network 인터페이스 정보 객체
	*   @alias module:app/device/common/device-util
	*/
	var getNetworkInterface = function(data, type, bleRole, index){		//[2018-04-16][파라메타 key 미사용 제거]
		var network = {}, networks;
		var i, max;
		networks = data.networks;
		var count = 0;
		if(networks && networks[0]){
			max = networks.length;
			for(i = 0; i < max; i++){
				if(networks[i].type == type){
					if(bleRole){
						if(networks[i].ble && networks[i].ble.role == bleRole){
						//if(networks[i].ble){    //code for mock data
							//BLE 내장 인터페이스
							if(typeof index !== 'undefined'){
								if(index == count){
								//if((index+1) == count){ //code for mock data
									//console.log("inerface");
									//console.log(networks[i]);
									return networks[i];
								}
								count++;

							}else{
								//BLE 내장 비콘
								//console.log("beacon");
								//console.log(networks[i]);
								return networks[i];
							}
						}
					}else{
						//Zigbee
						return networks[i];
					}
				}
			}
		}
		return network;
	};

	/**
	*   <ul>
	*   <li>Gateway 기기의 네트워크 인터페이스 데이터를 얻는다.</li>
	*   </ul>
	*   @function getNetworkInterfaceIndex
	*   @param {Object}data - 기기 정보
	*   @param {String}type - 인터페이스 타입 {"Zigbee", "BLE"}
	*   @param {String}bleRole - BLE 비콘 Role {"Scanner", "Advertiser"}
	*   @param {Number}index - 참조하려는 networks 리스트의 인덱스
	*   @param {Number}findIndex - 찾으려는 networks 리스트의 인덱스
	*   @returns {Number} - 찾은 경우 Index로 리턴, 못찾은 경우 -1로 리턴
	*   @alias module:app/device/common/device-util
	*/
	var getNetworkInterfaceIndex = function(data, type, bleRole, index, findIndex){
		// var network = {};	//[2018-04-16][변수 미사용 주석처리]
		var networks;
		var i, max;
		networks = data.networks;
		var count = 0;
		if(networks && networks[0]){
			max = networks.length;
			for(i = 0; i < max; i++){
				if(networks[i].type == type){
					if(bleRole){
						if(networks[i].ble && networks[i].ble.role == bleRole){
						//if(networks[i].ble){    //code for mock data
							//BLE 내장 인터페이스
							if(typeof index !== 'undefined' && index !== null){
								if(index == count){
								//if((index+1) == count){ //code for mock data
									//console.log("inerface");
									//console.log(networks[i]);
									return i;
								}
								count++;
							}else{
								//BLE 내장 비콘
								//console.log("beacon");
								//console.log(networks[i]);
								return i;
							}
						}
					}else{
						//Zigbee
						return i;
					}
				}
			}
		}
		if(findIndex){
			return -1;
		}
		return 0;
	};

	/**
	*   <ul>
	*   <li>Zigbee의 상태를 가져온다.</li>
	*   </ul>
	*   @function getZigbeeStatus
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Zigbee의 상태
	*   @alias module:app/device/common/device-util
	*/
	var getZigbeeStatus = function(data){
		var zigbee = getNetworkInterface(data, "Zigbee");
		if(zigbee.enabled){
			return "Normal.On";
		}
		return "Normal.Off";
	};
	/**
	*   <ul>
	*   <li>Ble(Scanner)의 상태를 가져온다.</li>
	*   </ul>
	*   @function getBleStatus
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Ble(Scanner)의 상태
	*   @alias module:app/device/common/device-util
	*/
	var getBleStatus = function(data){
		var ble = getNetworkInterface(data, "BLE", "Scanner");
		if(ble.enabled){
			return "Normal.On";
		}
		return "Normal.Off";

	};
	/**
	*   <ul>
	*   <li>Ble(Advertiser)의 상태를 가져온다.</li>
	*   </ul>
	*   @function getBleInterfaceStatus
	*   @param {Object}data - 기기 정보
	*   @param {Number}index - 상태를 가져오려는 Index 값
	*   @returns {String} - Ble(Advertiser)의 상태
	*   @alias module:app/device/common/device-util
	*/
	var getBleInterfaceStatus = function(data, index){
		var ble = getNetworkInterface(data, "BLE", "Advertiser", index);
		if(ble.enabled){
			return "Normal.On";
		}
		return "Normal.Off";

	};
	/**
	*   <ul>
	*   <li>Ble 정보의 특정 어트리뷰트 값을 가져온다.</li>
	*   </ul>
	*   @function getBleInterfaceStatus
	*   @param {Object}network - 기기의 network 정보
	*   @param {String}key - 가져올 Attribute의 이름
	*   @returns {String} - 특정 Attribute 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleObjectFromNetwork = function(network, key){
		var val = "-";
		if(network && network.ble){
			val = network.ble[key];
			val = typeof val !== 'undefined' ? val : "-";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>Wifi 정보의 특정 어트리뷰트 값을 가져온다.</li>
	*   </ul>
	*   @function getWifiObjectFromNetwork
	*   @param {Object}network - 기기의 network 정보
	*   @param {String}key - 가져올 Attribute의 이름
	*   @returns {String} - 특정 Attribute 값
	*   @alias module:app/device/common/device-util
	*/
	var getWifiObjectFromNetwork = function(network, key){
		var val = "-";
		if(network && network.wifi){
			val = network.wifi[key];
			val = typeof val !== 'undefined' ? val : "-";
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>BLE 객체의 특정 Attribute 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleObject
	*   @param {Object}data - 기기 정보
	*   @param {String}key - 가져올 Attribute의 이름
	*   @returns {String} - 특정 Attribute 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleObject = function(data, key){
		var val = "-";
		var i, max, ble, network = data.networks;
		// var ip;		//[변수 선언이후 미사용 주석처리]
		if(network && network[0]){
			max = network.length;
			for( i = 0; i < max; i++ ){
				if(network[i].ble){
					ble = network[i].ble;
					break;
				}
			}

			if(ble){
				//ble = ble.scanlist[0]; //for mock data
				val = ble[key];
				val = val ? val : "-";
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 맥 주소 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleMacAddress
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 맥 주소 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleMacAddress = function(data){
		return getBleObject(data, "macAddress");
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 UUID 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleUUID
	*   @param {Object}data - 기기 정보
	*   @returns {String} - UUID 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleUUID = function(data){
		return getBleObject(data, "uuid");
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 Major 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleMajor
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Major 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleMajor = function(data){
		return getBleObject(data, "major");
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 Minor 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleMinor
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Minor 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleMinor = function(data){
		return getBleObject(data, "minor");
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 1m RSSI 값을 가져온다.</li>
	*   </ul>
	*   @function  getBle1mRssi
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 1m RSSI 값
	*   @alias module:app/device/common/device-util
	*/
	var getBle1mRssi = function(data){
		return getBleObject(data, "calibratedTxPower");
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 Tx Power 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleTxPower
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Tx Power 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleTxPower = function(data){
		var txpower = getBleObject(data, "txPower");
		// console.log("[getBleTxPower] txpower = " + txpower);
		if (txpower == "999" || txpower == 999) {
			txpower = "-";
		}
		return txpower;
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 신호 레벨 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleSignalLevel
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 신호 레벨 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleSignalLevel = function(data){
		var val = getBleObject(data, "rssi");
		if(val != "-"){
			val += " dBm";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 배터리 레벨 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleBatteryLevel
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 배터리 레벨 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleBatteryLevel = function(data){
		var val = "-";
		var power, info = data.information;
		if(info && info.power){
			power = info.power.batteryLevel;
			if(power){
				val = power ? power : "-";
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 Writable 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleWritable
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Writable 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleWritable = function(data){
		var val = getBleObject(data, "writable");
		if(val == "-"){
			val = "READ Only";
		}else{
			val = "READ / WRITE";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 Advertising Name 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleAdvertisingName
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Advertising Name 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleAdvertisingName = function(data){
		return getBleObject(data, "advertisingName");
	};
	/**
	*   <ul>
	*   <li>BLE 객체의 Advertising Interval 값을 가져온다.</li>
	*   </ul>
	*   @function  getBleAdvertisingInterval
	*   @param {Object}data - 기기 정보
	*   @returns {String} - Advertising Interval 값
	*   @alias module:app/device/common/device-util
	*/
	var getBleAdvertisingInterval = function(data){
		return getBleObject(data, "advertisingInterval");
	};
	/**
	*   <ul>
	*   <li>기기의 Rule 정보 존재 여부를 텍스트로 가져온다.</li>
	*   </ul>
	*   @function  getHasRule
	*   @param {Object}data - 기기 정보
	*   @returns {String} - "O" or "X"
	*   @alias module:app/device/common/device-util
	*/
	var getHasRule = function(data){
		var val = "-";
		var rules = data.rules;
		if(rules){
			if(rules.length > 0) val = "O";
			else val = "X";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>기기의 Schedule 정보 존재 여부를 텍스트로 가져온다.</li>
	*   </ul>
	*   @function  getHasSchedule
	*   @param {Object}data - 기기 정보
	*   @returns {String} - "O" or "X"
	*   @alias module:app/device/common/device-util
	*/
	var getHasSchedule = function(data){
		var val = "-";
		var schedules = data.schedules;
		if(schedules){
			if(schedules.length > 0) val = "O";
			else val = "X";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>기기의 Description 정보를 가져온다.</li>
	*   </ul>
	*   @function  getDescription
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 설명 정보
	*   @alias module:app/device/common/device-util
	*/
	var getDescription = function(data){
		var val = "-";
		var description = data.description;
		if(description){
			val = description;
		}
		return CommonUtil.decodeHtml(val);
	};
	/**
	*   <ul>
	*   <li>기기의 버전 정보를 가져온다.</li>
	*   </ul>
	*   @function  getVersionInfo
	*   @param {Object}data - 기기 정보
	*   @param {String}type - 가져올 기기의 버전 타입
	*   @returns {String} - 기기의 버전 정보
	*   @alias module:app/device/common/device-util
	*/
	var getVersionInfo = function(data, type){
		var val = "-", ver, info = data.information;
		if(info && info.versions){
			ver = info.versions;
			var i, max = ver.length;
			for( i = 0; i < max; i++ ){
				if(ver[i].type == type){
					val = ver[i].number ? ver[i].number : val;
					break;
				}
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>기기의 펌웨어 버전 정보를 가져온다.</li>
	*   </ul>
	*   @function  getFirmwareVersion
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 펌웨어 버전 정보
	*   @alias module:app/device/common/device-util
	*/
	var getFirmwareVersion = function(data){
		return getVersionInfo(data, "Firmware");
	};
	/**
	*   <ul>
	*   <li>기기의 Zigbee 펌웨어 버전 정보를 가져온다.</li>
	*   </ul>
	*   @function  getZigbeeFirmwareVersion
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 Zigbee 펌웨어 버전 정보
	*   @alias module:app/device/common/device-util
	*/
	var getZigbeeFirmwareVersion = function(data){
		return getVersionInfo(data, "Firmware.Zigbee");
	};
	/**
	*   <ul>
	*   <li>기기의 BLE 펌웨어 버전 정보를 가져온다.</li>
	*   </ul>
	*   @function  getBleFirmwareVersion
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 BLE 펌웨어 버전 정보
	*   @alias module:app/device/common/device-util
	*/
	var getBleFirmwareVersion = function(data){
		return getVersionInfo(data, "Firmware.BLE");
	};
	/**
	*   <ul>
	*   <li>기기의 BLE 앱 버전 정보를 가져온다.</li>
	*   </ul>
	*   @function  getBleAppVersion
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 BLE 앱 버전 정보
	*   @alias module:app/device/common/device-util
	*/
	var getBleAppVersion = function(data){
		return getVersionInfo(data, "Application.BLE");
	};
	/**
	*   <ul>
	*   <li>기기의 하드웨어 버전 정보를 가져온다.</li>
	*   </ul>
	*   @function  getHardwareVersion
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 하드웨어 버전 정보
	*   @alias module:app/device/common/device-util
	*/
	var getHardwareVersion = function(data){
		return getVersionInfo(data, "Hardware");
	};
	/**
	*   <ul>
	*   <li>기기의 소프트웨어 버전 정보를 가져온다.</li>
	*   </ul>
	*   @function  getSoftwareVersion
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 소프트웨어 버전 정보
	*   @alias module:app/device/common/device-util
	*/
	var getSoftwareVersion = function(data){
		return getVersionInfo(data, "Software");
	};
	/**
	*   <ul>
	*   <li>기기의 API 버전 정보를 가져온다.</li>
	*   </ul>
	*   @function  getApiVersion
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 API 버전 정보
	*   @alias module:app/device/common/device-util
	*/
	var getApiVersion = function(data){
		return getVersionInfo(data, "API");
	};
	/**
	*   <ul>
	*   <li>기기의 Power Avilable Source 정보를 가져온다.</li>
	*   </ul>
	*   @function  getPowerAvailableSource
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 Power Avilable Source 정보
	*   @alias module:app/device/common/device-util
	*/
	var getPowerAvailableSource = function(data){
		var val = "-";
		var power, info = data.information;
		if(info && info.power){
			power = info.power.availableSources;
			val = power ? power : "-";
			if((val instanceof kendo.data.ObservableArray) || $.isArray(val)){
				val = val.join(", ");
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>기기의 Power Current Source 정보를 가져온다.</li>
	*   </ul>
	*   @function  getPowerCurrentSource
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 Power Current Source 정보
	*   @alias module:app/device/common/device-util
	*/
	var getPowerCurrentSource = function(data){
		var val = "-";
		var power, info = data.information;
		if(info && info.power){
			power = info.power.currentSource;
			val = power ? power : "-";
			if((val instanceof kendo.data.ObservableArray) || $.isArray(val)){
				val = val.join(", ");
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>기기의 Tag Name 정보를 가져온다.</li>
	*   </ul>
	*   @function  getPointTagName
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 기기의 Tag Name 정보
	*   @alias module:app/device/common/device-util
	*/
	var getPointTagName = function(data){
		var value = "-";
		if(data.controlPoint && data.controlPoint.tagName){
			value = data.controlPoint.tagName;
		}

		return value;
	};
	/**
	*   <ul>
	*   <li>Location 기준으로 기기 정보를 Sorting 하기위해 쓰이는 함수 (Array.prototype.sort()에 인자로 쓰인다.)</li>
	*   </ul>
	*   @function  sortableLocation
	*   @param {Object}a - 기기 정보 1
	*   @param {Object}b - 기기 정보 2
	*   @returns {String} - 비교 값
	*   @alias module:app/device/common/device-util
	*/
	var sortableLocation = function(a, b){
		a = getLocation(a);
		a = a ? a : "-";
		b = getLocation(b);
		b = b ? b : "-";
		return a.localeCompare(b);
	};

	var sortableHasSchedule = function(a, b){
		a = getHasSchedule(a);
		b = getHasSchedule(b);
		return a.localeCompare(b);
	};

	var sortableHasRule = function(a, b){
		a = getHasRule(a);
		b = getHasRule(b);
		return a.localeCompare(b);
	};

	/**
	*   <ul>
	*   <li>Group 기준으로 기기 정보를 Sorting 하기위해 쓰이는 함수 (Array.prototype.sort()에 인자로 쓰인다.)</li>
	*   </ul>
	*   @function  sortableGroup
	*   @param {Object}a - 기기 정보 1
	*   @param {Object}b - 기기 정보 2
	*   @returns {String} - 비교 값
	*   @alias module:app/device/common/device-util
	*/
	var sortableGroup = function(a, b){
		a = getGroup(a);
		a = a ? a : "-";
		b = getGroup(b);
		b = b ? b : "-";
		return a.localeCompare(b);
	};

	var sortableMacAddress = function(a, b){
		a = getMacAddress(a);
		a = a ? a : "-";
		b = getMacAddress(b);
		b = b ? b : "-";
		return a.localeCompare(b);
	};

	var sortableBleMacAddress = function(a, b){
		a = getBleMacAddress(a);
		b = getBleMacAddress(b);
		return a.localeCompare(b);
	};

	var sortableIpAddress = function(a, b){
		a = getIpAddress(a);
		a = a ? a : "-";
		b = getIpAddress(b);
		b = b ? b : "-";
		return a.localeCompare(b);
	};

	/**
	*   <ul>
	*   <li>Tag Name 기준으로 기기 정보를 Sorting 하기위해 쓰이는 함수 (Array.prototype.sort()에 인자로 쓰인다.)</li>
	*   </ul>
	*   @function  sortableGroup
	*   @param {Object}a - 기기 정보 1
	*   @param {Object}b - 기기 정보 2
	*   @returns {String} - 비교 값
	*   @alias module:app/device/common/device-util
	*/
	var sortablePointTagName = function(a, b){
		a = getPointTagName(a);
		b = getPointTagName(b);
		return a.localeCompare(b);
	};

	var sortablePointValue = function(a, b){
		var valueA, valueB;
		if(a.controlPoint){
			valueA = a.controlPoint.value;
		}

		if(b.controlPoint){
			valueB = b.controlPoint.value;
		}

		return valueA - valueB;
	};

	var sortableMeterType = function(a, b){
		var aMeter, bMeter;
		if(a.meters && a.meters[0]
			&& b.meters && b.meters[0]){
			aMeter = getMeterType(a);
			bMeter = getMeterType(b);
			return aMeter.localeCompare(bMeter);
		}
	};

	var sortableMeterCategoryType = function(a, b){
		var aMeter, bMeter;
		if(a.meters && a.meters[0]
			&& b.meters && b.meters[0]){
			aMeter = getMeterCategoryType(a);
			bMeter = getMeterCategoryType(b);
			return aMeter.localeCompare(bMeter);
		}
	};

	var sortableBeaconUUID = function(a, b){
		a = getBleUUID(a);
		b = getBleUUID(b);
		return a.localeCompare(b);
	};

	var sortableCCTVWifiStatus = function(a, b){
		a = getCCTVWifiStatus(a);
		b = getCCTVWifiStatus(b);
		return a.localeCompare(b);
	};

	//Deprecated
	var getLocationSort = function(){
		var floor = MainWindow.getCurrentFloor();
		var isSelectedFloor = true;


		if(floor.building.id == MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID
		   || floor.floor.id == MainWindow.FLOOR_NAV_FLOOR_TOTAL_ID){
			isSelectedFloor = false;
		}
		var sort;
		//층이 선택된 상태에서만 Zone 없는 기기를 맨 아래로 보여주도록
		//이름으로 정렬
		if(isSelectedFloor){
			sort = [{ field : "locations", dir:"asc", compare : function(a, b){
				var locA, locB;
				locA = a.locations;
				locB = b.locations;
				var aName = "-";
				var bName = "-";

				locA = locA && locA[0] ? locA[0] : "-";
				locB = locB && locB[0] ? locB[0] : "-";

				//Zone이 존재하지 않는 경우 가장 아래로.
				if(locA != "-"){
					if(!locA.foundation_space_zones_id){
						aName = a.name;
						aName = "Ω" + aName;
					}
				}

				if(locB != "-"){
					if(!locB.foundation_space_zones_id){
						bName = b.name;
						bName = "Ω" + bName;
					}
				}
				//console.log("aName : "+aName + " / bName : "+bName +"/ compare : "+aName.localeCompare(bName));
				return aName.localeCompare(bName);
			}}];
		}else{
			sort = [];
		}
		return sort;
	};

	/**
	*   <ul>
	*   <li>다국어가 적용된 실내기의 모드 텍스트를 가져온다.</li>
	*   </ul>
	*   @function  getIndoorMode
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 실내기 모드 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getIndoorMode = function(data){
		var value = "-";
		var alarm = CommonUtil.getRecentAlarm(data);
		var i18nVal;
		if(alarm){
			value = alarm.type;
			i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_" + value.toUpperCase());
			value = i18nVal ? i18nVal : value;
		}else{
			value = CommonUtil.getDisplayModeI18N(data.modes, data.operations, true, " / ");
		}

		return value;
	};

	/**
	*   <ul>
	*   <li>자산 유형의 이름과 하위 자산의 이름을 가져온다. </li>
	*   </ul>
	*   @function  getAssetType
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산 유형 및 하위 자산 유형 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getAssetType = function(data){
		var assetType = data.assets_types_name ? data.assets_types_name : "-";
		var subAssetType = data.subAssetType ? data.subAssetType : "-";
		return assetType + " / " + subAssetType;
	};
	/**
	*   <ul>
	*   <li>자산의 위치를 텍스트로 가져온다. </li>
	*   </ul>
	*   @function  getAssetLocation
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 위치 텍스트
	*   @alias module:app/device/common/device-util
	*/
	var getAssetLocation = function(data){
		var value = "-";
		var location = data.location;
		if(location){
			if(location.description){
				return location.description;
			}

			value = "";
			if(location.foundation_space_buildings_id){
				value += location.foundation_space_buildings_id + " ";
			}

			if(location.foundation_space_floors_id){
				value += location.foundation_space_floors_id;
			}
		}
		return value;
	};

	/**
	*   <ul>
	*   <li>자산의 사용자 이름를 텍스트로 가져온다. </li>
	*   </ul>
	*   @function  getAssetUsers
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 사용자 이름
	*   @alias module:app/device/common/device-util
	*/
	var getAssetUsers = function(data){
		var value = "-";
		var users = data.users;
		if(users && users[0]){
			value = "";
			var i, max = users.length;
			for( i = 0; i < max; i++ ){
				value += users[i].ums_users_name;
				if(i != max - 1){
					value += ", ";
				}
			}
		}
		return value;
	};

	/**
	*   <ul>
	*   <li>온/습도 센서의 Location Type을 가져온다.</li>
	*   </ul>
	*   @function  getTempWeatherStation
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 온/습도 센서의 Location Type
	*   @alias module:app/device/common/device-util
	*/
	var getTempWeatherStation = function(data){
		var val = "-";
		var config = data.configuration;
		if(config && config.locationType){
			val = config.locationType;
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>온/습도 센서의 Location Type을 O, X로 가져온다.</li>
	*   </ul>
	*   @function  getTempWeatherStationOx
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 온/습도 센서의 Location Type
	*   @alias module:app/device/common/device-util
	*/
	var getTempWeatherStationOx = function(data){
		var val = "-";
		var config = data.configuration;
		if(config && config.locationType){
			val = config.locationType;
			val = val == "Outdoor" ? "O" : "X";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>Point 값을 가져온다.</li>
	*   </ul>
	*   @function  getPointValue
	*   @param {Object}data - 기기 정보
	*   @returns {String} - 포인트 값
	*   @alias module:app/device/common/device-util
	*/
	var getPointValue = function(data){
		var value = "-";
		var point = data.controlPoint;
		if(point && typeof point.value !== 'undefined'){
			value = point.value;
		}
		return value;
	};
	/**
	*   <ul>
	*   <li>Ble Mac Address 기준으로 기기 정보를 Sorting 하기위해 쓰이는 함수 (Array.prototype.sort()에 인자로 쓰인다.)</li>
	*   </ul>
	*   @function  getSortBleMacAddress
	*   @param {Object}a - 기기 정보 1
	*   @param {Object}b - 기기 정보 2
	*   @returns {String} - 비교 값
	*   @alias module:app/device/common/device-util
	*/
	// var getSortBleMacAddress = function(a, b){		//[2018-04-16][함수 선언후 미사용 주석처리]
	//     a = getBleMacAddress(a);
	//     b = getBleMacAddress(b);
	//     return a.localeCompare(b);
	// };

	/**
	*   <ul>
	*   <li>자산의 사용자 이름을 가져온다.</li>
	*   </ul>
	*   @function  getAssetUserName
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 사용자 이름
	*   @alias module:app/device/common/device-util
	*/
	var getAssetUserName = function(data){
		var val = "-";
		var users = data.users;
		if(users && users[0]){
			val = users[0].ums_users_name;
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>자산의 사용자 ID를 가져온다.</li>
	*   </ul>
	*   @function  getAssetUserID
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 사용자 ID
	*   @alias module:app/device/common/device-util
	*/
	var getAssetUserID = function(data){
		var val = "-";
		var users = data.users;
		if(users && users[0]){
			val = users[0].ums_users_id;
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>자산의 사용자 E-MAIL을 가져온다.</li>
	*   </ul>
	*   @function  getAssetUserEmail
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 사용자 E-MAIL
	*   @alias module:app/device/common/device-util
	*/
	var getAssetUserEmail = function(data){
		var val = "-";
		var users = data.users;
		if(users && users[0]){
			val = users[0].ums_users_email;
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>자산의 사용자 소속 이름을 가져온다.</li>
	*   </ul>
	*   @function  getAssetUserOrganization
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 사용자 소속 이름
	*   @alias module:app/device/common/device-util
	*/
	var getAssetUserOrganization = function(data){
		var val = "-";
		var users = data.users;
		if(users && users[0]){
			val = users[0].ums_users_organization ? users[0].ums_users_organization : "-";
		}
		return val;
	};
	//deprecated
	var getAssetUserWorkPhoneNumber = function(data){
		var val = "-";
		var users = data.users;
		if(users && users[0]){
			val = users[0].ums_users_workPhoneNumber ? users[0].ums_users_workPhoneNumber : "-";
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>자산의 사용자 핸드폰 번호를 가져온다.</li>
	*   </ul>
	*   @function  getAssetUserMobilePhoneNumber
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 사용자 핸드폰 번호
	*   @alias module:app/device/common/device-util
	*/
	var getAssetUserMobilePhoneNumber = function(data){
		var val = "-";
		var users = data.users;
		if(users && users[0]){
			val = users[0].ums_users_mobilePhoneNumber ? users[0].ums_users_mobilePhoneNumber : "-";
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>자산의 기기 ID를 가져온다.</li>
	*   </ul>
	*   @function  getAssetDeviceID
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 기기 ID
	*   @alias module:app/device/common/device-util
	*/
	var getAssetDeviceID = function(data){
		var val = "-";
		var devices = data.devices;
		if(devices && devices[0]){
			val = devices[0].dms_devices_id;
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>자산의 기기 이름을 가져온다.</li>
	*   </ul>
	*   @function  getAssetDeviceID
	*   @param {Object}data - 자산 정보
	*   @returns {String} - 자산의 기기 이름
	*   @alias module:app/device/common/device-util
	*/
	var getAssetDeviceName = function(data){
		var val = "-";
		var devices = data.devices;
		if(devices && devices[0]){
			val = devices[0].dms_devices_name;
		}
		return val;
	};

	//라이센스에 따라 기기 등록 개수가 제한 상태일 때 Response Message
	var getDeviceRegistrationFailMsg = function(xhq){
		var msg;
		if(xhq.status == 406 && xhq.responseText.indexOf("Count") != -1){
			msg = I18N.prop("FACILITY_DEVICE_COUNT_EXCEEDED");
		}else{
			msg = CommonUtil.parseFailResponse(xhq);
		}
		return msg;
	};

	var getEnergyMappingOutdoorList = function(connectedDevices){
		var dfd = new $.Deferred();
		var buildingList = MainWindow.getCurrentBuildingList();
		var floorList;

		$.ajax({
			url : "/foundation/space/floors"
		}).done(function(floors){
			floorList = floors;
			$.ajax({
				url : "/dms/devices?types=AirConditionerOutdoor&registrationStatuses=Registered&attributes=id,name,locations"
			}).done(function(data){
				var device, building, floor, buildingId, floorId,
					i, j, length, max = data.length;
				for( i = 0; i < max; i++ ){
					device = data[i];
					if(device.locations && device.locations[0]){
						buildingId = device.locations[0].foundation_space_buildings_id;
						floorId = device.locations[0].foundation_space_floors_id;
						length = buildingList.length;
						for( j = 0; j < length; j++ ){
							building = buildingList[j];
							if(buildingId == building.id){
								device.building_group_value = kendo.toString(building.sortOrder, '0000') + "_" + building.id + "_" + building.name;
								break;
							}
						}
						length = floorList.length;
						for( j = 0; j < length; j++ ){
							floor = floorList[j];
							if(floorId == floor.id){
								device.floor_group_value = kendo.toString(floor.sortOrder, '0000') + "_" + floor.id + "_" + CommonUtil.getFloorName(floor);
								break;
							}
						}
					}
					device.assigned = false;
					length = connectedDevices.length;
					for( j = 0; j < length; j++ ){
						if(device.id == connectedDevices[j].dms_devices_id){
							device.assigned = true;
							break;
						}
					}
				}
				dfd.resolve(data);
			}).fail(function(xhq){
				dfd.reject(xhq);
			});
		}).fail(function(xhq){
			dfd.reject(xhq);
		});
		return dfd.promise();
	};

	var isEnableEnergyMappingType = function(data){
		var type = data.mappedType || data.type;
		var category, connectedDeviceType;
		var meters = data.meters;
		if(!meters) return false;
		var i, max = meters.length;
		for( i = 0; i < max; i++ ){
			if(meters[i].category == "AirConditionerAll"){
				category = meters[i].category;
			}
			if(meters[i].connectedDeviceType == "AirConditionerOutdoor"){
				connectedDeviceType = meters[i].connectedDeviceType;
			}
		}

		if(type == "Meter.WattHour" && category && connectedDeviceType) return true;
		return false;
	};

	var getEnergyMappingFieldName = function(data){
		var index = 0, meters = data.meters;
		if(meters && meters[0]){
			var i, max = meters.length;
			for( i = 0; i < max; i++ ){
				if(meters[i].category == "AirConditionerAll" && meters[i].connectedDeviceType == "AirConditionerOutdoor"){
					index = i;
					break;
				}
			}
		}
		return "meters[" + index + "].connectedDevices";
	};

	var getMeterConnectedDevices = function(data){
		var index = 0, meters = data.meters;
		if(meters && meters[0]){
			var i, max = meters.length;
			for( i = 0; i < max; i++ ){
				if(meters[i].category == "AirConditionerAll" && meters[i].connectedDeviceType == "AirConditionerOutdoor"){
					index = i;
					break;
				}
			}
		}
		return meters[index] && meters[index].connectedDevices ? meters[index].connectedDevices : null;
	};

	var getConnectedDevicesConsumptionTypeList = function(meterType) {
		var defaultTypes = {
			"AirConditionerAll" : {
				name : I18N.prop("FACILITY_DEVICE_ENERGY_METER_CATEGORY_TYPE_SAC"),
				id : "AirConditionerAll"
			},
			"Light" : {
				name : I18N.prop("FACILITY_DEVICE_ENERGY_METER_CATEGORY_TYPE_LIGHT"),
				id : "Light"
			},
			"Others" : {
				name : I18N.prop("FACILITY_DEVICE_ENERGY_METER_CATEGORY_TYPE_OTHERS"),
				id : "Others"
			}
		};
		var typeList = [];
		typeList.push(defaultTypes["AirConditionerAll"]);
		if(meterType === "Meter.WattHour") typeList.push(defaultTypes["Light"]);
		typeList.push(defaultTypes["Others"]);
		return typeList;
	};

	var getConnectedDevicesConnectionTypeList = function(meterType, consumptionType) {
		var defaultTypes = {
			"None" : {
				name: "None",
				id: "None"
			},
			"AirConditioner" : {
				name : CommonUtil.getDetailDisplayTypeDeviceI18N("SAC Indoor"),
				id : "AirConditioner"
			},
			"AirConditionerOutdoor" : {
				name : CommonUtil.getDetailDisplayTypeDeviceI18N("SAC Outdoor"),
				id : "AirConditionerOutdoor"
			},
			"Boiler" : {
				name : CommonUtil.getDetailDisplayTypeDeviceI18N("Boiler"),
				id: "Boiler"
			},
			"CoolingTower" : {
				name : CommonUtil.getDetailDisplayTypeDeviceI18N("CoolingTower"),
				id: "CoolingTower"
			},
			"Pump" : {
				name : CommonUtil.getDetailDisplayTypeDeviceI18N("Pump"),
				id: "Pump"
			},
			"WaterTank" : {
				name : CommonUtil.getDetailDisplayTypeDeviceI18N("WaterTank"),
				id: "WaterTank"
			}
		};
		var typeList = [];
		if(consumptionType === "AirConditionerAll"){
			if(meterType === "Meter.WattHour"){
				typeList.push(defaultTypes["AirConditioner"], defaultTypes["AirConditionerOutdoor"], defaultTypes["Pump"], defaultTypes["CoolingTower"], defaultTypes["Boiler"]);
			}else if(meterType === "Meter.Gas"){
				typeList.push(defaultTypes["Boiler"]);
			}else if(meterType === "Meter.Water"){
				typeList.push(defaultTypes["WaterTank"]);
			}
		}
		typeList.push(defaultTypes["None"]);
		return typeList;
	};

	return {
		isAllFloorCheck : isAllFloorCheck,
		getDefaultView : getDefaultView,
		goClick : goClick,
		getStatus : getStatus,
		getLocation : getLocation,
		getCurrentLocation : getCurrentLocation,
		locations : getLocation,
		getGroup : getGroup,
		group : getGroup,
		getGridIcon : getGridIcon,
		getTemperatures : getTemperatures,
		curTemperatures : curTemperatures,
		setTemperatures : setTemperatures,
		curOutdoorTemperature : curOutdoorTemperature,
		columnMode : columnMode,
		filter0Depth : filter0Depth,
		filter0DepthEmptyList : filter0DepthEmptyList,
		filter1Depth : filter1Depth,
		filter1DepthNone : filter1DepthNone,
		filter1DepthNull : filter1DepthNull,
		filter1DepthObj : filter1DepthObj,
		filterStatusNoAlarm : filterStatusNoAlarm,
		filter2Depth : filter2Depth,
		convertStatistic : convertStatistic,
		convertDisplayName : convertDisplayName,
		getAccureFilter : getAccureFilter,
		getAccureFilterOlder : getAccureFilterOlder,
		calcScreenBySelect : calcScreenBySelect,
		calcScreenByOnlySelect : calcScreenByOnlySelect,
		getTempHumiTemperature : getTempHumiTemperature,
		getTempHumiHumidity : getTempHumiHumidity,
		getMotionPresence : getMotionPresence,
		getMacAddress : getMacAddress,
		getIpAddress : getIpAddress,
		getWifiIpAddress : getWifiIpAddress,
		getWifiMacAddress : getWifiMacAddress,
		getWifiChannel : getWifiChannel,
		getWifiRssi : getWifiRssi,
		getCCTVWifiStatus: getCCTVWifiStatus,
		getCCTVDataStatus: getCCTVDataStatus,
		getCCTVWifiTxPower : getCCTVWifiTxPower,
		getCCTVWifiType : getCCTVWifiType,
		getCCTVWifiTotal : getCCTVWifiTotal,
		getCCTVWifiNoneWifi : getCCTVWifiNoneWifi,
		getCCTVWifiInterfererDataSource : getCCTVWifiInterfererDataSource,
		getBleObject: getBleObject,
		getBleMacAddress : getBleMacAddress,
		getBleUUID : getBleUUID,
		getBleMajor : getBleMajor,
		getBleMinor : getBleMinor,
		getBleTxPower : getBleTxPower,
		getBle1mRssi : getBle1mRssi,
		getBleSignalLevel : getBleSignalLevel,
		getBleBatteryLevel : getBleBatteryLevel,
		getBleWritable : getBleWritable,
		getBleAdvertisingName : getBleAdvertisingName,
		getBleAdvertisingInterval : getBleAdvertisingInterval,
		getNetworkInterface : getNetworkInterface,
		getNetworkInterfaceIndex : getNetworkInterfaceIndex,
		getBleObjectFromNetwork : getBleObjectFromNetwork,
		getWifiObjectFromNetwork : getWifiObjectFromNetwork,
		getZigbeeStatus  : getZigbeeStatus,
		getBleStatus : getBleStatus,
		getBleInterfaceStatus : getBleInterfaceStatus,
		getHasSchedule : getHasSchedule,
		getHasRule : getHasRule,
		getDescription : getDescription,
		getFirmwareVersion : getFirmwareVersion,
		getZigbeeFirmwareVersion : getZigbeeFirmwareVersion,
		getBleFirmwareVersion : getBleFirmwareVersion,
		getBleAppVersion : getBleAppVersion,
		getHardwareVersion : getHardwareVersion,
		getSoftwareVersion : getSoftwareVersion,
		getApiVersion : getApiVersion,
		getPowerAvailableSource: getPowerAvailableSource,
		getPowerCurrentSource : getPowerCurrentSource,
		sortableLocation : sortableLocation,
		sortableGroup : sortableGroup,
		getLocationSort : getLocationSort,
		getPointTagName : getPointTagName,
		sortablePointTagName : sortablePointTagName,
		sortablePointValue : sortablePointValue,
		sortableMeterType: sortableMeterType,
		sortableMeterCategoryType : sortableMeterCategoryType,
		sortableMacAddress : sortableMacAddress,
		sortableBleMacAddress : sortableBleMacAddress,
		sortableIpAddress : sortableIpAddress,
		sortableHasSchedule :sortableHasSchedule,
		sortableHasRule : sortableHasRule,
		sortableBeaconUUID : sortableBeaconUUID,
		sortableCCTVWifiStatus : sortableCCTVWifiStatus,
		getIndoorMode : getIndoorMode,
		getAssetType : getAssetType,
		getAssetLocation : getAssetLocation,
		getAssetUsers : getAssetUsers,
		getMeterCategoryType : getMeterCategoryType,
		getMeterType : getMeterType,
		getMeterCurrentConsumption : getMeterCurrentConsumption,
		getMeterCurrentConsumptionUnit : getMeterCurrentConsumptionUnit,
		getDimmingLevel : getDimmingLevel,
		getTempWeatherStation : getTempWeatherStation,
		getTempWeatherStationOx : getTempWeatherStationOx,
		getPointValue : getPointValue,
		getAssetUserName : getAssetUserName,
		getAssetUserID : getAssetUserID,
		getAssetUserEmail : getAssetUserEmail,
		getAssetUserOrganization : getAssetUserOrganization,
		getAssetUserWorkPhoneNumber : getAssetUserWorkPhoneNumber,
		getAssetUserMobilePhoneNumber : getAssetUserMobilePhoneNumber,
		getAssetDeviceID : getAssetDeviceID,
		getAssetDeviceName : getAssetDeviceName,
		getEnergyMappingOutdoorList : getEnergyMappingOutdoorList,
		isEnableEnergyMappingType : isEnableEnergyMappingType,
		getEnergyMappingFieldName : getEnergyMappingFieldName,
		getMeterConnectedDevices : getMeterConnectedDevices,
		getDeviceRegistrationFailMsg : getDeviceRegistrationFailMsg,
		getConnectedDevicesConsumptionTypeList : getConnectedDevicesConsumptionTypeList,
		getConnectedDevicesConnectionTypeList : getConnectedDevicesConnectionTypeList,
		filterHasListAttrItem : filterHasListAttrItem
	};
});

//# sourceURL=device/common/device-util.js
