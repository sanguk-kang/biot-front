/*
	메인 창 상단 네비게이션 툴팁
*/
(function(window, $){
	var kendo = window.kendo;
	var Tooltip = kendo.ui.Tooltip;
	var moment = window.moment;
	var Util = window.Util;
	var MAX_NOTI_LIST_SIZE = 10;
	// var TOOLTIP_CLOSE_TEMPLATE = '<div class="k-tooltip-button"><a href="\\#" class="ic ic-close">close</a></div>';

	var customTooltip = Tooltip.extend({
		options: {
			name : "MainNavTooltip",
			popupOptions : {
				position : "bottom right",
				origin : "top center"
			},
			popupCss : {
				"margin-top" : 20
			},
			template : null,
			view : null,
			data : {
				errorList : [],
				warningList : []
			},
			events : {
				myProfile : null,
				signOut : null
			},
			viewModel : null
		},
		init : function(element, options){
			//content
			var self = this;
			Tooltip.fn.init.call(self, element, options);

			self.viewModel = kendo.observable({
				errorList : self.options.data.errorList,
				warningList : self.options.data.warningList
			});
		},
		_initPopup : function(){
			var self = this;
			Tooltip.fn._initPopup.call(self);
			this.popup.setOptions(self.options.popupOptions);
			var closeBtn = this.popup.element.find(".k-icon.k-i-close");
			if(closeBtn.length > 0){
				closeBtn.removeClass("k-icon k-i-close");
				closeBtn.addClass("ic ic-close");
			}
			this.popup.element.css(self.options.popupCss);
			this.popup.element.addClass("main-alarm-tooltip-widget");
			//refresh popup position via options
			this.popup.position();
			this._attachEvent();
		},
		_attachEvent : function(){
			var MainWindow = window.MAIN_WINDOW;
			this.popup.element.on("click", ".main-alarm-tooltip-item", function(){
				//move to alarm history
				MainWindow.goToMenu("operation", "alarm");
			});
		},
		_appendContent : function(target){
			var self = this;
			target = target || self.element;
			Tooltip.fn._appendContent.call(self, target);
			var bindContent = self.content.find(".main-alarm-tooltip-list");

			if(bindContent.length > 0){
				kendo.bind(bindContent, self.viewModel);
			}

			if(self.options.events.myProfile){
				self.content.find(".main-user-profile").on("click", self.options.events.myProfile);
			}

			if(self.options.events.signOut){
				self.content.find(".main-user-signout").on("click", self.options.events.signOut);
			}
		},
		updateListRemote : function(url){
			var self = this;
			kendo.ui.progress(self.content, true);
			return $.ajax({
				url : url
			}).done(function(data){
				//process data
				self.updateList(data);
			}).always(function(){
				kendo.ui.progress(self.content, false);
			});
		},
		addError : function(data, isShift){
			var isSuccess = false;
			var list = this.viewModel.get("originalErrorList");
			list.unshift(data);
			if(isShift){
				list.shift();
			}
			var sliceList = list.slice(0, MAX_NOTI_LIST_SIZE);
			this.viewModel.set("errorList", sliceList);
			isSuccess = true;
			return isSuccess;
		},
		removeError : function(data){
			var isSuccess = false;
			var list = this.viewModel.get("originalErrorList");
			var i, max = list.length;
			for( i = 0; i < max; i++ ){
				if(data.code == list[i].code && (data.deviceId == list[i].dms_devices_id || data.deviceId == list[i].deviceId)){
					list.splice(i, 1);
					isSuccess = true;
					break;
				}
			}
			var sliceList = list.slice(0, MAX_NOTI_LIST_SIZE);
			this.viewModel.set("errorList", sliceList);
			return isSuccess;
		},
		addWarning : function(data, isShift){
			var isSuccess = false;
			var list = this.viewModel.get("originalWarningList");
			list.unshift(data);
			if(isShift){
				list.shift();
			}

			var sliceList = list.slice(0, MAX_NOTI_LIST_SIZE);
			this.viewModel.set("warningList", sliceList);
			isSuccess = true;
			return isSuccess;
		},
		removeWarning : function(data){
			var isSuccess = false;
			var list = this.viewModel.get("originalWarningList");
			var i, max = list.length;
			for( i = 0; i < max; i++ ){
				if(data.code == list[i].code && (data.deviceId == list[i].dms_devices_id || data.deviceId == list[i].deviceId)){
					list.splice(i, 1);
					isSuccess = true;
					break;
				}
			}

			var sliceList = list.slice(0, MAX_NOTI_LIST_SIZE);
			this.viewModel.set("warningList", sliceList);
			return isSuccess;
		},
		formatDate : function(list){
			var i, max = list.length;
			var item;
			for( i = 0; i < max; i++ ){
				item = list[i];
				this.setEventTime(item);
				this.setDescription(item);
			}
		},
		setEventTime : function(data){
			if(data.eventTime){
				data.eventTime = moment(data.eventTime).format("LLL");
			}
		},
		setDescription : function(data){
			if(data.name){
				data.name = Util.getAlarmDescription(data.name);
			}
		},
		setAlarmData : function(list){
			var i, max = list.length;
			for( i = 0; i < max; i++ ){
				Util.setAlarmData(list[i]);
			}
		},
		setErrorList : function(list){
			//this.formatDate(list);
			this.setAlarmData(list);
			this.viewModel.set("originalErrorList", list);
			var sliceList = list.slice(0, MAX_NOTI_LIST_SIZE);
			this.viewModel.set("errorList", sliceList);
		},
		getErrorList : function(){
			return this.viewModel.get("errorList");
		},
		setWarningList : function(list){
			//this.formatDate(list);
			this.setAlarmData(list);
			this.viewModel.set("originalWarningList", list);
			var sliceList = list.slice(0, MAX_NOTI_LIST_SIZE);
			this.viewModel.set("warningList", sliceList);
		},
		getWarningList : function(){
			return this.viewModel.get("warningList");
		},
		destroy : function(){
			// console.log("destroy!");
			Tooltip.fn.destroy.call(this);
			//Destroy View Model?
			//this.options.viewModel.
		}
	});

	//jQuery를 통해 요소에서 호출할 수 있도록 플러그인 등록
	kendo.ui.plugin(customTooltip);

})(window, jQuery);