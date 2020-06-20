define("history/report/model/report-model", function(){
	"use strict";
	var kendo = window.kendo;
	var I18N = window.I18N;
	var moment = window.moment;
	var Util = window.Util;

	var mockDataGroupList = [
		{
			"dms_devices_id":"00:FF:0C:00:00:01:SYDG0631-598Y-81",
			"dms_devices_name":"[Indoor] A:15F:A#1:#1",
			"dms_devices_type":"AirConditioner.Indoor",
			"foundation_space_buildings_id":1,
			"foundation_space_floors_id":17,
			"properties":[
				"indoor_power",
				"indoor_mode",
				"current_room_temp",
				"indoor_set_temp",
				"discharge_cool_set_temp",
				"discharge_heat_set_temp",
				"indoor_cool_low_limit",
				"indoor_heat_high_limit",
				"indoor_fan_speed",
				"ventilator_fan_speed"
			]
		}
		// {
		// 	"dms_devices_id":"00:FF:0C:00:00:01:SYDG0631-598Y-81",
		// 	"dms_devices_name":"[Indoor] A:15F:A#1:#1",
		// 	"dms_devices_type":"AirConditioner.Indoor",
		// 	"foundation_space_buildings_id":2,
		// 	"foundation_space_floors_id":2,
		// 	"properties":[
		// 		"discharge_cool_set_temp",
		// 		"indoor_fan_speed",
		// 		"ventilator_fan_speed"
		// 	]
		// },
		// {
		// 	"dms_devices_id":"00:FF:0C:00:00:01:SYDG0631-598Y-81",
		// 	"dms_devices_name":"[Indoor] A:15F:A#1:#1",
		// 	"dms_devices_type":"AirConditioner.Indoor",
		// 	"foundation_space_buildings_id":2,
		// 	"foundation_space_floors_id":3,
		// 	"properties":[
		// 		"indoor_power"
		// 	]
		// },
		// {
		// 	"dms_devices_id":"00:FF:0C:00:00:01:SYDG0631-598Y-81",
		// 	"dms_devices_name":"[Indoor] A:15F:A#1:#1",
		// 	"dms_devices_type":"AirConditioner.Indoor",
		// 	"foundation_space_buildings_id":2,
		// 	"foundation_space_floors_id":1,
		// 	"properties":[
		// 		"indoor_set_temp",
		// 		"discharge_cool_set_temp",
		// 		"indoor_fan_speed",
		// 		"ventilator_fan_speed"
		// 	]
		// },
		// {
		// 	"dms_devices_id":"00:FF:0C:00:00:01:SYDG0631-598Y-81",
		// 	"dms_devices_name":"[Indoor] A:15F:A#1:#1",
		// 	"dms_devices_type":"AirConditioner.Indoor",
		// 	"foundation_space_buildings_id":2,
		// 	"foundation_space_floors_id":2,
		// 	"properties":[
		// 		"indoor_power",
		// 		"indoor_mode"
		// 	]
		// },
		// {
		// 	"dms_devices_id":"00:FF:0C:00:00:03:SYDG0631-598Y-90",
		// 	"dms_devices_name":"[Point] A:121:A#3:#3",
		// 	"dms_devices_type":"ControlPoint",
		// 	"foundation_space_buildings_id":2,
		// 	"foundation_space_floors_id":1,
		// 	"properties":[
		// 		"value"
		// 	]
		// }
	];

	for(var mockDataGroupListIndex = 0; mockDataGroupListIndex < 2600; mockDataGroupListIndex++){
		mockDataGroupList.push(
			{
				"dms_devices_id":"00:FF:0C:00:00:01:SYDG0631-598Y-777" + mockDataGroupListIndex,
				"dms_devices_name":"[Indoor] A:15F:777" + mockDataGroupListIndex,
				"dms_devices_type":"AirConditioner.Indoor",
				"foundation_space_buildings_id":1,
				"foundation_space_floors_id":mockDataGroupListIndex % 50,
				"properties":[
					"indoor_power",
					"indoor_mode",
					"current_room_temp",
					"indoor_set_temp",
					"discharge_cool_set_temp",
					"discharge_heat_set_temp",
					"indoor_cool_low_limit",
					"indoor_heat_high_limit",
					"indoor_fan_speed",
					"ventilator_fan_speed"
				]
			}
		);
	}

	var originData;

	var popupResetData;

	var totalBuildList;
	var totalFloorList;
	var mappingDevicesName = {};
	var REPORTMAXLENGTH = 100;

	var dmsTypeArr = {
		AirConditioner:['AirConditioner.Indoor','AirConditioner.AHU','AirConditioner.Chiller','AirConditioner.DuctFresh','AirConditioner.EHS','AirConditioner.ERV','AirConditioner.ERVPlus','AirConditioner.FCU','AirConditioner.SFCU'],
		AirConditionerOutdoor:['AirConditionerOutdoor'],
		ControlPoint:['ControlPoint'],
		Light:['Light'],
		Meter:['Meter.Calori','Meter.Gas','Meter.Water','Meter.WattHour'],
		Sensor:['Sensor.Humidity','Sensor.Temperature','Sensor.Motion','Sensor.Temperature_Humidity']
	};

	var dmsTypeTotalDataState = false;
	var dmsTypeTotalData = {
		AirConditioner:[],
		AirConditionerOutdoor:[],
		ControlPoint:[],
		Light:[],
		Meter:[],
		Sensor:[]
	};

	/**
	*   <ul>
	*   <li>메인팝업 그룹리스트에 출력되는 기기들의 빌딩,층 정보를 다국어 처리하기 위해 전체 데이터 API호출 후 저장</li>
	*   </ul>
	*   @function  buildingFloorGetData
	*   @returns {Void} -
	*/
	var buildingFloorGetData = function(){
		totalBuildList = window.MAIN_WINDOW.getCurrentBuildingList();
		var url = "/foundation/space/floors";
		$.ajax({
			url : url
		}).done(function(data){
			totalFloorList = data;
		}).fail(function(e){
			errorCheck(e);
		});
		// totalFloorList = window.MAIN_WINDOW.getCurrentFloorList();
	};
	buildingFloorGetData();

	/**
	*   <ul>
	*   <li>기간 간격 필드에 그리드 데이터를 가공하는 함수.</li>
	*   </ul>
	*   @function  dateI18Apply
	*   @param {String}date - 기간 간격 데이터
	*   @returns {String} 다국어 처리 및 가공이 완료된 데이터를 리턴
	*/
	var dateI18Apply = function(date) {
		if(date === 'Day'){
			return	I18N.prop('REPORT_REPORT_DAY');
		}else if(date === 'Week'){
			return	I18N.prop('REPORT_REPORT_WEEK');
		}else if(date === 'Month'){
			return	I18N.prop('REPORT_REPORT_MONTH');
		}else if(date === 'Custom'){
			return	I18N.prop('REPORT_REPORT_CUSTOM');
		}else if(date === 'Hourly'){
			return	I18N.prop('REPORT_REPORT_HOURLY');
		}else if(date === 'Daily'){
			return	I18N.prop('REPORT_REPORT_DAILY');
		}else if(date === 'Monthly'){
			return	I18N.prop('REPORT_REPORT_MONTHLY');
		}
	};

	/**
	*   <ul>
	*   <li>자동생성 필드에 그리드 데이터를 가공하는 함수.</li>
	*   </ul>
	*   @function  autoGenerateI18Apply
	*   @param {String} sInterval - Daily|Weekly|Monthly 매일,매주,매달
	*   @param {String} sTime - 날짜형식에 맞는 시간,요일,일자 (0~24, (1)~(7), 1~31)
	*   @returns {String} 다국어 처리 및 가공이 완료된 데이터를 리턴
	*/
	var autoGenerateI18Apply = function(sInterval, sTime) {
		var timeDisplay = window.GlobalSettings.getTimeDisplay();
		if(sInterval === 'Daily'){
			if(timeDisplay === '12Hour'){
				return AMFMSetting(sTime);
			}else if(timeDisplay === '24Hour'){
				return I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_DAILY', sTime);
			}
		}else if(sInterval === 'Weekly'){
			return I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_WEEKLY', I18N.prop('REPORT_REPORT_AUTOGENDERATE_DAILY_' + String(sTime)));
		}else if(sInterval === 'Monthly'){
			return I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_MONTHLY', sTime);
		}
	};

	/**
	*   <ul>
	*   <li>메인 리포트 중앙 그리드 데이터를 가공하는 함수.</li>
	*   </ul>
	*   @function  gridDataProcessing
	*   @param {Object}ajaxData - 백엔드에 요청한 데이터
	*   @returns {Object} 다국어 처리 및 가공이 완료된 데이터를 리턴
	*/
	var gridDataProcessing = function(ajaxData) {
		if(typeof ajaxData === 'undefined') return false;
		if(!(ajaxData instanceof Array)) ajaxData = [ajaxData];

		var gridData = $.extend(true,[], ajaxData);
		for(var forIndex = 0; forIndex < gridData.length; forIndex++){
			if(typeof gridData[forIndex].type !== 'undefined'){
				if(gridData[forIndex].type === 'General'){
					gridData[forIndex].type = I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_NORMAL');
				}else if(gridData[forIndex].type === 'Template'){
					gridData[forIndex].type = I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_TEMPLATE');
				}
			}
			if(typeof gridData[forIndex].dms_devices_type !== 'undefined'){
				gridData[forIndex].dms_devices_type = Util.getDetailDisplayTypeDeviceI18N(gridData[forIndex].dms_devices_type);
			}
			if(typeof gridData[forIndex].duration !== 'undefined'){
				gridData[forIndex].duration = dateI18Apply(gridData[forIndex].duration);
			}
			if(typeof gridData[forIndex].interval !== 'undefined'){
				gridData[forIndex].interval = dateI18Apply(gridData[forIndex].interval);
				if(typeof gridData[forIndex].startTime !== 'undefined' && typeof gridData[forIndex].endTime !== 'undefined'){
					gridData[forIndex].startDate = new Date(gridData[forIndex].startTime);
					gridData[forIndex].startTime = new Date(gridData[forIndex].startTime);
					gridData[forIndex].endDate = new Date(gridData[forIndex].endTime);
					gridData[forIndex].endTime = new Date(gridData[forIndex].endTime);
				}
			}
			if(typeof gridData[forIndex].autoGenerate !== 'undefined'){
				if(gridData[forIndex].autoGenerate){
					gridData[forIndex].autoGenerateTime = autoGenerateI18Apply(gridData[forIndex].autoGenerateInterval, gridData[forIndex].autoGenerateTime);
					gridData[forIndex].autoGenerateInterval = autoGenerateDataProcessing(gridData[forIndex].autoGenerateInterval);
					gridData[forIndex].autoGeneration = gridData[forIndex].autoGenerateInterval + " " + gridData[forIndex].autoGenerateTime;
					gridData[forIndex].autoGenerate = I18N.prop('REPORT_REPORT_POPUP_AUTO_CREATE_NAME');
				}else{
					gridData[forIndex].autoGenerateInterval = I18N.prop('REPORT_REPORT_POPUP_AUTO_CREATE_NOT_APP');
					gridData[forIndex].autoGenerateTime = I18N.prop('REPORT_REPORT_POPUP_AUTO_CREATE_NOT_APP');
					gridData[forIndex].autoGenerate = I18N.prop('REPORT_REPORT_POPUP_AUTO_CREATE_NAME');
				}
			}
			if(typeof gridData[forIndex].devices !== 'undefined'){
				gridData[forIndex].devices = popupGroupGridDataProcessing(gridData[forIndex].devices,false);
			}
		}
		return gridData;
	};
	/**
	*   <ul>
	*   <li>기본요청을 하고 파라메타 search 값이 온다면 상단 검색필터 클릭시 데이터를 검색 데이터를 요청하고 요청원본은 originData저장하고 gridDataProcessing 활용하여 가공하여 리턴하는 함수</li>
	*   </ul>
	*   @function searchGridAjaxData
	*   @param {String}type - 검색 요청, 기본 요청 구분
	*   @returns {Object} - 데이터 리턴, 100개 초과 값 알림리턴
	*/
	var reportGridAjaxData = function(type){
		var url = "/dms/reports";
		if(type == 'serach'){
			var topSearchVal =  String($('#search-input-text').val());
			url = "/dms/reports?contains=" + topSearchVal;
		}
		var dfd = new $.Deferred();
		var reportLengthOver = false;
		$.ajax({
			url : url
		}).done(function(data){
			// originData = data;
			data = dmsDevicesTypeCheck(data);
			if(data.length >= REPORTMAXLENGTH){
				reportLengthOver = true;
			}
			dfd.resolve(gridDataProcessing(data),reportLengthOver);
		}).fail(function(e){
			// originData = type == 'serach' ? MockFailData : MockData;		//[추후 수정요망]
			// dfd.reject(gridDataProcessing(originData));
			errorCheck(e);
			dfd.reject(e);
		});
		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>메인뷰 삭제 버튼클릭시 데이터 삭제 요청하는 함수</li>
	*   </ul>
	*   @function deleteReportAjaxData
	*   @param {Object}checkData - 메인 그리드에서 체크된 데이터
	*   @returns {void}
	*/
	var deleteReportAjaxData = function(checkData){
		var deleteReportId = '';
		for(var i = 0; i < checkData.length; i++){
			deleteReportId += checkData[i].id + ',';
		}
		deleteReportId = deleteReportId.slice(0,-1);
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/reports?ids=" + deleteReportId,
			method : "DELETE"
		}).done(function(data){
			dfd.resolve(data);
		}).fail(function(e){
			errorCheck(e);
			dfd.reject(e);
		});
		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>메인뷰 다운로드 버튼클릭시 데이터 다운로드 데이타 요청하는 함수</li>
	*   </ul>
	*   @function requestGridDownload
	*   @param {String}idData - 메인 그리드에서 클릭한 다운로드버튼 아이디값
	*   @returns {void}
	*/
	var requestGridDownload = function(idData){
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/reports/" + idData + "/download",
			dataType:"binary"
		}).done(function(response, status, request){
			dfd.resolve(new Blob([response]), responseGetFileName(request));
		}).fail(function(e){
			errorCheck(e);
			dfd.reject(e);
		});
		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>자동생성리스트 다운로드 버튼클릭시 데이터 다운로드 데이타 요청하는 함수</li>
	*   </ul>
	*   @function autoGeneratedReportDownload
	*   @param {String}detailId - 상세팝업 아이디
	*   @param {String}idData - 자동생성리포트 리스트 그리드 다운로드버튼 아이디값
	*   @returns {void}
	*/
	var autoGeneratedReportDownload = function(detailId,idData){
		var dfd = new $.Deferred();
		idData = idData.trim();
		$.ajax({
			url : "/dms/reports/" + detailId + "/files/" + idData + "/download",
			dataType:"binary"
		}).done(function(response, status, request){
			dfd.resolve(new Blob([response]), responseGetFileName(request));
		}).fail(function(e){
			errorCheck(e);
			dfd.reject(e);
		});
		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>팝업에서 보고서 목록 클릭시 팝업에 필요한 데이터를 요청하는 함수</li>
	*   </ul>
	*   @function autoCreateReportListAjaxData
	*   @param {String}idData - 팝업 하단에 보고서 목록 클릭시 해당 팝업에 아이디값
	*   @returns {void}
	*/
	var autoCreateReportListAjaxData = function(idData){
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/reports/" + idData + "/files"
		}).done(function(data){
			var dataSource = new kendo.data.DataSource({
				data: data,
				sort: { field: "id", dir: "asc" }
			});
			dfd.resolve(dataSource);
		}).fail(function(e){
			// var dataSource = new kendo.data.DataSource({
			// 	data: autoCreateReportListMockFailData,
			// 	sort: { field: "id", dir: "asc" }
			// });
			errorCheck(e);
			dfd.reject(e);
		});
		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>보고서 리스트 삭제 버튼클릭시 데이터 삭제 요청하는 함수</li>
	*   </ul>
	*   @function deleteAutoCreateReportList
	*   @param {String}reportId - 팝업 아이디값
	*   @param {Object}checkData - 보고서 리스트 그리드에서 체크된 데이터
	*   @returns {void}
	*/
	var deleteAutoCreateReportList = function(reportId, checkData){
		var deleteReportListId = '';
		for(var i = 0; i < checkData.length; i++){
			deleteReportListId += checkData[i].id + ',';
		}
		deleteReportListId = deleteReportListId.slice(0,-1);
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/reports/" + reportId + "/files?ids=" + deleteReportListId,
			method : "DELETE"
		}).done(function(data){
			dfd.resolve(data);
		}).fail(function(e){
			errorCheck(e);
			dfd.reject(e);
		});
		return dfd.promise();
	};


	/**
	*   <ul>
	*   <li>메인뷰 상세버튼 클릭시 클릭된 아이디값에 상세정보를 요청하는 함수</li>
	*   <li>변수 데이터와 다국어적용된 변수로 리턴한다</li>
	*   </ul>
	*   @function detailDataPopupAjaxData
	*   @param {String}idData - 메인 그리드에서 클릭한 상세보기버튼 아이디값
	*   @returns {Object} - originData : 원형 데이터, processingData : 다국어적용 텍스트 또는 특정 데이터소스 등등
	*/
	var detailDataPopupAjaxData = function(idData){
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/reports/" + idData
		}).done(function(data){
			data = dmsDevicesTypeCheck(data);
			dfd.resolve({originData:data, processingData: gridDataProcessing(assignedDevicesPropertiesDivision(data))});
		}).fail(function(e){
			errorCheck(e);
			// dfd.reject({originData:MockFailData[0], processingData: gridDataProcessing(assignedDevicesPropertiesDivision(MockFailData[0]))});
		});
		return dfd.promise();
	};

	var time24hour12hourSet = function(){
		var forIndex = 0;
		var returnArr = [];
		var timeDisplay = window.GlobalSettings.getTimeDisplay();
		if(timeDisplay === '12Hour'){
			var timeText = '';
			for(forIndex = 0; forIndex < 24; forIndex++){
				timeText = AMFMSetting(forIndex);
				returnArr.push({value:forIndex,text:timeText});
			}
		}else if(timeDisplay === '24Hour'){
			for(forIndex = 0; forIndex < 24; forIndex++){
				returnArr.push({value:forIndex,text:I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_DAILY',forIndex)});
			}
		}
		return returnArr;
	};

	var AMFMSetting = function(time){
		var timeText;
		if(time > 12){
			timeText = I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_DAILY',time - 12) + "PM";
		}else if(time === 12){
			timeText = I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_DAILY',time) + "PM";
		}else if(time < 12){
			if(time === 0){
				timeText = I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_DAILY',12) + "AM";
			}else{
				timeText = I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_DAILY',time) + "AM";
			}
		}
		return timeText;
	};

	/**
	*   <ul>
	*   <li>자동 생성 간격에 일자 요일 월간에 따른 값에 따른 동적 배열값 생성을 위한 함수</li>
	*   </ul>
	*   @function generalIntervalDDLDataProcessing
	*   @param {String}selectData - 선택한 날짜값
	*   @returns {void}
	*/
	var generalIntervalDDLDataProcessing = function(selectData){
		var forIndex = 0;
		var returnArr = [];
		if(selectData == 'Daily'){
			returnArr = time24hour12hourSet();
		}else if(selectData == 'Weekly'){
			for(forIndex = 1; forIndex < 8; forIndex++){
				returnArr.push({value:forIndex,text:I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_WEEKLY',I18N.prop('REPORT_REPORT_AUTOGENDERATE_DAILY_' + forIndex))} );
			}
		}else if(selectData == 'Monthly'){
			for(forIndex = 1; forIndex < 32; forIndex++){
				returnArr.push({value:forIndex,text:I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_INTERVAL_MONTHLY',forIndex)});
			}
		}
		return returnArr;
	};

	/**
	*   <ul>
	*   <li>팝업 보고기간시 일간 주간 월간에 따른 현재 날짜를 기준으로 시작날짜를 일,주,월 로 설정해주는 함수</li>
	*   </ul>
	*   @function durationSetDataProcessing
	*   @param {Object}changeType -  선택된 보고기간 타입
	*   @returns {Object}returnDate
	*/
	var durationSetDataProcessing = function(changeType){
		var returnDate = {startDate:void 0,endDate:void 0};
		if(changeType === 'Day'){
			returnDate.startDate = new Date(moment().subtract(1, 'days').startOf('hour').format() );
			returnDate.endDate = new Date(moment().startOf('hour').format() );
		}else if(changeType === 'Week'){
			returnDate.startDate = new Date(moment().subtract(1,'week').startOf('hour').format() );
			returnDate.endDate = new Date(moment().startOf('hour').format() );
		}else if(changeType === 'Month'){
			returnDate.startDate = new Date(moment().subtract(1,'month').startOf('hour').format() );
			returnDate.endDate = new Date(moment().startOf('hour').format() );
		}
		return returnDate;
	};

	/**
	*   <ul>
	*   <li>팝업 보고기간이 일간 주간 월간인지 따라 보고간격 값을 리턴한다 커스텀은 2일,30일30일초과 등으로 계산하여 값을 리턴한다</li>
	*   </ul>
	*   @function intervalSetDataProcessing
	*   @param {Object}changeType -  선택된 보고기간 타입
	*   @param {Object}customDate -  커스텀 날짜
	*   @returns {Object}returnDate
	*/
	var intervalSetDataProcessing = function(changeType,customDate){
		var tmpData = [
			{value:'Hourly',text:I18N.prop('REPORT_REPORT_HOURLY')},
			{value:'Daily',text:I18N.prop('REPORT_REPORT_DAILY')},
			{value:'Monthly',text:I18N.prop('REPORT_REPORT_MONTHLY')}
		];
		var tmpDsDate = [
			[tmpData[0]],
			[tmpData[0],tmpData[1]],
			[tmpData[0],tmpData[1],tmpData[2]]
		];
		var returnDate;
		if(changeType === 'Day'){
			returnDate = tmpDsDate[0];
		}else if(changeType === 'Week'){
			returnDate = tmpDsDate[1];
		}else if(changeType === 'Month'){
			returnDate = tmpDsDate[2];
		}else if(changeType === 'Custom'){
			if(customDate.startDate !== 'undefined' && customDate.endDate !== 'undefined'){
				var start = moment(customDate.startDate); //todays date
				var end = moment(customDate.endDate); // another date
				var duration = moment.duration(start.diff(end));
				var days = duration.asDays();
				if(days > -2 ){
					returnDate = tmpDsDate[0];
				}else if(days <= -2 && days > -30){
					returnDate = tmpDsDate[1];
				}else if(days <= -30 ){
					returnDate = tmpDsDate[2];
				}
			}
		}else{
			returnDate = '';
		}
		return returnDate;
	};

	/**
	*   <ul>
	*   <li>자동 생성 간격에 데이터를 위한 함수</li>
	*   </ul>
	*   @function autoGenerateDataProcessing
	*   @param {String}selectData - 선택한 날짜값
	*   @returns {void}
	*/
	var autoGenerateDataProcessing = function(selectData){
		if(selectData == 'Daily'){
			return I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_DAILY');
		}else if(selectData == 'Weekly'){
			return I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_WEEKLY');
		}else if(selectData == 'Monthly'){
			return I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_MONTHLY');
		}
	};

	/**
	*   <ul>
	*   <li>날짜가 미래를 초과하는지 확인하는 함수</li>
	*   </ul>
	*   @function dateDataOverCheck
	*   @param {Object}date - 선택한 날짜값
	*   @returns {void}
	*/
	var dateDataOverCheck = function(date){
		var now = moment(new Date()); //todays date
		var end = moment(date); // another date
		var duration = moment.duration(now.diff(end));
		var days = duration.asDays();
		if(days <= 0 ){
			return false;
		}
		return true;
	};

	/**
	*   <ul>
	*   <li>날짜가 1년이상인지 확인하는 함수/li>
	*   </ul>
	*   @function dateDataOverCheck
	*   @param {Object}sd - 선택한 날짜값
	*   @param {Object}ed - 선택한 날짜값
	*   @returns {void}
	*/
	var dateDataOneYearOverCheck = function(sd,ed){
		var now = moment(sd); //todays date
		var end = moment(ed); // another date
		var duration = moment.duration(now.diff(end));
		var days = duration.asDays();
		if(days < -365 ){
			return false;
		}
		return true;
	};

	/**
	*   <ul>
	*   <li>시간을 정시로 바꿔주는 함수</li>
	*   </ul>
	*   @function timeDataProcessing
	*   @param {Object}date - 선택한 날짜값
	*   @returns {void}
	*/
	var timeDataProcessing = function(date){
		date = moment(date).minutes(0).seconds(0).format();
		return new Date(date);
	};

	/**
	*   <ul>
	*   <li>시작날짜과 종료날짜값을 확인하여 시작날짜값이 종료날짜값을 이상인지 확인하는함수</li>
	*   </ul>
	*   @function checkDateTimePicker
	*   @param {Object}startDateTime -  시작날짜값
	*   @param {Object}endDateTime - 종료날짜값
	*   @returns {void}
	*/
	var checkDateTimePicker = function(startDateTime, endDateTime){
		var sm = moment(startDateTime);
		var em = moment(endDateTime);
		if(em.isBefore(sm) || sm.format("YYYYMMDDHHMM") == em.format("YYYYMMDDHHMM")){
			return false;
		}
		return true;
	};

	/**
	*   <ul>
	*   <li>dms 데이타를 팝업 그룹리스트에 선택된 아이템값으로 만들어주는 함수</li>
	*   </ul>
	*   @function popupGroupGridDataProcessing
	*   @param {Object}ajaxData -  dms데이타
	*   @param {Object}status -  그룹리스트 선택 미선택 분류 값
	*   @returns {Object}ds
	*/
	var popupGroupGridDataProcessing = function(ajaxData,status){
		if(status){
			var ajaxDataLength = ajaxData.length;
			for(var i = 0; i < ajaxDataLength; i++){
				if(typeof ajaxData[i]['assigned'] === 'undefined'){
					ajaxData[i]['assigned'] = status;
				}
			}
		}
		// var ds = new kendo.data.DataSource({
		// 	data: ajaxData,
		// 	group: [
		// 		{field: 'foundation_space_buildings_id'},
		// 		{field: 'foundation_space_floors_id'},
		// 		{field: 'dms_devices_id'}
		// 	]
		// });
		// ds.read();
		// console.timeEnd('data');
		return ajaxData;
	};

	/**
	*   <ul>
	*   <li>선택된 보고기간과 보고간격 조건에 따라 보고간격 리스트 날짜를 출력하여 리턴하는 함수</li>
	*   </ul>
	*   @function popupIntervalGridDataProcessing
	*   @param {Object}selectInterval - 선택된 보고간격
	*   @param {Object}sd -  선택된 보고기간 시작날짜
	*   @param {Object}st -  선택된 보고기간 시작시간
	*   @param {Object}ed -  선택된 보고기간 종료날짜
	*   @param {Object}et -  선택된 보고기간 종료시간
	*   @returns {Object}returnArr
	*/
	var popupIntervalGridDataProcessing = function(selectInterval,sd,st,ed,et){
		var returnArr = [];
		var max = 0;
		var now = moment(new Date( moment(sd).format('YYYY-MM-DD') + "T" + moment(st).format('HH:mm') ));
		var end = moment(new Date( moment(ed).format('YYYY-MM-DD') + "T" + moment(et).format('HH:mm') ));
		var duration = moment.duration(now.diff(end));
		var tmpDiffTime;
		var time;
		var setStartDate = moment(sd).format('YYYY-MM-DD') + "T" + moment(st).format('HH:mm');
		if(selectInterval === 'Hourly'){
			time = 'hour';
			tmpDiffTime = duration.asHours();
		}else if(selectInterval === 'Daily'){
			time = 'day';
			tmpDiffTime = duration.asDays();
		}else if(selectInterval === 'Monthly'){
			time = 'month';
			tmpDiffTime = duration.asMonths();
		}else{
			return returnArr;
		}
		max = Math.abs(tmpDiffTime);
		if(max > 5){
			max = 5;
		}
		for(var i = 0; i < max; i++){
			returnArr[i] = {text: moment(setStartDate).add(i, time).startOf(time).format('YYYY-MM-DD HH:mm:ss') };
		}
		return returnArr;
	};

	/**
	*   <ul>
	*   <li>현재빌딩에 일치하는 빌딩값에 이름을 알려주는 함수</li>
	*   </ul>
	*   @function getCurrentBuildingList
	*   @param {Object}val - 빌딩정보
	*   @returns {Object}totalBuildList
	*/
	var getCurrentBuildingList = function(val){
		for(var i = totalBuildList.length - 1; i >= 0; i--) {
			if(totalBuildList[i].sortOrder === val) {
			   return totalBuildList[i].name;
			}
		}
		return val;
	};
	/**
	*   <ul>
	*   <li>현재층에 일치하는 층값에 이름을 알려주는 함수</li>
	*   </ul>
	*   @function getCurrentFloorList
	*   @param {Object}val - 층정보
	*   @returns {Object}totalFloorList
	*/
	var getCurrentFloorList = function(val){
		for(var i = totalFloorList.length - 1; i >= 0; i--) {
			if(totalFloorList[i].id === val) {
				var name = typeof totalFloorList[i].name === 'undefined' || totalFloorList[i].name === '' ? '-' : totalFloorList[i].name;
				var type = typeof totalFloorList[i].type === 'undefined' || totalFloorList[i].type === '' ? '-' : totalFloorList[i].type;
				type = type === 'None' ? '' : type;
				return name + type;
			}
		}
		return val;
	};

	/**
	*   <ul>
	*   <li>메인팝업 그룹리스트를 사용하기 위해 기존 배열을 문자열로 변환 시킨걸 다시 유니크한 아이디값을 기준으로 잡아 재조합하는 함수</li>
	*   </ul>
	*   @function getAssignedItem
	*   @returns {Object}returnItemList
	*/
	var getAssignedItem = function(){
		var groupList = $("#report-group-list").data('kendoCommonGroupList');
		var getAssignedItemList = $.extend(true,[],groupList.getAssignedItems());
		var tmpItemList = [];
		var returnItemList = [];
		var macthIndex = 0;
		var macthStatus = false;
		for(var i = 0; i < getAssignedItemList.length; i++){
			macthStatus = false;
			for(var j = 0; j < tmpItemList.length; j++){
				if(getAssignedItemList[i].dms_devices_id === tmpItemList[j].dms_devices_id){
					macthIndex = j;
					macthStatus = true;
				}
			}
			if(macthStatus){
				tmpItemList[macthIndex].dms_reports_view_properties += "," + getAssignedItemList[i].dms_reports_view_properties;
			}else{
				tmpItemList.push(getAssignedItemList[i]);
			}
		}
		for(var k = 0; k < tmpItemList.length; k++){
			tmpItemList[k].dms_reports_view_properties = tmpItemList[k].dms_reports_view_properties.split(',');
		}
		for(var swapIndex = 0; swapIndex < tmpItemList.length; swapIndex++){
			returnItemList[swapIndex] = {
				dms_devices_id:'',
				dms_devices_name:'',
				dms_reports_view_properties:'',
				foundation_space_buildings_id: '',
				foundation_space_floors_id: ''
			};
			returnItemList[swapIndex].dms_devices_id = tmpItemList[swapIndex].dms_devices_id;
			returnItemList[swapIndex].dms_devices_name = tmpItemList[swapIndex].dms_devices_name;
			returnItemList[swapIndex].dms_reports_view_properties = tmpItemList[swapIndex].dms_reports_view_properties;
			returnItemList[swapIndex].foundation_space_buildings_id = tmpItemList[swapIndex].foundation_space_buildings_id;
			returnItemList[swapIndex].foundation_space_floors_id = tmpItemList[swapIndex].foundation_space_floors_id;
		}
		returnItemList = dataBuildSort(returnItemList,false);

		return returnItemList;
	};

	/**
	*   <ul>
	*   <li></li>
	*   </ul>
	*   @function getAssignedItemCheck
	*   @returns {Object}getAssignedItemListLength
	*/
	var getAssignedItemCheck = function(){
		var groupList = $("#report-group-list").data('kendoCommonGroupList');
		var getAssignedItemListLength = groupList.getAssignedItems().length;
		return getAssignedItemListLength;
	};

	/**
	*   <ul>
	*   <li>리포트 정보를 요청한 데이터중 디바이스에 속성값을 그룹리스트에 넣기 위해 기존 배열을 문자열로 만들어주는 함수</li>
	*   </ul>
	*   @function assignedDevicesPropertiesDivision
	*   @param {Object}data - 리포트 디바이스 배열
	*   @returns {Object}returnData
	*/
	var assignedDevicesPropertiesDivision = function(data){
		var ajaxData = data;
		var tmpDmsTypeTotalData = $.extend(true,[], dmsTypeTotalData[ajaxData.dms_devices_type]);
		var returnData = [];
		returnData[0] = $.extend(true,[], ajaxData);
		// returnData[0].devices = [];
		// if(typeof ajaxData.devices !== 'undefined'){
		// 	var devices = ajaxData.devices;
		// 	for(var assignedDevicesIndex = 0; assignedDevicesIndex < devices.length; assignedDevicesIndex++){
		// 		if(typeof devices[assignedDevicesIndex].properties !== 'undefined'){
		// 			devices[assignedDevicesIndex].dms_reports_view_properties = devices[assignedDevicesIndex].properties;
		// 		}
		// 		var Properties = devices[assignedDevicesIndex].dms_reports_view_properties;
		// 		if(Properties instanceof Array){
		// 			for(var PropertiesIndex = 0; PropertiesIndex < Properties.length; PropertiesIndex++){
		// 				returnData[0].devices.push( $.extend(true,{}, devices[assignedDevicesIndex]));
		// 				returnData[0].devices[returnData[0].devices.length - 1].dms_reports_view_properties = Properties[PropertiesIndex];
		// 			}
		// 		}else{
		// 			returnData[0].devices.push(devices[assignedDevicesIndex]);
		// 		}
		// 	}
		// }
		if(typeof ajaxData.devices !== 'undefined'){
			var devices = ajaxData.devices;
			for(var assignedDevicesIndex = 0, devicesLength = devices.length; assignedDevicesIndex < devicesLength; assignedDevicesIndex++){
				for(var dmsTypeToTalIndex = 0, dmsTypeToTal = tmpDmsTypeTotalData.length; dmsTypeToTalIndex < dmsTypeToTal; dmsTypeToTalIndex++){
					if(devices[assignedDevicesIndex].dms_devices_id === tmpDmsTypeTotalData[dmsTypeToTalIndex].dms_devices_id){
						var properties = devices[assignedDevicesIndex].dms_reports_view_properties;
						for(var propertiesIndex = 0; propertiesIndex < properties.length; propertiesIndex++){
							if(properties[propertiesIndex] === tmpDmsTypeTotalData[dmsTypeToTalIndex].dms_reports_view_properties){
								tmpDmsTypeTotalData[dmsTypeToTalIndex].assigned = true;
							}
						}
					}
				}
			}
		}
		returnData[0].devices = tmpDmsTypeTotalData;
		return returnData;
	};

	/**
	*   <ul>
	*   <li>팝업창에서 편집 또는 생성시 저장버튼을 눌렀을떄 팝업에 사용자가 설정한 정보를 서버에 요청하는 함수</li>
	*   </ul>
	*   @function saveDataAjax
	*   @param {Object}saveData - 리포트 디바이스 배열
	*   @param {Object}stateMode - 리포트 팝업에 현재 모드(편집,생성)
	*   @returns {Object}dfd
	*/
	var saveDataAjax = function(saveData,stateMode){
		var method = '';
		var url;
		if(saveData.type === "General"){
			url = "/dms/reports/";
			if(stateMode === 'create'){
				method = 'POST';
			}else if(stateMode === 'edit'){
				method = 'PATCH';
				url = "/dms/reports/" + saveData.id;
			}
		}else if(saveData.type === "Template"){
			url = "/dms/reports/";
			if(stateMode === 'create'){
				method = 'POST';
			}else if(stateMode === 'edit'){
				method = 'PATCH';
				url = "/dms/reports/" + saveData.id;
			}
		}
		var dfd = new $.Deferred();
		$.ajax({
			url : url,
			method : method,
			data :saveData
		}).done(function(data){
			dfd.resolve(data);
		}).fail(function(e){
			errorCheck(e);
			dfd.reject(e);
		});
		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>리포트 정보를 요청한 데이터중 디바이스에 속성값을 그룹리스트에 넣기 위해 기존 배열을 문자열로 만들어주는 함수</li>
	*   </ul>
	*   @function deAssignedDevicesPropertiesDivision
	*   @param {Object}data - 리포트 디바이스 배열
	*   @param {Object}selectValue - 선택된 기기타입
	*   @returns {Object}returnData
	*/
	var deAssignedDevicesPropertiesDivision = function(data,selectValue){
		var ajaxData = data;
		var returnData = [];
		var selectDmsArr = dmsTypeArr[selectValue];
		if(typeof ajaxData !== 'undefined'){
			var devices = ajaxData;
			var devicesLength = devices.length;
			for(var assignedDevicesIndex = 0; assignedDevicesIndex < devicesLength; assignedDevicesIndex++){
				var devicesType = devices[assignedDevicesIndex].dms_devices_type;
				for(var dmsTypeIndex = 0, dmsTypeArrLength = selectDmsArr.length; dmsTypeIndex < dmsTypeArrLength; dmsTypeIndex++){
					// if(devicesType.indexOf(selectDmsArr[dmsTypeIndex]) >= 0 ){
					if (devicesType === selectDmsArr[dmsTypeIndex]) {
						devices[assignedDevicesIndex].dms_reports_view_properties = devices[assignedDevicesIndex].properties;
						var Properties = devices[assignedDevicesIndex].dms_reports_view_properties;
						if(Properties instanceof Array){
							var PropertiesLength = Properties.length;
							for(var PropertiesIndex = 0; PropertiesIndex < PropertiesLength; PropertiesIndex++){
								returnData.push( $.extend(true,{}, devices[assignedDevicesIndex]));
								returnData[returnData.length - 1].dms_reports_view_properties = Properties[PropertiesIndex];
							}
						}else{
							returnData.push(devices[assignedDevicesIndex]);
						}
						// break;
					}
				}
			}
		}
		var returnDataLength = returnData.length;
		for (var i = 0; i < returnDataLength; i++) {
			mappingDevicesName[returnData[i].dms_devices_id] = returnData[i].dms_devices_name;
			delete returnData[i].properties;
		}
		return returnData;
	};


	/**
	*   <ul>
	*   <li>리포트 정보를 요청한 데이터중 디바이스에 속성값을 그룹리스트에 넣기 위해 기존 배열을 문자열로 만들어주는 함수</li>
	*   </ul>
	*   @function dmsTypeRefershData
	*   @param {Object}selectValue - 선택된 기기타입
	*   @returns {Object}dfd
	*/
	var dmsTypeRefershData = function(selectValue){
		var dfd = new $.Deferred();
		if(dmsTypeTotalDataState){
			if(typeof selectValue !== 'undefined' || selectValue !== ""){
				dfd.resolve(popupGroupGridDataProcessing(dmsTypeTotalData[selectValue],false));

				//몫데이터용
				// var deassigned;
				// deassigned = deAssignedDevicesPropertiesDivision(mockDataGroupList,selectValue);
				// dfd.resolve(popupGroupGridDataProcessing(deassigned,false));
			}
		}else{
			dmsTypeDataGet.done(function(){
				if(typeof selectValue !== 'undefined' || selectValue !== ""){
					dfd.resolve(popupGroupGridDataProcessing(dmsTypeTotalData[selectValue],false));
				}
			}).fail(function(e){
				dfd.reject([]);
				errorCheck(e);
			});
		}
		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>리포트 전체 기기데이터를 불러오는 함수</li>
	*   </ul>
	*   @function dmsTypeDataGet
	*   @returns {Object}dfd
	*/
	var dmsTypeDataGet = function(){
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/reports/view"
		}).done(function(data){
			data = dataBuildSort(data,true);

			$.each(dmsTypeArr, function( key ) {
				dmsTypeTotalData[key] = deAssignedDevicesPropertiesDivision(data,key);
			});
			dmsTypeTotalDataState = true;
			dfd.resolve();
		}).fail(function(e){
			errorCheck(e);
			dfd.reject();
		});
		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li>그룹리스트에 빌딩순으로 정렬할수있도록 매치되는 id값을 sortOrder로 변환또는 sortOrder를 id값으로 변환하는 함수</li>
	*   </ul>
	*   @function dataBuildSort
	*   @param {Object}data - 기기정보
	*   @param {Boolean}sortOrder - true : id -> sortOrder , false : sortOrder -> id
	*   @returns {Object}ajaxData
	*/
	var dataBuildSort = function(data,sortOrder){
		var ajaxData = data;
		var sortIndex, ajaxDataLength;
		var ifKeyValue = sortOrder === true ? 'id' : 'sortOrder';
		var matchValue = sortOrder === true ? 'sortOrder' : 'id';
		for(sortIndex = 0, ajaxDataLength = ajaxData.length; sortIndex < ajaxDataLength; sortIndex++){
			for(var buildIndex = 0, buildLength = totalBuildList.length; buildIndex < buildLength; buildIndex++){
				var devices = ajaxData[sortIndex];
				if(devices.foundation_space_buildings_id === totalBuildList[buildIndex][ifKeyValue]){
					devices['foundation_space_buildings_id'] = totalBuildList[buildIndex][matchValue];
					break;
				}
			}
		}
		return ajaxData;
	};

	/**
	*   <ul>
	*   <li>템플릿 팝업 생성 또는 편집시 파일등록버튼 클릭후 팝업에 엑셀파일 업로드 버튼을 클릭시 백엔드에 업로드하는 함수</li>
	*   </ul>
	*   @function fileAjax
	*   @param {String}saveData - save data
	*   @param {String}stateMode - 현재 선택된 모드
	*   @returns {Object}dfd
	*/
	var fileAjax = function(saveData,stateMode) {
		var method = '';
		var url;
		var dfd = new $.Deferred();
		if(typeof saveData !== 'undefined'){
			if(saveData.type === "Template"){
				url = "/dms/reports/";
				var formData;
				formData = saveData.file;
				formData.append('data', JSON.stringify(saveData));

				if(stateMode === 'create'){
					method = 'POST';
					$.ajax({
						url : url,
						method : method,
						data :formData,
						isFileUpload: true
					}).done(function(){
						dfd.resolve();
					}).fail(function(e){
						errorCheck(e);
						dfd.reject();
					}).always(function(){
					});
				}else if(stateMode === 'edit'){

					var patchAjax = $.ajax({
						url : "/dms/reports/" + saveData.id,
						method : "PATCH",
						data :saveData
					});
					if(formData.get('file') !== null && formData.get('file') !== "undefined"){
						url = "/dms/reports/" + saveData.id + "/template";
						method = 'DELETE';
						$.ajax({
							url : url,
							method : method
						}).done(function(){
							$.ajax({
								url : url,
								method : "POST",
								data :formData,
								isFileUpload: true
							}).done(function(){
							}).fail(function(e){
								errorCheck(e);
							}).always(function(e){
								patchAjax.done(function(){
									dfd.resolve();
								}).fail(function(fail){
									dfd.reject(fail);
								});
							});
						}).fail(function(e){
							errorCheck(e);
						});
					}else{
						patchAjax.done(function(){
							dfd.resolve();
						}).fail(function(e){
							errorCheck(e);
							dfd.reject();
						}).always(function(){
						});
					}
				}

			}
		}

		return dfd.promise();
	};

	/**
	*   <ul>
	*   <li></li>
	*   </ul>
	*   @function fileGetAjax
	*   @param {String}detailId - save data
	*   @returns {Object}dfd
	*/
	var fileGetAjax = function(detailId) {
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/reports/" + detailId + "/template",
			method : "GET",
			dataType:"binary"
		}).done(function(response, status, request){
			dfd.resolve(new Blob([response]), responseGetFileName(request));
		}).fail(function(e){
			errorCheck(e);
			dfd.reject(e);
		});
		return dfd.promise();
	};

	var formDataProcessingFunc = function(){
		var form,formData = new FormData();
		form = $('#excel-file-input');
		form = form.get(0).files[0];
		formData.append('file', form);
		return formData;
	};

	var responseGetFileName = function(request){
		var disp = request.getResponseHeader('Content-Disposition');
		var fileName = decodeURI(disp.substr(disp.indexOf('filename=') + 9, disp.length - 1));
		return fileName;
	};

	var errorCheck = function(e){
		var status = e.status,
			errorCode, message;
		var msgPopup = $('#popup-error-message').data('kendoCommonDialog');
		if(status === 400){
			msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_INVALID_FORMAT_ERROR"));
			msgPopup.open();
		}else if(status === 403){
			msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_PERMISSION_ERROR"));
			msgPopup.open();
		}else if(status === 500){
			if(e.responseJSON){
				errorCode = e.responseJSON.code;
			}
			if(errorCode === 41301){
				message = e.responseJSON.message;
				var startStrPos, endStrPos;
				startStrPos = message.indexOf("g [") + 3;
				endStrPos = message.indexOf("] c");
				message = message.slice(startStrPos, endStrPos);
				var split = message.split(", ");
				if(split.length > 3){
					split = split.slice(0, 3);
					message = split.join(", ");
				}
				msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_CONTROLPOINT_NOT_MATCH_ERROR", message));
			}else if(errorCode === 34){
				msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_DATABASE_NOT_RUN_ERROR"));
			}else{
				msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_DATABASE_NOT_RUN_ERROR"));
			}
			msgPopup.open();
		}
	};

	popupResetData = {
		originData:{
			type:'General',
			name:'',
			duration:'',
			dms_devices_type:'',
			interval:'',
			autoGenerate: false,
			autoGenerateInterval:'',
			autoGenerateTime:''
		},
		processingData:[
			{
				type:'',
				name:'',
				duration:'',
				dms_devices_type:'',
				autoGenerate: false,
				autoGenerateInterval:'',
				autoGenerateTime:'',
				startDate:timeDataProcessing(new Date()),
				startTime:timeDataProcessing(new Date(moment().subtract(1, 'hour')) ),
				endDate:timeDataProcessing(new Date()),
				endTime:timeDataProcessing(new Date()),
				devices:new kendo.data.DataSource({
					data: [],
					group: [
						{field: 'foundation_space_buildings_id'},
						{field: 'foundation_space_floors_id'},
						{field: 'dms_devices_name'}
					]
				})
			}
		]
	};

	var dmsDevicesTypeCheck = function(data){
		if(data instanceof Array){
			for(var i = 0, length = data.length; i < length; i++){
				if(typeof data[i].dms_devices_type !== 'undefined'){
					data[i].dms_devices_type = data[i].dms_devices_type.split('.')[0];
				}
			}
		}else if(data instanceof Object){
			if(typeof data.dms_devices_type !== 'undefined'){
				data.dms_devices_type = data.dms_devices_type.split('.')[0];
			}
		}
		return data;
	};

	return {
		originData: originData,
		popupResetData: popupResetData,
		gridDataProcessing: gridDataProcessing,
		deleteReportAjaxData: deleteReportAjaxData,
		reportGridAjaxData: reportGridAjaxData,
		requestGridDownload: requestGridDownload,
		detailDataPopupAjaxData: detailDataPopupAjaxData,
		generalIntervalDDLDataProcessing: generalIntervalDDLDataProcessing,
		timeDataProcessing: timeDataProcessing,
		checkDateTimePicker: checkDateTimePicker,
		dateDataOverCheck: dateDataOverCheck,
		dateDataOneYearOverCheck: dateDataOneYearOverCheck,
		durationSetDataProcessing : durationSetDataProcessing,
		popupGroupGridDataProcessing: popupGroupGridDataProcessing,
		popupIntervalGridDataProcessing: popupIntervalGridDataProcessing,
		intervalSetDataProcessing: intervalSetDataProcessing,
		getCurrentBuildingList: getCurrentBuildingList,
		getCurrentFloorList: getCurrentFloorList,
		assignedDevicesPropertiesDivision: assignedDevicesPropertiesDivision,
		autoCreateReportListAjaxData: autoCreateReportListAjaxData,
		deleteAutoCreateReportList: deleteAutoCreateReportList,
		saveDataAjax: saveDataAjax,
		getAssignedItem: getAssignedItem,
		dmsTypeRefershData: dmsTypeRefershData,
		fileAjax: fileAjax,
		getAssignedItemCheck: getAssignedItemCheck,
		autoGeneratedReportDownload: autoGeneratedReportDownload,
		fileGetAjax: fileGetAjax,
		errorCheck: errorCheck,
		mappingDevicesName: mappingDevicesName,
		dmsTypeDataGet: dmsTypeDataGet,
		formDataProcessingFunc: formDataProcessingFunc
	};
});

//# sourceURL=report-model-report-model.js