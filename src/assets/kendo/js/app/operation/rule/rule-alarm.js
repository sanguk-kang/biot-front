/**
*
*   <ul>
*       <li>Rule Alarm & Log 기능</li>
*       <li>Rule Alarm & Log를 수정/삭제한다.</li>
*       <li>특정 Rule Alarm 조건에 따라 기기들을 제어한다.</li>
*   </ul>
*   @module app/operation/rule-alarm
*   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
*   @param {Object} ViewModel - Rule Alarm & Log View 전환 동작을 위한 View Model
*   @param {Object} RuleModel - Rule Alarm & Log 정보 표시를 위한 Model
*   @param {Object} Common - Rule 기능 내에서 공통으로 쓰이는 공용 Util
*   @param {Object} Widget - Rule 기능 내에서 표시되는 Popup Widget Instance
*   @param {Object} Template - Rule 기능 내에서 UI를 표시하기 위한 Template
*   @param {Object} CreateRule - Rule 생성 모듈

*   @requires app/main
*   @requires app/operation/rule/view-model/rule-alarm-vm
*   @requires app/operation/rule/model/rule-alarm-model
*   @requires app/operation/rule/common/common
*   @requires app/operation/rule/common/widget
*   @requires app/operation/rule/template/rule-template
*   @requires app/operation/rule/rule-create
*
*/
define("operation/rule/rule-alarm", ["operation/core", "operation/rule/view-model/rule-alarm-vm",
	"operation/rule/model/rule-alarm-model",
	"operation/rule/common/common",
	"operation/rule/common/widget",
	"operation/rule/template/rule-template",
	"operation/rule/rule-create"
], function(CoreModule, ViewModel, RuleAlarmModel, Common, Widget, Template, CreateRule){

	// var moment = window.moment;					//[2018-04-12][선언후 미사용 주석처리]
	var kendo = window.kendo;
	// var globalSettings = window.GlobalSettings;	//[2018-04-12][선언후 미사용 주석처리]
	var LoadingPanel = window.CommonLoadingPanel;
	var Util = window.Util;
	var MainWindow = window.MAIN_WINDOW;
	var I18N = window.I18N;
	var Loading = new LoadingPanel();
	var MainViewModel = ViewModel.MainViewModel;
	// var Views = ViewModel.Views;					//[2018-04-12][해당 변수를 사용하는 코드가 주석처리되어 미사용변수가 됨에 따라 주석처리]

	var ruleTab;
	var ruleCreateTab, ruleCreateTabElem = $("#rule-create-tab");
	var ruleGrid, ruleGridElem = $("#rule-alarm-control-list");

	var msgDialog = Widget.msgDialog, confirmDialog = Widget.confirmDialog;
	var detailPopup;
	// var morePopup;		//[2018-04-12][선언후 미사용 주석처리]
	var closeCreateBtn, closeSearchBtn;

	var selectedItemIds = [];

	var isSearchResults = false;

	var selectedNum = 0;

	var RULE_ALARM_LOG_MAX_SIZE = 256;

	// var RULE_ALARM_PARAMETER = 'alarmType=Critical,Warning';		//[2018-06-01][미사용으로 주석처리]
	/**
	*   <ul>
	*   <li>Rule Alarm & Log 기능을 초기화한다.</li>
	*   <li>공용 UI Component를 초기화한다.</li>
	*   <li>현재 건물/층의 Rule 정보를 API를 호출하여 서버로부터 받아오고, View를 업데이트한다.</li>
	*   <li>사용자 이벤트 동작을 바인딩한다.</li>
	*   </ul>
	*   @function init
	*	@param {Object} tab -
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var init = function(tab){
		ruleTab = tab;
		initComponent();
		//select after tab initailize
		var element = ruleTab.contentElement(1);
		Loading.open();
		// var q = getFloorQuery();		//[2018-04-12][해당 변수를 사용하는 구문이 주석처리되어 미사용변수가 됨에 따라 주석처리]
		//Rule Alarm & Log는 디바이스 리스트가 없어졌으므로, 층 정보로 필터 불가
		// var q = '?' + RULE_ALARM_PARAMETER;			//[2018-05-09][조건알람 GET요청 파라메타 추가]
		// $.ajax({
		// 	url : "/rules"//+q
		// }).done(function(data){
		// 	createView(data);
		// 	kendo.bind($(element), MainViewModel);
		// 	attachEvent();
		// }).fail(function(){
		// 	createView(RuleAlarmModel.MockData);
		// 	kendo.bind($(element), MainViewModel);
		// 	attachEvent();
		// }).always(function(){
		// 	Loading.close();
		// 	CoreModule.on("onfloorchange", onFloorChange);
		// });
		createView([]);
		kendo.bind($(element), MainViewModel);
		attachEvent();
		// CoreModule.on("onfloorchange", onFloorChange);
		Loading.close();
	};
	/**
	*   <ul>
	*   <li>현재 빌딩/층 정보에 따라 API 호출을 위한 쿼리 파라미터를 생성한다.</li>
	*   </ul>
	*   @function  getFloorQuery
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {String} API 호출을 위한 쿼리 파라미터
	*   @alias module:app/operation/rule-alarm
	*/
	// var getFloorQuery = function(floorData){
	// 	if(!floorData){
	// 		floorData = MainWindow.getCurrentFloor();
	// 	}
	// 	var q = "?";
	// 	if(floorData.building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
	// 		q += "foundation_space_buildings_id=" + floorData.building.id + "&";
	// 	}
	// 	if(floorData.floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
	// 		q += "foundation_space_floors_id=" + floorData.floor.id;
	// 	}
	// 	return q;
	// 	//return "";
	// };
	/**
	*   <ul>
	*   <li>층 변경 시, 호출되는 콜백 함수. 선택한 빌딩/층에 따라 Rule 정보들을 서버로부터 받아와 View를 업데이트한다.</li>
	*   </ul>
	*   @function changeFloor
	*   @param {Object} floorData - 현재 선택한 빌딩/층에 대한 객체
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	// var onFloorChange = function(floorData){
	// 	var q = getFloorQuery(floorData);
	// 	refreshRule(q);
	// };
	/**
	*   <ul>
	*   <li>공용 Tab UI Component를 초기화한다.</li>
	*   </ul>
	*   @function initComponent
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var initComponent = function(){
		ruleCreateTab = ruleCreateTabElem.data('kendoCommonTabStrip');
		if(!ruleCreateTab){
			ruleCreateTab = ruleCreateTabElem.kendoCommonTabStrip().data("kendoCommonTabStrip");
		}
		closeCreateBtn = $("#rule-alarm-close-create");
		closeSearchBtn = $("#rule-alarm-close-search");
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log List View를 초기화한다.</li>
	*   <li>widget 모듈을 통하여 상세 팝업 인스턴스를 가져온다.</li>
	*   </ul>
	*   @function createView
	*   @param {Array} data - Rule Alarm & Log 정보 리스트
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var createView = function(data){
		var dataSource = RuleAlarmModel.createDataSource(data, RuleAlarmModel.Model);
		//var dataSource = RuleModel.createDataSource(data, RuleModel.Model);
		initRuleGrid(dataSource);
		detailPopup = Widget.getRuleAlarmDetailPopup();
	};
	/**
	*   <ul>
	*   <li>생성/편집/삭제/상세정보 등의 버튼 상태를 현재 선택된 Rule Alarm & Log 개수에 따라 활성화/비활성화 한다.</li>
	*   </ul>
	*   @function enableActions
	*   @param {Boolean}isEnabled - 활성화 여부
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var enableActions = function(isEnabled){
		if(selectedNum == 1 && isEnabled){
			MainViewModel.actions[2].set("disabled", !isEnabled);
		}else{
			MainViewModel.actions[2].set("disabled", true);
		}
		MainViewModel.actions[3].set("disabled", !isEnabled);
		MainViewModel.actions[4].set("disabled", !isEnabled);
		//MainViewModel.actions[1].set("disabled", isEnabled);
	};
	/**
	*   <ul>
	*   <li>Rule/Rule Alarm Tab 전환, Popup 표시, 상세 팝업 및 각 버튼들의 이벤트 들을 바인딩한다.</li>
	*   </ul>
	*   @function attachEvent
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var attachEvent = function(){

		ruleTab.bind("activate", function(e){
			var index = $(e.item).index();
			if(index == 0){
				MainWindow.disableFloorNav(false);
			}else if(index == 1){
				MainWindow.disableFloorNav(true);
				refreshRule();
			}
		});

		MainViewModel.actions[1].options.set("click", createBtnEvt);
		MainViewModel.actions[2].options.set("click", editBtnEvt);
		MainViewModel.actions[3].options.set("click", deleteBtnEvt);
		MainViewModel.actions[4].options.set("click", detailBtnEvt);

		ruleGrid.element.on("click",".ic.ic-info", function(){
			var id = $(this).data("id");
			var ds = ruleGrid.dataSource;
			var data = ds.get(id);
			detailPopup.setDataSource(data);
			detailPopup.setDialogType("single");
			detailPopup.open();
		});

		ruleGrid.bind("checked", widgetChangeEvt);

		detailPopup.bind("onDelete", detailPopupDeleteEvt);
		detailPopup.bind("onEdit", detailPopupEditEvt);
		detailPopup.element.on("click", ".action-button", detailPopupActionEvt);

		/*Create Schedule Close*/
		closeCreateBtn.on("click", function(){
			confirmDialog.message(I18N.prop("COMMON_CLOSE_WINDOW_CONFIRM"));
			confirmDialog.setConfirmActions({
				yes : function(){
					closeCreateBtnEvt();
				}
			});
			confirmDialog.open();
		});
		closeSearchBtn.on("click", closeSearchBtnEvt);

		ruleTab.bind("select", function(e){
			var item = $(e.item);
			if(item.hasClass("search-tab")){
				e.preventDefault();
				return false;
			}
		});

		MainViewModel.searchField.set("click", function(e){
			var target = $(e.target);
			var keywords = target.val() ? target.val() : MainViewModel.searchField.get("keywords");

			if(!isSearchResults){
				setSearch(true);
			}
			searchKeywords(keywords);
		});

		MainViewModel.searchField.set("keydown", function(e){
			console.info(e);
			if(e.keyCode == 13){
				MainViewModel.searchField.click(e);
			}
		});
	};
	/**
	*   <ul>
	*   <li>List 뷰에서 Rule Alarm & Log 선택 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function widgetChangeEvt
	*	@param {Object}	e -
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var widgetChangeEvt = function(e){
		console.info(e);

		if(e.isHeader === false){
			addRuleIdFromChkbox([e.item]);
		}

		console.info("selected items : " + selectedItemIds.length);

		var selectedItem = getSelectedItems();
		setSelectedNum(selectedItem.length);
	};
	/**
	*   <ul>
	*   <li>선택된 Rule Alarm & Log의 개수에 따라 선택 상태 표시 텍스트를 업데이트 한다.</li>
	*   </ul>
	*   @function setSelectedNum
	*   @param {Number} num - 선택한 Rule의 개수
	*   @returns {void}
	*   @alias module:app/operation/rule
	*/
	var setSelectedNum = function(num){
		selectedNum = num;
		// var str = "schedules";          //[2018-04-12][변수 선언후 미사용]
		MainViewModel.actions[0].options.set("selectedText", I18N.prop("FACILITY_RULE_MESSAGE_INFO_SELECTED_MULTI_RULE_ALARM_LOG", num));
		if(selectedNum == 0){
			selectedItemIds.length = 0;
			MainViewModel.actions[0].options.set("selectedText", I18N.prop("FACILITY_RULE_MESSAGE_INFO_NONE_SELECT_RULE_ALARM_LOG"));
			enableActions(false);
		}else{
			enableActions(true);
		}
	};

	var addRuleIdFromChkbox = function(items){
		if(!items){
			return;
		}
		var item, checked, id, i, max = items.length;

		for( i = 0; i < max; i++ ){
			item = items[i];
			checked = item.checked;
			id = item.id;
			updateSelectedEvtIds(checked, id);
		}
	};

	var updateSelectedEvtIds = function(checked, id){
		var index;
		if(checked){
			if(selectedItemIds.indexOf(id) == -1){
				selectedItemIds.push(id);
			}
		}else{
			index = selectedItemIds.indexOf(id);
			selectedItemIds.splice(index, 1);
		}
	};
	/**
	*   <ul>
	*   <li>상세 팝업에서 편집 버튼 클릭 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function detailPopupEditEvt
	*	@param {Object}	e -
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var detailPopupEditEvt = function(e){
		e.sender.close();
		var item = e.result;
		openCreateView(item);
	};
	/**
	*   <ul>
	*   <li>상세 팝업에서 삭제 버튼 클릭 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function detailPopupDeleteEvt
	*	@param {Object}	e -
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var detailPopupDeleteEvt = function(e){
		var selectedItem = [];
		var result = e.result, results = e.results;
		if(results){
			selectedItem = results;
		}else if(result){
			selectedItem.push(result);
		}
		confirmDialog.message(I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_DELETE_RULE_ALARM_LOG"));
		confirmDialog.setConfirmActions({
			yes : function(){
				deleteRule(selectedItem, e.sender);
			}
		});
		confirmDialog.open();
	};

	var setSearch = function(isSearch){
		isSearchResults = isSearch;
		if(isSearch){
			ruleGrid.uncheckAll();
			// ruleTabElem.find(".main-tab").hide();    				//[2018-04-12][ruleTabElem 존재하지않음 기능에러가 예측됨 eslint적용을 위해 임시 주석처리 수정요망]
			// ruleTabElem.find(".search-tab").show();					//[2018-04-12][ruleTabElem 존재하지않음 기능에러가 예측됨 eslint적용을 위해 임시 주석처리 수정요망]
			//MainViewModel.filters[0].set("invisible", false);
			MainViewModel.actions[1].set("invisible", true);
		}else{
			// ruleTabElem.find(".main-tab").show();  					//[2018-04-12][ruleTabElem 존재하지않음 기능에러가 예측됨 eslint적용을 위해 임시 주석처리 수정요망]
			// ruleTabElem.find(".search-tab").hide();					//[2018-04-12][ruleTabElem 존재하지않음 기능에러가 예측됨 eslint적용을 위해 임시 주석처리 수정요망]
			MainViewModel.searchField.set("keywords", "");
			//MainViewModel.actions[1].set("invisible", false);
			ruleTab.select(0);
		}
	};

	var searchKeywords = function(keywords, type){
		//var ds = Views.list.widget.dataSource;
		// var ds = ruleGrid.dataSource;	//[2018-04-12][해당 변수를 사용하는 코드가 주석처리되어 미사용변수가 됨에 따라 주석처리]
		// var data = ds.data();			//[2018-04-12][해당 변수를 사용하는 코드가 주석처리되어 미사용변수가 됨에 따라 주석처리]
		var filter = {logic : 'and', filters : [] };
		filter.filters.push({ field : "name", operator : "contains", value : keywords});
		if(type){
			filter.filters.push({ field : "type", operator : "eq", value : type});
		}
		// var searchData = new kendo.data.Query(data).filter(filter).toArray();		//[2018-04-12][해당 변수를 사용하는 코드가 주석처리되어 미사용변수가 됨에 따라 주석처리]

		/*var filter = [];
		if(keywords){
			filter.push({ field : "name", operator : "contains", value : keywords});
		}
		ds.filter(filter);
		var view = ds.view();*/
		//Views.search.widget.filterForSearch(filter);
		//MainViewModel.set("searchNum", searchData.length);
	};
	/**
	*   <ul>
	*   <li>Pause/Operation 상태에 대하여 API 호출 후 View를 Update 한다.</li>
	*   </ul>
	*   @function ruleActivatedAction
	*   @param {Element}btn - Pause/Operating 버튼 요소
	*   @param {Element}tr - 해당 버튼이 존재하는 행
	*   @param {kendojQueryWidget}popup - Popup Widget 인스턴스
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var ruleActivatedAction = function(btn, tr, popup){
		var ruluData;		//[2018-04-30][data -> ruluData]
		var self = btn;
		var listDs = ruleGrid.dataSource;
		if(tr.length > 0){  //multi
			var uid = tr.data("uid");
			var ds = popup.grid.dataSource;
			ruluData = ds.getByUid(uid);
		}else{  //single
			ruluData = popup.getSelectedData();
		}

		var chkBoxCell = tr.find(".grid-checkbox-cell");

		if(self.hasClass("ic-action-pause")){    //Pause
			Loading.open(popup.element);
			$.ajax({
				url : "/rules/" + ruluData.id,
				method : "PATCH",
				data : {
					activated : false
				}
			}).done(function(){
				self.removeClass('ic-action-pause');
				self.addClass("ic-action-play");
				self.parent().siblings(".schedule-status").text(I18N.prop("COMMON_PAUSE"));
				var item = listDs.get(ruluData.id);
				if(chkBoxCell.length > 0){
					var className = Template.getEventTemplateClass(item);
					chkBoxCell.removeClass("pause");
					chkBoxCell.addClass(className);
				}
				item.set("activated", false);
				if(popup.grid){
					var gridDs = popup.grid.dataSource;
					var gridItem = gridDs.get(ruluData.id);
					gridItem.set("activated", false);
				}
			}).always(function(){
				Loading.close();
			});
		}else{  //Operation
			Loading.open(popup.element);
			$.ajax({
				url : "/rules/" + ruluData.id,
				method : "PATCH",
				data : {
					activated : true
				}
			}).done(function(){
				self.removeClass('ic-action-play');
				self.addClass("ic-action-pause");
				self.parent().siblings(".schedule-status").text(I18N.prop("COMMON_OPERATING"));
				var item = listDs.get(ruluData.id);
				if(chkBoxCell.length > 0){
					var className = Template.getEventTemplateClass(item);
					chkBoxCell.removeClass(className);
					chkBoxCell.addClass("pause");
				}
				item.set("activated", true);
				if(popup.grid){
					var gridDs = popup.grid.dataSource;
					var gridItem = gridDs.get(ruluData.id);
					gridItem.set("activated", true);
				}
			}).always(function(){
				Loading.close();
			});
		}
	};

	var detailPopupActionEvt = function(){
		var self = $(this);
		var tr = self.closest("tr");
		ruleActivatedAction(self, tr, detailPopup);
	};
	/**
	*   <ul>
	*   <li>선택한 Rule Alarm & Log 정보를 1개 가져온다.</li>
	*   </ul>
	*   @function getSelectedItem
	*   @returns {Object} - 선택한 Rule Alarm & Log 정보
	*   @alias module:app/operation/rule-alarm
	*/
	var getSelectedItem = function(){
		var selectedItem = [];
		/*var selectedRows = Views.list.widget.select();
			selectedEvt = Views.list.widget.dataItem(selectedRows[0]);*/
		selectedItem = ruleGrid.getCheckedData();
		if($.isArray(selectedItem) && selectedItem.length > 0){
			selectedItem = selectedItem[0];
		}

		return selectedItem;
	};
	/**
	*   <ul>
	*   <li>선택한 Rule Alarm & Log 정보 리스트를 가져온다.</li>
	*   </ul>
	*   @function getSelectedItems
	*   @returns {Array} - 선택한 Rule Alarm & Log 정보 리스트
	*   @alias module:app/operation/rule-alarm
	*/
	var getSelectedItems = function(){
		var selectedItem = [];

		selectedItem = ruleGrid.getCheckedData();
		selectedNum = selectedItem.length;
		return selectedItem;
	};
	/**
	*   <ul>
	*   <li>생성 버튼 클릭 시, 호출되는 Callback 함수</li>
	*   <li>전체 Rule Alarm & Log 개수를 체크한다.</li>
	*   </ul>
	*   @function createBtnEvt
	*	@param {Object}	e -
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var createBtnEvt = function(e){
		//개수 체크
		Loading.open();
		// var q = '?' + RULE_ALARM_PARAMETER;			//[2018-05-09][조건알람 GET요청 파라메타 추가]
		$.ajax({
			url : "/rules" //+ q
		}).done(function(data){
			//최대 256
			data = RuleAlarmModel.createDataSource(data, RuleAlarmModel.Model);
			if(data.length >= RULE_ALARM_LOG_MAX_SIZE){
				msgDialog.message(I18N.prop("FACILITY_RULE_ALARM_LOG_MAX_SIZE"));
				msgDialog.open();
				return;
			}
			openCreateView();
		}).fail(function(xhq){
			var msg = Util.parseFailResponse(xhq);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			Loading.close();
		});
	};

	var editBtnEvt = function(e){
		var selectedItem = getSelectedItem();
		openCreateView(selectedItem);
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log 생성/편집 화면으로 전환한다.</li>
	*   </ul>
	*   @function openCreateView
	*   @param {Object} selectedItem - 편집할 Rule Alarm & Log 정보
	*   @returns {void}
	*   @alias module:app/operation/rule
	*/
	var openCreateView = function(selectedItem){
		// ruleTab.wrapper.closest(".k-tabstrip-wrapper").hide();
		// ruleCreateTab.wrapper.closest(".k-tabstrip-wrapper").show();
		ruleTab.hide();
		ruleCreateTab.show();
		CreateRule.init(selectedItem, false, true);
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log 생성/편집 화면을 종료한다.</li>
	*   </ul>
	*   @function closeCreateView
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var closeCreateView = function(){
		CreateRule.setEditState(false);
		MainWindow.disableFloorNav(true);
		// ruleCreateTab.wrapper.closest(".k-tabstrip-wrapper").hide();
		// ruleTab.wrapper.closest(".k-tabstrip-wrapper").show();
		ruleCreateTab.hide();
		ruleTab.show();
	};
	/**
	*   <ul>
	*   <li>삭제 버튼 클릭 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function deleteBtnEvt
	*	@param {Object}	e -
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var deleteBtnEvt = function(e){
		var selectedItem = getSelectedItems();
		var msg;
		if(selectedItem.length > 1){
			msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_DELETE_MULTI_RULE_ALARM_LOG", selectedItem.length);
		}else{
			msg = I18N.prop("FACILITY_RULE_MESSAGE_CONFIRM_DELETE_RULE_ALARM_LOG");
		}
		confirmDialog.message(msg);
		confirmDialog.setConfirmActions({
			yes : function(){
				deleteRule(selectedItem);
			}
		});
		confirmDialog.open();
	};
	/**
	*   <ul>
	*   <li>상세 정보 버튼 클릭 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function detailBtnEvt
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var detailBtnEvt = function(){
		var selectedItem = getSelectedItems();
		var dialogType = "single";
		if(selectedItem.length > 1){
			dialogType = "multi";
			selectedItem = sortFromEventIds(selectedItem);
		}
		detailPopup.setDataSource(selectedItem);
		detailPopup.setDialogType(dialogType);
		detailPopup.open();
	};

	var sortFromEventIds = function(selectedEvt){
		var id, sortId, i, max = selectedItemIds.length;
		var j, length = selectedEvt.length;
		var evt, result = [];
		// var hasExist;		//[2018-04-12][변수선언뒤 미사용 주석처리]
		console.info("sort prediction");

		//[2018-04-12][name사용하던 콘솔로그를 주석처리하여 필요없는 코드가 되어 주석처리]
		// var ds = ruleGrid.dataSource;
		// for( i = 0; i < max; i++ ){
		// var item = ds.get(selectedItemIds[i]);
		// var name = item.title || item.name;
		// console.info(name);
		// }

		for( i = 0; i < max; i++ ){
			sortId = selectedItemIds[i];

			for( j = length - 1; j >= 0; j-- ){
				evt = selectedEvt[j];
				id = evt.id;
				if(id == sortId){
					result.push(evt);
					selectedEvt.splice(j, 1);
					length = selectedEvt.length;
					break;
				}
			}
		}

		if(selectedEvt.length > 0){
			max = selectedEvt.length;
			for( i = 0; i < max; i++ ){
				result.push(selectedEvt[i]);
			}
		}

		return result;
	};

	var closeCreateBtnEvt = function(){
		closeCreateView();
		if(isSearchResults){
			setSearch(false);
		}
		refreshRule();
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log 정보를 API를 호출하여 서버로부터 가져와 View를 업데이트한다.</li>
	*   </ul>
	*   @function refreshRule
	*	@param {Object}	q -
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var refreshRule = function(){
		Loading.open();
		// if(!q){
		// 	q = getFloorQuery();
		// }
		//Rule Alarm & Log는 디바이스 리스트가 없어졌으므로, 층 정보로 필터 불가
		// var q = '?' + RULE_ALARM_PARAMETER;			//[2018-05-09][조건알람 GET요청 파라메타 추가]
		$.ajax({
			url : "/rules"//+q
		}).done(function(data){
			refreshRuleData(data);
		}).fail(function(data){
			var msg = Util.parseFailResponse(data);
			msgDialog.message(msg);
			msgDialog.open();
			// refreshRuleData(RuleAlarmModel.MockData);
		}).always(function(){
			Loading.close();
		});
	};

	var closeSearchBtnEvt = function(){
		setSearch(false);
		return false;
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log 정보 리스트로 List View를 업데이트한다.</li>
	*   </ul>
	*   @function refreshRuleData
	*   @param {Array}data - Rule Alarm & Log 정보 리스트
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var refreshRuleData = function(data){
		var dataSource = RuleAlarmModel.createDataSource(data, RuleAlarmModel.Model);

		var ds = new kendo.data.DataSource({
			data : dataSource
		});
		ds.read();
		ruleGrid.setDataSource(ds);
		setSelectedNum(0);
	};
	/**
	*   <ul>
	*   <li>API를 호출하여 선택한 Rule Alarm & Log 정보를 삭제하고, View를 업데이트한다.</li>
	*   </ul>
	*   @function deleteRule
	*   @param {Array}selectedItem - 선택한 Rule Alarm & Log 정보 리스트
	*   @param {kendoJqueryWidget}popup - 상세 팝업 Widget 인스턴스
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var deleteRule = function(selectedItem, popup){
		var selectedNumLength = selectedItem.length;		//[2018-04-12][외부에 동일명으로 선언된 전역변수가 존재 변수명을 selectedNum -> selectedNumLength 수정]
		var i, max = selectedNumLength;
		var item;
		var reqArr = [];
		// var cItem, lItem, itemArr = [];		//[2018-04-12][해당변수들 선언후 미사용 주석처리]
		if(popup){
			Loading.open(popup.element);
		}else{
			Loading.open();
		}

		for( i = 0; i < max; i++ ){
			item = selectedItem[i];
			if(item){
				reqArr.push($.ajax({
					url : "/rules/" + item.id,
					method : "DELETE"
				}));
			}
		}

		$.when.apply(this, reqArr).done(function(){

		}).fail(function(){

		}).always(function(){
			Loading.close();
			if(selectedNum > 1){
				msgDialog.message(I18N.prop("FACILITY_RULE_MESSAGE_NOTI_DELETED_MULTI_RULE_ALARM_LOG", selectedNum));
			}else{
				msgDialog.message(I18N.prop("FACILITY_RULE_MESSAGE_NOTI_DELETED_RULE_ALARM_LOG"));
			}
			max = selectedItem.length;		//[2018-04-12][i와 max는 재선언이 필요없다고 판단 max는 할당만 i는 제거함]
			var ds = ruleGrid.dataSource;
			for( i = 0; i < max; i++ ){
				item = selectedItem[i];
				item = ds.get(item.id);
				if(item){
					ds.remove(item);
				}
			}
			msgDialog.open();

			ruleGrid.uncheckAll();
			setSelectedNum(0);
			if(popup){
				popup.close();
			}
		});
	};
	/**
	*   <ul>
	*   <li>Rule Alarm & Log List View를 초기화한다.</li>
	*   </ul>
	*   @function initRuleGrid
	*   @param {Array}dataSource - Rule Alarm & Log 정보 리스트
	*   @returns {void}
	*   @alias module:app/operation/rule-alarm
	*/
	var initRuleGrid = function(dataSource){
		var options = {
			columns : [
			   { field : "checked", width:37},
			   { field: "name", title: I18N.prop("FACILITY_RULE_RULE_ALARM_LOG_NAME"), format: "" , width:100, sortable : false},
			   { field: "activated", title: I18N.prop("COMMON_STATUS"), width:100, sortable : false, template:function(data){
				   if(data.activated){
					   return I18N.prop("COMMON_OPERATING");
				   }
					return I18N.prop("COMMON_PAUSE");

			   }},
			   /*{ title: I18N.prop("FACILITY_DEVICE_DEVICE"), width:100, template:function(data){
				   var i, max, type, txt ="-";
				   if(data.devices){
						max = data.devices.length;
						if(data.devices[0]){
							type = data.devices[0].dms_devices_type;
							var cssType = Util.getDisplayClassType(type);
							txt = "<span class='detail-img reg selected "+cssType+"'></span>";
					   }

					   if(max-1 > 0){
						   txt += " (+"+(max-1)+")";
					   }
				   }

				   return txt;
			   }},
				{ title: I18N.prop("COMMON_LOCATION"), width:100, template:function(data){
				   var type, max, txt ="-";
				   if(data.devices){
					   max = data.devices.length;
						if(data.devices[0]){
							txt = data.devices[0].location;
						}

						if(max-1 > 0){
						   txt += " (+"+(max-1)+")";
						}
				   }
				   return txt;
			   }},*/
				{ title: I18N.prop("FACILITY_RULE_CONDITION"), width:100, template: Template.conditionListTemplate},
				{ title: I18N.prop("COMMON_OPERATION"), width:100, template: function(data){
					var val = "-";
					if (data.alarmType){
						var alarmType = data.alarmType;
						var i18nVal = I18N.prop("FACILITY_DEVICE_STATUS_" + alarmType.toUpperCase());
						val = i18nVal ? i18nVal : alarmType;
					}
					return val;
				}},
				{ title: I18N.prop("COMMON_BTN_DETAIL"), width:70, template:function(data){
					var id = data.id, uid = data.uid;
					var txt = "<span class='ic ic-info' data-id='" + id + "' data-uid='" + uid + "'></span>";
					return txt;
			   }}
			],
			//dataSource: dataSource,
			dataSource : dataSource,
			height: $('.schedule-content-block').height(),
			scrollable: true,
			groupable : false,
			sortable: true,
			filterable: false,
			pageable: false,
			hasCheckedModel : true,
			setCheckedAttribute : true
		};

		ruleGrid = ruleGridElem.kendoGrid(options).data("kendoGrid");
	};

	return {
		init : init,
		closeCreateBtnEvt : closeCreateBtnEvt
	};
});

//For Debug
//# sourceURL=operation-rule-alarm.js