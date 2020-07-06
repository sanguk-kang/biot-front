define("device/common/config/device-config",
	["device/common/config/base-config", "device/common/device-constants", "device/common/device-util",
		"device/common/device-template", "device/common/device-api"], function(BaseConfig, Constants, DeviceUtil, Template, Api){

		var I18N = window.I18N, Util = window.Util, tabEnabled = window.MENU_TABS_ENABLED ? window.MENU_TABS_ENABLED : {};

		var Settings = window.GlobalSettings;
		var temperatureSettings = Settings.getTemperature();
		var temperatureUnit = temperatureSettings.unit;

		//등록 List View 옵션
		var registrationListViewConfig = $.extend(true, {}, BaseConfig.listViewConfig, {
			widgetOptions : {
				columns : [//내부 데이터 설정
					{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:300,format: ""},
					{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:300,format: "" },
					{ field: "detail", title: I18N.prop("COMMON_BTN_DETAIL"), width:80,sortable: false, template: Template.detailIconTemplateById}
				]
			}
		});

		//각 기기 타입 별 필터 Options
		var indoorModeFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
			id : "device-mode-filter",
			name : "mode",
			options : {
				optionLabel : I18N.prop("FACILITY_DEVICE_ALL_MODE"),
				dataSource: [
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_AUTO"), value: 1},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_COOL"), value: 2},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_HEAT"), value: 3},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_DRY"), value: 4},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_FAN"), value: 5},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_COOLST"), value: 6},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_HOTWATER"), value: 7},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_AUTO") + " " + "(" + I18N.prop("FACILITY_DEVICE_TYPE_VENTILATOR") + ")", value: 8},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_HEATEX"), value: 9},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_BYPASS"), value: 10},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_SLEEP"), value: 11},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_ECO"), value: 12},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_STANDARD"), value: 13},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_POWER"), value: 14},
					{ "text": I18N.prop("FACILITY_INDOOR_MODE_FORCE"), value: 15}
				]
			}
		});

		var indoorTypeFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
			liClassName: 'indoor-type-filter-wrapper',
			options : {
				optionLabel: I18N.prop("FACILITY_DEVICE_ALL_INDOOR_TYPE"),
				dataSource: [
					{ text: "Cassette/Duct", value: 0 },
					{ text: "AHU", value: 1 },
					{ text: "DVM Chiller", value: 2 },
					{ text: "EHS", value: 3 },
					{ text: "ERV", value: 4 },
					{ text: "ERV Plus", value: 5 },
					{ text: "FCU", value: 6 },
					{ text: "Fresh Duct", value: 7 }
				]
			}
		});

		var meterTypeFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
			options : {
				optionLabel: I18N.prop("FACILITY_DEVICE_ALL_ENERGY_METER_TYPE"),
				dataSource: [
					{ text: I18N.prop("FACILITY_DEVICE_TYPE_WATT_HOUR_METER"), value: 0 },
					{ text: I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_GAS_METER"), value: 1 },
					{ text: I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_WATER_METER"), value: 2 }
				]
			}
		});

		var controlPointTypeFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
			options : {
				optionLabel : I18N.prop("FACILITY_DEVICE_ALL_IO_TYPE"),
				selectAllText : I18N.prop("FACILITY_DEVICE_ALL_STATUS"),
				dataSource: [
					{ text: "AI", value: 0 }, { text: "AO", value: 1 }, { text: "DI", value: 2 }, { text: "DO", value: 3 }
				]
			}
		});

		var positionTypeFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
			options : {
				optionLabel: I18N.prop("FACILITY_DEVICE_ALL_POSITION_TYPE"),
				dataSource: [
					{ text: I18N.prop("FACILITY_DEVICE_BEACON_TYPE_FIXED"), value: 0 },
					{ text: I18N.prop("FACILITY_DEVICE_BEACON_TYPE_MOVABLE"), value: 1 }
				]
			}
		});

		var tempHumiTypeFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
			options : {
				optionLabel: I18N.prop("FACILITY_DEVICE_ALL_TEMP_HUMI"),
				dataSource: [
					{ text: I18N.prop("FACILITY_DEVICE_TYPE_TEMP_AND_HUMIDITY_SENSOR"), value: 0 },
					{ text: I18N.prop("FACILITY_DEVICE_TEMP_HUM_TYPE_HUMIDITY_SENSOR"), value: 1 },
					{ text: I18N.prop("FACILITY_DEVICE_TEMP_HUM_TYPE_TEMP_SENSOR"), value: 2 }
				]
			}
		});

		//Control Point 제어 Text Box 초기화 및 유효성 체크, 이벤트 처리
		var controlPointListDataBound = function(e){
			var widget = e.sender;
			var ds = widget.dataSource;

			var openMsgDialog = function(msg){
				var dialog = $("<div/>").kendoCommonDialog({
					isCustomActions : true,
					actions : [{
						text : I18N.prop("COMMON_BTN_OK"),
						action : function(evt){
							evt.sender.close();
							evt.sender.destroy();
							evt.sender.element.remove();
						}
					}]
				}).data("kendoCommonDialog");
				dialog.message(msg);
				dialog.open();
			};

			var keyUpEvt = function(evt){
				var self = $(this);
				var value = self.val();
				var numeric = self.data("kendoNumericTextBox");
				var allowChar = /^[0-9]+$/;
				var beforeValue;
				if(numeric.pointType == "aoav"){
					allowChar = /^[0-9.]+$/;
				}
				//[17-04-2018]들어가지 않는 if문 -jw.lim
				if(value != "" && !value.match(allowChar)){
					beforeValue = self.data("beforeValue");
					if(typeof beforeValue !== "undefined" && beforeValue !== null){		//[17-04-2018]논리 오류 수정 : or 연산 -> and 연산 -jw.lim
						beforeValue = Number(beforeValue);
						self.val(beforeValue);
						//popup
						openMsgDialog(I18N.prop("COMMON_INVALID_CHARACTER"));
					}
				}

				var min = numeric.min();
				var max = numeric.max();
				value = Number(value);
				min = Number(min);
				max = Number(max);

				if(value < min || value > max){
					//popup
					beforeValue = self.data("beforeValue");
					numeric.value(beforeValue);
					openMsgDialog(I18N.prop("COMMON_INVALID_MIN_MAX", min, max));
				}
			};

			var changeEvt = function(evt){
				var self = $(this);
				var value = self.val();
				if(value == ""){
					var beforeValue = self.data("beforeValue");
					self.val(beforeValue);
				}
			};


			$(e.sender.element).find(".device-point-numeric").each(function(){
				var self = $(this);
				var type = self.data("type");
				var tr = self.closest("tr");
				var uid = tr.data("uid");
				var item = ds.getByUid(uid);
				var numeric;

				var min, max;
				if(type == "dodv"){
					min = 0;
					max = 1;
					if(item && item.controlPoint){
						if(item.controlPoint.minimumValue){
							min = item.controlPoint.minimumValue;
						}
						if(item.controlPoint.maximumValue){
							max = item.controlPoint.maximumValue;
						}
					}

					numeric = self.kendoNumericTextBox({
						format : "n0", min : min, max : max,
						round : false,
						spinners : false
					}).data("kendoNumericTextBox");
					numeric.pointType = type;
				}else{
					min = 0;
					max = 100;
					if(item && item.controlPoint){
						if(item.controlPoint.minimumValue){
							min = item.controlPoint.minimumValue;
						}
						if(item.controlPoint.maximumValue){
							max = item.controlPoint.maximumValue;
						}
					}

					numeric = self.kendoNumericTextBox({
						format : "n1", min : min, max : max,
						round : false,
						spinners : false,
						decimals : 2
					}).data("kendoNumericTextBox");
					numeric.pointType = type;
				}
				if(numeric){
					var val = numeric.element.val();
					numeric.element.data("beforeValue", val);
					numeric.element.bind("keyup", keyUpEvt);
					numeric.element.bind("change", changeEvt);
					//numeric.element.bind("keydown", keyDownEvt);
				}
			});
		};

		// 조명 제어 패널 뷰모델 - common-device-panel.js에 템플릿
		var lightControlPanelViewModel = {
			lightPanel: {
				lightingText: I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"),
				brightnessText: I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS") + ' (0 ~ 100 %)',
				noSelectedText: I18N.prop("FACILITY_NO_SELECTED_LIGHT"),
				noSelected: false,
				power: {
					invisible: true,
					mixed: false,
					active: false,
					click: function () {}
				},
				dimmingLevel: {
					invisible: true,
					value: 0,
					slide: function () {}
				}
			}
		};

		//각 기기 탭 별 Configuration
		var tabConfig = {
			"All" : {
				name : I18N.prop("COMMON_ALL"),
				routeUrl : "/allView",
				viewModel : {
					filters : [BaseConfig.baseStatusFilterConfig,
						BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.legendTemplate)],
					hideSearch : true
				},
				innerLayout : [{
					dataLayout : {
						map : BaseConfig.mapViewConfig
					}
				}]
			},
			"AirConditioner.Indoor" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"),
				routeUrl : "/sacIndoor",
				viewModel : {
					hideIndoorLegend : false,			//실내기 추가 범례 숨김 여부
					filters : [indoorTypeFilterConfig, BaseConfig.statusFilterConfig, indoorModeFilterConfig, BaseConfig.zoneFilterConfig,
						BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.indoorLegendTemplate)]
				},
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRow,
								columns :[
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"), width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false},
									{ title: I18N.prop("FACILITY_DEVICE_SAC_INDOOR_ON_INDOOR_VENTILATOR_DHW"), width:170,sortable: false, template: Template.statisticNumberOfOnIndoorDevices},
									{ title: I18N.prop("FACILITY_DEVICE_SAC_INDOOR_OFF_INDOOR_VENTILATOR_DHW"), width:170,sortable: false ,template: Template.statisticNumberOfOffIndoorDevices},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:80, sortable: false,template:Template.statisticNumberOfCritical},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:80, sortable: false,template:Template.statisticNumberOfWarning},
									{ field: "numberOfSchedules", title: I18N.prop("FACILITY_DEVICE_SAC_INDOOR_SCHEDULE"), width:80,sortable: false}
								]
							}
						}),
						map : BaseConfig.mapViewConfig,
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:100},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:100},
									{ title: I18N.prop("COMMON_STATUS"), width:80,sortable: false, template: Template.getStatusTemplate},
									{ title: I18N.prop("FACILITY_DEVICE_SAC_INDOOR_MODE"), width:70, template:DeviceUtil.getIndoorMode},
									{ title: I18N.prop("FACILITY_DEVICE_SAC_INDDOR_TEMPERATURE_SET_CURRENT"), width:150, sortable: false, template: Template.indoorTemperatureListTemplate},
									{ field:"locations", title: I18N.prop("COMMON_LOCATION"), width:100, template: DeviceUtil.getLocation, sortable: false},
									{ title: I18N.prop("COMMON_MENU_FACILITY_GROUP"), width:100, template:DeviceUtil.getGroup},
									{ title: I18N.prop("COMMON_MENU_FACILITY_SCHEDULE"), width:110, template:DeviceUtil.getHasSchedule},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:80,sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.indoorCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"AirConditionerOutdoor" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_SAC_OUTDOOR"),
				routeUrl : "/sacOutdoor",
				viewModel : {
					filters : [BaseConfig.selectAllButtonConfig]
				},
				innerLayout : [{
					dataLayout : {
						list : {
							widgetOptions : {
								columnDropDownList : true,
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:"10%",format: ""},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:"10%",format: "" },
									{ field: "electricCurrentControl", title: I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_CURRENT_LIMIT"), width:"25%",sortable: false, template: Template.outdoorCurrentLimitTemplate,
										dropDownOptions : { dataValueField : "value", dataTextField : "text", dataSource : Constants.outdoorControlConfig.electricCurrentControl, change : Api.patchOutdoorCurrentLimit}
									},
									{ field: "heatingCapacityCalibration", title: I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_HEATING_CAPACITY_CALIBRATION"), width:"25%",sortable: false,
										template: Template.outdoorHeatingCapacityCalibrationTemplate,
										dropDownOptions : { dataValueField : "value", dataTextField : "text", dataSource : Constants.outdoorControlConfig.heatingCapacityCalibration, change : Api.patchOutdoorHeatingCapacityCalibration }
									},
									{ field: "coolingCapacityCalibration", title: I18N.prop("FACILITY_DEVICE_SAC_OUTDOOR_COOLING_CAPACITY_CALIBRATION"), width:"25%",sortable: false,
										template: Template.outdoorCoolingCapacityCalibrationTemplate,
										dropDownOptions : { dataValueField : "value", dataTextField : "text", dataSource : Constants.outdoorControlConfig.coolingCapacityCalibration[temperatureUnit], change : Api.patchOutdoorCoolingCapacityCalibration }
									},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:"5%",sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}
					}
				},
				{
					dataLayout : {
						list : registrationListViewConfig,
						map : $.extend(true, {}, BaseConfig.mapViewConfig, {
							widgetOptions: {
								hasLegendControl: false
							}
						})
					}
				}]
			},
			"ControlPoint" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_POINT"),
				routeUrl : "/controlPoint",
				viewModel : {
					filters : [controlPointTypeFilterConfig, BaseConfig.baseStatusFilterConfig, BaseConfig.zoneFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.pointLegendTemplate)]
				},
				innerLayout : [{
					dataLayout : {
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "type", title: I18N.prop("FACILITY_POINT_INPUT_OUTPUT_TYPE"), width:"10%",template: Template.pointTypeTemplate },
									{ field: "tagName", title: I18N.prop("FACILITY_POINT_TAG_NAME"), width:70, sortable : { compare : DeviceUtil.sortablePointTagName }, template : DeviceUtil.getPointTagName},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:"10%"},
									{ field: "status", title: I18N.prop("COMMON_STATUS"), sortable: false, width : 80, template:Template.getStatusTemplate},
									{ field : "locations", title: I18N.prop("COMMON_LOCATION"), width:100, template: DeviceUtil.getLocation, sortable: false},
									{ title: I18N.prop("FACILITY_GROUP_GROUP"), width:100, template : DeviceUtil.getGroup},
									{ field: "value", title: I18N.prop("FACILITY_POINT_VALUE"), width:110, sortable : { compare : DeviceUtil.sortablePointValue }, template : Template.pointValueTemplate },
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:"5%",sortable: false, template : Template.detailIconTemplateById}
								],
								dataBound : controlPointListDataBound
							}
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"Meter" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"),
				routeUrl : "/energyMeter",
				viewModel : {
					filters : [meterTypeFilterConfig, BaseConfig.baseStatusFilterConfig, BaseConfig.zoneFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.baseLegendTemplate)]
				},
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRow,
								columns :[
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"), width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false, template:Template.statisticNumberOfRegisteredDevice},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), width:170,sortable: false, template:Template.statisticNumberOfNormalDevices},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:170, sortable: false,template:Template.statisticNumberOfCritical},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:170, sortable: false,template:Template.statisticNumberOfWarning}
								]
							}
						}),
						map : BaseConfig.mapViewConfig,
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:"10%"},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:"10%"},
									{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"), width:80,sortable: false, template:Template.getStatusTemplate},
									{ field : "locations", title: I18N.prop("COMMON_LOCATION"), width:80,sortable: false, template: DeviceUtil.getLocation},
									{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), width:80, sortable: false,template:DeviceUtil.getGroup},
									{ field: "type", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE"), width:80, template: DeviceUtil.getMeterType, sortable : { compare : DeviceUtil.sortableMeterType }},
									{ field: "consumptionCategory", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_CATEGORY"), width:80, template : DeviceUtil.getMeterCategoryType, sortable : { compare : DeviceUtil.sortableMeterCategoryType }},
									{ field: "currentConsumption", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_CURRENT_CONSUMPTION"), width:80, sortable: false, template : DeviceUtil.getMeterCurrentConsumptionUnit},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:"5%",sortable: false, template : Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.getDeviceCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"Light" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"),
				routeUrl : "/light",
				viewModel : $.extend(true, {}, lightControlPanelViewModel, {
					filters : [BaseConfig.statusFilterConfig, BaseConfig.zoneFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.legendTemplate)]
				}),
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRow,
								columns :[
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"),  width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false, template:Template.statisticNumberOfRegisteredDevice},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_ON"), width:170,sortable: false, template:Template.statisticNumberOfOnDevices},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_OFF"), width:170,sortable: false ,template:Template.statisticNumberOfOffDevices},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:80, sortable: false,template:Template.statisticNumberOfCritical},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:80, sortable: false,template:Template.statisticNumberOfWarning}
								]
							}
						}),
						map : BaseConfig.mapViewConfig,
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:"10%"},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:"10%"},
									{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"), width:80,sortable: false, template: Template.getStatusTemplate},
									{ field: "locations", title: I18N.prop("COMMON_LOCATION"), width:100, sortable: false, template: DeviceUtil.getLocation},
									{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), width:80, sortable: false, template: DeviceUtil.getGroup},
									{ field: "dimmingLevel", title: I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS"), width:80,sortable: false, template: DeviceUtil.getDimmingLevel},
									{ field: "schedules", title: I18N.prop("COMMON_MENU_FACILITY_SCHEDULE"), sortable: false, width:80, template: DeviceUtil.getHasSchedule},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:"5%",sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.getDeviceCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"Sensor.Motion" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_MOTION_SENSOR"),
				routeUrl : "/motion",
				viewModel : {
					filters : [ BaseConfig.baseStatusFilterConfig, BaseConfig.zoneFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.baseLegendTemplate)]
				},
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRow,
								columns :[
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"), width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false, template:Template.statisticNumberOfRegisteredDevice},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), width:170,sortable: false, template:Template.statisticNumberOfNormalDevices},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:170, sortable: false,template:Template.statisticNumberOfCritical},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:170, sortable: false,template:Template.statisticNumberOfWarning}
								]
							}
						}),
						map : BaseConfig.mapViewConfig,
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:"10%"},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:"10%"},
									{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"), width:80,sortable: false, template:Template.getStatusTemplate},
									{ field : "locations", title: I18N.prop("COMMON_LOCATION"), width:100, sortable: false, template: DeviceUtil.getLocation},
									{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), width:80, sortable: false, template:DeviceUtil.getGroup},
									{ field: "presences", title: I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE"), width:80, sortable: false, template:DeviceUtil.getMotionPresence},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:"5%",sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.getDeviceCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"Sensor.Temperature_Humidity" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_TEMP_AND_HUMIDITY_SENSOR"),
				routeUrl : "/temperatureHumidty",
				viewModel : {
					filters : [tempHumiTypeFilterConfig, BaseConfig.baseStatusFilterConfig, BaseConfig.zoneFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.baseLegendTemplate)]
				},
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRow,
								columns :[
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"), width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false, template:Template.statisticNumberOfRegisteredDevice},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), width:170,sortable: false, template:Template.statisticNumberOfNormalDevices},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:170, sortable: false,template:Template.statisticNumberOfCritical},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:170, sortable: false,template:Template.statisticNumberOfWarning}
								]
							}
						}),
						map : BaseConfig.mapViewConfig,
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:"10%"},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:"10%"},
									{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"), width:80,sortable: false, template:Template.getStatusTemplate},
									{ field: "locations", title: I18N.prop("COMMON_LOCATION"), width:100, sortable: false, template: DeviceUtil.getLocation},
									{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), width:80, sortable: false, template: DeviceUtil.getGroup},
									{ field: "temperatures", title: I18N.prop("FACILITY_DEVICE_TEMP_HUMI_CURRENT_TEMPERATURE"), width:80,sortable: false, template: DeviceUtil.getTempHumiTemperature},
									{ field: "humidities", title: I18N.prop("FACILITY_DEVICE_TEMP_HUMI_CURRENT_HUMIDITY"), sortable: false, width:80, template: DeviceUtil.getTempHumiHumidity},
									{ field: "weatherStation", title: I18N.prop("FACILITY_DEVICE_TEMP_HUM_WEATHER_STATION"), sortable: false, width:80, template: DeviceUtil.getTempWeatherStationOx},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:"5%",sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.getDeviceCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"Gateway" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"),
				routeUrl : "/gateway",
				viewModel : {
					filters : [BaseConfig.baseStatusFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.baseLegendTemplate)],
					actions : [BaseConfig.selectedTextActionConfig, BaseConfig.deleteBtnActionConfig, BaseConfig.registerBtnActionConfig, BaseConfig.detailBtnActionConfig]
				},
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRow,
								columns :[
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"), width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false, template:Template.statisticNumberOfRegisteredDevice},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), width:170,sortable: false, template:Template.statisticNumberOfNormalDevices},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:170, sortable: false,template:Template.statisticNumberOfCritical},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:170, sortable: false,template:Template.statisticNumberOfWarning}
								]
							}
						}),
						map : BaseConfig.mapViewConfig,
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:152},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:141},
									{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"),sortable: false, template: Template.getStatusTemplate, width:64},
									{ field : "locations", title: I18N.prop("COMMON_LOCATION"), template:DeviceUtil.getLocation, width:106, sortable : { compare : DeviceUtil.sortableLocation }},
									{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), template: DeviceUtil.getGroup, width:96, sortable : { compare : DeviceUtil.sortableGroup }},
									{ field: "macAddress", title: I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"),template: DeviceUtil.getMacAddress, width:141, sortable: {compare : DeviceUtil.sortableMacAddress }},
									{ field: "ipAddress", title: I18N.prop("FACILITY_DEVICE_NETWORK_IP_ADDRESS"), template: DeviceUtil.getIpAddress, width : 126, sortable : { compare : DeviceUtil.ipAddress }},
									{ field: "zigbee", title: I18N.prop("FACILITY_DEVICE_GATEWAY_ZIGBEE"), width:50,sortable: false, template: Template.gatewayZigbeeTemplate},
									{ field: "ble", title: I18N.prop("FACILITY_DEVICE_GATEWAY_BLE"), sortable: false, width:50, template: Template.gatewayListBleTemplate },
									{ field: "bleInterface", title: I18N.prop("FACILITY_DEVICE_GATEWAY_BEACON") + "#1 #2 #3", sortable: false, width:150, template: Template.gatewayListBleInterfaceTemplate },
									{ field: "schedules", title: I18N.prop("COMMON_MENU_FACILITY_SCHEDULE"), width:114, template: DeviceUtil.getHasSchedule, sortable : { compare : DeviceUtil.sortableHasSchedule }},
									{ field: "rules", title: I18N.prop("COMMON_MENU_FACILITY_RULE"), width:74, template: DeviceUtil.getHasRule, sortable : {compare : DeviceUtil.sortableHasRule }},
									{ field: "description", title: I18N.prop("COMMON_DESCRIPTION"), sortable: false, width:150, template: DeviceUtil.getDescription},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:70,sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.getDeviceCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"Beacon" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"),
				routeUrl : "/beacon",
				viewModel : {
					filters : [positionTypeFilterConfig, BaseConfig.baseStatusFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.baseLegendTemplate)],
					actions : [BaseConfig.selectedTextActionConfig, BaseConfig.deleteBtnActionConfig, BaseConfig.registerBtnActionConfig, BaseConfig.detailBtnActionConfig]
				},
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRowBeacon,
								columns :[
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"), width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false, template:Template.statisticNumberOfRegisteredDevice},
									{ title: I18N.prop("FACILITY_DEVICE_BEACON_POSITION_TYPE"), width:286, sortable: false, template:Template.statisticBeaconPositionType},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), width:170,sortable: false, template:Template.statisticBeaconNormal},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:170, sortable: false,template:Template.statisticBeaconDisconnected},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:170, sortable: false,template:Template.statisticBeaconWrongLocation}
								]
							}
						}),
						map : $.extend(true, {}, BaseConfig.mapViewConfig, {
							showRegisteredGateway : true
						}),
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:160},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:145},
									{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"), width:60,sortable: false, template:Template.getStatusTemplate},
									{ field : "locations", title: I18N.prop("COMMON_LOCATION"), template: DeviceUtil.getLocation,width:180, sortable : { compare : DeviceUtil.sortableLocation}},
									{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), template: DeviceUtil.getGroup, width:80, sortable : { compare : DeviceUtil.sortableGroup }},
									{ field: "macAddress", title: I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"), template: Template.bleMacAddressTemplate ,width:150, sortable : { compare : DeviceUtil.sortableBleMacAddress }},
									{ field: "uuid", title: "UUID", width:135, template: Template.bleUUIDTemplate, sortable : { compare : DeviceUtil.sortableBeaconUUID }},
									{ field: "major", title: "Major", sortable: false, width:75, template: DeviceUtil.getBleMajor},
									{ field: "minor", title: "Minor", sortable: false, width:75, template: DeviceUtil.getBleMinor},
									{ field: "txPower", title: "Tx Power", sortable: false, width:90, template: DeviceUtil.getBleTxPower},
									{ field: "schedules", title: I18N.prop("COMMON_MENU_FACILITY_SCHEDULE"), width:100, template: DeviceUtil.getHasSchedule, sortable : { compare : DeviceUtil.sortableHasSchedule}},
									{ field: "rules", title: I18N.prop("COMMON_MENU_FACILITY_RULE"), width:80, template: DeviceUtil.getHasRule, sortable : { compare : DeviceUtil.sortableHasRule}},
									{ field: "description", title: I18N.prop("COMMON_DESCRIPTION"), sortable: false, width:120, template: DeviceUtil.getDescription},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:70,sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.getDeviceCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"CCTV" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"),
				routeUrl : "/cctv",
				viewModel : {
					filters : [BaseConfig.baseStatusFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.baseLegendTemplate)],
					actions : [BaseConfig.selectedTextActionConfig, BaseConfig.deleteBtnActionConfig, BaseConfig.registerBtnActionConfig, BaseConfig.detailBtnActionConfig, BaseConfig.viewBtnActionConfig]
				},
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRow,
								columns : [
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"), width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"),  template:Template.statisticNumberOfRegsiteredDevices, width:80},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), width:170,sortable: false ,template:Template.statisticNumberOfNormalDevices},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:170, sortable: false,template:Template.statisticNumberOfCritical},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:170, sortable: false,template:Template.statisticNumberOfWarning}
								]
							}
						}),
						map : $.extend(true, {}, BaseConfig.mapViewConfig, {
							showRegisteredGateway : true
						}),
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:160},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:145},
									{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"), width:60,sortable: false, template: Template.getStatusTemplate},
									{ field : "locations", title: I18N.prop("COMMON_LOCATION"), width:175, template: DeviceUtil.getLocation, sortable : {compare : DeviceUtil.sortableLocation }},
									{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), width:80, template: DeviceUtil.getGroup, sortable : { compare : DeviceUtil.sortableGroup }},
									{ field: "macAddress", title: I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"), width:156, template: DeviceUtil.getMacAddress, sortable : { compare : DeviceUtil.sortableMacAddress }},
									{ field: "ipAddress", title: I18N.prop("FACILITY_DEVICE_NETWORK_IP_ADDRESS"), width:152, template: DeviceUtil.getIpAddress, sortable : { compare : DeviceUtil.sortableIpAddress}},
									{ field: "wifiStatus", title: I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_STATUS"), width:151, template: DeviceUtil.getCCTVWifiStatus, sortable : { compare : DeviceUtil.sortableCCTVWifiStatus }},
									{ field: "schedules", title: I18N.prop("COMMON_MENU_FACILITY_SCHEDULE"), width:100, template: DeviceUtil.getHasSchedule, sortable : {compare : DeviceUtil.sortableHasSchedule }},
									{ field: "rules", title: I18N.prop("COMMON_MENU_FACILITY_RULE"), width:80, template: DeviceUtil.getHasRule, sortable : {compare : DeviceUtil.sortableHasRule }},
									{ field: "description", title: I18N.prop("COMMON_DESCRIPTION"), sortable: false, width:150, template: DeviceUtil.getDescription},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:70,sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.getDeviceCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			},
			"SmartPlug" : {
				name : I18N.prop("FACILITY_DEVICE_TYPE_SMART_PLUG"),
				routeUrl : "/smart-plug",
				viewModel : {
					filters : [BaseConfig.statusFilterConfig, BaseConfig.selectAllButtonConfig, BaseConfig.legendTemplate(Template.legendTemplate)]
				},
				innerLayout : [{
					dataLayout : {
						statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
							widgetOptions : {
								dataBound: Template.getStatisticRow,
								columns : [
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"),  width:80},
									{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false, template:Template.statisticNumberOfRegisteredDevice},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_ON"), width:125,sortable: false, template:Template.statisticNumberOfOnDevices},
									{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_OFF"), width:125,sortable: false ,template:Template.statisticNumberOfOffDevices},
									{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:125, sortable: false,template:Template.statisticNumberOfCritical},
									{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:125, sortable: false,template:Template.statisticNumberOfWarning}
								]
							}
						}),
						map : $.extend(true, {}, BaseConfig.mapViewConfig, {
							showRegisteredGateway : true
						}),
						list : $.extend(true, {}, BaseConfig.listViewConfig, {
							widgetOptions : {
								columns : [
									{ field: "id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:"10%"},
									{ field: "name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:"10%"},
									{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"), width:80,sortable: false, template:Template.getStatusTemplate},
									{ field: "locations", title: I18N.prop("COMMON_LOCATION"), width:100, sortable: false, template: DeviceUtil.getLocation},
									{ field: "group", title: I18N.prop("FACILITY_GROUP_GROUP"), width:80, sortable: false, template:DeviceUtil.getGroup},
									{ field: "schedules", title: I18N.prop("COMMON_MENU_FACILITY_SCHEDULE"), sortable: false, width:80, template: DeviceUtil.getHasSchedule},
									{ title: I18N.prop("COMMON_BTN_DETAIL"), width:"5%",sortable: false, template:Template.detailIconTemplateById}
								]
							}
						}),
						grid : $.extend(true, {}, BaseConfig.gridViewConfig, {
							widgetOptions : { cardTemplate : Template.getDeviceCardTemplate }
						})
					}
				},
				{
					dataLayout : { list : registrationListViewConfig }
				}]
			}
		};

		var extendConfig = function(key, config){
			//각 Controller에서 해당 Key 값을 통하여 API를 호출하므로, List에 Push 전 Object에 할당 한다.
			config.key = key;
			return $.extend(true, {}, BaseConfig.deviceTabConfig, config);
		};

		var getTabConfigList = function(containsAllView, isMonitoringView, isRegisterView){
			var tabOrdering = Settings.getDeviceTypeOrdering();
			var key, config, i, max = tabOrdering.length, tabCount = 0;
			//tabEnabled -> Settings - Menu Configuration 적용 (Tab Show/Hide)
			//tabOrdering -> Settings - 기기 타입 Tab 순서 적용

			var tabConfigList = [];
			if(containsAllView && tabEnabled['All'] === true) {
				tabConfigList.push(extendConfig('All', tabConfig['All']));
				tabConfigList[0].innerLayout.splice(1, 1);
				// return tabConfigList;
				tabCount++;
			}
			for( i = 0; i < max; i++ ){
				key = tabOrdering[i];
				config = tabConfig[key];

				if(config){
					//Menu Configuration에 enabled == false 상태이므로 Pass.
					if(tabEnabled[key] === false) continue;

					//설치된 기기 타입의 탭만을 표시한다. 설치된 기기 타입이 아닐 경우 Pass.
					if(!Util.isInstalledType(key, true)) continue;

					//기기등록시 검색창을 표시하지 않는다.
					config = extendConfig(key, config);
					if (isRegisterView) {
						// config.viewModel.hideSearch = true;
						if (key != 'AirConditionerOutdoor') {
							config.viewModel.filters.splice(-1, 1);
						}
					}

					tabConfigList.push(extendConfig(key, config));
					if(isMonitoringView){
						tabConfigList[tabCount].innerLayout.splice(1, 1);
					}
					if(isRegisterView){
						tabConfigList[tabCount].innerLayout.splice(0, 1);
					}
					tabCount++;
				}
			}

			//Settings의 기기 타입 순서 리스트의 기기 개수가 맞지않을 경우의 예외처리
			//디바이스 타입 개수와 실제 Push 된 Tab 개수 차이 체크
			if(Object.keys(tabConfig).length != tabOrdering.length){
				//Settings 기기 타입 순서 리스트에 비어있는 기기 타입 값이 있을 경우 강제로 Tab 순서를 뒤로 추가
				for( key in tabConfig ){
					if(tabOrdering.indexOf(key) == -1
					   && tabEnabled[key] && Util.isInstalledType(key, true)){
						config = tabConfig[key];
						if(config){
							tabConfigList.push(extendConfig(key, config));
						}
					}
				}
			}

			return tabConfigList;
		};

		var getTabConfig = function(deviceType){
			var deviceTypeConfig = tabConfig[deviceType];
			if(!deviceTypeConfig){
				console.error("There is no configuration for type : " + deviceType);
				return null;
			}
			//각 Controller에서 해당 Key 값을 통하여 API를 호출하므로, List에 Push 전 Object에 할당 한다.
			deviceTypeConfig.key = deviceType;
			return deviceTypeConfig;
		};

		return {
			getTabConfig : getTabConfig,
			getTabConfigList : getTabConfigList,
			meterTypeFilterConfig : meterTypeFilterConfig,
			controlPointTypeFilterConfig : controlPointTypeFilterConfig,
			positionTypeFilterConfig : positionTypeFilterConfig,
			tempHumiTypeFilterConfig : tempHumiTypeFilterConfig
		};
	});
//# sourceURL=device/common/config/device-config.js
