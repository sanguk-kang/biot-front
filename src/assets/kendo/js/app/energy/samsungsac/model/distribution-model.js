/**
	*
	*   <ul>
	*       <li>distribution에 관련된 모델 설정 작업</li>
	*   </ul>
	*   @module app/energy/samsungsac/model/monitoring-model
	*   @returns {Array} MockData - 테스트를 위한 목데이터.
	*   @returns {Object} createDataSource - 서버에서 응답되는 데이터를 가공하는 메소드
	*   @returns {Object} createExcelContent - 액셀 출력시에 액셀 내용 커스터마이징을 위한 메소드.
	*/
define("energy/samsungsac/model/distribution-model", [], function(){
	var moment = window.moment;
	var I18N = window.I18N;
	var kendo = window.kendo;
	var MS_OFFICE_NUMBER_FORMAT = "#,###0.0"; //액셀의 숫자 포맷 설정.(ex 1,234,567.0)
	var model = {
		"dmsGroupId": 1001,
		"dmsGroupName": "Group 1",
		"dvmPower": 1000,
		"dvmGas": 1000,
		"pumpPower": 1000,
		"coolingTowerPower": 1000,
		"boilerGas": 1000,
		"waterTank": 1000,
		"totalPower": 1000,
		"totalWater": 1000,
		"totalGas": 1000
	};
	var MockData = [{
		"dmsGroupId": 1001,
		"dmsGroupName": "Group 1",
		"dvmPower": 1234.123,
		"dvmGas": 1234.123,
		"pumpPower": 1234.123,
		"coolingTowerPower": 1234.123,
		"boilerGas": 1234.123,
		"waterTank": 1234.123,
		"totalPower": 1234.123,
		"totalWater": 1234.123,
		"totalGas": 1234.123
	}, {
		"dmsGroupId": 1002,
		"dmsGroupName": "Group 2",
		"dvmPower": 1.1,
		"dvmGas": 1.01,
		"pumpPower": 0,
		"coolingTowerPower": 20.002,
		"boilerGas": 302.33,
		"totalPower": 1231231.12,
		"totalWater": 1000,
		"totalGas": 1000
	}, {
		"dmsGroupId": 1003,
		"dmsGroupName": "Group 3",
		"dvmPower": 1000,
		"dvmGas": 1000,
		"pumpPower": 1000,
		"coolingTowerPower": 1000,
		"boilerGas": 1000,
		"waterTank": 1000,
		"totalWater": 1000,
		"totalGas": 1000
	}];

	/**
	*   <ul>
	*   <li>서버로부터 온 데이터를 기반으로 그리드에서 사용하는 데이터소스를 생성한다.</li>
	*   </ul>
	*   @function createDataSource
	*   @param {Array} list - 그리드에 뿌려질 데이터 배열.
	*   @returns {void}
	*   @alias 없음
	*
	*/
	var createDataSource = function(list) {
		var i, key, max = list.length;
		for(i = 0; i < max; i++) {
			for (key in model) {
				//서버로부터 온 데이터에 모델에 규정된 attr 이 없다면, "-" 로 지정한다.
				if (typeof list[i][key] == "undefined") {
					list[i][key] = "-";
				}
			}
		}
		return new kendo.data.DataSource({data: list});
	};

	var convertDateFormat = function(datePickerValue) {
		var y = datePickerValue.getFullYear();
		var m = datePickerValue.getMonth();
		var d = datePickerValue.getDate();
		m = kendo.toString(m + 1, '00');
		d = kendo.toString(d, '00');
		var formatted = y + '-' + m + '-' + d;
		return formatted;
	};

	/**
	*   <ul>
	*   <li>액셀의 export 시, 내보낼 액셀을 커스터마이징 하는 핸들러.</li>
	*   </ul>
	*   @function createExcelContent
	*   @param {Object} startDate - 시작일 데이트 객체.
	*   @param {Object} endDate - 종료일 데이트 객체.
	*   @param {Object} excelSheet - 출력된 액셀 객체.
	*   @returns {void}
	*   @alias 없음
	*
	*/
	var createExcelContent = function(startDate, endDate, excelSheet) {
		var startDateStr = convertDateFormat(startDate);
		var endDateStr = convertDateFormat(endDate);
		var groupCount = excelSheet.rows.filter(function(item) {return item.type == "data";}).length;
		var excelHeaderPart = [
			{
				cells: [{
					background: "#fff",
					colSpan: 3,
					color: "#333",
					rowSpan: 1,
					value: ''
				}]
			},
			{
				cells: [{
					background: "#fff",
					colSpan: 2,
					color: "#333",
					rowSpan: 1,
					value: I18N.prop("FACILITY_GROUP_ENERGY_DISTRIBUTION_GROUP")
				}]
			},
			{
				cells: [{
					background: "#7a7a7a",
					colSpan: 1,
					color: "#fff",
					rowSpan: 2,
					value: I18N.prop("ENERGY_INQUIRY_TARGET")
				}, {
					background: "#fff",
					colSpan: 2,
					color: "#333",
					rowSpan: 1,
					value: I18N.prop("ENERGY_NUMBER_OF_GROUP") + ' : ' + groupCount
				}]
			},
			{
				cells: [{
					background: "#7a7a7a",
					colSpan: 1,
					color: "#fff",
					rowSpan: 1,
					value: I18N.prop("ENERGY_INQUIRED_PERIOD")
				},{
					background: "#fff",
					colSpan: 2,
					color: "#333",
					rowSpan: 1,
					value: startDateStr + "~" + endDateStr
				}]
			}
		];
		var i, j, max = 0;
		//액셀 제목 부분에서 <br/> 등과 같은 html 태그 요소 제거.
		max = excelSheet.rows[1].cells.length;
		for( i = 0; i < max; i++ ) {
			excelSheet.rows[1].cells[i].value = excelSheet.rows[1].cells[i].value.replace("<br/>","");
		}
		//액셀 최상위 부분에 조회기간, 조회 대상 등을 추가.
		max = excelHeaderPart.length;
		for( i = 0; i < max; i++ ) {
			excelSheet.rows.unshift(excelHeaderPart[i]);
		}
		excelSheet.freezePane.rowSplit = 1; //1행(row) 까지 고정 해더로 지정.
		//액셀 열 사이즈 설정.
		excelSheet.columns = [
			{autoWidth: true}, {width: 130}, {width: 130},
			{width: 80}, {width: 80}, {width: 80}, {width: 80},
			{width: 80}, {width: 80}, {width: 80}
		];
		//액셀 정렬및 숫자 포맷 설정.
		for(i = 0; i < excelSheet.rows.length; i++) {
			//액셀의 모든 셀에 텍스트 가운데 정렬 적용.
			for(j = 0; j < excelSheet.rows[i].cells.length; j++) {
				excelSheet.rows[i].cells[j]["verticalAlign"] = "center";
				excelSheet.rows[i].cells[j]["textAlign"] = "center";
			}
			//데이터 부분에 숫자 포맷 설정.(ex 1,234,567.0)
			if(typeof excelSheet.rows[i].type != 'undefined' && excelSheet.rows[i].type == 'data') {
				for(j = 1; j < excelSheet.rows[i].cells.length; j++) {
					excelSheet.rows[i].cells[j].format = MS_OFFICE_NUMBER_FORMAT;
				}
			}
		}

	};

	return {
		MockData: MockData,
		createDataSource: createDataSource,
		createExcelContent: createExcelContent
	};
});
