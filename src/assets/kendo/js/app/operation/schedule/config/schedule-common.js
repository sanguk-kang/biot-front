/**
 *
 *   <ul>
 *       <li>Schedule 공용</li>
 *       <li>다국어 텍스트</li>
 *       <li>Widget 생성 API를 지원한다.</li>
 *   </ul>
 *   @module app/operation/schedule/config/schedule-common
 *   @requires config
 *
 */
//[13-04-2018]안쓰는 코드 주석 : DeviceTemplate -jw.lim
// define("operation/schedule/config/schedule-common", [], function(DeviceTemplate){
define("operation/schedule/config/schedule-common", [], function(){
	// var MainWindow = window.MAIN_WINDOW;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
	var I18N = window.I18N;

	var MSG = {
		TXT_SELECT_ALL : I18N.prop("COMMON_BTN_SELECT_ALL"),
		TXT_UNSELECT_ALL : I18N.prop("COMMON_BTN_DESELECT_ALL"),
		TXT_CREATE_SCHEDULE : I18N.prop("FACILITY_SCHEDULE_CREATE_NEW_SCHEDULE"),
		TXT_EDIT_SCHEDULE : I18N.prop("FACILITY_SCHEDULE_EDIT_SCHEDULE"),
		TXT_DELETE_SCHEDULE : I18N.prop("FACILITY_SCHEDULE_DELETE_SCHEDULE_CONFIRM"),
		TXT_DELETE_EXCEPTIONAL_DAY : I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_CONFIRM"),
		TXT_DELETE_MULTI_EXCEPTIONAL_DAY : I18N.prop("FACILITY_SCHEDULE_DELETE_MULTI_EXCEPTIONAL_DAY_CONFIRM"),
		TXT_DELETE_SCHEDULE_RESULT : I18N.prop("FACILITY_SCHEDULE_DELETE_SCHEDULE_RESULT"),
		TXT_DELETE_SCHEDULE_MULTI_RESULT : I18N.prop("FACILITY_SCHEDULE_DELETE_SCHEDULE_MULTI_RESULT"),
		TXT_DELETE_EXCEPTIONAL_DAY_RESULT : I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_RESULT"),
		TXT_DELETE_EXCEPTIONAL_DAY_MULTI_RESULT : I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_MULTI_RESULT"),
		TXT_CREATE_SCHEDULE_CONFIRM : I18N.prop("FACILITY_SCHEDULE_CREATE_SCHEDULE_CONFIRM"),
		TXT_CREATE_SCHEDULE_CLOSE_CONFIRM : I18N.prop("COMMON_CLOSE_WINDOW_CONFIRM"),
		TXT_EDIT_SCHEDULE_CONFIRM : I18N.prop("FACILITY_SCHEDULE_EDIT_SCHEDULE_CONFIRM"),
		TXT_CANCEL_SCHEDULE_CONFIRM : I18N.prop("COMMON_MESSAGE_CONFIRM_CANCEL"),
		TXT_CREATE_SCHEDULE_RESULT : I18N.prop("COMMON_MESSAGE_NOTI_SAVED")
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
	 *   @alias module:app/operation/schedule/config/schedule-common
	 *
	 */
	var createNewWidget = function(id, Widget, options){
		var elem = $("<div/>").attr("id", id);
		return new Widget(elem, options);
	};

	var schedulerHeaderTemplate = '<div class="k-floatwrap k-header k-scheduler-toolbar grid-scheduler-toolbar"><ul class="k-reset k-header k-scheduler-views k-scheduler-navigation"><li class="k-current-view-dropdownlist"><input id="toolbar-dropdownlist-btn" data-role="dropdownlist" data-text-field="text" data-value-field="value" data-bind="source: dateTypeFilter.options.dataSource, events: {select: dateTypeFilter.options.select }"></input></li>' + '<li class="k-state-default k-header k-nav-today" data-action="today"><button data-role="button" class="k-button" data-bind="disabled: todayButton.disabled, events: {click: todayButton.options.click}"><span data-bind="text:todayButton.text"></span></button></li>' + '</ul><ul class="k-reset k-scheduler-navigation" data-bind="invisible: navigation.isInvisible"><li class="k-state-default k-header k-nav-prev" data-action="previous"><a role="button" class="k-link"><span class="ic ic-date-prev"></span></a></li><li class="k-state-default k-nav-current" data-action="nav-current"><a role="button" class="k-link"><span class="k-icon k-i-calendar"></span><span class="k-sm-date-format" data-bind="text: formattedShortDate" style="display:block;">2017-04-23 ~ 2017-04-29</span></a><i class="ic ic-error-calendar" style="display:none;"></i></li><li class="k-state-default k-header k-nav-next" data-action="next"><a role="button" class="k-link"><span class="ic ic-date-next"></span></a></li></ul><ul class="k-reset k-header k-scheduler-views legend"><li class="k-current-view" data-name="week"><a role="button" class="k-link">Week</a></li><li class="selected-text"><span data-bind="text: selectedText"></span></li></ul></div>';

	var schedulerSearchHeaderTemplate = '<div class="k-floatwrap k-header k-scheduler-toolbar grid-scheduler-toolbar"><ul class="k-reset k-header k-scheduler-views k-scheduler-navigation"><li class="k-current-view-dropdownlist"><input id="toolbar-dropdownlist-btn" data-role="dropdownlist" data-text-field="text" data-value-field="value" data-option-label="' + I18N.prop("FACILITY_DEVICE_TYPE_ALL") + '" data-bind="source: dateTypeFilter.options.dataSource, events: {select: dateTypeFilter.options.select }"></input></li>' + '<li class="k-state-default k-header k-nav-today" data-action="today"><button data-role="button" class="k-button" data-bind="disabled: todayButton.disabled, events: {click: todayButton.options.click}"><span data-bind="text:todayButton.text"></span></button></li>' + '</ul><ul class="k-reset k-scheduler-navigation" data-bind="invisible: navigation.isInvisible"><li class="k-state-default k-header k-nav-prev" data-action="previous"><a role="button" class="k-link"><span class="ic ic-date-prev"></span></a></li><li class="k-state-default k-nav-current" data-action="nav-current"><a role="button" class="k-link"><span class="k-icon k-i-calendar"></span><span class="k-sm-date-format" data-bind="text: formattedShortDate" style="display:block;">2017-04-23 ~ 2017-04-29</span></a><i class="ic ic-error-calendar" style="display:none;"></i></li><li class="k-state-default k-header k-nav-next" data-action="next"><a role="button" class="k-link"><span class="ic ic-date-next"></span></a></li></ul><ul class="k-reset k-header k-scheduler-views legend"><li class="k-current-view" data-name="week"><a role="button" class="k-link">Week</a></li><li class="selected-text"><span data-bind="text: selectedText"></span></li></ul></div>';

	var exceptionalDaysHeaderTemplate = '<div class="k-floatwrap k-header k-scheduler-toolbar grid-scheduler-toolbar"><ul class="k-reset k-header k-scheduler-views k-scheduler-navigation"><li class="k-state-default k-view-month" data-name="month"><a role="button" class="k-button">' + I18N.prop("COMMON_MONTH") + '</a></li><li class="k-state-default k-view-year" data-name="year"><a role="button" class="k-button">' + I18N.prop("COMMON_YEAR") + '</a></li></ul><ul class="k-reset k-scheduler-navigation"><li class="k-state-default k-header k-nav-prev" data-action="previous"><a role="button" class="k-link"><span class="k-icon k-i-arrow-60-left"></span></a></li><li class="k-state-default k-nav-current"><a role="button" class="k-link"><span class="k-icon k-i-calendar"></span><span class="k-sm-date-format" data-bind="text: formattedShortDate" style="display:block;">2017-04-23 ~ 2017-04-29</span></a></li><li class="k-state-default k-header k-nav-next" data-action="next"><a role="button" class="k-link"><span class="k-icon k-i-arrow-60-right"></span></a></li></ul></div>';

	var msgDialog, msgDialogElem = $("<div/>");
	var confirmDialog, confirmDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");
	confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");

	return {
		MSG : MSG,
		createNewWidget : createNewWidget,
		schedulerHeaderTemplate : schedulerHeaderTemplate,
		schedulerSearchHeaderTemplate: schedulerSearchHeaderTemplate,
		exceptionalDaysHeaderTemplate : exceptionalDaysHeaderTemplate,
		confirmDialog : confirmDialog,
		msgDialog : msgDialog
	};
});
