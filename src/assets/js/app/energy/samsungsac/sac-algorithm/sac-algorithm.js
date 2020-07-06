/**
*
*   <ul>
*       <li>SAC Settings - Algorithm 기능</li>
*       <li>기기들의 Algorithm을 설정한다.</li>
*       <li>요금제를 설정한다.</li>
*       <li>예냉/예열 시간을 설정한다.</li>
*   </ul>
*   @module app/devicesetting/controller/sac-algorithm
*   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
*   @param {Object} ViewModel - Algorithm 기능 내 View 전환 동작을 위한 View Model
*   @param {Object} Widget - Algorithm 기능 내 팝업 인스턴스 생성을 위한 Widget
*   @param {Object} Model - Algorithm 기기 및 요금제 정보 Model
*   @param {Object} Template - Algorithm 기능 내에서 UI를 표시하기 위한 Template
*   @requires app/main
*   @requires app/energy/samsungsac/sac-algorithm/sac-algorithm-vm
*   @requires app/energy/samsungsac/sac-algorithm/sac-algorithm-widget
*   @requires app/energy/samsungsac/sac-algorithm/sac-algorithm-model
*   @requires app/energy/samsungsac/sac-algorithm/sac-algorithm-template
*
*/
define("energy/samsungsac/sac-algorithm/sac-algorithm", ["energy/core", "energy/samsungsac/sac-algorithm/sac-algorithm-vm", "energy/samsungsac/sac-algorithm/sac-algorithm-widget",
	"energy/samsungsac/sac-algorithm/sac-algorithm-model", "energy/samsungsac/sac-algorithm/sac-algorithm-template"],
function(CoreModule, ViewModel, Widget, Model, Template){

	var kendo = window.kendo;
	var MainWindow = window.MAIN_WINDOW;
	var Util = window.Util;
	var I18N = window.I18N;
	var moment = window.moment;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	var Router = new kendo.Router();
	var Layout = new kendo.Layout("<div id='algorithm-view-content' class='algorithm-view-content'></div>");
	var confirmDialog = Widget.confirmDialog;
	var msgDialog = Widget.msgDialog;
	var powerPricingDialog = Widget.powerPricingDialog;
	var hasChangedDeviceInfo = false;

	var DEFAULT_PAGE_SIZE = 50;

	//initial router url
	var routeUrl = "/";

	//현재 표시되는 라우터 URL
	// var currentRouteUrl = "";

	var indoorListGrid, indoorListGridElem = $("#sac-algorithm-device-grid");
	var sacSettingsTab, sacSettingsTabElem = $("#operating-common-tab");
	var algorithmTab = sacSettingsTabElem.find(".tabbtn-sac-algorithm");
	var divBottomContent = indoorListGridElem.closest('.sac-algorithm-bottom-content');
	var contentView = $("#sac-algorithm-view");

	//View Model
	var MainViewModel = ViewModel.MainViewModel, ComfortViewModel = ViewModel.ComfortViewModel, PrcViewModel = ViewModel.PrcViewModel, OptimalViewModel = ViewModel.OptimalViewModel, PowerPricingViewModel = ViewModel.powerPricingViewModel;

	var powerPricingNameField;

	var hasPowerPricingChanged = false;

	var Views = ViewModel.Views;
	var isInitialized = false;
	/**
	*   <ul>
	*   <li>Algorithm 기능을 초기화한다.</li>
	*   <li>공용 UI Component를 초기화한다.</li>
	*   <li>현재 건물/층의 기기 정보를 API를 호출하여 서버로부터 받아오고, View를 업데이트한다.</li>
	*   <li>사용자 이벤트 동작을 바인딩한다.</li>
	*   </ul>
	*   @function init
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var init = function(){
		initComponent();

		algorithmTab.on("click", function(){
			//탭 진입 시에 Initialize 한다.
			if(!isInitialized){
				isInitialized = true;
				// console.log("algorithm tab index : " +algorithmTab.index());
				var element = sacSettingsTab.contentElement(algorithmTab.index());

				Loading.open();
				var q = getFloorQuery();

				$.ajax({
					url : "/algorithm/sac/device-setting" + q
				}).done(function(data){
					kendo.bind($(element), MainViewModel);
					createView(data);
					attachEvent();
					algorithmTab.trigger("click");
				}).fail(function(xhq){
					var msg = Util.parseFailResponse(xhq);
					msgDialog.message(msg);
					//msgDialog.open();

					//For Test
					kendo.bind($(element), MainViewModel);
					createView(Model.MockData);
					attachEvent();
					algorithmTab.trigger("click");
				}).always(function(){
					Loading.close();
					CoreModule.on("onfloorchange", onFloorChange);
					Loading.open();

					$.ajax({url : "/algorithm/sac/common-setting"}).done(function(settingData){
						setSettingsData(settingData);
					}).fail(function(){
						setSettingsData(Model.SettingMockData);
					}).always(function(){
						Loading.close();
						/*요금제*/
						Loading.open();
						$.ajax({url : "/algorithm/sac/powerDivision" }).done(function(pricingData){
							//Mock Data 테스트를 위한 코드
							/*if(pricingData.length < 1){
								pricingData = Model.powerPricingMockData;
							}*/
							setPowerPricingData(pricingData);
						}).fail(function(){
							setPowerPricingData(Model.powerPricingMockData);
						}).always(function(){
							Loading.close();
						});
					});

				});
			}
		});
	};
	/**
	*   <ul>
	*   <li>현재 빌딩/층 정보에 따라 API 호출을 위한 쿼리 파라미터를 생성한다.</li>
	*   </ul>
	*   @function  getFloorQuery
	*   @param {Object}floorData - 현재 선택한 빌딩/층 정보 객체
	*   @returns {String} API 호출을 위한 쿼리 파라미터
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var getFloorQuery = function(){
		var floorData = MainWindow.getCurrentFloor();
		var q = "?";
		if(floorData.building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID
		  && floorData.floor.id == MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			q += "foundation_space_buildings_id=" + floorData.building.id + "&";
		}
		if(floorData.floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
			q += "foundation_space_floors_id=" + floorData.floor.id;
		}
		return q;
	};
	/**
	*   <ul>
	*   <li>SAC Setting 공용 UI Tab Component 인스턴스를 가져온다.</li>
	*   </ul>
	*   @function  initComponent
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var initComponent = function(){
		sacSettingsTab = sacSettingsTabElem.data("kendoCommonTabStrip");
	};
	/**
	*   <ul>
	*   <li>Comfort/PRC/예냉 예열 View 전환을 위한 Router를 초기화한다.</li>
	*   <li>기기 리스트를 초기화한다.</li>
	*   <li>기기 리스트의 체크 박스 이벤트를 바인딩한다.</li>
	*   </ul>
	*   @function createView
	*   @param {Array} data - 기기 정보 리스트
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var createView = function(data){
		//init router

		Router.bind("init", routerInit);

		Views.comfort.view = new kendo.View($("#sac-algorithm-comfort-template"), { model : ComfortViewModel, evalTemplate: true});
		Router.route(Views.comfort.routeUrl, routerEvt.bind(Router, Views.comfort.view, Views.comfort.routeUrl));

		Views.prc.view = new kendo.View($("#sac-algorithm-prc-template"), { model : PrcViewModel, evalTemplate: true});
		Router.route(Views.prc.routeUrl, routerEvt.bind(Router, Views.prc.view, Views.prc.routeUrl));

		Views.optimal.view = new kendo.View($("#sac-algorithm-optimal-template"), { model : OptimalViewModel, evalTemplate: true});
		Router.route(Views.optimal.routeUrl, routerEvt.bind(Router, Views.optimal.view, Views.optimal.routeUrl));

		var dataSource = Model.createDataSource(data);
		var ds = new kendo.data.DataSource({
		    data : dataSource,
		    pageSize : DEFAULT_PAGE_SIZE
		});
		ds.read();

		var deviceListOptions = {                  //초기화 할 Widget의 Option 값
			columns : [
				{ field: "device_id", title: I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:100, footerTemplate : I18N.prop("FACILITY_DEVICE_NO_SELECTED"), footerAttributes:{ "class" : "algorithm-device-selected"}},
				{ field: "device_name", title: I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:100},
				{ field: "algorithm_type", title: I18N.prop("SETTINGS_ALGORITHM_NAME_PRC") + " / " + I18N.prop("SETTINGS_ALGORITHM_NAME_COMFORT"), width:200, template : Template.prcComfortTempl, sortable : false, footerTemplate : Template.prcComfortFooterTempl },
				{ field: "comfort_option", title: I18N.prop("SETTINGS_ALGORITHM_NAME_COMFORT_OPTION"), width:200, template : Template.comfortOptionTempl, sortable : false, footerTemplate : Template.comfortOptionFooterTempl}
			],
			dataSource: ds,
			height: "100%",
			sortable: true,
			filterable: false,
			pageable: false,
			hasCheckedModel : true,
			setCheckedAttribute : true,
			scrollable : {
				virtual : true
			}
		};

		indoorListGrid = indoorListGridElem.kendoGrid(deviceListOptions).data("kendoGrid");
		indoorListGrid.footerRadios = {};

		//데이터 바인딩 시, Footer의 Radio버튼 체크박스 상태가 사라지기 때문에 상태를 저장하고, 데이터 바인딩 될 때마다, 저장된 값으로 업데이트한다.
		indoorListGridElem.find(".k-grid-footer input[type='radio']").each(function(){
			var self = $(this);
			var id = self.attr("id");
			var checked = self.prop("checked");
			var disabled = self.prop("disabled");

			if(!indoorListGrid.footerRadios[id]){
				indoorListGrid.footerRadios[id] = {};
			}

			indoorListGrid.footerRadios[id].checked = checked;
			indoorListGrid.footerRadios[id].disabled = disabled;
		});

		//최초 Manual이 아닌 기기들에 대하여 선택 카운트를 표시하도록 Trigger
		// var checkedData = indoorListGrid.getCheckedData();
		checkedChangeEvt({ sender : indoorListGrid, isForce : true });

		Router.start();

		powerPricingNameField = $("#prc-pricing-name");
	};

	var routerInit = function(){
		Router.replace(routeUrl);
		Layout.render(contentView);
	};

	var routerEvt = function(view, url){
		// currentRouteUrl = url;
		var viewName = url.split('/')[1];
		try{
			Layout.showIn("#algorithm-view-content", view);
			divBottomContent.attr('view-name', viewName);
			//Comfort View isExceptionTime 체크 박스 및 체크박스에 따른 Time Picker 렌더링 반영
			if(url == "/comfort"){
				ComfortViewModel.trigger("change", { field : "isExceptionTime"});
			}
		}catch(e){
			Layout.showIn("#algorithm-view-content", view);
		}
	};
	/**
	*   <ul>
	*   <li>Algorithm Tab 전환, View 전환, 각 버튼들의 이벤트 들을 바인딩한다.</li>
	*   </ul>
	*   @function attachEvent
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var attachEvent = function(){

		algorithmTab.on("click", function(e){
			MainWindow.disableFloorNav(false);
			MainViewModel.category.comfort.click();
			hasChangedDeviceInfo = false;
		});

		MainViewModel.category.comfort.set("click", function(isForce){
			if(MainViewModel.category.comfort.get("active") == true && !isForce){
				return;
			}
			MainViewModel.category.comfort.set("active", true);
			MainViewModel.category.prc.set("active", false);
			MainViewModel.category.optimal.set("active", false);
			MainViewModel.set("showDeviceList", true);

			Router.navigate(Views.comfort.routeUrl);
		});

		MainViewModel.category.prc.set("click", function(isForce){
			if(MainViewModel.category.prc.get("active") == true && !isForce){
				return;
			}
			MainViewModel.category.prc.set("active", true);
			MainViewModel.category.comfort.set("active", false);
			MainViewModel.category.optimal.set("active", false);
			MainViewModel.set("showDeviceList", true);

			Router.navigate(Views.prc.routeUrl);
		});

		MainViewModel.category.optimal.set("click", function(isForce){
			if(MainViewModel.category.optimal.get("active") == true && !isForce){
				return;
			}
			MainViewModel.category.optimal.set("active", true);
			MainViewModel.category.comfort.set("active", false);
			MainViewModel.category.prc.set("active", false);
			MainViewModel.set("showDeviceList", false);

			Router.navigate(Views.optimal.routeUrl);
		});

		MainViewModel.saveBtn.set("click", saveBtnEvt);

		PrcViewModel.powerPricingBtn.set("click", function(){
			powerPricingDialog.setActions(0, { text: I18N.prop("COMMON_BTN_CLOSE") });
			powerPricingDialog.open();
			Widget.powerPricingGrid.refresh();
			PowerPricingViewModel.set('isDisableDeleteBtn', true);
		});

		//체크 박스 동작 시, 디바이스 선택 개수 업데이트
		indoorListGrid.bind("checked", checkedChangeEvt);

		//최상단 라디오버튼 업데이트
		indoorListGrid.bind("dataBound", function(){
			var radios = indoorListGrid.footerRadios;

			// console.log(radios);
			var footerRadios = indoorListGrid.element.find(".k-grid-footer input[type='radio']");
			footerRadios.each(function(){
				var self = $(this);
				var id = self.attr("id");
				// console.log(radios[id].disabled);
				self.prop("disabled", radios[id].disabled);
				self.prop("checked", radios[id].checked);
			});

			//최초 Manual이 아닌 기기들에 대하여 선택 카운트를 표시하도록 Trigger
			checkedChangeEvt({ sender : indoorListGrid, isForce : true });
		});

		//상단 라디오 버튼 이벤트
		indoorListGridElem.on("click", ".k-grid-footer input[type='radio']", function(e){
			var self = $(this);
			var tr = self.closest("tr");
			var id = self.attr("id");
			var isType = self.hasClass("type-radio");
			var items = getCheckedItems();
			var key, value;
			value = self.val();
			if(isType){    //PRC/Comfort    라디오 버튼 클릭
				key = "algorithm_type";
				//Comfort 선택할 경우에만 Comfort Option 라디오 버튼 활성화
				if(value == "Comfort"){
					tr.find("input.comfort-option-radio[type='radio']").prop("disabled", false);
				}else{
					tr.find("input.comfort-option-radio[type='radio']").prop("disabled", true);
				}
			}else{          //Comfort Option 라디오 버튼 클릭
				key = "comfort_option";
			}

			var footerRadioModel = indoorListGrid.footerRadios;
			//Radio Group 별로 설정
			//상단 라디오 버튼들은 Grid가 DataBound 되면, 해당 모델을 기반으로 템플릿으로 그려진다
			if(key == "algorithm_type"){
				footerRadioModel["prc-all"].checked = false;
				footerRadioModel["comfort-all"].checked = false;
			}else{
				footerRadioModel["normal-all"].checked = false;
				footerRadioModel["comfort-option-comfort-all"].checked = false;
				footerRadioModel["comfort-very-all"].checked = false;
			}

			if(isType && value == "Comfort"){
				footerRadioModel["normal-all"].disabled = false;
				footerRadioModel["comfort-option-comfort-all"].disabled = false;
				footerRadioModel["comfort-very-all"].disabled = false;
			}else if(isType){
				footerRadioModel["normal-all"].disabled = true;
				footerRadioModel["comfort-option-comfort-all"].disabled = true;
				footerRadioModel["comfort-very-all"].disabled = true;
			}

			footerRadioModel[id].checked = true;

			var i, item, max = items.length;
			for( i = 0; i < max; i++ ){
				item = items[i];
				item[key] = value;
			}

			var ds = indoorListGrid.dataSource;
			ds.fetch();

			//선택 개수 표시를 업데이트 하기위해서 체크박스 이벤트를 Trigger
			checkedChangeEvt({ sender : indoorListGrid });
		});

		//테이블 바디의 라디오버튼 이벤트
		indoorListGridElem.on("click", ".k-grid-content input[type='radio']", function(e){
			var self = $(this);
			var value = self.val();
			var tr = self.closest("tr");
			var uid = tr.data("uid");
			// var id = self.attr("id");
			var isType = self.hasClass("type-radio");
			var ds = indoorListGrid.dataSource;
			//var item = ds.get(id);
			var item = ds.getByUid(uid);

			if(isType){
				item.algorithm_type = value;

				//Comfort 일 경우만 Comfort Option의 라디오 버튼들을 활성화 한다.
				if(value == "Comfort"){
					tr.find("input.comfort-option-radio[type='radio']").prop("disabled", false);
				}else{
					tr.find("input.comfort-option-radio[type='radio']").prop("disabled", true);
				}
			}else{
				item.comfort_option = value;
			}

			/*//전부 동일한 경우 -> 체크 및 모드에 따라 comfort option 체크
			//전부 동일하지 않은 경우 -> 체크 해제 및 comfort option 비활성화
			var items = indoorListGrid.getCheckedData();
			var selectedNum = items.length;
			var i, item, isOnlyComfort = true, isOnlyPRC = true;
			for( i = 0; i < selectedNum; i++ ){
				if(items[i].algorithm_type != "Comfort"){
					isOnlyComfort = false;
				}

				if(items[i].algorithm_type != "PRC"){
					isOnlyPRC = false;
				}
			}
			var footer = indoorListGrid.element.find(".k-grid-footer");
			if(isOnlyComfort){
				footer.find("#comfort-all").prop("checked", true);
				footer.find("#prc-all").prop("checked", false);
			}else if(isOnlyPRC){
				footer.find("#prc-all").prop("checked", true);
				footer.find("#comfort-all").prop("checked", false);
			}*/
			checkedChangeEvt({ sender : indoorListGrid, isForce : true});

			//디바이스 설정 값이 변경되었음을 체크
			hasChangedDeviceInfo = true;
		});

		//예외 시간 추가/삭제 버튼 이벤트
		//추가
		contentView.on("click", ".exception-time-wrapper .bt.plus", function(){

			var times = ComfortViewModel.except_times;
			var lastTime = times[times.length - 1];
			var lastEndTime = lastTime.end_time;

			var startTime = new Date(lastEndTime);
			var endTime = new Date(startTime);
			var hour = startTime.getHours() + 1;
			if(hour > 24){
				hour = 24;
			}
			endTime.setHours(hour);
			endTime.setSeconds(0);
			var time = { start_time : startTime, end_time : endTime };

			times.push(time);
		});
		//삭제
		contentView.on("click", ".exception-time-wrapper .except-times .timepickers .bt.minus",function(){
			var self = $(this);
			if(self.hasClass("disabled")){
				return;
			}
			var pickerRow = self.closest(".timepickers");
			var index = pickerRow.index();
			var times = ComfortViewModel.except_times;
			times.splice(index, 1);
		});

		contentView.on("click", ".exception-time-wrapper .except-times .timepickers", function(){
			var self = $(this);
			if(self.hasClass("disabled")){
				return;
			}

			//var pickerRow = self.closest(".timepickers");
			//var index = pickerRow.index();
			var index = $(this).index();
			var times = ComfortViewModel.except_times;
			//클릭 시, 이전 값을 저장한다. 중복될 경우 다시 값을 돌리기 위함.
			var time = times[index];
			if(time instanceof kendo.data.ObservableObject){
				time = time.toJSON();
			}
			ComfortViewModel.beforeTimes = time;
		});

		//Comfort 뷰 모델 이벤트
		ComfortViewModel.bind("change", function(e){
			//console.log(e);
			var exceptTimes = ComfortViewModel.except_times;
			var length = exceptTimes.length;
			//예외시간 체크박스가 변경될 경우
			if(e.field == "isExceptionTime"){
				var isExceptionTime = ComfortViewModel.get("isExceptionTime");
				if(isExceptionTime){
					//Time Picker 활성화
					contentView.find(".exception-time-wrapper .except-times .timepickers input.time").each(function(){
						var self = $(this);
						var timePicker = self.data("kendoCommonTimePicker");
						timePicker.enable(true);
					});
					//삭제 버튼 Show
					contentView.find(".exception-time-wrapper .except-times .timepickers .bt.minus").show();
					//추가 버튼 Show
					if(length < 3){
						ComfortViewModel.set("showTimeAddBtn", true);
					}

					//예외 시간이 1개인 경우에는 삭제할 수 없다.
					if(length == 1){
						contentView.find(".exception-time-wrapper .except-times .timepickers .bt.minus").addClass("disabled");
					}else{
						contentView.find(".exception-time-wrapper .except-times .timepickers .bt.minus").removeClass("disabled");
					}
				}else{
					//Time Picker 비활성화
					contentView.find(".exception-time-wrapper .except-times .timepickers input.time").each(function(){
						var self = $(this);
						var timePicker = self.data("kendoCommonTimePicker");
						timePicker.enable(false);
					});
					//삭제 버튼 Hide
					contentView.find(".exception-time-wrapper .except-times .timepickers .bt.minus").hide();

					//추가 버튼 Hide
					ComfortViewModel.set("showTimeAddBtn", false);

					//비활성화 되므로 다른 룰첵은 불필요함. return
					return;
				}
			}

			if(e.field == "except_times"){
				//예외 시간이 1개인 경우에는 삭제할 수 없다.
				if(length == 1){
					contentView.find(".exception-time-wrapper .except-times .timepickers .bt.minus").addClass("disabled");
				}else{
					contentView.find(".exception-time-wrapper .except-times .timepickers .bt.minus").removeClass("disabled");
				}

				if(length == 3){
					//최대 3개까지 추가 가능
					ComfortViewModel.set("showTimeAddBtn", false);
				}else{
					ComfortViewModel.set("showTimeAddBtn", true);
				}

				var i, endTime;
				//종료시간이 24:00인 예외 시간 설정이 있다면 3개까지 입력이 안되었더라도 더 이상 추가가 불가능하다.
				var today = new Date();
				for( i = 0; i < length; i++ ){
					endTime = exceptTimes[i].end_time;

					if(today.getDate() < endTime.getDate() && endTime.getHours() == 0 && endTime.getMinutes() == 0){
						ComfortViewModel.set("showTimeAddBtn", false);
						break;
					}
				}

				var action = e.action;
				if(action == "itemchange"){
					var time = ComfortViewModel.beforeTimes;
					var item = e.items[0];
					if(isInvalidTime(item)){
						//종료 시간보다 뒤 일 수 없다.
						if(item){
							item.set("start_time", time.start_time);
							item.set("end_time", time.end_time);
						}
						return false;
					}
					//저장 시, 중복 시간 체크하고 팝업표시 되는 것으로 사양 수정 (08/26)
					/*if(hasDuplicateExceptTimes(exceptTimes)){
						//중복된 경우 다시 원복한다.
						if(item){
							item.set("start_time", time.start_time);
							item.set("end_time", time.end_time);
						}
						return false;
					}*/
				}

				//시간이 변경/추가/삭제 될 경우 재정렬한다.
				//if(action == "remove" || action == "add"){
				exceptTimes.sort(function(a, b){
					var as = a.start_time ? moment(a.start_time).format("HH:mm") : "-";
					var bs = b.start_time ? moment(b.start_time).format("HH:mm") : "-";
					return as.localeCompare(bs);
				});
				ComfortViewModel.set("except_times", exceptTimes);
				//}
			}
		});

		/*요금제 변경*/
		PowerPricingViewModel.set("clickEditBtn", function(){
			hasPowerPricingChanged = false;
			PowerPricingViewModel.set("isEdit", true);
			PowerPricingViewModel.set("isAdd", false);

			//Save 버튼 활성화
			powerPricingDialog.setActions(1, { visible : true, disabled : true });

			//Close 버튼 텍스트 변경
			powerPricingDialog.setActions(0, { text: I18N.prop("COMMON_BTN_CLOSE") });

			var dropDownList = this.dropDownList;
			var value = dropDownList.get("value");
			if(value instanceof kendo.data.ObservableObject){
				value = value.id;
			}
			var validator = powerPricingNameField.data("kendoCommonValidator");
			validator.hideMessages();

			if(value){
				var data = dropDownList.get("dataSource");
				var name, list, i, max = data.length;
				for( i = 0; i < max; i++ ){
					if(data[i].id == value){
						list = data[i].list;
						name = data[i].name;
						break;
					}
				}
				//Drop Down List에 들고있는 List와 별개로 생성한다. (수정/삭제 중 Cancel하는 동작 때문.)
				list = list.toJSON();
				var ds = new kendo.data.DataSource({
					data : list
				});
				Widget.powerPricingEditGrid.setDataSource(ds);
				powerPricingNameField.val(name);
				PowerPricingViewModel.set("selectedNum", 0);
				PowerPricingViewModel.set("disabledDelete", true);
				//Validator는 MVVM Value 바인딩이 정상동작하지 않는다.
				//this.set("editName", name);
			}

		});
		//요금제 생성
		PowerPricingViewModel.set("clickCreateBtn", function(){
			var validator = powerPricingNameField.data("kendoCommonValidator");

			validator.hideMessages();
			PowerPricingViewModel.set("isEdit", true);
			PowerPricingViewModel.set("isAdd", true);

			//Save 버튼 Show
			powerPricingDialog.setActions(1, { visible : true, disabled : true });

			//Close 버튼 텍스트 변경
			powerPricingDialog.setActions(0, { text: I18N.prop("COMMON_BTN_CLOSE") }); // 닫기 버튼 텍스트 변경

			var ds = new kendo.data.DataSource({
				data : []
			});
			Widget.powerPricingEditGrid.setDataSource(ds);
			powerPricingNameField.val("");
			PowerPricingViewModel.set("selectedNum", 0);
			PowerPricingViewModel.set("disabledDelete", true);
		});

		// 요금제 기간 추가
		PowerPricingViewModel.set("clickAddBtn", function(){
			var ds = Widget.powerPricingEditGrid.dataSource;
			ds.add(Model.defaultPowerPricingListData);
			powerPricingDialog.setActions(1, { disabled : false });
			hasPowerPricingChanged = true;
		});

		//요금제 삭제
		PowerPricingViewModel.set("clickTopDeleteBtn", function(){
			confirmDialog.message(I18N.prop("SETTINGS_ALGORITHM_POWER_PRICING_DELETE_CONFIRM"));
			confirmDialog.setConfirmActions({
				yes : function(){
					var dropDown = PowerPricingViewModel.get("dropDownList");
					var dropDownDs = dropDown.get("dataSource");
					var value = dropDown.get("value");
					if(value instanceof kendo.data.ObservableObject){
						value = value.id;
					}
					Loading.open();
					$.ajax({
						url : "/algorithm/sac/powerDivision/" + value,
						method : "DELETE"
					}).done(function(){
						var msg = I18N.prop("SETTINGS_ALGORITHM_POWER_PRICING_DELETE_RESULT");
						msgDialog.message(msg);
						msgDialog.open();
						var i, max = dropDownDs.length;
						for( i = 0; i < max; i++ ){
							if(dropDownDs[i].id == value){
								dropDownDs.splice(i, 1);
								break;
							}
						}
						setPowerPricingData(dropDownDs);
						Loading.close();
						setBtnTextInPricePopup();
					}).fail(function(xhq){
						var msg = Util.parseFailResponse(xhq);
						if(msg.indexOf("enabled") != -1){
							msg = I18N.prop("SETTINGS_ALGORITHM_CANNOT_DELETE_ENABLED_PRICING");
						}
						msgDialog.message(msg);
						msgDialog.open();
					}).always(function(){

					});
				}
			});
			confirmDialog.open();
		});

		PowerPricingViewModel.set("clickDeleteBtn", function(){
			confirmDialog.message(I18N.prop("SETTINGS_ALGORITHM_POWER_PRICING_DELETE_CONFIRM"));
			confirmDialog.setConfirmActions({
				yes : function(){
					var ds = Widget.powerPricingEditGrid.dataSource;
					var checkedData = Widget.powerPricingEditGrid.getCheckedData();
					var item, i, max = checkedData.length;
					for( i = 0; i < max; i++ ){
						item = checkedData[i];
						ds.remove(item);
					}
					msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_POWER_PRICING_DELETE_RESULT"));
					msgDialog.open();
					PowerPricingViewModel.set("selectedNum", 0);
					var listDs = Widget.powerPricingEditGrid.dataSource;
					var data = listDs.data();
					if(data.length > 0){
						powerPricingDialog.setActions(1, { disabled : false });
					}else{
						powerPricingDialog.setActions(1, { disabled : true });
					}
					hasPowerPricingChanged = true;
				}
			});
			confirmDialog.open();
		});

		Widget.powerPricingEditGrid.bind("checked", function(e){
			var checkedData = e.sender.getCheckedData();
			PowerPricingViewModel.set("selectedNum", checkedData.length);
			if(checkedData.length > 0){
				PowerPricingViewModel.set("disabledDelete", false);
			}else{
				PowerPricingViewModel.set("disabledDelete", true);
			}
		});

		Widget.powerPricingEditGrid.bind("dataBound", function(e){
			var element = e.sender.element;
			element.find(".pricing-edit-weekday").each(function(){
				var self = $(this);
				var value = self.data("value");
				if(value == "undefined" || value == ""){
					value = null;
				}
				self.kendoDropDownList({
					value : value,
					dataValueField : "value",
					dataTextField : "text",
					dataSource : Model.powerPricingWeekDayDataSource,
					change : function(evt){
						var val = evt.sender.value();
						var tr = evt.sender.wrapper.closest("tr");
						var uid = tr.data("uid");
						//data set
						var ds = Widget.powerPricingEditGrid.dataSource;
						var item = ds.getByUid(uid);
						if(item){
							// console.log(val);
							item.dayType = val;
							powerPricingDialog.setActions(1, { disabled : false });
							hasPowerPricingChanged = true;
						}else{
							console.error("item not found by uid");
						}

					}
				});
			});

			element.find(".pricing-edit-month").each(function(){
				var self = $(this);
				var val = self.data("value");
				if(val == "undefined" || val == ""){
					val = null;
				}
				self.kendoDropDownList({
					value : val,
					dataValueField : "value",
					dataTextField : "text",
					dataSource : Model.powerPricingMonthDataSource,
					change : function(evt){
						var value = evt.sender.value();
						var type = evt.sender.element.data("type");
						var tr = evt.sender.wrapper.closest("tr");
						var td = evt.sender.wrapper.closest("td");
						var uid = tr.data("uid");
						//data set
						var ds = Widget.powerPricingEditGrid.dataSource;
						var item = ds.getByUid(uid);

						var dayDropDownList, dayValue, hasValue, dayList, monthDays, monthDs, i, max;
						if(item){
							// console.log(value);
							var date, split;
							if(type == "start"){
								dayDropDownList = td.find(".pricing-edit-day[data-type='start']").data("kendoDropDownList");
								date = item.startDate;
								split = date.split("-");
								date = value + "-" + split[1];
								if(compareDate(date, item.endDate)){
									item.startDate = date;
									hasPowerPricingChanged = true;
									monthDays = moment(value, "MM").daysInMonth();
									dayList = Model.createDayDataSource(monthDays);
									dayValue = dayDropDownList.value();
									hasValue = false;
									max = dayList.length;
									for ( i = 0; i < max; i++ ){
										if(dayList[i].value == dayValue){
											hasValue = true;
											break;
										}
									}
									if(!hasValue){
										dayValue = dayList[dayList.length - 1].value;
										dayDropDownList.value(dayValue);
										date = value + "-" + dayValue;
										item.startDate = date;
									}
									monthDs = new kendo.data.DataSource({
										data : dayList
									});
									monthDs.read();
									dayDropDownList.setDataSource(monthDs);
								}else{
									msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_INVALID_DATE"));
									msgDialog.open();
									evt.sender.value(split[0]);
								}

							}else{
								dayDropDownList = td.find(".pricing-edit-day[data-type='end']").data("kendoDropDownList");
								date = item.endDate;
								split = date.split("-");
								date = value + "-" + split[1];
								if(compareDate(item.startDate, date)){
									item.endDate = date;
									hasPowerPricingChanged = true;
									monthDays = moment(value, "MM").daysInMonth();
									dayList = Model.createDayDataSource(monthDays);
									dayValue = dayDropDownList.value();
									hasValue = false;
									max = dayList.length;
									for ( i = 0; i < max; i++ ){
										if(dayList[i].value == dayValue){
											hasValue = true;
											break;
										}
									}
									if(!hasValue){
										dayValue = dayList[dayList.length - 1].value;
										dayDropDownList.value(dayValue);
										date = value + "-" + dayValue;
										item.endDate = date;
									}
									monthDs = new kendo.data.DataSource({
										data : dayList
									});
									monthDs.read();
									dayDropDownList.setDataSource(monthDs);
								}else{
									msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_INVALID_DATE"));
									msgDialog.open();
									evt.sender.value(split[0]);
								}
							}
							powerPricingDialog.setActions(1, { disabled : false });
						}else{
							console.error("item not found by uid");
						}
						//get type from data-type start or end
					}
				});
			});

			element.find(".pricing-edit-day").each(function(){
				var self = $(this);
				var td = self.closest("td");
				var monthDropDownList = td.find(".pricing-edit-month[data-role='dropdownlist']").data("kendoDropDownList");
				var val = self.data("value");
				if(val == "undefined" || val == ""){
					val = null;
				}

				var monthValue = monthDropDownList.value();

				var dayList = Model.powerPricingDayDataSource;
				if(monthValue){
					var monthDays = moment(monthValue, "MM").daysInMonth();
					dayList = Model.createDayDataSource(monthDays);
				}
				self.kendoDropDownList({
					value : val,
					dataValueField : "value",
					dataTextField : "text",
					dataSource : dayList,
					change : function(evt){
						var value = evt.sender.value();
						var type = evt.sender.element.data("type");
						var tr = evt.sender.wrapper.closest("tr");
						var uid = tr.data("uid");
						//data set
						var ds = Widget.powerPricingEditGrid.dataSource;
						var item = ds.getByUid(uid);
						// console.log(value);
						if(item){
							var date, split;
							if(type == "start"){
								date = item.startDate;
								split = date.split("-");
								date = split[0] + "-" + value;
								if(compareDate(date, item.endDate)){
									item.startDate = date;
									hasPowerPricingChanged = true;
								}else{
									msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_INVALID_DATE"));
									msgDialog.open();
									evt.sender.value(split[1]);
								}
							}else{
								date = item.endDate;
								split = date.split("-");
								date = split[0] + "-" + value;
								if(compareDate(item.startDate, date)){
									item.endDate = date;
									hasPowerPricingChanged = true;
								}else{
									msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_INVALID_DATE"));
									msgDialog.open();
									evt.sender.value(split[1]);
								}
							}
							powerPricingDialog.setActions(1, { disabled : false });
						}else{
							console.error("item not found by uid");
						}
					}
				});
			});
		});

		//Hourly Level Change Evt
		Widget.powerPricingEditGrid.element.on("change", ".power-pricing-hourly-level.edit", function(e){
			checkMinMaxEvt.call(this, e);
		});

		Widget.powerPricingEditGrid.element.on("input", ".power-pricing-hourly-level.edit", function(e){
			if(checkCharacterEvt.call(this, e)){
				hasPowerPricingChanged = true;
			}
		});

		//Hourly Level Focusout Evt
		Widget.powerPricingEditGrid.element.on("focusout", ".power-pricing-hourly-level.edit", function(e){
			checkMinMaxEvt.call(this, e);
		});

		//Base Rate, Level Rate
		//data-min, data-max, data-format, data-decimals, data-level, data-value
		Widget.powerPricingEditGrid.element.on("change", ".pricing-edit-rate", function(e){
			checkMinMaxEvt.call(this, e);
		});

		Widget.powerPricingEditGrid.element.on("input", ".pricing-edit-rate", function(e){
			if(checkCharacterEvt.call(this, e)){
				hasPowerPricingChanged = true;
			}
		});

		Widget.powerPricingEditGrid.element.on("focusout", ".pricing-edit-rate", function(e){
			checkMinMaxEvt.call(this, e);
		});

		powerPricingNameField.on("keyup", function(){
			var listDs = Widget.powerPricingEditGrid.dataSource;
			if(listDs.total() > 0){
				powerPricingDialog.setActions(1, { disabled : false });
			}
		});

		powerPricingNameField.on("change", function(){
			hasPowerPricingChanged = true;
		});


		PowerPricingViewModel.dropDownList.set("change", function(e){
			// console.log("change dropdownlist");
			// console.log(e);
			// I18N.prop("SETTINGS_ALGORITHM_NO_POWER_PRICING")
			var currentPowerPricingText = PrcViewModel.get("powerPricingText");
			var dropDownList = this.dropDownList;
			var value = dropDownList.get("value");

			if(value){
				// 현재 적용되어 있는 요금제와 DropDownList에서 선택한 요금제를 비교한다.
				if (value.name == currentPowerPricingText) {  // 현재 요금제와 선택한 요금제가 같은 경우
					this.set('isDisableDeleteBtn', true); // 요금제 삭제버튼 비활성화
					this.set('isChangedDropDownList', false); // 요금제 변경 상태 저장
					powerPricingDialog.setActions(0, { text: I18N.prop("COMMON_BTN_CLOSE") }); // 닫기 버튼 텍스트 변경
				} else { // 현재 요금제와 선택한 요금제가 다른 경우
					this.set('isDisableDeleteBtn', false); // 요금제 삭제버튼 활성화
					this.set('isChangedDropDownList', true); // 요금제 변경 상태 저장
					powerPricingDialog.setActions(0, { text: I18N.prop("COMMON_BTN_APPLY") }); // 닫기 버튼 텍스트 변경
				}
				var list = value.list;
				list.sort(function(a, b){
					var sd = a.startDate ? a.startDate : "-";
					var ed = b.startDate ? b.startDate : "-";
					return sd.localeCompare(ed);
				});
				var ds = new kendo.data.DataSource({
					data : list
				});
				Widget.powerPricingGrid.setDataSource(ds);
			}
		});

		//요금제 팝업 Close Button
		powerPricingDialog.setActions(0, { action : powerPricingCloseBtnEvt });
		powerPricingDialog.setCloseAction(powerPricingCloseBtnEvt);

		//요금제 팝업 세이브 버튼
		powerPricingDialog.setActions(1, { action : function(){
			var isEdit = PowerPricingViewModel.get("isEdit");
			var isAdd = PowerPricingViewModel.get("isAdd");
			var validator = powerPricingNameField.data("kendoCommonValidator");
			var isValid = validator.validate();

			//이름 유효성 체크
			if(!isValid){
				return false;
			}

			if(isEdit){
				var dropDown = PowerPricingViewModel.get("dropDownList");
				var pricingName = powerPricingNameField.val();
				var dropDownDs = dropDown.get("dataSource");
				var listDs = Widget.powerPricingEditGrid.dataSource;
				var data = listDs.data();

				//Power Pricing 조건 체크
				//시간제 요금에서 3이 반드시 포함되어야함.
				//삭제됨. 08/11
				//var hasHourlyLevel3 = false;
				//var hasHourlyLevel2 = false;
				//var hasHourlyLevel1 = false;
				//최초 날짜는 1/1
				var hasStartDate = false;
				//최종 날짜는 12/31 로 설정되어야함.
				var hasEndDate = false;

				data = data.toJSON();
				var /*division, key,*/itr, lng = data.length;
				var split, d, m, month, day, startDates = [], endDates = [], dayTypes = [];

				for( itr = 0; itr < lng; itr++){
					if(typeof data[itr].isCreated !== 'undefined'){
						delete data[itr].isCreated;
					}
					// division = data[itr].powerDivision;
					//시작일과 종료일이 존재하는지 체크
					if(data[itr].startDate == "01-01"){
						hasStartDate = true;
					}
					split = data[itr].startDate.split("-");
					month = split[0]; day = split[1];
					d = new Date(); d.setMonth(Number(month) - 1); d.setDate(day);
					m = moment(d); startDates.push(m);

					if(data[itr].endDate == "12-31"){
						hasEndDate = true;
					}
					split = data[itr].endDate.split("-");
					month = split[0]; day = split[1];
					d = new Date(); d.setMonth(Number(month) - 1); d.setDate(day);
					m = moment(d); endDates.push(m);

					dayTypes.push(data[itr].dayType);
				}

				//중복 날짜 체크
				//시작일, 종료일이 다른 시작일 종료일 사이에 포함되어있으면 날짜는 중복된 것임.
				var j, size, sd, ed, tsd, ted, days = 0;
				var dayType, targetDayType;
				var dayList, targetDayList;
				size = startDates.length;
				for( itr = 0; itr < size; itr++ ){
					sd = startDates[itr];
					ed = endDates[itr];
					dayType = dayTypes[itr];
					dayList = getDayList(sd, ed, dayType);

					for( j = 0; j < size; j++ ){
						tsd = startDates[j];
						ted = endDates[j];
						targetDayType = dayTypes[j];
						if(sd === tsd && ed === ted && dayType === targetDayType){
							continue;
						}

						targetDayList = getDayList(tsd, ted, targetDayType);

						if(hasDuplicateInDayList(dayList, targetDayList)){
							msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_DUPLICATE_DATE"));
							msgDialog.open();
							return false;
						}
						/*if(tsd.isBetween(sd, ed, null, '[]') || ted.isBetween(sd, ed, null, '[]')){
							msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_DUPLICATE_DATE"));
							msgDialog.open();
							return false;
						}*/
					}
					//days += (ed.diff(sd, 'days')+1);
					days += dayList.length;
				}
				// console.log(dayList);
				// console.log("days num : "+days);
				//1년 날짜가 모두 있어야한다.
				//중복된 날짜가 없을 경우 모든 날짜 일 수의 합은 365일 이상이어야한다.
				if(days < 730){
					msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_MISSING_DATE"));
					msgDialog.open();
					return false;
				}

				if(!hasStartDate || !hasEndDate){
					msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_REQUIRED_DATE"));
					msgDialog.open();
					return false;
				}

				var requestObj = { name : pricingName, list : data };
				Loading.open(powerPricingDialog.element);
				var reqAjax;
				if(isAdd){
					//Post, 생성
					requestObj.enable = false;
					reqAjax = $.ajax({
						url : "/algorithm/sac/powerDivision",
						method : "POST",
						data : requestObj
					}).done(function(){
						msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_POWER_PRICING_CREATE_RESULT"));
						msgDialog.open();
					});

				}else{
					//Patch, 수정
					var pricingId = dropDown.get("value");
					if(pricingId instanceof kendo.data.ObservableObject){
						pricingId = pricingId.id;
					}
					var i, max = dropDownDs.length;
					for( i = 0; i < max; i++ ){
						if(dropDownDs[i].id == pricingId){
							requestObj.enable = dropDownDs[i].enable;
							break;
						}
					}
					reqAjax = $.ajax({
						url : "/algorithm/sac/powerDivision/" + pricingId,
						method : "PATCH",
						data : requestObj
					}).done(function(){
						msgDialog.message(I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"));
						msgDialog.open();
					});
				}

				reqAjax.done(function(){
					$.ajax({url : "/algorithm/sac/powerDivision" }).done(function(pricingData){
						setPowerPricingData(pricingData);
					}).fail(function(){
						setPowerPricingData(Model.powerPricingMockData);
					}).always(function(){
						powerPricingCloseBtnEvt(null, null, true);
						Loading.close();
					});
				}).fail(function(xhq){
					var msg = Util.parseFailResponse(xhq);
					msgDialog.message(msg);
					msgDialog.open();
					Loading.close();
				});
			}
			return false;
		}});
	};

	/*var refreshHeaderRadio = function(){
		var checkedData = indoorListGrid.getCheckedData();
		var i, max = checkedData.length;
		//전부 동일한 경우 -> 체크 및 모드에 따라 comfort option 체크
		//전부 동일하지 않은 경우 -> 체크 해제 및 comfort option 비활성화
		var item;
		var isComfort = true, isPrc = true,

		for( i = 0; i < max; i++ ){
			item = checkedData[i];

		}
	};*/

	var isSameCurrentPriceAndSelectedPrice = function () {
		var currentPowerPricingText = PrcViewModel.get("powerPricingText");
		var dropDownList = PowerPricingViewModel.get('dropDownList'),
			ds = dropDownList.dataSource,
			dropDownListValue = dropDownList.value;

		if (typeof dropDownListValue == 'undefined' || dropDownListValue === null) return false;
		if (ds.length < 1) return false;

		var i = 0, max = ds.length, dsItem = null;
		var targetValue = (dropDownListValue instanceof kendo.data.ObservableObject) ? dropDownListValue.id : dropDownListValue;
		for (i = 0; i < max; i++) {
			dsItem = ds[i];
			if (dsItem.id == targetValue) {
				break;
			}
		}
		return (currentPowerPricingText == dsItem.name);
	};

	// Close 버튼 및 상단 Delete 버튼 텍스트 변경
	var setBtnTextInPricePopup = function () {
		if (!isSameCurrentPriceAndSelectedPrice()) { // 요금제가 변경된 경우
			PowerPricingViewModel.set('isDisableDeleteBtn', false);
			powerPricingDialog.setActions(0, { text: I18N.prop("COMMON_BTN_APPLY") }); // 닫기 버튼 텍스트 변경
		} else { // 요금제가 변경되지 않은 경우
			PowerPricingViewModel.set('isDisableDeleteBtn', true);
			powerPricingDialog.setActions(0, { text: I18N.prop("COMMON_BTN_CLOSE") }); // 닫기 버튼 텍스트 변경
		}
	};

	/**
	*   <ul>
	*   <li>요금제 생성 시, 중복된 날짜가 있는지 체크한다.</li>
	*   </ul>
	*   @function hasDuplicateInDayList
	*   @param {Array} dayList - 일 정보 리스트
	*   @param {Array} targetDayList - 비교할 일 정보 리스트
	*   @returns {Boolean} - 중복 여부
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var hasDuplicateInDayList = function(dayList, targetDayList){
		var i, j, max = dayList.length, size = targetDayList.length;
		var day, tDay, dayType, dayObj, tDayObj, tDayType;
		for( i = 0; i < max; i++ ){
			dayObj = dayList[i];
			day = dayObj.date;
			dayType = dayObj.dayType;
			for( j = 0; j < size; j++ ){
				tDayObj = targetDayList[j];
				tDay = tDayObj.date;
				tDayType = tDayObj.dayType;

				// if(day.isSame(tDay) && dayType == tDayType){
				// if(day.isSame(tDay, 'day') && dayType == tDayType){
				if((day.format('MMDD') == tDay.format('MMDD')) && dayType == tDayType){
					return true;
				}
			}
		}
		return false;
	};

	var getDayList = function(startDate, endDate, dayType){
		var dayList = [];
		var diffDays = endDate.diff(startDate, "days");
		dayList = [];
		var startDay = startDate.date();
		var i, date, /*day,*/ obj;
		for( i = startDay; i <= startDay + diffDays; i++ ){
			date = moment(startDate).date(i);
			//day = date.day();

			if(dayType == "all"){
				obj = {
					date : date,
					dayType : "weekend"
				};
				dayList.push(obj);
				obj = {
					date : date,
					dayType : "weekday"
				};
				dayList.push(obj);
			}else{
				obj = {
					date : date,
					dayType : dayType
				};
				dayList.push(obj);
			}

			/*//주말 타입인데 주말이 아닌 경우 Pass
			if(dayType == "weekend" && (day != 0 && day != 6)){
				continue;
			}

			//주중 타입인데 주중이 아닌 경우 Pass
			if(dayType == "weekday" && (day == 0 || day == 6)){
				continue;
			}*/

			//console.log("push date");
			//console.log(date.format("YYYY/MM/DD"));
		}
		return dayList;
	};

	/**
	*   <ul>
	*   <li>쾌적제어 예외 시간 중 유효하지 않은 시간이 있는지 체크한다.</li>
	*   </ul>
	*   @function isInvalidTime
	*   @param {Object} time - 시작 시간, 종료 시간 절ㅇ보 객체
	*   @returns {Boolean} - 유효하지 않은지에 대한 여부
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var isInvalidTime = function(time){
		var a = time.start_time;
		var b = time.end_time;
		a = moment(a);
		b = moment(b);
		//같을 수도 없다.
		if(b.isSameOrBefore(a, "minute")){
			return true;
		}

		//종료 시간이 24시 00분을 넘을 수 없다.
		var tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0);
		tomorrow.setMinutes(0);
		tomorrow = moment(tomorrow);
		//console.log(a);
		//console.log(b);
		//console.log(tomorrow);
		if(b.isSame(tomorrow, "day") && b.isAfter(tomorrow, "minute")){
			return true;
		}

		return false;
	};

	//Comfort View의 Except Times 중복 체크
	/**
	*   <ul>
	*   <li>쾌적제어 예외 시간 중 중복된 시간이 있는지 체크한다.</li>
	*   </ul>
	*   @function hasDuplicateExceptTimes
	*   @param {Object} except_times - 예외 시작 시간, 종료 시간 정보 리스트
	*   @returns {Boolean} - 중복 여부
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var hasDuplicateExceptTimes = function(except_times){
		var i, j, max = except_times.length;
		var start_time, end_time;
		var tst, tet;

		//서버 Req/Res에 받는 데이터는 String이지만, ViewModel에 들고있는 것은 Date 객체이다.
		for( i = 0; i < max; i++ ){
			start_time = except_times[i].start_time;
			start_time = moment(start_time);
			end_time = except_times[i].end_time;
			end_time = moment(end_time);
			for( j = 0; j < max; j++ ){
				tst = except_times[j].start_time;
				tet = except_times[j].end_time;
				if(start_time === tst && end_time === tet){
					continue;
				}
				tst = moment(tst);
				tet = moment(tet);
				if(tst.isBetween(start_time, end_time, null, "()")
				   || tet.isBetween(start_time, end_time, null, "()")){
					return true;
				}
			}
		}
		return false;
	};


	var compareDate = function(s, e){
		var split = s.split("-");
		var sMonth = Number(split[0]);
		var sDay = Number(split[1]);

		split = e.split("-");
		var eMonth = Number(split[0]);
		var eDay = Number(split[1]);

		if(sMonth > eMonth){
			return false;
		}else if(sMonth == eMonth){
			if(sDay > eDay){
				return false;
			}
		}
		return true;
	};
	/**
	*   <ul>
	*   <li>요금제 생성/편집 팝업을 닫을 때, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function powerPricingCloseBtnEvt
	*   @param {Object} e - 팝업을 닫을 때, 전달되는 Event 객체
	*   @param {Object} jQueryEvt - 팝업을 닫을 때, 전달되는 jquery Event 객체
	*   @param {Boolean} isSave - 저장 여부
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var powerPricingCloseBtnEvt = function(e, jQueryEvt, isSave){
		// console.log("click btn 0");
		//편집 모드에서 닫기 버튼 이벤트 (취소 이벤트)
		if(PowerPricingViewModel.get("isEdit")){
			if(hasPowerPricingChanged && !isSave){
				confirmDialog.message(I18N.prop("COMMON_MESSAGE_CONFIRM_CANCEL"));
				confirmDialog.setConfirmActions({
					yes : function(){
						PowerPricingViewModel.set("isEdit", false);
						PowerPricingViewModel.set("isAdd", false);
						//Widget.powerPricingEditGrid.dataSource.cancelChanges();
						//Save 버튼 Hide
						powerPricingDialog.setActions(1, { visible : false });
						//Close 버튼 텍스트 변경
						setBtnTextInPricePopup();
						hasPowerPricingChanged = false;
					}
				});
				confirmDialog.open();
			}else{
				PowerPricingViewModel.set("isEdit", false);
				PowerPricingViewModel.set("isAdd", false);

				//Save 버튼 Hide
				powerPricingDialog.setActions(1, { visible : false });

				//Close 버튼 텍스트 변경
				setBtnTextInPricePopup();
			}
		}else{  //조회 모드에서 닫기 버튼 이벤트
			var dropDown = PowerPricingViewModel.get("dropDownList");
			var dropDownDs = dropDown.get("dataSource");
			var value = dropDown.get("value");
			if(!value){
				PrcViewModel.set("powerPricingText", I18N.prop("SETTINGS_ALGORITHM_NO_POWER_PRICING"));
				powerPricingDialog.close();
				return;
			}
			if(value instanceof kendo.data.ObservableObject){
				value = value.id;
			}
			//드롭다운리스트에서 선택 된 요금제를 enable로 Patch한다.
			Loading.open(powerPricingDialog.element);
			$.ajax({
				url : "/algorithm/sac/powerDivision/" + value,
				method : "PATCH",
				data : {
					enable : true
				}
			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				//PRC 탭 텍스트 업데이트
				var i, item, max = dropDownDs.length;
				for( i = 0; i < max; i++ ){
					if(dropDownDs[i].id == value){
						item = dropDownDs[i];
						PrcViewModel.set("powerPricingText", item.name);
						break;
					}
				}
				Loading.close();
				powerPricingDialog.close();
			});
		}
		return false;
	};
	/**
	*   <ul>
	*   <li>요금제 생성/편집 시, 요금제 레벨 입력 필드 입력할 때 호출되는 Callback 이벤트로 입력 값에 대한 MIN MAX를 유효성 체크한다.</li>
	*   </ul>
	*   @function checkMinMaxEvt
	*   @param {Object} e - 필드 입력 시 호출되는 callback의 이벤트 객체
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var checkMinMaxEvt = function(e){
		var self = $(this);
		var max = self.data("max");
		var min = self.data("min");
		var value = self.val();
		var tr = self.closest("tr");
		var key = self.data("key");
		var uid = tr.data("uid");
		var ds = Widget.powerPricingEditGrid.dataSource;
		var item = ds.getByUid(uid);

		var beforeValue = 0;
		if(key.indexOf("Rate") == -1){
			beforeValue = item.powerDivision[key];
		}else{
			beforeValue = item[key];
		}

		if(typeof value === 'undefined' || value == ""){
			self.val(beforeValue);
			msgDialog.message(I18N.prop("COMMON_REQUIRED_INFORMATION"));
			msgDialog.open();
		}else{
			value = Number(value);
			if(max < value || min > value){
				self.val(beforeValue);
				var msg;
				if(self.hasClass("pricing-edit-rate")){
					if(self.hasClass("base")){
						msg = I18N.prop("SETTINGS_ALGORITHM_REQUIRED_BASE_RATE");
					}else{
						msg = I18N.prop("SETTINGS_ALGORITHM_REQUIRED_LEVEL_RATE");
					}
				}else{
					msg = I18N.prop("SETTINGS_ALGORITHM_REQUIRED_LEVEL3");
				}
				msgDialog.message(msg);
				msgDialog.open();
				return false;
			}
		}

		if(item){
			if(key.indexOf("Rate") == -1){
				item.powerDivision[key] = value;
				hasPowerPricingChanged = true;
			}else{
				item[key] = value;
			}
			powerPricingDialog.setActions(1, { disabled : false });
		}else{
			console.error("not found item by uid");
		}
	};
	/**
	*   <ul>
	*   <li>요금제 생성/편집 시, 요금제 레벨 입력 필드 입력할 때 호출되는 Callback 이벤트로 입력 값에 대한 유효성 체크를 한다.</li>
	*   </ul>
	*   @function checkCharacterEvt
	*   @param {Object} e - 필드 입력 시 호출되는 callback의 이벤트 객체
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var checkCharacterEvt = function(e){
		var self = $(this);
		var selfKey = self.data("key");
		var allowChar = /^[1-9]+$/;

		if(selfKey.indexOf("Rate") > -1) allowChar = /^\d+\.?\d*$/;
		var value = self.val();
		if(value != "" && !value.match(allowChar)){
			var tr = self.closest("tr");
			var key = self.data("key");
			var uid = tr.data("uid");
			var ds = Widget.powerPricingEditGrid.dataSource;
			var item = ds.getByUid(uid);
			var beforeValue = 0;
			if(item){
				if(key.indexOf("Rate") == -1){
					beforeValue = item.powerDivision[key];
				}else{
					beforeValue = item[key];
				}
			}

			self.val(beforeValue);
			msgDialog.message(I18N.prop("COMMON_INVALID_CHARACTER"));
			msgDialog.open();
			return false;
		}
		return true;
	};
	/**
	*   <ul>
	*   <li>기기 리스트 뷰에서 기기 정보 체크 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function checkedChangeEvt
	*   @param {Object} e - 체크 이벤트 발생 시 전달되는 이벤트 객체
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var checkedChangeEvt = function(e){
		var footer = e.sender.element.find(".k-grid-footer");
		var isForce = e.isForce;
		// var selectedTextCell = footer.find(".algorithm-device-selected");
		var footerRadio = footer.find("input[type='radio']");
		var footerRadioModel = indoorListGrid.footerRadios;
		var items = getCheckedItems();
		var selectedNum = items.length;

		//체크 상태에 따라 radio 버튼들의 활성화/비활성화하도록 한다.
		// console.log(e);
		if(!e.isHeader && e.item){
			var checked = e.item.checked ? false : true;
			var checkbox = e.checkbox;
			var tr = checkbox.closest("tr");
			if(e.item.algorithm_type == "Comfort"){
				tr.find("input[type='radio']").prop("disabled", checked);
			}else{
				//Algorithm 타입이 Comfort가 아닌 경우에는 Comfort Option 라디오는 활성화 하지 않는다.
				tr.find("input.type-radio[type='radio']").prop("disabled", checked);
			}
		}

		//체크한 디바이스에 따라 최상단 라디오 버튼을 업데이트한다.
		if(selectedNum == 0){
			footerRadio.each(function(){
				var self = $(this);
				var id = self.attr("id");
				//뷰 업데이트
				self.prop("disabled", true);
				//모델 업데이트
				footerRadioModel[id].disabled = true;
			});
		}else{
			//전부 동일한 경우 -> 체크 및 모드에 따라 comfort option 체크
			//전부 동일하지 않은 경우 -> 체크 해제 및 comfort option 비활성화
			var i, isOnlyComfort = true, isOnlyPRC = true;
			var comfortOption = {
				isOnlyNormal: true,
				isOnlyComfort: true,
				isOnlyVeryComfort: true
			};
			for( i = 0; i < selectedNum; i++ ){
				if(items[i].algorithm_type != "Comfort"){
					isOnlyComfort = false;
				}
				if(items[i].algorithm_type != "PRC"){
					isOnlyPRC = false;
				}
				if(items[i].comfort_option != "Normal"){
					comfortOption.isOnlyNormal = false;
				}
				if(items[i].comfort_option != "Comfort"){
					comfortOption.isOnlyComfort = false;
				}
				if(items[i].comfort_option != "VeryComfort"){
					comfortOption.isOnlyVeryComfort = false;
				}
			}

			if(isOnlyComfort){
				footer.find("#comfort-all").prop("checked", true);
				footer.find("#prc-all").prop("checked", false);
			}else if(isOnlyPRC){
				footer.find("#prc-all").prop("checked", true);
				footer.find("#comfort-all").prop("checked", false);
			}else{
				footer.find("#prc-all").prop("checked", false);
				footer.find("#comfort-all").prop("checked", false);
			}

			if(comfortOption.isOnlyNormal){
				footer.find("#normal-all").prop("checked", true);
				footer.find("#comfort-option-comfort-all").prop("checked", false);
				footer.find("#comfort-very-all").prop("checked", false);
			}else if(comfortOption.isOnlyComfort){
				footer.find("#normal-all").prop("checked", false);
				footer.find("#comfort-option-comfort-all").prop("checked", true);
				footer.find("#comfort-very-all").prop("checked", false);
			}else if(comfortOption.isOnlyVeryComfort){
				footer.find("#normal-all").prop("checked", false);
				footer.find("#comfort-option-comfort-all").prop("checked", false);
				footer.find("#comfort-very-all").prop("checked", true);
			}else{
				footer.find("#normal-all").prop("checked", false);
				footer.find("#comfort-option-comfort-all").prop("checked", false);
				footer.find("#comfort-very-all").prop("checked", false);
			}

			//Comfort Mode가 체크되어있을 경우
			var isComfort = footer.find("#comfort-all").prop("checked");
			footerRadio.each(function(){
				var self = $(this);
				var isComfortOption = self.hasClass("comfort-option-radio");
				var id = self.attr("id");
				if(!isComfort && isComfortOption){
					self.prop("disabled", true);
					footerRadioModel[id].disabled = true;
				}else{
					//뷰 업데이트
					self.prop("disabled", false);
					//모델 업데이트
					footerRadioModel[id].disabled = false;
				}
			});
		}
		setSelectedNum(selectedNum);

		//디바이스 설정 값이 변경되었음을 체크
		if(!isForce){
			hasChangedDeviceInfo = true;
		}
	};
	/**
	*   <ul>
	*   <li>선택한 기기 개수에 따라 기기 선택 상태 텍스트를 업데이트한다.</li>
	*   </ul>
	*   @function setSelectedNum
	*   @param {Number}selectedNum - 선택한 기기 개수
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var setSelectedNum = function(selectedNum){
		var text = "";
		if(selectedNum == 0){
			text = I18N.prop("FACILITY_DEVICE_NO_SELECTED");
		}else{
			text = I18N.prop("FACILITY_DEVICE_SELECTED", selectedNum);
		}
		var footer = indoorListGridElem.find(".k-grid-footer");
		var selectedTextCell = footer.find(".algorithm-device-selected");
		selectedTextCell.text(text);
	};
	/**
	*   <ul>
	*   <li>선택한 기기 정보를 가져온다.</li>
	*   </ul>
	*   @function getCheckedItems
	*   @returns {Array} - 선택한 기기 리스트
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var getCheckedItems = function(){
		var checkedItems = [];
		checkedItems = indoorListGrid.getCheckedData();
		return checkedItems;
	};
	/**
	*   <ul>
	*   <li>층 변경 시, 호출되는 콜백 함수. 선택한 빌딩/층에 따라 기기 정보들을 서버로부터 받아와 View를 업데이트한다.</li>
	*   </ul>
	*   @function onFloorChange
	*   @param {Object} floorData - 현재 선택한 빌딩/층에 대한 객체
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var onFloorChange = function(floorData){
		if(hasChangedDeviceInfo){
			confirmDialog.message(I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_SAVE"));
			//변경 사항 저장 여부를 묻는다.
			confirmDialog.setConfirmActions({
				yes : function(){
					hasChangedDeviceInfo = false;
					//저장
					saveBtnEvt();
					onFloorChange(floorData);
				},
				no : function(){
					hasChangedDeviceInfo = false;
					//층 정보에 따라 Refresh 함수를 다시 Call 한다.
					onFloorChange(floorData);
				}
			});
			confirmDialog.open();
			return;
		}
		var q = getFloorQuery();
		Loading.open();

		$.ajax({
			url : "/algorithm/sac/device-setting" + q
		}).done(function(data){
			var dataSource = Model.createDataSource(data);
			var ds = new kendo.data.DataSource({
				data : dataSource,
				pageSize : DEFAULT_PAGE_SIZE
			});
			ds.read();
			indoorListGrid.setDataSource(ds);
			//최초 Manual이 아닌 기기들에 대하여 선택 카운트를 표시하도록 Trigger
			//var checkedData = indoorListGrid.getCheckedData();
			//checkedChangeEvt({ sender : indoorListGrid, isForce : true });

		}).fail(function(){
			var dataSource = Model.createDataSource(Model.MockData);
			var ds = new kendo.data.DataSource({
				data : dataSource
			});
			ds.read();
			indoorListGrid.setDataSource(ds);

		}).always(function(){
			Loading.close();
		});
	};
	/**
	*   <ul>
	*   <li>알고리즘 설정 정보로 View를 업데이트한다.</li>
	*   </ul>
	*   @function setSettingsData
	*   @param {Object} data - 알고리즘 설정 정보 객체
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var setSettingsData = function(data){
		var weather = data.weather_location;
		var country = weather.country;
		var city = weather.city;

		var locationDs = Model.locationDataSource;
		locationDs = locationDs[country] ? locationDs[country] : [];
		// var weatherDs = Model.weatherDataSource;
		console.info(country);
		console.info(city);
		ComfortViewModel.weather.set("value", country);
		ComfortViewModel.location.set("dataSource", locationDs);
		ComfortViewModel.location.set("value", city);

		var facility = data.facility;
		ComfortViewModel.purpose.set("value", facility);

		var date, exceptTimes = data.except_time;
		if(exceptTimes){
			//최초 뷰에 뿌려질 때, 정렬한다.
			exceptTimes.sort(function(a, b){
				a = a.start_time ? a.start_time : "-";
				b = b.start_time ? b.start_time : "-";
				return a.localeCompare(b);
			});
			var i, max = exceptTimes.length;
			var startTime, endTime;
			for( i = 0; i < max; i++ ){
				startTime = exceptTimes[i].start_time;
				endTime = exceptTimes[i].end_time;
				startTime = startTime.split(":");
				endTime = endTime.split(":");
				date = new Date();
				date.setHours(startTime[0]);
				date.setMinutes(startTime[1]);
				date.setSeconds(0);
				exceptTimes[i].start_time = date;
				date = new Date();
				date.setHours(endTime[0]);
				date.setMinutes(endTime[1]);
				date.setSeconds(0);
				//End Time의 00시 일 경우
				if(endTime[0] == "00"){
					date.setDate(date.getDate() + 1);
				}
				exceptTimes[i].end_time = date;
			}
			if(max > 0){
				ComfortViewModel.set("except_times", exceptTimes);
				ComfortViewModel.set("isExceptionTime", true);
			}else{
				ComfortViewModel.set("isExceptionTime", false);
			}
		}else{
			ComfortViewModel.set("isExceptionTime", false);
		}

		var optimalStartTime = data.optimal_start_time;
		OptimalViewModel.optimalTime.set("value", optimalStartTime);

		//PRC View
		var prcEnabled = typeof data.prc_enabled === 'undefined' ? false : data.prc_enabled;
		PrcViewModel.set("enabled", prcEnabled);
		var savingLevel = data.prc_saving_level;
		if(savingLevel){
			savingLevel = savingLevel.replace("Level", "");
			savingLevel = Number(savingLevel) - 1;
			PrcViewModel.savingLevelBtns[savingLevel].click.call(PrcViewModel);
		}
	};
	/**
	*   <ul>
	*   <li>요금제 설정 정보를 요금제 설정 리스트 뷰와 요금제 생성/편집 팝업 View에 업데이트한다.</li>
	*   </ul>
	*   @function setPowerPricingData
	*   @param {Object} data - 요금제 설정 정보
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var setPowerPricingData = function(data){
		if(data.length < 1){
			PowerPricingViewModel.set("isEmpty", true);
			var dts = new kendo.data.DataSource({
				data : []
			});
			Widget.powerPricingGrid.setDataSource(dts);
			Widget.powerPricingEditGrid.setDataSource(dts);
			PowerPricingViewModel.dropDownList.set("value", null);
		}else{
			PowerPricingViewModel.set("isEmpty", false);
		}

		PowerPricingViewModel.dropDownList.set("dataSource", data);
		var i, ds, max = data.length;
		var hasEnable = false;
		var list;
		for( i = 0; i < max; i++){
			if(data[i].enable){
				hasEnable = true;
				PowerPricingViewModel.dropDownList.set("value", data[i].id);
				PrcViewModel.set("powerPricingText", data[i].name);
				list = data[i].list;
				list.sort(function(a, b){
					var sd = a.startDate ? a.startDate : "-";
					var ed = b.startDate ? b.startDate : "-";
					return sd.localeCompare(ed);
				});
				ds = new kendo.data.DataSource({
					data : list
				});
				Widget.powerPricingGrid.setDataSource(ds);
				Widget.powerPricingEditGrid.setDataSource(ds);
				break;
			}
		}
		if(!hasEnable && max > 0){
			PowerPricingViewModel.dropDownList.set("value", data[0].id);
			PrcViewModel.set("powerPricingText", data[0].name);
			list = data[0].list;
			list.sort(function(a, b){
				var sd = a.startDate ? a.startDate : "-";
				var ed = b.startDate ? b.startDate : "-";
				return sd.localeCompare(ed);
			});
			ds = new kendo.data.DataSource({
				data : list
			});
			Widget.powerPricingGrid.setDataSource(ds);
			Widget.powerPricingEditGrid.setDataSource(ds);
		}
	};
	/**
	*   <ul>
	*   <li>요금제 설정 저장 버튼 클릭 시, 호출되는 Callback 함수</li>
	*   </ul>
	*   @function saveBtnEvt
	*   @param {Object} e - 저장버튼 클릭 이벤트 객체
	*   @returns {void}
	*   @alias module:app/devicesetting/controller/sac-algorithm
	*/
	var saveBtnEvt = function(e){
		Loading.open();
		hasChangedDeviceInfo = false;
		var patchDeviceObj = {};
		//var item, items = getCheckedItems();
		//체크되지 않은 데이터는 Algorithm Type을 Manual로 설정하기 위해, 뷰에 보이는 데이터를 모두 가져온다.
		var ds = indoorListGrid.dataSource;
		//var item, items = ds.view();
		var item, items = ds.data();
		var results = [];
		var i, max = items.length;
		for( i = 0; i < max; i++ ){
			item = items[i];
			if(item instanceof kendo.data.ObservableObject){
				item = item.toJSON();
			}
			results.push(item);
			//Check 되지 않은 Device는 Manual로 전송
			if(!results[i].checked){
				results[i].algorithm_type = "Manual";
				items[i].algorithm_type = "Manual";//Grid의 현재 내용을 반영하기 위함.
			}
			delete results[i].checked;
			if(results[i].algorithm_type != "Comfort"){
				delete results[i].comfort_option;
			}
		}
		patchDeviceObj.device_setting_list = results;

		var patchCommonObj = {};
		var country = ComfortViewModel.weather.get("value");
		var city = ComfortViewModel.location.get("value");
		if(city instanceof kendo.data.ObservableObject){
			city = city.value;
		}
		patchCommonObj.weather_location = {
			country : country,
			city : city
		};
		patchCommonObj.facility = ComfortViewModel.purpose.get("value");
		patchCommonObj.except_time = [];

		if(ComfortViewModel.get("isExceptionTime")){
			var startTime, endTime, time, times = ComfortViewModel.except_times;

			if(hasDuplicateExceptTimes(times)){
				//중복된 시간이 존재하는 경우 팝업 메시지를 표시한다.
				msgDialog.message(I18N.prop("SETTINGS_ALGORITHM_DUPLICATE_TIME"));
				msgDialog.open();
				Loading.close();
				return;
			}

			max = times.length;
			for( i = 0; i < max; i++ ){
				time = times[i];
				startTime = time.start_time;
				endTime = time.end_time;
				startTime = moment(startTime).format("HH:mm");
				endTime = moment(endTime).format("HH:mm");

				patchCommonObj.except_time.push({
					start_time : startTime,
					end_time : endTime
				});
			}
		}

		//Optimal Start 뷰
		patchCommonObj.optimal_start_time = OptimalViewModel.optimalTime.get("value");

		//PRC 뷰
		var savingLevelBtns = PrcViewModel.savingLevelBtns;
		var savingLevel, active;
		max = savingLevelBtns.length;
		for( i = 0; i < max; i++ ){
			active = savingLevelBtns[i].get("active");
			if(active){
				savingLevel = "Level" + (i + 1);
				break;
			}
		}
		if(savingLevel){
			patchCommonObj.prc_saving_level = savingLevel;
		}

		var prcEnabled = PrcViewModel.get("enabled");
		patchCommonObj.prc_enabled = prcEnabled;

		var reqArr = [];
		//device settings
		reqArr.push($.ajax({
			url : "/algorithm/sac/device-setting",
			method : "PATCH",
			data : patchDeviceObj
		}));

		//common settings
		reqArr.push($.ajax({
			url : "/algorithm/sac/common-setting",
			method : "PATCH",
			data : patchCommonObj
		}));

		$.when.apply(this, reqArr).done(function(){
			msgDialog.message(I18N.prop("COMMON_MESSAGE_NOTI_CHANGES_SAVED"));
			msgDialog.open();
		}).fail(function(xhq){
			var msg = Util.parseFailResponse(xhq);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			//Device List UI 업데이트
			var newDs = indoorListGrid.dataSource;
			newDs.fetch();
			//상단 라디오 버튼 업데이트를 위함.
			checkedChangeEvt({ sender : indoorListGrid, isForce : true});
			Loading.close();
		});
	};

	return init;
});

//For Debug
//# sourceURL=facility-sac/algorithm.js