define('accountsettings/accountmgmt/common/widget', ['accountsettings/accountmgmt/common/common'], function (Common) {
	var moment = window.moment;
	var TEXT = Common.TEXT;
	var Util = window.Util;

	var popupOptions;
	var managerPopup, elemPopup = $('#manager-popup');
	var approvePopup, elemApprovePopup = $('#manager-signup-approve-popup');
	var managerDialogMessage, elemDialogMessage = $('#manager-dialog-message');
	var managerDialogConfirm, elemDialogConfirm = $('#manager-dialog-confirm');

	var groupInfo = [{text: 'Admin', value: 'Admin'}, {text: 'Manager', value: 'Manager'}];

	var defaultOptions = {
		title: TEXT.COMMON_DETAIL,
		dataSource: [],
		hasDelete: false,
		height: 735,
		width: 652,
		contentTemplate: "<div class='detail-dialog-content device-dialog-content'><div class='detail-dialog-header device-dialog-header'></div><div class='detail-dialog-detail-content'></div></div>",
		headerTemplate: '<span>' + TEXT.MEMBERSHIP_SELECTED_MEMBERS + ' : #:count#</span>',
		listTemplate: '<span>#:data.name# (#:data.id#)</span>',
		isCustomActions: true
	};

	popupOptions = {
		account: $.extend(true, {}, defaultOptions, {
			buttonsIndex: {
				CLOSE: 0,
				DELETE: 1,
				EDIT: 2,
				SAVE: 3,
				CANCEL: 4
			},
			actions: [
				{
					text: TEXT.COMMON_BTN_CLOSE,
					visible: true,
					action: function (e) {
						e.sender.trigger('onClose');
						if (e.sender.isEditable) {
							e.sender.setEditable(false);
						}
					}
				},
				{
					text: TEXT.COMMON_BTN_DELETE,
					visible: true,
					action: function (e) {
						var self = e.sender;
						var ds = self.dataSource.data();
						var dsLength = ds.length;

						var LoadingPanel = window.CommonLoadingPanel;
						var Loading = new LoadingPanel(self.element[0]);

						if (dsLength === 1) {
							managerDialogConfirm.message(TEXT.MEMBERSHIP_MESSAGE_CONFIRM_DELETE_SELECTED_MEMBER);
						} else {
							managerDialogConfirm.message(TEXT.MEMBERSHIP_MESSAGE_CONFIRM_DELETE_SELECTED_MULTI_MEMBER(dsLength));
						}

						managerDialogConfirm.options.confirmActions.yes = function () {
							Loading.open();
							var deferreds = [];
							for (var i = 0; i < dsLength; i++) {
								deferreds.push($.ajax({
									method: 'delete',
									url: '/ums/users/' + ds[i].id
								}));
							}
							$.when.apply(this, deferreds).done(function () {
								self.isDeleted = true;
								self.trigger('onClose');
								self.close();
							}).always(function () {
								Loading.close();
							});
						}.bind(this);

						managerDialogConfirm.open();
						return false;
					}
				},
				{
					text: TEXT.COMMON_BTN_EDIT,
					visible: true,
					action: function (e) {
						e.sender.trigger('onEdit');
						e.sender.setEditable(true);
						e.sender.trigger('onEdited');
						return false;
					}
				},
				{
					text: TEXT.COMMON_BTN_SAVE,
					visible: false,
					disabled: true,
					action: function (e) {
						var fields = e.sender.options.scheme.fields;
						var editFields = e.sender.editFields;
						var key;
						for (key in fields) {
							if (fields[key].editable && fields[key].validator && editFields[key].data('kendoCommonValidator') && !editFields[key].data('kendoCommonValidator').validate()) {
								return false;
							}
						}
						var results = e.sender.saveAll();
						if (results) {
							e.sender.trigger('onSaved', {sender: e.sender, results: results, groupInfo: groupInfo});
						}
						return false;
					}
				},
				{
					text: TEXT.COMMON_BTN_CANCEL,
					visible: false,
					action: function (e) {
						e.sender._cancelEvent({sender: e.sender}, false);
						return false;
					}
				}
			],
			scheme: {
				id: 'id',
				fields: {
					role: {
						type: 'select',
						name: TEXT.COMMON_MANAGER_TYPE,
						editable: true,
						editCss: {
							width: '50%'
						},
						isEditAll: true,
						editFieldName: 'role',
						editTemplate: function (dataItem, editViewModel) {
							var ds = editViewModel.dataSource;
							editViewModel.fields.role = dataItem.role;

							ds.length = 0;
							for (var i = 0; i < groupInfo.length; i++) {
								ds.push(groupInfo[i]);
							}
							return "<input data-role='dropdownlist' data-animation='false' data-text-field='text' data-value-field='value' data-bind='value: fields.role, source: dataSource, events: {select: select}'/>";
						},
						editViewModel: {
							fields: {
								role: 'Admin'
							},
							dataSource: [],
							select: function (e) {
								var dataItem = e.dataItem;
								var buildingList = managerPopup.element.find('input.account-building-list').data('kendoDropDownCheckBox');
								this.role = dataItem.value;
								managerPopup.hasChanged = true;
								managerPopup.enableSaveBtn();
								if (buildingList) {
									if (dataItem.value === 'Admin') {
										buildingList.enable(false);
									} else {
										buildingList.enable(true);
									}
								}
							}
						}
					},
					name: {
						type: 'text',
						name: TEXT.COMMON_NAME,
						editCss: {
							width: '100%'
						},
						editable: true,
						hasInputRemoveBtn: true,
						validator: {type: 'name', required: true}
					},
					id: {
						type: 'text',
						name: TEXT.COMMON_ID,
						editable: true,
						editTemplate: "<span style='line-height: 40px;'>#:id#</span><button class='k-button' style='float: right; width: 170px;' data-bind='events: {click: onClick}'>" + TEXT.MANAGER_MANAGER_RESET_PASSWORD + '</button>',
						editViewModel: {
							onClick: function (e) {
								var dialog = $('#manager-dialog-confirm').data('kendoCommonDialog');
								var LoadingPanel = window.CommonLoadingPanel;
								var Loading = new LoadingPanel($('#manager-popup'));
								var id = $(e.target.parentElement).find('span').text();
								dialog.message(TEXT.MEMBERSHIP_MESSAGE_CONFIRM_RESET_PASSSWORD);
								dialog.options.confirmActions.yes = function () {
									Loading.open();
									$.ajax({
										method: 'post',
										url: '/ums/users/' + id + '/resetPassword'
									}).fail(function (data) {
										var msg = Util.parseFailResponse(data);
										if (msg.indexOf('is currently locked out for != -1')) {
											msg = window.I18N.prop('COMMON_SIGNIN_LOCKED', id);
										}
										managerDialogMessage.message(msg);
										managerDialogMessage.open();
									}).always(function () {
										Loading.close();
									});
								};
								dialog.open();
							}
						}
					},
					mobilePhoneNumber: {
						type: 'text',
						name: TEXT.COMMON_PHONE_NUM,
						editCss: {
							width: '100%'
						},
						editable: true,
						hasInputRemoveBtn: true,
						validator: true
					},
					email: {
						type: 'email',
						name: TEXT.COMMON_EMAIL,
						editCss: {
							width: '100%'
						},
						editable: true,
						hasInputRemoveBtn: true,
						validator: true
					},
					joinDate: {
						type: 'text',
						name: TEXT.COMMON_SIGNUP_DATE,
						template: function (data) {
							var val = '-';
							if (data.joinDate) {
								val = moment(data.joinDate).format('LLL').replace(/\./g, '/');
							}

							return val;
						}
					},
					lastLogin: {
						type: 'text',
						name: TEXT.COMMON_LASTEST_SIGN_IN,
						template: function (data) {
							var val = '-';
							if (data.lastLogin) {
								val = moment(data.lastLogin).format('LLL').replace(/\./g, '/');
							}

							return val;
						}
					},
					policy: {
						type: 'text',
						name: TEXT.ACCOUNT_SETTING_MANAGE_BUILDING,
						editable: true,
						editCss: {
							width: '50%'
						},
						template: function (data) {
							var buildingList = Common.getCurrentBuildingList();
							var result = $('<ul/>'), bids = data.policy && data.policy.foundation_space_buildings_ids || [], i, j;
							if (bids.length === 0) {
								return '-';
							}
							for (i = 0; i < buildingList.length; i++) {
								for (j = 0; j < bids.length; j++) {
									if (buildingList[i].id == bids[j]) {
										result.append($('<li/>').text(buildingList[i].name));
									}
								}
							}
							return result;
						},
						editFieldName: 'policy',
						editTemplate: function (dataItem, editViewModel) {
							editViewModel.id = dataItem.id;
							return "<input class='account-building-list' data-id='" + dataItem.id + "'/>";
						},
						editViewModel: {
							fields: {
								policy: null
							},
							id: '',
							init: function () {}
						}
					}
				}
			}
		}),
		signup: $.extend(true, {}, defaultOptions, {
			height: 535,
			listTemplate: function (data) {
				return '<span>' + data.name + ' (' + data.id + ')</span><input class="approve-manager-type-filter" data-id="' + data.id + '"/>';
			},
			buttonsIndex: {
				CLOSE: 0,
				DELETE: 1,
				EDIT: 2,
				SAVE: 3,
				CANCEL: 4
			},
			actions: [
				{
					text: TEXT.COMMON_BTN_CLOSE,
					visible: true,
					action: function (e) {
						e.sender.trigger('onClose');
						if (e.sender.isEditable) {
							e.sender.setEditable(false);
						}
					}
				},
				{
					text: TEXT.MEMBERSHIP_REJECT,
					visible: true,
					action: function (e) {
						var self = e.sender;
						var ds = self.dataSource.data();
						var dsLength = ds.length;

						var LoadingPanel = window.CommonLoadingPanel;
						var Loading = new LoadingPanel(self.element[0]);

						if (dsLength === 1) {
							managerDialogConfirm.message(TEXT.MEMBERSHIP_MESSAGE_CONFIRM_REJECT_SELECTED_MEMBER_APPLICATION);
						} else {
							managerDialogConfirm.message(TEXT.MEMBERSHIP_MESSAGE_CONFIRM_REJECT_SELECTED_MULTI_MEMBER_APPLICATION(dsLength));
						}

						managerDialogConfirm.options.confirmActions.yes = function () {
							Loading.open();
							// var deferreds = [];
							var patchData = [];
							for (var i = 0; i < dsLength; i++) {
								// deferreds.push($.ajax({
								// 	url: '/ums/users/' + ds[i].id,
								// 	method: 'patch',
								// 	data: {registrationStatus: 'Rejected'}
								// }));
								patchData.push({
									id: ds[i].id,
									registrationStatus: 'Rejected'
								});
							}
							// $.when.apply(this, deferreds).done(function () {
							// 	self.isDeleted = true;
							// 	self.trigger('onClose');
							// 	self.close();
							$.ajax({
								url: '/ums/users',
								method: 'PATCH',
								data: patchData
							}).done(function () {
								self.isDeleted = true;
								self.trigger('onClose');
								self.close();
							}).fail(function (xhq){
								managerDialogMessage.message(Util.parseFailResponse(xhq));
								managerDialogMessage.open();
							}).always(function () {
								Loading.close();
							});
						// }.bind(this);
						};

						managerDialogConfirm.open();
						return false;
					}
				},
				{
					text: TEXT.MEMBERSHIP_APPROVE,
					visible: true,
					action: function (e) {
						e.sender.trigger('onEdit');
						e.sender.setEditable(true);
						e.sender.enableSaveBtn();
						e.sender.trigger('onEdited');
						return false;
					}
				},
				{
					text: TEXT.COMMON_BTN_SAVE,
					visible: false,
					disabled: true,
					action: function (e) {
						var results = e.sender.saveAll();
						if (results) {
							e.sender.trigger('onSaved', {sender: e.sender, results: results, groupInfo: groupInfo});
							e.sender.setEditable(false);
						}
						return false;
					}
				},
				{
					text: TEXT.COMMON_BTN_CANCEL,
					visible: false,
					action: function (e) {
						e.sender._cancelEvent({sender: e.sender}, false);
						return false;
					}
				}
			],
			scheme: {
				id: 'id',
				fields: {
					joinDate: {
						type: 'text',
						name: TEXT.COMMON_SIGNUP_DATE,
						template: function (data) {
							var val = '-';
							if (data.joinDate) {
								val = moment(data.joinDate).format('LLL').replace(/\./g, '/');
							}

							return val;
						}
					},
					name: {
						type: 'text',
						name: TEXT.COMMON_NAME
					},
					id: {
						type: 'text',
						name: TEXT.COMMON_ID
					},
					mobilePhoneNumber: {
						type: 'text',
						name: TEXT.COMMON_PHONE_NUM
					},
					email: {
						type: 'email',
						name: TEXT.COMMON_EMAIL
					},
					policy: {
						type: 'text',
						name: TEXT.ACCOUNT_SETTING_MANAGE_BUILDING,
						editable: true,
						editCss: {
							width: '50%'
						},
						template: function (data) {
							var buildingList = Common.getCurrentBuildingList();
							var result = $('<ul/>'), bids = data.policy && data.policy.foundation_space_buildings_ids || [], i, j;
							if (bids.length === 0) {
								return '-';
							}
							for (i = 0; i < buildingList.length; i++) {
								for (j = 0; j < bids.length; j++) {
									if (buildingList[i].id == bids[j]) {
										result.append($('<li/>').text(buildingList[i].name));
									}
								}
							}
							return result;
						},
						editFieldName: 'policy',
						editTemplate: function (dataItem, editViewModel) {
							editViewModel.id = dataItem.id;
							return "<input class='account-building-list' data-id='" + dataItem.id + "'/>";
						},
						editViewModel: {
							fields: {
								policy: null
							},
							id: '',
							init: function () {}
						}
					}
				}
			}
		}),
		addManually: $.extend(true, {}, defaultOptions, {
			title: TEXT.MEMBERSHIP_ADD_MANUALLY,
			height: 630,
			contentTemplate: "<div class='detail-dialog-content device-dialog-content'><div class='signup-required'><span class='signup-required-mark'>*</span><span class='signup-required-text'>" + TEXT.COMMON_REQUIRED_ITEM + "</span></div> <div class='detail-dialog-detail-content'></div></div>",
			listTemplate: function () {
				return '';
			},
			buttonsIndex: {
				CLOSE: 0,
				DELETE: 1,
				EDIT: 2,
				SAVE: 3,
				CANCEL: 4
			},
			actions: [
				{
					text: TEXT.COMMON_BTN_CLOSE,
					visible: true,
					action: function (e) {}
				},
				{
					text: TEXT.MEMBERSHIP_REJECT,
					visible: true,
					action: function (e) {}
				},
				{
					text: TEXT.MEMBERSHIP_APPROVE,
					visible: true,
					action: function (e) {}
				},
				{
					text: TEXT.COMMON_BTN_SAVE,
					visible: false,
					disabled: true,
					action: function (e) {
						var results = e.sender.saveAll();
						if (results) {
							e.sender.trigger('onSaved', {sender: e.sender, results: results});
						}
						return false;
					}
				},
				{
					text: TEXT.COMMON_BTN_CANCEL,
					visible: false,
					action: function (e) {
						managerDialogConfirm.message(TEXT.COMMON_CONFIRM_DIALOG_EDIT_CANEL);
						managerDialogConfirm.options.confirmActions.yes = function () {
							approvePopup.dataSource.cancelChanges();
							approvePopup.close();
						};

						managerDialogConfirm.open();
						return false;
					}
				}
			],
			scheme: {
				id: 'id',
				fields: {
					role: {
						type: 'select',
						name: TEXT.COMMON_MANAGER_TYPE,
						editable: true,
						editCss: {
							width: '50%'
						},
						isEditAll: true,
						editFieldName: 'role',
						editTemplate: function (dataItem, editViewModel) {
							var ds = editViewModel.dataSource;

							ds.length = 0;
							for (var i = 0; i < groupInfo.length; i++) {
								ds.push(groupInfo[i]);
							}
							return "<input data-role='dropdownlist' data-animation='false' data-text-field='text' data-value-field='value' data-bind='value: fields.role, source: dataSource, events: {select: select}'/>";
						},
						editViewModel: {
							fields: {
								role: 'Manager'
							},
							dataSource: [],
							select: function (e) {
								var dataItem = e.dataItem;
								this.role = dataItem.value;
								var buildingList = approvePopup.element.find('input.account-building-list').data('kendoDropDownCheckBox');
								if (buildingList) {
									if (dataItem.value === 'Admin') {
										buildingList.enable(false);
									} else {
										buildingList.enable(true);
									}
								}
							}
						}
					},
					id: {
						type: 'text',
						name: TEXT.COMMON_ID,
						editable: true,
						editFieldName: 'id',
						editTemplate: function () {
							return '<input class="k-input approve-id" placeholder="' + TEXT.COMMON_ID + '" data-key="id" required/><span class="signup-required-mark">*</span>';
						},
						editViewModel: {
							fields: {
								id: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-id').kendoCommonValidator({
									type: 'id'
								});
								elemApprovePopup.find('.k-input.approve-id').on('keyup', function (e) {
									approvePopup.options.scheme.fields.id.editViewModel.fields.set('id', $(e.target).val());
								});
							}
						}
					},
					password: {
						type: 'text',
						name: TEXT.MEMBERSHIP_NEW_PASSWORD,
						editable: true,
						editFieldName: 'password',
						editTemplate: function () {
							return '<input type="password" id="approve-password" class="k-input approve-password" placeholder="' + TEXT.COMMON_PASSWORD + '" data-key="password" required/><span class="signup-required-mark">*</span>';
						},
						editViewModel: {
							fields: {
								password: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-password').kendoCommonValidator({
									type: 'password',
									mixedPasswordCheck: true
								});
								elemApprovePopup.find('.k-input.approve-password').on('keyup', function (e) {
									approvePopup.options.scheme.fields.password.editViewModel.fields.set('password', $(e.target).val());
								});
							}
						}
					},
					passwordRetype: {
						type: 'text',
						name: TEXT.MEMBERSHIP_CHECK_NEW_PASSWORD,
						editable: true,
						editTemplate: function () {
							return '<input type="password" class="k-input approve-password-retype" placeholder="' + TEXT.MEMBERSHIP_CHECK_NEW_PASSWORD + '" data-key="passwordRetype" data-retype-for="approve-password" required/><span class="signup-required-mark">*</span>';
						},
						editViewModel: {
							fields: {
								passwordRetype: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-password-retype').kendoCommonValidator({
									type: 'passwordRetype',
									mixedPasswordCheck: true
								});
							}
						}
					},
					name: {
						type: 'text',
						name: TEXT.COMMON_NAME,
						editable: true,
						editFieldName: 'name',
						editTemplate: function () {
							return '<input class="k-input approve-name" placeholder="' + TEXT.COMMON_NAME + '" data-key="name" required/><span class="signup-required-mark">*</span>';
						},
						editViewModel: {
							fields: {
								name: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-name').kendoCommonValidator({
									type: 'name'
								});
								elemApprovePopup.find('.k-input.approve-name').on('keyup', function (e) {
									approvePopup.options.scheme.fields.name.editViewModel.fields.set('name', $(e.target).val().trim());
								});
							}
						}
					},
					mobilePhoneNumber: {
						type: 'text',
						name: TEXT.COMMON_PHONE_NUM,
						editable: true,
						editFieldName: 'mobilePhoneNumber',
						editTemplate: function () {
							return '<input class="k-input approve-phone-number" placeholder="' + TEXT.COMMON_PHONE_NUM + '" data-key="mobilePhoneNumber"/>';
						},
						editViewModel: {
							fields: {
								mobilePhoneNumber: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-phone-number').kendoCommonValidator({
									type: 'mobilePhoneNumber'
								});
								elemApprovePopup.find('.k-input.approve-phone-number').on('keyup', function (e) {
									approvePopup.options.scheme.fields.mobilePhoneNumber.editViewModel.fields.set('mobilePhoneNumber', $(e.target).val());
								});
							}
						}
					},
					email: {
						type: 'email',
						name: TEXT.COMMON_EMAIL,
						editable: true,
						editFieldName: 'email',
						editTemplate: function () {
							return '<input class="k-input approve-email" placeholder="' + TEXT.COMMON_EMAIL + '" data-key="email"/>';
						},
						editViewModel: {
							fields: {
								email: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-email').kendoCommonValidator({
									type: 'email'
								});
								elemApprovePopup.find('.k-input.approve-email').on('keyup', function (e) {
									approvePopup.options.scheme.fields.email.editViewModel.fields.set('email', $(e.target).val());
								});
							}
						}
					},
					policy: {
						type: 'text',
						name: TEXT.ACCOUNT_SETTING_MANAGE_BUILDING,
						editable: true,
						editCss: {
							width: '50%'
						},
						template: function () {
							return '-';
						},
						editFieldName: 'policy',
						editTemplate: function (dataItem, editViewModel) {
							editViewModel.id = dataItem.id;
							return "<input class='account-building-list' data-id='none'/>";
						},
						editViewModel: {
							fields: {
								policy: null
							},
							id: '',
							init: function () {}
						}
					}
				}
			}
		})
	};

	managerDialogMessage = elemDialogMessage.kendoCommonDialog({
		type: 'message',
		height: 252
	}).data('kendoCommonDialog');

	managerDialogConfirm = elemDialogConfirm.kendoCommonDialog({
		type: 'confirm',
		height: 252,
		confirmActions: {
			yes: function () {},
			no: function () {}
		}
	}).data('kendoCommonDialog');

	var getDetailPopup = function (type) {
		if (type != 'addManually') {
			managerPopup = elemPopup.kendoDetailDialog(popupOptions[type]).data('kendoDetailDialog');
			return managerPopup;
		}
		approvePopup = elemApprovePopup.kendoDetailDialog(popupOptions[type]).data('kendoDetailDialog');
		return approvePopup;
	};

	return {
		groupInfo: groupInfo,
		managerDialogMessage: managerDialogMessage,
		managerDialogConfirm: managerDialogConfirm,
		getDetailPopup: getDetailPopup
	};
});
//# sourceURL=accountmgmt/widget.js
