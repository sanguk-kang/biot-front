/**
*
*   <ul>
*       <li>공용 Grid UI Component</li>
*       <li>Kendo UI의 Grid Widget을 상속받아 추가 구현되었다.</li>
*       <li>체크 박스 이벤트에 대한 추가 확장 구현</li>
*       <li>선택 시, 셀렉션 동작에 대한 추가 확장 구현</li>
*       <li>Virtualization(Virtual Scroll) 동작에 대한 추가 확장 구현</li>
*   </ul>
*   @module app/widget/common-grid
*   @requires lib/kendo.all
*
*/

(function(window, $){
	var kendo = window.kendo, ui = kendo.ui, tbodySupportsInnerHtml = kendo.support.tbodyInnerHtml, Widget = ui.Widget, outerHeight = kendo._outerHeight, keys = kendo.keys, isPlainObject = $.isPlainObject, extend = $.extend, grep = $.grep, isArray = $.isArray, inArray = $.inArray, proxy = $.proxy, math = Math, SELECTION_CELL_SELECTOR = 'tbody>tr:not(.k-grouping-row):not(.k-detail-row):not(.k-group-footer) > td:not(.k-group-cell):not(.k-hierarchy-cell)', NS = '.kendoGrid', CHANGE = 'change', DATABOUND = 'dataBound', SELECTED = 'k-state-selected',   FUNCTION = 'function', STRING = 'string', formatRegExp = /(\}|\#)/gi, templateHashRegExp = /#/gi, isRtl = false, browser = kendo.support.browser, isIE7 = browser.msie && browser.version == 7;
	var Grid = ui.Grid, SCROLL_FACTOR = 2;

	function convertToObject(array) {
		var result = {}, item, idx, length;
		for (idx = 0, length = array.length; idx < length; idx++) {
			item = array[idx];
			result[item.value] = item.text;
		}
		return result;
	}
	function formatGroupValue(value, format, columnValues, encoded) {
		var isForeignKey = columnValues && columnValues.length && isPlainObject(columnValues[0]) && 'value' in columnValues[0], groupValue = isForeignKey ? convertToObject(columnValues)[value] : value;
		groupValue = (groupValue !== null && typeof groupValue !== "undefined") ? groupValue : '';
		/*eslint no-nested-ternary: "error"*/
		// return format ? kendo.format(format, groupValue) : encoded === false ? groupValue : kendo.htmlEncode(groupValue);
		if(format) {
			return kendo.format(format, groupValue);
		} else if(encoded === false) {
			return groupValue;
		}
		return kendo.htmlEncode(groupValue);
	}
	function leafColumns(columns) {
		var result = [];
		for (var idx = 0; idx < columns.length; idx++) {
			if (!columns[idx].columns) {
				result.push(columns[idx]);
				continue;
			}
			result = result.concat(leafColumns(columns[idx].columns));
		}
		return result;
	}

	function groupRowBuilder(colspan, level, text, field, value) {
		return '<tr role="row" class="k-grouping-row" data-field="' + field + '" data-value="' + value + '" data-level="' + level + '">' + groupCells(level) + '<td colspan="' + colspan + '" aria-expanded="true">' + '<p class="k-reset">' + '<a class="k-icon k-i-collapse" href="#" tabindex="-1"></a></p>' + '<div class="grid-group-row-wrapper">' + text + '</div>' + '</td></tr>';
	}
	function groupRowLockedContentBuilder(colspan) {
		return '<tr role="row" class="k-grouping-row">' + '<td colspan="' + colspan + '" aria-expanded="true">' + '<p class="k-reset">&nbsp;</p></td></tr>';
	}

	function groupCells(count) {
		return new Array(count + 1).join('<td class="k-group-cell">&nbsp;</td>');
	}
	function stringifyAttributes(attributes) {
		var attr, result = ' ';
		if (attributes) {
			if (typeof attributes === STRING) {
				return attributes;
			}
			for (attr in attributes) {
				result += attr + '="' + attributes[attr] + '"';
			}
		}
		return result;
	}

	function visibleColumns(columns) {
		return grep(columns, function (column) {
			var result = !column.hidden;
			if (result && column.columns) {
				result = visibleColumns(column.columns).length > 0;
			}
			return result;
		});
	}

	function isVisible(column) {
		return visibleColumns([column]).length > 0;
	}

	function visibleLockedColumns(columns) {
		return grep(columns, function (column) {
			return column.locked && isVisible(column);
		});
	}
	function visibleLeafColumns(columns) {
		var result = [];
		for (var idx = 0; idx < columns.length; idx++) {
			if (columns[idx].hidden) {
				continue;
			}
			if (columns[idx].columns) {
				result = result.concat(visibleLeafColumns(columns[idx].columns));
			} else {
				result.push(columns[idx]);
			}
		}
		return result;
	}

	function appendContent(tbody, table, html, empty) {
		var placeholder, tmp = tbody;
		if (empty) {
			tbody.empty();
		}
		if (tbodySupportsInnerHtml) {
			tbody[0].innerHTML = html;
		} else {
			placeholder = document.createElement('div');
			placeholder.innerHTML = '<table><tbody>' + html + '</tbody></table>';
			tbody = placeholder.firstChild.firstChild;
			table[0].replaceChild(tbody, tmp[0]);
			tbody = $(tbody);
		}
		return tbody;
	}


	function dropdownListTemplate(options, value, width, height, top, left, wrapperTop){
		var listHeight;
		if(height){
			listHeight = (height - 2);
		}else{
			height = 202;
			listHeight = 200;
		}

		var dropDownListClass = "";
		if(typeof options.dropDownListCss !== "undefined" && options.dropDownListCss !== null) dropDownListClass = options.dropDownListCss;

		var margin = 10;
		var isReverse = false;
		isReverse = $(window).height() < (top + height) ? true : false;
		if(isReverse){
			top = wrapperTop - height - margin;
			margin = "";
		}else{
			margin = "margin-top : " + margin + "px;";
		}

		var html = '<div class="k-animation-container ' + dropDownListClass + '" style="width: ' + width + 'px; height: ' + height + 'px; box-sizing: content-box; overflow: hidden; position: absolute; top: ' + top + 'px; z-index: 10002; left: ' + left + 'px; ' + margin + '"><div class="k-list-container k-popup k-group k-reset" data-role="popup" style="position: absolute;font-size: 16px;font-family: SamsungOneUI, sans-serif;font-stretch: normal;font-style: normal;font-weight: 600;line-height: normal;width: ' + width + 'px;min-width: ' + width + 'px;height: ' + height + 'px;display: block;">' +
		'<div class="k-list-scroller" unselectable="on" style="height:' + listHeight + 'px;"><ul unselectable="on" class="k-list k-reset" tabindex="-1" aria-hidden="true" aria-live="off" data-role="staticlist" role="listbox">';

		var ds = options.dataSource;
		if(ds instanceof kendo.data.DataSource){
			ds = ds.data();
		}

		var textField = options.dataTextField;
		var valueField = options.dataValueField;
		var val, text, item, i, max = ds.length;

		var listHtml = "";
		var li, attr;
		var wrapper = $("<ul/>");
		for( i = 0; i < max; i++ ){
			li = $("<li/>").addClass("k-item");

			item = ds[i];
			if(valueField){
				val = item[valueField];
			}
			if(textField){
				text = item[textField];
			}

			attr = {
				"tabindex" : "-1",
				"role" : "option",
				"unselectable" : "on",
				"aria-selected" : false,
				"data-value" : val
			};

			if(val == value){
				attr["aria-selected"] = true;
				li.addClass("k-state-selected k-state-focused");
			}

			li.attr(attr);
			li.text(text);
			wrapper.append(li);
		}

		var noData = max == 0 ? "" : "display:none;";

		var I18N = window.I18N;
		listHtml += (wrapper.html() + '</ul></div><div class="k-nodata" style="' + noData + '"><div>' + I18N.prop("COMMON_NO_CONTENT_LIST") + '</div></div></div></div>');
		return html + listHtml;
	}

	//var VirtualScrollable = ui.VirtualScrollable;
	var VirtualScrollable = Widget.extend({
		init: function (element, options) {
			var that = this;
			Widget.fn.init.call(that, element, options);
			that._refreshHandler = proxy(that.refresh, that);
			that.setDataSource(options.dataSource);
			that.wrap();
		},
		setDataSource: function (dataSource) {
			var that = this;
			if (that.dataSource) {
				that.dataSource.unbind(CHANGE, that._refreshHandler);
			}
			that.dataSource = dataSource;
			that.dataSource.bind(CHANGE, that._refreshHandler);
		},
		options: {
			name: 'VirtualScrollable',
			itemHeight: $.noop,
			prefetch: true,
			cardNum : null
		},
		destroy: function () {
			var that = this;
			Widget.fn.destroy.call(that);
			that.dataSource.unbind(CHANGE, that._refreshHandler);
			that.wrapper.add(that.verticalScrollbar).off(NS);
			if (that.drag) {
				that.drag.destroy();
				that.drag = null;
			}
			that.wrapper = that.element = that.verticalScrollbar = null;
			that._refreshHandler = null;
		},
		wrap: function () {
			var that = this, scrollbar = kendo.support.scrollbar() + 1, element = that.element, wrapper;
			element.css({
				width: 'auto',
				overflow: 'hidden'
			}).css(isRtl ? 'padding-left' : 'padding-right', scrollbar);
			that.content = element.children().first();
			wrapper = that.wrapper = that.content.wrap('<div class="k-virtual-scrollable-wrap"/>').parent().bind('DOMMouseScroll' + NS + ' mousewheel' + NS, proxy(that._wheelScroll, that));
			if (kendo.support.kineticScrollNeeded) {
				that.drag = new kendo.UserEvents(that.wrapper, {
					global: true,
					start: function (e) {
						e.sender.capture();
					},
					move: function (e) {
						that.verticalScrollbar.scrollTop(that.verticalScrollbar.scrollTop() - e.y.delta);
						wrapper.scrollLeft(wrapper.scrollLeft() - e.x.delta);
						e.preventDefault();
					}
				});
			}
			that.verticalScrollbar = $('<div class="k-scrollbar k-scrollbar-vertical" />').css({ width: scrollbar }).appendTo(element).bind('scroll' + NS, proxy(that._scroll, that));
		},
		_wheelScroll: function (e) {
			if (e.ctrlKey) {
				return;
			}
			var scrollbar = this.verticalScrollbar, scrollTop = scrollbar.scrollTop(), delta = kendo.wheelDeltaY(e);
			if (delta && !(delta > 0 && scrollTop === 0) && !(delta < 0 && scrollTop + scrollbar[0].clientHeight == scrollbar[0].scrollHeight)) {
				e.preventDefault();
				this.verticalScrollbar.scrollTop(scrollTop + -delta);
			}
		},
		_scroll: function (e) {
			var that = this, delayLoading = !that.options.prefetch, scrollTop = e.currentTarget.scrollTop, dataSource = that.dataSource, rowHeight = that.itemHeight, skip = dataSource.skip() || 0, start = that._rangeStart || skip, height = that.element.innerHeight(), isScrollingUp = !!(that._scrollbarTop && that._scrollbarTop > scrollTop), firstItemIndex = math.max(math.floor(scrollTop / rowHeight), 0), lastItemIndex = math.max(firstItemIndex + math.floor(height / rowHeight), 0);
			that._scrollTop = scrollTop - start * rowHeight;
			that._scrollbarTop = scrollTop;
			that._scrolling = delayLoading;
			if (!that._fetch(firstItemIndex, lastItemIndex, isScrollingUp)) {
				that.wrapper[0].scrollTop = that._scrollTop;
			}
			if (delayLoading) {
				if (that._scrollingTimeout) {
					clearTimeout(that._scrollingTimeout);
				}
				that._scrollingTimeout = setTimeout(function () {
					that._scrolling = false;
					that._page(that._rangeStart, that.dataSource.take());
				}, 100);
			}
		},
		itemIndex: function (rowIndex) {
			var rangeStart = this._rangeStart || this.dataSource.skip() || 0;
			return rangeStart + rowIndex;
		},
		position: function (index) {
			var rangeStart = this._rangeStart || this.dataSource.skip() || 0;
			var pageSize = this.dataSource.pageSize();
			var result;
			if (index > rangeStart) {
				result = index - rangeStart + 1;
			} else {
				result = rangeStart - index - 1;
			}
			return result > pageSize ? pageSize : result;
		},
		scrollIntoView: function (row) {
			var container = this.wrapper[0];
			var containerHeight = container.clientHeight;
			var containerScroll = this._scrollTop || container.scrollTop;
			var elementOffset = row[0].offsetTop;
			var elementHeight = row[0].offsetHeight;
			if (containerScroll > elementOffset) {
				this.verticalScrollbar[0].scrollTop -= containerHeight / 2;
			} else if (elementOffset + elementHeight >= containerScroll + containerHeight) {
				this.verticalScrollbar[0].scrollTop += containerHeight / 2;
			}
		},
		_fetch: function (firstItemIndex, lastItemIndex, scrollingUp) {
			var that = this, dataSource = that.dataSource, itemHeight = that.itemHeight, take = dataSource.take(), rangeStart = that._rangeStart || dataSource.skip() || 0, currentSkip = math.floor(firstItemIndex / take) * take, fetching = false, prefetchAt = 0.33;
			if (firstItemIndex < rangeStart) {
				fetching = true;
				rangeStart = math.max(0, lastItemIndex - take);
				that._scrollTop = (firstItemIndex - rangeStart) * itemHeight;
				that._page(rangeStart, take);
			} else if (lastItemIndex >= rangeStart + take && !scrollingUp) {
				fetching = true;
				rangeStart = firstItemIndex;
				that._scrollTop = itemHeight;
				that._page(rangeStart, take);
			} else if (!that._fetching && that.options.prefetch) {
				if (firstItemIndex < currentSkip + take - take * prefetchAt && firstItemIndex > take) {
					dataSource.prefetch(currentSkip - take, take, $.noop);
				}
				if (lastItemIndex > currentSkip + take * prefetchAt) {
					dataSource.prefetch(currentSkip + take, take, $.noop);
				}
			}
			return fetching;
		},
		fetching: function () {
			return this._fetching;
		},
		/**
		*   <ul>
		*   <li>Virtualization 아이템 개수가 다음페이지로 넘어갈 때 호출되는 함수 </li>
		*   </ul>
		*   @function _page
		*   @param {Number} skip - Display를 시작할 아이템 Index
		*   @param {Number} take - 시작 Index부터 표시할 마지막 아이템 Index
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		_page: function (skip, take) {
			var that = this, delayLoading = !that.options.prefetch, dataSource = that.dataSource;
			clearTimeout(that._timeout);
			that._fetching = true;
			that._rangeStart = skip;

			//Grid View 일 때는 카드 개수 만큼 표시해야하므로,
			//range를 수행할 skip 값을 카드 개수의 배수로 보정한다.
			var cardNum = that.options.cardNum;
			if(cardNum){
				var remain = skip % cardNum;
				if(remain > 0){
					skip = skip - remain + cardNum;
				}
			}
			//console.log("[page()] skip : "+skip);
			//console.log("[page()] take : "+take);

			if (dataSource.inRange(skip, take)) {
				dataSource.range(skip, take);
			} else {
				if (!delayLoading) {
					kendo.ui.progress(that.wrapper.parent(), true);
				}
				that._timeout = setTimeout(function () {
					if (!that._scrolling) {
						if (delayLoading) {
							kendo.ui.progress(that.wrapper.parent(), true);
						}
						dataSource.range(skip, take);
					}
				}, 100);
			}
		},
		/**
		*   <ul>
		*   <li>Virtual Scrollbar를 다시 그린다.</li>
		*   </ul>
		*   @function repaintScrollbar
		*   @returns {void}
		*   @alias module:app/widget/common-dialog
		*
		*/
		repaintScrollbar: function () {
			var that = this, html = '', maxHeight = 250000, dataSource = that.dataSource, scrollbar = !kendo.support.kineticScrollNeeded ? kendo.support.scrollbar() : 0, wrapperElement = that.wrapper[0], totalHeight, idx, itemHeight;
			itemHeight = that.itemHeight = that.options.itemHeight() || 0;
			var addScrollBarHeight = wrapperElement.scrollWidth > wrapperElement.offsetWidth ? scrollbar : 0;
			var totalSize = dataSource.total(), cardNum = that.options.cardNum;

			//console.log("[repaintScrollbar] totalSize : "+totalSize);
			//Grid View 일 경우, 카드 개수의 배수로 전체 높이 값을 재계산한다.
			if(cardNum){
				var remain = totalSize % cardNum;
				totalSize = totalSize - remain + cardNum;
			}
			//console.log("[repaintScrollbar] itemHeight : "+itemHeight);
			//console.log("[repaintScrollbar] totalSize : "+totalSize);

			totalHeight = totalSize * itemHeight + addScrollBarHeight;

			//console.log("[repaintScrollbar] totalHeight : "+totalHeight);
			//console.log("[repaintScrollbar] scrollBarHeight : "+addScrollBarHeight);

			for (idx = 0; idx < math.floor(totalHeight / maxHeight); idx++) {
				html += '<div style="width:1px;height:' + maxHeight + 'px"></div>';
			}
			if (totalHeight % maxHeight) {
				html += '<div style="width:1px;height:' + totalHeight % maxHeight + 'px"></div>';
			}
			that.verticalScrollbar.html(html);
			wrapperElement.scrollTop = that._scrollTop;
		},
		refresh: function () {
			var that = this, dataSource = that.dataSource, rangeStart = that._rangeStart;
			kendo.ui.progress(that.wrapper.parent(), false);
			clearTimeout(that._timeout);
			that.repaintScrollbar();
			if (that.drag) {
				that.drag.cancel();
			}
			if (rangeStart && !that._fetching) {
				that._rangeStart = dataSource.skip();
				if (dataSource.page() === 1) {
					that.verticalScrollbar[0].scrollTop = 0;
				}
			}
			that._fetching = false;
		}
	});

	kendo.ui.plugin(VirtualScrollable);

	var extendGrid = ui.Grid = Grid.extend({
		options : {
			hasSelectedModel : false,
			setSelectedAttribute : false,
			hasCheckedModel : false,
			useSingleSelection: false,
			setCheckedAttribute : false,
			hasRadioModel : false,
			checkedLimit : false,
			selectedLimit : false,
			cardTemplate : "",
			cardNum : 6,        //실내기 제외 기기 타입 기본 카드 행 별 개수
			cardHeight : 211,   //실내기 제외 기기 타입 기본 카드 높이 사이즈
			hasDoubleClickEvt : false,
			showGridHeader : true,
			events : [
				"checked",
				"checkedLimit"
			]
		},
		init: function (element, options, events) {
			var that = this;

			options = isArray(options) ? { dataSource: options } : options;

			if(options.sortable){
				if($.isPlainObject(options.sortable)){
					options.sortable.allowUnsort = false;
				}else{
					options.sortable = {
						allowUnsort : false
					};
				}
			}

			if(typeof options.noRecords === "undefined"){
				var I18N = window.I18N;
				options.noRecords = {
					template : "<div class='no-records-text'>" + I18N.prop("COMMON_NO_DATA_AVAILABLE_GRID") + "</div>"
				};
			}

			this._createCheckedColumn(options);

			Widget.fn.init.call(that, element, options);
			if (events) {
				that._events = events;
			}

			// multiple 셀렉션인 경우만, useSingleSelection 옵션 활성화 적용
			if (that.options.selectable !== 'multiple row') {
				that.options.useSingleSelection = false;
			}

			isRtl = kendo.support.isRtl(element);
			that._element();
			that._aria();
			if(options.cardTemplate){
				that.options.columns = [{field : "card"}];
				this.element.addClass("card-grid");
			}
			that._columns(that.options.columns);
			that._dataSource();
			that._tbody();
			that._pageable();
			that._thead();
			that._groupable();
			that._toolbar();
			that._setContentHeight();
			that._templates();
			that._navigatable();
			that._selectable();
			that._clipboard();
			that._details();
			that._editable();
			that._attachCustomCommandsEvent();
			that._minScreenSupport();
			if (that.options.autoBind) {
				that.dataSource.fetch();
			} else {
				that._group = that._groups() > 0;
				that._footer();
			}
			if (that.lockedContent) {
				that.wrapper.addClass('k-grid-lockedcolumns');
				that._resizeHandler = function () {
					that.resize();
				};
				$(window).on('resize' + NS, that._resizeHandler);
			}

			kendo.notify(that);

			that._createSelectedModel();
			that._createCheckedModel();

			if(options.cardTemplate || !that.options.showGridHeader){
				that.wrapper.find(".k-grid-header").hide();
			}

			if(options.scrollable && options.scrollable.virtual){
				if(!that.dataSource.options.serverPaging){
					that.element.find(".k-scrollbar.k-scrollbar-vertical").on("scroll", function(e){
						var self = $(this);
						if(self.scrollTop() + self.innerHeight() + SCROLL_FACTOR >= this.scrollHeight) {
							if(that.dataSource){
								that.dataSource.trigger("scrollend", {grid : that, scrollElem : self});
							}
						}
					});
					that.bind("dataBinding", function(){
						that._beforeScrollTop = that.virtualScrollable.verticalScrollbar.scrollTop();
						//console.log("databinding : "+that._beforeScrollTop)
					});
					that.bind("dataBound", function(){
						//console.log("databound : "+that._beforeScrollTop);
						if(typeof that._beforeScrollTop !== "undefined"){
							//setTimeout(function(){
							that.virtualScrollable.verticalScrollbar.scrollTop(that._beforeScrollTop);
							//},0);
						}
					});
				}
			}

			if(options.columnDropDownList){
				this._attachDropDownEvt();
			}
		},
		/**
		*   <ul>
		*   <li>List에 표시하는 DropDownList Template에 대한 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachDropDownEvt
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_attachDropDownEvt : function(){
			var self = this;
			self.element.on("click", ".common-grid-dropdown", function(){
				//console.log("click");

				var wrapper = $(this);
				if(wrapper.hasClass("k-state-borderdown")){
					//console.log("dropdownblur trigger");
					self.dropdownListUl.trigger("dropdownblur", { isFoce : true});
					//드롭다운리스트를 재 클릭 시, 리스트를 닫는 이벤트를 트리거한다.
					//이 때, flag를 저장한다. (dropdownblur 이벤트 트리거 후, 바로 click 이벤트가 동작하기 때문.)
					self._dropdownblur = true;
					return false;
				}

				var wrap = wrapper.find(".k-dropdown-wrap");
				if(wrap.hasClass("k-state-disabled") || self._dropdownblur){
					self._dropdownblur = false;
					return false;
				}
				wrapper.addClass("k-state-borderdown");
				wrap.addClass("k-state-borderdown k-state-focus k-state-active");
				var field = wrapper.data("field");
				var input = wrapper.find("input");
				var value = input.attr("data-value");
				var columns = self.columns;
				var column;
				var i, max = columns.length;
				for( i = 0; i < max; i++ ){
					if(columns[i].field == field){
						column = columns[i];
						break;
					}
				}
				if(column && column.dropDownOptions){
					var dropDownOptions = column.dropDownOptions;
					var width = wrapper.outerWidth();
					var height = wrapper.outerHeight();
					var offset = wrapper.offset();
					var top = height + offset.top;
					var left = offset.left;
					var listHtml = dropdownListTemplate(dropDownOptions, value, width, null, top, left, offset.top);
					//set width
					//set offset
					self.dropdownListContainer = $(listHtml).appendTo("body");
					//self.dropdownListContainer.find(".k-list-container").css({ "margin-top" : 10 });
					self.dropdownListUl = self.dropdownListContainer.find(".k-list-scroller > ul");
					self.dropdownListUl.focus();

					var _dropDownListBlurEvt = function(e, isForce){
						//console.log("blur");
						//console.log(e.target);
						//console.log(isForce);
						if(e.target){
							var target = $(e.target);

							//리스트 컨테이너 내부 클릭 시,
							if(self.dropdownListContainer.has(target).length > 0){
								//리스트 내부 클릭은 왼쪽 클릭에 대해서만 처리한다.
								if(typeof e.which !== "undefined" && e.which != 1) return false;

								//item 선택 시,
								if(target.hasClass("k-item")){
									var text = target.text();
									var dataValue = target.attr("data-value");

									//wrapper value, text 변경
									input.attr("data-value", dataValue);
									wrapper.find("span.k-input").text(text);

									//data 변경
									var tr = wrapper.closest("tr");
									var uid = tr.data("uid");
									var ds = self.dataSource;
									var item = ds.getByUid(uid);

									if(dropDownOptions.change){
										dropDownOptions.change({ item : item, value : dataValue, text : text });
									}
								}else if(!isForce){//item 선택이 아닐 경우 (e.g 스크롤 시)
									return false;
								}
							}else if(wrapper.has(target).length > 0){
							//드롭다운을 클릭했을 경우, return하고, click 이벤트를 통해 닫도록 한다.
								$(wrapper).trigger("click");
								return false;
							}
						}

						//원래 상태로 돌린다.
						wrapper.removeClass("k-state-borderdown");
						wrap.removeClass("k-state-borderdown k-state-focus k-state-active");

						$("body").off("mousedown", self._dropDownListBlurEvt);
						self.dropdownListUl.off("dropdownblur", self._dropDownListBlurEvt);
						self.dropdownListContainer.remove();
						self.dropdownListContainer = null;
						return false;
					};

					$("body").on("mousedown", _dropDownListBlurEvt);
					self.dropdownListUl.on("dropdownblur", _dropDownListBlurEvt);
				}
			});
		},
		filterForSearch : function(obj){
			var filter = obj;
			this.searchFilter = filter;
			/*var appliedFilter = this.dataSource.filter();
			if(appliedFilter){
				if(!filter.logic){
					filter = { logic : "and", filters : [filter]};
				}
				if($.isArray(appliedFilter)){
					filter = appliedFilter.push(filter);
				}else if($.isArray(appliedFilter.filters)){
					filter = [appliedFilter, filter];
				}
			}*/
			this.isSearching = true;
			this.dataSource.filter(filter);
			this.isSearching = false;
			this.searchFilter = null;
		},
		/**
		*   <ul>
		*   <li>Grid의 컨텐츠를 다시 그린다.</li>
		*   </ul>
		*   @function refresh
		*	@param {Event} e - 이벤트 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		refresh: function (e) {
			var that = this, data = that.dataSource.view(), navigatable = that.options.navigatable, currentIndex, current = $(that.current()), isCurrentInHeader = false, groups = (that.dataSource.group() || []).length, colspan = groups + visibleLeafColumns(visibleColumns(that.columns)).length;

			if(this.selectedIds){
				this.selectedIds.length = 0;
			}

			if (e && e.action === 'itemchange' && that.editable) {
				return;
			}
			if (e && e.action === 'remove' && that.editable && that.editable.options.model && inArray(that.editable.options.model, e.items) > -1) {
				that.editable.options.model.unbind(CHANGE, that._modelChangeHandler);
			}
			e = e || {};
			if (that.trigger('dataBinding', {
				action: e.action || 'rebind',
				index: e.index,
				items: e.items
			})) {
				return;
			}
			that._angularItems('cleanup');
			if (navigatable && (that._isActiveInTable() || that._editContainer && that._editContainer.data('kendoWindow'))) {
				isCurrentInHeader = current.is('th');
				currentIndex = Math.max(that.cellIndex(current), 0);
			}
			that._destroyEditable();
			that._progress(false);
			that._hideResizeHandle();
			that._data = [];
			if (!that.columns.length) {
				that._autoColumns(that._firstDataItem(data[0], groups));
				colspan = groups + that.columns.length;
			}
			that._group = groups > 0 || that._group;
			if (that._group) {
				that._templates();
				that._updateCols();
				that._updateLockedCols();
				that._updateHeader(groups);
				that._group = groups > 0;
			}
			that._renderContent(data, colspan, groups);
			that._renderLockedContent(data, colspan, groups);
			that._footer();
			that._renderNoRecordsContent();
			that._setContentHeight();
			that._setContentWidth(that.content && that.content.scrollLeft());
			if (that.lockedTable) {
				if (that.options.scrollable.virtual) {
					that.content.find('>.k-virtual-scrollable-wrap').trigger('scroll');
				} else if (that.touchScroller) {
					that.touchScroller.movable.trigger('change');
				} else {
					that.wrapper.one('scroll', function (evt) {
						evt.stopPropagation();
					});
					that.content.trigger('scroll');
				}
			}
			that._restoreCurrent(currentIndex, isCurrentInHeader);
			if (that.touchScroller) {
				that.touchScroller.contentResized();
			}
			if (that.selectable) {
				that.selectable.resetTouchEvents();
			}
			that._muteAngularRebind(function () {
				that._angularItems('compile');
			});
			that.trigger(DATABOUND);
		},
		/**
		*   <ul>
		*   <li>hasSelectedModel 옵션이 존재할 경우 현재 Data에 selected 어트리뷰트를 추가하여 Model에 선택 상태를 유지 가능하게한다.</li>
		*   </ul>
		*   @function _createSelectedModel
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_createSelectedModel : function(){
			var self = this, options = this.options;
			var hasSelectedModel = options.hasSelectedModel,
				setSelectedAttribute = options.setSelectedAttribute,
				ds = self.dataSource;

			if(!hasSelectedModel){
				return;
			}

			this.selectedIds = [];

			var data, datas = ds.data();
			var i, max;

			if(setSelectedAttribute){
				for(i = 0; i < max; i++ ){
					data = datas[i];
					data.selected = false;
				}
			}
		},
		/**
		*   <ul>
		*   <li>hasCheckedModel 옵션이 존재할 경우 체크 박스 컬럼을 생성한다.</li>
		*   </ul>
		*   @function _createSelectedModel
		*	@param {Object} options - 옵션 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_createCheckedColumn : function(options){
			if((options.hasCheckedModel || options.hasRadioModel) && options.columns){
				var i, max, columns = options.columns;
				var column, hasCheckedColumn = false;
				max = columns.length;
				for( i = 0; i < max; i++ ){
					column = columns[i];
					if(column.field == "checked"){
						hasCheckedColumn = true;
						break;
					}
				}

				if(hasCheckedColumn){
					column = this._setCheckedModelColumn(column, options);
				}else{
					column = this._setCheckedModelColumn({}, options);
					columns.unshift(column);
				}
			}
		},
		/**
		*   <ul>
		*   <li>hasCheckedModel 옵션이 존재할 경우 Data에 checked 어트리뷰트를 생성하여 Model에서 체크 상태를 유지하도록한다.</li>
		*   </ul>
		*   @function _createCheckedModel
		*	@param {HTMLElement} element - 엘리먼트.
		*	@param {Object} options - 옵션 객체.
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_createCheckedModel : function(element, options){
			var self = this;
			options = this.options;
			var hasCheckedModel = options.hasCheckedModel,
				hasRadioModel = options.hasRadioModel,
				setCheckedAttribute = options.setCheckedAttribute,
				ds = self.dataSource;

			if(!hasCheckedModel && !hasRadioModel){
				return;
			}

			this.checkedIds = [];

			var data, datas = ds.data();
			var i, max;

			if(setCheckedAttribute){
				for(i = 0; i < max; i++ ){
					data = datas[i];
					data.checked = false;
				}
			}

			if(!this.groupCheckBox){
				this.groupCheckBox = {};
			}

			this._attachCheckedModelEvt();
		},
		/**
		*   <ul>
		*   <li>hasCheckedModel 옵션이 존재할 경우 체크 박스 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachCheckedModelEvt
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_attachCheckedModelEvt : function(){
			var that = this;
			var elem = $(this.element);
			elem.off("click");
			elem.on("click", ".grid-checkbox-cell .k-checkbox", function(e){
				var self = $(this);
				var item = that._findItemFromCheckbox(self);
				var checked = self.prop("checked");
				var checkedLimit = that.options.checkedLimit;
				//최대 체크 가능한 값을 넘을 경우 체크되지 않도록한다.
				if(checkedLimit !== false && checkedLimit != 0 && checked){
					var checkedData = that.getCheckedData();
					if(checkedData.length >= checkedLimit){
						return false;
					}
				}

				item.checked = checked;
				//self.prop("checked", !checked);
				that.setGroupCheckbox();
				that.setHeaderCheckbox();

				that.trigger("checked", { isHeader : false, item : item, checkbox : self });
			});

			elem.on("click", ".grid-checkbox-cell .k-radio, .grid-checkbox-cell .k-radio-label", function(e){
				var self = $(this);
				var item = that._findItemFromCheckbox(self);
				var checked = self.prop("checked");
				item.checked = checked;
				that.setRadioBtn(item);
				that.trigger("checked", { isHeader : false, isRadio : true, item : item, checkbox : self });
			});

			elem.on("click", ".grid-checkbox-header .k-checkbox", function(e){
				var self = $(this);
				var checked = self.prop("checked");
				var checkedLimit = that.options.checkedLimit;
				//최대 체크 가능한 값을 넘을 경우 체크되지 않도록한다.
				if(checkedLimit !== false && checkedLimit != 0 && checked){
					var checkedData = that.getCheckedData();
					if(checkedData.length >= checkedLimit){
						return false;
					}
				}

				that.trigger("dataBinding");
				if(checked){
					that.checkAll(true);
				}else{
					that.uncheckAll();
				}
				that.trigger("checked", { isHeader : true, item : null, checkbox : self });
			});


			elem.on("click", ".grid-group-row .grid-group-row-checkbox", function(e){
				var self = $(this);
				var checked = self.prop("checked");
				var results;
				var checkedLimit = that.options.checkedLimit;
				//최대 체크 가능한 값을 넘을 경우 체크되지 않도록한다.
				if(checkedLimit !== false && checkedLimit != 0 && checked){
					var checkedData = that.getCheckedData();
					if(checkedData.length >= checkedLimit){
						return false;
					}
				}
				var field = self.data("field");
				var value = self.data("value");
				//var dv = ds.view();
				//var i, max = dv.length;
				that.trigger("dataBinding");
				if(checked){
					results = that.checkGroup(true, field, value, true);
				}else{
					results = that.checkGroup(true, field, value, false);
				}

				that.setHeaderCheckbox();
				var evt = { isGroupHeader : true, field : field, value : value, item : results, checkbox : self, checked : checked };
				that.trigger("dataBound", evt);
				that.trigger("checked", evt);
			});

			this.bind("dataBound", function(e){
				//console.time("[grid]set headercheckbox");
				this.setHeaderCheckbox();
				//console.timeEnd("[grid]set headercheckbox");
				//console.time("[grid]set groupcheckbox");
				this.setGroupCheckbox();
				//console.timeEnd("[grid]set groupcheckbox");
				//console.time("[grid]expandedGroupRow");
				this.syncExpandedGroupRow();
				//console.timeEnd("[grid]expandedGroupRow");
			});
		},
		syncExpandedGroupRow : function(){
			if(this.groupCollapse){
				var field, value, tr;
				var collapse = this.groupCollapse;
				for( field in collapse ){
					for( value in collapse[field] ){
						if(!collapse[field][value]){
							tr = this.element.find("tr[data-field='" + field + "'][data-value='" + value + "']");
							this.collapseGroup(tr);
						}
					}
				}
			}
		},
		setRadioBtn : function(item){
			var ds = this.dataSource;
			var data = ds.data();
			var i, tr, radio, max = data.length;
			for( i = 0; i < max; i++ ){
				if(data[i] !== item && data[i].checked){
					data[i].checked = false;
					tr = this.element.find("tbody tr[data-uid='" + data[i].uid + "']");
					radio = tr.find(".grid-checkbox-cell .k-radio");
					radio.prop("checked", false);
					break;
				}
			}
		},
		/**
		*   <ul>
		*   <li>hasCheckedModel 옵션이 존재하고 현재 DataSource에 Group이 적용되어 있을 경우 하위 Group의 체크 박스가 선택되어 있으면 상위 Group의 전체 체크 박스가 체크되도록 UI를 업데이트한다.</li>
		*   </ul>
		*   @function setGroupCheckbox
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		setGroupCheckbox : function(){
			var groups = this.dataSource.group();
			if(groups.length > 0){
				var dv = this.dataSource.view();
				this.setSubGroupCheckbox(dv);
			}
		},
		setSubGroupCheckbox : function(dataView){
			var dv = dataView;
			var i, max = dv.length;
			var isChecked, checkbox;
			for( i = 0; i < max; i++ ){
				if(dv[i].hasSubgroups && dv[i].items && dv[i].items.length > 0){
					this.setSubGroupCheckbox(dv[i].items);
				}
				isChecked = this.isCheckedAllGroup(dv[i].field, dv[i].value);
				checkbox = this.getGroupCheckbox(dv[i].field, dv[i].value);
				checkbox.prop("checked", isChecked);
			}
		},
		getGroupCheckbox : function(field, value){
			var checkbox = this.element.find(".grid-group-row .grid-group-row-checkbox[data-field='" + field + "'][data-value='" + value + "']");
			return checkbox;
		},
		/**
		*   <ul>
		*   <li>하위 Group이 전체 체크되어있는지 체크한다.</li>
		*   </ul>
		*   @function isCheckedAllGroup
		*   @param {String} field - 체크할 Group의 Field 이름
		*   @param {String|Number|Boolean} value - 체크할 Group의 Field가 가진 값
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		isCheckedAllGroup : function(field, value){
			if(!this.groupCheckBox[field]){
				this.groupCheckBox[field] = {};
			}

			var ds = this.dataSource;
			//뷰 기준으로 수정
			//var data = ds.data();
			var data = ds.flatView();
			var result = new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : field, operator : "eq", value : value}]
			}).toArray();

			var options = this.options;
			var maxLength, checkedLimit = options.checkedLimit;
			if(checkedLimit !== false && checkedLimit != 0){
				maxLength = checkedLimit;
			}

			var i, max = result.length;
			var cnt  = 0;
			var isCheckedAll = true;
			for(i = 0; i < max; i++){
				if(!maxLength && !result[i].checked){
					isCheckedAll = false;
					break;
				}else if(maxLength && result[i].checked){
					cnt++;
				}
			}


			if(maxLength){
				max = (maxLength >= result.length) ? result.length : maxLength;
				if(cnt < max) isCheckedAll = false;
			}

			this.groupCheckBox[field][value] = isCheckedAll;
			return isCheckedAll;
		},
		/**
		*   <ul>
		*   <li>Group 체크 박스를 체크한다.</li>
		*   </ul>
		*   @function checkGroup
		*   @param {Boolean} isView - 현재 보이는 View만 체크할지 여부
		*   @param {String} field - 체크할 Group의 Field 값
		*   @param {String|Number|Boolean} value - 체크할 Group의 Field가 가진 값
		*   @param {Boolean} isChecked - 체크 여부
		*   @param {Number} maxLength - 제한할 최대 체크 개수
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		checkGroup : function(isView, field, value, isChecked, maxLength){
			if(!this.groupCheckBox[field]){
				this.groupCheckBox[field] = {};
			}

			if(value === "undefined"){
				value = void 0;
			}

			this.groupCheckBox[field][value] = isChecked;

			var ds = this.dataSource;
			var data;
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);
					var group = ds.group();
					if(group) query = query.group(group);

					data = query.toArray();
					//console.log(data.length);
				}else{
					data = ds.flatView();
				}
			}else{
				data = ds.data();
			}
			var result = new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : field, operator : "eq", value : value}]
			}).toArray();

			var options = this.options;
			var checkedLimit = options.checkedLimit;
			if(checkedLimit !== false && checkedLimit != 0){
				maxLength = checkedLimit;
			}

			//maxLength = (maxLength >= result.length) ? result.length : maxLength;

			//이미 체크된 개수가 maxLength 보다 많거나 같은 경우 체크동작을 수행하지 않는다.

			var checkedData = [];
			if(maxLength && isChecked){
				checkedData = new kendo.data.Query(data).filter({
					logic : 'and',
					filters : [{ field : "checked", operator : "eq", value : isChecked}]
				}).toArray();

				if(maxLength <= checkedData.length){
					this.trigger("checkedLimit", { length : maxLength });
					return [];
				}
			}

			var i, max;
			if(maxLength && isChecked){
				//체크 Limit
				//기존 체크된 데이터도 개수를 포함하여 계산한다.
				maxLength -= checkedData.length;
				max = (maxLength >= result.length) ? result.length : maxLength;
				//max는 체크 가능한 개수다.
				var size = result.length;
				var cnt = 0;
				for(i = 0; i < size; i++){
					if(!result[i].checked){
						//체크되지 않은 항목들을 체크한다.
						result[i].checked = isChecked;
						cnt++;
					}
					if(cnt >= max){
						//가능한 개수가 되었을 경우 break
						break;
					}
				}
			}else{
				//Default 체크 박스 동작
				//Limit 시, 그룹 체크 해제는 Limit이 없으므로 Default 체크 박스 동작으로 수행
				max = result.length;
				for(i = 0; i < max; i++){
					result[i].checked = isChecked;
				}
			}


			ds.fetch();

			return new kendo.data.Query(result).filter({
				logic : 'and',
				filters : [{ field : "checked", operator : "eq", value : isChecked}]
			}).toArray();
		},
		/**
		*   <ul>
		*   <li>체크된 데이터를 가져온다.</li>
		*   </ul>
		*   @function getCheckedData
		*   @returns {Array} - 현재 체크된 데이터 리스트
		*   @alias module:app/widget/common-grid
		*
		*/
		getCheckedData : function(){
			var ds = this.dataSource;
			var data = ds.data();
			return new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : "checked", operator : "eq", value : true}]
			}).toArray();
		},
		/**
		*   <ul>
		*   <li>선택된 데이터를 가져온다.</li>
		*   </ul>
		*   @function getSelectedData
		*   @returns {Array} - 현재 선택된 데이터 리스트
		*   @alias module:app/widget/common-grid
		*
		*/
		getSelectedData : function(isView){
			var ds = this.dataSource;
			var data = isView ? ds.flatView() : ds.data();
			return new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : "selected", operator : "eq", value : true}]
			}).toArray();
		},
		/**
		*   <ul>
		*   <li>전체 체크 상태에 따라 전체 체크 박스를 체크 또는 체크해제한다.</li>
		*   </ul>
		*   @function setHeaderCheckbox
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		setHeaderCheckbox : function(){
			var allChecked = this.isAllChecked(true);
			var headerChkbox = this.element.find(".grid-checkbox-header .k-checkbox");
			if(allChecked){
				headerChkbox.prop("checked", true);
			}else{
				headerChkbox.prop("checked", false);
			}
		},
		/**
		*   <ul>
		*   <li>전체 체크 상태를 체크한다.</li>
		*   </ul>
		*   @function isAllChecked
		*   @param {Boolean} isView - 현재 뷰에 보이는 데이터만 체크하는지의 여부
		*   @returns {Boolean} - 전체 체크 여부
		*   @alias module:app/widget/common-grid
		*
		*/
		isAllChecked : function(isView){
			var ds = this.dataSource;
			var isAllChecked = true;
			var dv = ds.data();
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);
					var group = ds.group();
					if(group) query = query.group(group);

					dv = query.toArray();
					//console.log(dv.length);
				}else{
					dv = ds.flatView();
				}
			}
			var i, max = dv.length;
			if(max == 0){
				return false;
			}
			for( i = 0; i < max; i++ ){
				if(!dv[i].checked){
					isAllChecked = false;
					break;
				}
			}
			return isAllChecked;
		},
		/**
		*   <ul>
		*   <li>체크박스를 전체 체크 한다.</li>
		*   </ul>
		*   @function checkAll
		*   @param {Boolean} isView - 현재 뷰에 보이는 데이터만 체크하는지의 여부
		*   @param {Number} maxLength - 체크할 최대 개수
		*   @returns {Boolean} - 전체 체크 여부
		*   @alias module:app/widget/common-grid
		*
		*/
		checkAll : function(isView, maxLength){
			var ds = this.dataSource;
			//var dv = ds.flatView();
			var dv = ds.data();
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);
					var group = ds.group();
					if(group) query = query.group(group);

					dv = query.toArray();
					//console.log(dv.length);
				}else{
					dv = ds.flatView();
				}
			}
			var options = this.options;
			var checkedLimit = options.checkedLimit;
			if(checkedLimit !== false && checkedLimit != 0){
				maxLength = checkedLimit;
			}
			maxLength = (maxLength >= dv.length) ? dv.length : maxLength;
			var i, max = maxLength ? maxLength : dv.length;
			for( i = 0; i < max; i++ ){
				dv[i].checked = true;
			}
			ds.fetch();
		},
		/**
		*   <ul>
		*   <li>체크 박스를 전체 체크 해제 한다.</li>
		*   </ul>
		*   @function uncheckAll
		*   @param {Boolean} isView - 현재 뷰에 보이는 데이터만 체크 해제 하는지의 여부
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		uncheckAll : function(isView){
			var ds = this.dataSource;
			//var dv = ds.flatView();
			var dv = ds.data();
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);
					var group = ds.group();
					if(group) query = query.group(group);

					dv = query.toArray();
					//console.log(dv.length);
				}else{
					dv = ds.flatView();
				}
			}
			var i, max = dv.length;
			for( i = 0; i < max; i++ ){
				dv[i].checked = false;
			}
			ds.fetch();
		},
		checkById : function(id, checked){
			var that = this, ds = that.dataSource;
			var options = that.options;
			var checkedLimit = options.checkedLimit;
			//최대 체크 가능한 값을 넘을 경우 체크되지 않도록한다.
			if(checkedLimit !== false && checkedLimit != 0 && checked){
				var checkedData = that.getCheckedData();
				if(checkedData.length >= checkedLimit){
					return false;
				}
			}
			var data = ds.get(id);
			data.checked = checked;
			that.element.find("tr[data-id='" + id + "'] .grid-checkbox-cell .k-checkbox").prop("checked", checked);

			that.setGroupCheckbox();
			that.setHeaderCheckbox();
		},
		_findItemFromCheckbox : function(checkboxElem){
			var ds = this.dataSource;
			var tr = checkboxElem.closest("tr");
			var uid = tr.data("uid");
			var item = ds.getByUid(uid);
			if(!item){
				var id = checkboxElem.data("id");
				item = ds.get(id);
			}
			return item;
		},
		/**
		*   <ul>
		*   <li>hasCheckedModel 옵션이 켜져있을 경우 체크 박스 컬럼을 생성한다.</li>
		*   </ul>
		*   @function _setCheckedModelColumn
		*   @param {Object} column - 컬럼 정보 Object
		*   @param {Object} options - 옵선 졍보 Object
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_setCheckedModelColumn : function(column, options){
			if(!column){
				column = {};
			}

			if(!column.field){
				column.field = "checked";
			}

			if(!column.width){
				column.width = 37;
			}

			if(!column.attributes){
				column.attributes = {
					"class" : "grid-checkbox-cell"
				};
			}

			if(!column.template){
				if(options.hasCheckedModel){
					column.template = this._checkedModelTemplate;
				}else if(options.hasRadioModel){
					column.template = this._radioModelTemplate;
				}
			}

			if(!column.headerAttributes){
				column.headerAttributes = {
					"class" : "grid-checkbox-header"
				};
			}

			if(!column.headerTemplate){
				if(options.hasCheckedModel){
					column.headerTemplate = this._checkedModelHeaderTemplate;
				}else if(options.hasRadioModel){
					column.headerTemplate = "";
				}
			}

			if(typeof column.sortable === "undefined"){
				column.sortable = false;
			}

			if(typeof column.editable === "undefined"){
				column.editable = false;
			}

			return column;
		},
		/**
		*   <ul>
		*   <li>Default 라디오 버튼 템플릿 함수</li>
		*   </ul>
		*   @function _radioModelTemplate
		*   @param {Object} data - 템플릿으로 렌더링 될 Data
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_radioModelTemplate : function(data){
			var uid = data.uid;
			var checked = data.checked ? "checked" : "";
			return '<input type="radio" id="check_' + uid + '" class="k-radio" ' + checked + '>' + '<label for="check_' + uid + '" class="k-radio-label"></label>';
		},
		/**
		*   <ul>
		*   <li>Default 체크박스 템플릿 함수</li>
		*   </ul>
		*   @function _checkedModelTemplate
		*   @param {Object} data - 템플릿으로 렌더링 될 Data
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_checkedModelTemplate : function(data){
			var uid = data.uid;
			var checked = data.checked ? "checked" : "";
			return '<input type="checkbox" id="check_' + uid + '" class="k-checkbox" ' + checked + '>' + '<label for="check_' + uid + '" class="k-checkbox-label"></label>';
		},
		/**
		*   <ul>
		*   <li>Default 헤더 체크박스 템플릿 함수</li>
		*   </ul>
		*   @function _checkedModelTemplate
		*   @param {Object} data - 템플릿으로 렌더링 될 Data
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_checkedModelHeaderTemplate : function(){
			var uid = kendo.guid();
			return '<input type="checkbox" id="check_header_' + uid + '" class="k-checkbox">' + '<label for="check_header_' + uid + '" class="k-checkbox-label"></label>';
		},
		_checkedModelGroupTemplate : function(){

		},
		_renderContent: function (data, colspan, groups) {
			var that = this, idx, length, html = '', isLocked = (that.lockedContent !== null && typeof that.lockedContent !== "undefined"), templates = {
				rowTemplate: that.rowTemplate,
				altRowTemplate: that.altRowTemplate,
				groupFooterTemplate: that.groupFooterTemplate
			};
			colspan = isLocked ? colspan - visibleLeafColumns(visibleLockedColumns(that.columns)).length : colspan;
			if (groups > 0) {
				colspan = isLocked ? colspan - groups : colspan;
				if (that.detailTemplate) {
					colspan++;
				}
				if (that.groupFooterTemplate) {
					that._groupAggregatesDefaultObject = that.dataSource.aggregates();
				}
				for (idx = 0, length = data.length; idx < length; idx++) {
					html += that._groupRowHtml(data[idx], colspan, 0, isLocked ? groupRowLockedContentBuilder : groupRowBuilder, templates, isLocked);
				}
			} else {
				html += that._rowsHtml(data, templates);
			}
			that.tbody = appendContent(that.tbody, that.table, html, this.options.$angular);
		},
		/**
		*   <ul>
		*   <li>Row를 렌더링한다.</li>
		*   </ul>
		*   @function _rowsHtml
		*   @param {Object} data - Row로 렌더링 될 data
		*   @param {Object} templates - Template 정보가 담긴 객체
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_rowsHtml: function (data, templates) {
			var that = this, html = '', idx, rowTemplate = templates.rowTemplate, altRowTemplate = templates.altRowTemplate, length, cardTemplate = that.options.cardTemplate;

			if(that.isSearching){
				var filter = that.searchFilter;
				var filters;
				if($.isArray(filter)){
					filters = filter;
				}else if($.isArray(filter.filters)){
					filters = filter.filters;
				}
				var i, max;
				var field, value, keywords = {};

				max = filters.length;
				for( i = 0; i < max; i++ ){
					value = filters[i].value;
					if(value){
						field = filters[i].field;
						keywords[field] = value;
					}
				}

				var replacer = function(str){
					return '<span class=search-highlight>' + str + '</span>';
				};

				rowTemplate = function(rowTemplateData){
					//copy
					if(rowTemplateData instanceof kendo.data.ObservableObject){
						rowTemplateData = rowTemplateData.toJSON();
					}else{
						rowTemplateData = $.extend({}, rowTemplateData);
					}
					rowTemplateData = new kendo.data.ObservableObject(rowTemplateData);
					var key, originalVal, keyword, re;
					for( key in  keywords){
						originalVal = rowTemplateData.get(key);
						if(originalVal){
							keyword = keywords[key];
							//search value as case insensitive
							re = new RegExp(keyword, "gi");
							rowTemplateData[key] = originalVal.replace(re, replacer);
						}
					}

					var searchHtml = templates.rowTemplate(rowTemplateData);
					searchHtml = searchHtml.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

					return searchHtml;
				};

				altRowTemplate = function(altRowTemplateData){
					//copy
					if(altRowTemplateData instanceof kendo.data.ObservableObject){
						altRowTemplateData = altRowTemplateData.toJSON();
					}else{
						altRowTemplateData = $.extend({}, altRowTemplateData);
					}
					altRowTemplateData = new kendo.data.ObservableObject(altRowTemplateData);
					var key, originalVal, keyword, re;
					for( key in  keywords){
						originalVal = altRowTemplateData.get(key);
						if(originalVal){
							keyword = keywords[key];
							//search value as case insensitive
							re = new RegExp(keyword, "gi");
							altRowTemplateData[key] = originalVal.replace(re, replacer);
						}
					}

					var searchHtml = templates.altRowTemplate(altRowTemplateData);
					searchHtml = searchHtml.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

					return searchHtml;
				};
			}

			var hasSelectedModel = that.options.hasSelectedModel;
			var hasCheckedModel = that.options.hasCheckedModel;
			if(hasSelectedModel || hasCheckedModel){
				rowTemplate = function(rowTemplateData){
					var tmpl = templates.rowTemplate(rowTemplateData);
					if(typeof rowTemplateData.id !== "undefined"){
						tmpl = $(tmpl).attr("data-id", rowTemplateData.id);
						tmpl = tmpl[0].outerHTML;
					}
					return tmpl;
				};
				altRowTemplate = function(altRowTemplateData){
					var tmpl = templates.altRowTemplate(altRowTemplateData);
					if(typeof altRowTemplateData.id !== "undefined"){
						tmpl = $(tmpl).attr("data-id", altRowTemplateData.id);
						tmpl = tmpl[0].outerHTML;
					}
					return tmpl;
				};
			}

			if(cardTemplate){
				for(idx = 0, length = data.length; idx < length; idx++){
					html += cardTemplate(data[idx]);
					that._data.push(data[idx]);
				}
			}else{
				for (idx = 0, length = data.length; idx < length; idx++) {
					if (idx % 2) {
						html += altRowTemplate(data[idx]);
					} else {
						html += rowTemplate(data[idx]);
					}
					that._data.push(data[idx]);
				}
			}

			return html;
		},
		_tmpl: function (rowTemplate, columns, alt, skipGroupCells) {
			var that = this, settings = extend({}, kendo.Template, that.options.templateSettings), idx, length = columns.length, state = {
					storage: {},
					count: 0
				}, column, hasDetails = that._hasDetails(), className = [], groups = that._groups(), navigatable = that.options.navigatable;

			var hasSelectedModel = that.options.hasSelectedModel;

			if (!rowTemplate) {
				rowTemplate = '<tr';
				if (alt) {
					className.push('k-alt');
				}
				if (hasDetails) {
					className.push('k-master-row');
				}

				if(hasSelectedModel){
					className.push('#if(typeof selected !== "undefined" && selected == true){# k-state-selected #}#');
				}

				if (className.length) {
					rowTemplate += ' class="' + className.join(' ') + '"';
				}
				if (length) {
					rowTemplate += ' ' + kendo.attr('uid') + '="#=' + kendo.expr('uid', settings.paramName) + '#"';
				}
				rowTemplate += ' role=\'row\'>';

				if (groups > 0 && !skipGroupCells) {
					rowTemplate += groupCells(groups);
				}
				if (hasDetails) {
					rowTemplate += '<td class="k-hierarchy-cell"><a class="k-icon k-i-expand" href="\\#" tabindex="-1"></a></td>';
				}
				for (idx = 0; idx < length; idx++) {
					column = columns[idx];
					rowTemplate += '<td' + stringifyAttributes(column.attributes);
					if (navigatable) {
						rowTemplate += ' aria-describedby=\'' + column.headerAttributes.id + '\'';
					}
					rowTemplate += ' role=\'gridcell\'>';
					rowTemplate += that._cellTmpl(column, state);
					rowTemplate += '</td>';
				}
				rowTemplate += '</tr>';
			}
			rowTemplate = kendo.template(rowTemplate, settings);
			if (state.count > 0) {
				return proxy(rowTemplate, state.storage);
			}
			return rowTemplate;
		},
		_cellTmpl: function (column, state) {
			var that = this, settings = extend({}, kendo.Template, that.options.templateSettings), template = column.template, paramName = settings.paramName, field = column.field, html = '', idx, length, format = column.format, type = typeof template, columnValues = column.values;
			if (column.command) {
				if (isArray(column.command)) {
					for (idx = 0, length = column.command.length; idx < length; idx++) {
						if (column.command[idx].visible) {
							html += kendo.format('#= {0}(data)? \'{1}\':\'\' #', column.command[idx].visible, that._createButton(column.command[idx]).replace(templateHashRegExp, '\\#'));
						} else {
							html += that._createButton(column.command[idx]).replace(templateHashRegExp, '\\#');
						}
					}
					return html;
				}
				return that._createButton(column.command).replace(templateHashRegExp, '\\#');
			}
			if (type === FUNCTION) {
				state.storage['tmpl' + state.count] = template;
				html += '#=this.tmpl' + state.count + '(' + paramName + ')#';
				state.count++;
			} else if (type === STRING) {
				html += template;
			} else if (columnValues && columnValues.length && isPlainObject(columnValues[0]) && 'value' in columnValues[0] && field) {
				html += '#var v =' + kendo.stringify(convertToObject(columnValues)).replace(templateHashRegExp, '\\#') + '#';
				html += '#var f = v[';
				if (!settings.useWithBlock) {
					html += paramName + '.';
				}
				html += field + ']#';
				html += '${f != null ? f : \'\'}';
			} else {
				html += column.encoded ? '#:' : '#=';
				if (format) {
					html += 'kendo.format("' + format.replace(formatRegExp, '\\$1') + '",';
				}
				if (field) {
					field = kendo.expr(field, paramName);
					html += field + '==null?\'\':' + field;
				} else {
					html += '\'\'';
				}
				if (format) {
					html += ')';
				}
				html += '#';
			}
			return html;
		},
		_groupRowHtml: function (group, colspan, level, groupHeaderBuilder, templates, skipColspan) {
			var hasCheckedModel = this.options.hasCheckedModel;
			var that = this, html = '', idx, length, field = group.field, column = grep(leafColumns(that.columns), function (col) {
					return col.field == field;
				})[0] || {}, template = column.groupHeaderTemplate, text = (column.title || field) + ': ' + formatGroupValue(group.value, column.format, column.values, column.encoded), footerDefaults = that._groupAggregatesDefaultObject || {}, aggregates = extend({}, footerDefaults, group.aggregates), headerData = extend({}, {
					field: group.field,
					value: group.value,
					aggregates: aggregates
				}, group.aggregates[group.field]), groupFooterTemplate = templates.groupFooterTemplate, groupItems = group.items;
			if(!template && hasCheckedModel){
				template = function(data){
				   var dataField = data.field;
				   var value = data.value;
				   var txt = '<div class="grid-group-row"><input type="checkbox" id="check_' + dataField + '_' + value + '" data-field="' + dataField + '" data-value="' + value + '" class="k-checkbox grid-group-row-checkbox">' + '<label for="check_' + dataField + '_' + value + '" class="k-checkbox-label grid-group-row-checkbox-label"></label><span class="grid-group-row-text">' + value + '</span></div>';
				   return txt;
			   };
			}
			if (template) {
				text = typeof template === FUNCTION ? template(headerData) : kendo.template(template)(headerData);
			}
			html += groupHeaderBuilder(colspan, level, text, group.field, group.value);
			if (group.hasSubgroups) {
				for (idx = 0, length = groupItems.length; idx < length; idx++) {
					html += that._groupRowHtml(groupItems[idx], skipColspan ? colspan : colspan - 1, level + 1, groupHeaderBuilder, templates, skipColspan);
				}
			} else {
				html += that._rowsHtml(groupItems, templates);
			}
			if (groupFooterTemplate) {
				var footerData = {};
				for (var aggregate in aggregates) {
					footerData[aggregate] = extend({}, aggregates[aggregate], {
						group: {
							field: group.field,
							value: group.value
						}
					});
				}
				html += groupFooterTemplate(footerData);
			}
			return html;
		},
		/**
		*   <ul>
		*   <li>Select 선택 상태 처리를 위한 Selectable 인스턴스를 생성한다.</li>
		*   </ul>
		*   @function _selectable
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_selectable: function () {
			var that = this, multi, cell, notString = [], isLocked = that._isLocked(), selectable = that.options.selectable;
			if (selectable) {
				if (that.selectable) {
					that.selectable.destroy();
				}
				selectable = kendo.ui.Selectable.parseOptions(selectable);
				multi = selectable.multiple;
				cell = selectable.cell;
				if (that._hasDetails()) {
					notString[notString.length] = '.k-detail-row';
				}
				if (that.options.groupable || that._hasFooters()) {
					notString[notString.length] = '.k-grouping-row,.k-group-footer';
				}
				notString = notString.join(',');
				if (notString !== '') {
					notString = ':not(' + notString + ')';
				}
				var elements = that.table;
				if (isLocked) {
					elements = elements.add(that.lockedTable);
				}
				var filter = '>' + (cell ? SELECTION_CELL_SELECTOR : 'tbody>tr' + notString);
				if(that.options.cardTemplate){
					filter += ",.card-item,.engCardWrap";
				}

				that.selectable = new kendo.ui.Selectable(elements, {
					filter: filter,
					aria: true,
					multiple: multi,
					hasSelectedModel : that.options.hasSelectedModel,
					hasDoubleClickEvt : that.options.hasDoubleClickEvt,
					useSingleSelection: that.options.useSingleSelection,
					change: function (e) {
						var arg = {};
						if(that.options.hasSelectedModel){
							var target = $(e.sender.userEvents.currentTarget);
							var item, uid = target.data("uid");
							if(uid){
								item = that.dataSource.getByUid(uid);
							}
							if(item){
								var selectedData, hasSelected = target.hasClass("k-state-selected");
								var shiftKey = e.sender._pressedShiftKey;
								var ctrlKey = e.sender._pressedCtrlKey;
								var useUtilKey = shiftKey || ctrlKey;
								var useSingleSelection = that.options.useSingleSelection;
								var selectedDataLength = that.getSelectedData().length;

								if(!this.options.multiple || (!useUtilKey && useSingleSelection)){
									//싱글 셀렉션 모드 일 경우 기존 선택했던 Selected 값을 해제
									selectedData = that.getSelectedData();
									var i, max = selectedData.length;
									for( i = 0; i < max; i++ ){
										selectedData[i].selected = false;
									}
								}

								// ctrl 및 shift 키 사용하여 여러 개 선택한 경우 선택상태 적용
								if (useSingleSelection) {
									var isMultipleSelected = selectedDataLength > 1;
									if (isMultipleSelected && !ctrlKey) {
										hasSelected = true;
										target.addClass("k-state-selected");
									}
								}

								item.selected = hasSelected;
								if(hasSelected){
									that.selectedIds.push(item.id);
								}else{
									var idx = that.selectedIds.indexOf(item.id);
									that.selectedIds.splice(idx, 1);
								}
								arg.item = item;
							}
						}
						arg.isDoubleClick = this._isDblClick;
						that.trigger(CHANGE, arg);
					},
					useAllItems: isLocked && multi && cell,
					relatedTarget: function (items) {
						if (cell || !isLocked) {
							return;
						}
						var related;
						var result = $();
						for (var idx = 0, length = items.length; idx < length; idx++) {
							related = that._relatedRow(items[idx]);
							if (inArray(related[0], items) < 0) {
								result = result.add(related);
							}
						}
						return result;
					},
					continuousItems: function () {
						return that._continuousItems(filter, cell);
					}
				});
				if (that.options.navigatable) {
					elements.on('keydown' + NS, function (e) {
						var current = that.current();
						var target = e.target;
						if (e.keyCode === keys.SPACEBAR && $.inArray(target, elements) > -1 && !current.is('.k-edit-cell,.k-header') && current.parent().is(':not(.k-grouping-row,.k-detail-row,.k-group-footer)')) {
							e.preventDefault();
							e.stopPropagation();
							current = cell ? current : current.parent();
							if (isLocked && !cell) {
								current = current.add(that._relatedRow(current));
							}
							if (multi) {
								if (!e.ctrlKey) {
									that.selectable.clear();
								} else if (current.hasClass(SELECTED)) {
									current.removeClass(SELECTED);
									/*Navigator Case 확인 필요*/
									console.info(current);
									that.trigger(CHANGE);
									return;
								}
							} else {
								that.selectable.clear();
							}
							that.selectable.value(current);
						}
					});
				}
			}
		},
		collapseGroup: function (group) {
			group = $(group);

			if(!this.groupCollapse){
				this.groupCollapse = {};
			}
			var field = group.data("field");
			var value = group.data("value");
			if(!this.groupCollapse[field]){
				this.groupCollapse[field] = {};
			}
			this.groupCollapse[field][value] = false;

			var level, groupable = this.options.groupable, showFooter = groupable.showFooter, footerCount = showFooter ? 0 : 1, offset, relatedGroup = $(), idx, length, tr;
			if (this._isLocked()) {
				if (!group.closest('div').hasClass('k-grid-content-locked')) {
					relatedGroup = group.nextAll('tr');
					group = this.lockedTable.find('>tbody>tr:eq(' + group.index() + ')');
				} else {
					relatedGroup = this.tbody.children('tr:eq(' + group.index() + ')').nextAll('tr');
				}
			}
			level = group.find('.k-group-cell').length;
			group.find('.k-i-collapse').addClass('k-i-expand').removeClass('k-i-collapse');
			group.find('td[aria-expanded=\'true\']:first').attr('aria-expanded', false);
			group = group.nextAll('tr');
			var toHide = [];
			for (idx = 0, length = group.length; idx < length; idx++) {
				tr = group.eq(idx);
				offset = tr.find('.k-group-cell').length;
				if (tr.hasClass('k-grouping-row')) {
					footerCount++;
				} else if (tr.hasClass('k-group-footer')) {
					footerCount--;
				}
				if (offset <= level || tr.hasClass('k-group-footer') && footerCount < 0) {
					break;
				}
				if (relatedGroup.length) {
					toHide.push(relatedGroup[idx]);
				}
				toHide.push(tr[0]);
			}
			$(toHide).hide();
		},
		expandGroup: function (group) {
			group = $(group);
			if(!this.groupCollapse){
				this.groupCollapse = {};
			}
			var field = group.data("field");
			var value = group.data("value");
			if(!this.groupCollapse[field]){
				this.groupCollapse[field] = {};
			}
			this.groupCollapse[field][value] = true;

			var that = this, showFooter = that.options.groupable.showFooter, level, tr, offset, relatedGroup = $(), idx, length, footersVisibility = [], groupsCount = 1;
			if (this._isLocked()) {
				if (!group.closest('div').hasClass('k-grid-content-locked')) {
					relatedGroup = group.nextAll('tr');
					group = this.lockedTable.find('>tbody>tr:eq(' + group.index() + ')');
				} else {
					relatedGroup = this.tbody.children('tr:eq(' + group.index() + ')').nextAll('tr');
				}
			}
			level = group.find('.k-group-cell').length;
			group.find('.k-i-expand').addClass('k-i-collapse').removeClass('k-i-expand');
			group.find('td[aria-expanded=\'false\']:first').attr('aria-expanded', true);
			group = group.nextAll('tr');
			for (idx = 0, length = group.length; idx < length; idx++) {
				tr = group.eq(idx);
				offset = tr.find('.k-group-cell').length;
				if (offset <= level) {
					break;
				}
				if (offset == level + 1 && !tr.hasClass('k-detail-row')) {
					tr.show();
					relatedGroup.eq(idx).show();
					if (tr.hasClass('k-grouping-row') && tr.find('.k-icon').hasClass('k-i-collapse')) {
						that.expandGroup(tr);
					}
					if (tr.hasClass('k-master-row') && tr.find('.k-icon').hasClass('k-i-collapse')) {
						tr.next().show();
						relatedGroup.eq(idx + 1).show();
					}
				}
				if (tr.hasClass('k-grouping-row')) {
					if (showFooter) {
						footersVisibility.push(tr.is(':visible'));
					}
					groupsCount++;
				}
				if (tr.hasClass('k-group-footer')) {
					if (showFooter) {
						tr.toggle(footersVisibility.pop());
					}
					if (groupsCount == 1) {
						tr.show();
						relatedGroup.eq(idx).show();
					} else {
						groupsCount--;
					}
				}
			}
		},
		/**
		*   <ul>
		*   <li>DataSource를 Set한다.</li>
		*   </ul>
		*   @function setDataSource
		*   @param {Array}dataSource - Set 할 Data
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		setDataSource: function (dataSource) {
			var that = this;
			var scrollable = that.options.scrollable;
			var hasSelectedModel = that.options.hasSelectedModel;
			var hasCheckedModel = that.options.hasCheckedModel;
			var data, i, max;
			if(dataSource instanceof kendo.data.DataSource){
				data = dataSource.data();
			}else{
				data = dataSource;
			}
			this.selectedIds = [];
			//Checked, Selected Model을 들고 있는 경우 Data에 해당 어트리뷰트가 없을 떄,
			//setDataSource 호출 시, 자동으로 셋팅한다.
			if(data.length > 0){
				if(hasSelectedModel){
					if(typeof data[0].selected === "undefined"){
						max = data.length;
						for( i = 0; i < max; i++ ){
							data[i].selected = false;
						}
					}
				}

				if(hasCheckedModel){
					if(typeof data[0].checked === "undefined"){
						max = data.length;
						for( i = 0; i < max; i++ ){
							data[i].checked = false;
						}
					}
				}
			}

			that.options.dataSource = dataSource;
			if(that.dropdownListUl){
				that.dropdownListUl.trigger("dropdownblur", {isForce : true});
			}
			that._dataSource();
			that._pageable();
			that._thead();
			if (scrollable) {
				if (scrollable.virtual) {
					that.content.find('>.k-virtual-scrollable-wrap').scrollLeft(0);
				} else {
					that.content.scrollLeft(0);
				}
			}
			if (that.options.groupable) {
				that._groupable();
			}
			if (that.virtualScrollable) {
				that.virtualScrollable.setDataSource(that.options.dataSource);
			}
			if (that.options.navigatable) {
				that._navigatable();
			}
			if (that.options.selectable) {
				that._selectable();
			}
			if (that.options.autoBind) {
				dataSource.fetch();
			}

			if(that.virtualScrollable && typeof that._beforeScrollTop !== "undefined"){
				that.virtualScrollable.verticalScrollbar.scrollTop(that._beforeScrollTop);
			}
		},
		_setAllSelectedModel : function(isSelected, isView, maxLength){
			var ds = this.dataSource;
			var data, datas;
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);
					var group = ds.group();
					if(group) query = query.group(group);

					datas = query.toArray();
					//console.log(datas.length);
				}else{
					datas = ds.flatView();
				}
			}else{
				datas = ds.data();
			}

			if(maxLength){
				maxLength = (maxLength >= datas.length) ? data.length : maxLength;
			}

			var i, max = maxLength ? maxLength : datas.length;
			if(!isSelected){
				this.selectedIds.length = 0;
			}
			for( i = 0; i < max; i++ ){
				data = datas[i];
				data.selected = isSelected;
				if(isSelected){
					this.selectedIds.push(data.id);
				}
			}
			ds.fetch();
		},
		/**
		*   <ul>
		*   <li>전체 선택 해제</li>
		*   </ul>
		*   @function clearSelection
		*   @param {Array}dataSource - Set 할 Data
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		clearSelection: function () {
			var that = this;
			if(that.selectable) that.selectable.clear();
			if(that.options.hasSelectedModel){
				this._setAllSelectedModel(false);
			}
			that.trigger(CHANGE);
		},
		/**
		*   <ul>
		*   <li>리스트의 아이템을 전체 선택한다.</li>
		*   </ul>
		*   @function selectAll
		*   @param {Boolean}isView - 현재 뷰만 전체 선택되도록 한다.
		*   @param {Number}maxLength - 선택 개수를 제한할 선택 개수
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		selectAll : function(isView, maxLength){
			var that = this;
			if(that.options.hasSelectedModel){
				var options = this.options;
				var selectedLimit = options.selectedLimit;
				if(selectedLimit !== false && selectedLimit != 0){
					maxLength = selectedLimit;
				}
				this._setAllSelectedModel(true, isView, maxLength);
			}
			that.trigger(CHANGE);
		},
		unselectAll : function(){
			this.clearSelection();
		},
		selectByIds : function(ids){
			var i, max = ids.length;

			for( i = 0; i < max; i++ ){
				if(this.selectedIds){
					if(this.selectedIds.indexOf(ids[i]) == -1){
						this.selectedIds.push(ids[i]);
						var item = this.dataSource.get(ids[i]);
						item.selected = true;
					}
				}
			}
			this.dataSource.fetch();
		},
		unselectByIds : function(ids){
			var i, max = ids.length;
			for( i = 0; i < max; i++ ){
				if(this.selectedIds){
					var idx = this.selectedIds.indexOf(idx[i]);
					this.selectedIds.splice(idx, 1);
				}
				var item = this.dataSource.get(ids[i]);
				item.selected = false;
			}
			this.dataSource.fetch();
		},
		selectById : function(id){
			if(this.selectedIds){
				this.selectedIds.push(id);
			}
			var item = this.dataSource.get(id);
			//set("selected", value) 의 경우 테이블 전체를 렌더링하므로 아래 코드로 대체함
			item.selected = true;
			this.element.find("tr[data-uid='" + item.uid + "']").addClass("k-state-selected");
		},
		selectByData : function(selectedData){
			var that = this, i, data, max = selectedData.length;
			var item, ds = that.dataSource, options = that.options, hasSelectedModel = options.hasSelectedModel;
			for( i = 0; i < max; i++ ){
				data = selectedData[i];
				item = ds.get(data.id);
				if(item){
					if(hasSelectedModel) item.selected = true;
					else that.element.find("tr[data-uid='" + item.uid + "']").addClass("k-state-selected");
				}
			}
			if(hasSelectedModel) ds.fetch();
		},
		deselectById : function(id){
			if(this.selectedIds){
				var idx = this.selectedIds.indexOf(id);
				this.selectedIds.splice(idx, 1);
			}
			var item = this.dataSource.get(id);
			item.selected =  false;
			this.element.find("tr[data-uid='" + item.uid + "']").removeClass("k-state-selected");
		},
		getSelectedIds : function(){
			return this.selectedIds;
		},
		getSelectedList : function(){
			if(!this.options.hasSelectedModel){
				console.error("Selected Model Options is false");
				return [];
			}
			var ds = this.dataSource;
			var results = [];
			var id, item, datas = this.selectedIds;
			var i, max = datas.length;
			for( i = 0; i < max; i++ ){
				id = datas[i];
				item = ds.get(id);
				results.push(item);
			}
			return results;
		},
		_averageRowHeight: function () {
			var that = this, itemsCount = that._items(that.tbody).length, rowHeight = that._rowHeight;
			if (itemsCount === 0) {
				return rowHeight;
			}

			if(this.options.cardTemplate){
				var cardHeight = this.options.cardHeight;
				var cardNum = this.options.cardNum;
				return cardHeight / cardNum;
			}

			if (!that._rowHeight) {
				that._rowHeight = rowHeight = outerHeight(that.table) / itemsCount;
				that._sum = rowHeight;
				that._measures = 1;
			}
			var currentRowHeight = outerHeight(that.table) / itemsCount;
			if (rowHeight !== currentRowHeight) {
				that._measures++;
				that._sum += currentRowHeight;
				that._rowHeight = that._sum / that._measures;
				return currentRowHeight;
			}
			return rowHeight;
		},
		_scrollable: function () {
			var that = this, header, table, options = that.options, scrollable = options.scrollable, hasVirtualScroll = scrollable !== true && scrollable.virtual && !that.virtualScrollable, scrollbar = !kendo.support.kineticScrollNeeded || hasVirtualScroll ? kendo.support.scrollbar() : 0;
			if (scrollable) {
				header = that.wrapper.children('.k-grid-header');
				if (!header[0]) {
					header = $('<div class="k-grid-header" />').insertBefore(that.table);
				}
				header.css(isRtl ? 'padding-left' : 'padding-right', scrollable.virtual ? scrollbar + 1 : scrollbar);
				table = $('<table role="grid" />');
				if (isIE7) {
					table.attr('cellspacing', 0);
				}
				table.width(that.table[0].style.width);
				table.append(that.thead);
				header.empty().append($('<div class="k-grid-header-wrap k-auto-scrollable" />').append(table));
				that.content = that.table.parent();
				if (that.content.is('.k-virtual-scrollable-wrap, .km-scroll-container')) {
					that.content = that.content.parent();
				}
				if (!that.content.is('.k-grid-content, .k-virtual-scrollable-wrap')) {
					that.content = that.table.wrap('<div class="k-grid-content k-auto-scrollable" />').parent();
				}
				var cardNum = null;
				if(options.cardTemplate){
					cardNum = options.cardNum;
				}
				if (hasVirtualScroll) {
					that.virtualScrollable = new VirtualScrollable(that.content, {
						dataSource: that.dataSource,
						itemHeight: function () {
							return that._averageRowHeight();
						},
						cardNum : cardNum
					});
				}
				that.scrollables = header.children('.k-grid-header-wrap').add(that.content);
				var footer = that.wrapper.find('.k-grid-footer');
				if (footer.length) {
					that.scrollables = that.scrollables.add(footer.children('.k-grid-footer-wrap'));
				}
				if (scrollable.virtual) {
					that.content.find('>.k-virtual-scrollable-wrap').unbind('scroll' + NS).bind('scroll' + NS, function () {
						that.scrollables.scrollLeft(this.scrollLeft);
						if (that.lockedContent) {
							that.lockedContent[0].scrollTop = this.scrollTop;
						}
					});
				} else {
					that.content.unbind('scroll' + NS).bind('scroll' + NS, function (e) {
						that.scrollables.not(e.currentTarget).scrollLeft(this.scrollLeft);
						if (that.lockedContent && e.currentTarget == that.content[0]) {
							that.lockedContent[0].scrollTop = this.scrollTop;
						}
					});
					var touchScroller = that.content.data('kendoTouchScroller');
					if (touchScroller) {
						touchScroller.destroy();
					}
					touchScroller = kendo.touchScroller(that.content);
					if (touchScroller && touchScroller.movable) {
						that.touchScroller = touchScroller;
						touchScroller.movable.bind('change', function (e) {
							that.scrollables.scrollLeft(-e.sender.x);
							if (that.lockedContent) {
								that.lockedContent.scrollTop(-e.sender.y);
							}
						});
						that.one(DATABOUND, function (e) {
							e.sender.wrapper.addClass('k-grid-backface');
						});
					}
				}
			}
		}
	});
	kendo.ui.plugin(extendGrid);

})(window, jQuery);
//# sourceURL=widget/common-grid.js
