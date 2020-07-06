define("asset/monitoring/config/asset-config", ["device/common/config/base-config", "device/common/device-util",
	"device/common/device-template"], function(BaseConfig, DeviceUtil, Template){

	var I18N = window.I18N, Util = window.Util, tabEnabled = window.MENU_TABS_ENABLED ? window.MENU_TABS_ENABLED : {};
	var Settings = window.GlobalSettings;

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

	var assetTypeFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
		id : "asset-type-filter",
		name : "assetType",
		options : {
			optionLabel: I18N.prop("FACILITY_DEVICE_ALL_ASSET"),
			dataTextField: "name",
			dataValueField: "id",
			dataSource: []
		}
	});

	var assetPositionTypeFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
		id : "asset-position-type-filter",
		options : {
			optionLabel: I18N.prop("FACILITY_DEVICE_ALL_POSITION_TYPE"),
			dataSource : [
				{ text: I18N.prop("FACILITY_DEVICE_BEACON_TYPE_FIXED"), value: "Fixed" },
				{ text: I18N.prop("FACILITY_DEVICE_BEACON_TYPE_MOVABLE"), value: "Movable" }
			]
		}
	});

	var assetStatusFilterConfig = $.extend(true, {}, BaseConfig.dropDownListConfig, {
		id : "asset-status-filter",
		name : "status",
		options : {
			optionLabel: I18N.prop("FACILITY_DEVICE_ALL_STATUS"),
			dataSource: [
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), value: "Normal" },
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), value: "Alarm.Critical" },
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), value: "Alarm.Warning" }
			]
		}
	});

	var assetTypeBtnActionConfig = {
		type : "button",
		id : "asset-type-btn",
		name : "assetType",
		text : I18N.prop("SERVICE_ASSET_TYPE"),
		options : {
			invisible : false,
			disabled : true,
			click : function(){}
		}
	};

	var tabConfig = {
		"Asset" : {
			name : I18N.prop("COMMON_MENU_SERVICE_ASSET"),
			routeUrl : "/asset",
			viewModel : {
				filters : [assetTypeFilterConfig, assetPositionTypeFilterConfig, assetStatusFilterConfig, BaseConfig.selectAllButtonConfig,
					BaseConfig.legendTemplate(Template.baseLegendTemplate)],
				actions : [BaseConfig.selectedTextActionConfig, assetTypeBtnActionConfig, BaseConfig.registerBtnActionConfig, BaseConfig.deleteBtnActionConfig, BaseConfig.detailBtnActionConfig]
			},
			innerLayout : [{
				dataLayout : {
					statistic : $.extend(true, {}, BaseConfig.statisticViewConfig, {
						widgetOptions : {
							dataBound: Template.getStatisticRowAsset,
							columns : [
								{ field: "name", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_FLOOR"), width:80, template : Template.statisticAssetFloor},
								{ field: "assets_types_name", title: I18N.prop("SERVICE_ASSET_TYPE"), width:80, template : Template.statisticAssetTypes, sortable : false},
								{ field: "numberOfRegisteredDevices", title: I18N.prop("FACILITY_DEVICE_REGISTERED"), width:80, sortable: false, template:Template.statisticAssetRegisteredAssets},
								{ title: I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), width:170,sortable: false, template:Template.statisticAssetNormalDevices},
								{ field: "numberOfCriticalDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), width:170, sortable: false,template:Template.statisticAssetCriticalDevices},
								{ field: "numberOfWarningDevices", title: I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), width:170, sortable: false,template:Template.statisticAssetWarningDevices}
							]
						}
					}),
					map : $.extend(true, {}, BaseConfig.mapViewConfig, {
						widgetOptions : {
							canDragDeviceIcon : false, isForcedShowDevice : true
							//isForcedShowDevice 상세보기 Map 등록 팝업에서 설정하는 옵션으로, Asset에는 registrationStatus가 존재하지 않으므로, registrationStatus를 체크하지 않도록 한다.
						}
					}),
					list : $.extend(true, {}, BaseConfig.listViewConfig, {
						widgetOptions : {
							columns : [
								{ field: "number", title: I18N.prop("SERVICE_ASSET_NUMBER"), width:"10%"},
								{ field: "assets_types_name", title: I18N.prop("SERVICE_ASSET_TYPE"), width:"10%", template : DeviceUtil.getAssetType},
								{ field: "status", title: I18N.prop("FACILITY_DEVICE_ENERGY_METER_STATUS"), width:80,sortable: false, template: Template.getAssetStatusTemplate},
								{ field: "location", title: I18N.prop("COMMON_LOCATION"), width:100, template: DeviceUtil.getAssetLocation},
								{ field: "modelName", title: I18N.prop("SERVICE_ASSET_MODEL_NAME"), width:80, sortable: false},
								{ field: "serialNumber", title: I18N.prop("SERVICE_ASSET_SERIAL_NUMBER"), width:80,sortable: false},
								{ field: "managementOrganization", title: I18N.prop("SERVICE_ASSET_MANAGEMENT_ORGANIZATION"), sortable: false, width:80},
								{ field: "users", title: I18N.prop("SERVICE_ASSET_USERS"), width:80,sortable: false, template: DeviceUtil.getAssetUsers},
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
				dataLayout : {
					map : $.extend(true, {}, BaseConfig.mapViewConfig, {
						widgetOptions : {
							canDragDeviceIcon : false, isRegisterView : true
						}
					}),
					list : registrationListViewConfig
				}
			}]
		}
	};

	var extendConfig = function(key, config){
		//각 Controller에서 해당 Key 값을 통하여 API를 호출하므로, List에 Push 전 Object에 할당 한다.
		config.key = key;
		return $.extend(true, {}, BaseConfig.deviceTabConfig, config);
	};

	var getTabConfigList = function(){
		var key, config;
		//tabEnabled -> Settings - Menu Configuration 적용 (Tab Show/Hide)

		var tabConfigList = [];
		for( key in tabConfig ){
			config = tabConfig[key];
			//Menu Configuration에 enabled 상태 체크
			if(config && tabEnabled[key] !== false)  tabConfigList.push(extendConfig(key, config));
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
		getTabConfigList : getTabConfigList
	};
});
//# sourceURL=asset/monitoring/config/asset-config.js