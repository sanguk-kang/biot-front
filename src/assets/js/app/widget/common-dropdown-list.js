/**
*
*   <ul>
*       <li>공용 DropDownList UI Component</li>
*       <li>Kendo UI의 DropDownList Widget을 상속받아 추가 구현되었다.</li>
*       <li>데이터가 없을 경우 표시되는 다국어 텍스트를 설정한다.</li>
*       <li>에니메이션 효과 Off를 기본 옵션으로 변경 한다.</li>
*   </ul>
*   @module app/widget/common-dropdown-list
*   @requires lib/kendo.all
*
*/
(function(window, $){
	var kendo = window.kendo;
	var STATE_ACCEPT = 'accept';
	var ui = kendo.ui;
	var DropDownList = ui.DropDownList;
	var ObservableObject = kendo.data.ObservableObject;
	var ns = '.kendoDropDownList', DISABLED = 'disabled', READONLY = 'readonly', DEFAULT = 'k-state-default',
		STATEDISABLED = 'k-state-disabled', ARIA_DISABLED = 'aria-disabled',
		HOVEREVENTS = 'mouseenter' + ns + ' mouseleave' + ns, TABINDEX = 'tabindex', proxy = $.proxy;
	var extendDropDownList = ui.DropDownList = DropDownList.extend({
		options : {
			popupClass : null,
			animation : false,
			hasKeyDownEvent : false,
			hasKeyPressEvent : false
		},
		init: function (element, options) {
			if(options && !options.noDataTemplate){
				var I18N = window.I18N;
				options.noDataTemplate = I18N.prop("COMMON_NO_CONTENT_LIST");
			}

			DropDownList.fn.init.call(this, element, options);
		},
		_popupOpen: function () {
			var popup = this.popup;
			popup.wrapper = kendo.wrap(popup.element);
			var popupClass = this.options.popupClass;
			if(popupClass){
				popup.wrapper.addClass(popupClass);
			}
			if (popup.element.closest('.km-root')[0]) {
				popup.wrapper.addClass('km-popup km-widget');
				this.wrapper.addClass('km-widget');
			}
		},
		text: function (text) {
			var that = this;
			var loweredText;
			var ignoreCase = that.options.ignoreCase;
			text = text === null ? '' : text;
			if (typeof text !== "undefined") {
				if (typeof text !== 'string') {
					that._textAccessor(text);
					return;
				}
				loweredText = ignoreCase ? text.toLowerCase() : text;
				that._select(function (data) {
					data = that._text(data);
					if (ignoreCase) {
						data = (data + '').toLowerCase();
					}
					return data === loweredText;
				}).done(function () {
					that._textAccessor(that.dataItem() || text);
				});
			} else {
				return that._textAccessor();
			}
		},
		_textAccessor: function (text) {
			var dataItem = null;
			var template = this.valueTemplate;
			var optionLabelText = this._optionLabelText();
			var span = this.span;
			if (typeof text === "undefined") {
				return span.text();
			}
			if ($.isPlainObject(text) || text instanceof ObservableObject) {
				dataItem = text;
			} else if (optionLabelText && optionLabelText === text) {
				dataItem = this.options.optionLabel;
			}
			if (!dataItem) {
				dataItem = this._assignInstance(text, this._accessor());
			}
			if (this.hasOptionLabel()) {
				if (dataItem === optionLabelText || this._text(dataItem) === optionLabelText) {
					template = this.optionLabelTemplate;
					if (typeof this.options.optionLabel === 'string' && !this.options.optionLabelTemplate) {
						dataItem = optionLabelText;
					}
				}
			}
			var getElements = function () {
				return {
					elements: span.get(),
					data: [{ dataItem: dataItem }]
				};
			};
			this.angular('cleanup', getElements);
			try {
				span.html(template(dataItem));
			} catch (e) {
				span.html('');
			}
			this.angular('compile', getElements);
		},
		open: function (offset) {	//e.g : offset = { top : 0, left : 0 };
			var that = this;
			if (that.popup.visible()) {
				return;
			}
			if (!that.listView.bound() || that._state === STATE_ACCEPT) {
				that._open = true;
				that._state = 'rebind';
				if (that.filterInput) {
					that.filterInput.val('');
					that._prev = '';
				}
				if (that.filterInput && that.options.minLength !== 1) {
					that.refresh();
					that.popup.one('activate', that._focusInputHandler);
					that.popup.open();
					if(offset) that.popup.wrapper.offset(offset);
					that._resizeFilterInput();
				} else {
					that._filterSource();
				}
			} else if (that._allowOpening()) {
				that.popup.one('activate', that._focusInputHandler);
				that.popup.open();
				if(offset) that.popup.wrapper.offset(offset);
				that._resizeFilterInput();
				that._focusItem();
			}
		},
		_editable: function (options) {
	        var that = this;
	        var element = that.element;
	        var disable = options.disable;
	        var readonly = options.readonly;
	        var wrapper = that.wrapper.add(that.filterInput).off(ns);
	        var dropDownWrapper = that._inputWrapper.off(HOVEREVENTS);
	        if (!readonly && !disable) {
	            element.removeAttr(DISABLED).removeAttr(READONLY);
	            dropDownWrapper.addClass(DEFAULT).removeClass(STATEDISABLED).on(HOVEREVENTS, that._toggleHover);
	            wrapper.attr(TABINDEX, wrapper.data(TABINDEX)).attr(ARIA_DISABLED, false).on('focusin' + ns, proxy(that._focusinHandler, that)).on('focusout' + ns, proxy(that._focusoutHandler, that)).on('mousedown' + ns, proxy(that._wrapperMousedown, that)).on('paste' + ns, proxy(that._filterPaste, that));

				if(that.options.hasKeyDownEvent) wrapper.on('keydown' + ns, proxy(that._keydown, that));

	            that.wrapper.on('click' + ns, proxy(that._wrapperClick, that));
	            if (!that.filterInput && that.options.hasKeyPressEvent) {
	                wrapper.on('keypress' + ns, proxy(that._keypress, that));
	            }
	        } else if (disable) {
	            wrapper.removeAttr(TABINDEX);
	            dropDownWrapper.addClass(STATEDISABLED).removeClass(DEFAULT);
	        } else {
	            dropDownWrapper.addClass(DEFAULT).removeClass(STATEDISABLED);
	            wrapper.on('focusin' + ns, proxy(that._focusinHandler, that)).on('focusout' + ns, proxy(that._focusoutHandler, that));
	        }
	        element.attr(DISABLED, disable).attr(READONLY, readonly);
	        wrapper.attr(ARIA_DISABLED, disable);
	    }
	});

	kendo.ui.plugin(extendDropDownList);
})(window, jQuery);