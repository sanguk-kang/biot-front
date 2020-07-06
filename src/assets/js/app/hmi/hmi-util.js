define("hmi/hmi-util", ["device/common/device-api", "hmi/hmi-common"], function(DeviceApi, HmiCommon){
	var Util = window.Util;
	var I18N = window.I18N;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	function hasControlValueGraphic(figureType){
		return (figureType == "ProgressBar") || (figureType == "ScaleBar") || (figureType == "ToggleButton") ||
			(figureType == "Combobox") || (figureType == "RadioButton") || (figureType == "ExtLabel");
	}

	//바인딩 탭 활성화 가능한 Graphic Type 체크
	function canBindingType(graphicType){
		var disableTypes = [];
		return disableTypes.indexOf(graphicType) == -1;
	}

	function isMultiBindingType(categoryName){
		var multiType = ["Alarm", "Valve", "ExtLabel"];
		return multiType.indexOf(categoryName) != -1;
	}

	function getReverseState(state){
		if(state == "off") state = "on";
		else if(state == "on") state = "off";
		else if(state == "stop") state = "rotate";
		else if(state == "rotate") state = "stop";
		return state;
	}

	function getReverseValue(value){
		if(value == 1) value = 0;
		else value = 1;
		return value;
	}

	function getImageInfoFromUrl(src){
		var dfd = new $.Deferred();
		var image = new Image();
	    image.crossOrigin = 'Anonymous';
	    image.onload = function() {
	        var canvas = document.createElement('canvas');
	        var context = canvas.getContext('2d');
	        canvas.height = this.naturalHeight;
	        canvas.width = this.naturalWidth;
	        context.drawImage(this, 0, 0);
	        var dataURL = canvas.toDataURL('image/jpeg');
			dfd.resolve({
				dataUrl : dataURL,
				width : this.width,
				height : this.height
			});
	    };

	    image.src = src;
		return dfd.promise();
	}

	function getImageInfoFromFile(className, maxSize){
		var dfd = new $.Deferred(), fileInput;
		if(!className) className = "";
		if(!maxSize) maxSize = HmiCommon.IMAGE_FILE_MAX_SIZE;
		if(className){
			fileInput = $("input.image-info-input." + className);
			if(fileInput.length > 0) fileInput.remove();
		}
		fileInput = $('<input class="image-info-input ' + className + '" type="file" accept=".png, .jpg, .gif" tabindex="0" />');
		$("body").append(fileInput);
		fileInput.trigger("click");
		fileInput.on('change', function(event){
			var f = event.target.files[0];
			var fpath = event.target.value;
			var reader = new FileReader();
			reader.onload = function(e) {
				var data = e.target.result;
				var i = new Image();
				i.onload = function(){
					dfd.resolve({
						file : f,
						width : this.width,
						height : this.height,
						dataUrl : data
					});
				};
				i.onerror = function(evt){
					dfd.reject(evt);
				};
				i.src = data;
				fileInput.remove();
			};

			reader.onerror = function(e){
				dfd.reject(e);
			};

			var msg, ext = fpath.slice(fpath.lastIndexOf('.')).toLowerCase();
			if(f.size > maxSize){
				var mbSize = maxSize / 1024 / 1024;
				msg = I18N.prop('HMI_INVALID_IMAGE_SIZE', mbSize);
				dfd.reject(msg);
			} else if (ext == '.png' || ext == '.jpg' || ext == '.gif'){
				// Read in the image file as a data URL.
				reader.readAsDataURL(f);
			} else {
				msg = I18N.prop('HMI_IMAGE_EXTENSION_ERROR');
				dfd.reject(msg);
			}
		});
		return dfd.promise();
	}

	function getJSONFileData(){
		var dfd = new $.Deferred();
		var fileInput = $('<input class="json-file-import-input" type="file" accept=".json,application/json" />');
		$("body").append(fileInput);
		fileInput.trigger("click");
		fileInput.on('change', function(event){
			Loading.open();
			var f = event.target.files[0];
			var reader = new FileReader();
			reader.onload = function(e) {
				var data = e.target.result;
				fileInput.remove();
				dfd.resolve(f, data);
				Loading.close();
			};
			// Read in the image file as a data URL.
			reader.readAsText(f);
		});
		return dfd.promise();
	}

	function getKeepRatioSize(originalWidth, originalHeight, width, height){
		var ratio, originalRatio;

		//더 너비, 높이 중 큰 쪽에 비율을 맞춘다.
		if(originalWidth > originalHeight){
			ratio = height / width;
			originalRatio = originalHeight / originalWidth;
		}else if(originalWidth < originalHeight){	// 너비에 비율을 맞춘다.
			ratio = width / height;
			originalRatio = originalWidth / originalHeight;
		}

		if(ratio != originalRatio){
			if(originalWidth > originalHeight){
				height = width * originalRatio;
			}else if(originalWidth < originalHeight){
				width = height * originalRatio;
			}
		}

		return {
			width : width,
			height : height
		};
	}

	var updateOldImagePath = function(path, version){
		if(path){
			if(path.indexOf("data:") !== -1) return path;	//Base 64
			else if(path.indexOf("asset") !== -1){
				if(version == HmiCommon.CURRENT_HMI_VERSION || !version){	//v1.1 이미지 대응 (공백 삭제된 이미지)
					if(path.indexOf("../asset/icons") !== -1) path = path.replace("../asset/icons", "../../src/main/resources/static-dev/images/icon");
					else if(path.indexOf("../../src/main/resources/static-dev/asset/icons") !== -1) path = path.replace("../../src/main/resources/static-dev/asset/icons", "../../src/main/resources/static-dev/images/icon");
					else if(path.indexOf("../asset/images") !== -1) path = path.replace("../asset/images", "../../src/main/resources/static-dev/images/icon");
				}else if(version == HmiCommon.INITIAL_HMI_VERSION){		//v1.0 이미지 대응
					if(path.indexOf("../asset/icons") !== -1) path = path.replace("../asset/icons", "../../src/main/resources/static-dev/asset/icons");
					else if(path.indexOf("../asset/images") !== -1) path = path.replace("../asset/images", "../../src/main/resources/static-dev/asset/images");
				}
			}
		}
		return path;
	};

	var isControlPointType = function(type){
		if(type &&
			(type == "AI" || type == "AO" || type == "DI" || type == "DO" || type.indexOf("ControlPoint") != -1)){
			return true;
		}
		return false;
	};

	var isDigitalType = function(type){
		if(type && (type.indexOf("DO") != -1 || type.indexOf("DI") != -1)) return true;
		return false;
	};

	var getDeviceInfo = function(device, type){
		var id = device.id ? device.id : null;
		var name = id ? device.name : null;
		var tagName;
		if(!type) type = device.type ? device.type : null;
		if(device.controlPoint){
			if(!name) name = device.controlPoint.name;
			tagName = device.controlPoint.tagName ? device.controlPoint.tagName : "-";
		}
		if(!name) name = "-";
		var value = 0;
		if(isControlPointType(type)){
			value = device.controlPoint ? device.controlPoint.value : null;
			type = type.split("ControlPoint.");
			if(type.length > 1) type = type[1];
			else type = type[0];
		}else if(type == "Sensor.Temperature" || type == "Sensor.Temperature_Humidity"){
			value = (device.temperatures && device.temperatures[0]) ? device.temperatures[0].current : null;
		}else if(type == "Sensor.Humidity"){
			value = (device.humidities && device.humidities[0]) ? device.humidities[0].current : null;
		}

		var mappedType = device.mappedType ? device.mappedType : type;
		if(!id){
			type = null;
			mappedType = null;
			value = null;
		}

		var typeText = "";
		if(type) typeText = Util.getDetailDisplayTypeDeviceI18N(type);
		var displayType;
		if(type && type.indexOf("AirConditioner") != -1){
			typeText = displayType = getI18NIndoorType(device);
		}else{
			displayType = mappedType ? Util.getDetailDisplayTypeDeviceI18N(mappedType) : typeText;
		}

		return {
			typeText : typeText,
			mappedType : mappedType,
			displayType : displayType,
			value : value,
			name : name,
			tagName : tagName,
			id : id,
			type : type
		};
	};

	var getI18NIndoorType = function(device){
		var displayType, airConditioner = device.airConditioner, type = device.type;
		if(airConditioner && airConditioner.indoorUnitType){
			var indoorUnitType = airConditioner.indoorUnitType;
			displayType = indoorUnitType.replace("AirConditioner.Indoor.", "");
			displayType = displayType.replace(/\./gi, "_").toUpperCase();
			displayType = I18N.prop("HMI_AIRCONDITIONER_INDOOR_TYPE_" + displayType);
		}else{
			displayType = type.replace("AirConditioner.", "");
			displayType = displayType.replace(/\./gi, "_").toUpperCase();
			displayType = I18N.prop("HMI_AIRCONDITIONER_TYPE_" + displayType);
		}
		return displayType;
	};

	//백엔드 API로 응답되는 모델로 변환
	var getDeviceValueObj = function(type, value){
		var model = {};
		if(isControlPointType(type)){
			model.controlPoint = {
				value : value
			};
		}else if(type == 'Sensor.Temperature'){
			model.temperatures = [{ current : value }];
		}else if(type == 'Sensor.Sensor.Humidity'){
			model.humidities = [{ current : value }];
		}
		return model;
	};

	var getGraphicCatergoryPointType = function(categoryName){
		var stateInfo = HmiCommon.ControlPointValueAndStateMapping[categoryName];
		if(stateInfo && stateInfo.state){
			var valueTypes = stateInfo.valueType;
			var valueType = valueTypes[0];
			if(valueType) valueType = Object.keys(valueType);
			if(valueType) valueType = valueType[0];
			return valueType;
		}
		return null;
	};

	var isLegacyGraphic = function(path){
		if(path && path.indexOf("/asset/") != -1) return true;
		return false;
	};


	var hasColorGraphic = function(item){
		var key, images = item.images;
		if(images){
			for(key in images){
				key = key.toUpperCase();
				if(key.indexOf("GRAY") != -1 || key.indexOf("RED") != -1 || key.indexOf("BLUE") != -1
					|| key.indexOf("GREEN") != -1 || key.indexOf("YELLOW") != -1){
					return true;
				}
			}
		}
		return false;
	};

	var getStateDataSource = function(item, deviceType){
		var categoryName;
		if(typeof item === "string") categoryName = item;
		else categoryName = item.categoryName;
		var states = HmiCommon.ControlPointValueAndStateMapping[categoryName];
		var dataSource = [];
		if(categoryName && states && states.state){
			var stateList;
			if(isMultiBindingType(categoryName)){
				if(!deviceType) console.error("this is multi binding type graphic " + categoryName + "device type not provided");
				if(isDigitalType(deviceType)) stateList = states.state.digital;
				else stateList = states.state.analog;
			}else{
				stateList = states.state;
			}
			var value, key;
			for(key in stateList){
				value = stateList[key];
				dataSource.push({
					value : value,
					text : I18N.prop("HMI_STATE_" + value.toUpperCase())
				});
			}
		}
		return dataSource;
	};

	var isMultiLevelGraphic = function(categoryName){
		if(categoryName == "Gauge" || categoryName == "Damper" ||
			categoryName == "Pumps2" || categoryName == "Tank" || categoryName == "WaterTank" ||
			categoryName == "AnalogSensor" || categoryName == "Valve" || categoryName == "Dimming"){
			return true;
		}
		return false;
	};

	var getCurrentStateItem = function(categoryName, deviceType, value, gauge, min, max){
		var stateDs = getStateDataSource(categoryName, deviceType);

		if(typeof value !== "undefined") value = Number(value);

		var index = 0;
		var level = categoryName == "Gauge" ? gauge : 10;
		if(value === null || typeof value === "undefined"){
			index = 0;
		}else if(isDigitalType(deviceType)){
			if(value < 2) index = value;
			else if(value >= 2 && value <= 30) index = 0;
			else if(value <= 70) index = 1;
			else if(stateDs.length > 2) index = 2;
			else index = 1;
		}else if(isMultiLevelGraphic(categoryName)){	//10개의 Level로 표시하는 그래픽
			//최대 최소 값이 존재할 경우 최대-최소 값 범위 내에서 분할
			if((typeof min !== "undefined" && min !== null) && (typeof max !== "undefined" && max !== null)){
				if(value < min) value = min;
				if(value > max) value = max;
				level = (max - min) / level;
				index = Math.ceil((value - min) / level);
				if(index > 10) index = 10;
			}else{
				value = Math.ceil(value / level);
				if(value > 10) value = 10;
				index = value;
			}
		}else if(value <= 30) index = 0;
		else if(value <= 70) index = 1;
		else if(stateDs.length > 2) index = 2;
		else index = 1;

		return stateDs[index];
	};

	var getElementBindingType = function(categoryName){
		var state = HmiCommon.ControlPointValueAndStateMapping[categoryName];
		if(state && state.valueType){
			var typeObj, valueType = state.valueType;
			var i, keys, typeIndex, max = valueType.length;
			for( i = 0; i < max; i++ ){
				typeObj = valueType[i];
				keys = Object.keys(typeObj);
				typeIndex = keys.indexOf("DI");
				if(typeIndex != -1) return keys[typeIndex];
				typeIndex = keys.indexOf("DO");
				if(typeIndex != -1) return keys[typeIndex];
				typeIndex = keys.indexOf("AI");
				if(typeIndex != -1) return keys[typeIndex];
				typeIndex = keys.indexOf("AO");
				if(typeIndex != -1) return keys[typeIndex];
			}
		}
		return null;
	};

	var getGridPosition = function(val) {
		var pos = Number(val);
		if (isNaN(pos)) return val;
		return Math.round(val / HmiCommon.DEFAULT_GRID_WIDTH) * HmiCommon.DEFAULT_GRID_WIDTH;
	};

	var getBrightness = function(hexColor) {
		var color = window.kendo.parseColor(hexColor);
		var r = color.r, g = color.g, b = color.b;
		return Math.sqrt(r * r * 0.241 + g * g * 0.691 + b * b * 0.068);
	};

	var convertExpandInfoToCookieData = function(data) {
		var result = [];
		var id, expanded;
		data.forEach(function(elem, idx) {
			id = elem.id || idx;
			expanded = elem.expanded;
			result.push(id + '=' + expanded);
		});
		return result.join(',');
	};

	var parseCookieDataToExpandInfo = function(str, isIdSeperate) {
		var result = [];
		if (!str) return result;
		var arr = str.split(',');
		var info;
		arr.forEach(function(elem) {
			elem = elem.split('=');
			info = {expanded : elem[1] == "true"};
			if (isIdSeperate) info['id'] = Number(elem[0]);
			result.push(info);
		});
		return result;
	};

	var isInvalidDevice = function(device){
		var status = device.registrationStatus;
		return (!status || status == "NotRegistered" || status == "Deleted");
	};

	var getGraphicDeviceInfo = function(cells){
		var cntBindingObjects = 0, cntVectorGraphicObjects = 0, cntRotatedObjects = 0, cntGroupedObjects = 0;

		var i, type, angle, binding, device, devices = [];
		cells.forEach(function(cell){
			type = cell.get && cell.get("type") || cell.type;
			binding = cell.prop && cell.prop("binding") || cell.binding;
			angle = typeof cell.angle == "function" ?  cell.angle() : cell.angle;
			device = binding.device;
			if(type == "hmi.Group"){
				cntGroupedObjects++;
			}else if(device && device.id){
				devices.push(device);
				cntBindingObjects++;
			}else if(angle != 0){
				cntRotatedObjects++;
			}else{
				cntVectorGraphicObjects++;
			}
		});
		return {
			devices : devices,
			cntBindingObjects : cntBindingObjects,
			cntVectorGraphicObjects : cntVectorGraphicObjects,
			cntGroupedObjects : cntGroupedObjects,
			cntRotatedObjects : cntRotatedObjects,
			totalFiguresSize : (cntBindingObjects + cntVectorGraphicObjects + cntGroupedObjects + cntRotatedObjects)
		};
	};

	var HmiUtil = {
		DeviceApi : DeviceApi,
		Loading : Loading,
		canBindingType : canBindingType,
		isMultiBindingType : isMultiBindingType,
		hasControlValueGraphic : hasControlValueGraphic,
		getReverseState: getReverseState,
		getReverseValue : getReverseValue,
		getImageInfoFromUrl : getImageInfoFromUrl,
		getImageInfoFromFile : getImageInfoFromFile,
		getJSONFileData : getJSONFileData,
		getKeepRatioSize: getKeepRatioSize,
		updateOldImagePath : updateOldImagePath,
		isControlPointType : isControlPointType,
		isDigitalType : isDigitalType,
		getDeviceInfo : getDeviceInfo,
		getI18NIndoorType : getI18NIndoorType,
		getDeviceValueObj : getDeviceValueObj,
		getGraphicCatergoryPointType : getGraphicCatergoryPointType,
		isLegacyGraphic : isLegacyGraphic,
		hasColorGraphic : hasColorGraphic,
		isMultiLevelGraphic : isMultiLevelGraphic,
		getStateDataSource : getStateDataSource,
		getCurrentStateItem : getCurrentStateItem,
		getElementBindingType : getElementBindingType,
		getGridPosition : getGridPosition,
		getBrightness : getBrightness,
		convertExpandInfoToCookieData : convertExpandInfoToCookieData,
		parseCookieDataToExpandInfo : parseCookieDataToExpandInfo,
		isInvalidDevice : isInvalidDevice,
		getGraphicDeviceInfo : getGraphicDeviceInfo
	};

	window.HmiUtil = HmiUtil;
	return HmiUtil;
});
//# sourceURL=hmi/hmi-util.js
