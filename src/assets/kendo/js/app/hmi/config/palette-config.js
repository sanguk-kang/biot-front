define("hmi/config/palette-config", ["hmi/hmi-common", "hmi/hmi-util"], function(HmiCommon, HmiUtil){
	"use strict";

	var kendo = window.kendo;
	var I18N = window.I18N;
	var Util = window.Util;
	var STATIC_ICON_URL = "../../src/main/resources/static-dev/images/icon/";
	var LEGACY_STATIC_ICON_URL = "../../src/main/resources/static-dev/front/images/icon/";	//v1.0 이미지 리소스 경로


	var getIconUrl = function(url, isLegacy){
		if(isLegacy) return LEGACY_STATIC_ICON_URL + url;
		return STATIC_ICON_URL + url;
	};

	var createLevelImages = function(colors, urlPrefix, start, end){
		var obj = {};
		var color, i, j, max = colors.length;
		for( i = 0; i < max; i++ ){
			color = colors[i];
			for( j = start; j <= end; j++ ){
				obj[color.toLowerCase() + "_" + j] = getIconUrl(urlPrefix + color + j) + ".png";
			}
		}
		return obj;
	};

	var MAX_IMAGE_SIZE = 11;

	function getLevelColorImages(colors, imageString, mappedValue, levelFormat){
		var color, colorKey, level, imageUrl, i, j, max = colors.length;
		var obj = {};

		for( i = 0; i < max; i++ ){
			color = colors[i];
			//Object 참조 키 Color 값
			colorKey = color.toLowerCase();
			if(colorKey == "grey" || color == "N") colorKey = "gray";
			else if(color == "G") colorKey = "green";
			else if(color == "N") colorKey = "gray";
			else if(color == "R") colorKey = "red";
			else if(color == "Y") colorKey = "yellow";
			else if(color == "B") colorKey = "blue";

			for( j = 0; j < MAX_IMAGE_SIZE; j++ ){
				if(mappedValue && typeof mappedValue[j] !== "undefined") level = mappedValue[j];
				else level = j;

				if(levelFormat) level = kendo.toString(level, levelFormat);

				imageUrl = imageString.replace("{level}", level).replace("{color}", color);
				obj[colorKey + "_" + j] = getIconUrl(imageUrl);
			}
		}

		return obj;
	}

	function getStateColorImages(colors, imageString, states){
		var color, colorKey, state, stateKey, imageUrl, i, j, max = colors.length, size = states.length;
		var obj = {};
		for( i = 0; i < max; i++ ){
			color = colors[i];
			colorKey = color.toLowerCase();
			if(colorKey == "grey" || color == "N") colorKey = "gray";
			else if(color == "G") colorKey = "green";
			else if(color == "N") colorKey = "gray";
			else if(color == "R") colorKey = "red";
			else if(color == "Y") colorKey = "yellow";
			else if(color == "B") colorKey = "blue";

			for( j = 0; j < size; j++ ){
				state = states[j];
				imageUrl = imageString.replace("{state}", state).replace("{color}", color);
				stateKey = state.toLowerCase();
				obj[colorKey + "_" + stateKey] = getIconUrl(imageUrl);
			}
		}

		return obj;
	}

	var circlePumpImages = {
		gray_on : getIconUrl("Pump/CirclePump_Gray1_ani.gif"),
		red_on : getIconUrl("Pump/CirclePump_Red1_ani.gif"), red_off : getIconUrl("Pump/CirclePump_Red1.png"),
		blue_on : getIconUrl("Pump/CirclePump_Blue1_ani.gif"), blue_off : getIconUrl("Pump/CirclePump_Blue1.png"),
		green_on : getIconUrl("Pump/CirclePump_Green1_ani.gif"), green_off : getIconUrl("Pump/CirclePump_Green.png"),
		yellow_on : getIconUrl("Pump/CirclePump_Yellow1_ani.gif"), yellow_off : getIconUrl("Pump/CirclePump_Yellow.png")
	};
	var crossPumpImages = {
		gray_on : getIconUrl("Pump/CrossPump_ani.gif"),
		red_on : getIconUrl("Pump/CrossPump_Red1_ani.gif"), red_off : getIconUrl("Pump/CrossPump_Red1.png"),
		blue_on : getIconUrl("Pump/CrossPump_Blue1_ani.gif"), blue_off : getIconUrl("Pump/CrossPump_Blue1.png"),
		green_on : getIconUrl("Pump/CrossPump_ani_Green.gif"), green_off : getIconUrl("Pump/CrossPump_Green.png"),
		yellow_on : getIconUrl("Pump/CrossPump_ani_Yellow.gif"), yellow_off : getIconUrl("Pump/CrossPump_Yellow.png")
	};

	var damperHImages = getLevelColorImages(["Grey", "Red", "Blue", "Green", "Yellow"],
		"Damper/Damper_H{level}_{color}.png", { 0 : 1, 1 : 1, 2 : 1, 3 : 1, 4 : 1, 5 : 2, 6 : 2, 7 : 2, 8 : 2, 9 : 2, 10 : 3 });
	var damperVImages = getLevelColorImages(["Grey", "Red", "Blue", "Green", "Yellow"],
		"Damper/Damper_V{level}_{color}.png", { 0 : 1, 1 : 1, 2 : 1, 3 : 1, 4 : 1, 5 : 2, 6 : 2, 7 : 2, 8 : 2, 9 : 2, 10 : 3 });
	var pumpImages = getLevelColorImages(["Gray", "Red", "Blue", "Green", "Yellow"],
		"Pump/Pump_{color}{level}.png", { 0 : 1, 1 : 1, 2 : 1, 3 : 1, 4 : 1, 5 : 2, 6 : 2, 7 : 2, 8 : 2, 9 : 2, 10 : 3 });
	var temperatureSensorImages = getLevelColorImages(["gray", "red", "blue", "green", "yellow"],
		"dvc630/dvc630-tempsensor-{color}-on{level}.png", { 0 : 1, 1 : 2, 2 : 3, 3 : 4, 4 : 5, 5 : 6, 6 : 7, 7 : 8, 8 : 9, 9 : 10, 10 : 11 }, "00");
	var humiditySensorImages = getLevelColorImages(["gray", "red", "blue", "green", "yellow"],
		"dvc630/dvc630-humsensor-{color}-on{level}.png", { 0 : 1, 1 : 2, 2 : 3, 3 : 4, 4 : 5, 5 : 6, 6 : 7, 7 : 8, 8 : 9, 9 : 10, 10 : 11 }, "00");
	var motionSensorImages = getStateColorImages(["gray", "red", "blue", "green", "yellow"],
		"dvc630/dvc630-motionsensor-{color}-{state}.png", ["on", "off"]);
	var doorSensorImages = getStateColorImages(["gray", "red", "blue", "green", "yellow"],
		"dvc630/dvc630-doorsensor-{color}-{state}.png", ["on", "off"]);
	var valveImages = getLevelColorImages(["N", "R", "B", "G", "Y"],
		"Valve/Valve_{color}_{level}.png", { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 10 : 10 }, "00");
	valveImages = $.extend(valveImages, getStateColorImages(["N", "R", "B", "G", "Y"], "Valve/Valve_{color}_{state}.png", ["ON", "OFF"]));
	var roundValveImages = getLevelColorImages(["N", "R", "B", "G", "Y"],
		"Valve/Valve_Circle_{color}_{level}.png", { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 10 : 10 }, "00");
	roundValveImages = $.extend(roundValveImages, getStateColorImages(["N", "R", "B", "G", "Y"], "Valve/Valve_Circle_{color}_{state}.png", ["ON", "OFF"]));
	var elecValveImages = getLevelColorImages(["N", "R", "B", "G", "Y"],
		"Valve/Valve_Elec_{color}_{level}.png", { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 10 : 10 }, "00");
	elecValveImages = $.extend(elecValveImages, getStateColorImages(["N", "R", "B", "G", "Y"], "Valve/Valve_Elec_{color}_{state}.png", ["ON", "OFF"]));

	var meterImages = getLevelColorImages(["N", "R", "B", "G", "Y"],
		"Meter_{color}_{level}.png", { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 10 : 10 }, "00");
	var gaugeImages = getLevelColorImages(["N", "R", "B", "G", "Y"],
		"Guage_{color}_{level}.png", { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 10 : 10 }, "00");
	var tankImages = createLevelImages(["Gray", "Red", "Blue", "Green", "Yellow"], "Tank/Tank_", 0, 10);
	var waterTankImages = createLevelImages(["Gray", "Red", "Blue", "Green", "Yellow"], "WaterTank/WaterTank_", 0, 10);

	var fluLampImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Light_Fluorescent_{color}_{state}.png", ["ON", "OFF"]);
	var fluLampDimImages = getLevelColorImages(["N", "R", "B", "G", "Y"],
		"Power/Light_Fluorescent_{color}_{level}.png", { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 10 : 10 }, "00");
	var outdoorLampImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Light_Outdoor_{color}_{state}.png", ["ON", "OFF"]);
	var outdoorLampDimImages = getLevelColorImages(["N", "R", "B", "G", "Y"],
		"Power/Light_Outdoor_{color}_{level}.png", { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 10 : 10 }, "00");
	var incandescentLampImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Light_Incandescent_{color}_{state}.png", ["ON", "OFF"]);
	var incandescentLampDimImages = getLevelColorImages(["N", "R", "B", "G", "Y"],
		"Power/Light_Incandescent_{color}_{level}.png", { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 10 : 10 }, "00");
	var acbImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/ACB_{color}_{state}.png", ["ON", "OFF"]);
	var altsImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/ALTS_{color}_{state}.png", ["ON", "OFF"]);
	var cbImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/CB_{color}_{state}.png", ["ON", "OFF"]);
	var condenserImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Condenser_{color}_{state}.png", ["ON", "OFF"]);
	var descriptionImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Description_{color}_{state}.png", ["ON", "OFF"]);
	var groundImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Ground_{color}_{state}.png", ["ON", "OFF"]);
	var lbsImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/LBS_{color}_{state}.png", ["ON", "OFF"]);
	var mccbImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/MCCB_{color}_{state}.png", ["ON", "OFF"]);
	var switchImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Switch_{color}_{state}.png", ["ON", "OFF"]);
	var transformerImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Transformer_{color}_{state}.png", ["ON", "OFF"]);
	var transformer2Images = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/Transformer1_{color}_{state}.png", ["ON", "OFF"]);
	var vcbImages = getStateColorImages(["N", "R", "B", "G", "Y"], "Power/VCB_{color}_{state}.png", ["ON", "OFF"]);

	var paletteDataSource = [
		{
			text : I18N.prop("HMI_BASIC_GRAPHIC"),
			groupName : "basicShape",
			items : [
				{ value : "HMI_TEXT", text : I18N.prop("HMI_TEXT"),imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-tri.png"), className : "Text", categoryName : "Null", clickable : true  },
				{ value : "HMI_TRAPEZOID", text : I18N.prop("HMI_TRAPEZOID"),imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-tri.png"), className : "Trapezoid", categoryName : "Null", clickable : true  },
				{ value : "HMI_STRAIGHT", text : I18N.prop("HMI_STRAIGHT"),imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-tri.png"), className : "Straight", categoryName : "Null", clickable : true  },
				{ value : "HMI_POLY_LINE", text : I18N.prop("HMI_POLY_LINE"), imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-polyline.png"), className : "Line", categoryName : "Null", clickable : true },
				{ value : "HMI_CURVE", text : I18N.prop("HMI_CURVE"), imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-curve.png"), className : "Curve", categoryName : "Text", clickable : true },
				{ value : "HMI_RECTANGLE", text : I18N.prop("HMI_RECTANGLE"), imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-rect.png"), className : "Rectangle", categoryName : "Null", clickable : true  },
				{ value : "HMI_ROUNDED_RECTANGLE", text : I18N.prop("HMI_ROUNDED_RECTANGLE"), imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-rounded.png"), className : "RoundRectangle", categoryName : "Null", clickable : true  },
				{ value : "HMI_PARALLELOGRAM", text : I18N.prop("HMI_PARALLELOGRAM"), imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-parallelogram.png"), className : "Parallelogram", categoryName : "Null", clickable : true  },
				{ value : "HMI_ELLIPSE", text : I18N.prop("HMI_ELLIPSE"), imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-ellp.png"), className : "Circle", categoryName : "Null", clickable : true  },
				{ value : "HMI_TRIANGLE", text : I18N.prop("HMI_TRIANGLE"),imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-tri.png"), className : "Triangle", categoryName : "Null", clickable : true  },
				{ value : "HMI_IMAGE", text : I18N.prop("HMI_IMAGE"),imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-img.png"), className : "ImportImage", categoryName : "basicImage" },
				{ value : "HMI_TABLE", text : I18N.prop("HMI_TABLE"),imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-table.png"), className : "Table", categoryName : "Null", clickable : true  },
				{ value : "HMI_LINK", text : I18N.prop("HMI_HYPER_LINK"),imageUrl : getIconUrl("tools/toolbar/tool-basic-link-nor.png"), className : "HyperLink", categoryName : "Null", clickable : true },
				{ value : "SPACE_ZONE", text : I18N.prop("SPACE_ZONE"), imageUrl : getIconUrl("tools/toolbar/ic-tool-graphic-rect.png"), className : "Zone", categoryName : "Null", clickable : true }
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_CONTROLS"),
			groupName : "controlGraphic",
			items : [
				{ value : "HMI_BUTTON", text : I18N.prop("HMI_BUTTON"),imageUrl : getIconUrl("Led/LED_Circle_Gray.png"), categoryName : "RectangleGraphic", className : "RoundButton" }, ///
				{ value : "HMI_RECT_BUTTON", text : I18N.prop("HMI_RECT_BUTTON"),imageUrl : getIconUrl("Button/Button_Rect_Gray.png"), categoryName : "RectangleGraphic", className : "RectangleButton"}, ///
				{ value : "HMI_DIP_H_OFF", text : I18N.prop("HMI_DIP_H_OFF"), imageUrl : getIconUrl("Dip/Dip_H_Off.png"), categoryName : "DIP", className : "Button", images : {
					gray_on : getIconUrl("Dip/Dip_H_On.png"),
					red_off : getIconUrl("Dip/Dip_H_Off_Red.png"), red_on : getIconUrl("Dip/Dip_H_On_Red.png"),
					blue_off : getIconUrl("Dip/Dip_H_Off_Blue.png"), blue_on : getIconUrl("Dip/Dip_H_On_Blue.png"),
					green_off : getIconUrl("Dip/Dip_H_Off_Green.png"), green_on : getIconUrl("Dip/Dip_H_On_Green.png"),
					yellow_off : getIconUrl("Dip/Dip_H_Off_Yellow.png"), yellow_on : getIconUrl("Dip/Dip_H_On_Yellow.png")
				}},
				{ value : "HMI_DIP_V_OFF", text : I18N.prop("HMI_DIP_V_OFF"), imageUrl : getIconUrl("Dip/Dip_V_Off.png"), categoryName : "DIP", className : "Button", images : {
					gray_on : getIconUrl("Dip/Dip_V_On.png"),
					red_off : getIconUrl("Dip/Dip_V_Off_Red.png"), red_on : getIconUrl("Dip/Dip_V_On_Red.png"),
					blue_off : getIconUrl("Dip/Dip_V_Off_Blue.png"), blue_on : getIconUrl("Dip/Dip_V_On_Blue.png"),
					green_off : getIconUrl("Dip/Dip_V_Off_Green.png"), green_on : getIconUrl("Dip/Dip_V_On_Green.png"),
					yellow_off : getIconUrl("Dip/Dip_V_Off_Yellow.png"), yellow_on : getIconUrl("Dip/Dip_V_On_Yellow.png")
				}},
				{ value : "HMI_LEVER", text : I18N.prop("HMI_LEVER"), imageUrl : getIconUrl("Lever/Lever_Off.png"), categoryName : "Toggle", className : "Button", images : {
					gray_on : getIconUrl("Lever/Lever_On.png"),
					red_off : getIconUrl("Lever/Lever_Off_Red.png"), red_on : getIconUrl("Lever/Lever_On_Red.png"),
					blue_off : getIconUrl("Lever/Lever_Off_Blue.png"), blue_on : getIconUrl("Lever/Lever_On_Blue.png"),
					green_off : getIconUrl("Lever/Lever_Off_Green.png"), green_on : getIconUrl("Lever/Lever_On_Green.png"),
					yellow_off : getIconUrl("Lever/Lever_Off_Yellow.png"), yellow_on : getIconUrl("Lever/Lever_On_Yellow.png")
				}},
				{ value : "HMI_LEVER_RECTANGLE", text : I18N.prop("HMI_LEVER_RECTANGLE"), imageUrl : getIconUrl("Toggle/Toggle_Plastic_Off.png"), categoryName : "Toggle", className : "Button", images : {
					gray_on : getIconUrl("Toggle/Toggle_Plastic_On.png"),
					red_off : getIconUrl("Toggle/Toggle_Plastic_Off_Red.png"), red_on : getIconUrl("Toggle/Toggle_Plastic_On_Red.png"),
					blue_off : getIconUrl("Toggle/Toggle_Plastic_Off_Blue.png"), blue_on : getIconUrl("Toggle/Toggle_Plastic_On_Blue.png"),
					green_off : getIconUrl("Toggle/Toggle_Plastic_Off_Green.png"), green_on : getIconUrl("Toggle/Toggle_Plastic_On_Green.png"),
					yellow_off : getIconUrl("Toggle/Toggle_Plastic_Off_Yellow.png"), yellow_on : getIconUrl("Toggle/Toggle_Plastic_On_Yellow.png")
				}},
				{ value : "HMI_LEVER_ROUND", text : I18N.prop("HMI_LEVER_ROUND"), imageUrl : getIconUrl("Toggle/Toggle_Silver_Off.png"), categoryName : "Toggle", className : "Button", images : {
					gray_on : getIconUrl("Toggle/Toggle_Silver_On.png"),
					red_off : getIconUrl("Toggle/Toggle_Off_Red.png"), red_on : getIconUrl("Toggle/Toggle_On_Red.png"),
					blue_off : getIconUrl("Toggle/Toggle_Off_Blue.png"), blue_on : getIconUrl("Toggle/Toggle_On_Blue.png"),
					green_off : getIconUrl("Toggle/Toggle_Off_Green.png"), green_on : getIconUrl("Toggle/Toggle_On_Green.png"),
					yellow_off : getIconUrl("Toggle/Toggle_Off_Yellow.png"), yellow_on : getIconUrl("Toggle/Toggle_On_Yellow.png")
				}},
				{ value : "HMI_SELECTOR_GREY", text : I18N.prop("HMI_SELECTOR"), imageUrl : getIconUrl("Selector/Selector_Off_Grey.png"), categoryName : "Selector", className : "Button", images : {
					gray_on : getIconUrl("Selector/Selector_On_Grey.png"),
					red_off : getIconUrl("Selector/Selector_Off_Red.png"), red_on : getIconUrl("Selector/Selector_On_Red.png"),
					blue_off : getIconUrl("Selector/Selector_Off_Blue.png"), blue_on : getIconUrl("Selector/Selector_On_Blue.png"),
					green_off : getIconUrl("Selector/Selector_Off_Green.png"), green_on : getIconUrl("Selector/Selector_On_Green.png"),
					yellow_off : getIconUrl("Selector/Selector_Off_Yellow.png"), yellow_on : getIconUrl("Selector/Selector_On_Yellow.png")
				}},
				{ value : "HMI_LED", text : I18N.prop("HMI_LED"), imageUrl : getIconUrl("Led/Led_Gray_Stop.PNG"), categoryName : "LED", className : "Animation",
					images : {
						//On/Off는 파일명은 다르지만 동일 이미지를 갖는다. 기존 v1.0 그래픽 이미지와의 호환을 위함이다.
						green_on : getIconUrl("Led/Led_Green.PNG"), green_off : getIconUrl("Led/Led_Green_Stop.PNG"),
						red_on : getIconUrl("Led/Led_Red.PNG"), red_off : getIconUrl("Led/Led_Red_Stop.PNG"),
						yellow_on : getIconUrl("Led/Led_Yellow.PNG"), yellow_off : getIconUrl("Led/Led_Yellow_Stop.PNG"),
						blue_on : getIconUrl("Led/Led_Blue.png"), blue_off : getIconUrl("Led/Led_Blue_Stop.png"),
						gray_on : getIconUrl("Led/Led_Gray.PNG")
					}
				},
				{ value : "HMI_LED_CIRCLE", text : I18N.prop("HMI_LED_CIRCLE"), imageUrl : getIconUrl("Led/LED_Circle_Gray.png"), categoryName : "LED", className : "Animation",
					images : {
						green_on : getIconUrl("Led/LED_Circle_Green.png"), green_off : getIconUrl("Led/LED_Circle_Green.png"),
						red_on : getIconUrl("Led/LED_Circle_Red.png"), red_off : getIconUrl("Led/LED_Circle_Red.png"),
						yellow_on : getIconUrl("Led/LED_Circle_Yellow.png"), yellow_off : getIconUrl("Led/LED_Circle_Yellow.png"),
						blue_on : getIconUrl("Led/LED_Circle_Blue.png"), blue_off : getIconUrl("Led/LED_Circle_Blue.png"),
						gray_on : getIconUrl("Led/LED_Circle_Gray.png")
					}
				},
				{ value : "HMI_LED_ROUND_RECTANGLE", text : I18N.prop("HMI_LED_ROUND_RECTANGLE"), imageUrl : getIconUrl("Led/LED_RoundSquare_Gray.png"), categoryName : "LED", className : "Animation",
					images : {
						green_on : getIconUrl("Led/LED_RoundSquare_Green.png"), green_off : getIconUrl("Led/LED_RoundSquare_Green.png"),
						red_on : getIconUrl("Led/LED_RoundSquare_Red.png"), red_off : getIconUrl("Led/LED_RoundSquare_Red.png") ,
						yellow_on : getIconUrl("Led/LED_RoundSquare_Yellow.png"), yellow_off : getIconUrl("Led/LED_RoundSquare_Yellow.png"),
						blue_on : getIconUrl("Led/LED_RoundSquare_Blue.png"), blue_off : getIconUrl("Led/LED_RoundSquare_Blue.png"),
						gray_on : getIconUrl("Led/LED_RoundSquare_Gray.png")
					}
				},
				{ value : "HMI_LED_RECTANGLE", text : I18N.prop("HMI_LED_RECTANGLE"), imageUrl : getIconUrl("Led/LED_Square_Gray.png"), categoryName : "LED", className : "Animation",
					images : {
						green_on : getIconUrl("Led/LED_Square_Green.png"), green_off : getIconUrl("Led/LED_Square_Green.png"),
						red_on : getIconUrl("Led/LED_Square_Red.png"), red_off : getIconUrl("Led/LED_Square_Red.png"),
						yellow_on : getIconUrl("Led/LED_Square_Yellow.png"), yellow_off : getIconUrl("Led/LED_Square_Yellow.png"),
						blue_on : getIconUrl("Led/LED_Square_Blue.png"), blue_off : getIconUrl("Led/LED_Square_Blue.png"),
						gray_on : getIconUrl("Led/LED_Square_Gray.png")
					}
				},
				{ value : "HMI_ALARM", text : I18N.prop("HMI_ALARM"), imageUrl : getIconUrl("Error/Middle.PNG"), categoryName : "Alarm", images : { on : getIconUrl("Error/ani/alarm.gif")}, className : "Animation" },
				// { value : "HMI_TEXT", text : I18N.prop("HMI_TEXT"), imageUrl : getIconUrl("basic/text.png"), className : "Text", categoryName : "Text" },
				{ value : "HMI_CHECK_BOX", text : I18N.prop("HMI_CHECK_BOX"), imageUrl : getIconUrl("controlGraphics/check.png"), className : "CheckBox", categoryName : "CheckBox" },
				{ value : "HMI_COMBO_BOX", text : I18N.prop("HMI_COMBO_BOX"), imageUrl : getIconUrl("controlGraphics/combo.png"), className : "ComboBox", categoryName : "Combobox" },
				{ value : "HMI_RADIO_BUTTON", text : I18N.prop("HMI_RADIO_BUTTON"), imageUrl : getIconUrl("controlGraphics/radiobutton.png"), className : "RadioButton", categoryName : "Radio Button" },
				{ value : "HMI_RADIO_BUTTON_VERTICAL", text : I18N.prop("HMI_RADIO_BUTTON_VERTICAL"), imageUrl : getIconUrl("controlGraphics/radiobutton_v.png"), className : "RadioButton", categoryName : "Radio Button", options : { direction : "vertical" }},
				{ value : "HMI_SCALE_BAR", text : I18N.prop("HMI_SCALE_BAR"),imageUrl : getIconUrl("controlGraphics/scalebar.png"), className : "ScaleBar", categoryName : "Scalebar" },
				{ value : "HMI_SCALE_BAR_VERTICAL", text : I18N.prop("HMI_SCALE_BAR_VERTICAL"),imageUrl : getIconUrl("controlGraphics/scalebar_v.png"), className : "ScaleBar", categoryName : "Scalebar", options : { direction : "vertical" }},
				{ value : "HMI_TEXT_BOX", text : I18N.prop("HMI_TEXT_BOX"),imageUrl : getIconUrl("basic/text.png"), className : "ExtendText", categoryName : "ExtLabel" },
				{ value : "HMI_CHART", text : I18N.prop("HMI_CHART"), imageUrl : getIconUrl("Chart/chart.png"), className : "Chart", categoryName : "Chart" },
				{ value : "HMI_PROGRESS_BAR", text : I18N.prop("HMI_PROGRESS_BAR"), imageUrl : getIconUrl("controlGraphics/progress.png"), className : "ProgressBar", categoryName : "ProgressBar" },
				{ value : "HMI_PROGRESS_BAR_VERTICAL", text : I18N.prop("HMI_PROGRESS_BAR_VERTICAL"), imageUrl : getIconUrl("controlGraphics/progress_v.png"), className : "ProgressBar", categoryName : "ProgressBar", options : { direction : "vertical" }}
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_DUCTS"),
			groupName : "facilityGraphicImage",
			className : "Image",
			items : [
				{ value : "HMI_DUCT_CROSS", text : I18N.prop("HMI_DUCT_CROSS"), imageUrl : getIconUrl("Duct/Ducts_Cross.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_Cross_Red.png"), blue : getIconUrl("Duct/Ducts_Cross_Blue.png"), yellow : getIconUrl("Duct/Ducts_Cross_Yellow.png"),
					green : getIconUrl("Duct/Ducts_Cross_Green.png")
				}},
				{ value : "HMI_DUCT_H", text : I18N.prop("HMI_DUCT_H"), imageUrl : getIconUrl("Duct/Ducts_H.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_H_Red.png"), blue : getIconUrl("Duct/Ducts_H_Blue.png"), yellow : getIconUrl("Duct/Ducts_H_Yellow.png"),
					green : getIconUrl("Duct/Ducts_H_Green.png")
				}},
				{ value : "HMI_DUCT_HOLE", text : I18N.prop("HMI_DUCT_HOLE"), imageUrl : getIconUrl("Duct/Ducts_Hole.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_Hole_Red.png"), blue : getIconUrl("Duct/Ducts_Hole_Blue.png"), yellow : getIconUrl("Duct/Ducts_Hole_Yellow.png"),
					green : getIconUrl("Duct/Ducts_Hole_Green.png")
				}},
				{ value : "HMI_DUCT_HORZSTRAIGHT", text : I18N.prop("HMI_DUCT_HORZSTRAIGHT"), imageUrl : getIconUrl("Duct/Ducts_HorzStraight.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_HorzStraight_Red.png"), blue : getIconUrl("Duct/Ducts_HorzStraight_Blue.png"), yellow : getIconUrl("Duct/Ducts_HorzStraight_Yellow.png"),
					green : getIconUrl("Duct/Ducts_HorzStraight_Green.png")
				}},
				{ value : "HMI_DUCTS_HORZSTRAIGHT_HARF", text : I18N.prop("HMI_DUCTS_HORZSTRAIGHT_HARF"), imageUrl : getIconUrl("Duct/Ducts_HorzStraight_harf.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_HorzStraight_harf_Red.png"), blue : getIconUrl("Duct/Ducts_HorzStraight_harf_Blue.png"), yellow : getIconUrl("Duct/Ducts_HorzStraight_harf_Yellow.png"),
					green : getIconUrl("Duct/Ducts_HorzStraight_harf_Green.png")
				}},
				{ value : "HMI_DUCT_L_DOWN_LEFT", text : I18N.prop("HMI_DUCT_L_DOWN_LEFT"), imageUrl : getIconUrl("Duct/Ducts_L_Down_Left.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_L_Down_Left_Red.png"), blue : getIconUrl("Duct/Ducts_L_Down_Left_Blue.png"), yellow : getIconUrl("Duct/Ducts_L_Down_Left_Yellow.png"),
					green : getIconUrl("Duct/Ducts_L_Down_Left_Green.png")
				}},
				{ value : "HMI_DUCT_L_DOWN_RIGHT", text : I18N.prop("HMI_DUCT_L_DOWN_RIGHT"),imageUrl : getIconUrl("Duct/Ducts_L_Down_Right.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_L_Down_Right_Red.png"), blue : getIconUrl("Duct/Ducts_L_Down_Right_Blue.png"), yellow : getIconUrl("Duct/Ducts_L_Down_Right_Yellow.png"),
					green : getIconUrl("Duct/Ducts_L_Down_Right_Green.png")
				}},
				{ value : "HMI_DUCTS_L_UP_LEFT", text : I18N.prop("HMI_DUCTS_L_UP_LEFT"), imageUrl : getIconUrl("Duct/Ducts_L_Up_Left.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_L_Up_Left_Red.png"), blue : getIconUrl("Duct/Ducts_L_Up_Left_Blue.png"), yellow : getIconUrl("Duct/Ducts_L_Up_Left_Yellow.png"),
					green : getIconUrl("Duct/Ducts_L_Up_Left_Green.png")
				}},
				{ value : "HMI_DUCTS_L_UP_RIGHT", text : I18N.prop("HMI_DUCTS_L_UP_RIGHT"), imageUrl : getIconUrl("Duct/Ducts_L_Up_Right.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_L_Up_Right_Red.png"), blue : getIconUrl("Duct/Ducts_L_Up_Right_Blue.png"), yellow : getIconUrl("Duct/Ducts_L_Up_Right_Yellow.png"),
					green : getIconUrl("Duct/Ducts_L_Up_Right_Green.png")
				}},
				{ value : "HMI_DUCT_SEPARATION_2_LEFT", text : I18N.prop("HMI_DUCT_SEPARATION_2_LEFT"), imageUrl : getIconUrl("Duct/Ducts_Separation_2Left.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_Separation_2Left_Red.png"), blue : getIconUrl("Duct/Ducts_Separation_2Left_Blue.png"), yellow : getIconUrl("Duct/Ducts_Separation_2Left_Yellow.png"),
					green : getIconUrl("Duct/Ducts_Separation_2Left_Green.png")
				}},
				{ value : "HMI_DUCT_SEPARATION_3_LEFT", text : I18N.prop("HMI_DUCT_SEPARATION_3_LEFT"), imageUrl : getIconUrl("Duct/Ducts_Separation_3Left.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_Separation_3Left_Red.png"), blue : getIconUrl("Duct/Ducts_Separation_3Left_Blue.png"), yellow : getIconUrl("Duct/Ducts_Separation_3Left_Yellow.png"),
					green : getIconUrl("Duct/Ducts_Separation_3Left_Green.png")
				}},
				{ value : "HMI_DUCTS_SEPARATION_3RIGHT", text : I18N.prop("HMI_DUCTS_SEPARATION_3RIGHT"), imageUrl : getIconUrl("Duct/Ducts_Separation_3Right.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_Separation_3Right_Red.png"), blue : getIconUrl("Duct/Ducts_Separation_3Right_Blue.png"), yellow : getIconUrl("Duct/Ducts_Separation_3Right_Yellow.png"),
					green : getIconUrl("Duct/Ducts_Separation_3Right_Green.png")
				}},
				{ value : "HMI_DUCTS_SEPERATE_2RIGHT", text : I18N.prop("HMI_DUCTS_SEPERATE_2RIGHT"), imageUrl : getIconUrl("Duct/Ducts_Seperate_2Right.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_Seperate_2Right_Red.png"), blue : getIconUrl("Duct/Ducts_Seperate_2Right_Blue.png"), yellow : getIconUrl("Duct/Ducts_Seperate_2Right_Yellow.png"),
					green : getIconUrl("Duct/Ducts_Seperate_2Right_Green.png")
				}},
				{ value : "HMI_DUCTS_T_DOWN", text : I18N.prop("HMI_DUCTS_T_DOWN"), imageUrl : getIconUrl("Duct/Ducts_T_Down.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_T_Down_Red.png"), blue : getIconUrl("Duct/Ducts_T_Down_Blue.png"), yellow : getIconUrl("Duct/Ducts_T_Down_Yellow.png"),
					green : getIconUrl("Duct/Ducts_T_Down_Green.png")
				}},
				{ value : "HMI_DUCTS_T_LEFT", text : I18N.prop("HMI_DUCTS_T_LEFT"),imageUrl : getIconUrl("Duct/Ducts_T_Left.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_T_Left_Red.png"), blue : getIconUrl("Duct/Ducts_T_Left_Blue.png"), yellow : getIconUrl("Duct/Ducts_T_Left_Yellow.png"),
					green : getIconUrl("Duct/Ducts_T_Left_Green.png")
				}},
				{ value : "HMI_DUCTS_T_RIGHT", text : I18N.prop("HMI_DUCTS_T_RIGHT"), imageUrl : getIconUrl("Duct/Ducts_T_Right.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_T_Right_Red.png"), blue : getIconUrl("Duct/Ducts_T_Right_Blue.png"), yellow : getIconUrl("Duct/Ducts_T_Right_Yellow.png"),
					green : getIconUrl("Duct/Ducts_T_Right_Green.png")
				}},
				{ value : "HMI_DUCTS_T_UP", text : I18N.prop("HMI_DUCTS_T_UP"), imageUrl : getIconUrl("Duct/Ducts_T_Up.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_T_Up_Red.png"), blue : getIconUrl("Duct/Ducts_T_Up_Blue.png"), yellow : getIconUrl("Duct/Ducts_T_Up_Yellow.png"),
					green : getIconUrl("Duct/Ducts_T_Up_Green.png")
				}},
				{ value : "HMI_DUCTSVENTILATING", text : I18N.prop("HMI_DUCTSVENTILATING"), imageUrl : getIconUrl("Duct/Ducts_Ventilating.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_Ventilating_Red.png"), blue : getIconUrl("Duct/Ducts_Ventilating_Blue.png"), yellow : getIconUrl("Duct/Ducts_Ventilating_Yellow.png"),
					green : getIconUrl("Duct/Ducts_Ventilating_Green.png")
				}},
				{ value : "HMI_DUCTS_VERTSTRAIGHT", text : I18N.prop("HMI_DUCTS_VERTSTRAIGHT"), imageUrl : getIconUrl("Duct/Ducts_VertStraight.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_VertStraight_Red.png"), blue : getIconUrl("Duct/Ducts_VertStraight_Blue.png"), yellow : getIconUrl("Duct/Ducts_VertStraight_Yellow.png"),
					green : getIconUrl("Duct/Ducts_VertStraight_Green.png")
				} },
				{ value : "HMI_DUCTS_VERTSTRAIGHT_HARF", text : I18N.prop("HMI_DUCTS_VERTSTRAIGHT_HARF"), imageUrl : getIconUrl("Duct/Ducts_VertStraight_harf.svg"), categoryName : "Null", images : {
					red : getIconUrl("Duct/Ducts_VertStraight_harf_Red.png"), blue : getIconUrl("Duct/Ducts_VertStraight_harf_Blue.png"), yellow : getIconUrl("Duct/Ducts_VertStraight_harf_Yellow.png"),
					green : getIconUrl("Duct/Ducts_VertStraight_harf_Green.png")
				}}
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_PIPES"),
			groupName : "facilityGraphicImage",
			className : "Image",
			items : [
				{ value : "HMI_PIPESCOVER_DOWN_GREY", text : I18N.prop("HMI_PIPESCOVER_DOWN"), imageUrl : getIconUrl("PipesCover_Down_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("PipesCover_Down_Red.png"), blue : getIconUrl("PipesCover_Down_Blue.png"), yellow : getIconUrl("PipesCover_Down_Yellow.png"),
					green : getIconUrl("PipesCover_Down_Green.png")
				}},
				{ value : "HMI_PIPESCOVER_LEFT_GREY", text : I18N.prop("HMI_PIPESCOVER_LEFT"), imageUrl : getIconUrl("PipesCover_Left_Grey.png") , categoryName : "Null", images : {
					red : getIconUrl("PipesCover_Left_Red.png"), blue : getIconUrl("PipesCover_Left_Blue.png"), yellow : getIconUrl("PipesCover_Left_Yellow.png"),
					green : getIconUrl("PipesCover_Left_Green.png")
				}},
				{ value : "HMI_PIPESCOVER_RIGHT_GREY", text : I18N.prop("HMI_PIPESCOVER_RIGHT"), imageUrl : getIconUrl("PipesCover_Right_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("PipesCover_Right_Red.png"), blue : getIconUrl("PipesCover_Right_Blue.png"), yellow : getIconUrl("PipesCover_Right_Yellow.png"),
					green : getIconUrl("PipesCover_Right_Green.png")
				}},
				{ value : "HMI_PIPESCOVER_UP_GREY", text : I18N.prop("HMI_PIPESCOVER_UP"), imageUrl : getIconUrl("PipesCover_Up_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("PipesCover_Up_Red.png"), blue : getIconUrl("PipesCover_Up_Blue.png"), yellow : getIconUrl("PipesCover_Up_Yellow.png"),
					green : getIconUrl("PipesCover_Up_Green.png")
				}},
				{ value : "HMI_PIPES_CROSS_GREY", text : I18N.prop("HMI_PIPES_CROSS"),imageUrl : getIconUrl("Pipes_Cross_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_Cross_Red.png"), blue : getIconUrl("Pipes_Cross_Blue.png"), yellow : getIconUrl("Pipes_Cross_Yellow.png"),
					green : getIconUrl("Pipes_Cross_Green.png")
				}},
				{ value : "HMI_PIPES_HORZSTRAIGHT", text : I18N.prop("HMI_PIPES_HORZSTRAIGHT"), imageUrl : getIconUrl("Pipes_HorzStraight_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_HorzStraight_Red.png"), blue : getIconUrl("Pipes_HorzStraight_Blue.png"), yellow : getIconUrl("Pipes_HorzStraight_Yellow.png"),
					green : getIconUrl("Pipes_HorzStraight_Green.png")
				}},
				{ value : "HMI_PIPES_L_DOWN_LEFT_GREY", text : I18N.prop("HMI_PIPES_L_DOWN_LEFT"), imageUrl : getIconUrl("Pipes_L_Down_Left_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_L_Down_Left_Red.png"), blue : getIconUrl("Pipes_L_Down_Left_Blue.png"), yellow : getIconUrl("Pipes_L_Down_Left_Yellow.png"),
					green : getIconUrl("Pipes_L_Down_Left_Green.png")
				}},
				{ value : "HMI_PIPES_L_DOWN_RIGHT_GREY", text : I18N.prop("HMI_PIPES_L_DOWN_RIGHT"), imageUrl : getIconUrl("Pipes_L_Down_Right_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_L_Down_Right_Red.png"), blue : getIconUrl("Pipes_L_Down_Right_Blue.png"), yellow : getIconUrl("Pipes_L_Down_Right_Yellow.png"),
					green : getIconUrl("Pipes_L_Down_Right_Green.png")
				}},
				{ value : "HMI_PIPES_L_UP_LEFT_GREY", text : I18N.prop("HMI_PIPES_L_UP_LEFT"), imageUrl : getIconUrl("Pipes_L_Up_Left_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_L_Up_Left_Red.png"), blue : getIconUrl("Pipes_L_Up_Left_Blue.png"), yellow : getIconUrl("Pipes_L_Up_Left_Yellow.png"),
					green : getIconUrl("Pipes_L_Up_Left_Green.png")
				}},
				{ value : "HMI_PIPES_L_UP_RIGHT_GREY", text : I18N.prop("HMI_PIPES_L_UP_RIGHT"), imageUrl : getIconUrl("Pipes_L_Up_Right_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_L_Up_Right_Red.png"), blue : getIconUrl("Pipes_L_Up_Right_Blue.png"), yellow : getIconUrl("Pipes_L_Up_Right_Yellow.png"),
					green : getIconUrl("Pipes_L_Up_Right_Green.png")
				}},
				{ value : "HMI_PIPES_T_DOWN_GREY", text : I18N.prop("HMI_PIPES_T_DOWN"), imageUrl : getIconUrl("Pipes_T_Down_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_T_Down_Red.png"), blue : getIconUrl("Pipes_T_Down_Blue.png"), yellow : getIconUrl("Pipes_T_Down_Yellow.png"),
					green : getIconUrl("Pipes_T_Down_Green.png")
				}},
				{ value : "HMI_PIPES_T_LEFT_GREY", text : I18N.prop("HMI_PIPES_T_LEFT"),imageUrl : getIconUrl("Pipes_T_Left_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_T_Left_red.png"), blue : getIconUrl("Pipes_T_Left_Blue.png"), yellow : getIconUrl("Pipes_T_Left_Yellow.png"),
					green : getIconUrl("Pipes_T_Left_Green.png")
				}},
				{ value : "HMI_PIPES_T_RIGHT_GREY", text : I18N.prop("HMI_PIPES_T_RIGHT"), imageUrl : getIconUrl("Pipes_T_Right_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_T_Right_Red.png"), blue : getIconUrl("Pipes_T_Right_Blue.png"), yellow : getIconUrl("Pipes_T_Right_Yellow.png"),
					green : getIconUrl("Pipes_T_Right_Green.png")
				}},
				{ value : "HMI_PIPES_T_UP_GREY", text : I18N.prop("HMI_PIPES_T_UP"),imageUrl : getIconUrl("Pipes_T_Up_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_T_Up_Red.png"), blue : getIconUrl("Pipes_T_Up_Blue.png"), yellow : getIconUrl("Pipes_T_Up_Yellow.png"),
					green : getIconUrl("Pipes_T_Up_Green.png")
				}},
				{ value : "HMI_PIPES_VERTSTRAIGHT_GREY", text : I18N.prop("HMI_PIPES_VERTSTRAIGHT"), imageUrl : getIconUrl("Pipes_VertStraight_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Pipes_VertStraight_Red.png"), blue : getIconUrl("Pipes_VertStraight_Blue.png"), yellow : getIconUrl("Pipes_VertStraight_Yellow.png"),
					green : getIconUrl("Pipes_VertStraight_Green.png")
				}}
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_FIELD_DEVICE"),
			groupName : "facilityGraphicImage",
			className : "Image",
			items : [
				{ value : "HMI_FLOWSENSOR_CIRCLE", text : I18N.prop("HMI_FLOWSENSOR_CIRCLE"), imageUrl : getIconUrl("FlowSensor_Circle.png"), categoryName : "Null", images : {
					red : getIconUrl("FlowSensor_Circle_Red.png"), blue : getIconUrl("FlowSensor_Circle_Blue.png"), yellow : getIconUrl("FlowSensor_Circle_Yellow.png"),
					green : getIconUrl("FlowSensor_Circle_Green.png")	//Default가 Green
				}},
				{ value : "HMI_FLOWSENSOR_CROSS", text : I18N.prop("HMI_FLOWSENSOR_CROSS"), imageUrl : getIconUrl("FlowSensor_Cross.png"), categoryName : "Null", images : {
					red : getIconUrl("FlowSensor_Cross_Red.png"), blue : getIconUrl("FlowSensor_Cross_Blue.png"), yellow : getIconUrl("FlowSensor_Cross_Yellow.png"),
					green : getIconUrl("FlowSensor_Cross_Green.png")	//Default가 Green
				}},
				{ value : "HMI_HEATSENSOR_DOWN_BLUE", text : I18N.prop("HMI_HEATSENSOR_DOWN"), imageUrl : getIconUrl("HeatSensor_Down_Gray.png"), categoryName : "Null", images : {
					red : getIconUrl("HeatSensor_Down_Red.png"), blue : getIconUrl("HeatSensor_Down_Blue.png"), yellow : getIconUrl("HeatSensor_Down_Yellow.png"),
					green : getIconUrl("HeatSensor_Down_Green.png")
				}},
				{ value : "HMI_PIPESENSOR_DOWN_GREY", text : I18N.prop("HMI_PIPESENSOR_DOWN"), imageUrl : getIconUrl("PipeSensor_Down_Gray.png"), categoryName : "Null", images : {
					red : getIconUrl("PipeSensor_Down_Red.png"), blue : getIconUrl("PipeSensor_Down_Blue.png"), yellow : getIconUrl("PipeSensor_Down_Yellow.png"),
					green : getIconUrl("PipeSensor_Down_Green.png")
				}},
				{ value : "HMI_PRESSSENSOR_DOWN", text : I18N.prop("HMI_PRESSSENSOR_DOWN"), imageUrl : getIconUrl("PressSensor_Down.png"), categoryName : "Null", images : {
					red : getIconUrl("PressSensor_Down_Red.png"), blue : getIconUrl("PressSensor_Down_Blue.png"), yellow : getIconUrl("PressSensor_Down_Yellow.png"),
					green : getIconUrl("PressSensor_Down_Green.png")
				}},
				{ value : "HMI_SENSOR_DOWN_GREY", text : I18N.prop("HMI_SENSOR_DOWN"), imageUrl : getIconUrl("Sensor_Down_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Sensor_Down_Red.png"), blue : getIconUrl("Sensor_Down_Blue.png"), yellow : getIconUrl("Sensor_Down_Yellow.png"),
					green : getIconUrl("Sensor_Down_Green.png")
				}},
				{ value : "HMI_SENSOR_LDOWN_BLUE2", text : I18N.prop("HMI_SENSOR_LDOWN"), imageUrl : getIconUrl("Sensor_LDown_Gray2.png"), categoryName : "Null", images : {
					red : getIconUrl("Sensor_LDown_Red2.png"), blue : getIconUrl("Sensor_LDown_Blue2.png"), yellow : getIconUrl("Sensor_LDown_Yellow2.png"),
					green : getIconUrl("Sensor_LDown_Green2.png")
				}},
				{ value : "HMI_SENSOR_LUP_BLUE2", text : I18N.prop("HMI_SENSOR_LUP"), imageUrl : getIconUrl("Sensor_LUp_Gray2.png"), categoryName : "Null", images : {
					red : getIconUrl("Sensor_LUp_Red2.png"), blue : getIconUrl("Sensor_LUp_Blue2.png"), yellow : getIconUrl("Sensor_LUp_Yellow2.png"),
					green : getIconUrl("Sensor_LUp_Green2.png")
				}},
				{ value : "HMI_SENSOR_SDOWN_BLUE2", text : I18N.prop("HMI_SENSOR_SDOWN"), imageUrl : getIconUrl("Sensor_SDown_Gray2.png"), categoryName : "Null", images : {
					red : getIconUrl("Sensor_SDown_Red2.png"), blue : getIconUrl("Sensor_SDown_Blue2.png"), yellow : getIconUrl("Sensor_SDown_Yellow2.png"),
					green : getIconUrl("Sensor_SDown_Green2.png")
				}},
				{ value : "HMI_SENSOR_SUP_BLUE2", text : I18N.prop("HMI_SENSOR_SUP"), imageUrl : getIconUrl("Sensor_SUp_Gray2.png"), categoryName : "Null", images : {
					red : getIconUrl("Sensor_SUp_Red2.png"), blue : getIconUrl("Sensor_SUp_Blue2.png"), yellow : getIconUrl("Sensor_SUp_Yellow2.png"),
					green : getIconUrl("Sensor_SUp_Green2.png")
				}},
				{ value : "HMI_SENSOR_UP_GREY", text : I18N.prop("HMI_SENSOR_UP"),imageUrl : getIconUrl("Sensor_Up_Grey.png"), categoryName : "Null", images : {
					red : getIconUrl("Sensor_Up_Red.png"), blue : getIconUrl("Sensor_Up_Blue.png"), yellow : getIconUrl("Sensor_Up_Yellow.png"),
					green : getIconUrl("Sensor_Up_Green.png")
				}, oldImages : [getIconUrl("Sensor_Down_Green_up.png")] },
				{ value : "HMI_SENSORLAMP_UP", text : I18N.prop("HMI_SENSORLAMP_UP"), imageUrl : getIconUrl("SensorLamp_Up.png"), categoryName : "Null", images : {
					red : getIconUrl("SensorLamp_Up_Red.png"), blue : getIconUrl("SensorLamp_Up_Blue.png"), yellow : getIconUrl("SensorLamp_Up_Yellow.png"),
					green : getIconUrl("SensorLamp_Up_Green.png")
				}},
				{ value : "HMI_TEMPSENSOR_UP", text : I18N.prop("HMI_TEMPSENSOR_UP"), imageUrl : getIconUrl("TempSensor_Up.png"), categoryName : "Null", images : {
					red : getIconUrl("TempSensor_Up_Red.png"), blue : getIconUrl("TempSensor_Up_Blue.png"), yellow : getIconUrl("TempSensor_Up_Yellow.png"),
					green : getIconUrl("TempSensor_Up_Green.png")
				}},
				{ value : "HMI_VALVE", text : I18N.prop("HMI_VALVE"), imageUrl : getIconUrl("Valve/Valve_N_OFF.png"), categoryName : "Valve", className : "Animation",
					images : valveImages
				},
				{ value : "HMI_ROUND_VALVE", text : I18N.prop("HMI_ROUND_VALVE"), imageUrl : getIconUrl("Valve/Valve_Circle_N_OFF.png"), categoryName : "Valve", className : "Animation",
					images : roundValveImages
				},
				{ value : "HMI_ELECTRONIC_VALVE", text : I18N.prop("HMI_ELECTRONIC_VALVE"), imageUrl : getIconUrl("Valve/Valve_Elec_N_OFF.png"), categoryName : "Valve", className : "Animation",
					images : elecValveImages
				}
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_PARTS"),
			groupName : "facilityGraphicImage",
			className : "Image",
			items : [
				{ value : "HMI_DAMPER_H1_GREY", text : I18N.prop("HMI_DAMPER_H1_GREY"), imageUrl : getIconUrl("Damper/Damper_H1_Grey.png"), categoryName : "Damper", className : "Animation", images : damperHImages },
				{ value : "HMI_DAMPER_V1_GREY", text : I18N.prop("HMI_DAMPER_V1_GREY"), imageUrl : getIconUrl("Damper/Damper_V1_Grey.png"), categoryName : "Damper", className : "Animation", images : damperVImages },
				{ value : "HMI_FILTER_H", text : I18N.prop("HMI_FILTER_H"),imageUrl : getIconUrl("Filter_H.png"), categoryName : "Null", images : {
					red : getIconUrl("Filter_H_Red.png"), blue : getIconUrl("Filter_H_Blue.png"), yellow : getIconUrl("Filter_H_Yellow.png"),
					green : getIconUrl("Filter_H_Green.png")
				}},
				{ value : "HMI_FILTER_V", text : I18N.prop("HMI_FILTER_V"), imageUrl : getIconUrl("Filter_V.png"), categoryName : "Null", images : {
					red : getIconUrl("Filter_V_Red.png"), blue : getIconUrl("Filter_V_Blue.png"), yellow : getIconUrl("Filter_V_Yellow.png"),
					green : getIconUrl("Filter_V_Green.png")
				}},
				{ value : "HMI_COIL_H_COOL", text : I18N.prop("HMI_COIL_H_COOL"), imageUrl : getIconUrl("Coil/Coil_H_Cool_Stop.png"), categoryName : "Coil", className : "Animation",
					images : {
						red_on : getIconUrl("Coil/Coil_H_Red.png"), red_off : getIconUrl("Coil/Coil_H_Red.png"),
						blue_on : getIconUrl("Coil/Coil_H_Blue.png"), blue_off : getIconUrl("Coil/Coil_H_Blue.png"),
						green_on : getIconUrl("Coil/Coil_H_Green.png"), green_off : getIconUrl("Coil/Coil_H_Green.png"),
						yellow_on : getIconUrl("Coil/Coil_H_Yellow.png"), yellow_off : getIconUrl("Coil/Coil_H_Yellow.png"),
						gray_on : getIconUrl("Coil/Coil_H_Grey.png")
					}
				},
				{ value : "HMI_COIL_H_HOT", text : I18N.prop("HMI_COIL_H_HOT"), imageUrl : getIconUrl("Coil/Coil_H_Hot_Stop.png"), categoryName : "Coil", className : "Animation",
					images : {
						red_on : getIconUrl("Coil/Coil_H_Red.png"), red_off : getIconUrl("Coil/Coil_H_Red.png"),
						blue_on : getIconUrl("Coil/Coil_H_Blue.png"), blue_off : getIconUrl("Coil/Coil_H_Blue.png"),
						yellow_on : getIconUrl("Coil/Coil_H_Yellow.png"), yellow_off : getIconUrl("Coil/Coil_H_Yellow.png"),
						green_on : getIconUrl("Coil/Coil_H_Green.png"), green_off : getIconUrl("Coil/Coil_H_Green.png"),
						gray_on : getIconUrl("Coil/Coil_H_Grey.png")
					}
				},
				{ value : "HMI_COIL_V_COOL", text : I18N.prop("HMI_COIL_V_COOL"),imageUrl : getIconUrl("Coil/Coil_V_Cool_Stop.png"), categoryName : "Coil", className : "Animation",
					images : {
						red_on : getIconUrl("Coil/Coil_V_Red.png"), red_off : getIconUrl("Coil/Coil_V_Red.png"),
						blue_on : getIconUrl("Coil/Coil_V_Blue.png"), blue_off : getIconUrl("Coil/Coil_V_Blue.png"),
						yellow_on : getIconUrl("Coil/Coil_V_Yellow.png"), yellow_off : getIconUrl("Coil/Coil_V_Yellow.png"),
						green_on : getIconUrl("Coil/Coil_V_Green.png"), green_off : getIconUrl("Coil/Coil_V_Green.png"),
						gray_on : getIconUrl("Coil/Coil_V_Grey.png")
					}
				},
				{ value : "HMI_COIL_V_HOT", text : I18N.prop("HMI_COIL_V_HOT"), imageUrl : getIconUrl("Coil/Coil_V_Hot_Stop.png"), categoryName : "Coil", className : "Animation",
					images : {
						red_on : getIconUrl("Coil/Coil_V_Red.png"), red_off : getIconUrl("Coil/Coil_V_Red.png"),
						blue_on : getIconUrl("Coil/Coil_V_Blue.png"), blue_off : getIconUrl("Coil/Coil_V_Blue.png"),
						yellow_on : getIconUrl("Coil/Coil_V_Yellow.png"), yellow_off : getIconUrl("Coil/Coil_V_Yellow.png"),
						green_on : getIconUrl("Coil/Coil_V_Green.png"), green_off : getIconUrl("Coil/Coil_V_Green.png"),
						gray_on : getIconUrl("Coil/Coil_V_Grey.png")
					}
				}
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_FACILITIES"),
			groupName : "facilityGraphicAnimation",
			className : "Animation",
			items : [
				{ value : "HMI_PUMP_BLUE", text : I18N.prop("HMI_PUMP"), imageUrl : getIconUrl("Pump/CirclePump_Gray.png"), categoryName : "Pumps", className : "Animation", images : circlePumpImages },
				{ value : "HMI_BLUE_CROSS_PUMP", text : I18N.prop("HMI_CROSS_PUMP"), imageUrl : getIconUrl("Pump/CrossPump_Gray.png"), categoryName : "Pumps", className : "Animation", images : crossPumpImages },
				{ value : "HMI_BLUE_PUMP_2", text : I18N.prop("HMI_PUMP_2"), imageUrl : getIconUrl("Pump/Pump_Gray1.png"), categoryName : "Pumps2", className : "Animation", images : pumpImages },
				{ value : "HMI_BLOWER_LEFT", text : I18N.prop("HMI_BLOWER_LEFT"), imageUrl : getIconUrl("Blower/Blower_L1.png"), categoryName : "Blower",
					images : {
						red_stop : getIconUrl("Blower/Blower_L2_Red.png"), blue_stop : getIconUrl("Blower/Blower_L2_Blue.png"), yellow_stop : getIconUrl("Blower/Blower_L2_Yellow.png"),
						green_stop : getIconUrl("Blower/Blower_L2_Green.png"),
						gray_rotate : getIconUrl("Blower/Blower_L1_ani.gif"), red_rotate : getIconUrl("Blower/Blower_L1_ani_Red.gif"), blue_rotate : getIconUrl("Blower/Blower_L1_ani_Blue.gif"),
						yellow_rotate : getIconUrl("Blower/Blower_L1_ani_Yellow.gif"), green_rotate : getIconUrl("Blower/Blower_L1_ani_Green.gif")
					}
				},
				{ value : "HMI_BLOWER_RIGHT", text : I18N.prop("HMI_BLOWER_RIGHT"), imageUrl : getIconUrl("Blower/Blower_R1.png"), categoryName : "Blower",
					images : {
						red_stop : getIconUrl("Blower/Blower_R1_Red.png"), blue_stop : getIconUrl("Blower/Blower_R1_Blue.png"), yellow_stop : getIconUrl("Blower/Blower_R1_Yellow.png"),
						green_stop : getIconUrl("Blower/Blower_R1_Green.png"),
						gray_rotate : getIconUrl("Blower/Blower_R1_ani.gif"), red_rotate : getIconUrl("Blower/Blower_R1_ani_Red.gif"), blue_rotate : getIconUrl("Blower/Blower_R1_ani_Blue.gif"),
						yellow_rotate : getIconUrl("Blower/Blower_R1_ani_Yellow.gif"), green_rotate : getIconUrl("Blower/Blower_R1_ani_Green.gif")
					}
				},
				{ value : "HMI_BLOWER_UP", text : I18N.prop("HMI_BLOWER_UP"), imageUrl : getIconUrl("Blower/Blower_UP1.png"), categoryName : "Blower",
					images : {
						red_stop : getIconUrl("Blower/Blower_UP1_Red.png"), blue_stop : getIconUrl("Blower/Blower_UP1_Blue.png"), yellow_stop : getIconUrl("Blower/Blower_UP1_Yellow.png"),
						green_stop : getIconUrl("Blower/Blower_UP1_Green.png"),
						gray_rotate : getIconUrl("Blower/Blower_UP1_ani.gif"), red_rotate : getIconUrl("Blower/Blower_UP1_ani_Red.gif"), blue_rotate : getIconUrl("Blower/Blower_UP1_ani_Blue.gif"),
						yellow_rotate : getIconUrl("Blower/Blower_UP1_ani_Yellow.gif"), green_rotate : getIconUrl("Blower/Blower_UP1_ani_Green.gif")
					}
				},
				{ value : "HMI_BLOWER_DOWN_", text : I18N.prop("HMI_BLOWER_DOWN_"), imageUrl : getIconUrl("Blower/Blower_Down1.png"), categoryName : "Blower",
					images : {
						red_stop : getIconUrl("Blower/Blower_Down1_Red.png"), blue_stop : getIconUrl("Blower/Blower_Down1_Blue.png"), yellow_stop : getIconUrl("Blower/Blower_Down1_Yellow.png"),
						green_stop : getIconUrl("Blower/Blower_Down1_Green.png"),
						gray_rotate : getIconUrl("Blower/Blower_D_ani.gif"), red_rotate : getIconUrl("Blower/Blower_D_ani_Red.gif"), blue_rotate : getIconUrl("Blower/Blower_D_ani_Blue.gif"),
						yellow_rotate : getIconUrl("Blower/Blower_D_ani_Yellow.gif"), green_rotate : getIconUrl("Blower/Blower_D_ani_Green.gif")
					}
				},
				{ value : "HMI_EXHAUST_FAN", text : I18N.prop("HMI_EXHAUST_FAN"), imageUrl : getIconUrl("Fan/ExhaustFan1.png"), categoryName : "Exhaust",
					images : {
						gray_on: getIconUrl("Fan/ani/Exhaust-Fan1.gif"),
						red_off : getIconUrl("Fan/ExhaustFan1_Red.png"), red_on : getIconUrl("Fan/ani/Exhaust-Fan1_Red.gif"),
						blue_off : getIconUrl("Fan/ExhaustFan1_Blue.png"), blue_on : getIconUrl("Fan/ani/Exhaust-Fan1_Blue.gif"),
						green_off : getIconUrl("Fan/ExhaustFan1_Green.png"), green_on : getIconUrl("Fan/ani/Exhaust-Fan1_Green.gif"),
						yellow_off : getIconUrl("Fan/ExhaustFan1_Yellow.png"), yellow_on : getIconUrl("Fan/ani/Exhaust-Fan1_Yellow.gif")
					}
				},
				{ value : "HMI_COOLING_TOWER_1", text : I18N.prop("HMI_COOLING_TOWER_1"), imageUrl : getIconUrl("CoolingTower/CoolingTower_Cross1.png"), categoryName : "CoolingTower",
					images : {
						gray_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Cross1.gif"),
						red_stop : getIconUrl("CoolingTower/CoolingTower_Cross1_Red.png"), red_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Cross1_Red.gif"),
						blue_stop : getIconUrl("CoolingTower/CoolingTower_Cross1_Blue.png"), blue_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Cross1_Blue.gif"),
						green_stop : getIconUrl("CoolingTower/CoolingTower_Cross1_Green.png"), green_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Cross1_Green.gif"),
						yellow_stop : getIconUrl("CoolingTower/CoolingTower_Cross1_Yellow.png"), yellow_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Cross1_Yellow.gif")
					}
				},
				{ value : "HMI_COOLING_TOWER_2", text : I18N.prop("HMI_COOLING_TOWER_2"),imageUrl : getIconUrl("CoolingTower/Cooling-Tower_Parallel1_Off.png"), categoryName : "CoolingTower",
					images : {
						gray_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Parallel1.gif"),
						red_stop : getIconUrl("CoolingTower/Cooling-Tower_Parallel1_Red.png"), red_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Parallel1_Red.gif"),
						blue_stop : getIconUrl("CoolingTower/Cooling-Tower_Parallel1_Blue.png"), blue_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Parallel1_Blue.gif"),
						green_stop : getIconUrl("CoolingTower/Cooling-Tower_Parallel1_Green.png"), green_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Parallel1_Green.gif"),
						yellow_stop : getIconUrl("CoolingTower/Cooling-Tower_Parallel1_Yellow.png"), yellow_rotate : getIconUrl("CoolingTower/ani/Cooling-Tower_Parallel1_Yellow.gif")
					}
				},
				{ value : "HMI_BOILER", text : I18N.prop("HMI_BOILER"), imageUrl : getIconUrl("Boiler.png"), categoryName : "Null", className : "Image", images : {
					red : getIconUrl("Boiler_Red.png"), blue : getIconUrl("Boiler_Blue.png"), yellow : getIconUrl("Boiler_Yellow.png"),
					green : getIconUrl("Boiler_Green.png")
				}},
				{ value : "HMI_CHILLER1", text : I18N.prop("HMI_CHILLER1"), imageUrl : getIconUrl("chiller1.png"), categoryName : "Null", className : "Image", images : {
					red : getIconUrl("chiller1_Red.png"), blue : getIconUrl("chiller1_Blue.png"), yellow : getIconUrl("chiller1_Yellow.png"),
					green : getIconUrl("chiller1_Green.png")
				}},
				{ value : "HMI_CHILLER2", text : I18N.prop("HMI_CHILLER2"),imageUrl : getIconUrl("chiller2.png"), categoryName : "Null", className : "Image", images : {
					red : getIconUrl("chiller2_Red.png"), blue : getIconUrl("chiller2_Blue.png"), yellow : getIconUrl("chiller2_Yellow.png"),
					green : getIconUrl("chiller2_Green.png")
				}},
				{ value : "HMI_GENERATOR", text : I18N.prop("HMI_GENERATOR"), imageUrl : getIconUrl("Generator/Generator1.png"), categoryName : "Generator",
					images : {
						gray_rotate: getIconUrl("Generator/Generator1_ani.gif"),
						red_stop : getIconUrl("Generator/Generator1_Red.png"), red_rotate : getIconUrl("Generator/Generator1_ani_Red.gif"),
						blue_stop : getIconUrl("Generator/Generator1_Blue.png"), blue_rotate : getIconUrl("Generator/Generator1_ani_Blue.gif"),
						green_stop : getIconUrl("Generator/Generator1_Green.png"), green_rotate : getIconUrl("Generator/Generator1_ani_Green.gif"),
						yellow_stop : getIconUrl("Generator/Generator1_Yellow.png"), yellow_rotate : getIconUrl("Generator/Generator1_ani_Yellow.gif")
					}
				},
				{ value : "HMI_TANK_GREY", text : I18N.prop("HMI_TANK"), imageUrl : getIconUrl("Tank/Tank_Grey.png"), categoryName : "Tank", images : tankImages,
				  oldImages : [getIconUrl("Tank/Tank_Blue.png"), getIconUrl("Tank/Tank_Red.png")]},
				  //oldImages는 바인딩 팝업 시, 이미지 Path를 읽어 Item을 찾는 과정에서 헤더에 아이콘을 표시하기 위하여 v1.0 이미지이다.
				{ value : "HMI_WATER_TANK", text : I18N.prop("HMI_WATER_TANK"), imageUrl : getIconUrl("WaterTank/WaterTank_Gray0.png"), categoryName : "WaterTank", images : waterTankImages },
				{ value : "HMI_GAUGE", text : I18N.prop("HMI_GAUGE"), imageUrl : getIconUrl("Guage_N_00.png"), categoryName : "Tank", images : gaugeImages },
				{ value : "HMI_METER", text : I18N.prop("HMI_METER"), imageUrl : getIconUrl("Meter_N_00.png"), categoryName : "Tank", images : meterImages }
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_POWER_LIGHTS"),
			groupName : "powerGraphicImage",
			className : "Animation",
			items : [
				{ value : "HMI_POWER_GRAPHIC_TRANSFORMER_1", text : I18N.prop("HMI_POWER_GRAPHIC_TRANSFORMER_1"), imageUrl : getIconUrl("Power/Transformer_N_OFF.png"), categoryName : "Default",
					images : transformerImages
				},
				{ value : "HMI_POWER_GRAPHIC_TRANSFORMER_2", text : I18N.prop("HMI_POWER_GRAPHIC_TRANSFORMER_2"), imageUrl : getIconUrl("Power/Transformer1_N_OFF.png"), categoryName : "Default",
					images : transformer2Images
				},
				{ value : "HMI_POWER_GRAPHIC_CONDENSOR", text : I18N.prop("HMI_POWER_GRAPHIC_CONDENSOR"), imageUrl : getIconUrl("Power/Condenser_N_OFF.png"), categoryName : "Default",
					images : condenserImages
				},
				{ value : "HMI_POWER_GRAPHIC_GROUND", text : I18N.prop("HMI_POWER_GRAPHIC_GROUND"), imageUrl : getIconUrl("Power/Ground_N_OFF.png"), categoryName : "Default",
					images : groundImages
				},
				{ value : "HMI_POWER_GRAPHIC_SWITCH", text : I18N.prop("HMI_POWER_GRAPHIC_SWITCH"), imageUrl : getIconUrl("Power/Switch_N_OFF.png"), categoryName : "Default",
					images : switchImages
				},
				{ value : "HMI_POWER_GRAPHIC_JUMPER", text : I18N.prop("HMI_POWER_GRAPHIC_JUMPER"), imageUrl : getIconUrl("Power/CB_N_OFF.png"), categoryName : "Default",
					images : cbImages
				},
				{ value : "HMI_POWER_GRAPHIC_TEXT", text : I18N.prop("HMI_POWER_GRAPHIC_TEXT"), imageUrl : getIconUrl("Power/Description_N_OFF.png"), categoryName : "Default",
					images : descriptionImages
				},
				{ value : "HMI_POWER_ALTS_ATS", text : I18N.prop("HMI_POWER_ALTS_ATS"), imageUrl : getIconUrl("Power/ALTS_N_OFF.png"), categoryName : "LED", className : "Animation",
					images : altsImages
				},
				{ value : "HMI_POWER_LBS", text : I18N.prop("HMI_POWER_LBS"), imageUrl : getIconUrl("Power/LBS_N_OFF.png"), categoryName : "LED", className : "Animation",
					images : lbsImages
				},
				{ value : "HMI_POWER_VCB", text : I18N.prop("HMI_POWER_VCB"), imageUrl : getIconUrl("Power/VCB_N_OFF.png"), categoryName : "LED", className : "Animation",
					images : vcbImages
				},
				{ value : "HMI_POWER_MCCB", text : I18N.prop("HMI_POWER_MCCB"), imageUrl : getIconUrl("Power/MCCB_N_OFF.png"), categoryName : "LED", className : "Animation",
					images : mccbImages
				},
				{ value : "HMI_POWER_ACB", text : I18N.prop("HMI_POWER_ACB"), imageUrl : getIconUrl("Power/ACB_N_OFF.png"), categoryName : "LED", className : "Animation",
					images : acbImages
				},
				{ value : "HMI_POWER_GRAPHIC_FLUORESCENT_LAMP", text : I18N.prop("HMI_POWER_GRAPHIC_FLUORESCENT_LAMP"), imageUrl : getIconUrl("Power/Light_Fluorescent_N_OFF.png"), categoryName : "LED", className : "Animation",
					images : fluLampImages
				},
				{ value : "HMI_INCANDESCENT_LIGHT", text : I18N.prop("HMI_INCANDESCENT_LIGHT"), imageUrl : getIconUrl("Power/Light_Incandescent_N_OFF.png"), categoryName : "LED", className : "Animation",
					images : incandescentLampImages
				},
				{ value : "HMI_OUTDOOR_LIGHT", text : I18N.prop("HMI_OUTDOOR_LIGHT"), imageUrl : getIconUrl("Power/Light_Outdoor_N_OFF.png"), categoryName : "LED", className : "Animation",
					images : outdoorLampImages
				},
				{ value : "HMI_POWER_GRAPHIC_FLUORESCENT_LAMP_DIMMING", text : I18N.prop("HMI_POWER_GRAPHIC_FLUORESCENT_LAMP_DIMMING"), imageUrl : getIconUrl("Power/Light_Fluorescent_N_00.png"), categoryName : "Dimming", className : "Animation",
					images : fluLampDimImages},
				{ value : "HMI_INCANDESCENT_LIGHT_DIMMING", text : I18N.prop("HMI_INCANDESCENT_LIGHT_DIMMING"), imageUrl : getIconUrl("Power/Light_Incandescent_N_00.png"), categoryName : "Dimming", className : "Animation",
					images : incandescentLampDimImages},
				{ value : "HMI_OUTDOOR_LIGHT_DIMMING", text : I18N.prop("HMI_OUTDOOR_LIGHT_DIMMING"), imageUrl : getIconUrl("Power/Light_Outdoor_N_00.png"), categoryName : "Dimming", className : "Animation",
					images : outdoorLampDimImages}
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_DEVICES"),
			groupName : "facilityGraphicAnimation",
			className : "Animation",
			items : [
				{ value : "HMI_SAC_INDOOR", text : I18N.prop("HMI_SAC_INDOOR"), imageUrl : getIconUrl("dvc630/dvc630-4way-per-off.png"), categoryName : "Indoor", className : "Indoor" },
				{ value : "HMI_SAC_INDOOR_SUMMARY", text : I18N.prop("HMI_SAC_INDOOR_SUMMARY"), imageUrl : getIconUrl("dvc630/dvc630-4way-per-off.png"), categoryName : "Indoor", className : "Indoor" },
				{ value : "HMI_SAC_INDOOR_GENERAL", text : I18N.prop("HMI_SAC_INDOOR_GENERAL"), imageUrl : getIconUrl("dvc630/dvc630-4way-per-off.png"), categoryName : "Indoor", className : "Indoor" },
				{ value : "HMI_MOTION_SENSOR", text : I18N.prop("HMI_MOTION_SENSOR"), imageUrl : getIconUrl("dvc630/dvc630-motionsensor-gray-off.png"), categoryName : "Coil", className : "Animation",
					images : motionSensorImages
				},
				{ value : "HMI_DOOR_SENSOR", text : I18N.prop("HMI_DOOR_SENSOR"), imageUrl : getIconUrl("dvc630/dvc630-doorsensor-gray-off.png"), categoryName : "Coil", className : "Animation",
					images : doorSensorImages
				},
				{ value : "HMI_TEMPERATURE_SENSOR", text : I18N.prop("HMI_TEMPERATURE_SENSOR"), imageUrl : getIconUrl("dvc630/dvc630-tempsensor-gray-on01.png"), categoryName : "Tank", className : "Animation",
					images : temperatureSensorImages },
				{ value : "HMI_HUMIDITY_SENSOR", text : I18N.prop("HMI_HUMIDITY_SENSOR"), imageUrl : getIconUrl("dvc630/dvc630-humsensor-gray-on01.png"), categoryName : "Tank", className : "Animation",
					images : humiditySensorImages }
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_STATISTICS"),
			groupName : "statistics",
			items : [
				{ value : "facilityOperation", text : I18N.prop("HMI_STATISTICS_INDOOR"), imageUrl : getIconUrl("Chart/chart_indoor.png"), categoryName : "Null", className : "StatisticsFacilityOperation" },
				{ value : "buildingOperationStatus", text : I18N.prop("HMI_STATISTICS_INDOOR_BUILDING"), imageUrl : getIconUrl("Chart/chart_indoor_building.png"), categoryName : "Building", className : "StatisticsBuildingOperation" }
			]
		},
		{
			text : I18N.prop("HMI_ELEMENT_MISC"),
			groupName : "facilityGraphicAnimation",
			className : "Animation",
			items : [
				{ value : "HMI_WIND_1", text : I18N.prop("HMI_WIND_1"), imageUrl : getIconUrl("wind/wind1/wind1HorzLIcon.jpg"), categoryName : "Wind", images : { on: getIconUrl("wind/wind1/ani/wind1HorzL1.gif")} },
				{ value : "HMI_WIND_2", text : I18N.prop("HMI_WIND_2"), imageUrl : getIconUrl("wind/wind2/wind2HorzIcon.jpg"), categoryName : "Wind", images : { on: getIconUrl("wind/wind2/ani/wind2Horz1.gif")} },
				{ value : "HMI_WIND_3", text : I18N.prop("HMI_WIND_3"), imageUrl : getIconUrl("wind/wind3/wind3HorzLIcon.jpg"), categoryName : "Wind", images : { on: getIconUrl("wind/wind3/ani/wind3HorzL1.gif")} },
				{ value : "HMI_WIND_4", text : I18N.prop("HMI_WIND_4"), imageUrl : getIconUrl("wind/wind4/wind4HorzL5.png"), categoryName : "Wind", images : { on: getIconUrl("wind/wind4/ani/wind4HorzL1.gif")} },
				{ value : "HMI_STEAM_L", text : I18N.prop("HMI_STEAM_L"), imageUrl : getIconUrl("Steam/Steam_L_N.png"), categoryName : "Steam", images : { on : getIconUrl("Steam/ani/Steam_L.gif")} },
				{ value : "HMI_STEAM_R", text : I18N.prop("HMI_STEAM_R"), imageUrl : getIconUrl("Steam/Steam_R_N.png"), categoryName : "Steam", images : { on : getIconUrl("Steam/ani/Steam_R.gif")} },
				{ value : "HMI_ARROW_GRAY", text : I18N.prop("HMI_ARROW"), imageUrl : getIconUrl("Arrow/arrow_gray.png"), categoryName : "Null", className : "Image", images : {
					red : getIconUrl("Arrow/arrow_red.png"), blue : getIconUrl("Arrow/arrow_blue.png"), yellow : getIconUrl("Arrow/arrow_yellow.png"),
					green : getIconUrl("Arrow/arrow_green.png")
				}},
				{ value : "HMI_ARROW_GRAY_L", text : I18N.prop("HMI_ARROW_L"), imageUrl : getIconUrl("Arrow/arrow_gray_L.png"), categoryName : "Null", className : "Image",images : {
					red : getIconUrl("Arrow/arrow_red_L.png"), blue : getIconUrl("Arrow/arrow_blue_L.png"), yellow : getIconUrl("Arrow/arrow_yellow_L.png"),
					green : getIconUrl("Arrow/arrow_green_L.png")
				}}
			]
		}
	];

	var indoorModeImages = {
		Cool : getIconUrl("ic-cool.png"),
		Auto : getIconUrl("ic-auto.png"),
		Heat : getIconUrl("ic-heat.png"),
		Dry: getIconUrl("ic-dry.png"),
		Fan: getIconUrl("ic-fan.png"),
		Off: getIconUrl("ic-attention.png"),
		CoolStorage: getIconUrl("ic-coolwater.png"),
		HotWater: getIconUrl("ic-hotwater.png"),
		HeatExchange : getIconUrl("ic-heat-ex.png"),
		ByPass : getIconUrl("ic-heat-bypass.png"),
		Sleep : getIconUrl("ic-heat-sleep.png"),
		Eco : getIconUrl("ic-dhw-eco.png"),
		Standard : getIconUrl("ic-dhw-standard.png"),
		Power : getIconUrl("ic-dhw-power.png"),
		Force : getIconUrl("ic-dhw-force.png")
	};

	var deviceStatusColors = {
		"normal-on" : "rgb(26,160,90)",
		"normal-off" : "#b2b2b2",
		"alarm-warning" : "rgb(255,164,31)",
		"alarm-critical" : "rgb(239,43,43)"
	};

	var indoorDeviceImages = {
		"Cassette1Way" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-1way-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-1way-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-1way-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-1way-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-1way-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-1way-fro-off.png")
			}
		},
		"Cassette2Way" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-2way-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-2way-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-2way-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-2way-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-2way-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-2way-fro-off.png")
			}
		},
		"Cassette4Way" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-4way-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-4way-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-4way-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-4way-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-4way-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-4way-fro-off.png")
			}
		},
		"Cassette360" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-360-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-360-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-360-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-360-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-360-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-360-fro-off.png")
			}
		},
		"Bottom" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-bottom-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-bottom-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-bottom-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-bottom-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-bottom-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-bottom-fro-off.png")
			}
		},
		"PAC" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-pac-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-pac-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-pac-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-pac-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-pac-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-pac-fro-off.png")
			}
		},
		"Duct" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-duct_fresh-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-duct_fresh-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-duct_fresh-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-duct_fresh-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-duct_fresh-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-duct_fresh-fro-off.png")
			}
		},
		"Chiller" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-chiller-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-chiller-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-chiller-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-chiller-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-chiller-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-chiller-fro-off.png")
			}
		},
		"ERV" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-erv-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-erv-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-erv-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-erv-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-erv-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-erv-fro-off.png")
			}
		},
		"Ceiling" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ceiling-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ceiling-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ceiling-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ceiling-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ceiling-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ceiling-fro-off.png")
			}
		},
		"Console" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-console-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-console-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-console-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-console-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-console-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-console-fro-off.png")
			}
		},
		"AHU" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ahu-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ahu-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ahu-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ahu-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ahu-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ahu-fro-off.png")
			}
		},
		"FCUKit" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-fcu-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-fcu-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-fcu-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-fcu-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-fcu-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-fcu-fro-off.png")
			}
		},
		"Single" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs-fro-off.png")
			}
		},
		"DVMHE" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs_dvm-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs_dvm-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs_dvm-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs_dvm-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs_dvm-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs_dvm-fro-off.png")
			}
		},
		"DVMHT" : {
			"Top" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs_s-top-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs_s-top-off.png")
			},
			"Perspective" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs_s-per-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs_s-per-off.png")
			},
			"Front" : {
				"normal-on" : getIconUrl("/dvc630/dvc630-ehs_s-fro-on.png"),
				"normal-off" : getIconUrl("/dvc630/dvc630-ehs_s-fro-off.png")
			}
		}
	};

	var getPaletteDataSource = function(){
		var i, j, length, max = paletteDataSource.length;
		var data, items, item, className, categoryName, groupName;
		var asyncArr = [], image, dfd;
		var funcDeferred = new $.Deferred();
		var results = [];
		for( i = 0; i < max; i++ ){
			data = paletteDataSource[i];
			if(data.groupName == "basicShape") continue;
			results.push(paletteDataSource[i]);
		}

		for( i = 0; i < max; i++ ){
			data = paletteDataSource[i];
			className = data.className;
			categoryName = data.categoryName;
			groupName = data.groupName;
			items = data.items;
			length = items.length;
			for( j = 0; j < length; j++ ){
				item = items[j];
				if(!item.className) item.className = className;
				if(!item.categoryName) item.categoryName = categoryName;
				item.groupName = groupName;
				image = new Image();
				dfd = new $.Deferred();
				item.addBuildDateQueryUrl = Util.addBuildDateQuery(item.imageUrl);
				image.src = Util.addBuildDateQuery(item.imageUrl);
				image.onload = imageOnLoad.bind(image, item, dfd);
				image.onerror = imageOnError.bind(image, item, dfd);
				asyncArr.push(dfd);
			}
		}
		$.when.apply(this, asyncArr).always(function(){
			max = results.length;
			for( i = 0; i < max; i++ ){
				items = results[i].items;
				items.sort(function(a, b){
					a = a.text;
					b = b.text;
					return a.localeCompare(b);
				});
			}
			funcDeferred.resolve(results);
		});
		return funcDeferred.promise();
	};

	var imageOnLoad = function(item, dfd){
		item.imageWidth = this.width;
		item.imageHeight = this.height;
		dfd.resolve();
	};

	var imageOnError = function(item, dfd){
		item.imageWidth = 50;
		item.imageHeight = 50;
		dfd.resolve();
	};

	var getData = function(value, dataSource){
		if(!dataSource) dataSource = paletteDataSource;
		if(dataSource instanceof kendo.data.DataSource) dataSource = dataSource.data();

		var i, j, length, max = dataSource.length, data, items, item;
		for( i = 0; i < max; i++ ){
			data = dataSource[i];
			items = data.items;
			length = items.length;
			for( j = 0; j < length; j++ ){
				item = items[j];
				if(item.value == value) return item;
			}
		}
		return null;
	};

	var getDataWithImagePath = function(path, dataSource){
		if(!dataSource) dataSource = paletteDataSource;
		if(dataSource instanceof kendo.data.DataSource) dataSource = dataSource.data();

		var i, j, k, key, length, size, max = dataSource.length, data, items, item, images, oldImages;

		//이미지 경로 변경으로 인하여 예외처리. 해당 이미지 파일을 경로에 포함하고 있으면 리턴한다.
		if(path){
			if(path.indexOf("../asset/icons") != -1) path = path.replace("../asset/icons", "");
			else if(path.indexOf("../../src/main/resources/static-dev/asset/icons") != -1) path = path.replace("../../src/main/resources/static-dev/asset/icons", "");
			else if(path.indexOf("../../src/main/resources/static-dev/images/icon") != -1) path = path.replace("../../src/main/resources/static-dev/images/icon", "");
		}

		for( i = 0; i < max; i++ ){
			data = dataSource[i];
			items = data.items;
			length = items.length;
			for( j = 0; j < length; j++ ){
				item = items[j];
				images = item.images;
				if(item.imageUrl.indexOf(path) != -1) return item;
				for( key in images ){
					if(images[key].indexOf(path) != -1) return item;
				}
				//v1.0 Red, Blue Tank를 찾기 위한 코드 추가
				oldImages = item.oldImages;
				if(oldImages){
					size = oldImages.length;
					for( k = 0; k < size; k++ ){
						if(oldImages[k].indexOf(path) != -1) return item;
					}
				}
			}
		}
		return null;
	};

	var getColorFromPath = function(currentPath, hasState){
		var color = "";
		var path = currentPath.toUpperCase();
		if(path.indexOf("BLUE") != -1) color = "blue";
		else if(path.indexOf("GREEN") != -1) color = "green";
		else if(path.indexOf("RED") != -1) color = "red";
		else if(path.indexOf("YELLOW") != -1) color = "yellow";
		else if((path.indexOf("GRAY") != -1) || (path.indexOf("GREY") != -1)) color = "gray";
		else if(hasState) color = "gray";
		return color;
	};

	var getStateImage = function(item, state, currentPath, graphicColor, canvasVersion){
		var imageUrl = item.imageUrl;
		var otherImages = item.images;
		var categoryName = item.categoryName;
		var color;
		var canvas = item.canvas;

		if(currentPath){	//모니터링 시 넘어오는 파라미터.
			if(HmiUtil.hasColorGraphic(item)){
				if(!graphicColor)color = getColorFromPath(currentPath, state);
				else color = graphicColor;
				if(color) state = color + "_" + state;
			}
		}else if(state && graphicColor){	//그래픽 바인딩 시
			state = graphicColor + "_" + state;
		}else if(graphicColor){		//그래픽 바인딩 시
			state = graphicColor;
		}

		//1. color 값이 존재하지 않을 경우 state 또는 graphicColor가 존재하면 graphicColor를 키로 읽는다.
		//2. graphicColor 파라미터 또는 전달 받은 currentPath를 파싱하여 컬러 값이 존재할 경우 {color}_{state}로 읽는다.
		if(otherImages && otherImages[state]){
			imageUrl = otherImages[state];
		}

		//1.0 버전일 경우 /asset/의 이미지를 가리키도록 한다.
		if(canvasVersion == HmiCommon.INITIAL_HMI_VERSION && HmiUtil.isLegacyGraphic(currentPath)){
			//1.0에서 Coil은 Off 일 경우 v1.1에서의 Default 색상인 회색 이미지이다.
			if(categoryName == "Coil" && state == "off") imageUrl = item.imageUrl;

			imageUrl = imageUrl.replace("/images/icon", "/asset/icons");
		}

		return imageUrl;
	};

	return {
		paletteDataSource : paletteDataSource,
		getPaletteDataSource : getPaletteDataSource,
		getData : getData,
		getDataWithImagePath : getDataWithImagePath,
		getStateImage : getStateImage,
		getIconUrl : getIconUrl,
		getColorFromPath : getColorFromPath,
		indoorModeImages : indoorModeImages,
		deviceStatusColors : deviceStatusColors,
		indoorDeviceImages : indoorDeviceImages
	};
});
//# sourceURL=hmi/config/palette-config.js
