/**
	*
	*   <ul>
	*       <li>monitoring 페이지에 관한 페이지</li>
	*       <li>실행시간에 대한 그래프 제공</li>
	*       <li>월, 일에 따른 그래프, 그리드 제공</li>
	*       <li>선택 가능한 디바이스</li>
	*   </ul>
	*   @module app/energy/samsungsac/monitoring
	*   @param {Object} CoreModule- 에너지 core 객체
	*   @param {Object} ViewModel- samsungsac ViewModel 객체
	*   @param {Object} Common- samsungsac Common 객체
	*   @param {Object} Widget- samsungsac Widget 객체
	*   @requires app/energy/core
	*   @requires app/energy/samsungsac/view-model/monitoring-vm
	*   @requires app/energy/samsungsac/common/common
	*   @requires app/energy/samsungsac/common/widget
	*   @returns {Object} 없음
	*/
//monitoring.js
define("energy/samsungsac/monitoring", ["energy/core",
	"energy/samsungsac/view-model/monitoring-vm",
	// "energy/samsungsac/model/monitoring-model",
	// "energy/samsungsac/template/monitoring-template",
	"energy/samsungsac/common/common",
	"energy/samsungsac/common/widget"
], function(CoreModule, ViewModel, Common, Widget) {   // [2018-04-09][파라메타 Target,Template,Model 값을 사용하지않기에 제거]

	var moment = window.moment;
	var kendo = window.kendo;
	// var globalSettings = window.GlobalSettings;								// [2018-04-09][변수 선언후 미사용]
	var LoadingPanel = window.CommonLoadingPanel;
	var Util = window.Util;
	var MainWindow = window.MAIN_WINDOW;
	var I18N = window.I18N;
	var Loading = new LoadingPanel();
	var MainViewModel = ViewModel.MainViewModel,
		Views = ViewModel.Views;
	// var listViewData = $("#monitoring-list-template").html();					// [2018-04-09][변수 선언후 미사용]
	var Router = new kendo.Router();
	var Layout = new kendo.Layout("<div id='monitoring-main-view-content' class='monitoring-main-view-content'></div>");
	// var targetAllData = {},														// [2018-04-09][변수 선언후 미사용]
	  // 	targetAllDataSet = [];														// [2018-04-09][변수 선언후 미사용]
	var TEXT = Common.TEXT;
	// var getFloorQuery = Common.getFloorQuery;		//[2018-04-10][getFloorQuery Common으로 이동시켜 할당 getFloorQuery 함수를 사용하지않기에 주석처리]
	  var getMonthDay = Common.getMonthDay;				//[2018-04-10][getMonthDay Common으로 이동시켜 할당]
	var monitoringView = $("#monitoring-main-view");
	var sacMonitoringTabs, demandMonitoringTab;
	var msgDialog = Widget.msgDialog;
	// confirmDialog = Widget.confirmDialog;										// [2018-04-09][변수 선언후 미사용]

	// var targetData = Model.targetData;											// [2018-04-09][변수 선언후 미사용]
	// var lastYearData = Model.lastYearData;										// [2018-04-09][변수 선언후 미사용]
	// var thisYearData = Model.thisYearData;										// [2018-04-09][변수 선언후 미사용]
	// var deviceGroupData = '';													// [2018-04-09][변수 선언후 사용되는 구문이 있지만 할당받은 해당 변수가 사용되지않음 또한 중복선언]
	// var deviceTypeData = [];														// [2018-04-09][변수 선언후 미사용]
	var	deviceType;
	// var targetPostList = [],														// [2018-04-09][변수 선언후 미사용]
	// 	targetPatchList = [];														// [2018-04-09][변수 선언후 미사용]
	// var ReductionData;															// [2018-04-09][변수 선언후 미사용]
	var runTimeData = null;
	// var categoryEvent = '';														// [2018-04-09][변수 선언후 미사용]
	//주기적 호출 함수
	var refreshRuntime, refreshRuntimeCycle = 60000;
	var refreshDay, refreshDayCycle = 900000;

	//현재 버튼 active 초기화
	var state = "Runtime";//전역으로 쥐고 있는 현재 버튼 상태
	// var weekCheckList = {														// [2018-04-09][변수 선언후 미사용]
	// 		'Mon':TEXT.ENERGY_DATE_MON,
	// 		'Tue':TEXT.ENERGY_DATE_TUE,
	// 		'Wed':TEXT.ENERGY_DATE_WED,
	// 		'Thu':TEXT.ENERGY_DATE_THU,
	// 		'Fri':TEXT.ENERGY_DATE_FRI,
	// 		'Sat':TEXT.ENERGY_DATE_SAT,
	// 		'Sun':TEXT.ENERGY_DATE_SUN
	// };
	//범례
	  // var divGraphLegend = $(".monitoring-content").find(".monitoring-chart-legend");		// [2018-04-09][변수 선언후 미사용]

	//PeakLevel - Color
	var peakLevelColorDef = {
		"0": "#afaeae",
		"1": "#1aa05a",
		"2": "#fbb248",
		"3": "#ee5151"
	};
	var gridHeightData, chartHeightData;					//[2018-05-24][ 공통 화면 구성 정의 추가로 인한 높이값 고정으로 인한 이슈발생 이를 대체하기위해 변수추가]

	//Day Array
	// var dayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];			// [2018-04-09][변수 선언후 미사용]
	var sacMonitoringTab;
	/**
	 *
	 *   operating history 페이지 진입시 기본 셋팅을 해주는 함수
	 *
	 *   @function init
	 *   @param {Object} tab - 현재 탭에 대한 정보
	 *   @returns {Object} Deferred 객체
	 *   @alias 없음
	 *
	 */
	var init = function(tab) {//SAC 모니터링 탭 kendoCommonTabStrip 인스턴스를 인자로 받는다.
		var dfd = new $.Deferred();

		sacMonitoringTab = tab; // 넘겨받은 SAC 모니터링 commonTabStrip 인스턴스

		initComponent();//Do nothing

		var element = sacMonitoringTab.contentElement(1); // 디맨드 모니터링 탭 요소

		// monitoring-vm의 MainViewModel: monitoring-vm.MainViewModel 기반으로 바인딩
		kendo.bind($(element), MainViewModel);

		//설치된 기기 데이터만 로드
		Loading.open();
		$.ajax({
			url: '/dms/devices?types=AirConditionerController.DMS,AirConditionerController.WirelessDDC&registrationStatuses=Registered'
		}).done(function(data) {
			for (var i = 0; i < data.length; i++) {
				if(data[i].airConditioner && data[i].airConditioner.peakInterfaceModuleConnected){//해당조건 만족시에만.
					MainViewModel.filters[0].options.dataSource.push({
						text: data[i]['name'],//기기 name
						value: String(data[i]['id']) //기기 id
					});
				}
			}

			//설치된 기기를 바탕으로 가장 첫 기기의 demandMonitoring 데이터 로드 - 디폴트: 실행시간(Runtime)
			deviceType = $("#group-list-demand").data("kendoDropDownList").value();//기기 id
			$.ajax({
				url: '/energy/sac/demandMonitoring/runtime?dms_device_id=' + deviceType
			}).done(function(ajaxResponseData1) {
				// console.log("LOAD DEMAND MONITORING DATA OF DEVICE");			// [2018-04-09][콘솔 주석]
				if (ajaxResponseData1) {
					runTimeData = ajaxResponseData1;

					//디맨드 모니터링 탭 클릭 시 주기적으로 데이터를 refresh 하는 interval 함수 등록
					sacMonitoringTabs = $("#operating-common-tab").find(".k-tabstrip-items");
					demandMonitoringTab = $("#operating-common-tab").find(".k-tabstrip-items").find("[aria-controls=operating-common-tab-2]").find(".k-link");
					demandMonitoringTab.on("click", function() {
						//Runtime Refresh
						refreshRuntime = setInterval(function() {
							// console.log("RunTime REFRESH!!");					// [2018-04-09][콘솔 주석]
							refreshData();
						}, refreshRuntimeCycle);
					});
				} else {
					runTimeData = null;
				}
			}).fail(function(ajaxResponseData2) {
				runTimeData = null;
				var msg = Util.parseFailResponse(ajaxResponseData2);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function() {
				//디맨드 모니터링 탭 요소
				sacMonitoringTabs = $("#operating-common-tab").find(".k-tabstrip-items");
				demandMonitoringTab = $("#operating-common-tab").find(".k-tabstrip-items").find("[aria-controls=operating-common-tab-2]").find(".k-link");

				createView(runTimeData);
				attachEvent();

				//디맨드 모니터링 탭 초기 뷰는 runtime 버튼 활성화 된 상황인데, 이때는 그래프 뷰만 존재. 따라서 뷰 전환 버튼 숨김 적용.
				$('.monitoring-content').find('.operating-view-btn').hide();
				MainViewModel.runtimeBtn.set("active", true);

				//디맨드 모니터링 탭 클릭하여 진입 시 설정
				demandMonitoringTab.on("click", function() {
					//층 네비게이션 비활성화
					MainWindow.disableFloorNav(true);
					//실내기 운행이력, 디맨드 모니터링, 비효율 운전감지 탭 전환 시에도 최근 라우터 뷰를 유지
					if (MainViewModel.listBtn.get("active")){
						 activeList();
					}else{
						activeGraph();
					}
				});

				//Demand Monitoring이 아닌 다른 탭 선택 시 refresh 해제
				sacMonitoringTabs.on("click", ".k-item .k-link", function(e) {
					var self = $(e.target);
					var liWrapper = self.closest("li.k-item");
					var tabName = liWrapper.attr("data-role"); //historyofoperating, demandmonitoring, energylossdetection
					if (tabName != "demandmonitoring") {
						if (refreshRuntime) clearInterval(refreshRuntime);
						if (refreshDay) clearInterval(refreshDay);
					}
				});
				//디폴트인 runtime은 현재 시간만 보여준다.
				MainViewModel.nextBtn.set("disabled", true);
				MainViewModel.prevBtn.set("disabled", true);

				///////사용 안함
				// [2018-04-09][아래에  if문 분기를 타고 선언되는 변수들이 사용되지않음 의미없는 로직이라 판단 주석]
				// var nowDate = new Date();
				// var yesterdayDate = new Date();
				// yesterdayDate.setDate(nowDate.getDate() - 1);
				// var monthDate,dayDate;
				// if(String(yesterdayDate.getMonth() + 1).length < 2){
				// 	monthDate = '0' + String(yesterdayDate.getMonth() + 1);
				// }else{
				// 	monthDate = String(yesterdayDate.getMonth() + 1);
				// }
				// if(String(yesterdayDate.getDate()).length < 2){
				// 	dayDate = '0' + String(yesterdayDate.getDate());
				// }else{
				// 	dayDate = String(yesterdayDate.getDate());
				// }
				//////////////

				//날짜 네비게이션 값 설정
				//디폴트인 runtime은 YYYY-MM-DD 토탈 포맷이므로, 토탈 포맷 시간값을 저장하는 setDateView에 그대로 넣어줘도 된다.
				MainViewModel.set("formmatedDate", moment(new Date()).format("L").replace(/\./gi, "-"));
				MainViewModel.set("setDateView", MainViewModel.formmatedDate);
				Loading.close();


				//Tab 이동 이벤트를 위함(라우터가 전부 바인딩 된 후의 시점에 콜백함수 호출)
				//operating.js의 Line:533에서 반환된 promise객체의 always 콜백 사용할 수 있게끔.
				dfd.resolve();

				//대시보드 카드에서 진입된 경우 처리 - day밖에 없음 현재 사양은.
				var dashboardBtn = window.localStorage.getItem("dashboardDemandBtn");
				if(dashboardBtn){
					window.localStorage.removeItem("dashboardDemandBtn");
					if(dashboardBtn == "day"){//진입 시 '일'(day)버튼 활성화로 처리
						MainViewModel.dayBtn.click();
					}/*else{      //runtime이 디폴트이다.
						MainViewModel.runtimeBtn.click();
					}*/
					//refreshData();
				}
			});
		}).fail(function(data) {
			Loading.close();
			var msg = Util.parseFailResponse(data);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function() {});

		return dfd.promise();
	};
	var initComponent = function() {};
	//컴포넌트 초기화
	// var createView = function() {};		//[2018-04-09][중복선언]
	/**
	 *
	 *   차트 및 리스트에 사용되는 데이터를 파라매터로 한다
	 *
	 *   @function createView
	 *   @param {Object} data - 그래프 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//View 생성 - 차트 및 리스트에 사용되는 데이터를 파라매터로 한다 - {...}
	//SAC 모니터링 메뉴 진입 시 디맨드 모니터링 탭 컨텐츠들도 init 되는데, 이때 디폴트가 runtime(실행시간).
	//init 시 createView는 한번 실행되며, runtime 뷰에는 그리드 뷰가 없으므로
	//그리드 뷰를 만들고 그리드 위젯에는 디폴트 설정값만 넣어주어 초기화만 시켜준다.
	//initGrid(initData) initData는 그래프 위젯 옵션 객체이므로 그리드 위젯의 옵션 객체와 다르지만 우선 넣어준다...
	var createView = function(data) {//GET /demandMonitoring API 응답값인 runtimeData를 받아온다.
		Router.bind("init", routerInit);

		var graphData = getProcessingData(data);//그래프 옵션에 넣기 위해 데이터 가공
		var initData = getGraphOptions(graphData);//가공된 데이터로 그래프 옵션 리턴

		//그래프
		gridHeightData =  $('#operating-common-tab-2').height() - 203;
		chartHeightData =  $('#operating-common-tab-2').height() - 164;
		Views.graph.widget = initGraph(initData);//그래프 옵션 객체로 그래프 초기화하여 위젯 생성 후 리턴
		Views.graph.view = new kendo.View(Views.graph.widget.wrapper);
		Router.route(Views.graph.routeUrl, routerEvt.bind(Router, Views.graph.view));

		//그리드
		//createView 메소드에서는
		Views.list.widget = initGrid(initData);
		Views.list.view = new kendo.View(Views.list.widget.wrapper);
		Router.route(Views.list.routeUrl, routerEvt.bind(Router, Views.list.view));

		Router.start();
		MainViewModel.graphBtn.click();//runtime의 경우 그리드 뷰가 없고, 그래프 뷰만 있으므로 그래프 뷰 활성화
	};
	/**
	 *
	 *  서버로부터 받은 원본 데이터 가공
	 *
	 *   @function getProcessingData
	 *   @param {Object} dataObj - 서버에서 받은 데이터
	 *   @returns {Object} {} - 가공된 데이터
	 *   @alias 없음
	 *
	 */
	//그래프 생성을 위해 서버로부터 받은 원본 데이터 가공 = dataObj: {...}
	var getProcessingData = function(dataObj) {//GET /demandMonitoring API 응답값인 runtimeData를 받아온다.
		//x축 길이 정의
		var getCategoryLength = {
			runtime: function() {
				return 16;
			},
			hourly: function() {
				return 24;
			},
			daily: function() {
				var dateArr = MainViewModel.formmatedDate.split("-");
				var dayCnt = new Date(dateArr[0], dateArr[1], 0).getDate();
				return dayCnt;
			}
		};

		var objName = null; //데이터를 담은 객체의 이름: 'Runtime', 'Day', 'Month'
		// var dataName = null;		// [2018-04-09][변수 선언후 미사용]

		//데이터 존재 유무 체크
		if (dataObj) {
			//받아온 데이터의 첫번째 key 이름(runtime, daily, monthly )을 객체 이름으로 저장
			objName = Object.keys(dataObj)[0];
		} else {
			objName = null;
		}

		//리턴할 객체
		var resultObj = {};
		resultObj.dataName = objName;
		if (dataObj && "min" in dataObj) {//최소값
			resultObj.min = dataObj.min;
		} else {
			resultObj.min = null;
		}
		if (dataObj && "max" in dataObj) {//최대값
			resultObj.max = dataObj.max;
		} else {
			resultObj.max = null;
		}

		//현재 선택된 경우의 객체 내부의 데이터 배열
		var dataArr = [];
		var categoryLength = 0;
		var forIndex,splitTimeArr,valueIdx;		//[2018-04-09][아래에 실시간,일,월 분기점에 따라 반복문을 통해 사용하는 변수가 block-scoped-var 경고에 해당되어 상위로 변수를 선언 for문 구간에 모두 초기화를 확인 ]
		//RuntTime버튼의 경우 - runtime
		if (objName == 'runtime') {
			if (dataObj[objName] && dataObj[objName].length > 0) {
				dataArr = dataObj[objName]; //그래프에 사용될 데이터
				categoryLength = getCategoryLength[objName](); //dataName에 따른 카테고리 length

				//init array - categoryLength만큼 null로 초기화
				resultObj.currentDemand = [];
				resultObj.estimateDemand = [];
				resultObj.peakLevel = [];
				resultObj.syncTime = [];
				resultObj.targetDemand = [];
				for (forIndex = 0; forIndex < categoryLength; forIndex++) {
					resultObj.currentDemand.push(null);
					resultObj.estimateDemand.push(null);
					resultObj.peakLevel.push(null);
					resultObj.syncTime.push(null);
					resultObj.targetDemand.push(null);
				}

				//push values
				for (forIndex = 0; forIndex < dataArr.length; forIndex++) {
					splitTimeArr = dataArr[forIndex].syncTime.split(":");
					valueIdx = Number(splitTimeArr[splitTimeArr.length - 2]); //특정 시간 값 받는다.(인수인계 시 데이터가 없어서 시간:분:초 어떤 것인지 모름.)
					//응답데이터의 시간 값에서 추출한 값을 그래프에 사용될 배열의 인덱스로 사용
					//해당 인덱스 위치에 응답 데이터 값을 할당
					resultObj.currentDemand[valueIdx] = dataArr[forIndex].currentDemand;
					resultObj.estimateDemand[valueIdx] = dataArr[forIndex].estimateDemand;
					resultObj.peakLevel[valueIdx] = peakLevelColorDef[dataArr[forIndex].peakLevel];
					resultObj.syncTime[valueIdx] = dataArr[forIndex].syncTime;
					resultObj.targetDemand[valueIdx] = dataArr[forIndex].targetDemand;
				}
			}
		}
		//Day버튼의 경우 - hourly
		if (objName == 'hourly') {
			if (dataObj[objName] && dataObj[objName].length > 0) {
				dataArr = dataObj[objName];
				categoryLength = getCategoryLength[objName]();
				resultObj.time = [];
				resultObj.currentDemand = {'00':[],'15':[],'30':[],'45':[]};//1시간을 4개의 영역으로 15분 단위로 나우어 그래프 디스플레이

				resultObj.targetDemand = [];
				resultObj.peakLevel0 = [];
				resultObj.peakLevel1 = [];
				resultObj.peakLevel2 = [];
				resultObj.peakLevel3 = [];
				for (forIndex = 0; forIndex < categoryLength; forIndex++) {
					resultObj.time.push(null);
					resultObj.peakLevel0.push(null);
					resultObj.peakLevel1.push(null);
					resultObj.peakLevel2.push(null);
					resultObj.peakLevel3.push(null);
					resultObj.currentDemand['00'].push(null);
					resultObj.currentDemand['15'].push(null);
					resultObj.currentDemand['30'].push(null);
					resultObj.currentDemand['45'].push(null);
				}
				for (forIndex = 0; forIndex < dataArr.length; forIndex++) {
					splitTimeArr = dataArr[forIndex].time.split(":");
					valueIdx = Number(splitTimeArr[0]);//시간단위: '시' 00 ~ 23
					resultObj.time[valueIdx] = dataArr[forIndex].time;//같은 시간단위 내에서는 마지막 단위인 ##:45:00만 들어간다.(##:00:00, ##:15:00, ##:30:00은 덮어씌워짐)
					var demandListNum = Number(splitTimeArr[0]);//시간단위: '시' 00 ~ 23

					//분단위 분기
					if(splitTimeArr[1] == '00'){
						resultObj.currentDemand['00'][demandListNum] = dataArr[forIndex].currentDemand;
						resultObj.peakLevel0[valueIdx] = peakLevelColorDef[dataArr[forIndex].peakLevel];
					}else if(splitTimeArr[1] == '15'){
						resultObj.currentDemand['15'][demandListNum] = dataArr[forIndex].currentDemand;
						resultObj.peakLevel1[valueIdx] = peakLevelColorDef[dataArr[forIndex].peakLevel];
					}else if(splitTimeArr[1] == '30'){
						resultObj.currentDemand['30'][demandListNum] = dataArr[forIndex].currentDemand;
						resultObj.peakLevel2[valueIdx] = peakLevelColorDef[dataArr[forIndex].peakLevel];
					}else if(splitTimeArr[1] == '45'){
						resultObj.currentDemand['45'][demandListNum] = dataArr[forIndex].currentDemand;
						resultObj.peakLevel3[valueIdx] = peakLevelColorDef[dataArr[forIndex].peakLevel];
					}else{
						resultObj.targetDemand.push(null);
					}
					resultObj.targetDemand[valueIdx] = dataArr[forIndex].targetDemand;
				}
			}
		}
		//Month버튼의 경우 - daily
		if (objName == 'daily') {
			if (dataObj[objName] && dataObj[objName].length > 0) {
				dataArr = dataObj[objName];
				categoryLength = getCategoryLength[objName]();
				resultObj.date = [];
				resultObj.currentDemand = [];
				resultObj.targetDemand = [];
				resultObj.peakLevel = [];
				for (forIndex = 0; forIndex < categoryLength; forIndex++) {
					resultObj.date.push(null);
					resultObj.currentDemand.push(null);
					resultObj.targetDemand.push(null);
					resultObj.peakLevel.push(null);
				}
				for (forIndex = 0; forIndex < dataArr.length; forIndex++) {
					splitTimeArr = dataArr[forIndex].date.split("-");
					valueIdx = Number(splitTimeArr[splitTimeArr.length - 1]) - 1;
					resultObj.date[valueIdx] = dataArr[forIndex].date;
					resultObj.currentDemand[valueIdx] = dataArr[forIndex].currentDemand;
					resultObj.targetDemand[valueIdx] = dataArr[forIndex].targetDemand;

					resultObj.peakLevel[valueIdx] = peakLevelColorDef[dataArr[forIndex].peakLevel];
				}
			}
		}
		// console.log(resultObj);		[2018-04-09][콘솔주석]
		return resultObj;
	};
	/**
	 *
	 *   서버에서 받은 데이터를 그래프 데이터로 만듬
	 *
	 *   @function getGraphOptions
	 *   @param {Array} allData - 그래트 데이터
	 *   @returns {Object} {} -  가공된 그래프 데이터
	 *   @alias 없음
	 *
	 */
	//가공된 데이터가 담긴 객체로 Graph위젯의 옵션을 리턴한다.
	var getGraphOptions = function(allData) {
		var nowTimeDate = MainViewModel.formmatedDate;
		var dateArr = nowTimeDate.split("-");
		var dataName = allData.dataName; //runtime, hourly, daily
		// var dataList = {};		// [2018-04-09][변수 선언후 미사용]
		var valueAxis = [],
			categoryAxis = [],
			seriesData = [];
		// var currentTime = new Date(MainViewModel.get("setDateView"));//현재 view에 해당하는 토탈 포맷 시간 값		// [2018-04-09][변수 선언후 미사용]
		var forIndex; 				// [2018-04-09][반복문에 선언되는 i 변수가 block-scoped-var 경고에 해당되어 이를 수정하기 위해 상위의선언 ]
		var chartOptions = Util.getChartOptionsForFiveChartSection(getMaxValueOfValueAxis(allData.max), 0);
		if (!chartOptions.newMax) chartOptions.newMax = 1;

		//현재 활성화 된 버튼 상태에 매칭하여 dataName 설정
		if (MainViewModel.runtimeBtn.get("active")) {
			dataName = "runtime";
		} else if (MainViewModel.dayBtn.get("active")) {
			dataName = "hourly";
		} else if (MainViewModel.monthBtn.get("active")) {
			dataName = "daily";
		}

		if (dataName == "runtime") {
			//runtime인 경우에만 예측선이 존재하므로 따로 넣어준다. (공통은 (line:576)에서 넣어준다.)
			seriesData.push({
				type: "line",
				data: allData.estimateDemand,
				name: 'estimateDemand',
				color: '#333333',
				axis: 'energy',
				categoryAxis: "runtime",
				markers: {
					size: 0,
					background: '#333333',
					border: {
						width: 0,
						color: '#333333'
					},
					highlight: {
						line: {
							width: 0
						}
					}
				},
				peakValue: null,
				select: false
			});

			valueAxis.push({
				name: "energy",
				min: 0,
				max: chartOptions.newMax,
				majorUnit: chartOptions.newMajorUnit,
				majorGridLines: {
					visible: false
				},
				labels: {
					template: function(data) {
						return Util.convertNumberFormat(data.value);
					}
				}
			});
			categoryAxis.push({
				name: "runtime",
				categories: Common.getChartXAxisLabel('runtime'),
				select: false
			});
		} else if (dataName == "hourly") {
			//hourly와 daily는 그래프 데이터 형식이 같으므로 series 데이터는 공통으로 더 아래 코드(line:578)에서 넣어준다.
			valueAxis.push({
				name: "energy",
				min: 0,
				// max: allData.max,		// [2018-04-05][아래에 max값이 키값이 재선언되어있어서 위에 내용은 불필요하기에 주석]
				//majorUnit: 2000,
				max: chartOptions.newMax,
				majorUnit: chartOptions.newMajorUnit,
				majorGridLines: {
					visible: false
				},
				labels: {
					template: function(data) {
						return Util.convertNumberFormat(data.value);
					}
				}
			});
			//x축
			var axisTimeList = Common.getChartXAxisLabel('day');
			categoryAxis.push({
				name: "hourly",
				select: false,
				categories: axisTimeList
			});
		} else if (dataName == "daily") {
			//hourly와 daily는 그래프 데이터 형식이 같으므로 series 데이터는 공통으로 더 아래 코드(line:578)에서 넣어준다.
			valueAxis.push({
				name: "energy",
				min: 0,
				max: chartOptions.newMax,
				majorUnit: chartOptions.newMajorUnit,
				majorGridLines: {
					visible: false
				},
				labels: {
					template: function(data) {
						return Util.convertNumberFormat(data.value);
					}
				}
			});
			// var categoriesSet = [];
			// var dayList = getMonthDay(dateArr[0], dateArr[1]);	//연과 월에 해당하는 월의 '일' 리스트를 반환	[2018-04-10][문자열로 반환된 0이 들어간 숫자를 아래 반복문으로 처리하지않고 common.js에 함수를 추가하여 세번쨰 인자값으로 false 넘겨주면 number타입으로 리턴하도록 수정하여 아래구문을 수정함]
			// var dayWeek;			// [2018-04-09][변수 선언후 할당 뒤 사용하지않음]
			// for(forIndex = 0; forIndex < dayList.length; forIndex++){
			// 	// dayWeek = new Date(nowTimeDate[0], nowTimeDate[1],dayList[forIndex]);
			// 	categoriesSet.push(Number(dayList[forIndex]));//특정 연과 월에 해당하는 월의 '일'들을 넣어준다.
			// }
			// var categoriesSet = getMonthDay(dateArr[0], dateArr[1], false);
			var categoriesSet = Common.getChartXAxisLabel('month', nowTimeDate);
			categoryAxis.push({
				name: "daily",
				categories: categoriesSet,//1, 2, 3, ..., 30 or 31
				select: false
			});
		}

		//공통 Set Series
		//targetData series 설정 - type: ohlc
		var targetDemandData = [];
		if(allData.targetDemand && Array.isArray(allData.targetDemand)) {
			for(forIndex = 0; forIndex < allData.targetDemand.length; forIndex++) {
				targetDemandData.push({
					open: allData.targetDemand[forIndex],
					high: allData.targetDemand[forIndex],
					low: allData.targetDemand[forIndex],
					close: allData.targetDemand[forIndex]
				});
			}
		}

		if (dataName == "hourly" && allData.currentDemand) {//'일'인 경우
			//x축 하나의 단위에 4개의 그래프가 들어간다.
			//즉, 같은 categoryAxis의 한 단위에 00, 15, 30, 45에 해당하는 데이터가 들어간다.
			//peakLevel0: '00'의 peaklevel, peakLevel1: '15'의 peaklevel, ...
			seriesData = [{
				type: "column",
				data: allData.currentDemand['00'],
				name: 'currentDemand1',
				color: function(data) {//각 '시'마다 00분에 해당하는 그래프의 color 지정
					return allData.peakLevel0[data.index];//data.index는 '00'~'23'
				},
				axis: 'energy',
				categoryAxis: dataName,//categoryAxis 내의 객체.name과 연결
				peakValue: allData.peakLevel0
			},
			{
				type: "column",
				data: allData.currentDemand['15'],
				name: 'currentDemand2',
				color: function(data) {//각 '시'마다 15분에 해당하는 그래프의 color 지정
					return allData.peakLevel1[data.index];
				},
				axis: 'energy',
				categoryAxis: dataName,
				peakValue: allData.peakLevel1
			},
			{
				type: "column",
				data: allData.currentDemand['30'],
				name: 'currentDemand3',
				color: function(data) {//각 '시'마다 30분에 해당하는 그래프의 color 지정
					return allData.peakLevel2[data.index];
				},
				axis: 'energy',
				categoryAxis: dataName,
				peakValue: allData.peakLevel2
			},
			{
				type: "column",
				data: allData.currentDemand['45'],
				name: 'currentDemand4',
				color: function(data) {//각 '시'마다 45분에 해당하는 그래프의 color 지정
					return allData.peakLevel3[data.index];
				},
				axis: 'energy',
				categoryAxis: dataName,
				peakValue: allData.peakLevel3
			}];
		}else{//runtime 또는 월 인경우
			seriesData.push({
				type: "column",
				data: allData.currentDemand,
				name: 'currentDemand',
				color: function(data) {
					return allData.peakLevel[data.index];
				},
				axis: 'energy',
				categoryAxis: dataName,
				peakValue: allData.peakLevel
			});
		}

		//targetData series 배열에 할당
		seriesData.push({
			type: "ohlc",
			data: targetDemandData,
			name: "targetDemand",
			color: "#2c81db",
			categoryAxis: dataName,
			axis: 'energy',
			gap: 0,
			highlight: {
				line: {
					width: 1
				}
			},
			peakValue: null
		});

		//서버 응답에 데이터가 없는 경우 series배열을 모두 null로 초기화 한다.
		//dataName이 없는 경우.
		//!Array.isArray(allData.dataName) 구문은 로직에 문제는 없으나 필요 없는 부분.
		if (!allData.dataName && !Array.isArray(allData.dataName)) {
			var dummyArr = [];
			if(categoryAxis[0]) {
				for (forIndex = 0; forIndex < categoryAxis[0].categories.length; forIndex++) {
					dummyArr.push(null);
				}

			}
			seriesData = dummyArr;
		}

		/* if(categoryAxis[0]){
			//Add Select
			categoryAxis[0].select = {
				from: 0,
				to: 1,
				mousewheel: false
			};
		}*/

		return {
			seriesData: seriesData,
			categoryAxis: categoryAxis,
			valueAxis: valueAxis
		};
	};
	/**
	 *
	 *   페이지 로드 시 monitoring 페이지 랜더링하는 함수
	 *
	 *   @function routerInit
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//Router 초기화
	var routerInit = function() {
		Layout.render(monitoringView);
	};
	/**
	 *
	 *   페이지 로드 시 monitoring 페이지 보여주는 함수
	 *
	 *   @function routerEvt
	 *   @param {Object} view - 보여질 페이지
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//Router 이벤트 정의
	var routerEvt = function(view) {
		Layout.showIn("#monitoring-main-view-content", view);
	};
	/**
	 *
	 *   버튼 또는 드롭다운리스트 등의 이벤트를 바인딩 한다.
	 *
	 *   @function attachEvent
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//이벤트 바인딩
	var attachEvent = function() {
		MainViewModel.set("setDateView", moment().format(MainViewModel.formmatedDate));
		/*View Model에 버튼 이벤트 바인딩*/

		//날짜 이전 다음 버튼
		MainViewModel.nextBtn.set("click", function() {						// [2018-04-09][e 파라메타 미사용 제거]
			var date = dateFormChange(MainViewModel.formmatedDate, 1);//현재 view에 있는 날짜 문자열, 증감 값
			// var isValidDate = true;											// [2018-04-09][선언후 미사용 제거]
			var runTimeBtnActive = MainViewModel.runtimeBtn.get("active");

			// [2018-04-09][기존 코드에서 아래 if 구문에서 변수를 할당하는 부분이 주석처리되어 위에 구문이 모두 필요없는 코드가 되어버림 선언후 할당만 하고 미사용 해당 구문은 불필요하다고 판단 주석]
			// var dayBtnActive = MainViewModel.dayBtn.get("active");
			// var monthBtnActive = MainViewModel.monthBtn.get("active");
			// var nowDate = new Date();
			// var dateArr = MainViewModel.formmatedDate.split("-");
			// var curDate;
			// if(monthBtnActive){
			// 	curDate = new Date(dateArr[0], dateArr[1] - 1, 1, 0, 0, 0);
			// 	nowDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1, 0, 0, 0);
			// }
			// if(dayBtnActive){
			// 	curDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], 0, 0, 0);
			// 	nowDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0);
			// }
			// if(curDate >= nowDate) isValidDate = false;//안쓰임

			//runtime의 경우 날짜 네비게이션 비활성화
			if (runTimeBtnActive) {
				return;
			}

			//변경된 날짜 저장
			MainViewModel.set("formmatedDate", moment().format(date));

			dateChange();//버튼에 따라 날짜 값 변환
			setRefreshInterval();//기존 주기적 refresh 호출을 삭제하고 새로 등록한다.
			dateOverChange();//변환된 날짜가 조건에 맞지 않는 경우 특정 날짜로 변환
			refreshData();//데이터 refresh
		});
		MainViewModel.prevBtn.set("click", function() {				// [2018-04-09][파라메타 e 미사용 제거]
			var date = dateFormChange(MainViewModel.formmatedDate, -1);//현재 view에 있는 날짜 문자열, 증감 값
			var runTimeBtnActive = MainViewModel.runtimeBtn.get("active");
			if (runTimeBtnActive) {
				return;
			}
			MainViewModel.set("formmatedDate", moment().format(date));
			dateChange();
			setRefreshInterval();
			dateOverChange();
			refreshData();
		});

		//Month 버튼
		MainViewModel.monthBtn.set("click", function() {			// [2018-04-09][파라메타 e 미사용 제거]
			state = "Month";//전역으로 사용되는 state 값 변경
			MainViewModel.dayBtn.set("active", false);//다른버튼 비활성화
			MainViewModel.runtimeBtn.set("active", false);//다른버튼 비활성화
			if (MainViewModel.monthBtn.get("active") == true) {//이미 month이면 그냥 종료
				return;
			}

			MainViewModel.monthBtn.set("active", true);//month버튼 활성화
			$('.monitoring-content').find('.operating-view-btn').show();//라우터 뷰 버튼 DOM 보이기
			MainViewModel.set("formmatedDate", moment().format(dateButtonClick('month')));//저장되어 있는 날짜를 현재 버튼 활성화 조건에 맞는 날짜 포맷 set
			$(".monitoring-chart-legend").find(".chart-legend-content-list").find(".item.estimate").hide();//'일' 또는 '월'인 경우 예측선 레전드 숨김

			//month인 경우 주기적 refresh 없음
			if (refreshRuntime) clearInterval(refreshRuntime);
			if (refreshDay) clearInterval(refreshDay);

			MainViewModel.nextBtn.set("disabled", false);
			MainViewModel.prevBtn.set("disabled", false);

			dateOverChange();
			refreshData();
		});

		//Day 버튼 - Month 버튼과 유사
		MainViewModel.dayBtn.set("click", function() {				// [2018-04-09][파라메타 e 미사용 제거]
			state = "Day";//전역으로 사용되는 state 값 변경

			MainViewModel.monthBtn.set("active", false);
			MainViewModel.runtimeBtn.set("active", false);
			if (MainViewModel.dayBtn.get("active") == true) {
				return;
			}

			MainViewModel.set("formmatedDate", moment().format(dateButtonClick('day')));//저장되어 있는 날짜를 현재 버튼 활성화 조건에 맞는 날짜 포맷 set
			MainViewModel.dayBtn.set("active", true);

			$('.monitoring-content').find('.operating-view-btn').show();
			$(".monitoring-chart-legend").find(".chart-legend-content-list").find(".item.estimate").hide();

			MainViewModel.nextBtn.set("disabled", false);
			MainViewModel.prevBtn.set("disabled", false);

			dateOverChange();
			setRefreshInterval(); //Day 시에는 주기적 refresh
			refreshData();
		});

		//Runtime 버튼
		MainViewModel.runtimeBtn.set("click", function() {				// [2018-04-09][파라메타 e 미사용 제거]
			state = "Runtime";
			MainViewModel.monthBtn.set("active", false);
			MainViewModel.dayBtn.set("active", false);
			if (MainViewModel.runtimeBtn.get("active") == true) {
				return;
			}
			MainViewModel.set("formmatedDate", moment(new Date()).format("L").replace(/\./gi, "-"));//오늘 날짜로 설정
			//MainViewModel.nextBtn.set("disabled", true);
			//MainViewModel.prevBtn.set("disabled", true);
			MainViewModel.runtimeBtn.set("active", true);

			$('.monitoring-content').find('.operating-view-btn').hide();
			$(".monitoring-chart-legend").find(".chart-legend-content-list").find(".item.estimate").show();

			MainViewModel.nextBtn.set("disabled", true);
			MainViewModel.prevBtn.set("disabled", true);

			setRefreshInterval();
			refreshData();
		});
		//Graph 아이콘 버튼
		MainViewModel.graphBtn.set("click", function() {				// [2018-04-09][파라메타 e 미사용 제거]
			if (MainViewModel.graphBtn.get("active") == true) {
				return;
			}
			MainViewModel.runtimeBtn.set("disabled", false);
			$(".monitoring-content .monitoring-chart-legend-content").show();
			$(".monitoring-grid-top").hide();//라우터 뷰에 포함되지 않으므로 직접 DOM에 접근하여 show/hide 적용
			activeGraph();//라우터 뷰 전환
			refreshData();
		});
		//List 아이콘 버튼
		MainViewModel.listBtn.set("click", function() {
			if (MainViewModel.listBtn.get("active") == true) {
				return;
			}
			MainViewModel.runtimeBtn.set("disabled", true);
			$(".monitoring-content .monitoring-chart-legend-content").hide();
			$(".monitoring-grid-top").show();//라우터 뷰에 포함되지 않으므로 직접 DOM에 접근하여 show/hide 적용
			activeList();
			refreshData();
		});

		//Device Type List - 드랍다운 리스트에서 기기 변경한 경우
		$("#group-list-demand").data("kendoDropDownList").bind("change", function(){
			setRefreshInterval();
			refreshData();
		});

		// runtime, daily, monthly에 따른 날짜 string 반환
		var dateButtonClick = function(date) {
			var returnData = '';
			var beforeData = MainViewModel.setDateView.split('-');
			var nowMonthMaxDays;
			// var afterDate = [];				// [2018-04-09][선언후 미사용 주석]
			if (date == 'year') {
				returnData = beforeData[0];
			}
			if (date == 'month') {
				returnData = beforeData[0] + '-' + beforeData[1];
			}
			if (date == 'day') {
				returnData = beforeData[0] + '-' + beforeData[1] + '-' + beforeData[2];
				nowMonthMaxDays = getMonthDay(beforeData[0],beforeData[1]).length;
				if(nowMonthMaxDays < beforeData[2]){
					beforeData[2] = nowMonthMaxDays;
					returnData = beforeData[0] + '-' + beforeData[1] + '-' + beforeData[2];
				}
			}
			return returnData;
		};
		// var buttonHtml = '<div class="button_list"><button class="k-button" data-action="Edit">Edit</button><button class="k-button" data-action="Save" style="display:none;">Save</button><button class="k-button" data-action="Cancel" style="display:none;">Cancel</button></div>';		// [2018-04-09][선언후 미사용 주석]
		$('#main-sidebar-menu .btn-box').off('click', '.btn', graphResizeEvt).on('click', '.btn', graphResizeEvt);
		sacMonitoringTab.bind('show', function (e) {
			if($(e.item).data('role') === 'demandmonitoring') graphResizeEvt();
		});
	};
	var graphResizeEvt = function (e) {
		Views.graph.widget.setOptions({chartArea: {width: $('#operating-common-tab-2').width()}});
	};
	/**
	 *
	 *   그래프 버튼 클릭시 이벤트 함수
	 *
	 *   @function activeGraph
	 *   @param {Object} e - 이벤트 값
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//그래프 View 활성화
	var activeGraph = function() {			// [2018-04-09][파라메타 e 미사용 제거]
		//disable all btn
		MainViewModel.graphBtn.set("active", true);
		MainViewModel.listBtn.set("active", false);
		Router.navigate(Views.graph.routeUrl);
	};
	/**
	 *
	 *   리스트 버튼 클릭시 이벤트 함수
	 *
	 *   @function activeList
	 *   @param {Object} e - 이벤트 값
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//리스트 View 활성화
	var activeList = function() {			// [2018-04-09][파라메타 e 미사용 제거]
		//enable all btn
		MainViewModel.listBtn.set("active", true);
		MainViewModel.graphBtn.set("active", false);
		Router.navigate(Views.list.routeUrl);
	};
	/**
	 *
	 *   데이터를 다시 불러와 setDataSource 수행
	 *
	 *   @function refreshData
	 *   @param {String} q - 층관련 쿼리 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//데이터를 다시 불러와 setDataSource 수행
	//그래프 데이터 변경
	//그리드 데이터 소스 생성
	//createView()에서 그리드 dataSource를 만드는 것이 아닌, refreshData에서 그리드 dataSource를 가공하는 것에 유의
	var refreshData = function() {    // [2018-04-09][파라메타 q 미사용 제거]
		// var dataBool = deviceGroupData;//사용 안함		// [2018-04-09][변수 값을 할당후 사용되지않음]
		// var nowTimeDate = MainViewModel.formmatedDate;			// [2018-04-09][중복선언]
		// var lastYearDataNum = MainViewModel.lastYearDataNum;	// [2018-04-09][변수 값을 할당후 사용되지않음]

		var nowTimeDate = MainViewModel.formmatedDate.split('-');
		var dataName;
		var initDataList;//서버 응답값 배열
		var grapData, pushGraph; //pushGraph: 그래프 위젯 옵션 객체(seriesData, valueAxis, categoryAxis)
		var objName;
		var setColumns;
		var ajaxText;
		var deviceTypeValue = $("#group-list-demand").data("kendoDropDownList").value();//현재 드랍다운리스트에 설정된 기기 id 		// [2018-04-09][최상단에 전역으로 동일한 변수명으로 선언되어 당장은 다른 곳과 겹치지않아 변수를 새로선언하지않으면 해결되지만 혹시모를 상황을 위해 새로선언함]

		//버튼: runtime, daily, month 구분하여 url 정의
		if ($(".monitoring-content").find('.operating-tab-top-content').find('.k-button.active').index() == 0) {
			ajaxText = '/energy/sac/demandMonitoring/runtime?dms_device_id=' + deviceTypeValue;
		} else {
			if (nowTimeDate.length == 3) {
				dataName = 'hourly';
				ajaxText = '/energy/sac/demandMonitoring?year=' + nowTimeDate[0] + '&month=' + nowTimeDate[1] + '&day=' + nowTimeDate[2] + '&dms_device_id=' + deviceTypeValue;
			}
			if (nowTimeDate.length == 2) {
				dataName = 'daily';
				ajaxText = '/energy/sac/demandMonitoring?year=' + nowTimeDate[0] + '&month=' + nowTimeDate[1] + '&dms_device_id=' + deviceTypeValue;
			}
		}

		Loading.open();
		$.ajax({
			url: ajaxText
		}).done(function(data) {
			if (!data) {
				initDataList = [];
			}
			initDataList = data;
		}).fail(function(xhq) {
			var status = xhq.status;
			var title, msg;

			if(status == 0){
				title = I18N.prop("COMMON_ERROR_DISCONNECTED_TITLE");
				msg = I18N.prop("DCOMMON_ERROR_DISCONNECTED_MSG");
				msg = title + "\n" + msg;
			}else{
				msg = Util.parseFailResponse(xhq);
			}

			msgDialog.message(msg);
			msgDialog.open();
		}).always(function() {
			Loading.close();

			//dataName 재정의
			if (nowTimeDate.length == 3) {
				dataName = 'hourly';
			}
			if (nowTimeDate.length == 2) {
				dataName = 'daily';
			}
			if ($(".monitoring-content").find('.operating-tab-top-content').find('.k-button.active').index() == 0) {
				dataName = 'runtime';
			}

			//데이터 유무에 따른 객체 이름 정의
			if (!initDataList) {
				objName = false;
			} else {
				objName = dataName;
			}

			//그래프 데이터 가공
			grapData = getProcessingData(initDataList);
			if (objName == 'runtime') {
				pushGraph = getGraphOptions(grapData);//그래프 위젯 옵션(x, y축, series) 생성 및 리턴
				setColumns = [];//그리드 뷰 없음
			} else if (dataName == "daily" || dataName == "hourly") {
				pushGraph = getGraphOptions(grapData);//그래프 위젯 옵션(x, y축, series) 생성 및 리턴
				// 그리드 뷰의 그리드 위젯 옵션 정의
				// daily와 hourly는 그리드의 첫번째 항목만 다르다. '날짜', '시간'
				// 항목에 따른 field값을 서버 응답객체의 키와 매칭
				setColumns = [];
				if (dataName == 'daily') {
					setColumns = [{
						field: "date",
						title: TEXT.COMMON_DATE,
						attributes: {
							"data-name": 'date'
						},
						width: 100,
						format: "",
						editable: false,
						sortable: true,
						template: Template.date
					}];
				} else if (dataName == 'hourly'){
					setColumns = [{
						field: "time",
						title: TEXT.COMMON_TIME,
						attributes: {
							"data-name": 'time'
						},
						width: 100,
						format: "",
						editable: false,
						template: Template.time
					}];
				}
				//hourly와 daily의 공통 Fields
				setColumns.push({
					field: "currentDemand",
					title: TEXT.ENERGY_CURRENT_DEMAND + '(kW)',
					attributes: {
						"data-name": 'currentDemand'
					},
					width: 100,
					format: "",
					editable: false,
					template: Template.currentDemand
				});
				setColumns.push({
					field: "targetDemand",
					title: TEXT.ENERGY_TARGET_DEMAND + '(kW)',
					attributes: {
						"data-name": 'targetDemand'
					},
					width: 100,
					format: "",
					editable: false,
					template: Template.targetDemand
				});
				setColumns.push({
					field: "peakLevel",
					title:TEXT.ENERGY_PEAK_LEVEL,
					attributes: {
						"data-name": 'peakLevel'
					},
					width: 100,
					format: "",
					editable: false,
					template: Template.peakLevel
				});
			}

			//pushGraph 객체로 부터 series, valuAxis, categoryAxis를 받아온다.
			var pushGraphSeries, pushGraphValueAxes, pushGraphCategories;
			if (pushGraph) {
				pushGraphSeries = pushGraph.seriesData;
				pushGraphValueAxes = pushGraph.valueAxis;
				pushGraphCategories = pushGraph.categoryAxis;
				for(var forIndex = 0; forIndex < pushGraphSeries.length; forIndex++){
					if (pushGraphSeries[forIndex]) {
						if (pushGraphSeries[forIndex].type !== "ohlc") {
							pushGraphSeries[forIndex].data = pushGraphSeries[forIndex].data.map(function (num) { return Util.convertNumberFormat(num); });
						} else {
							pushGraphSeries[forIndex].data = pushGraphSeries[forIndex].data.map(function (num) {
								$.each(num, function (key, value) {
									num[key] = Util.convertNumberFormat(value);
								});
								return num;
							});
						}
					}
				}
			} else {
				pushGraphSeries = [];
				pushGraphValueAxes = [];
				pushGraphCategories = [];
			}
			//그래프 위젯 옵션 세팅
			Views.graph.widget.setOptions({
				axisDefaults: {
					line: {
						visible: false
					},
					majorGridLines: {
						color: "#d6d6d6"
					}
				},
				seriesDefaults: {
					spacing: 0.1,
					gap: 0.2,
					overlay: {
						gradient: "none"
					},
					border: {
						width: 0
					},
					missingValues: "gap"
				},
				chartArea: {
					background: '#fbfbfb',
					height: chartHeightData,
					width: $('#operating-common-tab-2').width()
				},
				plotArea: {
					background: "#ebebeb"
				},
				legend: {
					visible: false
				},
				xAxis: {
					border: {
						color: '#444'
					}
				},
				//series: pushGraph.setSeries,
				series: pushGraphSeries,
				//valueAxes:pushGraph.setValueAxes ,
				valueAxes: pushGraphValueAxes,
				categoryAxis: pushGraphCategories
				// tooltip: {
				// 	visible: true,
				// 	template:  handleTooltip,
				// 	color:'#444444',
				// 	background : '#f7f7f7',
				// 	border: {
				// 		width: 0,
				// 		color: "#f7f7f7"
				// 	}
				// }
			});

			// runtime 이외의 daily, monthly의 경우 그리드 뷰 상단에 박스 추가
			var listDataSource;		// [2018-04-09][if문에 선언되어 해당 구문을 타지않으면 아래 setOptions에서 오류가 나기떄문에 상단에 변수선언]
			if (dataName != "runtime") {
				var maxDemandValue = "-";
				var maxPeackLevel = "-";
				var peakLevelArr = [];
				if (!($.isEmptyObject(initDataList))) {
					listDataSource = initDataList[objName];
					if (initDataList && initDataList[objName] && initDataList[objName].length > 0) {
						for (var peakIdx = 0; peakIdx < initDataList[dataName].length; peakIdx++) {
							peakLevelArr.push(initDataList[dataName][peakIdx].peakLevel);
						}
						maxPeackLevel = Math.max.apply(null, peakLevelArr);
					}
					if ("max" in initDataList) {
						maxDemandValue = initDataList.max.currentDemand;
					}
				} else {
					listDataSource = [];
				}
				$(".monitoring-grid-top").find(".content[data-role=maximumdemand]").find(".value").text(Util.convertNumberFormat(maxDemandValue));
				$(".monitoring-grid-top").find(".content[data-role=maximumpeaklevel]").find(".value").text(maxPeackLevel);
			}

			//생성한 그리드 위젯 옵션 헤팅(상단에서 설정한 columns를 넣어준다.)
			Views.list.widget.setOptions({
				columns: setColumns,
				//dataSource: initDataList[objName],
				dataSource: listDataSource,
				height: gridHeightData,
				scrollable: true,
				groupable: false,
				sortable: true,
				filterable: false,
				pageable: false,
				hasCheckedModel: false,
				setCheckedAttribute: false
			});

			//그래프 위젯 dataSource 싱큰
			Views.graph.widget.dataSource.sync();

			//Tooltip hide - 리프레쉬 되었을 때 기존에 show 상태였던 툴팁 숨김 처리.(사용안함)
			var divTooltip = $("#custom-chart-tooltip_monitoring-chart");
			if(divTooltip)
				divTooltip.hide();
		});
	};

	// [2018-04-09][아래 함수가 선언후 미사용되어 주석처리]
	// //사용 안함 - refreshData에서 그리드 옵션값 set 다시해줌
	// var gridMade = function(AllData) {
	// 	var nowTimeDate = MainViewModel.formmatedDate;
	// 	//	return {setSeries:seriesData, setValueAxes:setValueAxes, categories:categories}
	// };
	/**
	 *
	 *   첫 시작시 그래프 만들어주는 함수
	 *
	 *   @function initGraph
	 *   @param {Array} dataSource - 그래프 데이터 리스트
	 *   @param {Array} dropName - 드롭박스 현재 타입 값
	 *   @returns {Object} Object - 새로운 그래프 위젯
	 *   @alias 없음
	 *
	 */
	//전체적인 Chart plot을 생성하고 받아온 옵션을 적용 한다. - seriesData, categoryAxis, valueAxis
	var initGraph = function(dataSource) {//그래프 옵션 객체 생성에 필요한 객체를 파라미터로 받아온다.
		var data = dataSource;
		// [2018-04-09][변수 선언후 미사용 모두 주석처리]
		// var onDeviceRateData, operationRateData, outdoorTempData;//안쓰이는 변수들
		// var totalUsedTime, averageUsedTime, totalThermoTime, averageThermoTime;//안쓰이는 변수들
		// var totalGasUsage, totalPowerUsage;//안쓰이는 변수들
		data.categoryAxis = [{
			name: "runtime",
			categories: Common.getChartXAxisLabel('runtime'),
			select: false
		}];
		data.valueAxis = [{
			min: 0,
			max: 1,
			majorUnit: 0.2,
			majorGridLines: {
				visible: false
			}
		}];
		//디폴트로 정의한 그래프의 옵션 객체에 series, valueAxes, categoryAxis 추가
		var options = {
			axisDefaults: {
				line: {
					visible: false
				},
				majorGridLines: {
					color: "#d6d6d6"
				}
			},
			seriesDefaults: {
				spacing: 0.1,
				gap: 0.2,
				overlay: {
					gradient: "none"
				},
				border: {
					width: 0
				},
				missingValues: "gap"
			},
			chartArea: {
				background: '#fbfbfb',
				height: chartHeightData,
				width: $('#operating-common-tab-2').width()
			},
			plotArea: {
				background: "#ebebeb"
			},
			legend: {
				visible: false
			},
			xAxis: {
				border: {
					color: '#444'
				}
			},
			series: data.seriesData,
			valueAxis: data.valueAxis,
			categoryAxis: data.categoryAxis,
			selectionTooltip: {
				isVisible: true,
				width: 400,
				seriesKeysForRowName: ["name", "stack"],
				rowGroupNames: [],
				rowTemplate: function(seriesItem) {
					// var chart = $('#monitoring-chart').data('kendoChart');
					// var targetDemandSeries = chart.options.series[2];
					var row = {
						groupName:"",
						content: "",
						priority: 0
					};
					var seriesName = '';

					if(seriesItem.series.categoryAxis === "runtime"){
						if(seriesItem.series.name === "estimateDemand"){
							seriesName = 'runtimeEstimateDemand';
						}else if(seriesItem.series.name === "currentDemand"){
							seriesName = 'runtimeCurrentDemand';
						}else if(seriesItem.series.name === "targetDemand"){
							seriesName = seriesItem.series.data[seriesItem.categorySlotIndex].open !== null ? 'runtimeTargetDemand' : '';
						}
					}else if(seriesItem.series.categoryAxis === "hourly"){
						if(seriesItem.series.name === "currentDemand1" || seriesItem.series.name === "currentDemand2" || seriesItem.series.name === "currentDemand3" || seriesItem.series.name === "currentDemand4"){
							seriesName = 'hourlyCurrentDemand';
						}else if(seriesItem.series.name === "targetDemand"){
							seriesName = seriesItem.series.data[seriesItem.categorySlotIndex].open !== null ? 'hourlyTargetDemand' : '';
						}
					}else if(seriesItem.series.categoryAxis === "daily"){
						if(seriesItem.series.name === "currentDemand"){
							seriesName = 'dailyCurrentDemand';
						}else if(seriesItem.series.name === "targetDemand"){
							seriesName = seriesItem.series.data[seriesItem.categorySlotIndex].open !== null && typeof seriesItem.series.data[seriesItem.categorySlotIndex].open !== 'undefined' ? 'dailyTargetDemand' : '';
						}
					}
					if (typeof seriesItem.series.data[seriesItem.categorySlotIndex] === 'object' && Object.keys(seriesItem.series.data[seriesItem.categorySlotIndex]).length === 0) return null;
					seriesItem.data = Util.convertNumberFormat(seriesItem.data);
					switch(seriesName) {
					case "runtimeCurrentDemand": row.content += "<span class='energy-sacMonitoring-graph-tooltip-legend-Square' style='background-color:" + seriesItem.series.peakValue[seriesItem.categorySlotIndex] + "'></span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-name'>" + I18N.prop("ENERGY_PEAK_LEVEL") + " + " + I18N.prop("ENERGY_CURRENT_DEMAND") + "</span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-data'>" + seriesItem.data + "</span>"; row.priority = 3; break;
					case "runtimeEstimateDemand": row.content += "<span class='energy-sacMonitoring-graph-tooltip-legend-line' style='background-color:" + seriesItem.series.color + "'></span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-name'>" + I18N.prop("ENERGY_ESTIMATE_LINE") + "</span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-data'>"  + seriesItem.data + "</span>"; row.priority = 1; break;
					case "runtimeTargetDemand": row.content += "<span class='energy-sacMonitoring-graph-tooltip-legend-line' style='background-color:#2c81db'></span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-name'>" + I18N.prop("ENERGY_TARGET_DEMAND") + "</span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-data'>" + Util.convertNumberFormat(seriesItem.series.data[seriesItem.categorySlotIndex].open) + "</span>"; row.priority = 2; break;
					case "hourlyCurrentDemand": row.content += "<span class='energy-sacMonitoring-graph-tooltip-legend-Square' style='background-color:" + seriesItem.series.peakValue[seriesItem.categorySlotIndex] + "'></span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-name'>" + I18N.prop("ENERGY_PEAK_LEVEL") + " + " + I18N.prop("ENERGY_CURRENT_DEMAND") + "</span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-data'>" + seriesItem.data + "</span>"; row.priority = 2; break;
					case "hourlyTargetDemand": row.content += "<span class='energy-sacMonitoring-graph-tooltip-legend-line' style='background-color:#2c81db'></span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-name'>" + I18N.prop("ENERGY_TARGET_DEMAND") + "</span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-data'>" + Util.convertNumberFormat(seriesItem.series.data[seriesItem.categorySlotIndex].open) + "</span>"; row.priority = 2; break;
					case "dailyCurrentDemand": row.content += "<span class='energy-sacMonitoring-graph-tooltip-legend-Square' style='background-color:" + seriesItem.series.peakValue[seriesItem.categorySlotIndex] + "'></span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-name'>" + I18N.prop("ENERGY_PEAK_LEVEL") + " + " + I18N.prop("ENERGY_CURRENT_DEMAND") + "</span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-data'>" + seriesItem.data + "</span>"; row.priority = 2; break;
					case "dailyTargetDemand": row.content += "<span class='energy-sacMonitoring-graph-tooltip-legend-line' style='background-color:#2c81db'></span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-name'>" + I18N.prop("ENERGY_TARGET_DEMAND") + "</span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-data'>" + Util.convertNumberFormat(seriesItem.series.data[seriesItem.categorySlotIndex].open) + "</span>";  row.priority = 2; break;
					default: row = null;
					}
					// row.groupName = seriesItem.series.name == "temperature" ? "" : seriesItem.series.stack;
					return row;
				}
			}
			// tooltip: {
			// 	visible: true,
			// 	template:  handleTooltip,
			// 	color:'#444444',
			// 	background : '#f7f7f7',
			// 	border: {
			// 		width: 0,
			// 		color: "#f7f7f7"
			// 	}
			// }
		};

		//그래프 위젯 생성하여 리턴
		return Widget.createNewWidget("monitoring-chart", kendo.dataviz.ui.Chart, options);
	};
	/**
	 *
	 *   툴팁 이벤트 함수
	 *
	 *   @function handleTooltip
	 *   @param {Object} e - 툴팁 이벤트 객체
	 *   @returns {String} String - 그래프에 해당하는 툴팁 html
	 *   @alias 없음
	 *
	 */
	//Define Tooltip for selected part on chart plot
	//툴팁의 템플릿 리턴
	var handleTooltip = function(e){
		var dataValue = e.value;
		var dataName = e.series.name;
		// var dataType = e.series.type;			// [2018-04-09][변수선언후 미사용 주석처리]
		var displayDataObject,displayDataObject2,peakValue;
		var dataTimeSet,dataTime;
		var dataReturn01,dataReturn02 = '';//현재 디맨드, 피크레벨
		var graphNum;
		var toolTipPeakLevelColorDef = {			//[2018-04-09][최상위에 전역으로 같은 변수명이 선언되었지만 키와 벨류값이 반대로 되어있어서 변수명을 기존 peakLevelColorDef-> toolTipPeakLevelColorDef 수정]
			"#afaeae":"0",
			"#1aa05a":"1",
			"#fbb248":"2",
			"#ee5151":"3"
		};
		if(dataName == "currentDemand"){//runtime 또는 월인 경우
			//현재 디맨드 - 사용
			displayDataObject = {
				title: TEXT.ENERGY_CURRENT_DEMAND,
				value: dataValue
			};
			//피크레벨 - 사용안함 - 아래(Line: 1414 또는 1419)에서 재정의///////
			if(String(e.category).length > 1 && String(e.category).indexOf(':') > 0){
				peakValue = e.series.peakValue[Number(e.category.split(':')[0])];
			}else{
				peakValue = 0;
			}
			displayDataObject2 = {
				title: TEXT.ENERGY_PEAK_LEVEL,
				value: toolTipPeakLevelColorDef[peakValue]
			};
			 dataReturn02 = '<p><span class="tooltip-item-title">' + displayDataObject2.title + '</span> : <span class="tooltip-item-value">' + displayDataObject2.value + '</span></p>';
			///////////////////////////////////////////////////////////
		}
		if (dataName == "estimateDemand") {
			displayDataObject = {
				title: TEXT.ENERGY_ESTIMATE_LINE,
				value: dataValue
			};
		}
		if (dataName == "targetDemand") {
			displayDataObject = {
				title: TEXT.ENERGY_TARGET_DEMAND,
				value: dataValue.open
			};
		}
		if (dataName == "currentDemand1") {//'일'인 경우 - '00'분
			dataTimeSet = e.category.split(' ')[0];//카테고리 값 0, 1, 2, 3, ... 11
			if(String(dataTimeSet).length < 2){//한 자리수인 경우 0 붙인다.
				dataTime = '0' + dataTimeSet + ':00~0' + dataTimeSet + ':15';
			}else{//두 자리수인 경우 그냥 사용
				dataTime = dataTimeSet + ':00~' + dataTimeSet + ':15';
			}
			displayDataObject = {
				title: dataTime,
				value: dataValue
			};
		}
		if (dataName == "currentDemand2") {//'일'인 경우 - '15'분
			dataTimeSet = e.category.split(' ')[0];
			if(String(dataTimeSet).length < 2){
				dataTime = '0' + dataTimeSet + ':15~0' + dataTimeSet + ':30';
			}else{
				dataTime = dataTimeSet + ':15~' + dataTimeSet + ':30';
			}
			displayDataObject = {
				title: dataTime,
				value: dataValue
			};
		}
		if (dataName == "currentDemand3") {//'일'인 경우 - '30'분
			dataTimeSet = e.category.split(' ')[0];
			if(String(dataTimeSet).length < 2){
				dataTime = '0' + dataTimeSet + ':30~0' + dataTimeSet + ':45';
			}else{
				dataTime = dataTimeSet + ':30~' + dataTimeSet + ':45';
			}
			displayDataObject = {
				title: dataTime,
				value: dataValue
			};
		}
		if (dataName == "currentDemand4") {//'일'인 경우 - '45'분
			dataTimeSet = e.category.split(' ')[0];
			if(String(dataTimeSet).length < 2){
				dataTime = '0' + dataTimeSet + ': 45~0' + (Number(dataTimeSet) + 1) + ':00';
			}else{
				dataTime = dataTimeSet + ': 45~' + (Number(dataTimeSet) + 1) + ':00';
			}
			displayDataObject = {
				title: dataTime,
				value: dataValue
			};
		}
		dataReturn01 = '<p><span class="tooltip-item-title">' + displayDataObject.title + '</span> : <span class="tooltip-item-value">' + displayDataObject.value + '</span></p>';
		if(e.series.categoryAxis == "hourly" && e.series.type !== "ohlc"){//현재 활성화된 버튼이 '일'이고, 현재 디맨드인 경우

			var timeVal = e.category.split(' ')[0], timeFormat = e.category.split(' ')[1];
			if(timeFormat == 'PM' && timeVal != 12){
				graphNum = Number(timeVal) + 12;
			}else{
				graphNum = Number(timeVal);
			}
			peakValue = e.series.peakValue[graphNum];
			displayDataObject2 = {
				title: TEXT.ENERGY_PEAK_LEVEL,
				value: toolTipPeakLevelColorDef[peakValue]//색깔에 매칭된 피크레벨 값
			};
			 dataReturn02 = '<p><span class="tooltip-item-title">' + displayDataObject2.title + '</span> : <span class="tooltip-item-value">' + displayDataObject2.value + '</span></p>';
		}
		if(e.series.categoryAxis == "daily" && e.series.type !== "ohlc"){//현재 활성화된 버튼이 '월'이고, 현재 디맨드인 경우
			peakValue = e.series.peakValue[Number(e.category/*.split('[')[0]*/) - 1];
			displayDataObject2 = {
				title: TEXT.ENERGY_PEAK_LEVEL,
				value: toolTipPeakLevelColorDef[peakValue]//색깔에 매칭된 피크레벨 값
			};
			dataReturn02 = '<p><span class="tooltip-item-title">' + displayDataObject2.title + '</span> : <span class="tooltip-item-value">' + displayDataObject2.value + '</span></p>';
		}
		return '<div class="custom-chart-tooltip-container">' + dataReturn01 + dataReturn02 + '</div>';
	};


	//Grid Template 객체
	var Template = {
		date: function(dataItem) {
			if (dataItem.date) {
				return '<span class="text-box">' + dataItem.date + '</span>';
			}
			return '<span class="text-box">-</span>';

		},
		time: function(dataItem) {
			var d = MainViewModel.formmatedDate + " ";
			if (dataItem.time) {
				return '<span class="text-box">' + d + dataItem.time + '</span>';
			}
			return '<span class="text-box">-</span>';

		},
		currentDemand: function(dataItem) {
			if (typeof dataItem.currentDemand == 'undefined' || dataItem.currentDemand === null) {
				return '<span class="text-box">-</span>';
			}
			return '<span class="text-box">' + Util.convertNumberFormat(dataItem.currentDemand) + '</span>';

		},
		targetDemand: function(dataItem) {
			if (typeof dataItem.targetDemand == 'undefined' || dataItem.targetDemand === null) {
				return '<span class="text-box">-</span>';
			}
			return '<span class="text-box">' + Util.convertNumberFormat(dataItem.targetDemand) + '</span>';

		},
		peakLevel: function(dataItem) {
			if (typeof dataItem.peakLevel == 'undefined' || dataItem.peakLevel === null) {
				return '<span class="text-box">-</span>';
			}
			return '<span class="text-box">' + dataItem.peakLevel + '</span>';

		}
	};
	/**
	 *
	 *   첫 시작시 그리드 만들어주는 함수
	 *
	 *   @function initGrid
	 *   @param {Array} dataSource - 그리드 데이터 리스트
	 *   @returns {Object} Object - 새로운 그리드 위젯
	 *   @alias 없음
	 *
	 */
	//Grid 초기화
	//초기 createView 메소드에서 즉, runtime 상황에서는 그래프 옵션을 넣어주었다. -> 어차피 runtime에는 그리드뷰가 없으므로 상관 없고.
	//refreshData에서 '일' 또는 '월' 상황에서 그리드 뷰 디스플레이 시 그리드 위젯 옵션 set에 사용된다.
	var initGrid = function(dataSource) {
		var options = {
			columns: [],
			//dataSource: dataSource,
			dataSource: dataSource,
			height: gridHeightData,
			scrollable: true,
			groupable: false,
			sortable: true,
			filterable: false,
			pageable: false,
			hasCheckedModel: false,
			setCheckedAttribute: false
		};
		return Widget.createNewWidget("monitoring-grid", kendo.ui.Grid, options);
	};
	/**
	 *
	 *   층 변경 시, 쿼리 생성하여 데이터를 Refresh 함
	 *
	 *   @function onFloorChange
	 *   @param {Object}floorData- 기존 층 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//층 변경 시, 쿼리 생성하여 데이터를 Refresh 함. - 사용안함	// [2018-04-09][함수 선언후 사용하지않음 주석처리]
	// var onFloorChange = function(floorData) {
	// 	var q = getFloorQuery(floorData);
	// 	refreshData(q);
	// };
	/**
	 *
	 *   현재 날짜 넘어갔을 때 조건에 따라 날짜 바꾸어주는 함수
	 *
	 *   @function dateChange
	 *   @param {String} date - 현재 버튼 상태
	 *   @returns {Object} returnData -  현재 날짜
	 *   @alias 없음
	 *
	 */
	//formmattedDate(현재 view에 있는 날짜)가 변경되면, setDateView(전체 포맷 날짜를 저장하고 있는)의 값에도 반영한다.
	//년, 월, 일 버튼으로 뷰를 전환할 때 현재 전체 날짜를 기억하기 위한 함수
	var dateChange = function() {
		var afterDate = MainViewModel.formmatedDate.split('-');
		var beforeData = MainViewModel.setDateView.split('-');
		var setData;
		if (afterDate.length >= 1) {
			beforeData[0] = afterDate[0];
		}
		if (afterDate.length >= 2) {
			beforeData[1] = afterDate[1];
		}
		if (afterDate.length >= 3) {
			beforeData[2] = afterDate[2];
		}
		setData = beforeData[0] + '-' + beforeData[1] + '-' + beforeData[2];
		MainViewModel.set("setDateView", moment().format(setData));
	};
	/**
	 *
	 *   현재 날짜 넘어갔을 때 조건에 따라 날짜 바꾸어주는 함수
	 *
	 *   @function dateOverChange
	 *   @param {String} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	// 날짜 네비게이션의 화살표 버튼, 일, 월, 년 버튼 누를 때마다 호출
	// 포맷 변경 과정에서 현재 날짜 이상인 경우가 발생하면 적합한 날짜로 변경
	// operating.js의 dateOverChange 와 같되 날짜만 -1 해준다.
	// 디맨드 모니터링의 경우 오늘 날짜의 -1
	// 포맷 변경 과정에서 현재 날짜 이상인 경우가 발생하는 것은 '일'버튼 활성화의 경우이다.
	//따라서 if(dateLength >= 3){ 분기만 탄다. 떄문에 setDateView는 항상 토탈포맷을 유지한다.
	var dateOverChange = function(){
		var setDate = MainViewModel.formmatedDate.split('-');//변경된 view에 보이는 format의 날짜
		/* 현재 날짜 이후로 움직이지 않도록 작업 */
		var madeDate = new Date();//현재 날짜 생성
		var nowDate = new Date();//현재 날짜
		nowDate.setDate(madeDate.getDate() - 1); //디맨드 모니터링은 현재 날짜의 -1

		var dateLength = setDate.length;
		var yearValue,monthValue, dayValue,nowCompareDateSet,afterCompareDateSet;
		var nowDateList = {
			year:nowDate.getFullYear(),
			month:nowDate.getMonth() + 1,
			day:nowDate.getDate()
		};
		var compareDateList = {
			year:nowDate.getFullYear(),
			month:nowDate.getMonth() + 1,
			day:nowDate.getDate()
		};
		if(String(compareDateList.month).length < 2){
			compareDateList.month = '0' + compareDateList.month;
		}
		if(String(compareDateList.day).length < 2){
			compareDateList.day = '0' + compareDateList.day;
		}

		var setChangeDate;
		if(dateLength >= 1){
			yearValue = Number(setDate[0]);
			setChangeDate = nowDateList.year;
			nowCompareDateSet = Number(String(compareDateList.year));
			if(Number(yearValue) == nowCompareDateSet){
				MainViewModel.nextBtn.set("disabled", true);
			}else if(Number(yearValue) > nowCompareDateSet){
				MainViewModel.nextBtn.set("disabled", true);
				MainViewModel.set("formmatedDate",setChangeDate);
				MainViewModel.set("setDateView",setChangeDate);
			}else{
				MainViewModel.nextBtn.set("disabled", false);
			}
		}

		if(dateLength >= 2){
			setChangeDate = nowDateList.year + '-' + (String(nowDateList.month).length > 1 ? nowDateList.month : '0' + nowDateList.month);
			monthValue = Number(setDate[1]);
			if(String(monthValue).length < 2){
				monthValue = '0' + monthValue;
			}
			nowCompareDateSet = Number(String(compareDateList.year) + String(compareDateList.month));
			afterCompareDateSet = Number(String(yearValue) + String(monthValue));
			if(afterCompareDateSet == nowCompareDateSet){
				MainViewModel.nextBtn.set("disabled", true);
			}else if(afterCompareDateSet >= nowCompareDateSet){
				MainViewModel.nextBtn.set("disabled", true);
				MainViewModel.set("formmatedDate",setChangeDate);
				// MainViewModel.set("setDateView",setChangeDate);
				//[2018-06-01][해당 로직을 월 일 순으로 동작한다면 dateChange setDateView데이터를 기준으로 해당 배열값을 split하여 년월일을 넣는데 월이 먼저 동작하여 일이 사라져 배열이[2]값이 없어 에러문 출력 그리고 dateChange setDateView갱신되고 formmatedDate 기준으로 날짜초과 여부를 확인하기때문에 불필요하다고 판단 해당구문은 주석처리 ]
			}else{
				MainViewModel.nextBtn.set("disabled", false);
			}
		}
		if(dateLength >= 3){
			setChangeDate = nowDateList.year + '-' + (String(nowDateList.month).length > 1 ? nowDateList.month : '0' + nowDateList.month) + '-' + (String(nowDateList.day).length > 1 ? nowDateList.day : '0' + nowDateList.day);
			dayValue = Number(setDate[2]);
			if(String(dayValue).length < 2){
				dayValue = '0' + dayValue;
			}
			nowCompareDateSet = Number(String(compareDateList.year) + String(compareDateList.month) + String(compareDateList.day));
			afterCompareDateSet = Number(String(yearValue) + String(monthValue) + String(dayValue));
			if(afterCompareDateSet == nowCompareDateSet){
				MainViewModel.nextBtn.set("disabled", true);
			}else if(afterCompareDateSet >= nowCompareDateSet){
				MainViewModel.nextBtn.set("disabled", true);
				MainViewModel.set("formmatedDate",setChangeDate);
				// MainViewModel.set("setDateView",setChangeDate);			//[2018-06-01][상단과동일]
			}else{
				MainViewModel.nextBtn.set("disabled", false);
			}
		}
		// console.log(MainViewModel.get("setDateView"));			//[2018-04-09][콘솔로그 주석처리]
	};
	/**
	 *
	 *   현재 날짜 넘어갔을 때 조건에 따라 날짜 바꾸어주는 함수
	 *
	 *   @function dateFormChange
	 *   @param {String} date - 현재 날짜
	 *   @param {String} value - 이동할 값
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//날짜 네비게이션의 버튼 클릭에 따른 날짜 변경 적용(포맷까지 맞추어서 리턴)
	var dateFormChange = function(date, value) {//현재 view에 있는 날짜 문자열, 증감 값
		var dateList = date.split('-');
		var dateLength = dateList.length;
		var yearValue, monthValue, dayValue;
		var valueStyle;

		var monthChangeData, dayChangeData;
		var monthListData, dayListData;
		monthListData = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
		if (dateLength >= 1) {
			yearValue = Number(dateList[0]);
			valueStyle = 'year';
		}
		if (dateLength >= 2) {
			monthValue = Number(dateList[1]);
			valueStyle = 'month';
			dayListData = getMonthDay(yearValue, monthValue);
		}
		if (dateLength >= 3) {
			dayValue = Number(dateList[2]);
			valueStyle = 'day';
		}

		if (valueStyle == 'year') {
			yearValue = yearValue + value;
			return String(yearValue);
		} else if (valueStyle == 'month') {
			monthValue = monthValue + value;
			if (monthValue > monthListData.length || monthValue <= 0) {
				if (monthValue > 0) {
					monthChangeData = monthListData[0];
				} else {
					monthChangeData = monthListData[11];
				}
				return (yearValue + value) + '-' + monthChangeData;
			}
			return yearValue + '-' + monthListData[(monthValue) - 1];
		} else if (valueStyle == 'day') {
			dayValue = dayValue + value;

			if (dayValue > dayListData.length || dayValue <= 0) {
				if (dayValue > 0) {
					monthValue = monthValue + value;
					if (monthValue > monthListData.length || monthValue <= 0) {
						if (monthValue > 0) {
							monthChangeData = monthListData[0];
							dayListData = getMonthDay((yearValue + value), 1);
						} else {
							monthChangeData = monthListData[11];
							dayListData = getMonthDay((yearValue + value), 12);
						}

						dayChangeData = dayListData[0];
						return (yearValue + value) + '-' + monthChangeData + '-' + dayChangeData;
					}
					dayListData = getMonthDay(yearValue, monthValue);
					dayChangeData = dayListData[0];
					return yearValue + '-' + monthListData[monthValue - 1] + '-' + dayChangeData;

				}
				dayChangeData = dayListData[dayListData.length - 1];
				monthValue = monthValue + value;
				if (monthValue > monthListData.length || monthValue <= 0) {
					if (monthValue > 0) {
						monthChangeData = monthListData[0];
						dayListData = getMonthDay((yearValue + value), 1);
					} else {
						monthChangeData = monthListData[11];
						dayListData = getMonthDay((yearValue + value), 12);
					}

					dayChangeData = dayListData[dayListData.length - 1];
					return (yearValue + value) + '-' + monthChangeData + '-' + dayChangeData;
				}
				dayListData = getMonthDay(yearValue, monthValue);
				dayChangeData = dayListData[dayListData.length - 1];
				return yearValue + '-' + monthListData[monthValue - 1] + '-' + dayChangeData;
			}
			return yearValue + '-' + monthListData[monthValue - 1] + '-' + dayListData[dayValue - 1];
		}

		// [2018-04-09][아래에 전역으로 똑같은 함수가 선언되어있어서 주석처리]
		// function getMonthDay(year, month) {
		// 	var lastDay = (new Date(year, month, 0)).getDate(),
		// 		monthDayList = [];
		// 	for (var i = 1; i <= lastDay; i++) {
		// 		if (String(i).length == 1) {
		// 			monthDayList.push('0' + i);
		// 		} else {
		// 			monthDayList.push(i);
		// 		}
		// 	}
		// 	return monthDayList;
		// }
	};
	/**
	 *
	 *   특정 달의 day list 반환
	 *
	 *   @function getMonthDay
	 *   @param {String} year - 현재 연도
	 *   @param {String} month - 현재 월
	 *   @returns {Array} monthDayList - 년도 월에 따른 일 리스트
	 *   @alias 없음
	 *
	 */
	//특정 달의 day list 반환
	// function getMonthDay(year, month) {
	// 	var lastDay = (new Date(year, month, 0)).getDate(),
	// 		monthDayList = [];
	// 	for (var i = 1; i <= lastDay; i++) {
	// 		if (String(i).length == 1) {
	// 			monthDayList.push('0' + i);			//[2018-04-09][해당구문은 문자열로 들어가고 아래 구문은 숫자로 들어간다 통일 시키기위해 아래구문을 문자열로 변환 수정]
	// 		} else {
	// 			String(monthDayList.push(i));
	// 		}
	// 	}
	// 	return monthDayList;
	// }
	/**
	 *
	 *   차트 Y축 최대값 반환
	 *
	 *   @function getMaxValueOfValueAxis
	 *   @param {Array} maxObj - 현재 연도
	 *   @returns {String} result - 가장 높은 값
	 *   @alias 없음
	 *
	 */
	//차트 Y축 최대값 반환
	function getMaxValueOfValueAxis(maxObj) {
		var result;
		var valueArr = [];
		// var maxValue = 0;		// [2018-04-09][해당 변수를 사용하는 구문이 주석처리되어있음 동일하게 주석처리]
		if(maxObj){
			// var numArr = [12, 120, 1200, 12000];	// [2018-04-09][해당 변수를 사용하는 구문이 주석처리되어있음 동일하게 주석처리]
			for(var key in maxObj) {
				var val = maxObj[key];
				valueArr.push(val);
			}
			valueArr.sort(function(a, b) { // 내림차순
				return b - a;
			});
			/* maxValue = Math.max.apply(null, valueArr);
			for(var i=0; i<numArr.length; i++) {
				if(maxValue <= numArr[i]) {
					result = numArr[i];
					break;
				}
			}*/
			result = valueArr[0] * 1.2; //최대값의 1.2배 값을 리턴
		}else{
			result = 1;
		}
		return result;
	}
	/**
	 *
	 *   값을 통해 객체 키 반환 - 각 키에 대한 값의 중복이 없어야함
	 *
	 *   @function getKeyFromValue
	 *   @param {Array} Obj - 객체
	 *   @param {Array} value - 값
	 *   @returns {String} key - 키값 반환
	 *   @alias 없음
	 *
	 */
	//값을 통해 객체 키 반환 - 각 키에 대한 값의 중복이 없어야함			// [2018-04-09][함수선언후 사용하지않음 주석처리]
	// function getKeyFromValue(Obj, value) {
	// 	if(value) {
	// 		for(var key in Obj) {
	// 			if(value == Obj[key]) {
	// 				return key;
	// 			}
	// 		}
	// 	}else {
	// 		return false;
	// 	}
	// }
	/**
	 *
	 *   Set Interval
	 *
	 *   @function setRefreshInterval
	 *   @param {Array} 없음
	 *   @returns {String} 없음
	 *   @alias 없음
	 *
	 */
	//Set Interval
	//기존 주기적 refresh 호출을 삭제하고 새로 등록한다.
	function setRefreshInterval() {
		if(refreshDay) clearInterval(refreshDay);
		if(refreshRuntime) clearInterval(refreshRuntime);

		if(state == "Day"){
			refreshDay = setInterval(function(){
				// console.log("REFRESH DAY!!");			// [2018-04-09][콘솔 주석처리]
				refreshData();
			}, refreshDayCycle);
		}else if(state == "Runtime"){
			refreshRuntime = setInterval(function(){
				// console.log("REFRESH RUNTIME!!");			// [2018-04-09][콘솔 주석처리]
				refreshData();
			}, refreshRuntimeCycle);
		}
	}
	return {
		init: init
	};

});
//# sourceURL=energy/samsungsac/monitoring.js