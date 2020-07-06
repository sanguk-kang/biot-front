define('accountsettings/authmgmt/config/authmgmt-vm', [], function() {
	'use strict';

	var kendo = window.kendo, I18N = window.I18N;

	var AuthViewModel = kendo.observable({
		btnSave: {
			text: I18N.prop('COMMON_BTN_SAVE'),
			disabled: true,
			click: function(){}
		}
	});

	return {
		AuthViewModel: AuthViewModel
	};
});