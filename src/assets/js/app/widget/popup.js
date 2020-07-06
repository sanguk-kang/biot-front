/**
 *
 *   <ul>
 *       <li>팝업에 대한 설정 및 팝업창에서 사용되는 데이터를 바인딩한다.</li>
 *       <li>단일 또는 복수 팝업창을 다룬다.</li>
 *       <li>Kendo UI의 Window 위젯을 상속받아 커스터마이징</li>
 *   </ul>
 *   @module app/widget/popup
 *   @requires app/main
 */

var util = window.Util;

// 컨펌 팝업 위젯 정의
(function() {
	var kendo = window.kendo;
	var ui = kendo.ui;
	var Widget = ui.Widget;
	var myWindow;

	var MyWidget = Widget.extend({
		options: {
			name: "ConfirmPopup",
			title: "Notification",
			closable: true,
			content: "Popup Content...",
			actions: [
				{ text: "", action: null },
				{ text: "", action: null }
			]
		},
		init: function(element, options) {
			Widget.fn.init.call(this, element, options);
			myWindow = this.element;
			options = this.options;

			// 윈도우 팝업 생성
			this._createTemplate(options);
			myWindow.closest(".k-dialog").addClass("pop-confirm");

		},
		_createTemplate: function() {
		},
		// 팝업 생성 이벤트
		showWindow: function() {
			myWindow.data("kendoDialog").open();
		}
	});

	ui.plugin(MyWidget);
})(jQuery);

