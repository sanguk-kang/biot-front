/**
	*
	*   <ul>
	*       <li>samsungsac에 관련된 template 설정 작업</li>
	*   </ul>
	*   @module app/energy/samsungsac/model/detection-model
	*   @returns {Object} Model - 모델 기본 셋팅 설정
	*   @returns {Object} targetData -targetData 설정
	*   @returns {Object} lastYearData - lastYearData 설정
	*   @returns {Object} thisYearData - thisYearData 설정
	*   @returns {Object} createDataSource - 서버에서 응답되는 데이터를 가공하는 메소드
	*/
define("energy/samsungsac/model/detection-model", function(){
	"use strict";

	// var moment = window.moment;     // [2018-04-05][선언후 미사용 주석]
	/*Kendo Model을 정의한다.*/
	/*아래는 예시로 서버 Response에 맞춰 정의 필요.*/


	var kendo = window.kendo;
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
	// /*만약 서버에서 응답되는 데이터를 가공해야 한다면 여기서 처리한다.*/
	// var createDataSource = function(list){
	// 	var i, max = list.length;
	// 	var item;     // [2018-04-05][선언후 for문에서 값을 할당한후 미사용]
	// 	// [2018-04-05][for문에서 item을 리턴하지않고 list를 반환 현재 다른 모니터링 js에서 해당 함수를 사용하지않음 그외 operating 사용되는걸 확인 하지만 operating-model에 동일한 함수가 있어 주석처리 ]
	// 	for( i = 0; i < max; i++ ){
	// 		item = list[i];
	// 	}
	// 	return list;
	// };

	return {
		Model : Model,
		targetData : {},
		lastYearData : {},
		thisYearData : {}
		// createDataSource : createDataSource
	};
});

//# sourceURL=energy/consumption/model/target-model.js