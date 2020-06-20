(function(window, $){
	var kendo = window.kendo,
		ui = kendo.ui, Widget = ui.Widget;

	var Util = window.Util;
	var Settings = window.GlobalSettings;
	var L = window.L;
	var isFlat = L.LineUtil.isFlat || L.LineUtil._flat || L.Polyline._flat;  // <=> 1.1 compat.

	var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

	var DEFAULT_WIDTH_SIZE = 1100;
	var DEFAULT_HEIGHT_SIZE = 766;
	//var DEFAULT_NEW_ZONE_WIDTH = 250;
	//var DEFAULT_NEW_ZONE_HEIGHT = 170;
	var DEFAULT_NEW_ZONE_WIDTH = 200;
	var DEFAULT_NEW_ZONE_HEIGHT = 136;
	//var DEFAULT_NEW_ZONE_POINT_SIZE = 20;
	//var DEFAULT_NEW_ZONE_POINT_GAP = 40;
	var DEFAULT_NEW_ZONE_NAME_WIDTH = 82;
	var DEFAULT_ZOOM_SIZE = 1;
	var DEFAULT_PROJECT_ZOOM_SIZE = 1;
	var DEFAULT_MAX_ZOOM_SIZE = 3;
	var DEFAULT_MIN_ZOOM_SIZE = 0.6;

	//Default zoomSnap, zoomDelta에 따른 확대 배수
	var DEFAULT_ZOOM_DELTA = 0.2;
	var DEFAULT_ZOOM_SNAP = 0;
	var DEFAULT_ZONE_NAME_FONT_SIZE = 16;
	var DEFAULT_DEVICE_ICON_SIZE = 34;
	var DEFAULT_MEASURED_DEVICE_ICON_SIZE = [34, 41.5];
	var DEFAULT_DEVICE_INFO_FONT_SIZE = 14;
	var DEFAULT_DEVICE_INFO_MARGIN_TOP = 6;
	var DEFAULT_DEVICE_INFO_WIDTH = 114;

	var IMAGE_LAYER_GROUP_ZINDEX = 1;
	var ZONE_LAYER_GROUP_ZINDEX = 2;
	var DEVICE_LAYER_GROUP_ZINDEX = 3;
	var DEVICE_INFO_LAYER_GROUP_ZINDEX = 4;
	var HEATMAP_LAYER_GROUP_ZINDEX = 5;
	var MEASURED_DEVICE_DEFAULT_ZINDEX = -10;
	var ZONE_NAME_MARKER_ZINDEX = -2000;
	var ZONE_NAME_MARKER_ZINDEX_EDITABLE = 1000; // 존편집시, 존네임 마커 zIndex

	var DEFAULT_RESIZE_MARKER_SIZE = 10;

	//존 편집시, 리사이즈 마커, transform 마커 zindex
	var ZONE_RESIZE_MARKER_ZINDEX = 1000;
	var ZONE_TRANSFORM_MARKER_ZINDEX = 1000;


	//Lefalet.Editable의 Vertex Marker의 사이즈는 Default 8로 변경 불필요

	var MAX_ZONE_NAME_LENGTH = 30;

	//명도가 129 보다 작을 때는 흰색, 클때는 검정색으로 Zone 이름을 표시
	var DEFAULT_BRIGHTNESS_VALUE = 129;

	//Color의 명도
	function getBrightness(hexColor){
		var color = kendo.parseColor(hexColor);
		var r = color.r, g = color.g, b = color.b;
		return Math.sqrt(r * r * 0.241 + g * g * 0.691 + b * b * 0.068);
	}

	/*
	*
	*	Leaflet Line Util Extends
	*
	*/

	L.LineUtil.isPointInLine = function(p, p1, p2){
		var x = p.x, y = p.y, x1 = p1.x, y1 = p1.y,
			x2 = p2.x, y2 = p2.y;

		var left = ( y2 - y1 ) / ( x2 - x1 ) * ( x - x1 );
		var right = y - y1;
		if(left == right) return true;
		return false;
	};

	//자기 자신이 아닌 다른 Control을 닫는다.
	function closeOtherControl(self){
		var map = self._map;
		var widget = map.widget;
		var controls = [widget.colorPickerControl, widget.layerControl, widget.legendControl];
		var i, max = controls.length;
		for( i = 0; i < max; i++ ){
			if(self !== controls[i] && typeof controls[i] != 'undefined' ) controls[i].setActive(false);
		}
	}

	/*
	*
	*	Leaflet Control Extends
	*
	*/
	L.Control.BaseControl = L.Control.extend({
		options : {
			position : 'topright',
			className : '',
			title : '',
			visible : true,
			enabled : true,
			active : false
		},
		initialize : function(options){
			L.Util.setOptions(this, options);
		},
		onAdd : function(map){
			var self = this;
			if(!self.wrapper) self.wrapper = map.widget ? map.widget.element : $(map.getContainer());
			var options = self.options;
			var className = options.className;
			var title = options.title;
			self.element = $("<a class='k-button common-map-view-control " + className + "' role='button'" +
								"title='" + title + "'><i class='ic'></i></a>");
			self.element.on("click", self.click.bind(self));
			self._updateControlState();

			return this.element.get(0);
		},
		_updateControlState : function(){
			var self = this, options = self.options;
			var visible = options.visible, enabled = options.enabled, active = options.active;
			if(visible) self.element.show();
			else self.element.hide();
			if(enabled){
				self.element.prop("disabled", false);
				self.element.removeClass("disabled");
			}else{
				self.element.prop("disabled", true);
				self.element.addClass("disabled");
			}
			if(active) self.element.addClass("active");
			else self.element.removeClass("active");
		},
		click : function(e){
			var self = this;
			if(!self.options.enabled){
				return false;
			}
			return true;
		},
		onRemove: function () {
			L.Control.prototype.onRemove.call(this);
		},
		active : function(isActive){
			this.options.active = isActive;
			this._updateControlState();
		},
		disable : function(){
			this.options.enabled = false;
			this._updateControlState();
		},
		enable : function(){
			this.options.enabled = true;
			this._updateControlState();
		},
		hide : function(){
			this.options.visible = false;
			this._updateControlState();
		},
		show : function(){
			this.options.visible = true;
			this._updateControlState();
		},
		setActive : function(isActive){
			//오버라이딩 필요
			this.options.active = isActive;
			this._updateControlState();
		}
	});

	L.Control.ExtendZoom = L.Control.Zoom.extend({
		options : {
			position : "topright"
		},
		initialize : function(options){
			var I18N = window.I18N;
			this.options.zoomInTitle = I18N.prop("COMMON_ZOOM_IN");
			this.options.zoomOutTitle = I18N.prop("COMMON_ZOOM_OUT");
			L.Control.BaseControl.prototype.initialize.call(this, options);
		},
		onAdd: function (map) {
			var zoomName = '',
			    container = $('<div/>').get(0),
			    options = this.options;

			zoomName = 'k-button common-map-view-control common-map-view-zoom';
			var iconElem = $("<i/>").addClass("ic").get(0).outerHTML;
			this._zoomInButton  = this._createButton(iconElem, options.zoomInTitle,
			        zoomName + '-in',  container, this._zoomIn);
			this._zoomOutButton = this._createButton(iconElem, options.zoomOutTitle,
			        zoomName + '-out', container, this._zoomOut);

			this._updateDisabled();
			map.on('zoomend zoomlevelschange', this._updateDisabled, this);

			return container;
		},
		_updateDisabled: function () {
			var map = this._map,
			    className = 'disabled';
			//console.log("zoomLevel : " + map.getZoom());
			L.DomUtil.removeClass(this._zoomInButton, className);
			L.DomUtil.removeClass(this._zoomOutButton, className);

			if (this._disabled || map._zoom === map.getMinZoom()) {
				L.DomUtil.addClass(this._zoomOutButton, className);
			}
			if (this._disabled || map._zoom === map.getMaxZoom()) {
				L.DomUtil.addClass(this._zoomInButton, className);
			}
		},
		_zoomIn: function (e) {
			if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
				//this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
				this._map.zoomIn(this._map.options.zoomDelta * 2.5);
			}
		},
		_zoomOut: function (e) {
			if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
				//this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
				this._map.zoomOut(this._map.options.zoomDelta * 2.5);
			}
		}
	});

	L.control.extendZoom = function(opts){
		return new L.Control.ExtendZoom(opts);
	};

	L.Control.FullScreen = L.Control.BaseControl.extend({
		options : {
			className : 'common-map-view-full-screen',
			title : 'Full Screen'
		},
		initialize : function(options){
			var I18N = window.I18N;
			this.options.title = I18N.prop("COMMON_FULL_SCREEN");
			L.Control.BaseControl.prototype.initialize.call(this, options);
		},
		click : function(e){
			var cancel = L.Control.BaseControl.prototype.click.call(this, e);
			if(!cancel) return;
			var options = this.options, isActive = options.active;
			if(isActive){
				this.wrapper.removeClass("common-full-screen");
			}else{
				this.wrapper.addClass("common-full-screen");
			}
			var map = this._map;
			map.invalidateSize();
			options.active = !isActive;
			this._updateControlState();
			return false;
		}
	});

	L.control.fullScreen = function(opts){
		return new L.Control.FullScreen(opts);
	};

	L.Control.Legend = L.Control.BaseControl.extend({
		options : {
			className : 'common-map-view-legend',
			title : 'Legend',
			types : [],
			legendOnOffTypes : ["Light", "SmartPlug", "ControlPoint"],
			legendBoxOptions : {
				visible : false
			}
		},
		initialize : function(options){
			var I18N = window.I18N;
			this.options.title = I18N.prop("COMMON_LEGEND");
			L.Control.BaseControl.prototype.initialize.call(this, options);
		},
		onAdd : function(map){
			var self = this, options = this.options, legendBoxOptions = options.legendBoxOptions;
			var I18N = window.I18N;
			legendBoxOptions.baseLegendTemplate = '<li><i class="disc g"></i><span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL") + '</span></li>' +
												  '<li><i class="disc r"></i><span>' + I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL") + '</span></li>' +
												  '<li><i class="disc y"></i><span>' + I18N.prop("FACILITY_DEVICE_STATUS_WARNING") + '</span></li>';
			legendBoxOptions.legendTemplate = '<li><i class="disc g"></i><span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_ON") + '</span></li>' +
											  '<li><i class="disc m"></i><span>' + I18N.prop("FACILITY_DEVICE_STATUS_NORMAL_OFF") + '</span></li>' +
											  '<li><i class="disc r"></i><span>' + I18N.prop("FACILITY_DEVICE_STATUS_CRITICAL") + '</span></li>' +
											  '<li><i class="disc y"></i><span>' + I18N.prop("FACILITY_DEVICE_STATUS_WARNING") + '</span></li>';
			legendBoxOptions.legendBeaconTemplate = '<li><i class="disc gr"></i><span>' + I18N.prop("FACILITY_DEVICE_BEACON_TYPE_FIXED") + '</span></li>' +
													'<li><i class="disc measured gr"></i><span>' + I18N.prop("FACILITY_DEVICE_BEACON_TYPE_MOVABLE") + '</span></li>';
			legendBoxOptions.legendIndoorTemplate = '<li><i class="ic ic-peak"></i><span>' + I18N.prop("FACILITY_INDOOR_STATUS_PEAK") + '</span></li>' +
													'<li><i class="ic ic-deforest"><span></i>' + I18N.prop("FACILITY_INDOOR_STATUS_DEFROST") + '</span></li>' +
													'<li><i class="ic ic-filter"><span></i>' + I18N.prop("FACILITY_INDOOR_STATUS_FILTER_WARNING") + '</span></li>' +
													'<li><i class="ic ic-rc-disable"></i><span>' + I18N.prop("FACILITY_INDOOR_STATUS_RC_OFF") + '</span></li>' +
													'<li><i class="ic ic-rock"></i><span>' + I18N.prop("FACILITY_INDOOR_STATUS_OPERATION_LIMIT") + '</span></li>' +
													'<li><i class="ic ic-thurmo"></i><span>' + I18N.prop("FACILITY_INDOOR_TEMPERATURE_LIMIT") + '</span></li>' +
													'<li><i class="ic ic-schedule"></i><span>' + I18N.prop("FACILITY_DEVICE_SAC_INDOOR_SCHEDULE") + '</span></li>' +
													'<li><i class="ic ic-spi"></i><span>' + I18N.prop("FACILITY_INDOOR_CONTROL_SPI") + '</span></li>' +
													'<li><i class="ic ic-antifreeze"></i><span>' + I18N.prop("FACILITY_INDOOR_STATUS_FREEZE_PROTECTION") + '</span></li>';

			self.legendElement = $("<div class='common-map-view-legend-box leaflet-control'/>");
			self._updateLegendBoxState();
			return L.Control.BaseControl.prototype.onAdd.call(self, map);
		},
		addTo: function (map) {
			this.remove();
			this._map = map;

			var container = this._container = this.onAdd(map),
			    pos = this.getPosition(),
			    corner = map._controlCorners[pos];
			var layerBox = this.legendElement.get(0);

			L.DomUtil.addClass(container, 'leaflet-control');

			if (pos.indexOf('bottom') !== -1) {
				corner.insertBefore(container, corner.firstChild);
				corner.insertBefore(layerBox, corner.firstChild);
			} else {
				corner.appendChild(container);
				corner.appendChild(layerBox);
			}

			return this;
		},
		_updateLegendBoxState : function(){
			var self = this, options = self.options, legendBoxOptions = options.legendBoxOptions;
			var types = options.types, legendOnOffTypes = options.legendOnOffTypes;
			var type, i, max = types.length;
			var statusTemplate = "", indoorTemplate = "", beaconTemplate = "";
			for( i = 0; i < max; i++ ){
				type = types[i];
				if(!type) continue;

				if(legendOnOffTypes.indexOf(type) !== -1 && !statusTemplate){
					statusTemplate = legendBoxOptions.legendTemplate;
				}else if(type.indexOf("AirConditioner") !== -1){
					if(!statusTemplate) statusTemplate = legendBoxOptions.legendTemplate;
					indoorTemplate = legendBoxOptions.legendIndoorTemplate;
				}else if(type.indexOf("Beacon") !== -1){
					beaconTemplate = legendBoxOptions.legendBeaconTemplate;
				}
			}
			if(!statusTemplate) statusTemplate = legendBoxOptions.baseLegendTemplate;
			var legendTemplate = "<ul>" + statusTemplate + beaconTemplate + indoorTemplate + "</ul>";
			self.legendElement.html(legendTemplate);
			if(legendBoxOptions.visible) self.legendElement.show();
			else self.legendElement.hide();
		},
		click : function(e){
			var cancel = L.Control.BaseControl.prototype.click.call(this, e);
			if(!cancel) return;
			var self = this, options = this.options, isActive = options.active;
			self.setActive(!isActive);
			return false;
		},
		setActive : function(isActive){
			var self = this, options = self.options, legendBoxOptions = options.legendBoxOptions;
			if(isActive){
				closeOtherControl(self);
				var position = self.element.position();
				legendBoxOptions.visible = true;
				self.legendElement.css({ top : position.top });
			}else{
				legendBoxOptions.visible = false;
			}
			L.Control.BaseControl.prototype.setActive.call(this, isActive);
			self._updateLegendBoxState();
		}
	});

	L.control.legend = function(opts){
		return new L.Control.Legend(opts);
	};

	L.Control.DefaultZoom = L.Control.BaseControl.extend({
		options : {
			title : 'Default Zoom',
			className : 'common-map-view-default-zoom'
		},
		initialize : function(options){
			var I18N = window.I18N;
			this.options.title = I18N.prop("COMMON_DEFAULT_VIEW");
			L.Control.BaseControl.prototype.initialize.call(this, options);
		},
		click : function(e){
			var cancel = L.Control.BaseControl.prototype.click.call(this, e);
			if(!cancel) return;
			var map = this._map, widget = map.widget;
			widget.moveCenterView();
			return false;
		}
	});

	L.control.defaultZoom = function(opts){
		return new L.Control.DefaultZoom(opts);
	};

	L.Control.ColorPicker = L.Control.BaseControl.extend({
		options : {
			title : 'Color Picker',
			className : 'common-map-view-color-picker',
			enabled : false,
			visible : false,
			//클릭해도 Color Picker가 닫히지 않는 영역의 요소
			activeClass : ".common-map-view"
		},
		initialize : function(options){
			var I18N = window.I18N;
			this.options.title = I18N.prop("COMMON_COLOR_PICKER");
			L.Control.BaseControl.prototype.initialize.call(this, options);
		},
		onAdd : function(map){
			var that = this;
			this.colorPicker = $("<div class='common-map-view-color-picker-element'/>").kendoCommonColorPicker({
				activeSelector : this.options.activeClass
			}).data("kendoCommonColorPicker");
			this.colorPicker.wrapper.addClass("leaflet-control");
			this.colorPicker.bind("change", this.changeColorEvt.bind(this));
			this.colorPicker.bind("close", function() { that.setActive(false); });
			return L.Control.BaseControl.prototype.onAdd.call(this, map);
		},
		addTo: function (map) {
			this.remove();
			this._map = map;

			var container = this._container = this.onAdd(map),
			    pos = this.getPosition(),
			    corner = map._controlCorners[pos];
			var colorPickerWrapper = this.colorPicker.wrapper.get(0);

			L.DomUtil.addClass(container, 'leaflet-control');

			if (pos.indexOf('bottom') !== -1) {
				corner.insertBefore(container, corner.firstChild);
				corner.insertBefore(colorPickerWrapper, corner.firstChild);
			} else {
				corner.appendChild(container);
				corner.appendChild(colorPickerWrapper);
			}

			return this;
		},
		click : function(e){
			var cancel = L.Control.BaseControl.prototype.click.call(this, e);
			if(!cancel) return;
			var self = this, options = self.options, isActive = options.active;
			self.setActive(!isActive);
			return false;
		},
		setActive : function(isActive){
			var self = this;
			if(isActive){
				closeOtherControl(self);
				//Show Color Picker
				var position = self.element.position();
				self.colorPicker.position({ top : position.top });
				self.colorPicker.open();
			}else{
				//Hide Color Picker
				if (self.colorPicker.isOpened()) {
					self.colorPicker.close();
				}
			}
			L.Control.BaseControl.prototype.setActive.call(this, isActive);
		},
		changeColorEvt : function(e){
			var self = this, map = self._map, widget = map.widget;
			var color = e.value;
			var editableZone = widget._editableZonePolygon;
			if(editableZone){
				var colorOpt = { color : color, fillColor : color };
				//Model 변경
				var zone = editableZone.zone;
				widget._addChangedData(widget._changedZones, zone, "backgroundColor");
				zone.backgroundColor = color;
				editableZone.setStyle(colorOpt);
				if(editableZone.zoneNameMarker){
					var zoneNameMarkerText = $(editableZone.zoneNameMarker._icon);
					zoneNameMarkerText = zoneNameMarkerText.find(".common-map-view-zone-name-text");
					var fontColor = widget._getZoneNameTextColor(color);
					zoneNameMarkerText.css({"background-color" : color, "color" : fontColor });
				}

				//존 편집 포인트 색상 변경
				editableZone.editor.setMarkersColor(color);
			}
		}
	});

	L.control.colorPicker = function(opts){
		return new L.Control.ColorPicker(opts);
	};

	L.Control.Layer = L.Control.BaseControl.extend({
		options : {
			title : 'Layers',
			className : 'common-map-view-layer',
			showZoneNameCheckbox : true,
			showDeviceInfoCheckbox : true,
			showDeviceNameCheckbox : true,
			showRegisteredGateway : false,
			layerBoxOptions : {
				visible : false
			}
		},
		initialize : function(options){
			var I18N = window.I18N;
			this.options.title = I18N.prop("COMMON_LAYERS");
			L.Control.BaseControl.prototype.initialize.call(this, options);
		},
		onAdd : function(map){
			var self = this, options = this.options, showRegisteredGateway = options.showRegisteredGateway,
				showDeviceInfoCheckbox = options.showDeviceInfoCheckbox, showDeviceNameCheckbox = options.showDeviceNameCheckbox,
				showZoneNameCheckbox = options.showZoneNameCheckbox, layerBoxOptions = options.layerBoxOptions;
			self._uid = kendo.guid();
			//get checked info from Local Storage Per User ID
			var localStorage = window.localStorage;
			layerBoxOptions.checkedRegisteredGateway = localStorage.getItem("checkedRegsiteredGateway");
			layerBoxOptions.checkedRegisteredGateway = layerBoxOptions.checkedRegisteredGateway == "true" ? true : false;
			layerBoxOptions.clickRegisteredGateway = self._clickRegisteredGatewayChkboxEvt.bind(self);
			layerBoxOptions.checkedDeviceInfo = localStorage.getItem("checkedDeviceInfo");
			layerBoxOptions.checkedDeviceInfo = layerBoxOptions.checkedDeviceInfo == "false" ? false : true;
			layerBoxOptions.clickDeviceInfo = self._clickDeviceInfoChkboxEvt.bind(self);
			layerBoxOptions.checkedDeviceName = localStorage.getItem("checkedDeviceName");
			layerBoxOptions.checkedDeviceName = layerBoxOptions.checkedDeviceName == "false" ? false : true;
			layerBoxOptions.clickDeviceName = self._clickDeviceNameChkboxEvt.bind(self);
			layerBoxOptions.checkedZoneName = localStorage.getItem("checkedZoneName");
			layerBoxOptions.checkedZoneName = layerBoxOptions.checkedZoneName == "false" ? false : true;
			layerBoxOptions.clickZoneName = self._clickZoneNameChkboxEvt.bind(self);

			self.layerElement = $("<div class='common-map-view-layer-box leaflet-control'></div>");
			var ul = $("<ul/>");
			var id, checkbox, label, text, I18N = window.I18N;
			if(showRegisteredGateway){
				text = I18N.prop("FACILITY_REGISTERD_GATEWAY");
				id = "common-map-view-registered-gateway-" + self._uid;
				checkbox = $("<input/>").attr({ type : "checkbox", id : id}).addClass("k-checkbox");
				label = $("<label/>").attr({ for : id }).addClass("common-map-view-registered-gateway-label k-checkbox-label").text(text);
				$("<li/>").append(checkbox).append(label).appendTo(ul);
				self.registeredGatewayCheckbox = checkbox;
				self.registeredGatewayCheckbox.on("click", layerBoxOptions.clickRegisteredGateway);
			}

			if(showDeviceInfoCheckbox){
				text = I18N.prop("COMMON_DISPLAY_DEVICE_INFORMATION");
				self._uid = kendo.guid();
				id = "common-map-view-device-info-" + self._uid;
				checkbox = $("<input/>").attr({ type : "checkbox", id : id}).addClass("k-checkbox");
				label = $("<label/>").attr({ for : id}).addClass("common-map-view-device-info-label k-checkbox-label").text(text);
				$("<li/>").append(checkbox).append(label).appendTo(ul);
				self.deviceInfoCheckbox = checkbox;
				self.deviceInfoCheckbox.on("click", layerBoxOptions.clickDeviceInfo);
			}

			if(showDeviceNameCheckbox){
				text = I18N.prop("COMMON_DISPLAY_DEVICE_NAME");
				self._uid = kendo.guid();
				id = "common-map-view-device-name-" + self._uid;
				checkbox = $("<input/>").attr({ type : "checkbox", id : id}).addClass("k-checkbox");
				label = $("<label/>").attr({ for : id}).addClass("common-map-view-device-info-label k-checkbox-label").text(text);
				$("<li/>").append(checkbox).append(label).appendTo(ul);
				self.deviceNameCheckbox = checkbox;
				self.deviceNameCheckbox.on("click", layerBoxOptions.clickDeviceName);
			}

			if(showZoneNameCheckbox){
				text = I18N.prop("COMMON_DISPLAY_ZONE_NAME");
				self._uid = kendo.guid();
				id = "common-map-view-zone-name-" + self._uid;
				checkbox = $("<input/>").attr({ type : "checkbox", id : id}).addClass("k-checkbox");
				label = $("<label/>").attr({ for : id}).addClass("common-map-view-device-info-label k-checkbox-label").text(text);
				$("<li/>").append(checkbox).append(label).appendTo(ul);
				self.zoneNameCheckbox = checkbox;
				self.zoneNameCheckbox.on("click", layerBoxOptions.clickZoneName);
			}
			self.layerElement.append(ul);
			self._updateLayerBoxState();
			return L.Control.BaseControl.prototype.onAdd.call(self, map);
		},
		_updateLayerBoxState : function(){
			var self = this;
			var layerBoxOptions = self.options.layerBoxOptions;
			var visible = layerBoxOptions.visible;
			var checkedRegisteredGateway = layerBoxOptions.checkedRegisteredGateway;
			var checkedDeviceInfo = layerBoxOptions.checkedDeviceInfo;
			var checkedDeviceName = layerBoxOptions.checkedDeviceName;
			var checkedZoneName = layerBoxOptions.checkedZoneName;
			if(visible) self.layerElement.show();
			else self.layerElement.hide();

			if(self.registeredGatewayCheckbox) self.registeredGatewayCheckbox.prop("checked", checkedRegisteredGateway);
			if(self.deviceInfoCheckbox) self.deviceInfoCheckbox.prop("checked", checkedDeviceInfo);
			if(self.deviceNameCheckbox) self.deviceNameCheckbox.prop("checked", checkedDeviceName);
			if(self.zoneNameCheckbox) self.zoneNameCheckbox.prop("checked", checkedZoneName);
		},
		onRemove: function () {
			kendo.unbind(this.layerElement);
			this.layerElement.remove();
			this.layerElement = null;
			L.Control.BaseControl.prototype.onRemove.call(this);
		},
		addTo: function (map) {
			this.remove();
			this._map = map;

			var container = this._container = this.onAdd(map),
			    pos = this.getPosition(),
			    corner = map._controlCorners[pos];
			var layerBox = this.layerElement.get(0);

			L.DomUtil.addClass(container, 'leaflet-control');

			if (pos.indexOf('bottom') !== -1) {
				corner.insertBefore(container, corner.firstChild);
				corner.insertBefore(layerBox, corner.firstChild);
			} else {
				corner.appendChild(container);
				corner.appendChild(layerBox);
			}

			return this;
		},
		click : function(e){
			var self = this, options = self.options, isActive = options.active;
			self.setActive(!isActive);
			return false;
		},
		setActive : function(isActive){
			var self = this, options = self.options;
			var layerBoxOptions = options.layerBoxOptions;
			if(isActive){
				closeOtherControl(self);
				//Show Layer Element
				var position = self.element.position();
				self.layerElement.css({ top : position.top });
				layerBoxOptions.visible = true;
			}else{
				//Hide Layer Element
				layerBoxOptions.visible = false;
			}
			L.Control.BaseControl.prototype.setActive.call(this, isActive);
			self._updateLayerBoxState();
		},
		_clickDeviceInfoChkboxEvt : function(e){
			var self = this, map = self._map, widget = map.widget, element = widget.element;
			var layerBoxOptions = self.options.layerBoxOptions;
			var chkbox = self.deviceInfoCheckbox;
			var selector = ".device-info-text .text";
			layerBoxOptions.checkedDeviceInfo = chkbox.prop("checked");
			window.localStorage.setItem("checkedDeviceInfo", layerBoxOptions.checkedDeviceInfo);
			if(layerBoxOptions.checkedDeviceInfo){
				element.find(selector).show();
			}else{
				element.find(selector).hide();
			}
		},
		_clickDeviceNameChkboxEvt : function(e){
			var self = this, map = self._map, widget = map.widget, element = widget.element;
			var layerBoxOptions = self.options.layerBoxOptions;
			var chkbox = self.deviceNameCheckbox;
			var selector = ".device-info-text .name";
			layerBoxOptions.checkedDeviceName = chkbox.prop("checked");
			window.localStorage.setItem("checkedDeviceName", layerBoxOptions.checkedDeviceName);
			if(layerBoxOptions.checkedDeviceName){
				element.find(selector).show();
			}else{
				element.find(selector).hide();
			}
		},
		_clickZoneNameChkboxEvt : function(e){
			var self = this, map = self._map, widget = map.widget, element = widget.element;
			var chkbox = self.zoneNameCheckbox, selector = ".common-map-view-zone-name";
			var layerBoxOptions = self.options.layerBoxOptions;

			layerBoxOptions.checkedZoneName = chkbox.prop("checked");
			window.localStorage.setItem("checkedZoneName", layerBoxOptions.checkedZoneName);
			if(layerBoxOptions.checkedZoneName){
				element.find(selector).show();
			}else{
				element.find(selector).hide();
			}
		},
		_clickRegisteredGatewayChkboxEvt : function(e){
			var self = this;
			var map = self._map;
			var widget = map.widget;
			var chkbox = self.registeredGatewayCheckbox;
			var layerBoxOptions = self.options.layerBoxOptions;
			layerBoxOptions.checkedRegisteredGateway = chkbox.prop("checked");
			window.localStorage.setItem("checkedRegisteredGateway", layerBoxOptions.checkedRegisteredGateway);
			if(layerBoxOptions.checkedRegisteredGateway){
				widget._showRegisteredGateway();
			}else{
				widget._removeRegisteredGateway();
			}
		}
	});

	L.control.layer = function(opts){
		return new L.Control.Layer(opts);
	};
	/*
	*
	*	Lefalet Vertex Marker Extends
	*
	*/
	L.RestrictDraggable = L.Draggable.extend({
		_onMove: function (e) {
			if (e._simulated || !this._enabled) { return; }

			if (e.touches && e.touches.length > 1) {
				this._moved = true;
				return;
			}

			var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e);
			var clientX = first.clientX, clientY = first.clientY, options = this.options, restrict = options.restrict;

			if(restrict == "vertical"){
				clientY = this._startPoint.y;
			}else if(restrict == "horizontal"){
				clientX = this._startPoint.x;
			}

			var newPoint = new L.Point(clientX, clientY);
			var offset = newPoint.subtract(this._startPoint);

			if (!offset.x && !offset.y) { return; }
			if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }

			L.DomEvent.preventDefault(e);

			if (!this._moved) {
				// @event dragstart: Event
				// Fired when a drag starts
				this.fire('dragstart');

				this._moved = true;
				this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);

				L.DomUtil.addClass(document.body, 'leaflet-dragging');

				this._lastTarget = e.target || e.srcElement;
				// IE and Edge do not give the <use> element, so fetch it
				// if necessary
				if ((window.SVGElementInstance) && (this._lastTarget instanceof SVGElementInstance)) {
					this._lastTarget = this._lastTarget.correspondingUseElement;
				}
				L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
			}

			this._newPos = this._startPos.add(offset);
			this._moving = true;

			L.Util.cancelAnimFrame(this._animRequest);
			this._lastEvent = e;
			this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true);
		}
	});

	//MarkerDrag를 Extend할 수 없으므로 MarkerDrag의 코드를 그대로 사용하여 정의
	L.Handler.RestrictMarkerDrag = L.Handler.extend({
		options : {
			restrict : null
		},
		initialize: function (marker, options) {
			L.Util.setOptions(this, options);
			this._marker = marker;
		},
		addHooks: function () {
			var icon = this._marker._icon;

			if (!this._draggable) {
				this._draggable = new L.RestrictDraggable(icon, icon, true, this.options);
			}

			this._draggable.on({
				dragstart: this._onDragStart,
				predrag: this._onPreDrag,
				drag: this._onDrag,
				dragend: this._onDragEnd
			}, this).enable();

			L.DomUtil.addClass(icon, 'leaflet-marker-draggable leaflet-marker-resizable');
		},
		removeHooks: function () {
			this._draggable.off({
				dragstart: this._onDragStart,
				predrag: this._onPreDrag,
				drag: this._onDrag,
				dragend: this._onDragEnd
			}, this).disable();

			if (this._marker._icon) {
				L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
			}
		},
		moved: function () {
			return this._draggable && this._draggable._moved;
		},
		_adjustPan: function (e) {
			var marker = this._marker,
			    map = marker._map,
			    speed = this._marker.options.autoPanSpeed,
			    padding = this._marker.options.autoPanPadding,
			    iconPos = L.DomUtil.getPosition(marker._icon),
			    bounds = map.getPixelBounds(),
			    origin = map.getPixelOrigin();

			var panBounds = L.bounds(
				bounds.min._subtract(origin).add(padding),
				bounds.max._subtract(origin).subtract(padding)
			);

			if (!panBounds.contains(iconPos)) {
				// Compute incremental movement
				var movement = L.point(
					(Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
					(Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

					(Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
					(Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
				).multiplyBy(speed);

				map.panBy(movement, {animate: false});

				this._draggable._newPos._add(movement);
				this._draggable._startPos._add(movement);

				L.DomUtil.setPosition(marker._icon, this._draggable._newPos);
				this._onDrag(e);

				this._panRequest = L.DomUtil.requestAnimFrame(this._adjustPan.bind(this, e));
			}
		},
		_onDragStart: function () {
			this._oldLatLng = this._marker.getLatLng();
			this._marker
				.closePopup()
				.fire('movestart')
				.fire('dragstart');
		},
		_onPreDrag: function (e) {
			if (this._marker.options.autoPan) {
				L.Util.cancelAnimFrame(this._panRequest);
				this._panRequest = L.Util.requestAnimFrame(this._adjustPan.bind(this, e));
			}
		},
		_onDrag: function (e) {
			var marker = this._marker,
				shadow = marker._shadow,
				iconPos = L.DomUtil.getPosition(marker._icon),
				latlng = marker._map.layerPointToLatLng(iconPos);

			if (shadow) {
				L.DomUtil.setPosition(shadow, iconPos);
			}
			marker._latlng = latlng;
			e.latlng = latlng;
			e.oldLatLng = this._oldLatLng;
			marker
				.fire('move', e)
				.fire('drag', e);
		},
		_onDragEnd: function (e) {
			L.Util.cancelAnimFrame(this._panRequest);
			delete this._oldLatLng;
			this._marker
				.fire('moveend')
				.fire('dragend', e);
		}
	});

	L.Editable.VertexIcon = L.DivIcon.extend({
		options: {
			iconSize: new L.Point(8, 8)
		},
		createIcon : function(oldIcon){
			var div = L.DivIcon.prototype.createIcon.call(this, oldIcon);
			var color = this.options.color;
			if(color) div.style.backgroundColor = color;
			this._div = div;
			return div;
		},
		setColor : function(color){
			if(color) this._div.style.backgroundColor = color;
		}
	});

	L.Editable.ResizeIcon = L.DivIcon.extend({
		options: {
			iconSize: new L.Point(DEFAULT_RESIZE_MARKER_SIZE, DEFAULT_RESIZE_MARKER_SIZE)
		},
		createIcon : function(oldIcon){
			var div = L.DivIcon.prototype.createIcon.call(this, oldIcon);
			var color = this.options.color;
			if(color) div.style.backgroundColor = color;
			this._div = div;
			return div;
		},
		setColor : function(color){
			if(color) this._div.style.backgroundColor = color;
		}
	});

	L.Editable.VertexMarkerClass = L.Editable.VertexMarker.extend({
		initialize: function (latlng, latlngs, editor, options) {
			this.latlng = latlng;
			this.latlngs = latlngs;
			this.editor = editor;
			L.Marker.prototype.initialize.call(this, latlng, options);
			if(options.isAddingMarker) this.options.className += " add-vertex-icon";
			this.options.icon = this.editor.tools.createResizeIcon({className: this.options.className, color : this.options.color });
			this.latlng.__vertex = this;
			this.editor.editLayer.addLayer(this);
			this.setZIndexOffset(editor.tools._lastZIndex + 1);

			//Resize
			this._point = this._map.latLngToLayerPoint(latlng);
			// origins & temporary state
			this._scaleOrigin      = null;
		    this._scale            = L.point(1, 1);
			this._initialDist      = 0;
			this._initialDistX     = 0;
			this._initialDistY     = 0;
		    // preview and transform matrix
			this._matrix          = new L.Matrix(1, 0, 0, 1, 0, 0);
			this._projectedMatrix = new L.Matrix(1, 0, 0, 1, 0, 0);
		},
		onAdd: function (map) {
			L.Marker.prototype.onAdd.call(this, map);
			if(this.options.isAddingMarker){
				L.Marker.prototype.onAdd.call(this, map);
				L.DomEvent.on(this._icon, 'mousedown touchstart', this.onMouseDown, this);
				return;
			}
			this.on('drag', this.onDrag);
			this.on('dragstart', this.onDragStart);
			this.on('dragend', this.onDragEnd);
			this.on('mouseup', this.onMouseup);
			this.on('click', this.onClick);
			this.on('contextmenu', this.onContextMenu);
			this.on('mousedown touchstart', this.onMouseDown);
			this.addMiddleMarkers();
		},
		onRemove: function (map) {
			if(this.options.isAddingMarker){
				L.DomEvent.off(this._icon, 'mousedown touchstart', this.onMouseDown, this);
				L.Marker.prototype.onRemove.call(this, map);
				return;
			}
			if (this.middleMarker) this.middleMarker.delete();
			delete this.latlng.__vertex;
			this.off('drag', this.onDrag);
			this.off('dragstart', this.onDragStart);
			this.off('dragend', this.onDragEnd);
			this.off('mouseup', this.onMouseup);
			this.off('click', this.onClick);
			this.off('contextmenu', this.onContextMenu);
			this.off('mousedown touchstart', this.onMouseDown);
			L.Marker.prototype.onRemove.call(this, map);
		},
		onDrag: function (e) {
			e.vertex = this;
			this.editor.onVertexMarkerDrag(e);
			//if(this.options.isAddingMarker) return;
			var iconPos = L.DomUtil.getPosition(this._icon),
				latlng = this._map.layerPointToLatLng(iconPos);
			this.latlng.update(latlng);
			this._latlng = this.latlng;  // Push back to Leaflet our reference.
			this.editor.refresh();
			if (this.middleMarker) this.middleMarker.updateLatLng();
			var next = this.getNext();
			if (next && next.middleMarker) next.middleMarker.updateLatLng();
		},
		onDragStart: function (e) {
			e.vertex = this;
			if(this.editor._addingMarker) this.editor._addingMarker.hide();
			this.editor.onVertexMarkerDragStart(e);
		},
		onDragEnd: function (e) {
			e.vertex = this;
			this.editor.onVertexMarkerDragEnd(e);
		},
		onClick: function (e) {
			e.vertex = this;
			this.editor.onVertexMarkerClick(e);
		},
		onMouseup: function (e) {
			L.DomEvent.stop(e);
			e.vertex = this;
			this.editor.map.fire('mouseup', e);
		},
		onContextMenu: function (e) {
			e.vertex = this;
			this.editor.onVertexMarkerContextMenu(e);
		},
		onMouseDown: function (e) {
			e.vertex = this;
			if(e.vertex.options.isAddingMarker){
				var iconPos = L.DomUtil.getPosition(this._icon),
	                latlng = this.editor.map.layerPointToLatLng(iconPos);
	            e = {
	                originalEvent: e,
	                latlng: latlng
	            };
	            if (this.options.opacity === 0) return;
	            L.Editable.makeCancellable(e);
	            //this.editor.onMiddleMarkerMouseDown(e);
				this.editor.onVertexMarkerMouseDown(e);
	            if (e._cancelled) return;
	            this.latlngs.splice(this.addingMarkerIndex(), 0, e.latlng);
	            this.editor.refresh();
	            //var icon = this._icon;
	            var marker = this.editor.addVertexMarker(e.latlng, this.latlngs);
	            this.editor.onNewVertex(marker);
	            /* Hack to workaround browser not firing touchend when element is no more on DOM */
	            /*var parent = marker._icon.parentNode;
	            parent.removeChild(marker._icon);
	            marker._icon = icon;
	            parent.appendChild(marker._icon);
	            marker._initIcon();
	            marker._initInteraction();
	            marker.setOpacity(1);*/
	            /* End hack */
	            // Transfer ongoing dragging to real marker
	            L.Draggable._dragging = false;
	            marker.dragging._draggable._onDown(e.originalEvent);
	            this.addingMarkerDelete();

				//Adding Vertex Marker를 숨겨진 상태로 추가
				this.editor.addVertexMarker(this.latlngs[0], this.latlngs, true);
				//return;
				//Click만해도 프인트가 추가되므로 업데이트가 되어야한다.
				//Zone Model을 업데이트한다.
				e.target = this.editor.feature;
				//Zone Model을 업데이트한다.
				this.editor.map.widget._dragEndZoneEvt(e);
			}
		},
		addingMarkerDelete: function () {
			this.editor.editLayer.removeLayer(this);
		},
		addingMarkerIndex: function () {
			return this.latlngs.indexOf(this.right.latlng);
		},
		show: function () {
			if(this._icon) this._icon.style.display = "block";
			//this.setZIndexOffset(this._originalzIndex);
			this.setOpacity(1);
		},
		hide: function () {
			if(this._icon) this._icon.style.display = "none";
			//if(!this._originalzIndex) this._originalzIndex = this._zIndex;
			//this.setZIndexOffset(0);
			this.setOpacity(0);
		}
	});
	//Deprecated
	L.Editable.ResizeMarkerClass = L.Editable.VertexMarkerClass.extend({
		options: {
			draggable: true,
			className: 'leaflet-div-icon leaflet-vertex-icon leaflet-vertex-resize-icon',
			restrict : "vertical"	//vertical or horizontal
		},
		_initInteraction: function () {
			if (!this.options.interactive) { return; }

			L.DomUtil.addClass(this._icon, 'leaflet-interactive');

			this.addInteractiveTarget(this._icon);

			if (L.Handler.RestrictMarkerDrag) {
				var draggable = this.options.draggable;
				if (this.dragging) {
					draggable = this.dragging.enabled();
					this.dragging.disable();
				}

				this.dragging = new L.Handler.RestrictMarkerDrag(this, { restrict : this.options.restrict });

				if (draggable) {
					this.dragging.enable();
				}
			}
		},
		_applyTransform: function(matrix) {
			this.editor.feature._transform(matrix._matrix);
			//this._rect._transform(matrix._matrix);
		},
		_cachePoints: function() {
			/*this._handlersGroup.eachLayer(function(layer) {
				layer.bringToFront();
			});*/
			var marker, markers = this.editor._resizeMarkers;
			for (var i = 0, len = markers.length; i < len; i++) {
				marker = markers[i];
				marker._initialPoint = marker._point.clone();
			}
		},
		onDragStart: function (e) {
			e.vertex = this;
			var marker = e.target;
			this.editor._activeMarker = this.editor._resizeMarkers[marker.options.index];
			this.editor._originMarker = this.editor._resizeMarkers[(marker.options.index + 2) % 4];
			var activeMarker = this.editor._activeMarker;
			var originMarker = this.editor._originMarker;
			this._scaleOrigin  = originMarker.getLatLng();

			this._initialMatrix = this._matrix.clone();
			this._cachePoints();

			this._initialDist  = originMarker._point.distanceTo(activeMarker._point);
			this._initialDistX = originMarker._point.x - activeMarker._point.x;
			this._initialDistY = originMarker._point.y - activeMarker._point.y;
			this.editor.hideEditMarkers();
			this.editor.onVertexMarkerDragStart(e);
		},
		onDrag: function (e) {
			e.vertex = this;
			this.editor.onResizeMarkerDrag(e);
			var iconPos = L.DomUtil.getPosition(this._icon);
			//latlng = this._map.layerPointToLatLng(iconPos);
			//this.latlng.update(latlng);
			//this._latlng = this.latlng;  // Push back to Leaflet our reference.
			//Scale Update
			this._point = iconPos;
			var originMarker = this.editor._originMarker;
			var originPoint = originMarker._point;
			var ratioX, ratioY;
			ratioX = this._initialDistX == 0 ? 1 : (originPoint.x - iconPos.x) / this._initialDistX;
			ratioY = this._initialDistY == 0 ? 1 : (originPoint.y - iconPos.y) / this._initialDistY;

			this._scale = new L.Point(ratioX, ratioY);
		    // update matrix
		    this._matrix = this._initialMatrix
		      .clone()
		      .scale(this._scale, originPoint);

		    this._update();
			//this.editor.refresh();
			/*if (this.middleMarker) this.middleMarker.updateLatLng();
			var next = this.getNext();
			if (next && next.middleMarker) next.middleMarker.updateLatLng();*/
		},
		onDragEnd: function (e) {
			e.vertex = this;
			this._apply();
			this.editor.refreshVertexMarkers();
			this.editor.showEditMarkers();
			this.editor.onVertexMarkerDragEnd(e);
			this.editor._activeMarker = null;
			this.editor._originMarker = null;
		},
		_update: function() {
			var matrix = this._matrix;
			var marker, markers = this.editor._resizeMarkers;
			var activeMarker = this.editor._activeMarker;
			var originMarker = this.editor._originMarker;
			var activeIndex = activeMarker.options.index;
			var originIndex = originMarker.options.index;
			var index, latlng;
			// update handlers
			for (var i = 0, len = markers.length; i < len; i++) {
				marker = markers[i];
				index = marker.options.index;
				if (index != activeIndex && index != originIndex) {
					marker._point = matrix.transform(marker._initialPoint);
					latlng = this._map.layerPointToLatLng(marker._point);
					marker.latlng.update(latlng);
					marker._latlng = latlng;
					marker.update();
					//marker._updatePath();
				}
			}

			matrix = matrix.clone().flip();

			this._applyTransform(matrix);
			//this._path.fire('transform', { layer: this._path });
		},
		_apply: function() {
		    //console.group('apply transform');
		    var map = this._map;
		    //var matrix = this._matrix.clone();
		    //var angle = this._angle;
		    //var scale = this._scale.clone();

		    this._transformGeometries();

		    // update handlers
			var latLng, marker, markers = this.editor._resizeMarkers;
		    for (var i = 0, len = markers.length; i < len; i++) {
		      marker = markers[i];
		      latLng = map.layerPointToLatLng(marker._point);
			  marker.latlng.update(latLng);
			  marker._latlng = latLng;
		      delete marker._initialPoint;
		      //marker._updatePath();
		    }

		    this._matrix = L.matrix(1, 0, 0, 1, 0, 0);
		    this._scale  = L.point(1, 1);
		    this._angle  = 0;

		    //this._updateHandlers();
		    //map.dragging.enable();
		},
		_transformGeometries: function() {
		    this.editor.feature._transform(null);
		    //this._rect._transform(null);
		    this._transformPoints(this.editor.feature);
		    //this._transformPoints(this._rect);
		},
		_transformPoint: function(latlng, matrix, map, zoom) {
			return map.unproject(matrix.transform(
				map.project(latlng, zoom)), zoom);
		},
		_transformPoints: function(path, angle, scale, rotationOrigin, scaleOrigin) {
		    var map = path._map;
		    var zoom = map.getMaxZoom() || this.options.maxZoom;
		    var i, len;

		    var projectedMatrix = this._projectedMatrix =
		      this._getProjectedMatrix(angle, scale, rotationOrigin, scaleOrigin);
		    // console.time('transform');

		    // all shifts are in-place
		    if (path._point) { // L.Circle
		      path._latlng = this._transformPoint(
		        path._latlng, projectedMatrix, map, zoom);
		    } else if (path._rings || path._parts) { // everything else
		      var rings = path._rings;
		      var latlngs = path._latlngs;
		      path._bounds = new L.LatLngBounds();

		      if (!L.Util.isArray(latlngs[0])) { // polyline
		        latlngs = [latlngs];
		      }
		      for (i = 0, len = rings.length; i < len; i++) {
		        for (var j = 0, jj = rings[i].length; j < jj; j++) {
		          latlngs[i][j].update(this._transformPoint(
		            latlngs[i][j], projectedMatrix, map, zoom));
		          path._bounds.extend(latlngs[i][j]);
		        }
		      }
		    }

		    path._reset();
		    //console.timeEnd('transform');
		},
		_getProjectedMatrix: function(angle, scale, rotationOrigin, scaleOrigin) {
		    var map    = this._map;
		    var zoom   = map.getMaxZoom() || this.options.maxZoom;
		    var matrix = L.matrix(1, 0, 0, 1, 0, 0);
		    var origin;

		    angle = angle || this._angle || 0;
		    scale = scale || this._scale || L.point(1, 1);

		    if (!(scale.x === 1 && scale.y === 1)) {
		      scaleOrigin = scaleOrigin || this._scaleOrigin;
		      origin = map.project(scaleOrigin, zoom);
		      matrix = matrix
		        ._add(L.matrix(1, 0, 0, 1, origin.x, origin.y))
		        ._add(L.matrix(scale.x, 0, 0, scale.y, 0, 0))
		        ._add(L.matrix(1, 0, 0, 1, -origin.x, -origin.y));
		    }

		    if (angle) {
		      rotationOrigin = rotationOrigin || this._rotationOrigin;
		      origin = map.project(rotationOrigin, zoom);
		      matrix = matrix.rotate(angle, origin).flip();
		    }

		    return matrix;
		}
	});

	L.PathTransform.IconHandle = L.Marker.extend({
		options: {
			className: 'leaflet-path-transform-handler'
		},
		initialize : function(latlng, options){
			//console.log("extend handle");
			var index = options.index;
			var cursorStyle = L.PathTransform.Handle.CursorsByType[index] + "-" + index;
			var anchors = [[15, 0], [15, 12], [0, 12], [0, 0]];
			this.options.icon = L.divIcon({iconAnchor : anchors[index], className : "common-map-view-zone-resizer-icon " + cursorStyle});
			L.Marker.prototype.initialize.call(this, latlng, options);
		},
		onAdd: function (map) {
			L.Marker.prototype.onAdd.call(this, map);
			if (this._icon && this.options.setCursor) { // SVG/VML
				this._icon.style.cursor = L.PathTransform.Handle.CursorsByType[
					this.options.index
				];
			}
		},
		bringToFront : function(){}
	});

	//대각선 리사이징 포인트를 기본으로 설정
	L.Handler.PathTransform.prototype.options.handleClass = L.PathTransform.IconHandle;

	//상하좌우 리사이징 포인트 커서
	L.PathTransform.Handle.ExtendedCursorsByType = [
		'ew-resize', 'ns-resize', 'ew-resize', 'ns-resize'
	];

	//상하좌우 리사이징 포인트
	L.PathTransform.HVResizeHandle = L.Marker.extend({
		options: {
			className: 'leaflet-path-transform-handler'
		},
		initialize : function(latlng, options){
			//console.log("extend handle");
			var index = options.index;
			var cursorStyle = L.PathTransform.Handle.ExtendedCursorsByType[index] + "-" + index;
			var anchors = [[12, 10], [10, 12], [0, 10], [10, 0]];
			var iconSizes = [[12, 20], [20, 12], [12, 20], [20, 12]];
			var resizeOptions = "vertical";
			if(index % 2 == 0) resizeOptions = "horizontal";
			options = $.extend(options, { resizeDirection : resizeOptions });
			this.options.icon = L.divIcon({iconAnchor : anchors[index], iconSize : iconSizes[index],
				className : "common-map-view-zone-resizer-icon hv-resizer " + cursorStyle});
			L.Marker.prototype.initialize.call(this, latlng, options);
		},
		onAdd: function (map) {
			L.Marker.prototype.onAdd.call(this, map);
			if (this._icon && this.options.setCursor) { // SVG/VML
				this._icon.style.cursor = L.PathTransform.Handle.ExtendedCursorsByType[
					this.options.index
				];
			}
		},
		bringToFront : function(){}
	});

	//상하좌우 리사이징을 포함한 상속된 Transform
	L.Handler.ExtendedPathTransform = L.Handler.PathTransform.extend({
		_createHandlers: function() {
			var map = this._map;
			this._handlersGroup = this._handlersGroup || new L.LayerGroup().addTo(map);
			this._rect = this._rect || this._getBoundingPolygon().addTo(this._handlersGroup);
			this._rect.options.pane = "tooltipPane"; // 존 편집시, 존 폴리곤 바운드를 나타내는 사각형의 zIndex 값을 존 폴리곤과 같이 맞추기 위함.
			if (this.options.scaling) {
				this._handlers = [];
				var handler, latlngs = this._rect._latlngs[0];
				var max = this.options.edgesCount;
				var i, middleLatLng, nextIndex, beforeLatLng, afterLatLng, middleLat, middleLng;
				for( i = 0; i < max; i++ ){
					//대각선 리사이징 포인트
					handler = this._createHandler(latlngs[i], i * 2, i, false);
					handler.addTo(this._handlersGroup);
					this._handlers.push(handler);
				}

				for (i = 0; i < max; i++) {
					//수평/수직 리사이징 포인트
					nextIndex = i + 1;
					if(nextIndex >= max) nextIndex = 0;
					beforeLatLng = latlngs[i];
					afterLatLng = latlngs[nextIndex];
					if(afterLatLng.lat == beforeLatLng.lat) middleLat = afterLatLng.lat;
					else middleLat = (afterLatLng.lat + beforeLatLng.lat) / 2;
					if(afterLatLng.lng == beforeLatLng.lng) middleLng = afterLatLng.lng;
					else middleLng = (afterLatLng.lng + beforeLatLng.lng) / 2;
					middleLatLng = L.latLng(middleLat, middleLng);
					handler = this._createHandler(middleLatLng, i * 2, i, true);
					handler.addTo(this._handlersGroup);
					this._handlers.push(handler);
				}
			}

			if (this.options.rotation) {
				//add rotation handler
				this._createRotationHandlers();
			}
		},
		_createHandler: function(latlng, type, index, isHVResize) {
			var HandleClass = isHVResize ? L.PathTransform.HVResizeHandle : this.options.handleClass;
			var marker = new HandleClass(latlng,
				L.Util.extend({}, this.options.handlerOptions, {
					className: 'leaflet-drag-transform-marker drag-marker--' + index + ' drag-marker--' + type,
					index:     index,
					type:      type,
					isHVResize : isHVResize,
					zIndexOffset : ZONE_RESIZE_MARKER_ZINDEX
				})
			);
			marker.on('mousedown', this._onScaleStart, this);
			return marker;
		},
		_onScaleStart: function(evt) {
		  var marker = evt.target;
		  var map = this._map;

		  map.dragging.disable();

		  this._activeMarker = marker;

		  //상하좌우 리사이징 마커일 경우 4를 더하여 인덱스 참조
		  if(marker.options.isHVResize) this._originMarker = this._handlers[(marker.options.index + 2) % 4 + 4];
		  else this._originMarker = this._handlers[(marker.options.index + 2) % 4];		//대각선 리사이징 마커 일 경우

		  this._scaleOrigin  = this._originMarker.getLatLng();

		  this._initialMatrix = this._matrix.clone();
		  this._cachePoints();

		  this._map.on('mousemove', this._onScale, this).on('mouseup',   this._onScaleEnd, this);
		  this._initialDist  = this._originMarker._point.distanceTo(this._activeMarker._point);
		  this._initialDistX = this._originMarker._point.x - this._activeMarker._point.x;
		  this._initialDistY = this._originMarker._point.y - this._activeMarker._point.y;

		  this._path.fire('transformstart', { layer: this._path }).fire('scalestart', { layer: this._path, scale: L.point(1, 1) });

		  if(this._handleLine) this._map.removeLayer(this._handleLine);
		  if(this._rotationMarker) this._map.removeLayer(this._rotationMarker);
		  //this._handleLine = this._rotationMarker = null;
	    },
		_onScale: function(evt) {
		  var originPoint = this._originMarker._point;
		  var ratioX, ratioY;
		  if(this._activeMarker.options.resizeDirection == "vertical"){
			  ratioX = 1;
			  ratioY = (originPoint.y - evt.layerPoint.y) / this._initialDistY;
		  }else if(this._activeMarker.options.resizeDirection == "horizontal"){
			  ratioY = 1;
			  ratioX = (originPoint.x - evt.layerPoint.x) / this._initialDistX;
		  }else if (this.options.uniformScaling) {
			  ratioX = originPoint.distanceTo(evt.layerPoint) / this._initialDist;
			  ratioY = ratioX;
		  } else {
			  ratioX = (originPoint.x - evt.layerPoint.x) / this._initialDistX;
			  ratioY = (originPoint.y - evt.layerPoint.y) / this._initialDistY;
		  }

		  this._scale = new L.Point(ratioX, ratioY);

		  // update matrix
		  this._matrix = this._initialMatrix.clone().scale(this._scale, originPoint);

		  this._update();
		  this._path.fire('scale', { layer: this._path, scale: this._scale.clone() });
	    }
	});

	L.Path.addInitHook(function() {
		if (this.options.transform) {
			this.transform = new L.Handler.ExtendedPathTransform(this, this.options.transform);
		}
	});

	L.Editable.ZoneEditorClass = L.Editable.PathEditor.extend({
		CLOSED: true,
		MIN_VERTEX: 3,
		addHooks: function () {
			L.Editable.BaseEditor.prototype.addHooks.call(this);
			if (this.feature) this.initVertexMarkers();
			if (this.feature.transform) this._initResizeMarkers();
			return this;
		},
		initVertexMarkers: function (latlngs) {
			if (!this.enabled()) return;
			latlngs = latlngs || this.getLatLngs();
			if (isFlat(latlngs)) this.addVertexMarkers(latlngs);
			else for (var i = 0; i < latlngs.length; i++) this.initVertexMarkers(latlngs[i]);
		},
		setMarkersColor : function(color){
			var marker, i, max = this._editMarkers.length;
			for( i = 0; i < max; i++ ){
				marker = this._editMarkers[i];
				if(marker._icon) marker._icon.style.backgroundColor = color;
			}
			max = this._resizeMarkers.length;
			for( i = 0; i < max; i++ ){
				marker = this._resizeMarkers[i];
				if(marker._icon) marker._icon.style.backgroundColor = color;
			}
			if(this._addingMarker && this._addingMarker._icon) this._addingMarker._icon.style.backgroundColor = color;
		},
		addVertexMarkers: function (latlngs) {
			this._editMarkers = [];
			this._resizeMarkers = [];

			for (var i = 0; i < latlngs.length; i++) {
				//Resize Point
				//Deperecated Vertex Marker로 변경되고, Marker 추가/삭제로 변경
				/*if(i == 4 || i == 9 || i == 14 || i == 19){
					this.addResizeMarker(latlngs[i], latlngs, i);
					continue;
				}*/
				this.addVertexMarker(latlngs[i], latlngs);
			}
			this.addVertexMarker(latlngs[0], latlngs, true);
		},
		addVertexMarker: function (latlng, latlngs, isAddingMarker) {
			var VertexMarkerClass = this.tools.options.vertexMarkerClass;
			var zonePolygon = this.feature;
			var zone = zonePolygon.zone;
			var color = zone.backgroundColor;
			var opt = { color : color, isAddingMarker : isAddingMarker, zIndexOffset : ZONE_TRANSFORM_MARKER_ZINDEX, pane: 'tooltipPane' };
			//if(isAddingMarker) opt.draggable = false;
			var vertexMarkerClass = new VertexMarkerClass(latlng, latlngs, this, opt);
			if(isAddingMarker){
				this._addingMarker = vertexMarkerClass;
				this._addingMarker.hide();
			}else{
				this._editMarkers.push(vertexMarkerClass);
			}
			return vertexMarkerClass;
		},
		addResizeMarker : function(latlng, latlngs, index){
			var opt = { restrict : "vertical" };
			if(index == 4 || index == 14){
				opt.restrict = "horizontal";
			}
			//Marker의 Index 리사이징 시, 반대편 포인트의 기준을 잡기 위해 필요
			opt.index = index % 4;
			var ResizeMarkerClass = this.tools.options.resizeMarkerClass;
			var zonePolygon = this.feature;
			var zone = zonePolygon.zone;
			opt.color = zone.backgroundColor;
			var resizeMarker = new ResizeMarkerClass(latlng, latlngs, this, opt);
			this._resizeMarkers.push(resizeMarker);
			return resizeMarker;
		},
		//deprecated
		_reApplyVerteMarkers : function(){
			var feature = this.feature;
			var latlngs = feature.getLatLngs();
			var i, max, editMarkers = this._editMarkers, resizeMarkers = this._resizeMarkers;
			if(latlngs[0] && latlngs[0][0] && !latlngs[0][0].__vertex){
				latlngs = latlngs[0];
				var latlng;
				var editMarker, resizeMarker;
				max = editMarkers.length;
				for( i = 0; i < max; i++ ){
					editMarker = editMarkers[i];
					latlng = latlngs[editMarker.options.index];
					latlng.__vertex = editMarker;
					editMarker.latlng = latlng;
					editMarker.latlngs = [latlngs];
				}
				max = resizeMarkers.length;
				for( i = 0; i < max; i++ ){
					resizeMarker = resizeMarkers[i];
					latlng = latlngs[resizeMarker.options.index];
					latlng.__vertex = resizeMarker;
					resizeMarker.latlng = latlng;
					resizeMarker.latlngs = [latlngs];
				}
			}
		},
		//deprecated
		_refreshVertexMarkers : function(){
			var editMarkers = this._editMarkers, resizeMarkers = this._resizeMarkers;
			var i, max = editMarkers.length;
			for( i = 0; i < max; i++ ){
				editMarkers[i].update();
			}
			max = resizeMarkers.length;
			for( i = 0; i < max; i++ ){
				resizeMarkers[i].update();
			}
		},
		hideEditMarkers : function () {
			var editMarker, editMarkers = this._editMarkers;
			for (var i = 0; i < editMarkers.length; i++) {
				editMarker = editMarkers[i];
				editMarker.setOpacity(0);
			}
		},
		showEditMarkers : function () {
			var editMarker, editMarkers = this._editMarkers;
			for (var i = 0; i < editMarkers.length; i++) {
				editMarker = editMarkers[i];
				editMarker.setOpacity(1);
			}
		},
		getLatLngs: function () {
			return this.feature.getLatLngs();
		},
		_initResizeMarkers : function(){
			//console.log("attachreszie");
			var zonePolygon = this.feature;
			//var transform = zonePolygon.transform;
			zonePolygon.off("scalestart");
			zonePolygon.off("scale");
			zonePolygon.off("scaleend");
			zonePolygon.on("scalestart", this.onScaleStart.bind(this));
			zonePolygon.on("scale", this.onScale.bind(this));
			zonePolygon.on("scaleend", this.onScaleEnd.bind(this));
		},
		onScaleStart : function(e){
			this.editLayer.clearLayers();
			e.target = this.feature;
			e.isMarkerDrag = true;
			this.map.widget._dragStartZoneEvt(e);
		},
		onScale : function(e){},
		onScaleEnd : function(e){
			this.initVertexMarkers();
			e.target = this.feature;
			e.isMarkerDrag = true;
			this.map.widget._dragEndZoneEvt(e);
		},
		onResizeMarkerDrag: function (e) {
			this.onMove(e);
			if (this.feature._bounds) this.extendBounds(e);
			this.fireAndForward('editable:vertex:drag', e);
		},
		getDefaultLatLngs: function () {
			if (!this.feature._latlngs.length) this.feature._latlngs.push([]);
			return this.feature._latlngs[0];
		},
		onVertexDeleted: function (e) {
			var i, max = this._editMarkers;
			for( i = max - 1; i >= 0; i-- ){
				if(this._editMarkers[i] === e.vertex){
					this._editMarkers.splice(i, 1);
				}
			}
			this.fireAndForward('editable:vertex:deleted', e);
		},
		onVertexRawMarkerClick: function (e) {
			this.fireAndForward('editable:vertex:rawclick', e);
			if (e._cancelled)
			//if (!this.vertexCanBeDeleted(e.vertex)) return;
		},
		onVertexMarkerCtrlClick: function (e) {
			this.fireAndForward('editable:vertex:ctrlclick', e);
		},
		onVertexMarkerShiftClick: function (e) {
			this.fireAndForward('editable:vertex:shiftclick', e);
			if (!this.vertexCanBeDeleted(e.vertex)) return;
			var editor = this.feature.editor;
			editor._addingMarker.hide();
			//Vertex Marker를 삭제한다.
			e.vertex.delete();
			//Vertex Marker를 삭제 이후, 달라진 transform 의 path bounds 값을 업데이트 한다.
			this.feature.transform._path._bounds._northEast = null;
			this.feature.transform._path._bounds._southWest = null;
			this.feature.transform.reset();
			//Zone Model을 업데이트한다.
			e.target = e.target.editor.feature;
			this.map.widget._dragEndZoneEvt(e);
		},
		onDragEnd: function (e) {
			this.initVertexMarkers();
			L.Editable.BaseEditor.prototype.onDragEnd.call(this, e);
		},
		onVertexMarkerDragStart: function (e) {
			e.target = this.feature;
			e.isMarkerDrag = true;
			this.map.widget._dragStartZoneEvt(e);
			this.fireAndForward('editable:vertex:dragstart', e);
		},
		onVertexMarkerDrag: function (e) {
			this.onMove(e);
			if (this.feature._bounds) this.extendBounds(e);
			//if (this.feature.transform) this.feature.transform.reset();
			this.fireAndForward('editable:vertex:drag', e);
		},
		onVertexMarkerDragEnd: function (e) {
			e.target = this.feature;
			e.isMarkerDrag = true;
			this.map.widget._dragEndZoneEvt(e);
			if (this.feature._bounds) this.extendBounds(e);
			if (this.feature.transform) this.feature.transform.reset();
			// 맵영역 박으로 버텍스 마커가 나간 경우, transform reset() 호출 이후에 트갠스폼 영역이 밖으로 나가는 문제 발생.
			// 이를 해결하기 위해 _dragEndZoneEvt 함수 재호출.
			this.map.widget._dragEndZoneEvt(e);
			this.fireAndForward('editable:vertex:dragend', e);
		},
		extendBounds: function (e) {
			//var bounds = this.feature._bounds;
			//존재하지 않는 좌표의 업데이트
			var latlngs = this.feature.getLatLngs();
			//this.feature._setLatLngs(latlngs);
			latlngs = latlngs[0];
			var i, max = latlngs.length;
			this.feature._bounds = L.latLngBounds();
			for( i = 0; i < max; i++ ){
				this.feature._bounds.extend(latlngs[i]);
			}
			this.feature._bounds.extend(e.vertex.latlng);
		},
		onEnable: function () {
			var elem = this.feature.getElement();
			//this.feature.on("mousemove", this.onMouseMove);
			this._onMouseMove = this.onMouseMove.bind(this);
			this._onMouseOut = this.onMouseOut.bind(this);
			$(elem).on("mousemove", this._onMouseMove);
			$(elem).on("mouseout", this._onMouseOut);
			this.fireAndForward('editable:enable');
		},
		onDisable: function () {
			var elem = this.feature.getElement();
			//this.feature.off("mousemove", this.onMouseMove);
			$(elem).off("mousemove", this._onMouseMove);
			$(elem).off("mouseout", this._onMouseOut);
			this._onMouseMove = null;
			this.fireAndForward('editable:disable');
		},
		_getVertexBoundsFromMarker : function(latlng, iconSize){	//Marker의 좌표에서 Icon Size를 고려하여 사각형 Bounds를 얻는다.
			var zonePolygon = this.feature, editor = zonePolygon.editor, map = editor.map;
			var zoom = map.getZoom();
			var iconLatLng = map.unproject(iconSize, zoom);
			var iconLatHalf = iconLatLng.lat / 2;
			var iconLngHalf = iconLatLng.lng / 2;
			//Vertex Icon의 SouthWest, NorthEast
			var southWest = L.latLng(latlng.lat + iconLatHalf, latlng.lng - iconLngHalf);
			var northEast = L.latLng(latlng.lat - iconLatHalf, latlng.lng + iconLngHalf);
			var vertexBounds = L.latLngBounds(southWest, northEast);
			return vertexBounds;
		},
		onMouseOut : function(e){
			//마우스 포인터가 영역 밖을 벗어났을 경우 추가 포인트를 숨긴다.
			var zonePolygon = this.feature, editor = zonePolygon.editor, map = editor.map, widget = map.widget;
			if(zonePolygon._isDragging) return;
			if(editor._addingMarker){
				//Marker에서 마우스가 벗어났을 경우에만 Hide한다.
				/*var mousePointerLatLng = map.mouseEventToLatLng(e);
				var latLng = editor._addingMarker.getLatLng();
				var iconSize = editor._addingMarker.options.icon.options.iconSize;
				var vertexBounds = this._getVertexBoundsFromMarker(latLng, iconSize);
				if(!vertexBounds.contains(mousePointerLatLng)) editor._addingMarker.hide();*/
				widget._isMouseOutZone = true;
				widget._mouseOutZoneAddingMarker = editor._addingMarker;
			}
		},
		onMouseMove : function(e){
			//console.log(e);
			var zonePolygon = this.feature, editor = zonePolygon.editor, map = editor.map, widget = map.widget;
			//Zone Drag 중에는 동작하지 않는다.
			if(zonePolygon._isDragging) return;
			var mousePointerLatLng = map.mouseEventToLatLng(e);
			var iconSize = editor._addingMarker.options.icon.options.iconSize;
			var vertexBounds = this._getVertexBoundsFromMarker(mousePointerLatLng, iconSize);

			var zoneLatLngs = this.getLatLngs();
			zoneLatLngs = zoneLatLngs[0];

			//Zone Polygon 라인에 겹치는지 체크한다.
			var i, max = zoneLatLngs.length;
			var latLng1, latLng2;
			var vertexBounds1, vertexBounds2;
			var isIntersect, intersectionPoints;
			for( i = 0; i < max; i++ ){
				latLng1 = zoneLatLngs[i];

				if(i == (max - 1)) latLng2 = zoneLatLngs[0];	//마지막 라인을 체크한다.
				else latLng2 = zoneLatLngs[i + 1];

				vertexBounds1 = this._getVertexBoundsFromMarker(latLng1, iconSize);
				vertexBounds2 = this._getVertexBoundsFromMarker(latLng2, iconSize);

				//다른 Vertex Marker 아이콘들과 충돌하는지 체크한다. 출동할 경우 Pass.
				if(vertexBounds.intersects(vertexBounds1) || vertexBounds.intersects(vertexBounds2)){
					isIntersect = false;
					break;
				}
				intersectionPoints = widget.isIntersectLineRectangle(latLng1, latLng2, vertexBounds);
				//console.log(intersectionPoints);
				if(intersectionPoints.length > 0){
					editor._addingMarker.left = latLng1.__vertex;
					editor._addingMarker.right = latLng2.__vertex;
					isIntersect = true;
					break;
				}else{
					isIntersect = false;
				}
			}

			//console.log(mousePointerLatLng);
			//Adding(새로운 포인트 추가 가이드용) Vertex Marker를 보이게한다.
			if(isIntersect){
				//console.log("intersect");
				//라인과 겹칠 경우 라인과 교차하는 점을 중심으로 Marker를 이동한다.
				if(intersectionPoints.length == 2){
					latLng1 = intersectionPoints[0];
					latLng2 = intersectionPoints[1];
					mousePointerLatLng.lat = (latLng1.lat + latLng2.lat) / 2;
					mousePointerLatLng.lng = (latLng1.lng + latLng2.lng) / 2;
				}

				editor._addingMarker.show();
			}else{	//Adding(새로운 포인트 추가 가이드용) Vertex Marker를 안보이게한다.
				//console.log("nointsersect");
				editor._addingMarker.hide();
			}
			//마우스를 따라 Marker 이동
			editor._addingMarker.setLatLng(mousePointerLatLng);
		}
	});

	L.ZoneEditable = L.Editable.extend({
		createVertexIcon: function (options) {
			//return L.Browser.touch ? new L.Editable.TouchVertexIcon(options) : new L.Editable.VertexIcon(options);
			options.color = options.color ? options.color : "rgb(0, 129, 198)";
			return new L.Editable.VertexIcon(options);
		},
		createResizeIcon: function (options) {
			//return L.Browser.touch ? new L.Editable.TouchVertexIcon(options) : new L.Editable.VertexIcon(options);
			options.color = options.color ? options.color : "rgb(0, 129, 198)";
			return new L.Editable.ResizeIcon(options);
		}
	});

	var Template = {
		deviceTextbox : function(id, name, isAsset, current, desired){
			var assetCss = isAsset ? "asset" : "";
			//Asset의 이름은 줄바꿈을 허용하도록한다. (자산 이름과 서브 자산 이름 표시를 위한 임시 구현)
			var textHtml = "<div class='device-info-text device-id-" + id + "'>";
			textHtml += "<div class='text'>";

			if(typeof current !== "undefined" && current !== null) textHtml += "<span class='tem color'>" + current + "</span>";
			if(typeof desired !== "undefined" && desired !== null) textHtml += "/ <span class='tem'>" + desired + "</span>";

			textHtml += "</div><div class='name' " + assetCss + ">" + name + "</div>";
			textHtml += "</div>";

			return textHtml;
		}
	};

	var CommonMapView = Widget.extend({
		events : [
			"change",
			"dragstart",
			"dragend",
			"drop",
			"movestart",
			"moveend"
		],
		options : {
			name : "CommonMapView",
			dataSource : [],
			zoneDataSource : [],
			heatMapDataSource : [],
			hasSelectedModel : true,
			deviceIconSize : DEFAULT_DEVICE_ICON_SIZE,
			measuredDeviceIconSize : DEFAULT_MEASURED_DEVICE_ICON_SIZE,
			//deviceIconRadius : 17,
			deviceIconRadius : 2.125,
			width : "100%",
			height : "100%",
			floor : null,
			mapImageWidth : null,
			mapImageHeight : null,
			mapImageUrl : null,
			mapImage : null,
			isRegisterView : false,
			isForcedShowDevice : false,
			isDetailPopupView : false,
			canDragDeviceIcon : null,
			showRegisteredGateway : false,
			showDeviceText : true,
			showDeviceValue : null,
			showDeviceNameCheckbox : true,
			showDeviceInfoCheckbox : true,
			showZoneNameCheckbox : true,
			isMonitoringFloorImage : true,	//기기 등록, 이동, Zone 편집이 아닐 경우
			temperatureUnit : null,
			heatMapOptions : null,
			hasFullScreenControl : true,
			hasLegendControl : true,
			hasZoomControl : true,
			hasDefaultZoomControl : true,
			hasColorPickerControl : true,
			hasLayerControl : true,
			zoneColorOptions : {
				"NotSelected" : {
					//Storke
					color : "rgb(0,129,198)",
					weight : 2,
					opacity : 1,
					lineJoin : "bevel",
					//fillColor : "rgb(0, 0, 0)",
					fillColor : "rgb(0, 129, 198)",
					fillOpacity : "0.1",
					fillRule : "nonzero",
					className : "common-map-view-zone"
				},
				"Selected" : {
					color : "rgb(0,129,198)",
					weight : 2,
					opacity : 1,
					lineJoin : "bevel",
					fillColor : "rgb(0, 129, 198)",
					fillOpacity : "0.35",
					fillRule : "nonzero",
					className : "common-map-view-zone selected"
				}
			},
			zoneNameOptions : {
				className : "common-map-view-zone-name",
				iconAnchor : [10, 20]
				/*direction : "center",
                permanent : true,
                interactive : true,
                offset : [0, 0],
                opacity : 1*/
			},
			deviceStrokeColorOptions : {
				"Selected" : {
					color : "rgb(0,129,198)",
					weight : 10,
					opacity : 0.4
				},
				"NotSelected" : {
					color : "rgb(0,0,0)",
					weight : 0,
					opacity : 0.4
				}
			},
			deviceColorOptions : {
				"Normal.On" : "rgb(26,160,90)",
				"Normal.Off" : "rgb(69,69,69)",
				"Alarm.Warning" : "rgb(255,164,31)",
				"Alarm.Critical" : "rgb(239,43,43)",
				"Selected" : "rgb(0, 129, 198)",
				"NotSelected" : "rgb(178, 178, 178)"
			},
			movableBeaconColorOptions : {
				"Normal.On" : "url(#beacon-normal-on)",
				"Alarm.Warning" : "url(#beacon-alarm-warning)",
				"Alarm.Critical" : "url(#beacon-alarm-critical)",
				"Selected" : "url(#beacon-selected)",
				"NotSelected" : "url(#beacon-notselected)"
			},
			deviceTypeImageName : {
				Outdoor : 'ic-sacoutdoor30',
				Indoor : 'ic-sacindoor30',
				Meter : 'ic-meter30',
				Motion : 'ic-motion30',
				Gateway : 'ic-gateway30',
				Beacon : 'ic-ble30',
				CCTV : 'ic-cctv30',
				Asset : 'ic-meter30',
				Light : 'ic-light30',
				Temp : 'ic-temp30',
				AI : 'ic-dvc-ai',
				AO : 'ic-dvc-ao',
				AV : 'ic-dvc-av',
				DI : 'ic-dvc-di',
				DO : 'ic-dvc-do',
				DV : 'ic-dvc-dv',
				SmartPlug : 'ic-power30'
			},
			deviceModeImageName : {
				Cool:'ic-cool',
				Auto:'ic-auto',
				Heat:'ic-heat',
				Dry:'ic-dry',
				Fan:'ic-fan',
				Off:'ic-attention',
				CoolStorage:'ic-coolwater',
				HotWater:'ic-hotwater',
				HeatExchange : 'ic-heat-ex',
				ByPass : 'ic-heat-bypass',
				Sleep : 'ic-heat-sleep',
				Eco : 'ic-dhw-eco',
				Standard : 'ic-dhw-standard',
				Power : 'ic-dhw-power',
				Force : 'ic-dhw-force'
			},
			assetTypeImageName : {
				computer : "ic-computation30",
				computation : "ic-computation30",
				office : "ic-office30",
				medical : "ic-medical30",
				power : "ic-power30",
				firefighting : "ic-firefighting30",
				security : "ic-security30",
				network : "ic-network30",
				hvac : "ic-hvac30",
				etc : "ic-etc30"
			},
			beaconImageName : {
				"Normal.On" : "drop-green",
				"Alarm.Warning" : "drop-yellow",
				"Alarm.Critical" : "drop-red",
				"Selected" : "drop-blue",
				"NotSelected" : "drop-gray"
			},
			//타 모듈에서 맵 뷰의 기본 사이즈를 얻기위하여 쓰인다.
			DEFAULT_WIDTH_SIZE : DEFAULT_WIDTH_SIZE,
			DEFAULT_HEIGHT_SIZE : DEFAULT_HEIGHT_SIZE
		},
		init : function(element, options){
			if($(element).data("kendoCommonMapView")){
				$(element).data("kendoCommonMapView").destroy();
			}

			kendo.ui.Widget.fn.init.call(this, element, options);
			this._initOptions();
			this._initSvgElements();
			this._initLeaflet();
			this._initLeafletControls();
			this._setMapImage();
			this._createDataSource();
			this._attachEventHandler();
			this._renderZones();
			this._renderDevices();
		},
		_initOptions : function(){
			var self = this, options = self.options;
			//기기 값 표시 및 기기 드래그 앤 드롭 이벤트에 대한 설정된 옵션 값이 없을 경우, ,Facility -> Device 기능 사양에 따라 자동으로 설정.
			if(options.showDeviceValue === null){
				if(options.isRegisterView) options.showDeviceValue = false;
				else options.showDeviceValue = true;
			}

			if(options.canDragDeviceIcon === null){
				if(options.isRegisterView) options.canDragDeviceIcon = true;
				else options.canDragDeviceIcon = false;
			}

			if(options.canDragDeviceIcon) options.isMonitoringFloorImage = false;

			if(!options.temperatureUnit){
				var tempSettings = Settings.getTemperature();
				options.temperatureUnit = tempSettings.unit === "Fahrenheit" ? Util.CHAR["Fahrenheit"] : Util.CHAR["Celsius"];
			}
		},
		_initLeaflet : function(){
			var self = this, element = this.element;
			element.addClass("common-map-view");

			if(self.map) self.map.destroy();

			self.map = L.map(element.get(0), {
				minZoom : DEFAULT_MIN_ZOOM_SIZE,
				maxZoom : DEFAULT_MAX_ZOOM_SIZE,
				boxZoom : false,
				zoom : DEFAULT_ZOOM_SIZE,
				crs : L.CRS.Simple,
				scrollWheelZoom: true,
				zoomAnimation : true,
				fadeAnimation : true,
				markerZoomAnimation : true,
				doubleClickZoom : false,
				zoomControl : false,
				zoomDelta : DEFAULT_ZOOM_DELTA,
				zoomSnap : DEFAULT_ZOOM_SNAP,
				editToolsClass : L.ZoneEditable,
				editable : true,
				editOptions : {
					skipMiddleMarkers : true,
					polygonEditorClass : L.Editable.ZoneEditorClass,
					resizeMarkerClass : L.Editable.ResizeMarkerClass,
					vertexMarkerClass : L.Editable.VertexMarkerClass
				}
				//padding : [40, 40]
				//center: [0, 0],
				//crs : L.CRS.Simple
				//crs : L.CRS.Direct
			});
			self.map.widget = self;
		},
		_initLeafletControls : function(){
			var self = this, options = self.options, map = self.map;
			var hasZoomControl = options.hasZoomControl, hasFullScreenControl = options.hasFullScreenControl,
				hasLegendControl = options.hasLegendControl, hasDefaultZoomControl = options.hasDefaultZoomControl,
				hasColorPickerControl = options.hasColorPickerControl, hasLayerControl = options.hasLayerControl;
			//get checked info from Local Storage Per User ID
			var showRegisteredGateway = options.showRegisteredGateway;
			var showDeviceInfoCheckbox = options.showDeviceInfoCheckbox;
			var showDeviceNameCheckbox = options.showDeviceNameCheckbox;
			var showZoneNameCheckbox = options.showZoneNameCheckbox;

			if(hasFullScreenControl){
				self.fullScreenControl = L.control.fullScreen();
				self.fullScreenControl.addTo(map);
			}

			if(hasLegendControl){
				self.legendControl = L.control.legend();
				self.legendControl.addTo(map);
			}

			if(hasZoomControl){
				self.zoomControl = L.control.extendZoom();
				self.zoomControl.addTo(map);
			}

			if(hasDefaultZoomControl){
				self.defaultZoomControl = L.control.defaultZoom();
				self.defaultZoomControl.addTo(map);
			}

			if(hasColorPickerControl){
				self.colorPickerControl = L.control.colorPicker();
				self.colorPickerControl.addTo(map);
			}

			if(hasLayerControl){
				self.layerControl = L.control.layer({
					showRegisteredGateway : showRegisteredGateway,
					showDeviceInfoCheckbox : showDeviceInfoCheckbox,
					showDeviceNameCheckbox : showDeviceNameCheckbox,
					showZoneNameCheckbox : showZoneNameCheckbox
				});
				self.layerControl.addTo(map);
			}
		},
		_initSvgElements : function(){
			var self = this;
			self.wrapper = self.element;
			self.svgElem = $(document.createElementNS(SVG_NAMESPACE, "svg"));
			var svgDefsElem = $(document.createElementNS(SVG_NAMESPACE, "defs"));
			self.svgDefsElem = svgDefsElem;
			self.svgElem.append(svgDefsElem);
			self.svgElem.prependTo(self.element);
			self._createMovableDeviceImageFilter();
		},
		_createMovableDeviceImageFilter : function(){
			//Movable Type의 물방울 모양 아이콘 필터를 생성한다.
			var self = this, options = self.options;
			var beaconImageName = self.options.beaconImageName;
			var key, img, pattern, imgName;
			for( key in beaconImageName ){
				imgName = beaconImageName[key];
				pattern = document.createElementNS(SVG_NAMESPACE, 'pattern');
				key = key.replace(".", "-").toLowerCase();
				pattern.setAttribute('id', 'beacon-' + key);
				pattern.setAttribute('width', "100%");
				pattern.setAttribute('height', "100%");
				img = document.createElementNS(SVG_NAMESPACE, 'image');
				img.setAttribute('x', 0);
				img.setAttribute('y', 0);
				img.setAttribute('width', options.deviceIconSize);
				img.setAttribute('height', options.deviceIconSize);
				img.setAttribute('href', Util.addBuildDateQuery('../../src/main/resources/static-dev/images/icon/' + imgName + '.png'));
				$(pattern).append(img).appendTo(self.svgDefsElem);
			}
		},
		_createDataSource : function(){
			var options = this.options;
			var zones = options.zoneDataSource;
			var devices = options.dataSource;
			var coordinates = options.heatMapDataSource;
			this._createZoneDataSource(zones);
			this._createDeviceDataSource(devices);
			this._createHeatMapDataSource(coordinates);
		},
		_createZoneDataSource : function(zones){
			var self = this, ds;
			if(!zones) zones = [];
			if(zones instanceof kendo.data.DataSource){
				this.zoneDataSource = zones;
			}else{
				ds = new kendo.data.DataSource({ data : zones });
				ds.read();
				this.zoneDataSource = ds;
			}
			self.zoneDataSource.bind("change", self._changeZoneDataSourceEvt.bind(self));
		},
		_createDeviceDataSource : function(devices){
			var self = this, ds;
			if(!devices) devices = [];
			if(devices instanceof kendo.data.DataSource){
				this.dataSource = devices;
			}else{
				ds = new kendo.data.DataSource({ data : devices });
				ds.read();
				this.dataSource = ds;
			}
			self.dataSource.bind("change", self._changeDataSourceEvt.bind(self));
		},
		_createHeatMapDataSource : function(coordinates){
			var self = this, ds;
			if(!coordinates) coordinates = [];
			if(coordinates instanceof kendo.data.DataSource){
				this.heatMapDataSource = coordinates;
			}else{
				ds = new kendo.data.DataSource({ data : coordinates });
				ds.read();
				this.heatMapDataSource = ds;
			}
			self.dataSource.bind("change", self._changeHeatMapDataSourceEvt.bind(self));
		},
		_attachEventHandler : function(){
			var self = this;
			var clickZoneEvtFunc = self._clickZoneEvt.bind(self);
			self.element.on("click", ".common-map-view-zone", clickZoneEvtFunc);
			var clickZoneNameEvtFunc = self._clickZoneNameEvt.bind(self);
			self.element.on("click", ".common-map-view-zone-name", clickZoneNameEvtFunc);

			var clickDeviceEvtFunc = self._clickDeviceEvt.bind(self);
			self.element.on("click", ".common-map-view-device-icon", clickDeviceEvtFunc);
			self.element.on("click", ".common-map-view-device-text", clickDeviceEvtFunc);

			var mouseMoveMapEvt = self._mouseMoveMapEvt.bind(self);
			self.map.on("mousemove", mouseMoveMapEvt);
			//self.map.on('zoomend', self._zoomEndResizeElementEvt.bind(self));
			self._resizeSidebarEvt = self._resizeMainSidebarEvt.bind(self);
			$(window).on("changeSidebarState", self._resizeSidebarEvt);
		},
		_resizeMainSidebarEvt : function(){
			var self = this;
			self._invalidateMapSize();
		},
		_mouseMoveMapEvt : function(e){
			var self = this;
			//Zone을 벗어났을 경우 포인트 추가 Vertex Marker를 Hide한다.
			if(self._isEditableZone && self._isMouseOutZone){
				//Marker 영역에서 마우스가 벗어났을 경우에만 Hide한다.
				var mousePointerLatLng = e.latlng;
				var editor = self._mouseOutZoneAddingMarker.editor;
				var zonePolygon = editor.feature;
				//Drag 중일 때 return
				if(zonePolygon._isDragging) return;
				//disable 상태일 때 return
				if(!zonePolygon.editor) return;
				var latLng = self._mouseOutZoneAddingMarker.getLatLng();
				var iconSize = self._mouseOutZoneAddingMarker.options.icon.options.iconSize;
				var vertexBounds = editor._getVertexBoundsFromMarker(latLng, iconSize);
				if(!vertexBounds.contains(mousePointerLatLng)){
					self._isMouseOutZone = false;
					self._mouseOutZoneAddingMarker.hide();
					self._mouseOutZoneAddingMarker = null;
				}
			}
		},
		_changeDataSourceEvt : function(e){
			//View에 보이는 상태만 업데이트 한다.
			var self = this, items = e.items, i, max;
			if(e.action == "itemchange"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					self.updateDeviceIcon(items[i]);
				}
			}else if(e.action == "add"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					self.renderDevice(items[i]);
				}
			}else if(e.action == "remove"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					self.removeDevice(items[i]);
				}
			}else if(self._isCancelChanges){	//DataSource의 cancelChanges 호출 시 처리
				self.setDataSource(items);
			}else if(items){	//filter()를 통하여 필터를 적용하거나, data() 함수를 통하여 Data를 Set하였을 경우 다시 렌더링한다.
				self._renderDevices();
			}
		},
		updateDeviceIcon : function(device){
			var self = this;
			var i, max, deviceMarkerZIndex, infoMarkerZIndex, deviceMarker;
			var layer, layers = self.deviceLayerGroup.getLayers();
			max = layers.length;
			for( i = 0; i < max; i++ ){
				layer = layers[i];
				if(layer instanceof L.Marker && layer.device.id == device.id){
					deviceMarkerZIndex = layer._zIndex;
					infoMarkerZIndex = layer.infoMarker._zIndex;
					self._removeDeviceIcon(layer);
					deviceMarker = self.renderDevice(device);
					deviceMarker.setZIndexOffset(deviceMarkerZIndex);
					deviceMarker.infoMarker.setZIndexOffset(infoMarkerZIndex);
				}
			}
		},
		_changeZoneDataSourceEvt : function(e){
			var self = this, items = e.items, i, max;
			var ds = e.sender;
			//View에 보이는 상태만 업데이트 한다.
			if(e.action == "itemchange"){
				max = items.length;
				if(e.field) self._isMissingZone = true;
				for( i = 0; i < max; i++ ){
					self._addChangedData(self._changedZones, items[i], e.field);
					self.updateZonePolygon(items[i]);
				}
				if(e.field) self._isMissingZone = false;
			}else if(e.action == "add"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					//Zone 생성
					items[i]._isNew = true;
					self._addChangedData(self._changedZones, items[i]);
					self.renderZone(items[i]);
				}
			}else if(e.action == "remove"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					//Zone 삭제
					self._addChangedData(self._changedZones, items[i], null, true);
					self.removeZone(items[i]);
				}
			}else if(self._isCancelChanges){	//DataSource의 cancelChanges 호출 시 처리
				self.setZoneDataSource(items);
			}else if(ds.filter()){
				self._renderZones();
			}
		},
		updateZonePolygon : function(zone){
			var self = this;
			var i, max;
			var layer, layers = self.zoneLayerGroup.getLayers();
			max = layers.length;
			for( i = 0; i < max; i++ ){
				layer = layers[i];
				if(layer instanceof L.Polygon && layer.zone.id == zone.id){
					self._removeZonePolygon(layer);
					self.renderZone(zone);
				}
			}
		},
		_changeHeatMapDataSourceEvt : function(e){
			var self = this, items = e.items, i, max;
			//View에 보이는 상태만 업데이트 한다.
			if(e.action == "itemchange"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					//self.updateZonePolygon(items[i]);
				}
			}else if(e.action == "add"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					//self.renderZone(items[i]);
				}
			}else if(e.action == "remove"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					//self.removeZone(items[i]);
				}
			}

			//Model 확정 후 수정 필요
			self._renderHeatMap();
		},
		_setMapImage : function(){
			var self = this, options = this.options, floor = options.floor;
			if(floor){
				options.mapImageUrl = floor.imageUrl;
				options.mapImageWidth = floor.imageWidth;
				options.mapImageHeight = floor.imageHeight;
			}

			self._setMapViewSize();
			self._updateMaxBounds();
			//console.log("maxWidth : " + self.maxWidth);
			//console.log("maxHeight : " + self.maxHeight);
			self._imagePosX = 0;
			self._imagePosY = 0;

			if(self.imageOverlay){
				self.imageOverlay.remove();
				self.imageOverlay = null;
			}
			if(self.options.mapImageUrl) self._renderImage();

			self.moveCenterView();
		},
		//Router View가 Hide 되어있을 경우 Leaflet에서 사이즈를 제대로 계산하지 못하는 Case가 있으므로
		//존, 디바이스, 이미지 렌더링 시 현재 사이즈 체크하여 리프레시한다.
		_invalidateMapSize : function(){
			var self = this, map = self.map;
			map.invalidateSize(false);
			//var sizePoint = map.getSize();
			//if(sizePoint.x == 0 && sizePoint.y == 0){
			//}
		},
		invalidateSize : function(arg){
			var self = this, map = self.map;
			return map.invalidateSize(arg);
		},
		_updateMaxMapSize : function(width, height){
			var self = this, options = this.options;
			//self.map.setView([centerPos[0], centerPos[1]]);
			var curMaxWidth = self.maxWidth, curMaxHeight = self.maxHeight;
			//Max Bounds는 맵의 Width, Height 옵션과 별개 동작 필요 주석처리. 18/07/01
			/*if(options.width || options.height){
				return;
			}*/

			var TEXT_WIDTH_HALF = 57;
			width = width + TEXT_WIDTH_HALF;
			var TEXT_ICON_HEIGHT = 38 + options.deviceIconSize / 2;
			height = height + TEXT_ICON_HEIGHT;

			if(width > curMaxWidth){
				self.maxWidth = width;
			}

			if(height > curMaxHeight){
				self.maxHeight = height;
			}
			//console.log(self.maxWidth);
			//console.log(self.maxHeight);

			self._updateMaxBounds();
		},
		//이미지 사이즈에 따라 맵뷰 사이즈가 변경되어야함.
		_setMapViewSize : function(){
			var self = this, options = this.options;
			var imgUrl = options.mapImageUrl, width = self.getWidth(), height = self.getHeight();
			self.element.css("width", width);
			self.element.css("height", height);
			if(options.isDetailPopupView){
				//일반 모드에서는 맵 뷰 사이즈 보다 이미지 사이즈가 작을 경우, 이미지를 가운데로 움직인데
				//상세 팝업에서는 맵 뷰 사이즈가 작아지므로, 이미지가 가운데로 움직이지 않는다.
				//이에 일반 모드와 같이 이미지가 가운데로 움직여서, 상세 팝업에서도 일반 모드와 동일하게 이미지를 표시하고, 기기 위치를 표시하기 위함이다.
				self.mapViewWidth = DEFAULT_WIDTH_SIZE;
				self.mapViewHeight = DEFAULT_HEIGHT_SIZE;
			}else{
				self.mapViewWidth = self.getWidth(true);
				self.mapViewHeight = self.getHeight(true);
			}

			if(imgUrl){
				if(options.mapImageWidth <= self.mapViewWidth) self.maxWidth = self.mapViewWidth < DEFAULT_WIDTH_SIZE ? DEFAULT_WIDTH_SIZE : self.mapViewWidth;
				else self.maxWidth = options.mapImageWidth;

				if(options.mapImageHeight <= self.mapViewHeight) self.maxHeight = self.mapViewHeight < DEFAULT_HEIGHT_SIZE ? DEFAULT_HEIGHT_SIZE : self.mapViewHeight;
				else self.maxHeight = options.mapImageHeight;

			}else{
				options.mapImageWidth = null;
				options.mapImageHeight = null;
				self.maxWidth = self.mapViewWidth < DEFAULT_WIDTH_SIZE ? DEFAULT_WIDTH_SIZE : self.mapViewWidth;
				self.maxHeight = self.mapViewHeight < DEFAULT_HEIGHT_SIZE ? DEFAULT_HEIGHT_SIZE : self.mapViewHeight;
			}
		},
		_updateMaxBounds : function(){
			var self = this;
			var southWest = self.map.unproject([0, self.maxHeight], DEFAULT_PROJECT_ZOOM_SIZE);
			var northEast = self.map.unproject([self.maxWidth, 0], DEFAULT_PROJECT_ZOOM_SIZE);
			var bounds = new L.LatLngBounds(southWest, northEast);
			self.map.setMaxBounds(bounds);
		},
		getWidth : function(isCalculatedSize){
			var self = this, options = self.options, width = options.width;
			if(isCalculatedSize) return self.getPercentSize(width, "width");
			else if(width === null) return DEFAULT_WIDTH_SIZE;
			return width;
		},
		getHeight : function(isCalculatedSize){
			var self = this, options = self.options, height = options.height;
			if(isCalculatedSize) return self.getPercentSize(height, "height");
			else if(height === null) return DEFAULT_HEIGHT_SIZE;
			return height;
		},
		getPercentSize : function(size, type){
			var self = this;
			var element = self.element, parent, parentSize;
			if(typeof size == "string"){
				if(size.indexOf("%") !== -1){
					parent = element.parent();
					if(type == "width") parentSize = parent.width();
					else parentSize = parent.height();
					size = Number(size.replace("%", ""));
					size = parentSize * (size / 100);
				}
			}else if(size === null){
				if(type == "width") size = DEFAULT_WIDTH_SIZE;
				else size = DEFAULT_HEIGHT_SIZE;
			}
			return size;
		},
		_renderHeatMap : function(){
			var self = this, options = self.options, map = self.map;
			var heatMapOptions = options.heatMapOptions;
			if(heatMapOptions){
				if($.isEmptyObject(heatMapOptions)){
					heatMapOptions = {
						radius : 15,
						blur : 20
					};
				}

				if(self.heatMapLayer){
					self.heatMapLayer.remove();
					self.heatMapLayer = null;
				}
				var ds = this.heatMapDataSource;
				var coordinates = ds.data();

				var i, coordinate, max = coordinates.length;
				var latLng, latLngs = [], curZoom = map.getZoom();

				for( i = 0; i < max; i++ ){
					coordinate = coordinates[i];
					latLng = self.map.unproject([coordinate[0], coordinate[1]], curZoom);
					//intensity
					if(typeof coordinate[2] !== "undefined") latLng = [ latLng.lat, latLng.lng, coordinate[2] ];
					else latLng = [ latLng.lat, latLng.lng ];
					latLngs.push(latLng);
					//latLngs.push([ latLng.lat, latLng.lng, 2.5 <- intensity ])
				}

				self.heatMapLayer = L.heatLayer(latLngs, heatMapOptions);

				if(self.heatMapLayerGroup){
					self.heatMapLayerGroup.remove();
					self.heatMapLayerGroup = null;
				}

				self.heatMapLayerGroup = L.layerGroup();
				self.heatMapLayerGroup.setZIndex(HEATMAP_LAYER_GROUP_ZINDEX);
				self.heatMapLayer.addTo(self.heatMapLayerGroup);
				self.heatMapLayerGroup.addTo(map);
			}
		},
		_renderImage : function(){
			var self = this, options = this.options, map = this.map;
			var imgWidth = options.mapImageWidth ? options.mapImageWidth : 0;
			var imgHeight = options.mapImageHeight ? options.mapImageHeight : 0;

			//맵 이미지가 맵 뷰 사이즈보다 작을 경우, 이미지를 가운데 위치 시킨다.
			var mapViewWidth = self.mapViewWidth, mapViewHeight = self.mapViewHeight;
			var x = 0, y = 0;
			if(options.isMonitoringFloorImage){
				x = imgWidth < mapViewWidth ? (mapViewWidth / 2 - imgWidth / 2) : 0;
				y = imgHeight < mapViewHeight ? (mapViewHeight / 2 - imgHeight / 2) : 0;
			}
			self._imagePosX = x;
			self._imagePosY = y;
			//console.log("monitoringfloorimage : " + options.isMonitoringFloorImage + "[image render] x : " + x + ", y : " + y + ", imgWidth : " + imgWidth + "imgHeight : " + imgHeight + ", mapviewWidth : " + mapViewWidth + ", mapViewHeight : " + mapViewHeight);
			var cornerA = self.map.unproject([x, imgHeight + y], DEFAULT_PROJECT_ZOOM_SIZE);
			var cornerB = self.map.unproject([imgWidth + x, y], DEFAULT_PROJECT_ZOOM_SIZE);
			//var southWest = self.map.unproject([0, imgHeight]);
			//var northEast = self.map.unproject([imgWidth, 0]);
			var bounds = new L.LatLngBounds(cornerA, cornerB);
			//var bounds = [[0, imgHeight], [imgWidth, 0]];
			//self.imageOverlay = L.imageOverlay(options.mapImageUrl, [[0, imgHeight], [imgWidth, 0]]);
			self.imageOverlay = L.imageOverlay(options.mapImageUrl, bounds);
			//console.log("imageHeight : " + imgHeight);
			//console.log("imageWidth : " + imgWidth);
			if(self.imageLayerGroup){
				self.imageLayerGroup.remove();
				self.imageLayerGroup = null;
			}
			self.imageLayerGroup = L.layerGroup();
			self.imageLayerGroup.setZIndex(IMAGE_LAYER_GROUP_ZINDEX);
			self.imageOverlay.addTo(self.imageLayerGroup);
			self.imageLayerGroup.addTo(map);
			//self.map.fitBounds(bounds);
			self._invalidateMapSize();
		},
		_renderZones : function(){
			var self = this, ds = this.zoneDataSource, map = this.map;
			var zone, zones;

			if(ds instanceof kendo.data.DataSource){
				zones = ds.data();
				var filter = ds.filter(), sort = ds.sort();
				//필터 적용
				zones = new kendo.data.Query(zones);

				if(sort) zones = zones.sort(sort);
				if(filter) zones = zones.filter(filter);

				zones = zones.toArray();
			}else{
				zones = ds;
			}

			var i, max = zones.length;
			if(self.zoneLayerGroup){
				//this.zoneLayer.clearLayers();
				self.zoneLayerGroup.remove();
				self.zoneLayerGroup = null;
			}

			self.zoneLayerGroup = L.layerGroup();

			for( i = 0; i < max; i++ ){
				zone = zones[i];
				self.renderZone(zone);
			}

			self.zoneLayerGroup.setZIndex(ZONE_LAYER_GROUP_ZINDEX);
			self.zoneLayerGroup.addTo(map);
			self._invalidateMapSize();
		},
		renderZone : function(zone){
			var self = this;
			var name, geometry, coordinates, createdZone, zonePolygon, zoneNameMarker;
			name = zone.name;

			if(!name) zone.name = name = self._getDefaultZoneName();

			geometry = zone.geometry;
			if(geometry){
				coordinates = geometry.coordinates;
				if(coordinates && coordinates[0]){
					createdZone = self._createZone(zone);
				}else{
					//현재 View 가운데 렌더링
					coordinates = self._getDefaultZonePolygonCoordinate();
					zone.geometry = { type : "Polygon", coordinates : coordinates };
					createdZone = self._createZone(zone);
				}
			}else{
				//현재 View 가운데 렌더링
				coordinates = self._getDefaultZonePolygonCoordinate();
				zone.geometry = { type : "Polygon", coordinates : coordinates };
				createdZone = self._createZone(zone);
			}

			zonePolygon = createdZone.zonePolygon;
			zoneNameMarker = createdZone.zoneNameMarker;

			if(zonePolygon){
				zonePolygon.zone = zone;
				if(!zone.nameDisplayCoordinate){
					zone.nameDisplayCoordinate = zoneNameMarker._originalCoordinates;
				}
				//Device보다 Zone이 나중에 그려져서 Device Icon에 zonePolygon이 붙지 않았을 경우에 대한 예외처리
				if(self._isMissingZone){
					self._assignZonePolygonToDeviceIcon(zonePolygon);
				}
			}
		},
		_createZone : function(zone){
			//console.log(coordinates);
			var self = this, options = self.options, zoneColorOptions = options.zoneColorOptions;
			var id = zone.id, name = zone.name, coordinates = zone.geometry.coordinates,
				zoneNameCoordinate = zone.nameDisplayCoordinate, color = zone.backgroundColor ? zone.backgroundColor : zoneColorOptions.Selected.color;
			var map = self.map, zoneNameMarker,
				zonePolygon = self._createZonePolygon(zone);

			zonePolygon._originalCoordinates = coordinates;
			zonePolygon.addTo(self.zoneLayerGroup);

			//Zone Name 위치가 없을 경우 존 Bounds 가운데 표시
			if(!zoneNameCoordinate){
				var bounds = zonePolygon.getBounds();
				var centerPoint = map.project(bounds.getCenter(), DEFAULT_ZOOM_SIZE);
				zoneNameCoordinate = [centerPoint.x - DEFAULT_NEW_ZONE_NAME_WIDTH / 2, centerPoint.y + (DEFAULT_ZONE_NAME_FONT_SIZE - DEFAULT_ZONE_NAME_FONT_SIZE / 2) / 2 ];
			}

			//console.log(zoneNameCoordinate);

			zoneNameMarker = self._createZoneNameMarker(id, name, zoneNameCoordinate, color);
			zoneNameMarker.zonePolygon = zonePolygon;
			zoneNameMarker._originalCoordinates = zoneNameCoordinate;
			zoneNameMarker.addTo(self.zoneLayerGroup);
			zonePolygon.zoneNameMarker = zoneNameMarker;

			return {
				zonePolygon : zonePolygon,
				zoneNameMarker : zoneNameMarker
			};
		},
		_getDefaultZoneName : function(){
			var self = this, zoneDs = self.zoneDataSource;
			var zones = zoneDs.data();
			var zone, split, number, name, i, max = zones.length;
			var maxNum = 0;
			for( i = 0; i < max; i++ ){
				zone = zones[i];
				name = zone.name;
				if(name && name.indexOf("New Zone") != -1){
					split = name.split(" ");
					number = split[split.length - 1];
					number = Number(number);
					if(!isNaN(number) && maxNum < number){
						maxNum = number;
					}
				}
			}
			return "New Zone " + (maxNum + 1);
		},
		_getDefaultZonePolygonCoordinate : function(){
			var self = this, map = self.map;
			var centerLatLng = map.getCenter();
			var centerPoint = map.project(centerLatLng, DEFAULT_ZOOM_SIZE);
			//250/2 = 125
			//170/2 = 85
			//CENTER - 566.5, 273.5
			//273-85     188
			var zoneWidth = DEFAULT_NEW_ZONE_WIDTH, zoneHeight = DEFAULT_NEW_ZONE_HEIGHT;
			var zoneHalfWidth = zoneWidth / 2, zoneHalfHeight = zoneHeight / 2;
			//var i, gap = DEFAULT_NEW_ZONE_POINT_GAP, pointSize = DEFAULT_NEW_ZONE_POINT_SIZE;

			var north = centerPoint.y - zoneHalfHeight, east = centerPoint.x + zoneHalfWidth,
				west = centerPoint.x - zoneHalfWidth, south = centerPoint.y + zoneHalfHeight;

			//console.log("north : "+ north +", east : "+east + ", west : "+west+", south : "+south);
			var defaultPoints = [[ west, north ], [ east, north ], [ east, south ], [ west, south ]];
			defaultPoints.push(defaultPoints[0]);
			/*var startPoint = centerPoint.clone(), centerY = centerPoint.y;
			startPoint.x = west;
			startPoint.y = startPoint.y - gap;
			var x, y, point, defaultPoints = [];
			defaultPoints.push([startPoint.x, startPoint.y]);
			point = startPoint;
			for( i = 1; i < pointSize; i++ ){
				point = point.clone();
				x = point.x; y = point.y;
				if((y - gap) >= north && x <= west){
					point.y = point.y - gap;
				}else if(y >= north && (x + gap) <= east && y < centerY){
					point.x = point.x + gap;
				}else if((y + gap) <= south && x <= east){
					point.y = point.y + gap;
				}else if(y <= south && (x - gap) >= west && y > centerY){
					point.x = point.x - gap;
				}
				defaultPoints.push([point.x, point.y]);
			}*/

			return [defaultPoints];
		},
		_createZonePolygon : function(zone){
			var id = zone.id, coordinates = zone.geometry.coordinates, isSelected = zone.selected,
				color = zone.backgroundColor;
			this._applyImagePositionToCoordinate(coordinates);
			var unprojectedCoordinates = this._unprojectCoordinatesForRender(coordinates);
			Util.removeSameLastPoint(unprojectedCoordinates);
			var bounds = L.latLngBounds(unprojectedCoordinates);
			var coordinate = coordinates[0];
			var originalCenterCoordinate = Util.getCentroid(coordinate.slice(0, coordinate.length - 1));
			var centerCoordinate = bounds.getCenter();

			var options = this.options, latlngs = [unprojectedCoordinates];

			var opt = $.extend(true, {}, options.zoneColorOptions.NotSelected);
			if(isSelected) opt = $.extend(opt, options.zoneColorOptions.Selected);

			opt.color = color ? color : opt.color;
			opt.fillColor = color ? color : opt.fillColor;

			var classId = " zone-id-" + id;
			opt.className += classId;
			opt.transform = true;
			//console.log(latlngs);
			opt.draggable = true;
			// 존편집시, 존폴리곤의 zIndex를 마커 보다 상위로 올리기위해서 tooltipPane 로 옵션 줌.
			if(this._isEditableZone) {
				opt.pane = 'tooltipPane';
			}

			var zonePolygon = L.polygon(latlngs, opt);
			zonePolygon.dragging.disable();
			zonePolygon.centerCoordinate = centerCoordinate;
			zonePolygon.originalCenterCoordinate = originalCenterCoordinate;
			return zonePolygon;
		},
		_createZoneNameMarker : function(id, zoneName, coordinate, color){
			var self = this, options = self.options;
			var x = coordinate[0] + self._imagePosX, y = coordinate[1] + self._imagePosY;
			//DataSource 생성 시, Kendo Obsrervable Object로 변환되어 Leaflet으로 에러발생하므로 Primitive Array로 재생성
			var markerLatlng = self.map.unproject([x, y], DEFAULT_PROJECT_ZOOM_SIZE);
			//var markerLatlng = [coordinate[0], coordinate[1]];
			var zoneNameOpt = $.extend(true, {}, options.zoneNameOptions);
			zoneNameOpt.html = self._getZoneNameMarkerHtml(color, zoneName);
			var classId = " zone-id-" + id;
			zoneNameOpt.className += classId;
			var zoneNameDiv = L.divIcon(zoneNameOpt);
			//존편집시, 존네임 마커를 존 폴리곤 과 같은 tooltipPane 로 zindex 를 올려주기 위함.
			var opt;
			if(!self._isEditableZone) {
				opt = { icon : zoneNameDiv, zIndexOffset : ZONE_NAME_MARKER_ZINDEX };
			} else {
				opt = { icon : zoneNameDiv, zIndexOffset : ZONE_NAME_MARKER_ZINDEX_EDITABLE, pane: 'tooltipPane' };
			}
			return L.marker(markerLatlng, opt);
		},
		_getZoneNameTextColor : function(zoneColor){
			var brightness = getBrightness(zoneColor);
			var fontColor = "#000";
			if(brightness <= DEFAULT_BRIGHTNESS_VALUE) fontColor = "#fff";

			return fontColor;
		},
		_getZoneNameMarkerHtml : function(zoneColor, zoneName){
			var self = this, fontColor = self._getZoneNameTextColor(zoneColor);
			return "<div class='common-map-view-zone-name-text' style='color : " + fontColor + "; background-color: " + zoneColor + ";'>" + zoneName + "</div>";
		},
		_showRegisteredGateway : function(){
			var MainWindow = window.MAIN_WINDOW;
			var floorObj = MainWindow.getCurrentFloor();
			var floorId = floorObj.floor.id;
			var buildingId = floorObj.building.id;
			var Loading = window.CommonLoadingPanel;
			Loading = new Loading();
			var self = this;
			var q = "?types=Gateway&registrationStatuses=Registered";
			if(buildingId != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID
               && floorId != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
				q += "&foundation_space_buildings_id=" + buildingId;
				q += "&foundation_space_floors_id=" + floorId;
				Loading.open(self.element);
				$.ajax({
					url : "/dms/devices" + q
				}).done(function(data){
					self._removeRegisteredGateway();
					var ds = new kendo.data.DataSource({
						data : data
					});
					ds.read();
					self._renderDevices(ds, true);
				}).fail(function(e){

				}).always(function(){
					Loading.close();
				});
			}
		},
		_removeRegisteredGateway : function(){
			var self = this;
			var deviceGroup = self.deviceLayerGroup;
			var layer, layers = deviceGroup.getLayers();
			var i, max = layers.length;
			for( i = 0; i < max; i++ ){
				layer = layers[i];
				if(layer.isOnlyShow && layer.device.type == "Gateway"){
					self._removeDeviceIcon(layer);
				}
			}
		},
		_clickZoneNameEvt : function(e){
			var self = this;
			//Zone Name 더블클릭 이벤트가 발생하기 전 클릭이벤트가 발생하는 것을 방지하기 위함이다.
			//console.error("click zone name");
			//console.error(e.originalEvent.detail);
			setTimeout(function(){
				if(!self._editableZoneNameMarker) self._clickZoneEvt(e);
			}, 250);
		},
		_clickZoneEvt : function(e){
			var self = this, zonePolygon;

			//console.error("click zone");
			//Zone 이름 편집 시에는 클릭 이벤트를 방지
			if(self._editableZoneNameMarker){
				return;
			}

			if(self._isZoneDraggingEnd){
				self._isZoneDraggingEnd = false;
				return;
			}

			var target = e.currentTarget;
			var id = self.getDataIdFromElement(target, "zone");

			if(self._isEditableZone){
				zonePolygon = self.selectZone(id, true);
				var element = zonePolygon.getElement();
				var isEditable = $(element).hasClass("editable");
				var isEdit = !isEditable;
				self.clearEditableZone();
				if(isEdit){
					self._editableZone(zonePolygon, isEdit);
				}else{
					zonePolygon = self.selectZone(id, false);
				}
			}else{
				zonePolygon = self.selectZone(id);
			}

			self._updateColorPickerState();
		},
		editableZone : function(id, isEditable){
			var self = this;
			if(!self._isEditableZone) return;
			var zonePolygon = self.selectZone(id, true);
			self.clearEditableZone();
			self._editableZone(zonePolygon, isEditable);
			self._updateColorPickerState();
		},
		_updateColorPickerState : function(){
			var self = this;
			//클릭 시, 편집 가능한 Zone Polygon이 있을 경우에만 컬러 픽커를 활성화 상태로 둔다.
			if(self.colorPickerControl){
				if(self._editableZonePolygon){
					self.colorPickerControl.enable();
					//Color Picker 선택 시, 해당 Zone의 색상으로 Color Picker의 값을 선택한다.
					var colorPicker = self.colorPickerControl.colorPicker;
					var options = self.options;
					var zone = self._editableZonePolygon.zone;
					var color = zone.backgroundColor ? zone.backgroundColor : options.zoneColorOptions.Selected.fillColor;
					colorPicker.value(color, true);
				}else{
					self.colorPickerControl.active(false);
					self.colorPickerControl.disable();
					self.colorPickerControl.colorPicker.close();
				}
			}
		},
		selectZone : function(zoneId, isSelect){
			var self = this;
			var zonePolygon = self.getZonePolygon(zoneId);
			if(!zonePolygon){
				console.error("there is no zone id is " + zoneId);
			}

			if(typeof isSelect === "undefined"){
				var element = zonePolygon.getElement();
				var isSelected = $(element).hasClass("selected");
				isSelect = !isSelected;
			}

			var selectionChangedZonePolygon = self._selectZonePolygon(zonePolygon, isSelect);
			if(selectionChangedZonePolygon){	//선택 상태가 변경되었을 경우만 기기 선택 상태 업데이트 및 "change" 이벤트 트리거
				var zone = zonePolygon.zone;
				//해당 존에 속한 기기 선택/미선택
				var deviceDs = self.dataSource;
				var data = deviceDs.data();
				var zoneGroupDevices = [];

				zoneGroupDevices = new kendo.data.Query(data)
					.filter({ field : "locations", operator : self._zoneFilter, value : zoneId})
					.toArray();
				var i, deviceIcon, device, max = zoneGroupDevices.length;
				for( i = 0; i < max; i++){
					device = zoneGroupDevices[i];
					deviceIcon = self.getDeviceIcon(device.id);
					//Zone 편집 모드에서는 Zone 선택 시, Device를 선택하지 않는다.
					if(deviceIcon && !self._isEditableZone) self._selectDeviceIcon(deviceIcon, isSelect, true);
				}
				self.trigger("change", { devices : zoneGroupDevices, zones : [zone] });
			}

			return zonePolygon;
		},
		_selectZonePolygon : function(zonePolygon, isSelect){
			var self = this, opt = {}, options = this.options, element = zonePolygon.getElement(),
				classList = element.classList, isRegisterView = this.options.isRegisterView;
			var zone = zonePolygon.zone, color = zone.backgroundColor, devices = this.deviceLayerGroup.getLayers();

			if(zone.selected === isSelect) return;
			if(!isRegisterView && devices.length == 0) return;

			zone.selected = isSelect;
			if(isSelect){
				opt = $.extend(opt, options.zoneColorOptions.Selected);
				opt.color = color ? color : opt.color;
				opt.fillColor = color ? color : opt.fillColor;

				if(classList.contains("selected")) return;

				classList.add("selected");
			}else{
				opt = $.extend(opt, options.zoneColorOptions.NotSelected);
				opt.color = color ? color : opt.color;
				opt.fillColor = color ? color : opt.fillColor;

				if(!classList.contains("selected")) return;

				classList.remove("selected");

				//선택 해제하려는 Zone이 편집 상태일 경우 편집 상태를 해제한다.
				if(zonePolygon === self._editableZonePolygon){
					self._editableZone(zonePolygon, false);
				}
			}
			zonePolygon.setStyle(opt);

			return zonePolygon;
		},
		_editableZone : function(zonePolygon, isEnable){
			var self = this, //options = self.options, zoneColorOptions = options.zoneColorOptions,
				zoneNameMarker = zonePolygon.zoneNameMarker, element = zonePolygon.getElement(), classList = element.classList,
				zoneNameElement = zoneNameMarker.getElement(), zoneNameClassList = zoneNameElement.classList;

			if(isEnable){
				if(classList.contains("editable")) return;

				classList.add("editable");
				zoneNameClassList.add("editable");

				zonePolygon.setStyle({ opacity : 1 });
				//Zone 편집 시, Map View 우측 클릭 방지
				self.map.on("contextmenu", function(e){ L.DomEvent.stop(e); return false; });

				//Zone 이동
				zonePolygon.dragging.enable();

				zoneNameMarker.dragging.enable(); //Zone 이름 드래그 설정
				zoneNameMarker.on("dragstart", self._dragStartZoneNameEvt.bind(self));
				zoneNameMarker.on("dragend", self._dragEndZoneNameEvt.bind(self));
				//Zone 이름 편집
				zoneNameMarker.on("dblclick", self._dbClickZoneNameEvt.bind(self));
				//아래 transform과 enableEdit는 순서가 보장되어야한다.
				//Zone 사이즈 편집
				zonePolygon.transform.disable();
				zonePolygon.transform.enable({ rotation : false, scaling : true });
				//Zone 영역 편집
				zonePolygon.enableEdit();

				zonePolygon.on("dragstart", self._dragStartZoneEvt.bind(self));
				zonePolygon.on("drag", self._dragZoneEvt.bind(self));
				zonePolygon.on("dragend", self._dragEndZoneEvt.bind(self));
				self._editableZonePolygon = zonePolygon;
			}else{
				if(!classList.contains("editable")) return;

				classList.remove("editable");
				zoneNameClassList.remove("editable");

				zonePolygon.setStyle({ opacity : 0.3 });

				self.map.off("contextmenu");

				zonePolygon.dragging.disable();
				zoneNameMarker.dragging.disable(); //Zone 이름 드래그 설정

				//아래 transform과 disableEdit는 순서가 보장되어야한다.
				//Zone 사이즈 편집
				zonePolygon.transform.disable();
				//Zone 영역 편집
				zonePolygon.disableEdit();

				zoneNameMarker.off("dragstart");
				zoneNameMarker.off("dragend");
				zoneNameMarker.off("dblclick");
				zonePolygon.off("dragstart");
				zonePolygon.off("drag");
				zonePolygon.off("dragend");
				self._editableZonePolygon = null;
			}
		},
		_dragStartZoneEvt : function(e){
			var zonePolygon = e.target;
			zonePolygon._isDragging = true;
			zonePolygon._beforeDragLatlngs = [];
			var latlngs = zonePolygon.getLatLngs()[0];
			var i, max = latlngs.length;
			for( i = 0; i < max; i++ ){
				zonePolygon._beforeDragLatlngs.push(latlngs[i].clone());
			}
			var zoneNameMarker = zonePolygon.zoneNameMarker;
			zoneNameMarker._beforeDragLatlng = zoneNameMarker.getLatLng();
		},
		_dragZoneEvt : function(e){
			var self = this, map = self.map, zonePolygon = e.target;
			var newPoint = L.point(e.clientX, e.clientY);
			var offset = L.point(newPoint.subtract(zonePolygon.dragging._clientStartPoint));
			zonePolygon.dragging._clientStartPoint = newPoint;
			var curZoom = map.getZoom(), variationLatLng = map.unproject(offset, curZoom);
			var variationLat = variationLatLng.lat, variationLng = variationLatLng.lng;
			//Zone 드래그 시, 존 이름이 같이 움직이도록 좌표 값 업데이트
			var zoneNameMarker = zonePolygon.zoneNameMarker;
			var nameLatLng = zoneNameMarker.getLatLng();
			var newNameLatLng = L.latLng(nameLatLng.lat + variationLat, nameLatLng.lng + variationLng);
			zoneNameMarker.setLatLng(newNameLatLng);
		},
		_dragEndZoneEvt : function(e){
			var self = this, zonePolygon = e.target, zoneNameMarker = zonePolygon.zoneNameMarker,
				layerBounds, layerNorth, layerEast, layerWest, layerSouth;
			var mapMaxBounds = self.getMaxBounds();
			var mapNorth = mapMaxBounds.getNorth(), mapWest = mapMaxBounds.getWest(), mapEast = mapMaxBounds.getEast(), mapSouth = mapMaxBounds.getSouth();
			var i, max;

			self._isZoneDraggingEnd = typeof e.isMarkerDrag === "undefined" ? true : false;

			//Zone Polygon의 맵 화면 이탈 체크
			layerBounds = zonePolygon.getBounds(); layerNorth = layerBounds.getNorth(); layerEast = layerBounds.getEast();
			layerWest = layerBounds.getWest(); layerSouth = layerBounds.getSouth();
			//맵 영역의 최대/최소 체크하여 해당 경계를 넘어간 경우, 드래그 하기 전의 위치로 롤백
			if(layerNorth > mapNorth || layerWest < mapWest
			   || layerSouth < mapSouth || layerEast > mapEast ){
				zonePolygon.setLatLngs(zonePolygon._beforeDragLatlngs);
				zoneNameMarker.setLatLng(zoneNameMarker._beforeDragLatlng);
				//존 편집 마커 Refresh
				//현재 LatLngs 좌표에 Marker를 다시 바인딩한다.
				zonePolygon.editor.editLayer.clearLayers();
				zonePolygon.editor.initVertexMarkers();
				//존 리사이즈 포인트 Refresh
				zonePolygon.transform.disable();
				zonePolygon.transform.enable({ rotation : false, scaling : true });
				zonePolygon.enableEdit();
				//Drag 시도 했던 Zone Polygon이 이동 전의 위치로 이동하였으므로, 클릭 이벤트 연쇄 발생하지 않음 Flag 값을 원복
				// if(self._isZoneDraggingEnd) self._isZoneDraggingEnd = false;

			}else{
				//Center 좌표 또한 업데이트
				var latlngs = zonePolygon.getLatLngs();
				var bounds = zonePolygon.getBounds();
				zonePolygon.originalCenterCoordinate = Util.getCentroid(self._projectCoordinatesForModel(latlngs));
				zonePolygon.centerCoordinate = bounds.getCenter();

				self._removeZoneIdInDevices(zonePolygon, false);

				var device, deviceIcon, zone = zonePolygon.zone;
				var zoneId = zone.id;

				//드래그 된 해당 Zone에 새롭게 포함된 기기들의 Zone Id 변경 및 선택 상태 변경
				var locations, locationsKey;
				var deviceLayerGroup = self.deviceLayerGroup, deviceLayers = deviceLayerGroup.getLayers(), max = deviceLayers.length;

				for( i = 0; i < max; i++ ){
					deviceIcon = deviceLayers[i];
					//Measured 타입은 업데이트를 위하여 PATCH하지 않는다.
					if(deviceIcon instanceof L.Marker && self.isLayerInPolygon(deviceIcon, zonePolygon) && !deviceIcon.isMeasured){
						//존 편집이 아닌 경우에만 디바이스를 선택 함.
						// self._selectDeviceIcon(deviceIcon, true);
						device = deviceIcon.device;
						//Measured 타입은 업데이트를 위하여 PATCH하지 않는다.
						/*if(deviceIcon.isMeasured){
							locations = Util.getBeaconLocation(device, "Measured");
							locationsKey = "locations[1]";
							if(locations){
								self._addChangedData(self._changedDevices, device,
									[locationsKey + ".foundation_space_zones_id", locationsKey + ".id"]);
								locations.foundation_space_zones_id = zoneId;
							}
						}*/
						locations = device.locations ? device.locations[0] : null;
						locationsKey = "locations[0]";
						if(locations){
							//변경되기 전 기기 정보를 저장한다.
							self._addChangedData(self._changedDevices, device,
								[locationsKey + ".foundation_space_zones_id", locationsKey + ".id"]);
							locations.foundation_space_zones_id = zoneId;
						}
					}
				}

				//Zone Model 업데이트
				//변경되기 전 존 정보를 저장한다.
				self._addChangedData(self._changedZones, zone, ["geometry.coordinates", "geometry.type"]);
				var geometry = zone.geometry;
				geometry.coordinates = self._projectCoordinatesForModel(zonePolygon.getLatLngs());
				geometry.coordinates[0].push(geometry.coordinates[0][0]);
				self.trigger("dragend", { zones : [ zone ] });
			}

			//Zone 이름 위치의 맵 화면 이탈 체크
			self._checkZoneNameMarkerBounds(zoneNameMarker);

			//self.isIntersectZonePolygons();
			delete zonePolygon._draggingLatLng;
			zonePolygon._isDragging = false;
		},
		//Zone Drag & Drop 또는 Remove 시에 기기의 기존 Zone Id 값을 0으로 업데이트한다. (0으로 Patch 시, 삭제 동작.)
		//Drag & Drop 시에는 Drag 한 해당 Zone에 포함되지 않아야 삭제한다.
		//Zone Remove 시에는 삭제할 해당 Zone에 포함되어야 삭제한다.
		_removeZoneIdInDevices : function(zonePolygon, isDeviceInZone){
			var self = this, zone = zonePolygon.zone, zoneId = zone.id, deviceDs = self.dataSource;
			var data = deviceDs.data();
			var zoneGroupDevices = new kendo.data.Query(data)
				.filter({ field : "locations", operator : self._zoneFilter, value : zoneId})
				.toArray();

			var deviceIcon, device;
			var isLayerInPolygon, i, max = zoneGroupDevices.length;

			for( i = 0; i < max; i++){
				device = zoneGroupDevices[i];
				deviceIcon = self.getDeviceIcon(device.id);
				if(!deviceIcon) continue;
				isLayerInPolygon = self.isLayerInPolygon(deviceIcon, zonePolygon);
				if(deviceIcon && isLayerInPolygon == isDeviceInZone){
					self._selectDeviceIcon(deviceIcon, false);
					if(device.locations && device.locations[0]){
						//변경되기 전 기기 정보를 저장한다.
						self._addChangedData(self._changedDevices, device, ["locations[0].foundation_space_zones_id", "locations[0].id"]);
						device.locations[0].foundation_space_zones_id = 0;
					}
				}
			}
		},
		_addChangedData : function(dataSource, data, field, isDelete){
			if(!dataSource) return;

			var originalData = dataSource.get(data.id);
			if(!dataSource._changedFields){
				dataSource._changedFields = {};
			}
			if(!dataSource._changedFields[data.id]){
				dataSource._changedFields[data.id] = [];
			}

			var changedFields;
			//변경된 필드 저장
			if(field){
				changedFields = dataSource._changedFields[data.id];
				if(typeof field === "string" && changedFields.indexOf(field) === -1){
					changedFields.push(field);
				}else if($.isArray(field)){
					var i, max = field.length;
					for( i = 0; i < max; i++ ){
						if(changedFields.indexOf(field[i]) === -1){
							changedFields.push(field[i]);
						}
					}
				}
			}

			if(isDelete){
				delete dataSource._changedFields[data.id];
			}

			//원본 데이터 저장
			if(!originalData){
				dataSource.add(data.toJSON());
			}
		},
		_dbClickZoneNameEvt : function(e){
			var self = this, zoneNameMarker = e.target, zonePolygon = zoneNameMarker.zonePolygon, zone = zonePolygon.zone;
			var element = $(zoneNameMarker.getElement());
			element.html("");
			var backgroundColor = zone.backgroundColor ? zone.backgroundColor : self.options.zoneColorOptions.Selected.color;
			var fontColor = self._getZoneNameTextColor(backgroundColor);
			var inputElement = $("<input type='text' class='common-map-view-zone-name-editable common-map-view-zone-name-text' maxlength='" + MAX_ZONE_NAME_LENGTH + "'/>").val(zone.name).css({'background-color':backgroundColor, 'color':fontColor});
			// 입력 텍스트 길이에 따라 인풋 필드 가로 길이를 동적으로 변경 시키기 위한 가상 텍스트박스 요소 변수와 함수.
			var fakeTextElem, textWidth = function(inputElem) {
				if($(element).find('span').length == 0) fakeTextElem = $('<span>').hide().appendTo(element);
				fakeTextElem = $(element).find('span').eq(0);
				fakeTextElem.text($(inputElem).val());
				return fakeTextElem.width();
			};
			//INPUT 추가
			element.append(inputElement);
			self._editableZoneNameMarker = zoneNameMarker;
			//Blur 이벤트 추가
			inputElement.on("blur", self._blurZoneNameInputEvt.bind(self));
			// 입력 텍스트 길이에 따른 인풋 필드 가로 길이 동적 변경을위한 부분.
			inputElement.on("input", function() {
				var inputWidth = textWidth(this);
				$(this).css({
					width: inputWidth
				});
			}).trigger('input');

			inputElement.focus();
			//console.error("db click zone name");
			//console.error(e);
			L.DomEvent.stop(e);
		},
		_blurZoneNameInputEvt : function(e){
			var self = this, zoneNameMarker = self._editableZoneNameMarker;
			var nameElement = $(zoneNameMarker.getElement());
			var inputElement = $(e.target);
			var changedName = inputElement.val();
			var zonePolygon = zoneNameMarker.zonePolygon, zone = zonePolygon.zone;
			var markerColor = zone.backgroundColor ? zone.backgroundColor : self.options.zoneColorOptions.Selected.color;
			//console.error("blur zone name");
			//console.error(e);
			//inPUT 삭제
			inputElement.remove();
			//이름이 변경되었을 경우 Name을 다시 Set
			if(changedName && changedName !== zone.name){
				changedName = changedName.substring(0, MAX_ZONE_NAME_LENGTH);
				self._addChangedData(self._changedZones, zone, "name");
				zone.name = changedName;
				self.trigger("change", { zones : [ zone ] });
			}
			// nameElement.html(zone.name);
			nameElement.html(self._getZoneNameMarkerHtml(markerColor, zone.name));
			self._editableZoneNameMarker = null;
		},
		_dragStartZoneNameEvt : function(e){
			var zoneNameMarker = e.target;
			zoneNameMarker._beforeDragLatlng = zoneNameMarker.getLatLng();
		},
		_dragEndZoneNameEvt : function(e){
			var self = this, zoneNameMarker = e.target;
			self._isZoneDraggingEnd = true;
			self._checkZoneNameMarkerBounds(zoneNameMarker);
		},
		_checkZoneNameMarkerBounds : function(zoneNameMarker){
			//Zone 이름 위치의 맵 화면 이탈 체크
			var self = this, mapMaxBounds = self.getMaxBounds();
			var mapNorth = mapMaxBounds.getNorth(), mapWest = mapMaxBounds.getWest(), mapEast = mapMaxBounds.getEast(), mapSouth = mapMaxBounds.getSouth();
			var layerBounds = self._getMarkerBounds(zoneNameMarker), layerNorth = layerBounds.getNorth(), layerEast = layerBounds.getEast();
			var layerWest = layerBounds.getWest(), layerSouth = layerBounds.getSouth();
			if(layerNorth > mapNorth || layerWest < mapWest
			   || layerSouth < mapSouth || layerEast > mapEast ){
				zoneNameMarker.setLatLng(zoneNameMarker._beforeDragLatlng);
				//Drag 시도 했던 Zone Name Marker가 이동 전의 위치로 이동하였으므로, 클릭 이벤트 연쇄 발생하지 않음 Flag 값을 원복
				if(self._isZoneDraggingEnd) self._isZoneDraggingEnd = false;
			} else {
				//ZoneModel 업데이트
				var zonePolygon = zoneNameMarker.zonePolygon;
				var zone = zonePolygon.zone;
				self._addChangedData(self._changedZones, zone, "nameDisplayCoordinate");
				var markerPoint = self.map.project(zoneNameMarker.getLatLng(), DEFAULT_ZOOM_SIZE);
				zone.nameDisplayCoordinate = [markerPoint.x, markerPoint.y];
			}
		},
		_clickDeviceEvt : function(e){
			var self = this;
			if(self._isDraggingEnd){
				self._isDraggingEnd = false;
				return;
			}

			var target = e.currentTarget;
			var id = self.getDataIdFromElement(target, "device");
			// 존 편집시 개별 디바이스가 선택 되지 않음.
			if(!self._isEditableZone) {
				self.selectDevice(id, null, true);
			}
		},
		selectDevice : function(deviceId, isSelect, isTrigger){
			var self = this;
			var device, deviceIcon = self.getDeviceIcon(deviceId);
			if(!deviceIcon){
				console.info("there is no rendered device icon id is " + deviceId + " in map view. but data will be changed if data and isSelect parameter exist.");
				var ds = self.dataSource;
				device = ds.get(deviceId);
				if(device && typeof isSelect !== "undefined" && isSelect !== null) device.selected = isSelect;
				return;
			}
			device = deviceIcon.device;

			if(typeof isSelect === "undefined" || isSelect === null){
				var element = deviceIcon.getElement();
				var isSelected = $(element).hasClass("selected");
				isSelect = !isSelected;
			}

			self._selectDeviceIcon(deviceIcon, isSelect);

			//존 전체 선택 상태 체크
			var evt = { devices : [device] };
			var zonePolygon = deviceIcon.zonePolygon;
			if(zonePolygon){
				if(self.isAllSelectedDevicesInZone(zonePolygon.zone.id)){
					zonePolygon = self._selectZonePolygon(zonePolygon, true);
				}else{
					zonePolygon = self._selectZonePolygon(zonePolygon, false);
				}
				//변경 사항이 없을 경우 zonePolygon은 undefined이다.
				if(zonePolygon) evt.zones = [zonePolygon.zone];
			}

			if(isTrigger) self.trigger("change", evt);
		},
		_selectDeviceIcon : function(deviceIcon, isSelect){
			var self = this, element = deviceIcon.getElement(), classList = element.classList,
				options = this.options, beaconImageName = options.beaconImageName, device = deviceIcon.device;

			if(!deviceIcon.isOnlyShow && device.selected === isSelect) return;

			var measuredDeviceIcon = deviceIcon.measuredDeviceIcon;
			if(measuredDeviceIcon){
				self._selectDeviceIcon(measuredDeviceIcon, isSelect);
			}

			device.selected = isSelect;
			var mobilityType = Util.getPositionType(device);
			var shadowUrl, icon, iconOptions;

			if(isSelect){
				if(classList.contains("selected")) return;

				classList.add("selected");

				if(options.isRegisterView && mobilityType == "Movable"){
					shadowUrl = self._getIconUrl(beaconImageName.Selected);
				}
			}else{
				if(!classList.contains("selected")) return;

				classList.remove("selected");

				if(options.isRegisterView && mobilityType == "Movable"){
					shadowUrl = self._getIconUrl(beaconImageName.NotSelected);
				}
			}

			if(shadowUrl){
				icon = deviceIcon.options.icon;
				iconOptions = icon.options;
				iconOptions.shadowUrl = shadowUrl;
				if(isSelect){
					iconOptions.className += " selected";
				}else{
					iconOptions.className = iconOptions.className.replace("selected", "");
				}
				icon = L.icon(iconOptions);
				deviceIcon.setIcon(icon);
			}
		},
		_zoneFilter : function(item, value){
			if(!item || !item.length) return;
			//var itemZoneId, i, max = item.length;
			//Zone 선택 시, fixeed 타입만 체크하여 선택 -> 사양 확정 필요.
			if(item[0].foundation_space_zones_id == value) return true;
			/*for( i = 0; i < max; i++ ){
                itemZoneId = item[i].foundation_space_zones_id;
                if(!itemZoneId) return;
                if(itemZoneId == value) return true;
            }*/
		},
		isAllSelectedDevicesInZone : function(zoneId){
			var self = this, ds = this.dataSource;
			var data = ds.data();
			var zoneGroupDevices = new kendo.data.Query(data)
				.filter({ field : "locations", operator : self._zoneFilter, value : zoneId})
				.toArray();
			var i, max = zoneGroupDevices.length;
			if(max < 1) return false;

			for( i = 0; i < max; i++ ){
				if(!zoneGroupDevices[i].selected){
					return false;
				}
			}
			return true;
		},
		//deprecated Zoom In/Out 시, 기기 아이콘 사이즈는 유지된다.
		_zoomEndResizeElementEvt : function(){
			var self = this, map = self.map, element = self.element, options = self.options;
			var zoomLevel = map.getZoom();
			//console.log("zoom level : " + zoomLevel);
			var fontSize, deviceIconSize, deviceInfoFontSize, deviceInfoMarginTop, deviceInfoWidth,
				zoneNameTooltip = element.find('.common-map-view-zone-name'),
				deviceInfoWrapper = element.find(".common-map-view-device-text"),
				deviceInfoText = deviceInfoWrapper.find(".device-info-text"),
				deviceIcon = element.find(".common-map-view-device-icon");

			fontSize = DEFAULT_ZONE_NAME_FONT_SIZE;
			deviceIconSize = options.deviceIconSize;
			deviceInfoFontSize = DEFAULT_DEVICE_INFO_FONT_SIZE;
			deviceInfoMarginTop = DEFAULT_DEVICE_INFO_MARGIN_TOP;
			deviceInfoWidth = DEFAULT_DEVICE_INFO_WIDTH;

			var factor;
			if(DEFAULT_ZOOM_SIZE < zoomLevel){
				factor = (DEFAULT_ZOOM_DELTA * (zoomLevel - DEFAULT_MIN_ZOOM_SIZE));
				fontSize = fontSize * factor;
				deviceIconSize = deviceIconSize * factor;
				deviceInfoFontSize = deviceInfoFontSize * factor;
				deviceInfoMarginTop = deviceInfoMarginTop * factor + (deviceInfoFontSize - DEFAULT_DEVICE_INFO_FONT_SIZE);
				deviceInfoWidth = deviceInfoWidth * factor;
			}else if(DEFAULT_ZOOM_SIZE > zoomLevel){
				factor = (DEFAULT_ZOOM_DELTA * (DEFAULT_MAX_ZOOM_SIZE - zoomLevel));
				fontSize = fontSize / factor;
				deviceIconSize = deviceIconSize / factor;
				deviceInfoFontSize = deviceInfoFontSize / factor;
				deviceInfoMarginTop = deviceInfoMarginTop / factor - (DEFAULT_DEVICE_INFO_FONT_SIZE - deviceInfoFontSize);
				deviceInfoWidth = deviceInfoWidth / factor;
			}

			//Movable Type 기기의 물방울 모양 아이콘 필터
			self.svgDefsElem.find("pattern image").attr({
				width : deviceIconSize,
				height : deviceIconSize
			});

			zoneNameTooltip.css({
				'margin-top' : -fontSize, //iconAnchor Y
				'font-size' : fontSize    //FontSize
			});

			deviceIcon.css({
				'margin-left' : -(deviceIconSize / 2),
				'margin-top' : -(deviceIconSize / 2),
				width : deviceIconSize,
				height : deviceIconSize
			});

			deviceInfoWrapper.css({
				'margin-top' : deviceInfoMarginTop
			});

			deviceInfoText.css({
				'font-size' : deviceInfoFontSize,
				width : deviceInfoWidth
			});
		},
		_renderDevices : function(dataSource, isOnlyShow){
			var self = this, ds = dataSource ? dataSource : this.dataSource, map = this.map, options = this.options;
			var device, devices;

			self._isMissingZone = false;

			if(ds instanceof kendo.data.DataSource){
				devices = ds.data();
				var filter = ds.filter(), sort = ds.sort();
				//필터 적용
				devices = new kendo.data.Query(devices);

				if(sort) devices = devices.sort(sort);
				if(filter) devices = devices.filter(filter);

				devices = devices.toArray();
			}else{
				devices = ds;
			}

			//console.time('removeDeviceLayer');
			if(!isOnlyShow){
				if(self.deviceLayerGroup){
					self.deviceLayerGroup.remove();
					self.deviceLayerGroup = null;
				}

				if(self.deviceInfoLayerGroup){
					self.deviceInfoLayerGroup.remove();
					self.deviceInfoLayerGroup = null;
				}
			}

			if(!isOnlyShow){
				self.deviceLayerGroup = L.layerGroup();
				self.deviceInfoLayerGroup = L.layerGroup();
			}

			self.deviceMaxX = 0; self.deviceMaxY = 0;

			var i, max = devices.length;

			for( i = 0; i < max; i++ ){
				device = devices[i];
				//console.time('renderDevice');
				self.renderDevice(device, isOnlyShow);
				//console.timeEnd('renderDevice');
			}
			//console.time('_updateMaxMapSize');
			self._updateMaxMapSize(self.deviceMaxX, self.deviceMaxY);
			//console.timeEnd('_updateMaxMapSize');
			//console.time('_deiceLayerGroup.setZindex');
			self.deviceLayerGroup.setZIndex(DEVICE_LAYER_GROUP_ZINDEX);
			self.deviceInfoLayerGroup.setZIndex(DEVICE_INFO_LAYER_GROUP_ZINDEX);
			//console.timeEnd('_deiceLayerGroup.setZindex');
			//console.time('_deiceLayerGroup.addToMap');

			//기기의 선택 상태에 따라 Zone 선택 상태도 업데이트한다.
			var zoneLayerGroup = self.zoneLayerGroup;
			var zoneLayer, zoneLayers = zoneLayerGroup.getLayers();
			max = zoneLayers.length;
			for( i = 0; i < max; i++ ){
				zoneLayer = zoneLayers[i];
				if(zoneLayer instanceof L.Polygon){
					if(self.isAllSelectedDevicesInZone(zoneLayer.zone.id)){
						self._selectZonePolygon(zoneLayer, true);
					}else{
						self._selectZonePolygon(zoneLayer, false);
					}
				}
			}

			self.deviceLayerGroup.addTo(map);
			self.deviceInfoLayerGroup.addTo(map);
			//console.timeEnd('_deiceLayerGroup.addToMap');

			if(options.hasLayerControl){
				//기존에 레이어 팝업이 열려있는 경우, setActive 함수를 이용해서 닫아준다.
				self.layerControl.setActive(false);
				if(options.showDeviceInfoCheckbox) self.layerControl._clickDeviceInfoChkboxEvt();
				if(options.showDeviceNameCheckbox) self.layerControl._clickDeviceNameChkboxEvt();
				if(options.showZoneNameCheckbox) self.layerControl._clickZoneNameChkboxEvt();
				if(!isOnlyShow && options.showRegisteredGateway) self.layerControl._clickRegisteredGatewayChkboxEvt();
			}

			if(options.hasLegendControl){
				//기존에 레전드 팝업이 열려있는 경우, setActive 함수를 이용행서 닫아준다.
				self.legendControl.setActive(false);
				//보여지는 기기 타입마다 범례가 다르기 때문에 기기 Type 리스트를 가져온다.
				var groupQuery = new kendo.data.Query(devices).group({ field : "type" }).toArray();
				var types = [];
				max = groupQuery.length;
				for( i = 0; i < max; i++ ){
					types.push(groupQuery[i].value);
				}
				groupQuery = new kendo.data.Query(devices).group({ field : "mappedType" }).toArray();
				max = groupQuery.length;
				for( i = 0; i < max; i++ ){
					types.push(groupQuery[i].value);
				}
				L.Util.setOptions(self.legendControl, { types : types });
			}

			if(options.isForcedShowDevice && devices.length == 1){
				var deviceLayers = self.deviceLayerGroup.getLayers();
				if(deviceLayers[0]) self.map.setView(deviceLayers[0].getLatLng());
			}

			self._invalidateMapSize();
		},
		renderDevice : function(device, isOnlyShow){
			var self = this, options = self.options, isForcedShowDevice = options.isForcedShowDevice;

			var registrationStatus, coordinateInfo, coordinate, positionType;
			var deviceIcon, measuredDeviceIcon, zonePolygon, type, isAsset, locations;
			var maxX = self.deviceMaxX, maxY = self.deviceMaxY;
			registrationStatus = device.registrationStatus;
			//기기 등록 맵뷰가 아닐 경우 미등록 상태 기기는 표시하지 않는다.
			if(registrationStatus == "NotRegistered" && !isForcedShowDevice) return;
			//console.time('_getDeviceCoordinate');
			coordinateInfo = self._getDeviceCoordinate(device);
			//console.timeEnd('_getDeviceCoordinate');

			if(!coordinateInfo) return;

			zonePolygon = coordinateInfo.zonePolygon;
			coordinate = coordinateInfo.coordinate;

			//기기의 위치가 맵 사이즈를 벗어날 때, 맵 크기를 업데이트한다.
			if(maxX < coordinate[0]) self.deviceMaxX = coordinate[0];
			if(maxY < coordinate[1]) self.deviceMaxY = coordinate[1];
			//console.time('createDeviceIcon');
			deviceIcon = self.createDeviceIcon(device, coordinate, zonePolygon, false, isOnlyShow);
			//console.timeEnd('createDeviceIcon');
			//console.log(deviceIcon);

			type = device.type;
			isAsset = typeof device.assets_types_id !== "undefined";
			//Fixed 상태 인 비콘 및 자산의 Measured 좌표 표시
			if(type == "Beacon" || isAsset){
				//console.time('render Mesaured');
				positionType = Util.getPositionType(device);
				if(positionType == "Fixed" || isAsset){
					locations = Util.getBeaconLocation(device, "Measured");
					if(locations.geometry){
						coordinateInfo = self._getDeviceCoordinate(device, true);
						if(coordinateInfo){
							coordinate = coordinateInfo.coordinate;
							zonePolygon = coordinateInfo.zonePolygon;
							measuredDeviceIcon = self.createDeviceIcon(device, coordinate, zonePolygon, true, true);
							deviceIcon.measuredDeviceIcon = measuredDeviceIcon;
						}
					}
				}
				//console.timeEnd('render Mesaured');
			}
			return deviceIcon;
		},
		_assignZonePolygonToDeviceIcon : function(zonePolygon){
			var self = this, deviceLayerGroup = self.deviceLayerGroup, deviceLayers = deviceLayerGroup.getLayers();
			var device, locations, deviceLayer, i, max = deviceLayers.length, zone = zonePolygon.zone, zoneId = zone.id;
			for( i = 0; i < max; i++ ){
				deviceLayer = deviceLayers[i];
				device = deviceLayer.device;
				if(deviceLayer.isMeasured){
					locations = Util.getBeaconLocation(device, "Measured");
				}else{
					locations = device.locations ? device.locations[0] : null;
				}

				if(locations && locations.foundation_space_zones_id == zoneId){ //렌더링 될 Zone의 Zone ID 값이 기존 렌더링 된 기기의 존 ID 값과 같을 경우 해당 zonePolygon을 Assign한다.
					deviceLayer.zonePolygon = zonePolygon;
				}else if(!deviceLayer.isMeasured && zone._isNew && self.isLayerInPolygon(deviceLayer, zonePolygon)){
					//새로 생성된 Zone 일 경우, Zone ID가 같지 않고, 해당 Zone 위치에 기기가 포함되어있을 경우 새롭게 zonePolygon을 Assign 한다.
					//Measured 좌표 값은 업데이트하지 않는다.
					deviceLayer.zonePolygon = zonePolygon;
					self._addChangedData(self._changedDevices, device, ["locations[0].foundation_space_zones_id", "locations[0].id"]);
					locations.foundation_space_zones_id = zoneId;
				}
			}
		},
		createDeviceIcon : function(device, coordinate, zonePolygon, isMeasured, isOnlyShow){
			var self = this;
			var deviceIcon = self._createDeviceIconMarker(device, coordinate, isMeasured, isOnlyShow);
			deviceIcon.isMeasured = isMeasured;
			deviceIcon.isOnlyShow = isOnlyShow;
			deviceIcon.zonePolygon = zonePolygon;
			deviceIcon.addTo(self.deviceLayerGroup);
			deviceIcon.infoMarker.addTo(self.deviceInfoLayerGroup);
			return deviceIcon;
		},
		_getDeviceDisplayName : function(device){
			var name = typeof device.assets_types_id !== "undefined" ? device.assets_types_name : device.name;
			if(device.subAssetType) name += " / " + device.subAssetType;
			return name;
		},
		_getDeviceDisplayValue : function(device){
			var I18N = window.I18N;
			var self = this, options = self.options, showDeviceValue = options.showDeviceValue, temperatureUnit = options.temperatureUnit;
			var current = null, desired = null, valueUnit = "";
			var type = device.type, temperature = device.temperatures, modes = device.modes, mappedType = device.mappedType;

			if(type && showDeviceValue){
				if(type.indexOf("AirConditioner") != -1){
					if(temperature && temperature.length > 0){
						temperature = temperature[0];
						current = temperature.current ? temperature.current.toFixed(1) : "-";
						desired = temperature.desired ? temperature.desired.toFixed(1) : "-";

						//모드가 송풍모드이면 설정온도는 - 로 표시된다.
						if(modes){
							var temp = $.grep(modes, function(e){ return e.id == "AirConditioner.Indoor.General" && e.mode == "Fan"; });
							if(temp && temp.length) desired = "-";
						}

						valueUnit = temperatureUnit;
					}
				}else if(type.indexOf("ControlPoint") != -1){ //에너지 미터, 온/습도로 변환된 ControlPoint를 위한 값 표시
					var point = device.controlPoint;
					if(point && typeof point.value !== "undefined" && mappedType){
						current = point.value;
						if(mappedType.indexOf("Temperature") != -1){
							if(temperature && temperature.length > 0){
								temperature = temperature[0];
								current = temperature.current ? temperature.current.toFixed(1) : "-";
							}

							valueUnit = temperatureUnit;
						}else if(mappedType == "Meter.Gas"){
							valueUnit = Util.CHAR.Gas;
						}else if(mappedType == "Meter.WattHour"){
							valueUnit = Util.CHAR.WattHour;
						}else if(mappedType == "Meter.Water"){
							valueUnit = Util.CHAR.Water;
						}else if(mappedType.indexOf("Light") != -1
                                 && (type.indexOf("AI") != -1 || type.indexOf("AO") != -1)){
							current = (device.lights && device.lights[0] && device.lights[0].dimmingLevel) ? device.lights[0].dimmingLevel : current;
							valueUnit = Util.CHAR.Humidity;
						}else if(mappedType.indexOf("Humidity") != -1){
							valueUnit = Util.CHAR.Humidity;
						}else if(mappedType.indexOf("Motion") != -1 && device.presences && device.presences[0]){
							current = device.presences[0].detected;
							current = current ? I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_PRESENCE") : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_ABSENCE");
							valueUnit = "";
						}else{
							valueUnit = "";
						}
					}
				}else if(type == "Meter.Gas" && device.meters && device.meters[0]){
					current = device.meters[0].reading;
					valueUnit = Util.CHAR.Gas;
				}else if(type == "Meter.WattHour" && device.meters && device.meters[0]){
					current = device.meters[0].reading;
					valueUnit = Util.CHAR.WattHour;
				}else if(type == "Meter.Water" && device.meters && device.meters[0]){
					current = device.meters[0].reading;
					valueUnit = Util.CHAR.Water;
				}else if(type.indexOf("Humidity") != -1 && device.humidities && device.humidities[0]){
					current = device.humidities[0].current;
					valueUnit = Util.CHAR.Humidity;
				}else if(type.indexOf("Light") != -1 && device.lights && device.lights[0]){
					current = device.lights[0].dimmingLevel;
					valueUnit = Util.CHAR.Humidity;
				}else if(type.indexOf("Motion") != -1 && device.presences && device.presences[0]){
					//current = (device.presences[0].detected+"").toUpperCase();
					var presence = device.presences;
					if(presence && presence[0]){
						presence = presence[0];
						current = presence.detected;
						current = current ? I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_PRESENCE") : I18N.prop("FACILITY_DEVICE_MOTION_SENSOR_PRESENCE_ABSENCE");
					}else{
						current = "-";
					}
					valueUnit = "";
				}

				//current 와 desired 숫자 값을 소수점 1자리 까지만 표시하기 위한 처리 부분.
				if(typeof current !== "undefined" && current !== null) {
					current = Util.convertNumberFormat(current);
					current = current + valueUnit;
				}
				if(typeof desired !== "undefined" && desired !== null) {
					desired = Util.convertNumberFormat(desired);
					desired = desired + valueUnit;
				}
			}

			return {
				current : current,
				desired : desired
			};
		},
		_getDeviceCoordinate : function(device, isMeasuredType){
			var self = this, options = self.options, mainWindow = window.MAIN_WINDOW,
				floor = options.floor ? options.floor : mainWindow.getCurrentFloor().floor, locations = device.locations, type = device.type;
			var assetLocation = typeof device.assets_types_id !== "undefined" ? device.location : null,
				isForcedShowDevice = options.isForcedShowDevice, curFloorId = floor.id, floorId;

			var geometry, zoneId, zonePolygon, coordinate, positionType;

			if((locations && locations.length > 0) || assetLocation){
				if(assetLocation && !isMeasuredType){
					if(device.mobilityType == "Movable"){   //자산 타입이 이동혈 일 때, Measured 좌표로 표시
						locations = Util.getBeaconLocation(device, "Measured");
						geometry = locations.geometry;
						zoneId = locations.foundation_space_zones_id;
						floorId = locations.foundation_space_floors_id;
					}else{  //자산의 Fixed Location
						geometry = assetLocation.geometry;
						zoneId = assetLocation.foundation_space_zones_id;
						floorId = assetLocation.foundation_space_floors_id;
					}
				}else if(type && type == "Beacon" || typeof device.assets_types_id !== "undefined"){  //자산의 Measured Location
					//Beacon의 경우 Fixed, Movable에 따라 location이 다르다.
					if(isMeasuredType){
						//Fixed인 타입일 때, Measured Location이 존재할 경우 다시 그림.
						locations = Util.getBeaconLocation(device, "Measured");
						geometry = locations.geometry;
						zoneId = locations.foundation_space_zones_id;
						floorId = locations.foundation_space_floors_id;
					}else{
						//포지션 타입 Movable은 Measured로, Fixed는 Fixed로
						positionType = Util.getPositionType(device);
						locations = Util.getBeaconTypeLocation(device, positionType);
						geometry = locations.geometry;
						zoneId = locations.foundation_space_zones_id;
						floorId = locations.foundation_space_floors_id;
					}
				}else{
					geometry = locations[0].geometry;
					zoneId = locations[0].foundation_space_zones_id;
					floorId = locations[0].foundation_space_floors_id;
				}

				if(zoneId){
					zonePolygon = self.getZonePolygon(zoneId);
				}

				if(geometry){
					coordinate = geometry.coordinates;
					if(!coordinate){
						coordinate = [];
						if(zonePolygon) coordinate = zonePolygon.originalCenterCoordinate;
						else coordinate = self._getCenterCoordinate();
					}
				}else if(zonePolygon) coordinate = zonePolygon.originalCenterCoordinate;
				else coordinate = self._getCenterCoordinate();
			}else{
				coordinate = self._getCenterCoordinate();
			}

			//Zone ID가 존재하나 zonePolygon을 얻지 못 하였을 경우
			if(zoneId && !zonePolygon){
				//기기 등록 맵뷰 팝업일 경우에는 층 내 Zone 존재 여부 or 층 존재 여부를 떠나 표시해야한다.
				//중앙에 표시한다.
				if(isForcedShowDevice) coordinate = self._getCenterCoordinate();
				else if(curFloorId == floorId && !self._isMissingZone) self._isMissingZone = true;	//기기 렌더링 가능하나 Zone Polygon이 존재하지 않음.
				else if(curFloorId != floorId) return null;  //해당 층에 기기의 Zone이 존재하지 않는 경우 표시 안함 -> 해당 층에 존재하지 않는 기기의 경우 표시 안함으로 변경
			}

			return {
				coordinate : coordinate,
				zonePolygon : zonePolygon
			};
		},
		_createDeviceIconMarker : function(device, coordinate, isMeasured, isOnlyShow){
			var imageKey, imageName, imgUrl, shadowUrl, self = this, options = self.options, type = device.type, modes = device.modes, operations = device.operations,
				nameDisplayCoordinate = device.nameDisplayCoordinate;
			var deviceModeImageName = options.deviceModeImageName, deviceTypeImageName = options.deviceTypeImageName, assetTypeImageName = options.assetTypeImageName,
				isRegisterView = options.isRegisterView, deviceIconSize = options.deviceIconSize, measuredDeviceIconSize = options.measuredDeviceIconSize,
				beaconImageName = options.beaconImageName, showDeviceValue = options.showDeviceValue, showDeviceText = options.showDeviceText,
				canDragDeviceIcon = options.canDragDeviceIcon, isAsset = typeof device.assets_types_id !== "undefined";
			var id = device.id, positionType = Util.getPositionType(device), status = Util.getStatus(device),
				isSelected = device.selected, name = self._getDeviceDisplayName(device), values = self._getDeviceDisplayValue(device),
				current = values.current, desired = values.desired;

			var x, y, latlng;
			if(coordinate instanceof L.LatLng){
				latlng = coordinate;
			}else{
				x = coordinate[0] + self._imagePosX;
				y = coordinate[1] + self._imagePosY;
				latlng = self.map.unproject([x, y], DEFAULT_PROJECT_ZOOM_SIZE);
			}

			var infoLatLng;
			//nameDisplayCoordinate 좌표 값이 없을 경우 기기 아이콘의 좌표를 기기 정보의 좌표로 한다.
			if(nameDisplayCoordinate){
				x = nameDisplayCoordinate[0] + self._imagePosX;
				y = nameDisplayCoordinate[1] + self._imagePosY;
				infoLatLng = self.map.unproject([x, y], DEFAULT_PROJECT_ZOOM_SIZE);
			}else{
				infoLatLng = latlng;
			}

			var classId = "device-id-" + id;

			if(isSelected) classId += " selected";

			var opacity;
			if(isMeasured){
				classId += " measured";
				opacity = 0.5;
			}else{
				opacity = 1;
			}

			if(positionType == "Movable"){ //Movable Type Icon에 대한 이미지 결정. Movable Type의 경우 물방울 아이콘 모양으로 표시해야한다.
				classId += " movable";
				if(isRegisterView){
					if(isSelected){
						shadowUrl = self._getIconUrl(beaconImageName.Selected);
					}else{
						shadowUrl = self._getIconUrl(beaconImageName.NotSelected);
					}
				}else if(status){
					shadowUrl = self._getIconUrl(beaconImageName[status]);
				}
			}else if(isRegisterView){	//기기 상태 색상 결정
				classId += " registered";
			}else if(status){
				status = status.toLowerCase().replace(/\./gi, "-");
				classId += " " + status;
				//이동형 자산의 경우 자산 이미지 사이즈를 줄인다
				//if(isAsset) opt.radius = radius - 4;
			}

			//기기 아이콘 결정
			if(modes && modes[0] && !isRegisterView){
				imageKey = Util.getDisplayMode(modes, operations);
				if(imageKey && deviceModeImageName[imageKey]) imgUrl = self._getIconUrl(deviceModeImageName[imageKey]);

			}else if(isRegisterView || isAsset || (!isRegisterView && type.indexOf("AirConditioner.") === -1)){
				imageKey = Util.getDisplayClassType(device);
				if(isAsset){
					imageName = assetTypeImageName[imageKey] ? assetTypeImageName[imageKey] : assetTypeImageName["etc"];
				}else{
					imageName = deviceTypeImageName[imageKey];
				}

				if(imageName) imgUrl = self._getIconUrl(imageName);
			}

			if(!imgUrl) imgUrl = self._getIconUrl();

			var iconAnchor = [deviceIconSize / 2, deviceIconSize / 2];
			var shadowAnchor = [iconAnchor[0], iconAnchor[1] + 3];

			var deviceIcon = L.icon({
				iconUrl : imgUrl,
				iconSize : [deviceIconSize, deviceIconSize],
				iconAnchor : iconAnchor,
				shadowUrl : shadowUrl,
				shadowAnchor : shadowAnchor,
				shadowSize : measuredDeviceIconSize,
				className : "common-map-view-device-icon " + classId
			});

			var draggable = (isMeasured || isOnlyShow) ? false : canDragDeviceIcon;
			var deviceIconMarkerZIndex = isMeasured ? MEASURED_DEVICE_DEFAULT_ZINDEX : DEVICE_LAYER_GROUP_ZINDEX;
			var deviceInfoMarkerZIndex = isMeasured ? MEASURED_DEVICE_DEFAULT_ZINDEX : DEVICE_INFO_LAYER_GROUP_ZINDEX;

			var textHtml = "";
			if(showDeviceValue){
				textHtml = Template.deviceTextbox(id, name, isAsset, current, desired);
			}else if(showDeviceText){
				textHtml = Template.deviceTextbox(id, name, isAsset);
			}

			var deviceIconMarker = L.marker(latlng, { icon : deviceIcon, draggable : draggable, zIndexOffset : deviceIconMarkerZIndex});

			var infoIcon = L.divIcon({ html : textHtml,
				className : "common-map-view-device-text " + classId,
				iconAnchor : [DEFAULT_DEVICE_INFO_WIDTH / 2 + 3, -(deviceIconSize / 2) + 3]
				//3은 Info Text 박스의 상/하/좌/우 Padding 값
			});
			var infoMarker = L.marker(infoLatLng, { icon : infoIcon, draggable : draggable, zIndexOffset : deviceInfoMarkerZIndex, opacity : opacity });
			//기기 이름 정보 이동을 위하여 Tooltip에서 Marker로 대체
			//marker.bindTooltip(textHtml, {direction : "bottom", permanent : true, offset : [0, 8],
			//	interactive : true, className : "common-map-view-device-text " + classId, opacity : opacity});
			deviceIconMarker.device = device;
			deviceIconMarker.infoMarker = infoMarker;
			infoMarker.deviceIconMarker = deviceIconMarker;

			//디바이스 아이콘 마커에 드래그 이벤트 바인딩
			if(canDragDeviceIcon){
				deviceIconMarker.on("dragstart", self._dragStartDeviceIconMarkerEvt.bind(self));
				deviceIconMarker.on("drag", self._dragDeviceIconMarkerEvt.bind(self));
				deviceIconMarker.on("dragend", self._dragEndDeviceIconMarkerEvt.bind(self));
				infoMarker.on("dragstart", self._dragStartDeviceInfoEvt.bind(self));
				//infoMarker.on("drag", self._dragDeviceInfoEvt.bind(self));
				infoMarker.on("dragend", self._dragEndDeviceInfoEvt.bind(self));
				//marker.on("move", self._moveDeviceIconMarkerEvt.bind(self));
			}

			return deviceIconMarker;
		},
		_dragStartDeviceIconMarkerEvt : function(e){
			var self = this, deviceId, deviceIcon = e.target, deviceInfoMarker = deviceIcon.infoMarker;
			var deviceIconElement = deviceIcon.getElement();
			//선택 상태 아닐 시, 선택 상태로 변경
			if(!deviceIconElement.classList.contains("selected")){
				deviceId = self.getDataIdFromElement(deviceIconElement, "device");
				self.selectDevice(deviceId, true, true);
			}
			/*
            *   드래그 하기 전의 좌표 값과 선택된 레이어를 저장
            */
			deviceIcon._beforeDragLatlng = deviceIcon.getLatLng();
			deviceInfoMarker._beforeDragLatlng = deviceInfoMarker.getLatLng();
			self._selectedLayersBeforeDrag = [];
			var element, layer, deviceLayers = self.deviceLayerGroup.getLayers();
			var i, max = deviceLayers.length;

			for( i = 0; i < max; i++ ){
				layer = deviceLayers[i];
				if(layer instanceof L.Marker){
					element = layer.getElement();
					if(element.classList.contains("selected") && !layer.isOnlyShow){
						layer._beforeDragLatlng = layer.getLatLng();
						layer.infoMarker._beforeDragLatlng = layer.infoMarker.getLatLng();
						self._selectedLayersBeforeDrag.push(layer);
					}
				}
			}
		},
		_dragEndDeviceIconMarkerEvt : function(e){
			var self = this, deviceIcon = e.target, map = self.map, MainWindow = window.MAIN_WINDOW,
				curFloor = MainWindow.getCurrentFloor(), building = curFloor.building,
				buildingName = building.name, floorName = MainWindow.getCurrentFloorName(), zoneName;
			var layer, infoLayer, layerLatLng, zoneLayer, deviceLayers = self._selectedLayersBeforeDrag,
				zoneLayers = self.zoneLayerGroup.getLayers(), mapMaxBounds = self.getMaxBounds();
			var i, j, max = deviceLayers.length, length = zoneLayers.length;
			var mapNorth = mapMaxBounds.getNorth(), mapWest = mapMaxBounds.getWest(),
				mapEast = mapMaxBounds.getEast(), mapSouth = mapMaxBounds.getSouth(),
				layerBounds, layerNorth, layerWest, layerEast, layerSouth, device, locations,
				movedLocations, nameDisplayCoordinate;

			var movedDevice, movedDevices = [];

			//Drag 성공 후 완료 시, 클릭 이벤트 연쇄 발생하는 것을 막기 위한 Flag
			self._isDraggingEnd = true;

			for( i = 0; i < max; i++ ){
				layer = deviceLayers[i];
				infoLayer = layer.infoMarker;
				device = layer.device;
				locations = device.locations;
				nameDisplayCoordinate = device.nameDisplayCoordinate;
				if(!locations || !locations[0]){
					device.locations = [{ id : "Fixed", geometry : { type : "Point", coordinates : []}}];
					locations = device.locations;
				}else if(!locations[0].geometry){
					locations[0].geometry = { type : "Point", coordinates : []};
				}

				if(layer instanceof L.Marker){
					layerLatLng = layer.getLatLng();
					layerBounds = self._getDeviceIconMarkerBounds(layerLatLng);
					layerNorth = layerBounds.north;
					layerEast = layerBounds.east;
					layerWest = layerBounds.west;
					layerSouth = layerBounds.south;
					//맵 영역의 최대/최소 체크하여 해당 경계를 넘어간 경우, 드래그 하기 전의 위치로 롤백
					if(layerNorth > mapNorth || layerWest < mapWest
                       || layerSouth < mapSouth || layerEast > mapEast ){
						layer.setLatLng(layer._beforeDragLatlng);
						infoLayer.setLatLng(layer._beforeDragLatlng);
						//Drag 시도 했던 기기 아이콘이 이동 전의 위치로 이동하였으므로, 클릭 이벤트 연쇄 발생하지 않음 Flag 값을 원복
						if(self._isDraggingEnd && layer === deviceIcon) self._isDraggingEnd = false;

					}else{
						movedDevice = { id : device.id, locations : [{ id : "Fixed", geometry : { type : "Point" } }] };
						locations = locations[0];
						movedLocations = movedDevice.locations[0];
						//이동된 위치에 존 포함여부를 체크하여 존 상태 업데이트
						for( j = 0; j < length; j++ ){
							zoneLayer = zoneLayers[j];
							if(zoneLayer instanceof L.Polygon && self.isLayerInPolygon(layer, zoneLayer)){
								//console.log("layer " + device.name + " in " + zoneLayer.zone.name);
								locations.foundation_space_zones_id = movedLocations.foundation_space_zones_id = zoneLayer.zone.id;
								zoneName = zoneLayer.zone.name;
							}
						}
						//이동된 위치를 업데이트
						layerLatLng = layer.getLatLng();
						layerLatLng = map.project(layerLatLng, DEFAULT_PROJECT_ZOOM_SIZE);

						locations.description = buildingName + ", " + floorName;
						//Zone을 벗어나는 경우 0으로 설정
						if(!movedLocations.foundation_space_zones_id) locations.foundation_space_zones_id = movedLocations.foundation_space_zones_id = 0;
						else locations.description += ("," + zoneName);

						locations.geometry.coordinates = movedLocations.geometry.coordinates = [layerLatLng.x, layerLatLng.y];
						if(!nameDisplayCoordinate) device.nameDisplayCoordinate = locations.geometry.coordinates;

						//기기 이름 정보 텍스트 박스의 맵 화면 이탈을 체크 한다.
						//이탙하지 않았을 경우 nameDisplayCoordinate 값을 할당한다.
						if(self._checkDeviceInfoMarkerBounds(infoLayer)){
							movedDevice.nameDisplayCoordinate = device.nameDisplayCoordinate;
						}

						movedDevices.push(movedDevice);
					}
					//delete layer._beforeDragLatlng;
				}
			}

			delete deviceIcon._draggingLatLng;
			self._selectedLayersBeforeDrag.length = 0;
			self._selectedLayersBeforeDrag = null;
			self.trigger("dragend", { devices : movedDevices });
		},
		_dragDeviceIconMarkerEvt : function(e){
			//console.log("drag");
			//console.log(e);

			var self = this, deviceIcon = e.target, curLatLng = e.latlng, oldLatLng = e.oldLatLng;

			deviceIcon.setLatLng(e.latlng);
			//var variationLat = curLatLng.lat - deviceIconLatLng.lat;
			//var variationLng = curLatLng.lng - deviceIconLatLng.lng;
			var variationLat, variationLng;
			if(!deviceIcon._draggingLatLng){
				deviceIcon._draggingLatLng = curLatLng;
				variationLat = curLatLng.lat - oldLatLng.lat;
				variationLng = curLatLng.lng - oldLatLng.lng;
			}else{
				variationLat = curLatLng.lat - deviceIcon._draggingLatLng.lat;
				variationLng = curLatLng.lng - deviceIcon._draggingLatLng.lng;
				deviceIcon._draggingLatLng = curLatLng;
			}

			var layerLatLng, newLayerLatLng, layer, deviceLayers = self._selectedLayersBeforeDrag;
			//기기 정보 텍스트 박스 이동
			layerLatLng = deviceIcon.infoMarker.getLatLng();
			newLayerLatLng = L.latLng(layerLatLng.lat + variationLat, layerLatLng.lng + variationLng);
			deviceIcon.infoMarker.setLatLng(newLayerLatLng);

			//선택한 디바이스를 모두 이동시키도록 좌표 값 업데이트
			//데이터 체크 후 ID로 SVG 요소 참조 시, 2번 For문 돌게되므로, 바로 SVG 요소 객체들에 접근하여 selected class로 검사
			/*var selectedData, data = ds.data();
            selectedData = new kendo.data.Query(data).filter({ field : "selected", operator : "eq", value : true});
            selectedData = selectedData.toArray();
            var i, max = selectedData.length;
            */

			var i, max = deviceLayers.length;
			for( i = 0; i < max; i++ ){
				layer = deviceLayers[i];
				if(layer instanceof L.Marker && layer !== deviceIcon){
					//선택한 다른 기기들 이동
					layerLatLng = layer.getLatLng();
					newLayerLatLng = L.latLng(layerLatLng.lat + variationLat, layerLatLng.lng + variationLng);
					layer.setLatLng(newLayerLatLng);

					//선택한 다른 기기들의 기기 정보 텍스트 박스 이동
					layerLatLng = layer.infoMarker.getLatLng();
					newLayerLatLng = L.latLng(layerLatLng.lat + variationLat, layerLatLng.lng + variationLng);
					//기기 정보 텍스트 박스 이동
					layer.infoMarker.setLatLng(newLayerLatLng);
				}
			}
		},
		_dragStartDeviceInfoEvt : function(e){
			var deviceInfoMarker = e.target;
			deviceInfoMarker._beforeDragLatlng = deviceInfoMarker.getLatLng();
		},
		_dragEndDeviceInfoEvt : function(e){
			var self = this, deviceInfoMarker = e.target,
				deviceIconMarker, device, movedDevice;
			self._isDraggingEnd = true;

			if(self._checkDeviceInfoMarkerBounds(deviceInfoMarker)){
				deviceIconMarker = deviceInfoMarker.deviceIconMarker;
				device = deviceIconMarker.device;
				movedDevice = { id : device.id, nameDisplayCoordinate : device.nameDisplayCoordinate };
				self.trigger("dragend", { devices : [ movedDevice ] });
			}
		},
		_checkDeviceInfoMarkerBounds : function(deviceInfoMarker){
			//Device 정보 텍스트 박스 위치의 맵 화면 이탈 체크
			var self = this, mapMaxBounds = self.getMaxBounds();
			var mapNorth = mapMaxBounds.getNorth(), mapWest = mapMaxBounds.getWest(), mapEast = mapMaxBounds.getEast(), mapSouth = mapMaxBounds.getSouth();
			var layerBounds = self._getMarkerBounds(deviceInfoMarker), layerNorth = layerBounds.getNorth(), layerEast = layerBounds.getEast();
			var layerWest = layerBounds.getWest(), layerSouth = layerBounds.getSouth();
			if(layerNorth > mapNorth || layerWest < mapWest
			   || layerSouth < mapSouth || layerEast > mapEast ){
				deviceInfoMarker.setLatLng(deviceInfoMarker._beforeDragLatlng);
				//Drag 시도 했던 기기 아이콘이 이동 전의 위치로 이동하였으므로, 클릭 이벤트 연쇄 발생하지 않음 Flag 값을 원복
				if(self._isDraggingEnd) self._isDraggingEnd = false;
				return false;
			}
			//Device Model 업데이트
			var deviceIconMarker = deviceInfoMarker.deviceIconMarker;
			var device = deviceIconMarker.device;
			//Zone 편집 시, 동작하는 사양이 아니므로 changedData에 추가 불필요.
			//self._addChangedData(self._changedDevices, device, "nameDisplayCoordinate");
			var markerPoint = self.map.project(deviceInfoMarker.getLatLng(), DEFAULT_ZOOM_SIZE);
			device.nameDisplayCoordinate = [markerPoint.x, markerPoint.y];
			return true;
		},
		isLayerInPolygon : function(layer, polygon) {
			var polyPoints = polygon.getLatLngs();
			polyPoints = polyPoints[0];
			var latLng = layer instanceof L.Layer ? layer.getLatLng() : layer;

			var x = latLng.lat, y = latLng.lng;

			var inside = false;
			for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
				var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
				var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

				var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
				if (intersect) inside = !inside;
			}

			return inside;
		},
		getDataIdFromElement : function(element, key){
			var id, classList = element.classList;
			var i, max = classList.length;
			if(!key) key = "device";

			key = key + "-id-";

			for( i = 0; i < max; i++ ){
				if(classList[i].indexOf(key) != -1){
					id = classList[i].replace(key, "");
					return id;
				}
			}
			return null;
		},
		_getIconUrl : function(imageName){
			return Util.addBuildDateQuery("../../src/main/resources/static-dev/images/icon/" + imageName + ".png");
		},
		_getDeviceIconMarkerBounds : function(markerLatlng){
			var self = this, map = self.map, options = self.options, deviceIconSize = options.deviceIconSize;
			var curZoomLevel = map.getZoom();

			var x, y;
			var factor = deviceIconSize / 2;
			var point = map.project(markerLatlng, curZoomLevel);
			x = point.x - factor; y = point.y;
			var west = map.unproject([x, y], curZoomLevel);
			x = point.x + factor; y = point.y;
			var east = map.unproject([x, y], curZoomLevel);
			x = point.x; y = point.y - factor;
			var north = map.unproject([x, y], curZoomLevel);
			x = point.x; y = point.y + factor;
			var south = map.unproject([x, y], curZoomLevel);

			return {
				west : west.lng,
				east : east.lng,
				north : north.lat,
				south : south.lat
			};
		},
		_getMarkerBounds : function(marker){
			var self = this, map = self.map;
			var latlng = marker.getLatLng();
			var point = map.project(latlng, map.getZoom());
			var element = marker.getElement();
			var width = element.offsetWidth, height = element.offsetHeight;
			var southWest = [point.x, point.y + height];
			var northEast = [point.x + width, point.y];
			southWest = map.unproject(southWest, map.getZoom());
			northEast = map.unproject(northEast, map.getZoom());
			var bounds = L.latLngBounds(southWest, northEast);
			return bounds;
		},
		//Deprecated SVG Circle에서 Marker로 변경
		_createDeviceCircle : function(device, coordinate, isMeasured){
			var self = this, options = this.options, radius = options.deviceIconRadius, movableBeaconColorOptions = options.movableBeaconColorOptions,
				showDeviceValue = options.showDeviceValue, showDeviceText = options.showDeviceText, isRegisterView = options.isRegisterView;

			var id = device.id, positionType = Util.getPositionType(device), status = Util.getStatus(device),
				isSelected = device.selected, isAsset = typeof device.assets_types_id !== "undefined",
				name = self._getDeviceDisplayName(device), values = self._getDeviceDisplayValue(device),
				current = values.current, desired = values.desired;

			var classId = "device-id-" + id;
			var latlng, curZoom = self.map.getZoom();
			if(coordinate instanceof L.LatLng) latlng = coordinate;
			else latlng = self.map.unproject([coordinate[0], coordinate[1]], curZoom);


			var opacity = isMeasured ? 0.5 : 1;
			var fillColor, opt = {radius : radius, fillOpacity : opacity, className : "common-map-view-device-circle " + classId, interactive : true};

			if(isSelected) $.extend(opt, options.deviceStrokeColorOptions.Selected);
			else $.extend(opt, options.deviceStrokeColorOptions.NotSelected);

			if(isRegisterView){
				if(isSelected){
					if(positionType == "Movable") fillColor = options.movableBeaconColorOptions.Selected;
					else fillColor = options.deviceColorOptions.Selected;
				}else if(positionType == "Movable") fillColor = options.movableBeaconColorOptions.NotSelected;
				else fillColor = options.deviceColorOptions.NotSelected;
			}else if(status){
				if(positionType == "Movable") fillColor = movableBeaconColorOptions[status] ? movableBeaconColorOptions[status] : movableBeaconColorOptions["Normal.On"];
				else fillColor = options.deviceColorOptions[status] ? options.deviceColorOptions[status] : options.deviceColorOptions["Normal.On"];
				//이동형 자산의 경우 자산 이미지 사이즈를 줄인다
				//if(isAsset) opt.radius = radius - 4;
			}

			opt.fillColor = fillColor;
			//기기 아이콘 Marker로 드래그 하므로 삭제
			//opt.draggable = canDragDeviceIcon;
			var textHtml = "";
			if(showDeviceValue){
				textHtml = Template.deviceTextbox(id, name, isAsset, current, desired);
			}else if(showDeviceText){
				textHtml = Template.deviceTextbox(id, name, isAsset);
			}

			var circle = L.circle(latlng, opt);
			circle.bindTooltip(textHtml, {direction : "bottom", permanent : true, offset : [0, 8],
				interactive : true, className : "common-map-view-device-text " + classId, opacity : opacity});
			circle.device = device;

			/*if(canDragDeviceIcon){
                circle.on("move", self._moveDeviceCircleEvt);
            }*/

			return circle;
		},
		removeDevice : function(device){
			var self = this;
			var deviceIcon = self.getDeviceIcon(device.id);
			if(deviceIcon){
				self._removeDeviceIcon(deviceIcon);
			}
			return false;
		},
		_removeDeviceIcon : function(deviceIcon){
			var self = this;
			self.deviceLayerGroup.removeLayer(deviceIcon);
			if(deviceIcon.infoMarker){
				self.deviceInfoLayerGroup.removeLayer(deviceIcon.infoMarker);
				deviceIcon.infoMarker.remove();
			}
			if(deviceIcon.measuredDeviceIcon){
				self.deviceLayerGroup.removeLayer(deviceIcon.measuredDeviceIcon);
				deviceIcon.measuredDeviceIcon.remove();
			}
			deviceIcon.remove();
		},
		removeZone : function(zone){
			var self = this, zoneId = zone.id;
			var zonePolygon = self.getZonePolygon(zoneId);

			if(zonePolygon){
				//Zone이 삭제됨으로써, 기존 기기의 선택 해제 및 Model 내 Zone ID 업데이트
				self._removeZoneIdInDevices(zonePolygon, true);
				//Polygon 삭제
				self._removeZonePolygon(zonePolygon);
			}
			return false;
		},
		_removeZonePolygon : function(zonePolygon){
			var self = this;
			if(zonePolygon.transform) zonePolygon.transform.disable();
			self.zoneLayerGroup.removeLayer(zonePolygon);
			if(zonePolygon.zoneNameMarker){
				self.zoneLayerGroup.removeLayer(zonePolygon.zoneNameMarker);
				zonePolygon.zoneNameMarker.remove();
			}
			zonePolygon.remove();
		},
		getDeviceIcon : function(deviceId){
			var layer, layers = this.deviceLayerGroup.getLayers();
			var i, max = layers.length;
			for( i = 0; i < max; i++ ){
				layer = layers[i];
				if(layer instanceof L.Marker && layer.device.id == deviceId){
					return layer;
				}
			}
			return null;
		},
		getZonePolygon : function(zoneId){
			var layer, layers = this.zoneLayerGroup.getLayers();
			var i, max = layers.length;
			for( i = 0; i < max; i++ ){
				layer = layers[i];
				if(layer instanceof L.Polygon && layer.zone.id == zoneId){
					return layer;
				}
			}
			return null;
		},
		_getCenterInMapView : function(){
			//var centerX = this.mapViewWidth / 2;
			//var centerY = this.mapViewHeight / 2;
			var centerX = this.maxWidth / 2;
			var centerY = this.maxHeight / 2;
			return [centerX, centerY];
		},
		_getCenterCoordinate : function(){
			var self = this;
			var centerMapPos = self._getCenterInMapView();
			centerMapPos[0] = centerMapPos[0] - self._imagePosX;
			centerMapPos[1] = centerMapPos[1] - self._imagePosY;
			return centerMapPos;
		},
		moveCenterView : function(){
			var self = this;
			var centerPos = self._getCenterInMapView();
			centerPos = self.map.unproject(centerPos, DEFAULT_ZOOM_SIZE);
			self.map.setView(centerPos, DEFAULT_ZOOM_SIZE);
		},
		_applyImagePositionToCoordinate : function(coordinates){
			var self = this;
			coordinates = coordinates[0];
			var coordinate, i, max = coordinates.length;
			for( i = 0; i < max; i++ ){
				coordinate = coordinates[i];
				coordinate[0] = coordinate[0] + self._imagePosX;
				coordinate[1] = coordinate[1] + self._imagePosY;
			}
		},
		//Leaflet 맵뷰를 표시하기 위한 좌표계로 변경
		_unprojectCoordinatesForRender : function(coordinates){
			var map = this.map,
				unprojectedCoordinate, unprojectedCoordinates = [];

			coordinates = coordinates[0];
			var coordinate, i, max = coordinates.length;
			for( i = 0; i < max; i++ ){
				coordinate = coordinates[i];
				unprojectedCoordinate = map.unproject(coordinate, DEFAULT_PROJECT_ZOOM_SIZE);
				unprojectedCoordinates.push(unprojectedCoordinate);
			}
			return unprojectedCoordinates;
		},
		//X,Y 좌표계로 변경
		_projectCoordinatesForModel : function(coordinates){
			var map = this.map,
				projectedCoordinate, projectedCoordinates = [];

			coordinates = coordinates[0];
			var coordinate, i, max = coordinates.length;
			for( i = 0; i < max; i++ ){
				coordinate = coordinates[i];
				projectedCoordinate = map.project(coordinate, DEFAULT_PROJECT_ZOOM_SIZE);
				projectedCoordinates.push([projectedCoordinate.x, projectedCoordinate.y]);
			}
			return [projectedCoordinates];
		},
		deviceDragDrop: function(options){
			var self = this, element = self.element;

			if(self.element.data("uiDraggable")) self.element.data("uiDraggable").destroy();

			var defaultOpt = {
				deviceIconElem : null,
				selectedRows : null,
				selectedData : null
			};

			if(!options) options = {};
			$.extend(defaultOpt, options);
			if(!options.selectedRows || !options.deviceIconElem || !options.selectedData){
				console.error("Common Map View needs deviceIconElem, selectedRows, selectedData options for drag & drop");
				return;
			}

			var deviceIconElem = options.deviceIconElem, selectedRows = options.selectedRows, selectedData = options.selectedData;
			var cloneIcon = deviceIconElem.clone();
			cloneIcon.css("margin", 0);
			cloneIcon = cloneIcon.get(0).outerHTML;

			$(selectedRows).draggable({
				revert : function(isDropped){
					var draggableElem = $(this);
					if(draggableElem.hasClass("is-revert")){
						draggableElem.removeClass("is-revert");
						return true;
					}
					return !isDropped;
				},
				appendTo : "body",
				containment : "#main-contents",
				revertDuration : 200,
				helper : "clone",
				zIndex : 100,
				cursor : "move",
				start : function(e, dragui){
					dragui.helper.html(cloneIcon);
				}
			});

			element.droppable({
				drop : function(e, dropui){
					var targetTop = dropui.offset.top,
						targetLeft = dropui.offset.left;
					var mapOffset = self.element.offset();
					var mapBounds = self.map.getPixelBounds();
					//var mapBoundsMax = mapBounds.max;
					var mapOffsetMin = mapBounds.min;
					var mapTop = mapOffset.top, mapLeft = mapOffset.left;
					var mapBoundsX = mapOffsetMin.x,
						mapBoundsY = mapOffsetMin.y;
					var curZoom = self.map.getZoom();

					var x = targetLeft - (mapLeft - mapBoundsX) + self.options.deviceIconSize / 2;
					var y = targetTop - (mapTop - mapBoundsY) + self.options.deviceIconSize / 2;

					//지도의 maxBounds를 체크하여 범위를 벗어날 경우 드래그 할 아이템의 Revert 수행
					var latLng = self.map.unproject([x, y], curZoom);
					var maxLatLng = self.getMaxBounds();
					if(!maxLatLng.contains(latLng)){
						//console.log("revert!");
						dropui.draggable.addClass("is-revert");
						return false;
					}

					var deviceIcon = self.createDeviceIcon(selectedData[0], latLng);

					//Tooltip 위치 및 사이즈를 현재 Zoom 상태에 맞게 Refresh
					//self.map.fire("zoomend");
					//기기 정보 텍스트 박스는 Tooltip 대신 Marker로 대체됨
					//var tooltip = deviceIcon.getTooltip();
					//tooltip.setLatLng(latLng);

					//해당 위치의 Zone 여부 체크
					var zoneLayer, zoneLayers = self.zoneLayerGroup.getLayers();
					var i, max = zoneLayers.length;
					var zoneId, zoneName;
					for( i = 0; i < max; i++ ){
						zoneLayer = zoneLayers[i];
						if(zoneLayer instanceof L.Polygon && self.isLayerInPolygon(deviceIcon, zoneLayer)){
							//console.log("layer " + deviceIcon.device.name + " in " + zoneLayer.zone.name);
							zoneId = zoneLayer.zone.id;
							zoneName = zoneLayer.zone.name;
							break;
						}
					}

					var mainWindow = window.MAIN_WINDOW;
					var curFloor = mainWindow.getCurrentFloor();
					var buildingId = curFloor.building.id,
						buildingName = curFloor.building.name;
					var floorId = curFloor.floor.id,
						floorName = mainWindow.getCurrentFloorName();

					//Zoom In/Out이 적용된 Point 좌표 재계산
					var point = self.map.project(latLng, DEFAULT_PROJECT_ZOOM_SIZE);
					x = point.x; y = point.y;

					var locations = [{ id : "Fixed" }];
					locations[0].foundation_space_buildings_id = buildingId;
					locations[0].foundation_space_floors_id = floorId;
					locations[0].geometry = {
						type : "Point",
						coordinates : [x, y]
					};
					locations[0].description = buildingName + ", " + floorName;

					if(zoneId) locations[0].foundation_space_zones_id = zoneId;
					else locations[0].foundation_space_zones_id = 0;

					if(zoneName) locations[0].description += (", " + zoneName);

					max = selectedData.length;
					var device, devices = [];
					for( i = 0; i < max; i++ ){
						device = selectedData[i];
						devices.push({ id : device.id, locations : locations, registrationStatus : "Registered" });
					}

					var result = {
						devices : devices,
						selectedData : selectedData,
						selectedRows : selectedRows,
						deviceIcon : deviceIcon
					};

					self.trigger("drop", result);

					//self._removeDeviceCircle(circle);
				}
			});
		},
		getMaxBounds : function(zoomSize){
			if(!zoomSize) zoomSize = DEFAULT_PROJECT_ZOOM_SIZE;

			var self = this;
			var southWest = self.map.unproject([0, self.maxHeight], zoomSize);
			var northEast = self.map.unproject([self.maxWidth, 0], zoomSize);
			return new L.LatLngBounds(southWest, northEast);
		},
		setFloor : function(floorObj){
			var options = this.options;
			options.floor = floorObj;
			this._setMapImage();
		},
		setDataSource : function(dataSource){
			self._isDraggingEnd = false;
			this.options.dataSource = dataSource;
			//console.time('created device data source');
			this._createDeviceDataSource(dataSource);
			//console.timeEnd('created device data source');
			//console.time('_renderDevices');
			this._renderDevices();
			//console.timeEnd('_renderDevices');
		},
		setZoneDataSource : function(dataSource){
			self._isZoneDraggingEnd = false;
			this.setEditableZone(false);
			this.options.zoneDataSource = dataSource;
			this._createZoneDataSource(dataSource);
			this._renderZones();
		},
		setHeatMapDataSource : function(dataSource){
			this.options.heatMapDataSource = dataSource;
			this._createHeatMapDataSource(dataSource);
			this._renderHeatMap();
		},
		getSelectedData : function(){
			var data, selectedData = [];
			if(this.dataSource){
				data = this.dataSource.data();
				selectedData = new kendo.data.Query(data).filter({ field : "selected", operator : "eq", value : true});
				selectedData = selectedData.toArray();
			}
			return selectedData;
		},
		getSelectedZone : function(){
			var data, selectedData = [];
			if(this.zoneDataSource){
				data = this.zoneDataSource.data();
				selectedData = new kendo.data.Query(data).filter({ field : "selected", operator : "eq", value : true});
				selectedData = selectedData.toArray();
			}
			return selectedData;
		},
		getUpdatedZones : function(){
			var self = this;
			var deletedZones = [], createdZones = [], updatedZones = [];
			var zone, zoneId, originalZone, changedZoneDataSource = self._changedZones ? self._changedZones : new kendo.data.DataSource({ data : [] }),
				zoneDataSource = self.zoneDataSource;
			var changedField, changedFields, changedZones = changedZoneDataSource.data();
			var i, j, length, max = changedZones.length;
			var updatedZone, floorObj, floorId, buildingId;
			var MainWindow = window.MAIN_WINDOW;
			for( i = 0; i < max; i++ ){
				originalZone = changedZones[i];
				zoneId = originalZone.id;
				zone = zoneDataSource.get(zoneId);
				if(zone){
					if(zone._isNew){	//생성된 존
						zone = zone.toJSON();
						delete zone._isNew;
						floorObj = MainWindow.getCurrentFloor();
						floorId = floorObj.floor.id;
						buildingId = floorObj.building.id;
						zone.foundation_space_buildings_id = buildingId;
						zone.foundation_space_floors_id = floorId;
						createdZones.push(zone);
					}else{				//업데이트 된 존
						changedFields = changedZoneDataSource._changedFields[zoneId];
						length = changedFields.length;
						updatedZone = { id : zoneId };
						for( j = 0; j < length; j++ ){
							changedField = changedFields[j];
							Util.setter(updatedZone, changedField, zone.get(changedField));
						}
						updatedZones.push(updatedZone);
					}
				}else if(!originalZone._isNew){
					//삭제된 존
					//새로 생성된 Zone의 ID가 Zone 데이터소스에 존재하지 않을 경우는 임의의 ID 값이 변경된 것으로 Deleted에 추가하지 않는다.
					zone = originalZone.toJSON();
					deletedZones.push({ id : zoneId });
				}
			}

			return {
				deleted : deletedZones,
				created : createdZones,
				updated : updatedZones
			};
		},
		getUpdatedDevices : function(){
			var self = this;
			var updatedDevices = [];
			var device, deviceId, originalDevice, changedDeviceDataSource = self._changedDevices ? self._changedDevices : new kendo.data.DataSource({ data : [] }),
				changedDevices = changedDeviceDataSource.data(),
				dataSource = self.dataSource, changedField, changedFields, updatedDevice;

			var i, j, length, max = changedDevices.length;
			for( i = 0; i < max; i++ ){
				originalDevice = changedDevices[i];
				deviceId = originalDevice.id;
				device = dataSource.get(deviceId);
				if(device){
					changedFields = changedDeviceDataSource._changedFields[deviceId];
					length = changedFields.length;
					updatedDevice = { id : deviceId };
					for( j = 0; j < length; j++ ){
						changedField = changedFields[j];
						Util.setter(updatedDevice, changedField, device.get(changedField));
					}
					updatedDevices.push(updatedDevice);
				}
			}

			return {
				updated : updatedDevices
			};
		},
		selectAll : function(){
			this._selectAll(true);
		},
		unselectAll : function(){
			this._selectAll(false);
		},
		_selectAll : function(isSelect){
			var self = this;
			var zoneLayer, deviceLayer, deviceLayerGroup = self.deviceLayerGroup, deviceLayers = deviceLayerGroup.getLayers();
			var zoneLayerGroup = self.zoneLayerGroup, zoneLayers = zoneLayerGroup.getLayers();

			var i, max = deviceLayers.length;
			for( i = 0; i < max; i++ ){
				deviceLayer = deviceLayers[i];
				if(deviceLayer instanceof L.Marker){
					self._selectDeviceIcon(deviceLayer, isSelect);
				}
			}
			max = zoneLayers.length;
			for( i = 0; i < max; i++ ){
				zoneLayer = zoneLayers[i];
				if(zoneLayer instanceof L.Polygon){
					self._selectZonePolygon(zoneLayer, isSelect);
				}
			}
		},
		clearEditableZone : function(){
			var self = this, zoneLayerGroup = self.zoneLayerGroup, zoneLayers = zoneLayerGroup.getLayers();
			var zoneLayer, i, max = zoneLayers.length;
			var element, classList;
			for( i = 0; i < max; i++ ){
				zoneLayer = zoneLayers[i];
				element = zoneLayer.getElement();
				classList = element.classList;
				if(zoneLayer instanceof L.Polygon && classList.contains("editable")){
					self._editableZone(zoneLayer, false);
				}
			}
		},
		setEditableZone : function(isEnable){
			var self = this;
			self._isEditableZone = isEnable;
			if(!self._changedDevices) self._changedDevices = new kendo.data.DataSource({ data : [] });
			if(!self._changedZones) self._changedZones = new kendo.data.DataSource({ data : [] });
			// 존 편집모드 변경시, 이전에 기기 선택을 해제하고, 편집 모드 여부에 따라 존의 zindex 가 변하기 때문에 존을 다시 그려준다.
			self.unselectAll();
			self.clearEditableZone();
			self._renderZones();

			if(self.colorPickerControl){
				if(isEnable){
					self.colorPickerControl.show();
				}else{
					self.colorPickerControl.hide();
					self.colorPickerControl.active(false);
					self.colorPickerControl.disable();
					self.colorPickerControl.colorPicker.close();
					self.clearEditableZone();
					self._changedDevices = null;
					self._changedZones = null;
				}
			}
		},
		cancel : function(){
			var self = this;
			if(self._isEditableZone){
				//추가 또는 삭제, 변경된 Zone 및 Device Data를 되돌린다.
				self._isCancelChanges = true;
				self.unselectAll();
				self._cancelChangesInDataSource(self._changedZones, self.zoneDataSource);
				self._cancelChangesInDataSource(self._changedDevices, self.dataSource);
				self.zoneDataSource.cancelChanges();
				self.dataSource.cancelChanges();
				self._isCancelChanges = false;
				//self.setEditableZone(false);
			}
		},
		//dataSource의 추가/삭제 등에 대해서는 원본이 유지되지만,
		//중첩된 객체 내 필드 값 변경에 대해서는 dataSource의 _pristineData가 원본으로 유지되지 않으므로.
		//self._changedDevices와 self._changedZones에 DataSource로 변경되기 전 Original Data를 유지하고,
		//Cancel을 할 경우 해당 데이터를 덮어씌워 _pristineData를 바꾸어준다. 그리고 cancelChanges()를 호출하여 "change" 콜백에서 데이터를 다시 렌더링한다.
		_cancelChangesInDataSource : function(originalDataSource, targetDataSource){
			var id, targetItem, originalItem, originalDatas = originalDataSource.data();
			var changedField, changedFields;

			var i, j, length, max = originalDatas.length;
			for( i = 0; i < max; i++ ){
				originalItem = originalDatas[i];
				id = originalItem.id;
				targetItem = targetDataSource.get(id);
				if(targetItem){	//변경된 데이터의 원복
					changedFields = originalDataSource._changedFields[id];
					length = changedFields.length;
					for( j = 0; j < length; j++ ){
						changedField = changedFields[j];
						Util.setter(targetItem, changedField, originalItem.get(changedField));
					}
				}
			}
		},
		isIntersectZonePolygons : function(){
			var self = this, zoneLayerGroup = self.zoneLayerGroup;
			var sourceLayer, targetLayer, layers = zoneLayerGroup.getLayers();
			var i, j, max = layers.length;
			var isIntersect = false;
			for( i = 0; i < max; i++ ){
				sourceLayer = layers[i];
				if(sourceLayer instanceof L.Polygon){
					for( j = i + 1; j < max; j++ ){
						targetLayer = layers[j];
						if(targetLayer instanceof L.Polygon){
							if(self.isIntersectPolygon(sourceLayer, targetLayer)){
								//console.log(sourceLayer.zone.name + " intersect with " + targetLayer.zone.name);
								isIntersect = true;
								return isIntersect;
							}
						}
					}
				}
			}
			return isIntersect;
		},
		getCenterZoneId : function(){
			var self = this;
			var centerPos = self._getCenterCoordinate();
			centerPos = self.map.unproject(centerPos, DEFAULT_ZOOM_SIZE);
			var zoneLayerGroup = self.zoneLayerGroup, zoneLayers = zoneLayerGroup.getLayers(),
				zoneLayer;
			var i, max = zoneLayers.length;
			for( i = 0; i < max; i++ ){
				zoneLayer = zoneLayers[i];
				if(zoneLayer instanceof L.Polygon && self.isLayerInPolygon(centerPos, zoneLayer)){
					return zoneLayer.zone.id;
				}
			}
			return null;
		},
		getCenter : function(){
			return this._getCenterInMapView();
		},
		isIntersectPolygon : function(sourcePolygon, targetPolygon){
			var self = this;
			var points1 = sourcePolygon.getLatLngs()[0];
			var points2 = targetPolygon.getLatLngs()[0];
			var length = points1.length;
			for(var i = 0; i < length; i++){
				var a1 = points1[i];
				var a2 = points1[(i + 1) % length];
				if(self.isIntersectLinePolygon(a1, a2, points2)){
					return true;
				}
			}
			return false;
		},
		isIntersectLinePolygon : function(a1, a2, points){
			var self = this;
			var length = points.length;
			for(var i = 0; i < length; i++){
				var b1 = points[i];
				var b2 = points[(i + 1) % length];
				if(self.isIntersectLine(a1, a2, b1, b2)){
					return true;
				}
			}
			return false;
		},
		isIntersectLine : function(a1, a2, b1, b2, includeAnotherStatus){
			var ua_t = (b2.lng - b1.lng) * (a1.lat - b1.lat) - (b2.lat - b1.lat) * (a1.lng - b1.lng);
			var ub_t = (a2.lng - a1.lng) * (a1.lat - b1.lat) - (a2.lat - a1.lat) * (a1.lng - b1.lng);
			var u_b = (b2.lat - b1.lat) * (a2.lng - a1.lng) - (b2.lng - b1.lng) * (a2.lat - a1.lat);
			var result = [];
			if(u_b != 0){
				var ua = ua_t / u_b;
				var ub = ub_t / u_b;
				if(ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1){
					result.push(L.latLng(a1.lat + ua * (a2.lat - a1.lat), a1.lng + ua * (a2.lng - a1.lng)));
					return result;
				}
			}else if(includeAnotherStatus){
				if(ua_t == 0 || ub_t == 0){
					//일치
					return "coincident";
				}
				//평행
				return "parallel";
			}
			return false;
		},
		isIntersectLineRectangle : function(a1, a2, latLngBounds){
			/*var min=r1.min(r2);
			var max=r1.max(r2);
			var topRight=new Point2D(max.x,min.y);
			var bottomLeft=new Point2D(min.x,max.y);*/
			var self = this;
			var min = latLngBounds.getNorthWest();
			var max = latLngBounds.getSouthEast();
			var topRight = latLngBounds.getNorthEast();
			var bottomLeft = latLngBounds.getSouthWest();

			var result = [];
			var inter1 = self.isIntersectLine(min,topRight,a1,a2);
			inter1 = inter1 ? inter1 : [];
			var inter2 = self.isIntersectLine(topRight,max,a1,a2);
			inter2 = inter2 ? inter2 : [];
			var inter3 = self.isIntersectLine(max,bottomLeft,a1,a2);
			inter3 = inter3 ? inter3 : [];
			var inter4 = self.isIntersectLine(bottomLeft,min,a1,a2);
			inter4 = inter4 ? inter4 : [];
			result = result.concat(inter1).concat(inter2).concat(inter3).concat(inter4);
			return result;
		},
		setOptions : function(options){
			if(options.canDragDeviceIcon == true) options.isMonitoringFloorImage = false;
			else if(options.canDragDeviceIcon == false) options.isMonitoringFloorImage = true;

			kendo.ui.Widget.fn.setOptions.call(this, options);
		},
		destroy : function(){
			var self = this;
			$(window).off("changeSidebarState", self._resizeSidebarEvt);
			self._resizeSidebarEvt = null;
			self.map.remove();
			self.dataSource = new kendo.data.DataSource({ data : [] });
			self.zoneDataSource = new kendo.data.DataSource({ data : [] });
			self.heatMapDataSource = new kendo.data.DataSource({ data : [] });
			kendo.ui.Widget.fn.destroy.call(this);
		}
	});

	kendo.ui.plugin(CommonMapView);
})(window, jQuery);

//For Debug
//# sourceURL=widget/common-map.js
