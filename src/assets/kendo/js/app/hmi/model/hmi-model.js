define("hmi/model/hmi-model", function(){
	"use strict";
	var I18N = window.I18N;
	var MockData = [
		{
			"id": 1,
			"name": "A.21F.B - HMI Graphic File",
			"createdDate": "2017-04-17T20:44:32+09:00"
		},
		{
			"id": 2,
			"name": "A.22F.A - HMI Graphic File",
			"createdDate": "2017-04-20T09:01:17+09:00"
		},
		{
			"id": 3,
			"name": "A.22F.B - HMI Graphic File",
			"createdDate": "2017-04-24T13:17:02+09:00"
		}
	];

	var kendo = window.kendo;
	var HMIModel = kendo.data.Model.define({
		id: "id",
		fields: {
			name: {
				name: "Name"
			},
			createdDate : {
				name : "Start Date",
				type : "date"
			}
		}
	});

	var createModel = function(data){
		var m = new HMIModel(data);
		return m;
	};

	var createTreeDataSource = function(data){
		//기존 파일 데이터 호환을 위한 임시 조치
		/*var rootParent = {name : "Unknown", id : kendo.guid(), parent_id : null, expanded : true, _isFolder : true, order : 1};
		data.unshift(rootParent);
		var i, max = data.length;
		for( i = 1; i < max; i++ ){
			if(!data[i].parent_id) data[i].parent_id = rootParent.id;
			data[i]._isFile = true;
			data[i].selected = false;
			data[i].order = i + 1;
		}
		var testParent = {name : "Unknown 2", id : kendo.guid(), parent_id : null, _isFolder : true, order : 2};
		data.push(testParent);
		data.push($.extend(true, {}, data[1], { parent_id : testParent.id, id : 999, name : "Folder Test File", order : max }));*/
		var i, file, folder, max = data.length;
		for( i = 0; i < max; i++ ){
			file = data[i];
			file.selected = false;
			if(file.treeDepth == 1 && file.isFolder) folder = file;
			else if(folder && file.treeDepth == 2) file.parent_id = folder.id;
			else file.parent_id = null;
			if(typeof file.parent_id === "undefined") file.parent_id = null;
			if(typeof file.isFolder === "undefined") file.isFolder = false;
			if(typeof file.sortOrder === "undefined") file.sortOrder = i + 1;
		}

		var dataSource = new kendo.data.TreeListDataSource({
			data : data,
			schema : {
				model : {
					parentId : "parent_id",
					fields : {
						"parent_id" : {
							type : "string",
							nullable : true
						}
					}
				},
				expanded : true
			}
		});
		return dataSource;
	};

	function filterImage(item){
		var images = item.images;
		if(images){
			var i, max = images.length;
			for( i = 0; i < max; i++ ){
				images[i].image = "data:image/gif;base64," + images[i].image;
			}
		}
		return true;
	}

	var createLibraryDataSource = function(data){
		//서버 데이터는 타입 관계 없이 1 Level List로 응답
		var i, item, max = data.length;
		for( i = 0; i < max; i++ ){
			item = data[i];
			data[i] = convertComponentUiModel(item);
		}

		var results = [{
			id : "Controlled",
			name : I18N.prop("HMI_CONTROLLED_TYPE"),
			items : new kendo.data.Query(data)
				.filter({ field : "type", operator : "eq", value : "Controlled" })
				.sort({ field : "sortOrder", dir : "asc" }).toArray()
		}, {
			id : "Toggle",
			name : I18N.prop("HMI_TOGGLE_TYPE"),
			items : new kendo.data.Query(data)
				.filter({ field : "type", operator : "eq", value : "Toggle" })
				.sort({ field : "sortOrder", dir : "asc" }).toArray()
		}, {
			id : "Multi",
			name : I18N.prop("HMI_MULTI_TYPE"),
			items : new kendo.data.Query(data)
				.filter({ field : "type", operator : "eq", value : "Multi" })
				.sort({ field : "sortOrder", dir : "asc" }).toArray()
		}];

		return results;
	};

	var convertComponentUiModel = function(item, isIncludeFile){
		var extra, componentImages, componentImage, extraImages, extraImage, i, max;
		extra = item.component;
		componentImages = item.images;
		if(item.thumbnailImage){
			item.thumbnailImage = addBase64Prefix(item.name, item.thumbnailImage);
		}
		if(extra){
			if(typeof extra === "string"){
				item.component = JSON.parse(item.component);
				extra = item.component;
			}
			if(extra.controlType) item.controlType = extra.controlType;
			if(extra.min) item.min = extra.min;
			if(extra.max) item.max = extra.max;
			if(extra.step) item.step = extra.step;
			extraImages = extra.images;
			if(extraImages){
				max = extraImages.length;
				for( i = 0; i < max; i++ ){
					extraImage = extraImages[i];
					//이미지 별 min, max 값
					if(componentImages && componentImages[i]) componentImages[i] = $.extend(componentImages[i], extraImage);
				}
			}
			delete item.component;
		}
		if(componentImages){
			max = componentImages.length;
			for( i = 0; i < max; i++ ){
				componentImage = componentImages[i];
				componentImage.id = componentImage.name;
				componentImage.name = removeComponentNumber(componentImage.name);
				if(item.type != "Multi"){
					if( i == 0 ) componentImage.status = "OFF";
					else if( i == 1) componentImage.status = "ON";
				}
				if(componentImage.data){
					componentImage.image = componentImage.data;
					componentImage.image = addBase64Prefix(componentImage.name, componentImage.image);
					if(isIncludeFile) componentImage.file = base64ToFile(componentImage.name, componentImage.data);
					delete componentImage.data;
				}
			}
		}
		return item;
	};

	var getContentTypeFromName = function(name){
		var contentType;
		if(name.indexOf(".png") != -1){
			contentType = "image/png";
		}else if(name.indexOf(".gif") != -1){
			contentType = "image/gif";
		}else if(name.indexOf(".jpg") != -1){
			contentType = "image/jpeg";
		}else if(name.indexOf(".svg") != -1){
			contentType = "image/svg+xml";
		}else{
			contentType = "image/gif";
		}
		return contentType;
	};

	var addBase64Prefix = function(fileName, base64Data){
		var contentType = getContentTypeFromName(fileName);
		return "data:" + contentType + ";base64," + base64Data;
	};

	var removeComponentNumber = function(name){
		var split = name.split(".");
		//넘버 제거. 2인 이유는 01.ss.png 이므로. 확장자 포함하여 총 3개 이상으로 split 될 경우 01을 삭제.
		if(split.length > 2){
			split.splice(0, 1);
		}
		return split.join(".");
	};

	var addComponentNumber = function(index, name){
		if(typeof index !== "number") index = Number(index);
		index = kendo.toString(index, "00");
		name = index + "." + name;
		return name;
	};

	var base64ToFile = function(name, base64Image, contentType){
		var split = base64Image.split(",");
		var data;
		if(split.length > 1){
			contentType = split[0];
			data = split[1];
			contentType = contentType.split("data:")[1];
			contentType = contentType.split(";base64")[0];
		}else{
			data = split[0];
			//contentType = contentType || 'image/gif';
			contentType = contentType || '';
		}
		var Uint8Array = window.Uint8Array;
		var i, max = data.length, uint8Array = new Uint8Array(max);
		data = window.atob(data);
		for( i = 0; i < max; i++ ){
			uint8Array[i] = data.charCodeAt(i);
		}

		contentType = getContentTypeFromName(name);

		var blob = new Blob([uint8Array], {type : contentType });
		return new File([blob], name, { type : contentType });
	};

	var convertComponentBackendModel = function(component, isFormData){
		var extra = {};
		var formData;
		if(isFormData){
			formData = new FormData();
			formData.append("json", JSON.stringify({ type : component.type, sortOrder : component.sortOrder }));
		}
		if(component.controlType){
			extra.controlType = component.controlType;
			delete component.controlType;
		}

		if(component.min){
			extra.min = component.min;
			delete component.min;
		}

		if(component.max){
			extra.max = component.max;
			delete component.max;
		}

		if(component.images){
			extra.images = [];
			var image, images = component.images;
			var i, fileIndex, max = images.length;
			for( i = 0; i < max; i++ ){
				image = images[i];
				fileIndex = i + 1;
				if(typeof image.min !== "undefined" && image.min !== null && typeof image.max !== "undefined" && image.max !== null){
					extra.images[i] = { min : image.min, max : image.max };
				}
				if(image.image){
					if(isFormData && image.file){
						formData.append("images[" + fileIndex + "]", image.file, addComponentNumber(fileIndex, image.file.name), { type : image.file.type });
					}else{
						image.data = image.image;
						delete image.image;
					}
				}
			}
		}
		if(isFormData){
			var blob = new Blob([JSON.stringify(extra)], { type : "application/json"});
			formData.append('component', new File([blob], component.name, { type : "application/json" }));
			return formData;
		}
		return component;
	};


	var HmiModel = {
		MockData : MockData,
		createModel : createModel,
		createTreeDataSource : createTreeDataSource,
		createLibraryDataSource : createLibraryDataSource,
		convertComponentUiModel : convertComponentUiModel,
		convertComponentBackendModel : convertComponentBackendModel,
		removeComponentNumber : removeComponentNumber,
		addComponentNumber : addComponentNumber
	};

	window.HmiModel = HmiModel;
	return HmiModel;
});
//# sourceURL=hmi/model/hmi-model.js