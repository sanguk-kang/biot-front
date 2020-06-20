/**
	*
	*   <ul>
	*       <li>samsungsac에 관련된 view 모델 설정 작업</li>
	*   </ul>
	*   @module app/energy/samsungsac/model/operating-model
	*   @returns {Object} Model - 모델 기본 셋팅 설정
	*   @returns {Object} modelData -modelData 설정
	*   @returns {Object} temperatureData - temperatureData 설정
	*   @returns {Object} targetData - targetData 설정
	*   @returns {Object} createDataSource - 서버에서 응답되는 데이터를 가공하는 메소드
	*/
define("energy/samsungsac/model/operating-model", [],function(){		// [2018-04-10][파라메타 core ViewModel 미사용 파라메타제거]
	"use strict";
	// var MainViewModel = ViewModel.MainViewModel;  // [2018-04-05][선언후 미사용 주석]
	  // var moment = window.moment;     // [2018-04-05][선언후 미사용 주석]
	/*Kendo Model을 정의한다.*/
	/*아래는 예시로 서버 Response에 맞춰 정의 필요.*/
	var kendo = window.kendo;
	// var textDate;       // [2018-04-05][선언후 미사용 주석]
	var Model = kendo.data.Model.define({
		id: "id",
		fields: {
			name: {
				name: "Name"
			},
			description : {
				name: "Description"
			},
			activated : {
				name : "Activation",
				type : "boolean"
			},
			startDate : {
				name : "Start Date",
				type : "date"
			},
			endDate : {
				name : "End Date",
				type : "date"
			},
			daysOfWeek : {
				name : "Repeat Days",
				type : "object",
				defaultValue : []
			},
			exceptionalDays : {
				name : "Execeptional Days",
				type : "object",
				defaultValue : []
			},
			executionTimes : {
				name : "Execution Time",
				type : "object",
				defaultValue : []
			},
			devices : {
				name : "Devices",
				type : "object",
				defaultValue : []
			},
			"control" : {
				name : "Operations",
				type : "object",
				defaultValue : {}
			}
		}
	});

	// var groupFilter;    // [2018-04-05][선언후 미사용 주석]
	  // var textDate;       // [2018-04-05][선언후 미사용 주석]
	var temperatureData = [];
	// var modelData = [];    // [2018-04-05][중복선언 주석]
	var targetData = [];
	var modelData = [];


	/**
	 *
	 *    서버에서 응답되는 데이터를 가공해야 한다면 여기서 처리
	 *
	 *   @function createDataSource
	 *   @param {Object} list - 리스트 데이터
	 *   @returns {Array} - 가공된 리스트 데이터
	 *   @alias energy/core
	 *
	 */
	/*만약 서버에서 응답되는 데이터를 가공해야 한다면 여기서 처리한다.*/
	var createDataSource = function(list){
		// [2018-04-10][선언후 for문에서 값을 할당한후 미사용 의미없는 구문이라고 판단 주석처리]
		// var i, max = list.length;
		// var item;     // [2018-04-05][선언후 for문에서 값을 할당한후 미사용]
		// for( i = 0; i < max; i++ ){
		// 	item = list[i];
		// }

		return list;
	};

	return {
		Model : Model,
		modelData : modelData,
		temperatureData : temperatureData,
		targetData : targetData,
		createDataSource : createDataSource
	};
});

//# sourceURL=energy/consumption/model/consumption-model.js