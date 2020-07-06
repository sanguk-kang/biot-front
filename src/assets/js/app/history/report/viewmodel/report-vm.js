define("history/report/viewmodel/report-vm", ["history/report/model/report-model"], function(ReportModel){
	var kendo = window.kendo;
	var I18N = window.I18N;
	var Util = window.Util;
	var Model = ReportModel;
	var moment = window.moment;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	var MainViewModel = kendo.observable({
		topSearch : [
			{
				type : "textinput",
				id : "search-input-text",
				class : 'report-top-search',
				disabled : false,
				isEnabled : true,
				keyPressEnterEvt:searchReportGrid
			}
		],
		topMenu : [
			{
				type : "dropdownlist",
				id : "top-menu-kind-dropdownlist",
				class : 'report-top-menu',
				disabled : false,
				isEnabled : true,
				ddlDs: new kendo.data.DataSource({
					schema: {
						model: {
							fields: {
								Value: { type: "string" },
								Title: { type: "string" }
							}
						}
					},
					data: [
						{Value:I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_NORMAL'),Title:I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_NORMAL')},
						{Value:I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_TEMPLATE'),Title:I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_TEMPLATE')}
					]
				}),
				options : {
					dataTextField: 'Title',
					dataValueField: 'Value',
					optionLabel: I18N.prop('REPORT_REPORT_SELECTALL'),
					// 명세를 확인후 dropdownchecklist 대신 드랍다운리스트가 더 맞다고 생각하여 변경후 아래 문은 수정 예비 추후 삭제요망
					// selectAllText: I18N.prop('REPORT_REPORT_SELECTALL'),
					// optionsLabel: false,
					// cancelOptions: true,
					// applyBox: true,
					change :changeGridFilter
				}
			},
			{
				type : "button",
				id : "top-menu-delete-btn",
				class : 'report-top-menu',
				width: '120px',
				text : I18N.prop('REPORT_REPORT_DELETE_BTN'),
				invisible : false,
				isEnabled : false,
				options : {
					click : deleteBtnClick
				}
			},
			{
				type : "button",
				id : "top-menu-create-btn",
				class : 'report-top-menu',
				width: '120px',
				text : I18N.prop('REPORT_REPORT_CREATE_BTN'),
				invisible : false,
				isEnabled : true,
				options : {
					click : createBtnClick
				}
			}
		],
		contentGrid : [
			{
				type : "grid",
				id : "report-content-grid",
				class: '',
				height: $('#report-common-tab').height() - 130,
				columns: "[" +
					// 검색시 datasource 필터시 value가 아닌 text값으로 변경하는 기능이 켄도에서 미지원으로 판단 모델에서 변환하기로 수정 추후 확인후 삭제요망
					// "{ 'sortable': true, 'field': 'Kind',values: [" +
					// 	"{ 'text': '" + I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_NORMAL') + "', 'value': 'normal' }," +
					// 	"{ 'text': '" + I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_TEMPLATE') + "', 'value': 'template' }" +
					//   "], 'title': '" + I18N.prop("REPORT_REPORT_GRID_COLUMNS_KIND") + "'}," +
					"{ 'hidden': true, 'field': 'Id'}," +
					"{ 'sortable': true, 'field': 'type', 'title': '" + I18N.prop("REPORT_REPORT_GRID_COLUMNS_KIND") + "'}," +
					"{ 'sortable': true, 'field': 'name', width: 550, 'title': '" + I18N.prop("REPORT_REPORT_GRID_COLUMNS_TITLE") + "'}," +
					"{ 'sortable': true, 'field': 'duration', 'title': '" + I18N.prop("REPORT_REPORT_GRID_COLUMNS_TREM") + "'}," +
					"{ 'sortable': false, 'field': 'interval', 'title': '" + I18N.prop("REPORT_REPORT_GRID_COLUMNS_INTERVAL") + "'}," +
					"{ 'sortable': false, 'field': 'autoGeneration', width: 150, 'title': '" + I18N.prop("REPORT_REPORT_GRID_COLUMNS_AUTO_GENERATION") + "'}," +
					"{ 'sortable': false, 'field': 'dms_devices_type', 'title': '" + I18N.prop("REPORT_REPORT_GRID_COLUMNS_DEVICE_TYPE") + "'}," +
					"{ 'template': '<button class=k-button data-bind=events:{click:options.clickDownload}>"  + I18N.prop("REPORT_REPORT_GRID_COLUMNS_DOWNLOAD") + "</button>', 'sortable': false, 'field': 'download', 'title': '" + I18N.prop("REPORT_REPORT_GRID_COLUMNS_DOWNLOAD") + "' }," +
					"{ 'template': '<span class=grid-detail-btn data-bind=events:{click:options.clickDetail}></span>', 'sortable': false, 'field': 'detailInfo', 'title': '" + I18N.prop("REPORT_REPORT_POPUP_TITLE_INFO") + "' }" +
				"]",
				GriddataSource: new kendo.data.DataSource({
					schema: {
						model: {
							fields: {
								type: { type: "string" },
								title: { type: "string" },
								duration: { type: "string" },
								interval: { type: "string" },
								autoGeneration: { type: "string" },
								dms_devices_type: { type: "string" }
							}
						}
					}
				}),
				disabled : false,
				isEnabled : true,
				scrollable: true,
				groupable : false,
				sortable: true,
				filterable: false,
				pageable: false,
				//checkedLimit : 10         //전체 체크 박스 또는 그룹 체크 박스 동작 시, 최대 체크 되는 아이템의 개수를 설정
				//selectedLimit : 10        //전체 선택 동작(selectAll()) 시, 최대 체크 되는 아이템의 개수를 설정
				hasCheckedModel : true,     //checked 프로퍼티를 통하여 Model에 Checkbox 상태를 유지하도록 하게 함.
				setCheckedAttribute : true,  //데이터가 checked 프로퍼티를 갖게 함. (이미 존재할 경우 true로 하지 않아도 됨)
				//hasRadioModel : true,      //checked 프로퍼티를 통하여 Model에 Radio 버튼 상태를 유지하도록 하게 함.
				options : {
					clickDownload : clickGridBtnDownload,
					clickDetail : clickGridBtnDetail
				}
			}
		]
	});

	var PopupViewModel = kendo.observable({
		popupMainCotent : {
			id:'',
			Header : {
				class : "popup-reportkind-Element",
				oldValue:'',
				value: '',
				text: '',
				oldText: '',
				enabled: false,
				isEnabled: true,
				ddlDs: new kendo.data.DataSource({
					schema: {
						model: {
							fields: {
								value: { type: "string" },
								text: { type: "string" }
							}
						}
					},
					data: [
						{value:'General',text:I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_NORMAL')},
						{value:'Template',text:I18N.prop('REPORT_REPORT_DROPDOWNLIST_VALUE_TEMPLATE')}
					]
				})
			},
			Main : {
				name:{
					value:'',
					oldValue:'',
					change:function(e){
						saveConfrimValidator();
					}
				},
				file:{
					value:'',
					oldValue:''
				},
				duration:{
					oldValue:'',
					value: '',
					text: '',
					oldText: '',
					isEnabled: true,
					ddlDs: new kendo.data.DataSource({
						schema: {
							model: {
								fields: {
									value: { type: "string" },
									text: { type: "string" }
								}
							}
						},
						data: [
							{value:'Day',text:I18N.prop('REPORT_REPORT_DAY')},
							{value:'Week',text:I18N.prop('REPORT_REPORT_WEEK')},
							{value:'Month',text:I18N.prop('REPORT_REPORT_MONTH')},
							{value:'Custom',text:I18N.prop('REPORT_REPORT_CUSTOM')}
						]
					}),
					change:function(e){
						var selectValue = e.sender.value();
						if(selectValue === 'Custom'){
							PopupViewModel.popupMain.set('dateCustomMode',true);
							autoCreateReportDisabledFunc(true);
						}else{
							autoCreateReportDisabledFunc(false);
							PopupViewModel.popupMain.set('dateCustomMode',false);
							var settingDate = Model.durationSetDataProcessing(selectValue);
							var mainData = PopupViewModel.popupMainCotent.Main;
							mainData.startDate.set('value',settingDate.startDate);
							mainData.startTime.set('value',settingDate.startDate);
							mainData.endDate.set('value',settingDate.endDate);
							mainData.endTime.set('value',settingDate.endDate);
							intervalSetData(selectValue,{startDate: settingDate.startDate,endDate: settingDate.endDate});
						}
						saveConfrimValidator();
					}
				},
				dmsType:{
					prevValue:'',
					oldValue:'',
					value: '',
					text: '',
					oldText: '',
					isEnabled: true,
					ddlDs: new kendo.data.DataSource({
						schema: {
							model: {
								fields: {
									value: { type: "string" },
									text: { type: "string" }
								}
							}
						},
						data: [
							{value:'AirConditioner',text:Util.getDetailDisplayTypeDeviceI18N('AirConditioner.Indoor')},
							{value:'AirConditionerOutdoor',text:Util.getDetailDisplayTypeDeviceI18N('AirConditionerOutdoor')},
							{value:'ControlPoint',text:Util.getDetailDisplayTypeDeviceI18N('ControlPoint')},
							{value:'Light',text:Util.getDetailDisplayTypeDeviceI18N('Light')},
							{value:'Meter',text:Util.getDetailDisplayTypeDeviceI18N('Meter')},
							{value:'Sensor',text:Util.getDetailDisplayTypeDeviceI18N('Sensor')}
							// {value:'Sensor.Humidity',text:Util.getDetailDisplayTypeDeviceI18N('Sensor.Humidity')},
							// {value:'Sensor.Temperature_Humidity',text:Util.getDetailDisplayTypeDeviceI18N('Sensor.Temperature_Humidity')},
							// {value:'Sensor.Motion',text:Util.getDetailDisplayTypeDeviceI18N('Sensor.Motion')}
						]
					}),
					change: function(e){
						if(this.popupMainCotent.Main.dmsType.get('value') !== ""){
							if(this.popupMain.createMode){
								popupDmsTypeYes();
							}else{
								$('#popup-dmstype-confrim').data('kendoCommonDialog').open();
							}
						}
					}
				},
				dmsGrid:{
					id:'popup-main-grid',
					oldValue:'',
					type: 'commongrouplist',
					gridDs: '',
					oldDs: '',
					selectedData: null,
					oldSelectedData: null,
					columns: [
						{title: '빌딩 건물', field: 'foundation_space_buildings_id'},
						{title: '빌딩 층', field: 'foundation_space_floors_id'},
						{title: '기기 이름', field: 'dms_devices_name'},
						{title: '기기 속성값', field: 'dms_reports_view_properties'}
					]
				},
				startDate:{
					value: new Date(),
					oldValue: new Date(),
					prevValue: new Date(),
					change:function(e){
						startDateEndDateSet('startDate',e.sender.value());
						saveConfrimValidator();
					}
				},
				endDate:{
					value: new Date(),
					oldValue: new Date(),
					prevValue: new Date(),
					change:function(e){
						startDateEndDateSet('endDate',e.sender.value());
						saveConfrimValidator();
					}
				},
				startTime:{
					value: new Date(),
					oldValue: new Date(),
					prevValue: new Date(),
					change:function(e){
						startDateEndDateSet('startTime',e.sender.value());
						saveConfrimValidator();
					}
				},
				endTime:{
					value: new Date(),
					oldValue: new Date(),
					prevValue: new Date(),
					change:function(e){
						startDateEndDateSet('endTime',e.sender.value());
						saveConfrimValidator();
					}
				},
				interval:{
					value: '',
					oldValue: '',
					text: '',
					oldText: '',
					ddlDs: new kendo.data.DataSource({
						schema: {
							model: {
								fields: {
									value: { type: "string" },
									text: { type: "string" }
								}
							}
						},
						data: [
							{value:'Hourly',text:I18N.prop('REPORT_REPORT_HOURLY')},
							{value:'Daily',text:I18N.prop('REPORT_REPORT_DAILY')},
							{value:'Monthly',text:I18N.prop('REPORT_REPORT_MONTHLY')}
						]
					}),
					change: function(e){
						var mainData = PopupViewModel.popupMainCotent.Main;
						var selectValue;
						if(typeof e.sender !== 'undefined'){
							selectValue = e.sender.value();
						}else{
							selectValue = e;
						}
						var intervalGridData = Model.popupIntervalGridDataProcessing(selectValue,mainData.startDate.get('value'),mainData.startTime.get('value'),mainData.endDate.get('value'),mainData.endTime.get('value'));
						mainData.intervalGrid.set('gridDs',intervalGridData);
						saveConfrimValidator();
					}
				},
				intervalGrid:{
					value: '',
					oldDs: '',
					text: '',
					gridDs: new kendo.data.DataSource({
						schema: {
							model: {
								fields: {
									value: { type: "string" },
									text: { type: "string" }
								}
							}
						}
					}),
					changeTextAlian: function(){
						if(PopupViewModel.popupMain.get('viewMode')){
							return "left";
						}
						return "center";
					}
				}
			},
			Footer : {
				autoGenerate:{
					value: false,
					oldValue: false,
					text: '',
					oldText: '',
					change:function(e){
						saveConfrimValidator();
					}
				},
				autoGenerateInterval:{
					value: '',
					oldValue: '',
					text: '',
					oldText: '',
					isEnabled: true,
					ddlDs: new kendo.data.DataSource({
						schema: {
							model: {
								fields: {
									value: { type: "string" },
									text: { type: "string" }
								}
							}
						},
						data: [
							{value:'Daily',text:I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_DAILY')},
							{value:'Weekly',text:I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_WEEKLY')},
							{value:'Monthly',text:I18N.prop('REPORT_REPORT_POPUP_AUTOGENDERATE_MONTHLY')}
						]
					}),
					change: generalIntervalDDLChange
				},
				autoGenerateTime:{
					value: '',
					oldValue: '',
					text: '',
					oldText: '',
					isEnabled: true,
					ddlDs: new kendo.data.DataSource({
						schema: {
							model: {
								fields: {
									value: { type: "string" },
									text: { type: "string" }
								}
							}
						},
						data: void 0
					}),
					change: function(){
						saveConfrimValidator();
					}
				}
			}
		},
		popupMain : {
			type : "MainPopup",
			id : "report-main-popup",
			reportTypeGeneral: true,
			oldReportTypeGeneral: true,
			isVisible: false,
			title : I18N.prop("REPORT_REPORT_POPUP_TITLE_DETAIL"),
			width: 1260,
			height: 800,
			editMode: true,
			viewMode: false,
			createMode: false,
			saveVailator: false,
			dateCustomMode: false,
			reportListBtnMode:true,
			autoCreateReportDisabled: false,
			fileName: '',
			oldFileName: '',
			oldFile: '',
			stateMode : '',
			actionArr: ['view','edit','create'],
			btnActionStatus: [true,true,false,false,false],		// edit,close,cancle,save,fileAdd
			btnViewEditMode: function(selectValue){
				if(selectValue === this.actionArr[0]){
					this.set('btnActionStatus[0]',true);
					this.set('btnActionStatus[1]',true);
					this.set('btnActionStatus[2]',false);
					this.set('btnActionStatus[3]',false);
					this.set('btnActionStatus[4]',false);
				}else if(selectValue === this.actionArr[1]){
					if(this.reportTypeGeneral){
						this.set('btnActionStatus[0]',false);
						this.set('btnActionStatus[1]',false);
						this.set('btnActionStatus[2]',true);
						this.set('btnActionStatus[3]',true);
						this.set('btnActionStatus[4]',false);
					}else{
						this.set('btnActionStatus[0]',false);
						this.set('btnActionStatus[1]',false);
						this.set('btnActionStatus[2]',true);
						this.set('btnActionStatus[3]',true);
						this.set('btnActionStatus[4]',true);
					}
				}else if(selectValue === this.actionArr[2]){
					if(this.reportTypeGeneral){
						this.set('btnActionStatus[0]',false);
						this.set('btnActionStatus[1]',true);
						this.set('btnActionStatus[2]',false);
						this.set('btnActionStatus[3]',true);
						this.set('btnActionStatus[4]',false);
					}else{
						this.set('btnActionStatus[0]',false);
						this.set('btnActionStatus[1]',true);
						this.set('btnActionStatus[2]',false);
						this.set('btnActionStatus[3]',true);
						this.set('btnActionStatus[4]',true);
					}
				}
			},
			titleTextChange: function(){
				if(this.get('stateMode') === this.actionArr[0]){
					this.set('title',I18N.prop("REPORT_REPORT_POPUP_TITLE_DETAIL"));
				}else if(this.get('stateMode') === this.actionArr[1]){
					this.set('title',I18N.prop("REPORT_REPORT_POPUP_TITLE_EDIT"));
				}else if(this.get('stateMode') === this.actionArr[2]){
					this.set('title',I18N.prop("REPORT_REPORT_POPUP_TITLE_CREATE"));
				}
			},
			headerTemplateHeight: function(){
				if(this.get('viewMode')){
					return "61px";
				}
				if(PopupViewModel.popupMainCotent.Header.get('value') === 'Template'){
					return "61px";
				}
				return "136px";
			},
			containTemplateHeight: function(){
				if(this.get('viewMode')){
					return "570px";
				}
				return "570px";
			},
			reportTypeChangeEvt: function(e){
				if(e.sender.value() === 'General'){
					this.popupMain.set('reportTypeGeneral', true);
					this.popupMain.btnViewEditMode(this.popupMain.stateMode);
					autoCreateReportDisabledFunc(false);
				}else if(e.sender.value() === 'Template'){
					grouplistEditScrollReset();

					this.popupMain.set('reportTypeGeneral', false);
					this.popupMain.btnViewEditMode(this.popupMain.stateMode);
					autoCreateReportDisabledFunc(true);
				}
			},
			content : "" +
			"<div>" +
				"<div>" +
					"<div id='report-mainpopup-head'>" +
						"<span id='mainpopup-head-title' data-bind='text:popupMain.title'></span>" +
						"<span class='popup-close-btn' data-bind='events:{click:popupMain.closeEvt}'></span>" +
					"</div>" +
					"<div class='report-popup-line'>" +
					"</div>" +
				"</div>" +
				"<div id='type-general-report' data-bind='visible:popupMain.reportTypeGeneral'>" +
					"<div id='report-mainpopup-header'>" +
						"<div class='mainpopup-header-box'>" +
							"<div id='reporting-kind-content' class='align-middle'>" +
								"<div class='align-middle popupview-text-box' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Header.text, value:popupMainCotent.Header.value'></div>" +
								"<input id='report-type-ddl' data-role='dropdownlist' style='width: 178px;' data-text-field='text' data-value-field='value'  data-bind='visible:popupMain.editMode, enabled:popupMainCotent.Header.enabled, source:popupMainCotent.Header.ddlDs, value:popupMainCotent.Header.value, events: {change: popupMain.reportTypeChangeEvt}'></input>" +
							"</div>" +
						"</div>" +
						"<div class='mainpopup-header-box'>" +
							"<div>" +
								"<div class='align-middle popup-name-text' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Main.name.value'></div>" +
							"</div>" +
							"<div data-bind='visible:popupMain.editMode'>" +
								"<div class='align-middle' style='line-height: 0px;'><input id='popup-title-input' class='k-input' type='text' placeholder='" + I18N.prop('REPORT_REPORT_ENTER_REPORT_TITLE_PLACEHORDER') + "' data-bind='events: { change: popupMainCotent.Main.name.change }, visible:popupMain.editMode, readonly:popupMain.viewMode, value:popupMainCotent.Main.name.value'></input></div>" +
							"</div>" +
						"</div>" +
						"<div class='mainpopup-header-box'>" +
							"<div id='reporting-duration-content' class='align-middle'>" +
								"<div class='align-middle popupview-text-box' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Main.duration.text, value:popupMainCotent.Main.duration.value'></div>" +
								"<input class='align-middle' id='duration-dropdownlist' data-role='dropdownlist' style='width: 178px;' data-text-field='text' data-value-field='value' data-bind='visible:popupMain.editMode, source:popupMainCotent.Main.duration.ddlDs, events: { change: popupMainCotent.Main.duration.change }, value: popupMainCotent.Main.duration.value'></input>" +
							"</div>" +
						"</div>" +
						"<div class='mainpopup-header-box'>" +
							"<div class='type-devices-content align-middle'>" +
								"<div class='align-middle popupview-text-box' id='dms-devices-type-button' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Main.dmsType.text, value: popupMainCotent.Main.dmsType.value'></div>" +
								"<input id='dms-devices-type-dropdownlist' data-role='dropdownlist' style='width: 178px;' data-text-field='text' data-value-field='value' data-bind='visible:popupMain.editMode, source:popupMainCotent.Main.dmsType.ddlDs, value: popupMainCotent.Main.dmsType.value, events: { change: popupMainCotent.Main.dmsType.change}'></input>" +
							"</div>" +
							"<div class='type-date-content align-middle'>" +
								"<input class='popup-date-picker' data-role='commondatepicker' data-bind='enabled:popupMain.dateCustomMode, value: popupMainCotent.Main.startDate.value, events: { change: popupMainCotent.Main.startDate.change }'></input>" +
								"<input class='popup-time-picker' data-role='commontimepicker' data-bind='enabled:popupMain.dateCustomMode, value: popupMainCotent.Main.startTime.value, events: { change: popupMainCotent.Main.startTime.change }'></input>" +
								"<span style='margin: 0px 5px 0px 5px'> ~ </span>" +
								"<input class='popup-date-picker' data-role='commondatepicker' data-bind='enabled:popupMain.dateCustomMode, value: popupMainCotent.Main.endDate.value, events: { change: popupMainCotent.Main.endDate.change }'></input>" +
								"<input class='popup-time-picker' data-role='commontimepicker' data-bind='enabled:popupMain.dateCustomMode, value: popupMainCotent.Main.endTime.value, events: { change: popupMainCotent.Main.endTime.change }'></input>" +
							"</div>" +
						"</div>" +
					"</div>" +
					"<div id=report-mainpopup-contain>" +
						"<div id='report-mainpopup-gridcontent'>" +
							"<div class='contain-left-box' data-bind='visible:popupMain.viewMode'>" +
								"<div class='contain-align-middle'>" +
									"<div id='interval-type-text' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Main.interval.text,  value: popupMainCotent.Main.interval.value'></div>" +
								"</div>" +
							"</div>" +

							"<div class='contain-right-box' data-bind='visible:popupMain.viewMode'>" +
								"<div class='contain-align-middle'>" +
									"<div id='group-list-title' >" + I18N.prop("REPORT_REPORT_POPUP_GROUPLIST_TITLE_ASSIGNED_ITEM") + "</div>" +
								"</div>" +
							"</div>" +
							"<div class='contain-left-box'>" +
								"<div class='contain-align-middle'>" +
									"<div><input id='report-interval-ddl' class='k-widget k-dropdown k-header' data-role='dropdownlist' style='width: 178px;' data-text-field='text' data-value-field='value'  data-bind='visible:popupMain.editMode, source:popupMainCotent.Main.interval.ddlDs, value: popupMainCotent.Main.interval.value, events:{change:popupMainCotent.Main.interval.change}'></input></div>" +
								"</div>" +
								"<div class='contain-align-middle'>" +
									"<div id='interval-listview' data-role='listview' data-template='listTemplate' data-bind='source:popupMainCotent.Main.intervalGrid.gridDs' style='height: 300px;'></div>" +
								"</div>" +
							"</div>" +
							"<div class='contain-right-box'>" +
								"<div class='contain-align-middle'>" +
									"<div id='report-group-list'></div>" +
								"</div>" +
							"</div>" +
						"</div>" +
					"</div>" +
					"<div id='report-mainpopup-footer'>" +
						"<div id='auto-report-content'>" +
							"<div class='autoGenerate-checkbox-box'>" +
								"<input id='autoGenerate-checkbox' class='k-checkbox' type='checkbox' data-bind='events: {change:popupMainCotent.Footer.autoGenerate.change}, disabled:autoCreateReportDisabled, visible:popupMain.editMode, checked: popupMainCotent.Footer.autoGenerate.value'></input> <label for='autoGenerate-checkbox' class='k-checkbox-label' data-bind='visible:popupMain.editMode, disabled:autoCreateReportDisabled '><span display=''></span></label> <span class='autoGenerate-checkbox-text' data-bind='visible:popupMain.editMode, disabled:autoCreateReportDisabled'>"  + I18N.prop('REPORT_REPORT_POPUP_AUTO_CREATE_TITLE') + "</span>" +
								"<span class='autoGenerate-text-title' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Footer.autoGenerate.text'></span>" +
							"</div>" +
							"<div class='schedule-view-box' data-bind='visible:popupMain.viewMode'>" +
								"<div class='schedule-interval'>" +
									"<div class='popupview-text-box' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Footer.autoGenerateInterval.text', value: popupMainCotent.Footer.autoGenerateInterval.value></div>" +
								"</div>" +
								"<div class='schedule-time'>" +
									"<div class='popupview-text-box' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Footer.autoGenerateTime.text, value: popupMainCotent.Footer.autoGenerateTime.value'></div>" +
								"</div>" +
								"<div>" +
									"<button class='report-list-btn popupview-text-box' data-role='button' data-bind='events:{click:popupMain.reportListEvt}, enabled: popupMain.reportListBtnMode' style='line-height:0px'>"  + I18N.prop('REPORT_REPORT_LIST') + "</button>" +
								"</div>" +
							"</div>" +
							"<div class='schedule-edit-box' data-bind='visible:popupMain.editMode'>" +
								"<div class='schedule-interval'>" +
									"<input id='general-schedule-interval-dropdownlist' style='width: 178px;' data-role='dropdownlist' data-option-label='" + I18N.prop('REPORT_REPORT_GENERATION_INTERVAL') + "' data-text-field='text' data-value-field='value' data-bind='enabled: popupMainCotent.Footer.autoGenerate.value, visible:popupMain.editMode, source:popupMainCotent.Footer.autoGenerateInterval.ddlDs, events:{change:popupMainCotent.Footer.autoGenerateInterval.change}, value: popupMainCotent.Footer.autoGenerateInterval.value'></input>" +
								"</div>" +
								"<div class='schedule-time'>" +
									"<input id='general-schedule-time-dropdownlist' style='width: 178px;' data-role='dropdownlist' data-option-label='" + I18N.prop('REPORT_REPORT_GENERATION_POINT') + "' data-text-field='text' data-value-field='value' data-bind='events: {change:popupMainCotent.Footer.autoGenerateTime.change}, enabled: popupMainCotent.Footer.autoGenerate.value, visible:popupMain.editMode, source:popupMainCotent.Footer.autoGenerateTime.ddlDs, value: popupMainCotent.Footer.autoGenerateTime.value'></input>" +
								"</div>" +
								"<div>" +
									"<button class='report-list-btn' data-role='button' data-bind='events:{click:popupMain.reportListEvt}, enabled: popupMain.reportListBtnMode'>"  + I18N.prop('REPORT_REPORT_LIST') + "</button>" +
								"</div>" +
							"</div>" +
						"</div>" +
						"<div id='action-button-cotent'>" +
							"<button data-role='button' class='action-button-edit' value='edit' data-bind='events:{click:popupMain.editViewChange}, visible:popupMain.btnActionStatus[0]'>"  + I18N.prop('REPORT_REPORT_POPUP_EDIT') + "</button>" +
							"<button data-role='button' class='action-button-close' data-bind='events:{click:popupMain.closeEvt}, visible:popupMain.btnActionStatus[1]'>"  + I18N.prop('REPORT_REPORT_POPUP_CLOSE') + "</button>" +
							"<button data-role='button' class='action-button-cancle' value='view' data-bind='events:{click:popupMain.editViewChange}, visible:popupMain.btnActionStatus[2]'>"  + I18N.prop('REPORT_REPORT_POPUP_CANCLE') + "</button>" +
							"<button data-role='button' class='action-button-save' data-bind='enabled:popupMain.saveVailator, visible:popupMain.btnActionStatus[3], events:{click:popupMain.saveEvt}'>"  + I18N.prop('COMMON_BTN_SAVE') + "</button>" +
						"</div>" +
					"</div>" +
				"</div>" +


				"<div id='type-template-report' data-bind='invisible:popupMain.reportTypeGeneral'>" +
					"<div id='report-mainpopup-header' class='template'>" +
						"<div class='mainpopup-header-box'>" +
							"<div>" +
								"<div class='header-left-box'>" +
									"<div class='align-middle' >" +
										"<div class='popupview-text-box' style='width: 170px;' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Header.text, value:popupMainCotent.Header.value'></div>" +
										"<input data-role='dropdownlist' style='width: 170px;' data-text-field='text' data-value-field='value' data-bind='visible:popupMain.editMode, enabled:popupMainCotent.Header.enabled, source:popupMainCotent.Header.ddlDs, value:popupMainCotent.Header.value, events: {change: popupMain.reportTypeChangeEvt}'></input>" +
									"</div>" +
								"</div>" +
								"<div class='header-right-box'>" +
									"<div class='align-middle'><div class='header-template-name' data-bind='value:popupMainCotent.Main.name.value, text:popupMainCotent.Main.name.value, events:{click:popupMain.templateNameClickEvt, change:popupMainCotent.Main.name.change}'></div></div>" +
									"<form id='excel-file-frm'>" +
										"<input name='file' type='file' id='excel-file-input' accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' data-bind='events:{change:popupMain.fileChange}'/>" +
									"</form>" +
								"</div>" +
							"</div>" +
						"</div>" +
					"</div>" +
					"<div id=report-mainpopup-contain class='mainpopup-template-contain' data-bind='style: {height: popupMain.containTemplateHeight}'>" +
						"<p>&ensp;</p>" +
						"<p class='contain-text' style='font-size: 20px;'>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT1') + "</p>" +
						"<p class='contain-text' style='font-size: 20px;'>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT2') + "</p>" +
						"<p>&ensp;</p>" +
						"<ul class='cotain-ul-style'>" +
							"<li>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT3') + "</li>" +
							"<li>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT4') + "</li>" +
							"<li>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT5') + "</li>" +
							"<li>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT6') + "</li>" +
							"<li>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT7') + "</li>" +
						"</ul>" +
						"<p>&ensp;</p>" +
						"<p class='contain-text notice-color'>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT8') + "</p>" +
						"<p class='contain-text notice-color'>" + I18N.prop('REPORT_REPORT_POPUP_TEMPLATE_CONTENT9') + "</p>" +
					"</div>" +
					"<div id='report-mainpopup-footer'>" +
						"<div id='auto-report-content'>" +
							"<div class='autoGenerate-checkbox-box'>" +
								"<input id='autoGenerate-checkbox' class='k-checkbox' type='checkbox' data-bind='events: {change:popupMainCotent.Footer.autoGenerate.change}, disabled:autoCreateReportDisabled, visible:popupMain.editMode, checked: popupMainCotent.Footer.autoGenerate.value'></input> <label for='autoGenerate-checkbox' class='k-checkbox-label' data-bind='visible:popupMain.editMode, disabled:autoCreateReportDisabled'><span display=''></span></label> <span class='autoGenerate-checkbox-text' data-bind='visible:popupMain.editMode, disabled:autoCreateReportDisabled'>"  + I18N.prop('REPORT_REPORT_POPUP_AUTO_CREATE_TITLE') + "</span>" +
								"<span class='autoGenerate-text-title' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Footer.autoGenerate.text'></span>" +
							"</div>" +
							"<div class='schedule-view-box' data-bind='visible:popupMain.viewMode'>" +
								"<div class='schedule-interval'>" +
									"<div class='popupview-text-box' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Footer.autoGenerateInterval.text', value: popupMainCotent.Footer.autoGenerateInterval.value></div>" +
								"</div>" +
								"<div class='schedule-time'>" +
									"<div class='popupview-text-box' data-bind='visible:popupMain.viewMode, text:popupMainCotent.Footer.autoGenerateTime.text, value: popupMainCotent.Footer.autoGenerateTime.value'></div>" +
								"</div>" +
								"<div>" +
									"<button class='report-list-btn popupview-text-box' data-role='button' data-bind='events:{click:popupMain.reportListEvt}, enabled: popupMain.reportListBtnMode' style='line-height:0px'>"  + I18N.prop('REPORT_REPORT_LIST') + "</button>" +
								"</div>" +
							"</div>" +
							"<div class='schedule-edit-box' data-bind='visible:popupMain.editMode'>" +
								"<div class='schedule-interval'>" +
									"<input id='template-schedule-interval-dropdownlist' style='width: 178px;' data-role='dropdownlist' data-option-label='" + I18N.prop('REPORT_REPORT_GENERATION_INTERVAL') + "' data-text-field='text' data-value-field='value' data-bind='enabled: popupMainCotent.Footer.autoGenerate.value, visible:popupMain.editMode, source:popupMainCotent.Footer.autoGenerateInterval.ddlDs, events:{change:popupMainCotent.Footer.autoGenerateInterval.change}, value: popupMainCotent.Footer.autoGenerateInterval.value'></input>" +
								"</div>" +
								"<div class='schedule-time'>" +
									"<input id='template-schedule-time-dropdownlist' style='width: 178px;' data-role='dropdownlist' data-option-label='" + I18N.prop('REPORT_REPORT_GENERATION_POINT') + "' data-text-field='text' data-value-field='value' data-bind='events: {change:popupMainCotent.Footer.autoGenerateTime.change}, enabled: popupMainCotent.Footer.autoGenerate.value, visible:popupMain.editMode, source:popupMainCotent.Footer.autoGenerateTime.ddlDs, value: popupMainCotent.Footer.autoGenerateTime.value'></input>" +
								"</div>" +
								"<div>" +
									"<button class='report-list-btn' data-role='button' data-bind='events:{click:popupMain.reportListEvt}, enabled: popupMain.reportListBtnMode'>"  + I18N.prop('REPORT_REPORT_LIST') + "</button>" +
								"</div>" +
							"</div>" +
						"</div>" +
						"<div id='action-button-cotent'>" +
							"<button data-role='button' class='action-button-edit' value='edit' data-bind='events:{click:popupMain.editViewChange}, visible:popupMain.btnActionStatus[0]'>"  + I18N.prop('REPORT_REPORT_POPUP_EDIT') + "</button>" +
							"<button data-role='button' class='action-button-close' data-bind='events:{click:popupMain.closeEvt}, visible:popupMain.btnActionStatus[1]'>"  + I18N.prop('REPORT_REPORT_POPUP_CLOSE') + "</button>" +
							"<button data-role='button' class='action-button-cancle' value='view' data-bind='events:{click:popupMain.editViewChange}, visible:popupMain.btnActionStatus[2]'>"  + I18N.prop('REPORT_REPORT_POPUP_CANCLE') + "</button>" +
							"<button data-role='button' class='action-button-save' data-bind='enabled:popupMain.saveVailator, visible:popupMain.btnActionStatus[3], events:{click:popupMain.saveEvt}'>"  + I18N.prop('COMMON_BTN_SAVE') + "</button>" +
							"<button data-role='button' class='action-button-fileadd' data-bind='visible:popupMain.btnActionStatus[4], events:{click:popupMain.fileClick}'>"  + I18N.prop('REPORT_REPORT_POPUP_FILE_ADD_BTN') + "</button>" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</div>",
			onOpen: function() {
			},
			onClose: function() {
				popupInit();		//초기화
				inputFileResetFunc();	// 파일 인풋 초기화
			},
			editViewChange: function(e){
				var selectValue = e.sender.element.val();
				if(selectValue === 'view'){
					popupValueDifference();
				}else{
					ModeChange(selectValue);
				}
			},
			closeEvt: function(e){
				popupMainClose();
			},
			saveEvt: function(e){
				popupMainSave(e,this.popupMain.get('stateMode'));
			},
			fileAddEvt: function(e){
				if(this.popupMain.stateMode === 'create'){
					$('#popup-excel-file').data('kendoDialog').open();
				}else if(this.popupMain.stateMode === 'edit'){
					$('#popup-file-change-confrim').data('kendoCommonDialog').open();
				}
			},
			reportListEvt: function(e){
				autoGenerateReportListCall();
			},
			templateNameClickEvt: function(e){
				Loading.open($('#report-main-popup'));
				var detailId = this.popupMainCotent.id;
				Model.fileGetAjax(detailId).done(function(data,fileName){
					fileDownload(data,fileName);
				}).fail(function(){
				}).always(function(){
					Loading.close();
				});
			},
			fileClick: function(e) {
				if(this.popupMain.stateMode === 'create'){
					$('#excel-file-input').click();
				}else if(this.popupMain.stateMode === 'edit'){
					$('#popup-file-change-confrim').data('kendoCommonDialog').open();
				}
			},
			fileChange: function(){
				var file = $('#excel-file-input')[0].files[0];
				var msgPopup = $('#popup-validation-confrim').data('kendoCommonDialog');
				var content = PopupViewModel.popupMainCotent;
				if(typeof file !== 'undefined'){
					var fileExtension = file.name;
					if(fileExtension.indexOf('.xlsx') != -1){
						if(fileExtension.length <= 30){
							this.popupMain.set('fileName',file.name);
							var fileFormData = Model.formDataProcessingFunc();
							var fileName = this.popupMain.get('fileName');
							content.Main.name.set('value',fileName);
							content.Main.file.set('value',fileFormData);
							saveConfrimValidator();
						}else{
							$('#excel-file-input').val("");
							msgPopup = $('#popup-validation-confrim').data('kendoCommonDialog');
							msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_FILE_EXCEL_VALIDATION_NAME_FALSE"));
							msgPopup.open();
						}
					}else{
						msgPopup = $('#popup-validation-confrim').data('kendoCommonDialog');
						msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_FILE_EXCEL_VALIDATION_FALSE"));
						msgPopup.open();
					}
				}else{
					inputFileResetFunc();
				}
			}
		},
		popupReportList :{
			type : "reportListPopup",
			id : "report-list-popup",
			isVisible: false,
			isDeleteVisible: false,
			title : I18N.prop("REPORT_REPORT_POPUP_TITLE_DETAIL"),
			width: 560,
			height: 820,
			content : "" +
			"<div>" +
				"<div class='auto-create-title'>" +
					"<span>" + I18N.prop("REPORT_REPORT_POPUP_AUTO_CREATE_LIST") + "</span>" +
					"<span class='popup-close-btn' style='margin-top: 6px;' data-bind='events:{click:popupReportList.closeEvt}'></span>" +
				"</div>" +
				"<div>" +
					"" +
				"</div>" +
				"<div>" +
					"<div data-template='report-menu-template' data-bind='source:popupReportList.grid'></div>" +
				"</div>" +
				"<div class='report-list-button-box'>" +
					"<button data-role='button' class='report-list-button-delete' data-bind='enabled:popupReportList.isDeleteVisible, events:{click:popupReportList.deleteEvt}'>" + I18N.prop("REPORT_REPORT_DELETE_BTN") + "</button>" +
					"<button data-role='button' class='report-list-button-close' data-bind='events:{click:popupReportList.closeEvt}'>" + I18N.prop("REPORT_REPORT_POPUP_CLOSE") + "</button>" +
				"</div>" +
			"</div>",
			onOpen: function() {
			},
			onClose: function() {
			},
			deleteEvt: function(e){
				Loading.open($("#report-list-popup"));
				var checkData = $('#report-list-grid').data('kendoGrid').getCheckedData();
				Model.deleteAutoCreateReportList(PopupViewModel.popupMainCotent.id, checkData).done(function(){
					autoGenerateReportListCall();
				}).fail(function(){
					// autoGenerateReportListCall();			//임시 테스트용 백엔드 업데이트 제거 요망
				}).always(function(){
				});
			},
			closeEvt: function(e){
				$('#report-list-popup').data('kendoDialog').close();
			},
			grid:{
				id : "report-list-grid",
				type: "reportListGrid",
				class: '',
				height: 680,
				columns: "[" +
					"{ 'hidden': true, 'field': 'hidden'}," +
					"{ 'sortable': true, 'width': 350, 'field': 'id', 'title': '" + I18N.prop("REPORT_REPORT_POPUP_CREATION_TIME") + "'}," +
					"{ 'template': '<button class=grid-download-btn data-bind=events:{click:options.clickAutoReportDownload}>"  + I18N.prop("REPORT_REPORT_GRID_COLUMNS_DOWNLOAD") + "</button>', 'sortable': false, 'field': 'download', 'title': ' '}" +
				"]",
				GriddataSource: new kendo.data.DataSource({
					schema: {
						model: {
							fields: {
								Id: { type: "string" },
								creationTime: { type: "string" }
							}
						}
					}
				}),
				disabled : false,
				isEnabled : true,
				scrollable: true,
				groupable : false,
				sortable: true,
				filterable: false,
				pageable: false,
				//checkedLimit : 10         //전체 체크 박스 또는 그룹 체크 박스 동작 시, 최대 체크 되는 아이템의 개수를 설정
				//selectedLimit : 10        //전체 선택 동작(selectAll()) 시, 최대 체크 되는 아이템의 개수를 설정
				hasCheckedModel : true,     //checked 프로퍼티를 통하여 Model에 Checkbox 상태를 유지하도록 하게 함.
				setCheckedAttribute : true,  //데이터가 checked 프로퍼티를 갖게 함. (이미 존재할 경우 true로 하지 않아도 됨)
				//hasRadioModel : true,      //checked 프로퍼티를 통하여 Model에 Radio 버튼 상태를 유지하도록 하게 함.
				options : {
					clickAutoReportDownload : clickAutoReportListGridBtnDownload
				}
			}
		},
		// popupExcelFile :{
		// 	type : "popupExcelFile",
		// 	id : "popup-excel-file",
		// 	isVisible: false,
		// 	isSaveVisible: false,
		// 	title : I18N.prop("REPORT_REPORT_POPUP_FILE_ADD_TITLE"),
		// 	fileName: '',
		// 	oldFileName: '',
		// 	oldFile: '',
		// 	width: 900,
		// 	height: 260,
		// 	content : "" +
		// 	"<div style='height:100%'>" +
		// 		"<div class='file-upload-title'>" +
		// 			"<span>" + I18N.prop("REPORT_REPORT_POPUP_FILE_UPLOAD_TITLE") + "</span>" +
		// 		"</div>" +
		// 		"<div class='file-upload-content'>" +
		// 			"<button data-role='button' class='report-list-button-delete' data-bind='events:{click:popupExcelFile.fileClick}'>" + I18N.prop("REPORT_REPORT_POPUP_FILE_ADD_BTN") + "</button>" +
		// 			"<span id='excel-file-label'  data-bind='text:popupExcelFile.fileName' ></span>" +
		// 		"</div>" +
		// 		"<div>" +
		// 			"<form id='excel-file-frm'>" +
		// 				"<input name='file' type='file' id='excel-file-input' data-bind='events:{change:popupExcelFile.fileChange}'/>" +
		// 			"</form>" +
		// 		"</div>" +
		// 		"<div class='report-list-button-box'>" +
		// 			"<button data-role='button' class='report-list-button-delete' data-bind='enabled:popupExcelFile.isSaveVisible, events:{click:popupExcelFile.saveEvt}'>" + I18N.prop("COMMON_BTN_SAVE") + "</button>" +
		// 			"<button data-role='button' class='report-list-button-close' data-bind='events:{click:popupExcelFile.closeEvt}'>" + I18N.prop("REPORT_REPORT_POPUP_CANCLE") + "</button>" +
		// 		"</div>" +
		// 	"</div>",
		// 	fileClick: function(e) {
		// 		$('#excel-file-input').click();
		// 	},
		// 	fileChange: function(){
		// 		var file = $('#excel-file-input')[0].files[0];
		// 		var msgPopup = $('#popup-validation-confrim').data('kendoCommonDialog');
		// 		if(typeof file !== 'undefined'){
		// 			var fileExtension = file.name;
		// 			if(fileExtension.indexOf('.xlsx') != -1){
		// 				if(fileExtension.length <= 30){
		// 					this.popupExcelFile.set('fileName',file.name);
		// 					this.popupExcelFile.set('isSaveVisible',true);
		// 				}else{
		// 					msgPopup = $('#popup-validation-confrim').data('kendoCommonDialog');
		// 					msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_FILE_EXCEL_VALIDATION_NAME_FALSE"));
		// 					msgPopup.open();
		// 				}
		// 			}else{
		// 				msgPopup = $('#popup-validation-confrim').data('kendoCommonDialog');
		// 				msgPopup.message(I18N.prop("REPORT_REPORT_POPUP_FILE_EXCEL_VALIDATION_FALSE"));
		// 				msgPopup.open();
		// 			}
		// 		}else{
		// 			this.popupExcelFile.set('isSaveVisible',false);
		// 			inputFileResetFunc();
		// 		}
		// 	},
		// 	onOpen: function() {
		// 	},
		// 	onClose: function() {
		// 	},
		// 	saveEvt: function(e){
		// 		var fileName = this.popupExcelFile.get('fileName');
		// 		this.popupExcelFile.set('oldFileName',fileName);
		// 		PopupViewModel.popupMainCotent.Main.name.set('value',fileName);
		// 		saveConfrimValidator();
		// 		$('#popup-excel-file').data('kendoDialog').close();
		// 	},
		// 	closeEvt: function(e){
		// 		// var oldFileName = this.popupExcelFile.get('oldFileName');
		// 		// var FileName = this.popupExcelFile.get('fileName');
		// 		// if(oldFileName !== FileName){

		// 		// }
		// 		this.popupExcelFile.set('fileName',"");
		// 		$('#excel-file-input').val("");
		// 		$('#popup-excel-file').data('kendoDialog').close();
		// 	}
		// },
		popupDeleteConfrim : {
			id: 'popup-delete-confrim',
			type : "confirm",
			title : I18N.prop("REPORT_REPORT_POPUP_DELETE_CONFRIM_TITLE"),
			message: I18N.prop("REPORT_REPORT_POPUP_DELETE_CONFRIM_CONTENT"),
			width: 560,
			height: 250
		},
		popupDmsTypeConfrim : {
			id: 'popup-dmstype-confrim',
			type : "confirm",
			title : I18N.prop("REPORT_REPORT_POPUP_DMSTYPE_CONFRIM_TITLE"),
			message: I18N.prop("REPORT_REPORT_POPUP_DMSTYPE_CONFRIM_CONTENT"),
			width: 560,
			height: 250
		},
		popupCancleConfrim : {
			id: 'popup-cancle-confrim',
			type : "confirm",
			title : I18N.prop("REPORT_REPORT_POPUP_CANCLE_CONFRIM_TITLE"),
			message: I18N.prop("REPORT_REPORT_POPUP_CANCLE_CONFRIM_CONTENT"),
			width: 560,
			height: 250
		},
		popupValidationContrim : {
			id: 'popup-validation-confrim',
			type : 'message',
			title : I18N.prop("REPORT_REPORT_POPUP_VALIDATION_CONFRIM_TITLE"),
			message: '',
			width: 560,
			height: 250
		},
		popupErrorMessage : {
			id: 'popup-error-message',
			type : 'message',
			title : I18N.prop("REPORT_REPORT_POPUP_VALIDATION_CONFRIM_TITLE"),
			message: '',
			width: 560,
			height: 250
		},
		popupFileChangeConfrim : {
			id: 'popup-file-change-confrim',
			type : "confirm",
			title : I18N.prop("REPORT_REPORT_POPUP_FILE_CHANGE_CONFRIM_TITLE"),
			message: I18N.prop("REPORT_REPORT_POPUP_FILE_CHANGE_CONFRIM_CONTENT"),
			width: 560,
			height: 250
		}
	});

	/**
	*   <ul>
	*   <li>상단 드랍다운리스트 값변경시 그리드에 필터를 걸어주는 함수</li>
	*   </ul>
	*   @function changeGridFilter
	*   @returns {void}
	*/
	function changeGridFilter(){
		var topDropDownListVal = $('#top-menu-kind-dropdownlist').data('kendoDropDownList').value();
		var grid = $('#report-content-grid').data("kendoGrid");
		grid.dataSource.filter({
			logic: "and",
			filters: [
				{
					logic: "or",
					filters: [
						{ field: "type", operator: "contains", value: topDropDownListVal }
					]
				}
			]
		});
	}

	/**
	*   <ul>
	*   <li>메인 검색 인풋박스에 값을 입력하고 엔터 혹은 아이콘 클릭시 호출되는 함수 입력된 문자열값을 API호출하여 보고서 그리드를 재생성한다 </li>
	*   </ul>
	*   @function searchReportGrid
	*   @returns {void}
	*/
	function searchReportGrid(){
		Loading.open();
		Model.reportGridAjaxData('serach').done(function(data,reportLengthOver){
			MainViewModel.contentGrid[0].set('GriddataSource',data);
			if(reportLengthOver){
				MainViewModel.topMenu[2].set('isEnabled',false);
			}
		}).fail(function(){
			// MainViewModel.contentGrid[0].set('GriddataSource',data);		//[임시 몫데이터 백엔드에 값 받아올시 주석처리 및 삭제요망]
		}).always(function(){
			Loading.close();
		});
	}

	/**
	*   <ul>
	*   <li>메인 보고서 그리드 다운로드 버튼클릭시 해당 값에 아이디를 모델에 넘겨 다운로드 API호출하는 함수 </li>
	*   </ul>
	*   @function clickGridBtnDownload
	*   @param {Object}e - 선택한 보고서 그리드 라인
	*   @returns {void}
	*/
	function clickGridBtnDownload(e){
		Loading.open();
		Model.requestGridDownload(e.data.id).done(function(data,fileName){
			fileDownload(data,fileName);
		}).fail(function(){
		}).always(function(){
			Loading.close();
		});
	}

	/**
	*   <ul>
	*   <li>메인 보고서 그리드 다운로드 버튼클릭시 해당 값에 아이디를 모델에 넘겨 다운로드 API호출하는 함수 </li>
	*   </ul>
	*   @function clickGridBtnDownload
	*   @param {Object}e - 선택한 보고서 그리드 라인
	*   @returns {void}
	*/
	function clickAutoReportListGridBtnDownload(e){
		Loading.open($("#report-list-popup"));
		var detailPopupId = PopupViewModel.popupMainCotent.get('id');
		Model.autoGeneratedReportDownload(detailPopupId,e.data.id).done(function(data,fileName){
			fileDownload(data,fileName);
		}).fail(function(){
		}).always(function(){
			Loading.close();
		});
	}

	/**
	*   <ul>
	*   <li>메인 보고서 그리드 상세보기 버튼클릭시 해당 값에 아이디를 모델에 넘겨 상세보기 API 호출 해당 정보를 기반으로 팝업출력 </li>
	*   </ul>
	*   @function clickGridBtnDetail
	*   @param {Object}e - 선택한 보고서 그리드 라인
	*   @returns {void}
	*/
	function clickGridBtnDetail(e){
		Loading.open();
		var ajaxData;
		Model.detailDataPopupAjaxData(e.data.id).done(function(data){
			ajaxData = data;
		}).fail(function(){
			// ajaxData = data;
		}).always(function(){
			$('#report-main-popup').data('kendoDialog').open();
			Loading.close();
			Loading.open($('#report-main-popup'));
			ModeChange('view');
			popupInit(ajaxData);
			Loading.close();
		});
	}

	/**
	*   <ul>
	*   <li>메인화면에 상단 오른쪽 생성 버튼 클릭시 호출되는 함수 팝업창을 띄우고 기본값을 셋팅한다 </li>
	*   </ul>
	*   @function createBtnClick
	*   @returns {void}
	*/
	function createBtnClick(){
		$('#report-main-popup').data('kendoDialog').open();
		ModeChange('create');
		popupInit();
	}

	/**
	*   <ul>
	*   <li>메인화면에 상단 오른쪽 삭제 버튼 클릭시 호출되는 함수 팝업창을 띄운다 팝업창에 예 이벤트는 deleteReportData호출 report.js deletePopup변수 참조</li>
	*   </ul>
	*   @function deleteBtnClick
	*   @returns {void}
	*/
	function deleteBtnClick(){
		$('#popup-delete-confrim').data('kendoCommonDialog').open();
	}

	/**
	*   <ul>
	*   <li>메인 보고서 그리드 삭제버튼 클릭 팝업창 확인 클릭시 호출되는 함수 그리드에 체크된 데이터를 모델로 넘겨 </li>
	*	<li>삭제 API 호출 통신 성공후 보고서 그리드 데이터 재호출후 그리드 데이터값 수정 </li>
	*   </ul>
	*   @function deleteReportData
	*   @returns {void}
	*/
	function deleteReportData(){
		Loading.open();
		var grid = $('#report-content-grid').data("kendoGrid");
		var gridCheckData = grid.getCheckedData();
		Model.deleteReportAjaxData(gridCheckData).done(function(){
			Loading.open();
			Model.reportGridAjaxData().done(function(gridData,reportLengthOver){
				MainViewModel.contentGrid[0].set('GriddataSource',gridData);
				if(reportLengthOver){
					MainViewModel.topMenu[2].set('isEnabled',false);
				}else{
					MainViewModel.topMenu[2].set('isEnabled',true);
				}
			}).fail(function(){
				// MainViewModel.contentGrid[0].set('GriddataSource',gridData);		//[임시 몫데이터 백엔드에 값 받아올시 주석처리 및 삭제요망]
			}).always(function(){
				Loading.close();
			});
		}).fail(function(){
		}).always(function(){
			Loading.close();
		});
	}

	/**
	*   <ul>
	*   <li>메인 팝업창에 생성간격 드랍다운리스트를 change 이벤트시 호출되는 함수 선택된 값에 따라 생성시점에 데이터소스를 동적으로 수정 </li>
	*	<li>데이터소스 값 생성은 모델 generalIntervalDDLDataProcessing 참조</li>
	*   </ul>
	*   @function generalIntervalDDLChange
	*   @param {Object}e - 선택한 보고서 그리드 라인
	*   @returns {void}
	*/
	function generalIntervalDDLChange(e){
		var selectValue = typeof e.sender === 'undefined' ? e : e.sender.value();
		PopupViewModel.popupMainCotent.Footer.autoGenerateTime.set('ddlDs',Model.generalIntervalDDLDataProcessing(selectValue));
		saveConfrimValidator();
	}

	/**
	*   <ul>
	*   <li>그룹 리스트에 편집모드 타이틀과 일관성을 유지하기위해 보기모드에 html에 타이틀을 넣음으로 생기는 높이값 문제해결하기위한 함수  </li>
	*	<li>데이터소스 값 생성은 모델 generalIntervalDDLDataProcessing 참조</li>
	*   </ul>
	*   @function groupListModeChange
	*   @param {Object}type - 생성,편집 모드인지 보기 모드 구분값
	*   @returns {void}
	*/
	function groupListModeChange(type){
		var grouplist = $("#report-group-list").data('kendoCommonGroupList');
		var grouplistEl = $('#report-group-list');
		var grouplistAssignedEl = $(grouplist.assignedGroupList.element);
		var grouplistDeAssignedEl = $(grouplist.deAssignedGroupList.element);

		grouplistEditScrollReset();
		if(type){
			grouplist.setOptions({height:335});
			grouplistEl.height(335);
			grouplistAssignedEl.height(335);
			grouplistDeAssignedEl.height(335);
			grouplist.hideEditMode(true);
			$("#report-group-list > div > div.contents.edit > div.content.btn-group > div > div > button.deassign").text("<");
			$("#report-group-list > div > div.contents.edit > div.content.btn-group > div > div > button.assign").text(">");
		}else{
			grouplist.setOptions({height:387});
			grouplistEl.height(387);
			grouplistAssignedEl.height(387);
			grouplistDeAssignedEl.height(387);
			grouplist.hideEditMode(false);
		}
	}

	/**
	*   <ul>
	*   <li>기존 view edit값으로 전환되었지만 edit create가 값이 달라지는게 생기면서 생성 보기 편집을 구분할필요가 있어 생긴 함수 </li>
	*	<li>모드를 체인지 할때마다 현재 모드에 상태를 저장하고 각각에 뷰모델변수값을 변경 후 그룹리스트함수 요청 후 버튼 뷰모델 함수로 값을 넘겨준다</li>
	*   </ul>
	*   @function ModeChange
	*   @param {Object}type - 생성,편집 모드인지 보기 모드 구분값
	*   @returns {void}
	*/
	function ModeChange(type){
		var popupMain = PopupViewModel.popupMain;
		var content = PopupViewModel.popupMainCotent;
		if(type === 'view'){
			popupMain.set('stateMode','view');
			popupMain.set('viewMode',true);
			popupMain.set('editMode',false);
			popupMain.set('createMode',false);
			popupMain.set('saveVailator',false);
			if(content.Footer.autoGenerate.get('value')){
				popupMain.set('reportListBtnMode',true);
			}else{
				popupMain.set('reportListBtnMode',false);
			}
			groupListModeChange(true);
		}else if(type === 'edit'){
			popupMain.set('stateMode','edit');
			popupMain.set('viewMode',false);
			popupMain.set('editMode',true);
			popupMain.set('createMode',false);
			popupMain.set('reportListBtnMode',false);
			groupListModeChange(false);
			autoCreateReportDisabledFunc(false);
		}else if(type === 'create'){
			popupMain.set('stateMode','create');
			popupMain.set('viewMode',false);
			popupMain.set('editMode',true);
			popupMain.set('createMode',true);
			popupMain.set('reportListBtnMode',false);
			groupListModeChange(false);
		}
		customDateTimePickerConfrim(type);
		intervalGridChangeTextAlian();
		popupMain.titleTextChange();
		popupMain.btnViewEditMode(type);
	}


	/**
	*   <ul>
	*   <li>보고 기간을 변경시 보고간격 데이터소스와 값을 변경 예외처리로 보고간격 변경시 값이 없을경우 </li>
	*	<li>ex(보고기간이 일간으로 수정되었는데 보고간격은 월간별인 경우) 첫번쨰 값으로 수정</li>
	*   </ul>
	*   @function intervalSetData
	*   @param {Object}selectValue - 선택한 보고 기간
	*   @param {Object}settingDate - 시작 날짜 종료 날짜 객체
	*   @returns {Void} -
	*/
	function intervalSetData(selectValue,settingDate){
		var intervalDs = Model.intervalSetDataProcessing(selectValue,{startDate: settingDate.startDate,endDate: settingDate.endDate});
		PopupViewModel.popupMainCotent.Main.interval.set('ddlDs',intervalDs);
		if(intervalDs !== ""){
			var intervalValue = PopupViewModel.popupMainCotent.Main.interval.get('value');
			PopupViewModel.popupMainCotent.Main.interval.set('value',intervalDs[0].value);
			for(var i = 0; i < intervalDs.length; i++){
				if(intervalDs[i].value === intervalValue){
					PopupViewModel.popupMainCotent.Main.interval.set('value',intervalDs[i].value);
					break;
				}
			}
		}
		PopupViewModel.popupMainCotent.Main.interval.change(PopupViewModel.popupMainCotent.Main.interval.get('value'));
	}

	/**
	*   <ul>
	*   <li>상세보기버튼 클릭시, 생성버튼 클릭시 호출되는 함수 </li>
	*   <li>상세보기시 모델 detailDataPopupAjaxData 함수에서 데이터를 원형,가공 데이터를 받아 팝업 viewModel에 셋팅한다 </li>
	*   <li>생성버튼시 기존 빈값 모델을 팝업 viewModel에 셋팅한다 </li>
	*   <li>팝업 데이터는 value : API 통신시 필요한 원형값 text : 사용자에게 보여질 다국어처리된 텍스트 또는 데이터 </li>
	*   <li>템플릿,일반 두가지로 값을 할당 편집시 취소시 기존데이터로 돌아가기 위한 old 데이타 값 할당</li>
	*   </ul>
	*   @function popupInit
	*   @param {Object}data - 상세보기 API 요청한 데이터를 원형데이터와, 다국어처리된 텍스트 혹은 데이터소스 등등으로 가공된 변수 객체
	*   @returns {Void} -
	*/
	function popupInit(data){
		var popupData;
		if(typeof data === 'undefined'){
			popupData = Model.popupResetData;
		}else{
			popupData = data;
		}
		var content = PopupViewModel.popupMainCotent;
		var originData = popupData.originData;
		var processingData = popupData.processingData[0];
		var popupMain = PopupViewModel.popupMain;

		var valueArr = ['value','oldValue'];
		var textArr = ['text','oldText'];
		var DsArr = ['gridDs','oldDs'];
		var reportType = ['reportTypeGeneral','oldReportTypeGeneral'];
		var length = valueArr.length;

		grouplistEditScrollReset();

		content.set('id',originData.id);
		for(var ArrIndex = 0; ArrIndex < length; ArrIndex++){
			content.Header.set(valueArr[ArrIndex],originData.type);
			content.Main.duration.set(valueArr[ArrIndex],originData.duration);
			content.Main.dmsType.set(valueArr[ArrIndex],originData.dms_devices_type);
			content.Main.interval.set(valueArr[ArrIndex],originData.interval);

			content.Main.startDate.set(valueArr[ArrIndex],processingData.startDate);
			content.Main.startTime.set(valueArr[ArrIndex],processingData.startTime);
			content.Main.endDate.set(valueArr[ArrIndex],processingData.endDate);
			content.Main.endTime.set(valueArr[ArrIndex],processingData.endTime);

			content.Footer.autoGenerate.set(valueArr[ArrIndex],originData.autoGenerate);
			content.Footer.autoGenerateInterval.set(valueArr[ArrIndex],originData.autoGenerateInterval);
			content.Footer.autoGenerateTime.set(valueArr[ArrIndex],originData.autoGenerateTime);

			content.Header.set(textArr[ArrIndex],processingData.type);
			content.Main.duration.set(textArr[ArrIndex],processingData.duration);
			content.Main.dmsType.set(textArr[ArrIndex],processingData.dms_devices_type);
			content.Main.interval.set(textArr[ArrIndex],processingData.interval);
			content.Main.intervalGrid.set(DsArr[ArrIndex],Model.popupIntervalGridDataProcessing(originData.interval,content.Main.startDate.get('value'),content.Main.startTime.get('value'),content.Main.endDate.get('value'),content.Main.endTime.get('value')));
			content.Footer.autoGenerate.set(textArr[ArrIndex],processingData.autoGenerate);
			content.Footer.autoGenerateInterval.set(textArr[ArrIndex],processingData.autoGenerateInterval);
			content.Footer.autoGenerateTime.set(textArr[ArrIndex],processingData.autoGenerateTime);

			content.Main.name.set(valueArr[ArrIndex],originData.name);

			popupMain.set(reportType[ArrIndex],originData.type === 'General' ? true : false);
		}
		var groupGrid = $('div[data-role=commongrouplist]').data('kendoCommonGroupList');
		// groupGrid.setDataSource(processingData.devices);
		groupGrid.data(processingData.devices);
		groupListModeChange(popupMain.get('stateMode') === "view" ? true : false );		//공용화 라이브러리에서 문제가 있는듯함 셋데이터 옵션을 할시 높이값이 자동으로 바뀜 이에따라 해당코드 삽입
		content.Main.dmsGrid.set('oldDs',processingData.devices);
		content.Main.dmsGrid.set('selectedData', groupGrid.getAssignedItems());
		content.Main.dmsGrid.set('oldSelectedData', groupGrid.getAssignedItems());

		if(typeof content.Footer.autoGenerateInterval.get('value') !== 'undefined'){
			generalIntervalDDLChange(content.Footer.autoGenerateInterval.get('value'));
		}

		if(popupMain.get('stateMode') === "create"){
			content.Header.set('enabled',true);
		}else{
			content.Header.set('enabled',false);
		}

		if(content.Header.get('value') === 'Template'){
			autoCreateReportDisabledFunc(true);
		}else{
			autoCreateReportDisabledFunc(false);
		}

		if(content.Footer.autoGenerate.get('value')){
			popupMain.set('reportListBtnMode',true);
		}else{
			popupMain.set('reportListBtnMode',false);
		}

		grouplistEditScrollReset();
		var grouplist = $('#report-group-list .k-grid-content.k-auto-scrollable');
		grouplist.scrollTop(0);

		optionLabelReset();

		popupMain.set('saveVailator',false);

	}

	/**
	*   <ul>
	*   <li>리포트 팝업 호출시 특정 드랍다운 리스트에 optionLabel을 출력만 하고 선택은 못하도록 막는 함수 </li>
	*   </ul>
	*   @function optionLabelReset
	*   @returns {Void} -
	*/
	function optionLabelReset(){
		var popupDDL = {
			id : ['#duration-dropdownlist', '#dms-devices-type-dropdownlist', '#report-type-ddl', '#report-interval-ddl'],
			text : ['REPORT_REPORT_PLACEHOLDER_REPORT_DURATION', 'REPORT_REPORT_PLACEHOLDER_REPORT_DMS_TYPE', 'REPORT_REPORT_PLACEHOLDER_REPORT_DMS_TYPE', 'REPORT_REPORT_PLACEHOLDER_REPORT_INTERVAL']
		};
		for(var i = 0; i < popupDDL.id.length; i++){
			var ddl = $(popupDDL.id[i]).data('kendoDropDownList');
			ddl.setOptions({optionLabel:I18N.prop(popupDDL.text[i])});
			ddl.setOptions({optionLabel:''});
		}
	}

	function customDateTimePickerConfrim(curMode){
		if(curMode !== 'view'){
			var content = PopupViewModel.popupMainCotent;
			if(content.Main.duration.get('value') === 'Custom'){
				PopupViewModel.popupMain.set('dateCustomMode',true);
			}else{
				PopupViewModel.popupMain.set('dateCustomMode',false);
			}
		}else{
			PopupViewModel.popupMain.set('dateCustomMode',false);
		}
	}

	/**
	*   <ul>
	*   <li>메인팝업에서 저장을 눌렀을시 호출되는 함수</li>
	*   <li>먼저 보고서 종류가 일반, 템플릿에 따라 분기가 나눠진다 팝업창에서 선택한 값들을 viewModel에서 가져와 API 형식에 맞춰 변수생성 </li>
	*   <li>값을 API형식에 맞춰 완성후 API 통신에 필요한 필수값들이 있는지 validationData함수를 통해 확인</li>\
	*   <li>정상적으로 진행이 되면 validation.chkValidation true셋팅되어 정리된 객체를 API 호출</li>
	*   <li>필수값 누락시 해당 필드명에 대한 오류 팝업창 출력</li>
	*   </ul>
	*   @function popupMainSave
	*   @param {Object}e - 이벤트 객체
	*   @param {String}stateMode - 현재 view, edit, create 어떤 상태인지 확인하는 변수
	*   @returns {Void} -
	*/
	function popupMainSave(e,stateMode){
		Loading.open($('#report-main-popup'));
		var msgPopup = $('#popup-validation-confrim').data('kendoCommonDialog');
		var content = PopupViewModel.popupMainCotent;
		var validation;
		var saveData;
		var popupType = content.Header.get('value');

		if(popupType === 'General'){
			saveData = putViewModelData(true);

			validation = validationData(saveData);
			if(validation.chkValidation){
				Model.saveDataAjax(saveData,stateMode).done(function(){
				}).fail(function(){
				}).always(function(){
					popupMainClose();
					Model.reportGridAjaxData().done(function(gridData,reportLengthOver){
						MainViewModel.contentGrid[0].set('GriddataSource',gridData);
						//grid 데이터 100개 초과시 생성버튼 비활성화
						if(reportLengthOver){
							MainViewModel.topMenu[2].set('isEnabled',false);
						}
					}).fail(function(){
						// gridData = data;
						// MainViewModel.contentGrid[0].set('GriddataSource',data);		//[임시 몫데이터 백엔드에 값 받아올시 주석처리 및 삭제요망]
					}).always(function(){
						Loading.close();
					});
				});
			}else{
				msgPopup.message(validation.errorMsg);
				msgPopup.open();
				Loading.close();
			}
		}else if(popupType === 'Template'){
			saveData = putViewModelData(true);

			validation = validationData(saveData);
			if(validation.chkValidation){
				var stataMode = PopupViewModel.popupMain.stateMode;
				Model.fileAjax(saveData,stataMode).done(function(){
				}).fail(function(){
				}).always(function(){
					Model.reportGridAjaxData().done(function(gridData,reportLengthOver){
						MainViewModel.contentGrid[0].set('GriddataSource',gridData);
						//grid 데이터 100개 초과시 생성버튼 비활성화
						if(reportLengthOver){
							MainViewModel.topMenu[2].set('isEnabled',false);
						}
					}).fail(function(){
					}).always(function(){
						Loading.close();
					});
					popupMainClose();
				});
			}else{
				msgPopup.message(validation.errorMsg);
				msgPopup.open();
				Loading.close();
			}
		}

	}

	/**
	*   <ul>
	*   <li>메인팝업에서 저장을 눌렀을시 사용자가 누락한 필수값이 있는지 확인하는 함수</li>
	*   <li>일반, 템플릿에 따라 분기 후 각각에 데이터가 누락됬는지 확인후 리턴값으로 정상확인변수, 에러메세지 리턴</li>
	*   </ul>
	*   @function validationData
	*   @param {Object}saveData -
	*   @returns {Void} -
	*/
	function validationData(saveData){
		var chkValidation = false;
		var errorMsg = '';
		if(typeof saveData === 'undefined'){
			saveData = putViewModelData();
		}

		if(saveData.type === 'General'){
			if(typeof saveData.type === 'undefined' || saveData.type === ''){
				errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_TYPE_MESSAGE");
			}else if(typeof saveData.name === 'undefined' || saveData.name === ''){
				errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_TITLE_MESSAGE");
			}else if(typeof saveData.dms_devices_type === 'undefined' || saveData.dms_devices_type === ''){
				errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_DMSTYPE_MESSAGE");
			}else if(typeof saveData.duration === 'undefined' || saveData.duration === ''){
				errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_DURATION_MESSAGE");
			}else if(typeof saveData.interval === 'undefined' || saveData.interval === ''){
				errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_INTERVAL_MESSAGE");
			}else if(saveData.devices <= 0 ){
				errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_DEVICE_MESSAGE");
			}else{
				chkValidation = true;
			}

			if(saveData.duration === 'Custom'){
				if(typeof saveData.startTime === 'undefined' || saveData.startTime === ''){
					errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_START_TIME_MESSAGE");
					chkValidation = false;
				}else if(typeof saveData.endTime === 'undefined' || saveData.endTime === ''){
					errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_END_TIME_MESSAGE");
					chkValidation = false;
				}
			}

			if(saveData.autoGenerate === true){
				if(typeof saveData.autoGenerateInterval === 'undefined' || saveData.autoGenerateInterval === ''){
					errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_AUTO_GENERATE_IMTERVAL_MESSAGE");
					chkValidation = false;
				}else if(typeof saveData.autoGenerateTime === 'undefined' || saveData.autoGenerateTime === ''){
					errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_AUTO_GENERATE_TIME_MESSAGE");
					chkValidation = false;
				}
			}
		}else if(saveData.type === 'Template'){
			if(typeof saveData.type === 'undefined' || saveData.type === ''){
				errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_TYPE_MESSAGE");
			}else if(typeof saveData.name === 'undefined' || saveData.name === ''){
				errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_TITLE_MESSAGE");
			}else{
				chkValidation = true;
			}

			if(saveData.autoGenerate === true){
				if(typeof saveData.autoGenerateInterval === 'undefined' || saveData.autoGenerateInterval === ''){
					errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_AUTO_GENERATE_IMTERVAL_MESSAGE");
					chkValidation = false;
				}else if(typeof saveData.autoGenerateTime === 'undefined' || saveData.autoGenerateTime === ''){
					errorMsg = I18N.prop("REPORT_REPORT_POPUP_VALIDATION_AUTO_GENERATE_TIME_MESSAGE");
					chkValidation = false;
				}
			}
			var excelFileName = PopupViewModel.popupMain.get('fileName');
			if(excelFileName === 'undefined' || saveData.excelFileName === ''){
				chkValidation = false;
			}
		}

		return {chkValidation:chkValidation, errorMsg:errorMsg};
	}

	/**
	*   <ul>
	*   <li>메인팝업에서 기기 종류를 변경시 호출되는 팝업에 아니요를 클릭시 호출되는 함수</li>
	*   <li>기기 종류 viewModel 이전값을 현재값으로 셋팅해준다</li>
	*   </ul>
	*   @function popupDmsTypeNo
	*   @param {Object}e -
	*   @returns {Void} -
	*/
	function popupDmsTypeNo(e){
		var dmsType = PopupViewModel.popupMainCotent.Main.dmsType;
		dmsType.set('value',dmsType.get('prevValue'));
	}

	/**
	*   <ul>
	*   <li>메인팝업에서 기기 종류를 변경시 호출되는 팝업에 예를 클릭시 호출되는 함수</li>
	*   <li>모델 dmsTypeRefershData 함수 호출시 선택된 기기 종류 타입만 분류 그룹리스트를 사용하기위한 배열 문자열으로 바꾸는 함수 호출</li>
	*   <li>그룹리스트에 선택된 값을 표시하기위한 변수명 추가 등 데이터 가공 후 가공된 데이터를 그룹리스트에 설정합니다</li>
	*   </ul>
	*   @function popupDmsTypeNo
	*   @param {Object}e -
	*   @returns {Void} -
	*/
	function popupDmsTypeYes(e){
		Loading.open($('#report-main-popup'));
		var groupGrid = $('div[data-role=commongrouplist]').data('kendoCommonGroupList');

		var dmsType = PopupViewModel.popupMainCotent.Main.dmsType;
		var dmsValue = dmsType.get('value');
		dmsType.set('prevValue',dmsValue);

		Model.dmsTypeRefershData(dmsValue).done(function(data){
			groupGrid.data(data);
			PopupViewModel.popupMainCotent.Main.dmsGrid.set('selectedData', groupGrid.getAssignedItems());
			// var groupArr = [
			// 	{field: 'foundation_space_buildings_id'},
			// 	{field: 'foundation_space_floors_id'},
			// 	{field: 'dms_devices_id'}
			// ];
			// groupGrid.setDataSource(data,groupArr);
		}).fail(function(){
			// groupGrid.setDataSource(data);
		}).always(function(){
			Loading.close();
			saveConfrimValidator();
		});

	}

	/**
	*   <ul>
	*   <li>메인팝업에서 편집 모드에서 보기모드로 변환시 기존내용과 다른값이 있는지 확인하는 함수</li>
	*   <li>oldValue와 Value값이 다른게 있는지 확인후 있다면 팝업창 호출 없다면 바로 보기모드로 전환</li>
	*   </ul>
	*   @function popupValueDifference
	*   @param {Object}e -
	*   @returns {Void} -
	*/
	function popupValueDifference(e){
		var content = PopupViewModel.popupMainCotent;
		if(content.Header.get('value') !== content.Header.get('oldValue') ||
			PopupViewModel.popupMain.get('reportTypeGeneral') !== PopupViewModel.popupMain.get('oldReportTypeGeneral') ||
			content.Main.duration.get('value') !== content.Main.duration.get('oldValue') ||
			content.Main.dmsType.get('value') !== content.Main.dmsType.get('oldValue') ||
			JSON.stringify(content.Main.dmsGrid.get('selectedData')) !== JSON.stringify(content.Main.dmsGrid.get('oldSelectedData')) ||
			content.Main.interval.get('value') !== content.Main.interval.get('oldValue') ||
			content.Main.startDate.get('value') !== content.Main.startDate.get('oldValue') ||
			content.Main.startTime.get('value') !== content.Main.startTime.get('oldValue') ||
			content.Main.endDate.get('value') !== content.Main.endDate.get('oldValue') ||
			content.Main.endTime.get('value') !== content.Main.endTime.get('oldValue') ||
			content.Footer.autoGenerate.get('value') !== content.Footer.autoGenerate.get('oldValue') ||
			content.Footer.autoGenerateInterval.get('value') !== content.Footer.autoGenerateInterval.get('oldValue') ||
			content.Footer.autoGenerateTime.get('value') !== content.Footer.autoGenerateTime.get('oldValue') ||
			content.Main.name.get('value') !== content.Main.name.get('oldValue')){
			var canclePopup = $("#popup-cancle-confrim").data("kendoCommonDialog");
			canclePopup.open();
		}else{
			ModeChange('view');
		}
	}

	/**
	*   <ul>
	*   <li>팝업 편집시 변경된 내용이 있지만 팝업창에 예를 클릭시 호출되는 함수</li>
	*   <li>편집 모드에서 보기모드로 전환 후 oldValue값을 Value에 셋팅해준다</li>
	*   </ul>
	*   @function popupCancleYes
	*   @param {Object}e -
	*   @returns {Void} -
	*/
	function popupCancleYes(e){
		var content = PopupViewModel.popupMainCotent;
		var popupMain = PopupViewModel.popupMain;

		content.Header.set('value',content.Header.get('oldValue'));
		popupMain.set('value',content.Header.get('oldValue'));
		popupMain.set('reportTypeGeneral',popupMain.get('oldReportTypeGeneral'));
		content.Main.duration.set('value',content.Main.duration.get('oldValue'));
		content.Main.dmsType.set('value',content.Main.dmsType.get('oldValue'));
		content.Main.interval.set('value',content.Main.interval.get('oldValue'));
		content.Main.startDate.set('value',content.Main.startDate.get('oldValue'));
		content.Main.startTime.set('value',content.Main.startTime.get('oldValue'));
		content.Main.endDate.set('value',content.Main.endDate.get('oldValue'));
		content.Main.endTime.set('value',content.Main.endTime.get('oldValue'));
		content.Footer.autoGenerate.set('value',content.Footer.autoGenerate.get('oldValue'));
		content.Footer.autoGenerateInterval.set('value',content.Footer.autoGenerateInterval.get('oldValue'));
		content.Footer.autoGenerateTime.set('value',content.Footer.autoGenerateTime.get('oldValue'));

		content.Header.set('text',content.Header.get('oldText'));
		content.Main.duration.set('text',content.Main.duration.get('oldText'));
		content.Main.dmsType.set('text',content.Main.dmsType.get('oldText'));
		content.Main.interval.set('text',content.Main.interval.get('oldText'));
		content.Main.intervalGrid.set('text',content.Main.intervalGrid.get('oldText'));

		content.Footer.autoGenerateInterval.set('text',content.Footer.autoGenerateInterval.get('oldText'));
		content.Footer.autoGenerateTime.set('text',content.Footer.autoGenerateTime.get('oldText'));

		content.Main.name.set('value',content.Main.name.get('oldValue'));
		content.Main.file.set('value',content.Main.file.get('oldValue'));
		$('#excel-file-input').val("");

		var groupGrid = $('div[data-role=commongrouplist]').data('kendoCommonGroupList');
		// groupGrid.setDataSource(content.Main.dmsGrid.get('oldDs'));
		content.Main.dmsGrid.set('selectedData', content.Main.dmsGrid.get('oldSelectedData'));
		groupGrid.data(content.Main.dmsGrid.get('oldDs'));
		groupListModeChange(true);
		ModeChange('view');
	}

	/**
	*   <ul>
	*   <li>메인 팝업 닫기 호출 하는 함수</li>
	*   </ul>
	*   @function popupMainClose
	*   @returns {Void} -
	*/
	function popupMainClose(){
		$('#report-main-popup').data('kendoDialog').close();
	}

	/**
	*   <ul>
	*   <li>메인 팝업 보고서 종류가 템플릿 파일등록 버튼을 클릭후 예를 클릭할때 호출되는 함수 확인팝업닫기후 파일등록 팝업호출</li>
	*   </ul>
	*   @function fileChangeConfrimYes
	*   @returns {Void} -
	*/
	function fileChangeConfrimYes(){
		$("#popup-file-change-confrim").data("kendoCommonDialog").close();
		$('#excel-file-input').click();
	}

	/**
	*   <ul>
	*   <li>상세팝업 호출된 아이디에 보고서 목록 데이터를 호출하고 해당팝업 그리드에 데이터를 할당하는 함수</li>
	*   </ul>
	*   @function autoGenerateReportListCall
	*   @returns {Void} -
	*/
	function autoGenerateReportListCall(){
		Loading.open($('#report-main-popup'));
		Model.autoCreateReportListAjaxData(PopupViewModel.popupMainCotent.id).done(function(data){
			PopupViewModel.popupReportList.grid.set('GriddataSource',data);
		}).fail(function(){
			// PopupViewModel.popupReportList.grid.set('GriddataSource',data);		//[임시 몫데이터 백엔드에 값 받아올시 주석처리 및 삭제요망]
		}).always(function(){
			$('#report-list-popup').data('kendoDialog').open();
			Loading.close();
		});
	}

	/**
	*   <ul>
	*   <li>팝업에 간격선택 드랍다운리스트 아래 리스트뷰가 모드 변경시 동적으로 텍스트 정렬을 적용하게 하는 함수</li>
	*   </ul>
	*   @function intervalGridChangeTextAlian
	*   @returns {Void} -
	*/
	function intervalGridChangeTextAlian(){
		var intervalGrid = $("#interval-listview div");
		for(var i = 0; i < intervalGrid.length; i++){
			$(intervalGrid[i]).css('text-align',PopupViewModel.popupMainCotent.Main.intervalGrid.changeTextAlian());
		}
	}

	function startDateEndDateSet(type,selectValue){
		var mainData = PopupViewModel.popupMainCotent.Main;
		var startDate = type !== 'startDate' ? mainData.startDate.get('value') : selectValue;
		var endDate = type !== 'endDate' ? mainData.endDate.get('value') : selectValue;
		var startTime = type !== 'startTime' ? mainData.startTime.get('value') : selectValue;
		var endTime = type !== 'endTime' ? mainData.endTime.get('value') : selectValue;

		var setStartDate = new Date(moment(startDate).format('YYYY-MM-DD') + "T" + moment(startTime).format('HH:mm'));
		var setEndDate = new Date(moment(endDate).format('YYYY-MM-DD') + "T" + moment(endTime).format('HH:mm'));
		var oldValue;

		if(Model.dateDataOverCheck(setEndDate) === false){
			setEndDate = new Date(moment().format('YYYY-MM-DD') + "T" + moment(Model.timeDataProcessing(new Date())).format('HH:mm') );
			selectValue = setEndDate;
			mainData.endTime.set('value',new Date(moment(setEndDate).format('YYYY-MM-DDTHH:mm') ));
		}

		if(Model.checkDateTimePicker(setStartDate,setEndDate)){
			if(Model.dateDataOneYearOverCheck(setStartDate,setEndDate)){
				mainData[type].set('value',new Date(moment(Model.timeDataProcessing(selectValue)).format()));
				mainData[type].set('oldValue',new Date(moment(Model.timeDataProcessing(selectValue)).format()));
			}else{
				mainData.startDate.set('value',new Date(moment(setEndDate).subtract(1,'year').format('YYYY-MM-DDTHH:mm')));
			}
		}else{
			oldValue = mainData[type].get('oldValue');
			mainData[type].set('value', oldValue);
		}
		intervalSetData('Custom',{startDate: startDate,endDate: endDate});
	}

	function inputFileResetFunc(){
		var input = $('#excel-file-input');
		input.replaceWith(input.val('').clone(true));
		$('#excel-file-label').text('');
	}

	function saveConfrimValidator(e){
		var validatorResult = validationData();
		if(validatorResult.chkValidation){
			PopupViewModel.popupMain.set('saveVailator',true);
		}else{
			PopupViewModel.popupMain.set('saveVailator',false);
		}
	}

	function putViewModelData(saveCall){
		var content = PopupViewModel.popupMainCotent;
		var saveData = {};
		saveData.type = content.Header.get('value');
		if(saveData.type === 'General'){
			saveData.id = content.get('id');
			saveData.name = content.Main.name.get('value');
			saveData.dms_devices_type = content.Main.dmsType.get('value');
			saveData.duration = content.Main.duration.get('value');
			saveData.startTime = moment(new Date(moment(content.Main.startDate.get('value')).format('YYYY-MM-DD') + "T" + moment(content.Main.startTime.get('value')).format('HH:mm:ss'))).format();
			saveData.endTime = moment(new Date(moment(content.Main.endDate.get('value')).format('YYYY-MM-DD') + "T" + moment(content.Main.endTime.get('value')).format('HH:mm:ss'))).format();
			saveData.interval = content.Main.interval.get('value');

			saveData.autoGenerate = content.Footer.autoGenerate.get('value');
			saveData.autoGenerateInterval = content.Footer.autoGenerateInterval.get('value');
			saveData.autoGenerateTime = content.Footer.autoGenerateTime.get('value');
			if(saveCall){
				saveData.devices = Model.getAssignedItem();
			}else{
				saveData.devices = Model.getAssignedItemCheck();
			}
		}else if(saveData.type === 'Template'){
			saveData.id = content.get('id');
			saveData.name = content.Main.name.get('value');
			saveData.file = content.Main.file.get('value');
			saveData.autoGenerate = content.Footer.autoGenerate.get('value');
			saveData.autoGenerateInterval = content.Footer.autoGenerateInterval.get('value');
			saveData.autoGenerateTime = content.Footer.autoGenerateTime.get('value');
		}
		$.each(saveData, function(index, value) {
			if(typeof value === 'undefined' || value === '') delete saveData[index];
		});
		return saveData;
	}

	function fileDownload(data,name){
		name = typeof name === 'undefined' ? 'report.xlsx' : name;
		var link = document.createElement('a');
		link.href = window.URL.createObjectURL(data);
		link.download = name;
		link.click();
	}

	function autoCreateReportDisabledFunc(status){
		var content = PopupViewModel.popupMainCotent;
		var popupMain = PopupViewModel.popupMain;
		if(content.Main.duration.get('value') === 'Custom'){
			status = true;
			popupMain.set('autoCreateReportDisabled',status);
		}else{
			popupMain.set('autoCreateReportDisabled',status);
		}
		if(status){
			content.Footer.autoGenerate.set('value', false);
			// content.Footer.autoGenerateInterval.set('value', '');
			// content.Footer.autoGenerateTime.set('value', '');
		}
	}

	function grouplistEditScrollReset(){
		var grouplistEdit = $('#report-group-list .contents.edit .k-grid-content.k-auto-scrollable');
		grouplistEdit.scrollTop(0);
	}

	return {
		MainViewModel : MainViewModel,
		PopupViewModel : PopupViewModel,
		deleteReportData:deleteReportData,
		popupDmsTypeNo: popupDmsTypeNo,
		popupDmsTypeYes: popupDmsTypeYes,
		ModeChange: ModeChange,
		popupCancleYes: popupCancleYes,
		fileChangeConfrimYes: fileChangeConfrimYes,
		saveConfrimValidator: saveConfrimValidator
	};
});

//For Debug
//# sourceURL=report-viewmodel-report-vm.js