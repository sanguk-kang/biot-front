define('accountsettings/authmgmt/building-authmgmt', ['accountsettings/authmgmt/config/authmgmt-vm'], function(ViewModel) {
	'use strict';

	var kendo = window.kendo, I18N = window.I18N, Util = window.Util;
	var MainWindow = window.MAIN_WINDOW;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	var AuthViewModel, btnSave;
	var tabElem, tab;
	var spreadsheet, spreadsheetElem, spreadsheetWrapper;
	var msgDialog;

	var init = function() {
		initView();
		initComponent();
		initSpreadsheet();
		attachEvent();
	};

	var initView = function() {
		tabElem = $('#authmgmt-tab-strip');
		tab = tabElem.find('.authmgmt-tab-list li').eq(1);
		spreadsheetWrapper = $('.authmgmt-sheet-wrapper').empty();
		spreadsheetElem = $('<div class="authmgmt-sheet-body"/>').appendTo(spreadsheetWrapper);
		msgDialog = $('#authmgmt-message-popup');
		AuthViewModel = ViewModel.AuthViewModel;
		btnSave = AuthViewModel.get('btnSave');
		kendo.bind(tabElem, AuthViewModel);
	};

	var initComponent = function() {
		MainWindow.disableFloorNav(true);

		msgDialog = msgDialog.kendoCommonDialog().data('kendoCommonDialog');

	};

	var initSpreadsheet = function() {
		Loading.open();
		getUsers().done(function(data){
			var buildingList = MainWindow.getCurrentBuildingList();
			if (data && data.length === 0) {
				msgDialog.message(I18N.prop('AUTHMGMT_NO_USER_PERMISSIONS'));
				msgDialog.open();
			} else if (buildingList.length === 0) {
				msgDialog.message(I18N.prop('AUTHMGMT_NO_BUILDING_PERMISSIONS'));
				msgDialog.open();
			} else {
				asendingSortForArray(data, 'name');
				spreadsheet = spreadsheetElem.kendoSpreadsheet({
					sheetsbar: false,
					toolbar: false,
					actionbar: false,
					columnWidth: 200,
					rowHeight: 46,
					headerWidth: 200,
					headerHeight: 46,
					isFixedCell: true,
					defaultHeaderStyle: {
						fontSize: '14px'
					},
					sheets: [{
						columnHeaderList: buildingList,
						rowHeaderList: data,
						booleanSheet: {
							dataSource: data,
							propertyKey: 'policy.foundation_space_buildings_ids'
						}
					}]
				}).data('kendoSpreadsheet');
				attachSheetEvent();
			}
		}).always(function(){
			btnSave.set('disabled', true);
			Loading.close();
		});
	};

	var getUsers = function() {
		return $.ajax({
			url: '/ums/users?roles=Manager&registrationStatus=Approved&exposePolicy=true'
		});
	};

	var attachEvent = function() {
		tab.on('click', function(e) {
			var target = $(e.currentTarget);
			if(target.hasClass('k-state-active')) return;
			spreadsheetWrapper.empty();
			spreadsheetElem = $('<div class="authmgmt-sheet-body"/>').appendTo(spreadsheetWrapper);
			initSpreadsheet();
		});

		btnSave.set('click', function(e) {
			var patchData = spreadsheet.getBooleanData(0);

			Loading.open();
			$.ajax({
				url: '/ums/users',
				method: 'patch',
				data: patchData
			}).done(function () {
				btnSave.set('disabled', true);
				msgDialog.message(I18N.prop('COMMON_MESSAGE_NOTI_CHANGES_SAVED'));
			}).fail(function (data) {
				msgDialog.message(Util.parseFailResponse(data));
			}).always(function () {
				msgDialog.open();
				Loading.close();
			});
		});
	};

	var attachSheetEvent = function() {
		spreadsheet.bind('select', function(e) {
			btnSave.set('disabled', false);
		});
	};

	var asendingSortForArray = function (arr, key) {
		var i, j, length = arr.length, tmp;
		for (i = 0; i < length; i++) {
			for (j = length - 1; j > i; j--) {
				if (arr[j - 1][key] > arr[j][key]) {
					tmp = arr.splice(j, 1);
					arr.splice(j - 1, 0, tmp[0]);
				}
			}
		}
	};

	return {
		init: init
	};
});

//# sourceURL=accountmgmt/building-authmgmt.js