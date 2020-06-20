/**
*
*   <ul>
*       <li>제어 패널에서 쓰이는 온도 제어 Spinner UI Component</li>
*       <li>현재 공통 설정에 따라 0.5도 또는 1도 씩 제어 가능하게한다.</li>
*       <li>현재 공통 설정에 따라 온도 단위를 표시한다.</li>
*       <li>GUI 요구 사항을 반영하고, 단위 기능에서 재사용 가능하게한다.</li>
*       <li>Kendo UI NumericTextBox를 상속받아 추가 구현되었다.</li>
*   </ul>
*   @module app/widget/control-custom-numericbox
*   @requires lib/kendo.all
*
*/
(function(window, $){

	var kendo = window.kendo;
	var numericTextBox = kendo.ui.NumericTextBox;

	var  ARROW_DOWN = "k-i-arrow-60-down",
		ARROW_UP = "k-i-arrow-60-up",
		SELECTED = "k-state-selected",
		STATEDISABLED = "k-state-disabled";

	var customNumericBox = numericTextBox.extend({
		options: {
			name : "CustomNumericBox",
			format: "#.0",
			index : -1,
			step: 1,
			viewModel : null,
			placeholder: "-",
			enable : false,
			oriEnable : false,
			oriValue : "",
			blockKeyEvent : true,
			numericTitle : null,
			unit : "℃",
			showValueWhenDisabled: false,
			downArrowText: '',
			upArrowText: ''
		},
		init : function(element, options){
			//content
			var self = this;
			numericTextBox.fn.init.call(self, element, options);

			var wrapper = self.wrapper;
			var selfElement = self.element;
			var wrap = wrapper.find(".k-numeric-wrap");
			var parent = wrap.parent();
			parent.addClass("control-numeric-bound");

			var title = selfElement.attr("title");

			if(options.numericTitle)
				title = options.numericTitle;
			else
				options.numericTitle = title;

			if(title)
				parent.append("<span class='control-numeric-name'>" + title + "</span>");

			parent.append("<span class='control-numeric-unit'>" + options.unit + "</span>");

			if(this.options.blockKeyEvent){
				//온도 제어에서 쓰인다.
				self.element.on("focus", function(e){
					$(this).blur();
					return false;
				});
				self.element.addClass("block-key-event");
				self.element.off("focusout.kendoNumericTextBox");
			}else{
				//Point 및 상수 입력 등
				//한글 입력 방지
				var isNegative = self.options.min < 0 ? true : false;
				var regExp;
				if(isNegative){
					regExp = /^[0-9]+$/;
				}else{
					regExp = /^[0-9-]+$/;
				}

				var initValue = 0;
				if(self.options.decimals){
					if(isNegative){
						regExp = /^[0-9.-]+$/;
					}else{
						regExp = /^[0-9.]+$/;
					}
					initValue = kendo.toString(0, "n" + self.options.decimals);
				}

				var value = self.value();

				self.beforeValue = (value !== null && typeof value !== "undefined") ? value : initValue;

				self.element.on("keyup", function(e){
					var elementValue = self.element.val();
					if(elementValue != "" && !elementValue.match(regExp)){
						var beforeValue = self.beforeValue;
						self.element.val(beforeValue);
						//self.element.val(self.value());
						self.element.blur();
						/*var msg = window.I18N.prop("COMMON_INVALID_CHARACTER")
						var dialog = $("<div/>").kendoCommonDialog({
							isCustomActions : true,
							actions : [{
								text : window.I18N.prop("COMMON_BTN_OK"),
								action : function(e){
									e.sender.close();
									e.sender.destroy();
									e.sender.element.remove();
								}
							}]
						}).data("kendoCommonDialog");
						dialog.message(msg);
						dialog.open();*/
					}
				});
				self.element.on("change", function(e){
					self.beforeValue = self.element.val();
				});
			}
		},
		_spin: function(step, timeout) {
			var self = this;
			if(self.element.prop("disabled")){
				return;
			}
			var old = self.value();
			numericTextBox.fn._spin.call(self, step, timeout);
			var value = self.value();
			if(value === old){
				return;
			}

			var btnUp = self._upArrow;
			var btnDown = self._downArrow;

			if(value > old){
				if(value == self.max()){
					self._setUpbind(btnUp, false);
				}
				if(btnDown.hasClass(STATEDISABLED)){
					self._setDownbind(btnDown, true);
				}
			}else if(value < old){
				if(value == self.min()){
					self._setDownbind(btnDown, false);
				}
				if(btnUp.hasClass(STATEDISABLED)){
					self._setUpbind(btnUp, true);
				}
			}

			self._focusout();
			self.trigger("change");
			self.options.oriValue = value;
		},
		_setUpbind: function(view, isBind) {
			var self = this;
			self._upArrowEventHandler.unbind("press");
			if(isBind){
				view.removeClass(STATEDISABLED);
				self._upArrowEventHandler.bind("press", function(e) {
					e.preventDefault();
					self._spin(1);
					self._upArrow.addClass(SELECTED);
				});
			}else{
				view.addClass(STATEDISABLED);
			}
		},
		_setDownbind : function(view, isBind){
			var self = this;
			self._downArrowEventHandler.unbind("press");
			if(isBind){
				view.removeClass(STATEDISABLED);
				self._downArrowEventHandler.bind("press", function(e) {
					e.preventDefault();
					self._spin(-1);
					self._downArrow.addClass(SELECTED);
				});
			}else{
				view.addClass(STATEDISABLED);
			}
		},
		_arrows: function() {
			var self = this;
			var wrapper = self.wrapper;

			numericTextBox.fn._arrows.call(self);
			var btnDown = wrapper.find("." + ARROW_DOWN);
			if(btnDown.length > 0){
				btnDown.removeClass(ARROW_DOWN);
				btnDown.addClass("c-i-arrow-60 down");
			}

			var btnUp = wrapper.find("." + ARROW_UP);
			if(btnUp.length > 0){
				btnUp.removeClass(ARROW_UP);
				btnUp.addClass("c-i-arrow-60 up");
			}
		},
		_input: function() {
			var self = this;
			var wrapper = self.wrapper;

			numericTextBox.fn._input.call(self);
			var select = wrapper.find(".k-select");
			if(select.length > 0){
				select.addClass("control-custom-box");
			}
		},

		_wrapper: function() {

			var self = this;
			numericTextBox.fn._wrapper.call(self);

			var wrapper = self.wrapper;
			var elm = wrapper.find(".k-numeric-wrap");
			elm.addClass("control-custom-wrap");

		},
		//		_getFahrenheit : function(celsius){
		//	        var value = celsius * 1.8 + 32;
		//	        value = value.toFixed(1);
		//	        return value;
		//	    },
		//	    _getCelsius : function(fahrenheit){
		//	        var value = (fahrenheit - 32) / 1.8;
		//	        value = value.toFixed(1);
		//	        return value;
		//	    },
		min: function(value) {
			var self = this;

			//	    	if(value){
			//	    		if(self.options.unit === "℉") value = self._getFahrenheit(value);
			//	    	}

			return numericTextBox.fn.min.call(self, value);
		},

		max: function(value) {
			var self = this;
			//        	if(value){
			//        		if(self.options.unit === "℉") value = self._getFahrenheit(value);
			//	    	}

			return numericTextBox.fn.max.call(self, value);
		},
		value : function(value){
			var self = this;

			if(value){
				//				if(self.options.unit === "℉") value = self._getFahrenheit(value);
				var btnUp = self._upArrow;
				var btnDown = self._downArrow;

				self._setUpbind(btnUp, true);
				self._setDownbind(btnDown, true);

				if(value >= self.max()){
					self._setUpbind(btnUp, false);
					value = self.max();
				}else if(value <= self.min()){
					self._setDownbind(btnDown, false);
					value = self.min();
				}
				self.options.oriValue = value;

				if(!self.options.showValueWhenDisabled) {
					if(!self.options.enable){
						value = "";
					}
				}
			}
			return numericTextBox.fn.value.call(self, value);
		},
		enable : function(enable){
			var self = this;
			numericTextBox.fn.enable.call(self, enable);

			self.options.enable = enable;
			if(enable){
				self.value(self.options.oriValue);
			}else if(!self.options.showValueWhenDisabled) {
				self.value("");
			}
		},
		oriEnable : function(enable){
			if (typeof enable === "undefined"){
				return this.options.oriEnable;
			}
			this.options.oriEnable = enable;
		},
		destroy : function(){
			numericTextBox.fn.destroy.call(this);
		}
	});

	kendo.ui.plugin(customNumericBox);
})(window, jQuery);