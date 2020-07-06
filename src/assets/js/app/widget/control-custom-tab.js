/**
*
*   <ul>
*       <li>실내기 제어 패널 UI Component(Widget)</li>
*       <li>실내기의 상태를 표시한다.</li>
*       <li>실내기 온도, 모드, 풍량, 풍향 등을 제어한다.</li>
*   </ul>
*   @module app/widget/control-custom-tab
*
*/
(function ($) {
	/*
		제어 패널 템플릿
	*/

	/**
	*
	*   <ul>
	*   <li>제어 패널의 HTML 템플릿 String</li>
	*   </ul>
	*   @type {HTMLString}
	*   @name CONTROL_PANEL_TEMPLATE
	*   @alias module:app/widget/control-custom-tab
	*
	*/
	var CONTROL_PANEL_TEMPLATE = '<div class="container" style="height:100%;">' +
		'<ul id="panelbar" style="height:100%" class="indoor-control-panel control">' +
			'<li id="item1">#=indoor#' +
				'<div class="innerBox" style="height: 490px; overflow: scroll;">' +
					'<div data-bind="invisible:btnPower0">' +
						'<button id="btnPower0" class="colorbox" disabled><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button>' +
					'</div>' +
					'<div class="indoor-mode-title" data-bind="invisible:rgIndoorMode">' +
						'<p class="bluetit">#=indoorMode#</p>' +
						'<div id="rgIndoorMode" class="radiogroup"></div>' +
					'</div>' +
					'<div class="chiller-mode-title" data-bind="invisible:rgChillerMode">' + //rgChillerMode가 표시되지 않는 상태이면 -> id가 rgChillerMode인 요소가 표시되지 않음. invisible과 id의 매핑 관계 존재
						'<p class="bluetit">#=chillerMode#</p>' +
						'<div id="rgChillerMode" class="radiogroup"></div>' +
					'</div>' +
					'<div class="indoor-temperature-title" data-bind="invisible:isIndoorTemperature()">' +
						'<p class="bluetit">#=temperature#</p>' +
						'<input id="inpTemperature0" title="#=setTemp#" data-bind="invisible:inpTemperature0" disabled/>' +
						'<div class="blank10" data-bind="invisible:isInpTemperature1()"></div>' +
						'<input id="inpTemperature1" title="#=waterOut#" data-bind="invisible:isInpTemperature1()" disabled/>' +
						'<div class="blank10" data-bind="invisible:isInpTemperature2()"></div>' +
						'<input id="inpTemperature2" title="#=discharge#" data-bind="invisible:isInpTemperature2()" disabled/>' +
					'</div>' +
					'<div data-bind="invisible:isRgIndoorFanSpeed()">' +
						'<p class="bluetit">#=fanSpeed#</p>' +
						'<div id="rgIndoorFanSpeed" class="radiogroup"></div>' +
					'</div>' +
					'<div data-bind="invisible:isWindDirection()">' +
						'<p class="bluetit">#=windDirection#</p>' +
						'<div id="rgIndoorWindDirection0" class="radiogroup"></div>' +
						'<div id="rgIndoorWindDirection1" class="radiogroup"></div>' +
					'</div>' +
					'<div data-bind="invisible:isRgIndoorOperationLimit()">' +
						'<p class="bluetit">#=operationLimit#</p>' +
						'<div id="rgIndoorOperationLimit" class="radiogroup"></div>' +
					'</div>' +
					'<div class="numeric" data-bind="invisible:isIndoorTempLimit()">' +
						'<p class="bluetit">#=indoorTempLimit#</p>' +
						'<div class="tb" data-bind="invisible:btnTempLimit1">' +
							'<button id="btnTempLimit1" class="bound btncontrol" disabled>#=heatUpperLimit#</button>' +
							'<input id="inpTempLimit1" disabled />' +
						'</div>' +
						'<div style="margin-top: 10px;" class="tb" data-bind="invisible:btnTempLimit0">' +
							'<button id="btnTempLimit0" class="bound btncontrol" disabled>#=coolLowerLimit#</button>' +
							'<input id="inpTempLimit0" disabled/>' +
						'</div>' +
					'</div>' +
					'<div class="numeric" data-bind="invisible:isIndoorWaterOutTempLimit()">' + //함수로 되어있지 않은 경우에는 invisible 어트리뷰트 값과 요소의 id 값이 매핑되고, 함수로 되어있는 경우에는 다른 조건들을 체크하기위하여 함수로되어있는 것임. 아래 함수명 검색하여 코드 참조 가능
						'<p class="bluetit">#=waterOutTempLimit#</p>' +
						'<div class="tb" data-bind="invisible:btnTempLimit3">' +
							'<button id="btnTempLimit3" class="bound btncontrol" disabled>#=heatUpperLimit#</button>' +
							'<input id="inpTempLimit3" disabled/>' +
						'</div>' +
						'<div class="tb" style="margin-top: 10px;" data-bind="invisible:btnTempLimit2">' +
							'<button id="btnTempLimit2" class="bound btncontrol" disabled>#=coolLowerLimit#</button>' +
							'<input id="inpTempLimit2" disabled/>' +
						'</div>' +
					'</div>' +
					'<div data-bind="invisible:isBtnDischarge()">' +
						'<p class="bluetit">#=dischargeTempControl#</p>' +
						'<button id="btnDischarge" class="colorbox">ON/OFF</button>' +
					'</div>' +
					'<div data-bind="invisible:isBtnOption3()">' +
						'<p class="bluetit">#=windFree#</p>' +
						'<button id="btnOption3" class="colorbox" disabled>ON/OFF</button>' +
					'</div>' +
					'<div data-bind="invisible:isRgIndoorChillerMcc()">' +
						'<p class="bluetit">#=operationPattern#</p>' +
						'<div id="rgIndoorChillerMcc" class="radiogroup"></div>' +
					'</div>' +
					'<div data-bind="invisible:isBtnChiller0()">' +
						'<p class="bluetit">#=optimumWaterTempControl#</p>' +
						'<button id="btnChiller0" class="colorbox" disabled>#=none#</button>' +
					'</div>' +
					'<div data-bind="invisible:isBtnChiller1()">' +
						'<p class="bluetit">#=quiteMode#</p>' +
						'<button id="btnChiller1" class="colorbox" disabled>ON/OFF</button>' +
					'</div>' +
					'<div data-bind="invisible:isBtnChiller2()">' +
						'<p class="bluetit">#=snowProtection#</p>' +
						'<button id="btnChiller2" class="colorbox" disabled>ON/OFF</button>' +
					'</div>' +
					'<div class="numeric" data-bind="invisible:isBtnChiller3()">' +
						'<p class="bluetit">#=demandSetting#</p>' +
						'<div class="tb">' +
							'<button id="btnChiller3" class="bound btncontrol" disabled>ON/OFF</button>' +
							'<input id="inpDemand" min="50" max="100" disabled />' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</li>' +
			'<li id="item2">#=ventilator#' +
				'<div class="innerBox" style="height: 490px;" >' +
					'<div data-bind="invisible:btnPower1">' +
						'<button id="btnPower1" class="colorbox" disabled><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button>' +
					'</div>' +
					'<div data-bind="invisible:rgVentilatorMode">' +     //
						'<p class="bluetit">#=ventilatorMode#</p>' +
						'<div id="rgVentilatorMode" class="radiogroup"></div>' +
					'</div>' +

					'<div data-bind="invisible:isRgVentilatorFanSpeed()">' +
						'<p class="bluetit">#=ventilatorFanSpeed#</p>' +
						'<div id="rgVentilatorFanSpeed" class="radiogroup"></div>' +
					'</div>' +
				'</div>' +
			'</li>' +
			'<li id="item3">#=dhw#' +
				'<div class="innerBox" style="height: 490px;" data-bind="invisible:hideDHW">' +
					'<div data-bind="invisible:btnPower2">' +
						'<button id="btnPower2" class="colorbox"><span class="icwrap"><i class="icon power"></i>ON/OFF</span></button>' +
					'</div>' +
					'<div data-bind="invisible:inpTemperature3">' +
						'<p class="bluetit">#dhwTemp#</p>' +
						'<input id="inpTemperature3" title="#=setTemp#" disabled/>' +
					'</div>' +
					'<div data-bind="invisible:rgDhwOperationMode">' +
						'<p class="bluetit">#=dhwOperationMode#</p>' +
						'<div id="rgDhwOperationMode" class="radiogroup"></div>' +
					'</div>' +
					'<div data-bind="invisible:isBtnTempLimit4()">' +
						'<p class="bluetit">#=dhwUpperTempLimit#</p>' +
						'<div class="numeric">' +
							'<div class="tb">' +
								'<button id="btnTempLimit4" class="bound btncontrol" disabled>#=upperLimit#</button>' +
								'<input id="inpTempLimit4" disabled />' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</li>' +
			'<li id="item4">#=options#' +
				'<div class="innerBox" style="height: 490px;">' +
					'<div data-bind="invisible:rgOptionRemote">' +
						'<p class="bluetit">#remoteControl#</p>' +
						'<div id="rgOptionRemote" class="radiogroup"></div>' +
					'</div>' +
					'<div data-bind="invisible:isBtnOption1()">' +
						'<p class="bluetit">#=filterRest#</p>' +
						'<button id="btnOption1" class="colorbox" disabled>#=filterRest#</button>' +
					'</div>' +
					'<div data-bind="invisible:isBtnOption2()">' +
						'<p class="bluetit">#=spiSetting#</p>' +
						'<button id="btnOption2" class="colorbox" disabled>ON/OFF</button>' +
					'</div>' +
				'</div>' +
			'</li>' +
		'</ul>' +
	'</div>';

	var kendo = window.kendo,
		ui = kendo.ui,
		Widget = ui.Widget;
	"use strict";

	var I18N;            //I18N 라이브러리 참조

	//설치정보 관련 변수

	//[설치정보NO.]제어패널 표시여부
	var POWER_INDEX = "0";

	//[설치정보NO.]실내기 운전모드
	var INDOOR_MODE_INDEX = "1";
	var INDOOR_CHILLER_MODE_INDEX = "16"; //chiller mode가 추가됨.(installation info는 실내기 운전모드1 에 포함됨)
	//[설치정보NO.]실내기 풍량
	var INDOOR_FAN_SPEED_INDEX = "2";
	//[설치정보NO.]온도 지원 여부
	var TEMPERATURE_INDEX = "3";
	//[설치정보NO.]운전모드 제한
	var INDOOR_OPERATION_LIMIT_INDEX = "4";
	//[설치정보NO.]온도 제한
	var TEMPERATURE_LIMIT_INDEX = "5";
	//[설치정보NO.]실내기 옵션
	var OPTION_INDEX = "6";
	//[설치정보NO.]실내기 기류제어1
	var INDOOR_WIND_DIRECTION0_INDEX = "7";
	//[설치정보NO.]실내기 기류제어2
	var INDOOR_WIND_DIRECTION1_INDEX = "8";
	//[설치정보NO.]ERV 운전모드
	var VENTILATOR_MODE_INDEX = "9";
	//[설치정보NO.]ERV 풍량
	var VENTILATOR_FAN_SPEED_INDEX = "10";
	//[설치정보NO.]급탕운전모드
	var DHW_OPERATION_MODE_INDEX = "11";
	//[설치정보NO.]Chiller
	var INDOOR_CHILLER_INDEX = "12";
	//[설치정보NO.]Chiller MCC 모드
	var INDOOR_CHILLER_MCC_INDEX = "13";

	//[설치정보No. 총 개수]
	var INSTALLATION_INFO_COUNT = 14;

	var ONLY_TEMP_LIMIT_INDEX = "14";
	var ONLY_TEMP_INDEX = "15";
	var ONLY_DEMAND_INDEX = "17";

	var POWER_COUNT = 3;
	var CHILLER_COUNT = 4;
	var TEMPERATURE_COUNT = 4;

	var TEMPERATURE_LIMIT_COUNT = 5;
	var OPTION_COUNT = 4;

	//
	var panelBar;
	var radioGroupView = {};

	var inpTemperature = [];
	var inpTempLimit = [];
	var inpDemand;

	var viewOption = [];
	var EnumTemperature = ["MIN", "MAX", "SET"];

	//실내, 출수, 토출, 급탑 등 모든 온도 최대/최소/설정 온도 값을 갖고 있음. 원본 값을 저장
	var temperatureOriValue; // Upper, Lower Limit 들이 적용되지 않은 원래의 값을 저장할 Object

	//실내, 출수, 토출, 급탑 등 모든 온도 최대/최소/설정 온도 값을 갖고 있음. 상한/하한 제한 값이 반영된 값을 저장
	var temperatureValue;

	var ControlTab = Widget.extend({
		options: {
			name : "ControlTab",
			dataSource: null,
			groupMode: false
		},
		events :[
			"change",
			"expand"
		],
		/**
		*
		*   <ul>
		*       <li>생성자 함수</li>
		*       <li>위젯 옵션과 함께 요소를 초기화한다.</li>
		*       <li>제어 패널 HTML 템플릿을 요소에 Append 하고, ViewModel을 바인딩한다.</li>
		*       <li>각 버튼 및 온도 제어 Component를 초기화한다.</li>
		*   </ul>
		*   @function init
		*   @param {jQueryElement} element - 위젯 인스턴스를 생성할 요소
		*   @param {Object} options - 위젯 생성 옵션
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		init : function(element, options){
			Widget.fn.init.call(this, element, options);

			I18N = window.I18N;
			var templateData = {
				indoor : I18N.prop("FACILITY_INDOOR"),
				indoorMode : I18N.prop("FACILITY_INDOOR_MODE"),
				chillerMode : I18N.prop("FACILITY_INDOOR_CHILLER_MODE"),
				temperature : I18N.prop("COMMON_TEMPERATURE"),
				fanSpeed : I18N.prop('FACILITY_INDOOR_CONTROL_FANSPEED'),
				windDirection : I18N.prop("FACILITY_INDOOR_CONTROL_WIND_DIRECTION"),
				operationLimit : I18N.prop("FACILITY_INDOOR_STATUS_OPERATION_LIMIT"),
				indoorTempLimit : I18N.prop("FACILITY_INDOOR_TEMPERATURE_LIMIT"),
				heatUpperLimit : I18N.prop("FACILITY_INDOOR_STATUS_HEAT_UPPER_LIMIT"),
				coolLowerLimit : I18N.prop("FACILITY_INDOOR_STATUS_COOL_LOWER_LIMIT"),
				waterOutTempLimit : I18N.prop("FACILITY_INDOOR_WATER_OUT_TEMPERATURE_LIMIT"),
				dischargeTempControl : I18N.prop("FACILITY_INDOOR_CONTROL_DISCHARGE_TEMP_CONTROL"),
				windFree : I18N.prop("FACILITY_INDOOR_CONTROL_WIND_FREE"),
				operationPattern : I18N.prop("FACILITY_INDOOR_CONTROL_CHILLER_OPERATION_PATTERN"),
				optimumWaterTempControl : I18N.prop("FACILITY_INDOOR_CONTROL_CHILLER_OPTIMUM_WATER_TEMPERATURE_CONTROL"),
				quiteMode : I18N.prop("FACILITY_INDOOR_CONTROL_CHILLER_QUIET_MODE"),
				snowProtection : I18N.prop("FACILITY_INDOOR_CONTROL_CHILLER_SNOW_PROTECTION"),
				demandSetting : I18N.prop("FACILITY_INDOOR_CONTROL_CHILLER_DEMAND_SETTING"),
				demand : I18N.prop("FACILITY_INDOOR_CONTROL_CHILLER_DEMAND"),
				ventilator : I18N.prop("FACILITY_DEVICE_TYPE_VENTILATOR"),
				ventilatorMode : I18N.prop("FACILITY_INDOOR_CONTROL_VENTILATOR_MODE"),
				ventilatorFanSpeed : I18N.prop("FACILITY_INDOOR_CONTROL_VENTILATOR_FAN_SPEED"),
				dhw : I18N.prop("FACILITY_DEVICE_TYPE_DHW"),
				dhwTemp : I18N.prop("FACILITY_INDOOR_DHW_TEMPERATURE"),
				dhwOperationMode : I18N.prop("FACILITY_INDOOR_DHW_OPERATION_MODE"),
				dhwUpperTempLimit : I18N.prop("FACILITY_INDOOR_DHW_UPPER_TEMPERATURE_LIMIT"),
				upperLimit : I18N.prop("FACILITY_INDOOR_CONTROL_UPPER_LIMIT"),
				options : I18N.prop("FACILITY_INDOOR_OPTIONS"),
				remoteControl : I18N.prop("FACILITY_INDOOR_REMOTE_CONTROL"),
				filterRest : I18N.prop("FACILITY_INDOOR_CONTROL_FILTER_RESET"),
				spiSetting : I18N.prop("FACILITY_INDOOR_CONTROL_SPI_SETTING"),
				none : I18N.prop("FACILITY_INDOOR_CONTROL_NONE"),
				waterOut : I18N.prop("FACILITY_INDOOR_WATER_OUT"),
				discharge : I18N.prop("FACILITY_INDOOR_CONTROL_DISCHARGE"),
				setTemp : I18N.prop("FACILITY_INDOOR_SET")
			};

			var self = this;
			var tempSetting = window.GlobalSettings.getTemperature();
			var unit, step = tempSetting.increment;
			if(tempSetting.unit === "Celsius"){
				unit = "℃";
			}else{
				unit = "℉";
			}

			//return $.get("/front/templates/facility/control.html", function(value) {
			var value = CONTROL_PANEL_TEMPLATE;
			//한/영 적용을 위한 Template 적용
			var template = kendo.template(value);
			template = template(templateData);

			$(element).html(template);

			var btnPower = [];
			var btnTempLimit = [];
			var btnChiller = [];

			var mode = "single";
			if(self.options.groupMode) mode = "multiple";

			self.panelBar = panelBar = $("#panelbar").kendoPanelBar({
				expandMode: mode,
				select: function(e) {
					if(!self.options.groupMode){
						var li = $(e.item);
						if (li.is(".k-state-active")) {
							var that = this;
							window.setTimeout(function(){that.collapse(e.item);}, 1);
						}
					}
				},
				collapse: function(e){
					if(self.options.groupMode) e.preventDefault();
					var index = $(e.item).index();
					e.index = index;
					var expandedData = self.getExpandedData();
					if(expandedData[index]) expandedData[index].expanded = false;
					e.expandedData = expandedData;
					self.trigger("collapse", e);
				},
				expand : function(e){
					var index = $(e.item).index();
					e.index = index;
					var expandedData = self.getExpandedData();
					if(expandedData[index]) expandedData[index].expanded = true;
					e.expandedData = expandedData;
					self.trigger("expand", e);
				},
				activate : function(e){
					var that = this;
					var item = that.element.find("li.k-item.k-state-highlight.k-state-active");
					if(item.length < 1) return;
					var itemHeight = item.height();
					var itemHeader = item.find(".k-link.k-header");
					var itemHeaderHeight = itemHeader.outerHeight();
					var groupHeight = itemHeight - itemHeaderHeight;
					var innerBox = item.find(".innerBox");
					innerBox.height(groupHeight);
					innerBox.css("overflow-y", "auto");
					innerBox.css("overflow-x", "hidden");
				}
			}).data("kendoPanelBar");

			if(self.options.groupMode){
				panelBar.element.addClass("group");
				panelBar.expand($('[id^="item"]'), false);
			}

			self._initRadioGroup();

			var i, view, allowStep;
			for(i = 0; i < POWER_COUNT; i++){
				view = $("#btnPower" + i);
				btnPower[i] = view.kendoCustomControlButton({
					index : i, change : function(e){
						var subIndex = this.options.index;

						//ERV Plus 일 경우, Ventilator 전원이 On 상태이면, Indoor Power 버튼이 활성화/ Off 상태이면 비활성화.
						if(subIndex === 1)
							btnPower[0].enable(e.state === "On" ? true : false);

						self.trigger("change", {item : {value : e.state}, index : POWER_INDEX, subIndex : subIndex});
					}
				}).data("kendoCustomControlButton");
			}

			for(i = 0; i < CHILLER_COUNT; i++){
				view = $("#btnChiller" + i);

				if(i === 0){
					btnChiller[i] = view.kendoCustomControlButton({
						index : i, change : function(e){
							self._enableByChillerWater(e.state);
							self.trigger("change", {item : {value : e.state}, index : INDOOR_CHILLER_INDEX, subIndex : this.options.index});
						}
					}).data("kendoCustomControlButton");
				}else if(i === 3){
					//btnChiller3 == Demand제어
					btnChiller[i] = view.kendoCustomControlButton({
						index : i, change : function(e){
							inpDemand.enable(e.isSelected);
							self.trigger("change", {item : {value : e.state}, index : INDOOR_CHILLER_INDEX, subIndex : this.options.index});
						}
					}).data("kendoCustomControlButton");
				}else{
					btnChiller[i] = view.kendoCustomControlButton({
						index : i, change : function(e){
							self.trigger("change", {item : {value : e.state}, index : INDOOR_CHILLER_INDEX, subIndex : this.options.index});
						}
					}).data("kendoCustomControlButton");
				}
			}

			for(i = 0; i < TEMPERATURE_COUNT; i++){
				view = $("#inpTemperature" + i);
				allowStep = step;
				if(i === 3) allowStep = 1;

				inpTemperature[i] = view.kendoCustomNumericBox({
					index : i, unit : unit, step : allowStep, spin: function(e) {
						var modeValue, subIndex = this.options.index;
						if(subIndex === 2) modeValue = radioGroupView[INDOOR_MODE_INDEX].value();
						self.trigger("change", {item : {value : this.value()}, index : ONLY_TEMP_INDEX, subIndex : subIndex, mode : modeValue});
					}
				}).data("kendoCustomNumericBox");
			}

			//5: 온도제한의 경우 버튼이 Enable되고 그 버튼이 Select 되었을 때 온도조창이 Enable된다.
			for(i = 0; i < TEMPERATURE_LIMIT_COUNT; i++){
				view = $("#inpTempLimit" + i);
				allowStep = step;
				if(i === 4) allowStep = 1;
				inpTempLimit[i] = view.kendoCustomNumericBox({
					index : i, unit : unit, step : allowStep, spin: function(e) {

						var subIndex = this.options.index;
						var tempValue = this.value();
						self._setByTemperatureLimit(subIndex, tempValue);

						self.trigger("change", {item : {value : tempValue}, index : ONLY_TEMP_LIMIT_INDEX, subIndex : subIndex});
					}
				}).data("kendoCustomNumericBox");

				var button = $("#btnTempLimit" + i);
				btnTempLimit[i] = button.kendoCustomControlButton({
					index : i, isChangeText : false,
					change: function(e) {
						var isSelected = e.isSelected;
						var subIndex = this.options.index;
						var tempValue;

						inpTempLimit[subIndex].enable(isSelected);
						if(isSelected) tempValue = inpTempLimit[subIndex].value();

						self._setByTemperatureLimit(subIndex, tempValue);

						self.trigger("change", {item : {value : isSelected}, index : TEMPERATURE_LIMIT_INDEX, subIndex : subIndex});
					}
				}).data("kendoCustomControlButton");
			}

			// btnTempLimit5(출온도제어 버튼은 온도제어 Input 과 연결되지않기때문에 따로 삽입)
			btnTempLimit[TEMPERATURE_LIMIT_COUNT] = $("#btnDischarge").kendoCustomControlButton({
				index : 4,
				change : function(e){
					var temperature = radioGroupView[TEMPERATURE_INDEX];
					var isSelected = e.isSelected;
					var modeValue = radioGroupView[INDOOR_MODE_INDEX].value();
					if(isSelected && (modeValue === "Heat" || modeValue === "Cool"))
						temperature[2].enable(temperature[2].oriEnable());
					else
						temperature[2].enable(false);
					self.trigger("change", {item : {value : isSelected}, index : ONLY_TEMP_INDEX, subIndex : this.options.index});
				}
			}).data("kendoCustomControlButton");

			// 6 : 0번쨰에는 Remote Control RadioGroup 이 들어가므로 index1부터 초기
			for(i = 1; i < OPTION_COUNT; i++){
				view = $("#btnOption" + i);
				// filterReset은 ON/OFF가 없고 클릭시 무조건 false로 메시지가전송.
				if(i === 1){
					viewOption[i] = view.kendoCustomControlButton({
						index : i, isCheckMode : false,
						change : function(e){
							self.trigger("change", {item : {value : true}, index : OPTION_INDEX, subIndex : this.options.index});
						}
					}).data("kendoCustomControlButton");
				}else if(i === 3){
					//3은 무풍제어.
					viewOption[i] = view.kendoCustomControlButton({
						index : i,
						change : function(e){
							self._enableByOptionWindFree(e.state);
							self.trigger("change", {item : {value : e.state}, index : OPTION_INDEX, subIndex : this.options.index});
						}
					}).data("kendoCustomControlButton");
				}else{
					viewOption[i] = view.kendoCustomControlButton({
						index : i,
						change : function(e){
							self.trigger("change", {item : {value : e.state}, index : OPTION_INDEX, subIndex : this.options.index});
						}
					}).data("kendoCustomControlButton");
				}
			}

			radioGroupView[POWER_INDEX] = btnPower;

			radioGroupView[TEMPERATURE_INDEX] = inpTemperature;
			radioGroupView[TEMPERATURE_LIMIT_INDEX] = btnTempLimit;
			radioGroupView[INDOOR_CHILLER_INDEX] = btnChiller;
			radioGroupView[OPTION_INDEX] = viewOption;

			inpDemand = $("#inpDemand").kendoCustomNumericBox({
				step: 5, unit : "%", format: "#", spin: function(e) {
					self.trigger("change", {item : {value : this.value()}, index : ONLY_DEMAND_INDEX});
				}
			}).data("kendoCustomNumericBox");

			if(!self.options.groupMode) panelBar.collapse();

			self.viewModel = kendo.observable({
				isWindDirection: function() {
					return self.options.groupMode ? true : this.get("rgIndoorWindDirection0") && this.get("rgIndoorWindDirection1");
				},

				isInpTemperature1: function() {
					return self.options.groupMode ? true : this.get("inpTemperature1");
				},
				isInpTemperature2: function() {
					return self.options.groupMode ? true : this.get("inpTemperature2");
				},

				isIndoorTemperature: function() {
					if(self.options.groupMode){
						return this.get("inpTemperature1") && this.get("inpTemperature2");
					}
					return this.get("inpTemperature0") && this.get("inpTemperature1") && this.get("inpTemperature2");
				},
				isIndoorTempLimit: function() {
					return self.options.groupMode ? true : this.get("btnTempLimit0") && this.get("btnTempLimit1");
				},
				isIndoorWaterOutTempLimit: function() {
					return self.options.groupMode ? true : this.get("btnTempLimit2") && this.get("btnTempLimit3");
				},
				isRgIndoorFanSpeed: function(){
					return self.options.groupMode ? true : this.get("rgIndoorFanSpeed");
				},
				isRgIndoorOperationLimit : function(){
					return self.options.groupMode ? true : this.get("rgIndoorOperationLimit");
				},
				isRgIndoorChillerMcc : function(){
					return self.options.groupMode ? true : this.get("rgIndoorChillerMcc");
				},
				isBtnDischarge: function(){
					return self.options.groupMode ? true : this.get("btnDischarge");
				},
				isBtnChiller0: function(){
					return self.options.groupMode ? true : this.get("btnChiller0");
				},
				isBtnChiller1: function(){
					return self.options.groupMode ? true : this.get("btnChiller1");
				},
				isBtnChiller2: function(){
					return self.options.groupMode ? true : this.get("btnChiller2");
				},
				isBtnChiller3: function(){  //Group 제어패널 모드 일 경우를 체크한다.
					return self.options.groupMode ? true : this.get("btnChiller3");
				},

				isBtnOption1: function(){
					return self.options.groupMode ? true : this.get("btnOption1");
				},
				isBtnOption2: function(){
					return self.options.groupMode ? true : this.get("btnOption2");
				},
				isBtnOption3: function(){
					return self.options.groupMode ? true : this.get("btnOption3");
				},
				isRgVentilatorFanSpeed : function(){
					return self.options.groupMode ? true : this.get("rgVentilatorFanSpeed");
				},
				isBtnTempLimit4 : function(){
					return self.options.groupMode ? true : this.get("btnTempLimit4");
				}
			});
			kendo.bind($("#panelbar"), self.viewModel);
			//});
		},
		_setByTemperatureLimit : function(subIndex, value){
			var mode = radioGroupView[INDOOR_MODE_INDEX].value();
			var ttype, tmode, taply, tidx;
			var temperature, tempValue;
			//Dhw upper limit
			if(subIndex === 4){
				tidx = 3;
				temperature = radioGroupView[TEMPERATURE_INDEX];
				tempValue = temperature[tidx].value();

				//급탕상한온도 값이 존재하면, 급탕 설정 온도의 최대값을 Set한다.
				//급탕상한온도 정보가 존재하나, 급탕 설정 온도 정보가 없을 경우 존재하지 않는 "DHW"를 키 값으로 참조하여 에러 발생하여 예외처리
				if(!value && typeof temperatureOriValue["DHW"] !== "undefined") value = temperatureOriValue["DHW"]["MAX"];
				if(typeof temperatureValue["DHW"] !== "undefined") temperatureValue["DHW"]["MAX"] = value;

				temperature[tidx].max(value);
				temperature[tidx].value(tempValue);
			}else{
				// Normal Cool lower
				if(subIndex === 0){
					tidx = 0;
					ttype = "Room"; tmode = "Cool"; taply = "MIN";
				}else if(subIndex === 1){
					// Normal Heat Upper
					tidx = 0;
					ttype = "Room"; tmode = "Heat"; taply = "MAX";
				}else if(subIndex === 2){
					//Waterout Cool lower
					tidx = 1;
					ttype = "WaterOut"; tmode = "Cool"; taply = "MIN";
				}else if(subIndex === 3){
					//Waterout Heat Upper
					tidx = 1;
					ttype = "WaterOut"; tmode = "Heat"; taply = "MAX";
				}

				if(!value) value = temperatureOriValue[ttype][tmode][taply];

				temperatureValue[ttype][tmode][taply] = value;
				if(mode === tmode){
					temperature = radioGroupView[TEMPERATURE_INDEX];
					tempValue = temperature[tidx].value();
					if(taply === "MIN") temperature[tidx].min(value);
					else temperature[tidx].max(value);
					temperature[tidx].value(tempValue);
				}
			}
		},
		/**
		*
		*   <ul>
		*       <li>그룹 버튼을 초기화한다.</li>
		*       <li>모드, 칠러모드, 풍량, 풍향 등</li>
		*   </ul>
		*   @function _initRadioGroup
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_initRadioGroup : function(){
			var self = this;
			var rgIndoorModeData = [
				{id: 0, value: "Auto", icon : "ic-auto-g", text : I18N.prop("FACILITY_INDOOR_MODE_AUTO")},
				{id: 1, value: "Cool", icon : "ic-cool-g", text : I18N.prop("FACILITY_INDOOR_MODE_COOL")},
				{id: 2, value: "Heat", icon : "ic-heat-g", text : I18N.prop("FACILITY_INDOOR_MODE_HEAT")},
				{id: 3, value: "Dry", icon : "ic-dry-g", text : I18N.prop("FACILITY_INDOOR_MODE_DRY")},
				{id: 4, value: "Fan", icon : "ic-fan-g", text : I18N.prop("FACILITY_INDOOR_MODE_FAN")}
			];

			var rgChillerModeData = [
				{id: 0, value: "CoolStorage", icon : "ic-coolwater-g ", text : I18N.prop("FACILITY_INDOOR_MODE_COOLST")},
				{id: 1, value: "HeatStorage", icon : "ic-hotwater-g", text : I18N.prop("FACILITY_INDOOR_MODE_HOTWATER")}
			];

			var rgIndoorFanSpeedData = [
				{id: 0, value: "Auto", icon : "ic-fan-auto-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_FAN_SPEED_AUTO")},
				{id: 1, value: "Low", icon : "ic-fan-low-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_FAN_SPEED_LOW")},
				{id: 2, value: "Mid", icon : "ic-fan-mid-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_FAN_SPEED_MID")},
				{id: 3, value: "High", icon : "ic-fan-high-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_FAN_SPEED_HIGH")},
				{id: 4, value: "Turbo", icon : "ic-fan-turbo-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_FAN_SPEED_TURBO")}
			];

			var rgIndoorWindDirection0Data = [
											  {id: 0, value: "UpDown", icon : "ic-wind-vertical-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_WIND_DIRECTION_VERTICAL")},
											  {id: 1, value: "LeftRight", icon : "ic-wind-horizon-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_WIND_DIRECTION_HORIZONTAL")},
											  {id: 2, value: "All", icon : "ic-wind-all-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_WIND_DIRECTION_ALL")},
											  {id: 3, value: "Fix", icon : "ic-wind-fix-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_WIND_DIRECTION_FIX")}
											  ];
			var rgIndoorWindDirection1Data = [
											  {id: 0, value: "Spot", icon : "ic-wind-spot-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_WIND_DIRECTION_SPOT")},
											  {id: 1, value: "Mid", icon : "ic-wind-mid-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_WIND_DIRECTION_MID")},
											  {id: 2, value: "Wide", icon : "ic-wind-wide-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_WIND_DIRECTION_WIDE")},
											  {id: 3, value: "Swing", icon : "ic-wind-swing-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_WIND_DIRECTION_SWING")}
											  ];

			var rgIndoorOperationLimitData = [
											  {id: 0, value: "CoolOnly", icon : "ic-cool-g", text : I18N.prop("FACILITY_INDOOR_MODE_COOLONLY")},
											  {id: 1, value: "HeatOnly", icon : "ic-heat-g", text : I18N.prop("FACILITY_INDOOR_MODE_HEATONLY")},
											  {id: 2, value: "NoLimit", icon : "ic-nolimit-g", text : I18N.prop("FACILITY_INDOOR_MODE_NOLIMIT")}
											  ];

			var rgIndoorChillerMccData = [
										  {id: 0, value: "Standard", icon : "ic-pattern-all-g", text : I18N.prop("FACILITY_CONTROL_INDOOR_CHILLER_MCC_STANDARD")},
										  {id: 1, value: "Rotation", icon : "ic-pattern-rotate-g", text : I18N.prop("FACILITY_INDOOR_MODE_ROTATION")},
										  {id: 2, value: "Efficiency", icon : "ic-pattern-eff-g", text : I18N.prop("FACILITY_INDOOR_MODE_EFFICIENCY")}
										  ];

			var rgVentilatorData = [
				{id: 0, value: "Auto", icon : "ic-heat-auto-g", text : I18N.prop("FACILITY_INDOOR_MODE_AUTO")},
				{id: 1, value: "HeatExchange", icon : "ic-heat-ex-g", text : I18N.prop("FACILITY_INDOOR_MODE_HEATEX")},
				{id: 2, value: "ByPass", icon : "ic-heat-bypass-g", text : I18N.prop("FACILITY_INDOOR_MODE_BYPASS")},
				{id: 3, value: "Sleep", icon : "ic-heat-sleep-g", text : I18N.prop("FACILITY_INDOOR_MODE_SLEEP")}
			];

			var rgVentilatorFanSpeedData = [
				{id: 0, value: "Mid", icon : "ic-fan-mid-g", text : I18N.prop("FACILITY_INDOOR_CONTROL_LOW_MID")},
				{id: 1, value: "High", icon : "ic-fan-high-g", text : I18N.prop("FACILITY_CONTROL_VENTILATOR_FAN_SPEED_HIGH")},
				{id: 2, value: "Turbo", icon : "ic-fan-turbo-g", text : I18N.prop("FACILITY_CONTROL_VENTILATOR_FAN_SPEED_TURBO")}
			];

			var rgDhwOperationModeData = [
										  {id: 0, value: "Eco", icon : "ic-dhw-eco-g", text : I18N.prop("FACILITY_INDOOR_MODE_ECO")},
										  {id: 1, value: "Standard", icon : "ic-dhw-standard-g", text : I18N.prop("FACILITY_INDOOR_MODE_STANDARD")},
										  {id: 2, value: "Power", icon : "ic-dhw-power-g", text : I18N.prop("FACILITY_INDOOR_MODE_POWER")},
										  {id: 3, value: "Force", icon : "ic-dhw-force-g", text : I18N.prop("FACILITY_INDOOR_MODE_FORCE")}
										  ];

			var rgOptionRemoteData = [
									  {id: 0, value: "Allowed", text : I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_PERMIT")},
									  {id: 1, value: "NotAllowed", text : I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_PROHIBIT")}
				//			                          {id: 2, value: "ConditionallyAllowed", icon : "ic-dhw-standard-g", text : I18N.prop("FACILITY_CONTROL_OPTION_REMOTE_CONTROL_CONDITIONAL")}
									  ];

			var rgIndoorMode = $("#rgIndoorMode").kendoCustomRadioButtonGroup({
				dataSource: rgIndoorModeData, groupName: "rgIndoorMode",
				id: "id", value: "value", icon: "icon", text: "text", index: INDOOR_MODE_INDEX,
				change : function(e){
					//버튼의 checked 체크 상태를 초기화
					rgChillerMode.clear();
					/*
					 * 풍량 : . 자동, 제습 모드 일 때 : 자동풍만 선택 가능하다. 나머지 풍량 DIM 된다.
					 * 냉방, 난방 모드 일 때 : 모든 풍량 선택 가능하다.
					 * 송풍 모드 일 때 : 자동풍은 DIM된다.
					 */
					var value = e.dataItem.value;
					self._enableByIndoorMode(value, true);
					self._changeRadioGroupEvent(e);
				}
			}).data("kendoCustomRadioButtonGroup");

			var rgChillerMode = $("#rgChillerMode").kendoCustomRadioButtonGroup({
				dataSource: rgChillerModeData, groupName: "rgChillerMode",
				id: "id", value: "value", icon: "icon", text: "text", index: INDOOR_CHILLER_MODE_INDEX,
				change : function(e){
					rgIndoorMode.clear();

					var value = e.dataItem.value;
					self._enableByIndoorMode(value);
					self._changeRadioGroupEvent(e);
				}
			}).data("kendoCustomRadioButtonGroup");

			var rgIndoorFanSpeed = $("#rgIndoorFanSpeed").kendoCustomRadioButtonGroup({
				dataSource: rgIndoorFanSpeedData, groupName: "rgIndoorFanSpeed",
				id: "id", value: "value", icon: "icon", text: "text", index : INDOOR_FAN_SPEED_INDEX,
				change : function(e){self._changeRadioGroupEvent(e);}
			}).data("kendoCustomRadioButtonGroup");

			var rgIndoorOperationLimit = $("#rgIndoorOperationLimit").kendoCustomRadioButtonGroup({
				dataSource: rgIndoorOperationLimitData, groupName: "rgIndoorOperationLimit",
				id: "id", value: "value", icon: "icon", text: "text", index : INDOOR_OPERATION_LIMIT_INDEX,
				change : function(e){
					var value = e.dataItem.value;
					self._enableByLimit(value, true);
					self._changeRadioGroupEvent(e);
				}
			}).data("kendoCustomRadioButtonGroup");

			var rgIndoorWindDirection0 = $("#rgIndoorWindDirection0").kendoCustomRadioButtonGroup({
				dataSource: rgIndoorWindDirection0Data, groupName: "rgIndoorWindDirection0",
				id: "id", value: "value", icon: "icon", text: "text", index : INDOOR_WIND_DIRECTION0_INDEX,
				change : function(e){self._changeRadioGroupEvent(e);}
			}).data("kendoCustomRadioButtonGroup");

			var rgIndoorWindDirection1 = $("#rgIndoorWindDirection1").kendoCustomRadioButtonGroup({
				dataSource: rgIndoorWindDirection1Data, groupName: "rgIndoorWindDirection1",
				id: "id", value: "value", icon: "icon", text: "text", index : INDOOR_WIND_DIRECTION1_INDEX,
				change : function(e){ self._changeRadioGroupEvent(e);}
			}).data("kendoCustomRadioButtonGroup");

			var rgVentilatorMode = $("#rgVentilatorMode").kendoCustomRadioButtonGroup({
				dataSource: rgVentilatorData, groupName: "rgVentilatorMode",
				id: "id", value: "value", icon: "icon", text: "text", index : VENTILATOR_MODE_INDEX,
				change : function(e){
					self._enableByVentilatorMode(e.dataItem.value, true);
					self._changeRadioGroupEvent(e);
				}
			}).data("kendoCustomRadioButtonGroup");

			var rgVentilatorFanSpeed = $("#rgVentilatorFanSpeed").kendoCustomRadioButtonGroup({
				dataSource: rgVentilatorFanSpeedData, groupName: "rgVentilatorFanSpeed",
				id: "id", value: "value", icon: "icon", text: "text", index : VENTILATOR_FAN_SPEED_INDEX,
				change : function(e){ self._changeRadioGroupEvent(e);}}).data("kendoCustomRadioButtonGroup");

			var rgDhwOperationMode = $("#rgDhwOperationMode").kendoCustomRadioButtonGroup({
				dataSource: rgDhwOperationModeData, groupName: "rgDhwOperationMode",
				id: "id", value: "value", icon: "icon", text: "text", index : DHW_OPERATION_MODE_INDEX,
				change : function(e){ self._changeRadioGroupEvent(e);}}).data("kendoCustomRadioButtonGroup");

			var rgIndoorChillerMcc = $("#rgIndoorChillerMcc").kendoCustomRadioButtonGroup({
				dataSource: rgIndoorChillerMccData, groupName: "rgIndoorChillerMcc",
				id: "id", value: "value", icon: "icon", text: "text", index : INDOOR_CHILLER_MCC_INDEX,
				change : function(e){ self._changeRadioGroupEvent(e);}
			}).data("kendoCustomRadioButtonGroup");

			var rgOptionRemote = $("#rgOptionRemote").kendoCustomRadioButtonGroup({
				dataSource: rgOptionRemoteData, groupName: "rgOptionRemote",
				id: "id", value: "value", text: "text",
				change : function(e){
					self.trigger("change", {item : e.dataItem, index : OPTION_INDEX, subIndex : 0});
				}}).data("kendoCustomRadioButtonGroup");

			radioGroupView[INDOOR_MODE_INDEX] = rgIndoorMode;
			radioGroupView[INDOOR_CHILLER_MODE_INDEX] = rgChillerMode;
			radioGroupView[INDOOR_FAN_SPEED_INDEX] = rgIndoorFanSpeed;

			radioGroupView[INDOOR_OPERATION_LIMIT_INDEX] = rgIndoorOperationLimit;
			radioGroupView[INDOOR_WIND_DIRECTION0_INDEX] = rgIndoorWindDirection0;
			radioGroupView[INDOOR_WIND_DIRECTION1_INDEX] = rgIndoorWindDirection1;

			radioGroupView[VENTILATOR_MODE_INDEX] = rgVentilatorMode;
			radioGroupView[VENTILATOR_FAN_SPEED_INDEX] = rgVentilatorFanSpeed;
			radioGroupView[DHW_OPERATION_MODE_INDEX] = rgDhwOperationMode;
			radioGroupView[INDOOR_CHILLER_MCC_INDEX] = rgIndoorChillerMcc;

			viewOption[0] = rgOptionRemote;
		},

		//radioGroupView에 위 radio button group 위젯이 할당되어있음.
		/**
		*
		*   <ul>
		*       <li>WindFree = 무풍</li>
		*       <li>무풍제어와 관련된 제약사항을 반영한다.</li>
		*       <li>무풍이 Enable 상태이고, 무풍 상태가 On 표시 상태이면, 실내기 풍량 및 실내기 풍향 제어 버튼이 모두 DIM 된다.</li>
		*   </ul>
		*   @function _enableByOptionWindFree
		*   @param {String}check - 체크 상태
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_enableByOptionWindFree : function(check){
			var disabeGroup = [INDOOR_FAN_SPEED_INDEX, INDOOR_WIND_DIRECTION0_INDEX, INDOOR_WIND_DIRECTION1_INDEX];
			var length = disabeGroup.length;
			var i, j, group;
			if(check.toLowerCase() === "on"){
				for(i = 0; i < length; i++){
					group = radioGroupView[disabeGroup[i]];
					group.enable(false);
				}
			}else{
				for(i = 0; i < length; i++){
					group = radioGroupView[disabeGroup[i]];
					var jlength = group.count();
					for(j = 0; j < jlength; j++){
						//oriEnable은 group에서 들고 있는 original enable 값이며, 해당 값으로 다시 돌아오도록 설정한다.
						//활성화/비활성화/버튼 Checked 상태 여부를 다시 Set
						group.enable(j, group.oriEnable(j));
						group.value(group.options.checkedValue);
					}
				}
			}
		},

		/*
			enableBy로 시작하는 function은 버튼 "클릭" 시,(이벤트) 다른 요소들이 Disable/Enable 되는 함수이다.
			PanelConfiguration 외 아래와 같이 활성화/비활성화를 수행함.
			PanelConfiguration 데이터의 오류로 인하여 아래 동작들과 충돌이 있어 이슈가 생기기도함.
		*/
		/**
		*
		*   <ul>
		*       <li>선택한 칠러 모드에 따라 온도를 활성화/비활성화한다.</li>
		*   </ul>
		*   @function _enableByChillerWater
		*   @param {String}check - 체크 상태
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_enableByChillerWater : function(check){
			var temperature = radioGroupView[TEMPERATURE_INDEX];
			var isTemperature = true;

			if(check.toLowerCase() === "on"){
				isTemperature = false;
			}
			temperature[0].enable(isTemperature && temperature[0].oriEnable);
		},
		/**
		*
		*   <ul>
		*       <li>선택한 운전 제한 모드에 따라 제약되는 UI요소를 활성화/비활성화한다.</li>
		*   </ul>
		*   @function _enableByLimit
		*   @param {String}value - 선택한 값
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_enableByLimit : function(value){
			var group = radioGroupView[INDOOR_MODE_INDEX];
			var curValue = group.value(), length = group.count(), enables = [];
			var i, disableValue0, disableValue1, disableValue2;
			// var possible;
			for(i = 0; i < length; i++){
				enables[i] = true;
			}

			if(value === "CoolOnly"){
				disableValue0 = "Auto";
				disableValue1 = "Heat";
				enables[0] = enables[2] = false;

				if(curValue === disableValue0 || curValue === disableValue1){
					//					for(i = 0; i < length; i++){
					//						if(!enables[i]) continue;
					//
					//						if(group.oriEnable(i)){
					//							possible = group.dataSource.view()[i].value
					//							break;
					//						}
					//					}
					//
					//					if(click && possible){
					//						clickValue = possible;
					//					}
				}
			}else if(value === "HeatOnly"){
				disableValue0 = "Auto";
				disableValue1 = "Cool";
				disableValue2 = "Dry";

				enables[0] = enables[1] = enables[3] = false;

				//History - possible은 현재 값이 체크되어있는데, 비활성화되었을 때, 다른 가능한 값으로 다시 체크해주기 위하여 만든 변수
				if(curValue === disableValue0 || curValue === disableValue1 || curValue === disableValue2){
					for(i = 0; i < length; i++){
						if(!enables[i]) continue;

						if(group.oriEnable(i)){
							// possible = group.dataSource.view()[i].value;
							break;
						}
					}

					// if(click && possible){
					// 	clickValue = possible;
					// }
				}
			}
			for(i = 0; i < length; i++){
				group.enable(i, enables[i] && group.oriEnable(i));
			}
			//위 History 참조
			//if(clickValue)
			//group.value(clickValue);
		},
		/**
		*
		*   <ul>
		*       <li>선택한 실내기 모드에 따라 제약되는 UI 요소를 활성화/비활성화한다.</li>
		*   </ul>
		*   @function _enableByIndoorMode
		*   @param {String}value - 선택한 값
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_enableByIndoorMode : function(value){
			// _enableByIndoorMode : function(value, click){
			//click 값은 사용자 클릭 이벤트에 의하여 호출되는 것을 구분하기 위함이다.
			var group = radioGroupView[INDOOR_FAN_SPEED_INDEX];
			var temperature = radioGroupView[TEMPERATURE_INDEX];
			/*
			 * 무풍제어와 관련된 제약사항
			 * - 선택된 모든 실내기(냉난방기)들의 실내기 운전모드가 냉방, 제습, 송풍 모드 중 하나일 때에만 무풍 제어를 할 수 있다.
			 * - 선택된 실내기(냉난방기)들의 중 실내기 운전모드가 자동, 난방 모드인 기기가 한대라도 있을 때,무풍 제어 버튼은 DIM 된다.
			 */
			var btnWindFree = viewOption[3];
			var self = this, i,
				enables = [],
				length = group.count(),
				isTemperature = true, isDischargeTemperature = true;
			var tempValue;

			for(i = 0; i < length; i++){
				enables[i] = true;
			}

			if(value === "Auto" || value === "Dry"){
				for(i = 1; i < length; i++){
					enables[i] = false;
				}

				//				if(click)
				//					clickValue = "Auto";

				//기기가 출수온도 기준일 때, 실내기 운전모드가 자동모드이면 설정온도 제어 UI가 DIM 처리
				if(!self.viewModel.get("inpTemperature1") && value === "Auto")
					isTemperature = false;

				isDischargeTemperature = false;
			}else if(value === "Fan"){
				//History - possible은 현재 값이 체크되어있는데, 비활성화되었을 때, 다른 가능한 값으로 다시 체크해주기 위하여 만든 변수
				// var possible;

				// Fan일때 풍량은 Auto가 disable이기 때문에 아래와 같이 처리.(0 : Auto)
				enables[0] = false;
				for(i = 1; i < length; i++){
					if(group.oriEnable(i)){
						// possible = group.dataSource.view()[i].value
						break;
					}
				}
				//				if(click && group.value() === "Auto" && possible){
				//					clickValue = possible;
				//				}


				/*
				 * [운전모드에 따른 설정온도 제약]
				 * 선택된 모든 실내기(냉난방기)의 운전모드가 송풍이면, 설정온도 값을 하이픈(-)으로 표시하고, 설정온도 제어를 DIM 처리한다.
				 * inpTemperature0
				 */
				isTemperature = false;

				 /* [운전모드에 따른 토출온도 제약]
				 * 선택된 모든 실내기(냉난방기)의 운전모드가 송풍,제습, 자동이면, 토출온도 값을 하이픈(-)으로 표시하고, 토출온도 제어 부분을 DIM 처리한다.
				 * inpTemperature2
				 */
				isDischargeTemperature = false;

			}

			if(value === "Auto" || value === "Heat"){
				btnWindFree.enable(false);
				self._enableByOptionWindFree("off");
			}else{
				//무풍 버튼 이벤트에 따라 업데이트 할 필요없이, Panel Configuration으로 활성화/비활성화 여부를 업데이트 하기 때문에 _enableByOptionWindFree를 호출하지 않음.
				btnWindFree.enable(btnWindFree.oriEnable);
			}

			if(value === "CoolStorage" || value === "HeatStorage"){
				isTemperature = true;
				if(value === "HeatStorage") value = "HotWater";
			}

			if(isTemperature && temperature[0].oriEnable()){
				tempValue = temperatureValue["Room"][value];
				if(tempValue){
					temperature[0].min(tempValue.MIN);
					temperature[0].max(tempValue.MAX);
					temperature[0].value(tempValue.SET);
				}
			}
			temperature[0].enable(isTemperature && temperature[0].oriEnable());

			if(isTemperature && temperature[1].oriEnable()){
				tempValue = temperatureValue["WaterOut"][value];
				if(tempValue){
					temperature[1].min(tempValue.MIN);
					temperature[1].max(tempValue.MAX);
					if(!tempValue.SET) tempValue.SET = temperature[1].value();
					temperature[1].value(tempValue.SET);
				}else isTemperature = false;
			}
			temperature[1].enable(isTemperature && temperature[1].oriEnable());

			// radioGroupView[TEMPERATURE_LIMIT_INDEX][TEMPERATURE_LIMIT_COUNT] : btnDischarge 로써, 이 버튼이 ON되어있어야 Discharge Temp제어가능.
			//			isDischargeTemperature = isDischargeTemperature && radioGroupView[TEMPERATURE_LIMIT_INDEX][TEMPERATURE_LIMIT_COUNT].isSelected();
			if(isDischargeTemperature)
				//토출온도 제어 버튼 활성화되어 있을 경우를 체크한다.
				isDischargeTemperature = radioGroupView[TEMPERATURE_LIMIT_INDEX][TEMPERATURE_LIMIT_COUNT].isSelected();

			if(isDischargeTemperature && temperature[2].oriEnable()){
				tempValue = temperatureValue["Discharge"][value];
				if(tempValue){
					temperature[2].min(tempValue.MIN);
					temperature[2].max(tempValue.MAX);
					temperature[2].value(tempValue.SET);
				}
			}
			//* oriEnable은 Panel Configuration이 갖고있는 값이라고 볼 수 있다. 그러므로 And 연산하여 활성화 처리
			temperature[2].enable(isDischargeTemperature && temperature[2].oriEnable());

			for(i = 0; i < length; i++){
				group.enable(i, enables[i] && group.oriEnable(i));
			}

			//			if(clickValue)
			//				group.value(clickValue);
		},
		/**
		*
		*   <ul>
		*       <li>선택한 Ventilator 모드에 따라 제약되는 UI 요소를 활성화/비활성화한다.</li>
		*   </ul>
		*   @function _enableByVentilatorMode
		*   @param {String}value - 선택한 값
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_enableByVentilatorMode : function(value){
			var group = radioGroupView[VENTILATOR_FAN_SPEED_INDEX];
			var i, enables = [], length = group.count();

			for(i = 0; i < length; i++){
				enables[i] = true;
			}

			if(value === "Sleep"){
				for(i = 1; i < length; i++){
					enables[i] = false;
				}

				// if(click)
				// 	clickValue = "Mid";
			}

			for(i = 0; i < length; i++){
				group.enable(i, enables[i] && group.oriEnable(i));
			}

			// if(clickValue)
			// 	group.value(clickValue);
		},
		/**
		*
		*   <ul>
		*       <li>그룹 버튼 변경 시, 호출되는 Callback 함수. 제어 API 호출을 위하여 "change" 이벤트를 Trigger한다.</li>
		*   </ul>
		*   @function _changeRadioGroupEvent
		*	@param {Event} e - 이벤트 객체.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_changeRadioGroupEvent : function(e){
			var item = e.dataItem;
			var index = e.sender.options.index;
			this.trigger("change", {item : item, index : index});
		},
		_calcEachData : function(info, array){
			var length = array.length;
			for(var i = 0; i < length; i++){
				if(typeof info[i] == "undefined"){
					info[i] = array[i];
				}else{
					if(typeof array[i] == "undefined") continue;
					if(info[i] != array[i]){
						info[i] = "";
					}
				}
			}
		},
		/**
		*
		*   <ul>
		*       <li>표시할 온도 값의 Min Max 값을 계산한다.</li>
		*   </ul>
		*   @function _calcMinMaxData
		*   @param {Array} info - 온도(설정,현재,급탕 등) 종류 별로 온도의 최종 Min, Max 값을 저장하기 위한 데이터
		*   @param {Array} array - 선택한 기기의 온도(설정,현재,급탕 등) 종류 별 온도 데이터
		*   @param {Number} count - 선택한 기기 개수
		*   @param {Boolean} isAvg - 평균값 계산 여부
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_calcMinMaxData : function(info, array, count, isAvg){
			var self = this;
			var length;

			//j -> MIN, MAX, SET
			for(var j = 0; j < EnumTemperature.length; j++){

				// rowInfo : info의 누적 Data
				// rowArray : 현재 누적 Data에 계산되어 들어가야하는 현재 Data
				var rowInfo = info[EnumTemperature[j]];
				var rowArray = array[EnumTemperature[j]];
				if(!rowInfo) rowInfo = [];
				if(!rowArray) continue;
				length = rowArray.length;

				//온도 지원여부 : i -> 0=실내기, 1=출수, 2=토출, 3=급탕 온도 등등
				//온도 제한 : i-> 0=냉방하한, 1-난방상한, 2-출수 냉방하한, 3-출수 난방상한, 4-급탕 상한
				for(var i = 0; i < length; i++){
					if(typeof rowInfo[i] == "undefined"){
						if(typeof rowArray[i] == "undefined"){
							rowInfo[i] = rowArray[i];
							continue;
						}
						rowInfo[i] = parseFloat(rowArray[i]);
					}else{
						if(typeof rowArray[i] == "undefined") continue;
						if(j == 0){
							if(rowInfo[i] > rowArray[i]){
								rowInfo[i] = rowArray[i];
							}
						}else if(j == 1){
							if(rowInfo[i] < rowArray[i]){
								rowInfo[i] = rowArray[i];
							}
						}else if(isAvg){
							//온도 제한인 경우 선택된 기기 개수가 1대일 경우 True -> 선택된 기기 1개일 경우, 선택된 기기 1개의 값 표시를 위함.
							//일반 온도 지원일 경우 선택된 기기 개수와 상관없이 무조건 True
							rowInfo[i] = self._accureAverage(rowArray[i], rowInfo[i], ++count[i]);
						}else if(i == 0 || i == 2){
							//여러대 일 경우, 실내기 냉방하한, 출수 냉방하한은 최소 값을 표시.
							if(rowInfo[i] > rowArray[i]){
								rowInfo[i] = rowArray[i];
							}
						}else if(rowInfo[i] < rowArray[i]){
							//여러대 일 경우, 실내기 난방상한, 출수 난방 상한, 급탕 상한은 최소 값을 표시.
							rowInfo[i] = rowArray[i];
						}
					}
				}
				info[EnumTemperature[j]] = rowInfo;
			}
		},
		_calcAvgData : function(info, value, count){
			if(typeof value == "undefined") return info;
			if(typeof info == "undefined") info = value;

			//선택된 기기가 2개 이상이고, demand level을 지원할 경우 demand 값은 무조건 100
			if(count[0] > 1) return 100;
			return value;
		},
		_accureAverage : function(curVal, curAvg, count){
			return (curVal + count * curAvg) / (count + 1);
		},
		/**
		*
		*   <ul>
		*       <li>선택한 기기 또는 기기들의 최종 panelConfigurationInformation을 연산한다.</li>
		*   </ul>
		*   @function parseEnableData
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		parseEnableData : function(){
			var self = this;
			var finalPanelConfigurationInformation = []; //API의 panelConfigurationInformation 의 모든 BIT연산을 한 최종 데이터

			var data = self.options.dataSource;
			if(!data) return;
			var dlength = data.length;
			var i;
			for(i = 0; i < INSTALLATION_INFO_COUNT; i++){
				finalPanelConfigurationInformation.push(0);
			}

			for(i = 0; i < dlength; i++){

				var datai = data[i];

				if(!datai["airConditioner"]) continue;

				var panelConfigurationInformation = datai["airConditioner"]["panelConfigurationInformation"];
				if(!panelConfigurationInformation) continue;

				// panelConfigurationInformation bit 연산
				// panelConfigurationInformation.length (INSTALLATION_INFO_COUNT)
				for(var j = 0; j < INSTALLATION_INFO_COUNT; j++){
					finalPanelConfigurationInformation[j] |= parseInt(panelConfigurationInformation[j], 16);
				}
			}

			self._enableUI(finalPanelConfigurationInformation);
		},
		/**
		*
		*   <ul>
		*       <li>선택한 기기 또는 기기들의 최종 InstallationInformation을 연산한다.</li>
		*   </ul>
		*   @function parseData
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		parseData : function(){
			var self = this;
			var finalInstallationInfo = []; //API의 InstallationInfo 의 모든 BIT연산을 한 최종 데이터

			/*
			 * API Power Group의 최종데이터를 저장할변수
			 *
			 * [INDEX]
			 * 0 : indoorPower
			 * 1 : ervPower
			 * 2 : dhwPower
			 *
			 * [Value]
			 * 0 : FALSE (OFF)
			 * 1 : TRUE (ON)
			 * 2 : TF (ON/OFF)
			 */
			var finalPowerInfo = [];

			/*
			 * API Mode Group의 최종데이터를 저장할변수
			 *
			 * [INDEX]
			 * 0 : indoorOpMode
			 * 1 : ervOpMode
			 * 2 : dhwOpMode
			 * 3 : opmodeLimit
			 *
			 */
			var finalModeInfo = [];

			/*
			 * API FanSpeed Group의 최종데이터를 저장할변수
			 *
			 * [INDEX]
			 * 0 : indoorFanSpeed
			 * 1 : ervFanSpeed
			 */
			var finalFanSpeedInfo = [];

			/*
			 * API AirControl Group의 최종데이터를 저장할변수
			 *
			 * [INDEX]
			 * 0 : windDirection
			 *
			 */
			var finalAirControlInfo = [];

			/*
			 * API Option Group의 최종데이터를 저장할변수
			 *
			 * [INDEX]
			 * 0 : remoteControl -> 변경 finalRemoteControlInfo
			 * 1 : stillAir
			 * 2 : spi
			 * 3 : filterReset
			 */
			var finalOptionInfo = [];
			var finalRemoteControlInfo = [];

			/*
			 * API Chiller Group의 최종데이터를 저장할변수
			 *
			 * [INDEX]
			 * 0 : mccMode
			 * 1 : chillerWaterLow
			 * 2 : chillerSleep
			 * 3 : chillerSnowDrift
			 * 4 : chillerDemand
			 */
			var finalChillerInfo = [];


			/*
			 * API Temperature의 온도관련 데이터를 저장할 변수
			 *
			 * KEY : EnumTemperature(MIN, MAX, SET)
			 * VALUE : { MIN : [x,x,x..], MAX : [x,x,x..], SET : [x,x,x..] }
			 *
			 * Min, Max, Set 의 각 Index가 나타내는 값은 같다.
			 * 0 : 냉방하한온도
			 * 1 : 난방상한온도
			 * 2 : 냉방하한출수온도
			 * 3 : 난방상한출수온도
			 * 4 : 급탕상한온도
			 *
			 */
			var finalTempLimitDigitInfo = {};

			/*
			 * API Temperature의 온도관련 데이터를 저장할 변수
			 *
			 * KEY : EnumTemperature(MIN, MAX, SET)
			 * VALUE : { MIN : [x,x,x..], MAX : [x,x,x..], SET : [x,x,x..] }
			 *
			 * Min, Max, Set 의 각 Index가 나타내는 값은 같다.
			 * 0 : 실내온도
			 * 1 : 출수온도
			 * 2 : 토출온도
			 * 3 : 급탕온도
			 *
			 */
			var finalTempDigitInfo = {};
			var finalDemandLevel;

			/*
			 * API Temperature의 온도관련 데이터를 저장할 변수
			 *
			 * 0 : applyCoolLowTempLimit
			 * 1 : applyHeatHighTempLimit
			 * 2 : applyCoolLowTempLimitWaterOut
			 * 3 : applyHeatHighTempLimitWaterOut
			 * 4 : applyDhwHighTempLimit
			 * 5 : enableDischargeTempControl - 토출온도만 Enable 을 위한 값이 있다..
			 */
			var finalTempLimitEnableInfo = [];
			var i;
			//0으로 초기화
			for(i = 0; i < INSTALLATION_INFO_COUNT; i++){
				finalInstallationInfo.push(0);
			}

			var data = self.options.dataSource;
			var dlength = data.length;
			var isAvg = dlength === 1 ? true : false;

			// 온도들의 평균값을 구할 때 쓸 변수.
			// 0 : set, 1 : waterout, 2 : discharge, 3 : dhw
			var avgTempCount = [0, 0, 0, 0];

			// 0 : coollower, 1 : heatupper, 2 : wtcoollower, 3 : wtheatupper, 4 : dhw upper
			var avgTempLimitCount = [0, 0, 0, 0, 0];

			//Demand Count도 추후에 다른기능이 추가로 구현될수 있어 우선 배열로 관리.
			var avgDemandCount = [0];
			temperatureValue = {};

			//다 수개의 상태 처리 시,
			//ON/OFF 및 버튼들은 모든 데이터 값이 일치 할 때만, 체크 상태로 변경. 아닐 경우 모두 체크된 상태가 아님.
			//모든 온도 설정 값은 평균 값으로 표시, MIN은 가장 최소, MAX는 가장 최대 값으로 설정

			for(i = 0; i < dlength; i++){

				var datai = data[i];
				//Installation Info 계산 -> 요소 표시/미표시
				var installationInfo = datai["airConditioner"]["installationInformation"];
				if(!installationInfo) continue;

				//나머지 값은 현재 값 UI를 업데이트 위함.
				var poweri = datai["operations"];
				var power = [];

				//추후 power로 넘어오는 데이터가 object면 key로만 접근할 수 있게 수정.
				//				if(poweri) power = [poweri["indoorPower"], poweri["ervPower"], poweri["dhwPower"]];
				//현재는 power가 배열로 넘어오기 때문에 해당값이 있는지 찾아주는 작업이 선행되어야함...
				var indoorOpMode, ervOpMode, dhwOpMode;
				var erv, dhw;
				if(poweri){
					indoorOpMode = $.grep(poweri, function(e){ return e.id == "AirConditioner.Indoor.General"; });
					ervOpMode = $.grep(poweri, function(e){ return e.id == "AirConditioner.Indoor.Ventilator"; });
					dhwOpMode = $.grep(poweri, function(e){ return e.id == "AirConditioner.Indoor.DHW"; });

					var indoor = indoorOpMode[0] ? indoorOpMode[0].power : void 0;
					erv = ervOpMode[0] ? ervOpMode[0].power : void 0;
					dhw = dhwOpMode[0] ? dhwOpMode[0].power : void 0;

					power = [indoor, erv, dhw];
				}

				var modei = datai["modes"];
				var mode = [];

				//추후 mode로 넘어오는 데이터가 object면 key로만 접근할 수 있게 수정.
				//				if(modei) mode = [modei["indoorOpMode"], modei["ervOpMode"], modei["dhwOpMode"], modei["opmodeLimit"]];
				//현재는 mode가 배열로 넘어오기 때문에 해당값이 있는지 찾아주는 작업이 선행되어야함...

				var indoorMode; // indoor와 dhw는 mode별로 온도값이 지정되기 때문에 따로 관리.

				if(modei){
					indoorOpMode = $.grep(modei, function(e){ return e.id == "AirConditioner.Indoor.General"; });
					ervOpMode = $.grep(modei, function(e){ return e.id == "AirConditioner.Indoor.Ventilator"; });
					dhwOpMode = $.grep(modei, function(e){ return e.id == "AirConditioner.Indoor.DHW"; });
					var opmodeLimit = $.grep(modei, function(e){ return e.id == "AirConditioner.Indoor.ModeLimit"; });

					indoorMode = indoorOpMode[0] ? indoorOpMode[0].mode : void 0;
					erv = ervOpMode[0] ? ervOpMode[0].mode : void 0;
					dhw = dhwOpMode[0] ? dhwOpMode[0].mode : void 0;
					var limit = opmodeLimit[0] ? opmodeLimit[0].mode : void 0;

					mode = [indoorMode, erv, dhw, limit];
				}

				var windsi = datai["winds"];
				var fanspeed = [];
				var aircontrol = [];
				if(windsi){
					var speedData = $.grep(windsi, function(e){ return e.id == "AirConditioner.Indoor.General.Speed"; });
					var speedVenData = $.grep(windsi, function(e){ return e.id == "AirConditioner.Indoor.Ventilator.Speed"; });
					var directionData = $.grep(windsi, function(e){ return e.id == "AirConditioner.Indoor.General.Direction"; });

					var speed = speedData[0] ? speedData[0].wind : void 0;
					var speedVen = speedVenData[0] ? speedVenData[0].wind : void 0;
					var direction = directionData[0] ? directionData[0].wind : void 0;

					fanspeed = [speed, speedVen];
					aircontrol = [direction];
				}

				var optioni = datai["airConditioner"];
				var option = [];
				var temperatureReference;
				//Demand Count도 추후에 다른기능이 추가로 구현될수 있어 우선 배열로 관리.
				var demandLevel = [];
				var chiller;
				// Option의 InstallationInfo는 리모컨제어-필터리셋-SPI-무풍인데 API는 SPI와 필터리셋의 순서가 바뀌어서 옴.
				if(optioni){
					option = [optioni["filterResetRequired"], optioni["spi"], optioni["stillAir"]];

					var chilleri = optioni["chiller"];
					chiller = [];

					if(chilleri) {
						chiller = [chilleri["mccMode"], chilleri["waterLaw"], chilleri["quiet"],
								   chilleri["forcedFan"], chilleri["demand"]];
						demandLevel = [chilleri["demandLevel"]];
						if(demandLevel && demandLevel >= 0) avgDemandCount[0]++;
					}

					//온도 평균 값 계산을 위함. 지원하는 온도 값을 체크하기 위함.
					temperatureReference = optioni["temperatureReference"];
				}

				var confi = datai["configuration"];
				var conf;
				if(confi) conf = [confi["remoteControl"]];

				var temperaturei = datai["temperatures"];
				var tempLimitDigit = {};
				var tempLimitEnable = [];

				var tempDigit = {};

				//EnumTemperature 0 : "MIN",  1 : "MAX",  2 : "SET"
				if(temperaturei && temperaturei.length){
					var grepData = [];

					grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.Room.Cool.Limit"; }));
					grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.Room.Heat.Limit"; }));
					grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.Cool.Limit";}));
					grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.Heat.Limit";}));
					grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.DHW.Limit"; }));

					//var EnumTemperature = ["MIN", "MAX", "SET"];
					var min = EnumTemperature[0];
					var max = EnumTemperature[1];
					var set = EnumTemperature[2];

					var glength = grepData.length;
					var gi, temp;
					for(gi = 0; gi < glength; gi++){
						temp = grepData[gi][0];

						if(!tempLimitDigit[min]) tempLimitDigit[min] = [];
						if(!tempLimitDigit[max]) tempLimitDigit[max] = [];
						if(!tempLimitDigit[set]) tempLimitDigit[set] = [];

						if(temp){
							tempLimitDigit[min][gi] = temp.minimum;
							tempLimitDigit[max][gi] = temp.maximum;
							tempLimitDigit[set][gi] = temp.desired;
							tempLimitEnable.push(temp.enabled);
						}else{
							tempLimitDigit[min][gi] = temp;
							tempLimitDigit[max][gi] = temp;
							tempLimitDigit[set][gi] = temp;
							tempLimitEnable.push(temp);
						}
					}

					//temperaturevalue는 다음과 같은 구조를 갖는다.
					// type : Room, WaterOut, Discharge
					// Mode : Auto, Cool, Heat, Dry, CoolStorage, HeatStorage
					if(!temperatureValue["Room"]) temperatureValue["Room"] = {};
					if(!temperatureValue["WaterOut"]) temperatureValue["WaterOut"] = {};
					if(!temperatureValue["Discharge"]) temperatureValue["Discharge"] = {};

					if(!tempDigit[min]) tempDigit[min] = [];
					if(!tempDigit[max]) tempDigit[max] = [];
					if(!tempDigit[set]) tempDigit[set] = [];

					/*
					 *  Indoor온도 Room, WaterOut, Discharge 이 3개는 ID가 크게 2개로 나뉜다.
					 *  default : AirConditioner.Indoor.x
					 *  mode : AirConditioner.Indoor.x.mode
					 *
					 *  default에는 desire가 담기며, mode별로 min-max가 설정되므로 아래와 같이 분리하여 작업한다.
					 */
					var desireValue, minVal, maxVal, tempMode, grepDataTemp;
					// ROOM ===================
					temp = void 0;
					if(temperatureReference && temperatureReference === "Indoor"){
						temp = $.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.Room"; });
						if(temp && temp.length){
							desireValue = temp[0].desired;
							grepData = [];
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.Room.Auto";}));
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.Room.Cool";}));
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.Room.Heat";}));
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.Room.Dry";}));

							glength = grepData.length;
							for(gi = 0; gi < glength; gi++){
								grepDataTemp = grepData[gi][0];
								// 0 : Auto, 1 : Cool, 2 : Heat, 3 : Dry
								switch(gi){
								case 0: tempMode = "Auto"; break;
								case 1: tempMode = "Cool"; break;
								case 2: tempMode = "Heat"; break;
								case 3: tempMode = "Dry"; break;
								default : tempMode = "Default";
								}

								if(grepDataTemp){
									minVal = grepDataTemp.minimum;
									maxVal = grepDataTemp.maximum;
									if(!temperatureValue["Room"][tempMode]) temperatureValue["Room"][tempMode] = {};
									temperatureValue["Room"][tempMode][min] = minVal;
									temperatureValue["Room"][tempMode][max] = maxVal;
								}
							}

							var indoorTemp = temperatureValue["Room"][indoorMode];
							if(indoorTemp){
								tempDigit[min][0] = indoorTemp[min];
								tempDigit[max][0] = indoorTemp[max];
								tempDigit[set][0] = desireValue;
							}else{
								tempDigit[min][0] = tempDigit[max][0] = tempDigit[set][0] = indoorTemp;
							}
						}else{
							desireValue = temp;
						}
					}
					// ROOM =======================

					// WaterOut =======================
					temp = void 0;
					if(temperatureReference && temperatureReference === "WaterOutlet"){
						temp = $.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet"; });
						if(temp && temp.length){
							desireValue = temp[0].desired;

							grepData = [];
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.Auto"; }));
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.Cool"; }));
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.Heat"; }));
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.Dry"; }));
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.CoolStorage"; }));
							grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.WaterOutlet.HeatStorage"; }));

							glength = grepData.length;
							for(gi = 0; gi < glength; gi++){
								grepDataTemp = grepData[gi][0];
								// 0 : Auto, 1 : Cool, 2 : Heat, 3 : Dry
								switch(gi){
								case 0: tempMode = "Auto"; break;
								case 1: tempMode = "Cool"; break;
								case 2: tempMode = "Heat"; break;
								case 3: tempMode = "Dry"; break;
								case 4: tempMode = "CoolStorage"; break;
								case 5: tempMode = "HotWater"; break;
								default : tempMode = "Default";
								}

								if(grepDataTemp){
									minVal = grepDataTemp.minimum;
									maxVal = grepDataTemp.maximum;
									if(!temperatureValue["WaterOut"][tempMode]) temperatureValue["WaterOut"][tempMode] = {};
									temperatureValue["WaterOut"][tempMode][min] = minVal;
									temperatureValue["WaterOut"][tempMode][max] = maxVal;
								}
							}

							var waterOutTemp = temperatureValue["WaterOut"][indoorMode];
							//현재 지원하는 모드에 대해서만 온도 값 저장
							//e.g Index 1번이 출수.
							if(waterOutTemp){
								tempDigit[min][1] = waterOutTemp[min];
								tempDigit[max][1] = waterOutTemp[max];
								tempDigit[set][1] = desireValue;
							}else{
								tempDigit[min][1] = tempDigit[max][1] = tempDigit[set][1] = void 0;
							}
						}else{
							tempDigit[min][1] = tempDigit[max][1] = tempDigit[set][1] = void 0;
						}
					}
					// WaterOut =======================

					/*설정온도나 출수온도의 같은 경우는 모드속성별로는 min max만 관리하고 설정온도는 메인속성에서 하나만 관리한다.
					* 하지만 Discharge같은 경우에는 각 모드별 속성안에 desired가 포함되고 메인속성에는 current온도만 존재한다.
					* 따라서 Discharge온도는 Desired속성을 temperatureValue로 관리해주면 안된다.
					* 또한 Discharge온도는 upper, lower limit이 존재하지 않으므로 grepData가 존재 할 때 데이터를 관리하는것이 맞다.
					*/

					// Discharge =======================
					grepData = [];
					grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.DischargeAir.Cool";}));
					grepData.push($.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.DischargeAir.Heat"; }));

					glength = grepData.length;
					var isDischargeExist = false;
					for(gi = 0; gi < glength; gi++){
						grepDataTemp = grepData[gi][0];
						if(!grepDataTemp) continue;

						isDischargeExist = true;
						// 0 : Auto, 1 : Cool, 2 : Heat, 3 : Dry
						switch(gi){
						case 0: tempMode = "Cool"; break;
						case 1: tempMode = "Heat"; break;
						default : tempMode = "Default";
						}

						minVal = grepDataTemp.minimum;
						maxVal = grepDataTemp.maximum;
						if(!temperatureValue["Discharge"][tempMode]) temperatureValue["Discharge"][tempMode] = {};
						temperatureValue["Discharge"][tempMode][min] = minVal;
						temperatureValue["Discharge"][tempMode][max] = maxVal;
						temperatureValue["Discharge"][tempMode][set] = grepDataTemp.desired;
					}

					var dischargeTemp = temperatureValue["Discharge"][indoorMode];
					if(dischargeTemp && isDischargeExist){
						tempDigit[min][2] = dischargeTemp[min];
						tempDigit[max][2] = dischargeTemp[max];
						tempDigit[set][2] = dischargeTemp[set];
					}else{
						tempDigit[min][2] = tempDigit[max][2] = tempDigit[set][2] = void 0;
					}

					//토출온도만 ON/OFF (온도제어를 위한 버튼) 이 존재한다.
					temp = $.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.DischargeAir"; });
					if(temp && temp.length){
						temp = temp[0];
						tempLimitEnable.push(temp.enabled);
					}else{ tempLimitEnable.push(temp);}
					// Discharge =======================


					temp = $.grep(temperaturei, function(e){ return e.id == "AirConditioner.Indoor.DHW"; });
					if(temp && temp.length){
						temp = temp[0];
						tempDigit[min][3] = temp.minimum;
						tempDigit[max][3] = temp.maximum;
						tempDigit[set][3] = temp.desired;

						if(!temperatureValue["DHW"]) temperatureValue["DHW"] = {};

						temperatureValue["DHW"][min] = temp.minimum;
						temperatureValue["DHW"][max] = temp.maximum;
					}else{
						tempDigit[min][3] = tempDigit[max][3] = tempDigit[set][3] = void 0;
					}
					//마지막 기기가 temperatureOriValue에 저장됨 (MIN,MAX,SET)
					temperatureOriValue = $.extend(true, {}, temperatureValue);
				}

				// installationInfo bit 연산
				// installationInfo.length (INSTALLATION_INFO_COUNT)
				for(var j = 0; j < INSTALLATION_INFO_COUNT; j++){
					finalInstallationInfo[j] |= parseInt(installationInfo[j], 16);
				}

				// parameter0 에 계산된 데이터가 누적되어 들어감(Call by Reference)
				// power ON, OFF, ON/OFF연산
				self._calcEachData(finalPowerInfo, power);

				// mode 연산
				self._calcEachData(finalModeInfo, mode);

				// fanspeed 연산
				self._calcEachData(finalFanSpeedInfo, fanspeed);

				// aircontrol 연산
				self._calcEachData(finalAirControlInfo, aircontrol);

				// option 연산
				self._calcEachData(finalOptionInfo, option);
				self._calcEachData(finalRemoteControlInfo, conf);

				// chiller 연산
				self._calcEachData(finalChillerInfo, chiller);

				//temperature 연산
				self._calcMinMaxData(finalTempLimitDigitInfo, tempLimitDigit, avgTempLimitCount, isAvg);
				self._calcEachData(finalTempLimitEnableInfo, tempLimitEnable);

				self._calcMinMaxData(finalTempDigitInfo, tempDigit, avgTempCount, true);
				//
				finalDemandLevel = self._calcAvgData(finalDemandLevel, demandLevel[0], avgDemandCount);
			}

			//설치 정보에 따라 UI를 표시/미표시 하도록 업데이트
			self._switchUI(finalInstallationInfo);
			//각 온도들의 MIN/MAX/SET 값을 설정하여, 현재 값 및 현재 UI 업데이트
			self._setTempDigitUI(finalTempDigitInfo, isAvg);

			//각 값들을 설정하여 UI 업데이트 (선택 상태 및 현재 값 반영)
			self._setPowerUI(finalPowerInfo);
			self._setModeUI(finalModeInfo);
			self._setFanSpeedUI(finalFanSpeedInfo);
			self._setAirConditionUI(finalAirControlInfo);

			self._setOptionUI(finalOptionInfo);

			self._setRemoteControlUI(finalRemoteControlInfo);

			self._setChillerUI(finalChillerInfo, avgDemandCount);
			self._setDemandLevel(finalDemandLevel);

			//각 온도제한 MIN/MAX/SET 값을 설정하여, 현재 값 및 현재 UI 업데이트
			self._setTempLimitDigitUI(finalTempLimitDigitInfo, isAvg);
			//각 온도제한 버튼 활성화/비활성화 여부 UI 업데이트
			self._setTempLimitEnableUI(finalTempLimitEnableInfo);
		},
		_setDemandLevel : function(final){
			if(final){
				if(final <= inpDemand.max() && final >= inpDemand.min()) inpDemand.value(final);
			} else inpDemand.value("");
		},
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 온도 제한 버튼을 활성화/비활성화 한다.</li>
		*   </ul>
		*   @function _setTempLimitEnableUI
		* 	@param {Array} finalTempInfo - 템플릿 정보 배열.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setTempLimitEnableUI : function(finalTempInfo){
			var length = finalTempInfo.length;
			var buttons = radioGroupView[TEMPERATURE_LIMIT_INDEX];
			var button;
			var i;

			if(!length){
				for(i = 0; i <= TEMPERATURE_LIMIT_COUNT; i++){
					button = buttons[i];
					button.select("ON/OFF");

					//토출온도제어(마지막)은 온도 input이 없다.
					if(i < TEMPERATURE_LIMIT_COUNT)
						inpTempLimit[i].enable(false);
				}
				return;
			}

			for(i = 0; i < length; i++){
				button = buttons[i];
				var isEnable = buttons[i].options.enable;
				var text = "ON/OFF"; // btnDischarge을 위한 변수.

				if(finalTempInfo[i] === true){
					if(isEnable){
						text = "ON";

						if(inpTempLimit[i]){
							inpTempLimit[i].enable(true);
							this._setByTemperatureLimit(i, inpTempLimit[i].value());
						}

					}else text = "OFF";
				}else if(finalTempInfo[i] === false){
					text = "OFF";

					if(inpTempLimit[i]){
						inpTempLimit[i].enable(false);
					}
				}
				button.select(text);
				// btnDischarge(토출온도 ON/OFF버튼은 또 text값이 바껴야함.)
				//				if(i === TEMPERATURE_LIMIT_COUNT){
				//					button.select(text);
				//				}
			}
		},

		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 각 온도들의 MIN/MAX/SET 값을 설정하여, 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setTempDigitUI
		*	@param {Array} finalTempInfo - 템플릿 정보 배열.
		*	@param {Boolean} isSingle - 싱글 확인 인자.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setTempDigitUI : function(finalTempInfo, isSingle){
			var i, j;
			for(j = 0; j < EnumTemperature.length; j++){
				var rowInfo = finalTempInfo[EnumTemperature[j]];
				if(!rowInfo){
					for(i = 0; i < TEMPERATURE_COUNT; i++){
						inpTemperature[i].value("");
					}
					continue;
				}

				var length = rowInfo.length;
				if(!length) continue;
				for(i = 0; i < length; i++){
					var group = inpTemperature[i];
					var v = rowInfo[i];
					if(j == 0){
						group.min(v);
					}else if(j == 1){
						group.max(v);
					}else{
						if(!isSingle) v = Math.round(v);    //온도 표시 반올림은 2개 이상의 기기 선택 시에만 반영한다.
						group.value(v);
					}
				}
			}
		},
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 각 온도 제한의 MIN/MAX/SET 값을 설정하여, 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setTempLimitDigitUI
		*	@param {Array} finalTempInfo - 템플릿 정보 배열.
		*	@param {Boolean} isSingle - 싱글 확인 인자.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setTempLimitDigitUI : function(finalTempInfo, isSingle){
			for(var j = 0; j < EnumTemperature.length; j++){

				var rowInfo = finalTempInfo[EnumTemperature[j]];
				if(!rowInfo) continue;

				var length = rowInfo.length;
				if(!length) continue;

				for(var i = 0; i < length; i++){

					var group;
					//					if(i == length - 1)
					//						group = inpTemperature[3];
					//					else
					group = inpTempLimit[i];

					var v = rowInfo[i];
					if(j == 0){
						group.min(v);
					}else if(j == 1){
						group.max(v);
					}else{
						if(!isSingle) v = Math.round(v);    //온도 표시 반올림은 2개 이상의 기기 선택 시에만 반영한다.
						group.value(v);
					}
				}
			}
		},

		/*
		 * CHILLER UI는 0번째 Mcc Mode의 RadioGroup이므로 0 과 나머지로 구분.
		 * OPTION과 또 다른점은 OPTION은 InstallationInfo에 0번째로 RadioGroup에 관한 Enalbe 정보가
		 * 같이 오지만, CHILLER는 API만 같이 옴.
		 *
		 *  var INDOOR_CHILLER_INDEX = "12";
		 *  var INDOOR_CHILLER_MCC_INDEX = "13";
		 */
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 Chiller Mode의 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setChillerUI
		*	@param {Array} finalChillerInfo - 템플릿 정보 배열.
		*	@param {Array} avgDemandCount - 디맨드 수.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setChillerUI : function(finalChillerInfo, avgDemandCount){
			var length = finalChillerInfo.length;
			var buttons = radioGroupView[INDOOR_CHILLER_INDEX];
			var i;

			if(!length){
				length = buttons.length;
				for(i = 0; i < length; i++){
					buttons[i].select("ON/OFF");
				}
				return;
			}

			var radioGroup = radioGroupView[INDOOR_CHILLER_MCC_INDEX];
			var text;
			for(i = 0; i < length; i++){
				// Chiller Group은 0번째에 mccMode - standard, rotation, efficiency의 RadioGroup이 들어온다.
				if(i == 0){
					radioGroup.clear();
					text = finalChillerInfo[i];
					if(!text.length) continue;
					radioGroup.value(text);
				}else{
					var info = finalChillerInfo[i];

					if(info && info.length){
						text = info.toUpperCase();
					}else{text = "ON/OFF";}

					//					if(i === 1) self._enableByChillerWater(text);
					//					if(i == length - 1) text = "Demand";
					buttons[i - 1].select(text);

					// Chiller Group의 마지막 Button(=Demand)은 inpDemand를 가지고있다.
					if(i == length - 1){

						// Demand Level 규칙.
						// 2개이상의 Demand Level을 지원하는 기기 선택 시
						// 1. 모두다 OFF일때만 OFF
						// 2. 1개라도 ON이면 100% 표시.
						if(avgDemandCount[0] > 1)
							inpDemand.enable(text == "OFF" ? false : true); //모두 OFF일때만 false.
						else
							inpDemand.enable(text == "ON" ? true : false);
					}
				}
			}
		},

		// OPTION UI는 0번째 Remote Control의 RadioGroup이므로 0 과 나머지로 구분.
		// InstallationInfo 의 index:6 에 Option은 remoteControl까지 담겨온다.
		// 하지만 API에는 Option은 붙어오고 remoteControl만 configuration 에 담겨오므로 수정.
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 Option의 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setOptionUI
		*	@param {Array}finalOptionInfo - 옵션 정보 배열.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setOptionUI : function(finalOptionInfo){
			var length = finalOptionInfo.length;
			var group = radioGroupView[OPTION_INDEX];
			var i;

			if(!length){
				//				group[0].clear();
				for(i = 1; i < OPTION_COUNT; i++){
					//select() 버튼에 인자로 전달된 Text 표시 및 Text 값에 따라 버튼 체크 상태 반영되는 함수임.
					if(group[i].select) group[i].select("ON/OFF");
				}
				return;
			}

			for(i = 0; i < length; i++){
				var text;
				var gi = i + 1;

				//filterResetRequired 만 boolean타입이고 나머지는 ON/OFF로 받는다.
				var info = finalOptionInfo[i];
				if(typeof info === "string"){
					if(info === "On") info = true;
					else if(info === "Off") info = false;
					else info = void 0;
				}

				//if(gi == 1) text = "Filter Reset";
				if(gi == 1) text =  I18N.prop("FACILITY_INDOOR_CONTROL_FILTER_RESET");
				else if(info === true){
					text = "ON";
				}else if(info === false){
					text = "OFF";
				}else {
					text = "ON/OFF";
				}

				if(group[gi].select) group[gi].select(text);
			}
		},
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 Remote Control의 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setRemoteControlUI
		*	@param {Array}finalOptionInfo - 옵션 정보 배열.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setRemoteControlUI : function(finalOptionInfo){
			var length = finalOptionInfo.length;
			var group = radioGroupView[OPTION_INDEX][0];

			if(!length){

				group.clear();
				return;
			}

			group.clear();
			var text = finalOptionInfo[0];
			if(!text || !text.length) return;
			group.value(text);

		},


		/* AIR CONDITION INDEX
		 *
		 * var INDOOR_WIND_DIRECTION0_INDEX = "7";
		 * var INDOOR_WIND_DIRECTION1_INDEX = "8";
		 *
		 *  Air Condition 의 경우 하나의 값을 2개의 RadioGroup에서 결정을해야한다.
		 */
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 실내기 풍향의 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setAirConditionUI
		*	@param {Array} finalAirControlInfo - 실내기 제어 정보 배열.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setAirConditionUI : function(finalAirControlInfo){

			var value = finalAirControlInfo[0];

			for(var i = INDOOR_WIND_DIRECTION0_INDEX; i <= INDOOR_WIND_DIRECTION1_INDEX; i++){

				var group = radioGroupView[i];
				group.clear();
				if(value) group.value(value);
			}
		},

		/* FAN SPEED INDEX
		 *
		 * var INDOOR_FAN_SPEED_INDEX = "2";
		 * var VENTILATOR_FAN_SPEED_INDEX = "10";
		 *
		 */
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 실내기 풍량의 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setFanSpeedUI
		*	@param {Array} finalFanSpeedInfo - 실내기 풍량 정보.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setFanSpeedUI : function(finalFanSpeedInfo){
			var fanSpeedUIIndex = [INDOOR_FAN_SPEED_INDEX, VENTILATOR_FAN_SPEED_INDEX];

			var length = finalFanSpeedInfo.length;

			for(var i = 0; i < length; i++){

				var group = radioGroupView[fanSpeedUIIndex[i]];
				group.clear();

				var text = finalFanSpeedInfo[i];
				if(!text || !text.length) continue;

				group.value(text);
			}
		},

		/* MODE INDEX
		 *
		 * var INDOOR_MODE_INDEX = "1";
		 * var INDOOR_OPERATION_LIMIT_INDEX = "4";
		 * var VENTILATOR_MODE_INDEX = "9";
		 * var DHW_OPERATION_MODE_INDEX = "11";
		 *
		 */
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 실내기 운전 모드의 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setModeUI
		*	@param {Array} finalModeInfo - 실내기 운전 모드 정보.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setModeUI : function(finalModeInfo){
			var modeUIIndex = [INDOOR_MODE_INDEX, VENTILATOR_MODE_INDEX, DHW_OPERATION_MODE_INDEX, INDOOR_OPERATION_LIMIT_INDEX];
			var length = finalModeInfo.length;

			for(var i = 0; i < length; i++){

				var modeIndex = modeUIIndex[i];
				var group;
				if(i === 0){
					group = radioGroupView[INDOOR_CHILLER_MODE_INDEX];
					group.clear();
				}
				group = radioGroupView[modeIndex];
				group.clear();

				var text = finalModeInfo[i];
				if(!text || !text.length) continue;

				// .5
				if(text === "CoolStorage" || text === "HeatStorage" || text === "HotWater"){
					group = radioGroupView[INDOOR_CHILLER_MODE_INDEX];
					if(text === "HotWater") text = "HeatStorage";
				}

				if(i === 1 && text === "Normal")
					text = "ByPass";

				group.value(text);

			}
		},
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 실내기 전원의 현재 값 및 현재 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _setPowerUI
		*	@param {Array} finalPowerInfo - 실내기 전원 정보.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_setPowerUI : function(finalPowerInfo){

			var self = this;
			var length = finalPowerInfo.length;
			var btnPower = radioGroupView[POWER_INDEX];

			var items = panelBar.element.children();
			var expanded = items.filter(".k-state-active");
			var i;
			if(!length){
				for(i = 0; i < POWER_COUNT; i++){
					btnPower[i].select("ON/OFF");
				}

				if(!self.options.groupMode) panelBar.collapse(expanded);
				return;
			}

			var expandIndex = expanded.index();
			var selector;
			for(i = 0; i < length; i++){
				var text;

				var info = finalPowerInfo[i];
				if(typeof info === "undefined"){
					if(expandIndex === i && !self.options.groupMode){ panelBar.collapse(expanded); expandIndex = -1;}
					continue;
				}
				//				panelBar.enable(selector, true);
				if(i === 0 || i === 1) selector = panelBar.wrapper.children()[i];

				if(info && info.length){
					text = info.toUpperCase();
				}else{
					text = "ON/OFF";
				}
				if(btnPower[i].options.enable) btnPower[i].select(text);
			}
			if(selector && expandIndex === -1 && !self.options.groupMode) panelBar.expand(selector);
		},
		/**
		*
		*   <ul>
		*       <li>연산된 InstallationInformation 정보에 따라 UI요소를 표시/미표시 하도록 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _switchUI
		*	@param {Array} finalInstallationInfo - 설치 정보.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_switchUI : function(finalInstallationInfo){
			var self = this;
			var isEnable;
			var i, j, ilength;
			for(i = 0, ilength = finalInstallationInfo.length; i < ilength; i++){

				if(!radioGroupView.hasOwnProperty(i + "")) continue;

				var group = radioGroupView[i + ""];

				//bitArray의 각 index가 group의 view index가 일치해야함.
				//ex) bitArray : 1111 , view[0], view[1], view[2], view[3] 존재
				var bitArray = self.convertBase.dec2bin(finalInstallationInfo[i]);
				var jlength, isRadioGroup;

				//group length가 없는 경우는 RadioGroup(Button 여러개 관리)
				if(group.length){
					jlength = group.length;
					isRadioGroup = false;
				}else{
					jlength = group.count();
					group.oriEnable();
					isRadioGroup = true;
				}

				/*
				 *  i === 1 실내기 운전모드의 경우 0~4와 5(축냉)~6(축열)이 별도의 chiller mode group으로 빠지면서 group이 분리되어버림.
				 *  이는 chiller mode 에만 사용.
				 *  하기부터 다음관련된 코드옆에는 .5 주석 표시.
				 *  Chiller Mode 축냉/축열 그룹에 대한 미표시/표시 설정을 위하여 group2로 분리.
				 */
				var chillerModeBit = [], group2startIndex = 5, group2;
				if(i === 1){
					group2 = radioGroupView[INDOOR_CHILLER_MODE_INDEX + ""];
					jlength += group2.count();
				}

				var cntRadioDisable = 0;
				var view;
				//2진수로 변환되었으므로 RTL 우측부터 읽는다.
				for(j = 0; j < jlength; j++){
					var bit = bitArray[bitArray.length - j - 1];
					if(bit && bit == "1") isEnable = true;
					else isEnable = false;

					// i===1이고 5(축냉) 이상부터는 group을 group2로 변경.
					// 축냉/축열은 그룹이 나누어져있으므로, 따로 게산한다.
					if(i === 1 && j >= group2startIndex){ chillerModeBit.push(isEnable); continue;}

					//.3_8 btnDischarge는 온도지원여부에 8번째비트, ViewGroup는 [5][5] 이다.
					//온도제한 (i=5)의 5번째 비트는 radioGroupView에서 쓰이고 있으므로, Continue.
					//하기 .3_8 주석 참고
					//UI의 radioGroupView를 온도지원여부(i=3)의 8(j=7)번째비트에 매핑되는데, UI의 Group 변경 Cost가 더 크므로 5, 5번을 View를 유지.
					if(i === 5 && j === 5) continue;

					if(isRadioGroup){
						group.oriEnable(j, isEnable);
						self.viewModel.set(group.id(j), !isEnable);
						if(!isEnable) cntRadioDisable++;
					}else{
						view = group[j];
						if(view.oriEnable) view.oriEnable(isEnable);
						self.viewModel.set(view.element.attr("id"), !isEnable);
					}
				}

				/*
				 *.3_8
				 * API에 토출온도제어 지원여부의 속성을 추가(가전사 요청)
				 *
				 * 현재 토출온도 제어의 enable값은 radioGroupView[TEMPERATURE_LIMIT_INDEX] 의 5번쨰 인덱스로 관리.
				 * 따라서 추가적으로 이 버튼에 대한 속성을 빼줘야한다.
				 * (게다가 installationInfo, panelConfigurationInfo 에서 8번째 비트로 오기 때문에 따로작업.
				 *
				 * i === 3 : 온도지원여부.
				 */
				if(i === 3){
					view = radioGroupView[TEMPERATURE_LIMIT_INDEX][TEMPERATURE_LIMIT_INDEX];
					// 8번째 비트에 채워져 오기 때문에 길이가 8인경우밖에 없다.(5,6,7 비트는 채워지는일 없음..)
					if(bitArray.length >= 8){
						if(view.oriEnable) view.oriEnable(true);
						self.viewModel.set(view.element.attr("id"), false);
					}else self.viewModel.set(view.element.attr("id"), true);
				}

				// .5
				// Chiller Mode 축냉/축열 그룹 버튼이 모두 비활성화이면, 미표시되도록 Set.
				if(i === 1 && group2){
					var cntRadioDisabledg2 = 0;
					isEnable = void 0;
					var g2length = group2.count();
					for(j = 0; j < g2length; j++){
						isEnable = chillerModeBit[j];

						group2.oriEnable(j, isEnable);
						self.viewModel.set(group2.id(j), !isEnable);
						if(!isEnable) cntRadioDisabledg2++;
					}
					if(cntRadioDisabledg2 === g2length) self.viewModel.set(group2.element.attr("id"), true);
					else self.viewModel.set(group2.element.attr("id"), false);
				}


				// RadioGroup는 개별 RadioButton뿐 아니라 전체버튼이 안보이는 경우 해당 그룹과 title을 보이게 하면 안된다.
				if(isRadioGroup){
					var element = group.element;
					// 상단에 실내기모드와 함께 축열/축냉 Chiller 모드 Bit 연산을 위하여 count가 더해졌기 때문에
					// 실내기 모드의 경우 라디오 버튼 표시/미표시 체크를 위하여 jlength 값을 group.count()로 대체
					if( i == 1 ) jlength = group.count();
					if(cntRadioDisable === jlength){
						self.viewModel.set(element.attr("id"), true); element.css("display", "none");
					}else {
						self.viewModel.set(element.attr("id"), false); element.css("display", "inline-block");
					}
				}
			}
		},
		/**
		*
		*   <ul>
		*       <li>연산된 PanelConfigurationInformation 정보에 따라 UI요소를 활성화/비활성화 하도록 UI를 업데이트한다.</li>
		*   </ul>
		*   @function _enableUI
		*	@param {Array} finalInstallationInfo 설치 정보.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		_enableUI : function(finalInstallationInfo){
			var self = this;
			var isEnable;
			var i, j, ilength;
			for(i = 0, ilength = finalInstallationInfo.length; i < ilength; i++){

				if(!radioGroupView.hasOwnProperty(i + "")) continue;

				var group = radioGroupView[i + ""];

				//bitArray의 각 index가 group의 view index가 일치해야함.
				//ex) bitArray : 1111 , view[0], view[1], view[2], view[3] 존재
				var bitArray = self.convertBase.dec2bin(finalInstallationInfo[i]);
				var jlength, isRadioGroup;

				//group length가 없는 경우는 RadioGroup(Button 여러개 관리)
				if(group.length){
					jlength = group.length;
					isRadioGroup = false;
				}else{
					jlength = group.count();
					//					group.clear();
					isRadioGroup = true;
				}

				/*
				 *  i === 1 실내기 운전모드의 경우 0~4와 5(축냉)~6(축열)이 별도의 chiller mode group으로 빠지면서 group이 분리되어버림.
				 *  이는 chiller mode 에만 사용.
				 *  하기부터 다음관련된 코드옆에는 .5 주석 표시.
				 */
				var chillerModeBit = [], group2startIndex = 5, group2;
				if(i === 1){
					group2 = radioGroupView[INDOOR_CHILLER_MODE_INDEX + ""];
					jlength += group2.count();
				}

				for(j = 0; j < jlength; j++){
					var bit = bitArray[bitArray.length - j - 1];
					if(bit && bit == "1") isEnable = true;
					else isEnable = false;

					// i===1이고 5(축냉) 이상부터는 group을 group2로 변경.
					if(i === 1 && j >= group2startIndex){ chillerModeBit.push(isEnable); continue;}

					//.3_8 btnDischarge는 온도지원여부에 8번째비트, ViewGroup는 [5][5] 이다.
					if(i === 5 && j === 5) continue;

					if(isRadioGroup){
						group.enable(j, isEnable);
						if(group.options.checkedValue)
							group.value(group.options.checkedValue);
					}else{
						var groupView = group[j];
						// 토출온도 Enable 버튼은 항상 Enable이다.
						if(i === 5 && j === 5 && self.viewModel.get("inpTemperature1")){
							isEnable = true;
						}
						groupView.enable(isEnable);
					}
				}

				/*
				 * API에 토출온도제어 지원여부의 속성을 추가(가전사 요청)
				 *
				 * 현재 토출온도 제어의 enable값은 radioGroupView[TEMPERATURE_LIMIT_INDEX] 의 5번쨰 인덱스로 관리.
				 * 따라서 추가적으로 이 버튼에 대한 속성을 빼줘야한다.
				 * (게다가 installationInfo, panelConfigurationInfo 에서 8번째 비트로 오기 때문에 따로작업.
				 *
				 * i === 3 : 온도지원여부.
				 */
				if(i === 3){
					var view = radioGroupView[TEMPERATURE_LIMIT_INDEX][TEMPERATURE_LIMIT_INDEX];

					// 8번째 비트에 채워져 오기 때문에 길이가 8인경우밖에 없다.(5,6,7 비트는 채워지는일 없음..)
					if(bitArray.length >= 8) view.enable(true);
					else view.enable(false);
				}

				// .5
				if(i === 1 && group2){

					var g2length = group2.count();
					for(j = 0; j < g2length; j++){
						isEnable = chillerModeBit[j];
						group2.enable(j, isEnable);
					}
				}
			}
		},
		/**
		*
		*   <ul>
		*       <li>진수를 변환하는 Util을 생성한다.</li>
		*   </ul>
		*   @function convertBase
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		convertBase : (function () {
			function convertBase(baseFrom, baseTo) {
				return function (num) {
					return parseInt(num, baseFrom).toString(baseTo);
				};
			}

			convertBase.bin2dec = convertBase(2, 10); 	// binary to decimal
			convertBase.bin2hex = convertBase(2, 16); 	// binary to hexadecimal
			convertBase.dec2bin = convertBase(10, 2); 	// decimal to binary
			convertBase.dec2hex = convertBase(10, 16); 	// decimal to hexadecimal
			convertBase.hex2bin = convertBase(16, 2); 	// hexadecimal to binary
			convertBase.hex2dec = convertBase(16, 10); 	// hexadecimal to decimal

			return convertBase;
		}()),
		/**
		*
		*   <ul>
		*       <li>실내기 기기 정보 리스르를 Set 하고, 해당 기기 정보 데이터에 따라 UI를 업데이트 하도록 한다.</li>
		*   </ul>
		*   @function setDataSource
		*	@param {Object} dataSource - 실내기 정보.
		*	@param {Boolean} isVisible - visible 확인 인자.
		*   @returns {void}
		*   @alias module:app/widget/control-custom-tab
		*
		*/
		setDataSource : function(dataSource, isVisible){
			var self = this;

			self.options.dataSource = dataSource;
			self.parseEnableData();
			if(!isVisible) self.parseData();
		},
		getExpandedData : function(){
			var that = this, panelBarEl = that.panelBar.element;
			var result = [];
			panelBarEl.find("> li.k-item").each(function(i, el){
				var expanded = $(el).attr("aria-expanded");
				expanded = expanded == "true" ? true : false;
				result.push({expanded : expanded});
			});
			return result;
		},
		setExpandedData : function(items){
			var that = this, panelBarEl = that.panelBar.element;
			var i, expanded, item, max = items.length, itemEl;
			//Single Mode 이므로 1개만 펼친다.
			for( i = 0; i < max; i++ ){
				item = items[i];
				expanded = item.expanded;
				if(typeof expanded !== "undefined" && expanded !== null){
					itemEl = panelBarEl.find("> li.k-item:eq(" + i + ")");
					if(expanded){
						that.panelBar.expand(itemEl, true);
						return;
					}
				}
			}
		}
	});
	ui.plugin(ControlTab);

})(jQuery);
