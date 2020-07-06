/**
 *
 *   <ul>
 *       <li>설정 > 공통 페이지에서 설정 작업을 할 수 있다.</li>
 *       <li>공통, 화면, 메뉴 구성, 정보, 라이선스 탭으로 구성된다.</li>
 *   </ul>
 *   @module app/systemsettings/webportal
 *   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
 *   @requires app/main
 */
define("systemsettings/backup/backup", ["systemsettings/core"], function() {
	var kendo = window.kendo;
	var Util = window.Util;
	var GlobalSettings = window.GlobalSettings;
	var I18N = window.I18N; //I18N 라이브러리 참조
	var commonSettingsData = {};
	var displaySettingsData = {};
	var msgDialog, msgDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");
	var confirmDialog, confirmDialogElem = $("<div/>");
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();
	// var MainWindow = window.MAIN_WINDOW;		//[2018-04-06][선언후 미사용 주석]

	var reqArr = [];
	var settingsTab = $("#setting-common-tab");
	//var commonSacTab = $("#setting-sac-tab");
	var version;

	Loading.open();
	//Common 탭 데이터 요청
	reqArr.push($.ajax({
		url: "/foundation/settings/common"
	}).done(function(common) {
		commonSettingsData = common;
		version = commonSettingsData.version;
	}).fail(function(xhq) {
		var msg = Util.parseFailResponse(xhq);
		msgDialog.message(msg);
		msgDialog.open();
	}));

	//Display 탭 데이터 요청
	reqArr.push($.ajax({
		url: "/foundation/settings/display"
	}).done(function(display) {
		displaySettingsData = display;
	}).fail(function(xhq) {
		var msg = Util.parseFailResponse(xhq);
		msgDialog.message(msg);
		msgDialog.open();
	}));

	// [2018-04-06][ajax 요청으로 받은 파라메타 common, display 미사용으로 주석처리]
	//Common, Display 탭 응답 데이터 처리
	// $.when.apply(this, reqArr).always(function(common, display) {
	$.when.apply(this, reqArr).always(function() {
		Loading.close();
		settingsTab.kendoCommonTabStrip();

		if (settingsTab.find("[aria-controls=settings-common-data]").length > 0) {
			dataInCommon();
		}
	});

	// settings > common > Data
	function dataInCommon() {
		// var SETTINGS_DATA_BACKUP = I18N.prop("SETTINGS_DATA_BACKUP");		//[2018-04-06][선언후 미사용 주석]
		var SETTINGS_DATA_RESTORE = I18N.prop("SETTINGS_DATA_RESTORE");
		var SETTINGS_DATA_NAME = I18N.prop("SETTINGS_DATA_NAME");
		// var SETTINGS_MESSAGE_INFO_COMPLETE_DATA_RESTORATION = I18N.prop("SETTINGS_MESSAGE_INFO_COMPLETE_DATA_RESTORATION");
		var SETTINGS_MESSAGE_INFO_BACK_UP_DATA = I18N.prop("SETTINGS_MESSAGE_INFO_BACK_UP_DATA"); //데이터 백업 중입니다.
		var SETTINGS_MESSAGE_INFO_COMPLETE_DATA_RESTORATION = I18N.prop("SETTINGS_MESSAGE_INFO_COMPLETE_DATA_RESTORATION"); //데이터 복구가 완료되었습니다. 서버가 리풋될 것입니다.
		var SETTINGS_MESSAGE_INFO_RESTORE_NOT_COMPLETE = I18N.prop("SETTINGS_MESSAGE_INFO_RESTORE_NOT_COMPLETE"); //데이터 복구가 완료되지 않았습니다.
		var SETTINGS_MESSAGE_INFO_BACKING_UP_NOT_COMPLETE = I18N.prop("SETTINGS_MESSAGE_INFO_BACKING_UP_NOT_COMPLETE"); //데이터 백업이 완료되지 않았습니다.
		var SETTINGS_MESSAGE_NOTI_COMPLETE_BACK_UP = I18N.prop("SETTINGS_MESSAGE_NOTI_COMPLETE_BACK_UP"); //데이터 백업이 완료되었습니다.
		var SETTINGS_MESSAGE_NOTI_RESTORING = I18N.prop("SETTINGS_MESSAGE_NOTI_RESTORING"); //데이터 복구 중 최대 10분 소요됩니다.
		var SETTINGS_MESSAGE_NOTI_BACKING_UP = I18N.prop("SETTINGS_MESSAGE_NOTI_BACKING_UP"); //데이터 백업 중 최대 10분 소요됩니다.
		var SETTINGS_MESSAGE_CONFIRM_ALL_SETTINGS_RETURN_SELECTED_DATE = I18N.prop("SETTINGS_MESSAGE_CONFIRM_ALL_SETTINGS_RETURN_SELECTED_DATE"); //모든 설정이 선택된 날짜로 되돌아갑니다.
		// var SETTINGS_MESSAGE_BEING_BACK_UP = I18N.prop("SETTINGS_MESSAGE_BEING_BACK_UP"); //현재 데이터 백업 중 입니다.
		var SETTINGS_MESSAGE_BEING_RESTORE = I18N.prop("SETTINGS_MESSAGE_BEING_RESTORE"); //현재 데이터 복구 중 입니다.
		var SETTINGS_TOTAL_DATA = I18N.prop("SETTINGS_TOTAL_DATA"); //총 데이터

		// 백업 목업 데이터
		// var backupMockData = [{		// [2018-04-06][변수 사용하는 로직이 주석처리 됨에 따라 해당 변수도 주석처]
		// 	"id": 1,
		// 	"name": "[17.04.01 - 17:04:29] Full Backup"
		// },
		// {
		// 	"id": 2,
		// 	"name": "[17.04.10 - 10:21:34] Full Backup"
		// },
		// {
		// 	"id": 3,
		// 	"name": "[17.04.19 - 22:51:05] Full Backup"
		// }
		// ];

		// 변수
		// var LoadingPanel = window.CommonLoadingPanel;			// [2018-04-06][상위에 이미 선언되어 중복선언 불필요 주석]
		// var settingsTab = $("#setting-common-tab");					// [2018-04-06][상위에 이미 선언되어 중복선언 불필요 주석]
		var backupBtn = settingsTab.find(".common-data-backup-btn[data-event=backup]");
		var restoreBtn = settingsTab.find(".common-data-restore-btn[data-event=restore]");
		var backupData = null;
		var backupDataIndex;
		var backupPopup = $("#popup-settings-common-data-backup");
		var backupGrid = backupPopup.find(".settings-common-data-backup-grid");
		var backupCount = backupPopup.find(".settings-common-data-backup-count");
		var radioBackupBtn;
		var selectBtn = backupPopup.find(".popup-footer").find("[data-event=select]");
		var popupMessageRestoreElem = $("#popup-settings-common-data-restore-message");
		var popupMessageRestore;
		var popupMessageBackcupElem = $("#popup-settings-common-data-backup-message");
		var popupMessageBackup;
		var isBackingup = false;
		var webSocket = window.CommonWebSocket,
			receiveCallback = null,
			receiveMsg = false;

		var FRONT_END_URL = I18N.prop("COMMON_FRONT_END_URL");

		// init 함수
		var init = function() {
			initComponent();
		};

		// 컴포넌트 초기화
		var initComponent = function() {
			// 로딩 패널
			Loading = new LoadingPanel();

			// 백업 팝업창 초기화
			backupPopup.kendoPopupSingleWindow({
				title: SETTINGS_DATA_RESTORE
			});

			// 백업 팝업창 내부 그리드 초기화
			backupGrid.kendoGrid({
				dataSource: [],
				columns: setGridColumns(),
				sortable: true
			});

			// 팝업 메시지
			popupMessageRestoreElem.kendoCommonDialog({
				timeout: false
			});
			popupMessageRestore = popupMessageRestoreElem.data("kendoCommonDialog");
			popupMessageBackcupElem.kendoCommonDialog({
				timeout: false
			});
			popupMessageBackup = popupMessageBackcupElem.data("kendoCommonDialog");

			// WebSocket Receive 이벤트 등록
			webSocket.on("receive", function(data) {
				if (receiveMsg) {
					receiveCallback(data);
				}
			});
		};


		/*
		 *  backup, Restore 버튼 이벤트 바인딩
		 *  restore 버튼 클릭 시 ajax를 통해 데이터를 불러온다. - dataBind 함수
		 */
		var attachEvent = function() {
			// backupBtn 클릭 시 서버에 Backup을 요청한다.
			backupBtn.on("click", function() {
				if (!isBackingup) {
					receiveMsg = true;
					requestBackup();
				} else {
					popupMessageBackup.message(SETTINGS_MESSAGE_INFO_BACK_UP_DATA);
					popupMessageBackup.open();
				}
			});

			// restoreBtn 클릭 시 백업된 파일의 목록이 화면에 나타난다.
			restoreBtn.on("click", function() {
				backupPopup.data("kendoPopupSingleWindow").openWindowPopup();
				dataBind(backupPopup);
			});
		};

		// 그리드 내부 이벤트 바인딩
		var attachEventInGrid = function() {
			// 그리드 내부의 라디오 버튼에 이벤트를 달아준다.
			radioBackupBtn = $(".backup-data-radio-btn");
			radioBackupBtn.on("click", function(e) {
				var target = $(e.target);
				var index = backupGrid.find("tbody").find("tr").index(target.closest("tr"));
				backupDataIndex = index; // 선택된 복구 데이터의 인덱스를 변수에 할당
				// Save 버튼 Dimmed 해제
				selectBtn.data("kendoButton").enable(true);
			});
		};

		// 팝업창 내부 버튼 이벤트 바인딩
		var attachEventInPopup = function() {
			selectBtn.on("click", function() {
				var popupWindow = $(this).closest(".popup-window");
				// 선택된 backupDataIndex를 인자로 requestResotre 함수 호출
				confirmDialog.message(SETTINGS_MESSAGE_CONFIRM_ALL_SETTINGS_RETURN_SELECTED_DATE);
				confirmDialog.setConfirmActions({
					yes: function() {				// [2018-04-06][e 파라메타 미사용 제거]
						receiveMsg = true;
						requestRestore(backupDataIndex, popupWindow);
					},
					no: function() {}
				});
				confirmDialog.open();
			});
		};

		// 백업 요청 함수
		function requestBackup() {
			Loading.open();
			$.ajax({
				url: "/foundation/settings/backups",
				method: "POST",
				dataType: "text"
			}).done(function() {    // [2018-04-06][data 파라메타 미사용 제거]
				isBackingup = true;
				Loading.close();

				// 백업 동작 알리는 팝업 메시지 띄우고 로딩패널 띄운다.
				popupMessageBackup.message("" + SETTINGS_MESSAGE_NOTI_BACKING_UP);
				popupMessageBackup.open();
				popupMessageBackcupElem.siblings(".k-dialog-buttongroup").find("button").hide(); // ok버튼 숨김
				Loading.open(popupMessageBackcupElem);

				// 웹 소켓 Receive Callback 함수 정의
				receiveCallback = function(mq) {
					var name = mq.name;
					// var type = mq.type;						// [2018-04-06][선언후 미사용 주석처리]
					// var timestamp = mq.timestamp;				// [2018-04-06][선언후 미사용 주석처리]
					// var deviceId = mq.deviceId;					// [2018-04-06][선언후 미사용 주석처리]

					if (name == "CompleteBackup") {
						//로딩 프로그래스바 종료 및 팝업창 닫는다.
						Loading.close(popupMessageBackcupElem);
						popupMessageBackcupElem.siblings(".k-dialog-buttongroup").find("button").show(); // ok버튼 재생성
						popupMessageBackup.close();

						//완료 메시지 띄운다. - 백업 완료 이후 팝업 메시지 이후 서버 리부팅
						popupMessageBackup.message(SETTINGS_MESSAGE_NOTI_COMPLETE_BACK_UP);
						popupMessageBackup.open();
						isBackingup = false;
						receiveMsg = false;
					}
				};
			}).fail(function(data) {
				isBackingup = false;
				Loading.close();
				// popupMessage.close();
				popupMessageBackcupElem.siblings(".k-dialog-buttongroup").find("button").show(); // ok버튼 재생성
				// 에러 메시지 팝업 띄워준다.
				if (data.status == 503) {
					popupMessageBackup.message(SETTINGS_MESSAGE_INFO_BACK_UP_DATA);
				} else {
					popupMessageBackup.message(SETTINGS_MESSAGE_INFO_BACKING_UP_NOT_COMPLETE);
				}
				popupMessageBackup.open();
			}).always(function() {    // [2018-04-06][data 파라메타 미사용 제거]
				// 항상 ok버튼은 다시 보여준다.
				//popupMessageBackcupElem.siblings(".k-dialog-buttongroup").find("button").show(); // ok버튼 재생성
			});
		}

		// 복구 요청 함수
		function requestRestore(index, popupWindow) {
			var id = backupData[index].id;
			//  var name = backupData[index].name;      // [2018-04-06][선언후 미사용 주석처리]

			var obj = {
				"id": id
			};

			Loading.open(popupWindow);
			$.ajax({
				url: "/foundation/settings/restore",
				method: "PUT",
				data: obj
			}).done(function() {					// [2018-04-06][data 파라메타 미사용 제거]
				Loading.close(popupWindow);

				//복구 동작을 알리는 팝업 메시지 띄우고 로딩패널 띄운다.
				popupMessageRestore.message(SETTINGS_MESSAGE_NOTI_RESTORING);
				popupMessageRestore.open();
				popupMessageRestoreElem.siblings(".k-dialog-buttongroup").find("button").hide(); // ok버튼 숨김
				Loading.open(popupMessageRestoreElem);

				//웹 소켓 Receive Callback 함수 정의
				receiveCallback = function(mq) {
					var mqName = mq.name;						// [2018-04-06][상위 중복선언으로 name-> mqName 변수명 수정]
					// var type = mq.type;					// [2018-04-06][선언후 미사용 주석처리]
					// var timestamp = mq.timestamp;		// [2018-04-06][선언후 미사용 주석처리]
					// var deviceId = mq.deviceId;			// [2018-04-06][선언후 미사용 주석처리]

					if (mqName == "CompleteRestore") {
						//로딩 프로그래스바 종료 및 팝업창 닫는다.
						Loading.close(popupMessageRestoreElem);
						popupMessageRestoreElem.siblings(".k-dialog-buttongroup").find("button").show(); // ok버튼 재생성
						popupMessageRestore.close();

						//완료 메시지 띄운다. - 복구 완료 이후 팝업 메시지 이후 서버 리부팅
						popupMessageRestore.message(SETTINGS_MESSAGE_INFO_COMPLETE_DATA_RESTORATION);
						popupMessageRestore.open();

						receiveMsg = false;

						//로그인 페이지 이동
						setTimeout(function() {			// [2018-04-06][변수에 할당하고 사용되지않으므로 즉시실행되도록 var goToSignIn = 제거 수정]
							var link = window.location.protocol + "//" + window.location.host + FRONT_END_URL + "/signin";
							window.location.href = link;
						}, 5000);
					}
				};
			}).fail(function(data) {
				Loading.close(popupWindow);

				// 복구 진행 중 또는 에러 메시지 팝업 띄워준다.
				if (data.status == 503) {
					popupMessageRestore.message(SETTINGS_MESSAGE_BEING_RESTORE);
				} else {
					popupMessageRestore.message(SETTINGS_MESSAGE_INFO_RESTORE_NOT_COMPLETE);
				}
				popupMessageRestore.open();
			}).always(function() {		// [2018-04-06][data 파라메타 미사용 제거]
				// 항상 ok버튼은 다시 보여준다.
				//popupMessageRestoreElem.siblings(".k-dialog-buttongroup").find("button").show(); // ok버튼 재생성
				//Loading.close(popupWindow);
			});

		}

		// column 설정
		function setGridColumns() {
			var columns = [{
				field: "id",
				headerAttributes: {
					style: "display: none;"
				},
				template: "<input type='radio' class='k-radio backup-data-radio-btn' id='backup-data-radio-#: id #' name='backup-data' class='k-radio'/><label class='k-radio-label' for='backup-data-radio-#: id#'></label>",
				width: "100px"
			},
			{
				title: SETTINGS_DATA_NAME,
				field: "name",
				template: "<div class='settings-common-data-backup-cell'>#: name #</div>",
				headerAttributes: {
					colspan: 2
				}
			}
			];
			return columns;
		}

		// 그리드에 Data를 바인딩 한다.
		function dataBind(popup) {
			backupData = [];
			/*
			 *  1 restoreBtn 클릭 시,
			 *  2 Ajax로 백업 데이터를 받아온다.
			 *  3 받아온 데이터를 그리드에 바인딩
			 */

			Loading.open(popup);

			//Ajax 코드...
			$.ajax({
				url: "/foundation/settings/backups"
			}).done(function(data) {
				Loading.close(popup);
				backupData = data;

				//backupData = backupMockData;

				backupGrid.data("kendoGrid").dataSource.data(backupData);
				backupGrid.data("kendoGrid").dataSource.sort({
					field: "name",
					dir: "desc"
				});
				// 총 데이터 갯수
				backupCount.text(SETTINGS_TOTAL_DATA + ": " + backupData.length);
			}).fail(function(data) {
				Loading.close(popup);
				popupMessageBackup.message(data.responseText);
				popupMessageBackup.open();
			}).always(function() {		// [2018-04-06][data 파라메타 미사용 제거]
				Loading.close(popup);
				// save 버튼 Dimmed
				selectBtn.data("kendoButton").enable(false);
			});

			//            // 데이터 할당 - 임시로 목업 데이터 할당
			//            backupData = backupMockData;
			//            backupCount.text(SETTINGS_TOTAL_DATA+": "+backupData.length);
			//            // 그리드에 바인딩
			//            backupGrid.data("kendoGrid").dataSource.data(backupData);
			//            backupGrid.data("kendoGrid").dataSource.sort({
			//                field: "name",
			//                dir: "desc"
			//            });
		}

		function renewDataView(grid, selectedField) {
			var ds = grid.data("kendoGrid").dataSource;
			// var data = ds.data();			//[2018-04-06][선언하고 할당후 미사용하여 주석처리]
			var srt = ds.sort();
			// var query;						//[2018-04-06][변수를 사용하는 구문이 초기화를 선언하고있어 상위의선언하여 block-scoped-var 경고를 해결][선언하고 할당후 미사용하여 주석처리]
				  // var sortedData; 					//[2018-04-06][선언하고 할당후 미사용하여 주석처리]

			if (typeof srt === 'undefined' || (typeof srt === 'undefined' && typeof selectedField !== 'undefined')) { // 그리드의 소팅이 아닌 다른 인풋값에 의한 소팅 시.		//[2018-04-06][undefined변수 사용 금지 경로로 인해서 기존 srt === undefined -> typeof srt === 'undefined' 수정]
				srt = [{
					compare: void 0,
					dir: "asc",
					field: selectedField
				}];
				// query = new kendo.data.Query(data);			//[2018-04-06][선언하고 할당후 미사용하여 주석처리]
				// sortedData = query.sort(srt).data;			//[2018-04-06][선언하고 할당후 미사용하여 주석처리]
				// alarmData = sortedData;
				backupData = ds.view();
			} else {
				// query = new kendo.data.Query(data);			//[2018-04-06][선언하고 할당후 미사용하여 주석처리]
				// sortedData = query.sort(srt).data;			//[2018-04-06][선언하고 할당후 미사용하여 주석처리]
				// alarmData = sortedData;
				backupData = ds.view();
			}

			// 초기화
			backupDataIndex = "";
			grid.find("input[type=radio]").prop("checked", false);
			// save 버튼 Dimmed
			selectBtn.data("kendoButton").enable(false);
		}

		init();
		attachEvent();
		attachEventInPopup();

		// sort 발생 시 콜백
		backupGrid.data("kendoGrid").dataSource.bind("change", function() {    //[2018-04-06][파라메타 e 미사용 제거]
			renewDataView(backupGrid, "name");
			attachEventInGrid();
		});
	}
});
//For Debug
//# sourceURL=systemsettings-backup.js
