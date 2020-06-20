/**
 *
 *   <ul>
 *       <li>specific-floor에 관련된 view 모델 설정 작업</li>
 *   </ul>
 *   @module app/controlareasettings/building/specific-floor
 *   @param {Object} CoreModule - 에너지 core 객체
 *   @param {Object} Common - space Common 객체
 *   @param {Object} Widget - space Widget 객체
 *   @param {Object} Model - space Model 객체
 *   @param {Object} API - space API 객체
 *   @param {Object} ViewModel - space ViewModel 객체
 *   @requires app/ControlAreaSettings/core
 *   @requires app/controlareasettings/building/config/space-common
 *   @requires app/controlareasettings/building/config/space-widget
 *   @requires app/controlareasettings/building/model/space-model
 *   @requires app/controlareasettings/building/model/space-api
 *   @requires app/controlareasettings/building/model/space-vm
 *   @returns {Object} 없음
 */
define("controlareasettings/building/specific-floor", ["controlareasettings/core", "controlareasettings/building/config/space-common",
	"controlareasettings/building/config/space-widget",
	"controlareasettings/building/model/space-model", 'controlareasettings/building/config/space-api', 'controlareasettings/building/config/space-vm'], function(CoreModule, Common, Widget, Model, API, ViewModel){
	"use strict";

	var kendo = window.kendo, moment = window.moment, Util = window.Util;
	var MainWindow = window.MAIN_WINDOW;
	var MSG = Common.MESSAGE, TEXT = Common.TEXT;
	var Loading = Widget.Loading, confirmDialog = Widget.confirmDialog,	msgDialog = Widget.messagDialog;
	var checkDuplicatedByKey = Common.checkDuplicatedByKey, deepCopyArray = Common.deepCopyArray, getFloorName = Common.getFloorName;

	var mapView, mapViewElem, mapViewColorPicker, mapViewColorPickerElem, detailDialog, detailDialogElem;
	var zoneList, zoneListElem, zoneListEdit, zoneListEditElem;
	var mapDropDownList, mapDropDownListElem;
	var buildingData, floorData, floorId;
	var specificFloorContent, mapContent, fakeGridBody;

	var typeFilterDataSource;

	var mainButtonsTemplate = $('#spaceFloorTopButtons').html();
	var tabElem, tabTopContentElem;

	var MainViewModel = ViewModel.SpecificFloorMainViewModel;
	var buttons = {
		btnFloorDelete: MainViewModel.get('btnFloorDelete'),
		btnEdit: MainViewModel.get('btnEdit'),
		btnSave: MainViewModel.get('btnSave'),
		btnExit: MainViewModel.get('btnExit'),
		btnCancel: MainViewModel.get('btnCancel'),

		btnZoneCreate: MainViewModel.get('btnZoneCreate'),
		btnZoneDelete: MainViewModel.get('btnZoneDelete'),

		btnMoveTop: MainViewModel.get('btnMoveTop'),
		btnMoveUp: MainViewModel.get('btnMoveUp'),
		btnMoveDown: MainViewModel.get('btnMoveDown'),
		btnMoveBottom: MainViewModel.get('btnMoveBottom')
	};

	var buttonStateChange = Common.buttonStateChange;

	/**
	 *
	 *   space specific floor 페이지 진입시 기본 셋팅을 해주는 함수
	 *
	 *   @function init
	 *   @param {Object} initArg - 현재 층 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var init = function(initArg){

		buildingData = initArg.building ? initArg.building : MainWindow.getCurrentFloor().building;
		floorId = initArg.floor.id;
		floorData = initArg.floor ? initArg.floor : MainWindow.getCurrentFloor().floor;

		initView();
		initComponent();
		attachEvent();

		exitEditMode();
		Loading.open();
		getData();
	};

	var initView = function () {
		tabElem = $('#component-example-tab');										//tab element
		tabTopContentElem = $('.common-tab-top-content');							//tab top element(버튼)
		tabTopContentElem.append(mainButtonsTemplate);								//버튼 append
		detailDialogElem = $('#space-detail-dialog');								//상세팝업 element
		specificFloorContent = $("#spaceFloorGrid");								//main body
		fakeGridBody = specificFloorContent.find(".fake-grid-body");				//상단 층 정보 element
		mapContent = specificFloorContent.find(".space-map-view").off('click');		//맵뷰 및 존리스트 wrapper
		zoneListElem = mapContent.find('#zone-list-grid');							//존 리스트 element
		zoneListEditElem = mapContent.find('#zone-list-grid-edit');					//존 리스트 편집 element
		mapViewElem = mapContent.find("#map-view-block");							//맵뷰 element
		mapDropDownListElem = mapContent.find(".device-filter");					//기기타입필터 element
	};

	var initComponent = function () {
		//상세팝업 초기화
		if(detailDialogElem.data('kendoDetailDialog')) detailDialogElem.data('kendoDetailDialog').destroy();
		detailDialog = detailDialogElem.kendoDetailDialog({
			title: TEXT.COMMON_BTN_DETAIL,
			dataSource: [],
			height: 850,
			width: 700,
			scheme: {
				id: "id",
				fields: {
					'name': {		//실제로 name은 헤더영역에서 편집, 해당 영역은 '일반' 영역 표시용
						name: TEXT.SPACE_TEXT_GENERAL,
						type: 'text',
						editable: true,
						editCss: {
							display: 'none'
						},
						template: function () {
							return '';
						}
					},
					"location": {
						name: TEXT.SPACE_TEXT_LOCATION,
						type: 'text',
						template: function (data) {
							return data.foundation_space_buildings_name + ' - ' + getFloorName(data.foundation_space_floors_type, data.foundation_space_floors_name);
						}
					},
					"description": {
						name: TEXT.DESCRIPTION,
						type: 'text',
						editable: true,
						validator: true,
						editCss: {
							width: '100%'
						}
					},
					'created': {		//해당 영역은 '[생성]' 영역 표시용
						name: '[ ' + TEXT.SPACE_BUTTON_TEXT_CREATE + ' ]',
						template: function () {
							return '';
						}
					},
					'created_date': {
						name: TEXT.SPACE_TEXT_DATE,
						template: function (data) {
							var txt = '-';
							txt = typeof data.created !== 'undefined' ? moment(data.created.date).format('YYYY/MM/DD hh:mm:ss') : txt;
							return txt;
						}
					},
					'created_ums_users_name': {
						name: TEXT.SPACE_TEXT_MANAGER,
						template: function (data) {
							var txt = '-';
							txt = typeof data.created !== 'undefined' ? data.created.ums_users_name : txt;
							return txt;
						}
					},
					'updated': {		//해당 영역은 '[최신 업데이트]' 영역 표시용
						name: '[ ' + TEXT.SPACE_TEXT_LATEST_UPDATE + ' ]',
						type: 'text',
						template: function () {
							return '';
						}
					},
					'updated_date': {
						name: TEXT.SPACE_TEXT_DATE,
						template: function (data) {
							var txt = '-';
							txt = typeof data.updated !== 'undefined' ? moment(data.updated.date).format('YYYY/MM/DD hh:mm:ss') : txt;
							return txt;
						}
					},
					'updated_ums_users_name': {
						name: TEXT.SPACE_TEXT_MANAGER,
						template: function (data) {
							var txt = '-';
							txt = typeof data.updated !== 'undefined' ? data.updated.ums_users_name : txt;
							return txt;
						}
					},
					'backgroundColor': {
						name: TEXT.SPACE_TEXT_COLOR,
						type: 'text',
						template: function (data) {
							if(!data.backgroundColor) data.backgroundColor = '#0081c6';
							return '<div><div class="space-detail-dialog-color-picker" style="background-color: ' + data.backgroundColor + ';"></div><div class="space-detail-dialog-color">' + data.backgroundColor + '</div></div>';
						},
						editable: true,
						editFieldName: 'backgroundColor',
						editTemplate: function () {
							return '<div><div class="space-detail-dialog-color-picker" data-bind="style:  {backgroundColor: fields.backgroundColor}"></div><input class="k-input space-detail-dialog-color-picker-active-area" data-bind="value: fields.backgroundColor, events: {click: click}, disabled: disabled"><div id="space-color-picker"></div></div>';
						},
						editViewModel: {
							fields: {
								backgroundColor: null
							},
							click: function (e) {
								var colorPicker = $('#space-color-picker').data('kendoCommonColorPicker');
								colorPicker.open();
								e.stopPropagation();
							},
							disabled: false,
							init: function () {
								var self = this;
								self.fields.backgroundColor = detailDialog.getSelectedData().backgroundColor;
								var colorPicker, colorPickerElem = $('#space-color-picker');
								colorPicker = colorPickerElem.kendoCommonColorPicker({
									// activeSelector: '.space-detail-dialog-color-picker-active-area'
								}).data('kendoCommonColorPicker');
								colorPicker.bind('change', function (e) {
									var viewModel = detailDialog.options.scheme.fields.backgroundColor.editViewModel;
									viewModel.fields.set('backgroundColor', e.value);
									detailDialog.enableSaveBtn();
								});
							}
						}
					}
				}
			},
			headerTemplate: function (data) {
				var txt = '<div class="space-popup-header"><div class="detail-dialog-content-field-item" data-editable="true" data-key="name"><div class="detail-dialog-content-field-value">';
				txt += '<span class="display">' + data.name + '</span>';
				txt += '<span class="editable" style="width: 100%;"><input type="text" class="k-input" style="width: 100%;"></span></div></div></div>';
				return txt;
			},
			isCustomActions: true,
			actions: [
				{
					text: TEXT.SPACE_BUTTON_TEXT_SAVE,
					visible: false,
					disabled: true,
					action: detailDialogSave
				},
				{
					text: TEXT.SPACE_BUTTON_TEXT_EDIT,
					visible: true,
					action: detailDialogEdit
				},
				{
					text: TEXT.SPACE_BUTTON_TEXT_CANCEL,
					visible: false,
					action: detailDialogCancel
				},
				{
					text: TEXT.SPACE_BUTTON_TEXT_DELETE,
					visible: true,
					action: detailDialogDelete
				},
				{
					text: TEXT.SPACE_BUTTON_TEXT_EXIT,
					visible: true,
					action: detailDialogClose
				}
			]
		}).data('kendoDetailDialog');

		//뷰-모델 바인딩
		kendo.bind(tabElem, MainViewModel);

		//존 리스트 초기화
		zoneList = zoneListElem.kendoGrid({
			columns: setZoneListGridColumns(),
			scrollable: true,
			height: '100%'
		}).data('kendoGrid');
		//존 리스트 편집모드 초기화
		zoneListEdit = zoneListEditElem.kendoGrid({
			columns: setZoneListGridColumns(),
			hasCheckedModel: true,
			setCheckedAttribute: true,
			scrollable: true,
			height: 'calc(100% - 48px)'
		}).data('kendoGrid');

		//맵뷰 초기화
		mapView = mapViewElem.kendoCommonMapView({
			floor: floorData,
			showDeviceInfoCheckbox: false,
			height: '100%',
			isRegisterView: true,
			canDragDeviceIcon: false,
			isMonitoringFloorImage : false
		}).data('kendoCommonMapView');
		mapViewColorPickerElem = mapViewElem.find('.leaflet-control-container .common-map-view-color-picker-element');
		mapViewColorPicker = mapViewColorPickerElem.data('kendoCommonColorPicker');

		//기기타입필터 초기화
		typeFilterDataSource = Util.getTotalDeviceTypeDataSource();
		mapDropDownList = mapDropDownListElem.kendoDropDownCheckBox({
			invisible : false,
			disabled : false,       //비활성화 여부
			dataTextField: "text",
			dataValueField: "value",
			emptyText: TEXT.SPACE_NO_DEVICE_TYPE,
			selectAllText : TEXT.SPACE_ALL_DEVICE_TYPE,
			animation: false,
			autoBind : true,
			showSelectAll: true,
			dataSource: typeFilterDataSource
		}).data("kendoDropDownCheckBox");
	};

	/**
	 *	<ul>
	 *		<li>device, zone, floor 정보를 요청 후 화면에 출력</li>
	 *	</ul>
	 *	@function getData
	 *	@returns {Object} 없음
	 */
	var getData = function () {
		$.when.apply(this, [API.dmsDevicesGET({foundation_space_floors_id: [floorId], registrationStatuses: ['Registered']}), API.spaceZonesGET({foundation_space_floors_id: [floorId]}), API.spaceFloorsGET({ids: [floorId]})]).done(function(devices, zones, floorInfo) {
			var i, deviceData = [], zoneData = [];
			if(devices[0]){
				for (i = 0; i < devices[0].length; i++) {
					deviceData.push(devices[0][i]);
				}
			}
			if(zones[0]){
				for (i = 0; i < zones[0].length; i++) {
					zoneData.push(zones[0][i]);
				}
			}
			mapView.setZoneDataSource(zoneData);
			mapView.setDataSource(deviceData);
			mapView.zoneDataSource.sort({field: 'sortOrder', dir: 'asc'});
			//맵뷰와 zoneList의 분리를 위해 deep-copy를 이용
			zoneList.setDataSource(new kendo.data.DataSource({
				data: deepCopyArray(zoneData),
				sort: {field: 'sortOrder', dir: 'asc'}
			}));

			if(floorInfo[0] && !floorInfo[0][0]){
				floorInfo[0][0] = {};
			}
			renderFloorData(floorInfo[0][0]);
		}).fail(function(xhq){
			var msg = Util.parseFailResponse(xhq);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function() {
			Loading.close();
			mapDropDownList.selectAll();
		});
	};

	/**
	 *
	 *   checkbox 체크에 따른 존 순서 및 존 삭제 버튼 dim 함수
	 *
	 *   @function buttonDisabled
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var buttonDisabled = function(){
		var zoneCheckBoxes = $('#zone-list-grid-edit .k-grid-content .k-checkbox');
		var checkedBoxes = $('#zone-list-grid-edit .k-grid-content .k-checkbox:checked');
		var checkedLength = checkedBoxes.length;
		var lastCheckedIndex = $('#zone-list-grid-edit .k-grid-content .k-checkbox:checked:last').closest('tr').index();

		buttonStateChange(buttons, [
			{btnZoneCreate: [zoneCheckBoxes.length < 100 ? false : true, true]},
			{btnZoneDelete: [checkedLength > 0 ? false : true, true]},
			{btnMoveTop: [false, true]},
			{btnMoveUp: [false, true]},
			{btnMoveDown: [false, true]},
			{btnMoveBottom: [false, true]}
		]);
		if(checkedLength - 1 === lastCheckedIndex) {
			buttonStateChange(buttons, [{btnMoveTop: [true, true]}, {btnMoveUp: [true, true]}]);
		}
		if(checkedBoxes.eq(0).closest('tr').index() === -1 || checkedBoxes.eq(0).closest('tr').index() === zoneCheckBoxes.length - checkedLength) {
			buttonStateChange(buttons, [{btnMoveDown: [true, true]}, {btnMoveBottom: [true, true]}]);
		}

	};
	/**
	 *
	 *   floor view 만들어주는 기능
	 *
	 *   @function renderFloorData
	 *   @param {Object} data - 받아온 floor 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var renderFloorData = function(data){
		var type, name, desc, numOfZones, fileName, floorName, width, length;
		type = data.type ? data.type : "-";
		name = data.name ? data.name : "-";
		desc = data.description ? data.description : "";
		width = data.width ? data.width : "-";
		length = data.length ? data.length : "-";
		fileName = data.imageFileName ? data.imageFileName.replace("/", "") : "-";
		var indexes = data.indexes;
		numOfZones = "-";
		if(indexes){
			numOfZones = indexes.numberOfZones ? indexes.numberOfZones : "-";
		}
		floorName = getFloorName(type, name);

		fakeGridBody.find('.Floor').html(floorName);
		fakeGridBody.find('.Description').html(desc);
		fakeGridBody.find('.width').html(width);
		fakeGridBody.find('.length').html(length);
		fakeGridBody.find('.ZoneNum').html(numOfZones);
		fakeGridBody.find('.MapImage').html(fileName);
	};

	/**
	 *
	 *   버튼 또는 드롭다운리스트 등의 이벤트를 바인딩 한다.
	 *
	 *   @function attachEvent
	 *   @returns {Object} 없음
	 *
	 */
	var attachEvent = function(){
		//기기타입 필터
		mapDropDownListElem.on('change',function(){
			var typeFilters = {logic: "or", filters: []};
			var max, type, types = $(this).val();
			types = types ? types.split(",") : types;
			mapView.dataSource.filter([]);
			if(types && types !== "All" && types.length > 0) {
				max = types.length;
				for(var i = 0; i < max; i++) {
					type = types[i];
					if(type) {
						if(type !== "ControlPoint") {
							typeFilters.filters.push({field: "type", operator: "contains", value: type});
						}
						typeFilters.filters.push({field: "mappedType", operator: "contains", value: type});
					}
				}
				mapView.dataSource.filter(typeFilters);
			}
			mapView.dataSource.view();
		});

		//존 이동시 버튼 상태 변경
		mapView.bind('dragend', function (e) {
			if(e.zones.length > 0) {
				editButtonsState(false);
			}
		});
		//존 선택시 체크박스 상태 변경
		mapView.bind('change', function(e) {
			var zone = e.zones ? e.zones[0] : void (0);
			var zoneListEditDataSource = zoneListEdit.dataSource, zoneListEditData;
			if(e.sender._isEditableZone && typeof zone !== 'undefined'){
				zoneListEditData = zoneListEditDataSource.get(zone.id);
				zoneListEditData.set('checked', zone.selected);
				zoneListEditData.set('name', zone.name);
				if(mapView.getUpdatedZones().updated.length > 0) editButtonsState(false);
				buttonDisabled();
			}
		});
		//맵뷰 컬러피커 색 변경
		mapViewColorPicker.bind('change', function (e) {
			editButtonsState(false);
		});

		//수정 버튼 클릭 이벤트
		buttons.btnEdit.set('click', function() {
			var listLength = zoneList.dataSource.data().length;
			enterEditMode(false);
			//존 개수 100개 제한
			if(listLength >= 100){
				buttonStateChange(buttons, [{btnZoneCreate: [true, true]}]);
			}
		});

		//층삭제 버튼 클릭 이벤트
		buttons.btnFloorDelete.set('click', function() {
			confirmDialog.setConfirmActions({
				yes : function(){
					Loading.open();
					$.when.apply(this, API.spaceFloorsDELETE([{id: floorId}])).done(function(){
						msgDialog.message(MSG.DELETE_FLOOR_TEXT_RESULT);
						msgDialog.open();
						MainWindow.refreshFloorList();
						MainWindow.clickAllFloor();
					}).fail(function(xhq){
						var msg = Util.parseFailResponse(xhq);
						msgDialog.message(msg);
						msgDialog.open();
					}).always(function(){
						Loading.close();
					});
				},
				no : null
			});
			confirmDialog.message(MSG.DELETE_FLOOR_TEXT);
			confirmDialog.open();
		});

		//저장 버튼 클릭 이벤트
		buttons.btnSave.set('click', function() {
			//존 겹침 체크(mapView function)
			if(mapView.isIntersectZonePolygons()){
				msgDialog.message(MSG.SPACE_SAVE_ZONE_OVERLAP);
				msgDialog.open();
				return;
			}
			//존 이름 중복 체크
			if(checkDuplicatedByKey(zoneListEdit.dataSource.view(),'name')){
				msgDialog.message(MSG.SPACE_SAVE_ZONE_NAME_OVERLAP_ERROR);
				msgDialog.open();
				return;
			}

			Loading.open();

			var idx, tmpZone;
			var mapViewZoneDS = mapView.zoneDataSource;
			var updatedZones = mapView.getUpdatedZones();
			var zonePostList = updatedZones.created;
			var zonePatchList = updatedZones.updated;
			var zoneDeleteList = updatedZones.deleted;
			var devicePatchList;

			//PATCH 요청시 바뀐 값만 보낼 경우 정상적으로 처리가 되지 않아서 모든 정보를 보냄
			for(idx = 0; idx < zonePatchList.length; idx++) {
				tmpZone = mapViewZoneDS.get(zonePatchList[idx].id);
				zonePatchList[idx] = tmpZone;
			}
			//API 호출 순서 : zonePOST & zonePATCH -> zoneGET -> devicePATCH -> zoneDELETE
			//새로 생긴 존 및 업데이트 된 존 정보를 보냄
			//-> 새로 생긴 존의 id를 받아옴
			//-> 새로 생긴 존에 속한 기기 정보 업데이트
			//-> 바뀐 기기의 정보를 보냄
			//-> 삭제된 존의 정보를 보냄
			//post시, 20x status를 success로 인식하지 못해서 always에서 처리
			$.when.apply(this, API.spaceZonesPOST(zonePostList), API.spaceZonesPATCH(zonePatchList)).always(function(status) {
				//undefined : post 또는 patch가 없는 경우
				if(typeof status === 'undefined' || status.status == 201 || status.status == 204){
					API.spaceZonesGET({foundation_space_floors_id: [floorId]}).done(function (responseData) {
						var i;
						var oldZoneDataSource = mapView.zoneDataSource, oldZone;
						//새로 생긴 존의 id를 mapView에 set
						for(i = 0; i < responseData.length; i++) {
							oldZone = void (0);
							$.grep(oldZoneDataSource.data(), function(tmp) {
								if(responseData[i].name === tmp.name) {
									oldZone = oldZoneDataSource.get(tmp.id);
								}
							});
							if(typeof oldZone !== 'undefined' && oldZone.id !== responseData[i].id) {
								oldZone.set('id', responseData[i].id);
							}
						}
						devicePatchList = mapView.getUpdatedDevices().updated;
						$.when.apply(this, API.dmsDevicesPATCH(devicePatchList)).done(function () {
							//존에 속한 기기가 없어야 정상적으로 존 삭제가 되므로 기기 정보를 업데이트 한 후 존 삭제 요청
							$.when.apply(this, API.spaceZonesDELETE(zoneDeleteList)).done(function () {
								msgDialog.message(MSG.SPACE_SAVE_TEXT_RESULT);
								msgDialog.open();
								exitEditMode();
								getData();
							}).fail(function (xhq) {
								Loading.close();
								msgDialog.message(Util.parseFailResponse(xhq));
								msgDialog.open();
							});
						}).fail(function (xhq) {
							Loading.close();
							msgDialog.message(Util.parseFailResponse(xhq));
							msgDialog.open();
						});
					}).fail(function (xhq) {
						Loading.close();
						msgDialog.message(Util.parseFailResponse(xhq));
						msgDialog.open();
					});
				} else {
					Loading.close();
					msgDialog.message(Util.parseFailResponse(status));
					msgDialog.open();
				}
			});
		});

		//취소 버튼 클릭 이벤트
		buttons.btnCancel.set('click', function() {
			confirmDialog.setConfirmActions({
				yes : function(){
					exitEditMode();
					//zoneList는 수정 전 데이터를 가지고 있으므로 zoneList의 zoneData를 맵뷰에 복사
					mapView.setZoneDataSource(deepCopyArray(zoneList.dataSource.data()));
					mapView.zoneDataSource.sort({field: 'sortOrder', dir: 'asc'});

					msgDialog.message(MSG.SPACE_CANCEL_TEXT_RESULT);
					msgDialog.open();
				}
			});
			confirmDialog.message(MSG.SPACE_CANCEL_TEXT);
			confirmDialog.open();
		});

		//나가기 버튼 클릭 이벤트
		buttons.btnExit.set('click', function() {
			exitEditMode();
		});

		//존 삭제 버튼 클릭 이벤트
		buttons.btnZoneDelete.set('click', function() {
			var checkedLength = zoneListEdit.getCheckedData().length;
			confirmDialog.setConfirmActions({
				yes : function(){
					var checkList = zoneListEdit.getCheckedData();
					var viewList, listLength, i;
					var mapViewZoneDataSource = mapView.zoneDataSource;
					//선택된 존을 mapView에서 제거
					for(i = 0; i < checkList.length; i++){
						mapViewZoneDataSource.remove(mapViewZoneDataSource.get(checkList[i].id));
					}
					viewList = mapViewZoneDataSource.view();
					listLength = viewList.length;
					//sortOrder 재정의 - 현재 뷰에서 차례대로 1부터 정의
					for(i = 0; i < listLength; i++) {
						mapViewZoneDataSource.get(viewList[i].id).set('sortOrder', i + 1);
					}
					mapView.unselectAll();
					editButtonsState(true);
				},
				no : null
			});

			var msg;
			if(checkedLength == 1){
				msg = MSG.DELETE_ZONE_TEXT;
			}else{
				msg = MSG.DELETE_MULTI_ZONE_TEXT(checkedLength);
			}
			confirmDialog.message(msg);
			confirmDialog.open();

		});

		//존 생성 버튼 클릭 이벤트
		buttons.btnZoneCreate.set('click', function() {
			var i, createUid = kendo.guid();
			var mapViewZoneDataSource = mapView.zoneDataSource;
			var mapViewZoneData = mapViewZoneDataSource.data();

			mapView.unselectAll();
			mapViewZoneDataSource.add({
				id: createUid, sortOrder: 0,
				foundation_space_buildings_name: buildingData.name,
				foundation_space_floors_type: floorData.type,
				foundation_space_floors_name: floorData.name,
				selected: true
			});

			//sortOrder 하나씩 증가
			for (i = 0; i < mapViewZoneData.length; i++) {
				mapViewZoneData[i].set('sortOrder', mapViewZoneData[i].sortOrder + 1);
			}

			editButtonsState(true);
			mapView.editableZone(createUid, true);
		});

		//grid checked 이벤트
		//맵뷰 데이터의 selected 상태를 checked와 동기화
		zoneListEdit.bind('checked', function (e) {
			var zoneData = e.sender.dataSource.data();
			var isHeader = e.isHeader;
			var data = e.item;
			var i;
			if(isHeader){
				for(i = 0; i < zoneData.length; i++){
					mapView.selectZone(zoneData[i].id, zoneData[i].checked);
				}
			}else if (data.checked) {
				mapView.editableZone(data.id, data.checked);
			} else {
				mapView.selectZone(data.id, data.checked);
			}
			buttonDisabled();
		});

		/* Zone 순서 이동 버튼  */
		buttons.btnMoveTop.set('click', function() {
			zoneMove('up', 0);
		});

		buttons.btnMoveUp.set('click', function() {
			var checkedBoxes = $('#zone-list-grid-edit .k-checkbox:checked');
			var index = checkedBoxes.eq(0).closest('tr').index();
			index = index > 0 ? index - 1 : index;
			zoneMove('up', index);
		});

		buttons.btnMoveDown.set('click', function() {
			var checkedBoxes = $('#zone-list-grid-edit .k-checkbox:checked');
			var index = checkedBoxes.eq(checkedBoxes.length - 1).closest('tr').index();
			index = index < mapView.zoneDataSource.data().length - 1 ? index + 1 : index;
			zoneMove('down', index);
		});

		buttons.btnMoveBottom.set('click', function() {
			zoneMove('down', mapView.zoneDataSource.data().length - 1);
		});

		/**
		 *	<ul>
		 *		<li>존 리스트 순서 변경 시 호출되는 함수</li>
		 *		<li>새로운 array(tmpZoneData)에 index를 기준으로 순서를 정해서 zone을 담은 후, 차례대로 sortOrder를 변경</li>
		 *	</ul>
		 *	@function zoneMove
		 *	@param {String} type - 이동 타입 ['up', 'down']
		 *	@param {number} index - 이동할 위치(Array index)
		 *	@returns {Object} 없음
		 */
		var zoneMove = function (type, index) {
			var i, dataLength;
			var tmpZoneData = [], tmpZone;
			var originalZoneDataSource = mapView.zoneDataSource;
			var originalZoneData = originalZoneDataSource.view();
			dataLength = originalZoneData.length;
			if(type === 'up') {
				for(i = 0; i < index; i++) {
					tmpZoneData.push(originalZoneData[i]);
				}
				for(i = index; i < dataLength; i++) {
					if(originalZoneData[i].selected) {
						tmpZoneData.push(originalZoneData[i]);
					}
				}
				for(i = index; i < dataLength; i++) {
					if(!originalZoneData[i].selected) {
						tmpZoneData.push(originalZoneData[i]);
					}
				}
			} else if(type === 'down') {
				for(i = dataLength - 1; i > index; i--) {
					tmpZoneData.unshift(originalZoneData[i]);
				}
				for(i = index; i >= 0; i--) {
					if(originalZoneData[i].selected) {
						tmpZoneData.unshift(originalZoneData[i]);
					}
				}
				for(i = index; i >= 0; i--) {
					if(!originalZoneData[i].selected) {
						tmpZoneData.unshift(originalZoneData[i]);
					}
				}
			}
			for(i = 0; i < dataLength; i++) {
				tmpZone = originalZoneDataSource.get(tmpZoneData[i].id);
				tmpZone.set('sortOrder', i + 1);
			}
			originalZoneDataSource.sort({field: 'sortOrder', dir: 'asc'});
			editButtonsState(true);
		};

		//상세정보 버튼 클릭
		mapContent.on('click', '.ic.ic-info', function (e) {
			var self = $(e.target);
			var dataId = self.closest('span').data('id');
			detailDialog.setDataSource(mapView.zoneDataSource.get(dataId));
			if (mapContent.hasClass('editable')) {
				detailDialog.buttons[detailDialog.BTN['EDIT']].click();
			}
			detailDialog.open();
			$('.space-popup-header input').kendoCommonValidator({
				type: 'name',
				rules: {
					required: function (input) {
						var val = input.val();
						if (!val) {
							return false;
						}
						return true;
					}
				},
				messages: {
					required: MSG.SPACE_MESSAGE_NOTI_NOT_SAME_ZNOE_NAME
				}
			});
		});

		//상세팝업 존이름 편집 keyup 이벤트
		//팝업영역에서 content 영역이 아닌 header에 생성하기 때문에 이벤트를 걸어줌
		detailDialogElem.off('keyup').on('keyup', '.space-popup-header .editable input', function (e) {
			var targetInput = detailDialogElem.find('li[data-key="name"] input');
			targetInput.trigger($.Event('keyup', {keyCode: e.keyCode}));
			if (!$(this).data('kendoCommonValidator').validate()) {
				detailDialog.disableSaveBtn();
			}
		});
		detailDialogElem.off('change').on('change', '.space-popup-header .editable input', function (e) {
			var targetInput = detailDialogElem.find('li[data-key="name"] input');
			targetInput.val($(e.target).val());
		});

		$(window).on('resize', function (e) {
			zoneList.setOptions({height: '100%'});
			zoneListEdit.setOptions({height: 'calc(100% - 48px)'});
		});
	};

	/**
	 *	<ul>
	 *		<li>상세팝업 수정버튼 이벤트</li>
	 *	</ul>
	 *	@function detailDialogEdit
	 *	@param {Event} e - Event 객체
	 *	@returns {boolean} 팝업을 유지하기 위해 false를 리턴
	 */
	var detailDialogEdit = function (e) {
		var elem = $(e.sender.element);
		var name = e.sender.dataSource.data()[0].name;
		elem.find('.space-popup-header .editable input').val(name);
		e.sender.setEditable(true);
		return false;
	};

	/**
	 *	<ul>
	 *		<li>상세팝업 삭제버튼 이벤트</li>
	 *	</ul>
	 *	@function detailDialogDelete
	 *	@param {Event} e - Event 객체
	 *	@returns {boolean} 팝업을 유지하기 위해 false를 리턴
	 */
	var detailDialogDelete = function (e) {
		var msg = MSG.DELETE_ZONE_TEXT;
		confirmDialog.message(msg);
		confirmDialog.setConfirmActions({
			yes : function(){
				var targetId = e.sender.dataSource.data()[0].id;
				enterEditMode(true);
				mapView.zoneDataSource.remove(mapView.zoneDataSource.get(targetId));
				setZoneListEditDataSource();
				e.sender.close();
			},
			no : null
		});
		confirmDialog.open();

		return false;
	};

	/**
	 *	<ul>
	 *		<li>상세팝업 나가기버튼 이벤트</li>
	 *	</ul>
	 *	@function detailDialogClose
	 *	@param {Event} e - Event 객체
	 *	@returns {Object} 없음
	 */
	var detailDialogClose = function (e) {
		if(e.sender.isEditable) {
			e.sender.setEditable(false);
		}
	};

	/**
	 *	<ul>
	 *		<li>상세팝업 편집모드 저장버튼 이벤트</li>
	 *	</ul>
	 *	@function detailDialogSave
	 *	@param {Event} e - Event 객체
	 *	@returns {boolean} 팝업을 유지하기 위해 false를 리턴
	 */
	var detailDialogSave = function (e) {
		var self = e.sender;
		var elem = $(self.element);
		var i, key, mapViewZoneDataSource = mapView.zoneDataSource;
		var currentData = self.dataSource.data()[0];
		var mapViewZoneData, zoneData = mapViewZoneDataSource.data();
		var zoneListEditData;
		var dialogHeader = elem.find('.space-popup-header');
		var nameInput = dialogHeader.find('.editable input');
		var changedName = nameInput.val();
		var result = self.save();
		//존 이름 겹침 확인
		for(i = 0; i < zoneData.length; i++){
			if(currentData.id !== zoneData[i].id && changedName === zoneData[i].name) {
				msgDialog.message(MSG.SPACE_SAVE_ZONE_NAME_OVERLAP_ERROR);
				msgDialog.open();
				return false;
			}
		}
		//저장 여부 판별 후 저장
		if(nameInput.data('kendoCommonValidator').validate() && result) {
			enterEditMode(true);
			self.setEditable(false);
			mapViewZoneData = mapViewZoneDataSource.get(currentData.id);
			zoneListEditData = zoneListEdit.dataSource.get(currentData.id);
			for(key in result) {
				currentData.set(key, result[key]);
				mapViewZoneData.set(key, result[key]);
				zoneListEditData.set(key, result[key]);
			}
			self.updateDisplayValue();
			nameInput.closest('div').find('.display').html(changedName);
		}
		return false;
	};

	/**
	 *	<ul>
	 *		<li>상세팝업 편집모드 취소버튼 이벤트</li>
	 *	</ul>
	 *	@function detailDialogCancel
	 *	@param {Event} e - Event 객체
	 *	@returns {boolean} 팝업을 유지하기 위해 false를 리턴
	 */
	var detailDialogCancel = function (e) {
		return e.sender._cancelEvent(e, false);
	};

	/**
	 *	<ul>
	 *		<li>zoneList 및 zoneListEdit의 columns 설정</li>
	 *	</ul>
	 *	@function setZoneListGridColumns
	 *	@returns {Array} Columns 배열
	 */
	var setZoneListGridColumns = function () {
		var columns = [];
		var floorTitle = getFloorName(floorData.type, floorData.name);
		columns.push(
			{
				field: 'name',
				title: floorTitle
			},
			{
				title: '',
				template: function (data) {
					return '<span class="ic ic-info" data-id="' + data.id + '"></span>';
				},
				width: 40
			}
		);
		return columns;
	};

	/**
	 *	<ul>
	 *		<li>화면 상태를 편집 상태로 전환</li>
	 *		<li>isChanged에 따라 저장/나가기/취소 버튼 활성화</li>
	 *	</ul>
	 *	@function enterEditMode
	 *	@param {boolean} isChanged - 수정여부
	 *	@returns {Object} 없음
	 */
	var enterEditMode = function (isChanged) {
		buttonStateChange(buttons, [
			{btnFloorDelete: [false, false]},
			{btnEdit: [false, false]},
			{btnSave: [!isChanged, true]},
			{btnCancel: [false, isChanged]},
			{btnExit: [false, !isChanged]},
			{btnZoneCreate: [false, true]},
			{btnZoneDelete: [true, true]},
			{btnMoveTop: [true, true]},
			{btnMoveUp: [true, true]},
			{btnMoveDown: [true, true]},
			{btnMoveBottom: [true, true]}
		]);
		if(!mapContent.hasClass('editable')) mapContent.addClass('editable');
		mapView.setEditableZone(true);
		setZoneListEditDataSource();
	};

	/**
	 *	<ul>
	 *		<li>화면 상태를 뷰 상태로 전환</li>
	 *	</ul>
	 *	@function exitEditMode
	 *	@returns {Object} 없음
	 */
	var exitEditMode = function () {
		buttonStateChange(buttons, [
			{btnFloorDelete: [false, true]},
			{btnEdit: [false, true]},
			{btnSave: [true, false]},
			{btnExit: [false, false]},
			{btnCancel: [false, false]},
			{btnZoneCreate: [false, false]},
			{btnZoneDelete: [true, false]}
		]);
		mapContent.removeClass('editable');
		mapView.dataSource.filter([]);
		mapView.cancel();
		mapDropDownListElem.trigger('change');
	};

	/**
	 *	<ul>
	 *		<li>mapView의 zoneDataSource를 zoneListEdit에 복사(deep-copy)</li>
	 *	</ul>
	 *	@function setZoneListEditDataSource
	 *	@returns {Object} 없음
	 */
	var setZoneListEditDataSource = function () {
		var i, data = deepCopyArray(mapView.zoneDataSource.data());
		for(i = 0; i < data.length; i++) {
			data[i].checked = data[i].selected;		//맵뷰의 selected 속성을 grid의 checked 속성과 연결
		}
		zoneListEdit.setDataSource(new kendo.data.DataSource({
			data: data,
			sort: {field: 'sortOrder', dir: 'asc'}
		}));
		buttonDisabled();
	};

	/**
	 *	<ul>
	 *		<li>데이터 편집 후 저장/나가기/취소버튼 상태 변경 및 zoneList 갱신</li>
	 *	</ul>
	 *	@function editButtonsState
	 *	@param {boolean} isZoneListRefresh - zoneList dataSource 갱신 여부
	 *	@returns {Object} 없음
	 */
	var editButtonsState = function (isZoneListRefresh) {
		if(isZoneListRefresh) setZoneListEditDataSource();
		buttonStateChange(buttons, [
			{btnSave: [false, true]},
			{btnCancel: [false, true]},
			{btnExit: [false, false]}
		]);
	};

	return {
		init : init
	};


});

//# sourceURL=controlareasettings/specific-floor.js
