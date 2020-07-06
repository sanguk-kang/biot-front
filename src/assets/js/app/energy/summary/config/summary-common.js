/**
	*
	*   <ul>
	*       <li>summary에 관한 페이지</li>
	*       <li>빌팅, 건물, 층과 디바이스 필터, 존, 기기 옵션 선택 가능</li>
	*       <li>연, 월, 일 조정 가능</li>
	*       <li>그래프, 그리드 페이지 구분</li>
	*   </ul>
	*   @module app/energy/summary/config/summary-common
	*   @param {Object} CoreModule- 에너지 core 객체
	*   @requires app/energy/core
	*   @returns {Object} MESSAGE - MESSAGE 텍스트 객체
	*   @returns {Object} TEXT - TEXT 객체
	*/
//[12-04-2018]안쓰는 코드 주석 - CoreModule
// define("energy/summary/config/summary-common", ["energy/core"], function(CoreModule){
define("energy/summary/config/summary-common", [], function(){
	//Code의 품질을 위하여 "use strict" 적용
	"use strict";
	var I18N = window.I18N;

	/*
		다국어 지원을 위한 분리
	*/

	var MESSAGE = {
		ALLFLOORDATA : ['Optimal Start','Comfort','PRC']
	};
	var TEXT = {
		COMMON_MENU_SPACE_BUILDING :I18N.prop("COMMON_MENU_SPACE_BUILDING"),
		SPACE_ZONE :I18N.prop("SPACE_ZONE"),
		ENERGY_PRC :I18N.prop("ENERGY_PRC"),
		ENERGY_COMFORT :I18N.prop("ENERGY_COMFORT"),
		ENERGY_TOTAL :I18N.prop("ENERGY_TOTAL"),
		ENERGY_OPTIMAL_START :I18N.prop("ENERGY_OPTIMAL_START"),

		ENERGY_LOCATION :I18N.prop("ENERGY_LOCATION"),
		ENERGY_ALGORITHM :I18N.prop("ENERGY_ALGORITHM"),
		ENERGY_TEMP_AND_HUM :I18N.prop("ENERGY_TEMP_AND_HUM"),
		SPACE_TEXT_COMFORT :I18N.prop("SPACE_TEXT_COMFORT"),
		COMMON_BTN_DETAIL :I18N.prop("COMMON_BTN_DETAIL"),
		COMMON_NAME :I18N.prop("COMMON_NAME"),
		ENERGY_TYPE :I18N.prop("ENERGY_TYPE"),
		COMMON_STATUS :I18N.prop("COMMON_STATUS"),
		ENERGY_MODE :I18N.prop("ENERGY_MODE"),
		ENERGY_INFORMATION :I18N.prop("ENERGY_INFORMATION"),
		ENERGY_ALL_ALGORITHM :I18N.prop("ENERGY_ALL_ALGORITHM"),
		ENERGY_NONE :I18N.prop("ENERGY_NONE"),
		SPACE_COMFORT_INDEX_UNCOMFORTABLE :I18N.prop("SPACE_COMFORT_INDEX_UNCOMFORTABLE"),
		SPACE_COMFORT_INDEX_COMFORTABLE :I18N.prop("SPACE_COMFORT_INDEX_COMFORTABLE"),
		ENERGY_NORMAL :I18N.prop("ENERGY_NORMAL")
	};
	return {
		MESSAGE : MESSAGE,
		TEXT : TEXT
	};

});