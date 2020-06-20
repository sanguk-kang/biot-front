/**
*
*   <ul>
*       <li>Group 제어패널 동작을 위한 ViewModel</li>
*   </ul>
*   @module app/operation/group/config/group-control-vm
*   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
*   @param {Object} constants - 기기 정보를 얻기 위한 Device 상수 정보
*   @param {Object} api - 기기 제어 API를 호출하기 위한 Device API
*   @requires app/main
*   @requires app/device/common/device-contstants
*   @requires app/device/common/device-api
*
*/
define("operation/group/config/group-control-vm", ["operation/core", "device/common/device-constants", "device/common/device-api"], function(CoreModule, constants, api){
	var kendo = window.kendo;
	var Util = window.Util;
	var LoadingPanel = window.CommonLoadingPanel;

	var msgDialog, msgDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");

	var DOUBLE_NUMERIC_MIN = -1.79e+308;
	var DOUBLE_NUMERIC_MAX = 1.79e+308;

	/**
	*   <ul>
	*   <li>실내기의 제어할 기기 항목 변경 시, 제어패널의 구성 요소 invisible 상태에 따라 Panel Item에 invisible 상태를 반영한다.</li>
	*   </ul>
	*   @function indoorControlPanelInvisible
	*   @param {kendojQueryWidget} widget - 실내기 제어패널 Widget 인스턴스
	*   @returns {void}
	*   @alias module:app/operation/group/config/group-control-vm
	*
	*/
	function indoorControlPanelInvisible(widget){

		var element = widget.element;

		//구성 요소 별 타이틀 Hide를 위함
		var visible;
		var title = element.find(".indoor-mode-title");
		title.find(".radiogroup .buttonbound").each(function(){
			var display = $(this).css("display");
			visible = display == "none" ? false : true;
			if(visible){
				return false;
			}
		});
		if(!visible){
			title.hide();
		}else{
			title.show();
		}

		title = element.find(".chiller-mode-title");
		title.find(".buttonbound").each(function(){
			var display = $(this).css("display");
			visible = display == "none" ? false : true;
			if(visible){
				return false;
			}
		});
		if(!visible){
			title.hide();
		}else{
			title.show();
		}

		title = element.find(".indoor-temperature-title");
		title.find(".blank10, .k-widget").each(function(){
			var display = $(this).css("display");
			visible = display == "none" ? false : true;
			if(visible){
				return false;
			}
		});
		if(!visible){
			title.hide();
		}else{
			title.show();
		}

		//하위 구성 요소에 따라 Panel Item Hide/Show
		element.find(".k-item").each(function(){
			var self = $(this);
			var innerBox = self.find(".innerBox");
			visible = false;
			//모든 요소가 hide 상태인지 체크한다.
			innerBox.find(" > div:not(.indoor-mode-title)").each(function(){
				var display = $(this).css("display");
				visible = display == "none" ? false : true;
				//하나라도 visible 상태면 visible
				if(visible){
					return false;
				}
			});

			if(!visible){
				self.hide();
			}else{
				self.show();
			}
		});

	}
	//deprecated
	// function modeClickEvt(e, control, modeIndex){
	// 	var MODE_INDEX = modeIndex;
	// 	var mode = control.mode;
	// 	var isActive = mode[MODE_INDEX].get("active");
	// 	var i, max = mode.length;
	// 	for( i = 0; i < max; i++ ){
	// 		mode[i].set("active", false);
	// 	}
	// 	mode[MODE_INDEX].set("active", !isActive);
	// }
	//deprecated
	// function powerClickEvt(e, control){
	// 	var power = control.power;
	// 	var isActive = power.get("active");
	// 	power.set("active", !isActive);
	// }
	/**
	*   <ul>
	*   <li>그룹 제어 팝업 리스트에서 선택한 기기 리스트를 가져온다.</li>
	*   </ul>
	*   @function getSelectedData
	*   @param {kendojQueryWidget} popup - 그룹 제어 팝업 Widget 인스턴스
	*   @returns {void}
	*   @alias module:app/operation/group/config/group-control-vm
	*
	*/
	function getSelectedData(popup){
		var ds = popup.dataSource;
		var data = ds.data();

		var selectedData = new kendo.data.Query(data).filter({
			logic : 'and',
			filters : [{ field : "selected", operator : "eq", value : true}]
		}).toArray();
		// console.log("selected data");
		// console.log(selectedData);
		return selectedData;
	}
	/**
	*   <ul>
	*   <li>그룹 제어 팝업 리스트에서 선택한 기기들의 ID 리스트 가져온다.</li>
	*   </ul>
	*   @function getSelectedIds
	*   @param {kendojQueryWidget} popup - 그룹 제어 팝업 Widget 인스턴스
	*   @returns {void}
	*   @alias module:app/operation/group/config/group-control-vm
	*
	*/
	function getSelectedIds(popup){
		var selectedData = getSelectedData(popup);
		var i, max = selectedData.length;
		var ids = [], types = [];
		for( i = 0; i < max; i++ ){
			ids.push(selectedData[i].id);
			types.push(selectedData[i].type);
		}
		return {
			ids : ids,
			types : types
		};
	}

	function failResp(xhq){
		var msg = Util.parseFailResponse(xhq);
		msgDialog.message(msg);
		msgDialog.open();
	}

	/**
	*   <ul>
	*   <li>그룹 제어 팝업 리스트의 실내기 기기 정보들을 Refresh 한다.</li>
	*   </ul>
	*   @function refreshIndoorDevices
	*   @returns {void}
	*   @alias module:app/operation/group/config/group-control-vm
	*
	*/
	function refreshIndoorDevices(){
		var popup = this;
		var element = this.element;
		var indoorControlElem = element.find(".control-panel");
		//제어 패널
		var controlPanel = indoorControlElem.data("kendoControlTab");

		//데이터소스
		var ds = popup.dataSource;
		var data = ds.data();

		//Indoor만 리프레시한다.
		var indoorList = new kendo.data.Query(data).filter({
			logic : 'and',
			filters : [{ field : "displayType", operator : "eq", value : Util.getDetailDisplayTypeDeviceI18N("SAC Indoor")}]
		}).toArray();

		var i, max = indoorList.length, ids = [];

		for( i = 0; i < max; i++ ){
			ids.push(indoorList[i].id);
		}
		//리프레시
		var Loading = popup.Loading;
		Loading.open();
		refreshDevices(ids, popup).done(function(){
			max = ids.length;
			data = ds.data();
			//리프레시 된 데이터를 다시 제어패널에 Set하여 제어패널의 상태를 업데이트한다.
			var updatedIndoorList = new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : "displayType", operator : "eq", value : Util.getDetailDisplayTypeDeviceI18N("SAC Indoor")},
						  { field : "selected", operator : "eq", value : true}]
			}).toArray();
			//제어 패널의 상태는 선택된 데이터만 Set한다.
			controlPanel.setDataSource(updatedIndoorList);
		}).always(function(){
			Loading.close();
		});
	}

	/**
	*   <ul>
	*   <li>그룹 제어 팝업 리스트에서 제어한 기기 정보들을 Refresh 한다.</li>
	*   </ul>
	*   @function refreshDevices
	*   @param {Array} ids - 기기 ID 리스트
	*   @param {kendojQueryWidget} popup - 그룹 제어 팝업 Widget 인스턴스
	*   @returns {void}
	*   @alias module:app/operation/group/config/group-control-vm
	*
	*/
	function refreshDevices(ids, popup){
		var dfd = new $.Deferred();
		if(!ids || ids.length < 1){
			dfd.reject();
			return dfd.promise();
		}

		var ds = popup.dataSource;
		setTimeout(function(){
			$.ajax({
				url : "/dms/devices?ids=" + ids.join(",")
			}).then(function(devices){
				var i, max = devices.length;
				var device, key, item;
				for( i = 0; i < max; i++ ){
					device = devices[i];
					item = ds.get(device.id);
					if(item){
						for( key in device){
							item[key] = device[key];
						}
						/*
						if(device.modes){
							item.modes = device.modes;
						}
						if(device.operations){
							item.operations = device.operations;
							console.log(item.operations);
						}

						if(device.modes){
							item.modes = device.modes;
						}

						item.status = Util.getStatus(device);

						if(device.controlPoint){
							console.log(item.controlPoint);
							item.controlPoint = device.controlPoint;
						}*/
					}
				}
				ds.fetch();
				popup.groupList.setDataSource(ds, false, true, true);
				dfd.resolve(devices);
			}).fail(function(){
				dfd.reject();
			});
		}, constants.TIME_OUT * 2);

		return dfd.promise();
	}

	var DeviceKeys = {
		indoor : "AirConditioner.Indoor.General",
		ventilator : "AirConditioner.Indoor.Ventilator",
		dhw : "AirConditioner.Indoor.DHW",
		point : "ControlPoint",
		light : "General"
	};

	/**
	*   <ul>
	*   <li>기기 제어를 위하여 /multiControl API를 호출한다.</li>
	*   </ul>
	*   @function refreshDevices
	*   @param {Array} data - 제어할 기기 정보 리스트
	*   @param {Array} ids - 제어할 기기 ID 리스트
	*   @param {kendojQueryWidget} popup - 그룹 제어 팝업 Widget 인스턴스
	*   @returns {void}
	*   @alias module:app/operation/group/config/group-control-vm
	*
	*/
	function multiControl(data, ids, popup){
		var Loading = popup.Loading;
		//data.dms_groups_ids = [dmsGroupId];
		return $.ajax({
			url : "/dms/devices/multiControl",
			method : "PUT",
			data : data
		}).done(function(){
			refreshDevices(ids, popup).always(function(){
				Loading.close();
			});
		}).fail(function(xhq){
			Loading.close();
			failResp(xhq);
		});
	}

	var controlTimer = [];

	/**
	*   <ul>
	*   <li>실내기 제어패널 조작 시 호출되는 Callback 함수로, Device 실내기 제어 패널 API를 호출한다.</li>
	*   </ul>
	*   @function indoorControl
	*   @param {Object} e - 실내기 제어패널 상태가 변경 될 때, 전달되는 Event 객체
	*   @returns {void}
	*   @alias module:app/operation/group/config/group-control-vm
	*/
	function indoorControl(e){
		// console.log("control panel change");
		// console.log(e);
		//선택한 아이템에 따라 Mutlti Control API 호출
		var item = e.item;
		var index = e.index;
		var subIndex = e.subIndex;
		var mode = e.mode;
		var sender = e.sender;
		var popup = sender.element.closest("#group-control-popup").data("kendoDetailDialog");

		var selectedIds = getSelectedIds(popup);
		var ids = selectedIds.ids;
		//var dsView = currentVm.dataSource.view();

		var controlSet = constants.controlSet[index];
		if(typeof subIndex !== "undefined"){
			controlSet = controlSet[subIndex];
			index = (index * 10) + subIndex;
		}

		if(controlTimer[index]){
			clearTimeout(controlTimer[index]);
			controlTimer[index] = void 0;
		}

		var object = {};
		var send;
		// id가 constant에 포함되어있지 않다면, id가 들어가지 않는 배열형태가 아니다.
		if(controlSet["id"]){
			object["id"] = controlSet["id"];
			if(mode) object["id"] = controlSet[mode];
			object[controlSet["parameter"]] = item.value;
			send = [];
			send.push(object);
		}else{
			//chiller와 같은 경우는 1depth가 더있다. 따라서 underParameter가 있다면 현재 파라미터 안에 1depth를 더 생성하여준다.
			if(controlSet["underParameter"]){
				object[controlSet["parameter"]] = {};
				object[controlSet["parameter"]][controlSet["underParameter"]] = item.value;
			}else{
				object[controlSet["parameter"]] = item.value;
			}
			send = object;
		}

		var ajax;
		controlTimer[index] = setTimeout(function(){
			var length = ids.length;
			var put = {};
			put["dms_devices_ids"] = [];
			put["control"] = {};
			put["control"][controlSet["apiName"]] = send;

			for(var i = 0; i < length; i++){
				put["dms_devices_ids"].push(ids[i]);
			}

			ajax = api.multiControl(put);

			var Loading = popup.Loading;
			Loading.open();
			ajax.done(function(){
				refreshDevices(ids, popup).always(function(){
					Loading.close();
				});
			}).fail(function(xhq){
				Loading.close();
				failResp(xhq);
			});

		}, constants.TIME_OUT * 2);
	}

	/**
	*   <ul>
	*   <li>기기 타입(실내기 제외) 별로 전원 제어를 위한 Object를 생성하고, /multiControl API를 호출한다.</li>
	*   </ul>
	*   @function controlPower
	*   @param {kendojQueryWidget} popup - 그룹 제어 팝업 Widget 인스턴스
	*   @param {kendoViewModel} control - 제어를 시도하는 제어 패널의 View Model
	*   @param {String} key - 기기 타입 Key String
	*   @returns {jQuery.Deferred}
	*   @alias module:app/operation/group/config/group-control-vm
	*/

	function controlPower(popup, control, key){
		//ajax
		var Loading = popup.Loading;
		Loading.open();
		var ids = getSelectedIds(popup);
		ids = ids.ids;

		var obj = {
			id : DeviceKeys[key]
		};
		//Power Check Name 까지 필요.
		//Power on/off 가 혼재된 경우(mixed) 사용자가 버튼 클릭시, on 으로 먼저 제어.
		if(!control.power.get("mixed")) {
			obj.power = control.power.get("active") ? "On" : "Off";
		} else {
			obj.power = "On";
			control.power.set("mixed", false);
		}

		var data = {
			dms_devices_ids : ids,
			control : {
				operations : [obj]
			}
		};

		//Light로 변환된 ControlPoint의 대한 제어
		/*var i, type, max = types.length;
		for( i = 0; i < max; i++ ){
			type = types[i];
			if(type.indexOf("ControlPoint") != -1 && type.indexOf("DO") != -1){
				data.control.controlPoint = {};
				data.control.controlPoint.value = control.power.get("active") ? 1 : 0;
				break;
			}
		}*/

		return multiControl(data, ids, popup);
	}
	/**
	*   <ul>
	*   <li>Point 값 제어를 위한 Object를 생성하고, /multiControl API를 호출한다.</li>
	*   </ul>
	*   @function setControlPoint
	*   @param {kendojQueryWidget} popup - 그룹 제어 팝업 Widget 인스턴스
	*   @param {kendoViewModel} control - 제어를 시도하는 제어 패널의 View Model
	*   @param {String} key - 기기 타입 Key String
	*   @returns {jQuery.Deferred} - 제이쿼리 디퍼드 객체.
	*   @alias module:app/operation/group/config/group-control-vm
	*/
	function setControlPoint(popup, control, key){
		var Loading = popup.Loading;
		Loading.open();
		var ids = getSelectedIds(popup);
		ids = ids.ids;

		var value;
		if(key == "aoav"){
			value = control.get("value");
		}else if(key == "dodv"){
			//Power on/off 가 혼재된 경우(mixed) 사용자가 버튼 클릭시, on(1) 으로 먼저 제어.
			if(!control.get("mixed")) {
				value = control.get("active") ? 1 : 0;
			} else {
				value = 1;
				control.set("mixed", false);
			}
		}

		if(typeof value == 'number') value = value.toString(); // 전달되는 control point 값을 string 타입으로 주기위함.
		var data = {
			dms_devices_ids : ids,
			control : {
				controlPoint : {
					value : value
				}
			}
		};

		return multiControl(data, ids, popup);
	}

	/**
	*   <ul>
	*   <li>조명 밝기 값 제어를 위한 Object를 생성하고, /multiControl API를 호출한다.</li>
	*   </ul>
	*   @function controlLight
	*   @param {kendojQueryWidget} popup - 그룹 제어 팝업 Widget 인스턴스
	*   @param {kendoViewModel} control - 제어를 시도하는 제어 패널의 View Model
	*   @param {String} key - 기기 타입 Key String
	*   @returns {jQuery.Deferred} - 제이쿼리 디퍼드 객체.
	*   @alias module:app/operation/group/config/group-control-vm
	*/
	function controlLight(popup, control){
		var Loading = popup.Loading;
		Loading.open();
		var ids = getSelectedIds(popup);
		ids = ids.ids;

		var value = control.get("value");
		var lights = [];
		lights.push({
			id : 1,
			dimmingLevel : value
		});
		var data = {
			dms_devices_ids : ids,
			control : {
				lights : lights
			}
		};

		//Light로 변환된 ControlPoint의 대한 제어
		/*var i, type, max = types.length;
		for( i = 0; i < max; i++ ){
			type = types[i];
			if(type.indexOf("ControlPoint") != -1 && type.indexOf("AO") != -1){
				data.control.controlPoint = {
					value : value
				};
				break;
			}
		}*/

		return multiControl(data, ids, popup);
	}
	/**
	*   <ul>
	*   <li>Gateway 제어를 위한 Object를 생성하고, /multiControl API를 호출한다.</li>
	*   </ul>
	*   @function setGateway
	*   @param {kendojQueryWidget} popup - 그룹 제어 팝업 Widget 인스턴스
	*   @param {kendoViewModel} controlData - 제어를 시도하는 제어 패널의 View Model
	*   @param {String} key - 기기 타입 Key String
	*   @returns {jQuery.Deferred} - 제이쿼리 디퍼드 객체.
	*   @alias module:app/operation/group/config/group-control-vm
	*/
	function setGateway(popup, controlData){
		var Loading = popup.Loading;
		Loading.open();
		var ids = getSelectedIds(popup);
		ids = ids.ids;

		var networks = [];
		if($.isArray(controlData)){
			var i, max = controlData.length;
			for( i = 0; i < max; i++ ){
				networks.push(controlData[i]);
			}
		}else{
			networks.push(controlData);
		}

		var data = {
			dms_devices_ids : ids,
			control : {
				networks : networks
			}
		};

		return multiControl(data, ids, popup);
	}

	var ViewModel = kendo.observable({
		init : function(popup, groupId){
			this.remoteControl.init();
			this.light.init();
			this.point.init();
			this.popup = popup;
			this.popup.Loading = new LoadingPanel(this.popup.element);
			this.groupId = groupId;
		},
		groupId : null,
		popup  : null,
		remoteControl : {
			init : function(){
				var remoteControl = this;
				remoteControl.set("invisible", false);
				remoteControl.control[0].set("active", false);
				remoteControl.control[1].set("active", false);
			},
			invisible : false,
			control : [{
				name : "Allowed",
				active : false,
				click : function(e){
					var control = this.remoteControl.control;
					var isActive = control[0].get("active");
					control[0].set("active", !isActive);
					control[1].set("active", false);
				}
			},
			{
				name : "NotAllowed",
				active : false,
				click : function(e){
					var control = this.remoteControl.control;
					var isActive = control[1].get("active");
					control[1].set("active", !isActive);
					control[0].set("active", false);
				}
			}]
		},
		light : {
			init : function(){
				var light = this;
				light.power.set("active", false);
				light.power.set("mixed", false);
				light.set("invisible", false);
				light.set("value", 50);
				light.power.set("invisible", false);
				light.dimming.set("invisible", false);
			},
			timeout : null,
			invisible : false,
			//AI, AO/ DI, DO 에 따라 밝기 또는 전원 제어만 보여주어야함.
			dimming : {
				invisible : false
			},
			value : 50,
			power : {
				mixed : false,
				insivible : false,
				active : false,
				click : function(e){
					var light = this.light;
					var isActive = light.power.get("active");
					var isMixed = light.power.get("mixed");
					//조명 전원 on/off 가 혼재된 경우에는 on 제어가 되기 때문에 기존 active 유지.
					if(!isMixed) {
						light.power.set("active", !isActive);
					}

					controlPower(this.popup, this.light, "light");
					//ajax
				}
			},
			slide : function(e){
				var light = this.light;
				var popup = this.popup;
				light.set("value", e.value);
				if(light.timeout){
					clearTimeout(light.timeout);
					light.timeout = null;
				}

				//timer ajax
				light.timeout = setTimeout(function(){
					controlLight(popup, light);
				}, 500);
			}
		},
		point : {
			init : function(){
				this.set("invisible", false);

				var dodv = this.dodv;
				dodv.set("invisible", false);
				dodv.set("active", false);
				dodv.set("mixed", false);

				var aoav = this.aoav;
				aoav.set("invisible", false);
				aoav.set("value", "0.00");
			},
			invisible : false,
			aoav : {
				invisible : false,
				value : "0.00",
				min : DOUBLE_NUMERIC_MIN,
				max : DOUBLE_NUMERIC_MAX,
				decimals : 2,
				send : function(e){
					setControlPoint(this.popup, this.point.aoav, "aoav");
				}
			},
			dodv : {
				invisible : false,
				active : false,
				mixed : false,
				click : function(){
					var control = this.point.dodv;
					var isActive = control.get("active");
					var isMixed = control.get("mixed");
					//DO 전원 on/off 가 혼재된 경우에는 on 제어가 되기 떄문에 기존 active 유지.
					if(!isMixed) {
						control.set("active", !isActive);
					}
					setControlPoint(this.popup, this.point.dodv, "dodv");
					//ajax
				},
				init : function(){
					var dodv = this;
					dodv.set("invisible", false);
					dodv.set("active", false);
				}
			}
		},
		/*Device 실내기 제어 패널*/
		indoorControlPanel : {
			invisible : true
		},
		//NW Gateway (IoT AP)
		gateway : {
			init : function(){
				this.set("invisible", false);
				this.set("gatewayZigbeePower", false);
				this.set("gatewayZigbeeChannel", "26");
				this.set("gatewayZigbeeTxPower", "9");
				this.set("gatewayZigbeeParingMode", false);
				this.set("gatewayBlePower", false);
				this.set("gatewayBleScanReport", false);
				this.set("gatewayBleScanReportInterval", 100);
				this.set("gatewayBleScanWindow", 100);
				this.set("gatewayBleScanInterval", 100);
				this.set("gatewayBleScanType", "Passive");
				this.set("gatewayBleAdvertisementInterval", 100);
				this.set("gatewayBleCalibration", -128);
				this.set("gatewayBleFirstPower", false);
				this.set("gatewayBleFirstAdvertiseName", "");
				this.set("gatewayBleFirstUUID", "");
				this.set("gatewayBleFirstMajor", 0);
				this.set("gatewayBleFirstMinor", 0);
				this.set("gatewayBleSecondPower", false);
				this.set("gatewayBleSecondAdvertiseName", "");
				this.set("gatewayBleSecondUUID", "");
				this.set("gatewayBleSecondMajor", 0);
				this.set("gatewayBleSecondMinor", 0);
				this.set("gatewayBleThirdPower", false);
				this.set("gatewayBleThirdAdvertiseName", "");
				this.set("gatewayBleThirdUUID", "");
				this.set("gatewayBleThirdMajor", 0);
				this.set("gatewayBleThirdMinor", 0);
			},
			invisible : false,
			gatewayZigbeePower : false,
			clickGatewayZigbeePower : function(e){
				var value = $(e.target).prop("value");
				setGateway(this.popup,
						   { id : 4, enabled : value });
			},
			gatewayZigbeeChannel : "26",
			gatewayZigbeeChannelList : ["26","25","24","23","22","21","20","19","18","17","16","15","14","13","12","11"],
			changeGatewayZigbeeChannel : function(e){
				var value = this.gateway.get("gatewayZigbeeChannel");
				setGateway(this.popup,
						   { id : 4, zigbee : { channel : value }});
			},
			gatewayZigbeeTxPower : "9",
			gatewayZigbeeTxPowerList : ["9", "-3", "-15", "-25"],
			changeGatewayZigbeeTxPower : function(e){
				var value = this.gateway.get("gatewayZigbeeTxPower");
				setGateway(this.popup,
						   { id : 4, zigbee : { txPower : value }});
			},
			gatewayZigbeePairingMode : false,
			clickGatewayZigbeePairingMode : function(e){
				var value = $(e.target).prop("value");
				setGateway(this.popup,
						   { id : 4, zigbee : { pairing : value }});
			},
			gatewayBlePower : false,
			clickGatewayBlePower : function(e){
				var value = $(e.target).prop("value");
				setGateway(this.popup,
						   { id : 5, enabled : value });
			},
			gatewayBleScanReport : false,
			clickGatewayBleScanReport : function(e){
				var value = $(e.target).prop("value");
				setGateway(this.popup,
						   { id : 5, ble : { scanlistReportEnabled : value }});
			},
			gatewayBleScanReportInterval : 100,
			changeGatewayBleScanReportInterval : function(e){
				var value = this.gateway.get("gatewayBleScanReportInterval");
				setGateway(this.popup,
						   { id : 5, ble : { scanlistReportInterval : value }});
			},
			gatewayBleScanWindow : 100,
			changeGatewayBleScanWindow : function(e){
				var value = this.gateway.get("gatewayBleScanWindow");
				setGateway(this.popup,
						   { id : 5, ble : { scanWindow : value }});
			},
			gatewayBleScanInterval : 0,
			changeGatewayBleScanInterval : function(e){
				var value = this.gateway.get("gatewayBleScanInterval");
				setGateway(this.popup,
						   { id : 5, ble : { scanInterval : value }});
			},
			gatewayBleScanType : "Passive",
			clickGatewayBleScanType : function(e){
				var value = $(e.target).prop("value");
				setGateway(this.popup,
						   { id : 5, ble : { scanType : value }});
			},
			gatewayBleAdvertisementInterval : 100,
			changeGatewayBleAdvertisementInterval : function(e){
				var value = this.gateway.get("gatewayBleAdvertisementInterval");
				setGateway(this.popup,
						   [{ id : 6, ble : { advertisingInterval : value }},
						{ id : 7, ble : { advertisingInterval : value }},
						{ id : 8, ble : { advertisingInterval : value }}]);
			},
			gatewayBleTxPower : 0,
			changeGatewayBleTxPower : function(e){
				var value = this.gateway.get("gatewayBleTxPower");
				setGateway(this.popup,
						   [{ id : 6, ble : { txPower : value }},
						{ id : 7, ble : { txPower : value }},
						{ id : 8, ble : { txPower : value }}]);
			},
			gatewayBleCalibration : -128,
			changeGatewayBleCalibration : function(e){
				var value = this.gateway.get("gatewayBleCalibration");
				setGateway(this.popup,
						   [{ id : 6, ble : { txPowerAttenuation : value }},
						{ id : 7, ble : { txPowerAttenuation : value }},
						{ id : 8, ble : { txPowerAttenuation : value }}]);
			},
			gatewayBleFirstPower : false,
			clickGatewayBleFirstPower : function(e){
				var value = $(e.target).prop("value");
				setGateway(this.popup,
						   { id : 6,  enabled : value });
			},
			gatewayBleFirstAdvertiseName : "",
			changeGatewayBleFirstAdvertiseName : function(e){
				var value = this.gateway.get("gatewayBleFirstAdvertiseName");
				setGateway(this.popup,
						   { id : 6, ble : { advertisingName : value }});
			},
			gatewayBleFirstUUID : "",
			changeGatewayBleFirstUUID : function(e){
				var value = this.gateway.get("gatewayBleFirstUUID");
				setGateway(this.popup,
						   { id : 6, ble : { uuid : value }});
			},
			gatewayBleFirstMajor : 0,
			changeGatewayBleFirstMajor : function(e){
				var value = this.gateway.get("gatewayBleFirstMajor");
				setGateway(this.popup,
						   { id : 6, ble : { major : value }});
			},
			gatewayBleFirstMinor : 0,
			changeGatewayBleFirstMinor : function(e){
				var value = this.gateway.get("gatewayBleFirstMinor");
				setGateway(this.popup,
						   { id : 6, ble : { minor : value }});
			},
			gatewayBleSecondPower : false,
			clickGatewayBleSecondPower : function(e){
				var value = $(e.target).prop("value");
				setGateway(this.popup,
						   { id : 7,  enabled : value });
			},
			gatewayBleSecondAdvertiseName : "",
			changeGatewayBleSecondAdvertiseName : function(e){
				var value = this.gateway.get("gatewayBleSecondAdvertiseName");
				setGateway(this.popup,
						   { id : 7, ble : { advertisingName : value }});
			},
			gatewayBleSecondUUID : "",
			changeGatewayBleSecondUUID : function(e){
				var value = this.gateway.get("gatewayBleSecondUUID");
				setGateway(this.popup,
						   { id : 7, ble : { uuid : value }});
			},
			gatewayBleSecondMajor : 0,
			changeGatewayBleSecondMajor : function(e){
				var value = this.gateway.get("gatewayBleSecondMajor");
				setGateway(this.popup,
						   { id : 7, ble : { major : value }});
			},
			gatewayBleSecondMinor : 0,
			changeGatewayBleSecondMinor : function(e){
				var value = this.gateway.get("gatewayBleSecondMinor");
				setGateway(this.popup,
						   { id : 7, ble : { minor : value }});
			},
			gatewayBleThirdPower : false,
			clickGatewayBleThirdPower : function(e){
				var value = $(e.target).prop("value");
				setGateway(this.popup,
						   { id : 8,  enabled : value });
			},
			gatewayBleThirdAdvertiseName : "",
			changeGatewayBleThirdAdvertiseName : function(e){
				var value = this.gateway.get("gatewayBleThirdAdvertiseName");
				setGateway(this.popup,
						   { id : 8, ble : { advertisingName : value }});
			},
			gatewayBleThirdUUID : "",
			changeGatewayBleThirdUUID : function(e){
				var value = this.gateway.get("gatewayBleThirdUUID");
				setGateway(this.popup,
						   { id : 8, ble : { uuid : value }});
			},
			gatewayBleThirdMajor : 0,
			changeGatewayBleThirdMajor : function(e){
				var value = this.gateway.get("gatewayBleThirdMajor");
				setGateway(this.popup,
						   { id : 8, ble : { major : value }});
			},
			gatewayBleThirdMinor : 0,
			changeGatewayBleThirdMinor : function(e){
				var value = this.gateway.get("gatewayBleThirdMinor");
				setGateway(this.popup,
						   { id : 8, ble : { minor : value }});
			}
		},
		beacon : {
			init : function(){
				this.set("invisible", false);
				this.set("advertisingName", "");
				this.set("advertisingInterval", 0);
				this.set("uuid", "");
				this.set("minor", 0);
				this.set("major", 0);
			},
			invisible : false,
			advertisingName : "",
			changeAdvertisingName : function(e){
				var value = this.beacon.get("advertisingName");
				setGateway(this.popup,
						   { id : 1, ble : { advertisingName : value }});
			},
			advertisingInterval : 100,
			changeAdvertisingInterval : function(e){
				var value = this.beacon.get("advertisingInterval");
				setGateway(this.popup,
						   { id : 1, ble : { advertisingInterval : value }});
			},
			uuid : "",
			changeUuid : function(e){
				var value = this.beacon.get("uuid");
				setGateway(this.popup,
						   { id : 1, ble : { uuid : value }});
			},
			major : 0,
			changeMajor : function(e){
				var value = this.beacon.get("major");
				setGateway(this.popup,
						   { id : 1, ble : { major : value }});
			},
			minor : 0,
			changeMinor : function(e){
				var value = this.beacon.get("minor");
				setGateway(this.popup,
						   { id : 1, ble : { minor : value }});
			},
			txPower : 0,
			changeTxPower : function(e){
				var value = this.beacon.get("txPower");
				setGateway(this.popup,
						   { id : 1, ble : { txPower : value }});
			}
		}
	});

	return {
		viewModel : ViewModel,
		indoorControl : indoorControl,
		indoorControlPanelInvisible : indoorControlPanelInvisible,
		refreshIndoorDevices : refreshIndoorDevices
	};
});

//# sourceURL=operation-group-control-vm.js