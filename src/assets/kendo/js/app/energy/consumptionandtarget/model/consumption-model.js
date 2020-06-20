/**
	*
	*   <ul>
	*       <li>consumption에 관련된 view 모델 설정 작업</li>
	*   </ul>
	*   @module app/energy/consumptionandtarget/model/model
	*   @returns {Object} Model - 모델 기본 셋팅 설정
	*   @returns {Object} modelData -modelData 설정
	*   @returns {Object} temperatureData - temperatureData 설정
	*   @returns {Object} targetData - targetData 설정
	*   @returns {Object} createDataSource - createDataSource 설정
	*/

define("energy/consumptionandtarget/model/consumption-model", [], function(){
	"use strict";
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

	/*Mock Data를 정의한다.*/
	var temperatureData = [];
	var modelData = [];
	var targetData = [];

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