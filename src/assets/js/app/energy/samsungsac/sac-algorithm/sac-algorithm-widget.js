/**
*
*   <ul>
*       <li>Settings - Algorithm에서 표시할 요금제 팝업 옵션 값 설정 및 인스턴스를 생성한다.</li>
*       <li>Message/Confirm Dialog 등의 인스턴스를 생성한다.</li>
*   </ul>
*   @module app/energy/samsungsac/sac-algorithm/sac-algorithm-widget
*   @requires config
*   @requires lib/moment
*
*/
define("energy/samsungsac/sac-algorithm/sac-algorithm-widget", ["energy/core", "energy/samsungsac/sac-algorithm/sac-algorithm-template",
	"energy/samsungsac/sac-algorithm/sac-algorithm-vm"], function(CoreModule, Template, ViewModel){
	var I18N = window.I18N;
	var kendo = window.kendo;

	var msgDialog, msgDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");

	var confirmDialog, confirmDialogElem = $("<div/>");
	confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");


	var powerPricingDialog, powerPricingDialogElem = $("<div/>");
	powerPricingDialog = powerPricingDialogElem.kendoCommonDialog({
		title : I18N.prop("SETTINGS_ALGORITHM_SET_POWER_PRICING"),
		width : 1841,
		height : 794,
		timeout : 0,
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE"),
				visible : true,
				disabled : false,
				action : function(e){
					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE"),
				visible : false,
				disabled : false,
				action : function(e){
					e.sender.trigger("onClose");
					e.sender.trigger("onClosed");
				}
			}
		],
		content : "<div class='algorithm-power-pricing-popup-content'><div class='algorithm-set-power-pricing-top'><div class='title tbc'>" + I18N.prop("SETTINGS_ALGORITHM_POWER_PRICING") + "</div><div class='tbc'><input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:dropDownList.value, events:{change:dropDownList.change}, source:dropDownList.dataSource, invisible:isEdit' class='power-select'/><span data-bind='visible:isEdit'><input type='text' id='prc-pricing-name' data-role='commonvalidator' data-type='name' class='k-input edit-name-field' data-bind='value:editName' required/></span></div><div class='tbc' data-bind='invisible:isEdit'><button class='k-button' data-bind='events:{click:clickEditBtn}, disabled:isEmpty'>" + I18N.prop("COMMON_BTN_EDIT") + "</button></div><div class='tbc' data-bind='invisible:isEdit'><button class='k-button' data-bind='events:{click:clickCreateBtn}'>" + I18N.prop("COMMON_BTN_ADD") + "</button></div><div class='tbc' data-bind='invisible:isEdit'><button class='k-button' data-bind='events:{click:clickTopDeleteBtn}, disabled:isDisableDeleteBtn'>" + I18N.prop("COMMON_BTN_DELETE") + "</button></div></div><div class='power-pricing-edit-btn' data-bind='visible:isEdit'><div class='tbc'><span class='selected-text'>" + I18N.prop("COMMON_SELECTED") + " : <span data-bind='text:selectedNum'></span></span></div><div class='tbc'><button class='k-button' data-bind='events:{{click:clickAddBtn}'>" + I18N.prop("COMMON_BTN_ADD") + "</button></div><div class='tbc'><button class='k-button' data-bind='events:{click:clickDeleteBtn}, disabled:disabledDelete'>" + I18N.prop("COMMON_BTN_DELETE") + "</button></div></div><div class='display-grid-wrapper edit' data-bind='invisible:isEdit'><div class='algorithm-set-power-pricing-grid'></div></div><div class='display-grid-wrapper' data-bind='visible:isEdit'><div class='algorithm-set-power-pricing-edit-grid'></div></div></div>"
	}).data("kendoCommonDialog");

	var element = powerPricingDialog.element.find(".algorithm-power-pricing-popup-content");
	kendo.bind(element, ViewModel.powerPricingViewModel);

	var gridOptions = {                  //초기화 할 Widget의 Option 값
		columns : [
			{ title: I18N.prop("SETTINGS_ALGORITHM_WEEKDAY_WEEKEND"), width:"6.57%", template : Template.powerPricingWeekDayTempl },
			{ title: I18N.prop("SETTINGS_ALGORITHM_START_DATE"), width:"7.8%", template : Template.powerPricingStartDateTempl},
			{ title: I18N.prop("SETTINGS_ALGORITHM_END_DATE"), width:"7.8%", template : Template.powerPricingEndDateTempl},
			{ title: I18N.prop("SETTINGS_ALGORITHM_BASE_RATE") + '<br>/kW', width:"7.8%", template : Template.powerPricingBaseRateTempl},
			{ title: I18N.prop("SETTINGS_ALGORITHM_LEVEL1_RATE") + '<br>/kWh', width:"4.9%", template : Template.powerPricingLevel1RateTempl},
			{ title: I18N.prop("SETTINGS_ALGORITHM_LEVEL2_RATE") + '<br>/kWh', width:"4.9%", template : Template.powerPricingLevel2RateTempl},
			{ title: I18N.prop("SETTINGS_ALGORITHM_LEVEL3_RATE") + '<br>/kWh', width:"4.9%", template : Template.powerPricingLevel3RateTempl},
			{ title: I18N.prop("SETTINGS_ALGORITHM_HOURLY_RATE"), width:"57.6%", columns : []}
		],
		dataSource: [],
		height: "100%",
		scrollable: true,
		sortable: false,
		filterable: false,
		pageable: false,
		noRecords : {
			template : "<div class='no-records-text'>" + I18N.prop("COMMON_NO_CONTENT_LIST") + "</div>"
		}
	};
	var columns = gridOptions.columns;
	var hourlyLevelColumns = columns[columns.length - 1].columns;
	var i, num, max = 24;
	for( i = 0; i < max; i++ ){
		if(i < 10){
			num = "0" + i;
		}else{
			num = i + "";
		}
		hourlyLevelColumns.push({ title : num, template : Template["powerPricingTime" + num + "Templ"] });
	}
	console.error(columns);
	var powerPricingGrid, powerPricingGridElem = powerPricingDialogElem.find(".algorithm-set-power-pricing-grid");
	powerPricingGrid = powerPricingGridElem.kendoGrid(gridOptions).data("kendoGrid");

	gridOptions.hasCheckedModel = true;
	gridOptions.setCheckedAttribute = true;
	var editColumns = [
		{ title: I18N.prop("SETTINGS_ALGORITHM_WEEKDAY_WEEKEND"), width:"6.57%", template : Template.powerPricingEditWeekDayTempl },
		{ title: I18N.prop("SETTINGS_ALGORITHM_START_DATE"), width:"7.8%", template : Template.powerPricingEditStartDateTempl},
		{ title: I18N.prop("SETTINGS_ALGORITHM_END_DATE"), width:"7.8%", template : Template.powerPricingEditEndDateTempl},
		{ title: I18N.prop("SETTINGS_ALGORITHM_BASE_RATE") + '<br>/kW', width:"7.8%", template : Template.powerPricingEditBaseRateTempl},
		{ title: I18N.prop("SETTINGS_ALGORITHM_LEVEL1_RATE") + '<br>/kWh', width:"4.9%", template : Template.powerPricingEditLevel1RateTempl},
		{ title: I18N.prop("SETTINGS_ALGORITHM_LEVEL2_RATE") + '<br>/kWh', width:"4.9%", template : Template.powerPricingEditLevel2RateTempl},
		{ title: I18N.prop("SETTINGS_ALGORITHM_LEVEL3_RATE") + '<br>/kWh', width:"4.9%", template : Template.powerPricingEditLevel3RateTempl},
		{ title: I18N.prop("SETTINGS_ALGORITHM_HOURLY_RATE"), width:"57.6%", columns : []}
	];

	var editHourlyLevelColumns = [];
	for( i = 0; i < max; i++ ){
		if(i < 10){
			num = "0" + i;
		}else{
			num = i + "";
		}
		editHourlyLevelColumns.push({ title : num, template : Template["powerPricingEditTime" + num + "Templ"] });
	}

	editColumns[columns.length - 1].columns = editHourlyLevelColumns;
	gridOptions.columns = editColumns;

	var powerPricingEditGrid, powerPricingEditGridElem = powerPricingDialogElem.find(".algorithm-set-power-pricing-edit-grid");
	powerPricingEditGrid = powerPricingEditGridElem.kendoGrid(gridOptions).data("kendoGrid");

	//var powerPricingList, powerPricingListElem = powerPricingDialogElem.find(".power-select");
	//powerPricingList = powerPricingListElem.kendoDropDownList();


	return {
		msgDialog : msgDialog,
		confirmDialog : confirmDialog,
		powerPricingDialog : powerPricingDialog,
		powerPricingGrid : powerPricingGrid,
		powerPricingEditGrid : powerPricingEditGrid//,
		//powerPricingList : powerPricingList
	};

});

