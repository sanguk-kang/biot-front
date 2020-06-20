/**
 *
 *   <ul>
 *       <li>Schedule 생성 기능</li>
 *       <li>제어기기/날짜/제어요소들을 선택하여 Schedule을 생성한다.</li>
 *       <li>Schedule을 편집한다.</li>
 *   </ul>
 *   @module app/operation/schedule/create
 *   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
 *   @param {Object} ViewModel - 스케쥴 생성 뷰 제어를 위한 View Model
 *   @param {Object} ScheduleModel - 스케쥴 정보 및 리스트 생성을 위한 Model
 *   @param {Object} DeviceModel - 기기 정보 Model
 *   @param {Object} DeviceTemplate - 기기 정보 표시를 위한 Template
 *   @param {Object} DeviceUtil - 기기 정보를 얻기 위한 DeviceUtil
 *   @param {Object} Common - Schedule 기능 내에서 공통으로 쓰이는 공용 Util
 *   @param {Object} Widget - Schedule 기능 내에서 쓰이는 Dialog 등의 Widget
 *   @param {Object} GroupModel - 그룹 정보 및 리스트 생성을 위한 Model
 *   @requires app/main
 *   @requires app/operation/schedule/viewmodel/create-vm
 *   @requires app/operation/schedule/model
 *   @requires app/device/common/device-model
 *   @requires app/device/common/device-template
 *   @requires app/device/common/device-util
 *   @requires operation/schedule/config/schedule-commo
 *   @requires operation/schedule/config/popup-config
 *   @requires operation/group/config/group-model
 *
 */
