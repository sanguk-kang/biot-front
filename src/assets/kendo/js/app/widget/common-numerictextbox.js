(function(window, $){
	var kendo = window.kendo, ui = kendo.ui, NULL = null;
	var NumericTextBox = ui.NumericTextBox;

	var extendNumericTextBox = ui.NumericTextBox = NumericTextBox.extend({
		options : {},
		_adjust: function (value) {
			var that = this, options = that.options, min = options.min, max = options.max;
			if (value === NULL) {
				return value;
			}

			if (min !== NULL && value < min) {
				value = min;
			} else if (max !== NULL && value > max) {
				value = max;
			}

			that._downArrow.removeClass("disabled");
			that._upArrow.removeClass("disabled");
			if(min !== NULL && value <= min) that._downArrow.addClass("disabled");
			if(max !== NULL && value >= max) that._upArrow.addClass("disabled");

			return value;
		}
	});

	kendo.ui.plugin(extendNumericTextBox);

})(window, jQuery);