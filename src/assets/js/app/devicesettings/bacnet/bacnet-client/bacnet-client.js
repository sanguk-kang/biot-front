define("devicesettings/bacnet/bacnet-client/bacnet-client", ["devicesettings/core"], function() {
	//UTIL
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();
	var Util = window.Util;
	var I18N = window.I18N;
	var MainWindow = window.MAIN_WINDOW;
	var kendo = window.kendo;

	//다국어
	var BACNET_DEVICE_NAME = I18N.prop("BACNET_DEVICE_NAME");
	var BACNET_DEVICE_ID = I18N.prop("BACNET_DEVICE_ID");
	var SETTINGS_NETWORK_ID = I18N.prop("SETTINGS_NETWORK_ID");
	var BACNET_MATCHED_OBJECTS = I18N.prop("BACNET_MATCHED_OBJECTS");
	var BACNET_NUMBER_OF_OBJECTS = I18N.prop("BACNET_NUMBER_OF_OBJECTS");
	var SETTINGS_BTN_DETAIL = I18N.prop("SETTINGS_BTN_DETAIL");

	//Wrapper
	var elemBacnetTab = $('#device-setting-bacnet-tab');

	//컨펌 및 메시지 Dialog
	var confirmElem = $("#popup-sac-bacnet-device-confirm");
	var messageElem = $("#popup-sac-bacnet-device-message");
	var confirm, message;

	//URL
	var BacNetUrlClient = "/bacnet/client/";

	//Input - Client
	var inputClientPortNumber = $(".sac-bacnet-contents.client").find(".content").find(".detail").find("input[data-role=bacnetclientportnumber]");
	var inputClientDeviceIdLow = $(".sac-bacnet-contents.client").find(".content").find(".detail").find("input[data-role=bacnetclientdeviceidlow]");
	var inputClientDeviceIdHigh = $(".sac-bacnet-contents.client").find(".content").find(".detail").find("input[data-role=bacnetclientdeviceidhigh]");
	//버튼 - Client
	var discoverBtn = $(".sac-bacnet-contents.client").find(".content").find("button[data-event=bacnetclientdiscover]");
	var updateAllBtn = $(".sac-bacnet-contents.client").find(".sac-bacnet-category.connectionlist").find("button[data-event=bacnetclientupdateall]");
	var reloadFlag = false;
	var connectionListDeleteBtn = $(".sac-bacnet-contents.client").find(".sac-bacnet-category.connectionlist").find("button[data-event=bacnetclientconnectionlistdelete]");
	//팝업창 - Client
	var popupClientElem = $("#popup-sac-bacnet-client");
	var popupClientGridElem = popupClientElem.find(".popup-detail-connectionlist-grid");
	var popupClientGridDataSource = [];
	var popupClientGrid;
	var changedPopupClientDataUidArr = [];
	//그리드 - client
	var connectionListGrid = $(".sac-bacnet-contents.client").find(".sac-bacnet-category").find(".sac-bacnet-grid-connectionlist");
	var conncectionListDataSource = [];
	var selectedConnectionList = [];
	var selectedConnectionIndex = null;

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
					value: "Meter.WattHour",
					text: I18N.prop("SETTINGS_ENERGY_METER")
				},
				{
					value: "Sensor.Humidity",
					text: I18N.prop("SETTINGS_HUMIDITY_SENSOR")
				},
				{
					value: "Sensor.Motion",
					text: I18N.prop("SETTINGS_MENUCONFIGURE_MOTION")
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
					value: "Celsius",
					text: "°C"
				},
				{
					value: "Fahrenheit",
					text: "°F"
				},
				{
					value: "kilowattHour",
					text: "Kwh"
				},
				{
					value: "Percent",
					text: "%"
				}
				];
				return result;
			}
		}
	};

	//Display Name for Devices
	var displayNameInBACnet = {
		bacNetClientPopupGridIoType: {
			"ControlPoint.AI": {
				value: "ControlPoint.AI",
				text: "AI"
			},
			"ControlPoint.AO": {
				value: "ControlPoint.AO",
				text: "AO"
			},
			"ControlPoint.AV": {
				value: "ControlPoint.AV",
				text: "AO"
			},
			"ControlPoint.BI": {
				value: "ControlPoint.DI",
				text: "DI"
			},
			"ControlPoint.BO": {
				value: "ControlPoint.DO",
				text: "DO"
			},
			"ControlPoint.BV": {
				value: "ControlPoint.DO",
				text: "DO"
			},
			"ControlPoint.MI": {
				value: "ControlPoint.AI",
				text: "AI"
			},
			"ControlPoint.MO": {
				value: "ControlPoint.AO",
				text: "AO"
			},
			"ControlPoint.MV": {
				value: "ControlPoint.AO",
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

	//WebSocket
	var webSocket = window.CommonWebSocket;
	var receiveMsg = true;

	var init = function(){
		//컴포넌트 초기화
		initComponent();

		//팝업 초기화
		initClientPopup();

		//메인 윈도우 그리드 이벤트 등록
		attachEvtClientGrid();

		//팝업 내부 이벤트 등록
		attachClientPopupEvent();

		//팝업 내부 그리드 이벤트 등록
		attachClientPopupGridEvent();

		//메인 윈도우 요소 이벤트 등록
		attachEvtClientWindow();

		//포트넘버 초기화
		inputClientPortNumber.val(47808);

		//탐색 버튼 초기화
		discoverBtn.data("kendoButton").enable(true);
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
		MainWindow.disableFloorNav(true);

		if(!(elemBacnetTab.data('kendoCommonTabStrip'))){
			elemBacnetTab.kendoCommonTabStrip();
		}

		// Dialog
		confirm = confirmElem.kendoCommonDialog({
			type: "confirm"
		}).data("kendoCommonDialog");
		message = messageElem.kendoCommonDialog().data("kendoCommonDialog");

		// 버튼
		discoverBtn.kendoButton({
			enable: true
		});
		updateAllBtn.kendoButton();
		connectionListDeleteBtn.kendoButton({
			enable: false
		});

		// 그리드
		connectionListGrid.kendoGrid({
			dataSource: [],
			columns: setClientGridColumns(),
			height: '100%',
			scrollable: true
		});
		conncectionListDataSource = new kendo.data.DataSource({
			data: []
		});
		conncectionListDataSource.read();
		connectionListGrid.data("kendoGrid").setDataSource(conncectionListDataSource);

		//PortNumber Validator
		inputClientPortNumber.kendoCommonValidator({
			type: "onlyNumber"
		});

		//BACNet 기기 ID Validator
		inputClientDeviceIdLow.kendoCommonValidator({
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
		inputClientDeviceIdHigh.kendoCommonValidator({
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

		//WebSocket 이벤트 등록
		webSocket.on("receive", function(data) {
			if (receiveMsg) {
				receiveCallback(data);
			}
		});
	};

	/**
	 *
	 *   BACnet 탭 내의 클라이언트 탭 윈도우의 UI 요소에 이벤트를 등록한다.
	 *
	 *   @function attachEvtClientWindow
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 탭 메인 윈도우 이벤트 등록
	var attachEvtClientWindow = function() {
		//Input keyup 바인딩
		inputClientPortNumber.on("keyup", function() {
			var currentValue = $(this).val();
			var discoverBtnData = discoverBtn.data("kendoButton");
			var inputElem = $(this).closest(".sac-bacnet-category").find("input");
			var isEmpty = (currentValue == ''),
				isValid = true,
				isValidNumber = true;

			for (var i = 0; i < inputElem.length; i++) {
				var validator = inputElem.eq(i).data("kendoCommonValidator").validate();
				if (!validator) {
					isValid = false;
					break;
				} else {
					isValid = true;
				}
			}
			discoverBtnData.enable((!isEmpty && isValid && isValidNumber));
		});
		inputClientDeviceIdLow.on("keyup", function() {
			var currentValue = $(this).val();
			var discoverBtnData = discoverBtn.data("kendoButton");
			var portVal = inputClientPortNumber.val();
			var highVal = inputClientDeviceIdHigh.val();
			var inputElem = $(this).closest(".sac-bacnet-category").find("input");
			var isEmpty = (portVal == ''),
				isValid = true,
				isLower = true;

			if(currentValue && highVal){
				isLower = (Number(currentValue) <= Number(highVal));
			}

			for (var i = 0; i < inputElem.length; i++) {
				var validator = inputElem.eq(i).data("kendoCommonValidator").validate();
				if (!validator) {
					isValid = false;
					break;
				} else {
					isValid = true;
				}
			}
			discoverBtnData.enable((!isEmpty && isValid && isLower));
		});
		inputClientDeviceIdHigh.on("keyup", function() {
			var currentValue = $(this).val();
			var discoverBtnData = discoverBtn.data("kendoButton");
			var portVal = inputClientPortNumber.val();
			var lowVal = inputClientDeviceIdLow.val();
			var inputElem = $(this).closest(".sac-bacnet-category").find("input");
			var isEmpty = (portVal == ''),
				isValid = true,
				isHigher = true;

			if (currentValue && lowVal) {
				isHigher = (Number(currentValue) >= Number(lowVal));
			}

			for (var i = 0; i < inputElem.length; i++) {
				var validator = inputElem.eq(i).data("kendoCommonValidator").validate();
				if (!validator) {
					isValid = false;
					break;
				} else {
					isValid = true;
				}
			}
			discoverBtnData.enable((!isEmpty && isValid && isHigher));
		});

		//Discover 버튼
		discoverBtn.on("click", function(e) {
			var portNum = inputClientPortNumber.val();
			var deviceIdLow = inputClientDeviceIdLow.val();
			var deviceIdHigh = inputClientDeviceIdHigh.val();
			var rangeValueArr = [], url = BacNetUrlClient + 'devices?portNumber=' + portNum;

			if (deviceIdLow == '' && deviceIdHigh == ''){ // 둘 다 입력하지 않았을 경우
				rangeValueArr = [0, 4194303];
			} else if (deviceIdLow == '') { // min 입력하지 않은 경우
				url = url + "&idHigh=" + deviceIdHigh;
				rangeValueArr = [0, deviceIdHigh];
			} else if (deviceIdHigh == '') { // max 입력하지 않은 경우
				url = url + "&idLow=" + deviceIdLow;
				rangeValueArr = [deviceIdLow, 4194303];
			} else { // 둘다 입력한 경우
				url = url + '&idLow=' + deviceIdLow + "&idHigh=" + deviceIdHigh;
				rangeValueArr = [deviceIdLow, deviceIdHigh];
			}

			Loading.open();
			$.ajax({
				url: url
			}).done(function(data) {
				//요청이 성공하더라도 탐색된 기기가 없을 경우(data = []) 팝업 오픈.
				if (data.length < 1) {
					message.message(I18N.prop("BACNET_MESSAGE_CLIENT_NOT_DISCOVERED"));
					message.open();
				}

				//id가 null인 경우 배열에서 제거.
				for (var i = data.length - 1; i >= 0; i--) {
					if (!data[i].id) {
						data.splice(i, 1);
					}
				}

				conncectionListDataSource = new kendo.data.DataSource({
					data: data
				});
				conncectionListDataSource.read();
				connectionListGrid.data("kendoGrid").setDataSource(conncectionListDataSource);

				selectedConnectionList = [];
				inputClientDeviceIdLow.val(rangeValueArr[0]);
				inputClientDeviceIdHigh.val(rangeValueArr[1]);
			}).fail(function() {
				message.message(I18N.prop("BACNET_MESSAGE_CLIENT_NOT_DISCOVERED"));
				message.open();
			}).always(function() {
				Loading.close();
			});
		});
		//Update All 버튼
		updateAllBtn.on("click", function() {
			var url = BacNetUrlClient + "devices?ids=";
			var dataArr = conncectionListDataSource.data();
			var idsArr = [],
				idsParam = "";
			var i;

			//Create URL
			for (i = 0; i < dataArr.length; i++) {
				idsArr.push(dataArr[i].id);
			}
			idsParam = idsArr.toString();
			url = url + idsParam;

			if (reloadFlag) {
				url = BacNetUrlClient + "devices?ids=";
				reloadFlag = false;
			}

			Loading.open();
			$.ajax({
				url: url
			}).done(function(data) {
				//id가 null인 경우 배열에서 제거.
				for (i = data.length - 1; i >= 0; i--) {
					if (!data[i].id) {
						data.splice(i, 1);
					}
				}

				conncectionListDataSource = new kendo.data.DataSource({
					data: data
				});
				conncectionListDataSource.read();
				connectionListGrid.data("kendoGrid").setDataSource(conncectionListDataSource);
				selectedConnectionList = [];
			}).fail(function(data) {
				message.message(data.responseText);
				message.open();
			}).always(function() {
				Loading.close();
			});
		});
		//Delete 버튼
		connectionListDeleteBtn.on("click", function() {
			var idsParam;
			var idsArr = [];
			var url = BacNetUrlClient + "devices";
			var count = selectedConnectionList.length;
			var i;

			//선택된 dms ids 문자열화
			for (i = 0; i < count; i++) {
				var selectedId = conncectionListDataSource.data()[selectedConnectionList[i]].id;
				idsArr.push(selectedId);
			}
			idsParam = idsArr.toString();

			if (count <= conncectionListDataSource.data().length) {
				url = url + "?ids=" + idsParam;
			}

			confirm.message(I18N.prop("BACNET_CONFIRM_DELETE_DEVICE"));
			confirm.setConfirmActions({
				yes: function(e) {
					Loading.open();
					$.ajax({
						url: url,
						method: "DELETE"
					}).done(function() {
						//Grid에 반영
						for (i = count - 1; i >= 0; i--) {
							var item = conncectionListDataSource.at(selectedConnectionList[i]);
							conncectionListDataSource.remove(item);
						}
						message.message(I18N.prop("BACNET_MESSAGE_SELECTED_DEVICE_DELETED"));
						selectedConnectionList = [];
					}).fail(function(data) {
						message.message(data.responseText);
					}).always(function() {
						message.open();
						Loading.close();
					});
				},
				no: function(e) {}
			});
			confirm.open();
		});
	};

	/**
	 *
	 *   클라이언트 탭의 기기 연결 목록 그리드 내부 UI 요소에 이벤트를 등록한다.
	 *
	 *   @function attachEvtClientGrid
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 탭 그리드 이벤트 등록
	var attachEvtClientGrid = function() {
		//Check All
		connectionListGrid.on("click", "input[data-event=devicecheckall]", function(e) {
			var elem = $(this);
			var checkElem = elem.closest(".k-grid").find("input[data-event=devicecheck]");

			selectedConnectionList = [];
			if (elem.is(":checked")) {
				checkElem.each(function(index, evt) {
					evt.checked = true;
					selectedConnectionList.push(index);
				});
			} else {
				checkElem.each(function(index, evt) {
					evt.checked = false;
					selectedConnectionList = [];
				});
			}
			checkSelectedConnectionList();
		});

		//Check device(s)
		connectionListGrid.on("click", "input[data-event=devicecheck]", function(e) {
			var elem = $(this);
			var checkElem = elem.closest(".k-grid").find("input[data-event=devicecheck]");
			var checkAllElem = elem.closest(".k-grid").find("input[data-event=devicecheckall]");
			var index = checkElem.index(this);

			if (elem.is(":checked")) {
				selectedConnectionIndex = index;
				selectedConnectionList.push(index);
			} else {
				checkElem.checked = false;
				selectedConnectionList = $.grep(selectedConnectionList, function(value) {
					return value != index;
				});
			}
			sortArrayAsc(selectedConnectionList);
			checkSelectedConnectionList();

			if (selectedConnectionList.length < conncectionListDataSource.data().length) {
				checkAllElem.prop("checked", false);
			} else if (selectedConnectionList.length == conncectionListDataSource.data().length) {
				checkAllElem.prop("checked", true);
			}
		});

		//Refresh Grid Event for Checkbox
		connectionListGrid.data("kendoGrid").bind("dataBound", function() {
			var checkAllElem = connectionListGrid.find("input[data-event=devicecheckall]");
			checkAllElem.prop("checked", false);
			connectionListDeleteBtn.data("kendoButton").enable(false);
		});

		//Detail Icon Click Event
		connectionListGrid.on("click", "span[data-event=devicedetailico]", function(e) {
			var elem = $(e.target);
			var index = elem.closest("tbody").find("tr").index(elem.closest("tr"));
			selectedConnectionIndex = index;
			openClientPopup(popupClientElem, index);
		});
	};

	/**
	 *
	 *   클라이언트 탭의 기기 상세팝업 및 내부 위젯을 초기화 한다.
	 *
	 *   @function initClientPopup
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 팝업 초기화
	var initClientPopup = function() {
		//팝업 초기화
		popupClientElem.kendoPopupSingleWindow({
			title: I18N.prop("COMMON_BTN_DETAIL"),
			width: 1500,
			height: 800
		});

		//팝업창 그리드 초기화
		popupClientGrid = popupClientGridElem.kendoGrid({
			dataSource: [],
			columns: setClientPopupGridColumns(),
			height: 550,
			scrollable: true
		}).data("kendoGrid");
	};

	/**
	 *
	 *   클라이언트 탭의 기기 상세팝업 및 내부 위젯을 초기화 한다.
	 *
	 *   @function attachClientPopupEvent
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 팝업 내부 이벤트 등록
	var attachClientPopupEvent = function() {
		//Input - Network ID
		var inputNetworkId = popupClientElem.find(".popup-container").find(".popup-detail-row").find("input[data-role=networkid]");
		inputNetworkId.on("keyup", function() {
			var curValue = $(this).val();
			var orgValue = $(this).attr("data-value");
			if (curValue != orgValue) {
				popupClientElem.find(".k-button[data-event=save]").data("kendoButton").enable(true);
			} else {
				popupClientElem.find(".k-button[data-event=save]").data("kendoButton").enable(false);
			}
		});

		//Button - Create Mated I/O
		popupClientElem.on("click", ".k-button[data-event=creatematchedio]", function() {
			var tr = popupClientGrid.tbody.find("tr");

			for (var i = 0; i < tr.length; i++) {
				var curTr = tr.eq(i);
				var ddlMappedType = curTr.find("input[data-field=dms_devices_mappedType]").data("kendoDropDownList");
				var inputDmsName = curTr.find("input[data-field=dms_devices_controlPoint_tagName]");
				var spanObjName = curTr.find("span[data-field=name]");
				var orgDDLvalue = ddlMappedType.value();
				var orgDmsName = inputDmsName.val();
				ddlMappedType.text(I18N.prop("SETTINGS_MENUCONFIGURE_POINT"));
				ddlMappedType.enable(true);
				inputDmsName.val(spanObjName.text());
				if (ddlMappedType.value() != orgDDLvalue) {
					getChangedDataUid(ddlMappedType.element, changedPopupClientDataUidArr);
				}
				if (inputDmsName.val() != orgDmsName) {
					getChangedDataUid(inputDmsName, changedPopupClientDataUidArr);
				}
			}

			if (changedPopupClientDataUidArr.length > 0) {
				popupClientElem.find(".k-button[data-event=save]").data("kendoButton").enable(true);
			} else {
				popupClientElem.find(".k-button[data-event=save]").data("kendoButton").enable(false);
			}
		});

		//Button - Save
		popupClientElem.on("click", ".k-button[data-event=save]", function(e) {
			var sendObj = {};
			var deviceId = popupClientElem.attr("device-id");
			var currentNetworkId = inputNetworkId.val();
			var originalNetworkId = inputNetworkId.attr("data-value");
			var changedMatchedIoLength = changedPopupClientDataUidArr.length;
			//Network Id를 수정한 경우 Patch 객체에 키와 변화된 값 추가
			if (currentNetworkId != originalNetworkId) {
				sendObj.networkId = currentNetworkId;
			}

			//그리드에 변경된 내용이 있다면,
			if (changedMatchedIoLength > 0) {
				sendObj.objects = []; //objects 배열 추가
				for (var i = 0; i < changedMatchedIoLength; i++) {
					var uid = changedPopupClientDataUidArr[i];
					var tr = popupClientGrid.table.find("tr[data-uid=" + uid + "]");
					var curData = popupClientGrid.dataSource.getByUid(tr.data("uid"));
					var objectId = curData.id;
					var mappedType = tr.find("input[data-field=dms_devices_mappedType]").data("kendoDropDownList").value();
					var tagName = tr.find("input[data-field=dms_devices_controlPoint_tagName]").val();
					var matchedIO = {
						id: objectId,
						dms_devices_mappedType: mappedType,
						dms_devices_controlPoint_tagName: tagName
					};
					sendObj.objects.push(matchedIO);
				}
			}

			Loading.open(popupClientElem);
			$.ajax({
				url: BacNetUrlClient + "devices/" + deviceId,
				method: "PATCH",
				data: sendObj
			}).done(function() {
				Loading.close(popupClientElem);
				//PATCH 이후 팝업창 Reload - 변경된 Network Id 및 DataSource 반영
				reloadPopupClientGrid(popupClientElem, selectedConnectionIndex, "SAVE");
			}).fail(function(data) {
				Loading.close(popupClientElem);
				message.message(data.responseText);
				message.open();
			});
		});

		//Button - Close
		popupClientElem.on("click", ".k-button[data-event=close]", function() {
			// reloadFlag = true;
			// updateAllBtn.trigger("click");
		});
	};

	/**
	 *
	 *   클라이언트 탭의 기기 상세팝업 그리드에 이벤트를 등록한다.
	 *
	 *   @function attachClientPopupGridEvent
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 팝업 내부 그리드 이벤트 등록
	var attachClientPopupGridEvent = function() {
		//Refresh Grid Event for Preprocessing display contents
		popupClientGrid.bind("dataBound", function() {
			preProcessClientPopupGrid();
		});
	};

	/**
	 *
	 *   클라이언트 탭의 기기 목록 그리드 컬럼을 정의한다.
	 *
	 *   @function setClientGridColumns
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 그리드 컬럼 세팅
	function setClientGridColumns() {
		var columns = [];
		var connectionListGridDefinition = [{
			field: "checkbox",
			title: "",
			sortable: false
		},
		{
			field: "name",
			title: BACNET_DEVICE_NAME,
			sortable: false
		},
		{
			field: "id",
			title: BACNET_DEVICE_ID,
			sortable: false
		},
		{
			field: "networkId",
			title: SETTINGS_NETWORK_ID,
			sortable: false
		},
		{
			field: "numberOfObjects",
			title: BACNET_NUMBER_OF_OBJECTS,
			sortable: false
		},
		{
			field: "numberOfMappedDevices",
			title: BACNET_MATCHED_OBJECTS,
			sortable: false
		},
		{
			field: "detail",
			title: SETTINGS_BTN_DETAIL,
			sortable: false
		}
		];

		$.each(connectionListGridDefinition, function(idx, item) {
			if (item.field == "checkbox") {
				columns.push({
					headerTemplate: "<input type='checkbox' class='k-checkbox' data-event='devicecheckall' id='bacnet-connection-list-check-all'>" +
						"<label class='k-checkbox-label' for='bacnet-connection-list-check-all'></label>",
					template: function(data) {
						var result = "<input type='checkbox' data-event='devicecheck' class='k-checkbox' id='bacnet-connection-list-check-" + data.id + "'/>" +
							"<label class='k-checkbox-label' for='bacnet-connection-list-check-" + data.id + "'></label>";
						return result;
					},
					width: 100,
					sortable: item.sortable
				});
			} else if (item.field == "detail") {
				columns.push({
					title: item.title,
					template: function(data) {
						var result = "<span class='ic ic-info' data-event='devicedetailico' data-for='" + data.id + "'></span>";
						return result;
					},
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

		function createListTmpl(dataItem, item) {
			var value;

			//XSS 필터 적용
			dataItem[item.field] = Util.getValueFilteredForXSS(dataItem[item.field]);

			if (dataItem[item.field]) {
				value = dataItem[item.field];
			} else {
				value = "-";
			}
			return "<span class='sac-bacnet-connectionlist-grid-" + item.field + "'>" + value + "</span>";
		}

		return columns;
	}

	/**
	 *
	 *   클라이언트 탭의 기기 상세팝업 내 그리드의 컬럼을 정의한다.
	 *
	 *   @function setClientPopupGridColumns
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client connectionlist detail popup 그리드 컬럼 세팅
	function setClientPopupGridColumns() {
		var columns = [];
		var matchedIoColumns = [];
		var connectionListPopupGridDefinition = [{
			field: "type",
			title: I18N.prop("BACNET_OBJECT_IO_TYPE"),
			sortable: false,
			type: "string"
		},
		{
			field: "name",
			title: I18N.prop("BACNET_OBJECT_NAME"),
			sortable: false,
			type: "string"
		},
		{
			field: "dms_devices_controlPoint_value",
			title: I18N.prop("BACNET_PRESENT_VALUE"),
			sortable: false,
			type: "string"
		},
		{
			field: "priorities",
			title: I18N.prop("BACNET_PRIORITY_ARRAY"),
			sortable: false,
			type: "string"
		},
		{
			field: "description",
			title: I18N.prop("SETTINGS_DEVICE_DESCRIPTION"),
			sortable: false,
			type: "string"
		}
		];
		var matchedIoDefinition = [{
			field: "dms_devices_mappedType",
			title: I18N.prop("SETTINGS_DEVICE_TYPE"),
			sortable: false,
			type: "dropdownlist"
		},
		{
			field: "dms_devices_type",
			title: I18N.prop("BACNET_IO_TYPE"),
			sortable: false,
			type: "string"
		},
		{
			field: "dms_devices_controlPoint_tagName",
			title: I18N.prop("BACNET_DEVICE_NAME"),
			sortable: false,
			type: "input"
		}
		];

		//Single Columns
		$.each(connectionListPopupGridDefinition, function(idx, item) {
			columns.push({
				field: item.field,
				title: item.title,
				template: function(dataItem) {
					return createListTmpl(dataItem, item);
				},
				sortable: item.sortable
			});
		});

		//Multiple Columns
		$.each(matchedIoDefinition, function(idx, item) {
			matchedIoColumns.push({
				field: item.field,
				title: item.title,
				template: function(dataItem) {
					return createListTmpl(dataItem, item);
				},
				sortable: item.sortable
			});
		});
		columns.push({
			title: I18N.prop("BACNET_MATCHED_IO"),
			columns: matchedIoColumns
		});

		//Create template for each row
		function createListTmpl(dataItem, item) {
			var fieldName, type, value, result;
			fieldName = item.field;
			type = item.type;

			if (type == "string") {
				dataItem[fieldName] = Util.getValueFilteredForXSS(dataItem[fieldName]);
			}

			//Display value
			if (dataItem[item.field] === null || typeof dataItem[item.field] == 'undefined' || dataItem[item.field] == "" || dataItem[item.field] == "NONE") {
				if (item.field == "priorities") {
					value = "-";
				} else if (item.field == "dms_devices_controlPoint_value") {
					if (dataItem[item.field] == "0.0") {
						value = "0.0";
					} else if (dataItem[item.field] == "0") {
						value = "0";
					} else {
						value = "-";
					}
				} else {
					value = "-";
				}
			} else if (fieldName == "priorities") {
				for (var idx = 0; idx < dataItem[item.field].length; idx++) {
					if (dataItem[item.field][idx] == 1) {
						value = "Out " + String(idx + 1);
						break;
					} else {
						value = "-";
					}
				}
			} else if (fieldName == "dms_devices_type") {
				var devType = dataItem.type;
				// if (devType.indexOf("AI") > -1 ) value = "AI";
				// else if (devType.indexOf("AO") > -1 ) value = "AO";
				// else if (devType.indexOf("AV") > -1 ) value = "AO";
				// else if (devType.indexOf("BI") > -1 ) value = "DI";
				// else if (devType.indexOf("BO") > -1 ) value = "DO";
				// else if (devType.indexOf("BV") > -1 ) value = "DO";
				// else if (devType.indexOf("MI") > -1 ) value = "AI";
				// else if (devType.indexOf("MO") > -1 ) value = "AO";
				// else if (devType.indexOf("MV") > -1 ) value = "AO";

				value = dataItem.type ? dataItem.type : '-'; //파싱 로직을 타지 않는 경우 서버 응답값 표시 예외처리 적용
				if(devType.indexOf("AI") > -1 || devType.indexOf("MI") > -1){
					value = "AI";
				}else if(devType.indexOf("AO") > -1 || devType.indexOf("AV") > -1 || devType.indexOf("MO") > -1 || devType.indexOf("MV") > -1){
					value = "AO";
				}else if(devType.indexOf("DI") > -1 || devType.indexOf("BI") > -1){
					value = "DI";
				}else if(devType.indexOf("BO") > -1 || devType.indexOf("BO") > -1 || devType.indexOf("BV") > -1){
					value = "DO";
				}
			} else if (fieldName == "dms_devices_controlPoint_value") {
				value = dataItem[item.field].toFixed(1);
			} else {
				value = dataItem[item.field];
			}

			//Display type
			if (type == "string") {
				result = "<span class='sac-bacnet-connectionlist-grid-cell' data-field='" + fieldName + "' data-type='string' data-value='" + value + "'>" + value + "</span>";
			} else if (type == "input") {
				result = "<input class='k-input sac-bacnet-connectionlist-grid-cell' data-field='" + fieldName + "' data-type='input' data-value='" + value + "'/>";
			} else if (type == "dropdownlist") {
				result = "<input class='sac-bacnet-connectionlist-grid-cell' data-field='" + fieldName + "' data-type='dropdownlist' data-value='" + value + "'/>";
			}
			return result;
		}
		return columns;
	}

	/**
	 *
	 *   기기 목록 그리드 내의 기기 선택을 체크하여 버튼 활성화 상태에 반영한다.
	 *
	 *   @function checkSelectedConnectionList
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client ConnectionList 선택 체크
	function checkSelectedConnectionList() {
		var count = selectedConnectionList.length;
		if (count == 0) {
			connectionListDeleteBtn.data("kendoButton").enable(false);
		} else {
			connectionListDeleteBtn.data("kendoButton").enable(true);
		}
	}

	/**
	 *
	 *   기기 목록에서 선택된 기기의 상세 팝업을 오픈한다.
	 *
	 *   @param {Object} popupWindowElem - 팝업창 요소 객체
	 *   @param {Number} index - 팝업창의 대상이 될 기기의 인덱스
	 *   @function openClientPopup
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 팝업 오픈
	function openClientPopup(popupWindowElem, index) {
		var popupWindow = popupWindowElem.data("kendoPopupSingleWindow");
		var currentDeviceId = conncectionListDataSource.data()[index].id;
		var currentData = {};
		var spanDeviceName = popupWindowElem.find(".popup-header-info").find(".device-name");
		var spanBacNetId = popupWindowElem.find(".popup-container").find(".popup-detail-row").find("span[data-role=bacnetid]");
		var spanNetworkId = popupWindowElem.find(".popup-container").find(".popup-detail-row").find("span[data-role=networkid]");

		//팝업창 device Id 저장
		popupWindowElem.attr("device-id", currentDeviceId);

		//팝업창 오픈
		popupWindow.openWindowPopup();

		//변경된 데이터 UID 및 배열 초기화
		changedPopupClientDataUidArr = [];

		Loading.open(popupWindowElem);
		$.ajax({
			url: BacNetUrlClient + "devices/" + currentDeviceId
			//url: BacNetUrlClient + "devices"
		}).done(function(data) {
			currentData = data;

			for(var i = 0; i < currentData.objects.length; i++){
				var objectItem = currentData.objects[i];
				if(objectItem.dms_devices_mappedType == 'Meter'){
					objectItem.dms_devices_mappedType = 'Meter.WattHour';
				}
			}

			//팝업창 내부 그리드 DataSource binding
			popupClientGridDataSource = new kendo.data.DataSource({
				data: currentData.objects
			});
			popupClientGridDataSource.read();
			popupClientGrid.setDataSource(popupClientGridDataSource);
			popupClientGrid.content[0].scrollTop = 0;

			//Data Binding
			spanDeviceName.text(currentData.name);
			spanBacNetId.text(currentData.id);
			spanBacNetId.attr("data-value", currentData.id);
			spanNetworkId.attr("data-value", currentData.networkId);
			spanNetworkId.text(currentData.networkId);

			//Setting Button
			popupWindowElem.find(".k-button[data-event=save]").data("kendoButton").enable(false);
		}).fail(function(data) {
			message.message(data.responseText);
			message.open();
		}).always(function() {
			Loading.close(popupWindowElem);
		});
	}

	/**
	 *
	 *   클라이언트 기기 상세팝업 내 그리드 내부 UI 요소에 대한 전처리를 시행한다.
	 *
	 *   @function preProcessClientPopupGrid
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 팝업 전처리
	function preProcessClientPopupGrid() {
		var trGrid = popupClientGridElem.find(".k-grid-content").find("tbody").find("tr");

		for (var i = 0; i < trGrid.length; i++) {
			var td = trGrid.eq(i).find("td");
			for (var j = 0; j < td.length; j++) {
				var tdTmp = td.eq(j);
				var targetElem = tdTmp.find("[data-type]");
				var dataType = targetElem.attr("data-type");
				var dataValue = targetElem.attr("data-value");
				var dataField = targetElem.attr("data-field");

				if (dataType == "input") {
					targetElem.val(dataValue);
					targetElem.on("keyup", function(e) {
						var currentValue = $(this).val();
						if (currentValue != $(this).attr("data-value")) {
							getChangedDataUid($(this), changedPopupClientDataUidArr);
							popupClientElem.find(".k-button[data-event=save]").data("kendoButton").enable(true);
						}
					});
				} else if (dataType == "dropdownlist") {
					targetElem.kendoDropDownList({
						optionsLabel: dataSourceForDDLInPopupClient[dataField].optionsLabel,
						dataSource: dataSourceForDDLInPopupClient[dataField].data(),
						dataTextField: "text",
						dataValueField: "value",
						change: function(e) {
							var elem = $(this.element);
							var value = this.value();
							if (elem.attr("data-value") != value) {
								getChangedDataUid(elem, changedPopupClientDataUidArr);
							}
							popupClientElem.find(".k-button[data-event=save]").data("kendoButton").enable(true);
						}
					});

					if (dataValue == "-" || dataValue == "NONE" || dataValue == "" || !(dataValue)) {
						//targetElem.closest(".k-dropdown").find(".k-dropdown-wrap").find("span.k-input").text("-");
						targetElem.data("kendoDropDownList").text("-");
						targetElem.data("kendoDropDownList").enable(false);
					} else {
						targetElem.data("kendoDropDownList").value(dataValue);
						targetElem.data("kendoDropDownList").trigger("change");
					}

				}
			}
		}
	}

	/**
	 *
	 *   팝업창 내의 그리드를 리로드 한다.
	 *
	 *   @param {Object} popupWindowElem - 팝업창 요소 객체
	 *   @param {Number} index - 팝업창의 대상이 될 기기의 인덱스
	 *   @param {String} eventName - 갱신시 발생하는 이벤트 이름
	 *   @function reloadPopupClientGrid
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//Client 팝업 그리드 리로드
	function reloadPopupClientGrid(popupWindowElem, index, eventName) {
		var currentDeviceId = conncectionListDataSource.data()[index].id;
		var currentData = {};
		var spanDeviceName = popupWindowElem.find(".popup-header-info").find(".device-name");
		var spanBacNetId = popupWindowElem.find(".popup-container").find(".popup-detail-row").find("span[data-role=bacnetid]");
		var inputNetworkId = popupWindowElem.find(".popup-container").find(".popup-detail-row").find("input[data-role=networkid]");
		var saveBtn = popupWindowElem.find(".popup-footer").find(".k-button[data-event=save]");
		Loading.open(popupWindowElem);
		$.ajax({
			url: BacNetUrlClient + "devices/" + currentDeviceId
		}).done(function(data) {
			currentData = data;

			for(var i = 0; i < currentData.objects.length; i++){
				var objectItem = currentData.objects[i];
				if(objectItem.dms_devices_mappedType == 'Meter'){
					objectItem.dms_devices_mappedType = 'Meter.WattHour';
				}
			}

			//팝업창 내부 그리드 DataSource binding
			popupClientGridDataSource = new kendo.data.DataSource({
				data: currentData.objects
			});
			popupClientGridDataSource.read();
			popupClientGrid.setDataSource(popupClientGridDataSource);

			//Data Binding
			spanDeviceName.text(currentData.name);
			spanBacNetId.text(inputClientDeviceIdLow.val() + " ~ " + inputClientDeviceIdHigh.val());
			inputNetworkId.val(currentData.networkId);
			changedPopupClientDataUidArr = [];
		}).fail(function(data) {
			message.message(data.responseText);
			message.open();
		}).always(function() {
			Loading.close(popupWindowElem);
			if (eventName == "SAVE") saveBtn.data("kendoButton").enable(false);
		});
	}

	/**
	 *
	 *   편집되어 값이 변경된 row의 uuid를 저장한다.
	 *
	 *   @param {Object} elem - 팝업창 요소 객체
	 *   @param {Number} dataArr - 팝업창의 대상이 될 기기의 인덱스
	 *   @function getChangedDataUid
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	// 값이 변경된 Element 체크하고 변경되었다면, DataUid 얻어오기
	function getChangedDataUid(elem, dataArr) {
		var isInArray = false;
		var thisRow = $(elem).closest("tr");
		var thisRowUid = thisRow.attr("data-uid");

		if (dataArr.length == 0) {
			dataArr.push(thisRowUid);
		} else {
			for (var i = 0; i < dataArr.length; i++) {
				var tmpUid = dataArr[i];
				if (tmpUid != thisRowUid) {
					isInArray = false;
				} else {
					isInArray = true;
					break;
				}
			}

			if (!isInArray) {
				dataArr.push(thisRowUid);
			}
		}
	}

	/**
	 *
	 *   웹 소켓으로부터 응답받아 클라이언트 메인 그리드 및 팝업창 그리드를 갱신한다.
	 *
	 *   @param {String} mq - 웹 소켓 응답 메시지
	 *   @function receiveCallback
	 *   @returns {void} - 리턴 값 없음.
	 *   @alias module:BACnet-sac
	 *
	 */
	//WebSocket callback
	function receiveCallback(mq) {
		var url = "/bacnet/client/devices/";
		var isPopupOpened = popupClientElem.data("kendoPopupSingleWindow").options.visible;

		//메인 그리드 객체 모델 정의
		var MainGridObject = function(obj) {
			this.id = obj.id ? obj.id : null;
			this.name = obj.name ? obj.name : null;
			this.networkId = obj.networkId ? obj.networkId : null;
			this.numberOfObjects = obj.numberOfObjects ? obj.numberOfObjects : null;
			this.numberOfMappedDevices = obj.numberOfMappedDevices ? obj.numberOfMappedDevices : null;

			if (obj.numberOfObjects == 0)
				this.numberOfObjects = 0;
			if (obj.numberOfMappedDevices == 0)
				this.numberOfMappedDevices = 0;
		};

		//팝업창 - objects 객체 정의
		var PopupGridObjects = function(obj) {
			this.id = obj.id ? obj.id : null;
			this.name = obj.name ? obj.name : null;
			this.type = obj.type ? obj.type : null;
			this.description = obj.description ? obj.description : null;
			this.priorities = obj.priorities ? obj.priorities : null;
			this.dms_devices_type = obj.dms_devices_type ? obj.dms_devices_type : null;
			this.dms_devices_mappedType = obj.dms_devices_mappedType ? obj.dms_devices_mappedType : null;
			this.dms_devices_controlPoint_tagName = obj.dms_devices_controlPoint_tagName ? obj.dms_devices_controlPoint_tagName : null;
			this.dms_devices_controlPoint_value = obj.dms_devices_controlPoint_value ? obj.dms_devices_controlPoint_value : null;
		};

		var tbody, obj, i, key;
		var targetRow, targetCell;
		if (mq.type == "AsyncUpdate") {
			if (mq.url.indexOf(url) != -1 && mq.url.length > url.length) { //클라이언트 팝업창 - objects
				if (isPopupOpened) { //팝업창 열려있다면 진행
					var splitArr = mq.url.split("/");
					var bacNetDeviceId = splitArr[splitArr.length - 1]; //웹소켓의 device id
					var currentDeviceIdOnPopup = popupClientElem.attr("device-id"); //팝업창의 메인 device id
					tbody = popupClientGridElem.data("kendoGrid").tbody;

					if (currentDeviceIdOnPopup == bacNetDeviceId) { //ID 비교 후 동일하다면.
						for (i = 0; i < mq.body.length; i++) {
							obj = mq.body[i];
							var objPopupGrid = new PopupGridObjects(obj); //웹소켓 받아온 객체
							var deviceItemOnPopup = popupClientGridDataSource.get(objPopupGrid.id); //해당 ID에 매칭되는 팝업창 그리드의 디바이스
							if (deviceItemOnPopup) { //존재한다면 업데이트
								//Table 요소
								targetRow = tbody.find("tr[data-uid=" + deviceItemOnPopup.uid + "]");
								for (key in objPopupGrid) {
									//데이터에 반영
									deviceItemOnPopup[key] = objPopupGrid[key];
									//UI 반영
									targetCell = targetRow.find(".sac-bacnet-connectionlist-grid-cell[data-field=" + key + "]");
									var dataType = targetCell.attr("data-type");
									if (dataType == "string") {
										if (key == "priorities") {
											for (var idx = 0; idx < objPopupGrid[key].length; idx++) {
												if (objPopupGrid[key][idx] == 1) {
													targetCell.text("Out " + String(idx + 1));
													break;
												} else {
													targetCell.text("-");
													break;
												}
											}
										} else if (key == "dms_devices_type") {
											if (displayNameInBACnet.bacNetClientPopupGridIoType[objPopupGrid[key]]) {
												targetCell.text(displayNameInBACnet.bacNetClientPopupGridIoType[objPopupGrid[key]].text);
											} else {
												targetCell.text("-");
											}
										} else {
											targetCell.text(objPopupGrid[key]);
										}
									} else if (dataType == "input") {
										targetCell.val(objPopupGrid[key]);
									} else if (dataType == "dropdownlist") {
										targetCell.data("kendoDropDownList").value(objPopupGrid[key]);
										if (objPopupGrid[key]) {
											targetCell.data("kendoDropDownList").enable(true);
										}
									}
								}
							} else if (!deviceItemOnPopup && objPopupGrid.id) { //존재하지 않은 디바이스라면, id가 존재하는 경우에만 추가
								popupClientGridDataSource.add(objPopupGrid);
							}
						}
					}

				}
			} else if (mq.url == url) { //클라이언트 메인윈도우
				tbody = connectionListGrid.data("kendoGrid").tbody;
				for (i = 0; i < mq.body.length; i++) {
					obj = mq.body[i];
					var objMainGrid = new MainGridObject(obj); //웹소켓 받아온 객체
					var existedObj = conncectionListDataSource.get(obj.id) ? conncectionListDataSource.get(obj.id) : null; //그 ID에 해당하는 그리드에 존재하는 객체

					if (existedObj) { //이미 존재하는 디바이스라면 업데이트
						targetRow = tbody.find("tr[data-uid=" + existedObj.uid + "]");
						for (key in objMainGrid) {
							if (key != "numberOfMappedDevices") {
								//데이터 반영
								existedObj[key] = objMainGrid[key];
								//UI 반영
								targetCell = targetRow.find(".sac-bacnet-connectionlist-grid-" + key);
								targetCell.text(objMainGrid[key]);
							}
						}
					} else if (objMainGrid.id) { //존재하지 않은 디바이스라면, id가 존재하는 경우에만 추가
						conncectionListDataSource.add(objMainGrid);
					}
				}
			}
		}
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


	return init;
});
//# sourceURL=bacnet-client.js