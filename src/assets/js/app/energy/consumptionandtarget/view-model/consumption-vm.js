/**
	*
	*   <ul>
	*       <li>consumption에 관련된 view 모델 설정 작업</li>
	*   </ul>
	*   @module app/energy/consumptionandtarget/view-model/consumption-vm
	*   @param {Object} CoreModule- 에너지 core 객체
	*   @param {Object} Common- sacMonitoring Common 객체
	*   @param {Object} Template- sacMonitoring Template 객체
	*   @requires app/energy/core
	*   @requires app/energy/consumptionandtarget/common/common
	*   @requires app/energy/consumptionandtarget/template/target-template
	*   @returns {Object} MainViewModel - MainViewModel 모델링 작업
	*   @returns {Array} Views - 라우터 view 리스트
	*   @returns {Array} typeFilterDataSource - 드롭다운 타입 필터 리스트
	*   @returns {Array} groupFilterDataSource - 드롭다운 그룹 필터 리스트
	*   @returns {Array} typeFilterText - typeFilterText 리스트
	*   @returns {Array} typeQuery - type query 리스트
	*/
define("energy/consumptionandtarget/view-model/consumption-vm", ["energy/core", "energy/consumptionandtarget/common/common"], function(CoreModule, Common){
	var Util = window.Util;
	var TEXT = Common.TEXT;
	var kendo = window.kendo;
	var moment = window.moment;

	var typeFilterDataSource = Util.getEnergyMeterTypeList();

	var groupFilterDataSource = [];
	var groupData = Common.groupFilterDataSource;

	for( var j = 0; j < groupData.length; j++ ){
		var data = groupData[j];
		groupFilterDataSource[j] = {text : data[j].text, value : data[j].value};
	}
	/*/devices API 호출 시 쓰이는 type query 리스트의 .join(",") 을 써서 types= 에 실어 보내기 위해 쓰였음.*/
	var typeQuery = ["Meter.*"];

	var typeFilterText = {
		"Meter.WattHour" : "WattHour",
		"Meter.Gas" : "Gas",
		"Meter.Water" : "Water",
		"Meter.Calori" : "Calori"
	};

	var MainViewModel = kendo.observable({
		/*그래프, 리스트 전환 버튼*/
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
		/*일/월/연 버튼*/
		dayBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		monthBtn : {
			active : false,
			disabled : false,
			click : function(){}
		},
		yearBtn : {
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
		exportBtn: {
			active: true,
			disabled: false,
			click: function() {}
		},
		//Default 날짜
		//jQuery 라이브러리로 할 경우 굳이 View Model로 안하고, HTML에서 View Model 삭제 후 Selector로 해도 됨.
		formattedDate : moment().format("L").replace(/\./gi, "-"),
		filters : [
			{
				type : "dropdownlist",
				id : "device-type-list",
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
				type: "dropdowncheckbox",
				id: "group-list",
				disabled: false,
				invisible: false,
				options: {
					optionLabel: false,
					value: null,
					emptyText: TEXT.COMMON_MENU_FACILITY_GROUP,
					showSelectAll: true,
					selectAllText: TEXT.ENERGY_ALL_GROUP,
					dataTextField: "name",
					dataValueField: "id",
					animation: false,
					dataSource: groupFilterDataSource,
					cancelOption:true,
					height: 230,
					applyBox: true,
					open: function() {},
					close: function(e) {
					},
					change: function() {},
					select: function(e) {

					}
				}
			}
		]
	});

	var Views = {
		graph : {
			view : null,
			widget : null,
			routeUrl : "/graph"
		},
		list : {
			view : null,
			widget : null,
			routeUrl : "/list"
		}
	};
	return {
		MainViewModel : MainViewModel,
		Views : Views,
		typeFilterDataSource : typeFilterDataSource,
		groupFilterDataSource : groupFilterDataSource,
		typeFilterText : typeFilterText,
		typeQuery : typeQuery
	};
});

//# sourceURL=energy/consumption/view-model/consumption-vm.js