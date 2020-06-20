//[13-04-2018]안쓰는 코드 주석 : CoreModule, Common -jw.lim
// define("operation/schedule/viewmodel/schedule-vm", ["operation/core", "operation/schedule/config/schedule-common"], function(CoreModule, Common){
define("operation/schedule/viewmodel/schedule-vm", [], function(){
	var kendo = window.kendo;
	var I18N = window.I18N;
	var createTypeFilterDataSource = [
		{text: I18N.prop("FACILITY_SCHEDULE_CREATE_FOLDER"), value: "Folder"},
		{text: I18N.prop("FACILITY_SCHEDULE_CREATE_SCHEDULE"), value: "Schedule"}
	];

	var MainViewModel = kendo.observable({
		calendarBtn : {
			active : false,
			disabled : false,
			invisible : false,
			click : function(){}
		},
		listBtn : {
			active : false,
			disabled : false,
			invisible : false,
			click : function(){}
		},
		listSearchField : {
			invisible : false,
			keywords: "",
			value : "",
			click : function(){

			},
			keydown : function(){

			}
		},
		isSearchMode: false,
		searchField : {
			invisible : true,
			keywords: "",
			keywordValue : "",
			click : function(){

			},
			keydown : function(){

			}
		},
		searchRemoveBtn: {
			list: {
				visible : false,
				click : function(e){ this.listSearchField.set('keywords', ''); this.searchRemoveBtn.list.set('visible', false); }
			},
			search: {
				visible : false,
				click : function(e){ this.searchField.set('keywords', ''); this.searchRemoveBtn.search.set('visible', false); }
			}
		},
		filters : [
			{
				type : "dropdownlist",
				id : "device-type-filter",
				disabled : false,
				invisible : true,
				options : {
					optionLabel : "All Device Type",
					dataTextField: "displayType",
					dataValueField: "type",
					animation: false,
					dataSource: [
						{
							displayType : "SAC Indoor",
							type : 0
						},
						{
							displayType : "Light",
							type : 1
						},
						{
							displayType : "SAC Indoor + Light",
							type : 2
						},
						{
							displayType : "Others",
							type : 3
						},
						{
							displayType : "Pause",
							type : 4
						}
					],
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			}
		],
		actions : [
			{
				type : "dropdownlist",
				id : "schedule-create-btn",
				disabled : false,
				invisible : false,
				options : {
					optionLabel : I18N.prop("COMMON_BTN_CREATE"),
					dataTextField: "text",
					dataValueField: "value",
					animation: false,
					dataSource: createTypeFilterDataSource,
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			},
			{                                           //버튼 타입 filter 영역과 동일함.
				type : "button",
				id : "schedule-create-only-file-btn",
				text : I18N.prop("COMMON_BTN_CREATE"),
				invisible : true,
				disabled : false,
				options : {
					click : function(){},
					dbclick : function(){},
					mouseover : function(){},
					mouseout : function(){}
				}
			},
			{                                           //버튼 타입 filter 영역과 동일함.
				type : "button",
				id : "schedule-edit-btn",
				text : I18N.prop("COMMON_BTN_EDIT"),
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
				type : "dropdownlist",
				id : "schedule-folder-move-btn",
				disabled : true,
				invisible : false,
				options : {
					optionLabel : I18N.prop('FACILITY_SCHEDULE_MOVE_FOLDER'),
					valueTemplate: I18N.prop("FACILITY_SCHEDULE_MOVE_FOLDER"),
					dataTextField: "name",
					dataValueField: "id",
					animation: false,
					dataSource: [],
					height: 503,
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			},
			{
				type : "button",
				id : "schedule-delete-btn",
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
				id : "schedule-detail-btn",
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
				text : I18N.prop("COMMON_ALL"),
				active : false,
				click : function(){}
			},
			group : {
				num : 0,
				invisible : true,
				active : false,
				click : function(){}
			}
		},
		searchNum : 0
	});

	var SearchViewModel = kendo.observable({
		init : function(){
			this.set("selectedNum", 0);
		},
		dateTypeFilter: {
			disabled: false,
			value: 'all',
			options: {
				dataSource: [{text:I18N.prop("FACILITY_SCHEDULE_ALL_SCHEDULE") ,value: 'all'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_MONTH") ,value: 'month'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_WEEK") ,value: 'week'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_DAY") ,value: 'day'}],
				select: function(e) {
					this.dateTypeFilter.set('value', e.dataItem.value); this.trigger('selectDateType', {value: e.dataItem.value});
				}
			}
		},
		// dateTypeFilter: {
		// 	value: null,
		// 	options:{
		// 		optionLabel : I18N.prop("FACILITY_DEVICE_TYPE_ALL"),
		// 		dataSource: [
		// 			{ value : 0, text : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR")},
		// 			{ value : 1, text : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT")},
		// 			{ value : 2, text : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR") + " + " + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT")},
		// 			{ value : 3, text : I18N.prop("FACILITY_DEVICE_OTHERS")},
		// 			{ value : 4, text : I18N.prop("COMMON_PAUSE")}
		// 		],
		// 		open : function(){},
		// 		close : function(){},
		// 		change : function(){},
		// 		select : function(){}
		// 	}
		// },
		todayButton: {
			text: I18N.prop('FACILITY_SCHEDULE_TODAY'),
			disabled: true
		},
		navigation: {
			isInvisible: false
		},
		selectedNum: 0,
		selectedText: function() {
			var result = I18N.prop('FACILITY_SCHEDULE_NO_SELECTED');
			var selNum = this.get('selectedNum');
			if (selNum > 0) result = I18N.prop('FACILITY_SCHEDULE_SELECTED', selNum);
			return result;
		}
	});

	window.SearchViewModel = SearchViewModel;

	var Views = {
		calendar : {
			view : null,
			widget : null,
			routeUrl : "/calendar",
			show : null,
			active: false
		},
		list : {
			routeUrl : "/list",
			view : null,
			widget : null,
			show : null,
			active: true
		},
		search : {
			routeUrl : "/search",
			view : null,
			widget : null,
			calendarWidget: null,
			show : null,
			name : "Search Results"
		}
	};

	return {
		MainViewModel : MainViewModel,
		SearchViewModel: SearchViewModel,
		Views : Views
	};
});

//For Debug
//# sourceURL=schedule-vm.js
