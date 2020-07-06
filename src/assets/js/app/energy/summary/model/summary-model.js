/**
 *
 *   <ul>
 *       <li>Main으로부터 summary 기능의 coreModule을 전달 받는다.</li>
 *   </ul>
 *   @module app/energy/summary/model/summary-model
 *   @param {Object} CoreModule- 에너지 core 객체
 *   @requires app/energy/core
 *   @returns {Object} Zone - kendo data 모델
 */

/*Main으로부터 summary 기능의 coreModule을 전달 받는다.*/
//[12-04-2018]안쓰는 코드 주석 - CoreModule
// define("energy/summary/model/summary-model", ["energy/core"], function(CoreModule){
define("energy/summary/model/summary-model", [], function(){
	//Code의 품질을 위하여 "use strict" 적용
	"use strict";
	var kendo = window.kendo;

	/* 팝업 작업 */
	var Zone = kendo.data.Model.define({
		id: "id",
		fields: {
			"id": {
				name: "id",
				type: "string",
				editType: null
			},
			"name": {
				name: "name",
				type: "string",
				editType: 'input'
			},
			"foundation_space_floors_name": {
				name: "Location",
				type: "string",
				editType: null
			},
			"foundation_space_floors_type": {
				name: "",
				type: "string",
				editType: null
			},
			"densityLevel": {
				name: "Density",
				type: "string",
				editType: null
			},
			"comfortLevel": {
				name: "Comfort Index",
				type: "string",
				editType: null
			},
			"description": {
				name: "Description",
				type: "string",
				editType: "input"
			},
			"created.date": {
				name: "Date",
				type: "string",
				editType:null
			},
			"created.ums_users_name": {
				name: "Manager",
				type: "string",
				editType: null
			},
			"updated.date": {
				name: "Date",
				type: "string",
				editType:null
			},
			"updated.ums_users_name": {
				name: "Manager",
				type: "string",
				editType: null
			}
		}
	});

	return {
		Zone : Zone
	};
});