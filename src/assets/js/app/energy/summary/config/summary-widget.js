/**
 *
 *   <ul>
 *       <li>summary에 관련된 위젯 설정 작업</li>
 *   </ul>
 *   @module app/energy/summary/config/summary-widget
 *   @param {Object} CoreModule - 메인 코어 모듈
 *   @param {Object} Common - summary 공통
 *   @requires app/energy/core
 *   @requires app/energy/summary/config/summary-common
 *   @returns {Object} totalSummaryFields - 건물 summary field 설정
 *   @returns {Object} totalSummaryColumns - 건물 summary column 설정
 *   @returns {Object} allSummaryFloorColumns - 전체층, 층 summary column 설정
 *   @returns {Object} popupGridFields - 팝업 summary field 설정
 *   @returns {Object} popupGridColumns - 팝업 summary column 설정
 *   @returns {Object} messagDialog - 메세지 팝업 설정
 *   @returns {Object} confirmDialog - 컨펌 팝업 설정
 *   @returns {Object} Loading - 로딩 설정
 *   @returns {Object} Model - summary 모듈
 */
define("energy/summary/config/summary-widget", ["energy/core", "energy/summary/config/summary-common"], function(CoreModule, Common){
	//Code의 품질을 위하여 "use strict" 적용
	"use strict";
	var kendo = window.kendo;
	var Util = window.Util;
	var Settings = window.GlobalSettings;
	var I18N = window.I18N;
	var TEXT = Common.TEXT;

	/*
		Space 공용 Widget 및 Widget 설정
		1. Grid Column & Column Template
		2. Buttom Made
		3. Message/Confirm Dialog, Loading Panel
		4. ETC. Util. and so on.
	*/

	var energyDialogElem = $("<div/>"), energyDialog;
	energyDialog = energyDialogElem.kendoCommonDialog({
		type : "confirm"                   //초기화시 type을 "confirm"으로 설정
	}).data("kendoCommonDialog");

	/* 메시지 다이얼로그 */
	var identifyDialog, identifyDialogElem = $("<div/>");
	identifyDialog = identifyDialogElem.kendoCommonDialog().data("kendoCommonDialog");

	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();


	/*
		Grid Column Editor Template
	*/
	var summaryModel = kendo.data.Model.define({
		id: "id",
		fields: {
			"id": {
				name: "id",
				type: "string",
				editType: null
			},
			"location": {
				name: "Location",
				type: "string",
				editType:null
			},
			"Algorithm": {
				name: "Algorithm",
				type: "string",
				editType: null
			},
			"statistic": {
				name: "Statistic",
				type: "string",
				editType: null
			}
		}
	});

	var Template = {
		location: function(dataItem){
			var text = '-';
			if(dataItem.location){
				text = dataItem.location;
			}
			var parentDiv = jQuery('<div class="parentDiv"><span class="location">' + text + '</span></div>');
			// var mapDiv;				//[12-04-2018]안쓰는 코드 주석
			/*var divObj = jQuery('<div class="mapDiv"></div>')
				parentDiv.prepend(divObj);*/
			return parentDiv.html();
		},
		modes: function(dataItem){
			//console.log(dataItem)
			var modeList = dataItem.algorithm;
			var textList = '-';
			// var text = '';			//[12-04-2018]안쓰는 코드 주석
			var modeText;

			if(modeList){
				textList = "";
				var max = modeList.length;
				for(var i = 0; i < max; i++){
					if(modeList[i] == 'OptimalStart'){
						modeText = TEXT.ENERGY_OPTIMAL_START;
					}
					if(modeList[i] == 'Comfort'){
						modeText = TEXT.ENERGY_COMFORT;
					}
					if(modeList[i] == 'PRC'){
						modeText = TEXT.ENERGY_PRC;
					}
					textList += modeText;
					if(i != max - 1){
						textList += ", ";
					}
				}
			}
			return textList;
		},
		algorithm: function(dataItem){
			//console.log(dataItem)

			var data;
			var returnData = '';
			var comma = '';
			var setData;
			if(dataItem.algorithm){
				if((dataItem.algorithm).indexOf(',') > 0){
					data = (dataItem.algorithm).split(', ');
				}else{
					data = [dataItem.algorithm];
				}
				// console.log(data)
				returnData = '';
				for(var i = 0; i < data.length; i++){
					if(i > 0){
						comma = ', ';
					}
					if(data[i] == 'OptimalStart'){
						setData = TEXT.ENERGY_OPTIMAL_START;
					}else if(data[i] == 'Comfort'){
						setData = TEXT.ENERGY_COMFORT;
					}else if(data[i] == 'PRC'){
						setData = TEXT.ENERGY_PRC;
					}
					returnData = returnData + (comma + setData);
				}
				return returnData;
			}

			return '-';
			/*var modeList = dataItem.algorithm;
				var textList = '-';
				var text = '';
				if(modeList){
					textList = "";
					var max = modeList.length;
					for(var i = 0 ; i < max; i++){
						textList += modeList[i];
						if(i != max-1){
							textList += ", ";
						}
					}
				}
				return textList;*/
		},
		deviceType : function(dataItem){
			var type = dataItem.dms_device_type;
			if(type){
				type = Util.getDetailDisplayTypeDeviceI18N(type);
				// [12-04-2018]ESLint룰 적용으로 인한 코드 수정
				// }else{
				//     //Motion Sensor
				//     if(dataItem.occupancy !== undefined){
				//         type = Util.getDetailDisplayTypeDeviceI18N("Sensor.Motion");
				//     //Temp & Humi
				//     }else if(dataItem.temperature !== undefined || dataItem.humidity !== undefined){
				//         type = Util.getDetailDisplayTypeDeviceI18N("Sensor.Temperature_Humidity");
				//     }else{
				//         type = "-";
				//     }
				// }
			}else if(typeof dataItem.occupancy !== "undefined"){ //Motion Sensor
				type = Util.getDetailDisplayTypeDeviceI18N("Sensor.Motion");
				//Temp & Humi
			}else if(typeof dataItem.temperature !== "undefined" || typeof dataItem.humidity !== "undefined"){
				type = Util.getDetailDisplayTypeDeviceI18N("Sensor.Temperature_Humidity");
			}else{
				type = "-";
			}
			return type;
		},
		temp: function(dataItem){
			var temp = Settings.getTemperature();
			var unit = Util.CHAR[temp.unit];
			var temperature, humidity;
			if(dataItem.temperature){
				temperature = dataItem.temperature;
			}else{
				temperature = '--.-';
			}
			if(dataItem.humidity){
				humidity = dataItem.humidity;
			}else{
				humidity = '--';
			}
			return temperature + unit + ' / ' + humidity + "%";
		},
		information: function(dataItem){
			var temp = Settings.getTemperature();
			var unit = Util.CHAR[temp.unit];
			var returnCurrentTemperature,returnSetTemperature,
				temperature, humidity;
			var val = "-";
			//SAC Indoor
			if(typeof dataItem.currentTemperature !== "undefined" || typeof dataItem.setTemperature !== "undefined"){
				returnCurrentTemperature = dataItem.currentTemperature ? dataItem.currentTemperature : '--.-';
				returnSetTemperature = dataItem.setTemperature ? dataItem.setTemperature : '--.-';
				val = returnCurrentTemperature + unit + ' / ' + returnSetTemperature + unit;
				//Motion Sensor
			}else if(typeof dataItem.occupancy !== "undefined"){
				if(dataItem.occupancy === null){
					val = "-";
				}else{
					val = dataItem.occupancy ? I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_PRESENCE") : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_ABSENCE");
				}
				//Temperature, Humidity
			}else if(typeof dataItem.temperature !== "undefined" || typeof dataItem.humidity !== "undefined"){
				// temperature = dataItem.temperature === null ? "--.-" : dataItem.temperature; // [19.08.02 SAMB-896] 으로 아래로 수정
				// humidity = dataItem.humidity === null ? "--.-" : dataItem.humidity; // [19.08.02 SAMB-896] 으로 아래로 수정
				temperature = typeof dataItem.temperature === "undefined" ? "--.-" : dataItem.temperature;
				humidity = typeof dataItem.humidity === "undefined" ? "--.-" : dataItem.humidity;
				temperature += unit;
				humidity += "%";
				val = temperature + " / " + humidity;
			}

			return val;
		},
		comfort: function(dataItem){
			var txt,levelName, span = $("<span/>");
			var comfortLevel = dataItem.comfort_index;
			if(!comfortLevel){
				span.text("-");
				return span.html();
			}

				   /* if(comfortLevel < -2){
						txt = "Very Uncomfortable";
						levelName = 'Very'
					}else if(comfortLevel < 0){
						txt = "Uncomfortable";
						levelName = 'Uncomfortable'
					}else if(comfortLevel < 2){
						txt = "Sightly Uncomfortable";
						levelName = 'Sightly'
					}else{
						txt = "Comfortable";
						levelName = 'Comfortable'
					}*/
			if(comfortLevel == "Uncomfortable"){
				txt = TEXT.SPACE_COMFORT_INDEX_UNCOMFORTABLE;

				levelName = 'uncomfortable';
			}else if(comfortLevel == "Comfortable"){
				txt = TEXT.SPACE_COMFORT_INDEX_COMFORTABLE;
				levelName = 'comfortable';
			}else if(comfortLevel == "Normal"){
				txt = TEXT.ENERGY_NORMAL;
				levelName = 'normal';
			}else if(comfortLevel == "None"){
				txt = TEXT.ENERGY_NONE;
				levelName = 'none';
			}else{
				txt = "-";
				levelName = 'none';
			}

			// var className = "space-comfort "+levelName;				//[12-04-2018]안쓰는 코드 주석
			var icon = $("<i/>").addClass("comfort-icon " + levelName);
			icon.appendTo(span);
			var textElem = $("<span/>").text(txt);
			textElem.appendTo(span).addClass(levelName);
			return span.html();
		},
		zoneDetail: function(){
			return '<button>팝업 열기</button>';
		},
		/*information: function(dataItem){
				var temp = Settings.getTemperature();
				var unit = Util.CHAR[temp.unit];
				return dataItem.temperature + unit+' / '+dataItem.humidity+"%";
			},*/
		total: function(){
			// console.log(dataItem);
			/*console.log(dataItem.optimal_start_count);
				console.log(dataItem.comfort_count);
				console.log(dataItem.prc_count);*/
			//[12-04-2018]안쓰는 코드 주석
			// if(dataItem.zone_count){
			//
			// }
		},
		operationMode: function(dataItem){
			var mode;
			if(dataItem.operationMode){
				mode = Util.getModeToI18N(dataItem.operationMode);

				if(mode == 'None'){
					mode = TEXT.ENERGY_NONE;
				}
				return mode;
			}
			return '-';
		},
		status: function(dataItem){
			var status = dataItem.status;
			var power = dataItem.power;
			var css = "";
			if(status){
				if(status == "Normal"){
					if(power){
						css = "Normal-On";
					}else{
						css = "Normal-Off";
					}
				}else if(status == "Critical"){
					css = "Alarm-Critical";
				}else if(status == "Warning"){
					css = "Alarm-Warning";
				}else{
					css = "Normal-On";
				}

				return '<span class="circle-icon ' + css + '"></span>';
			}
			return '-';
		},
		optimalStartCount:function(dataItem){
			if(dataItem.optimal_start_count == 0 || dataItem.optimal_start_count){
				return dataItem.optimal_start_count;
			}
			return '-';
		},
		comfortCount:function(dataItem){
			if(dataItem.comfort_count == 0 || dataItem.comfort_count){
				return dataItem.comfort_count;
			}
			return '-';
		},
		prcCount:function(dataItem){
			if(dataItem.prc_count == 0 || dataItem.prc_count){
				return dataItem.prc_count;
			}
			return '-';
		}
	};


	var totalSummaryFields = {
		foundation_space_buildings_name: {editable:false},
		zone_count: {editable:false},
		optimal_start_count: { editable:false },
		comfort_count: { editable:false },
		presence_count: { editable:false },
		prc_count: { editable:false }
	};

	var totalSummaryColumns = function(totalData){
		return [//내부 데이터 설정
			{ field: "foundation_space_building_name", title: TEXT.COMMON_MENU_SPACE_BUILDING, footerTemplate: TEXT.ENERGY_TOTAL, footerAttributes: {"class": "table-footer-cell two"}, attributes: {"data-name": 'building'},width:120, format: "",sortable: false},
			/*{ field: "zone_count", title: TEXT.SPACE_ZONE, footerTemplate: String(totalData.zoneCount), footerAttributes: {"class": "table-footer-cell two"}, attributes: {"data-name": 'zone' },width:140,  format: "", sortable: false},*/
			{ field: "optimal_start_count", title: TEXT.ENERGY_OPTIMAL_START, footerTemplate: String(totalData.optimalStartCount), footerAttributes: {"class": "table-footer-cell two"},attributes: {"data-name": 'optimal' },sortable: false, width:180,format: "",template: Template.optimalStartCount},
			{ field: "comfort_count", title: TEXT.ENERGY_COMFORT, footerTemplate: String(totalData.comfortCount), footerAttributes: {"class": "table-footer-cell two"},attributes: {"data-name": 'comfort' },sortable: false, width:120,format: "" ,editable: false,template: Template.comfortCount},
			{ field: "prc_count", title: TEXT.ENERGY_PRC, footerTemplate: String(totalData.prcCount), footerAttributes: {"class": "table-footer-cell two"},attributes: {"data-name": 'prc' },sortable: false, width:120,format: "" ,editable: false,template: Template.prcCount}
		];
	};
	/* 페이지 내부 폼 저장 */
	var allSummaryFloorFields = {
		zone_id: { editable: false },
		location: { editable:false },
		modes: { editable:false },
		temperature: { editable:false },
		humidity: { editable:false },
		comfort_index: { editable:false }
	};
	var allSummaryFloorColumns = [//내부 데이터 설정
		{field:'location' ,title:TEXT.ENERGY_LOCATION ,attributes: {"data-name": 'floor'},width:140, format: "", sortable: true, template: Template.location},
		{field:'algorithm' ,title: TEXT.ENERGY_ALGORITHM,attributes: {"data-name": 'algorithm' },sortable: true, width:180,format: "", template: Template.modes},
		{field:'humidity' ,title: TEXT.ENERGY_TEMP_AND_HUM, attributes: {"data-name": 'maxOccupancy' },sortable: false, width:120,format: "", template: Template.temp},
		{field: 'comfort_index',title: TEXT.SPACE_TEXT_COMFORT,attributes: {"data-name": 'maxOccupancy' },sortable: true, width:120,format: "", template: Template.comfort},
		{field: 'zone_id', title:TEXT.COMMON_BTN_DETAIL, attributes: {"data-name": '#: zone_id #' },sortable: false, width:120,format: "", template : '<span class="ic ic-info" data-event="devicedetail"></span>'}
	];


	/* popup 그리드 수정( 수정후 삭제) */
	/* 팝업 그리드 저장 */
	var popupGridFields = {
		"dms_device_name": { editable: false },
		"dms_device_type": { editable:false },
		"status": { editable:false },
		"operationMode": { editable:false },
		"Information": { editable:false },
		"algorithm": { editable:false }
	};
	var popupGridColumns = [//내부 데이터 설정
		{field:'dms_device_name' ,title: TEXT.COMMON_NAME,attributes: {"data-name": 'device_name'},width:100, format: "", sortable: false},
		{field:'dms_device_type' ,title: TEXT.ENERGY_TYPE,attributes: {"data-name": 'dms_device_type' },sortable: false, width:90,format: "", template : Template.deviceType},
		{field: 'status',title: TEXT.COMMON_STATUS,attributes: {"data-name": 'status' },sortable: false, width:70,format: "",template: Template.status},
		{field: 'operationMode',title: TEXT.ENERGY_MODE,attributes: {"data-name": 'operation-mode' },sortable: false, width:70,format: "", template: Template.operationMode},
		{field: 'Information' ,title: TEXT.ENERGY_INFORMATION, attributes: {"data-name": 'temperature' },sortable: false, width:100,format: "", template: Template.information},
		{	field: 'algorithm', title: TEXT.ENERGY_ALGORITHM, attributes: {"data-name": 'modes' },sortable: false, width:100,format: "", template : Template.algorithm}
	];

	return {
		totalSummaryFields : totalSummaryFields,
		totalSummaryColumns : totalSummaryColumns,
		allSummaryFloorFields : allSummaryFloorFields,
		allSummaryFloorColumns : allSummaryFloorColumns,

		popupGridFields : popupGridFields,
		popupGridColumns : popupGridColumns,
		messagDialog : identifyDialog,
		confirmDialog : energyDialog,
		Loading : Loading,
		Model : summaryModel
	};
});
