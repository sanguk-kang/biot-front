(function(window, $){
	"use strict";
	var kendo = window.kendo, Widget = kendo.ui.Widget;

	var ONE_DAY_TIME_PICKER_DETAIL_POPUP_TEMPLATE = '<div class="one-day-time-picker-detail-popup-wrapper" >' +
                                                    '<form data-template="one-day-time-picker-detail-popup-template" data-bind="source: slots">' +
                                                    '</form>' +
                                                  '</div>' +

                                                  '<script id="one-day-time-picker-detail-popup-template" type="text/x-kendo-template">' +
                                                    '<ul>' +
                                                    '# for (var i = 0; i < timeSettings.length; i++) { #' +
                                                      '<li>' +
                                                        '<span class="time-unit"> #= timeSettings[i].displayedHourText # </span>' +
                                                        '<span class="input-wrapper">' +
                                                          '<input class="k-input" type="text" data-slot-id="#= id #" data-timesetting-id="#= timeSettings[i].uid #" data-bind="value: timeSettings[#=i#].displayedMinuteText" ></input>' +
                                                        '</span>' +
                                                        '<span class="minute-add-btn" data-slot-id="#= id #" data-bind=" events:{ click :  timeSettings[#=i#].clickAddMinuteBtn } " ></span>' +
                                                        '<span class="minute-remove-btn" data-slot-id="#= id #" data-timesetting-id="#= timeSettings[i].uid #" data-bind=" events:{ click : timeSettings[#=i#].clickRemoveMinuteBtn } " ></span>' +
                                                      '</li>' +
                                                    '# } #' +
                                                    '</ul>' +
	                                                '</script>';

	var CommonDialog = kendo.ui.CommonDialog;
	var OneDayTimePickerDetailPopup = kendo.ui.CommonDialog.extend({
		options: {
			name: "OneDayTimePickerDetailPopup",
			height : 466,
			width : 402,
			type: "single",
			timeout: 0,
			events : [
				"onSave",
				"onSaved",
				"onClose",
				"onClosed"
			],
			contentViewModel: null
		},
		validators: [],
		init: function(element, options) {
			var self = this;

			self._initTitle(options);
			self._initActions(options);
			CommonDialog.fn.init.call(self, element, options);
			self._renderTemplate();
		},

		_renderTemplate: function() {
			var self = this;
			var contentViewModel = self.options.contentViewModel;
			var detailpopupElem = null;

			self.template = ONE_DAY_TIME_PICKER_DETAIL_POPUP_TEMPLATE;
			self.element.html(self.template);
			detailpopupElem = self.element.find('.one-day-time-picker-detail-popup-wrapper');

			self._setDisplayedMinuteText();
			kendo.bind(detailpopupElem, contentViewModel);
			self._initValidator();
			self._setDisabledTimsettingRemoveBtn();
			self._setOnlyInputNumber();
			self._attachMinuteBtnHoverEvt();
		},

		_initValidator: function() {
			var self = this, I18N = window.I18N;
			var ulElems = self.element.find('ul'), i, j;
			var validators = [];
			var isInvalid = false;
			var validatorOptions = {
				rules: {
					timeSettingDupicated: function(input) {
						var value = input.val();
						var slotId = $(input).data("slot-id");
						var timeSettingsId = $(input).data('timesetting-id');

						console.log(value);
						console.log(input);
						console.log(self.validators);

						// 동일한 '분' 값이 '시간'에  설정 되어있는지 확인.
						var timeSettings = self.options.contentViewModel.slots[slotId].get('timeSettings');
						var isDuplicated = false;
						timeSettings.forEach(function(timeSetting) {
							if(timeSetting.displayedMinuteText === value && timeSetting.uid !== timeSettingsId) isDuplicated = true;
						});

						return !isDuplicated;
					},
					timeSettingMinMax: function(input) {
						var value = Number(input.val());
						if(!isNaN(value)) {
							if(value < 0 || value > 59) return false;
							return true;
						}
						return true;
					},
					timeSettingNumber: function(input) {
						var value = Number(input.val());
						if(!isNaN(value)) return true;
						return false;
					}
				},
				messages: {
					timeSettingDupicated: I18N.prop('FACILITY_SCHEDULE_CREATE_TIME_SETTING_INVALID_MSG_DUPLICATED_MINUTE'),
					timeSettingMinMax: 'timeSettingMinMax',
					timeSettingNumber: 'timeSettingNumber'
				}
			};

			for(i = 0; i < ulElems.length; i++) {
				var inputElems = ulElems.eq(i).find('input');
				for(j = 0; j < inputElems.length; j++) {
					var input = inputElems.eq(j);
					var validator = $(input.parent()).kendoCommonValidator(validatorOptions).data('kendoCommonValidator');
					validators.push(validator);

					// input blur 이벤트 (포커스 아웃)
					input.blur(function(){
						self._sortTimeSetting();
						self._renderTemplate();
					});
				}
			}

			self.validators = validators;

			validators.forEach(function(item) {
				if (!item.validate()) isInvalid = true;
			});

			if(isInvalid) self.setActions(1, {disabled: true});
			else self.setActions(1, {disabled: false});

		},
		_setTimeSettingMinuteToZeroByElem: function(targetElem) {
			var slotId = $(targetElem).data('slot-id');
			var timeSettingId = $(targetElem).data('timesetting-id');
			this.options.contentViewModel.slots[slotId].timeSettings.forEach(function(timeSetting){
				if(timeSetting.uid === timeSettingId) {
					timeSetting.set('minute', 0);
					timeSetting.set('displayedMinuteText', '00');
				}
			});
		},
		_setOnlyInputNumber: function() {
			var self = this;

			var inputElems = self.element.find("input"), i, len = inputElems.length;
			var checkInvalidInput = function(e) {
				var keycode = (e.keyCode ? e.keyCode : e.which);

				if(keycode == 13) {
					// 입력창 포커스 해제.
					self._setAllElemsFocusout();
				}

				if($(e.target).val() === "" && typeof e.key == 'undefined') {
					self._setTimeSettingMinuteToZeroByElem(e.target);
					self.validators.forEach(function(validator){
						validator.validate();
					});
					return;
				}

				// 숫자가 아닌 문자 입력 방지
				if(/[^0123456789]/g.test(e.key)) {
					$(e.target).val("");
					e.preventDefault();
					return;
					// $(e.target).focus();
				}

				var newStr = $(e.target).val() + e.key;
				var number = Number(e.key);
				if (!Number.isNaN(number) ) {
					var newNumber = Number(newStr);

					if (newStr.length >= 3 ) {
						$(e.target).val("");
						// e.preventDefault();
					} else if (newNumber < 0 || newNumber > 59) {
						e.preventDefault();
					}
				}
			};

			for(i = 0; i < len; i++) {
				$(inputElems.eq(i).on('input', function() {this.value = this.value.replace(/[^0-9.]/g, '');}));
				$(inputElems.eq(i)).on('keypress', checkInvalidInput.bind(self));
				$(inputElems.eq(i)).on('blur', checkInvalidInput.bind(self));
			}
		},

		_setDisplayedMinuteText: function () {
			var self = this;
			if(self.options.contentViewModel === null) return;
			// displayedMinuteText 재설정.
			self.options.contentViewModel.slots.forEach(function(slot) {
				slot.timeSettings.forEach(function(timeSetting) {
					timeSetting.set('displayedMinuteText', self._displayedMinuteText(timeSetting.displayedMinuteText));
				});
			});
		},

		_setAllElemsFocusout: function () {
			var el = document.querySelector( ':focus' );
			if( el ) el.blur();
		},

		_attachMinuteBtnHoverEvt: function() {
			var self = this, i, len;
			var addBtnElems = $(self.wrapper).find('.minute-add-btn');
			var removeBtenElems = $(self.wrapper).find('.minute-remove-btn');
			// add 버튼 hover 시, input focusout 을 위한 부분.
			len = addBtnElems.length;
			for(i = 0; i < len; i++) {
				addBtnElems.eq(i).hover(function(){
					self._setAllElemsFocusout();
				});
			}

			// remove 버튼 hover 시, input focusout 을 위한 부분.
			len = removeBtenElems.length;
			for(i = 0; i < len; i++) {
				removeBtenElems.eq(i).hover(function(){
					self._setAllElemsFocusout();
				});
			}
		},

		_initTitle : function() {
			var self = this;
			var I18N = window.I18N;
			self.options.title = I18N.prop("FACILITY_SCHEDULE_DETAIL_TIME_SETTINGS");
		},

		_initActions : function(){
			var I18N = window.I18N;
			var self = this;
			var actions = [
				{
					text : I18N.prop("COMMON_BTN_CLOSE"),
					disabled: false,
					action : function(e){
						e.sender.trigger("onClose");
					}
				},
				{
					text : I18N.prop("COMMON_BTN_SAVE"),
					disabled: false,
					action : function(e){
						var slots = self.options.contentViewModel.get('slots');

						// 표시값을 실제 값으로 전환.
						slots.forEach(function(slot){
							slot.timeSettings.forEach(function(timeSetting){
								if(timeSetting.displayedMinuteText !== "")
			            timeSetting.minute = Number(timeSetting.displayedMinuteText);
								else
									timeSetting.minute = "";
							});
						});

						// '분'을 입력하지 않은 타임 설정 제거.
						slots.forEach(function(slot){
							slot.timeSettings = slot.timeSettings.filter(function(timeSetting) {
								return timeSetting.minute !== "";
							});
						});

						self.options.contentViewModel.set('slots', slots);
						e.sender.trigger("onSave", {result: self.options.contentViewModel});
					}
				}
			];

			self.options.actions = actions;
		},

		_onValidateTimeSetting: function(e) {
			console.log('_onValidateTimeSetting');

		},

		_onChangeContentViewModel: function() {
			console.log('_onChangeContentViewModel');

		},

		_setDisabledTimsettingRemoveBtn: function() {
			var self = this;
			var rootElem = self.element;
			var timeSettingsCount = 0;

			if(self.options.contentViewModel === null) return;

			self.options.contentViewModel.slots.forEach(function(slot){
				timeSettingsCount += slot.timeSettings.length;
			});
			// '분' 설정이 1개인 경우, remove 버튼 disabled 처리.
			if(timeSettingsCount == 1) {
				var deleteElem = rootElem.find('.minute-remove-btn').eq(0);
				deleteElem.css("pointer-events", "none");
				deleteElem.css("opacity", "0.3");
			}
		},

		_sortTimeSetting: function() {
			var self = this;
			var isChanged = false;
			self.options.contentViewModel.slots.forEach(function(slot) {
				var sortedTimeSettings = slot.timeSettings.sort( function (a, b) {
					var res = Number(a.displayedMinuteText) - Number(b.displayedMinuteText);
					if(res < 0) isChanged = true;
					return res;
				});
				if(slot.get("timeSettings").length > 0)
					slot.set("timeSettings", sortedTimeSettings);
			});
			// 시간 설정 정렬.
			if(isChanged)
				self._renderTemplate();
		},

		setContentViewModel: function(oneDayTimePickerViewModel) {
			var self = this;
			var copiedViewModel = JSON.parse(JSON.stringify(oneDayTimePickerViewModel));
			copiedViewModel.slots.forEach(function(slot) {
				slot.timeSettings.forEach(function(timeSetting) {
					timeSetting.displayedMinuteText = self._displayedMinuteText(timeSetting.minute);
					timeSetting.displayedHourText = self._displayedHourText(timeSetting.hour);
					timeSetting.clickAddMinuteBtn = self.addTimeSetting.bind(self);
					timeSetting.clickRemoveMinuteBtn = self.removeTimeSetting.bind(self);
					timeSetting.onValidateTimeSetting = self._onValidateTimeSetting.bind(self);
				});
			});
			copiedViewModel = kendo.observable(copiedViewModel);
			self.setOptions({contentViewModel: copiedViewModel});
			self.options.contentViewModel.bind('change', self._onChangeContentViewModel.bind(self));
		},

		addTimeSetting: function(e) {
			console.log('addTimeSetting');
			var self = this;
			var slotId = $(e.target).data('slot-id');
			var slot = self.options.contentViewModel.slots.filter(function(item) {
				return item.id == slotId;
			})[0];
			var timeSettings = slot.timeSettings;
			var timeSetting = self._createTimeSettingModel(slot, 0);
			timeSettings.push(timeSetting);

			slot.set('timeSettings', timeSettings);
			self._renderTemplate();
		},

		removeTimeSetting: function(e) {
			console.log('removeTimeSetting');
			var self = this;
			var slotId = $(e.target).data('slot-id');
			var timeSettingsId = $(e.target).data('timesetting-id');
			var slot = self.options.contentViewModel.slots.filter(function(item) {
				return item.id == slotId;
			})[0];
			var timeSettings = slot.timeSettings;

			timeSettings = timeSettings.filter(function(item) {
				return item.uid !== timeSettingsId;
			});
			slot.set('timeSettings', timeSettings);
			self._renderTemplate();
		},

		_createTimeSettingModel: function(slot, minute) {
			var self = this;
			var hour = slot.gteTime;
			var timeSetting = {
				id: minute,
				hour: hour,
				minute: minute,
				displayedMinuteText: self._displayedMinuteText(minute),
				displayedHourText: self._displayedHourText(hour),
				clickAddMinuteBtn: self.addTimeSetting.bind(self),
				clickRemoveMinuteBtn: self.removeTimeSetting.bind(self),
				onValidateTimeSetting: self._onValidateTimeSetting.bind(self)
			};
			return timeSetting;
		},
		_displayedMinuteText: function(minute) {
			if (minute === null || minute === "") return "";
			if (Number.isNaN(Number(minute))) return minute;
			if(typeof minute == "string" && minute[0] === '0') {
				if(minute == 0) return "00";
				return minute;
			}
			if(typeof minute == "string" && minute[0] === '-') {
				return minute;
			}
			return minute >= 10 ? minute + "" : "0" + minute;
		},
		_displayedHourText: function(hour) {
			return hour >= 10 ? hour + "" : "0" + hour + " :";
		}
	});

	kendo.ui.plugin(OneDayTimePickerDetailPopup);


	var ONE_DAY_TIME_PICKER_TEMPLATE = '<script id="one-day-time-picker-slots-template" type="text/x-kendo-template">' +
                                        '<div class="one-day-time-picker-slot" data-uid="#=id#" data-bind="css: {activated: timeSettings.length > 0}">' +
                                          '#if(ltTime != 24){#' +
                                            '<span class="time-unit" data-bind="text: ltTime"></span>' +
                                          '#}#' +
                                            '<span class="added-item-count" data-bind="text:displayedCountText"></span>' +
	                                      '</div>' +
                                      '</script>' +
                                      '<div class="one-day-time-picker-wrapper">' +
                                        '<div class="one-day-time-picker-slots" data-template="one-day-time-picker-slots-template" data-bind="source: slots, css:{state-disabled: isDisabled}">' +
                                        '</div>' +
                                      '</div>' +
                                      '<div id="one-day-time-picker-detail-popup">' +
                                      '</div>';
	var DATABINDING = "dataBinding";
	var DATABOUND = "dataBound";
	var CHANGE = "change";


	var OneDayTimePicker = Widget.extend({
		events: [
			// Call before mutating DOM.
			// MVVM will traverse DOM, unbind any bound elements or widgets.
			DATABINDING,
			// Call after mutating DOM.
			// Traverses DOM and binds ALL THE THINGS.
			DATABOUND,
			CHANGE
		],

		options: {
			name: "OneDayTimePicker",
			autoBind: true,
			template: "",
			dataSource: []
		},
		viewModel: null,
		slotsDetailPopup: null,

		init : function(element, options){
			var self = this;
			console.log('OneDayTimePicker::init');
			Widget.fn.init.call(self, element, options);
			self._initViewModel();
			self._renderTemplate();
			self._initDetailPopup();
			self._attachEvent();
			self._dataSource();
		},

		_renderTemplate: function() {
			var self = this;
			var slotsElem = null;
			// var html = kendo.template(self.template);
			self.template = ONE_DAY_TIME_PICKER_TEMPLATE;
			self.element.html(self.template);
			slotsElem = self.element.find('.one-day-time-picker-slots');

			kendo.bind(slotsElem, self.viewModel);
		},

		_initViewModel: function() {
			var self = this;

			var createTimeSlotModel = function(gteTime, ltTime) {
				var timeSlot = {
					id: gteTime,
					gteTime: gteTime,
					ltTime: ltTime,
					timeSettings: [],
					displayedCountText: self._displayedCountText
				};
				return timeSlot;
			};

			var createOneDayTimeSlots = function() {
				var i, slots = [];
				for(i = 0; i < 24; i++) {
					slots.push(createTimeSlotModel(i, i + 1));
				}
				return slots;
			};

			self.viewModel = kendo.observable({
				slots: createOneDayTimeSlots(),
				isDisabled: false
			});
		},

		setTimesettings: function(timeSetting) {
			var self = this, hour, minute;

			self._initViewModel();
			self._renderTemplate();
			self._initDetailPopup();
			self._attachEvent();

			if(timeSetting !== null) {
				timeSetting = timeSetting.split(":");
				hour = Number(timeSetting[0]);
				minute = Number(timeSetting[1]);
				self._addSlotTimeSetting(self.viewModel.slots[hour], minute);
			}
		},

		getTimesettings: function() {
			var self = this;
			var slots = self.viewModel.get('slots');
			var res = [];
			slots.forEach(function(slot){
				slot.timeSettings.forEach(function(timeSetting){
					res.push(timeSetting.displayedHourText.split(' :')[0] + ":" + timeSetting.displayedMinuteText + ":00");
				});
			});

			return res;
		},

		_displayedCountText: function() {
			var count = this.get('timeSettings').length;
			return count > 0 ? count : "";
		},

		_attachEvent: function() {
			this._attachSoltClickEvt();
			this._attachViewModelChangeEvt();
		},

		_attachSoltClickEvt: function() {
			var self = this;
			var DELAY = 200, clicks = 0, timer = null;
			var slotsElem = self.element.find('.one-day-time-picker-slots');

			// click 과 double click 이벤트 분리를 위한 부분.
			slotsElem.on("click", function(e){
				clicks++;  //count clicks
				if(clicks === 1) {
					timer = setTimeout(function() {
						self._onClick(e);
						clicks = 0;             //after action performed, reset counter
					}, DELAY);
				} else {
					clearTimeout(timer);    //prevent single-click action
					self._onDoubleClick(e);
					clicks = 0;             //after action performed, reset counter
				}
			}).on("dblclick", function(e){
				e.preventDefault();  //cancel system double-click event
			});
		},
		_attachViewModelChangeEvt: function() {
			var self = this;
			self.viewModel.bind("change", function() {
				self.slotsDetailPopup.setContentViewModel(self.viewModel);
				self.trigger(CHANGE, {sender: self});
			});
		},
		_initDetailPopup: function() {
			var self = this;
			var slotsDetailPopupElem = self.element.find('#one-day-time-picker-detail-popup');
			self.slotsDetailPopup = slotsDetailPopupElem.kendoOneDayTimePickerDetailPopup().data('kendoOneDayTimePickerDetailPopup');
			self.slotsDetailPopup.bind("onSave", function(e) { self._setViewModelByDetailPopupContetnViewModel(e.result); } );
			self.slotsDetailPopup.bind("onClose", function(e) { self.slotsDetailPopup.setContentViewModel(self.viewModel); } );
		},
		_setViewModelByDetailPopupContetnViewModel: function(contentViewModel) {
			var self = this;
			contentViewModel.slots.forEach(function(slot, idx){
				self.viewModel.slots[idx].set("timeSettings", slot.timeSettings);
			});
		},

		_onClick: function(e) {
			var self = this;
			var id = $(e.target).data('uid');
			var slot = self.viewModel.slots[id];

			if(slot.get('timeSettings').length == 0) {
				self._addSlotTimeSetting(slot, 0);
			} else if(slot.get('timeSettings').length == 1) {
				slot.set('timeSettings', []);
			}
		},

		_onDoubleClick: function(e) {
			console.log('doublelcick::call');
			var self = this;
			var id = $(e.target).data('uid');
			var slot = self.viewModel.slots[id];

			if(slot.get('timeSettings').length == 0) {
				self._addSlotTimeSetting(slot, 0);
			}

			self._openTimeSettingDetailPopup();
		},

		_openTimeSettingDetailPopup: function() {
			console.log('_openTimeSettingDetailPopup::call');
			var self = this;
			self.slotsDetailPopup._renderTemplate();
			self.slotsDetailPopup.open();
		},

		_toggleDisabledState: function() {
			var self = this;
			var isDisabled = self.viewModel.get('isDisabled');
			self.viewModel.set('isDisabled', !isDisabled);
		},

		enable: function(isEnabled) {
			var self = this;
			self.viewModel.set('isDisabled', !isEnabled);
		},

		_addSlotTimeSetting: function(slot, minute) {
			var self = this;
			var timeSettings = slot.get('timeSettings');
			var createTimeSettingModel = self.slotsDetailPopup._createTimeSettingModel.bind(self.slotsDetailPopup);

			timeSettings.push(createTimeSettingModel(slot, minute));
			slot.set('timeSettings', timeSettings);
		},

		// MVVM expects an array of DOM elements that represent each item of the datasource.
		// Has to be the children of the outermost element.
		items: function() {
			return this.element.children();
		},

		// For supporting changing the datasource over MVVM.
		setDataSource: function(dataSource) {
			// Set the internal datasource equal to the one passed in by MVVM.
			this.options.dataSource = dataSource;
			// Rebuild the datasource if necessary or just reassign.
			this._dataSource();
		},

		_dataSource: function() {

			var that = this;

			// If the DataSource is defined and the _refreshHandler is wired up, unbind because
			// you need to rebuild the DataSource.
			if ( that.dataSource && that._refreshHandler ) {
				that.dataSource.unbind(CHANGE, that._refreshHandler);
			} else {
				that._refreshHandler = $.proxy(that.refresh, that);
			}

			// Returns the datasource OR creates one if using array or configuration object.
			that.dataSource = kendo.data.DataSource.create(that.options.dataSource);
			// Bind to the change event to refresh the widget.
			that.dataSource.bind( CHANGE, that._refreshHandler );

			if (that.options.autoBind) {
				that.dataSource.fetch();
			}
		},

		refresh: function() {
			var that = this;

			// Trigger the dataBinding event.
			that.trigger(DATABINDING);

			// Mutate the DOM (AKA build the widget UI).
			// that.element.html(html);
			that._refreshViewModel;

			// Trigger the dataBound event.
			that.trigger(DATABOUND);
		},

		_refreshViewModel: function() {
			console.log('OneDayTimePicker::_refreshViewModel::call');
		}

	});

	kendo.ui.plugin(OneDayTimePicker);

})(window, jQuery);
//# sourceURL=schedule/widget/one-day-time-picker.js
