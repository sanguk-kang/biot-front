/**
 *
 *   <ul>
 *       <li>전력 분배 모니터링에 관한 페이지</li>
 *       <li>시작 날짜와 종료 날짜를 선택해서 전력 분배 그룹들의 전체 값을 조회한다.</li>
 *       <li>그리드 페이지 로서 액셀을 출력 할 수 있다.</li>
 *   </ul>
 *   @module app/energy/samsungsac/distribution
 *   @param {Object} ViewModel- samsungsac ViewModel 객체
 *   @param {Object} Widget- samsungsac Widget 객체
 *   @param {Object} Model- samsungsac Model 객체
 *   @requires app/energy/samsungsac/view-model/distribution-vm
 *   @requires app/energy/samsungsac/common/widget
 *   @requires app/energy/samsungsac/model/distribution-model
 *   @returns {Object} 없음
 */
define("energy/samsungsac/distribution", ["energy/samsungsac/view-model/distribution-vm",
	"energy/samsungsac/common/widget",
	"energy/samsungsac/model/distribution-model"], function(ViewModel, Widget, Model){
	var kendo = window.kendo;
	var Util = window.Util;
	// var moment = window.moment;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();
	var MainWindow = window.MAIN_WINDOW;

	var MainViewModel = ViewModel.MainViewModel;
	var operatingTab = null;
	var datePickerStart, datePickerStartElem = $("#energy-distribution-date-picker-start");
	var datePickerEnd, datePickerEndElem = $("#energy-distribution-date-picker-end");
	var energyDistributionGrid, energyDistributionGridElem = $("#energy-distribution-grid");
	var msgDialog = Widget.msgDialog;

	/**
    *   <ul>
    *   <li> 화면을 구성하는 컴포넌트를 생성 및, 초기화 한다.</li>
    *   </ul>
    *   @function initComponent
    *   @returns {void}
    *   @alias 없음
    *
    */
	var initComponent = function() {
		initDatePicker();
		initGrid({});
	};

	/**
    *   <ul>
    *   <li> 시작일과 종료일을 받아 서버로 애너지 분배 관련 데이터 요청 한다.</li>
    *   </ul>
    *   @function reqGetEnergyDistribution
    *   @param {Object} startDate - 시작일
    *   @param {Object} endDate - 종료일
    *   @returns {jQuery.Deferred} - 제이쿼리 디퍼드 객체
    *   @alias 없음
    *
    */
	var reqGetEnergyDistribution = function(startDate, endDate) {
		var startDateStr = convertDateFormat(startDate);
		var endDateStr =  convertDateFormat(endDate);
		var query = "startDate=" + startDateStr + "&" + "endDate=" + endDateStr;
		return $.ajax({ url: "/energy/distribution/groupusage?" + query});

	};

	/**
    *   <ul>
    *   <li> 시작일과 종료일을 받아 서버로 데이터 요청이후, 응답 데이터를 그리드에 세팅 한다.</li>
    *   </ul>
    *   @function refreshGrid
    *   @param {Object} startDate - 시작일
    *   @param {Object} endDate - 종료일
    *   @returns {void}
    *   @alias 없음
    *
    */
	var refreshGrid = function(startDate, endDate) {
		var ds = null;
		var msg = "";
		Loading.open();
		reqGetEnergyDistribution(startDate, endDate).done(function(data) {
			ds = Model.createDataSource(data);
		}).fail(function(data){
			ds = Model.createDataSource([]);
			msg = Util.parseFailResponse(data);
			if(msg == "") msg = "url: " + this.url + "\n" + "method: " + this.method + "\n" + data.statusText + " : " + data.status;
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function() {
			ds.read();
			energyDistributionGrid.setDataSource(ds);
			energyDistributionGrid.autoFitColumn("dmsGroupName"); //그룹명을 모두 보여주기 위한 메소드 호출.
			//데이터가 없다면 액셀 출력 버튼 disabeld.
			MainViewModel.exportBtn.set("disabled", ds.options.data.length == 0);
			Loading.close();
		});
	};

	/**
	*   <ul>
	*   <li> 데이트 피커의 초기 옵션을 정의 하고, 위젯 생성및 초기화 한다.</li>
	*   <li> "과거 ~ 어제" 까지만 설정 가능(EndDate 는 오늘 이후의 날짜를 선택할 수 없음) </li>
	*   <li> 기본값 = 어제 날짜 </li>
	*   </ul>
	*   @function initDatePicker
	*   @returns {void}
	*   @alias 없음
	*
	*/
	var initDatePicker = function() {
		var nowDate = new Date();
		var yesterDayDate = new Date();
		var startDate, endDate;

		yesterDayDate.setDate(nowDate.getDate() - 1);
		if(nowDate.getDate() !== 1) startDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1, 0, 0, 0); // 현재 날짜가 1일이 아닌 경우, 시작날짜 디폴트 값은 현재 달의 첫날.
		else startDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1, 0, 0, 0); // 현재 날짜가 1일인 경우, 시작날짜 디폴트 값은 전 달의 첫날.
		endDate = yesterDayDate;

		// 기간 선택 컴포넌트 생성및 초기화.
		// 시작일 데이트 피커.
		datePickerStart = datePickerStartElem.kendoCommonDatePicker({
			value: startDate,
			isStart: true
		}).data("kendoCommonDatePicker");
		// 종료일 데이트 피커.
		datePickerEnd = datePickerEndElem.kendoCommonDatePicker({
			value: endDate,
			isEnd: true
		}).data("kendoCommonDatePicker");
		//데이트 피커 '이전 선택 값'을 설정.
		$(datePickerStart).data("prevDate", datePickerStart.value());
		$(datePickerEnd).data("prevDate", datePickerEnd.value());
	};

	/**
	*   <ul>
	*   <li> 데이트 피커에서 셀렉트 하면, 해당 이벤트를 핸들링 한다.</li>
	*   <li> 조건에 따라, 선택된 값을 보정하여 데이트 피커 선택값을 다시 세팅한다.</li>
	*   <li> "과거 ~ 어제" 까지만 설정 가능(EndDate 는 오늘 이후의 날짜를 선택할 수 없음) </li>
	*   </ul>
	*   @function handleSelectDateEvt
	*   @param {Object} e - 이벤트 객체.
	*   @returns {void}
	*   @alias 없음
	*
	*/
	var handleSelectDateEvt = function() {
		var selectStartDate = datePickerStart.value(); //선택 한 값.
		var selectEndDate = datePickerEnd.value();
		var prevStartDate = $(datePickerStart).data("prevDate"); //되돌리기를 위한 선택 이전의 값.
		var prevEndDate = $(datePickerEnd).data("prevDate");
		var nowDate = new Date();
		var yesterDayDate = new Date();

		yesterDayDate.setDate(nowDate.getDate() - 1);
		// 선택한 종료일이 오늘보다 뒤면 자동으로 오늘 날짜로 보정.
		if(selectEndDate > yesterDayDate) {
			selectEndDate = yesterDayDate;
		}
		// 선택한 시작일이 오늘보다 뒤면 자동으로 오늘 날짜로 보정.
		if(selectStartDate > yesterDayDate) {
			selectStartDate = yesterDayDate;
		}

		//선택한 시작일이 종료일보다 늦을 경우,
		if(selectStartDate > selectEndDate) {
			if(selectEndDate != prevEndDate ) { //종료일이 변경된 경우, 이전값으로 되돌린다.
				selectStartDate = prevStartDate;
				selectEndDate = prevEndDate;
			} else if( selectStartDate != prevStartDate) { //시작일이 변경된 경우, 종료일을 시작일로 변경한다.
				selectEndDate = selectStartDate;
			}
		}

		//실제 데이트 피커에 값을 세팅한다.
		datePickerStart.setDate(new Date(selectStartDate.getFullYear(), selectStartDate.getMonth(), selectStartDate.getDate(), 0, 0, 0));
		datePickerEnd.setDate(new Date(selectEndDate.getFullYear(), selectEndDate.getMonth(), selectEndDate.getDate(), 23, 59, 59));
		//이전 값을 세팅해 둔다.
		$(datePickerStart).data("prevDate", datePickerStart.value());
		$(datePickerEnd).data("prevDate", datePickerEnd.value());
	};


	/**
    *   <ul>
    *   <li> 그리드의 초기 옵션을 정의 하고, 위젯 생성및 초기화 한다.</li>
    *   </ul>
    *   @function initGrid
    *   @returns {void}
    *   @alias 없음
    *
    */
	var initGrid = function() {
		var options = ViewModel.gridOptions;
		energyDistributionGrid = energyDistributionGridElem.kendoGrid(options).data("kendoGrid");
	};

	/**
    *   <ul>
    *   <li> 사용자 이벤트 동작을 바인딩 한다.</li>
    *   </ul>
    *   @function attachEvent
    *   @returns {void}
    *   @alias 없음
    *
    */
	var attachEvent = function() {
		MainViewModel.viewBtn.set("click", handleViewBtnEvt);
		MainViewModel.exportBtn.set("click", handleExportBtnEvt);
		//데이트 피커 확인 버튼 이벤트에 핸들러 연결.
		datePickerStart.options.okCallBack = handleSelectDateEvt;
		datePickerEnd.options.okCallBack = handleSelectDateEvt;
		//그리드 액셀 출력시, 이벤트 핸들러 연결.
		energyDistributionGrid.bind("excelExport", handleExcelExportEvt);
		operatingTab.bind("activate", handleActiveTabEvt);
		//메인 사이드바 메뉴의 숨김또는 보여주기 버튼 클릭시, 이벤트 처리.
		$("#main-sidebar-menu").find('.btn-util').on("click", ".btn", function(e) {
			//화면에 맞춰 그리드 다시 그림.
			energyDistributionGrid.refresh();
		});
	};
	/**
    *   <ul>
    *   <li> 상위 탭 이벤트를 핸들링한다.</li>
    *   </ul>
    *   @function handleActiveTabEvt
	*   @param {Object} e - 이벤트 객체.
    *   @returns {void}
    *   @alias 없음
    *
    */
	var handleActiveTabEvt = function(e) {
		var currentTabId = $(e.contentElement).prop("id");
		//에너지 분배 탭이 활성화 되면, 현재 선택된 날짜로 그리드를 리플래쉬 한다.
		if(currentTabId == "operating-common-tab-4") {
			refreshGrid(datePickerStart.value(), datePickerEnd.value());
			MainWindow.disableFloorNav(true); // 에너지 분배 모니터링 탭에 들어서면 FNB를 disable 한다.
		}
	};

	/**
    *   <ul>
    *   <li> 조회 버튼 클릭시 해당 이벤트를 핸들링 한다.</li>
    *   <li> datePicker 위젯으로 부터 현재 선택된 데이트값을 통해 그리드를 리플래쉬 한다.</li>
    *   </ul>
    *   @function handleViewBtnEvt
    *   @param {Object} e - 이벤트 객체.
    *   @returns {void}
    *   @alias 없음
    *
    */
	var handleViewBtnEvt = function(e) {
		var startDate = datePickerStart.value();
		var endDate = datePickerEnd.value();
		refreshGrid(startDate, endDate);
	};

	/**
    *   <ul>
    *   <li> export 버튼 클릭시 해당 이벤트를 핸들링 한다.</li>
    *   <li> 실제 grid 액셀의 export 버튼에 클릭 이벤트를 트리거 한다.</li>
    *   </ul>
    *   @function handleExportBtnEvt
    *   @param {Object} e - 이벤트 객체.
    *   @returns {void}
    *   @alias 없음
    *
    */
	var handleExportBtnEvt = function(e) {
		$(energyDistributionGrid.wrapper).find(".k-grid-excel").trigger("click");
	};

	/**
    *   <ul>
    *   <li>액셀의 export 시, 내보낼 액셀을 커스터마이징 하는 핸들러.</li>
    *   </ul>
    *   @function handleExcelExportEvt
    *   @param {Object} e - 이벤트 객체.
    *   @returns {void}
    *   @alias 없음
    *
    */
	var handleExcelExportEvt = function(e) {
		Model.createExcelContent(datePickerStart.value(), datePickerEnd.value(), e.workbook.sheets[0]);
	};

	var convertDateFormat = function(datePickerValue) {
		var y = datePickerValue.getFullYear();
		var m = datePickerValue.getMonth();
		var d = datePickerValue.getDate();
		m = kendo.toString(m + 1, '00');
		d = kendo.toString(d, '00');
		var formatted = y + '-' + m + '-' + d;
		return formatted;
	};

	/**
    *   <ul>
    *   <li>energy distribution 페이지 진입시 기능을 초기화한다.</li>
    *   <li>화면을 구성하는 컴포너트 초기화 한다.</li>
    *   <li>사용자 이벤트 동작을 바인딩한다.</li>
    *   </ul>
    *   @function init
    *   @param {Object} tab - 페이지 정보.
    *   @returns {void}
    *   @alias 없음
    *
    */
	var init = function(tab) {
		var element = tab.element.find('.energy-distribution-content');
		operatingTab = tab;
		kendo.bind($(element), MainViewModel);
		initComponent();
		attachEvent();
	};

	return {
		init : init
	};
});