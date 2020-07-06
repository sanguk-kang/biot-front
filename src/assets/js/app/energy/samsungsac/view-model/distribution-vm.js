/**
	*
	*   <ul>
	*       <li>distribution 에 관련된 view 모델 설정 작업</li>
	*   </ul>
	*   @module app/energy/samsungsac/view-model/distribution-vm
	*   @returns {Object} MainViewModel - MainViewModel 모델링 작업
	*   @returns {Object} gridOptions - 메인 화면에서 사용하는 그리드에 대한 옵션.
	*/
define("energy/samsungsac/view-model/distribution-vm", [], function(){
	var kendo = window.kendo;
	var I18N = window.I18N;
	var util = window.util;
	var NUMBER_FORMAT = "{0:n1}"; //kendo 숫자 커스텀 포맷.(ex 1,234,567.0)
	var MainViewModel = kendo.observable({
		//조회 버튼.
		viewBtn: {
			click: function(){}
		},
		//액셀 내보내기 버튼.
		exportBtn: {
			disabeld: false,
			click: function(){}
		}
	});
	var gridOptions = {
		dataSource: [],
		height: "calc(100% - 6px)",
		scrollable: true,
		groupable: false,
		sortable: true,
		filterable: false,
		pageable: false,
		hasCheckedModel: false,
		toolbar: ["excel"],
		excel: { allPages: true },
		columns: [{
			title: I18N.prop("ENERGY_GROUP"),
			field: "dmsGroupName"
		},{
			title: I18N.prop("ENERGY_GRID_DISTRIBUTION_DVM"),
			columns: [{
				title: I18N.prop("ENERGY_GRID_DISTRIBUTION_POWER") + "<br/>" + "(" + util.CHAR["WattHour"] + ")",
				field: "dvmPower",
				format: NUMBER_FORMAT
			},{
				title: I18N.prop("ENERGY_GRID_DISTRIBUTION_GAS") + "<br/>" + "(" + util.CHAR["Gas"] + ")",
				field: "dvmGas",
				format: NUMBER_FORMAT
			}]
		},{
			title: I18N.prop("ENERGY_GRID_DISTRIBUTION_PUMP"),
			columns: [{
				title: I18N.prop("ENERGY_GRID_DISTRIBUTION_POWER") + "<br/>" + "(" + util.CHAR["WattHour"] + ")",
				field: "pumpPower",
				format: NUMBER_FORMAT
			}]
		},{
			title: I18N.prop("ENERGY_GRID_DISTRIBUTION_COOLINGTOWER"),
			columns: [{
				title:I18N.prop("ENERGY_GRID_DISTRIBUTION_POWER") + "<br/>" + "(" + util.CHAR["WattHour"] + ")",
				field:"coolingTowerPower",
				format: NUMBER_FORMAT
			}]
		},{
			title: I18N.prop("ENERGY_GRID_DISTRIBUTION_BOILER"),
			columns: [{
				title: I18N.prop("ENERGY_GRID_DISTRIBUTION_GAS") + "<br/>" + "(" + util.CHAR["Gas"] + ")",
				field: "boilerGas",
				format: NUMBER_FORMAT
			}]
		},{
			title: I18N.prop("ENERGY_GRID_DISTRIBUTION_WATERTANK"),
			columns: [{
				title: I18N.prop("ENERGY_GRID_DISTRIBUTION_WATER") + "<br/>" + "(m³)",
				field: "waterTank",
				format: NUMBER_FORMAT
			}]
		},{
			title: I18N.prop("ENERGY_TOTAL"),
			columns: [{
				title: I18N.prop("ENERGY_GRID_DISTRIBUTION_POWER") + "<br/>" + "(" + util.CHAR["WattHour"] + ")",
				field: "totalPower",
				format: NUMBER_FORMAT
			},{
				title: I18N.prop("ENERGY_GRID_DISTRIBUTION_WATER") + "<br/>" + "(m³)",
				field: "totalWater",
				format: NUMBER_FORMAT
			},{
				title: I18N.prop("ENERGY_GRID_DISTRIBUTION_GAS") + "<br/>" + "(" + util.CHAR["Gas"] + ")",
				field: "totalGas",
				format: NUMBER_FORMAT
			}]
		}]
	};

	return {
		MainViewModel: MainViewModel,
		gridOptions: gridOptions
	};
});
