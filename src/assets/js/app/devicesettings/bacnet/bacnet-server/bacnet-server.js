define("devicesettings/bacnet/bacnet-server/bacnet-server", ["devicesettings/core"], function() {
	//UTIL
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();
	var Util = window.Util;
	var I18N = window.I18N;
	var kendo = window.kendo;

	//다국어
	var BACNET_SERVER_RUNNING = I18N.prop("BACNET_SERVER_RUNNING");
	var BACNET_SERVER_STOP = I18N.prop("BACNET_SERVER_STOP");
	var BACNET_MESSAGE_CANNOT_USE_SAME_INSTANCE_NUMBER = I18N.prop("BACNET_MESSAGE_CANNOT_USE_SAME_INSTANCE_NUMBER");

	var CLASS_NO_UNIT_HIGHLIGHT = 'no-unit-highlight';
	var POPUP_SERVER_GRID_ROW_HEIGHT = 84;

	//컨펌 및 메시지 Dialog
	var confirmElem = $("#popup-sac-bacnet-device-confirm");
	var messageElem = $("#popup-sac-bacnet-device-message");
	var confirm, message;

	//컨텐츠 - wrapper
	var elemBacnetTab = $('#device-setting-bacnet-tab'),
		bacnetTab = null;
	var serverTab = null;
	var wrapServer = $(".sac-bacnet-contents.server");

	//URL
	var BacNetUrlServer = "/bacnet/server/";

	//Content Wrapper - Server
	var divObjectId = wrapServer.find(".sac-bacnet-category.objectid");
	var divApdu = wrapServer.find(".sac-bacnet-category.apdu");
	var divPointList = wrapServer.find(".sac-bacnet-category.pointlist");
	var divApduDetail = divApdu.find(".sub-detail");
	//Input - Server
	var inputServerObjectId = divObjectId.find("input[data-role=bacnetserverobjectid]");
	var inputApduTimeOut = divApduDetail.find("#bacnet-apdu-timeout");
	var inputApduRetries = divApduDetail.find("#bacnet-apdu-retries");
	var inputApduMaxLength = divApduDetail.find("#bacnet-apdu-maxlength");
	var inputApduSegmentTimeOut = divApduDetail.find("#bacnet-apdu-segmenttimeout");
	var inputApduSegmentSupported = divApduDetail.find("input[data-role=bacnetapdusegmentsupported]");
	var apduTimeOut, apduRetries, apduMaxLength, apduSegmentTimeOut, apduSegmentSupported;
	//Button - Server
	var buttonApduStart = divApduDetail.find(".k-button[data-event=bacnetserverstart]");
	var buttonApduStop = divApduDetail.find(".k-button[data-event=bacnetserverstop]");
	var buttonManagePoint = divPointList.find(".k-button[data-event=managepoints]");
	var buttonPoinstListDelete = divPointList.find(".k-button[data-event=pointlistdelete]");
	//Server Status
	var spanServerStatus = divApduDetail.find("span[data-role=bacnetserverstatus]");
	//Grid - Server 메인 윈도우
	var pointListGridElem = divPointList.find(".sac-bacnet-grid-pointlist");
	var pointListGrid;
	var pointListDataSource = null; //메인 윈도우 그리드에 표시되는 데이터
	var selectedPointList = [];
	var selectedPointIndex = null;
	//Grid - Server 디테일 팝업
	var popupServerElem = $("#popup-sac-bacnet-server");
	var popupServerGridElem = popupServerElem.find(".popup-detail-pointlist-grid");
	var popupServerGrid;
	var popupServerGridDataSource = null; //메인 윈도우 그리드에 표시할 데이터를 포함한 전체 데이터
	var popupServerGridVirtualScroll = null;
	var getChangedRowUidArr = [];
	var dataSourceFromDms = null;
	var isPopupGridSaved = false;

	//BacNet object Model - Server PopupGrid 및 Server MainGrid의 Field값과 매칭
	var BacNetObjectModel = function() {
		this.dms_devices_id = null;
		this.checked = false; //show
		this.show = false; //show
		this.type = null; //Device Type
		this.dms_devices_controlPoint_tagName = null; //Device name
		this.name = null; //Device name
		this.dms_devices_mappedType = null; //Property
		this.dms_devices_controlPoint_value = null; //Value
		this.instanceNumber = null; //BAC Net Instance number input 입력값
		this.calcInstanceNumber = null; //BAC Net 계산된 Instance Number 값
		this.displaydeviceTypeText = null;
		this.unit = null; //Units
		this.writable = false; //Writable
		this.priorities = [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]; //Priority Array
		this.hasInstanceNumber = false;
	};

	//Datsource for DropDownList
	var dataSourceForDDLInPopupClient = {
		priorities: {
			optionsLabel: "Priority",
			data: function() {
				var result = [],
					limit = 16;
				for (var i = 0; i < limit; i++) {
					var obj = {
						value: null,
						text: null
					};
					obj.value = i + 1;
					obj.text = "Out " + (i + 1);
					result.push(obj);
				}
				return result;
			}
		},
		dms_devices_mappedType: {
			optionsLabel: "Type",
			data: function() {
				var result = [{
					value: "ControlPoint",
					text: I18N.prop("SETTINGS_MENUCONFIGURE_POINT")
				},
				{
					value: "Light",
					text: I18N.prop("SETTINGS_MENUCONFIGURE_LIGHT")
				},
				{
					value: "Sensor.Temperature",
					text: I18N.prop("SETTINGS_TEMPERATURE_SENSOR")
				},
				{
					value: "Meter",
					text: I18N.prop("SETTINGS_ENERGY_METER")
				},
				{
					value: "Sensor.Humidity",
					text: I18N.prop("SETTINGS_HUMIDITY_SENSOR")
				}
				];
				return result;
			}
		},
		dms_devices_type: {
			optionsLabel: "I/O type",
			data: function() {
				var result = [{
					value: "ControlPoint.AI",
					text: "AI"
				},
				{
					value: "ControlPoint.AO",
					text: "AO"
				},
				{
					value: "ControlPoint.AV",
					text: "AO"
				},
				{
					value: "ControlPoint.BI",
					text: "DI"
				},
				{
					value: "ControlPoint.BO",
					text: "DO"
				},
				{
					value: "ControlPoint.BV",
					text: "DO"
				},
				{
					value: "ControlPoint.MI",
					text: "AI"
				},
				{
					value: "ControlPoint.MO",
					text: "AO"
				},
				{
					value: "ControlPoint.MV",
					text: "AO"
				}
				];
				return result;
			}
		},
		managePoint_unit: {
			data: function() {
				var result = [{
					value: null,
					text: I18N.prop('COMMON_NO_SELECT')
				},{
					value: "Celsius",
					text: "°C"
				},
				{
					value: "Fahrenheit",
					text: "°F"
				},
				{
					value: "KilowattHour",
					text: "kWh"
				},
				{
					value: "Percent",
					text: "%"
				}
				];
				return result;
			},
			textValue: {
				'Celsius': '°C',
				'Fahrenheit': '°F',
				'KilowattHour': 'kWh',
				'Percent': '%'
			}
		}
	};

	//Display Name for Devices
	var displayNameInBACnet = {
		bacNetServerPopupGridDeviceType: {
			"ControlPoint.AI": {
				value: "AI",
				text: "AI"
			},
			"ControlPoint.AO": {
				value: "AO",
				text: "AO"
			},
			"ControlPoint.AV": {
				value: "AO",
				text: "AO"
			},
			"ControlPoint.DI": {
				value: "BI",
				text: "DI"
			},
			"ControlPoint.DO": {
				value: "BO",
				text: "DO"
			},
			"ControlPoint.DV": {
				value: "BO",
				text: "DO"
			},
			"ControlPoint.BI": {
				value: "BI",
				text: "DI"
			},
			"ControlPoint.BO": {
				value: "BO",
				text: "DO"
			},
			"ControlPoint.BV": {
				value: "BO",
				text: "DO"
			},
			"ControlPoint.MI": {
				value: "AI",
				text: "AI"
			},
			"ControlPoint.MO": {
				value: "AO",
				text: "AO"
			},
			"ControlPoint.MV": {
				value: "AO",
				text: "AO"
			}
		},
		bacNetMappedType: {
			"ControlPoint": I18N.prop("SETTINGS_MENUCONFIGURE_POINT"),
			"Light": I18N.prop("SETTINGS_MENUCONFIGURE_LIGHT"),
			"Sensor.Temperature": I18N.prop("SETTINGS_TEMPERATURE_SENSOR"),
			"Sensor.Humidity": I18N.prop("SETTINGS_HUMIDITY_SENSOR"),
			"Sensor.Motion": I18N.prop("SETTINGS_MENUCONFIGURE_MOTION"),
			"Meter.WattHour": I18N.prop("SETTINGS_ENERGY_METER")
		}
	};

	//BACnet Device Type Number
	var deviceTypeNumberForBACnetDeviceId = {
		AI: 0,
		AO: 1,
		AV: 2,
		BI: 3,
		BO: 4,
		BV: 5,
		DI: 3,
		DO: 4,
		DV: 5,
		CA: 6,
		CM: 7,
		DE: 8,
		MI: 13,
		MO: 14,
		MV: 19
	};

	var dropDownListTemplate = kendo.template('<span title="" style="width: 113px;" class="k-widget k-dropdown k-header common-grid-dropdown sac-indoor-dropdownlist"' +
		'unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="" aria-disabled="false" aria-busy="false"' +
		'aria-activedescendant="80142285-e564-4717-88fa-3dd3d64ad025" data-field="#=field#">' +
		'<span unselectable="on" class="k-dropdown-wrap #if(disabled){#k-state-disabled#}else{#k-state-default#}#">' +
		'<span unselectable="on" class="k-input">#=text#</span>' +
		'<span unselectable="on" class="k-select" aria-label="select">' +
		'<span class="k-icon k-i-arrow-60-down"></span></span></span>' +
		'<input class="sac-indoor-dropdownlist current-limit" data-value="#=value#" style="display: none;">' +
		'</span>');

	var init = function(){
		//컴포넌트 초기화
		initComponent();

		//팝업 초기화
		initServerPopup();

		//메인 윈도우 그리드 이벤트 등록
		attachEvtServerGrid();

		//팝업 내부 이벤트 등록
		attachServerPopupEvent();

		//팝업 내부 그리드 이벤트 등록
		attachServerPopupGridEvent();

		//메인 윈도우 요소 이벤트 등록
		attachEvtServerWindow();

		requestBacnetServerData();
	};

	/**
	 *
	 *   BACnet 탭 진입 시 클라이언트 및 서버 탭의 컴포넌트를 초기화 한다.
	 *
	 *   @function initComponent
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//컴포넌트 초기화
	var initComponent = function() {
		bacnetTab = elemBacnetTab.data('kendoCommonTabStrip');
		if(!bacnetTab){
			bacnetTab = elemBacnetTab.kendoCommonTabStrip().data('kendoCommonTabStrip');
		}
		serverTab = bacnetTab.tabGroup.find('li[data-role=servertab]');

		// Dialog
		confirm = confirmElem.data('kendoCommonDialog');
		if(!confirm){
			confirm = confirmElem.kendoCommonDialog({
				type: "confirm",
				title: "Notification"
			}).data("kendoCommonDialog");
		}
		message = messageElem.data('kendoCommonDialog');
		if(!message){
			message = messageElem.kendoCommonDialog().data("kendoCommonDialog");
		}

		//DropDownList DataSource
		var apduSegmentSupportedDataSource = [{
			value: "NoSegmentation",
			text: I18N.prop("BACNET_NO_SEGMENTATION")
		},
		{
			value: "SegmentedReceive",
			text: I18N.prop("BACNET_SEGMENTATION")
		},
		{
			value: "SegmentedTransmit",
			text: I18N.prop("BACNET_SEGMENTED_SEND")
		},
		{
			value: "SegmentedBoth",
			text: I18N.prop("BACNET_SEGMENTED")
		}
		];

		//Button
		buttonApduStart.kendoButton();
		buttonApduStop.kendoButton();
		buttonManagePoint.kendoButton();
		buttonPoinstListDelete.kendoButton().data("kendoButton").enable(false);

		//Custom Numeric Box
		apduTimeOut = inputApduTimeOut.kendoCustomNumericBox({
			unit: "ms",
			placeholder: "",
			format: "#",
			enable: true,
			blockKeyEvent: false,
			min: 100,
			max: 60000,
			showValueWhenDisabled: true
		}).data("kendoCustomNumericBox");
		apduRetries = inputApduRetries.kendoCustomNumericBox({
			unit: "",
			placeholder: "",
			format: "#",
			enable: true,
			blockKeyEvent: false,
			min: 0,
			max: 10,
			showValueWhenDisabled: true
		}).data("kendoCustomNumericBox");
		apduMaxLength = inputApduMaxLength.kendoCustomNumericBox({
			unit: "bytes",
			placeholder: "",
			format: "#",
			enable: true,
			blockKeyEvent: false,
			min: 100,
			max: 1476,
			showValueWhenDisabled: true
		}).data("kendoCustomNumericBox");
		apduSegmentTimeOut = inputApduSegmentTimeOut.kendoCustomNumericBox({
			unit: "ms",
			placeholder: "",
			format: "#",
			enable: true,
			blockKeyEvent: false,
			min: 100,
			max: 60000,
			showValueWhenDisabled: true
		}).data("kendoCustomNumericBox");
		apduSegmentSupported = inputApduSegmentSupported.kendoDropDownList({
			dataSource: apduSegmentSupportedDataSource,
			dataValueField: "value",
			dataTextField: "text"
		}).data("kendoDropDownList");

		//Validator
		inputServerObjectId.kendoCommonValidator({
			type: "onlyNumber",
			rules: {
				maxNumber: function(input) {
					return !(Number(input.val()) > 4194303);
				},
				minNumber: function(input) {
					return !(Number(input.val()) < 0);
				}
			},
			messages: {
				maxNumber: I18N.prop("COMMON_INVALID_VALUE"),
				minNumber: I18N.prop("COMMON_INVALID_VALUE")
			}
		});
		inputApduTimeOut.kendoCommonValidator({
			type: "onlyNumber",
			minLength: 1,
			maxLength: 5,
			rules: {
				required: function(input) {
					return !(input.val() == "");
				},
				maxNumber: function(input) {
					return !(Number(input.val()) > 60000);
				},
				minNumber: function(input) {
					if (input.val() != "") {
						return !(Number(input.val()) < 100);
					}
					return true;
				}
			},
			messages: {
				required: I18N.prop("COMMON_REQUIRED_INFORMATION"),
				maxNumber: I18N.prop("COMMON_INVALID_VALUE"),
				minNumber: I18N.prop("COMMON_INVALID_VALUE")
			}
		});
		inputApduRetries.kendoCommonValidator({
			type: "onlyNumber",
			minLength: 1,
			maxLength: 2,
			rules: {
				required: function(input) {
					return !(input.val() == "");
				},
				maxNumber: function(input) {
					return !(Number(input.val()) > 10);
				},
				minNumber: function(input) {
					return !(Number(input.val()) < 0);
				}
			},
			messages: {
				required: I18N.prop("COMMON_REQUIRED_INFORMATION"),
				maxNumber: I18N.prop("COMMON_INVALID_VALUE"),
				minNumber: I18N.prop("COMMON_INVALID_VALUE")
			}
		});
		inputApduMaxLength.kendoCommonValidator({
			type: "onlyNumber",
			minLength: 1,
			maxLength: 5,
			rules: {
				required: function(input) {
					return !(input.val() == "");
				},
				maxNumber: function(input) {
					return !(Number(input.val()) > 1476);
				},
				minNumber: function(input) {
					return !(Number(input.val()) < 100);
				}
			},
			messages: {
				required: I18N.prop("COMMON_REQUIRED_INFORMATION"),
				maxNumber: I18N.prop("COMMON_INVALID_VALUE"),
				minNumber: I18N.prop("COMMON_INVALID_VALUE")
			}
		});
		inputApduSegmentTimeOut.kendoCommonValidator({
			type: "onlyNumber",
			minLength: 1,
			maxLength: 5,
			rules: {
				required: function(input) {
					return !(input.val() == "");
				},
				maxNumber: function(input) {
					return !(Number(input.val()) > 60000);
				},
				minNumber: function(input) {
					return !(Number(input.val()) < 100);
				}
			},
			messages: {
				required: I18N.prop("COMMON_REQUIRED_INFORMATION"),
				maxNumber: I18N.prop("COMMON_INVALID_VALUE"),
				minNumber: I18N.prop("COMMON_INVALID_VALUE")
			}
		});

		//Main Grid
		pointListGrid = pointListGridElem.kendoGrid({
			dataSource: [],
			columns: setServerGridColumns(),
			scrollable: {
				virtual: true
			},
			height: '100%',
			hasCheckedModel: true,
			setCheckedAttribute: true
		}).data("kendoGrid");
	};

	// 서버로부터 BACnet 데이터 요청
	var requestBacnetServerData = function(){
		//Server Page 최초 진입 시 서버 정지명령.
		// Loading.open();
		// $.ajax({
		// 	url: BacNetUrlServer + "status"
		// }).done(function(data) {
		// 	var isActive = false,
		// 		statusTxt = "";
		//
		// 	if (data.isActive) { //서버 동작중
		// 		isActive = true;
		// 		statusTxt = BACNET_SERVER_RUNNING;
		// 	} else { //서버 정지중
		// 		isActive = false;
		// 		statusTxt = BACNET_SERVER_STOP;
		// 	}
		//
		// 	//서버 설정 상태 결정
		// 	spanServerStatus.text(statusTxt);
		// 	applyStateOfServerConfig(isActive);
		// }).fail(function() {
		// 	// var msg = Util.parseFailResponse(data);
		// 	message.message(BACNET_SERVER_STOP);
		// 	message.open();
		// 	spanServerStatus.text(BACNET_SERVER_STOP);
		//
		// 	//서버 상태를 알 수 없는 경우 Start, Stop 버튼 둘다 활성화
		// 	buttonApduStart.data("kendoButton").enable(true);
		// 	buttonApduStop.data("kendoButton").enable(true);
		// }).always(function() {
		// 	Loading.close();
		//
		// 	//BACnet Server API 요청 - 로직 분리
		// });


		Loading.open();
		$.ajax({
			url: BacNetUrlServer
			//url: "/dms/devices?types=ControlPoint.A*,ControlPoint.D*&attributes=id,type,mappedType,controlPoint-tagName,controlPoint-value"
		}).done(function(data) {
			Loading.close();

			// 1. 서버 상태 적용
			var isActive = false,
				statusTxt = '';

			if(data.hasOwnProperty('enabled')){ // enabled 키가 있는 경우 해당 값 사용
				isActive = data.enabled;
			}else if(data.hasOwnProperty('isActive')){ // 없다면 기존의 isActive 값 적용
				isActive = data.isActive;
			}

			if(isActive){// 서버 동작
				statusTxt = BACNET_SERVER_RUNNING;
			}else{// 서버 정지 상태
				statusTxt = BACNET_SERVER_STOP;
			}

			spanServerStatus.text(statusTxt);
			applyStateOfServerConfig(isActive);

			// 2. BACnet 서버 응답값 반영
			inputServerObjectId.val(data.deviceId ? data.deviceId : null);
			inputServerObjectId.data('kendoCommonValidator').validate();
			apduTimeOut.value(data.timeout ? data.timeout : null);
			apduMaxLength.value(data.maxLength ? data.maxLength : null);
			apduSegmentTimeOut.value(data.segmentTimeout ? data.segmentTimeout : null);
			apduSegmentSupported.value(data.segmentationSupported ? data.segmentationSupported : null);
			if (data.retries === null || typeof data.retries == 'undefined') {
				apduRetries.value(null);
			} else {
				apduRetries.value(data.retries);
			}

			// 3. BacNetObject 모델 생성 및 데이터 파싱
			//BacNetObjectModel - show, type, dms_devices_controlPoint_tagName, dms_devices_mappedType, dms_devices_controlPoint_value, instanceNumber, unit, writable ,priorities
			var dataArr = [];
			if (!data.objects) {
				data.objects = [];
			}
			for (var i = 0; i < data.objects.length; i++) {
				var tmpObj = data.objects[i];

				var bacNetObj = new BacNetObjectModel();
				bacNetObj.checked = true;
				bacNetObj.show = true;
				bacNetObj.dms_devices_id = tmpObj.dms_devices_id ? tmpObj.dms_devices_id : null;
				bacNetObj.type = tmpObj.type ? "ControlPoint." + tmpObj.type : null;
				bacNetObj.name = tmpObj.name ? tmpObj.name : null;
				bacNetObj.dms_devices_controlPoint_tagName = tmpObj.dms_devices_controlPoint_tagName ? tmpObj.dms_devices_controlPoint_tagName : null;
				bacNetObj.dms_devices_mappedType = tmpObj.dms_devices_mappedType ? tmpObj.dms_devices_mappedType : null;
				if (tmpObj.dms_devices_controlPoint_value) {
					bacNetObj.dms_devices_controlPoint_value = tmpObj.dms_devices_controlPoint_value;
				} else if (tmpObj.dms_devices_controlPoint_value == 0.0) {
					bacNetObj.dms_devices_controlPoint_value = tmpObj.dms_devices_controlPoint_value;
				}
				bacNetObj.hasInstanceNumber = true;
				bacNetObj.calcInstanceNumber = tmpObj.id ? tmpObj.id : null;
				bacNetObj.instanceNumber = parseInt(getGroupOfBitValue(tmpObj.id).value22Bit, 2);
				bacNetObj.unit = tmpObj.unit ? tmpObj.unit : null;
				if (typeof tmpObj.writable == "boolean") {
					bacNetObj.writable = tmpObj.writable;
				} else {
					bacNetObj.writable = tmpObj.writable ? tmpObj.writable : false;
				}
				bacNetObj.priorities = tmpObj.priorities ? tmpObj.priorities : null;
				dataArr.push(bacNetObj);
			}
			pointListDataSource = new kendo.data.DataSource({
				data: dataArr,
				pageSize: 30
			});
			pointListDataSource.read();

			Loading.open();
			$.ajax({
				//url: "/dms/devices?types=ControlPoint.A*,ControlPoint.D*&attributes=id,type,mappedType,controlPoint-tagName,controlPoint-value"
				url: "/dms/devices?types=ControlPoint.A*,ControlPoint.D*&attributes=id,type,name,mappedType,controlPoint-origin,controlPoint-tagName,controlPoint-value"
			}).done(function(resp) {
				Loading.close();
				var dmsDataArr = resp;
				var resultArr = [];

				for (var idx = 0; idx < pointListDataSource.data().length; idx++) {
					var bacData = pointListDataSource.data()[idx];
					for (var j = 0; j < dmsDataArr.length; j++) {
						var dmsData = dmsDataArr[j];
						if (bacData.dms_devices_id == dmsData.id) {
							bacData.name = dmsData.name;
							resultArr.push(bacData);
						}
					}
				}

				pointListDataSource = new kendo.data.DataSource({
					data: resultArr,
					pageSize: 30
				});
				pointListDataSource.read();
				pointListGrid.setDataSource(pointListDataSource);
				pointListGrid.uncheckAll();
			}).fail(function(resp) {
				Loading.close();
				message.message(resp.status);
				message.open();
				//서버 설정 상태 결정
				applyStateOfServerConfig(false);
			}).always(function() {
				checkSelectedPointList();
			});
		}).fail(function(data) {
			Loading.close();
			pointListDataSource = new kendo.data.DataSource({
				data: []
			});
			pointListDataSource.read();
			pointListGrid.setDataSource(pointListDataSource);
			pointListGrid.uncheckAll();
			message.message(data.responseText);
			message.open();

			//서버 설정 상태 결정
			spanServerStatus.text(BACNET_SERVER_STOP);
			applyStateOfServerConfig(false);
		}).always(function() {
			//kendoCommonNumeric - Timeout, Retries, MaxLength, SegmentTimeout
			if (!apduTimeOut.value() || apduRetries.value() === null || typeof apduRetries.value() == 'undefined' || !apduMaxLength.value() || !apduSegmentTimeOut.value()) {
				buttonApduStart.data("kendoButton").enable(false);
			}
			checkSelectedPointList();
		});
	};

	/**
	 *
	 *   서버 탭의 UI 요소에 이벤트를 등록한다.
	 *
	 *   @function attachEvtServerWindow
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Server 탭 메인 윈도우 이벤트 등록
	var attachEvtServerWindow = function() {
		//Server Tab Menu
		serverTab.on("click", requestBacnetServerData);

		//Start Button
		buttonApduStart.on("click", function() {
			var sendObj = {
				"deviceId": Number(inputServerObjectId.val()),
				//"enabled": true,
				"maxLength": Number(apduMaxLength.element.val()),
				"timeout": Number(apduTimeOut.element.val()),
				"retries": Number(apduRetries.element.val()),
				"segmentTimeout": Number(apduSegmentTimeOut.element.val()),
				"segmentationSupported": apduSegmentSupported.value(),
				"objects": []
			};

			var key;
			for (var i = 0; i < pointListDataSource.data().length; i++) {
				var pointObj = pointListDataSource.data()[i];
				var pointObjTypeValue = null;
				var obj = {
					id: pointObj.calcInstanceNumber,
					type: displayNameInBACnet.bacNetServerPopupGridDeviceType[pointObj.type].value,
					writable: pointObj.writable,
					unit: pointObj.unit,
					priorities: pointObj.priorities,
					dms_devices_id: pointObj.dms_devices_id,
					dms_devices_mappedType: pointObj.dms_devices_mappedType,
					dms_devices_controlPoint_tagName: pointObj.dms_devices_controlPoint_tagName,
					dms_devices_controlPoint_value: Number(pointObj.dms_devices_controlPoint_value)
				};

				// 변환된 타입이 AI, BI, MI 인 경우 objects 배열 내부 객체의 'writable', 'priorities' 제거
				pointObjTypeValue = displayNameInBACnet.bacNetServerPopupGridDeviceType[pointObj.type].value;
				if (pointObjTypeValue == 'AI' || pointObjTypeValue == 'BI' || pointObjTypeValue == 'MI'){
					delete obj.writable;
					delete obj.priorities;
				}

				for (key in obj) {
					if (!obj[key]) {
						if (obj[key] != 0) {
							delete obj[key];
						}
					}
				}
				sendObj.objects.push(obj);
			}

			for (key in sendObj) {
				if (sendObj[key] === "" || sendObj[key] === null || typeof sendObj[key] == 'undefined') {
					delete sendObj[key];
				}
			}
			Loading.open();
			$.ajax({
				url: BacNetUrlServer + "start",
				method: "PUT",
				data: sendObj
			}).done(function() {
				message.message(BACNET_SERVER_RUNNING);
				spanServerStatus.text(BACNET_SERVER_RUNNING);
				//서버 설정 상태 결정
				applyStateOfServerConfig(true);
			}).fail(function(data) {
				var msg = Util.parseFailResponse(data);
				message.message(msg);
				spanServerStatus.text(BACNET_SERVER_STOP);
				buttonApduStart.data("kendoButton").enable(false);
				buttonApduStop.data("kendoButton").enable(true); //stop버튼 활성화(서버 실행 상태)
				inputServerObjectId.prop("disabled", true); //Object ID 입력창 비활성화
			}).always(function() {
				message.open();
				Loading.close();
			});
		});

		//Stop Button
		buttonApduStop.on("click", function() {
			Loading.open();
			$.ajax({
				url: BacNetUrlServer + "stop",
				method: "PUT"
			}).done(function() {
				//message.message(BACNET_MESSAGE_SERVER_STOP);
				message.message(BACNET_SERVER_STOP);
				spanServerStatus.text(BACNET_SERVER_STOP);
				//서버 설정 상태 결정
				applyStateOfServerConfig(false);
			}).fail(function(data) {
				var msg = Util.parseFailResponse(data);
				message.message(msg);
				spanServerStatus.text(BACNET_SERVER_STOP);
				buttonApduStart.data("kendoButton").enable(true);
				buttonApduStop.data("kendoButton").enable(false); //Stop버튼 비활성화(서버 정지상태)
				inputServerObjectId.prop("disabled", false); //Object ID 입력창 활성화
			}).always(function() {
				message.open();
				Loading.close();
			});
		});

		//Numeric Spin Button
		divApdu.on("click", ".k-numerictextbox .control-custom-box .k-link", function() {
			var target = $(this);
			var wrapper = target.closest(".k-numeric-wrap");
			var inputDisplayedTarget = wrapper.find("input.bacnet-apdu-numeric-box.k-formatted-value");
			var inputTotalTargets = $(this).closest(".detail").find("input.common-validator");
			var inputTargetValue = "";
			var isValid = true;
			var inputObjectIdValidate = true;
			var inputObjectIdValue = inputServerObjectId.val();

			if(target.hasClass('k-state-disabled') || wrapper.hasClass('k-state-disabled')){
				return;
			}

			inputDisplayedTarget.blur();
			inputTotalTargets.each(function(index, element) {
				inputTargetValue = $(element).val();
				if (inputTargetValue != "") {
					var validate = $(element).data("kendoCommonValidator").validate();
					if (!validate) {
						isValid = false;

					}
				} else {
					isValid = false;

				}
			});

			if (isValid) {
				if (inputObjectIdValue != "") {
					inputObjectIdValidate = inputServerObjectId.data("kendoCommonValidator").validate();
					if (inputObjectIdValidate)
						buttonApduStart.data("kendoButton").enable(true);
					else
						buttonApduStart.data("kendoButton").enable(false);
				} else {
					buttonApduStart.data("kendoButton").enable(false);
				}
			} else {
				buttonApduStart.data("kendoButton").enable(false);
			}

		});

		//Input Keyup
		inputServerObjectId.on("keyup", function(e) {
			var isManagePointsBtnValid = inputServerObjectId.data("kendoCommonValidator").validate();
			var inputObjectIdValue = $(this).val();
			var inputNumericBoxes = divApdu.find("input.bacnet-apdu-numeric-box.common-validator");
			var isNumericBoxesValid = true;

			inputNumericBoxes.each(function(index, element) {
				var value = $(element).data("kendoCustomNumericBox").value();
				var validate = true;

				if (value !== null) {
					validate = $(element).data("kendoCommonValidator").validate();
					if (!validate) {
						isNumericBoxesValid = false;

					}
				} else {
					isNumericBoxesValid = false;

				}
			});

			//Start Button
			if (isNumericBoxesValid && isManagePointsBtnValid && inputObjectIdValue != "") {
				buttonApduStart.data("kendoButton").enable(true);
			} else {
				buttonApduStart.data("kendoButton").enable(false);
			}

			//Manage Point Button
			if (isManagePointsBtnValid && inputObjectIdValue != "") {
				buttonManagePoint.data("kendoButton").enable(true);
			} else {
				buttonManagePoint.data("kendoButton").enable(false);
			}
		});

		//Input Focusout
		inputServerObjectId.on('focusout', function(e){
			var target = $(this);
			var val = target.val();
			var isManagePointsBtnValid = null;
			var inputNumericBoxes = divApdu.find("input.bacnet-apdu-numeric-box.common-validator");
			var isNumericBoxesValid = true;

			if(val < 0){
				target.val(0);
			}else if(val > 4194303){
				target.val(4194303);
			}
			isManagePointsBtnValid = target.data("kendoCommonValidator").validate();
			inputNumericBoxes.each(function(index, element) {
				var value = $(element).data("kendoCustomNumericBox").value();
				var validate = true;

				if (value !== null) {
					validate = $(element).data("kendoCommonValidator").validate();
					if (!validate) {
						isNumericBoxesValid = false;

					}
				} else {
					isNumericBoxesValid = false;

				}
			});

			//Start Button
			if (isNumericBoxesValid && isManagePointsBtnValid && val != "") {
				buttonApduStart.data("kendoButton").enable(true);
			} else {
				buttonApduStart.data("kendoButton").enable(false);
			}

			//Manage Point Button
			if (isManagePointsBtnValid && val != "") {
				buttonManagePoint.data("kendoButton").enable(true);
			} else {
				buttonManagePoint.data("kendoButton").enable(false);
			}
		});

		//Numeric Box Keyup Event
		divApdu.on("keyup", "input.bacnet-apdu-numeric-box", function(e) {
			var target = $(this);
			var isValid = true,
				inputValue = "";
			var inputTargets = $(this).closest(".detail").find("input.common-validator");
			var inputObjectIdValidate = true;
			var inputObjectIdValue = inputServerObjectId.val();
			var val = $(this).val();
			var numeric = $(this).data('kendoCustomNumericBox'),
				min = numeric.min(),
				max = numeric.max(),
				incBtn = numeric.wrapper.find('.k-link.k-link-increase'),
				decBtn = numeric.wrapper.find('.k-link.k-link-decrease');
			var shiftKey = e.shiftKey;
			var cursorStartIndex = target[0].selectionStart,
				cursorEndIndex = target[0].selectionEnd;

			inputTargets.each(function(index, element) {
				inputValue = $(element).val();
				if (inputValue != "") {
					var validate = $(element).data("kendoCommonValidator").validate();
					if (!validate) {
						isValid = false;

					}
				} else {
					isValid = false;

				}
			});

			if (isValid) {
				if (inputObjectIdValue != "") {
					inputObjectIdValidate = inputServerObjectId.data("kendoCommonValidator").validate();
					if (inputObjectIdValidate)
						buttonApduStart.data("kendoButton").enable(true);
					else
						buttonApduStart.data("kendoButton").enable(false);
				} else {
					buttonApduStart.data("kendoButton").enable(false);
				}
			} else {
				buttonApduStart.data("kendoButton").enable(false);
			}

			// Spin button
			if (!shiftKey && (Number(val[0]) !== 0) && val < max && val > min) {
				incBtn.removeClass('k-state-disabled');
				decBtn.removeClass('k-state-disabled');
				$(this).focusout();
			}
			if (Number(val) <= min) {
				incBtn.removeClass('k-state-disabled');
				decBtn.addClass('k-state-disabled');
			}
			if (Number(val) >= max) {
				incBtn.addClass('k-state-disabled');
				decBtn.removeClass('k-state-disabled');
			}

			numeric.focus();
			setCursorPosition(target, cursorStartIndex, cursorEndIndex);
		});

		//Numeric Box Focusout Event
		divApdu.on('focusout', 'input.bacnet-apdu-numeric-box[data-role=customnumericbox]', function(e){
			var target = $(this);
			var numeric = target.data('kendoCustomNumericBox');
			var min = numeric.min();
			var max = numeric.max();
			var value = target.val();
			var inputObjectIdValidate = inputServerObjectId.data('kendoCommonValidator').validate();
			var isNumericBoxesValid = true;
			var inputNumericBoxes = divApdu.find("input.bacnet-apdu-numeric-box.common-validator");
			var isEmptyValue = (value == '' || value === null);

			inputNumericBoxes.each(function(index, element) {
				var val = $(element).data("kendoCustomNumericBox").value();
				var validate = true;

				if (val !== null) {
					validate = $(element).data("kendoCommonValidator").validate();
					if (!validate) {
						isNumericBoxesValid = false;

					}
				} else {
					isNumericBoxesValid = false;

				}
			});

			//Start Button
			if (isEmptyValue || !inputObjectIdValidate || !isNumericBoxesValid) {
				buttonApduStart.data("kendoButton").enable(false);
			} else {
				buttonApduStart.data("kendoButton").enable(true);
			}

			numeric.enable(false);
			numeric.enable(true);
			numeric.min(min);
			numeric.max(max);
			if(value == ""){
				value = min;
			}
			numeric.value(value);
		});

		//Manage Points
		buttonManagePoint.on("click", function() {
			getChangedRowUidArr = [];
			openServerPopup(popupServerElem);
		});

		//Delete Button
		buttonPoinstListDelete.on("click", function() {
			var ds = pointListGrid.dataSource;
			var list = $.extend(true, [], ds._pristineData), max = list.length, item = null, i = 0;

			for(i = max - 1; i >= 0; i--){
				item = list[i];
				if(item.checked){
					list.splice(i, 1);
				}
			}

			pointListDataSource = new kendo.data.DataSource({
				data: list,
				pageSize: 30
			});
			pointListDataSource.read();
			pointListGrid.setDataSource(pointListDataSource);

			// selectedPointList = [];
			checkSelectedPointList();
		});
	};

	/**
	 *
	 *   서버 탭의 BACnet 포인트 관리 팝업을 초기화 한다.
	 *
	 *   @function initServerPopup
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Server 팝업 초기화
	var initServerPopup = function() {
		//팝업창
		popupServerElem.kendoPopupSingleWindow({
			title: I18N.prop("BACNET_MANAGE_POINTS"),
			width: 1650,
			height: 800
		});

		//그리드
		popupServerGrid = popupServerGridElem.kendoGrid({
			dataSource: [],
			columnDropDownList : true,
			columns: setServerPopupGridColumns(),
			height: 650,
			scrollable: {
				virtual: true
			},
			hasCheckedModel: true,
			setCheckedAttribute: true
		}).data("kendoGrid");
		var checkedFieldTitle = '<span style="position: absolute; top: 10px; left: 35px;">' + I18N.prop("BACNET_SHOW") + '</span>';
		popupServerGridElem.find('[role=columnheader][data-field=checked]').append(checkedFieldTitle);

		popupServerGridVirtualScroll = getGridVirtualScroller(popupServerGrid);
	};

	// 특정 그리드 위젯의 virtualscrollable 인스턴스를 반환한다.
	var getGridVirtualScroller = function (gridWidget) {
		var wrapper = gridWidget.wrapper;
		var vs = wrapper.find('.k-grid-content').data('kendoVirtualScrollable');
		if (!vs) vs = null;
		return vs;
	};

	/**
	 *
	 *   서버 탭의 BACnet 포인트 리스트 그리드 내의 UI 요소에 이벤트를 등록한다.
	 *
	 *   @function attachEvtServerGrid
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Server 탭 그리드 이벤트 등록
	var attachEvtServerGrid = function() {
		pointListGrid.bind('checked', function(){
			console.info("DATABOUND::");
			checkSelectedPointList();
		});
	};

	/**
	 *
	 *   서버 탭의 BACnet 포인트 관리 팝업창 내 UI 요소에 이벤트를 등록한다.
	 *
	 *   @function attachServerPopupEvent
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Server 팝업 내부 이벤트 등록
	var attachServerPopupEvent = function() {
		//Save Button
		popupServerElem.on("click", "button[data-event=save]", function() {
			var testArr = [];
			var dataSource = popupServerGrid.dataSource, item = null, deviceTypeDisplayText;
			var i, max = dataSource.data().length;

			// 기기타입이 AI, AO인 경우, 단위가 선택되지 않은 상태에서 저장 시, 스크롤을 이동하고 저장을 실행하지 않는다.
			var itemHasNoRequiredUnitIndex = getItemNoRequiredUnit(dataSource);
			if (itemHasNoRequiredUnitIndex !== false) {
				if (popupServerGridVirtualScroll) {
					itemHasNoRequiredUnitIndex = itemHasNoRequiredUnitIndex - 1;
					if (itemHasNoRequiredUnitIndex < 0) itemHasNoRequiredUnitIndex = 0;
					popupServerGridVirtualScroll.verticalScrollbar.scrollTop(itemHasNoRequiredUnitIndex * POPUP_SERVER_GRID_ROW_HEIGHT);
					return;
				}
			}

			for (i = 0; i < max; i++) {
				item = dataSource.data()[i];
				if(item.checked){
					item.hasInstanceNumber = true;
					if(item.calcInstanceNumber === null){
						deviceTypeDisplayText = displayNameInBACnet.bacNetServerPopupGridDeviceType[item.type].text;
						item.calcInstanceNumber = calcInstanceNumber(Number(item.instanceNumber), Number(deviceTypeNumberForBACnetDeviceId[deviceTypeDisplayText])).result;
					}
					testArr.push(item);
				}
			}

			//변경된 Row 저장 배열 초기화
			getChangedRowUidArr = [];

			//Save 버튼 DIMMED
			$(this).data("kendoButton").enable(false);
			isPopupGridSaved = true;

			pointListDataSource = new kendo.data.DataSource({
				data: testArr,
				pageSize: 30
			});
			pointListDataSource.read();
			pointListGrid.setDataSource(pointListDataSource);

			// 메인 그리드 반영 시 checkbox 전체 해제
			pointListGrid.uncheckAll();
			checkSelectedPointList();
		});

		//Close X Ico
		popupServerElem.closest(".popup-window").on("click", "span.pop-window-btn-close", function() {
			if (!isPopupGridSaved) {
				popupServerGridDataSource.cancelChanges();
			}
		});

		//Close Button
		popupServerElem.on("click", "button[data-event=close]", function(e) {
			if (!isPopupGridSaved) {
				popupServerGridDataSource.cancelChanges();
			} else {
				// Loading.open();
				// $.ajax({
				// 	url: BacNetUrlServer + "stop",
				// 	method: "PUT"
				// }).done(function() {
				// 	//message.message(BACNET_MESSAGE_SERVER_STOP);
				// 	message.message(BACNET_SERVER_STOP);
				// 	spanServerStatus.text(BACNET_SERVER_STOP);
				// 	//서버 설정 상태 결정
				// 	applyStateOfServerConfig(false);
				// }).fail(function() {
				// 	message.message(BACNET_SERVER_STOP);
				// }).always(function() {
				// 	message.open();
				// 	Loading.close();
				// });
			}
		});
	};

	/**
	 *
	 *   서버 탭의 BACnet 포인트 관리 팝업창 내의 그리드 내부 UI 요소에 이벤트를 등록한다.
	 *
	 *   @function attachServerPopupGridEvent
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Server 팝업 내부 그리드 이벤트 등록
	var attachServerPopupGridEvent = function() {
		// var saveBtn = popupServerElem.find("button[data-event=save]").data("kendoButton");
		//Checkbox- Priority Array
		popupServerGridElem.on("click", "[data-field=priorities] .k-checkbox", function() {
			var self = $(this);
			var targetRow = self.closest("tr");
			var dataUid = targetRow.attr('data-uid');
			var dataSourceItem = popupServerGridDataSource.getByUid(dataUid);
			var ulPriorities = self.closest("ul");
			var priorityArr = dataSourceItem.get("priorities");
			var liPriority = ulPriorities.find("li");
			var liIndex = liPriority.index(self.closest("li"));
			// var dataSourceItem = popupServerGridDataSource.at(dataIndex);
			// var totalTr = popupServerGrid.tbody.find("tr");
			// var dataIndex = totalTr.index(targetRow);

			if (self.prop("checked")) {
				priorityArr[liIndex] = 1;
				//self.attr("data-value", true);
			} else {
				priorityArr[liIndex] = 0;
				//self.attr("data-value", false);
			}

			// checkChangedRow(targetRow);
			setStateSaveBtn();
			dataSourceItem.priorities = priorityArr;
		});

		//Checkbox - show(checked)
		popupServerGrid.bind('checked', function(e){
			var dataSourceItem = e.item;
			var isChecked = null;

			if(dataSourceItem){
				isChecked = dataSourceItem.checked;
				dataSourceItem.show = isChecked;
				highlightUnitDropDownList(dataSourceItem);
			}
			setStateSaveBtn();
		});

		//Checkbox - writable
		popupServerGridElem.on("click", "input[data-field=writable]", function() {
			var self = $(this);
			var targetRow = self.closest("tr");
			var dataUid = targetRow.attr('data-uid');
			var dataSourceItem = popupServerGridDataSource.getByUid(dataUid);
			// var totalTr = popupServerGrid.tbody.find("tr");
			// var dataIndex = totalTr.index(targetRow);
			// var dataSourceItem = popupServerGridDataSource.at(dataIndex);

			// checkChangedRow(targetRow);
			setStateSaveBtn();
			if (self.prop("checked")) {
				//dataSourceItem.set("show", true);
				dataSourceItem.writable = true;
			} else {
				//dataSourceItem.set("show", false);
				dataSourceItem.writable = false;
			}
		});

		//input - BAC Net Instance Number
		popupServerGridElem.on("keyup", "input[data-field=instanceNumber]", function() {
			var self = $(this);
			var targetRow = self.closest("tr");
			var dataUid = targetRow.attr('data-uid');
			var dataSourceItem = popupServerGridDataSource.getByUid(dataUid);

			//현재 Input
			var deviceType = targetRow.find(".sac-bacnet-pointlist-grid-cell[data-field=type]").attr("data-value");
			var deviceNumber = deviceTypeNumberForBACnetDeviceId[deviceType]; //기기타입에 할당된 숫자
			var currentVal = self.val(); //입력된 숫자
			var currentBacNetInstanceNumber = calcInstanceNumber(Number(currentVal), Number(deviceNumber)).result; //기기타입과 입력한 수의 조합

			var compareValues, staticValue, insNumValidator = null;
			var isActive = true,
				isValid = true, isActiveValue = true, isValidValue = true;
			var i = 0, item = null, list = popupServerGridDataSource.data(), max = list.length;

			message.message(BACNET_MESSAGE_CANNOT_USE_SAME_INSTANCE_NUMBER);

			dataSourceItem.instanceNumber = currentVal;
			for (i = 0; i < max; i++) {
				item = list[i];
				staticValue = Number(currentBacNetInstanceNumber);
				compareValues = item.calcInstanceNumber;
				insNumValidator = item.insNumValidator;

				// 동일한 계산된 인스턴스번호가 있는지 체크
				if (item.uid != dataUid) {
					if (compareValues == staticValue) {
						message.open();
						isActiveValue = false;
					}
				}

				// 값 유효성 체크
				if(insNumValidator && (!insNumValidator.validate())){
					isValidValue = false;
				}
			}

			// 저장 가능한 상태인지 판변
			if (isValid && isActiveValue && isValidValue) {
				// dataSourceItem.instanceNumber = staticValue;
				dataSourceItem.calcInstanceNumber = staticValue;
				isActive = true;
			} else {
				isActive = false;
			}
			popupServerElem.find("button[data-event=save]").data("kendoButton").enable(isActive);
		});

		//Popup Server 그리드 Databound callback
		popupServerGrid.bind("dataBound", function() {
			//BACnet 인스턴스 번호 예외처리
			var i = 0;
			var ds = popupServerGrid.dataSource;
			var elem, targetRow, dataItem = null;
			var inputBacNetInstanceNumber = popupServerGridElem.find(".sac-bacnet-pointlist-grid-cell[data-field=instanceNumber]");
			for (i = 0; i < inputBacNetInstanceNumber.length; i++) {
				elem = inputBacNetInstanceNumber.eq(i);
				targetRow = elem.closest('tr');
				dataItem = ds.getByUid(targetRow.attr('data-uid'));
				dataItem.tr = targetRow;
				dataItem.insNumValidator = elem.kendoCommonValidator({
					type: "onlyNumber",
					minLength: 1,
					maxLength: 7,
					rules: {
						maxNumber: function(input) {
							var value = input.val();
							var num = Number(value);
							return !(num > 4194303);
						},
						minNumber: function(input) {
							var value = input.val();
							var num = Number(value);
							if (num < 0 || num == 0) {
								return false;
							}
							return true;
						}
					},
					messages: {
						maxNumber: I18N.prop("COMMON_INVALID_VALUE"),
						minNumber: I18N.prop("COMMON_INVALID_VALUE")
						//matchDeviceType: I18N.prop("COMMON_INVALID_VALUE")
					}
				}).data('kendoCommonValidator');
				dataItem.insNumValidator.validate();
				highlightUnitDropDownList(dataItem);
			}
		});
	};


	/*
	 *  BACnet > Server Functions
	 */

	/**
	 *
	 *   서버 탭의 메인 윈도우 그리드 컬럼을 세팅한다.
	 *
	 *   @function setServerGridColumns
	 *   @returns {Array} - 컬럼을 구성하는 배열
	 *   @alias module:BACnet-sac
	 *
	 */
	//Server 메인 윈도우 그리드 컬럼 세팅
	function setServerGridColumns() {
		//BacNetObjectModel - show, type, dms_devices_controlPoint_tagName, dms_devices_mappedType, dms_devices_controlPoint_value, instanceNumber, unit, writable ,priorities
		var columns = [];
		var pointListGridDefinition = [/*{
			field: "checkbox",
			title: "",
			sortable: false
		},*/
			{
				field: "type",
				title: I18N.prop("SETTINGS_DEVICE_TYPE"),
				sortable: false
			},
			{
				//field: "dms_devices_controlPoint_tagName",
				field: "name",
				title: I18N.prop("BACNET_DEVICE_NAME"),
				sortable: false
			},
			{
				// field: "instanceNumber",
				field: "calcInstanceNumber",
				title: I18N.prop("BACNET_DEVICE_ID"),
				sortable: false
			},
			{
				field: "writable",
				title: I18N.prop("BACNET_READ_WRITE"),
				sortable: false
			},
			{
				field: "dms_devices_controlPoint_value",
				title: I18N.prop("BACNET_PRESENT_VALUE"),
				sortable: false
			},
			{
				field: "priorities",
				title: I18N.prop("BACNET_PRIORITY_ARRAY"),
				sortable: false
			}
		];

		$.each(pointListGridDefinition, function(idx, item) {
			if (item.field == "checkbox") {
				columns.push({
					headerTemplate: "<input type='checkbox' class='k-checkbox' data-event='devicecheckall' id='bacnet-point-list-check-all'>" +
						"<label class='k-checkbox-label' for='bacnet-point-list-check-all'></label>",
					template: function(data) {
						var result = "<input type='checkbox' data-event='devicecheck' class='k-checkbox' id='bacnet-point-list-check-" + data.dms_devices_id + "'/>" +
							"<label class='k-checkbox-label' for='bacnet-point-list-check-" + data.dms_devices_id + "'></label>";
						return result;
					},
					width: 100,
					sortable: item.sortable
				});
			} else {
				columns.push({
					field: item.field,
					title: item.title,
					template: function(dataItem) {
						return createListTmpl(dataItem, item);
					},
					sortable: item.sortable
				});
			}
		});
		//Define List Template
		function createListTmpl(dataItem, item) {
			var value;

			//XSS 필터 적용
			dataItem[item.field] = Util.getValueFilteredForXSS(dataItem[item.field]);
			value = dataItem[item.field];

			if(typeof value != 'undefined' && value !== null){
				if (item.field == "priorities") {
					if (dataItem[item.field].length > 0) {
						value = "";
						var isStart = false;
						for (var idx = 0; idx < dataItem[item.field].length; idx++) {
							if (dataItem[item.field][idx] == 1) {
								if (!isStart) {
									value += String(idx + 1);
									isStart = true;
								} else {
									value += "," + String(idx + 1);
								}
							}
						}
						if (!isStart)
							value = "-";
					} else {
						value = "-";
					}
				} else if (item.field == "type") {
					value = displayNameInBACnet.bacNetServerPopupGridDeviceType[value].text;
				// } else if (item.field == "instanceNumber") {
				} else if (item.field == "calcInstanceNumber") {
					//value = parseInt(value, 2);
					var num = parseInt(getGroupOfBitValue(value).value22Bit, 2);
					var deviceNum = parseInt(getGroupOfBitValue(value).value10Bit, 2);
					var deviceType;
					for (var key in deviceTypeNumberForBACnetDeviceId) {
						if (deviceTypeNumberForBACnetDeviceId[key] == deviceNum) {
							deviceType = key;
							break;
						}
					}
					value = deviceType + "" + num;
				} else if (item.field == "dms_devices_controlPoint_value") {
					value = value.toFixed(1);
				} else if (item.field == "writable") {
					if (value == true || value == "true") {
						// value = "true";
						value = I18N.prop('BACNET_WRITABLE_WRITE');
					} else {
						// value = "false";
						value = I18N.prop('BACNET_WRITABLE_READ');
					}
				} else if (item.field == "dms_devices_controlPoint_value") {
					if (dataItem[item.field] == 0.0) {
						value = dataItem[item.field].toFixed(1);
					}
				}
			} else {
				value = '-';
			}

			return "<span class='sac-bacnet-point-grid-" + item.field + "'>" + value + "</span>";
		}
		return columns;
	}

	/**
	 *   서버 탭의 포인트 관리 팝업창 내의 그리드 컬럼을 세팅한다.
	 *
	 *   @function setServerPopupGridColumns
	 *   @returns {Array} - 컬럼을 구성하는 배열
	 *   @alias module:BACnet-sac
	 */
	//Server 팝업창 그리드 컬럼 세팅
	function setServerPopupGridColumns() {
		//BacNetObjectModel - show, type, dms_devices_controlPoint_tagName, dms_devices_mappedType, dms_devices_controlPoint_value, instanceNumber, unit, writable ,priorities
		var columns = [];
		var pointsListPopupGridDefinition = [
			// {
			// 	field: "show",
			// 	title: I18N.prop("BACNET_SHOW"),
			// 	sortable: false,
			// 	type: "singlecheckbox",
			// 	width: "5%"
			// },
			{
				field: "type",
				title: I18N.prop("SETTINGS_DEVICE_TYPE"),
				sortable: false,
				type: "string",
				width: ""
			},
			{
				//field: "dms_devices_controlPoint_tagName",
				field: "name",
				title: I18N.prop("BACNET_DEVICE_NAME"),
				sortable: false,
				type: "string",
				width: ""
			},
			{
				field: "dms_devices_mappedType",
				title: I18N.prop("BACNET_PROPERTY"),
				sortable: false,
				type: "string",
				width: ""
			},
			{
				field: "dms_devices_controlPoint_value",
				title: I18N.prop("BACNET_VALUE"),
				sortable: false,
				type: "string",
				width: "5%"
			},
			{
				field: "instanceNumber",
				title: I18N.prop("BACNET_INSTANCE_NUMBER"),
				sortable: false,
				type: "input",
				width: ""
			},
			{
				field: "unit",
				title: I18N.prop("BACNET_UNIT"),
				sortable: false,
				type: "dropdownlist",
				width: "8%",
				dropDownOptions: {
					dataValueField: 'value',
					dataTextField: 'text',
					dataSource: dataSourceForDDLInPopupClient.managePoint_unit.data(),
					change: function(e) {
						e.item.unit = e.value;
						highlightUnitDropDownList(e.item);
						setStateSaveBtn();
						// checkChangedRow(targetRow);
					},
					dropDownListCss: 'common-grid-dropdownlist-control-point-management'
				}
			},
			{
				field: "writable",
				title: I18N.prop("BACNET_WRITABLE"),
				sortable: false,
				type: "singlecheckbox",
				width: "5%"
			},
			{
				field: "priorities",
				title: I18N.prop("BACNET_PRIORITY_ARRAY"),
				sortable: false,
				type: "multiplecheckbox",
				width: "30%"
			}
		];

		$.each(pointsListPopupGridDefinition, function(idx, item) {
			columns.push({
				field: item.field,
				title: item.title,
				template: function(dataItem) {
					return createListTmpl(dataItem, item);
				},
				width: item.width,
				sortable: item.sortable,
				dropDownOptions: item.dropDownOptions ? item.dropDownOptions : null
			});
		});

		function createListTmpl(dataItem, item) {
			var fieldName, type, value, result, dataValue, prioritiesArr = [];
			// var objectId = Number(inputServerObjectId.val());

			//XSS 필터 적용
			if (item.type == "string") {
				dataItem[item.field] = Util.getValueFilteredForXSS(dataItem[item.field]);
			}

			fieldName = item.field;
			type = item.type;
			dataValue = dataItem[item.field];

			if (dataValue == "" || dataValue === null || typeof dataValue == 'undefined' || dataValue == "None") {
				if (dataValue == 0 || dataValue == 0.0) {
					value = dataValue;
				} else {
					value = "-";
				}
			} else {
				value = dataValue;
			}

			if (type == "singlecheckbox") {
				var checkedFlag = false;
				//value 체크
				if (value == 0 || value == false) {
					checkedFlag = false;
				} else {
					checkedFlag = true;
				}

				if (checkedFlag) {
					result = "<input type='checkbox' class='k-checkbox' data-value='" + checkedFlag + "' data-type='" + type + "' data-field='" + fieldName + "' data-event='" + fieldName + "check' id='bacnet-popup-pointlist-check-" + fieldName + "-" + dataItem.dms_devices_id + "' checked/>" +
						"<label class='k-checkbox-label' for='bacnet-popup-pointlist-check-" + fieldName + "-" + dataItem.dms_devices_id + "'></label>";
				} else {
					result = "<input type='checkbox' class='k-checkbox' data-value='" + checkedFlag + "' data-type='" + type + "' data-field='" + fieldName + "' data-event='" + fieldName + "check' id='bacnet-popup-pointlist-check-" + fieldName + "-" + dataItem.dms_devices_id + "'/>" +
						"<label class='k-checkbox-label' for='bacnet-popup-pointlist-check-" + fieldName + "-" + dataItem.dms_devices_id + "'></label>";
				}

				if (fieldName == "writable") {
					if (dataItem["type"] == "ControlPoint.AI" || dataItem["type"] == "ControlPoint.DI") {
						result = "<span data-value='" + checkedFlag + "' data-type='" + type + "' data-field='" + fieldName + "' data-event='" + fieldName + "check' id='bacnet-popup-pointlist-check-" + fieldName + "-" + dataItem.dms_devices_id + "'>-</span>";
					}
				}
			} else if (type == "dropdownlist") {
				if (fieldName == "unit") {
					if (dataItem.type == "ControlPoint.DO" || dataItem.type == "ControlPoint.DI") {
						result = "<span class='sac-bacnet-pointlist-grid-cell' data-field='" + fieldName + "' data-type='string' data-value='" + value + "'>" + value + "</span>";
					} else {
						// result = "<input class='sac-bacnet-pointlist-grid-cell' data-field='" + fieldName + "' data-type='dropdownlist' data-value='" + value + "'/>";
						var container = $('<div/>');
						var textValue = null;
						if(value == '-' || !value){
							value = dataSourceForDDLInPopupClient.managePoint_unit.data()[0].value;
							textValue = dataSourceForDDLInPopupClient.managePoint_unit.data()[0].text;
						}else{
							textValue = dataSourceForDDLInPopupClient.managePoint_unit.textValue[value];
						}
						$(dropDownListTemplate({ value : value, text : textValue, disabled : false, field : "unit"}))
							.appendTo(container);
						result = container.html();
					}
				}
			} else if (type == "multiplecheckbox") {
				if (fieldName == "priorities") {
					prioritiesArr = value;
					if(prioritiesArr == '-'){
						prioritiesArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
					}
					var lisTmpl = "";
					for (var i = 0; i < prioritiesArr.length; i++) {
						var curVal = prioritiesArr[i];
						var li = "";
						var isChecked = false;

						if (curVal == 1)
							isChecked = true;

						if (isChecked) {
							if (dataItem.type == "ControlPoint.DI" || dataItem.type == "ControlPoint.AI") {
								li = "<li><input type='checkbox' class='k-checkbox' data-value='" + isChecked + "' data-index='" + i + "'" +
									"data-event='" + fieldName + "check' id='bacnet-popup-pointlist-check-" + dataItem.dms_devices_id + "-" + i + "' checked disabled/>" +
									"<label class='k-checkbox-label' for='bacnet-popup-pointlist-check-" + dataItem.dms_devices_id + "-" + i + "'>" + (i + 1) + "</label>" +
									"</li>";
								// li = '';
							} else {
								li = "<li><input type='checkbox' class='k-checkbox' data-value='" + isChecked + "' data-index='" + i + "'" +
									"data-event='" + fieldName + "check' id='bacnet-popup-pointlist-check-" + dataItem.dms_devices_id + "-" + i + "' checked/>" +
									"<label class='k-checkbox-label' for='bacnet-popup-pointlist-check-" + dataItem.dms_devices_id + "-" + i + "'>" + (i + 1) + "</label>" +
									"</li>";
							}
						} else if (dataItem.type == "ControlPoint.DI" || dataItem.type == "ControlPoint.AI") {
							li = "<li><input type='checkbox' class='k-checkbox' data-value='" + isChecked + "' data-index='" + i + "'" +
								"data-event='" + fieldName + "check' id='bacnet-popup-pointlist-check-" + dataItem.dms_devices_id + "-" + i + "' disabled/>" +
								"<label class='k-checkbox-label' for='bacnet-popup-pointlist-check-" + dataItem.dms_devices_id + "-" + i + "'>" + (i + 1) + "</label>" +
								"</li>";
							// li = '';
						} else {
							li = "<li><input type='checkbox' class='k-checkbox' data-value='" + isChecked + "' data-index='" + i + "'" +
								"data-event='" + fieldName + "check' id='bacnet-popup-pointlist-check-" + dataItem.dms_devices_id + "-" + i + "'/>" +
								"<label class='k-checkbox-label' for='bacnet-popup-pointlist-check-" + dataItem.dms_devices_id + "-" + i + "'>" + (i + 1) + "</label>" +
								"</li>";
						}
						lisTmpl += li;
					}
					result = "<ul class='sac-bacnet-pointlist-grid-cell' data-field='" + fieldName + "'>" + lisTmpl + "</ul>";
				}
			} else if (type == "string") {
				if (fieldName == "type") {
					value = displayNameInBACnet.bacNetServerPopupGridDeviceType[value].text;
				} else if (fieldName == "dms_devices_mappedType") {
					value = displayNameInBACnet.bacNetMappedType[value];
				} else if (fieldName == "dms_devices_controlPoint_value") {
					if (value != "-") {
						value = value.toFixed(1);
					}
				}
				result = "<span class='sac-bacnet-pointlist-grid-cell' data-field='" + fieldName + "' data-type='string' data-value='" + value + "'>" + value + "</span>";
			} else if (type == "input") {
				if (item.field == "instanceNumber") {
					//value = parseInt(calcInstanceNumber(objectId, value).value10Bit, 2);
					value = value;
					if (dataItem.hasInstanceNumber) {
						result = "<input type='text' class='k-input sac-bacnet-pointlist-grid-cell' value='" + value + "'data-field='" + fieldName + "' data-type='input' data-value='" + value + "' required hasinstancenumber>";
					} else {
						result = "<input type='text' class='k-input sac-bacnet-pointlist-grid-cell' value='" + value + "'data-field='" + fieldName + "' data-type='input' data-value='" + value + "' required>";
					}
				} else {
					result = "<input type='text' class='k-input sac-bacnet-pointlist-grid-cell' data-field='" + fieldName + "' data-type='input' data-value='" + value + "'>";
				}
			}
			return result;
		}
		return columns;
	}

	/**
	 *   서버 탭의 포인트 리스트의 선택 상황을 체크하여 버튼의 Status를 정한다.
	 *
	 *   @function checkSelectedPointList
	 *   @returns {void} - 리턴 값 없음
	 *   @alias module:BACnet-sac
	 */
	//Server PointListGrid 선택 체크
	function checkSelectedPointList() {
		// var count = selectedPointList.length;
		var count = pointListGrid.getCheckedData();
		if (count == 0) {
			buttonPoinstListDelete.data("kendoButton").enable(false);
			// pointListGridElem.find("input[data-event=devicecheckall]").prop("checked", false);
			// pointListGridElem.find("input[data-event=devicecheck]").prop("checked", false);
		} else {
			// if (count < pointListDataSource.data().length) {
			// 	pointListGridElem.find("input[data-event=devicecheckall]").prop("checked", false);
			// }
			buttonPoinstListDelete.data("kendoButton").enable(true);
		}
	}

	/**
	 *   서버로부터 기기 리스트를 요청하여 바인딩하고 포인트 관리 팝업창을 오픈한다.
	 *
	 *   @function openServerPopup
	 *   @returns {void} - 리턴 값 없음
	 *   @alias module:BACnet-sac
	 */
	//Server 팝업 오픈 - 팝업창의 Instance Number는 Object Type을 의미하는 10bit 값을 10진수로 보여준다.
	function openServerPopup(popupWindowElem) {
		var popupWindow = popupWindowElem.data("kendoPopupSingleWindow");

		//팝업창 open, 버튼 DIMMED
		popupWindow.openWindowPopup();
		popupWindowElem.find("button[data-event=save]").data("kendoButton").enable(false);
		isPopupGridSaved = false;

		//Data request
		Loading.open(popupWindowElem);
		$.ajax({
			url: "/dms/devices?types=ControlPoint.A*,ControlPoint.D*&attributes=id,type,name,mappedType,controlPoint-origin,controlPoint-tagName,controlPoint-value"
		}).done(function(data) {
			var i;
			for (i = data.length - 1; i >= 0; i--) {
				var item = data[i];
				if (item.controlPoint && item.controlPoint.origin == "BACnet") {
					data.splice(i, 1);
				}
			}

			dataSourceFromDms = new kendo.data.DataSource({
				data: data
			});
			dataSourceFromDms.read();

			//popupServerGridDataSource - 기존 Popup Server DS
			//dataFromDms - 새로 받아온 DMS 데이터
			//dataFromBacNet - 서버의 기존 BAC net 데이터
			var dataFromDms = dataSourceFromDms.data(); //서버로부터 응답받은 기기 데이터
			var dataFromBacNet = pointListDataSource.data(); //메인 화면 그리드 - show, checked: true
			var dmsItem, bacNetItem;
			var dataArr = [];

			for (i = 0; i < dataFromDms.length; i++) {
				//BacNetObjectModel - show, type, dms_devices_controlPoint_tagName, dms_devices_mappedType, dms_devices_controlPoint_value, instanceNumber, unit, writable ,priorities
				var BacNetObj = new BacNetObjectModel();
				dmsItem = dataFromDms[i];

				if (dmsItem.type == 'ControlPoint.AI' || dmsItem.type == 'ControlPoint.DI'){
					BacNetObj.priorities = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
				}

				BacNetObj.dms_devices_id = dmsItem.id ? dmsItem.id : null;
				BacNetObj.type = dmsItem.type ? dmsItem.type : null;
				BacNetObj.dms_devices_mappedType = dmsItem.mappedType ? dmsItem.mappedType : null;
				BacNetObj.name = dmsItem.name ? dmsItem.name : null;
				BacNetObj.hasNoRequiredUnit = false;

				if (dmsItem.controlPoint) {
					BacNetObj.dms_devices_controlPoint_tagName = dmsItem.controlPoint.tagName ? dmsItem.controlPoint.tagName : null;
					if (BacNetObj.dms_devices_controlPoint_tagName === null) {
						BacNetObj.dms_devices_controlPoint_tagName = dmsItem.name;
					}
					if (dmsItem.controlPoint.value) {
						BacNetObj.dms_devices_controlPoint_value = dmsItem.controlPoint.value;
					} else if (dmsItem.controlPoint.value == 0) {
						BacNetObj.dms_devices_controlPoint_value = 0.0;
					}
				} else {
					BacNetObj.dms_devices_controlPoint_tagName = null;
					BacNetObj.dms_devices_controlPoint_val = null;
				}
				BacNetObj.instanceNumber = i + 1;
				BacNetObj.displaydeviceTypeText = displayNameInBACnet.bacNetServerPopupGridDeviceType[BacNetObj.type].text;
				BacNetObj.calcInstanceNumber = calcInstanceNumber(Number(BacNetObj.instanceNumber), Number(deviceTypeNumberForBACnetDeviceId[BacNetObj.displaydeviceTypeText])).result;

				//BacNet 데이터와 DMS 데이터가 동일한 것이 있으면 갱신.
				for (var j = 0; j < dataFromBacNet.length; j++) {
					bacNetItem = dataFromBacNet[j];
					if (dmsItem.id == bacNetItem.dms_devices_id) {
						BacNetObj.hasInstanceNumber = bacNetItem.hasInstanceNumber;
						BacNetObj.instanceNumber = bacNetItem.instanceNumber ? bacNetItem.instanceNumber : null;
						BacNetObj.calcInstanceNumber = bacNetItem.calcInstanceNumber;
						BacNetObj.priorities = bacNetItem.priorities ? bacNetItem.priorities : null;

						if (typeof bacNetItem.writable == "boolean") {
							BacNetObj.writable = bacNetItem.writable;
						} else {
							BacNetObj.writable = bacNetItem.writable ? bacNetItem.writable : null;
						}

						BacNetObj.unit = bacNetItem.unit ? bacNetItem.unit : null;
						BacNetObj.show = true;
						BacNetObj.checked = true;
					}
				}
				dataArr.push(BacNetObj);
			}

			//Popup Server DS 갱신
			popupServerGridDataSource = new kendo.data.DataSource({
				data: dataArr,
				pageSize: 40
			});
			popupServerGridDataSource.read();
		}).fail(function(data) {
			popupServerGridDataSource = new kendo.data.DataSource({
				data: [],
				pageSize: 40
			});
			popupServerGridDataSource.read();
			message.message(data.responseText);
			message.open();
		}).always(function() {
			Loading.close(popupWindowElem);
			popupServerGridDataSource.read();
			popupServerGrid.setDataSource(popupServerGridDataSource);
			popupServerGrid.wrapper.find('.k-scrollbar').scrollTop(0);
		});

	}

	/**
	 *   BACnet 서버의 실행 여부에 따라 각 UI 입력 요소의 활성/비활성 상태를 정한다.
	 *
	 *   @function applyStateOfServerConfig
	 *   @returns {void} - 리턴 값 없음
	 *   @alias module:BACnet-sac
	 */
	//Enable 값에 따른 Server config element 활성화/비활성화
	function applyStateOfServerConfig(isEnable) {
		if (isEnable) { //Server running 상태 - 값 설정 불가능
			buttonManagePoint.data('kendoButton').enable(false);
			buttonApduStop.data("kendoButton").enable(true); //Stop 활성
			buttonApduStart.data("kendoButton").enable(false); //Start 비활성
			apduTimeOut.enable(false);
			apduRetries.enable(false);
			apduMaxLength.enable(false);
			apduSegmentTimeOut.enable(false);
			apduSegmentSupported.enable(false);
			inputServerObjectId.prop("disabled", true);
		} else { //Server stop 상태 - 값 설정 가능
			buttonManagePoint.data('kendoButton').enable(true);
			buttonApduStop.data("kendoButton").enable(false); //Stop 비활성
			buttonApduStart.data("kendoButton").enable(true); //Start 활성
			apduTimeOut.enable(true);
			apduRetries.enable(true);
			apduMaxLength.enable(true);
			apduSegmentTimeOut.enable(true);
			apduSegmentSupported.enable(true);
			inputServerObjectId.prop("disabled", false);
		}
	}

	/**
	 *   BACnet Manage Points 팝업창에서 값이 변화된 row가 있는지 체크하여 uid 저장한다.
	 *
	 *   @param {Object} row - 편집이 발생한 그리드 row 요소 객체
	 *   @function checkChangedRow
	 *   @returns {void} - 리턴 값 없음
	 *   @alias module:BACnet-sac
	 */
	//Manage Points 팝업창에서 변화된 row 있는지 체크
	function checkChangedRow(row) {
		var dataUid = row.attr('data-uid');
		var dataItem = popupServerGrid.dataSource.getByUid(dataUid);
		// var elemShow = row.find("[data-field=show]");
		var elemShow = row.find("[data-field=checked]");
		var elemInstanceNumber = row.find("[data-field=instanceNumber]");
		var elemUnits = row.find("[data-field=unit]");
		var ddlUnits = elemUnits.data("kendoDropDownList"),
			unitValue = null;
		var elemWritable = row.find("[data-field=writable]"),
			writableValue = null;
		var elemPriorities = row.find("[data-field=priorities]");
		var prioritiesItem = elemPriorities.find(".k-checkbox");
		var isShowChanged = false,
			isInstanceNumberChanged = false,
			isUnitChanged = false,
			isWritableChanged = false,
			isPrioritiesChanged = false;
		var isRowChanged = false;
		var isInChangedRowArr = false;
		var i;
		var tbody = popupServerGrid.tbody;
		var trs = tbody.find('tr');

		//Show
		if (dataItem.checked != elemShow.prop("checked")) {
			isShowChanged = true;
		}

		//Instance Number
		if (elemInstanceNumber.attr("data-value") != elemInstanceNumber.val()) {
			isInstanceNumberChanged = true;
		}

		//Units
		if (elemUnits.attr("data-value") == "-")
			unitValue = "";
		else
			unitValue = elemUnits.attr("data-value");

		if (ddlUnits) {
			if (unitValue != ddlUnits.value()) {
				isUnitChanged = true;
			}
		}

		//Writable
		if (typeof elemWritable.prop("checked") == 'undefined' || elemWritable.prop("checked") == false) {
			writableValue = false;
		} else {
			writableValue = true;
		}

		if (JSON.parse(elemWritable.attr("data-value")) != writableValue) {
			isWritableChanged = true;
		}

		//Priorities
		for (i = 0; i < prioritiesItem.length; i++) {
			var item = prioritiesItem.eq(i);
			if (JSON.parse(item.attr("data-value")) != item.prop("checked")) {
				isPrioritiesChanged = true;
				break;
			}
		}

		if (!isShowChanged && !isUnitChanged && !isWritableChanged && !isPrioritiesChanged && !isInstanceNumberChanged) { //어느 하나 바뀌지 않은 경우
			isRowChanged = false;
		} else { //하나라도 바뀐 경우
			isRowChanged = true;
		}

		if (isRowChanged) { //바뀐 것이 있으면 배열에 추가
			for (i = 0; i < getChangedRowUidArr.length; i++) { //이미 바뀐 것으로 존재하면 추가하지 않는다.
				if (getChangedRowUidArr[i] == row.attr("data-uid")) {
					isInChangedRowArr = true;
					break;
				}
			}
			if(!isInChangedRowArr){
				getChangedRowUidArr.push(row.attr("data-uid"));
			}
		} else { //바뀐 것이 없으면 배열에 제거
			for (i = getChangedRowUidArr.length - 1; i >= 0; i--) {
				if (getChangedRowUidArr[i] == row.attr("data-uid")) {
					getChangedRowUidArr.splice(i, 1);
				}
			}
		}

		if (getChangedRowUidArr.length > 0){
			popupServerElem.find("button[data-event=save]").data("kendoButton").enable(true);
		}else{
			popupServerElem.find("button[data-event=save]").data("kendoButton").enable(false);
		}

		// Show 인 관제점 중 Unit 선택 가능한 기기타입(AI, AO)항목에 대해 Unit 선택 하지 않은 경우 '저장'버튼 비활성화
		var isNullUnitValueWhenShow = false;
		for(var j = 0; j < trs.length; j++){
			var tr = trs.eq(j);
			var show = tr.find('[data-field=show]').prop('checked');
			var elemUnit = tr.find('[data-field=unit][data-type=dropdownlist]');
			if(show && elemUnit.length > 0){
				if(!elemUnit.data('kendoDropDownList').value()){
					isNullUnitValueWhenShow = true;
					break;
				}
			}
		}
		popupServerElem.find("button[data-event=save]").data("kendoButton").enable(!isNullUnitValueWhenShow);

		// if(elemShow.prop("checked") && (deviceType == 'AO' || deviceType == 'AI')){//기기타입 AI, AO가 show 인 경우 Unit을 반드시 선택해야함.
		// 	if(!ddlUnits.value()){
		// 		popupServerElem.find("button[data-event=save]").data("kendoButton").enable(false);
		// 	}
		// }
	}

	function setStateSaveBtn() {
		var saveBtn = popupServerElem.find("button[data-event=save]").data("kendoButton");
		var data = popupServerGrid.dataSource.data();
		var max = data.length, i, item = null, deviceType = null;
		var isValid = true;
		for(i = 0; i < max; i++){
			item = data[i];
			if(item.checked){
				deviceType = displayNameInBACnet.bacNetServerPopupGridDeviceType[item.type].text;
				// if((item.insNumValidator && !item.insNumValidator.validate()) || ((deviceType == 'AI' || deviceType == 'AO') && !item.unit)){
				if((item.insNumValidator && !item.insNumValidator.validate())){
					isValid = false;
					break;
				}

				if (item.hasNoRequiredUnit) {
					isValid = false;
					break;
				}
			}
		}
		saveBtn.enable(isValid);
		return isValid;
	}

	/**
	 *   현재 Object ID와 인덱스를 사용하여 Instance Number를 리턴한다.
	 *
	 *   @param {String} objectId - 편집이 발생한 그리드 row 요소 객체
	 *   @param {Number} index - 편집이 발생한 그리드 row 요소 객체
	 *   @function calcInstanceNumber
	 *   @returns {Object} - 10진수 형태 결과 값, 결과의 10bit 값, 결과의 22bit 값
	 *   @alias module:BACnet-sac
	 */
	function calcInstanceNumber(objectId, index) {
		var result = "";
		var totalArr = [],
			idArr = [],
			idxArr = [];
		var cvtObjectId = null,
			cvtIndex = null;
		var idBitCnt = 22,
			indexBitCnt = 10;
		var value10Bit = 0,
			value22Bit = 0;
		var i;

		//10진수 -> 2진수
		cvtObjectId = objectId.toString(2);
		cvtIndex = index.toString(2);

		//배열 초기화
		for (i = 0; i < idBitCnt - cvtObjectId.length; i++) {
			idArr.push(0);
		}
		for (i = 0; i < indexBitCnt - cvtIndex.length; i++) {
			idxArr.push(0);
		}

		//비트 구성
		idArr = idArr.concat(cvtObjectId);
		idxArr = idxArr.concat(cvtIndex);
		totalArr = idxArr.concat(idArr);

		for (i = 0; i < totalArr.length; i++) {
			result += String(totalArr[i]);
		}

		result = parseInt(result, 2);
		value10Bit = getGroupOfBitValue(result).value10Bit;
		value22Bit = getGroupOfBitValue(result).value22Bit;

		return {
			result: result,
			value10Bit: value10Bit,
			value22Bit: value22Bit
		};
	}

	/**
	 *   비트 연산된 10진수 값을 10bit, 22bit로 구분하여 리턴한다.
	 *
	 *   @param {String} value - 10진수 값
	 *   @function getGroupOfBitValue
	 *   @returns {Object} - 2진수 형태의 결과 값, 결과의 10비트 값, 결과의 22비트 값
	 *   @alias module:BACnet-sac
	 */
	//비트 연산된 10진수값을 10Bit, 22Bit로 구분하여 리턴
	function getGroupOfBitValue(value) {
		var cnt = 32;
		var value10Bit = null,
			value22Bit = null;
		var binaryNum = value.toString(2),
			binaryNumArr = binaryNum.split("");
		var dummyArr = [],
			totalArr = [];
		var totalStr = "";
		var i;

		for (i = 0; i < cnt - binaryNum.length; i++) {
			dummyArr.push(0);
		}
		totalArr = dummyArr.concat(binaryNumArr);
		for (i = 0; i < totalArr.length; i++) {
			totalStr += String(totalArr[i]);
		}

		value10Bit = totalStr.substring(0, 10);
		value22Bit = totalStr.substring(10, cnt);


		return {
			value: totalStr,
			value10Bit: value10Bit,
			value22Bit: value22Bit
		};
	}


	/**
	 *   배열을 오름차순으로 정렬한다.
	 *
	 *   @param {Array} arr - 정렬할 배열
	 *   @function sortArrayAsc
	 *   @returns {void} - 리턴 값 없음
	 *   @alias module:BACnet-sac
	 */
	//Array Sort asc
	function sortArrayAsc(arr) {
		arr.sort(function(a, b) {
			return a - b;
		});
	}

	function setCursorPosition(ipt, start, end) {
		var input = ipt[0];
		if(typeof end == 'undefined') {
			end = start;
		}
		return ipt.each(function() {
			if('selectionStart' in input) {
				input.selectionStart = start;
				input.selectionEnd = end;
			} else if(input.setSelectionRange) {
				input.setSelectionRange(start, end);
			} else if(input.createTextRange) {
				var range = input.createTextRange();
				input.collapse(true);
				input.moveEnd('character', end);
				input.moveStart('character', start);
				input.select();
			}
		});
	}

	function highlightUnitDropDownList (dataItem) {
		var type = dataItem.displaydeviceTypeText;
		var unit = dataItem.unit;
		var isChecked = dataItem.checked;
		var tr = dataItem.tr;
		dataItem.hasNoRequiredUnit = false;
		if (type === 'AI' || type === 'AO') {
			if (isChecked) {
				if (!unit) {
					tr.addClass(CLASS_NO_UNIT_HIGHLIGHT);
					dataItem.hasNoRequiredUnit = true;
				} else {
					tr.removeClass(CLASS_NO_UNIT_HIGHLIGHT);
				}
			} else {
				tr.removeClass(CLASS_NO_UNIT_HIGHLIGHT);
			}
		}
	}

	function getItemNoRequiredUnit (dataSource) {
		var data = dataSource.data();
		var i = 0, max = data.length, dataItem = null;

		for (i = 0; i < max; i++) {
			dataItem = data[i];
			if (dataItem.hasNoRequiredUnit) {
				return i;
			}
		}
		return false;
	}

	return init;
});
//# sourceURL=bacnet-server.js