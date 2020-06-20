/**
	*
	*   <ul>
	*       <li>monitoring에 관련된 view 모델 설정 작업</li>
	*   </ul>
	*   @module app/energy/samsungsac/view-model/monitoring-vm
	*   @returns {Object} MainViewModel - MainViewModel 모델링 작업
	*   @returns {Array} typeFilterDataSource - 드롭다운 타입 필터 리스트
	*   @returns {Array} typeFilterText -타입 필터 리스트
	*   @returns {Array} typeQuery - 타입 리스트
	*   @returns {Array} Views - 라우터 view 리스트
	*/
define("energy/samsungsac/view-model/monitoring-vm", [], function() {			//[2018-04-11][파라메타 CoreModule, Common, Template 미사용으로 제거]

	var Util = window.Util;
	var kendo = window.kendo;       // [2018-04-05][kendo 전역 사용으로 인한 방지 변수선언]
	var moment = window.moment;     // [2018-04-05][moment 전역 사용으로 인한 방지 변수선언]
	var I18N = window.I18N;

	var typeFilterDataSource = [{
		text: "WattHour",
		value: "Meter.WattHour"
	},
	{
		text: "Gas",
		value: "Meter.Gas"
	},
	{
		text: "Water",
		value: "Meter.Water"
	},
	{
		text: "Calori",
		value: "Meter.Calori"
	}
	];

	/*설치되지 않은 기기 타입 삭제*/
	var i, deviceType, max = typeFilterDataSource.length;
	for (i = max - 1; i >= 0; i--) {
		deviceType = typeFilterDataSource[i];
		deviceType = deviceType.value;
		if (!Util.isInstalledType(deviceType)) {
			typeFilterDataSource.splice(i, 1);
		}
	}

	//[2018-04-11][기존 for문안에 groupFilterDataSource 주석처리되어 해당 구문은 의미가 없어졌고 리턴하지도 않기에 주석처리]
	// var groupFilterDataSource = [];
	// var groupData = Common.groupFilterDataSource;
	//
	// for (var j = 0; j < groupData.length; j++) {
	// 	var data = groupData[j];
	// 	//groupFilterDataSource[j] = {text : data[j].text, value : data[j].value}
	// }
	/*/devices API 호출 시 쓰이는 type query 리스트의 .join(",") 을 써서 types= 에 실어 보내기 위해 쓰였음.*/
	var typeQuery = ["Meter.*"];

	var typeFilterText = {
		"Meter.WattHour": "WattHour",
		"Meter.Gas": "Gas",
		"Meter.Water": "Water",
		"Meter.Calori": "Calori"
	};

	var MainViewModel = kendo.observable({
		graphBtn: {
			active: true,
			disabled: false,
			click: function() {}
		},
		listBtn: {
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
		/*일/월/연 버튼*/
		monthBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		dayBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		runtimeBtn: {
			active: false,
			disabled: false,
			click: function() {}
		},
		formmatedDate: moment().format("L").replace(/\./gi, "-"),
		filters: [

			{
				type: "dropdownlist",
				id: "group-list-demand",
				disabled: false,
				invisible: false,
				options: {
					optionLabel: I18N.prop("ENERGY_DEVICE_NAME"),
					dataTextField: "text",
					dataValueField: "value",
					animation: false,
					dataSource: [],
					open: function() {},
					close: function() {},
					change: function() {},
					select: function() {}
				}
			}
		]
		/*버튼은 모두 Invisible 이고, Group 선택 시, Edit 버튼이 보이고, Edit 버튼 클릭 시,
		Save/Cancel 버튼이 보여야함*/
	});
	var Views = {
		graph: {
			view: null,
			widget: null,
			routeUrl: "/monitoring/graph"
		},
		list: {
			view: null,
			widget: null,
			routeUrl: "/monitoring/list"
		}
	};
	return {
		MainViewModel: MainViewModel,
		typeFilterDataSource: typeFilterDataSource,
		typeFilterText: typeFilterText,
		typeQuery: typeQuery,
		Views: Views
	};
});

//# sourceURL=energy/samsungsac/view-model/monitoring-vm.js
