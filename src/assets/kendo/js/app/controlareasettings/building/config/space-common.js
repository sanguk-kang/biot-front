/**
 *
 *	<ul>
 *		<li>space에 관한 페이지</li>
 *		<li>빌팅, 전체 층, 각 층에 대한 정보 수정, 정보 확인</li>
 *		<li>빌팅, 전체 층, 각 층 순서 변경</li>
 *	</ul>
 *	@module app/controlareasettings/building/config/space-common
 *	@returns {Object} MESSAGE - MESSAGE 텍스트 객체
 *	@returns {Object} TEXT - TEXT 객체
 *	@returns {Object} buttonStateChange
 *	@returns {Object} editButtonsState
 *	@returns {Object} changeEditMode
 *	@returns {Object} checkDuplicatedByKey
 *	@returns {Object} checkNoElementByKey
 *	@returns {Object} deepCopyArray
 *	@returns {Object} getFloorName
 */
//[12-04-2018]안쓰는 코드 주석 - CoreModule
// define("controlareasettings/building/config/space-common", ["controlareasettings/core"], function(CoreModule){
define("controlareasettings/building/config/space-common", [], function(){
	//Code의 품질을 위하여 "use strict" 적용
	"use strict";
	var I18N = window.I18N;

	/*
		다국어 지원을 위한 분리
	*/
	var MESSAGE = {
		DELETE_FLOOR_TEXT : I18N.prop("SPACE_MESSAGE_CONFIRM_DELETE_SELECTED_FLOOR"),
		DELETE_MULTI_FLOOR_TEXT :  function (len) {
			return I18N.prop("SPACE_MESSAGE_CONFIRM_DELETE_SELECTED_MULTI_FLOOR", len);
		},
		DELETE_ZONE_TEXT : I18N.prop("SPACE_MESSAGE_CONFIRM_DELETE_SELECTED_ZONE"),
		DELETE_MULTI_ZONE_TEXT : function (len) {
			return I18N.prop("SPACE_MESSAGE_CONFIRM_DELETE_SELECTED_MULTI_ZONE", len);
		},
		DELETE_BUILDING_TEXT : I18N.prop("SPACE_MESSAGE_CONFIRM_DELETE_BUILDING"),
		DELETE_BUILDING_TEXT_RESULT : I18N.prop("SPACE_MESSAGE_NOTI_DELETE_BUILDING"),
		DELETE_FLOOR_TEXT_RESULT :I18N.prop("SPACE_MESSAGE_NOTI_DELETE_SELECTED_FLOOR"),
		DELETE_MULTI_FLOOR_TEXT_RESULT : I18N.prop("SPACE_MESSAGE_NOTI_DELETE_SELECTED_MULTI_FLOOR"),
		DELETE_ZONE_TEXT_RESULT : I18N.prop("SPACE_MESSAGE_NOTI_DELETE_SELECTED_ZONE"),
		DELETE_MULTI_ZONE_TEXT_RESULT :I18N.prop("SPACE_MESSAGE_NOTI_DELETE_SELECTED_MULTI_ZONE"),
		SPACE_CANCEL_TEXT : I18N.prop("SPACE_MESSAGE_CANCEL_THE_WORK"),
		SPACE_CANCEL_TEXT_RESULT : I18N.prop("SPACE_MESSAGE_NOTI_CANCELED_THIS_WORK"),
		SPACE_SAVE_TEXT_RESULT :I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"),
		UPLOAD_IMAGE_NOT : I18N.prop("SPACE_UPLOAD_IMAGE_NOT"),
		UPLOAD_IMAGE_FILE_SIZE_NOT : I18N.prop("SPACE_UPLOAD_IMAGE_FILE_SIZE_NOT"),
		UPLOAD_IMAGE_FILE_TYPE_NOT : I18N.prop("SPACE_UPLOAD_IMAGE_FILE_TYPE_NOT"),
		UPLOAD_TEXT_BTN : I18N.prop("SPACE_UPLOAD_TEXT_BTN"),
		TEXT_LENGTH_LONG:I18N.prop("SPACE_FLOOR_NAME_LONG"),
		SPACE_MESSAGE_NOTI_EXIST_SAME_BUILDING_NAME: I18N.prop("SPACE_MESSAGE_NOTI_EXIST_SAME_BUILDING_NAME"),
		SPACE_MESSAGE_NOTI_EXIST_SAME_FLOOR_NAME: I18N.prop("SPACE_MESSAGE_NOTI_EXIST_SAME_FLOOR_NAME"),
		SPACE_MESSAGE_NOTI_NOT_SAME_ZNOE_NAME: I18N.prop("SPACE_MESSAGE_NOTI_NOT_SAME_ZNOE_NAME"),
		SPACE_SAVE_ZONE_NAME_OVERLAP_ERROR: I18N.prop("SPACE_MESSAGE_NOTI_EXIST_SAME_ZNOE_NAME"),
		SPACE_SAVE_FLOOR_NAME_NOT:I18N.prop("SPACE_MESSAGE_NOTI_NOT_SAME_FLOOR_NAME"),
		SPACE_SAVE_BUILDING_NAME_NOT:I18N.prop("SPACE_MESSAGE_NOTI_NOT_BUILDING_NAME"),
		SPACE_SAVE_ZONE_OVERLAP :I18N.prop("SPACE_MESSAGE_NOTI_NOT_OVERLAP_ZNOE"),
		COMMON_MESSAGE_NOTI_SAVED :I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"),
		SPACE_DUPLICATE_BUILDING_NAME: function (text) {
			return I18N.prop("SPACE_DUPLICATE_BUILDING_NAME", text);
		}
	};
	var TEXT = {
		NAME : 	I18N.prop("SPACE_TEXT_NAME"),
		FLOOR : I18N.prop("SPACE_FLOOR"),
		DESCRIPTION :I18N.prop("SPACE_TEXT_DESCRIPTION"),
		DENSITY : I18N.prop("SPACE_TEXT_DENSITY"),
		COMFORT: I18N.prop("SPACE_TEXT_COMFORT"),
		ZONE_NUM:I18N.prop("SPACE_ZONE_COUNT"),
		MAP_IMAGE:I18N.prop("SPACE_MAP_IMAGE"),

		SPACE_TEXT_LOCATION:I18N.prop("SPACE_TEXT_LOCATION"),
		SPACE_TEXT_DATE:I18N.prop("SPACE_TEXT_DATE"),
		SPACE_TEXT_MANAGER:I18N.prop("SPACE_TEXT_MANAGER"),
		SPACE_TEXT_TOTAL:I18N.prop("SPACE_TEXT_TOTAL"),
		SPACE_TEXT_GENERAL: I18N.prop('SPACE_TEXT_GENERAL'),
		SPACE_BUTTON_TEXT_CREATE: I18N.prop('SPACE_BUTTON_TEXT_CREATE'),
		SPACE_TEXT_LATEST_UPDATE: I18N.prop('SPACE_TEXT_LATEST_UPDATE'),
		SPACE_TEXT_COLOR: I18N.prop('SPACE_ZONE_BACKGROUND_COLOR'),

		SPACE_FLOOR_WIDTH:I18N.prop("SPACE_FLOOR_WIDTH"),
		SPACE_FLOOR_HEIGHT:I18N.prop("SPACE_FLOOR_HEIGHT"),
		SPACE_COMFORT_INDEX:I18N.prop("SPACE_TEXT_COMFORT"),
		SPACE_COMFORT_INDEX_COMFORTABLE:I18N.prop("SPACE_COMFORT_INDEX_COMFORTABLE"),
		SPACE_COMFORT_INDEX_UNCOMFORTABLE:I18N.prop("SPACE_COMFORT_INDEX_UNCOMFORTABLE"),
		SPACE_COMFORT_INDEX_VERY_UNCOMFORTABLE:I18N.prop("SPACE_COMFORT_INDEX_VERY_UNCOMFORTABLE"),

		SPACE_BUTTON_TEXT_SAVE:I18N.prop("SPACE_BUTTON_TEXT_SAVE"),
		SPACE_BUTTON_TEXT_ADD:I18N.prop("SPACE_BUTTON_TEXT_ADD"),
		SPACE_BUTTON_TEXT_DELETE:I18N.prop("SPACE_BUTTON_TEXT_DELETE"),
		SPACE_BUTTON_TEXT_CANCEL:I18N.prop("SPACE_BUTTON_TEXT_CANCEL"),
		SPACE_BUTTON_TEXT_EXIT:I18N.prop("SPACE_BUTTON_TEXT_EXIT"),
		SPACE_BUTTON_TEXT_EDIT:I18N.prop("SPACE_BUTTON_TEXT_EDIT"),
		COMMON_BTN_DETAIL :I18N.prop("COMMON_BTN_DETAIL"),
		SPACE_ALL_DEVICE_TYPE :I18N.prop("SPACE_ALL_DEVICE_TYPE"),
		SPACE_BUTTON_TEXT_DELETEFLOOR:I18N.prop("SPACE_BUTTON_TEXT_DELETEFLOOR"),
		SPACE_NO_DEVICE_TYPE: I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY")
	};

	/**
	 *	<ul>
	 *		<li>ViewModel에 바인딩 되어있는 button의 disabled / visible 상태를 변경한다.</li>
	 *	</ul>
	 *	@function buttonStateChange
	 *	@param {Object} buttons - ViewModel에 바인딩 되어있는 button 집합
	 *	@param {Array} options - buttons에 속한 button의 disabled, visible 정보들 [{button: [isDisabled, isVisible]}, ...]
	 *	@return {Object} 없음
	 */
	var buttonStateChange = function(buttons, options) {
		var btn, i;
		for(i = 0; i < options.length; i++) {
			$.each(options[i], function(key, elem) {
				btn = buttons[key];
				btn.set('disabled', elem[0]);
				btn.set('visible', elem[1]);
			});
		}
	};

	/**
	 *	<ul>
	 *		<li>편집모드에서 저장/나가기/취소 버튼의 상태를 변경</li>
	 *	</ul>
	 *	@function editButtonsState
	 *	@param {Object} buttons - ViewModel에 바인딩 되어있는 button 집합
	 *	@return {Object} 없음
	 */
	var editButtonsState = function (buttons) {
		buttonStateChange(buttons, [
			{btnSave: [false, true]},
			{btnExit: [false, false]},
			{btnCancel: [false, true]}
		]);
	};

	/**
	 *	<ul>
	 *		<li>뷰/편집모드 전환</li>
	 *	</ul>
	 *	@function changeEditMode
	 *	@param {Object} buttons - ViewModel에 바인딩 되어있는 button 집합
	 *	@param {Object} isEdit - 편집모드 여부
	 *	@return {Object} 없음
	 */
	var changeEditMode = function (buttons, isEdit) {
		buttonStateChange(buttons, [
			{btnEdit: [false, !isEdit]},
			{btnAdd: [false, isEdit]},
			{btnSave: [true, isEdit]},
			{btnDelete: [true, isEdit]},
			{btnExit: [false, isEdit]},
			{btnCancel: [false, false]},
			{btnMoveTop: [true, isEdit]},
			{btnMoveUp: [true, isEdit]},
			{btnMoveDown: [true, isEdit]},
			{btnMoveBottom: [true, isEdit]}
		]);
	};

	/**
	 *
	 *   list에서 key에 해당하는 값이 중복되는지 확인
	 *
	 *   @function checkDuplicatedByKey
	 *   @param {Array} list - 중복 검사할 리스트
	 *   @param {String} key - 확인할 key
	 *   @returns {boolean} 중복여부
	 *
	 */
	/* 이름 겹침 체크 */
	var checkDuplicatedByKey = function(list, key){
		var i, j, length = list.length;
		for(i = 0; i < length; i++){
			for(j = i + 1; j < length; j++){
				if(list[i][key] === list[j][key]) return true;
			}
		}
		return false;
	};

	/**
	 *
	 *   list에서 key에 해당하는 값이 null/undefined 확인(String은 '')
	 *
	 *   @function checkNoElementByKey
	 *   @param {Array} list - 검사할 리스트
	 *   @param {String} key - 확인할 key
	 *   @returns {boolean} 빈 값 여부
	 *
	 */
	var checkNoElementByKey = function (list, key) {
		var i, length = list.length;
		for(i = 0; i < length; i++) {
			if(list[i][key] === null || typeof list[i][key] === 'undefined' || list[i][key] === '') return true;
		}
		return false;
	};

	/**
	 *
	 *   데이터 배열을 deep-copy 한다
	 *
	 *   @function deepCopyArray
	 *   @param {Array} arr - deep-copy 할 배열
	 *   @returns {Array} deep-copy 된 배열
	 *
	 */
	var deepCopyArray = function (arr) {
		return JSON.parse(JSON.stringify(arr));
	};

	/**
	 *
	 *   층 type과 name을 받아 층 이름을 반환한다
	 *
	 *   @function getFloorName
	 *   @param {String} type - Floor type
	 *   @param {String} name - Floor name
	 *   @returns {String} 합성된 Floor name
	 *
	 */
	var getFloorName = function (type, name) {
		var floorName = '';
		if(type === 'F') {
			floorName += name + type;
		}else if(type === 'B'){
			floorName += type + name;
		}else{
			floorName += name;
		}
		return floorName;
	};

	return {
		MESSAGE : MESSAGE,
		TEXT : TEXT,
		buttonStateChange: buttonStateChange,
		editButtonsState: editButtonsState,
		changeEditMode: changeEditMode,
		checkDuplicatedByKey :checkDuplicatedByKey,
		checkNoElementByKey: checkNoElementByKey,
		deepCopyArray: deepCopyArray,
		getFloorName: getFloorName
	};

});
