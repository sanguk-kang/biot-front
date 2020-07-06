(function($){
	"use strict";
	var kendo = window.kendo,
		ui = kendo.ui,
		CommonTabStrip = ui.CommonTabStrip;

	var monitoringTabContentTemplate = $("#hmi-monitoring-tab-template"),
		createTabContentTemplate = $("#hmi-create-tab-template");

	var MONITORING = "monitoring", CREATE = "create", EMPTY_TAB_PREFIX = "empty-";

	var HmiTabStrip = CommonTabStrip.extend({
		options: {
			name: "HmiTabStrip",
			type: MONITORING,
			maximum: 10
		},
		events: [
			'orderChanged',		// 탭 순서 변경 후 trigger
			'beforeActivate',	// 탭 변경시 변경 전에 trigger
			'add',		// 새 탭이 생성되기 전에 trigger
			'added',	// 새 탭이 생성된 후 trigger
			'delete',	// 탭이 삭제되기 전에 trigger
			'deleted'	// 탭이 삭제된 후 trigger
		],
		init: function(element, options) {
			var that = this;
			CommonTabStrip.fn.init.call(this, element, options);
			options = that.options;
			that.setCurrentTabCanvasInfo({id: EMPTY_TAB_PREFIX + '1', name: window.I18N.prop('HMI_EMPTY_TAB'), zoomLevel: 100});
			// that.initTooltip();
			that.initSortable();
			that._attachEvt();
		},
		initTooltip: function() {
			var that = this, element = that.element;
			if (!element.data("kendoTooltip")){
				element.kendoTooltip({
					filter : "li.k-item",
					wrapperCssClass : "hmi-tab-tooltip",
					content : function(e){
						var target = e.target;
						return target.find('.tab-name').attr('title');
					},
					position : 'bottom'
				}).data("kendoTooltip");
			}
		},
		initSortable: function() {
			var that = this;
			var scrollArea = $(that.scrollbar.scrollArea[0]);

			var tabAddButton = that._tabAddButton = $('<span/>').addClass('add-btn').addClass('ic').addClass('ic-plus');
			scrollArea.append(tabAddButton);
			scrollArea.find('.top-tab-menu').css('position', 'relative');

			var type = that.options.type;
			var container = "ul.k-tabstrip-items";
			// var container = "span.common-tab-scroll-wrapper";
			if (type == MONITORING) {
				container = "#hmi-tab " + container;
			} else if (type == CREATE) {
				container = "#hmi-create-tab " + container;
			}

			// 탭 드래그앤드랍
			scrollArea.find('.k-tabstrip-items').kendoSortable({
				filter : "li.k-item",
				axis : "x",
				container : container,
				autoScroll : true,
				hint : function(elem) {
					var id = that.contentElements.length == 1 ? "no-hint" : "hint";
					return $("<div id='" + id + "' class='common-tab-strip k-tabstrip'><ul class='top-tab-menu k-tabstrip-items k-reset' style='position: relative; left: 0;'><li class='k-item k-state-active k-tab-on-top'>" + elem.html() + "</li></ul></div>");
				},
				start : function(e) {
					that.activateTab(e.item);
					if (that.contentElements.length == 1) {
						e.preventDefault();
					}
				},
				change : function(e) {
					var tabstrip = that,
						reference = tabstrip.tabGroup.children().eq(e.newIndex);

					if(e.oldIndex < e.newIndex) {
						tabstrip.insertAfter(e.item, reference);
					} else {
						tabstrip.insertBefore(e.item, reference);
					}
					that.trigger('orderChanged');
				}
			});
		},
		_attachEvt: function() {
			var that = this;
			var scrollArea = $(that.scrollbar.scrollArea[0]);
			var closeBtn = scrollArea.find('.ic-close');
			var tabAddButton = that._tabAddButton;

			// scrollArea에서 이벤트 위임을 하면, x버튼 이벤트 보다 탭 선택이 먼저 발생하여 x버튼에 직접 걸어준다.
			closeBtn.on('click', that.removeTabEvt.bind(that));

			tabAddButton.bind('click', that.addTab.bind(that));
		},
		activateTab : function(item) {
			var canvasInfo = this.getCurrentTabCanvasInfo();
			this.trigger('beforeActivate', canvasInfo);
			CommonTabStrip.fn.activateTab.call(this, item);
		},
		removeTabEvt : function(e) {
			var that = this;
			var tab = $(e.currentTarget).closest('li');
			var index = tab.index();
			var currentIndex = that.getCurrentTabIndex();
			var id = tab.data('id');
			e.id = id;
			e.isCurrentTab = index == currentIndex; // index == currentIndex는 닫는 탭이 현재 활성화된 탭 여부를 알려주기 위함
			e.index = index;
			if (!that.trigger('delete', e)) {
				var isCurrentTab = currentIndex == index;
				if (isCurrentTab) {
					if (index == 0) {
						that.select(1);
					} else if (index == that.contentElements.length - 1) {
						that.select(index - 1);
					} else {
						that.select(index + 1);
					}
				}
				that.remove(index);
				that._tabAddButton.show();
				that.trigger('deleted', id, isCurrentTab);
			}
			e.stopPropagation();
		},
		getCurrentTabCanvasInfo: function() {
			var currentTabIndex = this.getCurrentTabIndex();
			if (currentTabIndex == -1) return { id: void (0), name: void (0) };
			var tab = this.getTabLiByIndex(currentTabIndex);
			var id = tab.data('id'), name = tab.data('name'), zoomLevel = tab.data('zoomLevel');
			return { id: id, name: name, zoomLevel: zoomLevel };
		},
		setCurrentTabCanvasInfo: function(canvasInfo) {
			var currentTabIndex = this.getCurrentTabIndex();
			if (currentTabIndex == -1) return false;
			this.changeTabInfo(currentTabIndex, canvasInfo);
			return true;
		},
		getCurrentTabIndex: function() {
			var currentTab = this.wrapper.find('[aria-expanded=true]');
			var currentTabId = currentTab.attr('id');
			if (!currentTabId) return -1;
			var currentTabIdSplit = currentTabId.split('-');
			var currentTabIndex = currentTabIdSplit[currentTabIdSplit.length - 1];
			if (currentTabIndex) currentTabIndex = Number(currentTabIndex) - 1;
			else currentTabIndex = -1;
			return currentTabIndex;
		},
		getCurrentOpenedTabInfo: function() {
			var that = this;
			var result = {};
			var tabs = that.getTabLiByIndex();
			var currentTabCanvasInfo = that.getCurrentTabCanvasInfo();
			var currentId = currentTabCanvasInfo.id;
			if (typeof currentId == 'string' && currentId.indexOf(EMPTY_TAB_PREFIX) != -1) result['activeTab'] = {};
			else result['activeTab'] = currentTabCanvasInfo;

			var openedTab = result['openedTab'] = [];
			var id, name, zoomLevel;
			tabs.each(function(idx, tab) {
				tab = $(tab);
				id = tab.data('id');
				name = tab.data('name');
				zoomLevel = tab.data('zoomLevel') || 100;
				if (typeof id == "undefined" || (typeof id == "string" && id.indexOf(EMPTY_TAB_PREFIX) != -1)) return;
				openedTab.push({ id : id, name : name, zoomLevel : zoomLevel });
			});
			return result;
		},
		addTab: function(tabName, id, zoomLevel) {
			var that = this;
			var tabs = that.getTabLiByIndex();
			var options = that.options;
			// 탭 갯수 제한
			var maximum = options.maximum;
			if (tabs.length >= maximum) return false;
			if (that.trigger('add')) return false;

			var type = options.type;
			var displayName = tabName;
			if (typeof displayName != "string") {
				if (type == MONITORING) displayName = tabName = window.I18N.prop("HMI_EMPTY_TAB");
				else if (type == CREATE) displayName = tabName = that.getNewFileName();
			// } else if(displayName.length > 8) {
			// 	displayName = that.getDisplayName(displayName);
			}
			id = typeof id != "undefined" ? id : that.getEmptyId();
			zoomLevel = zoomLevel || 100;

			var tabNameElement = "<span class='tab-name' title='" + tabName + "'>" + displayName + "</span>";
			var template = options.type === MONITORING ? monitoringTabContentTemplate : createTabContentTemplate;
			that.append({
				text : tabNameElement,
				encoded : false,
				content : template.html()
			});
			var scrollArea = $(that.scrollbar.scrollArea[0]);
			var lastIndex = that.contentElements.length - 1;
			var canvasInfo = {id: id, name: tabName, zoomLevel: zoomLevel};
			if (lastIndex == (maximum - 1)) that._tabAddButton.hide();
			var newTab = scrollArea.find('li').eq(lastIndex);
			var closeBtn = $('<i/>').addClass('ic').addClass('ic-close');
			closeBtn.on('click', that.removeTabEvt.bind(that));
			newTab.find('.k-link').append(closeBtn);

			that.activateTab(newTab);

			that.changeTabInfo(lastIndex, canvasInfo);
			that.trigger("added", canvasInfo);
			return true;
		},
		changeTabInfo: function(index, canvasInfo){
			this.changeTabId(index, canvasInfo.id);
			this.changeTabName(index, canvasInfo.name);
			this.changeTabZoomLevel(index, canvasInfo.zoomLevel);
		},
		changeTabName: function(index, tabName){
			var tab = this.getTabLiByIndex(index);
			var nameArea = tab.find('.tab-name');
			var displayName = this.getDisplayName(tabName);
			nameArea.attr('title', tabName);
			nameArea.html(displayName);
			tab.data('name', tabName);
			var element = this.element;
			if (element.data('kendoTooltip')) element.data('kendoTooltip').refresh();
		},
		changeTabId: function(index, id){
			var tab = this.getTabLiByIndex(index);
			tab.data('id', id);
		},
		changeTabZoomLevel: function(index, zoomLevel){
			var tab = this.getTabLiByIndex(index);
			tab.data('zoomLevel', zoomLevel);
		},
		getDisplayName: function(tabName){
			var displayName = tabName;
			if (typeof displayName == 'undefined') return displayName;
			// if(displayName.length > 8) {
			// 	displayName = displayName.substring(0, 8) + '...';
			// }
			return displayName;
		},
		// index가 없을 경우 전체 탭 반환
		getTabLiByIndex: function(index){
			var scrollArea = this.scrollbar.scrollArea[0];
			var tabs = $(scrollArea).find('li');
			var tab = typeof index == "number" ? tabs.eq(index) : tabs;
			return tab;
		},
		getTabLiById: function(id){
			var scrollArea = this.scrollbar.scrollArea[0];
			var tabs = $(scrollArea).find('li');
			var tab = null;
			tabs.each(function(index, item){
				if($(item).data('id') == id) tab = item;
			});
			return tab;
		},
		getNewFileName: function(){
			var tabs = this.getTabLiByIndex();
			var index = 0, newIndex = 0;
			var fileNamePrefix = window.I18N.prop('HMI_NEW_FILE') + ' ';
			var name;
			tabs.each(function(idx, tab){
				name = $(tab).data('name');
				if (typeof name == "string" && name.indexOf(fileNamePrefix) != -1) {
					index = name.split(fileNamePrefix)[1];
					index = Number(index);
					if (index > newIndex) {
						newIndex = index;
					}
				}
			});
			return fileNamePrefix + (newIndex + 1);
		},
		getEmptyId: function(){
			var tabs = this.getTabLiByIndex();
			var index = 0, newIndex = 0;
			var idPrefix = EMPTY_TAB_PREFIX;
			var id;
			tabs.each(function(idx, tab){
				id = $(tab).data('id');
				if (typeof id == "string" && id.indexOf(idPrefix) != -1) {
					index = id.split(idPrefix)[1];
					index = Number(index);
					if (index > newIndex) {
						newIndex = index;
					}
				}
			});
			return idPrefix + (newIndex + 1);
		},
		selectById: function(id){
			var that = this;
			var tabs = that.getTabLiByIndex();
			var selectIndex = -1;
			tabs.each(function(index, tab){
				if ($(tab).data('id') == id) selectIndex = index;
			});
			if (selectIndex != -1) that.select(selectIndex);
		},
		selectByIndex: function(index){
			var tab = this.getTabLiByIndex(index);
			if (tab) this.activateTab(tab);
		},
		length: function(){
			var tabs = this.getTabLiByIndex();
			return tabs.length;
		}
	});
	ui.plugin(HmiTabStrip);
})(jQuery);
