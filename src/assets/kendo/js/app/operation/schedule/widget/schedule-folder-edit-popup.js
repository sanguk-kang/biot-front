(function(window, $){
	"use strict";
	var kendo = window.kendo, Widget = kendo.ui.Widget;
	var CommonDialog = kendo.ui.CommonDialog;
	var ACTION_ENUM = {
		CLOSE: 0,
		SAVE: 1
	};
	var ScheduleFolderEditPopup = kendo.ui.CommonDialog.extend({
		options: {
			name: "ScheduleFolderEditPopup",
			height: 254,
			width : 508,
			type: "single",
			timeout: 0,
			events : [
				"onSave",
				"onSaved",
				"onClose",
				"onClosed"
			],
			folderApiURL: {
				// 임시 백엔드 교체후 수정
				post: "/schedules/lists",
				patch: "/schedules/lists/"
			},
			contentViewModel: kendo.observable({
				fieldName: "Name",
				id: null,
				value: "",
				folderNameValidator: {
					widget: null
				}
			})
		},

		init: function(element, options) {
			var self = this;

			self._initConent(options);
			self._initActions(options);
			CommonDialog.fn.init.call(self, element, options);
			self._renderTemplate();
			self._initValidtorComponent();
		},

		_renderTemplate: function() {
			var self = this;
			var contentViewModel = self.options.contentViewModel;
			var detailpopupElem = null;
			var I18N = window.I18N;

			var TEMPLATE = '<div class="schedule-folder-edit-popup-content-wrapper k-content">' +
				'<div class="field-name" data-bind="text: fieldName">' +
				'</div>' +
				'<div class="input-wrapper">' +
				'<input id="folder-name-validator" class="k-input" type="text" data-bind="value: value" placeholder="' + I18N.prop('FACILITY_SCHEDULE_NEW_FOLDER_PLACEHOLDER') + '"></input>' +
				'</div>' +
			'</div>';

			self.template = TEMPLATE;
			self.element.html(self.template);
			detailpopupElem = self.element.find('.schedule-folder-edit-popup-content-wrapper');

			kendo.bind(detailpopupElem, contentViewModel);
		},

		_initConent : function() {
			var self = this;
			var I18N = window.I18N;

			self.options.title = I18N.prop("FACILITY_SCHEDULE_CREATE_FOLDER");
			self.options.contentViewModel.fieldName = I18N.prop("FACILITY_SCHEDULE_CREATE_FOLDER_NAME");
		},

		_initValidtorComponent: function() {
			var self = this;
			var I18N = window.I18N;
			var contentViewModel = self.options.contentViewModel;
			var folderNameValidator = contentViewModel.folderNameValidator;
			var maxLength = 30;

			var options = {
				type: "name",
				rules: {
					duplicatedRule: function(input) {
						return true;
					},
					requiredNoMsg: function(e){
						return true;
					},
					maxLengthCustomMsg: function(e){
						var val = e.val().trim();
						return val.length <= 30;
					}
				},
				messages: {
					duplicatedRule: I18N.prop("FACILITY_SCHEDULE_DUPlICATED_NAME_EXIST"),
					requiredNoMsg: "",
					maxLengthCustomMsg : I18N.prop("COMMON_CANNOT_INPUT_MAX_MORE", maxLength)
				}
			};

			folderNameValidator.widget = $("#folder-name-validator").kendoCommonValidator(options).data("kendoCommonValidator");
			folderNameValidator.widget.element.on("blur", function(e){
				if(!self.wrapper.find(".k-dialog-buttongroup button").eq(1).prop('disabled')) {
					folderNameValidator.widget.validate("requiredNoMsg", $(e.target).val() == "" && contentViewModel.value != "");
				}
			});
			folderNameValidator.widget.bind('validate', function(e) {
				self.setActions(ACTION_ENUM.SAVE, {disabled: !e.valid});
				if(e.sender.element.val() == "") self.setActions(ACTION_ENUM.SAVE, {disabled: true});
			});
		},
		_validateRequired: function() {
			var self = this;
			var I18N = window.I18N;
			var contentViewModel = self.options.contentViewModel;
			var folderNameValidator = contentViewModel.folderNameValidator;
			var result = false;
			result = folderNameValidator.widget.element.val().trim().length == 0;
			folderNameValidator.widget.validate('requiredNoMsg', result);
			return result;
		},
		_initActions : function(){
			var I18N = window.I18N;
			var LoadingPanel = window.CommonLoadingPanel;
			var Loading = new LoadingPanel();
			var self = this;

			var actions = [
				{
					text : I18N.prop("COMMON_BTN_CLOSE"),
					action : function(e){
						e.sender.trigger("onClose");
					}
				},
				{
					text : I18N.prop("COMMON_BTN_SAVE"),
					disabled : true,
					action : function(e){
						var contentViewModel = self.options.contentViewModel;
						var value = contentViewModel.get("value");
						var id = contentViewModel.get("id");
						var folderNameValidator = contentViewModel.folderNameValidator;
						var req = id ? self._reqPatchcheduleFolder : self._reqPostScheduleFolder;

						// 폴더이름 required 유효성 검사.
						if(self._validateRequired()) return false;

						// 앞뒤 입력된 공백 문자 저장시, 트림(trim) 처리.
						value = $.trim(value);
						// 서버 생성 요청.
						Loading.open(self.element);
						req.call(self, value, id).done(function(res) {
							self.close();
						}).fail(function(error) {
							folderNameValidator.widget.validate('duplicatedRule', true);
						}).always(function(){
							Loading.close();
							e.sender.trigger("onSave");
						});
						return false;
					}
				}
			];

			self.options.actions = actions;
		},
		// 다이얼로그가 열리고, 입력창에 기본 New folder 텍스트명 설정
		open : function(loadedFolderModel) {
			var self = this;
			var folderNameValidator = self.options.contentViewModel.folderNameValidator.widget;
			CommonDialog.fn.open.call(this);
			if (loadedFolderModel) {
				self.options.contentViewModel.set("id", loadedFolderModel.id);
				self.options.contentViewModel.set("value", loadedFolderModel.name);
			}

			self.setActions(ACTION_ENUM.SAVE, {disabled: !self.options.contentViewModel.get('id') });
			folderNameValidator.hideMessages();

		},
		close : function() {
			this.options.contentViewModel.set("id", null);
			this.options.contentViewModel.set("value", "");
			CommonDialog.fn.close.call(this);
		},

		_reqPostScheduleFolder: function(name) {
			console.info("reqPostScheduleFolder");
			var self = this;
			var url = self.options.folderApiURL.post;
			var data = {
				"name": name
			};
			return $.ajax({
				url: url,
				method: "POST",
				data: data
			});
		},
		_reqPatchcheduleFolder: function(name, id) {
			console.info("reqPatchcheduleFolder");
			var self = this;
			var url = self.options.folderApiURL.patch + id;
			var data = {
				"name": name
			};
			return $.ajax({
				url: url,
				method: "PATCH",
				data: data
			});
		}
	});

	kendo.ui.plugin(ScheduleFolderEditPopup);

})(window, jQuery);
//# sourceURL=schedule/widget/schedule-folder-edit-popup.js
