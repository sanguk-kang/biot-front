define("operation/group/config/group-vm", [], function(){
	var kendo = window.kendo;
	var I18N = window.I18N;
	//그룹 타입 (일반(None), 에너지 분배(Energy Distribution))
	var groupTypeFilterDataSource = [
		{text: I18N.prop("FACILITY_GROUP_ENERGY_DISTRIBUTION_ALL_TYPES"), value: ""},
		{text: I18N.prop("FACILITY_GROUP_ENERGY_DISTRIBUTION_NONE"), value: "General"},
		{text: I18N.prop("FACILITY_GROUP_ENERGY_DISTRIBUTION"), value: "EnergyDistribution"}
	];

	var MainViewModel = kendo.observable({
		filters : [
			{
				type : "dropdownlist",
				id : "group-type-list",
				disabled : false,
				invisible : false,
				options : {
					optionLabel : "",
					dataTextField: "text",
					dataValueField: "value",
					animation: false,
					dataSource: groupTypeFilterDataSource,
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			}
		],
		actions : [
			{
				type : "template",
				id : "spanSelectedCount",
				template : "<span class='text-view'><span data-bind='text: options.selectedText'></span></span>",
				options : {
					selectedText : I18N.prop("FACILITY_GROUP_MESSAGE_NOTI_GROUP_NOT_SELECTED")
				}
			},
			{
				type : "button",
				id : "group-create-btn",
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
				id : "group-edit-btn",
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
				id : "group-delete-btn",
				text : I18N.prop("COMMON_BTN_DELETE"),
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

//# sourceURL=operation-group-vm.js