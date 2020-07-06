/**
 *
 *   <ul>
 *       <li>consumption에 관련된 view 모델 설정 작업</li>
 *   </ul>
 *   @module app/energy/consumptionandtarget/view-model/target-vm
 *   @param {Object} CoreModule- 에너지 core 객체
 *   @param {Object} Common- consumption Common 객체
 *   @param {Object} Template- consumption Template 객체
 *   @requires app/energy/core
 *   @requires app/energy/consumptionandtarget/common/common
 *   @requires app/energy/consumptionandtarget/template/target-template
 *   @returns {Object} MainViewModel - MainViewModel 모델링 작업
 *   @returns {Array} Views - 라우터 view 리스트
 *   @returns {Array} typeFilterDataSource - 드롭다운 타입 필터 리스트
 *   @returns {Array} typeFilterText - typeFilterText 리스트
 *   @returns {Array} typeQuery - type query 리스트
 */
//[12-04-2018]안쓰는 코드 주석 - Template
// define("energy/consumption/view-model/target-vm", ["energy/core", "energy/consumption/common/common",
//        "energy/consumption/template/target-template"], function(CoreModule, Common, Template){
define("energy/consumptionandtarget/view-model/target-vm", ["energy/core", "energy/consumptionandtarget/common/common"], function(CoreModule, Common){

	var kendo = window.kendo;
	var Util = window.Util;
	var TEXT = Common.TEXT;
	//[23-04-2018]MeterTypeList Util 함수 적용
	// var typeFilterDataSource = [
	// 	{text : TEXT.ENERGY_METER_TYPE_WATTHOUR, value : "Meter.WattHour"},
	// 	{text : TEXT.ENERGY_METER_TYPE_GAS, value : "Meter.Gas"},
	// 	{text : TEXT.ENERGY_METER_TYPE_WATER, value : "Meter.Water"},
	// 	{text : "Calori", value : "Meter.Calori"}
	// ];
	//
	// /*설치되지 않은 기기 타입 삭제*/
	// var i, deviceType, max = typeFilterDataSource.length;
	// for( i = max - 1; i >= 0; i-- ){
	// 	deviceType = typeFilterDataSource[i];
	// 	deviceType = deviceType.value;
	// 	if(!Util.isInstalledType(deviceType)){
	// 		typeFilterDataSource.splice(i, 1);
	// 	}
	// }
	var typeFilterDataSource = Util.getEnergyMeterTypeList();
	//[23-04-2018]-jw.lim

	var groupFilterDataSource = [];
	// var groupData = Common.groupFilterDataSource;			//[12-04-2018]안쓰는 코드 주석

	//[12-04-2018]안쓰는 코드 주석
	// for( var j = 0; j <groupData.length; j++ ){
	// 	var data = groupData[j];
	// 	//groupFilterDataSource[j] = {text : data[j].text, value : data[j].value}
	// }
	/*/devices API 호출 시 쓰이는 type query 리스트의 .join(",") 을 써서 types= 에 실어 보내기 위해 쓰였음.*/
	var typeQuery = ["Meter.*"];

	var typeFilterText = {
		"Meter.WattHour" : "WattHour",
		"Meter.Gas" : "Gas",
		"Meter.Water" : "Water",
		"Meter.Calori" : "Calori"
	};

	var MainViewModel = kendo.observable({
		graphBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		listBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		/*날짜 Next/Prev/오늘 날짜 네비게이션*/
		nextBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		prevBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},

		filters : [
			{
				type : "dropdownlist",
				id : "device-type-list2",
				disabled : false,
				invisible : false,
				options : {
					optionLabel : TEXT.FACILITY_DEVICE_TYPE_ALL_METER,
					dataTextField: "text",
					dataValueField: "value",
					animation: false,
					dataSource: typeFilterDataSource,
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			},
			{
				type : "dropdownlist",
				id : "group-list2",
				disabled : false,
				invisible : false,
				options : {
					optionLabel : TEXT.COMMON_MENU_FACILITY_GROUP,
					dataTextField: "name",
					dataValueField: "id",
					animation: false,
					dataSource:  groupFilterDataSource,
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			}
		],
		actionMode : true,
		/*버튼은 모두 Invisible 이고, Group 선택 시, Edit 버튼이 보이고, Edit 버튼 클릭 시,
		Save/Cancel 버튼이 보여야함*/
		actions : [
			{
				type : "button",
				id : "target-edit",
				text : "Edit",
				invisible : true,
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
				id : "target-cancel",
				text : "Cancel",
				invisible : true,
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
				id : "target-save",
				text : "Save",
				invisible : true,
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
		MainViewModel : MainViewModel,
		typeFilterDataSource : typeFilterDataSource,
		typeFilterText : typeFilterText,
		typeQuery : typeQuery
	};
});

//# sourceURL=energy/consumption/view-model/target-vm.js
