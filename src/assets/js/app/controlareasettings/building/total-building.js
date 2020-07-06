/**
 *
 *   <ul>
 *       <li>total-building에 관련된 view 모델 설정 작업</li>
 *   </ul>
 *   @module app/controlareasettings/building/total-building
 *   @param {Object} CoreModule- 에너지 core 객체
 *   @param {Object} Common- space Common 객체
 *   @param {Object} Widget- space Widget 객체
 *   @param {Object} ViewModel - space ViewModel 객체
 *   @param {Object} API - space API 객체
 *   @requires app/controlareasettings/core
 *   @requires app/controlareasettings/building/config/space-common
 *   @requires app/controlareasettings/building/config/space-widget
 *   @requires app/controlareasettings/building/config/space-vm
 *   @requires app/controlareasettings/building/config/space-api
 *   @returns {Object} 없음
 */
define("controlareasettings/building/total-building", ["controlareasettings/core", "controlareasettings/building/config/space-common",
	"controlareasettings/building/config/space-widget", 'controlareasettings/building/config/space-vm', 'controlareasettings/building/config/space-api'], function(CoreModule, Common, Widget, ViewModel, API){
	"use strict";

	var kendo = window.kendo;
	var MainWindow = window.MAIN_WINDOW;
	var Util = window.Util;
	var MSG = Common.MESSAGE;
	var TEXT = Common.TEXT;
	var Loading = Widget.Loading, confirmDialog = Widget.confirmDialog, msgDialog = Widget.messagDialog, checkDuplicatedByKey = Common.checkDuplicatedByKey, getFloorName = Common.getFloorName, checkNoElementByKey = Common.checkNoElementByKey;

	var mainButtonsTemplate = $('#spaceAllTopButtons').html();
	var moveButtonsTemplate = $('#spaceAllMoveButtons').html();
	var moveButtonsContainer = $('<div/>').addClass('left').append(moveButtonsTemplate);
	var tabElem, tabTopContentElem, spaceBodyElem;
	var mainGrid, mainGridElem, editGrid, editGridElem, editData = [];
	var validators = {
		name: {
			validator: null,
			element: null
		},
		description: {
			validator: null,
			element: null
		},
		validate: function () {
			var self = this;
			if (self.name.validator === null || self.description.validator === null) {
				return false;
			}
			return self.name.validator && self.description.validator;
		}
	};
	var columnsIndex = {
		NAME: 0,
		FLOORS: 1,
		DESCRIPTION: 2,
		NUMBER_OF_ZONES: 3
	};

	var MainViewModel = ViewModel.AllMainViewModel;
	var buttons = {
		btnEdit: MainViewModel.get('btnEdit'),
		btnAdd: MainViewModel.get('btnAdd'),
		btnDelete: MainViewModel.get('btnDelete'),
		btnSave: MainViewModel.get('btnSave'),
		btnExit: MainViewModel.get('btnExit'),
		btnCancel: MainViewModel.get('btnCancel'),

		btnMoveTop: MainViewModel.get('btnMoveTop'),
		btnMoveUp: MainViewModel.get('btnMoveUp'),
		btnMoveDown: MainViewModel.get('btnMoveDown'),
		btnMoveBottom: MainViewModel.get('btnMoveBottom')
	};

	var buttonStateChange = Common.buttonStateChange;
	var editButtonsState = Common.editButtonsState;
	/**
	 *
	 *   space total building 페이지 진입시 기본 셋팅을 해주는 함수
	 *
	 *   @function init
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var init = function(){

		initView();
		initComponent();

		changeEditMode(false);

		getData();
		attachEvent();
	};

	var initView = function () {
		tabElem = $('#component-example-tab');
		tabTopContentElem = $('.common-tab-top-content');
		tabTopContentElem.append(moveButtonsContainer).append(mainButtonsTemplate);
		spaceBodyElem = $('#space-content');
		mainGridElem = $('#space-grid');
		editGridElem = $('#space-grid-edit').off();
	};

	var initComponent = function () {
		//그리드 초기화
		mainGrid = mainGridElem.kendoGrid({
			columns: setMainGridColumns(),
			scrollable: true,
			height: '100%'
		}).data('kendoGrid');
		//편집그리드 초기화
		editGrid = editGridElem.kendoGrid({
			columns: setEditGridColumns(),
			scrollable: true,
			height: '100%',
			hasCheckedModel: true,
			setCheckedAttribute: true
		}).data('kendoGrid');

		//뷰-모델 바인딩
		kendo.bind(tabElem, MainViewModel);
	};

	/**
	 *	<ul>
	 *		<li>전체 빌딩 목록 요청 후 화면에 출력</li>
	 *	</ul>
	 *	@function getData
	 *	@param {boolean} isUpdateFNB - 층 네비게이션 업데이트 여부
	 *	@returns {Object} 없음
	 */
	var getData = function (isUpdateFNB) {
		Loading.open();
		API.spaceBuildingsGET().done(function (data) {
			var i;
			if(isUpdateFNB) {
				MainWindow.setBuildingList(data);
				for(i = 0; i < data.length; i++) {
					if(data[i].id === 0) {
						data.splice(i, 1);
						break;
					}
				}
			}
			mainGrid.setDataSource(new kendo.data.DataSource({
				data: data,
				sort: {field: 'sortOrder', dir: 'asc'},
				aggregate: [{field: 'indexes.numberOfZones', aggregate: 'sum'}]
			}));
		}).fail(function (xhq) {
			msgDialog.message(Util.parseFailResponse(xhq));
			msgDialog.open();
		}).always(function () {
			Loading.close();
		});
	};

	/**
	 *	<ul>
	 *		<li>일반모드의 Grid Columns Options 세팅</li>
	 *	</ul>
	 *	@function setMainGridColumns
	 *	@returns {Array} mainGrid의 Columns Option
	 */
	var setMainGridColumns = function () {
		var columns = [];
		columns.push(
			{
				field: 'name',
				title: TEXT.NAME,
				width: 60,
				footerTemplate: TEXT.SPACE_TEXT_TOTAL
			},
			{
				field: 'floors',
				title: TEXT.FLOOR,
				width: 90,
				template: function (data) {
					var txt = '-';
					if(data.highestFloor && data.lowestFloor) {
						txt = getFloorName(data.lowestFloor.foundation_space_floors_type, data.lowestFloor.foundation_space_floors_name) + ' ~ ' + getFloorName(data.highestFloor.foundation_space_floors_type, data.highestFloor.foundation_space_floors_name);
					}
					return txt;
				},
				footerTemplate: '-'
			},
			{
				field: 'description',
				title: TEXT.DESCRIPTION,
				width: 180,
				footerTemplate: '-'
			},
			{
				field: 'indexes',
				title: TEXT.ZONE_NUM,
				width: 70,
				template: function (data) {
					var txt = '-';
					if(data.indexes && data.indexes.numberOfZones > 0) {
						txt = data.indexes.numberOfZones;
					}
					return txt;
				},
				footerTemplate: function (data) {
					return data['indexes.numberOfZones'] ? data['indexes.numberOfZones'].sum : '-';
				}
			}
		);
		return columns;
	};

	/**
	 *	<ul>
	 *		<li>편집모드의 Grid Columns Options 세팅</li>
	 *		<li>일반모드의 Grid Columns Options 에서 몇 가지 내용만 변경</li>
	 *	</ul>
	 *	@function setEditGridColumns
	 *	@returns {Array} editGrid의 Columns Option
	 */
	var setEditGridColumns = function () {
		var columns = setMainGridColumns();
		columns[columnsIndex.NAME].template = function (data) {
			return '<input class="k-input" data-id="' + data.id + '" data-key="name" value="' + data.name + '">';
		};
		columns[columnsIndex.DESCRIPTION].template = function (data) {
			return '<input class="k-input" data-id="' + data.id + '" data-key="description" value="' + data.description + '">';
		};
		return columns;
	};

	/**
	 *
	 *   checkbox 체크에 따른 층 순서 설정 버튼 dim 함수
	 *
	 *   @function buttonDisabled
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	/* 버튼 dim 함수 */
	var buttonDisabled = function(){
		/* checkbox */
		var checkboxLine = editGridElem.find(".k-grid-content tr");
		var checkboxLineChecked = editGridElem.find(".k-grid-content .k-state-selected");
		/* checkbox 길이 */
		var checkboxLength = checkboxLine.length;
		var checkboxCheckedLength = checkboxLineChecked.length;
		/* 마지막 checkbox */
		var checkboxLastChecked = checkboxLineChecked.eq(checkboxCheckedLength - 1);

		buttonStateChange(buttons, [
			{btnAdd: [checkboxLength < 100 ? false : true, true]},					//건물 추가 버튼 활성화
			{btnDelete: [checkboxCheckedLength > 0 ? false : true, true]},			//건물 삭제 버튼 활성화
			{btnMoveTop: [false, true]},
			{btnMoveUp: [false, true]},
			{btnMoveDown: [false, true]},
			{btnMoveBottom: [false, true]}
		]);

		if(checkboxCheckedLength - 1 === checkboxLastChecked.index()) {
			buttonStateChange(buttons, [
				{btnMoveTop: [true, true]},
				{btnMoveUp: [true, true]}
			]);
		}
		if(checkboxLineChecked.eq(0).index() === -1 || checkboxLineChecked.eq(0).index() === checkboxLength - checkboxCheckedLength) {
			buttonStateChange(buttons, [
				{btnMoveDown: [true, true]},
				{btnMoveBottom: [true, true]}
			]);
		}
	};
	/**
	 *
	 *   이벤트를 바인딩 한다.
	 *
	 *   @function attachEvent
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var attachEvent = function(){
		//editGrid input keyup 이벤트
		editGridElem.on("change", ".k-input", function(e){
			var self = $(e.target);
			var id = self.data('id'), key = self.data('key'), target;
			target = getEditDataById(id);
			target[key] = self.val();
			if(!target.created) target.changed = true;
			editButtonsState(buttons);
		});

		//수정 버튼 클릭 이벤트
		buttons.btnEdit.set('click', function () {
			var listLength = mainGrid.dataSource.data().length;
			changeEditMode(true);
			if(listLength > 99){
				 buttonStateChange(buttons, [{btnAdd: [true, true]}]);
			 }
		});

		//추가 버튼 클릭 이벤트
		buttons.btnAdd.set('click', function () {
			var createdUid = kendo.guid();

			editData.push({
				id: createdUid,
				name: getNewBuildingName(),
				description: '',
				indexes: {numberOfZones: 0},
				created: true,
				sortOrder: 0
			});
			editDataSortBySortOrder();
			editDataResetSortOrder();

			editButtonsState(buttons);
			changedDataUpdate();
			buttonDisabled();
		});

		//저장 버튼 클릭 이벤트
		buttons.btnSave.set('click', function () {
			var isPost = false, isPatch = false;
			changedDataUpdate();
			if(!validators.validate()) {
				return;
			}
			//빌딩이름 중복 체크
			if(checkDuplicatedByKey(editGrid.dataSource.view(), 'name')) {
				msgDialog.message(MSG.SPACE_MESSAGE_NOTI_EXIST_SAME_BUILDING_NAME);
				msgDialog.open();
				return;
			}
			//빌딩이름 공백 체크
			if(checkNoElementByKey(editGrid.dataSource.view(), 'name')) {
				msgDialog.message(MSG.SPACE_SAVE_BUILDING_NAME_NOT);
				msgDialog.open();
				return;
			}
			if (getUpdatedEditData('created').length > 0) isPost = true;
			if (getUpdatedEditData('changed').length > 0) isPatch = true;
			var apis = [].concat(API.spaceBuildingsPOST(getUpdatedEditData('created')), API.spaceBuildingsPATCH(getUpdatedEditData('changed')), API.spaceBuildingsDELETE(getUpdatedEditData('deleted')));

			Loading.open();
			//생성된 데이터, 변경된 데이터, 삭제된 데이터의 API 호출을 다르게 한다
			$.when.apply(this, apis).done(function () {
				var i = 0, postRes, patchRes;
				var duplicatedBuildingNames = [];
				var msg;
				if (isPost) {
					postRes = arguments && arguments[i] && arguments[i++][0] || [];
				}
				if (isPatch) {
					patchRes = arguments && arguments[i] && arguments[i][0] || [];
				}
				if (!postRes) {
					postRes = [];
				}
				if (!patchRes) {
					patchRes = [];
				}
				for (i = 0; i < postRes.length; i++) {
					if (postRes[i].code === 490 && postRes[i].body && (postRes[i].body.code == 61501 || postRes[i].body.code == 61502)) {
						duplicatedBuildingNames.push(postRes[i].body.message.slice(postRes[i].body.message.indexOf('[') + 1, postRes[i].body.message.indexOf(']')));
					}
				}
				for (i = 0; i < patchRes.length; i++) {
					if (patchRes[i].code === 490 && patchRes[i].body && (patchRes[i].body.code == 61501 || patchRes[i].body.code == 61502)) {
						duplicatedBuildingNames.push(patchRes[i].body.message.slice(patchRes[i].body.message.indexOf('[') + 1, patchRes[i].body.message.indexOf(']')));
					}
				}
				Loading.close();
				if (duplicatedBuildingNames.length === 0) {
					msg = MSG.COMMON_MESSAGE_NOTI_SAVED;
				} else {
					msg = MSG.SPACE_DUPLICATE_BUILDING_NAME(duplicatedBuildingNames.join(', '));
				}

				msgDialog.message(msg);
				msgDialog.open();
				changeEditMode(false);
				getData(true);
			}).fail(function (xhq) {
				msgDialog.message(Util.parseFailResponse(xhq));
				msgDialog.open();
				Loading.close();
			});
		});

		//삭제 버튼 클릭 이벤트
		buttons.btnDelete.set('click', function () {
			confirmDialog.setConfirmActions({
				yes : function(){
					var i, j;
					var checkedBuildings = editGrid.getCheckedData();
					var dataId, deleteIdx;

					for(i = 0; i < checkedBuildings.length; i++) {
						dataId = checkedBuildings[i].id;
						if(checkedBuildings[i].created) {		//생성된 데이터 삭제는 처음부터 없던 데이터 취급
							deleteIdx = -1;
							for(j = 0; j < editData.length; j++) {
								if(editData[j].id === dataId) {
									deleteIdx = j;
									break;
								}
							}
							editData.splice(deleteIdx, 1);
						}else {			//기존 데이터 삭제시, 변경된 값은 무시
							getEditDataById(dataId).changed = false;
							getEditDataById(dataId).deleted = true;
						}
					}

					editButtonsState(buttons);
					editDataSortBySortOrder();
					editDataResetSortOrder();
					changedDataUpdate();
					buttonDisabled();
				}
			});
			confirmDialog.message(MSG.DELETE_BUILDING_TEXT);
			confirmDialog.open();

		});

		//취소 버튼 클릭 이벤트
		buttons.btnCancel.set('click', function () {
			confirmDialog.setConfirmActions({
				yes : function(){
					changeEditMode(false);
				}
			});
			confirmDialog.message(MSG.SPACE_CANCEL_TEXT);
			confirmDialog.open();
		});

		//나가기 버튼 클릭 이벤트
		buttons.btnExit.set('click', function () {
			changeEditMode(false);
		});

		/* Building 순서 이동 버튼  */
		buttons.btnMoveTop.set('click', function() {
			buildingMove('up', 0);
		});

		buttons.btnMoveUp.set('click', function() {
			var checkedBoxes = editGridElem.find('.k-checkbox:checked');
			var index = checkedBoxes.eq(0).closest('tr').index();
			index = index > 0 ? index - 1 : index;
			buildingMove('up', index);
		});

		buttons.btnMoveDown.set('click', function() {
			var checkedBoxes = editGridElem.find('.k-checkbox:checked');
			var index = checkedBoxes.eq(checkedBoxes.length - 1).closest('tr').index();
			index = index < editGrid.dataSource.view().length - 1 ? index + 1 : index;
			buildingMove('down', index);
		});

		buttons.btnMoveBottom.set('click', function() {
			buildingMove('down', editGrid.dataSource.view().length - 1);
		});

		/**
		 *	<ul>
		 *		<li>빌딩 리스트 순서 변경 시 호출되는 함수</li>
		 *		<li>새로 생성된 데이터가 아니고, sortOrder가 변경될 경우 변경된 데이터에 추가</li>
		 *	</ul>
		 *	@function buildingMove
		 *	@param {String} type - 이동 타입 ['up', 'down']
		 *	@param {number} index - 이동할 위치(Array index)
		 *	@returns {Object} 없음
		 */
		var buildingMove = function (type, index) {
			var i, dataLength, tmpData, sortOrder;
			var viewData = editGrid.dataSource.view();
			var gridWrapper = editGridElem.find('.k-grid-content');
			var scrollTop = gridWrapper.scrollTop();
			dataLength = viewData.length;
			if(type === 'up') {
				sortOrder = 1;
				for(i = 0; i < index; i++) {
					tmpData = getEditDataById(viewData[i].id);
					if (!tmpData.created && tmpData.sortOrder !== sortOrder) {
						tmpData.changed = true;
					}
					tmpData.sortOrder = sortOrder++;
				}
				for(i = index; i < dataLength; i++) {
					if(viewData[i].checked) {
						tmpData = getEditDataById(viewData[i].id);
						if (!tmpData.created && tmpData.sortOrder !== sortOrder) {
							tmpData.changed = true;
						}
						tmpData.sortOrder = sortOrder++;
					}
				}
				for(i = index; i < dataLength; i++) {
					if(!viewData[i].checked) {
						tmpData = getEditDataById(viewData[i].id);
						if (!tmpData.created && tmpData.sortOrder !== sortOrder) {
							tmpData.changed = true;
						}
						tmpData.sortOrder = sortOrder++;
					}
				}
				scrollTop = scrollTop > 70 * index ? 70 * index : scrollTop;
				gridWrapper.scrollTop(scrollTop);
			} else if(type === 'down') {
				sortOrder = dataLength;
				for(i = dataLength - 1; i > index; i--) {
					tmpData = getEditDataById(viewData[i].id);
					if (!tmpData.created && tmpData.sortOrder !== sortOrder) {
						tmpData.changed = true;
					}
					tmpData.sortOrder = sortOrder--;
				}
				for(i = index; i >= 0; i--) {
					if(viewData[i].checked) {
						tmpData = getEditDataById(viewData[i].id);
						if (!tmpData.created && tmpData.sortOrder !== sortOrder) {
							tmpData.changed = true;
						}
						tmpData.sortOrder = sortOrder--;
					}
				}
				for(i = index; i >= 0; i--) {
					if(!viewData[i].checked) {
						tmpData = getEditDataById(viewData[i].id);
						if (!tmpData.created && tmpData.sortOrder !== sortOrder) {
							tmpData.changed = true;
						}
						tmpData.sortOrder = sortOrder--;
					}
				}
				scrollTop = scrollTop < 70 * (index + 1) - gridWrapper.height() ? 70 * (index + 1) - gridWrapper.height() : scrollTop;
				gridWrapper.scrollTop(scrollTop);
			}
			editDataSortBySortOrder();
			changedDataUpdate();
			editButtonsState(buttons);
			buttonDisabled();
		};

		//editGrid checkbox checked 이벤트
		editGrid.bind('checked', function (e) {
			var self = e.checkbox;
			var isHeader = e.isHeader;
			var viewData = editGrid.dataSource.view(), tmpData;
			var i;
			if(isHeader) {
				if(self[0].checked) editGridElem.find('.k-grid-content tr').toggleClass('k-state-selected');
			}else {
				self.closest('tr').toggleClass('k-state-selected');
			}
			for(i = 0; i < viewData.length; i++) {
				tmpData = getEditDataById(viewData[i].id);
				tmpData.checked = viewData[i].checked;
			}
			buttonDisabled();
		});

		//editGrid dataBound 이벤트
		//kendoCommonValidator를 등록하여 유효성 체크를 한다
		editGrid.bind('dataBound', function (evt) {
			validators.name.element = editGridElem.find('.k-input[data-key="name"]').kendoCommonValidator({type: 'name'});
			validators.name.validator = validAllElement('name');
			validators.description.element = editGridElem.find('.k-input[data-key="description"]').kendoCommonValidator({type: 'description'});
			validators.description.validator = validAllElement('description');
		});
	};

	/**
	 *	<ul>
	 *		<li>validators 안에 있는 key 들의 유효성체크</li>
	 *	</ul>
	 *	@function validAllElement
	 *	@param {String} key - 유효성체크 할 key
	 *	@returns {boolean} 유효성통과여부
	 */
	var validAllElement = function (key) {
		var element = validators[key].element;
		var i, length = element.length, validator;
		for(i = 0; i < length; i++) {
			validator = element.eq(i);
			if(!validator.data('kendoCommonValidator').validate()) return false;
		}
		return true;
	};

	/**
	 *	<ul>
	 *		<li>editData의 정보를 editGrid에 주입</li>
	 *		<li>UI 성능을 위해 편집되는 데이터와 그리드 데이터를 따로 가지고 있는다</li>
	 *		<li>본 함수가 호출되면 실제 편집 데이터가 그리드의 데이터에 복사되어 동기화된다</li>
	 *	</ul>
	 *	@function changedDataUpdate
	 *	@returns {Object} 없음
	 */
	var changedDataUpdate = function () {
		var i, j, checkedIdx, checkedData = editGrid.getCheckedData(), viewData;
		editGrid.setDataSource(new kendo.data.DataSource({
			data: JSON.parse(JSON.stringify(editData)),
			sort: {field: 'sortOrder', dir: 'asc'},
			filter: [
				{field: 'deleted', operator: 'neq', value: true}
			],
			aggregate: [{field: 'indexes.numberOfZones', aggregate: 'sum'}]
		}));
		viewData = editGrid.dataSource.view();
		for(i = 0; i < checkedData.length; i++) {
			checkedIdx = -1;
			for(j = 0; j < viewData.length; j++) {
				if(viewData[j].id === checkedData[i].id) {
					checkedIdx = j;
					break;
				}
			}
			if(checkedIdx > -1) editGridElem.find('.k-grid-content .k-checkbox-label').eq(checkedIdx).closest('tr').toggleClass('k-state-selected');
		}
	};

	/**
	 *	<ul>
	 *		<li>새 빌딩 이름 반환 함수(Building #)</li>
	 *	</ul>
	 *	@function getNewBuildingName
	 *	@returns {String} 새 빌딩 이름
	 */
	var getNewBuildingName = function () {
		var tmp, split, number, name, i, max = editData.length;
		var maxNum = 0;
		for(i = 0; i < max; i++) {
			tmp = editData[i];
			if(tmp.deleted) continue;
			name = tmp.name;
			if(name && name.indexOf('Building') !== -1) {
				split = name.split(' ');
				number = split[split.length - 1];
				number = Number(number);
				if(!isNaN(number) && maxNum < number) {
					maxNum = number;
				}
			}
		}
		return 'Building ' + (maxNum + 1);
	};

	/**
	 *	<ul>
	 *		<li>일반모드 / 편집모드 전환 함수</li>
	 *	</ul>
	 *	@function changeEditMode
	 *	@param {boolean} isEdit - 편집모드 여부
	 *	@returns {Object} 없음
	 */
	var changeEditMode = function (isEdit) {
		Common.changeEditMode(buttons, isEdit);
		if(isEdit) {
			spaceBodyElem.addClass('editable');
			editData = JSON.parse(JSON.stringify(mainGrid.dataSource.data()));
			if(editData.length > 0) editDataSortBySortOrder();
			changedDataUpdate();
		}else{
			spaceBodyElem.removeClass('editable');
			editGrid.uncheckAll();
			editData = [];
		}
	};

	/**
	 *	<ul>
	 *		<li>editData를 sortOrder로 정렬</li>
	 *	</ul>
	 *	@function editDataSortBySortOrder
	 *	@returns {Object} 없음
	 */
	var editDataSortBySortOrder = function () {
		editData.sort(function (a, b) {
			return a.sortOrder - b.sortOrder;
		});
	};

	/**
	 *	<ul>
	 *		<li>editData의 sortOrder를 재정의(이미 정렬된 상태여야 함)</li>
	 *	</ul>
	 *	@function editDataResetSortOrder
	 *	@returns {Object} 없음
	 */
	var editDataResetSortOrder = function () {
		var i, sortOrder = 1;
		for(i = 0; i < editData.length; i++) {
			if(!editData[i].deleted) {
				editData[i].sortOrder = sortOrder++;
				if(!editData[i].created) editData[i].changed = true;
			}
		}
	};

	/**
	 *	<ul>
	 *		<li>editData에서 id로 데이터를 가져오는 함수</li>
	 *	</ul>
	 *	@function getEditDataById
	 *	@param {Number} id - 정보를 가져올 id
	 *	@returns {Object} id에 해당하는 데이터
	 */
	var getEditDataById = function (id) {
		var target;
		target = $.grep(editData, function (obj) {
			return obj.id === id;
		});
		return target[0] ? target[0] : null;
	};

	/**
	 *	<ul>
	 *		<li>editData에서 type에 해당하는 데이터를 가져오는 함수</li>
	 *	</ul>
	 *	@function getUpdatedEditData
	 *	@param {String} type - 데이터 타입[created, changed, deleted]
	 *	@returns {Array} type이 맞는 데이터 배열
	 */
	var getUpdatedEditData = function (type) {
		var i, result = [];
		for(i = 0; i < editData.length; i++) {
			if(editData[i][type]) result.push(editData[i]);
		}
		return result;
	};

	return {
		init : init
	};

});

//# sourceURL=controlareasettings/total-building.js
