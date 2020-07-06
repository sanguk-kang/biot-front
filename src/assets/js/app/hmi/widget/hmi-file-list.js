(function($){
	"use strict";
	var kendo = window.kendo,
		ui = kendo.ui,
		Widget = ui.Widget;

	var FILE_LIST_TEMPLATE = '<div class="hmi-file-list-wrapper">' +
			'<div class="hmi-file-list-top"></div>' +
			'<div class="hmi-file-list-tree"></div>' +
			'<div class="hmi-file-list-search-list" style="display:none;"></div>' +
			'<div class="hmi-file-list-bottom"></div>' +
		'</div>';

	var FILE_LIST_CREATE_BTN_TEMPLATE = function(){
		var I18N = window.I18N;
		return '<button class="k-button create-btn">' + I18N.prop("COMMON_BTN_CREATE") + '</button>';
	};

	var FILE_LIST_CREATE_TYPE_TEMPLATE = function(){
		var I18N = window.I18N;
		return '<div class="create-type" style="display:none;">' +
				'<ul>' +
					'<li data-type="folder">' + I18N.prop("HMI_NEW_FOLDER") + '</li>' +
					'<li data-type="file">' + I18N.prop("HMI_NEW_FILE") + '</li>' +
				'</ul>' +
			'</div>';
	};

	var FILE_LIST_SEARCH_FIELD_TEMPLATE = function(){
		var I18N = window.I18N;
		return '<span class="search-field-wrapper"><input type="text" class="k-input search-field" placeholder="' + I18N.prop("HMI_FILE_NAME") + '"/>' +
			'<button class="ic ic-bt-input-search"></button></span>';
	};

	var FILE_LIST_BUTTONS_TEMPLATE = function(type){
		var I18N = window.I18N;
		var template = "";
		if(type == "create") template = '<button class="k-button edit-btn">' + I18N.prop("COMMON_BTN_EDIT") + '</button>';
		else if(type == "delete") template = '<button class="k-button delete-btn">' + I18N.prop("COMMON_BTN_DELETE") + '</button>';
		return template;
	};

	var isFileData = function(data){
		return !data.isFolder;
	};

	var FILE_LIST_COLUMN_TEMPLATE = function(data){
		var isFile = isFileData(data);
		var detailBtn = "", fileBadge = "", expandArrow = "";
		if(isFile || (data.isFolder && data.hasChildren)){
			var newFile = (data._isNew && isFile) ? "new" : "";
			var newFileStr = (isFile && newFile) ? "NEW" : "";
			var isRootLevel = data.treeDepth == 1 ? "root" : "";
			fileBadge = "<span class='file-badge " + newFile + " " + isRootLevel +  " '>" + newFileStr + "</span>";
			detailBtn = isFile ? "<span class='ic ic-info'></span>" : "";
			return fileBadge + "<span class='file-name " + isRootLevel + "' title='" + data.name + "'>" + data.name + "</span>" + detailBtn;
		}
		expandArrow = "<span class='k-icon k-i-expand'></span>";
		return "<div class='new-folder'>" + expandArrow + "<span class='file-name' title='" + data.name + "'>" + data.name + "</span>" + "</div>";
	};

	var NEW_FOLDER_NAME = "New Folder";
	var NEW_FILE_NAME = "New File";

	function searchHighlightReplacer(str){
		return '<span class=search-highlight>' + str + '</span>';
	}

	function escapeRegExp(str){
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	var HmiFileList = Widget.extend({
		options: {
			name : "HmiFileList",
			dataSource: null,
			searchable : true,
			creatable : true,
			editable : true,
			deletable : true,
			treeListOptions : {
				isOnlyChildrenSelectable : false,
				editable : {
					mode : "inline",
					move : true
				}
			},
			searchGridOptions : {}
		},
		events :[
			"change",
			"create",
			"delete",
			"detail",
			"edit"	//folder name edited
		],
		init : function(element, options){
			var that = this;
			var I18N = window.I18N;
			Widget.fn.init.call(this, element, options);
			options = that.options;

			NEW_FILE_NAME = I18N.prop("HMI_NEW_FILE");
			NEW_FOLDER_NAME = I18N.prop("HMI_NEW_FOLDER");
			that._createWrapper();
			that._createFileTreeList();
			//that._tooltip();

			if(options.creatable) that._createCreateButton();
			if(options.searchable) that._createSearch();
			if(options.editable) that._createEditButton();
			if(options.deletable) that._createDeleteButton();
			if(!options.creatable && !options.searchable) that.topWrapper.hide();
			if(!options.editable && !options.deletable) that.bottomWrapper.hide();
			that._calculateListHeight();
			that._attachEvt();
		},
		_createWrapper : function(){
			var that = this;
			that.element.html(FILE_LIST_TEMPLATE);
			that.parentWrapper = that.element.find(".hmi-file-list-wrapper");
			that.topWrapper = that.element.find(".hmi-file-list-top");
			that.treeWrapper = that.element.find(".hmi-file-list-tree");
			that.listWrapper = that.element.find(".hmi-file-list-search-list");
			that.bottomWrapper = that.element.find(".hmi-file-list-bottom");
		},
		_calculateListHeight : function(){
			var that = this;
			var topHeight = that.topWrapper.is(":visible") ? that.topWrapper.outerHeight() : 0;
			var bottomHeight = that.bottomWrapper.is(":visible") ? that.bottomWrapper.outerHeight() : 0;
			var tabHeight = 0;
			/*var tabStrip = that.element.closest(".common-tab-strip");
			//탭 안에 존재할 경우 탭 높이 계산
			if(tabStrip.length > 0){
				var tab = tabStrip.find(".k-tabstrip-items li.k-item:eq(0)");
				if(tab.length > 0) tabHeight = tab.outerHeight();
			}*/

			var sumHeightPx = (topHeight + bottomHeight + tabHeight) + "px";
			that.treeWrapper.css("height", "calc(100% - " + sumHeightPx + " )");
			that.listWrapper.css("height", "calc(100% - " + sumHeightPx + " )");
		},
		_attachEvt : function(){
			var that = this, options = that.options;
			var selectionChangeEvt = that._selectionChangeEvt.bind(that);
			that.treeList.bind("change", selectionChangeEvt);
			that.treeList.bind("dragstart", that._dragStartEvt.bind(that));
			that.treeList.bind("drag", that._dragEvt.bind(that));
			that.treeList.bind("dragend", that._dragEndEvt.bind(that));
			that.treeList.bind("expand", that._expandEvt.bind(that));
			that.treeList.bind("collapse", that._collapseEvt.bind(that));
			that.treeList.element.on("click", ".k-grid-content tr[role='row']", that._fileRowClickEvt.bind(that));
			if(options.editable){
				that.treeList.bind("save", that._saveEvt.bind(that));
			}

			if(options.searchable){
				that.searchList.bind("change", selectionChangeEvt);
			}
			//상세 정보 아이콘 클릭
			that.element.on("click", "tr > td .ic.ic-info", that._detailEvt.bind(that));
			that.element.on("keydown", "tr.k-grid-edit-row .k-input", function(e){
				if(e.keyCode == 13) that.saveRow();
				if(e.keyCode == 27) that.cancelRow();
			});
		},
		_detailEvt : function(e){
			var that = this;
			var tr = $(e.target).closest("tr");
			var id = tr.data("id");
			var ds = that.treeList.dataSource;
			var item = ds.get(id);
			that.trigger("detail", { item : item });
		},
		_dragStartEvt : function(e){
			var that = this;
			var source = e.source;
			that.trigger("dragstart", { item : source });
		},
		_dragEvt : function(e){
			var that = this;
			var target = e.target;
			var source = e.source;
			var row = target.closest("tr[role='row']");
			if(that._draggedRow && that._draggedRow != row) that._draggedRow.removeClass("dragging");
			that._draggedRow = row;
			that._draggedRow.addClass("dragging");
			var id = row.data("id");
			var ds = that.treeList.dataSource;
			var targetItem = ds.get(id);

			if(targetItem){
				if(source.isFolder && !targetItem.isFolder){
					e.setStatus("k-i-cancel");
					that._draggedRow.removeClass("dragging");
					e.preventDefault();
				}else{
					//드래그하는 소스가 파일이고, 드롭하려는 타겟이 폴더이면서 폴더가 펼쳐져 있지 않을 때
					if(!source.isFolder && targetItem.isFolder && !targetItem.expanded){
						targetItem.set("expanded", true);
						that._expandEvt({ model : targetItem });
					}
					that.trigger("drag", { source : source, target : targetItem });
				}
			}
		},
		_dragEndEvt : function(e){
			var that = this;
			var source = e.source;
			var target = e.destination;
			if(that._draggedRow){
				that._draggedRow.removeClass("dragging");
				that._draggedRow = null;
			}
			var firstOrder, lastOrder, orderedItems = [];
			if(target){
				if(source.isFolder && target.isFolder){	//타겟과 소스가 폴더일 때 order 변경
					//타겟 폴더의 가장 마지막 Order에서 + 1한다. Order는 Folder와 File 같은 종류의 Order를 갖는다.
					lastOrder = that._getLastOrderInFolder(target.id);
					source.set("sortOrder", lastOrder + 1);
					orderedItems = that._reOrderFromSource(source);
				}else if(!source.isFolder && target.isFolder){ //타겟이 폴더고, 소스가 파일일 때 parent_id 변경
					if(target.id == source.parent_id){	//같은 부모 일 경우 가장 앞에 위치
						firstOrder = that._getFirstOrderInFolder(target.id);
						//폴더 내 가장 첫번째 order로 변경
						source.set("sortOrder", firstOrder - 1);
					}else{
						lastOrder = that._getLastOrderInFolder(target.id);
						source.set("parent_id", target.id);
						//폴더 내 가장 아래로 order 변경
						source.set("sortOrder", lastOrder + 1);
					}
					source.treeDepth = 2;
					source.set("_isNew", false);
					orderedItems = that._reOrderFromSource(source);
				}else if(!source.isFolder && !target.isFolder){ //타겟이 파일이고, 소스가 파일일 때 order 변경
					//부모가 다를 경우 부모 변경
					if(source.parent_id != target.parent_id){
						source.set("parent_id", target.parent_id);
						if(target.parent_id) source.treeDepth = 2;	//부모가 존재
						else source.treeDepth = 1;	//부모가 존재하지 않음
					}
					//order 변경
					source.set("sortOrder", target.sortOrder + 1);
					orderedItems = that._reOrderFromSource(source);
				}
			}else{	//타겟이 Root 일 때
				var originalEvent = e.originalEvent;
				var dropY = originalEvent.clientY;
				var firstRowEl = that.treeList.element.find(".k-grid-content tr[role='row']:first-child");
				var lastRowEl = that.treeList.element.find(".k-grid-content tr[role='row']:last-child");
				var firstOffset = firstRowEl.offset(), firstY = firstOffset.top;
				var lastOffset = lastRowEl.offset(), lastY = lastOffset.top;
				//가장 맨 위
				source.set("parent_id", null);
				source.treeDepth = 1;
				if(dropY < firstY){
					source.set("sortOrder", 1);
					orderedItems = that._reOrderFromSource(source);
				}else if(dropY > lastY){	//가장 아래
					lastOrder = that._getLastOrder();
					source.set("sortOrder", lastOrder + 1);
				}
			}
			that.trigger("dragend", { source : source, target : target, orderedItems : orderedItems });
			that.treeList.dataSource.fetch();
		},
		_getLastOrderInFolder : function(parent_id){
			var that = this, treeList = that.treeList;
			var data = treeList.dataSource.data();
			var children = new kendo.data.Query(data).filter({ field : "parent_id", eq : "eq", value : parent_id})
				.sort({ field : "sortOrder", dir : "asc"}).toArray();
			var lastOrderItem = children[children.length - 1];
			if(lastOrderItem) return lastOrderItem.sortOrder;
			//자식 중 존재하지 않으면 부모의 sortOrder가 마지막 Order이다.
			var parent = treeList.dataSource.get(parent_id);
			return parent.sortOrder;
		},
		_getFirstOrderInFolder : function(parent_id){
			var that = this, treeList = that.treeList;
			var data = treeList.dataSource.data();
			var children = new kendo.data.Query(data).filter({ field : "parent_id", eq : "eq", value : parent_id})
				.sort({ field : "sortOrder", dir : "asc"}).toArray();
			var firstOrderItem = children[0];
			if(firstOrderItem) return firstOrderItem.sortOrder;
			//자식 중 존재하지 않으면 부모의 sortOrder가 처음 Order이다.
			var parent = treeList.dataSource.get(parent_id);
			return parent.sortOrder;
		},
		_getLastOrder : function(){
			var that = this, treeList = that.treeList;
			var data = treeList.dataSource.data();
			var items = new kendo.data.Query(data).sort({ field : "sortOrder", dir : "asc"}).toArray();
			var lastOrderItem = items[items.length - 1];
			if(lastOrderItem) return lastOrderItem.sortOrder;
			//아무 데이터도 존재하지 않을 경우
			return 0;
		},
		_reOrderFromSource : function(source){
			var that = this, treeList = that.treeList;
			//아직 fetch()를 통해 뷰가 변경되지 않았으므로 flatView 대신 data로 Query 한다.
			var data = treeList.dataSource.data();
			//타겟의 이후의 Order 값을 가진 모든 데이터의 Order를 뒤로 민다.
			var orderedData = new kendo.data.Query(data).sort([
				{
					field : "sortOrder", dir : "asc"
				}
			]).filter({ logic : "and",
				filters : [{
					field : "sortOrder", operator : "gte", value : source.sortOrder
				}, {
					field : "id", operator : "neq", value : source.id
				}]}).toArray();
			var i, max = orderedData.length;
			var sourceOrder = source.sortOrder;
			for ( i = 0; i < max; i++ ){
				orderedData[i].set("sortOrder", sourceOrder + (i + 1));
			}
			return orderedData;
		},
		reOrderAllItems : function(){
			var that = this, treeList = that.treeList;
			var orderedData = treeList.dataSource.view();
			/*var orderedData = new kendo.data.Query(data).sort([
				{
					field : "sortOrder", dir : "asc"
				}
			]).toArray();*/
			var i, max = orderedData.length;
			for ( i = 0; i < max; i++ ){
				orderedData[i].sortOrder = i + 1;
			}
			return orderedData;
		},
		_selectionChangeEvt : function(e){
			var that = this;
			var isSelectFunction = e.isSelectFunction;
			var data = that.getSelectedData();
			var isSelected = data ? true : false;
			that._updateButtonStateFromSelectedData();
			//선택 시, NEW File Badge 삭제
			//if(isSelected && data._isNew && !data.isFolder) data.set("_isNew", false);
			if(isSelected && !data.isFolder && !isSelectFunction){
				var newFile, newFiles = that._getNewFiles();
				var i, max = newFiles.length;
				for( i = 0; i < max; i++ ){
					newFile = newFiles[0];
					newFile.set("_isNew", false);
				}
			}
			if(isSelected && !data._isNew && !data.isFolder) that._recentSelectedFile = data;
			that.trigger("change", e);
		},
		_fileRowClickEvt : function(e){
			var that = this, treeList = that.treeList, ds = treeList.dataSource, options = that.options;
			var target = $(e.target);
			var row = target.closest("tr[role='row']");
			var id = row.data("id");
			var item = ds.get(id);
			if(item.isFolder){
				var treeListOptions = options.treeListOptions;
				//하이퍼링크 파일리스트의 파일만 선택 가능한 모드일 경우 폴더에 대한 처리
				if(treeListOptions && treeListOptions.isOnlyChildrenSelectable){
					if(!item.expanded){
						item.set("expanded", true); //선택 시, 접혀있을 경우 펼침
						that._expandEvt({ model : item });
					}else{
						item.set("expanded", false);
						that._expandEvt({ model : item });
					}
				}else if(!item.expanded){
					item.set("expanded", true); //선택 시, 접혀있을 경우 펼침
					that._expandEvt({ model : item });
					var selectedItem = that.getSelectedData();
					if(!item.selected){
						item.set("selected", true);
						selectedItem.set("selected", false);
					}
				}else if(item.selected && item.expanded){
					item.set("expanded", false); //이미 선택 및 펼쳐져 있는 경우 접는다.
					that._collapseEvt({ model : item });
				}
			}
		},
		_updateButtonStateFromSelectedData : function(){
			var that = this, options = that.options;
			var data = that.getSelectedData();
			var isSelected = data ? true : false;
			if(options.editable) that.editButton.prop("disabled", !isSelected);
			if(options.deletable) that.deleteButton.prop("disabled", !isSelected);
		},
		//생성 버튼 및 버튼 동작
		_createCreateButton : function(){
			var that = this;
			that.topWrapper.append(FILE_LIST_CREATE_BTN_TEMPLATE());
			that.createButton = that.topWrapper.find(".create-btn");
			//생성 버튼 클릭
			that.createButton.on("click", function(){
				var isActive = $(this).hasClass("active");
				that.visibleCreateTypeSelectBox(!isActive);
			});
			that.parentWrapper.prepend(FILE_LIST_CREATE_TYPE_TEMPLATE());
			that.createType = that.parentWrapper.find(".create-type");
			//폴더 또는 파일 생성 클릭
			that.createType.on("click", "ul > li", function(){
				if(that._isSearching) that.clearSearchResult();
				var createdData, type = $(this).data("type");
				//Event Cancel 체크
				if(type == "folder"){
					createdData = that.addFolder();
				}else{	//file
					createdData = that.addFile(null);
				}
				that.trigger("create", { type : type, item : createdData});
				that.visibleCreateTypeSelectBox(false);
			});
		},
		visibleCreateTypeSelectBox : function(isVisible){
			var that = this;
			if(isVisible){
				that.createButton.addClass("active");
				//Document 클릭 시, 닫는 이벤트 바인딩을 위함
				//Open 시, on 닫을 시, off
				if(!that._closeCreateTypeSelectBox){
					that._closeCreateTypeSelectBox = function(e){
						var target = $(e.target);
						if(!target.hasClass("create-btn")
						/*&& target.closest(".create-type").length < 1*/){
							that.visibleCreateTypeSelectBox(false);
						}
					};
				}
				var offset = that.createButton.offset();
				that.createType.show();
				var defaultRightMargin = 15;
				var defaultTopMargin = -2;
				offset.top = offset.top + defaultTopMargin;
				offset.left = offset.left - that.createType.width() - defaultRightMargin;
				that.createType.offset(offset);
				$(document).on("click", that._closeCreateTypeSelectBox);
			}else{
				that.createButton.removeClass("active");
				$(document).off("click", that._closeCreateTypeSelectBox);
				that.createType.hide();
			}
		},
		getNewName : function(type){
			var that = this;
			var data = that.treeList.dataSource.data();
			var defaultName = type == "file" ? NEW_FILE_NAME : NEW_FOLDER_NAME;
			var defaultNameQuery = new kendo.data.Query(data);
			var defaultNameData = defaultNameQuery.filter({ field : "name", operator : "eq", value : defaultName }).toArray();
			//새 폴더 또는 새 파일이 존재하지 않을 경우 해당 이름으로 생성
			if(defaultNameData.length == 0) return defaultName;

			var query = new kendo.data.Query(data);
			query = query.filter({ field : "name", operator : "contains", value : defaultName });
			query = query.filter({ field : "name", operator : function(name, value){
				return that.isAutoCreatedName(name, type) != 0;
			}, value : defaultName});
			query = query.sort({ field : "name", dir : "asc", compare : function(a, b){
				a = a.name;
				b = b.name;
				return that.isAutoCreatedName(a, type) - that.isAutoCreatedName(b, type);
			}});
			data = query.toArray();
			var cnt = 1, number;
			var name, i, max = data.length;
			for( i = 0; i < max; i++ ){
				name = data[i].name;
				number = that.isAutoCreatedName(name, type);
				if(number == cnt) cnt++;
			}
			name = defaultName + " " + cnt;
			return name;
		},
		isAutoCreatedName : function(name, type){
			if(!name) return false;
			var defaultName = type == "file" ? NEW_FILE_NAME : NEW_FOLDER_NAME;
			var split = name.split(defaultName);
			if(split.length > 1 && !isNaN(Number(split[1]))){
				return Number(split[1]);
			}
			return 0;
		},
		_createNewFile : function(name, folderId){
			var that = this;
			if(!name) name = that.getNewName("file");
			var lastOrder, treeDepth;
			if(folderId){
				lastOrder = that._getLastOrderInFolder(folderId);
				treeDepth = 2;
			}else{
				lastOrder = that._getLastOrder();
				folderId = null;
				treeDepth = 1;
			}
			var sortOrder = lastOrder + 1;
			var newFile = {
				_isNew : true,
				isFolder : false,
				id : kendo.guid(),
				name : name,
				sortOrder : sortOrder,
				treeDepth : treeDepth,
				parent_id : folderId,
				parentId : folderId,
				createdDate : "-"
			};
			return newFile;
		},
		addFile : function(name){
			var that = this;
			var data = that.getSelectedData();
			var folderId;
			if(data){
				if(data.isFolder) folderId = data.id;
				else if(data.parent_id) folderId = data.parent_id;
			}
			var fileObj = that._createNewFile(name, folderId);
			//DataSource의 cancelChanges로  File 생성 롤백 가능한 케이스를 고려하지 않고 add 대신 pushCreate 하여 추가
			//that.treeList.dataSource.pushCreate(fileObj);
			that.editDataSourceWithTransport("add", that.treeList.dataSource, fileObj);
			var item = that.treeList.dataSource.get(fileObj.id);
			return item;
		},
		_createNewFolder : function(name){
			var that = this;
			if(!name) name = that.getNewName("folder");
			var lastOrder = that._getLastOrder();
			var newFolder = {
				isFolder : true,
				_isNew : true,
				id : kendo.guid(),
				name : name,
				sortOrder : lastOrder + 1,
				treeDepth : 1,
				parent_id : null,
				parentId : null,
				createdDate : "-"
			};
			return newFolder;
		},
		addFolder : function(name){
			var that = this;
			var folderObj = that._createNewFolder(name);
			//DataSource의 cancelChanges로 Folder 생성 롤백 가능한 케이스를 고려하지 않고 add 대신 pushCreate 하여 추가
			//that.treeList.dataSource.pushCreate(folderObj);
			that.editDataSourceWithTransport("add", that.treeList.dataSource, folderObj);
			var item = that.treeList.dataSource.get(folderObj.id);
			return item;
		},
		//검색 필드 및 검색 리스트
		_createSearch : function(){
			var that = this;
			that.topWrapper.append(FILE_LIST_SEARCH_FIELD_TEMPLATE());
			that.searchWrapper = that.topWrapper.find(".search-field-wrapper");
			that.searchField = that.topWrapper.find(".search-field");
			that.searchButton = that.topWrapper.find('.ic-bt-input-search');
			//검색
			var searchEvt = that.search.bind(that);
			that.searchField.on("keyup", searchEvt);
			that.searchButton.on("click", function(e){
				if(that._isSearching) that.searchField.val("");
				that.search({ keyCode : kendo.keys.ENTER });
			});
			that._createSearchList();
		},
		search : function(e){
			var that = this, keywords;
			keywords = that.searchField.val();
			if(e.keyCode && e.keyCode == kendo.keys.ENTER){
				that.enableSearchList(keywords);
			}else if(that.searchWrapper.hasClass("searching")){
				that._isSearching = false;
				that.searchWrapper.removeClass("searching");
			}

		},
		clearSearchResult : function(){
			var that = this;
			that.searchField.val("");
			that.search({ keyCode : kendo.keys.ENTER });
		},
		enableSearchList : function(keywords){
			var that = this;
			if(keywords){
				//돋보기 아이콘 X 버튼 표시
				that.searchWrapper.addClass("searching");
				that._isSearching = true;
				that.treeWrapper.hide();
				that.searchList.setDataSource(that._getSearchListDataSource());
				if(keywords){
					//filter
					var ds = that.searchList.dataSource;
					var filter = { logic : "and", filters : [
						{
							field : "isFolder",
							operator : "eq",
							value : false
						},
						{
							field : "name",
							operator : "contains",
							value : keywords
						}
					]};
					ds.filter(filter);
				}
				that.createButton.prop("disabled", true);
				that.listWrapper.show();
			}else{
				that.searchWrapper.removeClass("searching");
				that._isSearching = false;
				that.listWrapper.hide();
				that.searchList.setDataSource(that._getSearchListDataSource([]));
				//셀렉션 상태 동기화를 위한 fetch
				that.treeList.dataSource.fetch();
				that.createButton.prop("disabled", false);
				that.treeWrapper.show();
			}
			that._updateButtonStateFromSelectedData();
		},
		//검색 결과 리스트
		_createSearchList : function(){
			var that = this, options = that.options, searchGridOptions = options.searchGridOptions;
			searchGridOptions.selectable = "row";
			searchGridOptions.hasSelectedModel = searchGridOptions.hasDoubleClickEvt = true;
			if(!searchGridOptions.dataSource){
				searchGridOptions.dataSource = that._getSearchListDataSource();
			}
			if(!searchGridOptions.columns){
				searchGridOptions.columns = [{ field : "name", template : FILE_LIST_COLUMN_TEMPLATE }];
			}
			//검색 리스트
			that.searchList = that.listWrapper.kendoGrid(searchGridOptions).data("kendoGrid");
			that.listWrapper.find(".k-grid-header").hide();
			that.searchList.bind("dataBound", that.highlightSearchResult.bind(that));
		},
		highlightSearchResult : function(){
			var that = this;
			var keywords = that.searchField.val();
			if(keywords){
				var rowElements = that.searchList.items();
				var text, rowEl, i, max = rowElements.length;
				var regex = new RegExp(escapeRegExp(keywords), "gi");

				for( i = 0; i < max; i++ ){
					rowEl = $(rowElements[i]);
					rowEl = rowEl.find(".file-name");
					text = rowEl.html();
					text = text.replace(regex, searchHighlightReplacer);
					rowEl.html(text);
				}
			}
		},
		_getSearchListDataSource : function(data){
			var that = this, treeList = that.treeList, ds = treeList.dataSource;
			if(!data){
				if(!ds) data = [];
				else data = ds.data();
			}
			var listDs = new kendo.data.DataSource({
				data : data
			});
			listDs.read();
			return listDs;
		},
		//파일 리스트
		_createFileTreeList : function(){
			var that = this, options = that.options, treeListOptions = options.treeListOptions;
			treeListOptions.selectable = "row";
			treeListOptions.customDragEndEvent = true;
			treeListOptions.hasSelectedModel = treeListOptions.hasDoubleClickEvt = treeListOptions.isOnlySelection = true;
			var I18N = window.I18N;
			treeListOptions.messages = {  noRows : I18N.prop("HMI_NO_GRAPHICS") };
			if(!treeListOptions.dataSource){
				treeListOptions.dataSource = new kendo.data.TreeListDataSource({
					data : [],
					schema : {
						model : {
							id : "id",
							expanded : true
						}
					}
				});
				that._applyDefaultSort(treeListOptions.dataSource);
			}
			if(!treeListOptions.columns){
				treeListOptions.columns = [{ field : "name", template : FILE_LIST_COLUMN_TEMPLATE,
					editable : function(data){
						return data.isFolder;
					}
				}];
			}
			that.treeList = that.treeWrapper.kendoTreeList(treeListOptions).data("kendoTreeList");
			that.treeWrapper.find(".k-grid-header").hide();
		},
		_tooltip : function(){
			var that = this, element = that.element;
			var tooltip = element.data("kendoTooltip");
			if(!tooltip){
				element.kendoTooltip({
					filter : ".hmi-file-list-tree .k-grid-content tbody > tr",
					wrapperCssClass : "hmi-palette-tooltip",
					content : function(e){
						var target = $(e.target);
						var fileNameEl = target.find("> td span.file-name");
						if(fileNameEl.length > 0){
							return target.find("> td span.file-name").attr("title");
						}
						return null;
					},
					position : "left"
				}).data("kendoToolTip");
			}else{
				tooltip.refresh();
			}
		},
		setDataSource : function(treeDataSource){
			var that = this;
			if(that.treeList){
				that._applyDefaultSort(treeDataSource);
				//UI에서 New File을 유지한다.
				var newFiles = that._getNewFiles();
				that.treeList.setDataSource(treeDataSource);
				that._applyNewFiles(newFiles);
			}
		},
		_applyNewFiles : function(files){
			var that = this, treeList = that.treeList, ds = treeList.dataSource;
			if(ds){
				var item, i, max = files.length;
				for( i = 0; i < max; i++ ){
					item = ds.get(files[i].id);
					if(item) item.set("_isNew", files[i]._isNew);
				}
			}
		},
		_getNewFiles : function(){
			var that = this, treeList = that.treeList, ds = treeList.dataSource;
			if(ds){
				var data = ds.data();
				var newFiles = new kendo.data.Query(data).filter({ logic : "and",
					filters : [{
						field : "isFolder", operator : "eq", value : false
					},{
						field : "_isNew", operator : "eq", value : true
					}]}).toArray();
				return newFiles;
			}
		},
		_applyDefaultSort : function(treeDataSource){
			var that = this;
			if(treeDataSource instanceof kendo.data.DataSource){
				treeDataSource.sort(that._getDefaultSort());
			}
		},
		_getDefaultSort : function(){
			return [{
				field : "sortOrder", dir : "asc"
			}];
		},
		//파일 편집 버튼
		_createEditButton : function(){
			var that = this;
			that.bottomWrapper.append(FILE_LIST_BUTTONS_TEMPLATE("create"));
			that.editButton = that.bottomWrapper.find(".edit-btn");
			that.editButton.prop("disabled", true);
			that.editButton.on("click", function(e){
				var data = that.getSelectedData();
				if(data.isFolder){
					//폴더 편집. 텍스트 에디터 생성 후 편집 시, TreeList로부터 "save"가 Trigger 됨.
					that.editRow(data);
					return false;
				}
				//파일 편집
				that.trigger("edit", {event : e, item : data});
			});
		},
		editRow : function(data){
			var that = this;
			if(that._editingRow) return false;	//이미 편집중인 상태
			var id = data.id;
			var row = that.treeWrapper.find("tr[data-id='" + id + "']");
			if(!that._saveRowEvt) that._saveRowEvt = that.saveRow.bind(that);
			that.treeList.editRow(row);
			if(that.treeList.editor){
				//editRow 호출 시, DOM이 재렌더링 되므로 다시 가져온다.
				row = that.treeWrapper.find("tr[data-id='" + id + "']");
				that._editingRow = row;
				that._editingData = data;
				var input = that._editingRow.find(".k-input");
				that._editingValidator = input.kendoCommonValidator({
					type : "hmiGraphicName",
					required : true
				}).data("kendoCommonValidator");
				$(document).on("click", that._saveRowEvt);
			}
		},
		saveRow : function(e){
			var that = this;
			if(e && e.target){	// document click 이벤트로 호출될 시.
				var editingRow = $(e.target).closest(".k-grid-edit-row");
				if(editingRow.length > 0) return false;
			}

			if(that._editingRow){
				if(that._editingValidator.validate()){
					if(!that._folderEditSucess) that._folderEditSuccess = that._folderEditSuccessCallback.bind(that);
					if(!that._folderEditFail) that._folderEditFail = that._folderEditFailCallback.bind(that);
					//saveRow 호출 시, Validator 초기화로 인하여 Tree List 내 Editor의 View Model이 정상동작하지 않으므로,
					//Validator를 통해 값을 가져온다.
					var editedValue = that._editingValidator.element.val();
					var editedData = that._editingData.toJSON();
					editedData.name = editedValue;
					that._editedValue = editedValue;
					that.trigger("edit", { item : editedData,
						success : that._folderEditSuccess, fail : that._folderEditFail });
					//that._editingData.set("name", editedValue);
					//that.treeList.saveRow(that._editingRow);
					//that._editingRow = null;
					//that._editingData = null;
					//that._editingValidator = null;
					$(document).off("click", that._saveRowEvt);
				}
			}
		},
		cancelRow : function(){
			var that = this;
			if(that._editingRow){
				that.treeList.cancelRow();
				that._editingData.set("selected", true);
				that._editingRow = null;
				that._editingData = null;
				that._editingValidator = null;
			}
			$(document).off("click", that._saveRowEvt);
		},
		_saveEvt : function(e){
			//var that = this;
			//e.item = e.model;
			//delete e.model;
			//that.trigger("edit", e);
		},
		_folderEditSuccessCallback : function(){
			var that = this;
			that._editingData.set("name", that._editedValue);
			that.treeList.saveRow(that._editingRow);
			that._editedValue = null;
			that._editingRow = null;
			that._editingData = null;
			that._editingValidator = null;
		},
		_folderEditFailCallback : function(){
			var that = this;
			that.cancelRow();
		},
		//파일 삭제 버튼
		_createDeleteButton : function(){
			var that = this;
			that.bottomWrapper.append(FILE_LIST_BUTTONS_TEMPLATE("delete"));
			that.deleteButton = that.bottomWrapper.find(".delete-btn");
			that.deleteButton.prop("disabled", true);
			that.deleteButton.on("click", function(e){
				var data = that.getSelectedData();
				that.trigger("delete", {event : e, item : data});
			});
		},
		getSelectedData : function(){
			var that = this;
			var files;
			if(that._isSearching) files = that.searchList.getSelectedData(true);
			else files = that.treeList.getSelectedData();
			return files[0];
		},
		selectById : function(id, isSelect){
			var that = this;
			var selectedData = that.treeList.getSelectedData();
			var ds = that.treeList.dataSource;
			var item = ds.get(id);
			if(typeof isSelect === "undefined") isSelect = true;
			if(isSelect){
				var i, max = selectedData.length;
				for( i = 0; i < max; i++ ){
					selectedData[i].selected = false;
				}
			}
			if(item){
				item.set("selected", isSelect);
				if(isSelect && item.parent_id){
					var parent = ds.get(item.parent_id);
					if(parent){
						parent.set("expanded", true);
						that._expandEvt({ model : parent });
					}
				}
				if(isSelect && !item._isNew && !item.isFolder) that._recentSelectedFile = item;
				that._updateButtonStateFromSelectedData();
			}
		},
		select : function(data, isSelect, noTrigger){
			var that = this, item;
			var ds = that.treeList.dataSource;
			if(data instanceof kendo.data.ObservableObject){
				item = data;
			}else if(typeof data === "string" || typeof data === "number"){
				item = ds.get(data);
			}

			if(item){
				var orgSelected = item.selected;
				item.set("selected", isSelect);
				if(isSelect && item.parent_id){
					var parent = ds.get(item.parent_id);
					if(parent){
						parent.set("expanded", true);
						that._expandEvt({ model : parent });
					}
				}
				if(!noTrigger && orgSelected != isSelect){
					that._selectionChangeEvt( {item : item, isSelectFunction : true });
				}else if(isSelect && !item._isNew && !item.isFolder){
					that._recentSelectedFile = item;
				}
			}
		},
		getFiles : function(){
			var that = this;
			var ds = that.treeList.dataSource;
			var data = ds.data();
			return new kendo.data.Query(data).filter({ field : 'isFolder', operator : "eq", value : false }).toArray();
		},
		getFolders : function(){
			var that = this;
			var ds = that.treeList.dataSource;
			var data = ds.data();
			return new kendo.data.Query(data).filter({ field : 'isFolder', operator : "eq", value : true }).toArray();
		},
		destroy : function(){
			Widget.fn.destroy.apply(this, arguments);
		},
		apiPatchReOredredFiles : function(){
			var that = this;
			var HmiApi = window.HmiApi;
			var orderedItems = that.reOrderAllItems();
			return HmiApi.patchFiles(orderedItems);
		},
		apiPostFile : function(file, data){
			var that = this, treeList = that.treeList, ds = treeList.dataSource;
			var HmiApi = window.HmiApi, Util = window.Util, I18N = window.I18N;
			var dfd = new $.Deferred();
			//최초 파일 생성 sortOrder 업데이트
			HmiApi.postFile(file, data).done(function(newFileId){
				var oldId = file.id;
				var item = ds.get(oldId);
				if(item){
					//새로운 ID 값 업데이트
					//Set을 통하여 ID 변경이 불가. dataSource Sync 시, 삭제되지 않기 위하여
					//pushUpdate를 통해 업데이트해야하는데
					//ID가 변경되면 pushUpdate 수행 불가. pushDestroy로 지우고 다시 생성한다.
					//ds.pushDestroy(item);
					that.editDataSourceWithTransport("remove", ds, item);
					item.id = newFileId;
					//폴더 생성 후 이름 Edit 시, sync 후 view에서 사라지는 현상인하여 pushCreate 수행
					//ds.pushCreate(item.toJSON());
					that.editDataSourceWithTransport("add", ds, item.toJSON());
					item = ds.get(item.id);

					//전체 SortOrder 재정렬 후 resolve로 아이템 전달
					that.apiPatchReOredredFiles().done(function(){
						//파일/폴더 생성 성공
						dfd.resolve(item);
					}).fail(function(msg){
						dfd.reject(msg);
					});
				}
			}).fail(function(msg){
				dfd.reject(msg);
			});
			return dfd.promise();
		},
		apiPutFile : function(file, data){
			var that = this, treeList = that.treeList, ds = treeList.dataSource;
			var HmiApi = window.HmiApi, Util = window.Util, I18N = window.I18N;
			var dfd = new $.Deferred();
			//이미 존재하는 파일에 덮어 씌운다.
			var item = ds.get(file.id);
			if(file.name) item.set("name", file.name);
			HmiApi.putFile(item, data).done(function(res){
				dfd.resolve(item);
			}).fail(function(msg){
				dfd.reject(msg);
			});
			return dfd.promise();
		},
		apiDeleteFile : function(file, isOnlyFolder){
			var that = this, treeList = that.treeList, ds = treeList.dataSource, dfd = new $.Deferred(), msg;
			var HmiApi = window.HmiApi, Util = window.Util, I18N = window.I18N;
			HmiApi.deleteFile(file.id).done(function(){
				var reqArr = [], children, item = ds.get(file.id);
				if(item.isFolder){
					msg = I18N.prop("HMI_FOLDER_DELETE_CONFIRM_POPUP");
					children = ds.childNodes(item);
					//ds.pushDestroy(item);
					that.editDataSourceWithTransport("remove", ds, item);
					var i, max;
					if(isOnlyFolder){ //폴더만 삭제
						max = children.length;
						for( i = 0; i < max; i++ ){
							item = ds.get(children[i].id);
							if(item){
								item.set("parent_id", null);
								item.set("treeDepth", 1);
							}
						}
					}else{	//폴더 및 폴더 내 파일 전체 삭제
						max = children.length;
						for( i = 0; i < max; i++ ){
							item = ds.get(children[i].id);
							if(item){
								//ds.pushDestroy(item);
								that.editDataSourceWithTransport("remove", ds, item);
							}
						}
						reqArr.push(HmiApi.deleteFiles(children));
					}
					reqArr.push(that.apiPatchReOredredFiles());
				}else{
					msg = I18N.prop("HMI_FILE_DELETE_CONFIRM_POPUP");
					if(that._recentSelectedFile && that._recentSelectedFile.id == item.id) that._recentSelectedFile = null;
					//ds.pushDestroy(item);
					that.editDataSourceWithTransport("remove", ds, item);
					reqArr.push(that.apiPatchReOredredFiles());
				}
				$.when.apply(this, reqArr).done(function(){
					dfd.resolve(msg);
				}).fail(function(xhq){
					msg = Util.parseFailResponse(xhq);
					dfd.reject(msg);
				});
			}).fail(function(xhq){
				msg = Util.parseFailResponse(xhq);
				dfd.reject(msg);
			});
			return dfd.promise();
		},
		_expandEvt : function(e){
			var that = this;
			var folder = e.model;
			var expandedData = that.getExpandedData();
			var i, max = expandedData.length;
			for( i = 0; i < max; i++ ){
				if(expandedData[i].id == folder.id) expandedData[i].expanded = true;
			}
			that.trigger("expand", { id : folder.id, expandedData : expandedData });
		},
		_collapseEvt : function(e){
			var that = this;
			var folder = e.model;
			var expandedData = that.getExpandedData();
			var i, max = expandedData.length;
			for( i = 0; i < max; i++ ){
				if(expandedData[i].id == folder.id) expandedData[i].expanded = false;
			}
			that.trigger("collapse", { id : folder.id, expandedData : expandedData });
		},
		getExpandedData : function(){
			var that = this, treeList = that.treeList, ds = treeList.dataSource;
			var data = ds.data();
			var folders = new kendo.data.Query(data).filter({ logic : "and",
				filters : [{
					field : "isFolder", operator : "eq", value : true
				}]}).toArray();
			var i, max = folders.length;
			var id, expanded, results = [], item;
			for( i = 0; i < max; i++){
				id = folders[i].id;
				expanded = folders[i].expanded ? folders[i].expanded : false;
				item = { id : id, expanded : expanded  };
				results.push(item);
			}
			return results;
		},
		setExpandedData : function(folders){
			var that = this, treeList = that.treeList, ds = treeList.dataSource;
			var item, id, expanded, folder, i, max = folders.length;
			for( i = 0; i < max; i++ ){
				folder = folders[i];
				id = folder.id;
				expanded = folder.expanded;
				item = ds.get(id);
				if(item && typeof expanded !== 'undefined' && expanded !== null) item.set("expanded", expanded);
			}
		},
		getRecentSelectedFile : function(){
			var that = this;
			return that._recentSelectedFile;
		},
		editDataSourceWithTransport : function(action, dataSource, data){
			//데이터 소스 read 시, 데이터가 원복되므로 transport 데이터를 삭제
			var transport = dataSource.transport;
			var transportData = transport.data;
			if(action == "add"){
				dataSource.pushCreate(data);
				transportData.push(data);
			}else if(action == "remove"){
				dataSource.pushDestroy(data);
				var i, max = transportData.length;
				for( i = 0; i < max; i++ ){
					if(transportData[i].id == data.id){
						transportData.splice(i, 1);
						break;
					}
				}
			}
		}
	});
	kendo.ui.plugin(HmiFileList);
})(jQuery);