(function(window, $){
	"use strict";
	var kendo = window.kendo, ui = kendo.ui, Widget = ui.Widget;

	function searchHighlightReplacer(str){
		return '<span class=search-highlight>' + str + '</span>';
	}

	function escapeRegExp(str){
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function isValidValue(value){
		return typeof value !== "undefined" && value !== null;
	}

	var DEFAULT_GRID_OPTIONS = {
		height: "100%",
		scrollable: false,
		sortable: false,
		filterable: false,
		pageable: false,
		showGridHeader: false,
		selectable : "row",
		hasSelectedModel : true,
		setSelectedAttribute : true
	};

	var onlyhasPropertyGraphicType = ["BasicShape", "Line", "Zone", "HyperLink", "Table", "Statistics", "Label", "Group", "ImportImage"];
	var selectedModelProperty = ["strokeDasharray", "sourceMarker", "targetMarker", "strokeWidth"];
	var NumberFields = ["width", "height", "x", "y", "minValue", "maxValue"];

	var FILTER_ALL_ID = "all";
	var NO_ZONE_ID = 0;
	var BINDING_KEY_UP_TIMEOUT = 1000;

	var updateTypeName = function(data){
		var Util = window.Util;
		var i, max = data.length;
		for( i = 0; i < max; i++ ){
			data[i].name = Util.getDetailDisplayTypeDeviceI18N(data[i].id);
		}
		return data;
	};

	var getAllTypeDs = function(){
		var allTypes = [{ id : "ControlPoint.AI" }, { id : "ControlPoint.AO" }, { id : "ControlPoint.DI" }, { id : "ControlPoint.DO" }, { id : "Sensor.Temperature" }, { id : "Sensor.Humidity"}];
		return updateTypeName(allTypes);
	};

	var getDigitalTypeDs = function(){
		var digitalTypes = [{ id : "ControlPoint.DI" }, { id : "ControlPoint.DO" }];
		return updateTypeName(digitalTypes);
	};

	var getAnalogTypeDs = function(){
		var analogTypes = [{ id : "ControlPoint.AI" }, { id : "ControlPoint.AO" },{ id : "Sensor.Temperature" }, { id : "Sensor.Humidity" }];
		return updateTypeName(analogTypes);
	};

	var getIndoorTypeDs = function(){
		var indoorType = [{ id : "AirConditioner.Indoor", name : "Indoor"},
						  { id : "AirConditioner.AHU", name : "AHU" }, { id : "AirConditioner.Chiller", name : "DVM Chiller" },
						  { id : "AirConditioner.EHS", name : "EHS" }, { id : "AirConditioner.ERV", name : "ERV" },
						  { id : "AirConditioner.ERVPlus", name : "ERV Plus" }, { id : "AirConditioner.FCU", name : "FCU" },
						  { id : "AirConditioner.DuctFresh", name : "Fresh Duct" }];
		return indoorType;
	};

	function getBuildings(){
		var I18N = window.I18N;
		return $.ajax({
			url : "/foundation/space/buildings"
		}).then(function(buildings){
			buildings.sort(function(a, b){
				return a.sortOrder - b.sortOrder;
			});
			buildings.unshift({
				id : FILTER_ALL_ID,
				name : I18N.prop("HMI_ALL")
			});
			return buildings;
		});
	}

	function getFloors(buildingId){
		var I18N = window.I18N;
		var query = { foundation_space_buildings_id : buildingId };
		return $.ajax({
			url : "/foundation/space/floors",
			data : query
		}).then(function(floors){
			var Util = window.Util;
			floors.sort(function(a, b){
				return a.sortOrder - b.sortOrder;
			});
			var i, max = floors.length;
			for( i = 0; i < max; i++ ){
				floors[i].name = Util.getFloorName(floors[i]);
			}
			floors.unshift({
				id : FILTER_ALL_ID,
				name : I18N.prop("HMI_ALL")
			});
			return floors;
		});
	}

	function getZones(buildingId, floorId){
		var I18N = window.I18N;
		var query = { foundation_space_buildings_id : buildingId, foundation_space_floors_id : floorId };
		if(query.foundation_space_floors_id == FILTER_ALL_ID) delete query.foundation_space_floors_id;

		return $.ajax({
			url : "/foundation/space/zones",
			data : query
		}).then(function(zones){
			zones.sort(function(a, b){
				return a.sortOrder - b.sortOrder;
			});
			zones.unshift({ id : NO_ZONE_ID, name : I18N.prop("FACILITY_DEVICE_FILTER_SELECT_EMPTY_ZONE")});
			zones.unshift({ id : FILTER_ALL_ID, name : I18N.prop("HMI_ALL") });
			return zones;
		});
	}

	function getDevices(buildingId, floorId, zoneId, deviceType, keywords){
		var dfd = new $.Deferred();
		var args = {
			registrationStatuses : "Registered",
			foundation_space_buildings_id : null,
			foundation_space_floors_id : null,
			foundation_space_zones_ids : null,
			types : null,
			contains : null,
			containsAttributes : null
		};

		if(deviceType){
			if(deviceType.indexOf("ControlPoint") != -1){
				args.types = deviceType;
				args.mappedTypes = "ControlPoint";
			}else if(deviceType == "AI" || deviceType == "AO" || deviceType == "DI" || deviceType == "DO"){
				args.types = "ControlPoint." + deviceType;
				args.mappedTypes = "ControlPoint";
			}else if((deviceType.indexOf("AirConditioner") != -1) && (deviceType.split(",").length > 1)){	//실내기 전체 타입
				args.types = "AirConditioner.*";
			}else{
				args.types = deviceType;
			}
		}

		if(buildingId == FILTER_ALL_ID) delete args.foundation_space_buildings_id;
		else args.foundation_space_buildings_id = buildingId;

		if(floorId == FILTER_ALL_ID){
			delete args.foundation_space_floors_id;
		}else{
			delete args.foundation_space_buildings_id;
			args.foundation_space_floors_id = floorId;
		}

		if(zoneId == FILTER_ALL_ID){
			delete args.foundation_space_zones_ids;
		}else if(isValidValue(zoneId)){
			delete args.foundation_space_buildings_id;
			if(zoneId != NO_ZONE_ID) delete args.foundation_space_floors_id;
			args.foundation_space_zones_ids = zoneId;
		}

		if(keywords){
			args.contains = keywords;
			args.containsAttributes = "name";
		}

		for(var key in args){
			if(args[key] === null) delete args[key];
		}
		var reqArr = [], devices = [], mappedTypeDevices = [];
		reqArr.push($.ajax({
			url : "/dms/devices",
			data : args
		}).done(function(data){
			devices = data;
		}));
		var HmiCommon = window.HmiCommon;
		if(HmiCommon.hasMappedTypes.indexOf(args.types) != -1){
			args.mappedTypes = args.types;
			args.types = "ControlPoint.*";
			reqArr.push($.ajax({
				url : "dms/devices",
				data : args
			}).done(function(res){
				mappedTypeDevices = res;
			}));
		}

		$.when.apply(this, reqArr).always(function(){
			//mappedType Device가 이미 devices에 존재하는지 중복 체크
			var i, j, max, size, item, mappedItem, isExist = false;
			max = devices.length;
			size = mappedTypeDevices.length;

			for( i = 0; i < size; i++ ){
				mappedItem = mappedTypeDevices[i];
				isExist = false;
				for( j = 0; j < max; j++ ){
					item = devices[j];
					if(mappedItem.id == item.id){
						isExist = true;
						break;
					}
				}
				if(!isExist) devices.push(mappedItem);
			}
			dfd.resolve(devices);
		});
		return dfd.promise();
	}

	kendo.data.binders.hmiBindingFilterSelectedType = kendo.data.Binder.extend({
		refresh: function() {
			var name = this.bindings['hmiBindingFilterSelectedType'].get();
			var element = $(this.element);
			var titleEl = element.closest(".title");
			var itemEl = titleEl.closest(".hmi-binding-filter-item");
			var type = itemEl.data("type");
			var id = element.attr("data-id");
			if(type == "device"){
				//기기 타입이 ALL 인 상태
				if(id === "null" || id === null || (id && id.split(",").length > 1)) titleEl.removeClass("active");
				else titleEl.addClass("active");
			}else if(id == FILTER_ALL_ID){
				titleEl.removeClass("active");
			}else{
				titleEl.addClass("active");
			}
			element.text(name);
		}
	});

	kendo.data.binders.hmiVisibleControlPoint = kendo.data.Binder.extend({
		refresh: function() {
			var HmiUtil = window.HmiUtil;
			var deviceType = this.bindings['hmiVisibleControlPoint'].get();
			var element = $(this.element);
			var infoEl = element.closest(".hmi-binding-device-info");
			var idCells = infoEl.find("td.device-id-cell");
			//deviceType이 없거나 관제점인 경우 관제점 기기 정보 테이블로 표시
			if(!deviceType || HmiUtil.isControlPointType(deviceType)){
				idCells.attr("colspan", 2);
				element.show();
			}else{
				//실내기임. ID, NAME, Indoor Type만 표시
				idCells.attr("colspan", 1);
				element.hide();
			}
		}
	});

	kendo.data.binders.hmiInvisibleIndoor = kendo.data.Binder.extend({
		refresh: function() {
			var isIndoor = this.bindings['hmiInvisibleIndoor'].get();
			var element = $(this.element);
			var infoEl = element.closest(".hmi-binding-device-info");
			var idCells = infoEl.find("td.device-id-cell");
			//deviceType이 없거나 관제점인 경우 관제점 기기 정보 테이블로 표시
			if(!isIndoor){
				idCells.attr("colspan", 2);
				element.show();
			}else{
				//실내기임. ID, NAME, Indoor Type만 표시
				idCells.attr("colspan", 1);
				element.hide();
			}
		}
	});

	var BINDING_TAB_TEMPLATE = function(){
		var I18N = window.I18N;
		return "<div class='hmi-binding-inner-wrapper'>" +
			"<ul class='hmi-binding-tabs'>" +
				"<li data-type='device' data-bind='css:{active:state.tab.device, disabled:state.tab.deviceDisabled}, events:{click:events.clickTab}'>" + I18N.prop("COMMON_MENU_DEVICE") + "</li>" +
				"<li data-type='property' data-bind='css:{active:state.tab.property, disabled:state.tab.propertyDisabled}, events:{click:events.clickTab}'>" + I18N.prop("HMI_PROPERTY") + "</li>" +
			"</ul>" +
			"<div class='hmi-binding-device-wrapper' data-bind='visible:state.tab.device'>" +
				"<div class='hmi-binding-filter-wrapper' data-bind='visible:state.isFilterOpen, css:{active:filter.active}'>" +
					"<ul class='hmi-binding-filter'>" +
						"<li class='hmi-binding-filter-item title' data-type='title' data-bind='events:{click:events.clickFilterItem}'><span class='title'>" + I18N.prop("HMI_BINDING_FILTER") + "<span>" +
							"<span class='clear' data-bind='css:{disabled:state.isFilterClearDisabled}'>" + I18N.prop("HMI_BINDING_FILTER_CLEAR") + "</span>" +
						"</li>" +
						"<li class='hmi-binding-filter-item building' data-type='building' data-bind='css:{disabled:filter.building.disabled, active:filter.building.active}'>" +
							"<div class='title' data-bind='events:{click:events.clickFilterItem}'><span class='building'><span class='label'>" + I18N.prop("HMI_BUILDING") + "<span class='comma'>,&nbsp;</span></span><span class='name' data-bind='attr:{data-id:filter.building.id}, hmiBindingFilterSelectedType: filter.building.name'></span><span class='ic' data-bind='css:{active:filter.building.active}'></span></div>" +
							"<div class='list' style='display:none;'><table class='building-list'></table></div>" +
						"</li>" +
						"<li class='hmi-binding-filter-item floor' data-type='floor' data-bind='css:{disabled:filter.floor.disabled, active:filter.floor.active}'>" +
							"<div class='title' data-bind='events:{click:events.clickFilterItem}'><span class='floor'><span class='label'>" + I18N.prop("HMI_FLOOR") + "<span class='comma'>,&nbsp;</span></span><span class='name' data-bind='attr:{data-id:filter.floor.id}, hmiBindingFilterSelectedType: filter.floor.name'></span><span class='ic' data-bind='css:{active:filter.floor.active}'></span></div>" +
							"<div class='list' style='display:none;'><table class='floor-list'></table></div>" +
						"</li>" +
						"<li class='hmi-binding-filter-item zone' data-type='zone' data-bind='css:{disabled:filter.zone.disabled, active:filter.zone.active}'>" +
							"<div class='title' data-bind='events:{click:events.clickFilterItem}'><span class='zone'><span class='label'>" + I18N.prop("HMI_ZONE") + "<span class='comma'>,&nbsp;</span></span><span class='name' data-bind='attr:{data-id:filter.zone.id}, hmiBindingFilterSelectedType: filter.zone.name'></span><span class='ic' data-bind='css:{active:filter.zone.active}'></span></div>" +
							"<div class='list' style='display:none;'><table class='zone-list'></table></div>" +
						"</li>" +
						"<li class='hmi-binding-filter-item device' data-type='device' data-bind='css:{disabled:filter.device.disabled, active:filter.device.active}'>" +
							"<div class='title' data-bind='events:{click:events.clickFilterItem}'><span class='device-type'><span class='label'>" + I18N.prop("HMI_TYPE") + "<span class='comma'>,&nbsp;</span></span><span class='name' data-bind='attr:{data-id:filter.device.id}, hmiBindingFilterSelectedType: filter.device.name'></span><span class='ic' data-bind='css:{active:filter.device.active}'></span></div>" +
							"<div class='list' style='display:none;'><table class='device-type-list'></table></div>" +
						"</li>" +
					"</ul>" +
				"</div>" +
				"<div class='hmi-binding-search-wrapper'>" +
					"<button class='k-button filter' data-bind='css:{active:state.isApplyingFilter}, events:{click:events.clickFilterBtn}'>" + I18N.prop("HMI_BINDING_FILTER") + "</button>" +
					"<span class='search-field-wrapper' data-bind='css:{searching:state.isSearching}'><input type='text' class='k-input search-field' placeholder='" + I18N.prop("HMI_DEVNAME") + "' data-bind='events:{keyup:events.keyupSearch}'/>" +
					"<button class='ic ic-bt-input-search' data-bind='events:{click:events.clickSearchBtn}'></button></span>" +
				"</div>" +
				"<div class='hmi-binding-list-wrapper'>" +
					"<table class='hmi-binding-list'></table>" +
				"</div>" +
				"<div class='hmi-binding-device-info-wrapper'>" +
					"<div class='title'>" +
						I18N.prop("HMI_SELECT_DEVICE") +
					"</div>" +
					"<table class='hmi-binding-device-info' data-bind='css:{invalid:device.invalid}'>" +
						"<tr class='row title device-id'>" +
							"<td class='device-id-cell' colspan='2'>" + I18N.prop("HMI_DEVID") + "</td>" +
						"</tr>" +
						"<tr class='row content'>" +
							"<td class='device-id-cell' colspan='2' data-bind='text : device.id, attr:{title:device.id}'></td>" +
						"</tr>" +
						"<tr class='row title'>" +
							"<td>" + I18N.prop("HMI_DEVNAME") + "</td>" +
							"<td data-bind='hmiInvisibleIndoor:state.isIndoorType'>" + I18N.prop("HMI_DEVTAGNAME") + "</td>" +
						"</tr>" +
						"<tr class='row content'>" +
							"<td data-bind='text : device.name, attr:{title:device.name}'></td>" +
							"<td data-bind='text : device.tagName, attr:{title:device.tagName}, hmiInvisibleIndoor:state.isIndoorType'></td>" +
						"</tr>" +
						"<tr class='row title'>" +
							"<td>" + I18N.prop("HMI_DEVTYPE") + "</td>" +
							"<td data-bind='hmiInvisibleIndoor:state.isIndoorType'>" + I18N.prop("HMI_VALUE") + "</td>" +
						"</tr>" +
						"<tr class='row content'>" +
							"<td data-bind='text : device.displayType, attr:{title:device.displayType}'></td>" +
							//"<td data-bind='text : device.displayDetailType'></td>" +
							"<td data-bind='text : device.displayValue, attr:{title:device.displayValue}, hmiInvisibleIndoor:state.isIndoorType'></td>" +
						"</tr>" +
					"</table>" +
				"</div>" +
			"</div>" +
			"<div class='hmi-binding-property-wrapper' data-bind='visible:state.tab.property'>" +
				"<div class='hmi-binding-property-inner-wrapper'></div>" +
			"</div>" +
		/*"<div class='hmi-binding-button-wrapper'>" +
				"<button class='k-button save-button' data-bind='disabled:state.isSaveBtnDisabled, events:{click:events.clickSaveBtn}'>" +
					I18N.prop("COMMON_BTN_SAVE") +
				"</button>" +
			"</div>" +*/
		"</div>";
	};

	var getBindingPropertyCategoryTemplate = function(categoryKey, category, allowFields){
		var categoryName = category.name;
		var items = category.items;

		//expand - 펼쳐진 상태, 없을 경우 접힌 상태
		var html = "<div class='hmi-binding-property-category' data-key='" + categoryKey + "' data-bind='visible:properties." + categoryKey + ".visible'>" +
			"<div class='category-title'><span class='ic' data-bind='css:{expand:properties." + categoryKey + ".expanded}'></span><span class='title'>" + categoryName + "</span></div>" +
			"<ul class='category-items' data-bind='visible:properties." + categoryKey + ".expanded'>";

		var key, itemsHtml = "";
		for( key in items){
			//허용 되지 않는 필드로 그리지 않는다.
			if(allowFields && allowFields.indexOf(key) == -1) continue;
			itemsHtml += "<li class='property' data-key='" + key + "' data-category='" + categoryKey + "' data-bind='visible:properties." + categoryKey + ".items." + key + ".visible'>" +
					getBindingPropertyTemplate(key, items[key]) + "</li>";
		}

		//해당 카테고리에 허용되는 필드가 없을 경우 빈 값 리턴
		if(!itemsHtml) return itemsHtml;

		html += itemsHtml;
		html += "</ul></div>";

		return html;
	};

	var removeField = function(fields, fieldName){
		var index = -1;
		index = fields.indexOf(fieldName);
		if(index != -1) fields.splice(index, 1);
	};

	var getAllowedPropertyField = function(bindingData){
		var allowedPropertyField = {
			"Group" : ["x", "y", "width", "height"],
			"Indoor" : ["projection", "x", "y"],
			"Custom" : ["buttonType", "x", "y", "width", "height", "reverse"],
			"Zone" : ["x", 'y', "width", "height", "strokeDasharray"],
			"Statistics" : ["x", "y", "width", "height", "strokeDasharray", "building"],
			"BasicShape" : ["x", "y", "width", "height", "strokeDasharray"],	//삼각형, 사각형, 둥근사각형, 마름모, 사다리꼴, 원, 타원
			"Line" : ["x", "y", "width", "height", "strokeDasharray", "sourceMarker", "targetMarker"],	//직선, 꺾은선, 곡선
			"Table" : ["x", "y", "width", "height", "strokeDasharray"],
			"Label" : ["x", "y", "width", "height", "strokeDasharray"],
			"HyperLink" : ["x", "y", "width", "height", "file", "label", "strokeDasharray"],
			"Button" : ["buttonType", "textLocation", "reverse", "graphicColorOff", "graphicColorOn", "svgTextOff", "svgTextOn", "state", "x", "y", "width", "height"],
			//제어
			"ProgressBar" : ["x", "y", "width", "height", "maxValue", "minValue","textLocation", "prefix", "suffix", "highlightColor", "strokeDasharray" ],
			"ScaleBar" : ["propertyType", "prefix", "suffix", "x", "y", "width", "height", "minValue", "maxValue", "textLocation", "highlightColor", "strokeDasharray"],
			"ToggleButton" : ["propertyType", "reverse", "checkboxLabel", "x", "y", "width", "height", "strokeDasharray", "highlightColor"],
			"Combobox" : ["propertyType", "x", "y", "width", "height", "strokeDasharray", "highlightColor", "optionValues"],
			"ExtLabel" : ["propertyType", "hasButton", "x", "y", "width", "height", "strokeDasharray", "highlightColor", "minValue", "maxValue"],
			"RadioButton" : ["propertyType", "x", "y", "width", "height", "strokeDasharray", "highlightColor", "optionValues"],
			//Animation은 CategoryName에 따라 상이.
			"Animation" : ["state", "gauge", "reverse", "fontSize", "graphicColorOff", "svgTextOff", "graphicColorOn", "svgTextOn", "x", "y", "width", "height", "maxValue", "minValue"],
			"ImportImage" : ["x", "y", "width", "height", "strokeDasharray"],
			"Image" : ["x", "y", "width", "height", "reverse", "graphicColorOn", "graphicColorOff"],
			"Chart" : ["x", "y", "width", "height",  "highlightColor", "timeRange", "count", "maxValue", "minValue", "strokeDasharray"],
			"RectangleGraphic" : ["buttonType", "textLocation", "reverse", "x", "y", "width", "height", "svgGraphicColorOff", "svgTextOff", "svgGraphicColorOn", "svgTextOn", "strokeDasharray"]
		};
		var type = bindingData.type;
		var categoryName = bindingData.categoryName;
		var bindingType, allowedField = allowedPropertyField[type], HmiUtil = window.HmiUtil;

		removeField(allowedField, "graphicColor");
		removeField(allowedField, "graphicColorOn");
		removeField(allowedField, "graphicColorOff");

		if(type == "Animation"){
			if(categoryName != "Toggle" && categoryName != "Selector"
				&& categoryName != "Exhaust"
				&& categoryName != "Generator"
				&& categoryName != "Wind"
				&& categoryName != "CoolingTower"
				&& categoryName != "Steam"
				&& categoryName != "LED"
				&& categoryName != "Blower" && categoryName != "DIP"
				&& categoryName != "Coil" && categoryName != "Pumps" && categoryName != "Button"){
				removeField(allowedField, "reverse");
			}
			removeField(allowedField, "gauge");
			removeField(allowedField, "value");
			removeField(allowedField, "minValue");
			removeField(allowedField, "maxValue");
			removeField(allowedField, "svgTextOff");
			removeField(allowedField, "svgTextOn");
			removeField(allowedField, "fontSize");

			if(HmiUtil.isMultiBindingType(categoryName)){
				removeField(allowedField, "state");
				allowedField.push("minValue");
				allowedField.push("maxValue");
				allowedField.push("reverse");
				if(categoryName != "Alarm"){
					allowedField.push("graphicColorOn");
					allowedField.push("graphicColorOff");
					allowedField.push("graphicColor");
				}
			}else if(categoryName == "Gauge"){
				removeField(allowedField, "state");
				allowedField.push("gauge");
				allowedField.push("minValue");
				allowedField.push("maxValue");
			}else if(categoryName != "Steam" && categoryName != "Wind"){
				bindingType = HmiUtil.getGraphicCatergoryPointType(categoryName);
				if(bindingType == "AI"){
					allowedField.push("graphicColor");
					if(HmiUtil.isMultiLevelGraphic(categoryName)){
						allowedField.push("minValue");
						allowedField.push("maxValue");
					}
				}else if(bindingType == "DI"){
					allowedField.push("reverse");
					allowedField.push("graphicColorOn");
					allowedField.push("graphicColorOff");
				}

			}
		}else if(type == "Button"){
			allowedField.push("graphicColorOn");
			allowedField.push("graphicColorOff");
			allowedField.push("svgTextOff");
			allowedField.push("svgTextOn");
			if(categoryName != "Button"){
				removeField(allowedField, "buttonType");
			}
		}else if(type == "ProgressBar" || type == "ScaleBar"){
			//수직형 프로그레스 바, 스케일 바에서만 텍스트 위치를 제공한다.
			if(bindingData.direction != "vertical"){
				if(type == "ScaleBar"){
					removeField(allowedField, "progressTextLocation");	//ProgressBar는 Horizontal 일 때도 텍스트 위치의 설정이 가능하다.
					removeField(allowedField, "fontSize");
					removeField(allowedField, "fontStyle");
					removeField(allowedField, "fontType");
				}
			}
		}else if(type == "Image"){
			if(categoryName == "basicImage"){
				removeField(allowedField, "reverse");
			}else{
				allowedField.push("reverse");
				allowedField.push("graphicColorOn");
				allowedField.push("graphicColorOff");
			}
		}else if(type == "Statistics"){
			if(categoryName != "Building") removeField(allowedField, "building");
		}else if(type == "Custom"){
			var customType = bindingData.custom.type;
			if(customType == "Multi"){
				removeField(allowedField, "buttonType");
				removeField(allowedField, "reverse");
			}else if(customType == "Toggle"){
				removeField(allowedField, "buttonType");
			}
		}

		return allowedField;
	};
	var getBindingPropertyTemplate = function(fieldKey, data){
		//Template은 propertyInfoObj 내 items 1개의 item으로 렌더링되지만,
		//실제 ViewModel은 한번에 되므로 ViewModel 변수는 모두 선언 필요.
		//선언한 순서는 상관없다. 순서 기준은 propertyViewModel에 선언된 기준으로 표시됨.
		var HmiCommon = window.HmiCommon;
		var I18N = window.I18N;
		var templates = {
			"propertyType" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.general.items.propertyType.value, source: properties.general.items.propertyType.dataSource, " +
				"events:{change:events.change}, disabled:properties.general.items.propertyType.disabled'/></span>",
			"buttonType" : "<span class='name block'>#:name#</span><span class='value'>" +
				'<p class="block-wrapper">' +
					'<input type="radio" class="k-radio" name="button-type" id="button-type_push" ' +
					'value="Push" data-bind="checked:properties.button.items.buttonType.value, events:{change:events.change}"/>' +
					'<label class="k-radio-label" for="button-type_push">' + I18N.prop("HMI_PUSH") + '</label>' +
				'</p>' +
				'<p class="block-wrapper">' +
					'<input type="radio" class="k-radio" name="button-type" id="button-type_toggle" ' +
					'value="Toggle" data-bind="checked:properties.button.items.buttonType.value, events:{change:events.change}"/>' +
					'<label class="k-radio-label" for="button-type_toggle">' + I18N.prop("HMI_TOGGLE") + '</label>' +
				'</p>' +
				'<p class="block-wrapper">' +
					'<input type="radio" class="k-radio" name="button-type" id="button-type_momentary" ' +
					'value="Momentary" data-bind="checked:properties.button.items.buttonType.value, events:{change:events.change}"/>' +
					'<label class="k-radio-label" for="button-type_momentary">' + I18N.prop("HMI_MOMENTARY") + '</label>' +
				'</p>' +
			"</span>",
			"buttonToggleOnText" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-required='true'>" +
				"<input class='k-input' data-bind='value:properties.text.items.buttonToggleOnText.value' required/><i class='ic ic-btn-remove-sm'></i>" +
				"</span></span>",
			"buttonToggleOffText" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-required='true'>" +
				"<input class='k-input' data-bind='value:properties.text.items.buttonToggleOffText.value' required/><i class='ic ic-btn-remove-sm'></i>" +
				"</span></span>",
			"textLocation" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.text.items.textLocation.value, source: properties.text.items.textLocation.dataSource, " +
				"events:{change:events.change}, disabled:properties.text.items.textLocation.disabled'/></span>",
			"reverse" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.general.items.reverse.value, source: properties.general.items.reverse.dataSource, " +
				"events:{change:events.change}, disabled:properties.general.items.reverse.disabled'/></span>",
			"buttonColor" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.color.items.buttonColor.value, source: properties.color.items.buttonColor.dataSource, " +
				"events:{change:events.change}, disabled:properties.color.items.buttonColor.disabled'/></span>",
			"value" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-required='#:required#'>" +
				"<input class='k-input' data-bind='value:properties.text.items.value.value, disabled:properties.text.items.value.disabled' required/><i class='ic ic-btn-remove-sm'></i>" +
				"</span></span>",
			"unit" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator'>" +
				"<input class='k-input' data-bind='value:properties.text.items.unit.value'/><i class='ic ic-btn-remove-sm'></i>" +
				"</span></span>",
			"label" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-required='false' data-max-length='30' data-scroll-wrapper-class='hmi-binding-property-inner-wrapper'>" +
				"<input class='k-input' data-bind='value:properties.text.items.label.value, disabled:properties.text.items.label.disabled'/><i class='ic ic-btn-remove-sm'></i>" +
				"</span></span>",
			"prefix" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-max-length='30'>" +
				"<input class='k-input' data-bind='value:properties.text.items.prefix.value'/><i class='ic ic-btn-remove-sm'></i>" +
				"</span></span>",
			"suffix" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-max-length='30'>" +
				"<input class='k-input' data-bind='value:properties.text.items.suffix.value'/><i class='ic ic-btn-remove-sm'></i>" +
				"</span></span>",
			"gauge" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.text.items.gauge.value, source: properties.text.items.gauge.dataSource, " +
				"events:{change:events.change}, disabled:properties.text.items.gauge.disabled'/></span>",
			"checkboxLabel" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-required='false' data-max-length='30' data-scroll-wrapper-class='hmi-binding-property-inner-wrapper'>" +
				"<input class='k-input' data-bind='value:properties.text.items.checkboxLabel.value'/><i class='ic ic-btn-remove-sm'></i>" +
				"</span></span>",
			"x" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-bind='events:{validate:events.validate}' data-type='numeric' data-min='0' data-max='#:max#' data-required='true'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' data-min='0' data-max='#:max#' data-format='\\#' " +
				"data-bind='value: properties.location.items.x.value, events: {spin: events.change, change : events.change}, disabled: properties.location.items.x.disabled' required style='width:100%;'/>" +
				"</span></span>",
			"y" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-bind='events:{validate:events.validate}' data-type='numeric' data-min='0' data-max='#:max#' data-required='true'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' data-min='0' data-max='#:max#' data-format='\\#' " +
				"data-bind='value:properties.location.items.y.value, events: {spin: events.change, change : events.change}, disabled: properties.location.items.y.disabled' required style='width:100%;'/>" +
				"</span></span>",
			"width" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-bind='events:{validate:events.validate}' data-type='numeric' data-min='#:min#' " +
				"data-max='#:max#' data-required='true'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' min='#:min#' max='#:max#' data-format='\\#' " +
				"data-bind='value:properties.size.items.width.value, events: {spin: events.change, change : events.change}, disabled: properties.size.items.width.disabled' required style='width:100%;'/>" +
				"</span></span>",
			"height" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-bind='events:{validate:events.validate}' data-type='numeric' data-min='#:min#' " +
				"data-max='#:max#' data-required='true'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' min='#:min#' max='#:max#' data-format='\\#' " +
				"data-bind='value:properties.size.items.height.value, events: {spin: events.change, change : events.change}, disabled: properties.size.items.height.disabled' required style='width:100%;'/>" +
				"</span></span>",
			"fillColor" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-tool-colorfill'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.color.items.fillColor.value}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span>",
			/*"visible" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.general.items.visible.value, source: properties.general.items.visible.dataSource, " +
				"events:{change:events.change}, disabled:properties.general.items.visible.disabled'/></span>",*/
			"graphicColor" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.color.items.graphicColor.value, source: properties.color.items.graphicColor.dataSource, " +
				"events:{change:events.change}, disabled:properties.color.items.graphicColor.disabled'/></span>",
			"graphicColorOff" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-template='hmi-dropdownlist-disabled-template' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.color.items.graphicColorOff.value, source: properties.color.items.graphicColorOff.dataSource, " +
				"events:{open:events.open, select:events.select, change:events.change}, disabled:properties.color.items.graphicColorOff.disabled'/></span>",
			"graphicColorOn" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-template='hmi-dropdownlist-disabled-template' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.color.items.graphicColorOn.value, source: properties.color.items.graphicColorOn.dataSource, " +
				"events:{open:events.open, select:events.select, change:events.change}, disabled:properties.color.items.graphicColorOn.disabled'/></span>",
			"svgGraphicColorOff" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-tool-colorfill'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.color.items.svgGraphicColorOff.value}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span>",
			"svgGraphicColorOn" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-tool-colorfill'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.color.items.svgGraphicColorOn.value}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span>",
			"svgTextOff" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-value-field='svgTextColorOff' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-tool-textfill'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.text.items.svgTextOff.value.svgTextColorOff}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span><p class='block-wrapper' style='margin-bottom:10px;'>" +
					"<div data-role='commonvalidator' data-type='text' data-max-length=30 " +
					"data-bind='events:{validate : events.validate}'>" +
					"<input class='k-input' data-bind='value: properties.text.items.svgTextOff.value.textOff' style='width:100%;'/></div>" +
				"</p>",
			"svgTextOn" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-value-field='svgTextColorOn' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-tool-textfill'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.text.items.svgTextOn.value.svgTextColorOn}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span><p class='block-wrapper' style='margin-bottom:10px;'>" +
					"<div data-role='commonvalidator' data-type='text' data-max-length=30 " +
					"data-bind='events:{validate : events.validate}'>" +
					"<input class='k-input' data-bind='value: properties.text.items.svgTextOn.value.textOn' style='width:100%;'/></div>" +
				"</p>",
			"dataColor" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-tool-colorfill'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.color.items.dataColor.value}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span>",
			"timeRange" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.general.items.timeRange.value, source: properties.general.items.timeRange.dataSource, " +
				"events:{change:events.change}, disabled:properties.general.items.timeRange.disabled'/></span>",
			"fontSize" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-min='2' data-max='64' data-required='true' data-bind='events:{validate:events.validate}'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' min='2' max='64' data-format='\\#' " +
				"data-bind='value: properties.font.items.fontSize.value, events: {spin: events.change, change : events.change}, disabled: disabled' required style='width:100%;'/></span>" +
				"</span>",
			"strokeColor" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-linecolor'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.color.items.strokeColor.value}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span>",
			"strokeWidth" : "<span class='name'>#:name#</span><span class='value line'>" +
				"<input data-role='dropdownlist' data-popup-class='hmi-binding-line-width-dropdown-popup' data-template='hmi-binding-line-width-dropdownlist-template' data-value-template='hmi-binding-line-width-dropdownlist-value-template' data-text-field='name' data-value-field='id' " +
				"data-bind='value:properties.line.items.strokeWidth.value, source: properties.line.items.strokeWidth.dataSource, " +
				"events:{change:events.change}, disabled:properties.line.items.strokeWidth.disabled'/></span>",
			"fontColor" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-tool-textfill'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.font.items.fontColor.value}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span>",
			"fontType" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-template='hmi-font-type-dropdownlist-template' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.font.items.fontType.value, source: properties.font.items.fontType.dataSource, " +
				"events:{change:events.change}, disabled:properties.font.items.fontType.disabled'/></span>",
			"fontStyle" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.font.items.fontStyle.value, source: properties.font.items.fontStyle.dataSource, " +
				"events:{change:events.change}, disabled:properties.font.items.fontStyle.disabled'/></span>",
			"minValue" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-type='hmiMinMax' data-min='#:min#' data-max='#:max#' data-required='true' data-bind='events:{validate:events.validate}' data-scroll-wrapper-class='hmi-binding-property-inner-wrapper'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' min='#:min#' max='#:max#' data-format='\\#' data-decimals='0' " +
				"data-bind='value:properties.minMax.items.minValue.value, events: {spin: events.change, change : events.change}, disabled: properties.minMax.items.minValue.disabled' required style='width:100%;'/>" +
				"</span></span>",
			"maxValue" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-type='hmiMinMax' data-min='#:min#' data-max='#:max#' data-required='true' data-bind='events:{validate:events.validate}' data-scroll-wrapper-class='hmi-binding-property-inner-wrapper'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' min='#:min#' max='#:max#' data-format='\\#' data-decimals='0' " +
				"data-bind='value:properties.minMax.items.maxValue.value, events: {spin: events.change, change : events.change}, disabled: properties.minMax.items.maxValue.disabled' required style='width:100%;'/>" +
				"</span></span>",
			"optionValues" : "<div class='hmi-binding-option-values'>" +
				"<div class='hmi-binding-option-values-lits' data-template='hmi-binding-option-values-template' data-bind='source:properties.optionValues.items.optionValues.value'></div>" +
				"<div class='hmi-binding-option-values-add'><a class='ic ic-plus add-btn' data-bind='css:{disabled:properties.optionValues.items.optionValues.addBtnDisabled}'></a></div>" +
				"</div>",
			"strokeDasharray" : "<span class='name'>#:name#</span><span class='value line'>" +
				"<input data-role='dropdownlist' data-popup-class='hmi-binding-dash-dropdown-popup' data-template='hmi-dash-dropdownlist-template' data-value-template='hmi-dash-dropdownlist-value-template' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.line.items.strokeDasharray.value, source: properties.line.items.strokeDasharray.dataSource, " +
				"events:{change:events.change}, disabled:properties.font.items.fontType.disabled'/></span>",
			"sourceMarker" : "<span class='name'>#:name#</span><span class='value line'>" +
				"<input data-role='dropdownlist' data-popup-class='hmi-binding-marker-dropdown-popup' data-template='hmi-marker-dropdownlist-template' data-value-template='hmi-marker-dropdownlist-value-template' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.line.items.sourceMarker.value, source: properties.line.items.sourceMarker.dataSource, " +
				"events:{change:events.change}, disabled:properties.line.items.sourceMarker.disabled'/></span>",
			"targetMarker" : "<span class='name'>#:name#</span><span class='value line'>" +
				"<input data-role='dropdownlist' data-popup-class='hmi-binding-marker-dropdown-popup' data-template='hmi-marker-dropdownlist-template' data-value-template='hmi-marker-dropdownlist-value-template' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.line.items.targetMarker.value, source: properties.line.items.targetMarker.dataSource, " +
				"events:{change:events.change}, disabled:properties.line.items.targetMarker.disabled'/></span>",
			"file" : "<span class='name' style='width:60px;'>#:name#</span>" +
				"<span class='value'>" +
					"<span class='file-name' data-bind='text: properties.hyperLink.items.file.value.name, events:{click:events.click}'></span>" +
				"</span>",
			"highlightColor" : "<span class='name'>#:name#</span><span class='value'>" +
				"<div class='binding-colorpicker-wrapper k-button' data-bind='events:{click:events.click}'>" +
					"<span class='ic ic-tool-colorfill'>" +
						"<span class='selected-color-line' data-bind='style: {backgroundColor:properties.color.items.highlightColor.value}'></span>" +
					"</span>" +
					"<span class='ic ic-arrow'></span>" +
				"</div>" +
				"</span>",
			"count" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-type='numeric' data-min='#:min#' data-max='#:max#' data-required='true'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' min='#:min#' max='#:max#' data-format='\\#' " +
				"data-bind='value: properties.general.items.count.value, events: {spin: events.change, change : events.change}, disabled: properties.general.items.count.disabled' required style='width:100%;'/>" +
				"</span></span>",
			"building" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='name' data-value-field='id' " +
				"data-bind='value:properties.misc.items.building.value, source: properties.misc.items.building.dataSource, " +
				"events:{change:events.change}, disabled:properties.misc.items.building.disabled'/></span>",
			"hasButton" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.button.items.hasButton.value, source: properties.button.items.hasButton.dataSource, " +
				"events:{change:events.change}, disabled:properties.button.items.hasButton.disabled'/></span>",
			"controlValue" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<span data-role='commonvalidator' data-type='hmiValueMinMax' data-min='#:min#' data-max='#:max#' data-required='true'>" +
				"<input data-role='numerictextbox' type='number' class='k-input spinner' min='#:min#' max='#:max#' data-format='\\#' " +
				"data-bind='value: properties.text.items.controlValue.value, events: {spin: events.change, change : events.change}, disabled: properties.text.items.controlValue.disabled' required style='width:100%;'/>" +
				"</span></span>",
			"projection" : "<span class='name block'>#:name#</span><span class='value'>" +
				"<input data-role='dropdownlist' data-text-field='text' data-value-field='value' " +
				"data-bind='value:properties.misc.items.projection.value, source: properties.misc.items.projection.dataSource, " +
				"events:{change:events.change}, disabled:properties.misc.items.projection.disabled'/></span>"
		};

		var template = templates[fieldKey];
		if(template){
			template = kendo.template(template);
			template = template(data);
		}else{
			template = "";
		}

		return template;
	};

	var evtDelegator = function(eventType, e){
		var that = this, target;
		if(e.sender){
			target = e.sender.element;
		}else if(e.target){
			target = $(e.target);
		}
		var propertyEl = target.closest("li.property");
		var category = propertyEl.data("category");
		var field = propertyEl.data("key");
		that.trigger("property", { type : eventType, event : e, category : category, field : field });
	};

	//Property 탭에서 렌더링하기 위함
	var optionValuesToVm = function(optionValues){
		var that = this, I18N = window.I18N;
		var i, text, value, option, max = optionValues.length;
		var result = [], item;
		var removeBtnDisabled = max == 1;
		var changeEvt = evtDelegator.bind(that, "change");
		for(i = 0; i < max; i++){
			option = optionValues[i];
			if(typeof option === "object"){
				text = option.text;
				value = option.value;
			}else{
				text = option;
				value = option;
			}
			item = { name : I18N.prop("HMI_ITEM") + (i + 1), text : text, value : value, change : changeEvt };
			//아이템이 1개일 경우 삭제 버튼 비활성화
			item.removeBtnDisabled = removeBtnDisabled;
			result.push(item);
		}
		return result;
	};
	//바인딩 데이터로 바꾸기 위함
	var optionValuesToBinding = function(optionValues){
		var i, option, max = optionValues.length;
		var result = [];
		for( i = 0; i < max; i++ ){
			option = optionValues[i];
			result.push({
				text : option.text,
				value : option.value
			});
		}
		return result;
	};

	var getMarkerValueToBinding = function(value){
		var HmiCommon = window.HmiCommon;
		var ds = HmiCommon.lineMarkerDataSource;
		var i, max = ds.length;
		for( i = 0; i < max; i++ ){
			if(ds[i].value == value){
				return {
					points : value,
					fill : ds[i].fill
				};
			}
		}
		return {
			points : ds[0].value,
			fill : ds[0].fill
		};
	};

	var getSelectedDataSource = function(dataSource, value){
		var result = [], i, item, max = dataSource.length;
		for( i = 0; i < max; i++ ){
			item = dataSource[i];
			item = $.extend(true, {}, item);
			result.push(item);
			if(value == item.value) item.selected = true;
			else item.selected = false;
		}
		return result;
	};

	var getBindingPropertyViewModel = function(bindingTabWidget, data){
		var I18N = window.I18N, HmiCommon = window.HmiCommon, HmiUtil = window.HmiUtil, MainWindow = window.MAIN_WINDOW;
		var graphicType = data.type, categoryName = data.categoryName, device = data.device;

		//초기 값
		var reverseDataSource = [ { text : I18N.prop("HMI_DISABLE"), value : false }, { text : I18N.prop("HMI_ENABLE"), value : true } ];

		var buttonColorDataSource = [ { text : I18N.prop("HMI_BLUE"), value : "blue" }, { text : I18N.prop("HMI_GREEN"), value : "green" }, { text : I18N.prop("HMI_RED"), value : "red" }, { text : I18N.prop("HMI_YELLOW"), value : "yellow" } ];
		var graphiColorDataSource = [ { id : 0, text : I18N.prop("HMI_GENERAL"), value : "gray", disabled : false },
			{ id : 1, text : I18N.prop("HMI_RED"), value : "red", disabled : false  },
			{ id : 2, text : I18N.prop("HMI_BLUE"), value : "blue", disabled : false },
			{ id : 3, text : I18N.prop("HMI_YELLOW"), value : "yellow", disabled : false },
			{ id : 4, text : I18N.prop("HMI_GREEN"), value : "green", disabled : false },
			{ id : 5, text : I18N.prop("HMI_TRANSPARENT"), value : "transparent", disabled : false }
		];

		var propertyType = "WRITE", propertyTypeDisabled = false,
			propertyTypeDataSource = [{ text : I18N.prop("HMI_NOT_SET"), value : "WRITE" }, { text : I18N.prop("HMI_SET"), value : "READ" }];

		var timeRangeDataSource = [ { text : I18N.prop("HMI_MINUTE"), value : HmiCommon.CHART_MINUTES.ONE.value },
			{ text : I18N.prop("HMI_5_MINUTES"), value : HmiCommon.CHART_MINUTES.FIVE.value },
			{ text : I18N.prop("HMI_10_MINUTES"), value : HmiCommon.CHART_MINUTES.TEN.value },
			{ text : I18N.prop("HMI_15_MINUTES"), value : HmiCommon.CHART_MINUTES.FIFTEEN.value },
			{ text : I18N.prop("HMI_30_MINUTES"), value : HmiCommon.CHART_MINUTES.THIRTEEN.value }
		];
		//AO 쓰기 가능, AI는 읽기만 가능 적용 여부 파악 필요
		/*if(device.type){
			if(device.type.indexOf("AO") != -1){
				propertyTypeDisabled = false
			}else{
				propertyType = "READ";
				propertyTypeDisabled = true
			}
		}*/

		var textLocationDataSource = [ { text : I18N.prop("HMI_NO_TEXT"), value : "empty" }, { text : I18N.prop("HMI_MIDDLE"), value : "middle" },
			{ text : I18N.prop("HMI_TOP"), value : "top" }, { text : I18N.prop("HMI_BOTTOM"), value : "bottom" },
			{ text : I18N.prop("HMI_LEFT"), value : "left" }, { text : I18N.prop("HMI_RIGHT"), value : "right" }];
		var progressTextLocation = "right";
		if(data.type == "ProgressBar" && data.direction != "vertical") progressTextLocation = "bottom";

		var gaugeDataSource = [
			{ text : I18N.prop("HMI_GAUGE_1"), value : 1 }, { text : I18N.prop("HMI_GAUGE_2"), value : 2 },
			{ text : I18N.prop("HMI_GAUGE_3"), value : 3 }, { text : I18N.prop("HMI_GAUGE_4"), value : 4 },
			{ text : I18N.prop("HMI_GAUGE_5"), value : 5 }, { text : I18N.prop("HMI_GAUGE_6"), value : 6 },
			{ text : I18N.prop("HMI_GAUGE_7"), value : 7 }, { text : I18N.prop("HMI_GAUGE_8"), value : 8 },
			{ text : I18N.prop("HMI_GAUGE_9"), value : 9 }, { text : I18N.prop("HMI_GAUGE_10"), value : 10 }
		];

		var buildingDataSource = MainWindow.getCurrentBuildingList();

		var hasButtonDataSource = [
			{ text : I18N.prop("HMI_BUTTON_DISPLAY"), value : true }, { text : I18N.prop("HMI_BUTTON_HIDDEN"), value : false }
		];

		var projectionDataSource = [
			{ text : I18N.prop("HMI_PROJECTION_PERSPECTIVE"), value : "Perspective" }, { text : I18N.prop("HMI_PROJECTION_TOP"), value : "Top" },
			{ text : I18N.prop("HMI_PROJECTION_FRONT"), value : "Front" }
		];

		var fillColor;
		if(graphicType == "ExtLabel") fillColor = null;
		else fillColor = "#000000";

		var minMaxDisabled = false, minMaxMin = HmiCommon.DEFAULT_MIN_VALUE, minMaxMax = HmiCommon.DEFAULT_MAX_VALUE;
		//기본 최소, 최대값
		var maxValue = HmiCommon.DEFAULT_MAX, minValue = HmiCommon.DEFAULT_MIN;
		/*if(categoryName == "Alarm" || categoryName == "Chart"){
			minMaxMin = HmiCommon.DEFAULT_ALARM_MIN_VALUE;
			minMaxMax = HmiCommon.DEFAULT_ALARM_MAX_VALUE;
		}else if(graphicType == "ExtLabel"){
			minMaxMin = HmiCommon.DEFAULT_TEXT_MIN_VALUE;
			minMaxMax = HmiCommon.DEFAULT_TEXT_MAX_VALUE;
		}*/

		var valueDisabled = false, valueRequired = false;
		//텍스트가 디바이스(AI or AO) 바인딩 되어 있을 경우에는 값 설정을 disabled 한다.
		//그 외 모두 disabled 한다. (ControlPoint Value랑 연동되어 사용자가 편집 불가.)
		if(graphicType == "ExtLabel"){
			var isBinding = isValidValue(device.value);
			if(isBinding){
				valueDisabled = true;
				valueRequired = false;
			}else{
				valueDisabled = false;
				valueRequired = true;
			}
		}else if(HmiUtil.hasControlValueGraphic(graphicType)){
			valueDisabled = true;
			valueRequired = false;
		}

		var textLocation = isValidValue(data.textLocation) ? data.textLocation : "empty";
		var buttonTextOnOffVisible = true;
		if((graphicType == "Button" || graphicType == "RectangleGraphic") && textLocation == "empty") buttonTextOnOffVisible = false;

		var isReverseDisabled = false;
		var graphicColorOnOffDisabled = false;
		var graphicColorDisabled = false;
		if(HmiUtil.isMultiBindingType(categoryName)){
			//바인딩 상태가 아닐 경우 최소/최대 값 및 반전 모두 활성화된다.
			if(device.id){
				if(HmiUtil.isDigitalType(device.type)){
					//디지털 타입일 경우 최대/최소값 비활성화
					minMaxDisabled = true;
					graphicColorDisabled = true;
				}else{
					//아날로그 타입일 경우 반전 비활성화
					isReverseDisabled = true;
					graphicColorOnOffDisabled = true;
				}
			}
		}

		var minWidth, minHeight;
		if(graphicType == "Line"){
			if(data.height < HmiCommon.GRAPHIC_MIN_HEIGHT){
				minWidth = HmiCommon.GRAPHIC_MIN_WIDTH;
				minHeight = 0;
			}else if(data.width < HmiCommon.GRAPHIC_MIN_HEIGHT){
				minWidth = 0;
				minHeight = HmiCommon.GRAPHIC_MIN_HEIGHT;
			}else{
				minWidth = 0;
				minHeight = 0;
			}
		}else{
			minWidth = HmiCommon.GRAPHIC_MIN_WIDTH;
			minHeight = HmiCommon.GRAPHIC_MIN_HEIGHT;
		}
		var maxWidth, maxHeight, maxX, maxY;
		maxWidth = HmiCommon.DEFAULT_CANVAS_WIDTH - data.locationX;
		maxHeight = HmiCommon.DEFAULT_CANVAS_HEIGHT - data.locationY;
		maxX = HmiCommon.DEFAULT_CANVAS_WIDTH - data.width;
		maxY = HmiCommon.DEFAULT_CANVAS_HEIGHT - data.height;
		if(data.locationX > maxX) data.locationX = maxX;
		if(data.locationY > maxY) data.locationY = maxY;
		if(data.width > maxWidth) data.width = maxWidth;
		if(data.height > maxHeight) data.height = maxHeight;

		//항목 개수가 최대 사이즈일 경우 addBtn 비활성화
		var optionValues, addBtnDisabled = false;
		if(isValidValue(data.optionValues)){
			optionValues = optionValuesToVm.call(bindingTabWidget, data.optionValues);
			addBtnDisabled = optionValues.length >= HmiCommon.MAX_OPTIONS_SIZE;
		}else{
			optionValues = optionValuesToVm.call(bindingTabWidget, [{ text : "", value : 0 }]);
		}

		var reverse = isValidValue(data.reverse) ? data.reverse : false;
		if(reverse == "true" || reverse === true) reverse = true;
		else reverse = false;

		//StorkeDash, Marker 초기 Value 셋팅
		//디자인 요구 사항으로 인하여 현재 값에 selected true 값을 추가한다.
		var strokeDasharray = isValidValue(data.strokeDasharray) ? data.strokeDasharray : "0";
		var sourceMarker = isValidValue(data.sourceMarker) ? data.sourceMarker.points : "0,0";
		var targetMarker = isValidValue(data.targetMarker) ? data.targetMarker.points : "0,0";
		var strokeWidth = isValidValue(data.strokeWidth) ? data.strokeWidth : HmiCommon.DEFAULT_TEXT_STROKE;

		var propertyInfoObj = {
			"properties" : {
				"button" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_PROPERTY_HAS_BUTTON"),
					items : {
						"hasButton" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_BUTTON_DISPLAY"),
							value : isValidValue(data.hasButton) ? data.hasButton : true,
							dataSource : hasButtonDataSource
						},
						"buttonType" : {
							name : I18N.prop("HMI_BUTTON_TYPE"),
							visible : true,
							disabled : false,
							value : isValidValue(data.buttonType) ? data.buttonType : "Push"
						}
					}
				},
				"hyperLink" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_HYPER_LINK"),
					items : {
						"file" : {
							name : I18N.prop("HMI_FILE"),
							visible : true,
							value : isValidValue(data.file) ? data.file : {id : 0, name : "-"}
						}
					}
				},
				"general" : {
					visible : true,
					expanded : true,
					name : I18N.prop("COMMON_GENERAL"),
					items : {
						/*"visible" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_VISIBILITY"),
							value : isValidValue(data.visible) ? data.visible : true,
							dataSource : reverseDataSource
						},*/
						"reverse" : {
							visible :true,
							disabled : isReverseDisabled,
							name : I18N.prop("HMI_REVERSE"),
							value : reverse,
							dataSource : reverseDataSource
						},
						"propertyType" : {
							visible : true,
							disabled : propertyTypeDisabled,
							name : I18N.prop("HMI_READ_ONLY"),
							value : isValidValue(data.propertyType) ? data.propertyType : propertyType,
							dataSource : propertyTypeDataSource
						},
						"timeRange" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_TIME_RANGE"),
							value : isValidValue(data.timeRange) ? data.timeRange : 1000,
							dataSource : timeRangeDataSource
						},
						"opacity" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_OPACITY"),
							value : isValidValue(data.opacity) ? data.opacity : 100
						},
						"count" : {
							visible : true,
							disabled : false,
							min : 1,	//Chart 개수 속성
							max : 30,	//Chart 개수 속성 다른 그래픽이 존재할 경우 변수로 빼야함.
							name : I18N.prop("HMI_CHART_COUNT"),
							value : isValidValue(data.count) ? data.count : 1
						}
					}
				},
				"location" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_LOCATION"),
					items : {
						"x" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_LOCATION_X"),
							max : maxX,
							value : isValidValue(data.locationX) ? data.locationX : 0
						},
						"y" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_LOCATION_Y"),
							max : maxY,
							value : isValidValue(data.locationY) ? data.locationY : 0
						}
					}
				},
				"size" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_SIZE"),
					items : {
						"width" : {
							visible : true,
							disabled : false,
							min : minWidth,
							max : maxWidth,
							name : I18N.prop("HMI_SIZE_WIDTH"),
							value : isValidValue(data.width) ? data.width : HmiCommon.GRAPHIC_MIN_WIDTH
						},
						"height" : {
							visible : true,
							disabled : false,
							min : minHeight,
							max : maxHeight,
							name : I18N.prop("HMI_SIZE_HEIGHT"),
							value : isValidValue(data.height) ? data.height : HmiCommon.GRAPHIC_MIN_HEIGHT
						}
					}
				},
				"line" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_LINE"),
					items : {
						"strokeDasharray" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_LINE_DASH"),
							value : strokeDasharray,
							dataSource : getSelectedDataSource(HmiCommon.lineDashArrayDataSource, strokeDasharray)
						},
						"sourceMarker" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_LINE_ARROW_START"),
							value : sourceMarker,
							dataSource : getSelectedDataSource(HmiCommon.lineMarkerDataSource, sourceMarker)
						},
						"targetMarker" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_LINE_ARROW_END"),
							value : targetMarker,
							dataSource : getSelectedDataSource(HmiCommon.lineMarkerDataSource, targetMarker)
						},
						"strokeWidth" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_TOOLBAR_LINE_WIDTH"),
							value : isValidValue(data.strokeWidth) ? data.strokeWidth : HmiCommon.DEFAULT_TEXT_STROKE,
							dataSource : getSelectedDataSource(HmiCommon.lineWidthDataSource, strokeWidth)
						}
					}
				},
				"color" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_CATEGORY_COLOR"),
					items : {
						"fillColor" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_FILL_COLOR"),
							value : isValidValue(data.fillColor) ? data.fillColor : fillColor
						},
						"highlightColor" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_HIGHLIGHT_COLOR"),
							value : isValidValue(data.highlightColor) ? data.highlightColor : null
						},
						"strokeColor" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_TOOLBAR_LINE_COLOR"),
							value : isValidValue(data.strokeColor) ? data.strokeColor : null
						},
						"dataColor" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_COLOR"),
							value : isValidValue(data.dataColor) ? data.dataColor : "#0000FF"
						},
						"buttonColor" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_COLOR"),
							value : isValidValue(data.buttonColor) ? data.buttonColor : "blue",
							dataSource : buttonColorDataSource
						},
						"svgGraphicColorOn" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_COLOR_ON"),
							value : isValidValue(data.svgGraphicColorOn) ? data.svgGraphicColorOn : HmiCommon.COLOR_STR_TO_HEX["red"]
						},
						"svgGraphicColorOff" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_COLOR_OFF"),
							value : isValidValue(data.svgGraphicColorOff) ? data.svgGraphicColorOff : HmiCommon.COLOR_STR_TO_HEX["gray"]
						},
						"graphicColor" : {
							visible : true,
							disabled : graphicColorDisabled,
							name : I18N.prop("HMI_COLOR"),
							value : isValidValue(data.graphicColor) ? data.graphicColor : "gray",
							dataSource : graphiColorDataSource
						},
						"graphicColorOn" : {
							visible : true,
							disabled : graphicColorOnOffDisabled,
							name : I18N.prop("HMI_COLOR_ON"),
							value : isValidValue(data.graphicColorOn) ? data.graphicColorOn : "red",
							dataSource : graphiColorDataSource
						},
						"graphicColorOff" : {
							visible : true,
							disabled : graphicColorOnOffDisabled,
							name : I18N.prop("HMI_COLOR_OFF"),
							value : isValidValue(data.graphicColorOff) ? data.graphicColorOff : "gray",
							dataSource : graphiColorDataSource
						}
					}
				},
				"font" : {
					visible : buttonTextOnOffVisible,
					expanded : true,
					name : I18N.prop("HMI_FONT"),
					items : {
						"fontSize" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_FONT_SIZE"),
							value : isValidValue(data.fontSize) ? data.fontSize : 16
						},
						"fontColor" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_FONT_COLOR"),
							value : isValidValue(data.fontColor) ? data.fontColor : "#000000"
						},
						"fontType" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_FONT_TYPE"),
							value : isValidValue(data.fontType) ? data.fontType : "Arial",
							dataSource : HmiCommon.fontTypeDataSource
						},
						"fontStyle" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_FONT_STYLE"),
							value : isValidValue(data.fontStyle) ? data.fontStyle : "Normal",
							dataSource : HmiCommon.fontStyleDataSource
						}
					}
				},
				"text" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_TEXT_VALUE"),
					items : {
						"label" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_LABEL"),
							value : isValidValue(data.label) ? data.label : ""
						},
						"value" : {
							visible : true,
							disabled : valueDisabled,
							required : valueRequired,
							name : I18N.prop("HMI_VALUE"),
							value : isValidValue(data.value) ? data.value : null
						},
						"controlValue" : {
							visible : true,
							disabled : valueDisabled,
							required : valueRequired,
							min : minMaxMin,
							max : minMaxMax,
							name : I18N.prop("HMI_VALUE"),
							value : isValidValue(data.value) ? data.value : null
						},
						"unit" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_UNIT"),
							value : isValidValue(data.unit) ? data.unit : null
						},
						"prefix" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_PREFIX"),
							value : isValidValue(data.prefix) ? data.prefix : ""
						},
						"suffix" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_SUFFIX"),
							value : isValidValue(data.suffix) ? data.suffix : ""
						},
						"gauge" : {
							name : I18N.prop("HMI_GUAGE_VALUE"),
							visible : true,
							disabled : false,
							value : isValidValue(data.gauge) ? data.gauge : 1,
							dataSource : gaugeDataSource
						},
						"checkboxLabel" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_LABEL"),
							value : isValidValue(data.checkboxLabel) ? data.checkboxLabel : ""
						},
						"svgTextOn" : {
							visible : buttonTextOnOffVisible,
							disabled : false,
							name : I18N.prop("HMI_TEXT_ON"),
							value : {
								svgTextColorOn : isValidValue(data.svgTextColorOn) ? data.svgTextColorOn : "#ffffff",
								textOn : isValidValue(data.textOn) ? data.textOn : ""
							}
						},
						"svgTextOff" : {
							visible : buttonTextOnOffVisible,
							disabled : false,
							name : I18N.prop("HMI_TEXT_OFF"),
							value : {
								svgTextColorOff : isValidValue(data.svgTextColorOff) ? data.svgTextColorOff : "#000000",
								textOff : isValidValue(data.textOff) ? data.textOff : ""
							}
						},
						"progressTextLocation" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_TEXT_LOCATION"),
							value : isValidValue(data.progressTextLocation) ? data.progressTextLocation : progressTextLocation,
							dataSource : textLocationDataSource
						},
						"textLocation" : {
							visible : true,
							disable : false,
							name : I18N.prop("HMI_TEXT_LOCATION"),
							value : textLocation,
							dataSource : textLocationDataSource
						}
					}
				},
				"optionValues" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_ITEM_PROPERTY"),
					items : {
						"optionValues" : {
							visible : true,
							disabled : false,
							addBtnDisabled : addBtnDisabled,
							name : I18N.prop("HMI_ITEM"),
							value : optionValues
						}
					}
				},
				"minMax" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_MIN_MAX_VALUE"),
					items : {
						"minValue" : {
							visible : true,
							disabled : minMaxDisabled,
							name : I18N.prop("HMI_MINIMUM_VALUE"),
							value : isValidValue(data.minValue) ? data.minValue : minValue,
							min : minMaxMin,
							max : minMaxMax
						},
						"maxValue" : {
							visible : true,
							disabled : minMaxDisabled,
							name : I18N.prop("HMI_MAXIMUM_VALUE"),
							value : isValidValue(data.minValue) ? data.maxValue : maxValue,
							min : minMaxMin,
							max : minMaxMax
						}
					}
				},
				"misc" : {
					visible : true,
					expanded : true,
					name : I18N.prop("HMI_ELEMENT_MISC"),
					items : {
						"projection" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_ICON_TYPE"),
							value : isValidValue(data.projection) ? data.projection : "Perspective",
							dataSource : projectionDataSource
						},
						"building" : {
							visible : true,
							disabled : false,
							name : I18N.prop("HMI_BUILDING"),
							value : isValidValue(data.building) ? data.building : { id : 0, name : "" },
							dataSource : buildingDataSource
						}
					}
				}
			},
			"events" : {
				validate : evtDelegator.bind(bindingTabWidget, "validate"),
				change : evtDelegator.bind(bindingTabWidget, "change"),
				click : evtDelegator.bind(bindingTabWidget, "click"),
				open : evtDelegator.bind(bindingTabWidget, "open"),
				select : evtDelegator.bind(bindingTabWidget, "select"),
				dataBound : evtDelegator.bind(bindingTabWidget, "dataBound")
			}
		};

		return propertyInfoObj;
	};

	var BindingTab = Widget.extend({
		options : {
			name : "HmiBinding",
			dataSource : null
		},
		events : [
			"change"
		],
		init : function(element, options){
			var that = this;
			Widget.fn.init.call(that, element, options);
			that.element.addClass("hmi-binding");
			that.element.html(BINDING_TAB_TEMPLATE());
			that._bindingViewModel();
			that._getElementFromTemplate();
			that._initFilterList();
			that._initDeviceList();
			that._initProperty();
			var LoadingPanel = window.CommonLoadingPanel;
			that.loadingPanel = new LoadingPanel(that.element);
			that.filterLoadingPanel = new LoadingPanel(that.filterWrapper);
			that.colorPicker = $("<div class='hmi-binding-color-picker'/>").kendoCommonColorPicker({
				activeSelector : ".binding-colorpicker-wrapper",
				hasTransparent : true,
				opacity : true
			}).data("kendoCommonColorPicker");
		},
		_bindingViewModel : function(){
			var that = this;
			var I18N = window.I18N;
			that.viewModel = {
				filter : {
					init : that._initFilter.bind(that),
					active : false,
					building : {
						init : that._initFilter.bind(that, "building"),
						id : FILTER_ALL_ID,
						name : I18N.prop("HMI_ALL"),
						disabled : false,
						active : false
					},
					floor : {
						init : that._initFilter.bind(that, "floor"),
						id : FILTER_ALL_ID,
						name : I18N.prop("HMI_ALL"),
						disabled : true,
						active : false
					},
					zone : {
						init : that._initFilter.bind(that, "zone"),
						id : FILTER_ALL_ID,
						name : I18N.prop("HMI_ALL"),
						disabled : true,
						active : false
					},
					device : {
						init : that._initFilter.bind(that, "device"),
						id : null, //실제 type 값
						name : I18N.prop("HMI_ALL"), //Display Type 값
						disabled : false, 	//타입은 최초 비활성화 상태
						active : false
					}
				},
				device : {
					id : null,
					name : null,
					type : null,
					displayType : null,
					mappedType : null,
					displayDetailType : null,
					value : null,
					displayValue : null,
					isApplyingFilter : false
				},
				state : {
					tab : {
						device : true,
						deviceDisabled : false,
						property : false,
						propertyDisabled : false
					},
					isSearching : false,
					isFilterOpen : false,
					isFilterClearDisabled : true,
					isSaveBtnDisabled : true,
					isIndoorType : false
				},
				events : {
					clickTab : that._clickTab.bind(that),
					clickSaveBtn : that._clickSaveBtn.bind(that),
					clickFilterBtn : that._clickFilterBtn.bind(that),
					clickFilterItem : that._clickFilterItem.bind(that),
					keyupSearch : that._keyupSearch.bind(that),
					clickSearchBtn : that._clickSearchBtn.bind(that)
				}
			};
			that.viewModel = kendo.observable(that.viewModel);
			kendo.bind(that.element, that.viewModel);
			that.viewModel.bind("change", that._viewModelChangeEvt.bind(that));
		},
		_isApplyFilter : function(){
			var that = this, viewModel = that.viewModel, filter = viewModel.filter;
			var building = filter.building, floor = filter.floor, zone = filter.zone,
				device = filter.device;
			var deviceTypeFilterValue = device.id;
			deviceTypeFilterValue = deviceTypeFilterValue.split(",");

			//전체로 선택된 필터가 하나라도 없으면(아이템을 선택한 필터가 있으면) 필터 적용 중인 상태.
			var isApplyingFilter = building.id != FILTER_ALL_ID ||
				floor.id != FILTER_ALL_ID ||
				zone.id != FILTER_ALL_ID ||
				deviceTypeFilterValue.length == 1;
			return isApplyingFilter;
		},
		_viewModelChangeEvt : function(e){
			var that = this, viewModel = that.viewModel, filter = viewModel.filter;
			var field = e.field;

			if(field){
				//1개의 필터 active 상태가 변할 때마다 현재 필터가 활성화 상태인지 비활성화 상태인지 업데이트
				if(field.indexOf(".active") != -1){
					var isFilterActive = filter.building.active || filter.floor.active || filter.zone.active || filter.device.active;
					filter.set("active", isFilterActive);
				}else if(field.indexOf(".id") != -1){
					viewModel.state.set("isApplyingFilter", that._isApplyFilter());
				}
			}
		},
		_getElementFromTemplate : function(){
			var that = this, element = that.element;
			that.tabs = element.find(".hmi-binding-tabs");
			that.deviceWrapper = element.find(".hmi-binding-device-wrapper");
			that.filterWrapper = element.find(".hmi-binding-filter-wrapper");
			that.filterEl = that.filterWrapper.find(".hmi-binding-filter");
			that.searchFieldWrapper = element.find(".search-field-wrapper");
			that.searchField = that.searchFieldWrapper.find(".k-input.search-field");
			that.searchBtn = that.searchFieldWrapper.find(".ic-bt-input-search");
			that.propertyWrapper = element.find(".hmi-binding-property-wrapper");
			that.propertyInnerWrapper = that.propertyWrapper.find(".hmi-binding-property-inner-wrapper");
		},
		_initFilter : function(type, e){
			var that = this;
			var I18N = window.I18N, viewModel = that.viewModel;
			var filter = viewModel.filter, state = viewModel.state;
			//필터초기화
			if(filter[type]){
				var initName, id;
				var isDisabled = true;
				initName = I18N.prop("HMI_ALL");
				if(type == "device"){
					id = null;
					var data = that.deviceTypeGrid.dataSource.data();
					if(data[0]) id = data[0].id;
				}else{
					id = FILTER_ALL_ID;
				}

				if(type == "building" || type == "device"){
					isDisabled = false;
				}
				filter[type].set("id", id);
				filter[type].set("name", initName);
				filter[type].set("active", false);
				filter[type].set("disabled", isDisabled);
			}else{
				filter.device.init();
				filter.zone.init();
				filter.floor.init();
				filter.building.init();
				//필터를 전부 초기화 했으므로 Clear 비활성화
				//기기 타입 필터 리스트에서 선택 상태 업데이트
				that.deviceTypeGrid.clearSelection();
				var ds = that.deviceTypeGrid.dataSource;
				var item = ds.get(filter.device.id);
				if(item) item.set("selected", true);

				state.set("isFilterClearDisabled", true);
				that._updateFilterList("building").always(function(){	//전체 빌딩 및 전체 빌딩에 대한 기기 GET
					that._selectBuildingFilter({ item : { id : FILTER_ALL_ID }}).always(function(){

					});
				});
			}
		},
		_clickFilterBtn : function(e){
			var that = this;
			var target = $(e.target);
			var isActive = that.filterWrapper.is(":visible");
			var viewModel = that.viewModel, state = viewModel.state;
			var isFilterOpen = !isActive;
			state.set("isFilterOpen", isFilterOpen);
			if(!that._onClickOutOfFilterBox) that._onClickOutOfFilterBox = that._closeFilterBox.bind(that);
			var rootElement = $("#main");
			rootElement.off("click", that._onClickOutOfFilterBox);
			if(isFilterOpen){
				//다른 곳을 클릭해도 필터가 닫히게한다.
				rootElement.on("click", that._onClickOutOfFilterBox);
			}/*else{
				//필터가 닫히면 이벤트 삭제
				rootElement.off("click", that._onClickOutOfFilterBox);
			}*/
		},
		_closeFilterBox : function(e){
			var that = this;
			var target = $(e.target);
			var wrapper = target.closest(".hmi-binding-filter-wrapper");
			var filterBtn = target.closest(".k-button.filter");

			//필터 버튼 또는 필터 영역의 클릭이 아닐 경우 닫는다.
			if(wrapper.length < 1 && filterBtn.length < 1){
				var viewModel = that.viewModel, state = viewModel.state;
				state.set("isFilterOpen", false);
				//document의 경우 Canvas 클릭 시, 이미 off 되는 현상이 있는 것으로 보여 main 요소로 변경
				var rootElement = $("#main");
				rootElement.off("click", that._onClickOutOfFilterBox);
			}
		},
		_clickFilterItem : function(e){
			//필터 클릭 이벤트 처리
			var that = this, viewModel = that.viewModel, filter = viewModel.filter, target = $(e.target);
			var filterItemEl = target.closest(".hmi-binding-filter-item");
			var type = filterItemEl.data("type");
			var filterVm = filter[type];

			if(filterVm){
				//비활성화 된 상태
				if(filterVm.get("disabled")) return false;

				//이미 활성화 된 상태
				if(filterVm.get("active")){
					//해당 필터 리스트 닫기
				   filterItemEl.find(".list").slideUp(200);
				   filterVm.set("active", false);
				   return false;
				}

				//다른 필터 리스트 닫기
				that.filterEl.find(".hmi-binding-filter-item:not(.title)").each(function(i, el){
					el = $(el);
					var otherType = el.data("type");
					if(otherType != type){
						var listEl = $(el).find(".list");
						listEl.slideUp();
						var otherFilter = filter[otherType];
						if(otherFilter) otherFilter.set("active", false);
					}
				});

				//해당 필터 리스트 열기
				var list = filterItemEl.find(".list");
				var bodyHeight = $("body").outerHeight();
				var offset = that.filterWrapper.offset();
				var filterItemHeight = filterItemEl.outerHeight();
				var filterItemSize = that.filterEl.find(".hmi-binding-filter-item").length;
				var paddingTop = 6, paddingBottom = 6;
				var listHeight = bodyHeight - offset.top - (filterItemHeight * filterItemSize) - 13;

				//해당 필터의 데이터 업데이트
				that._updateFilterList(type).always(function(){
					list.css("height", listHeight);
					list.slideDown(200);
					filterVm.set("active", true);
				});

				//Clear 활성화 (아이템 선택 시 해야함)
				//state.set("isFilterClearDisabled", false);
			}else{	//Clear 선택할 경우
				//리스트가 존재하는 모든 필터 리스트 접기
				that.filterEl.find(".hmi-binding-filter-item:not(.title)").each(function(i, el){
					el = $(el);
					var filterType = el.data("type");
					//Type Filter의 리스트를 제외하고 데이터를 초기화한다.
					var listEl = $(el).find(".list");
					if(filterType != "device"){
						var gridEl = listEl.find("table[data-role='grid']");
						var grid = gridEl.data("kendoGrid");
						grid.setDataSource(new kendo.data.DataSource({ data : []}));
					}
					listEl.slideUp();
					//active = false는 init() 함수에서 이루어짐.
				});
				//필터 전체 클리어
				filter.init();
			}
		},
		_updateFilterList : function(type){
			var that = this, viewModel = that.viewModel, filterVm = viewModel.filter;
			var dfd = new $.Deferred();
			that.filterLoadingPanel.open();
			var building = filterVm.building, buildingId = building.id;
			var floor = filterVm.floor, floorId = floor.id;
			var zone = filterVm.zone, zoneId = zone.id;
			var deviceType = filterVm.device, typeId = deviceType.id;
			var selectedId;

			var ajax;
			if(type == "building"){
				ajax = getBuildings();
				selectedId = buildingId;
			}else if(type == "floor"){
				ajax = getFloors(buildingId);
				selectedId = floorId;
			}else if(type == "zone" && (typeof floorId !== "undefined" && floorId !== null)){
				ajax = getZones(buildingId, floorId);
				selectedId = zoneId;
			}else if(type == "device"){	//setBindingData에서 기기 선택 시, 데이터소스 처리 됨.
				that.filterLoadingPanel.close();
				selectedId = typeId;
				dfd.resolve(selectedId);
			}

			if(ajax){
				ajax.done(function(data){
					var gridEl = that.filterEl.find(".hmi-binding-filter-item[data-type='" + type + "'] table[data-role='grid']");
					var grid = gridEl.data("kendoGrid");
					grid.setDataSource(new kendo.data.DataSource({ data : data }));
					var ds = grid.dataSource;
					//필터 리스트에 현재 선택 상태 업데이트
					var item = ds.get(selectedId);
					if(item) item.set("selected", true);
					that.filterLoadingPanel.close();
					dfd.resolve();
				});
			}

			return dfd.promise();
		},
		_clickTab : function(e){
			var that = this;
			var target = $(e.target);
			if(target.hasClass("disabled") || target.hasClass("active")) return false;
			var type = target.data("type");
			var tabState = that.viewModel.state.tab;
			//다른 탭 비활성화
			if(type == "device"){
				tabState.set("property", false);
			}else{
				tabState.set("device", false);
			}
			//클릭 한 탭 활성화
			tabState.set(type, true);

			if(type == "device"){
				//스크롤 생기지 않는 이슈로 fetch하여 리프레시
				if(that.deviceGrid){
					that.deviceGrid.dataSource.fetch();
				}
			}
		},
		_keyupSearch : function(e){
			//console.log("keyup search");
			var that = this, viewModel = that.viewModel, state = viewModel.state;
			if(e.keyCode && e.keyCode == kendo.keys.ENTER){
				that.search();
			}else if(state.get("isSearching")){
				state.set("isSearching", false);
			}
		},
		_clickSearchBtn : function(e){
			var that = this, viewModel = that.viewModel, state = viewModel.state;
			if(state.isSearching) that.searchField.val("");
			that.search();
		},
		search : function(){
			var that = this, viewModel = that.viewModel, state = viewModel.state, filter = viewModel.filter;
			var grid = that.deviceGrid;
			var ds = grid.dataSource;
			var keywords = that.searchField.val();

			if(!that._highlighSearchResult) that._highlighSearchResult = that.highlighSearchResult.bind(that);
			grid.unbind("dataBound", that._highlighSearchResult);
			if(keywords){
				state.set("isSearching", true);
				grid.bind("dataBound", that._highlighSearchResult);
				/*ds.filter({logic : "or", filters : [
					{
						field : "name",
						operator : "contains",
						value : keywords
					}
				]});*/
			}else{
				state.set("isSearching", false);
				/*ds.filter([]);*/
			}
			that._selectDeviceTypeFilter({ item : filter.device });
		},
		highlighSearchResult : function(){
			var that = this;
			var keywords = that.searchField.val();
			if(keywords){
				var rowElements = that.deviceGrid.items();
				var text, rowEl, i, max = rowElements.length;
				var regex = new RegExp(escapeRegExp(keywords), "gi");

				for( i = 0; i < max; i++ ){
					rowEl = $(rowElements[i]);
					rowEl = rowEl.find("td");
					text = rowEl.html();
					text = text.replace(regex, searchHighlightReplacer);
					rowEl.html(text);
				}
			}
		},
		_initFilterList : function(){
			var that = this, element = that.element;
			that.bindingFilter = element.find(".hmi-binding-filter");
			var gridOptions = $.extend(true, {}, DEFAULT_GRID_OPTIONS, {
				columns : [{
					field : "name",
					template : function(data){
						return "<div class='hmi-filter-name-wrapper'>" + data.name + "</div>";
					}
				}]
			});
			that.buildingGridEl = that.bindingFilter.find(".hmi-binding-filter-item[data-type='building'] .list > table");
			that.buildingGrid = that.buildingGridEl.kendoGrid(gridOptions).data("kendoGrid");
			that.buildingGrid.bind("change", that._selectBuildingFilter.bind(that));

			that.floorGridEl = that.bindingFilter.find(".hmi-binding-filter-item[data-type='floor'] .list > table");
			that.floorGrid = that.floorGridEl.kendoGrid(gridOptions).data("kendoGrid");
			that.floorGrid.bind("change", that._selectFloorFilter.bind(that));

			that.zoneGridEl = that.bindingFilter.find(".hmi-binding-filter-item[data-type='zone'] .list > table");
			that.zoneGrid = that.zoneGridEl.kendoGrid(gridOptions).data("kendoGrid");
			that.zoneGrid.bind("change", that._selectZoneFilter.bind(that));

			//Default. 선택한 컴포넌트에 따라 변경되어야함.
			gridOptions.dataSource = getAllTypeDs();
			gridOptions.columns = [{
				field : "name",
				template : function(data){
					var Util = window.Util;
					//Display Type으로 표시
					var name;
					if(data.id.indexOf("AirConditioner") != -1) name = data.name;
					else if(data.id.split(",").length > 1) name = data.name;	//모든 타입
					else name = Util.getDetailDisplayTypeDeviceI18N(data.id);
					return "<div class='hmi-filter-name-wrapper'>" + name + "</div>";
				}
			}];

			that.deviceTypeGridEl = that.bindingFilter.find(".hmi-binding-filter-item[data-type='device'] .list > table");
			that.deviceTypeGrid = that.deviceTypeGridEl.kendoGrid(gridOptions).data("kendoGrid");
			that.deviceTypeGrid.bind("change", that._selectDeviceTypeFilter.bind(that));
		},
		_initDeviceList : function(){
			var that = this, element = that.element;
			var gridOptions = $.extend(true, {}, DEFAULT_GRID_OPTIONS, {
				columns : [{
					field : "name",
					template : function(data){
						return "<div class='device-name' title='" + data.name + "'>" + data.name + "</div>";
					}
				}],
				scrollable : { virtual : true }
			});
			that.deviceGridEl = element.find("table.hmi-binding-list");
			that.deviceGrid = that.deviceGridEl.kendoGrid(gridOptions).data("kendoGrid");
			that.deviceGrid.bind("change", that._selectDevice.bind(that));
		},
		_selectBuildingFilter : function(e){
			var that = this, viewModel = that.viewModel, filter = viewModel.filter,
				buildingVm = filter.building, floorVm = filter.floor, zoneVm = filter.zone,
				state = viewModel.state;
			var selectedBuilding = e.item;
			var orgBuildingId = buildingVm.id;
			buildingVm.set("id", selectedBuilding.id);
			//select 이벤트에 name 값이 전달되지 않았을 경우 현재 리스트 내의 DataSource를 통해 가져온다.
			if(selectedBuilding.name){
				buildingVm.set("name", selectedBuilding.name);
			}else{
				var ds = that.buildingGrid.dataSource;
				var item = ds.get(selectedBuilding.id);
				if(item) buildingVm.set("name", item.name);
			}

			//필터 해제 가능
			state.set("isFilterClearDisabled", false);

			//값이 달라졌고 전체 빌딩 선택이 아닌 경우 Floor 초기화 후 활성화 상태로 변경
			if(orgBuildingId != selectedBuilding.id){
				floorVm.init();
				zoneVm.init();
				if(selectedBuilding.id && selectedBuilding.id != FILTER_ALL_ID) floorVm.set("disabled", false);
			}
			//selectType 호출하여 기기 리스트 업데이트
			if(!e.skipTrigger) return that._selectDeviceTypeFilter( { item : filter.device } );
		},
		_selectFloorFilter : function(e){
			var that = this, viewModel = that.viewModel, filter = viewModel.filter,
				floorVm = filter.floor, zoneVm = filter.zone, state = viewModel.state;
			var selectedFloor = e.item;
			var orgFloorId = floorVm.id;
			floorVm.set("id", selectedFloor.id);
			//select 이벤트에 name 값이 전달되지 않았을 경우 현재 리스트 내의 DataSource를 통해 가져온다.
			if(selectedFloor.name){
				floorVm.set("name", selectedFloor.name);
			}else{
				var ds = that.floorGrid.dataSource;
				var item = ds.get(selectedFloor.id);
				if(item) floorVm.set("name", item.name);
			}

			//필터 해제 가능
			state.set("isFilterClearDisabled", false);

			//값이 달라졌고 전체 층 선택이 아닌 경우 Zone 초기화 후 활성화 상태로 변경
			if(orgFloorId != selectedFloor.id){
				zoneVm.init();
				if(selectedFloor.id && selectedFloor.id != FILTER_ALL_ID) zoneVm.set("disabled", false);
			}

			//selectType 호출하여 기기 리스트 업데이트
			if(!e.skipTrigger) return that._selectDeviceTypeFilter( { item : filter.device } );
		},
		_selectZoneFilter : function(e){
			var that = this, viewModel = that.viewModel, filter = viewModel.filter,
				zoneVm = filter.zone, state = viewModel.state;
			var selectedZone = e.item;
			//var orgZoneId = zoneVm.id;
			zoneVm.set("id", selectedZone.id);
			//select 이벤트에 name 값이 전달되지 않았을 경우 현재 리스트 내의 DataSource를 통해 가져온다.
			//zone id는 0이 존재함.
			if(typeof selectedZone.name !== "undefined" && selectedZone.name !== null){
				zoneVm.set("name", selectedZone.name);
			}else{
				var ds = that.zoneGrid.dataSource;
				var item = ds.get(selectedZone.id);
				if(item) zoneVm.set("name", item.name);
			}

			//필터 해제 가능
			state.set("isFilterClearDisabled", false);

			//값이 달라지거나 존 없은 선택의 경우 기기 리스트 초기화
			/*if(!selectedZone.id || (orgZoneId != selectedZone.id)){
				that.deviceGrid.setDataSource(new kendo.data.DataSource({data : []}));
			}*/

			//selectType 호출하여 기기 리스트 업데이트
			if(!e.skipTrigger) return that._selectDeviceTypeFilter( { item : filter.device } );
		},
		_selectDeviceTypeFilter : function(e){
			var that = this, viewModel = that.viewModel, filter = viewModel.filter, state = viewModel.state,
				building = filter.building, floor = filter.floor, zone = filter.zone, deviceTypeVm = filter.device;
			var selectedType = e.item;
			var ds, item, dfd = new $.Deferred();
			if(selectedType && selectedType.id){
				deviceTypeVm.set("id", selectedType.id);
				//select 이벤트에 name 값이 전달되지 않았을 경우 현재 리스트 내의 DataSource를 통해 가져온다.
				if(selectedType.name){
					deviceTypeVm.set("name", selectedType.name);
				}else{
					ds = that.floorGrid.dataSource;
					item = ds.get(selectedType.id);
					if(item) deviceTypeVm.set("name", item.name);
				}

				//디바이스 업데이트
				that.filterLoadingPanel.open();
				that.loadingPanel.open();
				var keywords = "";
				if(state.isSearching) keywords = that.searchField.val();

				getDevices(building.id, floor.id, zone.id, deviceTypeVm.id, keywords).done(function(devices){
					that.deviceGrid.setDataSource(new kendo.data.DataSource({data : devices}));
					var device = viewModel.device;
					//바인딩 한 기기가 존재할 경우, 해당 기기를 선택한다.
					if(device.id){
						ds = that.deviceGrid.dataSource;
						item = ds.get(device.id);
						if(item) item.set("selected", true);
					}
					that.filterLoadingPanel.close();
					that.loadingPanel.close();
					dfd.resolve();
				});
			}else{
				dfd.reject();
			}
			return dfd.promise();
		},
		_selectDevice : function(e){
			var that = this, viewModel = that.viewModel, deviceVm = viewModel.device;
			var selectedDevice = e.item, Util = window.Util, HmiUtil = window.HmiUtil;
			if(e.item === null){
				deviceVm.set("id", null);
				deviceVm.set("name", null);
				deviceVm.set("tagName", null);
				deviceVm.set("type", null);
				deviceVm.set("mappedType", null);
				deviceVm.set("displayType", null);
				deviceVm.set("displayDetailType", null);
				deviceVm.set("value", null);
				deviceVm.set("displayValue", null);
			}else if(e.item){
				deviceVm.set("id", selectedDevice.id);
				deviceVm.set("name", selectedDevice.name);
				deviceVm.set("invalid", HmiUtil.isInvalidDevice(e.item));
				//Value와 Type값을 가져온다.
				var deviceInfo = HmiUtil.getDeviceInfo(selectedDevice, selectedDevice.type);
				deviceVm.set("type", selectedDevice.type);
				deviceVm.set("tagName", deviceInfo.tagName);
				deviceVm.set("mappedType", selectedDevice.mappedType);
				deviceVm.set("displayType", deviceInfo.typeText);
				deviceVm.set("displayDetailType", deviceInfo.displayType);
				if(selectedDevice.type.indexOf("AirConditioner") != -1){	//실내기 기기 정보 처리
					deviceVm.set("value", null);
					deviceVm.set("displayValue", "-");
					//제어 패널 동작을 위하여 모든 정보가 필요.
					deviceVm.set("airConditioner", selectedDevice.airConditioner);
					deviceVm.set("temperatures", selectedDevice.temperatures);
					deviceVm.set("operations", selectedDevice.operations);
					deviceVm.set("modes", selectedDevice.modes);
					deviceVm.set("configuration", selectedDevice.configuration);
					deviceVm.set("winds", selectedDevice.winds);
					deviceVm.set("alarms", selectedDevice.alarms);
					deviceVm.set("representativeStatus", selectedDevice.representativeStatus);
				}else{
					deviceVm.set("value", deviceInfo.value);
					deviceVm.set("displayValue", Util.convertNumberFormat(deviceInfo.value));
				}

				//기기 리스트 선택 상태 업데이트
				//바인딩 한 기기가 존재할 경우, 해당 기기를 선택한다.
				if(deviceVm.id){
					that.deviceGrid.clearSelection();
					var ds = that.deviceGrid.dataSource;
					var item = ds.get(deviceVm.id);
					if(item) item.set("selected", true);
				}
			}

			//Device 선택 시, 프로퍼티가 변경되는 로직
			var bindingData = that._bindingData;
			if(bindingData){
				var propertyViewModel = that.propertyViewModel, properties = propertyViewModel.properties;
				var graphicType = bindingData.type;
				var categoryName = bindingData.categoryName;
				if(HmiUtil.hasControlValueGraphic(graphicType) || (graphicType == "Animation" && categoryName == "Alarm")){
					var textCategory = properties.text;
					if(textCategory){
						var valueVm = textCategory.items.value;
						var controlValueVm = textCategory.items.controlValue;
						var deviceValue = deviceVm.get("displayValue");
						if(isValidValue(deviceValue)){
							if(valueVm) valueVm.set("value", deviceVm.get("displayValue"));
							if(controlValueVm) controlValueVm.set("value", deviceVm.get("displayValue"));
						}
						//텍스트의 경우 디바이스 바인딩 되면 값 필드는 비활성화
						if(categoryName == "ExtLabel"){
							if(deviceVm.id){
								var controlValueValidator = that.propertyInnerWrapper.find("li.property[data-key='controlValue'] [data-role='commonvalidator']").data("kendoCommonValidator");
								if(valueVm) valueVm.set("disabled", true);
								if(controlValueVm) controlValueVm.set("disabled", true);
								if(controlValueValidator) controlValueValidator.hideMessages();
							}else{
								if(valueVm) valueVm.set("disabled", false);
								if(controlValueVm) controlValueVm.set("disabled", false);
							}
						}
					}
				}
				/*if(editFields.state){
					editFields.state.viewModel.setState(selectedData, true);
					//editFields.state.viewModel.set("disabled", false);
				}*/

				//AI DI가 둘다 존재하는 그래픽에 대한 처리.
				if(HmiUtil.isMultiBindingType(categoryName)){
					var minMaxCategory = properties.minMax;
					var minVm = minMaxCategory.items.minValue;
					var maxVm = minMaxCategory.items.maxValue;
					var minValueValidator = that.propertyInnerWrapper.find("li.property[data-key='minValue'] [data-role='commonvalidator']").data("kendoCommonValidator");
					var maxValueValidator = that.propertyInnerWrapper.find("li.property[data-key='maxValue'] [data-role='commonvalidator']").data("kendoCommonValidator");
					minValueValidator.hideMessages();
					maxValueValidator.hideMessages();
					var generalCategory = properties.general;
					var colorCategory = properties.color;
					var reverseVm = generalCategory.items.reverse;
					var graphicColorVm = colorCategory.items.graphicColor;
					var graphicColorOnVm = colorCategory.items.graphicColorOn;
					var graphicColorOffVm = colorCategory.items.graphicColorOff;

					if(deviceVm.id){
						if(deviceVm.displayType == "AI" || deviceVm.displayType == "AO"){
							minVm.set("disabled", false);
							maxVm.set("disabled", false);
							reverseVm.set("disabled", true);
							reverseVm.set("value", false);
							graphicColorVm.set("disabled", false);
							graphicColorOnVm.set("disabled", true);
							graphicColorOffVm.set("disabled", true);
						}else{
							minVm.set("disabled", true);
							maxVm.set("disabled", true);
							reverseVm.set("disabled", false);
							graphicColorVm.set("disabled", true);
							graphicColorOnVm.set("disabled", false);
							graphicColorOffVm.set("disabled", false);
						}
					}else{	//바인딩된 기기가 없을 때는 모두 활성화
						reverseVm.set("disabled", false);
						minVm.set("disabled", false);
						maxVm.set("disabled", false);
						graphicColorVm.set("disabled", false);
						graphicColorOnVm.set("disabled", false);
						graphicColorOffVm.set("disabled", false);
					}
				}
			}

			//저장 버튼 업데이트
			that.validateForSaveBtn();
		},
		_initProperty : function(){
			var that = this, propertyInnerWrapper = that.propertyInnerWrapper;
			//프로퍼티 카테고리 접기-펴기
			propertyInnerWrapper.on("click", ".hmi-binding-property-category .category-title", that._propertyExpandEvt.bind(that));
			//Input 키 전체 이벤트
			propertyInnerWrapper.on("keyup", ".hmi-binding-property-category .category-items .property .k-input", that._propertyKeyUpEvt.bind(that));
			//텍스트 삭제 버튼 이벤트
			propertyInnerWrapper.on("click", ".hmi-binding-property-category .category-items .property .ic-btn-remove-sm", that._propertyRemoveBtnClickEvt.bind(that));
			//Color Picker 동작
			propertyInnerWrapper.on("click", ".hmi-binding-property-category .category-items .property .binding-colorpicker-wrapper", that._propertyColorPickerBtnClickEvt.bind(that));
			//멀티 값 설정 이벤트
			propertyInnerWrapper.on("click", ".hmi-binding-property-category .category-items .property .hmi-binding-option-values .add-btn", that._propertyOptionValuesAdd.bind(that));
			propertyInnerWrapper.on("click", ".hmi-binding-property-category .category-items .property .hmi-binding-option-values .remove-btn", that._propertyOptionValuesRemove.bind(that));
		},
		_propertyOptionValuesAdd : function(e){
			var I18N = window.I18N, HmiCommon = window.HmiCommon;
			var that = this, propertyViewModel = that.propertyViewModel, properties = propertyViewModel.properties,
				category = properties.optionValues, optionValuesVm = category.items.optionValues, optionValues = optionValuesVm.value;

			var target = $(e.target);
			if(target.hasClass("disabled")) return;

			if(optionValues.length >= HmiCommon.MAX_OPTIONS_SIZE) return;

			var lastIndex = optionValues.length - 1;
			var lastItem = optionValues[lastIndex];
			var value = lastItem ? Number(lastItem.value) + 1 : 0;
			//추가 버튼을 클릭한 항목의 바로 아래에 항목 추가
			var changeEvt = evtDelegator.bind(that, "change");
			var option = {
				name : I18N.prop("HMI_ITEM") + " " + (optionValues.length + 1),
				text : "",
				value : value,
				change : changeEvt
			};
			optionValues.push(option);

			var i, max = optionValues.length;
			var addBtnDisabled = false, removeBtnDisabled = true;
			//아이템 개수가 최대 개수 일 경우 추가 버튼 비활성화
			if(max >= HmiCommon.MAX_OPTIONS_SIZE) addBtnDisabled = true;
			//아이템 개수가 2개 이상 일 경우 삭제 버튼 활성화
			if(max > 1) removeBtnDisabled = false;

			//이름 업데이트
			for( i = 0; i < max; i++ ){
				optionValues[i].set("name", I18N.prop("HMI_ITEM") + " " + (i + 1));
				optionValues[i].set("removeBtnDisabled", removeBtnDisabled);
			}
			optionValuesVm.set("addBtnDisabled", addBtnDisabled);

			that.validateForSaveBtn();
			//추가 시, 스크롤을 가장 아래로 이동
			that.propertyInnerWrapper.scrollTop(that.propertyInnerWrapper.get(0).scrollHeight);
		},
		_propertyOptionValuesRemove : function(e){
			var I18N = window.I18N, HmiCommon = window.HmiCommon;
			var that = this, propertyViewModel = that.propertyViewModel, properties = propertyViewModel.properties,
				category = properties.optionValues, optionValuesVm = category.items.optionValues, optionValues = optionValuesVm.value;

			var target = $(e.target);
			if(target.hasClass("disabled")) return;

			var item = target.closest(".hmi-binding-option-value-item");
			var index = item.index();
			//해당 행의 필드 삭제
			optionValues.splice(index, 1);
			var i, max = optionValues.length;

			var addBtnDisabled = true, removeBtnDisabled = false;
			//아이템 개수가 최대 개수보다 적을 경우 추가 버튼 활성화
			if(max < HmiCommon.MAX_OPTIONS_SIZE) addBtnDisabled = false;
			//아이템 개수가 1개 일 경우 삭제 버튼 비활성화
			if(max == 1) removeBtnDisabled = true;

			//이름 업데이트
			for( i = 0; i < max; i++ ){
				optionValues[i].set("name", I18N.prop("HMI_ITEM") + " " + (i + 1));
				optionValues[i].set("removeBtnDisabled", removeBtnDisabled);
			}
			optionValuesVm.set("addBtnDisabled", addBtnDisabled);

			that.validateForSaveBtn();
		},
		_propertyColorPickerBtnClickEvt : function(e){
			var that = this;

			var target = $(e.target).closest(".binding-colorpicker-wrapper");
			if(target.hasClass("active")) that.closeColorPicker(target);
			else that.openColorPicker(target);
		},
		closeColorPicker : function(target, isCloseEvt){
			var that = this;
			target.removeClass("active");
			that._isColorPickerOpen = false;
			if(that._activeCanvas && that._activeCanvas.createView){
				that._activeCanvas.createView.setColorPickerOpenState(false);
			}
			if(!isCloseEvt) that.colorPicker.close();
		},
		openColorPicker : function(target){
			var that = this, viewModel = that.propertyViewModel, properties = viewModel.properties;
			//프로퍼티의 필드 정보
			var valueFieldName = target.data("valueField");
			var propertyEl = target.closest(".property");
			var category = propertyEl.data("category");
			var field = propertyEl.data("key");
			var value = null;

			//프로퍼티의 ViewModel
			var categoryVm = properties[category], fieldVm;
			if(categoryVm){
				fieldVm = categoryVm.items[field];
				if(fieldVm) value = valueFieldName ? fieldVm.value[valueFieldName] : fieldVm.value;
			}

			if(that._isColorPickerOpen) that.closeColorPicker(target);

			that.colorPicker.unbind("change");
			that.colorPicker.value(value);
			that.colorPicker.bind("change", that._changeColorPickerEvt.bind(that, categoryVm, fieldVm, valueFieldName));
			that.colorPicker.bind("close", that.closeColorPicker.bind(that, target, true));
			target.addClass("active");
			that._isColorPickerOpen = true;
			that.colorPicker.open();
			if(that._activeCanvas && that._activeCanvas.createView){
				that._activeCanvas.createView.setColorPickerOpenState(true);
			}

			//컬러피커 위치 계산
			var targetOffset = target.offset();
			var top = targetOffset.top, left = targetOffset.left;
			var colorPickerEl = that.colorPicker.element;
			var height = colorPickerEl.outerHeight();
			var width = colorPickerEl.outerWidth();
			var bodyHeight = $("body").outerHeight();

			targetOffset.left = left - width - 10;
			//body를 넘어 갈 경우 위로 ColorPicker가 열리도록 수정
			if(top + height > bodyHeight) top = top - height - 10;
			targetOffset.top = top;
			that.colorPicker.position(targetOffset);
		},
		_changeColorPickerEvt : function(category, property, valueFieldName, e){
			var that = this, value = e.value == "transparent" ? "" : e.value;
			if(valueFieldName) property.value.set(valueFieldName, value);
			else property.set("value", value);
			that.validateForSaveBtn();
		},
		_propertyExpandEvt : function(e){
			var that = this;
			var target = $(e.target);
			var categoryTitle = target.closest(".category-title");
			var icon = categoryTitle.find(".ic");
			var isExpanded = icon.hasClass("expand");
			var isExpand = !isExpanded;

			var categoryEl = target.closest(".hmi-binding-property-category");
			var categoryKey = categoryEl.data("key");
			var itemsEl = categoryEl.find(".category-items");
			if(isExpand){
				//접기
				itemsEl.slideDown(200, function(){
					that.propertyViewModel.properties[categoryKey].set("expanded", true);
				});
			}else{
				//펴기
				itemsEl.slideUp(200, function(){
					that.propertyViewModel.properties[categoryKey].set("expanded", false);
				});
			}
		},
		_propertyRemoveBtnClickEvt : function(e){
			//Remove 버튼 클릭 이벤트 처리
			var target = $(e.target);
			var numericTextBox = target.siblings(".k-numerictextbox");
			var input;
			if(numericTextBox.length > 0){
				input = numericTextBox.find("input[data-role='numerictextbox']");
				input.val("");
				//Formatted Value 또한 삭제
				input = numericTextBox.find("input.k-formatted-value");
			}else{
				input = target.siblings(".k-input");
			}

			input.val("");
			input.trigger("keyup", { target : e.target });
		},
		_propertyKeyUpEvt : function(e){
			var that = this;
			//Validator 입력 필드에서 keyup 시 마다 저장 버튼의 활성화 성태를 업데이트한다.
			var target = $(e.target);
			//Remove 버튼 숨김/표시 처리
			var value = target.val();
			var removeBtn;
			if(target.attr("data-role") == "numerictextbox"){	//Numerictextbox 입력일 경우의 처리
				removeBtn = target.closest(".k-numerictextbox").siblings(".ic-btn-remove-sm");
			}else{
				removeBtn = target.siblings(".ic-btn-remove-sm");
			}

			if(value) removeBtn.show();
			else removeBtn.hide();

			//Key Up 시, ViewModel에 값 반영
			var propertyItemEl = target.closest("li.property");
			var field = propertyItemEl.data("key");
			var category = propertyItemEl.data("category");
			var viewModel = that.propertyViewModel, properties = viewModel.properties;
			var categoryVm = properties[category], fieldVm;
			if(categoryVm){
				fieldVm = categoryVm.items[field];
				if(fieldVm){
					var valueFieldName = "value";
					if(field == "optionValues"){
						var optionValueItemEl = target.closest(".hmi-binding-option-value-item");
						var index = optionValueItemEl.index();
						fieldVm = fieldVm.value[index];
						var valueEl = target.closest("p.hmi-binding-option-value-item-value");
						if(valueEl.length > 0) valueFieldName = "value";
						else valueFieldName = "text";
					}else if(field == "svgTextOn"){
						fieldVm = fieldVm.value;
						valueFieldName = "textOn";
					}else if(field == "svgTextOff"){
						fieldVm = fieldVm.value;
						valueFieldName = "textOff";
					}

					var isValid = true;
					var validator = target.closest("[data-role='commonvalidator']");
					if(validator.length > 0){
						validator = validator.data("kendoCommonValidator");
						isValid = validator.validate();
					}
					if(that._keyupTimeout) clearTimeout(that._keyupTimeout);
					if(fieldVm && isValid){
						that._keyupTimeout = setTimeout(function(){
							fieldVm.set(valueFieldName, value);
							that.validateForSaveBtn();
							that._keyupTimeout = null;
						}, BINDING_KEY_UP_TIMEOUT);
					}
				}
			}
		},
		validateForSaveBtn : function(timeout){
			//input 필드의 k-invalid 여부 체크
			//validate 결과가 true 이면 save 버튼 활성화
			var that = this, viewModel = that.viewModel, propertyViewModel = that.propertyViewModel.properties;
			that.propertyInnerWrapper.find("[data-role='commonvalidator']").each(function(i, e){
				var el = $(e);
				var v = el.data("kendoCommonValidator");
				if(v) v.validate();
			});
			var invalidFieldNum = 0;
			//Visible이 false인 필드에 대해서는 체크하지 않는다.
			that.propertyInnerWrapper.find(".k-invalid").each(function(i, e){
				var el = $(e);
				var propertyEl = el.closest("li.property");
				var category = propertyEl.data("category");
				var field = propertyEl.data("key");
				var categoryVm = propertyViewModel[category];
				var fieldVm = categoryVm.items[field];
				if(categoryVm.visible && fieldVm.visible) invalidFieldNum++;
			});
			//viewModel.state.set("isSaveBtnDisabled", invalidFieldNum > 0);
			if(invalidFieldNum < 1){
				that._clickSaveBtn();
			}
		},
		_clickSaveBtn : function(e){
			//세이브 시, Trigger하여 객체에 설정한 바인딩 정보 설정
			//View Model의 데이터 전달
			var that = this;
			var propertyViewModel = that.propertyViewModel, properties = propertyViewModel.properties, allowedField = that._allowedField;
			var viewModel = that.viewModel, deviceVm = viewModel.device;
			//Observable Object아닌 상태로 for문을 돌기 위함.
			var value, category, categoryObj, items, field, fieldObj, propertyJson = properties.toJSON();

			var savedData = {};

			for(category in propertyJson){
				categoryObj = propertyJson[category];
				items = categoryObj.items;
				for(field in items){
					if(allowedField.indexOf(field) == -1) continue;
					fieldObj = items[field];
					if(fieldObj.visible){
						value = fieldObj.value;
						if(field == "optionValues") value = optionValuesToBinding(value);
						else if(field == "sourceMarker" || field == "targetMarker") value = getMarkerValueToBinding(value);
						if(NumberFields.indexOf(field) != -1) value = Number(value);
						savedData[field] = value;
					}
				}
			}

			//Device 정보
			var device = deviceVm.toJSON();
			if(device.id) savedData.device = device;
			that.trigger("save", { item : savedData });
		},
		updateBindingData : function(bindingData){
			var that = this, propertyViewModel = that.propertyViewModel, properties = propertyViewModel.properties;
			var propertyJson = properties.toJSON();
			var value, category, categoryVm, items, field, fieldVm;
			for(category in propertyJson){
				categoryVm = properties[category];
				items = categoryVm.items;
				for( field in bindingData ){
					fieldVm = items[field];
					if(fieldVm){
						value = bindingData[field];
						fieldVm.set("value", value);
					}
				}
			}
		},
		setBindingData : function(bindingData){
			var that = this;
			var HmiCommon = window.HmiCommon, Util = window.Util, I18N = window.I18N;
			//바인딩하는 객체에 따라 deviceTypeGrid 데이터 변경
			var categoryName = bindingData.categoryName === "Null" ? bindingData.type : bindingData.categoryName;
			var state = HmiCommon.ControlPointValueAndStateMapping[categoryName];
			var viewModel = that.viewModel;

			var i, max, key, types = [];
			if(state){
				var type, valueType = state.valueType;
				max = valueType.length;
				for( i = 0; i < max; i++ ){
					type = valueType[i];
					for(key in type){
						types.push({ id : type[key], name : Util.getDetailDisplayTypeDeviceI18N(key) });
					}
				}
			}else if(bindingData.type == "Custom"){
				if(bindingData.custom.type == "Multi") types = getAnalogTypeDs();
				else types = getDigitalTypeDs();
			}else if(bindingData.type == "Indoor"){
				types = getIndoorTypeDs();
			}else if(bindingData.deviceTypeText){
				types.push({ id : bindingData.deviceTypeText, name : Util.getDetailDisplayTypeDeviceI18N(bindingData.deviceTypeText) });
			}

			var typesIds = [];
			max = types.length;
			for( i = 0; i < max; i++ ){
				typesIds.push(types[i].id);
			}

			types.unshift({
				id : typesIds.join(","),
				name : I18N.prop("HMI_ALL")
			});

			that.deviceTypeGrid.setDataSource(new kendo.data.DataSource({ data : types }));

			//선택한 요소가 실내기 카드이면 실내기 타입 기기 정보 테이블로 표시한다.
			viewModel.state.set("isIndoorType", bindingData.type == "Indoor");

			//프로퍼티 정보 업데이트
			that.updatePropertyTab(bindingData);

			//바인딩한 객체의 디바이스 정보에 따라 필터 정보 업데이트
			var viewModel = that.viewModel, filter = viewModel.filter;
			var typeFilter = filter.device, buildingFilter = filter.building;
			var device = bindingData.device;
			if(device.id){	//선택한 디바이스 정보 업데이트
				viewModel.set("device", device);
				that._selectDevice({ item : device });
			}else{
				that._selectDevice({ item : null });
				that.deviceGrid.clearSelection();
			}
			if(typeFilter.id){
				var isSupportedType = false;
				max = types.length;
				for( i = 0; i < max; i++ ){
					if(types[i].id == typeFilter.id){
						isSupportedType = true;
						break;
					}
				}
				if(!isSupportedType){	//기존에 선택했던 타입이 타입리스트에 존재하지 않을 경우 토스트 팝업 및 타입 필터 초기화
					if(typeFilter.id.split(",").length <= 1){	//단일 선택일 경우만 토스트 표시.
						//Popup toast
						var toastPopup = HmiCommon.toastPopup;
						toastPopup.show(I18N.prop("HMI_NOT_SUPPORTED_DEVICE_TYPE"));
					}
					//기기 리스트 초기화
					typeFilter.init();
					that.clearDevice();
					typeFilter.set("id", types[0].id);	//최초 선택한 타입 필터가 없을 경우 전체 타입 선택
					typeFilter.set("name", types[0].name);
					var buildingId = buildingFilter.id ? buildingFilter.id : FILTER_ALL_ID;
					that._updateFilterList("building").always(function(){	//전체 빌딩 및 전체 빌딩에 대한 기기 GET
						that._selectBuildingFilter({ item : { id : buildingId }}).always(function(){

						});
					});
				}
			}else{
				typeFilter.set("id", types[0].id);	//최초 선택한 타입 필터가 없을 경우 전체 타입 선택
				typeFilter.set("name", types[0].name);
				that._updateFilterList("building").always(function(){	//전체 빌딩 및 전체 빌딩에 대한 기기 GET
					that._selectBuildingFilter({ item : { id : FILTER_ALL_ID }}).always(function(){

					});
				});
			}

			//기기 타입 필터 리스트에서 선택 상태 업데이트
			var ds = that.deviceTypeGrid.dataSource;
			var item = ds.get(typeFilter.id);
			if(item) item.set("selected", true);

			//필터 초기화
			//filter.init();
			//위치 정보 및 필터 업데이트
			/*if(device.locations && device.locations[0]){
				var location = device.locations[0];
				var buildingId = location.foundation_space_buildings_id;
				var floorId = location.foundation_space_floors_id;
				var zoneId = location.foudnation_space_zone_id;
				that._updateFilterList("building").always(function(){
					if(buildingId){
						that._selectBuildingFilter({ item : { id : buildingId }, skipTrigger : true });
						that._updateFilterList("floor").always(function(){
							if(floorId){
								that._selectFloorFilter({ item : { id : floorId }, skipTrigger : true });
								that._updateFilterList("zone").always(function(){
									if(zoneId){
										that._selectZoneFilter({ item : { id : zoneId }, skipTrigger : true });
									}
									if(device.type){
										that._selectDeviceTypeFilter({ item : { id : device.type } });
									}
								});
							}
						});
					}
				});
			}*/
		},
		clear : function(){
			//모든 정보 초기화
			var that = this;
			that.clearDevice();
			that.clearProperty();
		},
		clearDevice : function(){
			var that = this;
			var bindingData = that._bindingData;
			if(!bindingData || !bindingData.device || !bindingData.device.id) that._selectDevice({ item : null });
			that.deviceGrid.setDataSource(new kendo.data.DataSource({ data : [] }));
		},
		clearProperty : function(){
			var that = this;
			var propertyInnerWrapper = that.propertyInnerWrapper;
			if(that.propertyViewModel){
				kendo.unbind(propertyInnerWrapper, that.propertyViewModel);
				that.propertyViewModel.unbind("change");
			}
			that.unbind("property");
			propertyInnerWrapper.empty();
			that._bindingData = null;
			that._allowedField = null;
		},
		updatePropertyTab : function(bindingData){
			var that = this, propertyInnerWrapper = that.propertyInnerWrapper;
			that.clearProperty();

			var type = bindingData.type;
			//Device는 지원하지 않는 그래픽 타입
			var device = bindingData.device;

			if(onlyhasPropertyGraphicType.indexOf(type) != -1){
				that.viewModel.state.tab.set("deviceDisabled", true);
				that._clickTab({ target : that.tabs.find("li[data-type='property']") });
			}else{
				that.viewModel.state.tab.set("deviceDisabled",false);
				if(device.id){
					that._clickTab({ target : that.tabs.find("li[data-type='property']") });
				}else{
					that._clickTab({ target : that.tabs.find("li[data-type='device']") });
				}
			}

			that._bindingData = bindingData;
			//데이터
			var viewModel = getBindingPropertyViewModel(that, bindingData);
			var allowedField = getAllowedPropertyField(bindingData);
			that._allowedField = allowedField;

			//템플릿
			var key, category, properties = viewModel.properties;
			var htmlTemplate = "";
			for(key in properties){
				category = properties[key];
				htmlTemplate += getBindingPropertyCategoryTemplate(key, category, allowedField);
			}
			propertyInnerWrapper.html(htmlTemplate);

			//기존의 expanded 정보만 유지하여 ViewModel로 만들 Object 생성
			if(that.propertyViewModel){
				properties = that.propertyViewModel.properties.toJSON();
				var targetProperties = viewModel.properties;
				for(key in properties){
					category = properties[key];
					targetProperties[key].expanded = category.expanded;
				}
				that.propertyViewModel = $.extend(true, {}, viewModel, that.propertyViewModel);
			}

			//뷰 모델 바인딩
			that.propertyViewModel = kendo.observable(viewModel);
			kendo.bind(propertyInnerWrapper, that.propertyViewModel);
			that.propertyViewModel.bind("change", that._changePropertyViewModelEvt.bind(that));
			that.unbind("property");
			that.bind("property", that._propertyEvt.bind(that));
		},
		_changePropertyViewModelEvt : function(e){
			var that = this;
			//var field = e.field;
			//if(field && field.indexOf("properties") != -1) that.validateForSaveBtn();
		},
		_propertyEvt : function(e){
			//console.log(e);
			var that = this;
			var eventType = e.type, event = e.event, category = e.category, field = e.field,
				propertyViewModel = that.propertyViewModel.properties, categoryVm = propertyViewModel[category],
				fieldVm = categoryVm.items[field], sender = e.sender, value, element, bindingData = that._bindingData;

			var HmiCommon = window.HmiCommon;
			var data, i, max;

			if(field == "textLocation"){
				if(eventType == "change"){
					if(sender){
						value = fieldVm.value;
						var svgTextOnField = propertyViewModel.text.items.svgTextOn;
						var svgTextOffField = propertyViewModel.text.items.svgTextOff;
						var hasText = (value != "empty");
						svgTextOffField.set("visible", hasText);
						svgTextOnField.set("visible", hasText);
						var fontCategory = propertyViewModel.font;
						fontCategory.set("visible", hasText);
					}
				}
			}else if(field == "graphicColorOn" || field == "graphicColorOff"){
				//색상 (ON), (OFF)에 대하여 같은 컬러를 선택 가능하도록 변경. 2019/11/13
				/*if(eventType == "select"){
					if(event.dataItem.disabled) event.preventDefault();
				}else if(eventType == "open"){
					var graphicColorOff = propertyViewModel.color.items.graphicColorOff;
					var graphicColorOn = propertyViewModel.color.items.graphicColorOn;
					var offVal = graphicColorOff.value;
					var onVal = graphicColorOn.value;
					if(field == "graphicColorOn"){	//On DropDown을 열 때 Off의 값과 비교
						value = offVal;
						data = graphicColorOn.dataSource;
					}else{	//Off DropDown을 열 때 On의 값과 비교
						value = onVal;
						data = graphicColorOff.dataSource;
					}
					max = data.length;
					for( i = 0; i < max; i++ ){
						data[i].set("disabled", data[i].value == value);
					}
				}*/
			}else if(field == "fontSize" || field == "x" || field == "y" || field == "width" ||
				field == "height" || field == "minValue" || field == "maxValue" || field == "count" || field == "optionValues"){
				if(eventType == "validate"){
					sender = event.sender;
					element = sender.element;
					var formatElement = element.find(".k-formatted-value");
					//Spinner에 invalid css 적용
					if(!event.valid){
						formatElement.removeClass("k-valid");
						formatElement.addClass("k-invalid");
					}else{
						formatElement.removeClass("k-invalid");
						formatElement.addClass("k-valid");
					}
				}else if(eventType == "change"){	//Spinner
					sender = event.sender;
					element = sender.element;
					var validatorEl = element.closest("[data-role='commonvalidator']");
					var validator = validatorEl.data("kendoCommonValidator");
					var isValid = validator.validate();
					if(isValid){
						if(field == "optionValues"){
							var optionValueItemEl = element.closest(".hmi-binding-option-value-item");
							var index = optionValueItemEl.index();
							var valueEl = element.closest("p.hmi-binding-option-value-item-value");
							var fieldName;
							if(valueEl.length > 0) fieldName = "value";
							else fieldName = "text";
							var optionValues = fieldVm.value, optionValue = optionValues[index];
							if(optionValue) optionValue.set(fieldName, sender.value());
						}else{
							fieldVm.set("value", sender.value());
						}
					}
				}

				if(field == "width" || field == "height" || field == "x" || field == "y"){
					var propertiesEl = that.propertyInnerWrapper;
					var widthEl = propertiesEl.find("li.property[data-key='width'][data-category='size']");
					var heightEl = propertiesEl.find("li.property[data-key='height'][data-category='size']");
					var xEl = propertiesEl.find("li.property[data-key='x'][data-category='location']");
					var yEl = propertiesEl.find("li.property[data-key='y'][data-category='location']");
					var validatorSelector = ".value [data-role='commonvalidator']";
					var spinnerSelector = ".value [data-role='numerictextbox']";
					var widthValidator = widthEl.find(validatorSelector).data("kendoCommonValidator");
					var heightValidator = heightEl.find(validatorSelector).data("kendoCommonValidator");
					var widthSpinner = widthEl.find(spinnerSelector).data("kendoNumericTextBox");
					var heightSpinner = heightEl.find(spinnerSelector).data("kendoNumericTextBox");
					var xValidator = xEl.find(validatorSelector).data("kendoCommonValidator");
					var yValidator = yEl.find(validatorSelector).data("kendoCommonValidator");
					var xSpinner = xEl.find(spinnerSelector).data("kendoNumericTextBox");
					var ySpinner = yEl.find(spinnerSelector).data("kendoNumericTextBox");
					var maxWidth, maxHeight, maxX, maxY;
					value = fieldVm.get("value");
					sender = event.sender;
					element = sender.element;

					if(field == "width"){
						if(bindingData.type == "Line"){
							if(value < HmiCommon.GRAPHIC_MIN_WIDTH){
								//height의 최소 값이 10이된다.
								heightValidator.setOptions({ min : HmiCommon.GRAPHIC_MIN_HEIGHT });
								heightSpinner.min(HmiCommon.GRAPHIC_MIN_HEIGHT);
							}else{
								//height의 최소 값이 0이된다.
								heightValidator.setOptions({ min : 0 });
								heightSpinner.min(0);
							}
						}
						//너비(Width) 변경에 따라 X좌표의 최대 값이 변경된다.
						maxX = HmiCommon.DEFAULT_CANVAS_WIDTH - value;
						//x, y 속성이 존재하지 않는 요소에 대한 예외 처리
						if(xSpinner) xSpinner.max(maxX);
						if(xValidator){
							xValidator.setOptions({ max : maxX });
							xValidator.validate(null, null, true);
						}
					}else if(field == "height"){
						if(bindingData.type == "Line"){
							if(value < HmiCommon.GRAPHIC_MIN_HEIGHT){
								//width의 최소 값이 10이된다.
								widthValidator.setOptions({ min : HmiCommon.GRAPHIC_MIN_HEIGHT });
								widthSpinner.min(HmiCommon.GRAPHIC_MIN_HEIGHT);
							}else{
								//width의 최소 값이 0이된다.
								widthValidator.setOptions({ min : 0 });
								widthSpinner.min(0);
							}
						}
						//높이(Height) 변경에 따라 Y좌표의 최대 값이 변경된다.
						maxY = HmiCommon.DEFAULT_CANVAS_HEIGHT - value;
						//x, y 속성이 존재하지 않는 요소에 대한 예외 처리
						if(ySpinner) ySpinner.max(maxY);
						if(yValidator){
							yValidator.setOptions({ max : maxY });
							yValidator.validate(null, null, true);
						}
					}else if(field == "x"){
						//X 좌표 변경에 따라 최대 너비(Width) 값이 변경된다.
						maxWidth = HmiCommon.DEFAULT_CANVAS_WIDTH - value;
						//width, height 속성이 존재하지 않는 요소도 있기 때문에 예외 처리
						if(widthSpinner) widthSpinner.max(maxWidth);
						if(widthValidator){
							widthValidator.setOptions({ max : maxWidth });
							widthValidator.validate(null, null, true);
						}
					}else if(field == "y"){
						//Y 좌표 변경에 따라 최대 높이(Width) 값이 변경된다.
						maxHeight = HmiCommon.DEFAULT_CANVAS_HEIGHT - value;
						//width, height 속성이 존재하지 않는 요소도 있기 때문에 예외 처리
						if(heightSpinner) heightSpinner.max(maxHeight);
						if(heightValidator){
							heightValidator.setOptions({ max : maxHeight });
							heightValidator.validate(null, null, true);
						}
					}
				}
			}else if(selectedModelProperty.indexOf(field) != -1){
				if(eventType == "change"){
					sender = event.sender;
					var item = sender.dataItem();
					var ds = sender.dataSource;
					data = ds.data();
					max = data.length;
					for( i = 0; i < max; i++ ){
						if(data[i] === item) data[i].set("selected", true);
						else data[i].set("selected", false);
					}
				}
			}else if(field == "file"){
				if(eventType == "click"){
					var hmiPopupConfig = window.HmiPopupConfig;
					var hyperLinkPopup = hmiPopupConfig.hyperLinkPopup;
					value = fieldVm.value;
					if(!that._onSaveHyperLinkEvt) that._onSaveHyperLinkEvt = that._onSaveHyperLink.bind(that);
					hyperLinkPopup.unbind("onSaved", that._onSaveHyperLinkEvt);
					hyperLinkPopup.bind("onSaved", that._onSaveHyperLinkEvt);
					hyperLinkPopup.setDataSource(value);
					hyperLinkPopup.open();
				}
			}

			if(eventType == "change") that.validateForSaveBtn();
		},
		_onSaveHyperLink : function(e){
			var that = this, propertyViewModel = that.propertyViewModel, properties = propertyViewModel.properties,
				categoryVm = properties.hyperLink, fieldVm = categoryVm.items.file, value = fieldVm.value;
			var item = e.result;
			value.set("id", item.id);
			value.set("name", "");
			value.set("name", item.name + "");
			that.validateForSaveBtn();
		},
		setActiveCanvas : function(canvas){
			this._activeCanvas = canvas;
		}
	});

	kendo.ui.plugin(BindingTab);
})(window, jQuery);
//# sourceURL=hmi/widget/hmi-binding.js
