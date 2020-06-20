/**
*
*   <ul>
*       <li>공용 TreeList UI Component</li>
*       <li>Kendo UI의 TreeList Widget을 상속받아 추가 구현되었다.</li>
*       <li>체크 박스 이벤트에 대한 추가 확장 구현</li>
*       <li>선택 시, 셀렉션 동작에 대한 추가 확장 구현</li>
*   </ul>
*   @module app/widget/common-tree-list
*   @requires lib/kendo.all
*
*/

(function(window, $){
	var kendo = window.kendo, ui = kendo.ui;
	var TreeList = ui.TreeList;
	var DataBoundWidget = ui.DataBoundWidget;
	var NS = '.kendoTreeList';

	var extend = $.extend;
	var kendoDom = kendo.dom;
	var kendoDomElement = kendoDom.element;
	var kendoTextElement = kendoDom.text;
	var kendoHtmlElement = kendoDom.html;
	var TreeListDataSource = kendo.data.TreeListDataSource;
	var proxy = $.proxy;
	var map = $.map;
	var CHANGE = 'change';
	var ERROR = 'error';
	var PROGRESS = 'progress';
	var EXPAND = 'expand';
	var COLLAPSE = 'collapse';
	var DRAGSTART = 'dragstart';
	var DRAG = 'drag';
	var DROP = 'drop';
	var DRAGEND = 'dragend';

	var DEFAULT_CHECKBOX_COLUMN_WIDTH = 37;

	var classNames = {
		wrapper: 'k-treelist k-grid k-widget',
		header: 'k-header',
		button: 'k-button',
		alt: 'k-alt',
		editCell: 'k-edit-cell',
		group: 'k-treelist-group',
		gridToolbar: 'k-grid-toolbar',
		gridHeader: 'k-grid-header',
		gridHeaderWrap: 'k-grid-header-wrap',
		gridContent: 'k-grid-content',
		gridContentWrap: 'k-grid-content',
		gridFilter: 'k-grid-filter',
		footerTemplate: 'k-footer-template',
		loading: 'k-i-loading',
		refresh: 'k-i-reload',
		retry: 'k-request-retry',
		selected: 'k-state-selected',
		status: 'k-status',
		link: 'k-link',
		withIcon: 'k-with-icon',
		filterable: 'k-filterable',
		icon: 'k-icon',
		iconFilter: 'k-i-filter',
		iconCollapse: 'k-i-collapse',
		iconExpand: 'k-i-expand',
		iconHidden: 'k-i-none',
		iconPlaceHolder: 'k-icon k-i-none',
		input: 'k-input',
		dropPositions: 'k-i-insert-up k-i-insert-down k-i-plus k-i-insert-middle',
		dropTop: 'k-i-insert-up',
		dropBottom: 'k-i-insert-down',
		dropAdd: 'k-i-plus',
		dropMiddle: 'k-i-insert-middle',
		dropDenied: 'k-i-cancel',
		dragStatus: 'k-drag-status',
		dragClue: 'k-drag-clue',
		dragClueText: 'k-clue-text'
	};

	function createPlaceholders(options) {
		var spans = [];
		var className = options.className;
		for (var i = 0, level = options.level; i < level; i++) {
			spans.push(kendoDomElement('span', { className: className }));
		}
		return spans;
	}

	var extendTreeList = ui.TreeList = TreeList.extend({
		options : {
			hasSelectedModel : false,
			enableShiftSelection : false,
			setSelectedAttribute : false,
			hasCheckedModel : false,
			setCheckedAttribute : false,
			hasRadioModel : false,
			checkedLimit : false,
			selectedLimit : false,
			isGroupListMode : false,
			onceExpandParentLevel : null,
			hasDoubleClickEvt : false,
			isOnlySelection : false,
			isOnlyChildrenSelectable : false,
			events : [
				"checked",
				"checkedLimit"
			]
		},
		_draggable: function () {
	        var editable = this.options.editable;
	        if (!editable || !editable.move) {
	            return;
	        }
	        this._dragging = new kendo.ui.HierarchicalDragAndDrop(this.wrapper, {
	            $angular: this.$angular,
	            autoScroll: true,
	            filter: 'tbody>tr',
	            itemSelector: 'tr',
	            allowedContainers: this.wrapper,
	            hintText: function (row) {
	                var text = function () {
	                    return $(this).text();
	                };
	                var separator = '<span class=\'k-header k-drag-separator\' />';
	                return row.children('td').map(text).toArray().join(separator);
	            },
	            contains: proxy(function (source, destination) {
	                var dest = this.dataItem(destination);
	                var src = this.dataItem(source);
	                return src == dest || this.dataSource.contains(src, dest);
	            }, this),
	            itemFromTarget: function (target) {
	                var tr = target.closest('tr');
	                return {
	                    item: tr,
	                    content: tr
	                };
	            },
	            dragstart: proxy(function (source) {
	                this.wrapper.addClass('k-treelist-dragging');
	                var model = this.dataItem(source);
	                return this.trigger(DRAGSTART, { source: model });
	            }, this),
	            drag: proxy(function (e) {
	                e.source = this.dataItem(e.source);
	                this.trigger(DRAG, e);
	            }, this),
	            drop: proxy(function (e) {
	                e.source = this.dataItem(e.source);
	                e.destination = this.dataItem(e.destination);
	                this.wrapper.removeClass('k-treelist-dragging');
	                return this.trigger(DROP, e);
	            }, this),
	            dragend: proxy(function (e) {
	                var dest = this.dataItem(e.destination);
	                var src = this.dataItem(e.source);
					var options = this.options;
					if(!options.customDragEndEvent) src.set('parentId', dest ? dest.id : null);
	                e.source = src;
	                e.destination = dest;
	                this.trigger(DRAGEND, e);
	            }, this),
	            reorderable: false,
	            dropHintContainer: function (item) {
	                return item.children('td:eq(1)');
	            },
	            dropPositionFrom: function (dropHint) {
	                return dropHint.prevAll('.k-i-none').length > 0 ? 'after' : 'before';
	            }
	        });
	    },
		init: function (element, options) {
			if(typeof options.messages === "undefined" || typeof options.messages.noRows === "undefined"){
				var I18N = window.I18N;
				if(!options.messages){
					options.messages = {};
				}
				options.messages.noRows = I18N.prop("COMMON_NO_DATA_AVAILABLE_GRID");
			}
			this._createCheckedColumn(options);
			DataBoundWidget.fn.init.call(this, element, options);
			if(this.options.isGroupListMode) this._currentExpandedModel = {};
			this._dataSource(this.options.dataSource);
			this._columns();
			this._layout();
			this._selectable();
			this._sortable();
			this._resizable();
			this._filterable();
			this._attachEvents();
			this._toolbar();
			this._scrollable();
			this._reorderable();
			this._columnMenu();
			this._minScreenSupport();
			this._draggable();
			if (this.options.autoBind) {
				this.dataSource.fetch();
			}
			if (this._hasLockedColumns) {
				var widget = this;
				this.wrapper.addClass('k-grid-lockedcolumns');
				this._resizeHandler = function () {
					widget.resize();
				};
				$(window).on('resize' + NS, this._resizeHandler);
			}
			kendo.notify(this);

			this._createCheckedModel();
			//this._attachGroupModeEvt();
		},
		_columns: function () {
			var columns = this.options.columns || [];
			this.columns = map(columns, function (column) {
				column = typeof column === 'string' ? { field: column } : column;
				return extend({ encoded: true }, column);
			});
			var lockedColumns = this._lockedColumns();
			if (lockedColumns.length > 0) {
				this._hasLockedColumns = true;
				this.columns = lockedColumns.concat(this._nonLockedColumns());
			}
			this._ensureExpandableColumn();
			this._columnTemplates();
			this._columnAttributes();
		},
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

			/*if(!this.groupCheckBox){
				this.groupCheckBox = {};
			}*/

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
			elem.on("click", "tr:not(.k-treelist-group) .grid-checkbox-cell .k-checkbox", function(e){
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
				var parent;
				if(item && item.parent_id){
					parent = that.dataSource.get(item.parent_id);
					that.setGroupCheckbox(parent);
				}
				that.setHeaderCheckbox();

				that.trigger("checked", { isHeader : false, item : item, checkbox : self });
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

			elem.on("click", "tr.k-treelist-group .grid-checkbox-cell .k-checkbox", function(e){
				var self = $(this);
				var item = that._findItemFromCheckbox(self);
				var checked = self.prop("checked");
				var data;
				var checkedLimit = that.options.checkedLimit;
				//최대 체크 가능한 값을 넘을 경우 체크되지 않도록한다.
				if(checkedLimit !== false && checkedLimit != 0 && checked){
					var checkedData = that.getCheckedData();
					if(checkedData.length >= checkedLimit){
						return false;
					}
				}

				item.checked = checked;
				//var dv = ds.view();
				//var i, max = dv.length;
				that.trigger("dataBinding");
				if(checked){
					data = that.checkGroup(true, item, true);
				}else{
					data = that.checkGroup(true, item, false);
				}
				data = new kendo.data.Query(data).filter({logic : 'and',
					filters : [{ field : "checked", operator : "eq", value : checked }, { field : "hasChildren", operator : "eq", value : false }]});

				//that.setGroupCheckbox(item);
				//that.setHeaderCheckbox();
				that.dataSource.fetch();
				var evt = { isGroupHeader : true, parent : parent, item : data, checkbox : self, checked : checked };
				that.trigger("dataBound", evt);
				that.trigger("checked", evt);
			});

			this.bind("dataBound", function(e){
				this.setHeaderCheckbox();
			});
		},
		_findItemFromCheckbox : function(checkboxElem){
			var ds = this.dataSource;
			var tr = checkboxElem.closest("tr");
			var id = tr.attr("data-id");
			var item = ds.get(id);
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
				column.width = DEFAULT_CHECKBOX_COLUMN_WIDTH;
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
					"class" : "grid-checkbox-header k-header"
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
		*   <li>Default 체크박스 템플릿 함수</li>
		*   </ul>
		*   @function _checkedModelTemplate
		*   @param {Object} data - 템플릿으로 렌더링 될 Data
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		_checkedModelTemplate : function(data){
			var id = data.id;
			var uid = data.uid;
			var checked = data.checked ? "checked" : "";
			return '<input type="checkbox" id="check_' + id + '_' + uid + '" class="k-checkbox" ' + checked + '>' + '<label for="check_' + id + '_' + uid + '" class="k-checkbox-label"></label>';
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
			var that = this;
			var ds = that.dataSource;
			//var dv = ds.flatView();
			var dv = ds.data();
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);
					dv = query.toArray();
					//console.log(dv.length);
				}else{
					dv = ds.flatView();
				}
			}
			var options = that.options;
			var checkedLimit = options.checkedLimit;
			if(checkedLimit !== false && checkedLimit != 0){
				maxLength = checkedLimit;
			}

			var lastLevelChildren = new kendo.data.Query(dv).filter({ field : "hasChildren", operator : "eq", value : false }).toArray();
			var child, lastLevelSize = lastLevelChildren.length;

			var checkedData = new kendo.data.Query(lastLevelChildren).filter({ field : "checked", operator : "eq", value : true}).toArray();
			if(checkedData.length && maxLength) maxLength -= checkedData.length;

			maxLength = (maxLength >= lastLevelSize) ? lastLevelSize : maxLength;
			var i, max = maxLength ? maxLength : lastLevelSize;
			var parentIds = [];
			for( i = 0; i < max; i++ ){
				child = lastLevelChildren[i];
				child.checked = true;
				if(parentIds.indexOf(child.parent_id) == -1) parentIds.push(child.parent_id);
			}
			max = parentIds.length;
			var parentId, parent;
			for( i = 0; i < max; i++ ){
				parentId = parentIds[i];
				parent = ds.get(parentId);
				if(parent) this.setSubGroupCheckbox(parent, true);
			}
			ds.fetch();
		},
		checkByIds : function(idList, isChecked, maxLength, isView){
			var that = this;
			var ds = that.dataSource;
			//var dv = ds.flatView();
			var dv = ds.data();
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);
					dv = query.toArray();
					//console.log(dv.length);
				}else{
					dv = ds.flatView();
				}
			}
			var options = that.options;
			var checkedLimit = options.checkedLimit;
			if(checkedLimit !== false && checkedLimit != 0){
				maxLength = checkedLimit;
			}

			var lastLevelChildren = new kendo.data.Query(dv).filter({ field : "hasChildren", operator : "eq", value : false }).toArray();
			var child, lastLevelSize = lastLevelChildren.length;

			var checkedData = new kendo.data.Query(lastLevelChildren).filter({ field : "checked", operator : "eq", value : true}).toArray();
			if(checkedData.length && maxLength) maxLength -= checkedData.length;

			maxLength = (maxLength >= lastLevelSize) ? lastLevelSize : maxLength;
			var i, max = maxLength ? maxLength : lastLevelSize;
			var j, idListSize = idList.length;
			var parentIds = [];
			for( i = 0; i < max; i++ ){
				child = lastLevelChildren[i];
				for(j = 0; j < idListSize; j++){
					if(child.id == idList[j]){
						child.checked = isChecked;
						if(parentIds.indexOf(child.parent_id) == -1) parentIds.push(child.parent_id);
					}
				}
			}
			max = parentIds.length;
			var parentId, parent;
			for( i = 0; i < max; i++ ){
				parentId = parentIds[i];
				parent = ds.get(parentId);
				if(parent) this.setSubGroupCheckbox(parent, true);
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

			var parent;
			if(data && data.parent_id){
				parent = that.dataSource.get(data.parent_id);
				that.setGroupCheckbox(parent);
			}
			that.setHeaderCheckbox();
		},
		checkByData : function(data, checked){
			var that = this, id = data.id;
			var options = that.options;
			var checkedLimit = options.checkedLimit;
			//최대 체크 가능한 값을 넘을 경우 체크되지 않도록한다.
			if(checkedLimit !== false && checkedLimit != 0 && checked){
				var checkedData = that.getCheckedData();
				if(checkedData.length >= checkedLimit){
					return false;
				}
			}
			data.checked = checked;
			this.element.find("tr[data-id='" + id + "'] .grid-checkbox-cell .k-checkbox").prop("checked", checked);

			var parent;
			if(data && data.parent_id){
				parent = that.dataSource.get(data.parent_id);
				that.setGroupCheckbox(parent);
			}
			that.setHeaderCheckbox();
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
				if(dv[i].hasCheckedChild) dv[i].hasCheckedChild = false;
				dv[i].checked = false;
			}
			ds.fetch();
		},
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

			var checkedLimit = this.options.checkedLimit;
			if(checkedLimit !== false && checkedLimit != 0){
				var checkedData = this.getCheckedData();
				if(checkedData.length < checkedLimit) isAllChecked = false;
			}else{
				for( i = 0; i < max; i++ ){
					if(!dv[i].checked){
						isAllChecked = false;
						break;
					}
				}
			}

			return isAllChecked;
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
		/**
		*   <ul>
		*   <li>hasCheckedModel 옵션이 존재하고 현재 DataSource에 Group이 적용되어 있을 경우 하위 Group의 체크 박스가 선택되어 있으면 상위 Group의 전체 체크 박스가 체크되도록 UI를 업데이트한다.</li>
		*   </ul>
		*   @function setGroupCheckbox
		*   @returns {void}
		*   @param {Model} item - 자식 아이템들의 체크가 전체 체크 상태인지 체크할 부모 아이템
		*   @alias module:app/widget/common-grid
		*
		*/
		setGroupCheckbox : function(item){
			this.setSubGroupCheckbox(item);
		},
		setSubGroupCheckbox : function(item, isOnlyData){
			//console.log("setSubGroupCheckbox");
			//console.log(item);
			var ds = this.dataSource;
			var checkedState, isChecked, hasCheckedChild, checkbox, tr, parent, id = item.id, parentId = item.parent_id;
			checkedState = this.isCheckedAllGroup(item);
			isChecked = checkedState.isCheckedAll;
			hasCheckedChild = checkedState.hasCheckedChild;

			item.checked = isChecked;
			if(!isOnlyData){
				checkbox = this.getGroupCheckbox(id);
				checkbox.prop("checked", isChecked);
				tr = checkbox.closest("tr");
				if(hasCheckedChild) tr.addClass("has-checked-child");
				else tr.removeClass("has-checked-child");
			}

			if(parentId){
				parent = ds.get(parentId);
				this.setSubGroupCheckbox(parent, isOnlyData);
			}
		},
		getGroupCheckbox : function(id){
			var checkbox = this.element.find("tr.k-treelist-group[data-id='" + id + "'] .grid-checkbox-cell .k-checkbox");
			return checkbox;
		},
		/**
		*   <ul>
		*   <li>하위 Group이 전체 체크되어있는지 체크한다.</li>
		*   </ul>
		*   @function isCheckedAllGroup
		*   @param {Model} item - 체크할 Group의 Item
		*   @param {String|Number|Boolean} value - 체크할 Group의 Field가 가진 값
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		isCheckedAllGroup : function(item){
			var parentId = item.id;
			/*if(!this.groupCheckBox[parentId]){
				this.groupCheckBox[parentId] = {};
			}*/

			var ds = this.dataSource;
			//뷰 기준으로 수정
			//var data = ds.data();
			var data = ds.flatView();
			var result = new kendo.data.Query(data).filter({ field : "parent_id", operator : "eq", value : parentId }).toArray();

			var options = this.options;
			var maxLength, checkedLimit = options.checkedLimit;
			if(checkedLimit !== false && checkedLimit != 0){
				maxLength = checkedLimit;
			}

			var max = result.length;
			var cnt  = 0;
			var isCheckedAll = true;
			var hasCheckedChild = false;

			var checkedData = new kendo.data.Query(result).filter({ field : "checked", operator : "eq", value : true }).toArray();
			var checkedChildData = new kendo.data.Query(result).filter({ field : "hasCheckedChild", operator : "eq", value : true }).toArray();
			cnt = checkedData.length;
			if(cnt > 0 || checkedChildData.length > 0) hasCheckedChild = true;
			if(!maxLength && cnt != max) isCheckedAll = false;

			if(maxLength){
				max = (maxLength >= result.length) ? result.length : maxLength;
				if(cnt < max) isCheckedAll = false;
			}
			//this.groupCheckBox[parentId] = isCheckedAll;

			item.hasCheckedChild = hasCheckedChild;

			return {
				isCheckedAll : isCheckedAll,
				hasCheckedChild : hasCheckedChild
			};
		},
		/**
		*   <ul>
		*   <li>Group 체크 박스를 체크한다.</li>
		*   </ul>
		*   @function checkGroup
		*   @param {Boolean} isView - 현재 보이는 View만 체크할지 여부
		*   @param {parentItem} parentItem - 체크할 Group의 Model
		*   @param {Boolean} isChecked - 체크 여부
		*   @param {Number} maxLength - 제한할 최대 체크 개수
		*   @returns {void}
		*   @alias module:app/widget/common-grid
		*
		*/
		checkGroup : function(isView, parentItem, isChecked, maxLength){
			var parentId = parentItem.id;
			/*if(!this.groupCheckBox[parentId]){
				this.groupCheckBox[parentId] = {};
			}

			this.groupCheckBox[parentId] = isChecked;*/

			var ds = this.dataSource;
			var data;
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);

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
				filters : [{ field : "parent_id", operator : "eq", value : parentId}]
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
					filters : [{ field : "checked", operator : "eq", value : isChecked}, { field : "hasChildren", operator : "eq", value : false}]
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
				//console.log(checkedData);
				//console.log("checkedlength : " + checkedData.length);
				maxLength -= checkedData.length;
				//console.log("max length :" + maxLength);
				max = (maxLength >= result.length) ? result.length : maxLength;
				//console.log("max :" + max);
				//max는 체크 가능한 개수다.
				var size = result.length;
				var cnt = 0;
				for(i = 0; i < size; i++){
					if(result[i].hasChildren){
						this.checkGroup(isView, result[i], isChecked, maxLength);
						this.setSubGroupCheckbox(result[i], true);
					}else{
						result[i].checked = isChecked;
						cnt++;
					}
					//Lmit 개수가 체크 되었을 경우 break
					if(cnt >= max) break;
				}
				if(cnt > 0){
					parentItem.hasCheckedChild = isChecked;
					this.setSubGroupCheckbox(parentItem, true);
				}

			}else{
				//Default 체크 박스 동작
				//Limit 시, 그룹 체크 해제는 Limit이 없으므로 Default 체크 박스 동작으로 수행
				max = result.length;
				for(i = 0; i < max; i++){
					if(result[i].hasChildren){
						this.checkGroup(isView, result[i], isChecked, maxLength);
						this.setSubGroupCheckbox(result[i], true);
					}else{
						result[i].checked = isChecked;
					}
				}
				parentItem.hasCheckedChild = isChecked;
				this.setSubGroupCheckbox(parentItem, true);
			}

			/*result = new kendo.data.Query(result).filter({
				logic : 'and',
				filters : [{ field : "checked", operator : "eq", value : isChecked}]
			}).toArray();

			max = result.length;
			for( i = 0; i < max; i++ ){
				if(result[i].hasChildren) this.checkGroup(true, result[i], isChecked, maxLength);
			}*/

			return data;
		},
		hasSelectedChild : function(parent){
			var ds = this.dataSource;
			var data = ds.data();
			var query = new kendo.data.Query(data).filter({ logic : "and", filters : [
				{ field : "parent_id", operator : "eq", value : parent.id },
				{ logic : "or", filters : [
					{ field : "selected", operator : "eq", value : true },
					{ field : "hasCheckedChild", operator : "eq", value : true}
				]}
			]}).toArray();
			return query.length > 0;
		},
		updateParentSelected : function(data){
			var that = this, element = this.element;
			var tr, parent = that.dataSource.parentNode(data);
			if(parent){
				tr = element.find("tr[data-id='" + parent.id + "']");
				if(that.hasSelectedChild(parent)){
					parent.hasCheckedChild = true;
					tr.addClass("has-checked-child");
				}else{
					parent.hasCheckedChild = false;
					tr.removeClass("has-checked-child");
				}
				if(parent.parent_id) that.updateParentSelected(parent);
			}
		},
		_selectable: function () {
			var selectable = this.options.selectable, isOnlyChildrenSelectable = this.options.isOnlyChildrenSelectable;
			var filter, groupFilter;
			var element = this.table;
			var that = this;
			var useAllItems;
			if (selectable) {
				selectable = kendo.ui.Selectable.parseOptions(selectable);
				if (this._hasLockedColumns) {
					element = element.add(this.lockedTable);
					useAllItems = selectable.multiple && selectable.cell;
				}
				//b.IoT 컴포넌트 다중 셀렉션은 부모가 선택되지 않는다.
				if(selectable.multiple || isOnlyChildrenSelectable) groupFilter = ":not(.k-treelist-group)";
				else groupFilter = "";	//싱글 셀렉션은 부모가 선택된다. (HMI File List 등)

				filter = '>tbody>tr:not(.k-footer-template)' + groupFilter;
				if (selectable.cell) {
					filter = filter + '>td';
				}
				this.selectable = new kendo.ui.Selectable(element, {
					filter: filter,
					aria: true,
					multiple: selectable.multiple,
					hasSelectedModel : that.options.hasSelectedModel,
					enableShiftSelection : that.options.enableShiftSelection,
					hasDoubleClickEvt : that.options.hasDoubleClickEvt,
					isOnlySelection : that.options.isOnlySelection,
					change: function(e){
						//proxy(this._change, this),
						var arg = {};
						if(that.options.hasSelectedModel){
							var target = $(e.sender.userEvents.currentTarget);
							var item, uid = target.data("uid");
							if(uid){
								item = that.dataSource.getByUid(uid);
							}
							if(item){
								var selectedData, hasSelected = target.hasClass("k-state-selected");
								if(hasSelected && that.options.selectedLimit){
									var ds = that.dataSource;
									var data = ds.data();
									var query = new kendo.data.Query(data).filter({
										field : "selected", operator : "eq", value : true
									});
									selectedData = query.toArray();
									if(selectedData.length >= that.options.selectedLimit){
										target = $(e.sender.userEvents.currentTarget);
										target.removeClass("k-state-selected");
										return false;
									}
								}

								if(!this.options.multiple){
									//싱글 셀렉션 모드 일 경우 기존 선택했던 Selected 값을 해제
									selectedData = that.getSelectedData();
									var i, max = selectedData.length;
									for( i = 0; i < max; i++ ){
										selectedData[i].selected = false;
									}
								}

								item.selected = hasSelected;
								/*if(hasSelected){
									that.selectedIds.push(item.id);
								}else{
									var idx = that.selectedIds.indexOf(item.id);
									that.selectedIds.splice(idx, 1);
								}*/
								that.updateParentSelected(item);
								arg.item = item;
							}
						}
						arg.isDoubleClick = this._isDblClick;
						that.trigger(CHANGE, arg);
						//that.trigger.call(this,(CHANGE, arg);
					},
					useAllItems: useAllItems,
					continuousItems: proxy(this._continuousItems, this, filter, selectable.cell),
					relatedTarget: !selectable.cell && this._hasLockedColumns ? proxy(this._selectableTarget, this) : void 0
				});
			}
		},
		_flushCache: function () {
			//Template이 있을 경우 무조건 Cache를 삭제한다.
			if (this._templateColumns().length) {
				this._contentTree.render([]);
				if (this._hasLockedColumns) {
					this._lockedContentTree.render([]);
				}
			}
		},
		_render: function (options) {
			options = options || {};
			var messages = this.options.messages;
			var hasSelectedModel = this.options.hasSelectedModel;
			var hasCheckedModel = this.options.hasCheckedModel;
			var data = this.dataSource.rootNodes();
			var uidAttr = kendo.attr('uid');

			var selected;
			if(!hasSelectedModel && !hasCheckedModel){
				selected = this.select().removeClass('k-state-selected').map(function (_, row) {
					return $(row).attr(uidAttr);
				});
			}else{
				selected = [];
			}

			this._absoluteIndex = 0;
			this._angularItems('cleanup');
			this._angularFooters('cleanup');
			this._flushCache();
			if (options.error) {
				this._showStatus(kendo.template('#: messages.requestFailed # ' + '<button class=\'#= buttonClass #\'>#: messages.retry #</button>')({
					buttonClass: [
						classNames.button,
						classNames.retry
					].join(' '),
					messages: messages
				}));
			} else if (!data.length) {
				this._showStatus(kendo.htmlEncode(messages.noRows));
			} else {
				this._hideStatus();
				this._contentTree.render(this._trs({
					columns: this._nonLockedColumns(),
					aggregates: options.aggregates,
					selected: selected,
					data: data,
					visible: true,
					level: 0
				}));
				if (this._hasLockedColumns) {
					this._absoluteIndex = 0;
					this._lockedContentTree.render(this._trs({
						columns: this._lockedColumns(),
						aggregates: options.aggregates,
						selected: selected,
						data: data,
						visible: true,
						level: 0
					}));
				}
			}
			if (this._touchScroller) {
				this._touchScroller.contentResized();
			}
			this._muteAngularRebind(function () {
				this._angularItems('compile');
				this._angularFooters('compile');
			});

			if(!hasSelectedModel && !hasCheckedModel){
				this.items().filter(function () {
					return $.inArray($(this).attr(uidAttr), selected) >= 0;
				}).addClass('k-state-selected');
			}

			this._adjustRowsHeight();
		},
		_toggleChildren: function (e) {
			var icon = $(e.currentTarget);
			var options = this.options;
			var model = this.dataItem(icon);
			var event = !model.expanded ? EXPAND : COLLAPSE;
			if (!this.trigger(event, { model: model })) {
				//console.log(this._currentExpandedModel);
				var lastLevel = options.onceExpandParentLevel ? options.onceExpandParentLevel : this.lastParentLevel;
				if(options.isGroupListMode && model.level >= lastLevel){
					var currentExpandedModel = this._currentExpandedModel;
					var level = model.level;
					if(currentExpandedModel[level] && currentExpandedModel[level] !== model){
						var i, parent, ds = this.dataSource;
						currentExpandedModel[level].expanded = false;
						currentExpandedModel[level] = model;
						parent = model;
						for( i = level - 1; i >= 0; i-- ){
							parent = ds.parentNode(parent);
							if(currentExpandedModel[i] !== parent){
								currentExpandedModel[i].expanded = false;
								currentExpandedModel[i] = parent;
							}
						}
					}
				}
				//console.log(this._currentExpandedModel);
				this._toggle(model);
			}
			e.preventDefault();
		},
		_trs: function (options) {
			var model, attr, className, hasChildren, childNodes, i, j, size, count, length, hasCheckedChild;
			var rows = [];
			var widgetOptions = this.options;
			var hasSelectedModel = widgetOptions.hasSelectedModel;
			var hasCheckedModel = widgetOptions.hasCheckedModel;
			var isGroupListMode = widgetOptions.isGroupListMode;
			var currentExpandedModel = this._currentExpandedModel, expandedModel,
				lastParentLevel = widgetOptions.onceExpandParentLevel ? widgetOptions.onceExpandParentLevel : this.lastParentLevel, level = options.level;
			var data = options.data;
			var dataSource = this.dataSource, dv = dataSource.flatView(), index;
			var aggregates = dataSource.aggregates() || {};
			var columns = options.columns;
			var field, modelAggregates;
			for (i = 0, length = data.length; i < length; i++) {
				className = [];
				model = data[i];
				childNodes = model.loaded() && dataSource.childNodes(model);
				hasChildren = childNodes && childNodes.length;
				attr = { 'role': 'row' };
				attr[kendo.attr('uid')] = model.uid;
				if(model.id) attr['data-id'] = model.id;
				if(typeof model.level !== "undefined" && model.level !== null){
					attr['data-level'] = model.level;
				}

				//자식 노드들의 첫번째와 마지막을 체크
				if(model.parent_id){
					className.push("child");
					if(i == 0) className.push("children-first-item");
					if(i == length - 1) className.push("children-last-item");
				}

				if (hasChildren) {
					attr['aria-expanded'] = !!model.expanded;
					if(model.field) attr['data-field'] = model.field;
					if(model.value) attr['data-value'] = model.value;
					hasCheckedChild = model.hasCheckedChild;
					if((hasCheckedModel || hasSelectedModel) && hasCheckedChild) className.push("has-checked-child");
					modelAggregates = model.aggregates;
					field = model.field;
					if(modelAggregates && modelAggregates[field] && modelAggregates[field].count){
						//실제 View에 표시되는 자식 노드 사이즈 계산
						index = dv.indexOf(model);
						size = dv.length;
						count = 0;
						if(index !== -1){
							for( j = index + 1; j < size; j++ ){
								if(!dv[j].hasChildren) count++;
								else if(dv[j].level == model.level) break;
							}
						}
						modelAggregates[field].count = count;
					}
				}
				if (options.visible) {
					if (this._absoluteIndex % 2 !== 0) {
						className.push(classNames.alt);
					}
					this._absoluteIndex++;
				} else {
					attr.style = { display: 'none' };
				}

				if(hasSelectedModel){
					if(model.selected) className.push("k-state-selected");
				}else if(hasCheckedModel){
					if(model.checked) className.push("k-state-checked");
				}else if ($.inArray(model.uid, options.selected) >= 0) {
					className.push(classNames.selected);
				}

				if (hasChildren) {
					className.push(classNames.group);
				}
				if (model._edit) {
					className.push('k-grid-edit-row');
				}
				attr.className = className.join(' ');
				rows.push(this._tds({
					model: model,
					attr: attr,
					level: level
				}, columns, proxy(this._td, this)));

				if (hasChildren) {
					if(currentExpandedModel) expandedModel = currentExpandedModel[model.level];
					if(isGroupListMode && lastParentLevel <= model.level &&
						 (!expandedModel || expandedModel.field !== model.field || expandedModel.value !== model.value)){
						continue;
					}else{
						rows = rows.concat(this._trs({
							columns: columns,
							aggregates: aggregates,
							selected: options.selected,
							visible: options.visible && !!model.expanded,
							data: childNodes,
							level: level + 1
						}));
					}
				}
			}
			if (this._hasFooterTemplate()) {
				attr = {
					className: classNames.footerTemplate,
					'data-parentId': model.parentId
				};
				if (!options.visible) {
					attr.style = { display: 'none' };
				}
				rows.push(this._tds({
					model: aggregates[model.parentId],
					attr: attr,
					level: level
				}, columns, this._footerTd));
			}
			return rows;
		},
		_td: function (options) {
			var children = [];
			var model = options.model;
			var column = options.column;
			var iconClass;
			var attr = {
				'role': 'gridcell',
				'style': column.hidden === true ? { 'display': 'none' } : {}
			};
			if (model._edit && column.field && model.editable(column.field)) {
				attr[kendo.attr('container-for')] = column.field;
			} else {
				if (column.expandable) {
					children = createPlaceholders({
						level: options.level,
						className: classNames.iconPlaceHolder
					});
					iconClass = [classNames.icon];
					if (model.hasChildren) {
						iconClass.push(model.expanded ? classNames.iconCollapse : classNames.iconExpand);
					} else {
						iconClass.push(classNames.iconHidden);
					}
					if (model._error) {
						iconClass.push(classNames.refresh);
					} else if (!model.loaded() && model.expanded) {
						iconClass.push(classNames.loading);
					}
					children.push(kendoDomElement('span', { className: iconClass.join(' ') }));
					attr.style['white-space'] = 'nowrap';
				}
				if (column.attributes) {
					extend(true, attr, column.attributes);
				}
				if (column.command) {
					if (model._edit) {
						children = this._buildCommands([
							'update',
							'canceledit'
						]);
					} else {
						children = this._buildCommands(column.command);
					}
				} else {
					children.push(this._cellContent(column, model));
				}
			}
			return kendoDomElement('td', attr, children);
		},
		_cellContent: function (column, model) {
			var value;
			if (column.template) {
				value = column.template(model);
			} else if (column.field) {
				value = model.get(column.field);
				if (value !== null && column.format) {
					value = kendo.format(column.format, value);
				}
			}
			if (value === null || typeof value == 'undefined') {
				value = '';
			}
			if (column.template || !column.encoded) {
				return kendoHtmlElement(value);
			}
			return kendoTextElement(value);
		},
		setDataSource: function (dataSource) {
			this._dataSource(dataSource);
			this._sortable();
			this._filterable();
			this._contentTree.render([]);
			if (this.options.autoBind) {
				this.dataSource.fetch();
			}
		},
		_dataSource: function (dataSource) {
			var ds = this.dataSource;
			var options = this.options;
			var isGroupListMode = options.isGroupListMode;
			//var hasCheckedModel = options.hasCheckedModel;
			if(dataSource && isGroupListMode && (dataSource instanceof kendo.data.DataSource)){
				/*if(hasCheckedModel){
					var checkboxColumnWidth = DEFAULT_CHECKBOX_COLUMN_WIDTH;
					this.setColumnWidth("checked", checkboxColumnWidth);
				}*/
				dataSource = this.createTreeListDataSource(dataSource);
			}
			if (ds) {
				ds.unbind(CHANGE, this._refreshHandler);
				ds.unbind(ERROR, this._errorHandler);
				ds.unbind(PROGRESS, this._progressHandler);
			}
			this._refreshHandler = proxy(this.refresh, this);
			this._errorHandler = proxy(this._error, this);
			this._progressHandler = proxy(this._progress, this);
			ds = this.dataSource = TreeListDataSource.create(dataSource);
			if(isGroupListMode){
				var expandedModel = this._currentExpandedModel[this.lastParentLevel];
				if(expandedModel){
					this.expandModel(expandedModel);
				}else{
					this.expandModel();
				}
			}
			ds.bind(CHANGE, this._refreshHandler);
			if(options.hasCheckedModel) ds.bind(CHANGE, this._updateCheckboxEvt);
			ds.bind(ERROR, this._errorHandler);
			ds.bind(PROGRESS, this._progressHandler);
			this._dataSourceFetchProxy = proxy(function () {
				this.dataSource.fetch();
			}, this);
		},
		setColumnWidth : function(fieldName, width){
			var options = this.options, columns = options.columns;
			var i, max = columns.length;
			for( i = 0; i < max; i++ ){
				if(columns[i].field == fieldName) break;
			}
			var headerColGroup = this.element.find(".k-grid-header table colgroup");
			var bodyColGroup = this.element.find(".k-grid-content table colgroup");
			var colGroup = headerColGroup.find("col").eq(i);
			colGroup.css("width", width);
			colGroup = bodyColGroup.find("col").eq(i);
			colGroup.css("width", width);
		},
		_updateCheckboxEvt : function(e){
			var that = this, action = e.action, items = e.items, field = e.field, i, max, item;
			if(action == "itemchange" && field == "checked"){
				max = items.length;
				for( i = 0; i < max; i++ ){
					item = items[i];
					if(item.hasChildren) that.setGroupCheckbox(item);
				}
				that.setHeaderCheckbox();
			}
		},
		/**
		*   <ul>
		*   <li>Group이 설정된 DataSource를 트리 리스트를 표시하기 위한 kendo TreeDataSource 인스턴스를 생성하기 위해 데이터 모델을 변경한다.</li>
		*   <li>그룹핑의 경우 현재 선택한 그룹을 제외한 데이터는 표시하지 않는다.(1개의 그룹만 펼칠 수 있도록한다.) 그러므로 나머지 그룹들에 대해서는 데이터르 더미로 생성하여 UI에 그룹으로 표시되도록 한다.</li>
		*   </ul>
		*   @function createGroupToTreeDs
		*   @param {Array}data - 아이템 리스트
		*   @param {Number|String}parentId - 부모 아이템의 ID 값
		*   @param {Number}level - 현재 생성되는 데이터의 Level(Depth) 값
		*   @param {Boolean}isDummy - 더미 여부
		*   @param {Object}allowField - 실 데이터를 렌더링할 그룹의 필드 정보
		*   @param {Strig|Number|Boolean} parentValue - 부모 아이템의 Value
		*   @returns {Array} - 생성된 데이터 리스트
		*   @alias module:app/widget/map-panel-list
		*
		*/
		createGroupToTreeDs : function(data, parentId, level, isDummy, allowField, parentValue){
			if(!parentId){
				parentId = null;
			}
			if(typeof level === "undefined" || level === null){
				level = 0;
			}
			var i, max = data.length;
			var results = [];
			var items, childs, obj;
			var j, size, item;
			for( i = 0; i < max; i++ ){
				obj = {};
				obj.field = data[i].field;
				obj.value = data[i].value;
				obj.aggregates = data[i].aggregates;
				obj.parent_id = parentId;
				obj.parent_value = parentValue;
				obj.id = kendo.guid();
				obj.level = level;
				if(!this.lastParentLevel || this.lastParentLevel < level){
					this.lastParentLevel = level;
				}
				obj.treeGroup = true;

				results.push(obj);

				if(data[i].hasSubgroups){
					childs = this.createGroupToTreeDs(data[i].items, obj.id, level + 1, isDummy, allowField, obj.value);
					results = results.concat(childs);
				}else{
					//성능 개선을 위한 더미 데이터.
					/*if(isDummy){
						results.push({ name : "-", id : kendo.guid(), parent_id : obj.id, isDummy : true, parent_value : obj.value});
						continue;
					}
					if(allowField && (allowField.field != obj.field || allowField.value != obj.value)){
						results.push({ name : "-", id : kendo.guid(), parent_id : obj.id, isDummy : true, parent_value : obj.value});
						continue;
					}*/
					items = data[i].items;
					size = items.length;
					for( j = 0; j < size; j++ ){
						item = items[j];
						item.level = level + 1;
						item.parent_id = obj.id;
						if(!item.id) item.id = kendo.guid();
						if(item instanceof kendo.data.ObservableObject){
							item = item.toJSON();
						}
						results.push(item);
					}
				}
			}
			return results;
		},
		/**
		*   <ul>
		*   <li>트리 리스트를 표시하기 위한 kendo TreeDataSource 인스턴스를 생성한다.</li>
		*   </ul>
		*   @function createTreeListDataSource
		*   @param {Array}ds - 아이템 리스트
		*   @returns {kendoTreeDataSource} - 트리 DataSource 인스턴스
		*   @alias module:app/widget/map-panel-list
		*
		*/
		createTreeListDataSource : function(ds){
			//var data = ds.data();
			//var datas = data.toJSON();
			//그룹핑을 트리 리스트 데이터소스로 변경
			var query, orgData;
			//if(group){
			//	orgData = ds.view();
			//}else{
			var data = ds.data();
			var filter = ds.filter();
			var sort = ds.sort();
			var group = ds.group();
			if(group && group.length > 0){
				query = new kendo.data.Query(data);
				//if(filter) query = query.filter(filter);
				if(sort) query = query.sort(sort);
				query = query.group(group);
				orgData = query.toArray();
			}else{
				orgData = [];
			}
			//}
			//console.time("createGroupToTreeDs");
			var treeData = this.createGroupToTreeDs(orgData);
			//console.timeEnd("createGroupToTreeDs");
			//console.error(datas);
			// console.log(datas);

			//console.time("createTreeList");
			var treeDs = new kendo.data.TreeListDataSource({
				data : treeData,
				schema : {
					model : {
						id : "id",
						parentId : "parent_id",
						fields : {
							"parent_id" : {
								type : "string",
								nullable : true
							}
						}
					}
				}
			});
			treeDs.read();
			if(filter) treeDs.filter(filter);
			//console.timeEnd("createTreeList");
			return treeDs;
		},
		expandModel : function(model){
			var that = this, ds = this.dataSource;
			//var data = ds.data();
			//View 기준으로 펼쳐질 Model을 찾는다.
			var data = ds.flatView();
			var i, max = data.length;
			var parent, lastParentLevel = that.lastParentLevel;

			//setDataSource 후 최초 펼쳐질 아이템을 선정한다.
			//View에서 보이는 가장 첫번째, 최하위 부모 레벨 아이템이다.
			if(!model){
				for( i = 0; i < max; i++ ){
					if(data[i].field && data[i].treeGroup && data[i].level == lastParentLevel && that.hasChildrenInView(data[i], ds)){
						model = data[i];
						that._currentExpandedModel[data[i].level] = model;
						if(model.parent_id !== null){
							parent = ds.get(model.parent_id);
							that.expandModel(parent);
						}
						data[i].expanded = true;
						return;
					}
				}
				return;
			}

			//최하위 부모 아이템의 부모들의 expanded 상태를 변경한다.
			for( i = 0; i < max; i++ ){
				if(data[i].field == model.field && data[i].value == model.value && data[i].parent_value == model.parent_value){
					if(data[i].parent_id !== null){
						parent = ds.get(data[i].parent_id);
						that.expandModel(parent);
					}
					//data[i].set("expanded", true);
					that._currentExpandedModel[data[i].level] = data[i];
					data[i].expanded = true;
					return;
				}
			}
			//이미 선택했던 model 정보가 존재하나, 현재 표시할 리스트에 존재하지 않음.
			that.expandModel(null);
		},
		hasChildrenInView : function(model, ds){	//Filter가 적용된 View에서 자식 노드가 존재하는지 체크한다.
			if(!ds.filter()) return true;

			var dv = ds.view();
			var i, next, size = dv.length;
			for( i = 0; i < size; i++ ){
				if(dv[i] === model){
					next = i + 1;
					if(next < size && dv[next] && dv[next].treeGroup) return false;
					return true;
				}
			}
			return false;
		},
		getSelectedData : function(){
			var ds = this.dataSource;
			var data = ds.data();
			return new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : "selected", operator : "eq", value : true}]
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
				filters : [{ field : "checked", operator : "eq", value : true}, { field : "hasChildren", operator : "eq", value : false}]
			}).toArray();
		},
		getUncheckedData : function(){
			var ds = this.dataSource;
			var data = ds.data();
			return new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : "checked", operator : "eq", value : false}, { field : "hasChildren", operator : "eq", value : false}]
			}).toArray();
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
			for( i = 0; i < max; i++ ){
				data = datas[i];
				data.selected = isSelected;
				if(data.hasChildren || data.treeGroup){
					data.hasCheckedChild = isSelected;
				}
			}
			ds.fetch();
		},
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
			//that.trigger(CHANGE);
		},
		unselectAll : function(){
			this.clearSelection();
		},
		clearSelection: function () {
			var that = this;
			if(that.selectable) that.selectable.clear();
			if(that.options.hasSelectedModel){
				this._setAllSelectedModel(false);
			}
			//that.trigger(CHANGE);
		},
		selectByData : function(selectedData){
			var that = this, i, data, max = selectedData.length;
			var item, ds = that.dataSource, options = that.options, hasSelectedModel = options.hasSelectedModel;
			for( i = 0; i < max; i++ ){
				data = selectedData[i];
				item = ds.get(data.id);
				if(item){
					if(hasSelectedModel){
						item.selected = true;
						that.updateParentSelected(item);
					}else{
						that.element.find("tr[data-uid='" + item.uid + "']").addClass("k-state-selected");
					}
				}
			}
			if(hasSelectedModel) ds.fetch();
		}
	});
	kendo.ui.plugin(extendTreeList);

})(window, jQuery);
//# sourceURL=widget/common-tree-list.js
