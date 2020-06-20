define("asset/monitoring/model/asset-type-model", function(){
	"use strict";

	var kendo = window.kendo;
	// var moment = window.moment;			//[12-04-2018]안쓰는 코드 주석 -jw.lim
	var MockData = [
		{
			"id": 1,
			"name": "Computer",
			"subAssetTypes": [
			  "Server",
			  "Desktop",
			  "Laptop",
			  "Tablet"
			]
		},
		{
			"id": 2,
			"name": "Communication",
			"subAssetTypes": [
			  "Router",
			  "Switch"
			]
		},
		{
			"id": 3,
			"name": "Office",
			"subAssetTypes": []
		},
		{
			"id": 4,
			"name": "Medical",
			"subAssetTypes": []
		},
		{
			"id": 5,
			"name": "HVAC",
			"subAssetTypes": [
			  "System Air Conditioner - Indoor Unit",
			  "System Air Conditioner - Outdoor Unit"
			]
		},
		{
			"id": 6,
			"name": "Power",
			"subAssetTypes": [
			  "Electricity Meter"
			]
		},
		{
			"id": 7,
			"name": "Fire",
			"subAssetTypes": []
		},
		{
			"id": 8,
			"name": "Security",
			"subAssetTypes": []
		},
		{
			"id": 9,
			"name": "Etc",
			"subAssetTypes": []
		}
	];

	var AssetType = kendo.data.Model.define({
		id: "id",
		fields: {
			name : {type : "string"},
			subAssetTypes : { type : "object"}
		}
	});

	var createDataSource = function(list, isSelected){
		var i, type, max = list.length;
		for( i = 0; i < max; i++ ){
			type = list[i];
			if(isSelected){
				type.selected = false;
			}
			list[i] = new AssetType(type);
		}
		return list;
	};

	var createAssetTypePopupModel = function(list){
		var i, j, type, size, max = list.length;
		var subType, subTypes;
		for( i = 0; i < max; i++){
			type = list[i];
			type.selected = false;
			subTypes = type.subAssetTypes;
			size = subTypes.length;
			for( j = 0; j < size; j++ ){
				subType = subTypes[j];
				subTypes[j] = { name : subType, checked : false };
			}
		}
		return list;
	};

	return {
		MockData : MockData,
		createDataSource : createDataSource,
		createAssetTypePopupModel : createAssetTypePopupModel
	};
});