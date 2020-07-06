define("operation/schedule/widget/exceptional-widget", [
], function(){
	var moment = window.moment;
	var I18N = window.I18N;
	var Util = window.Util;
	// var Settings = window.GlobalSettings;
	var kendo = window.kendo;

	var createNewWidget = function(id, Widget, options){
		var elem = $("<div/>").attr("id", id);
		return new Widget(elem, options);
	};

	var mainView = {
		exceptionCalendars: {
		},
		exceptionDayList:{
			isRepeat: true,
			resizable: false,
			duplicateDateInspection: true
		}
	};

	return {
		createNewWidget: createNewWidget,
		mainView: mainView
	};
});

//For Debug
//# sourceURL=exceptional-widget.js