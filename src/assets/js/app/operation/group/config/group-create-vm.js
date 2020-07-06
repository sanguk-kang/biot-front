define("operation/group/config/group-create-vm", ["operation/core", "operation/group/config/group-common"], function(CoreModule, Common){

	var Util = window.Util;
	var I18N = window.I18N;
	var kendo = window.kendo;

	var typeFilterDataSource = Util.getTotalDeviceTypeDataSource();

	var typeQuery = ["AirConditioner.*", "AirConditionerOutdoor", "ControlPoint.AO",
		"ControlPoint.AI", "ControlPoint.DO", "ControlPoint.DI", "Meter.*",
		"Beacon", "Gateway", "Light", "CCTV", "Printer", "Sensor.*", "Etc" ];

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

	var MainViewModel = kendo.observable({
		mapBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		listBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		filters : [
			{
				type : "noneLabelDropdowncheckbox",
				id : "device-type-list",
				invisible : false,      //숨김 여부
				disabled : false,       //비활성화 여부
				options : {                 //생성될 위젯의 옵션
					optionLabel : I18N.prop("FACILITY_DEVICE_TYPE_ALL"),
					selectAllText : I18N.prop("FACILITY_DEVICE_TYPE_ALL"),
					emptyText: I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY"),
					dataTextField: "text",              //반영되지 않는 옵션의 경우 device-base.html 템플릿 수정 필요
					dataValueField: "value",
					animation: false,
					autoBind : false,
					showSelectAll: true,
					dataSource: typeFilterDataSource,
					select : function(){},
					click : function(){}
				}
			},
			{
				type : "dropdownlist",
				id : "device-sub-type-list",
				disabled : true,
				invisible : false,
				options : {
					optionLabel : I18N.prop("FACILITY_DEVICE_TYPE_SUB"),
					dataTextField: "displayType",
					dataValueField: "type",
					animation: false,
					dataSource: [],
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			},
			{
				type : "button",
				id : "device-select-all",
				text : Common.MSG.TXT_SELECT_ALL,
				invisible : false,
				disabled : false,
				options : {
					click : function(){}
				}
			}
		],
		actions : [
			{
				type : "template",
				id : "spanSelectedCount",
				template : "<span class='text-view'><span data-bind='text: options.selectedText'></span></span>",
				options : {
					selectedText : I18N.prop("FACILITY_DEVICE_NO_SELECTED")
				}
			},
			{
				type : "button",
				id : "group-prev",
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
			{                                           //버튼 타입 filter 영역과 동일함.
				type : "button",
				id : "group-cancel",
				text : I18N.prop("COMMON_BTN_CANCEL"),
				invisible : false,
				disabled : false,
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
			floor : {     //floor
				num : 0,
				text : I18N.prop("COMMON_ALL"),
				active : false,
				click : function(){}
			}
		},
		hideMapPanel : false,
		hidePanel : false
	});

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
			}
		}
	};

	return {
		MainViewModel : MainViewModel,
		Views : Views,
		typeFilterDataSource : typeFilterDataSource,
		typeFilterText : typeFilterText,
		typeQuery : typeQuery
	};
});

//# sourceURL=operation-group-create-vm.js