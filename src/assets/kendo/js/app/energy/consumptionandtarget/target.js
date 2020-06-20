/**
 *
 *   <ul>
 *       <li>target에 관한 페이지</li>
 *       <li>빌팅, 건물, 층과 디바이스 필터, 존, 기기 옵션 선택 가능</li>
 *       <li>연, 월, 일 조정 가능</li>
 *       <li>그래프, 그리드 페이지 구분</li>
 *   </ul>
 *   @module app/energy/consumptionandtarget/target
 *   @param {Object} CoreModule- 에너지 core 객체
 *   @param {Object} ViewModel- target ViewModel 객체
 *   @param {Object} Model- target Model 객체
 *   @param {Object} Template- target Template 객체
 *   @param {Object} Common- consumption Common 객체
 *   @param {Object} Widget- consumption Widget 객체
 *   @param {Object} Target- Target 객체
 *   @requires app/energy/core
 *   @requires app/energy/consumptionandtarget/view-model/target-vm
 *   @requires app/energy/consumptionandtarget/model/target-model
 *   @requires app/energy/consumptionandtarget/template/target-template
 *   @requires app/energy/consumptionandtarget/common/common
 *   @requires app/energy/consumptionandtarget/common/widget
 *   @requires app/energy/consumptionandtarget/target
 *   @returns {Object} 없음
 */
