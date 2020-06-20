(function(window, $){
	"use strict";

	var VISIBLE = ':visible', ARIA_EXPANDED = 'aria-expanded', ARIA_HIDDEN = 'aria-hidden', ACTIVECLASS = 'k-state-active',
		ACTIVATE = 'activate', ITEM = '.k-item', extend = $.extend;
	var kendo = window.kendo;
	var Util = window.Util;
	var PanelBar = kendo.ui.PanelBar;
	var widget = PanelBar.extend({
		//디폴트 옵션
		options: {
			name : "HmiPalette",
			expandMode : "single",
			findCanvasWrapper : null,
			tooltip : true,
			template : function(data){
				var item = data.item;
				if(item.hasChildren) return item.text;
				return "<div class='hmi-palette-item' data-value='" + item.value + "' title='" + item.text + "'>" +
					"<span class='hmi-palette-image' style='background-image:url(" + Util.addBuildDateQuery(item.imageUrl) + ");'></span>" +
					"<span class='hmi-palette-text'>" + item.text + "</span></div>";
			},
			dataImageUrlField: 'addBuildDateQueryUrl',
			addBuildDateQueryUrl: null
		},
		events : [
			"drop",
			"dragstart",
			"drag",
			"dragend",
			"dblclick",
			"click"
		],
		init: function (element, options) {
			$(element).addClass("hmi-palette-widget");
			PanelBar.fn.init.call(this, element, options);
			this._attachEvent();
		},
		_attachEvent : function(){
			var that = this;
			that.bind("select", that._selectEvt.bind(that));
			that.bind("activate", that._activateEvt.bind(that));
			that.bind("expand", that._expandEvt.bind(that));
			that.bind("collapse", that._collapseEvt.bind(that));
			that.bind("complete", that._animationCompleteEvt.bind(that));
			that.bind("dataBound", that._dataBoundEvt.bind(that));
			that.element.on("dblclick", ".k-group .k-item", that._doubleClickEvt.bind(that));
			that.element.on("click", ".k-group .k-item", that._clickEvt.bind(that));
		},
		_clickEvt : function(e){
			var ds = this.dataSource;
			var target = $(e.target).closest(".k-item");
			var uid = target.data("uid");
			var item = ds.getByUid(uid);
			e.item = item;
			this.trigger("click", e);
		},
		_doubleClickEvt : function(e){
			var ds = this.dataSource;
			var target = $(e.target).closest(".k-item");
			var uid = target.data("uid");
			var item = ds.getByUid(uid);
			e.item = item;
			this.trigger("dblclick", e);
		},
		_dataBoundEvt : function(e){
			//if(this.options.tooltip) this._tooltip();
			this._draggable();
			var canvasWrapper = this._findCurrentCanvasWrapper();
			this._droppable(canvasWrapper);
			var activatedItem = this.element.find("> .k-item.k-state-active");
			//DataSource fetch 될 경우 aria-expanded 속성이 초기화되어 세로 사이즈 적용되지 않는 이슈.
			//펼쳐져있는 메뉴에 대해 다시 aria-expanded=true 속성 적용하여 CSS 적용되도록 함.
			if(activatedItem.length && activatedItem.attr("aria-expanded") == "false"){
				activatedItem.attr("aria-expanded", true);
				this._activateEvt();
			}
		},
		_findCurrentCanvasWrapper : function(e){
			var that = this, options = that.options;
			var findCanvas = options.findCanvasWrapper;
			if(findCanvas && $.isFunction(findCanvas)){
				return findCanvas.call(that, that.element);
			}
			var panelWrapper = that.element.closest(".hmi-create-panel-wrapper");
			var createTabWrapper = panelWrapper.siblings(".k-tabstrip-wrapper");
			var activeTabContent = createTabWrapper.find(".k-content.k-state-active[role='tabpanel']");
			var canvasWrapper = activeTabContent.find(".hmi-create-content-graphic-view-canvas");
			return canvasWrapper;
		},
		updateDroppableCanvas : function(){
			this._draggable();
			var canvasWrapper = this._findCurrentCanvasWrapper();
			this._droppable(canvasWrapper);
		},
		_selectEvt : function(e){
			var that = this, li = $(e.item);
			if (li.is(".k-state-active")) {
				window.setTimeout(function(){that.collapse(e.item);}, 1);
			}
		},
		_activateEvt : function(){
			var that = this;
			var item = that.element.find("> li.k-state-active");
			if(item.length < 1) return;
			var itemHeight = item.height();
			var itemHeader = item.find(".k-link.k-header");
			var itemHeaderHeight = itemHeader.outerHeight();
			var groupHeight = itemHeight - itemHeaderHeight;
			var itemGroupUl = item.find(".k-group");
			itemGroupUl.height(groupHeight);
			itemGroupUl.css("overflow-y", "auto");
			var tooltip = that.element.data("kendoTooltip");
			if(tooltip) tooltip.hide();
		},
		_expandEvt : function(e){
			var that = this;
			that._expanded = true;
		},
		_collapseEvt : function(){
			var that = this;
			that._expanded = false;
			var tooltip = that.element.data("kendoTooltip");
			if(tooltip) tooltip.hide();
		},
		_animationCompleteEvt : function(){
			var that = this;
			var tooltip = that.element.data("kendoTooltip");
			if(!that._expanded && tooltip){
				tooltip.hide();
				//Hide 되지 않는 경우가 있음
				setTimeout(function(){
					tooltip.hide();
					//$(".hmi-palette-tooltip").hide();
				}, 10);
			}
		},
		/*_toggleGroup: function (element, visibility) {
			var that = this, animationSettings = that.options.animation, animation = animationSettings.expand, collapse = extend({}, animationSettings.collapse), hasCollapseAnimation = collapse && 'effects' in collapse;
			if (element.is(VISIBLE) != visibility) {
				that._animating = false;
				return;
			}
			element.parent().attr(ARIA_EXPANDED, !visibility).attr(ARIA_HIDDEN, visibility).toggleClass(ACTIVECLASS, !visibility).find('> .k-link > .k-panelbar-collapse, .k-panelbar-expand').toggleClass('k-i-arrow-n', !visibility).toggleClass('k-panelbar-collapse', !visibility).toggleClass('k-i-arrow-s', visibility).toggleClass('k-panelbar-expand', visibility);
			if (visibility) {
				animation = extend(hasCollapseAnimation ? collapse : extend({ reverse: true }, animation), { hide: true });
				animation.complete = function () {
					that._animationCallback();
				};
			} else {
				animation = extend({
					complete: function (elem) {
						that._triggerEvent(ACTIVATE, elem.closest(ITEM));
						that._animationCallback();
						that._completeEvt();
					}
				}, animation);
			}
			element.kendoStop(true, true).kendoAnimate(animation);
		},*/
		_tooltip : function(){
			var that = this, element = that.element;
			if(!element.data("kendoTooltip")){
				element.kendoTooltip({
					filter : ".k-group > li.k-item",
					wrapperCssClass : "hmi-palette-tooltip",
					content : function(e){
						var target = e.target;
						return target.find(".hmi-palette-item").attr("title");
					},
					position : "left"
				}).data("kendoToolTip");
			}
		},
		_draggable : function(){
			var that = this;
			that.element.find(".k-group .k-item").each(function(){
				var el = $(this);
				var uid = el.data("uid");
				var data = that.dataSource.getByUid(uid);
				if(data && !data.clickable) that._initDraggable(this);
			});
		},
		_droppable : function(element){
			var that = this;
			if(!that._bindedDropEvt) that._bindedDropEvt = that._dropEvt.bind(that);
			if(element.data("uiDroppable")){
				element.off("drop", that._bindedDropEvt);
				element.on("drop", that._bindedDropEvt);
				return;
			}
			element.droppable({
				accept : ".k-item"
			});
			element.on("drop", that._bindedDropEvt);
		},
		_dropEvt : function(e, ui){
			var that = this;
			e.ui = ui;
			var helper = ui.helper;
			var ds = that.dataSource;
			var uid = helper.data("uid");
			var item = ds.getByUid(uid);
			if(item){
				e.item = item;
				that.trigger("drop", e);
			}
		},
		_initDraggable : function(element){
			var that = this;
			var itemElement = $(element);
			if(itemElement.data("uiDraggable")) return;
			itemElement.draggable({
				appendTo : "body",
				//containment : "#hmi-create-tab",
				//stack : "body",
				//containment : "#main-contents",
				//containment : "#main",//위치 안맞는 현상 있음
				revert : function(isDropped){
					var draggableElem = $(this);
					if(draggableElem.hasClass("is-revert")){
						draggableElem.removeClass("is-revert");
						return true;
					}
					return !isDropped;
				},
				revertDuration : 200,
				helper : "clone",
				zIndex : 100,
				cursor : "move",
				start : function(e, dragui){
					var helper = dragui.helper;
					helper.addClass("hmi-palette-item-draggable");
					var body = $("body");
					that._helper = helper;
					this._bodyHeight = body.outerHeight();
					this._bodyWidth = body.outerWidth();
					this._helperHeight = helper.outerHeight();
					this._helperWidth = helper.outerWidth();
					//this._helperWidth = helper.outerWidth() - 10;
				},
				drag : function(e, dragui){
					var offset = dragui.offset;
					var bottom = offset.top + this._helperHeight;
					var right = offset.left + this._helperWidth;
					if(bottom > this._bodyHeight) return false;
					if(right > this._bodyWidth) return false;
				},
				stop : function(e){
					that._helper = null;
				}
			});
		}
	});
	kendo.ui.plugin(widget);

})(window, jQuery);
//# sourceURL=hmi/widget/hmi-palette.js
