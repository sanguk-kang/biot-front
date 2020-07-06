/**
 *
 *   <ul>
 *       <li>캘린더 팝업 내에서 날짜를 선택하여 입력 칸에 반영할 수 있다.</li>
 *       <li>Kendo UI의 Calendar 위젯을 상속받아 커스터마이징</li>
 *   </ul>
 *   @module app/widget/common-calender
 *   @requires app/main
 */
(function($){
	var kendo = window.kendo, ui = kendo.ui, Widget = ui.Widget;
	var moment = window.moment;

	var TEMPLATE;
	var MAX_YEAR = 2099;
	var ACTION_ENUM = {
		CLOSE: 0,
		SAVE: 1
	};
	var flagValueChange = false;

	var exceptionDayList = Widget.extend({
		options: {
			name: "ExceptionDayList",
			events : [
				"onSave",
				"onClose"
			],
			isRepeat: false,
			resizable: false
		},
		/**
		 *
		 *   위젯을 초기화하며 캘린더 팝업 및 내부 버튼 UI요소를 생성한다. - 최초 1번 실행
		 *
		 *   @function init
		 *	 @param {HTMLElement} element - 엘리먼트.
		 *	 @param {Object} options - 캘린더 위젯 초기 옵션 객체.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-calender
		 *
		 */
		init: function(element, options){
			var that = this;
			Widget.fn.init.call(that, element, options);
			this.wrapper = this.element;
			this.popup = null;
			this.msgDialog = null;
			this.grid = null;
			this.data = null;
			this.viewModel = null;
			this.confirmDialog;
			this.execptionalDate = [];
			this.totalCheckCount = 0;
			this.isRepeat = false;
			this.isEdit = false;
			if (options) {
				if (options.isRepeat) this.isRepeat = options.isRepeat;
				if (options.resizable) this.resizable = options.resizable;
				if (options.duplicateDateInspection) this.duplicateDateInspection = options.duplicateDateInspection;
			}
			this._parseDataSource();
			this._initDOM();
			this._initComponent();
			this._attchEvent();
		},
		_parseDataSource: function(){
			console.log('execptional-calender: _parseDataSource');
		},
		_initDOM: function(){
			console.log('execptional-calender: _initDOM');
			var I18N = window.I18N;
			TEMPLATE = "<div class='exception-list-container'>" +
				"<div class='exception-top-block'>" +
					"<p class='title'>" + I18N.prop('FACILITY_SCHEDULE_EXCEPTION_DAY') + "</p>" +
					"<ul class='schedule-actions-list'>" +
						"<li>" +
							'<button class="k-button add" data-bind="enabled: actions.add.enabled">' + I18N.prop('COMMON_BTN_ADD') + '</button>' +
						"</li>" +
						"<li>" +
							'<button class="k-button edit" data-bind="enabled: actions.edit.enabled">' + I18N.prop('COMMON_BTN_EDIT') + '</button>' +
						"</li>" +
						"<li>" +
							'<button class="k-button delete" data-bind="enabled: actions.delete.enabled">' + I18N.prop('COMMON_BTN_DELETE') + '</button>' +
						"</li>" +
					"</ul>" +
				"</div>" +
				"<div class='exception-grid k-grid k-widget'>" +
				"</div>" +
				"<div class='exception-popup pop-confirm'></div>" +
			"</div>";
			this.element.html(TEMPLATE);
			this.wrapper.addClass('exception-day-list');
			this._initBinding();
		},
		_initComponent: function(){
			console.log('execptional-calender: _initComponent');
			this._initPopup();
			this._initActionBtn();
			this._initGrid();
			this._initConfirmPopup();
			this._initValidator();
		},
		_initBinding: function(){
			var that = this;
			var elem = that.element.find('.schedule-actions-list');
			that.viewModel = kendo.observable({
				actions: {
					add: { enabled: true },
					edit: { enabled: false },
					delete: { enabled: false }
				}
			});
			kendo.bind(elem, that.viewModel);
		},
		_initConfirmPopup: function(){
			var confirmDialogElem = $("<div/>");
			this.confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");
		},
		_initPopup: function(){
			var divPopup = this.wrapper.find('.exception-popup'),
				that = this,
				I18N = window.I18N;

			var POPUP_TEMPLATE = "<div class='exception-popup-contents'>" +
				"<div class='key'>" + I18N.prop("COMMON_NAME") + "</div>" +
				"<div class='value' data-role='commonvalidator' data-type='name' data-bind='events:{validate:name.change}' data-required='true'>" +
					"<input class='k-input text-input' type='text' placeholder='" + I18N.prop("FACILITY_SCHEDULE_PLACEHOLDER_NAME") + "' data-bind='value: name.value' required></input>" +
				"</div>" +
				"<div class='key'>" + I18N.prop("FACILITY_SCHEDULE_PERIOD") + "</div>" +
				"<div class='value'>" +
					"<input class='popup-date-picker start' data-role='commondatepicker' data-bind='value: startDate.value, events: { change: startDate.change }'></input>" +
					"<span class='period-wave'>~</span>" +
					"<input class='popup-date-picker end' data-role='commondatepicker' data-bind='value: endDate.value, events: { change: endDate.change }'></input>" +
				"</div>" +
				"<div class='key'>" + I18N.prop("FACILITY_SCHEDULE_REPEAT") + "</div>" +
				"<div class='value'>" +
					"<input type='checkbox' id='test-checkbox1' class='k-checkbox' checked data-bind='checked: repeatYear.checked, enabled: isRepeat'>" +
					"<label for='test-checkbox1' class='k-checkbox-label'>" +  I18N.prop("FACILITY_SCHEDULE_PERIOD_YEAR") + "</label>" +
				"</div>" +
				"<div class='key'>" + I18N.prop("COMMON_DESCRIPTION") + "</div>" +
					"<div class='value' data-role='commonvalidator' data-type='description' data-key='description'>" +
						"<input class='k-input text-input' type='text' placeholder='" + I18N.prop("FACILITY_SCHEDULE_PLACEHOLDER_DESCRIPTION") + "' data-bind='value: description.value' ></input>" +
					"</div>" +
				"</div>";

			this.popup = divPopup.kendoDetailDialog({
				width: "492px",
				title: I18N.prop('FACILITY_SCHEDULE_ADD_EXCEPTION_DAY'),
				height : 586,
				// closeAction: that._closeExceptionPopup,
				detailContentTemplate : POPUP_TEMPLATE,
				contentViewModel : {
					id: {
						value: null
					},
					name: {
						value: '',
						valid: false,
						change: that._onChangeName
					},
					startDate: {
						value: new Date(),
						change: that._onChangeStartDate
					},
					endDate: {
						value: new Date(),
						change: that._onChangeEndDate
					},
					isRepeat: this.isRepeat,
					repeatYear: {
						checked: false
					},
					description: {
						value: '',
						valid: false,
						change: that._onChangeDesc
					},
					_checkDateIsBeforeToday: that._checkDateIsBeforeToday,
					_checkStartDateEndDateTimePicker: that._checkStartDateEndDateTimePicker
				},
				//다이얼로그의 버튼 제어를 위한 버튼의 인덱스 설정
				buttonsIndex : {
					CLOSE : 0,
					EDIT : 2,
					CANCEL : 3,
					SAVE : 1,
					REGISTER : 4,
					DEREGISTER : 5,
					DELETE : 6
				},
				isCustomActions : true,
				actions : [
					{
						text : I18N.prop("COMMON_BTN_CLOSE"),
						visible : true,
						action : that._closeExceptionPopup
					},
					{
						text : I18N.prop("COMMON_BTN_SAVE"),
						visible : true,
						disabled : true,
						action : that._saveExceptionPopup.bind(that)
					}
					// {
					// 	text : I18N.prop("COMMON_BTN_EDIT"),
					// 	visible : false,
					// 	disabled : false,
					// 	action : that._editExceptionPopup.bind(that)
					// }
				],
				onTypeChange : this._onTypeChangeEvt.bind(that),
				enableSaveBtnCondition: this._enableSaveBtnCondition
			}).data("kendoDetailDialog");

			var msgDialogElem = $("<div/>");
			this.msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");

		},
		_onTypeChangeEvt: function(e){
			var type = e.type;
			var BTN = e.sender.BTN;
			var detailPopup = this.popup;
			if (!detailPopup) return;
			if (type === 'save') {
				detailPopup.setActions(BTN.REGISTER, { visible : false });
				detailPopup.setActions(BTN.CANCEL, { visible : false });
				detailPopup.setActions(BTN.EDIT, { visible : false });
				detailPopup.setActions(BTN.DEREGISTER, { visible : false });

				detailPopup.setActions(BTN.CLOSE, { visible : true });
				detailPopup.setActions(BTN.SAVE, { visible : true, disabled : true });
			} else {
				detailPopup.setActions(BTN.SAVE, { visible : true, disabled : false });
				detailPopup.setActions(BTN.CANCEL, { visible : false });
				detailPopup.setActions(BTN.DEREGISTER, { visible : false });
				detailPopup.setActions(BTN.REGISTER, { visible : false });

				detailPopup.setActions(BTN.CLOSE, { visible : true });
				detailPopup.setActions(BTN.EDIT, { visible : false });
			}
		},
		_saveExceptionPopup: function(e){
			var triggerType = this.isEdit ? 'onEdit' : 'onSave';
			var contentViewModel = this.popup.contentViewModel;
			var originalData = this.data.get(contentViewModel.id.value);
			var result = {
				name: contentViewModel.name.value,
				startDate: contentViewModel.startDate.value,
				endDate: contentViewModel.endDate.value,
				repeatYear: contentViewModel.repeatYear.checked,
				description: contentViewModel.description.value
			};
			if (this.isEdit) {
				result.id = contentViewModel.id.value;
				if (originalData.name === result.name) delete result.name;
			}
			this._trim(result);
			this._dateFormating(result);
			if (this._validationInput()) return false;
			if(this._validation(this.isEdit)) {
				this.msgDialog.open();
				return false;
			}
			this.trigger(triggerType, {
				sender : e.sender,
				result : result
			});
			this.grid.uncheckAll();
			this._actionBtnEnabled();
			if(!this._validation(this.isEdit)) this.popup.close();
		},
		// _editExceptionPopup: function(e) {
		// 	var contentViewModel = this.popup.contentViewModel;
		// 	var originalData = this.data.get(contentViewModel.id.value);
		// 	var result = {
		// 		id: contentViewModel.id.value,
		// 		name: contentViewModel.name.value,
		// 		startDate: contentViewModel.startDate.value,
		// 		endDate: contentViewModel.endDate.value,
		// 		repeatYear: contentViewModel.repeatYear.checked,
		// 		description: contentViewModel.description.value
		// 	};
		// 	if (originalData.name === result.name) delete result.name;
		// 	this._trim(result);
		// 	this._dateFormating(result);
		// 	if(this._validation(true)) {
		// 		this.msgDialog.open();
		// 		return false;
		// 	}
		// 	this.trigger('onEdit', {
		// 		sender : e.sender,
		// 		result : result
		// 	});
		// 	this.grid.uncheckAll();
		// 	this._actionBtnEnabled();
		// },
		_trim: function(result) {
			if (result.name) result.name = result.name.trim();
			if (result.description) result.description = result.description.trim();
		},
		_dateFormating: function(result) {
			result.startDate = moment(result.startDate).format('YYYY-MM-DD');
			result.endDate = moment(result.endDate).format('YYYY-MM-DD');
		},
		_validationInput: function() {
			var contentViewModel = this.popup.contentViewModel;
			var validatorName = this.popup.element.find('.value[data-type="name"]').data('kendoCommonValidator');
			var reulst = false;

			flagValueChange = true;
			if (!validatorName.validate()) {
				reulst = true;
				contentViewModel.name.set('value', '');
			}
			flagValueChange = false;
			return reulst;
		},
		_validation: function(isEdit) {
			var contentViewModel = this.popup.contentViewModel;
			var id = isEdit ? contentViewModel.id.value : null;

			if (this._duplicationTitle(contentViewModel.name.value, id)) {
				return true;
			} else if(this._duplicationDate(contentViewModel.startDate.value, contentViewModel.endDate.value, id)) {
				return true;
			}
			return false;
		},
		_duplicationTitle: function(isTitle, id){
			if (!this.data) return;
			var data = this.data.data();
			var title;
			for(var i = 0, max = data.length; i < max; i++) {
				title = data[i].name;
				if (id === data[i].id) continue;
				if (isTitle === title) {
					this.msgDialog.message(window.I18N.prop('FACILITY_SCHEDULE_EXCEPTION_DAY_DUPlICATED_NAME_EXIST'));
					return true;
				}
			}
			return false;
		},
		_duplicationDate: function(currentStartDate, currentEndDate, id) {
			if (!this.data) return;
			var item, countRepeatYear, startM, endM;
			var data = this.data.data();
			var selectedDate = this._compareDateFormating(currentStartDate, currentEndDate);
			for(var i = 0, max = data.length; i < max; i++) {
				item = data[i];
				startM = moment(item.startDate);
				endM = moment(item.endDate);
				if (id === item.id) continue;
				if (item.repeatYear) {
					countRepeatYear = MAX_YEAR - startM.format('YYYY');
					var index = 0;
					while (index < countRepeatYear) {
						if (this._currentDulpicationDate(startM, endM, currentStartDate, currentEndDate, selectedDate)) return true;
						startM.add(1, 'year');
						endM.add(1, 'year');
						index++;
					}
				}
				if (this._currentDulpicationDate(startM, endM, currentStartDate, currentEndDate, selectedDate)) return true;
			}
		},
		_currentDulpicationDate: function(startDate, endDate, currentStartDate, currentEndDate, selectedDate) {
			var date = this._compareDateFormating(startDate, endDate);
			if (this.duplicateDateInspection) {
				if(this._betweenDate(currentStartDate, currentEndDate, startDate, endDate)) {
					this.msgDialog.message(window.I18N.prop('FACILITY_SCHEDULE_EXCEPTION_DAY_DUPlICATED_DATE_EXIST'));
					return true;
				}
			}
			if (selectedDate === date) {
				this.msgDialog.message(window.I18N.prop('FACILITY_SCHEDULE_EXCEPTION_DAY_DUPlICATED_DATE_EXIST'));
				return true;
			}
		},
		_betweenDate: function(currentStartDate, currentEndDate, startDate, endDate) {
			currentStartDate = typeof currentStartDate === 'string' ? currentStartDate : moment(currentStartDate).format('YYYY-MM-DD');
			currentEndDate = typeof currentEndDate === 'string' ?  currentEndDate : moment(currentEndDate).format('YYYY-MM-DD');
			startDate = typeof startDate === 'string' ? startDate : moment(startDate).format('YYYY-MM-DD');
			endDate = typeof endDate === 'string' ?  endDate : moment(endDate).format('YYYY-MM-DD');

			return moment(currentStartDate).isBetween(startDate, endDate, null, '[]') && moment(currentEndDate).isBetween(startDate, endDate, null, '[]') ||
            moment(startDate).isBetween(currentStartDate, endDate, null, '[]') && moment(endDate).isBetween(startDate, currentEndDate, null, '[]') ||
            moment(startDate).isBetween(currentStartDate, currentEndDate, null, '[]') && moment(currentEndDate).isBetween(startDate, endDate, null, '[]') ||
            moment(currentStartDate).isBetween(startDate, endDate, null, '[]') && moment(endDate).isBetween(currentStartDate, currentEndDate, null, '[]');
		},
		// _betweenDate: function(currentStartDate, currentEndDate, startDate, endDate) {
		// 	return moment(currentStartDate).isBetween(startDate, endDate, null, '[]') && moment(currentEndDate).isBetween(startDate, endDate, null, '[]');
		// },
		_compareDateFormating: function(startDate, endDate) {
			return moment(startDate).format('YYYY-MM-DD') + moment(endDate).format('YYYY-MM-DD');
		},
		_closeExceptionPopup: function(e){
			e.sender.trigger("onClose");
		},
		_initActionBtn: function(){
			var divAddBtn = this.wrapper.find('.schedule-actions-list .k-button.add'),
				divEditBtn = this.wrapper.find('.schedule-actions-list .k-button.edit'),
				divDeleteBtn = this.wrapper.find('.schedule-actions-list .k-button.delete'),
				that = this;

			divAddBtn.on('click', that._onActionAdd.bind(that));
			divEditBtn.on('click', that._onActionEdit.bind(that));
			divDeleteBtn.on('click', that._onActionDelete.bind(that));
		},
		_setPopupContents: function(type){
			var initData = {
				name: '',
				startDate: new Date(),
				endDate: new Date(),
				description: ''
			};
			var contentsData = type === 'edit' ? this.getCheckedDate()[0] : initData;
			var contentViewModel = this.popup.options.contentViewModel;
			if (type === 'edit') contentViewModel.id.value = contentsData.id;
			contentViewModel.name.value = contentsData.name;
			contentViewModel.startDate.value = contentsData.startDate;
			contentViewModel.endDate.value = contentsData.endDate;
			contentViewModel.repeatYear.checked = contentsData.repeatYear;
			contentViewModel.description.value = contentsData.description;
		},
		_setPopupTitle: function(type){
			var I18N = window.I18N;
			var title = type === 'add' ? I18N.prop('FACILITY_SCHEDULE_ADD_EXCEPTION_DAY') : I18N.prop('FACILITY_SCHEDULE_EDIT_EXCEPTION_DAY');
			this.popup.title(title);
		},
		_onActionAdd: function(){
			this.isEdit = false;
			this._setPopupTitle('add');
			this._setPopupContents('save');
			this.popup.open('save');
			this._initValidator();
		},
		_onActionEdit: function(){
			this.isEdit = true;
			this._setPopupTitle('edit');
			this._setPopupContents('edit');
			this.popup.open('edit');
			this._initValidator();
		},
		_onActionDelete: function(){
			var selectedEvt = this.getCheckedDate();
			var msg;
			var I18N = window.I18N;
			var that = this;
			msg = I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_CONFIRM");
			// if(selectedEvt.length > 1){
			// 	msg = I18N.prop("FACILITY_SCHEDULE_DELETE_MULTI_EXCEPTIONAL_DAY_CONFIRM", selectedEvt.length);
			// }else{
			// 	msg = I18N.prop("FACILITY_SCHEDULE_DELETE_EXCEPTIONAL_DAY_CONFIRM");
			// }
			this.confirmDialog.message(msg);
			this.confirmDialog.setConfirmActions({
				yes : function(){
					that.trigger('onDelete', selectedEvt);
					that.viewModel.actions.edit.set('enabled', false);
					that.viewModel.actions.delete.set('enabled', false);
				}
			});
			this.confirmDialog.open();
		},
		_initGrid: function(){
			var I18N = window.I18N;
			var that = this;
			var nameWidth = this.isRepeat ? 320 : 400;
			var columns = [{
				field: "name",
				title: I18N.prop('COMMON_NAME'),
				width: nameWidth
			}, {
				field: "period",
				title: I18N.prop('FACILITY_SCHEDULE_PERIOD'),
				width: 193,
				template: function(dataItem) {
					return "<span>" + kendo.htmlEncode(moment(dataItem.startDate).format('YYYY-MM-DD')) + "</span><span> ~ </span><span>" + kendo.htmlEncode(moment(dataItem.endDate).format('YYYY-MM-DD')) + "</span>";
				}
			}, {
				field: "repeatYear",
				title: I18N.prop('FACILITY_SCHEDULE_REPEAT'),
				width: 131,
				template: function(dataItem) {
					return dataItem.repeatYear ? I18N.prop('FACILITY_SCHEDULE_PERIOD_YEAR') : '';
				}
			}, {
				field: "description",
				title: I18N.prop('COMMON_DESCRIPTION'),
				width: 433,
				template: function(dataItem) {
					var desc = dataItem.description || "";
					return "<span class='grid-cell-one-line-ellipsis'>" + desc + "</span>";
				}
			}];
			if (!this.isRepeat) columns.splice(2, 1);
			var divGrid = this.wrapper.find('.exception-grid'),
				optsObj = {
					columns: columns,
					hasCheckedModel : true,
					setCheckedAttribute : true,
					resizable: false,
					noRecords: {
						template: "<div class='no-records-text'>" + I18N.prop('FACILITY_SCHEDULE_NO_EXCEPTION_DAY') + "</div>"
					}
				};
			if (this.resizable) optsObj.resizable = this.resizable;
			divGrid.empty();
			that.grid = divGrid.kendoGrid(optsObj).data('kendoGrid');
			that.grid.bind("checked", function(e){
				that._actionBtnEnabled(e);
			});
		},
		_initValidator: function(){
			var I18N = window.I18N;
			var privateFlagValueChange = false;
			var maxLengthName = 30;
			var maxLengthDesc = 300;
			var detailPopup = this.popup;
			var validatorName = detailPopup.element.find('.value[data-type="name"]').data('kendoCommonValidator');
			var validatorDesc = detailPopup.element.find('.value[data-key="description"]').data('kendoCommonValidator');
			validatorDesc.setOptions({
				messages: {
					maxLength : function(){
						return I18N.prop("COMMON_CANNOT_INPUT_MAX_MORE", maxLengthDesc);
					}
				}
			});
			validatorName.setOptions({
				messages: {
					required: function(){
						return '';
					},
					maxLength : function(){
						return I18N.prop("COMMON_CANNOT_INPUT_MAX_MORE", maxLengthName);
					}
				},
				rules: {
					required: function(e){
						var val = e.val();
						if (!flagValueChange) {
							detailPopup.setActions(ACTION_ENUM.SAVE, { disabled : val === '' });
							return true;
						}
						return val.trim().length > 0;
						// if (e.val().length > 0 && !flagValueChange) flagValueChange = true;
						// else if(!flagValueChange) return true;
						// var val = e.val().trim;
						// return val.length > 0;
					},
					maxLength: function(e){
						// if (!flagValueChange) return true;
						// var val = e.val().trim();
						// return val.length <= 30 && val.length > 0;

						if (e.val().length > 0 && !privateFlagValueChange) privateFlagValueChange = true;
						else if(!privateFlagValueChange) return true;
						var val = e.val().trim();
						// return val.length <= 30 && val.length > 0;
						return val.length <= 30;
					}
				}
			});
		},
		_enableSaveBtnCondition: function(e) {
			var name = this.element.find('div.common-validator[data-type=name] input')[0];
			var description = this.element.find('div.common-validator[data-type=description] input')[0];
			if(description.value.length <= 300 && (name.value.length <= 30 && name.value.length > 0)) return true;
			return false;
		},
		_actionBtnEnabled: function(e) {
			var checkedData = this.getCheckedDate();
			if (e) var item = e.item;
			var checkedCount = checkedData.length;
			if (checkedCount > 0) {
				this.viewModel.actions.edit.set('enabled', true);
				this.viewModel.actions.delete.set('enabled', true);
			}
			if (checkedCount >= 2) {
				this.viewModel.actions.edit.set('enabled', false);
			}
			if (checkedCount <= 0) {
				this.viewModel.actions.edit.set('enabled', false);
				this.viewModel.actions.delete.set('enabled', false);
			}
			this.trigger('onChecked', { checkedData: checkedData, item: item });
		},
		_checkCount: function() {
			var checkedData = this.getCheckedDate();
			return checkedData.reduce(function (acc, cur) {
				return cur.checked ? acc + 1 : acc + 0;
			}, 0);
		},
		_attchEvent: function(){
			var that = this,
				wrapper = that.wrapper;
			if(this.resizable) {
				$(window).on("resize", function() {
					kendo.resize(wrapper);
				});
			}
		},
		_onChangeName: function(e){
			// console.log(e);
		},
		/**
		*   <ul>
		*   <li>날짜가 미래를 초과하는지 확인하는 함수</li>
		*   </ul>
		*   @function _checkDateIsBeforeToday
		*   @param {Object}date - 선택한 날짜값
		*   @returns {void}
		*/
		_checkDateIsBeforeToday: function(date){
			var now = moment(new Date()); //todays date
			var end = moment(date); // another date
			var duration = moment.duration(now.diff(end));
			var days = duration.asDays();
			if(days <= 0 ){
				return false;
			}
			return true;
		},
		/**
		*   <ul>
		*   <li>시작날짜과 종료날짜값을 확인하여 시작날짜값이 종료날짜값을 이상인지 확인하는함수</li>
		*   </ul>
		*   @function _checkStartDateEndDateTimePicker
		*   @param {Object}startDateTime -  시작날짜값
		*   @param {Object}endDateTime - 종료날짜값
		*   @returns {void}
		*/
		_checkStartDateEndDateTimePicker: function(startDateTime, endDateTime){
			var sm = moment(startDateTime);
			var em = moment(endDateTime);
			if(em.isBefore(sm) || sm.format("YYYYMMDDHHMM") == em.format("YYYYMMDDHHMM")){
				return false;
			}
			return true;
		},
		_onChangeStartDate: function(e){
			var endDate = this.endDate.value,
				selectedDate = e.sender.selectedDate;
			var isBeforeToday = this._checkDateIsBeforeToday(selectedDate);
			if (isBeforeToday) this.startDate.set('value', new Date());
			var isCurrentStartDateBeforeEndDate = this._checkStartDateEndDateTimePicker(this.startDate.value, endDate);
			if (!isCurrentStartDateBeforeEndDate) this.endDate.set('value', this.startDate.value);
		},
		_onChangeEndDate: function(e){
			var startDate = this.startDate.value,
				selectedDate = e.sender.selectedDate;
			var isBeforeToday = this._checkDateIsBeforeToday(selectedDate);
			if (isBeforeToday) this.endDate.set('value', new Date());
			var isCurrentStartDateBeforeEndDate = this._checkStartDateEndDateTimePicker(startDate, this.endDate.value);
			if (!isCurrentStartDateBeforeEndDate) this.startDate.set('value', this.endDate.value);
		},
		_onChangeDesc: function(e){
			// console.log(e);
		},
		setDataSource: function(data){
			if(!data){
				data = [];
			}
			this.data = data;
			this.grid.setDataSource(data);
			// this.grid.dataSource.sort({ field: "", dir: "desc" });
		},
		getCheckedDate: function(){
			return this.grid.getCheckedData();
		}
	});

	ui.plugin(exceptionDayList);
})(jQuery);
//# sourceURL=schedule/widget/exception-day-list.js