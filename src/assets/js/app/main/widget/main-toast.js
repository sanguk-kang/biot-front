/*
	메인 토스트
*/
(function(window){

	var kendo = window.kendo;
	var Util = window.Util;
	var Notification = kendo.ui.Notification;
	var widget = Notification.extend({
		options: {
			name : "MainToast",
			autoHideAfter: 5000,  //default is 5 seconds,
			position : {
				bottom : 55,    //padding top+bottom = 32 left+right = 60
				right : 70
			},
			width : 434         //alarm noti tooltip width size
		},
		init : function(element, options){
			//content
			var self = this;
			Notification.fn.init.call(self, element, options);
			//this.wrapper.addClass("main-noti-toast-widget main-alarm-tooltip-widget");
		},
		_showPopup: function (wrapper, options) {
			wrapper.addClass("main-noti-toast-widget main-alarm-tooltip-widget");
			Notification.fn._showPopup.call(this, wrapper, options);
		}
	});

	//jQuery를 통해 요소에서 호출할 수 있도록 플러그인 등록
	kendo.ui.plugin(widget);

	// Rule 알람 시 다이얼로그
	var RULE_NOTI_WIDTH = 800,
		RULE_NOTI_HEIGHT = 300;
	var Howl = window.Howl,
		PATH_SOUND = Util.addBuildDateQuery('../../src/main/resources/static-dev/sound/Alarm_Sound.mp3');

	var RuleNoti = Notification.extend({
		options: {
			name: 'RuleToast',
			autoHideAfter: 0,
			width: RULE_NOTI_WIDTH,
			height: RULE_NOTI_HEIGHT,
			hideOnClick: false,
			button: true,
			pinned: true,
			animation: false,
			events: [
				'afterOpen',
				'afterClose'
			]
		},
		init: function(element, options){
			var that = this;
			Notification.fn.init.call(that, element, options);

			that.overlay = null;
			that.isLastNoti = false;
			that.isPlayedAlarmSound = false;
			that.sound = null;
			that.notiList = [];
			that._currentContent = null;

			that._createOverlay();
			that._initSound();

			this.setOptions({
				show: that._onShow,
				hide: that._onHide
			});
		},
		_initSound: function(){
			this.sound = new Howl({
				src: [PATH_SOUND],
				loop: true
			});
		},
		_createOverlay: function(){
			var body = $('body'),
				overlay = $('<div class="main-noti-overlay"></div>');
			if(body.find('.main-noti-overlay').length > 0){
				return;
			}
			body.append(overlay);
			this.overlay = body.find('.main-noti-overlay');
		},
		_onShow: function(e){
			var element = e.element.parent(),
				eWidth = element.width(),
				eHeight = element.height(),
				wWidth = $(window).width(),
				wHeight = $(window).height(),
				newTop, newLeft;

			newLeft = Math.floor(wWidth / 2 - eWidth / 2);
			newTop = Math.floor(wHeight / 2 - eHeight / 2);
			e.element.parent().css({top: newTop, left: newLeft});

			var tooltipList = e.element.find('.main-alarm-tooltip-list');
			if(tooltipList.hasClass('critical')){
				e.element.attr('rule-type', 'critical');
			}else if(tooltipList.hasClass('warning')){
				e.element.attr('rule-type', 'warning');
			}
		},
		_onHide: function(e){

		},
		show: function(content, type, safe){
			this._currentContent = content;
			Notification.fn.show.call(this, content, type, safe);
		},
		_showPopup: function (wrapper, options) {
			var self = this;
			var uuid = Util.getNewGUID();

			this._currentContent.alarmUuid = uuid;
			wrapper.data('content', this._currentContent);
			wrapper.addClass("main-noti-toast-rule-widget");

			Notification.fn._showPopup.call(this, wrapper, options);
			this.overlay.show();
			this._playAlarmSound();

			self.trigger('afterOpen', {isOpen: true, data: self._currentContent});
		},
		_attachPopupEvents: function (options, popup) {
			var that = this, allowHideAfter = options.allowHideAfter, attachDelay = !isNaN(allowHideAfter) && allowHideAfter > 0, closeIcon;
			var CLICK = 'click', NS = '.kendoNotification';

			function attachClick(target) {
			    target.on(CLICK + NS, function () {
			        that._hidePopup(popup);
			    });
			}
			if (options.hideOnClick) {
			    popup.bind('activate', function () {
			        if (attachDelay) {
			            setTimeout(function () {
			                attachClick(popup.element);
			            }, allowHideAfter);
			        } else {
			            attachClick(popup.element);
			        }
			    });
			} else if (options.button) {
			    closeIcon = popup.element.find('.ic.ic-close');
			    if (attachDelay) {
			        setTimeout(function () {
			            attachClick(closeIcon);
			        }, allowHideAfter);
			    } else {
			        attachClick(closeIcon);
			    }
			}
		},
		_hidePopup: function(wrapper, options){
			var self = this;
			var content = wrapper.element.data('content');
			this._countNotiWrapper();
			if(this.isLastNoti){
				this._onHideLastNoti();
			}

			Notification.fn._hidePopup.call(this, wrapper, options);
			self.trigger('afterClose', { isOpen: false, data: content });
		},
		_onHideLastNoti: function(){
			this.overlay.hide();
			this._stopAlarmSound();
		},
		_playAlarmSound: function(){
			var isPlayed = this.isPlayedAlarmSound;
			if(isPlayed){
				return;
			}
			this.isPlayedAlarmSound = true;
			//Sound play
			this.sound.play();
		},
		_stopAlarmSound: function(){
			this.isPlayedAlarmSound = false;
			//Sound Stop
			this.sound.stop();
		},
		_countNotiWrapper: function(){
			this.countNoti = this.getNotifications().length;
			if(this.countNoti == 1){
				this.isLastNoti = true;
			}else{
				this.isLastNoti = false;
			}
		},
		closePopup: function(data){
			if(!data){
				Notification.fn.hide.call(this);
				return;
			}
			var notis = this.getNotifications(),
				content = null, noti = null;
			for(var i = 0; i < notis.length; i++){
				noti = $(notis[i]);
				content = noti.data('content');
				if(data.code == content.code && (data.deviceId == content.dms_devices_id || data.deviceId == content.deviceId)){
					noti.find('.ic.ic-close').click();
				}
			}
		}
	});
	kendo.ui.plugin(RuleNoti);
})(window, jQuery);