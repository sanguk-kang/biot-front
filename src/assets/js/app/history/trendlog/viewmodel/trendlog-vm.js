define("history/trendlog/viewmodel/trendlog-vm", [], function(){
	var kendo = window.kendo;
	var I18N = window.I18N;
	var Util = window.Util;

	var typeFilterDataSource = [
		{text : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"), value : "AirConditioner."},
		{text : I18N.prop("FACILITY_DEVICE_TYPE_SAC_OUTDOOR"), value : "AirConditionerOutdoor"},
		{text : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"), value : "Light"},
		// {text : I18N.prop("FACILITY_DEVICE_TYPE_SENSOR"), value : "Sensor"},
		{text : I18N.prop("FACILITY_DEVICE_TYPE_TEMPERATURE_SENSOR"), value : "Sensor.Temperature"},
		{text : I18N.prop("FACILITY_DEVICE_TYPE_HUMIDITY_SENSOR"), value : "Sensor.Humidity"},
		{text : I18N.prop("FACILITY_DEVICE_TYPE_MOTION_SENSOR"), value : "Sensor.Motion"},
		{text : I18N.prop("FACILITY_DEVICE_TYPE_POINT"), value : "ControlPoint"}
		// {text : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"), value : "Meter"},
		//{text : I18N.prop("FACILITY_DEVICE_TYPE_TEMP_AND_HUMIDITY_SENSOR"), value : "Sensor.Temperature_Humidity"},
		// {text : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"), value : "Beacon"},
		// {text : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"), value : "CCTV"},
		// {text : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"), value : "Gateway"},
		// {text : I18N.prop("FACILITY_DEVICE_TYPE_PRINTER"), value : "Printer"}
	];

	var i, deviceType, max = typeFilterDataSource.length;
	for( i = max - 1; i >= 0; i-- ){
		deviceType = typeFilterDataSource[i];
		deviceType = deviceType.value;
		if(!Util.isInstalledType(deviceType, true)){
			typeFilterDataSource.splice(i, 1);
		}
	}

	var typeQuery = ["AirConditioner.*", "AirConditionerOutdoor",  "ControlPoint.*", "Sensor.*", "Light"];

	var MainViewModel = kendo.observable({
		searchField : {
			invisible : false,
			value : "",
			click : function(){

			},
			keydown : function(){

			}
		},
		actions : [
			{
				type : "template",
				id : "spanSelectedCount",
				template : "<span class='text-view'><span data-bind='text: options.selectedNum, attr: { id : id }'></span></span>",
				options : {
					selectedNum : I18N.prop("COMMON_SELECTED") + " : 0"
				}
			},
			{
				type : "button",
				id : "trendlog-create-btn",
				text : I18N.prop("COMMON_BTN_CREATE"),
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
				id : "trendlog-delete-btn",
				text : I18N.prop("COMMON_BTN_DELETE"),
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
				id : "trendlog-detail-btn",
				text : I18N.prop("COMMON_BTN_DETAIL"),
				invisible : false,
				disabled : true,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			}
		],
		category : {
			invisible : true,
			selected : {
				num : 0,
				active : false,
				click : function(){}
			},
			all : {     //floor
				num : 0,
				text : "All",
				active : false,
				click : function(){}
			},
			group : {
				num : 0,
				invisible : true,
				active : false,
				click : function(){}
			}
		}
	});

	var Views = {
		list : {
			routeUrl : "/list",
			view : null,
			widget : null,
			show : null
		},
		search : {
			routeUrl : "/search",
			view : null,
			widget : null,
			show : null,
			name : "Search Results"
		}
	};

	var excelExpotViewModel = kendo.observable({
		actions : [
			{
				type : "button",
				id : "history-view-btn",
				text : I18N.prop("COMMON_BTN_VIEW"),
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			},
			{
				type : "button",
				id : "trendlog-excel-export",
				text : I18N.prop('COMMON_BTN_EXPORT'),			//[14-05-18]버튼 다국어 적용 -jw.lim
				isEnabled: false,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			}
		]
	});

	return {
		MainViewModel : MainViewModel,
		Views : Views,
		typeFilterDataSource : typeFilterDataSource,
		typeQuery : typeQuery,
		excelExpotViewModel: excelExpotViewModel
	};
});