define("operation/schedule/create", ["operation/core", "operation/schedule/viewmodel/create-vm",
	"operation/schedule/model", "device/common/device-model",
	"device/common/device-template", "device/common/device-util",
	"operation/schedule/config/schedule-common",
	"operation/schedule/config/popup-config",
	"operation/group/config/group-model"],
function(CoreModule, ViewModel, ScheduleModel, DeviceModel, DeviceTemplate,
				 DeviceUtil, Common, PopupConfig, GroupModel){

	"use strict";
	//decide to destroy or keep view

	var kendo = window.kendo;
	var MainWindow = window.MAIN_WINDOW;
	var LoadingPanel = window.CommonLoadingPanel;
	var I18N = window.I18N;
	var Loading = new LoadingPanel();
	var scheduleCreateTab, scheduleCreateTabElem = $("#schedule-create-tab");
	var loadedScheduleData;
	var loadPopup, selectFolderPopup;

	var confirmDialog = Common.confirmDialog;
	var msgDialog = Common.msgDialog;
	var isInitialized = false;
	var ACTION_ENUM = { LOAD : 0, SAVE : 1, CREATE : 2};
	var operation_default_values = ViewModel.operation_default_values;

	/*
		View Model
	 */
	var Views = ViewModel.Views, MainViewModel = ViewModel.MainViewModel,
		OperationViewModel = ViewModel.OperationViewModel;

	var isEdit = false;
	/**
	 *   <ul>
	 *   <li>Schedule 생성 기능을 초기화한다.</li>
	 *   <li>공용 UI Component를 초기화한다.</li>
	 *   <li>현재 건물/층의 기기 정보를 API를 호출하여 서버로부터 받아오고, View를 업데이트한다.</li>
	 *   <li>사용자 이벤트 동작을 바인딩한다.</li>
	 *   </ul>
	 *   @function init
	 *   @param {Object} scheduleData - 스케쥴 편집 시, 전달되는 스케쥴 정보 객체
	 *   @param {Boolean} isLoad - Load Popup으로 스케쥴을 불러오는지에 대한 여부
	 *   @returns {void}
	 *   @alias module:app/operation/schedule/create
	 *
	 */
	var init = function(scheduleData, isLoad){
		Loading.open();
		MainWindow.disableFloorNav(true);
		scheduleCreateTab = scheduleCreateTabElem.data("kendoCommonTabStrip");
		OperationViewModel.init();
		console.log('init');
		//Edit
		if(scheduleData && !isLoad){
			isEdit = true;
			loadedScheduleData = scheduleData;
			scheduleCreateTabElem.find("a.text").text(Common.MSG.TXT_EDIT_SCHEDULE);
		//Create
		}else{
			isEdit = false;
			scheduleCreateTabElem.find("a.text").text(Common.MSG.TXT_CREATE_SCHEDULE);
			if(isLoad){
				loadedScheduleData = scheduleData;
				console.log(loadedScheduleData);
			}else{
				loadedScheduleData = ScheduleModel.createModel();
				console.log(loadedScheduleData);
			}
		}

		var curFloor = MainWindow.getCurrentFloor();

		if(isInitialized){
			console.log('isInitialized');
			scheduleCreateTabElem.find('.setting-content-main-container').eq(0).scrollTop(0);
		}else{              //First Execution. Initial View.
			var element = scheduleCreateTab.contentElement(0);
			kendo.bind($(element), MainViewModel);

			createView();
			attachEvent();

			isInitialized = true;
			// typeOrderingList = getTypeOrderingList();
		}
		applyScheduleForViewModel(loadedScheduleData);
		Loading.close();
	};

	var createView = function() {
		// viewmodel 및 관련 위젯 초기화.
		MainViewModel.dataFields.id.init();
		MainViewModel.dataFields.folder.init();
		MainViewModel.dataFields.scheduleName.init();
		MainViewModel.dataFields.devices.init();
		MainViewModel.dataFields.period.init();
		MainViewModel.dataFields.timeAndOperationSettings.init();
		MainViewModel.dataFields.exceptionDayList.init();
		MainViewModel.dataFields.description.init();

		loadPopup = PopupConfig.getLoadPopup();
		selectFolderPopup = PopupConfig.getSelectFolderPopup();
	};

	/**
	 *   <ul>
	 *   <li>Schedule 생성 기능의 이벤트를 바인딩한다.</li>
	 *   <li>필터 드롭다운리스트 동작의 이벤트를 바인딩 한다.</li>
	 *   <li>Step 및 각 버튼들 및 리스트 전환 등의 이벤트를 바인딩한다.</li>
	 *   </ul>
	 *   @function attachEvent
	 *   @returns {void}
	 *   @alias module:app/operation/schedule/create
	 *
	 */
	var attachEvent = function(){
		console.log('attachEvent::call');
		OperationViewModel.bind("change", function(e){
			if(e.field &&
				(e.field == "operation.indoor.temperature.min"
				|| e.field == "operation.indoor.temperature.max"
				|| e.field == "operation.indoor.waterTemp.min"
				|| e.field == "operation.indoor.waterTemp.max")){
				this.setTempMinMax(e, $("#indoor-temp"), $("#indoor-water-temp"));
			}

			this.checkActive();

			// 시간 운영 설정, 시간 멀티 선택시, 같지 않는 체크 박스 표시한경우, 한번더 체크 하는 경우, 해당 값 false 로 변경.
			// indoor
			if(e.field && e.field == "operation.indoor.power.checked") {
				if(this.operation.indoor.power.get('checkedNotEqualed')) {
					this.operation.indoor.power.set('checked', true);
					this.operation.indoor.power.set("active", true);
				}
				this.operation.indoor.power.set('checkedNotEqualed', false);
			}
			if(e.field && e.field == "operation.indoor.power.active") {
				if(this.operation.indoor.power.get('activeNotEqualed')) {
					this.operation.indoor.power.set('checkedNotEqualed', false);
					this.operation.indoor.power.set('checked', true);
					this.operation.indoor.power.set("activeNotEqualed", true);
					this.operation.indoor.power.set("active", true);
				}
				this.operation.indoor.power.set('activeNotEqualed', false);
			}
			if(e.field && e.field == "operation.indoor.operation.checked") {
				if(this.operation.indoor.operation.get('checkedNotEqualed')) {
					this.operation.indoor.operation.set('checkedNotEqualed', false);
					this.operation.indoor.temperature.set('checkedNotEqualed', false);
					this.operation.indoor.temperature.set('checked', false);
					this.operation.indoor.waterTemp.set('checkedNotEqualed', false);
					this.operation.indoor.waterTemp.set('checked', false);

					this.operation.indoor.power.set('checkedNotEqualed', false);
					this.operation.indoor.power.set('checked', false);
					this.operation.indoor.power.set('checked', true);
					this.operation.indoor.power.set('activeNotEqualed', false);
					this.operation.indoor.power.set("active", false);
					this.operation.indoor.power.set("active", true);

					this.operation.indoor.operation.set('checked', false);
					this.operation.indoor.operation.set('checked', true);
					this.operation.indoor.operation.mode[0].set('active', true);
				}
			}
			if(e.field && e.field == "operation.indoor.operation.mode") {
				if(this.operation.indoor.operation.get('activeNotEqualed')) {
					this.operation.indoor.power.set('checkedNotEqualed', false);
					this.operation.indoor.power.set('checked', false);
					this.operation.indoor.power.set('checked', true);
					this.operation.indoor.power.set('activeNotEqualed', false);
					this.operation.indoor.power.set("active", false);
					this.operation.indoor.power.set("active", true);
					this.operation.indoor.operation.set('activeNotEqualed', false);
					this.operation.indoor.operation.set('active', false);
					this.operation.indoor.operation.set('active', true);
					this.operation.indoor.operation.set('checkedNotEqualed', false);
					this.operation.indoor.operation.set('checked', false);
					this.operation.indoor.operation.set('checked', true);
					// notEqualed mode 인 경우, mode 를 모두 active:false 하는 동작 분기 처리.
					if(e.items) {
						var hasActiveMode = false;
						e.items.forEach(function(item){
							if(item.active) hasActiveMode = true;
						});
						if(hasActiveMode) {
							this.operation.indoor.temperature.set('checkedNotEqualed', false);
							this.operation.indoor.temperature.set('checked', false);
							this.operation.indoor.waterTemp.set('checkedNotEqualed', false);
							this.operation.indoor.waterTemp.set('checked', false);
						}
					}

				}
			}
			if(e.field && e.field == "operation.indoor.temperature.checked") {
				if(this.operation.indoor.temperature.get('checkedNotEqualed')) {
					this.operation.indoor.temperature.set('checkedNotEqualed', false);
					this.operation.indoor.temperature.set('checked', true);
					this.operation.indoor.power.set("checkedNotEqualed", false);
					this.operation.indoor.power.set("checked", true);
					this.operation.indoor.power.set("activeNotEqualed", false);
					this.operation.indoor.power.set("active", true);
					this.operation.indoor.operation.set("checkedNotEqualed", false);
					this.operation.indoor.operation.set('checked', false);
					this.operation.indoor.operation.set("checked", true);
					this.operation.indoor.operation.set('activeNotEqualed', false);
					if(this.operation.indoor.operation.activeNotEqualed)
					  this.operation.indoor.operation.mode[0].set("active", true);
				}
			}
			if(e.field && e.field == "operation.indoor.waterTemp.checked") {
				if(this.operation.indoor.waterTemp.get('checkedNotEqualed')) {
					this.operation.indoor.waterTemp.set('checkedNotEqualed', false);
					this.operation.indoor.waterTemp.set('checked', true);
					this.operation.indoor.power.set("checkedNotEqualed", false);
					this.operation.indoor.power.set("checked", true);
					this.operation.indoor.power.set("activeNotEqualed", false);
					this.operation.indoor.power.set("active", true);
					this.operation.indoor.operation.set("checkedNotEqualed", false);
					this.operation.indoor.operation.set('checked', false);
					this.operation.indoor.operation.set("checked", true);
					this.operation.indoor.operation.set('activeNotEqualed', false);
					if(this.operation.indoor.operation.activeNotEqualed)
					  this.operation.indoor.operation.mode[0].set("active", true);
				}
			}

			// ventilator
			if(e.field && e.field == "operation.ventilator.power.checked") {
				if(this.operation.ventilator.power.get('checkedNotEqualed')) {
					this.operation.ventilator.power.set('checked', true);
					this.operation.ventilator.power.set('active', true);
				}
				this.operation.ventilator.power.set('checkedNotEqualed', false);
			}
			if(e.field && e.field == "operation.ventilator.power.active") {
				if(this.operation.ventilator.power.get('activeNotEqualed')) {
					this.operation.ventilator.power.set('activeNotEqualed', false);
					this.operation.ventilator.power.set('checkedNotEqualed', false);
					this.operation.ventilator.power.set('checked', true);
					this.operation.ventilator.power.set("activeNotEqualed", true);
					this.operation.ventilator.power.set("active", true);
				}
				this.operation.ventilator.power.set('activeNotEqualed', false);
			}
			if(e.field && e.field == "operation.ventilator.operation.checked") {
				if(this.operation.ventilator.operation.get('checkedNotEqualed')) {
					this.operation.ventilator.operation.set('checkedNotEqualed', false);

					this.operation.ventilator.power.set('checkedNotEqualed', false);
					this.operation.ventilator.power.set('checked', false);
					this.operation.ventilator.power.set('checked', true);
					this.operation.ventilator.power.set('activeNotEqualed', false);
					this.operation.ventilator.power.set("active", false);
					this.operation.ventilator.power.set("active", true);

					this.operation.ventilator.operation.set('checked', false);
					this.operation.ventilator.operation.set('checked', true);
					this.operation.ventilator.operation.mode[0].set('active', true);
				}
			}
			if(e.field && e.field == "operation.ventilator.operation.mode") {
				if(this.operation.ventilator.operation.get('activeNotEqualed')) {
					this.operation.ventilator.power.set('checkedNotEqualed', false);
					this.operation.ventilator.power.set('checked', false);
					this.operation.ventilator.power.set('checked', true);
					this.operation.ventilator.power.set('activeNotEqualed', false);
					this.operation.ventilator.power.set("active", false);
					this.operation.ventilator.power.set("active", true);
					this.operation.ventilator.operation.set('activeNotEqualed', false);
					this.operation.ventilator.operation.set('active', false);
					this.operation.ventilator.operation.set('active', true);
					this.operation.ventilator.operation.set('checkedNotEqualed', false);
					this.operation.ventilator.operation.set('checked', false);
					this.operation.ventilator.operation.set('checked', true);
				}
			}

			// dhw
			if(e.field && e.field == "operation.dhw.power.checked") {
				if(this.operation.dhw.power.get('checkedNotEqualed')) {
					this.operation.dhw.power.set('checked', true);
					this.operation.dhw.power.set('active', true);
				}
				this.operation.dhw.power.set('checkedNotEqualed', false);
			}
			if(e.field && e.field == "operation.dhw.power.active") {
				if(this.operation.dhw.power.get('activeNotEqualed')) {
					this.operation.dhw.power.set('activeNotEqualed', false);
					this.operation.dhw.power.set('checkedNotEqualed', false);
					this.operation.dhw.power.set('checked', true);
					this.operation.dhw.power.set("activeNotEqualed", true);
					this.operation.dhw.power.set("active", true);
				}
				this.operation.dhw.power.set('activeNotEqualed', false);
			}
			if(e.field && e.field == "operation.dhw.operation.checked") {
				if(this.operation.dhw.operation.get('checkedNotEqualed')) {
					this.operation.dhw.operation.set('checkedNotEqualed', false);
					this.operation.dhw.temperature.set('checkedNotEqualed', false);
					this.operation.dhw.temperature.set('checked', false);

					this.operation.dhw.power.set('checkedNotEqualed', false);
					this.operation.dhw.power.set('checked', false);
					this.operation.dhw.power.set('checked', true);
					this.operation.dhw.power.set('activeNotEqualed', false);
					this.operation.dhw.power.set("active", false);
					this.operation.dhw.power.set("active", true);

					this.operation.dhw.operation.set('checked', false);
					this.operation.dhw.operation.set('checked', true);
					this.operation.dhw.operation.mode[1].set('active', true);
				}
			}
			if(e.field && e.field == "operation.dhw.operation.mode") {
				if(this.operation.dhw.operation.get('activeNotEqualed')) {
					this.operation.dhw.power.set('checkedNotEqualed', false);
					this.operation.dhw.power.set('checked', false);
					this.operation.dhw.power.set('checked', true);
					this.operation.dhw.power.set('activeNotEqualed', false);
					this.operation.dhw.power.set("active", false);
					this.operation.dhw.power.set("active", true);
					this.operation.dhw.operation.set('activeNotEqualed', false);
					this.operation.dhw.operation.set('active', false);
					this.operation.dhw.operation.set('active', true);
					this.operation.dhw.operation.set('checkedNotEqualed', false);
					this.operation.dhw.operation.set('checked', false);
					this.operation.dhw.operation.set('checked', true);
					// notEqualed mode 인 경우, mode 를 모두 active:false 하는 동작 분기 처리.
					if(e.items) {
						var hasActiveMode = false;
						e.items.forEach(function(item){
							if(item.active) hasActiveMode = true;
						});
						if(hasActiveMode) {
							this.operation.dhw.temperature.set('checkedNotEqualed', false);
							this.operation.dhw.temperature.set('checked', false);
						}
					}

				}
			}
			if(e.field && e.field == "operation.dhw.temperature.checked") {
				if(this.operation.dhw.temperature.get('checkedNotEqualed')) {
					this.operation.dhw.temperature.set('checkedNotEqualed', false);
					this.operation.dhw.temperature.set('checked', true);
					this.operation.dhw.power.set("checkedNotEqualed", false);
					this.operation.dhw.power.set("checked", true);
					this.operation.dhw.power.set("activeNotEqualed", false);
					this.operation.dhw.power.set("active", true);
					this.operation.dhw.operation.set("checkedNotEqualed", false);
					this.operation.dhw.operation.set('checked', false);
					this.operation.dhw.operation.set("checked", true);
					this.operation.dhw.operation.set('activeNotEqualed', false);
					if(this.operation.dhw.operation.activeNotEqualed)
					  this.operation.dhw.operation.mode[0].set("active", true);
				}
			}

			// remoteControl
			if(e.field && e.field == "operation.remoteControl.checked") {
				if(this.operation.remoteControl.get('checkedNotEqualed')) {
					this.operation.remoteControl.set('checkedNotEqualed', false);
					this.operation.remoteControl.set('checked', true);
					this.operation.remoteControl.control[0].set("active", true);
				}
			}

			if(e.field && e.field == "operation.remoteControl.control") {
				if(this.operation.remoteControl.get('activeNotEqualed')) {
					this.operation.remoteControl.set('activeNotEqualed', false);
					this.operation.remoteControl.set('checkedNotEqualed', false);
					this.operation.remoteControl.set('checked', false);
					this.operation.remoteControl.set('checked', true);
				}
			}

			// lightingConrol
			if(e.field && e.field == "operation.light.power.checked") {
				if(this.operation.light.power.get('checkedNotEqualed')) {
					this.operation.light.power.set('checked', true);
					this.operation.light.power.set('active', true);
				}
				this.operation.light.power.set('checkedNotEqualed', false);
			}
			if(e.field && e.field == "operation.light.power.active") {
				if(this.operation.light.power.get('activeNotEqualed')) {
					this.operation.light.power.set('checkedNotEqualed', false);
					this.operation.light.power.set('checked', true);
					this.operation.light.power.set("activeNotEqualed", true);
					this.operation.light.power.set("active", true);
				}
				this.operation.light.power.set('activeNotEqualed', false);
			}

			if(e.field && e.field == "operation.light.checked") {
				if(this.operation.light.get('checkedNotEqualed')) {
					this.operation.light.set('checked', true);
					this.operation.light.set("value", 50);
				}
				this.operation.light.set('checkedNotEqualed', false);
			}
			if(e.field && e.field == "operation.light.value") {
				if(this.operation.light.get('valueNotEqualed')) {
					this.operation.light.set('valueNotEqualed', false);
					this.operation.light.set('checkedNotEqualed', false);
					this.operation.light.set('checked', false);
					this.operation.light.set('checked', true);
				}
			}

			// point
			if(e.field && e.field == "operation.point.aoav.checked") {
				if(this.operation.point.aoav.get('checkedNotEqualed')) {
					this.operation.point.aoav.set('checked', true);
				}
				this.operation.point.aoav.set('checkedNotEqualed', false);
			}
			if(e.field && e.field == "operation.point.dodv.checked") {
				if(this.operation.point.dodv.get('checkedNotEqualed')) {
					this.operation.point.dodv.set('checked', true);
					this.operation.point.dodv.set("active", true);
				}
				this.operation.point.dodv.set('checkedNotEqualed', false);
			}
			if(e.field && e.field == "operation.point.dodv.active") {
				if(this.operation.point.dodv.get('activeNotEqualed')) {
					this.operation.point.dodv.set('checkedNotEqualed', false);
					this.operation.point.dodv.set('checked', false);
					this.operation.point.dodv.set('checked', true);
					this.operation.point.dodv.set('activeNotEqualed', false);
					this.operation.point.dodv.set('active', true);
				}
			}

			// pre
			if(e.field && e.field == "operation.pre.checked") {
				if(this.operation.pre.get('checkedNotEqualed')) {
					this.operation.pre.set('checked', true);
					this.operation.pre.set('radioChecked', "PreCooling");
					this.operation.pre.cool.set('value', operation_default_values.PRE_DESIRED);
					this.operation.pre.cool.set('disabled', false);
					this.operation.pre.heat.set('value', operation_default_values.PRE_DESIRED);
					this.operation.pre.heat.set('disabled', true);
				}
				this.operation.pre.set('checkedNotEqualed', false);
			}

			if(e.field && e.field == "operation.pre.radioChecked") {
				var radioCheckedValue = this.operation.pre.get('radioChecked');
				if(this.operation.pre.get('radioCheckedNotEqualed') && this.operation.pre.get('radioChecked')) {
					this.operation.pre.set('radioCheckedNotEqualed', false);
					this.operation.pre.set('checkedNotEqualed', false);
					this.operation.pre.set('radioChecked', radioCheckedValue);
					if(radioCheckedValue == 'PreCooling') {
						this.operation.pre.cool.set('disabled', false);
					} else {
						this.operation.pre.heat.set('disabled', true);
					}
				} else if(this.operation.pre.get('checkedNotEqualed')) {
					this.operation.pre.set('checkedNotEqualed', false);
					this.operation.pre.set('checked', false);
					this.operation.pre.set('checked', true);
					this.operation.pre.set('radioChecked', radioCheckedValue);
					this.operation.pre.cool.set('disabled', radioCheckedValue !== 'PreCooling');
					this.operation.pre.heat.set('disabled', radioCheckedValue !== 'PreHeating');
				}
			}

		});

		MainViewModel.actions[ACTION_ENUM.LOAD].options.set("click", function() {
			Loading.open();
			$.ajax({
				url : "/schedules"
			}).done(function(data){
				// 스케줄 변경된 목데이터.
				data.sort(compareUpdatedDate);
				var dataSource = ScheduleModel.createDataSource(data, []);
				loadPopup.setDataSource(dataSource);
				loadPopup.open();
			}).always(function(){
				Loading.close();
			});
		});
		MainViewModel.actions[ACTION_ENUM.SAVE].options.set("click", function() {
			var result = getDataFromMainViewModel();
			var name = result.name, devices = result.devices, configurations = result.configurations;
			var msg = "";
			// 기간 이외의 선택 기기 리스트, 시간 운영 설정 값이 미설 정 상태라면 팝업 표시
			if((typeof name != 'undefined' && name.length == 0) || devices === null || devices.length == 0 || configurations === null || configurations.length == 0 ) {
				msg = "- ";
				if(typeof name != 'undefined' && name.length == 0) {
					msg += I18N.prop("FACILITY_SCHEDULE_SCHEDULE_NAME") + " / ";
					MainViewModel.dataFields.scheduleName.set('value', "");
				}
				if(devices === null || devices.length == 0) msg += I18N.prop("FACILITY_SCHEDULE_DEVICE") + " / ";
				if(configurations === null || configurations.length == 0) msg += I18N.prop("FACILITY_SCHEDULE_TIME_AND_OPERATION_SETTINGS") + " / ";
				msg = msg.substring(0, msg.length - 3);
				msg = I18N.prop("FACILITY_SCHEDULE_CREATE_NOT_COMPLETED") + "\n" + msg;

				msgDialog.message(msg);
				msgDialog.open();
				return;
			}

			// 설정한 예외일 중에, 스케줄 기간에 벗어난 값이 있는 경우, 알람 팝업 표시
			if(hasExceptionDateOutOfSchedulePeriod(result.startDate, result.endDate, result.exceptionalDays)) {
				msg = I18N.prop("FACILITY_SCHEDULE_CREATE_HAS_EXCEPTION_DATE_OUT_OF_SCHEDULE_PERIOD");
				msgDialog.message(msg);
				msgDialog.open();
				return;
			}

			if(!isEdit) {
				// 폴더 설정 팝업 오픈 (폴더가 없는 경우 바로 저장.)
				Loading.open;
				$.ajax({
					url : "/schedules/lists"
				}).done(function(data){
					var folderData = ScheduleModel.parseFolderModel(data);
					// 폴더가 없는 경우만 바로 저장.
					Loading.close();
					if(folderData.length > 0) {
						// 폴더 이름 순으로 정렬.
						folderData.sort(compareName);
						// No folder 아이템 추가. (id: null)
						folderData.unshift({
							id: null,
							name: I18N.prop("FACILITY_SCHEDULE_FOLDER_NO_FOLDER"),
							selected: true,
							checked: true
						});
						// 폴더 디폴트 선택 설정 (이전에 선택한 폴더가 있는 경우, 이전 폴더 선택 / 기존에 선택한 폴더가 없는 경우, no folder)
						if(typeof result.schedules_folders_id !== 'undefined') {
							folderData.forEach(function(item){
								item.selected = item.id === result.schedules_folders_id;
								item.checked = item.id === result.schedules_folders_id;
							});
						}
						// 새 스케줄 생성인 경우만 폴더 선택 팝업 오픈
						selectFolderPopup.setDataSource(folderData);
						selectFolderPopup.open();
					}else {
						requestPostSchedule(result);
					}
				}).always(function(){
				});
			} else {
				// 기존 스케줄 편집인 경우, 바로 patch 요청
				requestPatchSchedule(MainViewModel.dataFields.id.get('value'), result);
			}
		});

		// 스케줄 불러오기 팝업 관련 이벤트 바인딩
		loadPopup.bind("onChecked", function(e){
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.SELECT, { disabled : false });
		});
		loadPopup.bind("onSelect", function(e){
			var result = e.result;
			confirmDialog.message(I18N.prop("FACILITY_SCHEDULE_CREATE_LOAD_SCHEDULE_CONFIRM_MSG"));
			confirmDialog.setConfirmActions({
				yes: function () {
					loadPopup.close();
					init(result, true);
				}
			});
			confirmDialog.open();
		});
		// 폴더 선택 팝업 관련 이벤트 바인딩.
		selectFolderPopup.bind("onChecked", function(e){
			var BTN = e.sender.BTN;
			e.sender.setActions(BTN.SELECT, { disabled : false });
		});
		selectFolderPopup.bind("onSelect", function(e) {
			var result,  schedules_folders_id = e.result.id;
			// 폴더 선택값 확인.
			MainViewModel.dataFields.folder.set("value", schedules_folders_id);
			result = getDataFromMainViewModel();
			if(!isEdit) requestPostSchedule(result);
			else requestPatchSchedule(MainViewModel.dataFields.id.get('value'), result);
			selectFolderPopup.close();
		});
	};

	var getDataFromMainViewModel = function() {
		var mainViewModel = MainViewModel;
		var moment = window.moment;
		var schedules_folders_id = mainViewModel.dataFields.folder.get('value');
		var name = mainViewModel.dataFields.scheduleName.get('value');
		var type = 'Schedule';
		var level = 0;
		var activated = true;
		var startDate = mainViewModel.dataFields.period.get('value').startDate;
		var endDate = mainViewModel.dataFields.period.get('value').endDate;
		var exceptionalDays = mainViewModel.dataFields.exceptionDayList.get('value');
		var devices = mainViewModel.dataFields.devices.get('value');
		var configurations = mainViewModel.dataFields.timeAndOperationSettings.get('value');
		var description = mainViewModel.dataFields.description.get('value');

		// 스케줄 이름, 설명 입력값에 시작/끝 부분 공백 제거.
		name = name.trim();
		description = typeof description !== 'undefined' ? description.trim() : "";

		// 디바이스 정보 가공
		var deviceIds = [];
		devices.forEach(function(device){
			var id = device.id ? device.id : device.dms_devices_id;
			deviceIds.push({dms_devices_id: id});
		});
		devices = deviceIds;

		var result = {
			name: name,
			type: type,
			level: level,
			schedules_folders_id: schedules_folders_id,
			activated: activated,
			startDate: startDate,
			endDate: endDate,
			exceptionalDays: [],
			devices: [],
			configurations: [],
			description: description
		};

		// No 폴더 선택시 (메인), 폴더 아이디 키삭제
		if(result.schedules_folders_id === null || typeof result.schedules_folders_id == 'undefined') delete result.schedules_folders_id;

		// 스케줄 시작/종료일 값이 object 인 경우, 문자열로 변환.
		if(typeof result.startDate == 'object') result.startDate = moment(result.startDate).format('YYYY-MM-DD');
		if(typeof result.endDate == 'object') result.endDate = moment(result.endDate).format('YYYY-MM-DD');

		// 예외일 데이터 가공
		if(typeof exceptionalDays == 'undefined') exceptionalDays = [];
		exceptionalDays.forEach(function(exceptionDay){
			var newExceptionDay = {
				startDate: moment(exceptionDay.startDate).format('YYYY-MM-DD'),
				endDate: moment(exceptionDay.endDate).format('YYYY-MM-DD'),
				name: exceptionDay.name,
				description: exceptionDay.description
			};
			// 에외일에 설명이 없는 경우, 키삭제
			if(typeof newExceptionDay.description === 'undefined' || newExceptionDay.description === "") delete newExceptionDay.description;
			result.exceptionalDays.push(newExceptionDay);
		});

		devices.forEach(function(device){
			result.devices.push({dms_devices_id: device.dms_devices_id});
		});

		configurations.forEach(function(configuration){
			var configurationJSON = configuration.toJSON();
			var newConfiguration = {
				daysOfWeek: configurationJSON.daysOfWeek,
				executionTimes: configurationJSON.executionTimes,
				deviceTypes: configurationJSON.deviceTypes
			};
			// configuration 에 알고리즘이 없는 경우, 키삭제
			if (typeof configuration.algorithm !== 'undefined') newConfiguration.algorithm = configuration.algorithm.toJSON();
			result.configurations.push(newConfiguration);
		});

		// 편집인 경우, 이전과 이름이 같아면, 키에서 제거.
		if(isEdit && loadedScheduleData.name === result.name) delete result.name;

		return result;
	};

	var closeCreateTab = function() {
		var scheduleTab = $("#schedule-common-tab").data("kendoCommonTabStrip");
		MainWindow.disableFloorNav(false);
		scheduleCreateTab.hide();
		scheduleTab.show();
		scheduleTab.activateTab($('.main-tab').eq(0));

		loadPopup.close();
		selectFolderPopup.close();
	};

	var requestPostSchedule = function(data) {
		Loading.open();
		console.log(data);
		$.ajax({
			url: "/schedules",
			method: "POST",
			data: data
		}).done(function(res){
			// 정상 저장 이후 리스트뷰 화면으로 이동.
			closeCreateTab();
		}).fail(function(error){
			// 스캐줄 이름 중복등의 문제로 에러가 발생하는 경우, 정의된 에러 메시지 출력.
			var msg = error.responseJSON.message;
			msg = msg === "Schedule with the same name already exist" ? I18N.prop("FACILITY_SCHEDULE_DUPlICATED_SCHEDULE_NAME_EXIST") : msg;
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			Loading.close();
		});
	};

	var requestPatchSchedule = function(scheduleId, data) {
		Loading.open();
		console.log(data);
		$.ajax({
			url: "/schedules/" + scheduleId,
			method: "PATCH",
			data: data
		}).done(function(res) {
			// 정상 저장 이후 리스트뷰 화면으로 이동.
			closeCreateTab();
		}).fail(function(error){
			// 스캐줄 이름 중복등의 문제로 에러가 발생하는 경우, 정의된 에러 메시지 출력.
			var msg = error.responseJSON.message;
			msg = msg === "Schedule with the same name already exist" ? I18N.prop("FACILITY_SCHEDULE_DUPlICATED_SCHEDULE_NAME_EXIST") : msg;
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			Loading.close();
		});
	};

	var hasExceptionDateOutOfSchedulePeriod = function(scheduleStartDate, scheduleEndDate, exceptionalDays) {
		var result = false;
		var scheduleStartDateTime = new Date(scheduleStartDate).getTime();
		var schedulEndDateTime = new Date(scheduleEndDate).getTime();
		exceptionalDays.forEach(function(exceptionalDay){
			var startDateTime = new Date(exceptionalDay.startDate).getTime();
			var endDateTime = new Date(exceptionalDay.endDate).getTime();
			if(!(scheduleStartDateTime <= startDateTime && endDateTime <= schedulEndDateTime)) result = true;
		});
		return result;
	};

	/**
	 *   <ul>
	 *   <li>현재 생성/수정할 Schedule 정보를 현재 날짜/시간, 생성 View에 반영되도록 View를 업데이트한다.</li>
	 *   </ul>
	 *   @function applyScheduleForViewModel
	 *   @param {Object} loadedSchedule - 생성/수정할 Schedule 정보 객체
	 *   @returns {void}
	 *   @alias module:app/operation/schedule/create
	 */
	var applyScheduleForViewModel = function(loadedSchedule){
		var startDatePickerWidget = MainViewModel.dataFields.period.startDatePicker.widget;
		var endDatePickerWidget = MainViewModel.dataFields.period.endDatePicker.widget;

		if(loadedSchedule.title && !loadedSchedule.name) loadedSchedule.name = loadedSchedule.title;
		if(loadedSchedule.end) loadedSchedule.endDate = loadedSchedule.end;
		if(loadedSchedule.start) loadedSchedule.startDate = loadedSchedule.start;
		if(typeof loadedSchedule.exceptionalDays == 'undefined') loadedSchedule.exceptionalDays = [];

		MainViewModel.dataFields.id.set("value", loadedSchedule.id);
		MainViewModel.dataFields.folder.set("value", loadedSchedule.schedules_folders_id);
		MainViewModel.dataFields.scheduleName.set("value", loadedSchedule.name);
		MainViewModel.dataFields.devices.set("value", loadedSchedule.devices);
		MainViewModel.dataFields.period.set("value", {startDate: loadedSchedule.startDate, endDate: loadedSchedule.endDate });
		MainViewModel.dataFields.timeAndOperationSettings.set("value", loadedSchedule.configurations);
		MainViewModel.dataFields.exceptionDayList.set("value", loadedSchedule.exceptionalDays);
		MainViewModel.dataFields.description.set("value", loadedSchedule.description);

		// 새 스케줄 생성시, 기간설정 값은, 보이는 데이트피커 값 기본 설정은 오늘 ~ 한달이후(기한 설정) 이면서 기본 타입 값인 무기한 설정하기 위함.
		if(!isEdit) {
			MainViewModel.dataFields.period.set('checked', 'indefinitePeriod');
			startDatePickerWidget.enable(false);
			endDatePickerWidget.enable(false);
		}
		MainViewModel.actions[ACTION_ENUM.SAVE].set('disabled', MainViewModel.dataFields.id.value == "");
		// 로드이후, 최초에 스케줄이름 유효성 검사 메시지 제거.
		MainViewModel.dataFields.scheduleName.validator.hideMessages();
		// 로드이후, 시간 및 운영 도움 팝업 클로즈.
		MainViewModel.dataFields.timeAndOperationSettings.oneDayTimePicker.help.popup.close.click();
	};

	var compareName = function(a, b) {
		var nameA = a.name.toUpperCase(); // ignore upper and lowercase
		var nameB = b.name.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		// 이름이 같을 경우
		return 0;
	};

	var compareUpdatedDate = function(a, b) {
		var updatedDateA = a.updated.date.toUpperCase(); // ignore upper and lowercase
		var updatedDateB = b.updated.date.toUpperCase(); // ignore upper and lowercase
		if (updatedDateA < updatedDateB) {
			return 1;
		}
		if (updatedDateA > updatedDateB) {
			return -1;
		}
		// 이름이 같을 경우
		return 0;
	};

	return {
		init : init
	};

});
//For Debug
//# sourceURL=facility-schedule/create.js
