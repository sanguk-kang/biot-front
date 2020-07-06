/**
 *
 *   <ul>
 *       <li>SAC 설정을 한다.</li>
 *       <li>DMS 및 S-Net SMART Controller  기기 타입을 추가할 수 있으며 하위 기기를 관리한다.</li>
 *       <li>상세팝업을 통해 하위기기 설정을 할 수 있다.</li>
 *   </ul>
 *   @module app/devicesettings/controller/sac-sac
 *   @requires app/main
 */
define("devicesettings/controller/sac-sac/sac-sac", ["devicesettings/core"], function() {
	var sacInSac = function() {
		// SAC in SAC 실행
		// 로딩바
		var LoadingPanel = window.CommonLoadingPanel;
		var Loading = new LoadingPanel();
		var Util = window.Util;
		var moment = window.moment;
		var webSocket = window.CommonWebSocket;
		var receiveCallback;
		var I18N = window.I18N;
		var MainWindow = window.MAIN_WINDOW;
		var GlobalSettings = window.GlobalSettings;
		var productModel = GlobalSettings.getModel();

		// 다국어
		var SETTINGS_DEVICE_TYPE = I18N.prop("SETTINGS_DEVICE_TYPE");
		var SETTINGS_NETWORK_ID = I18N.prop("SETTINGS_NETWORK_ID");
		var SETTINGS_IP_ADDRESS = I18N.prop("SETTINGS_IP_ADDRESS");
		var SETTINGS_DEVICE_NAME = I18N.prop("SETTINGS_DEVICE_NAME");
		var SETTINGS_DEVICE_TIME = I18N.prop("SETTINGS_DEVICE_TIME");
		var SETTINGS_TRACKING_TIME = I18N.prop("SETTINGS_TRACKING_TIME");
		var SETTINGS_CONNECT = I18N.prop("SETTINGS_CONNECT");
		var SETTINGS_STATE_CONNECTED = I18N.prop("SETTINGS_STATE_CONNECTED");
		var SETTINGS_STATE_DISCONNECTED = I18N.prop("SETTINGS_STATE_DISCONNECTED");
		var SETTINGS_BTN_DETAIL = I18N.prop("SETTINGS_BTN_DETAIL");
		var SETTINGS_DEVICE_TAG_NAME = I18N.prop("SETTINGS_DEVICE_TAG_NAME");
		var SETTINGS_DEVICE_ID = I18N.prop("SETTINGS_DEVICE_ID");
		var SETTINGS_TYPE = I18N.prop("SETTINGS_TYPE");
		var SETTINGS_DEVICE_DESCRIPTION = I18N.prop("SETTINGS_DEVICE_DESCRIPTION");
		var COMMON_BTN_DETAIL = I18N.prop("COMMON_BTN_DETAIL");
		var SETTINGS_MESSAGE_CONFIRM_DELETE_SELECTED_DEVICE_LIST = I18N.prop("SETTINGS_MESSAGE_CONFIRM_DELETE_SELECTED_DEVICE_LIST");
		var SETTINGS_MESSAGE_CONFIRM_DELETE_SELECTED_MULTI_DEVICE_LIST;
		var SETTINGS_MESSAGE_NOTI_DELETED_SELECTED_DEVICE_LIST = I18N.prop("SETTINGS_MESSAGE_NOTI_DELETED_SELECTED_DEVICE_LIST");
		var SETTINGS_MESSAGE_NOTI_DELETED_SELECTED_MULTI_DEVICE_LIST;
		var COMMON_CONFIRM_DIALOG_EDIT_CANEL = I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_CANEL");
		var SETTINGS_MESSAGE_NOTI_FAILED_CHANGE_SAVE = I18N.prop("SETTINGS_MESSAGE_NOTI_FAILED_CHANGE_SAVE");
		var SETTINGS_MESSAGE_NOTI_FAILED_ADD_DEVICE = I18N.prop("SETTINGS_MESSAGE_NOTI_FAILED_ADD_DEVICE");
		var SETTINGS_MESSAGE_INFO_NOT_CONNECTED = I18N.prop("SETTINGS_MESSAGE_INFO_NOT_CONNECTED");
		var SETTINGS_MESSAGE_INFO_TRACKING = I18N.prop("SETTINGS_MESSAGE_INFO_TRACKING");
		var SETTINGS_MESSAE_NOTI_ALREADY_EXIST_NETWORK_ID = I18N.prop("SETTINGS_MESSAE_NOTI_ALREADY_EXIST_NETWORK_ID");
		var SETTINGS_MESSAE_NOTI_ALREADY_EXIST_NETWORK_IP = I18N.prop("SETTINGS_MESSAE_NOTI_ALREADY_EXIST_NETWORK_IP");
		var SETTINGS_MESSAE_NOTI_ALREADY_EXIST_DEVICE_NAME = I18N.prop("SETTINGS_MESSAE_NOTI_ALREADY_EXIST_DEVICE_NAME");
		var SETTINGS_MESSAGE_NOTI_ALREADY_RUN_UPDATE_INSTALLATION = I18N.prop("SETTINGS_MESSAGE_NOTI_ALREADY_RUN_UPDATE_INSTALLATION");
		var SETTINGS_MESSAGE_NOTI_FAILED_UPDATE_INSTALLATION_INFO_DEVICE = I18N.prop("SETTINGS_MESSAGE_NOTI_FAILED_UPDATE_INSTALLATION_INFO_DEVICE"); //실패한 기기:
		var SETTINGS_MESSAGE_NOTI_COMPLETE_UPDATE_INSTALLATION_INFO = I18N.prop("SETTINGS_MESSAGE_NOTI_COMPLETE_UPDATE_INSTALLATION_INFO"); //설치정보 갱신 성공
		var SETTINGS_MESSAGE_NOTI_FAILED_COMPLETE_UPDATE_INSTALLATION_INFO = I18N.prop("SETTINGS_MESSAGE_NOTI_FAILED_COMPLETE_UPDATE_INSTALLATION_INFO"); //설치정보 갱신 실패
		var SETTINGS_MESSAGE_NOTI_COMPLETE_UPDATE_TIME_INFO = I18N.prop("SETTINGS_MESSAGE_NOTI_COMPLETE_UPDATE_TIME_INFO"); //시간정보 갱신 성공
		var SETTINGS_MESSAGE_NOTI_FAILED_COMPLETE_UPDATE_TIME_INFO = I18N.prop("SETTINGS_MESSAGE_NOTI_FAILED_COMPLETE_UPDATE_TIME_INFO"); //시간정보 갱신 실패
		var SETTINGS_MESSAGE_INFO_ADDRESSING = I18N.prop("SETTINGS_MESSAGE_INFO_ADDRESSING");
		var SETTINGS_MESSAGE_INFO_DOWNLOADING = I18N.prop("SETTINGS_MESSAGE_INFO_DOWNLOADING");
		var SETTINGS_MESSAGE_INFO_EMERGENCYSTOP = I18N.prop("SETTINGS_MESSAGE_INFO_EMERGENCYSTOP");
		// var SETTINGS_MESSAGE_NOTI_CANNOT_INSERT_CONNECTION_DEVICE = I18N.prop("SETTINGS_MESSAGE_NOTI_CANNOT_INSERT_CONNECTION_DEVICE");
		// var SETTINGS_MESSAGE_NOTI_CANNOT_INPUT_EMPTY_NAME = I18N.prop("SETTINGS_MESSAGE_NOTI_CANNOT_INPUT_EMPTY_NAME");

		// Mockup for Device Type DropDownList options Data
		//var deviceTypeMockData = ["Wireless DDC", "DMS"];
		var deviceTypeMockData = ["S-Net SMART Controller", "DMS"];
		var popupDeviceTypeFilter = [];
		var popupDeviceTypeFilterForDDC = [{
			text: I18N.prop("SETTINGS_MENUCONFIGURE_DEVICE_ALL"),
			value: "All"
		},
		{
			text: I18N.prop("SETTINGS_AI"),
			value: "AI"
		}, {
			text: I18N.prop("SETTINGS_AO"),
			value: "AO"
		}, {
			text: I18N.prop("SETTINGS_DI"),
			value: "DI"
		}, {
			text: I18N.prop("SETTINGS_DO"),
			value: "DO"
		}, {
			text: I18N.prop("SETTINGS_MENUCONFIGURE_SAC_INDOOR"),
			value: "SAC Indoor"
		}, {
			text: I18N.prop("SETTINGS_MENUCONFIGURE_SAC_OUTDOOR"),
			value: "SAC Outdoor"
		}
		];
		var popupDeviceTypeFilterForDMS = [{
			text: I18N.prop("SETTINGS_MENUCONFIGURE_DEVICE_ALL"),
			value: "All"
		},
		{
			text: I18N.prop("SETTINGS_MENUCONFIGURE_SAC_INDOOR"),
			value: "SAC Indoor"
		}, {
			text: I18N.prop("SETTINGS_MENUCONFIGURE_SAC_OUTDOOR"),
			value: "SAC Outdoor"
		}, {
			text: I18N.prop("SETTINGS_ENERGY_METER"),
			value: "Energy Meter"
		}, {
			text: I18N.prop("SETTINGS_DI"),
			value: "DI"
		}, {
			text: I18N.prop("SETTINGS_DO"),
			value: "DO"
		}
		];
		var popupGridDeviceTypeDisplayDef = {
			"SAC Indoor": I18N.prop("SETTINGS_MENUCONFIGURE_SAC_INDOOR"),
			"SAC Outdoor": I18N.prop("SETTINGS_MENUCONFIGURE_SAC_OUTDOOR"),
			"Energy Meter": I18N.prop("SETTINGS_ENERGY_METER"),
			"DI": I18N.prop("SETTINGS_DI"),
			"DO": I18N.prop("SETTINGS_DO"),
			"AI": I18N.prop("SETTINGS_AI"),
			"AO": I18N.prop("SETTINGS_AO")
		};

		var popupPointTypeSelectorOptionsA = [{
			text: I18N.prop("SETTINGS_MENUCONFIGURE_POINT"),
			value: "Point"
		}, {
			text: I18N.prop("SETTINGS_MENUCONFIGURE_LIGHT"),
			value: "Light"
		}, {
			text: I18N.prop("SETTINGS_TEMPERATURE_SENSOR"),
			value: "Temperature Sensor"
		}, {
			text: I18N.prop("SETTINGS_HUMIDITY_SENSOR"),
			value: "Humidity Sensor"
		}, {
			text: I18N.prop("SETTINGS_MENUCONFIGURE_MOTION"),
			value: "Motion Sensor"
		}, {
			text: I18N.prop("SETTINGS_ENERGY_METER"),
			value: "Energy Meter"
		}];

		var popupPointTypeSelectorOptionsD = [{
			text: I18N.prop("SETTINGS_MENUCONFIGURE_POINT"),
			value: "Point"
		}, {
			text: I18N.prop("SETTINGS_MENUCONFIGURE_LIGHT"),
			value: "Light"
		}, {
			text: I18N.prop("SETTINGS_MENUCONFIGURE_MOTION"),
			value: "Motion Sensor"
		}];

		// Order value depending on device type in SAC Popup
		var deviceTypeOrderingDefinition = {
			"AirConditionerController.DMS": {
				"SAC Indoor": 0,
				"SAC Outdoor": 1,
				"Energy Meter": 2,
				"DI": 3,
				"DO": 4
			},
			"AirConditionerController.WirelessDDC": {
				"AI": 0,
				"AO": 1,
				"DI": 2,
				"DO": 3,
				"SAC Indoor": 4,
				"SAC Outdoor": 5
			}
		};

		var commonSacTab = $("#setting-sac-tab");
		var sacInSacTab = commonSacTab.find(".tabbtn-sac-sac");

		// DropDownList
		var deviceTypeSelectorElem = $(".sac-sac-device-type-selector");
		var deviceTypeSelector;
		var deviceTypeData = [];
		var addDeviceType = "DMS";

		// Device Grid
		var deviceListGrid = $(".sac-sac-device-grid");
		var deviceListGridData;
		var noDeviceText = $(".sac-sac-device-grid").find(".no-device-list").text("No device. Please add device");

		// 선택된 아이템
		var selectedDeviceType = [];
		var curIndex;

		// Button
		var addDeviceBtn = $(".sac-sac-content [data-event=adddevice]");
		var updateTimeBtn = $(".sac-content-box-btn [data-event=updatetime]");
		var updateInstallBtn = $(".sac-content-box-btn [data-event=updateinstall]");
		var deleteDeviceBtn = $(".sac-content-box-btn [data-event=deletedevice]");

		// Input Network Info
		var networkInput = $(".sac-sac-content.adddevice input[data-role=inputnetwork]");

		// Popup창
		var popupWindow = $("#popup-sac-sac-device");
		var popupHeaderInfo = $(".popup-header-info");
		var currentPopupDeviceType;
		var popupGrid = $("#popup-sac-sac-device").find(".popup-detail-device-grid");
		var popupGridData = [];
		var popupDeviceTypeSelector = $("#popup-sac-sac-device .device-type-selector");
		var popupPointTypeSelector;
		var popupNetworkIdInput = $("#popup-sac-sac-device").find(".popup-container").find("input[data-role=networkid]");
		var popupIpAddressSpan = $("#popup-sac-sac-device").find(".popup-container").find("span[data-role=ipaddress]");
		var popupIpAddressInput = $("#popup-sac-sac-device").find(".popup-container").find("input[data-role=ipaddressinput]");
		var popupNameInput = $("#popup-sac-sac-device").find(".popup-container").find("input[data-role=name]");
		var isValidPopupId, isValidPopupIp, isValidPopupName; // input validator
		var isValidPopupGridName, isValidPopupGridDesc;
		var changedPopupDataUid = [];
		var changedPopupData = [];

		// Popup창 버튼
		var popupCloseBtn = $("#popup-sac-sac-device").find(".popup-footer").find("button[data-event=close]");
		var popupSaveBtn = $("#popup-sac-sac-device").find(".popup-footer").find("button[data-event=save]");

		// Confirm, message 요소
		var popupConfirmElem = $("#popup-sac-sac-device-confirm");
		var popupMessageElem = $("#popup-sac-sac-device-message");
		var popupMessageDeviceUpdateElem = $("#popup-sac-sac-device-update-message");
		var popupConfirm, popupMessage, popupMessageDeviceUpdate;

		var receiveMsg = false;


		/**
		 *
		 *   SAC 설정 탭 페이지가 로드될 때 호출되어 초기화를 시행한다.
		 *
		 *   @function init
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		var init = function() {
			initComponent();
			initPopup();
		};


		/**
		 *
		 *   SAC 설정 탭에 사용되는 컴포넌트를 초기화 한다.
		 *
		 *   @function initComponent
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		var initComponent = function() {
			sacInSacTab.on("click", function() {
				//Floor Navigation 비활성화
				MainWindow.disableFloorNav(true);
			});

			// 탭 초기화
			// commonSacTab.kendoCommonTabStrip();

			// dropDownList
			if (productModel === "Lite") { deviceTypeMockData.splice(0, 1); }
			deviceTypeSelectorElem.kendoDropDownList({
				dataSource: deviceTypeMockData,
				value: "DMS",
				change: function(e) {
					addDeviceType = this.value();
					if (addDeviceType != "") {
						checkNetworkInput(networkInput);
					}
				}
			});
			deviceTypeSelector = deviceTypeSelectorElem.data("kendoDropDownList");

			// button 초기화
			addDeviceBtn.kendoButton().data("kendoButton").enable(false);
			updateTimeBtn.kendoButton().data("kendoButton").enable(false);
			updateInstallBtn.kendoButton().data("kendoButton").enable(false);
			deleteDeviceBtn.kendoButton().data("kendoButton").enable(false);

			// 초기 Network ID or IP 입력 input 이벤트 바인딩
			networkInput.on("focusin", function() {
				checkNetworkInput($(this));
			});


			// Device Grid 초기화
			deviceListGrid.kendoGrid({
				scrollable: true,
				// height: "100%",
				columns: setGridColumns()
			});
			deviceListGridData = deviceListGrid.data("kendoGrid");

			// 컨펌창 및 메시지창 초기화
			popupConfirmElem.kendoCommonDialog({
				type: "confirm"
			});
			popupConfirm = popupConfirmElem.data("kendoCommonDialog");
			popupMessageElem.kendoCommonDialog();
			popupMessage = popupMessageElem.data("kendoCommonDialog");
			popupMessageDeviceUpdateElem.kendoCommonDialog({
				timeout: false
			});
			popupMessageDeviceUpdate = popupMessageDeviceUpdateElem.data("kendoCommonDialog");


			// 웹소켓 receive 이벤트 등록
			webSocket.on("receive", function(data) {
				// console.log("RECEIVE1");
				if (receiveMsg) {
					// console.log("RECEIVE2");
					receiveCallback(data);
					//receiveCallback = null;
				}
			});
		};


		/**
		 *
		 *   SAC 설정 탭에 사용되는 컴포넌트를 초기화 한다.
		 *
		 *   @param {String} networkId - 현재 선택된 기기의 Network ID
		 *   @function bindData
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		var bindData = function(networkId) {
			/* Device List 조회 */
			deviceTypeData = [];
			Loading.open();
			$.ajax({
				url: "/shvacRegistrations"
			}).done(function(data) {
				var i;
				for (i = 0; i < data.length; i++) {
					var tmp = data[i];
					if (tmp.dms_devices_registrationStatus != "Deleted") {
						deviceTypeData.push(tmp);
					}
				}

				// Device List에 아이템 유무 분기
				if (deviceTypeData.length > 0) {
					deviceListGridData.dataSource.data(deviceTypeData);
					noDeviceText.hide();
				} else {
					noDeviceText.show();
				}

				//팝업창이 열려있는 경우 기기데이터 반영
				if (popupWindow.data("kendoPopupSingleWindow").options.visible) {
					Loading.open(popupWindow);
					$.ajax({
						url: "/dms/devices?parentId=" + networkId + "&attributes=id,name,type,mappedType,description,controlPoint-tagName&registrationStatuses=Registered,NotRegistered"
					}).done(function(resp) {
						// Attach ordering value to each data for defined device types
						for (i = 0; i < resp.length; i++) {
							resp[i].orderingValue = deviceTypeOrderingDefinition[currentPopupDeviceType][Util.getDetailDisplayType(resp[i].type)];
							if (typeof resp[i].controlPoint == 'undefined' || typeof resp[i].controlPoint.tagName == 'undefined') {
								resp[i].tagName = "-";
							} else {
								resp[i].tagName = resp[i].controlPoint.tagName;
							}
						}

						popupGridData = resp;
						popupGrid.data("kendoGrid").dataSource.data(popupGridData);

						// DataSource Sort according to order value and tag name
						popupGrid.data("kendoGrid").dataSource.sort([{
							field: "orderingValue",
							dir: "asc"
						},
						{
							field: "id",
							dir: "asc"
						}
						]);
						Loading.close(popupWindow);
					}).fail(function() {
						Loading.close(popupWindow);
						popupMessage.message(data.responseText);
						popupMessage.open();
					});
				}
				var checkAllDeviceBox = deviceListGrid.find("[data-event=devicecheckall]");
				checkAllDeviceBox.prop("checked", false);
				updateTimeBtn.kendoButton().data("kendoButton").enable(false);
				updateInstallBtn.kendoButton().data("kendoButton").enable(false);
				deleteDeviceBtn.kendoButton().data("kendoButton").enable(false);
			}).fail(function(data) {
				popupMessage.message(data.responseText);
				popupMessage.open();
			}).always(function() {
				Loading.close();
			});
		};


		/**
		 *
		 *   SAC 설정 탭 페이지의 메인 윈도우 상의 UI요소에 이벤트를 등록한다.
		 *
		 *   @function attachEvent
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// SAC 메인 윈도우 이벤트 바인딩 - Update time info, update install info, Delete
		var attachEvent = function() {
			deviceTypeSelector.bind("change", function(e) {
				var value = this.value();
				var inputIdOrIp = $(".sac-sac-content.adddevice input[data-role=inputnetwork]");
				if (value == "DMS") {
					inputIdOrIp.attr("placeholder", "IP Address");
				} else if (value == "S-Net SMART Controller") {
					inputIdOrIp.attr("placeholder", "Network ID");
				}
			});

			// Add Device
			addDeviceBtn.on("click", function() {
				/* 중복체크 필요 */
				if (addDeviceType !== "") {
					addDeviceToList(networkInput.val());
				}
			});

			// update time
			updateTimeBtn.on("click", function() {
				Loading.open();
				var dataArray = [], i;
				for (i = 0; i < selectedDeviceType.length; i++) {
					var item = deviceListGridData.dataSource.data().at(selectedDeviceType[i]);
					var obj = {
						"dms_devices_id": item.dms_devices_id,
						"synchronizeCurrentTime": true
					};
					dataArray.push(obj);
				}

				$.ajax({
					url: "/shvacRegistrations",
					method: "PATCH",
					data: dataArray
				}).done(function(data) {
					var respData = data;
					var popMsg;
					var has204 = false; //204 존재 여부
					var has412 = false; //412 존재 여부

					// 응답 데이터에 204 혹은 412 체크
					for (i = 0; i < respData.length; i++) {
						if (respData[i].code == 204) { //body에 204 코드 있는지
							has204 = true;
						} else if (respData[i].code == 412) { //body에 412 코드 있는지
							has412 = true;
						}
					}
					Loading.close();

					if (has412) { // 412가 존재하는 경우 팝업창에 기기 + 이유
						popMsg = resultMsgOnUpdateInstallation(dataArray, respData, "synchronizeCurrentTime");
						if (has204) { // 412와 함께 204가 존재하는 경우
							popMsg = "<div class='device-update-info-message'>" + SETTINGS_MESSAGE_NOTI_COMPLETE_UPDATE_TIME_INFO + "</div>" + popMsg;
						} else { // 412만 존재하는 경우
							popMsg = "<div class='device-update-info-message'>" + SETTINGS_MESSAGE_NOTI_FAILED_COMPLETE_UPDATE_TIME_INFO + "</div>" + popMsg;
						}
					} else { // 412 존재하지 않는 경우
						popMsg = SETTINGS_MESSAGE_NOTI_COMPLETE_UPDATE_TIME_INFO;
					}
					popupMessageDeviceUpdate.message(popMsg);
					popupMessageDeviceUpdate.open();
					//메인 그리드 리로딩
					reloadSacGrid();
				}).fail(function(data) {
					Loading.close();
					popupMessage.message(data.responseText);
					popupMessage.open();
				}).always(function() {});
			});

			// update install
			updateInstallBtn.on("click", function() {
				Loading = new LoadingPanel();
				Loading.open();
				var dataArray = [];
				for (var i = 0; i < selectedDeviceType.length; i++) {
					var item = deviceListGridData.dataSource.data().at(selectedDeviceType[i]);
					var obj = {
						"dms_devices_id": item.dms_devices_id,
						"updateInstallationInformation": true
					};
					dataArray.push(obj);
				}

				receiveMsg = true;
				$.ajax({
					url: "/shvacRegistrations",
					method: "PATCH",
					data: dataArray
				}).done(function(data) {
					var repData = data;
					updateDeviceStatus("CompleteUpdateInstallationInfo", dataArray, repData);
				}).fail(function(res) {
					Loading.close();
					//console.log(res);
					if (res.status == 423) {
						popupMessage.message(SETTINGS_MESSAGE_NOTI_ALREADY_RUN_UPDATE_INSTALLATION);
					} else {
						popupMessage.message(res.responseText);
					}
					popupMessage.open();
				}).always(function() {
					//console.log("ALWAYS");
				});
			});

			// delete
			deleteDeviceBtn.on("click", function() {
				var length = selectedDeviceType.length;
				// var data = deviceListGridData.dataSource.data();
				var text;

				SETTINGS_MESSAGE_CONFIRM_DELETE_SELECTED_MULTI_DEVICE_LIST = I18N.prop("SETTINGS_MESSAGE_CONFIRM_DELETE_SELECTED_MULTI_DEVICE_LIST", length);
				SETTINGS_MESSAGE_NOTI_DELETED_SELECTED_MULTI_DEVICE_LIST = I18N.prop("SETTINGS_MESSAGE_NOTI_DELETED_SELECTED_MULTI_DEVICE_LIST", length);

				if (length === 1) {
					text = SETTINGS_MESSAGE_CONFIRM_DELETE_SELECTED_DEVICE_LIST;
				} else if (length > 1) {
					text = SETTINGS_MESSAGE_CONFIRM_DELETE_SELECTED_MULTI_DEVICE_LIST;
				}

				popupConfirm.message(text);
				popupConfirm.setConfirmActions({
					yes: function(e) {
						Loading.open();
						var dataArray = [], i, item;
						for (i = 0; i < selectedDeviceType.length; i++) {
							item = deviceListGridData.dataSource.data().at(selectedDeviceType[i]);
							var obj = {
								"dms_devices_id": item.dms_devices_id,
								"dms_devices_registrationStatus": "Deleted"
							};
							dataArray.push(obj);
						}

						$.ajax({
							url: "/shvacRegistrations",
							method: "PATCH",
							data: dataArray
						}).done(function() {
							for (i = length - 1; i >= 0; i--) {
								item = deviceListGridData.dataSource.at(selectedDeviceType[i]);
								deviceListGridData.dataSource.remove(item);
							}
							if (deviceListGridData.dataSource.data().length == 0) {
								var checkAllDeviceBox = $(".sac-sac-device-grid").find("[data-event=devicecheckall]");
								checkAllDeviceBox.prop("checked", false);
							}
							selectedDeviceType = [];
							if (length == 1) {
								popupMessage.message(SETTINGS_MESSAGE_NOTI_DELETED_SELECTED_DEVICE_LIST);
							} else {
								popupMessage.message(SETTINGS_MESSAGE_NOTI_DELETED_SELECTED_MULTI_DEVICE_LIST);
							}
							popupMessage.open();
						}).fail(function(data) {
							popupMessage.message(data.responseText);
							popupMessage.open();
						}).always(function() {
							Loading.close();
						});
					}
				});
				popupConfirm.open();
			});
		};


		/**
		 *
		 *   SAC 설정 탭 메인 윈도우 상의 그리드 내부 UI 요소에 이벤트를 등록한다.
		 *
		 *   @param {Object} grid - 이벤트를 등록할 그리드 요소 객체
		 *   @function attachEventInGrid
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 그리드 내부 요소 이벤트 바인딩 - 전체 체크박스, 단일 체크박스, 디테일 아이콘 버튼
		var attachEventInGrid = function(grid) {
			var checkAllDeviceBox = grid.find("[data-event=devicecheckall]");
			var checkDeviceBox = grid.find("[data-event=devicecheck]");
			var detailIcon = grid.find("[data-event=devicedetail]");

			// 체크박스 아이디 부여
			for (var i = 0; i < checkDeviceBox.length; i++) {
				checkDeviceBox.eq(i).attr("id", "sac-sac-device-check" + i);
				checkDeviceBox.eq(i).siblings("label").attr("for", "sac-sac-device-check" + i);
			}

			// 멀티체크박스 이벤트 바인딩
			checkAllDeviceBox.on('click', function() {
				var elem = $(this);
				// selectedAlarms.splice(0, alarmData.length);
				selectedDeviceType = [];
				if (elem.is(":checked")) {
					checkDeviceBox.each(function(index, e) {
						e.checked = true;
						selectedDeviceType.push(index);
						checkSelectedDevice();
					});
				} else {
					checkDeviceBox.each(function(index, e) {
						e.checked = false;
						selectedDeviceType = [];
						checkSelectedDevice();
					});
				}
				sortArrayAsc(selectedDeviceType);
			});

			// 단일체크박스 이벤트 바인딩
			checkDeviceBox.on("click", function() {
				var elem = $(this);
				var index = checkDeviceBox.index(this);

				if (elem.is(":checked")) {
					curIndex = index;
					selectedDeviceType.push(curIndex);
				} else {
					checkAllDeviceBox.checked = false;
					selectedDeviceType = $.grep(selectedDeviceType, function(value) {
						return value != index;
					});
				}
				sortArrayAsc(selectedDeviceType);
				if (selectedDeviceType.length < deviceTypeData.length) {
					checkAllDeviceBox.prop("checked", false);
				} else if (selectedDeviceType.length == deviceTypeData.length) {
					checkAllDeviceBox.prop("checked", true);
				}
				checkSelectedDevice();
			});

			// 디테일 아이콘 이벤트 바인딩
			detailIcon.on("click", function(e) {
				var elem = $(e.target);
				var index = elem.closest("tbody").find("tr").index(elem.closest("tr"));
				curIndex = index;
				showInfo(popupWindow, curIndex); // 팝업창 요소, 인덱스를 인자로 넘긴다.
			});
		};


		/**
		 *
		 *   팝업창 및 팝업창 내부 컴포넌트를 초기화한다.
		 *
		 *   @function initPopup
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 팝업창 초기화
		var initPopup = function() {
			// 팝업창
			popupWindow.kendoPopupSingleWindow({
				title: COMMON_BTN_DETAIL,
				width: 1500,
				height: 800
			});

			// close 버튼 기본 이벤트 삭제
			popupCloseBtn.unbind("click");

			// 팝업창 내부 input validator 초기화
			isValidPopupId = popupNetworkIdInput.kendoCommonValidator({
				type: "networkId"
			}).data("kendoCommonValidator");
			isValidPopupIp = popupIpAddressInput.kendoCommonValidator({
				type: "ipAddress"
			}).data("kendoCommonValidator");
			isValidPopupName = popupNameInput.kendoCommonValidator({
				type: "name"
			}).data("kendoCommonValidator");

			// input keyup binding
			popupWindow.find(".popup-container").find(".popup-detail-row input.k-input").on("keyup", function(e) {
				popupSaveBtn.kendoButton().data("kendoButton").enable(true);
			});

			// 팝업창 > Device type selector
			popupDeviceTypeSelector.kendoDropDownList({
				dataSource: [],
				value: I18N.prop("SETTINGS_MENUCONFIGURE_DEVICE_ALL"),
				dataTextField: "text",
				dataValueField: "value",
				change: function() {
					if (popupGrid.data("kendoGrid").dataSource.data().length < 1) return; //YH
					var value = this.value();
					var obj = {
						type: value
					};
					applyFilter(popupGrid, obj);
				}
			});

			// 팝업창 > 그리드
			popupGrid.kendoGrid({
				scrollable: true,
				sortable: true,
				height: 450,
				columns: [],
				dataSource: []
			});
			//popupGrid.data("kendoGrid").dataSource.sort([{
			//    field: "tagName",
			//    compare: function(a, b) {
			//        var aTagName = a.tagName;
			//        var bTagName = b.tagName;
			//        return aTagName.localeCompare(bTagName);
			//    }
			//}]);
		};


		/**
		 *
		 *   팝업창 오픈 시 하위기기 데이터를 요청 및 응답받아 디스플레이 한다.
		 *
		 *   @param {Number} index - 기기 목록 그리드에서 선택된 기기 데이터의 인덱스
		 *   @function dataBindPopup
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 팝업창 데이터 바인딩
		var dataBindPopup = function(index) {
			// 선택된 데이터
			var curData = deviceListGridData.dataSource.data().at(index);
			currentPopupDeviceType = curData.dms_devices_type;
			popupWindow.attr("device-type", currentPopupDeviceType);

			// 팝업창 내부 그리드 데이터 로딩
			Loading.open(popupWindow);
			$.ajax({
				url: "/dms/devices?parentId=" + curData.dms_devices_id + "&attributes=id,name,type,mappedType,description,controlPoint-tagName&registrationStatuses=Registered,NotRegistered"
			}).done(function(data) {
				var i;
				// Attach ordering value to each data for defined device types
				for (i = 0; i < data.length; i++) {
					// var deviceCategory = data[i].type;
					data[i].orderingValue = deviceTypeOrderingDefinition[currentPopupDeviceType][Util.getDetailDisplayType(data[i].type)];
				}

				// Set Columns
				popupGrid.data("kendoGrid").setOptions({
					columns: setPopupGridColumns(curData.dms_devices_type)
				});

				// 팝업 헤더  정보 데이터 바인딩
				// popupHeaderInfo.text(Util.getDisplayType(curData.dms_devices_type) + " ("+ data.length +")");
				popupHeaderInfo.find("span.device-name").text(Util.getDetailDisplayType(curData.dms_devices_type));
				if (curData.dms_devices_type == "AirConditionerController.WirelessDDC") {
					popupHeaderInfo.find("span.device-name").text("S-Net SMART Controller");
				}
				popupHeaderInfo.find("span.device-count").text(" (" + data.length + ")");

				// Network ID
				popupNetworkIdInput.val(curData.dms_devices_id);
				popupNetworkIdInput.data("data-origin", curData.dms_devices_id);

				// IP ADDRESS
				if (curData.dms_devices_type == "AirConditionerController.WirelessDDC") {
					popupIpAddressInput.hide();
					popupIpAddressSpan.show();
					if (curData.dms_devices_networks_ethernet_ipAddress === null) {
						popupIpAddressSpan.text("-");
					} else {
						popupIpAddressSpan.text(curData.dms_devices_networks_ethernet_ipAddress);
					}

					popupIpAddressSpan.data("data-origin", curData.dms_devices_networks_ethernet_ipAddress);
				} else if (curData.dms_devices_type == "AirConditionerController.DMS") {
					popupIpAddressSpan.hide();
					popupIpAddressInput.show();
					popupIpAddressInput.val(curData.dms_devices_networks_ethernet_ipAddress);
					popupIpAddressInput.data("data-origin", curData.dms_devices_networks_ethernet_ipAddress);
				}

				// Name
				popupNameInput.val(curData.dms_devices_name);
				popupNameInput.data("data-origin", curData.dms_devices_name);

				// 디바이스 타입 필터 소스 정의 후 바인딩
				popupDeviceTypeFilter = [];
				if (curData.dms_devices_type == "AirConditionerController.WirelessDDC") {
					popupDeviceTypeFilter = popupDeviceTypeFilterForDDC;
				} else if (curData.dms_devices_type == "AirConditionerController.DMS") {
					popupDeviceTypeFilter = popupDeviceTypeFilterForDMS;
				}
				popupDeviceTypeSelector.data("kendoDropDownList").dataSource.data(popupDeviceTypeFilter);
				popupDeviceTypeSelector.data("kendoDropDownList").value("All");
				popupDeviceTypeSelector.data("kendoDropDownList").trigger("change");

				// 팝업창 내부 그리드 데이터 바인딩
				for (i = 0; i < data.length; i++) {
					if (typeof data[i].controlPoint == 'undefined' || typeof data[i].controlPoint.tagName == 'undefined') {
						data[i].tagName = "-";
					} else {
						data[i].tagName = data[i].controlPoint.tagName;
					}
				}
				popupGridData = data;
				popupGrid.data("kendoGrid").dataSource.data(popupGridData);

				// DataSource Sort according to order value and tag name
				popupGrid.data("kendoGrid").dataSource.sort([{
					field: "orderingValue",
					dir: "asc"
				},
				{
					field: "id",
					dir: "asc"
				}
				]);

				// 팝업창 내부 그리드 인풋 validator 초기화
				isValidPopupGridName = popupGrid.find("input[data-role=devicetagname]").kendoCommonValidator({
					type: "name"
				}).data("kendoCommonValidator");
				isValidPopupGridDesc = popupGrid.find("input[data-role=devicedescription]").kendoCommonValidator({
					type: "description"
				}).data("kendoCommonValidator");

				Loading.close(popupWindow);
			}).fail(function(data) {
				popupMessage.message("<p class='pop-confirm-message'>" + data.responseText + "</p>");
				popupMessage.open();
			}).always(function() {
				Loading.close(popupWindow);
			});

			// 새로운 데이터를 바인딩하고 새로운 팝업을 열때마다 SAVE 버튼은 DIMMED
			popupSaveBtn.data("kendoButton").enable(false);
		};


		/**
		 *
		 *   팝업창 내부 윈도우 UI 요소에 이벤트를 등록한다.
		 *
		 *   @function attachEventInPopup
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 팝업창 이벤트 바인딩
		var attachEventInPopup = function() {
			// 팝업창 내부 input 필드 change 이벤트(Network ID / IP 주소 / 이름 / 그리드 내부)
			var saveBtn = popupWindow.find('.popup-footer button[data-event=save]').data("kendoButton");
			// var divPopupDetail = popupWindow.find(".popup-detail-row");
			// var inputNetworkId = divPopupDetail.find(".k-input[data-role=networkid]"),
			// 	inputName = divPopupDetail.find(".k-input[data-role=name]");
			var grid = popupWindow.find('.popup-detail-device-grid').data('kendoGrid');

			popupWindow.on('keyup', '.k-input.common-validator', function(e){
				var self = $(e.target);
				var selfValidator = self.data('kendoCommonValidator');
				var isInGrid = (self.closest('tr').length > 0);
				var deviceType = popupWindow.attr('device-type');
				var inputElems = popupWindow.find('.k-input.common-validator');
				var i = 0, max = inputElems.length;
				var elem = null, validator = null, isValid = true, dataRole = '';

				// validator true 라면 변경된 uid 배열에 push
				if(isInGrid && selfValidator && selfValidator.validate()){
					getChangedDataUid(grid, self[0]);
				}

				// validator 체크
				for(i = 0; i < max; i++){
					elem = inputElems.eq(i);
					dataRole = elem.data('role');
					validator = elem.data('kendoCommonValidator');

					if(deviceType.indexOf('WirelessDDC') > -1){
						if(dataRole != "ipaddressinput"){
							if(!validator.validate()){
								isValid = false;
								break;
							}
						}
					}else if(!validator.validate()){
						isValid = false;
						break;
					}
				}
				saveBtn.enable(isValid);
			});

			// 팝업창 SAVE
			popupWindow.data("kendoPopupSingleWindow").addEventToFactory("#popup-sac-sac-device .popup-footer button[data-event=save]", "sacDetailPopupSave", function(e) {
				var target = $(e.target);
				var canSave = true;
				var myWindow = $("#popup-sac-sac-device");
				var deviceType = Util.getOriginalType(myWindow.find(".popup-header-info").find("span.device-name").text());
				var trElem = popupGrid.data("kendoGrid").tbody.find("tr");
				var inputPopupGridName = trElem.find("input[data-role=devicetagname]");
				var inputPopupGridDes = trElem.find("input[data-role=devicedescription]");
				var originNetworkId, networkId, originIp, ip, originName, name;
				var dmsObj = {};
				popupGridData = popupGrid.data("kendoGrid").dataSource;

				/* Validator 체크 */
				if (deviceType == "AirConditionerController.WirelessDDC") { // ip를 편집할 수 없음.
					if (isValidPopupId.validate() == false || isValidPopupName.validate() == false) {
						canSave = false;
					}
					if (isValidPopupGridName && isValidPopupGridDesc) {
						if (isValidPopupGridName.validate() == false || isValidPopupGridDesc.validate() == false) {
							canSave = false;
						}
					}
				} else if (deviceType == "AirConditionerController.DMS") { // ip를 편집할 수 있음.
					if (isValidPopupId.validate() == false || isValidPopupIp.validate() == false || isValidPopupName.validate() == false) {
						canSave = false;
					}
					if (isValidPopupGridName && isValidPopupGridDesc) {
						for (var x = 0; x < trElem.length; x++) {
							var isValidName = inputPopupGridName.eq(x).data("kendoCommonValidator").validate();
							var isValidDes = inputPopupGridDes.eq(x).data("kendoCommonValidator").validate();
							if (isValidName == false || isValidDes == false) {
								canSave = false;
							}
						}
					}
				}

				if (canSave == false) {
					//openNotSavePopup("change");
					return false;
				}

				/* 팝업창 내부 그리드 */
				if (changedPopupDataUid.length > 0) { // 그리드 내부에 수정이 발생했다면,
					// 속해있는 하위 Device 정보 반영
					for (var i = 0; i < changedPopupDataUid.length; i++) {
						var uid = changedPopupDataUid[i];
						var tmpTr = popupGrid.data("kendoGrid").table.find("tr[data-uid=" + uid + "]");
						var tmpData = popupGrid.data("kendoGrid").dataSource.getByUid(uid);
						var type, des;
						// var index = popupGrid.data("kendoGrid").table.find("tr").index(tmpTr);
						//var type = tmpTr.find("td .k-dropdown .k-dropdown-wrap").find("span.k-input").text();
						name = tmpTr.find("td input[data-role=devicetagname]").val();

						if (tmpTr.find("[data-role=point-type-selector]").data("kendoDropDownList")) {
							type = tmpTr.find("[data-role=point-type-selector]").data("kendoDropDownList").value();
						} else {
							// type = undefined;
							type = null;
						}

						des = tmpTr.find("td input[data-role=devicedescription]").val();
						tmpData.name = name;
						if (type == "Energy Meter") {
							type = "WattHour";
						}
						tmpData.mappedType = Util.getOriginalType(type);
						tmpData.description = des;
						var obj = {
							"id": tmpData.id,
							"name": tmpData.name,
							"mappedType": tmpData.mappedType,
							"description": tmpData.description
						};
						if (typeof obj.mappedType == 'undefined') {
							delete obj.mappedType;
						}
						changedPopupData.push(obj);
					}
					//console.log(changedPopupData);

					if (canSave) {
						// console.log("CAN SAVE@!!!");
						Loading.open(myWindow);
						$.ajax({
							url: "/dms/devices",
							method: "PATCH",
							data: changedPopupData
						}).done(function() {
							Loading.close(myWindow);
							popupGridData.data(popupGridData.data()); // 그리드에 반영

							// Attach ordering value to each data for defined device types
							for (var a = 0; a < popupGridData.data().length; a++) {
								var tmpPopupGridData = popupGridData.data()[a];
								// var deviceCategory = tmpPopupGridData.type
								tmpPopupGridData.orderingValue = deviceTypeOrderingDefinition[currentPopupDeviceType][Util.getDetailDisplayType(tmpPopupGridData.type)];
							}

							target.data('kendoButton').enable(false); // save버튼 Dimmed

							/* 팝업 상단 부분 */
							networkId = myWindow.find("input[data-role=networkid]").val(); // network ID
							originNetworkId = myWindow.find("input[data-role=networkid]").data("data-origin"); // original network ID
							name = myWindow.find("input[data-role=name]").val(); // device Name
							originName = myWindow.find("input[data-role=name]").data("data-origin"); // original device Name

							// DDC 또는 DMS 수정사항 데이터 값을 읽어들인다.
							if (deviceType == "AirConditionerController.WirelessDDC") { // ip를 편집할 수 없음.
								ip = myWindow.find("span[data-role=ipaddress]").text();
								originIp = myWindow.find("span[data-role=ipaddress]").data("data-origin");
							} else if (deviceType == "AirConditionerController.DMS") { // ip를 편집할 수 있음.
								ip = myWindow.find("input[data-role=ipaddressinput]").val(); // ip
								originIp = myWindow.find("input[data-role=ipaddressinput]").data("data-origin");
							}

							if (networkId != originNetworkId) {
								dmsObj["dms_devices_id"] = networkId;
							}
							if (name != originName) {
								dmsObj["dms_devices_name"] = name;
							}
							if (ip != originIp) {
								dmsObj["dms_devices_networks_ethernet_ipAddress"] = ip;
							}

							if (deviceType == "AirConditionerController.WirelessDDC") {
								delete dmsObj.dms_devices_networks_ethernet_ipAddress; // PATCH할 객체의 ip주소값을 제거
							}

							Loading.open(myWindow);
							// 중복체크
							$.ajax({
								url: "/shvacRegistrations"
							}).done(function(data) {
								// 중복체크
								for (var idx = 0; idx < data.length; idx++) {
									var tmp = data[idx];
									if (networkId != originNetworkId) { //NetworkId를 변경한 경우
										if (networkId == tmp["dms_devices_id"]) { //이미 값이 있을 경우
											Loading.close(myWindow);
											popupMessage.message(SETTINGS_MESSAE_NOTI_ALREADY_EXIST_NETWORK_ID);
											popupMessage.open();
											return false;
										}
									}
									if (ip != originIp) { //ip를 변경한 경우
										if (ip == tmp["dms_devices_networks_ethernet_ipAddress"]) { //이미 값이 있을 경우
											Loading.close(myWindow);
											popupMessage.message(SETTINGS_MESSAE_NOTI_ALREADY_EXIST_NETWORK_IP);
											popupMessage.open();
											return false;
										}
									}
									if (name != originName) { //name을 변경한 경우
										if (name == tmp["dms_devices_name"]) { //이미 값이 있는 경우
											Loading.close(myWindow);
											popupMessage.message(SETTINGS_MESSAE_NOTI_ALREADY_EXIST_DEVICE_NAME);
											popupMessage.open();
											return false;
										}
									}
								}

								// 목록의 디바이스 Network ID 값이 중복되지 않는 경우 save 실행
								$.ajax({
									url: "/shvacRegistrations/" + originNetworkId,
									method: "PATCH",
									data: dmsObj
								}).done(function() {
									//팝업 상단 부분 데이터 갱신
									myWindow.find("input[data-role=networkid]").data("data-origin", dmsObj["dms_devices_id"]); // original network ID
									myWindow.find("input[data-role=name]").data("data-origin", dmsObj["dms_devices_name"]); // original device Name

									// DDC 또는 DMS 수정사항 데이터 값을 읽어들인다.
									if (deviceType == "AirConditionerController.WirelessDDC") {
										myWindow.find("span[data-role=ipaddress]").data("data-origin", dmsObj["dms_devices_networks_ethernet_ipAddress"]);
									} else if (deviceType == "AirConditionerController.DMS") {
										myWindow.find("input[data-role=ipaddressinput]").data("data-origin", dmsObj["dms_devices_networks_ethernet_ipAddress"]);
									}
									bindData(networkId); // 메인 그리드 리로드
								}).fail(function() {
									Loading.close(myWindow);
									openNotSavePopup(data);
								}).always(function() {
									//Loading.close(myWindow);
								});
							}).fail(function(data) {
								Loading.close(myWindow);
								openNotSavePopup(data);
							}).always(function() {});
						}).fail(function(data) {
							openNotSavePopup(data);
							Loading.close(myWindow);
						}).always(function() {
							//Loading.close(myWindow);
							target.data('kendoButton').enable(false); // save버튼 Dimmed
							changedPopupDataUid = [];
							changedPopupData = [];
						});
					}
				} else { // 그리드 내부에 수정이 발생하지 않았다면,
					/* 팝업 상단 부분 */
					networkId = myWindow.find("input[data-role=networkid]").val(); // network ID
					originNetworkId = myWindow.find("input[data-role=networkid]").data("data-origin"); // original network ID
					name = myWindow.find("input[data-role=name]").val(); // device Name
					originName = myWindow.find("input[data-role=name]").data("data-origin"); // original device Name

					// DDC 또는 DMS 수정사항 데이터 값을 읽어들인다.
					if (deviceType == "AirConditionerController.WirelessDDC") { // ip를 편집할 수 없음.
						ip = myWindow.find("span[data-role=ipaddress]").text();
						originIp = myWindow.find("span[data-role=ipaddress]").data("data-origin");
					} else if (deviceType == "AirConditionerController.DMS") { // ip를 편집할 수 있음.
						ip = myWindow.find("input[data-role=ipaddressinput]").val(); // ip
						originIp = myWindow.find("input[data-role=ipaddressinput]").data("data-origin");
					}

					if (networkId != originNetworkId) {
						dmsObj["dms_devices_id"] = networkId;
					}
					if (name != originName) {
						dmsObj["dms_devices_name"] = name;
					}
					if (ip != originIp) {
						dmsObj["dms_devices_networks_ethernet_ipAddress"] = ip;
					}

					if (deviceType == "AirConditionerController.WirelessDDC") {
						delete dmsObj.dms_devices_networks_ethernet_ipAddress; // PATCH할 객체의 ip주소값을 제거
					}

					Loading.open(myWindow);
					// 중복체크
					$.ajax({
						url: "/shvacRegistrations"
					}).done(function(data) {
						// 중복체크
						var idx;
						for (idx = 0; idx < data.length; idx++) {
							var tmp = data[idx];
							if (networkId != originNetworkId) { // NetworkId를 변경한 경우
								if (networkId == tmp["dms_devices_id"]) { // 이미 값이 있을 경우
									Loading.close(myWindow);
									popupMessage.message(SETTINGS_MESSAE_NOTI_ALREADY_EXIST_NETWORK_ID);
									popupMessage.open();
									return false;
								}
							}
							if (ip != originIp) { // ip를 변경한 경우
								if (ip == tmp["dms_devices_networks_ethernet_ipAddress"]) { // 이미 값이 있을 경우
									Loading.close(myWindow);
									popupMessage.message(SETTINGS_MESSAE_NOTI_ALREADY_EXIST_NETWORK_IP);
									popupMessage.open();
									return false;
								}
							}
							if (name != originName) { //name을 변경한 경우
								if (name == tmp["dms_devices_name"]) { //이미 값이 있는 경우
									Loading.close(myWindow);
									popupMessage.message(SETTINGS_MESSAE_NOTI_ALREADY_EXIST_DEVICE_NAME);
									popupMessage.open();
									return false;
								}
							}
						}

						// 목록의 디바이스 Network ID 값이 중복되지 않는 경우 save 실행
						$.ajax({
							url: "/shvacRegistrations/" + originNetworkId,
							method: "PATCH",
							data: dmsObj
						}).done(function() {
							//팝업 상단 부분 데이터 갱신
							myWindow.find("input[data-role=networkid]").data("data-origin", dmsObj["dms_devices_id"]); // original network ID
							myWindow.find("input[data-role=name]").data("data-origin", dmsObj["dms_devices_name"]); // original device Name

							// DDC 또는 DMS 수정사항 데이터 값을 읽어들인다.
							if (deviceType == "AirConditionerController.WirelessDDC") {
								myWindow.find("span[data-role=ipaddress]").data("data-origin", dmsObj["dms_devices_networks_ethernet_ipAddress"]);
							} else if (deviceType == "AirConditionerController.DMS") {
								myWindow.find("input[data-role=ipaddressinput]").data("data-origin", dmsObj["dms_devices_networks_ethernet_ipAddress"]);
							}
							bindData(networkId); // 메인 그리드 리로드
						}).fail(function(resp) {
							Loading.close(myWindow);
							openNotSavePopup(resp);
						}).always(function() {
							//Loading.close(myWindow);
						});
					}).fail(function(data) {
						Loading.close(myWindow);
						popupMessage.message(data.responseText);
						popupMessage.open();
					}).always(function() {});
					target.data('kendoButton').enable(false); // save버튼 Dimmed
				}
			});

			// 팝업창 close
			popupWindow.data("kendoPopupSingleWindow").addEventToFactory("#popup-sac-sac-device .popup-footer button[data-event=sacclose]", "sacDetailPopupClose", function(e) {
				var myWindow = $("#popup-sac-sac-device");
				var saveBtnStatus = popupSaveBtn.data("kendoButton").options.enable;

				popupConfirm.message(COMMON_CONFIRM_DIALOG_EDIT_CANEL);
				popupConfirm.setConfirmActions({
					yes: function(evt) {
						myWindow.data("kendoPopupSingleWindow").close();
					},
					no: function(evt) {}
				});

				if (saveBtnStatus == true) {
					popupConfirm.open();
				} else {
					myWindow.data("kendoPopupSingleWindow").close();
				}
			});

			popupWindow.closest('.k-window').find('.pop-window-btn-close.ic-close').off('click');
			popupWindow.closest('.k-window').find('.pop-window-btn-close.ic-close').on('click', function () {
				var myWindow = $("#popup-sac-sac-device");
				var saveBtnStatus = popupSaveBtn.data("kendoButton").options.enable;

				popupConfirm.message(COMMON_CONFIRM_DIALOG_EDIT_CANEL);
				popupConfirm.setConfirmActions({
					yes: function(evt) {
						myWindow.data("kendoPopupSingleWindow").close();
					},
					no: function(evt) {}
				});

				if (saveBtnStatus == true) {
					popupConfirm.open();
				} else {
					myWindow.data("kendoPopupSingleWindow").close();
				}
			});
		};


		/**
		 *
		 *   설치정보 업데이트를 시행하는 경우 갱신된 기기의 정보를 팝업으로 디스플레이 한다.
		 *
		 *   @param {String} mqName - 웹소켓으로부터 받은 응답 중 설치정보 업데이트 메시지를 구별하기 위한 문자열
		 *   @param {Array} ajaxReqData - PATCH /shvacRegistrations 호출 시 서버로 전송한 배열
		 *   @param {Array} ajaxResData - PATCH /shvacRegistrations 호출 이후 응답받은 배열
		 *   @function updateDeviceStatus
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// Update Device
		function updateDeviceStatus(mqName, ajaxReqData, ajaxResData) {
			var repData = ajaxResData;
			var dataArray = ajaxReqData;
			var popMsg;
			var has204 = false; //204 존재 여부
			var has412 = false; //412 존재 여부

			// 응답 데이터에 204 혹은 412 체크
			for (var i = 0; i < repData.length; i++) {
				if (repData[i].code == 204) { //body에 204 코드 있는지
					has204 = true;
				} else if (repData[i].code == 412) { //body에 412 코드 있는지
					has412 = true;
				}
			}

			// 응답 형태 결정
			if (has204) { //body내에 204가 하나라도 있으면 웹소켓 receive 시 실행되는 callback 정의
				var limitTime = setTimeout(function() {
					//console.log("APPLY LIMITTIME!!");
					Loading.close();
				}, 1000 * 60 * 3);
				receiveCallback = function(mq) {
					if (mq.name == mqName) {
						clearTimeout(limitTime);
						// 로딩 패널 종료
						Loading.close();

						if (has412) { // body 내에 204가 아닌 기기들이 존재 한다면,
							popMsg = resultMsgOnUpdateInstallation(dataArray, repData, "updateInstallationInformation"); //(요청 시 데이터, 응답 시 데이터)
							popupMessageDeviceUpdate.message("<div class='device-update-info-message'>" + SETTINGS_MESSAGE_NOTI_COMPLETE_UPDATE_INSTALLATION_INFO + "</div>" + popMsg);
							popupMessageDeviceUpdate.open();
						} else { //body 내에 모두 204라면
							popMsg = SETTINGS_MESSAGE_NOTI_COMPLETE_UPDATE_INSTALLATION_INFO;
							popupMessageDeviceUpdate.message(popMsg);
							popupMessageDeviceUpdate.open();
						}
						//메인 그리드 리로딩
						reloadSacGrid();
						receiveMsg = false;
					} else {
						// console.log("MQ name has been matched with CompleteUpdateInstallationInfo not yet");
						//Loading.close();
					}
				};
			} else { //body내에 204가 하나도 없으면 종료하고 팝업 띄워줘.
				Loading.close();
				popMsg = resultMsgOnUpdateInstallation(dataArray, repData, "updateInstallationInformation"); //(요청 시 데이터, 응답 시 데이터)
				popupMessageDeviceUpdate.message("<div class='device-update-info-message'>" + SETTINGS_MESSAGE_NOTI_FAILED_COMPLETE_UPDATE_INSTALLATION_INFO + "</div>" + popMsg);
				popupMessageDeviceUpdate.open();
				//메인 그리드 리로딩
				reloadSacGrid();
			}
		}


		/**
		 *
		 *   설치정보 업데이트 시 Code가 204가 아닌 기기들 정보를 디스플레이하는 팝업 메시지를 리턴한다.
		 *
		 *   @param {Array} req - PATCH /shvacRegistrations 호출 시 서버로 전송한 배열
		 *   @param {Array} res - PATCH /shvacRegistrations 호출 이후 응답받은 배열
		 *   @param {String} type - 웹 소켓 응답 메시지 타입 문자열
		 *   @function resultMsgOnUpdateInstallation
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		//Update Installation시 code 204아닌 기기들 정보 팝업 메세지 반환 함수
		function resultMsgOnUpdateInstallation(req, res, type) { //(요청 시 데이터, 응답 시 데이터)
			var result = "";
			var str;
			for (var i = 0; i < res.length; i++) {
				var code = res[i].code;
				if (code == 412) {
					var updateInfoStatus = res[i].body[type];
					var deviceId = req[i].dms_devices_id;
					if (updateInfoStatus == "NotConnected") {
						str = "<li><span class='device-name'>" + deviceId + "</span><span class='device-detail'>" + SETTINGS_MESSAGE_INFO_NOT_CONNECTED + "</span></li>";
					} else if (updateInfoStatus == "Tracking") {
						str = "<li><span class='device-name'>" + deviceId + "</span><span class='device-detail'>" + SETTINGS_MESSAGE_INFO_TRACKING + "</span></li>";
					} else if (updateInfoStatus == "Addressing") {
						str = "<li><span class='device-name'>" + deviceId + "</span><span class='device-detail'>" + SETTINGS_MESSAGE_INFO_ADDRESSING + "</span></li>";
					} else if (updateInfoStatus == "Downloading") {
						str = "<li><span class='device-name'>" + deviceId + "</span><span class='device-detail'>" + SETTINGS_MESSAGE_INFO_DOWNLOADING + "</span></li>";
					} else if (updateInfoStatus == "EmergencyStop") {
						str = "<li><span class='device-name'>" + deviceId + "</span><span class='device-detail'>" + SETTINGS_MESSAGE_INFO_EMERGENCYSTOP + "</span></li>";
					}
					result += str;
				}
			}
			result = "<div class='device-update-info-fail'>" + SETTINGS_MESSAGE_NOTI_FAILED_UPDATE_INSTALLATION_INFO_DEVICE + ":" + "</div><ul class='device-update-info'>" + result + "</ul>";
			return result;
		}


		/**
		 *
		 *   그리드 내부의 요소들 중 편집된 데이터의 uid를 저장한다.
		 *
		 *   @param {Object} grid - 대상 그리드 요소 객체
		 *   @param {Object} elem - 편집이 이루어지는 UI 요소
		 *   @function getChangedDataUid
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 변경된 DataUid 얻어오기
		function getChangedDataUid(grid, elem) {
			var isInArray = false;
			var thisRow = $(elem).closest("tr");
			var thisRowUid = thisRow.attr("data-uid");
			// console.log(thisRowUid);
			if (changedPopupDataUid.length == 0) {
				changedPopupDataUid.push(thisRowUid);
			} else {
				for (var i = 0; i < changedPopupDataUid.length; i++) {
					var tmpUid = changedPopupDataUid[i];
					if (tmpUid != thisRowUid) {
						isInArray = false;
					} else {
						isInArray = true;
						break;
					}
				}

				if (!isInArray) {
					changedPopupDataUid.push(thisRowUid);
				}
			}
		}


		/**
		 *
		 *   SAC 설정 탭의 메인 윈도우의 그리드를 갱신한다.
		 *
		 *   @function reloadSacGrid
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// main grid reload
		function reloadSacGrid() {
			// 리로딩
			Loading.open();
			$.ajax({
				url: "/shvacRegistrations"
			}).done(function(data) {
				var checkAllDeviceBox = deviceListGrid.find("[data-event=devicecheckall]");
				deviceTypeData = [];
				selectedDeviceType = [];
				for (var i = 0; i < data.length; i++) {
					var tmp = data[i];
					if (tmp.dms_devices_registrationStatus != "Deleted") {
						deviceTypeData.push(tmp);
					}
				}

				// Device List에 아이템 유무 분기
				if (deviceTypeData.length > 0) {
					deviceListGridData.dataSource.data(deviceTypeData);
					noDeviceText.hide();
				} else {
					noDeviceText.show();
				}

				// 버튼 Dimmed 및 전체 체크박스 all 해제
				checkSelectedDevice();
				checkAllDeviceBox.prop("checked", false);
			}).fail(function(data) {
				popupMessage.message("<p class='pop-confirm-message'>" + data.responseText + "</p>");
				popupMessage.open();
			}).always(function() {
				Loading.close();
			});
		}


		/**
		 *
		 *   상세팝업창의 그리드가 갱신될 때 내부 위젯 초기화 및 데이터를 전처리한다.
		 *
		 *   @function applyOptionsToPopupGrid
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 팝업창 내부에 뿌려지는 그리드 데이터 전처리 - 보이는 부분
		function applyOptionsToPopupGrid() {
			var gridTr = popupGrid.find(".k-grid-content").find("tbody").find("tr");
			for (var i = 0; i < popupGrid.data("kendoGrid").dataSource.view().length; i++) {
				var tmp = popupGrid.data("kendoGrid").dataSource.view()[i];
				var type = tmp.type;
				var classType = Util.getDisplayClassType(type);
				var mappedType = tmp.mappedType;
				var curTr = gridTr.eq(i);
				var ddl = curTr.find("[data-role=point-type-selector]").data("kendoDropDownList");

				// device type
				if (classType === "Indoor" || classType === "Outdoor" || classType === "Meter") {
					//gridTr.eq(i).find("[data-role=devicetagname]").prop("readonly", true);
					if (curTr.find("[data-role=point-type-selector]").attr("hasData") == "true") {
						curTr.find("[data-role=point-type-selector]").data("kendoDropDownList").enable(false);
					}
				}
				// Point type dropdownlist
				if (typeof ddl != 'undefined') {
					if (mappedType == "-") {
						//ddl.value("Point");
						//ddl.enable(false);
					} else {
						if (mappedType.indexOf("Meter.") > -1) {
							mappedType = "Meter";
						}
						ddl.value(Util.getDisplayType(mappedType));
					}
				}
			}
		}


		/**
		 *
		 *   SAC 설정 탭의 기기 목록 그리드에 새 기기를 추가한다.
		 *
		 *   @param {String} ipAddress - 기기 추가시 입력한 항목 문자열
		 *   @function addDeviceToList
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// Device 추가 함수
		function addDeviceToList(ipAddress) {
			var deviceType = Util.getOriginalType(addDeviceType);
			var ip = ipAddress;
			var obj = {};
			// var gridData = deviceListGridData.dataSource.data();

			if (addDeviceType == "S-Net SMART Controller") {
				deviceType = "AirConditionerController.WirelessDDC";
			}

			if (deviceType == "AirConditionerController.WirelessDDC") {
				obj = {
					"dms_devices_type": deviceType,
					"dms_devices_id": ip,
					"dms_devices_networks_ethernet_ipAddress": "-"
				};
			} else {
				obj = {
					"dms_devices_type": deviceType,
					"dms_devices_networks_ethernet_ipAddress": ip,
					"dms_devices_id": createNetworkId()
				};
			}

			Loading.open();
			// 중복 체크
			$.ajax({
				url: "/shvacRegistrations"
			}).done(function(data) {
				for (var i = 0; i < data.length; i++) {
					var tmpData = data[i];
					if (deviceType == "AirConditionerController.WirelessDDC") { // dms_devices_id=Network ID와 비교
						if (tmpData.dms_devices_id == obj.dms_devices_id) {
							popupMessage.message(SETTINGS_MESSAGE_NOTI_FAILED_ADD_DEVICE);
							popupMessage.open();
							Loading.close();
							return false;
						}
					} else if (deviceType == "AirConditionerController.DMS") { // IpAddress와 비교
						if (tmpData.dms_devices_networks_ethernet_ipAddress == obj.dms_devices_networks_ethernet_ipAddress) {
							popupMessage.message(SETTINGS_MESSAGE_NOTI_FAILED_ADD_DEVICE);
							popupMessage.open();
							Loading.close();
							return false;
						}
					}
				}

				// 중복되지 않는 경우
				$.ajax({
					url: "/shvacRegistrations",
					method: "POST",
					data: obj
				}).done(function() {
					//console.log(data);
					networkInput.val("");
					Loading.close();
					// 리로딩
					reloadSacGrid();
				}).fail(function(resp) {
					Loading.close();
					popupMessage.message(resp.responseText);
					popupMessage.open();
				}).always(function() {});
			}).fail(function(resp) {
				Loading.close();
				popupMessage.message(resp.responseText);
				popupMessage.open();
			}).always(function() {
				//Loading.close();
				addDeviceBtn.data("kendoButton").enable(false); //추가 요청이후, 추가 버튼 disabled 상태 설정.
			});
		}


		/**
		 *
		 *   새로운 기기가 추가되는 경우 임의의 Network ID를 생성하여 리턴한다.
		 *
		 *   @function createNetworkId
		 *   @returns {String} - 생성된 Network ID 문자열
		 *   @alias module:sac-sac
		 *
		 */
		// Network ID 자동 생성
		function createNetworkId() {
			var result = "";
			result = "S" + makeChar() + makeChar() + makeChar() + getRandomNumberInRange(1000, 9999) + "-" + getRandomNumberInRange(100, 999) + makeChar() + "-" + getRandomNumberInRange(10, 99);

			function makeChar() { // A-Z
				return String.fromCharCode((Math.random() * 26) + 65);
			}

			function getRandomNumberInRange(low, high) {
				return Math.floor((Math.random() * (high - low + 1)) + low);
			}

			// function makeNum(count) { // 0000~9999
			//     var num = "";
			//     for (var i = 0; i < count; i++) {
			//         var tmp = Math.floor(Math.random() * 10);
			//         num = num + tmp;
			//     }
			//     return num;
			// }
			return result;
		}


		/**
		 *
		 *   콤보 박스의 값을 변경한 경우 대상 그리드에 필터를 적용한다.
		 *
		 *   @param {Object} grid - 그리드 요소 오브젝트
		 *   @param {Object} filterOpts - 필터 옵션 객체
		 *   @function applyFilter
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 필터링 적용
		function applyFilter(grid, filterOpts) {
			var gridData = grid.data("kendoGrid");
			var tmpFilter = [];
			var dtfilter;
			// var currFilterObj = gridData.dataSource.filter();

			for (var key in filterOpts) {
				if (filterOpts[key] == "SAC Indoor") {
					dtfilter = createDeviceTypeFilter("AirConditioner", key);
					tmpFilter.push({
						logic: "or",
						filters: dtfilter
					});
				} else if (filterOpts[key] == "Energy Meter") {
					dtfilter = createDeviceTypeFilter("Meter", key);
					tmpFilter.push({
						logic: "or",
						filters: dtfilter
					});
				} else if (filterOpts[key] !== "" && filterOpts[key] !== "All") {
					tmpFilter.push({
						field: key,
						operator: "eq",
						value: Util.getOriginalType(filterOpts[key])
					});
				}
			}

			gridData.dataSource.filter({
				logic: "and",
				// filters: [{field: filterField, operator: "eq", value: filterValue}]
				filters: tmpFilter
			});

			//디바이스타입 전환 필터 생성 함수
			function createDeviceTypeFilter(type, keyName) {
				var indoorDeviceTypeList = Util.getDeviceTypeList(type);
				var dpFilter = [];
				for (var i = 0; i < indoorDeviceTypeList.length; i++) {
					var dpName = indoorDeviceTypeList[i].type;
					dpFilter.push({
						field: keyName,
						operator: "eq",
						value: dpName
					});
				}
				// console.log(dpFilter);
				return dpFilter;
			}
		}


		/**
		 *
		 *   기기 목록에서 선택된 기기에 대한 상세팝업을 오픈하고 Data를 바인딩한다.
		 *
		 *   @param {Object} popup - 상세조회 팝업창 요소 객체
		 *   @param {Number} index - 기기 목록에서 선택한 기기 데이터의 인덱스
		 *   @function showInfo
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// Detail Popup창
		function showInfo(popup, index) {
			changedPopupDataUid = [];
			changedPopupData = [];

			// validator 초기화
			isValidPopupId.validate(true);
			isValidPopupIp.validate(true);
			isValidPopupName.validate(true);

			// 팝업창 오픈
			popup.data("kendoPopupSingleWindow").openWindowPopup();
			// 팝업 내부 data 바인딩
			dataBindPopup(index); // 해당 인덱스에 대한 data bind
		}


		/**
		 *
		 *   기기 목록에서 기기 선택 조건에 따라 시간정보 업데이트, 설치정보 업데이트 및 삭제 버튼의 상태를 정한다.
		 *
		 *   @function checkSelectedDevice
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 선택된 요소 체크
		function checkSelectedDevice() {
			var count = selectedDeviceType.length;
			if (count === 0) {
				updateTimeBtn.data("kendoButton").enable(false);
				updateInstallBtn.data("kendoButton").enable(false);
				deleteDeviceBtn.data("kendoButton").enable(false);
			} else {
				updateTimeBtn.data("kendoButton").enable(true);
				updateInstallBtn.data("kendoButton").enable(true);
				deleteDeviceBtn.data("kendoButton").enable(true);
			}
		}


		/**
		 *
		 *   기기 추가 시 입력된 내용에 Validation을 적용한다.
		 *
		 *   @param {Object} inputElem - 입력 항목 요소 객체
		 *   @function checkNetworkInput
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// network ID or IP validation 체크
		function checkNetworkInput(inputElem) {
			// KEY Check
			var isValid;
			// var target = $(e.target);

			if (addDeviceType === "S-Net SMART Controller") {
				isValid = inputElem.kendoCommonValidator({
					type: "networkId",
					minLength: 1,
					maxLength: 32
				}).data("kendoCommonValidator");
			} else if (addDeviceType === "DMS") {
				isValid = inputElem.kendoCommonValidator({
					type: "ipAddress"
				}).data("kendoCommonValidator");
			}

			if (isValid.validate()) {
				addDeviceBtn.data("kendoButton").enable(true);
			} else {
				addDeviceBtn.data("kendoButton").enable(false);
			}

			inputElem.on("keyup", function(e) {
				if (isValid.validate()) {
					addDeviceBtn.data("kendoButton").enable(true);
				} else {
					addDeviceBtn.data("kendoButton").enable(false);
				}
			});
		}


		/**
		 *
		 *   기기 목록 그리드의 컬럼을 정의한다.
		 *
		 *   @function setGridColumns
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 메인 그리드 컬럼 세팅
		function setGridColumns() {
			var columns = [];
			var deviceListDefinition = [{
				field: "dms_devices_type",
				title: SETTINGS_DEVICE_TYPE
			},
			{
				field: "dms_devices_id",
				title: SETTINGS_NETWORK_ID
			},
			{
				field: "dms_devices_networks_ethernet_ipAddress",
				title: SETTINGS_IP_ADDRESS
			},
			{
				field: "dms_devices_name",
				title: SETTINGS_DEVICE_NAME
			},
			{
				field: "connected",
				title: SETTINGS_CONNECT
			},
			{
				field: "dms_devices_configuration_time_currentTime",
				title: SETTINGS_DEVICE_TIME
			},
			{
				field: "trackingTime",
				title: SETTINGS_TRACKING_TIME
			}
			];
			columns.push({ //체크박스
				headerTemplate: "<input type='checkbox' data-event='devicecheckall' id='sac-sac-device-checkall' class='k-checkbox'/><label class='k-checkbox-label' for='sac-sac-device-checkall'></label>",
				template: "<input type='checkbox' data-event='devicecheck' class='k-checkbox'/><label class='k-checkbox-label'></label>",
				width: 100
			});
			$.each(deviceListDefinition, function(idx, item) { //기본 필드 내용
				columns.push({
					field: item.field,
					title: item.title,
					template: function(dataItem) {
						return createTmpl(dataItem, item.field);
					}
				});

				function createTmpl(dataItem, field) {
					//XSS 필터 적용
					dataItem[field] = Util.getValueFilteredForXSS(dataItem[field]);

					var result;
					if (dataItem[field] === null || dataItem[field] === 'null' || typeof dataItem[field] === 'undefined' || dataItem[field] === '') {
						result = "<span class='sac-sac-" + field + "'>-</span>";
					} else if (field == "dms_devices_type") {
						result = "<span class='sac-sac-" + field + "'>" + convertDeviceTypeName(dataItem[field]) + "</span>";
					} else if (field == "dms_devices_configuration_time_currentTime") {
						if (dataItem["currentTimeSynchronized"] == false) {
							result = "<span class='sac-sac-" + field + " highlighted'>" + convertDateFormat(dataItem[field]) + "</span>";
						} else {
							result = "<span class='sac-sac-" + field + "'>" + convertDateFormat(dataItem[field]) + "</span>";
						}
					} else if (field == "trackingTime") {
						if (dataItem["trackingTimeOutdated"] == true) {
							result = "<span class='sac-sac-" + field + " highlighted'>" + convertDateFormat(dataItem[field]) + "</span>";
						} else {
							result = "<span class='sac-sac-" + field + "'>" + convertDateFormat(dataItem[field]) + "</span>";
						}
					} else if (field == "connected") {
						if (dataItem[field])
							result = "<span class='sac-sac-" + field + "'>" + SETTINGS_STATE_CONNECTED + "</span>";
						else
							result = "<span class='highlighted sac-sac-" + field + "'>" + SETTINGS_STATE_DISCONNECTED + "</span>";
					} else {
						result = dataItem[field];
					}

					return result;
				}
			});
			columns.push({ //디테일아이콘
				field: "",
				title: SETTINGS_BTN_DETAIL,
				template: "<span class='ic ic-info' data-event='devicedetail'></span>"
			});
			return columns;
		}


		/**
		 *
		 *   상세팝업창 내부의 그리드 컬럼을 정의한다.
		 *
		 *   @param {String} deviceType - 하위기기가 속해있는 상위기기 타입
		 *   @function setPopupGridColumns
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:sac-sac
		 *
		 */
		// 팝업창 내부 그리드 컬럼 세팅
		function setPopupGridColumns(deviceType) {
			var columns = [];
			var deviceInfoDefinition = [{
				field: "type",
				title: SETTINGS_DEVICE_TYPE,
				sortable: true
			},
			{
				field: "tagName",
				title: SETTINGS_DEVICE_TAG_NAME,
				sortable: true
			},
			{
				field: "id",
				title: SETTINGS_DEVICE_ID,
				sortable: true
			},
			{
				field: "name",
				title: SETTINGS_DEVICE_NAME,
				sortable: true
			},
			{
				field: "mappedType",
				title: SETTINGS_TYPE,
				sortable: true
			},
			{
				field: "description",
				title: SETTINGS_DEVICE_DESCRIPTION,
				sortable: false
			}
			];

			$.each(deviceInfoDefinition, function(idx, item) {
				columns.push({
					field: item.field,
					title: item.title,
					template: function(dataItem) {
						return createPopupTmpl(dataItem, item);
					},
					sortable: item.sortable
				});
			});

			function createPopupTmpl(dataItem, item) {
				var result;
				var field = item.field;
				var deviceClassType;

				if (field == "type") { //YH
					deviceClassType = Util.getDetailDisplayType(dataItem[field]);
					result = "<div class='popup-grid-device-" + field + "'>" + popupGridDeviceTypeDisplayDef[deviceClassType] + "</div>";
				} else if (field == "tagName") {
					if (typeof dataItem[field] == 'undefined' || typeof dataItem[field] == 'undefined' || deviceType == "AirConditionerController.DMS" || dataItem[field] == "-") {
						result = "<div class='popup-grid-device-" + field + "'>-</div>";
					} else {
						result = "<div class='popup-grid-device-" + field + "'>" + dataItem[field] + "</div>";
					}
				} else if (field == "name") {
					if (deviceType == "AirConditionerController.WirelessDDC") {
						if (typeof dataItem[field] == 'undefined' || dataItem[field] == "-") {
							result = "<input class='k-input' data-role='devicetagname' value='" + dataItem["tagName"] + "' required/>";
						} else {
							result = "<input class='k-input' data-role='devicetagname' value='" + dataItem[field] + "' required/>";
						}
					} else if (deviceType == "AirConditionerController.DMS") {
						if (typeof dataItem[field] == 'undefined' || dataItem[field] == "-") {
							result = "<input class='k-input' data-role='devicetagname' value='" + dataItem["id"] + "' required/>";
						} else {
							result = "<input class='k-input' data-role='devicetagname' value='" + dataItem[field] + "' required/>";
						}
					}
				} else if (field == "mappedType") {
					//console.log(dataItem[field]);
					if (typeof dataItem[field] != 'undefined' && dataItem[field] != "-") {
						result = "<input data-role='point-type-selector' hasData='true' data-value='" + dataItem[field] + "'/>";
					} else if (typeof dataItem[field] == 'undefined' || dataItem[field] == "-") {
						result = "<span data-role='point-type-selector' hasData='false' data-value='" + dataItem[field] + "'>" + "-" + "</span>";
					}
				} else if (field == "description") {
					if (typeof dataItem[field] == 'undefined') {
						dataItem[field] = "";
					}
					result = "<input class='k-input' data-role='devicedescription' value='" + dataItem[field] + "'/>";
				} else if (field == "id") {
					result = "<div class='popup-grid-device-" + field + "'>" + dataItem[field] + "</div>";
				} else {
					result = "<div class='popup-grid-device-" + field + "'>" + dataItem[field] + "</div>";
				}

				return result;
			}
			return columns;
		}


		/**
		 *
		 *   Date 문자열에 특정 포맷을 적용하여 리턴한다.
		 *
		 *   @param {String} date - 서버로부터 응답받은 date 문자열
		 *   @function convertDateFormat
		 *   @returns {String} - 포맷이 적용된 Date 문자열을 리턴한다.
		 *   @alias module:sac-sac
		 *
		 */
		// 날짜 포맷 변경 함수
		function convertDateFormat(date) {
			var result = moment(date).format("LLL").replace(/\./g, "-");
			return result;
		}


		/**
		 *
		 *   Date 문자열에 특정 포맷을 적용하여 리턴한다.
		 *
		 *   @param {String} date - 서버로부터 응답받은 date 문자열
		 *   @function convertDateFormat
		 *   @returns {String} - 포맷이 적용된 Date 문자열을 리턴한다.
		 *   @alias module:sac-sac
		 *
		 */
		// Device type 매칭 함수
		function convertDeviceTypeName(type) {
			var result;
			if (type == "AirConditionerController.WirelessDDC") {
				result = "S-Net SMART Controller";
			} else if (type == "AirConditionerController.DMS") {
				result = "DMS";
			}
			return result;
		}


		/**
		 *
		 *   특정 상황에 맞게 팝업 메시지를 정의하고 오픈한다.
		 *
		 *   @param {String} data - 팝업 메시지를 정할 문자열
		 *   @function openNotSavePopup
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:sac-sac
		 *
		 */
		// Not save 메시지 팝업
		function openNotSavePopup(data) {
			var text;
			if (data == "change") {
				text = SETTINGS_MESSAGE_NOTI_FAILED_CHANGE_SAVE;
			} else if (data == "add") {
				text = SETTINGS_MESSAGE_NOTI_FAILED_ADD_DEVICE;
			} else {
				text = data.responseText;
			}
			popupMessage.message(text);
			popupMessage.open();
		}


		/**
		 *
		 *   배열을 오름차순 정렬한다.
		 *
		 *   @param {Array} arr - 정렬할 배열
		 *   @function sortArrayAsc
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:sac-sac
		 *
		 */
		//Array Sort asc
		function sortArrayAsc(arr) {
			arr.sort(function(a, b) {
				return a - b;
			});
		}


		/*
		 *  메소드 실행
		 */
		init();
		bindData();
		// renewGrid(deviceListGrid);
		//attachEventInGrid(deviceListGrid);
		attachEvent();
		attachEventInPopup();


		// 소팅 시 데이터 뷰 갱신 및 이벤트 리바인딩
		deviceListGridData.dataSource.bind("change", function(e) {
			//console.log("SORT!!");
			attachEventInGrid(deviceListGrid);
		});
		// 팝업창 그리드 DataBound 발생 시 이벤트 등록
		popupGrid.data("kendoGrid").bind("dataBound", function(e) {
			// Point type DropdownList
			popupPointTypeSelector = popupGrid.find("[data-role=point-type-selector][hasData=true]");


			//popupPointTypeSelectorOptionsA
			//popupPointTypeSelectorOptionsD
			/*임시코드*/
			var listForMappedTypeDropDownList = $("body").find(".mappedtype-dropdownlist-list");
			var animationContainerForMappedTypeDropDownList = listForMappedTypeDropDownList.closest(".k-animation-container");
			var listLength = listForMappedTypeDropDownList.length;
			var animationContainerLength = animationContainerForMappedTypeDropDownList.length;
			if (listLength > 0) {
				listForMappedTypeDropDownList.remove();
			}
			if (animationContainerLength > 0) {
				animationContainerForMappedTypeDropDownList.remove();
			}
			for (var i = 0; i < popupPointTypeSelector.length; i++) {
				var selector = popupPointTypeSelector.eq(i);
				var tr = selector.closest("tr");
				var devType = tr.find("td").eq(0).find(".popup-grid-device-type").text();
				var popupPointTypeSelectorOptions = [];

				if (devType == "DI" || devType == "DO" || devType == "AO") {
					popupPointTypeSelectorOptions = popupPointTypeSelectorOptionsD;
				} else if (devType == "AI") {
					popupPointTypeSelectorOptions = popupPointTypeSelectorOptionsA;
				}

				selector.kendoDropDownList({
					dataSource: popupPointTypeSelectorOptions,
					dataTextField: "text",
					dataValueField: "value",
					change: function(evt) {
						getChangedDataUid(popupGrid, $(this.element[0].parentElement));
						popupSaveBtn.data("kendoButton").enable(true);
					}
				});
				selector.data("kendoDropDownList").list.addClass("mappedtype-dropdownlist-list");
			}

			applyOptionsToPopupGrid();
			//if(popupPointTypeSelector.length > 0){
			//    popupPointTypeSelector.kendoDropDownList({
			//        dataSource: popupPointTypeSelectorOptions,
			//        change: function(e){
			//            getChangedDataUid(popupGrid, $(this.element[0].parentElement));
			//            popupSaveBtn.data("kendoButton").enable(true);
			//        }
			//    });
			//    applyOptionsToPopupGrid();
			//}

			// 팝업창 내부 그리드 인풋 validator 초기화
			isValidPopupGridName = popupGrid.find("input[data-role=devicetagname]").kendoCommonValidator({
				type: "name"
			}).data("kendoCommonValidator");
			isValidPopupGridDesc = popupGrid.find("input[data-role=devicedescription]").kendoCommonValidator({
				type: "description"
			}).data("kendoCommonValidator");

			// Attach ordering value to each data for defined device types
			for (var a = 0; a < popupGrid.data("kendoGrid").dataSource.data().length; a++) {
				var tmpPopupGridData = popupGrid.data("kendoGrid").dataSource.data()[a];
				// var deviceCategory = tmpPopupGridData.type;
				tmpPopupGridData.orderingValue = deviceTypeOrderingDefinition[currentPopupDeviceType][Util.getDetailDisplayType(tmpPopupGridData.type)];
			}
		});
		// 팝업창 그리드 Sort발생 시 이벤트 재등록
		popupGrid.data("kendoGrid").dataSource.bind("change", function(e) {
		});
	};

	return sacInSac;
});
//# sourceURL=sac-sac.js
