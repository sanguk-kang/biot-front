/**
 *
 *   <ul>
 *       <li>날짜 입력 칸의 아이콘을 클릭하여 캘린더 팝업을 오픈한다.</li>
 *       <li>캘린더 팝업 내에서 날짜를 선택하여 입력 칸에 반영할 수 있다.</li>
 *       <li>Kendo UI의 DatePicker 위젯을 상속받아 커스터마이징</li>
 *   </ul>
 *   @module app/widget/common-date-picker
 *   @requires app/main
 */
(function($){
	var kendo = window.kendo, ui = kendo.ui, Widget = ui.Widget, parse = kendo.parseDate, keys = kendo.keys, DIV = '<div />', ns = '.kendoDatePicker', CLICK = 'click' + ns, OPEN = 'open', CLOSE = 'close', CHANGE = 'change', DEFAULT = 'k-state-default', DISABLED = 'disabled', STATEDISABLED = 'k-state-disabled', HOVEREVENTS = 'mouseenter' + ns + ' mouseleave' + ns, ARIA_DISABLED = 'aria-disabled', FOCUSED = 'k-state-focused', READONLY = 'readonly', SELECTED = 'k-state-selected', MOUSEDOWN = 'mousedown' + ns, ID = 'id', MIN = 'min', MAX = 'max', ARIA_EXPANDED = 'aria-expanded', ARIA_HIDDEN = 'aria-hidden', calendar = kendo.calendar, isInRange = calendar.isInRange, restrictValue = calendar.restrictValue, isEqualDatePart = calendar.isEqualDatePart, extend = $.extend, proxy = $.proxy, DATE = Date, moment = window.moment;

	function normalize(options) {
		var parseFormats = options.parseFormats, format = options.format;
		calendar.normalize(options);
		parseFormats = $.isArray(parseFormats) ? parseFormats : [parseFormats];
		if (!parseFormats.length) {
			parseFormats.push('yyyy-MM-dd');
		}
		if ($.inArray(format, parseFormats) === -1) {
			parseFormats.splice(0, 0, options.format);
		}
		options.parseFormats = parseFormats;
	}

	function preventDefault(e) {
		e.preventDefault();
	}

	var DateView = function (options) {
		var that = this, id;
		var popupWindow = $("body").find(".datepicker-widget-window");
		var div = $(DIV).attr(ARIA_HIDDEN, 'true').addClass('k-calendar-container');
		that.options = options = options || {};
		id = options.id;
		if (id) {
			id += '_dateview';
			div.attr(ID, id);
			that._dateViewID = id;
		}
		that.popup = new ui.Popup(div, extend(options.popup, options, {
			name: 'Popup',
			isRtl: kendo.support.isRtl(options.anchor)
		}));
		that.div = div;
		that.value(options.value);
		popupWindow.append($(that.popup.element[0]));
	};
	DateView.prototype = {
		_calendar: function () {
			var that = this;
			var calendarWidget = that.calendar;
			var options = that.options;
			var div;
			if (!calendarWidget) {
				div = $(DIV).attr(ID, kendo.guid()).appendTo(that.popup.element).on(MOUSEDOWN, preventDefault).on(CLICK, 'td:has(.k-link)', proxy(that._click, that));
				that.calendar = calendarWidget = new ui.Calendar(div);
				that._setOptions(options);
				kendo.calendar.makeUnselectable(calendarWidget.element);
				calendarWidget.navigate(that._value || that._current, options.start);
				that.value(that._value);
			}
		},
		_setOptions: function (options) {
			// console.log(options);
			this.calendar.setOptions({
				focusOnNav: false,
				change: options.change,
				culture: options.culture,
				dates: options.dates,
				depth: options.depth,
				footer: options.footer,
				format: options.format,
				max: options.max,
				min: options.min,
				month: options.month,
				weekNumber: options.weekNumber,
				start: options.start,
				disableDates: options.disableDates
			});
		},
		setOptions: function (options) {
			var old = this.options;
			var disableDates = options.disableDates;
			if (disableDates) {
				options.disableDates = calendar.disabled(disableDates);
			}
			this.options = extend(old, options, {
				change: old.change,
				close: old.close,
				open: old.open
			});
			if (this.calendar) {
				this._setOptions(this.options);
			}
		},
		destroy: function () {
			this.popup.destroy();
		},
		open: function (e) {
			// console.log("OPEN1", this);
			var that = this;
			that._calendar();
			that.options.open();
			// that.popup.open();
		},
		close: function (data) {
			//this.popup.close();
			var windowData = this.popup.element.closest('.datepicker-widget-window').data('kendoWindow');
			if (!windowData) windowData = data;
			windowData.close();
		},
		min: function (value) {
			this._option(MIN, value);
		},
		max: function (value) {
			this._option(MAX, value);
		},
		toggle: function (popupWindow) {
			var that = this;
			// that[that.popup.visible() ? CLOSE : OPEN]();
			if(popupWindow.data("kendoWindow").options.visible){
				popupWindow.find(".k-calendar-container").hide();
				that.close();
				popupWindow.data("kendoWindow").close();
				that.open();
			}else{
				that.open();
			}
		},
		move: function (e) {
			e.preventDefault();
			var that = this, key = e.keyCode, calendarWidget = that.calendar, selectIsClicked = e.ctrlKey && key == keys.DOWN || key == keys.ENTER, handled = false;
			if (e.altKey) {
				if (key == keys.DOWN) {
					that.open();
					e.preventDefault();
					handled = true;
				} else if (key == keys.UP) {
					that.close();
					e.preventDefault();
					handled = true;
				}
			} else if (that.popup.visible()) {
				if (key == keys.ESC || selectIsClicked && calendarWidget._cell.hasClass(SELECTED)) {
					that.close();
					e.preventDefault();
					return true;
				}
				that._current = calendarWidget._move(e);
				handled = true;
			}
			return handled;
		},
		current: function (date) {
			this._current = date;
			this.calendar._focus(date);
		},
		value: function (value) {
			var that = this, calendarWidget = that.calendar, options = that.options, disabledDate = options.disableDates;
			if (disabledDate && disabledDate(value)) {
				value = null;
			}
			that._value = value;
			that._current = new DATE(+restrictValue(value, options.min, options.max));
			if (calendarWidget) {
				calendarWidget.value(value);
			}
		},
		_click: function (e) {
      var popupWindowElem = this.popup.element.closest('.datepicker-widget-window');
      if (popupWindowElem) {
        popupWindowElem.data('closeable', false);
      }
			if (e.currentTarget.className.indexOf(SELECTED) !== -1) {
				// this.close();
			}
		},
		_option: function (option, value) {
			var that = this;
			var calendarWidget = that.calendar;
			that.options[option] = value;
			if (calendarWidget) {
				calendarWidget[option](value);
			}
		}
	};
	DateView.normalize = normalize;
	kendo.DateView = DateView;


	var widget = ui.DatePicker;
	//var selectedDate;
	var myElement;

	var MyWidget = widget.extend({
		options: {
			name: "CommonDatePicker",
			format: "yyyy-MM-dd",
			animation: false,
			footer: false,
			readonly: true,
			isStart: false,
			isEnd: false,
			value: new Date(),
			okCallBack: function(){},
			buttons: "<div class='popup-footer'>\n" +
						"<button data-event='ok' class='date'>OK</button>\n" +
					"</div>"
		},
		/**
		 *
		 *   위젯을 초기화하며 캘린더 팝업 및 내부 버튼 UI요소를 생성한다. - 최초 1번 실행
		 *
		 *   @function init
		 *	 @param {HTMLElement} element - 엘리먼트.
		 *	 @param {Object} options - 캘린더 위젯 초기 옵션 객체.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-date-picker
		 *
		 */
		init: function(element, options){
			var I18N = window.I18N;
			myElement = null;

			var that = this, disabled;
			this.selectedDate = null;


			Widget.fn.init.call(that, element, options);
			element = that.element;
			options = that.options;

			options.disableDates = kendo.calendar.disabled(options.disableDates);
			options.min = parse(element.attr('min')) || parse(options.min);
			options.max = parse(element.attr('max')) || parse(options.max);
			normalize(options);
			that._initialOptions = extend({}, options);
			that._wrapper();

			var popupWindow = $("body").find(".datepicker-widget-window");
			var div = popupWindow.find(".k-calendar-container");

			if(popupWindow.length > 0){ // 기존 것 사용
				this.popupWindow = popupWindow;
				this.popupWindow.data("targetElem", null);
			}else{ // 없으면 새로 생성
				// 팝업 윈도우 초기화
				this.popupWindow = $("<div/>").addClass("datepicker-widget-window").kendoWindow({
					title: "<span>" + I18N.prop("COMMON_DATE_PICKER") + "</span>",
					animation: false,
					resizable: false,
					draggable: false,
					width: "275px",
					height: "340px"
				});
				//this.popupWindow.closest(".k-window").addClass("popup-date-picker").attr("tabIndex", -1);
				this.popupWindow.closest(".k-window").addClass("popup-date-picker");
				this.popupWindow.closest(".k-window").find(".k-window-titlebar").append("<div class='embossBar'></div>");
				this.popupWindow.append(this.options.buttons);
				this.popupWindow.closest(".k-window").find(".k-window-titlebar").find("a[role=button]").hide();
				this.popupWindow.closest(".k-window").find(".k-window-titlebar").find(".k-window-actions")
					.append("<span class='ic ic-close'><span/>");

				$("body").on("click", function(e){
					var target = $(e.target);
					var popupWindowData = that.popupWindow.data("kendoWindow");
					var closeable = that.popupWindow.data("closeable");
					if(!(target.is("span.ic.ic-bt-input-calendar"))){
						if(popupWindowData.options.visible){
							if(target.closest(".popup-date-picker").length == 0){
								if(!(target.is(popupWindowData.wrapper)) && closeable) {
									popupWindowData.close();
								}else{
									that.popupWindow.data("closeable", true);
									return;
								}
							}
						}
					}
				});
				this.popupWindow.data("dateView", that.dateView);
			}

			that.dateView = new DateView(extend({}, options, {
				id: element.attr(ID),
				anchor: that.wrapper,
				change: function () {
					that.selectedDate = this.value();
				},
				close: function (e) {
					 if (that.trigger(CLOSE)) {
						 e.preventDefault();
					 } else {
						element.attr(ARIA_EXPANDED, false);
						div.attr(ARIA_HIDDEN, true);
					 }
				},
				open: function (e) {
					var thatOptions = that.options, date;
					if (that.trigger(OPEN)) {
						e.preventDefault();
					} else {
						var wrapper = that.popupWindow.data("targetElem").closest(".k-datepicker");
						var popupWindowWrapper = that.popupWindow.closest(".k-window");
						var divAnimationCont = popupWindowWrapper.find(".k-animation-container");

						if (that.element.val() !== that._oldText) {
							date = parse(that.popupWindow.data("targetElem").val(), thatOptions.parseFormats, thatOptions.culture);
							that.dateView[date ? 'current' : 'value'](date);
						}
						element.attr(ARIA_EXPANDED, true);
						div.attr(ARIA_HIDDEN, false);
						that._updateARIA(date);

						that.value(new Date(that.popupWindow.data("targetElem").val()));

						that.popupWindow.data("kendoWindow").open();
						popupWindowWrapper.css({
							top: wrapper.offset().top,
							left: wrapper.offset().left + wrapper.width() + 30
						});

						for(var i = 0; i < divAnimationCont.length; i++) {
							var container = divAnimationCont.eq(i);
							if(container.css("display") == "block") {
								container.css("display", "none");
							}
						}

						$(that.dateView.div[0]).closest(".k-animation-container").css({
							overflow: "visible",
							display: "block",
							position: "relative",
							top: 0,
							left: 0
						});
						$(that.dateView.div[0]).css({
							   display: "block",
							   transform: "none"
						});
					}
				}
			}));
			this.div = that.dateView.div;


			that._icon();

			that.element.closest(".k-datepicker").addClass("k-input").find("span.k-select").find("span")
				.removeClass("k-icon k-i-calendar")
				.addClass("ic ic-bt-input-calendar");

			that.element.keydown(function(evt){
				return false;
			});

			that.element.attr(READONLY, true);

			try {
				element[0].setAttribute('type', 'text');
			} catch (e) {
				element[0].type = 'text';
			}
			element.addClass('k-input').attr({
				role: 'combobox',
				'aria-expanded': false,
				'aria-owns': that.dateView._dateViewID
			});
			that._reset();
			that._template();
			disabled = element.is('[disabled]') || $(that.element).parents('fieldset').is(':disabled');
			if (disabled) {
				that.enable(false);
			} else {
				that.readonly(element.is('[readonly]'));
			}
			that._old = that._update(options.value || that.element.val());
			that._oldText = element.val();
			kendo.notify(that);
		},
		enable: function (enable) {
			if (typeof enable === 'undefined') enable = true;
			this._editable({
				readonly: true,
				// disable: !(enable = enable === undefined ? true : enable)
				disable: !(enable ? true : enable)
			});
		},
		// 캘린더 input 필드의 입력 가능상태를 정의한다.
		_editable: function (options) {
			var that = this, icon = that._dateIcon.off(ns), element = that.element.off(ns), wrapper = that._inputWrapper.off(ns), readonly = options.readonly, disable = options.disable;
			if (!readonly && !disable) { // 입력 가능하지 않은 경우
				wrapper.addClass(DEFAULT).removeClass(STATEDISABLED).on(HOVEREVENTS, that._toggleHover);
				element.removeAttr(DISABLED).removeAttr(READONLY).attr(ARIA_DISABLED, false).on('keydown' + ns, proxy(that._keydown, that)).on('focusout' + ns, proxy(that._blur, that)).on('focus' + ns, function () {
					that._inputWrapper.addClass(FOCUSED);
				});
				icon.on(CLICK, proxy(that._click, that)).on(MOUSEDOWN, preventDefault);
			} else {
				wrapper.addClass(disable ? STATEDISABLED : DEFAULT).removeClass(disable ? DEFAULT : STATEDISABLED);
				element.attr(DISABLED, disable).attr(READONLY, readonly).attr(ARIA_DISABLED, disable);
				if (!disable) {
					icon.on(CLICK, proxy(that._click, that)).on(MOUSEDOWN, preventDefault);
				}
			}
		},
		/**
		 *
		 *   캘린더 아이콘 클릭 시 호출되며 캘린더 팝업을 오픈한다.
		 *
		 *   @function _click
		 *	 @param {Event} e - 이벤트 객체.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-date-picker
		 *
		 */
		_click: function (e) {
			var I18N = window.I18N;
			var target = $(e.target);
			var that = this;

			myElement = target.closest(".k-picker-wrap").find("input[data-role=commondatepicker]");
			this.popupWindow.data("targetElem", myElement);
			this.popupWindow.data("targetDateView", myElement.data("kendoCommonDatePicker").dateView);
			this.dateView = this.popupWindow.data("targetDateView");

			this.popupWindow.closest(".k-window").on("click", ".k-window-titlebar .k-window-actions", function(){
				that.dateView.close(that.popupWindow.data("kendoWindow"));
				that.dateView.popup.close();
				that.popupWindow.data("kendoWindow").close();
			});

			this.popupWindow.on("mousedown", ".popup-footer button[data-event=ok]", function (event) {
				event.preventDefault();
			});
			this.popupWindow.off("click", ".popup-footer button[data-event=ok]");
			this.popupWindow.on("click", ".popup-footer button[data-event=ok]", function(evt){
				var resultDate;
				if(typeof that.selectedDate == "undefined"){
					resultDate = that.value();
				}else{
					resultDate = that.selectedDate;
				}

				if(that.options.isStart){
					resultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate(), 0, 0, 0);
				}else if(that.options.isEnd){
					resultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate(), 23, 59, 59);
				}
				that._change(resultDate);
				myElement.data("kendoCommonDatePicker")._callback();
				that.dateView.close();
				that.dateView.popup.close();
				that.popupWindow.data("kendoWindow").close();
			});
			this.popupWindow.find(".popup-footer button[data-event=ok]").text(I18N.prop("COMMON_BTN_OK"));
			that.dateView.toggle(this.popupWindow);
			that._initDate()
		},
		_initDate: function () {
			var currentDate = this.getDate()
			this.setDate(currentDate);
		},
		/**
		 *
		 *   캘린더 팝업에서 선택한 날짜로 입력칸의 날짜를 갱신한다.
		 *
		 *   @function _update
		 *	 @param {String} value - 선택한 날짜값.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-date-picker
		 *
		 */
		_update: function (value) {
			var that = this, options = that.options, min = options.min, max = options.max, current = that._value, date = parse(value, options.parseFormats, options.culture), isSameType = date === null && current === null || date instanceof Date && current instanceof Date, formattedValue;
			var elem = that.element;
			// if(myElement){
			// 	elem = myElement;
			// }else{
			// 	selectedDate = value;
			// 	elem = that.element;
			// }

			if (options.disableDates(date)) {
				date = null;
				if (!that._old && !that.element.val()) {
					value = null;
				}
			}
			if (+date === +current && isSameType) {
				formattedValue = kendo.toString(date, options.format, options.culture);
				if (formattedValue !== value) {
					elem.val(date === null ? value : formattedValue);
				}
				return date;
			}
			if (date !== null && isEqualDatePart(date, min)) {
				date = restrictValue(date, min, max);
			} else if (!isInRange(date, min, max)) {
				date = null;
			}
			that._value = date;
			that.selectedDate = date;
			that.dateView.value(date);
			elem.val(kendo.toString(date || value, options.format, options.culture));
			that._updateARIA(date);

			return date;
		},
		/**
		 *
		 *   기존의 선택된 날짜를 현재 선택된 날짜로 갱신한다.
		 *
		 *   @function _change
		 *	 @param {String} value - 선택한 날짜값.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-date-picker
		 *
		 */
		_change: function (value) {
			var that = this, oldValue = that.element.val(), dateChanged;

			value = that._update(value);
			dateChanged = !kendo.calendar.isEqualDate(that._old, value);

			var valueUpdated = dateChanged && !that._typing;
			var textFormatted = oldValue !== that.element.val();
			if (valueUpdated || textFormatted) {
				that.element.trigger(CHANGE);
			}
			if (dateChanged) {
				that._old = value;
				that._oldText = that.element.val();
				that.trigger(CHANGE);
			}
			that._typing = false;
		},
		/**
		 *
		 *   날짜 선택 버튼 이후 발생하는 callback 함수를 호출한다.
		 *
		 *   @function _callback
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-date-picker
		 *
		 */
		_callback: function(){
			var that = this;
			that.options.okCallBack();
		},
		/**
		 *
		 *   임의의 날짜를 위젯에 적용한다.
		 *
		 *   @param {String} date - 임의의 날짜 문자열
		 *   @function setDate
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-date-picker
		 *
		 */
		setDate: function(date){
			var that = this;
			that._change(date);
		},
		/**
		 *
		 *   위젯의 현재 날짜 문자열 값을 리턴한다.
		 *
		 *   @function getDate
		 *   @returns {String} - 날짜 문자열 리턴
		 *   @alias module:common-date-picker
		 *
		 */
		getDate: function(){
			var that = this;
			var thisDate = that.value();
			if(that.options.isStart){
				thisDate = new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 0, 0, 0);
			}else if(that.options.isEnd){
				thisDate = new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 23, 59, 59);
			}
			var result = that.convertDateFormatForURL(thisDate);
			return result;
		},
		/**
		 *
		 *   날짜 문자열을 특정 포맷을 적용하여 리턴한다.
		 *
		 *   @param {String} date - 포맷을 적용할 날짜 문자열
		 *   @function convertDateFormat
		 *   @returns {String} - 날짜 문자열 리턴
		 *   @alias module:common-date-picker
		 *
		 */
		convertDateFormat: function(date){
			var result = moment(date).format("L").replace(/\./g, "-");
			return result;
		},
		/**
		 *
		 *   날짜 문자열을 URL 파라메터로 사용하기 위한 특정 포맷을 적용하여 리턴한다.
		 *
		 *   @param {String} date - 포맷을 적용할 날짜 문자열
		 *   @function convertDateFormatForURL
		 *   @returns {String} - 날짜 문자열 리턴
		 *   @alias module:common-date-picker
		 *
		 */
		convertDateFormatForURL: function(date){
			var result = moment(date).format("YYYY-MM-DDTHH:mm:ss");
			result = result + "+09:00";
			return result;
		},
		destroy: function(){
			// console.log("Destroy!");
			// 부모함수 호출
			kendo.ui.DatePicker.fn.destroy.call(this);
		}
	});

	ui.plugin(MyWidget);
})(jQuery);
