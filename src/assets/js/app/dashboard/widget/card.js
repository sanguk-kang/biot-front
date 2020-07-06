/*
	대시보드 Card
*/
(function(window, $){
	var FRONT_END_URL = "/front";
	var moment = window.moment;
	var kendo = window.kendo;
	var Util = window.Util;
	var cardTypeOptions = {
		network : {
			cards : [{
				width : 2,
				height : 2,
				refreshUrl : "/alarms?types=NetworkError",
				menuUrl : "/operation/alarm",
				template : "<div class='dashboard-body-content dashboard-network-error-2x2'><div class='dashboard-network-error-2x2-label'><p class='key' data-bind='text : key'></p></div><div class='dashboard-network-error-2x2-value'><p class='value' data-bind='text : value'></p></div></div>",
				viewModel : {
					key : "Network Error",
					value : 0
				},
				parseData : function(data){
					this.viewModel.set("value", data.length);
				}
			},
			{
				width : 4,
				height : 6,
				refreshUrl : "/alarms?types=NetworkError&sort=-eventTime",
				menuUrl : "/operation/alarm",
				template : "<div class='dashboard-body-content dashboard-network-error-4x6'><ul data-template='dashboard-network-ul-template' data-bind='source: list' class='dashboard-list'></ul><script id='dashboard-network-ul-template' type='text/x-kendo-template'><li class='dashboard-list-item'><div class='img cell'><span class='detail-img gray  #=deviceType#'/></div><div class='desc cell'><p class='desc-text' data-bind='text: description'></p><p class='desc-date' data-bind='text: eventTime'></p></div><div class='location cell'><p class='location-floor'><span data-bind='text: building'></span>, <span data-bind='text: floor'></span></p><p class='location-zone'><span data-bind='text: zone'></span></p></div></li></script>",
				otherTemplates : [
					""
				],
				viewModel : {
					list : []
				},
				parseData : function(data){
					var sliceArr = data.slice(0, 5);
					var i, max = sliceArr.length;
					var time, location, split;
					for( i = 0; i < max; i++ ){
						time = sliceArr[i].eventTime;
						sliceArr[i].eventTime = moment(time).format("LLL").replace(/\./g, "/");
						location = sliceArr[i].location;
						if(location){
							split = location.split(", ");
							sliceArr[i].building = split[0];
							sliceArr[i].floor = split[1];
							sliceArr[i].zone = split[2];
						}
						sliceArr[i].deviceType = Util.getDisplayClassType(sliceArr[i].dms_devices_type);
					}
					this.viewModel.set("list", sliceArr);
				}
			}]
			//title : "Network Error"
		},
		facilityOperation : {
			cards : [
				{
					width : 2,
					height : 4,
					//refreshUrl : "/dms/devices?types=AirConditioner.*&attributes=representativeStatus&registrationStatuses=Registered",
					//menuUrl : "/device/allview",
					template : '<div class="dashboard-body-content dashboard-facility-operation-2x4"><div class="dashboard-facility-dropdownlist" data-bind="invisible : invisibleDropDown"><div class="dashboard-facility-dropdownlist-wrapper"><div class="dropdown-wrapper"><input data-role="dropdownlist" data-width="100%" data-animation="false" data-text-field="displayType" data-value-field="type" data-bind="source: dropDownDs, value : dropDownValue, events:{ select : dropDownSelect }, invisible: invisible, disabled : disabled"/></div><div class="button-wrapper"><button class="k-button" data-bind="disabled:btnDisabled, events:{click:btnClick}"><span data-bind="text: btnText">Apply</span></button></div></div></div><div class="dashboard-facility-operation-graph" data-bind="invisible: invisibleGraph"><div class="dashboard-facility-operation-info"><div class="wrapper"><div class="legend-wrapper" data-bind="visible:isHover"><span class="count" data-bind="text: hoverCount"></span><span class="percent">%<br></span><span class="category" data-bind="text: hoverCategory"></span></div><div class="icon-wrapper" data-bind="invisible:isHover"><span class="card-device-icon detail-img gray"></span></div></div></div><div class="dashboard-facility-operation-chart" data-role="chart" data-transitions="false" data-series-defaults="{type:\'donut\',holeSize:50}" data-chart-area="{ background : \'\\#f7f7f7\', }" data-series="[{field:\'value\',categoryField:\'type\',visibleInLegendField:\'visibleInLegend\',padding:0,overlay:{gradient:\'none\'}}]" data-bind="visible: isVisible, source: operationData, events:{ seriesHover: onSeriesHover }"></div><div class="dashboard-facility-operation-legend" data-bind="invisible:hideDefaultDevice"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=on#</p><p class="value" data-bind="text: on"></p></li><li class="legend"><span class="square off"></span><p class="key">#=off#</p><p class="value" data-bind="text: off"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=critical#</p><p class="value" data-bind="text: critical"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=warning#</p><p class="value" data-bind="text: warning"></p></li></ul></div>' +
					'<div class="dashboard-facility-operation-legend" data-bind="invisible:hideBeacon"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normalBeacon"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=disconnected#</p><p class="value" data-bind="text: disconnected"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=lowBattery#</p><p class="value" data-bind="text: lowBattery"></p></li></ul></div>' +
					//'<div class="dashboard-facility-operation-legend" data-bind="invisible:hideBeacon"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normalBeacon"></p></li><li class="legend"><span class="square disconnected"></span><p class="key">#=disconnected#</p><p class="value" data-bind="text: disconnected"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=wrongLocation#</p><p class="value" data-bind="text: wrongLocation"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=lowBattery#</p><p class="value" data-bind="text: lowBattery"></p></li></ul></div>'+
					'<div class="dashboard-facility-operation-legend" data-bind="invisible:hideNw"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normal"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=critical#</p><p class="value" data-bind="text: critical"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=warning#</p><p class="value" data-bind="text: warning"></p></li></ul></div>' +
					'</div></div>',
					localeTemplateData : {
						critical : "FACILITY_DEVICE_STATUS_CRITICAL",
						warning : "FACILITY_DEVICE_STATUS_WARNING",
						off : "FACILITY_DEVICE_STATUS_OFF",
						on : "FACILITY_DEVICE_STATUS_ON",
						normal : "FACILITY_DEVICE_STATUS_NORMAL",
						disconnected : "FACILITY_DEVICE_STATUS_CRITICAL",
						lowBattery : "FACILITY_DEVICE_STATUS_WARNING",
						wrongLocation : "FACILITY_DEVICE_STATUS_WRONG_LOCATION"
					},
					init : function(){
						var self = this;
						var I18N = window.I18N;
						var typeListArr = [
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"),
								type : "AirConditioner"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"),
								type : "Light"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_TEMP_AND_HUMIDITY_SENSOR_SENSOR"),
								type : "Sensor.Temperature_Humidity"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_MOTION_SENSOR"),
								type : "Sensor.Motion"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"),
								type : "Meter"
							},
							//N/W 사 기기
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"),
								type : "Gateway"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"),
								type : "Beacon"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"),
								type : "CCTV"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_SMART_PLUG"),
								type : "SmartPlug"
							}
						];
						this.viewModel.set("dropDownDs", typeListArr);

						this.viewModel.set("btnText", I18N.prop("COMMON_BTN_APPLY"));
						this.getInstalledType();
						var dropDownDs = this.viewModel.get("dropDownDs");
						if(dropDownDs.length > 0){
							this.viewModel.set("dropDownText", dropDownDs[0].displayType);
						}
						var widget = this.widget;
						var element = widget.element;
						var message = element.attr("data-message");
						var i, j, max;
						if(message){
							var split = message.split("/");
							max = split.length;
							var value;
							for( i = 0; i < max; i++ ){
								//if(split[i] == "displayType"){
								//    this.viewModel.set("dropDownText", split[i+1]);
								//}else
								if(split[i] == "type"){
									value = split[i + 1];
									this.viewModel.set("dropDownValue", value);
								}
							}
							max = typeListArr.length;
							for( i = 0; i < max; i++ ){
								if(typeListArr[i].type == value){
									this.viewModel.set("dropDownText", typeListArr[i].displayType);
								}
							}
							this.viewModel.btnClick();
						}
						var installedType = Util.getInstalledTypeList();
						if(!installedType || installedType.length < 1){
							this.viewModel.set("disabled", true);
							this.viewModel.set("btnDisabled", true);
						}

						require(["dashboard/dashboard"], function(mainModule){
							var disableList = mainModule.getDisableTypeList();
							var ds = self.viewModel.get("dropDownDs");
							var disableType, item;
							var length = ds.length;
							max = disableList.length;
							for( i = 0; i < max; i++){
								disableType = disableList[i];
								if(disableType.indexOf("AirConditioner.") != -1){
									disableType = "AirConditioner";
								}
								length = ds.length;
								for( j = length - 1; j >= 0; j-- ){
									item = ds[j];
									if(item.type == disableType){
										ds.splice(j, 1);
									}
								}
							}
							if(ds.length > 0){
								self.viewModel.set("dropDownDs", ds);
								self.viewModel.set("dropDownValue", ds[0].type);
							}else{
								self.viewModel.set("disabled", true);
								self.viewModel.set("btnDisabled", true);
							}
						});
					},
					getInstalledType : function(){
						var type, list = this.viewModel.dropDownDs;
						var i, max = list.length;
						for( i = max - 1; i >= 0; i-- ){
							type = list[i];
							type = type.type;
							if(!Util.isInstalledType(type)){
								list.splice(i, 1);
							}
						}
						this.viewModel.set("dropDownDs", list);
					},
					templateData : {
						seriesDefaults : '{type:"donut"}',
						series : ""
					},
					viewModel : {
						isHover : false,
						hoverCount : 0,
						hoverCategory : "On",
						hideDefaultDevice : false,
						hideNw : true,
						hideBeacon : true,
						dropDownDs : [],
						dropDownSelect : function(e){
							var item = e.dataItem;
							var text = item.displayType;
							this.set("dropDownText", text);
						},
						disabled : false,
						btnDisabled : false,
						dropDownText : "SAC Indoor",
						dropDownValue : "AirConditioner",
						btnText : "Apply",
						btnClick : function(){
							var value = this.dropDownValue;
							var text = this.dropDownText;
							var url = "/dms/devices/statisticView/" + value + "?foundation_space_buildings_id=0";
							var options = this.thisOptions;
							options.setRefreshUrl(url);
							options.widget.titleElem.text(text);

							var self = this;
							this.set("invisibleDropDown", true);
							this.set("invisibleGraph", false);
							var message = "/displayType/" + text + "/type/" + value + "/";
							options.widget.element.attr("data-message", message);

							options.widget.refresh().done(function(){
								if(self.get("on") || self.get("off") || self.get("critical") || self.get("warning")
								  || self.get("normal") || self.get("normalBeacon") || self.get("disconnected")
								  || self.get("lowBattery") || self.get("wrongLocation")){
									var cssClass = Util.getDisplayClassType(value);
									options.widget.element.find(".card-device-icon").addClass(cssClass);
								}
							});
							options.widget.trigger("onPin");
							options.widget.element.on("mouseleave", ".k-chart", function(){
								var isHover = self.get("isHover");
								if(isHover){
									self.set("isHover", false);
								}
							});
						},
						invisibleDropDown : false,
						invisibleGraph : true,
						isVisible: true,
						on : 0,
						off : 0,
						critical : 0,
						warning : 0,
						normal : 0,
						normalBeacon : 0,
						disconnected : 0,
						wrongLocation : 0,
						lowBattery : 0,
						operationData : new kendo.data.DataSource({
							data : []
						}),
						onSeriesHover: function(e){ // YH-HOVER
							this.set("isHover", true);
							var percent = e.percentage;
							percent = Math.round((percent * 100));
							var category = e.category;

							category = category.toUpperCase();
							category = category.replace(" ", "_");

							if(category == "DISCONNECTED"){
								   category = "CRITICAL";
							}else if(category == "LOW_BATTERY"){
								category = "WARNING";
							}

							var I18N = window.I18N;
							category = I18N.prop("FACILITY_DEVICE_STATUS_" + category);

							this.set("hoverCount", percent);
							this.set("hoverCategory", category);
						}
					},
					setRefreshUrl : function(url){
						this.refreshUrl = url;
					},
					setDataSource : function(isBeacon, isNw){
						var onNum = this.viewModel.get("on") + "";
						onNum = onNum.replace("+", "");
						var offNum = this.viewModel.get("off") + "";
						offNum = offNum.replace("+", "");
						var criticalNum = this.viewModel.get("critical") + "";
						criticalNum = criticalNum.replace("+", "");
						var warningNum = this.viewModel.get("warning") + "";
						warningNum = warningNum.replace("+", "");
						onNum = Number(onNum);
						offNum = Number(offNum);
						criticalNum = Number(criticalNum);
						warningNum = Number(warningNum);
						var data = [
							{
								type  : "on",
								value : onNum,
								visibleInLegend : false,
								color : "#1aa05a"
							},
							{
								type  : "off",
								value : offNum,
								visibleInLegend : false,
								color : "#454545"
							},
							{
								type  : "critical",
								value : criticalNum,
								visibleInLegend : false,
								color : "#ef2b2b"
							},
							{
								type  : "warning",
								value : warningNum,
								visibleInLegend : false,
								color : "#ffa41f"
							}
						];

						isBeacon = false;
						isNw = false;
						if(this.refreshUrl.indexOf("Beacon") != -1){
							isBeacon = true;
							this.viewModel.set("hideDefaultDevice", true);
							this.viewModel.set("hideNw", true);
							this.viewModel.set("hideBeacon", false);
						}

						if(this.refreshUrl.indexOf("Gateway") != -1
						   || this.refreshUrl.indexOf("CCTV") != -1 || this.refreshUrl.indexOf("Meter") != -1
						   || this.refreshUrl.indexOf("Sensor") != -1 /*|| this.refreshUrl.indexOf("SmartPlug") != -1*/){
							isNw = true;
							this.viewModel.set("hideDefaultDevice", true);
							this.viewModel.set("hideBeacon", true);
							this.viewModel.set("hideNw", false);
						}
						var val;
						if(isBeacon){
							data[0].type = "normal";
							val = this.viewModel.get("normalBeacon") + "";
							val = val.replace("+", "");
							data[0].value = Number(val);
							data[1].type = "disconnected";
							val = this.viewModel.get("disconnected") + "";
							val = val.replace("+", "");
							data[1].value = Number(val);
							data[1].color = "#ef2b2b";
							/* data[2].type = "wrong location";
							val = this.viewModel.get("wrongLocation")+"";
							val = val.replace("+", "");
							data[2].value = Number(val); */
							data[3].type = "low battery";
							val =  this.viewModel.get("lowBattery") + "";
							val = val.replace("+", "");
							data[3].value = Number(val);
							data[3].color = "#ffa41f";

						}else if(isNw){
							//off 삭제
							data[0].type = "normal";
							val = this.viewModel.get("normal") + "";
							val = val.replace("+", "");
							data[0].value = Number(val);
							data.splice(1, 1);
						}

						data = new kendo.data.DataSource({
							data : data
						});
						this.viewModel.set("operationData", data);
					},
					parseData : function(data){
						data = data[0];

						var normal = typeof data.numberOfNormalDevices !== "undefined" ? data.numberOfNormalDevices : 0;
						this.viewModel.set("normal", normal);

						var on = typeof data.numberOfOnDevices !== "undefined" ? data.numberOfOnDevices : 0;
						/*if(on > 999){
							on = "999+";
						}*/
						this.viewModel.set("on", on);

						var off = typeof data.numberOfOffDevices !== "undefined" ? data.numberOfOffDevices : 0;
						/*if(off > 999){
							off = "999+";
						}*/
						this.viewModel.set("off", off);

						var critical = typeof data.numberOfCriticalDevices !== "undefined" ? data.numberOfCriticalDevices : 0;
						/*if(critical > 999){
							critical = "999+";
						}*/
						this.viewModel.set("critical", critical);

						var warning = typeof data.numberOfWarningDevices !== "undefined" ? data.numberOfWarningDevices : 0;
						/*if(warning > 999){
							warning = "999+";
						}*/
						this.viewModel.set("warning", warning);

						var fixedBeacon = typeof data.numberOfFixedNormalDevices !== "undefined" ? data.numberOfFixedNormalDevices : 0;
						var movableBeacon = typeof data.numberOfMovableNormalDevices !== "undefined" ? data.numberOfMovableNormalDevices : 0;
						// var fixedBeacon = data.numberOfFixedDevices !== undefined ? data.numberOfFixedDevices : 0;
						// var movableBeacon = data.numberOfMovableDevices !== undefined ? data.numberOfMovableDevices : 0;
						var normalBeacon = fixedBeacon + movableBeacon;
						/*if(normalBeacon > 999){
							normalBeacon = "999+";
						}*/
						this.viewModel.set("normalBeacon", normalBeacon);

						var fixedDisconnected = typeof data.numberOfFixedCriticalDevices !== "undefined" ? data.numberOfFixedCriticalDevices : 0;
						var movableDisconnected = typeof data.numberOfMovableCriticalDevices !== "undefined" ? data.numberOfMovableCriticalDevices : 0;
						var disconnected = fixedDisconnected + movableDisconnected;
						/*if(disconnected > 999){
							disconnected = "999+";
						}*/
						this.viewModel.set("disconnected", disconnected);

						var fixedWrongLocation = typeof data.numberOfFixedOutOfBoundsDevices !== "undefined" ? data.numberOfFixedOutOfBoundsDevices : 0;
						var movableWrongLocation = typeof data.numberOfMovableOutOfBoundsDevices !== "undefined" ? data.numberOfMovableOutOfBoundsDevices : 0;
						var wrongLocation = fixedWrongLocation + movableWrongLocation;
						/*if(wrongLocation > 999){
							wrongLocation = "999+";
						}*/
						this.viewModel.set("wrongLocation", wrongLocation);

						var fixedLowBattery = typeof data.numberOfFixedWarningDevices !== "undefined" ? data.numberOfFixedWarningDevices : 0;
						var movableLowBatery = typeof data.numberOfMovableWarningDevices !== "undefined" ? data.numberOfMovableWarningDevices : 0;
						var lowBattery = fixedLowBattery + movableLowBatery;
						/*if(lowBattery > 999){
							lowBattery = "999+";
						}*/
						this.viewModel.set("lowBattery", lowBattery);

						this.setDataSource();
					}
				},
				{
					width : 4,
					height : 4,
					//refreshUrl : "/dms/devices?types=AirConditioner.*&attributes=representativeStatus&registrationStatuses=Registered",
					//menuUrl : "/device/allview",
					template : '<div class="dashboard-body-content dashboard-facility-operation-4x4"><div class="dashboard-facility-dropdownlist" data-bind="invisible : invisibleDropDown"><div class="dashboard-facility-dropdownlist-wrapper"><div class="dropdown-wrapper"><input data-role="dropdownlist" data-width="100%" data-animation="false" data-text-field="displayType" data-value-field="type" data-bind="source: dropDownDs, value : dropDownValue, events:{ select : dropDownSelect }, invisible: invisible, disabled : disabled"/></div><div class="button-wrapper"><button class="k-button" data-bind="disabled:disabled, events:{click:btnClick}"><span data-bind="text: btnText">Apply</span></button></div></div></div><div class="dashboard-facility-operation-graph" data-bind="invisible: invisibleGraph"><div class="dashboard-facility-operation-info"><div class="wrapper"><div class="legend-wrapper" data-bind="visible:isHover"><span class="count" data-bind="text: hoverCount"></span><span class="percent">%<br></span><span class="category" data-bind="text: hoverCategory"></span></div><div class="icon-wrapper" data-bind="invisible:isHover"><span class="card-device-icon detail-img gray"></span></div></div></div><div class="dashboard-facility-operation-chart" data-role="chart" data-transitions="false" data-series-defaults="{type:\'donut\',holeSize:78}" data-chart-area="{ background : \'\\#f7f7f7\', }" data-series="[{field:\'value\',categoryField:\'type\',visibleInLegendField:\'visibleInLegend\',padding:35,overlay:{gradient:\'none\'}}]" data-bind="visible: isVisible, source: operationData, events:{seriesHover : onSeriesHover}"></div><div class="dashboard-facility-operation-legend" data-bind="invisible:hideDefaultDevice"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=on#</p><p class="value" data-bind="text: on"></p></li><li class="legend"><span class="square off"></span><p class="key">#=off#</p><p class="value" data-bind="text: off"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=critical#</p><p class="value" data-bind="text: critical"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=warning#</p><p class="value" data-bind="text: warning"></p></li></ul></div>' +
					//'<div class="dashboard-facility-operation-legend" data-bind="invisible:hideBeacon"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normalBeacon"></p></li><li class="legend"><span class="square disconnected"></span><p class="key">#=disconnected#</p><p class="value" data-bind="text: disconnected"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=wrongLocation#</p><p class="value" data-bind="text: wrongLocation"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=lowBattery#</p><p class="value" data-bind="text: lowBattery"></p></li></ul></div>'+
					'<div class="dashboard-facility-operation-legend" data-bind="invisible:hideBeacon"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normalBeacon"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=disconnected#</p><p class="value" data-bind="text: disconnected"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=lowBattery#</p><p class="value" data-bind="text: lowBattery"></p></li></ul></div>' +
					'<div class="dashboard-facility-operation-legend" data-bind="invisible:hideNw"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normal"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=critical#</p><p class="value" data-bind="text: critical"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=warning#</p><p class="value" data-bind="text: warning"></p></li></ul></div>' +
					'</div></div>',
					localeTemplateData : {
						critical : "FACILITY_DEVICE_STATUS_CRITICAL",
						warning : "FACILITY_DEVICE_STATUS_WARNING",
						off : "FACILITY_DEVICE_STATUS_OFF",
						on : "FACILITY_DEVICE_STATUS_ON",
						normal : "FACILITY_DEVICE_STATUS_NORMAL",
						disconnected : "FACILITY_DEVICE_STATUS_CRITICAL",
						lowBattery : "FACILITY_DEVICE_STATUS_WARNING",
						wrongLocation : "FACILITY_DEVICE_STATUS_WRONG_LOCATION"
					},
					init : function(){
						var self = this;
						var I18N = window.I18N;
						var typeListArr = [
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"),
								type : "AirConditioner"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_LIGHT"),
								type : "Light"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_TEMP_AND_HUMIDITY_SENSOR_SENSOR"),
								type : "Sensor.Temperature_Humidity"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_MOTION_SENSOR"),
								type : "Sensor.Motion"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"),
								type : "Meter"
							},
							//N/W 사 기기
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"),
								type : "Gateway"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"),
								type : "Beacon"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_CCTV"),
								type : "CCTV"
							},
							{
								displayType : I18N.prop("FACILITY_DEVICE_TYPE_SMART_PLUG"),
								type : "SmartPlug"
							}
						];
						this.viewModel.set("dropDownDs", typeListArr);
						this.viewModel.set("btnText", I18N.prop("COMMON_BTN_APPLY"));
						this.getInstalledType();
						var dropDownDs = this.viewModel.get("dropDownDs");
						if(dropDownDs.length > 0){
							this.viewModel.set("dropDownText", dropDownDs[0].displayType);
						}

						var widget = this.widget;
						var element = widget.element;
						var message = element.attr("data-message");
						var i, j, max;
						if(message){
							var split = message.split("/");
							max = split.length;
							var value;
							for( i = 0; i < max; i++ ){
								//if(split[i] == "displayType"){
								//    this.viewModel.set("dropDownText", split[i+1]);
								//}else
								if(split[i] == "type"){
									value = split[i + 1];
									this.viewModel.set("dropDownValue", value);
								}
							}
							max = typeListArr.length;
							for( i = 0; i < max; i++ ){
								if(typeListArr[i].type == value){
									this.viewModel.set("dropDownText", typeListArr[i].displayType);
								}
							}
							this.viewModel.btnClick();
						}
						var installedType = Util.getInstalledTypeList();
						if(!installedType || installedType.length < 1){
							this.viewModel.set("disabled", true);
							this.viewModel.set("btnDisabled", true);
						}

						require(["dashboard/dashboard"], function(mainModule){
							var disableList = mainModule.getDisableTypeList();
							var ds = self.viewModel.get("dropDownDs");
							var disableType, item;
							var length = ds.length;
							max = disableList.length;
							for( i = 0; i < max; i++){
								disableType = disableList[i];
								if(disableType.indexOf("AirConditioner.") != -1){
									disableType = "AirConditioner";
								}
								length = ds.length;
								for( j = length - 1; j >= 0; j-- ){
									item = ds[j];
									if(item.type == disableType){
										ds.splice(j, 1);
									}
								}
							}
							if(ds.length > 0){
								self.viewModel.set("dropDownDs", ds);
								self.viewModel.set("dropDownValue", ds[0].type);
							}else{
								self.viewModel.set("disabled", true);
								self.viewModel.set("btnDisabled", true);
							}
						});
					},
					getInstalledType : function(){
						var type, list = this.viewModel.dropDownDs;
						var i, max = list.length;
						for( i = max - 1; i >= 0; i-- ){
							type = list[i];
							type = type.type;
							if(!Util.isInstalledType(type)){
								list.splice(i, 1);
							}
						}
						this.viewModel.set("dropDownDs", list);
					},
					templateData : {
						seriesDefaults : '{type:"donut"}',
						series : ""
					},
					viewModel : {
						isHover : false,
						hoverCount : 0,
						hoverCategory : "On",
						hideDefaultDevice : false,
						hideNw : true,
						hideBeacon : true,
						dropDownDs : [
							{
								displayType : "SAC Indoor",
								type : "AirConditioner"
							},
							{
								displayType : "SAC Outdoor",
								type : "AirConditionerOutdoor"
							},
							{
								displayType : "Point",
								type : "ControlPoint"
							},
							{
								displayType : "Temp. & Humi. Sensor",
								type : "Sensor.Temperature_Humidity"
							},
							{
								displayType : "Motion Sensor",
								type : "Sensor.Motion"
							},
							{
								displayType : "Light",
								type : "Light"
							},
							{
								displayType : "Energy Meter",
								type : "Meter"
							}
						],
						dropDownSelect : function(e){
							var item = e.dataItem;
							var text = item.displayType;
							this.set("dropDownText", text);
						},
						dropDownText : "SAC Indoor",
						dropDownValue : "AirConditioner",
						disabled : false,
						btnDisabled : false,
						btnText : "Apply",
						btnClick : function(){
							var value = this.dropDownValue;
							var text = this.dropDownText;
							var url = "/dms/devices/statisticView/" + value + "?foundation_space_buildings_id=0";
							var options = this.thisOptions;
							options.setRefreshUrl(url);
							options.widget.titleElem.text(text);

							var self = this;
							this.set("invisibleDropDown", true);
							this.set("invisibleGraph", false);
							var message = "/displayType/" + text + "/type/" + value + "/";
							options.widget.element.attr("data-message", message);

							options.widget.refresh().done(function(){
								if(self.get("on") || self.get("off") || self.get("critical") || self.get("warning")
								  || self.get("normal") || self.get("normalBeacon") || self.get("disconnected")
								  || self.get("lowBattery") || self.get("wrongLocation")){
									var cssClass = Util.getDisplayClassType(value);
									options.widget.element.find(".card-device-icon").addClass(cssClass);
								}
							});
							options.widget.trigger("onPin");
							options.widget.element.on("mouseleave", ".k-chart", function(){
								var isHover = self.get("isHover");
								if(isHover){
									self.set("isHover", false);
								}
							});
						},
						onSeriesHover : function(e){
							this.set("isHover", true);
							var percent = e.percentage;
							percent = Math.round((percent * 100));
							var category = e.category;
							category = category.toUpperCase();
							category = category.replace(" ", "_");
							if(category == "DISCONNECTED"){
								category = "CRITICAL";
							}else if(category == "LOW_BATTERY"){
								category = "WARNING";
							}
							var I18N = window.I18N;
							category = I18N.prop("FACILITY_DEVICE_STATUS_" + category);
							this.set("hoverCount", percent);
							this.set("hoverCategory", category);
						},
						invisibleDropDown : false,
						invisibleGraph : true,
						isVisible: true,
						on : 0,
						off : 0,
						critical : 0,
						warning : 0,
						normal : 0,
						normalBeacon : 0,
						disconnected : 0,
						wrongLocation : 0,
						lowBattery : 0,
						operationData : new kendo.data.DataSource({
							data : []
						})
					},
					setRefreshUrl : function(url){
						this.refreshUrl = url;
					},
					setDataSource : function(isBeacon, isNw){
						var onNum = this.viewModel.get("on") + "";
						onNum = onNum.replace("+", "");
						var offNum = this.viewModel.get("off") + "";
						offNum = offNum.replace("+", "");
						var criticalNum = this.viewModel.get("critical") + "";
						criticalNum = criticalNum.replace("+", "");
						var warningNum = this.viewModel.get("warning") + "";
						warningNum = warningNum.replace("+", "");
						onNum = Number(onNum);
						offNum = Number(offNum);
						criticalNum = Number(criticalNum);
						warningNum = Number(warningNum);
						var data = [
							{
								type  : "on",
								value : onNum,
								visibleInLegend : false,
								color : "#1aa05a"
							},
							{
								type  : "off",
								value : offNum,
								visibleInLegend : false,
								color : "#454545"
							},
							{
								type  : "critical",
								value : criticalNum,
								visibleInLegend : false,
								color : "#ef2b2b"
							},
							{
								type  : "warning",
								value : warningNum,
								visibleInLegend : false,
								color : "#ffa41f"
							}
						];

						isBeacon = false;
						isNw = false;
						if(this.refreshUrl.indexOf("Beacon") != -1){
							isBeacon = true;
							this.viewModel.set("hideDefaultDevice", true);
							this.viewModel.set("hideNw", true);
							this.viewModel.set("hideBeacon", false);
						}

						if(this.refreshUrl.indexOf("Gateway") != -1
						   || this.refreshUrl.indexOf("CCTV") != -1 || this.refreshUrl.indexOf("Meter") != -1
						   || this.refreshUrl.indexOf("Sensor") != -1 /*|| this.refreshUrl.indexOf("SmartPlug") != -1*/){
							isNw = true;
							this.viewModel.set("hideDefaultDevice", true);
							this.viewModel.set("hideBeacon", true);
							this.viewModel.set("hideNw", false);
						}
						var val;
						if(isBeacon){
							data[0].type = "normal";
							val = this.viewModel.get("normalBeacon") + "";
							val = val.replace("+", "");
							data[0].value = Number(val);
							data[1].type = "disconnected";
							val = this.viewModel.get("disconnected") + "";
							val = val.replace("+", "");
							data[1].value = Number(val);
							data[1].color = "#ef2b2b";
							/* data[2].type = "wrong location";
							val = this.viewModel.get("wrongLocation")+"";
							val = val.replace("+", "");
							data[2].value = Number(val);*/
							data[3].type = "low battery";
							val =  this.viewModel.get("lowBattery") + "";
							val = val.replace("+", "");
							data[3].value = Number(val);
							data[3].color = "#ffa41f";

						}else if(isNw){
							//off 삭제
							data[0].type = "normal";
							val = this.viewModel.get("normal") + "";
							val = val.replace("+", "");
							data[0].value = Number(val);
							data.splice(1, 1);
						}

						data = new kendo.data.DataSource({
							data : data
						});
						this.viewModel.set("operationData", data);
					},
					parseData : function(data){
						data = data[0];

						var normal = typeof data.numberOfNormalDevices !== "undefined" ? data.numberOfNormalDevices : 0;
						this.viewModel.set("normal", normal);

						var on = typeof data.numberOfOnDevices !== "undefined" ? data.numberOfOnDevices : 0;
						/*if(on > 999){
							on = "999+";
						}*/
						this.viewModel.set("on", on);

						var off = typeof data.numberOfOffDevices !== "undefined" ? data.numberOfOffDevices : 0;
						/*if(off > 999){
							off = "999+";
						}*/
						this.viewModel.set("off", off);

						var critical = typeof data.numberOfCriticalDevices !== "undefined" ? data.numberOfCriticalDevices : 0;
						/*if(critical > 999){
							critical = "999+";
						}*/
						this.viewModel.set("critical", critical);

						var warning = typeof data.numberOfWarningDevices !== "undefined" ? data.numberOfWarningDevices : 0;
						/*if(warning > 999){
							warning = "999+";
						}*/
						this.viewModel.set("warning", warning);

						var fixedBeacon = typeof data.numberOfFixedNormalDevices !== "undefined" ? data.numberOfFixedNormalDevices : 0;
						var movableBeacon = typeof data.numberOfMovableNormalDevices !== "undefined" ? data.numberOfMovableNormalDevices : 0;
						var normalBeacon = fixedBeacon + movableBeacon;
						/*if(normalBeacon > 999){
							normalBeacon = "999+";
						}*/
						this.viewModel.set("normalBeacon", normalBeacon);

						var fixedDisconnected = typeof data.numberOfFixedCriticalDevices !== "undefined" ? data.numberOfFixedCriticalDevices : 0;
						var movableDisconnected = typeof data.numberOfMovableCriticalDevices !== "undefined" ? data.numberOfMovableCriticalDevices : 0;
						var disconnected = fixedDisconnected + movableDisconnected;
						/*if(disconnected > 999){
							disconnected = "999+";
						}*/
						this.viewModel.set("disconnected", disconnected);

						var fixedWrongLocation = typeof data.numberOfFixedOutOfBoundsDevices !== "undefined" ? data.numberOfFixedOutOfBoundsDevices : 0;
						var movableWrongLocation = typeof data.numberOfMovableOutOfBoundsDevices !== "undefined" ? data.numberOfMovableOutOfBoundsDevices : 0;
						var wrongLocation = fixedWrongLocation + movableWrongLocation;
						/*if(wrongLocation > 999){
							wrongLocation = "999+";
						}*/
						this.viewModel.set("wrongLocation", wrongLocation);

						var fixedLowBattery = typeof data.numberOfFixedWarningDevices !== "undefined" ? data.numberOfFixedWarningDevices : 0;
						var movableLowBatery = typeof data.numberOfMovableWarningDevices !== "undefined" ? data.numberOfMovableWarningDevices : 0;
						var lowBattery = fixedLowBattery + movableLowBatery;
						/*if(lowBattery > 999){
							lowBattery = "999+";
						}*/
						this.viewModel.set("lowBattery", lowBattery);

						this.setDataSource();
					}
				}
			],
			title : "DASHBOARD_FACILITY_OPERATION"
		},
		assetFacilityOperation : {
			cards : [
				{
					width : 2,
					height : 4,
					//refreshUrl : "/assets/statisticView?foundation_space_buildings_id=0",
					//menuUrl : "/service/asset",
					template : '<div class="dashboard-body-content dashboard-facility-operation-2x4"><div class="dashboard-facility-dropdownlist" data-bind="invisible : invisibleDropDown"><div class="dashboard-facility-dropdownlist-wrapper"><div class="dropdown-wrapper"><input data-role="dropdownlist" data-width="100%" data-animation="false" data-text-field="name" data-value-field="id" data-bind="source: dropDownDs, value : dropDownValue, events:{ select : dropDownSelect }, invisible: invisible, disabled : disabled"/></div><div class="button-wrapper"><button class="k-button" data-bind="disabled:btnDisabled, events:{click:btnClick}"><span data-bind="text: btnText">Apply</span></button></div></div></div><div class="dashboard-facility-operation-graph" data-bind="invisible: invisibleGraph"><div class="dashboard-facility-operation-info"><div class="wrapper"><div class="legend-wrapper" data-bind="visible:isHover"><span class="count" data-bind="text: hoverCount"></span><span class="percent">%<br></span><span class="category" data-bind="text: hoverCategory"></span></div><div class="icon-wrapper" data-bind="invisible:isHover"><span class="card-device-icon detail-img gray"></span></div></div></div><div class="dashboard-facility-operation-chart" data-role="chart" data-transitions="false" data-series-defaults="{type:\'donut\',holeSize:50}" data-chart-area="{ background : \'\\#f7f7f7\', }" data-series="[{field:\'value\',categoryField:\'type\',visibleInLegendField:\'visibleInLegend\',padding:0,overlay:{gradient:\'none\'}}]" data-bind="visible: isVisible, source: operationData, events:{ seriesHover: onSeriesHover }"></div>' +
					//'<div class="dashboard-facility-operation-legend""><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normal"></p></li><li class="legend"><span class="square disconnected"></span><p class="key">#=disconnected#</p><p class="value" data-bind="text: disconnected"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=wrongLocation#</p><p class="value" data-bind="text: wrongLocation"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=lowBattery#</p><p class="value" data-bind="text: lowBattery"></p></li></ul></div>'+
					'<div class="dashboard-facility-operation-legend""><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normal"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=disconnected#</p><p class="value" data-bind="text: disconnected"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=lowBattery#</p><p class="value" data-bind="text: lowBattery"></p></li></ul></div>' +
					'</div></div>',
					localeTemplateData : {
						critical : "FACILITY_DEVICE_STATUS_CRITICAL",
						warning : "FACILITY_DEVICE_STATUS_WARNING",
						off : "FACILITY_DEVICE_STATUS_OFF",
						on : "FACILITY_DEVICE_STATUS_ON",
						normal : "FACILITY_DEVICE_STATUS_NORMAL",
						disconnected : "FACILITY_DEVICE_STATUS_CRITICAL",
						lowBattery : "FACILITY_DEVICE_STATUS_WARNING",
						wrongLocation : "FACILITY_DEVICE_STATUS_WRONG_LOCATION"
					},
					init : function(){
						var self = this;
						var I18N = window.I18N;
						var widget = this.widget;
						var element = widget.element;
						var message = element.attr("data-message");
						widget.loading.open(widget.element);
						this.viewModel.set("btnText", I18N.prop("COMMON_BTN_APPLY"));
						var assetList = [];
						$.ajax({
							url : "/assets"
						}).done(function(data){
							var asset, i, j, max = data.length;
							var obj;
							for( i = 0; i < max; i++ ){
								asset = data[i];
								obj = {};
								obj.id = asset.id;
								obj.name = asset.assets_types_name;
								if(asset.subAssetType){
									obj.name += (" / " + asset.subAssetType);
								}

								if (assetList.length > 0){
									var isDuplicate = false;
									for( j = 0; j < assetList.length; j++ ) {
										var obj_temp = assetList[j];
										if(obj_temp.name == obj.name){
											//console.log("[done] skip!");
											isDuplicate = true;
											break;
										}
									}
									if(isDuplicate == false) {
										//console.log("[done] add " + obj.name);
										assetList.push(obj);
									}
								} else {
									//console.log("[done] add " + obj.name);
									assetList.push(obj);
								}
							}
							if(assetList.length > 0){
								self.viewModel.set("dropDownDs", assetList);
								self.viewModel.set("dropDownValue", assetList[0].id);
								self.viewModel.set("dropDownText", assetList[0].name);
							}
						}).fail(function(){

						}).always(function(){
							widget.loading.close();
							if(message){
								var i, max;
								var split = message.split("/");
								max = split.length;
								var value;
								for( i = 0; i < max; i++ ){
									//if(split[i] == "displayType"){
									//    this.viewModel.set("dropDownText", split[i+1]);
									//}else
									if(split[i] == "assetId"){
										value = split[i + 1];
										self.viewModel.set("dropDownValue", value);
										break;
									}
								}
								max = assetList.length;
								for( i = 0; i < max; i++ ){
									if(assetList[i].id == value){
										self.viewModel.set("dropDownText", assetList[i].name);
										break;
									}
								}
								self.viewModel.btnClick();
							}

							if(!assetList || assetList.length < 1){
								self.viewModel.set("disabled", true);
								self.viewModel.set("btnDisabled", true);
							}
						});
					},
					templateData : {
						seriesDefaults : '{type:"donut"}',
						series : ""
					},
					viewModel : {
						isHover : false,
						hoverCount : 0,
						hoverCategory : "On",
						dropDownDs : [],
						dropDownSelect : function(e){
							var item = e.dataItem;
							var text = item.name;
							this.set("dropDownText", text);
						},
						disabled : false,
						btnDisabled : false,
						dropDownText : "",
						dropDownValue : "",
						btnText : "Apply",
						btnClick : function(){
							var value = this.dropDownValue;
							var text = this.dropDownText;
							var url = "/assets/statisticView?foundation_space_buildings_id=0";
							var options = this.thisOptions;
							options.setRefreshUrl(url);
							var I18N = window.I18N;
							options.widget.titleElem.text(I18N.prop("DASHBOARD_ASSETS") + " > " + text);

							var self = this;
							this.set("invisibleDropDown", true);
							this.set("invisibleGraph", false);
							var message = "/assetId/" + value + "/assetText/" + text + "/";
							options.widget.element.attr("data-message", message);

							options.widget.refresh().done(function(){

							});
							options.widget.trigger("onPin");
							options.widget.element.on("mouseleave", ".k-chart", function(){
								var isHover = self.get("isHover");
								if(isHover){
									self.set("isHover", false);
								}
							});
						},
						invisibleDropDown : false,
						invisibleGraph : true,
						isVisible: true,
						normal : 0,
						disconnected : 0,
						wrongLocation : 0,
						lowBattery : 0,
						operationData : new kendo.data.DataSource({
							data : []
						}),
						onSeriesHover: function(e){ // YH-HOVER
							this.set("isHover", true);
							var percent = e.percentage;
							percent = Math.round((percent * 100));
							var category = e.category;

							category = category.toUpperCase();
							category = category.replace(" ", "_");
							var I18N = window.I18N;
							if(category == "DISCONNECTED"){
								category = "CRITICAL";
							}else if(category == "LOW_BATTERY"){
								category = "WARNING";
							}
							category = I18N.prop("FACILITY_DEVICE_STATUS_" + category);

							this.set("hoverCount", percent);
							this.set("hoverCategory", category);
						}
					},
					setRefreshUrl : function(url){
						this.refreshUrl = url;
					},
					setDataSource : function(){
						var onNum = this.viewModel.get("normal") + "";
						onNum = onNum.replace("+", "");
						onNum = Number(onNum);
						var disconnectedNum = this.viewModel.get("disconnected") + "";
						disconnectedNum = disconnectedNum.replace("+", "");
						disconnectedNum = Number(disconnectedNum);
						var lowBatteryNum = this.viewModel.get("lowBattery") + "";
						lowBatteryNum = lowBatteryNum.replace("+", "");
						lowBatteryNum = Number(lowBatteryNum);
						var wrongLocationNum = this.viewModel.get("wrongLocation") + "";
						wrongLocationNum = wrongLocationNum.replace("+", "");
						wrongLocationNum = Number(wrongLocationNum);

						var data = [
							{
								type  : "on",
								value : onNum,
								visibleInLegend : false,
								color : "#1aa05a"
							},
							{
								type  : "disconnected",
								value : disconnectedNum,
								visibleInLegend : false,
								color : "#ef2b2b"
							},
							{
								type  : "wrong location",
								value : wrongLocationNum,
								visibleInLegend : false,
								color : "#ef2b2b"
							},
							{
								type  : "low battery",
								value : lowBatteryNum,
								visibleInLegend : false,
								color : "#ffa41f"
							}
						];

						data = new kendo.data.DataSource({
							data : data
						});
						this.viewModel.set("operationData", data);
					},
					parseData : function(data){
						data = data[0];
						var text = this.viewModel.get("dropDownText");
						var split = text.split(" / ");
						var curAssetType = split[0];
						var curSubAssetType = split[1];
						if(!curSubAssetType){
							curSubAssetType = void 0;
						}
						var numberOfNormal = 0, numberOfDisconnected = 0, numberOfLowBattery = 0,
							numberOfWrongLocation = 0;

						if(data){
							var assetType, subAssetType, subAssetTypes, assetTypes = data.assetTypes;
							var i, j, size, max = assetTypes.length;
							for( i = 0; i < max; i++ ){
								assetType = assetTypes[i];
								if(assetType.assets_types_name == curAssetType){
									subAssetTypes = assetType.subAssetTypes;
									size = subAssetTypes.length;
									for( j = 0; j < size; j++ ){
										subAssetType = subAssetTypes[j];
										if(subAssetType.assets_subAssetType == curSubAssetType){
											numberOfNormal = subAssetType.numberOfNormalDevices;
											numberOfDisconnected = subAssetType.numberOfCriticalDevices;
											numberOfLowBattery = subAssetType.numberOfWarningDevices;
											///numberOfWrongLocation = subAssetType.numberOfNormalDevices;
											//console.log(assetType);
											//console.log(curSubAssetType);
											//console.log("normal : "+numberOfNormal +" / disconnected : "+numberOfDisconnected +" /  low battery : "+numberOfLowBattery+" / wrong location : "+numberOfWrongLocation);
											break;
										}
									}
								}
							}
						}

						//if(numberOfNormal > 999) numberOfNormal = "999+";

						this.viewModel.set("normal", numberOfNormal);

						//if(numberOfDisconnected > 999) numberOfDisconnected = "999+";

						this.viewModel.set("disconnected", numberOfDisconnected);

						//if(numberOfWrongLocation > 999) numberOfWrongLocation = "999+";

						this.viewModel.set("wrongLocation", numberOfWrongLocation);

						//if(numberOfLowBattery > 999) numberOfLowBattery = "999+";

						this.viewModel.set("lowBattery", numberOfLowBattery);
						this.setDataSource();
					}
				},
				{
					width : 4,
					height : 4,
					//refreshUrl : "/dms/devices?types=AirConditioner.*&attributes=representativeStatus&registrationStatuses=Registered",
					//menuUrl : "/device/allview",
					template : '<div class="dashboard-body-content dashboard-facility-operation-4x4"><div class="dashboard-facility-dropdownlist" data-bind="invisible : invisibleDropDown"><div class="dashboard-facility-dropdownlist-wrapper"><div class="dropdown-wrapper"><input data-role="dropdownlist" data-width="100%" data-animation="false" data-text-field="name" data-value-field="id" data-bind="source: dropDownDs, value : dropDownValue, events:{ select : dropDownSelect }, invisible: invisible, disabled : disabled"/></div><div class="button-wrapper"><button class="k-button" data-bind="disabled:disabled, events:{click:btnClick}"><span data-bind="text: btnText">Apply</span></button></div></div></div><div class="dashboard-facility-operation-graph" data-bind="invisible: invisibleGraph"><div class="dashboard-facility-operation-info"><div class="wrapper"><div class="legend-wrapper" data-bind="visible:isHover"><span class="count" data-bind="text: hoverCount"></span><span class="percent">%<br></span><span class="category" data-bind="text: hoverCategory"></span></div><div class="icon-wrapper" data-bind="invisible:isHover"><span class="card-device-icon detail-img gray"></span></div></div></div><div class="dashboard-facility-operation-chart" data-role="chart" data-transitions="false" data-series-defaults="{type:\'donut\',holeSize:78}" data-chart-area="{ background : \'\\#f7f7f7\', }" data-series="[{field:\'value\',categoryField:\'type\',visibleInLegendField:\'visibleInLegend\',padding:35,overlay:{gradient:\'none\'}}]" data-bind="visible: isVisible, source: operationData, events:{seriesHover : onSeriesHover}"></div>' +
					//'<div class="dashboard-facility-operation-legend"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normal"></p></li><li class="legend"><span class="square disconnected"></span><p class="key">#=disconnected#</p><p class="value" data-bind="text: disconnected"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=wrongLocation#</p><p class="value" data-bind="text: wrongLocation"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=lowBattery#</p><p class="value" data-bind="text: lowBattery"></p></li></ul></div>'+
					'<div class="dashboard-facility-operation-legend"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square on"></span><p class="key">#=normal#</p><p class="value" data-bind="text: normal"></p></li><li class="legend"><span class="square critical"></span><p class="key">#=disconnected#</p><p class="value" data-bind="text: disconnected"></p></li><li class="legend"><span class="square warning"></span><p class="key">#=lowBattery#</p><p class="value" data-bind="text: lowBattery"></p></li></ul></div>' +
					'</div></div>',
					localeTemplateData : {
						critical : "FACILITY_DEVICE_STATUS_CRITICAL",
						warning : "FACILITY_DEVICE_STATUS_WARNING",
						off : "FACILITY_DEVICE_STATUS_OFF",
						on : "FACILITY_DEVICE_STATUS_ON",
						normal : "FACILITY_DEVICE_STATUS_NORMAL",
						disconnected : "FACILITY_DEVICE_STATUS_CRITICAL",
						lowBattery : "FACILITY_DEVICE_STATUS_WARNING",
						wrongLocation : "FACILITY_DEVICE_STATUS_WRONG_LOCATION"
					},
					init : function(){
						var self = this;
						var I18N = window.I18N;
						var widget = this.widget;
						var element = widget.element;
						var message = element.attr("data-message");
						widget.loading.open(widget.element);
						this.viewModel.set("btnText", I18N.prop("COMMON_BTN_APPLY"));
						var assetList = [];
						$.ajax({
							url : "/assets"
						}).done(function(data){
							var asset, i, j, max = data.length;
							var obj;
							for( i = 0; i < max; i++ ){
								asset = data[i];
								obj = {};
								obj.id = asset.id;
								obj.name = asset.assets_types_name;
								if(asset.subAssetType){
									obj.name += (" / " + asset.subAssetType);
								}
								//assetList.push(obj);

								if (assetList.length > 0){
									var isDuplicate = false;
									for( j = 0; j < assetList.length; j++ ) {
										var obj_temp = assetList[j];
										if(obj_temp.name == obj.name){
											//	console.log("[done] skip!");
											isDuplicate = true;
											break;
										}
									}
									if(isDuplicate == false) {
										//console.log("[done] add " + obj.name);
										assetList.push(obj);
									}
								} else {
									//	console.log("[done] add " + obj.name);
									assetList.push(obj);

								}
							}
							if(assetList.length > 0){
								self.viewModel.set("dropDownDs", assetList);
								self.viewModel.set("dropDownValue", assetList[0].id);
								self.viewModel.set("dropDownText", assetList[0].name);
							}
						}).fail(function(){

						}).always(function(){
							widget.loading.close();
							if(message){
								var i, max;
								var split = message.split("/");
								max = split.length;
								var value;
								for( i = 0; i < max; i++ ){
									//if(split[i] == "displayType"){
									//    this.viewModel.set("dropDownText", split[i+1]);
									//}else
									if(split[i] == "assetId"){
										value = split[i + 1];
										self.viewModel.set("dropDownValue", value);
										break;
									}
								}
								max = assetList.length;
								for( i = 0; i < max; i++ ){
									if(assetList[i].id == value){
										self.viewModel.set("dropDownText", assetList[i].name);
										break;
									}
								}
								self.viewModel.btnClick();
							}

							if(!assetList || assetList.length < 1){
								self.viewModel.set("disabled", true);
								self.viewModel.set("btnDisabled", true);
							}
						});
					},
					templateData : {
						seriesDefaults : '{type:"donut"}',
						series : ""
					},
					viewModel : {
						isHover : false,
						hoverCount : 0,
						hoverCategory : "On",
						dropDownDs : [],
						dropDownSelect : function(e){
							var item = e.dataItem;
							var text = item.name;
							this.set("dropDownText", text);
						},
						dropDownText : "SAC Indoor",
						dropDownValue : "AirConditioner",
						disabled : false,
						btnDisabled : false,
						btnText : "Apply",
						btnClick : function(){
							var value = this.dropDownValue;
							var text = this.dropDownText;
							var url = "/assets/statisticView?foundation_space_buildings_id=0";
							var options = this.thisOptions;
							options.setRefreshUrl(url);
							var I18N = window.I18N;
							options.widget.titleElem.text(I18N.prop("DASHBOARD_ASSETS") + " > " + text);

							var self = this;
							this.set("invisibleDropDown", true);
							this.set("invisibleGraph", false);
							var message = "/assetId/" + value + "/assetText/" + text + "/";
							options.widget.element.attr("data-message", message);

							options.widget.refresh().done(function(){

							});
							options.widget.trigger("onPin");
							options.widget.element.on("mouseleave", ".k-chart", function(){
								var isHover = self.get("isHover");
								if(isHover){
									self.set("isHover", false);
								}
							});
						},
						onSeriesHover : function(e){
							this.set("isHover", true);
							var percent = e.percentage;
							percent = Math.round((percent * 100));
							var category = e.category;
							category = category.toUpperCase();
							category = category.replace(" ", "_");
							if(category == "DISCONNECTED"){
								category = "CRITICAL";
							}else if(category == "LOW_BATTERY"){
								category = "WARNING";
							}
							var I18N = window.I18N;
							category = I18N.prop("FACILITY_DEVICE_STATUS_" + category);
							this.set("hoverCount", percent);
							this.set("hoverCategory", category);
						},
						invisibleDropDown : false,
						invisibleGraph : true,
						isVisible: true,
						normal : 0,
						disconnected : 0,
						wrongLocation : 0,
						lowBattery : 0,
						operationData : new kendo.data.DataSource({
							data : []
						})
					},
					setRefreshUrl : function(url){
						this.refreshUrl = url;
					},
					setDataSource : function(){
						var onNum = this.viewModel.get("normal") + "";
						onNum = onNum.replace("+", "");
						onNum = Number(onNum);
						var disconnectedNum = this.viewModel.get("disconnected") + "";
						disconnectedNum = disconnectedNum.replace("+", "");
						disconnectedNum = Number(disconnectedNum);
						var lowBatteryNum = this.viewModel.get("lowBattery") + "";
						lowBatteryNum = lowBatteryNum.replace("+", "");
						lowBatteryNum = Number(lowBatteryNum);
						var wrongLocationNum = this.viewModel.get("wrongLocation") + "";
						wrongLocationNum = wrongLocationNum.replace("+", "");
						wrongLocationNum = Number(wrongLocationNum);

						var data = [
							{
								type  : "on",
								value : onNum,
								visibleInLegend : false,
								color : "#1aa05a"
							},
							{
								type  : "disconnected",
								value : disconnectedNum,
								visibleInLegend : false,
								color : "#ef2b2b"
							},
							{
								type  : "wrong location",
								value : wrongLocationNum,
								visibleInLegend : false,
								color : "#ef2b2b"
							},
							{
								type  : "low battery",
								value : lowBatteryNum,
								visibleInLegend : false,
								color : "#ffa41f"
							}
						];

						data = new kendo.data.DataSource({
							data : data
						});
						this.viewModel.set("operationData", data);
					},
					parseData : function(data){
						data = data[0];

						var text = this.viewModel.get("dropDownText");
						var split = text.split(" / ");
						var curAssetType = split[0];
						var curSubAssetType = split[1];
						// console.log(curAssetType);
						// console.log(curSubAssetType);
						if(!curSubAssetType){
							curSubAssetType =  void 0;
						}
						var numberOfNormal = 0, numberOfDisconnected = 0, numberOfLowBattery = 0,
							numberOfWrongLocation = 0;
						if(data){
							var assetType, subAssetType, subAssetTypes, assetTypes = data.assetTypes;
							var i, j, size, max = assetTypes.length;
							for( i = 0; i < max; i++ ){
								assetType = assetTypes[i];
								if(assetType.assets_types_name == curAssetType){
									subAssetTypes = assetType.subAssetTypes;
									size = subAssetTypes.length;
									for( j = 0; j < size; j++ ){
										subAssetType = subAssetTypes[j];
										if(subAssetType.assets_subAssetType == curSubAssetType){
											numberOfNormal = subAssetType.numberOfNormalDevices;
											numberOfDisconnected = subAssetType.numberOfCriticalDevices;
											numberOfLowBattery = subAssetType.numberOfWarningDevices;
											//numberOfWrongLocation = subAssetType.numberOfNormalDevices;
											// console.log(assetType);
											// console.log(curSubAssetType);
											// console.log("normal : "+numberOfNormal +" / disconnected : "+numberOfDisconnected +" /  low battery : "+numberOfLowBattery+" / wrong location : "+numberOfWrongLocation);
											break;
										}
									}
								}
							}
						}

						//if(numberOfNormal > 999) numberOfNormal = "999+";

						this.viewModel.set("normal", numberOfNormal);

						//if(numberOfDisconnected > 999) numberOfDisconnected = "999+";

						this.viewModel.set("disconnected", numberOfDisconnected);

						//if(numberOfWrongLocation > 999) numberOfWrongLocation = "999+";

						this.viewModel.set("wrongLocation", numberOfWrongLocation);

						//if(numberOfLowBattery > 999) numberOfLowBattery = "999+";

						this.viewModel.set("lowBattery", numberOfLowBattery);
						this.setDataSource();
					}
				}
			],
			title : "DASHBOARD_ASSETS"
		},
		alarmLog : {
			cards : [
				{
					width : 2,
					height : 2,
					refreshUrl : "/alarms/statisticView",
					menuUrl : "/operation/alarm",
					template : "<div class='dashboard-body-content dashboard-alarm-log-2x2'><div class='row'><div class='dashboard-alarm-log-2x2-label'><p class='key'>#=critical#</p></div><div class='dashboard-alarm-log-2x2-value'><p class='value critical' data-bind='text : criticalValue'></p></div></div><div class='row'><div class='dashboard-alarm-log-2x2-label'><p class='key'>#=warning#</p></div><div class='dashboard-alarm-log-2x2-value'><p class='value warning' data-bind='text : warningValue'></p></div></div></div>",
					localeTemplateData : {
						critical : "FACILITY_DEVICE_STATUS_CRITICAL",
						warning : "FACILITY_DEVICE_STATUS_WARNING"
					},
					viewModel : {
						criticalValue : 0,
						warningValue : 0
					},
					parseData : function(data){
						var criticalNum = data.numberOfUnresolvedCriticalAlarms;
						var warningNum = data.numberOfUnresolvedWarningAlarms;
						/*if(criticalNum > 999){
							criticalNum = "999+";
						}*/

						/*if(warningNum > 999){
							warningNum = "999+";
						}*/

						this.viewModel.set("criticalValue", criticalNum);
						this.viewModel.set("warningValue", warningNum);
					}
				},
				{
					width : 4,
					height : 6,
					refreshUrl : "/alarms/statisticView",
					menuUrl : "/operation/alarm",
					template : "<div class='dashboard-body-content dashboard-alarm-log-4x6'><div data-animation='false' data-role='tabstrip'><ul><li class='k-state-active'><span class='critical'>#=critical# <span class='ciritcal-count main-top-nav-alarm error' data-bind='text: criticalNum'></span></span><li><span class='warning'>#=warning# <span class='warning-count main-top-nav-alarm warning' data-bind='text: warningNum'></span></span></li></ul><div><ul data-template='dashboard-alarm-log-ul-template' data-bind='source: criticalList' class='dashboard-list'></ul></div><div><ul data-template='dashboard-alarm-log-ul-template' data-bind='source: warningList' class='dashboard-list'></ul></div>",
					localeTemplateData : {
						critical : "FACILITY_DEVICE_STATUS_CRITICAL",
						warning : "FACILITY_DEVICE_STATUS_WARNING"
					},
					viewModel : {
						criticalList : [],
						warningList : []
					},
					parseData : function(data){
						var criticalNum = data.numberOfUnresolvedCriticalAlarms;
						var warningNum = data.numberOfUnresolvedWarningAlarms;
						var alarmCritical = data.unresolvedCriticalAlarms;
						this.viewModel.set("criticalNum", criticalNum);
						alarmCritical = this.parseAlarmList(alarmCritical);
						/*if(alarmCritical > 999){
							alarmCritical = "999+";
						}*/
						this.viewModel.set("criticalList", alarmCritical);
						var alarmWarning = data.unresolvedWarningAlarms;
						/*if(alarmWarning > 999){
							alarmWarning = "999+";
						}*/
						this.viewModel.set("warningNum", warningNum);
						alarmWarning = this.parseAlarmList(alarmWarning);
						this.viewModel.set("warningList", alarmWarning);
					},
					parseAlarmList : function(data){
						var sliceArr = data.slice(0, 5);
						var i, max = sliceArr.length;
						var location, split;
						for( i = 0; i < max; i++ ){
							Util.setAlarmData(sliceArr[i]);
							location = sliceArr[i].location;
							if(location && location != "-"){
								split = location.split(", ");
								sliceArr[i].building = split[0];
								if(split[1]){
									sliceArr[i].floor = ", " + split[1];
								}
								sliceArr[i].zone = split[2] ? split[2] : "-";
							}else{
								sliceArr[i].building = "-";
								sliceArr[i].zone = "-";
							}
							sliceArr[i].deviceType = Util.getDisplayClassType(sliceArr[i].dms_devices_type);
						}
						return sliceArr;
					}
				}
			],
			title : "DASHBOARD_CARD_CRITICAL_AND_WARINING"
		},
		deviceStatusOn : {
			cards : [
				{
					width : 2,
					height : 4,
					refreshUrl : "/dms/devices/statisticView/AirConditioner?foundation_space_buildings_id=0",
					menuUrl : "/device",
					template : "<div class='dashboard-body-content dashboard-device-status on'><div class='dashboard-device-status-circle-block'><span class='circle'>#=on#</span></div><div class='table-content'><div class='cell'><p class='key'>#=indoor#</p></div><div class='cell'><p class='value' data-bind='text: indoor'></p></div></div><div class='table-content'><div class='cell'><p class='key'>#=ventilator#</p></div><div class='cell'><p class='value' data-bind='text: ventilator'></p></div></div><div class='table-content'><div class='cell'><p class='key'>#=dhw#</p></div><div class='cell'><p class='value' data-bind='text: dhw'></p></div></div>",
					localeTemplateData : {
						on : "FACILITY_DEVICE_STATUS_ON",
						indoor : "FACILITY_INDOOR_INDOOR",
						ventilator : "FACILITY_DEVICE_TYPE_VENTILATOR",
						dhw : "FACILITY_DEVICE_TYPE_DHW"
					},
					viewModel : {
						indoor : 0,
						ventilator : 0,
						dhw : 0
					},
					onMoveMenu : function(){
						window.localStorage.setItem("deviceTypeTab", "AirConditioner.Indoor");
						window.localStorage.setItem("deviceViewType", "STATISTIC");
					},
					parseData : function(data){
						if(data && data[0]){
							data = data[0];
							var indoor = data.numberOfOnIndoorDevices;
							var ventilator = data.numberOfOnVentilatorDevices;
							var dhw = data.numberOfOnDHWDevices;
							/*if(indoor > 999){
								indoor = "999+";
							}*/
							this.viewModel.set("indoor", indoor);
							/*if(ventilator > 999){
								ventilator = "999+";
							}*/
							this.viewModel.set("ventilator", ventilator);
							/*if(dhw > 999){
								dhw = "999+";
							}*/
							this.viewModel.set("dhw", dhw);
						}
					}
				}
			],
			title : "DASHBOARD_SAC_INDOOR_ON"
		},
		deviceStatusOff : {
			cards : [
				{
					width : 2,
					height : 4,
					refreshUrl : "/dms/devices/statisticView/AirConditioner?foundation_space_buildings_id=0",
					menuUrl : "/device",
					template : "<div class='dashboard-body-content dashboard-device-status off'><div class='dashboard-device-status-circle-block'><span class='circle'>#=off#</span></div><div class='table-content'><div class='cell'><p class='key'>#=indoor#</p></div><div class='cell'><p class='value' data-bind='text: indoor'></p></div></div><div class='table-content'><div class='cell'><p class='key'>#=ventilator#</p></div><div class='cell'><p class='value' data-bind='text: ventilator'></p></div></div><div class='table-content'><div class='cell'><p class='key'>#=dhw#</p></div><div class='cell'><p class='value' data-bind='text: dhw'></p></div></div>",
					localeTemplateData : {
						off : "FACILITY_DEVICE_STATUS_OFF",
						indoor : "FACILITY_INDOOR_INDOOR",
						ventilator : "FACILITY_DEVICE_TYPE_VENTILATOR",
						dhw : "FACILITY_DEVICE_TYPE_DHW"
					},
					viewModel : {
						indoor : 0,
						ventilator : 0,
						dhw : 0
					},
					onMoveMenu : function(){
						window.localStorage.setItem("deviceTypeTab", "AirConditioner.Indoor");
						window.localStorage.setItem("deviceViewType", "STATISTIC");
					},
					parseData : function(data){

						if(data && data[0]){
							data = data[0];
							var indoor = data.numberOfOffIndoorDevices;
							var ventilator = data.numberOfOffVentilatorDevices;
							var dhw = data.numberOfOffDHWDevices;
							/*if(indoor > 999){
								indoor = "999+";
							}*/
							this.viewModel.set("indoor", indoor);
							/*if(ventilator > 999){
								ventilator = "999+";
							}*/
							this.viewModel.set("ventilator", ventilator);
							/*if(dhw > 999){
								dhw = "999+";
							}*/
							this.viewModel.set("dhw", dhw);
						}
					}
				}
			],
			title : "DASHBOARD_SAC_INDOOR_OFF"
		},
		energyLoss : {
			title : "DASHBOARD_ENERGY_LOSS",
			cards : [
				{
					refreshOption : {
						timeout : 3600000
					},
					width : 4,
					height : 4,
					refreshUrl : "/energy/sac/energyLossDetection/today?attributes=energyLossDetails",
					//refreshUrl : "/energy/algorithm-summary",
					menuUrl : "/energy/samsungsac",
					template : '<div class="dashboard-body-content dashboard-energy-loss-4x4"><div class="dashboard-facility-operation-graph"><div class="dashboard-energy-loss-info"><div class="wrapper"><div class="legend-wrapper" data-bind="visible:isHover"><span class="count" data-bind="text: hoverCount"></span><span class="percent">%<br></span><span class="category" data-bind="text: hoverCategory"></span></div></div></div><div class="dashboard-energy-loss-chart" data-role="chart" data-transitions="false" data-series-defaults="{type:\'donut\',holeSize:78}" data-chart-area="{ background : \'\\#f7f7f7\', }" data-series="[{field:\'value\',categoryField:\'type\',visibleInLegendField:\'visibleInLegend\',padding:35,overlay:{gradient:\'none\'}}]" data-bind="source: chartData, events:{seriesHover : onSeriesHover}"></div><span class="dashboard-energy-loss-based-time" data-bind="text:BasedTime"></span><div class="dashboard-energy-loss-legend"><span class="unit">(EA)</span><ul class="legends"><li class="legend"><span class="square insufficient-insulation"></span><p class="key">#=insufficient#</p><p class="value" data-bind="text: InsufficientInsulation"></p></li><li class="legend"><span class="square load-variation"></span><p class="key">#=load#</p><p class="value" data-bind="text: LoadVariation"></p></li><li class="legend"><span class="square abnormal-set-temperature"></span><p class="key">#=abnormalRoomTemp#</p><p class="value" data-bind="text: AbnormalRoomTemp"></p></li><li class="legend"><span class="square temp-setting-error"></span><p class="key">#=abnormalSetTemp#</p><p class="value" data-bind="text: AbnormalSetTemp"></p></li><li class="legend"><span class="square long-time-oper"></span><p class="key">#=longtime#</p><p class="value" data-bind="text: LongTimeOperation"></p></li><li class="legend"><span class="square repetitive-control"></span><p class="key">#=repetitive#</p><p class="value" data-bind="text: RepetitiveControl"></p></li><li class="legend"><span class="square over-time-operation"></span><p class="key">#=overtime#</p><p class="value" data-bind="text: OverTimeOperation"></p></li></ul></div></div></div>',
					localeTemplateData : {
						insufficient : "ENERGY_INSUFFICIENT_INSULATION",
						load : "ENERGY_LOAD_VARIATION",
						abnormalRoomTemp : "DASHBOARD_ABNORMAL_ROOM_TEMP",
						abnormalSetTemp : "ENERGY_ABNORMAL_SET_TEMP",
						longtime : "ENERGY_LONG_TIME_OPERATION",
						repetitive : "ENERGY_REPETITIVE_CONTROL",
						overtime : "ENERGY_OVER_TIME_OPERATION"
					},
					apiMockData : {
						energyLossDetails : [
							{name: "InsufficientInsulation", count: 1},
							{name: "LoadVariation", count: 2},
							{name: "AbnormalRoomTemp", count: 3},
							{name: "AbnormalSetTemp", count: 4},
							{name: "LongTimeOperation", count: 5},
							{name: "RepetitiveControl", count: 6},
							{name: "OverTimeOperation", count: 4}
						]
					},
					templateData : {
						seriesDefaults : '{type:"donut"}',
						series : ""
					},
					init : function(){
						var self = this;
						var vm = this.viewModel;
						self.widget.element.on("mouseleave", ".k-chart", function(){
							var isHover = vm.get("isHover");
							if(isHover){
								vm.set("isHover", false);
							}
						});
					},
					onMoveMenu : function(){
						window.localStorage.setItem("dashboardShortcut", "energylossdetection");
					},
					viewModel : {
						isHover : false,
						hoverCount : 0,
						hoverCategory : "",
						BasedTime: "",
						InsufficientInsulation : "-",
						LoadVariation : "-",
						AbnormalRoomTemp : "-",
						AbnormalSetTemp : "-",
						LongTimeOperation : "-",
						RepetitiveControl : "-",
						OverTimeOperation : "-",
						chartData : new kendo.data.DataSource({
							data : []
						}),
						onSeriesHover : function(e){
							this.set("isHover", true);
							var percent = e.percentage;
							percent = Math.round((percent * 100));
							var category = e.category;
							this.set("hoverCount", percent);
							var I18N = window.I18N;

							if(category == "InsufficientInsulation"){
								category = I18N.prop("ENERGY_INSUFFICIENT_INSULATION");
							}else if(category == "LoadVariation"){
								category = I18N.prop("ENERGY_LOAD_VARIATION");
							}else if(category == "AbnormalRoomTemp"){
								category = I18N.prop("DASHBOARD_ABNORMAL_ROOM_TEMP");
							}else if(category == "AbnormalSetTemp"){
								category = I18N.prop("ENERGY_ABNORMAL_SET_TEMP");
							}else if(category == "LongTimeOperation"){
								category = I18N.prop("ENERGY_LONG_TIME_OPERATION");
							}else if(category == "RepetitiveControl"){
								category = I18N.prop("ENERGY_REPETITIVE_CONTROL");
							}else if(category == "OverTimeOperation"){
								category = I18N.prop("ENERGY_OVER_TIME_OPERATION");
							}
							this.set("hoverCategory", category);
						}
					},
					setDataSource : function(){
						var insufficient = this.viewModel.get("InsufficientInsulation");
						insufficient = insufficient == "-" ? 0 : insufficient;
						var load = this.viewModel.get("LoadVariation");
						load = load == "-" ? 0 : load;
						var abnormal = this.viewModel.get("AbnormalRoomTemp");
						abnormal = abnormal == "-" ? 0 : abnormal;
						var temp = this.viewModel.get("AbnormalSetTemp");
						temp = temp == "-" ? 0 : temp;
						var longtime = this.viewModel.get("LongTimeOperation");
						longtime = longtime == "-" ? 0 : longtime;
						var repetitive = this.viewModel.get("RepetitiveControl");
						repetitive = repetitive == "-" ? 0 : repetitive;
						var overtime = this.viewModel.get("OverTimeOperation");
						overtime = overtime == "-" ? 0 : overtime;

						var data = [
							{
								type  : "InsufficientInsulation",
								value : insufficient,
								visibleInLegend : false,
								color : "#2c81db"
							},
							{
								type  : "LoadVariation",
								value : load,
								visibleInLegend : false,
								color : "#08b5d4"
							},
							{
								type  : "AbnormalRoomTemp",
								value : abnormal,
								visibleInLegend : false,
								color : "#68BA10"
							},
							{
								type  : "AbnormalSetTemp",
								value : temp,
								visibleInLegend : false,
								color : "#feac5a"
							},
							{
								type  : "LongTimeOperation",
								value : longtime,
								visibleInLegend : false,
								color : "#f0824f"
							},
							{
								type  : "RepetitiveControl",
								value : repetitive,
								visibleInLegend : false,
								color : "#eb5b6c"
							},
							{
								type  : "OverTimeOperation",
								value : overtime,
								visibleInLegend : false,
								color : "#7c62f0"
							}
						];
						// console.log(data);
						data = new kendo.data.DataSource({
							data : data
						});
						data.read();
						this.viewModel.set("chartData", data);
					},
					parseData : function(data){
						var I18N = window.I18N;

						if(typeof data.time !== 'undefined') this.viewModel.set('BasedTime', data.time + " " + I18N.prop("DASHBOARD_BASED"));
						else this.viewModel.set('BasedTime', "");

						if(data.energyLossDetails && data.energyLossDetails[0]){
							data = data.energyLossDetails;
						}else{
							//MockData
							data = [];
						}
						//data = this.apiMockData.energyLossDetails;
						var i, max = data.length;
						var name, count;
						for( i = 0; i < max; i++ ){
							name = data[i].name;
							count = typeof data[i].count !== "undefined" ? data[i].count : "-";
							if(name){
								this.viewModel.set(name, count);
							}
						}
						this.setDataSource();
					}
				},
				{
					refreshOption : {
						timeout : 3600000
					},
					width : 8,
					height : 4,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/energyLossDetection/today?attributes=hourlyLoss",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-energy-list-4x4'><div class='top-five-bar-graph-wrapper'><div class='graph-y-unit left'>(EA)</div><div data-role='chart' class='top-five-bar-graph' style='height:#=height#;' data-series-defaults='#=seriesDefault#' data-series='#=series#' data-chart-area='#=chartArea#' data-value-axis='#=valueAxis#' data-category-axis='#=categoryAxis#' data-bind='source:list' data-legend='#=legend#'></div></div></div>",
					templateData : {
						height : "250px",
						legend : '{visible:false}',
						seriesDefault : '{type:\"column\", axis:\"count\", categoryAxis:\"hour\",color:\"rgb(0, 129, 198)\",overlay:{ gradient : \"none\"}, border:{width:0}, spacing:0.1,gap:2.5}',
						chartArea : '{background:\"#f7f7f7\"}',
						series : '[{field:\"count\", name:\"count\"}]',
						valueAxis : '[{ name : \"count\", min : 0, max : 12, line: {visible:false}}]',
						categoryAxis : '[{name :\"hour\", majorGridLines : {visible:false}, minorGridLines : {visible : false}, majorUnit:2}]'
					},
					listMockData : {
						"hourlyLoss" : [
							{"hour" : 10,  "count": 5.0},
							{"hour" : 11,  "count": 5.0},
							{"hour" : 12,  "count": 5.0},
							{"hour" : 13,  "count": 5.0},
							{"hour" : 14,  "count": 5.0},
							{"hour" : 15,  "count": 5.0},
							{"hour" : 16,  "count": 5.0},
							/*{"hour" : 17,  "count": 5.0},
							{"hour" : 18,  "count": 5.0},
							{"hour" : 19,  "count": 5.0},
							{"hour" : 20,  "count": 5.0},*/
							{"hour" : 21,  "count": 5.0},
							{"hour" : 22,  "count": 5.0},
							{"hour" : 23,  "count": 10.0},
							//{"hour" : 0,  "count": 5.0},
							//{"hour" : 1,  "count": 5.0},
							//{"hour" : 2,  "count": 5.0},
							/*{"hour" : 3,  "count": 5.0},
							{"hour" : 4,  "count": 5.0},
							{"hour" : 5,  "count": 5.0},
							{"hour" : 6,  "count": 5.0},*/
							{"hour" : 7,  "count": 5.0},
							{"hour" : 8,  "count": 5.0},
							{"hour" : 9,  "count": 5.0}
						],
						"min": 5.0,
						"max": 10.0
					},
					viewModel : {
						list : []
					},
					onMoveMenu : function(){
						window.localStorage.setItem("dashboardShortcut", "energylossdetection");
					},
					parseData : function(data){
						var energyData;
						var max;
						if(data.hourlyLosses || data.hourlyLoss){
							energyData = data.hourlyLosses || data.hourlyLoss;
							max = data.max ? data.max : 10;
						}else{
							energyData = [];
							max = 10;
						}
						//energyData = this.listMockData.hourlyLoss;
						//max = this.listMockData.max ? this.listMockData.max : 30;
						energyData.sort(function(a, b){
							a = Number(a.hour);
							b = Number(b.hour);
							return a - b;
						});

						var hour, count, results = [];
						var i, size = energyData.length;
						for( i = 0; i < size; i++ ){
							hour = energyData[i].hour;
							count = energyData[i].count;
							if(typeof hour !== "undefined"){
								results[hour] = {count : count};
							}
						}

						var chart = this.widget.element.find(".top-five-bar-graph").data("kendoChart");

						var categories = getChartXAxisLabelOfTime();

						chart.setOptions({
							categoryAxis : [{
								name : "hour",
								minorGridLines:{visible : false},
								majorGridLines:{visible : false},
								majorUnit : 2,
								categories : categories
							}],
							valueAxis : [
								{ name : "count", min : 0, max : max,line: {visible:false}}
							]
						});

						this.viewModel.set("list", results);
					}
				}
			]
		},
		sacShortcut : {
			title : "DASHBOARD_SAC_SHORTCUT",
			cards : [
				{
					refreshOption : false,
					width : 2,
					height : 2,
					//refreshUrl : "/dms/devices?types=AirConditioner.*&attributes=representativeStatus&registrationStatuses=Registered",
					//menuUrl : "/device/allview",
					template : '<div class="dashboard-body-content dashboard-shortcut-2x2"><div class="dashboard-shorcut-dropdownlist" data-bind="invisible : invisibleDropDown"><div class="dashboard-shorcut-dropdownlist-wrapper"><div class="input-wrapper"><input class="k-input shortcut-name" data-role="commonvalidator" data-type="name" data-bind="events:{change:changeName}" required/><button class="k-button" data-bind="disabled:btnDisabled, events:{click:btnClick}">#=save#</button></div><div class="dropdown-wrapper"><input class="building-dropdown" data-role="dropdownlist" data-width="100%" data-animation="false" data-text-field="name" data-value-field="id" data-bind="source: buildingList, value : buildingValue, events:{ change : changeBuilding, dataBound:dataBoundBuilding }"/><input class="floor-dropdown" data-role="dropdownlist" data-width="100%" data-animation="false" data-text-field="name" data-value-field="id" data-bind="source: floorList, disabled:floorDisabled, value : floorValue, events:{ change : changeFloor, dataBound:dataBoundFloor }"/><input class="zone-dropdown" data-role="dropdownlist" data-width="100%" data-animation="false" data-text-field="name" data-value-field="id" data-bind="source: zoneList, disabled:zoneDisabled, value : zoneValue, events:{ change : changeZone, dataBound : dataBoundZone }"/></div></div></div><div class="dashboard-shorcut-display" data-bind="invisible: invisibleDisplay"><p class="shorcut-title" data-bind="text: shortcutName"></p><p class="shorcut-location" data-bind="text:shortcutLocation"></p></div></div>',
					localeTemplateData : {
						save : "COMMON_BTN_SAVE"
					},
					init : function(){
						var self = this;
						var widget = self.widget;
						var msg = widget.element.data("message");
						if(msg){
							msg = msg.split("/");
							var name, location;
							var floor = {}, building = {}, zone = {};
							var i, max = msg.length;
							for( i = 0; i < max; i++ ){
								var value = msg[i + 1];
								if(msg[i] == "location"){
									location = value;
								}else if(msg[i] == "name"){
									name = value;
								}else if(msg[i] == "buildingName"){
									building.name = value;
								}else if(msg[i] == "buildingId"){
									building.id = value;
								}else if(msg[i] == "floorName"){
									floor.name = value;
								}else if(msg[i] == "floorId"){
									floor.id = value;
								}else if(msg[i] == "floorType"){
									floor.type = value;
								}else if(msg[i] == "zoneName"){
									zone.name = value;
								}else if(msg[i] == "zoneId"){
									zone.id = value;
								}
							}
							// if(!name || !location){
							//     console.error("parse error for shortcut");
							// }
							this.viewModel.set("shortcutName", name);
							this.viewModel.set("shortcutLocation", location);
							this.viewModel.set("buildingValue", building);
							this.viewModel.set("floorValue", floor);
							this.viewModel.set("zoneValue", zone);
							this.viewModel.set("invisibleDropDown", true);
							this.viewModel.set("invisibleDisplay", false);
							this.menuUrl = "/device";
						}else{
							widget.loading.open(widget.element);
							$.ajax({
								url : "/foundation/space/buildings"
							}).done(function(list){
								list.sort(function(a, b){
									return a.sortOrder - b.sortOrder;
								});
								self.viewModel.set("buildingList", list);
								/*if(list.length > 0){
									self.viewModel.set("buildingValue", list[0]);
								}*/
							}).fail(function(){

							}).always(function(){
								widget.loading.close();
							});
						}
					},
					onMoveMenu : function(){
						var mainWindow = window.MAIN_WINDOW;
						var floor = this.viewModel.get("floorValue");
						var building = this.viewModel.get("buildingValue");
						var type = floor.type;
						var name = floor.name;
						name = name.replace(type, "");

						var floorObj = {
							floor : {
								id : floor.id,
								value : name,
								type : type
							},
							building : {
								id : building.id,
								value : building.name
							}
						};

						mainWindow.setCurrentFloor(floorObj);
						window.localStorage.setItem("deviceTypeTab", "AirConditioner.Indoor");
						window.localStorage.setItem("deviceViewType", "MAP");
					},
					viewModel : {
						isHover : false,
						disabled : false,
						btnDisabled : true,
						buildingList : [],
						buildingValue : null,
						floorList : [],
						floorValue : null,
						floorDisabled : true,
						zoneList : [],
						zoneValue : null,
						zoneDisabled : true,
						shortcutName : "",
						shortcutLocation : "",
						changeName : function(){
							this.checkBtnDisabled();
						},
						checkBtnDisabled : function(){
							//var name = this.get("shortcutName");
							var options = this.thisOptions;
							var element = options.widget.element;
							var validatorElem = element.find(".shortcut-name");
							var name = validatorElem.val();

							var building = this.get("buildingValue");
							var floor = this.get("floorValue");
							if(!name || !building || !floor){
								this.set("btnDisabled", true);
								return;
							}

							this.set("btnDisabled", false);
						},
						changeBuilding : function(e){
							var value = e.sender.value();
							if(value instanceof kendo.data.ObservableObject){
								value = value.id;
							}
							if(value){
								var options = this.thisOptions;
								var self = this;
								var widget = options.widget;
								var element = widget.element;
								widget.loading.open(element);
								$.ajax({
									url : "/foundation/space/floors?foundation_space_buildings_id=" + value
								}).done(function(data){
									var i, max = data.length;
									data.sort(function(a, b){
										return a.sortOrder - b.sortOrder;
									});
									for( i = 0; i < max; i++ ){
										data[i].name = Util.getFloorName(data[i]);
									}
									self.set("floorList", data);
									self.set("floorValue", null);
									if(data.length < 1){
										self.set("floorDisabled", true);
									}else{
										self.set("floorDisabled", false);
									}
									self.set("zoneList", []);
									self.set("zoneDisabled", true);
									self.set("zoneValue", null);
								}).fail(function(){

								}).always(function(){
									self.checkBtnDisabled();
									widget.loading.close();
								});
							}
						},
						dataBoundBuilding : function(e){
							/*if(buildingList.length > 0){
								this.set("buildingValue", buildingList[0]);
							}*/
							this.changeBuilding(e, true);
						},
						changeFloor : function(e){
							var value = e.sender.value();
							if(value instanceof kendo.data.ObservableObject){
								value = value.id;
							}
							if(value){
								var options = this.thisOptions;
								var self = this;
								var widget = options.widget;
								var element = widget.element;
								widget.loading.open(element);
								$.ajax({
									url : "/foundation/space/zones?foundation_space_floors_id=" + value
								}).done(function(data){
									data.sort(function(a, b){
										return a.sortOrder - b.sortOrder;
									});
									self.set("zoneList", data);
									self.set("zoneValue", null);
									if(data.length < 1){
										self.set("zoneDisabled", true);
									}else{
										self.set("zoneDisabled", false);
									}
								}).fail(function(){

								}).always(function(){
									self.checkBtnDisabled();
									widget.loading.close();
								});
							}
						},
						dataBoundFloor : function(e){
							/*if(floorList.length > 0){
								this.set("floorValue", floorList[0]);
							}*/
							this.changeFloor(e, true);
						},
						changeZone : function(){
							// console.log("change zone");
							// console.log(e);
						},
						dataBoundZone : function(e){
							/*if(zoneList.length > 0){
								this.set("zoneValue", zoneList[0]);
							}*/
							this.changeZone(e, true);
						},
						btnClick : function(){

							//var url = "/dms/devices/statisticView/"+value+"?foundation_space_buildings_id=0";
							var options = this.thisOptions;
							var element = options.widget.element;
							var validatorElem = element.find(".shortcut-name");
							var validator = validatorElem.data("kendoCommonValidator");
							var isValid = validator.validate();
							if(!isValid){
								return;
							}
							var name = validatorElem.val();
							var building = this.get("buildingValue");
							var floor = this.get("floorValue");
							var zone = this.get("zoneValue");
							var buildingId = "", buildingName = "", floorId = "", floorName = "", floorType = "", zoneId = "", zoneName = "", location = "";
							if(building){
								buildingId = building.id;
								buildingName = building.name;
								location += buildingName;
							}
							if(floor){
								floorId = floor.id;
								floorName = floor.name;
								floorType = floor.type;
								location += (", " + floorName);
							}

							if(zone){
								zoneId = zone.id;
								zoneName = zone.name;
								location += (", " + zoneName);
							}

							//options.widget.trigger("onChange");
							this.set("shortcutLocation", location);
							this.set("shortcutName", name);
							this.set("invisibleDropDown", true);
							this.set("invisibleDisplay", false);

							var msg = "/name/" + name + "/location/" + location + "/" +
									"buildingName/" + buildingName + "/buildingId/" + buildingId +
									"/floorName/" + floorName + "/floorId/" + floorId +
									"/floorType/" + floorType + "/" +
									"/zoneName/" + zoneName + "/zoneId/" + zoneId;

							options.widget.element.attr("data-message", msg);

							options.widget.trigger("onPin");
							options.menuUrl = "/device";
							return false;
							//Click Event 끝난 후 menuUrl 설정
							/*setTimeout(function(){

							}, 500);*/
						},
						invisibleDropDown : false,
						invisibleDisplay : true
					},
					setRefreshUrl : function(url){
						this.refreshUrl = url;
					},
					parseData : function(){}
				}
			]
		},
		buildingOperationStatus: {
			title: "DASHBOARD_BUILDING_OPERATION_STATUS",
			cards: [
				{
					width : 2,
					height : 2,
					template :  '<div class="dashboard-body-content dashboard-building-operation-status-2x2"><div class="dashboard-building-dropdownlist" data-bind="invisible : invisibleDropDown"><div class="dashboard-building-dropdownlist-wrapper"><div class="dropdown-wrapper"><input data-role="dropdownlist" data-width="100%" data-animation="false" data-text-field="name" data-value-field="id" data-option-label="#=buildingOptionLabel#" data-bind="source: buildingList, value : buildingValue, events:{ select : dropDownSelect }, invisible: invisible, disabled : disabled"/></div><div class="button-wrapper"><button class="k-button" data-bind="disabled:btnDisabled, events:{click:handleClickApplyBtn}"><span>#=btnText#</span></button></div></div></div><div class="dashboard-building-operation-graph" data-bind="invisible: invisibleGraph"><div class="text-wrapper" data-bind="events: {click: handleClickSchedulesArea}"><div class="text-field">#=schedules#</div><p data-bind="text: numberOfSchedules"></p></div><div class="chart-wrapper" data-bind="events: {click: handleClickChartArea }"><div class="on-stack"></div><div class="off-stack"></div><div class="critical-stack"></div><div class="warning-stack"></div></div><div class="table-wrapper" data-bind="events: {click: handleClickTableDataArea }"><div class="table-content"><div class="table-row"><div class="cell">#=on#<p data-bind="text: tableData.numberOfOnIndoorDevices"></p></div><div class="cell">#=off#<p data-bind="text: tableData.numberOfOffIndoorDevices"></p></div><div class="cell">#=critical#<p data-bind="text: tableData.numberOfCriticalDevices"></p></div><div class="cell">#=warning#<p data-bind="text: tableData.numberOfWarningDevices"></p></div></div></div></div></div></div>',
					init : function() {
						var self = this;
						var widget = self.widget;
						var msg = widget.element.data("message");
						var Settings = window.GlobalSettings;
						var tableElem = this.widget.bodyElem.find('.table-wrapper')[0];
						var i, cellElems = $(tableElem).find('.cell');

						if(msg) {
							self.viewModel.set('buildingValue', { id: msg.split("/")[0], name: msg.split("/")[1] });
							self.viewModel.handleClickApplyBtn({isSavedCard: true});
						} else {
							this.viewModel.set("invisibleGraph", true);
							widget.loading.open(widget.element);
							$.ajax({
								url: "/foundation/space/buildings"
							}).done(function(list){
								list.sort(function(a, b) {
									return a.sortOrder - b.sortOrder;
								});
								self.viewModel.set("buildingList", list);
							}).fail(function(){

							}).always(function(){
								widget.loading.close();
							});
						}

						// 글로벌 세팅 값이 한글인 경우, 간격 변경을 위한 클래스 추가.
						if(Settings.getLocale() == "ko") {
							for( i = 0; i < cellElems.length; i++ ) {
								$(cellElems[i]).addClass('cell-ko');
							}
						}
					},
					localeTemplateData : {
						buildingOptionLabel : "DASHBOARD_SELECT_BUILDING",
						btnText: "COMMON_BTN_APPLY",
						schedules: "DASHBOARD_BUILDING_OPERATION_STATUS_SCHEDULES",
						on: "DASHBOARD_BUILDING_OPERATION_STATUS_ON",
						off: "DASHBOARD_BUILDING_OPERATION_STATUS_OFF",
						critical: "DASHBOARD_BUILDING_OPERATION_STATUS_CRITICAL",
						warning: "DASHBOARD_BUILDING_OPERATION_STATUS_WARNING"
					},
					viewModel : {
						isHover : false,
						disabled : false,
						btnDisabled : true,
						buildingList : [],
						buildingValue : null,
						dropDownSelect: function(e) {
							var id = e.dataItem.id;
							if(id === "") {
								this.set("btnDisabled", true);
							} else {
								this.set("btnDisabled", false);
							}
						},
						handleClickSchedulesArea: function(e) {
							var widget = this.thisOptions.widget;
							var options = widget.options;
							var building = this.get('buildingValue');
							var mainWindow = window.MAIN_WINDOW;
							var floorObj = {
								floor : {
									id: mainWindow.FLOOR_NAV_FLOOR_ALL_ID,
									value: mainWindow.FLOOR_NAV_FLOOR_ALL,
									type: null
								},
								building : {
									id : building.id,
									value : building.name
								}
							};
							//메뉴 url 세팅
							options.menuUrl = '/operation/schedule';
							//선택 빌딩, 전체 층으로 현재 사이드바 빌딩 값 세팅.
							mainWindow.setCurrentFloor(floorObj);
							widget.moveMenu();
						},
						handleClickChartArea: function(e) {
							this.gotoDeviceMenu();
						},
						handleClickTableDataArea: function(e) {
							this.gotoDeviceMenu();
						},
						gotoDeviceMenu: function() {
							var widget = this.thisOptions.widget;
							var options = widget.options;
							var building = this.get('buildingValue');
							var mainWindow = window.MAIN_WINDOW;
							var floorObj = {
								floor : {
									id: mainWindow.FLOOR_NAV_FLOOR_ALL_ID,
									value: mainWindow.FLOOR_NAV_FLOOR_ALL,
									type: null
								},
								building : {
									id : building.id,
									value : building.name
								}
							};

							//메뉴 url 세팅
							options.menuUrl = '/device';
							//메뉴 탭, 뷰타입 세팅.
							window.localStorage.setItem("deviceTypeTab", "AirConditioner.Indoor");
							window.localStorage.setItem("deviceViewType", "STATISTIC");
							//선택 빌딩, 전체 층으로 현재 사이드바 빌딩 값 세팅.
							mainWindow.setCurrentFloor(floorObj);
							widget.moveMenu();
						},
						handleClickApplyBtn: function(e) {
							var self = this;
							var selectedBuildingId = this.get('buildingValue').id;
							var selectedBuildingName = this.get('buildingValue').name;
							var options = this.thisOptions;
							var widget = options.widget;
							var url = "/dms/devices/statisticView/AirConditioner?foundation_space_buildings_id=" + selectedBuildingId + "&exposeFloors=false";
							options.setRefreshUrl(url);

							options.widget.element.attr("data-message", selectedBuildingId + "/" + selectedBuildingName);
							options.widget.trigger("onPin");

							widget.refresh().always(function(){
								self.set('invisibleDropDown', true);
								self.set('invisibleGraph', false);
							});
						},
						numberOfSchedules: "-",
						chartData: [],
						tableData: {
							numberOfOnIndoorDevices: "-",
							numberOfOffIndoorDevices: "-",
							numberOfCriticalDevices: "-",
							numberOfWarningDevices: "-"
						}
					},
					setRefreshUrl : function(url){
						this.refreshUrl = url;
					},
					parseData : function(data){
						var viewModel = this.viewModel;
						var widget = this.widget;
						var selectedBuildingName = viewModel.buildingValue.name;
						// console.info(data);

						//타이틀 빌딩 명으로 세팅.
						widget.titleElem.text(selectedBuildingName);

						//데이터가 없는 경우,
						if(data.length === 0) {
							return;
						}
						//텍스트 데이터 (스케줄) 세팅.
						viewModel.set('numberOfSchedules', typeof data[0].numberOfSchedules === "undefined" || data[0].numberOfSchedules === null ? "-" : data[0].numberOfSchedules);

						//테이블 데이터 세팅.
						viewModel.set('tableData.numberOfOnIndoorDevices', typeof data[0].numberOfOnIndoorDevices === "undefined" || data[0].numberOfOnIndoorDevices === null ? "-" : data[0].numberOfOnIndoorDevices);
						viewModel.set('tableData.numberOfOffIndoorDevices', typeof data[0].numberOfOffIndoorDevices === "undefined" || data[0].numberOfOffIndoorDevices === null ? "-" : data[0].numberOfOffIndoorDevices);
						viewModel.set('tableData.numberOfCriticalDevices', typeof data[0].numberOfCriticalDevices === "undefined" || data[0].numberOfCriticalDevices === null ? "-" : data[0].numberOfCriticalDevices);
						viewModel.set('tableData.numberOfWarningDevices', typeof data[0].numberOfWarningDevices === "undefined" || data[0].numberOfWarningDevices === null ? "-" : data[0].numberOfWarningDevices);

						//차트 세팅.
						this.setChart();
					},
					setChart : function(){
						var chartElem = this.widget.bodyElem.find('.chart-wrapper')[0];
						var onStackElem = $(chartElem).find('.on-stack')[0];
						var offStackElem = $(chartElem).find('.off-stack')[0];
						var criticalStackElem = $(chartElem).find('.critical-stack')[0];
						var warningStackElem = $(chartElem).find('.warning-stack')[0];
						var tableData = this.viewModel.tableData;
						var totalCount = 0;
						var i, tableDataCountArray = [tableData.numberOfOnIndoorDevices, tableData.numberOfOffIndoorDevices, tableData.numberOfCriticalDevices, tableData.numberOfWarningDevices];
						var stackElems = [onStackElem, offStackElem, criticalStackElem, warningStackElem];
						var ratio = 0;

						// on, off, critical, warning 총합계.
						for( i = 0; i < tableDataCountArray.length; i++ ) {
							if(tableDataCountArray[i] === "-") {
								totalCount += 0;
							} else {
								totalCount += tableDataCountArray[i];
							}
						}

						// bar 차트 스택별 너비 세팅.
						for( i = 0; i < tableDataCountArray.length; i++ ) {
							if(tableDataCountArray[i] === "-") {
								ratio = 0;
							} else {
								ratio = tableDataCountArray[i] / totalCount * 100;
							}
							$(stackElems[i]).css({'width': ratio + "%"});
						}
					}
				}
			]
		},
		memo : {
			title : "DASHBOARD_MEMO",
			cards : [
				{
					refreshOption : false,
					width : 2,
					height : 6,
					//refreshUrl : "/dms/devices?types=AirConditioner.*&attributes=representativeStatus&registrationStatuses=Registered",
					//menuUrl : "/device/allview",
					template : '<div class="dashboard-body-content dashboard-memo-2x6"><div class="dashboard-memo-input" data-bind="invisible : invisibleMemo"><textarea id="memo-content" class="k-input" data-role="commonvalidator" data-type="description"></textarea></div><div class="dashboard-memo-display" data-bind="invisible: invisibleDisplay"><p data-bind="text: memoContents"></p></div></div>',
					init : function(){
						var self = this;
						var widget = self.widget;
						var element = widget.element;
						element.find("#memo-content").on("change", this.viewModel.changeContent.bind(this.viewModel));

						var msg = widget.element.data("message");
						//Click 시, 편집 모드 진입
						element.find(".dashboard-body-content").off("click").on("click", function(){
							var isEditable = self.viewModel.get("isEditable");
							if(!isEditable){
								var memoElem = $(this).find("#memo-content");
								var memoContents = self.viewModel.get("memoContents");
								memoElem.val(memoContents);
								self.viewModel.set("invisibleMemo", false);
								self.viewModel.set("invisibleDisplay", true);
								self.viewModel.set("isEditable", true);
							}
						});
						if(msg){
							this.viewModel.set("memoContents", msg);
							this.viewModel.set("invisibleMemo", true);
							this.viewModel.set("invisibleDisplay", false);
							this.viewModel.set("isEditable", false);
						}
					},
					viewModel : {
						invisibleMemo : false,
						invisibleDisplay : true,
						memoContents : "",
						isEditable : false,
						changeContent : function(){
							// console.log("change memo");
							// console.log(e);
							//Save
							var options = this.thisOptions;
							var widget = options.widget;
							var element = widget.element;
							var memoElem = element.find("#memo-content");
							var msg = memoElem.val();
							// console.log(msg);
							this.set("memoContents", msg);
							this.set("invisibleMemo", true);
							this.set("invisibleDisplay", false);
							this.set("isEditable", false);
							options.widget.element.attr("data-message", msg);
							options.widget.trigger("onPin");
						}
					},
					parseData : function(){}
				}
			]
		},
		outdoorTemperature : {
			title : "DASHBOARD_OUTDOOR_TEMPERATURE",
			cards : [
				{
					width : 2,
					height : 2,
					refreshUrl : "/energy/temperature/average",
					//refreshUrl : "/energy/algorithm-summary",
					menuUrl : "",
					template : "<div class='dashboard-body-content dashboard-outdoor-2x2'><div class='dashboard-outdoor-2x2-label'><p class='key'>#=sensor#</p></div><div class='dashboard-outdoor-2x2-value'><span class='unit temp' data-bind='text:unit'></span><p class='value' data-bind='text : value'></p></div></div>",
					localeTemplateData : {
						sensor : "DASHBOARD_TEMPERATURE_SENSOR"
					},
					mockDatas : {
						"type" : "outdoor temperature",
						"degrees": 27
					},
					viewModel : {
						value : 0,
						unit : "°C"
					},
					parseData : function(data){
						var Settings = window.GlobalSettings;
						var tempOpt = Settings.getTemperature();
						var unitChar = Util.CHAR[tempOpt.unit];
						this.viewModel.set("unit", unitChar);
						var degrees = data.degrees || data.temperature;
						if(typeof degrees !== "undefined"){
							if(degrees == "" || degrees === null){
								degrees = "-";
							}
							this.viewModel.set("value", degrees);
						}else{
							degrees = "-";
							this.viewModel.set("value", degrees);
							//this.viewModel.set("value", this.mockDatas.degrees);
						}
					}
				}
			]
		},
		outdoorHumidity : {
			title : "DASHBOARD_OUTDOOR_HUMIDITY",
			cards : [
				{
					width : 2,
					height : 2,
					refreshUrl : "/energy/humidity/average",
					//refreshUrl : "/energy/algorithm-summary",
					menuUrl : "",
					template : "<div class='dashboard-body-content dashboard-outdoor-2x2'><div class='dashboard-outdoor-2x2-label'><p class='key'>#=sensor#</p></div><div class='dashboard-outdoor-2x2-value'><span class='unit humi' data-bind='text:unit'></span><p class='value' data-bind='text : value'></p></div></div>",
					localeTemplateData : {
						sensor : "DASHBOARD_HUMIDITY_SENSOR"
					},
					mockDatas : {
						"humidity" : 10
					},
					viewModel : {
						value : 0,
						unit : "%"
					},
					parseData : function(data){
						var humidity = data.humidity;
						if(typeof humidity !== "undefined"){
							if(humidity == "" || humidity === null){
								humidity = "-";
							}
							this.viewModel.set("value", humidity);
						}else{
							humidity = "-";
							//this.viewModel.set("value", this.mockDatas.humidity);
							this.viewModel.set("value", humidity);
						}
					}
				}
			]
		},
		outdoorTempHumidity : {
			title : "DASHBOARD_OUTDOOR_TEMPERATURE_AND_HUMIDITY",
			cards : [
				{
					width : 2,
					height : 2,
					refreshUrl : "",
					menuUrl : "",
					template : "<div class='dashboard-body-content dashboard-alarm-log-2x2 outdoor'><div class='row'><div class='dashboard-alarm-log-2x2-label'><p class='key'>#=tempSensor#</p></div><div class='dashboard-alarm-log-2x2-value'><span class='value unit temp' data-bind='text: tempUnit'></span><p class='value critical' data-bind='text : tempValue'></p></div></div><div class='row'><div class='dashboard-alarm-log-2x2-label'><p class='key'>#=humiSensor#</p></div><div class='dashboard-alarm-log-2x2-value'><span class='value unit humi' data-bind='text: humiUnit'></span><p class='value warning' data-bind='text : humiValue'></p></div></div></div>",
					localeTemplateData : {
						tempSensor : "DASHBOARD_TEMPERATURE_SENSOR",
						humiSensor : "DASHBOARD_HUMIDITY_SENSOR"
					},
					viewModel : {
						humiValue : 0,
						humiUnit : "%",
						tempValue : 0,
						tempUnit : "°C"
					},
					tempMockData : {
						"type" : "outdoor temperature",
						"degrees": 27
					},
					humiMockData : {
						"humidity" : 10
					},
					init : function(){
						var options = this.widget.options;
						options.refreshFunc = this.refreshFunc.bind(this);
						var Settings = window.GlobalSettings;
						var tempOpt = Settings.getTemperature();
						var unitChar = Util.CHAR[tempOpt.unit];
						this.viewModel.set("tempUnit", unitChar);
					},
					refreshFunc : function(){
						var widget = this.widget;
						var self = this;
						widget.loading.open(widget.element);
						var reqArr = [];
						reqArr.push($.ajax({
							url : "/energy/temperature/average"
						}).done(function(temper){
							widget.bodyElem.find(".dashboard-error-panel").remove();
							var degrees = temper.degrees || temper.temperature;
							if(typeof degrees !== "undefined"){
								if(degrees == "" || degrees === null){
									degrees = "-";
								}
								self.viewModel.set("tempValue", degrees);
							}else{
								self.viewModel.set("tempValue", "-");
							}
						}).fail(function(xhq){
							//Mock Data
							/*var temper = self.tempMockData;
							if(temper.degrees !== undefined){
								self.viewModel.set("tempValue", temper.degrees);
							}*/
							widget.responseFailCallback(xhq);
						}));
						reqArr.push($.ajax({
							url : "/energy/humidity/average"
						}).done(function(humi){
							widget.bodyElem.find(".dashboard-error-panel").remove();
							if(typeof humi.humidity !== "undefined"){
								if(humi.humidity == "" || humi.humidity === null){
									humi.humidity = "-";
								}
								self.viewModel.set("humiValue", humi.humidity);
							}else{
								self.viewModel.set("humiValue", "-");
							}
						}).fail(function(xhq){
							/*var humi = self.humiMockData;
							if(humi.humidity !== undefined){
								self.viewModel.set("humiValue", humi.humidity);
							}*/
							widget.responseFailCallback(xhq);
						}));

						return $.when.apply(this, reqArr).always(function(){
							widget.loading.close();
						});
					},
					parseData : function(){

					}
				}
			]
		},
		usedTimeTopFive : {
			title : "DASHBOARD_USED_TIME_TOP_5_OF_DAY",
			cards : [
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 4,
					height : 4,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/operatingHistory/operationTime/todayTop5",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-energy-list-4x4'><ul class='dataList'><li class='head'><div class='tbc num'><span></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span>#=deviceName#</span></div>" +
						"<div class='tbc loc'><span>#=location#</span></div>" +
						"<div class='tbc time'><span>#=usedTime#</span></div></li>" +
					"<div data-template='dashboard-energy-list-ul-template' data-bind='source: list' class='dashboard-energy-list'></div></ul><script id='dashboard-energy-list-ul-template' type='text/x-kendo-template'>" +
						"<li><div class='tbc num'><span data-bind='text: rank'></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span data-bind='text: deviceName'></span></div>" +
						"<div class='tbc loc'><span data-bind='text:location'></span></div>" +
						"<div class='tbc time'><span data-bind='text:usedTime'></span></div></li></script>",
					localeTemplateData : {
						location : "FACILITY_HISTORY_LOCATION",
						usedTime : "DASHBOARD_USED_TIME",
						deviceName : "FACILITY_DEVICE_DEVICE_NAME"
					},
					listMockData : [{
						"rank": "1",
						"deviceName": "device1",
						"location": "30F, A Zone",
						"usedTime": "12:12"
					},
					{
						"rank": "2",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "3",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "4",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "5",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					}],
					viewModel : {
						list : []
					},
					parseData : function(data){
						if(data.top5UsedTime){
							data = data.top5UsedTime;
						}else{
							//data = this.listMockData;
							data = [];
						}
						this.viewModel.set("list", data);
					},
					onMoveMenu : function(){
						//메뉴 이동 후 드롭다운 리스트 선텍
						window.localStorage.setItem("dashboardEnergyCategory", "operationTime");
					}
				},
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 4,
					height : 6,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/operatingHistory/operationTime/todayTop5",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-energy-list-4x4'><div class='top-five-bar-graph-wrapper'><div class='graph-y-unit'>(#=hour#)</div><div data-role='chart' class='top-five-bar-graph' style='height:#=height#;' data-series-defaults='#=seriesDefault#' data-series='#=series#' data-chart-area='#=chartArea#' data-value-axis='#=valueAxis#' data-category-axis='#=categoryAxis#' data-bind='source:chartList' data-legend='#=legend#'></div></div><ul class='dataList'><li class='head'><div class='tbc num'><span></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span>#=deviceName#</span></div>" +
						"<div class='tbc loc'><span>#=location#</span></div>" +
						"<div class='tbc time'><span>#=usedTime#</span></div></li>" +
					"<div data-template='dashboard-energy-list-ul-template' data-bind='source: list' class='dashboard-energy-list'></div></ul><script id='dashboard-energy-list-ul-template' type='text/x-kendo-template'>" +
						"<li><div class='tbc num'><span data-bind='text: rank'></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span data-bind='text: deviceName'></span></div>" +
						"<div class='tbc loc'><span data-bind='text:location'></span></div>" +
						"<div class='tbc time'><span data-bind='text:usedTime'></span></div></li></script>",
					localeTemplateData : {
						location : "FACILITY_HISTORY_LOCATION",
						usedTime : "DASHBOARD_USED_TIME",
						deviceName : "FACILITY_DEVICE_DEVICE_NAME",
						hour : "DASHBOARD_HOUR"
					},
					templateData : {
						height : "158px",
						legend : '{visible:false}',
						seriesDefault : '{type:\"column\", axis:\"usedTime\", categoryAxis:\"topFive\",color:\"rgb(0, 129, 198)\",overlay:{ gradient : \"none\"}, border:{width:0}, spacing:0.1,gap:2.5}',
						chartArea : '{background:\"#f7f7f7\"}',
						series : '[{field:\"usedTime\", name:\"Used Time\"}]',
						valueAxis : '[{ name : \"usedTime\", min : 0, max : 25, line: {visible:false}}]',
						categoryAxis : '[{name :\"topFive\", majorGridLines : {visible:false}, minorGridLines : {visible : false}, line: {visible:false}, majorUnit:5}]'
					},
					listMockData : [{
						"rank": "1",
						"deviceName": "device1",
						"location": "30F, A Zone",
						"usedTime": "12:12"
					},
					{
						"rank": "2",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "3",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "4",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "5",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					}],
					viewModel : {
						list : [],
						chartList : []
					},
					parseData : function(data){
						if(data.top5UsedTime){
							data = data.top5UsedTime;
						}else{
							//data = this.listMockData;
							data = [];
						}

						this.viewModel.set("list", data);
						var i, time, max = data.length;
						for( i = 0; i < max; i++ ){
							time = data[i].usedTime;
							data[i].usedTime = this.parseMinToHour(time);
						}
						this.viewModel.set("chartList", data);
					},
					parseMinToHour : function(time){
						var split;
						if(time){
							split = time.split(":");
							return split[0];
						}
						return 0;
					},
					onMoveMenu : function(){
						//메뉴 이동 후 드롭다운 리스트 선텍
						window.localStorage.setItem("dashboardEnergyCategory", "operationTime");
					}
				},
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 2,
					height : 6,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/operatingHistory/operationTime/todayTop5",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-energy-list-4x4'><div class='top-five-bar-graph-wrapper'><div class='graph-y-unit'>(#=hour#)</div><div data-role='chart' class='top-five-bar-graph' style='height:#=height#;' data-series-defaults='#=seriesDefault#' data-series='#=series#' data-chart-area='#=chartArea#' data-value-axis='#=valueAxis#' data-category-axis='#=categoryAxis#' data-bind='source:chartList' data-legend='#=legend#'></div></div><ul class='dataList'><li class='head'>" +
						"<div class='tbc dvc' style='width:24.4%'><span>#=deviceName#</span></div></li>" +
					"<div data-template='dashboard-energy-list-ul-min-time-template' data-bind='source: list' class='dashboard-energy-list'></div></ul><script id='dashboard-energy-list-ul-min-time-template' type='text/x-kendo-template'>" +
						"<li><div class='tbc num'><span data-bind='text: rank'></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span data-bind='text: deviceName'></span></div></li></script>",
					localeTemplateData : {
						location : "FACILITY_HISTORY_LOCATION",
						usedTime : "DASHBOARD_USED_TIME",
						deviceName : "FACILITY_DEVICE_DEVICE_NAME",
						hour : "DASHBOARD_HOUR"
					},
					templateData : {
						height : "158px",
						legend : '{visible:false}',
						seriesDefault : '{type:\"column\", axis:\"usedTime\", categoryAxis:\"topFive\",color:\"rgb(0, 129, 198)\",overlay:{ gradient : \"none\"}, border:{width:0}, spacing:0.1,gap:2.5}',
						chartArea : '{background:\"#f7f7f7\"}',
						series : '[{field:\"usedTime\", name:\"Used Time\"}]',
						valueAxis : '[{ name : \"usedTime\", min : 0, max : 25, line: {visible:false}}]',
						categoryAxis : '[{name :\"topFive\", majorGridLines : {visible:false}, minorGridLines : {visible : false}, line: {visible:false}, majorUnit:5}]'
					},
					listMockData : [{
						"rank": "1",
						"deviceName": "device1",
						"location": "30F, A Zone",
						"usedTime": "12:12"
					},
					{
						"rank": "2",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "3",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "4",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					},
					{
						"rank": "5",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"usedTime": "15:12"
					}],
					viewModel : {
						list : [],
						chartList : []
					},
					parseData : function(data){
						if(data.top5UsedTime){
							data = data.top5UsedTime;
						}else{
							//data = this.listMockData;
							data = [];
						}

						this.viewModel.set("list", data);
						var i, time, max = data.length;
						for( i = 0; i < max; i++ ){
							time = data[i].usedTime;
							data[i].usedTime = this.parseMinToHour(time);
						}
						this.viewModel.set("chartList", data);
					},
					parseMinToHour : function(time){
						var split;
						if(time){
							split = time.split(":");
							return split[0];
						}
						return 0;
					},
					onMoveMenu : function(){
						//메뉴 이동 후 드롭다운 리스트 선텍
						window.localStorage.setItem("dashboardEnergyCategory", "operationTime");
					}
				}
			]
		},
		amountTopFive : {
			title : "DASHBOARD_AMOUNT_TOP_5_OF_DAY",
			cards : [
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 4,
					height : 4,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/operatingHistory/powerGasUsage/todayTop5",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-energy-list-4x4'><ul class='dataList'><li class='head'><div class='tbc num'><span></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span>#=deviceName#</span></div>" +
						"<div class='tbc loc'><span>#=location#</span></div>" +
						"<div class='tbc amount'><span>#=amount# (kWh)</span></div></li>" +
					"<div data-template='dashboard-energy-list-ul-amount-template' data-bind='source: list' class='dashboard-energy-list'></div></ul><script id='dashboard-energy-list-ul-amount-template' type='text/x-kendo-template'>" +
						"<li><div class='tbc num'><span data-bind='text: rank'></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span data-bind='text: deviceName'></span></div>" +
						"<div class='tbc loc'><span data-bind='text:location'></span></div>" +
						"<div class='tbc time'><span data-bind='text:amount'></span></div></li></script>",
					localeTemplateData : {
						location : "FACILITY_HISTORY_LOCATION",
						deviceName : "FACILITY_DEVICE_DEVICE_NAME",
						amount : "DASHBOARD_AMOUNT"
					},
					listMockData : [{
						"rank": "1",
						"deviceName": "device1",
						"location": "30F, A Zone",
						"amount": "354100"
					},
					{
						"rank": "2",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "3",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "4",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "5",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					}],
					viewModel : {
						list : []
					},
					parseData : function(data){
						if(data.top5PowerAmount){
							data = data.top5PowerAmount;
						}else{
							//data = this.listMockData;
							data = [];
						}
						this.setFormat(data);
						this.viewModel.set("list", data);
					},
					setFormat : function(list){
						var i, val, max = list.length;
						for( i = 0; i < max; i++ ){
							val = list[i].amount;
							val = Number(val);
							list[i].amount = kendo.toString(val, "n0");
						}
					},
					onMoveMenu : function(){
						//메뉴 이동 후 드롭다운 리스트 선텍
						window.localStorage.setItem("dashboardEnergyCategory", "powerGasUsage");
					}
				},
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 4,
					height : 6,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/operatingHistory/powerGasUsage/todayTop5",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-energy-list-4x4'><div class='top-five-bar-graph-wrapper'><div class='graph-y-unit' style='float: right;padding-right: 527px;'>(kWh)</div><div data-role='chart' class='top-five-bar-graph' style='height:#=height#; margin-bottom:12px;' data-series-defaults='#=seriesDefault#' data-series='#=series#' data-chart-area='#=chartArea#' data-value-axis='#=valueAxis#' data-category-axis='#=categoryAxis#' data-bind='source:list' data-legend='#=legend#'></div></div><ul class='dataList'><li class='head'><div class='tbc num'><span></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span>#=deviceName#</span></div>" +
						"<div class='tbc loc'><span>#=location#</span></div>" +
						"<div class='tbc amount'><span>#=amount# (kWh)</span></div></li>" +
					"<div data-template='dashboard-energy-list-ul-amount-template' data-bind='source: list' class='dashboard-energy-list'></div></ul><script id='dashboard-energy-list-ul-amount-template' type='text/x-kendo-template'>" +
						"<li><div class='tbc num'><span data-bind='text: rank'></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span data-bind='text: deviceName'></span></div>" +
						"<div class='tbc loc'><span data-bind='text:location'></span></div>" +
						"<div class='tbc time'><span data-bind='text:amount'></span></div></li></script>",
					localeTemplateData : {
						location : "FACILITY_HISTORY_LOCATION",
						deviceName : "FACILITY_DEVICE_DEVICE_NAME",
						amount : "DASHBOARD_AMOUNT"
					},
					templateData : {
						height : "158px",
						legend : '{visible:false}',
						seriesDefault : '{type:\"column\", axis:\"amount\", categoryAxis:\"topFive\",color:\"rgb(0, 129, 198)\",overlay:{ gradient : \"none\"}, border:{width:0}, spacing:0.1,gap:2.5}',
						chartArea : '{background:\"#f7f7f7\"}',
						series : '[{field:\"amount\", name:\"Amount (kWh)\"}]',
						valueAxis : '[{ name : \"amount\", min : 0, max : 50000, line: {visible:false}}]',
						categoryAxis : '[{name :\"topFive\", majorGridLines : {visible:false}, minorGridLines : {visible : false}, line: {visible:false}}]'
					},
					listMockData : [{
						"rank": "1",
						"deviceName": "device1",
						"location": "30F, A Zone",
						"amount": "500000"
					},
					{
						"rank": "2",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "3",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "4",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "5",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					}],
					viewModel : {
						list : []
					},
					parseData : function(data){
						if(data.top5PowerAmount){
							data = data.top5PowerAmount;
						}else{
							data = [];
						}

						var val, maxValue = 0, i, max = data.length;
						for( i = 0; i < max; i++ ){
							val = data[i].amount;
							if(!isNaN(val)){
								val = Number(val);
								if(maxValue < val){
									maxValue = val;
								}
							}
						}
						maxValue = maxValue * 1.2;
						if(maxValue == 0){
							maxValue = 1;
						}
						var majorUnit = maxValue / 5;
						majorUnit = Util.getChartOptionsForFiveChartSection(maxValue, 0).newMajorUnit;
						maxValue = Util.getChartOptionsForFiveChartSection(maxValue, 0).newMax;
						var chart = this.widget.element.find(".top-five-bar-graph").data("kendoChart");
						chart.setOptions({
							valueAxis : [
								{ name : "amount", min : 0, max : maxValue,
									line:{visible : false}, minorGridLines:{visible : false},
									majorUnit:majorUnit}
							]
						});
						this.viewModel.set("list", data);
					},
					onMoveMenu : function(){
						//메뉴 이동 후 드롭다운 리스트 선텍
						window.localStorage.setItem("dashboardEnergyCategory", "powerGasUsage");
					}
				},
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 2,
					height : 6,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/operatingHistory/powerGasUsage/todayTop5",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-energy-list-4x4'><div class='top-five-bar-graph-wrapper'><div class='graph-y-unit' style='float: right;padding-right: 209px;'>(kWh)</div><div data-role='chart' class='top-five-bar-graph' style='height:#=height#; margin-bottom:12px;' data-series-defaults='#=seriesDefault#' data-series='#=series#' data-chart-area='#=chartArea#' data-value-axis='#=valueAxis#' data-category-axis='#=categoryAxis#' data-bind='source:list' data-legend='#=legend#'></div></div><ul class='dataList'><li class='head'>" +
						"<div class='tbc dvc' style='width:24.4%'><span>#=deviceName#</span></div></li>" +
					"<div data-template='dashboard-energy-list-ul-amount-min-template' data-bind='source: list' class='dashboard-energy-list'></div></ul><script id='dashboard-energy-list-ul-amount-min-template' type='text/x-kendo-template'>" +
						"<li><div class='tbc num'><span data-bind='text: rank'></span></div>" +
						"<div class='tbc dvc' style='width:24.4%'><span data-bind='text: deviceName'></span></div></li></script>",
					localeTemplateData : {
						location : "FACILITY_HISTORY_LOCATION",
						deviceName : "FACILITY_DEVICE_DEVICE_NAME",
						amount : "DASHBOARD_AMOUNT"
					},
					templateData : {
						height : "158px",
						legend : '{visible:false}',
						seriesDefault : '{type:\"column\", axis:\"amount\", categoryAxis:\"topFive\",color:\"rgb(0, 129, 198)\",overlay:{ gradient : \"none\"}, border:{width:0}, spacing:0.1,gap:2.5}',
						chartArea : '{background:\"#f7f7f7\"}',
						series : '[{field:\"amount\", name:\"Amount (kWh)\"}]',
						valueAxis : '[{ name : \"amount\", min : 0, max : 50000, line: {visible:false}}]',
						categoryAxis : '[{name :\"topFive\", majorGridLines : {visible:false}, minorGridLines : {visible : false}, line: {visible:false}}]'
					},
					listMockData : [{
						"rank": "1",
						"deviceName": "device1",
						"location": "30F, A Zone",
						"amount": "500000"
					},
					{
						"rank": "2",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "3",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "4",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					},
					{
						"rank": "5",
						"deviceName": "device2",
						"location": "14F, B Zone",
						"amount": "354100"
					}],
					viewModel : {
						list : []
					},
					parseData : function(data){
						if(data.top5PowerAmount){
							data = data.top5PowerAmount;
						}else{
							data = [];
						}

						var val, maxValue = 0, i, max = data.length;
						for( i = 0; i < max; i++ ){
							val = data[i].amount;
							if(!isNaN(val)){
								val = Number(val);
								if(maxValue < val){
									maxValue = val;
								}
							}
						}
						maxValue = maxValue * 1.2;
						if(maxValue == 0){
							maxValue = 1;
						}
						var majorUnit = maxValue / 5;
						majorUnit = Util.getChartOptionsForFiveChartSection(maxValue, 0).newMajorUnit;
						maxValue = Util.getChartOptionsForFiveChartSection(maxValue, 0).newMax;
						var chart = this.widget.element.find(".top-five-bar-graph").data("kendoChart");
						chart.setOptions({
							valueAxis : [
								{ name : "amount", min : 0, max : maxValue,
									line:{visible : false}, minorGridLines:{visible : false},
									majorUnit:majorUnit}
							]
						});
						this.viewModel.set("list", data);
					},
					onMoveMenu : function(){
						//메뉴 이동 후 드롭다운 리스트 선텍
						window.localStorage.setItem("dashboardEnergyCategory", "powerGasUsage");
					}
				}
			]
		},
		energyLossTopFive : {
			title : "DASHBOARD_ENERGY_LOSS_TOP_5",
			cards : [
				{
					refreshOption : {
						timeout : 3600000
					},
					width : 4,
					height : 4,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/energyLossDetection/today?attributes=top5EnergyLoss",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-energy-list-4x4'><ul class='dataList'><li class='head'><div class='tbc num'><span></span></div>" +
						"<div class='tbc energy' style='width:43.5%'><span>#=lossName#</span></div>" +
						"<div class='tbc dvc'><span>#=deviceName#</span></div>" +
						"<div class='tbc count'><span>#=count#</span></div></li>" +
					"<div data-template='dashboard-energy-list-ul-loss-template' data-bind='source: list' class='dashboard-energy-loss-list'></div></ul><script id='dashboard-energy-list-ul-loss-template' type='text/x-kendo-template'>" +
						"<li><div class='tbc num'><span data-bind='text: rank'></span></div>" +
						"<div class='tbc energy' style='width:43.5%'><span data-bind='text: name'></span></div>" +
						"<div class='tbc dvc'><span data-bind='text:deviceName'></span></div>" +
						"<div class='tbc count'><span data-bind='text:count'></span></div></li></script>",
					localeTemplateData : {
						lossName : "ENERGY_ENERGY_LOSS_NAME",
						count : "ENERGY_COUNT",
						location : "FACILITY_HISTORY_LOCATION",
						deviceName : "FACILITY_DEVICE_DEVICE_NAME"
					},
					listMockData : [
						{ "rank": 1, "name" : "LongTimeOperation", "deviceId" : "11.01.00",  "deviceName": "device1",  "count": 10 },
						{ "rank": 2, "name" : "RepetitiveControl", "deviceId" : "11.01.00",  "deviceName": "device2",  "count": 9 },
						{ "rank": 3, "name" : "AbnormalSetTemp", "deviceId" : "11.01.00",  "deviceName": "device3",  "count": 8 },
						{ "rank": 4, "name" : "AbnormalRoomTemp", "deviceId" : "11.01.00",  "deviceName": "device4",  "count": 10 },
						{ "rank": 5, "name" : "LoadVariation", "deviceId" : "11.01.00",  "deviceName": "device1",  "count": 10 }
					],
					viewModel : {
						list : []
					},
					onMoveMenu : function(){
						window.localStorage.setItem("dashboardShortcut", "energylossdetection");
					},
					parseData : function(data){
						if(data.top5EnergyLosses){
							data = data.top5EnergyLosses;
						}else{
							data = [];
						}
						//data = this.listMockData;
						this.setFormat(data);
						this.viewModel.set("list", data);
					},
					setFormat : function(list){
						var I18N = window.I18N;
						var i, name, val, max = list.length;
						list.sort(function(a, b){
							return a.rank - b.rank;
						});

						for( i = 0; i < max; i++ ){
							val = list[i].count;
							val = Number(val);
							list[i].count = kendo.toString(val, "n0");
							name = list[i].name;
							if(name == "InsufficientInsulation"){
								name = I18N.prop("ENERGY_INSUFFICIENT_INSULATION");
							}else if(name == "LoadVariation"){
								name = I18N.prop("ENERGY_LOAD_VARIATION");
							}else if(name == "AbnormalSetTemp"){
								name = I18N.prop("ENERGY_ABNORMAL_SET_TEMP");
							}else if(name == "AbnormalRoomTemp"){
								name = I18N.prop("DASHBOARD_ABNORMAL_ROOM_TEMP");
							}else if(name == "LongTimeOperation"){
								name = I18N.prop("ENERGY_LONG_TIME_OPERATION");
							}else if(name == "RepetitiveControl"){
								name = I18N.prop("ENERGY_REPETITIVE_CONTROL");
							}else if(name == "OverTimeOperation"){
								name = I18N.prop("ENERGY_OVER_TIME_OPERATION");
							}
							list[i].name = name;
						}
					}
				}
			]
		},
		averageUsedTime : {
			title : "DASHBOARD_AVERAGE_USED_TIME",
			cards : [
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 4,
					height : 4,
					//refreshUrl : "/energy/algorithm-summary",
					refreshUrl : "/energy/sac/operatingHistory/operationTime/average",
					menuUrl : "/energy/samsungsac",
					template : "<div class='dashboard-body-content dashboard-average-used usage'><div class='simpleDataBox'><div class='tbc labels'><p class='name'>#=time#</p><p class='subinfo'><span data-bind='text: time'>2016-08-25 07:00</span> #=based#</p></div><div class='tbc values'><span><span class='t-blue' data-bind='text: yesterdayAverage'>9</span><span class='unit lower'>#=hour#</span></span></div></div><div class='subDataList'><ul><li><p class='labels'>#=monthAverage#</p><p class='values'><strong data-bind='text:monthAverage'>8</strong><span>#=hour#<span></p></li><li><p class='labels'>#=estAverage#</p><p class='values'><strong data-bind='text:monthEstAverage'>10</strong><span>#=hour#</span></p></li></ul></div></div>",
					localeTemplateData : {
						based : "DASHBOARD_BASED",
						estAverage : "DASHBOARD_ESTIMATED_MONTHLY_AVERAGE_USED_TIME",
						monthAverage : "DASHBOARD_MONTHLY_AVERAGE_USED_TIME",
						time : "DASHBOARD_YESTERDAY",
						hour : "DASHBOARD_HOUR"
					},
					avgMockData : {
					   "responseTime": moment().format("YYYY-MM-DD HH:mm").replace(/\./g, "-"),
					   "average" : {  "yesterday" :  9 , "monthly": 8, "estMonthly" : 10}
					},
					viewModel : {
						time : moment().format("YYYY-MM-DD HH:mm").replace(/\./g, "-"),
						yesterdayAverage : 0,
						monthAverage : 0,
						monthEstAverage : 0,
						unit : "Hours"
					},
					parseData : function(data){
						var time, average, yesterdayAverage, monthAverage, monthEstAverage;
						time = data.responseTime;
						this.viewModel.set("time", time);

						average = data.average ? data.average : this.avgMockData.average;
						yesterdayAverage = typeof average.yesterday !== "undefined" ? average.yesterday : "-";
						monthAverage = typeof average.monthly !== "undefined" ? average.monthly : "-";
						monthEstAverage = typeof average.estMonthly !== "undefined" ? average.estMonthly : "-";

						this.viewModel.set("yesterdayAverage", yesterdayAverage);
						this.viewModel.set("monthAverage", monthAverage);
						this.viewModel.set("monthEstAverage", monthEstAverage);
						var I18N = window.I18N;
						this.viewModel.set("unit", I18N.prop("COMMON_HOURS"));
					},
					onMoveMenu : function(){
						//메뉴 이동 후 드롭다운 리스트 선텍
						window.localStorage.setItem("dashboardEnergyCategory", "operationTime");
					}
				}
			]
		},
		meterAverageUsage : {
			title : "DASHBOARD_AVERAGE_USAGE",
			cards : [
				{
					refreshOption : {
						timeout : 3600000
					},
					width : 4,
					height : 4,
					//refreshUrl : "/energy/algorithm-summary",
					//refreshUrl : "/energy/sac/operatingHistory/operationTime/average",
					//menuUrl : "",
					template : "<div class='dashboard-body-content dashboard-average-used'><div class='average-dropdown' data-bind='invisible: invisibleDropdown'><div class='tbc'><div class='wrapper'><input data-role='dropdownlist' data-text-field='displayType' data-value-field='type' data-option-label='#=meterOptionLabel#' data-bind='source:meterTypeList, events:{change:changeType}, disabled:disabledMeter'/></div><div class='wrapper'><input class='group-check-dropdown' data-role='dropdowncheckbox' data-text-field='name' data-value-field='id' data-option-label='#=groupOptionLabel#' data-empty-text='#=noSelectText#' data-select-all-text='#=selectAllText#' data-bind='source:groupList, disabled:disabledGroup, events:{change:changeGroup, selectionChanged:selectedGroup}'/></div><div class='wrapper'><button class='k-button' data-bind='events:{click:clickApply}, disabled:disabledApply'>#=apply#</button></div></div></div>" +
					"<div class='average usage' data-bind='invisible: invisibleDisplay'><div class='simpleDataBox'><div class='tbc labels'><p class='name'>#=today#</p><p class='subinfo'><span data-bind='text: today'>2016-08-25 07:00</span> #=based#</p></div><div class='tbc values'><span class='t-blue'><span data-bind='text: todayAverage'>9</span><span class='unit lower' data-bind='text:unit'>#=hour#</span></span></div></div><div class='subDataList'><ul><li><p class='labels'>#=monthAverage#</p><p class='values'><strong data-bind='text:monthAverage'>8</strong><span data-bind='text:unit'>#=hour#<span></p></li><li><p class='labels'>#=estAverage#</p><p class='values'><strong data-bind='text:monthEstAverage'>10</strong><span data-bind='text:unit'>#=hour#</span></p></li></ul></div></div></div>",
					avgMockData : {
						"Meter.Gas" : {
							"time" : moment().format("YYYY-MM-DD HH:mm").replace(/\./g, "-"),
							"summary" : [
								{
									"dms_meter_type" : "Meter.Gas",
									"today" : 6375,
									"monthly" : 5412,
									"estMonthly": 6048,
									"unit" : "m3"
								}
							]
						},
						"Meter.Water" : {
							"time" : moment().format("YYYY-MM-DD HH:mm").replace(/\./g, "-"),
							"summary" : [
								{
									"dms_meter_type" : "Meter.Water",
									"today" : 6375,
									"monthly" : 5412,
									"estMonthly": 6048,
									"unit" : "L"
								}
							]
						},
						"Meter.WattHour" : {
							"time" : moment().format("YYYY-MM-DD HH:mm").replace(/\./g, "-"),
							"summary" : [
								{
									"dms_meter_type" : "Meter.WattHour",
									"today" : 6375,
									"monthly" : 5412,
									"estMonthly": 6048,
									"unit" : "kWh"
								}
							]
						}
					},
					localeTemplateData : {
						meterOptionLabel : "DASHBOARD_ALL_ENERGY_METER_TYPE",
						groupOptionLabel : "FACILITY_HISTORY_GROUP",
						noSelectText : "DASHBOARD_SELECT_GROUP",
						selectAllText : "DASHBOARD_ALL_GROUP",
						apply : "COMMON_BTN_APPLY",
						based : "DASHBOARD_BASED",
						estAverage : "DASHBOARD_ESTIMATED_MONTHLY_AVERAGE",
						monthAverage : "DASHBOARD_MONTHLY_AVERAGE",
						today : "DASHBOARD_TODAY",
						hour : "DASHBOARD_HOUR"
					},
					viewModel : {
						invisibleDropdown : false,
						invisibleDisplay : true,
						meterTypeList : [],
						meterType : null,
						disabledMeter : false,
						groupList : [],
						disabledGroup : true,
						disabledApply : true,
						today : moment().format("YYYY-MM-DD HH:mm").replace(/\./g, "-"),
						todayAverage : 0,
						monthAverage : 0,
						monthEstAverage : 0,
						unit : "kWh",
						groupIds : "",
						groupNames : "",
						changeType : function(e){
							var self = this;
							var options = self.thisOptions;
							var widget = options.widget;
							var element = widget.element;
							var groupElem = element.find(".group-check-dropdown").eq(1);
							var groupWidget = groupElem.data("kendoDropDownCheckBox");

							var selectedMeterType = e.sender.value();
							if(selectedMeterType){
								self.set("meterType", selectedMeterType);
								var loading = options.widget.loading;
								loading.open();
								$.ajax({
									url : "/dms/groups?dms_devices_types=" + selectedMeterType
								}).done(function(data){
									self.set("groupList", data);
									groupWidget.unselectAll();
									self.set("disabledApply", true);
									self.set("disabledGroup", data.length == 0);
								}).fail(function(){
									self.set("disabledGroup", true);
								}).always(function(){
									loading.close();
								});
							}else{
								self.set("disabledGroup", true);
								self.set("disabledApply", true);
							}
						},
						changeGroup : function(){

							// console.log("change group");
							//this.set("")
							// console.log(e.sender.value());
						},
						selectedGroup : function(e){
							// console.log("selectionChanged Event");
							// console.log(e);
							var values = e.newValue;
							if(!values || values.length < 1){
								this.set("disabledApply", true);
							}else{
								var groupList = this.get("groupList");
								var groupNames = "";
								var id, i, j, size = groupList.length, max = values.length;
								for( i = 0; i < max; i++ ){
									id = values[i];
									for( j = 0; j < size; j++ ){
										if(groupList[j].id == id){
											groupNames += groupList[j].name;
											break;
										}
									}
									if(i != max - 1 && groupNames != ""){
										groupNames += ", ";
									}
								}

								this.set("groupIds", values.join(","));
								this.set("groupNames", groupNames);
								this.set("disabledApply", false);
							}
						},
						clickApply : function(e){
							var self = this;
							var options = self.thisOptions;
							var widget = options.widget;
							//var url = "/dms/devices/statisticView/"+value+"?foundation_space_buildings_id=0";
							var groupIds = self.get("groupIds");
							var groupNames = self.get("groupNames");
							var meterType = self.get("meterType");
							var url = "/energy/consumption/summary?dms_meter_types=" + meterType + "&dms_group_ids=" + groupIds;
							options.refreshUrl = url;
							var averageType;
							var I18N = window.I18N;
							if(meterType == "Meter.WattHour"){
								averageType = I18N.prop("DASHBOARD_POWER_AVERAGE");
							}else if(meterType == "Meter.Gas"){
								averageType = I18N.prop("DASHBOARD_GAS_AVERAGE");
							}else if(meterType == "Meter.Water"){
								averageType = I18N.prop("DASHBOARD_WATER_AVERAGE");
							}
							var titleText = averageType + " > " + groupNames;
							options.widget.titleElem.text(titleText);
							var message = "/groupNames/" + groupNames + "/groupIds/" + groupIds + "/meterType/" + meterType + "/";

							if(!e.isSavedCard){
								options.widget.element.attr("data-message", message);
								options.widget.trigger("onPin");
							}

							widget.refresh().always(function(){
								self.set("invisibleDropdown", true);
								self.set("invisibleDisplay", false);
								options.menuUrl = "/energy/consumptionandtarget";
							});

							//options.widget.trigger("onChange");
							//options.setRefreshUrl(url);
							//options.widget.titleElem.text(text);
						}
					},
					init : function(){
						var I18N = window.I18N;
						var list = [{
							displayType: I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_WATTHOUR"),
							type: "Meter.WattHour"
						},
						{
							displayType: I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_GAS"),
							type: "Meter.Gas"
						},
						{
							displayType: I18N.prop("FACILITY_DEVICE_ENERGY_METER_TYPE_WATER"),
							type: "Meter.Water"
						}];
						this.viewModel.set("meterTypeList", list);

						var obj, typeList = this.viewModel.meterTypeList;
						//설치된 기기만 표시한다.
						var i, max = typeList.length;
						for( i = max - 1; i >= 0; i-- ){
							obj = typeList[i];
							if(!Util.isInstalledType(obj.type, true)){
								typeList.splice(i, 1);
							}
						}
						// if(typeList.length < 1){
						// 	this.viewModel.set("disabledMeter", true);
						// }

						var widget = this.widget;
						var element = widget.element;
						var msg = element.data("message");
						if(msg){
							//이미 선택된 Meter Type과 Group Id로 로딩
							var split = msg.split("/");
							max = split.length;

							for( i = 0; i < max; i++ ){
								if(split[i] == "groupNames"){
									this.viewModel.set("groupNames", split[i + 1]);
								}else if(split[i] == "groupIds"){
									this.viewModel.set("groupIds", split[i + 1]);
								}else if(split[i] == "meterType"){
									this.viewModel.set("meterType", split[i + 1]);
								}
							}
							this.viewModel.clickApply({ isSavedCard : true });
						}

					},
					parseData : function(data){
						var selectedMeterType = this.viewModel.get("meterType");
						// var mockData = this.avgMockData[selectedMeterType];
						var time, summary, todayAverage, monthAverage, monthEstAverage, unit;
						time = data.time ? data.time : "-";
						summary = data.summary ? data.summary : "-";
						summary = summary.length !== 0 ? summary[0] : "-";
						todayAverage = typeof summary.today !== "undefined" ? summary.today : "-";
						monthAverage = typeof summary.monthly !== "undefined" ? summary.monthly : "-";
						monthEstAverage = typeof summary.estMonthly !== "undefined" ? summary.estMonthly : "-";
						unit = typeof summary.unit !== "undefined" ? summary.unit : "";
						if(unit == "m3"){
							unit = "m³";
						}else if(unit == "l"){
							unit = "L";
						}

						this.viewModel.set("today", time);
						this.viewModel.set("todayAverage", todayAverage);
						this.viewModel.set("monthAverage", monthAverage);
						this.viewModel.set("monthEstAverage", monthEstAverage);
						this.viewModel.set("unit", unit);
					}
				}
			]
		},
		energyPeak : {
			title : "DASHBOARD_ENERGY_PEAK",
			cards : [
				{
					width : 2,
					height : 4,
					template : "<div class='dashboard-body-content dashboard-energy-peak'><div class='average-dropdown' data-bind='invisible: invisibleDropdown'><div class='tbc'><div class='wrapper'><input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='source:deviceList, events:{change:changeDevice}, disabled:disabledDevice'/></div><div class='wrapper'><button class='k-button' data-bind='events:{click:clickApply}, disabled:disabledApply'>#=apply#</button></div></div></div>" +
					"<div class='radial-guage' data-bind='invisible:invisibleDisplay'><div class='gauge-num peak-1'>1</div><div class='gauge-num peak-2'>2</div><div class='gauge-num peak-3'>3</div><div data-role='radialgauge' data-scale='#=scale#' data-pointer='#=pointer#' data-bind='value:peakLevel'></div><div class='gaugeData min'><p class='nowData' data-bind='css:{red:isTargetOver}'><strong data-bind='text:currentDemand'>250,780</strong><span class='unit'>kW</span></p><p></p><p>/ <span><span data-bind='text:targetDemand'>175,780</span> kW</span></p><p></p></div></div>",
					MockData : {
						"deviceName": "device 1",
						"currentDemand" : 150780,
						"targetDemand" : 175780,
						"peakLevel" : 3
					},
					localeTemplateData : {
						apply : "COMMON_BTN_APPLY"
					},
					templateData : {
						/*seriesDefault : '{type:\"column\", axis:\"usedTime\", categoryAxis:\"topFive\",color:\"rgb(0, 129, 198)\",overlay:{ gradient : \"none\"}, border:{width:0}, spacing:0.1,gap:2.5}',
						chartArea : '{background:\"#f7f7f7\"}',
						series : '[{field:\"usedTime\", name:\"Used Time\"}]',
						valueAxis : '[{ name : \"usedTime\", min : 0, max : 25, line: {visible:false}}]',
						categoryAxis : '[{name :\"topFive\", majorGridLines : {visible:false}, minorGridLines : {visible : false}, line: {visible:false}, majorUnit:5}]'*/
						scale : '{startAngle: 0,endAngle: 180,min: 0,max: 30, majorTicks:{visible : false}, minorTicks: {visible : false}, rangeSize : 18, rangeDistance:-33, ranges: [{from: 0,to: 10, color: \"rgb(84, 183, 96)\",}, {from: 10,to: 20,color: \"rgb(255, 192, 22)\"},{from: 20,to: 30, color: \"rgb(255, 61, 51)\"}],labels: {visible : false}}',
						pointer : '{value: 5,color: \"#333\",cap:{size:0}}'
					},
					viewModel : {
						invisibleDropdown : false,
						invisibleDisplay : true,
						deviceList : [],
						disabledDevice : true,
						disabledApply : true,
						peakLevel : 3,
						currentDemand : 0,
						targetDemand : 0,
						isTargetOver : false,
						deviceId : "",
						deviceName : "",
						changeDevice : function(e){
							var deviceId = e.sender.value();
							var deviceName = e.sender.text();
							this.set("deviceId", deviceId);
							this.set("deviceName", deviceName);
						},
						clickApply : function(e){
							var self = this;
							var options = self.thisOptions;
							var widget = options.widget;
							//var url = "/dms/devices/statisticView/"+value+"?foundation_space_buildings_id=0";
							var deviceId = self.get("deviceId");
							var deviceName = self.get("deviceName");

							var url = "/energy/sac/demandMonitoring/runtime/latest?dms_device_id=" + deviceId;
							//var url = "/energy/sac/demandMonitoring/runtime/max?dms_device_id="+deviceId;
							options.refreshUrl = url;
							var I18N = window.I18N;
							var titleText = I18N.prop("DASHBOARD_ENERGY_PEAK") + " > " + deviceName;
							options.widget.titleElem.text(titleText);
							var message = "/deviceName/" + deviceName + "/deviceId/" + deviceId + "/";

							if(!e.isSavedCard){
								options.widget.element.attr("data-message", message);
								options.widget.trigger("onPin");
							}

							widget.refresh().always(function(){
								self.set("invisibleDropdown", true);
								self.set("invisibleDisplay", false);
								options.menuUrl = "/energy/samsungsac";
							});
						}
					},
					init : function(){
						var self = this;
						var widget = self.widget;
						var element = widget.element;
						var msg = element.data("message");
						var I18N = window.I18N;
						if(msg){
							//이미 선택된 Device Id로 로딩
							var split = msg.split("/");
							var i, max = split.length;

							for( i = 0; i < max; i++ ){
								if(split[i] == "deviceId"){
									self.viewModel.set("deviceId", split[i + 1]);
								}else if(split[i] == "deviceName"){
									self.viewModel.set("deviceName", split[i + 1]);
								}
							}
							self.viewModel.clickApply({ isSavedCard : true });
						}else{
							var loading = self.widget.loading;
							loading.open();
							$.ajax({
								url : "/dms/devices?types=AirConditionerController.DMS,AirConditionerController.WirelessDDC&registrationStatuses=Registered"
							}).done(function(data){
								if(data.length < 1){
									self.viewModel.set("disabledDevice", true);
									self.viewModel.set("disabledApply", true);
									self.widget.bodyElem.find('input').eq(0).data('kendoDropDownList').setOptions({'optionLabel': I18N.prop("DASHBOARD_NO_INSTALLED_DEVICE")});
								}else{
									self.viewModel.set("deviceList", data);
									self.viewModel.set("deviceId", data[0].id);
									self.viewModel.set("deviceName", data[0].name);
									self.viewModel.set("disabledDevice", false);
									self.viewModel.set("disabledApply", false);
									self.widget.bodyElem.find('input').eq(0).data('kendoDropDownList').setOptions({'optionLabel': false});
								}
							}).fail(function(){

							}).always(function(){
								loading.close();
							});
						}
					},
					parseData : function(data){
						var currentDemand, targetDemand, peakLevel;
						currentDemand = typeof data.currentDemand !== "undefined" ? data.currentDemand : 0;
						targetDemand = typeof data.targetDemand !== "undefined" ? data.targetDemand : 0;
						peakLevel = typeof data.peakLevel !== "undefined" ? data.peakLevel : 0;
						var levelValues = [5, 15, 25];
						peakLevel = levelValues[peakLevel - 1];

						this.viewModel.set("currentDemand", kendo.toString(currentDemand, "n0"));
						this.viewModel.set("targetDemand", kendo.toString(targetDemand, "n0"));
						this.viewModel.set("peakLevel", peakLevel);
						if(currentDemand > targetDemand){
							this.viewModel.set("isTargetOver", true);
						}
					},
					onMoveMenu : function(){
						//Tab의 Role로 접근
						window.localStorage.setItem("dashboardShortcut", "demandmonitoring");
						window.localStorage.setItem("dashboardDemandBtn", "runtime");
					}
				},
				{
					width : 4,
					height : 4,
					template : "<div class='dashboard-body-content dashboard-energy-peak-4x4'><div class='average-dropdown' data-bind='invisible: invisibleDropdown'><div class='tbc'><div class='wrapper'><input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='source:deviceList, events:{change:changeDevice}, disabled:disabledDevice'/></div><div class='wrapper'><button class='k-button' data-bind='events:{click:clickApply}, disabled:disabledApply'>#=apply#</button></div></div></div>" +
					"<div class='radial-guage' data-bind='invisible:invisibleDisplay'><div class='tbc'><div class='gauge-num peak-1'>1</div><div class='gauge-num peak-2'>2</div><div class='gauge-num peak-3'>3</div><div data-role='radialgauge' data-gauge-area='#=gaugeArea#' data-scale='#=scale#' data-pointer='#=pointer#' data-bind='value:peakLevel'></div></div><div class='tbc' style='width:262px;'><div class='gaugeData'><p class='nowData' data-bind='css:{red:isTargetOver}'><strong data-bind='text:currentDemand'>250,780</strong><span class='unit'>kW</span></p><p></p><p>/ <span><span data-bind='text:targetDemand'>175,780</span> kW</span></p><p></p></div></div></div>",
					MockData : {
						"deviceName": "device 1",
						"currentDemand" : 150780,
						"targetDemand" : 175780,
						"peakLevel" : 3
					},
					localeTemplateData : {
						apply : "COMMON_BTN_APPLY"
					},
					templateData : {
						gaugeArea : "{margin :{top:-20}}",
						scale : '{startAngle: 0,endAngle: 180,min: 0,max: 30, majorTicks:{visible : false}, minorTicks: {visible : false}, rangeSize : 18, rangeDistance:-33, ranges: [{from: 0,to: 10, color: \"rgb(84, 183, 96)\",}, {from: 10,to: 20,color: \"rgb(255, 192, 22)\"},{from: 20,to: 30, color: \"rgb(255, 61, 51)\"}],labels: {visible : false}}',
						pointer : '{value: 5,color: \"#333\",cap:{size:0}}'
					},
					viewModel : {
						invisibleDropdown : false,
						invisibleDisplay : true,
						deviceList : [],
						disabledDevice : true,
						disabledApply : true,
						peakLevel : 3,
						currentDemand : 0,
						targetDemand : 0,
						isTargetOver : false,
						deviceId : "",
						deviceName : "",
						changeDevice : function(e){
							var deviceId = e.sender.value();
							var deviceName = e.sender.text();
							this.set("deviceId", deviceId);
							this.set("deviceName", deviceName);
						},
						clickApply : function(e){
							var self = this;
							var options = self.thisOptions;
							var widget = options.widget;
							//var url = "/dms/devices/statisticView/"+value+"?foundation_space_buildings_id=0";
							var deviceId = self.get("deviceId");
							var deviceName = self.get("deviceName");

							var url = "/energy/sac/demandMonitoring/runtime/latest?dms_device_id=" + deviceId;
							//var url = "/energy/sac/demandMonitoring/runtime/max?dms_device_id="+deviceId;
							options.refreshUrl = url;
							var I18N = window.I18N;
							var titleText = I18N.prop("DASHBOARD_ENERGY_PEAK") + " > " + deviceName;
							options.widget.titleElem.text(titleText);
							var message = "/deviceName/" + deviceName + "/deviceId/" + deviceId + "/";

							if(!e.isSavedCard){
								options.widget.element.attr("data-message", message);
								options.widget.trigger("onPin");
							}

							widget.refresh().always(function(){
								self.set("invisibleDropdown", true);
								self.set("invisibleDisplay", false);
								options.menuUrl = "/energy/samsungsac";
							});
						}
					},
					init : function(){
						var self = this;
						var widget = self.widget;
						var element = widget.element;
						var msg = element.data("message");
						var I18N = window.I18N;
						if(msg){
							//이미 선택된 Device Id로 로딩
							var split = msg.split("/");
							var i, max = split.length;

							for( i = 0; i < max; i++ ){
								if(split[i] == "deviceId"){
									self.viewModel.set("deviceId", split[i + 1]);
								}else if(split[i] == "deviceName"){
									self.viewModel.set("deviceName", split[i + 1]);
								}
							}
							self.viewModel.clickApply({ isSavedCard : true });
						}else{
							var loading = self.widget.loading;
							loading.open();
							$.ajax({
								url : "/dms/devices?types=AirConditionerController.DMS,AirConditionerController.WirelessDDC&registrationStatuses=Registered"
							}).done(function(data){
								if(data.length < 1){
									self.viewModel.set("disabledDevice", true);
									self.viewModel.set("disabledApply", true);
									self.widget.bodyElem.find('input').eq(0).data('kendoDropDownList').setOptions({'optionLabel': I18N.prop("DASHBOARD_NO_INSTALLED_DEVICE")});
								}else{
									self.viewModel.set("deviceList", data);
									self.viewModel.set("deviceId", data[0].id);
									self.viewModel.set("deviceName", data[0].name);
									self.viewModel.set("disabledDevice", false);
									self.viewModel.set("disabledApply", false);
									self.widget.bodyElem.find('input').eq(0).data('kendoDropDownList').setOptions({'optionLabel': false});
								}
							}).fail(function(){

							}).always(function(){
								loading.close();
							});
						}
					},
					parseData : function(data){
						var currentDemand, targetDemand, peakLevel;
						currentDemand = typeof data.currentDemand !== "undefined" ? data.currentDemand : 0;
						targetDemand = typeof data.targetDemand !== "undefined" ? data.targetDemand : 0;
						peakLevel = typeof data.peakLevel !== "undefined" ? data.peakLevel : 0;
						var levelValues = [5, 15, 25];
						peakLevel = levelValues[peakLevel - 1];

						this.viewModel.set("currentDemand", kendo.toString(currentDemand, "n0"));
						this.viewModel.set("targetDemand", kendo.toString(targetDemand, "n0"));
						this.viewModel.set("peakLevel", peakLevel);
						if(currentDemand > targetDemand){
							this.viewModel.set("isTargetOver", true);
						}
					},
					onMoveMenu : function(){
						//Tab의 Role로 접근
						window.localStorage.setItem("dashboardShortcut", "demandmonitoring");
						window.localStorage.setItem("dashboardDemandBtn", "runtime");
					}
				},
				{
					width : 6,
					height : 4,
					template : "<div class='dashboard-body-content dashboard-energy-peak-6x4'><div class='average-dropdown' data-bind='invisible: invisibleDropdown'><div class='tbc'><div class='wrapper'><input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='source:deviceList, events:{change:changeDevice}, disabled:disabledDevice'/></div><div class='wrapper'><button class='k-button' data-bind='events:{click:clickApply}, disabled:disabledApply'>#=apply#</button></div></div></div>" +
					"<div data-bind='invisible:invisibleDisplay'><div class='energy-peak-bar-graph-wrapper'><div class='chart-legend'><div class='graph-y-unit' style='float: left;padding-left: 5px;'>(kW)</div><span class='legend peak-0'></span><span class='legend peak-1'></span><span class='legend peak-2'></span><span class='legend peak-3'></span>#=peakLevel# + #=currentDemand#<span class='legend target'><span class='two-line'></span></span>#=estimatedLine#<span class='legend target'><span class='line'></span></span>#=targetDemand#</div><div data-role='chart' class='peak-bar-graph' style='height:#=height#; width:#=width#' data-series-defaults='#=seriesDefault#' data-series='#=series#' data-chart-area='#=chartArea#' data-value-axis='#=valueAxis#' data-category-axis='#=categoryAxis#' data-bind='source:list' data-legend='#=legend#'></div></div></div></div>",
					localeTemplateData : {
						apply : "COMMON_BTN_APPLY",
						peakLevel : "ENERGY_PEAK_LEVEL",
						currentDemand : "ENERGY_CURRENT_DEMAND",
						targetDemand : "ENERGY_TARGET_DEMAND",
						estimatedLine : "ENERGY_ESTIMATE_LINE"
					},
					MockData : {
						runtime : [
							{"syncTime": "12:00","currentDemand": 32500,"estimateDemand": 10000,"targetDemand": 27000,"peakLevel": 2},{"syncTime": "13:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"syncTime": "14:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"syncTime": "15:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 1},{"syncTime": "1:00","currentDemand": 32500,"estimateDemand": 32000,"targetDemand": 27000,"peakLevel": 2},{"syncTime": "2:00","currentDemand": 32500,"estimateDemand": 31000,"targetDemand": 27000,"peakLevel": 0},{"syncTime": "3:00","currentDemand": 32500,"estimateDemand": 25000,"targetDemand": 27000,"peakLevel": 3},{"syncTime": "4:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"syncTime": "5:00","currentDemand": 32500,"estimateDemand": 33000,"targetDemand": 27000,"peakLevel": 1},{"syncTime": "6:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 2},{"syncTime": "7:00","currentDemand": 32500,"estimateDemand": 12000,"targetDemand": 27000,"peakLevel": 1},{"syncTime": "8:00","currentDemand": 32500,"estimateDemand": 33000,"targetDemand": 27000,"peakLevel": 3},{"syncTime": "9:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 1},{"syncTime": "10:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 0},{"syncTime": "11:00","currentDemand": 32500,"targetDemand": 27000,"peakLevel": 1}
						],
						"min": {
							"currentDemand": 3250,
							"estimateDemand": 3100,
							"targetDemand": 2300
						},
						"max": {
							"currentDemand": 3290,
							"estimateDemand": 3500,
							"targetDemand": 2700
						}
					},
					templateData : {
						height : "240px",
						width : "875px",
						legend : '{visible:false}',
						seriesDefault : '{overlay:{ gradient : \"none\"}, border:{width:0}, spacing:1,gap:3, missingValues: \"gap\" }',
						chartArea : '{background:\"#f7f7f7\"}',
						series : '[{type:\"column\", field:\"currentDemand\", name:\"currentDemandPeak1\", categoryAxis:\"syncTime\", color:\"#afaeae\"},{type:\"line\", field:\"targetDemand\", name:\"targetDemand\", color:\"#2c81db", markers:{size:0}, width:1}, {type:\"line\", field:\"estimateDemand\", name:\"estimateDemand\", categoryAxis:\"syncTime\", color:\"#333333", markers:{size:0},width:1}]',
						valueAxis : '[{ name : \"currentDemand\", min : 0, max : 60000, line: {visible:false}, majorUnit:10000}]',
						categoryAxis : '[{name :\"syncTime\", field:\"syncTime\", majorGridLines:{visible:false},minorGridLines : {visible : false}, majorTicks:{visible : false}}]'
					},
					viewModel : {
						invisibleDropdown : false,
						invisibleDisplay : true,
						deviceList : [],
						disabledDevice : true,
						disabledApply : true,
						peakLevel : 5,
						deviceId : "",
						deviceName : "",
						changeDevice : function(e){
							var deviceId = e.sender.value();
							var deviceName = e.sender.text();
							this.set("deviceId", deviceId);
							this.set("deviceName", deviceName);
						},
						clickApply : function(e){
							var self = this;
							var options = self.thisOptions;
							var widget = options.widget;
							//var url = "/dms/devices/statisticView/"+value+"?foundation_space_buildings_id=0";
							var deviceId = self.get("deviceId");
							var deviceName = self.get("deviceName");

							var url = "/energy/sac/demandMonitoring/runtime?dms_device_id=" + deviceId;
							//var url = "/energy/algorithm-summary";
							options.refreshUrl = url;
							var I18N = window.I18N;
							var titleText = I18N.prop("DASHBOARD_ENERGY_PEAK_TREND") + "(" + I18N.prop("DASHBOARD_ENERGY_EOI_TIME") + ") > " + deviceName;
							options.widget.titleElem.text(titleText);
							var message = "/deviceName/" + deviceName + "/deviceId/" + deviceId + "/";

							if(!e.isSavedCard){
								options.widget.element.attr("data-message", message);
								options.widget.trigger("onPin");
								widget.refresh().always(function(){
									options.menuUrl = "/energy/samsungsac";
									self.set("invisibleDropdown", true);
									self.set("invisibleDisplay", false);
								});
							}else{
								options.menuUrl = "/energy/samsungsac";
								self.set("invisibleDropdown", true);
								self.set("invisibleDisplay", false);
							}
						}
					},
					init : function(){
						var self = this;
						var widget = self.widget;
						var element = widget.element;
						var msg = element.data("message");
						var I18N = window.I18N;
						if(msg){
							//이미 선택된 Device Id로 로딩
							var split = msg.split("/");
							var i, max = split.length;

							for( i = 0; i < max; i++ ){
								if(split[i] == "deviceId"){
									self.viewModel.set("deviceId", split[i + 1]);
								}else if(split[i] == "deviceName"){
									self.viewModel.set("deviceName", split[i + 1]);
								}
							}
							self.viewModel.clickApply({ isSavedCard : true });
						}else{
							var loading = self.widget.loading;
							loading.open();
							$.ajax({
								url : "/dms/devices?types=AirConditionerController.DMS,AirConditionerController.WirelessDDC&registrationStatuses=Registered"
							}).done(function(data){
								if(data.length < 1){
									self.viewModel.set("disabledDevice", true);
									self.viewModel.set("disabledApply", true);
									self.widget.bodyElem.find('input').eq(0).data('kendoDropDownList').setOptions({'optionLabel': I18N.prop("DASHBOARD_NO_INSTALLED_DEVICE")});
								}else{
									self.viewModel.set("deviceList", data);
									self.viewModel.set("deviceId", data[0].id);
									self.viewModel.set("deviceName", data[0].name);
									self.viewModel.set("disabledDevice", false);
									self.viewModel.set("disabledApply", false);
									self.widget.bodyElem.find('input').eq(0).data('kendoDropDownList').setOptions({'optionLabel': false});
								}
							}).fail(function(){

							}).always(function(){
								loading.close();
							});
						}
					},
					peakLevelColors : ["#afaeae","#1aa05a","#ffa41f","#ef2b2b"],
					parseData : function(data){
						var max;
						if(data.runtime){
							max = data.max;
							data = data.runtime;
						}else{
							//data = $.extend(true, [], this.MockData.runtime);
							data = [];
						}

						data.sort(function(a, b){
							a = a.syncTime ? a.syncTime : "00:00";
							b = b.syncTime ? b.syncTime : "00:00";
							a = a.split(":");
							b = b.split(":");
							a = Number(a[a.length - 2]) * 60 + Number(a[a.length - 1]);
							b = Number(b[b.length - 2]) * 60 + Number(b[b.length - 1]);

							//return a.localeCompare(b);
							return a - b;
						});

						var widget = this.widget;
						var self = this;
						var seriesOpt = [{type:"column", field:"currentDemand", name:"currentDemandPeak1", categoryAxis:"syncTime", color:function(seriesData){
							var peakLevel = seriesData.dataItem.peakLevel;
							peakLevel = peakLevel ? peakLevel : 0;
							return self.peakLevelColors[peakLevel];
						}},{type:"line", field:"targetDemand", name:"targetDemand", color:"#2c81db", markers:{size:0}, width:1}, {type:"line", field:"estimateDemand", name:"estimateDemand", categoryAxis:"syncTime", color:"#333333", markers:{size:0},width:1}];

						var valueAxisOpt = [{name : "currentDemand", min : 0, max : 1, line: {visible:false}, majorUnit: 0.2}];

						//최대값을 구한다. 최소값은 0
						var key, defaultMax = 0;
						if(max){
							for(key in max){
								if(defaultMax < max[key]){
									defaultMax = max[key];
								}
							}
						}

						if(defaultMax !== 0){
							defaultMax = defaultMax * 1.2;
							valueAxisOpt[0].max = Util.getChartOptionsForFiveChartSection(defaultMax, 0).newMax;
							valueAxisOpt[0].majorUnit = Util.getChartOptionsForFiveChartSection(defaultMax, 0).newMajorUnit;
						}

						var chartElem = widget.element.find(".peak-bar-graph");
						var chartWidget = chartElem.data("kendoChart");
						chartWidget.setOptions({
							series : seriesOpt,
							valueAxis : valueAxisOpt
						});

						/*var i, split, min, sec, time, max = data.length;
						for( i = 0; i < max; i++ ){
							time = data[i].syncTime;
							split = time.split(":");
							min = split[1];
							sec = split[2];
							data[i].syncTime = min+":"+sec;
						}*/
						//실제 호출 시, 00:00로 응답.
						//console.log(data);

						this.viewModel.set("list", data);
					},
					onMoveMenu : function(){
						//Tab의 Role로 접근
						window.localStorage.setItem("dashboardShortcut", "demandmonitoring");
						window.localStorage.setItem("dashboardDemandBtn", "runtime");
					}
				},
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 8,
					height : 4,
					template : "<div class='dashboard-body-content dashboard-energy-peak-8x4'><div class='average-dropdown' data-bind='invisible: invisibleDropdown'><div class='tbc'><div class='wrapper'><input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='source:deviceList, events:{change:changeDevice}, disabled:disabledDevice'/></div><div class='wrapper'><button class='k-button' data-bind='events:{click:clickApply}, disabled:disabledApply'>#=apply#</button></div></div></div>" +
					"<div data-bind='invisible:invisibleDisplay'><div class='energy-peak-bar-graph-wrapper'><div class='chart-legend'><div class='graph-y-unit' style='float: left;padding-left: 5px;'>(kW)</div><span class='legend peak-0'></span><span class='legend peak-1'></span><span class='legend peak-2'></span><span class='legend peak-3'></span>#=peakLevel# + #=currentDemand#<span class='legend target'><span class='line'></span></span>#=targetDemand#</div><div data-role='chart' class='top-five-bar-graph peak-bar-graph' style='height:#=height#; width:#=width#' data-series-defaults='#=seriesDefault#' data-series='#=series#' data-chart-area='#=chartArea#' data-value-axis='#=valueAxis#' data-category-axis='#=categoryAxis#' data-legend='#=legend#'></div></div></div></div>",
					localeTemplateData : {
						apply : "COMMON_BTN_APPLY",
						peakLevel : "ENERGY_PEAK_LEVEL",
						currentDemand : "ENERGY_CURRENT_DEMAND",
						targetDemand : "ENERGY_TARGET_DEMAND",
						estimatedLine : "ENERGY_ESTIMATE_LINE"
					},
					MockData : {
						hourly : [
							{"time": "00:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "01:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "02:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "03:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "04:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "05:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "06:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "07:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "09:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "09:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "10:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "11:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "12:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "13:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "14:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "15:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "16:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "17:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "18:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "19:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "20:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "21:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "22:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3},{"time": "23:00","currentDemand": 32500,"estimateDemand": 35000,"targetDemand": 27000,"peakLevel": 3}
						]
					},
					templateData : {
						selectAllText : "All Group",
						height : "240px",
						width : "1190px",
						legend : '{visible:false}',
						seriesDefault : '{overlay:{ gradient : \"none\"}, border:{width:0}, spacing:0.1,missingValues: \"gap\"}',
						chartArea : '{background:\"#f7f7f7\"}',
						series : '[{type:\"column\", field:\"currentDemand\", name:\"currentDemandPeak\", categoryAxis:\"hour\", color:\"#afaeae\"},{type:\"line\", field:\"targetDemand\", name:\"targetDemand\", color:\"#2c81db", markers:{size:0},width:1}]',
						valueAxis : '[{ name : \"currentDemand\", min : 0, max : 60000, line: {visible:false}, majorUnit:10000, majorGridLines:{visible:false}}]',
						categoryAxis : '[{name :\"hour\", field:\"time\", minorGridLines : {visible : false}, majorTicks:{visible : false}}]'
					},
					viewModel : {
						invisibleDropdown : false,
						invisibleDisplay : true,
						deviceList : [],
						disabledDevice : true,
						disabledApply : true,
						peakLevel : 5,
						deviceId : "",
						deviceName : "",
						changeDevice : function(e){
							var deviceId = e.sender.value();
							var deviceName = e.sender.text();
							this.set("deviceId", deviceId);
							this.set("deviceName", deviceName);
						},
						clickApply : function(e){
							var self = this;
							var options = self.thisOptions;
							var widget = options.widget;
							//var url = "/dms/devices/statisticView/"+value+"?foundation_space_buildings_id=0";
							var deviceId = self.get("deviceId");
							var deviceName = self.get("deviceName");

							var date = new Date();
							var year = date.getFullYear();
							var month = date.getMonth() + 1;
							//하루 전날 데이터 조회
							var day = date.getDate() - 1;
							//var month = 8;
							//var day = 3;

							month = kendo.toString(month, "00");
							day = kendo.toString(day, "00");

							var url = "/energy/sac/demandMonitoring?dms_device_id=" + deviceId + "&year=" + year + "&month=" + month + "&day=" + day;
							//var url = "/schedules";
							options.refreshUrl = url;
							var I18N = window.I18N;
							var titleText = I18N.prop("DASHBOARD_ENERGY_PEAK_TREND") + " > " + deviceName;
							options.widget.titleElem.text(titleText);
							var message = "/deviceName/" + deviceName + "/deviceId/" + deviceId + "/";

							if(!e.isSavedCard){
								options.widget.element.attr("data-message", message);
								options.widget.trigger("onPin");
								widget.refresh().always(function(){
									options.menuUrl = "/energy/samsungsac";
									self.set("invisibleDropdown", true);
									self.set("invisibleDisplay", false);
								});
							}else{
								options.menuUrl = "/energy/samsungsac";
								self.set("invisibleDropdown", true);
								self.set("invisibleDisplay", false);
							}
						}
					},
					init : function(){
						var self = this;
						var widget = self.widget;
						var element = widget.element;
						var msg = element.data("message");
						var I18N = window.I18N;
						if(msg){
							//이미 선택된 Device Id로 로딩
							var split = msg.split("/");
							var i, max = split.length;

							for( i = 0; i < max; i++ ){
								if(split[i] == "deviceId"){
									self.viewModel.set("deviceId", split[i + 1]);
								}else if(split[i] == "deviceName"){
									self.viewModel.set("deviceName", split[i + 1]);
								}
							}
							self.viewModel.clickApply({ isSavedCard : true });
						}else{
							var loading = self.widget.loading;
							loading.open();
							$.ajax({
								url : "/dms/devices?types=AirConditionerController.DMS,AirConditionerController.WirelessDDC&registrationStatuses=Registered"
							}).done(function(data){
								if(data.length < 1){
									self.viewModel.set("disabledDevice", true);
									self.viewModel.set("disabledApply", true);
									self.widget.bodyElem.find('input').eq(0).data('kendoDropDownList').setOptions({'optionLabel': I18N.prop("DASHBOARD_NO_INSTALLED_DEVICE")});
								}else{
									self.viewModel.set("deviceList", data);
									self.viewModel.set("deviceId", data[0].id);
									self.viewModel.set("deviceName", data[0].name);
									self.viewModel.set("disabledDevice", false);
									self.viewModel.set("disabledApply", false);
									self.widget.bodyElem.find('input').eq(0).data('kendoDropDownList').setOptions({'optionLabel': false});
								}
							}).fail(function(){

							}).always(function(){
								loading.close();
							});
						}
					},
					parseData : function(data){
						var maximum;
						if(data.hourly){
							maximum = data.max;
							data = data.hourly;
						}else{
							//data = $.extend(true, [], this.MockData.hourly);
							data = [];
						}

						var categories = getChartXAxisLabelOfTime();
						var i, split, hour, min, time;
						var max = data.length;

						var widget = this.widget;
						/*var seriesOpt = [{type:"column", field:"currentDemand", name:"currentDemandPeak1", categoryAxis:"syncTime", color:function(data){
							var peakLevel = data.dataItem.peakLevel;
							peakLevel = peakLevel ? peakLevel : 0;
							return self.peakLevelColors[peakLevel];
						}},{type:"line", field:"targetDemand", name:"targetDemand", color:"#2c81db", markers:{size:0}, width:1}, {type:"line", field:"estimateDemand", name:"estimateDemand", categoryAxis:"syncTime", color:"#333333", markers:{size:0},width:1}];*/
						var peakLevelColorDef = ["#afaeae", "#1aa05a", "#ffa41f","#ef2b2b"];
						var valueAxisOpt = [{ name : "currentDemand", min : 0, max : 1, line: {visible:false}, majorUnit:0.2, majorGridLines:{visible:false}}];

						var seriesOpt = [{type:"column", name:"currentDemandPeak0", field :"currentDemand", categoryAxis:"hour", color:function(seriesData){
							// console.log(seriesData);
							var peakLevel = 0;
							if(seriesData.dataItem){
								peakLevel = seriesData.dataItem.peakLevel;
							}
							return peakLevelColorDef[peakLevel];
						}},{type:"column", name:"currentDemandPeak1", field :"currentDemand", categoryAxis:"hour", color:function(seriesData){
							// console.log(seriesData);
							var peakLevel = 0;
							if(seriesData.dataItem){
								peakLevel = seriesData.dataItem.peakLevel;
							}
							return peakLevelColorDef[peakLevel];
						}},{type:"column", name:"currentDemandPeak2", field :"currentDemand",categoryAxis:"hour", color:function(seriesData){
							// console.log(seriesData);
							var peakLevel = 0;
							if(seriesData.dataItem){
								peakLevel = seriesData.dataItem.peakLevel;
							}
							return peakLevelColorDef[peakLevel];
						}},{type:"column", name:"currentDemandPeak3", field :"currentDemand",categoryAxis:"hour", color:function(seriesData){
							// console.log(seriesData);
							var peakLevel = 0;
							if(seriesData.dataItem){
								peakLevel = seriesData.dataItem.peakLevel;
							}
							return peakLevelColorDef[peakLevel];
						}},{type:"line", field:"targetDemand", name:"targetDemand", color:"#3a89dd", markers:{size:0},width:1}];

						var categoryOpt = [{name :"hour", minorGridLines : {visible : false}, majorTicks:{visible : false}, categories : categories}];

						var zero = [];
						var fifteen = [];
						var thirty = [];
						var fourtyFive = [];
						var target = [];
						var item, targetItem;

						for( i = 0; i < max; i++ ){
							time = data[i].time;
							/*if(defaultMax < data[i].currentDemand){
								defaultMax = data[i].currentDemand;
							}
							if(defaultMax < data[i].targetDemand){
								defaultMax = data[i].targetDemand;
							}*/
							if(time){
								split = time.split(":");
								hour = Number(split[split.length - 3]);
								min = Number(split[split.length - 2]);
								item = { currentDemand : data[i].currentDemand, peakLevel : data[i].peakLevel };
								if(min == 0){
									zero[hour] = item;
								}else if(min == 15){
									fifteen[hour] = item;
								}else if(min == 30){
									thirty[hour] = item;
								}else if(min == 45){
									fourtyFive[hour] = item;
								}
								targetItem = data[i].targetDemand;
								if(targetItem){
									target[hour] = { targetDemand : targetItem };
								}
							}
						}
						max = zero.length;
						for( i = 0; i < max; i++ ){
							if(typeof zero[i] === "undefined"){
								zero[i] = null;
							}
						}

						max = fifteen.length;
						for( i = 0; i < max; i++ ){
							if(typeof fifteen[i] === "undefined"){
								fifteen[i] = null;
							}
						}

						max = thirty.length;
						for( i = 0; i < max; i++ ){
							if(typeof thirty[i] === "undefined"){
								thirty[i] = null;
							}
						}

						max = fourtyFive.length;
						for( i = 0; i < max; i++ ){
							if(typeof fourtyFive[i] === "undefined"){
								fourtyFive[i] = null;
							}
						}

						max = target.length;
						for( i = 0; i < max; i++ ){
							if(typeof target[i] === "undefined"){
								target[i] = null;
							}
						}
						// console.log(zero);
						// console.log(fifteen);
						// console.log(thirty);
						// console.log(fourtyFive);
						// console.log(target);

						seriesOpt[0].data = zero;
						seriesOpt[1].data = fifteen;
						seriesOpt[2].data = thirty;
						seriesOpt[3].data = fourtyFive;
						seriesOpt[4].data = target;

						//최대값을 구한다. 최소값은 0
						var key, defaultMax = 0;
						// console.log(maximum);
						if(maximum){
							for(key in maximum){
								if(defaultMax < maximum[key]){
									defaultMax = maximum[key];
								}
							}
						}

						if(defaultMax !== 0){
							defaultMax = defaultMax * 1.2;
							valueAxisOpt[0].max = Util.getChartOptionsForFiveChartSection(defaultMax, 0).newMax;
							valueAxisOpt[0].majorUnit = Util.getChartOptionsForFiveChartSection(defaultMax, 0).newMajorUnit;
						}

						var chartElem = widget.element.find(".peak-bar-graph");
						var chartWidget = chartElem.data("kendoChart");
						chartWidget.setOptions({
							valueAxis : valueAxisOpt,
							series : seriesOpt,
							categoryAxis : categoryOpt
						});
						//console.log(data);
						//this.viewModel.set("list", list);
					},
					onMoveMenu : function(){
						//Tab의 Role로 접근
						window.localStorage.setItem("dashboardShortcut", "demandmonitoring");
						window.localStorage.setItem("dashboardDemandBtn", "day");
					}
				}
			]
		},
		todayEnergyUsage : {
			title : "DASHBOARD_TODAY_ENERGY_USAGE",
			cards : [
				{
					refreshOption : {
						timeout : 3600000
					},
					width : 2,
					height : 4,
					menuUrl : "/energy/consumptionandtarget",
					template : '<div class="dashboard-body-content dashboard-today-usage-2x4"><div class="dashboard-facility-operation-graph"><div class="dashboard-facility-operation-info"><div class="wrapper"><div class="legend-wrapper"><span class="count" data-bind="text: hoverCount"></span><span class="percent" data-bind="text:unit">%<br></span></div></div></div><div class="dashboard-facility-operation-chart" data-role="chart" data-transitions="false" data-series-defaults="{type:\'donut\',holeSize:80}" data-chart-area="{ background : \'\\#f7f7f7\', }" data-series="[{field:\'value\',categoryField:\'type\',visibleInLegendField:\'visibleInLegend\',padding:0,overlay:{gradient:\'none\'}}]" data-bind="source: operationData, events:{ seriesHover: onSeriesHover }"></div><div class="dashboard-today-usage-legend"><ul class="legends"><li class="legend" style="width:62px;"><span class="square critical"></span><p class="key">#=sac#</p></li><li class="legend" style="width:122px;text-align:center;"><span class="square warning"></span><p class="key">#=light#</p></li><li class="legend" style="width:62px;text-align:right;"><span class="square on"></span><p class="key">#=etc#</p></li></ul></div></div></div>',
					mockDatas : {
						"usage": 32000,
						"unit": "kWh",
						"current" : [
							{
								"energy_category" : "AirConditionerAll",
								"usage" : 1000
							},
							{
								"energy_category" : "Light",
								"usage" : 0
							},
							{
								"energy_category" : "Others",
								"usage" : 0
							}
						]
					},
					localeTemplateData : {
						sac : "DASHBOARD_SAC",
						light : "DASHBOARD_LIGHT",
						etc : "DASHBOARD_OTHERS"
					},
					init : function(){
						var self = this;
						self.widget.element.on("mouseleave", ".k-chart", function(){
							var isHover = self.viewModel.get("isHover");
							if(isHover){
								self.viewModel.set("isHover", false);
								var usage = self.viewModel.get("total");
								self.viewModel.set("hoverCount", kendo.toString(usage, "n0"));
								self.viewModel.set("unit", "kWh");
							}
						});
						var year = moment().format("Y");
						var month = moment().format("M");
						var day = moment().format("D");
						var url = "/energy/consumption/today?year=" + year + "&month=" + month + "&day=" + day + "&dms_meter_type=Meter.WattHour";
						//var url = "/energy/consumption/today?year=2017&month=8&day=1&dms_meter_type=Meter.WattHour";
						//var url = "/dms/devices";
						self.refreshUrl = url;
						self.widget.refresh();
					},
					templateData : {
						seriesDefaults : '{type:"donut"}',
						series : ""
					},
					viewModel : {
						unit : "kWh",
						isHover : false,
						hoverCount : 0,
						hoverCategory : "sac",
						sac : 0,
						light : 0,
						etc : 0,
						total : 0,
						operationData : new kendo.data.DataSource({
							data : []
						}),
						onSeriesHover: function(e){ // YH-HOVER
							this.set("isHover", true);
							var percent = e.percentage;
							percent = Math.round((percent * 100));
							//var value = e.value;
							//value = kendo.toString(value, "n0");
							var category = e.category;
							category = category.toUpperCase();

							var I18N = window.I18N;
							category = I18N.prop("DASHBOARD_" + category);

							this.set("hoverCount", percent);
							this.set("hoverCategory", category);
							this.set("unit", "%");
						}
					},
					setDataSource : function(){
						var sac = this.viewModel.get("sac");
						var light = this.viewModel.get("light");
						var etc = this.viewModel.get("etc");

						var data = [
							{
								type  : "sac",
								value : sac,
								visibleInLegend : false,
								color : "#ef2b2b"
							},
							{
								type  : "light",
								value : light,
								visibleInLegend : false,
								color : "#ffa41f"
							},
							{
								type  : "etc",
								value : etc,
								visibleInLegend : false,
								color : "#1aa05a"
							}
						];
						data = new kendo.data.DataSource({
							data : data
						});
						this.viewModel.set("operationData", data);
					},
					parseData : function(data){
						var usage = typeof data.usage !== "undefined" ? data.usage : 0;
						this.viewModel.set("total", usage);
						if(usage == 0){
							this.viewModel.set("hoverCount", "-");
						}else{
							this.viewModel.set("hoverCount", kendo.toString(usage, "n0"));
						}

						var unit = data.unit ? data.unit : "kWh";
						this.viewModel.set("unit", unit);

						//var current = data.current ? data.current : this.mockDatas.current;
						//var current = this.mockDatas.current;
						var current = data.energy ? data.energy : [];
						var i, cUsages, category, max = current.length;
						for( i = 0; i < max; i++ ){
							category = current[i].category;
							cUsages = current[i].usage;
							if(category == "AirConditioner"){
								this.viewModel.set("sac", cUsages);
							}else if(category == "Light"){
								this.viewModel.set("light", cUsages);
							}else{
								this.viewModel.set("etc", cUsages);
							}
						}
						this.setDataSource();
					}
				}
			]
		},
		monthlyEnergyPower : {
			title : "DASHBOARD_MONTHLY_POWER_PLAN",
			cards : [
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 2,
					height : 4,
					template : "<div class='dashboard-body-content dashboard-energy-peak'>" +
					"<div class='radial-guage'><div data-role='radialgauge' data-scale='#=scale#' data-pointer='#=pointer#' data-bind='value:percent'></div><div class='gaugeData min'><p class='nowData'><strong data-bind='text:usage, css:{red:isTargetOver}'>250,780</strong><span class='unit' data-bind='text:unit'>kWh</span></p><p></p><p>/ <span><span data-bind='text:target'>175,780</span> <span data-bind='text:unit'>kWh</span></span></p><p></p></div></div>",
					MockData : {
						usage : 2000.21,
						target : 8000.21,
						unit : "kWh"
					},
					templateData : {
						scale : '{startAngle: 0,endAngle: 180,min: 0,max: 100, majorTicks:{visible : false}, minorTicks: {visible : false}, rangeSize : 18, rangeDistance:-33, ranges: [{from: 0,to: 20, color: \"#1aa05a\",}, {from: 20,to: 40,color: \"#c6e6a2\"},{from: 40,to: 60, color: \"#ffa41f\"},{from: 60,to: 80, color: \"#ff7631\"},{from: 80,to: 100, color: \"#ee392f\"}],labels: {visible : false}}',
						pointer : '{value: 5,color: \"#333\",cap:{size:0}}'
					},
					viewModel : {
						usage : 0,
						target : 0,
						unit : 0,
						percent : 0,
						percentReady : 0,
						isTargetOver : false
					},
					init : function(){
						var self = this;
						var widget = self.widget;
						var date = new Date();
						var year = date.getFullYear();
						var month = date.getMonth() + 1;
						self.refreshUrl = "/energy/consumption/plan?year=" + year + "&month=" + month + "&dms_meter_type=Meter.WattHour";
						//self.refreshUrl = "/energy/algorithm-summary";
						//마우스 오버 시, 바늘이 움직인다.
						//사양 삭제
						/*widget.element.on("mouseenter", ".dashboard-card-body", function(e){
							var ready = self.viewModel.get("percentReady");
							if(ready !== 0){
								self.viewModel.set("percent", ready);
								self.viewModel.set("percentReaady", 0);
							}
						});*/

						widget.refresh().always(function(){
							self.menuUrl = "/energy/consumptionandtarget";
						});
					},
					parseData : function(data){
						var mockData = this.MockData;
						var usage = typeof data.usage !== "undefined" ? data.usage : 0;
						var target = typeof data.target !== "undefined" ? data.target : 0;
						var unit = typeof data.unit !== "undefined" ? data.unit : mockData.unit;
						var percent;
						usage = Number(usage);
						target = Number(target);
						usage = Math.round(usage);
						target = Math.round(target);

						if(target != "-" && usage != "-"){
							percent = Math.round(usage / target * 100);
							// console.log(percent);
							if(isNaN(percent)){
								percent = 0;
							}
							if(usage > target){
								this.viewModel.set("isTargetOver", true);
							}
						}else{
							percent = 0;
						}

						if(target === 0){
							target = "-";
						}else{
							target = kendo.toString(target, "n0");
						}

						if(usage === 0){
							usage = "-";
						}else{
							usage = kendo.toString(usage, "n0");
						}

						this.viewModel.set("usage", usage);
						this.viewModel.set("target", target);
						unit = "kWh";
						this.viewModel.set("unit", unit);
						this.viewModel.set("percent", percent);
					},
					onMoveMenu : function(){
						//Tab의 Role로 접근
						window.localStorage.setItem("dashboardShortcut", "target");
					}
				}
			]
		},
		monthlyEnergyGas : {
			title : "DASHBOARD_MONTHLY_GAS_PLAN",
			cards : [
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 2,
					height : 4,
					template : "<div class='dashboard-body-content dashboard-energy-peak'>" +
					"<div class='radial-guage'><div data-role='radialgauge' data-scale='#=scale#' data-pointer='#=pointer#' data-bind='value:percent'></div><div class='gaugeData min'><p class='nowData'><strong data-bind='text:usage, css:{red:isTargetOver}'>250,780</strong><span class='unit' data-bind='text:unit'>kWh</span></p><p></p><p>/ <span><span data-bind='text:target'>175,780</span> <span data-bind='text:unit'>kWh</span></span></p><p></p></div></div>",
					MockData : {
						usage : 2000.21,
						target : 8000.21,
						unit : "m3"
					},
					templateData : {
						scale : '{startAngle: 0,endAngle: 180,min: 0,max: 100, majorTicks:{visible : false}, minorTicks: {visible : false}, rangeSize : 18, rangeDistance:-33, ranges: [{from: 0,to: 20, color: \"#1aa05a\",}, {from: 20,to: 40,color: \"#c6e6a2\"},{from: 40,to: 60, color: \"#ffa41f\"},{from: 60,to: 80, color: \"#ff7631\"},{from: 80,to: 100, color: \"#ee392f\"}],labels: {visible : false}}',
						pointer : '{value: 5,color: \"#333\",cap:{size:0}}'
					},
					viewModel : {
						percentReady : 0,
						usage : 0,
						target : 0,
						unit : 0,
						percent : 0,
						isTargetOver : false
					},
					init : function(){
						var self = this;
						var widget = self.widget;
						var date = new Date();
						var year = date.getFullYear();
						var month = date.getMonth() + 1;
						self.refreshUrl = "/energy/consumption/plan?year=" + year + "&month=" + month + "&dms_meter_type=Meter.Gas";
						//self.refreshUrl = "/energy/algorithm-summary";
						//마우스 오버 시, 바늘이 움직인다.
						//사양 샥제
						/*widget.element.on("mouseenter", ".dashboard-card-body", function(e){
							var ready = self.viewModel.get("percentReady");
							if(ready !== 0){
								self.viewModel.set("percent", ready);
								self.viewModel.set("percentReaady", 0);
							}
						});*/

						widget.refresh().always(function(){
							self.menuUrl = "/energy/consumptionandtarget";
						});
					},
					parseData : function(data){
						var mockData = this.MockData;
						var usage = typeof data.usage !== "undefined" ? data.usage : 0;
						var target = typeof data.target !== "undefined" ? data.target : 0;
						var unit = typeof data.unit !== "undefined" ? data.unit : mockData.unit;
						var percent;
						usage = Number(usage);
						target = Number(target);
						usage = Math.round(usage);
						target = Math.round(target);

						if(target != "-" && usage != "-"){
							percent = Math.round(usage / target * 100);
							// console.log(percent);
							if(isNaN(percent)){
								percent = 0;
							}
							if(usage > target){
								this.viewModel.set("isTargetOver", true);
							}
						}else{
							percent = 0;
						}

						if(target === 0){
							target = "-";
						}else{
							target = kendo.toString(target, "n0");
						}

						if(usage === 0){
							usage = "-";
						}else{
							usage = kendo.toString(usage, "n0");
						}

						this.viewModel.set("usage", usage);
						this.viewModel.set("target", target);
						unit = "m³";
						this.viewModel.set("unit", unit);
						this.viewModel.set("percent", percent);
					},
					onMoveMenu : function(){
						//Tab의 Role로 접근
						window.localStorage.setItem("dashboardShortcut", "target");
					}
				}
			]
		},
		monthlyEnergyWater : {
			title : "DASHBOARD_MONTHLY_WATER_PLAN",
			cards : [
				{
					refreshOption : {
						timeout : function(){
							// 자정이 되었는지 확인. (00 시 00 분)
							var m = moment();
							return m.hours() === 0 && m.minutes() === 0;
						}
					},
					width : 2,
					height : 4,
					template : "<div class='dashboard-body-content dashboard-energy-peak'>" +
					"<div class='radial-guage'><div data-role='radialgauge' data-scale='#=scale#' data-pointer='#=pointer#' data-bind='value:percent'></div><div class='gaugeData min'><p class='nowData'><strong data-bind='text:usage, css:{red:isTargetOver}'>250,780</strong><span class='unit' data-bind='text:unit'>kWh</span></p><p></p><p>/ <span><span data-bind='text:target'>175,780</span> <span data-bind='text:unit'>L</span></span></p><p></p></div></div>",
					MockData : {
						usage : 2000.21,
						target : 8000.21,
						unit : "L"
					},
					templateData : {
						scale : '{startAngle: 0,endAngle: 180,min: 0,max: 100, majorTicks:{visible : false}, minorTicks: {visible : false}, rangeSize : 18, rangeDistance:-33, ranges: [{from: 0,to: 20, color: \"#1aa05a\",}, {from: 20,to: 40,color: \"#c6e6a2\"},{from: 40,to: 60, color: \"#ffa41f\"},{from: 60,to: 80, color: \"#ff7631\"},{from: 80,to: 100, color: \"#ee392f\"}],labels: {visible : false}}',
						pointer : '{value: 5,color: \"#333\",cap:{size:0}}'
					},
					viewModel : {
						percentReady : 0,
						usage : 0,
						target : 0,
						unit : 0,
						percent : 0,
						isTargetOver : false
					},
					init : function(){
						var self = this;
						var widget = self.widget;
						var date = new Date();
						var year = date.getFullYear();
						var month = date.getMonth() + 1;
						self.refreshUrl = "/energy/consumption/plan?year=" + year + "&month=" + month + "&dms_meter_type=Meter.Water";
						//self.refreshUrl = "/energy/algorithm-summary";
						//마우스 오버 시, 바늘이 움직인다.
						//사양 샥제
						/*widget.element.on("mouseenter", ".dashboard-card-body", function(e){
							var ready = self.viewModel.get("percentReady");
							if(ready !== 0){
								self.viewModel.set("percent", ready);
								self.viewModel.set("percentReaady", 0);
							}
						});*/

						widget.refresh().always(function(){
							self.menuUrl = "/energy/consumptionandtarget";
						});
					},
					parseData : function(data){
						var mockData = this.MockData;
						var usage = typeof data.usage !== "undefined" ? data.usage : 0;
						var target = typeof data.target !== "undefined" ? data.target : 0;
						var unit = typeof data.unit !== "undefined" ? data.unit : mockData.unit;
						var percent;
						usage = Number(usage);
						target = Number(target);
						usage = Math.round(usage);
						target = Math.round(target);

						if(target != "-" && usage != "-"){
							percent = Math.round(usage / target * 100);
							// console.log(percent);
							if(isNaN(percent)){
								percent = 0;
							}
							if(usage > target){
								this.viewModel.set("isTargetOver", true);
							}
						}else{
							percent = 0;
						}

						if(target === 0){
							target = "-";
						}else{
							target = kendo.toString(target, "n0");
						}

						if(usage === 0){
							usage = "-";
						}else{
							usage = kendo.toString(usage, "n0");
						}

						this.viewModel.set("usage", usage);
						this.viewModel.set("target", target);
						unit = "L";
						this.viewModel.set("unit", unit);
						this.viewModel.set("percent", percent);
					},
					onMoveMenu : function(){
						//Tab의 Role로 접근
						window.localStorage.setItem("dashboardShortcut", "target");
					}
				}
			]
		}
	};

	/**
	*
	*   <ul>
	*       <li>Dashboard Card Widget</li>
	*       <li>카드 정보에 따라 Card를 생성한다.</li>
	*   </ul>
	*   @module app/dashboard/widget/card
	*
	*/

	var LoadingPanel = window.CommonLoadingPanel;
	var Widget = kendo.ui.Widget;

	var dashboardErrorTmpl = "<div class='dashboard-error-panel'><div class='wrapper'><div class='text'>#=title#<br>#=message#</div></div></div>";
	var errorTemplate = kendo.template(dashboardErrorTmpl);
	var getChartXAxisLabelOfTime = function getChartXAxisLabelOfTime() {
		var I18N = window.I18N;
		var result = [], i;
		if (window.GlobalSettings.getTimeDisplay() === '24Hour') {
			for (i = 0; i < 24; i++) {
				result[i] = I18N.prop("ENERGY_CHART_TIME_HOUR", i);
			}
		} else {
			result = ['12 AM', '1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'];
		}
		return result;
	};

	var newWidget = Widget.extend({
		options: {
			name : "Card",
			type : null,
			drawerElement : null,
			refreshFunc : null,
			cardDraggableOptions : null,
			events : [
				"onClose",
				"onClosed",
				"onPin",
				"onPinned",
				"onChange"
			]
		},
		/**
		*
		*   <ul>
		*       <li>생성자 함수</li>
		*       <li>위젯 옵션과 함께 요소를 초기화한다.</li>
		*   </ul>
		*   @function init
		*   @param {jQueryElement} element - 위젯 인스턴스를 생성할 요소
		*   @param {Object} options - 위젯 생성 옵션
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		init : function(element, options){
			var self = this;
			if(!options){
				options = {};
			}
			var elem = $(element);
			var width = elem.data("gs-width");
			var height = elem.data("gs-height");
			var type = options.type ? options.type : elem.data("type");
			if(!type){
				console.error("there is no widget type.");
				return;
			}

			var cardOptions = cardTypeOptions[type];

			if(!cardOptions){
				console.error("there is no options for " + type);
				return;
			}

			var cards = cardOptions.cards;
			if(!cards){
				console.error("there is no card options for " + type);
				return;
			}
			var i, max = cards.length;

			var newOptions = {};
			for( i = 0; i < max; i++ ){
				if(cards[i].width == width &&
				   cards[i].height == height){
					$.extend(newOptions, options, cards[i]);
					break;
				}
			}

			var I18N = window.I18N;

			newOptions.title = I18N.prop(cardOptions.title);

			// &#039 (jsp html 등에 정적으로 들어가는 ' 을 표시 하기 위함 문자) 치환을 위한 부분
			newOptions.title = newOptions.title.replace('&#039;', "'");

			Widget.fn.init.call(self, element, newOptions);
			self.gridStack = elem.closest(".grid-stack").data("gridstack");
			self.headerElem = elem.find(".dashboard-card-header");
			self.titleElem = elem.find(".dashboard-card-title");
			self.closeBtn = elem.find(".dashboard-card-icons .ic-close");
			self.pinBtn = elem.find(".dashboard-card-icons .ic-pin");
			self.refreshBtn = elem.find(".dashboard-card-icons .ic-refresh");
			self.bodyElem = elem.find(".dashboard-card-body");
			self.loading = new LoadingPanel(self.element.find(".dashboard-card-wrapper"));
			self._renderTemplate();
			self._attachEvent();
			self._refresh();
			if(elem.data("pinned")){
				self.pinBtn.trigger("click");
			}
			self._attachRefreshEvt();
		},
		/**
		*
		*   <ul>
		*       <li>카드가 Refresh 될 때의 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachRefreshEvt
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_attachRefreshEvt : function(){
			var refreshOpt = this.options.refreshOption;
			var self = this;
			var DEFAULT_TIMEOUT = 60000;
			var refreshInterval;
			if(refreshOpt && refreshOpt.timeout){
				if($.isFunction(refreshOpt.timeout)){
					refreshInterval = function(){
						// console.log("refresh opt func");
						// console.log(refreshOpt.timeout({ sender : self }));
						if(refreshOpt.timeout({ sender : self })){
							self._refresh();
						}
					};
					this.refreshInterval = setInterval(refreshInterval, DEFAULT_TIMEOUT);
				}else{
					var timeout = refreshOpt.timeout;
					if(!timeout){
						return;
					}

					refreshInterval = function(){
						// console.log("refresh opt another timeout");
						self._refresh();
					};
					this.refreshInterval = setInterval(refreshInterval, timeout);
				}
			}
		},
		/**
		*
		*   <ul>
		*       <li>카드 내 버튼들에 대하여 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachEvent
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_attachEvent : function(){
			var self = this;
			self.pinBtn.on("click", self._pinBtnEvt);
			self.refreshBtn.on("click", self._refreshBtnEvt);
			self.closeBtn.on("click", self._closeBtnEvt);
			self.bodyElem.on("click", self._moveLinkEvt);
		},
		/**
		*
		*   <ul>
		*       <li>카드의 Link가 존재하면 특정 Link로 페이지를 이동시킨다.</li>
		*   </ul>
		*   @function _moveLinkEvt
		*	@param {Object} evt -이벤트 객체
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_moveLinkEvt : function(evt){
			var pinBtnElem = $(this);
			var cardItem = pinBtnElem.closest(".dashboard-card-item");
			var widget = cardItem.data("kendoCard");
			if(!widget.options.menuUrl){
				return;
			}

			var isException = widget._exceptionMoveLink(evt.target);
			if(!isException){
				if(widget.options.onMoveMenu && $.isFunction(widget.options.onMoveMenu)){
					widget.options.onMoveMenu();
				}
				widget.moveMenu();
			}
		},
		_exceptionMoveLink : function(target){
			target = $(target);
			//탭 예외처리
			var tabs = target.closest(".k-tabstrip-items");
			if(tabs.length > 0){
				return true;
			}

			return false;
		},
		/**
		*
		*   <ul>
		*       <li>카드의 Pin 버튼 클릭 이벤트를 처리한다. 카드를 고정/고정해제, UI 상태를 업데이트한다.</li>
		*   </ul>
		*   @function _pinBtnEvt
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_pinBtnEvt : function(){
			var pinBtnElem = $(this);
			var cardItem = pinBtnElem.closest(".dashboard-card-item");
			var widget = cardItem.data("kendoCard");
			var closeBtn = pinBtnElem.siblings(".ic-close");
			if(cardItem.hasClass("dashboard-card-lock")){
				widget._pin(false);
				widget.element.attr("data-pinned", false);
				closeBtn.removeClass("disabled");
				cardItem.removeClass("dashboard-card-lock");
				widget.trigger("onPin", { pinned : false });
			}else{
				widget._pin(true);
				widget.element.attr("data-pinned", true);
				closeBtn.addClass("disabled");
				cardItem.addClass("dashboard-card-lock");
				widget.trigger("onPin", { pinned : true });
			}
		},
		/**
		*
		*   <ul>
		*       <li>카드의 닫기 버튼 클릭 이벤트를 처리한다.</li>
		*   </ul>
		*   @function _closeBtnEvt
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_closeBtnEvt : function(){
			var btnElem = $(this);
			if(btnElem.hasClass("disabled")){
				return;
			}
			var cardItem = btnElem.closest(".dashboard-card-item");
			var widget = cardItem.data("kendoCard");
			widget._close();
		},
		/**
		*
		*   <ul>
		*       <li>카드의 새로고침 버튼 클릭 이벤트를 처리한다.</li>
		*   </ul>
		*   @function _refreshBtnEvt
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_refreshBtnEvt : function(){
			var btnElem = $(this);
			var cardItem = btnElem.closest(".dashboard-card-item");
			var widget = cardItem.data("kendoCard");
			widget._refresh();
		},
		/**
		*
		*   <ul>
		*       <li>카드를 삭제 한다. Widget 인스턴스를 소멸시키며, 삭제된 카드의 형태를 변경하여 Card Drawer로 이동시킨다.</li>
		*   </ul>
		*   @function _cloes
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_close : function(){
			var self = this;
			self.trigger("onClose");
			self.destroy();
			self.gridStack.removeWidget(self.element);

			if(self.options.drawerElement){
				var category = self.element.data("category");
				var categoryElem = self.options.drawerElement.find(".dashboard-drawer-category-" + category);
				var type = self.element.data("type");
				var width = self.element.data("width");
				var height = self.element.data("height");

				var existCard = categoryElem.find(".dashboard-card-item[data-type='" + type + "'][data-width='" + width + "'][data-height='" + height + "']");

				if(self.element.data("multiple") && existCard.length > 0){
					self.element.remove();
					return;
				}

				self.element.addClass("card");
				var bodyElem = self.element.find(".dashboard-card-body");
				bodyElem.empty();
				var imgElem = $("<img/>").addClass("dashboard-card-drawer-category").attr("src", Util.addBuildDateQuery("../../src/main/resources/static-dev/images/icon/ic_drawer_chart_" + self.element.data("view-type") + ".png"));
				var headerElem = self.element.find(".dashboard-card-header");
				var countElem = $("<div/>").addClass("count");

				$("<span/>").addClass("row").text(width).appendTo(countElem);
				$("<span/>").text("X").appendTo(countElem);
				$("<span/>").addClass("col").text(height).appendTo(countElem);
				countElem.appendTo(headerElem);
				imgElem.appendTo(bodyElem);
				self.element.appendTo(categoryElem);
				if(self.options.cardDraggableOptions){
					if(self.element.data("uiDraggable")){
						self.element.data("uiDraggable").destroy();
					}
					if(self.element.data("uiResizable")){
						self.element.data("uiResizable").destroy();
					}
					self.element.draggable(self.options.cardDraggableOptions);
				}
			}
			self.trigger("onClosed");

			//self.element.remove();

		},
		/**
		*
		*   <ul>
		*       <li>Template에 따라 Card를 렌더링하고, 옵션에 존재하는 ViewModel을 바인딩한다.</li>
		*   </ul>
		*   @function _renderTemplate
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_renderTemplate : function(){
			var self = this;
			var template = self.options.template;
			var key;

			self.titleElem.text(self.options.title);
			//bind view model
			self.options.viewModel = kendo.observable(self.options.viewModel);
			var viewModel = self.options.viewModel;
			var templateData;
			if(self.options.localeTemplateData){
				templateData = $.extend(true, {}, self.options.localeTemplateData);
				var I18N = window.I18N;
				for(key in templateData){
					templateData[key] = I18N.prop(templateData[key]);
				}
			}

			if(self.options.templateData){
				templateData = $.extend(templateData, self.options.templateData);
			}

			if(templateData){
				template = kendo.template(template);
				template = template(templateData);
				//Pass the data to the compiled template
			}

			self.bodyElem.html(template);
			var content = self.bodyElem.find(".dashboard-body-content");
			kendo.bind(content, viewModel);
			this.content = content;
			this.viewModel = viewModel;
			this.viewModel.thisOptions = self.options;
			self.options.widget = self;

			if(self.options.init && $.isFunction(self.options.init)){
				var data = self.element.data();
				var argKey, arg = {};
				for( key in data ){
					if(key.indexOf("arg") != -1){
						argKey = key.replace("arg", "");
						key.charAt(0).toLowerCase();
						arg[argKey] = data[key];
					}
				}
				if($.isEmptyObject(arg)){
					arg = null;
				}
				self.options.init(arg);
			}
		},
		destroy : function(){
			if(typeof this.refreshInterval !== "undefined"){
				clearInterval(this.refreshInterval);
			}
			kendo.unbind(this.content, this.viewModel);
			Widget.fn.destroy.call(this);
		},
		/**
		*
		*   <ul>
		*       <li>Refresh 동작을 수행한다.</li>
		*   </ul>
		*   @function _refresh
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		_refresh : function(){
			var self = this;
			var url = self.options.refreshUrl;
			var refreshFunc = self.options.refreshFunc;
			if(refreshFunc && $.isFunction(refreshFunc)){
				return refreshFunc();
			}
			if(!url){
				return;
			}
			self.loading.open(self.element.find(".dashboard-card-wrapper"));
			return $.ajax({
				url : url
			}).done(function(data){
				//update ui
				//set View Model
				self.bodyElem.find(".dashboard-error-panel").remove();
				var key;
				if(self.options.viewModel){
					if(self.options.mockData){
						data = self.options.mockData;
						for(key in data){
							self.options.viewModel.set(key, data[key]);
						}
					}else if(self.options.parseData){
						self.options.parseData(data);
					}
					//reference to server api.
				}
			}).fail(function(xhq){
				self.responseFailCallback(xhq);
			}).always(function(){
				self.loading.close();
			});
		},
		refresh : function(){
			return this._refresh();
		},
		moveMenu : function(){
			var self = this;
			var url = self.options.menuUrl;
			var link = window.location.protocol + "//" + window.location.host + FRONT_END_URL + url;
			window.location.href = link;
		},
		_pin : function(isPinned){
			this.gridStack.movable(this.element, !isPinned);
		},
		/**
		*
		*   <ul>
		*       <li>Card 내 API 호출 시, 400~500 응답이 발생할 경우의 예외처리를 한다.</li>
		*   </ul>
		*   @function responseFailCallback
		*	@param {Object} xhq -응답 객체
		*   @returns {void}
		*   @alias module:app/dashboard/widget/card
		*
		*/
		responseFailCallback : function(xhq){
			var self = this;
			var errorPanel, status = xhq.status;
			var title, msg;
			var I18N = window.I18N;
			if(status == 0){
				title = I18N.prop("COMMON_ERROR_DISCONNECTED_TITLE");
				msg = I18N.prop("COMMON_ERROR_DISCONNECTED_MSG");
			}else if(status == 401){
				title = I18N.prop("DASHBOARD_ERROR_AUTH_TITLE");
				msg = I18N.prop("DASHBOARD_ERROR_AUTH_MSG");
			}else{
				title = I18N.prop("DASHBOARD_ERROR_LOADING_TITLE");
				msg = I18N.prop("DASHBOARD_ERROR_LOADING_MSG");
			}

			errorPanel = errorTemplate({ title : title, message : msg});
			self.bodyElem.append(errorPanel);
		}
	});

	//jQuery를 통해 요소에서 호출할 수 있도록 플러그인 등록
	kendo.ui.plugin(newWidget);

})(window, jQuery);
//# sourceURL=dashboard/widget/card.js
