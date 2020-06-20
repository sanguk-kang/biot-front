/**
*
*   <ul>
*       <li>공용 Tab Component</li>
*       <li>Kendo UI의 Tab Strip Widget을 상속받아 추가 구현되었다.</li>
*       <li>각 단위기능에서 표시되는 Tab에 동일한 CSS를 적용하여 재사용 가능하게 한다.</li>
*   </ul>
*   @module app/widget/common-tab-strip
*   @requires lib/kendo.all
*
*/
(function(window, $){
	"use strict";

	var tabStripScrollbarTemplate = '<div class="common-tab-strip-scrollbar">' +
							'<span class="k-button common-tab-strip-scrollbar-btn left"><</span>' +
							'<span class="k-button common-tab-strip-scrollbar-btn right">></span>' +
						'</div>';
	var SCROLL_DEGREE = 100;
	var CLASS_TOP_TAB_MENU = 'top-tab-menu';
	var CLASS_TOP_TAB_MENU_WRAPPER = 'top-tab-menu-wrapper';
	var SCROLL_BTN_BOX_WIDTH = 50;

	var kendo = window.kendo, ui = kendo.ui, trim = $.trim, extend = $.extend, outerHeight = kendo._outerHeight, Widget = ui.Widget, excludedNodesRegExp = /^(a|div)$/i, NS = '.kendoTabStrip', IMG = 'img', SHOW = 'show', LINK = 'k-link', LAST = 'k-last', CLICK = 'click', EMPTY = ':empty', IMAGE = 'k-image', FIRST = 'k-first', ACTIVATE = 'activate', CONTENT = 'k-content', CONTENTURL = 'contentUrl', MOUSEENTER = 'mouseenter', MOUSELEAVE = 'mouseleave', DISABLEDSTATE = 'k-state-disabled', DEFAULTSTATE = 'k-state-default', ACTIVESTATE = 'k-state-active', HOVERSTATE = 'k-state-hover', TABONTOP = 'k-tab-on-top', NAVIGATABLEITEMS = '.k-item:not(.' + DISABLEDSTATE + ')', HOVERABLEITEMS = '.k-tabstrip-items > ' + NAVIGATABLEITEMS + ':not(.' + ACTIVESTATE + ')';
	function updateTabClasses(tabs) {
		tabs.children(IMG).addClass(IMAGE);
		tabs.children('a').addClass(LINK).children(IMG).addClass(IMAGE);
		tabs.filter(':not([disabled]):not([class*=k-state-disabled])').addClass(DEFAULTSTATE);
		tabs.filter('li[disabled]').addClass(DISABLEDSTATE).removeAttr('disabled');
		tabs.filter(':not([class*=k-state])').children('a').filter(':focus').parent().addClass(ACTIVESTATE + ' ' + TABONTOP);
		tabs.attr('role', 'tab');
		tabs.filter('.' + ACTIVESTATE).attr('aria-selected', true);
		tabs.each(function () {
			var item = $(this);
			if (!item.children('.' + LINK).length) {
				item.contents().filter(function () {
					return !this.nodeName.match(excludedNodesRegExp) && !(this.nodeType == 3 && !trim(this.nodeValue));
				}).wrapAll('<span UNSELECTABLE=\'on\' class=\'' + LINK + '\'/>');
			}
		});
	}
	function updateFirstLast(tabGroup) {
		var tabs = tabGroup.children('.k-item');
		tabs.filter('.k-first:not(:first-child)').removeClass(FIRST);
		tabs.filter('.k-last:not(:last-child)').removeClass(LAST);
		tabs.filter(':first-child').addClass(FIRST);
		tabs.filter(':last-child').addClass(LAST);
	}

	var TabStrip = kendo.ui.TabStrip;
	var widget = TabStrip.extend({
		//디폴트 옵션
		options: {
			name : "CommonTabStrip",
			animation : false,
			isTopMenu: true,
			useScrollButton: true,
			isPreventKeyDown: true
		},
		init: function (element, options) {
			var that = this, value;
			var self = this;
			$(self.element).addClass("common-tab-strip");

			Widget.fn.init.call(that, element, options);
			var activeTabs = self.element.find(".k-state-active");
			if(activeTabs.length > 1){
				activeTabs.removeClass("k-state-active");
				activeTabs.eq(0).addClass("k-state-active");
			}
			that._animations(that.options);
			options = that.options;
			that._contentUrls = options.contentUrls || [];
			that._wrapper();
			that._isRtl = kendo.support.isRtl(that.wrapper);
			that._tabindex();
			that._updateClasses();
			that._dataSource();
			if (options.dataSource) {
				that.dataSource.fetch();
			}
			that._tabPosition();
			that._scrollable();
			if (that._contentUrls.length) {
				that.wrapper.find('.k-tabstrip-items > .k-item').each(function (index, item) {
					var url = that._contentUrls[index];
					if (typeof url === 'string') {
						$(item).find('>.' + LINK).data(CONTENTURL, url);
					}
				});
			} else {
				that._contentUrls.length = that.tabGroup.find('li.k-item').length;
			}
			that.wrapper.on(MOUSEENTER + NS + ' ' + MOUSELEAVE + NS, HOVERABLEITEMS, that._toggleHover).on('focus' + NS, $.proxy(that._active, that)).on('blur' + NS, function () {
				that._current(null);
			});
			that._keyDownProxy = $.proxy(that._keydown, that);
			if (options.navigatable) {
				that.wrapper.on('keydown' + NS, that._keyDownProxy);
			}
			if (that.options.value) {
				value = that.options.value;
			}
			that.wrapper.children('.k-tabstrip-items').on(CLICK + NS, '.k-state-disabled .k-link', false).on(CLICK + NS, ' > ' + NAVIGATABLEITEMS, function (e) {
				var wr = that.wrapper[0];
				if (wr !== document.activeElement) {
					var msie = kendo.support.browser.msie;
					if (msie) {
						try {
							wr.setActive();
						} catch (j) {
							wr.focus();
						}
					} else {
						wr.focus();
					}
				}
				if (that._click($(e.currentTarget))) {
					e.preventDefault();
				}
			});
			var selectedItems = that.tabGroup.children('li.' + ACTIVESTATE), content = that.contentHolder(selectedItems.index());
			if (selectedItems[0] && content.length > 0 && content[0].childNodes.length === 0) {
				that.activateTab(selectedItems.eq(0));
			}
			that.element.attr('role', 'tablist');
			if (that.element[0].id) {
				that._ariaId = that.element[0].id + '_ts_active';
			}
			that.value(value);
			kendo.notify(that);

			$(that.element).closest(".k-tabstrip-wrapper").addClass("common-tab-strip-wrapper");

			if(that.options.isTopMenu){
				that.scrollbar = {};
				that._initScrollbar();
				if(!that.element.is(':visible')){
					that.scrollWrap.hide();
				}
			}
		},
		_keydown: function (e) {
			if (!this.options.isPreventKeyDown) TabStrip.fn._keydown.call(this, e);
		},
		activateTab: function (item) {
			if (this.tabGroup.children('[data-animating]').length) {
				return;
			}
			item = this.tabGroup.find(item);
			var that = this, animationSettings = that.options.animation, animation = animationSettings.open, close = extend({}, animationSettings.close), hasCloseAnimation = close && 'effects' in close, neighbours = item.parent().children(), oldTab = neighbours.filter('.' + ACTIVESTATE), itemIndex = neighbours.index(item);
			close = extend(hasCloseAnimation ? close : extend({ reverse: true }, animation), { hide: true });
			if (kendo.size(animation.effects)) {
				oldTab.kendoRemoveClass(ACTIVESTATE, { duration: close.duration });
				item.kendoRemoveClass(HOVERSTATE, { duration: close.duration });
			} else {
				oldTab.removeClass(ACTIVESTATE);
				item.removeClass(HOVERSTATE);
			}
			var contentAnimators = that.contentAnimators;
			if (that.inRequest) {
				that.xhr.abort();
				that.inRequest = false;
			}
			if (contentAnimators.length === 0) {
				that.tabGroup.find('.' + TABONTOP).removeClass(TABONTOP);
				item.addClass(TABONTOP).css('z-index');
				item.addClass(ACTIVESTATE);
				that._current(item);
				that.trigger('change');
				if (that._scrollableModeActive) {
					that._scrollTabsToItem(item);
				}
				return false;
			}
			var visibleContents = contentAnimators.filter('.' + ACTIVESTATE), contentHolder = that.contentHolder(itemIndex), contentElement = contentHolder.closest('.k-content');
			that.tabsHeight = outerHeight(that.tabGroup) + parseInt(that.wrapper.css('border-top-width'), 10) + parseInt(that.wrapper.css('border-bottom-width'), 10);
			that._sizeScrollWrap(visibleContents);
			if (contentHolder.length === 0) {
				visibleContents.removeClass(ACTIVESTATE).attr('aria-hidden', true).kendoStop(true, true).kendoAnimate(close);
				return false;
			}
			item.attr('data-animating', true);
			var isAjaxContent = (item.children('.' + LINK).data(CONTENTURL) || that._contentUrls[itemIndex] || false) && contentHolder.is(EMPTY), showContentElement = function () {
					that.tabGroup.find('.' + TABONTOP).removeClass(TABONTOP);
					item.addClass(TABONTOP).css('z-index');
					if (kendo.size(animation.effects)) {
						oldTab.kendoAddClass(DEFAULTSTATE, { duration: animation.duration });
						item.kendoAddClass(ACTIVESTATE, { duration: animation.duration });
					} else {
						oldTab.addClass(DEFAULTSTATE);
						item.addClass(ACTIVESTATE);
					}
					oldTab.removeAttr('aria-selected');
					item.attr('aria-selected', true);
					that._current(item);
					that._sizeScrollWrap(contentElement);
					contentElement.addClass(ACTIVESTATE).removeAttr('aria-hidden').kendoStop(true, true).attr('aria-expanded', true).kendoAnimate(extend({
						init: function () {
							that.trigger(SHOW, {
								item: item[0],
								contentElement: contentHolder[0]
							});
							kendo.resize(contentHolder);
						}
					}, animation, {
						complete: function () {
							item.removeAttr('data-animating');
							that.trigger(ACTIVATE, {
								item: item[0],
								contentElement: contentHolder[0]
							});
							kendo.resize(contentHolder);
							that.scrollWrap.css('height', '').css('height');
						}
					}));
				}, showContent = function () {
					if (!isAjaxContent) {
						showContentElement();
						that.trigger('change');
					} else {
						item.removeAttr('data-animating');
						that.ajaxRequest(item, contentHolder, function () {
							item.attr('data-animating', true);
							showContentElement();
							that.trigger('change');
						});
					}
					if (that._scrollableModeActive) {
						that._scrollTabsToItem(item);
					}
				};
			visibleContents.removeClass(ACTIVESTATE);
			visibleContents.attr('aria-hidden', true);
			visibleContents.attr('aria-expanded', false);
			if (visibleContents.length) {
				visibleContents.kendoStop(true, true).kendoAnimate(extend({ complete: showContent }, close));
			} else {
				showContent();
			}
			return true;
		},
		contentElement: function (itemIndex) {
			if (isNaN(itemIndex - 0)) {
				return void 0;
			}
			var contentElements = this.contentElements && this.contentElements[0] && !kendo.kineticScrollNeeded ? this.contentElements : this.contentAnimators;
			var tabGroups = this.tabGroup.children();
			var id = $(tabGroups[itemIndex]).attr('aria-controls');
			var key = $(tabGroups[itemIndex]).data("key");

			if (contentElements) {
				var elem;
				var i, len;
				if(key){
					for (i = 0, len = contentElements.length; i < len; i++) {
						elem = contentElements.eq(i);
						if(elem.data("for") == key){
							return contentElements[i];
						}
					}
				}
				for (i = 0, len = contentElements.length; i < len; i++) {
					elem = contentElements.eq(i);
					if (elem.closest('.k-content')[0].id == id) {
						return contentElements[i];
					}
				}
			}
			return void 0;
		},
		_updateClasses: function () {
			var that = this, tabs, activeItem, activeTab;
			that.wrapper.addClass('k-widget k-header k-tabstrip');
			that.tabGroup = that.wrapper.children('ul').addClass('k-tabstrip-items k-reset');
			if (!that.tabGroup[0]) {
				that.tabGroup = $('<ul class=\'k-tabstrip-items k-reset\'/>').appendTo(that.wrapper);
			}
			tabs = that.tabGroup.find('li').addClass('k-item');
			if (tabs.length) {
				activeItem = tabs.filter('.' + ACTIVESTATE).index();
				activeTab = activeItem >= 0 ? activeItem : void 0;
				that.tabGroup.contents().filter(function () {
					return this.nodeType == 3 && !trim(this.nodeValue);
				}).remove();
			}
			if (activeItem >= 0) {
				tabs.eq(activeItem).addClass(TABONTOP);
			}
			that.contentElements = that.wrapper.children('div');
			that.contentElements.addClass(CONTENT);

			var tab = tabs.eq(activeTab);
			var tabKey = tab.data("key");
			var hasKeyTab = false;
			if(tabKey){
				that.contentElements.each(function(){
					var self = $(this);
					if(self.data("for") == tabKey){
						self.addClass(ACTIVESTATE).css({ display: 'block' });
						hasKeyTab = true;
						return false;
					}
				});
			}

			if(!hasKeyTab){
				that.contentElements.eq(activeTab).addClass(ACTIVESTATE).css({ display: 'block' });
			}

			if (tabs.length) {
				updateTabClasses(tabs);
				updateFirstLast(that.tabGroup);
				that._updateContentElements(true);
			}
		},
		_initScrollbar: function(){
			console.info('::INIT_SCROLLBAR');
			var that = this,
				body = $('body'),
				gnb = $('#main-header').find('.main-top-nav'),
				tabWrapper = that.scrollWrap,
				tabGroup = that.tabGroup,
				liItems = tabGroup.find('li'),
				mainSidebarBtn = $('#main-sidebar-menu').find('.btn-util'),
				scrollBtnBox = $(tabStripScrollbarTemplate),
				leftBtn = null, rightBtn = null, scrollFlag;

			var setScrollbarBtnPosition = that._setScrollbarBtnPosition.bind(that),
				setScrollbarState = that._setStateScrollbar.bind(that),
				setMinWidth = that._setMinWidth.bind(that),
				setEnableScrollbarBtn = that._changeEnableScrollbarBtn.bind(that),
				setScrollbarAreaWidth = that._setScrollbarAreaWidth.bind(that),
				setMainHeaderMinWidthWithoutScroll = that._setMainHeaderMinWidthWithoutScroll.bind(that);
				// test = that._test.bind(that);

			if (!that.options.useScrollButton) {
				tabGroup.closest('.common-tab-strip-wrapper').addClass('no-scroll-btn');
			}

			if(that.element.find('.common-tab-scroll-wrapper').length > 0){
				return;
			}

			tabGroup.addClass(CLASS_TOP_TAB_MENU);
			tabGroup.closest('.common-tab-strip-wrapper').addClass(CLASS_TOP_TAB_MENU_WRAPPER);
			tabGroup.wrap('<span class="common-tab-scroll-wrapper"></span>');
			that.wrapper.find('.common-tab-scroll-wrapper').show();
			that.scrollbar.scrollArea = that.element.find('.common-tab-scroll-wrapper');
			that.scrollbar.gnb = gnb;
			that.hasScrollBtn = false;

			if(liItems.length > 1){
				that.hasScrollBtn = true;
			}
			scrollFlag = that.hasScrollBtn;
			if(scrollFlag){
				that.hasScrollBtn = true;

				if (that.options.useScrollButton) {
					body.append(scrollBtnBox);
				}
				leftBtn = scrollBtnBox.find('.common-tab-strip-scrollbar-btn.left').kendoButton().data('kendoButton');
				rightBtn = scrollBtnBox.find('.common-tab-strip-scrollbar-btn.right').kendoButton().data('kendoButton');

				that.scrollbar.scrollBtnBox = scrollBtnBox;
				that.scrollbar.leftBtn = leftBtn;
				that.scrollbar.rightBtn = rightBtn;
				that.scrollbar.isShow = false;
				that.scrollbar.firstItem = that.scrollbar.scrollArea.find('li.k-item').eq(0);

				setScrollbarBtnPosition();
				setScrollbarState();
				setEnableScrollbarBtn();
				that._setMinWidth();

				$(window).resize(function(){
					if(tabWrapper.css('display') != 'none'){
						console.info('::RESIZE_SCROLL');
						setScrollbarState();
						setEnableScrollbarBtn();
						setScrollbarBtnPosition();
					}
				});

				mainSidebarBtn.on('click', '.btn', function(){
					if(tabWrapper.css('display') != 'none'){
						setScrollbarState();
						setMinWidth();
						setScrollbarAreaWidth();
						setScrollbarBtnPosition();
						setEnableScrollbarBtn();
					}
				});

				that._attachEventOnScrollBtn();
			} else {
				if(that.element.css('display') != 'none'){
					setMainHeaderMinWidthWithoutScroll();
				}
				mainSidebarBtn.on('click', '.btn', function(){
					setMainHeaderMinWidthWithoutScroll();
				});
			}
		},
		_setMainHeaderMinWidthWithoutScroll: function(){
			if(this.hasScrollBtn){
				return;
			}
			var that = this,
				tabGroup = that.tabGroup,
				liItems = tabGroup.find('li'),
				gnb = that.scrollbar.gnb,
				mainHeaderMinWidth = tabGroup.offset().left + tabGroup.width() + gnb.outerWidth(),
				scrollAreaMinWidth = liItems.eq(0).width();
			if(that.scrollWrap.css('display') !== 'none'){
				$('#main-header').css('min-width', mainHeaderMinWidth);
				that.scrollbar.scrollArea.css('min-width', scrollAreaMinWidth);
			}
		},
		_setScrollbarAreaWidth: function(){
			var scrollArea = this.scrollbar.scrollArea,
				scrollAreaPosX = scrollArea.offset().left,
				scrollBtnBoxPosX = this.scrollbar.scrollBtnBox.offset().left;
			scrollArea.css('width', scrollBtnBoxPosX - scrollAreaPosX);
			scrollArea.css('width', '');
		},
		_setMinWidth: function(){
			if(!this.hasScrollBtn){
				return;
			}
			var liItemWidth = this.scrollbar.firstItem.width(),
				mainSidebarWidth = $('#main-sidebar').width(),
				gnbWidth = 240,
				scrollBtnWidth = this.scrollbar.scrollBtnBox.width();
			$('#main-header').css('min-width', liItemWidth + mainSidebarWidth + gnbWidth + scrollBtnWidth);
			this.scrollbar.scrollArea.css('min-width', liItemWidth);
		},
		_getScrollbarPosition: function(){
			// var area = this.scrollbar.scrollArea;
			// var posX = area.offset().left,
			// 	posY = area.offset().top,
			// 	w = area.width();
			var gnb = this.scrollbar.gnb;
			var posX = gnb.offset().left,
				posY = gnb.offset().top;
			var result = {
				posX: posX - SCROLL_BTN_BOX_WIDTH,
				posY: posY
			};
			return result;
		},
		_setScrollbarBtnPosition: function(){
			var that = this;
			var pos = that._getScrollbarPosition();
			that.scrollbar.scrollBtnBox.css({
				top: pos.posY,
				left: pos.posX
			});
		},
		_attachEventOnScrollBtn: function(){
			var that = this;
			var scrollBtnBox = that.scrollbar.scrollBtnBox;
			var ulTab = that.tabGroup;
			var changeEnableScrollbarBtn = that._changeEnableScrollbarBtn.bind(this);
			// var val = 0;
			scrollBtnBox.on('click', '.common-tab-strip-scrollbar-btn', function(){
				var target = $(this);
				var val = Number(ulTab.css('left').replace('px', ''));

				if(target.hasClass('k-state-disabled')){
					return;
				}

				if(target.hasClass('left')){
					val += SCROLL_DEGREE;
				}else{
					val -= SCROLL_DEGREE;
				}
				ulTab.animate({
					left: '' + val
				}, 80, function(){
					changeEnableScrollbarBtn();
				});
			});
		},
		_setStateScrollbar: function(){
			var area = this.scrollbar.scrollArea,
				ulTab = this.tabGroup,
				scrollBtnBox = this.scrollbar.scrollBtnBox,
				t = area.width(),
				// c = ulTab.offset().left + ulTab.width();
				c = ulTab.width();

			if(t <= c){
				this.scrollbar.isShow = true;
				scrollBtnBox.show();
			}else{
				this.scrollbar.isShow = false;
				ulTab.css('left', 0);
				scrollBtnBox.hide();
			}
		},
		_changeEnableScrollbarBtn: function(){
			var that = this,
				ulTab = that.tabGroup,
				scrollbar = that.scrollbar,
				scrollBtnBox = scrollbar.scrollBtnBox,
				leftBtn = scrollbar.leftBtn,
				rightBtn = scrollbar.rightBtn,
				leftPos = Number(ulTab.css('left').replace('px', '')),
				rightPos = ulTab.width() + ulTab.offset().left,
				scrollbarLeft = scrollBtnBox.offset().left;

			leftBtn.enable(true);
			rightBtn.enable(true);

			if(leftPos >= 0){
				leftBtn.enable(false);
			}
			if(rightPos <= scrollbarLeft){
				rightBtn.enable(false);
			}
		},
		show: function(){
			this.scrollWrap.show();
			this.element.css('display', 'block');
			this._setMainHeaderMinWidthWithoutScroll();
			this._setMinWidth();
		},
		hide: function(){
			this.scrollWrap.hide();
			this.element.css('display', 'none');
		},
		disableTab : function(index, isDisabled){
			var that = this;
			var tabs = that.tabGroup.children();
			var targetTab = tabs.eq(index);
			if(targetTab.length < 1) return;
			var tabLength = tabs.length;
			var curTab = that.tabGroup.find(".k-state-active");
			var curTabIndex = curTab.index();
			if(isDisabled){
				if(curTabIndex == index){
					//마지막 탭이 활성화 된 상태에서 비활성화 될 경우 맨 처음부터 탐색
					if(curTabIndex == tabLength - 1){
						that._activateTabAfterDisable(tabs, 0);
					}if(!that._activateTabAfterDisable(tabs, curTabIndex + 1)){ //마지막 탭이 아닐 경우 그 다음부터 탐색
						//그 다음 탭이 모두 비활성화 일 경우 맨 처음부터 탐색
						that._activateTabAfterDisable(tabs, 0);
					}
				}
				that.disable(targetTab);
			}else{
				that.enable(targetTab);
			}
		},
		activateTabFromIndex : function(index){
			var that = this;
			var tabs = that.tabGroup.children();
			var targetTab = tabs.eq(index);
			if(targetTab.length < 1) return;
			that.activateTab(targetTab);
		},
		getActivatedTabIndex : function(){
			var that = this;
			var tabGroup = that.tabGroup;
			var activeTab = tabGroup.find(".k-state-active");
			if(activeTab.length > 0){
				return activeTab.index();
			}
			return -1;
		},
		_activateTabAfterDisable : function(tabs, activateTabIndex){
			var that = this, tabLength = tabs.length, tabElem;
			var hasActivateTab = false;
			for( var i = activateTabIndex; i < tabLength; i++){
				tabElem = $(tabs[i]);
				if(!tabElem.hasClass("k-state-disabled")){
					that.activateTab(tabElem);
					hasActivateTab = true;
					break;
				}
			}
			return hasActivateTab;
		},
		destroy : function(){
			//부모 함수 호출
			TabStrip.fn.destroy.call(this);
		}
	});

	//jQuery를 통해 요소에서 호출할 수 있도록 플러그인 등록
	kendo.ui.plugin(widget);

})(window, jQuery);
