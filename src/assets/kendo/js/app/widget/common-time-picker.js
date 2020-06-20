/**
 *
 *   <ul>
 *       <li>시간 입력 칸의 아이콘을 클릭하여 시간 선택 팝업창을 사용할 수 있다.</li>
 *       <li>시간 선택 팝업창에서 시간을 선택하여 입력 칸에 반영할 수 있다.</li>
 *       <li>Kendo UI의 TimePicker 위젯을 상속받아 커스터마이징</li>
 *   </ul>
 *   @module app/widget/common-time-picker
 *   @requires app/main
 */
(function($){
	var kendo = window.kendo, keys = kendo.keys, parse = kendo.parseDate, extractFormat = kendo._extractFormat, support = kendo.support, browser = support.browser, ui = kendo.ui, Widget = ui.Widget, OPEN = 'open', CLOSE = 'close', ns = '.kendoTimePicker', MS_PER_MINUTE = 60000, MS_PER_DAY = 86400000, DEFAULT = 'k-state-default', DISABLED = 'disabled', READONLY = 'readonly', ARIA_DISABLED = 'aria-disabled', SELECTED = 'k-state-selected', ARIA_SELECTED = 'aria-selected', ARIA_EXPANDED = 'aria-expanded', ARIA_HIDDEN = 'aria-hidden', ARIA_ACTIVEDESCENDANT = 'aria-activedescendant', FOCUSED = 'k-state-focused', CLICK = 'click' + ns, STATEDISABLED = 'k-state-disabled', HOVEREVENTS = 'mouseenter' + ns + ' mouseleave' + ns, MOUSEDOWN = 'mousedown' + ns, ID = 'id', isArray = $.isArray, extend = $.extend, proxy = $.proxy, DATE = Date, TODAY = new DATE();
	TODAY = new DATE(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 0, 0, 0);

	function preventDefault(e) {
		e.preventDefault();
	}

	var TimeView = function (options) {
		var that = this, id = options.id;
		var popupWindow = $("body").find(".timepicker-widget-window");
		var timeDisplayType = window.GlobalSettings.getTimeDisplay();
		var I18N = window.I18N;
		var SETTINGS_TIME_AM = I18N.prop("SETTINGS_TIME_AM");
		var SETTINGS_TIME_PM = I18N.prop("SETTINGS_TIME_PM");

		that.options = options;
		that._dates = [];
		that.popupWindow = popupWindow;

		if(timeDisplayType == "24Hour"){
			that.hourData = [ "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
						 "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23" ];
		}else if(timeDisplayType == "12Hour"){
			that.hourData = [ "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"];
			that.ampmData = [SETTINGS_TIME_AM, SETTINGS_TIME_PM];
		}

		that.minuteData = [];
		for(var i = 0; i < 60; i++){
			var min;
			if(i < 10){ min = "0" + i; }else{ min = "" + i;}
			that.minuteData.push(min);
		}

		that.ampmElem = $("<input class='amapm'/>");
		that.hourElem = $("<input class='hour'/>");
		that.minuteElem = $("<input class='minute'/>");
		that.ul = $("<div class='timepicker-container'></div>");
		that.list = that.ul.append(that.ampmElem).append(that.hourElem).append(" : ").append(that.minuteElem);
		/*
		that.ul = $('<ul tabindex="-1" role="listbox" aria-hidden="true" unselectable="on" class="k-list k-reset"/>').css({ overflow: support.kineticScrollNeeded ? '' : 'auto' }).on(CLICK, LI, proxy(that._click, that)).on('mouseenter' + ns, LI, function () {
			$(this).addClass(HOVER);
		}).on('mouseleave' + ns, LI, function () {
			$(this).removeClass(HOVER);
		});

		that.list = $('<div class=\'k-list-container k-list-scroller\' unselectable=\'on\'/>').append(that.ul).on(MOUSEDOWN, preventDefault);
		*/


		if (id) {
			that._timeViewID = id + '_timeview';
			that._optionID = id + '_option_selected';
			that.ul.attr(ID, that._timeViewID);
		}

		that._popup(popupWindow);

		that._heightHandler = proxy(that._height, that);

		that.template = kendo.template('<li tabindex="-1" role="option" class="k-item" unselectable="on">#=data#</li>', { useWithBlock: false });
	 };

	 TimeView.prototype = {
		current: function (candidate) {
			var that = this, active = that.options.active;
			if (typeof candidate !== "undefined") {
				if (that._current) {
					that._current.removeClass(SELECTED).removeAttr(ARIA_SELECTED).removeAttr(ID);
				}
				if (candidate) {
					candidate = $(candidate).addClass(SELECTED).attr(ID, that._optionID).attr(ARIA_SELECTED, true);
					that.scroll(candidate[0]);
				}
				that._current = candidate;
				if (active) {
					active(candidate);
				}
			} else {
				return that._current;
			}
		},
		close: function () {
			//			this.popup.close();
		},
		destroy: function () {
			var that = this;
			that.ul.off(ns);
			that.list.off(ns);
			that.popup.destroy();
		},
		open: function () {
			var that = this;
			if (!that.ul[0].firstChild) {
				that.bind();
			}
			that.popup.open();
			if (that._current) {
				that.scroll(that._current[0]);
			}
		},
		dataBind: function (dates) {
			var that = this, options = that.options, format = options.format, toString = kendo.toString, template = that.template, length = dates.length, idx = 0, date, html = '';
			for (; idx < length; idx++) {
				date = dates[idx];
				if (isInRange(date, options.min, options.max)) {
					html += template(toString(date, format, options.culture));
				}
			}
			that._html(html);
		},
		refresh: function () {
			var that = this, options = that.options, format = options.format, offset = dst(), ignoreDST = offset < 0, min = options.min, max = options.max, msMin = getMilliseconds(min), msMax = getMilliseconds(max), msInterval = options.interval * MS_PER_MINUTE, toString = kendo.toString, template = that.template, start = new DATE(+min), startDay = start.getDate(), msStart, lastIdx, idx = 0, length, html = '';
			if (ignoreDST) {
				length = (MS_PER_DAY + offset * MS_PER_MINUTE) / msInterval;
			} else {
				length = MS_PER_DAY / msInterval;
			}
			if (msMin != msMax) {
				if (msMin > msMax) {
					msMax += MS_PER_DAY;
				}
				length = (msMax - msMin) / msInterval + 1;
			}
			lastIdx = parseInt(length, 10);
			for (; idx < length; idx++) {
				if (idx) {
					setTime(start, msInterval, ignoreDST);
				}
				if (msMax && lastIdx == idx) {
					msStart = getMilliseconds(start);
					if (startDay < start.getDate()) {
						msStart += MS_PER_DAY;
					}
					if (msStart > msMax) {
						start = new DATE(+max);
					}
				}
				that._dates.push(getMilliseconds(start));
				html += template(toString(start, format, options.culture));
			}
			that._html(html);
		},
		bind: function () {
			var that = this, dates = that.options.dates;
			if (dates && dates[0]) {
				that.dataBind(dates);
			} else {
				that.refresh();
			}
		},
		_html: function (html) {
			var that = this;
			that.ul[0].innerHTML = html;
			that.popup.unbind(OPEN, that._heightHandler);
			that.popup.one(OPEN, that._heightHandler);
			that.current(null);
			that.select(that._value);
		},
		scroll: function (item) {
			if (!item) {
				return;
			}
			var content = this.list[0], itemOffsetTop = item.offsetTop, itemOffsetHeight = item.offsetHeight, contentScrollTop = content.scrollTop, contentOffsetHeight = content.clientHeight, bottomDistance = itemOffsetTop + itemOffsetHeight;
			if (contentScrollTop > itemOffsetTop) {
				contentScrollTop = itemOffsetTop;
			} else if (bottomDistance > contentScrollTop + contentOffsetHeight) {
				contentScrollTop = bottomDistance - contentOffsetHeight;
			}
			content.scrollTop = contentScrollTop;
		},
		select: function (li) {
			var that = this, options = that.options, current = that._current, selection;
			if (li instanceof Date) {
				li = kendo.toString(li, options.format, options.culture);
			}
			if (typeof li === 'string') {
				if (!current || current.text() !== li) {
					li = $.grep(that.ul[0].childNodes, function (node) {
						return (node.textContent || node.innerText) == li;
					});
					li = li[0] ? li : null;
				} else {
					li = current;
				}
			}
			selection = that._distinctSelection(li);
			that.current(selection);
		},
		_distinctSelection: function (selection) {
			var that = this, currentValue, selectionIndex;
			if (selection && selection.length > 1) {
				currentValue = getMilliseconds(that._value);
				selectionIndex = $.inArray(currentValue, that._dates);
				selection = that.ul.children()[selectionIndex];
			}
			return selection;
		},
		setOptions: function (options) {
			var old = this.options;
			options.min = parse(options.min);
			options.max = parse(options.max);
			this.options = extend(old, options, {
				active: old.active,
				change: old.change,
				close: old.close,
				open: old.open
			});
			this.bind();
		},
		toggle: function (popupWindow) {
			var that = this;
			 if(popupWindow.data("kendoWindow").options.visible){
				popupWindow.find(".k-animation-container").hide();
				that.close();
				that.open();
			}else{
				that.open();
			}
		},
		value: function (value) {
			var that = this;
			that._value = value;
			if (that.ul[0].firstChild) {
				that.select(value);
			}
		},
		_click: function (e) {
			var that = this, li = $(e.currentTarget), date = li.text(), dates = that.options.dates;
			if (dates && dates.length > 0) {
				date = dates[li.index()];
			}
			if (!e.isDefaultPrevented()) {
				that.select(li);
				that.options.change(date, true);
				that.close();
			}
		},
		_height: function () {
			var that = this;
			var list = that.list;
			var parent = list.parent('.k-animation-container');
			var height = that.options.height;
			if (that.ul[0].children.length) {
				list.add(parent).show().height(that.ul[0].scrollHeight > height ? height : 'auto').hide();
			}
		},
		_parse: function (value) {
			var that = this, options = that.options, current = that._value || TODAY;
			if (value instanceof DATE) {
				return value;
			}
			value = parse(value, options.parseFormats, options.culture);
			if (value) {
				value = new DATE(current.getFullYear(), current.getMonth(), current.getDate(), value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
			}
			return value;
		},
		_adjustListWidth: function () {
			var list = this.list, width = list[0].style.width, wrapper = this.options.anchor, computedStyle, computedWidth, outerWidth = kendo._outerWidth;
			if (!list.data('width') && width) {
				return;
			}
			computedStyle = window.getComputedStyle ? window.getComputedStyle(wrapper[0], null) : 0;
			computedWidth = computedStyle ? parseFloat(computedStyle.width) : outerWidth(wrapper);
			if (computedStyle && (browser.mozilla || browser.msie)) {
				computedWidth += parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight) + parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
			}
			width = computedWidth - (outerWidth(list) - list.width());
			list.css({
				fontFamily: wrapper.css('font-family'),
				width: width
			}).data('width', width);
		},
		_popup: function (popupWindow) {
			var that = this, list = that.list, options = that.options, anchor = options.anchor;
			that.popup = new ui.Popup(list, extend(options.popup, {
				anchor: anchor,
				open: options.open,
				close: options.close,
				animation: options.animation,
				isRtl: support.isRtl(options.anchor)
			}));
			popupWindow.append(that.popup.element);
		},
		move: function (e) {
			var that = this, key = e.keyCode, ul = that.ul[0], current = that._current, down = key === keys.DOWN;
			if (key === keys.UP || down) {
				if (e.altKey) {
					that.toggle(down);
					return;
				} else if (down) {
					current = current ? current[0].nextSibling : ul.firstChild;
				} else {
					current = current ? current[0].previousSibling : ul.lastChild;
				}
				if (current) {
					that.select(current);
				}
				that.options.change(that._current.text());
				e.preventDefault();
			} else if (key === keys.ENTER || key === keys.TAB || key === keys.ESC) {
				e.preventDefault();
				if (current) {
					that.options.change(current.text(), true);
				}
				that.close();
			}
		}
	};
	function setTime(date, time, ignoreDST) {
		var offset = date.getTimezoneOffset(), offsetDiff;
		date.setTime(date.getTime() + time);
		if (!ignoreDST) {
			offsetDiff = date.getTimezoneOffset() - offset;
			date.setTime(date.getTime() + offsetDiff * MS_PER_MINUTE);
		}
	}
	function dst() {
		var today = new DATE(), midnight = new DATE(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0), noon = new DATE(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
		return -1 * (midnight.getTimezoneOffset() - noon.getTimezoneOffset());
	}
	function getMilliseconds(date) {
		return date.getHours() * 60 * MS_PER_MINUTE + date.getMinutes() * MS_PER_MINUTE + date.getSeconds() * 1000 + date.getMilliseconds();
	}
	function isInRange(value, min, max) {
		var msMin = getMilliseconds(min), msMax = getMilliseconds(max), msValue;
		if (!value || msMin == msMax) {
			return true;
		}
		msValue = getMilliseconds(value);
		if (msMin > msValue) {
			msValue += MS_PER_DAY;
		}
		if (msMax < msMin) {
			msMax += MS_PER_DAY;
		}
		return msValue >= msMin && msValue <= msMax;
	}
	function normalize(options) {
		var parseFormats = options.parseFormats;
		options.format = extractFormat(options.format || kendo.getCulture(options.culture).calendars.standard.patterns.t);
		parseFormats = isArray(parseFormats) ? parseFormats : [parseFormats];
		parseFormats.splice(0, 0, options.format);
		options.parseFormats = parseFormats;
	}

	TimeView.getMilliseconds = getMilliseconds;
	kendo.TimeView = TimeView;

	var widget = ui.TimePicker;
	var myElement;

	var MyWidget = widget.extend({
		options: {
			name: "CommonTimePicker",
			format: "HH:mm",
			value: new Date(),
			readonly: true,
			animation: false,
			addTwentyFour: false,
			buttons: "<div class='popup-footer'>\n" +
						"<button data-event='ok' class='time'>Ok</button>\n" +
						"<button data-event='cancel' class='time'>Cancel</button>\n" +
					"</div>"
		},
		/**
		 *
		 *   위젯을 초기화하며 TimePicker 팝업 및 내부 버튼 UI요소를 생성한다. - 최초 1번 실행
		 *
		 *   @function init
		 *   @param {HTMLElement} element - 엘리먼트.
		 *	 @param {Object} options - 위젯 초기 옵션 객체.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-time-picker
		 *
		 */
		init: function(element, options){
			var I18N = window.I18N;
			myElement = null;
			var timeDisplayType = window.GlobalSettings.getTimeDisplay();
			var that = this, timeView, disabled;

			Widget.fn.init.call(that, element, options);
			element = that.element;
			options = that.options;
			options.min = parse(element.attr('min')) || parse(options.min);
			options.max = parse(element.attr('max')) || parse(options.max);
			normalize(options);
			that._initialOptions = extend({}, options);
			that._wrapper();

			var popupWindow = $("body").find(".timepicker-widget-window");
			var ul = popupWindow.find(".timepicker-container");
			that.element.closest('.k-widget').addClass('common-time-picker');

			if(popupWindow.length > 0){ // 기존 것 사용
				this.popupWindow = popupWindow;
				that.timeView = this.popupWindow.data("timeView");
				timeView = that.timeView;
				this.popupWindow.data("targetElem", null);
			}else{ // 없으면 새로 생성
				// 팝업 윈도우 초기화
				this.popupWindow = $("<div/>").addClass("timepicker-widget-window").kendoWindow({
					title: "<span>" + I18N.prop("COMMON_TIME_PICKER") + "</span>",
					animation: false,
					resizable: false,
					draggable: false,
					width: "500px",
					height: "200px",
					close: popupWindowClose
				});

				this.popupWindow.append(this.options.buttons);
				this.popupWindow.closest(".k-window").addClass("popup-time-picker");
				this.popupWindow.closest(".k-window").find(".k-window-titlebar").append("<div class='embossBar'></div>");
				this.popupWindow.closest(".k-window").find(".k-window-titlebar").find("a[role=button]").hide();
				this.popupWindow.closest(".k-window").find(".k-window-titlebar").find(".k-window-actions")
					.append("<span class='ic ic-close'><span/>");

				//this.ul = ul;
				this.popupWindow.data("timeView", that.timeView);

				$("body").on("click", function(e){
					var target = $(e.target);
					var popupWindowData = that.popupWindow.data("kendoWindow");
					if(!(target.is("span.ic-bt-input-clock"))){
						if(popupWindowData.options.visible){
							if(target.closest(".popup-time-picker").length == 0){
								if(!(target.is(popupWindowData.wrapper))){
									popupWindowData.close();
								}else{
									return;
								}
							}
						}
					}
				});
			}

			function popupWindowClose(){
				that.timeView.close();
				that.timeView.popup.close();
			}

			that.timeView = new TimeView(extend({}, options, {
				id: element.attr(ID),
				anchor: that.wrapper,
				format: options.format,
				change: function (value, trigger) {
					if (trigger) {
						that._change(value);
					} else {
						element.val(value);
					}
				},
				open: function (e) {
					that.timeView._adjustListWidth();
					if (that.trigger(OPEN)) {
						e.preventDefault();
					} else {
						element.attr(ARIA_EXPANDED, true);
						ul.attr(ARIA_HIDDEN, false);
					}
				},
				close: function (e) {
					if (that.trigger(CLOSE)) {
						e.preventDefault();
					} else {
						element.attr(ARIA_EXPANDED, false);
						e.preventDefault();
						ul.attr(ARIA_HIDDEN, true);
					}
				},
				active: function (current) {
					element.removeAttr(ARIA_ACTIVEDESCENDANT);
					if (current) {
						element.attr(ARIA_ACTIVEDESCENDANT, timeView._optionID);
					}
				}
			}));
			timeView = that.timeView;
			this.ul = that.timeView.ul;

			if(that.options.addTwentyFour) {
				timeView.hourData.push(24);
			}

			// DropDownList 초기화
			timeView.hourElem.kendoDropDownList({
				dataSource: timeView.hourData,
				value: that.timeView.hourData[that.timeView.options.value.getHours()],
				height: 100
			});
			timeView.minuteElem.kendoDropDownList({
				dataSource: timeView.minuteData,
				value: that.timeView.minuteData[that.timeView.options.value.getMinutes()],
				height: 100
			});
			if(timeDisplayType == "24Hour"){
				that.options.format = "HH:mm";
				timeView.ampmElem.hide();
			}else if(timeDisplayType == "12Hour"){
				that.options.format = "tt hh:mm";
				timeView.ampmElem.show();
				timeView.ampmElem.kendoDropDownList({
					dataSource: that.timeView.ampmData
				});

				timeView.hourElem.data("kendoDropDownList").wrapper.css({width:"120px"});
				timeView.minuteElem.data("kendoDropDownList").wrapper.css({width:"120px"});
				timeView.ampmElem.data("kendoDropDownList").wrapper.css({width:"100px", "margin-right":"10px"});
			}

			that.element.closest(".k-timepicker").addClass("k-input");
			that.element.keydown(function(evt){
				return false;
			});

			that._icon();
			that.element.attr('readonly', true);

			that.element.closest(".k-timepicker").find("span.k-select").find("span")
				.removeClass("k-icon k-i-clock")
				.addClass("ic ic-bt-input-clock");

			that._reset();
			try {
				element[0].setAttribute('type', 'text');
			} catch (e) {
				element[0].type = 'text';
			}
			element.addClass('k-input').attr({
				'role': 'combobox',
				'aria-expanded': false,
				'aria-owns': timeView._timeViewID
			});
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
		_editable: function (options) {
			var that = this, disable = options.disable, readonly = options.readonly, arrow = that._arrow.off(ns), element = that.element.off(ns), wrapper = that._inputWrapper.off(ns);
			if (!readonly && !disable) {
				wrapper.addClass(DEFAULT).removeClass(STATEDISABLED).on(HOVEREVENTS, that._toggleHover);
				element.removeAttr(DISABLED).removeAttr(READONLY).attr(ARIA_DISABLED, false).on('keydown' + ns, proxy(that._keydown, that)).on('focusout' + ns, proxy(that._blur, that)).on('focus' + ns, function () {
					that._inputWrapper.addClass(FOCUSED);
				});
				arrow.on(CLICK, proxy(that._click, that)).on(MOUSEDOWN, preventDefault);
			} else {
				wrapper.addClass(disable ? STATEDISABLED : DEFAULT).removeClass(disable ? DEFAULT : STATEDISABLED);
				element.attr(DISABLED, disable).attr(READONLY, readonly).attr(ARIA_DISABLED, disable);
				if (!disable) {
					arrow.on(CLICK, proxy(that._click, that)).on(MOUSEDOWN, preventDefault);
				}
			}
		},
		enable: function (enable) {
			if (typeof enable === 'undefined') enable = true;
			this._editable({
				readonly: true,
				disable: !(enable ? true : enable)
			});
		},
		/**
		 *
		 *   입력칸 아이콘의 클릭 이벤트 발생 시 호출되며 시간 선택 팝업창을 오픈한다.
		 *
		 *   @param {Object} e - 클릭 이벤트 객체
		 *   @function _click
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-time-picker
		 *
		 */
		_click: function (e) {
			var I18N = window.I18N;
			var SETTINGS_TIME_PM = I18N.prop("SETTINGS_TIME_PM");
			var that = this;
			var timeDisplayType = window.GlobalSettings.getTimeDisplay();
			var target = $(e.target);
			var h,m, ampm;
			var hData = that.timeView.hourData;
			var mData = that.timeView.minuteData;
			var popupWindowWrapper = that.popupWindow.closest(".k-window");
			var wrapper;

			myElement = target.closest(".k-picker-wrap").find("input[data-role=commontimepicker]");
			that.popupWindow.data("targetElem", myElement);
			wrapper = that.popupWindow.data("targetElem").closest(".k-timepicker");

			h = myElement.data("kendoCommonTimePicker").value().getHours();
			m = myElement.data("kendoCommonTimePicker").value().getMinutes();

			if(timeDisplayType == "12Hour"){
				h = myElement.data("kendoCommonTimePicker").value().getHours();
				if(h >= 12) h = h % 12;
				ampm = that._getAmPm(myElement.data("kendoCommonTimePicker").value());
				if(that.timeView.ampmElem.data("kendoDropDownList")){
					that.timeView.ampmElem.data("kendoDropDownList").value(ampm);
				}
			}

			that.timeView.hourElem.data("kendoDropDownList").value(hData[h]);
			that.timeView.minuteElem.data("kendoDropDownList").value(mData[m]);

			this.popupWindow.closest(".k-window").off("click", ".k-window-titlebar .k-window-actions");
			this.popupWindow.off("click", ".popup-footer button[data-event=ok]");
			this.popupWindow.off("click", ".popup-footer button[data-event=cancel]");

			this.popupWindow.closest(".k-window").on("click", ".k-window-titlebar .k-window-actions", function(){
				popupWindowClose();
				that.popupWindow.data("kendoWindow").close();
			});
			this.popupWindow.on("click", ".popup-footer button[data-event=ok]", function(evt){
				var thatTimeDisplayType = window.GlobalSettings.getTimeDisplay();
				var result;
				var d = new Date();
				//var targetElem = that.popupWindow.data("targetElem").data("kendoCommonTimePicker");
				var targetElem = that.element.data("kendoCommonTimePicker");
				// 입력값 추출

				h = that.timeView.hourElem.data("kendoDropDownList").value();
				m = that.timeView.minuteElem.data("kendoDropDownList").value();

				if(thatTimeDisplayType == "24Hour"){
					result = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
				}else if(thatTimeDisplayType == "12Hour"){
					ampm = that.timeView.ampmElem.data("kendoDropDownList").value();

					if(ampm == SETTINGS_TIME_PM){
						h = h * 1 + 12;
					}
					result = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
				}

				// 입력값 적용
				targetElem.value(result);
				targetElem.trigger("change");

				// 창 닫힘
				popupWindowClose();
				that.popupWindow.data('kendoWindow').close();
			});
			this.popupWindow.on("click", ".popup-footer button[data-event=cancel]", function(evt){
				// 창 닫힘
				popupWindowClose();
				that.popupWindow.data('kendoWindow').close();
			});

			this.popupWindow.find("button[data-event=ok]").text(I18N.prop("COMMON_BTN_OK"));
			this.popupWindow.find("button[data-event=cancel]").text(I18N.prop("COMMON_BTN_CANCEL"));
			that.popupWindow.data("kendoWindow").open();


			if($("body").height() < wrapper.offset().top + wrapper.height() + popupWindowWrapper.height()
			   && $("body").width() < popupWindowWrapper.offset().left + popupWindowWrapper.width()) {
				popupWindowWrapper.css({
					top: wrapper.offset().top - popupWindowWrapper.height() - wrapper.height() - 35,
					left: wrapper.offset().left + wrapper.width() - popupWindowWrapper.width()
				});
			} else if($("body").height() < wrapper.offset().top + wrapper.height() + popupWindowWrapper.height()){
				popupWindowWrapper.css({
					top: wrapper.offset().top - popupWindowWrapper.height() - wrapper.height() - 35,
					left: wrapper.offset().left
				});
			} else if($("body").width() < wrapper.offset().left + popupWindowWrapper.width()) {
				popupWindowWrapper.css({
					top: wrapper.offset().top + wrapper.height() + 15,
					left: wrapper.offset().left + wrapper.width() - popupWindowWrapper.width() + 20
				});
			} else {
				popupWindowWrapper.css({
					top: wrapper.offset().top + wrapper.height() + 15,
					left: wrapper.offset().left
				});
			}

			that.timeView.toggle(this.popupWindow);
			//            if (!support.touch && element[0] !== activeElement()) {
			//                element.focus();
			//            }

			function popupWindowClose(){
				that.timeView.close();
				that.timeView.popup.close();
			}
		},
		/**
		 *
		 *   선택된 시간 값으로 현재 시간을 갱신한다.
		 *
		 *   @param {String} value - 시간값 문자열
		 *   @function _update
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-time-picker
		 *
		 */
		_update: function (value) {
			var that = this, options = that.options, timeView = that.timeView, date = timeView._parse(value);
			var elem = that.element;
			//            if(myElement){
			//                elem = myElement;
			//            }else{
			//                elem = that.element;
			//            }
			if (!isInRange(date, options.min, options.max)) {
				date = null;
			}
			that._value = date;
			elem.val(kendo.toString(date || value, options.format, options.culture));
			timeView.value(date);
			return date;
		},
		/**
		 *
		 *   선택된 시간에 대해 AM 또는 PM을 계산하여 리턴한다.
		 *
		 *   @param {String} time - 시간값 문자열
		 *   @function _getAmPm
		 *   @returns {String} - 현재 값이 속한 시간대 문자열
		 *   @alias module:common-time-picker
		 *
		 */
		_getAmPm: function(time){
			var I18N = window.I18N;
			var SETTINGS_TIME_AM = I18N.prop("SETTINGS_TIME_AM");
			var SETTINGS_TIME_PM = I18N.prop("SETTINGS_TIME_PM");
			var ampm, h;
			h = time.getHours();

			if(h <= 11 && h >= 0){
				ampm = SETTINGS_TIME_AM;
			}else if(h >= 12 && h <= 23){
				ampm = SETTINGS_TIME_PM;
				if(h > 12){
					h = h - 12;
				}
			}
			return ampm;
		},
		showInvalidMesage: function(msg){
			var self = this,
				wrapper = self.wrapper,
				nextElem = wrapper.next();
			var invalidMsgTmpl = '<span class="k-widget k-tooltip k-tooltip-validation k-invalid-msg common-time-picker-invalid-msg" data-for="" role="alert">' + msg + '</span>';

			wrapper.addClass('k-invalid');

			if(msg) {
				if (nextElem.hasClass('common-time-picker-invalid-msg')){//이미 메시지가 있는 경우
					nextElem.remove();
				}
				wrapper.after($(invalidMsgTmpl));
			}
		},
		hideMessage: function(){
			var self = this,
				wrapper = self.wrapper,
				nextElem = wrapper.next();

			wrapper.removeClass('k-invalid');
			if(nextElem.hasClass('common-time-picker-invalid-msg')){
				wrapper.next().remove();
			}
		},
		destroy: function(){
			// 부모함수 호출
			kendo.ui.TimePicker.fn.destroy.call(this);
		}
	});

	ui.plugin(MyWidget);
})(jQuery);
