/**
 *
 *   <ul>
 *       <li>Exceptional Days 기능</li>
 *       <li>Schedule이 수행되지 않는 공통 예외일을 생성/수정/삭제한다.</li>
 *   </ul>
 *   @module app/operation/schedule/exceptional
 *   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
 *   @param {Object} ViewModel - Exceptional Days View 전환 동작을 위한 View Model
 *   @param {Object} SchedueModel - Exceptional Days 정보 표시를 위한 Model
 *   @param {Object} Common - Schedule 기능 내에서 공통으로 쓰이는 공용 Util
 *   @param {Object} PopupConfig - Schedule 기능 내에서 표시되는 Popup Widget Instance
 *   @requires app/main
 *   @requires app/operation/schedule/viewmodel/exceptional-vm
 *   @requires app/operation/schedule/model
 *   @requires app/operation/schedule/config/schedule-common
 *   @requires app/operation/schedule/exceptional
 *   @requires app/operation/schedule/config/popup-config
 *
 */
define("operation/schedule/exceptional", ["operation/core", "operation/schedule/viewmodel/execptional-vm",
	"operation/schedule/model",
	"operation/schedule/config/schedule-common",
	"operation/schedule/config/popup-config",
	"operation/schedule/widget/exceptional-widget"
], function(CoreModule, ViewModel, ScheduleModel, Common, PopupConfig, exceptionalWidget){

	var moment = window.moment;
	var kendo = window.kendo;
	var globalSettings = window.GlobalSettings;
	var LoadingPanel = window.CommonLoadingPanel;
	var Util = window.Util;
	var I18N = window.I18N;

	var Loading = new LoadingPanel();
	var msgDialog = Common.msgDialog, confirmDialog = Common.confirmDialog;
	var MainViewModel = ViewModel.MainViewModel, Views = ViewModel.Views;

	var Router = new kendo.Router();
	var Layout = new kendo.Layout("<div id='exceptional-main-view-content' class='schedule-main-view-content k-scheduler'></div>");

	var scheduleTab;
	var exceptionalView = $("#exceptional-main-view");

	/**
	 *   <ul>
	 *   <li>예외일 기능을 초기화한다.</li>
	 *   <li>공용 UI Component를 초기화한다.</li>
	 *   <li>예외의 정보 리스트로 View를 업데이트한다.</li>
	 *   <li>사용자 이벤트 동작을 바인딩한다.</li>
	 *   </ul>
	 *   @function init
	 *   @param {kendojQueryWidget}tab - Schedule 공용 Tab UI Widget 인스턴스
	 *   @param {Array}exceptionalDays - 예외일 정보 리스트
	 *   @returns {void}
	 *   @alias module:app/operation/exceptional
	 */
	var init = function(tab, exceptionalDays){
		scheduleTab = tab;
		initComponent();
		var element = scheduleTab.contentElement(1);
		kendo.bind($(element), MainViewModel);
		createView(exceptionalDays);
		attechEvent();
		refreshData();
	};

	var initComponent = function(){
	};
	/**
	 *   <ul>
	 *   <li>Calendar, List View 전환을 위하여 Router 및 View를 초기화한다.</li>
	 *   <li>popup-config 모듈을 통하여 상세 및 More 팝업 인스턴스를 가져온다.</li>
	 *   <li>예외일 List/Calendar View(Widget)을 초기화한다.</li>
	 *   </ul>
	 *   @function createView
	 *   @param {Array} data - 예외일 정보 리스트
	 *   @returns {void}
	 *   @alias module:app/operation/exceptional
	 */
	var createView = function(data){
		// Router.bind("init", routerInit);
		// var foo = { foo: "TESTfooTEST" };
		var exceptionCalendars = $('#exception-calendars');
		var exceptionDayList = $('#exception-day-list');
		Views.main.exceptionCalendarWidget = exceptionCalendars.kendoExecptionalCalenderList(exceptionalWidget.mainView.exceptionCalendars).data("kendoExecptionalCalenderList");
		Views.main.exceptionDayList = exceptionDayList.kendoExceptionDayList(exceptionalWidget.mainView.exceptionDayList).data("kendoExceptionDayList");
		// Views.main.view = new kendo.View($('.schedule-exceptional-content'), { model: foo, evalTemplate: true,
		// 	init: function() {
		// 	} });
		// Views.main.view = new kendo.View($('#exceptional-main-view'));
		// Router.route(Views.main.routeUrl, routerEvt.bind(Router, Views.main.view));
		// Router.start();
	};

	var attechEvent = function(){
		Views.main.exceptionDayList.bind('onSave', apiPostExceptional);
		Views.main.exceptionDayList.bind('onEdit', apiPatchExceptional);
		Views.main.exceptionDayList.bind('onDelete', apiDeleteExceptional);
		Views.main.exceptionDayList.bind('onChecked', refreshCalendar);
	};

	var refreshCalendar = function(e){
		var checkedData = e.checkedData;
		Views.main.exceptionCalendarWidget.setSelectedData(checkedData);
	};

	var apiPostExceptional = function(e){
		var result = e.result;
		if (result) {
			Loading.open();
			result = Util.refineDataFieldsFromModel(result, ScheduleModel.ExceptionalDaysModel);
			$.ajax({
				url : "/schedules/exceptionalDays",
				method : "POST",
				data : result
			}).done(function(){
				// [BIOTFE-1077][DEV][New Schedule] 공통예외일에서, 새 예외일 생성시 예외일 생성 알림 삭제
				// msgDialog.message(I18N.prop("FACILITY_SCHEDULE_CREATE_EXCEPTIONAL_DAY_RESULT"));
				// msgDialog.open();
				Loading.open();
				refreshData();
			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		}
	};

	var apiPatchExceptional = function(e){
		var result = e.result;
		var id;
		if (result) {
			Loading.open();
			id = result.id;
			result = Util.refineDataFieldsFromModel(result, ScheduleModel.ExceptionalDaysModel);
			$.ajax({
				url : "/schedules/exceptionalDays/" + id,
				method : "PATCH",
				data : result
			}).done(function(){
				//[BIOTFE-1078][DEV][New Schedule] 공통예외일에서, 예외일을 선택하여 편집한 후 저장시 알림 발생 삭제
				// msgDialog.message(I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"));
				// msgDialog.open();
				Loading.open();
				refreshData();
			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		}
	};

	/**
	 *   <ul>
	 *   <li>API를 호출하여 선택한 예외일 정보를 삭제하고, View를 업데이트한다.</li>
	 *   </ul>
	 *   @function apiDeleteExceptional
	 *   @param {Array}selectedEvt - 선택한 예외일 정보 리스트
	 *   @returns {void}
	 *   @alias module:app/operation/exceptional
	 */
	var apiDeleteExceptional = function(selectedEvt){
		// var selectedLength = selectedEvt.length;
		var query = '';
		Loading.open();
		query = selectedEvt.map(function(value){return value.id;}).join();

		$.ajax({
			url : "/schedules/exceptionalDays?ids=" + query,
			method : "DELETE"
		}).done(function(){
			refreshData();
			// [BIOTFE-1072][DEV][New Schedule] 스케줄, 폴더, 공통예외일 삭제 후, 삭제 되었다는 알림 발생 제거
			// 상단 이슈로 인해 주석 처리
			// if(selectedLength > 1){
			// 	msgDialog.message(I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_MULTI_RESULT", selectedLength));
			// }else{
			// 	msgDialog.message(I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_RESULT"));
			// }
			// msgDialog.open();
		}).fail(function(){
		}).always(function(){
			Loading.close();
		});
	};

	var apiGetExceptional = function(e){
		$.ajax({
			url : "/schedules/exceptionalDays"
		}).done(function(data){
			var dataSource = ScheduleModel.createExceptionalDs(data);
			var ds = new kendo.data.DataSource({
				data : dataSource
			});
			ds.read();
			// var oldDs = Views.main.exceptionDayList.dataSource;
			// var filters = oldDs.filter();
			Views.main.exceptionCalendarWidget.setDataSource(ds);
			Views.main.exceptionDayList.setDataSource(ds);
			// ds.filter(filters);
			ds.sort({field : "name", dir : "asc"});
		}).fail(function(){
		}).always(function(){
			Loading.close();
		});
	};

	var refreshData = function(){
		apiGetExceptional();
		Views.main.exceptionCalendarWidget.resetSelectedExecptional();
	};

	// var routerInit = function(){
	// 	Layout.render(exceptionalView);
	// };

	// var routerEvt = function(view){
	// 	Layout.showIn("#exceptional-main-view-content", view);
	// };

	return {
		init : init
	};
});

//For Debug
//# sourceURL=facility-exceptional.js
