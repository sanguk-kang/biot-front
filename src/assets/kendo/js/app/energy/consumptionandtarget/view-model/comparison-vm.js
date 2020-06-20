/**
	*
	*   <ul>
	*       <li>comparison에 관련된 view 모델 설정 작업</li>
	*   </ul>
	*   @module app/energy/consumptionandtarget/view-model/comparison-vm
	*   @param {Object} CoreModule- 에너지 core 객체
	*   @param {Object} Common- comparison Common 객체
	*   @requires app/energy/core
	*   @requires app/energy/consumptionandtarget/common/common
	*   @returns {Object} MainViewModel - MainViewModel 모델링 작업
	*   @returns {Array} Views - 라우터 view 리스트
	*   @returns {Array} typeFilterDataSource - 드롭다운 타입 필터 리스트
	*   @returns {Array} groupFilterDataSource - 드롭다운 그룹 필터 리스트
	*   @returns {Array} typeFilterText - typeFilterText 리스트
	*   @returns {Array} typeQuery - type query 리스트
	*/
//comparison-vm.js
define("energy/consumptionandtarget/view-model/comparison-vm", ["energy/core", "energy/consumptionandtarget/common/common"
], function(CoreModule, Common) {
	var kendo = window.kendo;
	var moment = window.moment;
	var Util = window.Util;
	var TEXT = Common.TEXT;
	var typeFilterDataSource = Util.getEnergyMeterTypeList();

	var groupFilterDataSource = [];
	var groupData = Common.groupFilterDataSource;
	//console.log(Common.groupFilterDataSource)
	for (var j = 0; j < groupData.length; j++) {
		var data = groupData[j];
		groupFilterDataSource[j] = {
			text: data[j].text,
			value: data[j].value
		};
	}
	//console.log(groupData, groupFilterDataSource)
	/*/devices API 호출 시 쓰이는 type query 리스트의 .join(",") 을 써서 types= 에 실어 보내기 위해 쓰였음.*/
	var typeQuery = ["Meter.*"];

	var typeFilterText = {
		"Meter.WattHour": "WattHour",
		"Meter.Gas": "Gas",
		"Meter.Water": "Water",
		"Meter.Calori": "Calori"
	};


	var MainViewModel = kendo.observable({
		/*그래프, 리스트 전환 버튼*/
		exportBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		graphBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		/*일/월/연 버튼*/
		dayBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		monthBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		yearBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		/*날짜 Next/Prev/오늘 날짜 네비게이션*/
		nextBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		prevBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		chartLeftArrowBtn: {
			active: true,
			disabled: false,
			click: function(){}
		},
		chartRightArrowBtn: {
			active: true,
			disabled: false,
			click: function(){}
		},
		//Default 날짜
		//jQuery 라이브러리로 할 경우 굳이 View Model로 안하고, HTML에서 View Model 삭제 후 Selector로 해도 됨.
		formattedDate: moment().format("L").replace(/\./gi, "-"),
		filters: [{
			type: "dropdownlist",
			id: "comparison-device-type-list",
			disabled: false,
			invisible: false,
			options: {
				optionLabel: TEXT.FACILITY_DEVICE_TYPE_ALL_METER,
				dataTextField: "text",
				dataValueField: "value",
				animation: false,
				dataSource: typeFilterDataSource,
				open: function() {},
				close: function() {},
				change: function() {},
				select: function() {}
			}
		},
		{
			type: "dropdowncheckbox",
			id: "comparison-group-list",
			disabled: false,
			invisible: false,
			options: {
				optionLabel: false,
				value: "Group",
				emptyText: TEXT.COMMON_MENU_FACILITY_GROUP,
				showSelectAll: false,
				dataTextField: "name",
				dataValueField: "id",
				animation: false,
				dataSource: groupFilterDataSource,
				cancelOption:true,
				height: 230,
				applyBox: true,
				restrictionNum: 3,
				selectedText: "ellipsis",
				//footerTemplate: "<div>test</div>",
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
		}]
	});

	var Views = {
		graph: {
			view: null,
			widget: null,
			routeUrl: "/graph"
		},
		list: {
			view: null,
			widget: null,
			routeUrl: "/list"
		}
	};
	return {
		MainViewModel: MainViewModel,
		Views: Views,
		typeFilterDataSource: typeFilterDataSource,
		groupFilterDataSource: groupFilterDataSource,
		typeFilterText: typeFilterText,
		typeQuery: typeQuery
	};
});

//# sourceURL=energy/comparison/view-model/comparison-vm.js
