/**
*
*   <ul>
*       <li>Algorithm 기능 내 공용 Template</li>
*       <li>Algorithm 기능 내 데이터 표시를 위한 HTML Template을 제공한다.</li>
*   </ul>
*   @module app/energy/samsungsac/sac-algorithm/sac-algorithm-template
*   @requires config
*
*/
define("energy/samsungsac/sac-algorithm/sac-algorithm-template", [], function(){
	var I18N = window.I18N;
	var kendo = window.kendo;

	/**
	*   <ul>
	*   <li>Algorithm 기기 정보 리스트 내 PRC / Comfort 컬럼에 대한 HTML String을 리턴한다.</li>
	*   </ul>
	*   @function prcComfortTempl
	*   @param {Object} data - 기기 정보 객체
	*   @returns {String} - PRC/Comfort 라디오 버튼이 포함된 HTML String
	*   @alias module:app/energy/samsungsac/sac-algorithm/sac-algorithm-template
	*/
	var prcComfortTempl = function(data){
		var type = data.algorithm_type;
		var id = data.device_id;
		var checked = data.checked ? "" : "disabled";

		if(!type){
			type = "Manual";
		}

		var checkedPrc = type == "PRC" ? "checked" : "";
		var checkedComfort = type == "Comfort" ? "checked" : "";

		return '<input type="radio" class="k-radio type-radio" name="prc-comfort-' + id + '" value="PRC" id="prc-' + id + '" ' + checkedPrc + ' ' + checked + '><label class="k-radio-label" for="prc-' + id + '">' + I18N.prop("SETTINGS_ALGORITHM_NAME_PRC") + '</label><input type="radio" class="k-radio type-radio" name="prc-comfort-' + id + '" value="Comfort" id="comfort-' + id + '" ' + checkedComfort + ' ' + checked + '><label class="k-radio-label" for="comfort-' + id + '">' + I18N.prop("SETTINGS_ALGORITHM_NAME_COMFORT") + '</label>';
	};
	/**
	*   <ul>
	*   <li>Algorithm 기기 정보 리스트 내 상단 고정 행의 PRC / Comfort 컬럼에 대한 HTML String을 리턴한다.</li>
	*   </ul>
	*   @function prcComfortFooterTempl
	*   @param {Object} data - 기기 정보 객체
	*   @returns {String} - PRC/Comfort 라디오 버튼이 포함된 HTML String
	*   @alias module:app/energy/samsungsac/sac-algorithm/sac-algorithm-template
	*/
	var prcComfortFooterTempl = function(){
		return '<input type="radio" class="k-radio type-radio" name="prc-comfort-all" value="PRC" id="prc-all" disabled><label class="k-radio-label" for="prc-all">' + I18N.prop("SETTINGS_ALGORITHM_NAME_PRC") + '</label><input type="radio" class="k-radio type-radio" name="prc-comfort-all" value="Comfort" id="comfort-all" disabled><label class="k-radio-label" for="comfort-all">' + I18N.prop("SETTINGS_ALGORITHM_NAME_COMFORT") + '</label>';
	};
	/**
	*   <ul>
	*   <li>Algorithm 기기 정보 리스트 내 Comfort Option 컬럼에 대한 HTML String을 리턴한다.</li>
	*   </ul>
	*   @function comfortOptionTempl
	*   @param {Object} data - 기기 정보 객체
	*   @returns {String} - Comfort Option 라디오 버튼이 포함된 HTML String
	*   @alias module:app/energy/samsungsac/sac-algorithm/sac-algorithm-template
	*/
	var comfortOptionTempl = function(data){
		var option = data.comfort_option;
		var id = data.device_id;
		var algorithmType = data.algorithm_type;

		var checked = (data.checked && algorithmType == "Comfort") ? "" : "disabled";

		//Default 값은 Normal이다.
		if(!option){
			data.comfort_option = option = "Normal";
		}

		var checkedNormal = option == "Normal" ? "checked" : "";
		var checkedComfort = option == "Comfort" ? "checked" : "";
		var checkedVeryComfort = option == "VeryComfort" ? "checked" : "";

		return '<input type="radio" class="k-radio comfort-option-radio" name="comfort-option-' + id + '" value="Normal" id="normal-' + id + '" ' + checkedNormal + ' ' + checked + '><label class="k-radio-label" for="normal-' + id + '">' + I18N.prop("SETTINGS_ALGORITHM_COMFORT_MODE_NORMAL") + '</label><input type="radio" class="k-radio comfort-option-radio" name="comfort-option-' + id + '" value="Comfort" id="comfort-option-comfort-' + id + '" ' + checkedComfort + ' ' + checked + '><label class="k-radio-label" for="comfort-option-comfort-' + id + '">' + I18N.prop("SETTINGS_ALGORITHM_COMFORT_MODE_COMFORT") + '</label><input type="radio" class="k-radio comfort-option-radio" name="comfort-option-' + id + '" value="VeryComfort" id="comfort-very-' + id + '" ' + checkedVeryComfort + ' ' + checked + '><label class="k-radio-label" for="comfort-very-' + id + '">' + I18N.prop("SETTINGS_ALGORITHM_COMFORT_MODE_VERY_COMFORT") + '</label>';
	};
	/**
	*   <ul>
	*   <li>Algorithm 기기 정보 리스트 내 상단 고정 행의 Comfort Option 컬럼에 대한 HTML String을 리턴한다.</li>
	*   </ul>
	*   @function comfortOptionFooterTempl
	*   @param {Object} data - 기기 정보 객체
	*   @returns {String} - Comfort Option 라디오 버튼이 포함된 HTML String
	*   @alias module:app/energy/samsungsac/sac-algorithm/sac-algorithm-template
	*/
	var comfortOptionFooterTempl = function(){
		return '<input type="radio" class="k-radio comfort-option-radio" name="comfort-option-all" value="Normal" id="normal-all" disabled><label class="k-radio-label" for="normal-all">' + I18N.prop("SETTINGS_ALGORITHM_COMFORT_MODE_NORMAL") + '</label><input type="radio" class="k-radio comfort-option-radio" name="comfort-option-all" value="Comfort" id="comfort-option-comfort-all" disabled><label class="k-radio-label" for="comfort-option-comfort-all">' + I18N.prop("SETTINGS_ALGORITHM_COMFORT_MODE_COMFORT") + '</label><input type="radio" class="k-radio comfort-option-radio" name="comfort-option-all" value="VeryComfort" id="comfort-very-all" disabled><label class="k-radio-label" for="comfort-very-all">' + I18N.prop("SETTINGS_ALGORITHM_COMFORT_MODE_VERY_COMFORT") + '</label>';
	};

	var powerPricingWeekDayTempl = function(data){
		var val = "-";
		if(data.dayType){
			val = data.dayType.toUpperCase();
			var i18nVal = I18N.prop("SETTINGS_ALGORITHM_" + val);
			val = i18nVal ? i18nVal : val;
		}
		return val;
	};

	var powerPricingDateTempl = function(date){
		var month, day, split;
		split = date.split("-");
		month = kendo.toString(split[0], "00");
		day = kendo.toString(split[1], "00");
		return month + "/" + day;
	};

	var powerPricingEndDateTempl = function(data){
		var val = "-";
		if(data.endDate){
			val = powerPricingDateTempl(data.endDate);
		}
		return val;
	};

	var powerPricingStartDateTempl = function(data){
		var val = "-";
		if(data.startDate){
			val = powerPricingDateTempl(data.startDate);
		}
		return val;
	};

	var powerPricingRateTempl = function(rate){
		return kendo.toString(rate, "n");
	};

	var powerPricingBaseRateTempl = function(data){
		var val = "-";
		if(typeof data.baseRate !== 'undefined'){
			val = powerPricingRateTempl(data.baseRate);
		}
		return val;
	};

	var powerPricingLevel1RateTempl = function(data){
		var val = "-";
		if(typeof data.level1Rate !== 'undefined'){
			val = powerPricingRateTempl(data.level1Rate);
		}
		return val;
	};

	var powerPricingLevel2RateTempl = function(data){
		var val = "-";
		if(typeof data.level2Rate !== 'undefined'){
			val = powerPricingRateTempl(data.level2Rate);
		}
		return val;
	};

	var powerPricingLevel3RateTempl = function(data){
		var val = "-";
		if(typeof data.level3Rate !== 'undefined'){
			val = powerPricingRateTempl(data.level3Rate);
		}
		return val;
	};

	var powerPricingHourlyRateTempl = function(level){
		return "<span class='power-pricing-hourly-level-wrapper'><input class='k-input power-pricing-hourly-level' data-level='" + level + "' value='" + level + "'/ readonly></span>";
	};

	var powerPricingHourlyRateEditTempl = function(level, key){
		return "<span class='power-pricing-hourly-level-wrapper'><input data-role='numerictextbox' class='k-input power-pricing-hourly-level edit' data-level='" + level + "' value='" + level + "' data-min='1' data-max='3' data-key='time" + key + "Level'/></span>";
	};

	var powerPricingTime00Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time00Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time00Level);
		}
		return val;
	};
	var powerPricingTime01Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time01Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time01Level);
		}
		return val;
	};
	var powerPricingTime02Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time02Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time02Level);
		}
		return val;
	};
	var powerPricingTime03Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time03Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time03Level);
		}
		return val;
	};
	var powerPricingTime04Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time04Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time04Level);
		}
		return val;
	};
	var powerPricingTime05Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time05Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time05Level);
		}
		return val;
	};
	var powerPricingTime06Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time06Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time06Level);
		}
		return val;
	};
	var powerPricingTime07Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time07Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time07Level);
		}
		return val;
	};
	var powerPricingTime08Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time08Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time08Level);
		}
		return val;
	};
	var powerPricingTime09Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time09Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time09Level);
		}
		return val;
	};
	var powerPricingTime10Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time10Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time10Level);
		}
		return val;
	};
	var powerPricingTime11Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time11Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time11Level);
		}
		return val;
	};
	var powerPricingTime12Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time12Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time12Level);
		}
		return val;
	};
	var powerPricingTime13Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time13Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time13Level);
		}
		return val;
	};
	var powerPricingTime14Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time14Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time14Level);
		}
		return val;
	};
	var powerPricingTime15Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time15Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time15Level);
		}
		return val;
	};
	var powerPricingTime16Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time16Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time16Level);
		}
		return val;
	};
	var powerPricingTime17Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time17Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time17Level);
		}
		return val;
	};
	var powerPricingTime18Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time18Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time18Level);
		}
		return val;
	};
	var powerPricingTime19Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time19Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time19Level);
		}
		return val;
	};
	var powerPricingTime20Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time20Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time20Level);
		}
		return val;
	};
	var powerPricingTime21Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time21Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time21Level);
		}
		return val;
	};
	var powerPricingTime22Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time22Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time22Level);
		}
		return val;
	};
	var powerPricingTime23Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		if(powerDivision && typeof powerDivision.time23Level !== 'undefined'){
			val = powerPricingHourlyRateTempl(powerDivision.time23Level);
		}
		return val;
	};

	var powerPricingEditTime00Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time00Level ? powerDivision.time00Level : "";
		val = powerPricingHourlyRateEditTempl(val, "00");
		return val;
	};
	var powerPricingEditTime01Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time01Level ? powerDivision.time01Level : "";
		val = powerPricingHourlyRateEditTempl(val, "01");
		return val;
	};
	var powerPricingEditTime02Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time02Level ? powerDivision.time02Level : "";
		val = powerPricingHourlyRateEditTempl(val, "02");
		return val;
	};
	var powerPricingEditTime03Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time03Level ? powerDivision.time03Level : "";
		val = powerPricingHourlyRateEditTempl(val, "03");
		return val;
	};
	var powerPricingEditTime04Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time04Level ? powerDivision.time04Level : "";
		val = powerPricingHourlyRateEditTempl(val, "04");
		return val;
	};
	var powerPricingEditTime05Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time05Level ? powerDivision.time05Level : "";
		val = powerPricingHourlyRateEditTempl(val, "05");
		return val;
	};
	var powerPricingEditTime06Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time06Level ? powerDivision.time06Level : "";
		val = powerPricingHourlyRateEditTempl(val, "06");
		return val;
	};
	var powerPricingEditTime07Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time07Level ? powerDivision.time07Level : "";
		val = powerPricingHourlyRateEditTempl(val, "07");
		return val;
	};
	var powerPricingEditTime08Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time08Level ? powerDivision.time08Level : "";
		val = powerPricingHourlyRateEditTempl(val, "08");
		return val;
	};
	var powerPricingEditTime09Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time09Level ? powerDivision.time09Level : "";
		val = powerPricingHourlyRateEditTempl(val, "09");
		return val;
	};
	var powerPricingEditTime10Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time10Level ? powerDivision.time10Level : "";
		val = powerPricingHourlyRateEditTempl(val, "10");
		return val;
	};
	var powerPricingEditTime11Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time11Level ? powerDivision.time11Level : "";
		val = powerPricingHourlyRateEditTempl(val, "11");
		return val;
	};
	var powerPricingEditTime12Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time12Level ? powerDivision.time12Level : "";
		val = powerPricingHourlyRateEditTempl(val, "12");
		return val;
	};
	var powerPricingEditTime13Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time13Level ? powerDivision.time13Level : "";
		val = powerPricingHourlyRateEditTempl(val, "13");
		return val;
	};
	var powerPricingEditTime14Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time14Level ? powerDivision.time14Level : "";
		val = powerPricingHourlyRateEditTempl(val, "14");
		return val;
	};
	var powerPricingEditTime15Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time15Level ? powerDivision.time15Level : "";
		val = powerPricingHourlyRateEditTempl(val, "15");
		return val;
	};
	var powerPricingEditTime16Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time16Level ? powerDivision.time16Level : "";
		val = powerPricingHourlyRateEditTempl(val, "16");
		return val;
	};
	var powerPricingEditTime17Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time17Level ? powerDivision.time17Level : "";
		val = powerPricingHourlyRateEditTempl(val, "17");
		return val;
	};
	var powerPricingEditTime18Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time18Level ? powerDivision.time18Level : "";
		val = powerPricingHourlyRateEditTempl(val, "18");
		return val;
	};
	var powerPricingEditTime19Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time19Level ? powerDivision.time19Level : "";
		val = powerPricingHourlyRateEditTempl(val, "19");
		return val;
	};
	var powerPricingEditTime20Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time20Level ? powerDivision.time20Level : "";
		val = powerPricingHourlyRateEditTempl(val, "20");
		return val;
	};
	var powerPricingEditTime21Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time21Level ? powerDivision.time21Level : "";
		val = powerPricingHourlyRateEditTempl(val, "21");
		return val;
	};
	var powerPricingEditTime22Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time22Level ? powerDivision.time22Level : "";
		val = powerPricingHourlyRateEditTempl(val, "22");
		return val;
	};
	var powerPricingEditTime23Templ = function(data){
		var val = "-";
		var powerDivision = data.powerDivision;
		val = powerDivision.time23Level ? powerDivision.time23Level : "";
		val = powerPricingHourlyRateEditTempl(val, "23");
		return val;
	};

	var powerPricingEditWeekDayTempl = function(data){
		var val = "<input class='pricing-edit-weekday' data-value='" + data.dayType + "'/>";
		return val;
	};

	var powerPricingEditMonthTempl = function(date, type){
		var month, split;
		if(date){
			split = date.split("-");
			month = kendo.toString(Number(split[0]), "00");
		}else{
			month = "";
		}

		var val = "<input class='pricing-edit-month' data-value='" + month + "' data-type='" + type + "'/>";
		return val;
	};

	var powerPricingEditDayTempl = function(date, type){
		var day, split;
		if(date){
			split = date.split("-");
			day = kendo.toString(Number(split[1]), "00");
		}else{
			day = "";
		}

		var val = "<input class='pricing-edit-day' data-value='" + day + "' data-type='" + type + "'/>";
		return val;
	};

	var powerPricingEditStartDateTempl = function(data){
		var month = powerPricingEditMonthTempl(data.startDate, "start");
		var day = powerPricingEditDayTempl(data.startDate, "start");
		return month + "<span class='edit-date-hypen'>-</span>" + day;
	};

	var powerPricingEditEndDateTempl = function(data){
		var month = powerPricingEditMonthTempl(data.endDate, "end");
		var day = powerPricingEditDayTempl(data.endDate, "end");
		return month + "<span class='edit-date-hypen'>-</span>" + day;
	};

	var powerPricingEditRateTempl = function(rate, level){
		var key = "";
		var className = "level";
		if(level == 0){
			key = "base";
			className = "base";
		}else if(level == 1){
			key = "level1";
		}else if(level == 2){
			key = "level2";
		}else{
			key = "level3";
		}
		return "<input class='k-input pricing-edit-rate " + className + "' data-min='0' data-max='999999999' data-spinners='false' data-decimals='1' data-format='n0' value='" + rate + "' data-value='" + rate + "' data-level='" + level + "' data-key='" + key + "Rate'/>";
	};

	var powerPricingEditBaseRateTempl = function(data){
		var rate = typeof data.baseRate !== 'undefined' ? data.baseRate : "";
		var val = powerPricingEditRateTempl(rate, 0);
		return val;
	};

	var powerPricingEditLevel1RateTempl = function(data){
		var rate = typeof data.level1Rate !== 'undefined' ? data.level1Rate : "";
		var val = powerPricingEditRateTempl(rate, 1);
		return val;
	};

	var powerPricingEditLevel2RateTempl = function(data){
		var rate = typeof data.level2Rate !== 'undefined' ? data.level2Rate : "";
		var val = powerPricingEditRateTempl(rate, 2);
		return val;
	};

	var powerPricingEditLevel3RateTempl = function(data){
		var rate = typeof data.level3Rate !== 'undefined' ? data.level3Rate : "";
		var val = powerPricingEditRateTempl(rate, 3);
		return val;
	};

	return {
		prcComfortTempl : prcComfortTempl,
		comfortOptionTempl : comfortOptionTempl,
		prcComfortFooterTempl : prcComfortFooterTempl,
		comfortOptionFooterTempl : comfortOptionFooterTempl,
		powerPricingWeekDayTempl : powerPricingWeekDayTempl,
		powerPricingStartDateTempl : powerPricingStartDateTempl,
		powerPricingEndDateTempl : powerPricingEndDateTempl,
		powerPricingBaseRateTempl : powerPricingBaseRateTempl,
		powerPricingLevel1RateTempl : powerPricingLevel1RateTempl,
		powerPricingLevel2RateTempl : powerPricingLevel2RateTempl,
		powerPricingLevel3RateTempl : powerPricingLevel3RateTempl,
		powerPricingTime00Templ : powerPricingTime00Templ,
		powerPricingTime01Templ : powerPricingTime01Templ,
		powerPricingTime02Templ : powerPricingTime02Templ,
		powerPricingTime03Templ : powerPricingTime03Templ,
		powerPricingTime04Templ : powerPricingTime04Templ,
		powerPricingTime05Templ : powerPricingTime05Templ,
		powerPricingTime06Templ : powerPricingTime06Templ,
		powerPricingTime07Templ : powerPricingTime07Templ,
		powerPricingTime08Templ : powerPricingTime08Templ,
		powerPricingTime09Templ : powerPricingTime09Templ,
		powerPricingTime10Templ : powerPricingTime10Templ,
		powerPricingTime11Templ : powerPricingTime11Templ,
		powerPricingTime12Templ : powerPricingTime12Templ,
		powerPricingTime13Templ : powerPricingTime13Templ,
		powerPricingTime14Templ : powerPricingTime14Templ,
		powerPricingTime15Templ : powerPricingTime15Templ,
		powerPricingTime16Templ : powerPricingTime16Templ,
		powerPricingTime17Templ : powerPricingTime17Templ,
		powerPricingTime18Templ : powerPricingTime18Templ,
		powerPricingTime19Templ : powerPricingTime19Templ,
		powerPricingTime20Templ : powerPricingTime20Templ,
		powerPricingTime21Templ : powerPricingTime21Templ,
		powerPricingTime22Templ : powerPricingTime22Templ,
		powerPricingTime23Templ : powerPricingTime23Templ,
		powerPricingEditTime00Templ : powerPricingEditTime00Templ,
		powerPricingEditTime01Templ : powerPricingEditTime01Templ,
		powerPricingEditTime02Templ : powerPricingEditTime02Templ,
		powerPricingEditTime03Templ : powerPricingEditTime03Templ,
		powerPricingEditTime04Templ : powerPricingEditTime04Templ,
		powerPricingEditTime05Templ : powerPricingEditTime05Templ,
		powerPricingEditTime06Templ : powerPricingEditTime06Templ,
		powerPricingEditTime07Templ : powerPricingEditTime07Templ,
		powerPricingEditTime08Templ : powerPricingEditTime08Templ,
		powerPricingEditTime09Templ : powerPricingEditTime09Templ,
		powerPricingEditTime10Templ : powerPricingEditTime10Templ,
		powerPricingEditTime11Templ : powerPricingEditTime11Templ,
		powerPricingEditTime12Templ : powerPricingEditTime12Templ,
		powerPricingEditTime13Templ : powerPricingEditTime13Templ,
		powerPricingEditTime14Templ : powerPricingEditTime14Templ,
		powerPricingEditTime15Templ : powerPricingEditTime15Templ,
		powerPricingEditTime16Templ : powerPricingEditTime16Templ,
		powerPricingEditTime17Templ : powerPricingEditTime17Templ,
		powerPricingEditTime18Templ : powerPricingEditTime18Templ,
		powerPricingEditTime19Templ : powerPricingEditTime19Templ,
		powerPricingEditTime20Templ : powerPricingEditTime20Templ,
		powerPricingEditTime21Templ : powerPricingEditTime21Templ,
		powerPricingEditTime22Templ : powerPricingEditTime22Templ,
		powerPricingEditTime23Templ : powerPricingEditTime23Templ,
		powerPricingEditWeekDayTempl : powerPricingEditWeekDayTempl,
		powerPricingEditMonthTempl : powerPricingEditMonthTempl,
		powerPricingEditDayTempl : powerPricingEditDayTempl,
		powerPricingEditStartDateTempl : powerPricingEditStartDateTempl,
		powerPricingEditEndDateTempl : powerPricingEditEndDateTempl,
		powerPricingEditBaseRateTempl : powerPricingEditBaseRateTempl,
		powerPricingEditLevel1RateTempl : powerPricingEditLevel1RateTempl,
		powerPricingEditLevel2RateTempl : powerPricingEditLevel2RateTempl,
		powerPricingEditLevel3RateTempl : powerPricingEditLevel3RateTempl
	};
});