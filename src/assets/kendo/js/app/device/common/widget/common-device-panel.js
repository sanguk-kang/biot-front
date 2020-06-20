/**
*
*   <ul>
*       <li>Facility - Device 기능의 탭 UI Component</li>
*   </ul>
*   @module app/widget/common-device-panel
*   @requires lib/kendo.all
*
*/

(function(window, $){
	"use strict";
	var kendo = window.kendo, Widget = kendo.ui.Widget;
	var isOriginalClick = false;

	var DEVICE_TAB_CONTENTS_TEMPLATE = '' +
	/*Kendo Template*/
	'<script id="device-panel-filters-template" type="text/x-kendo-template">' +
		'<li data-bind="invisible : options.invisible, attr: { class: liClassName }">' +
			'#if(type == "dropdownlist"){#' +
				'<input id="#=id#" data-role="dropdownlist" data-option-label="#=options.optionLabel#" data-auto-bind="#=options.autoBind#" data-animation="#=options.animation#" data-auto-width="#=options.autoWidth#" data-text-field="#=options.dataTextField#" data-value-field="#=options.dataValueField#" ' +
				'data-bind="value : options.value, source: options.dataSource, invisible: options.invisible, disabled : options.disabled, events: { change: options.change, open: options.open, close: options.close, select : options.select}"/>' +
			'#}else if(type == "dropdowncheckbox"){#' +
				'<input id="#=id#" data-auto-bind="#=options.autoBind#" data-role="dropdowncheckbox" data-text-field="#=options.dataTextField#" data-value-field="#=options.dataValueField#" data-select-all-text="#=options.selectAllText#" data-empty-text="#=options.emptyText#" data-is-able-unselect-all="#=options.isAbleUnselectAll#" ' +
				'data-bind="source: options.dataSource, invisible: options.invisible, disabled : options.disabled, events: { change: options.change, open: options.open, close: options.close, select : options.select, selectionChanged : options.selectionChanged }"/>' +
			'#}else if(type == "button"){#' +
				'<button id="#=id#" data-role="button" data-bind="events:{ click : options.click }, disabled : options.disabled, invisible: options.invisible"><span data-bind="text: text"></span></button>' +
			'#}else if(type=="combobox"){#' +
				'<input id="#=id#" data-role="combobox" data-option-label="#=options.optionLabel#" data-auto-bind="#=options.autoBind#" data-animation="#=options.animation#" data-auto-width="#=options.autoWidth#" data-text-field="#=options.dataTextField#" data-value-field="#=options.dataValueField#" data-bind="source: options.dataSource, visible: options.isVisible, disabled : options.disabled, events: { change: options.change, open: options.open, close: options.close, select: options.select}"/>' +
			'#}else if(type="template"){#' +
				'#=template#' +
			'#}#' +
		'</li>' +
	'</script>' +
	'<script id="device-panel-layout-buttons-template" type="text/x-kendo-template">' +
		'<li data-bind="invisible : invisible">' +
			'<button type="button" data-bind="css:{active : active}, text : name, events:{click : click}"></button>' +
		'</li>' +
	'</script>' +
	'<script id="device-panel-view-buttons-template" type="text/x-kendo-template">' +
		'<li>' +
			'<button type="button" data-bind="disabled : disabled, attr: { data-view : viewName, class: buttonClass }, css:{active : active}, events:{click:click}"></button>' +
		'</li>' +
	'</script>' +
	'<script id="device-panel-registration-status-buttons-template" type="text/x-kendo-template">' +
		'<li data-bind="css:{on : active}">' +
			'<button type="button" data-bind="events:{click : click}, disabled: disabled"><span data-bind="text: name"></span> (<span data-bind="text: count">0</span>)</button>' +
		'</li>' +
	'</script>' +
	'<div class="device-container">' +
	    '<div class="type-tab-area">' +
	        '<div class="left">' +
	            '<ul class="view-button device-panel-layout-buttons" data-template="device-panel-layout-buttons-template" data-bind="source: innerLayoutButtons">' +
	            '</ul>' +
	        '</div>' +
	        '<div class="right">' +
	            '<ul class="tab-view-list device-panel-view-buttons" data-template="device-panel-view-buttons-template" data-bind="source: viewButtons">' +
	            '</ul>' +
	            '<div class="search-box" data-bind="invisible: hideSearch">' +
	                '<input data-bind="attr:{placeholder : searchFieldPlaceHolder}, enabled: enableSearch, value : searchFieldValue, events : { keydown : searchKeyDown }" type="text" class="k-textbox" placeholder="Enter search terms">' +
	                '<button class="search-btn ic ic-bt-input-search" data-bind="enabled: enableSearch, events : { click : searchClick }">Search</button>' +
	            '</div>' +
	        '</div>' +
	    '</div>' +
	    '<div class="tab-area-select" data-bind="invisible:hideSelectArea">' +
	        '<div class="left" data-bind="invisible:hideFilterArea">' +
	            '<div class="device-panel-layout-filters">' +
	                '<ul class="device-panel-layout-filters-list" data-template="device-panel-filters-template" data-bind="source:filters">' +
	                '</ul>' +
	            '</div>' +
	        '</div>' +
	        '<div class="right" data-bind="invisible:hideActionArea">' +
	            '<ul class="device-panel-layout-actions-list" data-template="device-panel-filters-template" data-bind="source:actions">' +
	            '</ul>' +
	        '</div>' +
	    '</div>' +
	    '<div class="device-content-wrapper" data-bind="css:{no-action-area:hideSelectArea}">' +
			'<div class="device-registration-buttons-area" data-bind="invisible:hideRegisterArea">' +
				'<div class="left">' +
					'<ul class="view-button" data-template="device-panel-registration-status-buttons-template" data-bind="source:registrationStatusButtons">' +
					'</ul>' +
				'</div>' +
			'</div>' +
			'<div class="device-panel-render-spa" data-bind="css:{no-register-area:hideRegisterArea}">' +
	            '<div class="device-panel-data-render-layout">' +
					'<div class="control-panel" data-bind="invisible:hideRightPanel, css:{ no-map-panel : hideMapPanel}">' +
						'<div class="device-control-panel" data-bind="invisible:hideControlPanel"></div>' +
						'<div class="map-panel" data-bind="invisible:hideMapPanel">' +
	                        '<div class="device-monitoring-map-panel" data-bind="invisible:hideMonitoringMapPanel"></div>' +
	                        '<div class="device-registration-map-panel" data-bind="invisible:hideRegistrationMapPanel"></div>' +
	                    '</div>' +
						'<div class="device-light-control-panel" data-bind="invisible:hideLightControlPanel">' +
							'<div class="group-control-dialog-control groupControl">' +
								'<div class="controllerList noarr">' +
									'<div class="horzline"></div>' +
									'<div class="typename" data-bind="text:lightPanel.lightingText"></div>' +
									'<div class="innerBox">' +
										'<div class="innerSet">' +
											'<button type="button" class="controlBtn k-button" data-bind="events:{click:lightPanel.power.click}, css:{selected:lightPanel.power.active}, invisible:lightPanel.power.invisible"><span class="icwrap"><i class="ic power"></i><span data-bind="visible:lightPanel.power.active">ON</span><span data-bind="visible:lightPanel.power.mixed">/ OFF</span><span data-bind="invisible:lightPanel.power.active">OFF</span></span></button>' +
											'<p class="bluetit" data-bind="invisible:lightPanel.dimmingLevel.invisible, text:lightPanel.brightnessText"></p>' +
											'<div class="tb slider" data-bind="invisible:lightPanel.dimmingLevel.invisible">' +
												'<div class="tbc">' +
													'<div class="customSlider">' +
														'<input style="width:160px;" data-bind="value:lightPanel.dimmingLevel.value,events:{slide:lightPanel.dimmingLevel.slide}" data-role="slider" data-show-buttons="false" data-tooltip="{enabled:false, format:\'{0}\'}" data-tick-placement="none" data-min="0" data-max="100" data-small-step="1" data-large-step="1"/>' +
														'<span class="valTxt"><span data-bind="text:lightPanel.dimmingLevel.value"></span>%</span>' +
													'</div>' +
												'</div>' +
											'</div>' +
											'<div class="no-selected-light" data-bind="invisible:lightPanel.noSelected, text: lightPanel.noSelectedText"></div>' +
										'</div>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
	                '<div class="device-panel-data-render-view" data-bind="css:{no-control-panel:hideRightPanel, no-map-panel:hideMapPanel, no-control:hideControlPanel, no-light:hideLightControlPanel}">' +
	                '</div>' +
	            '</div>' +
	        '</div>' +
	    '</div>' +
	'</div>';

	var DevicePanel = Widget.extend({
		options: {
			name : "DeviceTabPanel",
			events : [
				"beforeChangeInnerLayout",
				"changeInnerLayout",
				"changeDataLayout",
				"select",
				"destroy",
				"activate"
			],
			template : "",
			firstActiveTabIdx : 0,
			callbacks : {
				complete : null,
				error : null
			},
			//add tab Layout method
			tabLayout : []
		},
		/**
		*   <ul>
		*   <li>Facility - Device 기능 내 Tab UI Component를 초기화한다.</li>
		*   </ul>
		*   @function init
		*	@param {HTMLElement} element - 엘리먼트.
		*	@param {Object} options - 위젯 초기 옵션 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		init : function(element, options){
			var self = this;
			var LoadingPanel = window.CommonLoadingPanel;
			options = $.extend(true, {}, self.options, options);
			Widget.fn.init.call(self, element, options);

			options = self.options;
			//initalize tab
			var elem = $(element);
			this.loading = new LoadingPanel(element);
			var layoutOptions = options.tabLayouts;
			var tabDataSource = [];
			var tabDsObj;
			var i, max = layoutOptions.length;

			if(!self.tabLayout){
				self.tabLayout = [];
			}

			for( i = 0; i < max; i++ ){
				tabDsObj = {};
				tabDsObj.name = layoutOptions[i].name;
				tabDsObj.key = layoutOptions[i].key;
				tabDsObj.content = " ";
				tabDataSource.push(tabDsObj);
				self.tabLayout.push(tabDsObj);
			}
			//self.loading.open();
			self.tabStrip = elem.kendoCommonTabStrip({
				dataTextField: "name",
				dataContentField : "content",
				dataSource : tabDataSource
			}).data("kendoCommonTabStrip");
			//elem.

			self.tabStrip.bind("select", self._tabSelectEvt.bind(self));
			self.tabStrip.bind("activate", self._onContentLoad.bind(self));
			//first active index tab select
			//self.tabStrip.select(self.options.firstActiveTabIdx);

			//Widget.fn.init.call(this, element, options);
		},
		/**
		*   <ul>
		*   <li>탭 선택 시, 호출되는 Callback 함수</li>
		*   <li>이전에 선택되어있던 탭의 컨텐츠를 삭제하고, "tabSelect" 이벤트를 Trigger 한다.</li>
		*   </ul>
		*   @function _tabSelectEvt
		*	@param {Event} e - 이벤트 객체
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		_tabSelectEvt : function(e){
			var self = this;

			var beforeSelectedTab = self.tabStrip.select();
			var beforeSelectedTabIdx = $(beforeSelectedTab).index();
			var beforeContentElem = self.tabStrip.contentElement(beforeSelectedTabIdx);

			var curSelectedTab = e.item;
			var curSelectedTabIndex = $(curSelectedTab).index();
			if( beforeSelectedTab !== curSelectedTab
			   && beforeSelectedTabIdx !== curSelectedTabIndex){
				if(beforeSelectedTabIdx != -1){
					self._removeBeforeContent(beforeSelectedTab, beforeContentElem, beforeSelectedTabIdx);
				}
			}

			self.trigger("tabSelect", e);
		},
		/**
		*   <ul>
		*   <li>이전에 선택되어있던 탭의 컨텐츠를 삭제하고, 관련된 View Model과 Widget 인스턴스들, 바인딩 된 이벤트들을 삭제한다.</li>
		*   <li>"destroy" 이벤트를 Trigger 한다.</li>
		*   </ul>
		*   @function _removeBeforeContent
		*	@param {kendoJqueryObject} tab - kendo tab 제이쿼리 객체.
		*	@param {HTMLElement} tabContent - 탭 컨텐트 엘리먼트.
		*	@param {Number} tabIdx - 선택된 탭 인덱스.
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		_removeBeforeContent : function(tab, tabContent, tabIdx){
			//unbind view model
			kendo.unbind(tabContent, this.currentViewModel);

			//destroy view and router, widgets
			var tabLayout = this.tabLayout[tabIdx];
			tabLayout.layout = null;
			tabLayout.router.destroy();
			var innerLayout, innerLayouts = tabLayout.innerLayout;
			var key, dataLayout, dataLayouts;
			var i, max = innerLayouts.length;
			for( i = max - 1; i >= 0; i-- ){
				innerLayout = innerLayouts[i];
				dataLayouts = innerLayout.dataViews;
				for( key in dataLayouts ){
					dataLayout = dataLayouts[key];
					if(!dataLayout) continue;
					if(dataLayout.widget){
						dataLayout.widget.destroy();
					}
					if(dataLayout.widgetElem){
						dataLayout.widgetElem.remove();
					}
					if(dataLayout.view)
						dataLayout.view.destroy();
				}
				innerLayouts.pop();
			}
			tabLayout.innerLayout = null;

			this.actionWidgets.length;
			this.filterWidgets.length;
			this.currentViewModel = null;
			this.currentWidget = null;
			this.currentViewName = null;

			//unbind event
			this.unbind("beforeChangeInnerLayout");
			this.unbind("changeInnerLayout");
			this.unbind("changeDataLayout");

			tab = $(tab);
			tabContent = $(tabContent);

			//trigger event
			var e = {
				destroyedTabElem : tab,
				destroyedTabIndex : tabIdx,
				destroyedTabContent : tabContent
			};

			this.trigger("destroy", e);

			tabContent.empty();
		},
		/**
		*   <ul>
		*   <li>탭 선택 후 해당 탭의 HTML 컨텐츠가 로딩 완료된 후 호출되는 Callback 함수</li>
		*   <li>Option으로 넘겨받은 View의 정보를 업데이트하며, View Model을 생성한다.</li>
		*   <li>View 선택 버튼 등의 이벤트를 바인딩한다.</li>
		*   <li>View 선택 시, 화면 전환을 위한 Router를 생성한다.</li>
		*   <li>"tabContentLoaded" 이벤트를 Trigger 한다.</li>
		*   </ul>
		*   @function _onContentLoad
		* 	@param {Event} e - 이벤트 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		_onContentLoad : function(e){
			//Template Load
			var self = this;
			var selectedTab = e.item;
			var selectedIdx = $(selectedTab).index();
			var activeContent = $(e.contentElement);
			activeContent.html(DEVICE_TAB_CONTENTS_TEMPLATE);
			var activeTabLayoutOption = self.options.tabLayouts[selectedIdx];
			/*var innerLayoutBtnBlock = activeContent.find(".device-panel-layout-buttons");
			var innerLayoutBtnTemplate = activeContent.find("#device-panel-layout-buttons-template");
			var template = kendo.template(innerLayoutBtnTemplate.html());
			innerLayoutBtnBlock.html(template(activeLayoutOption));

			innerLayoutBtnBlock.on("click", "button", self._innerLayoutBtnEvt.bind(self));*/

			//save view model finally
			var tabLayout = self.tabLayout[selectedIdx];
			var content = activeContent.find(".device-container");
			//Load Options
			var activeTabInnerLayouts = activeTabLayoutOption.innerLayout;

			if(!activeTabLayoutOption.viewModel){
				activeTabLayoutOption.viewModel = {};
			}

			//initialize inner Layout ( Monitoring, Registration )
			if(!tabLayout.innerLayout){
				tabLayout.innerLayout = [];
			}

			var viewBox = content.find(".device-panel-data-render-view");

			tabLayout.routeUrl = activeTabLayoutOption.routeUrl;
			tabLayout.router = new kendo.Router();
			tabLayout.layout = new kendo.Layout("<div id='device-data-content' class='device-data-content'></div>");
			tabLayout.router.bind("init", self._routerInit.bind(tabLayout, viewBox));
			tabLayout.router.bind("back", self._routerBack);

			//create view model of innerLayout
			var currentTabInnerLayout, currentTabInnerLayouts = tabLayout.innerLayout;
			var innerLayoutOptions, viewModel, dataLayout, dataViewOptions, dataView,
				innerLayoutButton, viewBtnList, widget, url;
			var i, key, length, max = activeTabInnerLayouts.length;

			//View Buttons 옵션에 클릭 이벤트 바인딩
			viewBtnList = activeTabLayoutOption.viewModel.viewButtons;
			if(viewBtnList){
				length = viewBtnList.length;
				for( i = 0; i < length; i++ ){
					viewBtnList[i].click = self._dataLayoutBtnEvt.bind(self);
				}
			}

			viewModel = $.extend(true, {}, activeTabLayoutOption.viewModel);
			if(!viewModel.innerLayoutButtons){
				viewModel.innerLayoutButtons = [];
			}

			for( i = 0; i < max; i++ ){
				//self.tabLayout에 새롭게 생성할 Layout Option
				currentTabInnerLayout = currentTabInnerLayouts[i] = {};
				innerLayoutButton = viewModel.innerLayoutButtons[i] = {};
				//인자로 전달 받은 Tab의 Layout Option
				innerLayoutOptions = activeTabInnerLayouts[i];
				innerLayoutButton.index = currentTabInnerLayout.index = i;
				innerLayoutButton.name = currentTabInnerLayout.name = innerLayoutOptions.name;
				innerLayoutButton.active = currentTabInnerLayout.active = innerLayoutOptions.active;
				innerLayoutButton.disabled = currentTabInnerLayout.disabled = innerLayoutOptions.disabled;
				innerLayoutButton.invisible = currentTabInnerLayout.invisible = innerLayoutOptions.invisible;
				innerLayoutButton.layoutName = currentTabInnerLayout.layoutName = innerLayoutOptions.layoutName;
				innerLayoutButton.click = self._innerLayoutBtnEvt.bind(self);
				currentTabInnerLayout.routeUrl = innerLayoutOptions.routeUrl;
				currentTabInnerLayout.defaultView = innerLayoutOptions.defaultView;
				currentTabInnerLayout.dataViews = {};
				dataLayout = innerLayoutOptions.dataLayout;
				for(key in dataLayout){
					dataViewOptions = dataLayout[key];
					dataView = currentTabInnerLayout.dataViews[key] = {};
					if(dataViewOptions.widget){
						dataView.widgetElem = $("<div/>");
						if(!dataViewOptions.widgetOptions){
							dataViewOptions.widgetOptions = {};
						}

						var DataViewOptionsWidget = dataViewOptions.widget;
						widget = new DataViewOptionsWidget(dataView.widgetElem, dataViewOptions.widgetOptions);
						dataView.widget = widget;
						dataView.view = new kendo.View(widget.wrapper);
					}else if(dataViewOptions.template){
						dataView.template = dataViewOptions.template;
						dataView.view = new kendo.View(dataViewOptions.template);
					}else{
						dataView.view = new kendo.View($("<div/>").text("There is no defined view."));
					}

					url = dataView.routeUrl = activeTabLayoutOption.routeUrl + innerLayoutOptions.routeUrl + dataViewOptions.routeUrl;
					tabLayout.router.route(url, self._routerEvt.bind(tabLayout, "#device-data-content", dataView.view));
				}
			}

			//initialize
			//selected inner layout (e.g : monitoring)
			var firstInnerLayoutIdx = typeof activeTabLayoutOption.firstActiveInnerLayoutIndex !== "undefined" ? activeTabLayoutOption.firstActiveInnerLayoutIndex : 0;
			//set First Layout
			var activeInnerLayout = currentTabInnerLayouts[firstInnerLayoutIdx];

			self.currentViewModel = kendo.observable(viewModel);
			kendo.bind(content, self.currentViewModel);
			//innerLayoutBtnBlock.find("button").eq(firstInnerLayoutIdx).addClass("active");
			self.currentViewModel.innerLayoutButtons[firstInnerLayoutIdx].set("active", true);
			tabLayout.curInnerLayoutIndex = firstInnerLayoutIdx;
			tabLayout.curInnerLayoutName = activeInnerLayout.layoutName;


			self._getCurrentFilters(content);
			self._getCurrentActions(content);
			self._getCurrentSearch(content);
			//activeInnerLayout.router.start();

			tabLayout.router.start();

			var widgets = {};
			widgets.actions = self.actionWidgets;
			widgets.filters = self.filterWidgets;
			widgets.search = self.searchWidgets;

			var obj = {
				selectedTabIndex : selectedIdx,
				contentElement : activeContent,
				innerLayouts : currentTabInnerLayouts,
				tabLayout : tabLayout,
				firstActiveInnerLayout : activeInnerLayout,
				viewModel : self.currentViewModel
			};

			self.trigger("activate", obj);
		},
		/**
		*   <ul>
		*   <li>현재 View의 검색 필드 및 검색 버튼에 대한 요소를 가져온다.</li>
		*   </ul>
		*   @function _getCurrentSearch
		*	@param {jQueryObject} content - 컨텐트 제이쿼리 오브젝트.
		*   @returns {Array} - 검색 필드와 버튼의 요소가 담인 배열
		*   @alias module:app/widget/common-device-panel
		*/
		_getCurrentSearch : function(content){
			var self = this;
			var searchLayoutUl = content.find(".search-box");
			var ftSearch = searchLayoutUl.find(".k-textbox");
			var btnSearch = searchLayoutUl.find(".search-btn");
			var searchWidgets = [];

			searchWidgets.push(ftSearch);
			searchWidgets.push(btnSearch);

			self.searchWidgets = searchWidgets;
			return searchWidgets;
		},
		/**
		*   <ul>
		*   <li>현재 View의 필터 드롭다운 리스트, 체크박스 드롭다운 리스트를 가져온다.</li>
		*   </ul>
		*   @function _getCurrentFilters
		*	@param {jQueryObject} content - 컨텐트 제이쿼리 오브젝트.
		*   @returns {Array} - 드롭다운리스트, 체크박스 드롭다운 리스트 위젯 인스턴스가 담긴 배열
		*   @alias module:app/widget/common-device-panel
		*/
		_getCurrentFilters : function(content){
			var self = this;
			var filterLayoutListUl = content.find(".device-panel-layout-filters-list");
			var filterWidgets = [];
			var filters = self.currentViewModel.filters;

			filterLayoutListUl.find(" > li").each(function(index){
				var widget, elem = $(this).find("#" + filters[index].id);
				var role = elem.data("role");
				if(role == "dropdownlist"){
					widget = elem.data("kendoDropDownList");
				}else if(role == "dropdowncheckbox"){
					widget = elem.data("kendoDropDownCheckBox");
				}else if(role == "button"){
					widget = elem.data("kendoButton");
				}else if(role == "combobox"){
					widget = elem.data("kendoCombobox");
					//template
				}else{
					widget = elem;
				}
				filterWidgets.push(widget);
			});

			self.filterWidgets = filterWidgets;
			return filterWidgets;
		},
		/**
		*   <ul>
		*   <li>현재 View의 버튼들을 가져온다.</li>
		*   </ul>
		*   @function _getCurrentActions
		*	@param {jQueryObject} content - 컨텐트 제이쿼리 오브젝트.
		*   @returns {Array} - kendoButton 위젯 인스턴스가 담긴 배열
		*   @alias module:app/widget/common-device-panel
		*/
		_getCurrentActions : function(content){
			var self = this;
			var actionLayoutListUl = content.find(".device-panel-layout-actions-list");
			var actionWidgets = [];
			var actions = self.currentViewModel.actions;
			actionLayoutListUl.find("li").each(function(index){
				var widget, elem = $(this).find("#" + actions[index].id);
				var role = elem.data("role");
				if(role == "dropdownlist"){
					widget = elem.data("kendoDropDownList");
				}else if(role == "button"){
					widget = elem.data("kendoButton");
				}else if(role == "combobox"){
					widget = elem.data("kendoCombobox");
					//template
				}else{
					widget = elem;
				}
				actionWidgets.push(widget);
			});

			self.actionWidgets = actionWidgets;
			return actionWidgets;
		},
		/**
		*   <ul>
		*   <li>현재 View의 이름을 가져온다</li>
		*   </ul>
		*   @function _getDefaultViewName
		*	@param {Array} btnList - 버튼 배열.
		*   @returns {String} - View 이름
		*   @alias module:app/widget/common-device-panel
		*/
		_getDefaultViewName : function(btnList){
			var i, max = btnList.length;
			for(i = 0; i < max; i++ ){
				if(!btnList[i].disabled){
					return btnList[i].viewName;
				}
			}
		},
		//this is innerLayout
		_routerInit : function(viewBox){
			this.router.replace(this.routeUrl, true);
			this.layout.render(viewBox);
		},
		_routerBack : function(e){
			if(e.to){
				var splits = e.to.split("/");
				if(splits.length == 2){
					window.history.go(-1);
				}
			}
			window.history.go(0);
		},
		_routerEvt : function(viewBoxId, view){
			this.layout.showIn(viewBoxId, view);
		},
		_setViewModel : function(viewModel){
			var key;
			//performance?
			for(key in viewModel){
				//if($.isPlainObject())
				this.currentViewModel.set(key, viewModel[key]);
			}
		},
		/**
		*   <ul>
		*   <li>Monitoring/Registration 등의 View 전환 시, 호출되는 Callback 함수</li>
		*   </ul>
		*   @function _innerLayoutBtnEvt
		*	@param {Event} e - 이벤트 객체
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		_innerLayoutBtnEvt : function(e){
			if(e.target.nodeName == "BUTTON"){
				var elem = $(e.target);
				var li = elem.closest("li");

				var index = li.index();

				if(elem.hasClass("active")){
					return;
				}

				//beforeChangeInnerLayout 이벤트 트리거 추가
				var tabLayout = this.getActiveTabLayout();
				var innerLayout = tabLayout.innerLayout;
				var activeInnerLayout = innerLayout[index];
				var tab = this.tabStrip.select();
				var tabIndex = tab.index();
				var contentElem = this.tabStrip.contentElement(tabIndex);
				var filterWidgets = this._getCurrentFilters($(contentElem));
				var actionWidgets = this._getCurrentActions($(contentElem));

				var event = {
					viewModel : this.currentViewModel,
					innerLayout : activeInnerLayout,
					actions : actionWidgets,
					filters : filterWidgets,
					index : index
				};

				var isCancel = this.trigger("beforeChangeInnerLayout", event);
				if(isCancel){
					return;
				}
				this.changeInnerLayout(index);
			}
		},
		/**
		*   <ul>
		*   <li>Statistic/List/Grid 등의 View 전환 시, 호출되는 Callback 함수</li>
		*   </ul>
		*   @function _dataLayoutBtnEvt
		*	@param {Event} e - 이벤트 객체.
		*   @param {String}viewName - 전환될 View 이름
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		_dataLayoutBtnEvt : function(e, viewName){
			if(e.target.nodeName == "BUTTON"){
				if(e.originalEvent) isOriginalClick = true;
				else isOriginalClick = false;

				var elem = $(e.target);
				if(elem.hasClass("active")){
					return;
				}
				viewName = elem.data("view") || viewName;
				this.changeDataLayout(viewName);
				// console.log("data layout btn evt");
			}
		},
		/**
		*   <ul>
		*   <li>Statistic/List/Grid 등의 View 전환 버튼의 클릭 이벤트를 Trigger 한다.</li>
		*   </ul>
		*   @function _dataLayoutBtnEvt
		*   @param {Number}index - View 버튼 인덱스
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		clickViewButton : function(index){
			this.element.find(".device-panel-view-buttons").eq(index).click();
		},
		isOriginalClick : function(){
			return isOriginalClick;
		},
		/**
		*   <ul>
		*   <li>현재 활성된 Tab 정보를 가져온다.</li>
		*   </ul>
		*   @function getActiveTabLayout
		*   @returns {Object} - Tab 정보가 담긴 객체
		*   @alias module:app/widget/common-device-panel
		*/
		getActiveTabLayout : function(){
			var tabElem = this.tabStrip.select();
			var tabIdx = tabElem.index();
			var tabLayout = this.tabLayout[tabIdx];
			return tabLayout;
		},
		/**
		*   <ul>
		*   <li>현재 활성된 Registration/Monitoring 등의 View(Layout) 정보를 가져온다.</li>
		*   </ul>
		*   @function getActiveInnerLayout
		*   @returns {Object} - View 정보가 담긴 객체
		*   @alias module:app/widget/common-device-panel
		*/
		getActiveInnerLayout : function(){
			var tabLayout = this.getActiveTabLayout();
			var curIdx = tabLayout.curInnerLayoutIndex;
			var innerLayout = tabLayout.innerLayout;
			return innerLayout[curIdx];
		},
		/**
		*   <ul>
		*   <li>전환된 View(Registration/Monitroing)의 View Model을 새롭게 생성하고, "changeInnerLayout" 이벤트를 트리거한다.</li>
		*   </ul>
		*   @function changeInnerLayout
		*   @param {Number}index - 변경될 Layout의 Index
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		changeInnerLayout : function(index){
			var btnList = this.currentViewModel.innerLayoutButtons;
			var i, max = btnList.length;
			var activeBtn, btn;

			if(isNaN(index)){	//LayoutName 스트링으로 레이아웃 변경
				for( i = 0; i < max; i++ ){
					btn = btnList[i];
					if(btn.layoutName == index && !btn.disabled){
						activeBtn = btn;
						index = i;
						btn.set("active", true);
					}else{
						btn.set("active", false);
					}
				}
			}else{				//Index로 레이아웃 변경
				for( i = 0; i < max; i++ ){
					btn = btnList[i];
					if(i == index && !btn.disabled){
						activeBtn = btn;
						btn.set("active", true);
					}else{
						btn.set("active", false);
					}
				}
			}

			if(!activeBtn){
				console.error("there is no valid view button for " + index);
				return;
			}

			//change callback
			var tabLayout = this.getActiveTabLayout();
			var innerLayout = tabLayout.innerLayout;
			var activeInnerLayout = innerLayout[index];
			//change view model
			//performance?
			//this._setViewModel(activeInnerLayout.viewModel);
			tabLayout.curInnerLayoutIndex = index;
			tabLayout.curInnerLayoutName = activeInnerLayout.layoutName;

			var tab = this.tabStrip.select();
			var tabIndex = tab.index();
			var contentElem = this.tabStrip.contentElement(tabIndex);
			var filterWidgets = this._getCurrentFilters($(contentElem));
			var actionWidgets = this._getCurrentActions($(contentElem));

			var event = {
				viewModel : this.currentViewModel,
				innerLayout : activeInnerLayout,
				actions : actionWidgets,
				filters : filterWidgets,
				index : index
			};
			this.trigger("changeInnerLayout", event);
		},
		/**
		*   <ul>
		*   <li>Router를 통해 Statistic/Grid/List View를 전환한다.</li>
		*   <li>View 버튼 선택 상태를 업데이트한다.</li>
		*   <li>"changeDataLayout" 이벤트를 트리거한다.</li>
		*   </ul>
		*   @function changeDataLayout
		*   @param {String}key - 변환될 View의 Key 값
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		changeDataLayout : function(key){
			//change callback
			var tabLayout = this.getActiveTabLayout();
			var innerLayout = this.getActiveInnerLayout();
			var view = innerLayout.dataViews[key];

			//정의된 뷰가 없는 경우
			if(!view){
				console.info("view has " + innerLayout.defaultView + " not found in dataLayout options.");
				var newKey;
				for(newKey in innerLayout.dataViews){
					if(innerLayout.dataViews[newKey]){
						view = innerLayout.dataViews[newKey];
						key = newKey;
						break;
					}
				}
				if(!view) return;
			}
			//route
			var btnList = this.currentViewModel.viewButtons;
			var i, max = btnList.length;
			var activeBtn, btn;
			for( i = 0; i < max; i++ ){
				btn = btnList[i];
				if(btnList[i].viewName == key && !btnList[i].disabled){
					activeBtn = btn;
					btn.set("active", true);
				}else{
					btn.set("active", false);
				}
			}

			//해당 뷰가 활성화 상태가 아닐 경우
			if(!activeBtn){
				console.error("there is no valid view button for " + key);
				return;
			}

			tabLayout.router.navigate(view.routeUrl);

			var event = {
				innerLayout : innerLayout,
				widget : view.widget,
				view : view,
				viewName : key
			};

			this.currentViewName = key;
			this.currentWidget = view.widget;

			this.trigger("changeDataLayout", event);

			//for grid scroll.
			if(view.widget && view.widget._setContentHeight){
				view.widget._setContentHeight();
			}
			//changed callback
		},
		setDefaultView : function(innerLayoutIndex, viewName){
			var tabLayout = this.getActiveTabLayout();
			var innerLayout = tabLayout.innerLayout;
			innerLayout[innerLayoutIndex].defaultView = viewName;
		},
		//Control Panel 자리에 붙는 Widget 협의필요
		//deprecated
		getPanelDom : function(){
			var tabElem = this.tabStrip.select();
			var tabIdx = tabElem.index();
			//active tab content
			var contentElem = this.tabStrip.contentElement(tabIdx);
			var panel = $(contentElem).find(".control-panel");

			return panel;


		//            var mapListPanel = panel.kendoMapListView({
		//                dataSource : datasource.view(),
		//                viewModel : {
		//                    floor : "All",
		//                    floorCount : "12",
		//                    floorActive : false,
		//                    floorDisabled : false,
		//                    selectedCount : "(12)",
		//                    selectedTxt : "Selected"
		//                },
		//                filterTab : [   //필터링 할 탭
		//                    {
		//                        field : "selected", //해당 필드는 실제 모델에 존재하지 않는 필드. 이 필드는 위젯에서 처리
		//                        template : "<span data-bind='text: selectedTxt, css:{active : selectedActive}, disabled : selectedDisabaled, invisible : selectedInvisible'></span> <span data-bind='text: selectedCount'></span>",
		//                    },
		//                    {
		//                        field : "Floor",    //디바이스 모델 필드
		//                        template : "<span data-bind='text: floor, css:{active : floorActive}, disabled : floorDisabled, invisible : floorInvisible'></span> <span data-bind='text: floorCount'></span>",
		//                    }
		//                ],
		//                groupTemplate : {
		//                    Floor : function(data){
		//                            var template = "<div class='group-title'>";
		//                            template += '<span>'+data.value+'</span> ';
		//                            if(data.items.length > 0)
		//                            template += '<i class="ic ic-list-control-arrow"></i></span></div>';
		//                            return template;
		//
		//                    },
		//                    type : function(data){
		//                        var template = "<div class='group-title'>";
		//                        template += '<span>'+data.value+'</span> ';
		//                        if(data.items.length > 0)
		//                        template += '<i class="ic ic-list-control-arrow"></i></span></div>';
		//                        return template;
		//                    }
		//                },
		//                itemTemplate : '<div class="icon"><i class="device-ic"></i></div><div class="device-info"><span class="device-id">#=deviceId#<span class="device-name">#=deviceName#</div><div class="device-detail"><i class="ic ic-info" data-id="#=id#"></i></div>',
		//                groupList : [{ field : "Floor" }, {field : "type"}]
		//            }).data("kendoMapListView");


		//            panel.kendoDeviceList({dataSource : datasource});
		},

		//interface
		getFilterWidgets : function(){
			return this.filterWidgets;
		},
		getActionWidgets : function(){
			return this.actionWidgets;
		},
		//get Current Layout Widget
		getViewWidgets : function(layoutIdx){
			var innerLayout;
			var tabLayout = this.getActiveTabLayout();
			if(!layoutIdx){
				innerLayout = this.getActiveInnerLayout();
			}else{
				innerLayout = tabLayout.innerLayout[layoutIdx];
			}

			var dataViews = innerLayout.dataViews;
			var key;
			var widgets = {};
			for( key in dataViews ){
				widgets[key] = dataViews[key].widget;
			}
			return widgets;
		},
		//get all layout widget in current tab
		getAllViewWidgets : function(){
			var tabLayout = this.getActiveTabLayout();
			var widgetList = [];
			var innerLayouts = tabLayout.innerLayout;
			var i, key, dataView, widgets, max = innerLayouts.length;
			var layout;
			for( i = 0; i < max; i++ ){
				layout = innerLayouts[i];
				widgets = {};
				for(key in layout.dataViews){
					dataView = layout.dataViews[key];
					widgets[key] = dataView.widget;
				}
				widgetList.push(widgets);
			}
			return widgetList;
		},
		getViewModel : function(){
			return this.currentViewModel;
		},
		getViewRouter : function(){
			var viewBtnList = this.currentViewModel.get("viewButtons");
			var length = viewBtnList.length;
			for(var i = 0; i < length; i++){
				if(viewBtnList[i].active) return i;
			}
		},
		setViewModel : function(obj){
			var key;
			for(key in obj){
				this.currentViewModel.set(key, obj[key]);
			}
		},
		setViewButtons : function(arr){
			var viewBtnList = this.currentViewModel.get("viewButtons");
			var i, max = arr.length;
			for( i = 0; i < max; i++ ){
				viewBtnList[i].set(arr[i]);
			}
		},
		/**
		*   <ul>
		*   <li>View(Grid. List...) 버튼을 활성화/비활성화한다.</li>
		*   </ul>
		*   @function setEnableViewBtnList
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		setEnableViewBtnList : function(){
			var viewBtnList = this.currentViewModel.get("viewButtons");

			if (arguments.length === 2){
				viewBtnList[arguments[0]].set("disabled", arguments[1]);
			} else if (arguments.length === 1){
				var length = viewBtnList.length;
				for(var i = 0; i < length; i++){
					viewBtnList[i].set("disabled", arguments[0][i]);
				}
			}

		},
		/**
		*   <ul>
		*   <li>버튼(등록, 상세정보 등)을 활성화/비활성화한다.</li>
		*   </ul>
		*   @function setEnableActions
		*   @param {Array}isEnables - 활성화/비활성화 정보가 담긴 배열
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		setEnableActions : function(){
			var actions = this.currentViewModel.actions;
			if (arguments.length === 2){
				actions[arguments[0]].options.set("disabled", arguments[1]);
			} else if(arguments.length === 1){
				//0 : selected text
				var length = actions.length;
				for(var i = 0; i < length; i++){
					actions[i].options.set("disabled", arguments[0]);
				}
			}
		},
		setEnableActionsWithList : function(disabledList){
			var actions = this.currentViewModel.actions;
			var i, disabled, max = disabledList.length;
			for( i = 0; i < max; i++ ){
				disabled = disabledList[i];
				actions[i].options.set("disabled", disabled);
			}
		},
		/**
		*   <ul>
		*   <li>Zone 필터를 표시/미표시한다.</li>
		*   </ul>
		*   @function setInvisibleZoneFilter
		*   @param {Boolean}isInvisible - 숨김여부
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		setInvisibleZoneFilter : function(isInvisible){
			var filters = this.currentViewModel.filters;
			filters[3].options.set("invisible", isInvisible);
		},
		/**
		*   <ul>
		*   <li>Zone 필터를 활성화/비활성화한다.</li>
		*   </ul>
		*   @function setDisableZoneFilter
		*   @param {Boolean}isDisable - 비활성화 여부
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		setDisableZoneFilter : function(isDisable){
			var filters = this.currentViewModel.filters;
			filters[3].options.set("disabled", isDisable);
		},
		selectTab : function(tabIdx){
			this.tabStrip.select(tabIdx);
		},
		/**
		*   <ul>
		*   <li>Statistic View의 데이터를 Set하여, Widget의 데이터를 업데이트한다. (setDataSource())</li>
		*   </ul>
		*   @function setStatisticDatasource
		*   @param {Array}dataSource - 통계 뷰 데이터 리스트
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		setStatisticDatasource : function(dataSource){
			var tabLayout = this.getActiveTabLayout();
			if(!tabLayout){
				console.info("Current Tab is not initialized to set widget datasource in data views.");
				return;
			}
			var innerLayouts = tabLayout.innerLayout;
			if(!innerLayouts){
				console.info("Current Tab is not initialized to set widget datasource in data views.");
				return;
			}
			var i, dataView, widget, max = innerLayouts.length;
			var layout, newDataSource;

			for( i = 0; i < max; i++ ){
				layout = innerLayouts[i];
				dataView = layout.dataViews["statistic"];
				if(!dataView) continue;

				widget = dataView.widget;

				if(widget && widget.setDataSource){
					newDataSource = new kendo.data.DataSource({
						data : dataSource
						// pageSize : 20
					});
					widget.setDataSource(newDataSource);
				}
			}
		},
		/**
		*   <ul>
		*   <li>Map View에 Zone Data 데이터를 Set하여, Widget의 데이터를 업데이트한다. (setDataSource())</li>
		*   </ul>
		*   @function setZoneDatasource
		*   @param {Array}zoneDataSource - Zone 데이터 리스트
		*   @param {String}floorObj - Map View에 포시할 층 이미지를 포함한 층 정보
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		setZoneDatasource : function(zoneDataSource, floorObj){
			var tabLayout = this.getActiveTabLayout();
			if(!tabLayout){
				console.info("Current Tab is not initialized to set widget datasource in data views.");
				return;
			}
			var innerLayouts = tabLayout.innerLayout;
			if(!innerLayouts){
				console.info("Current Tab is not initialized to set widget datasource in data views.");
				return;
			}
			var i, dataView, widget, max = innerLayouts.length;
			var layout;
			for( i = 0; i < max; i++ ){
				layout = innerLayouts[i];
				dataView = layout.dataViews["map"];
				if(!dataView) continue;

				widget = dataView.widget;

				if(widget && widget.setZoneDataSource && widget.zoneDataSource){
					//var length = 0;
					/*if((widget.zoneDataSource instanceof kendo.data.DataSource)){
						length = widget.zoneDataSource.total();
					}else{
						length = widget.zoneDataSource.length;
					}*/
					//                    if(imageUrl){
					widget.setFloor(floorObj);
					//                    }
					widget.setZoneDataSource(zoneDataSource);
					/*if(length == 0 && isOnce){
						widget.setZoneDataSource(zoneDataSource);
						isOnce = false;
					}
					else{
						// Map객체의 경우 setZoneDataSource로 그림을 그려주게되면 Svg문제점때문인지그림이 2번 중복으로 일어나게됨.
						// clear후 재 refresh시 에도 2번째 그리는 그림의 텍스트 위치가 바뀜. 이를 해결하기 위해 0번째의 Map객체만 초기화 해주고
						// 그 이후에 0번쨰 데이터를 타 innerLayout에 복사.
						innerLayouts[i].dataViews.map = $.extend({}, innerLayouts[0].dataViews.map);
					}*/
				}
			}
		},
		/**
		*   <ul>
		*   <li>전체 레이아웃 별 Data View(Grid, List)에 id값을 참조하여 해당 id 값을 가진 데이터를 삭제한다.</li>
		*   </ul>
		*   @function removeItemAllDataSource
		*   @param {String|Number}id - 아이템의 ID 값
		*   @param {Number}innerLayoutIndex - 아이템을 삭제할 레이아웃(Monitoring, Registration) 인덱스
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		removeItemAllDataSource : function(id, innerLayoutIndex){
			var tabLayout = this.getActiveTabLayout();
			if(!tabLayout){
				console.info("Current Tab is not initialized to set widget datasource in data views.");
				return;
			}
			var innerLayouts = tabLayout.innerLayout;
			if(!innerLayouts){
				console.info("Current Tab is not initialized to set widget datasource in data views.");
				return;
			}
			var layout, i, max = innerLayouts.length;
			if(typeof innerLayoutIndex !== "undefined"){
				layout = innerLayouts[innerLayoutIndex];
				this.removeItemInnerLayout(id, layout);
			}else{
				for( i = 0; i < max; i++ ){
					layout = innerLayouts[i];
					this.removeItemInnerLayout(id, layout);
				}
			}
		},
		/**
		*   <ul>
		*   <li>전체 레이아웃 별 Data View(Grid, List)에 id값을 참조하여 해당 id 값을 가진 데이터를 삭제한다.</li>
		*   </ul>
		*   @function removeItemInnerLayout
		*   @param {String|Number}id - 아이템의 ID 값
		*   @param {Object}layout - 아이템을 삭제할 레이아웃(Monitoring, Registration) 객체
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		removeItemInnerLayout : function(id, layout){
			var key, dataView, widget, item;
			for(key in layout.dataViews){
				if(key === "statistic") continue;
				dataView = layout.dataViews[key];
				widget = dataView.widget;

				if(widget && widget.dataSource){
					item = widget.dataSource.get(id);
					if(item){
						widget.dataSource.remove(item);
					}
				}
			}
		},
		/**
		*   <ul>
		*   <li>전체 레이아웃 별 Data View(Grid, List)에 Data를 Set한다.</li>
		*   </ul>
		*   @function setViewWidgetDatasource
		*   @param {String|Number}dataSource - 데이터 리스트
		*   @param {Array|Object}sortOption - sort()하여 정렬할 정렬 옵션 객체
		*   @param {Number}innerLayoutIndex - 레이아웃(Monitoring/Registration) 인덱스
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		setViewWidgetDatasource : function(dataSource, sortOption, innerLayoutIndex){
			var tabLayout = this.getActiveTabLayout();
			if(!tabLayout){
				console.info("Current Tab is not initialized to set widget datasource in data views.");
				return;
			}
			var innerLayouts = tabLayout.innerLayout;
			if(!innerLayouts){
				console.info("Current Tab is not initialized to set widget datasource in data views.");
				return;
			}
			var layout, i, max = innerLayouts.length;

			if(typeof innerLayoutIndex !== "undefined"){
				layout = innerLayouts[innerLayoutIndex];
				this.setInnerLayoutDataSource(dataSource, sortOption, layout);
			}else{
				for( i = 0; i < max; i++ ){
					layout = innerLayouts[i];
					this.setInnerLayoutDataSource(dataSource, sortOption, layout);
				}
			}
		},
		setInnerLayoutDataSource : function(dataSource, sortOption, layout){
			var key, dataView, widget;
			var newDataSource;

			for(key in layout.dataViews){
				if(key === "statistic") continue;
				dataView = layout.dataViews[key];
				widget = dataView.widget;

				if(widget && widget.setDataSource){
					newDataSource = new kendo.data.DataSource({
						data : dataSource
						// pageSize : 20
					});
					newDataSource.read();
					if(sortOption){
						newDataSource.sort(sortOption);
					}
					widget.setDataSource(newDataSource);
				}
			}
		}
	});

	//jQuery를 통해 요소에서 호출할 수 있도록 플러그인 등록
	kendo.ui.plugin(DevicePanel);

})(window, jQuery);
//# sourceURL=widget/common-device-panel.js
