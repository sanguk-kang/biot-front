/*
 *	Space에서 사용될 API 목록
 *	단일 ajax 또는 배열 ajax를 리턴
 */
define('controlareasettings/building/config/space-api', [], function() {
	'use strict';

	/**
	 *	<ul>
	 *		<li>ajax 요청 시 필요한 옵션 세팅 함수</li>
	 *	</ul>
	 *	@function ajaxOptions
	 *	@param {String} url - 요청할 url
	 *	@param {String} method - 요청할 method
	 *	@param {Object} data - 요청할 data
	 *	@param {Object} params - 그 외 옵션
	 *	@returns {Object} ajaxOptions
	 */
	var ajaxOptions = function (url, method, data, params) {
		var key;
		var options = {
			url: url,
			method: method
		};
		if(data !== null && typeof data !== 'undefined') {
			options.data = data;
		}
		for(key in params) {
			options[key] = params[key];
		}
		return options;
	};

	/**
	 *	<ul>
	 *		<li>Ajax 요청 함수</li>
	 *	</ul>
	 *	@function getAjax
	 *	@param {String} url - 요청할 url
	 *	@param {String} method - 요청할 method
	 *	@param {Object} data - 요청할 data
	 *	@param {Object} params - 그 외 옵션
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var getAjax = function (url, method, data, params) {
		if(data !== null && typeof data !== 'undefined' && data.length === 0) return [];
		return $.ajax(ajaxOptions(url, method, data, params));
	};

	/**
	 *	<ul>
	 *		<li>GET 요청 시 url에 query string 붙이는 함수</li>
	 *	</ul>
	 *	@function getUrl
	 *	@param {String} url - 요청할 url
	 *	@param {Object} params - 생성할 query string들의 key - value를 갖는 Object
	 *	@returns {String} 완성된 url과 query string
	 */
	var getUrl = function (url, params) {
		var i, key, param;
		for (key in params) {
			param = params[key];
			url += key + '=' + param[0];
			for (i = 1; i < param.length; i++) {
				url += ',' + param[i];
			}
			url += '&';
		}
		if (url.lastIndexOf('&') === url.length - 1) {
			url = url.slice(0, -1);
		}
		return url;
	};

	/**
	 *	<ul>
	 *		<li>삭제할 데이터(id)들의 ajax를 요청하는 함수</li>
	 *	</ul>
	 *	@function getDeleteDeferreds
	 *	@param {String} url - 요청할 url
	 *	@param {Array} deletedData - 삭제 요청할 data, id가 필수 포함 되어야 한다
	 *	@returns {Array} jQuery Deferred가 포함된 Array
	 */
	var getDeleteDeferreds = function (url, deletedData) {
		var deferreds = [], i;
		for(i = 0; i < deletedData.length; i++) {
			deferreds.push(getAjax(url + deletedData[i].id, 'DELETE'));
		}
		return deferreds;
	};

	/**
	 *	<ul>
	 *		<li>기존 데이터의 key에 해당하는 value를 새로운 데이터에 복사</li>
	 *		<li>key에 해당하는 value가 없을 경우 defaultValue로 저장</li>
	 *	</ul>
	 *	@function insertDataWithNullCheck
	 *	@param {Object} orgData - 기존 데이터
	 *	@param {Object} newData - 새로운 데이터
	 *	@param {String} key - 복사할 key
	 *	@param {Object} defaultValue - key에 해당하는 기본값
	 *	@returns {Object} 없음
	 */
	var insertDataWithNullCheck = function (orgData, newData, key, defaultValue) {
		if(orgData[key] !== null && typeof orgData[key] !== 'undefined') {
			newData[key] = orgData[key];
			return;
		}
		if(defaultValue !== null && typeof defaultValue !== 'undefined') {
			newData[key] = defaultValue;
		}
	};

	/**
	 *	<ul>
	 *		<li>insertDataWithNullCheck를 반복적으로 동작하는 함수</li>
	 *		<li>params[key].isContains 값에 따라 데이터를 추가한다</li>
	 *	</ul>
	 *	@function insertDataForManyKeys
	 *	@param {Object} orgData - 기존 데이터
	 *	@param {Object} newData - 새로운 데이터
	 *	@param {Object} params - isContains, defaultValue 정보
	 *	@returns {Object} 없음
	 */
	var insertDataForManyKeys = function (orgData, newData, params) {
		var key;
		for(key in params) {
			if(params[key].isContains) {
				insertDataWithNullCheck(orgData, newData, key, params[key].defaultValue);
			}
		}
	};

	/**
	 *	<ul>
	 *		<li>ajax에 요청할 데이터를 가공하는 함수(zone)</li>
	 *	</ul>
	 *	@function getZoneRequestBodyData
	 *	@param {Object} orgData - 기존 데이터
	 *	@param {boolean} isContainsId - id 포함 여부
	 *	@returns {Object} 새로 생성된 데이터
	 */
	var getZoneRequestBodyData = function (orgData, isContainsId) {
		var data = {};
		insertDataForManyKeys(orgData, data, {
			id: {isContains: isContainsId},
			name: {isContains: true},
			nameDisplayCoordinate: {isContains: true},
			description: {isContains: true, defaultValue: ''},
			foundation_space_floors_id: {isContains: true},
			foundation_space_zoneTypes_id: {isContains: true},
			maxOccupancy: {isContains: true, defaultValue: 0},
			sortOrder: {isContains: true},
			geometry: {isContains: true},
			backgroundColor: {isContains: true}
		});
		return data;
	};

	/**
	 *	<ul>
	 *		<li>ajax에 요청할 데이터를 가공하는 함수(building)</li>
	 *	</ul>
	 *	@function getBuildingRequestBodyData
	 *	@param {Object} orgData - 기존 데이터
	 *	@param {boolean} isContainsId - id 포함 여부
	 *	@returns {Object} 새로 생성된 데이터
	 */
	var getBuildingRequestBodyData = function (orgData, isContainsId) {
		var data = {};
		insertDataForManyKeys(orgData, data, {
			id: {isContains: isContainsId},
			name: {isContains: true},
			description: {isContains: true, defaultValue: ''},
			maxOccupancy: {isContains: true, defaultValue: 0},
			sortOrder: {isContains: true}
		});
		return data;
	};

	/**
	 *	<ul>
	 *		<li>ajax에 요청할 데이터를 가공하는 함수(floor)</li>
	 *	</ul>
	 *	@function getFloorRequestBodyData
	 *	@param {Object} orgData - 기존 데이터
	 *	@param {boolean} isContainsId - id 포함 여부
	 *	@returns {Object} 새로 생성된 데이터
	 */
	var getFloorRequestBodyData = function (orgData, isContainsId) {
		var data = {};
		insertDataForManyKeys(orgData, data, {
			id: {isContains: isContainsId},
			type: {isContains: true},
			name: {isContains: true},
			description: {isContains: true, defaultValue: ''},
			foundation_space_buildings_id: {isContains: true},
			length: {isContains: true, defaultValue: 0},
			width: {isContains: true, defaultValue: 0},
			maxOccupancy: {isContains: true, defaultValue: 0},
			sortOrder: {isContains: true}
		});
		return data;
	};

	/**
	 *	<ul>
	 *		<li>Zone GET 요청 함수</li>
	 *	</ul>
	 *	@function spaceZonesGET
	 *	@param {Object} params - query string
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceZonesGET = function (params) {
		return getAjax(getUrl('/foundation/space/zones?', params), 'GET', null, false);
	};

	/**
	 *	<ul>
	 *		<li>Zone POST 요청 함수</li>
	 *	</ul>
	 *	@function spaceZonesPOST
	 *	@param {Array} postData - body에 담길 데이터
	 *	@returns {Array} jQuery Deferred가 포함된 Array
	 */
	var spaceZonesPOST = function (postData) {
		var deferreds = [], i, data;
		for (i = 0; i < postData.length; i++) {
			data = getZoneRequestBodyData(postData[i]);
			deferreds.push(getAjax('/foundation/space/zones', 'POST', data));
		}
		return deferreds;
	};

	/**
	 *	<ul>
	 *		<li>Zone PATCH 요청 함수</li>
	 *	</ul>
	 *	@function spaceZonesPATCH
	 *	@param {Array} patchData - body에 담길 데이터
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceZonesPATCH = function (patchData) {
		var i, data = [], tmp;
		for(i = 0; i < patchData.length; i++) {
			tmp = getZoneRequestBodyData(patchData[i], true);
			data.push(tmp);
		}
		return getAjax('/foundation/space/zones', 'PATCH', data);
	};

	/**
	 *	<ul>
	 *		<li>Zone DELETE 요청 함수</li>
	 *	</ul>
	 *	@function spaceZonesDELETE
	 *	@param {Array} deletedData - 지울 zone의 id가 담긴 데이터
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceZonesDELETE = function (deletedData) {
		return getDeleteDeferreds('/foundation/space/zones/', deletedData);
	};

	/**
	 *	<ul>
	 *		<li>Floor GET 요청 함수</li>
	 *	</ul>
	 *	@function spaceFloorsGET
	 *	@param {Object} params - query string
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceFloorsGET = function (params) {
		return getAjax(getUrl('/foundation/space/floors?', params), 'GET');
	};

	/**
	 *	<ul>
	 *		<li>Floor POST 요청 함수</li>
	 *		<li>image가 포함된 경우 form data로, 없는 경우 보통 POST 요청을 한다.</li>
	 *	</ul>
	 *	@function spaceFloorsPOST
	 *	@param {Array} postData - body에 담길 데이터
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceFloorsPOST = function (postData) {
		var i, data = [], isFormData = false, formData = new FormData();
		var images = {}, key;
		for(i = 0; i < postData.length; i++) {
			data.push(getFloorRequestBodyData(postData[i]));
			if(postData[i].image) {
				isFormData = true;
				//images[dataIndex]로 image를 따로 요청
				images['images[' + i + ']'] = postData[i].image;
			}
		}
		//image가 포함된 경우 form data 형식으로 보낸다
		if(isFormData) {
			formData.append('data', JSON.stringify(data));
			for(key in images) {
				formData.append(key, images[key]);
			}
			return getAjax('/foundation/space/floors', 'POST', formData, {isFileUpload: true});
		}
		return getAjax('/foundation/space/floors', 'POST', data);
	};

	/**
	 *	<ul>
	 *		<li>Floor PATCH 요청 함수</li>
	 *		<li>POST와는 다르게 image 정보는 담지 않고, spaceFloorsImagePOST를 통해 요청한다.</li>
	 *	</ul>
	 *	@function spaceFloorsPATCH
	 *	@param {Array} patchData - body에 담길 데이터
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceFloorsPATCH = function (patchData) {
		var i, data = [];
		for(i = 0; i < patchData.length; i++) {
			data.push(getFloorRequestBodyData(patchData[i], true));
		}
		return getAjax('/foundation/space/floors', 'PATCH', data);
	};

	/**
	 *	<ul>
	 *		<li>Floor DELETE 요청 함수</li>
	 *		<li>spaceFloorsImageDELETE를 따로 요청하지 않는다.</li>
	 *	</ul>
	 *	@function spaceFloorsDELETE
	 *	@param {Array} deletedData - 지울 zone의 id가 담긴 데이터
	 *	@returns {Array} jQuery Deferred가 포함된 Array
	 */
	var spaceFloorsDELETE = function (deletedData) {
		return getDeleteDeferreds('/foundation/space/floors/', deletedData);
	};

	/**
	 *	<ul>
	 *		<li>Floor Image POST 요청 함수</li>
	 *		<li>image가 포함되어 있으므로 form data로 요청</li>
	 *		<li>spaceFloorsPATCH에 담기지 않는 image를 update할 때 호출한다.</li>
	 *	</ul>
	 *	@function spaceFloorsImagePOST
	 *	@param {Array} postData - body에 담길 데이터
	 *	@returns {Array} jQuery Deferred가 포함된 Array
	 */
	var spaceFloorsImagePOST = function (postData) {
		var deferreds = [], i, data;
		for(i = 0; i < postData.length; i++) {
			data = new FormData();
			data.append('image', postData[i].image);
			deferreds.push(getAjax('/foundation/space/floors/' + postData[i].id + '/image', 'POST', data, {isFileUpload: true}));
		}
		return deferreds;
	};

	/**
	 *	<ul>
	 *		<li>Floor Image DELETE 요청 함수</li>
	 *		<li>Floor 전체 데이터는 유지하고, image만 삭제할 때 호출한다.</li>
	 *	</ul>
	 *	@function spaceFloorsImageDELETE
	 *	@param {Array} deletedData - 지울 zone의 id가 담긴 데이터
	 *	@returns {Array} jQuery Deferred가 포함된 Array
	 */
	var spaceFloorsImageDELETE = function (deletedData) {
		var deferreds = [], i;
		for(i = 0; i < deletedData.length; i++) {
			deferreds.push(getAjax('/foundation/space/floors/' + deletedData[i].id + '/image', 'DELETE'));
		}
		return deferreds;
	};

	/**
	 *	<ul>
	 *		<li>Building GET 요청 함수</li>
	 *	</ul>
	 *	@function spaceBuildingsGET
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceBuildingsGET = function () {
		return getAjax('/foundation/space/buildings', 'GET');
	};

	/**
	 *	<ul>
	 *		<li>Building POST 요청 함수</li>
	 *	</ul>
	 *	@function spaceBuildingsPOST
	 *	@param {Array} postData - body에 담길 데이터
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceBuildingsPOST = function (postData) {
		var i, data = [];
		for(i = 0; i < postData.length; i++) {
			data.push(getBuildingRequestBodyData(postData[i]));
		}
		return getAjax('/foundation/space/buildings', 'POST', data);
	};

	/**
	 *	<ul>
	 *		<li>Building PATCH 요청 함수</li>
	 *	</ul>
	 *	@function spaceBuildingsPATCH
	 *	@param {Array} patchData - body에 담길 데이터
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var spaceBuildingsPATCH = function (patchData) {
		var i, data = [];
		for(i = 0; i < patchData.length; i++) {
			data.push(getBuildingRequestBodyData(patchData[i], true));
		}
		return getAjax('/foundation/space/buildings', 'PATCH', data);
	};

	/**
	 *	<ul>
	 *		<li>Building DELETE 요청 함수</li>
	 *	</ul>
	 *	@function spaceBuildingsDELETE
	 *	@param {Array} deletedData - 지울 zone의 id가 담긴 데이터
	 *	@returns {Array} jQuery Deferred가 포함된 Array
	 */
	var spaceBuildingsDELETE = function (deletedData) {
		return getDeleteDeferreds('/foundation/space/buildings/', deletedData);
	};

	/**
	 *	<ul>
	 *		<li>Device GET 요청 함수</li>
	 *	</ul>
	 *	@function dmsDevicesGET
	 *	@param {Objcet} params - query string
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var dmsDevicesGET = function (params) {
		return getAjax(getUrl('/dms/devices?', params) ,'GET');
	};

	/**
	 *	<ul>
	 *		<li>Device PATCH 요청 함수</li>
	 *	</ul>
	 *	@function dmsDevicesPATCH
	 *	@param {Array} patchData - body에 담길 데이터
	 *	@returns {Object} jQuery Deferred 객체(ajax)
	 */
	var dmsDevicesPATCH = function (patchData) {
		return getAjax('/dms/devices', 'PATCH', patchData);
	};

	return {
		spaceZonesGET: spaceZonesGET,
		spaceZonesPOST: spaceZonesPOST,
		spaceZonesPATCH: spaceZonesPATCH,
		spaceZonesDELETE: spaceZonesDELETE,
		spaceFloorsGET: spaceFloorsGET,
		spaceFloorsPOST: spaceFloorsPOST,
		spaceFloorsPATCH: spaceFloorsPATCH,
		spaceFloorsDELETE: spaceFloorsDELETE,
		spaceFloorsImagePOST: spaceFloorsImagePOST,
		spaceFloorsImageDELETE: spaceFloorsImageDELETE,
		spaceBuildingsGET: spaceBuildingsGET,
		spaceBuildingsPOST: spaceBuildingsPOST,
		spaceBuildingsPATCH: spaceBuildingsPATCH,
		spaceBuildingsDELETE: spaceBuildingsDELETE,
		dmsDevicesGET: dmsDevicesGET,
		dmsDevicesPATCH: dmsDevicesPATCH
	};
});

//# sourceURL=controlareasettings/config/space-api.js