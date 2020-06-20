define("hmi/hmi-api", [], function(){

	var CONTENT_TYPE = "Content-Type : application/json";
	var BOUNDARY = '--------------------------3df13a02c1be82d3';
	var START_DELIMITER = "\r\n--" + BOUNDARY + "\r\n";
	var END_DELIMITER = "\r\n--" + BOUNDARY + "--";
	//var MULTIPART_REQUEST_HEADERS  = { "Content-Type" : "multipart/form-data; boundary=" + BOUNDARY};
	var MULTIPART_REQUEST_HEADERS  = { "Content-Type" : "multipart/form-data; boundary=" + BOUNDARY };
	var DEFAULT_JSON_HEADER = { "Accept" : "application/json; charset=utf-8", "Content-Type" : "application/json"};
	var Session = window.Session, I18N = window.I18N, Util = window.Util;
	var DEFAULT_USER_SETTING_KEY = {
		PANEL_FOLDED : "panelFolded",
		ACTIVE_TAB : "activeTab",
		OPENED_TAB : "openedTab",
		ID : "id",
		NAME : "tabName",
		ZOOM : "zoomLevel"
	};

	var getMultipartRequestBody = function(fileName, data){
		var content = 'Content-Disposition: form-data; name="file"; filename="' + fileName + '";';
		var requestBody = START_DELIMITER + content + '\r\n' + CONTENT_TYPE + '\r\n' + '\r\n' + data + END_DELIMITER;
		return requestBody;
	};

	var getGraphicFormData = function(file, graphicData){
		var formData = new FormData();
		var jsonMeta = { isFolder : file.isFolder, sortOrder : file.sortOrder, treeDepth : file.treeDepth };
		formData.append('json', JSON.stringify(jsonMeta));
		//Graphic Data는 Mandatory이므로 없으면 생성
		if(!graphicData) graphicData = {};

		var fileName = file.name;
		var blob = new Blob([JSON.stringify(graphicData)], { type : "application/json"});
		formData.append('graphic', new File([blob], fileName, { type : "application/json" }));
		return formData;
	};

	var getFiles = function(query){
		return $.ajax({
			data : query,
			url : "/dms/hmi/graphics"
		});
	};

	var postFile = function(file, graphicData){
		var dfd = new $.Deferred();
		var formData = getGraphicFormData(file, graphicData);
		$.ajax({
			url : "/dms/hmi/graphics",
			method : "POST",
			data : formData,
			isFileUpload : true
		}).done(function(res, textStatus, xhq){
			var result = parseErrorMsg(res, "graphic", "POST", xhq.status);
			if(result.success) dfd.resolve(result.message);
			else dfd.reject(result.message);
		}).fail(function(xhq){
			var msg = parseFailErrorMsg(xhq);
			dfd.reject(msg);
		});
		return dfd.promise();
	};

	var putFile = function(file, graphicData){
		var dfd = new $.Deferred();
		var id = file.id;
		var formData = getGraphicFormData(file, graphicData);
		$.ajax({
			url : "/dms/hmi/graphics/" + id,
			method : "POST",
			data : formData,
			isFileUpload : true
		}).done(function(res, textStatus, xhq){
			var result = parseErrorMsg(res, "graphic", "POST", xhq.status);
			if(result.success) dfd.resolve(result.message);
			else dfd.reject(result.message);
		}).fail(function(xhq){
			var msg = parseFailErrorMsg(xhq);
			dfd.reject(msg);
		});
		return dfd.promise();
	};

	var patchFile = function(file){
		var dfd = new $.Deferred();
		var id = file.id;
		var data = { name : file.name, sortOrder : file.sortOrder, treeDepth : file.treeDepth };
		$.ajax({
			url : "/dms/hmi/graphics/" + id,
			method : "PATCH",
			data : data
		}).done(function(res, textStatus, xhq){
			var result = parseErrorMsg(res, "graphic", "PATCH", xhq.status);
			if(result.success) dfd.resolve(result.message);
			else dfd.reject(result.message);
		}).fail(function(xhq){
			var result = parseErrorMsg(xhq.responseJSON, "graphic", "PATCH", xhq.status);
			dfd.reject(result.message);
		});
		return dfd.promise();
	};

	var patchFiles = function(files){
		var i, file, max = files.length;
		var reqArr = [];
		for( i = 0; i < max; i++ ){
			file = files[i];
			reqArr.push(patchFile(file));
		}
		return $.when.apply(this, reqArr);
	};

	var getFile = function(id){
		var dfd = new $.Deferred();
		$.ajax({
			headers : DEFAULT_JSON_HEADER,
			url : "/dms/hmi/graphics/" + id
		}).done(function(data){
			dfd.resolve(data);
		}).fail(function(xhq){
			var result = parseErrorMsg(xhq.responseJSON, "graphic", "GET", xhq.status);
			dfd.reject(result.message);
		});
		return dfd.promise();
	};

	var deleteFile = function(id){
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/hmi/graphics/" + id,
			method : "DELETE"
		}).done(function(res, textStatus, xhq){
			var result = parseErrorMsg(res, "graphic", "DELETE", xhq.status);
			if(result.success) dfd.resolve(result.message);
			else dfd.reject(result.message);
		}).fail(function(xhq){
			var result = parseErrorMsg(xhq.responseJSON, "graphic", "DELETE", xhq.status);
			dfd.reject(result.message);
		});
		return dfd.promise();
	};

	var deleteFiles = function(files){
		var i, file, max = files.length;
		var reqArr = [];
		for( i = 0; i < max; i++ ){
			file = files[i];
			reqArr.push(deleteFile(file.id));
		}
		return $.when.apply(this, reqArr);
	};

	var getDevicesForPolling = function(ids){
		ids = ids.join(",");
		var url = "/dms/devices?ids=" + ids + "&attributes=name,type,mappedType,registrationStatus,controlPoint-tagName,controlPoint-value,airConditioner,operations,temperatures,modes,configuration,winds,alarms,representativeStatus";
		return $.ajax({
			url : url
		});
	};

	var getControlPointDevices = function(){
		var url = "/dms/devices?types=ControlPoint.*&registrationStatus=Registered";
		return $.ajax({
			url : url
		});
	};

	var getFileIdFromRes = function(res){
		var graphic = res.graphic;
		var header = graphic.headers[0];
		var locationString = header.value;
		var split = locationString.split("/graphics/");
		var graphicFileId = split[1];
		return graphicFileId;
	};

	var getComponentFormData = function(component){
		var HmiModel = window.HmiModel;
		var formData = HmiModel.convertComponentBackendModel(component, true);
		return formData;
	};

	var getComponents = function(query){
		return $.ajax({
			data : query,
			url : "/dms/hmi/components"
		});
	};

	var postComponent = function(component){
		var dfd = new $.Deferred();
		var formData = getComponentFormData(component);
		$.ajax({
			url : "/dms/hmi/components",
			method : "POST",
			data : formData,
			isFileUpload : true
		}).done(function(res, textStatus, xhq){
			var result = parseErrorMsg(res, "component", "POST", xhq.status);
			if(result.success) dfd.resolve(result.message);
			else dfd.reject(result.message);
		}).fail(function(xhq){
			var msg = parseFailErrorMsg(xhq);
			dfd.reject(msg);
		});
		return dfd.promise();
	};

	var putComponent = function(component){
		var dfd = new $.Deferred();
		var id = component.id;
		var oldImages = component.oldImages, i, max = oldImages.length;
		//기존 이미지 삭제
		var imageNames = [];
		for( i = 0; i < max; i++ ){
			imageNames.push(oldImages[i].id);
		}
		imageNames = imageNames.join(",");
		$.ajax({
			url : "/dms/hmi/components/" + id + "/images?names=" + imageNames,
			method : "DELETE"
		}).done(function(res, textStatus, xhq){
			var result = parseErrorMsg(res, "graphic", "DELETE", xhq.status);
			if(result.success){
				var formData = getComponentFormData(component);
				$.ajax({
					url : "/dms/hmi/components/" + id,
					method : "POST",
					data : formData,
					isFileUpload : true
				}).done(function(resp, textStatus2, xhq2){
					result = parseErrorMsg(resp, "component", "POST", xhq2.status);
					if(result.success) dfd.resolve(result.message);
					else dfd.reject(result.message);
				}).fail(function(xhq2){
					var msg = parseFailErrorMsg(xhq2);
					dfd.reject(msg);
				});
			}else{
				dfd.reject(result.message);
			}
		}).fail(function(xhq){
			var result = parseErrorMsg(xhq.responseJSON, "component", "DELETE", xhq.status);
			dfd.reject(result.message);
		});

		return dfd.promise();
	};

	var patchComponent = function(component){
		var dfd = new $.Deferred();
		var id = component.id;
		var data = { name : component.name, sortOrder : component.sortOrder };
		$.ajax({
			url : "/dms/hmi/components/" + id,
			method : "PATCH",
			data : data
		}).done(function(res, textStatus, xhq){
			var result = parseErrorMsg(res, "component", "PATCH", xhq.status);
			if(result.success) dfd.resolve(result.message);
			else dfd.reject(result.message);
		}).fail(function(xhq){
			var result = parseErrorMsg(xhq.responseJSON, "component", "PATCH", xhq.status);
			dfd.reject(result.message);
		});
		return dfd.promise();
	};

	var patchComponents = function(components){
		var i, component, max = components.length;
		var reqArr = [];
		for( i = 0; i < max; i++ ){
			component = components[i];
			reqArr.push(patchComponent(component));
		}
		return $.when.apply(this, reqArr);
	};

	var getComponent = function(id){
		var dfd = new $.Deferred(), HmiModel = window.HmiModel;
		$.ajax({
			headers : DEFAULT_JSON_HEADER,
			url : "/dms/hmi/components/" + id
		}).done(function(component){
			$.ajax({
				url : "/dms/hmi/components/" + id + "/images"
			}).done(function(images){
				var componentObj = { component : component, images : images };
				componentObj = HmiModel.convertComponentUiModel(componentObj, true);
				dfd.resolve(componentObj);
			}).fail(function(xhq){
				var result = parseErrorMsg(xhq.responseJSON, "component", "GET", xhq.status);
				dfd.reject(result.message);
			});
		}).fail(function(xhq){
			var result = parseErrorMsg(xhq.responseJSON, "component", "GET", xhq.status);
			dfd.reject(result.message);
		});
		return dfd.promise();
	};

	var getComponentImages = function(componentId){
		return $.ajax({
			url : "/dms/hmi/components/" + componentId + "/images"
		});
	};

	var deleteComponent = function(id){
		var dfd = new $.Deferred();
		$.ajax({
			url : "/dms/hmi/components/" + id,
			method : "DELETE"
		}).done(function(res, textStatus, xhq){
			var result = parseErrorMsg(res, "component", "DELETE", xhq.status);
			if(result.success) dfd.resolve(result.message);
			else dfd.reject(result.message);
		}).fail(function(xhq){
			var result = parseErrorMsg(xhq.responseJSON, "component", "DELETE", xhq.status);
			dfd.reject(result.message);
		});
		return dfd.promise();
	};

	var deleteComponents = function(components){
		var i, component, max = components.length;
		var reqArr = [];
		for( i = 0; i < max; i++ ){
			component = components[i];
			reqArr.push(deleteComponent(component.id));
		}
		return $.when.apply(this, reqArr);
	};

	var getComponentIdFromRes = function(res){
		var component = res.component;
		var header = component.headers[0];
		var locationString = header.value;
		var split = locationString.split("/components/");
		var graphicFileId = split[1];
		return graphicFileId;
	};

	var getUserSettings = function(){
		var userId = Session.id;
		var url = "/ums/users/" + userId + "/hmi";
		var dfd = new $.Deferred();
		$.ajax({
			url : url
		}).done(function(data){
			var parsedData = {panelFolded : false, activeTab : {}, openedTab : []};
			var key, value, idx;
			var openedTab = {};
			data.forEach(function(item) {
				key = item.key.split('_');
				value = item.value;
				if (key[0].indexOf(DEFAULT_USER_SETTING_KEY.ACTIVE_TAB) != -1) {
					switch(key[1]){
					case DEFAULT_USER_SETTING_KEY.ID:
						parsedData.activeTab['id'] = Number(value);
						break;
					case DEFAULT_USER_SETTING_KEY.NAME:
						parsedData.activeTab['name'] = value;
						break;
					case DEFAULT_USER_SETTING_KEY.ZOOM:
						parsedData.activeTab['zoomLevel'] = Number(value);
						break;
					default:
					}
				} else if (key[0].indexOf(DEFAULT_USER_SETTING_KEY.OPENED_TAB) != -1) {
					idx = key[1];
					if (!openedTab[idx]) openedTab[idx] = {};
					switch(key[2]){
					case DEFAULT_USER_SETTING_KEY.ID:
						openedTab[idx]['id'] = Number(value);
						break;
					case DEFAULT_USER_SETTING_KEY.NAME:
						openedTab[idx]['name'] = value;
						break;
					case DEFAULT_USER_SETTING_KEY.ZOOM:
						openedTab[idx]['zoomLevel'] = Number(value);
						break;
					default:
					}
				} else if (key[0].indexOf(DEFAULT_USER_SETTING_KEY.PANEL_FOLDED) != -1) {
					parsedData.panelFolded = value == 'true';
				}
			});
			$.each(openedTab, function(objKey, item) {
				parsedData.openedTab.push(item);
			});
			dfd.resolve(parsedData);
		}).fail(function(xhq){
			dfd.reject(xhq);
		});
		return dfd.promise();
	};

	var putUserSettings = function(data){
		var userId = Session.id;
		var url = "/ums/users/" + userId + "/hmi";
		var jsonData = [];
		var panelFolded = data.panelFolded || false;
		var tabInfo = data.tabInfo;
		var activeTab = tabInfo.activeTab;
		var openedTab = tabInfo.openedTab || [];

		jsonData.push({
			key : DEFAULT_USER_SETTING_KEY.PANEL_FOLDED,
			value : panelFolded
		});
		if (activeTab && activeTab.id) {
			jsonData.push({
				key : DEFAULT_USER_SETTING_KEY.ACTIVE_TAB + '_' + DEFAULT_USER_SETTING_KEY.ID,
				value : activeTab.id
			}, {
				key : DEFAULT_USER_SETTING_KEY.ACTIVE_TAB + '_' + DEFAULT_USER_SETTING_KEY.NAME,
				value : activeTab.name
			}, {
				key : DEFAULT_USER_SETTING_KEY.ACTIVE_TAB + '_' + DEFAULT_USER_SETTING_KEY.ZOOM,
				value : activeTab.zoomLevel
			});
		}

		if (openedTab.length > 0) {
			openedTab.forEach(function(tab, idx) {
				jsonData.push({
					key : DEFAULT_USER_SETTING_KEY.OPENED_TAB + '_' + idx + '_' + DEFAULT_USER_SETTING_KEY.ID,
					value : tab.id
				}, {
					key : DEFAULT_USER_SETTING_KEY.OPENED_TAB + '_' + idx + '_' + DEFAULT_USER_SETTING_KEY.NAME,
					value : tab.name
				}, {
					key : DEFAULT_USER_SETTING_KEY.OPENED_TAB + '_' + idx + '_' + DEFAULT_USER_SETTING_KEY.ZOOM,
					value : tab.zoomLevel
				});
			});
		}
		return $.ajax({
			url : url,
			method : "PUT",
			data : jsonData
		});
	};

	var resCodeMsg = {
		41337 : "HMI_NOT_EXIST_FILE_ERROR",
		41332 : function(body){
			var msg = body.message;
			var split = msg.split("(");
			split = split[1];
			var index = split.indexOf(")");
			var fileName = split.substring(0, index);
			return I18N.prop("HMI_DUPLICATED_FILE_NAME", fileName);
		},
		41340 : function(body){
			var msg = body.message;
			var split = msg.split("(");
			split = split[1];
			var index = split.indexOf(")");
			var name = split.substring(0, index);
			return I18N.prop("HMI_DUPLICATED_LIBRARY_NAME", name);
		}
	};

	function parseFailErrorMsg(xhq){
		var msg = Util.parseFailResponse(xhq);
		if(msg.indexOf("doesn't match pattern") != -1){
			msg = I18N.prop("COMMON_INVALID_CHARACTER");
		}
		return msg;
	}

	function parseErrorMsg(res, type, method, originalStatus){
		var resObj = {};
		if($.isArray(res)) res = res[0];

		if(res && res.code && res.message){
			resObj.status = originalStatus;
			resObj.body = res;
		}else if(res && res[type]){
			resObj = res[type];
		}else{
			resObj.status = originalStatus;
		}
		var status = resObj.status;
		var msg = '', isSuccess = false;
		if(status >= 400){
			var body;
			if(typeof resObj.body === "string") body = JSON.parse(resObj.body);
			else body = resObj.body;

			var bodyMsg = body.message;
			var bodyCode = body.code;
			var codeMsg = resCodeMsg[bodyCode];
			if(codeMsg){
				if($.isFunction(codeMsg)) msg = codeMsg(body);
				else msg = I18N.prop(codeMsg);
			}else{
				msg = bodyMsg;
			}
			isSuccess = false;
		}else {
			isSuccess = true;
			if(method == 'POST'){
				if(type == 'graphic'){
					msg = getFileIdFromRes(res);
				}else if(type == 'component'){
					msg = getComponentIdFromRes(res);
				}
			}
		}
		return {
			message : msg,
			success : isSuccess
		};
	}

	var HmiApi = {
		getFiles : getFiles,
		postFile : postFile,
		putFile : putFile,
		patchFile : patchFile,
		patchFiles : patchFiles,
		getFile : getFile,
		deleteFile : deleteFile,
		deleteFiles : deleteFiles,
		getDevicesForPolling : getDevicesForPolling,
		getControlPointDevices : getControlPointDevices,
		getFileIdFromRes : getFileIdFromRes,
		getComponents : getComponents,
		postComponent : postComponent,
		putComponent : putComponent,
		patchComponent : patchComponent,
		patchComponents : patchComponents,
		getComponent : getComponent,
		getComponentImages : getComponentImages,
		deleteComponent : deleteComponent,
		deleteComponents : deleteComponents,
		getComponentIdFromRes : getComponentIdFromRes,
		getUserSettings : getUserSettings,
		putUserSettings : putUserSettings,
		resCodeMsg : resCodeMsg
	};

	window.HmiApi = HmiApi;

	return HmiApi;
});
//# sourceURL=hmi/view-model/hmi-api.js
