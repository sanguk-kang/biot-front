/**
 *
 *   <ul>
 *       <li>Consumption에 관련된 template 설정 작업</li>
 *   </ul>
 *   @module app/energy/consumptionandtarget/template/target-template
 *   @param {Object} 없음
 *   @requires 없음
 *   @returns {Object} scheduleActivatedTemplate - template 생성 메소드 설정
 */
define("energy/consumptionandtarget/template/target-template", [], function(){
	/**
	 *
	 *   Consumption 기능 내 Grid 등 UI Component의 Template 함수를 관리
	 *
	 *   @function scheduleActivatedTemplate
	 *   @param {Object} data - 템플릿에 들어갈 값
	 *   @returns {Array} status - 템플릿 html
	 *   @alias 없음
	 *
	 */
	/*
		Consumption 기능 내 Grid 등 UI Component의 Template 함수를 관리
		아래는 예제코드이다.
	*/
	var scheduleActivatedTemplate = function(data){
		var oper = data.activated ? "Operating" : "Pause";
		var status = "<span class='panel-item-temp schedule-status'><span>" + oper + "</span></span>";
		return status;
	};

	return {
		scheduleActivatedTemplate : scheduleActivatedTemplate
	};
});
//# sourceURL=energy/consumption/template/target-template.js