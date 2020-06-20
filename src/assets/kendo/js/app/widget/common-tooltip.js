/*
	Class 지정 가능한 공용 Tooltip
*/
(function(window){
	var kendo = window.kendo;
	var Tooltip = kendo.ui.Tooltip;
	var isPlainObject = $.isPlainObject, isFunction = kendo.isFunction, CONTENTLOAD = 'contentLoad', REQUESTSTART = 'requestStart', KCONTENTFRAME = 'k-content-frame',
		IFRAMETEMPLATE = kendo.template('<iframe frameborder=\'0\' class=\'' + KCONTENTFRAME + '\' ' + 'src=\'#= content.url #\'>' + 'This page requires frames in order to show content' + '</iframe>'),
		NS = '.kendoTooltip', isLocalUrl = kendo.isLocalUrl, DOCUMENT = $(document), DESCRIBEDBY = 'aria-describedby';

	function restoreTitleAttributeForElement(element) {
		var title = element.data(kendo.ns + 'title');
		if (title) {
			element.attr('title', title);
			element.removeData(kendo.ns + 'title');
		}
	}

	function restoreTitle(element) {
		while (element.length) {
			restoreTitleAttributeForElement(element);
			element = element.parent();
		}
	}

	var extendTooltip = kendo.ui.Tooltip = Tooltip.extend({
		options: {
			wrapperCssClass : "common-tooltip-wrapper",	//최상위 wrapper
			cssClass : "common-tooltip"	 //툴팁
		},
		init : function(element, options){
			var self = this;
			Tooltip.fn.init.call(self, element, options);
		},
		_initPopup : function(){
			var self = this, options = self.options;
			Tooltip.fn._initPopup.call(self);
			self.popup.element.addClass(options.cssClass);
			self._addedWrapperClass = self._addWrapperClass.bind(this);
			self.popup.bind("activate", self._addedWrapperClass);
		},
		_addWrapperClass : function(e){
			var self = this, options = self.options;
			self.popup.wrapper.addClass(options.wrapperCssClass);
			self.popup.unbind("activate", self._addedWrapperClass);
		},
		_show: function (target) {
			var that = this, current = that.target(), validContent = "";
			if (!that.popup) {
				that._initPopup();
			}
			if (current && current[0] != target[0]) {
				that.popup.close();
				that.popup.element.kendoStop(true, true);
			}
			if (!current || current[0] != target[0]) {
				//content의 리턴 값이 null일 경우 툴팁 표시하지 않음.
				validContent = that._appendContent(target);
				that.popup.options.anchor = target;
			}
			that.popup.one('deactivate', function () {
				restoreTitle(target);
				target.removeAttr(DESCRIBEDBY);
				this.element.removeAttr('id').attr('aria-hidden', true);
				DOCUMENT.off('keydown' + NS, that._documentKeyDownHandler);
			});
			if(validContent !== null) that.popup.open();
		},
		_appendContent: function (target) {
			var that = this, contentOptions = that.options.content, element = that.content, showIframe = that.options.iframe, iframe;
			if (isPlainObject(contentOptions) && contentOptions.url) {
				if (!('iframe' in that.options)) {
					showIframe = !isLocalUrl(contentOptions.url);
				}
				that.trigger(REQUESTSTART, {
					options: contentOptions,
					target: target
				});
				if (!showIframe) {
					element.empty();
					kendo.ui.progress(element, true);
					that._ajaxRequest(contentOptions);
				} else {
					element.hide();
					iframe = element.find('.' + KCONTENTFRAME)[0];
					if (iframe) {
						iframe.src = contentOptions.url || iframe.src;
					} else {
						element.html(IFRAMETEMPLATE({ content: contentOptions }));
					}
					element.find('.' + KCONTENTFRAME).off('load' + NS).on('load' + NS, function () {
						that.trigger(CONTENTLOAD);
						element.show();
					});
				}
			} else if (contentOptions && isFunction(contentOptions)) {
				contentOptions = contentOptions({
					sender: this,
					target: target
				});
				if(contentOptions === null) return contentOptions;
				element.html(contentOptions || '');
			} else {
				element.html(contentOptions);
			}
			that.angular('compile', function () {
				return { elements: element };
			});
		}
	});
	kendo.ui.plugin(extendTooltip);
})(window, jQuery);