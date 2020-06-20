define('asset/assetuser/common/widget', ['asset/assetuser/common/common'], function (Common) {
	var moment = window.moment;
	var TEXT = Common.TEXT;
	var Util = window.Util;

	var popupOptions;
	var managerPopup, elemPopup = $('#assetuser-popup');
	var approvePopup, elemApprovePopup = $('#assetuser-signup-approve-popup');
	var managerDialogMessage, elemDialogMessage = $('#assetuser-dialog-message');
	var managerDialogConfirm, elemDialogConfirm = $('#assetuser-dialog-confirm');

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
							e.sender.trigger('onSaved', {sender: e.sender, results: results});
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
						type: 'text',
						name: TEXT.COMMON_MANAGER_TYPE
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
								var dialog = $('#assetuser-dialog-confirm').data('kendoCommonDialog');
								var LoadingPanel = window.CommonLoadingPanel;
								var Loading = new LoadingPanel($('#assetuser-popup'));
								var id = $(e.target.parentElement).find('span').text();
								dialog.message(TEXT.MEMBERSHIP_MESSAGE_CONFIRM_RESET_PASSSWORD);
								dialog.options.confirmActions.yes = function () {
									Loading.open();
									$.ajax({
										method: 'patch',
										url: '/ums/users/' + id,
										data: JSON.stringify({password: '@abc12345!'})
									}).fail(function (data) {
										managerDialogMessage.message(Util.parseFailResponse(data));
										managerDialogMessage.open();
									}).always(function () {
										Loading.close();
									});
								};
								dialog.open();
							}
						}
					},
					nickname: {
						type: 'text',
						name: TEXT.MEMBERSHIP_NICKNAME,
						template: function (data) {
							if (!data.nickname) {
								return '-';
							}
							return data.nickname;
						},
						editCss: {
							width: '100%'
						},
						editable: true,
						validator: {type: 'name'}
					},
					organization: {
						type: 'text',
						name: TEXT.MEMBERSHIP_ORGANIZATION,
						template: function (data) {
							if (!data.organization) {
								return '-';
							}
							return data.organization;
						},
						editCss: {
							width: '100%'
						},
						editable: true,
						isEditAll: true,
						validator: {type: 'name'}
					},
					employeeId: {
						type: 'text',
						name: TEXT.MEMBERSHIP_EMPLOYEE_ID_NUM,
						template: function (data) {
							if (!data.employeeId) {
								return '-';
							}
							return data.employeeId;
						},
						editCss: {
							width: '100%'
						},
						editable: true,
						validator: {
							messages: {
								incorrectValue: TEXT.COMMON_INVALID_VALUE
							},
							rules: {
								incorrectValue: function (input) {
									var val = input.val();
									if (!val) {
										return true;
									}
									return val.match(/^(?=.{2,20}$)[a-zA-Z0-9_.]+$/);
								}
							}
						}
					},
					position: {
						type: 'text',
						name: TEXT.MEMBERSHIP_POSITION,
						template: function (data) {
							if (!data.position) {
								return '-';
							}
							return data.position;
						},
						editCss: {
							width: '100%'
						},
						editable: true,
						isEditAll: true,
						validator: {type: 'name'}
					},
					responsibility: {
						type: 'text',
						name: TEXT.MEMBERSHIP_RESPONSIBILITIES,
						template: function (data) {
							if (!data.responsibility) {
								return '-';
							}
							return data.responsibility;
						},
						editCss: {
							width: '100%'
						},
						editable: true,
						isEditAll: true,
						validator: {type: 'name'}
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
					}
				}
			}
		}),
		signup: $.extend(true, {}, defaultOptions, {
			height: 535,
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
							var deferreds = [];
							for (var i = 0; i < dsLength; i++) {
								deferreds.push($.ajax({
									url: '/ums/users/' + ds[i].id,
									method: 'patch',
									data: {registrationStatus: 'Rejected'}
								}));
							}
							$.when.apply(this, deferreds).done(function () {
								self.isDeleted = true;
								self.trigger('onClose');
								self.close();
							}).fail(function (xhq){
								managerDialogMessage.message(Util.parseFailResponse(xhq));
								managerDialogMessage.open();
							}).always(function () {
								Loading.close();
							});
						}.bind(this);

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
							e.sender.trigger('onSaved', {sender: e.sender, results: results});
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
					}
				}
			}
		}),
		addManually: $.extend(true, {}, defaultOptions, {
			title: TEXT.MEMBERSHIP_ADD_MANUALLY,
			height: 630,
			contentTemplate: "<div class='detail-dialog-content device-dialog-content'><div class='detail-dialog-header device-dialog-header'></div><div class='signup-required'><span class='signup-required-mark'>*</span><span class='signup-required-text'>" + TEXT.COMMON_REQUIRED_ITEM + "</span></div> <div class='detail-dialog-detail-content'></div></div>",
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
									approvePopup.options.scheme.fields.name.editViewModel.fields.set('name', $(e.target).val());
								});
							}
						}
					},
					nickname: {
						type: 'text',
						name: TEXT.MEMBERSHIP_NICKNAME,
						editable: true,
						editFieldName: 'nickname',
						editTemplate: function () {
							return '<input class="k-input approve-nickname" placeholder="' + TEXT.MEMBERSHIP_NICKNAME + '" data-key="nickname"/>';
						},
						editViewModel: {
							fields: {
								nickname: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-nickname').kendoCommonValidator({
									type: 'name'
								});
								elemApprovePopup.find('.k-input.approve-nickname').on('keyup', function (e) {
									approvePopup.options.scheme.fields.nickname.editViewModel.fields.set('nickname', $(e.target).val());
								});
							}
						}
					},
					organization: {
						type: 'text',
						name: TEXT.MEMBERSHIP_ORGANIZATION,
						editable: true,
						editFieldName: 'organization',
						editTemplate: function () {
							return '<input class="k-input approve-organization" placeholder="' + TEXT.MEMBERSHIP_ORGANIZATION + '" data-key="organization"/>';
						},
						editViewModel: {
							fields: {
								organization: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-organization').kendoCommonValidator({
									type: 'name'
								});
								elemApprovePopup.find('.k-input.approve-organization').on('keyup', function (e) {
									approvePopup.options.scheme.fields.organization.editViewModel.fields.set('organization', $(e.target).val());
								});
							}
						}
					},
					employeeId: {
						type: 'text',
						name: TEXT.MEMBERSHIP_EMPLOYEE_ID_NUM,
						editable: true,
						editFieldName: 'employeeId',
						editTemplate: function () {
							return '<input class="k-input approve-employee-id" placeholder="' + TEXT.MEMBERSHIP_EMPLOYEE_ID_NUM + '" data-key="employeeId"/>';
						},
						editViewModel: {
							fields: {
								employeeId: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-employee-id').kendoCommonValidator({
									messages: {
										incorrectValue: TEXT.COMMON_INVALID_VALUE
									},
									rules: {
										incorrectValue: function (input) {
											var val = input.val();
											if (!val) {
												return true;
											}
											return val.match(/^(?=.{2,20}$)[a-zA-Z0-9_.]+$/);
										}
									}
								});
								elemApprovePopup.find('.k-input.approve-employee-id').on('keyup', function (e) {
									approvePopup.options.scheme.fields.employeeId.editViewModel.fields.set('employeeId', $(e.target).val());
								});
							}
						}
					},
					position: {
						type: 'text',
						name: TEXT.MEMBERSHIP_POSITION,
						editable: true,
						editFieldName: 'position',
						editTemplate: function () {
							return '<input class="k-input approve-position" placeholder="' + TEXT.MEMBERSHIP_POSITION + '" data-key="position"/>';
						},
						editViewModel: {
							fields: {
								position: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-position').kendoCommonValidator({
									type: 'name'
								});
								elemApprovePopup.find('.k-input.approve-position').on('keyup', function (e) {
									approvePopup.options.scheme.fields.position.editViewModel.fields.set('position', $(e.target).val());
								});
							}
						}
					},
					responsibility: {
						type: 'text',
						name: TEXT.MEMBERSHIP_RESPONSIBILITIES,
						editable: true,
						editFieldName: 'responsibility',
						editTemplate: function () {
							return '<input class="k-input approve-responsibility" placeholder="' + TEXT.MEMBERSHIP_RESPONSIBILITIES + '" data-key="responsibility"/>';
						},
						editViewModel: {
							fields: {
								responsibility: ''
							},
							init: function () {
								elemApprovePopup.find('.k-input.approve-responsibility').kendoCommonValidator({
									type: 'name'
								});
								elemApprovePopup.find('.k-input.approve-responsibility').on('keyup', function (e) {
									approvePopup.options.scheme.fields.responsibility.editViewModel.fields.set('responsibility', $(e.target).val());
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
			elemPopup.css('overflow', 'auto');
			return managerPopup;
		}
		approvePopup = elemApprovePopup.kendoDetailDialog(popupOptions[type]).data('kendoDetailDialog');
		elemApprovePopup.css('overflow', 'auto');
		return approvePopup;
	};

	return {
		managerDialogMessage: managerDialogMessage,
		managerDialogConfirm: managerDialogConfirm,
		getDetailPopup: getDetailPopup
	};
});
//# sourceURL=assetuser/widget.js
