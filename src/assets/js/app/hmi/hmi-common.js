define("hmi/hmi-common", [], function(){

	var I18N = window.I18N, moment = window.moment;
	var ALARM_SOUND_PATH = "../../src/main/resources/static-dev/sound/Alarm_Sound.mp3";
	var Howl = window.Howl;
	var SoundPlayer = new Howl({ src : ALARM_SOUND_PATH, loop : true });

	var DEFAULT_EMPTY_TAB_PREFIX = 'empty-';
	var REFRESH_CONFIRM_HOURS = 0;
	var REFRESH_CONFIRM_TIMEOUT = 10000;
	var DEFAULT_CANVAS_WIDTH = 1686;
	var DEFAULT_CANVAS_HEIGHT = 971;
	var DEFAULT_GRID_WIDTH = 10;
	var DEFAULT_ZOOM_LEVEL = 100;
	var DEFAULT_INFO_ICON_SIZE = 20;
	var DEFAULT_MAX_ZOOM_LEVEL = 200;
	var DEFAULT_MIN_ZOOM_LEVEL = 25;
	var DEFAULT_ZOOM_FACTOR = 25;
	var MAX_TEMPLATE_SIZE = 4;
	var DEFAULT_CHART_WIDTH = 800;
	var DEFAULT_CHART_HEIGHT = 400;
	var DEFAULT_LIST_ITEM_HEIGHT = 42;
	var MAX_OPTIONS_SIZE = 20;
	var GRAPHIC_MIN_WIDTH = 10;
	var GRAPHIC_MIN_HEIGHT = 10;
	var DEFAULT_NODE_WIDTH = 50;
	var DEFAULT_NODE_HEIGHT = 50;
	var CURRENT_HMI_VERSION = "1.2";
	var INITIAL_HMI_VERSION = "1.0";

	var DEFAULT_DROPDOWN_MIN_WIDTH = 164;
	var DEFAULT_DROPDOWN_MIN_HEIGHT = 25;

	var DEFAULT_TEXT_MIN_WIDTH = 30;

	var DEFAULT_FONT_SIZE = 16;
	var DEFAULT_FONT_TYPE = "Arial";
	var DEFAULT_FONT_STYLE = "Normal";
	var DEFAULT_FONT_COLOR = "#000000";
	var DEFAULT_TEXT_FILL_COLOR = "";
	var DEFAULT_TEXT_STROKE = 1;
	var DEFAULT_TEXT_PADDING = 5;
	var DEFAULT_TEXT_LABEL_PADDING = 10;
	var DEFAULT_MIN_VALUE = -2147483648;
	var DEFAULT_MAX_VALUE = 2147483647;
	var DEFAULT_MIN = 0;
	var DEFAULT_MAX = 100;
	var DEFAULT_ALARM_MIN_VALUE = -1000;
	var DEFAULT_ALARM_MAX_VALUE = 1000;
	var DEFAULT_TEXT_MIN_VALUE = -2147483648;
	var DEFAULT_TEXT_MAX_VALUE = 2147483647;
	var DEFAULT_TEXT_H_ALIGN = "center";
	var DEFAULT_TEXT_V_ALIGN = "middle";

	var DEFAULT_PROGRESSBAR_WIDTH = 160;
	var DEFAULT_PROGRESSBAR_HEIGHT = 20;
	var DEFAULT_PROGRESSBAR_TEXT = "Percentage";
	var DEFAULT_PROGRESSBAR_COLOR = "#0000FF";
	var DEFAULT_PROGRESSBAR_DIRECTION = "horizontal";
	var DEFAULT_PROGRESSBAR_TEXT_LOCATION = "right";
	var DEFAULT_PROGRESSBAR_NO_TEXT = "empty";

	var DEFAULT_SCALEBAR_WIDTH = 120;
	var DEFAULT_SCALEBAR_HEIGHT = 20;
	var DEFAULT_SCALEBAR_SLIDER_HEIGHT = 20;
	var DEFAULT_SCALEBAR_SLIDER_WIDTH = 1;
	var DEFAULT_SCALEBAR_LEFT_ARROW_URL = "../../src/main/resources/static-dev/images/icon/ScaleBar/ScaleBar_Left_Arrow.png";
	var DEFAULT_SCALEBAR_RIGHT_ARROW_URL = "../../src/main/resources/static-dev/images/icon/ScaleBar/ScaleBar_Right_Arrow.png";
	var DEFAULT_SCALEBAR_ARROW_WIDTH = 45;
	var DEFAULT_SCALEBAR_ARROW_HEIGHT = 18;

	var DEFAULT_POWER_GRAPHIC_TEXTBOX_WIDTH = 200;
	var DEFAULT_POWER_GRAPHIC_TEXTBOX_HEIGHT = 220.6;
	var DEFAULT_POWER_GRAPHIC_IMAGE = "../../src/main/resources/static-dev/images/icon/Power/Power_TextBox.png";
	var DEFAULT_TEXT = "Text";

	var DEFAULT_RECT_GRAPHIC_WIDTH = 80;
	var DEFAULT_RECT_GRAPHIC_HEIGHT = 35;
	var DEFAULT_ROUND_BUTTON_SIZE = 40;

	var DEFAULT_CHART_MIN_VALUE = 0;
	var DEFAULT_CHART_MAX_VALUE = 9999999;

	var DEFAULT_INDOOR_WIDTH = 155;
	var DEFAULT_INDOOR_HEIGHT = 50;

	var DEFAULT_TEXT_MAX_LENGTH = 1000;
	var DEFAULT_TEXT_BOX_BUTTON_WIDTH = 70;
	var DEFAULT_TEXT_BOX_WITH_BUTTON_MIN_WIDTH = 120;
	var DEFAULT_TEXT_BOX_MARGIN = 10;
	var DEFAULT_TEXT_BOX_MIN_WIDTH = 40;

	var DEFAULT_CHART_X_AXIS_60 = {
		ticks : 1,
		tickStep : 1000,
		//tickFormat : 'f'
		tickFormat : function(v){
			var m = moment(v);
			return m.format("s");
		}
		//https://docs.python.org/2/library/string.html#formatspec
	};

	var DEFAULT_CHART_X_AXIS_60_MIN = $.extend({}, DEFAULT_CHART_X_AXIS_60, {
		tickStep : 60000,
		tickFormat : function(v){
			var m = moment(v);
			return m.format("HH:mm");
		}
	});

	var DEFAULT_CHART_X_AXIS_24 = $.extend({}, DEFAULT_CHART_X_AXIS_60, {
		ticks : 24,
		tickStep : 3600000,
		tickFormat : function(v){
			var m = moment(v);
			return m.format("H");
		}
	});

	var DEFAULT_CHART_Y_AXIS = {
		min : 0,
		max : 10,
		ticks : 10,
		tickStep : 10,
		tickFormat : '.1f'
		/*tickFormat : function(value){
			return joint.util.format.number('.2f', value);
		}*/
	};

	var CHART_MINUTES = {
		"ONE" : { value : 60000, min : 1},
		"FIVE" : { value : 300000, min : 5},
		"TEN" : { value : 600000, min : 10},
		"FIFTEEN" : { value : 900000, min : 15},
		"THIRTEEN" : { value : 1800000, min : 30}
	};

	var DEFAULT_CHECKBOX_PADDING = 30;
	var DEFAULT_CHECKBOX_WRAPPER_SIZE = 16;
	var DEFAULT_CHECKBOX_CHECK_SIZE = 8;

	var DEFAULT_CHECKBOX_OBJECT_WIDTH = 40;
	var DEFAULT_CHECKBOX_OBJECT_HEIGHT = 40;
	var DEFAULT_CHECKBOX_OBJECT_MIN_WIDTH = 40;
	var DEFAULT_CHECKBOX_OBJECT_MIN_HEIGHT = 40;

	var DEFAULT_RADIO_BUTTON_ITEM_WIDTH = 76;
	var DEFAULT_RADIO_BUTTON_ITEM_HEIGHT = 36;
	var DEFAULT_RADIO_BUTTON_ITEM_MARGIN = 15;

	var DEFAULT_RADIOBUTTON_WRAPPER_RADIUS = 10;
	var DEFAULT_RADIOBUTTON_RADIO_RADIUS = 3;

	var DEFAULT_COMBOBOX_BOX_WIDTH = 220;
	var DEFAULT_COMBOBOX_BOX_HEIGHT = 48;
	var DEFAULT_COMBOBOX_BUTTON_WIDTH = 16;
	var DEFAULT_COMBOBOX_BUTTON_HEIGHT = 12;
	var DEFAULT_COMBOBOX_BUTTON_PATH = "0,0 " + DEFAULT_COMBOBOX_BUTTON_WIDTH + ",0 " +
									(DEFAULT_COMBOBOX_BUTTON_WIDTH / 2) + "," + DEFAULT_COMBOBOX_BUTTON_HEIGHT;

	var DEFAULT_TABLE_ROW_HEIGHT = 32;
	var DEFAULT_TABLE_COLUMN_WIDTH = 100;

	var DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT = 30;

	var DEFAULT_ZONE_COLOR = '#0081c6';
	var DEFAULT_ZONE_COLOR_ALPHA = 0.1;
	var DEFAULT_ZONE_COLOR_ALPHA_SELECTED = 0.35;
	var DEFAULT_ZONE_NAME = 'New Zone';
	var DEFAULT_ZONE_WIDTH = 200;
	var DEFAULT_ZONE_HEIGHT = 140;

	var DEFAULT_STATISTICS_CARD_WIDTH = 304;
	var DEFAULT_STATISTICS_CARD_HEIGHT = 154;
	var DEFAULT_STATISTICS_CARD_WIDTH_RATIO = 0.90;
	var DEFAULT_STATISTICS_CARD_PIE_WIDTH_RATIO = 0.43;
	var DEFAULT_STATISTICS_CARD_PIE_HEIGHT_RATIO = 0.40;
	var DEFAULT_STATISTICS_COLOR_ON = '#2ea869';
	var DEFAULT_STATISTICS_COLOR_OFF = '#454545';
	var DEFAULT_STATISTICS_COLOR_CRITICAL = '#ee392f';
	var DEFAULT_STATISTICS_COLOR_WARNING = '#ffa41f';
	var DEFAULT_STATISTICS_TIMEOUT = 60000;

	var DEFAULT_LIBRARY_NO_IMAGE_URL = "../../src/main/resources/static-dev/images/icon/library-no-image.png";

	var DEFAULT_COOKIE_HMI_PATH = '/front/hmi';
	var DEFAULT_COOKIE_FILE_LIST_KEY = 'hmiFileListExpanded';
	var DEFAULT_COOKIE_CONTROL_PANEL_KEY = 'hmiControlPanelExpanded';

	var DEFAULT_FILL_COLOR = '#ffffff';
	var DEFAULT_STROKE_COLOR = '#000000';

	var DEFAULT_LABEL_MAX_LENGTH = 30;

	var COLOR_STR_TO_HEX = {
		"gray" : "#d4d3d4",
		"red" : "#ff0000",
		"blue" : "#1100ff",
		"green" : "#00ff00",
		"yellow" : "#feff00"
	};

	var IMAGE_FILE_MAX_SIZE = 10485760;
	var LIBRARY_IMAGE_FILE_MAX_SIZE = 1048576;

	var hasMappedTypes = ["Sensor.Temperature", "Sensor.Humidity"];

	var allValueType = [{ DI : "ControlPoint.DI"}, { DO : "ControlPoint.DO"}, { AI : "ControlPoint.AI"}, { AO : "ControlPoint.AO"}];
	var digitalType = [{DI : "ControlPoint.DI"}, {DO : "ControlPoint.DO"}];
	var analogType = [{ AI : "ControlPoint.AI"}, { AO : "ControlPoint.AO"}];

	var ControlPointValueAndStateMapping = {
	    "Blower":{state:{0: "stop", 1:"rotate"}, valueType:digitalType},	//DI
		"Coil":{state:{0: "off", 1:"on"}, valueType:digitalType},	//DI
		"Damper":{state:{0 : "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10"},valueType:analogType},	//AI
		"Pumps":{state:{0: "off",	1: "on"}, valueType:digitalType},	//DI
		"Pumps2":{state:{0 : "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10"},valueType:analogType},	//AI
		"Tank":{state:{0 : "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10"},valueType:analogType},	//AI
		"WaterTank":{state:{0 : "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10"},valueType:analogType},	//AI
		"Dimming":{state:{0 : "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10"},valueType:analogType},	//AI
		"Steam":{state:{0: "off",	1: "on"},valueType:digitalType},	//DI
		"Button":{state:{0: "off", 1: "on"},valueType:digitalType},	//DO
		"DIP":{state:{0: "off",1: "on"},valueType:digitalType},	//DO
		"LED":{state:{0: "off",1: "on"},valueType:digitalType},	//DI
		"Lever":{state:{0: "off",1: "on"},valueType:digitalType},	//DO
		"Toggle":{state:{0: "off",1: "on"},valueType:digitalType},	//DO
		"Selector":{state:{0: "off",1: "on"},valueType:digitalType},	//DO
		"CoolingTower":{state:{0: "stop", 1:"rotate"},valueType:digitalType},	//DI
		"Generator":{state:{0: "stop", 1:"rotate"},valueType:digitalType},	//DI
		"Scalebar":{valueType:analogType},	//AO
		"ProgressBar":{valueType:analogType},	//AI
		"Wind":{state:{0: "off", 1:"on"},valueType:digitalType},	//DI
		"Exhaust":{state:{0: "off", 1:"on"},valueType:digitalType},	//DI
		//Alarm은 AI/AO에 최소/최대값으로 알람 켜기 꺼기 표시함으로 off, on
		"Alarm":{state:{ digital : {0: "off", 1:"on"}, analog : {0: "off", 1:"on"}}, valueType:allValueType},	//DIAI
		"ExtLabel":{state:{ digital : {0: "off", 1:"on"}, analog : {0: "off", 1:"on"}}, valueType:allValueType},	//DIAI
		"Valve":{state:{ digital : {0: "off", 1:"on"}, analog : {0 : "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10"}},valueType:allValueType},	//DIAI
		"Radio Button":{valueType:analogType},	//AO
		"Gauge":{state:{0 : "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10"}, valueType:analogType},	//AI
		"Toggle Button": {valueType:analogType},	//AO
		"Combobox": {valueType:analogType},		//AO
		"CheckBox" : {valueType:digitalType},	//DI/DO
		"Text" : {valueType:analogType},	//AI/AO
		"Chart" : {valueType:analogType},	//AI
		"Default":{state:{0: "off", 1:"on"},valueType:digitalType},	//DO
		"Null":{state:{0: "off", 1: "on"}, valueType : digitalType},	//DO
		"Image" : {state:{0: "off", 1: "on"}, valueType : digitalType},
		"PowerGraphicImage" : {valueType : digitalType},
		"PowerGraphicText" : {valueType : digitalType},
		"RectangleGraphic" : {state:{0: "off",	1: "on"}, valueType : digitalType},
		"DigitalSensor" : {state:{0: "off",	1: "on"}, valueType : digitalType},
		"AnalogSensor" : {state:{0 : "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10"}, valueType:analogType},
		"basicImage" : {valueType : digitalType},
		"undefined" : {valueType:digitalType}	//AO
	};

	var fontTypeDataSource = [
		{ text : "Georgia", value : "Georgia" },
		{ text : "Palatino Linotype", value : "Palatino Linotype" },
		{ text : "Times New Roman", value : "Times New Roman" },
		{ text : "Arial", value : "Arial" },
		{ text : "Arial Black", value : "Arial Black" },
		{ text : "Comic Sans MS", value : "Comic Sans MS" },
		{ text : "Impact", value : "Impact" },
		{ text : "Lucida Sans Unicode", value : "Lucida Sans Unicode" },
		{ text : "Tahoma, Geneva", value : "Tahoma, Geneva" },
		{ text : "Trebuchet MS", value : "Trebuchet MS" },
		{ text : "Verdana", value : "Verdana" },
		{ text : "Courier New", value : "Courier New" },
		{ text : "Lucida Console", value : "Lucida Console" }
	];

	var fontSizeDataSource = [8, 9, 10, 12, 14, 16, 20, 24, 32, 40, 52, 64];

	var fontStyleDataSource = [
		{ text : I18N.prop("HMI_NORMAL"), value : "Normal"},
		{ text : I18N.prop("HMI_BOLD"), value : "Bold"},
		{ text : I18N.prop("HMI_ITALIC"), value : "Italic"}
	];

	var templatePoints = [
		"AHU_SA_TEMP",
		"AHU_SA_HUMI",
		"AHU_RA_TEMP",
		"AHU_RA_HUMI",
		"AHU_MA_TEMP",
		"AHU_SFAN_INVER_ST",
		"AHU_RFAN_INVER_ST",
		"AHU_COMP_ST",
		"AHU_SMOKE_AL",
		"AHU_FILTER_AL",
		"AHU_OA_DAMPER_CNTRL",
		"AHU_EA_DAMPER_CNTRL",
		"AHU_MA_DAMPER_CNTRL",
		"AHU_WATER"
	];

	var templatePointAddresses = {
		"AHU_SA_TEMP" : "BoardIO:AHU_SA_TEMP",
		"AHU_SA_HUMI" : "BoardIO:AHU_SA_HUMI",
		"AHU_RA_TEMP" : "BoardIO:AHU_RA_TEMP",
		"AHU_RA_HUMI" : "BoardIO:AHU_RA_HUMI",
		"AHU_MA_TEMP" : "BoardIO:AHU_MA_TEMP",
		"AHU_SFAN_INVER_ST"	: "BoardIO:AHU_SFAN_INVER_ST",
		"AHU_RFAN_INVER_ST" : "BoardIO:AHU_RFAN_INVER_ST",
		"AHU_COMP_ST" : "BoardIO:AHU_COMP_ST",
		"AHU_SMOKE_AL" : "Slot4:AHU_SMOKE_AL",
		"AHU_FILTER_AL" : "Slot4:AHU_FILTER_AL",
		"AHU_OA_DAMPER_CNTRL" : "Slot2:AHU_OA_DAMPER_CNTRL",
		"AHU_EA_DAMPER_CNTRL" :	"Slot2:AHU_EA_DAMPER_CNTRL",
		"AHU_MA_DAMPER_CNTRL" :	"Slot2:AHU_MA_DAMPER_CNTRL",
		"AHU_WATER" : "BoardIO:AHU_WATER"
	};

	function getAllUnCheckedDataPointsMapForSeach (searchTextValueWithSeparator){
		var dataPointMapAfterSeach = {};
		var allDataPoints = templatePoints;
		var dataPointsLength = allDataPoints.length;
		var allAddressMap = templatePointAddresses;
		for(var i = 0; i < dataPointsLength; i++){
			dataPointMapAfterSeach[allAddressMap[allDataPoints[i]] + searchTextValueWithSeparator] = "0";
		}
		return dataPointMapAfterSeach;
	}

	var toastPopup = $('#hmi-toast-popup').kendoCommonToastPopup({}).data('kendoCommonToastPopup');

	//선 Dash 설정
	var lineDashArrayDataSource = [
		{ id : 1, text : I18N.prop("HMI_LINE_DEFAULT"), value : "0", image : "../../src/main/resources/static-dev/images/icon/graphic/linetype-01.png" },
		{ id : 2, text : I18N.prop("HMI_LINE_DOT"), value : "3", image : "../../src/main/resources/static-dev/images/icon/graphic/linetype-02.png" },
		{ id : 3, text : I18N.prop("HMI_LINE_NORMAL_DASH"), value : "10, 5", image : "../../src/main/resources/static-dev/images/icon/graphic/linetype-04.png" },
		{ id : 4, text : I18N.prop("HMI_LINE_LONG_DASH"), value : "20, 5", image : "../../src/main/resources/static-dev/images/icon/graphic/linetype-06.png" },
		{ id : 5, text : I18N.prop("HMI_LINE_DASH_DOT"), value : "20, 5, 5, 5", image : "../../src/main/resources/static-dev/images/icon/graphic/linetype-07.png" },
		{ id : 6, text : I18N.prop("HMI_LINE_DASH_DOT_DOT"), value : "20, 5, 5, 5, 5, 5", image : "../../src/main/resources/static-dev/images/icon/graphic/linetype-08.png" }
	];

	var getEllipseMarkerPoint = function(){
		var points = [];
		var angle;
		var x, y;
		var i;
		for (i = 0; i < 19; i++) {
			angle = i * 20 * Math.PI / 180;
			x = 5 * Math.cos(angle) + 5;
			y = 5 * Math.sin(angle);
			points.push(x + ',' + y);
		}
		return points.join(' ');
	};

	//선 Marker 설정
	var lineMarkerDataSource = [
		{ id : 1, text : I18N.prop("HMI_ARROW_DEFAULT"), value : "0,0", fill : "transparent",
			image : "../../src/main/resources/static-dev/images/icon/graphic/arrowtype-01.png"},
		{ id : 2, text : I18N.prop("HMI_ARROW_OPEN_ARROW"), value : "10,-5 0,0 10,5", fill : "transparent",
			image : "../../src/main/resources/static-dev/images/icon/graphic/arrowtype-03.png"},
		{ id : 3, text : I18N.prop("HMI_ARROW_ARROW"), value : "10,-5 0,0 10,5 10,-5", fill : "#000",
			image : "../../src/main/resources/static-dev/images/icon/graphic/arrowtype-06.png"},
		{ id : 4, text : I18N.prop("HMI_ARROW_ELLIPSE_ARROW"), value : getEllipseMarkerPoint(), fill : "#000",
			image : "../../src/main/resources/static-dev/images/icon/graphic/arrowtype-08.png"}
	];

	//선 굵기
	var lineWidthDataSource = [{ id : 0.25, name : "0.25pt", lineHeight:1, selected:false }, { id : 0.5, name : "0.5pt", lineHeight : 2, selected:false}, { id : 0.75, name : "0.75pt", lineHeight : 3, selected:false},
							   { id : 1, name : "1pt", lineHeight:4, selected:false}, { id : 1.5, name : "1.5pt", lineHeight:5, selected:false}, { id : 2.25, name : "2.25pt", lineHeight:7, selected:false}, { id : 3, name : "3pt", lineHeight:9, selected:false},
							   { id : 4.5, name : "4.5pt", lineHeight:12, selected:false}, { id : 5, name : "5pt", lineHeight:14, selected:false}, { id : 6, name : "6pt", lineHeight:18, selected:false}];


	var HmiCommon = {
		DEFAULT_EMPTY_TAB_PREFIX : DEFAULT_EMPTY_TAB_PREFIX,
		REFRESH_CONFIRM_HOURS : REFRESH_CONFIRM_HOURS,
		REFRESH_CONFIRM_TIMEOUT : REFRESH_CONFIRM_TIMEOUT,
		DEFAULT_FONT_SIZE : DEFAULT_FONT_SIZE,
		DEFAULT_CANVAS_WIDTH : DEFAULT_CANVAS_WIDTH,
		DEFAULT_CANVAS_HEIGHT : DEFAULT_CANVAS_HEIGHT,
		GRAPHIC_MIN_WIDTH : GRAPHIC_MIN_WIDTH,
		GRAPHIC_MIN_HEIGHT :GRAPHIC_MIN_HEIGHT,
		DEFAULT_INFO_ICON_SIZE : DEFAULT_INFO_ICON_SIZE,
		DEFAULT_GRID_WIDTH : DEFAULT_GRID_WIDTH,
		DEFAULT_ZOOM_LEVEL : DEFAULT_ZOOM_LEVEL,
		DEFAULT_MAX_ZOOM_LEVEL : DEFAULT_MAX_ZOOM_LEVEL,
		DEFAULT_MIN_ZOOM_LEVEL : DEFAULT_MIN_ZOOM_LEVEL,
		DEFAULT_ZOOM_FACTOR : DEFAULT_ZOOM_FACTOR,
		MAX_TEMPLATE_SIZE : MAX_TEMPLATE_SIZE,
		DEFAULT_CHART_WIDTH : DEFAULT_CHART_WIDTH,
		DEFAULT_CHART_HEIGHT : DEFAULT_CHART_HEIGHT,
		DEFAULT_CHART_Y_AXIS : DEFAULT_CHART_Y_AXIS,
		DEFAULT_CHART_X_AXIS_24 : DEFAULT_CHART_X_AXIS_24,
		DEFAULT_CHART_X_AXIS_60 : DEFAULT_CHART_X_AXIS_60,
		DEFAULT_CHART_X_AXIS_60_MIN : DEFAULT_CHART_X_AXIS_60_MIN,
		CHART_MINUTES : CHART_MINUTES,
		DEFAULT_LIST_ITEM_HEIGHT : DEFAULT_LIST_ITEM_HEIGHT,
		MAX_OPTIONS_SIZE : MAX_OPTIONS_SIZE,
		DEFAULT_NODE_WIDTH : DEFAULT_NODE_WIDTH,
		DEFAULT_NODE_HEIGHT : DEFAULT_NODE_HEIGHT,
		CURRENT_HMI_VERSION : CURRENT_HMI_VERSION,
		INITIAL_HMI_VERSION : INITIAL_HMI_VERSION,
		DEFAULT_FONT_STYLE : DEFAULT_FONT_STYLE,
		DEFAULT_FONT_TYPE : DEFAULT_FONT_TYPE,
		DEFAULT_FONT_COLOR : DEFAULT_FONT_COLOR,
		DEFAULT_TEXT_FILL_COLOR : DEFAULT_TEXT_FILL_COLOR,
		DEFAULT_TEXT_PADDING : DEFAULT_TEXT_PADDING,
		DEFAULT_TEXT_LABEL_PADDING : DEFAULT_TEXT_LABEL_PADDING,
		DEFAULT_TEXT_STROKE : DEFAULT_TEXT_STROKE,
		DEFAULT_MIN_VALUE : DEFAULT_MIN_VALUE,
		DEFAULT_MAX_VALUE : DEFAULT_MAX_VALUE,
		DEFAULT_MIN : DEFAULT_MIN,
		DEFAULT_MAX : DEFAULT_MAX,
		DEFAULT_ALARM_MIN_VALUE : DEFAULT_ALARM_MIN_VALUE,
		DEFAULT_ALARM_MAX_VALUE : DEFAULT_ALARM_MAX_VALUE,
		DEFAULT_TEXT_MIN_VALUE : DEFAULT_TEXT_MIN_VALUE,
		DEFAULT_TEXT_MAX_VALUE : DEFAULT_TEXT_MAX_VALUE,
		DEFAULT_TEXT_MIN_WIDTH : DEFAULT_TEXT_MIN_WIDTH,
		DEFAULT_TEXT_H_ALIGN : DEFAULT_TEXT_H_ALIGN,
		DEFAULT_TEXT_V_ALIGN : DEFAULT_TEXT_V_ALIGN,
		DEFAULT_DROPDOWN_MIN_WIDTH : DEFAULT_DROPDOWN_MIN_WIDTH,
		DEFAULT_DROPDOWN_MIN_HEIGHT : DEFAULT_DROPDOWN_MIN_HEIGHT,
		DEFAULT_PROGRESSBAR_WIDTH : DEFAULT_PROGRESSBAR_WIDTH,
		DEFAULT_PROGRESSBAR_HEIGHT : DEFAULT_PROGRESSBAR_HEIGHT,
		DEFAULT_PROGRESSBAR_TEXT : DEFAULT_PROGRESSBAR_TEXT,
		DEFAULT_PROGRESSBAR_COLOR : DEFAULT_PROGRESSBAR_COLOR,
		DEFAULT_PROGRESSBAR_DIRECTION : DEFAULT_PROGRESSBAR_DIRECTION,
		DEFAULT_PROGRESSBAR_TEXT_LOCATION : DEFAULT_PROGRESSBAR_TEXT_LOCATION,
		DEFAULT_PROGRESSBAR_NO_TEXT : DEFAULT_PROGRESSBAR_NO_TEXT,
		DEFAULT_SCALEBAR_WIDTH : DEFAULT_SCALEBAR_WIDTH,
		DEFAULT_SCALEBAR_HEIGHT : DEFAULT_SCALEBAR_HEIGHT,
		DEFAULT_SCALEBAR_SLIDER_WIDTH : DEFAULT_SCALEBAR_SLIDER_WIDTH,
		DEFAULT_SCALEBAR_SLIDER_HEIGHT : DEFAULT_SCALEBAR_SLIDER_HEIGHT,
		DEFAULT_SCALEBAR_LEFT_ARROW_URL : DEFAULT_SCALEBAR_LEFT_ARROW_URL,
		DEFAULT_SCALEBAR_RIGHT_ARROW_URL : DEFAULT_SCALEBAR_RIGHT_ARROW_URL,
		DEFAULT_SCALEBAR_ARROW_WIDTH : DEFAULT_SCALEBAR_ARROW_WIDTH,
		DEFAULT_SCALEBAR_ARROW_HEIGHT : DEFAULT_SCALEBAR_ARROW_HEIGHT,
		DEFAULT_POWER_GRAPHIC_TEXTBOX_WIDTH : DEFAULT_POWER_GRAPHIC_TEXTBOX_WIDTH,
		DEFAULT_POWER_GRAPHIC_TEXTBOX_HEIGHT : DEFAULT_POWER_GRAPHIC_TEXTBOX_HEIGHT,
		DEFAULT_POWER_GRAPHIC_IMAGE : DEFAULT_POWER_GRAPHIC_IMAGE,
		DEFAULT_TEXT : DEFAULT_TEXT,
		DEFAULT_RECT_GRAPHIC_WIDTH : DEFAULT_RECT_GRAPHIC_WIDTH,
		DEFAULT_RECT_GRAPHIC_HEIGHT : DEFAULT_RECT_GRAPHIC_HEIGHT,
		DEFAULT_ROUND_BUTTON_SIZE : DEFAULT_ROUND_BUTTON_SIZE,
		DEFAULT_CHART_MIN_VALUE : DEFAULT_CHART_MIN_VALUE,
		DEFAULT_CHART_MAX_VALUE : DEFAULT_CHART_MAX_VALUE,
		DEFAULT_CHECKBOX_PADDING : DEFAULT_CHECKBOX_PADDING,
		DEFAULT_CHECKBOX_CHECK_SIZE : DEFAULT_CHECKBOX_CHECK_SIZE,
		DEFAULT_CHECKBOX_WRAPPER_SIZE : DEFAULT_CHECKBOX_WRAPPER_SIZE,
		DEFAULT_RADIO_BUTTON_ITEM_WIDTH : DEFAULT_RADIO_BUTTON_ITEM_WIDTH,
		DEFAULT_RADIO_BUTTON_ITEM_HEIGHT : DEFAULT_RADIO_BUTTON_ITEM_HEIGHT,
		DEFAULT_RADIO_BUTTON_ITEM_MARGIN : DEFAULT_RADIO_BUTTON_ITEM_MARGIN,
		DEFAULT_CHECKBOX_OBJECT_WIDTH : DEFAULT_CHECKBOX_OBJECT_WIDTH,
		DEFAULT_CHECKBOX_OBJECT_HEIGHT : DEFAULT_CHECKBOX_OBJECT_HEIGHT,
		DEFAULT_CHECKBOX_OBJECT_MIN_WIDTH : DEFAULT_CHECKBOX_OBJECT_MIN_WIDTH,
		DEFAULT_CHECKBOX_OBJECT_MIN_HEIGHT : DEFAULT_CHECKBOX_OBJECT_MIN_HEIGHT,
		DEFAULT_RADIOBUTTON_WRAPPER_RADIUS : DEFAULT_RADIOBUTTON_WRAPPER_RADIUS,
		DEFAULT_RADIOBUTTON_RADIO_RADIUS : DEFAULT_RADIOBUTTON_RADIO_RADIUS,
		DEFAULT_COMBOBOX_BOX_WIDTH : DEFAULT_COMBOBOX_BOX_WIDTH,
		DEFAULT_COMBOBOX_BOX_HEIGHT : DEFAULT_COMBOBOX_BOX_HEIGHT,
		DEFAULT_COMBOBOX_BUTTON_WIDTH : DEFAULT_COMBOBOX_BUTTON_WIDTH,
		DEFAULT_COMBOBOX_BUTTON_HEIGHT : DEFAULT_COMBOBOX_BUTTON_HEIGHT,
		DEFAULT_COMBOBOX_BUTTON_PATH : DEFAULT_COMBOBOX_BUTTON_PATH,
		DEFAULT_TABLE_ROW_HEIGHT : DEFAULT_TABLE_ROW_HEIGHT,
		DEFAULT_TABLE_COLUMN_WIDTH : DEFAULT_TABLE_COLUMN_WIDTH,
		DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT : DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT,
		DEFAULT_ZONE_COLOR : DEFAULT_ZONE_COLOR,
		DEFAULT_ZONE_COLOR_ALPHA : DEFAULT_ZONE_COLOR_ALPHA,
		DEFAULT_ZONE_COLOR_ALPHA_SELECTED : DEFAULT_ZONE_COLOR_ALPHA_SELECTED,
		DEFAULT_ZONE_NAME : DEFAULT_ZONE_NAME,
		DEFAULT_ZONE_WIDTH : DEFAULT_ZONE_WIDTH,
		DEFAULT_ZONE_HEIGHT : DEFAULT_ZONE_HEIGHT,
		DEFAULT_STATISTICS_CARD_WIDTH : DEFAULT_STATISTICS_CARD_WIDTH,
		DEFAULT_STATISTICS_CARD_HEIGHT : DEFAULT_STATISTICS_CARD_HEIGHT,
		DEFAULT_STATISTICS_CARD_WIDTH_RATIO : DEFAULT_STATISTICS_CARD_WIDTH_RATIO,
		DEFAULT_STATISTICS_CARD_PIE_WIDTH_RATIO : DEFAULT_STATISTICS_CARD_PIE_WIDTH_RATIO,
		DEFAULT_STATISTICS_CARD_PIE_HEIGHT_RATIO : DEFAULT_STATISTICS_CARD_PIE_HEIGHT_RATIO,
		DEFAULT_STATISTICS_COLOR_ON : DEFAULT_STATISTICS_COLOR_ON,
		DEFAULT_STATISTICS_COLOR_OFF : DEFAULT_STATISTICS_COLOR_OFF,
		DEFAULT_STATISTICS_COLOR_CRITICAL : DEFAULT_STATISTICS_COLOR_CRITICAL,
		DEFAULT_STATISTICS_COLOR_WARNING : DEFAULT_STATISTICS_COLOR_WARNING,
		DEFAULT_STATISTICS_TIMEOUT : DEFAULT_STATISTICS_TIMEOUT,
		DEFAULT_LIBRARY_NO_IMAGE_URL : DEFAULT_LIBRARY_NO_IMAGE_URL,
		DEFAULT_INDOOR_WIDTH : DEFAULT_INDOOR_WIDTH,
		DEFAULT_INDOOR_HEIGHT : DEFAULT_INDOOR_HEIGHT,
		DEFAULT_TEXT_MAX_LENGTH : DEFAULT_TEXT_MAX_LENGTH,
		DEFAULT_TEXT_BOX_BUTTON_WIDTH : DEFAULT_TEXT_BOX_BUTTON_WIDTH,
		DEFAULT_TEXT_BOX_WITH_BUTTON_MIN_WIDTH : DEFAULT_TEXT_BOX_WITH_BUTTON_MIN_WIDTH,
		DEFAULT_TEXT_BOX_MIN_WIDTH : DEFAULT_TEXT_BOX_MIN_WIDTH,
		DEFAULT_TEXT_BOX_MARGIN : DEFAULT_TEXT_BOX_MARGIN,
		DEFAULT_COOKIE_HMI_PATH : DEFAULT_COOKIE_HMI_PATH,
		DEFAULT_COOKIE_FILE_LIST_KEY : DEFAULT_COOKIE_FILE_LIST_KEY,
		DEFAULT_COOKIE_CONTROL_PANEL_KEY : DEFAULT_COOKIE_CONTROL_PANEL_KEY,
		DEFAULT_FILL_COLOR : DEFAULT_FILL_COLOR,
		DEFAULT_STROKE_COLOR : DEFAULT_STROKE_COLOR,
		DEFAULT_LABEL_MAX_LENGTH : DEFAULT_LABEL_MAX_LENGTH,
		COLOR_STR_TO_HEX : COLOR_STR_TO_HEX,
		IMAGE_FILE_MAX_SIZE : IMAGE_FILE_MAX_SIZE,
		LIBRARY_IMAGE_FILE_MAX_SIZE : LIBRARY_IMAGE_FILE_MAX_SIZE,
		fontTypeDataSource : fontTypeDataSource,
		fontStyleDataSource : fontStyleDataSource,
		fontSizeDataSource : fontSizeDataSource,
		ControlPointValueAndStateMapping : ControlPointValueAndStateMapping,
		templatePoints : templatePoints,
		templatePointAddresses : templatePointAddresses,
		getAllUnCheckedDataPointsMapForSeach : getAllUnCheckedDataPointsMapForSeach,
		SoundPlayer : SoundPlayer,
		hasMappedTypes : hasMappedTypes,
		toastPopup : toastPopup,
		lineDashArrayDataSource : lineDashArrayDataSource,
		lineMarkerDataSource : lineMarkerDataSource,
		lineWidthDataSource : lineWidthDataSource
	};

	window.HmiCommon = HmiCommon;

	return HmiCommon;
});
//# sourceURL=hmi/hmi-common.js
