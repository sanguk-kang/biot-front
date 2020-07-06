
define("asset/monitoring/asset-api", [], function(){
	"use strict";

	var MainWindow = window.MAIN_WINDOW;

	var getAssets = function(arg){
		if(!arg) arg = {};

		var buildingId, floorId;
		var floorData = MainWindow.getCurrentFloor();
		var floor = floorData.floor, building = floorData.building;
		if(building.id && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID) buildingId = building.id;
		if(floor.id && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID) floorId = floor.id;
		if(buildingId) arg.foundation_space_buildings_id = buildingId;
		if(floorId) arg.foundation_space_floors_id = floorId;

		return $.ajax({
			url : "/assets",
			data : arg
		});
	};

	var postAsset = function(data){
		return $.ajax({
			url : "/assets",
			method : "POST",
			data : data
		});
	};

	var patchAssets = function(data){
		return $.ajax({
			url : "/assets",
			method : "PATCH",
			data : data
		});
	};

	var postAssets = function(data){
		var reqArr = [];
		var i, max = data.length;
		for( i = 0; i < max; i++ ){
			reqArr.push(postAsset(data[i]));
		}
		return $.when.apply(this, reqArr);
	};

	var getAsset = function(id){
		return $.ajax({
			url : "/assets/" + id
		});
	};

	var getAssetWithMultipleID = function(ids){
		if(ids.length == 1) return getAsset(ids[0]).then(function(data){ return [data]; });

		if(ids){
			ids = "?ids=" + ids.join(",");
		}
		return $.ajax({
			url : "/assets" + ids
		});
	};

	var patchAsset = function(id, data){
		return $.ajax({
			url : "/assets/" + id,
			method : "PATCH",
			data : data
		}).then(function(){

		});
	};

	var deleteAsset = function(id){
		return $.ajax({
			url : "/assets/" + id,
			method : "DELETE"
		});
	};

	var deleteAssets = function(ids){
		var reqArr = [];
		var i, max = ids.length;
		for( i = 0; i < max; i++ ){
			reqArr.push(deleteAsset(ids[i]));
		}
		return $.when.apply(this, reqArr);
	};

	//[12-04-2018]안쓰는 코드 주석 - data -jw.lim
	// var getAssetTypes = function(data) {
	var getAssetTypes = function(){
		return $.ajax({
			url : "/assets/types"
		});
	};

	var patchAssetTypes = function(data){
		return $.ajax({
			url : "/assets/types",
			data : data,
			method : "PATCH"
		});
	};

	var getAssetType = function(id){
		return $.ajax({
			url : "/assets/types/" + id
		});
	};

	var patchAssetType = function(id, data){
		return $.ajax({
			url : "/assets/types/" + id,
			data : data,
			method : "PATCH"
		});
	};

	var getStatistic = function(){
		return $.ajax({
			url : "/assets/statisticView"
		});
	};

	return {
		getAssets : getAssets,
		postAssets : postAssets,
		postAsset : postAsset,
		patchAssets : patchAssets,
		getAsset : getAsset,
		getAssetWithMultipleID : getAssetWithMultipleID,
		patchAsset : patchAsset,
		deleteAsset : deleteAsset,
		deleteAssets : deleteAssets,
		getAssetTypes : getAssetTypes,
		patchAssetTypes : patchAssetTypes,
		getAssetType : getAssetType,
		patchAssetType : patchAssetType,
		getStatistic : getStatistic
	};
});
//For Debug
//# sourceURL=asset/monitoring/asset-api.js
