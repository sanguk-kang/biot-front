/**
*
*   <ul>
*       <li>Trend Log 기능 내 Utility</li>
*       <li>Interval 값을 스트링으로 변환하는 함수 제공</li>
*   </ul>
*   @module app/history/trendlog/trendlog-util
*/
define("history/trendlog/trendlog-util", function(){
	"use strict";
	var I18N = window.I18N;
	var moment = window.moment;
	var _intervalToString = function(momentDuration, isoValue){

		var interval;
		if(isoValue.indexOf("M") != -1){
			interval = momentDuration.minutes();
			return I18N.prop("FACILITY_TRENDLOG_PERIOD_MINUTE", interval);
		}if(isoValue.indexOf("H") != -1){
			interval = momentDuration.hours();
			var day = momentDuration.days();
			if(interval == 0 && day == 1){
				return I18N.prop("FACILITY_TRENDLOG_PERIOD_HOUR", 24);
			}
			return I18N.prop("FACILITY_TRENDLOG_PERIOD_HOUR", interval);
		}else if(isoValue.indexOf("D")){
			interval = momentDuration.days();
			return I18N.prop("FACILITY_TRENDLOG_PERIOD_DAY", interval);
		}
		return "-";

		/*
        	seconds = seconds / 1000;
        	var interval = Math.floor(seconds / 31536000);

            if (interval >= 1) {
            return I18N.prop("FACILITY_TRENDLOG_PERIOD_YEAR", interval);
            }
            interval = Math.floor(seconds / 2592000);
            if (interval >= 1) {
            return I18N.prop("FACILITY_TRENDLOG_PERIOD_MONTH", interval);
            }
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
            return I18N.prop("FACILITY_TRENDLOG_PERIOD_DAY", interval);
            }
            interval = Math.floor(seconds / 3600);
            if (interval >= 1) {
            return I18N.prop("FACILITY_TRENDLOG_PERIOD_HOUR", interval);
            }
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
            return I18N.prop("FACILITY_TRENDLOG_PERIOD_MINUTE", interval);
            }
            if(seconds < 0){
            seconds = 1;
            }

            return I18N.prop("FACILITY_TRENDLOG_PERIOD_SECOND", seconds);
        */
	};

	// 숫자만 추출하는 함수
	function _extractionNumber (str){
		var res;
		res = str.replace(/[^0-9]/g,"");
		return Number(res);
	}
	// 로깅 간격 파싱하는 함수
	// D 일, H 시간, M 분
	var _parserPeriod = function(period) {
		var typeList = {
			D: 'day',
			H: 'hour',
			M: 'minutes'
		};
		var periodType = typeList[period[period.length - 1]];
		var periodValue = _extractionNumber(period);
		var result = {
			type: periodType,
			value: periodValue
		};
		return result;
	};

	// 현재 시간 - 시작 시간 / 간격 = 1000개 초과 하면 팝업
	var dataInspection = function(startDate, endDate, period) {
		var isPeriod = _parserPeriod(period);
		var maxPeriod = 1000;
		// var maxEndDate = moment(startDate).add(isPeriod.value * maxPeriod, isPeriod.type);
		var maxEndDate = moment(startDate).subtract(isPeriod.value * maxPeriod, isPeriod.type);
		var excess = moment(maxEndDate).isBefore(endDate, 'minute');
		// var result = {
		//     status: excess,
		//     date: moment(maxEndDate).format('YYYY-MM-DD hh:mm')
		// };
		// if (excess) result.date = moment(endDate).format('YYYY-MM-DD hh:mm');
		// result.date = new Date(result.date);
		return excess;
	};

		// 시작날짜 종료날짜를 검사하여 1000개이하로 데이터를 출력하도록 시작,종료 시간을 조정하는 함수
		// var dataInspection = function(startDate, endDate, period) {
		//     var isPeriod = _parserPeriod(period);
		//     var maxPeriod = 1000;
		//     var maxEndDate = moment(startDate).add(isPeriod.value * maxPeriod, isPeriod.type);
		//     var excess = moment(maxEndDate).isBefore(endDate, 'minute');
		//     var result = {
		//         status: excess,
		//         date: moment(maxEndDate).format('YYYY-MM-DD hh:mm')
		//     };
		//     if (excess) result.date = moment(endDate).format('YYYY-MM-DD hh:mm');
		//     result.date = new Date(result.date);
		//     return excess;
		// };

	return {
		intervalToString : _intervalToString,
		dataInspection : dataInspection
	};
});

//# sourceURL=history-trendlog/trendlog-util.js
