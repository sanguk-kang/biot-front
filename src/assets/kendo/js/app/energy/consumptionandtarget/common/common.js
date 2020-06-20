/**
	*
	*   <ul>
	*       <li>consumption에 관련된 공통 값 설정 작업</li>
	*   </ul>
	*   @module app/energy/consumptionandtarget/common/common
	*   @param {Object} Widget- energy Widget 객체
	*   @requires app/main
	*   @requires app/energy/consumptionandtarget/common/widget
	*   @returns {Object} MSG -메세지 object
	*   @returns {Object} TEXT - text object
	*   @returns {Array} groupFilterDataSource - device 그룹 필터 실행
	*/
define("energy/consumptionandtarget/common/common", ["energy/consumptionandtarget/common/widget"], function(Widget){
	var I18N = window.I18N;
	var Util = window.Util;
	var msgDialog = Widget.msgDialog;
	var moment = window.moment;

	/*
		메시지나 공용 변수나 값들을 관리
		아래는 예시이다.
	*/
	var MSG = {
		TXT_SELECT_ALL : "Select All",
		TXT_UNSELECT_ALL : "Deselect All",
		TXT_CREATE_SCHEDULE : "Create New Schedule",
		TXT_EDIT_SCHEDULE : "Edit Schedule",
		TXT_DELETE_SCHEDULE : "Do you want to delete the selected Schedule?",
		TXT_DELETE_EXCEPTIONAL_DAY : "Do you want to delete the selected Exceptional Day?",
		TXT_DELETE_SCHEDULE_RESULT : "The selected Schedule has been deleted",
		TXT_DELETE_SCHEDULE_MULTI_RESULT : "The selected {0} Schedule has been deleted",
		TXT_DELETE_EXCEPTIONAL_DAY_RESULT : "The selected Exceptional Day has been deleted",
		TXT_DELETE_EXCEPTIONAL_DAY_MULTI_RESULT : "The selected {0} Exceptional Day has been deleted",
		TXT_CREATE_SCHEDULE_CONFIRM : "Do you want to Create schedule?",
		TXT_CREATE_SCHEDULE_CLOSE_CONFIRM : "Do you want to close this window?\nThe contents are canceled when you close this window.",
		TXT_EDIT_SCHEDULE_CONFIRM : "Do you want to Edit schedule?",
		COMMON_MESSAGE_CONFIRM_CANCEL : I18N.prop("COMMON_MESSAGE_CONFIRM_CANCEL"),
		COMMON_MESSAGE_NOTI_CHANGES_SAVED  : I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"),
		ENERGY_TARGET_LESS  : I18N.prop("ENERGY_TARGET_LESS")
	};
	var TEXT = {
		FACILITY_DEVICE_OUTDOOR_TEMPERATURE :I18N.prop("FACILITY_DEVICE_OUTDOOR_TEMPERATURE"),
		COMMON_TIME :I18N.prop("COMMON_TIME"),
		ENERGY_GIRD_TOTAL :I18N.prop("ENERGY_GIRD_TOTAL"),

		ENERGY_GIRD_LIGHT :I18N.prop("ENERGY_GIRD_LIGHT"),
		ENERGY_GIRD_OTHER :I18N.prop("ENERGY_GIRD_OTHER"),
		ENERGY_SAC :I18N.prop("ENERGY_SAC"),
		ENERGY_LIGHT :I18N.prop("ENERGY_LIGHT"),
		ENERGY_OTHERS :I18N.prop("ENERGY_OTHERS"),

		COMMON_BTN_EDIT :I18N.prop("COMMON_BTN_EDIT"),
		COMMON_BTN_SAVE :I18N.prop("COMMON_BTN_SAVE"),
		COMMON_BTN_CANCEL :I18N.prop("COMMON_BTN_CANCEL"),

		ENERGY_TARGET_ENERGY_CONSUMPTION :I18N.prop("ENERGY_TARGET_ENERGY_CONSUMPTION"),
		ENERGY_DATE_JAN :I18N.prop("ENERGY_DATE_JAN"),
		ENERGY_DATE_FEB :I18N.prop("ENERGY_DATE_FEB"),
		ENERGY_DATE_MAR :I18N.prop("ENERGY_DATE_MAR"),
		ENERGY_DATE_APR :I18N.prop("ENERGY_DATE_APR"),
		ENERGY_DATE_MAY :I18N.prop("ENERGY_DATE_MAY"),
		ENERGY_DATE_JUN :I18N.prop("ENERGY_DATE_JUN"),
		ENERGY_DATE_JUL :I18N.prop("ENERGY_DATE_JUL"),
		ENERGY_DATE_AUG :I18N.prop("ENERGY_DATE_AUG"),
		ENERGY_DATE_SEP :I18N.prop("ENERGY_DATE_SEP"),
		ENERGY_DATE_OCT :I18N.prop("ENERGY_DATE_OCT"),
		ENERGY_DATE_NOV :I18N.prop("ENERGY_DATE_NOV"),
		ENERGY_DATE_DEC :I18N.prop("ENERGY_DATE_DEC"),
		ENERGY_REDUCTION :I18N.prop("ENERGY_REDUCTION"),

		COMMON_MENU_ENERGY_CONSUMPTION_AND_TARGET :I18N.prop("COMMON_MENU_ENERGY_CONSUMPTION_AND_TARGET"),
		ENERGY_AMOUNT_TARGET :I18N.prop("ENERGY_AMOUNT_TARGET"),
		COMMON_MENU_ENERGY_CONSUMPTION :I18N.prop("COMMON_MENU_ENERGY_CONSUMPTION"),
		ENERGY_ENERGY_CONSUMPTION :I18N.prop("ENERGY_ENERGY_CONSUMPTION"),
		ENERGY_ENERGY_CONSUMPTION_OF :I18N.prop("ENERGY_ENERGY_CONSUMPTION_OF"),
		ENERGY_DEVICE_GROUPS_EMPTY :I18N.prop("ENERGY_DEVICE_GROUPS_EMPTY"),
		ENERGY_TARGET_ENERGY_GRID :I18N.prop("ENERGY_TARGET_ENERGY_GRID"),
		ENERGY_TARGET_ENERGY :I18N.prop("ENERGY_TARGET_ENERGY"),

		FACILITY_DEVICE_TYPE_ALL_METER :I18N.prop("FACILITY_DEVICE_TYPE_ALL_METER"),
		COMMON_MENU_FACILITY_GROUP :I18N.prop("COMMON_MENU_FACILITY_GROUP"),
		ENERGY_METER_TYPE_WATTHOUR :I18N.prop("ENERGY_METER_TYPE_WATTHOUR"),
		ENERGY_METER_TYPE_GAS :I18N.prop("ENERGY_METER_TYPE_GAS"),
		ENERGY_METER_TYPE_WATER :I18N.prop("ENERGY_METER_TYPE_WATER"),
		ENERGY_ALL_GROUP :I18N.prop("ENERGY_ALL_GROUP"),
		ENERGY_ALL_DEVICE_GROUP :I18N.prop("ENERGY_ALL_DEVICE_GROUP"),
		ENERGY_ENERGY_METER_TYPE :I18N.prop("ENERGY_ENERGY_METER_TYPE"),

		ENERGY_INQUIRED_PERIOD :I18N.prop("ENERGY_INQUIRED_PERIOD"),
		ENERGY_INQUIRY_TARGET :I18N.prop("ENERGY_INQUIRY_TARGET"),
		ENERGY_NUMBER_OF_GROUP :I18N.prop("ENERGY_NUMBER_OF_GROUP")
	};
	/**
	 *
	 *   디바이스 필터 리스트를 ajax를 통하여 받아와서 드롭다운 리스트의 구조로 만들어준다.
	 *
	 *   @function groupFilterDataSource
	 *   @param {Object} - 없음
	 *   @returns {Array} - device 리스트
	 *   @alias 없음
	 *
	 */
	var groupFilterDataSource = function(){
		var dataList = [];
		$.ajax({
			url : '/dms/groups'
		}).done(function(data){
			for(var i = 0; i < data.length; i++){
				if(data[i].dms_devices_ids.length > 0){
					dataList.push({text : data[i].name, value : String(data[i].id)});
				}
			}
		}).fail(function(data){
			var msg = Util.parseFailResponse(data);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
		});
		return dataList;
	};

	var getChartXAxisLabel = function getChartXAxisLabel (dateType, date) {
		var result = [], i, max;
		if (dateType === 'day') {
			if (window.GlobalSettings.getTimeDisplay() === '24Hour') {
				for (i = 0; i < 24; i++) {
					result[i] = I18N.prop("ENERGY_CHART_TIME_HOUR", i);
				}
			} else {
				result = ['12 AM', '1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'];
			}
		} else if (dateType === 'month') {
			max = moment(date).daysInMonth();
			for (i = 1; i <= max; i++) {
				result.push(moment(i, "DD").format('Do'));
			}
		} else if (dateType === 'year') {
			max = 12;
			for (i = 1; i <= max; i++) {
				result.push(moment(i, "MM").format('MMM'));
			}
		}
		return result;
	};

	return {
		MSG : MSG,
		TEXT:TEXT,
		groupFilterDataSource:groupFilterDataSource,
		getChartXAxisLabel: getChartXAxisLabel
	};
});
//# sourceURL=energy/consumption/common/common.js
