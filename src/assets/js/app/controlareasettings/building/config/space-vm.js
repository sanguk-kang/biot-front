define('controlareasettings/building/config/space-vm', [], function() {
	'use strict';

	var kendo = window.kendo;
	var I18N = window.I18N;

	var AllMainViewModel = kendo.observable({
		btnEdit: {
			type: 'edit',
			text: I18N.prop('SPACE_BUTTON_TEXT_EDIT'),
			disabled: false,
			visible: true,
			click: function(){}
		},
		btnAdd: {
			type: 'add',
			text: I18N.prop('SPACE_BUTTON_TEXT_ADD'),
			disabled: false,
			visible: false,
			click: function(){}
		},
		btnDelete: {
			type: 'delete',
			text: I18N.prop('SPACE_BUTTON_TEXT_DELETE'),
			disabled: true,
			visible: false,
			click: function(){}
		},
		btnSave: {
			type: 'save',
			text: I18N.prop('SPACE_BUTTON_TEXT_SAVE'),
			disabled: true,
			visible: false,
			click: function(){}
		},
		btnExit: {
			type: 'exit',
			text: I18N.prop('SPACE_BUTTON_TEXT_EXIT'),
			disabled: false,
			visible: false,
			click: function(){}
		},
		btnCancel: {
			type: 'cancel',
			text: I18N.prop('SPACE_BUTTON_TEXT_CANCEL'),
			disabled: false,
			visible: false,
			click: function(){}
		},
		btnMoveTop: {
			type: 'top',
			disabled: true,
			visible: false,
			click: function(){}
		},
		btnMoveUp: {
			type: 'up',
			disabled: true,
			visible: false,
			click: function(){}
		},
		btnMoveDown: {
			type: 'down',
			disabled: true,
			visible: false,
			click: function(){}
		},
		btnMoveBottom: {
			type: 'bottom',
			disabled: true,
			visible: false,
			click: function(){}
		}
	});

	var SpecificFloorMainViewModel = kendo.observable({
		btnFloorDelete: {
			type: 'floor-delete',
			text: I18N.prop('SPACE_BUTTON_TEXT_DELETEFLOOR'),
			disabled: false,
			visible: true,
			click: function(){}
		},
		btnEdit: {
			type: 'edit',
			text: I18N.prop('SPACE_BUTTON_TEXT_EDIT'),
			disabled: false,
			visible: true,
			click: function(){}
		},
		btnSave: {
			type: 'save',
			text: I18N.prop('SPACE_BUTTON_TEXT_SAVE'),
			disabled: true,
			visible: false,
			click: function(){}
		},
		btnExit: {
			type: 'exit',
			text: I18N.prop('SPACE_BUTTON_TEXT_EXIT'),
			disabled: false,
			visible: false,
			click: function(){}
		},
		btnCancel: {
			type: 'cancel',
			text: I18N.prop('SPACE_BUTTON_TEXT_CANCEL'),
			disabled: false,
			visible: false,
			click: function(){}
		},
		btnZoneCreate: {
			type: 'zone-create',
			text: I18N.prop('SPACE_BUTTON_TEXT_CREATE'),
			disabled: false,
			visible: true,
			click: function(){}
		},
		btnZoneDelete: {
			type: 'zone-delete',
			text: I18N.prop('SPACE_BUTTON_TEXT_DELETE'),
			disabled: true,
			visible: true,
			click: function(){}
		},
		btnMoveTop: {
			type: 'top',
			disabled: true,
			visible: true,
			click: function(){}
		},
		btnMoveUp: {
			type: 'up',
			disabled: true,
			visible: true,
			click: function(){}
		},
		btnMoveDown: {
			type: 'down',
			disabled: true,
			visible: true,
			click: function(){}
		},
		btnMoveBottom: {
			type: 'bottom',
			disabled: true,
			visible: true,
			click: function(){}
		},
		spanEditInfo: {
			text: I18N.prop('SPACE_MESSAGE_INFO_CLICK_ZONE_NAME'),
			visible: true
		}
	});

	return {
		AllMainViewModel: AllMainViewModel,
		SpecificFloorMainViewModel: SpecificFloorMainViewModel
	};
});