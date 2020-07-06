define("operation/rule/view-model/rule-vm", [], function(){		//[2018-04-12][common CoreModule 파라메타 미사용으로 제거]
	var kendo = window.kendo;
	var I18N = window.I18N;

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
				template : "<span class='text-view'><span data-bind='text: options.selectedText'></span></span>",
				options : {
					selectedText : I18N.prop("FACILITY_RULE_MESSAGE_INFO_NONE_SELECT_RULE")
				}
			},
			{
				type : "button",
				id : "rule-create-btn",
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
				id : "rule-edit-btn",
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
				id : "rule-delete-btn",
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
				id : "rule-detail-btn",
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
		]
	});

	return {
		MainViewModel : MainViewModel
	};
});
//# sourceURL=operation/rule-view-model.js