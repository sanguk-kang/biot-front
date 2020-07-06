/**
*
*   <ul>
*       <li>기기 선택 시, Selection 동작을 제어하는 Selectable Widget의 확장 구현</li>
*   </ul>
*   @module app/widget/common-device-panel
*   @requires lib/kendo.all
*
*/
(function(window, $){
	"use strict";

	/*Custom Selectable*/
	var kendo = window.kendo,
		SELECTED = 'k-state-selected', ACTIVE = 'k-state-selecting', SELECTABLE = 'k-selectable', CHANGE = 'change';
	var INPUTSELECTOR = 'input,a,textarea,.k-multiselect-wrap,select,button,.k-button>span,.k-button>img,span.k-icon.k-i-arrow-60-down,span.k-icon.k-i-arrow-60-up,.ic.ic-info,.k-checkbox-label,.k-checkbox,.k-radio,.k-radio-label', ARIASELECTED = 'aria-selected',
		msie = kendo.support.browser.msie;

	var SelectableWidget = kendo.ui.Selectable;

	var Selectable = SelectableWidget.extend({
		options : {
			name : "Selectable",
			hasDoubleClickEvt : false
		},
		init: function (element, options) {
			SelectableWidget.fn.init.call(this, element, options);
			this.userEvents.unbind('start');
			this.userEvents.unbind('move');
			this.userEvents.unbind('end');

			this._pressedShiftKey = false;
			this._pressedCtrlKey = false;
		},
		/**
		*   <ul>
		*   <li>싱글, 멀티 셀렉션 시의 동작 시, 호출되는 Callback 함수</li>
		*   </ul>
		*   @function _tap
		*	@param {Event} e - 이벤트 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*   @alias module:kendo.all/ui/Selectable
		*
		*/
		_tap: function (e) {
			var that = this;
			if(that.options.hasDoubleClickEvt){
				if(typeof that._clicked === "undefined") that._clicked = 0;
				that._clicked++;
				if(that._clicked == 1){
					that._dblclickTimer = setTimeout(function(){
						that._clicked = 0;
						that._isDblClick = false;
						that._tapAction(e);
					}, 200);
				}else {
					clearTimeout(that._dblclickTimer);
					that._isDblClick = true;
					that._tapAction(e);
					that._clicked = 0;
					that._isDblClick = false;
				}
			}else{
				that._tapAction(e);
			}
		},
		_tapAction : function(e){
			var target = $(e.target), that = this, multiple = that.options.multiple, shiftKey = multiple && e.event.shiftKey, selected, whichCode = e.event.which, buttonCode = e.event.button;
			var isOnlySelection = that.options.isOnlySelection;
			var useSingleSelection = that.options.useSingleSelection;

			this._pressedShiftKey = shiftKey;
			this._pressedCtrlKey = multiple && e.event.ctrlKey;

			if (window.navigator.appVersion.indexOf('Mac') > -1) {
				this._pressedCtrlKey = multiple && e.event.metaKey;
			}

			if (!that._isElement(target.closest('.' + SELECTABLE)) || whichCode && whichCode == 3 || buttonCode && buttonCode == 2) {
				return;
			}
			if (!this._allowSelection(e.event.target)) {
				return;
			}
			selected = target.hasClass(SELECTED);
			//선택만 가능한 옵션이 true일 경우 이미 선택된 아이템에 대해서 선택 해제는 이루어지지 않는다.
			if(selected && isOnlySelection){
				return;
			}
			if (!multiple) {
				that.clear();
			}

			// 싱글 셀렉션 상태에서 shift 또는 ctrl 키를 누른 상태이면 clear 하지 않는다.
			if (useSingleSelection && !(shiftKey || this._pressedCtrlKey)) {
				that.clear();
			}

			target = target.add(that.relatedTarget(target));
			if (shiftKey) {
				that.selectRange(that._firstSelectee(), target);
			} else {
				if (selected) {
					that._unselect(target);
					that._notify(CHANGE);
				} else {
					that.value(target);
				}
				that._lastActive = that._downTarget = target;
			}
		},
		/**
		*   <ul>
		*   <li>Shift키를 눌러 멀티 셀렉션 시도이 UI 선택 상태를 변경한다.</li>
		*   </ul>
		*   @function selectRange
		*	@param {HTMLElement} start - 선택 시작 엘리먼트.
		* 	@param {jQueryObject} end - 선택 끝 제이쿼리 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-device-panel
		*/
		selectRange: function (start, end) {
			var that = this, idx, tmp, items;
			var options = that.options;
			var element = that.element, gridElem = element.closest(".k-grid"), grid, treeList;
			if(options.hasSelectedModel && !options.enableShiftSelection){
				treeList = gridElem.data("kendoTreeList");
				//Tree List는 Shift Key로 Range를 선택하는 것을 지원하지 않는다.
				if(treeList) return;
			}
			that.clear();
			var startIndex, endIndex;
			var viewId, startId, endId;

			if (that.element.length > 1) {
				items = that.options.continuousItems();
			}
			if (!items || !items.length) {
				items = that.element.find(that.options.filter);
			}

			if(options.hasSelectedModel){
				treeList = gridElem.data("kendoTreeList");
				grid = gridElem.data("kendoGrid");
				grid = grid || treeList;
				var ds = grid.dataSource;
				var startUid = $(start).attr("data-uid");
				var endUid = $(end).attr("data-uid");

				var startItem = ds.getByUid(startUid);
				var endItem = ds.getByUid(endUid);
				if(!startItem){
					startId = $(start).attr("data-id");
					startItem = ds.get(startId);
				}

				if(!endItem){
					endId = $(end).attr("data-id");
					endItem = ds.get(endId);
				}

				var data = ds.data();
				var query = new kendo.data.Query(data);
				var filter = ds.filter();
				var sort = ds.sort();

				if(filter){
					query = query.filter(filter);
				}

				if(sort){
					query = query.sort(sort);
				}

				var viewData = query.toArray();
				var i, max = viewData.length;
				var findStartItem = false;

				startId = startItem.id || startItem.uid;
				endId = endItem.id || endItem.uid;

				for( i = 0; i < max; i++ ){
					viewId = viewData[i].id || viewData[i].uid;
					if(viewId == startId){
						startIndex = i;
					}
					if(viewId == endId){
						endIndex = i;
					}
					/*if(startIndex !== undefined && endIndex !== undefined){
						break;
					}*/
					//Shift로 선택 시, 기존 선택 상태를 모두 해제한다.
					viewData[i].selected = false;
				}

				//반대 순서로 셀렉션 하는 경우
				if(startIndex > endIndex){
					tmp = startId;
					startId = endId;
					endId = tmp;

					tmp = startIndex;
					startIndex = endIndex;
					endIndex = tmp;
				}

				var j, size = items.length;
				var itemElem, itemId;
				for( i = 0; i < max; i++ ){
					viewId = viewData[i].id || viewData[i].uid;

					if(!findStartItem && viewId == startId){
						findStartItem = true;
					}
					if(findStartItem){
						viewData[i].selected = true;
						for(j = 0; j < size; j++ ){
							itemElem = $(items[j]);
							itemId = itemElem.attr("data-id") || itemElem.attr("data-uid");
							if(viewId == itemId){
								that._selectElement(itemElem);
								break;
							}
						}
					}
					if(viewId == endId){
						break;
					}
				}
				that._notify(CHANGE);
				return;
			}

			start = $.inArray($(start)[0], items);
			end = $.inArray($(end)[0], items);
			if (start > end) {
				tmp = start;
				start = end;
				end = tmp;
			}

			if (!that.options.useAllItems) {
				end += that.element.length - 1;
			}

			for (idx = start; idx <= end; idx++) {
				that._selectElement(items[idx]);
			}
			that._notify(CHANGE);
		},
		_selectElement: function (element, preventNotify) {
			var toSelect = $(element), isPrevented = !preventNotify && this._notify('select', { element: element });
			toSelect.removeClass(ACTIVE);
			if (!isPrevented) {
				toSelect.addClass(SELECTED);
				if (this.options.aria) {
					toSelect.attr(ARIASELECTED, true);
				}
			}
		},
		_allowSelection: function (target) {
			if ($(target).is(INPUTSELECTOR)) {
				this.userEvents.cancel();
				this._downTarget = null;
				return false;
			}
			return true;
		},
		_unselect: function (element) {
			element.removeClass(SELECTED);
			if (this.options.aria) {
				element.attr(ARIASELECTED, false);
			}
			return element;
		},
		_select: function (e) {
			if (this._allowSelection(e.event.target)) {
				if (!msie || msie && !$(kendo._activeElement()).is(INPUTSELECTOR)) {
					e.preventDefault();
				}
			}
		}
	});

	Selectable.parseOptions = function (selectable) {
		var asLowerString = typeof selectable === 'string' && selectable.toLowerCase();
		return {
			multiple: asLowerString && asLowerString.indexOf('multiple') > -1,
			cell: asLowerString && asLowerString.indexOf('cell') > -1
		};
	};

	kendo.ui.plugin(Selectable);

})(window, jQuery);
//For Debug
//# sourceURL=widget/common-selectable.js