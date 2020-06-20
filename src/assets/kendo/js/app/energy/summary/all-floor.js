/**
 *
 *   <ul>
 *       <li>summary all-floor 화면 작업</li>
 *       <li>건물의 층 정보에 관한 popup 제공</li>
 *   </ul>
 *   @module app/energy/summary/all-floor
 *   @param {Object} CoreModule- 에너지 core 객체
 *   @param {Object} Common- summary Common 객체
 *   @param {Object} Widget- summary Widget 객체
 *   @requires app/energy/core
 *   @requires app/energy/summary/config/summary-common
 *   @requires app/energy/summary/config/summary-widget
 *   @returns {Object} 없음
 */
define("energy/summary/all-floor", ["energy/core", "energy/summary/config/summary-common",
	"energy/summary/config/summary-widget"], function(CoreModule, Common, Widget){
	//Code의 품질을 위하여 "use strict" 적용
	"use strict";
	var MainWindow = window.MAIN_WINDOW;
	var Util = window.Util;
	var I18N = window.I18N;
	// var MSG = Common.MESSAGE;					//[12-04-2018]안쓰는 코드 주석
	var TEXT = Common.TEXT;
	// var confirmDialog = Widget.confirmDialog,	//[12-04-2018]안쓰는 코드 주석
	var msgDialog = Widget.messagDialog;
	var Loading = Widget.Loading;
	var allGridFields = Widget.allSummaryFloorFields;
	var allGridColumns = Widget.allSummaryFloorColumns;
	var popupGridFields = Widget.popupGridFields;
	var popupGridColumns = Widget.popupGridColumns;
	var summaryAllGrid, summaryAllGridElem,summaryAlldropBox;
	var buildingData, zonePopupData;
	var popupGridElem;
	// var buildingId, zoneData, mapMadeElem, mapMade, flooDataList, popupDataList, deviceData, popupGrid;		//[12-04-2018]안쓰는 코드 주석
	var gridDropDownList,gridDropDownListElem;
	var modeDropDownList;
	var modeList = [
		{ text : TEXT.ENERGY_OPTIMAL_START, value: "OptimalStart" },
		{ text : TEXT.ENERGY_COMFORT, value: "Comfort" },
		{ text : TEXT.ENERGY_PRC, value: "PRC" }
	];
	/**
	 *
	 *   현재 층에 대한 정보를 쿼리에 주가한다.
	 *
	 *   @function getFloorQuery
	 *   @param {Object}floorData - 기존 층 데이터
	 *   @param {Object}isCheckedAll - 체크 확인 데이터
	 *   @returns {Object} q - 쿼리데이터
	 *   @alias 없음
	 *
	 */
	var getFloorQuery = function(floorData, isCheckedAll){
		if(!floorData){
			floorData = MainWindow.getCurrentFloor();
		}
		var q = "?";
		if(floorData.building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
			q += "foundation_space_buildings_id=" + floorData.building.id + "&";
		}
		if(floorData.floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			q += "foundation_space_floors_id=" + floorData.floor.id;
		}

		if((q == "?" || q.indexOf("foundation_space_floors_id") == -1) && isCheckedAll){
			return false;
		}
		return q;
		//return "";
	};
	/**
	 *
	 *   summary 페이지 진입시 기본 셋팅을 해주는 함수
	 *
	 *   @function init
	 *   @param {Object} initArg - 건물데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var init = function(initArg){
		buildingData = initArg.building;
		// buildingId = buildingData.id;			//[12-04-2018]안쓰는 코드 주석
		summaryAllGridElem = $('#summaryAllGrid');
		summaryAlldropBox = $('#summary-control');
		//mapMadeElem = $('#popup-map');
		// console.log(initArg.floor)

		//var modeName = $('#summary-control .dropdown').find('.dropDown').val();
		summaryAlldropBox.empty();
		initDropBox(modeList);
		//var modeName = dropDown.value();
		modeDropDownList = $('#summary-control input.dropDown').data("kendoDropDownCheckBox");
		var modeName = modeDropDownList.value();

		var q = getFloorQuery(initArg);
		Loading.open();
		$.ajax({
			url : "/energy/algorithm-summary" + q
		}).done(function(data){
			initStatistic(data);
		}).fail(function(xhq){
			initStatistic(buildingData);
			var msg = Util.parseFailResponse(xhq);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			q = q.replace("?", "&");
			$.ajax({
				url : "/energy/algorithm-summary/zone?algorithm=" + modeName + q
			}).done(function(data){
				if(!data){
					buildingData = [];
				}

				buildingData = data;

				// console.log(buildingData)
				initGrid(buildingData);
				//initDropBox(modeList);
			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		});


		summaryAllGridElem.on('click','tr [data-event="devicedetail"]', function(){
			// var zoneId = $(this).closest('td').attr('data-name');		//[12-04-2018]안쓰는 코드 주석
			var thisButton = $(this);
			// console.log(zoneId)
			// var floorImgUrl = '';										//[12-04-2018]안쓰는 코드 주석
			/* zone 데이터 받아와서 map 이미지와 디바이스 로케이션 정보 받아옴 */
			//var deviceData,zoneData;
			Loading.open();
			popupDataMade(thisButton);

		});

	};
	/**
	 *
	 *   페이지 시작시 view에 statistic html 만들어주는 함수
	 *
	 *   @function initStatistic
	 *   @param {Object} dataList - summary 리스트
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var initStatistic = function(dataList){
		if($.isArray(dataList) && dataList[0]){
			dataList = dataList[0];
		}
		var optimal_start_count,comfort_count,prc_count;
		optimal_start_count = dataList.optimal_start_count ? dataList.optimal_start_count : "-";
		comfort_count = dataList.comfort_count ? dataList.comfort_count : "-";
		prc_count = dataList.prc_count ? dataList.prc_count : "-";

		summaryAllGridElem.find(".statistic-view").remove();

		var initStatisticHtml = '<div class="statistic-view"><ul>' +
		'<li><div class="cell"><span>' + TEXT.ENERGY_OPTIMAL_START + '</span><span>' + optimal_start_count + '</span></div></li>' +
		'<li><div class="cell"><span>' + TEXT.ENERGY_COMFORT + '</span><span>' + comfort_count + '</span></div></li>' +
		'<li><div class="cell"><span>' + TEXT.ENERGY_PRC + '</span><span>' + prc_count + '</span></div></li></ul></div>';
		summaryAllGridElem.prepend(initStatisticHtml);
	};
	/**
	 *
	 *   페이지 시작시 드롭박스 만들어주는 함수
	 *
	 *   @function initDropBox
	 *   @param {Object} modeList - summary 리스트
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//[12-04-2018]안쓰는 코드 주석 - modeList
	// var initDropBox = function(modeList){
	var initDropBox = function(){
		$('<input class="areaSelect size-s dropDown"/>').appendTo(summaryAlldropBox);
		/*	.kendoDropDownList({
			dataValueField: "value",
			dataTextField: "text",
			animation: false,
			dataSource: modeList,
			enable: true
		});*/
		gridDropDownListElem = summaryAlldropBox.find('.areaSelect');
		gridDropDownList = gridDropDownListElem.kendoDropDownCheckBox({
			invisible : false,
			disabled : false,       //비활성화 여부
			dataTextField: "text",              //반영되지 않는 옵션의 경우 device-base.html 템플릿 수정 필요
			dataValueField: "value",
			selectAllText : TEXT.ENERGY_ALL_ALGORITHM,
			animation: false,
			autoBind : true,
			showSelectAll: true,
			emptyText: I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY"),
			dataSource : modeList
		}).data("kendoDropDownCheckBox");
		//$('#popup-map').find('.circle-data').hide();

		gridDropDownList._old = 'OptimalStart,Comfort,PRC';
		gridDropDownListElem.on('change',function(e){
			var changeName = gridDropDownList._old;
			// var com;			//[12-04-2018]안쓰는 코드 주석
			var q = getFloorQuery();
			q = q.replace("?", "&");
			$.ajax({
				url : "/energy/algorithm-summary/zone?algorithm=" + changeName + q

			}).done(function(data){
				if(!data){
					buildingData = [];
				}
				buildingData = data;
				initGrid(buildingData);

			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			});

		});

		gridDropDownList.bind("selectionChanged", function(e){

		});
		gridDropDownList.selectAll();


	};
	/**
	 *
	 *   페이지 시작시 그리드 만들어주는 함수
	 *
	 *   @function initGrid
	 *   @param {Object} allFloorData -  그리드에 들어갈 summary 리스트
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var initGrid = function(allFloorData){
		summaryAllGrid = summaryAllGridElem.kendoGrid({
			dataSource: {
				data: allFloorData,
				schema: {
					model: {
						fields: allGridFields
					}
				}
			},
			//dataBound: onDataBound,
			height: 'calc(100% - 72px)',
			scrollable: true,
			sortable: true,
			filterable: false,
			//pageable: false,
			columns: allGridColumns,

			remove: function(e) {
				// console.log('삭제함');
			},
			save: function(e){
				// console.log('저장됨');
			}
		}).data("kendoGrid");
	};
	/**
	 *
	 *   popup 페이지 그리드 만들어주는 함수
	 *
	 *   @function initPopupGrid
	 *   @param {Object} allPopupData -  popup 전체 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var initPopupGrid = function(allPopupData){
		popupGridElem = $('#popupDetailTable');
		// console.log(allPopupData)
		var allPopupDataList = allPopupData ? allPopupData : [];
		//[12-04-2018]안쓰는 코드 주석
		// popupGrid = popupGridElem.kendoGrid({
		popupGridElem.kendoGrid({
			dataSource: {
				data: allPopupDataList,
				schema: {
					model: {
						fields: popupGridFields
					}
				}
			},
			//dataBound: onDataBound,
			height: '100%',
			scrollable: true,
			sortable: true,
			filterable: false,
			//pageable: false,
			columns: popupGridColumns,

			remove: function(e) {
				// console.log('삭제함');
			},
			save: function(e){
				// console.log('저장됨');
			}
		}).data("kendoGrid");

	};
	/**
	 *
	 *   popup 페이지 데이터 만들어주는 함수
	 *
	 *   @function popupDataMade
	 *   @param {Object} target -  선택한 row
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var popupDataMade = function(target){
		var thisTarget = target;
		var thisUid = thisTarget.closest('tr').attr('data-uid');
		// var thisIndex = thisTarget.closest('tr').index();		//[12-04-2018]안쓰는 코드 주석
		var dataItem = summaryAllGrid.dataSource.getByUid(thisUid);
		//popupDetailTable
		Loading.open();
		 $.ajax({
			url : "/energy/algorithm-summary/zone/" + dataItem.zone_id
		}).done(function(data){
			 Loading.close();
			if(!data){
				zonePopupData = [];
			}
			zonePopupData = data;

			if(!dataItem.location){
				zonePopupData.location = '-';
			}else{
				zonePopupData.location = dataItem.location;
			}

			zonePopupData.modes = dataItem.modes;
			singlePop.kendoPopupSingleWindow("bindSummaryData", [zonePopupData], 0);
			singlePop.kendoPopupSingleWindow("openWindowPopup");

			 if(zonePopupData.tempHum){
				zonePopupData.sacDevices = zonePopupData.sacDevices.concat(zonePopupData.tempHum);
			}

			if(zonePopupData.occupancy){
				zonePopupData.sacDevices = zonePopupData.sacDevices.concat(zonePopupData.occupancy);
			}

			initPopupGrid(zonePopupData.sacDevices);
			$('#summaryPopup_wnd_title').html(TEXT.COMMON_BTN_DETAIL);
		}).fail(function(xhq){
			var msg = Util.parseFailResponse(xhq);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			Loading.close();
		});
		//sacDevice

		/* popup grid  */

		/* popup 내부 map  */

	};

	/* 팝업 정의 */
	var singlePop = $("#summaryPopup");
	if(!singlePop.data("kendoPopupSingleWindow")){
		var spaceBuildingMessageDialog = $("#summary-building-message-dialog");
		var spaceBuildingConfirmDialog = $("#summary-building-confirm-dialog");
		spaceBuildingMessageDialog.kendoCommonDialog();
		spaceBuildingConfirmDialog.kendoCommonDialog({
			type: "confirm",
			title: "Notification"
		});
		singlePop = $("#summaryPopup").kendoPopupSingleWindow({ model: Widget.Model, width: "1030px", height: "790px" });

	}

	return {
		init : init
	};

});

//# sourceURL=energy/all-floor.js
