/**
	*
	*   <ul>
	*       <li>detection 페이지에 관한 페이지</li>
	*       <li>실행시간에 대한 그래프 제공</li>
	*       <li>월, 일에 따른 그래프, 그리드 제공</li>
	*       <li>선택 가능한 디바이스</li>
	*   </ul>
	*   @module app/energy/samsungsac/detection
	*   @param {Object} CoreModule- 에너지 core 객체
	*   @param {Object} ViewModel- detection ViewModel 객체
	*   @param {Object} Model- detection Model 객체
	*   @param {Object} Template- detection Template 객체
	*   @param {Object} Common- detection Common 객체
	*   @param {Object} Widget- detection Widget 객체
	*   @param {Object} Target- detection Target 객체
	*   @requires app/energy/core
	*   @requires app/energy/samsungsac/view-model/detection-vm
	*   @requires app/energy/samsungsac/model/detection-model
	*   @requires app/energy/samsungsac/template/detection-template
	*   @requires app/energy/samsungsac/common/common
	*   @requires app/energy/samsungsac/common/widget
	*   @returns {Object} 없음
	*/
define("energy/samsungsac/detection", ["energy/core", "energy/samsungsac/view-model/detection-vm",
	// "energy/samsungsac/model/detection-model",
	// "energy/samsungsac/template/detection-template",
	"energy/samsungsac/common/common",
	"energy/samsungsac/common/widget"
], function(CoreModule, ViewModel, Common, Widget){		//[2018-04-10][Target, Template, Model 파라메타 미사용 주석]

	var moment = window.moment;
	var kendo = window.kendo;
	// var globalSettings = window.GlobalSettings;			//[2018-04-10][선언 후 미사용 주석]
	var I18N = window.I18N;
	var LoadingPanel = window.CommonLoadingPanel;
	var Util = window.Util;
	var MainWindow = window.MAIN_WINDOW;
	var Loading = new LoadingPanel();
	var MainViewModel = ViewModel.MainViewModel;
	// var Views = ViewModel.Views;		// [2018-04-10][해당 변수를 사용하는 함수가 미사용으로 주석처리됨 해당변수도 미사용되어 주석처리]
	// var listViewData = $("#detection-list-template").html();			// [2018-04-05][선언 후 미사용 주석]
	// var Router = new kendo.Router();	// [2018-04-10][해당 변수를 사용하는 함수가 미사용으로 주석처리됨 해당변수도 미사용되어 주석처리]
	// var Layout = new kendo.Layout("<div id='detection-main-view-content' class='detection-main-view-content'></div>");		// [2018-04-10][라우터를 사용하기 위해 생성된 켄도레이아웃이 현재탭에서는 라우터가 사용되지 않는다고 판단하여 주석처리됨 그로인해 해당 변수도 사용하지않는 변수가 되어 주석처리함]
	// var targetAllData = {},targetAllDataSet = [];		// [2018-04-05][선언 후 미사용 주석]
	var detectionView = $('#detection-main-view');
	var normalGraph,normalGraphElm;
	var pieGraph,pieGraphElm;
	var top5Grid,top5GridElm;
	var eventGrid,eventGridElm;
	var TEXT = Common.TEXT;
	var MSG = Common.MSG;
	var consumptionTab;
	var msgDialog = Widget.msgDialog, confirmDialog = Widget.confirmDialog;
	var getFloorQuery = Common.getFloorQuery;		//[2018-04-10][getFloorQuery Common으로 이동시켜 할당]
	var getMonthDay = Common.getMonthDay;		//[2018-04-10][getMonthDay Common으로 이동시켜 할당]

	var allData = {};//비효율 운전 감지에서 UI 디스플레이에 사용하는 객체(통)
	var energyEetectionTab;
	var detectionSettingData;
	//var onFloorChangeEvt = function(arg){		//[2018-04-10][파라메타 arg 아래 로직이 미사용됨에 따라 주석처리]
	var onFloorChangeEvt = function(){				//[2018-04-10][해당 함수는 층변경 이벤트시 콜백함수로 사용되고있지만 파라메타를 받아 변수를 지역변수로 할당하여 사용하는곳이 없고 refreshData에서 층정보를 가져오는 함수를 실행시켜 해당 함수는 불필요한 함수라고 판단됨 향후 리펙토링시 참조]
		// var building = arg.building;				//[2018-04-10][변수 선언후 미사용]
		// var floor = arg.floor;					//[2018-04-10][변수 선언후 미사용]
		// var initArg = {							//[2018-04-10][변수 선언후 미사용]
		// 		building : building,
		// 		floor : floor,
		// 		btnMadeList : null
		// };
		refreshData();
	};
	// var weekCheckList = {							//[2018-04-10][해당 변수를 사용하는구문이 기존 주석처리 되어 사용하지않음 주석처]
	// 		'Mon':TEXT.ENERGY_DATE_MON,
	// 		'Tue':TEXT.ENERGY_DATE_TUE,
	// 		'Wed':TEXT.ENERGY_DATE_WED,
	// 		'Thu':TEXT.ENERGY_DATE_THU,
	// 		'Fri':TEXT.ENERGY_DATE_FRI,
	// 		'Sat':TEXT.ENERGY_DATE_SAT,
	// 		'Sun':TEXT.ENERGY_DATE_SUN
	// };
	var energyDataNameSet = {
		'InsufficientInsulation' :TEXT.ENERGY_INSUFFICIENT_INSULATION,
		'LongTimeOperation':	TEXT.ENERGY_LONG_TIME_OPERATION,
		'AbnormalSetTemp':	TEXT.ENERGY_ABNORMAL_SET_TEMP	,
		'RepetitiveControl' :TEXT.ENERGY_REPETITIVE_CONTROL	,
		'LoadVariation' :	TEXT.ENERGY_LOAD_VARIATION,
		'AbnormalRoomTemp':TEXT.ENERGY_ABNORMAL_CURRENT_TEMP,
		'OverTimeOperation':	TEXT.ENERGY_OVER_TIME_OPERATION
	};

	//[2018-07-04][비효율 건수 파이그래프 데이터가 null일떄 시각적으로 보여주기위한 기본값]
	var energyDataNameNull = [
		{'name': 'InsufficientInsulation','count':0},
		{'name': 'LongTimeOperation','count':0},
		{'name': 'AbnormalSetTemp','count':0},
		{'name': 'RepetitiveControl','count':0},
		{'name': 'LoadVariation','count':0},
		{'name': 'AbnormalRoomTemp','count':0},
		{'name': 'OverTimeOperation','count':0}
	];

	var init = function(tab){
		MainViewModel.dayBtn.set("active", true);//일버튼 활성화
		MainViewModel.set("setDateView", moment().format(MainViewModel.formattedDate));//현재날짜를 total 포맷으로 지닌다. YYYY-MM-DD

		CoreModule.on("onfloorchange", onFloorChangeEvt);//층 변경 시 이벤트

		Loading.open();

		consumptionTab = tab;//SAC 모니터링 탭 인스턴스

		initComponent();//아무 동작 안함.

		var element = consumptionTab.element.find('.detection-content').parent(); //비효율 운전 감지 탭에 해당하는 컨텐츠 Native DOM
		var ajaxText;//ajax 통신 시 사용할 URL 변수
		var q = getFloorQuery(null, true);//현재 층정보에 대한 쿼리를 새로 받아온다.     //[2018-04-10][층정보를 받아서 ajax 통신전달]
		var nowTimeDate = MainViewModel.formattedDate.split('-');//현재 view(초기화 시에는 YYYY, MM, DD)에 대한 날짜를 배열로 들고 있는다.

		// console.log(MainViewModel);				//[2018-04-10][콘솔 주석처리]

		q = getFloorQuery();//현재 층정보에 대한 쿼리를 새로 받아온다.
		q = q.replace("?", "&");//URL 쿼리에 추가해야하므로 replace 해준다.

		//현재 view가 '일', '월', '년'인지 구분해서 ajax URL 쿼리에 들어갈 string을 구성.
		if(nowTimeDate.length == 1){
			ajaxText = 'year=' + nowTimeDate[0];
		}
		if(nowTimeDate.length == 2){
			ajaxText = 'year=' + nowTimeDate[0] + '&month=' + nowTimeDate[1];
		}
		if(nowTimeDate.length == 3){
			ajaxText = 'year=' + nowTimeDate[0] + '&month=' + nowTimeDate[1] + '&day=' + nowTimeDate[2];
		}

		//현재 탭에 해당하는 컨텐츠 DOM에 ViewModel 바인딩
		kendo.bind($(element), MainViewModel);

		//구성한 ajaxUrl 텍스트로 통신 시작
		$.ajax({
			url : '/energy/sac/energyLossDetection?' + ajaxText + q
		}).done(function(data){
			energyEetectionTab = $("#operating-common-tab").find(".k-tabstrip-items").find("[aria-controls=operating-common-tab-3]").find(".k-link");//비효율운전감지 탭 DOM 할당
			attachEvent();//이벤트 등록
			createView(data);//UI에 표시될 위젯들 초기화하여 디스플레이
			MainViewModel.nextBtn.set("disabled", true);//초기 디폴트 설정이 오늘 날짜이므로 next 화살표 버튼 비활성화
		}).fail(function(data){
			var msg = Util.parseFailResponse(data);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			CoreModule.on("onfloorchange", onFloorChangeEvt);
			Loading.close();
		});
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
	//층 변경 시마다 쿼리를 생성하여 URL로 사용해서 데이터를 refresh
	// [2018-04-10][해당 함수는 층변경시 쿼리를 생성하여 리프레쉬하는 변수라고 선언되어있지만 해당함수를 호출하는 코드가없고 refreshData 안에 층정보 쿼리를 반환하는 getFloorQuery 함수가 존재 해당함수는 주석처리]
	// var onFloorChange = function(floorData) {
	// 	var q = getFloorQuery(floorData);
	// 	q = getFloorQuery(floorData);
	// 	q = q.replace("?", "&");
	// 	refreshData(q);
	// 	// console.log('fsdfsd');		//[2018-04-10][콘솔주석]
	// };
	var initComponent = function(){
		//Target 시작

		//만약 상세 팝업이 필요할 경우. Widget 모듈에서 초기화 된 Popup을 가져온다.
		//detailPopup = Widget.getTargetDetailPopup();
	};
	/**
	 *
	 *   페이지 로드 시 화면 만들어주는 함수
	 *
	 *   @function createView
	 *   @param {Object} data - 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var createView = function(data){
		var setData = detectionDataSet(data);//서버응답값을 전처리하여 리턴
		initView(setData);
	};
	/**
	 *
	 *   페이지 로드 시 detection 페이지 랜더링하는 함수
	 *
	 *   @function routerInit
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	// var routerInit = function(){			// [2018-04-10][함수 선언 이후 사용하지않음 또한 비효율 운전감지 기능상 라우터를 활용하는 기능이 존재하지않음 사용하지않는 함수라고 판단하여 주석]
	// 	// Layout.render(targetView);		// [2018-04-05][targetView 가 파라메타로 전역 변수로도 존재하지않기에 주석처리하고 아래 새로생성하였습니다]
	// 	Layout.render();
	// };
	/**
	 *
	 *   페이지 로드 시 detection 페이지 보여주는 함수
	 *
	 *   @function routerEvt
	 *   @param {Object} view - 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	// var routerEvt = function(view){		// [2018-04-10][함수 선언 이후 사용하지않음 또한 비효율 운전감지 기능상 라우터를 활용하는 기능이 존재하지않음 사용하지않는 함수라고 판단하여 주석]
	// 	Layout.showIn("#target-main-view-content", view);
	// };
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
	/*버튼 또는 드롭다운리스트 등의 이벤트를 바인딩 한다.*/
	var attachEvent = function(){
		//View Model에 버튼 이벤트 바인딩

		//날짜 Prev, Next 변경 버튼
		MainViewModel.nextBtn.set("click", function(){						//[2018-04-10][e파라메타 미사용 삭제]
			//아래는 에시
			//MainViewModel.set("formattedDate", moment().format("LLL"))
			  // var nowTimeDate = MainViewModel.formattedDate;				// [2018-04-10][변수선언후 미사용 주석처리]
			var date = dateFormChange(MainViewModel.formattedDate,1); //날짜 변경
			MainViewModel.set("formattedDate", moment().format(date));

			dateOverChange();//날짜변경 이후 이상한 조건이면 오늘날짜로 셋
			dateChange();//년, 월, 일의 변경 및 날짜네비게이션 변경 시 formattedDate, setDateView 갱신
			refreshData();
		});
		MainViewModel.prevBtn.set("click", function(){						//[2018-04-10][e파라메타 미사용 삭제]
			  // var nowTimeDate = MainViewModel.formattedDate;				// [2018-04-10][변수선언후 미사용 주석처리]
			var date = dateFormChange(MainViewModel.formattedDate,-1);
			MainViewModel.set("formattedDate", moment().format(date));
			dateOverChange();
			dateChange();
			refreshData();
			//아래는 예시
			//MainViewModel.set("formattedDate", moment().format("LLL"))
		});

		//'일' 버튼
		MainViewModel.dayBtn.set("click", function(){						//[2018-04-10][e파라메타 미사용 삭제]
			//다른버튼 비활성화
			MainViewModel.monthBtn.set("active", false);
			MainViewModel.yearBtn.set("active", false);

			//이미 활성화 되어있다면 종료.
			if(MainViewModel.monthBtn.get("active") == true){
				return;
			}

			//현재 뷰에 있는 날짜 포맷으로 변경하여 저장.
			MainViewModel.set("formattedDate", moment().format(dateButtonClick('day')));
			MainViewModel.dayBtn.set("active", true);
			dateOverChange();
			refreshData();
		});
		//'월' 버튼
		MainViewModel.monthBtn.set("click", function() {					//[2018-04-10][e파라메타 미사용 삭제]
			MainViewModel.dayBtn.set("active", false);
			MainViewModel.yearBtn.set("active", false);
			if(MainViewModel.monthBtn.get("active") == true){
				return;
			}
			MainViewModel.monthBtn.set("active", true);
			MainViewModel.set("formattedDate", moment().format(dateButtonClick('month')));//현재 뷰에 적용된 날짜 포맷 스트링으로 날짜값 저장.
			dateOverChange();
			refreshData();
		});
		//'년' 버튼
		MainViewModel.yearBtn.set("click", function(){						//[2018-04-10][e파라메타 미사용 삭제]
			MainViewModel.dayBtn.set("active", false);
			MainViewModel.monthBtn.set("active", false);
			if(MainViewModel.yearBtn.get("active") == true){
				return;
			}
			MainViewModel.set("formattedDate", moment().format(dateButtonClick('year')));
			MainViewModel.yearBtn.set("active", true);
			dateOverChange();
			refreshData();
		});

		//조건설정 버튼 - 팝업을 띄운다.
		$('.operating-view-btn .setting-open').on('click',function(){
			//[주의] singlePop은 아래에 선언 및 할당되어있음.
			singlePop.kendoPopupSingleWindow("openWindowPopup");//팝업 오픈
			initPopupGrid();//팝업 내부 그리드 초기화 - 팝업 오픈할 때마다 초기화 한다.

			$('#detectionPopup_wnd_title').html(TEXT.ENERGY_CONDITION_SETTING);//타이틀 적용
		});

		//팝업의 close 버튼 클릭 시 이벤트 등록
		$('#detectionPopup').on('click','.popup-footer [data-event="popupClose"]',function(){
			if($('#detectionPopup').find('.popup-footer [data-event="save"]').prop('disabled')){//변경된 사항이 없다면 그냥 닫는다.
				singlePop.data("kendoPopupSingleWindow").close();
			}else{//변경되면,
				confirmDialog.setConfirmActions({//또 다른 Confirm Dialog의 yes 버튼 이벤트를 새롭게 set
					yes : function(){
						singlePop.data("kendoPopupSingleWindow").close();
					},
					no:function(){//아니면 confirm 다이얼로그만 받는다.
						confirmDialog.close();
					}
				});
				confirmDialog.message(MSG.COMMON_CLOSE_WINDOW_CONFIRM);
				confirmDialog.open();
			}
		});

		//팝업 저장버튼 이벤트 등록
		$('#detectionPopup').on('click','.popup-footer [data-event="save"]',function(){
			//변경된 내용 저장 메시지 다이얼로그
			msgDialog.message(MSG.COMMON_MESSAGE_NOTI_CHANGES_SAVED);
			msgDialog.open();

			//저장을 위한 PATCH ajax 콜
			Loading.open();
			$.ajax({
				url:"/energy/sac/energyLossDetection/setting",
				method: "PATCH",
				data: detectionSettingData
			}).done(function(){				//[2018-04-10][data 파라메타 미사용 삭제]
			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
				singlePop.data("kendoPopupSingleWindow").close();
			});
		});

		//체크박스 값이 변경될 떄 콜백 등록
		$('#detectionPopup').on('change','.setting-list .k-checkbox',function(){
			var settingName = $(this).closest('li').attr('data-settingName');//변경된 input에 해당하는 detectionSettingData의 키 이름.
			detectionSettingData[settingName] = $(this).prop('checked');//변경된 input 값을 객체에 반영
			$('#detectionPopup').find('.popup-footer [data-event="save"]').attr('disabled',false);//값이 변경되었으므로 save 버튼 활성화
		});

		//비효율 운전 감지 탭 클린된 경우 층 네비게이션 활성화
		energyEetectionTab.on('click',function(){
			MainWindow.disableFloorNav(false);
			refreshData();
		});

		$('#main-sidebar-menu .btn-box').off('click', '.btn', graphResizeEvt).on('click', '.btn', graphResizeEvt);
		consumptionTab.bind('show', function (e) {
			if($(e.item).data('role') === 'energylossdetection') graphResizeEvt();
		});
	};

	var graphResizeEvt = function (e) {
		normalGraph.setOptions({chartArea: {width: $('#detection-main-view').width()}});
	};
	/**
	 *
	 *   팝업에 들어갈 데이터를 받아온다
	 *
	 *   @function initPopupGrid
	 *   @param {Object} allPopupData -  popup 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var initPopupGrid = function(){			//[2018-04-10][allPopupData 파라메타 미사용 삭제]
		Loading.open($('#detectionPopup'));
		$('.setting-container .setting-list .setting-drop-box').empty();

		//팝업창 내부 드랍다운리스트에 root DOM인 input 요소를 append 한다.
		$('.setting-container .setting-list .setting-drop-box').each(function () {
			var self = $(this);
			var idx = self.closest("li[data-settingname]").index();
			self.append('<input type="text" class="setting-drop" data-role="dropdownlist" id="setting-drop-id-' + idx + '">');
		});

		$('#detectionPopup').find('.popup-footer [data-event="save"]').attr('disabled',true); //수정 전에는 save 버튼 비활성화

		//팝업창 내용을 구성하는 ajax 호출
		$.ajax({
			url : "/energy/sac/energyLossDetection/setting"
		}).done(function(data){
			detectionSettingData = data;//전역으로 사용
			// var listTemplate;			//[2018-04-10][변수선언후 미할당 미사용 주석처리]

			for(var settingList in detectionSettingData){//응답데이터의 키마다 loop
				$('.setting-container .setting-list').find('[data-settingName="' + settingList + '"] .k-checkbox').prop('checked',detectionSettingData[settingList]);//응답값을 해당 키에 매칭된 체크박스에 값 적용

				//해당 키에 매칭되는 드랍다운리스트 위젯 초기화 및 change 콜백 등록.
				if(settingList == 'longTimeOperationSetTime'){//'끄기잊음' 항목
					var longTimeOperationDropdown = $('.setting-container .setting-list').find('[data-settingName="longTimeOperation"] .setting-drop').kendoDropDownList({
						dataTextField: "text",
						dataValueField: "value",
						dataSource: longTimeOperationData,
						index: 0,
						change: function(e){//값이 변경되면 전역으로 선언된 (팝업창 관련 데이터를 들고 있는) 변수의 해당 키의 값을 저장
							detectionSettingData.longTimeOperationSetTime = Number(e.sender.dataSource.options.data[e.sender.selectedIndex].value);
							$('#detectionPopup').find('.popup-footer [data-event="save"]').attr('disabled',false);//변경되면 save 버튼 활성화
						}
					}).data('kendoDropDownList');

					//드랍다운리스트 위젯 인스턴스에서 제공해주는 메소드 search를 사용하여 서버에서 응답받은 값으로 dropdownlist 값을 적용한다.
					longTimeOperationDropdown.search(String(detectionSettingData[settingList]));
					//변경된 값을 _old 키에 할당
					longTimeOperationDropdown._old = String(detectionSettingData[settingList]);
				 }
				 if(settingList == 'overTimeOperationSetTime'){//'시간초과' 항목
					var timeOperationDropdown = $('.setting-container .setting-list').find('[data-settingName="overTimeOperation"] .setting-drop').kendoDropDownList({
						dataTextField: "text",
						dataValueField: "value",
						dataSource: timeOperationData,
						index: 0,
						change: function(e){
							// console.log(e);		//[2018-04-10][콘솔주석처리]
							detectionSettingData.overTimeOperationSetTime = e.sender.dataSource.options.data[e.sender.selectedIndex].value;
							$('#detectionPopup').find('.popup-footer [data-event="save"]').attr('disabled',false);
						}
					}).data('kendoDropDownList');
					timeOperationDropdown.search(detectionSettingData[settingList]);
					timeOperationDropdown._old = detectionSettingData[settingList];
				 }
			 }

		}).fail(function(xhq){
			// var msg = Util.parseFailResponse(data); //[2018-04-05][data 변수가 존재하지않기에 xhq로 대체하였습니다]
			var msg = Util.parseFailResponse(xhq);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			 Loading.close($('#detectionPopup'));
		});
	};
	/**
	 *
	 *   날짜 버튼 active 따른 날짜를 만드는 함수
	 *
	 *   @function dateButtonClick
	 *   @param {String} date - 현재 버튼 상태
	 *   @returns {Object} returnData -  현재 날짜
	 *   @alias 없음
	 *
	 */
	//버튼 클릭에 따라 날짜 스트링 형식을 바꾸어 리턴 YYYY-MM-DD
	var dateButtonClick = function(date){
		var returnData = '';
		var beforeData = MainViewModel.setDateView.split('-');
		var nowMonthMaxDays;
		// var afterDate = [];				//[2018-04-10][변수 선언후 미사용 주석처리]


		if(date == 'year'){
			returnData = beforeData[0];
		}
		if(date == 'month'){
			returnData = beforeData[0] + '-' + beforeData[1];
		}
		if(date == 'day'){
			returnData = beforeData[0] + '-' + beforeData[1] + '-' + beforeData[2];
			nowMonthMaxDays = getMonthDay(beforeData[0],beforeData[1]).length;
			if(nowMonthMaxDays < beforeData[2]){
				beforeData[2] = nowMonthMaxDays;
				returnData = beforeData[0] + '-' + beforeData[1] + '-' + beforeData[2];
			}
		}
		return returnData;
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
	//사용안함
	  // var activeGraph = function(){			//[2018-04-10][파라메타 e 미사용 제거 해당함수 선언후 미사용 주석처리]
		//disable all btn
	// 	MainViewModel.graphBtn.set("active", true);
	// 	MainViewModel.listBtn.set("active", false);
	// 	Router.navigate(Views.graph.routeUrl);
	// };
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
	//사용안함
	// var activeList = function(e){			//[2018-04-10][파라메타 e 미사용 제거 해당함수 선언후 미사용 주석처리]
	// 	//enable all btn
	// 	MainViewModel.listBtn.set("active", true);
	// 	MainViewModel.graphBtn.set("active", false);
	// 	Router.navigate(Views.list.routeUrl);
	// };
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
	/**
	 *
	 *   서버에서 받은 데이터를 detection 데이터로 만듬
	 *
	 *   @function detectionDataSet
	 *   @param {Array} data - detection 데이터
	 *   @returns {Object} allData -  가공된 그래프 데이터
	 *   @alias 없음
	 *
	 */
	/* 데이터 ajax */
	//ajax 요청으로 받아온 서버 응답값으로 비효율 운전 감지 탭에 대한 모든 UI에 데이터를 디스플레이 하는 구성.
	var detectionDataSet = function(data){
		var viewData;
		var dateName,graphDataName;
		var nowTimeDate = MainViewModel.formattedDate.split('-');
		// var dayList; //[2018-04-10][getMonthDay 함수를 common에서 받아오면서 아래 for문에 구문이 불필요해져서 해당 변수도 주석처리함]
		var dateDetailName;
		// var dayWeek;		//[2018-04-10][해당 변수를 사용하는 구문이 예전에 주석처리되어 미사용변수로 전환되어 주석처리함]
		var categories;		//[2018-04-05][var 선언하지않은 전역변수로 할당을 방지하기위해 변수선언 detectionDataSet 함수밖으로 categories 전역으로 사용되는일없음]

		//비효율 운전감지 탭을 구성하는 모든 디스플레이 항목 총 4개
		allData.graphLosses = {};//메인 그래프
		allData.energyLossDetails = [];//비효율 건수(Pie)
		allData.top5EnergyLosses = [];//top5 리스트
		allData.energyLossEvents = [];//비효율 운전이력 리스트

		//현재 뷰에 있는 날짜 포맷에 따라 메인 그래프의 옵션값 설정을 준비.
		if(nowTimeDate.length == 1){
			dateName = 'monthly';//서버 응답값 객체의 키 그대로 사용
			dateDetailName = 'month';//서버 응답값 객체의 키 그대로 사용
			graphDataName = 'monthlyLosses';//서버 응답값 객체의 키 그대로 사용
			/*categories = ['01 [JAN]', '02 [FEB]', '03 [MAR]', '04 [APRIL]', '05 [MAY]', '06 [JUN]', '07 [JUL]', '08 [AUG]', '09 [SEP]','10 [OCT]', '11 [NOV]', '12 [DEC]'];*/
			// categories = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
			categories = Common.getChartXAxisLabel('year');
		}
		if(nowTimeDate.length == 2){
			dateName = 'daily';//서버 응답값 객체의 키 그대로 사용
			graphDataName = 'dailyLosses';//서버 응답값 객체의 키 그대로 사용
			dateDetailName = 'day';//서버 응답값 객체의 키 그대로 사용
			//[2018-04-10][문자열로 반환된 0이 들어간 숫자를 아래 반복문으로 처리하지않고 common.js에 함수를 추가하여 세번쨰 인자값으로 false 넘겨주면 number타입으로 리턴하도록 수정하여 아래구문을 수정함]
			// categories = [];
			// dayList = getMonthDay(nowTimeDate[0], nowTimeDate[1]);
			// for(var MonthlyForIndex = 0; MonthlyForIndex < dayList.length; MonthlyForIndex++){									//[2018-04-10][block-scope-var 경고를 해결하기위해 변수명 기존 i -> ]
			// 	// dayWeek = new Date(nowTimeDate[0], nowTimeDate[1],dayList[MonthlyForIndex]);		//[2018-04-10][해당 변수를 사용하는 구문이 예전에 주석처리되어 미사용변수로 전환되어 해당변수도 선언하지않은 변수가되어 주석처리]
			// 	categories.push(Number(dayList[MonthlyForIndex])/*+'['+weekCheckList[String(dayWeek).split(' ')[0]]+']'*/);
			// }
			categories = Common.getChartXAxisLabel('month', MainViewModel.formattedDate);
			// categories = getMonthDay(nowTimeDate[0], nowTimeDate[1], false);


		}
		if(nowTimeDate.length == 3){
			dateName = 'hourly';//서버 응답값 객체의 키 그대로 사용
			dateDetailName = 'hour';//서버 응답값 객체의 키 그대로 사용
			graphDataName = 'hourlyLosses';//서버 응답값 객체의 키 그대로 사용
			categories = Common.getChartXAxisLabel('day');
			// categories = ['0AM', '1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM'];
		}

		/* 데이터 있는지 확인 */
		viewData = data[dateName];//서버 응답값 할당

		//메인 그래프 설정값 초기화
		allData.graphLosses.data = [];
		allData.graphLosses.categories = categories;
		allData.graphLosses.min = 0;
		allData.graphLosses.max = 10;

		if(viewData && viewData[graphDataName]){
			allData.graphLosses.data = [];

			//그래프 시리즈 데이터 초기화
			for(var i = 0; i < categories.length; i++){
				allData.graphLosses.data.push(null);
			}

			allData.graphLosses.categories = categories;//카테고리
			allData.graphLosses.min = 0;//최소값 - 무조건 0으로 해달라고 함.
			allData.graphLosses.max = viewData['max'];//서버 응답값의 max 값 사용

			//서버 응답값의 데이터 => UI에서 사용할 데이터 객체(allData)에 할당
			for(var k = 0; k < categories.length; k++){
				for(var j = 0; j < viewData[graphDataName].length; j++){
					if(dateDetailName == 'hour' && k  ==  (viewData[graphDataName][j][dateDetailName])){
						allData.graphLosses.data[k] = viewData[graphDataName][j]['count'];
					}
					if(dateDetailName == 'month' && k  ==  (viewData[graphDataName][j][dateDetailName] - 1)){//서버 응답값에 month의 경우 1부터 시작
						allData.graphLosses.data[k] = viewData[graphDataName][j]['count'];
					}
					if(dateDetailName == 'day' && k  ==  (viewData[graphDataName][j][dateDetailName] - 1)){//서버 응답값에 day의 경우 1부터 시작
						allData.graphLosses.data[k] = viewData[graphDataName][j]['count'];
					}
				}
			}
		}

		allData.energyLossDetails = energyDataNameNull;
		//서버 응답값을 그대로 할당
		if(viewData && viewData['energyLossDetails']){
			allData.energyLossDetails = viewData['energyLossDetails'];
		}
		if(viewData && viewData['top5EnergyLosses']){
			allData.top5EnergyLosses = viewData['top5EnergyLosses'];
		}
		if(viewData && viewData['energyLossEvents']){
			allData.energyLossEvents = viewData['energyLossEvents'];
		}
		return allData;
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
	var refreshData = function(q){//층 변경시 쿼리를 세팅하여 인자로 전달.
		Loading.open();
		var nowTimeDate = MainViewModel.formattedDate.split('-');
		q = getFloorQuery();//[주의]인자로 q 전달 받았지만 getFloorQuery 함수 사용하여 새로 받아옴.
		q = q.replace("?", "&");

		var ajaxText;//ajax 호출에 사용할 URL 텍스트

		//뷰에 있는 날짜 조건 적용
		if(nowTimeDate.length == 1){
			ajaxText = 'year=' + nowTimeDate[0];
		}
		if(nowTimeDate.length == 2){
			ajaxText = 'year=' + nowTimeDate[0] + '&month=' + nowTimeDate[1];
		}
		if(nowTimeDate.length == 3){
			ajaxText = 'year=' + nowTimeDate[0] + '&month=' + nowTimeDate[1] + '&day=' + nowTimeDate[2];
		}

		//새로 데이터를 받아온다.
		$.ajax({
			url : '/energy/sac/energyLossDetection?' + ajaxText + q
		}).done(function(data){
			var newData;
			if(!data){
				newData = [];
			}
			newData = data;
			createView(newData);//새로 받아온 데이터로 뷰를 갱신
		}).fail(function(data){
			var msg = Util.parseFailResponse(data);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function(){
			Loading.close();
		});
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
	// 날짜 네비게이션 화살표 버튼 클릭하여 날짜 변경 이후 '일', '월', '년'버튼 클릭 시
	// 현재 상황에 없는 날짜가 적용될 경우 오늘날짜로 리셋
	var dateOverChange = function(){
		var setDate = MainViewModel.formattedDate.split('-');
		/* 현재 날짜 이후로 움직이지 않도록 작업 */
		var nowDate = new Date();
		var dateLength = setDate.length;
		var yearValue,monthValue, dayValue,nowCompareDateSet,afterCompareDateSet;		//[2018-04-10][기존 afterCompareDateSe 명으로 되어 사용되지않았던 변수 그리고 아래에 유사한 변수명이 afterCompareDateSet 변수를 찾이못하고 전역으로 선언하고 사용하는 변수가있어 오타라고 판단하여 변수명을 afterCompareDateSe -> afterCompareDateSet 수정 ]
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
		var oriSetDateViewDate = MainViewModel.get("setDateView");
		var oriSetDateViewDateDayValue = null;
		if(dateLength >= 1){
			yearValue = Number(setDate[0]);
			setChangeDate = nowDateList.year;
			nowCompareDateSet = Number(String(compareDateList.year));
			if(Number(yearValue) == nowCompareDateSet){
				MainViewModel.nextBtn.set("disabled", true);
			}else if(Number(yearValue) > nowCompareDateSet){
				MainViewModel.nextBtn.set("disabled", true);
				MainViewModel.set("formattedDate",setChangeDate);
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
				MainViewModel.set("formattedDate",setChangeDate);
				// MainViewModel.set("setDateView",setChangeDate);
				oriSetDateViewDateDayValue = oriSetDateViewDate.split('-')[2];//일
				MainViewModel.set("setDateView",setChangeDate + '-' + oriSetDateViewDateDayValue);
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
				MainViewModel.set("formattedDate",setChangeDate);
				MainViewModel.set("setDateView",setChangeDate);
			}else{
				MainViewModel.nextBtn.set("disabled", false);
			}
		}

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
	//날짜 네비게이션 화살표 버튼 클릭 시 날짜변경 적용
	var dateFormChange = function(date, value){
		var dateList = date.split('-');
		var dateLength = dateList.length;
		var yearValue,monthValue,dayValue;
		var valueStyle;

		var monthChangeData,dayChangeData;
		var monthListData,dayListData;
		monthListData = ['01','02' ,'03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
		if(dateLength >= 1){
			yearValue = Number(dateList[0]);
			valueStyle = 'year';
		}
		if(dateLength >= 2){
			monthValue = Number(dateList[1]);
			valueStyle = 'month';
			dayListData = getMonthDay(yearValue,monthValue);
		}
		if(dateLength >= 3){
			dayValue = Number(dateList[2]);
			valueStyle = 'day';
		}
		// console.log(date,value);

		if(valueStyle == 'year'){
			yearValue = yearValue + value;
			return String(yearValue);
		}else if(valueStyle == 'month'){
			monthValue = monthValue + value;
			if(monthValue > monthListData.length || monthValue <= 0){
				if(monthValue > 0){
					monthChangeData = monthListData[0];
				}else{
					monthChangeData = monthListData[11];
				}
				return (yearValue + value) + '-' + monthChangeData;
			}
			return yearValue + '-' + monthListData[(monthValue) - 1];
		}else if(valueStyle == 'day'){
			dayValue = dayValue + value;

			if(dayValue > dayListData.length || dayValue <= 0){
				if(dayValue > 0){
					monthValue = monthValue + value;
					if(monthValue > monthListData.length || monthValue <= 0){
						if(monthValue > 0){
							monthChangeData = monthListData[0];
							dayListData = getMonthDay((yearValue + value),1);
						}else{
							monthChangeData = monthListData[11];
							dayListData = getMonthDay((yearValue + value),12);
						}

						dayChangeData = dayListData[0];
						return (yearValue + value) + '-' + monthChangeData + '-' + dayChangeData;
					}
					dayListData = getMonthDay(yearValue,monthValue);
					dayChangeData = dayListData[0];
					return yearValue + '-' + monthListData[monthValue - 1] + '-' + dayChangeData;

				}
				dayChangeData = dayListData[dayListData.length - 1];
				monthValue = monthValue + value;
				if(monthValue > monthListData.length || monthValue <= 0){
					if(monthValue > 0){
						monthChangeData = monthListData[0];
						dayListData = getMonthDay((yearValue + value),1);
					}else{
						monthChangeData = monthListData[11];
						dayListData = getMonthDay((yearValue + value),12);
					}

					dayChangeData = dayListData[dayListData.length - 1];
					return (yearValue + value) + '-' + monthChangeData + '-' + dayChangeData;
				}
				dayListData = getMonthDay(yearValue,monthValue);
				dayChangeData = dayListData[dayListData.length - 1];
				return yearValue + '-' + monthListData[monthValue - 1] + '-' + dayChangeData;

			}
			return yearValue + '-' + monthListData[monthValue - 1] + '-' + dayListData[dayValue - 1];

		}

		// [2018-04-05][상단에 동일한 내용으로 선언된 중복된 함수가 있어 주석]
		// function getMonthDay(year,month){
		// 	var lastDay = (new Date( year, month, 0)).getDate(),
		// 		monthDayList = [];
		// 	for(var i = 1; i <= lastDay; i++){
		// 		if(String(i).length == 1){
		// 			monthDayList.push('0' + i);
		// 		}else{
		// 			monthDayList.push(i);
		// 		}
		// 	}
		// 	return monthDayList;
		// }
	};
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
	//'일', '월', '년' 버튼 변경 + 날짜가 변경된 경우
	//항상 total format 날짜를 들고 있는다. -> MainModel의 setDateView
	var dateChange = function(){
		var afterDate = MainViewModel.formattedDate.split('-');
		var beforeData = MainViewModel.setDateView.split('-');
		var setData;
		if(afterDate.length >= 1){
			beforeData[0] = afterDate[0];
		}
		if(afterDate.length >= 2){
			beforeData[1] = afterDate[1];
		}
		if(afterDate.length >= 3){
			beforeData[2] = afterDate[2];
		}
		setData = beforeData[0] + '-' + beforeData[1] + '-' + beforeData[2];
		MainViewModel.set("setDateView", moment().format(setData));
	};
	/**
	 *
	 *   첫 시작시 view 만들어주는 함수
	 *
	 *   @function initGraph
	 *   @param {Array} dataSource - view 데이터 리스트
	 *   @returns {Object} Object - 새로운 detection 위젯
	 *   @alias 없음
	 *
	 */
	/* 화면 view 만들어지는 함수 */
	var initView = function(dataSource){//dataSource 파라메터는 서버응답값이 전처리되어 리턴된 객체(allData)
		normalGraphElm = detectionView.find('.top-box');//메인그래프
		pieGraphElm = detectionView.find('.left-box .graph-box');//비효율 건수
		top5GridElm = detectionView.find('.right-box .middle-right-grid');//Top 5
		eventGridElm = detectionView.find('.bottom-box .bottom-middle-grid');//비효율 운전 이력

		//DOM 내부 초기화
		normalGraphElm.empty();
		pieGraphElm.empty();
		top5GridElm.empty();
		eventGridElm.empty();
		detectionView.find('.boardtitle').remove();//비효율 운전감지 탭을 클릭할 때마다 boardtitle을 넣어주므로 DOM 삭제 필요가 있음

		var chartOptions = Util.getChartOptionsForFiveChartSection(dataSource.graphLosses.max, 0);
		if (!chartOptions.newMax) chartOptions.newMax = 1;
		/*
		 *  메인그래프 - column 그래프 위젯 생성 - 파라메터로 전달받은 객체로 위젯 옵션을 설정한다.
		 */
		normalGraph = normalGraphElm.kendoChart({
			axisDefaults:{
				line:{
					visible: false
				},
				majorGridLines:{
					color: "#d6d6d6"
				}
			},
			seriesDefaults: {
				spacing: 0.1,
				gap: 0.2,
				overlay: { gradient: "none" },
				border: {width: 0}
			  },
			chartArea: {
				background:'#fbfbfb',
				height: 500,
				width: $('#detection-main-view').width()
			  },
			plotArea: { background: "#ebebeb" },
			legend: {
				visible: false
			},
			xAxis:{
				border:{color:'#444'}
			},
			series: [{
				type: "column",
				data: dataSource.graphLosses.data.map(function(num){return Util.convertNumberFormat(num);}),

				stack:'energyLoss',
				name: 'energyLoss',
				color: '#45b078'
			}],
			valueAxes:[{
				// majorGridLines: {visible: false},  // [2018-04-05][중복선언 주석]
				name: "energyLoss",
				min: 0,
				max: chartOptions.newMax,
				majorUnit: chartOptions.newMajorUnit,
				axis: "energyLoss",
				majorGridLines: {
					visible: false
				},
				labels: {
					template: function(data) {
						return Util.convertNumberFormat(data.value);
					}
				}
			}],
			selectionTooltip: {
				isVisible: true,
				width: 400,
				seriesKeysForRowName: ["name"],
				rowGroupNames: [],
				rowTemplate: function(seriesItem) {
					var row = {
						groupName:"",
						content: "",
						priority: 0
					};
					var seriesName = seriesItem.series.name;
					switch(seriesName) {
					case "energyLoss": row.content += "<span class='energy-sacMonitoring-graph-tooltip-legend-Square' style='background-color:" + seriesItem.series.color + "'></span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-name'>" + I18N.prop("ENERGY_NUMBER_OF_LOSS_DETECTION_COUNT") + "</span>" + "<span class='energy-sacMonitoring-graph-tooltip-content-data'>" + seriesItem.data + "</span>"; row.priority = 1; break;
					default: row.content = ""; row.priority = 0; row.groupName = "";
					}
					// row.groupName = seriesItem.series.name == "temperature" ? "" : seriesItem.series.stack;
					return row;
				}
			},
			// tooltip: {
			// 	visible: true,
			// 	template:  handleTooltip,
			// 	color:'#444444',
			// 	background : '#f7f7f7',
			// 	border: {
			// 		width: 0,
			// 		color: "#f7f7f7"
			// 	}
			// },
			categoryAxis: {
				categories: dataSource.graphLosses.categories,
				axisCrossingValues: [0, 0, 100, 100]
			}

		}).data('kendoChart');

		/*
		 *  비효율 건수 - 파이 차트 옵션 설정
		 */
		pieGraph = pieGraphElm.kendoChart({
			dataSource: {
				data: dataSource.energyLossDetails
			},
			legend: {
				visible: false
			},
			chartArea: {
				background:'#f0f0f0'
			},
			series: [{
				type: "donut",
				size: 20,
				holeSize: 50,
				field: "count",//서버응답값의 energyLossDetails 값의 count키와 매칭.
				name:'energyLossDetails',
				categoryField: "name",
				overlay: {
					gradient: "none"
				}
			}],
			tooltip: {
				visible: true,
				template:  handleTooltip,
				color:'#444444',
				background : '#f7f7f7',
				border: {
					width: 0,
					color: "#f7f7f7"
				}
			},
			seriesColors: ["#2c81db", "#08b5d4","#68ba11","#feac5a","#f0824f","#eb5b6c","#7c62f0"]//서버응답값 energyLossDetails의 배열 인덱스에 배칭하여 색 지정
		}).data('kendoChart');

		//비효율 운전감지 탭을 클릭할 때마다 boardtitle DOM을 넣어준다.
		detectionView.find('.left-box').prepend('<p class="boardtitle inefficiency-cases-title">' + TEXT.ENERGY_NUMBER_OF_LOSS_DETECTION + '</p>');
		//비효율 건수의 레전드를 DOM으로 생성하여 적용
		$('#detection-main-view .legendbox .unit').text('');//단위
		$('#energy_loss_chart_legend').empty();//항목 리스트(ul)
		if(dataSource.energyLossDetails.length > 0){
			for(var i = 0; i < dataSource.energyLossDetails.length; i++){
				var energyLossName = energyDataNameSet[dataSource.energyLossDetails[i].name];//상단에 설정된 다국어 객체에 매칭하여 이름을 넣어준다.
				if(!energyLossName){
					energyLossName = '';
				}
				//레전드에 넣어줄 li append
				var tmp = '<li><span class="squmark"></span><p class="legendtxt">' + energyLossName + '</p><p class="valuetxt">' + dataSource.energyLossDetails[i].count + '</p></li>';
				$('#energy_loss_chart_legend').append(tmp);
			}
			$('#detection-main-view .legendbox .unit').text('(EA)');//단위
		}

		/*
		 *  그리드 설정 - Top5, 비효율 운전 이력
		 */
		//Top 5 - 컬럼 셋(서버 응답 객체의 키값과 그대로 매칭)
		var top5GridColumns = [
			{ field: "rank", title:TEXT.ENERGY_RANK, attributes: {"data-name": 'month' }, width:49,format: "" ,editable: false,sortable: false,template:gridTemplate.rank},
			{ field: "name", title:TEXT.ENERGY_TYPE,attributes: {"data-name": 'sac' }, width:235,format: "" ,editable: false,sortable: false,template:gridTemplate.name},
			{ field: "deviceName", title:TEXT.ENERGY_DEVICE_NAME,attributes: {"data-name": 'temperature' }, width:215,format: "" ,editable: false,sortable: false,template:gridTemplate.deviceName},
			{ field: "count", title:TEXT.ENERGY_COUNT,attributes: {"data-name": 'temperature' }, width:187,format: "" ,editable: false,sortable: false,template:gridTemplate.count}
		];
		// var top5GridColumns = [
		// 	{ field: "rank", title:TEXT.ENERGY_RANK, attributes: {"data-name": 'month', style: "text-align: right; font-size: 15.5px" }, width:49,format: "" ,editable: false,sortable: false,template:gridTemplate.rank},
		// 	{ field: "name", title:TEXT.ENERGY_TYPE,attributes: {"data-name": 'sac', style: "text-align: right; font-size: 15.5px" }, width:235,format: "" ,editable: false,sortable: false,template:gridTemplate.name},
		// 	{ field: "deviceName", title:TEXT.ENERGY_DEVICE_NAME,attributes: {"data-name": 'temperature', style: "text-align: right; font-size: 15.5px" }, width:215,format: "" ,editable: false,sortable: false,template:gridTemplate.deviceName},
		// 	{ field: "count", title:TEXT.ENERGY_COUNT,attributes: {"data-name": 'temperature', style: "text-align: right; font-size: 15.5px" }, width:187,format: "" ,editable: false,sortable: false,template:gridTemplate.count}
		// ];
		//비효율 운전 이력 - 컬럼 셋(서버 응답 객체의 키값과 그대로 매칭)
		var eventGridColumns = [
			{ field: "eventTime", title:TEXT.ENERGY_DATE_OF_EVENT, attributes: {"data-name": 'month' }, width:100,format: "" ,editable: false,sortable: false,template:gridTemplate.eventTime},
			{ field: "location", title:TEXT.ENERGY_LOCATION,attributes: {"data-name": 'sac' }, width:100,format: "" ,editable: false,sortable: false,template:gridTemplate.location},
			{ field: "deviceName", title:TEXT.ENERGY_DEVICE_NAME,attributes: {"data-name": 'temperature' }, width:100,format: "" ,editable: false,sortable: false,template:gridTemplate.deviceName},
			{ field: "energyLossName", title:TEXT.ENERGY_ENERGY_LOSS_NAME,attributes: {"data-name": 'temperature' }, width:100,format: "" ,editable: false,sortable: false,template:gridTemplate.energyLossName}
		];

		//Top5 그리드 위젯 생성
		top5Grid = top5GridElm.kendoGrid({
			columns: top5GridColumns,
			dataSource: dataSource.top5EnergyLosses,
			height: 250,
			scrollable: true,
			groupable : false,
			sortable: true,
			filterable: false,
			pageable: false,
			hasCheckedModel : false,
			setCheckedAttribute : false
		}).data('kendoGrid');

		//Top 5 타이틀 DOM 삽입
		top5GridElm.prepend('<p class="boardtitle inefficiency-top5-title">' + TEXT.ENERGY_TOP_FIVE + '</p>');

		//비효율 운전 이력 그리드 위젯 생성
		eventGrid = eventGridElm.kendoGrid({
			columns:eventGridColumns,
			dataSource: dataSource.energyLossEvents,
			height : 400,
			scrollable: true,
			groupable : false,
			sortable: true,
			filterable: false,
			pageable: false,
			hasCheckedModel : false,
			setCheckedAttribute : false
		}).data('kendoGrid');
		//비효율 운전 이력 타이틀 DOM 삽입
		eventGridElm.prepend('<p class="boardtitle inefficiency-history-title">' + TEXT.ENERGY_LIST_ENERGY_LOSS_DETECTION + '</p>');
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
	/* toolTip 작업 */
	var handleTooltip = function(e){
		var dataValue = e.value;
		var dataName = e.series.name;
		// var dataType = e.series.type;		// [2018-04-05][선언후 미사용 주석]
		var displayDataObject;
		// var categorySet;				// [2018-04-05][선언후 미사용 주석]
		if(dataName == "energyLoss"){
			displayDataObject = {
				title: TEXT.ENERGY_LOSS,
				value: dataValue
			};
		}

		if(dataName == "energyLossDetails"){
			displayDataObject = {
				title: energyDataNameSet[e.category],
				value: dataValue
			};
		}
		return '<div class="custom-chart-tooltip-container"><span class="tooltip-item-title">' + displayDataObject.title + '</span> : <span class="tooltip-item-value">' + displayDataObject.value + '</span></div>';
	};

	/* 그리드 템플릿 작업 */
	var gridTemplate = {
		rank : function(data){
			if(!data.rank){
				return '-';
			}
			return data.rank;

		},
		name : function(data){
			var energyDataName = '';
			if(!data.name){
				return '-';
			}
			if(energyDataNameSet[data.name]){
				energyDataName = energyDataNameSet[data.name];
			}
			return energyDataName;

		},
		// deviceId : function(data){
		// 	if(!data.deviceId){
		// 		return '-';
		// 	}
		// 	return data.deviceId;
		//
		// },		// [2018-04-05][하단에 이미 선언된 값이 있기에 주석처리]
		deviceId : function(data){
			if(!data.deviceId){
				return '-';
			}
			return data.deviceId;

		},
		count : function(data){
			if(!data.count){
				return '-';
			}
			return data.count;

		},
		eventTime : function(data){
			if(!data.eventTime){
				return '-';
			}
			return data.eventTime;

		},
		location : function(data){
			var locationType,locationCoordinates,returnValue;
			if(data.location){
				if(data.location.type){
					locationType = data.location.type;
				}else{
					locationType = '';
				}
				if(data.location.coordinates){
					locationCoordinates = '(' + data.location.coordinates[0] + ',' + data.location.coordinates[1] + ')';
				}else{
					locationCoordinates = '';
				}
				returnValue = locationType + locationCoordinates;
				if(!returnValue && !data.location.coordinates && !data.location.type && String(data.location).length > 0){
					returnValue = data.location;
				}else if(!returnValue){
					returnValue = '-';
				}
				return returnValue;
			}
			return '-';


		},
		deviceName : function(data){
			if(!data.deviceName){
				return '-';
			}
			return data.deviceName;

		},
		energyLossName : function(data){
			var returnData;
			if(!data.energyLossName){
				return '-';
			}
			returnData = energyDataNameSet[data.energyLossName];
			return returnData;
		}
	};

	var singlePop = $("#detectionPopup");//조건설정 팝업 DOM
	if(!singlePop.data("kendoPopupSingleWindow")){
		var detectionMessageDialog = $("#summary-building-message-dialog");
		var detectionConfirmDialog = $("#summary-building-confirm-dialog");
		detectionMessageDialog.kendoCommonDialog();
		detectionConfirmDialog.kendoCommonDialog({
			type: "confirm",
			title: "Notification"
		});
		singlePop = $("#detectionPopup").kendoPopupSingleWindow({
			model: Widget.Model,
			width: "1290px",
			height: "655px" }
		);
	}
	var timeOperationData = [
		{ text: "00:00", value: "00:00" },
		{ text: "00:30", value: "00:30" },
		{ text: "01:00", value: "01:00" },
		{ text: "01:30", value: "01:30" },
		{ text: "02:00", value: "02:00" },
		{ text: "02:30", value: "02:30" },
		{ text: "03:00", value: "03:00" },
		{ text: "03:30", value: "03:30" },
		{ text: "04:00", value: "04:00" },
		{ text: "04:30", value: "04:30" },
		{ text: "05:00", value: "05:00" },
		{ text: "05:30", value: "05:30" },
		{ text: "06:00", value: "06:00" },
		{ text: "06:30", value: "06:30" },
		{ text: "07:00", value: "07:00" },
		{ text: "07:30", value: "07:30" },
		{ text: "08:00", value: "08:00" },
		{ text: "08:30", value: "08:30" },
		{ text: "09:00", value: "09:00" },
		{ text: "09:30", value: "09:30" },
		{ text: "10:00", value: "10:00" },
		{ text: "10:30", value: "10:30" },
		{ text: "11:00", value: "11:00" },
		{ text: "11:30", value: "11:30" },
		{ text: "12:00", value: "12:00" },
		{ text: "12:30", value: "12:30" },
		{ text: "13:00", value: "13:00" },
		{ text: "13:30", value: "13:30" },
		{ text: "14:00", value: "14:00" },
		{ text: "14:30", value: "14:30" },
		{ text: "15:00", value: "15:00" },
		{ text: "15:30", value: "15:30" },
		{ text: "16:00", value: "16:00" },
		{ text: "16:30", value: "16:30" },
		{ text: "17:00", value: "17:00" },
		{ text: "17:30", value: "17:30" },
		{ text: "18:00", value: "18:00" },
		{ text: "18:30", value: "18:30" },
		{ text: "19:00", value: "19:00" },
		{ text: "19:30", value: "19:30" },
		{ text: "20:00", value: "20:00" },
		{ text: "20:30", value: "20:30" },
		{ text: "21:00", value: "21:00" },
		{ text: "21:30", value: "21:30" },
		{ text: "22:00", value: "22:00" },
		{ text: "22:30", value: "22:30" },
		{ text: "23:00", value: "23:00" },
		{ text: "23:30", value: "23:30" }
	];
	 var longTimeOperationData = [
		 { text: "12", value: "12" },
		 { text: "15", value: "15" },
		 { text: "18", value: "18" },
		 { text: "21", value: "21" }
		 ];

	return {
		init : init
	};

});
//# sourceURL=energy/samsungsac/detection.js
