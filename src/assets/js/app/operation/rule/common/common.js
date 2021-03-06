define("operation/rule/common/common", [], function(){
	// var MainWindow = window.MAIN_WINDOW;
	var I18N = window.I18N;

	var MSG = {
		TXT_SELECT_ALL : I18N.prop("COMMON_BTN_SELECT_ALL"),
		TXT_UNSELECT_ALL :  I18N.prop("COMMON_BTN_DESELECT_ALL"),
		// TXT_CREATE_SCHEDULE : I18N.prop("FACILITY_SCHEDULE_CREATE_NEW_SCHEDULE"),
		TXT_EDIT_SCHEDULE : I18N.prop("FACILITY_SCHEDULE_EDIT_SCHEDULE"),
		// TXT_DELETE_SCHEDULE : I18N.prop("FACILITY_SCHEDULE_DELETE_SCHEDULE_CONFIRM"),
		// TXT_DELETE_EXCEPTIONAL_DAY : I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_CONFIRM"),
		// TXT_DELETE_SCHEDULE_RESULT : I18N.prop("FACILITY_SCHEDULE_DELETE_SCHEDULE_RESULT"),
		// TXT_DELETE_SCHEDULE_MULTI_RESULT : I18N.prop("FACILITY_SCHEDULE_DELETE_SCHEDULE_MULTI_RESULT"),
		// TXT_DELETE_EXCEPTIONAL_DAY_RESULT : I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_SCHEDULE_RESULT"),
		// TXT_DELETE_EXCEPTIONAL_DAY_MULTI_RESULT : I18N.prop("FACILITY_SCHEDULE_DELETE_SEXCEPTIONAL_DAY_MULTI_RESULT"),
		// TXT_CREATE_SCHEDULE_CONFIRM : I18N.prop("FACILITY_SCHEDULE_CREATE_SCHEDULE_CONFIRM"),
		TXT_CREATE_SCHEDULE_CLOSE_CONFIRM : I18N.prop("COMMON_CLOSE_WINDOW_CONFIRM"),
		// TXT_EDIT_SCHEDULE_CONFIRM : I18N.prop("FACILITY_SCHEDULE_EDIT_SCHEDULE_CONFIRM"),
		TXT_CANCEL_SCHEDULE_CONFIRM : I18N.prop("COMMON_MESSAGE_CONFIRM_CANCEL"),
		TXT_CREATE_SCHEDULE_RESULT : I18N.prop("COMMON_MESSAGE_NOTI_SAVED")
	};

	return {
		MSG : MSG
	};
});
//# sourceURL=operation/rule/common/common.js