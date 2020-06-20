/**
 *
 *   <ul>
 *       <li>all-floor에 관련된 view 모델 설정 작업</li>
 *   </ul>
 *   @module app/controlareasettings/building/all-floor
 *   @param {Object} CoreModule - 에너지 core 객체
 *   @param {Object} Common - space Common 객체
 *   @param {Object} Widget - space Widget 객체
 *   @param {Object} ViewModel - space ViewModel 객체
 *   @param {Object} API - space API 객체
 *   @requires app/controlareasettings/core
 *   @requires app/controlareasettings/building/config/space-common
 *   @requires app/controlareasettings/building/config/space-widget
 *   @requires app/controlareasettings/building/config/space-vm
 *   @requires app/controlareasettings/building/config/space-api
 *   @returns {Object} 없음
 */
define("controlareasettings/building/all-floor", ["controlareasettings/core", "controlareasettings/building/config/space-common",
	"controlareasettings/building/config/space-widget", 'controlareasettings/building/config/space-vm', 'controlareasettings/building/config/space-api'], function(CoreModule, Common, Widget, ViewModel,API){
	"use strict";

	var kendo = window.kendo, I18N = window.I18N, Util = window.Util;
	var MainWindow = window.MAIN_WINDOW;
	var MSG = Common.MESSAGE, TEXT = Common.TEXT;
	var Loading = Widget.Loading, confirmDialog = Widget.confirmDialog, msgDialog = Widget.messagDialog;
	var deepCopyArray = Common.deepCopyArray, getFloorName = Common.getFloorName;
	var buildingData, buildingId, lowestFloor, highestFloor;

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
		width: {
			validator: null,
			element: null
		},
		length: {
			validator: null,
			element: null
		},
		validate: function () {
			var self = this;
			if (self.name.validator === null || self.description.validator === null || self.width.validator === null || self.length.validator === null) {
				return false;
			}
			return self.name.validator && self.description.validator && self.width.validator && self.length.validator;
		}
	};
	var columnsIndex = {
		ID: 0,
		NAME: 1,
		DESCRIPTION: 2,
		NUMBER_OF_ZONES: 3,
		WIDTH: 4,
		LENGTH: 5,
		IMAGE: 6
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
	 *   space all floor 페이지 진입시 기본 셋팅을 해주는 함수
	 *
	 *   @function init
	 *   @param {Object} initArg - 현재 층 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var init = function(initArg){
		buildingData = initArg.building;
		buildingId = buildingData.id;
		lowestFloor = getFloorName(buildingData.lowestFloor && buildingData.lowestFloor.foundation_space_floors_type || '', buildingData.lowestFloor && buildingData.lowestFloor.foundation_space_floors_name || '');
		highestFloor = getFloorName(buildingData.highestFloor && buildingData.highestFloor.foundation_space_floors_type || '', buildingData.highestFloor && buildingData.highestFloor.foundation_space_floors_name || '');

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
	 *		<li>buildingId에 해당하는 빌딩의 floor 정보를 요청 후 화면에 출력</li>
	 *	</ul>
	 *	@function getData
	 *	@param {boolean} isUpdateFNB - 층 네비게이션 업데이트 여부
	 *	@returns {Object} 없음
	 */
	var getData = function (isUpdateFNB) {
		Loading.open();
		API.spaceFloorsGET({foundation_space_buildings_id: [buildingId]}).done(function (data) {
			if(isUpdateFNB) MainWindow.refreshFloorList();
			mainGrid.setDataSource(new kendo.data.DataSource({
				data: data,
				sort: {field: 'sortOrder', dir: 'asc'},
				aggregate: [
					{field: 'indexes.numberOfZones', aggregate: 'sum'}
				]
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
				field: 'id',
				title: TEXT.NAME,
				width: 200,
				template: '',
				footerTemplate: buildingData.name || buildingData.value
			},
			{
				field: 'name',
				title: TEXT.FLOOR,
				width: 250,
				template: function (data) {
					return getFloorName(data.type, data.name);
				},
				footerTemplate: function () {
					if(lowestFloor && highestFloor) return lowestFloor + ' ~ ' + highestFloor;
					return '-';
				}
			},
			{
				field: 'description',
				title: TEXT.DESCRIPTION,
				footerTemplate: buildingData.description
			},
			{
				field: 'indexes',
				title: TEXT.ZONE_NUM,
				width: 100,
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
			},
			{
				field: 'width',
				title: TEXT.SPACE_FLOOR_WIDTH,
				width: 100,
				footerTemplate: '-'
			},
			{
				field: 'length',
				title: TEXT.SPACE_FLOOR_HEIGHT,
				width: 100,
				footerTemplate: '-'
			},
			{
				field: 'imageFileName',
				title: TEXT.MAP_IMAGE,
				width: 240,
				footerTemplate: '-'
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
			var template = '<input class="floor-type-select" data-id="' + data.id + '" data-key="type" value="' + data.type + '">';
			template += '<input class="k-input floor-name-input" data-id="' + data.id + '" data-key="name" value="' + data.name + '">';
			return template;
		};
		columns[columnsIndex.DESCRIPTION].template = function (data) {
			return '<input class="k-input" data-id="' + data.id + '" data-key="description" value="' + data.description + '">';
		};
		columns[columnsIndex.WIDTH].template = function (data) {
			return '<input class="k-input floor-width-input" data-id="' + data.id + '" data-key="width" value="' + data.width + '">';
		};
		columns[columnsIndex.LENGTH].template = function (data) {
			return '<input class="k-input floor-length-input" data-id="' + data.id + '" data-key="length" value="' + data.length + '">';
		};
		columns[columnsIndex.IMAGE].template = function (data) {
			var td = $('<td/>');
			var wrapperSpan = $('<span/>').addClass('floor-image').attr('data-id', data.id).attr('data-key', 'imageFileName');
			if(data.imageFileName) wrapperSpan.addClass('has-image-file');
			var template = '<span class="floor-image-filename image-file">' + data.imageFileName + '</span>';
			template += '<input class="floor-image-input" type="file" accept=".gif, .jpg, .png, .dwg, .jpeg">';
			template += '<button class="floor-image-delete-btn image-file"></button>';
			template += '<button class="floor-image-upload-btn k-button no-image-file">' + MSG.UPLOAD_TEXT_BTN + '</button>';
			td.append(wrapperSpan.html(template));
			return td.html();
		};
		return columns;
	};

	/**
	 *
	 *   checkbox 체크에 따른 버튼 dim 함수
	 *
	 *   @function buttonDisabled
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var buttonDisabled = function(){
		var checkboxLine = editGridElem.find(".k-grid-content tr");
		var checkboxLineChecked = editGridElem.find(".k-grid-content .k-state-selected");

		var checkboxLength = checkboxLine.length;
		var checkboxCheckedLength = checkboxLineChecked.length;

		var checkboxLastChecked = checkboxLineChecked.eq(checkboxCheckedLength - 1);
		buttonStateChange(buttons, [
			{btnAdd: [checkboxLength < 150 ? false : true, true]},						//층 추가 버튼 활성화
			{btnDelete: [checkboxCheckedLength > 0 ? false : true, true]},				//층 삭제 버튼 활성화
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
	 *   file 확장자 분리
	 *
	 *   @function getFileType
	 *   @param {String} filename - 파일 객체
	 *   @returns {String} 파일 이름
	 *   @alias 없음
	 *
	 */
	var getFileType = function (filename) {
		var parts = filename.split('.');
		return parts[parts.length - 1];
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

		//업로드 버튼 클릭 이벤트
		//file input에 트리거하여 file을 업로드
		editGridElem.on('click', '.floor-image-upload-btn', function(){
			$(this).siblings('.floor-image-input').trigger('click');
		});

		//file input 클릭 이벤트
		//직접 클릭이 발생하지 않고 다른 버튼을 통해 trigger 된다
		editGridElem.on('change', '.floor-image .floor-image-input', function(){
			var self = $(this);
			var elem = self.get(0);
			var wrapper = self.closest('.floor-image');
			var id = wrapper.data('id'), key = wrapper.data('key'), target = getEditDataById(id);
			var isImage = false;
			var fileName = elem && elem.files[0] && elem.files[0].name || '';
			var fileType = getFileType(fileName).toLowerCase();
			//\u4E00-\u9FD5 한자정규식 미포함, API호출 시 한자 포함되면 등록 불가
			//ㄱ-ㅎㅏ-ㅣ가-힣 한글정규식 미포함, API호출 시 한글 포함되면 등록 불가
			var nameRegExp = /^(?=.{1,255}$)([A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC_\-\s0-9\.]+)$/;

			//확장자가 지원하는 이미지인지 확인
			if(fileType === "gif" || fileType === "dwg" || fileType === "png" || fileType === "jpg" || fileType === "jpeg"){
				isImage = true;
			}
			//파일크기 2MB 이하, 지원하는 형식, 이름 정규식 체크
			if(elem.files[0].size < 2097152 && isImage && nameRegExp.test(fileName)){
				if(elem.files && elem.files[0]){
					target[key] = fileName;
					target.image = elem.files[0];
					//새로 생성된 층이 아니라면 API 호출을 위해 imageChanged, imageDeleted 값을 변경
					if(!target.created) {
						target.imageChanged = true;
						target.imageDeleted = false;
					}
					changedDataUpdate();
					editButtonsState(buttons);
				}
			}else{
				if(elem.files[0].size > 2097152){
					msgDialog.message(MSG.UPLOAD_IMAGE_FILE_SIZE_NOT);			//파일용량 초과
				}else if(!isImage){
					msgDialog.message(MSG.UPLOAD_IMAGE_FILE_TYPE_NOT);			//파일타입 에러
				}else {
					msgDialog.message(I18N.prop('COMMON_INVALID_VALUE'));		//파일이름 에러
				}
				msgDialog.open();
			}
		});

		//이미지 삭제 버튼 클릭 이벤트
		editGridElem.on("click", '.floor-image-delete-btn', function(){
			var self = $(this).closest('.floor-image');
			var id = self.data('id'), key = self.data('key'), target = getEditDataById(id);
			target[key] = void (0);
			//새로 생성된 층이 아니라면 API 호출을 위해 imageChanged, imageDeleted 값을 변경
			if(!target.created) {
				target.imageChanged = false;
				target.imageDeleted = true;
			}
			changedDataUpdate();
			editButtonsState(buttons);
		});

		//수정 버튼 클릭 이벤트
		buttons.btnEdit.set('click', function () {
			var listLength = mainGrid.dataSource.data().length;
			changeEditMode(true);
			if(listLength > 149){
				 buttonStateChange(buttons, [{btnAdd: [true, true]}]);
			 }
		});

		//추가 버튼 클릭 이벤트
		buttons.btnAdd.set('click', function () {
			var createdUid = kendo.guid();

			editData.push({
				id: createdUid,
				name: getNewFloorName(),
				type: 'F',
				foundation_space_buildings_id: buildingId,
				description: '',
				indexes: {numberOfZones: 0},
				created: true,
				width: 0,
				length: 0,
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
			var i = 0, length = editData.length, editItem = '';
			for(i = 0; i < length; i++) {
				editItem = editData[i].name;
				editData[i].name = $.trim(editItem);
			}
			changedDataUpdate();
			if(!validators.validate()) {
				return;
			}
			//층이름 중복 체크
			if(checkFloorsNameDuplicated()) {
				msgDialog.message(MSG.SPACE_MESSAGE_NOTI_EXIST_SAME_FLOOR_NAME);
				msgDialog.open();
				return;
			}
			var apis = [].concat(API.spaceFloorsPOST(getUpdatedEditData('created')), API.spaceFloorsPATCH(getUpdatedEditData('changed')), API.spaceFloorsDELETE(getUpdatedEditData('deleted')), API.spaceFloorsImagePOST(getUpdatedEditData('imageChanged')), API.spaceFloorsImageDELETE(getUpdatedEditData('imageDeleted')));

			Loading.open();
			//생성된 데이터, 변경된 데이터(이미지 제외), 삭제된 데이터(이미지 제외), 변경된 이미지, 삭제된 이미지의 API 호출을 다르게 한다
			$.when.apply(this, apis).done(function () {
				Loading.close();
				msgDialog.message(MSG.COMMON_MESSAGE_NOTI_SAVED);
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
			var checkedFloors = editGrid.getCheckedData();
			var length = checkedFloors.length;
			var msg;
			if(length > 1){
				msg = MSG.DELETE_MULTI_FLOOR_TEXT(length);
			}else{
				msg = MSG.DELETE_FLOOR_TEXT;
			}

			confirmDialog.setConfirmActions({
				yes : function(){
					var i, j, dataId, deleteIdx, target;
					for(i = 0; i < checkedFloors.length; i++) {
						dataId = checkedFloors[i].id;
						if(checkedFloors[i].created) {			//생성된 데이터 삭제는 처음부터 없던 데이터 취급
							deleteIdx = -1;
							for(j = 0; j < editData.length; j++) {
								if(editData[j].id === dataId) {
									deleteIdx = j;
									break;
								}
							}
							editData.splice(deleteIdx, 1);
						}else {			//기존 데이터 삭제시, 변경된 값은 무시
							target = getEditDataById(dataId);
							target.changed = false;
							target.imageChanged = false;
							target.imageDeleted = false;
							target.deleted = true;
						}
					}
					editButtonsState(buttons);
					editDataSortBySortOrder();
					editDataResetSortOrder();
					changedDataUpdate();
					buttonDisabled();
				}
			});

			confirmDialog.message(msg);
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

		/* Floor 순서 이동 버튼 */
		buttons.btnMoveTop.set('click', function() {
			floorMove('up', 0);
		});

		buttons.btnMoveUp.set('click', function() {
			var checkedBoxes = editGridElem.find('.k-checkbox:checked');
			var index = checkedBoxes.eq(0).closest('tr').index();
			index = index > 0 ? index - 1 : index;
			floorMove('up', index);
		});

		buttons.btnMoveDown.set('click', function() {
			var checkedBoxes = editGridElem.find('.k-checkbox:checked');
			var index = checkedBoxes.eq(checkedBoxes.length - 1).closest('tr').index();
			index = index < editGrid.dataSource.view().length - 1 ? index + 1 : index;
			floorMove('down', index);
		});

		buttons.btnMoveBottom.set('click', function() {
			floorMove('down', editGrid.dataSource.view().length - 1);
		});

		/**
		 *	<ul>
		 *		<li>층 리스트 순서 변경 시 호출되는 함수</li>
		 *		<li>새로 생성된 데이터가 아니고, sortOrder가 변경될 경우 변경된 데이터에 추가</li>
		 *	</ul>
		 *	@function floorMove
		 *	@param {String} type - 이동 타입 ['up', 'down']
		 *	@param {number} index - 이동할 위치(Array index)
		 *	@returns {Object} 없음
		 */
		var floorMove = function (type, index) {
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
				scrollTop = scrollTop > 71 * index ? 71 * index : scrollTop;
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
				scrollTop = scrollTop < 71 * (index + 1) - gridWrapper.height() ? 71 * (index + 1) - gridWrapper.height() : scrollTop;
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
			var validOption = {
				messages: {
					invalidValue: I18N.prop('COMMON_INVALID_VALUE'),
					invalidMin: I18N.prop('COMMON_INVALID_MIN', 0)
				},
				rules: {
					invalidValue: function (input) {
						var val = input.val();
						if(isNaN(Number(val))) {
							return false;
						}
						return true;
					},
					invalidMin: function (input) {
						var val = input.val();
						if(!isNaN(Number(val)) && val < 0) {
							return false;
						}
						return true;
					}
				}
			};
			editGridElem.find('.floor-type-select').each(function () {
				var self = $(this);
				var value = self.val();
				if(value === 'undefined' || value === '') {
					value = null;
				}
				self.kendoDropDownList({
					value: value,
					dataValueField: 'value',
					dataTextField: 'text',
					width: 80,
					dataSource: [
						{value: 'F', text: 'F'},
						{value: 'B', text: 'B'},
						{value: 'None', text: 'None'}
					],
					change: function (e) {
						var element = e.sender.element;
						var val = e.sender.value();
						var id = element.data('id'), key = element.data('key'), target = getEditDataById(id);

						target[key] = val;
						if(!target.created) target.changed = true;

						editButtonsState(buttons);
					}
				});
			});
			validators.name.element = editGridElem.find('.k-input[data-key="name"]').kendoCommonValidator({
				messages: {
					cannotInputMore: MSG.TEXT_LENGTH_LONG,
					noEmptyName: MSG.SPACE_SAVE_FLOOR_NAME_NOT
				},
				rules: {
					cannotInputMore: function (input) {
						var val = input.val();
						if(val.length > 3) {
							return false;
						}
						return true;
					},
					noEmptyName: function (input) {
						var val = input.val();
						if(val.length === 0) {
							return false;
						}
						return true;
					}
				}
			});
			validators.name.validator = validAllElement('name');
			validators.description.element = editGridElem.find('.k-input[data-key="description"]').kendoCommonValidator({type: 'description'});
			validators.description.validator = validAllElement('description');
			validators.width.element = editGridElem.find('.k-input[data-key="width"]').kendoCommonValidator(validOption);
			validators.width.validator = validAllElement('width');
			validators.length.element = editGridElem.find('.k-input[data-key="length"]').kendoCommonValidator(validOption);
			validators.length.validator = validAllElement('length');
		});

		//grid dataBinding 이벤트
		//footerTemplate에 표시될 층 변경을 위해 콜백함수 등록
		mainGrid.bind('dataBinding', setLowestAndHighestFloorWhenGridDataBinding);
		editGrid.bind('dataBinding', setLowestAndHighestFloorWhenGridDataBinding);
	};

	/**
	 *	<ul>
	 *		<li>footerTemplate에 표시될 층 적용을 하기 위한 콜백함수</li>
	 *	</ul>
	 *	@function setLowestAndHighestFloorWhenGridDataBinding
	 *	@param {Event} e - dataBinding시 전달되는 인자
	 *	@returns {Object} 없음
	 */
	var setLowestAndHighestFloorWhenGridDataBinding = function (e) {
		var self = e.sender;
		var viewData = self.dataSource.view();
		var endIndex = viewData.length - 1 > 0 ? viewData.length - 1 : 0;
		if(viewData.length > 0) {
			lowestFloor = getFloorName(viewData[endIndex].type, viewData[endIndex].name);
			highestFloor = getFloorName(viewData[0].type, viewData[0].name);
		} else {
			lowestFloor = '';
			highestFloor = '';
		}
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
	 *		<li>층이름 중복 체크</li>
	 *	</ul>
	 *	@function checkFloorsNameDuplicated
	 *	@returns {boolean} 중복 여부
	 */
	var checkFloorsNameDuplicated = function () {
		var i, j;
		var viewData = editGrid.dataSource.view();

		for(i = 0; i < viewData.length; i++) {
			for(j = i + 1; j < viewData.length; j++) {
				if(getFloorName(viewData[i].type, viewData[i].name) === getFloorName(viewData[j].type, viewData[j].name)) return true;
			}
		}

		return false;
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
			data: deepCopyArray(editData),
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
	 *		<li>새 층 이름 반환 함수([F]#)</li>
	 *	</ul>
	 *	@function getNewFloorName
	 *	@returns {String} 새 층 이름
	 */
	var getNewFloorName = function () {
		var tmp, number, name, type, i, max = editData.length;
		var maxNum = 0;
		for(i = 0; i < max; i++) {
			tmp = editData[i];
			if(tmp.deleted) continue;
			name = tmp.name;
			type = tmp.type;
			if(name && type === 'F') {
				number = Number(name);
				if(!isNaN(number) && maxNum < number) {
					maxNum = number;
				}
			}
		}
		return (maxNum + 1);
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
			editData = deepCopyArray(mainGrid.dataSource.data());
			if(editData.length > 0) editDataSortBySortOrder();
			changedDataUpdate();
		}else{
			spaceBodyElem.removeClass('editable');
			setLowestAndHighestFloorWhenGridDataBinding({sender: mainGrid});
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
	 *	@param {String} type - 데이터 타입[created, changed, deleted, imageChanged, imageDeleted]
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

//# sourceURL=controlareasettings/all-floor.js