define("energy/consumptionandtarget/target", ["energy/core", "energy/consumptionandtarget/view-model/target-vm",
	"energy/consumptionandtarget/model/target-model",
	"energy/consumptionandtarget/template/target-template",
	"energy/consumptionandtarget/common/common",
	"energy/consumptionandtarget/common/widget"
], function(CoreModule, ViewModel, Model, Template, Common, Widget){

	// var moment = window.moment;				//[12-04-2018]안쓰는 코드 주석
	var kendo = window.kendo;
	var moment = window.moment;
	var globalSettings = window.GlobalSettings;
	var LoadingPanel = window.CommonLoadingPanel;
	var Util = window.Util;
	// var MainWindow = window.MAIN_WINDOW;								//[12-04-2018]안쓰는 코드 주석
	var groupFilterDataSource = ViewModel.groupFilterDataSource;
	var Loading = new LoadingPanel();
	var MainViewModel = ViewModel.MainViewModel;
	// var Views = ViewModel.Views;										//[12-04-2018]안쓰는 코드 주석
	var listViewData = $("#target-list-template").html();
	// var listViewDataThis = $("#target-list-template2").html();		//[12-04-2018]안쓰는 코드 주석
	// var Router = new kendo.Router();									//[12-04-2018]안쓰는 코드 주석
	// var Layout = new kendo.Layout("<div id='target-main-view-content' class='target-main-view-content'></div>");		//[12-04-2018]안쓰는 코드 주석
	var targetAllData = {}, targetAllDataSet = [];
	var dateDropBox;
	var consumptionView = $("#target-main-view");
	var dropBoxSelect;
	var dropBoxSelectData;
	var consumptionTab;
	var msgDialog = Widget.msgDialog, confirmDialog = Widget.confirmDialog;
	var MSG = Common.MSG;
	var TEXT = Common.TEXT;
	var targetData = Model.targetData;
	var lastYearData = Model.lastYearData;
	var thisYearData = Model.thisYearData;
	var deviceGroupData = '';
	var deviceTypeData;
	var targetPostList = [] ,targetPatchList = [];
	var ReductionData;
	var dropboxNameValue;
	var unitData = globalSettings.getTemperature().unit;
	var typeFilterDataSourceUnit = {
		'Meter.WattHour':['kWh',Util.CHAR[unitData]],
		'Meter.Gas':['㎥',Util.CHAR[unitData]],
		'Meter.Water':['(L)',Util.CHAR[unitData]],
		'Meter.Calori':['',Util.CHAR[unitData]],
		none:['','']
	};
	/**
	 *
	 *   target 페이지 진입시 기본 셋팅을 해주는 함수
	 *
	 *   @function init
	 *   @param {Object}tab - 페이지 tab 정보
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var init = function(tab){
		consumptionTab = tab;
		initComponent();
		//select after tab initailize
		var element = consumptionTab.contentElement(2);
		var yearDay = (new Date()).getFullYear();
		//Target은 연도만 표시함
		//View Model에는 선언되어있지 않지만, 아래와 같이 Set 함.
		MainViewModel.set("formmatedDate", yearDay);
		MainViewModel.set("lastYearData", yearDay - 1);
		dropBoxSelect = yearDay - 1;
		kendo.bind($(element), MainViewModel);

		var data = [];
		var typeListElem = $('#device-type-list2');
		var typeList = typeListElem.data("kendoDropDownList");
		deviceTypeData = typeList.value();

		// var comma='';			//[12-04-2018]안쓰는 코드 주석

		//data는 빈 Array임.
		//에너지미터 타입을 선택 했을 경우에 그룹 리스트를 Set함.
		//해당 코드는 무시 필요.
		MainViewModel.filters[1].options.set("dataSource", data);
		var i, max = data.length;
		groupFilterDataSource = [];
		for(i = 0; i < max; i++ ){
			groupFilterDataSource.push({text : data[i]['name'], value : String(data[i]['id'])});
		}

		/* 데이터 ajax */
		targetAllData.target = [];
		targetAllData.lastYear = [];
		targetAllData.thisYear = [];
		//초기에는 빈 Object임.
		targetAllData.target = targetData["target"];
		//그룹 데이터가 비어 있으므로, Pass
		//초기 그룹 데이터를 에너지 미터 타입을 선택하지 않아도 Set 했지만, 에너지 미터 타입을 선택해야 해당 그룹 리스트를 초기화하는 것으로 변경된 이력 있음.
		for(i = 0; i < groupFilterDataSource.length; i++){
			targetAllData.lastYear.push(lastYearData['monthly']);
			targetAllData.thisYear.push(thisYearData['monthly']);
		}

		attachEvent();
		MainViewModel.filters[1].set('disabled',true);
		MainViewModel.nextBtn.set("disabled", true);
		refreshData();
	};
	/**
	 *
	 *   현재 층에 대한 정보를 쿼리에 주가한다.
	 *
	 *   @function getFloorQuery
	 *   @param {Object}floorData - 기존 층 데이터
	 *   @returns {Object} q - 쿼리데이터
	 *   @alias 없음
	 *
	 */
	//[12-04-2018]안쓰는 코드 주석
	// var getFloorQuery = function(floorData){
	//     if(!floorData){
	//         floorData = MainWindow.getCurrentFloor();
	//     }
	//     var q = "?";
	//     if(floorData.building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
	//         q += "foundation_space_buildings_id="+floorData.building.id+"&";
	//     }
	//     if(floorData.floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
	//         q += "foundation_space_floors_id="+floorData.floor.id;
	//     }
	//     return q;
	//     //return "";
	// };
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
	//층 변경 시, 쿼리 생성하여 데이터를 Refresh 함.
	//[12-04-2018]안쓰는 코드 주석
	// var onFloorChange = function(floorData){
	//     var q = getFloorQuery(floorData);
	//     refreshData(q);
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
	 *   @param {Object}data - 표시할 data
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//[12-04-2018]안쓰는 코드 주석
	// var createView = function(data){
	// 	initView(data);
	// };
	/**
	 *
	 *   페이지 로드 시 consumption 페이지 랜더링하는 함수
	 *
	 *   @function routerInit
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//[12-04-2018]안쓰는 코드 주석
	// var routerInit = function(){
	//     Layout.render(targetView);
	// };
	/**
	 *
	 *   페이지 로드 시 consumption 페이지 보여주는 함수
	 *
	 *   @function routerEvt
	 *   @param {Object} 없음
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//[12-04-2018]안쓰는 코드 주석
	// var routerEvt = function(view){
	//     Layout.showIn("#target-main-view-content", view);
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

		/*View Model에 버튼 이벤트 바인딩*/

		/*날짜 Prev, Next 변경 버튼*/
		MainViewModel.nextBtn.set("click", function(e){
			//아래는 에시
			//MainViewModel.set("formmatedDate", moment().format("LLL"))
			dateChange(1);
			var nowTimeDate = MainViewModel.formmatedDate;
			MainViewModel.set("lastYearDataNum", nowTimeDate - 1);
			dropBoxSelect = nowTimeDate;
			refreshData();

		});

		MainViewModel.prevBtn.set("click", function(e){
			dateChange(-1);
			var nowTimeDate = MainViewModel.formmatedDate;
			MainViewModel.set("lastYearDataNum", nowTimeDate - 1);
			dropBoxSelect = nowTimeDate - 2;
			refreshData();
			//아래는 예시
			//MainViewModel.set("formmatedDate", moment().format("LLL"))
		});

		//에너지 미터 타입을 선택하면, 해당 타입의 Group 리스트를 가져옴.
		$('#device-type-list2').on("change", function(e){
			deviceTypeData = $(this).val();
			if(deviceTypeData){
				MainViewModel.filters[1].set('disabled',false);
				//deviceTypeData = e.sender.value().split('.')[1];
				Loading.open();

				$.ajax({
					url : "/dms/groups?dms_devices_types=" + deviceTypeData
				}).done(function(data){
					// 데이터가 있는 경우에만 '그룹 필터' 의 라벨을 '그룹' 에서 '전체 그룹' 으로 변경.
					if (data.length > 0) $('#group-list2').data('kendoDropDownList').setOptions({'optionLabel': TEXT.ENERGY_ALL_GROUP});
					else $('#group-list2').data('kendoDropDownList').setOptions({'optionLabel': TEXT.COMMON_MENU_FACILITY_GROUP});

					data.sort(function(a, b){
						return a.id - b.id;
					});
					MainViewModel.filters[1].options.set("dataSource", data);
					var i, max = data.length;
					groupFilterDataSource = [];
					for( i = 0; i < max; i++ ){
						groupFilterDataSource.push({text : data[i]['name'], value : String(data[i]['id'])});
					}
				}).fail(function(){

				}).always(function(){
					Loading.close();
					var nowTimeDate = MainViewModel.formmatedDate;
					MainViewModel.set("lastYearDataNum", nowTimeDate - 1);
					var groupListElem = $("#group-list2");
					var groupList = groupListElem.data("kendoDropDownList");
					groupList.value("");
					groupListElem.trigger("change");
					//groupListData.trigger("change");
					//refreshData();
				});

			}else{
				MainViewModel.filters[1].set('disabled',true);
				var data = [];
				var i, max = data.length;
				groupFilterDataSource = [];
				for( i = 0; i < max; i++ ){
					groupFilterDataSource.push({text : data[i]['name'], value : String(data[i]['id'])});
				}

				var nowTimeDate = MainViewModel.formmatedDate;
				MainViewModel.set("lastYearDataNum", nowTimeDate - 1);
				var groupListElem = $("#group-list2");
				var groupList = groupListElem.data("kendoDropDownList");
				groupList.value("");
				groupListElem.trigger("change");
				refreshData();
				// '그룹 필터' 의 라벨을 '전체 그룹' 에서 그룹으로 변경
				$('#group-list2').data('kendoDropDownList').setOptions({'optionLabel': TEXT.COMMON_MENU_FACILITY_GROUP});
			}
		});

		//. (소수점) 입력 방지
		$('#target-main-view').on("keydown",'.target-content-row .input-val', function(e){
			var event = window.event;
			if( event.keyCode == 110 || event.keyCode == 190 ) {
				event.returnValue = false;
			}else{

			}
		});
		/* target 값 입력 시 이벤트 */
		$('#target-main-view').on("keyup",'.target-content-row .input-val', function(e){
			 var nowTimeDate = MainViewModel.formmatedDate;
			$('.button_list button[data-action="Save"]').attr('disabled',false);
			var DimInput;
			var pushInput, pushText;
			var pushdataValue,remainValue;
			var MAX_TOTAL_TARGET_VALUE = 9999999;
			var allInputValue;
			if(($(this).val()).indexOf('.') > 0){
				$(this).val(Math.trunc($(this).val()));
			}
			/* 전체 target 값 입력 */
			//전체 Target 값을 입력 시.
			if($(this).hasClass('allValue')){
				var allValue = Math.abs($(this).val());
				var pushValue = 0;
				//이번달 이전의 Dim 처리된 Input Field
				DimInput = $('.target-content-row .input-val:not(".allValue").dimInput');
				//입력 가능한 입력 필드
				pushInput = $('.target-content-row .input-val:not(".allValue"):not(".dimInput")');
				//Display Text 요소
				pushText = $('.target-content-row .normal-val:not(".allValue"):not(".dimText")');

				//이미 변경 불가한 Dim 처리된 Value 값을 전체 더하고,
				//Total(전체) 타겟 값에서 뺀 후, 나머지 값을 나누어서 활성화된 Input Field와 Text에 Set.
				DimInput.each(function(){
					pushValue += Number($(this).val());
				});
				allInputValue = 0;
				$('.target-content-row .input-val:not(".allValue")').each(function(){
					allInputValue += Number($(this).val());
				});
				//Total 최대치 체크
				if(allValue > MAX_TOTAL_TARGET_VALUE){
					//allValue = MAX_TOTAL_TARGET_VALUE-pushValue;
					allValue = MAX_TOTAL_TARGET_VALUE;
					//allValue = '';
					msgDialog.message(MSG.ENERGY_TARGET_LESS);
					msgDialog.open();
				}
				//전체 Total 값에서 비활성화된 Input의 값을 제외하고, 활성화된 Input 개수로 나누어서, 월별 평균 값을 구함.
				pushdataValue = Math.floor((allValue - pushValue) / pushInput.length);
				//월 별로 나눈 평균 값의 나머지를 구함.
				remainValue = (allValue - pushValue) % pushInput.length;
				if(pushdataValue < 0){
					pushdataValue = 0;
					remainValue = 0;
				}
				pushInput.val(pushdataValue);
				pushText.text(pushdataValue);
				//나머지 값은 가장 마지막 Input Field에 넣는다. (e.g : 2800/3 = 933, 나머지는 1. 나머지 1은 맨 마지막 필드에 추가되어 맨 마지막 필드는 934가 된다.)
				pushInput.eq(pushInput.length - 1).val(pushdataValue + remainValue);
				pushText.eq(pushInput.length - 1).text(pushdataValue + remainValue);
				$(this).val(allValue);
			}else{
				/* 월별 target 값 입력 */
				//절대값을 구한다. 현재 음수(-) 입력 가능. 절대값은 최대값 체크를 위해 쓰인다.
				var thisValue = Math.abs($(this).val());
				var allInput = $('.target-content-row .input-val.allValue');
				var allText = $('.target-content-row .normal-val.allValue');
				// var thisInputValue;			//[12-04-2018]안쓰는 코드 주석
				allInputValue = 0;

				//모든 '월' 입력 필드로 부터 전체 타겟 값을 구한다. allInputValue
				$('.target-content-row .input-val:not(".allValue")').each(function(){
					allInputValue += Number($(this).val());
				});
				//전체 '월' 입력 필드와 현재 입력한 '월' 입력필드가 최대값이 넘지 않는지 체크한다.
				if(allInputValue > MAX_TOTAL_TARGET_VALUE || thisValue > MAX_TOTAL_TARGET_VALUE){
					msgDialog.message(MSG.ENERGY_TARGET_LESS);
					msgDialog.open();
					$(this).val(MAX_TOTAL_TARGET_VALUE - (allInputValue - thisValue));
					allInput.val(MAX_TOTAL_TARGET_VALUE);
					allText.text(MAX_TOTAL_TARGET_VALUE);
				}else{
					//전체 Target 값을 업데이트한다.
					allInput.val(Number(allInputValue));
					allText.text(Number(allInputValue));
				}
			}
			var inputList = $('.target-content-row .input-val:not(".allValue")');

			//저장 버튼을 눌렀을 때, API호출을 위한 데이터 모델을 업데이트한다.
			targetPatchList = {
				"dms_meter_type": deviceTypeData,
				"dms_group_id": deviceGroupData,
				"year": nowTimeDate,
				"target" :[]
			};
			targetPostList = {
				"dms_meter_type": deviceTypeData,
				"dms_group_id": deviceGroupData,
				"year": nowTimeDate,
				"target" :[]
			};

			for(var i = 0; i < inputList.length; i++){
				var targetValue = Number($('.target-content-row .input-val:not(".allValue")').eq(i).val());
				var targetBool = $('.target-content-row .input-val:not(".allValue")').eq(i).attr('data-change');


				if(targetData['target']){
					targetData['target'][i] = {month:i + 1,value:targetValue};
				}else{
					targetData['target'] = [];
					targetData['target'][i] = {month:i + 1,value:targetValue};
				}
				//targetBool이랑 관계 없이 Model에 같은 데이터가 Set됨.
				if(targetBool == 'true'){
					if(targetPatchList.target > 0){
						targetPatchList.target[i].month = i + 1;
						targetPatchList.target[i].value = targetValue;
					}else{
						targetPatchList.target.push({month:i + 1,value:targetValue});
					}
				}
				if(targetBool == 'false'){
					if(targetPatchList.target > 0){
						targetPostList.target[i].month = i + 1;
						targetPostList.target[i].value = targetValue;
					}else{
						targetPostList.target.push({month: i + 1,value:targetValue});
					}
				}

			}
			targetAllData.target = [];
			targetAllData.lastYear = [];
			targetAllData.thisYear = [];
			if(targetData){
				targetAllData.target = targetData["target"];
			}
			targetAllData.thisYear.push(thisYearData['monthly']);
			targetAllData.lastYear.push(lastYearData['monthly']);

			reductionDataSet(targetAllData);

			graphMade(targetAllData);
		});

		var buttonHtml = '<div class="button_list"><button class="k-button" data-action="Edit">' + TEXT.COMMON_BTN_EDIT + '</button><button class="k-button" data-action="Save" style="display:none;">' + TEXT.COMMON_BTN_SAVE + '</button><button class="k-button" data-action="Cancel" style="display:none;">' + TEXT.COMMON_BTN_CANCEL + '</button></div>';

		$('#group-list2').on("change", function(e){
			deviceGroupData = $(this).val();
			//그룹 선택 시, 버튼 리스트 초기화
			$('.consumption-tab-target .consumption-tab-top-content .button_list').remove();
			if(deviceGroupData){
				//소비량 리스트 Hide
				$('.targetTab01').hide();
				//타겟 편집 화면 Show
				$('.targetTab02').show();
				//타겟 편집 화면의 저장/취소 버튼 표시
				$('.consumption-tab-target .consumption-tab-top-content').append(buttonHtml);
				//올해 연도 까지만 Navigate 되도록 체크하여 활성화/비활성화 여부 UI 업데이트
				dateOverChange();
			}else{
				//소비량 리스트 Show
				$('.targetTab01').show();
				//타겟 편집 화면 Hide
				$('.targetTab02').hide();
				//올해 연도 까지만 Navigate 되도록 체크하여 활성화/비활성화 여부 UI 업데이트
				dateOverChange();
			}


			//타겟 편집화면의 버튼 이벤트 바인딩
			$('.button_list button').on('click',function(){
				var buttonMode = $(this).attr('data-action');
				// console.log(buttonMode)
				var deferreds = [];
				var nowTimeDate;
				if(buttonMode == 'Edit'){
					MainViewModel.set("actionMode", false);
					//편집 버튼 클릭 시, 버튼, 필터 상태 Disable, Show/Hide 처리
					editAction();
					//입력 필드 Show
					inputShow();
				}
				if(buttonMode == 'Save'){
					//저장 버튼 클릭 시, 버튼, 필터 상태 Disable, Show/Hide 처리
					saveAction();
					//입력 필드 Hide
					inputHide();
					//세이브 후 토탈 타겟 텍스트 업데이트
					var targetTotalRow = $('.target-content-row');
					var targetTotalVal = targetTotalRow.find('.two-line .input-val').val();
					targetTotalRow.find('.two-line .normal-val').text(targetTotalVal);
					//입력 시, 저장한 Model로 API 호출
					Loading.open();
					if(targetPostList['target'].length > 0){
						deferreds.push($.ajax({
							url : '/energy/target/',
							method: "POST",
							data:targetPostList
						}));
					}
					if(targetPatchList['target'].length > 0){
						deferreds.push($.ajax({
							url : '/energy/target/',
							method: "PATCH",
							data:targetPatchList
						}));
					}

					$.when.apply(this, deferreds).done(function(){
						msgDialog.message(MSG.COMMON_MESSAGE_NOTI_CHANGES_SAVED);
						msgDialog.open();
						refreshData();
					}).fail(function(data){
						var msg = Util.parseFailResponse(data);
						msgDialog.message(msg);
						msgDialog.open();
					}).always(function(){
						nowTimeDate = MainViewModel.formmatedDate;
						MainViewModel.set("lastYearDataNum", nowTimeDate - 1);
						Loading.close();
						MainViewModel.set("actionMode", true);
						refreshData();
					});
				}
				//취소 버튼 클릭 시
				if(buttonMode == 'Cancel'){
					//수정 사항이 존재할 경우 Save 버튼이 활성화 되어 있으므로,
					//Save 버튼의 활성화 여부 체크하여, 편집 된 내용을 무시하고 취소할 것인지 팝업 표시.
					if($('.button_list .k-button[data-action="Save"]').prop('disabled')){
						MainViewModel.set("actionMode", true);
						//버튼 및 필터 활성화/비활성화, 버튼 Show Hide
						cancelAction();
						inputHide();
						nowTimeDate = MainViewModel.formmatedDate;
						MainViewModel.set("lastYearDataNum", nowTimeDate - 1);
						refreshData();
					}else{
						confirmDialog.setConfirmActions({   //또 다른 Confirm Dialog의 yes 버튼 이벤트를 새롭게 set
							yes : function(){
								MainViewModel.set("actionMode", true);
								cancelAction();
								inputHide();
								nowTimeDate = MainViewModel.formmatedDate;
								MainViewModel.set("lastYearDataNum", nowTimeDate - 1);
								refreshData();
							}
						});
						confirmDialog.message(MSG.COMMON_MESSAGE_CONFIRM_CANCEL);
						confirmDialog.open();
					}
				}
			});
			var nowTimeDate = MainViewModel.formmatedDate;
			MainViewModel.set("lastYearDataNum", nowTimeDate - 1);
			refreshData();
		});
		/*Drop Down List*/
		/*기기 타입 필터*/
		/*MainViewModel.filters[0].options.set("select", function(e){
			console.info(e);
			refreshData();
		});

		그룹 필터
		MainViewModel.filters[1].options.set("select", function(e){
			console.info(e);
			refreshData()
		});*/

		//아래 코드는 안쓰임.
		//Edit 버튼
		MainViewModel.actions[0].options.set("click", function(e){
			console.info(e);
			refreshData();
		});
		//Cancel 버튼
		MainViewModel.actions[1].options.set("click", function(e){
			console.info(e);
			refreshData();
		});
		//Save 버튼
		MainViewModel.actions[2].options.set("click", function(e){
			console.info(e);
			refreshData();
		});
		/*View Model에 actions가 있을 경우 버튼 이벤트 등의 바인딩.
		아래 처럼 함수를 따로 빼서 바인딩 하는 것이 깔끔하다. */
		/*MainViewModel.actions[0].options.set("click", editBtnEvt);
		MainViewModel.actions[1].options.set("click", cancelBtnEvt);
		MainViewModel.actions[2].options.set("click", saveBtnEvt);*/


		/*Graph, Grid 등의 Widget 이벤트 바인딩*/
		/*Views.calendar.widget.bind("change", widgetChangeEvt);
		Views.calendar.widget.element.on("click", ".k-event", widgetChangeEvt);
		Views.list.widget.bind("change", widgetChangeEvt);
		Views.list.widget.bind("checked", widgetChangeEvt);*/

		$('#main-sidebar-menu .btn-box').off('click', '.btn', graphResizeEvt).on('click', '.btn', graphResizeEvt);
		consumptionTab.bind('show', function (e) {
			if($(e.item).data('role') === 'target') graphResizeEvt();
		});
	};

	var graphResizeEvt = function (e) {
		var graph = $('#targetGraph').data('kendoChart');
		if(graph) {
			graph.setOptions({chartArea: {width: consumptionView.width()}});
		}
	};
	/**
	 *
	 *   edit 모드 시 input 보여지는 함수
	 *
	 *   @function inputShow
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var inputShow = function(){
		var newDate = new Date();
		var thisMonth = newDate.getMonth();
		$('.target-content-row').find('.input-val').show();
		$('.target-content-row').find('.normal-val').hide();
		var dataYear = newDate.getFullYear();
		$('.table-row').find('li:not(".first")').each(function(){
			var thisIndex = $(this).index();
			if(thisIndex <= thisMonth && MainViewModel.formmatedDate == dataYear){
				$(this).find('.input-val').attr('disabled',true).addClass('dimInput');
				$(this).find('.normal-val').addClass('dimText');
			}else if(MainViewModel.formmatedDate < dataYear){
				$('.target-content-row').find('.input-val').attr('disabled',true).addClass('dimInput');
				$('.target-content-row').find('.normal-val').addClass('dimText');
			}
		});
	};
	/**
	 *
	 *   edit 모드 해제 시 input 숨기는 함수
	 *
	 *   @function inputShow
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var inputHide = function(){
		$('.target-content-row').find('.input-val').hide();
		$('.target-content-row').find('.normal-val').show();
	};
	/**
	 *
	 *   edit 모드 시 실행 이벤트
	 *
	 *   @function inputShow
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var editAction = function(){
		MainViewModel.filters[0].set('disabled',true);
		MainViewModel.filters[1].set('disabled',true);
		$('.button_list').find('[data-action="Save"]').css({'display':'inline-block'}).attr('disabled',true);
		$('.button_list').find('[data-action="Edit"]').css({'display':'none'});
		$('.button_list').find('[data-action="Cancel"]').css({'display':'inline-block'}).attr('disabled',false);
	};
	/**
	 *
	 *   save 모드 시 실행 이벤트
	 *
	 *   @function inputShow
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var saveAction = function(){
		$('.button_list').find('[data-action="Save"]').css({'display':'none'}).attr('disabled',true);
		$('.button_list').find('[data-action="Edit"]').css({'display':'inline-block'}).attr('disabled',false);
		$('.button_list').find('[data-action="Cancel"]').css({'display':'none'}).attr('disabled',false);
		MainViewModel.filters[0].set('disabled',false);
		MainViewModel.filters[1].set('disabled',false);
	};
	/**
	 *
	 *   cancel 모드 시 실행 이벤트
	 *
	 *   @function inputShow
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var cancelAction = function(){
		$('.button_list').find('[data-action="Save"]').css({'display':'none'}).attr('disable',true);
		$('.button_list').find('[data-action="Edit"]').css({'display':'inline-block'}).attr('disable',true);
		$('.button_list').find('[data-action="Cancel"]').css({'display':'none'}).attr('disable',false);
		MainViewModel.filters[0].set('disabled',false);
		MainViewModel.filters[1].set('disabled',false);
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
	//[12-04-2018]안쓰는 코드 주석
	// var activeGraph = function(e){
	//     //disable all btn
	//     MainViewModel.graphBtn.set("active", true);
	//     MainViewModel.listBtn.set("active", false);
	//     Router.navigate(Views.graph.routeUrl);
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
	//[12-04-2018]안쓰는 코드 주석
	// var activeList = function(e){
	//     //enable all btn
	//     MainViewModel.listBtn.set("active", true);
	//     MainViewModel.graphBtn.set("active", false);
	//     Router.navigate(Views.list.routeUrl);
	// };
	/**
	 *
	 *   target 데이터를 보여주기 위해서 데이터 형태를 변경해주는 함수
	 *
	 *   @function targetDataSet
	 *   @param {Array} data - target 데이터 리스트
	 *   @returns {Array} targetAllDataSet - target view에 들어갈 데이터
	 *   @alias 없음
	 *
	 */
	/* 데이터 ajax */
	var targetDataSet = function(data){
		var thisYearTotal = 0;
		var lastYearTotal = 0;
		var targetTotal = 0;
		// var groupName;			//[12-04-2018]안쓰는 코드 주석
		var targetVal,thisYearVal,lastYearVal;
		targetAllDataSet = [];
		var list = {}, listNumSet;
		var nowDate = new Date();
		var nowDateMonth = nowDate.getMonth() + 1;
		var nowDateYear = nowDate.getFullYear();
		var nowTimeDate = MainViewModel.formmatedDate;
		var j, k, m;
		//
		for(j = 0; j < groupFilterDataSource.length; j++){
			list = {};
			thisYearTotal = 0;
			lastYearTotal = 0;
			for(k = 0; k < 12; k++){
				list['lastYear' + k] = 0;
				list['thisYear' + k] = 0;
				list['target' + k] = 0;
			}

			//전체 그룹 선택 시
			if(data.thisYear && data.thisYear[0] && !data.thisYear[0].month){
				//전체 그룹의 올해 소비량 데이터를 생성한다. list에 할당한다.
				for(m = 0; m < data.thisYear[0].length; m++){
					if(groupFilterDataSource[j] && groupFilterDataSource[j].text == data.thisYear[0][m].dms_group_name && data.thisYear[0][m]['monthly']){
						thisYearTotal = 0;
						for(k = 0; k < data.thisYear[0][m]['monthly'].length; k++){
							listNumSet = Number(data.thisYear[0][m]['monthly'][k].month) - 1;
							thisYearVal = Math.round(data.thisYear[0][m]['monthly'][k].total);
							list['thisYear' + listNumSet] = numberWithCommas(thisYearVal);
							thisYearTotal += thisYearVal;
						}
						thisYearTotal = numberWithCommas(thisYearTotal);
					}
				}
			}
			//단일 그룹 선택 시, 해당 그룹의 올해 소비량 데이터를 생성한다. list에 할당한다.
			if(data.thisYear && data.thisYear[0] && data.thisYear[0][0].month){
				thisYearTotal = 0;
				for(k = 0; k < data.thisYear[0].length; k++){
					thisYearVal = Math.round(data.thisYear[0][k].total);
					if(!thisYearVal){
						thisYearVal = 0;
					}
					thisYearTotal += thisYearVal;
					list['thisYear' + (data.thisYear[0][k].month - 1)] = thisYearVal;
				}
			}
			//전체 그룹 선택 시
			if(data.lastYear && data.lastYear[0] && !data.lastYear[0].month){
				lastYearTotal = 0;
				//전체 그룹의 작년 소비량 데이터를 생성한다. list에 할당한다.
				for(m = 0; m < data.lastYear[0].length; m++){
					if(groupFilterDataSource[j] && groupFilterDataSource[j].text == data.lastYear[0][m].dms_group_name && data.lastYear[0][m]['monthly']){
						for(k = 0; k < data.lastYear[0][m]['monthly'].length; k++){
							listNumSet = Number(data.lastYear[0][m]['monthly'][k].month) - 1;
							lastYearVal = Math.round(data.lastYear[0][m]['monthly'][k].total);
							list['lastYear' + listNumSet] = numberWithCommas(lastYearVal);
							lastYearTotal += lastYearVal;
						}
					}

					/*if(groupFilterDataSource[j].text ==data.lastYear[0][m].dms_group_name){
						for(var k = 0;k< 12; k++){
							lastYearVal =0;
							if(data.lastYear[0] && data.lastYear[0][m] ){
								if(data.lastYear[0][m]['monthly'][k]){
									lastYearVal = Math.ceil(data.lastYear[0][m]['monthly'][k].total);
								}else{
									lastYearVal = 0;
								}
								lastYearTotal += lastYearVal;
								list['lastYear'+k] = lastYearVal
							}else{
								lastYearTotal += lastYearVal;
								list['lastYear'+k] = 0;
							}
						}
					}*/
				}
			}
			//단일 그룹 선택 시, 해당 그룹의 작년 소비량 데이터를 생성한다. list에 할당한다.
			if(data.lastYear && data.lastYear[0] && data.lastYear[0][0].month){
				lastYearTotal = 0;
				for(k = 0; k < data.lastYear[0].length; k++){
					lastYearVal = Math.round(data.lastYear[0][k].total);
					if(!lastYearVal){
						lastYearVal = 0;
					}
					lastYearTotal += lastYearVal;
					list['lastYear' + (data.lastYear[0][k].month - 1)] = lastYearVal;
				}
			}
			//그룹이 선택되어있지 않을 경우
			if(!$('#group-list2').val()){
				for (var thisYearKey in list) {
					if(thisYearKey.indexOf('thisYear') > -1){
						var nameSet = Number(thisYearKey.split('thisYear')[1]);
						//nameSet은 올해 소비량의 월
						//만약 해당 월이 현재의 달 이상이면 소비량은 0으로 Set
						if(nowDateYear == nowTimeDate && nowDateMonth <= nameSet){
							list[thisYearKey] = 0;
						}
					}
				}
			}

			if(data.target && data.target.length > 0 && !data.target[0].value){
				targetTotal = 0;
				for(m = 0; m < data.target.length; m++){
					if(groupFilterDataSource[j] && groupFilterDataSource[j].value == data.target[m].dms_group_id && data.target[m]['target']){
						// thisYearTotal = 0;
						for(k = 0; k < data.target[m]['target'].length; k++){
							listNumSet = Number(data.target[m]['target'][k].month) - 1;
							targetVal = Math.round(data.target[m]['target'][k].value);

							if(nowDateYear == nowTimeDate && nowDateMonth - 1 < data.target[m]['target'][k].month){
								//올해의 현재의 달부터 Target 값이 존재하면 소비량 대신 Target을 Set
								list['thisYear' + listNumSet] = numberWithCommas(targetVal);
							}
							list['target' + (data.target[m]['target'][k].month - 1)] = targetVal;
							targetTotal += targetVal;
						}
					}
				}
				/*for(var m = 0;m< data.target.length; m++){

					if(groupFilterDataSource[j].value ==data.target[m].dms_group_id){
						for(var k = 0;k< 12; k++){
							targetVal =0;
							if(data.target && data.target[m] ){
								if(data.target[m]['target'][k]){
									targetVal = Math.ceil(data.target[m]['target'][k].total);
								}else{
									targetVal = 0;
								}
								targetTotal += targetVal;
								list['target'+k] = targetVal;
							}else{
								targetTotal += targetVal;
								list['target'+k] = 0;
							}
						}
					}

				}*/
			}

			//올해 및 이전 년도 상관없이 전체 그룹 선택 시의 Total은 목표 에너지 소비량의 합이 표시되는 것으로 수정 2017.12.30
			/*if(nowDateYear == nowTimeDate) list.isThisYear = true;
			else list.isThisYear = false;

			if(list.isThisYear){
				var thisYearTotalBefore=0;
				//nowTimeDate는 현재 조회한 연도 값
				//nowDateYear는 올해 연도 값

				for (var thisYearKey in list) {
					if(thisYearKey.indexOf('thisYear') > -1){
						var nameSet = Number(thisYearKey.split('thisYear')[1]);
						thisYearTotal += list[thisYearKey];
					}
				}
				//올해의 소비량 및 타겟(목표 에너지)를 더한 값
				thisYearTotal = thisYearTotalBefore;
			}*/


			//단일 그룹을 선택하였을 때, 타겟 데이터 Set 및 합하여 전체 타겟 데이터를 구한다.
			if(data.target && data.target.target && data.target.target.length > 0){
				targetTotal = 0;
				for(k = 0; k < data.target.target.length; k++){
					targetVal = Math.round(data.target.target[k].value);
					if(!targetVal){
						targetVal = 0;
					}
					targetTotal += targetVal;
					list['target' + (data.target.target[k].month - 1)] = targetVal;
				}
			}

			list.thisYearTotal = thisYearTotal;
			list.lastYearTotal = lastYearTotal;
			//전체 타겟 값
			list.targetTotal = targetTotal;
			list.groupName = groupFilterDataSource[j].text;
			targetAllDataSet.push(list);
			ReductionData = (1 - (Number(targetTotal) / Number(lastYearTotal))) * 100;

			if(!isFinite(ReductionData)){
				ReductionData = 0;
			}else{
				ReductionData = ReductionData.toFixed(0);
			}

		}
		// console.log(targetAllDataSet)
		return targetAllDataSet;
	};

	/**
	 *
	 *   데이터를 다시 불러와 setDataSource 수행
	 *
	 *   @function refreshData
	 *   @param {String} dropboxName - 드롭박스 선택된 이름
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	//데이터를 다시 불러와 setDataSource 수행
	var refreshData = function(dropboxName){
		dropboxNameValue = dropboxName;
		deviceTypeData = $('#device-type-list2').val();
		// var dataBool =deviceGroupData;							//[12-04-2018]안쓰는 코드 주석
		// var deviceLength = groupFilterDataSource.length;			//[12-04-2018]안쓰는 코드 주석
		var nowTimeDate = MainViewModel.formmatedDate;
		// var lastYearDataNum=MainViewModel.lastYearDataNum;		//[12-04-2018]안쓰는 코드 주석
		var thisDeferreds = [];
		var BeforeDeferreds = [];
		var targetDeferreds = [];
		// var dropDownSelectData;									//[12-04-2018]안쓰는 코드 주석
		var groupFilterDataList = '';
		var comma = '';
		//그룹 필터가 비활성화 상태일때는 refresh하지 않는다.
		if(MainViewModel.filters[1].get('disabled') && MainViewModel.actionMode){
			initView([]);
			return;
		}

		var isAllGroupData = false;
		Loading.open();

		//작년 연도 값 할당
		if(!dropboxNameValue){
			dropboxNameValue = Number(nowTimeDate) - 1;
		}

		//그룹 선택 시, 해당 그룹과 미터 타입의 작년 소비량, 올해 소비량, 타겟 데이터를 가져온다.
		if(deviceGroupData){
			thisDeferreds.push($.ajax({
				url : '/energy/consumption?year=' + nowTimeDate + '&dms_meter_type=' + deviceTypeData + '&dms_group_ids=' + deviceGroupData,
				method: "GET"
			}));
			BeforeDeferreds.push($.ajax({
				url : '/energy/consumption?year=' + dropboxNameValue + '&dms_meter_type=' + deviceTypeData + '&dms_group_ids=' + deviceGroupData,
				method: "GET"
			}));
			targetDeferreds.push($.ajax({
				url : '/energy/target?year=' + nowTimeDate + '&dms_meter_type=' + deviceTypeData + '&dms_group_ids=' + deviceGroupData,
				method: "GET"
			}));
		}else if(deviceTypeData){
			//미터 타입만 선택 시, (전체 그룹일 경우) 선택한 미터 타입의 전체 그룹들의 타겟 데이터를 가져온다.
			isAllGroupData = true;
			targetDeferreds.push($.ajax({
				url : '/energy/target/group?year=' + nowTimeDate + '&dms_meter_type=' + deviceTypeData,
				method: "GET"
			}).then(function(data){
				if(data.targetEnergyByMeters){
					data = data.targetEnergyByMeters;
				}
				return data;
			}));

			for(var idx = 0; idx < groupFilterDataSource.length; idx++){
				if(idx > 0){
					comma = ',';
				}
				groupFilterDataList += comma + groupFilterDataSource[idx].value;
			}
			//현재 선택한 미터타입과 그룹들의 올해 소비량, 작년 소비량을 가져온다.
			thisDeferreds.push($.ajax({
				url : '/energy/consumption/group?year=' + nowTimeDate + '&dms_meter_type=' + deviceTypeData + '&dms_group_ids=' + groupFilterDataList,
				method: "GET"
			}));
			BeforeDeferreds.push($.ajax({
				url : '/energy/consumption/group?year=' + dropboxNameValue + '&dms_meter_type=' + deviceTypeData + '&dms_group_ids=' + groupFilterDataList,
				method: "GET"
			}));
		}
		//선택한 미터타입의 그룹별 올해 소비량 Set
		$.when.apply(this, thisDeferreds).done(function(data){
			thisYearData = data;
			// console.log(thisYearData)
		}).fail(function(data){
			var msg;
			if(data.status == 400){
				msg = TEXT.ENERGY_DEVICE_GROUPS_EMPTY;
			}else{
				msg = Util.parseFailResponse(data);
			}
			msgDialog.message(msg);
			msgDialog.open();
			//thisYearData = {}

		}).always(function(){
			//선택한 미터타입의 그룹별 작년 소비량 Set
			$.when.apply(this, BeforeDeferreds).done(function(data){
				lastYearData = data;

			}).fail(function(data){
				var msg;
				if(data.status == 400){
					msg = TEXT.ENERGY_DEVICE_GROUPS_EMPTY;
				}else{
					msg = Util.parseFailResponse(data);
				}
				msgDialog.message(msg);
				msgDialog.open();
				//lastYearData = {};

			}).always(function(){
				//선택한 미터타입의 그룹별 타겟 데이터 Set
				$.when.apply(this, targetDeferreds).done(function(data){

					targetData = data;

				}).fail(function(data){
					var msg;
					if(data.status == 400){
						msg = TEXT.ENERGY_DEVICE_GROUPS_EMPTY;
					}else{
						msg = Util.parseFailResponse(data);
					}
					msgDialog.message(msg);
					msgDialog.open();
					targetData = {};
				}).always(function(){

					// console.log(targetData)
					//targetAllData={}
					// console.log(thisYearData,lastYearData,targetData)
					var i, j;
					if(!targetData && !thisYearData && !lastYearData){
						return;
					}

					//targetAllData.target=[];
					targetAllData.lastYear = [];
					targetAllData.thisYear = [];
					if(targetData){
						targetAllData.target = targetData;
					}
					//전체 그룹 조회 시에는 올해 타겟 데이터를 표시한다.
					//전체 그룹 조회 시.
					if(isAllGroupData && targetData && $.isArray(targetData)){
						var target, length, hasGroupId, groupId, max = targetData.length;

						targetData.sort(function(a, b){
							return a.dms_group_id - b.dms_group_id;
						});
						//그룹 콤보박스에 속한 데이터만 리스트 생성되도록 다른 타겟 데이터는 삭제
						for( i = max - 1; i >= 0; i-- ){
							target = targetData[i];
							groupId = target.dms_group_id;
							hasGroupId = false;
							length = groupFilterDataSource.length;
							for( j = 0; j < length; j++ ){
								if(groupFilterDataSource[j].value == groupId){
									hasGroupId = true;
									break;
								}
							}
							if(!hasGroupId){
								targetData.splice(i, 1);
							}
						}
						max = targetData.length;
						for( i = 0; i < max; i++ ){
							target = targetData[i];
							target = target.target;
							length = target.length;
							for( j = 0; j < length; j++ ){
								target[j].total = target[j].value;
							}
							//targetAllData.thisYear.push(target);
						}
						max = targetAllData.thisYear.length;
						length = thisDeferreds.length;

						//그룹 드롭다운 리스트에 존재하지 않는 Group들만 전체 타겟 데이터로 응답될 경우의 예외처리
						/*if(max < length){
							for( i = max; i < length; i++ ){
								targetAllData.thisYear.push({target : [] });
							}
						}*/
						if(targetData){
							targetAllData.target = targetData;
						}
					}
					//올해소비량
					if(thisYearData){
						for(i = 0; i < thisDeferreds.length; i++){
							//thisYearData.monthly 는 전체 그룹일 경우 전체 그룹 리스트의 소비량이다. 단일 선택 그룹일 경우 해당 그룹의 소비량이다.
							targetAllData.thisYear.push(thisYearData['monthly']);
						}
					}
					//작년소비량
					if(lastYearData){
						for(i = 0; i < BeforeDeferreds.length; i++){
							//lastYearData.monthly 는 전체 그룹일 경우 전체 그룹 리스트의 소비량이다. 단일 선택 그룹일 경우 해당 그룹의 소비량이다.
							targetAllData.lastYear.push(lastYearData['monthly']);
						}
					}
					// console.log(targetAllData)

					var targetDataSource = targetDataSet(targetAllData);
					initView(targetDataSource);
					//현재 편집모드 일 경우를 체크
					//false일 경우 편집모드 상태임.
					if(!MainViewModel.actionMode){
						editAction();
						inputShow();
					}
					dateOverChange();
					Loading.close();
				});
			});
		});
		var numVal = 0;
		//그룹 선택하였을 경우 모든 월의 타겟 데이터(목표에너지)를 가져와서 합하여 총합값을 구한다.
		$('.target-content-row').find('li').each(function(){
			if($(this).hasClass('first') == false){
				numVal = numVal + Number($(this).find('.normal-val').text());
			}
		});
		//이전 연도 값이 존재할 경우
		if(dropboxNameValue){
			//이전 에너지 소비량을 조회하는 드롭다운 리스트의 값을 이전 연도로 Set한다.
			MainViewModel.set("dateDropBox", dropboxNameValue);
			//$('.graphTopBox ul li:first-child').find('.text').text(dropboxNameValue+' Consumption')
		}

		//initViewDetail();
		//목표 에너지의 총합 값을 Input 필드와 텍스트에 Set하여 업데이트한다.
		$('.target-content-row .two-line').find('.normal-val').text(numVal);
		$('.target-content-row .two-line').find('.input-val').val(numVal);
	};


	var targetListSet = '<div class="target-box">' +
		'<div class="">' +
			'<div class="target-head">' +
			'<div class="embossBar"></div>' +
				'<ul class="target-head-list">' +
					'<li class="first">' + TEXT.ENERGY_TARGET_ENERGY_CONSUMPTION + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_JAN + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_FEB + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_MAR + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_APR + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_MAY + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_JUN + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_JUL + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_AUG + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_SEP + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_OCT + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_NOV + '</li>' +
					'<li>' + TEXT.ENERGY_DATE_DEC + '</li>' +
				'</ul>' +
			'</div>' +
			'<div id="target-content" class="target-content-row">' +
			'</div>' +
		'</div>' +
	'</div>';

	//[12-04-2018]안쓰는 코드 주석
	//     var targetDetailSet ='<div class="target-box">'+
	// 	'<div class="target-title">'+TEXT.ENERGY_TARGET_ENERGY_CONSUMPTION+'</div>'+
	// 	'<div class="">'+
	// 		'<div class="target-head">'+
	// 			'<ul class="target-head-list">'+
	// 				'<li class="first">'+TEXT.ENERGY_TARGET_ENERGY_CONSUMPTION+'</li>'+
	// 				'<li>'+TEXT.ENERGY_DATE_JAN+'</li>'+
	// 				'<li>'+TEXT.ENERGY_DATE_FEB+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_MAR+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_APR+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_MAY+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_JUN+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_JUL+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_AUG+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_SEP+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_OCT+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_NOV+'</li>'+
	// 			'<li>'+TEXT.ENERGY_DATE_DEC+'</li>'+
	// 			'</ul>'+
	// 		'</div>'+
	// 		'<div id="target-content">'+
	// 		'</div>'+
	// 	'</div>'+
	// '</div>';

	var targetDetailList = '<div class="target-box">' +
		'<div class="target-title"></div>' +
		'<div class="">' +
			'<div class="target-head">' +
				'<div class="embossBar"></div>' +
				'<ul class="target-head-list">' +
				'<li class="first"></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>' +
				'</ul>' +
			'</div>' +
			'<div id="target-content">' +
				'<div class="target-content-row">' +
					'<ul class="table-row bg-color">' +
					'<li class="first"></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>' +
					'</ul>' +
				'</div>' +
			'</div>' +
		'</div>' +
	'</div>';
	/**
	 *
	 *   첫 시작시 target 만들어주는 함수
	 *
	 *   @function initView
	 *   @param {Array} ds - target 데이터 리스트
	 *   @returns {Object} 없음
	 *   @alias 없음
	 *
	 */
	var initView = function(ds){
		 var nowTimeDate = MainViewModel.formmatedDate;
		 // var lastYearDataNum=MainViewModel.lastYearDataNum;		//[12-04-2018]안쓰는 코드 주석
		//전체 그룹 및 단일 그룹 뷰 초기화
		$('.targetTab01').empty();
		$('.targetTab02').empty();
		var listData = ds;
		// var thisYearSet = new Date();							//[12-04-2018]안쓰는 코드 주석
		// var thisYearNum = thisYearSet.getFullYear();				//[12-04-2018]안쓰는 코드 주석
		var dataSource = new kendo.data.DataSource({
			data:ds
		});
		//최초 1회만 타겟 메인 뷰에 뷰가 만들어졌는지 체크, 만약 만들어지지 않았을 경우 targetTab 요소들을 삽입
		if($('#target-main-view').hasClass('made') == false){
			$('#target-main-view').append('<div class="targetTab01"></div><div class="targetTab02"></div>').addClass('made');
		}
		//전체 그룹 리스트의 헤더 (목표 에너지 소비량 및 각 월 컬럼)
		$('.targetTab01').append(targetListSet);
		var deviceTypeSet = $('#device-type-list2').val();
		if(!deviceTypeSet){
			deviceTypeSet = 'none';
		}
		var deviceTypeUnit = typeFilterDataSourceUnit[deviceTypeSet][0];
		var dataLength = listData.length;			//[12-04-2018]중복된 변수명 변경 - bool -> dataLength
		//전체 그룹 리스트 뷰 초기화
		//listViewData는 전체 그룹 목표 에너지 및 소비량 에너지 리스트 표시를 위한 템플릿
		if(dataLength > 0){
			$('.targetTab01 #target-content').kendoListView({
				dataSource: dataSource,
				selectable: "multiple",
				template: kendo.template(listViewData)
			});
			//전체 그룹 단위 값 Set
			$('.targetTab01 #target-content').find('.first .unit').html(deviceTypeUnit);
			//작년 에너지 소비량의 연도 <- Text Set
			$('.target-content-row').find('.last-year-view').text(TEXT.ENERGY_ENERGY_CONSUMPTION_OF + ' ' + (nowTimeDate - 1));
		}

		var targetTemplate = $(targetDetailList);
		var energyTemplate = $(targetDetailList);
		var monthArray = [TEXT.ENERGY_DATE_JAN,TEXT.ENERGY_DATE_FEB,TEXT.ENERGY_DATE_MAR,TEXT.ENERGY_DATE_APR,TEXT.ENERGY_DATE_MAY,TEXT.ENERGY_DATE_JUN,TEXT.ENERGY_DATE_JUL,TEXT.ENERGY_DATE_AUG,TEXT.ENERGY_DATE_SEP,TEXT.ENERGY_DATE_OCT,TEXT.ENERGY_DATE_NOV,TEXT.ENERGY_DATE_DEC];
		//단일 그룹 선택 시, 텍스트 Set. 타이틀 Sete
		targetTemplate.find('.target-title').text(TEXT.ENERGY_TARGET_ENERGY_CONSUMPTION);
		//월 Set
		targetTemplate.find('.target-head .target-head-list li').each(function(){
			var index = $(this).index();
			$(this).html(monthArray[index - 1]);
		});
		//단일 그룹 선택 시, 목표에너지 값 표시를 위한 Input 필드와 Text 필드 셋
		targetTemplate.find('.target-content-row .table-row li').each(function(){
			var index = $(this).index();
			var total,value, bool;
			if(listData[0]){
				total = listData[0].targetTotal;

			}else{
				total = 0;

			}
			//단일 그룹 선택 시, 목표 에너지 소비량의 좌측 총 목표 에너지량 및 절감율 등 표시
			var totalHtml = '<div class="left">' + nowTimeDate + '</div><div class="right"><div class="two-line"><span class="num normal-val allValue">' + numberWithCommas(total) + '</span><input type="number" class="k-input input-val allValue" value="' + total + '"><span>' + deviceTypeUnit + '<span></div><div class="two-line"><span class="Reduction">' + ReductionData + '</span>% ' + TEXT.ENERGY_REDUCTION + '</div></div>';

			if($(this).hasClass('first')){
				$(this).html(totalHtml);
			}else{
				//각 목표 에너지량 Set
				if(listData[0] && listData[0]['target' + (index - 1)]){
					value = listData[0]['target' + (index - 1)];
					bool = true;
				}else{
					value = 0;
					bool = false;
				}
				$(this).html('<span class="normal-val"  data-change="' + bool + '">' + numberWithCommas(value) + '</span><input type="number" data-change="' + bool + '" class="k-input input-val" value="' + value + '">');
			}

		});
		//단일 그룹 선택 시, 에너지 소비량 값의 타이틀 표시
		energyTemplate.find('.target-title').text(TEXT.ENERGY_ENERGY_CONSUMPTION);
		//단일 그룹 선택 시, 에너지 소비량 값의 총 합량 표시
		energyTemplate.find('.target-head .target-head-list li').each(function(){
			var index = $(this).index();
			var total,value;
			if(listData[0]){
				total = listData[0].lastYearTotal;
			}else{
				total = 0;
			}
			var totalHtml = '<div class="left"><input class="yearSelect"></div><div class="right"><div class="normal-box"><span class="num">' + numberWithCommas(total) + '</span><span>' + deviceTypeUnit + '</span></div></div>';
			dateDropBox =  MainViewModel.formmatedDate;
			if($(this).hasClass('first')){
				$(this).html(totalHtml);
				//이전 연도를 선택할 수 있는 DropDownList 초기화
				dropBoxSelectData = $(this).find('.yearSelect').kendoDropDownList({
					dataValueField: "value",  dataTextField: "text",
					animation: false,
					dataSource: [
						{text: dateDropBox - 1, value: dateDropBox - 1},
						{text: dateDropBox - 2, value: dateDropBox - 2},
						{text: dateDropBox - 3, value: dateDropBox - 3},
						{text: dateDropBox - 4, value: dateDropBox - 4},
						{text: dateDropBox - 5, value: dateDropBox - 5},
						{text: dateDropBox - 6, value: dateDropBox - 6},
						{text: dateDropBox - 7, value: dateDropBox - 7},
						{text: dateDropBox - 8, value: dateDropBox - 8},
						{text: dateDropBox - 9, value: dateDropBox - 9},
						{text: dateDropBox - 10, value: dateDropBox - 10}
					]
				}).data('kendoDropDownList');
				dropBoxSelectData.search(dropBoxSelect);
				dropBoxSelectData._old = String(dropBoxSelect);
				//드롭다운 리스트 선택 시, 이벤트 바인딩
				$(this).find('input.yearSelect').on('change',function(){
					var thisValue = $(this).val();
					MainViewModel.set("dateDropBox", thisValue);
					$('.graphTopBox ul li').find('.text').text(dropBoxSelect + ' Consumption');
					//현재 선택한 연도의 에너지 소비량을 가져오도록 Refresh
					dropBoxSelect = thisValue;
					refreshData(thisValue);
				});

			}else{
				if(listData[0] && listData[0]['lastYear' + (index - 1)]){
					value = listData[0]['lastYear' + (index - 1)];
				}else{
					value = 0;
				}
				$(this).html(numberWithCommas(value));

			}
			 if(MainViewModel.filters[1].get('disabled') == false){
				 Loading.close();
			 }
			 dateOverChange();
		});
		//단일 그룹 선택 시, 올해 에너지 소비량 표시
		energyTemplate.find('.target-content-row .table-row li').each(function(){
			var index = $(this).index();
			var total,value;
			//단위 및 올해 연도, 올해 소비량 합 표시
			if($(this).hasClass('first')){
				if(listData[0] && listData[0].thisYearTotal){
					total = listData[0].thisYearTotal;
				}else{
					total = 0;
				}
				var totalHtml = '<div class="left">' + nowTimeDate + '</div><div class="right"><div><span class="num">' + numberWithCommas(total) + '</span><span>' + deviceTypeUnit + '<span></div></div>';
				$(this).html(totalHtml);
			}else{
				//올해 월별 소비량이 존재할 경우 올해 월별 소비량 표시
				if(listData[0] && listData[0]['thisYear' + (index - 1)]){
					value = listData[0]['thisYear' + (index - 1)];
					//올해 소비량이 목표 에너지 소비량을 넘었는지 체크하여, 소비량 값에 따라 색상을 바꾸어 표시한다.
					if(listData[0] && typeof listData[0]['target' + (index - 1)] === 'number'){
						if(value > listData[0]['target' + (index - 1)]){
							value = '<span class="targetColor01">' + numberWithCommas(value) + '</span>';
						}else if(value < listData[0]['target' + (index - 1)]){
							value = '<span class="targetColor02">' + numberWithCommas(value) + '</span>';
						}else{
							value = '<span class="targetColor03">' + numberWithCommas(value) + '</span>';
						}
					}
				//올해 월별 소비량이 존재하지 않을 경우 해당 월은 0으로 표시
				}else{
					value = 0;
					if(listData[0] && listData[0]['target' + (index - 1)]){
						if(value > listData[0]['target' + (index - 1)]){
							value = '<span class="targetColor01">' + value + '</span>';
						}else if(value < listData[0]['target' + (index - 1)]){
							value = '<span class="targetColor02">' + value + '</span>';
						}else{
							value = '<span class="targetColor03">' + value + '</span>';
						}
					}
				}
				$(this).html(value);

			}
		});
		//목표 에너지 소비량 및 에너지 소비량 HTML Append
		$('.targetTab02').append(targetTemplate);
		$('.targetTab02').append(energyTemplate);
		$('.targetTab02').append('<div id="targetGraph"></div>');
		//작년 소비량 데이터가 없으면, 절감율 텍스트를 숨김/보임 처리
		if(!lastYearData || Object.keys(lastYearData).length < 1){
			$('.target-content-row').find('.Reduction').closest('.two-line').hide();
		}else{
			$('.target-content-row').find('.Reduction').closest('.two-line').show();
		}
		//목표 에너지 소비량 및 에너지 소비량 Data에 따라 차트 초기화
		graphMade(targetAllData);
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
	/* target 날짜 버튼  */
	var dateOverChange = function(){
		var setDate = [MainViewModel.formmatedDate];
		/* 현재 날짜 이후로 움직이지 않도록 작업 */
		var nowDate = new Date();
		// var dateLength = setDate.length;			//[12-04-2018]안쓰는 코드 주석
		var yearValue, nowCompareDateSet;
		// var monthValue, dayValue, afterCompareDateSe;		//[12-04-2018]안쓰는 코드 주석
		var nowDateList = {
			year:nowDate.getFullYear()
		};
		var compareDateList = {
			year:nowDate.getFullYear()
		};
		if(String(compareDateList.month).length < 2){
			compareDateList.month = '0' + compareDateList.month;
		}
		if(String(compareDateList.day).length < 2){
			compareDateList.day = '0' + compareDateList.day;
		}

		var setChangeDate;
		yearValue = Number(setDate[0]);
		setChangeDate = nowDateList.year;
		nowCompareDateSet = Number(String(compareDateList.year));
		if(Number(yearValue) == nowCompareDateSet && !deviceGroupData){
			MainViewModel.nextBtn.set("disabled", true);
		}else if(Number(yearValue) > nowCompareDateSet && !deviceGroupData){
			MainViewModel.nextBtn.set("disabled", true);
			MainViewModel.set("formmatedDate",setChangeDate);
			MainViewModel.set("setDateView",setChangeDate);
		}else{
			MainViewModel.nextBtn.set("disabled", false);
		}
	};
	/**
	 *
	 *   현재 날짜 넘어갔을 때 조건에 따라 날짜 바꾸어주는 함수
	 *
	 *   @function dateChange
	 *   @param {String} value - 현재 버튼 상태
	 *   @returns {Object} returnData -  현재 날짜
	 *   @alias 없음
	 *
	 */
	var dateChange = function(value){
		 var nowTimeDate = MainViewModel.formmatedDate;
		 var valueSet;
		 valueSet = nowTimeDate + value;
		 MainViewModel.set("formmatedDate", valueSet);
	};
	/**
	 *
	 *   그래프를 view에 만들어주는 함수
	 *
	 *   @function graphDataMade
	 *   @param {Array} data - 그래프 데이터 리스트
	 *   @returns {Array} 없음
	 *   @alias 없음
	 *
	 */
	var graphMade = function(data){
		//작년, 올해 소비량 및 올해 목표량을 그래프로 표시
		var nowTimeDate = MainViewModel.formmatedDate;
		var dataList = {};
		dataList.target = data.target;
		// console.log(dataList)
		if(dataList.target && dataList.target.target){
			dataList.target = dataList.target.target;
		}

		var thisYear = [],lastYear = [],targrtYear = [];
		var maxValue = 0, dataNum;
		var i, j;
		for(i = 0; i < 12; i++){
			thisYear.push(null);
			lastYear.push(null);
			targrtYear.push(null);
		}
		for(j = 0; j < 12; j++){
			/*if(dataList.lastYear[j] && maxValue<dataList.lastYear[j]){
				maxValue = dataList.lastYear[j];
			}*/
			if(dataList.target && dataList.target[j] && maxValue < dataList.target[j].value ){
				maxValue = dataList.target[j].value;
			}

			if(data.lastYear && data.lastYear[0] && data.lastYear[0][j] && maxValue < data.lastYear[0][j].total){
				maxValue = data.lastYear[0][j].total;
			}

			if(data.thisYear && data.thisYear[0] && data.thisYear[0][j] && maxValue < data.thisYear[0][j].total ){
				maxValue = data.thisYear[0][j].total;
			}
		/*	if(dataList.thisYear[j] && maxValue<dataList.thisYear[j]){
				maxValue = dataList.thisYear[j];
			}*/
		}
		if(!maxValue) maxValue = 1;
		else maxValue = maxValue * 1.2;

		if(data.thisYear[0]){
			for(j = 0; j < data.thisYear[0].length; j++){
				dataNum = Number(data.thisYear[0][j]['month']) - 1;
				thisYear[dataNum] = data.thisYear[0][j].total;
			}
		}
		if(data.lastYear[0]){
			for(j = 0; j < data.lastYear[0].length; j++){
				dataNum = Number(data.lastYear[0][j]['month']) - 1;
				lastYear[dataNum] = data.lastYear[0][j].total;
			}
		}
		if(data.target && data.target.target && data.target.target.length){
			for(j = 0; j < data.target.target.length; j++){
				dataNum = Number(data.target.target[j]['month']) - 1;
				targrtYear[dataNum] = data.target.target[j].value;
			}
		}
		if(data.target && data.target.length > 0){
			for(j = 0; j < data.target.length; j++){
				dataNum = Number(data.target[j]['month']) - 1;
				targrtYear[dataNum] = data.target[j].value;
			}
		}
		for(i = 0; i < 12; i++){
			/*if(data.thisYear[0]&&data.thisYear[0][i]){
				thisYear.push(data.thisYear[0][i].total)
			}else{
				thisYear.push(0)
			}


			if(data.lastYear[0]&&data.lastYear[0][i]){
				lastYear.push(data.lastYear[0][i].total)
			}else{
				lastYear.push(0)
			}*/

		}
		dataList.thisYear = thisYear;
		dataList.lastYear = lastYear;
		dataList.target = targrtYear;

		var categories = [];
		categories = moment().localeData().monthsShort();

		$('#targetGraph').empty();
		$('#targetGraph').kendoChart({
			axisDefaults:{
				line:{visible: false	},
				majorGridLines:{color: "#d6d6d6"}
			},
			seriesDefaults: {
				spacing: 0.1,
				gap: 0.2,
				overlay: {gradient: "none"  },
				border: { width: 0 }
			  },
			chartArea: {
				background:'#fbfbfb',
				height: 470,
				width: consumptionView.width()
			  },
			plotArea: { background: "#ebebeb"},
			legend: {visible: false},
			xAxis:{
				border:{color:'#444'}
			},

			series: [
				{
					type: "column",
					data: dataList.lastYear,
					stack:'beforeYear',
					name: 'beforeYear',
					color: "#B5B5B5"
				},
				{
					type: "column",
					data: dataList.thisYear,
					stack:'thisYear',
					name: 'thisYear',
					color: "#0081c6"
				},
				{
					type: "column",
					data: dataList.target,
					stack:'target',
					name: 'target',
					color: "#99cde8"
				}

			],
			valueAxes:{
				name: "kWh",
				min: 0,
				max: Util.getChartOptionsForFiveChartSection(maxValue, 0).newMax,
				majorGridLines: { 	visible: false},
				majorUnit: Util.getChartOptionsForFiveChartSection(maxValue, 0).newMajorUnit
			},
			categoryAxis: {
				/*categories: ['01', '02', '03', '04', '05','06', '07','08','09','10','11','12'],*/
				categories: categories,
				axisCrossingValues: [0, 0, 100, 100]
			}
		});

		//그래프 상단의 단위 및 Legend 표시
		$('#targetGraph').prepend(graphTopBox);
		var deviceTypeSet = $('#device-type-list2').val();
		if(!deviceTypeSet){
			deviceTypeSet = 'none';
		}
		$('.graphTopBox').find('.left .graph-unit').html(typeFilterDataSourceUnit[deviceTypeSet][0]);
		if(!dropboxNameValue){
			dropboxNameValue = Number(nowTimeDate) - 1;
		}
		$('#targetGraph').find('.graphTopBox ul li').eq(0).find('.text').text(dropboxNameValue + ' ' + TEXT.COMMON_MENU_ENERGY_CONSUMPTION);
		$('#targetGraph').find('.graphTopBox ul li').eq(1).find('.text').text(nowTimeDate + ' ' + TEXT.COMMON_MENU_ENERGY_CONSUMPTION);
		$('#targetGraph').find('.graphTopBox ul li').eq(2).find('.text').text(nowTimeDate + ' ' + TEXT.ENERGY_AMOUNT_TARGET);
	};

	var graphTopBox = '' +
		'<div class="graphTopBox">' +
			'<div class="left">' +
				'<span class="graph-unit"></span>' +
			'</div>' +
			'<div class="right">' +
				'<ul>' +
					'<li><span class="square" style="background-color:#B5B5B5"></span><span class="text">' + TEXT.COMMON_MENU_ENERGY_CONSUMPTION + '</span></li>' +
					'<li><span class="square" style="background-color:#0081c6"></span> <span class="text">' + TEXT.COMMON_MENU_ENERGY_CONSUMPTION + '</span></li>' +
					'<li><span class="square" style="background-color:#99cde8"></span> <span class="text">' + TEXT.ENERGY_AMOUNT_TARGET + '</span></li>' +
				'</ul>' +
			'</div>' +
		'</div>';
	//[12-04.2018]안쓰는 코드 주석
	// var initViewDetail = function(dataSource){
	//     /*예제 Grid*/
	//
	// };
	/**
	 *
	 *   Reduction이 변경 되었을 때 뷰에 반영시켜주는 함수
	 *
	 *   @function graphDataMade
	 *   @param {Array} AllData - target 데이터 리스트
	 *   @returns {Array} 없음
	 *   @alias 없음
	 *
	 */
	//[12-04-2018]ESLint룰 적용으로 인한 함수면 변경 - ReductionDataSet -> reductionDataSet
	function reductionDataSet(AllData){
		var lastYearTotalValue = 0,targetTotalValue = 0;
		// var totalValue;
		var i;
		//작년 총 에너지 소비량을 구한다.
		if(AllData.lastYear && AllData.lastYear[0]){
			for(i = 0; i < AllData.lastYear[0].length; i++){
				lastYearTotalValue += AllData.lastYear[0][i].total;
			}
		}
		//현재 입력한 총 Target 소비량을 구한다.
		if(AllData.target){
			for(i = 0; i < AllData.target.length; i++){
				targetTotalValue += AllData.target[i].value;
			}
		}
		//작년 총 에너지 소비량 대비 올해 Target 소비량의 작년대비 절감율을 구한다.
		ReductionData = (1 - (Number(targetTotalValue) / Number(lastYearTotalValue))) * 100;
		if(!isFinite(ReductionData)){
			ReductionData = 0;
		}else{
			ReductionData = ReductionData.toFixed(0);
		}
		consumptionView.find('.Reduction').html(ReductionData);
	}

	function numberWithCommas(num) {
		if(typeof num === 'undefined') return num;
		if(typeof num === 'number') num = num.toString();
		return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	return {
		init : init
	};

});
//# sourceURL=energy/consumption/target/target.js
