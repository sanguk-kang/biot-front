/**
 *
 *   <ul>
 *       <li>space에 관련된 위젯 설정 작업</li>
 *   </ul>
 *   @module app/controlareasettings/building/config/space-widget
 *   @returns {Object} messagDialog - 메세지 팝업 설정
 *   @returns {Object} confirmDialog - 컨펌 팝업 설정
 *   @returns {Object} Loading - 로딩 설정
 */

define("controlareasettings/building/config/space-widget", ["controlareasettings/core", "controlareasettings/building/config/space-common"], function(){
	"use strict";

	/* 컨펌 다이얼로그 (Yes/NO)*/
	var spaceDialogElem = $("<div/>"), spaceDialog;
	spaceDialog = spaceDialogElem.kendoCommonDialog({
		type : "confirm"
	}).data("kendoCommonDialog");

	/* 메시지 다이얼로그 */
	var identifyDialog, identifyDialogElem = $("<div/>");
	identifyDialog = identifyDialogElem.kendoCommonDialog().data("kendoCommonDialog");

	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	return {
		messagDialog : identifyDialog,
		confirmDialog : spaceDialog,
		Loading : Loading
	};
});