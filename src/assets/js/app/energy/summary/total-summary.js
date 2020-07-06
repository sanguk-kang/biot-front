/**
 *
 *   <ul>
 *       <li>summary 전체층에 대한 화면 그리드 제공</li>
 *   </ul>
 *   @module app/energy/summary//total-summary
 *   @param {Object} CoreModule- 에너지 core 객체
 *   @param {Object} Common- summary Common 객체
 *   @param {Object} Widget- summary Widget 객체
 *   @requires app/energy/core
 *   @requires app/energy/summary/config/summary-common
 *   @requires app/energy/summary/config/summary-widget
 *   @returns {Object} 없음
 */
define("energy/summary/total-summary",["energy/core", "energy/summary/config/summary-common",
	"energy/summary/config/summary-widget"], function(CoreModule, Common, Widget){
	//Code의 품질을 위하여 "use strict" 적용
	"use strict";

	// var MainWindow = window.MAIN_WINDOW;			//[12-04-2018]안쓰는 코드 주석
	var Util = window.Util;
	// var MSG = Common.MESSAGE;					//[12-04-2018]안쓰는 코드 주석
	// var confirmDialog = Widget.confirmDialog,	//[12-04-2018]안쓰는 코드 주석
	var msgDialog = Widget.messagDialog;
	// var Loading = Widget.Loading;				//[12-04-2018]안쓰는 코드 주석
	var totalGridFields = Widget.totalSummaryFields;
	var totalGridColumns;
	var summaryTotalGridElem;
	// var summaryTotalGrid, summaryTotaldropBox;	//[12-04-2018]안쓰는 코드 주석
	var totalData;
	/* 시작시 실행 */
	var init = function(){
		summaryTotalGridElem = $('#summaryTotalGrid');
		// summaryTotaldropBox = $('#summary-control');	//[12-04-2018]안쓰는 코드 주석

		$.ajax({
			url : "/energy/algorithm-summary"
		}).done(function(data){
			if(!data){
				totalData = [];
			}
			totalData = data;
			initGrid(totalData);
		}).fail(function(xhq){
			var msg = Util.parseFailResponse(xhq);
			msgDialog.message(msg);
			msgDialog.open();
		});

	   /* var modeList = [
				{ text : "AllMode", value: "All Mode" },
				{ text : "Optimal Start", value: "Optimal Start" },
				{ text : "Comfort", value: "Comfort" },
				{ text : "Presence", value: "Presence" },
				{ text : "PRC", value: "PRC" }
			]
		summaryTotaldropBox.empty();*/
		//initDropBox(modeList);
	};

	/* var initDropBox = function(modeList){
		$('<input class="areaSelect size-s dropDown"/>').appendTo(summaryTotaldropBox).kendoDropDownList({
			dataValueField: "value",
			dataTextField: "text",
			animation: false,
			dataSource: modeList,
			enable: false
		});
	}*/
	/**
	 *
	 *   첫 시작시 그리드 만들어주는 함수
	 *
	 *   @function initGrid
	 *   @param {Array} totalBuildingList - 그리드 데이터 리스트
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var initGrid = function(totalBuildingList){
		var totalList = totalBuildingList.length;
		var zoneCount = 0, optimalStartCount = 0, comfortCount = 0, prcCount = 0;
		// var column;					//[12-04-2018]안쓰는 코드 주석
		// console.log(totalBuildingList)


		for(var i = 0; i < totalList; i++){

			if(totalBuildingList[i].zone_count){
				zoneCount += Number(totalBuildingList[i].zone_count);
			}
			if(totalBuildingList[i].optimal_start_count){
				optimalStartCount += Number(totalBuildingList[i].optimal_start_count);
			}
			if(totalBuildingList[i].comfort_count){
				comfortCount += Number(totalBuildingList[i].comfort_count);
			}
			if(totalBuildingList[i].prc_count){
				prcCount += Number(totalBuildingList[i].prc_count);
			}
		}

		totalGridColumns = Widget.totalSummaryColumns({
			zoneCount :zoneCount,
			//[19-04-2018] [SAMB-28]카운트를 나누는 잠재적 버그 수정 -jw.lim
			// optimalStartCount :optimalStartCount ? (optimalStartCount / totalList).toFixed(0) : '-',
			// comfortCount : comfortCount ? (comfortCount / totalList).toFixed(0) : '-',
			// prcCount : comfortCount ? (prcCount / totalList).toFixed(0) : '-'
			optimalStartCount :optimalStartCount ? optimalStartCount : '-',
			comfortCount : comfortCount ? comfortCount : '-',
			prcCount : comfortCount ? prcCount : '-'
		});
		//totalGridColumns =Widget.totalSummaryColumns();
		// console.log(totalGridColumns)

		//[12-04-2018]안쓰는 코드 주석
		// summaryTotalGrid = summaryTotalGridElem.kendoGrid({
		summaryTotalGridElem.kendoGrid({
			dataSource: {
				data: totalBuildingList,
				schema: {
					model: {
						fields: totalGridFields
					}
				}
			},
			//dataBound: onDataBound,
			height: 'calc(100% + 36px)',
			scrollable: true,
			sortable: true,
			filterable: false,
			//pageable: false,
			columns: totalGridColumns,
			editable: 'inline',

			remove: function(e) {
				// console.log('삭제함');
			  },
			save: function(e){
				// console.log('저장됨');
			}
		}).data("kendoGrid");

	};
	return {
		init : init
	};

});

//# sourceURL=energy/total-summary.js

