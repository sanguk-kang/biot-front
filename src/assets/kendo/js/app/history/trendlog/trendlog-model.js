define("history/trendlog/trendlog-model", function(){
	"use strict";

	var d3 = window.d3;
	// var moment = window.moment;		//[2018-04-12][미사용 변수 주석처리]
	var kendo = window.kendo;
	var I18N = window.I18N;
	var Util = window.Util;

	//레전드 1개의 너비/높이
	var containerWidth = 118;
	var containerHeight = 24;
	var containerCenterX = containerWidth / 2;
	var containerCenterY = containerHeight / 2;

	//Line Dash 타입
	var dashTypes = [
		[0,0], [25,5], [40, 8], [12, 6], [6,4], [2,4],
		[10,4,2,4], [8,4,4,4], [8,4,8,4,23,4], [3,4,25,4], [4, 10, 15, 10], [2,3,2,3,30,2]
	];

	// var colorModel = [];		//[2018-04-12][미사용 변수 주석처리]

	var shapes = [];

	var colors = ["#2c81db", "#08b5d4", "#68ba11", "#feac5a", "#f0824f", "#eb5b6c", "#33cc00", "#99cc99", "#3300cc", "#9900cc", "#ff3366", "#cc9900"];

	var createMultiDetailModel = function(dom, data){
		// console.log(data);
		var str = "";

		for(var i = 0; i < data.length; ++i){
			var propertiesCnt = 0;
			for(var a = 0; a < data[i].devices.length; ++a){
				propertiesCnt += data[i].devices[a].dms_trendLogs_properties_list_keys.length;
			}

			str +=
			"<li class='opened trendlog-collapse' style='border-bottom-width:2px;border-bottom-style:solid;border-bottom-color:rgb(222, 222, 222);padding-bottom:15px;'>" +
				"<a class='subjectBox'>" +
					"<div id='trendlog-details-name' class='name'>" + data[i].name + "</div>" +
					"<div id='trendlog-details-status' class='status'>" + (data[i].enabled ? "Operating" : "Pause") + "</div>" +
					"<div class='added'><button type='button' data-id='" + data[i].id + "' class='trendlog-details-icon commonBtn icOnly ic " + (data[i].enabled ? "ic-action-play" : "ic-action-pause")  + "'></button></div>" +
					"<div class='added'><span id='trendlog-expander' class='k-icon t-i-expand'></span></div>" +
				"</a>" +
				"<div class='dvcList' style='display: block;'>" +
					"<div>" +
						"<div class='popScroller mCustomScrollbar _mCS_6 mCS-autoHide mCS_no_scrollbar'>" +
							"<div id='mCSB_6' class='mCustomScrollBox mCS-light mCSB_vertical mCSB_inside' tabindex='0' style='max-height: none;'>" +
								"<div id='mCSB_6_container' class='mCSB_container mCS_y_hidden mCS_no_scrollbar_y' style='position:relative; top:0; left:0;' dir='ltr'>" +
									"<div class='detailBox'>" +
										"<ul class='statusList'>" +
											"<li>" +
												"<div class='name btxt' style='width:210px;'>Last update</div>" +
												"<div id='trendlog-details-lastupdate' class='detail' style='width:210px;'></div>" +
											"</li>" +
											"<li>" +
												"<div class='name btxt' style='width:210px;'>Log interval</div>" +
												"<div id='trendlog-details-loginterval' class='detail' style='width:210px;'></div>" +
											"</li>" +
											"<li style='padding-bottom:0px;'>" +
												"<div class='name btxt' style='width:210px;vertical-align:top;'>Logging property</div>" +
												"<div id='trendlog-details-total' class='detail' style='border-bottom-width: 2px;border-bottom-style: solid;border-bottom-color:rgb(222, 222, 222);padding-bottom:15px;'>Total (" + propertiesCnt + ")" +
												"</div>" +
											"</li>" +
											"<li class='dvc' style='padding-top:0px;'>" +
												"<div class='name btxt' style='width:210px;vertical-align:top;'>" +
												"</div>" +
												"<div class='detail' style='vertical-align:top;'>" +
													"<ul id='trendlog-details-ul' class='dvcDetailList'>";

			var devices = data[i].devices;
			for(var j = 0; j < devices.length; ++j){
				str +=
					"<li class='opened trendlog-collapse-child' style='border-bottom-width:2px;border-bottom-style:solid;border-bottom-color:rgb(222, 222, 222);padding-bottom:15px;'>" +
						"<a class='subjectBox'>" +
							"<div class='blank'></div>" +
							"<div class='name'>" + devices[j].dms_devices_name + "</div>" +
							"<div class='added'><span id='trendlog-expander-child' class='k-icon t-i-expand'></span></div>" +
						"</a>" +
						"<div class='dvcList-child' style='display: block;'>" +
							"<div class='subjectBox'>" +
								"<div class='icon' style='padding-right:40px;'>Property</div>" +
								"<div class='name'>";
				for(var k = 0; k < devices[j].dms_trendLogs_properties_list_keys.length; ++k){
					if(k != 0){
						str += ", ";
					}
					str += getPropertiesNameByKey(devices[j].dms_trendLogs_properties_list_keys[k]);
				}
				str +=
								"</div>" +
							"</div>" +
						"</div>" +
					"</li>";
			}
			str +=
													"</ul>" +
												"</div>" +
											"</li>" +
										"</ul>" +
									"</div>" +
								"</div>" +
							"</div>" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</li>";
		}

		dom.append(str);
	};

	var createDetailModel = function(dom, data){

		var str = "";

		// console.log(data);
		var devices = data.devices;

		for(var i = 0; i < devices.length; ++i){

			str +=
				"<li class='opened trendlog-collapse' style='border-bottom-width:2px;border-bottom-style:solid;border-bottom-color:rgb(222, 222, 222);padding-bottom:15px;'>" +
					"<a class='subjectBox'>" +
						"<div class='blank'></div>" +
						"<div class='name'>" + devices[i].dms_devices_name + "</div>" +
						"<div class='added'><span id='trendlog-expander' class='k-icon t-i-expand'></span></div>" +
					"</a>" +
					"<div class='dvcList' style='display: block;'>" +
						"<div class='subjectBox'>" +
							"<div class='icon' style='padding-right:40px;'>" + I18N.prop("FACILITY_TRENDLOG_PROPERTY") + "</div>" +
							"<div class='name'>";
			for(var j = 0; j < devices[i].dms_trendLogs_properties_list_keys.length; ++j){
				if(j != 0){
					str += ", ";
				}
				str += getPropertiesNameByKey(devices[i].dms_trendLogs_properties_list_keys[j]);
			}
			str +=
							"</div>" +
						"</div>" +
					"</div>" +
				"</li>";
		}

		dom.append(str);

	};

	var propertiesModel;

	var setPropertiesModel = function(data){
		propertiesModel = data;
	};

	// var getPropertiesNameByKey = function(key){		//[2018-04-12][동일이름으로 함수가 존재 해당함수주석처리]
	// 	var i;	//[2018-04-12][for문에서 사용시 초기화하기에 i를 상위선언]
	// 	for(var j = 0; j < propertiesModel.length; ++j){
	//     	var list = propertiesModel[j].list;
	//     	var properties = propertiesModel[j].properties;
	//
	//     	if(list){
	//     		for(i = 0; i < list.length; ++i){
	//     			if(key == list[i].key){
	//     				return list[i].name;
	//     			}
	//     		}
	//     	}
	//
	//     	if(properties){
	//     		for(i = 0; i < properties.length; ++i){
	//     			if(key == properties[i].key){
	//     				return properties[i].name;
	//     			}
	//     		}
	//     	}
	// 	}
	//
	// 	return "";
	// };

	//[2018-05-09][기존 trendlog.js setHistoryGrid함수 rowTemplate 사용하던 로직을 함수로 만들어 그리드생성과 ExcelExport에 사용하도록 수정]
	/**
	*   <ul>
	*   	<li>로깅속성과 속성값을 받아 조건값에 해당하는 로직에 다국어 처리를 하여 문자열을 넘겨주는 함수 </li>
	*   </ul>
	*   @function getPropertyValue
	*   @param {String} property - 속성
	*   @param {String} value - 속상값
	*   @returns {String} i18nVal
	*   @alias module:app/history/trendlog/trendlog-model
	*/
	var getPropertyValue = function(property,value){
		var i18nVal;
		var upperValue;			//[2018-04-13][i18nVal 상위에 이미선언 var i18nVal 제거]
		if(typeof value === "string"){
			upperValue = value.toUpperCase();
		}else{
			return '-';
		}

		if(property.indexOf("fan_speed") != -1){
			i18nVal = I18N.prop("FACILITY_INDOOR_CONTROL_" + upperValue);
		}else if(property.indexOf("sac_indoor:") != -1 || property.indexOf("sac_outdoor:") != -1){
			if(value === true || value === "true") i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_ON");
			else if(value === false || value === "false") i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_OFF");
			else i18nVal = I18N.prop("FACILITY_INDOOR_MODE_" + upperValue);
		}else if(property == "device:status"){
			i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_" + upperValue);
		}else if(property == "light:power" != -1){
			// if(value == "1.0" || value == "1"  || value == true || value == "true") i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_ON");
			// else if(value == "0.0" || value == "0" || value == false || value == "false") i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_OFF");
			if(value === true || value === "true") i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_ON");
			else if(value === false || value === "false") i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_OFF");
		}else if(property == "device_sensor_motion:detected"){
			if(value === true || value === "true") i18nVal = I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_PRESENCE");
			else if(value === false || value === "false") i18nVal = I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_ABSENCE");
		}
		value = Util.convertNumberFormat(value);

		return i18nVal ? i18nVal : value;
	};

	var getPropertiesNameByKey = function(key){
		var i;	//[2018-04-12][for문에서 사용시 초기화하기에 i를 상위선언]
		for(var j = 0; j < propertiesModel.length; ++j){
			var list = propertiesModel[j].list;
			var properties = propertiesModel[j].properties;

			if(list){
				for(i = 0; i < list.length; ++i){
					if(key == list[i].key){
						return list[i].name;
					}
				}
			}

			if(properties){
				for(i = 0; i < properties.length; ++i){
					if(key == properties[i].key){
						return properties[i].name;
					}
				}
			}
		}

		return "";
	};

	//뷰 시작
	var appendSVG = function(i, j){

	  //도형 Polygon Point 좌표
	   shapes = [
			//원
			{ type : "circle", cx : containerCenterX, cy : 12, r : 6 },
			//삼각형
			{ type : "polygon", points : [{x : containerCenterX - 6, y : 16}, {x : containerCenterX, y : 4}, { x: containerCenterX + 6, y : 16}]},
			//사각형
			{ type : "rect", x : containerCenterX - 5, y : containerCenterY - 6, width : 10, height : 10},
			//마름모
			{ type : "polygon", points : [{x : containerCenterX - 6, y : 11}, {x : containerCenterX, y : 5}, { x: containerCenterX + 6, y : 11}, { x: containerCenterX, y : 17}]},
			//육각형
			{ type : "polygon", points : [{x : containerCenterX - 5, y : containerCenterY - 4}, {x : containerCenterX, y : containerCenterY - 7}, {x : containerCenterX + 5, y : containerCenterY - 4},{x : containerCenterX + 5, y : containerCenterY + 2},{x : containerCenterX, y : containerCenterY + 5},{x : containerCenterX - 5, y : containerCenterY + 2}]},
			//별
			{ type : "polygon", points : starPoints(containerCenterX, containerCenterY, 5, 8, 4), transform : "rotate(-16,55,10)"},
			//오각형
			{ type : "polygon", points : [{x : containerCenterX - 7, y : containerCenterY - 3}, {x : containerCenterX, y : containerCenterY - 9}, {x : containerCenterX + 7, y : containerCenterY - 3},{x : containerCenterX + 4, y : containerCenterY + 5},{x : containerCenterX - 4, y : containerCenterY + 5}]},
			//역삼각형
			{ type : "polygon", points : [{x : containerCenterX - 6, y : 5}, {x : containerCenterX, y : 17}, { x: containerCenterX + 6, y : 5}]},
			//별 (4포인트)
			{ type : "polygon", points : starPoints(containerCenterX, containerCenterY, 4, 8, 3), transform : "rotate(-44,58,12)"},
			//별 (3포인트)
			{ type : "polygon", points : starPoints(containerCenterX, containerCenterY, 3, 8, 2), transform : "rotate(-90, 58, 12)"},
			//역 5각형
			{ type : "polygon", points : [{x : containerCenterX + 3, y : containerCenterY - 7},{x : containerCenterX - 5, y : containerCenterY - 7}, {x : containerCenterX - 8, y : containerCenterY + 1}, {x : containerCenterX - 1, y : containerCenterY + 7}, {x : containerCenterX + 6, y : containerCenterY + 1}]},
			//별 (6포인트)
			{ type : "polygon", points : starPoints(containerCenterX, containerCenterY, 6, 8, 3), transform : "rotate(-90, 58, 12)"}
		];

		var domStr = "svg-appender-" + i + "-" + j;
		var dom = $("#" + domStr);
		var div = $("<div/>").addClass("lines");
		div.appendTo(dom);

		//Draw a line
		var selector = d3.select("#" + domStr + " .lines");

		// var dashType, i, max = dashTypes.length;		[2018-04-12][dashType,max 는 미사용, i는 선언후 빈값이다 아래에 코드부분에 colors가 i로 배열을 찾아갈떄 사용되는데 선언만한 undefined로 찾아가면 에러가 발생하고 상위에 파라메타로 이미 받는부분이있어 해당 i는 의미없다고 판단 주석처리 ]
		var svgElemSelector, color, shape, dash;

		color = colors[i];
		dash = dashTypes[j];
		if(dash){
			svgElemSelector = createLineLegend({ selector : selector,
				width : containerWidth, height : containerHeight,
				lineWidth : 2,
				lineColor : color,
				dashType : dash});
		}

		shape = shapes[j];
		if(shape){
			createShapeLegend({ selector : svgElemSelector,
				shape : shape,
				lineColor : color, shapeColor : color,
				lineWidth : 0});
		}

	};

	var appendMarker = function(color, j, rect){
		if(j == 0 || j){
		  return createShapeLegendGraph({
						  j : j,
						  rect: rect,
						  lineColor : color,
						  shapeColor : color,
						  lineWidth : 0});
		}
	  };

	//별 모양 Polygon 좌표 생성
	var starPoints = function(centerX, centerY, arms, outerRadius, innerRadius){

	   var results = [];
	   var point;
	   var angle = Math.PI / arms;

	   for (var i = 0; i < 2 * arms; i++){
		  // Use outer or inner radius depending on what iteration we are in.
		  var r = (i & 1) == 0 ? outerRadius : innerRadius;

		  var currX = centerX + Math.cos(i * angle) * r;
		  var currY = centerY + Math.sin(i * angle) * r;

		  // Our first time we simply append the coordinates, subsequet times
		  // we append a ", " to distinguish each coordinate pair.
		   point = {
			   x : currX,
			   y : currY
		   };
		   results.push(point);
	   }

	   return results;
	};

	//references
	//https://www.dashingd3js.com/svg-paths-and-d3js
	//https://github.com/d3/d3-shape/blob/master/README.md#line_curve
	var lineFunc = d3.line().x(function(d){return d.x;})
		.y(function(d){return d.y;}).curve(d3.curveLinear);

	var createLineLegend = function(arg){
		var selector = arg.selector, width = arg.width, height = arg.height,
			color = arg.lineColor, strokeWidth = arg.lineWidth, dashType = arg.dashType;

		//직선을 가운데 렌더링
		var centerY = height / 2 - strokeWidth / 2;
		var lineData = [{ x: 0, y: centerY}, { x: width, y: centerY}];

		var svgContainer = selector.
			append("svg").classed("svg-line-legends", true)
			.attr("width", width).attr("height", height);

		svgContainer.append("path").attr("d", lineFunc(lineData))		//[2018-04-13][변수선언후 미사용 되어있다 할당없이 svgContainer.append 실행시키면될거라고 판단 line 변수제거]
								  .attr("stroke", color)
								  .attr("stroke-width", strokeWidth)
								  .attr("stroke-dasharray", dashType.join(","))
								  .attr("fill", "none");


		return svgContainer;
	};

	var createShapeLegend = function(arg){
		var selector = arg.selector, shape = arg.shape, strokeWidth = arg.lineWidth,
			lineColor = arg.lineColor, shapeColor = arg.shapeColor;

		var shapeElem, type = shape.type, transform = shape.transform;
		if(type == "circle"){
			var cx = shape.cx, cy = shape.cy, r = shape.r;
			shapeElem = selector.append("circle")
								  .attr("cx", cx).attr("cy", cy).attr("r", r)
								  .attr("stroke", lineColor).attr("stroke-width", strokeWidth)
								  .attr("fill", shapeColor);
		}else if(type == "rect"){
			var x = shape.x, y = shape.y, width = shape.width, height = shape.height;
			shapeElem = selector.append("rect")
								  .attr("x", x).attr("y", y).attr("width", width).attr("height", height)
								  .attr("stroke", lineColor).attr("stroke-width", strokeWidth)
								  .attr("fill", shapeColor);
		}else{
			var points = shape.points;
			points = points.map(function(d){
				return [d.x, d.y].join(",");
			}).join(" ");
			shapeElem = selector.append("polygon")
								  .attr("points", points)
								  .attr("stroke", lineColor).attr("stroke-width", strokeWidth)
								  .attr("fill", shapeColor);
		}
		if(transform){
			shapeElem.attr("transform", transform);
		}

		return shapeElem;
	};

	var createShapeLegendGraph = function(arg){
		var j = arg.j, rect = arg.rect, shapeColor = arg.shapeColor;
		// var strokeWidth = arg.lineWidth, lineColor = arg.lineColor;		//[2018-04-13][변수선언후 미사용]
		var drawing = kendo.drawing;
		var geometry = kendo.geometry;

		var center = rect.center();

		var centerX = center.x;				//[2018-04-13][동일한 변수명으로 상위 전역변수가 선언되어있음 containerCenterX -> centerX 수정]
		var centerY = center.y - 10;		//[2018-04-13][동일한 변수명으로 상위 전역변수가 선언되어있음 containerCenterY -> centerY 수정]

		//별도의 shape임
		var shapesArr = [						//[2018-04-13][동일한 변수명으로 상위 전역변수가 선언되어있음 shapes -> shapesArr 수정]
			//원
			{ type : "circle", cx : centerX, cy : centerY + 10, r : 6 },
			//삼각형
			{ type : "polygon", points : [{x : centerX - 6, y : centerY + 16}, {x : centerX, y : centerY + 4}, { x: centerX + 6, y : centerY + 16}]},
			//사각형
			{ type : "rect", x : centerX - 5, y : centerY + 5, width : 10, height : 10},
			//마름모
			{ type : "polygon", points : [{x : centerX - 6, y : centerY + 11}, {x : centerX, y : centerY + 5}, { x: centerX + 6, y : centerY + 11}, { x: centerX, y : centerY + 17}]},
			//육각형
			{ type : "polygon", points : [{x : centerX - 5, y : centerY - 4 + 11}, {x : centerX, y : centerY - 7 + 11}, {x : centerX + 5, y : centerY - 4 + 11},{x : centerX + 5, y : centerY + 12},{x : centerX, y : centerY + 15},{x : centerX - 5, y : centerY + 12}]},
			//별
			{ type : "polygon", points : starPoints(centerX, centerY + 10, 5, 8, 4), transform : -16},
			//오각형
			{ type: "polygon", points: [{ x: centerX - 7, y: centerY - 3 + 11 }, { x: centerX, y: centerY - 9 + 11 }, { x: centerX + 7, y: centerY - 3 + 11 }, { x: centerX + 4, y: centerY + 5 + 11 }, { x: centerX - 4, y: centerY + 5 + 11}]},
			//역삼각형
			{ type : "polygon", points : [{x : centerX - 6, y : centerY + 5}, {x : centerX, y : centerY + 17}, { x: centerX + 6, y : centerY + 5}]},
			//별 (4포인트)
			{ type: "polygon", points: starPoints(centerX, centerY + 16, 4, 8, 3), transform : -44},
			//별 (3포인트)
			{ type: "polygon", points: starPoints(centerX - 8, centerY, 3, 8, 2), transform : -90},
			//역 5각형
			{ type: "polygon", points: [{ x: centerX + 3, y: centerY - 7 + 10 }, { x: centerX - 5, y: centerY - 7 + 10 }, { x: centerX - 8, y: centerY + 1 + 10 }, { x: centerX - 1, y: centerY + 7 + 10 }, { x: centerX + 6, y: centerY + 1 + 10 }]},
			//별 (6포인트)
			{ type: "polygon", points: starPoints(centerX - 10, centerY, 6, 8, 3), transform : -90}
		];

		var shape = shapesArr[j];

		//[2018-04-13][하단에 동일한 변수명 존재 해당변수는 하단 동일변수에 재할당하기전까지 미사용 불필요하다고 판단 주석처리]
		// var path = new drawing.Path({
		// 	fill: {
		//     	color : lineColor
		//     },
		// 	stroke: {
		//     	color: lineColor
		//     }
		// });


		var type = shape.type, transform = shape.transform;
		// var shapeElem;		//[2018-04-13][변수선언후 미사용]
		var imageRect;			//[2018-04-13][아래 if문에 중복선언을 막기위해 상위에선언]
		if(type == "circle"){
			imageRect = new drawing.Circle(new geometry.Circle(
				[shape.cx, shape.cy],
				shape.r),
			{
				fill: {
					color : shapeColor
				},
				stroke: {
					color : shapeColor
				}
			}
			);
			return imageRect;
		}else if(type == "rect"){
			var DrawingPathFromRect = drawing.Path.fromRect;			//[2018-04-13][생성자 대문자 문제를 해결하기위해 임시방편으로 해결]
			imageRect = new DrawingPathFromRect(new geometry.Rect(
				new geometry.Point(shape.x, shape.y),
				new geometry.Size(shape.width, shape.height)),
			{
				fill: {
					color : shapeColor
				},
				stroke: {
					color : shapeColor
				}
			}
			);
			return imageRect;
		}
		var points = shape.points;


		var path = new drawing.Path({		//[2018-04-13][함수내에 상위에 동일한 변수명이 선언 할당된값은 다름 하지만 상위에 path 는 하단에 path에 값을 재할당 전까지 미사용 상위에 내용을 주석처리함]
			fill: {
				color : shapeColor
			},
			stroke: {
				color : shapeColor
			}
		});

		for(var i = 0; i < points.length; ++i){
			if(i == 0){
				path.moveTo(points[i].x, points[i].y);
			}
			path.lineTo(points[i].x, points[i].y);
		}


		path.close();
		if(transform){
			path.transform(geometry.transform().rotate(transform,[rect.origin.x, rect.origin.y]));
		}
		return path;
	};

	var createHistoryPanelNameModel = function(dom, devices){

		var str = "";
		dom.empty();

		for(var i = 0; i < devices.length; ++i){
			str += "<li><span class='disc' style='background-color:" + colors[i] + "'></span>" + devices[i].dms_devices_name + "</li>";
		}

		dom.append(str);
	};

	var createHistoryPanelPropertyModel = function(dom, devices, historyChartColorShapeModel){

		var str = "";
		dom.empty();
		historyChartColorShapeModel = [];
		var deviceId, propertyName, i18nVal;
		for(var i = 0; i < devices.length; ++i){
			for(var j = 0; j < devices[i].dms_trendLogs_properties_list_keys.length; ++j){
				propertyName = getPropertiesNameByKey(devices[i].dms_trendLogs_properties_list_keys[j]);
				i18nVal = I18N.prop("FACILITY_TRENDLOG_PROPERTY_" + propertyName.toUpperCase());
				propertyName = i18nVal ? i18nVal : propertyName;
				deviceId = devices[i].dms_devices_id;
				str =
					"<li>" +
						"<span class='checkLabel'>" +
							"<input type='checkbox' checked='checked' data-dms_devices_id='" + deviceId + "' data-dms_trendLogs_properties_list_key='" + devices[i].dms_trendLogs_properties_list_keys[j] + "' id='" + deviceId + "_" + propertyName + "' class='k-checkbox checkbox history-checkbox'><label class='k-checkbox-label' for='" + deviceId + "_" + propertyName + "' style='padding-left:22px;'>" + propertyName + "</label>" +
						"</span>" +
						"<div class='lineVisual' id='svg-appender-" + i + "-" + j + "'></div>" +
					"</li>";

				dom.append(str);
				appendSVG(i,j);

				//line chart를 위해서 color model set
				var child = {};
				child.dms_devices_id = devices[i].dms_devices_id;
				child.dms_property_name = devices[i].dms_trendLogs_properties_list_keys[j];
				child.i = i;
				child.j = j;
				child.color = colors[i];
				child.shape = shapes[j];
				historyChartColorShapeModel.push(child);
			}
		}
		return historyChartColorShapeModel;
	};

	var getPropertiesUnitByKey = function(key){
		var i;	//[2018-04-12][for문에서 사용시 초기화하기에 i를 상위선언]
		for(var j = 0; j < propertiesModel.length; ++j){
			var list = propertiesModel[j].list;
			var properties = propertiesModel[j].properties;

			if(list){
				for(i = 0; i < list.length; ++i){
					if(key == list[i].key){
						return list[i].unit;
					}
				}
			}

			if(properties){
				for(i = 0; i < properties.length; ++i){
					if(key == properties[i].key){
						return properties[i].unit;
					}
				}
			}
		}

		return "";
	};

	var ScalesModel;

	var setScalesModel = function(scales){
		ScalesModel = scales;
	};

	var getCalculatedValue = function(value, unit){
		var scale, scale2;
		for(var i = 0; i < ScalesModel.length; ++i){
			if(ScalesModel[i].unit == unit){
				var max = ScalesModel[i].maximumValue;
				var min = ScalesModel[i].minimumValue;
				if(!min){//삼성 오타를 위한 임시조치
					min = ScalesModel[i].minimunValue;
				}
				if(typeof value == "string"){
					value = Number(value);
				}
				scale = value - min;
				scale2 = max - min;
				if(scale != 0 && scale2 != 0){
					return scale / scale2 * 100;
				}
				return 0;

			}
		}
		return 0;
	};

	var unitModel = {
		"Celsius" : "℃",
		"Percent" : "%",
		"KilowattHour" : "KW/h",
		"Liter" : "L",
		"CubicMeter" : "㎥",
		"Kilocalorie" : "kcal",
		"NotDefined" : "",
		"Minute" : "m",
		"Hertz" : "hz",
		"Fahrenheit" : "°F"
	};

	//Trend Log 생성 팝업에서 Log Interval 항목 중 주기 별 데이터
	//분을 선택할 경우
	var minPeriodDataSource = [];
	var hourPeriodDataSource = [];
	var dayPeriodDataSource = [];
	//[2018-04-12][block-scope-var 문제를 해결하기위해 처음 한번만 실행되기에 즉시실행함수를 써서 해결]
	//[2018-04-17][기존 block-scope-var 문제를 즉시실행함수로 해결했던것을 변수명을 전역과 오염되지않게 수정하여 해결]

	var forIndex, maximum = 59;
	for( forIndex = 1; forIndex <= maximum; forIndex++ ){
		minPeriodDataSource.push({
			text : forIndex,
			value : forIndex,
			selectable : true
		});
	}

	maximum = 23;
	for( forIndex = 1; forIndex <= maximum; forIndex++ ){
		hourPeriodDataSource.push({
			text : forIndex,
			value : forIndex,
			selectable : true
		});
	}

	maximum = 30;
	for( forIndex = 1; forIndex <= maximum; forIndex++ ){
		dayPeriodDataSource.push({
			text : forIndex,
			value : forIndex,
			selectable : true
		});
	}


	return {
		createDetailModel : createDetailModel,
		getPropertiesNameByKey : getPropertiesNameByKey,
		setPropertiesModel : setPropertiesModel,
		createMultiDetailModel : createMultiDetailModel,
		createHistoryPanelNameModel : createHistoryPanelNameModel,
		createHistoryPanelPropertyModel : createHistoryPanelPropertyModel,
		appendMarker : appendMarker,
		getPropertiesUnitByKey : getPropertiesUnitByKey,
		setScalesModel : setScalesModel,
		getCalculatedValue : getCalculatedValue,
		unitModel : unitModel,
		minPeriodDataSource : minPeriodDataSource,
		hourPeriodDataSource : hourPeriodDataSource,
		dayPeriodDataSource : dayPeriodDataSource,
		getPropertyValue: getPropertyValue
	};
});

//# sourceURL=history-trendlog/trendlog-model.js
