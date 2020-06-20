define("operation/schedule/viewmodel/create-vm", ["operation/core", "operation/schedule/config/schedule-common",
	"operation/schedule/config/schedule-template"], function(CoreModule, Common, Template){
	var kendo = window.kendo;
	var moment = window.moment;
	var Util = window.Util;
	var Settings = window.GlobalSettings;
	var I18N = window.I18N;
	var temperatureSettings = Settings.getTemperature();
	var unitType = temperatureSettings.unit;
	var unit = Util.CHAR[unitType];
	var step = temperatureSettings.increment;

	var typeFilterDataSource = Util.getControllableDeviceTypeDataSource();

	var typeQuery = ["AirConditioner.*", "ControlPoint.AO", "ControlPoint.DO", "Beacon", "Gateway", "Light", "CCTV"];

	var typeFilterText = {
		"AirConditioner" : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"),
		"AirConditionerOutdoor" : I18N.prop("FACILITY_DEVICE_TYPE_SAC_OUTDOOR"),
		"ControlPoint" : I18N.prop("FACILITY_DEVICE_TYPE_POINT"),
		"Meter" : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"),
		"Beacon" : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"),
		"IoT Gateway" : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"),
		"Light" : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"),
		"CCTV" : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"),
		"Printer" : I18N.prop("FACILITY_DEVICE_TYPE_PRINTER")
	};

	var confirmDialog = Common.confirmDialog, msgDialog = Common.msgDialog;
	var MAX_END_DATE = "2099-12-31";
	var MAX_END_DATE_YEAR = 2099;

	var ACTION_ENUM = {
		LOAD: 0,
		SAVE: 1,
		CANEL: 2
	};

	var MainViewModel = kendo.observable({
		actions : [
			{                                           //버튼 타입 filter 영역과 동일함.
				type : "button",
				id : "schedule-load-btn",
				text : I18N.prop("COMMON_BTN_LOAD"),
				invisible : false,
				disabled : false,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			},
			{
				type : "button",
				id : "schedule-save-btn",
				text : I18N.prop("COMMON_BTN_SAVE"),
				invisible : false,
				disabled : true,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			},
			{
				type : "button",
				id : "schedule-cancel-btn",
				text : I18N.prop("COMMON_BTN_CANCEL"),
				invisible : false,
				disabled : false,
				options : {
					click : function(){
						var closeCreateBtn = $("#schedule-close-create");
						closeCreateBtn.trigger('click');
					},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			}
		],
		dataFields: {
			id: {
				init: function() {},
				value: ""
			},
			folder: {
				init: function() {},
				value: ""
			},
			scheduleName: {
				validator: null,
				init: function() {
					var self = this;
					var maxLength = 30;
					var scheduleNameInputElem = $('#schedule-create-name');
					self.validator = $(scheduleNameInputElem.parent()).data("kendoCommonValidator");
					self.validator.bind('validate', function(e){
						MainViewModel.actions[ACTION_ENUM.SAVE].set('disabled', !e.valid);
						if(e.sender.element.find('input').eq(0).val() == "") MainViewModel.actions[ACTION_ENUM.SAVE].set('disabled', true);
					});
					self.validator.setOptions({
						messages: {
							required: function(){
								return I18N.prop("COMMON_REQUIRED_INFORMATION");
							},
							maxLength : function(){
								return I18N.prop("COMMON_CANNOT_INPUT_MAX_MORE", maxLength);
							}
						},
						rules: {
							required: function(e){
								return true;
							},
							maxLength: function(e){
								var val = e.val().trim();
								return val.length <= 30;
							}
						}
					});
				},
				value: "",
				onDuplicatedName: function() {
					// 스케줄명 중복시, 팝업 알림 생성.
					msgDialog.message(I18N.prop("FACILITY_SCHEDULE_DUPlICATED_SCHEDULE_NAME_EXIST"));
					msgDialog.open();
				}
			},
			devices: {
				widget: null,
				init: function() {
					var self = this;
					self.widget = $("#schedule-device-selector-popup").kendoCommonDeviceSelecter().data("kendoCommonDeviceSelecter");
					self.widget.bind("onSave", this.saveHandler.bind(self));
				},
				value: null,
				openPopup: function(e) {
					var devices = MainViewModel.dataFields.devices;
					var selectedDevices = devices.get('value');
					var selectedDeviceIds = [];
					var deviceSelector = devices.widget;

					selectedDevices.forEach(function(device){
						var id = device.id ? device.id : device.dms_devices_id;
						selectedDeviceIds.push(id);
					});

					deviceSelector.selectByIds(selectedDeviceIds);
					deviceSelector.open();
				},
				saveHandler: function(e) {
					var selectedDevices = e.result;
					var self = this;
					// 선택 기기 아이디값 설정.
					self.set('value', []);
					self.set('value', selectedDevices);
					console.log(selectedDevices);
				},
				selectedDeviceTypeAndCount: {
					indoor: 0,
					dhw: 0,
					ventilator: 0,
					point: 0,
					light: 0
				},
				selectedNumText: "",
				getSelectedDeviceTypesCount: function() {
					var self = this;
					var selectedDevices = self.get('value');
					var deviceTypeCounts = {
						indoor: 0,
						point: 0,
						light: 0
					};
					selectedDevices.forEach(function(device){
						if(typeof device.type !== 'undefined') {
							if(device.type.indexOf("AirConditioner") != -1) {
								deviceTypeCounts['indoor']++;
							} else if(device.type.indexOf("ControlPoint") != -1) {
								if(device.mappedType.indexOf("ControlPoint") != -1) deviceTypeCounts['point']++;
								if(device.mappedType.indexOf("Light") != -1) deviceTypeCounts['light']++;
							} else if(device.type.indexOf("Light") != -1) {
								deviceTypeCounts['light']++;
							}
						} else if(typeof device.dms_devices_type !== 'undefined'){
							if(device.dms_devices_type.indexOf("AirConditioner") != -1) {
								deviceTypeCounts['indoor']++;
							} else if(device.dms_devices_type.indexOf("ControlPoint") != -1) {
								if(device.dms_devices_mappedType.indexOf("ControlPoint") != -1) deviceTypeCounts['point']++;
								if(device.dms_devices_mappedType.indexOf("Light") != -1) deviceTypeCounts['light']++;
							} else if(device.dms_devices_type.indexOf("Light") != -1) {
								deviceTypeCounts['light']++;
							}
						}
					});
					return deviceTypeCounts;
				},
				getSelectedNumText: function() {
					var self = this;
					var deviceTypeCounts = self.getSelectedDeviceTypesCount();
					return I18N.prop("FACILITY_SCHEDULE_CREATE_SELECTED_DEVICE_TYPES", deviceTypeCounts.indoor, deviceTypeCounts.point, deviceTypeCounts.light);
				}
			},
			period: {
				init: function() {
					var startDate = new Date();
					var endDate = new Date();
					// 데이트 피커 위젯 초기화.
					endDate = moment(endDate).add(1, "M").toDate();

					this.startDatePicker.init(startDate, this.datePickerOptions);
					this.endDatePicker.init(endDate, this.datePickerOptions);
					// 데이터 피커 날짜 선택 이벤트 관련 핸들러 바인딩.
					this.startDatePicker.widget.options.okCallBack = this.handleSelectDateEvt.bind(this);
					this.endDatePicker.widget.options.okCallBack = this.handleSelectDateEvt.bind(this);
					// 데이터 초기화.
					this.value.set('setDate', startDate);
					this.value.set('endDate', endDate);
				},
				value: {startDate: '', endDate: ''},
				checked: "indefinitePeriod",
				change: function(e) {
					var self = this.dataFields.period;
					var startDatePicker = self.startDatePicker.widget;
					var endDatePicker = self.endDatePicker.widget;
					var periodChecked = self.checked;
					if(periodChecked == "definitePeriod") {
						startDatePicker.enable(true);
						endDatePicker.enable(true);
					} else {
						startDatePicker.enable(false);
						endDatePicker.enable(false);
					}
				},
				datePickerOptions: {
					okCallBack: function() {}
				},
				handleSelectDateEvt: function () {
					var startDatePickerWidget = this.startDatePicker.widget, startDate = startDatePickerWidget.value();
					var endDatePickerWidget = this.endDatePicker.widget, endDate = endDatePickerWidget.value();
					var nowDate = new Date();
					// 선택한 시작일이 오늘보다 이전이면 자동으로 오늘 날짜로 보정.
					if(startDate < nowDate) {
						startDatePickerWidget.value(nowDate);
						startDate = nowDate;
					}
					// 선택한 시작일이 종료일 날짜보다 미래의 날짜로 지정되면, 종료일은 시작일과 동일한 날짜로 보정.
					if(startDate > endDate) {
						endDatePickerWidget.value(startDate);
						endDate = startDate;
					}
					startDate = moment(startDate).format('YYYY-MM-DD');
					endDate = moment(endDate).format('YYYY-MM-DD');
					this.set("value", {startDate: startDate, endDate: endDate});
				},
				startDatePicker: {
					widget: null,
					init: function(date, datePickerOptions) {
						this.widget = $("#schedule-create-start-datepicker").kendoCommonDatePicker(datePickerOptions).data("kendoCommonDatePicker");
						this.widget.enable(false);
						this.widget.value(date);
					}
				},
				endDatePicker: {
					widget: null,
					init: function(date, datePickerOptions) {
						this.widget = $("#schedule-create-end-datepicker").kendoCommonDatePicker(datePickerOptions).data("kendoCommonDatePicker");
						this.widget.enable(false);
						this.widget.value(date);
					}
				}
			},
			timeAndOperationSettings: {
				init: function () {
					this.oneDayTimePicker.init();
					this.repeatDate.init();
					this.operationSettings.init();
					this.timeSettingList.init();

					this.oneDayTimePicker.widget.bind("change", OperationViewModel.operation.confirm.clear.setEnabled);
					RepeatDateViewModel.bind('change', OperationViewModel.operation.confirm.clear.setEnabled);
					OperationViewModel.bind('change', OperationViewModel.operation.confirm.clear.setEnabled);
				},
				value: [],
				oneDayTimePicker: {
					widget: null,
					init: function() {
						this.widget = $("#oneday-time-picker").kendoOneDayTimePicker().data("kendoOneDayTimePicker");
					},
					setData: function(data) {
						// oneDayTimePicker 복수개의 타임설정 선택시, disabled 처리.
						if(data.length > 1) {
							this.widget.setTimesettings(null);
							this.widget.enable(false);
						} else if(data.length == 1){
							var executionTime = data[0].executionTime;
							this.widget.setTimesettings(executionTime);
							this.widget.enable(true);
						} else if(data.length == 0) {
							this.widget.setTimesettings(null);
						}
					},
					getData: function() {
						return this.widget.getTimesettings();
					},
					help: {
						icon: {
							click: function(e) {
								$(".schedule-create-content .field-wrapper.time-and-operation-field .help-popup-wrapper").css("display", "inline-block");
							}
						},
						popup: {
							msg: I18N.prop("FACILITY_SCHEDULE_CREATE_TIME_SETTING_HELP_MSG"),
							close: {
								click: function(e) {
									$(".schedule-create-content .field-wrapper.time-and-operation-field .help-popup-wrapper").css("display", "none");
								}
							}
						}
					}
				},
				repeatDate: {
					view: null,
					init: function() {
						RepeatDateViewModel.init();
						this._renderTemplate();
					},
					setData: function(data) {
						var checkedDataCount = data.length;
						var daysOfWeek = RepeatDateViewModel.get('daysOfWeek');
						var daysOfWeekNotEqualed = RepeatDateViewModel.get('daysOfWeekNotEqualed');
						var discoverdCount = {
							Mon : 0,
							Tue : 0,
							Wed : 0,
							Thu : 0,
							Fri : 0,
							Sat : 0,
							Sun : 0
						};

						data.forEach(function(timeSetting) {
							timeSetting.daysOfWeek.forEach(function(day){
								discoverdCount[day]++;
							});
						});

						Object.keys(discoverdCount).forEach(function(day){
							daysOfWeek[day.toLowerCase()] = false;
							daysOfWeekNotEqualed[day.toLowerCase()] = false;

							if(discoverdCount[day] >= 1) {
								daysOfWeek[day.toLowerCase()] = true;
							}

							if(discoverdCount[day] == checkedDataCount) {
								daysOfWeekNotEqualed[day.toLowerCase()] = false;
							} else{
								daysOfWeekNotEqualed[day.toLowerCase()] = true;
							}

						});

						RepeatDateViewModel.daysOfWeekChangeHandler();
						RepeatDateViewModel.set('daysOfWeek', daysOfWeek);
						RepeatDateViewModel.set('daysOfWeekNotEqualed', daysOfWeekNotEqualed);
						this._renderTemplate();
					},
					_renderTemplate: function() {
						if(this.view !== null) this.view.destroy();
						this.view = new kendo.View($('#schedule-repeat-date-template'), {model: RepeatDateViewModel, evalTemplate: true});
						this.view.render($('#schedule-repeat-date'));
					},
					getData: function() {
						var daysOfWeek = RepeatDateViewModel.get('daysOfWeek');
						var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
						var res = [];

						days.forEach(function(day) {
							if(daysOfWeek[day]) {
								res.push(day[0].toUpperCase() + day.slice(1));
							}
						});
						return res;
					}
				},
				operationSettings: {
					init: function () {
						var self = this;
						OperationViewModel.init();
						self.tab.init();
					},
					tab: {
						widget: null,
						operationTabElem: null,
						init: function() {
							var operationTabElem, OperationView;
							OperationView = new kendo.View($('#schedule-operation-template'), {model: OperationViewModel, evalTemplate: true});
							OperationView.render($('#schedule-operation'));
							operationTabElem = $("#operation-tab");
							this.operationTabElem = operationTabElem;
							this.widget = operationTabElem.kendoCommonTabStrip({isTopMenu: false}).data("kendoCommonTabStrip");
						},
						activeTabInit: function(){
							this.setActiveTab(0);
						},
						setActiveTab: function(index) {
							var operationTabElem = this.operationTabElem;
							var tabElems = $(operationTabElem).find('ul > li');
							this.widget.activateTab(tabElems.eq(index));
						}
					},
					setData: function(data) {
						var self = this;
						var appliedOperationDataKeyAndCount = {
							indoor: {
								power: {
									checked: {},
									active: {}
								},
								operation: {
									checked: {},
									Auto:{active:{}},
									Cool:{active:{}},
									Heat:{active:{}},
									Dry:{active:{}},
									Fan:{active:{}},
									CoolStorage:{active:{}},
									HeatStorage:{active:{}}
								},
								temperature: {
									checked:{},
									desired:{}
								},
								waterTemp: {
									checked:{},
									desired:{}
								}
							},
							ventilator: {
								power: {
									checked: {},
									active: {}
								},
								operation: {
									checked: {},
									Auto:{active:{}},
									HeatEx:{active:{}},
									Bypass:{active:{}},
									Sleep:{active:{}}
								}
							},
							dhw: {
								power: {
									checked: {},
									active: {}
								},
								operation: {
									checked: {},
									Eco:{active:{}},
									Standard:{active:{}},
									Power:{active:{}},
									Force:{active:{}}
								},
								temperature: {
									checked:{},
									desired:{}
								}
							},
							remoteControl: {
								checked:{},
								control:[{
									checked:{},
									active:{}
								},{
									checked:{},
									active:{}
								}]
							},
							light: {
								power: {
									checked: {},
									active: {}
								},
								checked:{},
								value:{}
							},
							point: {
								aoav: {
									checked:{},
									value:{}
								},
								dodv: {
									checked:{},
									active:{}
								}
							},
							pre: {
								checked: {},
								cool:{},
								heat:{},
								radioChecked: {}
							}
						};


						var checkedDataCount = data.length;
						OperationViewModel.init();
						// 다중 선택된 모델 순차적으로 뷰에 적용.
						data.forEach(function(item){
							self.applyOperationViewModel(item, appliedOperationDataKeyAndCount, checkedDataCount);
						});

						// indoor
						var indoor = appliedOperationDataKeyAndCount.indoor;
						// indoor power
						// indoor power checked
						OperationViewModel.operation.indoor.power.set('checkedNotEqualed', indoor.power.checked.true < checkedDataCount);
						// indoor power active
						if(OperationViewModel.operation.indoor.power.get('active')) {
							OperationViewModel.operation.indoor.power.set('active', !(indoor.power.active.On < checkedDataCount));
						}
						OperationViewModel.operation.indoor.power.set('activeNotEqualed', indoor.power.active.On < checkedDataCount);
						// indoor operation
						// indoor operation checked
						OperationViewModel.operation.indoor.operation.set('checkedNotEqualed', indoor.operation.checked.true < checkedDataCount);
						// indoor operation mode (운전모드)
						Object.keys(indoor.operation).forEach(function(key){
							if(key !== 'checked' && key !== 'active') {
								var modes = OperationViewModel.operation.indoor.operation.mode;
								modes.forEach(function(mode){
									if(mode.name === key) {
										if(mode.get('active') && indoor.operation[key].active.true < checkedDataCount) {
											mode.set('active', false);
											OperationViewModel.operation.indoor.operation.set('activeNotEqualed', true);
										}
									}
								});
							}
						});
						// indoor temperature
						// indoor temperature checked
						OperationViewModel.operation.indoor.temperature.set('checkedNotEqualed', indoor.temperature.checked.true < checkedDataCount);
						// indoor temperature desired
						if(OperationViewModel.operation.indoor.temperature.get('checked'))
							Object.keys(indoor.temperature.desired).forEach(function(key){
								if(indoor.temperature.desired[key] < checkedDataCount) {
									// notEqualed 관련 처리 추가.
									// 값이 서로 다른 경우, '-' 표시 (placeholder 값)
									OperationViewModel.operation.indoor.temperature.set('desired', '');
									var indoorTempWidget = $('#indoor-temp').data('kendoCustomNumericBox');
									$(indoorTempWidget.wrapper).unbind('click');
									$(indoorTempWidget.wrapper).bind('click', function(){
										// notEqualed NumericBox Init
										if(OperationViewModel.operation.indoor.operation.activeNotEqualed)
											OperationViewModel.operation.indoor.temperature.set('checkedNotEqualed', true);
										else if(OperationViewModel.operation.indoor.temperature.checkedNotEqualed)
											OperationViewModel.operation.indoor.temperature.set('checkedNotEqualed', false);
										OperationViewModel.operation.indoor.temperature.set('desired', INDOOR_DESIRED);
										// 모드 값이 중복되어있는경우, 첫번째 값으로 선택
										if(OperationViewModel.operation.indoor.operation.activeNotEqualed) {
											$("#usechk_indoor3").trigger('click');
											OperationViewModel.operation.indoor.operation.mode[0].setIndoorMinMax();
										}
										$(indoorTempWidget.wrapper).unbind('click');
									});
								}
							});
						// indoor waterTemp
						// indoor waterTemp checked
						OperationViewModel.operation.indoor.waterTemp.set('checkedNotEqualed', indoor.waterTemp.checked.true < checkedDataCount);
						// indoor temperature desired
						if(OperationViewModel.operation.indoor.waterTemp.get('checked'))
							Object.keys(indoor.waterTemp.desired).forEach(function(key){
								if(indoor.waterTemp.desired[key] < checkedDataCount) {
									// 값이 서로 다른경우, '-' 표시 (placeholder 값)
									OperationViewModel.operation.indoor.waterTemp.set('desired', '');
									var indoorWaterTempWidget = $('#indoor-water-temp').data('kendoCustomNumericBox');
									$(indoorWaterTempWidget.wrapper).unbind('click');
									$(indoorWaterTempWidget.wrapper).bind('click', function(){
										// notEqualed NumericBox Init
										if(OperationViewModel.operation.indoor.operation.activeNotEqualed)
											OperationViewModel.operation.indoor.waterTemp.set('checkedNotEqualed', true);
										else if(OperationViewModel.operation.indoor.waterTemp.checkedNotEqualed)
											OperationViewModel.operation.indoor.waterTemp.set('checkedNotEqualed', false);
										OperationViewModel.operation.indoor.waterTemp.set('desired', INDOOR_WATER_DESIRED);
										// 모드 값이 중복되어있는경우, 첫번째 값으로 선택
										if(OperationViewModel.operation.indoor.operation.activeNotEqualed) {
											$("#usechk_indoor5").trigger('click');
											OperationViewModel.operation.indoor.operation.mode[0].setIndoorMinMax();
										}
										$(indoorWaterTempWidget.wrapper).unbind('click');
									});
								}
							});


						// ventilator
						var ventilator = appliedOperationDataKeyAndCount.ventilator;
						// ventilator power
						// ventilator power checked
						OperationViewModel.operation.ventilator.power.set('checkedNotEqualed', ventilator.power.checked.true < checkedDataCount);
						// ventilator power active
						if(OperationViewModel.operation.ventilator.power.get('active')) {
							OperationViewModel.operation.ventilator.power.set('active', !(ventilator.power.active.On < checkedDataCount));
						}
						OperationViewModel.operation.ventilator.power.set('activeNotEqualed', ventilator.power.active.On < checkedDataCount);
						// ventilator operation
						// ventilator operation checked
						OperationViewModel.operation.ventilator.operation.set('checkedNotEqualed', ventilator.operation.checked.true < checkedDataCount);
						// ventilator operation mode (운전모드)
						Object.keys(ventilator.operation).forEach(function(key){
							if(key !== 'checked' && key !== 'active') {
								var modes = OperationViewModel.operation.ventilator.operation.mode;
								modes.forEach(function(mode){
									if(mode.name === key) {
										if(mode.get('active') && ventilator.operation[key].active.true < checkedDataCount) {
											mode.set('active', false);
											OperationViewModel.operation.ventilator.operation.set('activeNotEqualed', true);
										}
									}
								});
							}
						});

						// dhw
						var dhw = appliedOperationDataKeyAndCount.dhw;
						// dhw power
						// dhw power checked
						OperationViewModel.operation.dhw.power.set('checkedNotEqualed', dhw.power.checked.true < checkedDataCount);
						// dhw power active
						if(OperationViewModel.operation.dhw.power.get('active')) {
							OperationViewModel.operation.dhw.power.set('active', !(dhw.power.active.On < checkedDataCount));
						}
						OperationViewModel.operation.dhw.power.set('activeNotEqualed', dhw.power.active.On < checkedDataCount);
						// dhw operation
						// dhw operation checked
						OperationViewModel.operation.dhw.operation.set('checkedNotEqualed', dhw.operation.checked.true < checkedDataCount);
						// dhw operation mode (운전모드)
						Object.keys(dhw.operation).forEach(function(key){
							if(key !== 'checked' && key !== 'active') {
								var modes = OperationViewModel.operation.dhw.operation.mode;
								modes.forEach(function(mode){
									if(mode.name === key) {
										if(mode.get('active') && dhw.operation[key].active.true < checkedDataCount) {
											mode.set('active', false);
											OperationViewModel.operation.dhw.operation.set('activeNotEqualed', true);
										}
									}
								});
							}
						});
						// dhw temperature
						// dhw temperature checked
						OperationViewModel.operation.dhw.temperature.set('checkedNotEqualed', dhw.temperature.checked.true < checkedDataCount);
						// dhw temperature desired
						if(OperationViewModel.operation.dhw.temperature.get('checked'))
							Object.keys(dhw.temperature.desired).forEach(function(key){
								if(dhw.temperature.desired[key] < checkedDataCount) {
									// 값이 서로 다른경우, '-' 표시 (placeholder 값)
									OperationViewModel.operation.dhw.temperature.set('desired', '');
									var dhwTempWidget = $('#dhw-temp').data('kendoCustomNumericBox');
									$(dhwTempWidget.wrapper).unbind('click');
									$(dhwTempWidget.wrapper).bind('click', function(){
										// notEqualed NumericBox Init
										if(OperationViewModel.operation.dhw.operation.activeNotEqualed)
											OperationViewModel.operation.dhw.temperature.set('checkedNotEqualed', true);
										else if(OperationViewModel.operation.dhw.temperature.checkedNotEqualed)
											OperationViewModel.operation.dhw.temperature.set('checkedNotEqualed', false);
										OperationViewModel.operation.dhw.temperature.set('desired', DHW_DESIRED);
										// 모드 값이 중복되어있는경우, 첫번째 값으로 선택
										if(OperationViewModel.operation.dhw.operation.activeNotEqualed) {
											$("#usechk_dhw3").trigger('click');
										}
										$(dhwTempWidget.wrapper).unbind('click');
									});
								}
							});

						// remoteControl
						var remoteControl = appliedOperationDataKeyAndCount.remoteControl;
						OperationViewModel.operation.remoteControl.set('checkedNotEqualed', remoteControl.checked.true < checkedDataCount);
						if(OperationViewModel.operation.remoteControl.control[0].get('active') && remoteControl.control[0].active.true < checkedDataCount) {
							OperationViewModel.operation.remoteControl.control[0].set('active', false);
							OperationViewModel.operation.remoteControl.set('activeNotEqualed', true);
						}
						if(OperationViewModel.operation.remoteControl.control[1].get('active') && remoteControl.control[1].active.true < checkedDataCount) {
							OperationViewModel.operation.remoteControl.control[1].set('active', false);
							OperationViewModel.operation.remoteControl.set('activeNotEqualed', true);
						}

						// light
						var light = appliedOperationDataKeyAndCount.light;
						// light power checked
						OperationViewModel.operation.light.power.set('checkedNotEqualed', light.power.checked.true < checkedDataCount);
						// light power active
						if(OperationViewModel.operation.light.power.get('active')) {
							OperationViewModel.operation.light.power.set('active', !(light.power.active.On < checkedDataCount));
						}
						OperationViewModel.operation.light.power.set('activeNotEqualed', light.power.active.On < checkedDataCount);
						// light slide checked
						OperationViewModel.operation.light.set('checkedNotEqualed', light.checked.true < checkedDataCount);
						// light value
						Object.keys(light.value).forEach(function(value){
							if(light.value[value] < checkedDataCount) {
								OperationViewModel.operation.light.set('valueNotEqualed', true);
							}
						});

						// point
						var point = appliedOperationDataKeyAndCount.point;
						// point AO checked
						OperationViewModel.operation.point.aoav.set('checkedNotEqualed', point.aoav.checked.true < checkedDataCount);
						// point AO value
						Object.keys(point.aoav.value).forEach(function(value){
							if(point.aoav.value[value] < checkedDataCount) {
								// 값이 서로 다른경우, '-' 표시 (placeholder 값)
								OperationViewModel.operation.point.aoav.set('value', '');
								var pointValueWidget = $('#point-value').data('kendoCustomNumericBox');
								$(pointValueWidget.wrapper).unbind('click');
								$(pointValueWidget.wrapper).bind('click', function(){
									// notEqualed NumericBox Init
									OperationViewModel.operation.point.aoav.set('checkedNotEqualed', true);
									OperationViewModel.operation.point.aoav.set('desired', INDOOR_DESIRED);
									$("#usechk_ddc1").trigger('click');
									$(pointValueWidget.wrapper).unbind('click');
								});
							}
						});

						// point DO checked
						OperationViewModel.operation.point.dodv.set('checkedNotEqualed', point.dodv.checked.true < checkedDataCount);
						// point DO power
						if(OperationViewModel.operation.point.dodv.get('active')) {
							OperationViewModel.operation.point.dodv.set('active', !(point.dodv.active.true < checkedDataCount));
						}
						OperationViewModel.operation.point.dodv.set('activeNotEqualed', point.dodv.active.true < checkedDataCount);

						//pre-cooling / pre-heating
						var pre = appliedOperationDataKeyAndCount.pre;
						// pre checked
						OperationViewModel.operation.pre.set('checkedNotEqualed', pre.checked.true < checkedDataCount);
						// pre cool
						var preCoolKeysCount = Object.keys(pre.cool).length;
						Object.keys(pre.cool).forEach(function(value){
							if(pre.cool[value] < checkedDataCount) {
								// 값이 서로 다른경우, '-' 표시 (placeholder 값)
								OperationViewModel.operation.pre.cool.set('value', '');
								var preCoolTempWidget = $('#pre-cool-temp').data('kendoCustomNumericBox');
								$(preCoolTempWidget.wrapper).unbind('click');
								$(preCoolTempWidget.wrapper).bind('click', function(){
									// notEqualed NumericBox Init
									OperationViewModel.operation.pre.cool.set('value', PRE_DESIRED);
									$("#usechk_preTemper2").trigger('click');
									$("#usechk_preTemper1").trigger('click');
									$(preCoolTempWidget.wrapper).unbind('click');
								});
							}
						});
						// pre heat
						var preHeatKeysCount = Object.keys(pre.heat).length;
						Object.keys(pre.heat).forEach(function(value){
							if(pre.heat[value] < checkedDataCount) {
								// 값이 서로 다른경우, '-' 표시 (placeholder 값)
								OperationViewModel.operation.pre.heat.set('value', '');
								var preHeatTempWidget = $('#pre-heat-temp').data('kendoCustomNumericBox');
								$(preHeatTempWidget.wrapper).unbind('click');
								$(preHeatTempWidget.wrapper).bind('click', function(){
									// notEqualed NumericBox Init
									OperationViewModel.operation.pre.heat.set('value', PRE_DESIRED);
									$("#usechk_preTemper1").trigger('click');
									$("#usechk_preTemper2").trigger('click');
									$(preHeatTempWidget.wrapper).unbind('click');
								});
							}
						});

						if(checkedDataCount > 1) {
							OperationViewModel.operation.pre.set('radioCheckedNotEqualed', Object.keys(pre.radioChecked).length > 1);
						} else {
							OperationViewModel.operation.pre.set('radioCheckedNotEqualed', false);
						}

						// pre-cooling / pre-heating 둘다 라디오 체크가 되어있는 경우,
						if(preCoolKeysCount > 0 && preHeatKeysCount > 0) {
							OperationViewModel.operation.pre.set("radioChecked", false);
							OperationViewModel.operation.pre.cool.set("disabled", false);
							OperationViewModel.operation.pre.heat.set("disabled", false);
						}

						console.log(appliedOperationDataKeyAndCount);
						console.log(OperationViewModel);

						// 체크한 운영 설정 시간 에 따라, 운영 설정 탭 전환 (우선순위: 실내기 > 조명 & 관제점 > 예냉/예열)
						if(indoor.power.checked.true > 0 || ventilator.power.checked.true > 0 || dhw.power.checked.true > 0 || remoteControl.checked.true > 0) {
							self.tab.setActiveTab(0);
						} else if(light.power.checked.true > 0 || light.checked.true > 0 || point.aoav.checked.true > 0 || point.dodv.checked.true ) {
							self.tab.setActiveTab(1);
						} else if(pre.checked.true > 0) {
							self.tab.setActiveTab(2);
						}
					},
					getData: function() {
						return OperationViewModel._getData();
					},
					applyOperationViewModel: function(configuration, appliedOperationDataKeyAndCount, appliedConfigurationCount) {
						//var control = configuration.control;
						var algorithm = configuration.algorithm;
						var deviceTypes = typeof configuration.deviceTypes != 'undefined' ? configuration.deviceTypes : [];
						var i, max = deviceTypes.length;
						var control = {
							operations : [],
							temperatures : [],
							modes : [],
							configuration : {},
							aoControlPoint : {},
							doControlPoint : {},
							lights : []
						};

						var deviceType, deviceControl, deviceControlObj;
						for( i = 0; i < max; i++ ){
							deviceType = deviceTypes[i];
							deviceControl = deviceType.control;
							if(deviceControl){
								if(deviceControl.operations){
									deviceControlObj = deviceControl.operations;
									if(deviceControlObj instanceof kendo.data.ObservableArray){
										deviceControlObj = deviceControlObj.toJSON();
									}
									control.operations = control.operations.concat(deviceControlObj);
								}
								if(deviceControl.temperatures){
									deviceControlObj = deviceControl.temperatures;
									if(deviceControlObj instanceof kendo.data.ObservableArray){
										deviceControlObj = deviceControlObj.toJSON();
									}
									control.temperatures = control.temperatures.concat(deviceControlObj);
								}
								if(deviceControl.modes){
									deviceControlObj = deviceControl.modes;
									if(deviceControlObj instanceof kendo.data.ObservableArray){
										deviceControlObj = deviceControlObj.toJSON();
									}
									control.modes = control.modes.concat(deviceControlObj);
								}
								if(deviceControl.configuration){
									control.configuration = deviceControl.configuration;
								}

								if(deviceType.dms_devices_type.indexOf("AO") != -1 && deviceControl.controlPoint){
									control.aoControlPoint = deviceControl.controlPoint;
								}

								if(deviceType.dms_devices_type.indexOf("DO") != -1 && deviceControl.controlPoint){
									control.doControlPoint = deviceControl.controlPoint;
								}

								if(deviceControl.lights){
									control.lights = deviceControl.lights;
								}
							}
						}

						configuration.control = control;

						var operations = control.operations,
							temperatures = control.temperatures,
							modes = control.modes,
							configuration = control.configuration,
							aoControlPoint = control.aoControlPoint,
							doControlPoint = control.doControlPoint,
							lights = control.lights;

						var KEYS = {
							"AirConditioner.Indoor" : "indoor",
							"AirConditioner.Indoor.Room" : "indoor",
							"AirConditioner.Indoor.Room.Auto" : "indoor",
							"AirConditioner.Indoor.Room.Heat" : "indoor",
							"AirConditioner.Indoor.Room.Cool" : "indoor",
							"AirConditioner.Indoor.General" : "indoor",
							"AirConditioner.Indoor.WaterOutlet" : "indoor",
							"AirConditioner.Indoor.DHW" : "dhw",
							"AirConditioner.DHW" : "dhw",
							"AirConditioner.Indoor.Ventilator" : "ventilator",
							"ControlPoint" : "point",
							"ControlPoint.AO" : "point.aoav",
							"ControlPoint.AV" : "point.aoav",
							"ControlPoint.DO" : "point.dodv",
							"ControlPoint.DV" : "point.dodv",
							"General" : "light"
						};

						var viewModel = OperationViewModel.operation;
						var power, key, op, id;
						if(operations){
							max = operations.length;
							for( i = 0; i < max; i++ ){
								op = operations[i];
								id = op.id;
								key = KEYS[id];
								power = op.power;
								//power = power == "On" ? true : false;
								if(viewModel[key] && !viewModel[key].power.get("disabled")){
									if(power){
										viewModel[key].power.set("checked", power);
										// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
										if(appliedConfigurationCount > 0) {
											if(typeof appliedOperationDataKeyAndCount[key]['power']['checked']['true'] === 'undefined') appliedOperationDataKeyAndCount[key]['power']['checked']['true'] = 0;
											appliedOperationDataKeyAndCount[key]['power']['checked']['true']++;
										}
									}

									if(power == "On"){
										viewModel[key].power.set("active", power);
										// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
										if(appliedConfigurationCount > 0) {
											if(typeof appliedOperationDataKeyAndCount[key]['power']['active'][power] === 'undefined') appliedOperationDataKeyAndCount[key]['power']['active'][power] = 0;
											appliedOperationDataKeyAndCount[key]['power']['active'][power]++;
										}
									}

								}
							}
						}

						if(modes){
							var mode, operModes, j, oper, length;
							max = modes.length;
							for( i = 0; i < max; i++ ){
								op = modes[i];
								id = op.id;
								key = KEYS[id];
								mode = op.mode;
								if(viewModel[key]){
									oper = viewModel[key].operation;
								}

								if(!oper || viewModel[key].power.get("disabled")){
									continue;
								}
								if(key == "light" && viewModel[key].get("disabled")){
									continue;
								}

								operModes = oper.mode;

								length = operModes.length;
								for( j = 0; j < length; j++ ){
									if(operModes[j].name == mode){
										viewModel[key].operation.set("checked", true);
										// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
										if(appliedConfigurationCount > 0) {
											if(typeof appliedOperationDataKeyAndCount[key]['operation']['checked']['true'] === 'undefined') appliedOperationDataKeyAndCount[key]['operation']['checked']['true'] = 0;
											appliedOperationDataKeyAndCount[key]['operation']['checked']['true']++;
										}

										operModes[j].set("active", true);
										// 적용된 모드에 따라서, 온도/출수온도 최소/최대값 재설정
										if(typeof operModes[j].setIndoorMinMax !== 'undefined'){
											operModes[j].setIndoorMinMax();
										}
										// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
										if(appliedConfigurationCount > 0) {
											if(typeof appliedOperationDataKeyAndCount[key]['operation'][operModes[j].name]['active']['true'] === 'undefined') appliedOperationDataKeyAndCount[key]['operation'][operModes[j].name]['active']['true'] = 0;
											appliedOperationDataKeyAndCount[key]['operation'][operModes[j].name]['active']['true']++;
										}

									}
								}
							}
						}

						if(temperatures){
							var desired;
							max = temperatures.length;
							for( i = 0; i < max; i++ ){
								op = temperatures[i];
								id = op.id;
								key = KEYS[id];

								desired = op.desired;
								if(viewModel[key] && !viewModel[key].power.get("disabled")){
									if(id.indexOf("Water") != -1){
										viewModel[key].waterTemp.set("checked", true);
										viewModel[key].waterTemp.set("desired", desired);

										// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
										if(appliedConfigurationCount > 0) {
											if(typeof appliedOperationDataKeyAndCount[key]['waterTemp']['checked']['true'] === 'undefined') appliedOperationDataKeyAndCount[key]['waterTemp']['checked']['true'] = 0;
											appliedOperationDataKeyAndCount[key]['waterTemp']['checked']['true']++;
											if(typeof appliedOperationDataKeyAndCount[key]['waterTemp']['desired'][desired] === 'undefined') appliedOperationDataKeyAndCount[key]['waterTemp']['desired'][desired] = 0;
											appliedOperationDataKeyAndCount[key]['waterTemp']['desired'][desired]++;
										}

									}else{
										viewModel[key].temperature.set("checked", true);
										viewModel[key].temperature.set("desired", desired);

										// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
										if(appliedConfigurationCount > 0) {
											if(typeof appliedOperationDataKeyAndCount[key]['temperature']['checked']['true'] === 'undefined') appliedOperationDataKeyAndCount[key]['temperature']['checked']['true'] = 0;
											appliedOperationDataKeyAndCount[key]['temperature']['checked']['true']++;
											if(typeof appliedOperationDataKeyAndCount[key]['temperature']['desired'][desired] === 'undefined') appliedOperationDataKeyAndCount[key]['temperature']['desired'][desired] = 0;
											appliedOperationDataKeyAndCount[key]['temperature']['desired'][desired]++;
										}

									}
								}
							}
						}

						if(aoControlPoint && aoControlPoint.value !== null && typeof aoControlPoint.value !== "undefined"){				//[13-04-2018]undefined check -jw.lim
							if(!viewModel.point.aoav.get("disabled")){
								viewModel.point.aoav.set("checked", true);
								viewModel.point.aoav.set("value", Number(aoControlPoint.value));

								// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
								if(typeof appliedOperationDataKeyAndCount['point']['aoav']['checked']['true'] === 'undefined') appliedOperationDataKeyAndCount['point']['aoav']['checked']['true'] = 0;
								appliedOperationDataKeyAndCount['point']['aoav']['checked']['true']++;
								if(typeof appliedOperationDataKeyAndCount['point']['aoav']['value'][Number(aoControlPoint.value)] === 'undefined') appliedOperationDataKeyAndCount['point']['aoav']['value'][Number(aoControlPoint.value)] = 0;
								appliedOperationDataKeyAndCount['point']['aoav']['value'][Number(aoControlPoint.value)]++;

							}
						}

						if(doControlPoint && doControlPoint.value !== null && typeof doControlPoint.value !== "undefined"){			//[13-04-2018]undefined check -jw.lim
							if(!viewModel.point.dodv.get("disabled")){
								viewModel.point.dodv.set("checked", true);
								var onOff = doControlPoint.value == 1 ? true : false;
								viewModel.point.dodv.set("active", onOff);

								// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
								if(typeof appliedOperationDataKeyAndCount['point']['dodv']['checked']['true'] === 'undefined') appliedOperationDataKeyAndCount['point']['dodv']['checked']['true'] = 0;
								appliedOperationDataKeyAndCount['point']['dodv']['checked']['true']++;
								if(typeof appliedOperationDataKeyAndCount['point']['dodv']['active'][onOff] === 'undefined') appliedOperationDataKeyAndCount['point']['dodv']['active'][onOff] = 0;
								appliedOperationDataKeyAndCount['point']['dodv']['active'][onOff]++;

							}
						}

						if(lights && lights.length > 0){
							lights = lights[0];
							if(!viewModel.light.get("disabled")){
								viewModel.light.set("checked", true);
								viewModel.light.set("value", lights.dimmingLevel);

								// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
								if(typeof appliedOperationDataKeyAndCount['light'].checked.true === 'undefined') appliedOperationDataKeyAndCount['light'].checked.true = 0;
								appliedOperationDataKeyAndCount['light'].checked.true++;
								if(typeof appliedOperationDataKeyAndCount['light'].value[lights.dimmingLevel] === 'undefined') appliedOperationDataKeyAndCount['light'].value[lights.dimmingLevel] = 0;
								appliedOperationDataKeyAndCount['light'].value[lights.dimmingLevel]++;
							}
						}

						// var control;			//[13-04-2018]중복된 코드 주석 -jw.lim
						if(configuration && configuration.remoteControl){
							control = configuration.remoteControl;
							if(!viewModel.remoteControl.get("disabled")){
								viewModel.remoteControl.set("checked", true);
								max = viewModel.remoteControl.control.length;

								// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
								if(typeof appliedOperationDataKeyAndCount['remoteControl'].checked.true === 'undefined') appliedOperationDataKeyAndCount['remoteControl'].checked.true = 0;
								appliedOperationDataKeyAndCount['remoteControl'].checked.true++;

								for( i = 0; i < max; i++ ){
									if(control == viewModel.remoteControl.control[i].name){
										viewModel.remoteControl.set("checked", true);
										viewModel.remoteControl.control[i].set("active", true);

										// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
										if(typeof appliedOperationDataKeyAndCount['remoteControl'].control[i].active.true === 'undefined') appliedOperationDataKeyAndCount['remoteControl'].control[i].active.true = 0;
										appliedOperationDataKeyAndCount['remoteControl'].control[i].active.true++;

										break;
									}
								}
							}
						}

						if(algorithm && !viewModel.pre.get("disabled")){
							if(algorithm.enabled){
								viewModel.pre.set("checked", true);
								// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
								if(typeof appliedOperationDataKeyAndCount['pre'].checked.true === 'undefined') appliedOperationDataKeyAndCount['pre'].checked.true = 0;
								appliedOperationDataKeyAndCount['pre'].checked.true++;
							}
							if(algorithm.mode == "PreCooling"){
								viewModel.pre.cool.set("value", algorithm.preCoolingTemperature);
								viewModel.pre.cool.set("disabled", false);
								// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
								if(typeof appliedOperationDataKeyAndCount['pre']['cool'][algorithm.preCoolingTemperature] === 'undefined') appliedOperationDataKeyAndCount['pre']['cool'][algorithm.preCoolingTemperature] = 0;
								appliedOperationDataKeyAndCount['pre']['cool'][algorithm.preCoolingTemperature]++;
							}else if(algorithm.mode == "PreHeating"){
								viewModel.pre.heat.set("value", algorithm.preHeatingTemperature);
								viewModel.pre.heat.set("disabled", false);
								// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
								if(typeof appliedOperationDataKeyAndCount['pre']['heat'][algorithm.preHeatingTemperature] === 'undefined') appliedOperationDataKeyAndCount['pre']['heat'][algorithm.preHeatingTemperature] = 0;
								appliedOperationDataKeyAndCount['pre']['heat'][algorithm.preHeatingTemperature]++;
							}
							viewModel.pre.set("radioChecked", algorithm.mode);
							// 적용하는 설정 값이 다중인 경우, 설정값들의 다름 여부를 확인하기위한 부분.
							if(typeof appliedOperationDataKeyAndCount['pre']['radioChecked'][algorithm.mode] === 'undefined') appliedOperationDataKeyAndCount['pre']['radioChecked'][algorithm.mode] = 0;
							appliedOperationDataKeyAndCount['pre']['radioChecked'][algorithm.mode]++;
						}
					}
				},
				timeSettingList: {
					widget: null,
					init: function() {
						this.widget = $("#schedule-time-list").kendoGrid(this.gridOptions).data("kendoGrid");
						this.widget.setDataSource(this.getGridDataSource([]));
						//  이벤트 바인딩.
						this.attachGridResizeEvt();
						this.attachGridCheckedEvt();
						this.attachUserNewInputEvt();
					},
					checkedData: [],
					userNewInputMap: {
						repeatDate:{},
						operation:{}
					},
					setData: function(configurations) {
						var timeSettings = [];

						configurations.forEach(function(configuration){
							var parentId = configuration.id;
							var daysOfWeek = configuration.daysOfWeek;
							var deviceTypes = configuration.deviceTypes;
							var algorithm = configuration.algorithm;

							// 다중 편집에 대비하여, 현재 값을 기준으로 뷰에 바인딩 되지는 않지만, 저장된 값으로 설정된 뷰모델 생성.
							var repeatDateViewModel = createRepeatDateViewModel();
							repeatDateViewModel._applyData(daysOfWeek);

							var operationViewModel = createOperationViewModel();
							operationViewModel._applyData({deviceTypes: deviceTypes, algorithm: algorithm});

							// 만약 로드된 configurations 의 경우, configuration id 값이 따로 없기 때문에 생성
							if(typeof parentId == 'undefined') {
								configuration.id = MainViewModel.util.generateConfigurationId(configuration.executionTimes, configuration.daysOfWeek);
								parentId = configuration.id;
							}

							configuration.executionTimes.forEach(function(executionTime) {
								var newTimeSetting =  {
									parentId: parentId,
									daysOfWeek: daysOfWeek,
									deviceTypes: deviceTypes,
									executionTime: executionTime,
									repeatDateViewModel: repeatDateViewModel,
									operationViewModel: operationViewModel
								};
								if(typeof algorithm !== 'undefined') newTimeSetting.algorithm = algorithm;

								timeSettings.push(newTimeSetting);
							});
						});

						this.widget.setDataSource(this.getGridDataSource(timeSettings));
						this.set('checkedData', []);
					},
					getGridDataSource: function(data) {
						var compareExecutinoTime = function(a, b){
							var nameA = a.executionTime.toUpperCase(); // ignore upper and lowercase
							var nameB = b.executionTime.toUpperCase(); // ignore upper and lowercase
							if (nameA < nameB) {
								return -1;
							}
							if (nameA > nameB) {
								return 1;
							}
							return 0;
						};
						data.sort(compareExecutinoTime);
						var ds = new kendo.data.DataSource({
							data: data,
							model: {
								id: "id",
								fields: {
									executionTime: {
										from: "executionTime",
										type: "string"
									},
									operation: {
										from: "operation",
										type: "string"
									},
									daysOfWeek: {
										from: "daysOfWeek",
										type: "string"
									}
								}
							}
						});
						ds.read();
						return ds;
					},
					gridOptions: {
						resizable: true,
						scrollable: true,
						sortable: false,
						filterable: false,
						pageable: false,
						hasCheckedModel: true,
						showGridHeader: false,
						noRecords: {
							template: "<div class='no-records-text'>" + I18N.prop("FACILITY_SCHEDULE_CREATE_TIME_SETTING_LIST_EMPTY_MSG") + "</div>"
						},
						columns: [{
							field: "timeSetting",
							template: function(data) {
								var displayedTime = data.executionTime, displayedDays = "", displayedOperation = "";
								// 시간 표시
								displayedTime = displayedTime.split(":");
								displayedTime = displayedTime[0] + ":" + displayedTime[1];
								// 운영 표시
								displayedOperation = Template.operationListTemplate(data);
								// 반복요일 표시
								data.daysOfWeek.forEach(function(day, idx){
									if(!idx == 0) displayedDays += ', ';
									day = I18N.prop('FACILITY_SCHEDULE_' + day.toUpperCase());
									displayedDays += day;
								});
								displayedDays = displayedDays.toUpperCase();

								var res = '<div class="timesetting-item-wrapper">' +
                  '<div class="time-and-operation-wrapper">' +
                  '<span class="time">' + displayedTime + '</span>' +
                  '<span class="operation">' + displayedOperation + '</span>' +
                  '</div>' +
                  '<div class="repeat-date-wrapper">' +
                  '<span class="repeat-date">' + displayedDays + '</span>' +
                  '</div>' +
                  '</div>';
								return res;
							}
						}],
						dataSource: []
					},
					attachGridResizeEvt: function() {
						var self = this;
						$(window).resize(function(){
							self.widget.resize();
						});
					},
					attachGridCheckedEvt: function() {
						var self = this;
						self.widget.bind("checked", self.handleGridCheckedEvt.bind(self));
					},
					attachUserNewInputEvt: function() {
						var self = this;
						RepeatDateViewModel.bind('change', function(e){
							var value = null;
							var repeatDate = self.userNewInputMap.get('repeatDate');
							if(e.field) value = RepeatDateViewModel.get(e.field);
							repeatDate[e.field] = value;
						});
						OperationViewModel.bind('change', function(e){
							var value = null;
							var operation = self.userNewInputMap.get('operation');
							if(e.field) value = OperationViewModel.get(e.field);
							operation[e.field] = value;
						});
					},
					handleGridCheckedEvt: function() {
						var self = this;
						var checkedData = self.widget.getCheckedData();
						// 전체 row elem checked-row 클래스 제거
						self.widget.wrapper.find('tr').removeClass('checked-row');
						// 체크된 row elem 에 체크 클래스 추가.
						checkedData.forEach(function(checkedDataItem){
							var checkedRowElem = $('tr[data-uid="' + checkedDataItem.uid + '"]').eq(0);
							checkedRowElem.addClass('checked-row');
						});


						// 현재 체크 된 데이터 설정.
						self.set("checkedData", []);
						self.set("checkedData", checkedData);
						// set deleteButton disabled
						self.deleteButton.set("disabled", checkedData.length == 0);
						// set userNewInputMap init
						self.userNewInputMap.set('repeatDate', {});
						self.userNewInputMap.set('operation', {});
					},
					getNewConfigurationsAfterDelete: function(parentIds, executionTimes) {
						var mainViewModel = MainViewModel;
						var timeAndOperationSettings = mainViewModel.dataFields.timeAndOperationSettings;
						var configurations = timeAndOperationSettings.get('value');
						var newConfigurations = [];

						configurations.forEach(function(configuration){
							if(parentIds.indexOf(configuration.id) == -1) {
								newConfigurations.push(configuration);
							} else {
								var newExecutionTimes = [];
								configuration.executionTimes.forEach(function(executionTime){
									if(executionTimes.indexOf(executionTime) == -1) {
										newExecutionTimes.push(executionTime);
									}
								});
								if(newExecutionTimes.length !== 0) {
									configuration.executionTimes = newExecutionTimes;
									newConfigurations.push(configuration);
								}
							}
						});

						return newConfigurations;
					},
					deleteButton: {
						text: I18N.prop("COMMON_BTN_DELETE"),
						click: function(e) {
							var self = this;
							confirmDialog.message(I18N.prop("FACILITY_SCHEDULE_CREATE_TIMELIST_DELETE_CONFIRM_MSG"));
							confirmDialog.setConfirmActions({
								yes: function() {
									var timeAndOperationSettings = this.dataFields.timeAndOperationSettings;
									var timeSettingList = timeAndOperationSettings.timeSettingList;
									var grid = timeSettingList.widget;
									var checkedData = grid.getCheckedData();
									var checkedDataParentIds = [];
									var checkedDataExecutionTimes = [];

									checkedData.forEach(function(item){
										checkedDataParentIds.push(item.parentId);
									});
									checkedData.forEach(function(item){
										checkedDataExecutionTimes.push(item.executionTime);
									});

									var newConfigurations = timeSettingList.getNewConfigurationsAfterDelete(checkedDataParentIds, checkedDataExecutionTimes);
									// 삭제에서 제외된 configuration 만 재설정
									timeAndOperationSettings.set('value', newConfigurations);

									timeSettingList.set("checkedData", []);
									timeSettingList.deleteButton.set('disabled', true);
								}.bind(self)
							});
							confirmDialog.open();
						},
						disabled: true
					}
				}
			},
			exceptionDayList: {
				widget: null,
				init: function() {
					this.widget = $('#schedule-exception-day-list').kendoExceptionDayList(this.options).data("kendoExceptionDayList");
					this.widget.setDataSource(new kendo.data.DataSource({data: []}));
					this.widget.bind('onSave', this.saveHandler.bind(this));
					this.widget.bind('onEdit', this.editHandler.bind(this));
					this.widget.bind('onDelete', this.deleteHandler.bind(this));
					this.widget.bind('onClose', this.closeHandler.bind(this));
				},
				value: [],
				setData: function(data) {
					var ds = null;
					if(typeof data === 'undefined') data = [];
					if(data && data.length > 0) {
						// 스케줄 별 예외일에는 아이디가 따로 존재하지않아, 유니크 값으로 예외일 이름 으로 설정.
						data.forEach(function(exceptionDay){
							exceptionDay.id  = exceptionDay.name;
						});
					}

					ds = new kendo.data.DataSource({
						data: data
					});
					this.widget.setDataSource(ds);
				},
				options: {
					isRepeat: false,
					resizable: false,
					duplicateDateInspection: true
				},
				saveHandler: function(e) {
					var result = e.result;
					var value = this.get('value');
					// 스케줄 별 예외일에는 아이디가 따로 존재하지않아, 유니크 값으로 예외일 이름 으로 설정.
					result.id = result.name;
					// 스케줄 별 예외일에 따로 반복 요일은 설정 하지 않음.
					if(typeof result.repeat !== "undefined") delete result.repeat;
					value.push(result);
					this.set('value', value);
				},
				editHandler: function(e) {
					var result = e.result;
					var value = this.get('value');
					var newValue = [];

					value.forEach(function(exceptionDay) {
						if(exceptionDay.id == result.id) {
							if(result.name) result.id = result.name;
							else result.name = result.id;
							exceptionDay = result;
						}
						newValue.push(exceptionDay);
					});

					this.set('value', []);
					this.set('value', newValue);
				},
				deleteHandler: function(items) {
					var value = this.get('value');
					var deletedItemNames = [];
					var newValue = [];

					items.forEach(function(item){
						deletedItemNames.push(item.name);
					});

					value.forEach(function(exceptionDay){
						if(deletedItemNames.indexOf(exceptionDay.id) === -1) newValue.push(exceptionDay);
					});

					this.set('value', []);
					this.set('value', newValue);
				},
				closeHandler: function(e) { console.log(e); }
			},
			description: {
				validator: null,
				init: function() {
					var self = this;
					var maxLength = 300;
					self.validator = $($('#schedule-description').parent()).data("kendoCommonValidator");
					self.validator.bind('validateInput', function(e){
						MainViewModel.actions[ACTION_ENUM.SAVE].set('disabled', !e.valid);
					});
					self.validator.setOptions({
						messages: {
							maxLength: function() {
								return I18N.prop("COMMON_CANNOT_INPUT_MAX_MORE", maxLength);
							}
						},
						rules: {
							maxLength: function(e){
								var val = e.val().trim();
								return val.length <= maxLength;
							}
						}
					});
				},
				value: ''
			}
		},
		util: {
			generateConfigurationId: function(executionTimes, daysOfWeek){
				var res = '';
				executionTimes.forEach(function(executionTime){
					res += executionTime;
				});
				daysOfWeek.forEach(function(day){
					res += day;
				});
				return res;
			}
		}
	});

	MainViewModel.bind("change", function(e) {
		console.log("MainViewModel::Change");

		var scheduleName = this.dataFields.scheduleName;
		var description = this.dataFields.description;
		var nameValidator = scheduleName.validator;
		var descValidator = description.validator;

		if(e.field.indexOf("actions") != -1) return;

		var isValid = nameValidator !== null && description.validator !== null ? nameValidator.validate() && descValidator.validate() : false;
		if(e.field == "dataFields.scheduleName.value") {
			// validate 확인.
			MainViewModel.actions[ACTION_ENUM.SAVE].set('disabled', !isValid);
			if(MainViewModel.dataFields.scheduleName.value == "") MainViewModel.actions[ACTION_ENUM.SAVE].set('disabled', true);
		}

		if(e.field == "dataFields.description.value") {
			// validate 확인.
			MainViewModel.actions[ACTION_ENUM.SAVE].set('disabled', !isValid);
		}

		if(e.field == "dataFields.devices.value") {
			var selectedDevicesText = this.dataFields.devices.getSelectedNumText();
			this.dataFields.devices.set('selectedNumText', selectedDevicesText);
		}

		if(e.field.indexOf("dataFields.period") != -1) {
			var startDatePickerWidget = this.dataFields.period.startDatePicker.widget;
			var endDatePickerWidget = this.dataFields.period.endDatePicker.widget;
			var value = this.dataFields.period.get("value");
			var startDate = value.startDate, endDate = value.endDate;

			if(e.field == "dataFields.period.value") {
				var endDateYear = typeof endDate === 'object' ? endDate.getFullYear() : Number(endDate.split('-')[0]);
				if(endDateYear === MAX_END_DATE_YEAR) { // 무기한 인 경우,
					this.dataFields.period.set('checked', 'indefinitePeriod');
					startDatePickerWidget.value(new Date());
					endDatePickerWidget.value(moment(new Date()).add(1, "M").toDate());
					startDatePickerWidget.enable(false);
					endDatePickerWidget.enable(false);
				} else { // 무기한 이 아닌 경우,
					startDatePickerWidget.value(new Date(startDate));
					endDatePickerWidget.value(new Date(endDate));
					this.dataFields.period.set('checked', 'definitePeriod');
					startDatePickerWidget.enable(true);
					endDatePickerWidget.enable(true);
				}
			}

			if(e.field == "dataFields.period.checked") {
				var checked = this.dataFields.period.checked;
				if(checked == 'indefinitePeriod') {
					this.dataFields.period.value.set('startDate', new Date());
					this.dataFields.period.value.set('endDate', MAX_END_DATE);
				} else {
					this.dataFields.period.value.set('startDate', moment(startDatePickerWidget.value()).format('YYYY-MM-DD'));
					this.dataFields.period.value.set('endDate', moment(endDatePickerWidget.value()).format('YYYY-MM-DD'));
				}
			}
		}

		if(e.field.indexOf("dataFields.timeAndOperationSettings") != -1) {
			var timeAndOperationSettings = this.dataFields.timeAndOperationSettings;
			var oneDayTimePicker = timeAndOperationSettings.oneDayTimePicker;
			var repeatDate = timeAndOperationSettings.repeatDate;
			var operationSettings = timeAndOperationSettings.operationSettings;
			var timeSettingList = timeAndOperationSettings.timeSettingList;
			var value = timeAndOperationSettings.get('value');

			if(e.field.indexOf("dataFields.timeAndOperationSettings.value") != -1) {
				timeSettingList.setData(value);
				timeSettingList.deleteButton.set('disabled', true);
				operationSettings.tab.activeTabInit();
			}

			if(e.field.indexOf("dataFields.timeAndOperationSettings.timeSettingList.checkedData") != -1) {
				var checkedData = timeSettingList.get('checkedData');
				var action = e.action; // checkedDataItem 의 viewModel 변경으로 인해 checkedData 가 변경 된 경우
				if(action == "itemchange") return;

				console.log('checkedData');
				console.log(checkedData);

				oneDayTimePicker.setData(checkedData);
				repeatDate.setData(checkedData);
				operationSettings.setData(checkedData);
			}
		}

		if(e.field.indexOf("dataFields.exceptionDayList.value") != -1) {
			var exceptionDayList = this.dataFields.exceptionDayList;
			var value = exceptionDayList.get("value");
			exceptionDayList.setData(value);
		}

	});

	var createRepeatDateViewModel = function() {
		var repeatDateViewModel = kendo.observable({
			init: function() {
				var daysOfWeek = this.get('daysOfWeek');
				var daysOfWeekDisabled = this.get('daysOfWeekDisabled');
				var daysOfWeekNotEqualed = this.get('daysOfWeekNotEqualed');
				var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

				days.forEach(function(day){
					daysOfWeek[day] = false;
					daysOfWeekDisabled[day] = false;
					daysOfWeekNotEqualed[day] = false;
				});
				this.set('daysOfWeek', daysOfWeek);
				this.set('daysOfWeekDisabled',daysOfWeekDisabled);
				this.set('daysOfWeekNotEqualed', daysOfWeekNotEqualed);
			},
			all: {
				checked: false,
				checkedNotEqualed: false,
				disabled: false,
				changeHandler: function(e) {
					var checked = this.all.checked;
					if(checked) this.checkAll();
					else this.unCheckAll();
				}
			},
			daysOfWeek : {
				mon : false,
				tue : false,
				wed : false,
				thu : false,
				fri : false,
				sat : false,
				sun : false
			},
			daysOfWeekDisabled : {
				mon : false,
				tue : false,
				wed : false,
				thu : false,
				fri : false,
				sat : false,
				sun : false
			},
			daysOfWeekNotEqualed: {
				mon : false,
				tue : false,
				wed : false,
				thu : false,
				fri : false,
				sat : false,
				sun : false
			},
			daysOfWeekChangeHandler: function(e) {
				var self = this;
				var isAllChecked = true;
				var hasNotEqualedDay = false;
				var keyNames = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

				if(e) {
					var target = e.target;
					var id = target.id;
					var checked = $(target).prop('checked');
					if(self.daysOfWeekNotEqualed.get(id)) {
						if(!checked) self.daysOfWeek.set(id, true);
						self.daysOfWeekNotEqualed.set(id, false);
					}
				}

				keyNames.forEach(function(day) {
					if(self.daysOfWeekNotEqualed[day]) hasNotEqualedDay = true;
				});

				if(isAllChecked && hasNotEqualedDay)
					this.set('all.checkedNotEqualed', true);
				if(isAllChecked && !hasNotEqualedDay)
					this.set('all.checkedNotEqualed', false);


				// 전체 선택 체크 버튼 상태 업데이트.
				keyNames.forEach(function(day) {
					if(!self.daysOfWeek[day]) isAllChecked = false;
				});
				this.set('all.checked', isAllChecked);

				// 시간 운영 설정 초기화 버튼 상태 업데이트
				OperationViewModel.operation.confirm.clear.setEnabled();
				MainViewModel.dataFields.timeAndOperationSettings.repeatDate._renderTemplate();
			},
			checkAll : function () {
				this._setAllChekced(true);
				MainViewModel.dataFields.timeAndOperationSettings.repeatDate._renderTemplate();
				OperationViewModel.operation.confirm.clear.setEnabled();
			},
			unCheckAll : function() {
				this._setAllChekced(false);
				MainViewModel.dataFields.timeAndOperationSettings.repeatDate._renderTemplate();
				OperationViewModel.operation.confirm.clear.setEnabled();
			},
			_setAllChekced: function (isChecked) {
				var self = this;
				var allCheckedNotEqualed = self.get('all.checkedNotEqualed');
				var daysOfWeek = self.get('daysOfWeek');
				var daysOfWeekNotEqualed = self.get('daysOfWeekNotEqualed');

				var keyNames = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

				// all 채크 상태가 동일 하지 않은 상태 (notEqualed) 에서, all 체크 박스가 체크 된 상태.
				if(allCheckedNotEqualed && !isChecked) {
					self.set('all.checked', true);
					isChecked = true;
				}

				self.set('all.checkedNotEqualed', false);
				keyNames.forEach(function(day){
					daysOfWeekNotEqualed.set(day, false);
				});
				self.set('daysOfWeekNotEqualed', daysOfWeekNotEqualed);

				keyNames.forEach(function(day) {
					daysOfWeek.set(day, false);
					daysOfWeek.set(day, isChecked);
				});
				self.set('daysOfWeek', daysOfWeek);

			},
			_applyData: function(data) {
				var self = this;
				data.forEach(function(day){
					self.daysOfWeek.set(day.toLowerCase(), true);
				});
			},
			_getData: function() {
				var self = this;
				var daysOfWeek = self.get('daysOfWeek');
				var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
				var res = [];

				days.forEach(function(day) {
					if(daysOfWeek[day]) {
						res.push(day[0].toUpperCase() + day.slice(1));
					}
				});
				return res;
			}
		});
		return repeatDateViewModel;
	};

	var RepeatDateViewModel = createRepeatDateViewModel();

	var isFahrenheit = (unitType == "Fahrenheit") ? true : false;

	var INDOOR_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	var INDOOR_MIN = isFahrenheit ? 64 : 18;
	var INDOOR_MAX = isFahrenheit ? 86 : 30;

	var INDOOR_WATER_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	var INDOOR_WATER_MIN = isFahrenheit ? 59 : 15;
	var INDOOR_WATER_MAX = isFahrenheit ? 176 : 80;

	var DHW_DESIRED = isFahrenheit ? Util.getFahrenheit(40) : 40;
	var DHW_MIN = isFahrenheit ? Util.getFahrenheit(5) : 5;
	var DHW_MAX = isFahrenheit ? Util.getFahrenheit(85) : 85;

	var PRE_DESIRED = isFahrenheit ? Util.getFahrenheit(24) : 24;
	var PRE_HEATING_MIN = isFahrenheit ? Util.getFahrenheit(16) : 16;
	var PRE_COOLING_MIN = isFahrenheit ? Util.getFahrenheit(16) : 18;
	var PRE_MAX = isFahrenheit ? Util.getFahrenheit(30) : 30;


	var operation_default_values = {
		INDOOR_DESIRED: INDOOR_DESIRED,
		INDOOR_MIN: INDOOR_MIN,
		INDOOR_MAX: INDOOR_MAX,
		INDOOR_WATER_DESIRED: INDOOR_WATER_DESIRED,
		INDOOR_WATER_MIN: INDOOR_WATER_MIN,
		INDOOR_WATER_MAX: INDOOR_WATER_MAX,
		DHW_DESIRED: DHW_DESIRED,
		DHW_MIN: DHW_MIN,
		DHW_MAX: DHW_MAX,
		PRE_DESIRED: PRE_DESIRED,
		PRE_HEATING_MIN: PRE_HEATING_MIN,
		PRE_COOLING_MIN: PRE_COOLING_MIN,
		PRE_MAX: PRE_MAX
	};


	var createOperationViewModel = function() {

		var operationViewModel = kendo.observable({
			operation : {
				indoor : {
					init : function(){
						var indoor = this;
						indoor.power.set("disabled", false);
						indoor.power.set('checkedNotEqualed', false);
						indoor.power.set("checked", false);
						indoor.power.set("activeNotEqualed", false);
						indoor.power.set("active", false);
						indoor.operation.set('checkedNotEqualed', false);
						indoor.operation.set("checked", false);
						indoor.operation.set("active", false);
						var mode, modes = indoor.operation.mode;
						var i, max = modes.length;
						for( i = 0; i < max; i++ ){
							mode = modes[i];
							mode.set("active", false);
						}
						indoor.temperature.set('checkedNotEqualed', false);
						indoor.temperature.set("checked", false);
						indoor.temperature.set("desired", INDOOR_DESIRED);
						indoor.temperature.set("unit", unit);
						indoor.temperature.set("step", step);
						indoor.waterTemp.set('checkedNotEqualed', false);
						indoor.waterTemp.set("checked", false);
						indoor.waterTemp.set("desired", INDOOR_WATER_DESIRED);
						indoor.waterTemp.set("unit", unit);
						indoor.waterTemp.set("step", step);

						//이전 선택 값 초기화
						var key;
						var beforeValue = indoor.power.beforeValue;
						for( key in beforeValue ){
							beforeValue[key] = null;
						}
						// 값 중복 표시시, wrapper 에 걸어둔 이벤트 제거
						var indoorTempWidget = $('#indoor-temp').data('kendoCustomNumericBox');
						var indoorWaterTempWidget = $('#indoor-water-temp').data('kendoCustomNumericBox');
						if(typeof indoorTempWidget !== 'undefined' && typeof indoorWaterTempWidget !== 'undefined') {
							$(indoorTempWidget.wrapper).unbind('click');
							$(indoorWaterTempWidget.wrapper).unbind('click');
						}
					},
					setDisabled : function(){
						var indoor = this;
						indoor.init();
						indoor.power.set("disabled", true);
					},
					power : {
						disabled : false,
						checked : false,
						active : false,
						text: function(){
							return OperationPowerText.call(this);
						},
						click : function(){
							var indoor = this.operation.indoor;
							var isActive = indoor.power.get("active");
							indoor.power.set("active", !isActive);
						},
						beforeValue : {
							powerActive : null,
							operationChecked : null,
							auto : null,
							cool : null,
							heat : null,
							dry : null,
							fan : null,
							coolSt : null,
							hotWater : null,
							waterChecked : null,
							temperChecked : null
						},
						checkClick : function(e){
							var indoor = this.operation.indoor;
							var beforeValue = indoor.power.beforeValue;
							var target = $(e.target);
							var checked = target.prop("checked");
							if(checked){
								if(beforeValue.powerActive !== null){
									indoor.power.set("active", beforeValue.powerActive);
									beforeValue.powerActive = null;
								}else{      //선택했던 값이 없으면 Default
									indoor.power.set("active", true);
								}

								if(beforeValue.operationChecked !== null){
									indoor.operation.set("checked", beforeValue.operationChecked);
									beforeValue.operationChecked = null;
								}else{      //선택했던 값이 없으면 Default
									indoor.operation.set("checked", true);
								}

								var hasMode = false;
								if(beforeValue.auto !== null){
									indoor.operation.mode[0].set("active", beforeValue.auto);
									hasMode = true;
									beforeValue.auto = null;
								}
								if(beforeValue.cool !== null){
									indoor.operation.mode[1].set("active", beforeValue.cool);
									hasMode = true;
									beforeValue.cool = null;
								}
								if(beforeValue.heat !== null){
									indoor.operation.mode[2].set("active", beforeValue.heat);
									hasMode = true;
									beforeValue.heat = null;
								}
								if(beforeValue.dry !== null){
									indoor.operation.mode[3].set("active", beforeValue.dry);
									hasMode = true;
									beforeValue.dry = null;
								}
								if(beforeValue.fan !== null){
									indoor.operation.mode[4].set("active", beforeValue.fan);
									hasMode = true;
									beforeValue.fan = null;
								}
								if(beforeValue.coolSt !== null){
									indoor.operation.mode[5].set("active", beforeValue.coolSt);
									hasMode = true;
									beforeValue.coolSt = null;
								}
								if(beforeValue.hotWater !== null){
									indoor.operation.mode[6].set("active", beforeValue.hotWater);
									hasMode = true;
									beforeValue.hotWater = null;
								}

								if(!hasMode){
									indoor.operation.mode[0].set("active", true);
								}

								if(beforeValue.temperChecked !== null){
									indoor.temperature.set("checkedNotEqualed", false);
									indoor.temperature.set("checked", beforeValue.temperChecked);
									beforeValue.temperChecked = null;
								}else{      //선택했던 값이 없으면 Default
									indoor.temperature.set("checked", true);
								}
								if(beforeValue.waterChecked !== null){
									indoor.waterTemp.set("checkedNotEqualed", false);
									indoor.waterTemp.set("checked", beforeValue.waterChecked);
									beforeValue.waterChecked = null;
								}else{      //선택했던 값이 없으면 Default
									indoor.waterTemp.set("checked", true);
								}
							}else{
								beforeValue.powerActive = indoor.power.get("active");
								if(indoor.power.get("active")){
									indoor.power.set("active", false);
								}
								beforeValue.operationChecked = indoor.operation.get("checked");
								beforeValue.auto = indoor.operation.mode[0].get("active");
								beforeValue.cool = indoor.operation.mode[1].get("active");
								beforeValue.heat = indoor.operation.mode[2].get("active");
								beforeValue.dry = indoor.operation.mode[3].get("active");
								beforeValue.fan = indoor.operation.mode[4].get("active");
								beforeValue.coolSt = indoor.operation.mode[5].get("active");
								beforeValue.hotWater = indoor.operation.mode[6].get("active");
								if(indoor.operation.get("checked")){
									indoor.operation.set("checkedNotEqualed", false);
									indoor.operation.set("checked", false);
									indoor.operation.mode[0].set("active", false);
									indoor.operation.mode[1].set("active", false);
									indoor.operation.mode[2].set("active", false);
									indoor.operation.mode[4].set("active", false);
									indoor.operation.mode[5].set("active", false);
									indoor.operation.mode[6].set("active", false);
								}

								beforeValue.temperChecked = indoor.temperature.get("checked");
								if(indoor.temperature.get("checked")){
									indoor.temperature.set('checkedNotEqualed', false);
									indoor.temperature.set("checked", false);
								}
								beforeValue.waterChecked = indoor.waterTemp.get("checked");
								if(indoor.waterTemp.get("checked")){
									indoor.waterTemp.set("checkedNotEqualed", false);
									indoor.waterTemp.set("checked", false);
								}
							}
						}
					},
					operation : {
						checked : false,
						active : false,
						checkClick : function(e){
							var target = $(e.target);
							var checked = target.prop("checked");
							var indoor = this.operation.indoor;
							var beforeValue = indoor.power.beforeValue;
							var mode = indoor.operation.mode;
							if(checked){
								if(beforeValue.auto !== null){
									indoor.operation.mode[0].set("active", beforeValue.auto);
									beforeValue.auto = null;
								}
								if(beforeValue.cool !== null){
									indoor.operation.mode[1].set("active", beforeValue.cool);
									beforeValue.cool = null;
								}
								if(beforeValue.heat !== null){
									indoor.operation.mode[2].set("active", beforeValue.heat);
									beforeValue.heat = null;
								}
								if(beforeValue.dry !== null){
									indoor.operation.mode[3].set("active", beforeValue.dry);
									beforeValue.dry = null;
								}
								if(beforeValue.fan !== null){
									indoor.operation.mode[4].set("active", beforeValue.fan);
									beforeValue.fan = null;
								}
								if(beforeValue.coolSt !== null){
									indoor.operation.mode[5].set("active", beforeValue.coolSt);
									beforeValue.coolSt = null;
								}
								if(beforeValue.hotWater !== null){
									indoor.operation.mode[6].set("active", beforeValue.hotWater);
									beforeValue.hotWater = null;
								}
							}else{
								beforeValue.auto = mode[0].get("active");
								beforeValue.cool = mode[1].get("active");
								beforeValue.heat = mode[2].get("active");
								beforeValue.dry = mode[3].get("active");
								beforeValue.fan = mode[4].get("active");
								beforeValue.coolSt = mode[5].get("active");
								beforeValue.hotWater = mode[6].get("active");
								if(mode[0].get("active")){
									mode[0].set("active", false);
								}
								if(mode[1].get("active")){
									mode[1].set("active", false);
								}
								if(mode[2].get("active")){
									mode[2].set("active", false);
								}
								if(mode[3].get("active")){
									mode[3].set("active", false);
								}
								if(mode[4].get("active")){
									mode[4].set("active", false);
								}
								if(mode[5].get("active")){
									mode[5].set("active", false);
								}
								if(mode[6].get("active")){
									mode[6].set("active", false);
								}
								if(indoor.temperature.get("checked")){
									indoor.temperature.set("checked", false);
								}
								if(indoor.waterTemp.get("checked")){
									indoor.waterTemp.set("checked", false);
								}
							}
						},
						mode : [
							{
								active : false,
								name : "Auto",
								click : function(){
									var indoor = this.operation.indoor;
									var oper = indoor.operation;
									var mode = oper.mode;
									var isActive = mode[0].get("active");
									mode[0].set("active", !isActive);
									mode[1].set("active", false);
									mode[2].set("active", false);
									mode[3].set("active", false);
									mode[4].set("active", false);
									mode[5].set("active", false);
									mode[6].set("active", false);
									indoor.checkTempActive(isActive);
									if(!isActive){
										mode[0].setIndoorMinMax();
									}
								},
								setIndoorMinMax : function() {
									var indoor = this.parent().parent().parent().parent().indoor;
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 59 : 15;
									max = isFahrenheit ? 176 : 80;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							},
							{
								active : false,
								name : "Cool",
								click : function(){
									var indoor = this.operation.indoor;
									var oper = indoor.operation;
									var mode = oper.mode;
									var isActive = mode[1].get("active");
									mode[1].set("active", !isActive);
									mode[0].set("active", false);
									mode[2].set("active", false);
									mode[3].set("active", false);
									mode[4].set("active", false);
									mode[5].set("active", false);
									mode[6].set("active", false);
									indoor.checkTempActive(isActive);
									if(!isActive){
										mode[1].setIndoorMinMax();
									}
								},
								setIndoorMinMax: function(){
									var indoor = this.parent().parent().parent().parent().indoor;
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 14 : -10;
									max = isFahrenheit ? 77 : 25;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							},
							{
								active : false,
								name : "Heat",
								click : function(){
									var indoor = this.operation.indoor;
									var oper = indoor.operation;
									var mode = oper.mode;
									var isActive = mode[2].get("active");
									mode[2].set("active", !isActive);
									mode[0].set("active", false);
									mode[1].set("active", false);
									mode[3].set("active", false);
									mode[4].set("active", false);
									mode[5].set("active", false);
									mode[6].set("active", false);
									indoor.checkTempActive(isActive);
									if(!isActive){
										mode[2].setIndoorMinMax();
									}
								},
								setIndoorMinMax: function() {
									var indoor = this.parent().parent().parent().parent().indoor;
									var min = isFahrenheit ? 61 : 16;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 59 : 15;
									max = isFahrenheit ? 176 : 80;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							},
							{
								active : false,
								name : "Dry",
								click : function(){
									var indoor = this.operation.indoor;
									var oper = indoor.operation;
									var mode = oper.mode;
									var isActive = mode[3].get("active");
									mode[3].set("active", !isActive);
									mode[0].set("active", false);
									mode[1].set("active", false);
									mode[2].set("active", false);
									mode[4].set("active", false);
									mode[5].set("active", false);
									mode[6].set("active", false);
									indoor.checkTempActive(isActive);
									if(!isActive){
										mode[3].setIndoorMinMax();
									}
								},
								setIndoorMinMax: function() {
									var indoor = this.parent().parent().parent().parent().indoor;
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 59 : 15;
									max = isFahrenheit ? 176 : 80;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							},
							{
								active : false,
								name : "Fan",
								click : function(){
									var indoor = this.operation.indoor;
									var oper = indoor.operation;
									var mode = oper.mode;
									var isActive = mode[4].get("active");
									mode[4].set("active", !isActive);
									mode[0].set("active", false);
									mode[1].set("active", false);
									mode[2].set("active", false);
									mode[3].set("active", false);
									mode[5].set("active", false);
									mode[6].set("active", false);
									indoor.checkTempActive(!isActive);
								}
							},
							{
								active : false,
								name : "CoolStorage",
								click : function(){
									var indoor = this.operation.indoor;
									var oper = this.operation.indoor.operation;
									var mode = oper.mode;
									var isActive = mode[5].get("active");
									mode[5].set("active", !isActive);
									mode[0].set("active", false);
									mode[2].set("active", false);
									mode[1].set("active", false);
									mode[3].set("active", false);
									mode[4].set("active", false);
									mode[6].set("active", false);
									indoor.checkTempActive(isActive);
									if(!isActive){
										mode[5].setIndoorMinMax();
									}
								},
								setIndoorMinMax: function() {
									var indoor = this.parent().parent().parent().parent().indoor;
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 14 : -10;
									max = isFahrenheit ? 77 : 25;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							},
							{
								active : false,
								name : "HeatStorage",
								click : function(){
									var indoor = this.operation.indoor;
									var oper = indoor.operation;
									var mode = oper.mode;
									var isActive = mode[6].get("active");
									mode[6].set("active", !isActive);
									mode[0].set("active", false);
									mode[1].set("active", false);
									mode[2].set("active", false);
									mode[3].set("active", false);
									mode[4].set("active", false);
									mode[5].set("active", false);
									indoor.checkTempActive(isActive);
									if(!isActive){
										mode[6].setIndoorMinMax();
									}
								},
								setIndoorMinMax: function() {
									var indoor = this.parent().parent().parent().parent().indoor;
									var min = isFahrenheit ? 64 : 18;
									var max = isFahrenheit ? 86 : 30;
									indoor.temperature.set("min", min);
									indoor.temperature.set("max", max);
									min = isFahrenheit ? 59 : 15;
									max = isFahrenheit ? 176 : 80;
									indoor.waterTemp.set("min", min);
									indoor.waterTemp.set("max", max);
								}
							}

						]
					},
					checkTempActive : function(isActive){
						var indoor = this;
						indoor.temperature.set('checkedNotEqualed', false);
						indoor.waterTemp.set('checkedNotEqualed', false);
						if(isActive){
							if(indoor.temperature.get("checked")){
								indoor.temperature.set("checked", false);
							}
							if(indoor.waterTemp.get("checked")){
								indoor.waterTemp.set("checked", false);
							}
						}
					},
					temperature : {
						checked : false,
						desired : INDOOR_DESIRED,
						min : INDOOR_MIN,   //Device Temperatures 정보에서 계산
						max : INDOOR_MAX,
						unit : unit,
						step : step
					},
					waterTemp : {
						checked : false,
						desired : INDOOR_DESIRED,
						min : INDOOR_WATER_MIN,   //Device Temperatures 정보에서 계산
						max : INDOOR_WATER_MAX,
						unit : unit,
						step : step
					}
				},
				ventilator : {
					init : function(){
						var ventilator = this;
						ventilator.power.set("disabled", false);
						ventilator.power.set("checkedNotEqualed", false);
						ventilator.power.set("checked", false);
						ventilator.power.set("activeNotEqualed", false);
						ventilator.power.set("active", false);
						ventilator.operation.set("checkedNotEqualed", false);
						ventilator.operation.set("checked", false);
						ventilator.operation.mode[0].set("active", false);
						ventilator.operation.mode[1].set("active", false);
						ventilator.operation.mode[2].set("active", false);
						ventilator.operation.mode[3].set("active", false);
						//이전 선택 값 초기화
						var key;
						var beforeValue = ventilator.power.beforeValue;
						for( key in beforeValue ){
							beforeValue[key] = null;
						}
					},
					setDisabled : function(){
						var ventilator = this;
						ventilator.init();
						ventilator.power.set("disabled", true);
					},
					power : {
						disabled : false,
						checked : false,
						active : false,
						text: function(){
							return OperationPowerText.call(this);
						},
						click : function(){
							var isActive = this.operation.ventilator.power.get("active");
							this.operation.ventilator.power.set("active", !isActive);
						},
						beforeValue : {
							powerActive : null,
							operationChecked : null,
							auto : null,
							heatex : null,
							bypass : null,
							sleep : null
						},
						checkClick : function(e){
							var ventilator = this.operation.ventilator;
							var beforeValue = ventilator.power.beforeValue;
							var target = $(e.target);
							var checked = target.prop("checked");
							if(checked){
								if(beforeValue.powerActive !== null){
									ventilator.power.set("active", beforeValue.powerActive);
									beforeValue.powerActive = null;
								}else{      //선택했던 값이 없으면 Default
									ventilator.power.set("active", true);
								}
								if(beforeValue.operationChecked !== null){
									ventilator.operation.set("checked", beforeValue.operationChecked);
									beforeValue.operationChecked = null;
								}else{      //선택했던 값이 없으면 Default
									ventilator.operation.set("checked", true);
								}

								var hasMode = false;

								if(beforeValue.auto !== null){
									ventilator.operation.mode[0].set("active", beforeValue.auto);
									hasMode = true;
									beforeValue.auto = null;
								}
								if(beforeValue.heatex !== null){
									ventilator.operation.mode[1].set("active", beforeValue.heatex);
									hasMode = true;
									beforeValue.heatex = null;
								}
								if(beforeValue.bypass !== null){
									ventilator.operation.mode[2].set("active", beforeValue.bypass);
									hasMode = true;
									beforeValue.bypass = null;
								}
								if(beforeValue.sleep !== null){
									ventilator.operation.mode[3].set("active", beforeValue.sleep);
									hasMode = true;
									beforeValue.sleep = null;
								}
								//선택했던 값이 없으면 Default
								if(!hasMode){
									ventilator.operation.mode[0].set("active", true);
								}

							}else{
								beforeValue.powerActive = ventilator.power.get("active");
								if(ventilator.power.get("active")){
									ventilator.power.set("active", false);
								}
								beforeValue.operationChecked = ventilator.operation.get("checked");
								beforeValue.auto = ventilator.operation.mode[0].get("active");
								beforeValue.heatex = ventilator.operation.mode[1].get("active");
								beforeValue.bypass = ventilator.operation.mode[2].get("active");
								beforeValue.sleep = ventilator.operation.mode[3].get("active");
								if(ventilator.operation.get("checked")){
									ventilator.operation.set("checkedNotEqualed", false);
									ventilator.operation.set("checked", false);
									ventilator.operation.mode[0].set("active", false);
									ventilator.operation.mode[1].set("active", false);
									ventilator.operation.mode[2].set("active", false);
									ventilator.operation.mode[3].set("active", false);
								}
							}
						}
					},
					operation : {
						active : false,
						checked : false,
						checkClick : function(e){
							var target = $(e.target);
							var checked = target.prop("checked");
							var ventilator = this.operation.ventilator;
							var beforeValue = ventilator.power.beforeValue;
							if(checked){
								if(beforeValue.auto !== null){
									ventilator.operation.mode[0].set("active", beforeValue.auto);
									beforeValue.auto = null;
								}
								if(beforeValue.heatex !== null){
									ventilator.operation.mode[1].set("active", beforeValue.heatex);
									beforeValue.heatex = null;
								}
								if(beforeValue.bypass !== null){
									ventilator.operation.mode[2].set("active", beforeValue.bypass);
									beforeValue.bypass = null;
								}
								if(beforeValue.sleep !== null){
									ventilator.operation.mode[3].set("active", beforeValue.sleep);
									beforeValue.sleep = null;
								}
							}else{
								var mode = ventilator.operation.mode;
								beforeValue.auto = mode[0].get("active");
								beforeValue.heatex = mode[1].get("active");
								beforeValue.bypass = mode[2].get("active");
								beforeValue.sleep = mode[3].get("active");
								if(mode[0].get("active")){
									mode[0].set("active", false);
								}
								if(mode[1].get("active")){
									mode[1].set("active", false);
								}
								if(mode[2].get("active")){
									mode[2].set("active", false);
								}
								if(mode[3].get("active")){
									mode[3].set("active", false);
								}
							}
						},
						mode : [
							{
								active : false,
								name : "Auto",
								click : function(){
									var mode = this.operation.ventilator.operation.mode;
									var isActive = mode[0].get("active");
									mode[0].set("active", !isActive);
									mode[1].set("active", false);
									mode[2].set("active", false);
									mode[3].set("active", false);
								}
							},
							{
								active : false,
								name : "HeatEx",
								click : function(){
									var mode = this.operation.ventilator.operation.mode;
									var isActive = mode[1].get("active");
									mode[1].set("active", !isActive);
									mode[0].set("active", false);
									mode[2].set("active", false);
									mode[3].set("active", false);
								}
							},
							{
								active : false,
								name : "Bypass",
								click : function(){
									var mode = this.operation.ventilator.operation.mode;
									var isActive = mode[2].get("active");
									mode[2].set("active", !isActive);
									mode[0].set("active", false);
									mode[1].set("active", false);
									mode[3].set("active", false);
								}
							},
							{
								active : false,
								name : "Sleep",
								click : function(){
									var mode = this.operation.ventilator.operation.mode;
									var isActive = mode[3].get("active");
									mode[3].set("active", !isActive);
									mode[0].set("active", false);
									mode[1].set("active", false);
									mode[2].set("active", false);
								}
							}
						]
					}
				},
				dhw : {
					init : function(){
						var dhw = this;
						dhw.power.set("disabled", false);
						dhw.power.set("checkedNotEqualed", false);
						dhw.power.set("checked", false);
						dhw.power.set("active", false);
						dhw.operation.set("checkedNotEqualed", false);
						dhw.operation.set("checked", false);
						dhw.operation.mode[0].set("active", false);
						dhw.operation.mode[1].set("active", false);
						dhw.operation.mode[2].set("active", false);
						dhw.operation.mode[3].set("active", false);
						dhw.temperature.set("checkedNotEqualed", false);
						dhw.temperature.set("checked", false);
						dhw.temperature.set("desired", DHW_DESIRED);
						dhw.temperature.set("unit", unit);
						dhw.temperature.set("step", step);
						//이전 선택 값 초기화
						var key;
						var beforeValue = dhw.power.beforeValue;
						for( key in beforeValue ){
							beforeValue[key] = null;
						}
						// 값 중복 표시시, wrapper 에 걸어둔 이벤트 제거
						var dhwTempWidget = $('#dhw-temp').data('kendoCustomNumericBox');
						if(typeof dhwTempWidget !== 'undefined') {
							$(dhwTempWidget.wrapper).unbind('click');
						}
					},
					setDisabled : function(){
						var dhw = this;
						dhw.init();
						dhw.power.set("disabled", true);
					},
					power : {
						disabled : false,
						checked : false,
						active : false,
						text: function(){
							return OperationPowerText.call(this);
						},
						click : function(){
							var isActive = this.operation.dhw.power.get("active");
							this.operation.dhw.power.set("active", !isActive);
						},
						beforeValue : {
							powerActive : null,
							operationChecked : null,
							eco : null,
							standard : null,
							power : null,
							force : null,
							temperChecked : null
						},
						checkClick : function(e){
							var dhw = this.operation.dhw;
							var beforeValue = dhw.power.beforeValue;
							var target = $(e.target);
							var checked = target.prop("checked");
							if(checked){
								if(beforeValue.powerActive !== null){
									dhw.power.set("active", beforeValue.powerActive);
									beforeValue.powerActive = null;
								}else{      //선택했던 값이 없으면 Default
									dhw.power.set("active", true);
								}
								if(beforeValue.operationChecked !== null){
									dhw.operation.set("checked", beforeValue.operationChecked);
									beforeValue.operationChecked = null;
								}else{      //선택했던 값이 없으면 Default
									dhw.operation.set("checked", true);
								}

								var hasMode = false;
								if(beforeValue.eco !== null){
									dhw.operation.mode[0].set("active", beforeValue.eco);
									hasMode = true;
									beforeValue.eco = null;
								}
								if(beforeValue.standard !== null){
									dhw.operation.mode[1].set("active", beforeValue.standard);
									hasMode = true;
									beforeValue.standard = null;
								}
								if(beforeValue.power !== null){
									dhw.operation.mode[2].set("active", beforeValue.power);
									hasMode = true;
									beforeValue.power = null;
								}
								if(beforeValue.force !== null){
									dhw.operation.mode[3].set("active", beforeValue.force);
									hasMode = true;
									beforeValue.force = null;
								}

								if(!hasMode){
									dhw.operation.mode[1].set("active", true);
								}

								if(beforeValue.temperChecked !== null){
									dhw.temperature.set("checked", beforeValue.temperChecked);
									beforeValue.temperChecked = null;
								}else{      //선택했던 값이 없으면 Default
									dhw.temperature.set("checked", true);
								}
							}else{
								beforeValue.powerActive = dhw.power.get("active");
								if(dhw.power.get("active")){
									dhw.power.set("active", false);
								}
								beforeValue.operationChecked = dhw.operation.get("checked");
								beforeValue.eco = dhw.operation.mode[0].get("active");
								beforeValue.standard = dhw.operation.mode[1].get("active");
								beforeValue.power = dhw.operation.mode[2].get("active");
								beforeValue.force = dhw.operation.mode[3].get("active");
								if(dhw.operation.get("checked")){
									dhw.operation.set("checkedNotEqualed", false);
									dhw.operation.set("checked", false);
									dhw.operation.mode[0].set("active", false);
									dhw.operation.mode[1].set("active", false);
									dhw.operation.mode[2].set("active", false);
									dhw.operation.mode[3].set("active", false);
								}
								beforeValue.temperChecked = dhw.temperature.get("checked");
								if(dhw.temperature.get("checked")){
									dhw.temperature.set("checkedNotEqualed", false);
									dhw.temperature.set("checked", false);
								}
							}
						}
					},
					operation : {
						active : false,
						checked : false,
						checkClick : function(e){
							var target = $(e.target);
							var checked = target.prop("checked");

							var dhw = this.operation.dhw;
							var beforeValue = dhw.power.beforeValue;
							if(checked){
								if(beforeValue.eco !== null){
									dhw.operation.mode[0].set("active", beforeValue.eco);
									beforeValue.eco = null;
								}
								if(beforeValue.standard !== null){
									dhw.operation.mode[1].set("active", beforeValue.standard);
									beforeValue.standard = null;
								}
								if(beforeValue.power !== null){
									dhw.operation.mode[2].set("active", beforeValue.power);
									beforeValue.power = null;
								}
								if(beforeValue.force !== null){
									dhw.operation.mode[3].set("active", beforeValue.force);
									beforeValue.force = null;
								}
							}else{
								var mode = dhw.operation.mode;
								beforeValue.operationChecked = dhw.operation.get("checked");
								beforeValue.eco = dhw.operation.mode[0].get("active");
								beforeValue.standard = dhw.operation.mode[1].get("active");
								beforeValue.power = dhw.operation.mode[2].get("active");
								beforeValue.force = dhw.operation.mode[3].get("active");
								if(mode[0].get("active")){
									mode[0].set("active", false);
								}
								if(mode[1].get("active")){
									mode[1].set("active", false);
								}
								if(mode[2].get("active")){
									mode[2].set("active", false);
								}
								if(mode[3].get("active")){
									mode[3].set("active", false);
								}
								if(dhw.temperature.get("checked")){
									dhw.temperature.set("checked", false);
								}
							}
						},
						mode : [
							{
								active : false,
								name : "Eco",
								click : function(){
									var dhw = this.operation.dhw;
									var mode = dhw.operation.mode;
									var isActive = mode[0].get("active");
									mode[0].set("active", !isActive);
									mode[1].set("active", false);
									mode[2].set("active", false);
									mode[3].set("active", false);
									dhw.checkTempActive(isActive);
								}
							},
							{
								active : false,
								name : "Standard",
								click : function(){
									var dhw = this.operation.dhw;
									var mode = dhw.operation.mode;
									var isActive = mode[1].get("active");
									mode[1].set("active", !isActive);
									mode[0].set("active", false);
									mode[2].set("active", false);
									mode[3].set("active", false);
									dhw.checkTempActive(isActive);
								}
							},
							{
								active : false,
								name : "Power",
								click : function(){
									var dhw = this.operation.dhw;
									var mode = dhw.operation.mode;
									var isActive = mode[2].get("active");
									mode[2].set("active", !isActive);
									mode[0].set("active", false);
									mode[1].set("active", false);
									mode[3].set("active", false);
									dhw.checkTempActive(isActive);
								}
							},
							{
								active : false,
								name : "Force",
								click : function(){
									var dhw = this.operation.dhw;
									var mode = dhw.operation.mode;
									var isActive = mode[3].get("active");
									mode[3].set("active", !isActive);
									mode[0].set("active", false);
									mode[1].set("active", false);
									mode[2].set("active", false);
									dhw.checkTempActive(isActive);
								}
							}
						]
					},
					checkTempActive : function(isActive){
						var dhw = this;
						if(isActive){
							if(dhw.temperature.get("checked")){
								dhw.temperature.set("checked", false);
							}
						}
					},
					temperature : {
						checked : false,
						desired : DHW_DESIRED,
						min : DHW_MIN,   //Device Temperatures 정보에서 계산
						max : DHW_MAX,
						unit : unit,
						step : step
					}
				},
				remoteControl : {
					disabled : false,
					checked : false,
					init : function(){
						var remoteControl = this;
						remoteControl.set("disabled", false);
						remoteControl.set("checkedNotEqualed", false);
						remoteControl.set("checked", false);
						remoteControl.control[0].set("active", false);
						remoteControl.control[1].set("active", false);
					},
					setDisabled : function(){
						var remoteControl = this;
						remoteControl.init();
						remoteControl.set("disabled", true);
					},
					checkClick : function(e){
						var target = $(e.target);
						var checked = target.prop("checked");
						var control = this.operation.remoteControl.control;
						if(checked) {
							control[0].set("active", true);
							control[1].set("active", false);
						} else {
							control[0].set("active", false);
							control[1].set("active", false);
						}

					},
					control : [
						{
							active : false,
							name : "Allowed",
							click : function(){
								var control = this.operation.remoteControl.control;
								var isActive = control[0].get("active");
								control[0].set("active", !isActive);
								control[1].set("active", false);
							}
						},
						{
							active : false,
							name : "NotAllowed",
							click : function(){
								var control = this.operation.remoteControl.control;
								var isActive = control[1].get("active");
								control[1].set("active", !isActive);
								control[0].set("active", false);
							}
						}
					]
				},
				point : {
					aoav : {
						disable : false,
						checked : false,
						value : "0.00",
						//32bit double min max
						min : -999999999.9,
						max : 999999999.9,
						decimals : 2,
						init : function(){
							var aoav = this;
							aoav.set("disabled", false);
							aoav.set("checkedNotEqualed", false);
							aoav.set("checked", false);
							aoav.set("value", "0.00");
						},
						setDisabled : function(){
							var aoav = this;
							aoav.init();
							aoav.set("disabled", true);
						}
					},
					dodv : {
						disable : false,
						checked : false,
						active : false,
						beforeValue : {
							active : null
						},
						text: function(){
							return OperationPowerText.call(this);
						},
						click : function(){
							var control = this.operation.point.dodv;
							var isActive = control.get("active");
							control.set("active", !isActive);
						},
						checkClick : function(e){
							var target = $(e.target);
							var checked = target.prop("checked");
							var control = this.operation.point.dodv;
							var beforeValue = control.beforeValue;
							if(checked){
								if(beforeValue.active !== null){
									control.set("active", beforeValue.active);
									beforeValue.active = null;
								}else{      //선택했던 값이 없으면 Default
									control.set("active", true);
								}
							}else{
								beforeValue.active = control.get("active");
								if(control.get("active")){
									control.set("active", false);
								}
							}
						},
						init : function(){
							var dodv = this;
							dodv.set("disabled", false);
							dodv.set("checkedNotEqualed", false);
							dodv.set("checked", false);
							dodv.set("active", false);
							//이전 선택 값 초기화
							var key;
							var beforeValue = dodv.beforeValue;
							for( key in beforeValue ){
								beforeValue[key] = null;
							}
							// 값 중복 표시시, wrapper 에 걸어둔 이벤트 제거
							var pointValueWidget = $('#point-value').data('kendoCustomNumericBox');
							if(typeof pointValueWidget !== 'undefined') {
								$(pointValueWidget.wrapper).unbind('click');
							}
						},
						setDisabled : function(){
							var dodv = this;
							dodv.init();
							dodv.set("disabled", true);
						}
					}
				},
				light : {
					disabled : false,
					power : {
						beforeValue : {
							active : null
						},
						disabled : false,
						checked : false,
						active : false,
						text: function(){
							return OperationPowerText.call(this);
						},
						click : function(){
							var light = this.operation.light;
							var isActive = light.power.get("active");
							light.power.set("active", !isActive);
						},
						checkClick : function(e){
							var target = $(e.target);
							var checked = target.prop("checked");
							var light = this.operation.light;
							var beforeValue = light.power.beforeValue;
							if(checked){
								if(beforeValue.active !== null){
									light.power.set("active", beforeValue.active);
									beforeValue.active = null;
								}else{      //선택했던 값이 없으면 Default
									light.power.set("active", true);
								}
							}else{
								beforeValue.active = light.power.get("active");
								if(light.power.get("active")){
									light.power.set("active", false);
								}
							}
						}
					},
					checked : false,
					value : 50,
					slide : function(e){
						var light = this.operation.light;
						light.set("value", e.value);
					},
					init : function(){
						var light = this;
						light.power.set("active", false);
						light.power.set("checkedNotEqualed", false);
						light.power.set("checked", false);
						light.set("checkedNotEqualed", false);
						light.set("checked", false);
						light.set("disabled", false);
						light.set("value", 50);

						//이전 선택 값 초기화
						var key;
						var beforeValue = light.power.beforeValue;
						for( key in beforeValue ){
							beforeValue[key] = null;
						}
					},
					setDisabled : function(){
						var light = this;
						light.init();
						light.set("disabled", true);
					}
				},
				pre : {
					disable : false,
					checked : false,
					init : function(){
						var pre = this;
						pre.set("checkedNotEqualed", false);
						pre.set("checked", false);
						pre.set("disabled", false);
						pre.set("radioCheckedNotEqualed", false);
						pre.set("radioChecked", false);
						pre.cool.set("value", PRE_DESIRED);
						pre.cool.set("disabled", true);
						pre.cool.set("unit", unit);
						pre.cool.set("step", step);
						pre.heat.set("value", PRE_DESIRED);
						pre.heat.set("disabled", true);
						pre.heat.set("unit", unit);
						pre.heat.set("step", step);

						//이전 선택 값 초기화
						var key;
						var beforeValue = this.beforeValue;
						for( key in beforeValue ){
							beforeValue[key] = null;
						}
						// 값 중복 표시시, wrapper 에 걸어둔 이벤트 제거
						var preCoolTempWidget = $('#pre-cool-temp').data('kendoCustomNumericBox');
						var preHeatTempWidget = $('#pre-heat-temp').data('kendoCustomNumericBox');
						if(typeof preCoolTempWidget !== 'undefined' && typeof preHeatTempWidget !== 'undefined') {
							$(preCoolTempWidget.wrapper).unbind('click');
							$(preHeatTempWidget.wrapper).unbind('click');
						}
					},
					setDisabled : function(){
						var pre = this;
						this.init();
						pre.set("disabled", true);
						pre.cool.set("disabled", true);
						pre.heat.set("disabled", true);
					},
					radioChecked : "PreCooling",
					beforeValue : {
						radioChecked : null
					},
					checkClick : function(e){
						var pre = this.operation.pre;
						var beforeValue = pre.beforeValue;

						if(!pre.get("checked")){    //enabled
							if(beforeValue.radioChecked !== null && typeof beforeValue.radioChecked !== 'undefined'){
								pre.set("radioChecked", beforeValue.radioChecked);
								var value = beforeValue.radioChecked == "PreCooling" ? true : false;
								pre.cool.set("disabled", !value);
								pre.heat.set("disabled", value);
								beforeValue.radioChecked = null;
							}else{
								pre.set("radioChecked", "PreCooling");
								pre.cool.set("disabled", false);
								pre.heat.set("disabled", true);
							}
						}else{
							beforeValue.radioChecked = pre.get("radioChecked");
							pre.set("radioChecked", false);
							pre.cool.set("disabled", true);
							pre.heat.set("disabled", true);
						}
					},
					change : function(){
						var pre = this.operation.pre;
						if(pre.get("radioChecked") == "PreCooling"){
							pre.cool.set("disabled", false);
							pre.heat.set("disabled", true);
						}else if(pre.get("radioChecked") == "PreHeating"){
							pre.heat.set("disabled", false);
							pre.cool.set("disabled", true);
						}
					},
					cool : {
						disabled : true,
						value : PRE_DESIRED,
						min : PRE_COOLING_MIN,
						max : PRE_MAX,
						unit : unit,
						step : step
					},
					heat : {
						disabled : true,
						value : PRE_DESIRED,
						min : PRE_HEATING_MIN,
						max : PRE_MAX,
						unit : unit,
						step : step
					}
				},
				confirm : {
					ok: {
						text: I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_SETTING_CONFIRM_OK"),
						click: function (e) {
							var mainViewModel =  MainViewModel;
							var confirm = OperationViewModel.operation.confirm;

							var timeAndOperationSettings = mainViewModel.dataFields.timeAndOperationSettings;
							var timeSettingList = timeAndOperationSettings.timeSettingList;
							var oneDayTimePicker = timeAndOperationSettings.oneDayTimePicker;
							var repeatDate = timeAndOperationSettings.repeatDate;
							var operationSettings = timeAndOperationSettings.operationSettings;
							var checkedData = timeSettingList.get('checkedData');

							//  timeAndOperationSettings 필드에서 보내야하는 실제 데이터.
							var executionTimes = oneDayTimePicker.getData();
							var daysOfWeek = repeatDate.getData();
							var deviceTypesAndAlgorithm = operationSettings.getData();

							// oneDayTimePicker, repeatDate, operation 중 하나라도 미선택 되어 있을 경우, 알림 팝업 제공.
							var hasNoExecutionTimes = executionTimes.length == 0;
							var hasNoDaysOfWeek = daysOfWeek.length == 0;
							var hasNoDeviceTypesAndAlgorithm = (deviceTypesAndAlgorithm.deviceTypes.length == 0 && typeof deviceTypesAndAlgorithm.algorithm == 'undefined');

							// oneDayTimePicker, repeatDate, operation 설정 값 저장.
							var configuration, newConfigurations = [];
							configuration = {
								id: mainViewModel.util.generateConfigurationId(executionTimes, daysOfWeek),
								executionTimes: executionTimes,
								daysOfWeek: daysOfWeek,
								deviceTypes: deviceTypesAndAlgorithm.deviceTypes
							};
							if(typeof deviceTypesAndAlgorithm.algorithm != 'undefined') configuration['algorithm'] = deviceTypesAndAlgorithm.algorithm;

							// 다중 편집에 대비하여, 현재 값을 기준으로 한 뷰모델 생성.

							console.log(executionTimes);
							console.log(daysOfWeek);
							console.log(deviceTypesAndAlgorithm);

							if(checkedData.length < 2) {
								// 타임 설정 리스트 에서 선택을 하지 않았거나, 1개를 선택한 경우 (새로 생성하기, 싱글 편집)
								if(hasNoExecutionTimes || hasNoDaysOfWeek || hasNoDeviceTypesAndAlgorithm) {
									var msg = "- ";
									if(hasNoExecutionTimes) msg += I18N.prop("COMMON_TIME") + " / ";
									if(hasNoDaysOfWeek) msg += I18N.prop("FACILITY_SCHEDULE_REPEAT_DATE") + " / ";
									if(hasNoDeviceTypesAndAlgorithm) msg += I18N.prop("COMMON_OPERATION") + " / ";

									msg = msg.substring(0, msg.length - 3);
									msg = I18N.prop("FACILITY_SCHEDULE_CREATE_TIME_AND_OPERATION_SETTINGS_NOT_COMPLETED") + "\n" + msg;
									msgDialog.message(msg);
									msgDialog.open();
									return;
								}
								// 타임 설정 리스트에서 체크한 값이 1개 있는 경우, (편집)
								if(checkedData.length === 1) {
									// 타임 설정 리스트에서 1개를 선택하여 편집 하는 경우, 기존 configurations 값에서 해당 값을 제거하고 새로 1개의 configuration 으로 생성한다.
									// 기존 configurations 값에서 해당 값을 제거.
									newConfigurations = timeSettingList.getNewConfigurationsAfterDelete([checkedData[0].parentId], [checkedData[0].executionTime]);
								} else {
									// 타임 설정 리스트에서 0개를 선택하여  편집 하는 경우, (생성)
									timeAndOperationSettings.get('value').forEach(function(oldConfiguration){
										newConfigurations.push(oldConfiguration);
									});
								}
								// 생성 했던 설정 추가.
								newConfigurations.push(configuration);
							} else {
								// 타임 설정 리스트 에서 시간 설정을 2개 이상 인 경우 (디중 편집) 현재 뷰 모델에서 notEqualed: true 되어있는 값은 각각 타임 설정 아이템에 값을 반영 하지 않음.
								var checkedDataParentIds = [], checkedDataExecutionTimes = [];
								checkedData.forEach(function(item){
									checkedDataParentIds.push(item.parentId);
								});
								checkedData.forEach(function(item){
									checkedDataExecutionTimes.push(item.executionTime);
								});
								// 선택된 설정이 사라진 configurations 값.
								newConfigurations = timeSettingList.getNewConfigurationsAfterDelete(checkedDataParentIds, checkedDataExecutionTimes);
								// 기존 값을 기반으로 수정된 configurations 값 생성 및 newConfigurations
								checkedData.forEach(function(checkedDataItem){
									console.log(checkedDataItem);
									var newConfiguration = confirm.ok.getUpdatedConfigurationFromMultiSelectedView(checkedDataItem);
									newConfigurations.push(newConfiguration);
								});
							}
							// 중복 시간 설정 확인.
							var hasDuplicatedTimeSetting = confirm.ok.checkDuplicatedTimeSetting(newConfigurations);
							if(hasDuplicatedTimeSetting) {
								// 중복 시간 설정 알람 팝업 제공.
								var msg = I18N.prop('FACILITY_SCHEDULE_DUPlICATED_TIME_EXIST');
								msgDialog.message(msg);
								msgDialog.open();
								return;
							}

							// 2개이상의 서로 다른 시간대 설정값 동시 편집중, 반복요일/운영 설정 값중 미 설정 되는 시간대 설정값 저장 방지 및 알림.
							var noDaysOfWeekOrOperationTimes = confirm.ok.getNoRepeatDateAndOperationTimes(newConfigurations);
							if(noDaysOfWeekOrOperationTimes.length > 0) {
								var msg = "- ";
								noDaysOfWeekOrOperationTimes.forEach(function(time){
									var timeStr = time.split(':');
									msg += (timeStr[0] + ':' + timeStr[1] + ' / ');
								});
								msg = msg.substring(0, msg.length - 3);
								msg = I18N.prop("FACILITY_SCHEDULE_CREATE_TIMELIST_NO_REPEAT_OR_OPERATION") + "\n" + msg;
								msgDialog.message(msg);
								msgDialog.open();
								return;
							}

							timeAndOperationSettings.set('value', newConfigurations);
							console.log(timeAndOperationSettings.get('value'));
						},
						getUpdatedConfigurationFromMultiSelectedView: function(checkedDataItem) {
							var newConfiguration = {};
							var userNewInputMap = MainViewModel.dataFields.timeAndOperationSettings.timeSettingList.userNewInputMap;
							var repeatDateNewInput = userNewInputMap.repeatDate;
							var operationNewInput = userNewInputMap.operation;
							var repeatDateViewModel = checkedDataItem.repeatDateViewModel;
							var operationViewModel = checkedDataItem.operationViewModel;

							console.log(repeatDateNewInput);
							var applyUserNewInput = function(viewModel, userNewInput){
							    Object.keys(userNewInput.toJSON()).forEach(function(field){
									viewModel.set(field, userNewInput[field]);
								});
							};

							applyUserNewInput(repeatDateViewModel, repeatDateNewInput);
							applyUserNewInput(operationViewModel, operationNewInput);

							var daysOfWeek = repeatDateViewModel._getData();
							var deviceTypesAndAlgorithm = operationViewModel._getData();

							newConfiguration = {
								id: MainViewModel.util.generateConfigurationId([checkedDataItem.executionTime], daysOfWeek),
								executionTimes: [checkedDataItem.executionTime],
								daysOfWeek: daysOfWeek,
								deviceTypes: deviceTypesAndAlgorithm.deviceTypes
							};
							if(typeof deviceTypesAndAlgorithm.algorithm != 'undefined') newConfiguration['algorithm'] = deviceTypesAndAlgorithm.algorithm;

							return newConfiguration;
						},
						getNoRepeatDateAndOperationTimes: function(configurations) {
							var times = [];
							configurations.forEach(function(configuration){
								if(typeof configuration.deviceTypes == 'undefined') configuration.deviceTypes = [];
								if(configuration.daysOfWeek.length == 0 || (configuration.deviceTypes.length == 0 && typeof configuration.algorithm === 'undefined')) {
									configuration.executionTimes.forEach(function(executionTime){
										times.push(executionTime);
									});
								}
							});
							return times;
						},
						checkDuplicatedTimeSetting: function(configurations) {
							var obj = {};
							var hasDuplicatedTimeSetting = false;
							configurations.forEach(function(configuration){
								configuration.executionTimes.forEach(function(executionTime){
									if(typeof obj[executionTime] === 'undefined') obj[executionTime] = {};
									configuration.daysOfWeek.forEach(function(day){
										if(typeof obj[executionTime][day] === 'undefined') {
											obj[executionTime][day] = {};
										} else if(typeof obj[executionTime][day] !== 'undefined') {
											hasDuplicatedTimeSetting = true;
										}
									});
								});
							});
							return hasDuplicatedTimeSetting;
						},
						enabled: true
					},
					clear: {
						text: I18N.prop("FACILITY_SCHEDULE_CREATE_OPERATION_SETTING_CONFIRM_CLEAR"),
						click: function (e) {
							var clear = OperationViewModel.operation.confirm.clear;
							clear._clearTeimAndOperationSettings();
						},
						_clearTeimAndOperationSettings: function() {
							// timeAndOperationSettings 화면 설정값 초기화.
							var mainViewModel =  MainViewModel;
							var timeAndOperationSettings = mainViewModel.dataFields.timeAndOperationSettings;
							var oneDayTimePicker = timeAndOperationSettings.oneDayTimePicker;
							var repeatDate = timeAndOperationSettings.repeatDate;
							var operationSettings = timeAndOperationSettings.operationSettings;

							oneDayTimePicker.setData([]);
							repeatDate.setData([]);
							operationSettings.setData([]);
						},
						enabled: false,
						setEnabled: function() {
							var timeAndOperationSettings = MainViewModel.dataFields.timeAndOperationSettings;
							var oneDayTimePicker = timeAndOperationSettings.oneDayTimePicker;
							var repeatDate = timeAndOperationSettings.repeatDate;
							var operationSettings = timeAndOperationSettings.operationSettings;
							//  timeAndOperationSettings 필드에서 보내야하는 실제 데이터.
							var executionTimes = oneDayTimePicker.getData();
							var daysOfWeek = repeatDate.getData();
							var deviceTypesAndAlgorithm = operationSettings.getData();
							// oneDayTimePicker, repeatDate, operation 중 하나라도 미선택 되어 있을 경우, 알림 팝업 제공.
							var hasNoExecutionTimes = executionTimes.length == 0;
							var hasNoDaysOfWeek = daysOfWeek.length == 0;
							var hasNoDeviceTypesAndAlgorithm = (deviceTypesAndAlgorithm.deviceTypes.length == 0 && typeof deviceTypesAndAlgorithm.algorithm == 'undefined');
							if(!hasNoExecutionTimes || !hasNoDaysOfWeek || !hasNoDeviceTypesAndAlgorithm) {
								OperationViewModel.operation.confirm.clear.set("enabled", true);
							} else {
								OperationViewModel.operation.confirm.clear.set("enabled", false);
							}
						}
					}
				}
			},
			//SAC Indoor 모드 선택 시, Temperature MIN/MAX 값 설정을 위한 함수
			setTempMinMax : function(e, tempElem, waterTempElem){
				if(tempElem.length < 1 || waterTempElem.length < 1){
					return;
				}
				var tempNumericBox = tempElem.data("kendoCustomNumericBox");
				var waterTempNumericBox = waterTempElem.data("kendoCustomNumericBox");
				var indoor = this.operation.indoor;
				var field = e.field;
				var min, max, desired, checked;

				if(field == "operation.indoor.temperature.min"){
					checked = indoor.temperature.get("checked");
					desired = indoor.temperature.get("desired");
					min = indoor.temperature.get("min");
					tempNumericBox.min(min);
					if(desired < min){
						indoor.temperature.set("desired", min);
					}else if(checked){
						tempNumericBox.enable(false);
						tempNumericBox.enable(true);
					}
				}else if(field == "operation.indoor.temperature.max"){
					checked = indoor.temperature.get("checked");
					desired = indoor.temperature.get("desired");
					max = indoor.temperature.get("max");
					tempNumericBox.max(max);
					if(desired > max){
						indoor.temperature.set("desired", max);
					}else if(checked){
						tempNumericBox.enable(false);
						tempNumericBox.enable(true);
					}
				}else if(field == "operation.indoor.waterTemp.min"){
					checked = indoor.waterTemp.get("checked");
					desired = indoor.waterTemp.get("desired");
					min = indoor.waterTemp.get("min");
					waterTempNumericBox.min(min);
					if(desired < min){
						indoor.waterTemp.set("desired", min);
					}else if(checked){
						waterTempNumericBox.enable(false);
						waterTempNumericBox.enable(true);
					}
				}else if(field == "operation.indoor.waterTemp.max"){
					checked = indoor.waterTemp.get("checked");
					desired = indoor.waterTemp.get("desired");
					max = indoor.waterTemp.get("max");
					waterTempNumericBox.max(max);
					if(desired > max){
						indoor.waterTemp.set("desired", max);
					}else if(checked){
						waterTempNumericBox.enable(false);
						waterTempNumericBox.enable(true);
					}
				}
			},
			checkActive : function(){
				var indoor = this.operation.indoor;
				var indoorMode = indoor.operation.mode;
				var indoorOperationChecekdNotEqualed = indoor.operation.checkedNotEqualed;
				var indoorTempChecekdNotEqualed = indoor.temperature.checkedNotEqualed;
				var indoorWaterTempChecekdNotEqualed = indoor.waterTemp.checkedNotEqualed;

				var dhw = this.operation.dhw;
				var dhwOperationChecekdNotEqualed = dhw.operation.checkedNotEqualed;
				var dhwTempChecekdNotEqualed = dhw.temperature.checkedNotEqualed;

				var isActive = (indoorMode[0].get("active") || indoorMode[1].get("active") || indoorMode[2].get("active") || indoorMode[3].get("active") || indoorMode[5].get("active") || indoorMode[6].get("active")) ||
                        (indoorOperationChecekdNotEqualed || indoorTempChecekdNotEqualed || indoorWaterTempChecekdNotEqualed);
				indoor.operation.set("active", isActive);

				var dhw = this.operation.dhw;
				var dhwMode = dhw.operation.mode;
				isActive = (dhwMode[0].get("active") || dhwMode[1].get("active") || dhwMode[2].get("active") || dhwMode[3].get("active")) ||
                    (dhwOperationChecekdNotEqualed || dhwTempChecekdNotEqualed);

				dhw.operation.set("active", isActive);
			},
			init : function(){
				var operation = this.operation;
				var indoor = operation.indoor;
				indoor.init();

				var ventilator = operation.ventilator;
				ventilator.init();

				var dhw = operation.dhw;
				dhw.init();

				var remoteControl = operation.remoteControl;
				remoteControl.init();

				var point = operation.point;
				point.aoav.init();
				point.dodv.init();

				var light = operation.light;
				light.init();

				var pre = operation.pre;
				pre.init();

			},
			defaultIndoor : function(){
				var operation = this.operation;
				var indoor = operation.indoor;
				indoor.power.set("checked", true);
				indoor.power.set("active", true);
				indoor.operation.set("checked", true);
				indoor.operation.mode[0].set("active", true);
				indoor.temperature.set("checked", true);
				indoor.temperature.set("desired", INDOOR_DESIRED);
			},
			defaultVentilator : function(){
				var operation = this.operation;
				var ventilator = operation.ventilator;
				ventilator.power.set("checked", true);
				ventilator.power.set("active", true);
				ventilator.operation.set("checked", true);
				ventilator.operation.mode[0].set("active", true);
			},
			defaultDhw : function(){
				var operation = this.operation;
				var dhw = operation.dhw;
				dhw.power.set("checked", true);
				dhw.power.set("active", true);
				dhw.operation.set("checked", true);
				dhw.operation.mode[1].set("active", true);
				dhw.temperature.set("checked", true);
				dhw.temperature.set("desired", DHW_DESIRED);
			},
			defaultRemoteControl : function(){
				var operation = this.operation;
				var remoteControl = operation.remoteControl;
				remoteControl.set("checked", true);
				remoteControl.control[0].set("active", true);
			},
			defaultControlPoint : function(){
				var operation = this.operation;
				var point = operation.point;
				point.aoav.set("checked", true);
				point.aoav.set("value", "0.0");
				point.dodv.set("checked", true);
				point.dodv.set("active", true);
			},
			defaultAoav : function(){
				var operation = this.operation;
				var point = operation.point;
				point.aoav.set("checked", true);
				point.aoav.set("value", "0.0");
			},
			defaultDodv : function(){
				var operation = this.operation;
				var point = operation.point;
				point.dodv.set("checked", true);
				point.dodv.set("active", true);
			},
			defaultLight : function(){
				var operation = this.operation;
				var light = operation.light;
				light.power.set("checked", true);
				light.power.set("active", true);
				light.set("checked", true);
				light.set("value", 50);
			},
			defaultPre : function(){
				var operation = this.operation;
				var pre = operation.pre;
				pre.set("checked", true);
				pre.set("radioChecked", "PreCooling");
				pre.cool.set("value", PRE_DESIRED);
				pre.cool.set("disabled", false);
			},
			default : function(selectedDevices){
				this.init();
				//Device Type?
				if(!selectedDevices){
					this.defaultIndoor();
					this.defaultVentilator();
					this.defaultDhw();
					this.defaultRemoteControl();
					this.defaultControlPoint();
					this.defaultLight();
					this.defaultPre();
				}
			},
			checkDeviceType : function(datas, isEdit){
				var type, data;
				var i, max = datas.length;

				var hasIndoor, hasVentilator, hasDhw, hasLight, hasAoav, hasDodv;
				//
				for( i = 0; i < max; i++ ){
					data = datas[i];
					type = data.type;
					if(type.indexOf("AirConditioner.") != -1){
						type = Util.getIndoorType(data);
						if(type.indexOf("General") != -1){
							hasIndoor = true;
						}else if(type.indexOf("Ventilator") != -1){
							hasVentilator = true;
						}else if(type.indexOf("DHW") != -1){
							hasDhw = true;
						}
					}else if(type.indexOf("Light") != -1){
						hasLight = true;
					}else if(type.indexOf("AO") != -1 || type.indexOf("AV") != -1){
						hasAoav = true;
					}else if(type.indexOf("DO") != -1 || type.indexOf("DV") != -1){
						hasDodv = true;
					}

					if(hasIndoor && hasVentilator && hasDhw && hasLight && hasAoav && hasDodv){
						break;
					}
				}

				if(!hasIndoor){
					this.operation.indoor.setDisabled();
					this.operation.pre.setDisabled();
					this.operation.remoteControl.setDisabled();
				}else{
					this.operation.indoor.init();
					this.operation.pre.init();
					this.operation.remoteControl.init();
					if(!isEdit){
						this.defaultIndoor();
						this.defaultPre();
						this.defaultRemoteControl();
					}
				}

				if(!hasVentilator){
					this.operation.ventilator.setDisabled();
				}else{
					this.operation.ventilator.init();
					if(!isEdit){
						this.defaultVentilator();
					}
				}

				if(!hasDhw){
					this.operation.dhw.setDisabled();
				}else{
					this.operation.dhw.init();
					if(!isEdit){
						this.defaultDhw();
					}
				}

				if(!hasAoav){
					this.operation.point.aoav.setDisabled();
				}else{
					this.operation.point.aoav.init();
					if(!isEdit){
						this.defaultAoav();
					}
				}

				if(!hasDodv){
					this.operation.point.dodv.setDisabled();
				}else{
					this.operation.point.dodv.init();
					if(!isEdit){
						this.defaultDodv();
					}
				}

				if(!hasLight){
					this.operation.light.setDisabled();
				}else{
					this.operation.light.init();
					if(!isEdit){
						this.defaultLight();
					}
				}
			},
			isValid : function(){
				var isValid = false;
				var operation = this.operation;
				var indoor = operation.indoor;
				isValid = indoor.power.get("checked");
				if(isValid) return isValid;

				isValid = indoor.operation.get("checked")
&& (indoor.operation.mode[0].get("active")
|| indoor.operation.mode[1].get("active")
|| indoor.operation.mode[2].get("active")
|| indoor.operation.mode[3].get("active")
|| indoor.operation.mode[4].get("active")
|| indoor.operation.mode[5].get("active")
|| indoor.operation.mode[6].get("active"));

				if(isValid) return isValid;

				isValid = indoor.temperature.get("checked");
				if(isValid) return isValid;

				var ventilator = operation.ventilator;
				isValid = ventilator.power.get("checked");
				if(isValid) return isValid;

				isValid = ventilator.operation.get("checked")
&& (ventilator.operation.mode[0].get("active")
|| ventilator.operation.mode[1].get("active")
|| ventilator.operation.mode[2].get("active")
|| ventilator.operation.mode[3].get("active"));
				if(isValid) return isValid;

				var dhw = operation.dhw;
				isValid = dhw.power.get("checked");
				if(isValid) return isValid;

				isValid = dhw.operation.get("checked")
&& (dhw.operation.mode[0].get("active")
|| dhw.operation.mode[1].get("active")
|| dhw.operation.mode[2].get("active")
|| dhw.operation.mode[3].get("active"));
				if(isValid) return isValid;

				isValid = dhw.temperature.get("checked");
				if(isValid) return isValid;

				var remoteControl = operation.remoteControl;
				isValid = remoteControl.get("checked")
&& (remoteControl.control[0].get("active")
|| remoteControl.control[1].get("active")
|| remoteControl.control[2].get("active"));
				if(isValid) return isValid;

				var point = operation.point;
				isValid = point.aoav.get("checked") || this.operation.point.dodv.get("checked");
				if(isValid) return isValid;

				isValid = point.aoav.get("checked") || this.operation.point.dodv.get("checked");
				if(isValid) return isValid;

				var pre = operation.pre;
				isValid = pre.get("checked") && (!pre.cool.get("disabled") || !pre.heat.get("disabled"));
				if(isValid) return isValid;

				var light = operation.light;
				isValid = light.power.get("checked") || light.get("checked");
				if(isValid) return isValid;

				return isValid;
			},
			validation : function(){},
			_applyData: function(data) {
				var self = this;
				self.oper;

				//var control = loadedSchedule.control;
				var algorithm = data.algorithm;
				var deviceTypes = typeof data.deviceTypes != 'undefined' ? data.deviceTypes : [];
				var i, max = deviceTypes.length;
				var control = {
					operations : [],
					temperatures : [],
					modes : [],
					configuration : {},
					aoControlPoint : {},
					doControlPoint : {},
					lights : []
				};

				var deviceType, deviceControl, deviceControlObj;
				for( i = 0; i < max; i++ ){
					deviceType = deviceTypes[i];
					deviceControl = deviceType.control;
					if(deviceControl){
						if(deviceControl.operations){
							deviceControlObj = deviceControl.operations;
							if(deviceControlObj instanceof kendo.data.ObservableArray){
								deviceControlObj = deviceControlObj.toJSON();
							}
							control.operations = control.operations.concat(deviceControlObj);
						}
						if(deviceControl.temperatures){
							deviceControlObj = deviceControl.temperatures;
							if(deviceControlObj instanceof kendo.data.ObservableArray){
								deviceControlObj = deviceControlObj.toJSON();
							}
							control.temperatures = control.temperatures.concat(deviceControlObj);
						}
						if(deviceControl.modes){
							deviceControlObj = deviceControl.modes;
							if(deviceControlObj instanceof kendo.data.ObservableArray){
								deviceControlObj = deviceControlObj.toJSON();
							}
							control.modes = control.modes.concat(deviceControlObj);
						}
						if(deviceControl.configuration){
							control.configuration = deviceControl.configuration;
						}

						if(deviceType.dms_devices_type.indexOf("AO") != -1 && deviceControl.controlPoint){
							control.aoControlPoint = deviceControl.controlPoint;
						}

						if(deviceType.dms_devices_type.indexOf("DO") != -1 && deviceControl.controlPoint){
							control.doControlPoint = deviceControl.controlPoint;
						}

						if(deviceControl.lights){
							control.lights = deviceControl.lights;
						}
					}
				}

				data.control = control;

				var operations = control.operations,
					temperatures = control.temperatures,
					modes = control.modes,
					configuration = control.configuration,
					aoControlPoint = control.aoControlPoint,
					doControlPoint = control.doControlPoint,
					lights = control.lights;

				var KEYS = {
					"AirConditioner.Indoor" : "indoor",
					"AirConditioner.Indoor.Room" : "indoor",
					// "AirConditioner.Indoor.Room" : "indoor",				//[13-04-2018]중복된 코드 주석 -jw.lim
					"AirConditioner.Indoor.Room.Auto" : "indoor",
					"AirConditioner.Indoor.Room.Heat" : "indoor",
					"AirConditioner.Indoor.Room.Cool" : "indoor",
					"AirConditioner.Indoor.General" : "indoor",
					"AirConditioner.Indoor.WaterOutlet" : "indoor",
					"AirConditioner.Indoor.DHW" : "dhw",
					"AirConditioner.DHW" : "dhw",
					// "AirConditioner.Indoor.DHW" : "dhw",					//[13-04-2018]중복된 코드 주석 -jw.lim
					"AirConditioner.Indoor.Ventilator" : "ventilator",
					"ControlPoint" : "point",
					"ControlPoint.AO" : "point.aoav",
					"ControlPoint.AV" : "point.aoav",
					"ControlPoint.DO" : "point.dodv",
					"ControlPoint.DV" : "point.dodv",
					"General" : "light"
				};

				var viewModel = self.operation;
				var power, key, op, id;
				if(operations){
					max = operations.length;
					for( i = 0; i < max; i++ ){
						op = operations[i];
						id = op.id;
						key = KEYS[id];
						power = op.power;
						//power = power == "On" ? true : false;
						if(viewModel[key] && !viewModel[key].power.get("disabled")){
							if(power){
								viewModel[key].power.set("checked", power);
							}
							if(power == "On"){
								viewModel[key].power.set("active", power);
							}
						}
					}
				}

				if(modes){
					var mode, operModes, j, oper, length;
					max = modes.length;
					for( i = 0; i < max; i++ ){
						op = modes[i];
						id = op.id;
						key = KEYS[id];
						mode = op.mode;
						if(viewModel[key]){
							oper = viewModel[key].operation;
						}

						if(!oper || viewModel[key].power.get("disabled")){
							continue;
						}
						if(key == "light" && viewModel[key].get("disabled")){
							continue;
						}

						operModes = oper.mode;

						length = operModes.length;
						for( j = 0; j < length; j++ ){
							if(operModes[j].name == mode){
								viewModel[key].operation.set("checked", true);
								operModes[j].set("active", true);
							}
						}
					}
				}

				if(temperatures){
					var desired;
					max = temperatures.length;
					for( i = 0; i < max; i++ ){
						op = temperatures[i];
						id = op.id;
						key = KEYS[id];

						desired = op.desired;
						if(viewModel[key] && !viewModel[key].power.get("disabled")){
							if(id.indexOf("Water") != -1){
								viewModel[key].waterTemp.set("checked", true);
								viewModel[key].waterTemp.set("desired", desired);
							}else{
								viewModel[key].temperature.set("checked", true);
								viewModel[key].temperature.set("desired", desired);
							}
						}
					}
				}

				if(aoControlPoint && aoControlPoint.value !== null && typeof aoControlPoint.value !== "undefined"){				//[13-04-2018]undefined check -jw.lim
					if(!viewModel.point.aoav.get("disabled")){
						viewModel.point.aoav.set("checked", true);
						viewModel.point.aoav.set("value", Number(aoControlPoint.value));
					}
				}

				if(doControlPoint && doControlPoint.value !== null && typeof doControlPoint.value !== "undefined"){			//[13-04-2018]undefined check -jw.lim
					if(!viewModel.point.dodv.get("disabled")){
						viewModel.point.dodv.set("checked", true);
						var onOff = doControlPoint.value == 1 ? true : false;
						viewModel.point.dodv.set("active", onOff);
					}
				}

				if(lights && lights.length > 0){
					lights = lights[0];
					if(!viewModel.light.get("disabled")){
						viewModel.light.set("checked", true);
						viewModel.light.set("value", lights.dimmingLevel);
					}
				}

				// var control;			//[13-04-2018]중복된 코드 주석 -jw.lim
				if(configuration && configuration.remoteControl){
					control = configuration.remoteControl;
					if(!viewModel.remoteControl.get("disabled")){
						viewModel.remoteControl.set("checked", true);
						max = viewModel.remoteControl.control.length;

						for( i = 0; i < max; i++ ){
							if(control == viewModel.remoteControl.control[i].name){
								viewModel.remoteControl.set("checked", true);
								viewModel.remoteControl.control[i].set("active", true);
								break;
							}
						}
					}
				}

				if(algorithm && !viewModel.pre.get("disabled")){
					if(algorithm.enabled){
						viewModel.pre.set("checked", true);
					}
					if(algorithm.mode == "PreCooling"){
						viewModel.pre.cool.set("value", algorithm.preCoolingTemperature);
						viewModel.pre.cool.set("disabled", false);
					}else if(algorithm.mode == "PreHeating"){
						viewModel.pre.heat.set("value", algorithm.preHeatingTemperature);
						viewModel.pre.heat.set("disabled", false);
					}
					viewModel.pre.set("radioChecked", algorithm.mode);
				}
			},
			_getData: function() {
				var self = this;
				var loadedSchedule = {};
				var DeviceKeys = {
					sacIndoor : "AirConditioner.Indoor",
					indoor : "AirConditioner.Indoor.General",
					ventilator : "AirConditioner.Indoor.Ventilator",
					dhw : "AirConditioner.Indoor.DHW",
					point : "ControlPoint"
				};
				if(!loadedSchedule.deviceTypes){
					loadedSchedule.deviceTypes = [];
				}

				if(!loadedSchedule.control){
					loadedSchedule.control = {};
				}

				var obj, i, max, control = {};
				var operations = self.operation;
				var indoor = operations.indoor;
				var ventilator = operations.ventilator;
				var dhw = operations.dhw;
				var light = operations.light;
				var operArr = [];
				// var i, max, obj;			//[13-04-2018]중복된 코드 주석 -jw.lim
				var modes;
				/*Power*/
				if(indoor.power.checked){
					obj = {
						id : DeviceKeys.indoor
					};
					if(indoor.power.active){
						obj.power = "On";
					}else{
						obj.power = "Off";
					}
					operArr.push(obj);
				}

				if(ventilator.power.checked){
					obj = {
						id : DeviceKeys.ventilator
					};
					if(ventilator.power.active){
						obj.power = "On";
					}else{
						obj.power = "Off";
					}
					operArr.push(obj);
				}

				if(dhw.power.checked){
					obj = {
						id : DeviceKeys.dhw
					};
					if(dhw.power.active){
						obj.power = "On";
					}else{
						obj.power = "Off";
					}
					operArr.push(obj);
				}

				var indoorOperObj = {
					dms_devices_type : "AirConditioner.Indoor",
					control : {}
				};

				if(operArr.length > 0){
					//Server로 Request 하기 위한 데이터
					indoorOperObj.control.operations = operArr;
				}

				var lightOperObj = {
					dms_devices_type : "Light",
					control : {}
				};
				var lightOperArr = [];

				if(light.power.checked){
					obj = {
						id : "General"
					};

					obj.power = light.power.active ? "On" : "Off";
					lightOperArr.push(obj);
					lightOperObj.control.operations = lightOperArr;
					operArr = operArr.concat(lightOperArr);
				}

				if(operArr.length > 0){
					//Creation View에서 표시하기 위한 데이터
					loadedSchedule.control.operations = operArr;
				}else{
					delete loadedSchedule.control.operations;
				}

				var modesArr = [];
				// var indoorTemp = "";			//[13-04-2018]안쓰는 코드 주석 -jw.lim
				if(indoor.operation.checked){
					modes = indoor.operation.mode;
					max = modes.length;
					for(i = 0; i < max; i++){
						if(modes[i].active){
							// indoorTemp = modes[i].name;		//[13-04-2018]안쓰는 코드 주석 -jw.lim
							obj = {
								id : DeviceKeys.indoor,
								mode : modes[i].name
							};
							modesArr.push(obj);
						}
					}
				}

				if(ventilator.operation.checked){
					modes = ventilator.operation.mode;
					max = modes.length;
					for(i = 0; i < max; i++){
						if(modes[i].active){
							obj = {
								id : DeviceKeys.ventilator,
								mode : modes[i].name
							};
							modesArr.push(obj);
						}
					}
				}

				if(dhw.operation.checked){
					modes = dhw.operation.mode;
					max = modes.length;
					for(i = 0; i < max; i++){
						if(modes[i].active){
							obj = {
								id : DeviceKeys.dhw,
								mode : modes[i].name
							};
							modesArr.push(obj);
						}
					}
				}

				if(modesArr.length > 0){
					//Creation View에서 표시하기 위한 데이터
					loadedSchedule.control.modes = modesArr;
					//서버로 Request 하기 위한 데이터
					indoorOperObj.control.modes = modesArr;
				}else{
					delete loadedSchedule.control.modes;
				}

				var temperatures;
				var temperArr = [];
				var id;
				if(indoor.temperature.checked){
					temperatures = indoor.temperature;
					id = DeviceKeys.indoor.replace(".General", ".Room");
					//id += indoorTemp;
					obj = {
						id : id,
						desired : temperatures.get("desired")
					};
					temperArr.push(obj);
				}

				var waterTemp;
				if(indoor.waterTemp.checked){
					waterTemp = indoor.waterTemp;
					id = DeviceKeys.indoor.replace(".General", ".WaterOutlet");
					//id += indoorTemp;
					obj = {
						id : id,
						desired : waterTemp.get("desired")
					};
					temperArr.push(obj);
				}


				if(dhw.temperature.checked){
					temperatures = dhw.temperature;
					obj = {
						id : DeviceKeys.dhw,
						desired : temperatures.get("desired")
					};
					temperArr.push(obj);
				}

				if(temperArr.length > 0){
					//Creation View에서 표시하기 위한 데이터
					loadedSchedule.control.temperatures = temperArr;
					//Server로 Request 하기 위한 데이터
					indoorOperObj.control.temperatures = temperArr;
				}else{
					delete loadedSchedule.control.temperatures;
				}

				var controlObj = {};
				if(operations.remoteControl.checked){
					control = operations.remoteControl.control;
					max = control.length;
					for( i = 0; i < max; i++ ){
						if(control[i].active){
							controlObj = {
								remoteControl : control[i].name
							};
						}
					}
				}

				if(!$.isEmptyObject(controlObj)){
					//Creation View에서 표시하기 위한 데이터
					loadedSchedule.control.configuration = controlObj;
					//Server로 Request 하기 위한 데이터
					indoorOperObj.control.configuration = controlObj;
				}else{
					delete loadedSchedule.control.configuration;
				}

				var aoavPointObj = {
					dms_devices_type : "ControlPoint.AO",
					control : {}
				};

				var dodvPointObj = {
					dms_devices_type : "ControlPoint.DO",
					control : {}
				};

				var value, aoavControlPoint = {};
				if(operations.point.aoav.checked){
					value = operations.point.aoav.get("value");
					if(typeof value == "number") value = value.toString();
					aoavControlPoint.value = value;
					//Server로 Request 하기 위한 데이터
					aoavPointObj.control.controlPoint = aoavControlPoint;
				}

				var dodvControlPoint = {};
				if(operations.point.dodv.checked){
					value = operations.point.dodv.get("active") ? 1 : 0;
					if(typeof value == "number") value = value.toString();
					dodvControlPoint.value = value;
					//Server로 Request 하기 위한 데이터
					dodvPointObj.control.controlPoint = dodvControlPoint;
				}

				//Creation View에서 표시하기 위한 데이터
				if(!$.isEmptyObject(aoavControlPoint)){
					loadedSchedule.control.aoControlPoint = aoavControlPoint;
				}else{
					delete loadedSchedule.control.aoControlPoint;
				}

				if(!$.isEmptyObject(dodvControlPoint)){
					loadedSchedule.control.doControlPoint = dodvControlPoint;
				}else{
					delete loadedSchedule.control.doControlPoint;
				}

				var lights = [];
				if(operations.light.checked){
					value = operations.light.get("value");
					lights.push({
						id : 1,
						dimmingLevel : value
					});
					//Creation View에서 표시하기 위한 데이터
					loadedSchedule.control.lights = lights;
					//서버 전송을 위한 데이터
					lightOperObj.control.lights = lights;
				}else{
					delete loadedSchedule.control.lights;
				}

				// var pre = {};			//[13-04-2018]안쓰는 코드 주석 -jw.lim
				var isDisabled = operations.pre.cool.get("disabled") && operations.pre.heat.get("disabled");
				if(operations.pre.checked && !isDisabled){
					if(!loadedSchedule.algorithm){
						loadedSchedule.algorithm = {};
					}
					loadedSchedule.algorithm.enabled = true;
					var radioChecked = operations.pre.get("radioChecked");
					if(radioChecked == "PreCooling"){
						loadedSchedule.algorithm.mode = radioChecked;
						value = operations.pre.cool.get("value");
						loadedSchedule.algorithm.preCoolingTemperature = value;

					}else if(radioChecked == "PreHeating"){
						loadedSchedule.algorithm.mode = radioChecked;
						value = operations.pre.heat.get("value");
						loadedSchedule.algorithm.preHeatingTemperature = value;
					}
				}else if(loadedSchedule.algorithm && loadedSchedule.algorithm.mode){
					loadedSchedule.algorithm = null;
				}else if(loadedSchedule.algorithm !== null){
					delete loadedSchedule.algorithm;
				}

				var deviceTypes = loadedSchedule.deviceTypes;
				var typeControl;
				max = deviceTypes.length;
				if(!$.isEmptyObject(indoorOperObj.control)){
					typeControl = null;
					for( i = 0; i < max; i++){
						if(deviceTypes[i].dms_devices_type.indexOf("AirConditioner.Indoor") != -1){
							deviceTypes[i].control = indoorOperObj.control;
							typeControl = deviceTypes[i].control;
							break;
						}
					}
					if(!typeControl){
						loadedSchedule.deviceTypes.push(indoorOperObj);
					}
				}else{
					for( i = max - 1; i >= 0; i--){
						if(deviceTypes[i].dms_devices_type.indexOf("AirConditioner.Indoor") != -1){
							deviceTypes.splice(i, 1);
						}
					}
				}

				max = deviceTypes.length;
				if(!$.isEmptyObject(lightOperObj.control)){
					typeControl = null;

					for( i = 0; i < max; i++){
						if(deviceTypes[i].dms_devices_type.indexOf("Light") != -1){
							deviceTypes[i].control = lightOperObj.control;
							typeControl = deviceTypes[i].control;
							break;
						}
					}
					if(!typeControl){
						loadedSchedule.deviceTypes.push(lightOperObj);
					}
				}else{
					for( i = max - 1; i >= 0; i--){
						if(deviceTypes[i].dms_devices_type.indexOf("Light") != -1){
							deviceTypes.splice(i, 1);
						}
					}
				}
				max = deviceTypes.length;
				if(!$.isEmptyObject(aoavPointObj.control)){
					typeControl = null;

					for( i = 0; i < max; i++){
						if(deviceTypes[i].dms_devices_type.indexOf("ControlPoint.AO") != -1){
							deviceTypes[i].control = aoavPointObj.control;
							typeControl = deviceTypes[i].control;
							break;
						}
					}
					if(!typeControl){
						loadedSchedule.deviceTypes.push(aoavPointObj);
					}
				}else{
					for( i = max - 1; i >= 0; i--){
						if(deviceTypes[i].dms_devices_type.indexOf("ControlPoint.AO") != -1){
							deviceTypes.splice(i, 1);
						}
					}
				}

				max = deviceTypes.length;
				if(!$.isEmptyObject(dodvPointObj.control)){
					typeControl = null;

					for( i = 0; i < max; i++){
						if(deviceTypes[i].dms_devices_type.indexOf("ControlPoint.DO") != -1){
							deviceTypes[i].control = dodvPointObj.control;
							typeControl = deviceTypes[i].control;
							break;
						}
					}
					if(!typeControl){
						loadedSchedule.deviceTypes.push(dodvPointObj);
					}
				}else{
					for( i = max - 1; i >= 0; i--){
						if(deviceTypes[i].dms_devices_type.indexOf("ControlPoint.DO") != -1){
							deviceTypes.splice(i, 1);
						}
					}
				}
				return loadedSchedule;
			}
		});

		return operationViewModel;
	};


	var OperationViewModel = createOperationViewModel();

	var OperationPowerText = function(){
		var isActive = this.get("active");
		var isChecked = this.get('checked');
		var isNotEqualed = this.get('activeNotEqualed');
		var result = '';
		if(!isActive){ result = I18N.prop("FACILITY_OFF");} else{result = I18N.prop("FACILITY_ON");}
		if(!isChecked || isNotEqualed) {result = I18N.prop("FACILITY_ON_OFF");}
		return result;
	};

	var Views = {
		map : {
			view : null,
			widget : null,
			routeUrl : "/map",
			show : null
		},
		list : {
			selected : {
				routeUrl : "/list/selected",
				view : null,
				widget : null
			},
			floor : {
				routeUrl : "/list/floor",
				view : null,
				widget : null
			},
			group : {
				routeUrl : "/list/group",
				view : null,
				widget: null
			},
			show : null
		},
		datetime : {
			routeUrl : "/datetime",
			view : null,
			widget : null,
			show : null,
			name : I18N.prop("FACILITY_SCHEDULE_DATETIME_SETTING")
		},
		operation : {
			routeUrl : "/operation",
			view : null,
			widget : null,
			show : null,
			name : I18N.prop("FACILITY_SCHEDULE_OPERATION_SETTING")
		},
		creation : {
			routeUrl : "/creation",
			view : null,
			widget : null,
			show : null,
			name : I18N.prop("FACILITY_SCHEDULE_CREATION_SETTING")
		}
	};

	return {
		Views : Views,
		MainViewModel : MainViewModel,
		OperationViewModel : OperationViewModel,
		operation_default_values : operation_default_values,
		typeFilterDataSource : typeFilterDataSource,
		typeFilterText : typeFilterText,
		typeQuery : typeQuery
	};
});

//For Debug
//# sourceURL=create-vm.js
