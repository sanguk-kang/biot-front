define('asset/assetuser/viewmodel/assetuser-vm', ['asset/assetuser/common/common', 'asset/assetuser/common/widget'], function (Common) {
	var kendo = window.kendo;
	var TEXT = Common.TEXT;

	var MainViewModel = kendo.observable({
		categoryAccountBtn: {
			isSelected: true
		},
		categorySignupBtn: {
			isSelected: false
		},
		searchInput: {
			value: '',
			keyup: function () {}
		},
		searchRemoveBtn: {
			disabled: false,
			isVisible: false,
			click: function () {}
		},
		searchSearchBtn: {
			disabled: false,
			isVisible: true,
			click: function () {}
		},
		selectedMemberLabel: {
			text: TEXT.MEMBERSHIP_MESSAGE_NOTI_NO_MEMBER_SELECTED
		},
		tenant: {
			editBtn: {
				disabled: true,
				isVisible: true,
				click: function () {}
			},
			deleteBtn: {
				disabled: true,
				isVisible: true,
				click: function () {}
			},
			detailBtn: {
				disabled: true,
				isVisible: true,
				click: function () {}
			},
			userDataSource: new kendo.data.DataSource({
				data: []
			}),
			userColumns: []
		},
		signup: {
			pendingNum: 0,
			addBtn: {
				disabled: false,
				isVisible: true,
				click: function () {}
			},
			approveBtn: {
				disabled: true,
				isVisible: true,
				click: function () {}
			},
			rejectBtn: {
				disabled: true,
				isVisible: true,
				click: function () {}
			},
			detailBtn: {
				disabled: true,
				isVisible: true,
				click: function () {}
			},
			userDataSource: new kendo.data.DataSource({
				data: []
			}),
			userColumns: []
		}

	});


	return {
		MainViewModel: MainViewModel
	};
});
//# sourceURL=assetuser/assetuser-vm.js
