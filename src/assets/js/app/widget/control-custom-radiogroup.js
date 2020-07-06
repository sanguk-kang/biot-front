/**
*
*   <ul>
*       <li>제어 패널에서 쓰이는 Group 버튼 UI Component</li>
*       <li>Object Array로 선택 상태, 활성화/바활성화 상태 등을 유지한다.</li>
*       <li>값을 설정할 시, 해당 버튼에 대해 활성화하고 다른 버튼은 비활성화한다.</li>
*   </ul>
*   @module app/widget/control-custom-radiogroup
*   @requires lib/kendo.all
*
*/
(function ($, kendo) {
	"use strict";
	var NS = ".CustomRadioButtonGroup";

	var CustomRadioButtonGroup = kendo.ui.Widget.extend({

		options: {

			dataSource: null,
			id: "",
			value: "",
			groupName: "",
			icon: null,
			text: "",
			index: -1,
			name: "CustomRadioButtonGroup",
			orientation: "horizontal",
			oriEnables : [],
			checkedValue: ""
		},

		events: [
				 "change",
				 "dataBound"
				 ],

				 dataSource: null,
				 init: function (element, options) {

					 kendo.ui.Widget.fn.init.call(this, element, options);

					 this._dataSource();

					 // Read the data from the data source.
					 this.dataSource.fetch();

					 this.element.on("click" + NS, ".c-radio-label", { sender: this }, this._onRadioButtonSelected);
				 },

				 destroy: function () {
					 $(this.element).off(NS);
					 kendo.ui.Widget.fn.destroy.call(this);
				 },

				 _dataSource: function () {

					 var dataSource = this.options.dataSource;

					 // If the data source is an array, then define an object and set the array to the data attribute.
					 dataSource = $.isArray(dataSource) ? { data: dataSource } : dataSource;

					 if (this.dataSource && this._refreshHandler) {
						 this.dataSource.unbind("change", this._refreshHandler);
					 } else {
						 this._refreshHandler = $.proxy(this.refresh, this);
					 }

					 this.dataSource = kendo.data.DataSource.create(dataSource).bind("change", this._refreshHandler);
				 },

				 _template: function () {
					 var options = this.options;

					 var html;

					 if(options.icon && options.icon.length)
						 html = kendo.format("<div class='buttonbound' data-bind='invisible: {0} #:{1}#' style='width : #: {5} #%' > <div class='background' data-uid='#: uid #'> " +
							 "<input id='#: {1} #' type='radio' name='{0}' value='#: {2} #' class='c-radio' disabled/>" +
							 "<div class='colorbox c-radio-label' data-value='#: {2} #'><label class='icon #: {3} #' for ='{1}'></label></div></div>" +
							 "<p>#:{4}#</p></div>",
									 options.groupName,
									 options.id, options.value,
									 options.icon, options.text, this.iconWidth);
					 else
						 html = kendo.format("<div class='buttonbound' data-bind='invisible: {0} #:{1}#' > <div class='background' data-uid='#: uid #'> " +
								 "<input id='#: {1} #' type='radio' name='{0}' value='#: {2} #' class='c-radio' disabled/>" +
								 "<button class='colorbox c-radio-label' data-value='#: {2} #'>#:{3}#</button></div></div>",
										 options.groupName,
										 options.id, options.value,
										 options.text);

					 return kendo.template(html);
				 },

				 _onRadioButtonSelected: function (e) {

					 var $target = $(this),
					 that = e.data.sender;

					 if($target.prev(".c-radio")[0].disabled){
						 return;
					 }

					 that.element.find(".c-radio").prop("checked", false);
					 $target.prev(".c-radio").prop("checked", true);

					 var dataItem = that.dataItem();
					 if(that.oldDataItem !== dataItem && e.originalEvent){
						 that.trigger("change", { dataItem: dataItem });
					 }
					 that.oldDataItem = dataItem;
					 that.options.checkedValue = dataItem.value;
				 },

				 setDataSource: function (dataSource) {
					 this.options.dataSource = dataSource;
					 this._dataSource();
					 this.dataSource.fetch();
				 },

				 refresh: function (e) {
					 var length = e.items.length;
					 this.iconWidth = 100 / length;

					 var template = this._template();

					 // init
					 this.element.empty();
					 this.element.append("<div class='buttonset'><div class='buttonrow'></div></div");

					 var wrapper = this.element.find(".buttonrow");
					 for (var i = 0; i < length; i++) {
						 wrapper.append(template(e.items[i]));
					 }

					 this.trigger("dataBound");
				 },

				 clear: function (){
					 this.oldDataItem = void 0;
					 this.element.find(kendo.format("input[name='{0}']", this.options.groupName)).attr("checked", false);
				 },

				 dataItem: function () {
					 var uid = this.element.find(".c-radio:checked").closest(".background").attr("data-uid");
					 return this.dataSource.getByUid(uid);
				 },

				 enable: function(){
					 if (arguments.length === 2) {
						 if(!arguments[1]){
							 this.element.find(kendo.format("input[id='{0}']", arguments[0])).attr("checked", false);
						 }
						 this.element.find(kendo.format(".c-radio[id='{0}']", arguments[0])).attr("disabled", !arguments[1]);
					 }else if (arguments.length === 1){
						 if(!arguments[0]) this.clear();
						 this.element.find(".c-radio").prop("disabled", !arguments[0]);
					 }
				 },
				 id: function(){
					 var options = this.options;
					 if (arguments.length === 1){

						 return options.groupName + options.dataSource[arguments[0]].id;
					 }
				 },

				 oriEnable: function(){
					 if (arguments.length === 2) {
						 this.options.oriEnables[arguments[0]] = arguments[1];
					 }else if (arguments.length === 1){
						 return this.options.oriEnables[arguments[0]];
					 }else{
						 this.options.oriEnables = [];
					 }
				 },

				 count: function(){
					 return this.options.dataSource.length;
				 },

				 text: function () {
					 if (arguments.length === 0) {
						 return this.element.find(".c-radio:checked").attr("data-text");
					 }
					 this.element.find(kendo.format(".c-radio-label[data-text='{0}']", arguments[0])).click();
				 },
				 value: function () {
					 if (arguments.length === 0) {
						 return this.element.find(".c-radio:checked").attr("value");
					 }
					 this.options.checkedValue = arguments[0];
					 this.element.find(kendo.format(".c-radio-label[data-value='{0}']", arguments[0])).click();

				 },
				 index: function(){

				 }
	});
	kendo.ui.plugin(CustomRadioButtonGroup);
})(window.kendo.jQuery, window.kendo);