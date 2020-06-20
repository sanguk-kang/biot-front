/**
 *
 *   <ul>
 *       <li>comparison에 관한 페이지</li>
 *       <li>빌팅, 건물, 층과 디바이스 필터, 존, 기기 옵션 선택 가능</li>
 *       <li>연, 월, 일 조정 가능</li>
 *       <li>그래프, 그리드 페이지 구분</li>
 *   </ul>
 *   @module app/energy/consumptionandtarget/comparison
 *   @param {Object} CoreModule- 에너지 core 객체
 *   @param {Object} ViewModel- comparison ViewModel 객체
 *   @param {Object} Model- comparison Model 객체
 *   @param {Object} Common- comparison Common 객체
 *   @param {Object} Widget- comparison Widget 객체
 *   @requires app/energy/core
 *   @requires app/energy/consumptionandtarget/view-model/comparison-vm
 *   @requires app/energy/consumptionandtarget/model/comparison-model
 *   @requires app/energy/consumptionandtarget/common/common
 *   @requires app/energy/consumptionandtarget/common/widget
 *   @returns {Object} 없음
 */
//comparison.js
define("energy/consumptionandtarget/comparison", ["energy/core",
	"energy/consumptionandtarget/view-model/comparison-vm",
	"energy/consumptionandtarget/model/comparison-model",
	"energy/consumptionandtarget/common/common",
	"energy/consumptionandtarget/common/widget"
], function(CoreModule, ViewModel, Model, Common, Widget) {

	//Util
	var moment = window.moment;
	var kendo = window.kendo;
	var LoadingPanel = window.CommonLoadingPanel;
	var Util = window.Util;
	var I18N = window.I18N;
	var Loading = new LoadingPanel();

	//View Model and Views
	var MainViewModel = ViewModel.MainViewModel,
		Views = ViewModel.Views;

	//Display Text
	var TEXT = Common.TEXT;

	//Router and Layout
	var Router = new kendo.Router();
	var Layout = new kendo.Layout("<div id='comparison-main-view-content' class='comparison-main-view-content'></div>", {wrap: false});

	//Dialog Message and Confirm DOM
	var msgDialog = Widget.msgDialog;

	//Device Data
	var deviceTypeData, deviceGroupData;

	//Access Wrapper DOM
	var comparisonView = $("#comparison-main-view");
	var consumptionTab = null;
	var typeFilterDataSourceUnit = {
		'Meter.WattHour': ['(kWh)', TEXT.ENERGY_METER_TYPE_WATTHOUR],
		'Meter.Gas': ['(㎥)', TEXT.ENERGY_METER_TYPE_GAS],
		'Meter.Water': ['(L)', TEXT.ENERGY_METER_TYPE_WATER],
		'Meter.Calori': ['', TEXT.ENERGY_METER_TYPE_CALORI],
		none: ['', '']
	};
	/**
	 *
	 *   comparison 페이지 진입시 기본 셋팅을 해주는 함수
	 *
	 *   @function init
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//Init Function - 진단 페이지 첫 실행 함수
	var init = function(tab) {
		var element = tab.contentElement(1);
		consumptionTab = tab;
		//최초 빈 껍데기 뷰만 만든다.
		createView();
		//View모델 바인딩
		kendo.bind($(element), MainViewModel);
		//이벤트 등록
		attachEvent();
		bindGroupListData();
	};

	/**
	 *
	 *   페이지 로드 시 탭 만들어주는 함수
	 *
	 *   @function bindGroupListData
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	// Get DMS group data from server for Group DropDownList
	// 두번째 드랍다운리스트의 리스트를 서버로부터 받아온다.
	// 뷰 생성
	// 이벤트 등록..
	var bindGroupListData = function() {
		Loading.open();
		$.ajax({
			url: '/dms/groups'
		}).done(function(data) {
			//그래프 단위 기호가 바뀔 수 있으므로 삭제 후 DOM 삽입
			$('.graphTopBox').remove();
			$('#comparison-main-view-content').prepend(graphTopBox()); //최초에는 파라메터를 전달하지 않는다. 유닛은 ""

			MainViewModel.dayBtn.click(); //최초 '일' 클릭 상태
			MainViewModel.exportBtn.set("disabled", true); //최초 내보내기 버튼 비활성화

			//최초 진단 탭 진입 시 응답받은 전체 그룹 데이터를 set 한다.
			MainViewModel.filters[1].options.set("dataSource", data);
			/*for (var i = 0; i < data.length; i++) {
				if (data[i].dms_devices_ids.length > 0) {
					MainViewModel.filters[1].options.dataSource.push({
						text: data[i].name,
						value: String(data[i].id)
					});
				}
			}*/
		}).fail(function(data) {
			var msg = Util.parseFailResponse(data);
			msgDialog.message(msg);
			msgDialog.open();
		}).always(function() {
			$("#comparison-group-list").data("kendoDropDownCheckBox").unselectAll();
			$("#comparison-group-list").data("kendoDropDownCheckBox").options.cancelOption = true;
			$("#comparison-group-list").data("kendoDropDownCheckBox").options.isAbleUnselectAll = true;
			MainViewModel.nextBtn.set("disabled", true);
			Loading.close();
		});
	};
	/**
	 *
	 *   페이지 로드 시 화면 만들어주는 함수
	 *
	 *   @function createView
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//Create View using Data
	var createView = function() {
		Router.bind("init", routerInit);
		//서버에서 받은 Data를 Component에서 사용할 수 있게 가공
		//var dataSource = Model.createDataSource(data);
		//Mock Data로 초기화
		var dataSource = Model.createDataSource(Model.modelData);
		var temperatureData = [];
		//최초에는 타입과 그룹이 설정되어 있지 않으므로 빈 배열을 dataSource와 temperatureData로 하여 그래프 위젯을 초기화
		Views.graph.widget = initGraph(dataSource, temperatureData);
		Views.graph.view = new kendo.View(Views.graph.widget.wrapper, {wrap: false});
		Router.route(Views.graph.routeUrl, routerEvt.bind(Router, Views.graph.view));

		//Mock Data로 초기화 - 의미없는 빈배열로 초기화된다.
		dataSource = Model.createDataSource(Model.modelData);

		Router.start();
	};
	/**
	 *
	 *   export 버튼 클릭 시 엑셀 파일로 다운 하는 이벤트
	 *
	 *   @function exportGrid
	 *   @param {String} e - 그래프 데이터
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//Create grid for csv file to export
	var createGridForCsv = function() {
		var sheetsArr = [],
			sheetsObj = {
				rows: []
			};
		var graphData = Model.data; //gaphDataMade 메소드에서 서버 응답값을 전처리한 allList 객체를 받아오기 위해 Model을 참조
		var dateType = graphData.allList.dateUnit;
		var dataDateSet;
		var dataDateSetNum;
		var selectGroupList = [];
		var i, j, k, m;
		var sac, light, others;
		var currentEnergyData = [];
		var currentEnergyDataObj = {};
		if (dateType == "hourly") {
			dataDateSet = 'hour';
			dataDateSetNum = 0; //서버 응답값의 hourly, monthly, daily의 값을 배열의 row 인덱스로 정의하기 위함.
		} else if (dateType == "daily") {
			dataDateSet = 'day';
			dataDateSetNum = -1; //서버 응답값의 hourly, monthly, daily의 값을 배열의 row 인덱스로 정의하기 위함.
		} else if (dateType == "monthly") {
			dataDateSet = 'month';
			dataDateSetNum = -1; //서버 응답값의 hourly, monthly, daily의 값을 배열의 row 인덱스로 정의하기 위함.
		}

		var energyDataArr = [],
			temperatureArr = [];
		var meterType = Util.getDisplayType(graphData.meterType);
		if (meterType) {
			meterType = typeFilterDataSourceUnit[graphData.meterType][1];
		} else {
			meterType = '';
		}

		var timeInfo = graphData.timeInfo;
		var rowCnt = 0;
		var lengthArr = [];

		//서버 응답된 데이터를 그대로 사용
		if (graphData.originData.energy)
			energyDataArr = graphData.originData.energy[dateType];
		if (graphData.originData.temperature)
			temperatureArr = graphData.originData.temperature[dateType];

		//Title Columns
		sheetsObj.rows.push({
			cells: []
		});
		var titleRow = sheetsObj.rows[0]; //row 한줄, 0번쨰
		titleRow.cells.push({
			value: TEXT.COMMON_TIME
		}); //첫번째 컬럼 - 시간
		//데이터가 있던 없던 제목은 들어간다.
		if (graphData.originData.temperature) {
			titleRow.cells.push({
				value: TEXT.FACILITY_DEVICE_OUTDOOR_TEMPERATURE
			}); //두번째 컬럼 - 실외온도
			lengthArr.push(temperatureArr.length);
		} else {
			titleRow.cells.push({
				value: TEXT.FACILITY_DEVICE_OUTDOOR_TEMPERATURE
			}); //두번째 컬럼 - 실외온도
			lengthArr.push(temperatureArr.length);
		}
		var groupListData = $("#comparison-group-list").data("kendoDropDownCheckBox");//Group 드랍다운리스트 인스턴스 참조
		var groupValue = $('#comparison-group-list').val();//현재 선택된 Group(들)의 id -> ,구분하여 갖고 있다.
		var groupIdList = groupValue.indexOf(',') > 0 ? groupValue.split(',') : [groupValue];//,로 parse하여 배열로 지닌다.
		if (groupValue) {
			/*
				var d = groupListData.dataSource;
				for (var i = 0; i<groupIdList.length; i++) {
					var item = d.get(groupIdList[i]);
					var name = item.get('name');
				  ...
				}
			*/
			//Group 드랍다운 리스트에서 선택된
			for (i = 0; i < groupListData.dataSource._data.length; i++) { //선택된 그룹 수 만큼 컬럼 제목 생성
				var groupListDataId = groupListData.dataSource._data[i].id;
				var groupListDataName = groupListData.dataSource._data[i].name;
				for (j = 0; j < groupIdList.length; j++) {
					if (groupIdList[j] == groupListDataId) { //굳이 검사할 필요 없는데 검사하게 되어있음...
						titleRow.cells.push({
							value: meterType + "-" + groupListDataName + ":" + TEXT.ENERGY_SAC
						}); //예시: 전력량계-GROUP_TYPE_01:SAC
						titleRow.cells.push({
							value: meterType + "-" + groupListDataName + ":" + TEXT.ENERGY_LIGHT
						}); //예시: 전력량계-GROUP_TYPE_01:조명
						titleRow.cells.push({
							value: meterType + "-" + groupListDataName + ":" + TEXT.ENERGY_OTHERS
						}); //예시: 전력량계-GROUP_TYPE_01:기타
						selectGroupList.push(groupListDataName); //아래에서 그룹에 대한 실제 값을 넣어주기 위한 배열
					}
				}
			}
		}

		//각 그룹마다 SAC, 조명, 기타에 대해 지니고 있는 값의 수가 다를 수 있으므로 최대로 많이 갖고 있는 수를 기준으로 row를 만들어 준다.
		if (graphData.originData.energy && energyDataArr && energyDataArr.length > 0) {
			for (i = 0; i < energyDataArr.length; i++) {
				var groupEnergyObj = energyDataArr[i];
				lengthArr.push(groupEnergyObj[dateType].length);
			}
		}
		//Define Row Count - 엑셀의 총 row수
		rowCnt = Math.max.apply(null, lengthArr);

		//Contents Columns
		var currentRow;
		//Time - graphData의 시간 정보를 csv에 반영
		for (i = 0; i < rowCnt; i++) {
			sheetsObj.rows.push({
				cells: []
			});
			currentRow = sheetsObj.rows[i + 1].cells;
			var time = "";
			if (dateType == "hourly") {
				time = new Date(timeInfo.year, timeInfo.month - 1, timeInfo.day, i, 0);
				currentRow.push({
					value: moment(time).format("LLL").replace(/\./g, "-")
				});
			} else if (dateType == "daily") {
				time = new Date(timeInfo.year, timeInfo.month - 1, i + 1 /*, 23, 59*/ );
				currentRow.push({
					value: moment(time).format('YYYY-MM-DD')
				});
			} else if (dateType == "monthly") {
				var lastDay = (new Date(timeInfo.year, i + 1 /*, 0*/ )).getDate();
				time = new Date(timeInfo.year, i, lastDay /*, 23, 59*/ );
				currentRow.push({
					value: moment(time).format('YYYY-MM')
				});
			}
		}
		//Temperature - 값 삽입
		for (i = 0; i < rowCnt; i++) {
			currentRow = sheetsObj.rows[i + 1].cells;
			var temp = "";
			for (j = 0; j < temperatureArr.length; j++) {
				if (Number(temperatureArr[j][dataDateSet]) + dataDateSetNum == i) { //해당 인덱스에 존재하는 값만 넣어준다.
					temp = temperatureArr[j].degree;
					break;
				}
			}
			currentRow.push({
				value: temp
			});
		}

		//Energy - 값 삽입
		if (graphData.originData.energy && energyDataArr && energyDataArr.length > 0) {
			//기본 값 넣어주기
			for (i = 0; i < selectGroupList.length; i++) { //selectGroupList는 선택된 그룹들의 이름들을 저장한 배열
				for (j = 1; j < rowCnt; j++) { //0번째는 제목
					currentRow = sheetsObj.rows[j].cells;
					currentRow.push({
						value: ''
					});
					currentRow.push({
						value: ''
					});
					currentRow.push({
						value: ''
					});
				}
			}
			var valueNum, energyDataArrBool;
			for (i = 0; i < energyDataArr.length; i++) {
				currentEnergyData = energyDataArr[i][dateType]; //현재 그룹의 에너지 값 배열
				energyDataArrBool = false;
				for (k = 0; k < selectGroupList.length; k++) { //현재 선택된 그룹 수만큼 loop
					if (energyDataArr[i].dms_group_name == selectGroupList[k]) { //선택된 그룹 이름과 서버 응답값의 그룹 이름이 같은지 체크
						energyDataArrBool = true;
						valueNum = k; //값이 있는 그룹의 최대 수(즉, csv에서 횡으로 증가하는 {sac, light, other} 묶음 수) -> 그룹 수
					}
				}
				for (j = 0; j < rowCnt; j++) { //전체 row 수(값을 가장 많이 갖고 있는 수)만큼 돈다.
					sac = "";
					light = "";
					others = "";
					if (energyDataArrBool) { //그룹이 존재하면,
						for (m = 0; m < currentEnergyData.length; m++) {
							currentEnergyDataObj = currentEnergyData[m];
							var innerNum = Number(currentEnergyData[m][dataDateSet]) + dataDateSetNum; //서버 응답값의 시간값(hour, day, month)에 매칭되는 인덱스 정의
							currentRow = sheetsObj.rows[innerNum + 1].cells; //0번째에 시간이 존재하므로 1 더한 후 시작

							if (currentEnergyDataObj && currentEnergyDataObj.sac) {
								sac = currentEnergyDataObj.sac;
							}
							if (currentEnergyDataObj && currentEnergyDataObj.light) {
								light = currentEnergyDataObj.light;
							}
							if (currentEnergyDataObj && currentEnergyDataObj.others) {
								others = currentEnergyDataObj.others;
							}
							//한 그룹 당 sac, light, others를 묶음으로 갖고 있으므로 그룹당 * 3
							currentRow[1 + (valueNum * 3) + 1] = {
								value: sac
							}; //그룹의 수만큼 계산해서 항목의 자리에 값 넣어준다.
							currentRow[1 + (valueNum * 3) + 2] = {
								value: light
							}; //그룹의 수만큼 계산해서 항목의 자리에 값 넣어준다.
							currentRow[1 + (valueNum * 3) + 3] = {
								value: others
							}; //그룹의 수만큼 계산해서 항목의 자리에 값 넣어준다.
						}
					}
				}
			}
		}

		//Energy - 504라인까지 주석처리해도 정상동작
		if (graphData.originData.energy && energyDataArr && energyDataArr.length > 0) {
			for (i = 0; i < selectGroupList.length; i++) {
				for (j = 0; j < rowCnt; j++) {
					currentRow = sheetsObj.rows[j + 1].cells;
					currentRow.push({
						value: ''
					});
					currentRow.push({
						value: ''
					});
					currentRow.push({
						value: ''
					});
				}

				for (j = 0; j < rowCnt; j++) {
					if (energyDataArr[i] && energyDataArr[i][dataDateSet]) {
						currentEnergyData = energyDataArr[i][dataDateSet];
						for (k = 0; k < currentEnergyData.length; k++) {
							currentRow = sheetsObj.rows[j + 1].cells;

							if (currentEnergyData[k][dataDateSet] + dataDateSetNum == j) {
								currentEnergyDataObj = currentEnergyData[k];
								sac = "";
								light = "";
								others = "";
								if (currentEnergyDataObj && currentEnergyDataObj.sac) {
									sac = currentEnergyDataObj.sac;
								}
								if (currentEnergyDataObj && currentEnergyDataObj.light) {
									light = currentEnergyDataObj.light;
								}
								if (currentEnergyDataObj && currentEnergyDataObj.others) {
									others = currentEnergyDataObj.others;
								}
								currentRow[j + 2] = {
									value: sac
								};
								currentRow[j + 2] = {
									value: light
								};
								currentRow[j + 2] = {
									value: others
								};
							} else {
								currentRow[j + 2] = {
									value: ''
								};
								currentRow[j + 2] = {
									value: ''
								};
								currentRow[j + 2] = {
									value: ''
								};
							}
						}
					}
				}
			}
		}

		//console.log(sheetsObj);
		sheetsArr.push(sheetsObj);
		var workbook = new kendo.ooxml.Workbook({
			sheets: sheetsArr
		});
		kendo.saveAs({
			dataURI: workbook.toDataURL(),
			fileName: "data.csv"
		});
	};
	/**
	 *
	 *   페이지 로드 시 comparison 페이지 랜더링하는 함수
	 *
	 *   @function routerInit
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//Init router
	var routerInit = function() {
		Layout.render(comparisonView);
	};
	/**
	 *
	 *   페이지 로드 시 comparison 페이지 보여주는 함수
	 *
	 *   @function routerEvt
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//Binding Event on Router
	var routerEvt = function(view) {
		Layout.showIn("#comparison-main-view-content", view);
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
	//Event Binding for Buttons
	var attachEvent = function() {
		MainViewModel.set("setDateView", moment().format(MainViewModel.formattedDate));
		// 상위 탭 클릭 이벤트 바인딩.
		consumptionTab.bind("activate", handleActiveTabEvt);
		//Event Binding on Export Button
		MainViewModel.exportBtn.set("click", function() {
			createGridForCsv();
		});

		//Event Binding on DAY Button
		MainViewModel.dayBtn.set("click", function() {
			MainViewModel.monthBtn.set("active", false);
			MainViewModel.yearBtn.set("active", false);
			if (MainViewModel.monthBtn.get("active") == true) {
				return;
			}
			MainViewModel.set("formattedDate", moment().format(dateButtonClick('day')));
			MainViewModel.dayBtn.set("active", true);
			dateOverChange();
			refreshData();
		});

		//Event Binding on MONTH Button
		MainViewModel.monthBtn.set("click", function() {
			MainViewModel.dayBtn.set("active", false);
			MainViewModel.yearBtn.set("active", false);
			if (MainViewModel.monthBtn.get("active") == true) {
				return;
			}
			MainViewModel.monthBtn.set("active", true);
			MainViewModel.set("formattedDate", moment().format(dateButtonClick('month')));
			dateOverChange();
			refreshData();
		});

		//Event Binding on YEAR Button
		MainViewModel.yearBtn.set("click", function() {
			MainViewModel.dayBtn.set("active", false);
			MainViewModel.monthBtn.set("active", false);
			if (MainViewModel.monthBtn.get("active") == true) {
				return;
			}
			MainViewModel.set("formattedDate", moment().format(dateButtonClick('year')));
			MainViewModel.yearBtn.set("active", true);
			dateOverChange();
			refreshData();
		});

		//Event Binding on PRE, NEXT arrow Button
		MainViewModel.nextBtn.set("click", function() {
			var date = dateFormChange(MainViewModel.formattedDate, 1);//날짜 변경 +1(포맷에 맞게)
			MainViewModel.set("formattedDate", moment().format(date));//현재 뷰에 변경된 날짜를 포맷에 맞게 저장
			dateOverChange();//말이 되는 날짜인지 체크
			dateChange();//체크된 날짜를 Full 포맷 형태로 날짜에 저장
			refreshData();
		});
		MainViewModel.prevBtn.set("click", function() {
			var date = dateFormChange(MainViewModel.formattedDate, -1);//날짜 변경 -1(포맷에 맞게)
			MainViewModel.set("formattedDate", moment().format(date));//현재 뷰에 변경된 날짜를 포맷에 맞게 저장
			dateOverChange();//말이 되는 날짜인지 체크
			dateChange();//체크된 날짜를 Full 포맷 형태로 날짜에 저장
			refreshData();
		});

		//Event Binding on Device ComboBox firing ChANGE event
		//전력량계, 가스량계 - 추후 증가할 수 있음.
		$('#comparison-device-type-list').on("change", function() {
			//deviceTypeData = $(this).val().split('.')[1];
			deviceTypeData = $(this).val();
			var groupListData = $("#comparison-group-list").data("kendoDropDownCheckBox"); //2번째 드랍다운리스트 위젯 인스턴스
			if (!deviceTypeData) { //타입이 선택되어 있지 않은 경우 그룹 드랍다운리스트 위젯은 비활성화
				groupListData.unselectAll();
				groupListData.enable(false);
			} else {
				//선택된 타입에 따른 그룹 데이터를 받아와서 2번째 드랍다운리스트 위젯의 dataSource에 반영한다.
				Loading.open();
				$.ajax({
					url: "/dms/groups?dms_devices_types=" + deviceTypeData
				}).done(function(data) {
					MainViewModel.filters[1].options.set("dataSource", data);
				}).fail(function() {

				}).always(function() {
					groupListData.unselectAll();
					groupListData.enable(true);
					Loading.close();
				});
			}
		});

		//메인 사이드바 메뉴의 숨김또는 보여주기 버튼 클릭시, 이벤트 처리.
		$("#main-sidebar-menu").find('.btn-util').on("click", ".btn", function(e) {
			//화면에 맞춰 차트 및 그리드 다시 그림.
			Views.graph.widget.setOptions({
				chartArea: {width: comparisonView.width()}
			});
		});

		//Event Binding on Group ComboBox firing ChANGE event
		$('#comparison-group-list').data("kendoDropDownCheckBox").bind("selectionChanged", function(e) {
			deviceGroupData = e.newValue;
			refreshData();
		});
	};
	/**
    *   <ul>
    *   <li> 상위 탭 이벤트를 핸들링한다.</li>
    *   </ul>
    *   @function handleActiveTabEvt
	*   @param {Object} e - 이벤트 객체.
    *   @returns {void}
    *   @alias 없음
    *
    */
	var handleActiveTabEvt = function(e) {
		var currentTabId = $(e.contentElement).prop("id");
		//에너지 분배 탭이 활성화 되면, 그래프를 리플래쉬 한다.
		if(currentTabId == "consumption-common-tab-2") {
			Views.graph.widget.setOptions({
				chartArea: {
					width: comparisonView.width(),
					height: (comparisonView.height() - 68) - 61
				}
			});
		}
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
	//Return Display Date when click the button
	var dateButtonClick = function(date) {
		var returnData = '';
		var beforeData = MainViewModel.setDateView.split('-');
		var currentDate = moment().format('DD'); //오늘 날짜 '일' 값.

		if (date == 'year') {
			returnData = beforeData[0];
		}
		if (date == 'month') {
			returnData = beforeData[0] + '-' + beforeData[1];
		}
		if (date == 'day') {
			//오늘 날짜의 '일' 값이 선택 날짜의 마지막 '일' 보다 커서 기본값이 유효하지 않는 날짜일때, 기본값의 '일' 값을 선택날짜의 마지막 일로 변경.
			returnData = beforeData[0] + '-' + beforeData[1] + '-' + currentDate;
			if(!moment(returnData).isValid()) {
				currentDate = moment(beforeData[0] + '-' + beforeData[1]).daysInMonth();
				returnData = beforeData[0] + '-' + beforeData[1] + '-' + currentDate;
			}
		}
		return returnData;
	};
	/**
	 *
	 *   현재 날짜 넘어갔을 때 조건에 따라 날짜 바꾸어줄 수 있도록 현재 view의 날짜를 저장하는 함수
	 *
	 *   @function dateChange
	 *   @param {String} date - 현재 버튼 상태
	 *   @returns {Object} returnData -  현재 날짜
	 *   @alias 없음
	 *
	 */
	//Calculate Date when Changing date on UI by clicking buttons
	var dateChange = function() {
		var afterDate = MainViewModel.formattedDate.split('-');
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
	//달력 UI button 제어
	var dateOverChange = function() {
		var setDate = MainViewModel.formattedDate.split('-');
		/* 현재 날짜 이후로 움직이지 않도록 작업 */
		var nowDate = new Date();
		var dateLength = setDate.length;
		var yearValue, monthValue, dayValue, nowCompareDateSet, afterCompareDateSet;
		var nowDateList = {
			year: nowDate.getFullYear(),
			month: nowDate.getMonth() + 1,//.getMonth() API는 0부터 시작.
			day: nowDate.getDate()
		};
		var compareDateList = {
			year: nowDate.getFullYear(),
			month: nowDate.getMonth() + 1,
			day: nowDate.getDate()
		};
		if (String(compareDateList.month).length < 2) {
			compareDateList.month = '0' + compareDateList.month;
		}
		if (String(compareDateList.day).length < 2) {
			compareDateList.day = '0' + compareDateList.day;
		}

		var setChangeDate;
		var oriSetDateViewDate = MainViewModel.get("setDateView");
		var oriSetDateViewDateDayValue = null;
		if (dateLength >= 1) {//년 인경우 YYYY
			yearValue = Number(setDate[0]);
			setChangeDate = nowDateList.year;
			nowCompareDateSet = Number(String(compareDateList.year));
			if (Number(yearValue) == nowCompareDateSet) {
				MainViewModel.nextBtn.set("disabled", true);
			} else if (Number(yearValue) > nowCompareDateSet) {
				MainViewModel.nextBtn.set("disabled", true);
				MainViewModel.set("formattedDate", setChangeDate);
				MainViewModel.set("setDateView", setChangeDate);
			} else {
				MainViewModel.nextBtn.set("disabled", false);
			}
		}

		if (dateLength >= 2) {//월인 경우 YYYY-MM
			setChangeDate = nowDateList.year + '-' + (String(nowDateList.month).length > 1 ? nowDateList.month : '0' + nowDateList.month);
			monthValue = Number(setDate[1]);
			if (String(monthValue).length < 2) {
				monthValue = '0' + monthValue;
			}
			nowCompareDateSet = Number(String(compareDateList.year) + String(compareDateList.month));
			afterCompareDateSet = Number(String(yearValue) + String(monthValue));
			if (afterCompareDateSet == nowCompareDateSet) {
				MainViewModel.nextBtn.set("disabled", true);
			} else if (afterCompareDateSet >= nowCompareDateSet) {
				MainViewModel.nextBtn.set("disabled", true);
				MainViewModel.set("formattedDate", setChangeDate);
				//MainViewModel.set("setDateView",setChangeDate);
				oriSetDateViewDateDayValue = oriSetDateViewDate.split('-')[2]; //일
				MainViewModel.set("setDateView", setChangeDate + '-' + oriSetDateViewDateDayValue);
			} else {
				MainViewModel.nextBtn.set("disabled", false);
			}
		}
		if (dateLength >= 3) {//일 인경우 YYYY-MM-DD
			setChangeDate = nowDateList.year + '-' + (String(nowDateList.month).length > 1 ? nowDateList.month : '0' + nowDateList.month) + '-' + (String(nowDateList.day).length > 1 ? nowDateList.day : '0' + nowDateList.day);
			dayValue = Number(setDate[2]);
			if (String(dayValue).length < 2) {
				dayValue = '0' + dayValue;
			}
			nowCompareDateSet = Number(String(compareDateList.year) + String(compareDateList.month) + String(compareDateList.day));
			afterCompareDateSet = Number(String(yearValue) + String(monthValue) + String(dayValue));
			if (afterCompareDateSet == nowCompareDateSet) {
				MainViewModel.nextBtn.set("disabled", true);
			} else if (afterCompareDateSet >= nowCompareDateSet) {
				MainViewModel.nextBtn.set("disabled", true);
				MainViewModel.set("formattedDate", setChangeDate);
				MainViewModel.set("setDateView", setChangeDate);
			} else {
				MainViewModel.nextBtn.set("disabled", false);
			}
		}
	};
	/**
	 *
	 *   현재 날짜 넘어갔을 때 조건에 따라 날짜 바꾸어주는 함수(1: 증/감)
	 *
	 *   @function dateFormChange
	 *   @param {String} date - 현재 날짜
	 *   @param {String} value - 이동할 값
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//Define date format displayed on UI
	var dateFormChange = function(date, value) {
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
		//console.log(date, value)

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

		function getMonthDay(year, month) {
			var lastDay = (new Date(year, month, 0)).getDate(),
				monthDayList = [];
			for (var i = 1; i <= lastDay; i++) {
				if (String(i).length == 1) {
					monthDayList.push('0' + i);
				} else {
					monthDayList.push(i);
				}
			}
			return monthDayList;
		}
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
	//Refresh data and chart view whenever firing Event - Click
	var refreshData = function() {
		var currentDate = MainViewModel.formattedDate.split('-');
		//console.log(MainViewModel)
		var textDate;
		var temperatureData = null;
		var energyData = null;
		var graphData;
		var urlForTemperatureData, urlForEnergyData;
		var reqTemp, reqEnergy;

		//Create textDate for URL depending on current date
		//textDate는 ajax URL
		if (currentDate.length == 1) {
			textDate = 'year=' + currentDate[0];
		} else if (currentDate.length == 2) {
			textDate = 'year=' + currentDate[0] + '&month=' + Number(currentDate[1]);
		} else if (currentDate.length == 3) {
			textDate = 'year=' + currentDate[0] + '&month=' + Number(currentDate[1]) + '&day=' + Number(currentDate[2]);
		}

		//Holding Time info
		Model.data.timeInfo = {
			year: Number(currentDate[0]),
			month: Number(currentDate[1]) ? Number(currentDate[1]) : null,
			day: Number(currentDate[2]) ? Number(currentDate[2]) : null
		};

		//Define URL for temperature
		urlForTemperatureData = textDate;

		//Check Device type Dropdownlist value
		if (!deviceTypeData) $("#comparison-group-list").data("kendoDropDownCheckBox").enable(false);
		else $("#comparison-group-list").data("kendoDropDownCheckBox").enable(true);
		textDate = textDate + "&dms_meter_type=" + deviceTypeData;

		Model.data.meterType = deviceTypeData;

		//Check Device Group type Dropdownlist value
		if (!deviceGroupData || deviceGroupData.length < 1) {
			// 그룹 미 선택된 상태에서, 날짜 타입에 따른 차트 카테고리 값 변경 하기위한 옵션 설정.
			graphData = graphDataMade(null, null);
			Views.graph.widget.setOptions({
				categoryAxis: {
					categories: graphData.categories,
					axisCrossingValues: [0, 0, 100, 100],
					select: false
				},
				series:[]
			});
			return;
		}

		textDate = textDate + "&dms_group_ids=" + deviceGroupData;


		//Define URL for energy
		urlForEnergyData = textDate;

		//생성한 URL을 파라메터로 전달하여 Ajax promise 객체 리턴
		reqTemp = Model.reqTemperatureDataToServer(urlForTemperatureData); //온도 데이터 요청
		reqEnergy = Model.reqEnergyDataToServer(urlForEnergyData); //에너지 데이터 요청

		Loading.open();
		reqTemp.then(function(respTemp) {
			temperatureData = respTemp;
			MainViewModel.exportBtn.set("disabled", false); //엑셀 export 버튼 활성화
		}, function(data) {
			msgDialog.message(data.statusText + " " + data.status);
			msgDialog.open();
		});
		//온도데이터 요청 이후 always 콜백에서 에너지 데이터 요청
		reqTemp.always(function() {
			reqEnergy.then(function(respEnergy) {
				energyData = respEnergy;
				MainViewModel.exportBtn.set("disabled", false);
			}, function(data) {
				msgDialog.message(data.statusText + " " + data.status);
				msgDialog.open();
			});
			reqEnergy.always(function() {
				Loading.close();
				//응답받은 에너지 데이터와 온도 데이터로 그래프 옵션 객체 리턴 - optsForChartWidget
				graphData = graphDataMade(energyData, temperatureData);

				//Define Export Button state
				if (!(energyData) && !(temperatureData)) MainViewModel.exportBtn.set("disabled", true);
				//Setting options of Graph Widget
				Views.graph.widget.setOptions({
					selectionTooltip: {
						rowGroupNames: (function() {
							//현재 그룹 리스트 드롭 다운 체크 박스에 표시된 그룹명을 사용하여 툴팁에서 사용하는 그룹명을 생성한다.
							var i, groupNames, groups = $("#comparison-group-list").data("kendoDropDownCheckBox")._data();
							for(i = 0, groupNames = []; i < groups.length; i++) {
								groupNames.push(groups[i].name);
							}
							return groupNames;
						})(),
						rowTemplate: function(seriesItem) {
							var row = {
								groupName:"",
								content: "",
								priority: 0
							};
							var NUMBER_FORMAT = "n1"; // ex) 123123.123 => 123,123.1
							if(seriesItem.series.name != "temperature") seriesItem.data = kendo.toString(seriesItem.data, NUMBER_FORMAT);
							switch(seriesItem.series.name) {
							case "temperature": row.content += "<span class='energy-comparison-graph-tooltip-legend-line'><em class='energy-comparison-graph-tooltip-legend-circle'></em></span>" + "<span class='energy-comparison-graph-tooltip-content-name'>" + I18N.prop("FACILITY_DEVICE_OUTDOOR_TEMPERATURE") + "</span>" + "<span class='energy-comparison-graph-tooltip-content-data'>" + seriesItem.data + "(" + graphData.dataUnit.temperature + ")" + "</span>"; row.priority = 1; break;
							case "sac": row.content += "<span class='energy-comparison-graph-tooltip-legend-square' style='background-color:#0081c6'></span>" + "<span class='energy-comparison-graph-tooltip-content-name'>" + I18N.prop("ENERGY_SAC") + "</span>" + "<span class='energy-comparison-graph-tooltip-content-data'>" + seriesItem.data + "(" + graphData.dataUnit.energy + ")" + "</span>"; break;
							case "light": row.content += "<span class='energy-comparison-graph-tooltip-legend-square' style='background-color:#4ca7d7'></span>" + "<span class='energy-comparison-graph-tooltip-content-name'>" + I18N.prop("ENERGY_LIGHT") + "</span>" + "<span class='energy-comparison-graph-tooltip-content-data'>" + seriesItem.data + "(" + graphData.dataUnit.energy + ")"  + "</span>"; break;
							case "others": row.content += "<span class='energy-comparison-graph-tooltip-legend-square' style='background-color:#99cde8'></span>" + "<span class='energy-comparison-graph-tooltip-content-name'>" + I18N.prop("ENERGY_OTHERS") + "</span>" + "<span class='energy-comparison-graph-tooltip-content-data'>" + seriesItem.data + "(" + graphData.dataUnit.energy + ")" +  "</span>"; break;
							default: row.content = ""; row.priority = 0; row.groupName = "";
							}
							row.groupName = seriesItem.series.name == "temperature" ? "" : seriesItem.series.stack;
							return row;
						}
					},
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
						}
					},
					chartArea: {
						background: '#fbfbfb',
						height: $('#comparison-main-view-content').height() - 31,
						width: $('#comparison-main-view').width()
					},
					plotArea: {
						background: "#f7f7f8"
					},
					legend: {
						visible: false
					},
					xAxis: {
						border: {
							color: '#444'
						}
					},
					labels: {
						position: "top"
					},
					series: graphData.setSeries,
					valueAxes: graphData.setValueAxes,
					categoryAxis: {
						categories: graphData.categories,
						axisCrossingValues: [0, 0, 100, 100],
						select: false
					}
				});
				Views.graph.widget.dataSource.sync();
				//console.log(Views.graph.widget.dataSource);

				//Y축 단위가 바뀔 수 있으므로 DOM을 지웠다가 다시 삽입한다.
				$('.graphTopBox').remove();
				$('#comparison-main-view-content').prepend(graphTopBox(graphData.dataUnit.energy, graphData.dataUnit.temperature));
				//renewFactorInChart();
			});
		});
	};

	/**
	 *
	 *   그래프를 보여주기 위해서 데이터 형태를 변경해주는 함수
	 *
	 *   @function graphDataMade
	 *   @param {Array} energyData - 그래프 데이터 리스트
	 *   @param {String} temperatureData - 온도데이터 리스트
	 *   @alias 없음
	 *
	 */
	//Setting data set for Chart - 가공되지 않은 Data
	//dataSource, temperatureData는 서버 응답값
	var graphDataMade = function(dataSource, temperatureData) {
		var nowTimeDate = MainViewModel.formattedDate.split('-');
		var dataName, dataObjName;
		var setSeries, setValueAxes, categories;
		var seriesData = []; // 실제 데이터 소스.
		var energy;
		var minYaxis, maxYaxis, minYaxis_Temp, maxYaxis_Temp, energyUnit, temperatureUnit, dateUnit;
		var i, j;
		//Change data set depending on year, month, day format
		//현재 뷰의 날짜 포맷에 따라 차트의 카테고리와 dataName, dataObjName을 바꾸어 적용
		dateUnit = nowTimeDate.length;
		if (dateUnit == 3) {
			dataName = 'hourly'; //차트의 최소 표현 단위.
			dataObjName = 'hour';
			categories = Common.getChartXAxisLabel('day');
			//차트의 가로축.
			//maxYaxis = 1000;
		}
		if (dateUnit == 2) {
			dataName = 'daily';
			dataObjName = 'day';
			categories = getMonthDay(nowTimeDate[0], nowTimeDate[1]);//툭종 년 월의 일수를 계산하여 배열로 리턴
			//maxYaxis = 5000;
		}
		if (dateUnit == 1) {
			dataName = 'monthly';
			dataObjName = 'month';
			/*categories = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];*/
			categories = moment().localeData().monthsShort();
			//maxYaxis = 50000;
		}


		//Define y-axis MAX, MIN and Unit Symbol depending on datasource value
		//Y축 최대, 최소값 정의
		//차트에 들어갈 데이터의 종류에 따라 단위 기호를 정의
		if (!dataSource || !dataSource[dataName] || dataSource[dataName].length < 1) { //차트에 들어가는 데이터가 없는 경우
			energy = false;
			maxYaxis = 1;
			energyUnit = "";
		} else {
			energy = dataSource;
			energyUnit = dataSource.unit; //서버 응답값에서 제공하는 단위 사용
			maxYaxis = getMinMaxOnEnergyTotal(dataSource, dataName).max; //최대 3개까지의 그룹을 선택할 수 있으므로 각 그룹의 min,max값을 통합하여 최대, 최소 결정
			minYaxis = getMinMaxOnEnergyTotal(dataSource, dataName).min; //최대 3개까지의 그룹을 선택할 수 있으므로 각 그룹의 min,max값을 통합하여 최대, 최소 결정
		}
		if (!temperatureData || !temperatureData[dataName] || temperatureData[dataName].length < 1) {
			temperatureData = false;
			minYaxis_Temp = -15;
			maxYaxis_Temp = 35;
		} else {
			temperatureData = temperatureData;
			minYaxis_Temp = Math.floor(getMinMaxOnTemperatureTotal(temperatureData).min * 1.2); //최대 3개까지의 그룹을 선택할 수 있으므로 각 그룹의 min,max값을 통합하여 최대, 최소 결정
			if (minYaxis_Temp > 0) { //온도가 0보다 크면 무조건 0으로 지정
				minYaxis_Temp = 0;
			}
			maxYaxis_Temp = Math.floor(getMinMaxOnTemperatureTotal(temperatureData).max * 1.2); //최대 3개까지의 그룹을 선택할 수 있으므로 각 그룹의 min,max값을 통합하여 최대, 최소 결정

		}

		var globalSettings = window.GlobalSettings;
		var unitData = globalSettings.getTemperature().unit;
		temperatureUnit = Util.CHAR[unitData];

		//Category of Data using Chart
		var allList = {};
		var categoryLength = categories.length; //차트 x축을 이루는 배열의 길이
		var idx = null;

		allList.dateUnit = dataName; //monthly, hourly, daily
		if (energy) { //energy = datasource, datasource 있는 경우에만
			allList["groupConfig"] = {
				groupCnt: energy[dataName].length,
				dateUnit: dataName
			};

			allList["tooltipConfig"] = {
				category: categories,
				dateUnit: dataName,
				dataSource: energy
			};
			for (i = 0; i < energy[dataName].length; i++) {
				var curEnergy = energy[dataName][i];
				var groupName = curEnergy.dms_group_name;
				var curEnergyData = curEnergy[dataName];
				allList[groupName] = {};
				allList[groupName][dataName] = []; //
				allList[groupName]["totalList"] = []; //total
				allList[groupName]["sacList"] = []; //sac
				allList[groupName]["lightList"] = []; //light
				allList[groupName]["othersList"] = []; //others

				//차트 데이터 초기화 - null
				for (j = 0; j < categoryLength; j++) {
					allList[groupName][dataName].push(null);
					allList[groupName]["totalList"].push(null);
					allList[groupName]["sacList"].push(null);
					allList[groupName]["lightList"].push(null);
					allList[groupName]["othersList"].push(null);
				}

				for (j = 0; j < curEnergyData.length; j++) {
					//응답 배열 내부 객체의 hour, day, month의 값을 차트의 시리즈 데이터 배열의 인덱스로 사용하기 위함.
					//key:hour-'일'은 0부터 시작
					//key:day-'월', key:month-'년'은 1부터 시작
					if (dateUnit != 3) {
						idx = curEnergyData[j][dataObjName] - 1; //1부터 시작하므로 -1 한다.
					} else {
						idx = curEnergyData[j][dataObjName];
					}

					//curEnergyData는 응답데이터의 최상위 배열[dataName]내의 객체의 [dataName] 배열이다.
					//응답데이터를 차트에서 사용하기 위한 시리즈 배열에 옮긴다.
					//null로 초기화 했으므로 없는 것은 null처리 되고 인덱스가 존재하는 부분에만 allList에 값이 들어간다.
					allList[groupName][dataName][idx] = curEnergyData[j][dataObjName];
					allList[groupName]["totalList"][idx] = curEnergyData[j]["total"];
					allList[groupName]["sacList"][idx] = curEnergyData[j]["sac"];
					allList[groupName]["lightList"][idx] = curEnergyData[j]["light"];
					allList[groupName]["othersList"][idx] = curEnergyData[j]["others"];
				}
			}
		}

		allList["temperatureList"] = [];
		if (temperatureData) {
			for (i = 0; i < categoryLength; i++) {
				allList['temperatureList'].push(null);
			}
			for (i = 0; i < temperatureData[dataName].length; i++) {
				var tempDataObj = temperatureData[dataName][i];
				if (dateUnit != 3) {
					idx = tempDataObj[dataObjName] - 1; //1부터 시작하므로 -1 한다.
				} else {
					idx = tempDataObj[dataObjName];
				}
				//응답데이터를 차트에서 사용하기 위한 시리즈 배열에 옮긴다.
				//null로 초기화 했으므로 없는 것은 null처리 되고 인덱스가 존재하는 부분에만 allList에 값이 들어간다.
				allList['temperatureList'][idx] = temperatureData[dataName][i]['degree'];
			}
		}

		//모델 객체에 반영
		Model.data.allList = allList;
		Model.data.originData = {
			energy: dataSource,
			temperature: temperatureData
		};

		//allList 객체 내부의 데이터를 차트 시리즈 데이터 옵션으로 적용
		//allList 객체의 키 리스트 - dateUnit, groupConfig, temperatureUnit, temperatureList, tooltipConfig, '2번째 드랍다운리스트에서 선택한 그룹 이름'
		var nameList = Object.keys(allList);
		for (i = 0; i < nameList.length; i++) {
			var stackName = nameList[i]; //allList 객체의 키이름
			var curGroup = allList[nameList[i]]; //allList 객체의 현재 키이름에 해당하는 값
			if (stackName == 'temperatureList') {
				seriesData.push({
					type: "line",
					data: curGroup,
					name: "temperature",
					color: "#888",
					axis: "temperature",
					markers: {
						size: 6,
						background: "#808080",
						border: {
							width: 0,
							color: '#808080'
						},
						highlight: {
							line: {
								width: 0
							}
						}
					}
				});
			} else {
				var keyListOfCurGroup = Object.keys(curGroup);
				//allList 객체의 키 중 현재 선택된 그룹 이름과 동일한 키일 때만 아래 로직을 수행
				for (j = 0; j < keyListOfCurGroup.length; j++) {
					if (keyListOfCurGroup[j] == 'othersList') {
						seriesData.push({
							type: "column",
							data: curGroup.othersList,
							stack: stackName, //컬럼바를 동일한 stackName에 대해 stack으로 쌓아 올린다.
							groupConfig: allList.groupConfig,
							tooltipConfig: allList.tooltipConfig,
							name: 'others',
							color: "#99cde8",
							labels: false
							/*{
															visible: true,
															background: "transparent",
															border: {
																color: "yoonbong",
																width: 0,
															},
														   template: function(e) {
																var labelName = e.series.stack;
																var groupCnt = e.series.groupConfig.groupCnt;
																var dateUnit = e.series.groupConfig.dateUnit;
																var result = shortenLables(groupCnt, dateUnit, labelName);
																return result;
															}
														}*/
						});
					}
					if (keyListOfCurGroup[j] == 'sacList') {
						seriesData.push({
							type: "column",
							data: curGroup.sacList,
							stack: stackName,
							tooltipConfig: allList.tooltipConfig,
							name: 'sac',
							color: "#0081c6"
						});
					}
					if (keyListOfCurGroup[j] == 'lightList') {
						seriesData.push({
							type: "column",
							data: curGroup.lightList,
							stack: stackName,
							tooltipConfig: allList.tooltipConfig,
							name: 'light',
							color: "#4ca7d7"
						});
					}
				}
			}
		}
		setSeries = seriesData;

		//Y축 옵션 설정
		setValueAxes = [{
			name: energyUnit,
			min: minYaxis,
			max: Util.getChartOptionsForFiveChartSection(maxYaxis, 0).newMax,
			//majorUnit: maxYaxis/6,
			majorGridLines: {
				visible: false
			},
			majorUnit: Util.getChartOptionsForFiveChartSection(maxYaxis, 0).newMajorUnit,
			labels: {
				template: function(data) {
					if (data.value > 1) return Math.floor(data.value);
					return data.value;
				}
			}
		}, { //온도의 Y축 위치를 우측으로 옮기기 위해 추가한 dummy 축....
			majorGridLines: {
				visible: false
			},
			visible: false
		}, {
			name: "temperature",
			min: minYaxis_Temp,
			max: maxYaxis_Temp,
			axis: "temperature",
			majorGridLines: {
				visible: false
			},
			majorUnit: (function(){
				var unit = null;
				unit = (maxYaxis_Temp - minYaxis_Temp) / 5;
				return Util.convertNumberFormat(unit);
			})(),
			labels: {
				template: function(data) {
					return Util.convertNumberFormat(data.value);
				}
			}
		}];


		//Get date value for day list
		function getMonthDay(year, month) {
			var date = new Date(year, month, 0);
			var lastDay = (date).getDate(),
				monthDayList = [];
			for (i = 1; i <= lastDay; i++) {
				monthDayList.push(moment(date.setDate(i)).format('Do'));
			}
			return monthDayList;
		}

		//Return Max value among total values
		//서버 응답 데이터의 통합 최대, 최소 반환 - 그룹이 단일 또는 복수 인 경우
		function getMinMaxOnEnergyTotal(data, dateType) {
			var max;
			var maxArr = [],
				minArr = [];
			for (i = 0; i < data[dateType].length; i++) {
				var obj = data[dateType][i];
				maxArr.push(obj.max);
				minArr.push(obj.min);
			}
			max = Math.ceil(Math.max.apply(null, maxArr));
			//max = Math.ceil(max*1.2/10)*10;
			if (!max) {
				max = 12000;
			}
			return {
				max: max * 1.2,
				min: 0
			};
		}
		//서버 응답데이터의 통합 최대, 최소 반환 - 그룹이 단일 또는 복수 인 경우
		function getMinMaxOnTemperatureTotal(data) {
			var max = data.max;
			var min = data.min;
			if (!max) {
				max = 50;
			}
			if (!min) {
				min = -50;
			}
			return {
				max: max,
				min: min
			};
		}

		return {
			setSeries: setSeries,
			setValueAxes: setValueAxes,
			categories: categories,
			dataUnit: {
				energy: energyUnit,
				temperature: temperatureUnit
			},
			dateType: dataName
		};
	};
	/**
	 *
	 *   첫 시작시 그래프 만들어주는 함수
	 *
	 *   @function initGraph
	 *   @param {Array} dataSource - 그래프 데이터 리스트
	 *   @param {Array} temperatureData - 온도 데이터 리스트
	 *   @param {Array} targetData - target 데이터 리스트
	 *   @returns {Object} Object - 새로운 그래프 위젯
	 *   @alias 없음
	 *
	 */
	//Init Main Graph
	var initGraph = function(dataSource, temperatureData) {
		var data = graphDataMade(dataSource, temperatureData);
		var initArr = [];
		for (var i = 0; i < data.categories.length; i++) {
			initArr.push(0); //최초의 그래프에는 0값으로 초기화 - 조금 이상함 null로 초기화 해야할 듯.
		}

		//차트 옵션 생성
		var options = {
			selectionTooltip: {
				isVisible: true,
				width: 300,
				seriesKeysForRowName: ["name", "stack"],
				rowGroupNames: []
			},
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
				}
			},
			chartArea: {
				background: '#fbfbfb',
				height: $('#comparison-main-view').height() - 61,
				width: $('#comparison-main-view').width()
			},
			plotArea: {
				border: {
					/*width: 2,
					color: "green"*/
				},
				background: "#f7f7f8"
			},
			legend: {
				visible: false
			},
			xAxis: {
				border: {
					color: '#444'
				}
			},
			series: initArr,
			valueAxes: data.setValueAxes,
			categoryAxis: {
				categories: data.categories,
				axisCrossingValues: [0, 0, 100, 100]
			}
		};
		$('#comparison-main-view-content').prepend(graphTopBox());
		return Widget.createNewWidget("comparison-chart", kendo.dataviz.ui.Chart, options);
	};
	/**
	 *
	 *   graphTopBox에 html 넣어주는 함수
	 *
	 *   @function graphTopBox
	 *   @param {Array} energyUnit - 그래프 데이터 명
	 *   @param {Array} temperatureUnit - 온도 데이터 명
	 *   @returns {String} String - 넣어줄 html
	 *   @alias 없음
	 *
	 */
	//Top Area
	//온도 단위와
	var graphTopBox = function(energyUnit, temperatureUnit) {
		var energySymbol = "";
		var temperatureSymbol = "";
		if (energyUnit) energySymbol = "(" + energyUnit + ")";

		if (temperatureUnit) temperatureSymbol = "(" + temperatureUnit + ")";

		return '<div class="graphTopBox">' +
			'<span class="graph-unit-symbol energy">' + energySymbol + '</span>' +
			'<div class="right">' +
			'<ul>' +
			'<li><span class="line" style="background-color:#808080"><em class="circle" style="background-color:#808080"></em></span>' + I18N.prop("FACILITY_DEVICE_OUTDOOR_TEMPERATURE") + '</li>' +
			'<li><span class="square" style="background-color:#0081c6"></span>' + I18N.prop("ENERGY_SAC") + '</li>' +
			'<li><span class="square" style="background-color:#4ca7d7"></span>' + I18N.prop("ENERGY_LIGHT") + '</li>' +
			'<li><span class="square" style="background-color:#99cde8"></span>' + I18N.prop("ENERGY_OTHERS") + '</li>' +
			'</ul>' +
			'</div>' +
			'<span class="graph-unit-symbol temperature">' + temperatureSymbol + '</span>' +
			'</div>';
	};

	//comparison 모듈 최초 시작
	return {
		init : init
	};
});

//# sourceURL=energy/comparison/comparison.js
