(function(window, $){
	var kendo = window.kendo;
	var ui = kendo.ui;
	var Spreadsheet = ui.Spreadsheet;
	var Widget = kendo.ui.Widget;
	var Workbook = kendo.spreadsheet.Workbook;
	var Controller = kendo.spreadsheet.Controller;
	var View = kendo.spreadsheet.View;
	var Pane = kendo.spreadsheet.Pane;
	var Grid = kendo.spreadsheet.Grid;
	var Axis = kendo.spreadsheet.Axis;
	var PaneAxis = kendo.spreadsheet.PaneAxis;
	var Sheet = kendo.spreadsheet.Sheet;
	var SheetNavigator = kendo.spreadsheet.SheetNavigator;
	var Range = kendo.spreadsheet.Range;
	var NS = '.kendoSpreadsheet';

	//View Controller modes
	var SELECTION_MODES = {
		cell: 'range',
		rowheader: 'row',
		columnheader: 'column',
		topcorner: 'sheet',
		autofill: 'autofill',
		outrange: 'extra'
	};

	var Selection = kendo.Class.extend({
		init: function (sheet) {
			this._sheet = sheet;
			this._isBooleanSheet = sheet._isBooleanSheet;
			this.selection = kendo.spreadsheet.FIRSTREF.toRangeRef();
			this.originalSelection = kendo.spreadsheet.FIRSTREF.toRangeRef();
			this._activeCell = kendo.spreadsheet.FIRSTREF.toRangeRef();
			this.originalActiveCell = kendo.spreadsheet.FIRSTREF;
		},
		currentSelectionRange: function () {
			return this.selection.rangeAt(this.selectionRangeIndex).toRangeRef();
		},
		currentOriginalNavigationRange: function () {
			return this.originalSelection.rangeAt(this.selectionRangeIndex).toRangeRef();
		},
		currentNavigationRange: function () {
			if (this.singleCellSelection()) {
				return this._sheet._sheetRef;
			}
			return this.selection.rangeAt(this.selectionRangeIndex).toRangeRef();
		},
		nextNavigationRange: function () {
			if (!this.singleCellSelection()) {
				this.selectionRangeIndex = this.selection.nextRangeIndex(this.selectionRangeIndex);
			}
			return this.currentNavigationRange();
		},
		previousNavigationRange: function () {
			if (!this.singleCellSelection()) {
				this.selectionRangeIndex = this.selection.previousRangeIndex(this.selectionRangeIndex);
			}
			return this.currentNavigationRange();
		},
		activeCell: function (ref) {
			if (ref) {
				this.originalActiveCell = ref.first();
				this._activeCell = this._sheet.unionWithMerged(ref.toRangeRef());
				this._sheet.focus(ref);
				this._sheet.triggerChange({
					activeCell: true,
					selection: true
				});
			}
			return this._activeCell;
		},
		select: function (ref, expanded, changeActiveCell) {
			if (ref) {
				if (ref.eq(this.originalSelection) && !this._sheet._isBooleanSheet) {
					return;
				}
				this._sheet.triggerSelect(new Range(ref, this._sheet));
				this.originalSelection = ref;
				this.selection = expanded;
				if (changeActiveCell !== false) {
					if (ref.isCell()) {
						this.activeCell(ref);
					} else {
						this.activeCell(this.selection.lastRange().first());
					}
					this.selectionRangeIndex = this.selection.size() - 1;
				} else {
					this._sheet.triggerChange({ selection: true });
				}
			}
			return this.selection;
		},
		singleCellSelection: function () {
			return this._activeCell.eq(this.selection);
		}
	});

	var ExtendedSheetNavigator = SheetNavigator.extend({
		completeSelection: function (selectionMode) {
			this._sheet.completeSelection(selectionMode);
		}
	});

	// ExtendedPaneAxis 적용을 위한 Grid 확장
	var ExtendedGrid = Grid.extend({
		pane: function (options) {
			return new kendo.spreadsheet.PaneGrid(new ExtendedPaneAxis(this._rows, options.row, options.rowCount, this._headerHeight), new ExtendedPaneAxis(this._columns, options.column, options.columnCount, this._headerWidth), this);
		}
	});

	var ExtendedAxis = Axis.extend({
		// booleanSheet일 경우, 시트 내 셀 외의 영역 선택 여부 확인
		checkOutCellRange: function (value) {
			var index = 0;
			var iterator = this.values.iterator(0, this._count - 1);
			var current = iterator.at(0);
			while(current < value && index < this._count - 1) {
				current += iterator.at(++index);
			}
			return (index >= this._count - 1 && current < value);
		}
	});

	var ExtendedPaneAxis = PaneAxis.extend({
		// booleanSheet일 경우, 시트 내 셀 외의 영역 선택 여부 확인
		checkOutCellRange: function (value, offset) {
			return this._axis.checkOutCellRange(value + (this.frozen ? 0 : offset) - this.headerSize);
		}
	});

	var ExtendedSheet = Sheet.extend({
		_reinit: function (rowCount, columnCount, rowHeight, columnWidth, headerHeight, headerWidth, defaultCellStyle, rowHeaderList, columnHeaderList, booleanSheet, defaultHeaderStyle) {
			var cellCount = rowCount * columnCount - 1;
			defaultCellStyle = defaultCellStyle || {};
			this._defaultCellStyle = {
				background: defaultCellStyle.background,
				color: defaultCellStyle.color,
				fontFamily: defaultCellStyle.fontFamily,
				fontSize: defaultCellStyle.fontSize,
				italic: defaultCellStyle.italic,
				bold: defaultCellStyle.bold,
				underline: defaultCellStyle.underline,
				wrap: defaultCellStyle.wrap
			};
			this._isBooleanSheet = booleanSheet ? true : false;
			this._rows = new ExtendedAxis(rowCount, rowHeight);
			this._columns = new ExtendedAxis(columnCount, columnWidth);
			this._mergedCells = [];
			this._frozenRows = 0;
			this._frozenColumns = 0;
			this._suspendChanges = false;
			this._filter = null;
			this._showGridLines = true;
			this._gridLinesColor = null;
			this._grid = new ExtendedGrid(this._rows, this._columns, rowCount, columnCount, headerHeight, headerWidth);
			this._sheetRef = this._grid.normalize(kendo.spreadsheet.SHEETREF);
			this._properties = new kendo.spreadsheet.PropertyBag(cellCount, this._defaultCellStyle);
			this._sorter = new kendo.spreadsheet.Sorter(this._grid, this._properties.sortable());
			this._viewSelection = new Selection(this);
			this._editSelection = new Selection(this);
			this._formulaSelections = [];
			this._rowHeaderList = rowHeaderList;
			this._columnHeaderList = columnHeaderList;
			this._defaultHeaderStyle = {
				fontSize: defaultHeaderStyle && defaultHeaderStyle.fontSize
			};
		},
		navigator: function() {
			if(!this._navigator) {
				this._navigator = new ExtendedSheetNavigator(this);
			}
			return this._navigator;
		},
		completeSelection: function (selectionMode) {
			if (this._selectionInProgress) {
				if (this._isBooleanSheet && selectionMode !== 'extra') this.booleanSheetToggleData();
			}
			Sheet.fn.completeSelection.call(this);
		},
		booleanSheetToggleData: function() {
			var selection = this.selection(), ref = selection._ref;
			if (ref instanceof kendo.spreadsheet.UnionRef) {
				ref = ref.refs[ref.refs.length - 1];
				selection = new kendo.spreadsheet.Range(ref, this);
			} else if (ref instanceof kendo.spreadsheet.CellRef) {
				ref = ref.toRangeRef();
				selection = new kendo.spreadsheet.Range(ref, this);
			}
			var tl = ref.topLeft, br = ref.bottomRight;
			var isAllRow = br.row - tl.row + 1 === this._rows._count;
			var isAllColumn = br.col - tl.col + 1 === this._columns._count;
			var isAllSheet = isAllRow && isAllColumn;
			var isSelectedAll = this._isSelectedAll(ref);
			var ri, ci, values = [], rowValues;
			if (tl.row == br.row && tl.col == br.col) {
				selection.value(!selection.value());
			} else {
				for (ri = tl.row; ri <= br.row; ri++) {
					rowValues = [];
					for (ci = tl.col; ci <= br.col; ci++) {
						if (!this.isHiddenRow(ri) && !this.isHiddenColumn(ci)) {
							if (isAllRow || isAllColumn || isAllSheet) {
								rowValues.push(!isSelectedAll);
							} else {
								rowValues.push(!selection.values()[ri - tl.row][ci - tl.col]);
							}
						} else {
							rowValues.push(selection.values()[ri - tl.row][ci - tl.col]);
						}
					}
					values.push(rowValues);
				}
				selection.values(values);
			}
		},
		_isSelectedAll: function (ref) {
			var tl = ref.topLeft, br = ref.bottomRight;
			var ri, ci;
			for (ri = tl.row; ri <= br.row; ri++) {
				for (ci = tl.col; ci <= br.col; ci++) {
					if (!this.isHiddenRow(ri) && !this.isHiddenColumn(ci) && this.selection().values()[ri - tl.row][ci - tl.col] === false) {
						return false;
					}
				}
			}
			return true;
		},
		getBooleanData: function() {
			if (!this._isBooleanSheet) return;
			var sheet = this, key = this._booleanSheetKey;
			var result = [], keysLength, keys, i, trueDataArr, obj, tmp;
			var rowh = sheet._rowHeaderList || [], colh = sheet._columnHeaderList || [], rowhLength = rowh.length, colhLength = colh.length;
			var selection, ri, ci;
			keys = key && key.split('.') || [];
			keysLength = keys.length;

			for (ri = 0; ri < rowhLength; ri++) {
				trueDataArr = [];
				for (ci = 0; ci < colhLength; ci++) {
					selection = new kendo.spreadsheet.Range(new kendo.spreadsheet.CellRef(ri, ci), sheet);
					if (selection.value() == true) {
						trueDataArr.push(colh[ci].id);
					}
				}
				obj = {};
				obj[keys[keysLength - 1]] = trueDataArr.length > 0 ? trueDataArr : [];
				for (i = keysLength - 2; i >= 0; i--) {
					tmp = {};
					tmp[keys[i]] = obj;
					obj = tmp;
				}
				obj['id'] = rowh[ri].id;
				result.push(obj);
			}
			return result;
		}
	});

	var ExtendedWorkbook = Workbook.extend({
		init: function (options, view) {
			kendo.Observable.fn.init.call(this);
			this.options = options;
			this._view = view;
			this._sheets = [];
			this._sheetsSearchCache = {};
			this._sheet = this.insertSheet({
				rows: this.options.rows,
				columns: this.options.columns,
				rowHeight: this.options.rowHeight,
				columnWidth: this.options.columnWidth,
				headerHeight: this.options.headerHeight,
				headerWidth: this.options.headerWidth,
				dataSource: this.options.dataSource,
				rowHeaderList: this.options.rowHeaderList,
				columnHeaderList: this.options.columnHeaderList
			});
			this.undoRedoStack = new kendo.util.UndoRedoStack();
			this.undoRedoStack.bind([
				'undo',
				'redo'
			], this._onUndoRedo.bind(this));
			this._context = new kendo.spreadsheet.FormulaContext(this);
			this._validationContext = new kendo.spreadsheet.ValidationFormulaContext(this);
			this._names = Object.create(null);
			this.fromJSON(this.options);
		},
		insertSheet: function (options) {
			options = options || {};
			var that = this;
			var insertIndex = typeof options.index === 'number' ? options.index : that._sheets.length;
			var sheetName;
			var sheets = that._sheets;
			var getUniqueSheetName = function (sheetNameSuffix) {
				sheetNameSuffix = sheetNameSuffix ? sheetNameSuffix : 1;
				var name = 'Sheet' + sheetNameSuffix;
				if (!that.sheetByName(name)) {
					return name;
				}
				return getUniqueSheetName(sheetNameSuffix + 1);
			};
			if (options.name && that.sheetByName(options.name)) {
				return;
			}
			this._sheetsSearchCache = {};
			sheetName = options.name || getUniqueSheetName();
			//ExtendedSheet 활용하여 row, column header Customizing
			var rhl = this.options.sheets && this.options.sheets[insertIndex].rowHeaderList || null;
			var chl = this.options.sheets && this.options.sheets[insertIndex].columnHeaderList || null;
			if(rhl && rhl.length >= 0) options.rows = rhl.length === 0 ? 1 : rhl.length;
			if(chl && chl.length >= 0) options.columns = chl.length === 0 ? 1 : chl.length;
			var bsDataSource = this.options.sheets && this.options.sheets[insertIndex].booleanSheet && (this.options.sheets[insertIndex].booleanSheet.dataSource || []) || null;
			var bsPropertyKey = this.options.sheets && this.options.sheets[insertIndex].booleanSheet && (this.options.sheets[insertIndex].booleanSheet.propertyKey || 'value') || null;
			if(bsDataSource) {
				bsDataSource = parseDataSourceForBooleanSheet(bsDataSource, bsPropertyKey, rhl, chl);
			}
			var sheet = new ExtendedSheet(options.rows || this.options.rows, options.columns || this.options.columns, options.rowHeight || this.options.rowHeight, options.columnWidth || this.options.columnWidth, options.headerHeight || this.options.headerHeight, options.headerWidth || this.options.headerWidth, options.defaultCellStyle || this.options.defaultCellStyle, rhl, chl, bsDataSource, options.defaultHeaderStyle || this.options.defaultHeaderStyle);
			sheet._workbook = this;
			sheet._name(sheetName);
			this._bindSheetEvents(sheet);
			sheets.splice(insertIndex, 0, sheet);
			if (options.data) {
				sheet.fromJSON(options.data);
			}
			if (bsDataSource){
				sheet.setDataSource(bsDataSource);
				sheet._booleanSheetKey = bsPropertyKey;
			} else if (options.dataSource) {
				sheet.setDataSource(options.dataSource);
			}
			this.trigger('change', { sheetSelection: true });
			return sheet;
		}
	});

	function cellBorder(value) {
		return [
			'solid',
			(value.size || 1) + 'px',
			value.color || '#000'
		].join(' ');
	}
	function asURL(link) {
		if (!/:\/\//.test(link)) {
			link = 'http://' + link;
		}
		return link;
	}
	function drawCell(collection, cell, cls, hBorders, vBorders, showGrid, booleanSheet) {
		function maybeLink(el) {
			var link = cell.link;
			if (!link) {
				if (typeof cell.value == 'object') {
					link = cell.value.link;
				}
			}
			if (link) {
				var style = { textDecoration: 'none' };
				if (cell.color) {
					style.color = cell.color;
				}
				if (cell.underline) {
					style.textDecoration = 'underline';
				}
				return kendo.dom.element('a', {
					href: asURL(link),
					style: style,
					target: '_blank'
				}, el ? [el] : []);
			}
			return el;
		}
		//booleanSheet일 경우 class를 추가해야 하므로 return하지 않음
		if (!cls && !kendo.spreadsheet.draw.shouldDrawCell(cell) && !booleanSheet) {
			return;
		}
		var left = cell.left;
		var top = cell.top;
		var width = cell.width + 1;
		var height = cell.height + 1;
		var style = {};
		var background = cell.background;
		var defaultBorder = null;
		if (background) {
			defaultBorder = background;
			if (showGrid) {
				defaultBorder = kendo.parseColor(defaultBorder).toHSV();
				defaultBorder.v *= 0.9;
				defaultBorder = defaultBorder.toCssRgba();
			}
			defaultBorder = cellBorder({ color: defaultBorder });
		}
		if (background) {
			style.backgroundColor = background;
		}
		if (cell.color) {
			style.color = cell.color;
		}
		if (cell.fontFamily) {
			style.fontFamily = cell.fontFamily;
		}
		if (cell.underline) {
			style.textDecoration = 'underline';
		}
		if (cell.italic) {
			style.fontStyle = 'italic';
		}
		if (cell.textAlign) {
			style.textAlign = cell.textAlign;
		}
		if (cell.bold) {
			style.fontWeight = 'bold';
		}
		if (cell.fontSize) {
			style.fontSize = cell.fontSize + 'px';
		}
		if (cell.wrap === true) {
			style.whiteSpace = 'pre-wrap';
			style.overflowWrap = 'break-word';
			style.wordWrap = 'break-word';
		}
		if (cell.borderLeft) {
			style.borderLeft = cellBorder(cell.borderLeft);
			if (vBorders) {
				vBorders[cell.left] = true;
			}
		} else if (defaultBorder && vBorders && !vBorders[cell.left]) {
			style.borderLeft = defaultBorder;
		} else {
			left++;
			width--;
		}
		if (cell.borderTop) {
			style.borderTop = cellBorder(cell.borderTop);
			if (hBorders) {
				hBorders[cell.top] = true;
			}
		} else if (defaultBorder && hBorders && !hBorders[cell.top]) {
			style.borderTop = defaultBorder;
		} else {
			top++;
			height--;
		}
		if (cell.borderRight) {
			style.borderRight = cellBorder(cell.borderRight);
			if (vBorders) {
				vBorders[cell.right] = true;
			}
		} else if (defaultBorder && vBorders && !vBorders[cell.right]) {
			style.borderRight = defaultBorder;
		} else {
			width--;
		}
		if (cell.borderBottom) {
			style.borderBottom = cellBorder(cell.borderBottom);
			if (hBorders) {
				hBorders[cell.bottom] = true;
			}
		} else if (defaultBorder && hBorders && !hBorders[cell.bottom]) {
			style.borderBottom = defaultBorder;
		} else {
			height--;
		}
		style.left = left + 'px';
		style.top = top + 'px';
		style.width = width + 'px';
		style.height = height + 'px';
		var data = cell.value, type = typeof data;
		if (cell.format && data !== null) {
			data = kendo.spreadsheet.formatting.format(data, cell.format);
			if (data.__dataType) {
				type = data.__dataType;
			}
		} else if (data !== null && typeof data !== 'undefined' && !booleanSheet) {
			data = kendo.dom.text(data);
		}
		if (!style.textAlign) {
			switch (type) {
			case 'number':
			case 'date':
			case 'percent':
				style.textAlign = 'right';
				break;
			case 'boolean':
				style.textAlign = 'center';
				break;
			default: break;
			}
		}
		var classNames = [paneClassNames.cell];
		if (cls) {
			classNames.push(cls);
		}
		if (cell.enable === false) {
			classNames.push('k-state-disabled');
		}
		if (cell.merged) {
			classNames.push('k-spreadsheet-merged-cell');
		}
		var verticalAlign = cell.verticalAlign || 'bottom';
		if (verticalAlign && data || booleanSheet) {
			if (booleanSheet) {
				data = kendo.dom.element('div', {}, '');
				classNames.push(cell.value ? paneClassNames.booleanSelected : paneClassNames.booleanDefault);
			} else {
				data = kendo.dom.element('div', { className: 'k-vertical-align-' + verticalAlign }, [maybeLink(data)]);
			}
		} else {
			data = maybeLink(data);
		}
		var children = data ? [data] : [];
		var properties = { style: style };
		var validation = cell.validation;
		if (validation && !validation.value) {
			children.push(kendo.dom.element('span', { className: 'k-dirty' }));
			classNames.push('k-dirty-cell');
			properties.title = validation.message;
		}
		properties.className = classNames.join(' ');
		var div = kendo.dom.element('div', properties, children);
		collection.push(div);
		return div;
	}

	var viewClassNames = {
		view: 'k-spreadsheet-view',
		fixedContainer: 'k-spreadsheet-fixed-container',
		editContainer: 'k-spreadsheet-edit-container',
		scroller: 'k-spreadsheet-scroller',
		viewSize: 'k-spreadsheet-view-size',
		clipboard: 'k-spreadsheet-clipboard',
		cellEditor: 'k-spreadsheet-cell-editor',
		barEditor: 'k-spreadsheet-editor',
		topCorner: 'k-spreadsheet-top-corner',
		filterHeadersWrapper: 'k-filter-wrapper',
		filterRange: 'k-filter-range',
		filterButton: 'k-spreadsheet-filter',
		filterButtonActive: 'k-state-active',
		horizontalResize: 'k-horizontal-resize',
		verticalResize: 'k-vertical-resize',
		icon: 'k-icon',
		iconFilterDefault: 'k-i-arrow-60-down',
		sheetsBar: 'k-spreadsheet-sheets-bar',
		sheetsBarActive: 'k-spreadsheet-sheets-bar-active',
		sheetsBarInactive: 'k-spreadsheet-sheets-bar-inactive',
		cellContextMenu: 'k-spreadsheet-cell-context-menu',
		rowHeaderContextMenu: 'k-spreadsheet-row-header-context-menu',
		colHeaderContextMenu: 'k-spreadsheet-col-header-context-menu',
		scrollerHorizontalHide: 'k-spreadsheet-scroller-horizontal-hide',
		scrollerVerticalHide: 'k-spreadsheet-scroller-vertical-hide'
	};
	var paneClassNames = {
		cell: 'k-spreadsheet-cell',
		vaxis: 'k-spreadsheet-vaxis',
		haxis: 'k-spreadsheet-haxis',
		rowHeader: 'k-spreadsheet-row-header',
		columnHeader: 'k-spreadsheet-column-header',
		pane: 'k-spreadsheet-pane',
		data: 'k-spreadsheet-data',
		mergedCell: 'k-spreadsheet-merged-cell',
		mergedCellsWrapper: 'k-merged-cells-wrapper',
		activeCell: 'k-spreadsheet-active-cell',
		selection: 'k-spreadsheet-selection',
		selectionWrapper: 'k-selection-wrapper',
		autoFillWrapper: 'k-auto-fill-wrapper',
		single: 'k-single',
		top: 'k-top',
		right: 'k-right',
		bottom: 'k-bottom',
		left: 'k-left',
		resizeHandle: 'k-resize-handle',
		columnResizeHandle: 'k-column-resize-handle',
		rowResizeHandle: 'k-row-resize-handle',
		resizeHint: 'k-resize-hint',
		resizeHintHandle: 'k-resize-hint-handle',
		resizeHintMarker: 'k-resize-hint-marker',
		resizeHintVertical: 'k-resize-hint-vertical',
		selectionHighlight: 'k-spreadsheet-selection-highlight',
		series: [
			'k-series-a',
			'k-series-b',
			'k-series-c',
			'k-series-d',
			'k-series-e',
			'k-series-f'
		],
		booleanSheet: 'k-spreadsheet-boolean-sheet',
		booleanDefault: 'k-spreadsheet-boolean-sheet-default',
		booleanSelected: 'k-spreadsheet-boolean-sheet-selected'
	};
	View.classNames = viewClassNames;
	Pane.classNames = paneClassNames;

	var ExtendedPane = Pane.extend({
		init: function(sheet, grid, isFixedCell){
			this._sheet = sheet;
			this._grid = grid;
			this._isFixedCell = isFixedCell;
		},
		render: function (scrollLeft, scrollTop) {
			var classNames = Pane.classNames;
			var sheet = this._sheet;
			var grid = this._grid;
			var view = grid.view(scrollLeft, scrollTop);
			this._currentView = view;
			this._currentRect = this._rectangle(view.ref);
			this._selectedHeaders = sheet.selectedHeaders();
			var children = [];
			children.push(this.renderData());
			children.push(this.renderSelection());
			children.push(this.renderAutoFill());
			children.push(this.renderEditorSelection());
			children.push(this.renderFilterHeaders());
			if (grid.hasRowHeader) {
				var rowHeader = kendo.dom.element('div', {
					className: classNames.rowHeader,
					style: {
						width: grid.headerWidth + 'px',
						top: view.rowOffset + 'px'
					}
				});
				if (sheet._defaultHeaderStyle.fontSize) {
					rowHeader.attr.style.fontSize = sheet._defaultHeaderStyle.fontSize;
				}
				children.push(rowHeader);
				sheet.forEach(view.ref.leftColumn(), function (row) {
					if (!sheet.isHiddenRow(row)) {
						var text = sheet._rowHeaderList && (sheet._rowHeaderList[row] && sheet._rowHeaderList[row].name || sheet._rowHeaderList[row]) || row + 1, height = sheet.rowHeight(row);
						if (typeof sheet._rowHeaderList !== 'undefined' && sheet._rowHeaderList.length === 0) {
							text = 'No Data';
						}
						rowHeader.children.push(kendo.dom.element('div', {
							className: this.headerClassName(row, 'row'),
							style: {
								width: grid.headerWidth + 'px',
								height: height + 'px'
							}
						}, [kendo.dom.element('div', {
							className: 'k-vertical-align-center',
							'data-id': sheet._rowHeaderList && sheet._rowHeaderList[row] && sheet._rowHeaderList[row].id || ''
						}, [kendo.dom.text(text + '')])]));
					}
				}.bind(this));
			}
			if (grid.hasColumnHeader) {
				var columnHeader = kendo.dom.element('div', {
					className: classNames.columnHeader,
					style: {
						top: '0px',
						left: view.columnOffset + 'px',
						width: this._currentRect.width + 'px',
						height: grid.headerHeight + 'px'
					}
				});
				if (sheet._defaultHeaderStyle.fontSize) {
					columnHeader.attr.style.fontSize = sheet._defaultHeaderStyle.fontSize;
				}
				children.push(columnHeader);
				var left = 0;
				sheet.forEach(view.ref.topRow(), function (row, col) {
					if (!sheet.isHiddenColumn(col)) {
						var text = sheet._columnHeaderList && (sheet._columnHeaderList[col] && sheet._columnHeaderList[col].name || sheet._columnHeaderList[col]) || kendo.spreadsheet.Ref.display(null, Infinity, col), width = sheet.columnWidth(col);
						if (typeof sheet._columnHeaderList !== 'undefined' && sheet._columnHeaderList.length === 0) {
							text = 'No Data';
						}
						columnHeader.children.push(kendo.dom.element('div', {
							className: this.headerClassName(col, 'col'),
							style: {
								position: 'absolute',
								left: left + 'px',
								width: width + 'px',
								height: grid.headerHeight + 'px'
							}
						}, [kendo.dom.element('div', {
							className: 'k-vertical-align-center',
							'data-id': sheet._columnHeaderList && sheet._columnHeaderList[col] && sheet._columnHeaderList[col].id || ''
						}, [kendo.dom.text(text + '')])]));
						left += width;
					}
				}.bind(this));
			}
			if (sheet.resizeHandlePosition() && (grid.hasColumnHeader || grid.hasRowHeader)) {
				var ref = sheet._grid.normalize(sheet.resizeHandlePosition());
				if (view.ref.intersects(ref)) {
					//isFixedCell == false일 때에만 resizeHandle을 render
					if (!sheet.resizeHintPosition() && !this._isFixedCell) {
						children.push(this.renderResizeHandle());
					}
				}
			}
			var paneClasses = [classNames.pane];
			if (grid.hasColumnHeader) {
				paneClasses.push(classNames.top);
			}
			if (grid.hasRowHeader) {
				paneClasses.push(classNames.left);
			}
			return kendo.dom.element('div', {
				style: grid.style,
				className: paneClasses.join(' ')
			}, children);
		},
		renderData: function () {
			var sheet = this._sheet;
			var view = this._currentView;
			var cont = kendo.dom.element('div', {
				className: Pane.classNames.data,
				style: {
					position: 'relative',
					left: view.columnOffset + 'px',
					top: view.rowOffset + 'px'
				}
			});
			var rect = this._currentRect;
			var layout = kendo.spreadsheet.draw.doLayout(sheet, view.ref, { forScreen: true }), prev;
			var showGridLines = sheet._showGridLines;
			if (showGridLines) {
				prev = null;
				layout.xCoords.forEach(function (x) {
					if (x !== prev) {
						prev = x;
						cont.children.push(kendo.dom.element('div', {
							className: paneClassNames.vaxis,
							style: {
								left: x + 'px',
								height: rect.height + 'px',
								borderColor: sheet.gridLinesColor()
							}
						}));
					}
				});
				prev = null;
				layout.yCoords.forEach(function (y) {
					if (y !== prev) {
						prev = y;
						cont.children.push(kendo.dom.element('div', {
							className: paneClassNames.haxis,
							style: {
								top: y + 'px',
								width: rect.width + 'px',
								borderColor: sheet.gridLinesColor()
							}
						}));
					}
				});
			}
			var vBorders = {}, hBorders = {};
			layout.cells.forEach(function (cell) {
				var hb = hBorders[cell.col] || (hBorders[cell.col] = {});
				var vb = vBorders[cell.row] || (vBorders[cell.row] = {});
				drawCell(cont.children, cell, null, hb, vb, showGridLines, sheet._isBooleanSheet);
			});
			return cont;
		},
		renderSelection: function () {
			var classNames = Pane.classNames;
			var selections = [];
			var activeCellClasses = [classNames.activeCell];
			var selectionClasses = [classNames.selection];
			var sheet = this._sheet;
			var activeCell = sheet.activeCell().toRangeRef();
			var activeFormulaColor = this._activeFormulaColor();
			var selection = sheet.select();
			if (sheet._isBooleanSheet) {
				activeCellClasses.push(classNames.booleanSheet);
				selectionClasses.push(classNames.booleanSheet);
			}
			activeCellClasses = activeCellClasses.concat(activeFormulaColor, this._directionClasses(activeCell));
			selectionClasses = selectionClasses.concat(activeFormulaColor);
			if (sheet.singleCellSelection()) {
				activeCellClasses.push(classNames.single);
			}
			if (selection.size() === 1) {
				selectionClasses.push('k-single-selection');
			}
			if (this._sheet.autoFillPunch()) {
				selectionClasses.push('k-dim-auto-fill-handle');
			}
			selection.forEach(function (ref) {
				if (ref !== kendo.spreadsheet.NULLREF) {
					this._addDiv(selections, ref, selectionClasses.join(' '));
				}
			}.bind(this));
			this._addTable(selections, activeCell, activeCellClasses.join(' '));
			return kendo.dom.element('div', { className: classNames.selectionWrapper }, selections);
		},
		_addTable: function (collection, ref, className) {
			var self = this;
			var sheet = self._sheet;
			var view = self._currentView;
			if (view.ref.intersects(ref)) {
				var rectangle = self._rectangle(ref);
				var ed = self._sheet.activeCellCustomEditor();
				sheet.forEach(ref.collapse(), function (row, col, cell) {
					cell.left = rectangle.left;
					cell.top = rectangle.top;
					cell.width = rectangle.width;
					cell.height = rectangle.height;
					drawCell(collection, cell, className, null, null, true, sheet._isBooleanSheet);
					if (ed) {
						var btn = kendo.dom.element('div', {
							className: 'k-button k-spreadsheet-editor-button',
							style: {
								left: cell.left + cell.width + 'px',
								top: cell.top + 'px',
								height: cell.height + 'px'
							}
						});
						if (ed.icon) {
							btn.children.push(kendo.dom.element('span', { className: 'k-icon ' + ed.icon }));
						}
						collection.push(btn);
					}
				});
			}
		}
	});


	var ExtendedView = View.extend({
		_resize: function () {
			var outerHeight = kendo._outerHeight;
			var tabstripHeight = this.tabstrip ? outerHeight(this.tabstrip.element) : 0;
			var formulaBarHeight = this.formulaBar && this.options.actionbar ? outerHeight(this.formulaBar.element) : 0;
			var sheetsBarHeight = this.sheetsbar ? outerHeight(this.sheetsbar.element) : 0;
			this.wrapper.height(this.element.height() - (tabstripHeight + formulaBarHeight + sheetsBarHeight));
			if (this.tabstrip) {
				this.tabstrip.quickAccessAdjust();
			}
		},
		_chrome: function() {
			var self = this;
			var wrapper = $('<div class=\'k-spreadsheet-action-bar\' />');
			if(!self.options.actionbar) wrapper.css('display', 'none');
			wrapper.prependTo(self.element);
			var nameEditor = $('<div class=\'k-spreadsheet-name-editor\' />').appendTo(wrapper);
			self.nameEditor = new kendo.spreadsheet.NameEditor(nameEditor);
			var formulaBar = $('<div />').appendTo(wrapper);
			self.formulaBar = new kendo.spreadsheet.FormulaBar(formulaBar);
			if (self.options.toolbar) {
				self._tabstrip();
			}
		},
		isAutoFill: function (x, y, pane) {
			if (this._sheet._isBooleanSheet) {
				return false;
			}
			return View.fn.isAutoFill.call(this, x, y, pane);
		},
		objectAt: function (x, y) {
			var grid = this._sheet._grid;
			var object, pane;
			if (x < 0 || y < 0 || x > this.scroller.clientWidth || y > this.scroller.clientHeight) {
				object = { type: 'outside' };
			} else if (x < grid._headerWidth && y < grid._headerHeight) {
				object = { type: 'topcorner' };
			} else {
				pane = this.paneAt(x, y);
				if (!pane) {
					object = { type: 'outside' };
				} else {
					var row = pane._grid.rows.index(y, this.scroller.scrollTop);
					var column = pane._grid.columns.index(x, this.scroller.scrollLeft);
					var type = 'cell';
					var ref = new kendo.spreadsheet.CellRef(row, column);
					var selecting = this._sheet.selectionInProgress();
					// 해당 영역이 셀 밖의 범위인지 체크
					var isOutOfCellRange = pane._grid.rows.checkOutCellRange(y, this.scroller.scrollTop) || pane._grid.columns.checkOutCellRange(x, this.scroller.scrollLeft);
					if (isOutOfCellRange) {
						type = 'outrange';
					} else if (this.isAutoFill(x, y, pane)) {
						type = 'autofill';
					} else if (this.isFilterIcon(x, y, pane, ref)) {
						type = 'filtericon';
					} else if (!selecting && x < grid._headerWidth) {
						ref = new kendo.spreadsheet.CellRef(row, -Infinity);
						type = this.isRowResizer(y, pane, ref) ? 'rowresizehandle' : 'rowheader';
					} else if (!selecting && y < grid._headerHeight) {
						ref = new kendo.spreadsheet.CellRef(-Infinity, column);
						type = this.isColumnResizer(x, pane, ref) ? 'columnresizehandle' : 'columnheader';
					} else if (this.isEditButton(x, y)) {
						type = 'editor';
					}
					object = {
						type: type,
						ref: ref
					};
				}
			}
			object.pane = pane;
			object.x = x;
			object.y = y;
			return object;
		},
		_pane: function (row, column, rowCount, columnCount) {
			var pane = new ExtendedPane(this._sheet, this._sheet._grid.pane({
				row: row,
				column: column,
				rowCount: rowCount,
				columnCount: columnCount
			}), this.options.isFixedCell);
			pane.refresh(this.scroller.clientWidth, this.scroller.clientHeight);
			return pane;
		},
		refresh: function (reason) {
			// 전체 높이 또는 너비가 Container보다 작을 경우 스크롤바 감춤
			$(this.scroller).removeClass(viewClassNames.scrollerVerticalHide + ' ' + viewClassNames.scrollerHorizontalHide);
			if (this.element.width() > this._sheet._grid.totalWidth()) {
				$(this.scroller).addClass(viewClassNames.scrollerHorizontalHide);
			}
			if (this.element.height() > this._sheet._grid.totalHeight()) {
				$(this.scroller).addClass(viewClassNames.scrollerVerticalHide);
			}
			View.fn.refresh.call(this, reason);
		}
	});

	var alphaNumRegExp = /:alphanum$/;
	var ENTRY_ACTIONS = {
		'tab': 'next',
		'shift+tab': 'previous',
		'enter': 'lower',
		'shift+enter': 'upper',
		'delete': 'clearContents',
		'backspace': 'clearContents',
		'shift+:alphanum': 'edit',
		':alphanum': 'edit',
		'ctrl+:alphanum': 'ctrl',
		'alt+ctrl+:alphanum': 'edit',
		':edit': 'edit'
	};
	//EventListener 컨트롤을 위한 Controller 확장
	var ExtendedController = Controller.extend({
		onEntryAction: function (event, action) {
			if (event.mod) {
				var shouldPrevent = true;
				var key = String.fromCharCode(event.keyCode);
				switch (key) {
				case 'A':
					this.navigator.selectAll();
					break;
				case 'Y':
					this._workbook.undoRedoStack.redo();
					break;
				case 'Z':
					this._workbook.undoRedoStack.undo();
					break;
				default:
					shouldPrevent = false;
					break;
				}
				if (shouldPrevent) {
					event.preventDefault();
				}
			} else {
				var disabled = this._workbook.activeSheet().selection().enable() === false;
				if (action == 'delete' || action == 'backspace') {
					if (!disabled) {
						this._execute({ command: 'ClearContentCommand' });
					}
					event.preventDefault();
				} else if (alphaNumRegExp.test(action) || action === ':edit') {
					if (disabled) {
						event.preventDefault();
						return;
					}
					if (action !== ':edit') {
						this.editor.value('');
					}
					//booleanSheet가 아닐 경우 Editor 활성화
					if (!this._workbook.activeSheet()._isBooleanSheet) {
						this.activateEditor();
					}
				} else {
					this.navigator.navigateInSelection(ENTRY_ACTIONS[action]);
					event.preventDefault();
				}
			}
		},
		onMouseMove: function (event) {
			var sheet = this._workbook.activeSheet();
			if (sheet.resizingInProgress() || sheet.selectionInProgress()) {
				return;
			}
			var object = this.objectAt(event);
			//isFixedCell == false일 때에만 resizeHandle을 컨트롤
			if(!this.view.options.isFixedCell){
				if (object.type === 'columnresizehandle' || object.type === 'rowresizehandle') {
					sheet.positionResizeHandle(object.ref);
				} else {
					sheet.removeResizeHandle();
				}
			}
		},
		onMouseDown: function (event) {
			var object = this.objectAt(event);
			if (object.pane) {
				this.originFrame = object.pane;
			}
			if (object.type === 'editor') {
				this.onEditorEsc();
				this.openCustomEditor();
				event.preventDefault();
				return;
			}
			if (this.editor.canInsertRef(false) && object.ref) {
				this._workbook.activeSheet()._setFormulaSelections(this.editor.highlightedRefs());
				this.navigator.startSelection(object.ref, this._selectionMode, this.appendSelection, event.shiftKey);
				event.preventDefault();
				return;
			}
			this._preventNavigation = false;
			this.editor.deactivate();
			if (this._preventNavigation) {
				return;
			}
			var sheet = this._workbook.activeSheet();
			//isFixedCell == false일 때에만 resize
			if(!this.view.options.isFixedCell){
				if (object.type === 'columnresizehandle' || object.type === 'rowresizehandle') {
					sheet.startResizing({
						x: object.x,
						y: object.y
					});
					event.preventDefault();
					return;
				}
			}
			if (object.type === 'filtericon') {
				this.openFilterMenu(event);
				event.preventDefault();
				return;
			}
			this._selectionMode = SELECTION_MODES[object.type];
			this.appendSelection = event.mod;
			this.navigator.startSelection(object.ref, this._selectionMode, this.appendSelection, event.shiftKey);
		},
		onContextMenu: function (event) {
			if(!this._workbook.activeSheet()._isBooleanSheet) Controller.fn.onContextMenu.call(this, event);
		},
		onMouseDrag: function (event) {
			if (this._selectionMode !== 'extra') Controller.fn.onMouseDrag.call(this, event);
		},
		onMouseUp: function (event) {
			var sheet = this._workbook.activeSheet();
			sheet.completeResizing();
			this.navigator.completeSelection(this._selectionMode);
			this.stopAutoScroll();
			var editor = this.editor.activeEditor();
			if (!editor) {
				return;
			}
			var el = event.target;
			while (el) {
				if (el === editor.element[0]) {
					return;
				}
				el = el.parentNode;
			}
			var object = this.objectAt(event);
			if (object && object.ref && editor.canInsertRef(false)) {
				editor.refAtPoint(sheet.selection()._ref);
				sheet._setFormulaSelections(editor.highlightedRefs());
			}
		},
		onDblClick: function (event) {
			var object = this.objectAt(event);
			var disabled = this._workbook.activeSheet().selection().enable() === false;
			var isBooleanSheet = this._workbook.activeSheet()._isBooleanSheet;
			if (object.type !== 'cell' || disabled) {
				return;
			}
			//booleanSheet일 때 편집모드 진입 금지
			if(!isBooleanSheet){
				this.editor.activate({
					range: this._workbook.activeSheet()._viewActiveCell(),
					rect: this.view.activeCellRectangle(),
					tooltip: this._activeTooltip()
				}).focus();
				this.onEditorUpdate();
			}
		}
	});

	var ExtendSheetDataSourceBinder = kendo.spreadsheet.SheetDataSourceBinder.extend({
		_change: function () {
			if (this._skipRebind) {
				return;
			}
			var data = this.dataSource.view();
			var columns = this.columns;
			if (!columns.length && data.length) {
				this.columns = columns = this._normalizeColumns(Object.keys(data[0].toJSON()));
				this._header();
			}
			var getters = columns.map(function (column) {
				return kendo.getter(column.field);
			});
			this.sheet.batch(function () {
				var length = Math.max(data.length, this._boundRowsCount);
				for (var idx = 0; idx < length; idx++) {
					for (var getterIdx = 0; getterIdx < getters.length; getterIdx++) {
						var value = data[idx] ? getters[getterIdx](data[idx]) : null;
						if (this.sheet._isBooleanSheet) {
							this.sheet.range(idx, getterIdx).value(value);
						} else {
							this.sheet.range(idx + 1, getterIdx).value(value);
						}
					}
				}
			}.bind(this));
			this._boundRowsCount = data.length;
		}
	});
	kendo.spreadsheet.SheetDataSourceBinder = ExtendSheetDataSourceBinder;

	var extendSpreadsheet = Spreadsheet.extend({
		options: {
			actionbar: true,
			isFixedCell: false,
			defaultHeaderStyle: {
				fontSize: '12px'
			}
		},
		init: function(element, options) {
			Widget.fn.init.call(this, element, options);
			this.element.addClass(Spreadsheet.classNames.wrapper);
			this._view = new ExtendedView(this.element, {
				messages: this.options.messages.view,
				toolbar: this.options.toolbar,
				sheetsbar: this.options.sheetsbar,
				actionbar: this.options.actionbar,
				isFixedCell: this.options.isFixedCell
			});
			this._workbook = new ExtendedWorkbook(this.options, this._view);
			this._controller = new ExtendedController(this._view, this._workbook);
			this._autoRefresh = true;
			this._bindWorkbookEvents();
			this._view.workbook(this._workbook);
			this.refresh();
			this._resizeHandler = function () {
				this.resize();
			}.bind(this);
			$(window).on('resize' + NS, this._resizeHandler);
		},
		//문제가 많아서 Deprecated
		// setRowHeaderList: function(rowHeaderList) {
		// 	var sheet = this._workbook.activeSheet();
		// 	sheet._rowHeaderList = rowHeaderList;
		// 	sheet._rows = new kendo.spreadsheet.Axis(rowHeaderList.length, this.options.rowHeight);
		// 	sheet._grid = new kendo.spreadsheet.Grid(sheet._rows, sheet._columns, sheet._rowHeaderList.length, sheet._columnHeaderList.length, this.options.headerHeight, this.options.columnWidth);
		// 	this.refresh();
		// },
		// setColumnHeaderList: function(columnHeaderList) {
		// 	var sheet = this._workbook.activeSheet();
		// 	sheet._columnHeaderList = columnHeaderList;
		// 	sheet._columns = new kendo.spreadsheet.Axis(columnHeaderList.length, this.options.columnWidth);
		// 	sheet._grid = new kendo.spreadsheet.Grid(sheet._rows, sheet._columns, sheet._rowHeaderList.length, sheet._columnHeaderList.length, this.options.headerHeight, this.options.columnWidth);
		// 	this.refresh();
		// },
		_workbookSelect: function(e) {
			var self = this;
			var sheet = self._workbook.activeSheet();
			var range = e.range;
			var ref = range._ref, refs, i;
			e.selection = [];
			if(ref instanceof kendo.spreadsheet.UnionRef){
				refs = ref.refs;
				for(i = 0; i < refs.length; i++){
					e.selection = e.selection.concat(getRowColumnIdFromRef(refs[i], sheet._rowHeaderList, sheet._columnHeaderList));
				}
			}else{
				e.selection = e.selection.concat(getRowColumnIdFromRef(ref, sheet._rowHeaderList, sheet._columnHeaderList));
			}
			if ((typeof sheet._rowHeaderList !== 'undefined' && sheet._rowHeaderList.length === 0) || (typeof sheet._columnHeaderList !== 'undefined' && sheet._columnHeaderList.length === 0)) {
				return;
			}
			this.trigger('select', e);
		},
		getBooleanData: function(index) {
			var sheets = this._workbook.sheets();
			if (index > -1) {
				return sheets[index].getBooleanData();
			}
			var result = [], i;
			for (i = 0; i < sheets.length; i++) {
				result.push(sheets[i].getBooleanData());
			}
			return result;
		},
		//filter: dataSource.filter와 동일(eq, neq, contains만 지원)
		//headerType: 'row', 'column'
		headerFilter: function (headerType, filter) {
			var sheet = this._workbook.activeSheet();
			var lists = {row: sheet._rowHeaderList, column: sheet._columnHeaderList}, list = lists[headerType];
			var func = {row: {hide: sheet.hideRow, unhide: sheet.unhideRow}, column: {hide: sheet.hideColumn, unhide: sheet.unhideColumn}};
			var logic, filters, operator;
			var i, j, showIdx = [], hideIdx = [];
			if (!list) {
				return;
			}
			if (typeof filter.length === 'number') {
				filters = filter;
				logic = 'and';
			} else if (filter.field) {
				filters = [filter];
				logic = 'and';
			} else {
				filters = filter.filters;
				logic = filter.logic;
			}
			//선택 해제
			sheet.select(kendo.spreadsheet.FIRSTREF);
			//필터링
			if (logic === 'or') {
				//필터링 적용 전 필터 해제
				for (i = 0; i < list.length; i++) {
					func[headerType].hide.call(sheet, i);
				}
				for (i = 0; i < filters.length; i++) {
					operator = filters[i].operator;
					for (j = 0; j < list.length; j++) {
						if (operator === 'eq') {
							if (list[j][filters[i].field] == filters[i].value) {
								showIdx.push(j);
							}
						} else if (operator === 'neq') {
							if (list[j][filters[i].field] != filters[i].value) {
								showIdx.push(j);
							}
						} else if (operator === 'contains') {
							if (list[j][filters[i].field].toString().indexOf(filters[i].value) != -1) {
								showIdx.push(j);
							}
						}
					}
				}
			} else if (logic === 'and') {
				//필터링 적용 전 필터 해제
				for (i = 0; i < list.length; i++) {
					func[headerType].unhide.call(sheet, i);
				}
				for (i = 0; i < filters.length; i++) {
					operator = filters[i].operator;
					for (j = 0; j < list.length; j++) {
						if (operator === 'eq') {
							if (list[j][filters[i].field] != filters[i].value) {
								hideIdx.push(j);
							}
						} else if (operator === 'neq') {
							if (list[j][filters[i].field] == filters[i].value) {
								hideIdx.push(j);
							}
						} else if (operator === 'contains') {
							if (list[j][filters[i].field].toString().indexOf(filters[i].value) == -1) {
								hideIdx.push(j);
							}
						}
					}
				}
			}
			for (i = 0; i < showIdx.length; i++) {
				func[headerType].unhide.call(sheet, showIdx[i]);
			}
			for (i = 0; i < hideIdx.length; i++) {
				func[headerType].hide.call(sheet, hideIdx[i]);
			}
		}
	});

	function getRowColumnIdFromRef(ref, rowHeaderList, columnHeaderList) {
		var ids = [];
		if(ref instanceof kendo.spreadsheet.CellRef){
			ids.push({
				rowId: rowHeaderList && rowHeaderList[ref.row] && rowHeaderList[ref.row].id || '',
				columnId: columnHeaderList && columnHeaderList[ref.col] && columnHeaderList[ref.col].id || ''
			});
		}else if(ref instanceof kendo.spreadsheet.RangeRef){
			var br = ref.bottomRight, tl = ref.topLeft, i, j;
			for(i = tl.row; i <= br.row; i++){
				for(j = tl.col; j <= br.col; j++){
					ids.push({
						rowId: rowHeaderList && rowHeaderList[i] && rowHeaderList[i].id || '',
						columnId: columnHeaderList && columnHeaderList[j] && columnHeaderList[j].id || ''
					});
				}
			}
		}
		return ids;
	}

	function parseDataSourceForBooleanSheet (dataSource, key, rowh, colh) {
		var result = [], keys, i, dataLength = dataSource.length, hasValue, tmp, element, rowId, colId;
		var rowIdx, colIdx, rowhLength = rowh && rowh.length || 0, colhLength = colh && colh.length || 0;

		keys = key && key.split('.') || [];
		for (rowIdx = 0; rowIdx < rowhLength; rowIdx++) {
			rowId = rowh[rowIdx].id;
			element = null;
			for (i = 0; i < dataLength; i++) {
				if (dataSource[i].id === rowId) {
					element = dataSource[i];
					continue;
				}
			}
			element = element ? element : {};
			for (i = 0; i < keys.length; i++) {
				element = element[keys[i]] ? element[keys[i]] : {};
			}

			tmp = {};
			for (colIdx = 0; colIdx < colhLength; colIdx++) {
				hasValue = false;
				colId = colh[colIdx].id;
				for (i = 0; i < element.length; i++) {
					if (element[i] == colId) {
						hasValue = true;
						continue;
					}
				}
				tmp[keys[keys.length - 1] + '_' + colId] = hasValue;
			}
			result.push(tmp);
		}
		return result;
	}

	ui.plugin(extendSpreadsheet);
})(window, jQuery);

//# sourceURL=widget/common-spreadsheet.js
