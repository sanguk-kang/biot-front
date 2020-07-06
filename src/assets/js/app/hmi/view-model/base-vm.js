define("hmi/view-model/base-vm", [], function(){

	var kendo = window.kendo;
	var I18N = window.I18N;

	var extendConfig = function(config, childConfig){
		if(!config) config = {};
		if(!childConfig) childConfig = {};
		return $.extend(true, {}, config, childConfig);
	};

	var ButtonConfig = {
		type : "button",
		id : "",
		name : "",
		disabled : false,
		invisible : false,
		text : "",
		color : "#000",
		dropDownList : null,
		click : function(){},
		setState : function(){}
	};

	var ToolbarButtonConfig = extendConfig(ButtonConfig, {
		type : "toolbar-button",
		title : "",
		cssClass : "",
		template : "",
		hasVerticalLine : false
	});

	var DropDownListConfig = {
		type : "dropdownlist",
		id : "",
		name : "",
		title : "",
		invisible : false,
		disabled : false,
		template : null,
		dataTextField : "name",
		dataValueField : "id",
		popupClass : "",
		optionLabel : "",
		dataSource : [],
		value : "",
		select : function(){},
		close : function(){},
		open : function(){},
		hasVerticalLine : false
	};

	var ValidatorConfig = {
		type : "validator",
		id : "",
		name : "",
		invisible : false,
		disabled : false,
		value : "",
		placeholder : "",
		validatorOptions : {
			type : "",
			required : false
		}
	};

	var BaseViewModelClass = kendo.Class.extend({
		viewModel : {
			filters : [],
			actions : []
		},
		options : {
			type : "monitoring"
		},
		_isFullScreen : false,
		init : function(element, options){
			this.element = $(element);
			this.options = $.extend(true, {}, this.options, options);
			this.viewModel = kendo.observable(this.viewModel);
			this._tabCanvasInfo = {};
			kendo.bind(element, this.viewModel);
			this.initTab();
			this.element.css('position', 'relative');
			this.attachEvent();
			this.attachTabEvent();
		},
		initTab : function(){
			var options = this.options;
			var type = options.type;
			var element;
			if (type == "monitoring") element = this.element.find('#hmi-tab-area');
			else element = this.element.find('#hmi-create-tab-area');

			this.tab = element.kendoHmiTabStrip({
				useScrollButton : false,
				type : options.type
			}).data("kendoHmiTabStrip");
		},
		initCanvas : function(){},
		attachEvent : function(){},
		attachTabEvent : function(){
			var that = this;
			var tab = that.tab;
			tab.bind("orderChanged", that.afterTabOrderChangeEvt.bind(that));
			tab.bind("beforeActivate", that.beforeTabChangeEvt.bind(that));
			tab.bind("activate", that.afterTabChangeEvt.bind(that));
			tab.bind("add", that.addTabEvt.bind(that));
			tab.bind("added", that.addedTabEvt.bind(that));
			tab.bind("delete", that.deleteTabEvt.bind(that));
			tab.bind("deleted", that.deletedTabEvt.bind(that));
		},
		getViewModelWidget : function(filterOrActionName){
			var self = this;
			var viewModel = self.getFilterViewModel(filterOrActionName);
			if(viewModel === null) viewModel = self.getActionViewModel(filterOrActionName);
			if(viewModel !== null){
				var type = viewModel.type;
				var id = viewModel.id;
				var namespace = "";
				if(type == "dropdownlist") namespace = "kendoDropDownList";
				else if(type == "dropdowncheckbox") namespace = "kendoDropDownCheckBox";
				else if(type == "button") namespace = "kendoButton";
				else if(type == "combobox") namespace = "kendoCombobox";
				else if(type == "validator") namespace = "kendoCommonValidator";
				else return $("#" + id);
				return $("#" + id).data(namespace);
			}
			return null;
		},
		getFilterViewModel : function(filterName){
			var self = this, viewModel = self.viewModel, filters = viewModel.filters;
			return self._getFilterOrAction(filterName, filters);
		},
		getActionViewModel : function(actionName){
			var self = this, viewModel = self.viewModel, actions = viewModel.actions;
			return self._getFilterOrAction(actionName, actions);
		},
		_getFilterOrAction : function(name, viewModelList){
			var i, max = viewModelList.length;
			for( i = 0; i < max; i++ ){
				if(viewModelList[i].name == name){
					return viewModelList[i];
				}
			}
			return null;
		},
		bind : function(eventName, filterOrActionName, func){
			var self = this;
			var viewModel = self.getFilterViewModel(filterOrActionName);
			if(viewModel === null) viewModel = self.getActionViewModel(filterOrActionName);
			if(viewModel !== null) viewModel.bind(eventName, func);
		},
		unbind : function(eventName, filterOrActionName, func){
			var self = this;
			var viewModel = self.getFilterViewModel(filterOrActionName);
			if(viewModel === null) viewModel = self.getActionViewModel(filterOrActionName);
			if(viewModel !== null) viewModel.unbind(eventName, func);
		},
		trigger : function(eventName, filterOrActionName, args){
			var self = this;
			var viewModel = self.getFilterViewModel(filterOrActionName);
			if(viewModel === null) viewModel = self.getActionViewModel(filterOrActionName);
			if(viewModel !== null) viewModel.trigger(eventName, args);
		},
		afterTabOrderChangeEvt : function(){
		},
		beforeTabChangeEvt : function(e){
			this._isChangeTab = true;
			var innerCanvas = this._tabCanvasInfo[e.id] && this._tabCanvasInfo[e.id].canvas || void (0);
			if (innerCanvas){
				innerCanvas.changeToBackground(true);
				innerCanvas.clear();
			}
		},
		afterTabChangeEvt : function(e){
			var canvasInfo = this.tab.getCurrentTabCanvasInfo();
			this.setCanvasInfoCurrentTab(canvasInfo);
			var tabCanvas = this._tabCanvasInfo[canvasInfo.id];
			var innerCanvas;
			if(tabCanvas) {
				innerCanvas = tabCanvas.canvas;
				innerCanvas.changeToBackground(false);
				innerCanvas.setZoomLevel(canvasInfo.zoomLevel);
			}
			this._isChangeTab = false;
		},
		addTabEvt : function(e){
		},
		// grapic_ {id, name}
		addedTabEvt : function(canvasInfo){
			this.initCanvas();
			this.setCanvasInfo(canvasInfo);
			this.setCanvasInfoCurrentTab(canvasInfo);
		},
		deleteTabEvt : function(e){
		},
		deletedTabEvt : function(id){
			var tabCanvas = this._tabCanvasInfo[id].canvas;
			tabCanvas.destroy && tabCanvas.destroy();
			this.removeTabCanvasInfo(id);
		},
		getCanvasInfo : function(id){
			if (!id) {
				id = this.tab.getCurrentTabCanvasInfo().id;
			}
			return this._tabCanvasInfo[id] || {};
		},
		setCanvasInfo : function(canvasInfo){
			this._tabCanvasInfo[canvasInfo.id] = {
				canvas : this.canvas
			};
		},
		setCanvasInfoCurrentTab : function(canvasInfo){
			var tabCanvas = this._tabCanvasInfo[canvasInfo.id] || {};
			this.canvas = tabCanvas.canvas;
			this.loadedGraphicId = canvasInfo.id;
			this.loadedGraphicName = canvasInfo.name;
			if (!canvasInfo.zoomLevel) canvasInfo.zoomLevel = 100;
			// if (this.canvas) this.canvas.setZoomLevel(canvasInfo.zoomLevel);
			var tabLength = this.tab.length();
			if (tabLength == 0) this.tab.addTab();
			this.tab.setCurrentTabCanvasInfo(canvasInfo);
		},
		removeTabCanvasInfo : function(id){
			var canvasInfo = this._tabCanvasInfo[id];
			if (!canvasInfo) return;
			canvasInfo.canvas.clear();
			delete this._tabCanvasInfo[id];
		},
		clearTabCanvasInfo : function(){
			var canvasInfo = this._tabCanvasInfo;
			for (var key in canvasInfo) {
				delete canvasInfo[key];
			}
		},
		setCurrentTabZoomLevel : function(level) {
			if (!this._isChangeTab) this.tab.changeTabZoomLevel(this.tab.getCurrentTabIndex(), level);
		}
	});

	return {
		ButtonConfig : ButtonConfig,
		ToolbarButtonConfig : ToolbarButtonConfig,
		DropDownListConfig : DropDownListConfig,
		ValidatorConfig : ValidatorConfig,
		extendConfig : extendConfig,
		BaseViewModelClass : BaseViewModelClass
	};
});
//# sourceURL=hmi/view-model/base-vm.js
