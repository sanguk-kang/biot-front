/**
*
*   <ul>
*       <li>Group 공용</li>
*       <li>다국어 텍스트</li>
*       <li>Widget 생성 API를 지원한다.</li>
*   </ul>
*   @module app/operation/group/config/group-common
*   @requires config
*
*/
define("operation/group/config/group-common", function(){
	"use strict";
	var I18N = window.I18N;

	var MSG = {
		TXT_SELECT_ALL : I18N.prop("COMMON_BTN_SELECT_ALL"),
		TXT_UNSELECT_ALL : I18N.prop("COMMON_BTN_DESELECT_ALL"),
		DELETE_CONFIRM : I18N.prop("FACILITY_GROUP_MESSAGE_CONFIRM_DELETE_SELECTED_GROUP"),
		DELETE_RESULT : I18N.prop("FACILITY_GROUP_MESSAGE_NOTI_DELETED_SELECTED_GROUP"),
		DELETE_MULTI_RESULT : I18N.prop("FACILITY_GROUP_MESSAGE_NOTI_DELETED_SELECTED_MULTI_GROUP"),
		TXT_EDIT_GROUP : I18N.prop("FACILITY_GROUP_EDIT_GROUP"),
		TXT_CREATE_GROUP : I18N.prop("FACILITY_GROUP_CREATE_NEW_GROUP"),
		TXT_CREATE_GROUP_CANCEL_CONFIRM : I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_CANEL"),
		TXT_CREATE_GROUP_CLOSE_CONFIRM : I18N.prop("COMMON_CLOSE_WINDOW_CONFIRM"),
		TXT_CANCEL_GROUP_CONFIRM : I18N.prop("COMMON_MESSAGE_CONFIRM_CANCEL"),
		TXT_CREATE_GROUP_RESULT : I18N.prop("FACILITY_GROUP_MESSAGE_NOTI_NEW_GROUP_CREATED"),
		TXT_EDIT_GROUP_RESULT : I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"),
		TXT_MAXIMUM_NUMBER_OF_GROUP : I18N.prop("FACILITY_GROUP_MAXIMUM_NUMBER_OF_GROUP")
	};

	/**
	*   <ul>
	*   <li>Widget 인스턴스를 생성한다.</li>
	*   </ul>
	*   @function createWidget
	*   @param {String} id - 요소의 ID 속성
	*   @param {kendojQueryWidget} Widget - Widget Class
	*   @param {Object} options - Widget을 생성할 Option 객체
	*   @returns {kendojQueryWidget} - 새로운 Widget 인스턴스
	*   @alias module:app/operation/group/config/group-common
	*
	*/
	var createNewWidget = function(id, Widget, options){
		var elem = $("<div/>").attr("id", id);
		return new Widget(elem, options);
	};

	return {
		MSG : MSG,
		createNewWidget : createNewWidget
	};
});
