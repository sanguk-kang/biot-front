(function(window, $){
	var kendo = window.kendo, ui = kendo.ui, support = kendo.support;
	var Popup = ui.Popup;

	var styles = [
	   'font-size',
	   'font-family',
	   'font-stretch',
	   'font-style',
	   'font-weight',
	   'line-height'
	];
	var OPEN = 'open', CLOSE = 'close', DEACTIVATE = 'deactivate', ACTIVATE = 'activate', CENTER = 'center', LEFT = 'left', RIGHT = 'right', TOP = 'top', BOTTOM = 'bottom', ABSOLUTE = 'absolute', HIDDEN = 'hidden', BODY = 'body', LOCATION = 'location', POSITION = 'position', VISIBLE = 'visible', EFFECTS = 'effects', ACTIVE = 'k-state-active', ACTIVEBORDER = 'k-state-border', ACTIVEBORDERREGEXP = /k-state-border-(\w+)/, ACTIVECHILDREN = '.k-picker-wrap, .k-dropdown-wrap, .k-link', MOUSEDOWN = 'down', DOCUMENT_ELEMENT = $(document.documentElement), WINDOW = $(window), SCROLL = 'scroll', cssPrefix = support.transitions.css, TRANSFORM = cssPrefix + 'transform', extend = $.extend, NS = '.kendoPopup';

	var extendPopup = ui.Popup = Popup.extend({
		options : {},
		open: function (x, y) {
	        var that = this, fixed = {
	                isFixed: !isNaN(parseInt(y, 10)),
	                x: x,
	                y: y
	            }, element = that.element, options = that.options, animation, wrapper, anchor = $(options.anchor), mobile = element[0] && element.hasClass('km-widget');
	        if (!that.visible()) {
	            if (options.copyAnchorStyles) {
	                if (mobile && styles[0] == 'font-size') {
	                    styles.shift();
	                }
	                element.css(kendo.getComputedStyles(anchor[0], styles));
	            }
	            if (element.data('animating') || that._trigger(OPEN)) {
	                return;
	            }
	            that._activated = false;
	            if (!options.modal) {
	                DOCUMENT_ELEMENT.unbind(that.downEvent, that._mousedownProxy).bind(that.downEvent, that._mousedownProxy);
	                that._toggleResize(false);
	                that._toggleResize(true);
	            }
	            that.wrapper = wrapper = kendo.wrap(element, options.autosize).css({
	                overflow: HIDDEN,
	                display: 'block',
	                position: ABSOLUTE
	            });
	            if (support.mobileOS.android) {
	                wrapper.css(TRANSFORM, 'translatez(0)');
	            }
	            wrapper.css(POSITION);
	            if ($(options.appendTo)[0] == document.body) {
	                wrapper.css(TOP, '-10000px');
	            }
	            that.flipped = that._position(fixed);

				if(that.flipped) wrapper.addClass("flipped");
				else wrapper.removeClass("flipped");

	            animation = that._openAnimation();
	            if (options.anchor != BODY) {
	                that._showDirClass(animation);
	            }
	            element.data(EFFECTS, animation.effects).kendoStop(true).kendoAnimate(animation);
	        }
	    }
	});

	kendo.ui.plugin(extendPopup);

})(window, jQuery);