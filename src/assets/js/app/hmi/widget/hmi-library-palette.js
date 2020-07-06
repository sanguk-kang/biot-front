(function(window, $){
	"use strict";
	var kendo = window.kendo, ui = kendo.ui, keys = kendo.keys, extend = $.extend, proxy = $.proxy, each = $.each, isArray = $.isArray, template = kendo.template, Widget = ui.Widget, HierarchicalDataSource = kendo.data.HierarchicalDataSource, excludedNodesRegExp = /^(ul|a|div)$/i, NS = '.kendoPanelBar', IMG = 'img', HREF = 'href', LAST = 'k-last', LINK = 'k-link', LINKSELECTOR = '.' + LINK, ERROR = 'error', ITEM = '.k-item', GROUP = '.k-group', VISIBLEGROUP = GROUP + ':visible', IMAGE = 'k-image', FIRST = 'k-first', CHANGE = 'change', EXPAND = 'expand', SELECT = 'select', CONTENT = 'k-content', ACTIVATE = 'activate', COLLAPSE = 'collapse', DATABOUND = 'dataBound', MOUSEENTER = 'mouseenter', MOUSELEAVE = 'mouseleave', CONTENTLOAD = 'contentLoad', UNDEFINED = 'undefined', ACTIVECLASS = 'k-state-active', GROUPS = '> .k-panel', CONTENTS = '> .k-content', STRING = 'string', FOCUSEDCLASS = 'k-state-focused', DISABLEDCLASS = 'k-state-disabled', SELECTEDCLASS = 'k-state-selected', SELECTEDSELECTOR = '.' + SELECTEDCLASS, HIGHLIGHTCLASS = 'k-state-highlight', ACTIVEITEMSELECTOR = ITEM + ':not(.k-state-disabled)', clickableItems = '> ' + ACTIVEITEMSELECTOR + ' > ' + LINKSELECTOR + ', .k-panel > ' + ACTIVEITEMSELECTOR + ' > ' + LINKSELECTOR, disabledItems = ITEM + '.k-state-disabled > .k-link', selectableItems = '> li > ' + SELECTEDSELECTOR + ', .k-panel > li > ' + SELECTEDSELECTOR, defaultState = 'k-state-default', ARIA_DISABLED = 'aria-disabled', ARIA_EXPANDED = 'aria-expanded', ARIA_HIDDEN = 'aria-hidden', ARIA_SELECTED = 'aria-selected', VISIBLE = ':visible', EMPTY = ':empty', SINGLE = 'single';

	var rendering = {
		aria: function (item) {
			var attr = '';
			if (item.items || item.content || item.contentUrl || item.expanded) {
				attr += ARIA_EXPANDED + '=\'' + (item.expanded ? 'true' : 'false') + '\' ';
			}
			if (item.enabled === false) {
				attr += ARIA_DISABLED + '=\'true\'';
			}
			return attr;
		},
		wrapperCssClass: function (group, item) {
			var result = 'k-item', index = item.index;
			if (item.enabled === false) {
				result += ' ' + DISABLEDCLASS;
			} else if (item.expanded === true) {
				result += ' ' + ACTIVECLASS;
			} else {
				result += ' k-state-default';
			}

			if (index === 0) {
				result += ' k-first';
			}
			if (index == group.length - 1) {
				result += ' k-last';
			}
			if (item.cssClass) {
				result += ' ' + item.cssClass;
			}
			return result;
		},
		textClass: function (item, group) {
			var result = LINK;
			if (group.firstLevel) {
				result += ' k-header';
			}
			//Overriding 하여 추가
			if (item.selected) {
				result += ' ' + SELECTEDCLASS;
			}
			return result;
		},
		textAttributes: function (url) {
			return url ? ' href=\'' + url + '\'' : '';
		},
		arrowClass: function (item) {
			var result = 'k-icon';
			result += item.expanded ? ' k-panelbar-collapse k-i-arrow-n' : ' k-panelbar-expand k-i-arrow-s';
			return result;
		},
		text: function (item) {
			return item.encoded === false ? item.text : kendo.htmlEncode(item.text);
		},
		groupAttributes: function (group) {
			return group.expanded !== true ? ' style=\'display:none\'' : '';
		},
		groupCssClass: function () {
			return 'k-group k-panel';
		},
		contentAttributes: function (content) {
			return content.item.expanded !== true ? ' style=\'display:none\'' : '';
		},
		content: function (item) {
			return (item.content ? item.content : item.contentUrl) ? '' : '&nbsp;';
		},
		contentUrl: function (item) {
			return item.contentUrl ? 'href="' + item.contentUrl + '"' : '';
		}
	};

	function searchHighlightReplacer(str){
		return '<span class=search-highlight>' + str + '</span>';
	}

	//아이템 Sort Order를 위해 드래그 시, Scroll 되기 위함
	function isScrollable(element) {
		if (element && element.className && typeof element.className === 'string' && element.className.indexOf('k-auto-scrollable') > -1) {
			return true;
		}
		var overflow = kendo.getComputedStyles(element, ['overflow']).overflow;
		//조건 1개 더 추가 overflow가 "auto hidden" 으로 적용되어 있을 경우
		return overflow == 'auto' || overflow == 'scroll' ||
				(overflow && (overflow.indexOf('auto') !== -1 || overflow.indexOf('scroll') !== -1));
	}
	kendo.isScrollable = isScrollable;

	function updateItemHtml(item) {
		var wrapper = item, group = item.children('ul'), toggleButton = wrapper.children('.k-link').children('.k-icon');
		if (item.hasClass('k-panelbar')) {
			return;
		}
		if (!toggleButton.length && group.length) {
			toggleButton = $('<span class=\'k-icon\' />').appendTo(wrapper);
		} else if (!group.length || !group.children().length) {
			toggleButton.remove();
			group.remove();
		}
	}

	var CREATE_BTN_TEMPLATE = function(){
		var I18N = window.I18N;
		return '<button class="k-button create-btn">' + I18N.prop("COMMON_BTN_CREATE") + '</button>';
	};

	var SEARCH_FIELD_TEMPLATE = function(){
		var I18N = window.I18N;
		return '<span class="search-field-wrapper"><input type="text" class="k-input search-field" placeholder="' + I18N.prop("HMI_LIBRARY_SEARCH_PLACEHOLDER") + '"/>' +
			'<button class="ic ic-bt-input-search"></button></span>';
	};

	var BUTTONS_TEMPLATE = function(type){
		var I18N = window.I18N;
		var template = "";
		if(type == "create") template = '<button class="k-button edit-btn">' + I18N.prop("COMMON_BTN_EDIT") + '</button>';
		else if(type == "delete") template = '<button class="k-button delete-btn">' + I18N.prop("COMMON_BTN_DELETE") + '</button>';
		return template;
	};

	var DEFAULT_GRID_OPTIONS = {
		height: "100%",
		scrollable: false,
		sortable: false,
		filterable: false,
		pageable: false,
		rowHeaders: true
	};

	var IMAGE_COLUMN_TEMPLATE = function(data){
		var I18N = window.I18N;
		var html = '';
		if(data.name) html = '<div class="text-left image-wrapper" data-id="' + data.id + '"><img class="image" src="' + data.image + '"/><span class="image-file-name">' + data.name + '</span><i class="ic ic-close" data-id="' + data.id + '"></i></div>';
		else html = '<div class="text-left image-wrapper" data-id="' + data.id + '"><i class="ic ic-btn-add-sm"></i>' + I18N.prop("HMI_LIBRARY_ADD_IMAGE") + "</div>";
		return html;
	};

	var RANGE_COLUMN_TEMPLATE = function(data){
		var html = '<span class="list-range-validator min" data-type="numeric" data-required="true">' +
						'<input data-id="' + data.id + '" type="text" class="k-input min" required style="width:120px;" value="' + data.min + '"/>' +
					'</span>' +
					'<span class="divider">~</span>' +
					'<span class="list-range-validator max" data-type="numeric" data-required="true">' +
						'<input data-id="' + data.id + '" type="text" class="k-input max" required style="width:120px;" value="' + data.max + '"/>' +
					'</span>';
		return html;
	};

	var DELETE_COLUMN_TEMPLATE = function(data){
		return '<div class="text-center"><span class="ic ic-btn-remove-lg" data-id="' + data.id + '"></span></div>';
	};

	var MAX_STEP = 21, MIN_STEP = 1;
	var TOTAL_MIN = -2147483648, TOTAL_MAX = 2147483647;
	var COMPONENT_IMAGE_API = "/dms/hmi/components/{id}/images/{name}";

	var HmiPalette = kendo.ui.HmiPalette;

	//data-bind:invisible,visible로 대응이 안되므로 아래와 같이 Custom Binder 구현
	kendo.data.binders.hmiLibraryPopupTypeVisible = kendo.data.Binder.extend({
		refresh: function() {
			var value = this.bindings['hmiLibraryPopupTypeVisible'].get();
			var element = $(this.element);
			var type = element.data("type");
			if(type == value) element.show();
			else element.hide();
		}
	});

	var widget = HmiPalette.extend({
		options: {
			name : "HmiLibraryPalette",
			creatable : true,
			searchable : true,
			editable : true,
			deletable : true,
			template : function(data){
				var item = data.item;
				if(item.hasChildren) return item.name;
				var imageUrl = "";
				if(item.thumbnailImage) imageUrl = item.thumbnailImage;
				else if(item.images && item.images[0]) imageUrl = item.images[0].image;

				return "<div class='hmi-palette-item' data-id='" + item.id + "' title='" + item.name + "'>" +
					"<span class='hmi-palette-image' style='background-image:url(" + imageUrl + ");'></span>" +
					"<span class='hmi-palette-text'>" + item.name + "</span></div>";
			},
			events : [
				"save"
			]
		},
		init: function (element, options) {
			var that = this;
			$(element).addClass("hmi-library-palette-widget");
			that._wrapper = $("<div class='hmi-library-palette-widget-wrapper'/>");
			var parent = $(element).parent();
			that._wrapper.append(element);
			parent.append(that._wrapper);
			HmiPalette.fn.init.call(this, element, options);
			that.wrapper = that._wrapper;
			delete that._wrapper;
			options = that.options;
			if(options.creatable || options.searchable){
				that._createSearchWrapper();
				if(options.creatable) that._createCreateButton();
				if(options.searchable) that._createSearch();
			}

			if(options.editable || options.deletable){
				that._createbuttonWrapper();
				if(options.editable) that._createEditButton();
				if(options.deletable) that._createDeleteButton();
			}

			//that._sortable();

			that._initLibraryPopup();
			var LoadingPanel = window.CommonLoadingPanel;
			that.loadingPanel = new LoadingPanel();
		},
		_hasChildren : function(item){
			var that = this;
			var ds = that.dataSource;
			var originalData = ds._pristineData;
			var i, max = originalData.length;
			var hasChild = true;
			for( i = 0; i < max; i++ ){
				if(originalData[i].id == item.id){
					if(originalData[i].items.length < 1) hasChild = false;
					break;
				}
			}
			return hasChild;
		},
		//펼쳐질 시, 하위 아이템이 없을 경우 오동작 하는 부분을 막기위해서 Override. 아이템이 없으면 무시하는 코드 추가
		_click: function (target) {
			var that = this, element = that.element, prevent, contents, href, isAnchor;
			if (target.parents('li.' + DISABLEDCLASS).length) {
				return;
			}
			if (target.closest('.k-widget')[0] != element[0]) {
				return;
			}
			var link = target.closest(LINKSELECTOR), item = link.closest(ITEM);
			that._updateSelected(link);
			var wrapper = item.children('.k-group,.k-content');
			var dataItem = this.dataItem(item);
			//아이템이 없으면 무시한다.
			//expand하여 load()되지 않으면 dataSource.data()의 children은 업데이트가 안된 상태이므로 원본데이터로 비교하는 _hasChildren 함수 추가.
			if(!that._hasChildren(dataItem)) return;

			if (!wrapper.length && (that.options.loadOnDemand && dataItem && dataItem.hasChildren || this._hasChildItems(item) || item.content || item.contentUrl)) {
				wrapper = that._addGroupElement(item);
			}
			contents = item.find(GROUPS).add(item.find(CONTENTS));
			href = link.attr(HREF);
			isAnchor = href && (href.charAt(href.length - 1) == '#' || href.indexOf('#' + that.element[0].id + '-') != -1);
			prevent = !!(isAnchor || contents.length);
			if (contents.data('animating')) {
				return prevent;
			}
			if (that._triggerEvent(SELECT, item)) {
				prevent = true;
			}
			if (prevent === false) {
				return;
			}
			if (that.options.expandMode == SINGLE) {
				if (that._collapseAllExpanded(item)) {
					return prevent;
				}
			}
			if (contents.length) {
				var visibility = contents.is(VISIBLE);
				if (!that._triggerEvent(!visibility ? EXPAND : COLLAPSE, item)) {
					prevent = that._toggleItem(item, visibility);
				}
			}
			return prevent;
		},
		_attachEvent : function(){
			var that = this;
			HmiPalette.fn._attachEvent.call(that);
			that.bind("change", that._selectionChangeEvt.bind(that));
		},
		_selectionChangeEvt : function(e){
			var that = this;
			that._updateButtonStateFromSelectedData(e.item);
		},
		_dataBoundEvt : function(e){
			var that = this;
			HmiPalette.fn._dataBoundEvt.call(that, e);
			that.highlightSearchResult();
			that._sortable();
		},
		highlightSearchResult : function(){
			var that = this;
			var keywords = that.searchField.val();
			if(keywords){
				var elements = that.items();
				var text, itemEl, i, max = elements.length;
				var regex = new RegExp(keywords, "gi");

				for( i = 0; i < max; i++ ){
					itemEl = $(elements[i]);
					if(!itemEl.hasClass("k-header")){
						itemEl = itemEl.find(".hmi-palette-text");
						text = itemEl.html();
						text = text.replace(regex, searchHighlightReplacer);
						itemEl.html(text);
					}
				}
			}
		},
		_activateEvt : function(e){
			var that = this;
			//var selectedData = that.getSelectedData();
			//기존에 선택된 컴포넌트 선택 해제
			//if(selectedData) selectedData.set("selected", false);
			//if(that._selectedInSearchData) that._selectedInSearchData.set("selected", true);
			that._updateButtonStateFromSelectedData();
			HmiPalette.fn._activateEvt.call(that, e);
			//data의 _loaded 값이 초기화 되지 않아 dataSource에 filter를 걸 경우(검색 시,) panelbar에서 items가 정상적으로 생성되지 않는 현상 발생으로
			//값 초기화
			//extend 하면서 해당 코드 삭제 2019.10.16
			/*if(e){
				var dataItem = that.dataItem(e.item);
				if(dataItem){
					dataItem._loaded = void 0;
				}
			}*/
		},
		_updateButtonStateFromSelectedData : function(selectedItem){
			var that = this, options = that.options;
			if(selectedItem){
				//현재 선택된 아이템을 제외하고 모두 selected를 false로 변경
				var ds = that.dataSource;
				var item, children, data = ds.data(), i, max = data.length;
				for( i = 0; i < max; i++ ){
					item = data[i];
					if(item.expanded){
						children = item.children;
						children = children.data();
						children.forEach(function(e){
							if(e.id != selectedItem.id) e.selected = false;
						});
						break;
					}
				}
			}
			var selectedData = that.getSelectedData();
			var isSelected = selectedData ? true : false;
			if(options.editable) that.editButton.prop("disabled", !isSelected);
			if(options.deletable) that.deleteButton.prop("disabled", !isSelected);
		},
		//라이브러리 추가/편집 팝업 생성
		_initLibraryPopup : function(){
			var that = this;
			var I18N = window.I18N;
			var popupSaveEvt = that._onSavePopup.bind(that);
			var popupCancelEvt = that._onCancelPopup.bind(that);
			that.popup = $("<div class='hmi-library-palette-dialog'/>").kendoDetailDialog({
				title : I18N.prop("HMI_ADD_LIBRARY"),
				width : 800,
				height : 826,
				buttonsIndex : { CANCEL : 0, SAVE : 1 },
				isCustomActions : true,
				//enableSaveBtnOnInputChange : false,
				enableSaveBtnCondition : that._validatePopup,
				actions : [
					{text : I18N.prop("COMMON_BTN_CANCEL"),visible : false, action : popupCancelEvt},
					{text : I18N.prop("COMMON_BTN_SAVE"),visible : false, action : popupSaveEvt}
				],
				onTypeChange : function(e){
					var popup = e.sender;
					var BTN = e.sender.BTN;
					popup.setEditable(true);
					popup.setActions(BTN.SAVE, { visible : true });
					popup.setActions(BTN.CLOSE, { visible : true });
					var element = popup.element;
					var currentData = popup.getSelectedData();
					var images = currentData.images;
					var i, max = images.length;
					for( i = 0; i < max; i++ ){
						images[i].index = i + 1;
					}

					// 백엔드로부터 받는 데이터는 hmi-model에서 처리 필요.
					var imagesOfType = {
						"Controlled" : [
							{ id : kendo.guid(), name : null, status : "OFF" },
							{ id : kendo.guid(), name : null, status : "ON" }
						],
						"Toggle" : [
							{ id : kendo.guid(), name : null, status : "OFF" },
							{ id : kendo.guid(), name : null, status : "ON" }
						],
						"Multi" : [{
							id : kendo.guid(),
							index : 1,
							name : null,
							min : 0,
							max : 100
						}]
					};

					imagesOfType[currentData.type] = images;

					var gridOptions = $.extend({}, true, DEFAULT_GRID_OPTIONS);
					gridOptions.columns = [{
						field : "status",
						title : I18N.prop("COMMON_STATUS"),
						width : 128
					}, {
						field : "name",
						title : I18N.prop("HMI_IMAGE"),
						template : IMAGE_COLUMN_TEMPLATE
					}];
					var controlTypeImageListElem = element.find(".image-list.controlled-type");
					var toggleTypeImageListElem = element.find(".image-list.toggle-type");
					var multiTypeImageListElem = element.find(".image-list.multi-type");
					if(!controlTypeImageListElem.data("kendoGrid")){
						gridOptions.dataSource = imagesOfType.Controlled;
						popup.controlledTypeImageList = controlTypeImageListElem.kendoGrid(gridOptions).data("kendoGrid");
						popup.controlledTypeImageList.bind("dataBound", that._dataBoundEvtOtherImageList.bind(that));
					}

					if(!toggleTypeImageListElem.data("kendoGrid")){
						gridOptions.dataSource = imagesOfType.Toggle;
						popup.toggleTypeImageList = toggleTypeImageListElem.kendoGrid(gridOptions).data("kendoGrid");
						popup.toggleTypeImageList.bind("dataBound", that._dataBoundEvtOtherImageList.bind(that));
					}

					gridOptions.columns = [{
						field : "index",
						title : I18N.prop("HMI_LIBRARY_MULTI_STEPS"),
						width : 55
					}, {
						//Range로 변경 필요
						field : "range",
						title : I18N.prop("HMI_LIBRARY_MULTI_RANGE"),
						width : 375,
						template : RANGE_COLUMN_TEMPLATE
					}, {
						field : "name",
						title : I18N.prop("HMI_IMAGE"),
						template : IMAGE_COLUMN_TEMPLATE
					}, {
						field : "delete",
						title : I18N.prop("COMMON_BTN_DELETE"),
						template : DELETE_COLUMN_TEMPLATE,
						width : 64
					}];

					if(!multiTypeImageListElem.data("kendoGrid")){
						gridOptions.dataSource = imagesOfType.Multi;
						gridOptions.scrollable = true;
						gridOptions.dataBound = function(e){
							var grid = e.sender, el = grid.element;
							var ds = grid.dataSource;
							var data = ds.data();
							//ROW 추가 및 삭제 버튼에 대한 활성화/비활성화  처리
							if(data.length <= MIN_STEP){
								el.find("tbody > tr:eq(0) .ic.ic-btn-remove-lg").addClass("disabled");
							}else{
								el.find("tbody > tr:eq(0) .ic.ic-btn-remove-lg").removeClass("disabled");
							}

							var wrapper = el.closest("div.multi-type");
							var imageAddBtn = wrapper.find(".image-list-add .ic-btn-add-lg");
							if(data.length >= MAX_STEP){
								imageAddBtn.addClass("disabled");
							}else{
								imageAddBtn.removeClass("disabled");
							}
						};
						popup.multiTypeImageList = multiTypeImageListElem.kendoGrid(gridOptions).data("kendoGrid");
						popup.multiTypeImageList.bind("dataBound", that._dataBoundEvtMultiImageList.bind(that));
						popup.multiTypeImageList.refresh();
					}
				},
				contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-detail-content"></div></div>',
				detailContentTemplate : '<div class="hmi-palette-library-popup-detail">' +
										'<div class="field-row">' +
											'<span class="field-col"><span class="field-name">' + I18N.prop("COMMON_NAME") + '</span></span>' +
											'<span class="field-col">' +
												'<span class="field-value">' +
													'<span class="library-name" data-role="commonvalidator" data-type="hmiLibraryName" data-bind="events:{validate:events.onNameValidate} data-required="true">' +
														'<input type="text" class="k-input"  data-bind="value: name" placeholder="' + I18N.prop("COMMON_NAME") + '" required style="width:100%;"/>' +
													'</span>' +
												'</span>' +
											'</span>' +
										'</div>' +
										'<div class="field-row">' +
											'<span class="field-col"><span class="field-name top">' + I18N.prop("HMI_TYPE") + '</span></span>' +
											'<span class="field-col">' +
												'<span class="field-value">' +
													'<p>' +
														'<input type="radio" class="k-radio" name="library-type" id="library-type_control" value="Controlled" data-bind="checked:type, events:{change:events.onChangeType}"/>' +
														'<label class="k-radio-label" for="library-type_control">' + I18N.prop("HMI_CONTROLLED_TYPE") + '</label>' +
													'</p>' +
													'<p>' +
														'<input type="radio" class="k-radio" name="library-type" id="library-type_toggle" value="Toggle" data-bind="checked:type, events:{change:events.onChangeType}"/>' +
														'<label class="k-radio-label" for="library-type_toggle">' + I18N.prop("HMI_TOGGLE_TYPE") + '</label>' +
													'</p>' +
													'<p>' +
														'<input type="radio" class="k-radio" name="library-type" id="library-type_multi" value="Multi" data-bind="checked:type, events:{change:events.onChangeType}"/>' +
														'<label class="k-radio-label" for="library-type_multi">' + I18N.prop("HMI_MULTI_TYPE") + '</label>' +
													'</p>' +
												'</span>' +
											'</span>' +
										'</div>' +
										'<div class="controlled-type" data-type="Controlled" data-bind="hmiLibraryPopupTypeVisible:type">' +
											'<div class="field-row">' +
												'<span class="field-col"><span class="field-name">' + I18N.prop("HMI_TAB_CONTROL") + '</span></span>' +
												'<span class="field-col">' +
													'<span class="field-value">' +
														'<input class="hmi-library-control-type" data-role="dropdownlist"' +
															'data-text-field="text" data-value-field="id" data-bind="value: controlType, source: controlTypes, events:{change:events.onChangeControlType}"/>' +
													'</span>' +
												'</span>' +
											'</div>' +
											'<div class="field-row">' +
												'<span class="field-name">' + I18N.prop("HMI_LIBRARY_LIST") + ' (<span>2</span>)</span>' +
												'<div class="field-row">' +
													'<table class="image-list controlled-type"></table>' +
												'</div>' +
											'</div>' +
										'</div>' +
										'<div class="toggle-type" data-type="Toggle" data-bind="hmiLibraryPopupTypeVisible:type">' +
											'<div class="field-row">' +
												'<span class="field-name">' + I18N.prop("HMI_LIBRARY_LIST") + ' (<span>2</span>)</span>' +
												'<div class="field-row">' +
													'<table class="image-list toggle-type"></table>' +
												'</div>' +
											'</div>' +
										'</div>' +
										'<div class="multi-type" data-type="Multi" data-bind="hmiLibraryPopupTypeVisible:type">' +
											'<div class="field-row>"' +
												'<span class="field-col">' +
													'<span class="field-name">' + I18N.prop("HMI_VALUE") + '</span>' +
												'</span>' +
												'<span class="field-col">' +
													'<span class="field-value">' +
														'<p>' +
															'<span class="field-col">' +
																'<span class="label">' + I18N.prop("HMI_LIBRARY_MULTI_MINIMUM") + '</span>' +
																'<span class="field min total" data-role="commonvalidator" data-type="hmiTotalMinMax" data-min="' + TOTAL_MIN + '" data-max="' + TOTAL_MAX + '" data-bind="events:{validate:events.onMinValidate}" data-required="true">' +
																	'<input type="text" class="k-input min total" data-bind="value: min, events:{change:events.onMinMaxChange}" required style="width:120px;"/>' +
																'</span>' +
															'</span>' +
															'<span class="field-col">' +
																'<span class="divider">~</span>' +
															'</span>' +
															'<span class="field-col">' +
																'<span class="label">' + I18N.prop("HMI_LIBARRY_MULTI_MAXIMUM") + '</span>' +
																'<span class="field max total" data-role="commonvalidator" data-type="hmiTotalMinMax" data-min="' + TOTAL_MIN + '" data-max="' + TOTAL_MAX + '" data-bind="events:{validate:events.onMaxValidate}," data-required="true">' +
																	'<input type="text" class="k-input max total" data-bind="value: max, events:{change:events.onMinMaxChange}" required style="width:120px;"/>' +
																'</span>' +
															'</span>' +
														'</p>' +
													'</span>' +
												'</span>' +
											'</div>' +
											'<div class="field-row list">' +
												'<span class="field-name">' + I18N.prop("HMI_LIBRARY_LIST") + ' (<span class="field" data-bind="text: step"></span>)</span>' +
												'<div class="field-row">' +
													'<table class="image-list multi-type"></table>' +
													'<div class="image-list-add"><span class="ic ic-btn-add-lg"></span></div>' +
												'</div>' +
											'</div>' +
										'</div>' +
									'</div>',
				contentViewModel : {
					controlTypes : [
						{ id : "Push", text : I18N.prop("HMI_PUSH") },
						{ id : "Toggle", text : I18N.prop("HMI_TOGGLE") },
						{ id : "Momentary", text : I18N.prop("HMI_MOMENTARY") }
					],
					controlType : "Push",
					min : 0,
					max : 100,
					step : 1,
					events : {
						onNameValidate : function(e){
							if(e.valid){
								var input = e.sender.element.find("input");
								var name = input.val();
								var viewModel = that.popup.contentViewModel;
								viewModel.set("name", name);
								that.popup.enableSaveBtn();
							}else{
								that.popup.disableSaveBtn();
							}
						},
						//Controlled, Toggle, Multi 타입 라디오 버튼 선택
						onChangeType : function(e){
							//var data = that.popup.getSelectedData();
							//data.set("type", this.type);
							//Save 시, ContentViewModel을 통해 set 수행해야함.
							that.popup.hasChanged = true;
							//Type 변경 시, 현재 Type에 대한 저장 버튼 활성화 상태 업데이트를 위하여 _validatePopup() 실행
							if(that._validatePopup.call(that.popup)) that.popup.enableSaveBtn();
						},
						//Controlled Type 내 Push, Toggle, Momentary 선택
						onChangeControlType : function(e){
							//var data = that.popup.getSelectedData();
							//data.set("controlType", this.controlType);
							//Save 시, ContentViewModel을 통해 set 수행해야함.
							that.popup.hasChanged = true;
							if(that._validatePopup.call(that.popup)) that.popup.enableSaveBtn();
						},
						onMinMaxChange : function(e){
							var input = $(e.target);
							var popup = that.popup, popupEl = popup.element;
							var isMin = input.hasClass("min");
							var otherField;
							if(isMin) otherField = popupEl.find("span.max.total");
							else otherField = popupEl.find("span.min.total");
							var validator = otherField.data("kendoCommonValidator");
							if(validator) validator.validate();
						},
						onMinValidate : function(e){
							//이미지 리스트 Validate
							var popup = that.popup;
							that._validateImageList();
							if(e.valid){
								popup.enableSaveBtn();
							}else{
								popup.disableSaveBtn();
							}
						},
						onMaxValidate : function(e){
							//이미지 리스트 Validate
							var popup = that.popup;
							that._validateImageList();
							if(e.valid){
								popup.enableSaveBtn();
							}else{
								popup.disableSaveBtn();
							}
						}
					}
				}
			}).data("kendoDetailDialog");
			//이미지 삭제
			var popupEl = that.popup.element;
			var addImageInPopupImageListEvt = that._addImageInPopupImageList.bind(that);
			popupEl.on("click", ".image-list tr td .ic.ic-close", that._deleteImageInPopupImageList.bind(that));
			popupEl.on("click", ".image-list tr td .ic.ic-btn-add-sm", addImageInPopupImageListEvt); //이미지 추가 버튼 클릭 시
			popupEl.on("click", ".image-list tr td .image-file-name", addImageInPopupImageListEvt);	//이미지 텍스트 클릭 시
			popupEl.on("click", ".image-list.multi-type tr td .ic.ic-btn-remove-lg", that._deleteRowInPopupImageList.bind(that));
			popupEl.on("click", "div.multi-type .ic.ic-btn-add-lg", that._addRowInPopupImageList.bind(that));
			popupEl.on("keydown", "input[type='text']", that._keydownInputInPopup.bind(that));
			popupEl.on("keyup", "input[type='text']", that._keyupInputInPopup.bind(that));
			that.popup.setCloseAction(popupCancelEvt);
		},
		_keydownInputInPopup : function(e){
			var target = $(e.target);
			var KEY_CODE_DOT = 190;
			var charCode = (e.which) ? e.which : event.keyCode;
			//멀티 타입의 최대/최소 값 입력 시, 소수점 입력 방지
			if(target.hasClass("min") || target.hasClass("max")){
				if(charCode == KEY_CODE_DOT || charCode == kendo.keys.NUMPAD_DOT) return false;
			}
		},
		_keyupInputInPopup : function(e){
			var that = this;
			that.popup.hasChanged = true;
		},
		_onCancelPopup : function(e){
			var I18N = window.I18N, popup = e.sender;
			if(popup.hasChanged){
				popup.confirmDialog.message(I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_CANEL"));
				popup.confirmDialog.setConfirmActions({
					yes : function(){
						popup.setEditable(false);
						popup.hideInvalidMessage();
						popup.hideRemoveBtn();
						popup.close();
					}
				});
				popup.confirmDialog.open();
			}else{
				popup.setEditable(false);
				popup.hideInvalidMessage();
				popup.hideRemoveBtn();
				popup.close();
			}
			return false;
		},
		_onSavePopup : function(e){
			var that = this, popup = that.popup;
			var data = popup.getSelectedData();
			var viewModel = popup.contentViewModel;
			var savedData = {
				id : viewModel.id,
				type : viewModel.type,
				name : viewModel.name
			};
			var grid;
			if(savedData.type == "Controlled"){
				grid = popup.controlledTypeImageList;
				savedData.controlType = viewModel.controlType;
			}else if(savedData.type == "Toggle"){
				grid = popup.toggleTypeImageList;
			}else{
				//savedData.step = viewModel.step;
				savedData.min = viewModel.min;
				savedData.max = viewModel.max;
				grid = popup.multiTypeImageList;
			}
			var ds = grid.dataSource;
			var images = ds.data();
			savedData.images = images;

			var parentInfo = that.getParentInfo(savedData);
			if(that._isNewItem(savedData)){	//생성
				savedData._isNew = true;
				//새로 생성한 컴포넌트 일 경우 가장 마지막 Order 부여
				savedData.sortOrder = that._getLastSortOrderInParent(parentInfo.to) + 1;
			}else{	//편집
				savedData.oldImages = data._oldImages;
				if(images[0] && images[0].image){	//UI의 Thumbnail 이미지 업데이트를 위함
					savedData.thumbnailImage = images[0].image;
				}
				//다른 타입으로 변경될 경우는 이동할(변경될) 해당 타입의 가장 마지막 sortOrder 부여
				if(data.type != savedData.type){
					savedData.sortOrder = that._getLastSortOrderInParent(parentInfo.to) + 1;
				}else{	//아닐 경우는 이전 sortOrder 유지
					savedData.sortOrder = data.sortOrder;
				}
			}

			//해당 save 이벤트에 대해 API 호출 후 서버로부터 다시 데이터를 GET하여 설정해야함.
			that.trigger("save", { item : savedData });
			return false;
		},
		_getLastOrder : function(){
			var that = this, ds = that.dataSource;
			var data = ds.data();
			var i, max = data.length;
			var items, children = [];
			for( i = 0; i < max; i++ ){
				items = data[i].items;
				if(items && items.toJSON) items = items.toJSON();
				children = children.concat(items);
			}
			var sortedChildren = new kendo.data.Query(children).sort({ field : "sortOrder", dir : "asc" }).toArray();
			var lastChild = sortedChildren[sortedChildren.length - 1];
			if(lastChild) return lastChild.sortOrder;
			return 1;
		},
		_getLastSortOrderInParent : function(parent_id){
			var that = this, ds = that.dataSource;
			var parent = ds.get(parent_id);
			if(parent){
				var children = parent.children;
				var sortedChildren = new kendo.data.Query(children.data()).sort({ field : "sortOrder", dir : "asc" }).toArray;
				var lastChild = sortedChildren[sortedChildren.length - 1];
				if(lastChild) return lastChild.sortOrder;
			}
			return that._getLastOrder();
		},
		getTotalSize : function(){
			var that = this;
			var data = that.dataSource.data();
			var i, max = data.length;
			var size = 0;
			for( i = 0; i < max; i++ ){
				size += data[i].items.length;
			}
			return size;
		},
		updateParent : function(data){
			var that = this;
			var info = that.getParentInfo(data);
			that.assignParent(data, info.from, info.to);
			return info;
		},
		assignParent : function(data, from, to){
			var that = this, ds = that.dataSource, children;
			if(from === to) return;
			if(from){
				//from._loaded = void 0;
				from.load();
				children = from.children;
				that.editDataSourceWithTransport("remove", children, data);
				//from.children.read();
				that.dataSource.pushUpdate({ id : from.id, items : from.items });
				//from.children.fetch();
				//from.load();
			}
			if(to){
				//to._loaded = void 0;
				to.load();
				children = to.children;
				that.editDataSourceWithTransport("add", children, data);
				//to.children.read();
				that.dataSource.pushUpdate({ id : to.id, items : to.items });
				//that.dataSource.pushUpdate(to);
				//to.children.fetch();
				//to.load();
			}
		},
		getParent : function(data){
			var that = this, ds = that.dataSource;
			var items = ds.data();
			var child, i, max = items.length;
			for( i = 0; i < max; i++ ){
				child = items[i].children.get(data.id);
				if(child) return items[i];
			}
			return null;
		},
		getParentDs : function(data){
			var that = this, ds = that.dataSource;
			var items = ds.data();
			var child, i, max = items.length;
			for( i = 0; i < max; i++ ){
				child = items[i].children.get(data.id);
				if(child) return items[i].children;
			}
			return null;
		},
		getParentInfo : function(data){
			var that = this, ds = that.dataSource;
			var typeItem, typeItems = ds.data();
			var i, max = typeItems.length;
			var from = null, to = null, child;
			for( i = 0; i < max; i++ ){
				typeItem = typeItems[i];
				if(typeItem.id == data.type) to = typeItem;
				child = typeItem.children.get(data.id);
				if(child){
					from = typeItem;
				}
			}
			return {
				from : from,
				to : to
			};
		},
		_isNewItem : function(data){
			var id = data.id;
			return isNaN(Number(id));
		},
		_validatePopup : function(e){
			var isValid = true;
			//이미지 리스트를 제외한 영역의 Validator가 valid 상태인지 체크
			//this는 popup이다.
			var that = this;
			var viewModel = that.contentViewModel;
			var type = viewModel.type;
			var grid, wrapper, validatorElems;

			var validatorSelector = ".common-validator.library-name";
			if(type == "Controlled"){
				grid = that.controlledTypeImageList;
			}else if(type == "Toggle"){
				grid = that.toggleTypeImageList;
			}else if(type == "Multi"){
				grid = that.multiTypeImageList;
				validatorSelector += ",div.multi-type .common-validator";
			}

			//팝업 내 모든 Validator의 상태 체크. Invalid 상태일 경우 저장 버튼은 비활성화
			wrapper = that.element;
			validatorElems = wrapper.find(validatorSelector);
			validatorElems.each(function(i, elem){
				var validator = $(elem).data("kendoCommonValidator");
				isValid = validator.validate(null, null, true);
				//elem = $(elem).find(".k-input");
				//isValid = !(elem.hasClass("k-invalid"));
				if(!isValid) return false;
			});
			if(!isValid){
				that.disableSaveBtn();
				return isValid;
			}

			if(grid){
				//이미지가 추가되었는지 체크
				var ds = grid.dataSource;
				var data = ds.data();
				var i, max = data.length;
				for( i = 0; i < max; i++ ){
					if(data[i].name === null){
						isValid = false;
						break;
					}
				}
				if(!isValid){
					that.disableSaveBtn();
					return isValid;
				}
			}

			if(!that.hasChanged){
				that.disableSaveBtn();
				isValid = false;
			}
			//저장 버튼 활성화 여부
			return isValid;
		},
		_dataBoundEvtOtherImageList : function(e){
			var that = this;
			//Controlled/Toggle 타입의 리스트 데이터 변경 시, 저장 버튼 활성화 상태 업데이트를 위하여 _validatePopup() 실행
			if(that._validatePopup.call(that.popup)) that.popup.enableSaveBtn();
		},
		_dataBoundEvtMultiImageList : function(e){
			var that = this;
			var grid = e.sender;
			var onValidateImageListEvt = that._onValidateImageList.bind(that);
			//var onChangeImageListRangeEvt = that._onChangeImageListRange.bind(that);
			grid.element.find(".list-range-validator").each(function(i, elem){
				elem = $(elem);
				//var input = elem.find(".k-input");
				var validator = elem.kendoCommonValidator({
					type : "hmiImageListMinMax",
					required : true,
					validate : onValidateImageListEvt
				}).data("kendoCommonValidator");
				//input.on("change", onChangeImageListRangeEvt);
				validator.validate();
			});
			//Multi 타입의 리스트 데이터 변경 시, 저장 버튼 활성화 상태 업데이트를 위하여 _validatePopup() 실행
			if(that._validatePopup.call(that.popup)) that.popup.enableSaveBtn();
		},
		_onChangeImageListRange : function(e){
			var that = this;
			var input = $(e.target);
			var itemId = input.data("id");
			that._validateImageList(itemId);
		},
		_onValidateImageList : function(e){
			//valid일 경우
			//dataSource의 Value 변경
			var that = this, popup = that.popup, grid = popup.multiTypeImageList;
			var validator = e.sender, el = validator.element;
			var isMin = el.hasClass("min");
			var input = el.find(".k-input");
			var itemId = input.data("id");
			//if(e.valid){
			var ds = grid.dataSource;
			var item = ds.get(itemId);
			var value = input.val();
			if(item){
				if(isMin) item.min = Number(value);
				else item.max = Number(value);
			}
			//}
			that._validateImageList(itemId, isMin, true);
		},
		_validateImageList : function(id, isMin, doNotTrigger){
			var that = this;
			var popup = that.popup;
			var grid = popup.multiTypeImageList;
			var gridEl = grid.element;
			var gridValidatorElems = gridEl.find(".common-validator");
			gridValidatorElems.each(function(i, elem){
				elem = $(elem);
				var validator;
				var input = elem.find(".k-input");
				//해당 함수를 호출하는 id 를 가진 row 내 자기 자신을 제외한 validtor를 호출한다.
				//min 이면 max, max 면 min을 호출하여 유효성 체크를 업데이트한다.
				if(id && id == input.data("id")){
					var cell = input.closest("td[role='gridcell']");
					if(isMin) validator = cell.find(".list-range-validator.max").data("kendoCommonValidator");
					else validator = cell.find(".list-range-validator.min").data("kendoCommonValidator");
					if(validator) validator.validate(null, null, doNotTrigger);
					return true;
				}

				validator = elem.data("kendoCommonValidator");
				if(validator) validator.validate(null, null, doNotTrigger);
			});
			//Multi 타입 리스트의 이미지 리스트 Validate 후 해당 결과에 따라 저장 버튼 활성화 상태 업데이트를 위하여 _validatePopup() 실행
			if(that._validatePopup.call(that.popup)) that.popup.enableSaveBtn();
		},
		_addRowInPopupImageList : function(e){
			var that = this;
			var target = $(e.target);
			if(target.hasClass("disabled")) return;
			var wrapper = target.closest("div.multi-type");
			var table = wrapper.find("table.image-list");
			var grid = table.data("kendoGrid");
			var ds = grid.dataSource;
			var data = ds.data();
			var i, max = data.length;
			//Number 재계산
			var popup = that.popup, viewModel = popup.contentViewModel;
			var totalMax = viewModel.max;
			var totalMin = viewModel.min;
			for( i = 0; i < max; i++ ){
				data[i].index = (i + 1);
				if(totalMin < data[i].max){
					totalMin = data[i].max >= totalMax ? totalMax : data[i].max + 1;
				}
			}
			ds.pushCreate({
				id : kendo.guid(),
				index : max + 1,
				name : null,
				min : totalMin,
				max : totalMax
			});
			viewModel.set("step", data.length);
			that.popup.hasChanged = true;

			//ROW 추가 후 스크롤을 가장 아래로 이동 시킨다.
			var gridEl = grid.element;
			var scrollWrapperEl = gridEl.closest(".k-auto-scrollable");
			if(scrollWrapperEl.length > 0){
				var scrollHeight = scrollWrapperEl.get(0).scrollHeight;
				scrollWrapperEl.scrollTop(scrollHeight);
			}
		},
		_deleteRowInPopupImageList : function(e){
			var that = this;
			var target = $(e.target);
			if(target.hasClass("disabled")) return;
			var table = target.closest("table.image-list");
			var grid = table.data("kendoGrid");
			var ds = grid.dataSource;
			var data = ds.data();
			var id = target.data("id");
			var item = ds.get(id);
			var i, max = data.length;
			//Number 재계산
			var cnt = 1;
			for( i = 0; i < max; i++ ){
				if(data[i] !== item){
					data[i].index = cnt;
					cnt++;
				}
			}
			//Row를 삭제한다.
			ds.remove(item);
			var popup = that.popup, viewModel = popup.contentViewModel;
			viewModel.set("step", data.length);
			that.popup.hasChanged = true;
		},
		_addImageInPopupImageList : function(e){
			var that = this, HmiModel = window.HmiModel, HmiCommon = window.HmiCommon;
			var target = $(e.target);
			if(target.hasClass("disabled")) return;

			var wrapper = target.closest('.image-wrapper');
			var id = wrapper.data("id");

			var table = target.closest("table.image-list");
			var grid = table.data("kendoGrid");
			var ds = grid.dataSource;
			var item = ds.get(id);
			var fileIndex = ds.indexOf(item) + 1;
			var HmiUtil = window.HmiUtil;
			HmiUtil.getImageInfoFromFile('hmi-library-image', HmiCommon.LIBRARY_IMAGE_FILE_MAX_SIZE).done(function(e){
				var file = e.file;
				var dataUrl = e.dataUrl;
				that.popup.hasChanged = true;
				item.image = dataUrl;
				//file이 존재할 경우 Patch/Post 필요.
				item.file = file;
				item.set("id", HmiModel.addComponentNumber(fileIndex, file.name));
				item.set("name", file.name);
			}).fail(function(msg){
				that.popup.msgDialog.message(msg);
				that.popup.msgDialog.open();
			}).always(function(){
			});
		},
		_deleteImageInPopupImageList : function(e){
			var that = this;
			var target = $(e.target);
			if(target.hasClass("disabled")) return;
			var table = target.closest("table.image-list");
			var grid = table.data("kendoGrid");
			var ds = grid.dataSource;
			var id = target.data("id");
			var item = ds.get(id);
			//이미지 삭제
			item.image = null;
			item.file = null;
			item.set("name", null);
			item.set("id", kendo.guid());
			that.popup.hasChanged = true;
		},
		//생성 버튼 및 버튼 동작
		_createCreateButton : function(){
			var that = this;
			that.searchWrapper.append(CREATE_BTN_TEMPLATE());
			that.createButton = that.searchWrapper.find(".create-btn");
			//생성 버튼 클릭
			that.createButton.on("click", function(){
				var I18N = window.I18N;
				//Library 생성 Popup 표시를 위한 Trigger
				that.popup.title(I18N.prop("HMI_ADD_LIBRARY"));
				that.popup.setDataSource({
					id : kendo.guid(),
					name : "",
					type : "Controlled",
					controlType : "Push",
					images : [
						{ id : kendo.guid(), name : null, status : "OFF" },
						{ id : kendo.guid(), name : null, status : "ON"}
					]
				});
				that.popup.dialogType = "add";
				that.popup.open();
				//that.trigger("create");
			});
		},
		_createSearchWrapper : function(){
			var that = this;
			that.searchWrapper = $("<div class='search-wrapper'/>");
			that.wrapper.prepend(that.searchWrapper);
			that.wrapper.addClass("enable-search");
		},
		_createSearch : function(){
			var that = this;
			that.searchWrapper.append(SEARCH_FIELD_TEMPLATE());
			that.searchFieldWrapper = that.searchWrapper.find(".search-field-wrapper");
			that.searchField = that.searchWrapper.find(".search-field");
			that.searchButton = that.searchWrapper.find('.ic-bt-input-search');
			//검색
			var searchEvt = that.search.bind(that);
			that.searchField.on("keyup", searchEvt);
			that.searchButton.on("click", function(e){
				if(that._isSearching) that.searchField.val("");
				that.search({ keyCode : kendo.keys.ENTER });
			});
		},
		search : function(e){
			var that = this, keywords = that.searchField.val();
			if(e.keyCode && e.keyCode == kendo.keys.ENTER){
				that.enableSearchList(keywords);
			}else if(that.searchFieldWrapper.hasClass("searching")){
				that._isSearching = false;
				that.searchFieldWrapper.removeClass("searching");
			}
		},
		clearSearchResult : function(){
			var that = this;
			that.searchField.val("");
			that.search({ keyCode : kendo.keys.ENTER });
		},
		enableSearchList : function(keywords){
			var that = this, ds = that.dataSource;
			if(keywords){
				//돋보기 아이콘 X 버튼 표시
				that.searchFieldWrapper.addClass("searching");
				that._isSearching = true;
				if(keywords){
					//filter
					var filter = { logic : "or", filters : [
						{
							field : "name",
							operator : "contains",
							value : keywords
						}
					]};
					that.filterChildren(filter);
					//ds.filter(filter);
				}
				that.createButton.prop("disabled", true);
			}else{
				that.filterChildren([]);
				//ds.filter([]);
				that.searchFieldWrapper.removeClass("searching");
				that._isSearching = false;
				that.createButton.prop("disabled", false);
			}
			that._updateButtonStateFromSelectedData();
		},
		filterChildren : function(filter){
			var that = this, ds = that.dataSource;
			var childrenDs, parents = ds.data();
			var i, max = parents.length;
			for( i = 0; i < max; i++ ){
				childrenDs = parents[i].children;
				if(childrenDs) childrenDs.filter(filter);
			}
			ds.fetch();
		},
		_updateSelected: function (link, skipChange) {
	        var that = this, element = that.element, item = link.parent(ITEM), selected = that._selected, dataItem = that.dataItem(item);
	        if (selected) {
	            selected.removeAttr(ARIA_SELECTED);
	        }
	        that._selected = item.attr(ARIA_SELECTED, true);
	        element.find(selectableItems).removeClass(SELECTEDCLASS);
	        element.find('> .' + HIGHLIGHTCLASS + ', .k-panel > .' + HIGHLIGHTCLASS).removeClass(HIGHLIGHTCLASS);
	        link.addClass(SELECTEDCLASS);
	        link.parentsUntil(element, ITEM).filter(':has(.k-header)').addClass(HIGHLIGHTCLASS);
	        that._current(item[0] ? item : null);
	        if (dataItem) {
	            dataItem.set('selected', true);
	        }
	        if (!skipChange) {
	            that.trigger(CHANGE, { item : dataItem });
	        }
	    },
		getSelectedData : function(){
			var ds = this.dataSource;
			var data = ds.data();
			var expendedType = new kendo.data.Query(data).filter({ field : "expanded", operator : "eq", value : true}).toArray();
			if(expendedType[0]){
				expendedType = expendedType[0];
				var items = expendedType.items;
				var selectedItem = new kendo.data.Query(items).filter( { field : "selected", operator : "eq", value : true}).toArray();
				return selectedItem[0];
			}
			return null;
		},
		_createbuttonWrapper : function(){
			var that = this;
			that.buttonWrapper = $("<div class='button-wrapper'/>");
			that.wrapper.append(that.buttonWrapper);
			that.wrapper.addClass("enable-button");
		},
		_createEditButton : function(){
			var that = this, HmiApi = window.HmiApi;
			that.buttonWrapper.append(BUTTONS_TEMPLATE("create"));
			that.editButton = that.wrapper.find(".edit-btn");
			that.editButton.prop("disabled", true);
			that.editButton.on("click", function(e){
				var data = that.getSelectedData();
				var I18N = window.I18N;
				//라이브러리 편집
				that.loadingPanel.open();
				var id = data.id;
				HmiApi.getComponent(id).done(function(component){
					that.popup.title(I18N.prop("HMI_EDIT_LIBRARY"));
					data = $.extend(data, component);
					data = data.toJSON();
					data._oldImages = data.images;
					that.popup.setDataSource(data);
					that.popup.dialogType = "edit";
					that.popup.open();
				}).fail(function(xhq){

				}).always(function(){
					that.loadingPanel.close();
				});
				//that.trigger("edit", {event : e, item : data});
			});
		},
		_createDeleteButton : function(){
			var that = this;
			that.buttonWrapper.append(BUTTONS_TEMPLATE("delete"));
			that.deleteButton = that.wrapper.find(".delete-btn");
			that.deleteButton.prop("disabled", true);
			that.deleteButton.on("click", function(e){
				var data = that.getSelectedData();
				//라이브러리 삭제 API 호출
				that.trigger("delete", {event : e, item : data,
					success : that._deleteSuccessCallback.bind(that, {item : data}), fail : that._deleteFailCallback.bind(that, {item : data})});
			});
		},
		apiPostComponent : function(item){
			var that = this, dfd = new $.Deferred(), ds = that.dataSource,
				HmiApi = window.HmiApi, Util = window.Util, I18N = window.I18N;
			HmiApi.postComponent(item).done(function(newFileId){
				item.id = newFileId;
				//부모 업데이트 및 UI에 생성
				var parentInfo = that.updateParent(item);
				//생성 또는 편집 시, 다른 타입으로 이동하는 경우에만 read 수행(편집 비정상동작으로 인해)
				//read 시, 패널이 닫히므로 강제로 타겟 패널을 로드
				if(parentInfo.from !== parentInfo.to){
					//ds.read();
					if(parentInfo.to && parentInfo.to.id !== item.type){
						//생성 시에는 from이 존재하지 않는다.
						//이미 펼쳐져있는 item이 있으면 접는다.
						//이미 펼쳐져있는 곳에 생성하는 경우 처리하지않는다.
						var expandedItems = new kendo.data.Query(ds.data()).filter({ field : "expanded", operator : "eq", value : true }).toArray();
						var i, max = expandedItems.length;
						if(max > 0){
							for( i = 0; i < max; i++ ){
								expandedItems[i].set("expanded", false);
							}
						}
						//새로운 패널을 펼친다.
						var parent = ds.get(parentInfo.to.id);
						if(parent) parent.set("expanded", true);
					}
				}
				//생성 sortOrder 업데이트 생략
				item = ds.get(item.id);
				dfd.resolve(item);
			}).fail(function(msg){
				ds.fetch();
				dfd.reject(msg);
			});
			return dfd.promise();
		},
		apiPutComponent : function(item){
			var that = this, dfd = new $.Deferred(), ds = that.dataSource,
				HmiApi = window.HmiApi, Util = window.Util, I18N = window.I18N;

			HmiApi.putComponent(item).done(function(res){
				var parentDs = that.getParentDs(item);
				//UI 업데이트
				parentDs.pushUpdate(item);
				//부모 업데이트
				var parentInfo = that.updateParent(item);
				//생성 또는 편집 시, 다른 타입으로 이동하는 경우에만 read 수행(편집 비정상동작으로 인해)
				//read 시, 패널이 닫히므로 강제로 타겟 패널을 로드
				if(parentInfo.from !== parentInfo.to){
					//ds.read();
					if(parentInfo.to){
						var oldParent = ds.get(parentInfo.from.id);
						if(oldParent) oldParent.set("expanded", false);
						var parent = ds.get(parentInfo.to.id);
						if(parent) parent.set("expanded", true);
					}
				}
				//생성 sortOrder 업데이트 생략
				item = ds.get(item.id);
				dfd.resolve(item);
			}).fail(function(msg){
				ds.fetch();
				dfd.reject(msg);
			});

			return dfd.promise();
		},
		/*apiDeleteComponent : function(item){
			var that = this, dfd = new $.Deferred(), ds = that.dataSource,
				HmiApi = window.HmiApi, Util = window.Util, I18N = window.I18N;
			HmiApi.deleteComponent(item).done(function(res){

			});
		},*/
		_deleteSuccessCallback : function(e){
			var that = this;
			var data = e.item;
			var parent = that.getParent(data);
			var parentDs = parent.children;
			that.editDataSourceWithTransport("remove", parentDs, data);
			//parentDs.read();
			that.dataSource.pushUpdate({ id : parent.id, items : parent.items.toJSON() });
			//아이템이 없으면 접는다.
			if(parent.items.length < 1){
				parent.set("expanded", false);
				that.dataSource.fetch();
			}
			/*parentDs.transport.destroy({
				success : function(data){
					var items = data.items;
					var i, max = items.length;
					for( i = 0; i < max; i++ ){
						if(items[i].id == data.id){
							items.splice(i, 1);
							break;
						}
					}

				}
			});*/
		},
		_deleteFailCallback : function(e){
			var that = this;
			that.dataSource.fetch();
		},
		_saveExpandedItem : function(){
			var that = this;
			var ds = this.dataSource;
			var data = ds.data();
			var expendedType = new kendo.data.Query(data).filter({ field : "expanded", operator : "eq", value : true}).toArray();
			if(expendedType[0]){
				expendedType = expendedType[0];
				that._lastExpandedItemId = expendedType.id;
				var items = expendedType.items;
				var selectedItem = new kendo.data.Query(items).filter( { field : "selected", operator : "eq", value : true}).toArray();
				if(selectedItem[0]) that._lastSelectedItemId = selectedItem.id;
			}
		},
		_restoreExpandedItem : function(){
			var that = this;
			var ds = this.dataSource;
			if(that._lastExpandedItemId){
				var lastExpandedItem = ds.get(that._lastExpandedItemId);
				if(lastExpandedItem) lastExpandedItem.set("expanded", true);
			}

			if(that._lastSelectedItemId){
				var lastSelectedItem, i, data = ds.data(), max = data.length;
				for( i = 0; i < max; i++ ){
					lastSelectedItem = data[i].children.get(that._lastSelectedItemId);
					if(lastSelectedItem) lastSelectedItem.set("selected", true);
				}
			}
		},
		setDataSource: function (dataSource) {
			var that = this;
			that._saveExpandedItem();
			HmiPalette.fn.setDataSource.call(this, dataSource);
			that._restoreExpandedItem();
		},
		_dataSource: function () {
			var that = this, options = that.options, dataSource = options.dataSource;
			if (!dataSource) {
				return;
			}
			dataSource = isArray(dataSource) ? { data: dataSource } : dataSource;
			that._unbindDataSource();
			if (!dataSource.fields) {
				dataSource.fields = [
					{ field: 'text' },
					{ field: 'url' },
					{ field: 'spriteCssClass' },
					{ field: 'imageUrl' }
				];
			}
			that.dataSource = HierarchicalDataSource.create(dataSource);
			that.dataSource.read();
			that._applyDefaultSort(that.dataSource);
			that._bindDataSource();
		},
		_applyDefaultSort : function(dataSource){
			var that = this;
			if(dataSource instanceof kendo.data.HierarchicalDataSource){
				var data = dataSource.data();
				var i, max = data.length;
				for( i = 0; i < max; i++ ){
					var children = data[i].children;
					children.sort(that._getDefaultSort());
				}
				//dataSource.sort();
			}
		},
		_getDefaultSort : function(){
			return [{
				field : "sortOrder", dir : "asc"
			}];
		},
		_sortable : function(){
			var that = this;
			that.element.find("> .k-item").each(function(){
				var el = $(this);
				//var data = that.dataSource.getByUid(uid);
				if(el.data("kendoSortable")) return true;
				el.kendoSortable({
					autoScroll : true,
					container : el,
					filter : ".k-group > .k-item",
					hint : function(element){
						return that._helper;
					},
					start : function(e){
						//Tooltip을 닫는다.
						var tooltip = that.element.data("kendoTooltip");
						if(tooltip) tooltip.hide();
					},
					end : function(e){
						var evt = e.draggableEvent;
						if(that.isDropInCanvas(evt.clientX, evt.clientY)){
							e.preventDefault();
							return false;
						}
					},
					change : function(e){
						var dataSource = that.dataSource;
						//var oldIndex = e.oldIndex;
						var newIndex = e.newIndex;
						var sortedItem = that.dataItem(e.item), data = dataSource.data();
						var parent, children, child, i, max = data.length;
						var everyChildren = [];
						for( i = 0; i < max; i++ ){
							children = data[i].children;
							child = children.get(sortedItem.id);
							if(child) parent = data[i];
							children = children.data();
							children.forEach(function(c){
								everyChildren.push(c);
							});
						}

						if(!parent) console.error("there is no parent this sorted item.");

						var childrenDs = parent.children;
						children = childrenDs.view();
						//앞에 있는 아이템 기준으로 order를 업데이트 한다.
						sortedItem.index = newIndex;
						if(children[newIndex - 1]){
							var beforeChild = children[newIndex - 1];
							sortedItem.set("sortOrder", beforeChild.sortOrder + 1);
						}else if(children[newIndex + 1]){//맨 앞일 경우(앞에 아이템이 없을 경우) 뒤에 있는 아이템 기준으로 order를 업데이트 한다.
							var afterChild = children[newIndex + 1];
							sortedItem.set("sortOrder", afterChild.sortOrder - 1);
						}
						childrenDs.pushUpdate({id : sortedItem.id, sortOrder : sortedItem.sortOrder });
						//같은 레벨에서 Index를 업데이트한다.
						//childrenDs.pushDestroy(sortedItem);
						//childrenDs.insert(sortedItem.index, sortedItem);
						//that.reOrderChildrenIndex(item, children);
						//한 개의 Order가 변경됨에 따라 전체 Order를 업데이트 한다.
						that.reOrderChildren(sortedItem, everyChildren);

						//백엔드 API 호출 및 응답하고 DataSource 재설정 필요
						that.trigger("sort",{
							item : sortedItem, reOrderedItems : everyChildren,
							success : that._sortSuccessCallback.bind(that, { item : sortedItem, reOrderedItems : everyChildren }),
							fail : that._sortFailCallback.bind(that, { item : sortedItem, reOrderedItems : everyChildren })
						});
					}
				});
			});
		},
		_sortSuccessCallback : function(e){
			//전체 데이터소스의 items 업데이트
			var that = this, item, data, i, max, parent = that.getParent(e.item);
			data = that.dataSource.data();
			max = data.length;
			/*for( i = 0; i < max; i++ ){
				item = data[i];
				//item.children.read();
				that.dataSource.pushUpdate({ id : item.id, items : item.items });
			}*/

			//that.dataSource.read();
			//read 후 모든 패널이 접히므로, 강제로 load 호출 또는 expanded true하여 펼침.
			//parent = that.dataSource.get(parent.id);
			//parent.set("expanded", true);
			//parent.load();

			//fetch 시, 다시 돌아오는 경우 있음.
			//that.dataSource.fetch();
		},
		_sortFailCallback : function(e){
			var that = this;
			that.dataSource.fetch();
		},
		/*
		reOrderAllItems : function(){
			var that = this, ds = that.dataSource, originalData = ds._pristineData;
			var dsItem, dsItems, child;
			var i, item, items, max = originalData.length, j, size;
			var order = 0;
			//전체 order를 재설정한다.
			for( i = 0; i < max; i++ ){
				item = originalData[i];
				items = item.items;
				size = items.length;
				dsItem = ds.get(item);
				if(dsItem) dsItems = dsItem.children;
				else dsItems = null;
				for(j = 0; j < size; j++ ){
					order++;
					items[j].sortOrder = order;
					if(dsItems){
						child = dsItems.get(items[j].id)
						if(child) child.sortOrder = order;
					}
				}

				if(dsItem){
					items = dsItem.items;

				}
			}
			if(originalData[i]){
				items =
			}
		},*/
		reOrderChildren : function(sortedItem, children){
			var that = this;
			var orderedData = new kendo.data.Query(children).sort(that._getDefaultSort()).filter({
				logic : "and",
				filters : [
					{ field : "sortOrder", operator : "gte", value : sortedItem.sortOrder },
					{ field : "id", operator : "neq", value : sortedItem.id }
				]
			}).toArray();

			var parentDs = that.getParentDs(sortedItem);
			if(parentDs){
				parentDs.pushUpdate({id : sortedItem.id, sortOrder : sortedItem.sortOrder});
			}

			var i, max = orderedData.length;
			var item, order = sortedItem.sortOrder;
			for( i = 0; i < max; i++ ){
				item = orderedData[i];
				item.set("sortOrder", (order + (i + 1)));
				parentDs = that.getParentDs(item);
				if(parentDs){
					parentDs.pushUpdate({id : item.id, sortOrder : item.sortOrder});
				}
			}
		},
		reOrderChildrenIndex : function(sortedItem, children){
			var that = this;
			var orderedData = new kendo.data.Query(children).sort(that._getDefaultSort()).filter({
				logic : "and",
				filters : [
					{ field : "index", operator : "gte", value : sortedItem.index },
					{ field : "id", operator : "neq", value : sortedItem.id }
				]
			}).toArray();
			var parentDs = that.getParentDs(sortedItem);
			if(parentDs){
				parentDs.pushUpdate({id : sortedItem.id, index : sortedItem.index});
				parentDs.pushInsert(sortedItem.index, sortedItem);
			}

			var i, max = orderedData.length;
			var item, index = sortedItem.index;
			for( i = 0; i < max; i++ ){
				item = orderedData[i];
				item.index = index + (i + 1);
				parentDs = that.getParentDs(item);
				if(parentDs) parentDs.pushUpdate({id : item.id, index : item.index});
			}
		},
		//Canvas에서 사용가능한 Palette Item 형식으로 변환한다.
		_convertToPaletteItem : function(item){
			var dfd = new $.Deferred();
			item = item.toJSON();
			delete item.index;
			var image, imageId, images = item.images;
			var i, max = images.length;
			//이미지 URL로 교체한다.
			var imageUrl = COMPONENT_IMAGE_API.replace("{id}", item.id);
			for( i = 0; i < max; i++ ){
				image = images[i];
				delete image.image;
				imageId = image.id;
				image.image = imageUrl.replace("{name}", imageId);
			}

			var paletteItem = {
				categoryName : "Custom",
				className : "CustomComponent",
				groupName : "CustomComponent",
				value : item.id,
				text : item.name,
				imageUrl : images[0].image
			};

			var options = {
				binding : {
					custom : item
				}
			};
			var image = new Image();
			image.src = paletteItem.imageUrl;
			image.onload = function(){
				paletteItem.imageWidth = this.width;
				paletteItem.imageHeight = this.height;
				dfd.resolve(paletteItem, options);
			};
			image.onerror = function(){
				paletteItem.imageWidth = 50;
				paletteItem.imageHeight = 50;
				dfd.resolve(paletteItem, options);
			};
			return dfd.promise();
		},
		_clickEvt : function(e){
			var that = this;
			var ds = this.dataSource;
			var target = $(e.target).closest(".hmi-palette-item");
			if(target.length < 1) target = $(e.target).find(".hmi-palette-item");
			var id = target.data("id");
			var item = ds.get(id);
			if(item){
				that._convertToPaletteItem(item).done(function(paletteItem, options){
					e.item = paletteItem;
					e.options = options;
					that.trigger("click", e);
				});
			}else{
				console.error("there is no item in datasource.");
			}
		},
		_doubleClickEvt : function(e){
			var that = this;
			var ds = this.dataSource;
			var target = $(e.target).closest(".hmi-palette-item");
			if(target.length < 1) target = $(e.target).find(".hmi-palette-item");
			var id = target.data("id");
			var item = ds.get(id);
			if(item){
				that._convertToPaletteItem(item).done(function(paletteItem, options){
					e.item = paletteItem;
					e.options = options;
					that.trigger("dblclick", e);
				});
			}else{
				console.error("there is no item in datasource.");
			}
		},
		isDropInCanvas : function(x, y){
			//if(typeof x == "string") x = Number(x);
			//if(typeof y == "string") y = Number(y);
			//x = parseInt(x);
			//y = parseInt(y);
			var elements = document.elementsFromPoint(x, y);
			var el, i, max = elements.length;
			for( i = 0; i < max; i++ ){
				el = elements[i];
				if($(el).hasClass("hmi-create-content-graphic-view-canvas")) return true;
			}
			return false;
		},
		_dropEvt : function(e, ui){
			var that = this;
			var helper = ui.helper;
			var ds = that.dataSource;
			var target = helper.find(".hmi-palette-item");
			var id = target.data("id");
			var item = ds.get(id);
			if(item){
				that._convertToPaletteItem(item).done(function(paletteItem, options){
					e.item = paletteItem;
					e.options = options;
					that.trigger("drop", e);
				});
			}/*else{
				console.error("there is no item in datasource.");
			}*/
		},
		_tooltip : function(){
			var that = this, element = that.element;
			var tooltip = element.data("kendoTooltip");
			if(!tooltip){
				element.kendoTooltip({
					filter : ".k-group > li.k-item",
					wrapperCssClass : "hmi-palette-tooltip",
					content : function(e){
						var target = e.target;
						return target.find(".hmi-palette-item").attr("title");
					},
					position : "left"
				}).data("kendoToolTip");
			}else{
				tooltip.refresh();
			}
		},
		refresh: function (e) {
	        var options = this.options;
	        var node = e.node;
	        var action = e.action;
	        var items = e.items;
	        var parentNode = this.wrapper;
	        var loadOnDemand = options.loadOnDemand;
			var field = e.field;
			if (field) {
				if (!items[0]) {
					return;
				}else if(field == "expanded" && items[0][field]){
					node = items[0];
					var children = node.children;
					parentNode = this.findByUid(node.uid);
					//View가 존재하나 item이 렌더링 되지 않는 Case에 대하여 처리 추가 (검색 시)
					var view = children.view();
					var menuItems = $(parentNode).find("> ul[role='group'] > li[role='menuitem']");
					if(view.length > 0 && menuItems.length < 1){
						this._refreshChildren(node, parentNode);
					}
				}else{
					return this._updateItems(items, e.field);
				}
	        }
	        if (node) {
	            parentNode = this.findByUid(node.uid);
	            this._progress(parentNode, false);
	        }
	        if (action == 'add') {
	            this._appendItems(e.index, items, parentNode);
	        } else if (action == 'remove') {
	            this.remove(this.findByUid(items[0].uid));
	        } else if (action == 'itemchange') {
	            this._updateItems(items);
	        } else if (action == 'itemloaded') {
	            this._refreshChildren(node, parentNode);
	        } else {
	            this._refreshRoot(items);
	        }
	        if (action != 'remove') {
	            for (var k = 0; k < items.length; k++) {
	                if (!loadOnDemand || items[k].expanded) {
	                    var tempItem = items[k];
	                    if (this._hasChildItems(tempItem)) {
	                        tempItem.load();
	                    }
	                }
	            }
	        }
	        this.trigger(DATABOUND, { node: node ? parentNode : undefined });
	    },
		_insert: function (item, referenceItem, parent) {
			var that = this, items, plain = $.isPlainObject(item), isReferenceItem = referenceItem && referenceItem[0], groupData;
			if (!isReferenceItem) {
				parent = that.element;
			}
			groupData = {
				firstLevel: parent.hasClass('k-panelbar'),
				expanded: $(referenceItem).hasClass(ACTIVECLASS),
				length: parent.children().length
			};
			if (isReferenceItem && !parent.length) {
				parent = $(that.renderGroup({
					group: groupData,
					options: that.options
				})).appendTo(referenceItem);
			}
			if (plain || $.isArray(item) || item instanceof HierarchicalDataSource) {
				if (item instanceof HierarchicalDataSource) {
					//View 기준으로 표시하는 것으로 수정
					item = item.view();
				}
				items = $.map(plain ? [item] : item, function (value, idx) {
					if (typeof value === 'string') {
						return $(value);
					}
					return $(that.renderItem({
						group: groupData,
						item: extend(value, { index: idx })
					}));
				});
				if (isReferenceItem) {
					var dataItem = that.dataItem(referenceItem);
					if (dataItem) {
						dataItem.hasChildren = true;
					}
					referenceItem.attr(ARIA_EXPANDED, false);
				}
			} else {
				if (typeof item == 'string' && item.charAt(0) != '<') {
					items = that.element.find(item);
				} else {
					items = $(item);
				}
				that._updateItemsClasses(items);
			}
			if (!item.length) {
				item = [item];
			}
			that._angularCompileElements(items, item);
			return {
				items: items,
				group: parent
			};
		},
		_refreshChildren: function (item, parentNode) {
			var i, children, child;
			parentNode.children('.k-group').empty();
			var items = item.children.data();
			if (!items.length) {
				updateItemHtml(parentNode);
				children = parentNode.children('.k-group').children('li');
				this._angularCompileElements(children, items);
			} else {
				this.append(item.children, parentNode);
				//expanded true인 아이템만 Toggle 한다.
				if (this.options.loadOnDemand && item.expanded) {
					this._toggleGroup(parentNode.children('.k-group'), false);
				}
				children = parentNode.children('.k-group').children('li');
				for (i = 0; i < children.length; i++) {
					child = children.eq(i);
					this.trigger('itemChange', {
						item: child,
						data: this.dataItem(child),
						ns: ui
					});
				}
			}
		},
		closePopup : function(){
			var that = this;
			that.popup.close();
		},
		editDataSourceWithTransport : function(action, dataSource, data){
			//데이터 소스 read 시, 데이터가 원복되므로 transport 데이터를 삭제
			var transport = dataSource.transport;
			var transportData = transport.data;
			var transportItems = transportData.items;
			if(action == "add"){
				dataSource.pushCreate(data);
				transportItems.push(data);
			}else if(action == "remove"){
				dataSource.pushDestroy(data);
				var i, max = transportItems.length;
				for( i = 0; i < max; i++ ){
					if(transportItems[i].id == data.id){
						transportItems.splice(i, 1);
						break;
					}
				}
			}
		},
		//최상단 코드의 rendering을 사용하게 하기 위한 함수 Override
		renderItem: function (options) {
			var that = this;
			options = extend({
				panelBar: that,
				group: {}
			}, options);
			var empty = that.templates.empty, item = options.item;
			return that.templates.item(extend(options, {
				itemWrapper: that.templates.itemWrapper,
				renderContent: that.renderContent,
				arrow: that._hasChildItems(item) || item.content || item.contentUrl ? that.templates.arrow : empty,
				subGroup: !options.loadOnDemand || item.expanded ? that.renderGroup : empty
			}, rendering));
		},
		//최상단 코드의 rendering을 사용하게 하기 위한 함수 Override
		_updateItems: function (items, field) {
			var that = this;
			var i, node, nodeWrapper, item;
			var context = {
				panelBar: that.options,
				item: item,
				group: {}
			};
			var render = field != 'expanded';
			if (field == 'selected') {
				if (items[0][field]) {
					var currentNode = that.findByUid(items[0].uid);
					if (!currentNode.hasClass(DISABLEDCLASS)) {
						that.select(currentNode, true);
					}
				} else {
					that.clearSelection();
				}
			} else {
				var elements = $.map(items, function (item) {
					return that.findByUid(item.uid);
				});
				if (render) {
					that.angular('cleanup', function () {
						return { elements: elements };
					});
				}
				for (i = 0; i < items.length; i++) {
					context.item = item = items[i];
					context.panelBar = that;
					nodeWrapper = elements[i];
					node = nodeWrapper.parent();
					if (render) {
						context.group = {
							firstLevel: node.hasClass('k-panelbar'),
							expanded: nodeWrapper.parent().hasClass(ACTIVECLASS),
							length: nodeWrapper.children().length
						};
						nodeWrapper.children('.k-link').remove();
						nodeWrapper.prepend(that.templates.itemWrapper(extend(context, { arrow: item.hasChildren || item.content || item.contentUrl ? that.templates.arrow : that.templates.empty }, rendering)));
					}
					if (field == 'expanded') {
						that._toggleItem(nodeWrapper, !item[field], item[field] ? 'true' : true);
					} else if (field == 'enabled') {
						that.enable(nodeWrapper, item[field]);
						if (!item[field]) {
							if (item.selected) {
								item.set('selected', false);
							}
						}
					}
					if (nodeWrapper.length) {
						this.trigger('itemChange', {
							item: nodeWrapper,
							data: item,
							ns: ui
						});
					}
				}
				if (render) {
					that.angular('compile', function () {
						return {
							elements: elements,
							data: $.map(items, function (item) {
								return [{ dataItem: item }];
							})
						};
					});
				}
			}
		}
	});
	kendo.ui.plugin(widget);
})(window, jQuery);
//# sourceURL=hmi/widget/hmi-library-palette.js