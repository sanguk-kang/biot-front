/**
 *
 *   <ul>
 *       <li>Facility - Device에서 표시할 상세 팝업 및 제어 이력 팝업에 대한 옵션 값 설정</li>
 *       <li>상세 팝업 및 제어 이력 팝업의 인스턴스를 생성한다.</li>
 *   </ul>
 *   @module app/device/common/config/popup-config
 *   @requires config
 *   @requires lib/moment
 *
 */

define("device/common/config/popup-config", ["device/common/device-util", "device/common/device-template", "device/common/config/light-control-vm", "device/common/config/smartplug-control-vm"],
	function(DeviceUtil, Template, LightViewModel, SmartPlugViewModel){
		var I18N = window.I18N;
		var MainWindow = window.MAIN_WINDOW;
		var Util = window.Util;
		var LoadingPanel = window.CommonLoadingPanel;
		var kendo = window.kendo;
		var moment = window.moment;
		var Loading = new LoadingPanel();
		var detailPopup, detailPopupElem = $("#device-detail-popup");
		var mapPopup, mapPopupElem = $("#device-detail-map-popup");
		var historyMessageElem = $("#device-history-message-popup");
		var historyConfirmElem = $("#device-history-confirm-popup");
		var historyMessage;
		var historyData = [];

		//Beacon Mock 데이터 활용을 위한 임시 스트링.
		//var beaconMock = ".scanlist[0]";
		var beaconMock = "";

		/*Map Popup in Detail Pop-up*/
		mapPopup = mapPopupElem.kendoCommonDialog({
			title : "Map",
			timeout : 0,
			width : 700,
			height : 680,
			actions : [
				{
					text : I18N.prop("COMMON_BTN_CANCEL")
				},
				{
					text : I18N.prop("COMMON_BTN_SAVE")
				}
			]
		}).data("kendoCommonDialog");

		/*Default Grid Options in Detail Popup*/
		var defaultGridOpt = {
			height: "100%",
			scrollable: false,
			sortable: false,
			filterable: false,
			pageable: false,
			rowHeaders: true
		};


		/*History Pop-up Start*/
		// 다국어
		var FACILITY_HISTORY = I18N.prop("FACILITY_HISTORY");
		var FACILITY_HISTORY_CONTROLLED_TIME = I18N.prop("FACILITY_HISTORY_CONTROLLED_TIME");
		var FACILITY_HISTORY_LOCATION = I18N.prop("FACILITY_HISTORY_LOCATION");
		var FACILITY_HISTORY_CONTROL_BY = I18N.prop("FACILITY_HISTORY_CONTROL_BY");
		var FACILITY_HISTORY_CONTROL_TYPE = I18N.prop("FACILITY_HISTORY_CONTROL_TYPE");
		var FACILITY_HISTORY_OPERATION = I18N.prop("FACILITY_HISTORY_OPERATION");
		var FACILITY_HISTORY_DETAIL = I18N.prop("FACILITY_HISTORY_DETAIL");
		var FACILITY_HISTORY_GROUP = I18N.prop("FACILITY_HISTORY_GROUP");
		var systemOriDef = {
			'b.IoT': I18N.prop("FACILITY_HISTORY_QUADURON"),
			Others: I18N.prop("FACILITY_HISTORY_OTHERS")
		};
		var serviceOriDef = {
			Manual: I18N.prop("FACILITY_HISTORY_MANUAL"),
			Rule: I18N.prop("FACILITY_HISTORY_RULE"),
			Schedule: I18N.prop("FACILITY_HISTORY_SCHEDULE")
		};

		// 다이얼로그
		historyMessage = historyMessageElem.kendoCommonDialog().data("kendoCommonDialog");
		historyConfirmElem.kendoCommonDialog({type: "confirm"}).data("kendoCommonDialog");
		// 히스토리 팝업창
		var historyPop = $("#popup-history").kendoPopupSingleWindow({
			title: FACILITY_HISTORY,
			width: "1296px",
			deactivate: function(){
				var divOverlay = $("<div class='k-overlay' style='dislay:block; z-index:10002; opacity:0.5;'></div>");
				divOverlay.appendTo($("body"));
			}
		});
		historyPop.closest(".popup-window").addClass("popup-device-history");

		// 히스토리 디테일 팝업창
		var HistoryDetail = kendo.data.Model.define({
			fields: {
				time: {name: FACILITY_HISTORY_CONTROLLED_TIME, type: "string"},
				location: {name: FACILITY_HISTORY_LOCATION, type: "string"},
				group: {name: FACILITY_HISTORY_GROUP, type: "string"},
				systemOrigin: {name: FACILITY_HISTORY_CONTROL_BY, type: "string"},
				serviceOrigin: {name: FACILITY_HISTORY_CONTROL_TYPE, type: "string"},
				attributes: {name: FACILITY_HISTORY_OPERATION, type: "string"}
			}
		});
		$("#popup-history-detail").kendoPopupSingleWindow({
			model: HistoryDetail,
			title: FACILITY_HISTORY_DETAIL,
			width: "600px"
		});
		// History column Data - Youngun
		var historyColumns = [
			{ field: "time", title: FACILITY_HISTORY_CONTROLLED_TIME, width:200, template: function(data){
				var time = data.time;
				return moment(time).format("LLL").replace(/\./g, "-");
			} },
			{ field: "location", title: FACILITY_HISTORY_LOCATION, width: 200, sortable: false },
			{ field: "systemOrigin", title: FACILITY_HISTORY_CONTROL_BY, width:200, sortable: false, template: function(data){
				var result = systemOriDef[data.systemOrigin];
				if(!result) {
					result = I18N.prop("FACILITY_HISTORY_OTHERS");
				}
				return result;
			} },
			{ field: "serviceOrigin", title: FACILITY_HISTORY_CONTROL_TYPE, width:200, sortable: false, template: function(data){
				var result = serviceOriDef[data.serviceOrigin];
				if(!result) {
					result = I18N.prop("FACILITY_HISTORY_OTHERS");
				}
				return result;
			} },
			{ field: "attributes", title: FACILITY_HISTORY_OPERATION, sortable: false, template: function(data){
				var result = "";
				var attrKey, attrVal, displayName, historyKeyString, valueKeyString;
				var keyName = "";
				var attributes = data.attributes;//[]
				var length = attributes.length;
				if(attributes){
					for(var i = 0; i < attributes.length; i++){
						var attr = attributes[i];
						attrKey = attr.key.split("-");
						for(var j = attrKey.length - 1; j >= 0; j--){
							keyName = keyName + attrKey[j];
						}
						if(attrKey.length > 1){
							keyName = attrKey[attrKey.length - 2] + "_" + attrKey[attrKey.length - 1];
							keyName = keyName.replace(/-|\./g, "_");
						}
						keyName = keyName.toUpperCase();
						attrVal = attr.value;

						if(keyName.indexOf('DIMMINGLEVEL') > -1){
							keyName = 'DIMMINGLEVEL';
						}

						historyKeyString = Util.getHistoryOperation(keyName);
						if(keyName.indexOf("VALUE") != -1 ||
						keyName.indexOf("DESIRED") != -1 ||
						keyName.indexOf("LEVEL") != -1) {
							valueKeyString = Util.getHistoryOperationValue("FACILITY_HISTORY_OPERATION_" + keyName + "_VALUE", attrVal.toUpperCase());
						} else {
							if(attrVal.indexOf("~") != -1) {
								attrVal = attrVal.replace("~", "_");
							}
							valueKeyString = Util.getHistoryOperationValue("FACILITY_HISTORY_OPERATION_" + keyName + "_" + attrVal.toUpperCase());
						}
						if(length > 1) {
							displayName = "<div style='text-align:center;'>" + historyKeyString + " / " + valueKeyString + "<span> (+" + (length - 1) + ")</span>" + "</div>";
						} else {
							displayName = "<div style='text-align:center;'>" + historyKeyString + " / " + valueKeyString + "</div>";
						}

						result = displayName;
						break;
					}
				}else{
					result = "<div style='text-align:center;'><span>-<span></div>";
				}
				return result;
			} },
			{ title: FACILITY_HISTORY_DETAIL, template: "<span class='ic ic-info' data-event='detail'></span>", sortable: false, width: "66px" }
		];
		// Grid in History Popup - Youngun
		var historyGrid = $(".popup-device-history .device-history-grid").kendoGrid({
			dataSource: [],
			//scrollable: true,
			scrollable: {
				virtual: true
			},
			sortable: true,
			height: "100%",
			columns: historyColumns
		});
		// Grid Sort Definition
		historyGrid.data('kendoGrid').dataSource.sort([{
			field: "time",
			dir: "desc"
		}]);
		// History Calendar - Youngun
		var nowDate = new Date();
		var selectedStartDate, selectedEndDate;
		// 캘린더 DOM
		var startDate = $("#popup-history").find("input.startdate");
		var endDate = $("#popup-history").find("input.enddate");
		// 캘린더 commonDatePicker 초기화
		startDate.kendoCommonDatePicker({
			value: new Date(nowDate.getFullYear(), nowDate.getMonth(), 1, 0, 0, 0),
			isStart: true,
			isEnd: false,
			okCallBack: calcDate
		});
		endDate.kendoCommonDatePicker({
			value: new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 23, 59, 59),
			isStart: false,
			isEnd: true,
			okCallBack: calcDate
		});
		selectedStartDate = startDate.data("kendoCommonDatePicker").value();
		selectedEndDate = endDate.data("kendoCommonDatePicker").value();

		// Checkbox 이벤트 - all
		historyPop.on("click", "input[data-attr=All]", function(){
			var target = $(this);
			var popupWindow = target.closest(".popup-window-single");
			var checkBox = popupWindow.find("input.history-control-type");
			var viewBtn = popupWindow.find("button[data-event=view]");
			if(target.is(":checked")){
				checkBox.each(function(index, e){
					e.checked = true;
				});
				viewBtn.data("kendoButton").enable(true);
			}else{
				checkBox.each(function(index, e){
					e.checked = false;
				});
				viewBtn.data("kendoButton").enable(false);
			}
		});
		// Checkbox 이벤트 - not all
		historyPop.on("click", "input.history-control-type", function(){
			var target = $(this);
			var popupWindow = target.closest(".popup-window-single");
			var checkAllBox = popupWindow.find("input[data-attr=All]");
			var checkBox = popupWindow.find("input.history-control-type");
			var checkedElem = popupWindow.find(".toolbar-content.controlType").find(".history-control-type:checked");
			var viewBtn = popupWindow.find("button[data-event=view]");
			if(target.is(":checked") == false){
				checkAllBox.prop("checked", false);
				if(checkedElem.length == 0){
					viewBtn.data("kendoButton").enable(false);
				}
			}else{
				if(checkedElem.length == checkBox.length){
					checkAllBox.prop("checked", true);
				}
				viewBtn.data("kendoButton").enable(true);
			}
		});
		// View 버튼 이벤트
		historyPop.on('click', "button[data-event=view]", function(){
			var target = $(this);
			var popupWindow = target.closest(".popup-window-single");
			var url = "";
			var checkedCtrlTypes = "";
			var startTime = popupWindow.find("input.startdate").data("kendoCommonDatePicker").getDate();
			var endTime = popupWindow.find("input.enddate").data("kendoCommonDatePicker").getDate();
			var dms_devices_id = popupWindow.data("curDmsId");
			var checkedElem = popupWindow.find(".toolbar-content.controlType").find("input:checked");
			var i;

			for(i = 0; i < checkedElem.length; i++){
				var attrVal = checkedElem.eq(i).attr("data-attr");
				if(attrVal !== "All"){
					if(i < checkedElem.length - 1){
						checkedCtrlTypes += attrVal + ",";
					}else{
						checkedCtrlTypes += attrVal;
					}
				}
			}

			//개발 환경 테스트 시에는 주석 처리 후 개발 필요.
			//[SAM-521][Common] DateTime Format Encoding 요청 건으로 수정
			startTime = startTime.replace("+", "%2b");
			endTime = endTime.replace("+", "%2b");

			url = "/dms/controlHistories?dms_devices_id=" + dms_devices_id + "&serviceOrigins=" + checkedCtrlTypes + "&startTime=" + startTime + "&endTime=" + endTime;

			Loading.open(popupWindow);
			$.ajax({
				url: url
			}).done(function(data){
				if(data){
					for(i = data.length - 1; i >= 0; i--){
						if(data[i] === null){
							data.splice(i, 1);
						}
					}
					historyData = data;
				}else{
					historyData = [];
				}

				var historyDataDs = new kendo.data.DataSource({
					data: historyData,
					pageSize: 30
				});
				historyDataDs.read();

				//historyGrid.data("kendoGrid").dataSource.data(historyData); // History 그리드 데이터 바인딩
				historyGrid.data("kendoGrid").setDataSource(historyDataDs);
			}).fail(function(data){
				historyMessage.message(data.responseText);
				historyMessage.open();
			}).always(function(){
				Loading.close(popupWindow);
			});

		});
		// 그리드 내부 detail 아이콘 이벤트
		historyGrid.on("click", "[data-event=detail]", function(e){
			var target = $(this);
			var historyPopup = target.closest(".popup-window-single");
			var thisRowUid = target.closest("tr").data("uid");
			var gridData = target.closest(".k-grid").data("kendoGrid");
			var thisData = gridData.dataSource.getByUid(thisRowUid);
			var historyDetailPopup = $("#popup-history-detail").data("kendoPopupSingleWindow");
			var mapElem = $("#popup-history-detail").find(".popup-history-detail-map");
			var floorId, zoneId;

			for(var key in HistoryDetail.fields){
				if(thisData[key] == "" || typeof thisData[key] == "undefined") thisData[key] = "-";
				if(key == "time") thisData[key] = moment(thisData["time"]).format("LLL").replace(/\./g, "-"); //Date 형식 변경
			}

			historyDetailPopup.bindHistoryData(thisData);
			mapElem.empty();
			Loading.open(historyPopup);
			$.ajax({
				url: "/dms/devices/" + thisData.dms_devices_id
			}).done(function(data){
				floorId = data.locations[0].foundation_space_floors_id;
				zoneId = data.locations[0].foundation_space_zones_id;
				var deviceData = data;
				Util.getFloorDataWithImage(floorId).always(function(floor){
					historyDetailPopup.openWindowPopup();
					mapElem.kendoCommonMapView({
						width : 330,
						height : 222,
						floor : floor,
						zoneDataSource: [],
						dataSource: [deviceData],
						showDeviceInfoCheckbox : false,
						isForcedShowDevice : true,
						isDetailPopupView : true,
						hasFullScreenControl : false,
						hasLegendControl : false,
						hasZoomControl : false,
						hasDefaultZoomControl : false,
						hasColorPickerControl : false,
						hasLayerControl : false
					});
					if(zoneId){
						$.ajax({
							url: "/foundation/space/zones/" + zoneId
						}).done(function(zoneData){
						//mapMade.setZoneDataSource([zoneData]);
							mapElem.data("kendoCommonMapView").setZoneDataSource([zoneData]);
							mapElem.data("kendoCommonMapView").setDataSource([deviceData]);
						}).fail(function(xhq){
							historyMessage.message(Util.parseFailResponse(xhq));
							historyMessage.open();
						}).always(function(){
							Loading.close(historyPopup);
						});
					}else{
						Loading.close(historyPopup);
					}
				}).fail(function(){//Case of no floor Image
					historyDetailPopup.openWindowPopup();
					mapElem.css({ width: "330px", height: "220px"});
					Loading.close(historyPopup);
				}).always(function(){});
			}).fail(function(data){
				Loading.close(historyPopup);
				historyMessage.message(data.responseText);
				historyMessage.open();
			}).always(function(){});
		});

		function calcDate(){
			var start = startDate.data("kendoCommonDatePicker").value();
			var end = endDate.data("kendoCommonDatePicker").value();
			var periodDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // End date와 start date의 차이 일수
			var prevStartDate = start;
			var prevEndDate = start;
			var currentDate = new Date();

			if(periodDays > 365){ // 차이가 365 또는 366일보다 크면 End date의 1년 전으로 Start date를 지정한다.
				end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
			}
			if(start > end){ // 시작일자가 종료일자보다 나중이면 원래로 돌아온다.
				start = prevStartDate;
				end = prevEndDate;
				if((end - currentDate) > 0){ // End Date가 오늘보다 뒤이면 End Date를 오늘 날짜로 한다.
					start = new Date();
					end = new Date();
				}
			}
			if((end - currentDate) > 0){ // End Date가 오늘보다 뒤이면 End Date를 오늘 날짜로 한다.
				end = new Date();
			}

			selectedStartDate = start;
			selectedEndDate = end;
			start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0);
			end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);

			startDate.data("kendoCommonDatePicker").setDate(start);
			endDate.data("kendoCommonDatePicker").setDate(end);
		}
		/*History End*/
		/*
		New Detail Pop-up Base Configuration
	 */
		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 닫기 버튼 이벤트 Callback 함수</li>
		 *   </ul>
		 *   @function commonCloseBtnEvt
		 *   @param {Object} e - 닫기 버튼 클릭 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonCloseBtnEvt(e){
			e.sender.trigger("onClose");
			if(e.sender.isEditable){
				e.sender.setEditable(false);
			}
			//e.sender.close();
			e.sender.trigger("onClosed");
		}
		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 편집 버튼 이벤트 Callback 함수</li>
		 *   </ul>
		 *   @function commonEditBtnEvt
		 *   @param {Object} e - 편집 버튼 클릭 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonEditBtnEvt(e){
			e.sender.trigger("onEdit");
			e.sender.setEditable(true);
			e.sender.setActions(e.sender.BTN.REGISTER, { visible : false });
			e.sender.setActions(e.sender.BTN.DEREGISTER, { visible : false });
			e.sender.trigger("onEdited");
			return false;
		}
		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 취소 버튼 이벤트 Callback 함수</li>
		 *   </ul>
		 *   @function commonCancelBtnEvt
		 *   @param {Object} e - 취소 버튼 클릭 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonCancelBtnEvt(e){
			e.sender.confirmDialog
				.message(I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_CANEL"));

			var cancel = function(){
				e.sender.trigger("onCancel");
				e.sender.cancelDataSource();
				e.sender.setEditable(false);
				e.sender.setDialogType(e.sender.dialogType);
				e.sender.hideInvalidMessage();
				e.sender.hideRemoveBtn();
				e.sender.trigger("onCanceled");
			};

			if(e.sender.hasChanged){
				e.sender.confirmDialog.setConfirmActions({
					yes : function(){
						cancel();
					}
				});
				e.sender.confirmDialog.open();

			}else{
				cancel();
			}

			return false;
		}
		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 저장 버튼 이벤트 Callback 함수</li>
		 *   </ul>
		 *   @function commonSaveBtnEvt
		 *   @param {Object} e - 저장 버튼 클릭 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonSaveBtnEvt(e){
			e.sender.trigger("onSave");
			var type = e.sender.dialogType;
			//save trigger save with selected data
			var result, results;
			result = e.sender.save();

			if(!result){
				return false;
			}

			if(e.sender.isBlockEvt){
				delete e.sender.isBlockEvt;
				type = "block";
			}

			if(type == "register"){
				if(e.sender.dataSource.total() > 1){
					results = e.sender.saveAll({registrationStatus : "Registered"});
				}
				result.registrationStatus = "Registered";
				e.sender.trigger("onRegister", {
					sender : e.sender, result : result, results : results
				});
				e.sender.setActions(e.sender.BTN.REGISTER, { visible : true });
				if(typeof e.sender.BTN.BLOCK !== "undefined"){
					e.sender.setActions(e.sender.BTN.BLOCK, { visible : false });
				}
			}else if(type == "block"){

				if(e.sender.dataSource.total() > 1){
					results = e.sender.saveAll({registrationStatus : "Blocked"});
				}
				result.registrationStatus = "Blocked";
				e.sender.trigger("onBlock", {
					sender : e.sender, result : result, results : results
				});
				e.sender.setActions(e.sender.BTN.REGISTER, { visible : true });
				e.sender.setActions(e.sender.BTN.BLOCK, { visible : false});
			}else{
				if(e.sender.dataSource.total() > 1){
					results = e.sender.saveAll(null, true);
				}
				e.sender.trigger("onSaved", {
					sender : e.sender, result : result, results : results
				});
				if(type == "deregister"){
					e.sender.setActions(e.sender.BTN.DEREGISTER, { visible : true });
				}else if(type == "delete"){
					e.sender.setActions(e.sender.BTN.DELETE, { visible : true });
				}
			}
			e.sender.setEditable(false);

			//Block 버튼이 추가된 Beacon 타입 기기 일 경우 Delete 버튼의 처리가 다르다
			//Delete 는 Block해제를 의미.
			if(typeof e.sender.BTN.BLOCK !== "undefined"){
				if(type != "delete"){
					e.sender.setActions(e.sender.BTN.DELETE, { visible : false});
				}
			}

			if(type == "register" || type == "block"){
				e.sender.setActions(e.sender.BTN.EDIT, { visible : false});
			}

			return false;
		}
		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 등록 버튼 이벤트 Callback 함수</li>
		 *   </ul>
		 *   @function commonRegisterBtnEvt
		 *   @param {Object} e - 등록 버튼 클릭 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonRegisterBtnEvt(e){
			e.sender.setEditable(true);
			e.sender.setActions(e.sender.BTN.REGISTER, { visible : false });
			//Beacon에만 해당하는 버튼제어
			if(typeof e.sender.BTN.BLOCK !== "undefined"){
				e.sender.setActions(e.sender.BTN.BLOCK, { visible : false });
			}
			return false;
		}
		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 Block 버튼 이벤트 Callback 함수</li>
		 *   </ul>
		 *   @function commonBlockBtnEvt
		 *   @param {Object} e - Block 버튼 클릭 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonBlockBtnEvt(e){
			var data = e.sender.getSelectedData();
			var result = {};
			result.registrationStatus = "Blocked";
			//result.locations = [];

			var results;
			if(e.sender.dataSource.total() > 1){
			//saveAll은 변경된 데이터만 가져오므로 선택한 전체 데이터를 가져와야함.
			//results = e.sender.saveAll({registrationStatuses : "NotRegistered"});
				data = e.sender.dataSource.data();
				data = data.toJSON();

				var i, max = data.length;
				var obj;
				results = [];
				for( i = 0; i < max; i++ ){
					obj = {};
					obj.id = data[i].id;
					obj.registrationStatus = "Blocked";
					results.push(obj);
				}
			}
			e.sender.trigger("onBlock",{
				sender : e.sender,
				result : result,
				results : results
			});
			return false;
		}
		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 등록해제 버튼 이벤트 Callback 함수</li>
		 *   </ul>
		 *   @function commonDeregisterBtnEvt
		 *   @param {Object} e - 등록해제 버튼 클릭 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonDeregisterBtnEvt(e){
			var data = e.sender.getSelectedData();
			var result = {};
			result.registrationStatus = "NotRegistered";
			//result.locations = [];

			var results;
			if(e.sender.dataSource.total() > 1){
			//saveAll은 변경된 데이터만 가져오므로 선택한 전체 데이터를 가져와야함.
			//results = e.sender.saveAll({registrationStatuses : "NotRegistered"});
				data = e.sender.dataSource.data();
				data = data.toJSON();

				var i, max = data.length;
				var obj;
				results = [];
				for( i = 0; i < max; i++ ){
					obj = {};
					obj.id = data[i].id;
					obj.registrationStatus = "NotRegistered";
					results.push(obj);
				}
			}else{
				result.id = data.id;
			}

			e.sender.trigger("onDeregister",{
				sender : e.sender,
				result : result,
				results : results
			});
			return false;
		}
		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 삭제 버튼 이벤트 Callback 함수</li>
		 *   </ul>
		 *   @function commonDeleteBtnEvt
		 *   @param {Object} e - 삭제 버튼 클릭 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonDeleteBtnEvt(e){
			var data = e.sender.getSelectedData();
			var result = {};
			//result.locations = [];
			result.id = data.id;

			var results;
			if(e.sender.dataSource.total() > 1){
			//saveAll은 변경된 데이터만 가져오므로 선택한 전체 데이터를 가져와야함.
			//results = e.sender.saveAll({registrationStatuses : "NotRegistered"});
				data = e.sender.dataSource.data();
				data = data.toJSON();

				var i, max = data.length;
				var obj;
				results = [];
				for( i = 0; i < max; i++ ){
					obj = {};
					obj.id = data[i].id;
					results.push(obj);
				}
			}
			e.sender.trigger("onDelete",{
				sender : e.sender,
				result : result,
				results : results
			});
			return false;
		}

		/**
		 *   <ul>
		 *   <li>공용 상세 팝업 오픈 시, 등록/등록해제/상세팝업 등이 형식에 따라 버튼의 표시/미표시를 처리하는 Callback 함수</li>
		 *   </ul>
		 *   @function commonOnTypeChangeEvt
		 *   @param {Object} e - 팝업 오픈 시, 전달되는 Event 객체
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function commonOnTypeChangeEvt(e){
			var type = e.type;
			var BTN = e.sender.BTN;
			if(type == "register"){
				detailPopup.setActions(BTN.SAVE, { visible : false });
				detailPopup.setActions(BTN.CANCEL, { visible : false });
				detailPopup.setActions(BTN.EDIT, { visible : false });
				detailPopup.setActions(BTN.DEREGISTER, { visible : false });

				detailPopup.setActions(BTN.CLOSE, { visible : true });
				detailPopup.setActions(BTN.REGISTER, { visible : true });
			}else if(type == "deregister"){
				detailPopup.setActions(BTN.SAVE, { visible : false });
				detailPopup.setActions(BTN.CANCEL, { visible : false });
				detailPopup.setActions(BTN.REGISTER, { visible : false });

				detailPopup.setActions(BTN.CLOSE, { visible : true });
				detailPopup.setActions(BTN.EDIT, { visible : true });
				detailPopup.setActions(BTN.DEREGISTER, { visible : true });
			}else{
				detailPopup.setActions(BTN.SAVE, { visible : false });
				detailPopup.setActions(BTN.CANCEL, { visible : false });
				detailPopup.setActions(BTN.DEREGISTER, { visible : false });
				detailPopup.setActions(BTN.REGISTER, { visible : false });

				detailPopup.setActions(BTN.CLOSE, { visible : true });
				detailPopup.setActions(BTN.EDIT, { visible : true });
			}
		}

		var networkInterfereGridOptions = {
			height : 200,
			columns : [
				{ title : I18N.prop("FACILITY_DEVICE_TYPE"), field : "type", template : function(data){
					var val = "-";
					var type = data.type;
					val = type ? type : val;
					return val;
				} },
				{ title : I18N.prop("FACILITY_DEVICE_NETWORK_RSSI"), field : "rssi", template : function(data){
					var val = "-";
					var rssi = data.rssi;
					val = typeof rssi !== "undefined" ? rssi : val;
					if(val != "-"){
						val += " dBm";
					}
					return val;
				} },
				{ title : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_FREQUENCY"), field : "frequency", template : function(data){
					var val = "-";
					var frequency = data.frequency;
					val = frequency ? frequency : val;
					return val;
				} },
				{ title : I18N.prop("COMMON_TIME"), field : "scannedTime", template : function(data){
					var val = "-";
					var time = data.scannedTime;
					if(time){
						time = moment(time);
						val = time.format("LLL").replace(/\./g, "-");
					}
					return val;
				} }
			]
		};

		/**
		 *   <ul>
		 *   <li>Facility-Device에서 쓰이는 공용 상세 팝업의 기본 옵션</li>
		 *   <li>팝업 옵션과 상세 정보 조회/편집에 대한 데이터 모델의 스키마, Template, 편집 시 이벤트 처리 등이 정의되어 있다.</li>
		 *   </ul>
		 *   @type {Object}
		 *   @name baseConfig
		 *   @alias module:app/device/common/config/popup-config
		 */
		var baseConfig = {
			title : I18N.prop("COMMON_BTN_DETAIL"),
			width: 652,
			height: 830,
			gridOptions : {
				scrollable : {
					virtual : true
				}
			},
			buttonsIndex : {
				CLOSE : 0,
				EDIT : 1,
				CANCEL : 2,
				SAVE : 3,
				REGISTER : 4,
				DEREGISTER : 5,
				DELETE : 6
			},
			contentViewModel : {
				clickHistoryBtn : function(){
					var data = detailPopup.getSelectedData();
					var currentDate = new Date();
					var startTime = convertDateFormatForURL(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0));
					var endTime = convertDateFormatForURL(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59));
					historyPop.data("curDmsId", data.id);

					// 히스토리팝업 초기화
					historyPop.find("ul.toolbar-content.controlType").find("input").each(function(index, e){
						e.checked = true;
					});
					startDate.data("kendoCommonDatePicker").value(startTime);
					endDate.data("kendoCommonDatePicker").value(endTime);

					// 데이터 바인딩
					//Loading.open(deviceDetailWindow);
					//$.ajax({
					//    url: url
					//}).done(function(data){
					//  if(data){
					//      for(var i=data.length-1; i>=0; i--){
					//          if(data[i] == null){
					//              data.splice(i, 1);
					//          }
					//      }
					//      historyData = data;
					//  }else{
					//      historyData = [];
					//  }
					//    historyData = [];//No data when History popup is opened at first
					//    historyGrid.data("kendoGrid").dataSource.data(historyData); // History 그리드 데이터 바인딩
					//}).fail(function(data){
					//    historyMessage.message(data.responseText);
					//    historyMessage.open();
					//}).always(function(data){
					//    Loading.close(deviceDetailWindow);
					//});

					historyGrid.data("kendoGrid").dataSource.data([]); // History 그리드 초기화
					historyPop.kendoPopupSingleWindow("openWindowPopup"); // History 팝업 오픈

					function convertDateFormatForURL(date){
						var result = moment(date).format("YYYY-MM-DDTHH:mm:ss");
						result = result + "+09:00";
						//개발 환경 테스트 시에는 주석 처리 후 개발 필요.
						//[SAM-521][Common] DateTime Format Encoding 요청 건으로 수정
						result = result.replace("+", "%2b");
						return result;
					}
				},
				detailType : I18N.prop("COMMON_GENERAL")
			},
			contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
			detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span><button class="device-detail-header-history-btn k-button" data-bind="events: {click : clickHistoryBtn }">' + I18N.prop("FACILITY_HISTORY") + '</button></div><div class="detail-dialog-detail-content-field-list"></div>',
			listTemplate : function(data){
				var dialogType = detailPopup.dialogType;
				var isRegister = (dialogType == "register" || dialogType == "deregister") ? true : false;
				var isSelectReg = dialogType == "deregister" ? true : false;
				return Template.multiDetailListDualTemplate(data, isRegister, isSelectReg);
			},
			headerTemplate : "<span>" + I18N.prop("FACILITY_DEVICE_SELECTED_DEVICE") + ": <span>#:count #</span></span>",
			isCustomActions : true,
			//Open 시, Type에 변경 따라 버튼 제어하는 콜백
			onTypeChange : commonOnTypeChangeEvt,
			actions : [
				{
					text : I18N.prop("COMMON_BTN_CLOSE"),
					visible : true,
					action : commonCloseBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_EDIT"),
					visible : true,
					action : commonEditBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_CANCEL"),
					visible : false,
					action : commonCancelBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_SAVE"),
					visible : false,
					disabled : true,
					action : commonSaveBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_REGISTER"),
					visible : false,
					action : commonRegisterBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_DEREGISTER"),
					visible : false,
					action : commonDeregisterBtnEvt
				}
			],
			scheme : {
				id: "id",
				fields : {
					type : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_TYPE"),
						template : Util.getDetailDisplayTypeDeviceI18N
					},
					tagName : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_TAG_NAME"),
						template : function(data){
							var value = "-";
							if(data.controlPoint && data.controlPoint.tagName){
								value = data.controlPoint.tagName;
							}

							return value;
						}
					},
					id : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_DEVICE_ID")
					},
					name : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_DEVICE_NAME"),
						editCss : {
							width : "100%"
						},
						validator : {
							type : "name",
							required : true
						},
						hasInputRemoveBtn : true,
						editable : true
					},
					meterType : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPES"),
						template : DeviceUtil.getMeterType,
						editable : true,
						editFieldName : "type",
						editTemplate : function(){
							return "<input data-role='dropdownlist' data-text-field='displayType' data-value-field='type' data-bind='value:fields.type, source: typeList, events:{change:changeTypeList}, disabled:disabled' style='width:216px;'/>";
						},
						editViewModel : {
							fields : {
								type : null
							},
							disabled : false,
							init : function(){
								// if(!this.fields.type){
								// 	this.fields.type = "Meter.WattHour";
								// }
								var selectedItem = detailPopup.getSelectedData();
								//DMS의 하위 기기는 미터 타입, 연결 타입, 소비 카테고리 편집 불가
								if(selectedItem.parentType == "AirConditionerController.DMS"){
									this.disabled = true;
								}else{
									this.disabled = false;
								}
							},
							typeList : [{
								displayType : I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_WATTHOUR"),
								type : "Meter.WattHour"
							}, {
								displayType : I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_GAS"),
								type : "Meter.Gas"
							},{displayType : I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_WATER"),
								type : "Meter.Water"
							}],
							changeTypeList : function(e){
								var type = e.sender.value();
								var consumptionCategoryViewModel = detailPopup.editFields.consumptionCategory.viewModel;
								var connectionTypeViewModel = detailPopup.editFields.sacConnectionType.viewModel;
								this.fields.set("type", type);
								//소비 카테고리 타입 리스트 초기화
								consumptionCategoryViewModel.set("meterType", type);
								consumptionCategoryViewModel.fields.set("category", "AirConditionerAll");
								consumptionCategoryViewModel.set("typeList", DeviceUtil.getConnectedDevicesConsumptionTypeList(type));
								//SAC 연결 타입 리스트 초기화
								connectionTypeViewModel.set("meterType", type);
								connectionTypeViewModel.set("consumptionType", "AirConditionerAll");
								connectionTypeViewModel.fields.set("connectedDeviceType", "None");
								connectionTypeViewModel.set("disabled", false);
								connectionTypeViewModel.set("typeList", DeviceUtil.getConnectedDevicesConnectionTypeList(type, "AirConditionerAll"));

								detailPopup.setEditableFieldElem("connectedDevices", false);
								detailPopup.enableSaveBtn();
							}
						}
					},
					pointMeterType : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPES"),
						template : DeviceUtil.getMeterType,
						editable : true,
						editFieldName : "mappedType",
						editTemplate : function(){
							return "<input data-role='dropdownlist' data-text-field='displayType' data-value-field='type' data-bind='value:fields.mappedType, source: typeList, events:{change:changeTypeList}, disabled:disabled' style='width:216px;'/>";
						},
						editViewModel : {
							fields : {
								mappedType : null
							},
							disabled : false,
							init : function(){
								// if(!this.fields.mappedType){
								// 	this.fields.mappedType = "Meter.WattHour";
								// }
								var selectedItem = detailPopup.getSelectedData();
								//DMS의 하위 기기는 미터 타입, 연결 타입, 소비 카테고리 편집 불가
								if(selectedItem.parentType == "AirConditionerController.DMS"){
									this.disabled = true;
								}else{
									this.disabled = false;
								}
							},
							typeList : [{
								displayType : I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_WATTHOUR"),
								type : "Meter.WattHour"
							}, {
								displayType : I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_GAS"),
								type : "Meter.Gas"
							},{displayType : I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_WATER"),
								type : "Meter.Water"
							}],
							changeTypeList : function(e){
								var type = e.sender.value();
								var consumptionCategoryViewModel = detailPopup.editFields.consumptionCategory.viewModel;
								var connectionTypeViewModel = detailPopup.editFields.sacConnectionType.viewModel;
								this.fields.set("mappedType", type);
								//소비 카테고리 타입 리스트 초기화
								consumptionCategoryViewModel.set("meterType", type);
								consumptionCategoryViewModel.fields.set("category", "AirConditionerAll");
								consumptionCategoryViewModel.set("typeList", DeviceUtil.getConnectedDevicesConsumptionTypeList(type));
								//SAC 연결 타입 리스트 초기화
								connectionTypeViewModel.set("meterType", type);
								connectionTypeViewModel.set("consumptionType", "AirConditionerAll");
								connectionTypeViewModel.fields.set("connectedDeviceType", "None");
								connectionTypeViewModel.set("disabled", false);
								connectionTypeViewModel.set("typeList", DeviceUtil.getConnectedDevicesConnectionTypeList(type, "AirConditionerAll"));

								detailPopup.setEditableFieldElem("connectedDevices", false);
								detailPopup.enableSaveBtn();
							}
						}
					},
					consumptionCategory : {
						type : "object",
						name : I18N.prop("FACILITY_DEVICE_CONSUMPTION_CATEGORY_TYPE"),
						template : DeviceUtil.getMeterCategoryType,
						editable : true,
						editTemplate : function(){
							return "<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.category, source: typeList, events:{change:changeTypeList}, disabled:disabled' style='width:216px;'/>";
						},
						editFieldName : "meters[0]",
						editViewModel : {
							fields : {
								id : 0,
								category : null
							},
							disabled : false,
							meterType : null,
							init : function(){
								if(!this.fields.category){
									this.fields.category = "Others";
								}

								var selectedItem = detailPopup.getSelectedData();
								//DMS의 하위 기기는 미터 타입, 연결 타입, 소비 카테고리 편집 불가
								if(selectedItem.parentType == "AirConditionerController.DMS"){
									this.disabled = true;
								}else{
									this.disabled = false;
								}

								var meters = selectedItem.meters;
								if(meters && meters[0]){
									this.fields.id = meters[0].id;
								}
								this.meterType = selectedItem.mappedType || selectedItem.type;
								this.typeList = DeviceUtil.getConnectedDevicesConsumptionTypeList(this.meterType);
							},
							typeList : [],
							changeTypeList : function(e){
								var type = e.sender.value();
								var connectionTypeViewModel = detailPopup.editFields.sacConnectionType.viewModel;
								this.fields.set("category", type);
								var connectionTypeList = DeviceUtil.getConnectedDevicesConnectionTypeList(this.meterType, type);
								//SAC 연결 타입 리스트 초기화
								connectionTypeViewModel.set("typeList", connectionTypeList);
								connectionTypeViewModel.set("consumptionType", type);
								connectionTypeViewModel.fields.set("connectedDeviceType", "None");
								connectionTypeViewModel.set("disabled", type !== "AirConditionerAll");
								detailPopup.setEditableFieldElem("connectedDevices", false);
								detailPopup.enableSaveBtn();
							}
						}
					},
					sacConnectionType : {
						type : "object",
						name : I18N.prop("FACILITY_DEVICE_SAC_CONNECTION_TYPE"),
						template : function(data){
							var i, meters, max, val = "", type;
							meters = data.meters;
							if(meters){
								max = meters.length;
								for( i = 0; i < max; i++ ){
									type = meters[i].connectedDeviceType;
									if(type){
										val += Util.getDetailDisplayType(type);
										if(i != (max - 1)){
											val += ", ";
										}
									}
								}
							}
							val = val ? Util.getDetailDisplayTypeDeviceI18N(val) : "None";
							return val;
						},
						editable : true,
						editTemplate : function(){
							return "<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.connectedDeviceType, source: typeList, events:{change:changeTypeList}, disabled:disabled' style='width:216px;'/>";
						},
						editFieldName : "meters[0]",
						editViewModel : {
							fields : {
								id : 0,
								connectedDeviceType : null
							},
							disabled : false,
							meterType : null,
							consumptionType : null,
							init : function(){
								if(!this.fields.connectedDeviceType){
									this.fields.connectedDeviceType = "None";
								}

								var selectedItem = detailPopup.getSelectedData();
								this.meterType = selectedItem.mappedType || selectedItem.type;
								this.consumptionType = selectedItem.meters && selectedItem.meters[0] && selectedItem.meters[0].category || "None";
								//DMS의 하위 기기는 미터 타입, 연결 타입, 소비 카테고리 편집 불가
								if(selectedItem.parentType == "AirConditionerController.DMS"){
									this.disabled = true;
								}else{
									this.disabled = this.consumptionType !== "AirConditionerAll";
								}

								var meters = selectedItem.meters;
								if(meters && meters[0]){
									this.fields.id = meters[0].id;
								}
								this.typeList = DeviceUtil.getConnectedDevicesConnectionTypeList(this.meterType, this.consumptionType);
								detailPopup.setEditableFieldElem("connectedDevices", this.meterType === "Meter.WattHour" && this.consumptionType === "AirConditionerAll" && this.fields.connectedDeviceType === "AirConditionerOutdoor");
							},
							typeList : [],
							changeTypeList : function(e){
								var type = e.sender.value();
								var canUseConnectedDevices = this.meterType === "Meter.WattHour" && this.consumptionType === "AirConditionerAll" && type === "AirConditionerOutdoor";
								this.fields.set("connectedDeviceType", type);
								detailPopup.setEditableFieldElem("connectedDevices", canUseConnectedDevices);
								detailPopup.enableSaveBtn();
							}
						}
					},
					representativeStatus : {
						type : "text",
						name : I18N.prop("COMMON_STATUS"),
						template : Template.detailStatusIconTemplate
					},
					//Position Type
					configuration : {
						type : "object",
						name : I18N.prop("FACILITY_DEVICE_BEACON_POSITION_TYPE"),
						template : function(data){
							var val = "-";
							var conf = data.configuration;
							if(conf && conf.mobilityType){
								val = conf.mobilityType;
								val = val ? val : "-";
							}
							return val;
						},
						editable : true,
						editFieldName : "configuration",
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="positionType" id="position-fixed" checked="" value="Fixed" data-bind="checked:fields.mobilityType, click:clickRadio"><label class="k-radio-label" for="position-fixed" style="margin-right:51px;">Fixed</label><input type="radio" class="k-radio" name="positionType" id="position-movable" checked="" value="Movable" data-bind="checked:fields.mobilityType, click:clickRadio"><label class="k-radio-label" for="position-movable">Movable</label></div>';
						},
						editViewModel : {
							fields : {
								mobilityType : null
							},
							init : function(){
								if(!this.fields.mobilityType){
									this.fields.mobilityType = "Fixed";
								}
								this.positionTypeChecked = this.fields.mobilityType;
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						}
					},
					pointValue : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_VALUE"),
						template : DeviceUtil.getPointValue
					},
					pointMode : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_MODE"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.mode !== "undefined"){
								var mode = point.mode;
								if(mode == 1){
									value = "Normal";
								}else if(mode == 2){
									value = "Counter";
								}
							}
							return value;
						}
					},
					signalLogicStatus : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_SIGNAL_LOGIC_STATUS"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.signalLogicStatus !== "undefined"){
								value = point.signalLogicStatus;
							}
							return value;
						}
					},
					signalReverse : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_SIGNAL_REVERSE"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.signalReverse !== "undefined"){
								value = point.signalReverse ? "Yes" : "No";
							}
							return value;
						}
					},
					inputRange : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_INPUT_RANGE"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.inputRange !== "undefined"){
								value = point.inputRange;
								if(value == "+-10V"){
									value = "+/- 10V";
								}else if(value == "+-2.5V"){
									value = "+/- 2.5V";
								}
							}
							return value;
						}
					},
					scaleType : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_SCALE_TYPE"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.scaleType !== "undefined"){
								value = point.scaleType;
							}
							return value;
						}
					},
					scale : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_SCALE"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.scale !== "undefined"){
								value = point.scale;
							}
							return value;
						}
					},
					bias : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_BIAS"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.bias !== "undefined"){
								value = point.bias;
							}
							return value;
						}
					},
					maxValue : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_MAX_VALUE"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.maximumValue !== "undefined"){
								value = point.maximumValue;
							}
							return value;
						}
					},
					minValue : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_MIN_VALUE"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && typeof point.minimumValue !== "undefined"){
								value = point.minimumValue;
							}
							return value;
						}
					},
					ioDescription : {
						type : "text",
						name : I18N.prop("FACILITY_POINT_IO_DESCRIPTION"),
						template : function(data){
							var value = "-";
							var point = data.controlPoint;
							if(point && point.ioDescription){
								value = point.ioDescription;
							}
							return value;
						}
					},
					modes : {
						type : "text",
						name : I18N.prop("FACILITY_INDOOR_CONTROL_OPERATION_MODE"),
						template : function(dataItem){
							var modes = dataItem.modes;
							if(modes && modes.length > 0){
								return Util.getDisplayModeI18N(modes, dataItem.operations, true);
							}
							return "-";
						}
					},
					outdoorTemperature : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_OUTDOOR_TEMPERATURE"),
						template : DeviceUtil.curOutdoorTemperature
					},
					setTemperature : {
						type : "text",
						name : I18N.prop("FACILITY_INDOOR_SET_TEMPERATURE"),
						template : DeviceUtil.setTemperatures
					},
					currentTemperature : {
						type : "text",
						name : I18N.prop("FACILITY_INDOOR_CURRENT_TEMPERATURE"),
						template : DeviceUtil.curTemperatures
					},
					remoteControl : {
						type : "text",
						name : I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL"),
						template : function(dataItem){
							var conf = dataItem.configuration;
							if(conf && conf.remoteControl){
								if(conf.remoteControl === "Allowed") return I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL_ENABLE");
								else if(conf.remoteControl === "NotAllowed") return I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL_DISABLE");
								return I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_CONDITIONAL");
							// return conf.remoteControl;
							}
							return "-";
						}
					},
					locations : {
						type : "array",
						name : I18N.prop("COMMON_LOCATION"),
						editable : true,
						template : DeviceUtil.getLocation,
						editTemplate : function(){

						/*var locations = dataItem.locations;
						if(locations && locations[0]){
							editViewModel.fields.foundation_space_buildings_id = locations[0].foundation_space_buildings_id;
							editViewModel.fields.foundation_space_floors_id = locations[0].foundation_space_floors_id;
							editViewModel.fields.foundation_space_zones_id = locations[0].foundation_space_zones_id;
							editViewModel.fields.geometry = locations[0].geometry;
						}*/
						//Dialog 내에서 Setting 되게 수정함. 예외 Case를 대비해 예제로 남겨둠.

							return "<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.foundation_space_buildings_id, source: buildingList, events:{change:changeBuildingList, dataBound:dataBoundBuildingList}' style='width:95px;margin-right:10px;'/>" +
						"<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.foundation_space_floors_id, source: floorList, events:{change:changeFloorList, dataBound:dataBoundFloorList}' style='width:95px;margin-right:10px;'/>" +
						"<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.foundation_space_zones_id, source: zoneList, events:{change:changeZoneList, dataBound:dataBoundZoneList}' style='width:95px;margin-right:10px;'/>" +
						"<button type='button' class='ic-bt-map popup-btn k-button k-button-icon' data-bind='events:{click:onMapBtnClick}, disabled:isMapBtnDisabled'></button>";
						},
						editViewModel : {
							initialFieldsOnClose : function(e){
								this.fields.foundation_space_buildings_id = null;
								this.fields.foundation_space_floors_id = null;
								this.fields.foundation_space_zones_id = null;
							},
							initialFieldsOnCloseBinded : null,
							init : function(){
								this.isMapBtnDisabled = true;
								var floorData = MainWindow.getCurrentFloor();
								var building = floorData.building;
								var floor = floorData.floor;
								var type = detailPopup.dialogType;
								this.isSetFloorList = false;
								this.isSetZoneList = false;

								//최초 현재 ViewModel이 this로 바인딩 된 함수를 생성
								if(!this.initialFieldsOnCloseBinded){
									this.initialFieldsOnCloseBinded = this.initialFieldsOnClose.bind(this);
								}

								//언바인딩 후 바인딩하여 팝업창이 닫힐 때, 각 건물/층/존 정보의 id 값을 초기화하도록 한다.
								detailPopup.unbind("onClose", this.initialFieldsOnCloseBinded);
								detailPopup.bind("onClose", this.initialFieldsOnCloseBinded);

								if(type == "register"){
									detailPopup.options.enableSaveBtnCondition = function(){
										var locationFields = this.editFields.locations;
										if(locationFields && locationFields.viewModel){
											var floorId = locationFields.viewModel.fields.get("foundation_space_floors_id");
											if(typeof floorId !== "undefined" && floorId !== null){
												return true;
											}
										}
										return false;
									};
								}else{
									detailPopup.options.enableSaveBtnCondition = null;
								}

								if( (type == "register" || !this.fields.foundation_space_buildings_id)
								&& building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
									this.fields.foundation_space_buildings_id = building.id;
								}

								if( (type == "register" || !this.fields.foundation_space_floors_id) && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
									this.fields.foundation_space_floors_id = floor.id;
									if(type == "register"){
										this.fields.foundation_space_zones_id = null;
									}
									if(floor.id !== null && typeof floor.id !== "undefined"){
										detailPopup.enableSaveBtn();
									}
								}
							},
							fields : {
								nameDisplayCoordinate : null,
								id : "Fixed",
								foundation_space_buildings_id : null,
								foundation_space_floors_id : null,
								foundation_space_zones_id : null,
								description : null,
								geometry : null
							},
							checkBtnDisabled : function(isRegister){
								var buildingId = this.fields.get("foundation_space_buildings_id");
								var floorId = this.fields.get("foundation_space_floors_id");
								if(isRegister){
									if(buildingId === null || floorId === null){
										detailPopup.disableSaveBtn();
									}else{
										detailPopup.enableSaveBtn();
									}
								}

								if(floorId === null){
									this.set("isMapBtnDisabled", true);
								}else{
									this.set("isMapBtnDisabled", false);
								}
							},
							//AJAX로 데이터를 가져와 Set한 Case와 ViewModel 바인딩된 Case 시에 호출되는 DataBound 이벤트를 구분하기위한 Boolean 변수
							isSetFloorList : false,
							isSetZoneList : false,
							isMapBtnDisabled : true,
							buildingList : MainWindow.getCurrentBuildingList(),
							floorList : [],
							zoneList : [],
							centerZoneId : 0,
							centerCoordinate : [],
							setSelectedLocation : function(buildingId, floorId, zoneId, description){
								var index = detailPopup.selectedIndex;
								var ds = detailPopup.dataSource;
								var data, datas = ds.data();
								var i, max = datas.length;
								if(index == 0){
									for( i = 0; i < max; i++ ){
										data = datas[i];
										if(!data){
											continue;
										}
										if(!data.locations){
											data.locations = [];
										}
										if(!data.locations[0]){
											data.locations.push({ id : "Fixed" });
										}

										data.locations[0].foundation_space_buildings_id = buildingId;
										data.locations[0].foundation_space_floors_id = floorId;
										data.locations[0].foundation_space_zones_id = zoneId;
										data.locations[0].description = description;
									}
								}
							},
							setLocationDescription : function(buildingName, floorName, zoneName){
								var split, description = this.fields.get("description");
								if(description){
									split = description.split(", ");
									if(buildingName){
										split[0] = buildingName;
									}
									if(floorName){
										split[1] = floorName;
									}else{
										split[1] = "";
									}

									if(zoneName){
										split[2] = zoneName;
									}else{
										split[2] = "";
									}
									var i, max = split.length;
									for( i = max - 1; i >= 0; i-- ){
										if(!split[i]){
											split.splice(i, 1);
										}
									}
									description = split.join(", ");
								}else if(buildingName && floorName && zoneName){
									description = buildingName + ", " + floorName + ", " + zoneName;
								}else if(buildingName && floorName){
									description = buildingName + ", " + floorName;
								}else if(buildingName){
									description = buildingName;
								}

								this.fields.set("description", description);
								return description;
							},
							dataBoundBuildingList : function(e){
								this.changeBuildingList(e, true);
							},
							changeBuildingList : function(e, isBoundEvt){
								var self = this;
								var buildingId;
								if(isBoundEvt){
									buildingId = self.fields.get("foundation_space_buildings_id");
									e.sender.value(buildingId);
									if(!buildingId){
										return;
									}
								}else{
									buildingId = e.sender.value();
									self.fields.set("foundation_space_buildings_id", buildingId);
								}

								var buildingText = e.sender.text();
								this.set("buildingText", buildingText);
								var desc = self.setLocationDescription(buildingText);
								this.setSelectedLocation(buildingId, null, null, desc);

								Loading.open(detailPopup.element);
								$.ajax({
									url : "/foundation/space/floors?foundation_space_buildings_id=" + buildingId
								}).done(function(data){
									var i, max = data.length;
									var type, name;
									data.sort(function(a, b){
										return a.sortOrder - b.sortOrder;
									});
									for( i = 0; i < max; i++ ){
										type = data[i].type;
										name = data[i].name;
										if(type == "F"){
											data[i].name = name + type;
										}else if(type == "B"){
											data[i].name = type + name;
										}else{
											data[i].name = name;
										}
									}
									self.set("isSetFloorList", true);
									self.set("floorList", data);
									if(data.length < 1){
										self.fields.set("foundation_space_floors_id", null);
										self.set("zoneList", []);
									}
								}).fail(function(xhq){
									var msg = Util.parseFailResponse(xhq);
									detailPopup.msgDialog.message(msg);
									detailPopup.msgDialog.open();
								}).always(function(){
									Loading.close();
									var isRegister = detailPopup.dialogType == "register" ? true : false;
									//if(!isBoundEvt){
									self.checkBtnDisabled(isRegister);
								//}
								});
							},
							dataBoundFloorList : function(e){
							// console.log(e);
								this.changeFloorList(e, true);
							},
							changeFloorList : function(e, isBoundEvt){
								var self = this;
								var buildingId = self.fields.get("foundation_space_buildings_id");
								var floorId;
								if(isBoundEvt){
									floorId = self.fields.get("foundation_space_floors_id");
									e.sender.value(floorId);

									var val = e.sender.value();

									var curFloorList = this.get("floorList");
									var isSetFloorList = this.get("isSetFloorList");
									//현재 Device가 갖고 있는 Floor 정보가 콤보박스에 선택된 층에 없는 Floor 일 Case를 처리한다.
									if(floorId && curFloorList && isSetFloorList){
										var findFloor = new kendo.data.Query(curFloorList).filter({
											field : "id", operator : "eq", value : floorId
										}).toArray();
										if(findFloor.length < 1){
											floorId = null;
										}
									}

									// Floor 콤보박스에 Floor List가 바인딩 되기 전에도 호출되므로, 예외처리 추가
									if(!floorId && !val){
										self.fields.set("foundation_space_floors_id", null);
									}
									if(!floorId){
										return;
									}
								}else{
									floorId = e.sender.value();
									self.fields.set("foundation_space_floors_id", floorId);
									detailPopup.hasChanged = true;
								}
								var floorText = e.sender.text();
								this.set("floorText", floorText);
								var desc = self.setLocationDescription(this.get("buildingText"), floorText);
								this.setSelectedLocation(buildingId, floorId, null, desc);

								Loading.open(detailPopup.element);
								//선택한 층의 중앙 좌표를 얻어오기 위하여 Image를 얻어온다.
								//만약 층만 선택했을 경우 해당 층의 가운데 존이 존재하면 해당 존에 속해야하고, 존이 속하지 않으면 중앙 좌표로 설정되어야한다.
								Util.getFloorDataWithImage(floorId).always(function(floor){
									$.ajax({
										url : "/foundation/space/zones?foundation_space_buildings_id=" + buildingId + "&foundation_space_floors_id=" + floorId
									}).done(function(data){
										data.sort(function(a, b){
											return a.sortOrder - b.sortOrder;
										});

										var centerCoordinate = Util.getCenterMap(floor.imageWidth, floor.imageHeight);
										var centerZoneId = Util.getCenterZoneId(data, centerCoordinate);
										self.set("centerZoneId", centerZoneId);
										self.set("centerCoordinate", centerCoordinate);
										self.set("isSetZoneList", true);
										self.set("zoneList", data);

										if(data.length < 1){
											self.fields.set("foundation_space_zones_id", null);
											//층 선택 시, 해당 층에 Zone이 존재하지 않을 경우 중앙 좌표로 설정
											if(!isBoundEvt){
												self.fields.set("geometry", {
													type : "Point",
													coordinates : centerCoordinate
												});
											}
										}else if(!self.fields.get("geometry") && !self.fields.get("foundation_space_zones_id")){
											//기기 등록이고, 층 선택 시, 현재 기기에 설정된 좌표나 Zone이 없을 경우 해당 층에 Zone이 존재할 경우 중앙에 있는 Zone으로 설정
											self.fields.foundation_space_zones_id = centerZoneId;
										}
									}).fail(function(xhq){
										var msg = Util.parseFailResponse(xhq);
										detailPopup.msgDialog.message(msg);
										detailPopup.msgDialog.open();
									}).always(function(){
										Loading.close();
										if(!isBoundEvt){
											self.checkBtnDisabled(true);
										}
									});
								});
							},
							dataBoundZoneList : function(e){
							// console.log(e);
								this.changeZoneList(e, true);
							},
							changeZoneList : function(e, isBoundEvt){
								var self = this;
								var zoneId = null;
								var buildingId = self.fields.get("foundation_space_buildings_id"),
									floorId = self.fields.get("foundation_space_floors_id");
								if(isBoundEvt){
									var fieldZoneId = self.fields.get("foundation_space_zones_id");
									e.sender.value(fieldZoneId);
									zoneId = fieldZoneId;
									var val = e.sender.value();

									var curZoneList = this.get("zoneList");
									//현재 Device가 갖고 있는 Zone 정보가 콤보박스에 선택된 층에 없는 Zone 일 Case를 처리한다.
									var isSetZoneList = this.get("isSetZoneList");
									if(fieldZoneId && curZoneList && isSetZoneList){
										var findZone = new kendo.data.Query(curZoneList).filter({
											field : "id", operator : "eq", value : fieldZoneId
										}).toArray();
										if(findZone.length < 1){
											fieldZoneId = null;
											zoneId = null;
										}
									}

									//현재 Device가 갖고 있는 Zone 정보가 드롭다운 리스트 내에 없는 Zone 일 경우
									//Zone 콤보박스에 Zone List가 바인딩 되기 전에도 호출되므로, !val 예외처리 추가
									if(!fieldZoneId && !val){
										//기기 위치 정보가 없을 경우
										if(!self.fields.get("geometry")){
											zoneId = self.get("centerZoneId");
											self.fields.set("foundation_space_zones_id", zoneId);
											//빌딩, 층 선택 후 Zone이 없는 경우는 좌표 값을 중앙 좌표로 설정
											var centerCoordinate = self.get("centerCoordinate");
											if(centerCoordinate.length){
												self.fields.set("geometry", {
													type : "Point",
													coordinates : centerCoordinate
												});
											}
										}else{	//Zone이 없는 경우 Zone 값 삭제를 위하여 0으로 설정
											zoneId = 0;
											self.fields.set("foundation_space_zones_id", zoneId);
										}
									}
								//self.fields.set("foundation_space_zones_id", val);
								}else{
									zoneId = e.sender.value();
									var geometry = self.fields.get("geometry");
									self.fields.set("foundation_space_zones_id", zoneId);
									detailPopup.hasChanged = true;

									//Zone 선택 시, Zone의 가운데 포인트로 이동되도록 한다.
									var points = {
										coordinates : null,
										type : "Point"
									};
									if(self.fields.locations && self.fields.locations[0]){
									//deviceItem.locations[0].set("foundation_space_zones_id", zoneId);
										self.fields.locations[0].set("foundation_space_zones_id", zoneId);
										self.fields.locations[0].set("geometry", geometry);
									}else{
										self.fields.set("locations", [{
											foundation_space_buildings_id : buildingId,
											foundation_space_floors_id : floorId,
											foundation_space_zones_id : zoneId,
											geometry : geometry
										}]);
									}

									//get center zone point
									Loading.open(detailPopup.element);
									$.ajax({
										url : "/foundation/space/zones/" + zoneId
									}).done(function(data){
										if(data.geometry){
											if(data.geometry.coordinates && data.geometry.coordinates[0]){
												var coordinate = data.geometry.coordinates[0];
												var center = Util.getCentroid(coordinate);
												points.coordinates = center;
												self.fields.set("geometry", points);
											}
										}
									}).fail(function(){
									// console.error(data);
									}).always(function(){
										Loading.close();
									});

									self.checkBtnDisabled(true);
								}
								var zoneText = e.sender.text();
								this.set("zoneText", zoneText);
								var desc = self.setLocationDescription(this.get("buildingText"), this.get("floorText"), zoneText);
								this.setSelectedLocation(buildingId, floorId, zoneId, desc);
							},
							onMapBtnClick : function(e){
								var mapBox = $("<div/>").addClass("device-detail-map-view-box");
								var self = this;
								var buildingId = self.fields.get("foundation_space_buildings_id");
								var floorId = self.fields.get("foundation_space_floors_id");
								var geometry = self.fields.get("geometry");
								Loading.open(detailPopup.element);
								Util.getFloorDataWithImage(floorId).always(function(floor){
									$.ajax({ url : "/foundation/space/zones?foundation_space_buildings_id=" + buildingId + "&foundation_space_floors_id=" + floorId }).done(function(zoneList){
										var deviceItem = detailPopup.getSelectedData();
										if(zoneId){
											if(deviceItem.locations && deviceItem.locations[0]){
												deviceItem.locations[0].set("foundation_space_zones_id", zoneId);
												deviceItem.locations[0].set("geometry", geometry);
											}else{
												deviceItem.set("locations", [{
													foundation_space_buildings_id : buildingId,
													foundation_space_floors_id : floorId,
													foundation_space_zones_id : zoneId,
													geometry : geometry
												}]);
											}
										}

										var isRegister = detailPopup.dialogType == "register" ? true : false;

										var points = {
											coordinates : null,
											type : "Point"
										};
										var zoneId = null, zoneName = "", nameDisplayCoordinate;

										mapPopup.content(mapBox);
										mapPopup.setActions(1, { action : function(){
										/*해당 위치에 Zone이 있으면 Zone ID 변경*/
											if(points.coordinates){
												self.fields.set("geometry", points);
												if(!deviceItem.locations){
													deviceItem.set("locations", [{}]);
												}
												if(!deviceItem.locations[0]){
													deviceItem.locations.push({});
												}
												deviceItem.locations[0].set("geometry", points);
												detailPopup.hasChanged = true;
												if(zoneId){
													self.fields.set("foundation_space_zones_id", Number(zoneId));
												}else{
												//위치 좌표가 존재하는 경우에는 Zone Id를 0으로 주어 zone 삭제 동작을 수행토록한다.
													self.fields.set("foundation_space_zones_id", 0);
												}
												if(zoneName){
													self.set("zoneText", zoneName);
													self.setLocationDescription(self.get("buildingText"), self.get("floorText"), zoneName);
												}
											}

											if(nameDisplayCoordinate){
												self.fields.set("nameDisplayCoordinate", nameDisplayCoordinate);
											}
											self.checkBtnDisabled(true);
										}});
										mapPopup.element.css("overflow", "auto");
										mapPopup.open();
										var mapView = mapBox.kendoCommonMapView({
											dataSource : [deviceItem],
											zoneDataSource : zoneList,
											floor :floor,
											isForcedShowDevice : true,
											isDetailPopupView : true,
											canDragDeviceIcon : true,
											isRegisterView : isRegister,
											width : 668,
											height : 527,
											hasLegendControl : deviceItem.type.indexOf("Outdoor") === -1
										}).data('kendoCommonMapView');
										mapView.bind("dragend", function(evt){
											var devices = evt.devices;
											var device = devices[0], locations, zone;
											if(device){
												if(device.nameDisplayCoordinate){
													nameDisplayCoordinate = device.nameDisplayCoordinate;
												}
												if(device.locations){
													locations = device.locations[0];
													points.coordinates = locations.geometry.coordinates;
													zoneId = locations.foundation_space_zones_id;
													if(zoneId){
														zone = evt.sender.zoneDataSource.get(zoneId);
														zoneName = zone.name;
													}
												}
											}else{
												console.error("device is not found when device move end");
											}
										});
									}).fail(function(xhq){
										var msg = Util.parseFailResponse(xhq);
										console.error(msg);
									}).always(function(){
										Loading.close();
									});
								});
							}
						}
					},
					currentLocations : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_CURRENT_LOCATION"),
						template : DeviceUtil.getCurrentLocation
					},
					groups : {
						type : "text",
						name : I18N.prop("FACILITY_GROUP_GROUP"),
						template : DeviceUtil.getGroup
					},
					weatherStation : {
						type : "object",
						name : I18N.prop("FACILITY_DEVICE_TEMP_HUM_WEATHER_STATION"),
						template : DeviceUtil.getTempWeatherStationOx,
						editable : true,
						editFieldName : "configuration",
						editTemplate : function(data, editVm){
							var config = data.configuration;
							var checked = "";
							if(config && config.locationType){
								checked = config.locationType == "Outdoor" ? "checked" : "";
								var checkedBoolean = checked == "checked" ? true : false;
								editVm.checked = checkedBoolean;
							}
							return "<div style='line-height:38px;'><input type='checkbox' id='weather-station' class='k-checkbox' data-bind='checked:checked, events:{click:clickChecked}'" + checked + "/><label style='padding-left:20px;' class='k-checkbox-label' for='weather-station'>&nbsp;</label></div>";
						},
						editViewModel : {
							init : function(){},
							fields : {
								locationType : "Indoor"
							},
							checked : false,
							clickChecked : function(e){
							// console.log(e);
								var checked = $(e.target).prop("checked");
								//change 될 경우 save 버튼 활성화
								detailPopup.enableSaveBtn();
								var val = checked == true ? "Outdoor" : "Indoor";
								this.fields.set("locationType", val);
							}
						}
					},
					parentId : {
						type : "text",
						name : "Parent ID",
						template : function(data){
							var val = "-";
							if(data.parentId){
								val = data.parentId;
							}
							return val;
						}
					},
					macAddress : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"),
						template : DeviceUtil.getMacAddress
					},
					ipAddress : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_IP_ADDRESS"),
						template : DeviceUtil.getIpAddress
					},
					brightness : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS"),
						template : DeviceUtil.getDimmingLevel
					},
					colorTemperature : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_LIGHT_COLOR_TEMPERATURE"),
						template : function(){
							var val = "-";
							return val;
						}
					},
					temperatureUnit : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_TEMP_HUM_TEMPERATURE_UNIT"),
						template : function(data){
							var val = "-";
							var unit, temp = data.temperatures;
							if(temp && temp[0]){
								temp = temp[0];
								unit = temp.unit;
								unit = Util.CHAR[unit];
								val = unit ? unit : "-";
							}
							return val;
						}
					},
					sensorTemperature : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_TEMP_HUMI_CURRENT_TEMPERATURE"),
						template : DeviceUtil.getTempHumiTemperature
					},
					humidity : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_TEMP_HUM_CURRENT_HUMIDITY"),
						template : DeviceUtil.getTempHumiHumidity
					},
					dataStatus : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_CCTV_DATA_STATUS"),
						template : DeviceUtil.getCCTVDataStatus
					},
					bleMacAddress : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"),
						template : DeviceUtil.getBleMacAddress
					},
					signalLevel : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_SIGNAL_LEVEL_RSSI"),
						template : DeviceUtil.getBleSignalLevel
					},
					batteryLevel : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_BATTERY_LEVEL"),
						template : function(data){
							var val = DeviceUtil.getBleBatteryLevel(data);

							if (val == "999" || val == 999) {
								val = "-";
							}
							if(val != "-"){	// add comparing with 999
								val += " %";
							}
							return val;
						}
					},
					/* lastDetectedTime : {
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_TEMP_HUM_LAST_EVENT_TIME"),
					template : function(data){
						var val = "-";
						var presence = data.presences;
						if(presence && presence[0]){
							presence = presence[0];
							val = presence.lastDetectedTime
							val = val ? moment(presence.lastDetectedTime).format("LLL") : "-";
						}
						return val;
					}
				}, */
					lastEventTime : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_TEMP_HUM_LAST_EVENT_TIME"),
						template : function(data){
							var val = "-";
							var info = data.information;
							if(info && info.updatedTime){
								val = moment(info.updatedTime).format("LLL");
							}
							return val;
						}
					},
					presence : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE"),
						template : DeviceUtil.getMotionPresence
					},
					currentConsumption : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_CURRENT_CONSUMPTION"),
						template : DeviceUtil.getMeterCurrentConsumptionUnit
					},
					totalConsumption : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_TOTAL_CONSUMPTION"),
						template : function(data){
							var i, meters, max, val = "", current;
							meters = data.meters;
							if(meters){
								max = meters.length;
								for( i = 0; i < max; i++ ){
									current = meters[i].reading;
									if(current !== null && typeof current !== "undefined"){
										val += current;
										if(i != (max - 1)){
											val += ", ";
										}
									}
								}
							}

							val = val ? val : "-";
							return val;
						}
					},
					manufacturer : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_MANUFACTURER"),
						template : function(data){
							var val = "-";
							var info = data.information;
							if(info && info.manufacturer){
								val = info.manufacturer;
							}
							return val;
						}
					},
					information : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_MODEL"),
						template : function(dataItem){
							var val = "-", info = dataItem.information;
							if(info && info.modelName){
								val = info.modelName;
								var i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_POPUP_MODEL_" + val.toUpperCase());
								val = i18nVal ? i18nVal : val;
							}
							return val;
						}
					},
					firmwareVersion : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_FIRMWARE_VERSION"),
						template : DeviceUtil.getFirmwareVersion
					},
					hardwareVersion : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_HARDWARE_VERSION"),
						template : DeviceUtil.getHardwareVersion
					},
					softwareVersion : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_SOFTWARE_VERSION"),
						template : DeviceUtil.getSoftwareVersion
					},
					apiVersion : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_API_VERSION"),
						template : DeviceUtil.getApiVersion
					},
					powerAvailableSource : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_POWER_AVAILABLE_SOURCE"),
						template : DeviceUtil.getPowerAvailableSource
					},
					powerCurrentSource : {
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_POWER_CURRENT_SOURCE"),
						template : DeviceUtil.getPowerCurrentSource
					},
					schedule : {
						type : "text",
						name : I18N.prop("COMMON_MENU_FACILITY_SCHEDULE"),
						template : DeviceUtil.getHasSchedule
					},
					rule : {
						type : "text",
						name : I18N.prop("COMMON_MENU_FACILITY_RULE"),
						template : DeviceUtil.getHasRule
					},
					description : {
						type : "text",
						name : I18N.prop("COMMON_DESCRIPTION"),
						editCss : {
							width : "100%"
						},
						editable : true,
						hasInputRemoveBtn : true,
						validator : true
					},
					//Wifi Interface // CCTV
					wifiStatus : {
						groupName : "wifiInterface",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_STATUS"),
						template : DeviceUtil.getCCTVWifiStatus
					},
					//Wifi Interface // CCTV
					wifiType : {
						groupName : "wifiInterface",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_FREQUENCY_BAND"),
						template : DeviceUtil.getCCTVWifiType
					},
					wifiChannel : {
						groupName : "wifiInterface",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_CHANNEL"),
						template : DeviceUtil.getWifiChannel
					},
					wifiRssi : {
						groupName : "wifiInterface",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_RSSI"),
						template : DeviceUtil.getWifiRssi
					},
					cctvWifiMacAddress : {
						groupName : "wifiInterface",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"),
						template : DeviceUtil.getWifiMacAddress
					},
					cctvWifiIPAddress : {
						groupName : "wifiInterface",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_IP_ADDRESS"),
						template : DeviceUtil.getWifiIpAddress
					},
					cctvWifiTxPower : {
						groupName : "wifiInterfaceDetail",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_TX_POWER"),
						template : DeviceUtil.getCCTVWifiTxPower
					},
					cctvWifiChannelUtilization : {
						groupName : "wifiInterfaceDetail",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_CHANNEL_UTILIZATION"),
						template : function(){return "";}
					},
					cctvWifiChannelUtilizationTotal : {
						groupName : "wifiInterfaceDetail",
						name : "<div style='margin-left:10px;'>" + I18N.prop("COMMON_TOTAL") + "</div>",
						template : function(data){
							var val = DeviceUtil.getCCTVWifiTotal(data);
							if(val != "-"){
								val += " %";
							}
							return val;
						}
					},
					cctvWifiChannelUtilizationNonWifi : {
						groupName : "wifiInterfaceDetail",
						name : "<div style='margin-left:10px;'>" + I18N.prop("FACILITY_DEVICE_NETWORK_NONE_WIFI") + "</div>",
						template : function(data){
							var val = DeviceUtil.getCCTVWifiNoneWifi(data);
							if(val != "-"){
								val += " %";
							}
							return val;
						}
					},
					cctvWifiInterferer : {
						groupName : "wifiInterfaceDetail",
						type : "grid",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_INTERFERER"),
						valueFieldDisplayType : "row",
						gridDataSource : DeviceUtil.getCCTVWifiInterfererDataSource,
						gridOptions : $.extend({}, defaultGridOpt, networkInterfereGridOptions)
					},
					writable : {
						groupName : "advertisement",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_CONFIGURATION_TYPE"),
						template : DeviceUtil.getBleWritable
					},
					advertisingName : {
						groupName : "advertisement",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_NAME"),
						template : DeviceUtil.getBleAdvertisingName,
						/*  editable : function(data){
						var val = DeviceUtil.getBleObject(data, "writable");
						return val == "-" ? false : true;
					}, */
						validator : {
							type : "name"
						},
						editCss : {
							width : "100%"
						},
						customFieldKey : function(selectedData){
							var index, networks = selectedData.networks;
							if(networks && networks[0]){
								var i, max = networks.length;
								for( i = 0; i < max; i++ ){
									if(networks[i].type == "BLE"){
										index = i;
										break;
									}
								}
							}
							return "networks[" + index + "].ble" + beaconMock + ".advertisingName";
						}/* ,
					getEditableData : function(data){
						var val = DeviceUtil.getBleObject(data, "advertisingName");
						if(val == "-"){
							val = "";
						}
						return val;
					},
					isEditAll : true */
					},
					advertisingInterval : {
						groupName : "advertisement",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_INTERVAL"),
						template : function(data){
							var val = DeviceUtil.getBleAdvertisingInterval(data);
							if(val != "-"){
								val += " msec";
							}
							return val;
						},
						editable : function(data){
							var val = DeviceUtil.getBleObject(data, "writable");
							return val == "-" ? false : true;
						},
						customFieldKey : function(selectedData){
							var index, networks = selectedData.networks;
							if(networks && networks[0]){
								var i, max = networks.length;
								for( i = 0; i < max; i++ ){
									if(networks[i].type == "BLE"){
										index = i;
										break;
									}
								}
							}
							return "networks[" + index + "].ble" + beaconMock + ".advertisingInterval";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="100" data-max="10240" data-spinners="false" data-bind="value : fields.advertisingInterval, events:{change:change}" /></span><span style="margin-left:10px;">(100 ~ 10,240)</div>';
						},
						editViewModel : {
							fields : {
								advertisingInterval : 100
							},
							init : function(){
								if(!this.fields.advertisingInterval){
									this.fields.advertisingInterval = 100;
								}
							},
							change : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = DeviceUtil.getBleObject(data, "advertisingInterval");
							if(val == "-"){
								val = 100;
							}
							return val;
						},
						isEditAll : true
					},
					uuid : {
						groupName : "advertisement",
						type : "text",
						name : "UUID",
						template : DeviceUtil.getBleUUID,
						editable : function(data){
							var val = DeviceUtil.getBleObject(data, "writable");
							return val == "-" ? false : true;
						},
						validator : {
							type : "uuid_min"
						},
						editCss : {
							width : "100%"
						},
						customFieldKey : function(selectedData){
							var index, networks = selectedData.networks;
							if(networks && networks[0]){
								var i, max = networks.length;
								for( i = 0; i < max; i++ ){
									if(networks[i].type == "BLE"){
										index = i;
										break;
									}
								}
							}
							return "networks[" + index + "].ble" + beaconMock + ".uuid";
						},
						getEditableData : function(data){
							var val = DeviceUtil.getBleObject(data, "uuid");
							if(val == "-"){
								val = "";
							}
							return val;
						},
						isEditAll : true
					},
					major : {
						groupName : "advertisement",
						type : "text",
						name : "Major",
						template : DeviceUtil.getBleMajor,
						editable : function(data){
							var val = DeviceUtil.getBleObject(data, "writable");
							return val == "-" ? false : true;
						},
						customFieldKey : function(selectedData){
							var index, networks = selectedData.networks;
							if(networks && networks[0]){
								var i, max = networks.length;
								for( i = 0; i < max; i++ ){
									if(networks[i].type == "BLE"){
										index = i;
										break;
									}
								}
							}
							return "networks[" + index + "].ble" + beaconMock + ".major";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : fields.major, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 65,535)</div>';
						},
						editViewModel : {
							fields : {
								major : 0
							},
							init : function(){
								if(!this.fields.major){
									this.fields.major = 0;
								}
							},
							change : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = DeviceUtil.getBleObject(data, "major");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					minor : {
						groupName : "advertisement",
						type : "text",
						name : "Minor",
						template : DeviceUtil.getBleMinor,
						editable : function(data){
							var val = DeviceUtil.getBleObject(data, "writable");
							return val == "-" ? false : true;
						},
						customFieldKey : function(selectedData){
							var index, networks = selectedData.networks;
							if(networks && networks[0]){
								var i, max = networks.length;
								for( i = 0; i < max; i++ ){
									if(networks[i].type == "BLE"){
										index = i;
										break;
									}
								}
							}
							return "networks[" + index + "].ble" + beaconMock + ".minor";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : fields.minor, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 65,535)</div>';
						},
						editViewModel : {
							fields : {
								minor : 0
							},
							init : function(){
								if(!this.fields.minor){
									this.fields.minor = 0;
								}
							},
							change : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = DeviceUtil.getBleObject(data, "minor");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					txPower : {
						groupName : "advertisement",
						type : "text",
						name : "Tx Power",
						template : function(data){
							var val = DeviceUtil.getBleTxPower(data);

							if (val == "999" || val == 999) {
								val = "-";
							}
							if(val != "-"){ // add comparing with 999
								val += " dBm";
							}
							return val;
						},
						editable : function(data){
							var val = DeviceUtil.getBleObject(data, "writable");
							return val == "-" ? false : true;
						},
						customFieldKey : function(selectedData){
							var index = 0, networks = selectedData.networks;
							if(networks && networks[0]){
								var i, max = networks.length;
								for( i = 0; i < max; i++ ){
									if(networks[i].type == "BLE"){
										index = i;
										break;
									}
								}
							}
							return "networks[" + index + "].ble" + beaconMock + ".txPower";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="-100" data-max="20" data-spinners="false" data-bind="value : fields.txPower, events:{change:change}" /></span><span style="margin-left:10px;">(-100 ~ 20)</div>';
						},
						editViewModel : {
							fields : {
								txPower : null
							},
							init : function(){
								if(!this.fields.txPower){
									this.fields.txPower = 0;
								}
							},
							change : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = DeviceUtil.getBleObject(data, "txPower");
							if(val == "-"){
								val = 0;
							}
							return val;
						}
					},
					calibratedTxPower : {
						groupName : "advertisement",
						type : "text",
						name : "1m RSSI",
						template : function(data){
							var val = DeviceUtil.getBle1mRssi(data);
							if(val != "-"){
								val += " dBm";
							}
							return val;
						}
					},
					gatewayZigbeeId : {
						groupName : "zigbeeInterface",
						type : "text",
						name : "ZigBee ID",
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network && network.zigbee){
								val = network.zigbee.networkAddress;
								val = val ? val : "-";
							}
							return val;
						}
					},
					gatewayZigbeePower : {
						groupName : "zigbeeInterface",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_POWER"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network){
								val = (network.enabled === true || network.enabled === "true") ? "On" : "Off";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
						/*
						var index, networks = selectedData.networks;
						if(networks && networks[0]){
							var i, max = networks.length;
							for( i = 0; i < max; i++ ){
								if(networks[i].type == "Zigbee"){
									index = i;
									break;
								}
							}
						}
						 */
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "Zigbee");
							return "networks[" + index + "].enabled";
						//return "networks[3].enabled";
						},
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="zigbee-power" id="zigbee-power-on" checked="" value="true" data-bind="checked:fields.gatewayZigbeePower, click:clickRadio"><label class="k-radio-label" for="zigbee-power-on" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="zigbee-power" id="zigbee-power-off" checked="" value="false" data-bind="checked:fields.gatewayZigbeePower, click:clickRadio"><label class="k-radio-label" for="zigbee-power-off">Off</label></div>';
						},
						editViewModel : {
							fields : {
								gatewayZigbeePower : null
							},
							init : function(){
								if(this.fields.gatewayZigbeePower === null){
									this.fields.gatewayZigbeePower = false;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = false;
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network && typeof network.enabled !== "undefined"){
								val = network.enabled;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayZigbeeFirmwareVersion : {
						groupName : "zigbeeInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_FIRMWARE_VERSION"),
						template : DeviceUtil.getZigbeeFirmwareVersion
					},
					gatewayZigbeeChannel : {
						groupName : "zigbeeInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_CHANNEL"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network && network.zigbee){
								val = network.zigbee.channel;
								val = val ? val : "-";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "Zigbee");
							return "networks[" + index + "].zigbee.channel";
						//return "networks[3].zigbee.channel";
						},
						editTemplate : function(){
							return '<div><input data-role="dropdownlist" data-bind="source : channelList, value : fields.gatewayZigbeeChannel, events:{change:change}" /></div>';
						},
						editViewModel : {
							fields : {
								gatewayZigbeeChannel : null
							},
							channelList : ["26","25","24","23","22","21","20","19","18","17","16","15","14","13","12","11"],
							init : function(){
								if(!this.fields.gatewayZigbeeChannel){
									this.fields.gatewayZigbeeChannel = "26";
								}
							},
							change : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = "26";
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network && network.zigbee){
								val = network.zigbee.channel;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayZigbeeTxPower : {
						groupName : "zigbeeInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_TX_POWER"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network && network.zigbee){
								val = network.zigbee.txPower;
								val = val ? (val + " dBm") : "-";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "Zigbee");
							return "networks[" + index + "].zigbee.txPower";
						//return "networks[3].zigbee.txPower";
						},
						editTemplate : function(){
							return '<div><input data-role="dropdownlist" data-bind="source : txPowerList, value : fields.gatewayZigbeeTxPower, events:{change:change}" /></div>';
						},
						editViewModel : {
							fields : {
								gatewayZigbeeTxPower : null
							},
							txPowerList : ["9", "-3", "-15", "-26"],
							init : function(){
								if(!this.fields.gatewayZigbeeTxPower){
									this.fields.gatewayZigbeeTxPower = "9";
								}
							},
							change : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = "9";
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network && network.zigbee){
								val = network.zigbee.txPower;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayZigbeePairingMode : {
						groupName : "zigbeeInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_PAIRING_MODE"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network && network.zigbee){
								val = network.zigbee.pairing ? "On" : "Off";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "Zigbee");
							return "networks[" + index + "].zigbee.pairing";
						//return "networks[3].zigbee.pairing";
						},
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="zigbee-pairing" id="zigbee-pairing-on" value="true" data-bind="checked:fields.gatewayZigbeePairingMode, click:clickRadio"><label class="k-radio-label" for="zigbee-pairing-on" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="zigbee-pairing" id="zigbee-pairing-off" value="false" data-bind="checked:fields.gatewayZigbeePairingMode, click:clickRadio"><label class="k-radio-label" for="zigbee-pairing-off">Off</label></div>';
						},
						editViewModel : {
							fields : {
								gatewayZigbeePairingMode : null
							},
							init : function(){
								if(this.fields.gatewayZigbeePairingMode === null){
									this.fields.gatewayZigbeePairingMode = false;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = false;
							var network = DeviceUtil.getNetworkInterface(data, "Zigbee");
							if(network && network.zigbee){
								val = network.zigbee.pairing;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBlePower : {
						groupName : "bleInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_POWER"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							if(network){
								val = network.enabled ? "On" : "Off";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Scanner");
							return "networks[" + index + "].enabled";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-power" id="ble-power-on" checked="" value="true" data-bind="checked:fields.gatewayBlePower, click:clickRadio"><label class="k-radio-label" for="ble-power-on" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-power" id="ble-power-off" checked="" value="false" data-bind="checked:fields.gatewayBlePower, click:clickRadio"><label class="k-radio-label" for="ble-power-off">Off</label></div>';
						},
						editViewModel : {
							fields : {
								gatewayBlePower : null
							},
							init : function(){
								if(this.fields.gatewayBlePower === null){
									this.fields.gatewayBlePower = false;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = false;
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							if(typeof network && network.enabled !== "undefined"){
								val = network.enabled;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleFirmwareVersion : {
						groupName : "bleInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_FIRMWARE_VERSION"),
						template : DeviceUtil.getBleFirmwareVersion
					},
					gatewayBleAppVersion : {
						groupName : "bleInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_APP_VERSION"),
						template : DeviceUtil.getBleAppVersion
					},
					gatewayBleScanReport : {
						groupName : "bleInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_REPORT"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							if(network && network.ble){
								val = network.ble.scanlistReportEnabled ? "On" : "Off";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Scanner");
							return "networks[" + index + "].ble.scanlistReportEnabled";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-scan-report" id="ble-scan-report-on" checked="" value="true" data-bind="checked:fields.gatewayBleScanReport, click:clickRadio"><label class="k-radio-label" for="ble-scan-report-on" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-scan-report" id="ble-scan-report-off" checked="" value="false" data-bind="checked:fields.gatewayBleScanReport, click:clickRadio"><label class="k-radio-label" for="ble-scan-report-off">Off</label></div>';
						},
						editViewModel : {
							fields : {
								gatewayBleScanReport : null
							},
							init : function(){
								if(this.fields.gatewayBleScanReport === null){
									this.fields.gatewayBleScanReport = false;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = false;
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							if(network && network.ble){
								val = network.ble.scanlistReportEnabled;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleScanReportInterval : {
						groupName : "bleInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_REPORT_INTERVAL"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "scanlistReportInterval");
							if(val != "-"){
								val += " msec";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Scanner");
							return "networks[" + index + "].ble.scanlistReportInterval";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 150px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="3000" data-max="120000" data-spinners="false" data-bind="value : fields.gatewayBleScanReportInterval, events:{change:change}" /></span><span style="margin-left:10px;">(3,000 ~ 120,000)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleScanReportInterval : null
							},
							init : function(){
								if(this.fields.gatewayBleScanReportInterval === null){
									this.fields.gatewayBleScanReportInterval = 100;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "scanlistReportInterval");
							if(val == "-"){
								val = 100;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleScanWindow : {
						groupName : "bleInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_WINDOW"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "scanWindow");
							if(val != "-"){
								val += " msec";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Scanner");
							return "networks[" + index + "].ble.scanWindow";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="10240" data-spinners="false" data-bind="value : fields.gatewayBleScanWindow, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 10,240)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleScanWindow : null
							},
							init : function(){
								if(this.fields.gatewayBleScanWindow === null){
									this.fields.gatewayBleScanWindow = 0;
								}
							},
							change : function(e){
								var val = e.sender.value();
								var min;
								if(typeof val !== "undefined"){
								//Scan Interval은 Scan Window 값 보다 크거나 같아야한다.
									min = val;
									var fieldElem = detailPopup.editFields.gatewayBleScanInterval;
									var numericElem = fieldElem.find(".device-point-numeric[data-role='numerictextbox']");
									numericElem.attr("data-min", min);
									fieldElem.find(".scan-interval-min").text(min);
									var numeric = numericElem.data("kendoNumericTextBox");
									var curVal = numeric.value();
									numeric.min(min);
									if(curVal < min){
										numeric.value(min);
										fieldElem.viewModel.fields.set("gatewayBleScanInterval", min);
									}
								}
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "scanWindow");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleScanInterval : {
						groupName : "bleInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_INTERVAL"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "scanInterval");
							if(val != "-"){
								val += " msec";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Scanner");
							return "networks[" + index + "].ble.scanInterval";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="10240" data-spinners="false" data-bind="value : fields.gatewayBleScanInterval, events:{change:change}" /></span><span style="margin-left:10px;">(<span class="scan-interval-min">0</span> ~ 10,240)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleScanInterval : null
							},
							init : function(){
								var selectedData = detailPopup.getSelectedData();
								// console.log(selectedData);
								var network = DeviceUtil.getNetworkInterface(selectedData, "BLE", "Scanner");
								var min = 0, val = DeviceUtil.getBleObjectFromNetwork(network, "scanWindow");
								// console.log(val);
								if(val != "-"){
								//Scan Interval은 Scan Window 값 보다 크거나 같아야한다.
									if(min < val){
										min = val;
									}
									var fieldElem = detailPopup.editFields.gatewayBleScanInterval;
									//View Model 바인딩이 되어 NumericTextBox Widget이 초기화 되기 전에 Set한다.
									fieldElem.find(".device-point-numeric").attr("data-min", min);
									fieldElem.find(".scan-interval-min").text(min);
								}

								if(this.fields.gatewayBleScanInterval === null){
									this.fields.gatewayBleScanInterval = 0;
								}
							},
							change : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "scanInterval");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleScanType : {
						groupName : "bleInterface",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_TYPE"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							return DeviceUtil.getBleObjectFromNetwork(network, "scanType");
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Scanner");
							return "networks[" + index + "].ble.scanType";
						//return "networks[3].zigbee.pairing";
						},
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-scan-type" id="ble-scan-type-on" checked="" value="Passive" data-bind="checked:fields.gatewayBleScanType, click:clickRadio"><label class="k-radio-label" for="ble-scan-type-on" style="margin-right:51px;">Passive</label><input type="radio" class="k-radio" name="ble-scan-type" id="ble-scan-type-off" checked="" value="Active" data-bind="checked:fields.gatewayBleScanType, click:clickRadio"><label class="k-radio-label" for="ble-scan-type-off">Active</label></div>';
						},
						editViewModel : {
							fields : {
								gatewayBleScanType : null
							},
							init : function(){
								if(this.fields.gatewayBleScanType === null){
									this.fields.gatewayBleScanType = "Passive";
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "scanType");
							if(val == "-"){
								val = "Passive";
							}

							return val;
						},
						isEditAll : true
					},
					gatewayBleAdvertisementInterval : {
						groupName : "bleSetup",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_INTERVAL"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "advertisingInterval");
							if(val != "-"){
								val += " msec";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser");
							return "networks[" + index + "].ble.advertisingInterval";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="100" data-max="5000" data-spinners="false" data-bind="value : fields.gatewayBleAdvertisementInterval, events:{change:change}" /></span><span style="margin-left:10px;">(100 ~ 5,000)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleAdvertisementInterval : null
							},
							init : function(){
								if(this.fields.gatewayBleAdvertisementInterval === null){
									this.fields.gatewayBleAdvertisementInterval = 100;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "advertisingInterval");
							if(val == "-"){
								val = 100;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleTxPower : {
						groupName : "bleSetup",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_TX_POWER"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "txPower");
							if(val != "-"){
								val += " dBm";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser");
							return "networks[" + index + "].ble.txPower";
						//return "networks[3].zigbee.txPower";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="-20" data-max="8" data-spinners="false" data-bind="value : fields.gatewayBleTxPower, events:{change:change}" /></span><span style="margin-left:10px;">(-20 ~ 8)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleTxPower : null
							},
							init : function(){
								if(!this.fields.gatewayBleTxPower){
									this.fields.gatewayBleTxPower = 0;
								}
							},
							change : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "txPower");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleCalibration : {
						groupName : "bleSetup",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_CALIBRATION"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "txPowerAttenuation");
							if(val != "-"){
								val += " dBm";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser");
							return "networks[" + index + "].ble.txPowerAttenuation";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="-100" data-max="0" data-spinners="false" data-bind="value : fields.gatewayBleCalibration, events:{change:change}" /></span><span style="margin-left:10px;">(-100 ~ 0)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleCalibration : null
							},
							init : function(){
								if(this.fields.gatewayBleCalibration === null){
									this.fields.gatewayBleCalibration = -100;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser");
							var val = DeviceUtil.getBleObjectFromNetwork(network, "txPowerAttenuation");
							if(val == "-"){
								val = -100;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleMacAddress : {
						groupName : "bleSetup",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser");
							return DeviceUtil.getBleObjectFromNetwork(network, "macAddress");
						}
					},
					gatewayBleFirstPower : {
						groupName : "bleFirst",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_POWER"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							if(network){
								val = network.enabled ? "On" : "Off";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 0);
							return "networks[" + index + "].enabled";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-power-1" id="ble-power-on-1" checked="" value="true" data-bind="checked:fields.gatewayBleFirstPower, click:clickRadio"><label class="k-radio-label" for="ble-power-on-1" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-power-1" id="ble-power-off-1" checked="" value="false" data-bind="checked:fields.gatewayBleFirstPower, click:clickRadio"><label class="k-radio-label" for="ble-power-off-1">Off</label></div>';
						},
						editViewModel : {
							fields : {
								gatewayBleFirstPower : null
							},
							init : function(){
								if(this.fields.gatewayBleFirstPower === null){
									this.fields.gatewayBleFirstPower = false;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = false;
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							if(network && typeof network.enabled !== "undefined"){
								val = network.enabled;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleFirstAdvertiseName : {
						groupName : "bleFirst",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_NAME"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							return DeviceUtil.getBleObjectFromNetwork(network, "advertisingName");
						},
						editable : true,
						validator : {
							type : "name_16"
						},
						editCss : {
							width : "100%"
						},
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 0);
							return "networks[" + index + "].ble.advertisingName";
						//return "networks[4].ble.pairing";
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "advertisingName");
							if(val == "-"){
								val = "";
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleFirstUUID : {
						groupName : "bleFirst",
						type : "text",
						name : "UUID",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							return DeviceUtil.getBleObjectFromNetwork(network, "uuid");
						},
						validator : {
							type : "uuid"
						},
						editable : true,
						editCss : {
							width : "100%"
						},
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 0);
							return "networks[" + index + "].ble.uuid";
						//return "networks[4].ble.pairing";
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "uuid");
							if(val == "-"){
								val = "";
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleFirstMajor : {
						groupName : "bleFirst",
						type : "text",
						name : "Major",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							return DeviceUtil.getBleObjectFromNetwork(network, "major");
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 0);
							return "networks[" + index + "].ble.major";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : fields.gatewayBleFirstMajor, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleFirstMajor : null
							},
							init : function(){
								if(this.fields.gatewayBleFirstMajor === null){
									this.fields.gatewayBleFirstMajor = 0;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "major");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleFirstMinor : {
						groupName : "bleFirst",
						type : "text",
						name : "Minor",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							return DeviceUtil.getBleObjectFromNetwork(network, "minor");
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 0);
							return "networks[" + index + "].ble.minor";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : fields.gatewayBleFirstMinor, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleFirstMinor : null
							},
							init : function(){
								if(this.fields.gatewayBleFirstMinor === null){
									this.fields.gatewayBleFirstMinor = 0;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "minor");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleFirstCalibratedTxPower : {
						groupName : "bleFirst",
						type : "text",
						name : "1m RSSI",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "calibratedTxPower");
							if(val != "-"){
								val += " dBm";
							}
							return val;
						}
					},
					gatewayBleSecondPower : {
						groupName : "bleSecond",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_POWER"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							if(network){
								val = network.enabled ? "On" : "Off";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 1);
							return "networks[" + index + "].enabled";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-power-2" id="ble-power-on-2" checked="" value="true" data-bind="checked:fields.gatewayBleSecondPower, click:clickRadio"><label class="k-radio-label" for="ble-power-on-2" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-power-2" id="ble-power-off-2" checked="" value="false" data-bind="checked:fields.gatewayBleSecondPower, click:clickRadio"><label class="k-radio-label" for="ble-power-off-2">Off</label></div>';
						},
						editViewModel : {
							fields : {
								gatewayBleSecondPower : null
							},
							init : function(){
								if(this.fields.gatewayBleSecondPower === null){
									this.fields.gatewayBleSecondPower = false;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = false;
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							if(network && typeof network.enabled !== "undefined"){
								val = network.enabled;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleSecondAdvertiseName : {
						groupName : "bleSecond",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_NAME"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							return DeviceUtil.getBleObjectFromNetwork(network, "advertisingName");
						},
						editable : true,
						validator : {
							type : "name_16"
						},
						editCss : {
							width : "100%"
						},
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 1);
							return "networks[" + index + "].ble.advertisingName";
						//return "networks[4].ble.pairing";
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "advertisingName");
							if(val == "-"){
								val = "";
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleSecondUUID : {
						groupName : "bleSecond",
						type : "text",
						name : "UUID",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							return DeviceUtil.getBleObjectFromNetwork(network, "uuid");
						},
						validator : {
							type : "uuid"
						},
						editable : true,
						editCss : {
							width : "100%"
						},
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 1);
							return "networks[" + index + "].ble.uuid";
						//return "networks[4].ble.pairing";
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "uuid");
							if(val == "-"){
								val = "";
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleSecondMajor : {
						groupName : "bleSecond",
						type : "text",
						name : "Major",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							return DeviceUtil.getBleObjectFromNetwork(network, "major");
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 1);
							return "networks[" + index + "].ble.major";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : fields.gatewayBleSecondMajor, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleSecondMajor : null
							},
							init : function(){
								if(this.fields.gatewayBleSecondMajor === null){
									this.fields.gatewayBleSecondMajor = 0;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "major");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleSecondMinor : {
						groupName : "bleSecond",
						type : "text",
						name : "Minor",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							return DeviceUtil.getBleObjectFromNetwork(network, "minor");
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 1);
							return "networks[" + index + "].ble.minor";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : fields.gatewayBleSecondMinor, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleSecondMinor : null
							},
							init : function(){
								if(this.fields.gatewayBleSecondMinor === null){
									this.fields.gatewayBleSecondMinor = 0;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "minor");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleSecondCalibratedTxPower : {
						groupName : "bleSecond",
						type : "text",
						name : "1m RSSI",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "calibratedTxPower");
							if(val != "-"){
								val += " dBm";
							}
							return val;
						}
					},
					gatewayBleThirdPower : {
						groupName : "bleThird",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_POWER"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							if(network){
								val = network.enabled ? "On" : "Off";
							}
							return val;
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 2);
							return "networks[" + index + "].enabled";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-power-3" id="ble-power-on-3" checked="" value="true" data-bind="checked:fields.gatewayBleThirdPower, click:clickRadio"><label class="k-radio-label" for="ble-power-on-3" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-power-3" id="ble-power-off-3" checked="" value="false" data-bind="checked:fields.gatewayBleThirdPower, click:clickRadio"><label class="k-radio-label" for="ble-power-off-3">Off</label></div>';
						},
						editViewModel : {
							fields : {
								gatewayBleThirdPower : null
							},
							init : function(){
								if(this.fields.gatewayBleThirdPower === null){
									this.fields.gatewayBleThirdPower = false;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var val = false;
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							if(network && typeof network.enabled !== "undefined"){
								val = network.enabled;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleThirdAdvertiseName : {
						groupName : "bleThird",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_NAME"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							return DeviceUtil.getBleObjectFromNetwork(network, "advertisingName");
						},
						editable : true,
						validator : {
							type : "name_16"
						},
						editCss : {
							width : "100%"
						},
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 2);
							return "networks[" + index + "].ble.advertisingName";
						//return "networks[4].ble.pairing";
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "advertisingName");
							if(val == "-"){
								val = "";
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleThirdUUID : {
						groupName : "bleThird",
						type : "text",
						name : "UUID",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							return DeviceUtil.getBleObjectFromNetwork(network, "uuid");
						},
						validator : {
							type : "uuid"
						},
						editable : true,
						editCss : {
							width : "100%"
						},
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 2);
							return "networks[" + index + "].ble.uuid";
						//return "networks[4].ble.pairing";
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "uuid");
							if(val == "-"){
								val = "";
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleThirdMajor : {
						groupName : "bleThird",
						type : "text",
						name : "Major",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							return DeviceUtil.getBleObjectFromNetwork(network, "major");
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 2);
							return "networks[" + index + "].ble.major";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : fields.gatewayBleThirdMajor, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleThirdMajor : null
							},
							init : function(){
								if(this.fields.gatewayBleThirdMajor === null){
									this.fields.gatewayBleThirdMajor = 0;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "major");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleThirdMinor : {
						groupName : "bleThird",
						type : "text",
						name : "Minor",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							return DeviceUtil.getBleObjectFromNetwork(network, "minor");
						},
						editable : true,
						customFieldKey : function(selectedData){
						//index가 제대로 참조안되는 case 존재함.
							var index = DeviceUtil.getNetworkInterfaceIndex(selectedData, "BLE", "Advertiser", 2);
							return "networks[" + index + "].ble.minor";
						//return "networks[4].ble.pairing";
						},
						editTemplate : function(){
							return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : fields.gatewayBleThirdMinor, events:{change:change}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>';
						},
						editViewModel : {
							fields : {
								gatewayBleThirdMinor : null
							},
							init : function(){
								if(this.fields.gatewayBleThirdMinor === null){
									this.fields.gatewayBleThirdMinor = 0;
								}
							},
							clickRadio : function(e){
								detailPopup.enableSaveBtn();
							}
						},
						getEditableData : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "minor");
							if(val == "-"){
								val = 0;
							}
							return val;
						},
						isEditAll : true
					},
					gatewayBleThirdCalibratedTxPower : {
						groupName : "bleThird",
						type : "text",
						name : "1m RSSI",
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
							var val = DeviceUtil.getBleObjectFromNetwork(network, "calibratedTxPower");
							if(val != "-"){
								val += " dBm";
							}
							return val;
						}
					},
					gatewayWifiFirstStatus : {
						groupName : "wifiFirst",
						type : "text",
						name : I18N.prop("COMMON_STATUS"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "WiFi2.4GHz");
							if(network){
								val = network.enabled ? "On" : "Off";
							}
							return val;
						}
					},
					gatewayWifiFirstChannel : {
						groupName : "wifiFirst",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_CHANNEL"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "WiFi2.4GHz");
							return DeviceUtil.getWifiObjectFromNetwork(network, "channel");
						}
					},
					gatewayWifiFirstTxPower : {
						groupName : "wifiFirst",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_TX_POWER"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "WiFi2.4GHz");
							val = DeviceUtil.getWifiObjectFromNetwork(network, "txPower");
							if(val != "-"){
								val += " dBm";
							}
							return val;
						}
					},
					gatewayWifiFirstChannelUtilization : {
						groupName : "wifiFirst",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_CHANNEL_UTILIZATION"),
						template : function(){return "";}
					},
					gatewayWifiFirstChannelUtilizationTotal : {
						groupName : "wifiFirst",
						name : "<div style='margin-left:10px;'>" + I18N.prop("COMMON_TOTAL") + "</div>",
						template : function(data){
							var val = "-";
							var statistic, network = DeviceUtil.getNetworkInterface(data, "WiFi2.4GHz");
							if(network && network.wifi){
								statistic = network.wifi.statistics;
								if(statistic && statistic.channelUtilization){
									val = statistic.channelUtilization.total;
									val = val ? val : "-";
								}
								if(val != "-"){
									val = val += " %";
								}
							}
							return val;
						}
					},
					gatewayWifiFirstChannelUtilizationNonWifi : {
						groupName : "wifiFirst",
						name : "<div style='margin-left:10px;'>" + I18N.prop("FACILITY_DEVICE_NETWORK_NONE_WIFI") + "</div>",
						template : function(data){
							var val = "-";
							var statistic, network = DeviceUtil.getNetworkInterface(data, "WiFi2.4GHz");
							if(network && network.wifi){
								statistic = network.wifi.statistics;
								if(statistic && statistic.channelUtilization){
									val = statistic.channelUtilization["non802.11"];
									val = val ? val : "-";
								}
								if(val != "-"){
									val = val += " %";
								}
							}
							return val;
						}
					},
					gatewayWifiFirstInterferer : {
						groupName : "wifiFirst",
						type : "grid",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_INTERFERER"),
						valueFieldDisplayType : "row",
						gridDataSource : function(data){
							var list = [];
							var statistic, network = DeviceUtil.getNetworkInterface(data, "WiFi2.4GHz");
							if(network && network.wifi){
								statistic = network.wifi.statistics;
								if(statistic && statistic.interferers){
									list = statistic.interferers;
								}
							}
							return list;
						},
						gridOptions : $.extend({}, defaultGridOpt, networkInterfereGridOptions)
					},
					gatewayWifiSecondStatus : {
						groupName : "wifiSecond",
						type : "text",
						name : I18N.prop("COMMON_STATUS"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "WiFi5GHz");
							if(network){
								val = network.enabled ? "On" : "Off";
							}
							return val;
						}
					},
					gatewayWifiSecondChannel : {
						groupName : "wifiSecond",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_CHANNEL"),
						template : function(data){
							var network = DeviceUtil.getNetworkInterface(data, "WiFi5GHz");
							return DeviceUtil.getWifiObjectFromNetwork(network, "channel");
						}
					},
					gatewayWifiSecondTxPower : {
						groupName : "wifiSecond",
						type : "text",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_TX_POWER"),
						template : function(data){
							var val = "-";
							var network = DeviceUtil.getNetworkInterface(data, "WiFi5GHz");
							val = DeviceUtil.getWifiObjectFromNetwork(network, "txPower");
							if(val != "-"){
								val += " dBm";
							}
							return val;
						}
					},
					gatewayWifiSecondChannelUtilization : {
						groupName : "wifiSecond",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_CHANNEL_UTILIZATION"),
						template : function(){return "";}
					},
					gatewayWifiSecondChannelUtilizationTotal : {
						groupName : "wifiSecond",
						name : "<div style='margin-left:10px;'>" + I18N.prop("COMMON_TOTAL") + "</div>",
						template : function(data){
							var val = "-";
							var statistic, network = DeviceUtil.getNetworkInterface(data, "WiFi5GHz");
							if(network && network.wifi){
								statistic = network.wifi.statistics;
								if(statistic && statistic.channelUtilization){
									val = statistic.channelUtilization.total;
									val = val ? val : "-";
								}
								if(val != "-"){
									val += " %";
								}
							}
							return val;
						}
					},
					gatewayWifiSecondChannelUtilizationNonWifi : {
						groupName : "wifiSecond",
						name : "<div style='margin-left:10px;'>" + I18N.prop("FACILITY_DEVICE_NETWORK_NONE_WIFI") + "</div>",
						template : function(data){
							var val = "-";
							var statistic, network = DeviceUtil.getNetworkInterface(data, "WiFi5GHz");
							if(network && network.wifi){
								statistic = network.wifi.statistics;
								if(statistic && statistic.channelUtilization){
									val = statistic.channelUtilization["non802.11"];
									val = val ? val : "-";
								}
								if(val != "-"){
									val += " %";
								}
							}
							return val;
						}
					},
					gatewayWifiSecondInterferer : {
						groupName : "wifiSecond",
						type : "grid",
						name : I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_INTERFERER"),
						valueFieldDisplayType : "row",
						gridDataSource : function(data){
							var list = [];
							var statistic, network = DeviceUtil.getNetworkInterface(data, "WiFi5GHz");
							if(network && network.wifi){
								statistic = network.wifi.statistics;
								if(statistic && statistic.interferers){
									list = statistic.interferers;
								}
							}
							return list;
						},
						gridOptions : $.extend({}, defaultGridOpt, networkInterfereGridOptions)
					},
					connectedDevices : {
						type : kendo.ui.CommonGroupList,
						name : I18N.prop("FACILITY_DEVICE_CONNECTION_DEVICE"),
						valueFieldDisplayType : "row",
						editable : DeviceUtil.isEnableEnergyMappingType,
						widgetOptions : {
							columns : [
								{
									field : 'name',
									template : function (data) {
										if (data.field === 'building_group_value') {
											return data.value.split('_').slice(2);
										} else if (data.field === 'floor_group_value') {
											return data.value.split('_').slice(2);
										}
										return data.name;
									}
								}
							],
							group : [
								{ field : 'building_group_value', dir : 'asc', aggregates : [{ field : 'building_group_value', aggregate : 'count' }]},
								{ field : 'floor_group_value', dir : 'asc', aggregates : [{ field : 'floor_group_value', aggregate : 'count' }]}
							],
							showEditListHeader : false,
							checkedLimit : 200
						},
						customFieldName : DeviceUtil.getEnergyMappingFieldName,
						widgetEditGetter : function(e){
							var widget = e.widget,
								assignedList = widget.getAssignedItems();
							var device, result = [];
							var i, max = assignedList.length;
							for( i = 0; i < max; i++ ){
								device = assignedList[i];
								result.push({ dms_devices_id : device.id.split('_edit')[0] });
							}
							widget.hideEditMode(true);
							return result;
						},
						widgetDisplaySetter : function(e){
							var popup = e.sender, widget = e.widget;
							var connectedDevices = DeviceUtil.getMeterConnectedDevices(e.data);
							if(!popup.hasConnectedDevices) popup.hasConnectedDevices = {};
							if(connectedDevices){
								if(typeof popup.hasConnectedDevices[e.data.id] === "undefined") popup.hasConnectedDevices[e.data.id] = true;
							}else{
								connectedDevices = [];
								if(typeof popup.hasConnectedDevices[e.data.id] == "undefined") popup.hasConnectedDevices[e.data.id] = false;
							}
							Loading.open(popup.element);
							DeviceUtil.getEnergyMappingOutdoorList(connectedDevices).done(function(data){
								widget.data(data);
								widget.hideEditMode(true);
							}).fail(function(xhq){
								var msg = Util.parseFailResponse(xhq);
								msgDialog.message(msg);
								msgDialog.open();
							}).always(function(){
								Loading.close();
							});
						},
						widgetEditSetter : function(e){
							var popup = e.sender, widget = e.widget;
							var connectedDevices = DeviceUtil.getMeterConnectedDevices(e.data);
							connectedDevices = connectedDevices ? connectedDevices : [];
							Loading.open(popup.element);
							DeviceUtil.getEnergyMappingOutdoorList(connectedDevices).done(function(data){
								for (var i = 0; i < data.length; i++) {
									data[i].id += '_edit';
								}
								widget.data(data);
								widget.hideEditMode(false);
								widget.unbind('change');
								widget.bind('change', function () {
									popup.enableSaveBtn();
								});
							}).fail(function(xhq){
								var msg = Util.parseFailResponse(xhq);
								msgDialog.message(msg);
								msgDialog.open();
							}).always(function(){
								Loading.close();
							});
						}
					}
				}
			}
		};

		/**
		 *   <ul>
		 *   <li>기기 타입 별 사용되는 상세 팝업의 스키마(Attribute) 필드 정보</li>
		 *   <li>기기 타입 별 존재하는 Scheme를 제외하고 baseConfig에서 삭제된다.</li>
		 *   </ul>
		 *   @type {Object}
		 *   @name typeSchemeFields
		 *   @alias module:app/device/common/config/popup-config
		 */
		var typeSchemeFields = {
			"All" : [],
			"AirConditioner.Indoor" : ["type", "id", "name", "representativeStatus", "modes",
				"setTemperature", "currentTemperature", "remoteControl", "locations",
				"groups", "information", "firmwareVersion", "description"],
			"AirConditionerOutdoor" : ["type", "id", "name", "representativeStatus", "modes",
				"outdoorTemperature", "locations", "groups", "information", "firmwareVersion", "description"],
			"ControlPoint" : ["type", "tagName", "id", "name", "representativeStatus","pointValue", "pointMode",
				"signalLogicStatus", "signalReverse", "inputRange", "scaleType", "scale", "bias",
				"maxValue", "minValue", "ioDescription", "locations", "groups", "description"],
			"Meter" : ["type", "id", "name", "meterType", "pointMeterType", "consumptionCategory", "sacConnectionType", "representativeStatus",
				"locations", "groups", "currentConsumption", "manufacturer",
				"information", "firmwareVersion", "description", "connectedDevices"],
			"Sensor.Temperature_Humidity" : ["type", "weatherStation", "id", "name", "representativeStatus",
				"locations", "groups", "temperatureUnit", "sensorTemperature", "humidity", "lastEventTime", "manufacturer",
				"information", "firmwareVersion", "description"],
			"Light" : ["type", "id", "name", "representativeStatus",
				"locations", "groups", "brightness", "lastEventTime", "manufacturer", "information", "firmwareVersion", "description"],
			"SmartPlug" : ["type", "id", "name", "representativeStatus",
				"locations", "groups", "lastEventTime", "manufacturer", "information", "firmwareVersion", "description"],
			"Sensor.Motion" : ["type", "id", "name", "representativeStatus",
				"locations", "groups", "lastEventTime", "presence", "manufacturer", "information", "firmwareVersion", "description"],
			"Gateway" : ["type", "id", "name", "representativeStatus",
				"locations", "groups", "macAddress", "ipAddress", "lastEventTime", "manufacturer", "information", "firmwareVersion", "hardwareVersion", "softwareVersion", "apiVersion", "powerAvailableSource", "powerCurrentSource", "schedule", "rule", "description",
				"gatewayZigbeeId", "gatewayZigbeePower", "gatewayZigbeeFirmwareVersion", "gatewayZigbeeChannel", "gatewayZigbeeTxPower", "gatewayZigbeePairingMode", "gatewayBlePower", "gatewayBleFirmwareVersion", "gatewayBleAppVersion", "gatewayBleScanReport", "gatewayBleScanReportInterval", "gatewayBleScanWindow", "gatewayBleScanInterval", "gatewayBleScanType", "gatewayBleAdvertisementInterval", "gatewayBleTxPower", "gatewayBleCalibration", "gatewayBleMacAddress", "gatewayBleFirstPower", "gatewayBleFirstAdvertiseName", "gatewayBleFirstUUID", "gatewayBleFirstMajor", "gatewayBleFirstMinor", "gatewayBleFirstCalibratedTxPower", "gatewayBleSecondPower", "gatewayBleSecondAdvertiseName", "gatewayBleSecondUUID", "gatewayBleSecondMajor", "gatewayBleSecondMinor", "gatewayBleSecondCalibratedTxPower", "gatewayBleThirdPower", "gatewayBleThirdAdvertiseName", "gatewayBleThirdUUID", "gatewayBleThirdMajor", "gatewayBleThirdMinor", "gatewayBleThirdCalibratedTxPower", "gatewayWifiFirstStatus", "gatewayWifiFirstChannel", "gatewayWifiFirstTxPower", "gatewayWifiFirstChannelUtilization", "gatewayWifiFirstChannelUtilizationTotal", "gatewayWifiFirstChannelUtilizationNonWifi", "gatewayWifiFirstInterferer", "gatewayWifiSecondStatus", "gatewayWifiSecondChannel", "gatewayWifiSecondTxPower", "gatewayWifiSecondChannelUtilization", "gatewayWifiSecondChannelUtilizationTotal", "gatewayWifiSecondChannelUtilizationNonWifi", "gatewayWifiSecondInterferer"],

			"Beacon" : ["type", "id", "name", "representativeStatus", "configuration",
				"locations", "currentLocations", "groups", "parentId", "lastEventTime", "bleMacAddress", "signalLevel", "batteryLevel", "schedule", "rule", "description", "writable", "advertisingName", "advertisingInterval", "uuid", "major",
				"minor", "txPower", "calibratedTxPower"],
			"CCTV" : ["type", "id", "name", "representativeStatus",
				"locations", "groups", "parentId", "macAddress", "ipAddress", "lastEventTime", "dataStatus", "schedule", "rule", "description",
				"wifiStatus", "wifiType", "wifiChannel", "wifiRssi", "cctvWifiMacAddress", "cctvWifiIPAddress",
				"cctvWifiTxPower", "cctvWifiChannelUtilization", "cctvWifiChannelUtilizationTotal", "cctvWifiChannelUtilizationNonWifi",
				"cctvWifiInterferer"]
		};

		//최종 Save 된 데이터를 API호출을 위해 Parsing 한다.
		var parseBeaconField = ["advertisingName", "advertisingInterval", "uuid", "major", "minor", "txPower"];
		/**
		 *   <ul>
		 *   <li>Beacon 상세 정보 수정 후 [PATCH] 수행 시, [PATCH] API 호출을 위한 networks 리스트를 생성한다.</li>
		 *   </ul>
		 *   @function parseBeaconData
		 *   @param {Object} data - 기기 정보
		 *   @param {Object} result - 수정할 기기 정보
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function parseBeaconData(data, result){
			var i, max = parseBeaconField.length;
			var hasParseData = false;
			for(i = 0; i < max; i++ ){
				if(typeof result[parseBeaconField[i]] !== "undefined"){
					hasParseData = true;
					break;
				}
			}
			console.error(result);
			if(hasParseData){
			//var network = { ble : { scanlist : [{}]} },
				var network = { ble : {} }, key, networks = data.networks;
				if(networks && networks[0]){
					max = networks.length;
					for( i = 0; i < max; i++ ){
						if(networks[i].type == "BLE"){
							network.id = networks[i].id;
							for(key in result){
								if(parseBeaconField.indexOf(key) != -1){
									network.ble[key] = result[key];
									//network.ble.scanlist[0][key] = result[key];

									//기존의 Detail-Popup 방식으로 Set되지 않으므로,
									//선택한 데이터를 Set 한다.
									networks[i].ble.set(key, result[key]);
									delete result[key];
								}
							}
							break;
						}
					}
				}
				if(!result.networks){
					result.networks = [];
					result.networks.push(network);
				}else{
					result.networks = network;
				}
			}
		}

		var parseGatewayField = {
			zigbee : ["gatewayZigbeePower", "gatewayZigbeeChannel", "gatewayZigbeeTxPower", "gatewayZigbeePairingMode"],
			ble : ["gatewayBlePower", "gatewayBleScanReport", "gatewayBleScanReportInterval", "gatewayBleScanWindow", "gatewayBleScanInterval", "gatewayBleScanType"],
			bleFirst : ["gatewayBleAdvertisementInterval", "gatewayBleTxPower", "gatewayBleCalibration", "gatewayBleFirstPower", "gatewayBleFirstAdvertiseName", "gatewayBleFirstUUID", "gatewayBleFirstMajor", "gatewayBleFirstMinor"],
			bleSecond : ["gatewayBleAdvertisementInterval", "gatewayBleTxPower", "gatewayBleCalibration", "gatewayBleSecondPower", "gatewayBleSecondAdvertiseName", "gatewayBleSecondUUID", "gatewayBleSecondMajor", "gatewayBleSecondMinor"],
			bleThird : ["gatewayBleAdvertisementInterval", "gatewayBleTxPower", "gatewayBleCalibration", "gatewayBleThirdPower", "gatewayBleThirdAdvertiseName", "gatewayBleThirdUUID", "gatewayBleThirdMajor", "gatewayBleThirdMinor"]
		};

		//팝업의 Display/Edit를 위해 적용했던 키 값을 실제 API 호출을 위한 어트리뷰트로 변환한기 위한 객체
		var resultKeyMapping = {
			gatewayZigbeePower : "enabled", gatewayZigbeeChannel : "channel", gatewayZigbeeTxPower : "txPower", gatewayZigbeePairingMode : "pairing", gatewayBlePower : "enabled", gatewayBleScanReport : "scanlistReportEnabled", gatewayBleScanReportInterval : "scanlistReportInterval", gatewayBleScanWindow : "scanWindow", gatewayBleScanInterval : "scanInterval", gatewayBleScanType : "scanType", gatewayBleAdvertisementInterval : "advertisingInterval", gatewayBleTxPower : "txPower", gatewayBleCalibration : "txPowerAttenuation",
			gatewayBleFirstPower : "enabled", gatewayBleSecondPower : "enabled", gatewayBleThirdPower : "enabled",
			gatewayBleFirstAdvertiseName : "advertisingName", gatewayBleSecondAdvertiseName : "advertisingName", gatewayBleThirdAdvertiseName : "advertisingName",
			gatewayBleFirstUUID : "uuid", gatewayBleSecondUUID : "uuid", gatewayBleThirdUUID : "uuid",
			gatewayBleFirstMajor : "major", gatewayBleSecondMajor : "major", gatewayBleThirdMajor  :"major",
			gatewayBleFirstMinor : "minor", gatewayBleSecondMinor : "minor", gatewayBleThirdMinor : "minor"
		};
		/**
		 *   <ul>
		 *   <li>Gateway 상세 정보 수정 후 [PATCH] 수행 시, [PATCH] API 호출을 위한 networks 리스트를 생성한다.</li>
		 *   </ul>
		 *   @function parseGatewayData
		 *   @param {Object} data - 기기 정보
		 *   @param {Object} result - 수정할 기기 정보
		 *   @returns {void}
		 *   @alias module:app/device/common/config/popup-config
		 */
		function parseGatewayData(data, result){
			var fields, key, i, max = parseBeaconField.length;
			var hasParseData = false;
			for(key in parseGatewayField){
				fields = parseGatewayField[key];
				max = fields.length;
				for(i = 0; i < max; i++ ){
					if(typeof result[fields[i]] !== "undefined"){
						hasParseData = true;
						break;
					}
				}
				if(hasParseData){
					break;
				}
			}

			if(hasParseData){
			//var network = { ble : { scanlist : [{}]} },
				var resultKey, mappedKey;
				var newNetworkObj = {}, network, beaconObj, dataBeaconObj, networks = [];

				var keyArr = [];
				for(key in parseGatewayField){
					fields = parseGatewayField[key];
					for(resultKey in result){
						if(fields.indexOf(resultKey) != -1){
							if(!newNetworkObj[key]){
								newNetworkObj[key] = {};
							}

							if(key == "zigbee"){
								network = DeviceUtil.getNetworkInterface(data, "Zigbee");
								if(!network.zigbee){
									network.zigbee = {};
								}
								dataBeaconObj = network.zigbee;
								if(!newNetworkObj[key].zigbee){
									newNetworkObj[key].zigbee = {};
								}
								beaconObj = newNetworkObj[key].zigbee;
							}else if(key == "ble"){
								network = DeviceUtil.getNetworkInterface(data, "BLE", "Scanner");
								if(!network.ble){
									network.ble = {};
								}
								dataBeaconObj = network.ble;
								if(!newNetworkObj[key].ble){
									newNetworkObj[key].ble = {};
								}
								beaconObj = newNetworkObj[key].ble;
							}else if(key == "bleFirst"){
								network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 0);
								if(!network.ble){
									network.ble = {};
								}
								dataBeaconObj = network.ble;
								if(!newNetworkObj[key].ble){
									newNetworkObj[key].ble = {};
								}
								beaconObj = newNetworkObj[key].ble;
							}else if(key == "bleSecond"){
								beaconObj = network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 1);
								if(!network.ble){
									network.ble = {};
								}
								dataBeaconObj = network.ble;
								if(!newNetworkObj[key].ble){
									newNetworkObj[key].ble = {};
								}
								beaconObj = newNetworkObj[key].ble;
							}else if(key == "bleThird"){
								network = DeviceUtil.getNetworkInterface(data, "BLE", "Advertiser", 2);
								if(!network.ble){
									network.ble = {};
								}
								dataBeaconObj = network.ble;
								if(!newNetworkObj[key].ble){
									newNetworkObj[key].ble = {};
								}
								beaconObj = newNetworkObj[key].ble;
							}
							newNetworkObj[key].id = network.id;

							//실제 API를 호출할 어트리뷰트를 키로 지정하고, 삭제한다.
							mappedKey = resultKeyMapping[resultKey];
							//enabled는 특정 Beacon 타입의 속성이 아니고, network 어트리뷰트 속성이다.
							if(mappedKey == "enabled"){
								if(result[resultKey] == "true"){
									result[resultKey] = true;
								}else if(result[resultKey] == "false"){
									result[resultKey] = false;
								}
								newNetworkObj[key][mappedKey] = result[resultKey];
								//기존의 Detail-Popup 방식으로 Set되지 않으므로,
								//선택한 데이터를 Set 한다.
								if(network.set){
									network.set(mappedKey, result[resultKey]);
								}else{
									network[mappedKey] = result[resultKey];
								}
							}else{
								if(result[resultKey] == "true"){
									result[resultKey] = true;
								}else if(result[resultKey] == "false"){
									result[resultKey] = false;
								}
								beaconObj[mappedKey] = result[resultKey];
								//기존의 Detail-Popup 방식으로 Set되지 않으므로,
								//선택한 데이터를 Set 한다.
								if(dataBeaconObj.set){
									dataBeaconObj.set(mappedKey, result[resultKey]);
								}else{
									dataBeaconObj[mappedKey] = result[resultKey];
								}
							}
							keyArr.push(resultKey);
						//delete result[resultKey];
						}
					}
				}

				//networks 관련 key를 삭제하고, networs[0]으로 result에 할당한다.
				max = keyArr.length;
				for( i = 0; i < max; i++ ){
					delete result[keyArr[i]];
				}

				for( key in newNetworkObj){
				//존재하지 않는 유효하지 않은 Beacon 정보로 제외한다.
					if(typeof newNetworkObj[key].id === "undefined"){
						continue;
					}
					networks.push(newNetworkObj[key]);
				}
				result.networks = networks;
			}
		}
		//타입 별로 해당 옵션에 대해 baseConfig에 추가한다.
		/**
		 *   <ul>
		 *   <li>기기 타입 별 baseConfig에 Extend 될 추가 공용 상세 팝업 Option</li>
		 *   </ul>
		 *   @type {Object}
		 *   @name additionalOptions
		 *   @alias module:app/device/common/config/popup-config
		 */
		var additionalOptions = {
			"ControlPoint" : {
				selectedDetailFilter : function(data){
					var type = data.type;
					if(type){
						if(type.indexOf("DI") != -1
						|| type.indexOf("DO") != -1 || type.indexOf("DV") != -1){
							return ["inputRange", "scaleType", "scale", "bias", "maxValue", "minValue"];
						}else if(type.indexOf("AI") != -1
							|| type.indexOf("AO") != -1 || type.indexOf("AV") != -1){
							return ["pointMode", "signalLogicStatus", "signalReverse"];
						}
					}
				}
			},
			"Meter" : {
				detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
				selectedDetailFilter : function(data){
				// console.log("meter filter type");
					var type = data.type;
					var filters;
					if(type){
						if(type.indexOf("ControlPoint") != -1){
							// return ["meterType"];
							filters = ["meterType"];
						}else{
							// return ["pointMeterType"];
							filters = ["pointMeterType"];
						}
					}

					if(!DeviceUtil.isEnableEnergyMappingType(data)) filters.push("connectedDevices");

					return filters;
				}
			},
			"Sensor.Motion": {
				detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>'
			},
			"Sensor.Temperature_Humidity": {
				detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>'
			},
			"Light" : {
				width: 932,
				height: 888,
				gridOptions : {
					height : "calc(100% - 60px)",
					columns : [
						{
							headerTemplate : "",
							// template : Template.multiDetailListDualTemplate
							template : function(data){
								var dialogType = detailPopup.dialogType;
								var isRegister = (dialogType == "register" || dialogType == "deregister") ? true : false;
								var isSelectReg = dialogType == "deregister" ? true : false;
								return Template.multiDetailListDualTemplate(data, isRegister, isSelectReg);
							}
						}
					]
				},
				onTypeChange : function(e){
				//타입에 따른 버튼 설정
					commonOnTypeChangeEvt(e);

					//Light 제어 패널
					var dialog = e.sender;
					var ds = dialog.dataSource;
					var isPower = false, isDimmingLevel = false, isMixed = false, mixedCheck = void (0);
					var datas = ds.data();
					var i, type, data, max = datas.length;
					var powerValue = 0, dimmingValue = 0, dimmingCount = 0;

					for( i = 0; i < max; i++ ){
						data = datas[i];
						type = data.type;
						if(type){
							if(type.indexOf("AO") != -1){
								isDimmingLevel = true;
							//lights로 통합
							/*if(controlPoint && controlPoint.value !== undefined){
								dimmingValue = (dimmingValue < controlPoint.value) ? controlPoint.value : dimmingValue;
							}*/
							}

							if(type.indexOf("DO") != -1){
								isPower = true;
							//lights로 통합
							/*if(controlPoint && controlPoint.value !== undefined){
								powerValue = (powerValue < controlPoint.value) ? controlPoint.value : powerValue;
							}*/
							}

							if(type == "Light"){
								isPower = true;
								isDimmingLevel = true;
							}
							var status = Util.getStatus(data);
							if(status == "Normal.On"){
								powerValue = powerValue < 1 ? 1 : powerValue;
								// ON/OFF 상태로 표시하기 위한 mixedCheck, isMixed
								if(typeof mixedCheck === 'undefined'){
									mixedCheck = 'On';
								}else if(!isMixed && mixedCheck === 'Off'){
									isMixed = true;
								}
							}else{
								powerValue = powerValue <= 0 ? 0 : powerValue;
								if(typeof mixedCheck === 'undefined'){
									mixedCheck = 'Off';
								}else if(!isMixed && mixedCheck === 'On'){
									isMixed = true;
								}
							}
							var dimmingLevel = DeviceUtil.getDimmingLevel(data);
							//AI, DI는 제어 불가
							if(dimmingLevel != "-" && type.indexOf("AI") == -1 && type.indexOf("DI") == -1){
								dimmingLevel = dimmingLevel.replace("%", "");
								dimmingLevel = Number(dimmingLevel);
								dimmingValue += dimmingLevel;
								dimmingCount++;
							}
						}
					}

					//AO는 평균값 표시
					if(dimmingCount != 0){
						dimmingValue = Math.round(dimmingValue / dimmingCount);
					}

					var vm = LightViewModel.lightControlViewModel;
					vm.init(dialog);
					powerValue = powerValue == 1 ? true : false;
					//dimmingValue = dimmingValue > 0 ? true : false;

					//vm.light.power.set("active", powerValue || dimmingValue);
					vm.light.power.set("active", powerValue);
					vm.light.power.set("mixed", isMixed);
					vm.light.set("value", dimmingValue);

					var controlElem = dialog.element.find(".group-control-dialog-control");

					//해당 되지 않을 경우 제어 패널 영역 표시 안함.
					if(!isPower && !isDimmingLevel || dialog.dialogType){
						dialog.element.find(".group-control-dialog").removeClass("group-control-dialog");
						controlElem.hide();

						dialog.wrapper.css({ width : 652 });
					}else{
						dialog.wrapper.css({ width : 932 });

						//Type Check and Visible Invisible
						kendo.unbind(controlElem);
						kendo.bind(controlElem, vm);

						var lightControl = vm.get("light");
						lightControl.power.set("invisible", !isPower);
						lightControl.set("invisible", !isDimmingLevel);
					}
				},
				contentTemplate : '<div class="group-control-dialog detail-dialog-content device-dialog-content" style="width:592px;"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>' + LightViewModel.lightControlTemplate
			},
			"Beacon" : {
				parseSaveData : function(datas, results){
					if(!results){
						return results;
					}

					var i, max;
					if($.isArray(results)){
						max = results.length;
						for( i = 0; i < max; i++ ){
							parseBeaconData(datas[i], results[i]);
						}
					}else{
						parseBeaconData(datas, results);
					}

					return results;
				},
				buttonsIndex : {
					CLOSE : 0, EDIT : 1, CANCEL : 2, SAVE : 3, REGISTER : 4, DEREGISTER : 5, BLOCK : 6, DELETE : 7
				},
				onTypeChange : function(e){
					var type = e.type;
					var BTN = e.sender.BTN;

					var dialog = e.sender;
					var ds = dialog.dataSource;
					var datas = ds.data();

					if(type == "register"){
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.EDIT, { visible : false });
						detailPopup.setActions(BTN.DEREGISTER, { visible : false });
						detailPopup.setActions(BTN.DELETE, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						detailPopup.setActions(BTN.REGISTER, { visible : true });
						detailPopup.setActions(BTN.BLOCK, { visible : false });
					}else if(type == "deregister"){
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.REGISTER, { visible : false });
						detailPopup.setActions(BTN.DELETE, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						detailPopup.setActions(BTN.EDIT, { visible : true });
						detailPopup.setActions(BTN.DEREGISTER, { visible : true });
						detailPopup.setActions(BTN.BLOCK, { visible : false });
					}else if(type == "delete"){
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.BLOCK, { visible : false });
						detailPopup.setActions(BTN.DEREGISTER, { visible : false });
						detailPopup.setActions(BTN.REGISTER, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						detailPopup.setActions(BTN.EDIT, { visible : true });
						detailPopup.setActions(BTN.DELETE, { visible : true });
					}else{
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.DEREGISTER, { visible : false });
						detailPopup.setActions(BTN.REGISTER, { visible : false });
						detailPopup.setActions(BTN.BLOCK, { visible : false });
						detailPopup.setActions(BTN.DELETE, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						if (datas.length > 1) {
							detailPopup.setActions(BTN.EDIT, { visible : true , disabled : true});
						} else {
							detailPopup.setActions(BTN.EDIT, { visible : true , disabled : false});
						}
					}
				},
				actions : [
					{
						text : I18N.prop("COMMON_BTN_CLOSE"),
						visible : true,
						action : commonCloseBtnEvt
					},
					{
						text : I18N.prop("COMMON_BTN_EDIT"),
						visible : true,
						action : commonEditBtnEvt
					},
					{
						text : I18N.prop("COMMON_BTN_CANCEL"),
						visible : false,
						action : commonCancelBtnEvt
					},
					{
						text : I18N.prop("COMMON_BTN_SAVE"),
						visible : false,
						disabled : true,
						action : commonSaveBtnEvt
					},
					{
						text : I18N.prop("COMMON_BTN_REGISTER"),
						visible : false,
						action : commonRegisterBtnEvt
					},
					{
						text : I18N.prop("COMMON_BTN_DEREGISTER"),
						visible : false,
						action : commonDeregisterBtnEvt
					},
					{
						text : I18N.prop("COMMON_BTN_BLOCK"),
						visible : false,
						action : commonBlockBtnEvt
					},
					{
						text : I18N.prop("COMMON_BTN_DELETE"),
						visible : false,
						action : commonDeleteBtnEvt
					}
				],
				scheme : {
					groupName : {
						advertisement : {
							template: "<div class='group'>" + "Advertisement" + "</div>"
						}
					},
					fields : {
						description : {
							isEditAll : true
						},
						configuration : {
							isEditAll : true
						}
					}
				}
			},
			"Gateway" : {
				parseSaveData : function(datas, results){
					if(!results){
						return results;
					}

					var i, max;
					if($.isArray(results)){
						max = results.length;
						for( i = 0; i < max; i++ ){
							parseGatewayData(datas[i], results[i]);
						}
					}else{
						parseGatewayData(datas, results);
					}

					return results;
				},
				selectedDetailFilter : function(data){
					var networks = data.networks;
					if(!networks || !networks[0]){
					//hide 할 group
						return ["wifiFirst", "wifiSecond"];
					}
					var i, max = networks.length;
					var hideFields = ["wifiFirst", "wifiSecond"];
					for( i = 0; i < max; i++ ){
						if(networks[i].type == "WiFi2.4GHz"){
							hideFields[0] = null;
						}else if(networks[i].type == "WiFi5GHz"){
							hideFields[1] = null;
						}
					}
					var index = DeviceUtil.getNetworkInterfaceIndex(data, "Zigbee", null, null, true);
					if(index == -1) hideFields.push("zigbeeInterface");
					index = DeviceUtil.getNetworkInterfaceIndex(data, "BLE", "Scanner", null, true);
					if(index == -1) hideFields.push("bleInterface");
					index = DeviceUtil.getNetworkInterfaceIndex(data, "BLE", "Advertiser", 0, true);
					if(index == -1){
						hideFields.push("bleSetup"); hideFields.push("bleFirst"); hideFields.push("bleSecond"); hideFields.push("bleThird");
					}else{
						index = DeviceUtil.getNetworkInterfaceIndex(data, "BLE", "Advertiser", 2, true);
						if(index == -1) hideFields.push("bleThird");
						index = DeviceUtil.getNetworkInterfaceIndex(data, "BLE", "Advertiser", 1, true);
						if(index == -1) hideFields.push("bleSecond");
					}

					//console.log("hidefilter");
					//console.log(hideFields);
					return hideFields;

				},
				scheme : {
					groupName : {
						zigbeeInterface : {
							template: "<div class='group'>" + "ZigBee Interface" + "</div>"
						},
						bleInterface : {
							template: "<div class='group'>" + "BLE Interface" + "</div>"
						},
						bleSetup : {
							template: "<div class='group'>" + "Built-in Beacon Setup" + "</div>"
						},
						bleFirst : {
							template : "<div class='group'>" + "Built-in Beacon #1" + "</div>"
						},
						bleSecond : {
							template : "<div class='group'>" + "Built-in Beacon #2" + "</div>"
						},
						bleThird : {
							template : "<div class='group'>" + "Built-in Beacon #3" + "</div>"
						},
						wifiFirst : {
							template : "<div class='group'>" + "WIFI Interface (2.4GHz)" + "</div>"
						},
						wifiSecond : {
							template : "<div class='group'>" + "WIFI Interface (5GHz)" + "</div>"
						}
					},
					fields : {
						description : {
							isEditAll : true
						}
					}
				}
			},
			"CCTV" : {
				scheme : {
					groupName : {
						wifiInterface : {
							template : "<div class='group'>WIFI Interface</div>"
						},
						wifiInterfaceDetail : {
							template : "<div class='group'>Gateway WIFI Interface (<span data-bind='text: wifiFrequency'></span>)</div>"
						}
					},
					fields : {
						description : {
							isEditAll : true
						}
					}
				},
				setAdditionalDetailData : function(data){
					console.error("set additional!");
					console.error(this);

					Loading.open(this.element);
					var parentId = data.parentId;
					var network, networks = data.networks;

					if(networks && networks[0]){
						network = networks[0];
						var type = network.type;
						if(type){

							return $.ajax({
							//url : "/dms/devices/"+parentId+"/networks?type="+type
								url : "/dms/devices/" + parentId + "/networks"
							}).then(function(parentData){
								Loading.close();
								var i, max = parentData.length;
								if(parentData && parentData[0]){
									var network_wifi = networks[1];
									for( i = 0; i < max; i++ ){
									//if(parentData[i].type == type){
									//    parentData = parentData[i];
										if(parentData[i].type == network_wifi.type){
											parentData = parentData[i];
											break;
										}
									}
									if(!network){
										networks.push(parentData);
									}else{
									//network.wifiParent = parentData.wifi;
										network.wifi = parentData.wifi;
									}
								}
								/*if(parentData && parentData[0]){
								parentData = parentData[0];
								if(!network){
									networks.push(parentData);
								}else{
									network.wifi = parentData.wifi;
								}
							}*/
								data.wifiFrequency = DeviceUtil.getCCTVWifiType(data);
								data.wifi = parentData.wifi;
							}).fail(function(){
								Loading.close();
							});
						}
					}else{
						data.wifiFrequency = "-";
					}
					//Mock
					/*return $.ajax({
					url : "/dms/devices/"+parentId+"/networks/2"
				}).then(function(parentData){
					Loading.close();
					if(parentData){
						network = networks[0];
						if(!network){
							networks.push(parentData);
						}else{
							network.wifi = parentData.wifi;
						}
						data.wifiFrequency = DeviceUtil.getCCTVWifiType(data);
					}
				}).fail(function(){
					Loading.close();
				});*/

					var dfd = new $.Deferred();
					dfd.resolve();
					Loading.close();
					return dfd.promise();
				},
				onTypeChange : function(e) {
					var dialog = e.sender;
					var ds = dialog.dataSource;
					var datas = ds.data();
					var max = datas.length;

					var parent_type = e.type;
					var BTN = e.sender.BTN;

					if(parent_type == "register"){
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.EDIT, { visible : false });
						detailPopup.setActions(BTN.DEREGISTER, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						detailPopup.setActions(BTN.REGISTER, { visible : true });
					}else if(parent_type == "deregister"){
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.REGISTER, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						detailPopup.setActions(BTN.EDIT, { visible : true });
						detailPopup.setActions(BTN.DEREGISTER, { visible : true });
					}else{
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.DEREGISTER, { visible : false });
						detailPopup.setActions(BTN.REGISTER, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						if(max > 1){
							detailPopup.setActions(BTN.EDIT, { visible : true, disabled : true });
						}else {
							detailPopup.setActions(BTN.EDIT, { visible : true, disabled : false });
						}
					}
				}
			},
			"SmartPlug" : {	// 0831 - add smart plug
				width: 932,
				height: 888,
				gridOptions : {
					height : "calc(100% - 60px)",
					columns : [
						{
							headerTemplate : "",
							// template : Template.multiDetailListDualTemplate
							template : function(data){
								var dialogType = detailPopup.dialogType;
								var isRegister = (dialogType == "register" || dialogType == "deregister") ? true : false;
								var isSelectReg = dialogType == "deregister" ? true : false;
								return Template.multiDetailListDualTemplate(data, isRegister, isSelectReg);
							}
						}
					]
				},
				onTypeChange : function(e){
				//타입에 따른 버튼 설정
				//commonOnTypeChangeEvt(e);

				//Light 제어 패널
					var dialog = e.sender;
					var ds = dialog.dataSource;
					var isPower = false, isDimmingLevel = false;
					var datas = ds.data();
					var i, type, data, max = datas.length;
					var powerValue = 0, dimmingValue = 0;
					for( i = 0; i < max; i++ ){
						data = datas[i];
						type = data.type;
						if(type){
							if(type.indexOf("AO") != -1){
								isDimmingLevel = true;
							//lights로 통합
							/*if(controlPoint && controlPoint.value !== undefined){
								dimmingValue = (dimmingValue < controlPoint.value) ? controlPoint.value : dimmingValue;
							}*/
							}

							if(type.indexOf("DO") != -1){
								isPower = true;
							//lights로 통합
							/*if(controlPoint && controlPoint.value !== undefined){
								powerValue = (powerValue < controlPoint.value) ? controlPoint.value : powerValue;
							}*/
							}

							if(type == "SmartPlug"){
								isPower = true;
							//isDimmingLevel = true;
							}
							var status = Util.getStatus(data);
							if(status == "Normal.On"){
								powerValue = powerValue < 1 ? 1 : powerValue;
							}else{
								powerValue = powerValue <= 0 ? 0 : powerValue;
							}
							/*                         var dimmingLevel = DeviceUtil.getDimmingLevel(data);
						if(dimmingValue > dimmingLevel){
							dimmingValue = dimmingLevel;
						} */
						}
					}

					var parent_type = e.type;
					var BTN = e.sender.BTN;
					if(parent_type == "register"){
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.EDIT, { visible : false });
						detailPopup.setActions(BTN.DEREGISTER, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						detailPopup.setActions(BTN.REGISTER, { visible : true });
					}else if(parent_type == "deregister"){
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.REGISTER, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						detailPopup.setActions(BTN.EDIT, { visible : true });
						detailPopup.setActions(BTN.DEREGISTER, { visible : true });
					}else{
						detailPopup.setActions(BTN.SAVE, { visible : false });
						detailPopup.setActions(BTN.CANCEL, { visible : false });
						detailPopup.setActions(BTN.DEREGISTER, { visible : false });
						detailPopup.setActions(BTN.REGISTER, { visible : false });

						detailPopup.setActions(BTN.CLOSE, { visible : true });
						if(max > 1){
							detailPopup.setActions(BTN.EDIT, { visible : true, disabled : true });
						}else {
							detailPopup.setActions(BTN.EDIT, { visible : true, disabled : false });
						}
					}

					var vm = SmartPlugViewModel.smartPlugControlViewModel;
					vm.init(dialog);
					powerValue = powerValue == 1 ? true : false;
					//dimmingValue = dimmingValue > 0 ? true : false;

					//vm.light.power.set("active", powerValue || dimmingValue);
					vm.smartPlug.power.set("active", powerValue);
					vm.smartPlug.set("value", dimmingValue);

					var controlElem = dialog.element.find(".group-control-dialog-control");

					//해당 되지 않을 경우 제어 패널 영역 표시 안함.
					if(!isPower && !isDimmingLevel){
						dialog.element.find(".group-control-dialog").removeClass("group-control-dialog");
						controlElem.hide();

						dialog.wrapper.css({ width : 652 });
					}else{
						dialog.wrapper.css({ width : 932 });

						//Type Check and Visible Invisible
						kendo.unbind(controlElem);
						kendo.bind(controlElem, vm);

						var smartPlugControl = vm.get("smartPlug");
						smartPlugControl.power.set("invisible", !isPower);
						smartPlugControl.set("invisible", !isDimmingLevel);
					}
				},
				contentTemplate : '<div class="group-control-dialog detail-dialog-content device-dialog-content" style="width:592px;"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>' + SmartPlugViewModel.smartPlugControlTemplate
			},
			"All" : {
				buttonsIndex : {
					CLOSE : 0
				},
				onTypeChange : function(e){
					var BTN = e.sender.BTN;
					detailPopup.setActions(BTN.CLOSE, { visible : true });
					detailPopup.setActions(BTN.EDIT, { visible : false });
				},
				selectedDetailFilter : function(data){
					var type = data.mappedType || data.type;
					var allTypeFields = $.extend(true, {}, typePopupConfig["All"].scheme.fields);
					var allTypeGroups = $.extend(true, {}, typePopupConfig["All"].scheme.groupName);
					type = Util.getGeneralType(type);

					//Meter.*을 Meter로 변경, Humidity, Temperature인 경우 Sensor.Temperature_Humidity로 변경
					if(type.indexOf("Meter") != -1) {
						type = "Meter";
					}else if(type.indexOf("Humidity") != -1 || type.indexOf("Temperature") != -1){
						type = "Sensor.Temperature_Humidity";
					}

					//해당 타입의 필드 빼고 모두 제외한다.
					var typeFields = typeSchemeFields[type];
					if(!typeFields) console.error("there is no field this device " + type);

					//해당 타입의 그룹 빼고 모두 제외한다.
					var groupFields = typePopupConfig[type].scheme.groupName ? typePopupConfig[type].scheme.groupName : {};

					//숨길 필드를 리턴한다.
					var hiddenFields = [];

					var key;
					for( key in allTypeFields ){
						if(typeFields.indexOf(key) == -1) hiddenFields.push(key);
					}

					for( key in allTypeGroups){
						//해당 타입의 Group Name에는 존재하지 않는 Field이므로, 숨길 필드 리스트에 추가한다.
						if(!groupFields[key]) hiddenFields.push(key);
					}

					var additionalHiddenFields = [];
					if(additionalOptions[type] && additionalOptions[type].selectedDetailFilter){
						additionalHiddenFields = additionalOptions[type].selectedDetailFilter(data);
					}

					var i, index, max = additionalHiddenFields.length;
					for( i = 0; i < max; i++ ){
						index = hiddenFields.indexOf(additionalHiddenFields[i]);
						//추가적으로 숨길 필드가 존재함.
						if(index != -1) hiddenFields.splice(index, 1);
					}

					return hiddenFields;
				},
				actions : [
					{
						text : I18N.prop("COMMON_BTN_CLOSE"),
						visible : true,
						action : commonCloseBtnEvt
					}
				],
				scheme : { groupName : {} }
			}
		};

		var typePopupConfig = {};

		var config, schemeFields, key, schemeKey;
		//Scheme Field를 설정
		for( key in typeSchemeFields ){
			schemeFields = typeSchemeFields[key];
			config = $.extend(true, {}, baseConfig);
			if( key !== 'All' ) {
				for( schemeKey in config.scheme.fields ){
					if(schemeFields.indexOf(schemeKey) == -1){
						delete config.scheme.fields[schemeKey];
					}
				}
			}
			typePopupConfig[key] = config;
		}

		//All의 경우 Group Name 옵션을 모두 추가
		for (key in additionalOptions){
			if(key !== "All" && additionalOptions[key].scheme && additionalOptions[key].scheme.groupName){
				$.extend(additionalOptions.All.scheme.groupName, additionalOptions[key].scheme.groupName);
			}
		}

		//추가 Option 설정
		for( key in additionalOptions ){
			config = typePopupConfig[key];
			config = $.extend(true, config, additionalOptions[key]);
		}

		/**
		 *   <ul>
		 *   <li>기기 타입별 옵션에 따라 공용 상세 팝업 인스턴스를 생성하고, 인스턴스를 얻는다.</li>
		 *   </ul>
		 *   @function getDetailPopup
		 *   @param {String} deviceType - 기기 타입
		 *   @returns {kendoWidgetInstance} - 공용 상세 팝업 Widget 인스턴스
		 *   @alias module:app/device/common/config/popup-config
		 */
		var getDetailPopup = function(deviceType){
			detailPopup = detailPopupElem.kendoDetailDialog(typePopupConfig[deviceType]).data("kendoDetailDialog");
			return detailPopup;
		};

		var msgDialog, msgDialogElem = $("<div/>");
		msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");
		var confirmDialog, confirmDialogElem = $("<div/>");
		confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");


		return {
			getDetailPopup : getDetailPopup,
			messageDialog : msgDialog,
			confirmDialog : confirmDialog
		};

	});

//# sourceURL=device/common/config/popup-config.js
