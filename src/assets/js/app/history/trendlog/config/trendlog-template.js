define("history/trendlog/config/trendlog-template", [], function(){
	// var MainWindow = window.MAIN_WINDOW;			//[2018-04-12][미사용 변수 주석처리]
	var Util = window.Util;
	var I18N = window.I18N;

	var schedulerLegends = [
		{ className : "indoor", displayText : "SAC Indoor"},
		{ className : "light", displayText : "Light"},
		{ className : "indoorlight", displayText : "SAC Indoor + Light"},
		{ className : "others", displayText : "Others"},
		{ className : "pause", displayText : "Pause"}
	];

	var getEventTemplateType = function(data){
		var devices = data.devices;
		var type = 3;
		var hasSacIndoor, hasLight;			//[2018-04-12][상위의 선언]
		if(!data.activated){
			type = 4;
		}else{
			if(devices && devices.length > 0){
				var i, max = devices.length;
				// var device;				//[2018-04-12][미사용 변수 주석처리]
				hasSacIndoor = false;		//[2018-04-12][var 제거]
				hasLight = false;			//[2018-04-12][var 제거]
				for( i = 0; i < max; i++ ){
					if(devices[i].dms_devices_type.indexOf("AirConditioner") != -1){
						hasSacIndoor = true;
					}

					if(devices[i].dms_devices_type.indexOf("Light") != -1){
						hasLight = true;
					}
				}
			}
			if(hasSacIndoor && hasLight){
				type = 2;
			}else if(hasSacIndoor){
				type = 0;
			}else if(hasLight){
				type = 1;
			}else{
				type = 3;
			}
		}
		// var text = "", className = "";			//[2018-04-12][미사용 변수 주석처리]
		var legend = schedulerLegends[type];
		var returnObj = {
			type : type
		};
		if(legend){
			returnObj.text = legend.displayText;
			returnObj.className = legend.className;
		}
		return returnObj;
	};

	var getEventTemplateClass = function(data){
		var className = "";
		var obj = getEventTemplateType(data);
		if(obj.className){
			className = obj.className;
		}
		return className;
	};


	//[2018-04-12][이미선언된 함수 주석처리]
	// var scheduleDetailBtnTemplate = function(data){
	//     var oper = data.activated ? "Operating" : "Pause";
	//     var operCss = data.activated ? "ic ic-action-pause" : "ic ic-action-play";
	//
	//     var status = "<span class='panel-item-temp schedule-status'><span>"+oper+"</span></span>";
	//     var btn = "<span class='action-button-wrapper'><button class='k-button action-button "+operCss+"'></button></span>";
	//
	//     return btn+status;
	// };
	//[2018-04-12][이미선언된 함수 주석처리]
	// var scheduleDetailNameTemplate = function(data){
	//     data.name = data.name || data.title;
	//     data.title = data.name;
	//     var name = data.name;
	//
	//     return "<span class='td-padding-left'>"+Util.decodeHtml(name)+"</span>";
	// };

	var scheduleDetailListTemplate = function(data){
		var name = scheduleDetailNameTemplate(data);
		// var actionBtn = scheduleDetailBtnTemplate(data);
		return (name);
	};

	//[2018-04-13][operationListTemplate 함수가 존재하지않아 moreOperationListTemplate호출되는 파일을 찾아보려고했지만 trendlog 폴더안에 js에서는 사용하지않기에 주석처리함]
	// var moreOperationListTemplate = function(data){
	//     var operation = operationListTemplate(data);
	//     var actionBtn = scheduleDetailBtnTemplate(data);
	//     return operation + actionBtn;
	// };

	var executionTimeListTemplate = function(data){
		var txt = "-";
		var time, times = data.executionTimes;
		var max = times.length;
		if(max > 0){
			time = times[0];
			time = time.split(":");
			time = time[0] + ":" + time[1];
			txt = time;
			if(max > 1){
				txt += " (+" + (max - 1) + ")";
			}
		}
		data.times = txt;
		return txt;
	};

	var checkboxCellTemplate = function(data){
		var className = getEventTemplateClass(data);
		var uid = data.uid;
		var id = data.id;
		var checked = data.checked ? "checked" : "";
		return '<div class="schedule-checkbox-cell ' + className + '"><span class="checkbox-wrapper"><input type="checkbox" data-id=' + id + ' id="check_' + uid + '" class="k-checkbox" ' + checked + '/><label for="check_' + uid + '" class="k-checkbox-label"></label></span></div>';
	};

	// var scheduleActivatedTemplate = function(data){
	// 	var oper = data.enabled ? I18N.prop("COMMON_OPERATING") : I18N.prop("COMMON_PAUSE");
	// 	var status = "<span class='panel-item-temp schedule-status'><span>" + oper + "</span></span>";
	// 	return status;
	// };

	// var scheduleDetailBtnTemplate = function(data){
	// 	var operCss = data.enabled ? "ic ic-action-pause" : "ic ic-action-play";
	// 	var status = scheduleActivatedTemplate(data);
	// 	var btn = "<span class='action-button-wrapper'><button class='k-button action-button " + operCss + "'></button></span>";

	// 	return btn + status;
	// };

	var scheduleDetailNameTemplate = function(data){
		data.name = data.name || data.title;
		data.title = data.name;
		var name = data.name;

		return "<span class='td-padding-left'>" + Util.decodeHtml(name) + "</span>";
	};

	var trendLogDetailListTemplate = function(data){
		var name = scheduleDetailNameTemplate(data);
		// var actionBtn = scheduleDetailBtnTemplate(data);
		return (name);
	};


	return {
		scheduleDetailListTemplate : scheduleDetailListTemplate,
		scheduleDetailNameTemplate : scheduleDetailNameTemplate,
		// moreOperationListTemplate : moreOperationListTemplate,
		executionTimeListTemplate : executionTimeListTemplate,
		getEventTemplateClass : getEventTemplateClass,
		checkboxCellTemplate : checkboxCellTemplate,
		getEventTemplateType : getEventTemplateType,
		trendLogDetailListTemplate : trendLogDetailListTemplate
	};
});