// 팝업 싱글 윈도우 위젯 정의.
(function($, Util) {
	var kendo = window.kendo;
	var ui = kendo.ui;
	var Widget = ui.Window;
	// var myWindow, myOptions, myData, myTmpl, curIndex;
	// var eventFactory = {};

	var MyWidget = Widget.extend({
		options: {
			name: "PopupSingleWindow",
			title: "Detail",
			width: "652px",
			height: "770px",
			resizable: false,
			draggable: false,
			data: null,
			model: null,
			modal: true,
			animation: false,
			visible: false,
			myWindow: null,
			myOptions: null,
			myData: null,
			myTmpl: null,
			curIndex: null,
			eventFactory: {},
			templates: {
				"dataName": "<span class='detail-name' data-role='name'></span>",
				"dataValue": "<span class='detail-value' data-role='value'></span>"
			}
		},
		/**
		 *
		 *   위젯을 초기화하며 Single 팝업창 내부 UI요소를 생성한다. - 최초 1번 실행
		 *
		 *   @param {Object} element - 위젯 초기화를 위한 요소 객체
		 *   @param {Object} options - 위젯 초기화에 사용되는 Option 객체
		 *   @function init
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		init: function(element, options) {
			Widget.fn.init.call(this, element, options);
			this.options.myWindow = this.element;
			this.options.myOptions = this.options;
			this.options.myData = this.options.myOptions.data;
			this.options.myTmpl = this.options.myOptions.templates;
			this.options.eventFactory = this.options.myOptions.eventFactory;

			this.options.myWindow.css({
				display: "block"
			});
			// popup-window 클래스 추가
			this.options.myWindow.closest(".k-window").addClass("popup-window");
			// 기본 이벤트 등록
			this.bindDefauleEvent();
			// DOM 초기화
			this._initDom();
		},
		/**
		 *
		 *   Single 팝업창 내부의 UI DOM을 초기화 한다.
		 *
		 *   @function _initDom
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		_initDom: function() {
			var dataWrapper = this.options.myWindow.find("[data-name]");
			var dataName;
			var dataValue;
			var i;
			// data-name 요소 내부에 data-role이 없을 경우 default Dom부착
			for(i = 0; i < dataWrapper.length; i++) {
				var wrapper = $(dataWrapper[i]);
				if(wrapper.find("[data-role=name]").length == 0
					&& wrapper.find("[data-role=value]").length == 0) {
					dataName = $(this.options.myTmpl["dataName"]);
					dataValue = $(this.options.myTmpl["dataValue"]);
					wrapper.prepend(dataValue).prepend(dataName);
					wrapper.addClass("popup-detail-row");
				}
			}

			// 버튼 kendoUI 적용
			var btn = this.options.myWindow.find("button");
			var tmp;
			for(i = 0; i < btn.length; i++) {
				tmp = $(btn[i]);
				tmp.addClass("popup-btn");
				tmp.kendoButton();
			}

			// save 버튼 dimmed 초기화
			// var saveBtn = $(".popup-window").find("[data-event=save]").data("kendoButton").enable(false);

			// input 태그 popup-inpu, k-input 적용
			var ipt = this.options.myWindow.find("input");
			for(i = 0; i < ipt.length; i++) {
				tmp = $(ipt[i]);
				tmp.addClass("popup-input").addClass("k-input");
			   // tmp.kendoMaskedTextBox();
			}

			// kendo UI 클로즈 버튼 제거 및 추가
			this.options.myWindow.closest(".popup-window").find(".k-window-actions").css("visibility", "hidden");
			var closeBtn = $("<span class='pop-window-btn-close ic ic-close'></span>");
			this.options.myWindow.closest(".k-window").find(".k-window-titlebar").append(closeBtn);
			this.options.myWindow.closest(".k-window").find(".k-window-titlebar").find(".pop-window-btn-close").on("click", function(e){
				var target = $(e.target);
				target.closest(".popup-window-single").removeClass("popup-editmode");
				target.closest(".popup-window").find("[data-role=popupsinglewindow]").data("kendoPopupSingleWindow").close();
			});
		},
		/**
		 *
		 *   Single 팝업창의 기본 이벤트를 등록한다.
		 *
		 *   @function bindDefauleEvent
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindDefauleEvent: function() {
			var closeSel = ".popup-window-single [data-event=close]";
			var closeBtn = $(closeSel);
			var closeCb = function(e){
				var target = $(e.target);
				target.closest(".popup-window-single").removeClass("popup-editmode");
				target.closest("[data-role=popupsinglewindow]").data("kendoPopupSingleWindow").close();
			};

			if(closeBtn.length !== 0) {
				closeBtn.on("click", closeCb);
				this.options.eventFactory["singleWindowClose"] = {
					"selector": closeSel,
					"callback": closeCb
				};
			}
		},
		/**
		 *
		 *   Single 팝업창 내부 요소에 커스텀 이벤트를 위젯에 저장한다.
		 *
		 *   @param {String} selector - 셀렉터 문자열
		 *   @param {String} eventName - 등록할 이벤트 이름 문자열
		 *   @param {Object} callback - 등록할 이벤트 함수
		 *   @function addEventToFactory
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		addEventToFactory: function(selector, eventName, callback) {
			var btn;
			btn = $(selector);

			for(var i = 0; i < btn.length; i++) {
				var tmp = $(btn[i]);
				tmp.on("click", callback);
			}

			// 이벤트 저장소에 등록
			this.options.eventFactory[eventName] = {
				"selector": selector,
				"callback": callback
			};
		},
		/**
		 *
		 *   Single 팝업창 내부 요소에 커스텀 이벤트를 등록한다.
		 *
		 *   @function bindEvent
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindEvent: function() {
			var sel, cb;

			for(var key in this.options.eventFactory) {
				sel = this.options.eventFactory[key]["selector"];
				cb =  this.options.eventFactory[key]["callback"];

				var elem = $(sel);
				for(var i = 0; i < elem.length; i++) {
					var tmp = $(elem[i]);
					tmp.on("click", cb);
				}
			}
		},
		/**
		 *
		 *   Single 팝업창 내부 요소에 데이터를 바인딩한다.
		 *
		 *   @param {Array} data - 전체 데이터 배열
		 *   @param {Number} dataIndex - 전체 데이터 중 대상 데이터의 인덱스
		 *   @function bindData
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindData: function(data, dataIndex){
			this.options.myData = data;
			this.options.curIndex = dataIndex;
			var elems = this.options.myWindow.find("[data-name]");
			var name, value;
			data = data[dataIndex];
			var i, tmp;

			for(i = 0; i < elems.length; i++) {
				tmp = $(elems[i]);
				name = tmp.find("[data-role=name]");
				value = tmp.find("[data-role=value]");

				name.text(this.options.model.fields[tmp.attr("data-name")].name);

				if(typeof data[tmp.attr("data-name")] === "undefined"){
					value.text("-");
				}else{
					value.text(data[tmp.attr("data-name")]);
				}
			}

			// input 태그 keyup 이벤트 등록
			var inputTagSingle = $(".popup-window-single").find(".box-detail").find(".popup-input");
			for(i = 0; i < inputTagSingle.length; i++) {
				tmp = $(inputTagSingle[i]);
				tmp.keyup(function() {
					$(".popup-window-single").find("[data-event=save]").data("kendoButton").enable(true);
				});
			}
		},
		/**
		 *
		 *   제어이력 데이터를 Single 팝업창에 바인딩한다.
		 *
		 *   @param {Array} data - 전체 데이터 배열
		 *   @function bindHistoryData
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindHistoryData: function(data){
			var I18N = window.I18N;
			var systemOriDef = {
				'b.IoT': I18N.prop("FACILITY_HISTORY_QUADURON"),
				Others: I18N.prop("FACILITY_HISTORY_OTHERS")
			};
			var serviceOriDef = {
				Manual: I18N.prop("FACILITY_HISTORY_MANUAL"),
				Rule: I18N.prop("FACILITY_HISTORY_RULE"),
				Schedule: I18N.prop("FACILITY_HISTORY_SCHEDULE")
			};

			var elems = this.options.myWindow.find("li[data-name]");
			elems.css({overflow: "hidden"});

			var name, value, result;
			for(var i = 0; i < elems.length; i++){
				var tmp = $(elems[i]);

				name = tmp.find("[data-role=name]");
				value = tmp.find("[data-role=value]");
				name.text(this.options.model.fields[tmp.attr("data-name")].name);

				//name.css({float: "left"});
				//value.css({float: "left"});

				if(typeof data[tmp.attr("data-name")] === "undefined"){
					value.text("-");
				}else if(tmp.attr("data-name") == "attributes"){
					var attributes = data.attributes;
					var attrKey, attrVal, displayName, historyKeyString, valueKeyString;
					var keyName = "";
					result = "";
					if(attributes){
						for(var x = 0; x < attributes.length; x++){
							var attr = attributes[x];
							attrKey = attr.key.split("-");
							for(var y = attrKey.length - 1; y >= 0; y--){
								keyName = keyName + attrKey[y];
							}
							if(attrKey.length > 1){
								keyName = attrKey[attrKey.length - 2] + "_" + attrKey[attrKey.length - 1];
								keyName = keyName.replace(/-|\./g, "_");
							}
							keyName = keyName.toUpperCase();

							if(keyName.indexOf('DIMMINGLEVEL') > -1){
								keyName = 'DIMMINGLEVEL';
							}

							attrVal = attr.value;
							historyKeyString = Util.getHistoryOperation(keyName);

							if(keyName.indexOf("VALUE") != -1 ||
							   keyName.indexOf("DESIRED") != -1 ||
							   keyName.indexOf("LEVEL") != -1) {
								valueKeyString = Util.getHistoryOperationValue("FACILITY_HISTORY_OPERATION_" + keyName + "_VALUE", attrVal.toUpperCase());
							} else {
								if(attrVal.indexOf("~") != -1) {
									attrVal = attrVal.replace("~", "_");
								}
								valueKeyString = Util.getHistoryOperationValue("FACILITY_HISTORY_OPERATION_" + keyName + "_" + attrVal.toUpperCase());
							}

							displayName = "<div>" + historyKeyString + " / " + valueKeyString + "</div>";
							result += displayName;
						  }
					}else{
						result = "<div>-</div>";
					}
					value.html(result);
				}else if(tmp.attr("data-name") == "systemOrigin") {
					result = systemOriDef[data[tmp.attr("data-name")]];
					if(!result) {
					  result = I18N.prop("FACILITY_HISTORY_OTHERS");
					}
					value.text(result);
				}else if(tmp.attr("data-name") == "serviceOrigin") {
					result = serviceOriDef[data[tmp.attr("data-name")]];
					if(!result) {
					  result = I18N.prop("FACILITY_HISTORY_OTHERS");
					}
					value.text(result);
				}else{
					value.text(data[tmp.attr("data-name")]);
				}
			}

		},
		/**
		 *
		 *   공간 zone 데이터를 Single 팝업창에 바인딩한다.
		 *
		 *   @param {Array} data - 전체 데이터 배열
		 *   @param {Number} dataIndex - 전체 데이터 중 대상 데이터 인덱스
		 *   @function bindZoneData
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindZoneData:function(data, dataIndex){
			this.options.myData = data;
			this.options.curIndex = dataIndex;
			var elems = this.options.myWindow.find("[data-name]");
			var name, value;
			data = data[dataIndex];
			var dateformatSet = function(date){
				 var dateStr , days, time,dateObj,timeObj;
				 dateStr = date.split('T');
				 days = dateStr[0];
				 time = dateStr[1];
				 dateObj = days.split('-');
				 timeObj = time.split('.');
				 return {date : [dateObj[0],dateObj[1] ,dateObj[2]], time: [timeObj[0]]};
		   };
		   var i, tmp;
			for(i = 0; i < elems.length; i++) {
				tmp = $(elems[i]);

				name = tmp.find("[data-role=name]");
				value = tmp.find("[data-role=value]");

				name.text(this.options.model.fields[tmp.attr("data-name")].name);

				if(typeof data[tmp.attr("data-name")] === "undefined"){
					value.text("-");
				}else{
					value.text(data[tmp.attr("data-name")]);
				}
				if(tmp.attr("data-name") == 'createdDate' ){
					if(data.created){
						var dataCreated = dateformatSet(data.created.date);
						value.text(dataCreated.date[0] + '/' + dataCreated.date[1] + '/' + dataCreated.date[2] + " " + dataCreated.time[0]);
					}else{
						value.text("-");
					}
				}
				if(tmp.attr("data-name") == 'foundation_space_floors_type' ){
					var changeData = value.closest('li').find('[data-name="foundation_space_floors_name"] .detail-value');
					if(data.foundation_space_floors_type && data.foundation_space_floors_type !== 'None'){
						if(data.foundation_space_floors_type == 'B'){
							value.text(changeData.text());
							changeData.text(data.foundation_space_buildings_name + ' - ' + data.foundation_space_floors_type);
						}else{
							value.text(data.foundation_space_floors_type);
							changeData.text(data.foundation_space_buildings_name + ' - ' + data.foundation_space_floors_name);
						}
					}else{
						value.text(data.foundation_space_buildings_name + ' - ' + data.foundation_space_floors_name);
						changeData.text('');
					}
				}
				if(tmp.attr("data-name") == 'createdUms_users_name' ){
					if(data.created){
						value.text(data.created.ums_users_name);
					}else{
						value.text("-");
					}
				}
				if(tmp.attr("data-name") == 'updatedDate' ){
					if(data.updated){
						var dataUpdated = dateformatSet(data.updated.date);
						value.text(dataUpdated.date[0] + '/' + dataUpdated.date[1] + '/' + dataUpdated.date[2] + " " + dataUpdated.time[0]);
					}else{
						value.text("-");
					}
				}
				if(tmp.attr("data-name") == 'updatedUms_users_name' ){
					if(data.updated){
						value.text(data.updated.ums_users_name);
					}else{
						value.text("-");
					}
				}


			}

			// input 태그 keyup 이벤트 등록
			var inputTagSingle = $(".popup-window-single").find(".box-detail").find(".popup-input");
			for(i = 0; i < inputTagSingle.length; i++) {
				tmp = $(inputTagSingle[i]);
				tmp.keyup(function() {
					$(".popup-window-single").find("[data-event=save]").data("kendoButton").enable(true);
				});
			}
		},
		/**
		 *
		 *   에너지 요약 데이터를 Single 팝업창에 바인딩한다.
		 *
		 *   @param {Array} data - 전체 데이터 배열
		 *   @param {Number} dataIndex - 전체 데이터 중 대상 데이터 인덱스
		 *   @function bindSummaryData
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindSummaryData:function(data, dataIndex){
			this.options.myData = data;
			this.options.curIndex = dataIndex;
			var elems = this.options.myWindow.find("[data-name]");
			var name, value;
			var I18N = window.I18N;
			data = data[dataIndex];
			// console.log(data)
			var tmp;
			for(var i = 0; i < elems.length; i++) {
				tmp = $(elems[i]);

				name = tmp.find("[data-role=name]");
				value = tmp.find("[data-role=value]");
				if(this.options.model.fields[tmp.attr("data-name")]){
					name.text(this.options.model.fields[tmp.attr("data-name")].name);
					if(tmp.attr("data-name") == 'location' ){
						name.text(I18N.prop("ENERGY_LOCATION"));
					}
					if(tmp.attr("data-name") == 'Algorithm' ){
						name.text(I18N.prop("ENERGY_ALGORITHM"));
					}
				}

				if(typeof data[tmp.attr("data-name")] === "undefined"){
					value.text("-");
				}else{
					value.text(data[tmp.attr("data-name")]);
				}

				if(tmp.attr("data-name") == 'Algorithm' ){
					if(data.algorithm){
						var modeList = data.algorithm;
						var textList = '';
						var text = '';
						var textData;
						for(var k = 0; k < modeList.length; k++){
							if(k > 0){
								text = ' , ';
							}
							if(modeList[k] == 'OptimalStart'){
								textData = I18N.prop('ENERGY_OPTIMAL_START');
							}
							if(modeList[k] == 'Comfort'){
								textData = I18N.prop('ENERGY_COMFORT');
							}
							if(modeList[k] == 'PRC'){
								textData = I18N.prop('ENERGY_PRC');
							}
							textList = textList + text + textData;
						}
						value.text(textList);
					}else{
						value.text("-");
					}
				}
			}
		},
		/**
		 *
		 *   디바이스 데이터를 Single 팝업창에 바인딩한다.
		 *
		 *   @param {Array} allData - 전체 데이터 배열
		 *   @param {Number} index - 전체 데이터 중 대상 데이터 인덱스
		 *   @function bindDeviceData
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindDeviceData : function(allData, index){
			this.options.myData = allData;
			this.options.curIndex = index;
			var data = allData[index];

			var domName, domValue;
			var elems = this.options.myWindow.find("[data-name]");

			var tmp, name;
			for(var i = 0, length = elems.length; i < length; i++) {
				tmp = $(elems[i]);

				domName = tmp.find("[data-role=name]");
				domValue = tmp.find("[data-role=value]");

				name = this.options.model.fields[tmp.attr("data-name")].name;
				domName.text(name);

				var value = data[tmp.attr("data-name")];
				if(value && value.length){

					if(name === "Location"){


						var temp = value[0];
						value = "";
						if(temp.foundation_space_buildings_id){
							value += temp.foundation_space_buildings_id + " ";
						}

						if(temp.foundation_space_floors_id){
							value += temp.foundation_space_floors_id + " ";
						}

						if(temp.foundation_space_zones_id){
							value += temp.foundation_space_zones_id;
						}

						domValue.text(value);
					}else if(name === "Status"){
						if(value.indexOf("Critical") >= 0) value = "Critical";
						else value = value.replace(".", "(") + ")";
						domValue.text(value);
					}else if(name === "Group"){
						domValue.text("-");
					}else
						domValue.text(value);

				}else{
					domValue.text("-");
				}
			}
		},
		/**
		 *
		 *   바인딩 된 데이터를 갱신하여 리턴한다.
		 *
		 *   @function updateData
		 *   @returns {Array} - 갱신된 데이터 배열
		 *   @alias module:popup
		 *
		 */
		updateData: function() {
			var row = this.options.myWindow.find(".popup-detail-row");

			for(var i = 0; i < row.length; i++) {
				var tmp = $(row[i]);
				var curName = tmp.attr("data-name");
				this.options.myData[this.options.curIndex][curName] = tmp.find(".detail-value").text();
			}
			return this.options.myData;
		},
		/**
		 *
		 *   Single 팝업창을 오픈한다.
		 *
		 *   @function openWindowPopup
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		openWindowPopup: function(){
			this.element.data("kendoPopupSingleWindow").center().open();
		}
	});

	// 플러그인 등록
	ui.plugin(MyWidget);
})(jQuery, util);

// 팝업 멀티 윈도우 위젯 정의.
(function($){
	var kendo = window.kendo;
	var ui = kendo.ui;
	var Widget = ui.Window;
	// var myWindow, myOptions, myData, myTmpl;

	// var curIndex, curData;
	// var selected = [];
	// var self;
	// var eventFactory = {};

	var MyWidget = Widget.extend({
		options: {
			name: "PopupMultipleWindow",
			title: "Detail",
			width: "760px",
			height: "770px",
			modal: true,
			model: null,
			data: null,
			resizable: false,
			draggable: false,
			myWindow: null,
			myOptions: null,
			myData: null,
			myTmpl: null,
			myModel: null,
			curIndex: void 0,
			curData: null,
			selected: [],
			eventFactory: {},
			self: null,
			animation: false,
			visible: false,
			templates: {
				"dataName": "<span class='detail-name' data-role='name'></span>",
				"dataValue": "<span class='detail-value' data-role='value'></span>",
				"panelItem": "<li class='panel-item'></li>",
				"panelItemHeader" : "<span class='k-link k-header'></span>",
				"panelSubItem": "<div class='panel-subitem'></div>"
			}
		},
		/**
		 *
		 *   위젯을 초기화하며 Multiple 팝업창 내부 UI요소를 생성한다. - 최초 1번 실행
		 *
		 *   @param {Object} element - 위젯 초기화를 위한 요소 객체
		 *   @param {Object} options - 위젯 초기화에 사용되는 Option 객체
		 *   @function init
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		init: function(element, options) {
			Widget.fn.init.call(this, element, options);
			this.options.myWindow = this.element;
			this.options.myOptions = this.options;
			this.options.myData = this.options.myOptions.data;
			this.options.myTmpl = this.options.myOptions.templates;
			this.options.myModel = this.options.myOptions.model;
			this.options.self = this;

			this.options.myWindow.css({
				display: "block"
			});

			// popup-window 클래스 추가
			this.options.myWindow.closest(".k-window").addClass("popup-window");

			// 버튼 kendoUI 적용
			var btn = this.options.myWindow.find("button");
			for(var i = 0; i < btn.length; i++) {
				var tmp = $(btn[i]);
				tmp.addClass("popup-btn");
				tmp.kendoButton();
			}

			this._initDom();
		},
		 /**
		 *
		 *   Multiple 팝업창 내부의 UI DOM을 초기화 한다.
		 *
		 *   @function _initDom
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		_initDom: function() {
			var dataWrapper = this.options.myWindow.find("[data-name]");
			var dataName;
			var dataValue;
			var i, tmp;
			// data-name 요소 내부에 data-role이 없을 경우 default Dom부착
			for(i = 0; i < dataWrapper.length; i++) {
				var wrapper = $(dataWrapper[i]);
				if(wrapper.hasClass("ic") === false) {
					if(wrapper.find("[data-role=name]").length == 0
					&& wrapper.find("[data-role=value]").length == 0) {
						dataName = $(this.options.myTmpl["dataName"]);
						dataValue = $(this.options.myTmpl["dataValue"]);
						wrapper.prepend(dataValue).prepend(dataName);
						wrapper.addClass("popup-detail-row");
					}
				}
			}

			// 버튼 kendoUI 적용 및 save 버튼 dimmed 처리
			var btn = this.options.myWindow.find("button");
			for(i = 0; i < btn.length; i++) {
				tmp = $(btn[i]);
				tmp.kendoButton();
				if(tmp.attr("data-event") === "save"){
					tmp.data("kendoButton").enable(false);
				}
			}
			// input 태그 popup-input, k-input 클래스 적용
			var ipt = this.options.myWindow.find("input");
			for(i = 0; i < ipt.length; i++) {
				tmp = $(ipt[i]);
				// var edtType = this.options.myModel.fields[dtName].editType;
				// if(edtType === "select") {
				// tmp.kendoDropDownList({
				//     dataTextField: "text",
				//     dataValueField: "value",
				//     dataSource: myModel.fields[dtName].options,
				//     index: 0
				// });
				// }else {
				tmp.addClass("popup-input");
				tmp.addClass("k-input").kendoMaskedTextBox();
				// }
			}

			// 기본 이벤트 등록
			this.bindDefauleEvent();
			// 버튼 숨김
			this.options.myWindow.find(".popup-footer").find("[editmode=show]").hide();
			// kendo UI 클로즈 버튼 제거 및 추가
			if(this.options.myWindow.closest(".k-window").find(".k-window-titlebar").find(".pop-window-btn-close").length === 0){
				this.options.myWindow.closest(".popup-window").find(".k-window-actions").css("visibility", "hidden");
				var closeBtn = $("<span class='pop-window-btn-close ic ic-close'></span>");
				this.options.myWindow.closest(".k-window").find(".k-window-titlebar").append(closeBtn);
				this.options.myWindow.closest(".k-window").find(".k-window-titlebar").find(".pop-window-btn-close").on("click", function(e){
					var target = $(e.target);
					target.closest(".popup-window-multiple").find("panel-item").removeClass("popup-editmode");
					target.closest(".popup-window").find("[data-role=popupmultiplewindow]").data("kendoPopupMultipleWindow").close();
				});
			}
			// template 숨김
			this.options.myWindow.find("[data-role=template]").hide();
		},
		/**
		 *
		 *   Multiple 팝업창 내부 패널 List의 DOM을 생성한다.
		 *
		 *   @function createPanelBar
		 *	 @param {Array} data - 데이터 배열.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		createPanelBar: function(data) {
			var self = this;
			var memberCount = this.options.myWindow.find("[data-role=count]");
			var panelRoot = this.options.myWindow.find(".popup-panel");

			this.options.myWindow.find(".popup-panel").unbind("click");
			panelRoot.find(".panel-item").remove();
			// panelRoot.empty();

			var panelItem, panelItemHeader;
			var panelTmpl = this.options.myWindow.find("[data-role=template]");
			var i, tmp;

			memberCount.text(data.length);
			// 모델 구분
			// console.log(this.options.myModel.fields.hasOwnProperty("ums_groups_name"));
			var headerHTML;
			for(i = 0; i < data.length; i++){
				if(this.options.myModel.fields.hasOwnProperty("ums_groups_name")){ // User 인 경우
					headerHTML = "<span class='panel-item-num'>" + (i + 1) + "</span><span class='panel-item-member'>" + data[i].name + " (" + data[i].id + ")" + "</span>";
				}else if(this.options.myModel.fields.hasOwnProperty("type")){
					if(this.options.myModel.fields.popupType === "Alarm"){
						headerHTML = "<span class='panel-item-num'>" + (i + 1) + "</span><span class='panel-item-name'></span><span class='panel-item-information'>" + data[i].name + "</span>";
					}
				}else{
					var status = data[i].status;
					if(status === "err") status = "Critical";
					else status = "Normal (" + status + ")";
					headerHTML = "<span class='panel-item-num'>" + (i + 1) + "</span><span class='" + data[i].deviceMode + " detail'></span><span class='panel-item-member'>" + data[i].deviceName + "</span><span class='panel-item-temp'>" + status + "</span>";
				}

				tmp = $(panelTmpl.prop("outerHTML"));
				panelItem = $(this.options.myTmpl["panelItem"]);
				panelItemHeader = $(this.options.myTmpl["panelItemHeader"]);
				panelRoot.append(panelItem);
				panelItem.append(panelItemHeader);
				panelItemHeader.append($(headerHTML));
				panelItem.append(tmp);
			}

			// 패널바 생성
			this.options.myWindow.find(".popup-panel").kendoPanelBar({
				expandMode: "single",
				data: data,
				select: function(e) {
					// 선택된 아이템
					var li = $(e.item);
					var lis = li.closest("[data-role=panelbar]").find(".panel-item");
					// 현재 인덱스
					var index = lis.index(e.item);
					self.options.curIndex = index;
					// 선택된 아이템 expand, collapse 토글
					if (li.is(".k-state-active")) {
						var that = this;
						window.setTimeout(function(){
							that.collapse(e.item);
						}, 1);
					}

					//li.find(".pop-panel-item-arrow").toggleClass("ic-list-control-up");
					for(var liIdx = 0; liIdx < lis.length; liIdx++) {
						var arrow = lis.eq(liIdx).find(".pop-panel-item-arrow");
						if(liIdx == index) {
							arrow.toggleClass("ic-list-control-up");
						} else {
							arrow.removeClass("ic-list-control-up");
						}
					}
				}
			});

			// 데이터 바인딩
			for(i = 0; i < data.length; i++) {
				this.bindData(i, data[i]);
			}
			// 이벤트 바인딩
			this.bindEvent();

			// 패널 펼침 아이콘 수정
			var panelBarIcon = $("<span class='pop-panel-item-arrow ic ic-list-control-down'></span>");
			this.options.myWindow.find(".popup-panel").find(".panel-item").find(".k-icon").hide();
			this.options.myWindow.find(".popup-panel").find(".panel-item").find(".k-header").append(panelBarIcon);
		},
		/**
		 *
		 *   팝업창 내부 현재 활성화된 패널의 인덱스를 리턴한다.
		 *
		 *   @function getCurrentPanelIndex
		 *   @returns {Number} - 패널의 인덱스
		 *   @alias module:popup
		 *
		 */
		getCurrentPanelIndex: function() {
			if(typeof this.options.curIndex === "undefined"){
				return 0;
			}
			return this.options.curIndex;
		},
		/**
		 *
		 *   Multiple 팝업창의 기본 이벤트를 등록한다.
		 *
		 *   @function bindDefauleEvent
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:popup
		 *
		 */
		bindDefauleEvent: function() {
			var closeSel = ".popup-window-multiple [data-event=close]";
			var closeBtn = $(closeSel);

			var closeCb = function(e){
				var target = $(e.target);
				var thisWindow = target.closest(".popup-window");
				target.closest(".popup-window-multiple").find(".panel-item").removeClass("popup-editmode");
				thisWindow.find(".popup-footer").find("[editmode=hide]").show();
				thisWindow.find(".popup-footer").find("[editmode=show]").hide();
				target.closest("[data-role=popupmultiplewindow]").data("kendoPopupMultipleWindow").close();
			};
			closeBtn.on("click", closeCb);

			this.options.eventFactory["multipleWindowClose"] = {
				"selector": closeSel,
				"callback": closeCb
			};
		},
		/**
		 *
		 *   Multiple 팝업창 내부 요소에 커스텀 이벤트를 위젯에 저장한다.
		 *
		 *   @param {String} selector - 셀렉터 문자열
		 *   @param {String} eventName - 등록할 이벤트 이름 문자열
		 *   @param {Object} callback - 등록할 이벤트 함수
		 *   @function addEventToFactory
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:popup
		 *
		 */
		addEventToFactory: function(selector, eventName, callback) {
			var btn;
			btn = $(selector);

			for(var i = 0; i < btn.length; i++) {
				var tmp = $(btn[i]);
				tmp.on("click", callback);
			}

			// 이벤트 저장소에 등록
			this.options.eventFactory[eventName] = {
				"selector": selector,
				"callback": callback
			};
		},
		/**
		 *
		 *   Multiple 팝업창 내부 요소에 커스텀 이벤트를 등록한다.
		 *
		 *   @function bindEvent
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindEvent: function() {
			var sel, cb;
			var self = this.options.self;
			var i, tmp;
			for(var key in this.options.eventFactory) {
				sel = this.options.eventFactory[key]["selector"];
				cb =  this.options.eventFactory[key]["callback"];

				var elem = $(sel);
				if(elem.parent(".popup-footer").length === 0) {
					for(i = 0; i < elem.length; i++) {
						tmp = $(elem[i]);
						tmp.on("click", cb);
					}
				}
			}
			// input 태그의 경우 save 버튼이 존재한다면 keyup이 발생할 경우 dimmed 해제
			var ipt = this.options.myWindow.find(".popup-input");
			for(i = 0; i < ipt.length; i++) {
				tmp = $(ipt[i]);
				tmp.keyup(function() {
					self.options.myWindow.find("[data-event=save]").data("kendoButton").enable(true);
				});
			}
		},
		/**
		 *
		 *   Multiple 팝업창 내부 패널에 현재 인덱스의 데이터를 디스플레이 한다.
		 *
		 *   @param {Number} index - 전체 데이터 중 대상 데이터의 인덱스
		 *   @param {Array} data - 전체 데이터 배열
		 *   @function bindData
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:popup
		 *
		 */
		bindData: function(index, data){
			var curItem = $(this.options.myWindow.find(".panel-item")[index]);
			var elems = curItem.find("[data-name]");
			var name, value;
			var tmp;

			for(var i = 0; i < elems.length; i++) {
				tmp = $(elems[i]);

				// if(data.fields[tmp.attr("data-name")].name === "imgUrl") {
				//     elems.attr("src", data[tmp.attr("data-name")]);
				// } else {
				name = tmp.find("[data-role=name]");
				value = tmp.find("[data-role=value]");

				name.text(this.options.model.fields[tmp.attr("data-name")].name);
				if(typeof data[tmp.attr("data-name")] === "undefined"){
					value.text("-");
				}else{
					value.text(data[tmp.attr("data-name")]);
				}
				// }
			}
		},
		/**
		 *
		 *   Multiple 팝업창 내부 패널의 데이터를 갱신하여 리턴한다.
		 *
		 *   @function updateData
		 *   @returns {Array} - 갱신된 데이터 배열
		 *   @alias module:popup
		 *
		 */
		updateData: function() {
			for(var i = 0; i < this.options.selected.length; i++) {
				var panelItem = $(this.options.myWindow.find(".panel-item")[i]);
				var row = panelItem.find(".popup-detail-row");
				for(var j = 0; j < row.length; j++) {
					var tmp = $(row[j]);
					var curName = tmp.attr("data-name");
					this.options.curData[i][curName]  = tmp.find(".detail-value").text();
				}
			}
			return this.options.curData;
		},
		/**
		 *
		 *   Multiple 팝업창을 오픈한다.
		 *
		 *   @function openWindowPopup
		 *	 @param {Object}total - 전체 오브젝트.
		 *	 @param {Array}array - 선택된 값 배열.
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:popup
		 *
		 */
		openWindowPopup: function(total, array){
			var data = [];
			this.options.selected = array;
			// console.log("selected: " +selected);
			for(var i = 0; i < this.options.selected.length; i++) {
				data.push(total[this.options.selected[i]]);
			}
			this.options.curData = data;
			this.createPanelBar(data);
			this.options.myWindow.data("kendoPopupMultipleWindow").center().open();
		},
		/**
		 *
		 *   디바이스 데이터를 Multiple 팝업창에 바인딩한다.
		 *
		 *   @param {Number} index - 전체 데이터 중 대상 데이터의 인덱스
		 *   @param {Array} data - 전체 데이터 배열
		 *   @function bindDeviceData
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:popup
		 *
		 */
		bindDeviceData : function(index, data){
			var curItem = $(this.options.myWindow.find(".panel-item")[index]);
			var elems = curItem.find("[data-name]");

			var tmp, domName, domValue, name;
			for(var i = 0, length = elems.length; i < length; i++) {
				tmp = $(elems[i]);

				domName = tmp.find("[data-role=name]");
				domValue = tmp.find("[data-role=value]");

				name = this.options.model.fields[tmp.attr("data-name")].name;
				domName.text(this.options.model.fields[tmp.attr("data-name")].name);

				var value = data[tmp.attr("data-name")];
				if(value && value.length){

					if(name === "Location"){
						var temp = value[0];
						value = "";
						if(temp.foundation_space_buildings_id){
							value += temp.foundation_space_buildings_id + " ";
						}

						if(temp.foundation_space_floors_id){
							value += temp.foundation_space_floors_id + " ";
						}

						if(temp.foundation_space_zones_id){
							value += temp.foundation_space_zones_id;
						}

						domValue.text(value);
					}else if(name === "Status"){
						if(value.indexOf("Critical") >= 0) value = "Critical";
						else value = value.replace(".", "(") + ")";
						domValue.text(value);
					}else if(name === "Group"){
						domValue.text("-");
					}else
						domValue.text(value);
				}else{
					domValue.text("-");
				}
			}
		},
		/**
		 *
		 *   Multiple 팝업창 내에 디바이스 데이터 바인딩을 위한 패널 바 DOM을 생성한다.
		 *
		 *   @param {Array} data - 전체 데이터 배열
		 *   @function createDevicePanelBar
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:popup
		 *
		 */
		createDevicePanelBar: function(data) {
			var self = this;
			var memberCount = this.options.myWindow.find("[data-role=count]");
			var panelRoot = this.options.myWindow.find(".popup-panel");
			var Util = window.Util;
			this.options.myWindow.find(".popup-panel").unbind("click");
			panelRoot.find(".panel-item").remove();
			// panelRoot.empty();

			var panelItem, panelItemHeader;
			var panelTmpl = this.options.myWindow.find("[data-role=template]");
			var i, tmp;

			memberCount.text(data.length);
			// 모델 구분
			// console.log(this.options.myModel.fields.hasOwnProperty("ums_groups_name"));
			var headerHTML;
			for(i = 0; i < data.length; i++){

				var status = Util.getStatus(data[i]);
				if(status.indexOf("Critical") >= 0) status = "Critical";
				else status = status.replace(".", "(") + ")";

				var mode = data[i].modes;
				if(mode){
					if(mode.length) mode = mode[0].mode;
					else{mode = "detail-img Auto on";}
				}else{mode = "detail-img Auto on";}

				headerHTML = "<span class='panel-item-num'>" + (i + 1) + "</span><span class='" + mode + " detail'></span><span class='panel-item-member'>" + data[i].name + "</span><span class='panel-item-temp'>" + status + "</span>";

				tmp = $(panelTmpl.prop("outerHTML"));
				panelItem = $(this.options.myTmpl["panelItem"]);
				panelItemHeader = $(this.options.myTmpl["panelItemHeader"]);
				panelRoot.append(panelItem);
				panelItem.append(panelItemHeader);
				panelItemHeader.append($(headerHTML));
				panelItem.append(tmp);
			}

			// 패널바 생성
			this.options.myWindow.find(".popup-panel").kendoPanelBar({
				expandMode: "single",
				data: data,
				select: function(e) {
					// 선택된 아이템
					var li = $(e.item);
					// 현재 인덱스
					var index = li.closest("[data-role=panelbar]").find(".panel-item").index(e.item);
					self.options.curIndex = index;
					// 선택된 아이템 expand, collapse 토글
					if (li.is(".k-state-active")) {
						var that = this;
						window.setTimeout(function(){that.collapse(e.item);}, 1);
					}

					li.find(".pop-panel-item-arrow").toggleClass("ic-list-control-up");
				}
			});

			// 데이터 바인딩
			for(i = 0; i < data.length; i++) {
				this.bindDeviceData(i, data[i]);
			}
			// 이벤트 바인딩
			this.bindEvent();

			// 패널 펼침 아이콘 수정
			var panelBarIcon = $("<span class='pop-panel-item-arrow ic ic-list-control-down'></span>");
			this.options.myWindow.find(".popup-panel").find(".panel-item").find(".k-icon").hide();
			this.options.myWindow.find(".popup-panel").find(".panel-item").find(".k-header").append(panelBarIcon);
		},
		/**
		 *
		 *   디바이스 Multiple 팝업창을 오픈한다.
		 *
		 *   @param {Array} ds - 전체 데이터 배열
		 *   @param {Array} array - 선택된 데이터 배열
		 *   @function openWindowDevicePopup
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:popup
		 *
		 */
		openWindowDevicePopup: function(ds, array){
			var data = [];
			this.options.selected = array;
			// console.log("selected: " +selected);
			for(var i = 0; i < this.options.selected.length; i++) {
				data.push(ds[this.options.selected[i]]);
			}

			this.options.curData = data;
			this.createDevicePanelBar(data);
			this.options.myWindow.data("kendoPopupMultipleWindow").center().open();
		}
	});

	ui.plugin(MyWidget);
})(jQuery);


//For Debug
//# sourceURL=popup.js
