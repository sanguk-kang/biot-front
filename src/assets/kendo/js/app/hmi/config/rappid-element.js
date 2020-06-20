define("hmi/config/rappid-element", ["device/common/device-api", "hmi/hmi-common", "hmi/hmi-util", "hmi/config/rappid-extended-class",
	"hmi/config/popup-config", "hmi/config/palette-config"],
function(DeviceApi, HmiCommon, HmiUtil, RappidExtendedClass, PopupConfig, PaletteConfig){

	var I18N = window.I18N, Util = window.Util, moment = window.moment, kendo = window.kendo;
	var joint = window.joint;
	var g = window.g, V = window.V;
	var Loading = HmiUtil.Loading;
	var getGridPosition = HmiUtil.getGridPosition;
	var TextEditor = RappidExtendedClass.TextEditor;

	var BaseHmiElement = joint.dia.Element.define('hmi.BaseHmiElement',
		//Default Properties
		{
			//SVG Attribute로 Prototype의 "markup" 객체와 매핑되어 속성 변경 가능
			//그래픽 객체 별로 해당 속성이 다를 것이므로 Base에는 존재하지 않음
			"attrs" : {
				"info_0" : {
					refX : "100%",
					refY : 0,
					//refX2 : -HmiCommon.DEFAULT_INFO_ICON_SIZE,
					width : HmiCommon.DEFAULT_INFO_ICON_SIZE,
					height : HmiCommon.DEFAULT_INFO_ICON_SIZE
				},
				"info_1" : {
					refX : "100%",
					refY : HmiCommon.DEFAULT_INFO_ICON_SIZE,
					//refX2 : -HmiCommon.DEFAULT_INFO_ICON_SIZE,
					width : HmiCommon.DEFAULT_INFO_ICON_SIZE,
					height : HmiCommon.DEFAULT_INFO_ICON_SIZE
				}
			}
		},
		//Prototype Properties
		{
			initialize : function(options){
				joint.dia.Element.prototype.initialize.apply(this, arguments);
				var paletteItem = options.paletteItem;
				// var bindingData = $.extend({}, defaultBindingProp);
				var bindingData = this.prop("binding");
				//저장된 객체를 불러오는 경우로 이미 binding 정보가 존재한다.
				var baseMarkup = joint.util.cloneDeep(BaseHmiElement.markup);
				var type = this.get("type");
				//Base Element의 기본 바인딩 Properties
				var defaultBindingProp = joint.util.cloneDeep(BaseHmiElement.defaultBindingProp);
				//현재 Class의 바인딩 Properties
				var childClass = joint.util.getByPath(joint.shapes, type, ".");
				var childDefaultBindingProp = childClass.defaultBindingProp;
				if(childDefaultBindingProp){
					childDefaultBindingProp = joint.util.cloneDeep(childDefaultBindingProp);
				}
				if(!bindingData){
					bindingData = $.extend(true, {}, defaultBindingProp, childDefaultBindingProp || {}, options.binding || {});
				}else{
					bindingData = $.extend(true, {}, defaultBindingProp, childDefaultBindingProp || {}, bindingData, options.binding || {});
				}

				//최초 생성 시, Base Markup 추가
				var mergedDefaultMarkup = [];
				if(this.markup){
					if($.isArray(this.markup)){
						if(typeof this.markup[0] == "string"){
							mergedDefaultMarkup = this.markup;
							mergedDefaultMarkup.push("<image joint-selector='info'></image>");
						}else{
							mergedDefaultMarkup = this.markup.concat(baseMarkup);
						}
					}else if(typeof this.markup === "string"){	//String일 경우
						mergedDefaultMarkup = this.markup + "<image joint-selector='info'></image>";
					}
				}else{
					mergedDefaultMarkup = baseMarkup;
				}
				this.set("markup", mergedDefaultMarkup);

				//Binding 데이터에 Palette 정보 연동
				if(paletteItem){
					bindingData.categoryName = paletteItem.categoryName;
					bindingData.image = paletteItem.imageUrl;
					bindingData.name = paletteItem.text;
					bindingData.key = paletteItem.value;
				}

				this._attachDefaultEvt();
				this._attachDefaultBindingEvt();
				this.attachEvent();
				this.prop("binding", bindingData);
			},
			initializeOptions : function(options, defaultOptions){
				if(!options) options = {};
				if(!defaultOptions) defaultOptions = {};
				var size = options.size, defaultSize = defaultOptions.size;
				var position = options.position, offset = options.offset;
				var attrs = options.attrs, defaultAttrs = defaultOptions.attrs;
				var binding = options.binding, defaultBinding = defaultOptions.binding;
				var key;

				if(!position && offset) this.position(offset.offsetX, offset.offsetY);
				if(!size && defaultSize){
					this.prop("binding/initWidth", defaultSize.width);
					this.prop("binding/initHeight", defaultSize.height);
					this.resize(defaultSize.width, defaultSize.height);
				}else if(size && defaultSize){	//기존 바인딩 객체가 유지되고 새로운 그래픽 객체로 대체될 때 initWidth/initHeight를 재설정한다. (팔레트 더블클릭하여 변경 시)
					var initWidth = this.prop("binding/initWidth");
					var initHeight = this.prop("binding/initHeight");
					if(initWidth != defaultSize.width) this.prop("binding/initWidth", defaultSize.width);
					if(initHeight != defaultSize.height) this.prop("binding/initHeight", defaultSize.height);
				}

				if(!attrs && defaultAttrs){
					for(key in defaultAttrs){
						this.attr(key, defaultAttrs[key]);
					}
				}

				//초기화 시에 binding에 속한 값을 동적으로 할당해야하는 경우
				//prop으로 변경되기 전에 가져오면 다른 object임. 변경 후에 가져왔음.
				var bindingData = this.prop("binding");
				if(!binding && defaultBinding){
					for( key in defaultBinding ){
						bindingData[key] = defaultBinding[key];
					}
				}
			},
			getPaletteItem : function(){
				var key = this.prop("binding/key");
				var categoryName = this.prop("binding/categoryName");
				if(categoryName == "Custom") return this.prop("binding/custom");
				return PaletteConfig.getData(key);
			},
			getRestrictedArea : function(){
				var graph = this.graph;
				var ra = graph ? graph._paper.getRestrictedArea() : {x: 0, y: 0, width: HmiCommon.DEFAULT_CANVAS_WIDTH, height: HmiCommon.DEFAULT_CANVAS_HEIGHT};

				return ra;
			},
			getRestrictedAreaWithRotate : function(){
				var ra = this.getRestrictedArea();
				var angle = this.angle() || 0;
				var bbox = this.getBBox();
				var rotatedBbox = bbox.bbox(angle);

				ra.x -= (rotatedBbox.x - bbox.x);
				ra.y -= (rotatedBbox.y - bbox.y);
				ra.width -= (rotatedBbox.width - bbox.width) / 2;
				ra.height -= (rotatedBbox.height - bbox.height) / 2;

				return ra;
			},
			position : function(x, y, opt){
				if (!this._isResizing && (!opt || !opt.preventSetGridPoint)) {
					x = getGridPosition(x);
					y = getGridPosition(y);
				}
				return joint.dia.Element.prototype.position.call(this, x, y, opt);
			},
			translate : function(tx, ty, opt){
				if (!opt || !opt.preventSetGridPoint) {
					tx = getGridPosition(tx) || 0;
					ty = getGridPosition(ty) || 0;
				} else {
					tx = tx || 0;
					ty = ty || 0;
				}
				var angle = this.angle() || 0;
				var bbox = this.getBBox();
				var rotatedBbox = bbox.bbox(angle);
				var ra = this.getRestrictedAreaWithRotate();
				if (bbox.x + tx < ra.x) tx = ra.x - bbox.x;
				if (bbox.y + ty < ra.y) ty = ra.y - bbox.y;
				if ((rotatedBbox.x + rotatedBbox.width) + tx > (ra.x + ra.width)) tx = ra.x + ra.width - rotatedBbox.width - rotatedBbox.x;
				if ((rotatedBbox.y + rotatedBbox.height) + ty > (ra.y + ra.height)) ty = ra.y + ra.height - rotatedBbox.height - rotatedBbox.y;

				return joint.dia.Element.prototype.translate.call(this, tx, ty, opt);
			},
			resize : function(width, height, opt){
				var that = this;
				that._isResizing = true;
				var minWidth = that.prop("binding/minWidth");
				var minHeight = that.prop("binding/minHeight");
				if(typeof minWidth !== "undefined"){
					if(width < minWidth) width = minWidth;
				}
				if(typeof minHeight !== "undefined"){
					if(height < minHeight) height = minHeight;
				}
				if (!opt || !opt.preventSetGridPoint) {
					width = getGridPosition(width);
					height = getGridPosition(height);
				}
				if(width > HmiCommon.DEFAULT_CANVAS_WIDTH) width = HmiCommon.DEFAULT_CANVAS_WIDTH;
				if(height > HmiCommon.DEFAULT_CANVAS_HEIGHT) height = HmiCommon.DEFAULT_CANVAS_HEIGHT;

				var resizeReturn = joint.dia.Element.prototype.resize.call(this, width, height, opt);
				//that.setInfoIconOriginalRatio();
				that._isResizing = false;
				return resizeReturn;
			},
			//Undo 시에는 propertyValue가 undefined로 들어오므로 해당 함수를 통하여 이벤트 콜백에서 Value를 얻는다.
			getPropertyValue : function(propertyPath, propertyValue){
				var that = this;
				if(typeof propertyValue === "undefined" || propertyValue === null){
					propertyValue = that.prop(propertyPath);
				}
				return propertyValue;
			},
			_attachDefaultBindingEvt : function(){
				//바인딩 정보에 따라 아이콘 업데이트 (잠금, 잘못된 디바이스, 잘못된 Opion Values(콤보박스, 라디오버튼))
				var that = this;
				that.on('change:binding', function(element, binding, opt){
					var key = opt.propertyPath;
					var value = opt.propertyValue;
					if(key == 'binding/locked' ||
						key == 'binding/device' || key == 'binding/device/invalid' ||
						key == 'binding/optionValues' || key == 'binding/value' || key == 'binding/highlightColor'){
						that.updateInfoIcon();
					}
				});

				that.on('change:position', function(element, position){
					// 그룹에 속한 요소일 경우 취소
					if (that.parent()) return;
					var canvas = that.getCanvas();
					var angle = that.angle() || 0;
					var bbox = that.getBBox();
					var changedBbox = g.Rect(position.x, position.y, bbox.width, bbox.height);
					changedBbox = changedBbox.bbox(angle);
					if(canvas) canvas.updateBinding({ x : changedBbox.x, y : changedBbox.y });
				});

				that.on('change:size', function(element, size){
					// 그룹에 속한 요소일 경우 취소
					if (that.parent()) return;
					var canvas = that.getCanvas();
					var angle = that.angle() || 0;
					var bbox = that.getBBox();
					var changedBbox = g.Rect(bbox.x, bbox.y, size.width, size.height);
					changedBbox = changedBbox.bbox(angle);
					if(canvas) canvas.updateBinding({ width : changedBbox.width, height : changedBbox.height });
				});

				that.on('change:angle', function(){
					// 그룹에 속한 요소일 경우 취소
					if (that.parent()) return;
					var canvas = that.getCanvas();
					var angle = that.angle() || 0;
					var bbox = that.getBBox();
					var changedBbox = bbox.bbox(angle);
					if(canvas) canvas.updateBinding({ x : changedBbox.x, y : changedBbox.y, width : changedBbox.width, height : changedBbox.height });
				});
			},
			updateInfoIcon : function(){
				var that = this;
				var isInvalidValue = that.isInvalidOptionValue() || that.isInvalidMultiCustomComponentValue();
				var isInvalidDevice = that.isInvalidDevice();
				var isLocked = that.isLocked() && that.isEditableCanvas();
				that._renderInfoIcon(isLocked, isInvalidDevice, isInvalidValue);
			},
			_renderInfoIcon : function(isLocked, isInvalidDevice, isInvalidValue){
				var that = this;
				var lockImageUrl = Util.addBuildDateQuery("../../src/main/resources/static-dev/images/icon/tool-lock.png");
				var invalidDeviceImageUrl = Util.addBuildDateQuery("../../src/main/resources/static-dev/images/icon/mark-alarm.png");
				var invalidValueImageUrl = Util.addBuildDateQuery("../../src/main/resources/static-dev/images/icon/mark-value.png");
				if(isLocked){
					that.attr("info_0/href", lockImageUrl);
					if(isInvalidDevice){
						that.attr("info_1/href", invalidDeviceImageUrl);
					}else if(isInvalidValue){
						that.attr("info_1/href", invalidValueImageUrl);
					}
				}else{
					that.attr("info_1/href", null);
					if(isInvalidDevice){
						that.attr("info_0/href", invalidDeviceImageUrl);
					}else if(isInvalidValue){
						that.attr("info_0/href", invalidValueImageUrl);
					}else{
						that.attr("info_0/href", null);
					}
				}
			},
			isInvalidDevice : function(){
				var that = this, device = that.prop("binding/device");
				if(device && device.id && device.invalid) return true;
				return false;
			},
			isLocked : function(){
				var that = this, locked = that.prop("binding/locked");
				if(locked) return true;
				return false;
			},
			isInvalidOptionValue : function(){
				var that = this;
				var optionValues = that.prop("binding/optionValues");
				var value = that.getValue();
				var device = that.prop("binding/device");
				if(optionValues && device.id){
					var option, i, max = optionValues.length;
					for( i = 0; i < max; i++ ){
						option = optionValues[i];
						if(option.value == value){
							return false;
						}
					}
					return true;
				}
				return false;
			},
			isInvalidMultiCustomComponentValue : function(){
				var that = this;
				var custom = that.prop("binding/custom");
				if(custom) return custom.invalid;
				return false;
			},
			_attachDefaultEvt : function(){
				//캔버스에 추가된 후에 활성화/비활성화 상태 반영 등을 한다.
				//(initialize 호출 시에는 add되지 않아 view가 존재하지 않으므로)
				var that = this;
				that.once('graph:add', that._defaultAddEvt.bind(that));
			},
			_defaultAddEvt : function(){
				var that = this;
				var bindingData = that.prop("binding");
				//최초 활성화/비활성화 상태 적용
				this._setVisible(bindingData.visible);
				//잠금, 바인딩 에러, 값 에러 아이콘 업데이트
				that.updateInfoIcon();
			},
			attachEvent : function(){
				var that = this;
				that.on('change:binding', function(element, binding, opt){
					var key = opt.propertyPath;
					var value = that.getPropertyValue(key, opt.propertyValue);
					if(key == 'binding/visible'){
						value = (value === "true" || value === true) ? true : false;
						that._setVisible(value);
					}
				});
			},
			getBindingData : function(){
				return this.prop("binding");
			},
			/*
				데이터 바인딩 팝업과의 인터페이스 추후 리팩토링 필요
				데이터 바인딩 팝업 -> Element
			*/
			setBindingData : function(data){
				//모든 그래픽 객체의 공통 속성
				var x = data.x, y = data.y, width = data.width, height = data.height, visible = data.visible,
					device = data.device, fontSize = data.fontSize, fontType = data.fontType, fontStyle = data.fontStyle,
					fontColor = data.fontColor, fillColor = data.fillColor, strokeColor = data.strokeColor, strokeWidth = data.strokeWidth,
					strokeDasharray = data.strokeDasharray;

				var angle = this.angle() || 0;
				var bbox = this.getBBox();
				var rBbox = bbox.bbox(angle);
				var dx = bbox.x - rBbox.x, dy = bbox.y - rBbox.y, dw = bbox.width - rBbox.width, dh = bbox.height - rBbox.height;
				if(typeof width !== "undefined" && typeof height !== "undefined") {
					var nw = width + dw, nh = height + dh;
					//새 사이즈가 기존 사이즈와 다를 경우 업데이트
					if (Math.abs(bbox.width - nw) >= 1  || Math.abs(bbox.height - nh) >= 1) this.resize(nw, nh, {preventSetGridPoint : true});
				}
				if(typeof x !== "undefined" && typeof y !== "undefined") {
					var nx = x + dx, ny = y + dy;
					//새 포지션이 기존 포지션과 다를 경우 업데이트
					if (Math.abs(bbox.x - nx) >= 1 || Math.abs(bbox.y - ny) >= 1) this.position(nx, ny, {preventSetGridPoint : true});
				}
				if(typeof visible !== "undefined") this.setVisible(visible);

				if(device && device.id){
					device = $.extend(device, HmiUtil.getDeviceValueObj(device.type, device.value));
					this.prop("binding/device", device, { rewrite : true });
				}

				if(fontSize) this.prop("binding/fontSize", fontSize);
				if(fontType) this.prop("binding/fontType", fontType);
				if(fontStyle) this.prop("binding/fontStyle", fontStyle);
				if(fontColor) this.prop("binding/fontColor", fontColor);
				if(fillColor) this.prop("binding/fillColor", fillColor);
				if(strokeColor) this.prop("binding/strokeColor", strokeColor);
				if(strokeWidth) this.prop("binding/strokeWidth", strokeWidth);
				if(strokeDasharray) this.prop("binding/strokeDasharray", strokeDasharray);
			},
			/*
				데이터 바인딩 팝업과의 인터페이스 추후 리팩토링 필요
				Element -> 데이터 바인딩 팝업
			*/
			getGraphicBindingPopupData : function(){
				var that = this;
				var data = {};

				var bindingData = that.prop("binding");
				data.type = bindingData.type;
				data.name = bindingData.name;
				data.categoryName = bindingData.categoryName;
				data.image = bindingData.image;

				var bbox = that.getBBox();
				var angle = that.angle() || 0;
				bbox = bbox.bbox(angle);
				var x = bbox.x;
				var y = bbox.y;
				data.locationX = Math.ceil(x);
				data.locationY = Math.ceil(y);

				var width = bbox.width, height = bbox.height;
				if(!isNaN(width)) data.width = Math.ceil(width);
				if(!isNaN(height)) data.height = Math.ceil(height);

				data.visible = bindingData.visible;
				data.reverse = bindingData.reverse;
				data.device = bindingData.device;

				data.fontSize = that.prop("binding/fontSize");
				data.fontType = that.prop("binding/fontType");
				data.fontStyle = that.prop("binding/fontStyle");
				data.fontColor = that.prop("binding/fontColor");
				data.fillColor = that.prop("binding/fillColor");
				data.strokeColor = that.prop("binding/strokeColor");
				data.strokeWidth = that.prop("binding/strokeWidth");
				data.strokeDasharray = that.prop("binding/strokeDasharray");

				return data;
			},
			setWidth : function(width){
				var size = this.size();
				this.resize(width, size.height);
			},
			setHeight : function(height){
				var size = this.size();
				this.resize(size.width, height);
			},
			setX : function(x, isParentRelative, isDeep){
				var position = this.position();
				this.position(x, position.y, { parentRelative : isParentRelative, deep : isDeep });
			},
			setY : function(y, isParentRelative, isDeep){
				var position = this.position();
				this.position(position.x, y, { parentRelative : isParentRelative, deep : isDeep });
			},
			setFontSize : function(size){
				this.prop("binding/fontSize", size);
			},
			setFontType : function(type){
				this.prop("binding/fontType", type);
			},
			setFontStyle : function(style){
				this.prop("binding/fontStyle", style);
			},
			setFontWeight : function(weight){
				this.prop("binding/fontWeight", weight);
			},
			setFontColor : function(color){
				this.prop("binding/fontColor", color);
			},
			setStrokeWidth : function(width){
				this.prop("binding/strokeWidth", width);
			},
			setStrokeColor : function(color){
				this.prop("binding/strokeColor", color);
			},
			setFillColor : function(color){
				this.prop("binding/fillColor", color);
			},
			getFontColor : function(){
				return this.prop("binding/fontColor");
			},
			getStrokeColor : function(){
				return this.prop("binding/strokeColor");
			},
			getFillColor : function(){
				return this.prop("binding/fillColor");
			},
			setOpacity : function(value){
				this.prop("binding/opacity", value);
			},
			getCurrentView : function(){
				var graph = this.graph;
				if(graph){
					var paper = graph._paper;
					if(paper){
						var view = this.findView(paper);
						return view;
					}
				}
				return null;
			},
			getCanvas : function(){
				var graph = this.graph;
				if(graph){
					var paper = graph._paper;
					if(paper){
						var canvas = paper._canvas;
						return canvas;
					}
				}
				return null;
			},
			getBaseCanvas : function(){
				var that = this;
				var canvas = that.getCanvas();
				if(canvas){
					return canvas.baseCanvas;
				}
				return null;
			},
			isEditableCanvas : function(){
				var graph = this.graph;
				if(graph){
					var paper = graph._paper;
					if(paper){
						var canvas = paper._canvas;
						return canvas.isEditable;
					}
				}

				return false;
			},
			setVisible : function(isVisible){
				this.prop('binding/visible', isVisible);
			},
			_setVisible : function(isVisible){
				var that = this;
				isVisible = (isVisible === "true" || isVisible === true) ? true : false;

				var view = that.getCurrentView();
				if(view){
					var opacity = 1;
					if(isVisible) opacity = 1;
					else opacity = that.isEditableCanvas() ? 0.2 : 0;
					view.$el.css("opacity", opacity);
				}
			},
			isReverse : function(){
				var reverse = this.prop("binding/reverse");
				if(reverse == "true" || reverse === true) return true;
				return false;
			},
			setDevice : function(device){
				var that = this;
				var deviceInfo = HmiUtil.getDeviceInfo(device);
				that.setValue(deviceInfo.value);
			},
			getDevice : function(){
				return this.prop("binding/device");
			},
			getValue : function(){
				var that = this;
				var buttonType = that.prop("binding/buttonType");
				var customType = that.prop("binding/custom/type");
				if(customType == "Controlled") buttonType = that.prop("binding/custom/controlType");
				else if(customType == "Toggle" || customType == "Multi") buttonType = null;
				//버튼 타입, 커스텀 컴포넌트의 제어 타입 Push, Momentary는 바인딩 값에 영향을 받지 않는다.
				if(buttonType && (buttonType == "Push" || buttonType == "Momentary")){
					return 0;
				}
				var value = that.prop("binding/value");
				//Number인 경우만 소수점 절사 포맷 적용
				if(!isNaN(Number(value))) value = Util.convertNumberFormat(value);

				return value;
			},
			setValue : function(value, trigger){
				var that = this;
				//숫자인 경우 Number로 형변환
				if(typeof value === "string" && !isNaN(Number(value))){
					value = Number(value);
				}

				var oldValue = that.prop("binding/value");
				that.prop("binding/value", value);

				if(trigger && oldValue == value){
					that.trigger("change:binding", that, that.prop("binding"), { propertyPath : "binding/value", propertyValue : value});
				}
			},
			getCurrentState : function(value, gauge, min, max){
				var that = this;
				var bindingData = that.prop("binding");
				var device = bindingData.device, categoryName = bindingData.categoryName,
					deviceType = device.type;
				if(!deviceType){
					deviceType = HmiUtil.getElementBindingType(categoryName);
				}

				var stateItem = HmiUtil.getCurrentStateItem(categoryName, deviceType, value, gauge, min, max);
				var state = stateItem.value;
				//반전은 DI/DO에만 적용된다.
				if(HmiUtil.isDigitalType(deviceType) && that.isReverse()) state = HmiUtil.getReverseState(state);
				return state;
			},
			getDigitalTypeControlValue : function(){
				var that = this;
				var value = that.getValue();
				if(value === null || typeof value === "undefined") value = 0;
				if(value == 1) value = 0;
				else value = 1;
				return value;
			},
			patchDigitalTypeControlValue : function(ignoreSetValue, isMomentary){
				var that = this;
				var device = that.prop("binding/device");
				var deviceId = device.id;
				var value = that.getDigitalTypeControlValue();
				if(!ignoreSetValue){
					var oldValue = that.getValue();
					that.setValue(value);
					//값이 같아도 이미지 state의 변경이 필요하여 bindingDeviceValue를 호출하여 Trigger한다.
					if(value == oldValue){
						that.updateBindingValue();
					}
				}

				//리프레시 주기와 겹쳐 제어 후 바로 리프레시 되어 버리는 현상을 방지하기 위하여
				//제어 시, Polling 중지 후 다시 Polling 시작 (리프레시 주기 초기화)
				var baseCanvas = that.getBaseCanvas();
				if(baseCanvas) baseCanvas.stopPolling();
				//복귀형 타입에서 값을 되돌리는 제어일 경우
				if(isMomentary) value = HmiUtil.getReverseValue(value);
				//반전일 경우
				if(that.isReverse()) value = HmiUtil.getReverseValue(value);

				return HmiUtil.DeviceApi.patchControlPointValue(deviceId, value).always(function(res){
					if(baseCanvas) baseCanvas.startPolling(true);
					return res;
				});
			},
			patchAnalogTypeControlValue : function(value){
				var that = this;
				var device = that.prop("binding/device");
				var deviceId = device.id;
				if(!value) value = that.getValue();

				//리프레시 주기와 겹쳐 제어 후 바로 리프레시 되어 버리는 현상을 방지하기 위하여
				//제어 시, Polling 중지 후 다시 Polling 시작 (리프레시 주기 초기화)
				var baseCanvas = that.getBaseCanvas();
				if(baseCanvas) baseCanvas.stopPolling();
				return HmiUtil.DeviceApi.patchControlPointValue(deviceId, value).always(function(res){
					if(baseCanvas) baseCanvas.startPolling(true);
					return res;
				});
			},
			getRefPosFromTextLocation : function(){
				var that = this, textLocation = that.prop("binding/textLocation");
				var refX, refY, refX2, refY2, textAnchor, textVerticalAnchor;
				var DEFAULT_BUTTON_MARGIN = 5;
				if(textLocation == "top"){
					refX = "50%";
					refY = 0;
					refX2 = 0;
					refY2 = -DEFAULT_BUTTON_MARGIN;
					textAnchor = "middle";
					textVerticalAnchor = "bottom";
				}else if(textLocation == "left"){
					refX = 0;
					refY = "50%";
					refX2 = -DEFAULT_BUTTON_MARGIN;
					refY2 = 0;
					textAnchor = "end";
					textVerticalAnchor = "middle";
				}else if(textLocation == "right"){
					refX = "100%";
					refY = "50%";
					refX2 = DEFAULT_BUTTON_MARGIN;
					refY2 = 0;
					textAnchor = "start";
					textVerticalAnchor = "middle";
				}else if(textLocation == "bottom"){
					refX = "50%";
					refY = "100%";
					refX2 = 0;
					refY2 = DEFAULT_BUTTON_MARGIN;
					textAnchor = "middle";
					textVerticalAnchor = "top";
				}else if(textLocation == "middle"){
					refX = "50%";
					refY = "50%";
					refX2 = 0;
					refY2 = 0;
					textAnchor = "middle";
					textVerticalAnchor = "middle";
				}else{
					//텍스트 위치 값이 "텍스트 없음" 상태임
					return null;
				}

				return {
					refX : refX,
					refY : refY,
					refX2 : refX2,
					refY2 : refY2,
					textAnchor : textAnchor,
					textVerticalAnchor : textVerticalAnchor
				};
			},
			getTextFromState : function(state){
				var that = this, text, color;
				if(state == "on"){
					text = that.prop("binding/state/on/text");
					color = that.prop("binding/state/on/svgTextColor");
				}else{
					text = that.prop("binding/state/off/text");
					color = that.prop("binding/state/off/svgTextColor");
				}
				return {
					text : text,
					color : color
				};
			},
			updateTextFromState : function(state){
				var that = this;
				var textInfo = that.getTextFromState(state);
				var refPos = that.getRefPosFromTextLocation();
				if(refPos){
					that.attr("label", {
						opacity : 1,
						text : textInfo.text,
						fill : textInfo.color,
						textVerticalAnchor : refPos.textVerticalAnchor,
						textAnchor : refPos.textAnchor,
						refX : refPos.refX,
						refX2 : refPos.refX2,
						refY : refPos.refY,
						refY2 : refPos.refY2
					});
				}else{
					//텍스트를 숨김
					that.attr("label", { opacity : 0 });
				}
			},
			flipAngle : function(key) {
				var that = this;
				var angle = that.angle();
				var newAngle;
				newAngle = Math.abs(angle - 360);
				//수직뒤집기는 수평뒤집기에서 180도 회전한다.
				if (key == 'binding/hFliped') newAngle = (newAngle + 180) % 360;
				that.rotate(newAngle, true);
			},
			startCanvasListening : function() {
				var canvas = this.getCanvas();
				var commandManager = canvas ? canvas.commandManager : null;
				if (canvas) canvas._isPreventUpdate = false;
				if (commandManager) commandManager.listen();
			},
			stopCanvasListening : function() {
				var canvas = this.getCanvas();
				var commandManager = canvas ? canvas.commandManager : null;
				if (canvas) canvas._isPreventUpdate = true;
				if (commandManager) commandManager.stopListening();
			}
		},
		//Static Properties
		{
			markup : [{
				tagName : "image",
				selector : "info_0"
			}, {
				tagName : "image",
				selector : "info_1"
			}],
			defaultBindingProp : {
				type : null,
				name : "",
				image : null, //팔레트에 표시되는 아이콘 이미지
				categoryName : "",
				visible : true,
				reverse : false,
				locked : false,
				device : {
					invalid : false,
					id : null,
					name : null,
					type : null,
					mappedType : null,
					locations : null,
					controlPoint : null
				},
				minWidth : HmiCommon.GRAPHIC_MIN_WIDTH,
				minHeight : HmiCommon.GRAPHIC_MIN_HEIGHT,
				initWidth : 2,
				initHeight : 2,
				vFliped : false,
				hFliped : false,
				vAlign : null,
				hAlign : null,
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				fontType : HmiCommon.DEFAULT_FONT_TYPE,
				fontStyle : HmiCommon.DEFAULT_FONT_STYLE,
				fontWeight : HmiCommon.DEFAULT_FONT_STYLE,
				strokeWidth : null,
				strokeColor : null,
				fillColor : null,
				fontColor : null,
				value : null
			}
		});

	function extendWithBaseElement(parentElement, name, defaultProperty, prototypeProperty, staticProperty){
		//defaults와 prototype을 복사한다.
		var parentDefaults = joint.util.cloneDeep(parentElement.prototype.defaults);
		var parentPrototype = joint.util.cloneDeep(parentElement.prototype);
		//Prototype의 defaults를 삭제한다. Prototype의 Defaults가 Overwriting되기 때문.
		delete parentPrototype.defaults;
		return BaseHmiElement.define(name, joint.util.merge(parentDefaults, defaultProperty),
			joint.util.merge(parentPrototype, prototypeProperty), staticProperty);
	}

	function extendElementView(destObject, assignName, parentView, prototypeProperty, staticProperty){
		var extendedView = parentView.extend(prototypeProperty, staticProperty);
		joint.util.setByPath(destObject, assignName, extendedView, ".");
		return extendedView;
	}

	var Group = BaseHmiElement.define('hmi.Group', {
		attrs : {
			body : {
				refWidth : '100%',
				refHeight : '100%',
				stroke : 'transparent',
				fill : 'transparent'
			}
		}
	}, {
		markup : [{
			tagName : 'rect',
			selector : 'body'
		}],
		initialize : function(options){
			if(!options) options = {paletteItem: {}};
			BaseHmiElement.prototype.initialize.call(this, options);
			this.rotateAngleGrid = options.rotateAngleGird || 15;
		},
		attachEvent : function(){
			var that = this;
			BaseHmiElement.prototype.attachEvent.call(that);
			that.on('change:embeds', that.afterEmbeds.bind(that));
		},
		fitEmbeds: function(opt) {
			opt = opt || {};

			if (!this.graph) return this;

			var embeddedCells = this.getEmbeddedCells();

			if (embeddedCells.length > 0) {

				this.startBatch('fit-embeds', opt);

				if (opt.deep) {
					joint.util.invoke(embeddedCells, 'fitEmbeds', opt);
				}

				var bbox = this.graph.getCellsBBox(embeddedCells, {ignoreRotate: opt.ignoreRotate});
				var padding = joint.util.normalizeSides(opt.padding);

				bbox.moveAndExpand({
					x: -padding.left,
					y: -padding.top,
					width: padding.right + padding.left,
					height: padding.bottom + padding.top
				});

				this.set({
					position: { x: bbox.x, y: bbox.y },
					size: { width: bbox.width, height: bbox.height }
				}, opt);

				this.stopBatch('fit-embeds');
			}

			return this;
		},
		afterEmbeds : function(){
			this.fitEmbeds({deep : true, ignoreRotate : true});
			this.setCellPosition();
		},
		setCellPosition : function(){
			var that = this;
			var bbox = that.getBBox();
			var gCenter = bbox.center();
			var angle = that.angle() || 0;
			var embeddedCells = that.getEmbeddedCells();
			var minW = bbox.width, minH = bbox.height;
			var cellBbox, center;
			var tlx = bbox.x, tly = bbox.y, w = bbox.width, h = bbox.height;
			var cellsPosition = that._cellsPosition = {};
			embeddedCells.forEach(function(cell){
				cellBbox = cell.getBBox();
				center = cellBbox.center();
				minW = minW > cellBbox.width ? cellBbox.width : minW;
				minH = minH > cellBbox.height ? cellBbox.height : minH;
				center = g.Point(center.x, center.y).rotate(gCenter, g.normalizeAngle(angle));
				cellsPosition[cell.id] = {
					cxr: (center.x - tlx) / w,
					cyr: (center.y - tly) / h,
					wr: cellBbox.width / w,
					hr: cellBbox.height / h,
					angle: (cell.angle() - angle) || 0
				};
			});
			that.prop('binding/minWidth', HmiCommon.GRAPHIC_MIN_WIDTH * bbox.width / minW);
			that.prop('binding/minHeight', HmiCommon.GRAPHIC_MIN_HEIGHT * bbox.height / minH);
		},
		rotate : function(angle, absolute, origin, opt){
			var that = this;
			if (!that._cellsPosition || Object.keys(that._cellsPosition).length == 0) that.setCellPosition();
			BaseHmiElement.prototype.rotate.call(that, angle, absolute, origin, opt);
			that.resizingAndPositioningEmbeddedCells({preventSetGridPoint : true});
		},
		resize : function(width, height, opt) {
			var that = this;
			var isGroupProcess = opt && opt.isGroupProcess;

			if (!that._cellsPosition || Object.keys(that._cellsPosition).length == 0) that.setCellPosition();
			width = Math.max(width, that.prop('binding/minWidth'));
			height = Math.max(height, that.prop('binding/minHeight'));

			opt = $.extend(true, opt, {preventSetGridPoint: true, isGroupProcess: true});

			var resizeReturn = BaseHmiElement.prototype.resize.call(that, width, height, opt);
			if (!isGroupProcess) that.resizingAndPositioningEmbeddedCells({preventSetGridPoint : true});

			return resizeReturn;
		},
		position : function(x, y, opt) {
			var isGroupProcess = opt && opt.isGroupProcess;
			opt = $.extend(true, opt, {preventSetGridPoint: true, isGroupProcess: true});
			var positionReturn = BaseHmiElement.prototype.position.call(this, x, y, opt);
			if (!isGroupProcess) this.resizingAndPositioningEmbeddedCells({preventSetGridPoint : true}, false);
			return positionReturn;
		},
		resizingAndPositioningEmbeddedCells : function(opt, isFitEmbeds){
			var that = this;
			var embeddedCells = that.getEmbeddedCells();
			var bbox = that.getBBox();
			var center = bbox.center();
			var cellsPosition = that._cellsPosition || {};
			var angle = that.angle() || 0;

			var position;
			var x, y, w, h, cx, cy;
			var rc;	//회전된 model의 중심좌표
			var newAngle;	//새로 회전될 각도
			embeddedCells.forEach(function(cell){
				position = cellsPosition[cell.id];
				newAngle = position.angle + angle;
				w = bbox.width * position.wr;
				h = bbox.height * position.hr;
				cx = bbox.x + (bbox.width * position.cxr);
				cy = bbox.y + (bbox.height * position.cyr);
				//geometry의 rotate는 실제 직교좌표계의 회전방향과 같으므로 반대로 회전해야 한다.
				rc = g.Point(cx, cy).rotate(center, g.normalizeAngle(-angle));
				x = rc.x - (w / 2);
				y = rc.y - (h / 2);
				cell.resize(w, h, opt);
				cell.position(x, y, opt);
				cell.rotate(newAngle, true);
			});
			if (isFitEmbeds) that.fitEmbeds({deep : true, ignoreRotate : true});
		}
	}, {
		defaultBindingProp : {
			type : "Group",
			minWidth : HmiCommon.GRAPHIC_MIN_WIDTH,
			minHeight : HmiCommon.GRAPHIC_MIN_HEIGHT
		}
	});

	/*
		그래픽 객체 정의
		기본 그래픽
		//prop의 type 값을 "Basic"으로 정의 필요
	*/

	var BasicShape = joint.shapes.hmi.BaseHmiElement.define('hmi.BasicShape', {
		attrs : {
			body : {
				strokeDasharray : '0'
			}
		}
	}, {
		initialize : function(options){
			BaseHmiElement.prototype.initialize.apply(this, arguments);
		},
		attachEvent : function(){
			var that = this;
			that.on('change:binding', function(element, binding, opt) {
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/strokeWidth'){
					that.attr("body/strokeWidth", value);
				}else if(key == 'binding/strokeColor'){
					that.attr("body/stroke", value);
				}else if(key == 'binding/fillColor'){
					that.attr("body/fill", value);
				}else if(key == 'binding/opacity'){
					that.attr("body/opacity", value);
				}else if(key == 'binding/strokeDasharray'){
					that.setDasharray(value);
				}else if(key == 'binding/vFliped' || key == 'binding/hFliped'){
					that.flipAngle(key);
				}
			});
		},
		setDasharray : function(value) {
			this.attr('body/strokeDasharray', value);
		}
	},{
		defaultBindingProp : {
			type : "BasicShape",
			strokeWidth : 1,
			strokeColor : '#000000',
			strokeDasharray : '0',
			fillColor : '#ffffff',
			opacity : 1
		},
		getCursor : function(){
			return null;
		}
	});

	function extendWithBasicShapeElement(parentElement, name, defaultProperty, prototypeProperty, staticProperty){
		//defaults와 prototype을 복사한다.
		var parentDefaults = joint.util.cloneDeep(parentElement.prototype.defaults);
		var parentPrototype = joint.util.cloneDeep(parentElement.prototype);
		//Prototype의 defaults를 삭제한다. Prototype의 Defaults가 Overwriting되기 때문.
		delete parentPrototype.defaults;
		return BasicShape.define(name, joint.util.merge(parentDefaults, defaultProperty),
			joint.util.merge(parentPrototype, prototypeProperty), staticProperty);
	}

	var Rectangle = extendWithBasicShapeElement(joint.shapes.standard.Rectangle, 'hmi.Rectangle', {
		attrs : {
			body : {
				strokeWidth : 1,
				stroke : '#000000'
			}
		}
	}, {
	}, {
		getCursor : function(){
			return 'cursor_rectangle.png';
		}
	});

	var RoundRectangle = Rectangle.define('hmi.RoundRectangle', {
		attrs : {
			body : {
				rx : 43,
				ry : 43,
				stroke : '#000000'
			}
		}
	}, {}, {
		getCursor : function(){
			return 'cursor_round_square.png';
		}
	});

	var Parallelogram = extendWithBasicShapeElement(joint.shapes.standard.Polygon, 'hmi.Parallelogram', {
		attrs : {
			body : {
				strokeWidth : 1,
				stroke : '#000000'
			}
		}
	}, {
		initialize : function(options){
			BasicShape.prototype.initialize.apply(this, arguments);
		},
		attachEvent : function(){
			BasicShape.prototype.attachEvent.apply(this, arguments);
			var that = this;
			that.on('change:size', function() {
				that.setAttrRefPoints();
			});
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				if(key == 'binding/hFliped' || key == 'binding/vFliped'){
					that.setAttrRefPoints();
				}
			});
		},
		setAttrRefPoints : function(){
			var binding = this.prop('binding');
			var hFliped = binding.hFliped, vFliped = binding.vFliped;
			if((hFliped && vFliped) || (!hFliped && !vFliped)) this.attr('body/refPoints', '1,0 0,4 3,4 4,0');
			else this.attr('body/refPoints', '0,0 1,4 4,4 3,0');
		}
	}, {
		getCursor : function(){
			return 'cursor_parallelogram.png';
		}
	});

	var Trapezoid = Parallelogram.define('hmi.Trapezoid', {}, {
		setAttrRefPoints : function(){
			this.attr('body/refPoints', '1,0 0,4 4,4 3,0');
		}
	}, {
		getCursor : function(){
			return 'cursor_parallelogram.png';
		}
	});

	var Triangle = Parallelogram.define('hmi.Triangle', {
		attrs : {
			body : {
				strokeWidth : 1,
				stroke : '#000000'
			}
		}
	}, {
		initialize : function(options){
			BasicShape.prototype.initialize.apply(this, arguments);
		},
		attachEvent : function(){
			BasicShape.prototype.attachEvent.apply(this, arguments);
			var that = this;
			that.on('change:size', function() {
				that.setAttrRefPoints();
			});
		},
		setAttrRefPoints : function(){
			this.attr('body/refPoints', '1,0 0,2 2,2');
		}
	}, {
		getCursor : function(){
			return 'cursor_triangle.png';
		}
	});

	var Circle = extendWithBasicShapeElement(joint.shapes.standard.Ellipse, 'hmi.Circle', {
		attrs : {
			body : {
				strokeWidth : 1,
				stroke : '#000000'
			}
		}
	}, {
		initialize : function(options){
			BasicShape.prototype.initialize.apply(this, arguments);
		}
	}, {
		getCursor : function(){
			return 'cursor_circle.png';
		}
	});

	var Line = extendWithBasicShapeElement(joint.shapes.standard.Polyline, 'hmi.Line', {
		attrs : {
			body : {
				fill : 'transparent',
				stroke : '#000000',
				strokeWidth : 1,
				opacity : 1,
				// dasharray
				strokeDasharray : '0',
				// 끝점 모양
				targetMarker : {
					type : 'polyline',
					fill : 'transparent',
					stroke : '#000',
					'stroke-width' : 1,
					orient : 'auto',
					points : '0,0'
				},
				// 시작점 모양
				sourceMarker : {
					type : 'polyline',
					fill : 'transparent',
					stroke : '#000',
					'stroke-width' : 1,
					orient : 'auto',
					points : '0,0'
				}
			}
		}
	}, {
		initialize : function(options) {
			BasicShape.prototype.initialize.apply(this, arguments);
			var refPoints = options.refPoints || [];
			this.prop('refPoints', refPoints);
			this.setAttrRefPoints();
		},
		attachEvent : function() {
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/hFliped' || key == 'binding/vFliped'){
					that.flipRefPoints('x');
					that.flipAngle(key);
				}else if(key == 'binding/opacity'){
					that.attr('body/opacity', value);
				}else if(key == 'binding/sourceMarker'){
					that.setSourceMarker(value);
				}else if(key == 'binding/targetMarker'){
					that.setTargetMarker(value);
				}else if(key == 'binding/strokeDasharray'){
					that.setDasharray(value);
				}else if(key == 'binding/strokeWidth'){
					that.attr("body/strokeWidth", value);
					that.attr('body/sourceMarker', that.getMarkerOption('sourceMarker'));
					that.attr('body/targetMarker', that.getMarkerOption('targetMarker'));
				}else if(key == 'binding/strokeColor'){
					that.attr("body/stroke", value);
					that.attr('body/sourceMarker', that.getMarkerOption('sourceMarker'));
					that.attr('body/targetMarker', that.getMarkerOption('targetMarker'));
				}else if(key == 'binding/fillColor'){
					that.attr("body/fill", value);
				}else if(key == 'binding/opacity'){
					that.attr("body/opacity", value);
				}else if(key == 'binding/strokeDasharray'){
					that.setDasharray(value);
				}
			});
		},
		setDasharray : function(value) {
			this.attr('body/strokeDasharray', value);
		},
		setSourceMarker : function(value) {
			this.attr('body/sourceMarker', this.getMarkerOption('sourceMarker', value));
		},
		setTargetMarker : function(value) {
			this.attr('body/targetMarker', this.getMarkerOption('targetMarker', value));
		},
		getMarkerOption : function(markerType, opt) {
			if (!opt) opt = this.prop('binding/' + markerType);
			var newOpt = $.extend(true, {}, opt);
			var color = this.prop('binding/strokeColor');
			var width = this.prop('binding/strokeWidth');
			if (opt.fill != "transparent") newOpt.fill = color;
			newOpt['stroke'] = color;
			newOpt['stroke-width'] = width;
			return newOpt;
		},
		addRefPoint : function(offset) {
			if (Array.isArray(offset)) return this.addRefPoints(offset);
			this.addRefPoints([offset]);
		},
		/*
			포인트 추가 함수
		*/
		addRefPoints : function(offsets) {
			var that = this;
			var refPoints = that.getRefPoints();
			this.startBatch('add:refPoint');
			if (!Array.isArray(offsets)) offsets = [offsets];
			offsets.forEach(function(offset){
				var ref = that.getRefByOffset(offset.offsetX, offset.offsetY);
				if (refPoints.length === 0) {
					//포인트가 없는 경우 position을 변경한다.
					refPoints.push({x: 0, y: 0});
					that.position(offset.offsetX, offset.offsetY);
				} else {
					refPoints.push({x: ref.x, y: ref.y});
				}
			});

			that.prop('refPoints', refPoints);
			that.setSize();
			that.setAttrRefPoints();
			this.stopBatch('add:refPoint');
		},
		/*
			index에 해당하는 포인트를 offset 좌표로 변환
			index가 음수일 경우 역순으로 계산
		*/
		changeRefPoint : function(offset, index){
			var refPoints = this.getRefPoints(), len = refPoints.length;
			while (index < 0) {
				index += len;
			}
			this.startBatch('change:refPoints');
			this._isChangingPoint = true;
			var ref = this.getRefByOffset(offset.offsetX, offset.offsetY);
			refPoints[index].x = ref.x;
			refPoints[index].y = ref.y;

			this.prop('refPoints', refPoints);
			this.setSize();
			this.setAttrRefPoints();
			this._isChangingPoint = false;
			this.stopBatch('change:refPoints');
		},
		removeRefPoint : function(index){
			var refPoints = this.getRefPoints(), len = refPoints.length;
			while (index < 0) {
				index += len;
			}
			this.startBatch('remove:refPoint');
			refPoints.splice(index, 1);

			this.prop('refPoints', refPoints);
			this.setSize();
			this.setAttrRefPoints();
			this.stopBatch('remove:refPoint');
		},
		/*
			Paper Offset을 현재 Line의 Ref 좌표로 변환
		*/
		getRefByOffset : function(ox, oy) {
			var bBox = this.getBBox();
			var centerPoint = bBox.center();
			var angle = this.get('angle');
			angle = angle * Math.PI / -180;

			ox = ox > 0 ? ox : 0;
			oy = oy > 0 ? oy : 0;

			var centerRefPoint = {x: ox - centerPoint.x, y: oy - centerPoint.y};
			var rotatedRefPoint = {
				x: centerRefPoint.x * Math.cos(angle) - centerRefPoint.y * Math.sin(angle),
				y: centerRefPoint.x * Math.sin(angle) + centerRefPoint.y * Math.cos(angle)
			};

			return {
				x: rotatedRefPoint.x + centerPoint.x - bBox.x,
				y: rotatedRefPoint.y + centerPoint.y - bBox.y
			};
		},
		/*
			refPoint가 추가 또는 변경된 경우 Line 전체의 사이즈를 계산하고 refPoints를 재계산한다.
		*/
		setSize : function(){
			var that = this;
			var refPoints = that.getRefPoints();
			var maxX, minX, maxY, minY;
			var bBox = that.getBBox();
			var direction = null;
			if (refPoints.length < 2) return;
			maxX = minX = refPoints[0].x;
			maxY = minY = refPoints[0].y;

			refPoints.forEach(function(refPoint){
				if (refPoint.x > maxX) maxX = refPoint.x;
				if (refPoint.x < minX) minX = refPoint.x;
				if (refPoint.y > maxY) maxY = refPoint.y;
				if (refPoint.y < minY) minY = refPoint.y;
			});
			refPoints.forEach(function(refPoint){
				refPoint.x -= minX;
				refPoint.y -= minY;
			});

			var width = maxX - minX, height = maxY - minY;
			if (width === 0 && height === 0) direction = null;
			else if (minX === 0 && maxX !== bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top-right';
			else if (minX === 0 && maxX !== bBox.width && minY === 0 && maxY === bBox.height) direction = 'right';
			else if (minX !== 0 && maxX === bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top-left';
			else if (minX === 0 && maxX === bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top';
			else if (minX !== 0 && maxX === bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom-left';
			else if (minX !== 0 && maxX === bBox.width && minY === 0 && maxY === bBox.height) direction = 'left';
			else if (minX === 0 && maxX !== bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom-right';
			else if (minX === 0 && maxX === bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom';

			that.prop('refPoints', refPoints);

			//resize function 참조(rappid.js 13553 Line)
			if (direction) {
				var currentSize = this.get('size');

				switch (direction) {

				case 'left':
				case 'right':
					height = currentSize.height;
					break;

				case 'top':
				case 'bottom':
					width = currentSize.width;
					break;
				default:
				}

				var angle = g.normalizeAngle(this.get('angle') || 0);

				var quadrant = {
					'top-right': 0,
					'right': 0,
					'top-left': 1,
					'top': 1,
					'bottom-left': 2,
					'left': 2,
					'bottom-right': 3,
					'bottom': 3
				}[direction];

				var fixedPoint = bBox[['bottomLeft', 'corner', 'topRight', 'origin'][quadrant]]();

				var imageFixedPoint = g.point(fixedPoint).rotate(bBox.center(), -angle);

				var radius = Math.sqrt((width * width) + (height * height)) / 2;

				var alpha = quadrant * Math.PI / 2;

				alpha += Math.atan(quadrant % 2 == 0 ? height / width : width / height);

				alpha -= g.toRad(angle);

				var center = g.point.fromPolar(radius, alpha, imageFixedPoint);

				var origin = g.point(center).offset(width / -2, height / -2);

				this.set('size', { width: width, height: height });

				this.position(origin.x, origin.y, {preventSetGridPoint: true});

			} else {
				that._isSetSize = true;
				that.position(bBox.x + minX, bBox.y + minY, {preventSetGridPoint: true});
				that.resize(maxX - minX, maxY - minY, {preventSetGridPoint: true});
				that._isSetSize = false;
			}

		},
		/*
			refPoints를 attr 속성으로 변환
		*/
		setAttrRefPoints : function() {
			var refPoints = this.getRefPoints();
			var strRefPoints = '';

			refPoints.forEach(function(refPoint){
				strRefPoints += (refPoint.x + ',' + refPoint.y + ' ');
			});
			strRefPoints = strRefPoints.trim();

			this.attr('body/refPoints', strRefPoints);
		},
		flipRefPoints : function(dir) {
			var bBox = this.getBBox(), base = dir === 'x' ? bBox.width : bBox.height;
			var refPoints = this.getRefPoints(), len = refPoints.length;
			var index, refPoint;
			for (index = 0; index < len; index++) {
				refPoint = refPoints[index];
				refPoint[dir] = base - refPoint[dir];
			}
			this.prop('refPoints', refPoints);
			this.setAttrRefPoints();
		},
		getRefPoints : function() {
			return $.extend(true, [], this.prop('refPoints'));
		},
		resize : function(width, height, opt) {
			var that = this;
			var bbox = this.getBBox();
			var prevWidth = bbox.width, prevHeight = bbox.height;

			that.startBatch('change:size');
			opt = $.extend(true, opt, {preventSetGridPoint: true});
			BaseHmiElement.prototype.resize.call(this, width, height, opt);

			if(width == 0) width = 1;
			if(height == 0) height = 1;

			var refPoints = this.getRefPoints();
			if (refPoints.length < 2) return;
			refPoints.forEach(function(refPoint) {
				if (that._isSetSize) return;
				refPoint.x = prevWidth > 0 ? refPoint.x * width / prevWidth : refPoint.x;
				refPoint.y = prevHeight > 0 ? refPoint.y * height / prevHeight : refPoint.y;
			});
			that.prop('refPoints', refPoints);
			//setSize로인한 포인트 변경이 아닐 경우 (resize() 함수호출하여 좌표값 변경되었을 경우)
			if(!that._isSetSize) that.setAttrRefPoints();
			that.stopBatch('change:size');
		},
		setBindingData : function(data){
			BaseHmiElement.prototype.setBindingData.call(this, data);
			var sourceMarker = data.sourceMarker, targetMarker = data.targetMarker, strokeDasharray = data.strokeDasharray;
			this.prop("binding/sourceMarker", sourceMarker);
			this.prop("binding/targetMarker", targetMarker);
			this.prop("binding/strokeDasharray", strokeDasharray);
		},
		getGraphicBindingPopupData : function(){
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(this);
			var bindingData = this.prop("binding");
			data.sourceMarker = bindingData.sourceMarker;
			data.targetMarker = bindingData.targetMarker;
			data.strokeDasharray = bindingData.strokeDasharray;
			return data;
		}
	},{
		defaultBindingProp : {
			type : "Line",
			minWidth : 0,
			minHeight : 0,
			strokeWidth : 1,
			strokeColor : '#000000',
			strokeDasharray : '0',
			opacity : 1,
			sourceMarker : {
				fill : 'transparent',
				points : '0,0'
			},
			targetMarker : {
				fill : 'transparent',
				points : '0,0'
			}
		},
		getCursor : function(){
			return 'cursor_line.png';
		}
	});

	var Straight = Line.define('hmi.Straight', {}, {});

	var Curve = Line.define('hmi.Curve', {}, {
		initialize : function(options) {
			BasicShape.prototype.initialize.apply(this, arguments);
			var refPoints = options.refPoints || [];
			this.prop('refPoints', refPoints);
			this.setSize();
			this.setAttrRefPoints();
		},
		/*
			Path 각 포인트(시작, 끝점 제외)에서 곡선이 시작되는 지점 반환
			Radius 40 기준. 선 길이가 80 미만일 경우 중점으로 지정
		*/
		getBezierCurvePoint : function(startPoint, endPoint) {
			var line = new g.Line(new g.Point(startPoint.x, startPoint.y), new g.Point(endPoint.x, endPoint.y));
			var len = line.length();
			return len >= 80 ? line.pointAtLength(40) : line.midpoint();
		},
		convertCurveToPolyline : function() {
			var that = this;
			var refPoints = that.getRefPoints(), len = refPoints.length;
			var polylineRefPoints = [];

			refPoints.forEach(function(refPoint, index) {
				var prevPoint, nextPoint,
					prevCurvePoint, nextCurvePoint,
					curve, convertedPolyline;
				if (index === 0) {
					polylineRefPoints.push(new g.Point(refPoint.x, refPoint.y));
				} else if (index < len - 1) {
					prevPoint = refPoints[index - 1];
					nextPoint = refPoints[index + 1];

					prevCurvePoint = that.getBezierCurvePoint(refPoint, prevPoint);
					nextCurvePoint = that.getBezierCurvePoint(refPoint, nextPoint);

					curve = new g.Curve(
						prevCurvePoint,
						new g.Point(refPoint.x, refPoint.y),
						new g.Point(refPoint.x, refPoint.y),
						nextCurvePoint
					);

					convertedPolyline = curve.toPolyline().points;

					polylineRefPoints = polylineRefPoints.concat(convertedPolyline);
				} else {
					prevPoint = refPoints[index - 1];
					prevCurvePoint = that.getBezierCurvePoint(refPoint, prevPoint);
					polylineRefPoints.push(
						new g.Point(prevCurvePoint.x, prevCurvePoint.y),
						new g.Point(refPoint.x, refPoint.y)
					);
				}
			});
			if (polylineRefPoints.length > 1) {
				var polyline = new g.Polyline(polylineRefPoints);
				var polylineBbox = polyline.bbox();
				that.set('size', {width: polylineBbox.width, height: polylineBbox.height});
			}
			that.prop('polylineRefPoints', polylineRefPoints);
			return polylineRefPoints;
		},
		setSize : function(){
			var that = this;
			var refPoints = that.getRefPoints();
			var prevRefPoints = that.getPolylineRefPoints();
			var prevPolyline = new g.Polyline(prevRefPoints);
			var convertedRefPoints = that.convertCurveToPolyline();
			var maxX, minX, maxY, minY;
			var bBox = that.getBBox();
			var size = prevPolyline.bbox();
			var direction = null;
			if (refPoints.length < 2) return;
			maxX = minX = convertedRefPoints[0].x;
			maxY = minY = convertedRefPoints[0].y;
			convertedRefPoints.forEach(function(convertedRefPoint){
				if (convertedRefPoint.x > maxX) maxX = convertedRefPoint.x;
				if (convertedRefPoint.x < minX) minX = convertedRefPoint.x;
				if (convertedRefPoint.y > maxY) maxY = convertedRefPoint.y;
				if (convertedRefPoint.y < minY) minY = convertedRefPoint.y;
			});
			refPoints.forEach(function(refPoint){
				refPoint.x -= minX;
				refPoint.y -= minY;
			});

			convertedRefPoints.forEach(function(convertedRefPoint){
				convertedRefPoint.x -= minX;
				convertedRefPoint.y -= minY;
			});

			var polyline = new g.Polyline(convertedRefPoints);
			var polylineBbox = polyline.bbox();
			var width = polylineBbox.width, height = polylineBbox.height;

			if (width === 0 && height === 0) direction = null;
			else if (minX === 0 && maxX !== bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top-right';
			else if (minX === 0 && maxX !== bBox.width && minY === 0 && maxY === bBox.height) direction = 'right';
			else if (minX !== 0 && maxX === bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top-left';
			else if (minX === 0 && maxX === bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top';
			else if (minX !== 0 && maxX === bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom-left';
			else if (minX !== 0 && maxX === bBox.width && minY === 0 && maxY === bBox.height) direction = 'left';
			else if (minX === 0 && maxX !== bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom-right';
			else if (minX === 0 && maxX === bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom';

			that.prop('refPoints', refPoints);

			//resize function 참조(rappid.js 13553 Line)
			if (direction) {
				// var currentSize = this.get('size');
				var currentSize = size;

				switch (direction) {

				case 'left':
				case 'right':
					height = currentSize.height;
					break;

				case 'top':
				case 'bottom':
					width = currentSize.width;
					break;
				default:
				}

				var angle = g.normalizeAngle(this.get('angle') || 0);

				var quadrant = {
					'top-right': 0,
					'right': 0,
					'top-left': 1,
					'top': 1,
					'bottom-left': 2,
					'left': 2,
					'bottom-right': 3,
					'bottom': 3
				}[direction];

				var fixedPoint = bBox[['bottomLeft', 'corner', 'topRight', 'origin'][quadrant]]();

				var imageFixedPoint = g.point(fixedPoint).rotate(bBox.center(), -angle);

				var radius = Math.sqrt((width * width) + (height * height)) / 2;

				var alpha = quadrant * Math.PI / 2;

				alpha += Math.atan(quadrant % 2 == 0 ? height / width : width / height);

				alpha -= g.toRad(angle);

				var center = g.point.fromPolar(radius, alpha, imageFixedPoint);

				var origin = g.point(center).offset(width / -2, height / -2);

				this.set('size', { width: width, height: height });

				this.position(origin.x, origin.y, {preventSetGridPoint: true});

			} else {
				that._isSetSize = true;
				that.position(bBox.x + minX, bBox.y + minY, {preventSetGridPoint: true});
				that.resize(width, height, {preventSetGridPoint: true});
				that._isSetSize = false;
			}

			that.prop('polylineRefPoints', convertedRefPoints);
		},
		setAttrRefPoints : function() {
			var refPoints = this.getPolylineRefPoints();
			var strRefPoints = '';

			refPoints.forEach(function(refPoint){
				strRefPoints += (refPoint.x + ',' + refPoint.y + ' ');
			});
			strRefPoints = strRefPoints.trim();

			this.attr('body/refPoints', strRefPoints);
		},
		flipRefPoints : function(dir) {
			var bBox = this.getBBox(), base = dir === 'x' ? bBox.width : bBox.height;
			var refPoints = this.getRefPoints(), len = refPoints.length;
			var index, refPoint;
			for (index = 0; index < len; index++) {
				refPoint = refPoints[index];
				refPoint[dir] = base - refPoint[dir];
			}
			this.prop('refPoints', refPoints);
			this.convertCurveToPolyline();
			this.setAttrRefPoints();
		},
		getPolylineRefPoints : function() {
			return $.extend(true, [], this.prop('polylineRefPoints'));
		}
	}, {
		getCursor : function(){
			return 'cursor_curve.png';
		}
	});

	var tableError = function(message) {
		throw new Error('shapes.standard.Record: ' + message);
	};

	var Table = extendWithBaseElement(joint.shapes.standard.Record, 'hmi.Table', {
		padding : 0,
		attrs : {
			body : {
				refWidth : '100%',
				refHeight : '100%',
				stroke : 'transparent',
				fill : 'transparent',
				event : 'element:table-boundary:click'
			},
			itemBodies : {
				stroke : '#000000',
				strokeWidth : 1,
				strokeDasharray : '0',
				event : 'element:table-cell:click',
				fill : '#ffffff'
				// stroke : 'transparent'
			},
			itemLabels : {
				textAnchor : 'start',
				textVerticalAnchor : 'middle',
				event : 'element:table-cell:click'
			},
			rowHandles : {
				event : 'element:table-resize:click'
			},
			columnHandles : {
				event : 'element:table-resize:click'
			}
		},
		itemOffset : 0,
		itemOverflow : true
	}, {
		markup : [{
			tagName : "image",
			selector : "info_0"
		}, {
			tagName : "image",
			selector : "info_1"
		}, {
			tagName: 'rect',
			selector: 'body'
		}],
		initialize : function(){
			BasicShape.prototype.initialize.apply(this, arguments);
			this.on('change', this.onChange, this);
			this.buildMarkup();
		},
		attachEvent : function(){
			var that = this;

			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/fillColor'){
					that.attr('itemBodies/fill', value);
				}else if(key == 'binding/strokeColor'){
					that.attr('itemBodies/stroke', value);
				}else if(key == 'binding/strokeWidth'){
					that.attr('itemBodies/strokeWidth', value);
				}else if(key == 'binding/strokeDasharray'){
					that.attr('itemBodies/strokeDasharray', value);
				}else if(key == 'binding/fontColor'){
					that.attr('itemLabels/fill', value);
				}else if(key == 'binding/fontSize'){
					that.attr('itemLabels/fontSize', value);
				}else if(key == 'binding/fontType'){
					that.attr('itemLabels/fontFamily', value);
				}else if(key == 'binding/fontStyle'){
					that.attr("itemLabels/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("itemLabels/fontWeight", value);
				}
			});

			that.on('element:table-cell:click', function(){
				that.$cellSelection = that.getCellSelection();
			});
			that.on('element:table-resize:click', function(cellView, evt) {
				var el = $(evt.target);
				var selector = el.attr('joint-selector');
				if (selector.indexOf('columnHandle') !== -1 || selector.indexOf('rowHandle') !== -1) {
					that._isResizeDragging = true;
					that._dragStartX = evt.clientX;
					that._dragStartY = evt.clientY;
					that._resizingId = el.attr('resize-id');
				}
			});

			that.on('event:pointermove', function(cellView, evt) {
				if (that._isResizeDragging) {
					var movedX = evt.clientX;
					var movedY = evt.clientY;
					var dx = movedX - that._dragStartX;
					var dy = movedY - that._dragStartY;
					that._dragStartX = movedX;
					that._dragStartY = movedY;
					that.onResizeColumnRow(dx, dy);
				}
			});

			that.on('event:pointerup', function() {
				if(that._isResizeDragging) that._isResizeDragging = false;
				else if(that._isCellDragging) that._isCellDragging = false;
				that._dragStartCell = null;
			});

			that.on('change:size change:position', function() {
				that.updateCellSelectionBox();
			});
			that.on('change:markup', that.buildMarkup.bind(that));
			that.on('remove', that.onRemove.bind(that));
		},
		setFillColor : function(color) {
			var that = this;
			var cells = this.getHighlightedCells();
			var id;
			if (cells.length == 0) cells = that.getCellsIds();
			cells.forEach(function(cell) {
				id = cell.id;
				that.attr('itemBody_' + id + '/fill', color);
			});
		},
		setFontColor : function(color) {
			var that = this;
			var cells = this.getHighlightedCells();
			var id;
			if (cells.length == 0) cells = that.getCellsIds();
			cells.forEach(function(cell) {
				id = cell.id;
				that.attr('itemLabel_' + id + '/fill', color);
			});
		},
		getFillColor : function(){
			var that = this;
			var cells = this.getHighlightedCells();
			var id, cellColor;
			var color = HmiCommon.DEFAULT_FILL_COLOR;
			if (cells.length == 0) cells = that.getCellsIds();
			cells.forEach(function(cell) {
				id = cell.id;
				cellColor = that.attr('itemBody_' + id + '/fill');
				if (cellColor != HmiCommon.DEFAULT_FILL_COLOR) color = cellColor;
			});

			return color;
		},
		getFontColor : function(){
			var that = this;
			var cells = this.getHighlightedCells();
			var id, fontColor;
			var color = HmiCommon.DEFAULT_TEXT_FILL_COLOR;
			if (cells.length == 0) cells = that.getCellsIds();
			cells.forEach(function(cell) {
				id = cell.id;
				fontColor = that.attr('itemLabel_' + id + '/fill');
				if (fontColor != HmiCommon.DEFAULT_TEXT_FILL_COLOR) color = fontColor;
			});

			return color;
		},
		setFontStyle : function(style) {
			var that = this;
			var cells = this.getHighlightedCells();
			var id, curStyle;
			if (cells.length == 0) cells = that.getCellsIds();
			cells.forEach(function(cell) {
				id = cell.id;
				if (style == 'Italic') {
					curStyle = that.attr('itemLabel_' + id + '/fontStyle');
					that.attr('itemLabel_' + id + '/fontStyle', curStyle == style ? "Normal" : style);
				} else {
					that.attr('itemLabel_' + id + '/fontStyle', "Normal");
				}
			});
		},
		setFontWeight : function(weight){
			var that = this;
			var cells = this.getHighlightedCells();
			var id, curStyle;
			if (cells.length == 0) cells = that.getCellsIds();
			cells.forEach(function(cell) {
				id = cell.id;
				if (weight == 'Bold') {
					curStyle = that.attr('itemLabel_' + id + '/fontWeight');
					that.attr('itemLabel_' + id + '/fontWeight', curStyle == weight ? "Normal" : weight);
				} else {
					that.attr('itemLabel_' + id + '/fontWeight', "Normal");
				}
			});
		},
		getFontStyle : function() {
			var that = this;
			var cells = this.getHighlightedCells();
			var id, cellStyle;
			var fontStyle = "Normal";
			if (cells.length == 0) cells = that.getCellsIds();
			cells.forEach(function(cell) {
				id = cell.id;
				cellStyle = that.attr("itemLabel_" + id + "/fontStyle");
				if (cellStyle == "Italic") fontStyle = "Italic";
			});
			return fontStyle;
		},
		getFontWeight : function() {
			var that = this;
			var cells = this.getHighlightedCells();
			var id, cellWeight;
			var fontWeight = "Normal";
			if (cells.length == 0) cells = that.getCellsIds();
			cells.forEach(function(cell) {
				id = cell.id;
				cellWeight = that.attr("itemLabel_" + id + "/fontWeight");
				if (cellWeight == "Bold") fontWeight = "Bold";
			});
			return fontWeight;
		},
		setTextAlign : function(propertyName, align){
			var that = this;
			var cells = that.getHighlightedCells();
			var id;
			var itemAttrName = propertyName.split('/')[1];
			var attrName = propertyName == 'binding/vAlign' ? '/textVerticalAnchor' : '/textAnchor';
			var value;
			switch(align){
			case 'right':
				value = 'end';
				break;
			case 'left':
				value = 'start';
				break;
			case 'center':
				value = 'middle';
				break;
			default:
				value = align;
			}
			if (cells.length == 0) cells = that.getCellsIds();
			var newItems = $.extend(true, [], that.attributes.items);
			var c, r, i = 0;
			var colLen = that._columnWidth.length, rowLen;
			var col, cell;
			var highlightedCell = cells[i++];
			for (c = 0; c < colLen; c++) {
				col = newItems[c];
				rowLen = col.length;
				for (r = 0; r < rowLen; r++) {
					cell = col[r];
					id = cell.id;
					if (id == highlightedCell.id) {
						cell[itemAttrName] = value;
						that.attr('itemLabel_' + id + attrName, value);
						highlightedCell = cells[i++];
						if (!highlightedCell) break;
					}
				}
				if (!highlightedCell) break;
			}

			that.set('items', newItems);
		},
		getTextAlign : function(align){
			var that = this;
			var cells = that.getHighlightedCells();
			if (cells.length == 0) cells = that.getCellsIds();
			var id, cellAlign;
			var isVAlign = align == 'vAlign';
			var attrName = isVAlign ? '/textVerticalAnchor' : '/textAnchor';
			var defaultValue = isVAlign ? 'middle' : 'start';
			var value = defaultValue;

			cells.forEach(function(cell) {
				id = cell.id;
				cellAlign = that.attr('itemLabel_' + id + attrName);
				if (cellAlign && cellAlign != defaultValue) value = cellAlign;
			});

			switch(value){
			case 'start':
				value = 'left';
				break;
			case 'end':
				value = 'right';
				break;
			case 'middle':
				value = isVAlign ? value : 'center';
				break;
			default:
				value = value;
			}
			return value;
		},
		getCellsIds : function() {
			var ids = [];
			var items = this.metrics ? this.metrics.items : {};
			$.each(items, function(cellId){
				ids.push({id: cellId});
			});
			return ids;
		},
		isMergeable : function() {
			var cells = this.getHighlightedCells();
			return cells.length > 1;
		},
		isUnmergeable : function() {
			var cells = this.getHighlightedCells();
			for (var i = 0; i < cells.length; i++) {
				if (cells[i].mergeColumn > 1 || cells[i].mergeRow > 1) return true;
			}
			return false;
		},
		getCellSelection : function() {
			if (this.$cellSelection) return this.$cellSelection;
			var position = this.getBBox();
			var scale;
			if (this.graph) scale = this.graph._paper.scale();
			else scale = {sx: 1, sy: 1};
			var $el = $('<div/>', {
				class: 'joint-cell-selection no-selected',
				css: {
					position: 'absolute',
					left: (position.x + 2) * scale.sx,
					top: (position.y + 2) * scale.sy,
					width: (position.width - 2) * scale.sx,
					height: (position.height - 2) * scale.sy
				}
			});
			$('<div/>', {
				class: 'cell-highlighted',
				css: {
					position: 'absolute'
				}
			}).appendTo($el);

			$el.on('mousedown', this.mousedownCellEvt.bind(this));
			$el.on('mousemove', this.mousemoveCellEvt.bind(this));
			$el.on('mouseup', this.mouseupCellEvt.bind(this));

			this.graph._paper.$el.append($el);
			return $el;
		},
		mousedownCellEvt : function(evt) {
			var that = this;
			var localPoint = that.graph._paper.snapToGrid(evt.clientX, evt.clientY);
			var itemId = that.getItemIdWithPosition(localPoint.x, localPoint.y);
			var cells = that.getHighlightedCells();
			if (cells.length == 1 && cells[0].id == itemId) {
				that.addTextareaOnCellSelection(cells[0]);
			} else {
				that._isCellDragging = true;
				that._dragStartCell = itemId;
				that.updateCellSelectionBox(itemId);
			}
		},
		mousemoveCellEvt : function(evt) {
			if (this._isCellDragging) {
				var localPoint = this.graph._paper.snapToGrid(evt.clientX, evt.clientY);
				var itemId = this.getItemIdWithPosition(localPoint.x, localPoint.y);
				this.updateCellSelectionBox(this._dragStartCell, itemId);
			}
		},
		mouseupCellEvt : function(evt) {
			if(this._isCellDragging) {
				this._isCellDragging = false;
				this._updateHighlightedCells();
			}
			this._dragStartCell = null;
		},
		addTextareaOnCellSelection : function(target) {
			var that = this;
			if (that.prop('binding/locked')) return;
			var $el = that.$cellSelection;
			var selection = $el.find('.cell-highlighted');
			if (selection.children('textarea').length > 0) return;
			var textarea = $('<textarea/>')
				.css('backgroundColor', target.fill)
				.val(target.label);

			that._textareaTarget = target.id;

			selection.append(textarea);
			setTimeout(function(){
				textarea.focus();
			}, 0);
		},
		updateCellSelectionBox : function(startCell, endCell) {
			var that = this;
			var metrics = that.metrics || {};
			var items = metrics.items || {};
			var box;
			if (startCell) {
				var cells = [$.extend(true, {id : startCell}, items[startCell])];
				if (endCell) cells.push($.extend(true, {id : endCell}, items[endCell]));
				box = that._selectedBox = that.getCellsBox(cells);
			} else {
				box = that._selectedBox;
			}
			var position = that.getBBox();
			var scale;
			if (that.graph) scale = that.graph._paper.scale();
			else scale = {sx: 1, sy: 1};
			var $cellSelection = that.$cellSelection;
			if (!$cellSelection) return;
			$cellSelection.css({
				left: (position.x + 2) * scale.sx,
				top: (position.y + 2) * scale.sy,
				width: (position.width - 2) * scale.sx,
				height: (position.height - 2) * scale.sy
			});
			if (!box) return;
			var isCellSelected = box.col.min > box.col.max ? false : true;
			if (isCellSelected && $cellSelection.hasClass('no-selected')) $cellSelection.removeClass('no-selected');
			else if (!isCellSelected && !$cellSelection.hasClass('no-selected')) $cellSelection.addClass('no-selected');

			var cellSelectionBox = $cellSelection.find('.cell-highlighted');
			var columnWidth = that._columnWidth;
			var rowHeight = that._rowHeight;
			var x = 0, y = 0, width = 0, height = 0;
			var i;

			for (i = 0; i < columnWidth.length; i++) {
				if (i + 1 < box.col.min) x += columnWidth[i];
				if (i + 1 >= box.col.min && i + 1 <= box.col.max) width += columnWidth[i];
				if (i + 1 > box.col.max) break;
			}
			for (i = 0; i < rowHeight.length; i++) {
				if (i + 1 < box.row.min) y += rowHeight[i];
				if (i + 1 >= box.row.min && i + 1 <= box.row.max) height += rowHeight[i];
				if (i + 1 > box.row.max) break;
			}

			var textarea = cellSelectionBox.find('textarea');
			if (textarea.length > 0 && that._textareaTarget) {
				that.changeLabel(that._textareaTarget, textarea.val());
				that._textareaTarget = null;
				cellSelectionBox.empty();
			}
			if (!cellSelectionBox.hasClass('selected')) cellSelectionBox.addClass('selected');
			cellSelectionBox.css({
				left: (x - 4) * scale.sx,
				top: (y - 4) * scale.sy,
				width: (width) * scale.sx,
				height: (height) * scale.sy
			});
		},
		getCellsBox : function(cells) {
			if (typeof cells == 'string') {
				var item = this.metrics.items[cells];
				cells = [{
					id: cells,
					mergeRow: item.mergeRow,
					mergeColumn: item.mergeColumn
				}];
			}
			var cellIdx;
			var box = {
				col: {
					min: HmiCommon.DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT,
					max: 0
				},
				row: {
					min: HmiCommon.DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT,
					max: 0
				}
			};

			var i;
			var col, row;
			for (i = 0; i < cells.length; i++) {
				cellIdx = this.getColumnRowIndexById(cells[i].id);
				col = cellIdx.col - 1 + cells[i].mergeColumn;
				row = cellIdx.row - 1 + cells[i].mergeRow;
				box.col.min = cellIdx.col < box.col.min ? cellIdx.col : box.col.min;
				box.col.max = col > box.col.max ? col : box.col.max;
				box.row.min = cellIdx.row < box.row.min ? cellIdx.row : box.row.min;
				box.row.max = row > box.row.max ? row : box.row.max;
			}

			return box;
		},
		getHighlightedCells : function() {
			return this._highlighted || [];
		},
		_updateHighlightedCells : function() {
			var that = this;
			var items = that.attributes.items;
			var highlighted = that._highlighted = [];
			var selectedBox = that._selectedBox;
			var idx, r;
			var mergedColumnInfo = {};
			if (!selectedBox) return highlighted;
			items.forEach(function(column) {
				column.forEach(function(cell) {
					idx = that.getColumnRowIndexById(cell.id);
					if (cell.mergeColumn > 1) {
						for (r = idx.row; r < idx.row + cell.mergeRow; r++) {
							mergedColumnInfo[r] = {
								min: idx.col,
								max: idx.col + cell.mergeColumn - 1
							};
						}
					}
					if (idx.col >= selectedBox.col.min && idx.col <= selectedBox.col.max
						&& idx.row >= selectedBox.row.min && idx.row <= selectedBox.row.max
						&& !(mergedColumnInfo[idx.row] && idx.col > mergedColumnInfo[idx.row].min && idx.col <= mergedColumnInfo[idx.row].max)) highlighted.push(cell);
				});
			});
			if (this.graph) this.graph._paper.trigger('element:table-selection:changed');
		},
		//이벤트로 받아온 localPoint 좌표에 해당하는 cell의 id를 반환
		getItemIdWithPosition : function(x, y) {
			var that = this;
			var curPos = this.position();
			var targetX = x - curPos.x;
			var targetY = y - curPos.y;
			var groups = that.attributes.items;
			if (!Array.isArray(groups)) groups = [];

			var totalX = 0;
			var totalY = 0;
			var targetRow = 0;
			var targetColumn = 0;
			var i, j;
			var maxJ;
			var column, cell;
			var rowHeight = this._rowHeight || [];
			var columnWidth = this._columnWidth || [];

			for (i = 0; i < rowHeight.length; i++) {
				totalY += rowHeight[i];
				if (totalY > targetY) {
					targetRow = i;
					break;
				}
			}
			for (j = 0; j < columnWidth.length; j++) {
				totalX += columnWidth[j];
				if (totalX > targetX) {
					targetColumn = j;
					break;
				}
			}

			if (targetRow >= rowHeight.length || targetColumn >= columnWidth.length) return null;

			var eor, eoc; //end of row/column
			var cellIdx;
			for (i = 0; i <= targetColumn; i++) {
				column = groups[i];
				maxJ = Math.min(targetRow, column.length - 1);
				for (j = 0; j <= maxJ; j++) {
					cell = column[j];
					cellIdx = this.getColumnRowIndexById(cell.id);
					eoc = Number(cell.mergeColumn) + cellIdx.col - 2;
					eor = Number(cell.mergeRow) + cellIdx.row - 2;
					if (eor >= targetRow && eoc >= targetColumn) {
						return cell.id;
					}
				}
			}

			return null;
		},
		clearHighlighted : function() {
			if (this.$cellSelection) {
				var textarea = this.$cellSelection.find('textarea');
				if (textarea.length > 0 && this._textareaTarget) {
					this.changeLabel(this._textareaTarget, textarea.val());
					this._textareaTarget = null;
				}
				this.$cellSelection.remove();
			}
			this.$cellSelection = null;
			this._selectedBox = {
				col: {
					min: HmiCommon.DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT,
					max: 0
				},
				row: {
					min: HmiCommon.DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT,
					max: 0
				}
			};
			this._highlighted = [];
		},
		isSingleHighlightedCell : function(itemId) {
			var cells = this.getHighlightedCells();
			if (cells.length != 1) return false;
			return cells[0].id == itemId;
		},
		changeLabel : function(itemId, text) {
			var groups = $.extend(true, [], this.attributes.items);
			var idx = this.getColumnRowIndexById(itemId);
			var item = groups[idx.col - 1][idx.row - 1];
			if (item.label != text) {
				this.startBatch('change:item');
				item.label = text;
				this.set('items', groups);
				this.stopBatch('change:item');
			}
		},
		getColumnRowIndexById : function(itemId) {
			if (!itemId) return { col: 0, row: 0 };
			var col, row;
			var splitedId = itemId.split('-');
			col = splitedId[0].split('col')[1];
			row = splitedId[1].split('row')[1];
			return {col: Number(col), row: Number(row)};
		},
		onResizeColumnRow : function(dx, dy) {
			var that = this;
			var items = that.attributes.items, item, rows, newItems = [], newCol = [];
			var columnLength = items.length, rowLength = 0;
			var resizeAttr = that._resizingId.split('-resize-');
			var resizeDirection = resizeAttr[0];
			var resizeIndex = Number(resizeAttr[1]);

			var rowHeight = this._rowHeight;
			var columnWidth = this._columnWidth;

			var c, r;
			var newWidth, newHeight;
			if (resizeDirection === 'col') {
				if (columnWidth[resizeIndex - 1] + dx < 5) dx = 5 - columnWidth[resizeIndex - 1];
				else if (columnWidth[resizeIndex] - dx < 5) dx = columnWidth[resizeIndex] - 5;
			} else if (resizeDirection === 'row') {
				if (rowHeight[resizeIndex - 1] + dy < 5) dy = 5 - rowHeight[resizeIndex - 1];
				else if (rowHeight[resizeIndex] - dy < 5) dy = rowHeight[resizeIndex] - 5;
			}

			var cellIdx;

			for (c = 0; c < columnLength; c++) {
				newCol = [];
				rows = items[c];
				rowLength = rows.length;
				for (r = 0; r < rowLength; r++) {
					item = rows[r];
					cellIdx = this.getColumnRowIndexById(item.id);
					if (resizeDirection === 'col') {
						newHeight = item.height;
						if (cellIdx.col == resizeIndex) {
							newWidth = item.width + dx;
						} else if (cellIdx.col == (resizeIndex + 1)) {
							newWidth = item.width - dx;
						} else {
							newWidth = item.width;
						}
					} else if (resizeDirection === 'row') {
						newWidth = item.width;
						if (cellIdx.row == resizeIndex) {
							newHeight = item.height + dy;
						} else if (cellIdx.row == (resizeIndex + 1)) {
							newHeight = item.height - dy;
						} else {
							newHeight = item.height;
						}
					}
					newCol.push({
						label: item.label,
						width: newWidth,
						height: newHeight,
						path: item.path,
						visible: item.visible,
						parent: item.parent,
						group: item.group,
						hasSubItems: item.hasSubItems,
						highlighted: item.highlighted,
						collapsed: item.collapsed,
						mergeRow: item.mergeRow,
						mergeColumn: item.mergeColumn
					});
				}
				newItems.push(newCol);
			}

			that.set('items', newItems);
		},
		resize : function(width, height, opt){
			var that = this;
			var items = this.get('items');
			opt = $.extend(true, opt, {preventSetGridPoint: true});

			if (opt.record !== this.id) {
				var bbox = this.getBBox();
				var newItems = $.extend(true, [], items);
				var minWidth = this.prop('binding/minWidth');
				var minHeight = this.prop('binding/minHeight');
				width = Math.max(minWidth, width);
				height = Math.max(minHeight, height);
				var idx;
				var rhr = that._rowHeightRatio, cwr = that._columnWidthRatio;
				newItems.forEach(function(item){
					item.forEach(function(cell){
						idx = that.getColumnRowIndexById(cell.id);
						cell.height = height * rhr[idx.row - 1];
						cell.width = width * cwr[idx.col - 1];
					});
				});
				this.set('items', newItems);

				var dx = 0, dy = 0;
				var dir = opt.trueDirection || 'bottom-right';
				if (dir.indexOf('top') != -1) dy = bbox.height - height;
				if (dir.indexOf('left') != -1) dx = bbox.width - width;
				if (dx != 0 || dy != 0) this.translate(dx, dy, opt);

				return this;
			}
			return BaseHmiElement.prototype.resize.call(this, width, height, opt);
		},
		mergeCell: function(){
			var box = this.getHighlightedBox();
			if (!box) return;
			this.startBatch('merge-cell');

			this.unmergeCell();
			var groups = this.attributes.items;
			groups = $.extend(true, [], groups);

			var r;
			var column = groups[box.col.min - 1];
			var cell;
			var cellIdx;
			for (r = 0; r < column.length; r++) {
				cell = column[r];
				cellIdx = this.getColumnRowIndexById(cell.id);
				if (cellIdx.row != box.row.min) continue;
				cell.mergeRow = box.row.max - box.row.min + 1;
				cell.mergeColumn = box.col.max - box.col.min + 1;
				if (cell.mergeRow > 1) column.splice(r + 1, cell.mergeRow - 1);
				break;
			}

			this.set('items', groups);
			this.stopBatch('merge-cell');
			this._updateHighlightedCells();
		},
		unmergeCell: function(){
			var box = this.getHighlightedBox();
			if (!box) return;
			this.startBatch('seperate-cell');

			var groups = this.attributes.items;
			groups = $.extend(true, [], groups);
			var rowHeight = this._rowHeight;
			var columnWidth = this._columnWidth;
			var column;
			var rowCount;
			var cell;
			var cellIdx;
			var mergeRow;
			var i, j, k;
			for (i = box.col.min - 1; i < box.col.max; i++) {
				column = groups[i];
				rowCount = column.length;
				//아래 행 부터 체크. 행 분할시 array에 추가되어야 하기 때문
				for (j = rowCount - 1; j >= 0; j--) {
					cell = column[j];
					//행이 병합되어 있는 경우 실제 행 수와 전체 박스 사이즈가 맞지 않으므로 id index를 통해 체크
					cellIdx = this.getColumnRowIndexById(cell.id);
					if (cellIdx.row < box.row.min || cellIdx.row > box.row.max) continue;

					//열병합 해제
					cell.mergeColumn = 1;

					//행병합 해제
					mergeRow = cell.mergeRow || 1;
					if (mergeRow == 1) continue;
					for (k = 0; k < mergeRow - 1; k++) {
						column.splice(j + 1, 0, {
							label: '',
							width: columnWidth[i],
							height: rowHeight[j]
						});
					}
					cell.mergeRow = 1;
				}
			}

			this.set('items', groups);
			this.stopBatch('seperate-cell');
			this._updateHighlightedCells();
		},
		getHighlightedBox: function() {
			var cells = this.getHighlightedCells();
			if (cells.length < 1) return;

			var cellIdx;
			var box = {
				col: {
					min: 30,
					max: 0
				},
				row: {
					min: 30,
					max: 0
				}
			};

			var i;
			var col, row;
			for (i = 0; i < cells.length; i++) {
				cellIdx = this.getColumnRowIndexById(cells[i].id);
				col = cellIdx.col - 1 + cells[i].mergeColumn;
				row = cellIdx.row - 1 + cells[i].mergeRow;
				box.col.min = cellIdx.col < box.col.min ? cellIdx.col : box.col.min;
				box.col.max = col > box.col.max ? col : box.col.max;
				box.row.min = cellIdx.row < box.row.min ? cellIdx.row : box.row.min;
				box.row.max = row > box.row.max ? row : box.row.max;
			}

			return box;
		},
		addRow: function(direction, cnt) {
			var that = this;
			var cells = that.getHighlightedCells();
			if (cells.length != 1) return;
			var cell = cells[0];
			var rowIdx = that.getColumnRowIndexById(cell.id).row;
			if (direction == 'above') rowIdx -= 1;
			else if (direction == 'below') rowIdx += (cell.mergeRow - 1);	//행 병합된 셀 선택시 병합 끝지점에 생성

			if (!cnt) cnt = 1;

			if (that._rowHeight.length + cnt > HmiCommon.DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT) return;
			that.startBatch('add-row');
			var columnWidth = that._columnWidth;
			var groups = $.extend(true, [], that.attributes.items);
			var c;
			groups.forEach(function(column, idx) {
				for (c = 0; c < cnt; c++) {
					column.splice(rowIdx, 0, {
						label: '',
						width: columnWidth[idx],
						height: cell.height || HmiCommon.DEFAULT_TABLE_ROW_HEIGHT
					});
				}
			});
			that.set('items', groups);
			that.stopBatch('add-row');
			this._updateHighlightedCells();
		},
		removeRow: function() {
			var that = this;
			var cells = that.getHighlightedCells();
			if (cells.length != 1) return;
			var cell = cells[0];
			var rowIdx = that.getColumnRowIndexById(cell.id).row - 1;
			var cnt = cell.mergeRow;

			var rowHeightLen = that._rowHeight.length;
			if (rowHeightLen - cnt == 0) return;

			that.startBatch('remove-row');
			var groups = $.extend(true, [], that.attributes.items);
			var r = 0;
			var curRowIdx, lastRowIdx;
			var deleteLastRowIdx = rowIdx + cnt;
			var mr;
			var c, endC;
			groups.forEach(function(column) {
				curRowIdx = 0;
				for (r = 0; r < column.length; r++) {
					mr = column[r].mergeRow;
					lastRowIdx = curRowIdx + mr;
					if (curRowIdx < rowIdx && deleteLastRowIdx <= lastRowIdx) { //행병합 상태, 삭제하려는 행 들이 병합된 행 사이에 있을 경우
						column[r].mergeRow -= cnt;
						break;
					} else if (mr > 1 && cnt > 1 && lastRowIdx - 1 >= rowIdx && deleteLastRowIdx > lastRowIdx) { //행병합 상태, 삭제하려는 행 들이 병합된 행 아래에 걸쳐 있을 경우
						column[r].mergeRow -= (lastRowIdx - rowIdx);
						column.splice(r + 1, (deleteLastRowIdx - lastRowIdx));
						break;
					} else if (curRowIdx == rowIdx) {
						endC = Math.min(r + cnt, column.length);
						c = r;
						while(c < endC) {
							mr = column[c].mergeRow;
							if (curRowIdx + mr <= deleteLastRowIdx) {	//지워질 셀의 크기가 지울 행 수 보다 작거나 같을 경우
								column.splice(c, 1);
								endC -= mr;
								curRowIdx += mr;
							} else {	//지워질 셀의 크기가 지울 행 수 보다 클 경우
								column[c].mergeRow -= (deleteLastRowIdx - curRowIdx);
								c += mr;
							}
						}
						break;
					} else if (curRowIdx > rowIdx) {
						break;
					}
					curRowIdx += mr;
				}
			});
			that.set('items', groups);
			that.stopBatch('remove-row');
			this._updateHighlightedCells();
		},
		addColumn: function(direction, cnt) {
			var that = this;
			var cells = that.getHighlightedCells();
			if (cells.length != 1) return;
			var cell = cells[0];
			var colIdx = that.getColumnRowIndexById(cell.id).col;
			if (direction == 'left') colIdx -= 1;
			else if (direction == 'right') colIdx += (cell.mergeColumn - 1);	//열 병합된 셀 턴색시 병합 끝지점에 생성

			if (!cnt) cnt = 1;

			if (that._columnWidth.length + cnt > HmiCommon.DEFAULT_TABLE_ROW_COLUMN_MAX_COUNT) return;

			that.startBatch('add-column');
			var rowHeight = that._rowHeight;
			var groups = $.extend(true, [], that.attributes.items);
			var newColumn = [];
			for (var r = 0; r < rowHeight.length; r++) {
				newColumn.push({
					label: '',
					width: cell.width || HmiCommon.DEFAULT_TABLE_COLUMN_WIDTH,
					height: rowHeight[r]
				});
			}
			for (var c = 0; c < cnt; c++) {
				groups.splice(colIdx, 0, newColumn);
			}
			that.set('items', groups);
			that.stopBatch('add-column');
			this._updateHighlightedCells();
		},
		removeColumn: function() {
			var that = this;
			var cells = that.getHighlightedCells();
			// if (cells.length != 1) return;
			var cell = cells[0];
			var colIdx = that.getColumnRowIndexById(cell.id).col - 1;
			var cnt = cell.mergeColumn;

			var colWidthLen = that._columnWidth.length;
			if (colWidthLen - cnt == 0) return;

			that.startBatch('remove-column');
			var groups = $.extend(true, [], that.attributes.items);
			var c, r;
			var lastColIdx;
			var deleteLastColIdx = colIdx + cnt;
			var mc;
			var column;
			var cell, rowIdx;
			var newMergeColumn;
			/*
				c : 현재 탐색중인 컬럼 인덱스
				r : group에 cell을 탐색하는 인덱스. 실제 행 번호와는 다름
				mc : 셀의 mergeColumn 값. 1 보다 큰 경우 열 병합된 셀
				lastColIdx : 탐색중인 셀에서 열 병합이 끝나는 열(index + 1) 값.
				colIdx : 삭제가 시작되는 열의 index 값
				deleteLastColIdx : 삭제될 열의 마지막 index + 1 값

				열을 바로 삭제하는 것이 아니라, 병합된 열의 재병합/삭제 가능 여부 를 확인 한 후 삭제(groups.splice)를 한다.
			*/
			for (c = 0; c < deleteLastColIdx; c++) {
				column = groups[c];
				for (r = 0; r < column.length; r++) {
					cell = column[r];
					mc = cell.mergeColumn;
					lastColIdx = c + mc;
					if (mc == 1) continue;
					if (c <= colIdx && deleteLastColIdx <= lastColIdx) {	//병합된 열의 사이에서 열 삭제 할 때
						cell.mergeColumn -= cnt;
					} else if (colIdx < lastColIdx && lastColIdx < deleteLastColIdx) {	//병합된 열의 중간부터 끝 지점까지 삭제 할 때
						cell.mergeColumn -= (lastColIdx - colIdx);
					} else if (c > colIdx && deleteLastColIdx < lastColIdx) {	//삭제지점 중간부터 삭제지점 끝 이후로 병합된 열이 존재 할 때
						rowIdx = that.getColumnRowIndexById(cell.id).row;
						newMergeColumn = lastColIdx - deleteLastColIdx;
						if (newMergeColumn == 1) continue;	//한 열만 남는 경우는 그대로 삭제
						groups[deleteLastColIdx].forEach(function(otherCell) {	//삭제된 열 바로 다음 열에 넘어간 만큼 새로운 병합을 함
							if (rowIdx != that.getColumnRowIndexById(otherCell.id).row) return;	//병합된 열이 아니면 넘어감
							otherCell.mergeColumn = newMergeColumn;	//새로운 병합 수
						});
					}
				}
			}
			groups.splice(colIdx, cnt);
			that.set('items', groups);
			that.stopBatch('remove-column');
			this._updateHighlightedCells();
		},
		onChange: function(_, opt) {
			//commandManager에서 undo 시 markup 관련 에러 발생으로 인해 opt.commandManager가 존재하면 에러를 무시
			if (opt.record !== this.id && this.hasChanged('markup') && !opt.commandManager) { tableError('Markup can not be modified.'); }
			if (this.anyHasChanged(this.markupAttributes)) { this.buildMarkup(opt); }
		},
		buildMarkup: function(opt) {
			this.isBuildingMarkup = true;
			if (arguments.length == 3) {
				var resizeOpt = arguments[2];
				opt = joint.util.assign({
					relativeDirection: resizeOpt.relativeDirection,
					trueDirection: resizeOpt.trueDirection,
					direction: resizeOpt.direction
				}, opt);
			}
			var metrics = this.metrics = {};
			var cache = metrics.items = {};

			var attributes = this.attributes;
			var defaultItemHeight = attributes.itemHeight;
			var itemOffset = attributes.itemOffset;
			var itemOverflow = !!attributes.itemOverflow;
			var groups = attributes.items;
			if (!Array.isArray(groups)) groups = [];
			var groupsCount = groups.length;
			var groupY = 0, groupX = 0;
			var markup = joint.util.cloneDeep(this.markup);
			if (!Array.isArray(markup)) tableError('Expects Prototype JSON Markup.');
			var padding = joint.util.normalizeSides(attributes.padding);
			var minGroupWidth = 0;
			var rowCount = 0;

			// Column, Row Resizing Handles
			var columnHandleMarkup = [];
			var rowHandleMarkup = [];

			this.setCellInfo();

			for (var i = 0; i < groupsCount; i++) {

				var itemBodiesMarkup = [];
				var labelsMarkup = [];
				var buttonsMarkup = [];
				var iconsMarkup = [];
				var forks = [];

				var items = Array.from(groups[i]);
				var queue = this.createQueue(items, 0, [], null);
				var y = 0, curWidth = 0;
				var minItemWidth = 0;
				var currentRow = 0;

				while (queue.length > 0) {

					var queueItem = queue.pop();
					var path = queueItem.path;
					var level = queueItem.level;
					var item = queueItem.item;
					var parent = queueItem.parent;
					if (level === 0) path.splice(1, 0, i);

					var itemId = item.id;
					var visible = level !== -1;
					var itemHeight = item.height || defaultItemHeight;
					var itemWidth = item.width || 0;
					var icon = item.icon;
					var subItems = item.items;
					var highlighted = !!item.highlighted;
					var collapsed = !!item.collapsed;
					var vAlign = item.vAlign || 'middle';
					var hAlign = item.hAlign || 'start';
					var hasSubItems = Array.isArray(subItems) && subItems.length > 0;
					var mergeRow;
					if (item.mergeRow) mergeRow = item.mergeRow;
					else mergeRow = item.mergeRow = 1;
					var mergeColumn;
					if (item.mergeColumn) mergeColumn = item.mergeColumn;
					else mergeColumn = item.mergeColumn = 1;

					if (!itemId) tableError('Item id required.');
					if (cache.hasOwnProperty(itemId)) tableError('Duplicated item id.');

					var itemCache = cache[itemId] = {
						path: path,
						visible: visible,
						parent: parent,
						label: item.label,
						height: itemHeight,
						width: itemWidth,
						group: i,
						fill: item.fill,
						hasSubItems: hasSubItems,
						highlighted: highlighted,
						collapsed: collapsed,
						mergeRow: mergeRow,
						mergeColumn: mergeColumn,
						vAlign: vAlign,
						hAlign: hAlign
					};

					if (hasSubItems) {
						itemCache.children = subItems.map(function(subItem) { return subItem.id; });
						Array.prototype.push.apply(queue, this.createQueue(subItems, (collapsed || !visible) ? -1 : level + 1, path, itemId));
					}

					if (!visible) continue;

					// Generate Markup
					var x = itemOffset * level;
					itemCache.x = x + itemOffset;
					itemCache.y = y;
					itemCache.cx = x + itemOffset / 2;
					itemCache.cy = y + itemHeight / 2;
					itemCache.span = item.span || 1;
					if (itemId) {
						var bodyMarkup = this.getItemBodyMarkup(item, x, y, i, (itemOverflow && i === 0) ? padding.left : 0);
						itemBodiesMarkup.push(bodyMarkup);
						var labelMarkup = this.getItemLabelMarkup(item, x, y, i);
						labelsMarkup.push(labelMarkup);
						if (hasSubItems) {
							buttonsMarkup.push(this.getButtonMarkup(item, x, y, i));
							if (!collapsed) {
								forks.push(itemId);
							}
						}
						if (icon) {
							iconsMarkup.push(this.getIconMarkup(item, x, y, i));
							itemCache.x += attributes.itemIcon.width + attributes.itemIcon.padding;
						}
					}

					minItemWidth = Math.max(minItemWidth, itemWidth);
					for (var rowIdx = currentRow; rowIdx < currentRow + mergeRow; rowIdx++) {
						y += this._rowHeight[rowIdx];
					}

					curWidth = Math.max(curWidth, itemWidth);
					currentRow += mergeRow;
				}

				minGroupWidth = Math.max(minItemWidth, minGroupWidth);
				rowCount = Math.max(rowCount, currentRow);

				groupY = Math.max(groupY, y);
				groupX += curWidth;

				attributes.items = groups;
				var groupItems = [];

				markup.splice(3, 0, {
					tagName: 'g',
					selector: this.getSelector('group', i),
					groupSelector: 'groups',
					attributes: {
						'record-group': i
					},
					children: groupItems
				});
				// Items
				groupItems.push({
					tagName: 'g',
					selector: this.getSelector('bodiesGroup', i),
					groupSelector: 'bodiesGroups',
					children: itemBodiesMarkup
				}, {
					tagName: 'g',
					selector: this.getSelector('labelsGroup', i),
					groupSelector: 'labelsGroups',
					children: labelsMarkup
				});
				// Forks
				if (forks.length > 0) {
					groupItems.push({
						tagName: 'g',
						selector: this.getSelector('forksGroup', i),
						groupSelector: 'forksGroups',
						children: forks.map(this.getForkMarkup, this)
					});
				}
				// Buttons
				if (buttonsMarkup.length > 0) {
					groupItems.push({
						tagName: 'g',
						selector: this.getSelector('buttonsGroup', i),
						groupSelector: 'buttonsGroups',
						children: buttonsMarkup
					});
				}
				// Icons
				if (iconsMarkup.length > 0) {
					groupItems.push({
						tagName: 'g',
						selector: this.getSelector('iconsGroup', i),
						groupSelector: 'iconsGroups',
						children: iconsMarkup
					});
				}
			}

			metrics.padding = padding;
			metrics.groupsCount = groupsCount;
			metrics.overflow = itemOverflow;
			metrics.minHeight = groupY + padding.top + padding.bottom;
			// metrics.minWidth = minGroupWidth * groupsCount + padding.left + padding.right;
			metrics.minWidth = groupX + padding.left + padding.right;

			var columnMarkup, rowMarkup;
			var xIndex = 0, yIndex = 0;
			var columnWidth = this._columnWidth;
			var rowHeight = this._rowHeight;
			if (groupsCount > 1) {
				markup.push({
					tagName: 'g',
					selector: this.getSelector('columnHandleGroup', 0),
					groupSelector: 'columnHandleGroups',
					children: columnHandleMarkup
				});
				for (var j = 1; j < groupsCount; j++) {
					xIndex += columnWidth[j - 1];
					columnMarkup = this.getColumnHandleMarkup(xIndex, groupY, j);
					columnHandleMarkup.push(columnMarkup);
				}
			}
			if (rowCount > 1) {
				markup.push({
					tagName: 'g',
					selector: this.getSelector('rowHandleGroup', 0),
					groupSelector: 'rowHandleGroups',
					children: rowHandleMarkup
				});
				for (var k = 1; k < rowHeight.length; k++) {
					yIndex += rowHeight[k - 1];
					rowMarkup = this.getRowHandleMarkup(yIndex, groupX, k);
					rowHandleMarkup.push(rowMarkup);
				}
			}

			var flags = joint.util.assign({ record: this.id }, opt);
			this.set('markup', markup, flags);
			this.autoresize(flags);
			this.isBuildingMarkup = false;
		},
		/*
			기존 코드가 metrics의 너비를 잡지 않기 때문에 오버라이딩
		*/
		autoresize: function(opt) {
			var minSize = this.getMinimalSize();
			opt = $.extend(true, {preventSetGridPoint: true}, opt);
			this.resize(minSize.width, minSize.height, opt);
		},
		setCellInfo: function() {
			var groups = this.attributes.items;
			var groupsCount = groups.length;
			if (groupsCount == 0) return;
			var rowsTotal;
			var mergeRow;
			var c, r;
			var column;
			var rowHeight = this._rowHeight = [], rowHeightRatio = this._rowHeightRatio = [], totalHeight = 0;
			var columnWidth = this._columnWidth = [], columnWidthRatio = this._columnWidthRatio = [], totalWidth = 0;
			var minWidth = Infinity, minHeight = Infinity;
			for (c = 0; c < groupsCount; c++) {
				column = groups[c];
				rowsTotal = 0;
				column.forEach(function(cell) {
					mergeRow = cell.mergeRow || 1;
					cell.id = 'col' + (c + 1) + '-row' + (rowsTotal + 1);
					columnWidth[c] = cell.width;
					rowHeight[rowsTotal] = cell.height;
					rowsTotal += mergeRow;
					cell.fill = cell.fill || '#ffffff';
					if (cell.width < minWidth) minWidth = cell.width;
					if (cell.height < minHeight) minHeight = cell.height;
				});
			}
			for (c = 0; c < columnWidth.length; c++) {
				totalWidth += columnWidth[c];
			}
			for (r = 0; r < rowHeight.length; r++) {
				totalHeight += rowHeight[r];
			}

			for (c = 0; c < columnWidth.length; c++) {
				columnWidthRatio.push(columnWidth[c] / totalWidth);
			}
			for (r = 0; r < rowHeight.length; r++) {
				rowHeightRatio.push(rowHeight[r] / totalHeight);
			}

			this.prop('binding/minWidth', totalWidth * HmiCommon.GRAPHIC_MIN_WIDTH / minWidth);
			this.prop('binding/minHeight', totalHeight * HmiCommon.GRAPHIC_MIN_HEIGHT / minHeight);
		},
		getColumnHandleMarkup: function(x, height, i) {
			var resizeId = 'col-resize-' + i;
			var attributes = {
				'x': x,
				'y': 0,
				'height': height,
				'width': 1,
				stroke: 'transparent',
				'resize-id': resizeId,
				cursor: 'e-resize',
				fill: 'transparent'
			};
			return {
				tagName: 'rect',
				selector: this.getSelector('columnHandle', resizeId),
				groupSelector: this.getGroupSelector('columnHandles', i),
				className: 'column-resize',
				attributes: attributes
			};
		},
		getRowHandleMarkup: function(y, width, i) {
			var resizeId = 'row-resize-' + i;
			var attributes = {
				'x': 0,
				'y': y,
				'height': 1,
				'width': width,
				stroke: 'transparent',
				'resize-id': resizeId,
				cursor: 'n-resize',
				fill: 'transparent'
			};
			return {
				tagName: 'rect',
				selector: this.getSelector('rowHandle', resizeId),
				groupSelector: this.getGroupSelector('rowHandles', i),
				className: 'row-resize',
				attributes: attributes
			};
		},
		getItemLabelMarkup: function(item, x, y, i) {
			var itemIdx = this.getColumnRowIndexById(item.id);
			var attributes = this.attributes;
			var itemOffset = attributes.itemOffset;
			var itemHeight = item.height || attributes.itemHeight;
			if (item.mergeRow > 1) {
				for (var r = itemIdx.row; r < itemIdx.row + item.mergeRow - 1; r++) {
					itemHeight += this._rowHeight[r];
				}
			}
			var itemWidth = item.width || 0;
			if (item.mergeColumn > 1) {
				for (var c = itemIdx.col; c < itemIdx.col + item.mergeColumn - 1; c++) {
					itemWidth += this._columnWidth[c];
				}
			}
			var itemId = item.id;
			var textX = x + itemOffset;
			if (item.icon) {
				textX += attributes.itemIcon.width + 2 * attributes.itemIcon.padding;
			}
			var textY = y;
			var vAlign = item.vAlign || 'middle';
			var hAlign = item.hAlign || 'start';
			if (vAlign == 'middle') textY += (itemHeight / 2);
			else if (vAlign == 'bottom') textY += itemHeight;
			if (hAlign == 'middle') textX += (itemWidth / 2);
			else if (hAlign == 'end') textX += itemWidth;
			return {
				tagName: 'text',
				className: 'record-item-label',
				selector: this.getSelector('itemLabel', itemId),
				groupSelector: this.getGroupSelector('itemLabels', i, item.group),
				attributes: {
					'x': textX,
					'y': textY,
					'item-id': itemId,
					'text': item.label,
					width: itemWidth - (2 * itemOffset),
					height: itemHeight
				}
			};
		},
		getItemBodyMarkup: function(item, _, y, i, overflow) {
			var itemIdx = this.getColumnRowIndexById(item.id);
			var itemHeight = item.height || this.attributes.itemHeight;
			if (item.mergeRow > 1) {
				for (var r = itemIdx.row; r < itemIdx.row + item.mergeRow - 1; r++) {
					itemHeight += this._rowHeight[r];
				}
			}
			var itemWidth = item.width || 0;
			if (item.mergeColumn > 1) {
				for (var c = itemIdx.col; c < itemIdx.col + item.mergeColumn - 1; c++) {
					itemWidth += this._columnWidth[c];
				}
			}
			var itemFill = item.fill || '#ffffff';
			var x = 0;
			if (overflow) x -= overflow;
			var attributes = {
				'x': x,
				'y': y,
				'height': itemHeight,
				'width': itemWidth,
				'item-id': item.id,
				'fill': itemFill,
				cursor: 'default'
			};
			var itemSpan = item.span;
			if (itemSpan) {
				attributes['item-span'] = itemSpan;
			}
			return {
				tagName: 'rect',
				selector: this.getSelector('itemBody', item.id),
				groupSelector: this.getGroupSelector('itemBodies', i, item.group),
				className: 'record-item-body',
				attributes: attributes
			};
		},
		onRemove: function() {
			this.clearHighlighted();
		}
	}, {
		defaultBindingProp : {
			type : "Table",
			fillColor : '#ffffff',
			strokeColor : '#000000',
			strokeWidth : 1,
			strokeDasharray : '0',
			fontType : HmiCommon.DEFAULT_FONT_TYPE,
			fontSize : HmiCommon.DEFAULT_FONT_SIZE,
			fontStyle : HmiCommon.DEFAULT_FONT_STYLE,
			fontColor : HmiCommon.DEFAULT_FONT_COLOR
		},
		getCursor : function(){
			return 'cursor_table.png';
		},
		// rappid.js:31189
		// defaultProperty가 복사되지 않으므로 가져옴.
		attributes: {
			// Public Attributes
			itemText: {
				set: function(opt, refBBox, node, attrs) {
					if (!joint.util.isPlainObject(opt)) return null;
					var model = this.model;
					var itemId = node.getAttribute('item-id');
					var cache = model.metrics.items[itemId];
					if (!cache) return;
					var text = cache.label;
					var itemIdx = model.getColumnRowIndexById(itemId);
					var columnWidth = model._columnWidth;
					var x1 = cache.x;
					var x2 = (2 * -x1) + columnWidth[itemIdx.col - 1];
					if (cache.mergeColumn > 1) {
						for (var c = itemIdx.col; c < itemIdx.col + cache.mergeColumn - 1; c++) {
							x2 += columnWidth[c];
						}
					}
					var bbox = new g.Rect(x1, cache.y, x2, cache.height);
					var textAttribute, textValue;
					if (opt.textWrap) {
						textAttribute = 'textWrap';
						textValue = {
							text: text,
							ellipsis: opt.ellipsis
						};
					} else {
						textAttribute = 'text';
						textValue = text;
					}
					this.getAttributeDefinition(textAttribute).set.call(this, textValue, bbox, node, attrs);
				}
			},
			itemHighlight: {
				set: function(highlightAttributes, _, node, attrs) {
					if (!joint.util.isPlainObject(highlightAttributes)) return null;
					var model = this.model;
					var itemId = node.getAttribute('item-id');
					var highlighted = model.getItemCacheAttribute(itemId, 'highlighted');
					switch (highlighted) {
					case true:
						return highlightAttributes;
					case null:
					case false:
						return Object.keys(highlightAttributes).reduce(function(res, attrName) {
							var attrDefined = attrs.hasOwnProperty(attrName) || attrs.hasOwnProperty(joint.util.camelCase(attrName));
							if (!attrDefined && node.getAttribute(attrName)) {
								// Remove the node attribute
								res[attrName] = null;
							}
							return res;
						}, {});
					default:
					}
				}
			},
			// Private Attributes
			groupWidth: {
				set: function(_, refBBox, node) {
					var metrics = this.model.metrics;
					var itemId = node.getAttribute('item-id');
					var item = metrics.items[itemId];
					var itemIdx = this.model.getColumnRowIndexById(itemId);
					var width = item.width || 0;
					// var span = node.getAttribute('item-span');
					// if (span) width *= Number(span);
					var mergeColumn = item.mergeColumn || 1;
					if (mergeColumn > 1) {
						for (var c = itemIdx.col; c < itemIdx.col + item.mergeColumn - 1; c++) {
							width += this.model._columnWidth[c];
						}
					}
					return { width: width };
				}
			},
			groupPosition: {
				position: function(_, refBBox, node) {
					var groupIndex = Number(node.getAttribute('record-group'));
					var metrics = this.model.metrics;
					var padding = metrics.padding;
					var items = metrics.items;

					var col;
					var colWidth = {};
					for (var id in items) {
						col = id.split('-')[0];
						if (col.split('col')[1] > groupIndex) continue;
						colWidth[col] = items[id].width;
					}
					var totalWidth = 0;
					for (col in colWidth) {
						totalWidth += colWidth[col];
					}
					var x = padding.left + totalWidth;
					var y = padding.top;
					return new g.Point(x, y);
				}
			}
		}
	});

	var HyperLink = Rectangle.define('hmi.HyperLink', {
		attrs : {
			body : {
				rx : 10,
				ry : 10,
				strokeWidth : 1,
				stroke : HmiCommon.DEFAULT_STROKE_COLOR,
				strokeDasharray : '0',
				fill : "#ffffff",
				width : 160,
				height: 40
			},
			label : {
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				text : "",
				cursor : 'default',
				refY2 : 0,
				event : 'event:hyperlink:click',
				textDecoration: 'underline'
			}
		}
	}, {
		markup : [{
			tagName : 'rect',
			selector : 'body'
		}, {
			tagName : 'text',
			selector : 'label'
		}],
		// initialize : function(options) {
		// 	var that = this;
		// 	BasicShape.prototype.initialize.apply(that, arguments);
		// },
		attachEvent : function() {
			var that = this;
			BasicShape.prototype.attachEvent.apply(that, arguments);
			that.once('graph:add', function() {
				if (!that.isEditableCanvas()) {
					that.attr('label', {
						cursor: 'pointer'
					});
				}
			});

			//이외 투명도, 폰트 타입, 폰트 스타일, 채우기, 선 색/굵기 변경 가능해야함.
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/label'){
					that.setLabel(value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr('label/fontSize', value);
				}else if(key == 'binding/fontColor'){
					that.attr('label/fill', value);
				}else if(key == 'binding/vAlign' || key == 'binding/hAlign'){
					that.updateAlign();
				}
			});

		},
		setTextAlign : function(propertyName, align){
			this.prop(propertyName, align);
		},
		getTextAlign : function(align){
			return this.prop('binding/' + align);
		},
		setLabel : function(label){
			var that = this;
			that.attr('label/text', label);
			setTimeout(that.autoResize.bind(that), 0);
		},
		getLabel : function(){
			var that = this;
			return that.prop("binding/label");
		},
		setFile : function(file){
			var that = this;
			that.prop("binding/file", file);
		},
		getFile : function(){
			var that = this;
			return that.prop("binding/file");
		},
		autoResize : function() {
			var that = this;
			var view = that.getCurrentView();
			if (view) {
				var text = view.findBySelector('label')[0];
				if (text) {
					var padding = HmiCommon.DEFAULT_TEXT_PADDING;
					var bbox = text.getBBox();
					var size = that.size();
					var newWidth = bbox.width + padding;
					var newHeight = bbox.height + padding;
					if (newWidth < size.width) newWidth = size.width;
					if (newHeight < size.height) newHeight = size.height;
					that.resize(newWidth, newHeight);
				}
			}
		},
		setBindingData : function(data){
			BaseHmiElement.prototype.setBindingData.call(this, data);
			var file = data.file, label = data.label;
			if(file) this.prop("binding/file", file);
			this.prop("binding/label", label);
		},
		getGraphicBindingPopupData : function(){
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(this);
			var bindingData = this.prop("binding");
			data.label = bindingData.label;
			data.file = bindingData.file;
			return data;
		},
		updateAlign : function(){
			var that = this;
			var vAlign = that.prop("binding/vAlign");
			var hAlign = that.prop("binding/hAlign");
			var refX, refY, refX2, refY2;
			if(vAlign == "top"){
				refY = 0;
				refY2 = HmiCommon.DEFAULT_TEXT_LABEL_PADDING;
				that.attr("label/textVerticalAnchor", "top");
			}else if(vAlign == "bottom"){
				refY = "100%";
				refY2 = -HmiCommon.DEFAULT_TEXT_LABEL_PADDING;
				that.attr("label/textVerticalAnchor", "bottom");
			}else{	//middle
				refY = "50%";
				refY2 = 0;
				that.attr("label/textVerticalAnchor", "middle");
			}
			if(hAlign == "right") {
				refX = "100%";
				refX2 = -HmiCommon.DEFAULT_TEXT_LABEL_PADDING;
				that.attr("label/textAnchor", "end");
			}else if(hAlign == "left"){
				refX = 0;
				refX2 = HmiCommon.DEFAULT_TEXT_LABEL_PADDING;
				that.attr("label/textAnchor", "start");
			}else{
				refX = "50%";
				refX2 = 0;
				that.attr("label/textAnchor", "middle");
			}

			that.attr("label", {
				refX : refX,
				refY : refY,
				refX2 : refX2,
				refY2 : refY2
			});
		}
	}, {
		defaultBindingProp : {
			type : "HyperLink",
			strokeWidth : 1,
			strokeColor : HmiCommon.DEFAULT_STROKE_COLOR,
			fillColor : '#ffffff',
			opacity : 1,
			fontStyle : 'normal',
			fontType : HmiCommon.DEFAULT_FONT_TYPE,
			fontColor : '#000000',
			file : {
				id : 0,	//파일 아이디
				name : "-"	//파일 이름
			},
			label : "-",	//하이퍼링크의 텍스트 수정이 가능해야함.
			vAlign : "middle",
			hAlign : "center"
		}
	});

	var Zone = extendWithBaseElement(joint.shapes.standard.Polygon, 'hmi.Zone', {
		attrs : {
			body : {
				fill : HmiCommon.DEFAULT_ZONE_COLOR_ALPHA,
				stroke : HmiCommon.DEFAULT_ZONE_COLOR,
				refPoints : '0,0 0,1 1,1 1,0',
				event : 'event:zoneclick'
			}
		}
	}, {
		markup : [{
			tagName : 'polygon',
			selector : 'body'
		}],
		initialize : function(options) {
			BasicShape.prototype.initialize.apply(this, arguments);
			var refPoints = options.refPoints || [
				{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}
			];
			this.prop('refPoints', refPoints);
			this.initializeOptions(options, {
				size : {
					width : HmiCommon.DEFAULT_ZONE_WIDTH, height : HmiCommon.DEFAULT_ZONE_HEIGHT
				}
			});
			var binding = this.prop('binding');
			this.setColor(binding.fillColor);
		},
		attachEvent : function() {
			var that = this;
			that.on('change:binding', function(element, binding, opt) {
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/fillColor'){
					that.setColor(value);
				}else if(key == 'binding/strokeColor'){
					that.attr('body/stroke', value);
				}else if(key == 'binding/strokeWidth'){
					that.attr('body/strokeWidth', value);
				}else if(key == 'binding/strokeDasharray'){
					that.attr('body/strokeDasharray', value);
				}else if(key == 'binding/fontSize'){
					that.attr('label/fontSize', value);
					that.setZoneName();
				}else if(key == 'binding/fontType'){
					that.attr('label/fontFamily', value);
					that.setZoneName();
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
					that.setZoneName();
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
					that.setZoneName();
				}else if(key == 'binding/fontColor'){
					that.attr('label/fill', value);
				}
			});

		},
		setColor : function(hexColor) {
			var alpha = 1;
			if (hexColor.length == 9) {
				alpha = Math.round(parseInt(hexColor.slice(7, 9), 16) * 100) / 100;
				hexColor = hexColor.slice(0, 7);
			}
			var rgb = window.kendo.parseColor(hexColor);

			var selectedAlpha = this._isSelected ? HmiCommon.DEFAULT_ZONE_COLOR_ALPHA_SELECTED : HmiCommon.DEFAULT_ZONE_COLOR_ALPHA;

			this.attr('body/fill', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (alpha * selectedAlpha) + ')');
		},
		getIndoorsInnerZone : function() {
			var that = this;
			var cells = that.graph.getCells();
			var indoors = [];
			var indoorsInnerZone = [];

			cells.forEach(function(cell) {
				if (cell.prop('binding/type') == 'Indoor') indoors.push(cell);
			});

			var pos = that.position();
			var bbox, center;
			indoors.forEach(function(indoor) {
				bbox = indoor.getBBox();
				center = {
					x: bbox.x - pos.x + (bbox.width / 2),
					y: bbox.y - pos.y + (bbox.height / 2)
				};
				if (that.isContainsPoint(center.x, center.y)) indoorsInnerZone.push(indoor);
			});

			return indoorsInnerZone;
		},
		toggleZoneSelect : function() {
			var that = this;
			var isSelected = that._isSelected = !that._isSelected;
			that.setColor(that.prop('binding/fillColor'));

			var indoors = that.getIndoorsInnerZone();
			var canvas = that.getCanvas();
			indoors.forEach(function(indoor) {
				indoor.setSelected(isSelected);
				if (canvas) canvas.selectIndoorDevice();
			});
		},
		setZoneSelectedByInnerIndoorsSelected : function() {
			var that = this;
			var indoors = that.getIndoorsInnerZone();
			var selectedState = true;
			var indoorSelected;
			indoors.forEach(function(indoor) {
				indoorSelected = indoor.prop('binding/selected');
				selectedState = selectedState && indoorSelected;
			});
			that._isSelected = selectedState;
			that.setColor(that.prop('binding/fillColor'));
		},
		//Even-odd rule 참조
		isContainsPoint : function(x, y) {
			var refPoints = this.getRefPoints();
			var len = refPoints.length;
			var i, j = len - 1;
			var result = false;
			for (i = 0; i < len; i++) {
				if (((refPoints[i].y > y) != (refPoints[j].y > y)) &&
					(x < refPoints[i].x + (refPoints[j].x - refPoints[i].x) * (y - refPoints[i].y) / (refPoints[j].y - refPoints[i].y)))
					result = !result;
				j = i;
			}
			return result;
		},
		addPoint : function(offset, index) {
			var that = this;
			var refPoints = that.getRefPoints();
			this.startBatch('add:refPoint');
			var ref = that.getRefByOffset(offset.offsetX, offset.offsetY);
			refPoints.splice(index + 1, 0, {x :ref.x, y: ref.y});

			this.prop('refPoints', refPoints);
			that.setSize();
			that.setAttrRefPoints();
			this.stopBatch('add:refPoint');
		},
		changeRefPoint : function(offset, index) {
			var refPoints = this.getRefPoints(), len = refPoints.length;
			while (index < 0) {
				index += len;
			}
			this.startBatch('change:refPoints');
			this._isChangingPoint = true;
			var ref = this.getRefByOffset(offset.offsetX, offset.offsetY);
			refPoints[index].x = ref.x;
			refPoints[index].y = ref.y;

			this.prop('refPoints', refPoints);
			this.setSize();
			this.setAttrRefPoints();
			this._isChangingPoint = false;
			this.stopBatch('change:refPoints');
		},
		removeRefPoint : function(index) {
			var refPoints = this.getRefPoints(), len = refPoints.length;
			if (len < 4) return;
			while (index < 0) {
				index += len;
			}
			this.startBatch('remove:refPoint');
			refPoints.splice(index, 1);

			this.prop('refPoints', refPoints);
			this.setSize();
			this.setAttrRefPoints();
			this.stopBatch('remove:refPoint');
		},
		getRefByOffset : function(ox, oy) {
			var bBox = this.getBBox();
			var centerPoint = bBox.center();
			var angle = this.get('angle');
			angle = angle * Math.PI / -180;

			ox = ox > 0 ? ox : 0;
			oy = oy > 0 ? oy : 0;

			var centerRefPoint = {x: ox - centerPoint.x, y: oy - centerPoint.y};
			var rotatedRefPoint = {
				x: centerRefPoint.x * Math.cos(angle) - centerRefPoint.y * Math.sin(angle),
				y: centerRefPoint.x * Math.sin(angle) + centerRefPoint.y * Math.cos(angle)
			};

			return {
				x: rotatedRefPoint.x + centerPoint.x - bBox.x,
				y: rotatedRefPoint.y + centerPoint.y - bBox.y
			};
		},
		getRefPoints : function() {
			return $.extend(true, [], this.prop('refPoints'));
		},
		setSize : function() {
			var that = this;
			var refPoints = that.getRefPoints();
			var maxX, minX, maxY, minY;
			var bBox = that.getBBox();
			var direction = null;
			if (refPoints.length < 3) return;
			maxX = minX = refPoints[0].x;
			maxY = minY = refPoints[0].y;

			refPoints.forEach(function(refPoint) {
				if (refPoint.x > maxX) maxX = refPoint.x;
				if (refPoint.x < minX) minX = refPoint.x;
				if (refPoint.y > maxY) maxY = refPoint.y;
				if (refPoint.y < minY) minY = refPoint.y;
			});
			refPoints.forEach(function(refPoint) {
				refPoint.x -= minX;
				refPoint.y -= minY;
			});

			var width = maxX - minX, height = maxY - minY;
			var trueDirection = '';
			trueDirection += minY != 0 ? 'top-' : 'bottom-';
			trueDirection += minX != 0 ? 'left' : 'right';
			if (width === 0 && height === 0) direction = null;
			else if (minX === 0 && maxX !== bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top-right';
			else if (minX === 0 && maxX !== bBox.width && minY === 0 && maxY === bBox.height) direction = 'right';
			else if (minX !== 0 && maxX === bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top-left';
			else if (minX === 0 && maxX === bBox.width && minY !== 0 && maxY === bBox.height) direction = 'top';
			else if (minX !== 0 && maxX === bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom-left';
			else if (minX !== 0 && maxX === bBox.width && minY === 0 && maxY === bBox.height) direction = 'left';
			else if (minX === 0 && maxX !== bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom-right';
			else if (minX === 0 && maxX === bBox.width && minY === 0 && maxY !== bBox.height) direction = 'bottom';

			that.prop('refPoints', refPoints);

			if (direction) {
				var currentSize = this.get('size');

				switch (direction) {

				case 'left':
				case 'right':
					height = currentSize.height;
					break;

				case 'top':
				case 'bottom':
					width = currentSize.width;
					break;
				default:
				}

				var angle = g.normalizeAngle(this.get('angle') || 0);

				var quadrant = {
					'top-right': 0,
					'right': 0,
					'top-left': 1,
					'top': 1,
					'bottom-left': 2,
					'left': 2,
					'bottom-right': 3,
					'bottom': 3
				}[direction];

				var fixedPoint = bBox[['bottomLeft', 'corner', 'topRight', 'origin'][quadrant]]();

				var imageFixedPoint = g.point(fixedPoint).rotate(bBox.center(), -angle);

				var radius = Math.sqrt((width * width) + (height * height)) / 2;

				var alpha = quadrant * Math.PI / 2;

				alpha += Math.atan(quadrant % 2 == 0 ? height / width : width / height);

				alpha -= g.toRad(angle);

				var center = g.point.fromPolar(radius, alpha, imageFixedPoint);

				var origin = g.point(center).offset(width / -2, height / -2);

				this.set('size', { width: width, height: height });

				this.position(origin.x, origin.y, {preventSetGridPoint: true});
			} else {
				that._isSetSize = true;
				that.translate(minX, minY);
				that.resize(width, height, {trueDirection: trueDirection});
				that._isSetSize = false;
			}
		},
		setAttrRefPoints : function() {
			var refPoints = this.getRefPoints();
			var strRefPoints = '';

			refPoints.forEach(function(refPoint) {
				strRefPoints += (refPoint.x + ',' + refPoint.y + ' ');
			});
			strRefPoints = strRefPoints.trim();

			this.attr('body/refPoints', strRefPoints);
		},
		resize : function(width, height, opt) {
			var that = this;
			var bbox = this.getBBox();
			var prevWidth = bbox.width, prevHeight = bbox.height;
			this.startBatch('change:size');
			opt = $.extend(true, opt, {preventSetGridPoint: true});
			BaseHmiElement.prototype.resize.call(that, width, height, opt);

			var refPoints = this.getRefPoints();
			if (refPoints.length < 3) return;
			refPoints.forEach(function(refPoint) {
				if (that._isSetSize) return;
				refPoint.x = prevWidth > 0 ? refPoint.x * width / prevWidth : refPoint.x;
				refPoint.y = prevHeight > 0 ? refPoint.y * height / prevHeight : refPoint.y;
			});
			that.prop('refPoints', refPoints);

			that.stopBatch('change:size');
		},
		/*
			포인터가 현재 꼭지점 근처에(반경 7) 있는지 확인
		*/
		isPointAroundContainsPoints : function(target) {
			var that = this;
			var refPoints = that.getRefPoints();
			var isAroundContainsPoints = false;
			var p;
			target = that.getRefByOffset(target.x, target.y);
			refPoints.forEach(function(refPoint){
				p = new g.Point(refPoint.x, refPoint.y);
				if (p.distance(target) < 7) isAroundContainsPoints = true;
			});
			return isAroundContainsPoints;
		},
		/*
			포인터가 현재 모서리 위에(반경 1) 있는지 확인
			return
				sp : 모서리의 시작 포인트
				cp : 모서리와 포인터의 직교좌표
		*/
		isPointOnLine : function(target) {
			var that = this;
			var pos = that.getBBox();
			var rect = new g.Rect(pos.x - 2, pos.y - 2, pos.width + 4, pos.height + 4);
			var isOnLine = false;
			if (!rect.containsPoint(target)) return isOnLine;

			target = that.getRefByOffset(target.x, target.y);
			var refPoints = that.getRefPoints(), len = refPoints.length, i;
			var curP, nextP;
			var crossPoint;
			var line, lineLen;
			for (i = 0; i < len; i++) {
				curP = new g.Point(refPoints[i].x, refPoints[i].y);
				nextP = new g.Point(refPoints[(i + 1) % len].x, refPoints[(i + 1) % len].y);
				crossPoint = that.getShortestLengthBetweenPointAndLine(curP, nextP, target);
				line = new g.Line(curP, nextP);
				lineLen = line.length() + 3;
				if (crossPoint.length <= 3 &&
					(crossPoint.point.distance(curP) < lineLen && crossPoint.point.distance(nextP) < lineLen)) {//직선이 도형 내부에 이어질 경우 잘못된 포인트가 잡히는 것 방지
					isOnLine = true;
					break;
				}
			}
			if (isOnLine) return {sp: i, cp: crossPoint.point};
			return isOnLine;
		},
		/*
			점과 직선 사이의 거리 & 교차점을 반환하는 함수.
			점과 직선(p1, p2를 지나는) 사이의 거리 공식
			p1 & p2 through line => ax + by + c = 0
			t => (x1, y1)
			d = |ax1 + by1 + c| / sqrt(a^2 + b^2)
			cross line => y = b/a(x - x1) + y1
			cross point
				=>	x = (b^2x1 - aby1 - ac) / (a^2 + b^2)
					y = (a^2y1 - abx1) / (a^2 + b^2) + a^2c / (a^2 + b^2)b - c / b
		*/
		getShortestLengthBetweenPointAndLine : function(p1, p2, t) {
			var a = p2.y - p1.y;
			var b = -(p2.x - p1.x);
			var c = ((p2.x - p1.x) * p1.y - (p2.y - p1.y) * p1.x);

			var d;
			var crossPoint, cpx, cpy;
			if (a == 0 && b == 0) {
				// p1 과 p2가 같은 지점일 경우 두 점 사이의 거리, 직교 좌표는 p1
				d = t.distance(new g.Point(p1.x, p1.y));
				crossPoint = new g.Point(p1.x, p1.y);
			} else {
				d = (Math.abs(a * t.x + b * t.y + c) / Math.sqrt(a * a + b * b));
				cpx = ((b * b * t.x - a * b * t.y - a * c) / (a * a + b * b));
				cpy = (b == 0) ? t.y : ((a * a * t.y - a * b * t.x) / (a * a + b * b) + (a * a * c) / (a * a + b * b) / b - (c / b));
				crossPoint = new g.Point(cpx, cpy);
			}
			return {
				point : crossPoint,
				length : d
			};
		}
	}, {
		defaultBindingProp : {
			type : 'Zone',
			initHeight : HmiCommon.DEFAULT_ZONE_HEIGHT,
			initWidth : HmiCommon.DEFAULT_ZONE_WIDTH,
			fillColor : HmiCommon.DEFAULT_ZONE_COLOR,
			strokeColor : HmiCommon.DEFAULT_ZONE_COLOR,
			strokeWidth : 1,
			strokeDasharray : '0',
			fontColor : '#ffffff',
			fontStyle : HmiCommon.DEFAULT_FONT_STYLE,
			fontType : HmiCommon.DEFAULT_FONT_TYPE,
			fontSize : HmiCommon.DEFAULT_FONT_SIZE
		}
	});

	/*
		그래픽 객체 정의
		이미지
	*/

	var Image = extendWithBaseElement(joint.shapes.standard.Image, 'hmi.Image', {
		attrs : {
			image : null,
			side : {
				refX : 0,
				refY : 0,
				refWidth : 1,
				refHeight : 1,
				strokeWidth : 0,
				stroke : 'transparent',
				strokeDasharray : '0',
				fill : 'transparent'
			},
			label : {
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				fontFamily : HmiCommon.DEFAULT_FONT_TYPE,
				fontStyle : HmiCommon.DEFAULT_FONT_STYLE,
				refY2 : 0
			}
		}
	}, {
		markup : [{
			tagName : 'rect',
			selector : 'side'
		}, {
			tagName : 'image',
			selector : 'body'
		}, {
			tagName : 'text',
			selector : 'label'
		}],
		initialize : function(options){
			BaseHmiElement.prototype.initialize.apply(this, arguments);
			var paletteItem = options.paletteItem;
			this.initializeOptions(options, { size : this.getInitialImageSize(paletteItem.value, options.widthFactor, options.heightFactor),
				attrs : {'body/href' : Util.addBuildDateQuery(paletteItem.imageUrl)}
			});
			this.setImageTransform();
			this._attachImageResizeEvt();
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/state/on/graphicColor' || key == 'binding/state/off/graphicColor'
					|| key == 'binding/value' || key == 'binding/reverse'){
					this.updateBindingValue();
				}else if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/vFliped' || key == 'binding/hFliped'){
					that.setImageTransform();
					that.flipAngle(key);
				}else if(key == 'binding/device'){
					that.setDevice(value);
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}else if(key == "binding/strokeColor"){
					that.attr("side/stroke", value);
				}else if(key == "binding/strokeWidth"){
					that.attr("side/strokeWidth", value);
				}else if(key == "binding/strokeDasharray"){
					that.attr("side/strokeDasharray", value);
				}
			});
		},
		_attachImageResizeEvt : function(){
			var that = this;
			that.on('change:size', function(element, size){
				that.setImageTransform(size.width, size.height);
			});
		},
		_updateImageColorFromState : function(state){
			var that = this;
			var imageUrl, imageColor = that.prop("binding/graphicColor");
			if(state == "off" || state == "stop") imageColor = that.prop("binding/state/off/graphicColor");
			else if(state == "on" || state == "rotate") imageColor = that.prop("binding/state/on/graphicColor");

			if(imageColor == "transparent"){
				that.setVisible(false);
				//Default 색상으로 이미지 변경
				imageUrl = that.getImageUrl("gray");
			}else{
				that.setVisible(true);
				imageUrl = that.getImageUrl(imageColor);
			}
			that.attr('body/href', Util.addBuildDateQuery(imageUrl));
		},
		updateBindingValue : function(){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			that._updateImageColorFromState(state);
		},
		getImageUrl : function(color){
			var that = this;
			var paletteItem = that.getPaletteItem();
			var imageUrl = paletteItem.imageUrl;
			if(paletteItem.images && paletteItem.images[color]){
				imageUrl = paletteItem.images[color];
			}
			return imageUrl;
		},
		getInitialImageSize : function(name, widthFactor, heightFactor){
			widthFactor = widthFactor || 2;
			heightFactor = heightFactor || 2;
			if(typeof name == "number") name = "" + name;

			if(name == "HMI_DUCT_CROSS"){
				widthFactor = 8;
				heightFactor = 8;
			}else if(name == "HMI_DUCT_H"){
				widthFactor = 7.845;
				heightFactor = 6.86;
			}else if(name == "HMI_DUCT_HOLE"){
				widthFactor = 3.74;
				heightFactor = 3.74;
			}else if(name == "HMI_DUCT_HORZSTRAIGHT"){
				widthFactor = 7.72;
				heightFactor = 2.24;
			}else if(name == "HMI_DUCTS_HORZSTRAIGHT_HARF"){
				widthFactor = 3.26;
				heightFactor = 2.24;
			}else if(name == "HMI_DUCT_L_DOWN_LEFT" || name == "HMI_DUCT_L_DOWN_RIGHT"
				|| name == "HMI_DUCTS_L_UP_LEFT" || name == "HMI_DUCTS_L_UP_RIGHT"){
				heightFactor = 5.06;
				widthFactor = 5.06;
			}else if(name == "HMI_DUCT_SEPARATION_2_LEFT"){
				widthFactor = 7.44;
				heightFactor = 4.06;
			}else if(name == "HMI_DUCT_SEPARATION_3_LEFT"){
				widthFactor = 8.02;
				heightFactor = 5.9;
			}else if(name == "HMI_DUCTS_SEPARATION_3RIGHT"){
				widthFactor = 8.02;
				heightFactor = 5.9;
			}else if(name == "HMI_DUCTS_SEPERATE_2RIGHT"){
				widthFactor = 8.02;
				heightFactor = 4.08;
			}else if(name == "HMI_DUCTS_T_DOWN"){
				widthFactor = 8.08;
				heightFactor = 5.04;
			}else if(name == "HMI_DUCTS_T_UP"){
				widthFactor = 8.08;
				heightFactor = 5.04;
			}else if(name == "HMI_DUCTS_T_LEFT"){
				heightFactor = 7.82;
				widthFactor = 5.22;
			}else if(name == "HMI_DUCTS_T_RIGHT"){
				heightFactor = 7.82;
				widthFactor = 5.22;
			}else if(name == "HMI_DUCTS_VERTSTRAIGHT"){
				heightFactor = 7.86;
				widthFactor = 2.52;
			}else if(name == "HMI_DUCTS_VERTSTRAIGHT_HARF"){
				widthFactor = 2.52;
				heightFactor = 3.28;
			}else if(name.includes("ARROW")){
				widthFactor = 1;
				heightFactor = 1;
			}else if(name.includes("HMI_BOILER")){
				widthFactor = 5.5;
				heightFactor = 5.5;
			}else if(name.includes("HMI_CHILLER1") || name.includes("HMI_CHILLER2")){
				widthFactor = 4.44;
				heightFactor = 2.54;
			}else if(name == "HMI_DUCTSVENTILATING"){
				widthFactor = 2.75;
				heightFactor = 2.75;
			}else if(name.includes("CONNECTPIPES_DOWNR") || name.includes("CONNECTPIPES_DOWNL")
						|| name.includes("CONNECTPIPES_UPR") || name.includes("CONNECTPIPES_UPL") || name.includes("PIPES_L")){
				widthFactor = 1.2;
				heightFactor = 1.2;
			}else if(name == "HMI_BUTTON"){
				widthFactor = 0.8;
				heightFactor = 0.8;
			}else if(name.indexOf("HMI_LED") !== -1){
				widthFactor = 1.2;
				heightFactor = 1.2;
			}else if(name == "HMI_POWER_GRAPHIC_TEXT"){
				widthFactor = 4;
				heightFactor = 4;
			}

			var width = HmiCommon.DEFAULT_NODE_WIDTH * widthFactor;
			var height = HmiCommon.DEFAULT_NODE_HEIGHT * heightFactor;
			var paletteItem = this.getPaletteItem();
			var imgSize = HmiUtil.getKeepRatioSize(paletteItem.imageWidth, paletteItem.imageHeight, width, height);
			width = imgSize.width;
			height = imgSize.height;
			//실제 이미지 크기를 저장하여 비율 resizing 시 이미지가 테두리를 벗어나거나 깨지는 현상 방지
			this.prop('binding/initWidthRatio', width);
			this.prop('binding/initHeightRatio', height);
			//그리드 격자 사이즈 단위로 반올림하여 조정
			width = getGridPosition(width);
			height = getGridPosition(height);
			return {
				width : width,
				height : height
			};
		},
		setBindingData : function(data){
			BaseHmiElement.prototype.setBindingData.call(this, data);
			var graphicColorOn = data.graphicColorOn, graphicColorOff = data.graphicColorOff, graphicColor = data.graphicColor,
				reverse = data.reverse, visible = data.visible;
			if(graphicColor) this.prop("binding/graphicColor", graphicColor);
			if(graphicColorOn) this.prop("binding/state/on/graphicColor", graphicColorOn);
			if(graphicColorOff) this.prop("binding/state/off/graphicColor", graphicColorOff);
			this.prop("binding/reverse", reverse);
			this.prop("binding/visible", visible);
		},
		getGraphicBindingPopupData : function(){
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(this);
			var bindingData = this.prop("binding");
			data.graphicColor = bindingData.graphicColor;
			data.graphicColorOn = this.prop("binding/state/on/graphicColor");
			data.graphicColorOff = this.prop("binding/state/off/graphicColor");
			return data;
		},
		setImageTransform : function(width, height){
			var bBox = this.getBBox();
			width = width ? width : bBox.width;
			height = height ? height : bBox.height;
			var binding = this.prop('binding');
			var initWidth = binding.initWidthRatio, initHeight = binding.initHeightRatio;
			var sx = 1, sy = 1, tx = 0, ty = 0;
			var hf = binding.hFliped ? -1 : 1, vf = binding.vFliped ? -1 : 1;

			if ((height / width) > (initHeight / initWidth)) sy = (height / width * initWidth / initHeight);
			else sx = (width / height * initHeight / initWidth);

			//수평뒤집기는 이미지의 x-scale 을 -1 배 후 너비만큼 다시 이동, y축 대칭으로 각도 이동
			//수직뒤집기의 경우 수평뒤집기 후 각도를 180도 회전함
			sx *= (vf * hf);
			tx = (vf * hf) === -1 ? bBox.width : tx;

			this.attr('body', {
				refWidth : Math.abs(100 / sx) + '%',
				refHeight : Math.abs(100 / sy) + '%',
				transform : 'translate(' + tx + ',' + ty + ') scale(' + sx + ',' + sy + ')'
			});
		}
	},{
		defaultBindingProp : {
			type : "Image",
			graphicColor : "gray",
			state : {
				off : {
					graphicColor : "gray",
					text : "",
					svgTextColor : "#ffffff"
				},
				on : {
					graphicColor : "red",
					text : "",
					svgTextColor : "#ffffff"
				}
			},
			strokeWidth : 0,
			strokeColor : 'transparent',
			strokeDasharray : '0'
		}
	});

	var ImportImage = Image.define('hmi.ImportImage', {}, {}, {
		defaultBindingProp : {
			type : "ImportImage"
		},
		getCursor : function(){
			return null;
		}
	});

	/*
		그래픽 객체 정의
		에니메이션
	*/

	var Animation = Image.define('hmi.Animation', {
		attrs : {}
	}, {
		initialize : function(options){
			Image.prototype.initialize.apply(this, arguments);
			this.updateBindingValue();
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/reverse' || key == 'binding/value' || key == 'binding/graphicColor'
						|| key == 'binding/state/on/graphicColor' || key == 'binding/state/off/graphicColor'
						|| key == 'binding/gauge' || key == 'binding/minValue' || key == 'binding/maxValue'){
					//Value 변경 Trigger
					//Value 변경에 따라 State 체크 및 이미지 변경
					this.updateBindingValue();
					this._onBindingValueTrigger();
				}else if(key == 'binding/vFliped' || key == 'binding/hFliped'){
					that.setImageTransform();
					that.flipAngle(key);
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}
			});
		},
		control : function(){
			var that = this;
			if(!that.isEditableCanvas()){
				//Loading.open();
				that.patchDigitalTypeControlValue().always(function(){
					//Loading.close();
				});
			}
		},
		getImageUrl : function(color, state){
			var that = this;
			var paletteItem = that.getPaletteItem();
			var colorAndState;
			if(state && color) colorAndState = color + "_" + state;

			var imageUrl = paletteItem.imageUrl;
			var images = paletteItem.images;
			if(images){
				if(images[colorAndState]) imageUrl = images[colorAndState];
				else if(images[state]) imageUrl = images[state];
				else if(images[color]) imageUrl = images[color];
			}

			return imageUrl;
		},
		updateBindingValue : function(){
			var that = this;
			var value = that.getValue(), minValue, maxValue;
			var categoryName = that.prop("binding/categoryName");
			var gauge = 1;
			if(categoryName == "Gauge") gauge = that.prop("binding/gauge");
			if(HmiUtil.isMultiLevelGraphic(categoryName)){
				minValue = that.prop("binding/minValue");
				maxValue = that.prop("binding/maxValue");
			}
			var state = that.getCurrentState(value, gauge, minValue, maxValue);
			that._updateImageColorFromState(state);
		},
		_onBindingValueTrigger : function(){	//모니터링 뷰에서 Polling 또는 데이터 바인딩 등으로 인해 Value 값이 변경되었을 때 호출된다.
			var that = this;
			var value = that.getValue();
			var categoryName = that.prop("binding/categoryName");
			var gauge, minValue, maxValue;
			if(categoryName == "Gauge") gauge = that.prop("binding/gauge");
			if(HmiUtil.isMultiLevelGraphic(categoryName)){
				minValue = that.prop("binding/minValue");
				maxValue = that.prop("binding/maxValue");
			}
			var state = that.getCurrentState(value, gauge, minValue, maxValue);

			var visible = that.prop("binding/visible");
			var device = that.prop("binding/device");
			//initialize에서 updateBindingValue를 호출할 시에 아래 Canvas의 편집 여부를 체크하지 못하여
			//Value 값 change 이벤트가 Trigger 되었을 경우에만 동작하도록 함수 구현
			if(!that.isEditableCanvas()){
				if(categoryName == "Wind"){
					//모니터링 상태에서 OFF 상태인 경우 표시하지 않는다.
					if(state == "off") that._setVisible(false);
					else if(visible) that._setVisible(true);	//활성화 상태이고, 바람이 ON 상태일 때 표시한다.
					//else that._setVisible(false);	//비활성화 상태이고, 바람이 ON
				}else if(categoryName == "Alarm"){
					var min = that.prop("binding/minValue");
					var max = that.prop("binding/maxValue");
					//활성화 상태 일 경우만 알람 발생
					if(visible){
						if(HmiUtil.isDigitalType(device.type)){	//디지털 타입
							if(state == "on"){
								that._setVisible(true);
								that._updateImageColorFromState("on");
								if(!HmiCommon.SoundPlayer.playing()) HmiCommon.SoundPlayer.play();
							}else{
								that._updateImageColorFromState("off");
								that._setVisible(false);
								HmiCommon.SoundPlayer.stop();
							}
						}else if((typeof value !== "undefined" && value !== null) && (value < min || value > max)){	//아날로그 타입
							that._setVisible(true);
							that._updateImageColorFromState("on");
							if(!HmiCommon.SoundPlayer.playing()) HmiCommon.SoundPlayer.play();
						}else{	//조건에 부합하지 않는 경우 알람은 표시하지 않는다. 알람이 여러개 이고 조건이 다를 때 Sound가 하나만 Play되는 이슈 있음.
							that._updateImageColorFromState("off");
							that._setVisible(false);
							HmiCommon.SoundPlayer.stop();
						}
					}
				}
			}else if(categoryName == "Alarm"){	//편집 상태에서는 보여야함.
				that._setVisible(true);
			}else if(categoryName == "Wind"){	//편집 화면에서 바람 컴포넌트 활성화 처리
				//바람 컴포넌트는 바인딩 되어있고 Visible true 및 State OFF 상태일 때, Visible을 false 처리한다. (View만. 바인딩 데이터는 유지)
				if(value !== null && typeof value !== "undefined" && visible){
					if(state == "on"){
						that._setVisible(true);
					}else{
						that._setVisible(false);
					}
				}
			}
		},
		_updateImageColorFromState : function(state){
			var that = this;
			var imageUrl, imageColor = that.prop("binding/graphicColor");
			if(state == "off" || state == "stop") imageColor = that.prop("binding/state/off/graphicColor");
			else if(state == "on" || state == "rotate") imageColor = that.prop("binding/state/on/graphicColor");

			if(imageColor == "transparent"){
				that.setVisible(false);
				//Default 색상으로 이미지 변경
				imageUrl = that.getImageUrl("gray", state);
			}else{
				that.setVisible(true);
				imageUrl = that.getImageUrl(imageColor, state);
			}

			that.attr('body/href', Util.addBuildDateQuery(imageUrl));
		},
		setBindingData : function(data){
			var that = this;
			Image.prototype.setBindingData.call(this, data);
			var gauge = data.gauge, minValue = data.minValue, maxValue = data.maxValue;
			that.prop("binding/gauge", gauge);
			that.prop("binding/minValue", minValue);
			that.prop("binding/maxValue", maxValue);
		},
		getGraphicBindingPopupData : function(){
			var data = Image.prototype.getGraphicBindingPopupData.call(this);
			data.minValue = this.prop("binding/minValue");
			data.maxValue = this.prop("binding/maxValue");
			data.gauge = this.prop("binding/gauge");
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "Animation",
			gauge : 1,
			//Alarm
			minValue : 0,
			maxValue : 100
		}
	});

	// 버튼, 딥스위치 (수평/수직), 레버, 셀렉터
	var Button = Animation.define('hmi.Button', {

	}, {
		attachEvent : function(){
			Animation.prototype.attachEvent.apply(this, arguments);
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/textLocation' || key == 'binding/buttonType'
					|| key == 'binding/state/on/svgTextColor' || key == 'binding/state/off/svgTextColor'
					|| key == 'binding/state/on/text' || key == 'binding/state/off/text'){
					//Value 변경 Trigger
					this.updateBindingValue();
				}else if(key == "binding/fontColor"){
					this.setFontColor(value);
				}
			});

			that.on("event:pointerdown", that.controlPointerDown.bind(that));
			that.on("event:pointerup", that.controlPointerUp.bind(that));
		},
		controlPointerDown : function(){
			var that = this;
			if(!that.isEditableCanvas()){
				var buttonType = that.prop("binding/buttonType");
				if(buttonType == "Push" || buttonType == "Momentary"){
					var value = that.getValue();
					var state = that.getCurrentState(value);
					that._pushButtonState = state;
				}

				that.patchDigitalTypeControlValue().always(function(){

				});
			}
		},
		controlPointerUp : function(){
			var that = this;
			if(!that.isEditableCanvas()){
				var buttonType = that.prop("binding/buttonType");
				if(buttonType == "Push" || buttonType == "Momentary"){
					//제어 후 버튼 이미지를 원래대로 돌린다.
					if(that._pushButtonState) that._updateImageColorFromState(that._pushButtonState);
				}

				if(buttonType == "Momentary"){
					//값을 복귀 시키도록 제어한다.
					that.patchDigitalTypeControlValue(false, true).always(function(){

					});
				}
			}
		},
		setFontColor : function(color){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			if(state == "on") that.prop("binding/state/on/svgTextColor", color);
			else that.prop("binding/state/off/svgTextColor", color);
		},
		getFontColor : function(){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			var color;
			if(state == "on") color = that.prop("binding/state/on/svgTextColor");
			else color = that.prop("binding/state/off/svgTextColor");

			return color;
		},
		_updateImageColorFromState : function(state){
			Animation.prototype._updateImageColorFromState.call(this, state);
			this.updateTextFromState(state);
		},
		setBindingData : function(data){
			var that = this;
			Animation.prototype.setBindingData.call(this, data);
			var buttonType = data.buttonType, textLocation = data.textLocation;
			if(buttonType) that.prop("binding/buttonType", buttonType);

			var svgTextColorOn, svgTextColorOff, textOn, textOff;
			if(data.svgTextOn){
				svgTextColorOn = data.svgTextOn.svgTextColorOn;
				textOn = data.svgTextOn.textOn;
			}

			if(data.svgTextOff){
				svgTextColorOff = data.svgTextOff.svgTextColorOff;
				textOff = data.svgTextOff.textOff;
			}

			that.prop("binding/state/on/svgTextColor", svgTextColorOn);
			that.prop("binding/state/off/svgTextColor", svgTextColorOff);
			that.prop("binding/state/on/text", textOn);
			that.prop("binding/state/off/text", textOff);
			that.prop("binding/textLocation", textLocation);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = Animation.prototype.getGraphicBindingPopupData.call(that);
			data.buttonType = that.prop("binding/buttonType");
			data.textLocation = that.prop("binding/textLocation");
			data.svgTextColorOn = that.prop("binding/state/on/svgTextColor");
			data.svgTextColorOff = that.prop("binding/state/off/svgTextColor");
			data.textOn = that.prop("binding/state/on/text");
			data.textOff = that.prop("binding/state/off/text");
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "Button",
			state : {
				off : {
					text : "",
					svgTextColor : "#000000",
					graphicColor :"gray"
				},
				on : {
					text : "",
					svgTextColor : "#000000",
					graphicColor :"red"
				}
			},
			buttonType : null,
			textLocation : null
		}
	});

	var SVGButton = BaseHmiElement.define('hmi.SVGButton', {
		attrs : {}
	}, {
		initialize : function(options){
			BaseHmiElement.prototype.initialize.apply(this, arguments);
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/reverse' || key == 'binding/value'
					|| key == 'binding/buttonType' || key == 'binding/textLocation'
					|| key == 'binding/state/on/svgGraphicColor' || key == 'binding/state/off/svgGraphicColor'
					|| key == 'binding/state/on/svgTextColor' || key == 'binding/state/off/svgTextColor'
					|| key == 'binding/state/on/text' || key == 'binding/state/off/text'){
					this.updateBindingValue();
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
				}else if(key == 'binding/fontColor'){
					that.setFontColor(value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}else if(key == 'binding/fillColor'){
					that.setFillColor(value);
				}else if(key == 'binding/strokeWidth'){
					that.attr("body/strokeWidth", value);
				}else if(key == 'binding/strokeColor'){
					that.attr("body/stroke", value);
				}else if(key == 'binding/strokeDasharray'){
					that.attr("body/strokeDasharray", value);
				}
			});

			that.on("event:pointerdown", that.controlPointerDown.bind(that));
			that.on("event:pointerup", that.controlPointerUp.bind(that));
		},
		controlPointerDown : function(){
			var that = this;
			if(!that.isEditableCanvas()){
				var buttonType = that.prop("binding/buttonType");
				var ignoreValueUpdate = false;
				if(buttonType == "Push" || buttonType == "Momentary"){
					//현재 상태 저장
					var value = that.getValue();
					var state = that.getCurrentState(value);
					that._pushButtonState = state;
					//제어 명령으로 나갈 값으로 상태 변환
					value = that.getDigitalTypeControlValue();
					state = that.getCurrentState(value);
					that.updateRectColorFromState(state);
					that.updateTextFromState(state);
					//제어 시, 실제 값을 바꾸지 않는다.
					ignoreValueUpdate = true;
				}

				that.patchDigitalTypeControlValue(ignoreValueUpdate).always(function(){

				});
			}
		},
		controlPointerUp : function(){
			var that = this;
			if(!that.isEditableCanvas()){
				var buttonType = that.prop("binding/buttonType");
				if(buttonType == "Push" || buttonType == "Momentary"){
					//제어 후 버튼 이미지를 원래대로 돌린다.
					if(that._pushButtonState){
						that.updateRectColorFromState(that._pushButtonState);
						that.updateTextFromState(that._pushButtonState);
					}
				}

				if(buttonType == "Momentary"){
					//값을 복귀 시키도록 제어한다.
					that.patchDigitalTypeControlValue(false, true).always(function(){

					});
				}
			}
		},
		setFontColor : function(color){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			if(state == "on") that.prop("binding/state/on/svgTextColor", color);
			else that.prop("binding/state/off/svgTextColor", color);
		},
		setFillColor : function(color){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			if(state == "on") that.prop("binding/state/on/svgGraphicColor", color);
			else that.prop("binding/state/off/svgGraphicColor", color);
		},
		getFontColor : function(){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			var color;
			if(state == "on") color = that.prop("binding/state/on/svgTextColor");
			else color = that.prop("binding/state/off/svgTextColor");
			return color;
		},
		getFillColor : function(){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			var color;
			if(state == "on") color = that.prop("binding/state/on/svgGraphicColor");
			else color = that.prop("binding/state/off/svgGraphicColor");
			return color;
		},
		updateBindingValue : function(){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			that.updateRectColorFromState(state);
			that.updateTextFromState(state);
		},
		updateRectColorFromState : function(state){
			var that = this;
			var color;
			if(state == "on") color = that.prop("binding/state/on/svgGraphicColor");
			else color = that.prop("binding/state/off/svgGraphicColor");
			that.attr('body/fill', color);
		},
		setBindingData : function(data){
			var that = this;
			BaseHmiElement.prototype.setBindingData.call(that, data);
			var graphicColorOn = data.svgGraphicColorOn, graphicColorOff = data.svgGraphicColorOff,
				reverse = data.reverse, textLocation = data.textLocation, buttonType = data.buttonType;

			var svgTextColorOn, svgTextColorOff, textOn, textOff;
			if(data.svgTextOn){
				svgTextColorOn = data.svgTextOn.svgTextColorOn;
				textOn = data.svgTextOn.textOn;
			}

			if(data.svgTextOff){
				svgTextColorOff = data.svgTextOff.svgTextColorOff;
				textOff = data.svgTextOff.textOff;
			}

			if(buttonType) that.prop("binding/buttonType", buttonType);
			that.prop("binding/textLocation", textLocation);
			that.prop("binding/state/on/svgGraphicColor", graphicColorOn);
			that.prop("binding/state/off/svgGraphicColor", graphicColorOff);
			that.prop("binding/state/on/svgTextColor", svgTextColorOn);
			that.prop("binding/state/off/svgTextColor", svgTextColorOff);
			that.prop("binding/state/on/text", textOn);
			that.prop("binding/state/off/text", textOff);
			this.prop("binding/reverse", reverse);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(that);
			data.buttonType = that.prop("binding/buttonType");
			data.textLocation = that.prop("binding/textLocation");
			data.svgGraphicColorOn = that.prop("binding/state/on/svgGraphicColor");
			data.svgGraphicColorOff = that.prop("binding/state/off/svgGraphicColor");
			data.svgTextColorOn = that.prop("binding/state/on/svgTextColor");
			data.svgTextColorOff = that.prop("binding/state/off/svgTextColor");
			data.textOn = that.prop("binding/state/on/text");
			data.textOff = that.prop("binding/state/off/text");
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "SVGButton",
			state : {
				off : {
					text : "",
					svgGraphicColor : "#d4d3d4",
					svgTextColor : "#000000"
				},
				on : {
					text : "",
					svgGraphicColor : "#ff0000",
					svgTextColor : "#ffffff"
				}
			},
			buttonType : null,
			textLocation : null
		}
	});
	// 사각 버튼
	var RectangleButton = SVGButton.define('hmi.RectangleButton', {
		attrs : {
			body: {
				strokeWidth : 1,
				stroke : '#000000',
				fill : "#d4d3d4",
				refWidth : "100%",
				refHeight : "100%"
			},
			label : {
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				textVerticalAnchor : 'middle',
				textAnchor: 'middle',
				refX: '50%',
				refY: '50%',
				fill : "#000000"
			}
		}
	}, {
		markup: [{
			tagName: 'rect',
			selector: 'body'
		}, {
			tagName: 'text',
			selector: 'label'
		}],
		initialize : function(options){
			SVGButton.prototype.initialize.apply(this, arguments);
			this.initializeOptions(options, {
				size : {
					width : HmiCommon.DEFAULT_RECT_GRAPHIC_WIDTH, height : HmiCommon.DEFAULT_RECT_GRAPHIC_HEIGHT
				}
			});
			this.updateBindingValue();
		}
	}, {
		defaultBindingProp : {
			type : "RectangleGraphic"
		}
	});

	//원형 버튼
	var RoundButton = SVGButton.define('hmi.RoundButton', {
		attrs : {
			body: {
				strokeWidth : 1,
				stroke : '#000000',
				fill : "#d4d3d4",
				refCx: '50%',
				refCy: '50%',
				refRx: '50%',
				refRy: '50%'
			},
			label : {
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				textVerticalAnchor : 'middle',
				textAnchor: 'middle',
				refX: '50%',
				refY: '50%',
				fill : "#000000"
			}
		}
	}, {
		markup: [{
			tagName: 'ellipse',
			selector: 'body'
		}, {
			tagName: 'text',
			selector: 'label'
		}],
		initialize : function(options){
			BaseHmiElement.prototype.initialize.apply(this, arguments);
			this.initializeOptions(options, {
				size : {
					width : HmiCommon.DEFAULT_ROUND_BUTTON_SIZE, height : HmiCommon.DEFAULT_ROUND_BUTTON_SIZE
				}
			});
			this.updateBindingValue();
		}
	}, {
		defaultBindingProp : {
			type : "RectangleGraphic"
		}
	});

	var Text = Rectangle.define('hmi.Text', {
		attrs : {
			body: {
				strokeDasharray : '0',
				strokeWidth : 1,
				stroke : "transparent",
				fill : "transparent"
			},
			label : {
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				textWrap : {
					separator : /(\s+)/,
					width : -(HmiCommon.DEFAULT_TEXT_LABEL_PADDING * 2 + 2),
					text : "",
					hyphen : /[^\n]/
				},
				fill : HmiCommon.DEFAULT_FONT_COLOR,
				lineHeight : 'auto',
				cursor : 'text',
				textAnchor : 'start',
				refX : 0,
				refX2 : HmiCommon.DEFAULT_TEXT_LABEL_PADDING,
				refY2 : 0
			}
		}
	}, {
		initialize : function(options){
			Rectangle.prototype.initialize.apply(this, arguments);
			this.initializeOptions(options, {
				size : {
					width : HmiCommon.DEFAULT_RECT_GRAPHIC_WIDTH, height : HmiCommon.DEFAULT_RECT_GRAPHIC_HEIGHT
				}
			});
		},
		isTextElement : function(element){
			var tagName = element.tagName.toUpperCase();
			if(tagName === "TEXT" || tagName == "TSPAN" || tagName == "TEXTPATH") return true;
			return false;
		},
		isEditable : function(){
			var that = this;
			var propertyType = that.prop("binding/propertyType");
			var device = that.prop("binding/device");
			if(propertyType == "READ") return false;
			else if(that.isEditableCanvas() && (device.id === null || typeof device.id === "undefined")) return true;
			return false;
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}else if(key == 'binding/fontColor'){
					that.attr("label/fill", value);
				}else if(key == 'binding/strokeWidth'){
					that.attr("body/strokeWidth", value);
				}else if(key == 'binding/strokeColor'){
					that.attr("body/stroke", value);
				}else if(key == 'binding/strokeDasharray'){
					that.setDasharray(value);
				}else if(key == 'binding/fillColor'){
					that.attr("body/fill", value);
				}else if(key == 'binding/vAlign' || key == 'binding/hAlign'){
					that.updateAlign();
				}
			});

			that.on('event:pointerclick', function(cellView, evt){
				var textElement = evt.target;
				var isLocked = that.prop("binding/locked");
				if(that.isEditableCanvas() && !isLocked) that.edit(cellView, textElement);
			});

			//높이 자동 리사이징 삭제 2019.11.12
			//키보드로 텍스트 입력 시, 박스 사이즈 리사이징
			/*that.on('change:attrs', function(element){
				that.autoResize();
			});*/
			//사이즈 리사이징 시, 텍스트 사이즈에 따라 박스 리사이징
			//that.on('change:size', that.autoResize.bind(that));
			//텍스트 에디터의 편집이 끝나고 닫힐 때 값을 저장하고, unit을 포함하여 text를 표시한다.
			that.on("event:texteditorclose", function(textEditor){
				//값이 변하지 않아도 Text를 Unit과 합쳐 업데이트해야하므로, prop()을 쓰지 않고 함수 직접 호출
				var text = that.attr("label/textWrap/text");
				if(text == ''){
					//텍스트 입력하지 않고 닫을 시, 요소 삭제
					that.remove();
				}else{
					that.setValue(text);
				}
			});
		},
		setTextAlign : function(propertyName, align){
			this.prop(propertyName, align);
		},
		getTextAlign : function(align){
			return this.prop('binding/' + align);
		},
		autoResize : function(){
			var that = this;
			var view = that.getCurrentView();
			if(view){
				var text = view.findBySelector('label')[0];
				if(text){
					var bbox = text.getBBox();
					var size = that.size();
					var newHeight = bbox.height;
					//텍스트 높이가 넘어갈 경우 높이 업데이트
					if(newHeight > size.height){
						that.resize(size.width, newHeight);
					}
				}
			}
		},
		edit : function(cellView, textElement){
			var that = this;
			if(!that.isTextElement(textElement)){
				//하위 요소를 찾는다.
				textElement = $(textElement).find("text")[0];
			}
			textElement = TextEditor.getTextElement(textElement);

			var value = that.prop("binding/value");
			var textAreaAttr = { tabindex : 1 };
			var isEditableCanvas = that.isEditableCanvas();
			if(!isEditableCanvas){
				textAreaAttr.rows = 1;
			}

			TextEditor.edit(textElement, {
				cellView : cellView,
				model : that,
				textProperty : 'attrs/label/textWrap/text',
				textareaAttributes : textAreaAttr,
				isEditableCanvas : isEditableCanvas
			});

			//TextEditor.selectAll();
			TextEditor.setCaret(value.length);
		},
		setText : function(text){
			var that = this;
			that.attr("label/textWrap/text", text);
		},
		updateAlign : function(){
			var that = this;
			var vAlign = that.prop("binding/vAlign");
			var hAlign = that.prop("binding/hAlign");
			var refX, refY, refX2, refY2;
			if(vAlign == "top"){
				refY = 0;
				refY2 = HmiCommon.DEFAULT_TEXT_LABEL_PADDING;
				that.attr("label/textVerticalAnchor", "top");
			}else if(vAlign == "bottom"){
				refY = "100%";
				refY2 = -HmiCommon.DEFAULT_TEXT_LABEL_PADDING;
				that.attr("label/textVerticalAnchor", "bottom");
			}else{	//middle
				refY = "50%";
				refY2 = 0;
				that.attr("label/textVerticalAnchor", "middle");
			}
			if(hAlign == "right") {
				refX = "100%";
				refX2 = -HmiCommon.DEFAULT_TEXT_LABEL_PADDING;
				that.attr("label/textAnchor", "end");
			}else if(hAlign == "left"){
				refX = 0;
				refX2 = HmiCommon.DEFAULT_TEXT_LABEL_PADDING;
				that.attr("label/textAnchor", "start");
			}else{
				refX = "50%";
				refX2 = 0;
				that.attr("label/textAnchor", "middle");
			}

			that.attr("label", {
				refX : refX,
				refY : refY,
				refX2 : refX2,
				refY2 : refY2
			});
		},
		setBindingData : function(data){
			var that = this;
			BaseHmiElement.prototype.setBindingData.call(that, data);
			var value = data.value;
			if(value) that.prop("binding/value", value);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(that);
			data.value = that.prop("binding/value");
			return data;
		},
		setVAlign : function(direction){
			this.prop("binding/vAlign", direction);
		},
		setHAlign : function(direction){
			this.prop("binding/hAlign", direction);
		}
	}, {
		defaultBindingProp : {
			type : "Label",
			value : I18N.prop("HMI_TEXT"),
			fontSize : HmiCommon.DEFAULT_FONT_SIZE,
			fontColor : HmiCommon.DEFAULT_FONT_COLOR,
			fillColor : "transparent",
			strokeColor : "transparent",
			vAlign : "middle",
			hAlign : "left"
		},
		getCursor : function(){
			return 'cursor_text.png';
		}
	});

	var ExtendText = Rectangle.define('hmi.ExtendText', {
		attrs : {
			body: null,
			input : {
				strokeWidth : 1,
				stroke : "#000000",
				fill : "transparent",
				refX : 0,
				refY : 0,
				refWidth : "100%",
				refHeight : "100%"
			},
			label : {
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				text : I18N.prop("HMI_TEXT"),
				cursor : 'text',
				refX : 0,
				refX2 : HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_MARGIN,
				textAnchor : "start",
				textVerticalAnchor : "middle",
				refY2 : 0
			},
			button : {
				strokeWidth : 1,
				stroke : "#000000",
				fill : "#e6e6e6",
				refX : "100%",
				refX2 : -HmiCommon.DEFAULT_TEXT_BOX_BUTTON_WIDTH,
				width : HmiCommon.DEFAULT_TEXT_BOX_BUTTON_WIDTH,
				refHeight : "100%",
				cursor : 'pointer'
			},
			buttonText : {
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				text : I18N.prop("HMI_BUTTON_SEND"),
				textAnchor : "middle",
				textVerticalAnchor : "middle",
				refX : "100%",
				refX2 : -(HmiCommon.DEFAULT_TEXT_BOX_BUTTON_WIDTH / 2),
				refY : "50%",
				cursor : 'pointer'
			}
		}
	}, {
		markup: [{
			tagName: 'rect',
			selector: 'input'
		}, {
			tagName: 'text',
			selector: 'label'
		}, {
			tagName: 'rect',
			selector: 'button'
		}, {
			tagName: 'text',
			selector: 'buttonText'
		}],
		initialize : function(options){
			Rectangle.prototype.initialize.apply(this, arguments);
			this.initializeOptions(options, {
				size : {
					width : HmiCommon.DEFAULT_COMBOBOX_BOX_WIDTH, height : HmiCommon.DEFAULT_COMBOBOX_BOX_HEIGHT
				}
			});
			this.updateButtonState();
			this.updateBindingValue();
		},
		setTextAlign : function(propertyName, align){
			this.prop(propertyName, align);
		},
		getTextAlign : function(align){
			return this.prop('binding/' + align);
		},
		updateButtonState : function(){
			var that = this, binding = that.prop("binding");
			if(binding.hasButton && binding.propertyType != "READ"){
				that.attr("input", { refWidth2 : -(HmiCommon.DEFAULT_TEXT_BOX_BUTTON_WIDTH + HmiCommon.DEFAULT_TEXT_BOX_MARGIN)});
				that.attr("button", { opacity : 1, width : HmiCommon.DEFAULT_TEXT_BOX_BUTTON_WIDTH });
				that.attr("buttonText", { opacity : 1 });
				that.prop("binding/minWidth", HmiCommon.DEFAULT_TEXT_BOX_WITH_BUTTON_MIN_WIDTH);
				var size = that.size();
				if(size.width < HmiCommon.DEFAULT_TEXT_BOX_WITH_BUTTON_MIN_WIDTH){
					size.width = HmiCommon.DEFAULT_TEXT_BOX_WITH_BUTTON_MIN_WIDTH;
					that.resize(size.width, size.height);
				}
			}else{
				that.attr("input", { refWidth2 : null });
				that.attr("button", { opacity : 0, width : 0 });
				that.attr("buttonText", { opacity : 0 });
				that.prop("binding/minWidth", HmiCommon.DEFAULT_TEXT_BOX_MIN_WIDTH);
			}

			if(binding.propertyType == "READ"){
				that.attr("label", { cursor : "default" });
				that.attr("button", { cursor : "default" });
				that.attr("buttonText", { cursor : "default" });
			}else {
				that.attr("label", { cursor : "text" });
				that.attr("button", { cursor : "pointer" });
				that.attr("buttonText", { cursor : "pointer" });
			}
		},
		isTextElement : function(element){
			var tagName = element.tagName.toUpperCase();
			if(tagName === "TEXT" || tagName == "TSPAN" || tagName == "TEXTPATH") return true;
			return false;
		},
		isEditable : function(){
			var that = this;
			var propertyType = that.prop("binding/propertyType");
			var device = that.prop("binding/device");
			if(propertyType == "READ") return false;
			else if(that.isEditableCanvas() && (device.id === null || typeof device.id === "undefined")) return true;
			return false;
		},
		isControlable : function(){
			var that = this;
			var propertyType = that.prop("binding/propertyType");
			var device = that.prop("binding/device");
			if(propertyType !== "READ" && !that.isEditableCanvas()) return true;
			return false;
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/value'){
					that.updateBindingValue();
				}else if(key == 'binding/hasButton' || key == 'binding/propertyType'){
					that.updateButtonState();
					that.updateAlign();
				}else if(key == 'binding/highlightColor'){
					that.attr("button/fill", value);
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
					that.attr("buttonText/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
					that.attr("buttonText/fontSize", value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
					that.attr("buttonText/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
					that.attr("buttonText/fontWeight", value);
				}else if(key == 'binding/fontColor'){
					that.attr("label/fill", value);
					that.attr("buttonText/fill", value);
				}else if(key == 'binding/strokeWidth'){
					that.attr("input/strokeWidth", value);
				}else if(key == 'binding/strokeColor'){
					that.attr("input/stroke", value);
				}else if(key == 'binding/strokeDasharray'){
					that.attr("input/strokeDasharray", value);
				}else if(key == 'binding/fillColor'){
					that.attr("input/fill", value);
				}else if(key == 'binding/vAlign' || key == 'binding/hAlign'){
					that.updateAlign();
				}
			});

			/*that.on('event:pointerclick', function(cellView, evt){
				if(typeof that.clicked === "undefined") that.clicked = 0;
				that.clicked++;
				var textElement = evt.target;
				that.clickTimeout = setTimeout(function(){
					if(that.clicked == 1 && that.isEditable()){
						that.edit(cellView, textElement);
						that.clicked = 0;
					}
				}, 250);
			});*/

			that.on('event:pointerdown', function(cellView, evt){
				var textElement = evt.target;
				var isLocked = that.prop("binding/locked");
				if(that.isControlable()){
					if(textElement.tagName == "tspan") textElement = $(textElement).closest("text");
					var selector = $(textElement).attr("joint-selector");
					if(selector == "button" || selector == "buttonText"){	//버튼 클릭 시, 제어
						TextEditor.close();
						Loading.open();
						that.patchAnalogTypeControlValue().always(function(){
							Loading.close();
						});
					}else if(!isLocked){
						that.edit(cellView, $(textElement).get(0));
					}
				}
			});

			//키보드로 텍스트 입력 시, 박스 사이즈 리사이징
			/*that.on('change:attrs', function(element, newAttrs, opt){
				var path = opt.propertyPath;
				if(path == "attrs/label/text"){
					that.autoResize();
				}
			});*/

			//숫자만 입력 가능, 타입에 따라 값 입력 범위 다름
			/*that.on('change:attrs', function(element, newAttrs, opt){
				var binding = that.prop("binding");
				var path = opt.propertyPath;
				var value = opt.propertyValue;
				if(path == "attrs/label/text"){
					//that.autoResize();
					console.log(value);
				}
			});*/

			//텍스트 에디터의 편집이 끝나고 닫힐 때 값을 저장하고, unit을 포함하여 text를 표시한다.
			that.on("event:texteditorclose", function(textEditor, isEnter){
				that._isEditing = false;
				//값이 변하지 않아도 Text를 Unit과 합쳐 업데이트해야하므로, prop()을 쓰지 않고 함수 직접 호출
				var hasButton = this.prop("binding/hasButton");
				var text = that.attr("label/text");
				that.setValue(text);
				that.updateBindingValue();
				//버튼이 존재하는데 Enter를 누른 것은 제어 명령을 보내지 않는다.
				//if(isEnter && hasButton) return;
				that.patchAnalogTypeControlValue().always(function(){
					//Loading.close();
				});
			});
		},
		autoResize : function(){
			var that = this;
			var view = that.getCurrentView();
			if(view){
				var text = view.findBySelector('label')[0];
				if(text){
					var padding = HmiCommon.DEFAULT_TEXT_PADDING;
					var bbox = text.getBBox();
					var size = that.size();
					var newWidth = bbox.width + padding;
					if(newWidth <= size.width) newWidth = size.width;
					that.resize(newWidth, bbox.height + padding);
				}
			}
		},
		updateBindingValue : function(){
			var that = this;
			var value = that.getValue();
			if(!that._isEditing){
				that.setText(value);
				that.updateAlign();
			}
			//that.autoResize();
		},
		getValue : function(){
			var that = this;
			var value = that.prop("binding/value");
			var device = that.prop("binding/device");
			//Digital Type은 0 또는 1로만 표시
			if(device.id && HmiUtil.isDigitalType(device.type)){
				if(value > 1) value = 1;
				if(value < 0) value = 0;
				value = Math.floor(value);
			}
			//Number인 경우만 소수점 절사 포맷 적용
			if(!isNaN(Number(value))) value = Util.convertNumberFormat(value);

			return value;
		},
		edit : function(cellView, textElement){
			var that = this, otherEl;
			if(!that.isTextElement(textElement)){
				//하위 요소를 찾는다.
				otherEl = $(textElement).find("text");
				if(otherEl.length > 0){
					textElement = otherEl.get(0);
				}else{
					//같은 레벨 요소를 찾는다.
					otherEl = $(textElement).siblings("text[joint-selector='label']");
					if(otherEl.length > 0) textElement = otherEl.get(0);
					else textElement = null;
				}

			}
			textElement = TextEditor.getTextElement(textElement);

			var value = that.prop("binding/value");
			var hasButton = that.prop("binding/hasButton");
			var min, max, device = that.prop("binding/device");
			if(HmiUtil.isDigitalType(device.type)){
				min = 0;
				max = 1;
			}else{
				min = that.prop("binding/minValue");
				max = that.prop("binding/maxValue");
			}

			var textAreaAttr = { tabindex : 1, rows : 1 };
			var isEditableCanvas = that.isEditableCanvas();
			that._isEditing = true;
			TextEditor.edit(textElement, {
				cellView : cellView,
				textProperty : 'attrs/label/text',
				textareaAttributes : textAreaAttr,
				isEditableCanvas : isEditableCanvas,
				hasButton : hasButton,
				isAllowDot : true,
				textValidation : that._validationText.bind(that),
				min : min,
				max : max
			});
			value = value + "";
			//TextEditor.selectAll();
			TextEditor.setCaret(value.length);
		},
		//텍스트 입력 시, Validation하여 값이 입력되지 않도록 한다. (한글의 경우 이벤트로 막을 수 없으므로, textarea 레벨에서 처리한다.)
		_validationText : function(text){
			var that = this, device = that.prop("binding/device");
			//한글
			text = text.replace(/[\a-zㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
			//Digital Type은 0 또는 1만 입력
			if(device.id && HmiUtil.isDigitalType(device.type)){
				text = text.replace(/((?!(0|1)).)*$/g, '');
				text = Number(text);
				//0보다 작은 값을 입력 또는 1일 때 0 입력 시도.
				if(text < 0 || text == 10) text = 0;
				if(text > 1) text = 1;
				text = text + "";
			}else if(!isNaN(Number(text))){	//Analog Type은 소수점이 존재할 경우 첫째자리만 입력 가능
				var dots = text.split(".");
				if(dots.length > 1 && dots[1].length > 1){
					text = kendo.toString(Number(text), "00.0");
				}
			}

			return text;
		},
		setText : function(text){
			var that = this;
			that.attr("label/text", text);
		},
		updateAlign : function(){
			var that = this;
			var vAlign = that.prop("binding/vAlign");
			var hAlign = that.prop("binding/hAlign");
			var hasButton = that.prop("binding/hasButton");
			var refWidth = that.attr("input/refWidth2");
			var refX, refY, refX2 = 0, refY2 = 0;
			if(vAlign == "top"){
				refY = 0;
				that.attr("label/textVerticalAnchor", "top");
			}else if(vAlign == "bottom"){
				refY = "100%";
				that.attr("label/textVerticalAnchor", "bottom");
			}else{	//middle
				refY = "50%";
				that.attr("label/textVerticalAnchor", "middle");
			}
			if(hAlign == "right") {
				refX = "100%";
				if(hasButton) refX2 = -(HmiCommon.DEFAULT_TEXT_BOX_BUTTON_WIDTH + HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_MARGIN + HmiCommon.DEFAULT_TEXT_BOX_MARGIN);
				else refX2 = -HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_MARGIN;
				that.attr("label/textAnchor", "end");
			}else if(hAlign == "left"){
				refX = 0;
				refX2 = HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_MARGIN;
				that.attr("label/textAnchor", "start");
			}else{
				refX = "50%";
				if(hasButton) refX2 = -((HmiCommon.DEFAULT_TEXT_BOX_BUTTON_WIDTH / 2) + (HmiCommon.DEFAULT_TEXT_BOX_MARGIN / 2));
				else refX2 = 0;
				that.attr("label/textAnchor", "middle");
			}

			that.attr("label", {
				refX : refX,
				refX2 : refX2,
				refY : refY
			});
		},
		setBindingData : function(data){
			var that = this;
			BaseHmiElement.prototype.setBindingData.call(that, data);
			var propertyType = data.propertyType, value = data.controlValue, highlightColor = data.highlightColor,
				minValue = data.minValue, maxValue = data.maxValue, hasButton = data.hasButton;

			hasButton = (hasButton === false || hasButton == "false") ? false : true;

			that.prop("binding/propertyType", propertyType);
			that.prop("binding/highlightColor", highlightColor);
			that.prop("binding/hasButton", hasButton);
			if(value) that.prop("binding/value", value);
			if(minValue) that.prop("binding/minValue", minValue);
			if(maxValue) that.prop("binding/maxValue", maxValue);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(that);
			data.propertyType = that.prop("binding/propertyType");
			data.highlightColor = that.prop("binding/highlightColor");
			data.hasButton = that.prop("binding/hasButton");
			data.value = data.controlValue = that.prop("binding/value");
			data.minValue = that.prop("binding/minValue");
			data.maxValue = that.prop("binding/maxValue");
			return data;
		},
		setVAlign : function(direction){
			this.prop("binding/vAlign", direction);
		},
		setHAlign : function(direction){
			this.prop("binding/hAlign", direction);
		}
	}, {
		defaultBindingProp : {
			type : "ExtLabel",
			propertyType : "WRITE",
			hasButton : true,
			fillColor : "transparent",
			strokeWidth : 1,
			strokeColor : "#000000",
			value : 0,
			minValue : 0,
			maxValue : 100,
			highlightColor : "#e6e6e6",
			vAlign : "middle",
			hAlign : "left"
		},
		getCursor : function(){
			return 'cursor_text.png';
		}
	});

	var ProgressBar = Rectangle.define('hmi.Progressbar', {
		attrs :{
			progress : {
				refWidth : "0%",
				refHeight : "0%",
				fill : "#0000FF"
			},
			body: {
				refWidth : "100%",
				refHeight : "100%",
				stroke: "#000000",
				strokeDasharray : "0",
				fill : "transparent"
			},
			label : {
				refY : 0,
				fontType : HmiCommon.DEFAULT_FONT_TYPE
			}
		}
	}, {
		markup: [{
			tagName: 'rect',
			selector: 'body'
		}, {
			tagName: 'rect',
			selector: 'progress'
		}, {
			tagName: 'text',
			selector: 'label'
		}],
		initialize : function(options){
			var that = this;
			Rectangle.prototype.initialize.apply(that, arguments);
			var key = this.prop("binding/key");
			//수직
			var size = {}, attrs = {}, binding = {};
			if(key.indexOf("VERTICAL") != -1){
				binding.direction = "vertical";
				size.width = HmiCommon.DEFAULT_PROGRESSBAR_HEIGHT;
				size.height = HmiCommon.DEFAULT_PROGRESSBAR_WIDTH;
				attrs.progress = {
					refWidth : "100%",
					refHeight : "0%",
					refY : "100%"
				};
			}else{	//수평
				binding.direciton = "horizontal";
				size.width = HmiCommon.DEFAULT_PROGRESSBAR_WIDTH;
				size.height = HmiCommon.DEFAULT_PROGRESSBAR_HEIGHT;
				attrs.progress = {
					refWidth : "0%",
					refHeight : "100%"
				};
			}

			this.initializeOptions(options, {
				size : size, attrs : attrs, binding : binding
			});
			this.updateBindingValue();
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/value' || key == 'binding/minValue' || key == 'binding/prefix' || key == 'binding/suffix'
					|| key == 'binding/maxValue' || key == "binding/textLocation"){
					this.updateBindingValue();
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}else if(key == 'binding/fontColor'){
					that.attr("label/fill", value);
				}else if(key == 'binding/strokeWidth'){
					that.attr("body/strokeWidth", value);
				}else if(key == 'binding/strokeColor'){
					that.attr("body/stroke", value);
				}else if(key == 'binding/strokeDasharray'){
					that.attr("body/strokeDasharray", value);
				}else if(key == 'binding/fillColor'){
					that.attr("body/fill", value);
				}else if(key == 'binding/highlightColor'){
					that.attr("progress/fill", value);
				}
			});
		},
		updateBindingValue : function(){
			var that = this;
			var direction = that.prop("binding/direction");
			var percentage = that.getPercentage();
			this.updateTextFromState();
			that.updateText(percentage);
			var refValue = percentage + "%";
			var highlightColor = that.prop("binding/highlightColor");
			that.attr("progress/fill", highlightColor);

			if(direction == "vertical"){
				//수직 프로그레스 바는 아래에서 위로 올라가야하므로 Y축도 변화시킨다.
				var remainder = (100 - percentage) + "%";
				that.transition("attrs/progress/refY", remainder, {
					duration : 1000,
					valueFunction: joint.util.interpolate.unit,
					timingFunction: joint.util.timing.linear
				});
				that.transition("attrs/progress/refHeight", refValue, {
					duration : 1000,
					valueFunction: joint.util.interpolate.unit,
					timingFunction: joint.util.timing.linear
				});
			}else{
				that.transition("attrs/progress/refWidth", refValue, {
					duration : 1000,
					valueFunction: joint.util.interpolate.unit,
					timingFunction: joint.util.timing.linear
				});
			}
		},
		getPercentage : function(){
			var that = this;
			var value = that.getValue();
			var minValue = that.prop("binding/minValue"), maxValue = that.prop("binding/maxValue");
			if(value < minValue) value = minValue;
			if(value > maxValue) value = maxValue;

			var percentage = ((value - minValue) / (maxValue - minValue)) * 100;
			return Util.convertNumberFormat(percentage);
		},
		updateText : function(percentage){
			var that = this;
			if(!percentage) percentage = that.getPercentage();
			var prefix = that.prop("binding/prefix"), suffix = that.prop("binding/suffix");
			var text = percentage;
			if(prefix) text = prefix + text;
			if(suffix) text = text + suffix;
			that.attr("label/text", text);
		},
		updateTextFromState : function(){
			var that = this;
			var refPos = that.getRefPosFromTextLocation();
			if(refPos){
				that.attr("label", {
					opacity : 1,
					textVerticalAnchor : refPos.textVerticalAnchor,
					textAnchor : refPos.textAnchor,
					refX : refPos.refX,
					refX2 : refPos.refX2,
					refY : refPos.refY,
					refY2 : refPos.refY2
				});
			}else{
				//텍스트를 숨김
				that.attr("label", { opacity : 0 });
			}
		},
		setBindingData : function(data){
			var that = this;
			BaseHmiElement.prototype.setBindingData.call(that, data);
			var value = data.value, prefix = data.prefix, suffix = data.suffix, textLocation = data.textLocation,
				minValue = data.minValue, maxValue = data.maxValue, highlightColor = data.highlightColor;

			that.prop("binding/prefix", prefix);
			that.prop("binding/suffix", suffix);
			that.prop("binding/textLocation", textLocation);
			that.prop("binding/highlightColor", highlightColor);
			if(typeof minValue == "string") minValue = Number(minValue);
			if(typeof maxValue == "string") maxValue = Number(maxValue);
			that.prop("binding/minValue", minValue);
			that.prop("binding/maxValue", maxValue);
			that.prop("binding/value", value);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(that);
			data.direction = that.prop("binding/direction");
			data.prefix = that.prop("binding/prefix");
			data.suffix = that.prop("binding/suffix");
			data.textLocation = that.prop("binding/textLocation");
			data.highlightColor = that.prop("binding/highlightColor");
			data.minValue = that.prop("binding/minValue");
			data.maxValue = that.prop("binding/maxValue");
			data.value = that.prop("binding/value");
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "ProgressBar",
			value : 0,
			prefix : null,
			suffix : null,
			minValue : 0,
			maxValue : 100,
			direction : HmiCommon.DEFAULT_PROGRESSBAR_DIRECTION,
			highlightColor : "#0000FF",
			strokeColor : "#000000",
			fillColor : "transparent",
			textLocation : null 	//초기화 할 때 결정되므로 Default 정하지 않음.
		}
	});

	var ScaleBar = Rectangle.define('hmi.Scalebar', {
		attrs :{
			body: {
				refWidth : "100%",
				refHeight : "100%",
				stroke: "#000000",
				strokeDasharray : "0",
				fill : "#d3d3d3"
			},
			inner : {
				refWidth : "0%",
				refHeight : "0%",
				stroke : "#bebebe",
				fill : "#00007f"
			},
			label : {
				refY : 0,
				fontType : HmiCommon.DEFAULT_FONT_TYPE
			},
			marker : {
				strokeWidth : 1,
				stroke : "#000000",
				fill : "#00007f"
			}
		}
	}, {
		markup: [{
			tagName: 'rect',
			selector: 'body'
		}, {
			tagName : 'rect',
			selector : 'inner'
		}, {
			tagName: 'rect',
			selector: 'marker'
		}, {
			tagName: 'text',
			selector: 'label'
		}],
		initialize : function(options){
			var that = this;
			Rectangle.prototype.initialize.apply(that, arguments);
			var key = this.prop("binding/key");

			//수직
			var markerThickness = 5;
			var size = {}, attrs = {}, binding = {};
			if(key.indexOf("VERTICAL") != -1){
				binding.direction = "vertical";
				size.width = HmiCommon.DEFAULT_SCALEBAR_HEIGHT;
				size.height = HmiCommon.DEFAULT_SCALEBAR_WIDTH;
				attrs.marker = {
					refWidth : "120%",
					height : markerThickness,
					refX : "0%",
					refX2 : "-10%",
					refY : "50%",
					refY2 : -(markerThickness / 2)
				};
				attrs.inner = {
					refWidth : "100%",
					refHeight : "50%",
					refY : "100%",
					refY2 : "-50%",
					refX : "0%"
				};
			}else{	//수평
				binding.direction = "horizontal";
				size.width = HmiCommon.DEFAULT_SCALEBAR_WIDTH;
				size.height = HmiCommon.DEFAULT_SCALEBAR_HEIGHT;
				attrs.marker = {
					width : markerThickness,
					refHeight : "120%",
					refX : "50%",
					refX2 : -(markerThickness / 2),
					refY : "0%",
					refY2 : "-10%"
				};
				attrs.inner = {
					refHeight : "100%",
					refWidth : "50%",
					refY : "0%",
					refX : "0%"
				};
			}

			this.initializeOptions(options, {
				size : size, attrs : attrs, binding : binding
			});

			this.updateBindingValue();
			that.updateMarkerCursor();
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/value' || key == 'binding/minValue' || key == 'binding/prefix' || key == 'binding/suffix'
					|| key == 'binding/maxValue' || key == "binding/textLocation"){
					this.updateBindingValue();
				}else if(key == 'binding/highlightColor'){
					that.attr("inner/fill", value);
					that.attr("inner/stroke", value);
					that.attr("marker/fill", value);
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}else if(key == 'binding/fontColor'){
					that.attr("label/fill", value);
				}else if(key == 'binding/strokeWidth'){
					that.attr("body/strokeWidth", value);
				}else if(key == 'binding/strokeColor'){
					that.attr("body/stroke", value);
					that.attr("marker/stroke", value);
				}else if(key == 'binding/strokeDasharray'){
					that.attr("body/strokeDasharray", value);
				}else if(key == 'binding/fillColor'){
					that.attr("body/fill", value);
				}
			});

			that.on("change:angle", function(element, newAngle, opt){
				that.updateMarkerCursor(newAngle);
			});

			that.on("event:pointerdown", function(cellView, evt){
				var el = $(evt.target);
				var binding = that.prop("binding");
				if(el.attr("joint-selector") == "marker" && binding.propertyType != "READ"){
					that._isDragging = true;
					that._draggingValue = that.getScaledValue();
					that._dragStartX = evt.clientX;
					that._dragStartY = evt.clientY;
				}
			});

			that.on("event:pointermove", function(cellView, evt){
				if(that._isDragging){
					var movedX = evt.clientX;
					var movedY = evt.clientY;
					var dx = movedX - that._dragStartX;
					var dy = movedY - that._dragStartY;
					//that._dragStartX = movedX;
					//that._dragStartY = movedY;
					that.onMoveMarker(dx, dy);
				}
			});

			that.on("event:pointerup", function(cellView, evt){
				if(that._isDragging){
					that._isDragging = false;
					that._draggingValue = null;
					var binding = that.prop("binding");
					if(!that.isEditableCanvas() && binding.propertyType != "READ"){
						//Loading.open();
						var value = that.getScaledValue();
						that.patchAnalogTypeControlValue(value).always(function(){
							//Loading.close();
						});
					}
				}
			});
		},
		onMoveMarker : function(dx, dy){
			var that = this;
			var angle = that.angle(), direction = that.prop("binding/direction");
			if(direction == 'vertical') angle += 90;

			var canvas = that.getCanvas();
			var zoomLevel = canvas.getZoomLevel();
			zoomLevel = zoomLevel / 100;

			var size = that.size();
			var width = size.width;
			var height = size.height;
			//setValue 시, 퍼센트 단위로 Marker가 이동하므로 현재 높이/너비에 대해서 dx, dy를 재계산한다.
			var minValue = that.prop("binding/minValue"), maxValue = that.prop("binding/maxValue");
			var valueDiff = maxValue - minValue;
			if(angle < 0) angle = angle + 360;
			else if(angle > 360) angle = angle - 360;

			var changedValue, position = that._draggingValue;
			var cursor = that.attr("marker/cursor");

			if(direction == "horizontal"){
				dx = (dx / zoomLevel) * valueDiff / width;
				dy = (dy / zoomLevel) * valueDiff / width;
				if(cursor == "ns-resize") changedValue = (angle > 112.5 && angle <= 292.5) ? position - dy : position + dy;
				else changedValue = (angle > 112.5 && angle <= 292.5) ? position - dx : position + dx;
			}else{
				dx = (dx / zoomLevel) * valueDiff / height;
				dy = (dy / zoomLevel) * valueDiff / height;
				if(cursor == "ns-resize") changedValue = (angle > 112.5 && angle <= 292.5) ? position + dy : position - dy;
				else changedValue = (angle > 112.5 && angle <= 292.5) ? position + dx : position - dx;
			}

			//마커 이동
			//소수점 그대로 이동 시킨다.
			if(changedValue > maxValue) changedValue = maxValue;
			if(changedValue < minValue) changedValue = minValue;

			that.updateMarkerPosition(changedValue);
			//슬라이드 드래그하여 값 벼경 시, 소수점을 제거 및 이벤트 Trigger 없이 값 설정
			var savedValue = Number(kendo.toString(changedValue, "0"));
			var binding = that.prop("binding");
			binding.value = savedValue;
			//텍스트 업데이트
	        savedValue = that.getScaledValue();
			that.updateText(savedValue);
		},
		updateMarkerCursor : function(angle){
			var that = this;
			if(typeof angle === "undefined") angle = that.angle();

			var direction = that.prop("binding/direction");
			var cursorStyle;
			if(direction == "vertical") angle += 90;

			if(angle < 0) angle = angle + 360;
			else if(angle > 360) angle = angle - 360;
			//console.log("angle : " + angle);

			if((angle >= 0 && angle <= 22.5) || (angle > 337.5 && angle <= 360)){
				cursorStyle = "ew-resize";
			}else if((angle > 22.5 && angle <= 67.5) || (angle > 202.5 && angle <= 247.5)){
				cursorStyle = "nwse-resize";
			}else if((angle > 67.5 && angle <= 112.5) || (angle > 247.5 && angle <= 292.5)){
				cursorStyle = "ns-resize";
			}else if(angle > 112.5 && angle < 157.5 || (angle > 292.5 && angle <= 337.5)){
				cursorStyle = "nesw-resize";
			}else if(angle > 157.5 && angle <= 180 || (angle > 180 && angle <= 202.5)){
				cursorStyle = "ew-resize";
			}
			that.attr("marker/cursor", cursorStyle);
		},
		updateText : function(value){
			var that = this, prefix = that.prop("binding/prefix"), suffix = that.prop("binding/suffix");
			if(prefix) value = prefix + value;
			if(suffix) value = value + suffix;
			that.updateTextFromState(value);
		},
		updateBindingValue : function(){
			var that = this;
			var value = that.getScaledValue();
			that.updateMarkerPosition(value);
			that.updateText(value);
		},
		getScaledValue : function(value){
			var that = this;
			if(!value) value = that.getValue();
			var minValue = that.prop("binding/minValue"), maxValue = that.prop("binding/maxValue");
			if(value < minValue) value = minValue;
			if(value > maxValue) value = maxValue;
			if(value === null) value = 0;
			return Util.convertNumberFormat(value);
		},
		getValuePositionRatio : function(value){
			var that = this;
			var direction = that.prop("binding/direction");
			var minValue = that.prop("binding/minValue"), maxValue = that.prop("binding/maxValue");
			var positionRatio;
			if(direction == "vertical"){
				positionRatio = (1 - ((value - minValue) / (maxValue - minValue)));
			}else{
				positionRatio = ((value - minValue) / (maxValue - minValue));
			}
			return positionRatio;
		},
		getMarkerPosition : function(){
			var that = this, direction = that.prop("binding/direction"), position;
			if(direction == "vertical"){
				position = that.attr("inner/refHeight");
			}else{
				position = that.attr("marker/refX");
			}
			position = Number(position.replace("%", ""));
			return position;
		},
		updateMarkerPosition : function(value){
			var that = this;
			var direction = that.prop("binding/direction");
			var highlightColor = that.prop("binding/highlightColor");
			var markerAttr = { refX : null, refY : null, fill : highlightColor };
			var innerAttr = { refWidth : null, refHeight : null, fill : highlightColor, stroke : highlightColor };

			//var MARKER_PADDING = 4;
			var valuePercentage = that.getValuePositionRatio(value) * 100;
			var percentage = valuePercentage + "%";
			if(direction == "vertical"){
				var reminderPercentage = 100 - valuePercentage;
				var reminder = reminderPercentage + "%";
				markerAttr.refX = "0%";
				markerAttr.refY = percentage;
				innerAttr.refWidth = "100%";
				innerAttr.refHeight = reminder;
				innerAttr.refY2 = "-" + reminder;
			}else{
				valuePercentage = that.getValuePositionRatio(value) * 100;
				markerAttr.refY = "0%";
				markerAttr.refX = percentage;
				innerAttr.refHeight = "100%";
				innerAttr.refWidth = percentage;
			}
			that.attr("marker", markerAttr);
			that.attr("inner", innerAttr);
		},
		updateTextFromState : function(value){
			var that = this;
			var refPos = that.getRefPosFromTextLocation();
			if(refPos){
				that.attr("label", {
					opacity : 1,
					text : value,
					textVerticalAnchor : refPos.textVerticalAnchor,
					textAnchor : refPos.textAnchor,
					refX : refPos.refX,
					refX2 : refPos.refX2,
					refY : refPos.refY,
					refY2 : refPos.refY2
				});
			}else{
				//텍스트를 숨김
				that.attr("label", { opacity : 0 });
			}
		},
		setBindingData : function(data){
			var that = this;
			BaseHmiElement.prototype.setBindingData.call(that, data);
			var value = data.value, textLocation = data.textLocation,
				minValue = data.minValue, maxValue = data.maxValue, highlightColor = data.highlightColor,
				propertyType = data.propertyType, prefix = data.prefix, suffix = data.suffix;

			that.prop("binding/prefix", prefix);
			that.prop("binding/suffix", suffix);
			that.prop("binding/textLocation", textLocation);
			that.prop("binding/propertyType", propertyType);
			that.prop("binding/highlightColor", highlightColor);
			if(typeof minValue == "string") minValue = Number(minValue);
			if(typeof maxValue == "string") maxValue = Number(maxValue);
			that.prop("binding/minValue", minValue);
			that.prop("binding/maxValue", maxValue);
			that.prop("binding/value", value);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(that);

			data.textLocation = that.prop("binding/textLocation");
			data.propertyType = that.prop("binding/propertyType");
			data.highlightColor = that.prop("binding/highlightColor");
			data.direction = that.prop("binding/direction");
			data.minValue = that.prop("binding/minValue");
			data.maxValue = that.prop("binding/maxValue");
			data.prefix = that.prop("binding/prefix");
			data.suffix = that.prop("binding/suffix");
			data.value = that.prop("binding/value");
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "ScaleBar",
			minValue : 0,
			maxValue : 100,
			prefix : null,
			suffix : null,
			direction : HmiCommon.DEFAULT_PROGRESSBAR_DIRECTION,
			propertyType : "WRITE",
			strokeColor : "#000000",
			fillColor : "#d3d3d3",
			highlightColor : "#00007f",
			textLocation : null 	//초기화 할 때 결정되므로 Default 정하지 않음.
		}
	});

	var CheckBox = Rectangle.define('hmi.CheckBox', {
		type : "hmi.CheckBox",
		attrs : {
			body : {
				strokeWidth : 1,
				stroke : "#000000",
				fill : "#e6e6e6",
				strokeDasharray : "0"
			},
			label : {
				fontSize : HmiCommon.DEFAULT_FONT_TYPE,
				text : "",
				textAnchor : "start",
				refX : "0%",
				refX2 : HmiCommon.DEFAULT_CHECKBOX_PADDING,
				refY : "50%",
				refY2 : 0
			},
			checkboxWrapper : {
				strokeWidth : 1,
				stroke : "#000000",
				fill : "#ffffff",
				width : HmiCommon.DEFAULT_CHECKBOX_WRAPPER_SIZE,
				height : HmiCommon.DEFAULT_CHECKBOX_WRAPPER_SIZE,
				refX : "100%",
				refX2 : -HmiCommon.DEFAULT_CHECKBOX_PADDING,
				refY : "50%",
				refY2 : -(HmiCommon.DEFAULT_CHECKBOX_WRAPPER_SIZE / 2),
				cursor : 'default'
			},
			checkbox : {
				fill : "transparent",
				stroke : "transparent",
				strokeWidth : 0,
				width : HmiCommon.DEFAULT_CHECKBOX_CHECK_SIZE,
				height : HmiCommon.DEFAULT_CHECKBOX_CHECK_SIZE,
				refX : "100%",
				refX2 : -(HmiCommon.DEFAULT_CHECKBOX_PADDING - (HmiCommon.DEFAULT_CHECKBOX_CHECK_SIZE / 2)),
				refY : "50%",
				refY2 : -(HmiCommon.DEFAULT_CHECKBOX_CHECK_SIZE / 2),
				cursor : 'default'
			}
		}
	}, {
		markup: [{
			tagName: 'rect',
			selector: 'body'
		}, {
			tagName: 'text',
			selector: 'label'
		}, {
			tagName: 'rect',
			selector: 'checkboxWrapper'
		}, {
			tagName: 'rect',
			selector: 'checkbox'
		}],
		initialize : function(options){
			var that = this;
			Rectangle.prototype.initialize.apply(that, arguments);
			this.initializeOptions(options, {
				size : { width : HmiCommon.DEFAULT_CHECKBOX_OBJECT_WIDTH, height : HmiCommon.DEFAULT_CHECKBOX_OBJECT_HEIGHT}
			});
			this.updateBindingValue();
			this.updateText(this.prop("binding/checkboxLabel"));
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/value' || key == 'binding/highlightColor' || key == 'binding/reverse'){
					this.updateBindingValue();
				}else if(key == 'binding/propertyType'){
					if(value != "READ"){
						that.attr("checkboxWrapper", { cursor : "pointer"});
						that.attr("checkbox", { cursor : "pointer"});
					}else{
						that.attr("checkboxWrapper", { cursor : "default"});
						that.attr("checkbox", { cursor : "default"});
					}
				}else if(key == 'binding/checkboxLabel'){
					this.updateText(value);
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}else if(key == 'binding/fontColor'){
					that.attr("label/fill", value);
				}else if(key == 'binding/strokeWidth'){
					that.attr("body/strokeWidth", value);
				}else if(key == 'binding/strokeColor'){
					that.attr("body/stroke", value);
				}else if(key == 'binding/strokeDasharray'){
					that.attr("body/strokeDasharray", value);
				}else if(key == 'binding/fillColor'){
					that.attr("body/fill", value);
				}
			});

			that.on("event:pointerdown", that.control.bind(that));
		},
		control : function(cellView, evt){
			var that = this;
			var binding = that.prop("binding");
			if(!that.isEditableCanvas() && binding.propertyType != "READ"){
				var jointSelector = $(evt.target).attr("joint-selector");
				if(jointSelector == "checkbox" || jointSelector == "checkboxWrapper"){
					that.patchDigitalTypeControlValue().always(function(){
						//Loading.close();
					});
				}
			}
		},
		updateBindingValue : function(){
			var that = this, value = that.getValue();

			if(that.isReverse()) value = HmiUtil.getReverseValue(value);
			that.setChecked(value == 1);
		},
		setChecked : function(isChecked){
			var that = this, binding = that.prop("binding");
			var highlightColor = binding.highlightColor;
			if(isChecked){
				that.attr("checkbox", {
					fill : highlightColor,
					stroke : highlightColor
				});
			}else{
				that.attr("checkbox", {
					fill : "transparent",
					stroke : "transparent"
				});
			}
		},
		updateText : function(value){
			var that = this, size;
			if(value == "" || value === null || typeof value === "undefined"){
				that.prop('binding/minWidth', HmiCommon.DEFAULT_CHECKBOX_OBJECT_MIN_WIDTH);
				that.attr("label", {
					text : "",
					opacity : 0
				});
				that.attr("checkboxWrapper", {
					refX : "50%",
					refX2 : -(HmiCommon.DEFAULT_CHECKBOX_WRAPPER_SIZE / 2)
				});
				that.attr("checkbox", {
					refX : "50%",
					refX2 : -(HmiCommon.DEFAULT_CHECKBOX_CHECK_SIZE / 2)
				});
				size = that.size();
				var resizeWidth = size.width > HmiCommon.DEFAULT_CHECKBOX_OBJECT_MIN_WIDTH ? HmiCommon.DEFAULT_CHECKBOX_OBJECT_MIN_WIDTH : size.width;
				var resizeHeight = size.height > HmiCommon.DEFAULT_CHECKBOX_OBJECT_MIN_HEIGHT ? HmiCommon.DEFAULT_CHECKBOX_OBJECT_MIN_HEIGHT : size.height;
				that.resize(resizeWidth, resizeHeight);
			}else{
				that.prop('binding/minWidth', HmiCommon.DEFAULT_DROPDOWN_MIN_WIDTH);
				size = that.size();
				if(size.width < HmiCommon.DEFAULT_DROPDOWN_MIN_WIDTH){
					size.width = HmiCommon.DEFAULT_DROPDOWN_MIN_WIDTH;
					that.resize(size.width, size.height);
				}
				that.attr("label", {
					text : value,
					opacity : 1
				});
				that.attr("checkboxWrapper", {
					refX : "100%",
					refX2 : -HmiCommon.DEFAULT_CHECKBOX_PADDING
				});
				that.attr("checkbox", {
					refX : "100%",
					refX2 : -(HmiCommon.DEFAULT_CHECKBOX_PADDING - (HmiCommon.DEFAULT_CHECKBOX_CHECK_SIZE / 2))
				});
			}
		},
		setBindingData : function(data){
			var that = this;
			BaseHmiElement.prototype.setBindingData.call(that, data);
			var value = data.value, checkboxLabel = data.checkboxLabel, propertyType = data.propertyType,
				highlightColor = data.highlightColor, reverse = data.reverse;
			that.prop("binding/checkboxLabel", checkboxLabel);
			that.prop("binding/value", value);
			that.prop("binding/propertyType", propertyType);
			that.prop("binding/highlightColor", highlightColor);
			that.prop("binding/reverse", reverse);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(that);
			data.checkboxLabel = that.prop("binding/checkboxLabel");
			data.value = that.prop("binding/value");
			data.propertyType = that.prop("binding/propertyType");
			data.highlightColor = that.prop("binding/highlightColor");
			data.reverse = that.prop("binding/reverse");
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "ToggleButton",
			reverse : false,
			propertyType : "WRITE",
			fillColor : "#e6e6e6",
			strokeWidth : 1,
			strokeColor : "#000000",
			strokeDasharray : "0",
			highlightColor : "#000000",
			checkboxLabel : "",
			minWidth : HmiCommon.DEFAULT_CHECKBOX_OBJECT_MIN_WIDTH,
			minHeight : HmiCommon.DEFAULT_CHECKBOX_OBJECT_MIN_HEIGHT
		}
	});

	var RadioButton = Rectangle.define('hmi.RadioButton', {
		attrs : {
			body_0 : {
				fill : "#e6e6e6",
				refWidth : "100%",
				refHeight : "100%",
				strokeWidth : 1,
				stroke : "#000000"
			},
			label_0 : {
				text : "",
				textVerticalAnchor : "middle",
				textAnchor : "start",
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				refX : "0%",
				refX2 : HmiCommon.DEFAULT_CHECKBOX_PADDING,
				refY : "50%",
				refY2 : 0
			}
		}
	}, {
		markup: [{
			tagName: 'rect',
			selector: 'body_0'
		}, {
			tagName: 'text',
			selector: 'label_0'
		}],
		initialize : function(options){
			var that = this;
			Rectangle.prototype.initialize.apply(that, arguments);
			var key = this.prop("binding/key");
			//수직
			var binding = {};
			if(key.indexOf("VERTICAL") != -1){
				binding.direction = "vertical";
			}else{
				binding.direction = "horizontal";
			}

			this.initializeOptions(options, {
				size : { width : HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_WIDTH, height : HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_HEIGHT},
				binding : binding
			});

			this.updateBindingValue();
		},
		_defaultAddEvt : function(e){
			this.updateBindingValue();
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/value' || key == 'binding/optionValues' || key == 'binding/highlightColor'){
					this.updateBindingValue();
				}else if(key == 'binding/fontType'){
					that.setAllFontType(value);
				}else if(key == 'binding/fontSize'){
					that.setAllFontSize(value);
				}else if(key == 'binding/fontStyle'){
					that.setAllFontStyle(value);
				}else if(key == 'binding/fontWeight'){
					that.setAllFontWeight(value);
				}else if(key == 'binding/fontColor'){
					that.setAllFontColor(value);
				}else if(key == 'binding/fontColor'){
					that.setAllFillColor(value);
				}else if(key == 'binding/strokeWidth'){
					that.setAllStrokeWidth(value);
				}else if(key == 'binding/strokeColor'){
					that.setAllStrokeColor(value);
				}else if(key == 'binding/strokeDasharray'){
					that.setAllStrokeDasharray(value);
				}else if(key == 'binding/fillColor'){
					that.setAllFillColor(value);
				}
			});

			that.on("event:pointerdown", that.control.bind(that));
		},
		control : function(cellView, evt){
			var that = this, binding = that.prop("binding");

			if(!that.isEditableCanvas() && binding.propertyType != "READ"){
				if(evt.target.tagName == "tspan") evt.target = $(evt.target).closest("text");
				var jointSelector = $(evt.target).attr("joint-selector");
				if(jointSelector && ((jointSelector.indexOf("body") != -1) || (jointSelector.indexOf("label") != -1))){
					var split = jointSelector.split("_");
					var index = Number(split[1]);
					var optionValues = that.prop("binding/optionValues");
					var option = optionValues[index];
					//값 변경을 통한 UI 업데이트
					if(option){
						that.setValue(option.value);
						that.patchAnalogTypeControlValue().always(function(){
							//Loading.close();
						});
					}
				}
			}
		},
		updateBindingValue : function(){
			var that = this;
			var optionValues = that.prop("binding/optionValues");
			that.updateOptionValues(optionValues);
		},
		updateOptionValues : function(optionValues){
			var that = this;
			that._updateMarkupFromOptionValues(optionValues);
			var value = that.getValue();
			if(value !== null && typeof value !== "undefined") value = Math.floor(value);
			var i, option, max = optionValues.length;
			for( i = 0; i < max; i++ ){
				option = optionValues[i];
				if(option.value == value){
					that.setSelected(i);
					return;
				}
			}
		},
		_updateMarkupFromOptionValues : function(optionValues){
			var that = this, markup = joint.util.cloneDeep(BaseHmiElement.markup);
			var attr = {}, option, i, max = optionValues.length;
			//var isEditable = that.isEditableCanvas();
			//편집 상태에서는 1개의 박스만 표시한다.
			//if(isEditable) max = 1;
			for( i = 0; i < max; i++ ){
				option = optionValues[i];
				markup = markup.concat(that._createRadioButtonMarkUp(i));
				attr = $.extend(attr, that._createRadioButtonAttr(i, option));
			}
			that.attr(attr);
			that.set("markup", markup);
		},
		_createRadioButtonMarkUp : function(index){
			return [
				{ tagName : 'rect', selector : 'body_' + index },
				{ tagName : 'text', selector : 'label_' + index }
			];
		},
		_createRadioButtonAttr : function(index, option){
			var that = this;
			var optionValue = option.value;
			var optionText = option.text;
			var value = that.getValue();
			var attr = {};
			if(!option) option = "";
			var direction = that.prop("binding/direction");
			var fontSize = that.prop("binding/fontSize");
			var fontStyle = that.prop("binding/fontStyle");
			var fontWeight = that.prop("binding/fontWeight");
			var fontType = that.prop("binding/fontType");
			var fontColor = that.prop("binding/fontColor");
			fontColor = fontColor ? fontColor : "#000000";
			var fillColor = that.prop("binding/fillColor");
			fillColor = fillColor ? fillColor : "#e6e6e6";
			var highlightColor = that.prop("binding/highlightColor");
			fillColor = (value == optionValue) ? highlightColor : fillColor;
			var strokeColor = that.prop("binding/strokeColor");
			strokeColor = strokeColor ? strokeColor : "#000000";
			var strokeWidth = that.prop("binding/strokeWidth");
			strokeWidth = strokeWidth ? strokeWidth : 1;
			var strokeDasharray = that.prop("binding/strokeDasharray");
			strokeDasharray = strokeDasharray ? strokeDasharray : "0";

			var refY = "0%", refX = "0%", refX2 = 0, refY2 = 0;
			if(direction == "vertical"){
				if(index > 0){
					refY = index * 100;
					refY = refY + "%";
					//refY2 = index * HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_MARGIN;
				}
			}else if(index > 0){
				refX = index * 100;
				refX = refX + "%";
				//refX2 = index * HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_MARGIN;
			}

			attr["body_" + index] = { fill : fillColor, stroke : strokeColor, strokeWidth : strokeWidth,
				strokeDasharray : strokeDasharray,
				refWidth : "100%", refHeight : "100%",
				refY : refY, refY2 : refY2, refX : refX, refX2 : refX2 };

			if(direction == "vertical"){
				if(index > 0){
					refY = index * 100;
					refY = refY + 50 + "%";
				}else{
					refY = "50%";
				}
				refX = "50%";
				//refY2 = index * HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_MARGIN;
			}else{
				if(index > 0){
					refX = index * 100;
					refX = refX + 50 + "%";
				}else{
					refX = "50%";
				}
				refY = "50%";
				//refX2 = index * HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_MARGIN;
			}
			attr["label_" + index] = { text : optionText, textAnchor : "middle", textVerticalAnchor : "middle",
				refX : refX, refX2 : refX2, refY : refY, refY2 : refY2,
				fontSize : fontSize, fontStyle : fontStyle, fontWeight : fontWeight, fontFamily : fontType,
				fill : fontColor
			};
			return attr;
		},
		setSelected : function(index){
			//value를 index로 선택
			var that = this;
			var optionValues = that.prop("binding/optionValues");
			var highlightColor = that.prop("binding/highlightColor"),
				fillColor = that.prop("binding/fillColor"), strokeColor = that.prop("binding/strokeColor");
			var i, max = optionValues.length;
			var attrKey;
			for( i = 0; i < max; i++ ){
				attrKey = "body_" + i;
				if(index == i){
					that.attr(attrKey, { fill : highlightColor, stroke : strokeColor });
				}else{
					that.attr(attrKey, { fill : fillColor, stroke : strokeColor });
				}
			}
		},
		_setAllAttr : function(selector, attr, isExcludeSelectedBox){
			var that = this;
			var optionValues = that.prop("binding/optionValues");
			var option, i, max = optionValues.length;
			if(!selector) selector = "body_0";
			var attrKey, value = that.getValue();
			for( i = 0; i < max; i++ ){
				option = optionValues[i];
				//선택된 아이템 제외하고 색깔 변경 (Highlight Color 때문)
				if(isExcludeSelectedBox && option.value == value) continue;
				attrKey = selector + "_" + i;
				that.attr(attrKey, attr);
			}
		},
		setAllFontSize : function(size){
			this._setAllAttr("label", { fontSize : size });
		},
		setAllFontType : function(type){
			this._setAllAttr("label", { fontFamily : type });
		},
		setAllFontStyle : function(style){
			this._setAllAttr("label", { fontStyle : style });
		},
		setAllFontWeight : function(weight){
			this._setAllAttr("label", { fontWeight : weight });
		},
		setAllFontColor : function(color){
			this._setAllAttr("label", { fill : color });
		},
		setAllFillColor : function(color){
			this._setAllAttr("body", { fill : color }, true);
		},
		setAllStrokeWidth : function(strokeWidth){
			this._setAllAttr("body", { strokeWidth : strokeWidth });
		},
		setAllStrokeColor : function(color){
			this._setAllAttr("body", { stroke : color });
		},
		setAllStrokeDasharray : function(strokeDasharray){
			this._setAllAttr("body", { strokeDasharray : strokeDasharray });
		},
		setBindingData : function(data){
			var that = this;
			BaseHmiElement.prototype.setBindingData.call(that, data);
			var value = data.value, optionValues = data.optionValues,
				highlightColor = data.highlightColor, propertyType = data.propertyType;
			that.prop("binding/optionValues", optionValues, { rewrite : true });
			that.prop("binding/value", value);
			that.prop("binding/highlightColor", highlightColor);
			that.prop("binding/propertyType", propertyType);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(that);
			data.optionValues = that.prop("binding/optionValues");
			data.value = that.prop("binding/value");
			data.highlightColor = that.prop("binding/highlightColor");
			data.propertyType = that.prop("binding/propertyType");
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "RadioButton",
			propertyType : "WRITE",
			strokeColor : "#000000",
			fillColor : "#e6e6e6",
			highlightColor : "#0081c6",
			minWidth : HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_WIDTH,
			minHeight : HmiCommon.DEFAULT_RADIO_BUTTON_ITEM_HEIGHT,
			optionValues : [{ value : 0, text : "" }]
		}
	});

	var ComboBox = Rectangle.define('hmi.Combobox', {
		attrs : {
			body : {
				fill : "#e6e6e6",
				refWidth : "100%",
				refHeight : "100%",
				strokeWidth : 1,
				stroke : "#000000"
			},
			label : {
				text : "",
				textVerticalAnchor : "middle",
				textAnchor : "start",
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				refX : "0%",
				refX2 : HmiCommon.DEFAULT_CHECKBOX_PADDING,
				refY : "50%",
				refY2 : 0
			},
			button : {
				strokeWidth : 1,
				stroke : "#000000",
				fill : "#000000",
				points : HmiCommon.DEFAULT_COMBOBOX_BUTTON_PATH,
				refX : "100%",
				refX2 : -(HmiCommon.DEFAULT_CHECKBOX_PADDING),
				refY : "50%",
				refY2 : -(HmiCommon.DEFAULT_COMBOBOX_BUTTON_HEIGHT / 2)
			}
		}
	}, {
		markup: [{
			tagName: 'rect',
			selector: 'body'
		}, {
			tagName: 'text',
			selector: 'label'
		}, {
			tagName: 'polygon',
			selector: 'button'
		}],
		initialize : function(options){
			var that = this;
			Rectangle.prototype.initialize.apply(that, arguments);
			this.initializeOptions(options, {
				size : { width : HmiCommon.DEFAULT_COMBOBOX_BOX_WIDTH, height : HmiCommon.DEFAULT_COMBOBOX_BOX_HEIGHT}
			});
			this.updateBindingValue();
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/value' || key == 'binding/optionValues' || key == 'binding/highlightColor'){
					this.updateBindingValue();
				}else if(key == 'binding/fontType'){
					that.setAllFontType(value);
				}else if(key == 'binding/fontSize'){
					that.setAllFontSize(value);
				}else if(key == 'binding/fontStyle'){
					that.setAllFontStyle(value);
				}else if(key == 'binding/fontWeight'){
					that.setAllFontWeight(value);
				}else if(key == 'binding/fontColor'){
					that.setAllFontColor(value);
				}else if(key == 'binding/strokeWidth'){
					that.setAllStrokeWidth(value);
				}else if(key == 'binding/strokeColor'){
					that.setAllStrokeColor(value);
				}else if(key == 'binding/strokeDasharray'){
					that.setAllStrokeDasharray(value);
				}else if(key == 'binding/fillColor'){
					that.setAllFillColor(value);
				}
			});

			that.on("event:pointerdown", that.control.bind(that));
		},
		control : function(cellView, evt){
			var that = this, binding = that.prop("binding");
			if(!that.isEditableCanvas() && binding.propertyType != "READ"){
				var jointSelector = $(evt.target).attr("joint-selector");
				if(jointSelector){
					var split = jointSelector.split("_");
					if(split.length > 1){	//Item 선택
						var index = Number(split[1]);
						var optionValues = that.prop("binding/optionValues");
						var option = optionValues[index];
						if(option){
							//값 변경을 통한 UI 업데이트
							that.setValue(option.value);
							that.patchAnalogTypeControlValue().always(function(){
								//Loading.close();
							});
						}
						that.close();
					}else if(that._isOpened){	//드롭다운리스트 선택하였으나 이미 열린 상태
						that.close();
					}else{						//드롭다운리스트 선택
						that.open();
					}
				}
			}
		},
		updateBindingValue : function(){
			var that = this;
			var optionValues = that.prop("binding/optionValues");
			that.updateOptionValues(optionValues);
		},
		updateOptionValues : function(optionValues){
			var that = this;
			that._updateMarkupFromOptionValues(optionValues);
			if(that._isOpened) that.open();
			//값들이 업데이트되면 최초 값은 바인딩 값 또는 첫번째 값으로 설정한다.
			var value = that.getValue();
			if(value !== null && typeof value !== "undefined") value = Math.floor(value);
			var i, option, max = optionValues.length;
			for( i = 0; i < max; i++ ){
				option = optionValues[i];
				if(option.value == value){
					that.setSelected(i);
					return;
				}
			}
			that.setSelected(null);
		},
		_updateMarkupFromOptionValues : function(optionValues){
			var that = this, baseMarkup = joint.util.cloneDeep(BaseHmiElement.markup);
			var attr = {}, markup = baseMarkup.concat([{ tagName : 'rect', selector : 'body'}, { tagName : 'text', selector : 'label'}, { tagName : 'polygon', selector : 'button'}]),
				option, i, max = optionValues.length;

			for( i = 0; i < max; i++ ){
				option = optionValues[i];
				markup = markup.concat(that._createComboboxMarkUp(i));
				attr = $.extend(attr, that._createComboboxAttr(i, option));
			}
			that.attr(attr);
			that.set("markup", markup);
		},
		_createComboboxMarkUp : function(index){
			var markup = [
				{ tagName : 'rect', selector : 'body_' + index },
				{ tagName : 'text', selector : 'label_' + index }
			];
			return markup;
		},
		_createComboboxAttr : function(index, option){
			var that = this;
			var boxStyle = "display:none;";
			var attr = {};
			var value = that.getValue();
			var optionValue = option.value;
			var optionText = option.text;
			var fontSize = that.prop("binding/fontSize");
			var fontStyle = that.prop("binding/fontStyle");
			var fontWeight = that.prop("binding/fontWeight");
			var fontType = that.prop("binding/fontType");
			var fontColor = that.prop("binding/fontColor");
			fontColor = fontColor ? fontColor : "#000000";
			var fillColor = that.prop("binding/fillColor");
			fillColor = fillColor ? fillColor : "#e6e6e6";
			var highlightColor = that.prop("binding/highlightColor");
			fillColor = (value == optionValue) ? highlightColor : fillColor;
			var strokeColor = that.prop("binding/strokeColor");
			strokeColor = strokeColor ? strokeColor : "#000000";
			var strokeWidth = that.prop("binding/strokeWidth");
			strokeWidth = strokeWidth ? strokeWidth : 1;
			var strokeDasharray = that.prop("binding/strokeDasharray");
			strokeDasharray = strokeDasharray ? strokeDasharray : "0";

			var refY2 = (index + 1) * 100;
			refY2 = refY2 + "%";

			attr["body_" + index] = { fill : fillColor, stroke : strokeColor, strokeWidth : strokeWidth, strokeDasharray : strokeDasharray,
				refWidth : "100%", refHeight : "100%", refY2 : refY2, style : boxStyle };
			attr["label_" + index] = { text : optionText, textAnchor : "start", textVerticalAnchor : "middle",
				refX : "0%", refX2 : HmiCommon.DEFAULT_CHECKBOX_PADDING, refY : "50%", refY2 : refY2,
				fontSize : fontSize, fontStyle : fontStyle, fontWeight : fontWeight, fontFamily : fontType, fill : fontColor, style : boxStyle
			};

			return attr;
		},
		setSelected : function(index){
			//value를 index로 선택
			var that = this;
			if(index === null){
				//값이 없을 경우 텍스트는 -로 표시
				//값이 없을 경우 아이콘 표시는 BaseHmiElement의 기본 바인딩 이벤트에서 처리됨.
				that.attr("label/text", "-");
			}else{
				var optionValues = that.prop("binding/optionValues"), option = optionValues[index];
				that.attr("label/text", option.text);
			}
		},
		_setAllAttr : function(selector, attr, isExcludeBaseBox, isExcludeSelectedBox){
			var that = this;
			var optionValues = that.prop("binding/optionValues");
			var option, i, max = optionValues.length;
			//화살표 버튼이 있는 기본 박스 속성 변경
			if(!isExcludeBaseBox) that.attr(selector, attr);
			var attrKey, value = that.getValue();
			//드롭다운리스트의 박스 속성 변경
			for( i = 0; i < max; i++ ){
				attrKey = selector + "_" + i;
				option = optionValues[i];
				//선택된 아이템 제외하고 색깔 변경 (Highlight Color 때문)
				if(isExcludeSelectedBox && option.value == value) continue;
				that.attr(attrKey, attr);
			}
		},
		setAllFontSize : function(size){
			this._setAllAttr("label", { fontSize : size });
		},
		setAllFontType : function(type){
			this._setAllAttr("label", { fontFamily : type });
		},
		setAllFontColor : function(color){
			this._setAllAttr("label", { fill : color });
		},
		setAllFontStyle : function(style){
			this._setAllAttr("label", { fontStyle : style });
		},
		setAllFontWeight : function(weight){
			this._setAllAttr("label", { fontWeight : weight });
		},
		setAllFillColor : function(color){
			this._setAllAttr("body", { fill : color }, false, true);
		},
		setAllStrokeWidth : function(strokeWidth){
			this._setAllAttr("body", { strokeWidth : strokeWidth });
		},
		setAllStrokeColor : function(color){
			this._setAllAttr("body", { stroke : color });
		},
		setAllStrokeDasharray : function(strokeDasharray){
			this._setAllAttr("body", { strokeDasharray : strokeDasharray });
		},
		open : function(){
			var that = this;
			that._setAllAttr("body", { style : "display:block;" }, true);
			that._setAllAttr("label", { style : "display:block;" }, true);
			//화살표 버튼을 180도 회전한다.
			var view = that.getCurrentView();
			if(view){
				var buttonEl = view.$el.find("[joint-selector=button]")[0];
				var buttonVector = V(buttonEl);
				var bbox = buttonVector.getBBox();
				var cx = bbox.x + bbox.width / 2;
				var cy = bbox.y + bbox.height / 2;
				buttonVector.rotate(180, cx, cy);
				that._isOpened = true;
			}else{
				console.error("there is no view");
			}
		},
		close : function(){
			var that = this;
			that._setAllAttr("body", { style : "display:none;" }, true);
			that._setAllAttr("label", { style : "display:none;" }, true);
			var view = that.getCurrentView();
			if(view){
				var buttonEl = view.$el.find("[joint-selector=button]")[0];
				var buttonVector = V(buttonEl);
				var bbox = buttonVector.getBBox();
				var cx = bbox.x + bbox.width / 2;
				var cy = bbox.y + bbox.height / 2;
				buttonVector.rotate(0, cx, cy);
				that._isOpened = false;
			}else{
				console.error("there is no view");
			}
		},
		setBindingData : function(data){
			var that = this;
			BaseHmiElement.prototype.setBindingData.call(that, data);
			var value = data.value, optionValues = data.optionValues,
				highlightColor = data.highlightColor, propertyType = data.propertyType;

			that.prop("binding/optionValues", optionValues, { rewrite : true });
			that.prop("binding/value", value);
			that.prop("binding/highlightColor", highlightColor);
			that.prop("binding/propertyType", propertyType);
		},
		getGraphicBindingPopupData : function(){
			var that = this;
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(that);
			data.optionValues = that.prop("binding/optionValues");
			data.value = that.prop("binding/value");
			data.highlightColor = that.prop("binding/highlightColor");
			data.propertyType = that.prop("binding/propertyType");
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "Combobox",
			propertyType : "WRITE",
			strokeColor : "#000000",
			fillColor : "#e6e6e6",
			highlightColor : "#0081c6",
			minWidth : HmiCommon.DEFAULT_DROPDOWN_MIN_WIDTH,
			minHeight : HmiCommon.DEFAULT_DROPDOWN_MIN_HEIGHT,
			optionValues : [{ value : 0, text : "" }]
		}
	});

	var Chart = extendWithBaseElement(joint.shapes.chart.Plot, 'hmi.Chart', {
		series : [
			{name : 'value', showLegend : false, data : []}
		],
		axis : {
			'x-axis' : joint.util.cloneDeep(HmiCommon.DEFAULT_CHART_X_AXIS_60_MIN),
			'y-axis' : joint.util.cloneDeep(HmiCommon.DEFAULT_CHART_Y_AXIS)
		},
		attrs : {
			'.value path' : {
				stroke : '#0000FF',
				"stroke-width" : 2
			},
			'.point circle': { stroke : '#0000FF', fill : '#0000FF', 'opacity' : 1 },
			'.background rect' : {
				'fill': "transparent"
			},
			'.y-axis .tick text' : { 'font-size' : 10, fontType : HmiCommon.DEFAULT_FONT_TYPE },
			'.x-axis .tick text' : { 'font-size' : 10, fontType : HmiCommon.DEFAULT_FONT_TYPE },
			'.foreground .caption' : { 'ref-y' : "100%", 'y-alignment' : 'top', refY2 : 30, fontType : HmiCommon.DEFAULT_FONT_TYPE }
		}
	}, {
		initialize : function(options){
			var that = this;
			BaseHmiElement.prototype.initialize.apply(that, arguments);
			this.initializeOptions(options, {
				size : { width : HmiCommon.DEFAULT_CHART_WIDTH, height : HmiCommon.DEFAULT_CHART_HEIGHT }
			});
			//this.updateBindingValue();
		},
		attachEvent : function(){
			//this.on('change:binding', function(element, ))

			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/highlightColor'){
					that._setHighlightColor(value);
				}else if(key == 'binding/timeRange' || key == 'binding/count' || key == 'binding/minValue' || key == 'binding/maxValue'){
					that.updateTimeRange();
				}else if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/fillColor'){
					that._setFillColor(value);
				}else if(key == 'binding/fontColor'){
					that._setFontColor(value);
				}else if(key == 'binding/fontSize'){
					that._setFontSize(value);
				}else if(key == 'binding/fontType'){
					that._setFontType(value);
				}else if(key == 'binding/fontStyle'){
					that._setFontStyle(value);
				}else if(key == 'binding/fontWeight'){
					that._setFontWeight(value);
				}else if(key == 'binding/strokeColor'){
					that._setStrokeColor(value);
				}else if(key == 'binding/strokeWidth'){
					that._setStrokeWidth(value);
				}else if(key == 'binding/strokeDasharray'){
					that._setStrokeDasharray(value);
				}/*else if(key == 'binding/value'){
					this.updateBindingValue();
				}*/
				//차트는 모니터링화면 일 때, 타이머를 통해 차트 UI를 업데이트하므로 이벤트로 처리하지 않는다..
			});

			var addEvent = that._addEvt.bind(that);
			that.on('add', addEvent);

			//graph의 fromJSON으로 Add되었을 경우.
			that.on('graph:add', addEvent);

			that.on('remove', function(){
				that.stopIntervalUpdate();
			});
		},
		_setHighlightColor : function(highlightColor){
			var that = this;
			that.attr(".value path", { stroke : highlightColor });
			that.attr(".point circle", { stroke : highlightColor, fill : highlightColor });
		},
		_setFillColor : function(fillColor){
			var that = this;
			that.attr(".background rect", {fill : fillColor });
		},
		_setFontColor : function(fontColor){
			var that = this;
			that.attr(".foreground .caption", {fill : fontColor });
			that.attr(".y-axis .ticks .tick text", {fill : fontColor });
			that.attr(".x-axis .ticks .tick text", {fill : fontColor });
		},
		_setFontSize : function(fontSize){
			var that = this;
			that.attr(".foreground .caption", {fontSize : fontSize });
			that.attr(".y-axis .ticks .tick text", {fontSize : fontSize });
			that.attr(".x-axis .ticks .tick text", {fontSize : fontSize });
		},
		_setFontType : function(fontType){
			var that = this;
			that.attr(".foreground .caption", {fontFamily : fontType });
			that.attr(".y-axis .ticks .tick text", {fontFamily : fontType });
			that.attr(".x-axis .ticks .tick text", {fontFamily : fontType });
		},
		_setFontStyle : function(fontStyle){
			var that = this;
			that.attr(".foreground .caption", {fontStyle : fontStyle});
			that.attr(".y-axis .ticks .tick text", {fontStyle : fontStyle });
			that.attr(".x-axis .ticks .tick text", {fontStyle : fontStyle });
		},
		_setFontWeight : function(fontWeight){
			var that = this;
			that.attr(".foreground .caption", {fontWeight : fontWeight });
			that.attr(".y-axis .ticks .tick text", {fontWeight : fontWeight });
			that.attr(".x-axis .ticks .tick text", {fontWeight : fontWeight });
		},
		_setStrokeColor : function(strokeColor){
			var that = this;
			that.attr(".y-axis path", {stroke : strokeColor });
			that.attr(".y-axis .ticks .tick line", {stroke : strokeColor});
			that.attr(".x-axis path", {stroke : strokeColor });
			that.attr(".x-axis .ticks .tick line", {stroke : strokeColor});
		},
		_setStrokeWidth : function(strokeWidth){
			var that = this;
			//Y축
			that.attr(".y-axis path", {strokeWidth : strokeWidth });
			//Y축 눈금
			that.attr(".y-axis .ticks .tick line", {strokeWidth : strokeWidth});
			//X축
			that.attr(".x-axis path", {strokeWidth : strokeWidth });
			//X축 눈금
			that.attr(".x-axis .ticks .tick line", {strokeWidth : strokeWidth});
			//그래프 선
			that.attr(".value path", {strokeWidth : strokeWidth });
			//그래프 선 포인트
			that.attr(".point circle", {strokeWidth : strokeWidth });
		},
		_setStrokeDasharray : function(strokeDasharray){
			var that = this;
			that.attr(".y-axis path", {strokeDasharray : strokeDasharray });
			that.attr(".y-axis .ticks .tick line", {strokeDasharray : strokeDasharray});
			that.attr(".x-axis path", {strokeDasharray : strokeDasharray });
			that.attr(".x-axis .ticks .tick line", {strokeDasharray : strokeDasharray});
			that.attr(".value path", {strokeDasharray : strokeDasharray });
		},
		_addEvt : function(){
			var that = this;
			//편집화면에서 최초 생성 시, 차트의 X축을 0부터 표시하기 위함.
			var initialTime, series = that.get("series");
			if(that.isEditableCanvas() && (!series[0].data.length)){
				initialTime = moment();
				initialTime.hours(0);
				initialTime.minutes(0);
				initialTime.seconds(0);
				initialTime.milliseconds(0);
				that.addPoint({x : (initialTime.toDate()).getTime(), y : 0}, 'value');
				//현재 시간 값 기준으로 X축 업데이트
				that.updateXAxisMinMax();
			}

			if(!that.isEditableCanvas() && !that._isStartedInterval){
				that.set('series', [{name : 'value', showLegend : false, data : []}]);
				//initialTime = moment();
				//that.addPoint({x : initialTime.toDate().getTime(), y : 0}, 'value');
				//현재 시간 값 기준으로 X축 업데이트
				//that.updateXAxisMinMax();
				that.startIntervalUpdate();
			}
		},
		/*getInitialTimeFromTimeRange : function(){
			var that = this, timeRange = that.prop("binding/timeRange");
			var timeRangeInfo = that.getTimeRangeInfo(timeRange);
			var timeRangeMinutes = timeRangeInfo.min;
			var initialTime = moment();
			var minutes = initialTime.minutes();
			var reminder = minutes % timeRangeMinutes;
			//if(reminder == minutes) initialTime.minutes(0);
			//else
		},*/
		updateTimeRange : function(){
			var that = this;
			//1분 : 초단위 업데이트, 1시간 : 분단위 업데이트
			var xAxis = {}, yAxis = {};
			var tickStep = that.prop("binding/timeRange");
			if(typeof tickStep === "string") tickStep = Number(tickStep);
			var ticks = that.prop("binding/count");
			//1분, 5분, 10분, 15분, 30분으로 분 단위로 표사
			//눈금은 count 개수대로
			xAxis.tickStep = tickStep;
			xAxis.ticks = ticks;
			xAxis.tickFormat = HmiCommon.DEFAULT_CHART_X_AXIS_60_MIN.tickFormat;

			//Y축은 최대/최소 값과 별도로 들어오는 값에 따라 Scailing
			/*var minValue = that.prop("binding/minValue");
			var maxValue = that.prop("binding/maxValue");

			yAxis = $.extend(true, {}, HmiCommon.DEFAULT_CHART_Y_AXIS, {
				min : minValue,
				max : maxValue
			});*/

			that.setAxis(xAxis, yAxis);
			that.updateXAxisMinMax();
		},
		setAxis : function(xAttr, yAttr, isOverWriting){
			var that = this;
			var axis = that.get("axis");
			axis = joint.util.cloneDeep(axis);
			if(xAttr){
				var xAxis = axis['x-axis'];
				if(isOverWriting) axis['x-axis'] = xAttr;
				else axis['x-axis'] = $.extend(xAxis, xAttr);
			}

			if(yAttr){
				var yAxis = axis['y-axis'];
				if(isOverWriting) axis['y-axis'] = yAttr;
				else axis['y-axis'] = $.extend(yAxis, yAttr);
			}

			that.set('axis', axis);
		},
		updateBindingValue : function(){
			var that = this;
			var value = that.getValue();
			var minValue = that.prop("binding/minValue"), maxValue = that.prop("binding/maxValue");
			if(value > maxValue) value = maxValue;
			else if(value < minValue) value = minValue;

			var timeRange = that.prop("binding/timeRange");

			var axis = this.get("axis");
			var xAxis = axis['x-axis'];
			var yAxis = axis['y-axis'];
			var ticks = xAxis.ticks;
			var xMax = xAxis.max;
			var xMin = xAxis.min;
			var newY = value;
			var lastPoint = that.lastPoint('value');
			if(lastPoint){
				//X축의 시간을 더 한다.
				//X축은 Date.getTime() 값이다.
				var lastX = lastPoint.x;
				var momentX = moment(lastX);

				var timeRangeInfo = that.getTimeRangeInfo(timeRange);
				momentX.add(1 * timeRangeInfo.min, 'minutes');

				/*if(timeRange == 1000){
					momentX.add(1, 'seconds');
				}else if(timeRange == 60000){
					momentX.add(1, 'minutes');
				}else if(timeRange == 3600000){
					momentX.add(1, 'hours');
				}*/
				var dateX = momentX.toDate();
				var newX = dateX.getTime();

				//that.updateXAxisMinMax(newX);
				var series = that.get("series");
				var values = series[0];
				var data = values.data;

				//그래프의 X축이 전부 다 그려졌을 경우, min/max 값을 해제한다. Real Time 차트로 표시해야되기 때문
				if(data.length >= ticks && xMax && xMin){
					xAxis = joint.util.cloneDeep(xAxis);
					delete xAxis.max;
					delete xAxis.min;
					that.setAxis(xAxis, null, true);
				}

				that.updateYAxisMinMax(newY);
				that.addPoint({x : newX, y : newY }, "value", { maxLen : ticks });
			}else{
				//차트 값이 최초 표시(addPoint())되는 경우
				newY = yAxis.min;
				that.updateYAxisMinMax(newY);
				var initialTime = moment();
				that.addPoint({x : initialTime.toDate().getTime(), y : newY}, 'value');
				//최초 현재 시간 값 기준으로 X축 업데이트
				that.updateXAxisMinMax();
			}
		},
		getXAxisMinMax : function(startX, endX){
			var that = this, timeRange = that.prop("binding/timeRange");
			var axis = that.get("axis");
			var xAxis = axis['x-axis'];
			var ticks = xAxis.ticks;
			if(!startX){
				var lastPoint = that.lastPoint('value');
				startX = lastPoint.x;
			}
			var min = startX;
			var momentX = moment(startX);
			var max;
			if(endX){
				max = endX;
			}else{
				//끝점이 정해져있지 않을 경우 시작 X 값에서 timeRange에 따라 전체 범위 만큼 max 값 지정
				//해당 값은 초기화 시에 지정한다.
				//분 단위로만 표시되므로 최대 값은 분으로만 계산한다.
				//ticks에 분 개수만큼 곱한다.
				var timeRangeInfo = that.getTimeRangeInfo(timeRange);
				momentX.add(ticks * timeRangeInfo.min, 'minutes');
				/*if(timeRange == 1000){
					momentX.add(ticks, 'seconds');
				}else if(timeRange == 60000){
					momentX.add(ticks, 'minutes');
				}else if(timeRange == 3600000){
					momentX.add(ticks, 'hours');
				}*/
				//최대 값이 계산된 날짜
				var dateX = momentX.toDate();
				max = dateX.getTime();
			}

			return {
				max : max, min : min
			};
		},
		getTimeRangeInfo : function(timeRange){
			var key;
			for(key in HmiCommon.CHART_MINUTES){
				if(HmiCommon.CHART_MINUTES[key].value == timeRange){
					return HmiCommon.CHART_MINUTES[key];
				}
			}
			return HmiCommon.CHART_MINUTES.ONE;
		},
		updateXAxisMinMax : function(newX){
			var that = this;
			var minMax = that.getXAxisMinMax(newX);
			that.setAxis(minMax);
		},
		updateYAxisMinMax : function(newY){
			var that = this;
			var axis = this.get("axis");
			var yAxis = axis['y-axis'];
			var maxY = yAxis.max, minY = yAxis.min, ticks = yAxis.ticks;
			//TickStep을 계산한다.
			var tickStep = that.getYAxisTickStep(minY, maxY, ticks);
			//새로운 값이 현재 Y축의 Max 값 보다 큰 경우, Max값을 조절한다.
			//새로운 값이 현재 Y축의 Min 값 보다 작은 경우. Min 값을 조절한다.
			if(newY > maxY){
				maxY = newY;
				that.setAxis(null, { max : newY, tickStep : tickStep });
			}else if(newY < minY){
				minY = newY;
				that.setAxis(null, { min : minY, tickStep : tickStep });
			}
		},
		getYAxisTickStep : function(minY, maxY, ticks){
			var tickStep = (maxY - minY) / ticks;
			tickStep = Number(joint.util.format.number("f", tickStep));
			return tickStep;
		},
		updateTimeCaption : function(){
			var that = this;
			var timeCaption = that.getTimeCaption();
			timeCaption = I18N.prop("COMMON_TIME") + " : " + timeCaption;
			that.updateCaption(timeCaption);
		},
		updateCaption : function(text){
			var that = this;
			that.attr(".caption/text", text);
		},
		getTimeCaption : function(){
			var timeCaption = moment().format('YYYY-MM-DD | HH:mm:ss');
			return timeCaption;
		},
		startIntervalUpdate : function(){
			var that = this;
			that._isStartedInterval = true;
			//that.updateAxisFromCurrentTime();
			var timeRange = that.prop("binding/timeRange");
			that._intervalUpdate();
			that._intervalTimer = setInterval(that._intervalUpdate.bind(that), timeRange);
		},
		_intervalUpdate : function(){
			var that = this;
			that.updateBindingValue();
			that.updateTimeCaption();
		},
		stopIntervalUpdate : function(){
			var that = this;
			clearTimeout(that._intervalTimer);
			that._isStartedInterval = false;
		},
		setBindingData : function(data){
			BaseHmiElement.prototype.setBindingData.call(this, data);
			var highlightColor = data.highlightColor, timeRange = data.timeRange, count = data.count,
				textLocation = data.textLocation, prefix = data.prefix, suffix = data.suffix, minValue = data.minValue,
				maxValue = data.maxValue;
			this.prop("binding/count", count);
			this.prop("binding/highlightColor", highlightColor);
			this.prop("binding/timeRange", timeRange);
			this.prop("binding/maxValue", maxValue);
			this.prop("binding/minValue", minValue);
		},
		getGraphicBindingPopupData : function(){
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(this);
			var bindingData = this.prop("binding");
			data.count = bindingData.count;
			data.highlightColor = bindingData.highlightColor;
			data.timeRange = bindingData.timeRange;
			data.minValue = bindingData.minValue;
			data.maxValue = bindingData.maxValue;
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "Chart",
			timeRange : 60000,
			highlightColor : "#0000FF",
			fillColor : "transparent",
			strokeColor : "#000000",
			fontColor : "#000000",
			fontSize : 10,
			fontType : HmiCommon.DEFAULT_FONT_TYPE,
			minValue : 0,
			maxValue : 100,
			count : 1
		}
	});

	/*
	/ graph에 'add' 시, 해당 Element의 type 값을 읽어 View가 생성된다. (type + View 이름으로 인스턴스 생성, e.g : hmi.Chart의 View는 hmi.ChartView)
	/ 해당 type의 View Class가 존재하지 않을 경우 ElementView가 Default View Class 이며, Chart의 경우 joint.shapes.chart.PlotView가 존재.
	/ 그러므로 해당 View를 상속받아 hmi.Chart에서도 View가 생성될 수 있게 상속받는다.
	*/

	var ChartView = extendElementView(joint.shapes, 'hmi.ChartView', joint.shapes.chart.PlotView, {
	}, {});

	var CustomComponent = Animation.define('hmi.CustomComponent', {

	}, {
		initialize : function(){
			var that = this;
			Image.prototype.initialize.apply(that, arguments);
			that.attr('body/href', null);
			var libraryInfo = that.prop("binding/custom");
			var id = libraryInfo.id;
			//라이브러리가 편집되었을 경우로 인하여 API 호출하여 현재 컴포넌트의 아이디로 최신 이미지 정보를 가져온다.
			var HmiApi = window.HmiApi;
			that._imageDfd = HmiApi.getComponentImages(id).done(function(backendImages){
				var image, images = libraryInfo.images;
				var i, max = backendImages.length;
				var imageApiUrl = "/dms/hmi/components/" + id + "/images/{name}";
				//백엔드 정보로 이미지 이름을 업데이트
				for( i = 0; i < max; i++ ){
					image = backendImages[i];
					images[i].name = image.name;
					images[i].image = imageApiUrl.replace("{name}", image.name);
				}
			}).always(function(){
				that.updateBindingValue();
			});
		},
		attachEvent : function(){
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/reverse' || key == 'binding/value' || key == 'binding/custom/controlType'
					|| key == 'binding/custom/type'){
					//바인딩에서의 이미지 교체 여부?
					//Value 변경에 따라 State 체크 및 이미지 변경
					this.updateBindingValue();
				}else if(key == 'binding/vFliped' || key == 'binding/hFliped'){
					that.setImageTransform();
					that.flipAngle(key);
				}else if(key == 'binding/fontType'){
					that.attr("label/fontFamily", value);
				}else if(key == 'binding/fontSize'){
					that.attr("label/fontSize", value);
				}else if(key == 'binding/fontStyle'){
					that.attr("label/fontStyle", value);
				}else if(key == 'binding/fontWeight'){
					that.attr("label/fontWeight", value);
				}
			});

			that.on("event:pointerdown", that.controlPointerDown.bind(that));
			that.on("event:pointerup", that.controlPointerUp.bind(that));
		},
		getCurrentState : function(value){
			var that = this;
			var bindingData = that.prop("binding");
			var device = bindingData.device, deviceType = device.type;

			//Default 기기 타입
			if(!deviceType){
				var libraryInfo = bindingData.custom;
				if(libraryInfo.type == "Multi"){
					deviceType = "ControlPoint.AI";
				}else{
					deviceType = "ControlPoint.DI";
				}
			}

			var stateItem = that.getCurrentStateItem(deviceType, value);
			var state = stateItem.value;
			if(that.isReverse()) state = HmiUtil.getReverseState(state);
			return state;
		},
		isReverse : function(){
			var componentType = this.prop("binding/custom/type");
			//멀티 타입의 반전은 해당되지 않음
			if(componentType == "Multi") return false;

			var reverse = this.prop("binding/reverse");
			if(reverse == "true" || reverse === true) return true;
			return false;
		},
		getCurrentStateItem : function(deviceType, value){
			var that = this, libraryInfo = this.prop("binding/custom");
			var type = libraryInfo.type, images = libraryInfo.images;

			if(typeof value !== "undefined" && value !== null) value = Number(value);
			else value = 0;
			//멀티 타입
			if(type == "Multi"){
				var image, i, max = images.length;
				for( i = 0; i < max; i++ ){
					image = images[i];
					if(value >= image.min && value <= image.max){
						//유효한 값
						that.prop("binding/custom/invalid", false);
						return {
							value : i,
							text : I18N.prop("HMI_STATE_LEVEL", i)
						};
					}
				}
				//유효하지 않은 값임.
				that.prop("binding/custom/invalid", true);
				return {
					value : 0,
					text : I18N.prop("HMI_STATE_LEVEL", 0)
				};
			}else if(value == 1){		//제어 및 토글 타입
				return {
					value : "on",
					text : I18N.prop("HMI_STATE_ON")
				};
			}

			return {
				value : "off",
				text : I18N.prop("HMI_STATE_OFF")
			};
		},
		controlPointerDown : function(){
			var that = this;
			if(!that.isEditableCanvas()){
				var type = that.prop("binding/custom/type");
				if(type == "Controlled"){
					var ignoreValueUpdate = false;
					var controlType = that.prop("binding/custom/controlType");
					if(controlType == "Push" || controlType == "Momentary"){
						//현재 상태 저장
						var value = that.getValue();
						var state = that.getCurrentState(value);
						that._pushState = state;
						//제어 명령으로 나갈 값으로 상태 변환
						value = that.getDigitalTypeControlValue();
						state = that.getCurrentState(value);
						that._updateImageFromState(state);
						//제어 시, 실제 값을 바꾸지 않는다.
						ignoreValueUpdate = true;
					}
					that.patchDigitalTypeControlValue(ignoreValueUpdate).always(function(){

					});
				}
			}
		},
		controlPointerUp : function(){
			var that = this;
			if(!that.isEditableCanvas()){
				var type = that.prop("binding/custom/type");
				if(type == "Controlled"){
					var controlType = that.prop("binding/custom/controlType");
					if(controlType == "Push" || controlType == "Momentary"){
						//제어 후 버튼 이미지를 원래대로 돌린다.
						if(that._pushState) that._updateImageFromState(that._pushState);
					}

					if(controlType == "Momentary"){
						//값을 복귀 시키도록 제어한다.
						that.patchDigitalTypeControlValue(false, true).always(function(){

						});
					}
				}
			}
		},
		updateBindingValue : function(){
			var that = this;
			var value = that.getValue();
			var state = that.getCurrentState(value);
			that._updateImageFromState(state);
		},
		_updateImageFromState : function(state){
			var that = this;
			var libraryInfo = that.prop("binding/custom");
			var type = libraryInfo.type;

			that._imageDfd.always(function(){
				var imageUrl, image, images = libraryInfo.images;
				if(type == "Multi"){
					image = images[state];
				}else if(state == "on"){
					image = images[1];
				}else{
					image = images[0];
				}
				//백엔드로부터 가져와서 변경
				imageUrl = image.image;
				var WindowImage = window.Image;
				var validateImage = new WindowImage();
				validateImage.onload = function(){
					that.attr('body/href', Util.addBuildDateQuery(imageUrl));
				};
				//이미지가 존재하지 않을 경우
				validateImage.onerror = function(e){
					that.attr('body/href', Util.addBuildDateQuery(HmiCommon.DEFAULT_LIBRARY_NO_IMAGE_URL));
				};
				validateImage.src = imageUrl;
			});
		},
		setBindingData : function(data){
			BaseHmiElement.prototype.setBindingData.call(this, data);
			var reverse = data.reverse, controlType = data.buttonType;
			this.prop("binding/reverse", reverse);
			if(controlType) this.prop("binding/custom/controlType", controlType);
		},
		getGraphicBindingPopupData : function(){
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(this);
			var bindingData = this.prop("binding");
			var custom  = bindingData.custom;
			if(custom.controlType) data.buttonType = custom.controlType;
			data.custom = bindingData.custom;
			data.reverse = bindingData.reverse;
			return data;
		}
	}, {
		defaultBindingProp : {
			type : "Custom",
			custom : {
				id : 1,
				name : "",
				type : "Controlled",
				controlType : "Push",
				images : [
					{ id : 1, name : null, status : "OFF" },
					{ id : 2, name : null, status : "ON"}
				],
				invalid : false
			},
			/*
				상속된 정보 삭제
			*/
			graphicColor : null,
			state : null,
			gauge : null,
			minValue : null,
			maxValue : null
		}
	});

	var StatisticsBuildingOperation = Rectangle.define('hmi.StatisticsBuildingOperation', {
		attrs : {
			body : {
				stroke : HmiCommon.DEFAULT_STROKE_COLOR,
				fill : '#ffffff'
			},
			title : {
				refX : 0.05,
				refY : 0.10,
				text : I18N.prop('HMI_STATISTICS_INDOOR_BUILDING')
			},
			scheduleWrapper : {
				refWidth : 1,
				refHeight : 0.18,
				refY : 0.28
			},
			titleSchedule : {
				refX : 0.05,
				text : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_SCHEDULES')
			},
			countSchedule : {
				refX : 0.4
			},
			barWrapper : {
				refX : 0.05,
				refY : 0.48,
				refWidth : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH_RATIO,
				refHeight : 0.07
			},
			bar : {
				refY : 0,
				refHeight : 0.07
			},
			barOn : {
				refX : 0,
				refWidth : 0,
				fill : HmiCommon.DEFAULT_STATISTICS_COLOR_ON
			},
			barOff : {
				refX : 0,
				refWidth : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH_RATIO,
				fill : HmiCommon.DEFAULT_STATISTICS_COLOR_OFF
			},
			barCritical : {
				refX : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH_RATIO,
				refWidth : 0,
				fill : HmiCommon.DEFAULT_STATISTICS_COLOR_CRITICAL
			},
			barWarning : {
				refX : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH_RATIO,
				refWidth : 0,
				fill : HmiCommon.DEFAULT_STATISTICS_COLOR_WARNING
			},
			stateWrapper : {
				refX : 0.05,
				refY : 0.69,
				refWidth : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH_RATIO,
				refHeight : 0.26
			},
			state : {
				refWidth : 0.225,
				refHeight : 0.26
			},
			stateArea : {
				refWidth : 0.225,
				refHeight : 0.26,
				fill : 'transparent'
			},
			stateOn : {
				refWidth : 0.225,
				refX : 0.1
			},
			stateOff : {
				refWidth : 0.225,
				refX : 0.325
			},
			stateCritical : {
				refWidth : 0.225,
				refX : 0.55
			},
			stateWarning : {
				refWidth : 0.21,
				refX : 0.775
			},
			stateTitle : {
				textAnchor : 'middle'
			},
			stateCount : {
				refY : 0.12,
				textAnchor : 'middle'
			},
			titleOn : {
				text : I18N.prop('FACILITY_DEVICE_STATUS_ON')
			},
			titleOff : {
				text : I18N.prop('FACILITY_DEVICE_STATUS_OFF')
			},
			titleCritical : {
				text : I18N.prop('FACILITY_DEVICE_STATUS_CRITICAL')
			},
			titleWarning : {
				text : I18N.prop('FACILITY_DEVICE_STATUS_WARNING')
			}
		}
	}, {
		markup : [{
			tagName : 'rect',
			selector : 'body'
		}, {
			tagName : 'text',
			selector : 'title'
		}, {
			tagName : 'g',
			selector : 'scheduleWrapper',
			children : [{
				tagName : 'text',
				selector : 'titleSchedule'
			}, {
				tagName : 'text',
				selector : 'countSchedule'
			}]
		}, {
			tagName : 'g',
			selector : 'barWrapper',
			children : [{
				tagName : 'rect',
				selector : 'barOn',
				groupSelector : 'bar'
			}, {
				tagName : 'rect',
				selector : 'barOff',
				groupSelector : 'bar'
			}, {
				tagName : 'rect',
				selector : 'barCritical',
				groupSelector : 'bar'
			}, {
				tagName : 'rect',
				selector : 'barWarning',
				groupSelector : 'bar'
			}]
		}, {
			tagName : 'g',
			selector : 'stateWrapper',
			children : [{
				tagName : 'g',
				selector : 'stateOn',
				groupSelector : 'state',
				children : [{
					tagName : 'rect',
					groupSelector : 'stateArea'
				}, {
					tagName : 'text',
					selector : 'titleOn',
					groupSelector : 'stateTitle'
				}, {
					tagName : 'text',
					selector : 'countOn',
					groupSelector : 'stateCount'
				}]
			}, {
				tagName : 'g',
				selector : 'stateOff',
				groupSelector : 'state',
				children : [{
					tagName : 'rect',
					groupSelector : 'stateArea'
				}, {
					tagName : 'text',
					selector : 'titleOff',
					groupSelector : 'stateTitle'
				}, {
					tagName : 'text',
					selector : 'countOff',
					groupSelector : 'stateCount'
				}]
			}, {
				tagName : 'g',
				selector : 'stateCritical',
				groupSelector : 'state',
				children : [{
					tagName : 'rect',
					groupSelector : 'stateArea'
				}, {
					tagName : 'text',
					selector : 'titleCritical',
					groupSelector : 'stateTitle'
				}, {
					tagName : 'text',
					selector : 'countCritical',
					groupSelector : 'stateCount'
				}]
			}, {
				tagName : 'g',
				selector : 'stateWarning',
				groupSelector : 'state',
				children : [{
					tagName : 'rect',
					groupSelector : 'stateArea'
				}, {
					tagName : 'text',
					selector : 'titleWarning',
					groupSelector : 'stateTitle'
				}, {
					tagName : 'text',
					selector : 'countWarning',
					groupSelector : 'stateCount'
				}]
			}]
		}],
		textAttrsSelector : ['title', 'titleSchedule', 'countSchedule', 'stateTitle', 'stateCount'],
		initialize : function(options) {
			var that = this;
			Rectangle.prototype.initialize.apply(that, arguments);
			that.initializeOptions(options, {
				size : {
					width : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH, height : HmiCommon.DEFAULT_STATISTICS_CARD_HEIGHT
				},
				binding : {
					building : {
						id : 0,
						name : null
					}
				}
			});
			var binding = that.prop('binding');
			if (binding.building.id != 0) that.startIntervalUpdate();
		},
		attachEvent : function() {
			var that = this;
			Rectangle.prototype.attachEvent.apply(that, arguments);
			that.on('remove', that.onRemove.bind(that));

			that.on('change:binding', function(element, binding, opt) {
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				var textSelector = that.textAttrsSelector;
				if (key == 'binding/building' && value) {
					that.startIntervalUpdate();
				}else if(key == 'binding/fontSize'){
					textSelector.forEach(function(selector) {
						that.attr(selector + '/fontSize', value);
					});
				}else if(key == 'binding/fontColor'){
					textSelector.forEach(function(selector) {
						that.attr(selector + '/fill', value);
					});
				}else if(key == 'binding/fontStyle'){
					textSelector.forEach(function(selector) {
						that.attr(selector + "/fontStyle", value);
					});
				}else if(key == 'binding/fontWeight'){
					textSelector.forEach(function(selector) {
						that.attr(selector + "/fontWeight", value);
					});
				}
			});
		},
		getGraphicBindingPopupData : function() {
			var data = BasicShape.prototype.getGraphicBindingPopupData.call(this);
			var bindingData = this.prop("binding");
			data.building = bindingData.building;
			return data;
		},
		setBindingData : function(data) {
			BasicShape.prototype.setBindingData.call(this, data);
			var building = data.building;
			this.prop("binding/building", building);
		},
		stopIntervalUpdate : function() {
			var that = this;
			clearTimeout(that._intervalTimer);
			that._isStartedInterval = false;
		},
		startIntervalUpdate : function() {
			var that = this;
			var binding = that.prop('binding');
			var building = binding.building;
			if (building.id == 0) return;
			that.stopIntervalUpdate();
			that._isStartedInterval = true;
			that.getStatisticsData(building.id);
			that._intervalTimer = setInterval(that.getStatisticsData.bind(that, building.id), HmiCommon.DEFAULT_STATISTICS_TIMEOUT);
		},
		getStatisticsData : function(bid) {
			var that = this;
			$.ajax({
				url : '/dms/devices/statisticView/AirConditioner?foundation_space_buildings_id=' + bid + '&exposeFloors=false'
			})
				.done(that.onDataRefresh.bind(that))
				.fail(function() {
				})
				.always(function() {
				});
		},
		onDataRefresh : function(data) {
			data = data[0] || {};
			var ratio = HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH_RATIO;
			var devOn = data.numberOfOnIndoorDevices || 0, devOff = data.numberOfOffIndoorDevices || 0,
				devCritical = data.numberOfCriticalDevices || 0, devWarning = data.numberOfWarningDevices || 0,
				numSchedule = data.numberOfSchedules || 0, buildingName = data.foundation_space_buildings_name || this.prop('binding/building/name');
			var total = devOn + devOff + devCritical + devWarning;

			this.stopCanvasListening();
			this.attr({
				title : {
					text : buildingName
				},
				countSchedule : {
					text : numSchedule
				},
				countOn : {
					text : devOn
				},
				countOff : {
					text : devOff
				},
				countCritical : {
					text : devCritical
				},
				countWarning : {
					text : devWarning
				},
				barOn : {
					refWidth : total > 0 ? (devOn / total) * ratio : 0
				},
				barOff : {
					refX : (devOn / total) * ratio,
					refWidth : total > 0 ? (devOff / total) * ratio : ratio
				},
				barCritical : {
					refX : ((devOn + devOff) / total) * ratio,
					refWidth : total > 0 ? (devCritical / total) * ratio : 0
				},
				barWarning : {
					refX : ((devOn + devOff + devCritical) / total) * ratio,
					refWidth : total > 0 ? (devWarning / total) * ratio : 0
				}
			});
			this.startCanvasListening();
		},
		onRemove : function() {
			this.stopIntervalUpdate();
		}
	}, {
		defaultBindingProp : {
			type : "Statistics",
			initWidth : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH,
			initHeight : HmiCommon.DEFAULT_STATISTICS_CARD_HEIGHT,
			strokeWidth : 0,
			strokeColor : HmiCommon.DEFAULT_STROKE_COLOR,
			strokeDasharray : '0',
			fillColor : '#ffffff',
			opacity : 1,
			fontType : HmiCommon.DEFAULT_FONT_TYPE,
			fontSize : HmiCommon.DEFAULT_FONT_SIZE,
			fontColor : HmiCommon.DEFAULT_FONT_COLOR,
			fontStyle : HmiCommon.DEFAULT_FONT_STYLE,
			building : {
				id: 0,
				name: null
			}
		}
	});

	var StatisticsFacilityOperation = extendWithBasicShapeElement(joint.shapes.chart.Pie, 'hmi.StatisticsFacilityOperation', {
		series : [{
			data : [
				{value : 25, label : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_ON'), fill : HmiCommon.DEFAULT_STATISTICS_COLOR_ON},
				{value : 25, label : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_OFF'), fill : HmiCommon.DEFAULT_STATISTICS_COLOR_OFF},
				{value : 25, label : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_CRITICAL'), fill : HmiCommon.DEFAULT_STATISTICS_COLOR_CRITICAL},
				{value : 25, label : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_WARNING'), fill : HmiCommon.DEFAULT_STATISTICS_COLOR_WARNING}
			]
		}],
		pieHole : 0.7,
		serieDefaults : {
			startAngle : 270,
			showLegend : false
		},
		sliceDefaults : {
			onHoverEffect : null
		},
		attrs : {
			title : {
				text : I18N.prop('HMI_STATISTICS_INDOOR'),
				refX : 0.05,
				refY : 0.08,
				fill : '#000000'
			},
			'.background > rect': { opacity: 1, stroke: HmiCommon.DEFAULT_STROKE_COLOR },
			'.foreground > rect': { fill: 'white', stroke: '#e5e5e5', opacity: 0, 'pointer-events': 'none' },
			'.foreground .caption': { fill: 'black', text: '', ref: '.foreground > rect', 'ref-x': 2, 'ref-y': 6, 'text-anchor': 'start', 'y-alignment': 'middle', 'font-size': 14 },
			'.foreground .subcaption': { fill: 'black', text: '', ref: '.foreground > rect', 'ref-x': 2, 'ref-y': 18, 'text-anchor': 'start', 'y-alignment': 'middle', 'font-size': 10 },
			'.data': { ref: '.background', 'ref-x': 0.5, 'ref-y': 0.37, 'ref-width': 0.40 },
			'.slice': { cursor: 'pointer' },
			'.slice > .slice-fill': { stroke: '#ffffff', 'stroke-width': 1, 'fill-opacity': 1 },
			'.slice.hover > .slice-fill': { 'fill-opacity': 0.8 },
			'.slice > .slice-border': { 'stroke-width': 6, 'stroke-opacity': 0.4, 'fill-opacity': 1, fill: 'none', display: 'none' },
			'.slice.hover > .slice-border': { display: 'none' },
			'.slice > .slice-inner-label': { 'text-anchor': 'middle', 'font-size': '12', stroke: 'none', 'stroke-width': '0', fill: '#000000', 'ref-x': 0, 'ref-y': 0, display: 'none' },
			'.slice.hover > .slice-inner-label': { display: 'block' },
			'.slice > .slice-inner-label > tspan': { dy: '1em' },
			'.slice > .slice-inner-label > tspan:first-child': { dy: '-1em' },
			'.device-legend-unit text': { fill: '#323232', 'font-size': 13, textAnchor: 'end' },
			'.device-legend': { 'ref-x': 0.05, 'ref-y': 0.60, 'ref-width': HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH_RATIO },
			'.device-legend-item[data-slice="0"]': { 'ref-y': 0.07 },
			'.device-legend-item[data-slice="1"]': { 'ref-y': 0.14 },
			'.device-legend-item[data-slice="2"]': { 'ref-y': 0.21 },
			'.device-legend-item[data-slice="3"]': { 'ref-y': 0.28 },
			'.device-legend-item > rect': { width: 12, height: 12 },
			'.device-legend-item text': { fill: '#000000', 'font-size': HmiCommon.DEFAULT_FONT_SIZE, textVerticalAnchor: 'middle' },
			'.device-legend-item .device-state': { textAnchor: 'start' },
			'.device-legend-item .device-count': { textAnchor: 'end' }
		}
	}, {
		markup : [{
			tagName : 'g',
			selector : 'body',
			className : 'roatatable',
			children : [{
				tagName : 'g',
				className : 'scalable'
			}, {
				tagName : 'g',
				className : 'background',
				children : [{
					tagName : 'rect'
				}, {
					tagName : 'text'
				}]
			}, {
				tagName : 'text',
				selector : 'title'
			}, {
				tagName : 'g',
				selector : 'data',
				className : 'data'
			}, {
				tagName : 'g',
				selector : 'foreground',
				className : 'foreground',
				children : [{
					tagName : 'rect'
				}, {
					tagName : 'text',
					className : 'caption'
				}, {
					tagName : 'text',
					className : 'subcaption'
				}, {
					tagName : 'g',
					className : 'legend',
					children : [{
						tagName : 'g',
						className : 'legend-items'
					}]
				}, {
					tagName : 'g',
					className : 'device-legend',
					children : [{
						tagName : 'g',
						className : 'device-legend-items'
					}]
				}]
			}]
		}],
		deviceLegendUnitMarkup : '<g class="device-legend-unit"><text/></g>',
		deviceLegendMarkup : '<g class="device-legend-item"><rect/><text class="device-state"/><text class="device-count"/></g>',
		textAttrsSelector : ['title', '.foreground .caption', '.foreground .subcaption', '.slice > .slice-inner-label', '.device-legend-unit text', '.device-legend-item text'],
		initialize : function(options) {
			var that = this;
			BasicShape.prototype.initialize.apply(that, arguments);
			that.initializeOptions(options, {
				size : {
					width : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH, height : HmiCommon.DEFAULT_STATISTICS_CARD_HEIGHT * 2
				}
			});
			that.startIntervalUpdate();
		},
		attachEvent : function() {
			var that = this;
			that.on('remove', that.onRemove.bind(that));
			that.on('change:binding', function(element, binding, opt) {
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				var textSelector = that.textAttrsSelector;
				if (key == 'binding/fontSize') {
					textSelector.forEach(function(selector) {
						that.attr(selector + '/fontSize', value);
					});
				}else if(key == 'binding/fontColor'){
					textSelector.forEach(function(selector) {
						that.attr(selector + '/fill', value);
					});
				}else if(key == 'binding/fontStyle'){
					textSelector.forEach(function(selector) {
						that.attr(selector + "/fontStyle", value);
					});
				}else if(key == 'binding/fontWeight'){
					textSelector.forEach(function(selector) {
						that.attr(selector + "/fontWeight", value);
					});
				}else if(key == 'binding/strokeWidth'){
					that.attr(".background rect/strokeWidth", value);
				}else if(key == 'binding/strokeColor'){
					that.attr(".background rect/stroke", value);
				}else if(key == 'binding/fillColor'){
					that.attr(".background rect/fill", value);
				}else if(key == 'binding/opacity'){
					that.attr(".background rect/opacity", value);
				}else if(key == 'binding/strokeDasharray'){
					that.setDasharray(value);
				}
			});
		},
		stopIntervalUpdate : function() {
			var that = this;
			clearTimeout(that._intervalTimer);
			that._isStartedInterval = false;
		},
		startIntervalUpdate : function() {
			var that = this;
			that.stopIntervalUpdate();
			that._isStartedInterval = true;
			that.getStatisticsData();
			that._intervalTimer = setInterval(that.getStatisticsData.bind(that), HmiCommon.DEFAULT_STATISTICS_TIMEOUT);
		},
		getStatisticsData : function() {
			var that = this;
			$.ajax({
				url : '/dms/devices/statisticView/AirConditioner?foundation_space_buildings_id=0'
			})
				.done(that.onDataRefresh.bind(that))
				.fail(function() {
				})
				.always(function() {
				});
		},
		onDataRefresh : function(data) {
			data = data[0];
			var devOn = data.numberOfOnIndoorDevices, devOff = data.numberOfOffIndoorDevices,
				devCritical = data.numberOfCriticalDevices, devWarning = data.numberOfWarningDevices;

			this.stopCanvasListening();
			this.set('series', [{
				data : [
					{value : devOn, label : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_ON'), fill : HmiCommon.DEFAULT_STATISTICS_COLOR_ON},
					{value : devOff, label : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_OFF'), fill : HmiCommon.DEFAULT_STATISTICS_COLOR_OFF},
					{value : devCritical, label : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_CRITICAL'), fill : HmiCommon.DEFAULT_STATISTICS_COLOR_CRITICAL},
					{value : devWarning, label : I18N.prop('DASHBOARD_BUILDING_OPERATION_STATUS_WARNING'), fill : HmiCommon.DEFAULT_STATISTICS_COLOR_WARNING}
				]
			}]);
			this.startCanvasListening();
		},
		onRemove : function() {
			this.stopIntervalUpdate();
		}
	}, {
		defaultBindingProp : {
			type : "Statistics",
			initWidth : HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH,
			initHeight : HmiCommon.DEFAULT_STATISTICS_CARD_HEIGHT * 2,
			strokeWidth : 0,
			strokeColor : HmiCommon.DEFAULT_STROKE_COLOR,
			strokeDasharray : '0',
			fillColor : '#ffffff',
			opacity : 1,
			fontType : HmiCommon.DEFAULT_FONT_TYPE,
			fontSize : HmiCommon.DEFAULT_FONT_SIZE,
			fontColor : HmiCommon.DEFAULT_FONT_COLOR,
			fontStyle : HmiCommon.DEFAULT_FONT_STYLE
		}
	});

	var PieView = joint.shapes.chart.PieView;
	var StatisticsFacilityOperationView = extendElementView(joint.shapes, 'hmi.StatisticsFacilityOperationView', PieView, {
		renderMarkup : function() {
			PieView.prototype.renderMarkup.apply(this, arguments);
			this.elDeviceLegendUnit = V(this.model.deviceLegendUnitMarkup);
			this.elDeviceLegendItems = this.$('.device-legend-items')[0];
			this.elDeviceLegend = V(this.model.deviceLegendMarkup);
		},
		calculateSeries : function(serieIndex) {
			var _ = window._;
			var series = joint.util.cloneDeep(this.model.get('series'));

			var serieDefaults = this.model.get('serieDefaults');
			var sliceDefaults = this.model.get('sliceDefaults');

			// Pie outer radius less margin
			var size = this.model.get('size');
			var radius = Math.min(size.width * HmiCommon.DEFAULT_STATISTICS_CARD_PIE_WIDTH_RATIO, size.height * HmiCommon.DEFAULT_STATISTICS_CARD_PIE_HEIGHT_RATIO) / 2;

			var pieHole = this.model.get('pieHole');
			pieHole = pieHole > 1 ? pieHole : radius * pieHole;

			var outerRadius = radius;
			var radiusStep = (radius - pieHole) / series.length;

			this._series = series.map(function(serie, index) {

				// Use serieIndex for update only the selected serie
				if (serieIndex !== void (0) && serieIndex !== index) { return serie; }

				serie = _.defaults(serie, serieDefaults);

				var startAngle = serie.startAngle;

				// Calculate percentage of each slice
				var total = serie.data.reduce(function(sum, slice) {
					return sum + slice.value;
				}, 0);
				var circleDividedByTotal = serie.degree / total || 0;
				var percentageDividedByTotal = 100 / total;

				serie.data = serie.data.map(function(slice, sliceIndex) {

					// Init default params for all slice (less some attributes valid only for outer slice)
					slice = _.defaults(slice, _.omit(sliceDefaults, 'offset', 'onClickEffect', 'onHoverEffect'));

					slice.outerRadius = outerRadius;
					slice.innerRadius = outerRadius - radiusStep;

					// For outer slice
					if (!index) {
						// Init default params for outer slice
						slice = _.defaults(slice, _.pick(sliceDefaults, 'offset', 'onClickEffect', 'onHoverEffect'));

						slice.isOuter = true;
						slice.offset = slice.offset > 1 ? slice.offset : slice.offset * slice.outerRadius;
						slice.onClickEffect.offset = slice.onClickEffect.offset > 1 ? slice.onClickEffect.offset : slice.onClickEffect.offset * slice.outerRadius;
					}

					slice.serieIndex = index;
					slice.sliceIndex = sliceIndex;
					slice.innerLabelMargin = (slice.innerLabelMargin < -1 || slice.innerLabelMargin > 1) ? slice.innerLabelMargin : slice.innerLabelMargin * slice.outerRadius;
					slice.percentage = slice.value * percentageDividedByTotal;

					var angle = slice.value * circleDividedByTotal;

					slice.degree = {
						angle: angle,
						start: startAngle,
						end: angle + startAngle
					};

					slice.rad = {
						angle: g.toRad(slice.degree.angle, true),
						start: g.toRad(slice.degree.start, true),
						end: g.toRad(slice.degree.end, true)
					};

					slice.middleangle = (slice.rad.start + slice.rad.end) / 2;

					startAngle = slice.degree.end;

					return slice;
				});

				outerRadius -= radiusStep;

				return serie;
			});

			return this._series;
		},
		updateSlice: function(slice) {
			var elSlice = this.elSlice.clone();

			// Append slice (at start for use .bbox() later)
			V(this.elPie).append(elSlice);

			// RENDER SLICE
			var elSliceFill = this.elSliceFill.clone();

			var slicefillColor = this.getSliceFillColor(slice.sliceIndex, slice.serieIndex);

			elSliceFill.attr({
				fill: slicefillColor,
				d: V.createSlicePathData(slice.innerRadius, slice.outerRadius, slice.rad.start, slice.rad.end)
			});

			elSlice.append(elSliceFill);

			// is a gradient
			if (joint.util.isObject(slicefillColor)) {

				this.applyGradient('#' + elSliceFill.attr('id'), 'fill', slicefillColor);
			}

			// RENDER BORDER
			var elSliceBorder = this.elSliceBorder.clone();

			// ...with polar coordinate
			var borderStrokeWidth = parseInt(this.model.attr('.slice > .slice-border/stroke-width'), 10);
			var startPoint = g.point.fromPolar(slice.outerRadius + borderStrokeWidth / 2, -slice.rad.start, g.point(0, 0));
			var endPoint = g.point.fromPolar(slice.outerRadius + borderStrokeWidth / 2, -slice.rad.end, g.point(0, 0));

			elSliceBorder.attr({
				stroke: slicefillColor,
				d: this.drawArc(startPoint, endPoint, slice.outerRadius + borderStrokeWidth / 2, slice.rad.start, slice.rad.end)
			});

			elSlice.append(elSliceBorder);

			// is a gradient
			if (joint.util.isObject(slicefillColor)) {

				this.applyGradient('#' + elSliceBorder.attr('id'), 'stroke', slicefillColor);
			}

			// RENDER INNER LABEL
			var elSliceInnerLabel = this.elSliceInnerLabel.clone();

			// Apply inner label text through template
			var percent = joint.util.format.string(slice.innerLabel, slice);
			elSliceInnerLabel.text(percent + '\r\n' + slice.label);

			elSlice.append(elSliceInnerLabel);

			// After the append (inserted in DOM) can calculate bbox of element
			var innerLabelBbox = elSliceInnerLabel.bbox();

			// Translate label: the gap from the middle of the text (bbox) and the pie border is constant
			var radiusLabel = (slice.outerRadius - innerLabelBbox.width / 2) - slice.innerLabelMargin;

			elSliceInnerLabel.translate((radiusLabel * Math.cos(-slice.middleangle)),
				(-radiusLabel * Math.sin(-slice.middleangle)));

			// Add element data attributes
			elSlice.attr({
				'data-serie': slice.serieIndex,
				'data-slice': slice.sliceIndex,
				'data-value': slice.value
			});

			// Add class for styling use
			var nameSerie = this._series[slice.serieIndex].name;

			if (nameSerie) { elSlice.addClass(nameSerie); }
			if (slice.name) { elSlice.addClass(slice.name); }

			elSlice.addClass('serie-' + slice.serieIndex + ' slice-' + slice.sliceIndex);

			// Is an outer slice
			if (slice.isOuter) {
				elSlice.addClass('outer');

				// Apply init offset for explode some slices
				if (slice.offset) {
					elSlice.addClass('clicked');

					this.effectOnSlice(elSlice, slice, { type: 'offset', offset: slice.offset });
				}
			}

			return elSlice;
		},
		updateLegend: function() {
			var that = this;
			PieView.prototype.updateLegend.apply(that, arguments);
			var series = that._series;

			that.elDeviceLegendItems.textContent = '';

			// var xPadding = 0;
			// var fontSizeLegendUnitText = parseInt(this.model.attr('.device-legend-unit text/font-size'), 10);
			// var fontSizeLegendSliceText = parseInt(this.model.attr('.device-legend-item text/font-size'), 10);
			var bbox = that.model.getBBox();
			var rightEnd = bbox.width * HmiCommon.DEFAULT_STATISTICS_CARD_WIDTH_RATIO;

			joint.util.toArray(series).forEach(function(serie, serieIndex) {
				var elDeviceLegendUnit = that.elDeviceLegendUnit.clone();
				var unitText = elDeviceLegendUnit.findOne('text').text('(EA)').translate(rightEnd, 0);
				// unitText.findOne('tspan').attr({ 'dx': '-1.5em' });
				// elDeviceLegendUnit.translate(0, xPadding);

				V(this.elDeviceLegendItems).append(elDeviceLegendUnit);

				// xPadding += (fontSizeLegendUnitText + serie.labelLineHeight);

				joint.util.forIn(serie.data, function(slice, sliceIndex) {
					var elDeviceLegend = that.elDeviceLegend.clone();
					var sliceFillColor = that.getSliceFillColor(sliceIndex, serieIndex);

					if(slice.name) elDeviceLegend.addClass(slice.name);
					elDeviceLegend.attr({ 'data-serie': serieIndex, 'data-slice': sliceIndex });

					elDeviceLegend.findOne('.device-state').text(slice.label).translate(25, 0);
					var value = slice.value.toString();
					var countText = elDeviceLegend.findOne('.device-count').text(value);
					countText.translate(rightEnd, 0);
					// elDeviceLegend.translate(0, xPadding);

					// xPadding += (fontSizeLegendSliceText + slice.legendLabelLineHeight);

					if (joint.util.isObject(sliceFillColor)) {
						that.applyGradient(elDeviceLegend.findOne('rect'), 'fill', sliceFillColor);
					} else {
						elDeviceLegend.findOne('rect').attr({ fill: sliceFillColor });
					}

					V(that.elDeviceLegendItems).append(elDeviceLegend);
				});
			}, that);
		}

	}, {

	});

	var Indoor = Animation.define('hmi.Indoor', {
		attrs : {
			box : {
				refWidth : "100%",
				refHeight : "100%",
				rx : 10,
				ry : 10,
				fill : "rgba(50,50,50,.9)",
				stroke : "rgba(50,50,50,.9)",
				strokeWidth : 1
			},
			device : {
				refX : 0,
				refY : 0,
				refX2 : "-18.75%",
				//refX2 : "-19.75%",
				refY2 : "-63%",
				refWidth : "39.5%",
				refHeight : "126%"
			},
			name : {
				refX : "29.3%",
				refY : "12%",
				fontSize : HmiCommon.DEFAULT_FONT_SIZE,
				fill : "#ffffff",
				textAnchor : "start",
				textVerticalAnchor : "top",
				text : I18N.prop("HMI_DEVNAME")
			},
			status_0 : {	//청정 정보 or 창문 개페
				refX : "1%", //좌측 패딩
				refY : "50%",
				refWidth : "13.15%",
				refHeight : "42%"
			},
			status_1 : {	//청정 정보 or 창문 개폐
				refX : "1%", //좌측 패딩
				refX2 : "13%",	//설정 정보 1 아이콘 사이즈
				refY : "50%",
				refWidth : "13.15%",
				refHeight : "42%"
			},
			operation_color : {	//운전 정보
				refX : "3%",	//패딩 + Margin
				refX2 : "26.3%",	//설정 정보 어이콘 2개 사이즈
				refY : "50%",
				refCx : "6.9%",
				refCy : "21%",
				refRCircumscribed : "6.3%",
				fill : "#b2b2b2"
			},
			operation_img : {	//운전 이미지
				refX : "3%",	//패딩 + Margin
				refX2 : "26.3%",	//설정 정보 어이콘 2개 사이즈
				refY : "50%",
				refWidth : "13.15%",
				refHeight : "42%"
			},
			current : {		//현재 온도
				refX : "6.9%",	//패딩 + Margin + MARGIN,
				refX2 : "39.45%",	//설정 정보 2개 및 운전 정보 아이콘 사이즈
				refY : "50%",
				refY2 : "10%",
				refWidth : "26.7%",
				fontSize : 15,
				fontWeight : 600,
				textAnchor : "start",
				textVerticalAnchor : "top",
				fill : "#25b3ff",
				text : "--.-°"
			},
			desired : {		//제어 온도
				refX : "6.9%",	//패딩 + Margin + MARGIN,
				refX2 : "66.15%",	//설정 정보 2개 및 운전 정보 아이콘 사이즈
				refY : "50%",
				refY2 : "10%",
				refWidth : "26.7%",
				fontSize : 15,
				textAnchor : "start",
				textVerticalAnchor : "top",
				text : "--.-°",
				fill : "#ffffff"
			},
			alarm : {		//알람 아이콘
				refX : 0,
				refY : 0,
				refX2 : "-12%",
				refY2 : "-36%",
				refWidth : "24%",
				refHeight : "72%"
			}
		}
	}, {
		markup : [{
			tagName : 'rect',
			selector : 'box'
		}, {
			tagName : 'image',
			selector : 'device'
		}, {
			tagName : 'text',
			selector : 'name'
		}, {
			tagName : 'image',
			selector : 'status_0'
		}, {
			tagName : 'image',
			selector : 'status_1'
		}, {
			tagName : 'circle',
			selector : 'operation_color'
		}, {
			tagName : 'image',
			selector : 'operation_img'
		}, {
			tagName : 'text',
			selector : 'current'
		}, {
			tagName : 'text',
			selector : 'desired'
		}, {
			tagName : 'image',
			selector : 'alarm'
		}],
		initialize : function(options){
			var that = this;
			Animation.prototype.initialize.apply(that, arguments);
			var key = this.prop("binding/key");
			var binding = {};
			if(key.indexOf("SUMMARY") != -1){
				binding.cardType = "summary";
			}else if(key.indexOf("GENERAL") != -1){
				binding.cardType = "general";
			}
			this.initializeOptions(options, {
				size : { width : HmiCommon.DEFAULT_INDOOR_WIDTH, height : HmiCommon.DEFAULT_INDOOR_HEIGHT },
				binding : binding
			});
			this.setSummaryType(binding.cardType == "summary");
		},
		_defaultAddEvt : function(){
			var that = this;
			Animation.prototype._defaultAddEvt.apply(that, arguments);
			var canvas = that.getCanvas();
			if(canvas){
				var zoom = canvas.getZoomLevel();
				zoom = zoom / 100;
				that.trigger("element:changeZoom", { zoom : zoom });
			}
		},
		attachEvent : function(){
			var that = this;
			that.on('change:binding', function(element, binding, opt){
				var key = opt.propertyPath;
				var value = that.getPropertyValue(key, opt.propertyValue);
				if(key == 'binding/visible'){
					that._setVisible(value);
				}else if(key == 'binding/device'){
					that.setDevice(value);	//해당 함수 내에서 setValue 호출되며 binding/value 트리거 됨.
				}else if(key == 'binding/projection'){
					that.setProjection(value);
				}else if(key == 'binding/selected'){
					that._setSelected(value);
				}else if(key == 'binding/vFliped' || key == 'binding/hFliped'){
					that.setImageTransform();
					that.flipAngle(key);
				}
				//접점 정보, 공청 정보
			});

			that.on("event:pointerdown", that.controlPointerDown.bind(that));

			//축약형으로 표시
			that.on("element:changeZoom", function(arg){
				var binding = that.prop("binding");
				//일반형은 일반형으로만 표시, 축약형은 축약형으로만 표시하므로 일반 실내기에서만 줌에 따라 조정
				if(!binding.cardType){
					var zoom = arg.zoom;
					var isSummary = zoom < 1.5;
					that.setSummaryType(isSummary, zoom);
				}else{
					//일반형/축약형에서 알람이 발생할 경우, 실내기 정보가 그대로 유지되는 현상으로 인하여 축약형 여부에 따른 UI 업데이트
					that.setSummaryType(binding.cardType == "summary");
				}
			});
		},
		setDevice : function(device){
			var that = this;
			//var deviceInfo = HmiUtil.getDeviceInfo(device);
			//that.setValue(deviceInfo.value);
			if(device.id){
				var name = device.name, status = Util.getStatus(device);
				status = status.toLowerCase().replace(/\./gi, "-");
				var temperatures = device.temperatures, modes = device.modes, operations = device.operations,
					airConditioner = device.airConditioner;

				//위치 및 타입에 따른 기기 아이콘
				//Indoor 정보 업데이트
				var projection = that.prop("binding/projection");
				if(name) that.setName(name);
				if(airConditioner){
					var indoorUnitType = airConditioner.indoorUnitType;
					that.setIndoorType(indoorUnitType, projection, status);
				}
				if(modes && operations && status) that.setModes(modes, operations, status);
				if(temperatures && modes) that.setTemperature(temperatures, modes);
				that.setEtcStatus();
			}else{
				that.attr("device/href", null);
				that.attr("alarm", {
					href : null,
					opacity : 0
				});
			}

			var canvas = that.getCanvas();
			if(canvas){
				var zoom = canvas.getZoomLevel();
				zoom = zoom / 100;
				that.trigger("element:changeZoom", { zoom : zoom });
			}
		},
		setProjection : function(projection){
			var that = this;
			var device = that.prop("binding/device");
			if(device.id){
				var airConditioner = device.airConditioner;
				var status = Util.getStatus(device);
				status = status.toLowerCase().replace(/\./gi, "-");
				if(airConditioner){
					var indoorUnitType = airConditioner.indoorUnitType;
					that.setIndoorType(indoorUnitType, projection, status);
				}
			}
		},
		_setSelected : function(isSelected){
			var that = this;
			if(isSelected) that.attr("box", { stroke : "#0081c6", strokeWidth : 2 });
			else that.attr("box", { stroke : "rgba(50,50,50,.9)", strokeWidth : 1 });
		},
		setSelected : function(isSelected){
			var that = this;
			that.prop("binding/selected", isSelected);
		},
		setIndoorType : function(indoorUnitType, projection, status){
			var that = this;
			if(indoorUnitType){
				var split = indoorUnitType.split(".");
				var last = split[split.length - 1];
				var key, image, imgDirSet, imgStatusSet, images = PaletteConfig.indoorDeviceImages;
				for( key in images ){
					if(last.indexOf(key) != -1){
						imgDirSet = images[key];
						imgStatusSet = imgDirSet[projection];
						if(imgStatusSet){
							if(status == "normal-off") image = imgStatusSet[status];
							else image = imgStatusSet["normal-on"];
						}
						break;
					}
				}
				if(image) that.attr("device/href", Util.addBuildDateQuery(image));
			}
		},
		setName : function(name){
			var that = this;
			var fontSize = that.prop("binding/fontSize");
			var MAX_WIDTH = 107;
			var MAX_HEIGHT = 21.5;
			that.attr("name/title", name);
			name = joint.util.breakText(name, { width : MAX_WIDTH, height : MAX_HEIGHT },
				{ 'font-size' : fontSize },
				{ hyphen : /[^\n]/, ellipsis : true });
			that.attr("name/text", name);
		},
		setTemperature : function(temperatures, modes){
			var that = this;
			var current = "--.-°";
			var desired = "--.-°";
			var unit = '°';
			var device = that.prop("binding/device");
			if(!modes) modes = device.modes;

			if(temperatures && temperatures.length > 0){
				temperatures = temperatures[0];
				current = temperatures.current ? temperatures.current.toFixed(1) : "--.-";
				desired = temperatures.desired ? temperatures.desired.toFixed(1) : "--.-";

				//모드가 송풍모드이면 설정온도는 - 로 표시된다.
				if(modes){
					var temp = $.grep(modes, function(e){ return e.id == "AirConditioner.Indoor.General" && e.mode == "Fan"; });
					if(temp && temp.length) desired = "--.-";
				}
				if(typeof current !== "undefined" && current !== null){
					current = kendo.toString(Util.convertNumberFormat(current), "00.0");
					current = current + unit;
				}

				if(typeof desired !== "undefined" && desired !== null){
					desired = kendo.toString(Util.convertNumberFormat(desired), "00.0");
					desired = desired + unit;
				}
			}
			that.attr("current/text", current);
			that.attr("desired/text", desired);
		},
		setModes : function(modes, operations, status){
			var that = this, device = that.prop("binding/device");
			if(!operations) operations = device.operations;
			if(!status){
				status = Util.getStatus(device);
				status = status.toLowerCase().replace(/\./gi, "-");
			}

			var imageKey = Util.getDisplayMode(modes, operations);
			var imageUrl = PaletteConfig.indoorModeImages[imageKey];
			if(imageUrl) that.attr("operation_img/href", Util.addBuildDateQuery(imageUrl));

			var statusColor = PaletteConfig.deviceStatusColors[status];
			if(status == "alarm-warning"){
				//알람은 ON으로 표시?
				statusColor = PaletteConfig.deviceStatusColors["normal-on"];
				//알람 아이콘 표시
				that.attr("alarm", {
					href : Util.addBuildDateQuery("../../src/main/resources/static-dev/images/icon/mark-warning.png"),
					opacity : 1
				});
			}else if(status == "alarm-critical"){
				//알람은 ON으로 표시?
				statusColor = PaletteConfig.deviceStatusColors["normal-on"];
				//알람 아이콘 표시
				that.attr("alarm", {
					href : Util.addBuildDateQuery("../../src/main/resources/static-dev/images/icon/mark-critical.png"),
					opacity : 1
				});
			}else{
				//알람 아이콘 숨김
				that.attr("alarm", {
					href : null,
					opacity : 0
				});
			}
			//유효하지 않는 상태는 OFF 색상으로 표시
			if(!statusColor) statusColor = PaletteConfig.deviceStatusColors["normal-off"];
			that.attr("operation_color", { fill : statusColor });
		},
		setEtcStatus : function(){
			//청정, 창문 개폐 정보 처리
		},
		controlPointerDown : function(e, event){
			var that = this;
			if(!that.isEditableCanvas()){
				// 선택 상태 업데이트
				var device = that.prop("binding/device");
				if(HmiUtil.isInvalidDevice(device)) return;

				var selected = that.prop("binding/selected");
				that.prop("binding/selected", !selected);
				var device = that.prop("binding/device");
				var canvas = that.getCanvas();
				if(canvas) canvas.selectIndoorDevice(device);
			}
		},
		updateBindingValue : function(){
			var that = this;
			var device = that.prop("binding/device");
			that.setDevice(device);
		},
		setBindingData : function(data){
			BaseHmiElement.prototype.setBindingData.call(this, data);
			var projection = data.projection;
			if(projection) this.prop("binding/projection", projection);
		},
		getGraphicBindingPopupData : function(){
			var data = BaseHmiElement.prototype.getGraphicBindingPopupData.call(this);
			var bindingData = this.prop("binding");
			data.projection = bindingData.projection;
			return data;
		},
		setSummaryType : function(isSummary, zoom){
			var that = this;
			var hideAttr = { opacity : 0 }, showAttr = { opacity : 1 };
			if(isSummary){
				that.attr("device", hideAttr);
				that.attr("status_0", hideAttr); //청정, 창문 개폐 숨기기
				that.attr("status_1", hideAttr); //청정, 창문 개폐 숨기기
				that.attr("name", hideAttr);
				that.attr("desired", hideAttr);
				//refRCircumscribed : "6.3%",
				that.attr("operation_color", { refX : 0, refX2 : null, refY : "25%", refY2 : "-21%", refCx : "50%", refCy : "25%", refRCircumscribed : "14.82%" });
				that.attr("operation_img", { refX : "50%", refY : "50%", refX2 : "-21%", refY2 : "-42%", refWidth : "42%", refHeight : "42%" });
				that.attr("alarm", { refX : "50%", refY : "50%", refX2 : "-34%", refY2 : "-34%", refWidth : "68%", refHeight : "68%" });
				that.attr("current", { refX : "50%", refY : "75%", refX2 : null, refY2 : null, textAnchor : "middle", textVerticalAnchor : "middle" });
				var alarmOpacity = that.attr("alarm/opacity");
				if(alarmOpacity == 1){		//알람이 존재하면 운영 모드는 표시하지 않는다.=
					that.attr("operation_color", hideAttr);
					that.attr("operation_img", hideAttr);
					that.attr("current", hideAttr);
				}else{
					that.attr("operation_color", showAttr);
					that.attr("operation_img", showAttr);
					that.attr("current", showAttr);
				}
				//운영 모드 아이콘, 원, 현재온도 표시
				//축약형 사이즈 조정
				that.resize(HmiCommon.DEFAULT_INDOOR_HEIGHT, HmiCommon.DEFAULT_INDOOR_HEIGHT);
			}else{
				that.attr("device", showAttr);
				that.attr("status_0", showAttr); //청정, 창문 개폐
				that.attr("status_1", showAttr); //청정, 창문 개폐
				that.attr("name", showAttr);
				that.attr("desired", showAttr);
				that.attr("operation_color", showAttr);
				that.attr("operation_img", showAttr);
				that.attr("current", showAttr);
				that.attr("operation_color", { refX : "3%", refX2 : "26.3%", refY : "50%", refY2 : null, refCx : "6.9%", refCy : "21%", refRCircumscribed : "6.3%" });
				that.attr("operation_img", { refX : "3%", refY : "50%", refX2 : "26.3%", refY2 : null, refWidth : "13.15%", refHeight : "42%" });
				that.attr("alarm", { refX : 0, refY : 0, refX2 : "-12%", refY2 : "-36%", refWidth : "24%", refHeight : "72%" });
				that.attr("current", { refX : "6.9%", refY : "50%", refX2 : "39.45%", refY2 : "10%", textAnchor : "start", textVerticalAnchor : "top" });
				//사이즈 조정
				that.resize(HmiCommon.DEFAULT_INDOOR_WIDTH, HmiCommon.DEFAULT_INDOOR_HEIGHT);
			}
			//Zoom된 만큼 Scale 조정
			//배율 유지 사양 삭제 2019/11/04
			/*if(typeof zoom !== "undefined"){
				var scale = 1 / zoom;
				that.setScale(scale);
			}*/
		},
		setScale : function(scale){
			var that = this;
			var fontSize = that.prop("binding/fontSize");
			var pos = that.position();
			var scaledFontSize = fontSize * scale;
			var angle = that.angle() || 0;
			if(angle){
				var bbox = that.getBBox();
				var rotatedBbox = bbox.bbox(angle);
				pos.x = rotatedBbox.x;
				pos.y = rotatedBbox.y;
			}
			that.scale(scale, scale, pos, {preventSetGridPoint : true });
			var r = 10 * scale;
			that.attr("box/rx", r);
			that.attr("box/ry", r);
			that.attr("name/fontSize", scaledFontSize);
			that.attr("current/fontSize", scaledFontSize);
			that.attr("desired/fontSize", scaledFontSize);
		}
	}, {
		defaultBindingProp : {
			type : "Indoor",
			projection : "Perspective",
			selected : false,
			fontSize : 15,
			fontWeight : 600
		}
	});


	var RappidElement = {
		Group : Group,
		Rectangle : Rectangle,
		RoundRectangle : RoundRectangle,
		Parallelogram : Parallelogram,
		Trapezoid : Trapezoid,
		Triangle : Triangle,
		Circle : Circle,
		Line : Line,
		Straight : Straight,
		Curve : Curve,
		Table : Table,
		HyperLink : HyperLink,
		Zone : Zone,
		Image : Image,
		ImportImage : ImportImage,
		Animation : Animation,
		Button : Button,
		RectangleButton : RectangleButton,
		RoundButton : RoundButton,
		Text : Text,
		ExtendText : ExtendText,
		ProgressBar : ProgressBar,
		ScaleBar : ScaleBar,
		CheckBox : CheckBox,
		RadioButton : RadioButton,
		ComboBox : ComboBox,
		Chart : Chart,
		ChartView : ChartView,
		CustomComponent : CustomComponent,
		StatisticsBuildingOperation : StatisticsBuildingOperation,
		StatisticsFacilityOperation : StatisticsFacilityOperation,
		StatisticsFacilityOperationView : StatisticsFacilityOperationView,
		Indoor : Indoor
	};
	window.RappidElement = RappidElement;
	return RappidElement;
});
//# sourceURL=hmi/config/rappid-element.js
