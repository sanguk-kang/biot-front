define("asset/monitoring/model/asset-model", function(){
	"use strict";

	var kendo = window.kendo;
	// var moment = window.moment;			//[12-04-2018]안쓰는 코드 주석 -jw.lim
	var MockDataStatistic = [
		{
			"foundation_space_buildings_id": 1,
			"foundation_space_buildings_name": "A Tower",
			"floors": [
				{
					"foundation_space_floors_id": 5,
					"foundation_space_floors_type": "F",
					"foundation_space_floors_name": "4",
					"numberOfSubAssetTypes": 7,
					"numberOfRegisteredAssets": 1067,
					"numberOfRegisteredAssetsWithDevices": 1016,
					"numberOfRegisteredAssetsWithoutDevices": 51,
					"numberOfNormalDevices": 867,
					"numberOfDisconnectedDevices": 50,
					"numberOfLowBatteryDevices": 67,
					"numberOfOutOfBoundsDevices": 63,
					"assetTypes": [
						{
							"assets_types_name": "Computer",
							"subAssetTypes": [
								{
									"assets_subAssetType": "Server",
									"numberOfRegisteredAssets": 32,
									"numberOfRegisteredAssetsWithDevices": 32,
									"numberOfRegisteredAssetsWithoutDevices": 0,
									"numberOfNormalDevices": 29,
									"numberOfDisconnectedDevices": 2,
									"numberOfLowBatteryDevices": 1,
									"numberOfOutOfBoundsDevices": 0
								},
								{
									"assets_subAssetType": "Desktop",
									"numberOfRegisteredAssets": 395,
									"numberOfRegisteredAssetsWithDevices": 383,
									"numberOfRegisteredAssetsWithoutDevices": 12,
									"numberOfNormalDevices": 327,
									"numberOfDisconnectedDevices": 27,
									"numberOfLowBatteryDevices": 41,
									"numberOfOutOfBoundsDevices": 2
								},
								{
									"assets_subAssetType": "Laptop",
									"numberOfRegisteredAssets": 351,
									"numberOfRegisteredAssetsWithDevices": 333,
									"numberOfRegisteredAssetsWithoutDevices": 18,
									"numberOfNormalDevices": 272,
									"numberOfDisconnectedDevices": 8,
									"numberOfLowBatteryDevices": 12,
									"numberOfOutOfBoundsDevices": 49
								},
								{
									"assets_subAssetType": "Tablet",
									"numberOfRegisteredAssets": 152,
									"numberOfRegisteredAssetsWithDevices": 151,
									"numberOfRegisteredAssetsWithoutDevices": 1,
									"numberOfNormalDevices": 140,
									"numberOfDisconnectedDevices": 5,
									"numberOfLowBatteryDevices": 3,
									"numberOfOutOfBoundsDevices": 7
								}
							]
						},
						{
							"assets_types_name": "Communication",
							"subAssetTypes": [
								{
									"assets_subAssetType": "Router",
									"numberOfRegisteredAssets": 3,
									"numberOfRegisteredAssetsWithDevices": 3,
									"numberOfRegisteredAssetsWithoutDevices": 0,
									"numberOfNormalDevices": 3,
									"numberOfDisconnectedDevices": 0,
									"numberOfLowBatteryDevices": 0,
									"numberOfOutOfBoundsDevices": 0
								},
								{
									"assets_subAssetType": "Switch",
									"numberOfRegisteredAssets": 49,
									"numberOfRegisteredAssetsWithDevices": 49,
									"numberOfRegisteredAssetsWithoutDevices": 0,
									"numberOfNormalDevices": 47,
									"numberOfDisconnectedDevices": 1,
									"numberOfLowBatteryDevices": 1,
									"numberOfOutOfBoundsDevices": 0
								},
								{
									"numberOfRegisteredAssets": 85,
									"numberOfRegisteredAssetsWithDevices": 65,
									"numberOfRegisteredAssetsWithoutDevices": 20,
									"numberOfNormalDevices": 49,
									"numberOfDisconnectedDevices": 7,
									"numberOfLowBatteryDevices": 9,
									"numberOfOutOfBoundsDevices": 5
								}
							]
						}
					]
				},
				{
					"foundation_space_floors_id": 6,
					"foundation_space_floors_type": "F",
					"foundation_space_floors_name": "5",
					"numberOfSubAssetTypes": 5,
					"numberOfRegisteredAssets": 44,
					"numberOfRegisteredAssetsWithDevices": 43,
					"numberOfRegisteredAssetsWithoutDevices": 1,
					"numberOfNormalDevices": 38,
					"numberOfDisconnectedDevices": 1,
					"numberOfLowBatteryDevices": 1,
					"numberOfOutOfBoundsDevices": 4,
					"assetTypes": [
						{
							"assets_types_name": "Computer",
							"subAssetTypes": [
								{
									"assets_subAssetType": "Desktop",
									"numberOfRegisteredAssets": 16,
									"numberOfRegisteredAssetsWithDevices": 16,
									"numberOfRegisteredAssetsWithoutDevices": 0,
									"numberOfNormalDevices": 15,
									"numberOfDisconnectedDevices": 0,
									"numberOfLowBatteryDevices": 1,
									"numberOfOutOfBoundsDevices": 0
								},
								{
									"assets_subAssetType": "Laptop",
									"numberOfRegisteredAssets": 14,
									"numberOfRegisteredAssetsWithDevices": 14,
									"numberOfRegisteredAssetsWithoutDevices": 0,
									"numberOfNormalDevices": 11,
									"numberOfDisconnectedDevices": 1,
									"numberOfLowBatteryDevices": 0,
									"numberOfOutOfBoundsDevices": 3
								},
								{
									"assets_subAssetType": "Tablet",
									"numberOfRegisteredAssets": 9,
									"numberOfRegisteredAssetsWithDevices": 8,
									"numberOfRegisteredAssetsWithoutDevices": 1,
									"numberOfNormalDevices": 7,
									"numberOfDisconnectedDevices": 0,
									"numberOfLowBatteryDevices": 0,
									"numberOfOutOfBoundsDevices": 1
								}
							]
						},
						{
							"assets_types_name": "Communication",
							"subAssetTypes": [
								{
									"assets_subAssetType": "Switch",
									"numberOfRegisteredAssets": 2,
									"numberOfRegisteredAssetsWithDevices": 2,
									"numberOfRegisteredAssetsWithoutDevices": 0,
									"numberOfNormalDevices": 2,
									"numberOfDisconnectedDevices": 0,
									"numberOfLowBatteryDevices": 0,
									"numberOfOutOfBoundsDevices": 0
								},
								{
									"numberOfRegisteredAssets": 3,
									"numberOfRegisteredAssetsWithDevices": 3,
									"numberOfRegisteredAssetsWithoutDevices": 0,
									"numberOfNormalDevices": 3,
									"numberOfDisconnectedDevices": 0,
									"numberOfLowBatteryDevices": 0,
									"numberOfOutOfBoundsDevices": 0
								}
							]
						}
					]
				}
			]
		}
	];

	var MockData = [
		{
			"id": 1,
			"assets_types_id": 1,
			"assets_types_name": "Computer",
			"subAssetType": "Laptop",
			"description": "[Computer.Laptop] A Tower - 21th Floor - B Zone",
			"number": "2030445678",
			"modelName": "NT900X3D-A54",
			"serialNumber": "MJ03PFGS",
			"managementOrganization": "Building Management Group",
			"mobilityType": "Movable",
			"purchaseDate": "2015-01-16T00:00:00+09:00",
			"originalCost": 1851500,
			"bookValue": 1583000,
			"location": {
				"description": "USpaceB, 4F, New Zone 1",
				"foundation_space_buildings_id": 1,
				"foundation_space_floors_id": 5,
				"foundation_space_zones_id": 8,
				"geometry": {
					"type": "Point",
					"coordinates": [
				  151.36,
				  652.781
					]
				}
			},
			"users": [
				{
					"ums_users_id": "david.kim",
					"ums_users_role": "Manager",
					"ums_users_name": "David Kim",
					"ums_users_nickname": "Dave",
					"ums_users_employeeId": "11097865",
					"ums_users_mobilePhoneNumber": "+82-10-6732-8861",
					"ums_users_workPhoneNumber": "+82-2-751-8861",
					"ums_users_email": "david.kim@samsung.com",
					"ums_users_organization": "Building Management Group",
					"ums_users_position": "Senior Manager",
					"ums_users_responsibility": "Air conditioning system management."
				}
			],
			"devices": [
				{
					"dms_devices_id": "b1ca25a7-1755-b1ca-25a7-1755b1ca25a7",
					"dms_devices_name": "[Beacon] A:21F:B",
					"dms_devices_type": "Beacon",
					"dms_devices_description": "[Beacon] A Tower - 21th Floor - B Zone",
					"dms_devices_representativeStatus": "Alarm.Critical",
					"dms_devices_locations": [
						{
							"id": "Fixed",
							"description": "A Tower, 15F, C Zone",
							"foundation_space_buildings_id": 1,
							"foundation_space_floors_id": 45,
							"foundation_space_zones_id": 102,
							"geometry": {
					  "type": "Point",
					  "coordinates": [
									191.354,
									296.47
								]
							}
						}
					],
					"dms_devices_alarms": [
						{
							"alarms_id": 81,
							"alarms_name": "DEVICE_LOW_BATTERY",
							"alarms_type": "Warning",
							"alarms_eventTime": "2017-06-08T21:59:06+09:00"
						},
						{
							"alarms_id": 82,
							"alarms_name": "DEVICE_WRONG_LOCATION",
							"alarms_type": "Critical",
							"alarms_eventTime": "2017-06-08T22:11:41+09:00"
						}
					],
					"dms_devices_information": {
				  "updatedTime": "2017-06-08T22:29:22+09:00",
						"power" : {
							"batteryLevel" : 58
						}
					},
					"dms_devices_networks": [
						{
							"id": 1,
							"name": "BLE External Beacon",
							"type": "BLE",
							"description": "This beacon is solely used for the asset management service.",
							"ble": {
								"macAddress": "B1:CA:25:A7:17:55",
								"uuid": "288ef86f-4ca0-4d93-9551-fc66adec8612",
								"mode": "AdvertisingAndConnect",
								"writable": false,
								"major": 34956,
								"minor": 5854,
								"advertisingName": "Asset Management Service Beacon",
								"advertisingInterval": 400,
								"txPower": 8,
								"calibratedTxPower": -55,
								"rssi": -72
							}
						}
					]
			  }
			]
		},
		{
			"id": 2,
			"assets_types_id": 2,
			"assets_types_name": "Communication",
			"subAssetType": "Router",
			"description": "[Communication.Router] A Tower - 15th Floor - A Zone",
			"number": "3010735824",
			"modelName": "Cisco 892FSP",
			"serialNumber": "PSJ1420HG0",
			"managementOrganization": "Building Management Group",
			"mobilityType": "Fixed",
			"purchaseDate": "2016-07-10T00:00:00+09:00",
			"originalCost": 1416500,
			"bookValue": 1274800,
			"location": {
				"description": "USpaceB, 4F, New Zone 1",
				"foundation_space_buildings_id": 1,
				"foundation_space_floors_id": 5,
				"foundation_space_zones_id": 8,
				"geometry": {
					"type": "Point",
					"coordinates": [
						345.51,
						612.609
					]
				}
			},
			"users": [
				{
					"ums_users_id": "williams.john",
					"ums_users_role": "Manager",
					"ums_users_name": "John Williams",
					"ums_users_nickname": "Liam",
					"ums_users_employeeId": "08141745",
					"ums_users_mobilePhoneNumber": "+82-10-6692-6601",
					"ums_users_workPhoneNumber": "+82-2-751-6601",
					"ums_users_email": "williams.john@samsung.com",
					"ums_users_organization": "Building Management Group",
					"ums_users_position": "Principal Manager",
					"ums_users_responsibility": "Network infrastructure management"
				}
			],
			"devices": [
				{
					"dms_devices_id": "e3adc20f-0981-e3ad-c20f-0981e3adc20f",
					"dms_devices_name": "[Beacon] A:15F:A",
					"dms_devices_type": "Beacon",
					"dms_devices_description": "[Beacon] A Tower - 15th Floor - A Zone",
					"dms_devices_representativeStatus": "Alarm.Critical",
					"dms_devices_locations": [
						{
							"id": "Measured",
							"description": "A Tower, 15F, A Zone",
							"foundation_space_buildings_id": 1,
							"foundation_space_floors_id": 45,
							"foundation_space_zones_id": 100,
							"geometry": {
								"type": "Point",
								"coordinates": [
									344.987,
									612.005
								]
							}
						}
					],
					"dms_devices_alarms": [
						{
							"alarms_id": 87,
							"alarms_name": "DEVICE_LOST",
							"alarms_type": "Critical",
							"alarms_eventTime": "2017-06-08T22:15:59+09:00"
						}
					],
					"dms_devices_information": {
						"updatedTime": "2017-06-08T22:27:45+09:00",
						"power" : {
							"batteryLevel" : 58
						}
					},
					"dms_devices_networks": [
						{
							"id": 1,
							"name": "BLE External Beacon",
							"type": "BLE",
							"description": "This beacon is solely used for the asset management service.",
							"ble": {
								"macAddress": "E3:AD:C2:0F:09:81",
								"uuid": "0d855591-38ab-43d0-8d16-d70e16109e40",
								"mode": "AdvertisingAndConnect",
								"writable": false,
								"major": 30589,
								"minor": 1795,
								"advertisingName": "Asset Management Service Beacon",
								"advertisingInterval": 450,
								"txPower": 8,
								"calibratedTxPower": -55,
								"rssi": -68
							}
						}
					]
				}
			]
		},
		{
			"id": 3,
			"assets_types_id": 1,
			"assets_types_name": "Computer",
			"subAssetType": "Laptop",
			"description": "[Computer.Laptop] A Tower - 21th Floor - B Zone",
			"number": "2030445678",
			"modelName": "NT900X3D-A54",
			"serialNumber": "MJ03PFGS",
			"managementOrganization": "Building Management Group",
			"mobilityType": "Movable",
			"purchaseDate": "2015-01-16T00:00:00+09:00",
			"originalCost": 1851500,
			"bookValue": 1583000,
			"location": {
				"description": "USpaceB, 4F, New Zone 1",
				"foundation_space_buildings_id": 1,
				"foundation_space_floors_id": 5,
				"foundation_space_zones_id": 8,
				"geometry": {
					"type": "Point",
					"coordinates": [
						151.36,
						652.781
					]
				}
			},
			"users": [
				{
					"ums_users_id": "david.kim",
					"ums_users_role": "Manager",
					"ums_users_name": "David Kim",
					"ums_users_nickname": "Dave",
					"ums_users_employeeId": "11097865",
					"ums_users_mobilePhoneNumber": "+82-10-6732-8861",
					"ums_users_workPhoneNumber": "+82-2-751-8861",
					"ums_users_email": "david.kim@samsung.com",
					"ums_users_organization": "Building Management Group",
					"ums_users_position": "Senior Manager",
					"ums_users_responsibility": "Air conditioning system management."
				}
			],
			"devices": [
				{
					"dms_devices_id": "b1ca25a7-1755-b1ca-25a7-1755b1ca25a7",
					"dms_devices_name": "[Beacon] A:21F:B",
					"dms_devices_type": "Beacon",
					"dms_devices_description": "[Beacon] A Tower - 21th Floor - B Zone",
					"dms_devices_representativeStatus": "Normal",
					"dms_devices_locations": [
						{
							"id": "Fixed",
							"description": "A Tower, 15F, C Zone",
							"foundation_space_buildings_id": 1,
							"foundation_space_floors_id": 45,
							"foundation_space_zones_id": 102,
							"geometry": {
								"type": "Point",
								"coordinates": [
									191.354,
									296.47
								]
							}
						}
					],
					"dms_devices_alarms": [

					],
					"dms_devices_information": {
						"updatedTime": "2017-06-08T22:29:22+09:00",
						"power" : {
							"batteryLevel" : 58
						}
					},
					"dms_devices_networks": [
						{
							"id": 1,
							"name": "BLE External Beacon",
							"type": "BLE",
							"description": "This beacon is solely used for the asset management service.",
							"ble": {
								"macAddress": "B1:CA:25:A7:17:55",
								"uuid": "288ef86f-4ca0-4d93-9551-fc66adec8612",
								"mode": "AdvertisingAndConnect",
								"writable": false,
								"major": 34956,
								"minor": 5854,
								"advertisingName": "Asset Management Service Beacon",
								"advertisingInterval": 400,
								"txPower": 8,
								"calibratedTxPower": -55,
								"rssi": -72
							}
						}
					]
				}
			]
		}
	];

	var Asset = kendo.data.Model.define({
		id: "id",
		fields: {
			assets_types_id : { type : "number"},
			assets_types_name : { type : "string"},
			subAssetType : { type : "string"},
			description : { type : "string"},
			number : { type : "string"},
			modelName : {type : "string"},
			serialNumber : {type : "string"},
			managementOrganization : { type : "string"},
			mobilityType : {type : "string"},
			purchaseDate : {type : "datetime"},
			originalCost : {type : "number"},
			bookValue : {type : "number"},
			location : { type : "object"},
			users : { type : "object"},
			devices : {type : "object"}
		}
	});

	var createAssetModel = function(){
		var asset = new Asset();
		asset.set("location", {});
		asset.set("users", []);
		asset.set("devices", []);
		return asset;
	};

	var createDataSource = function(list, isSelected){
		var asset, i, max = list.length;
		max = list.length;
		for( i = 0; i < max; i++ ){
			asset = list[i];
			if(isSelected){
				asset.selected = false;
			}
			list[i] = new Asset(asset);
		}
		return list;
	};

	var convertBeaconToAssetModel = function(data){
		var i, device, max = data.length;
		var asset, results = [];
		for( i = 0; i < max; i++ ){
			device = data[i];
			asset = createAssetModel();
			asset.devices.push({
				dms_devices_id : device.id,
				dms_devices_name : device.name,
				dms_devices_type : device.type,
				dms_devices_description : device.description,
				dms_devices_representativeStatus : device.representativeStatus,
				dms_devices_locations : device.locations,
				dms_devices_alarms : device.alarms,
				dms_devices_information : device.information,
				dms_devices_networks : device.networks
			});
			//}
			results.push(asset);
		 }
		if(max == 0){
			asset = createAssetModel();
			results.push(asset);
		}
		return results;
	};

	var deleteInvalidFieldForAPI = function(result, type){

		if(type == "register"){
			delete result.assets_types;

			if(!result.id) delete result.id;

			if(!result.subAssetType) delete result.subAssetType;

			if(!result.assets_types_id) result.assets_types_id = 1;

			if(!result.managementOrganization) delete result.managementOrganization;

			if(!result.description) delete result.description;
		}

		if(result.location){
			if(!result.location.foundation_space_zones_id) delete result.location.foundation_space_zones_id;
			if(result.location.geometry && result.location.geometry.coordinates.length == 0) delete result.location.geometry;
		}

		if(result.mobilityType == "") result.mobilityType = "Fixed";

		if(result.users && result.users[0]){
			if(!result.users[0].ums_users_id || result.users[0].ums_users_id == "-"){
				delete result.users;
			}
		}
		if(result.devices && result.devices[0]){
			if(result.devices[0].dms_devices_id == "-"){
				delete result.devices;
			}
		}

	};

	var getAssetDeviceInfo = function(results, type){
		var device, devices, result, deviceIds = [];
		var i, max = results.length;
		for( i = 0; i < max; i++ ){
			result = results[i];
			deleteInvalidFieldForAPI(result, type);
			devices = results.devices;
			if(devices && devices[0]){
				device = devices[0];
				if(device.dms_devices_name && device.dms_devices_description){
					deviceIds.push({
						id : device.dms_devices_id,
						name : device.dms_devices_name,
						description : device.dms_devices_description
					});
				}
			}
		}
		return deviceIds;
	};

	return {
		MockDataStatistic : MockDataStatistic,
		MockData : MockData,
		createDataSource : createDataSource,
		createAssetModel : createAssetModel,
		convertBeaconToAssetModel : convertBeaconToAssetModel,
		getAssetDeviceInfo : getAssetDeviceInfo
	};
});
//# sourceURL=asset/monitoring/model/asset-model.js