(function(window, $){
	var kendo = window.kendo,
		ui = kendo.ui,
		Widget = ui.Widget;

	var TEMPLATE = "<div class='container'>" +
						"<div class='contents normal hide-header'>" +
							"<div class='group-list'></div>" +
						"</div>" +
						"<div class='contents edit'>" +
							"<div class='content unselected'>" +
								"<div class='inner'>" +
									"<div class='group-list'></div>" +
								"</div>" +
							"</div>" +
							"<div class='content btn-group'>" +
								"<div class='inner'>" +
									"<div><button class='k-button assign' data-event='assign'>▶</button></div>" +
									"<div><button class='k-button deassign' data-event='deassign'>◀</button></div>" +
								"</div>" +
							"</div>" +
							"<div class='content selected'>" +
								"<div class='inner'>" +
									"<div class='group-list'></div>" +
								"</div>" +
							"</div>" +
						"</div>" +
					"</div>";

	var COMMON_GRID_OPTIONS_PROPS = [
		'width',
		'dataSource',
		'columns',
		'height',
		'hasCheckedModel',
		'isGroupListMode'];

	var TYPE_ASSIGNED = 'assigned',
		TYPE_DEASSIGNED = 'deassigned';
		// TYPE_NORMAL = 'normal';

	// var _getHeaderTemplate = function(type){
	// 	if(type == TYPE_NORMAL){
	// 		return false;
	// 	}
	// 	return '';
	// };
	//
	// var _checkboxCellTemplate = function(data){
	// 	var uid = data.uid;
	// 	var checked = data.checked ? "checked" : "";
	// 	return '<span class="checkbox-wrapper"><input type="checkbox" id="common_group_list_check_' + uid + '" class="k-checkbox" ' + checked + '/><label for="common_group_list_check_' + uid + '" class="k-checkbox-label"></label></span>';
	// };

	var assignedFilter = {logic: 'and', filters: [{field: 'assigned', operator: 'eq', value: true}]} ,
		deAssignedFilter = {logic: 'and', filters: [{field: 'assigned', operator: 'eq', value: false}]};

	var CommonGroupList = Widget.extend({
		options: {
			name: 'CommonGroupList',
			width: null,
			height: 373,
			columns: null,
			data : [],
			group: [],
			filter: null,
			showFields: [],
			hideAllColumns: true,
			groupHeaderTemplate: null,
			showEditListHeader: true,
			hasCheckedModel: true,
			isGroupListMode: true,
			checkedLimit: false,
			headerTitleText: {
				assigned: 'Selected Item',
				deassigned: 'Unselected Item'
			},
			onceExpandParentLevel: 1,
			showNormalMode:true,
			events: [
				'change'
			]
		},
		init: function(element, options){
			var that = this;
			Widget.fn.init.call(that, element, options);

			if (!this.options.columns){
				this.options.columns = [];
			}

			this._gridOptions = this._createGridOpts(this.options);
			this.wrapper = this.element;
			this.dataSource = null;
			this._data = this.options.data;
			this._old = [];
			this.columns = this.options.columns;
			this._group = this.options.group;
			this._filter = {};
			this.normalGroupList = null;
			this.assignedGroupList = null;
			this.deAssignedGroupList = null;
			this._assignedDataSource = null;
			this._deAssignedDataSource = null;
			this._hideAllCollumns = this.options.hideAllColumns;
			this._showEditListHeader = this.options.showEditListHeader;
			this._buttons = [];
			this._showNormalMode = this.options.showNormalMode;

			this._parseDataSource();
			this._initDOM();
			this._initComponent();
			this._attachEvent();
		},
		_createGridOpts: function(opts){//그리드 옵션 생성 메소드
			var result = {}, i, prop = '';
			for (i = 0; i < COMMON_GRID_OPTIONS_PROPS.length; i++){
				prop = COMMON_GRID_OPTIONS_PROPS[i];
				if(prop != 'dataSource'){
					result[prop] = opts[prop];
				}
			}
			return result;
		},
		_parseDataSource: function(){
			// if(this._assignedDataSource instanceof kendo.data.ObservableObject && this._deAssignedDataSource instanceof kendo.data.ObservableObject){
			// 	return 0;
			// }
			var dataArr = this._data;
			var groupArr = this._group;
			var assignArr = [],
				deassignArr = [];

			// // assign 키 할당
			for(var i = 0; i < dataArr.length; i++){
				if(!dataArr[i].hasOwnProperty('assigned')){
					dataArr[i].assigned = false;
				}

				if(dataArr[i].assigned){
					assignArr.push(dataArr[i]);
				}else{
					deassignArr.push(dataArr[i]);
				}
				dataArr[i].checked = false;
			}

			// Assign 리스트 dataSource 생성
			if(this._assignedDataSource instanceof kendo.data.ObservableObject){
				this._assignedDataSource.data(assignArr);
			}else{
				this._assignedDataSource = new kendo.data.DataSource({
					data: assignArr
					// group: groupArr
					// filter: assignedFilter
				});
				this._assignedDataSource.group(groupArr);
			}
			// this._assignedDataSource.filter(assignedFilter);

			// De-Assign 리스트 dataSource 생성
			if(this._deAssignedDataSource instanceof kendo.data.ObservableObject){
				this._deAssignedDataSource.data(deassignArr);
			}else{
				this._deAssignedDataSource = new kendo.data.DataSource({
					data: deassignArr
					// group: groupArr
					// filter: deAssignedFilter
				});
				this._deAssignedDataSource.group(groupArr);
				// this._deAssignedDataSource.filter(deAssignedFilter);
			}

			// 필터 저장
			// this._filter[TYPE_ASSIGNED] = assignedFilter;
			// this._filter[TYPE_DEASSIGNED] = deAssignedFilter;
		},
		_initDOM: function(){
			var options = this.options, cssOpts = {};

			this.element.append($(TEMPLATE));
			this.wrapper.addClass('common-group-list');

			cssOpts.height = options.height;
			if(options.width){
				cssOpts.width = options.width;
			}
			this.wrapper.css(cssOpts);
		},
		_initComponent: function(){
			this._initNormalGroupList();
			this._initSelectedGroupList();
			this._initUnSelectedGroupList();
			this._initButton();
		},
		_initNormalGroupList: function(){ // 기본 조회용 그룹 리스트
			var divNormal = this.wrapper.find('.contents.normal'),
				el = divNormal.find('.group-list');
			var optsObj = {};

			if(this._hideAllCollumns){
				divNormal.addClass('hide-header');
			}else{
				divNormal.removeClass('hide-header');
			}
			el.empty();

			optsObj = {
				width: this.options.width,
				height: this.options.height,
				hasCheckedModel: false,
				isGroupListMode: true,
				columns: this.options.columns
			};

			// 레벨에 따른 펼침 적용
			if(this.options.onceExpandParentLevel !== null){
				optsObj.onceExpandParentLevel = this.options.onceExpandParentLevel;
			}

			this.normalGroupList = el.kendoTreeList(optsObj).data('kendoTreeList');
			this.normalGroupList.setDataSource(this._assignedDataSource);
		},
		_initSelectedGroupList: function(){ // Edit 모드 시 선택된 아이템의 그룹 리스트(왼쪽)
			var divEdit = this.wrapper.find('.contents.edit'),
				el = this.wrapper.find('.content.selected').find('.group-list');
			var optsObj = {};

			if(this._showEditListHeader){
				divEdit.removeClass('hide-header');
			}else{
				divEdit.addClass('hide-header');
			}
			el.empty();

			optsObj = {
				height: this.options.height,
				hasCheckedModel: true,
				isGroupListMode: true,
				checkedLimit: this.options.checkedLimit,
				columns: this.options.columns
			};

			if(this.options.onceExpandParentLevel !== null){
				optsObj.onceExpandParentLevel = this.options.onceExpandParentLevel;
			}

			this.assignedGroupList = el.kendoTreeList(optsObj).data('kendoTreeList');
			this.assignedGroupList.setDataSource(this._assignedDataSource);

			// Assign DataSource를 위젯 인스턴스의 main datasource로 사용
			this._setMainDataSource();
		},
		_initUnSelectedGroupList: function(){ // Edit 모드 시 선택되지 않은 아이템의 그룹 리스트(오른쪽)
			var el = this.wrapper.find('.content.unselected').find('.group-list');
			var optsObj = {};

			el.empty();

			optsObj = {
				height: this.options.height,
				hasCheckedModel: true,
				isGroupListMode: true,
				checkedLimit: this.options.checkedLimit,
				columns: this.options.columns
			};

			if(this.options.onceExpandParentLevel !== null){
				optsObj.onceExpandParentLevel = this.options.onceExpandParentLevel;
			}

			this.deAssignedGroupList = el.kendoTreeList(optsObj).data('kendoTreeList');
			this.deAssignedGroupList.setDataSource(this._deAssignedDataSource);
		},
		_initButton: function(){
			var wrapper = this.wrapper;
			var de = wrapper.find('.k-button.deassign').kendoButton();
			var as = wrapper.find('.k-button.assign').kendoButton();

			this._buttons = [as, de];
		},
		_setMainDataSource: function(){
			this.dataSource = this.assignedGroupList.dataSource;
		},
		setButtonState: function(state, idx){
			if(typeof idx == 'undefined'){
				for(var i = 0; i < this._buttons.length; i++){
					this._buttons[i].data('kendoButton').enable(state);
				}
				return;
			}
			this._buttons[idx].data('kendoButton').enable(state);
		},
		_attachEvent: function(){
			var that = this,
				wrapper = that.wrapper,
				btnDeassign = wrapper.find('.k-button.deassign'),
				btnAssign = wrapper.find('.k-button.assign');

			btnDeassign.on('click', that._deAssignItems.bind(that));// De-Assign
			btnAssign.on('click', that._assignItems.bind(that));// Assign
		},
		_setDefaultButtonState: function(){
			var that = this,
				deAssignedCnt = this.getDeAssignedItems().length,
				assignedCnt = this.getAssignedItems().length,
				asBtn = that._buttons[0].data('kendoButton'),
				deBtn = that._buttons[1].data('kendoButton');

			asBtn.enable(!(deAssignedCnt == 0));
			deBtn.enable(!(assignedCnt == 0));
		},
		_deAssignItems: function(){// selected Group -> unselected Group
			console.time('dataChange');
			var targetDs = this.assignedGroupList.dataSource,
				item = null;
			var targetDsData = targetDs.data(),
				length = targetDsData.length,
				checkedData = this.assignedGroupList.getCheckedData(),
				unCheckedData = this.assignedGroupList.getUncheckedData(),
				resultArr = null;

			var i = 0;

			for(i = 0; i < checkedData.length; i++){
				item = checkedData[i];
				item.assigned = false;
			}

			resultArr = checkedData;
			if(this._deAssignedDataSource.data().length > 0){
				resultArr = $.merge(this._deAssignedDataSource.data(), checkedData);
			}

			this._deAssignedDataSource.data(resultArr);
			this._assignedDataSource.data(unCheckedData);

			this.normalGroupList.setDataSource(this._assignedDataSource);
			this.assignedGroupList.setDataSource(this._assignedDataSource);
			this.deAssignedGroupList.setDataSource(this._deAssignedDataSource);

			this._setDefaultButtonState();
			this.trigger('change', {
				assignedItems: this.getAssignedItems(),
				deassignedItems: this.getDeAssignedItems()
			});
			this.uncheckAll();//성능상 고려 대상
		},
		_assignItems: function(){// unselected Group -> selected Group
			console.time('dataChange');
			var targetDs = this.deAssignedGroupList.dataSource,
				item = null;
			var targetDsData = targetDs.data(),
				length = targetDsData.length,
				checkedData = this.deAssignedGroupList.getCheckedData(),
				unCheckedData = this.deAssignedGroupList.getUncheckedData(),
				resultArr = null;
			var i = 0;

			for(i = 0; i < checkedData.length; i++){
				item = checkedData[i];
				item.assigned = true;
			}

			resultArr = checkedData;
			if(this._assignedDataSource.data().length > 0){
				resultArr = $.merge(this._assignedDataSource.data(), checkedData);
			}

			this._assignedDataSource.data(resultArr);
			this._deAssignedDataSource.data(unCheckedData);

			this.normalGroupList.setDataSource(this._assignedDataSource);
			this.assignedGroupList.setDataSource(this._assignedDataSource);
			this.deAssignedGroupList.setDataSource(this._deAssignedDataSource);

			this._setDefaultButtonState();
			this.trigger('change', {
				assignedItems: this.getAssignedItems(),
				deassignedItems: this.getDeAssignedItems()
			});
			this.uncheckAll();//성능상 고려 대상
		},
		uncheckAll: function(){
			this.assignedGroupList.uncheckAll();
			this.deAssignedGroupList.uncheckAll();
		},
		uncheckAllAssignList: function(){
			this.assignedGroupList.uncheckAll();
		},
		uncheckAllDeAssignList: function(){
			this.deAssignedGroupList.uncheckAll();
		},
		_getAggregateOption: function(){
			var groups = this._group, groupItem,
				aggregate = [];
			for(var i = 0; i < groups.length; i++){
				groupItem = groups[i];
				aggregate.push({
					field: groupItem.field,
					aggregate: 'count'
				});
			}
			return aggregate;
		},
		_getGroupOption: function(){
			var result = [],
				groups = this._group, groupItem;
			for(var i = 0; i < groups.length; i++){
				// var tmp = {};
				// groupItem = groups[i];
				// tmp.field = groupItem.field;
				// tmp.aggregates = [{field: groupItem.field, aggregate: 'count'}];
				// if(groupItem.dir){
				// 	tmp.dir = groupItem.dir;
				// }
				// result.push(tmp);
				groupItem = groups[i];
				result.push({
					field: groupItem.field,
					aggregates: [{field: groupItem.field, aggregate: 'count'}]
				});
			}
			return result;
		},
		_createOldData: function(ds){
			var arr = JSON.parse(JSON.stringify(ds.data()));
			return arr;
		},
		_createNewDataSource: function(data, type){
			//dataSource.data()
			var nd = new kendo.data.DataSource({
				data: data,
				group: this._group
			});
			nd.filter(this._filter[type]);
			return nd;
		},
		_changeDataSources: function(){
			// this.normalGroupList.setDataSource(this._assignedDataSource);
			this.assignedGroupList.setDataSource(this._assignedDataSource);
			this.deAssignedGroupList.setDataSource(this._deAssignedDataSource);
			// this._setMainDataSource();
		},
		_renewDataSources: function(){
			if(this._showNormalMode){
				this.normalGroupList.setDataSource(this._assignedDataSource);
			}
			this.assignedGroupList.setDataSource(this._assignedDataSource);
			this.deAssignedGroupList.setDataSource(this._deAssignedDataSource);
			// this._setMainDataSource();
		},
		data: function(data){
			if(!data){
				return this._data;
			}

			this._data = data;

			console.time('PARSE: ');
			this._parseDataSource();
			console.timeEnd('PARSE: ');

			console.time('TreeList');
			this._renewDataSources();
			console.timeEnd('TreeList');
			this._setDefaultButtonState();
		},
		setDataSource: function(data, group){
			if(!data){
				data = [];
			}
			if(!group){
				group = [];
			}
			this._data = data;
			this._group = group;

			this._parseDataSource();
			this._renewDataSources();
			this._setDefaultButtonState();
		},
		showEditMode: function(){
			this.wrapper.addClass('edit-mode');
		},
		hideEditMode: function(flag, eventType){
			if(flag){//열람 모드 진입
				if(eventType == 'cancelChanged'){
					//최초 hideEditMode(true) 이전의 data인 _old 사용
					// this.data(this._old);
					this.normalGroupList.setDataSource(this._old);
				}else{
					this.normalGroupList.setDataSource(this._assignedDataSource);
				}

				this.wrapper.removeClass('edit-mode');
			}else{//편집 모드 진입
				// this._old = this._createOldData(this.assignedGroupList.dataSource); //편집 모드 진입 직전의 data 저장
				this._old = this._assignedDataSource; //편집 모드 진입 직전의 data 저장
				this.wrapper.addClass('edit-mode');
			}
		},
		setOptions: function(opts){
			this.normalGroupList.setOptions(opts);
			this.assignedGroupList.setOptions(opts);
			this.deAssignedGroupList.setOptions(opts);
		},
		hideAllColumns: function(flag){
			if(flag == this._hideAllCollumns){
				return;
			}
			var divNormal = this.wrapper.find('.contents.normal'),
				grid = this.normalGroupList;

			this._hideAllCollumns = flag;
			this.options.hideAllColumns = flag;

			if(flag){
				divNormal.addClass('hide-header');
			}else{
				divNormal.removeClass('hide-header');
			}

			grid.destroy();
			this._initNormalGroupList();
		},
		showHeader: function(flag){
			if(flag == this._showEditListHeader){
				return;
			}
			var divEdit = this.wrapper.find('.contents.edit');
			this._showEditListHeader = flag;
			this.options.showEditListHeader = flag;
			if(flag){
				divEdit.removeClass('hide-header');
			}else{
				divEdit.addClass('hide-header');
			}
		},
		getAssignedItems: function(){ // 선택된 아이템 GET
			var ds = this.assignedGroupList.dataSource,
				dataArr = ds.data(), dataItem, result = [];
			dataArr = new kendo.data.Query(dataArr).filter({
				logic : 'and',
				filters : [{ field : "hasChildren", operator : "eq", value : false}]
			}).toArray();
			for (var i = 0; i < dataArr.length; i++){
				dataItem = dataArr[i];
				if(dataItem.assigned){
					result.push(dataItem);
				}
			}
			return result;
		},
		getDeAssignedItems: function(){ // 선택된 아이템 GET
			var ds = this.deAssignedGroupList.dataSource,
				dataArr = ds.data(), dataItem, result = [];
			dataArr = new kendo.data.Query(dataArr).filter({
				logic : 'and',
				filters : [{ field : "hasChildren", operator : "eq", value : false}]
			}).toArray();
			for (var i = 0; i < dataArr.length; i++){
				dataItem = dataArr[i];
				if(!dataItem.assigned){
					result.push(dataItem);
				}
			}
			return result;
		},
		group: function(arr){
			var self = this;
			if(!arr){
				return this._group;
			}

			this._group = arr;

			self.normalGroupList.destroy();
			self.assignedGroupList.destroy();
			self.deAssignedGroupList.destroy();

			self._parseDataSource();
			self._initNormalGroupList();
			self._initSelectedGroupList();
			self._initUnSelectedGroupList();
		}
	});

	kendo.ui.plugin(CommonGroupList);
})(window, window.kendo.jQuery);