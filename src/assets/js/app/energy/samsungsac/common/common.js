/**
	*
	*   <ul>
	*       <li>samsungsac에 관련된 공통 값 설정 작업</li>
	*   </ul>
	*   @module app/energy/samsungsac/common/common
	*   @param {Object} Widget- samsungsac Widget 객체
	*   @requires app/energy/samsungsac/common/widget
	*   @returns {Object} MSG -메세지 object
	*   @returns {Object} TEXT - text object
	*   @returns {Array} groupFilterDataSource- device 그룹 필터 실행
	*/
define("energy/samsungsac/common/common", ["energy/samsungsac/common/widget"], function(Widget){
	// var MainWindow = window.MAIN_WINDOW;    // [2018-04-05][사용하지않음에 주석]
	var Util = window.Util;                     // [2018-04-05][전역변수 사용으로 인한 변수 선언]
	var I18N = window.I18N;                        // [2018-04-05][전역변수 사용으로 인한 변수 선언]
	var msgDialog = Widget.msgDialog;
	var MainWindow = window.MAIN_WINDOW;		// [2018-04-10][getFloorQuery 함수 선언에 필요한 전역변수 선언]
	var moment = window.moment;
	var CHART_STEP_COUNT = 5;
	/*
		메시지나 공용 변수나 값들을 관리
		아래는 예시이다.
	*/
	// 다국어 리스트
	var MSG = {
		TXT_SELECT_ALL : "Select All",
		TXT_UNSELECT_ALL : "Deselect All",
		TXT_CREATE_SCHEDULE : "Create New Schedule",
		TXT_EDIT_SCHEDULE : "Edit Schedule",
		TXT_DELETE_SCHEDULE : "Do you want to delete the selected Schedule?",
		TXT_DELETE_EXCEPTIONAL_DAY : "Do you want to delete the selected Exceptional Day?",
		TXT_DELETE_SCHEDULE_RESULT : "The selected Schedule has been deleted",
		TXT_DELETE_SCHEDULE_MULTI_RESULT : "The selected {0} Schedule has been deleted",
		TXT_DELETE_EXCEPTIONAL_DAY_RESULT : "The selected Exceptional Day has been deleted",
		TXT_DELETE_EXCEPTIONAL_DAY_MULTI_RESULT : "The selected {0} Exceptional Day has been deleted",
		TXT_CREATE_SCHEDULE_CONFIRM : "Do you want to Create schedule?",
		TXT_CREATE_SCHEDULE_CLOSE_CONFIRM : "Do you want to close this window?\nThe contents are canceled when you close this window.",
		TXT_EDIT_SCHEDULE_CONFIRM : "Do you want to Edit schedule?",
		TXT_CANCEL_SCHEDULE_CONFIRM : "Do you want to cancel changes?",
		TXT_CREATE_SCHEDULE_RESULT : "Saved.",
		COMMON_MESSAGE_NOTI_CHANGES_SAVED : I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"),
		COMMON_CLOSE_WINDOW_CONFIRM : I18N.prop("COMMON_CLOSE_WINDOW_CONFIRM")
	};
	var TEXT = {
		ENERGY_TEXT_AVERAGE_USED:I18N.prop("ENERGY_TEXT_AVERAGE_USED"),
		ENERGY_TEXT_AVERAGE_THERMO:I18N.prop("ENERGY_TEXT_AVERAGE_THERMO"),
		ENERGY_TEXT_OUTDOOR_TEMPERATURE:I18N.prop("ENERGY_TEXT_OUTDOOR_TEMPERATURE"),
		ENERGY_TEXT_OPERATING_RATE:I18N.prop("ENERGY_TEXT_OPERATING_RATE"),
		ENERGY_TEXT_GAS_USAGE:I18N.prop("ENERGY_TEXT_GAS_USAGE"),
		ENERGY_TEXT_POWER_USAGE:I18N.prop("ENERGY_TEXT_POWER_USAGE"),
		ENERGY_TEXT_DATE:I18N.prop("ENERGY_TEXT_DATE"),
		ENERGY_TEXT_ON_DEVICE_RATE:I18N.prop("ENERGY_TEXT_ON_DEVICE_RATE"),
		ENERGY_GIRD_TOTAL:I18N.prop("ENERGY_GIRD_TOTAL"),

		COMMON_TOTAL:I18N.prop("ENERGY_TOTAL"),
		ENERGY_AVERAGE:I18N.prop("ENERGY_AVERAGE"),
		COMMON_DATE:I18N.prop("COMMON_DATE"),
		COMMON_TIME:I18N.prop("COMMON_TIME"),
		FACILITY_DEVICE_OUTDOOR_TEMPERATURE :I18N.prop("FACILITY_DEVICE_OUTDOOR_TEMPERATURE"),
		ENERGY_OPERATION_RATE :I18N.prop("ENERGY_OPERATION_RATE"),
		ENERGY_OPERATING_RATE :I18N.prop("ENERGY_OPERATING_RATE"),
		ENERGY_ON_DEVICE_RATE :I18N.prop("ENERGY_ON_DEVICE_RATE"),
		ENERGY_GAS_USAGE :I18N.prop("ENERGY_GAS_USAGE"),
		ENERGY_AVERAGE_USED_TIME :I18N.prop("ENERGY_AVERAGE_USED_TIME"),
		ENERGY_AVERAGE_THERMO_ON_TIME :I18N.prop("ENERGY_AVERAGE_THERMO_ON_TIME"),
		// FACILITY_DEVICE_OUTDOOR_TEMPERATURE :I18N.prop("FACILITY_DEVICE_OUTDOOR_TEMPERATURE"),  // [2018-04-05][중복 선언 주석]
		ENERGY_POWER_USAGE :I18N.prop("ENERGY_POWER_USAGE"),
		ENERGY_THERMO_ON_TIME_MIN :I18N.prop("ENERGY_THERMO_ON_TIME_MIN"),
		ENERGY_USED_TIME_MIN :I18N.prop("ENERGY_USED_TIME_MIN"),

		ENERGY_CURRENT_DEMAND :I18N.prop("ENERGY_CURRENT_DEMAND"),
		ENERGY_TARGET_DEMAND :I18N.prop("ENERGY_TARGET_DEMAND"),
		// ENERGY_PEAK_LEVEL :I18N.prop("ENERGY_PEAK_LEVEL"),  // [2018-04-05][중복 선언 주석]


		ENERGY_NUMBER_OF_LOSS_DETECTION :I18N.prop("ENERGY_NUMBER_OF_LOSS_DETECTION"),
		ENERGY_LIST_ENERGY_LOSS_DETECTION :I18N.prop("ENERGY_LIST_ENERGY_LOSS_DETECTION"),
		ENERGY_TOP_FIVE :I18N.prop("ENERGY_TOP_FIVE"),

		ENERGY_DATE_OF_EVENT :I18N.prop("ENERGY_DATE_OF_EVENT"),
		ENERGY_ENERGY_LOSS_NAME :I18N.prop("ENERGY_ENERGY_LOSS_NAME"),
		ENERGY_RANK :I18N.prop("ENERGY_RANK"),
		ENERGY_TYPE :I18N.prop("ENERGY_TYPE"),
		ENERGY_DEVICE_NAME :I18N.prop("ENERGY_DEVICE_NAME"),
		ENERGY_COUNT :I18N.prop("ENERGY_COUNT"),
		ENERGY_LOCATION :I18N.prop("ENERGY_LOCATION"),
		ENERGY_ESTIMATE_LINE :I18N.prop("ENERGY_ESTIMATE_LINE"),


		ENERGY_PEAK_LEVEL :I18N.prop("ENERGY_PEAK_LEVEL"),
		ENERGY_TIME_HOUR :I18N.prop("ENERGY_TIME_HOUR"),
		ENERGY_THERMO_ON_TIME :I18N.prop("ENERGY_THERMO_ON_TIME"),
		ENERGY_USED_TIME :I18N.prop("ENERGY_USED_TIME"),
		ENERGY_ON_DEVICE_RATE_TEXT :I18N.prop("ENERGY_ON_DEVICE_RATE_TEXT"),
		ENERGY_LOSS :I18N.prop("ENERGY_LOSS"),
		FACILITY_DEVICE_DEVICE_NAME_ALL :I18N.prop("FACILITY_DEVICE_DEVICE_NAME_ALL"),
		ENERGY_ALL_ZONE :I18N.prop("ENERGY_ALL_ZONE"),
		ENERGY_ZONE_COUNT: I18N.prop("ENERGY_ZONE_COUNT"),
		ENERGY_CATEGORY :I18N.prop("ENERGY_CATEGORY"),
		ENERGY_DEVICE :I18N.prop("ENERGY_DEVICE"),
		ENERGY_ALL_DEVICE_NAME :I18N.prop("ENERGY_ALL_DEVICE_NAME"),
		ENERGY_INSUFFICIENT_INSULATION :I18N.prop("ENERGY_INSUFFICIENT_INSULATION"),
		ENERGY_LONG_TIME_OPERATION :I18N.prop("ENERGY_LONG_TIME_OPERATION"),
		ENERGY_ABNORMAL_SET_TEMP :I18N.prop("ENERGY_ABNORMAL_SET_TEMP"),
		ENERGY_REPETITIVE_CONTROL :I18N.prop("ENERGY_REPETITIVE_CONTROL"),
		ENERGY_LOAD_VARIATION :I18N.prop("ENERGY_LOAD_VARIATION"),
		ENERGY_ABNORMAL_CURRENT_TEMP :I18N.prop("ENERGY_ABNORMAL_CURRENT_TEMP"),
		ENERGY_OVER_TIME_OPERATION :I18N.prop("ENERGY_OVER_TIME_OPERATION"),

		ENERGY_OPERATING_TIME :I18N.prop("ENERGY_OPERATING_TIME"),
		ENERGY_POWER_GAS_USAGE :I18N.prop("ENERGY_POWER_GAS_USAGE"),
		// ENERGY_OPERATING_RATE :I18N.prop("ENERGY_OPERATING_RATE"),  // [2018-04-05][중복 선언 주석]

		ENERGY_DATE_MON :I18N.prop("ENERGY_DATE_MON"),
		ENERGY_DATE_TUE :I18N.prop("ENERGY_DATE_TUE"),
		ENERGY_DATE_WED :I18N.prop("ENERGY_DATE_WED"),
		ENERGY_DATE_THU :I18N.prop("ENERGY_DATE_THU"),
		ENERGY_DATE_FRI :I18N.prop("ENERGY_DATE_FRI"),
		ENERGY_DATE_SAT :I18N.prop("ENERGY_DATE_SAT"),
		ENERGY_DATE_SUN :I18N.prop("ENERGY_DATE_SUN"),
		COMMON_BTN_DETAIL :I18N.prop("COMMON_BTN_DETAIL"),
		ENERGY_INQUIRED_PERIOD :I18N.prop("ENERGY_INQUIRED_PERIOD"),
		ENERGY_INQUIRY_TARGET :I18N.prop("ENERGY_INQUIRY_TARGET"),
		ENERGY_ALL_DEVICE_GROUP :I18N.prop("ENERGY_ALL_DEVICE_GROUP"),
		ENERGY_NUMBER_OF_GROUP :I18N.prop("ENERGY_NUMBER_OF_GROUP"),
		ENERGY_CONDITION_SETTING: I18N.prop("ENERGY_CONDITION_SETTING"),

		ENERGY_DEVICE_COUNT: I18N.prop("ENERGY_DEVICE_COUNT")
	};
	/**
	 *
	 *   디바이스 필터 리스트를 ajax를 통하여 받아와서 드롭다운 리스트의 구조로 만들어준다.
	 *
	 *   @function groupFilterDataSource
	 *   @param {Object} - 없음
	 *   @returns {Array} - device 리스트
	 *   @alias 없음
	 *
	 */
	var groupFilterDataSource = function(){
		var dataList = [];
		$.ajax({
			url : '/dms/groups'
		}).done(function(data){
			for(var i = 0; i < data.length; i++){
				if(data[i].dms_devices_ids.length > 0){
					dataList.push({text : data[i].name, value : String(data[i].id)});
				}
			}
		}).fail(function(data){
			var msg = Util.parseFailResponse(data);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
		});
		return dataList;
	};

	// [2018-04-10][실내기 운행이력과 비효율운전감지 js에서 같은 코드로 사용되고있어 Common.js에 선언하고 할당받도록 수정]
	/**
	 *
	 *   현재 층에 대한 정보를 쿼리에 주가한다.
	 *
	 *   @function getFloorQuery
	 *   @param {Object}floorData- 기존 층 데이터
	 *   @param {Object}isCheckedAll - 체크 확인 데이터
	 *   @returns {Object} q - 쿼리데이터
	 *   @alias 없음
	 *
	 */
	//현재 빌딩과 층에 대한 정보를 받아서 url에 사용할 쿼리를 리턴
	var getFloorQuery = function(floorData, isCheckedAll) { //floorData는 항상 undefined
		if (!floorData) {
			floorData = MainWindow.getCurrentFloor(); //현재 빌등/층 정보 담은 객체 반환
		}
		var q = "?";
		//현재 빌딩이 전체 빌딩아닐 때만 쿼리 추가
		if (floorData.building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID) {
			q += "foundation_space_buildings_id=" + floorData.building.id + "&";
		}
		//현재 층이 전체 층이 아닐때만 쿼리 추가
		if (floorData.floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID) {
			q += "foundation_space_floors_id=" + floorData.floor.id;
		}

		//빌딩이나 층 둘중 하나가 전체이거나 || 전체 층인 경우
		if ((q == "?" || q.indexOf("foundation_space_floors_id") == -1) && isCheckedAll) {
			return false;
		}
		return q;
		//return "";
	};

	// [2018-04-10][실내기 운행이력과 비효율운전감지 js에서 같은 코드로 사용되고있어 Common.js에 선언하고 할당받도록 수정]
	/**
	 *
	 *   현재 층에 대한 정보를 쿼리에 주가한다.
	 *
	 *   @function getMonthDay
	 *   @param {Object} year - 년도 데이터
	 *   @param {Object} month - 월 데이터
	 *   @param {Boolean} TwoDigitConversion - 두자리고정 선택유무
	 *   @returns {Array} monthDayList - 월 데이터
	 *   @alias 없음
	 *
	 */
	function getMonthDay(year, month, TwoDigitConversion) {
		var TwoDigitConversionTmp = typeof TwoDigitConversion === 'undefined' ? true : false;
		var lastDay = (new Date(year, month, 0)).getDate(),
			monthDayList = [];
		if(TwoDigitConversionTmp){
			for (var TDCForIndex = 1; TDCForIndex <= lastDay; TDCForIndex++) {
				if (String(TDCForIndex).length == 1) {
					monthDayList.push('0' + TDCForIndex);
				} else {
					monthDayList.push(TDCForIndex);
				}
			}
		}else{
			for (var ForIndex = 1; ForIndex <= lastDay; ForIndex++) {
				monthDayList.push(ForIndex);
			}
		}
		return monthDayList;
	}

	function getChartXAxisLabel (dateType, date) {
		var result = [], i, max;
		if (dateType === 'runtime') {
			var item;
			max = 15;
			for (i = 0; i <= max; i++) {
				item = i;
				item = I18N.prop("ENERGY_MITUTE", item);
				result.push(item);
			}
			return result;
		} else if (dateType === 'day') {
			// var globalGetTimeDisplay = window.GlobalSettings.getTimeDisplay();
			// var momentHourType = globalGetTimeDisplay === '24Hour' ? 'H' : 'h A';
			// for (i = 0; i < 24; i++) {
			// 	result[i] = moment(i, momentHourType).format(momentHourType);
			// 	if (globalGetTimeDisplay === '24Hour') {
			// 		result[i] = I18N.prop("ENERGY_CHART_TIME_HOUR", moment(i, momentHourType).format(momentHourType));
			// 	}
			// }
			if (window.GlobalSettings.getTimeDisplay() === '24Hour') {
				for (i = 0; i < 24; i++) {
					result[i] = I18N.prop("ENERGY_CHART_TIME_HOUR", i);
				}
			} else {
				result = ['12 AM', '1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'];
			}
		} else if (dateType === 'month') {
			max = moment(date).daysInMonth();
			for (i = 1; i <= max; i++) {
				result.push(moment(i, "DD").format('Do'));
			}
		} else if (dateType === 'year') {
			max = 12;
			for (i = 1; i <= max; i++) {
				result.push(moment(i, "MM").format('MMM'));
			}
		}
		return result;
	}

	    // 최대값 리턴
	var maxValueReturn = function(array) {
		if (!array) return 1;
		var max = array.reduce( function (previous, current) {
			return previous > current ? previous : current;
		});
		return Math.ceil(max);
	};
		// 최소값 리턴
	var minValueReturn = function(array) {
		if (!array) return 1;
		var min = array.reduce( function (previous, current) {
			return previous > current ? current : previous;
		});
		return Math.ceil(min);
	};

	var chartMajorUnit = function(max, noFloor) {
		if (noFloor) return Util.convertNumberFormat(max / CHART_STEP_COUNT);
		return Math.floor(max / CHART_STEP_COUNT);
	};

	var checkListLength = function(lengthMax, array, value) {
		if (array instanceof Array === false) return;
		if (array.length >= lengthMax) return;
		var setValue = value || void 0;
		var max = lengthMax - array.length;
		if (array.length > lengthMax) max = array.length - lengthMax;
		for (var i = 0; i < max; i++) {
			array.push(setValue);
		}
		return array;
	};

	return {
		MSG : MSG,
		TEXT:TEXT,
		groupFilterDataSource:groupFilterDataSource(),
		getFloorQuery: getFloorQuery,
		getMonthDay: getMonthDay,
		getChartXAxisLabel: getChartXAxisLabel,
		maxValueReturn: maxValueReturn,
		minValueReturn: minValueReturn,
		chartMajorUnit: chartMajorUnit,
		checkListLength: checkListLength
	};
});
//# sourceURL=energy/samsungsac/common/common.js
