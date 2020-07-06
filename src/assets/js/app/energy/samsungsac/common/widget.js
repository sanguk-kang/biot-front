/**
    *
    *   <ul>
    *       <li>samsungsac에 관련된 위젯 설정 작업</li>
    *   </ul>
    *   @module app/energy/samsungsac/common/widget
    *   @returns {Object} createNewWidget - 위젯 생성 메소드 설정
    *   @returns {Object} msgDialog - 메세지 팝업 설정
    *   @returns {Object} confirmDialog - 컨펌 팝업 설정
    */
define("energy/samsungsac/common/widget", [], function(){
	// var MainWindow = window.MAIN_WINDOW;    // [2018-04-05][사용하지않아 주석]
	/**
     *
     *   id 위젯명 옵션값을 이용하여 새로운 위젯을 생성한다
     *
     *   @function createNewWidget
     *   @param {String} id - 아이디값
     *   @param {String} Widget - 위젯 이름
     *   @param {String} options - 옵션 값
     *   @returns {Object} - 새로 만든 위젯
     *   @alias 없음
     *
     */
	var createNewWidget = function(id, Widget, options){		//[2018-04-10][new 생성자를 사용하는 변수명이 대문자로 사용하는 경고문을 수정 기존 widget -> Widget 수정]
		var elem = $("<div/>").attr("id", id);
		return new Widget(elem, options);
	};

	var msgDialog, msgDialogElem = $("<div/>");
	var confirmDialog, confirmDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");
	confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");


	return {
		createNewWidget : createNewWidget,
		msgDialog : msgDialog,
		confirmDialog : confirmDialog
	};
});
//# sourceURL=energy/samsungsac/common/widget.js
