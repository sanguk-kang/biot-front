/**
*
*   <ul>
*       <li>공용 Toast Popup</li>
*       <li>"body"에 Append 된다.</li>
*       <li>인스턴스를 생성하여 관리될 수 있도록 한다.</li>
*   </ul>
*   @module app/widget/common-toast-popup
*   @requires lib/kendo.all
*
*/
(function(window, $){
	"use strict";

	var kendo = window.kendo, ui = kendo.ui, extend = $.extend;
	var Notification = ui.Notification;

	var NORMAL = 'normal', SHOW = 'show', KNOTIFICATION = 'k-notification', NS = '.kendoNotification', KICLOSE = '.k-notification-wrap .k-i-close', KHIDING = 'k-hiding';
	var WRAPPER = '<div class="k-widget k-notification common-toast-popup"></div>';
	var widget = Notification.extend({
		options: {
			name: 'CommonToastPopup',
			position: {
				pinned: false,
				bottom: 50
			},
			templates: [{
				type: "normal",
				template: "<span class='content'>#=content#</span>"
			}],
			autoHideAfter: 3000,
			target: 'body',
			copyAnchorStyles: false,
			hideBeforeShow: true
		},
		_showPopup: function (wrapper, options) {
			var that = this, target = $(options.target), copyAnchorStyles = options.copyAnchorStyles, autoHideAfter = options.autoHideAfter, x = options.position.left, y = options.position.top, popup, openPopup;
			openPopup = $('.' + that._guid + ':not(.' + KHIDING + ')').last();
			popup = new kendo.ui.Popup(wrapper, {
				anchor: openPopup[0] ? openPopup : document.body,
				copyAnchorStyles: copyAnchorStyles,
				appendTo: target,
				origin: that._popupOrigin,
				position: that._popupPosition,
				animation: options.animation,
				modal: true,
				collision: '',
				isRtl: that._isRtl,
				close: function () {
					that._triggerHide(this.element);
				},
				deactivate: function (e) {
					e.sender.element.off(NS);
					e.sender.element.find(KICLOSE).off(NS);
					e.sender.destroy();
				}
			});
			that._attachPopupEvents(options, popup);
			if (x === null) {
				// toast popup을 화면의 중앙으로
				x = (target.width() - wrapper.innerWidth()) / 2;
			}
			if (openPopup[0]) {
				if (y === null) {
					y = openPopup[0].offsetTop - wrapper.innerHeight();
				}
				popup.open(x, y);
			} else {
				if (y === null) {
					y = target.height() - wrapper.innerHeight() - options.position.bottom;
				}
				popup.open(x, y);
			}
			popup.wrapper.addClass(that._guid).css(extend({
				margin: 0,
				zIndex: 10050
			}, that._popupPaddings));
			if (options.position.pinned) {
				popup.wrapper.css('position', 'fixed');
				if (openPopup[0]) {
					that._togglePin(popup.wrapper, true);
				}
			} else if (!openPopup[0]) {
				that._togglePin(popup.wrapper, false);
			}
			if (autoHideAfter > 0) {
				setTimeout(function () {
					that._hidePopup(popup);
				}, autoHideAfter);
			}
		},
		show: function (content, type, safe) {
			var that = this, options = that.options, wrapper = $(WRAPPER), args, defaultArgs;
			if (options.hideBeforeShow) {
				that.hide();
			}
			if (!type) {
				type = NORMAL;
			}
			if (content !== null && content !== void (0) && content !== '') {
				if (kendo.isFunction(content)) {
					content = content();
				}
				defaultArgs = {
					typeIcon: type,
					content: ''
				};
				if ($.isPlainObject(content)) {
					args = extend(defaultArgs, content);
				} else {
					args = extend(defaultArgs, { content: content });
				}
				wrapper.addClass(KNOTIFICATION + '-' + type).toggleClass(KNOTIFICATION + '-button', options.button).attr('data-role', 'alert').css({
					width: options.width,
					height: options.height
				}).append(that._getCompiled(type, safe)(args));
				that.angular('compile', function () {
					return {
						elements: wrapper,
						data: [{ dataItem: args }]
					};
				});
				if ($(options.appendTo)[0]) {
					that._showStatic(wrapper, options);
				} else {
					that._showPopup(wrapper, options);
				}
				that.trigger(SHOW, { element: wrapper });
			}
			return that;
		}
	});

	ui.plugin(widget);

})(window, jQuery);
