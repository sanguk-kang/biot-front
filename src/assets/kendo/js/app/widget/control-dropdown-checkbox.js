/**
 *
 *   <ul>
 *       <li>체크박스 기능을 포함하여 드랍다운리스트 위젯을 활용한다.</li>
 *       <li>체크박스를 활용하여 드랍다운리스트 내에서 다중 선택을 할 수 있다.</li>
 *       <li>사용자에 의해 선택된 아이템의 수가 드랍다운리스트의 요약 텍스트에 반영된다.</li>
 *       <li>Kendo UI의 DropDownList 위젯을 커스터마이징</li>
 *   </ul>
 *   @module app/widget/control-dropdown-checkbox
 *   @requires app/main
 */
(function($) {

	var kendo = window.kendo,
		ui = kendo.ui,
		DropDownList = ui.DropDownList,
		SELECT = "select",
		SELECTIONCHANGED = "selectionChanged",
		SELECTED = "k-state-selected",
		CHECKBOX = "custom-multiselect-check-item",
		SELECTALLITEM = "custom-multiselect-selectAll-item",
		MULTISELECTPOPUP = "custom-multiselect-popup",
		EMPTYSELECTION = "custom-multiselect-summary-empty";

	var template = '<input type="checkbox" name="#= {1} #" value="#= {0} #" class="' + CHECKBOX + ' + k-checkbox" />' +
		'<label class="k-checkbox-label"></label>' +
		'<span data-value="#= {0} #">#= {1} #</span>';

	var DropDownCheckBox = DropDownList.extend({
		/**
		 *
		 *   위젯을 초기화 한다.
		 *
		 *   @param {Object} element - 위젯 초기화를 위한 요소 객체
		 *   @param {Object} options - 위젯 초기화에 사용되는 Option 객체
		 *   @function init
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		init: function(element, options) {
			if(options && options.virtual){
				options.template = this.virtualCheckedTemplate.bind(this);
			}else{
				options.template = kendo.template(kendo.format(template, options.dataValueField, options.dataTextField));
			}

			DropDownList.fn.init.call(this, element, options);

			if(this.options.showSelectAll){
				//Default가 전체선택된상태.
				this._oldValue = $.map(["0"], function(item) {
					return item.toString();
				});
			}

			//Use apply box
			if (this.options.applyBox == true) {
				this._createApplyBox();
			}
		},
		options: {
			name: "DropDownCheckBox",
			index: -1,
			dataSource: [],
			showSelectAll: true,
			preSummaryCount: 0,
			emptyText: 'Please Select Item',
			selectionChanged: null,
			selectAllText: "All",
			applyBox: false,
			restrictionNum: null,
			selectedText: null,
			cancelOption:false,
			hasCheckedModel : false,
			//footerTemplate: "<div>TEST</div>",
			changedArgsForApplyBox: {},
			isAbleUnselectAll: false
		},
		/**
		 *
		 *   Virtual 옵션이 적용된 경우 템플릿을 생성하여 리턴한다.
		 *
		 *   @param {Array} data - 위젯에 바인딩되는 데이터 배열
		 *   @function virtualCheckedTemplate
		 *   @returns {String} - 템플릿 문자열
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		virtualCheckedTemplate : function(data){
			var options = this.options;
			var value, text;
			if(options.dataValueField){
				value = data[options.dataValueField];
			}else{
				value = data;
			}
			if(options.dataTextField){
				text = data[options.dataTextField];
			}else{
				text = data;
			}

			var checked = data.checked ? "checked" : "";
			return '<input type="checkbox" name="' + text + '" value="' + value + '" class="' + CHECKBOX + '" ' + checked + '/>' +
			'<span class="dropdown-checkbox ' + checked + '" data-value="' + value + '">' + text + '</span>';
		},
		events: [
			SELECTIONCHANGED
		],
		refresh: function() {
			DropDownList.fn.refresh.call(this);
			this._updateSummary();
			$(this.popup.element).addClass(MULTISELECTPOPUP);
		},
		current: function() {
			return this._current;
		},
		/**
		 *
		 *   위젯에 적용할 DataSource를 설정한다.
		 *
		 *   @param {Object} dataSource - 위젯의 Kendo UI DataSource 객체
		 *   @function setDataSource
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		setDataSource: function(dataSource) {
			DropDownList.fn.setDataSource.call(this, dataSource);
			this.refresh();
		},
		/**
		 *
		 *   전체 아이템이 선택된 상태로 초기화되어 DropDownList를 오픈한다.
		 *
		 *   @function open
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		open: function() {
			this._removeSelectAllItem();
			this._addSelectAllItem();
			DropDownList.fn.open.call(this);
			this.popup.one('close', $.proxy(this._onPopupClosed, this));

			var data = this.dataSource.data();
			var max = data.length;
			var listUl = this.ul;
			// applyBox 옵션을 사용하면서, 데이터가 없는 경우, 적용버튼이 empty template 위로 올라가는 문제 수정을 위한 부분
			if (max === 0) {
				if (listUl) this.ul.closest('.k-list-container').find('.control-dropdown-checkbox-apply-box').css('bottom', 0);
			} else if (listUl) this.ul.closest('.k-list-container').find('.control-dropdown-checkbox-apply-box').css('bottom', 'auto');
		},
		_listBound: function() {
			DropDownList.fn._listBound.call(this);
			if(!this.options.virtual){
				this.selectAll();
			}
		},
		_onPopupClosed: function() {
			this._removeSelectAllItem();
			this._current = null;
			//선택이 전체 해제된 경우, 전체 선택된 상태로 돌아감.
			if(!this.options.isAbleUnselectAll && this.getSelectedItems().length == 0) this.selectAll();
			this._raiseSelectionChanged();
		},
		_raiseSelectionChanged: function() {
			//console.time("[dropdowncheckbox]raise selection changed");
			var data = this.dataSource.data();
			var cntData = data.length;
			var currentValue = this.value();

			var currentValues = $.map((currentValue.length > 0 ? currentValue.split(",") : []).sort(), function(item) {
				return item;
			});

			var oldValues;
			if(this._oldValue){
				oldValues = $.map((this._oldValue || []).sort(), function(item) {
					return item.toString();
				});
			}else{
				oldValues = this._oldValue;
			}

			this._oldValue = $.map(currentValues, function(item) {
				return item.toString();
			});

			if (!cntData) this._oldValue = $.map(["0"], function(item) {
				return item.toString();
			});

			var changedArgs = {
				newValue: currentValues,
				oldValue: oldValues,
				count: cntData
			};
			//            this.options.changedArgsForApplyBox = changedArgs;

			if (oldValues) {
				var hasChanged = ($(oldValues).not(currentValues).length == 0 && $(currentValues).not(oldValues).length == 0) !== true;
				if (hasChanged && !(this.options.applyBox)) {
					this.trigger(SELECTIONCHANGED, changedArgs);
				}
			} else if (currentValue.length > 0 && !(this.options.applyBox)) {
				this.trigger(SELECTIONCHANGED, changedArgs);
			} else if (this.options.isAbleUnselectAll) {
				this.trigger(SELECTIONCHANGED, changedArgs);
			}
			//console.timeEnd("[dropdowncheckbox]raise selection changed");
		},
		_addSelectAllItem: function() {
			if (!this.options.showSelectAll) return;
			//console.time("[dropdowncheckbox]add seelct all item");
			var firstListItem = this.ul.children('li:first');
			var selectAllTxt = this.options.selectAllText;
			var options = this.options;
			if(options.virtual){
				if (firstListItem.length <= 0) {
					this.selectAllListItem = $('<li tabindex="-1" role="option" unselectable="on" class="k-virtual-item k-item ' + SELECTALLITEM + '" data-uid=' + kendo.guid() + '></li>').appendTo(this.ul);
				} else {
					this.selectAllListItem = $('<li tabindex="-1" role="option" unselectable="on" class="k-virtual-item k-item ' + SELECTALLITEM + '" data-uid=' + kendo.guid() + '></li>').insertBefore(firstListItem);
				}
			}else if (firstListItem.length <= 0) {
				this.selectAllListItem = $('<li tabindex="-1" role="option" unselectable="on" class="k-item ' + SELECTALLITEM + '" data-uid=' + kendo.guid() + '></li>').appendTo(this.ul);
			} else {
				this.selectAllListItem = $('<li tabindex="-1" role="option" unselectable="on" class="k-item ' + SELECTALLITEM + '" data-uid=' + kendo.guid() + '></li>').insertBefore(firstListItem);
			}

			var selectAllData = {};
			selectAllData[this.options.dataValueField] = '*';
			selectAllData[this.options.dataTextField] = selectAllTxt;

			this.selectAllListItem.html(this.options.template(selectAllData));
			this._updateSelectAllItem();
			//console.timeEnd("[dropdowncheckbox]add seelct all item");
		},
		_removeSelectAllItem: function() {
			if (this.selectAllListItem) {
				this.selectAllListItem.remove();
			}
			this.selectAllListItem = null;
		},
		_focus: function(li) {
			if (!(this.options.applyBox)) {
				if (this.popup.visible() && li && this.trigger(SELECT, {
					item: li
				})) {
					this.close();
					return;
				}
				this.select(li);
			} else if (this.popup.visible()) {
				this.close();
				return;
			}
		},
		_blur: function() {
			var that = this;
			if (!(that.options.applyBox == true)) {
				that._change();
			}
			that.close();
		},
		/**
		 *
		 *   드랍다운리스트에 바인딩 된 전체 데이터를 선택한 상태로 변경한다.
		 *
		 *   @param {Array} data - 위젯에 바인딩되는 데이터 배열
		 *   @function selectAll
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		selectAll: function(data) {
			var options = this.options;
			if(options.virtual){
				var allItems;
				if(data){
					allItems = data;
				}else{
					allItems = this._getAllValueData();
				}
				var i, max = allItems.length;
				for( i = 0; i < max; i++ ){
					allItems[i].checked = true;
				}
				this.dataSource.fetch();
				this._updateSummary();
				this._removeSelectAllItem();
				this._addSelectAllItem();
				this._updateSelectAllItem();
			}else{
				var unselectedItems = this._getUnselectedListItems();
				this._selectItems(unselectedItems);
			}
		},
		/**
		 *
		 *   드랍다운리스트에 바인딩 된 전체 데이터를 선택 해제 상태로 변경한다.
		 *
		 *   @function unselectAll
		 *   @returns {void} - 리턴 값 없음
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		unselectAll: function() {
			var options = this.options;
			if(options.virtual){
				var allItems = this._getAllValueData();
				var i, max = allItems.length;
				for( i = 0; i < max; i++ ){
					allItems[i].checked = false;
				}
				this.dataSource.fetch();
				this._updateSummary();
				this._removeSelectAllItem();
				this._addSelectAllItem();
				this._updateSelectAllItem();
			}else{
				var selectedItems = this._getSelectedListItems();
				this._selectItems(selectedItems); // will invert the selection
			}
			this._oldValue = void 0;
			if(this.options.emptyText){
				this._textAccessor(this.options.emptyText);
			}
		},
		_selectItems: function(listItems) {
			var that = this;

			$.each(listItems, function(i, item) {
				that._select($(item));
			});
		},
		_select: function(li) {
			//console.time("[dropdowncheckbox]select");
			var that = this,
				value,
				text,
				idx;
			var dfd = new $.Deferred();

			var options = that.options;

			li = that._get(li);
			var checkBox;
			var isChecked;
			if(options.virtual && li && li[0]){
				var ds = this.dataSource;
				var uid = li.attr("data-uid");
				var item = ds.getByUid(uid);
				if(item){
					var span = li.find("span");
					checkBox = li.find("input[type='checkbox']");
					if(item.checked){
						isChecked = false;
						span.removeClass("checked");
					}else{
						isChecked = true;
						span.addClass("checked");
					}
					item.checked = isChecked;
					checkBox.prop("checked", isChecked);

					//dfd.resolve();
					if (this._open) {
						that._current(li);
						that._highlightCurrent();
					}
					//not supported registrict number yet.

					value = [];
					text = [];
					that._updateSummary();
					that._updateSelectAllItem();
					idx = ds.indexOf(item);
					that._accessor(value, idx);

				}else if(this.selectAllListItem && li[0] === this.selectAllListItem[0]){
					checkBox = li.find("input[type='checkbox']");
					if(this._isSelectAll){
						isChecked = false;
					}else{
						isChecked = true;
					}

					if(isChecked){
						this.selectAll();
					}else{
						this.unselectAll();
					}
				}else{
					dfd.fail();
				}
			}else if (li && li[0]) {
				idx = ui.List.inArray(li[0], that.ul[0]);
				if (idx > -1) {
					if (li.hasClass(SELECTED)) {
						li.removeClass(SELECTED);
						that._uncheckItem(li);

						if (this.selectAllListItem && li[0] === this.selectAllListItem[0]) {
							this.unselectAll();
						}
					} else {
						li.addClass(SELECTED);
						that._checkItem(li);

						if (this.selectAllListItem && li[0] === this.selectAllListItem[0]) {
							this.selectAll();
						}
					}

					if (this._open) {
						that._current(li);
						that._highlightCurrent();
					}

					var selecteditems = this._getSelectedListItems();
					var unSelectedItems = this._getUnselectedListItems();
					//If the number of selection restriction is defined, unselected items are dimmed.
					if (that.options.restrictionNum) {
						if (selecteditems.length >= that.options.restrictionNum) {
							unSelectedItems.addClass("k-state-disabled").removeClass("k-state-selected");
							unSelectedItems.find('input').attr('disabled',true);
						} else {
							unSelectedItems.removeClass("k-state-disabled");
							unSelectedItems.find('input').attr('disabled',false);
						}
					}

					value = [];
					text = [];
					$.each(selecteditems, function(indx, selectedItem) {
						var obj = $(selectedItem).children("span").first();
						value.push(obj.attr("data-value"));
						text.push(obj.text());
					});
					that._updateSummary(text);
					that._updateSelectAllItem();
					that._accessor(value, idx);
				}
				//console.timeEnd("[dropdowncheckbox]select");
				//dfd.resolve();
				that.trigger('updatedText');
			} else {
				dfd.fail();
			}
			return dfd.promise();
		},
		_getAllValueListItems: function() {
			if (this.selectAllListItem) {
				return this.ul.children("li").not(this.selectAllListItem[0]);
			}
			return this.ul.children("li");
		},
		_getAllValueData : function(){
			var ds = this.dataSource;
			var data = ds.data();
			var filter = ds.filter();
			var query = new kendo.data.Query(data);
			if(filter){
				query = query.filter(filter);
			}
			return query.toArray();
		},
		_getSelectedListItems: function() {
			return this._getAllValueListItems().filter("." + SELECTED);
		},
		_getCheckedListItems : function(){
			return this.getCheckedData();
		},
		_getUnselectedListItems: function() {
			return this._getAllValueListItems().filter(":not(." + SELECTED + ")");
		},
		_getUncheckedListItems : function(){
			return this.getCheckedData(false);
		},
		_getSelectedItemsText: function() {
			var text = [];
			var selecteditems = this._getSelectedListItems();
			$.each(selecteditems, function(indx, item) {
				var obj = $(item).children("span").first();
				text.push(obj.text());
			});
			return text;
		},
		_getCheckedItemsText : function(){
			var text = [];
			var checkedItems = this.getCheckedData();
			var textField = this.options.dataTextField;
			$.each(checkedItems, function(index, item){
				var textValue = item[textField] ? item[textField] : item;
				text.push(textValue);
			});
			return text;
		},
		_updateSelectAllItem: function() {
			//console.time("[dropdowncheckbox]update seelct all item");
			if (!this.selectAllListItem) return;

			var options = this.options;
			if(options.virtual){
				var allData = this._getAllValueData();
				var allCheckedData = this.getCheckedData();
				if(allData.length == allCheckedData.length){
					this._checkItem(this.selectAllListItem);
					this._isSelectAll = true;
				}else{
					this._uncheckItem(this.selectAllListItem);
					this._isSelectAll = false;
				}
			}else if (this._getAllValueListItems().length == this._getSelectedListItems().length) {
				this._checkItem(this.selectAllListItem);
				this.selectAllListItem.addClass(SELECTED);
			} else {
				this._uncheckItem(this.selectAllListItem);
				this.selectAllListItem.removeClass(SELECTED);
			}
			//console.timeEnd("[dropdowncheckbox]update seelct all item");
		},
		_updateSummary: function(itemsText) {
			//console.time("[dropdowncheckbox]update summary");
			var options = this.options;
			var selectAllTxt = options.selectAllText;
			var diagnosisSelectedText, shortenTxt;
			var I18N = window.I18N;
			if (!itemsText) {
				if(options.virtual){
					itemsText = this._getCheckedItemsText();
				}else{
					itemsText = this._getSelectedItemsText();
				}
			}

			var length = itemsText.length;
			if (length == 0) {
				this._inputWrapper.addClass(EMPTYSELECTION);
				if (!this.dataSource.data().length) this._textAccessor(this.options.selectAllText);
				else this._textAccessor(this.options.emptyText);
				return;
			}
			this._inputWrapper.removeClass(EMPTYSELECTION);

			if(options.virtual){
				var allData = this._getAllValueData();
				if (length <= this.options.preSummaryCount) {
					this._textAccessor(itemsText.join(", "));
				} else if (length == allData.length) {
					if(this.options.selectedText == "ellipsis"){
						diagnosisSelectedText = "";
						shortenTxt = "";
						if(length > 1){
							if(itemsText[0].length > 10){
								shortenTxt = itemsText[0].substring(0, 11) + "...";
							}else{
								shortenTxt = itemsText[0];
							}
							diagnosisSelectedText = shortenTxt + " (+" + String(length - 1) + ")";
						}else{
							diagnosisSelectedText = itemsText[0];
						}
						this._textAccessor(diagnosisSelectedText);
					}else{
						this._textAccessor(selectAllTxt);
					}
				} else if(length == allData.length){
					this._textAccessor(selectAllTxt);
				}else if(this.options.selectedText == "ellipsis"){
					diagnosisSelectedText = "";
					shortenTxt = "";
					if(length > 1){
						if(itemsText[0].length > 10){
							shortenTxt = itemsText[0].substring(0, 11) + "...";
						}else{
							shortenTxt = itemsText[0];
						}
						diagnosisSelectedText = shortenTxt + " (+" + String(length - 1) + ")";
					}else{
						diagnosisSelectedText = itemsText[0];
					}
					this._textAccessor(diagnosisSelectedText);
				}else{
					this._textAccessor(I18N.prop("COMMON_SELECTED_FILTER", length));
				}
			}else if (length <= this.options.preSummaryCount) {
				this._textAccessor(itemsText.join(", "));
			} else if (length == this.dataSource.data().length) {
				if(this.options.selectedText == "ellipsis"){
					diagnosisSelectedText = "";
					shortenTxt = "";
					if(length > 1){
						if(itemsText[0].length > 10){
							shortenTxt = itemsText[0].substring(0, 11) + "...";
						}else{
							shortenTxt = itemsText[0];
						}
						diagnosisSelectedText = shortenTxt + " (+" + String(length - 1) + ")";
					}else{
						diagnosisSelectedText = itemsText[0];
					}
					this._textAccessor(diagnosisSelectedText);
				}else{
					this._textAccessor(selectAllTxt);
				}
			} else if(length == this.listView.dataSource._view.length){
				this._textAccessor(selectAllTxt);
			}else if(this.options.selectedText == "ellipsis"){
				diagnosisSelectedText = "";
				shortenTxt = "";
				if(length > 1){
					if(itemsText[0].length > 10){
						shortenTxt = itemsText[0].substring(0, 11) + "...";
					}else{
						shortenTxt = itemsText[0];
					}
					diagnosisSelectedText = shortenTxt + " (+" + String(length - 1) + ")";
				}else{
					diagnosisSelectedText = itemsText[0];
				}
				this._textAccessor(diagnosisSelectedText);
			}else{
				this._textAccessor(I18N.prop("COMMON_SELECTED_FILTER", length));
			}

			//console.timeEnd("[dropdowncheckbox]update summary");
		},
		_checkItem: function(itemContainer) {
			if (!itemContainer) return;
			itemContainer.children("input").prop("checked", true);
			var options = this.options;
			if(options.virtual){
				itemContainer.find("span").addClass("checked");
			}

		},
		_uncheckItem: function(itemContainer) {
			if (!itemContainer) return;
			itemContainer.children("input").removeAttr("checked");
			var options = this.options;
			if(options.virtual){
				itemContainer.find("span").removeClass("checked");
			}
		},
		_isItemChecked: function(itemContainer) {
			return itemContainer.children("input:checked").length > 0;
		},
		/**
		 *
		 *   선택된 단일 또는 복수의 아이템을 리턴한다.
		 *
		 *   @function getSelectedItems
		 *   @returns {Array} - 선택된 아이템을 저장한 배열
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		getSelectedItems: function() {
			var that = this;
			var checkedItems = that._getSelectedListItems();
			return checkedItems;
		},
		_createApplyBox: function() {
			var I18N = window.I18N;
			var self = this;
			var myElement = self.element;
			var divListContainer = myElement.data("kendoDropDownCheckBox").list;
			var divBtnWrapper = $("<div class='control-dropdown-checkbox-apply-box'></div>");
			var btnApply = $("<button class='k-button control-dropdown-checkbox-btn-apply' data-event='diagnosisgrouplistapply'>" + I18N.prop("COMMON_BTN_APPLY") + "</button>");
			var btnCancel = $("<button class='k-button control-dropdown-checkbox-btn-cancel' data-event='grouplistcancel'>" + I18N.prop("COMMON_BTN_CANCEL") + "</button>");
			divListContainer.append(divBtnWrapper);
			divBtnWrapper.append(btnCancel).append(btnApply);
			//CLICK Event for APPLY button to trigger CHANGE
			divBtnWrapper.on("click", ".k-button[data-event=diagnosisgrouplistapply]", function(e) {
				var currentValue = self.value();

				var currentValues = $.map((currentValue.length > 0 ? currentValue.split(",") : []).sort(), function(item) {
					return item;
				});

				var changedArgs = {
					newValue: currentValues
				};
				self.trigger(SELECTIONCHANGED, changedArgs);
				if (self.popup.visible()) {
					self.close();
					self._change();
					self.close();
					return;
				}
			});
			//CLICK Event for CANCEL button to trigger CLOSE List popup
			divBtnWrapper.on("click", ".k-button[data-event=grouplistcancel]", function(e) {
				if(self.options.virtual){
					if(self.options.cancelOption){
						if(!self._oldValue){
							if(!self.options.isAbleUnselectAll){
								self.selectAll();
							}
						}else{
							var oldCheckedData = self.getOldCheckedData(self._oldValue);
							self.unselectAll();
							self.selectAll(oldCheckedData);
						}
					}
				}else{
					var listData = self.dataSource.data();
					var checkIndexList = [];
					var checkIndex;
					var checkItem = $('#' + self.element[0].id + '-list').find('.k-list li');
					if(self.options.cancelOption){
						if(!self._oldValue){
							if(!self.options.isAbleUnselectAll){
								self.selectAll();
							}
						}else{
							for(var i = 0; i < self._oldValue.length; i++){
								for(var j = 0; j < listData.length; j++){
									if(listData[j].id == self._oldValue[i]){
										checkIndex = self.options.showSelectAll ? j + 1 : j;
										checkIndexList.push(checkIndex);
									}
								}
							}
							self.unselectAll();
							for(var k = 0; k < checkIndexList.length; k++){
								self._selectItems(checkItem.eq(checkIndexList[k]));
							}
						}
					}
				}
				if (self.popup.visible()) {
					self.close();
					return;
				}
			});
			//Apply Style CSS for Wrapper of buttons
			divBtnWrapper.css({
				position: "absolute",
				left: "-1px",
				width: myElement.data("kendoDropDownCheckBox").wrapper.width() - 2,
				background: "#fff",
				textAlign: "center",
				border: "1px solid #e1e1e1",
				borderTop: "none",
				paddingBottom: "5px"
			});
			divListContainer.hover(function(e) {
				divBtnWrapper.css({
					border: "1px solid #0081c6",
					"border-top": "none"
				});
			}, function(e) {
				divBtnWrapper.css({
					border: "1px solid #e1e1e1",
					borderTop: "none"
				});
			});
		},
		/**
		 *
		 *   임의의 값을 드랍다운리스트에 적용한다. 파라미터가 없는 경우 현재 선택된 값을 리턴한다.
		 *
		 *   @param {String} value - 적용할 값
		 *   @function value
		 *   @returns {String} - 현재 선택된 값
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		value: function(value) {
			var that = this,
				valuesList = [];

			var options = that.options;
			if (typeof value !== "undefined") {
				if (!$.isArray(value)) {
					valuesList.push(value);
					this._oldValue = valuesList; // to allow for selectionChanged event
				} else {
					valuesList = value;
					this._oldValue = value; // to allow for selectionChanged event
				}

				if(options.virtual){
					this.unselectAll();
					var checkData = [];
					$.each(valuesList, function(indx, item) {
						var hasValue;
						if (item !== null) {
							item = item.toString();
						}
						that._selectedValue = item;
						hasValue = value || (that.options.optionLabel && !that.element[0].disabled && value === "");
						//if (hasValue && that._fetchItems(value)) {
						if(!hasValue){
							return;
						}

						var data = that.findItemFromDataSource(item);
						if(data){
							checkData.push(data);
						}
					});
					that.selectAll(checkData);
				}else{

					$(that.ul[0]).children("li").removeClass(SELECTED);
					$("input", that.ul[0]).removeAttr("checked");

					$.each(valuesList, function(indx, item) {
						var i, hasValue;
						if (item !== null) {
							item = item.toString();
						}
						that._selectedValue = item;
						hasValue = value || (that.options.optionLabel && !that.element[0].disabled && value === "");
						//if (hasValue && that._fetchItems(value)) {
						if(!hasValue){
							return;
						}
						// idx = that._index(item);
						// if (idx > -1) {
						// 	that.select(idx);
						for(i = 0; i < that._getAllValueListItems().length; i++ ) {
							if($(that._getAllValueListItems()[i]).find("span").data("value") == item) {
								that.select(that._getAllValueListItems().eq(i));
								break;
							}
						}
					});
					that._updateSummary();
				}

			} else if(options.virtual){
				var checkedItems = this.getCheckedData();
				var valueField = options.dataValueField;
				return $.map(checkedItems, function(item){
					return item[valueField] ? item[valueField] : item;
				}).join();
			}else{
				var selecteditems = this._getSelectedListItems();
				return $.map(selecteditems, function(item) {
					var obj = $(item).children("span").first();
					return obj.attr("data-value");
				}).join();
			}

		},
		/**
		 *
		 *   선택 또는 선택 해제 상태인 데이터를 리턴한다.
		 *
		 *   @param {Boolean} isChecked - 선택 또는 선택 해제 상태의 값
		 *   @function getCheckedData
		 *   @returns {Array} - 선택 또는 선택 해제된 아이템 배열
		 *   @alias module:control-dropdown-checkbox
		 *
		 */
		getCheckedData : function(isChecked){
			if(typeof isChecked === "undefined"){
				isChecked = true;
			}
			var ds = this.dataSource;
			var data = ds.data();
			var filter = ds.filter();
			var query = new kendo.data.Query(data);
			if(filter){
				query = query.filter(filter);
			}
			query = query.filter({field : "checked", operator : "eq", value : isChecked});
			return query.toArray();
		},
		getOldCheckedData : function(oldValues){
			var options = this.options;
			var valueField = options.dataValueField;
			var ds = this.dataSource;
			var data = ds.data();
			var i, j, max = oldValues.length, size = data.length;
			var item, oldValue, dataVal;
			var results = [];

			for( i = 0; i < max; i++ ){
				oldValue = oldValues[i];
				for( j = 0; j < size; j++ ){
					item = data[j];
					if(valueField){
						dataVal = item[valueField];
					}else{
						dataVal = item;
					}
					if(oldValue == dataVal){
						results.push(item);
					}
				}
			}

			return results;
		},
		findItemFromDataSource : function(value){
			var options = this.options;
			var valueField = options.dataValueField;
			var ds = this.dataSource;
			var data = ds.data();
			var val, item, i, size = data.length;
			for( i = 0; i < size; i++ ){
				item = data[i];
				if(valueField){
					val = item[valueField];
				}else{
					val = item;
				}
				if(val == value){
					return item;
				}
			}
			return null;
		}
	});

	ui.plugin(DropDownCheckBox);

})(jQuery);
//# sourceURL=widget/common-dropdown-checkbox.js
