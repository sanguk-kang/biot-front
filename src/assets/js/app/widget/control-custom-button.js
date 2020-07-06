(function ($, kendo) {
	"use strict";

	var CustomControlButton = kendo.ui.Button.extend({
		options: {
			name: "CustomControlButton",
			oriEnable : false,
			index : -1,
			isCheckMode : true,
			isChangeText : true
		},

		events: [
				 "change"
				 ],

				 _click: function(e) {
					 var self = this;
					 kendo.ui.Button.fn._click.call(self);
					 var state;
					 var isSelected;

					 if(self.options.isCheckMode){
						 isSelected = self.select();
						 if(isSelected) state = "On";
						 else state = "Off";
					 }

					 self.trigger("change", { state : state, isSelected : isSelected});
				 },
				 select : function(state){
					 var self = this;
					 var wrapper = self.wrapper;

					 //state가 안들어오는 경우는 사용자가 버튼을 클릭했을때이므로 값을 반대로 적용해줘야 꺼진다.
					 if(!state){
						 if(wrapper.hasClass("selected")) state = "OFF";
						 else state = "ON";
					 }
					 //state = state.toUpperCase();
					 var isSelected;

					 if(state === "ON"){

						 if(self.options.isCheckMode) wrapper.addClass("selected");
						 isSelected = true;
					 }else{
						 wrapper.removeClass("selected");
						 isSelected = false;
					 }
					 var child = wrapper.children()[0];

					 if(self.options.isChangeText){
						 if(child && child.nodeName === "SPAN") child.innerHTML = "<i class='icon power'></i>" + state;
						 else wrapper.text(state);
					 }


					 return isSelected;
				 },
				 enable: function(enable) {
					 var self = this;
					 if(typeof enable === "undefined") self.select("ON/OFF");
					 else if(!enable){
						 self.wrapper.removeClass("selected");
					 }
					 kendo.ui.Button.fn.enable.call(self, enable);
				 },
				 isSelected : function(){
					 var self = this;
					 var wrapper = self.wrapper;

					 if(wrapper.hasClass("selected")) return true;
					 return false;
				 },
				 oriEnable : function(enable){
					 if (typeof enable === "undefined"){
						 return this.options.oriEnable;
					 }
					 this.options.oriEnable = enable;
				 },
				 destroy : function(){
					 kendo.ui.Button.fn.destroy.call(this);
				 }

	});
	kendo.ui.plugin(CustomControlButton);
})(window.kendo.jQuery, window.kendo);