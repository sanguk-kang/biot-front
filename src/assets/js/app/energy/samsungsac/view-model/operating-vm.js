/**
	*
	*   <ul>
	*       <li>operating에 관련된 view 모델 설정 작업</li>
	*   </ul>
	*   @module app/energy/samsungsac/view-model/operating-vm
	*   @param {Object} CoreModule- 에너지 core 객체
	*   @param {Object} Common- samsungsac Common 객체
	*   @requires app/energy/core
	*   @requires app/energy/samsungsac/common/common
	*   @returns {Object} MainViewModel - MainViewModel 모델링 작업
	*   @returns {Array} Views - 라우터 view 리스트
	*   @returns {Array} typeFilterDataSource - 드롭다운 타입 필터 리스트
	*   @returns {Array} groupFilterDataSource - 드롭다운 그룹 필터 리스트
	*   @returns {Array} typeFilterText - typeFilterText 리스트
	*   @returns {Array} typeQuery - type query 리스트
	*/
define("energy/samsungsac/view-model/operating-vm", ["energy/core", "energy/samsungsac/common/common"], function(CoreModule, Common){		//[2018-04-11][Template 파라메타 미사용 제거]

	var Util = window.Util;
	var kendo = window.kendo;       // [2018-04-05][김기범][kendo 전역 사용으로 인한 방지 변수선언]
	var moment = window.moment;     // [2018-04-05][김기범][moment 전역 사용으로 인한 방지 변수선언]

	var typeFilterDataSource = [
		{text : "WattHour", value : "Meter.WattHour"},
		{text : "Gas", value : "Meter.Gas"},
		{text : "Water", value : "Meter.Water"},
		{text : "Calori", value : "Meter.Calori"}
	];

	var TEXT = Common.TEXT;
	/*설치되지 않은 기기 타입 삭제*/
	var i, deviceType, max = typeFilterDataSource.length;
	for( i = max - 1; i >= 0; i-- ){
		deviceType = typeFilterDataSource[i];
		deviceType = deviceType.value;
		if(!Util.isInstalledType(deviceType)){
			typeFilterDataSource.splice(i, 1);
		}
	}

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
					dataTextField: "text",
					optionLabel : TEXT.ENERGY_CATEGORY,
					dataValueField: "value",
					animation: false,
					dataSource: [
						{text : TEXT.ENERGY_OPERATING_TIME, value : 'operationTime'},
						{text : TEXT.ENERGY_POWER_GAS_USAGE, value : 'powerGasUsage'},
						{text : TEXT.ENERGY_OPERATING_RATE, value : 'operatingRate'}
					],
					open : function(){},
					close : function(){},
					change : function(){},
					select : function(){}
				}
			},
			{
				type: "dropdowncheckbox",
				id: "all-zone-list",
				disabled: false,
				invisible: false,
				options: {
					virtual : false,
					optionLabel: false,
					value: null,
					emptyText: TEXT.ENERGY_ALL_ZONE,
					showSelectAll: true,
					selectAllText: TEXT.ENERGY_ALL_ZONE,
					dataTextField: "name",
					dataValueField: "id",
					animation: false,
					dataSource: [],
					height: 230,
					applyBox: true,
					isAbleUnselectAll: true,
					open: function() {},
					close: function(e) {
						if (e) {
							if (e.sender.list.hasClass("k-state-border-up") && this.preventCloseCnt > 0) {
								e.preventDefault();
								this.preventCloseCnt--;
							}
						}
					},
					change: function() {},
					select: function(e) {
						if (e) {
							var isDisabled = e.item.hasClass("k-state-disabled");
							if (isDisabled) {
								e.preventDefault();
								this.preventCloseCnt = 2;
							}
						}
					}
				}
			},
			{
				type: "dropdowncheckbox",
				id: "group-list",
				disabled: false,
				invisible: false,
				options: {
					virtual : true,
					optionLabel: false,
					value: null,
					// emptyText: TEXT.ENERGY_DEVICE,
					emptyText: TEXT.FACILITY_DEVICE_DEVICE_NAME_ALL,
					//emptyText: "Group Name",
					showSelectAll: true,
					selectAllText: TEXT.FACILITY_DEVICE_DEVICE_NAME_ALL,
					//selectAllText: "All Group Name",
					dataTextField: "name",
					dataValueField: "id",
					animation: false,
					dataSource: [],
					height: 230,
					applyBox: true,
					cancelOption:true,
					open: function() {},
					close: function(e) {

					},
					change: function() {},
					select: function(e) {

					}
				}
			}
		],
		exportBtn: {
			active: true,
			disabled: false,
			click: function() {}
		}
	});

	var Views = {
		graph : {
			view : null,
			widget : null,
			routeUrl : "/operating/graph"
		},
		list : {
			view : null,
			widget : null,
			routeUrl : "/operating/list"
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
