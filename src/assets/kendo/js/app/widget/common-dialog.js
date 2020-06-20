/**
*
*   <ul>
*       <li>메시지, Confirm Dialog 및 Single/Multi Detail Dialog UI Component</li>
*       <li>메시지, Confirm Dialog는 Kendo UI 의 Dialog Widget을 상속받아 확장 구현되었다.</li>
*       <li>Single/Multi Detail Dialog는 메시지, Confirm Dialog Widget을 상속받아 확장 구현되었다.</li>
*   </ul>
*   @module app/widget/common-dialog
*   @requires lib/kendo.all
*
*/

(function(window, $){
	"use strict";

	var kendo = window.kendo,
		template = kendo.template,
		proxy = $.proxy,
		NS = 'kendoWindow',
		WIDTH = 'width', HUNDREDPERCENT = 100,
		Util = window.Util,
		keys = kendo.keys;

	var templates = {
		wrapper: template('<div class=\'k-widget k-dialog k-window\' role=\'dialog\' />'),
		action: template('<button type=\'button\' class=\'k-button# if (data.primary) { # k-primary# } role=\'button\' #\'></button>'),
		titlebar: template('<div class=\'k-window-titlebar k-dialog-titlebar k-header\'>' + '<span class=\'k-window-title k-dialog-title\'>#= title #</span>' + '</div>'),
		close: template('<a role=\'button\' href=\'\\#\' class=\'k-button-bare k-dialog-action k-dialog-close\' title=\'#= messages.close #\' aria-label=\'#= messages.close #\' tabindex=\'-1\'><span class=\'k-icon k-i-close\'></span></a>'),
		actionbar: template('<div class=\'k-dialog-buttongroup k-dialog-button-layout-#= buttonLayout #\' role=\'toolbar\' />'),
		overlay: '<div class=\'k-overlay\' />',
		alertWrapper: template('<div class=\'k-widget k-dialog k-window\' role=\'alertdialog\' />'),
		alert: '<div />',
		confirm: '<div />',
		prompt: '<div />',
		promptInputContainer: '<div class=\'k-prompt-container\'><input type=\'text\' class=\'k-textbox\' /></div>'
	};

	var Dialog = kendo.ui.Dialog;
	var widget = Dialog.extend({
		//디폴트 옵션
		options: {
			name : "CommonDialog",
			type : "message",
			animation : false,
			closable : false,
			visible : false,
			timeout : 5000,
			saveOnlyVisibleField : false,
			replaceNewLine : true,
			enableSaveBtnOnInputChange : true,
			invalidScrollFieldClass : ".detail-dialog-content-field-item",
			invalidScrollWrapperClass : ".detail-dialog-detail-content",
			invalidScrollFieldListClass : ".detail-dialog-detail-content-field-list",
			message : "",
			templates: {
				"contBox": "<div class='pop-confirm-contbox'></div>",
				"imgBox": "<div class='pop-confirm-imgbox'><span class='pop-confirm-img'></span></div>",
				"detailBox": "<div class='pop-confirm-detailbox'></div>"
			},
			width: "560px",
			height: "250px",
			title : "COMMON_DIALOG_NOTIFICATION",
			confirmActions : {
				yes : null,
				no : null
			},
			closeAction : null,
			typeActions : {
				message :[
					{
						text : "COMMON_DIALOG_BUTTON_OK",
						action: function(e){
							e.sender.close();
						}
					}
				],
				confirm :[
					{
						text : "COMMON_DIALOG_BUTTON_NO",
						action: function(e){
							e.sender.close();
						}
					},
					{
						text : "COMMON_DIALOG_BUTTON_YES",
						action: function(e){
							e.sender.close();
						}
					}
				]
			}
		},
		init : function(element, options){
			var messageBox, confirmActions, dialogType, self = this;
			//한글 적용
			var I18N = window.I18N;
			//제목
			var title = self.options.title;
			if(title == "COMMON_DIALOG_NOTIFICATION"){
				self.options.title = I18N.prop(title);
			}
			//버튼
			var typeActions = self.options.typeActions;
			var btnText = typeActions.message[0].text;
			if(btnText == "COMMON_DIALOG_BUTTON_OK"){
				typeActions.message[0].text = I18N.prop(btnText);
			}
			btnText = typeActions.confirm[0].text;
			if(btnText == "COMMON_DIALOG_BUTTON_NO"){
				typeActions.confirm[0].text = I18N.prop(btnText);
			}
			btnText = typeActions.confirm[1].text;
			if(btnText == "COMMON_DIALOG_BUTTON_YES"){
				typeActions.confirm[1].text = I18N.prop(btnText);
			}

			options = $.extend({}, self.options, options);
			var contBoxTmp = $(options.templates.contBox);
			var detailBoxTmp = $(options.templates.detailBox);
			//contBoxTmp.append(imgBoxTmp);
			contBoxTmp.append(detailBoxTmp);

			//Apply Message
			if(options.message || options.message == ""){
				if(options.replaceNewLine && options.message){
					options.message = options.message.replace(/\n/g, "<br />");
				}
				messageBox = $("<p/>").addClass("pop-confirm-message").html(options.message);
				detailBoxTmp.append(messageBox);
			}

			//Apply content
			if(options.content){
				detailBoxTmp.html(options.content);
			}

			var children = $(element).children();
			if(children.length > 0){
				contBoxTmp.append(children);
			}
			options.content = contBoxTmp;

			//Apply Action in case of type
			dialogType = options.type;

			//Apply default actions
			if(!options.actions || options.actions.length < 1){
				options.actions = options.typeActions[dialogType];
			}

			//Apply confirm actions
			confirmActions = options.confirmActions;
			if(dialogType == "confirm"){
				if(confirmActions.yes && $.isFunction(confirmActions.yes)){
					options.actions[1].action = function(e){
						var senderOpt = e.sender.options;
						var isClose = true;
						if(senderOpt.confirmActions && senderOpt.confirmActions.yes){
							isClose = senderOpt.confirmActions.yes.call(this, e);
						}

						if(isClose === false){
							return false;
						}
						e.sender.close();
					};
				}else{
					confirmActions.yes = options.actions[1].action;
				}

				if(confirmActions.no && $.isFunction(confirmActions.no)){
					options.actions[0].action = function(e){
						var senderOpt = e.sender.options;
						var isClose = true;
						if(senderOpt.confirmActions && senderOpt.confirmActions.no){
							isClose = senderOpt.confirmActions.no.call(this, e);
						}

						if(isClose === false){
							return false;
						}
						e.sender.close();
					};
				}else{
					confirmActions.no = options.actions[0].action;
				}
			}

			//부모 함수 호출
			Dialog.fn.init.call(self, element, options);

			//Apply Style
			var wrapperElem = $(self.wrapper);
			wrapperElem.addClass("pop-confirm");

			//Apply title
			wrapperElem.find(".k-dialog-title").text(self.options.title);

			// Add close button
			var closeBtn = $("<span class='pop-confirm-btn-close ic ic-close'></span>");
			wrapperElem.append(closeBtn);

			this.closeBtn = closeBtn;

			//Close Button Event
			if(options.closeAction){
				closeBtn.on("click", options.closeAction.bind(self, {sender : self} ));
			}else if(dialogType == "confirm"){
				//close btn == no btn click event
				closeBtn.on("click", options.actions[0].action.bind(self, {sender : self}));
			}else{
				closeBtn.on("click", this.closeBtnEvt.bind(self, {sender : self }));
			}

			self.messageBox = $(self.element).find(".pop-confirm-message");
			self.messageBox.css("margin-left", "4px");

			//키보드 이벤트
			self.wrapper.on("keydown", self._keyHandler.bind(self));
		},
		_keyHandler : function(e){
			var self = this, code = e.keyCode;
			var options = self.options;
			if(code == keys.ESC){
				self.closeBtn.trigger("click");
			}else if(code == keys.ENTER){
				if(options.type == "confirm"){
					self.options.actions[1].action.call(self, { sender : self });
				}else if(options.type == "message"){
					self.options.actions[0].action.call(self, { sender : self });
				}
			}
		},
		/**
		*   <ul>
		*   <li>Dialog를 Open한다.</li>
		*   </ul>
		*   @function open
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		open : function(){
			Dialog.fn.open.call(this);
			var options = this.options;
			if(options.type == "message"){
				if(options.timeout){
					var that = this;
					that.timeout = setTimeout(function(){
						that.close();
					}, options.timeout);
				}
			}
		},
		/**
		*   <ul>
		*   <li>Dialog를 Close한다.</li>
		*   </ul>
		*   @function close
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		close : function(){
			Dialog.fn.close.call(this);
			if(this.timeout){
				clearTimeout(this.timeout);
				this.timeout = null;
			}
		},
		_createActionbar: function (wrapper) {
			var isStretchedLayout = this.options.buttonLayout === 'stretched';
			var buttonLayout = isStretchedLayout ? 'stretched' : 'normal';
			var actionbar = $(templates.actionbar({ buttonLayout: buttonLayout }));
			this._addButtons(actionbar);
			if (isStretchedLayout) {
				this._normalizeButtonSize(actionbar);
			}
			wrapper.append(actionbar);
		},
		/**
		*   <ul>
		*   <li>actions 옵션에 따라 버튼을 생성하고, 버튼에 Event를 바인딩한다.</li>
		*   </ul>
		*   @function _addButtons
		*	@param {kendoJqueryObject} actionbar - 액션바 객체
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_addButtons: function (actionbar) {
			var that = this, o = that.options, actionClick = proxy(that._actionClick, that), actionKeyHandler = proxy(that._actionKeyHandler, that), actions = that.options.actions, length = actions.length, buttonSize = HUNDREDPERCENT / length, action, text, disabled, visible;
			that.buttons = [];
			for (var i = 0; i < length; i++) {
				action = actions[i];
				if(!action){
					that.buttons.push(null);
					continue;
				}
				disabled = action.disabled;
				visible = action.visible;
				text = that._mergeTextWithOptions(action);

				var btn = $(templates.action(action)).autoApplyNS(NS).html(text).appendTo(actionbar).data('action', action.action).on('click', actionClick).on('keydown', actionKeyHandler).prop("disabled", disabled);
				that.buttons.push(btn);
				if(visible === true){
					btn.show();
				}else if(visible === false){
					btn.hide();
				}
				if (o.buttonLayout === 'stretched') {
					btn.css(WIDTH, buttonSize + '%');
				}
			}
		},
		/**
		*   <ul>
		*   <li>메시지/Confirm 다이얼로그에 표시될 메시지를 Set한다.</li>
		*   </ul>
		*   @function message
		*   @param {String}message - 메시지 String
		*   @returns {jQueryElement} - 메시지가 표시되는 요소
		*   @alias module:app/widget/common-dialog
		*
		*/
		message : function(message){
			if(this.options.replaceNewLine && message){
				message = message.replace(/\n/g, "<br />");
			}
			return this.messageBox.html(message);
		},
		/**
		*   <ul>
		*   <li>버튼의 이벤트, 텍스트, 표시/미표시 상태, 활성화/비활성화 상태를 Set한다.</li>
		*   </ul>
		*   @function setActions
		*   @param {Number}index - 설정할 버튼의 Index
		*   @param {Object}action - 설정할 옵션이 담긴 객체
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setActions : function(index, action){
			var btn, buttons = this.buttons;
			btn = buttons[index];
			if(!btn){
				console.info("there is no button for index " + index);
				return;
			}
			if(action.action){
				btn.data('action', action.action);
			}

			if(action.text){
				btn.text(this._mergeTextWithOptions(action));
			}

			if(action.visible === true){
				btn.show();
			}else if(action.visible === false){
				btn.hide();
			}

			if(typeof action.disabled !== "undefined"){
				btn.prop("disabled", action.disabled);
			}
		},
		/**
		*   <ul>
		*   <li>Confirm Dialog의 yes, no 버튼에 대한 이벤트를 Set 한다.</li>
		*   </ul>
		*   @function setConfirmActions
		*   @param {Object}confirmActions - Set할 이벤트 함수가 담긴 객체
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setConfirmActions : function(confirmActions){
			if(this.options.type != "confirm"){
				console.error("this is not confirm type popup.");
				return;
			}

			/*var actions = this.options.actions;
			if(confirmActions.yes && $.isFunction(confirmActions.yes)){
				actions[1].action = function(e){
					confirmActions.yes.call(this, e);
					e.sender.close();
				};
			}

			if(confirmActions.no && $.isFunction(confirmActions.no)){
				actions[0].action = function(e){
					confirmActions.no.call(this, e);
					e.sender.close();
				};
			}

			this.setOptions({actions : actions});*/
			$.extend(this.options.confirmActions, confirmActions);
		},
		/**
		*   <ul>
		*   <li>닫기 버튼에 대한 이벤트를 Set 한다.</li>
		*   </ul>
		*   @function setCloseAction
		*   @param {Function}callback - 닫기 버튼 클릭 시, 호출될 Callback 함수
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setCloseAction : function(callback){
			var options = this.options;
			options.closeAction = callback;
			var dialogType = options.type;
			this.closeBtn.off();
			if(callback){
				this.closeBtn.on("click", options.closeAction.bind(this, {sender : this} ));
			}else if(dialogType == "confirm"){
				this.closeBtn.on("click", options.actions[0].action.bind(this, {sender : this}));
			}else{
				this.closeBtn.on("click", this.closeBtnEvt.bind(this, {sender : this }));
			}
		},
		closeBtnEvt : function(){
			this.close();
		},
		destroy : function(){
			//부모 함수 호출
			Dialog.fn.destroy.call(this);
		}
	});

	//jQuery를 통해 요소에서 호출할 수 있도록 플러그인 등록
	kendo.ui.plugin(widget);

	var moment = window.moment;
	var CommonDialog = kendo.ui.CommonDialog;
	widget = CommonDialog.extend({
		options: {
			name : "DetailDialog",
			type : "single",
			listTemplate : "",
			hasDetail : true,
			NotAllowedBlankFields : ["mobilePhoneNumber", "email"],
			//type
			//"email" = (input type=email)
			//"string" - (input type=text),
			//"select" - (dropdownlist),
			//"datetime"(moment.js) - (calendar)
			//"number"(numerictextbox), ""
			//"template"(+button)
			//"object", nested object
			timeout : 0,
			dataSource : [],
			contentViewModel : null,
			buttonsIndex : {
				SAVE : 0,
				EDIT : 1,
				CANCEL : 2,
				DELETE : 3,
				CLOSE : 4
			},
			initialCollapse : true,
			parseSaveData : null,
			//async callback
			setAdditionalDetailData : null,
			events : [
				"onSave",
				"onSaved",
				"onEdit",
				"onEdited",
				"onClose",
				"onClosed",
				"onDelete",
				"onDeleted",
				"onCancel",
				"onCanceled",
				"onRegister",
				"onDeregister",
				"onDelete",
				"onBlock",
				"onChangeButtons",
				"onChecked",
				"beforeSetDetailData",
				"afterSetDetailData",
				"collapse",
				"expand"
			]
		},
		init : function(element, options){
			//부모 함수 호출
			var self = this;
			if(options.buttonsIndex){
				self.options.buttonsIndex = $.extend({}, options.buttonsIndex);
			}
			this._createDefaultActions(options);

			CommonDialog.fn.init.call(self, element, options);

			this.BTN = $.extend({}, self.options.buttonsIndex);

			this._createDataSource(self.options.dataSource);

			var content = self.element.find(".detail-dialog-content");
			if(content.length > 0){
				self.content(content);
				self._createContent();
			}else{
				self.content(self._createContent());
			}

			self.confirmDialog = $("<div/>").kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");
			self.msgDialog = $("<div/>").kendoCommonDialog().data("kendoCommonDialog");

			self.setCloseAction(function(){
				self._cancelEvent({ sender : self }, true);
			});
			/*self.setCloseAction(function(){
				self.setEditable(false);
				self.close();
			});*/
			//content 생성
		},
		_keyHandler : function(e){
			var self = this, code = e.keyCode;
			var options = self.options, buttons = self.buttons;
			if(code == keys.ESC){
				self.closeBtn.trigger("click");
				return false;
			}else if(code == keys.ENTER){
				var saveBtnIndex = self.BTN.SAVE;
				var saveBtn = buttons[saveBtnIndex];
				var saveBtnOption = options.actions[saveBtnIndex] ? options.actions[saveBtnIndex] : {};
				var saveBtnVisible = saveBtn ? saveBtn.is(":visible") : saveBtnOption.visible;
				var saveBtnAction = saveBtn ? saveBtn.data('action') : saveBtnOption.action;

				var disabled = self.buttons[saveBtnIndex].prop("disabled");
				if(typeof saveBtnIndex !== "undefined" && saveBtnAction && !disabled && saveBtnVisible){
					saveBtnAction.call(self, { sender : self });
				}
				return false;
			}
		},
		_defaultCancelEvent : function(e){
			e.sender.trigger("onCancel");
			e.sender.cancel();
			if(e.sender.isEditable) e.sender.setEditable(false);
			e.sender.hideInvalidMessage();
			e.sender.hideRemoveBtn();
			e.sender.trigger("onCanceled");
		},
		/**
		*   <ul>
		*   <li>삼세 팝업에서 취소 버튼 클릭 시, Default로 호출되는 Callback 함수</li>
		*   </ul>
		*   @function _cancelEvent
		*	@param {Event} e - 이벤트 객체
		*   @param {Boolean}isCloseEvt - 닫기 버튼 클릭 여부
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_cancelEvent : function(e, isCloseEvt){
			var I18N = window.I18N;
			if(e.sender.hasChanged){
				e.sender.confirmDialog
					.message(I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_CANEL"));
				e.sender.confirmDialog.setConfirmActions({
					yes : function(){
						e.sender._defaultCancelEvent(e);
						if(isCloseEvt){
							e.sender.close();
							e.sender.trigger("onClosed");
						}
					}
				});
				e.sender.confirmDialog.open();
			}else{
				try{
					e.sender._defaultCancelEvent(e);
				}catch(err){
					console.error("Common Detail Dialog default cancel event exception");
				}
				if(isCloseEvt){
					e.sender.close();
					e.sender.trigger("onClosed");
				}
			}

			return false;
		},
		/**
		*   <ul>
		*   <li>Default로 각 버튼(저장, 취소, 편집, 삭제 등)의 테스트 및 Event를 설정한다. Option이 존재할 경우 Option 값으로 설정한다.</li>
		*   </ul>
		*   @function _createDefaultActions
		*   @param {Object}options - 버튼 설정 옵션 객체
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_createDefaultActions : function(options){
			var I18N = window.I18N;
			/*COMMON_BTN_SAVE = Save
			COMMON_BTN_CANCEL = Cancel
			COMMON_BTN_EDIT = Edit
			COMMON_BTN_UPLOAD = Upload
			COMMON_BTN_DELETE = Delete*/

			var actions = [
				{
					text : I18N.prop("COMMON_BTN_SAVE"),
					visible : false,
					disabled : true,
					action : function(e){
						e.sender.trigger("onSave");
						//save trigger save with selected data
						var result = e.sender.save();
						if(result){
							e.sender.trigger("onSaved", { sender : e.sender, result : result });
							e.sender.setEditable(false);
						}
						return false;
					}
				},
				{
					text : I18N.prop("COMMON_BTN_EDIT"),
					action : function(e){
						e.sender.trigger("onEdit");
						e.sender.setEditable(true);
						e.sender.trigger("onEdited");
						return false;
					}
				},
				{
					text : I18N.prop("COMMON_BTN_CANCEL"),
					visible : false,
					action : this._cancelEvent
				},
				{
					text : I18N.prop("COMMON_BTN_DELETE"),
					action : function(e){
						//Confirm and
						//yes -> trigger delete with selected data
						var selectedData = e.sender.getSelectedData();
						e.sender.trigger("onDelete", selectedData);
						//no
						//message
						return false;
					}
				},
				{
					text : I18N.prop("COMMON_BTN_CLOSE"),
					visible : true,
					action : function(e){
						e.sender.trigger("onClose");
						if(e.sender.isEditable){
							e.sender.setEditable(false);
						}
						//e.sender.close();
						e.sender.trigger("onClosed");
					}
				}
			];

			if(options.hasDelete == false){
				actions[3] = null;
			}

			if(options.actions){
				if(options.isCustomActions){
					actions = options.actions;
				}else{
				//버튼 추가 및 INDEX 5번부터 임의의 버튼 제어 가능
					var i, max = options.actions.length;
					for( i = 0; i < max; i++ ){
						actions.push(options.actions[i]);
					}
				}
			}

			this.options.actions = options.actions = actions;
		},
		/**
		*   <ul>
		*   <li>Detail Dialog의 컨텐츠를 생성한다.</li>
		*   </ul>
		*   @function _createContent
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_createContent : function(){
			var self = this;
			var contentTemplate = self.options.contentTemplate;
			if(contentTemplate){
				self.element.html(contentTemplate);
			}

			var div, content = self.element.find(".detail-dialog-content");
			if(content.length > 0){
				div = content;
			}else{
				div = $("<div/>").addClass("detail-dialog-content");
			}
			this.contentElem = div;
			var headerTemplate, listTemplate, headerTemplateElem,
				detailContentTemplate;

			var isOnlyMulti = this.options.isOnlyMulti;
			var originalData, newDs;
			//default index
			this.selectedIndex = 0;
			this.virtualization = false;
			if(this.dataSource.total() <= 1 && !isOnlyMulti){
			//if(type == "single"){
				this.contentElem.removeClass("multi");
				if(this.grid){
					this.gridElem.remove();
					this.grid = null;
					this.gridElem = null;
				}

				self._renderHeaderTemplate();
				headerTemplateElem = this.detailHeaderElem;

				self._createSingleDetailContentTemplate();
				detailContentTemplate = this.detailContent;

				if(div.has(headerTemplateElem).length < 1){
					div.append(headerTemplateElem);
				}

				if(div.has(detailContentTemplate).length < 1){
					div.append(detailContentTemplate);
				}

				//Detail 정보를 AJAX로 추가적인 데이터를 구성해야할 때의 옵션
				var additionalData = this.options.setAdditionalDetailData;
				var reqArr = [];
				//옵션이 존재하며, Deferred 임을 체크
				if(additionalData && $.isFunction(additionalData)){
					var data = this.getSelectedData();
					if(data){
						var dfd = additionalData.call(this, data);
						if(dfd.promise){
							reqArr.push(dfd);
						}
					}
				}

				$.when.apply(this, reqArr).always(function(){
					self._setSingleDetailData();
				});
			}else{
				this.contentElem.addClass("multi");

				var groupListOptions = self.options.groupListOptions;
				var ds = this.dataSource;
				var dialogContentHeader = self.element.find(".detail-dialog-header");
				var hasDetail, pageSize;
				if(groupListOptions){
					var groupListElem = $("<div/>").addClass("detail-dialog-group-list");

					headerTemplate = self.options.headerTemplate;
					if(headerTemplate){
						headerTemplate = kendo.template(headerTemplate);
						headerTemplate = headerTemplate({ count : self.dataSource.total() });
						dialogContentHeader.html(headerTemplate);
					}

					this.detailHeader = dialogContentHeader;
					groupListOptions.height = "calc(100% - 60px)";

					this.groupList = groupListElem.kendoDeviceTabGroupGrid(groupListOptions).data("kendoDeviceTabGroupGrid");

					originalData = ds.data();
					originalData = originalData.toJSON();

					newDs = new kendo.data.DataSource({
						data : originalData,
						pageSize : ds.pageSize()
					});
					newDs.read();
					this.groupList.setDataSource(newDs);
					div.append(groupListElem);
				}else{
					var gridElem = $("<div/>").addClass("detail-dialog-grid");
					hasDetail = self.options.hasDetail;
					var gridOptions = self.options.gridOptions;
					var columns;
					if(gridOptions){
						columns = gridOptions.columns;
						if(gridOptions.scrollable && gridOptions.scrollable.virtual){
							this.contentElem.addClass("virtualization");
							this.virtualization = true;
						}

					}else{
						gridOptions = {};
					}

					headerTemplate = self.options.headerTemplate;
					listTemplate = self.options.listTemplate;

					headerTemplate = kendo.template(headerTemplate);
					headerTemplate = headerTemplate({ count : self.dataSource.total() });

					this.gridElem = gridElem;
					originalData = ds.data();
					originalData = originalData.toJSON();
					pageSize = ds.pageSize();
					newDs = new kendo.data.DataSource({
						data : originalData,
						pageSize : pageSize
					});

					var gridOpt = {
						dataSource: newDs,
						height: "100%",
						selectable : "row",
						scrollable: true,
						sortable: false,
						filterable: false,
						pageable: false,
						dataBinding : function(e){
							if(self.detailContent){
								if(self.detailContent.is(":visible")){
									this.hasDetailContent = true;
									self.detailContent.detach();
								}
							}
						},
						dataBound : function(e){
							//Grid가 다시 데이터 바인딩되므로, 다시 Detail 영역을 Append
							if(this.hasDetailContent){
								var item = this.dataSource.at(self.selectedIndex);
								var selectedRow = this.element.find("tr[data-uid='" + item.uid + "']");
								if(selectedRow.length){
									selectedRow.after(self.detailContent);
									this.hasDetailContent = false;
									if(self.isCollapse){
										selectedRow.addClass("k-state-selected");
									}
								}
							}
						}
					};

					if(columns && columns.length > 0){
						this.contentElem.addClass("multi-column");
						var lastColumn = columns[columns.length - 1];
						var columnTempl;
						if(!this.lastColumnTempl){
							columnTempl = lastColumn.template;
							this.lastColumnTempl = columnTempl;
						}
						columnTempl = this.lastColumnTempl;
						if(columnTempl){
							lastColumn.template = self._addCollapseInTemplate(columnTempl);
						}
						dialogContentHeader.html(headerTemplate);
						this.detailHeader = dialogContentHeader;
						gridOpt.height = "calc(100% - 60px)";
					}else{
						columns = [];
						listTemplate = self._addCollapseInTemplate(listTemplate);
						columns.push({headerTemplate : headerTemplate, template : listTemplate});
						gridOpt.columns = columns;
						dialogContentHeader.hide();
					}

					$.extend(gridOpt, gridOptions);

					this.grid = gridElem.kendoGrid(gridOpt).data("kendoGrid");
					//var isMultiple = gridOpt.selectable;
					//isMultiple = (isMultiple && isMultiple.indexOf("multiple") != -1) ? true : false;
					var itemSize = originalData.length;
					if(itemSize > 0){
						//Asset 멀티 Selected List 팝업으로 인한 추가 코드
						/*if(isMultiple){
							//첫번째 아이템으로 change event 트리거
							var item = this.getSelectedData();
							item.selected = true;
							this.grid.trigger("change", { item : item });
						}else{*/
						//페이지 사이즈 보다 클 경우 Virtualization Scroll을 표시하고, 작을 경우에는 Virtualization Scroll을 숨긴다.
						if(this.virtualization && pageSize){
							var virtualScrollerElem = gridElem.find(".k-scrollbar.k-scrollbar-vertical");
							if(pageSize > itemSize) virtualScrollerElem.hide();
							else virtualScrollerElem.show();
						}

						var initialCollapse = this.options.initialCollapse;
						if(initialCollapse){
							this.grid.select("tr:first-child");
							this.collapseRow(0, null, null, 0);
						}

						//}
					}

					div.append(gridElem);
					this._attachCheckedEvt();
				}
				var headerViewModel = self.options.headerViewModel;
				if(hasDetail){
					this._attachCollapseEvt();
				}else if(headerViewModel){
					//Detail 이 없을 경우 Header ViewModel만 바인딩
					this.headerViewModel = kendo.observable(headerViewModel);
					if(this.detailHeader){
						this._unbindDetailContent(this.detailHeader);
						kendo.bind(this.detailHeader, this.headerViewModel);
					}
				}
			}
			this._attachChangeEvt();

			return div;
		},
		/**
		*   <ul>
		*   <li>Multi Detail Dialog의 접기/펴기 템플릿을 생성한다.</li>
		*   </ul>
		*   @function _addCollapseInTemplate
		*	@param {Object} listTemplate - 리스트 템플릿 오브젝트
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_addCollapseInTemplate : function(listTemplate){
			var hasDetail = this.options.hasDetail;

			if($.isFunction(listTemplate)){
				return function(dataItem){
					var html = listTemplate(dataItem);
					var collapse = hasDetail ? "<i class='detail-dialog-multi-header-collapse'></i>" : "";
					html = "<div class='detail-dialog-header detail-multi-dialog-header'>" + html + collapse + "</div>";
					return html;
				};
			}
			var collapse = hasDetail ? "<i class='detail-dialog-multi-header-collapse'></i>" : "";
			listTemplate = "<div class='detail-dialog-header detail-multi-dialog-header'>" + listTemplate + collapse + "</div>";
			return listTemplate;

		},
		/**
		*   <ul>
		*   <li>Detail Dialog 내 Grid에 체크박스 옵션이 존재한 상태로 생성되었을 경우, 체크 박스 Event를 Trigger하기 위하여 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachCheckedEvt
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_attachCheckedEvt : function(){
			var that = this;
			that.grid.bind("checked", function(e){
				that.trigger("onChecked", e);
			});
		},
		/**
		*   <ul>
		*   <li>Multi Detail Dialog 내 접기/펴기 동작에 대한 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachCollapseEvt
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_attachCollapseEvt : function(){
			var that = this;
			this.grid.bind("change", function(e){
				var selectedRow, selectedRows = this.select();
				var item;
				//only single selection
				if(selectedRows.length > 0){
					var isMultiple = this.options.selectable;
					isMultiple = (isMultiple.indexOf("multiple") != -1) ? true : false;
					if(isMultiple){
						//item 속성은 Grid의 hasSelectedModel 옵션을 true로 설정해야 받을 수 있다.
						item = e.item;
						if(item){
							if(!item.selected){
								that.detailContent.slideUp(300);
								that.isCollapse = false;
								return;
							}
							$(selectedRows).each(function(){
								if($(this).data("uid") == item.uid){
									selectedRow = this;
									return false;
								}
							});
						}
					}else{
						selectedRow = selectedRows[0];
						item = this.dataItem(selectedRow);
					}
				}else{
					that.detailContent.slideUp(300);
					that.isCollapse = false;
					return;
				}

				console.info(item);
				var ds = this.dataSource;
				var index = ds.indexOf(item);
				console.info(index);
				that.collapseRow(index, item, selectedRow);

			});
		},
		/**
		*   <ul>
		*   <li>Multi Detail Dialog에서 상세 정보를 표시한다.(펴기 동작)</li>
		*   </ul>
		*   @function collapseRow
		*   @param {Number}index - 상세정보를 표시할 Data의 Index
		*   @param {Object}item - 상세정보를 표시할 Data
		*   @param {jqueryElement}selectedRow - 상세정보를 표시할 상세 팝업 리스트의 Row
		*   @param {Number}duration - 접기/펴기 에니메이션이 동작할 시간 옵션 값(초)
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		collapseRow : function(index, item, selectedRow, duration){
			var hasDetail = this.options.hasDetail;
			if(!hasDetail){
				return;
			}

			if(!item){
				item = this.grid.dataSource.at(index);
			}

			if(!selectedRow){
				var uid = item.uid;
				selectedRow = this.grid.element.find("tr[data-uid='" + uid + "']");
			}
			if(item){
				if(this.isEditable){
					this.save(true);
				}

				var beforeContent = this.detailContent;
				if(beforeContent){
					this._unbindDetailContent(beforeContent);
					if(beforeContent.is(":visible")){
						this.trigger("collapse");
						beforeContent.slideUp(300, function(){
							beforeContent.remove();
						});
						this.isCollapse = false;
					}else{
						beforeContent.remove();
					}
				}

				this.selectedIndex = index;
				this._createSingleDetailContentTemplate();

				//Detail 정보를 AJAX로 추가적인 데이터를 구성해야할 때의 옵션
				var additionalData = this.options.setAdditionalDetailData;
				var reqArr = [];
				//옵션이 존재하며, Deferred 임을 체크
				if(additionalData && $.isFunction(additionalData)){
					var data = this.getSelectedData();
					if(data){
						var dfd = additionalData.call(this, data);
						if(dfd.promise){
							reqArr.push(dfd);
						}
					}
				}

				var self = this;
				$.when.apply(this, reqArr).always(function(){
					self._setSingleDetailData(true);
					self.detailContent.hide();
					if(self.isEditable){
						self.setContentEditable(self.isEditable);
					}
					if($(selectedRow).length > 0){
						self.updateDetailContentWidth();
						$(selectedRow).after(self.detailContent);
						if(typeof duration !== "undefined"){
							self.detailContent.slideDown(duration);
						}else{
							self.detailContent.slideDown(300);
						}
						self.isCollapse = true;
						self.trigger("expand");
					}
				});
			}
		},
		/**
		*   <ul>
		*   <li>상세 팝업의 너비 값을 리턴한다.</li>
		*   </ul>
		*   @function _getDetailContentWidth
		*   @returns {Number} - 현재 상세 팝업의 Width(너비) 값
		*   @alias module:app/widget/common-dialog
		*
		*/
		_getDetailContentWidth : function(){
			var width = 0;
			if(this.grid){
				width = $(this.grid.element).width();
				if(this.grid.options.scrollable && this.grid.options.scrollable.virtual){
					width = width - 16;
				}
			}

			if(width == 0){
				width = this.contentElem.width();
			}
			return width;
		},
		/**
		*   <ul>
		*   <li>상세 컨텐츠의 View Model을 Unbind한다.</li>
		*   </ul>
		*   @function _unbindDetailContent
		*	@param {jQueryObject}detailContent - 디테일 컨텐트 제이쿼리 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_unbindDetailContent : function(detailContent){
			kendo.unbind(detailContent);
		},
		/**
		*   <ul>
		*   <li>각 입력/Display 필드의 View Model을 Unbind한다.</li>
		*   </ul>
		*   @function _unbindFields
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_unbindFields : function(){
			var key, fields = this.editFields;
			if(fields){
				for(key in fields){
					kendo.unbind(fields[key]);
				}
			}
			fields = this.displayFields;
			if(fields){
				for(key in fields){
					kendo.unbind(fields[key]);
				}
			}
		},
		/**
		*   <ul>
		*   <li>상세 팝업의 컨텐츠 내 헤더 영역에 대한 HTML String을 Template을 통해 생성한다.</li>
		*   </ul>
		*   @function _renderHeaderTemplate
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_renderHeaderTemplate : function(){
			var div, header, headerTemplate = this.options.headerTemplate,
				listTemplate = this.options.listTemplate;
			var self = this;
			var total = self.dataSource.total();
			var selectedIndex = this.selectedIndex;
			var data = this.dataSource.at(selectedIndex);

			//List Template 이 존재할 경우 Single Pop-up에서는 Header Template으로 대체
			if(total <= 1 && listTemplate){
				headerTemplate = listTemplate;
			}

			header = this.element.find(".detail-dialog-header");
			if(header.length > 0){
				div = header;
			}else{
				div = $("<div/>").addClass("detail-dialog-header");
			}

			var html = "";
			if(headerTemplate){
				if($.isFunction(headerTemplate)){
					if(data){
						html = headerTemplate(data);
						div.html(html);
					}
				}else{
					if(data){
						html = kendo.template(headerTemplate);
						html = html(data);
					}
					div.html(html);
				}
				this.detailHeaderElem = div;
				this.detailHeaderHtml = div.get(0).outerHTML;
			}
		},
		/**
		*   <ul>
		*   <li>상세 팝업의 컨텐츠 내 리스트 영역에 대한 HTML String을 Template을 통해 생성한다.</li>
		*   </ul>
		*   @function _renderListTemplate
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_renderListTemplate : function(){
			var div, i, listTemplate = this.options.listTemplate;
			var selectedIndex = this.selectedIndex;
			var data = this.dataSource.at(selectedIndex);
			var html = "";

			div = $("<div/>").addClass("detail-dialog-multi-header");
			i  = $("<i/>").addClass("detail-dialog-multi-header-collapse");
			if(listTemplate){
				if($.isFunction(listTemplate)){
					if(data){
						html = listTemplate(data);
						div.html(html);
						div.append(i);
					}
				}else{
					if(data){
						html = kendo.template(listTemplate);
						html = html(data);
					}
					div.html(html);
					div.append(i);
				}
				this.detailListHeaderElem = div;
				this.detailListHeaderHtml = div.get(0).outerHTML;
			}
		},
		/**
		*   <ul>
		*   <li>Single/Multi 상세 팝업의 Kendo DataSource를 생성한다.</li>
		*   </ul>
		*   @function _createDataSource
		*   @param {Array}data - 데이터 리스트
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_createDataSource : function(data){
			var virtualization = this.options.virtualization;
			var pageSize;
			var settings = window.GlobalSettings;
			var self = this;
			var scheme;
			self.updatedItems = [];
			if(!(data instanceof kendo.data.DataSource)){
				if(!$.isArray(data)){
					data = [data];
				}

				pageSize = 20; //settings.getPageSize() ? settings.getPageSize() : 20;
				pageSize = virtualization ? pageSize : void 0;
				console.info(data);
				scheme = this._createScheme();
				this.options.dataSource = new kendo.data.DataSource({
					data : data,
					pageSize : pageSize,
					schema : scheme
				});
			}else{
				var newData = data.data();
				pageSize = data.pageSize();
				scheme = this._createScheme();
				this.options.dataSource = new kendo.data.DataSource({
					data : newData,
					pageSize : pageSize,
					schema : scheme
				});
			}
			this.dataSource = this.options.dataSource;
			this.dataSource.read();
		},
		/**
		*   <ul>
		*   <li>Single/Multi 상세 팝업 초기화 Option에 따라 Kendo DataSource에 적용할 Schema를 생성한다.</li>
		*   </ul>
		*   @function _createScheme
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_createScheme : function(){
			var schemeOpt = this.options.scheme;
			if(!schemeOpt){
				return;
			}
			var scheme = {
				model : {}
			};
			var model = scheme.model;
			model.id = schemeOpt.id;
			model.fields = {};

			var key, field, type, name, fields = schemeOpt.fields;
			for( key in fields ){
				field = fields[key];
				type = field.type;
				name = field.name;
				if(type == "email" ){
					type = "string";
				}else if(type == "datetime"){
					type = "date";
				}else{
					type = "object";
				}

				model.fields[key] = {
					type : type,
					name : name
				};
			}
			return scheme;
		},
		/**
		*   <ul>
		*   <li>Single/Multi 상세 팝업에서 표시할 새로운 DataSource를 Set한다.</li>
		*   </ul>
		*   @function setDataSource
		*   @param {Array}dataSource - 데이터 리스트
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setDataSource : function(dataSource){
			this._createDataSource(dataSource);

			if(!this.detailContent){
				this._createSingleDetailContentTemplate();
			}


			/*if(this.options.type == "single"){
				this.selectedIndex = 0;
				this._setSingleDetailData();
			}else{
				this.selectedIndex = 0;
				this.grid.setDataSource(ds);
				this._setSingleDetailData();
			}*/


			var content = this.element.find(".detail-dialog-content");
			if(content.length > 0){
				this.content(content);
				this._createContent();
			}else{
				this.content(this._createContent());
			}

		},
		/**
		*   <ul>
		*   <li>Single/Multi 상세 팝업에서 표시할 상세 정보를 렌더링한다.</li>
		*   </ul>
		*   @function _createSingleDetailContentTemplate
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_createSingleDetailContentTemplate : function(){
			var hasDetail = this.options.hasDetail;
			if(!hasDetail){
				this.detailContent = $("<div/>");
				return;
			}

			var div, detailContent = this.element.find(".detail-dialog-detail-content");
			var total = this.dataSource.total();
			if(detailContent.length > 0 && total < 2){
				div = detailContent;
			}else{
				div = $("<div/>").addClass("detail-dialog-detail-content");
			}

			var detailContentTemplate = this.options.detailContentTemplate;
			if(detailContentTemplate){
				div.html(detailContentTemplate);
			}

			var ul, fieldList = div.find(".detail-dialog-detail-content-field-list");
			//Field List는 항상 초기화한다.
			var hasFieldList = false;
			if(fieldList.length > 0){
				ul = fieldList;
				hasFieldList = true;
				ul.empty();
			}else{
				ul = $("<ul/>").addClass("detail-dialog-detail-content-field-list");
			}
			var fieldName;
			var scheme = this.options.scheme;
			if(scheme){
				var fields = scheme.fields;
				var li;
				this.displayFields = {};
				this.editFields = {};
				var groupName, group, groups = scheme.groupName, groupDiv, templ;

				for( fieldName in fields ){
					li = this._createFieldElem(fieldName, fields[fieldName]);
					if(fields[fieldName] && fields[fieldName].groupName && groups){
						groupName = fields[fieldName].groupName;
						group = groups[groupName];
						groupDiv = ul.find(".detail-dialog-detail-content-group[data-name='" + groupName + "']");
						if(groupDiv.length < 1){
							groupDiv = $("<div/>").addClass("detail-dialog-detail-content-group");
							groupDiv.attr("data-name", groupName);
							if(group.template){
								templ = group.template;
								groupDiv.html(templ);
							}else{
								templ = $("<div/>").addClass("group-name").html(groupName);
								groupDiv.html(templ);
							}
						}
						groupDiv.append(li);
						ul.append(groupDiv);
					}else{
						ul.append(li);
					}
					if(fields.hidden){
						li.hide();
						li.addClass("hide");
					}
				}
			}
			if(!hasFieldList) div.append(ul);
			this.detailContent = div;
		},
		_createRemoveBtnIcon : function(){
			return $("<i/>").addClass("ic ic-bt-input-remove");
		},
		/**
		*   <ul>
		*   <li>키보드 또는 상세 정보 표시, 전체 변경 버튼 등의 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachChangeEvt
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_attachChangeEvt : function(){
			var self = this;
			this.contentElem.on("keyup", ".detail-dialog-detail-content input", function(e){
				var element = $(this);
				if(self.options.enableSaveBtnOnInputChange){
					var validator = element.closest("[data-role='commonvalidator']");
					self.hasChanged = true;
					if(validator.length > 0){
						validator = validator.data("kendoCommonValidator");
						var isValidate = validator.validate();
						if(isValidate){
							//모든 필드가 유효성 체크가 완료되었을 때, 저장 버튼을 활성화한다.
							var invalidField = element.closest(self.options.invalidScrollFieldListClass).find("input.k-invalid")
							if(invalidField.length < 1) self.enableSaveBtn();
						}else{
							self.disableSaveBtn();
						}
					}else{
						self.enableSaveBtn();
					}
				}
				var clearBtn = element.siblings(".ic-bt-input-remove");
				if(clearBtn.length > 0){
					if($(this).val()){
						if(!clearBtn.is(":visible")){
							clearBtn.show();
						}
					}else{
						clearBtn.hide();
					}
				}
			});

			this.contentElem.on("click", ".detail-dialog-detail-content .ic.ic-bt-input-remove", function(e){
				var btn = $(this);
				var input = btn.siblings("input");
				input.val("");
				if(input.data("kendoCommonValidator")){
					input.data("kendoCommonValidator").validate();
				}
				btn.hide();
				if(self.options.enableSaveBtnOnInputChange){
					self.hasChanged = true;
					self.enableSaveBtn();
				}
			});

			//전체 변경 버튼
			this.contentElem.on("click", ".detail-dialog-detail-content .edit-all-btn", function(e){
				var btn = $(this);
				var fieldItemLi = btn.closest(".detail-dialog-content-field-item");
				var fieldKey = fieldItemLi.data("key");
				var result = self.saveSingleField(fieldKey);
				if(!result){
					return;
				}

				var selectedData = self.getSelectedData();

				var scheme = self.options.scheme;
				var fieldOpts = scheme.fields;
				var changedData = result[fieldKey];
				var editFieldName, customFieldKey;
				if(fieldOpts[fieldKey] && fieldOpts[fieldKey].customFieldKey){
					//Beacon과 Gateway로 인하여 추가됨.
					customFieldKey = fieldOpts[fieldKey].customFieldKey;
					if($.isFunction(customFieldKey)){
						if(selectedData){
							customFieldKey = customFieldKey(selectedData, result);
						}
					}
					//fieldKey = customFieldKey;
					//이미 선택된 데이터 소스가 save되어 바뀌었다는 전제하에
					//selectedData에서 가져온다.
					changedData = selectedData.get(customFieldKey);
					/*var observalbleResult = new kendo.data.ObservableObject(result);
					//changedData = observalbleResult.get(fieldKey);


					//customFieldKey에 정의된 Index로 Get해오지 못한 경우.
					//networks 어트리뷰트에 대한 처리이다.
					/*if(!changedData){
						selectedData.get()
					}*/
					/*var arrIdx = fieldKey.indexOf("[");
					var tempKey, referenceIndex = 0;
					if(arrIdx != -1){
						tempKey = customFieldKey.substring(0, arrIdx);
						referenceIndex = editFieldName.substring(arrIdx+1, arrIdx+2);
					}*/
				}else if(fieldOpts[fieldKey] && fieldOpts[fieldKey].editFieldName && fieldOpts[fieldKey].editFieldName != fieldKey){

					editFieldName = fieldOpts[fieldKey].editFieldName;
					if($.isFunction(editFieldName)){
						if(selectedData){
							editFieldName = editFieldName(selectedData);
						}
					}

					//set되어 바뀐 데이터가 아니라 editViewModel의 fields 값 까지 가져오기 위해 작성한 코드
					//changedData = self.getEditableFieldValue(fieldKey, fieldOpts[fieldKey]);
					fieldKey = editFieldName;
					changedData = result[fieldKey];
					if(!changedData){
						changedData = selectedData.get(fieldKey);
					}
				}

				var ds = self.dataSource;
				var data = ds.data();
				var i, max = data.length;
				for( i = 0; i < max; i++ ){
					if(data[i] !== selectedData){
						//추후 save data Parsing을 통하여 변경될 어트리뷰트에 값을 Set
						//API호출을 위한 데이터 생성을 위함.
						data[i].set(fieldKey, changedData);
						//현재 디테일 팝업에서 들고 있는 DataSource를 바꾸기 위한 Set
						if(customFieldKey){
							data[i].set(customFieldKey, changedData);
						}
					}
				}

				if(self.options.enableSaveBtnOnInputChange){
					self.hasChanged = true;
					self.enableSaveBtn();
				}
			});
		},
		/**
		*   <ul>
		*   <li>저장 버튼을 활성화한다.</li>
		*   </ul>
		*   @function enableSaveBtn
		*	@param {Event} e - 이벤트 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		enableSaveBtn : function(e){
			var BTN = this.BTN;
			var enableSaveBtnCondition = this.options.enableSaveBtnCondition;
			if(this.buttons[BTN.SAVE].prop("disabled")){
				//Save 버튼 활성화에 대한 특정 조건 옵션이 존재할 경우
				if(enableSaveBtnCondition && $.isFunction(enableSaveBtnCondition)){
					if(enableSaveBtnCondition.call(this)){
						this.setActions(BTN.SAVE, { disabled : false });
					}
				}else{
					this.setActions(BTN.SAVE, { disabled : false });
				}
			}
		},

		/**
		*   <ul>
		*   <li>저장 버튼을 비활성화한다.</li>
		*   </ul>
		*   @function disableSaveBtn
		*	@param {Event} e - 이벤트 객체
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		disableSaveBtn : function(e){
			var BTN = this.BTN;
			var disableSaveBtnCondition = this.options.disableSaveBtnCondition;
			if(!this.buttons[BTN.SAVE].prop("disabled")){
				//Save 버튼 비활성화에 대한 특정 조건 옵션이 존재할 경우
				if(disableSaveBtnCondition && $.isFunction(disableSaveBtnCondition)){
					if(disableSaveBtnCondition.call(this)){
						this.setActions(BTN.SAVE, { disabled : true });
					}
				}else{
					this.setActions(BTN.SAVE, { disabled : true });
				}
			}
		},
		updateDisplayValue : function(){
			this._setSingleDetailData();
		},
		/**
		*   <ul>
		*   <li>상세 정보를 렌더링한다.</li>
		*   <li>View Model을 바인딩하고, 각 필드의 데이터를 정의된 Schema 옵션에 따라 표시한다.</li>
		*   </ul>
		*   @function _setSingleDetailData
		*   @param {Boolean} bindOnlyDetailContent - 상세 정보만 View Model을 바인딩 하는지에 대한 여부
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_setSingleDetailData : function(bindOnlyDetailContent){
			var contentViewModel = this.options.contentViewModel;
			var headerViewModel = this.options.headerViewModel;
			var viewModel = {};
			if(contentViewModel){
				contentViewModel = $.extend(viewModel, contentViewModel);
			}

			var selectedIndex = this.selectedIndex;
			var data = this.dataSource.at(selectedIndex);

			this.trigger("beforeSetDetailData", { item : data });

			if(data){
				viewModel = $.extend(viewModel, data);
			}/*else{
				return;
			}*/

			/*
				Common Data
			*/

			var total = this.dataSource ? this.dataSource.total() : 0;
			//Multi
			viewModel = kendo.observable(viewModel);
			this.contentViewModel = viewModel;

			if(headerViewModel && (!bindOnlyDetailContent || !this.headerViewModel)){
				this.headerViewModel = kendo.observable(headerViewModel);
			}

			if(total > 1){
				this._unbindDetailContent(this.detailContent);
				kendo.bind(this.detailContent, viewModel);
				if(this.detailHeader){
					this._unbindDetailContent(this.detailHeader);
					kendo.bind(this.detailHeader, this.headerViewModel);
				}
			}else{
				this._unbindDetailContent(this.contentElem);
				this._unbindFields();
				kendo.bind(this.contentElem, viewModel);
			}

			//this._unbindDisplayViewModel();
			var scheme = this.options.scheme;
			if(data && scheme){
				var fields = scheme.fields;
				var key;

				//this.contentElem.attr("data-id", data.id);

				var fieldElem, filterResult, filter = this.options.selectedDetailFilter;
				if(filter && $.isFunction(filter)){
					filterResult = filter(data);
				}

				var fieldItemElem;
				for( key in fields ){
					//Field 별 Show/Hide 필터
					fieldElem = this.displayFields[key];
					if(filterResult && filterResult.indexOf(key) != -1){
						fieldItemElem = fieldElem.closest(".detail-dialog-content-field-item");
						fieldItemElem.hide();
						continue;
					}else{
						this.setDisplayFieldValue(key, fields[key], data);
					}

				}

				//Group Show/Hide 필터
				var groupName = scheme.groupName;
				filter = this.options.selectedDetailFilter;
				if(groupName && filterResult) {
					for(key in groupName){
						if(filterResult.indexOf(key) != -1) {
							this.detailContent.find(".detail-dialog-detail-content-group[data-name='" + key + "']").hide();
						}
					}
				}

				this._bindDisplayViewModel();
			}

			this.trigger("afterSetDetailData");
		},
		updateDisplayField : function(key){
			var scheme = this.options.scheme;
			var fields = scheme.fields;
			var data = this.getSelectedData();
			this.setDisplayFieldValue(key, fields[key], data);
		},
		/**
		*   <ul>
		*   <li>상세 정보 내 각 Field의 내용을 Display한다.</li>
		*   <li>각 필드의 데이터를 정의된 Schema 옵션에 따라 표시한다.</li>
		*   </ul>
		*   @function setDisplayFieldValue
		*   @param {String} key - Field의 키 값
		*   @param {Object} field - 해당 Field의 옵션
		*   @param {Object} data - 상세 정보를 표시할 Data
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setDisplayFieldValue : function(key, field, data){
			var fieldElem = this.displayFields[key];
			if(!fieldElem){
				return;
			}

			var type = field.type, fieldTemplate = field.template, format = field.format,
				gridOptions = field.gridOptions, viewModel = field.viewModel, fieldName = field.fieldName,
				widgetDisplaySetter = field.widgetDisplaySetter;
			var value = data[key];
			var fieldKey;
			var kendoTempl;
			var ds = [];
			var opt = {};
			var group;
			if(!value){
				value = "-";
			}

			if(fieldTemplate && type != "grid"){
				if($.isFunction(fieldTemplate)){
					fieldElem.html(fieldTemplate(data));
				}else{
					kendoTempl = kendo.template(fieldTemplate);
					fieldElem.html(kendoTempl(data));
				}

				if(viewModel && viewModel.fields){
					var fields = viewModel.fields;
					if(fieldName){
						if($.isFunction(fieldName)){
							if(data){
								fieldName = fieldName(data);
							}
						}
						value = data.get(fieldName);
					}

					if(fields instanceof kendo.data.ObservableObject){
						fields = fields.toJSON();
					}
					if(value){
						if($.isArray(value) || (value instanceof kendo.data.ObservableArray)){
							value = value[0];
						}
						if(value){
							if(fieldName){
								if($.isPlainObject(value) || (value instanceof kendo.data.ObservableObject)){
									for(fieldKey in fields){
										viewModel.fields[fieldKey] = value[fieldKey];
									}
								}else{
									viewModel.fields[fieldName] = value;
								}
							}else if($.isPlainObject(value) || (value instanceof kendo.data.ObservableObject)){
								for(fieldKey in fields){
									viewModel.fields[fieldKey] = value[fieldKey];
								}
							}else{
								viewModel.fields[key] = value;
							}
						}
					}else{
						for(fieldKey in fields){
							if(viewModel.fields[fieldKey] && data[fieldKey]){
								viewModel.fields[fieldKey] = data[fieldKey];
							}
						}
					}
				}

				if(viewModel && viewModel.init && $.isFunction(viewModel.init)){
					viewModel.init();
				}

			}else if(type == "email" || type == "text" || type == "select"){
				fieldElem.text(value);
			}else if(type == "datetime"){
				//apply format
				var m = moment(value);
				if(format){
					value = m.format(format);
				}
				fieldElem.text(value);
			}else if(type == "number"){
				//format?
				fieldElem.text(value);
			}else if(type == "object"){
				//
			}else if(type == "grid"){
				var gridFilter;
				if(field.gridOptions){
					opt = field.gridOptions;
					group = field.gridOptions.group;
					gridFilter = field.gridOptions.filter;
				}

				if(field.gridDataSource){
					if($.isFunction(field.gridDataSource)){
						ds = field.gridDataSource(data);
					}else if($.isArray(field.gridDataSource)){
						ds = field.gridDataSource;
					}
				}

				if(ds && ds.length < 1 && fieldTemplate){
					if($.isFunction(fieldTemplate)){
						fieldElem.html(fieldTemplate(data));
					}else{
						kendoTempl = kendo.template(fieldTemplate);
						fieldElem.html(kendoTempl(data));
					}
					return;
				}

				ds = new kendo.data.DataSource({
					data : ds
				});
				ds.read();
				opt.dataSource = ds;
				//이미 생성된 Grid가 존재할 경우 초기화한다.
				var fieldElemWrapper, gridWrapper, gridInstance = fieldElem.data("kendoGrid");
				if(gridInstance){
					if(gridInstance.wrapper){
						gridWrapper = gridInstance.wrapper;
						fieldElemWrapper = gridWrapper.parent(".detail-dialog-content-field-value");
						fieldElem.appendTo(fieldElemWrapper);
					}
					gridInstance.destroy();
					if(gridWrapper) gridWrapper.remove();
				}
				fieldElem.empty();
				fieldElem.kendoGrid(opt);
				ds = fieldElem.data("kendoGrid").dataSource;
				if(group){
					ds.group(group);
				}

				if(gridFilter){
					ds.group(gridFilter);
				}

				if(gridOptions.hideHeader){
					fieldElem.find(".k-grid-header").hide();
				}
			}else if(type && type.fn && type.fn.options && type.fn.options.name) {
				var Widget = type, filter;
				var name = "kendo" + Widget.fn.options.name;
				if(field.widgetOptions){
					opt = $.extend(opt, field.widgetOptions);
					group = field.widgetOptions.group;
					filter = field.widgetOptions.filter;
				}

				if(field.widgetDataSource){
					if($.isFunction(field.widgetDataSource)) ds = field.widgetDataSource(data);
					else if($.isArray(field.widgetDataSource)) ds = field.widgetDataSource;
				}

				if(ds && ds.length < 1 && fieldTemplate){
					if($.isFunction(fieldTemplate)){
						fieldElem.html(fieldTemplate(data));
					}else{
						kendoTempl = kendo.template(fieldTemplate);
						fieldElem.html(kendoTempl(data));
					}
					return;
				}

				ds = new kendo.data.DataSource({
					data : ds
				});
				ds.read();
				opt.dataSource = ds;
				//이미 생성된 Grid가 존재할 경우 초기화한다.
				var widgetInstance = fieldElem.data(name);
				if(widgetInstance){
					widgetInstance.destroy();
				}
				fieldElem.empty();
				widgetInstance = new Widget(fieldElem, opt);
				ds = widgetInstance.dataSource;
				if(!Widget.fn.options.group && group){
					ds.group(group);
				}

				if(!Widget.fn.options.filter && filter){
					ds.group(filter);
				}

				if(!Widget.fn.options.hideHeader && opt.hideHeader){
					fieldElem.find(".k-grid-header").hide();
				}

				if(widgetDisplaySetter && $.isFunction(widgetDisplaySetter)){
					widgetDisplaySetter.call(field, { sender : this, widget : widgetInstance, data : data });
				}
			}
		},
		updateEditField : function(key){
			var scheme = this.options.scheme;
			var fields = scheme.fields;
			var data = this.getSelectedData();
			this.setEditableFieldValue(key, fields[key], data);
		},
		/**
		*   <ul>
		*   <li>상세 정보 편집 모드에서 각 Field의 내용을 Display한다.</li>
		*   <li>각 필드의 데이터를 정의된 Schema 옵션에 따라 각 필드에 설정된 편집 모드로 표시한다.</li>
		*   </ul>
		*   @function setEditableFieldValue
		*   @param {String} fieldKey - Field의 키 값
		*   @param {Object} field - 해당 Field의 옵션
		*   @param {Object} data - 상세 정보를 표시할 Data
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setEditableFieldValue : function(fieldKey, field, data){
			var fieldElem = this.editFields[fieldKey];
			if(!fieldElem){
				return;
			}
			var type = field.type, validatorOptions = field.validator,
				editTemplate = field.editTemplate, editViewModel = field.editViewModel,
				editFieldName = field.editFieldName, getEditableData = field.getEditableData,
				widgetEditSetter = field.widgetEditSetter;

			var key, value = data[fieldKey];
			if(getEditableData && $.isFunction(getEditableData)){
				value = getEditableData(data);
			}

			if(editTemplate){
				if($.isFunction(editTemplate)){
					fieldElem.html(editTemplate(data, editViewModel));
				}else{
					var kendoTempl = kendo.template(editTemplate);
					fieldElem.html(kendoTempl(data));
				}

				if(editViewModel.fields){
					var fields = editViewModel.fields;
					if(editFieldName){
						if($.isFunction(editFieldName)){
							if(data){
								editFieldName = editFieldName(data);
							}
						}
						value = data.get(editFieldName);
					}

					if(fields instanceof kendo.data.ObservableObject){
						fields = fields.toJSON();
					}
					if(typeof value !== "undefined" && value !== null){
						if($.isArray(value) || (value instanceof kendo.data.ObservableArray)){
							value = value[0];
						}
						if(typeof value !== "undefined" && value !== null){
							if(editFieldName){
								if($.isPlainObject(value) || (value instanceof kendo.data.ObservableObject)){
									for(key in fields){
										editViewModel.fields[key] = value[key];
									}
								}else{
									editViewModel.fields[editFieldName] = value;
								}
							}else if($.isPlainObject(value) || (value instanceof kendo.data.ObservableObject)){
								for(key in fields){
									editViewModel.fields[key] = value[key];
								}
							}else{
								editViewModel.fields[fieldKey] = value;
							}
						}
					}else{
						for(key in fields){
							if(editViewModel.fields[key] && data[key]){
								editViewModel.fields[key] = data[key];
							}else if(!data[key]){
								//초기화
								editViewModel.fields[key] = null;
							}
						}
					}
				}

				if(editViewModel.init && $.isFunction(editViewModel.init)){
					editViewModel.init();
				}
			}else if(type == "email" || type == "text"){
				if(validatorOptions){
					fieldElem.data("kendoCommonValidator").element.val(value);
				}else{
					fieldElem.val(value);
				}
			}else if(type == "select"){
				fieldElem.data("kendoDropDownList").value(value);
			}else if(type == "date"){
				fieldElem.data("kendoCommonDatePicker").value(value);
			}else if(type == "number"){
				//editField = $("<input/>");
				fieldElem.data("kendoNumericTextBox").value(value);
			}else if(type == "object"){
				//
			}else if(type && type.fn.options && type.fn.options.name){
				var Widget = type;
				var name = "kendo" + Widget.fn.options.name;
				var widgetInstance = fieldElem.data(name);
				if(widgetInstance.value) {
					widgetInstance.value(value);
				}else if(widgetEditSetter && $.isFunction(widgetEditSetter)) {
					widgetEditSetter.call(field, {sender : this, widget : widgetInstance, data : data} );
				}else{
					console.info("this widget instance " + name + " has no set value function.");
				}
			}
		},
		/**
		*   <ul>
		*   <li>상세 정보 편집 모드에서 입력한 값을 가져온다.</li>
		*   <li>각 필드의 데이터를 정의된 Schema 옵션에 따라 편집 모드에 적합한 값을 가져온다.</li>
		*   </ul>
		*   @function getEditableFieldValue
		*   @param {String} key - Field의 키 값
		*   @param {Object} field - 해당 Field의 옵션
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		getEditableFieldValue : function(key, field){
			var fieldElem = this.editFields[key];
			if(!fieldElem){
				return;
			}
			var type = field.type, validatorOptions = field.validator, editTemplate = field.editTemplate,
				editViewModel = field.editViewModel, customFieldKey = field.customFieldKey,
				widgetEditGetter = field.widgetEditGetter, editFieldGetter = field.editFieldGetter;

			var value = null;
			if(editTemplate){
				/*if($.isFunction(editTemplate)){
					fieldElem.html(editTemplate(data));
				}else{
					var kendoTempl = kendo.template(editTemplate);
					fieldElem.html(kendoTempl(data));
				}*/
				if(editViewModel && editViewModel.fields){
					var fieldKey, obj = {};
					var fields = editViewModel.fields;
					if(fields instanceof kendo.data.ObservableObject){
						fields = fields.toJSON();
					}
					for( fieldKey in fields){
						value = fields[fieldKey];
						if(typeof value !== "undefined"){
							if(customFieldKey){
								obj = value;
							}else{
								obj[fieldKey] = value;
							}
						}
					}
					value = obj;
				}
			}else if(editFieldGetter && $.isFunction(editFieldGetter)){
				value = editFieldGetter(field);
			}else if(type == "email" || type == "text"){
				if(validatorOptions){
					value = fieldElem.data("kendoCommonValidator").element.val();
				}else{
					value = fieldElem.val();
				}
			}else if(type == "select"){
				value = fieldElem.data("kendoDropDownList").value();
			}else if(type == "datetime"){
				//editField = $("<input/>");
				// format

			}else if(type == "number"){
				//editField = $("<input/>");
				value = fieldElem.data("kendoNumericTextBox").value();
			}else if(type && type.fn && type.fn.options && type.fn.options.name){
				var Widget = type;
				var name = "kendo" + Widget.fn.options.name;
				var widgetInstance = fieldElem.data(name);
				if(widgetInstance.value) {
					value = widgetInstance.value();
				}else if (widgetEditGetter && $.isFunction(widgetEditGetter)){
					value = widgetEditGetter.call(field, {sender : this, widget : widgetInstance});
				}else{
					console.info("this widget instance " + name + " has no get value function.");
				}
			}

			if(type == "array"){
				value = [value];
			}

			return value;
		},
		setEditableValue : function(data){
			var scheme = this.options.scheme;
			if(scheme){
				var fields = scheme.fields;
				var key;

				for( key in fields ){
					this.setEditableFieldValue(key, fields[key], data);
				}
			}
		},
		/**
		*   <ul>
		*   <li>편집 모드를 On/Off 한다.</li>
		*   </ul>
		*   @function setEditable
		*   @param {Boolean} isEditable - 편집모드 On/Off 여부
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setEditable : function(isEditable){
			this.hasChanged = false;
			this.isEditable = isEditable;
			this.setContentEditable(isEditable);
			this.setBtnEditable(isEditable);
			//편집 모드 시, 첫번째 입력 필드에 포커싱한다.
			if(isEditable) this.contentElem.find("input.k-input").eq(0).focus();
		},
		/**
		*   <ul>
		*   <li>현재 상세 Dialog의 Type을 설정한다.</li>
		*   <li>onTypeChange 옵션 콜백 함수를 호출한다.</li>
		*   </ul>
		*   @function setDialogType
		*   @param {String} type - 현재 설정할 Dialog의 Type (e.g : "register")
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setDialogType : function(type){
			this.dialogType = type;
			if(this.options.onTypeChange && $.isFunction(this.options.onTypeChange)){
				this.options.onTypeChange({ sender : this, type : type });
			}
		},
		/**
		*   <ul>
		*   <li>현재 상세 정보 컨탠츠 내 편집 모드를 활성화/비활성화 한다.</li>
		*   </ul>
		*   @function setContentEditable
		*   @param {Boolean} isEditable - 활성화 여부
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setContentEditable : function(isEditable){
			var data;
			if(isEditable){
				//Edit Field를 보여주기 위한 class 추가
				this.contentElem.addClass("edit-mode");
				data = this.getSelectedData();
				//this._unbindEditViewModelField();
				this.setEditableValue(data);
				this._bindEditableViewModel();
			}else{
				//편집 시, 필드가 Show/Hide 된 상태를 다시 원상태로 업데이트하여 복구시킨다.
				this.updateFieldVisible();
				//Edit Field를 숨기기 위한 class 추가
				this.contentElem.removeClass("edit-mode");

			}
		},
		updateFieldVisible : function(){
			var scheme = this.options.scheme;
			var data = this.getSelectedData();
			if(scheme){
				var fields = scheme.fields;
				var key;
				var fieldElem, filterResult, filter = this.options.selectedDetailFilter;
				if(filter && $.isFunction(filter)){
					filterResult = filter(data);
				}
				var fieldItemElem, isVisible;
				for( key in fields ){
					//Field 별 Show/Hide 필터
					fieldElem = this.displayFields[key];
					fieldItemElem = fieldElem.closest(".detail-dialog-content-field-item");
					isVisible = fieldItemElem.is(":visible");
					if(filterResult && filterResult.indexOf(key) != -1){
						fieldItemElem.hide();
					}else if(!isVisible){
						fieldItemElem.show();
					}
				}
			}
		},
		/**
		*   <ul>
		*   <li>현재 상세 팝업 버튼의 편집 모드를 활성화/비활성화 한다.</li>
		*   <li>편집 모드에 따라 버튼의 상태를 변경한다.</li>
		*   </ul>
		*   @function setBtnEditable
		*   @param {Boolean} isEditable - 활성화 여부
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		setBtnEditable : function(isEditable){
			//Save 버튼은 Edit Mode에서 입력 값 변환 시에 활성화 된다.
			var BTN = this.BTN;
			this.setActions(BTN.SAVE, { visible : isEditable, disabled : true });
			this.setActions(BTN.CANCEL, { visible : isEditable });
			this.setActions(BTN.EDIT, { visible : !isEditable });
			this.setActions(BTN.DELETE, { visible : !isEditable });
			this.setActions(BTN.CLOSE, { visible : !isEditable });
		},
		saveSingleField : function(key){
			var editFields = this.editFields;
			var scheme = this.options.scheme;
			var notAllowBlanked = this.options.NotAllowedBlankFields;
			var saveOnlyVisibleField = this.options.saveOnlyVisibleField;
			var fieldOpts = scheme.fields;
			var validationRule = fieldOpts[key].validationRule;
			var isValidate = true;
			var results = {}, value;
			var dataItem, index = this.selectedIndex;
			dataItem = this.dataSource.at(index);
			var valueKey;
			var editFieldName, arrIdx, tempKey, customFieldName, isEditable;

			isEditable = fieldOpts[key].editable;
			if($.isFunction(isEditable)) isEditable = isEditable(dataItem);
			if(!isEditable && !editFields[key]) return false;
			else if(!isEditable && editFields[key] && !editFields[key].isForceEditable) return false;
			if(saveOnlyVisibleField && editFields[key] && !editFields[key].is(":visible")) return false;

			if(editFields[key].data("kendoCommonValidator")){
				isValidate = editFields[key].data("kendoCommonValidator").validate();
			}

			if(validationRule){
				isValidate = validationRule(fieldOpts[key], editFields[key]);
			}

			if(isValidate){
				value = this.getEditableFieldValue(key, fieldOpts[key]);
				editFieldName = fieldOpts[key].editFieldName;
				var referenceIndex = 0;
				if(editFieldName){
					if($.isFunction(editFieldName)){
						if(dataItem){
							editFieldName = editFieldName(dataItem);
						}
					}
					if(fieldOpts[key].type == "object"){
						if(!results[editFieldName]){
							arrIdx = editFieldName.indexOf("[");
							if(arrIdx != -1){
								tempKey = editFieldName.substring(0, arrIdx);
								referenceIndex = editFieldName.substring(arrIdx + 1, arrIdx + 2);
								if(!results[tempKey]){
									results[tempKey] = [];
									results[tempKey].push({});
								}
							}else{
								results[editFieldName] = {};
							}
						}

						if(arrIdx != -1){
							for(valueKey in value){
								//Default Index 0. For Device Energy Meter meters array.
								results[tempKey][referenceIndex][valueKey] = value[valueKey];
							}
						}else{
							for(valueKey in value){
								results[editFieldName][valueKey] = value[valueKey];
							}
						}

					}else{
						for(valueKey in value){
							results[editFieldName] = value[valueKey];
						}
						value = results[editFieldName];
					}
				}

				customFieldName = fieldOpts[key].customFieldName;
				if(customFieldName){
					if($.isFunction(customFieldName)) customFieldName = customFieldName(dataItem);
					Util.setter(results, customFieldName, value);
				}else if(typeof value != "undefined" && value !== null){
					if(notAllowBlanked.indexOf(key) == -1){
						results[key] = value;
					}else if(value === "" && value != dataItem[key]){
					//공백이 허용되지 않는 값일 경우에 이전 값은 공백이 아니지만 현재 값이 공백일 경우만 값 전달
						results[key] = value;
					}else if(value !== ""){
						results[key] = value;
					}
				}
			}

			if(!isValidate){
				return false;
			}

			//console.time("save - set dialog datasource");
			value = results[key];
			dataItem.set(key, value);
			//console.timeEnd("save - set dialog datasource");
			if(this.options.parseSaveData){
				results = this.options.parseSaveData(dataItem, results);
			}

			return results;
		},
		/**
		*   <ul>
		*   <li>현재 상세 펍업의 편집 모드에서 설정한 값을 저장할 때 호출되며, 편집된 데이터를 리턴한다.</li>
		*   </ul>
		*   @function save
		*   @param {Boolean} isExpandSave - 멀티 상세 팝업에서 다른 아이템 Expand 시, 호출되는 Save 인지 여부
		*   @returns {Object} - 편집한 결과 값이 담긴 객체
		*   @alias module:app/widget/common-dialog
		*
		*/
		save : function(isExpandSave, isOnlyGetSaveData){
			//if have validation
			var key;
			var editFields = this.editFields;
			var options = this.options;
			var scheme = options.scheme;
			var notAllowBlanked = options.NotAllowedBlankFields;
			var saveOnlyVisibleField = options.saveOnlyVisibleField;
			var fieldOpts = scheme.fields;
			var isValidate = true, invalidField;
			var results = {}, value;
			var dataItem, index = this.selectedIndex;
			dataItem = this.dataSource.at(index);
			//console.time("save - set results");
			//save single
			results.id = dataItem.id;
			var valueKey;
			var editFieldName, arrIdx, tempKey, customFieldName;
			var isEditable;

			for( key in fieldOpts ){
				isEditable = fieldOpts[key].editable;
				if($.isFunction(isEditable)) isEditable = isEditable(dataItem);

				if(!isEditable && !editFields[key]) continue;
				else if(!isEditable && editFields[key] && !editFields[key].isForceEditable) continue;
				if(saveOnlyVisibleField && editFields[key] && !editFields[key].is(":visible")) continue;

				if(fieldOpts[key].validator && editFields[key] && editFields[key].data("kendoCommonValidator")){
					isValidate = editFields[key].data("kendoCommonValidator").validate();
				}

				if(fieldOpts[key].validationRule){
					isValidate = fieldOpts[key].validationRule(fieldOpts[key], editFields[key]);
				}

				if(isValidate || isOnlyGetSaveData){
					value = this.getEditableFieldValue(key, fieldOpts[key]);
					editFieldName = fieldOpts[key].editFieldName;
					if(editFieldName){
						if($.isFunction(editFieldName)){
							if(dataItem){
								editFieldName = editFieldName(dataItem);
							}
						}
						var referenceIndex = 0;
						if(fieldOpts[key].type == "object"){
							if(!results[editFieldName]){
								arrIdx = editFieldName.indexOf("[");
								if(arrIdx != -1){
									referenceIndex = editFieldName.substring(arrIdx + 1, arrIdx + 2);
									tempKey = editFieldName.substring(0, arrIdx);
									if(!results[tempKey]){
										results[tempKey] = [];
										results[tempKey].push({});
									}
								}else{
									results[editFieldName] = {};
								}
							}

							if(arrIdx != -1){
								for(valueKey in value){
									//Default Index 0. For Device Energy Meter meters array.
									results[tempKey][referenceIndex][valueKey] = value[valueKey];
								}
							}else{
								for(valueKey in value){
									results[editFieldName][valueKey] = value[valueKey];
								}
							}

						}else{
							for(valueKey in value){
								results[editFieldName] = value[valueKey];
							}
						}
						continue;
					}

					customFieldName = fieldOpts[key].customFieldName;
					if(customFieldName){
						if($.isFunction(customFieldName)) customFieldName = customFieldName(dataItem);
						Util.setter(results, customFieldName, value);
						continue;
					}

					if(typeof value != "undefined" && value !== null){
						if(notAllowBlanked.indexOf(key) == -1){
							results[key] = value;
						}else if(value === "" && value != dataItem[key]){
							//공백이 허용되지 않는 값일 경우에 이전 값은 공백이 아니지만 현재 값이 공백일 경우만 값 전달.
							results[key] = value;
						}else if(value !== ""){
							results[key] = value;
						}
					}
				}else{
					invalidField = editFields[key];
					break;
				}
			}
			//console.timeEnd("save - set results");

			if(!isValidate && !isOnlyGetSaveData){
				//유효하지 않은 필드로 스크롤을 이동시킨다.
				if(!isExpandSave && invalidField && this.detailContent){
					this.scrollToField(invalidField);
				}
				return false;
			}

			//console.time("save - set dialog datasource");
			var i, max, subObj, itemSubObj;
			for( key in results ){
				value = results[key];
				//if($.isArray(value)){
				if(key == "meters" || key == "users" || key == "devices"){
					max = value.length;
					//meters[0] 어트리뷰트 patch를 위함.
					for( i = 0; i < max; i++){
						subObj = value[i];
						itemSubObj = dataItem.get(key + "[" + i + "]");
						if(!itemSubObj){
							itemSubObj = dataItem.get(key);
							if(!itemSubObj){
								itemSubObj = [];
								if(!isOnlyGetSaveData) dataItem.set(key, itemSubObj);
							}
							itemSubObj = {};
							if(!isOnlyGetSaveData) dataItem.set(key + "[" + i + "]", itemSubObj);
							itemSubObj = dataItem.get(key + "[" + i + "]");
						}
						for(tempKey in subObj){
							if(!isOnlyGetSaveData) itemSubObj.set(tempKey, subObj[tempKey]);
						}
					}
					continue;
				}
				//}

				if(!isOnlyGetSaveData) dataItem.set(key, results[key]);
			}
			//console.timeEnd("save - set dialog datasource");
			if(this.options.parseSaveData){
				results = this.options.parseSaveData(dataItem, results);
			}

			return results;
		},
		scrollToField : function(field){
			var options = this.options;
			var fieldClass = options.invalidScrollFieldClass, scrollWrapperClass = options.invalidScrollWrapperClass,
				fieldListClass = options.invalidScrollFieldListClass;
			field = field.closest(fieldClass);
			if(!field.is(":visible")) return;
			var scrollWrapper = field.closest(scrollWrapperClass);
			var fieldList = field.closest(fieldListClass);
			var offset = field.position();
			if(fieldList.length > 0){
				var fieldListOffset = fieldList.offset();
				offset.top = offset.top - fieldListOffset.top;
			}
			scrollWrapper.scrollTop(offset.top);
		},
		/**
		*   <ul>
		*   <li>현재 멀티 상세 펍업의 편집 모드에서 설정한 값을 저장할 때 호출되며, 편집된 데이터들을 리스트로 리턴한다.</li>
		*   </ul>
		*   @function saveAll
		*   @param {Object} saveAdditionalObj - 저장된 객체를 리턴할 때, 추가로 Merge하여 저장될 Object
		*   @param {Boolean} isOnlyUpdated - 리스트 중 업데이트 된 정보만 저장하는지의 여부
		*   @returns {Array} - 편집된 정보들의 리스트
		*   @alias module:app/widget/common-dialog
		*
		*/
		saveAll : function(saveAdditionalObj, isOnlyUpdated){
			this.save();

			var updatedData;
			if(isOnlyUpdated){
				updatedData = this.dataSource.updated();
			}else{
				updatedData = this.dataSource.data();
			}

			//console.info(updatedData);

			var scheme = this.options.scheme;
			var saveOnlyVisibleField = this.options.saveOnlyVisibleField;
			var fieldOpts = scheme.fields;
			var opt, key, i, max = updatedData.length;
			var editFields = this.editFields;
			var result, item, arrIdx, tempKey, valueKey,
				viewModelFields, results = [], editFieldName, customFieldName, isEditable;
			for( i = 0; i < max; i++ ){
				item = updatedData[i];
				result = {};
				for( key in fieldOpts ){
					isEditable = fieldOpts[key].editable;
					if($.isFunction(isEditable)) isEditable = isEditable(item);
					if(!isEditable && !editFields[key]) continue;
					else if(!isEditable && editFields[key] && !editFields[key].isForceEditable) continue;
					if(saveOnlyVisibleField && editFields[key] && !editFields[key].is(":visible")) continue;

					opt = fieldOpts[key];
					if(opt && opt.editFieldName){
						editFieldName = opt.editFieldName;
						if($.isFunction(editFieldName)){
							if(item){
								editFieldName = editFieldName(item);
							}
						}
						arrIdx = editFieldName.indexOf("[");
						var referenceIndex = 0;
						if(arrIdx != -1){
							tempKey = editFieldName.substring(0, arrIdx);
							referenceIndex = editFieldName.substring(arrIdx + 1, arrIdx + 2);
							if(!result[tempKey]){
								result[tempKey] = [];
								result[tempKey].push({});
							}
							if(opt.editViewModel && opt.editViewModel.fields){
								viewModelFields = opt.editViewModel.fields;
								if(viewModelFields instanceof kendo.data.ObservableObject){
									viewModelFields = viewModelFields.toJSON();
								}
								//디폴트 0 사이즈로 한다. 에너지 미터 상세 팝업 Edit로 인한 코드임.
								for(valueKey in viewModelFields){
									if(item[tempKey] && item[tempKey][referenceIndex]){
										result[tempKey][referenceIndex][valueKey] = item[tempKey][referenceIndex][valueKey];
									}
								}
							}

						}else{
							result[editFieldName] = item[editFieldName];
						}
					}else if(opt && opt.customFieldName){
						customFieldName = opt.customFieldName;
						if($.isFunction(customFieldName)) customFieldName = customFieldName(item);
						Util.setter(result, customFieldName, Util.getter(item, customFieldName));
					}else{
						result[key] = item[key];
					}
				}
				result.id = item.id;
				if(saveAdditionalObj){
					for(key in saveAdditionalObj){
						result[key] = saveAdditionalObj[key];
					}
				}

				results.push(result);
			}

			if(this.options.parseSaveData){
				results = this.options.parseSaveData(updatedData, results);
			}

			return results;
		},
		/**
		*   <ul>
		*   <li>상세 팝업에서 편집된 정보를 Rollback 하고, 현재 Display되는 값들을 Refresh한다.</li>
		*   </ul>
		*   @function cancel
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		cancel : function(){
			this.cancelDataSource();
			if(this.grid){
				 this.updateDisplayValue();
			}
		},
		/**
		*   <ul>
		*   <li>현재 Display되는 값들을 Refresh한다.</li>
		*   </ul>
		*   @function success
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		success : function(){
			this.updateDisplayValue();
			if(this.grid){
				var data = this.dataSource.data();
				data = data.toJSON();
				var newDs = new kendo.data.DataSource({
					data : data
				});
				this.grid.setDataSource(newDs);
			}
			//상세 편집 저장 후에도 다시 편집->취소하면 이전 데이터로 원복되기 때문에 DataSource를 업데이트한다.
			if(this.dataSource){
				this.dataSource.data(this.dataSource.data());
			}
		},
		fail : function(){
			this.cancel();
		},
		updateDataSource : function(results){
			var id = this.contentElem.data("id");
			var dataItem = this.dataSource.get(id);
			//set datasource
			var key, value;
			for( key in results ){
				value = results[key];
				if(value){
					dataItem.set(key, value);
				}
			}
			this.updateDisplayValue();
		},
		cancelDataSource : function(){
			this.dataSource.cancelChanges();
		},
		hideRemoveBtn : function(){
			this.detailContent.find(".ic.ic-bt-input-remove").hide();
		},
		hideInvalidMessage : function(){
			var key, fields = this.editFields;
			for( key in fields ){
				if(fields[key].data("kendoCommonValidator")){
					fields[key].data("kendoCommonValidator").hideMessages();
				}
			}
		},
		/**
		*   <ul>
		*   <li>상세 팝업을 Open 한다.</li>
		*   </ul>
		*   @function success
		*   @param {String}type - Open될 상세 팝업의 타입
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		open : function(type){
			if(this.dataSource && this.dataSource.total() == 0){
				//Data 없이 상세 팝업을 쓸 때, Open 시, Refresh를 위함
				this.setDataSource(this.dataSource);
			}
			this.setDialogType(type);
			var r = CommonDialog.fn.open.call(this);
			this.updateDetailContentWidth();
			if(this.virtualization && this.grid){
				this.grid.dataSource.fetch();
			}
			return r;
		},
		updateDetailContentWidth : function(){
			if(this.grid && this.detailContent){
				this.detailContent.width(this._getDetailContentWidth());
			}
		},
		getSelectedData : function(){
			var selectedIndex = this.selectedIndex;
			return this.dataSource.at(selectedIndex);
		},
		_processTemplate : function(){

		},
		_createContentList : function(){

		},
		/*Set Field*/
		_bindDisplayViewModel : function(){
			var scheme = this.options.scheme;
			var fieldName, fields = scheme.fields;
			for( fieldName in fields ){
				this._bindDisplayViewModelField(fieldName, fields[fieldName]);
			}
		},
		_bindDisplayViewModelField : function(key, field){
			var viewModel = field.viewModel;
			var displayValue = this.displayFields[key];
			if(displayValue && viewModel){
				viewModel = field.viewModel = kendo.observable(viewModel);
				kendo.bind(displayValue, viewModel);
				this.displayFields[key].viewModel = viewModel;
			}
		},
		_bindEditableViewModel : function(){
			var scheme = this.options.scheme;
			if(scheme){
				var fieldName, fields = scheme.fields;
				for( fieldName in fields ){
					this._bindEditableViewModelField(fieldName, fields[fieldName]);
				}
			}
		},
		_bindEditableViewModelField : function(key, field){
			var editViewModel = field.editViewModel;
			var editableValue = this.editFields[key];
			if(editableValue && editViewModel){
				editViewModel = field.editViewModel = kendo.observable(editViewModel);
				kendo.bind(editableValue, editViewModel);
				this.editFields[key].viewModel = editViewModel;
			}
		},
		/**
		*   <ul>
		*   <li>상세 팝업의 Display/Editable 상태로 표시될 Field들의 Scheme Option에 따라 요소들을 생성한다.</li>
		*   </ul>
		*   @function _createFieldElem
		*   @param {String}key - Field의 Key 값
		*   @param {Object}field - Field의 옵션 값
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		//Display 및 Edit 할 필드들을 생성한다.
		_createFieldElem : function(key, field){
			/*id : {
						type : "string",
						name : "ID",
						validator : true,
						template : "",
						editTemplate : "",
						editable : false
					},*/
			var type = field.type, name, isEditable = field.editable,
				fieldTemplate = field.template, valueFieldDisplayType = field.valueFieldDisplayType;

			var data = this.getSelectedData();
			//console.log("create field elem");
			//console.log(data);
			//옵션을 함수로 추가했을 경우 현재 선택한 데이터의 조건에 따라 editable을 결정하게한다.
			if($.isFunction(isEditable)){
				if(data){
					isEditable = isEditable(data);
				}else{
					isEditable = false;
				}
			}

			var fieldType = field.type;
			if(type && type.fn && type.fn.options && type.fn.options.name) fieldType = fieldType.fn.options.name;

			var li = $("<li/>").addClass("detail-dialog-content-field-item").attr({
				"data-type" : fieldType,
				"data-editable" : isEditable,
				"data-key" : key
			});

			name = $("<div/>").addClass("detail-dialog-content-field-name");
			name.html(field.name);
			name.appendTo(li);

			var value = $("<div/>").addClass("detail-dialog-content-field-value");
			if(valueFieldDisplayType == "row"){
				value.addClass("row");
			}

			var displayValue = $("<span/>").addClass("display");
			if(fieldTemplate){
				displayValue.addClass("detail-dialog-content-field-template");
			}
			displayValue.appendTo(value);
			this.displayFields[key] = displayValue;

			  //type
			//"email" = (input type=email)
			//"string" - (input type=text),
			//"select" - (dropdownlist),
			//"datetime"(moment.js) - (calendar)
			//"number"(numerictextbox), ""
			//"template"(+button)
			//"object", nested object

			if(isEditable){
				this.createEditableFieldElem(value, key, field);
			}

			value.appendTo(li);
			return li;
		},
		createEditableFieldElem : function(fieldValueElem, key, field){
			var type = field.type, validatorOptions = field.validator, numericOptions = field.numeric, dropdownOptions = field.dropdown,
				editTemplate = field.editTemplate, editCss = field.editCss, hasRemoveBtn = field.hasInputRemoveBtn,
				datePickerOptions = field.datepicker, isEditAll = field.isEditAll, widgetOptions = field.widgetOptions;

			if(!editCss){
				editCss = {};
			}

			var editableValue = $("<span/>").addClass("editable");
			var editField, i;
			if(editTemplate){
				editField = $("<span/>").addClass("detail-dialog-content-field-template").appendTo(editableValue).css(editCss);
			}else if(type == "email"){
				editField = $("<input/>").attr({
					type : "email"
				}).addClass("k-input").appendTo(editableValue).css(editCss);
			}else if(type == "text"){
				editField = $("<input/>").attr({
					type : "text"
				}).addClass("k-input").appendTo(editableValue).css(editCss);
			}else if(type == "select"){
				editField = $("<select/>").appendTo(editableValue).css(editCss);
				if(dropdownOptions){
					dropdownOptions.animation = false;
					editField.kendoDropDownList(dropdownOptions);
				}else{
					editField.kendoDropDownList({
						animation : false
					});
				}
				editField.kendoDropDownList.bind("change", this.enableSaveBtn.bind(this));
			}else if(type == "date"){
				//editField = $("<input/>").appendTo(editableValue).css(editCss);
				editField = $("<input/>").appendTo(editableValue).css(editCss);
				if(datePickerOptions){
					editField.kendoCommonDatePicker(datePickerOptions);
				}else{
					editField.kendoCommonDatePicker();
				}
			}else if(type == "number"){
				editField = $("<input/>").appendTo(editableValue).css(editCss);
				if(numericOptions){
					editField.kendoNumericTextBox(numericOptions);
				}else{
					editField.kendoNumericTextBox({ spinner : false });
				}
			}else if(type == "object"){
				//
			}

			if((type == "email" || type == "text") && validatorOptions){
				if($.isPlainObject(validatorOptions)){
					editField.kendoCommonValidator(validatorOptions);
				}else{
					editField.kendoCommonValidator({
						type : key
					});
				}
			}

			if(type == "email" || type == "text"){
				if(hasRemoveBtn){
					i = this._createRemoveBtnIcon();
					i.appendTo(editableValue);
					editField.addClass("has-remove-btn");
				}
			}

			if(type && type.fn && type.fn.options && type.fn.options.name) {
				editField = $('<div/>').addClass('detail-dialog-content-field-widget').appendTo(editableValue).css(editCss);
				var Widget = type;
				Widget = new Widget(editField, widgetOptions);
			}
			this.editFields[key] = editField;
			editableValue.appendTo(fieldValueElem);

			if(isEditAll){
				editableValue.addClass("has-edit-all-btn");
				var I18N = window.I18N;
				var editAllBtn = $("<button/>").addClass("k-button edit-all-btn editable").text(I18N.prop("COMMON_BTN_CHANGE_ALL"));
				editAllBtn.appendTo(fieldValueElem);
			}
		},
		setEditableFieldElem : function(key, isEditable){
			var self = this;
			var displayFieldElement = self.displayFields[key];
			if(!displayFieldElement) return;

			var fieldValueElement = displayFieldElement.closest(".detail-dialog-content-field-value");
			if(fieldValueElement.length == 0) return;

			var fieldItemElement = fieldValueElement.closest(".detail-dialog-content-field-item");
			if(isEditable){
				fieldItemElement.attr("data-editable", true);
				fieldItemElement.show();
				if(self.editFields[key]) return;
				var scheme = this.options.scheme;
				var fields = scheme.fields;
				self.createEditableFieldElem(fieldValueElement, key, fields[key]);
				self.editFields[key].isForceEditable = true;
				var data = this.getSelectedData();
				self.setEditableFieldValue(key, fields[key], data);
				self._bindEditableViewModelField(key, fields[key]);
			}else{
				fieldItemElement.attr("data-editable", false);
				fieldItemElement.hide();
				if(!self.editFields[key]) return;
				kendo.unbind(self.editFields[key]);
				var editValueFieldElement = self.editFields[key].closest("span.editable");
				editValueFieldElement.remove();
				delete self.editFields[key];
			}
		}
	});

	kendo.ui.plugin(widget);
})(window, window.kendo.jQuery);

//# sourceURL=widget/common-dialog.js