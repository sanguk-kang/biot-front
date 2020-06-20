(function(window, $){
	var kendo = window.kendo;
	var ui = kendo.dataviz.ui;
	var Chart = ui.Chart;

	var extendChart = ui.Chart = Chart.extend({
		//디폴트 옵션.
		options: {
			selectionTooltip: {
				isVisible: false,
				width: 200,
				seriesKeysForRowName: ["name"],
				rowGroupNames: [],
				rowTemplate: null,
				top: 300,
				margin: 15
			}
		},
		init: function(element, options) {
			var self = this;
			Chart.fn.init.call(this, element, options);
			//차트 공용 셀렉션 요소 생성 및 초기화.
			if(self.options.selectionTooltip.isVisible){
				self._initSelectionDOM();
				self._attachSelectionEvt();
			}
		},
		_attachSelectionEvt: function() {
			var self = this;
			//ui/ux를 위해 마우스가 영역내의 시리즈에 hover 되면 이벤트를 받아 해당 시리즈 데이터 부분 font-weight bold 처리로 하이라이팅.
			self.bind("seriesClick", self._handleSeriesClickEvt);
			self.element.on("mousemove", self._handlePlotAreaMoveEvt.bind(self));
			//마우스가 차트 영역을 벗어나면 셀렉션 요소 안보이게 설정.
			self.element.on("mouseleave", function(e) {
				var pane = self.findPaneByIndex(0);
				//패널에 그려진 차트 요소중에 하이라이팅 rect가 있는 경우 제거.
				if(typeof pane.visual.children[0]._geometry != "undefined")
					pane.visual.removeAt(0);
				self._hideSelectionTooltip();
				self._currentSelectionCategorySlotIndex = null;
			});
			//ui/ux를 위해 마우스가 툴팁영역에 들어서면, 사라지게 위한 부분.
			$(self._selectionTooltipElem).on("mousemove", function(e) {
				var curPosx = e.clientX - self.wrapper.offset().left;
				var axisXMajorTicks = self._plotArea.axisX._ticks.majorTicks;
				//만약 셀렉션된 영역에 마우스가 계속 있다면 hide 하지 않는다.
				if(axisXMajorTicks[self._currentSelectionCategorySlotIndex] < curPosx && curPosx <= axisXMajorTicks[self._currentSelectionCategorySlotIndex + 1]) return;
				self._hideSelectionTooltip();
			});
		},
		_initSelectionDOM: function() {//initSelectionDOM
			var self = this;
			self._selectionTooltipElem = $('<div></div>').addClass('common-chart-selection-tooltip');
			self._selectionTooltipInnerElem = $('<div></div>').addClass('common-chart-selection-tooltip-inner');
			self.element.append(self._selectionTooltipElem.append(self._selectionTooltipInnerElem));
		},
		_handlePlotAreaMoveEvt: function(e) {
			var self = this;
			var curPosX = e.originalEvent.layerX;
			var axisXMajorTicks = self._plotArea.axisX._ticks.majorTicks;
			var backgroundBox = self._plotArea.backgroundBox();
			var i, max = axisXMajorTicks.length - 1;
			//[2018-05-10][차트가 아닌 하이라이트와 툴팁이 호버되는 경우를 제외하는 로직]
			if($(e.originalEvent.target)[0].nodeName.toLowerCase() !== 'path')
				return;
			for(i = 0; i < max; i++) {
				if(axisXMajorTicks[i] < curPosX && curPosX <= axisXMajorTicks[i + 1]) {
					//새로 선택한 카테고리 영역과, 현재 카테고리 영역이 같으면 새로 그리지 않는다.
					if( self._currentSelectionCategorySlotIndex !== null && self._currentSelectionCategorySlotIndex == i) return;
					self._renderSelectionHighlighting(i, backgroundBox);
					self._renderSelectionTooltip(i, e.clientX);
					self._currentSelectionCategorySlotIndex = i;
				}
			}
		},
		_handleSeriesClickEvt: function(e) {
			var self = this;
			var seriesItem = e.series;
			var rowName = self._generateRowNameBySeriesKeys(seriesItem);
			var i, tooltipRows = self._selectionTooltipElem.find(".common-chart-selection-tooltip-row");
			var selectionRow = tooltipRows.filter(function(idx, element) {
				return $(element).data("name") == rowName;
			});
			for(i = 0; i < tooltipRows.length; i++) {
				$(tooltipRows[i]).css({"font-weight": "normal"});
			}
			$(selectionRow).css({"font-weight": "bold"});
		},
		_renderSelectionHighlighting: function(categorySlotIndex, backgroundBox) {
			var self = this;
			var axisXMajorTicks = self._plotArea.axisX._ticks.majorTicks;
			var width = axisXMajorTicks[categorySlotIndex + 1] - axisXMajorTicks[categorySlotIndex] - 3;
			var height = backgroundBox.height();
			var pane = self.findPaneByIndex(0);
			var highlightBackGroundRect = new kendo.drawing.Rect(
				//비주얼로 그려지는 Rect의 경계선(stroke)의 width 값은 0을 주어 하이라이팅 엘리먼트만 보이게 한다.
				new kendo.geometry.Rect([axisXMajorTicks[categorySlotIndex] + 2, backgroundBox.y1], [width, height]), {fill: {color: "white"}, stroke: {color:"#0081c6", width: 1}}
			);
			//패널에 그려진 차트 요소중에 하이라이팅 rect가 있는 경우 제거.
			if(typeof pane.visual.children[0]._geometry != "undefined") {
				pane.visual.removeAt(0);
			}
			pane.visual.insert(0, highlightBackGroundRect); //패널 인덱스 0 에 삽입.
		},
		_renderSelectionTooltip: function(categorySlotIndex, clientX) {
			var self = this;
			var I18N = window.I18N;
			var axisXMajorTicks = self._plotArea.axisX._ticks.majorTicks;
			var rowTemplate = self.options.selectionTooltip.rowTemplate;
			var rowGroupNames = self.options.selectionTooltip.rowGroupNames.slice(0); // ""그룹네임을 추가하기 위한 깊은복사.
			var chartAreaElem = self._hasParentElemScroll() ? self.wrapper.parent() : self.wrapper; // 만약 차트에 수평 스크롤이 생겼다면, 차트 영역을 부모 width 값으로 한다.
			var midPosX = chartAreaElem.offset().left + chartAreaElem.width() / 2;
			var tooltipWidth = self.options.selectionTooltip.width;
			var tooltipPosX = 0;
			var tooltipPosY = self.options.selectionTooltip.top;
			var marginPx = self.options.selectionTooltip.margin;
			var row, rows = []; // 툴팁에그려질 행 정보(content, priority)를 가지는 row 오브젝트의 배열.
			var rowGroup, rowGroups = []; // 툴팁에s 그려질 행 그룹().
			var rowElem, rowGroupElem;
			var series = self.options.series;
			var data, i, j, max = series.length;

			//rowTemplate 이 없다면, 기본 값을 만들어 준다.
			if(!rowTemplate) {
				rowTemplate = function(seriesItem) {
					return {
						groupName:"",
						content: "<span>" + seriesItem.name + ": " + seriesItem.data + "</span>",
						priority: 0
					};
				};
			}
			//중앙을 기준으로 현재 선택한 카테고리 영역이 좌측이면 카테고리 오른쪽으로 출력하고, 우측이면 왼쪽에 츨력해 툴팁이 가려지는 걸 막는다.
			if(midPosX > clientX) tooltipPosX = axisXMajorTicks[categorySlotIndex + 1] + marginPx;
			else tooltipPosX = axisXMajorTicks[categorySlotIndex] - tooltipWidth - marginPx;

			//해당 카테고리 영역에 모든 시리즈의 값과 타이틀을 가져와 템플릿을 만든다.
			for(i = 0; i < max; i++) {
				//데이터가 없거나 시리즈 네임이 없는 경우 툴팁 내용에서 제외.
				if(typeof series[i].name == "undefined" || typeof series[i].data[categorySlotIndex] == "undefined" || series[i].data[categorySlotIndex] === null) continue;
				//셀렉션 툴팁에 제공하는 값.(series[i], series[i].data[categorySlotIndex], categorySlotIndex)
				data = series[i].data[categorySlotIndex];
				row = rowTemplate({'series': series[i], 'data': data, 'categorySlotIndex': categorySlotIndex});
				if(row === null) continue; //화면으로부터 돌려받은 row 값이 널이면 행 행은 추가하지 않는다.
				//시리즈 클릭 이벤트시에 툴팁에서 해당 타켓의 row를 하이라이팅 시켜주기위한 네임 값 생성.(설정에따라서)
				row["name"] = self._generateRowNameBySeriesKeys(series[i]);
				rows.push(row);
				if(tooltipPosY != 0 ) tooltipPosY -= 15; // 툴팁의 한행이 30px 이기에 보정한다.(최대 0)
			}
			//그룹 이름을 정하지 않은 행을 따로 "" 으로 그룹핑 하고 가장 먼저 툴팁에 출력한다.(우선)
			rowGroupNames.unshift("");
			// 옵션으로 설정된 툴팁의 그룹핑 이름 순서대로 각 행들을 그룹핑.
			for(i = 0; i < rowGroupNames.length; i++) {
				rowGroup = {
					'name': rowGroupNames[i],
					'rows': rows.filter(function(item){ return item.groupName == rowGroupNames[i];})
				};
				//그룹에 해당하는 행이 없으면 제거한다.
				if(rowGroup.rows.length > 0)
					rowGroups.push(rowGroup);
			}
			//툴팁 요소에 행 그룹과 행 요소를 append 하기 이전에 append 한 엘리먼트들을 모두 제거.
			self._selectionTooltipInnerElem.empty();
			for(i = 0; i < rowGroups.length; i++) {
				rowGroupElem = $("<div></div>").addClass("common-chart-selection-tooltip-row-group").append($("<div/>").addClass("common-chart-selection-tooltip-row-group-name").text(rowGroups[i].name));
				//그룹 내의 행들의 우선순위로 정렬.
				rowGroups[i].rows.sort(function(a, b) {return b.priority - a.priority;});
				for(j = 0; j < rowGroups[i].rows.length; j++) {
					rowElem = $("<div></div>").addClass("common-chart-selection-tooltip-row").data("name", rowGroups[i].rows[j].name).html(rowGroups[i].rows[j].content);
					rowGroupElem.append(rowElem);
				}
				self._selectionTooltipInnerElem.append(rowGroupElem);
			}

			// 툴팁에 내용이 없다면 '표시할 데이터가 없다' 는 메시지를 툴팁에 뛰운다.
			if(self._selectionTooltipInnerElem.children().length == 0)
				self._selectionTooltipInnerElem.append($("<div></div>").addClass("common-chart-selection-tooltip-row-group").html("<span>" + I18N.prop("COMMON_CHART_SELECTION_TOOLTIP_NO_DATA_TO_DSIPLAY") + "</span>"));
			// self._selectionTooltipInnerElem.html(tooltipTemplate);
			self._selectionTooltipElem.css({
				"top": tooltipPosY,
				"left": tooltipPosX,
				"width": tooltipWidth,
				"display": "block"
			});
		},
		_hasParentElemScroll: function() {
			var self = this;
			return self.wrapper.width() > self.wrapper.parent().width() ? true : false;
		},
		_hideSelectionTooltip: function() {
			var self = this;
			self._selectionTooltipElem.css({"display": "none"});
		},
		_showSelectionTooltip: function() {
			var self = this;
			self._selectionTooltipElem.css({"display": "block"});
		},
		_generateRowNameBySeriesKeys: function(seriesItem) {
			var self = this;
			var rowName = "";
			var i, keys = self.options.selectionTooltip.seriesKeysForRowName;
			for(i = 0; i < keys.length; i++) {
				rowName += seriesItem[keys[i]];
			}
			return rowName;
		},
		_currentSelectionCategorySlotIndex : null,
		_selectionTooltipElem : null,
		_selectionTooltipInnerElem : null
	});
	kendo.ui.plugin(extendChart);
})(window, jQuery);