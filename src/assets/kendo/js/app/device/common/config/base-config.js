define("device/common/config/base-config", [], function(){
	var kendo = window.kendo;
	var I18N = window.I18N;

	/**
	*
	* Routing 될 Widget View 옵션
	*
	**/
	var statisticViewConfig = {
		widget : kendo.ui.Grid,      //해당 영역에 보여줄 Widget. 초기화 시, new로 해당 Widget의 인스턴스를 생성함.
		routeUrl : "/statistic",           //Router로 동작 시, 표시되는 URL
		widgetOptions : {                  //초기화 할 Widget의 Option 값
			dataSource: [],
			height : "100%",
			scrollable: true,
			sortable: true,
			filterable: false,
			pageable: false
		}
	};

	var mapViewConfig = {
		widget : kendo.ui.CommonMapView,
		routeUrl : "/map",                 //Router로 동작 시, 표시되는 URL
		widgetOptions : {
			dataSource : []
		}
	};

	var listViewConfig = {
		widget : kendo.ui.Grid,
		routeUrl : "/list",           //Router로 동작 시, 표시되는 URL
		widgetOptions : {
			hasSelectedModel : true,
			dataSource : [],
			selectable: "multiple, row",
			height : "100%",
			scrollable : { virtual : true},
			sortable: true,
			filterable: false,
			pageable: false
		}
	};

	var gridViewConfig = {
		routeUrl : "/grid",               //Router로 동작 시, 표시되는 URL
		widget : kendo.ui.Grid,
		noRecords: true,
		widgetOptions : {
			hasSelectedModel : true,
			dataSource : [],
			selectable: "multiple, row",
			scrollable : { virtual : true},
			cardHeight : 206,
			cardNum : 5
		}
	};

	/**
	*
	* Filter 기능을 할 DropDownList, DropDownCheckBoxList, 전체 선택 버튼 옵션
	*
	**/

	var baseDropDownOptions = {
		invisible : false,      //숨김 여부
		disabled : false,       //비활성화 여부
		dataTextField: "text",
		dataValueField: "value",
		animation: false,
		value : null,
		open : function(){},                //MVVM 바인딩으로 이벤트 없을 경우에도 함수 정의 필요.
		close : function(){},               //정의 안하기 위해서는 device-base.html 템플릿 수정 필요.
		change : function(){},
		select : function(){}
	};

	var dropDownListConfig = {
		id : "device-type-filter",
		name : "type",
		type : "dropdownlist",
		liClassName: "",
		options : baseDropDownOptions
	};

	var dropDownCheckBoxListConfig = {
		type : "dropdowncheckbox",
		liClassName: "",
		options : $.extend(true, {}, baseDropDownOptions, { selectionChanged : function(){}, isAbleUnselectAll: true })
	};

	var baseStatusFilterConfig = $.extend(true, {}, dropDownCheckBoxListConfig, {
		id : "device-status-filter",
		name : "status",
		options : {
			emptyText: I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY"),
			selectAllText : I18N.prop("FACILITY_DEVICE_ALL_STATUS"),
			dataSource: [
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_NORMAL"), value: 1 },
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), value: 3 },
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), value: 4 }
			]
		}
	});

	var statusFilterConfig = $.extend(true, {}, baseStatusFilterConfig, {
		options : {
			dataSource: [
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_ON"), value: 1 },
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_OFF"), value: 2 },
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL"), value: 3 },
				{ "text": I18N.prop("FACILITY_DEVICE_STATUS_WARNING"), value: 4 }
			]
		}
	});

	var zoneFilterConfig = $.extend(true, {}, dropDownCheckBoxListConfig, {
		id : "device-zone-filter",
		name : "zone",
		options : {
			emptyText: I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY_ZONE"),
			selectAllText : I18N.prop("FACILITY_DEVICE_ALL_ZONE"),
			dataTextField: "name",
			dataValueField: "id"
		}
	});

	var selectAllButtonConfig = {
		type : "button",
		name : "selectAll",
		id : "device-select-all",          //해당 요소의 id 속성 값
		text : I18N.prop("COMMON_BTN_SELECT_ALL"),                    //버튼의 텍스트
		liClassName: "",
		options : {
			invisible : false,                  //숨김 여부
			disabled : false,                   //비활성화 여부
			click : function(){}
		}
	};

	var legendTemplate = function(legendHtml){
		var baseTemplate = kendo.template('<div class="legendNote">' +
			'<div><Label class="ic-help"></Label><p>' + I18N.prop("FACILITY_DEVICE_LEGEND") + '</p></div>' +
			'<div class="flyout">' +
				'<Label class="flyTail ic-flyout-legends "></Label>' +
				'#=legendHtml#' +
			'</div>' +
		'</div>');

		return {
			type : "template",
			id : "device-legend",
			liClassName: "",
			template : baseTemplate( { legendHtml : legendHtml } )
		};
	};

	var selectedTextActionConfig = {
		type : "template",
		name : "selectedText",
		id : "device-selected-text",
		template : "<span class='text-view'><span data-bind='text: options.selectedText'></span></span>",
		liClassName: "",
		options : {
			selectedText : I18N.prop("FACILITY_DEVICE_NO_SELECTED")
		}
	};

	var registerBtnActionConfig = {
		type : "button",
		id : "device-register-btn",
		name : "register",
		text : I18N.prop("COMMON_BTN_REGISTER"),
		liClassName: "",
		options : {
			invisible : true,
			disabled : true,
			click : function(){}
		}
	};

	var detailBtnActionConfig = {
		type : "button",
		id : "device-detail-btn",
		name : "detail",
		text : I18N.prop("COMMON_BTN_DETAIL"),
		liClassName: "",
		options : {
			invisible : false,
			disabled : true,
			click : function(){}
		}
	};

	var deleteBtnActionConfig = {
		type : "button",
		id : "device-delete-btn",
		name : "delete",
		text : I18N.prop("COMMON_BTN_DELETE"),
		liClassName: "",
		options : {
			invisible : false,
			disabled : true,
			click : function(){}
		}
	};

	var viewBtnActionConfig = {
		type : "button",
		id : "device-view-btn",
		name : "view",
		text : I18N.prop("COMMON_BTN_SHOW"),
		liClassName: "",
		options : {
			invisible : false,
			disabled : true,
			click : function(){}
		}
	};

	var monitoringLayoutConfig = {
		name : I18N.prop("FACILITY_DEVICE_MONITORING"),                       //View 이름
		layoutName : "monitoring",
		active : true,
		disabled : false,
		invisible : false,
		routeUrl : "/monitoring",                  //Router로 동작 시, 표시되는 URL
		dataLayout : {
			list : listViewConfig
		}
	};

	var registrationLayoutConfig = {
		name : I18N.prop("FACILITY_DEVICE_REGISTRATION"),
		layoutName : "registration",
		active : false,
		disabled : false,
		invisible : false,
		routeUrl : "/registration",
		dataLayout : {                          //Monitoring과 동일. Registration 화면에 해당하는 Widget과 Widget Option 설정
			map : mapViewConfig,
			list : listViewConfig
		}
	};

	var config = {
		name : "Tab Name",
		routeUrl : "/device-type",
		//View Model로 Kendo ObservableObject로 바인딩 됨. 현재 디바이스 타입 뷰에서 쓰일 Default ViewModel
		viewModel : {
			viewButtons : [                     //Statistics, Map, List, Grid 버튼
				{
					buttonClass : "ic ic-statistic",       //버튼에 적용할 css class
					viewName : "statistic"                 //해당 버튼 클릭 시, 표시할 뷰의 이름(하단 DataLayout에 정의된 각 View의 key값과 일치하여야 함.)
				},
				{
					buttonClass : "ic ic-location",
					viewName : "map"
				},
				{
					buttonClass : "ic ic-view-list",
					viewName : "list"
				},
				{
					buttonClass : "ic ic ic-view-2x2",
					viewName : "grid"
				}
			],
			registrationStatusButtons : [
				{
					name : I18N.prop("FACILITY_DEVICE_REGISTERED"),
					active : true,
					disabled : false,
					count : 0,
					click : function(){}
				},
				{
					name : I18N.prop("FACILITY_DEVICE_UNREGISTERED"),
					active : false,
					disabled : false,
					count : 0,
					click : function(){}
				}
			],
			searchFieldPlaceHolder : I18N.prop("COMMON_ENTER_SEARCH_TERMS"),
			searchFieldValue : '',
			searchKeyDown : function(){},
			searchClick : function(){},
			enableSearch : true,
			hideSearch : false,                 //검색 필드 숨김 여부
			hideSelectArea : false,             //필터링 콤보박스 영역 && 우측 Detail 버튼 영역 숨김 여부
			hideFilterArea : false,             //필터링 콤보박스 영역 숨김 여부
			hideActionArea : false,             //우측 Detail 버튼 영역 숨김 여부
			hideRegisterArea : true,            //Registered/UnRegisterd 버튼 숨김 여부
			hideRightPanel : true,              //우측(제어패널, 맵 뷰 리스트 등) 영역
			hideMapPanel : true,				//맵뷰 리스트 영역
			hideControlPanel : false,			//제어 패널 영역
			hideLightControlPanel : false,		//조명 제어 패널 영역
			hideMonitoringMapPanel : true,		//모니터링 맵뷰 리스트 영역
			hideRegistrationMapPanel : false,	//등록 맵뷰 리스트 영역
			filters : [],                       //필터링 콤보박스 영역 설정
			actions : [                                     //우측 Detail 버튼 영역 정의
				selectedTextActionConfig,
				registerBtnActionConfig,
				detailBtnActionConfig
			]
		},
		innerLayout : [                                    //탭 내 분리되는 Monitoring/Registration의 영역 정의 (본 컴포넌트에서는 InnerLayout으로 명시.)
			monitoringLayoutConfig,
			registrationLayoutConfig
		]
	};

	return {
		deviceTabConfig : config,
		statisticViewConfig : statisticViewConfig,
		mapViewConfig : mapViewConfig,
		listViewConfig : listViewConfig,
		gridViewConfig : gridViewConfig,
		dropDownListConfig : dropDownListConfig,
		dropDownCheckBoxListConfig : dropDownCheckBoxListConfig,
		baseStatusFilterConfig : baseStatusFilterConfig,
		statusFilterConfig : statusFilterConfig,
		zoneFilterConfig : zoneFilterConfig,
		selectAllButtonConfig : selectAllButtonConfig,
		legendTemplate : legendTemplate,
		selectedTextActionConfig : selectedTextActionConfig,
		registerBtnActionConfig : registerBtnActionConfig,
		detailBtnActionConfig : detailBtnActionConfig,
		deleteBtnActionConfig : deleteBtnActionConfig,
		viewBtnActionConfig : viewBtnActionConfig,
		monitoringLayoutConfig : registrationLayoutConfig
	};
});
//# sourceURL=device/common/config/base-config.js
