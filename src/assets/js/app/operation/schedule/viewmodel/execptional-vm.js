//[13-04-2018]안쓰는 코드 주석 : CoreModule, Common -jw.lim
// define("operation/schedule/viewmodel/execptional-vm", ["operation/core", "operation/schedule/config/schedule-common"], function(CoreModule, Common){
define("operation/schedule/viewmodel/execptional-vm", [], function(){
	var kendo = window.kendo;
	var I18N = window.I18N;

	var MainViewModel = kendo.observable({
		calendarBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		listBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
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
				template : "<span class='text-view'><span data-bind='text: options.selectedText'></span></span>",
				options : {
					selectedText : I18N.prop("FACILITY_EXCEPTIONAL_DAY_NO_SELECTED")
				}
			},
			{
				type : "button",
				id : "schedule-create-btn",
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
		}
	});

	var Views = {
		main : {
			view : null,
			widget : null,
			routeUrl : "/exceptional",
			show : null,
			exceptionCalendarWidget: null
		}
	};

	return {
		MainViewModel : MainViewModel,
		Views : Views
	};
});
