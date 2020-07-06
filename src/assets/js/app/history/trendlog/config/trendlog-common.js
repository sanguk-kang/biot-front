define("history/trendlog/config/trendlog-common", [], function(){
	// var MainWindow = window.MAIN_WINDOW;			//[2018-04-12][미사용 변수 주석처리]

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
		TXT_CANCEL_SCHEDULE_CONFIRM : "Do you want to cancel changes?",
		TXT_CREATE_SCHEDULE_RESULT : "Saved.",
		TXT_DELETED : "Deleted."
	};

	var createNewWidget = function(id, Widget, options){
		var elem = $("<div/>").attr("id", id);
		return new Widget(elem, options);
	};


	var msgDialog, msgDialogElem = $("<div/>");
	var confirmDialog, confirmDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");
	confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");

	return {
		MSG : MSG,
		createNewWidget : createNewWidget,
		confirmDialog : confirmDialog,
		msgDialog : msgDialog
	};
});