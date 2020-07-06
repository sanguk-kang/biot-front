/**
 *
 *   <ul>
 *       <li>Main으로부터 space 기능의 coreModule을 전달 받는다.</li>
 *   </ul>
 *   @module app/controlareasettings/building/model/space-model
 *   @param {Object} CoreModule- 에너지 core 객체
 *   @param {Object} Common- 에너지 Common 객체
 *   @requires app/controlareasettings/core
 *   @requires app/controlareasettings/building/config/space-common
 *   @returns {Object} Zone - kendo data 모델
 */

/*Main으로부터 space 기능의 coreModule을 전달 받는다.*/
define("controlareasettings/building/model/space-model", ["controlareasettings/core","controlareasettings/building/config/space-common"], function(CoreModule, Common){
	//Code의 품질을 위하여 "use strict" 적용
	"use strict";
	/* 다국어 작업 진행 */
	var kendo = window.kendo;

	var spaceText = {
		description : Common.TEXT.DESCRIPTION,
		density : Common.TEXT.DENSITY,
		comfort : Common.TEXT.COMFORT,
		location : Common.TEXT.SPACE_TEXT_LOCATION,
		date : Common.TEXT.SPACE_TEXT_DATE,
		manager : Common.TEXT.SPACE_TEXT_MANAGER
	};

	var floorType = [
		{
			text: 'F',
			value: 0
		},
		{
			text: 'B',
			value: 1
		},
		{
			text: 'None',
			value: -1
		}
	];

	var dataType = {
		ORIGINAL_DATA: 0,
		UPDATE_DATA: 1,
		NEW_DATA: 2,
		DELETED_DATA: 3,
		VIEW_DATA: 4
	};

	var Zone = kendo.data.Model.define({
		id: "id",
		fields: {
			"id": {
				name: "id",
				type: "string",
				editType: null
			},
			"name": {
				name: "name",
				type: "string",
				editType: 'input'
			},
			'nameDisplayCoordinate': {
				name: 'nameDisplayCoordinate',
				type: 'object'
			},
			"foundation_space_buildings_id": {
				name: "foundation_space_buildings_id",
				type: "number"
			},
			"foundation_space_buildings_name": {
				name: "foundation_space_buildings_name",
				type: "string"
			},
			"foundation_space_floors_id": {
				name: "foundation_space_floors_id",
				type: "number"
			},
			"foundation_space_floors_name": {
				name: "foundation_space_floors_name",
				type: "string"
			},
			"foundation_space_floors_type": {
				name: "foundation_space_floors_type",
				type: "string"
			},
			'sortOrder': {
				name: 'sortOrder',
				type: 'number'
			},
			'maxOccupancy': {
				name: 'maxOccupancy',
				type: 'number'
			},
			'indexes': {
				name: 'indexes',
				type: 'object'
			},
			'geometry': {
				name: 'geometry',
				type: 'object'
			},
			"description": {
				name: spaceText.description,
				type: "string",
				editType: "input"
			},
			'created': {
				name: 'created',
				type: 'object'
			},
			'updated': {
				name: 'updated',
				type: 'object'
			},
			'devices': {
				name: 'devices',
				type: 'object'
			},
			'thumbnailImage': {
				name: 'thumbnailImage',
				type: 'string'
			}
		}
	});

	var Building = kendo.data.Model.define({
		id: 'id',
		fields: {
			'id': {
				name: 'id',
				type: 'number'
			},
			'description': {
				name: 'description',
				type: 'string'
			},
			'name': {
				name: 'name',
				type: 'string'
			},
			'highestFloor': {
				name: 'highestFloor',
				type: 'object'
			},
			'lowestFloor': {
				name: 'lowestFloor',
				type: 'object'
			},
			'indexes': {
				name: 'indexes',
				type: 'object'
			},
			'sortOrder': {
				name: 'sortOrder',
				type: 'number'
			},
			'maxOccupancy': {
				name: 'maxOccupancy',
				type: 'number'
			},
			'imageFileName': {
				name: 'imageFileName',
				type: 'string'
			},
			'dataType': {
				name: 'dataType',
				type: 'number',
				options: [
					{
						text: 'ORIGINAL_DATA',
						value: dataType.ORIGINAL_DATA
					},
					{
						text: 'UPDATE_DATA',
						value: dataType.UPDATE_DATA
					},
					{
						text: 'NEW_DATA',
						value: dataType.NEW_DATA
					},
					{
						text: 'DELETED_DATA',
						value: dataType.DELETED_DATA
					},
					{
						text: 'VIEW_DATA',
						value: dataType.VIEW_DATA
					}
				],
				defaultValue: 0
			}
		}
	});

	var Floor = kendo.data.Model.define({
		id: 'id',
		fields: {
			'id': {
				name: 'id',
				type: 'number'
			},
			'description': {
				name: 'description',
				type: 'string'
			},
			'name': {
				name: 'name',
				type: 'string'
			},
			'indexes': {
				name: 'indexes',
				type: 'object'
			},
			'sortOrder': {
				name: 'sortOrder',
				type: 'number'
			},
			'type': {
				name: 'type',
				type: 'string',
				options: floorType
			},
			'length': {
				name: 'length',
				type: 'number'
			},
			'width': {
				name: 'width',
				type: 'number'
			},
			'maxOccupancy': {
				name: 'maxOccupancy',
				type: 'number'
			},
			'imageFileName': {
				name: 'imageFileName',
				type: 'string'
			},
			'alarms': {
				name: 'alarms',
				type: 'object'
			},
			'space_buildings_id': {
				name: 'space_buildings_id',
				type: 'number'
			},
			'dataType': {
				name: 'dataType',
				type: 'number',
				options: [
					{
						text: 'ORIGINAL_DATA',
						value: dataType.ORIGINAL_DATA
					},
					{
						text: 'UPDATE_DATA',
						value: dataType.UPDATE_DATA
					},
					{
						text: 'NEW_DATA',
						value: dataType.NEW_DATA
					},
					{
						text: 'DELETED_DATA',
						value: dataType.DELETED_DATA
					},
					{
						text: 'VIEW_DATA',
						value: dataType.VIEW_DATA
					}
				],
				defaultValue: 0
			}
		}
	});

	var Indexes = kendo.data.Model.define({
		fields: {
			'densityLevel': {
				name: 'densityLevel',
				type: 'number'
			},
			'comfortLevel': {
				name: 'comfortLevel',
				type: 'number'
			},
			'numberOfPeople': {
				name: 'numberOfPeople',
				type: 'number'
			},
			'numberOfZones': {
				name: 'numberOfZones',
				type: 'number'
			}
		}
	});

	return {
		floorType: floorType,
		dataType: dataType,
		Zone : Zone,
		Building: Building,
		Floor: Floor,
		Indexes: Indexes
	};
});