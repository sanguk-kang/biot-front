/**
*
*   <ul>
*       <li>Map View 우측 리스트에 대한 공용 UI Component</li>
*   </ul>
*   @module app/widget/map-panel-list
*   @requires lib/kendo.all
*
*/

(function(window, $){
	"use strict";

	var kendo = window.kendo;
	var Widget = kendo.ui.Widget;

	var MapListView = Widget.extend({
		//디폴트 옵션
		options: {
			name : "DeviceTabGroupGrid",
			hasNewDataSource : true,
			hasSelectedModel : false,
			setSelectedAttribute : false,
			height : "100%"
		},
		events :[
			"onselect",
			"change",
			"onDetail",
			"beforeActiveTab",
			"activateTab"
		],
		init : function(element, options){
			var self = this;
			options = $.extend({}, self.options, options );
			Widget.fn.init.call(self, element, options);
			var ds = self.options.dataSource;
			if(!( ds instanceof kendo.data.DataSource)){
				self.options.dataSource = new kendo.data.DataSource({
					data : self.options.dataSource
				});
				this.dataSource = ds = self.options.dataSource;
			}else{
				this._createDataSource(ds);
			}

			this.tabContainer = $("<div/>").addClass("map-panel-list-tabs-container");
			this._createTabElem();
			this.tabContainer.html(this.tabListElem);

			this.listContainer = $("<div/>").addClass("map-panel-list-container");
			this._createList();

			var grid;
			if(options.type == "hybrid"){
				var i, max = this.tabGrids.length;
				for( i = 0; i < max; i++ ){
					grid = this.tabGrids[i];
					this.listContainer.append(grid.element);
				}
			}else{
				grid = this.grid;
				this.listContainer.append(grid.element);
			}

			this._attachTabClickEvt();
			this._attachSelectEvt();
			this._attachDetailEvt();

			var isHideTab = this.options.hideTab;
			this.hideTab(isHideTab);

			this.selectTab(0, false, true);

			this.element.append(this.tabContainer);
			this.element.append(this.listContainer);
		},
		/**
		*   <ul>
		*   <li>특정 탭을 활성화하고, 해당 탭의 List를 표시한다.</li>
		*   </ul>
		*   @function selectTab
		*   @param {Number} index - Tab의 인덱스
		*   @param {Boolean} isForce - Click 이벤트가 아닌 강제 호출 여부
		*   @param {Boolean} doNotTrigger - activateTab 이벤트에 설정된 Callback 함수 호출 여부
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		selectTab : function(index, isForce, doNotTrigger){
			if(index == this.selectedIndex && !isForce){
				return;
			}

			var tabElem = this.tabListElem.find("li:eq(" + index + ")");
			tabElem.siblings(".map-panel-list-tab").removeClass("active");
			tabElem.addClass("active");

			var tabs = this.options.filterTab;
			var tabOptions = tabs[index];
			var listOptions = tabOptions.listOptions;
			var filter = listOptions.filter;
			var group = listOptions.group;
			var sort = listOptions.sort;
			var isHideHeader = tabOptions.hideHeader;
			var grid;
			//if(!filter) filter = [];
			//if(!group) group = [];
			//if(!sort) sort = [];
			if(!filter) filter = this.dataSource.filter() ? this.dataSource.filter() : [];
			if(!group) group = this.dataSource.group() ? this.dataSource.group() : [];
			if(!sort) sort = this.dataSource.sort() ? this.dataSource.sort() : [];

			if(this.options.type == "hybrid"){
				if(typeof this.selectedIndex === "undefined"){
					var i, max = this.tabGrids.length;
					for( i = 0; i < max; i++ ){
						this.tabGrids[i].element.hide();
					}
				}else{
					grid = this.tabGrids[this.selectedIndex];
					grid.element.hide();
				}

				grid = this.tabGrids[index];
				grid.element.show();
				if(tabOptions.listStyle != "treeList"){
					grid.dataSource.group(group);
					grid.dataSource.filter(filter);
				}else{
					//grid.dataSource.group(group);
					grid.dataSource.filter(filter);
					//그룹핑 된 Row는 무조건 보여야한다.
					//this.applyTreeFilter(grid.dataSource, filter);
				}
				grid.dataSource.sort(sort);
				grid.showColumn(0);
				this.dataSource = grid.dataSource;
			}else{
				if(typeof this.selectedIndex !== "undefined"){
					this.grid.hideColumn(this.selectedIndex);
				}

				this.dataSource.filter(filter);
				this.dataSource.group(group);
				this.dataSource.sort(sort);

				this.grid.showColumn(index);
			}
			this.hideHeader(index, isHideHeader);
			this.selectedIndex = index;
			this.updateHeaderTemplate();
			if(!doNotTrigger){
				this.trigger("activateTab", {
					index : index
				});
			}
		},
		/**
		*   <ul>
		*   <li>Tree List에 필터를 적용한다.</li>
		*   </ul>
		*   @function applyTreeFilter
		*   @param {kendoDataSource} ds - 리스트에 표시될 데이터로 생성된 Kendo DataSource 인스턴스
		*   @param {Object} filter - Filter Option 정보가 담긴 객체
		*   @param {Object} levelFilter - 현재 특정 레벨로 활성화 된 Filter 정보가 담긴 객체
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		applyTreeFilter : function(ds, filter, levelFilter){
			//그룹핑 된 Row는 무조건 보여야한다.
			if(filter.length > 0 || (filter.filters && filter.filters.length > 0)){
				var treeFilter = { logic : "or",
							  filters : [{field : "treeGroup", operator : "eq", value : true },
						{field : "isDummy", operator : "eq", value : true }]};
				treeFilter.filters.push(filter);
				if(levelFilter){
					treeFilter.filters.push(levelFilter);
				}
				ds.filter(treeFilter);
			}
		},
		/**
		*   <ul>
		*   <li>상단 탭을 표시/미표시한다.</li>
		*   </ul>
		*   @function hideTab
		*   @param {Boolean} isHide - 숨김 여부
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		hideTab : function(isHide){
			if(isHide){
				this.tabContainer.hide();
				this.listContainer.addClass("no-tab");
			}else{
				this.tabContainer.show();
				this.listContainer.removeClass("no-tab");
			}
		},
		/**
		*   <ul>
		*   <li>상단의 헤더 정보를 표시/미표시한다.</li>
		*   </ul>
		*   @function hideHeader
		*   @param {Number} index - 상단 헤더 정보를 숨길 Tab의 Index
		*   @param {Boolean} isHide - 숨김 여부
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		hideHeader : function(index, isHide){
			var options = this.options;
			//var columnHeaders = this.grid.element.find(".k-grid-header thead");
			//var header = columnHeaders.find("th[role='columnheader'][data-index='"+index+"']");
			var columnHeaders, content, grid;
			if(options.type == "hybrid"){
				grid = this.tabGrids[index];
				grid.element.find(".k-grid-header");
				columnHeaders = grid.element.find(".k-grid-header");
				content = grid.element.find(".k-grid-content");
			}else{
				columnHeaders = this.grid.element.find(".k-grid-header");
				content = this.grid.element.find(".k-grid-content");
			}

			if(isHide){
				columnHeaders.hide();
				content.addClass("no-header");
			}else{
				columnHeaders.show();
				content.removeClass("no-header");
			}
		},
		/**
		*   <ul>
		*   <li>상단의 탭 요소를 생성한다.</li>
		*   </ul>
		*   @function _createTabElem
		*   @returns {jQueryElement} - 상단 탭 요소
		*   @alias module:app/widget/map-panel-list
		*
		*/
		_createTabElem : function(){
			this.tabListElem = $("<ul/>").addClass("map-panel-list-tabs");
			var i, max, tab, tabs = this.options.filterTab;
			var viewModel, tabElem, tabViewModel = this.options.tabViewModel ? this.options.tabViewModel : [];
			this.tabViewModel = tabViewModel ? tabViewModel : [];
			if(tabs){
				max = tabs.length;
				for( i = 0; i < max; i++ ){
					tab = tabs[i];
					viewModel = tabViewModel[i];
					tabElem = $("<li data-bind='events:{ click : click }'/>").addClass("map-panel-list-tab");
					if(tab.template){
						tabElem.append(this._renderTemplate(tab.template));
					}

					if(viewModel){
						viewModel = tabViewModel[i] = kendo.observable(viewModel);
						kendo.bind(tabElem, viewModel);
					}

					if(!tab.hidden){
						this.tabListElem.append(tabElem);
					}
				}
			}
			return this.tabListElem;
		},
		/**
		*   <ul>
		*   <li>옵션에 따라 kendoGrid 또는 kendoTreeList 인스턴스를 생성하여 리스트를 생성한다.</li>
		*   </ul>
		*   @function _createList
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		_createList : function(){
			var i, max, tab, tabs = this.options.filterTab;
			var column, columns = [];
			var hasSelectedModel = this.options.hasSelectedModel,
				setSelectedAttribute = this.options.setSelectedAttribute,
				selectable = this.options.selectable;
			var type = this.options.type;
			var height = this.options.height;

			var defaultSelectable = "multiple row";
			if(typeof selectable !== "undefined"){
				defaultSelectable = selectable;
			}

			var defaultOpt = {
				columns : columns,
				hasSelectedModel : hasSelectedModel,
				setSelectedAttribute : setSelectedAttribute,
				dataSource: this.dataSource,
				height: height,
				selectable : defaultSelectable,
				scrollable: true,
				sortable: false,
				filterable: false,
				pageable: false
			};
			var opt;
			if(type == "hybrid"){
				if(tabs){
					max = tabs.length;
					if(!this.tabGrids){
						this.tabGrids = [];
					}
					for( i = 0; i < max; i++ ){
						tab = tabs[i];
						columns = [];
						column = tab.listOptions.column;
						if(column){
							if($.isArray(column)){
								columns = columns.concat(column);
							}else{
								columns.push(column);
							}
						}
						//defaultOpt.columns = columns;
						if(tab.widgetOptions){
							opt = $.extend({}, defaultOpt, tab.widgetOptions, {columns : columns});
						}else{
							opt = $.extend({}, defaultOpt,{columns : columns});
						}

						if(tab.listStyle == "treeList"){
							var ds = this.createTreeListDataSource(this.dataSource, tab);
							opt.dataSource = ds;
							opt.isGroupListMode = true;
							var grid = $("<div/>").kendoTreeList(opt).data("kendoTreeList");
							grid.element.addClass("device-tab-group-grid-tree-list");
							this.tabGrids.push(grid);
						}else{
							this.tabGrids.push($("<div/>").kendoGrid(opt).data("kendoGrid"));
						}
					}
				}
			}else if(tabs){
				max = tabs.length;
				for( i = 0; i < max; i++ ){
					tab = tabs[i];
					column = tab.listOptions.column;
					if(column){
						column.hidden = true;
						columns.push(column);
					}
				}
				defaultOpt.columns = columns;
				defaultSelectable = "multiple row";
				if(typeof selectable !== "undefined"){
					defaultSelectable = selectable;
				}

				if(tab.widgetOptions){
					defaultOpt = $.extend({}, defaultOpt, tab.widgetOptions);
				}

				this.grid = $("<div/>").kendoGrid(defaultOpt).data("kendoGrid");
			}
		},
		/**
		*   <ul>
		*   <li>텝에 대한 클릭 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachTabClickEvt
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		_attachTabClickEvt : function(){
			var self = this;
			this.tabContainer.on("click", ".map-panel-list-tab", function(){
				var index = $(this).index();
				self.selectTab(index);
			});
		},
		/**
		*   <ul>
		*   <li>리스트 아이템 선택에 대한 이벤트를 바인딩하고, 아이템 선택 시, 해당 이벤트를 Trigger 한다.</li>
		*   </ul>
		*   @function _attachSelectEvt
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		_attachSelectEvt : function(){
			var self = this;
			if(this.options.type == "hybrid"){
				var i, max = this.tabGrids.length;
				for( i = 0; i < max; i++ ){
					this.tabGrids[i].bind("change", function(e){
						self.trigger("change", e);
					});
					this.tabGrids[i].bind("expand", function(e){
						self.trigger("expand", e);
					});
				}
			}else{
				this.grid.bind("change", function(e){
					//if(!self.selectByOtherWidget){
					self.trigger("change", e);
					//}
				});
			}
		},
		/**
		*   <ul>
		*   <li>리스트 아이템 내 상세 정보 아이콘 클릭에 대한 이벤트를 바인딩하고, 해당 이벤트를 Trigger 한다.</li>
		*   </ul>
		*   @function _attachDetailEvt
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		_attachDetailEvt : function(){
			var self = this;
			if(this.options.type == "hybrid"){
				this.element.on("click", ".device-map-panel-list-item .ic.ic-info", function(){
					//var tr = $(this).closest("tr");
					//var uid = tr.data("uid");
					//var data = self.dataSource.getByUid(uid);
					var id = $(this).data("id");
					var grid = self.tabGrids[self.selectedIndex];
					var ds = grid.dataSource;
					var data = ds.get(id);
					self.trigger("onDetail", {item : data});
				});
			}else{
				this.grid.element.on("click", ".device-map-panel-list-item .ic.ic-info", function(){
					var tr = $(this).closest("tr");
					var uid = tr.data("uid");
					var data = self.dataSource.getByUid(uid);
					self.trigger("onDetail", {item : data});
				});
			}
		},
		select : function(arg){
			var grid;
			if(this.options.type == "hybrid"){
				grid = this.tabGrids[this.selectedIndex];
			}else{
				grid = this.grid;
			}

			return grid.select(arg);
		},
		//id로 select
		/**
		*   <ul>
		*   <li>리스트 아이템 내 Data로 아이템을 선택한다.</li>
		*   </ul>
		*   @function selectByData
		*   @param {Array}selectedData - 선택 상태로 변경할 Data 리스트
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		selectByData : function(selectedData){
			var grid;
			if(this.options.type == "hybrid"){
				grid = this.tabGrids[this.selectedIndex];
			}else{
				grid = this.grid;
			}
			grid.selectByData(selectedData);
		},
		/**
		*   <ul>
		*   <li>리스트 아이템을 전체 선택한다.</li>
		*   </ul>
		*   @function selectAll
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		selectAll : function(){
			var grid;
			if(this.options.type == "hybrid"){
				grid = this.tabGrids[this.selectedIndex];
			}else{
				grid = this.grid;
			}

			if(this.options.hasSelectedModel){
				var ds = grid.dataSource;
				var data = ds.data();
				var filter = ds.filter();
				var query = new kendo.data.Query(data);
				if(filter){
					query = query.filter(filter);
				}
				var viewData = query.toArray();
				var i, max = viewData.length;
				for( i = 0; i < max; i++ ){
					if(viewData[i].hasChildren || viewData[i].treeGroup) viewData[i].hasCheckedChild = true;
					else viewData[i].selected = true;
				}
				ds.fetch();
			}else{
				grid.element.find("tr").addClass("k-state-selected");
			}
		},
		/**
		*   <ul>
		*   <li>리스트 아이템을 전체 선택 해제한다.</li>
		*   </ul>
		*   @function unselectAll
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		unselectAll : function(){
			var grid;
			if(this.options.type == "hybrid"){
				grid = this.tabGrids[this.selectedIndex];
			}else{
				grid = this.grid;
			}

			if(this.options.hasSelectedModel){
				var ds = grid.dataSource;
				var data = ds.data();
				//Unselect는 View 기준이 아니라 데이터 기준으로 모두 선택 해제
				var i, max = data.length;
				for( i = 0; i < max; i++ ){
					if(data[i].hasChildren || data[i].treeGroup) data[i].hasCheckedChild = false;
					else data[i].selected = false;
				}
				ds.fetch();
			}
			grid.element.find("tr").removeClass("k-state-selected");
		},
		dataItem : function(arg){
			var grid;
			if(this.options.type == "hybrid"){
				grid = this.tabGrids[this.selectedIndex];
			}else{
				grid = this.grid;
			}

			return grid.dataItem(arg);
		},
		_renderTemplate : function(template, data){
			if($.isFunction(template)){
				return template(data);
			}
			var tmpl = kendo.template(template);
			if(!data){
				data = {};
			}
			tmpl = tmpl(data);
			return tmpl;
		},
		/**
		*   <ul>
		*   <li>리스트를 표시하기 위한 kendo DataSource 인스턴스를 생성한다.</li>
		*   </ul>
		*   @function _createDataSource
		*   @param {Array}ds - 아이템 리스트
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		_createDataSource : function(ds){
			var isNewDs = this.options.hasNewDataSource;
			var options = this.options;
			var hasSelectedModel = options.hasSelectedModel;
			var data;
			if(isNewDs){
				data = ds.data();
				data = data.toJSON();
				this.dataSource = this.options.dataSource = new kendo.data.DataSource({
					data : data
				});
			}else{
				this.dataSource = ds;
			}

			if(hasSelectedModel){
				var i, max;
				data = this.dataSource.data();
				max = data.length;
				for( i = 0; i < max; i++ ){
					if(typeof data[i].selected === "undefined"){
						data[i].selected = false;
					}
				}
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
				if(!this.lastLevel || this.lastLevel < level){
					this.lastLevel = level;
				}
				obj.treeGroup = true;

				results.push(obj);

				if(data[i].hasSubgroups){
					childs = this.createGroupToTreeDs(data[i].items, obj.id, level + 1, isDummy, allowField, obj.value);
					results = results.concat(childs);
				}else{
					//성능 개선을 위한 더미 데이터.
					if(isDummy){
						results.push({ name : "-", id : kendo.guid(), parent_id : obj.id, isDummy : true, parent_value : obj.value});
						continue;
					}
					if(allowField && (allowField.field != obj.field || allowField.value != obj.value)){
						results.push({ name : "-", id : kendo.guid(), parent_id : obj.id, isDummy : true, parent_value : obj.value});
						continue;
					}
					items = data[i].items;
					size = items.length;
					for( j = 0; j < size; j++ ){
						item = items[j];
						item.parent_id = obj.id;
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
		*   @function createGroupToTreeDs
		*   @param {Array}ds - 아이템 리스트
		*   @param {Object}tabOpt - 현재 선택한 Tab의 Option 정보가 담긴 객체
		*   @param {Boolean}isDummy - 더미 여부
		*   @param {Object}allowField - 실 데이터를 렌더링할 그룹의 필드 정보
		*   @returns {kendoTreeDataSource} - 트리 DataSource 인스턴스
		*   @alias module:app/widget/map-panel-list
		*
		*/
		createTreeListDataSource : function(ds, tabOpt, isDummy, allowField){
			if(!tabOpt){
				tabOpt = this.options.filterTab[this.selectedIndex];
			}
			var listOpt = tabOpt.listOptions;
			var group = listOpt.group;
			var data = ds.data();
			//var datas = data.toJSON();
			//그룹핑을 트리 리스트 데이터소스로 변경
			var filter = listOpt.filter;
			if(!filter){
				filter = ds.filter();
			}
			var sort = listOpt.sort;
			if(!sort){
				sort = ds.sort();
			}
			var query = new kendo.data.Query(data);
			if(filter){
				query = query.filter(filter);
			}

			if(sort){
				query = query.sort(sort);
			}

			if(group){
				query = query.group(group);
			}

			var orgData = query.toArray();
			var datas = this.createGroupToTreeDs(orgData, null, null, isDummy, allowField, null);
			//console.error(datas);
			// console.log(datas);

			var treeDs = new kendo.data.TreeListDataSource({
				data : datas,
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
			return treeDs;
		},
		/**
		*   <ul>
		*   <li>현재 활성화 시킬 Group의 DataSource를 Set하고, 해당 그룹을 활성화한다.(Expand, 펼친다)</li>
		*   <li>해당 그룹의 하위 정보들로 리스트를 업데이트한다.</li>
		*   </ul>
		*   @function setDataSourceExpand
		*   @param {Obejct}model - 활성화될(펼칠) Group의 정보 객체
		*   @param {kendoDataSource} dataSource - Update 될 DataSource
		*   @param {String}checkParentId - 부모 아이디.
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		setDataSourceExpand : function(model, dataSource, checkParentId){
			//expand한 필드를 유지
			/*var index = this.selectedIndex;
			this.expandModel[index] = model;
			//this.expandInfo.field = model.field;
			//this.expandInfo.value = model.value;
			var filter = dataSource.filter();
			var ds = this.createTreeListDataSource(dataSource, null, false, model);
			var grid = this.tabGrids[index];

			if(filter){
				this.applyTreeFilter(ds, filter);
			}

			grid.setDataSource(ds);
			//var query = new kendo.data.Query(ds.data()).filter(filter);
			this.expandFromModel(model, false, checkParentId);
			grid.dataSource.fetch();*/
		},
		/**
		*   <ul>
		*   <li>특정 그룹을 활성화한다.(Expand, 펼친다)</li>
		*   </ul>
		*   @function expandFromModel
		*   @param {Obejct}model - 활성화될(펼칠) Group의 정보 객체
		*   @param {Object} trigger - 이벤트 트리거.
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		expandFromModel : function(model, trigger){
			var index = this.selectedIndex;
			var grid = this.tabGrids[index];
			var ds = grid.dataSource;
			var data = ds.data();
			var i, max = data.length;
			var parent;
			if(!model){
				for( i = 0; i < max; i++ ){
					if(data[i].field && data[i].treeGroup && data[i].level == this.lastLevel){
						model = data[i];
						this.expandModel[index] = model;
						if(model.parent_id !== null){
							parent = ds.get(model.parent_id);
							this.expandFromModel(parent);
						}
						if(trigger){
							grid.trigger("expand", { sender : this, model : model });
						}else{
							//data[i].set("expanded", true);
							data[i].expanded = true;
						}
						return;
					}
				}
				return;
			}

			for( i = 0; i < max; i++ ){
				if(data[i].field == model.field && data[i].value == model.value && data[i].parent_value == model.parent_value){
					if(data[i].parent_id !== null){
						parent = ds.get(data[i].parent_id);
						this.expandFromModel(parent);
					}
					if(trigger){
						grid.trigger("expand", { sender : this, model : data[i] });
					}else{
						//data[i].set("expanded", true);
						data[i].expanded = true;
					}
					return;
				}
			}
			//선택했던 model이 존재하나, 현재 리스트에는 존재하지 않음.
			this.expandFromModel(null, true);
		},
		/**
		*   <ul>
		*   <li>Data List를 Set하여 리스트를 업데이트한다.</li>
		*   </ul>
		*   @function setDataSource
		*   @param {Array}ds - 데이터 리스트
		*   @param {Boolean}isIgnoreFilter - 필터를 무시하는지에 대한 여부
		*   @param {Boolean}doNotTrigger - activateTab 이벤트 트리거 여부
		*   @param {Boolean}notDummy - 더미 데이터를 생성하지 않는지에 대한 여부
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		setDataSource : function(ds, isIgnoreFilter, doNotTrigger, notDummy){
			var grid, scrollable, scrollTop;
			if(this.options.type == "hybrid"){
				var index = this.selectedIndex;
				grid = this.tabGrids[index];
				scrollable = grid.element.find(".k-grid-content.k-auto-scrollable");
				scrollTop = 0;
				if(scrollable.length > 0){
					scrollTop = scrollable.scrollTop();
				}
				this._createDataSource(ds);
				if(grid instanceof kendo.ui.TreeList){
					//var origDs = this.createTreeListDataSource(ds);
					/*var isDummy = true;
					if(notDummy){
						isDummy = false;
					}
					var dummyDs = this.createTreeListDataSource(ds, null, isDummy);
					//grid.originalDs = origDs;
					grid.setDataSource(dummyDs);
					if(!this.expandModel) this.expandModel = [];

					if(this.expandModel[index]) this.expandFromModel(this.expandModel[index], true);
					else this.expandFromModel(null, true);
					grid.dataSource.fetch();*/
					var options = this.options;
					var tabOptions = options.filterTab[index];
					var listOptions = tabOptions.listOptions;
					if(listOptions){
						var group = listOptions.group;
						if(group) this.dataSource.group(group);
					}
					var filter = ds.filter(), sort = ds.sort();
					//console.log(filter);
					if(filter) this.dataSource.filter(filter);
					//console.log(sort);
					if(sort) this.dataSource.sort(sort);
					grid.setDataSource(this.dataSource);
				}else{
					grid.setDataSource(this.dataSource);
				}

				if(!isIgnoreFilter){
					this.selectTab(this.selectedIndex, true, doNotTrigger);
				}
				scrollable.scrollTop(scrollTop);
			}else{
				scrollable = this.grid.element.find(".k-grid-content.k-auto-scrollable");
				scrollTop = 0;
				if(scrollable.length > 0){
					scrollTop = scrollable.scrollTop();
				}
				this.grid.hideColumn(this.selectedIndex);
				this._createDataSource(ds);
				this.grid.setDataSource(this.dataSource);
				if(!isIgnoreFilter){
					this.selectTab(this.selectedIndex, true, doNotTrigger);
				}
				this.grid.showColumn(this.selectedIndex);
				scrollable.scrollTop(scrollTop);
			}
			//this.grid._setContentHeight();
		},
		/**
		*   <ul>
		*   <li>설정된 Header의 Template에 따라 현재 활성화 된 Tab의 Header 영역을 업데이트한다.</li>
		*   </ul>
		*   @function updateHeaderTemplate
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		updateHeaderTemplate : function(){
			var options = this.options;
			var tabs = options.filterTab;
			var grid, columnHeaders, listOptions, templ;
			if(options.type == "hybrid"){
				grid = this.tabGrids[this.selectedIndex];
				columnHeaders = grid.element.find(".k-grid-header thead");
				var tab = tabs[this.selectedIndex];
				listOptions = tab.listOptions;
				var column = listOptions.column;
				if(column.headerTemplate){
					templ = this._renderTemplate(column.headerTemplate);
					columnHeaders.find("th[role='columnheader']").html(templ);
				}
			}else{
				grid = this.grid;
				columnHeaders = grid.element.find(".k-grid-header thead");
				var i, max = tabs.length;
				var headerTemplate;
				for( i = 0; i < max; i++ ){
					listOptions = tabs[i].listOptions;
					if(listOptions && listOptions.column){
						headerTemplate = listOptions.column.headerTemplate;
						if(headerTemplate){
							templ = this._renderTemplate(headerTemplate);
							columnHeaders.find("th[role='columnheader'][data-index='" + i + "']").html(templ);
						}
					}
				}
			}

		},
		/**
		*   <ul>
		*   <li>현재 활성화 된 Tab의 리스트에 필터를 업데이트하여 재적용한다.</li>
		*   </ul>
		*   @function updateFilter
		*   @param {Number}tabIndex - Filter를 업데이트 할 Tab의 인덱스
		*   @param {Object}filter - 적용할 Filter의 옵션 객체
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		updateFilter : function(tabIndex, filter){
			var grid;
			var ds;
			var tabs = this.options.filterTab;
			var tabOptions = tabs[tabIndex];
			var listOptions = tabOptions.listOptions;
			listOptions.filter = filter;
			if(this.options.type == "hybrid"){
				grid = this.tabGrids[tabIndex];
				ds = grid.dataSource;
				ds.filter(filter);
			}else{
				grid = this.grid;
				ds = this.dataSource;
				grid.hideColumn(this.selectedIndex);
				//var group = listOptions.group;

				ds.filter(filter);
				//this.dataSource.group(group);
				grid.showColumn(this.selectedIndex);
			}
		},
		selectedDataSource : function(){
			var ds = this.dataSource;
			var list = [];
			this.element.find(".map-panel-list-item.selected").each(function(){
				var uid = $(this).data("uid");
				var item = ds.getByUid(uid);
				if(item){
					list.push(item);
				}
			});
			return list;
		},
		removeItemById : function(id){
			var ds = this.dataSource;
			var item = ds.get(id);
			if(item){
				this.element.find(".map-panel-list-item[data-uid='" + item.uid + "']").remove();
				ds.remove(item);
			}
		},
		removeItemByElem : function(li){
			var ds = this.dataSource;
			var uid = li.data("uid");
			var item = ds.getByUid(uid);
			if(item){
				this.element.find(".map-panel-list-item[data-uid='" + uid + "']").remove();
				ds.remove(item);
			}
		},
		_listToggleEvt : function(e){
			var li = $(this).closest(".map-panel-list-item");
			var ul = li.find("ul");
			if(ul.length > 0){
				ul = ul.eq(0);
				if(ul.hasClass("active")){
					ul.slideUp(300);
					ul.removeClass("active");
					$(this).removeClass("active");
				}else{
					ul.slideDown(300);
					ul.addClass("active");
					$(this).addClass("active");
				}
			}
		},
		_listItemSelectEvt : function(e){
			var self = $(this);
			if(self.find(".ic-list-control-arrow").length > 0){
				//groups
			}else if(self.hasClass("selected")){
				self.removeClass("selected");
			}else{
				self.addClass("selected");
			}
		},
		_initElement : function(){

			this.element.addClass("map-panel-device-list");
			this.listTabs = $("<div/>").addClass("map-panel-device-list-tabs");
			this.tabList = $("<div/>").addClass("map-panel-device-tab-list")
				.appendTo(this.listTabs);
			var tabList = this.options.filterTab;
			var tab, btn, li, i, max = tabList.length;
			for( i = 0; i < max; i++ ){
				tab = tabList[i];
				li = $("<li/>").addClass("map-panel-device-tab");
				btn = $("<button/>").attr("data-field", tab.field);
				btn.addClass("map-panel-device-tab-button").append(tab.template);
				btn.appendTo(li);
				li.appendTo(this.tabList);
			}

			this.listTabs.appendTo(this.element);

		},
		_recursiveListView : function(arr, depth){
			var self = this;
			var i, max = arr.length;

			if(!depth){
				depth = 0;
			}

			var ul = $("<ul/>").addClass("map-panel-list depth-" + depth);

			var childListElem, template, li, field, result, data;
			for( i = 0; i < max; i++ ){
				data = arr[i];
				field = data.field;
				li = $("<li/>").addClass("map-panel-list-item depth-" + depth + " " + field);
				if(field){
					template = self.options.groupTemplate[field];
					result = this._renderTemplate(template, data);
				}else{
					result = this._renderTemplate(self.options.itemTemplate, data);
					li.addClass("map-panel-list-edge-item");
					li.attr("data-uid", data.uid);
				}

				li.append(result);

				if(data.items){
					childListElem = this._recursiveListView(data.items, depth + 1);
					li.append(childListElem);
				}

				ul.append(li);
			}

			return ul;
		},
		/**
		*   <ul>
		*   <li>현재 선택된 Data 리스트를 가져온다.</li>
		*   </ul>
		*   @function getSelectedData
		*   @returns {void}
		*   @alias module:app/widget/map-panel-list
		*
		*/
		getSelectedData : function(){
			var grid, index = this.selectedIndex;
			if(this.options.type == "hybrid"){
				grid = this.tabGrids[index];
			}else{
				grid = this.grid;
			}
			if(this.originalDataSource){
				var data = this.originalDataSource.data();
				var selectedData = new kendo.data.Query(data).filter({ field : "selected", operator : "eq", value : true});
				selectedData = selectedData.toArray();
				return selectedData;
			}
			return grid.getSelectedData();
		}
	});

	kendo.ui.plugin(MapListView);

})(window, jQuery);
//# sourceURL=widget/map-panel-list.js