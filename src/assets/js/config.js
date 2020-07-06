/**
*
*   <ul>
*       <li>bIoT 공용 설정, Kendo UI, MomentJS, RequierJS, mCustomScrollbar 등의 공용 라이브러리 설정 등을 수행한다.</li>
*       <li>window.GlobalSettings를 생성한다.</li>
*   </ul>
*   @module config
*   @requires lib/jquery
*   @requires lib/jquery.mCustomScrollbar
*   @requires lib/jquery.i18n.properties
*   @requires lib/kendo.all
*   @requires lib/moment
*
*
*/
(function(window, $){
	"use strict";

	var staticUrl = window.FRONT_MODE == "DEV" ? "static-dev" : "static";

	/*Require Settings*/
	window.require = {
		// 모듈의 기본 위치를 지정한다.
		baseUrl: '/front/' + staticUrl + '/js/app',

		// 모듈의 단축 경로 지정 또는 이름에 대한 별칭(Alias)을 지정할 수 있다.
		paths: {
			'domReady': '../lib/require-plugins/domReady', //plugins
			'json': '../lib/require-plugins/json',
			'text': '../lib/require-plugins/text',
			'lib': '../lib',                // "../../src/main/resources/static-dev/js/lib" 과 동일하다. baseUrl 기준,
			'templates': '../../../templates',
			'config': '../../../config',
			'jquery':'../lib/jquery.min.js',
			'kendo.core.min' : '../lib/kendo.all.min'
		},
		// AMD를 지원하지 않는 외부 라이브러리를 모듈로 사용할 수 있게 한다.
		shim: {
			'modernizr': { // Modernizr 라이브러리
				exports: 'Modernizr'
			}
		},

		// 모듈 위치 URL뒤에 덧붙여질 쿼리를 설정한다.
		// 개발 환경에서는 브라우저 캐시를 회피하기 위해 사용할 수 있고,
		// 실제 서비스 환경이라면 ts값을 배포한 시간으로 설정하여 새로 캐시하게 할 수 있다.
		urlArgs : 'ts=' + (new Date()).getTime()
	};

	/*Custom Scrollbar*/
	$.mCustomScrollbar.defaults.scrollButtons.enable = true;
	$.mCustomScrollbar.defaults.scrollInertia = 100;
	$.mCustomScrollbar.defaults.scrollbarPosition = "inside";
	$.mCustomScrollbar.defaults.mouseWheel.axis = "y";
	$.mCustomScrollbar.defaults.mouseWheel.enable = false;
	$.mCustomScrollbar.defaults.autoHideScrollbar = true;


	/**
	*
	*   <ul>
	*   <li>Settings 정보를 로드하여 설정 정보를 Local Storage에 저장하고, 해당 정보에 대한 Setter/Getter를 지원한다.</li>
	*   <li>properties.json 그리고 /foundation/settings/common, /foundation/settings/display 등의 API를 호출하여 설정 값을 저장한다.</li>
	*   <li>window.GlobalSettings로 모든 Scope에서 전역으로 유지된다.</li>
	*   </ul>
	*   @type {Object}
	*   @name GlobalSettings
	*   @alias module:config
	*
	*/
	window.GlobalSettings = (function(){
		var Cookie = window.Cookies;
		var settings;
		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.loadSettings()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>properties.json과 /foudnation/settings/common, /foundation/settings/display API를 호출하여 설정 정보를 가져오고, 해당 설정 값을 저장한다.</li>
		*   </ul>
		*
		*   @function loadSettings
		*   @returns {jQuery.Deferred} - jQuery.Deferred 객체. promise 상태로 리턴되어 Callback으로 체인할 수 있다.
		*   @alias module:config
		*
		*/
		//main.js에서 호춛룀.
		var loadSettings = function(isOnlyCommonSetting){
			var dfd = new $.Deferred();
			//set settings.json to localStorage via settings.json
			var propertiesConfig;
			var commonSettings = {};
			var displaySettings = {};
			$.ajax({
				url : "/front/config/properties.json"
			}).done(function(properties){
				propertiesConfig = properties;
			}).fail(function(){
				console.error("failed to load properties.json");
			}).always(function(){
				// var reqArr = [];
				// reqArr.push($.ajax({
				// 	url : "/foundation/settings/common"
				// }).done(function(common){
				// 	commonSettings = common;
				// }));
				//
				// if(!isOnlyCommonSetting){
				// 	reqArr.push($.ajax({
				// 		url : "/foundation/settings/display"
				// 	}).done(function(display){
				// 		displaySettings = display;
				// 	}));
				// }
				//
				// 	settings = $.extend({}, commonSettings, displaySettings, { properties : propertiesConfig });
				// 	_setSetting(settings);
				// 	_applySetting(settings);
				// 	_setI18N(propertiesConfig, settings.language, function(){
				// 		dfd.resolve(settings);
				// 	});
				// }).fail(function(xhq, status, e){
				// 	dfd.reject(xhq, status, e);
				// });

				$.ajax({
					url : "/foundation/settings/common"
				}).done(function(common) {
					commonSettings = common;
					settings = $.extend({}, commonSettings, { properties : propertiesConfig });
					_setI18N(propertiesConfig, settings.language, function() { // 프로퍼티 파일을 모두 로드한후 window.I18N 에 세팅 한 이후 콜백함수.
						if(!isOnlyCommonSetting) {
							$.ajax({
								url : "/foundation/settings/display"
							}).done(function(display) {
								displaySettings = display;
								settings = $.extend({}, commonSettings, displaySettings, { properties : propertiesConfig });
							}).fail(function(xhq, status, e) {
								settings = $.extend({}, commonSettings, { properties : propertiesConfig });
								dfd.reject(xhq, status, e);
							}).always(function() {
								_setSetting(settings);
								_applySetting(settings);
							});
						} else {
							settings = $.extend({}, commonSettings, { properties : propertiesConfig });
							_setSetting(settings);
							_applySetting(settings);
						}
						dfd.resolve(settings);
					});
				}).fail(function(xhq, status, e) {
					dfd.reject(xhq, status, e);
				});
			});
			return dfd.promise();
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings._setI18N()로, GlobalSettings 객체의 Private Member Method이다.</li>
		*   <li>설정된 Locale과 properties 파일 정보를 기반으로, 다국어 지원을 위하여 jquery.i18n.properties를 초기화한다.</li>
		*   </ul>
		*
		*   @function _setI18N
		*   @param {String} propertiesConfig - 불러올 프로퍼티 파일의 리스트
		*   @param {String} locale - 현재 설정된 Locale {"ko", "en"}
		*   @param {Function} callback - Properties 파일을 로딩하고, I18N 초기화가 완료되면 호출될 콜백 함수
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var _setI18N = function(propertiesConfig, locale, callback){
			var localePath = "locale";
			var propertiesNames;
			if(window.FRONT_MODE == "DEV"){
				localePath = "locale-dev";
				propertiesNames = propertiesConfig.properties;
			}else{
				localePath = "locale";
				propertiesNames = propertiesConfig.concat;
			}

			try{
				$.i18n.properties({
					name: propertiesNames,
					path: '/front/config/' + localePath + '/',
					mode: 'both',
					language: locale,
					async: true,
					callback: callback
				});
			}catch(e){
				console.error(e);
				callback();
			}
			window.I18N = $.i18n;
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings._setSetting()로, GlobalSettings 객체의 Private Member Method이다.</li>
		*   <li>서버로부터 얻어온 Settings JSON 데이터를 String으로 파싱하여 LocalStorage에 저장한다.</li>
		*   </ul>
		*
		*   @function _setSetting
		*   @param {Object} data - 서버로부터 응답된 Settings 정보 객체
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var _setSetting = function(data){
			settings = data;
			localStorage.setItem("settings", JSON.stringify(data));
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings._applySetting()로, GlobalSettings 객체의 Private Member Method이다.</li>
		*   <li>Locale 정보, Time Display, Time Zone 정보를 설정한다.</li>
		*   </ul>
		*
		*   @function _applySetting
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var _applySetting = function(){
			var locale = settings.language;
			var model = settings.model;
			_setLocale(locale);
			_setTimeDisplay(locale, settings.timeNotation);
			_setTimezone(settings.timeZone);
			_setModel(model);
		};

		//Language
		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings._setLocale()로, GlobalSettings 객체의 Private Member Method이다.</li>
		*   <li>쿠키 및 Kendo UI, moment js에 Locale 정보를 설정한다.</li>
		*   </ul>
		*
		*   @function _setLocale
		*   @param {String} locale - 현재 설정된 Locale 값
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var _setLocale = function(locale){
			Cookie.set("locale", locale, {expires : 730});
			_setKendoLocale(locale);
			_setMomentLocale(locale);
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.setLocale()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>쿠키에 Locale 정보를 설정한다.</li>
		*   </ul>
		*
		*   @function setLocale
		*   @param {String} locale - 현재 설정할 Locale 값
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var setLocale = function(locale){
			if(settings){
				settings.language = locale;
			}else{
				console.error("there is no settings obj.");
			}
			Cookie.set("locale", locale, {expires : 730});
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.getLocale()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>쿠키로 부터 현재 Locale 정보를 가져온다.</li>
		*   </ul>
		*
		*   @function getLocale
		*   @returns {String} - 현재 설정된 Locale 값
		*   @alias module:config
		*
		*/
		var getLocale = function(){
			if(settings){
				return settings.language;
			}
			console.error("there is no settings obj.");
			return Cookie.get("locale");
		};

		//var _setDefault

		//Default Locale "en"
		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings._setKendoLocale()로, GlobalSettings 객체의 Private Member Method이다.</li>
		*   <li>Kendo UI의 Locale 정보를 설정한다.</li>
		*   </ul>
		*
		*   @function _setKendoLocale
		*   @param {String} locale - 현재 설정할 Locale 값
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var _setKendoLocale = function(locale){
			var kendo = window.kendo;
			//월요일이 1주의 첫요일
			if(kendo.cultures[locale]) kendo.cultures[locale].calendars.standard.firstDay = 1;
			kendo.culture(locale);
		};

		//Default Locale "en"
		//Default TimeZone "Asia/Seoul"
		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings._setMomentLocale()로, GlobalSettings 객체의 Private Member Method이다.</li>
		*   <li>MomentJS의 Locale과 Timezone 정보를 설정한다.</li>
		*   </ul>
		*
		*   @function _setMomentLocale
		*   @param {String} locale - 현재 설정할 Locale 값
		*   @param {String} timeZone - 현재 설정할 Timezone 값
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var _setMomentLocale = function(locale, timeZone){
			var moment = window.moment;
			if(!moment){
				console.error("moment.js not found.");
			}
			moment.locale(locale);
			if(timeZone){
				moment.tz.setDefault(timeZone);
			}
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.getTimezone()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>현재 설정된 Timezone 정보를 가져온다</li>
		*   </ul>
		*
		*   @function getTimezone
		*   @returns {String} - 현재 설정된 Timezone 값 (Default : "Asia/Seoul")
		*   @alias module:config
		*
		*/
		var getTimezone = function(){
			if(settings){
				return settings.timeZone;
			}
			console.error("there is no settings obj.");
		};
		//Deprecated
		var setTimezone = function(timezone){
			if(settings){
				settings.timeZone = timezone;
			}else{
				console.error("there is no setitings obj.");
			}
		};
		//Deprecated
		var _setTimezone = function(timezone){
			_setMomentTimezone(timezone);
			_setKendoSchedulerTimezone(timezone);
		};
		//Deprecated
		var _setMomentTimezone = function(timezone){
			var moment = window.moment;
			timezone = timezone.replace(/ /g, "_");
			if(!moment){
				console.error("moment.js not found.");
			}
			moment.tz.setDefault(timezone);
		};
		//Deprecated
		var _setKendoSchedulerTimezone = function(timezone){
			var kendo = window.kendo;
			var KendoScheduler = kendo.ui.Scheduler.extend({
				options : {
					name : "Scheduler",
					timezone : timezone
				}
			});
			kendo.ui.plugin(KendoScheduler);
		};
		//Deprecated
		var setWeather = function(obj){ //params : { country:"", city :""}
			if(settings){
				//$.extend(settings.common.weather, obj);
				settings.weather = obj;
			}else{
				console.error("there is no settings obj.");
			}
		};
		//Deprecated
		var getWeather = function(){
			if(settings){
				return settings.weather;
			}
			console.error("there is no settings obj.");
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.setTemperature()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>온도 단위 정보를 설정한다.</li>
		*   </ul>
		*
		*   @function setTemperature
		*   @param {String} temperature - 설정할 온도 단위 값 {Celsius, Fahrenheit}
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var setTemperature = function(temperature){
			if(settings){
				settings.temperature = temperature;
			}else{
				console.error("there is no settings obj.");
			}
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.getTemperature()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>현재 설정된 온도 단위 정보를 가져온다</li>
		*   </ul>
		*
		*   @function getTemperature
		*   @returns {String} - 현재 설정된 온도 단위 값 {Celsius, Fahrenheit}
		*   @alias module:config
		*
		*/
		var getTemperature = function(){
			if(settings){
				return settings.temperature;
			}
			console.error("there is no settings obj.");
		};
		//deprecated
		var setPurposeOfFacility = function(purpose){
			if(settings){
				settings.purposeOfFacility = purpose;
			}else{
				console.error("there is no settings obj.");
			}
		};
		//deprecated
		var getPurposeOfFacility = function(){
			if(settings){
				return settings.purposeOfFacility;
			}
			console.error("there is no settings obj.");
		};

		var _setTimeDisplay = function(locale, display){
			_setMomentTimeDisplay(locale, display);
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.setTimeDisplay()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>시간 표시 형식을 설정한다.</li>
		*   </ul>
		*
		*   @function setTimeDisplay
		*   @param {String} display - 설정할 시간 표시 형식 값 {"24Hour", "12Hour"}
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var setTimeDisplay = function(display){ //HH or hh ?
			if(settings){
				settings.timeNotation = display;
			}else{
				console.error("there is no settings obj.");
			}
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.getTimeDisplay()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>현재 설정된 시간 표시 형식 정보를 가져온다</li>
		*   </ul>
		*
		*   @function getTimeDisplay
		*   @returns {String} - 현재 설정된 시간 표시 형식 값 {"24Hour", "12Hour"}
		*   @alias module:config
		*
		*/
		var getTimeDisplay = function(){
			if(settings){
				return settings.timeNotation;
			}
			console.error("there is no settings obj.");
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings._setMomentTimeDisplay()로, GlobalSettings 객체의 Private Member Method이다.</li>
		*   <li>Moment JS의 Locale과 시간 표시 형식을 설정한다.</li>
		*   </ul>
		*
		*   @function _setMomentTimeDisplay
		*   @param {String} locale - 설정할 Locale
		*   @param {String} display - 설정할 시간 표시 형식 값 {"24Hour", "12Hour"}
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var _setMomentTimeDisplay = function(locale, display){ //HH hh
			var moment = window.moment;
			if(!moment){
				console.error("moment.js not found.");
			}

			var displayFormat = "HH:mm";
			//if(display == "HH"){    //24Hours
			if(display == "24Hour"){    //24Hours
				displayFormat = "HH:mm";
			}else{  //AM, PM
				displayFormat = "A hh:mm";
			}

			moment.updateLocale(locale, {
				longDateFormat: {
					LT: "HH:mm",
					LTS: "HH:mm:ss",
					L: "YYYY.MM.DD",
					LL: "YYYY.MMMM.DD",
					LLL: "YYYY.MM.DD " + displayFormat,
					LLLL: "YYYY.MM.DD dddd " + displayFormat
				}
			});
		};

		//Deprecated
		var setPageSize = function(pageSize){
			if(settings){
				settings.numOfItemsPerPage = pageSize;
			}else{
				console.error("there is no settings obj.");
			}
		};
		//Deprecated
		var getPageSize = function(){
			if(settings){
				return settings.numOfItemsPerPage;
			}
			console.error("there is no settings obj.");
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.setDefaultViewType()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>메뉴 별 기본 뷰 타입을 설정한다.</li>
		*   </ul>
		*
		*   @function setDefaultViewType
		*   @param {Array} defaultViews - 메뉴 별 Default View 정보 리스트
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var setDefaultViewType = function(defaultViews){
			if(settings){
				var defaultViewType = settings.defaultView;
				var i, j, length = defaultViewType.length, max = defaultViews.length;
				var settingView;
				for( i = 0; i < max; i++ ){
					settingView = defaultViews[i];
					for( j = 0; j < length; j++ ){
						if(settingView.menu == defaultViewType[j].menu){
							$.extend(defaultViewType[j], settingView);
							break;
						}
					}
				}
			}else{
				console.error("there is no settings obj.");
			}
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.getDefaultViewType()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>현재 설정된 메뉴 별 Default View Type 정보 리스트를 가져온다</li>
		*   </ul>
		*
		*   @function getDefaultViewType
		*   @returns {Array} - 현재 설정된 Default View Type 정보 리스트
		*   @alias module:config
		*
		*/
		var getDefaultViewType = function(){
			if(settings){
				return settings.defaultView;
			}
			console.error("there is no settings obj.");
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.getDeviceTypeOrdering()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>기기 타입 리스트를 설정된 순서대로 가져온다</li>
		*   </ul>
		*
		*   @function getDeviceTypeOrdering
		*   @returns {Array} - 순서가 설정된 기기 타입 리스트
		*   @alias module:config
		*
		*/
		var getDeviceTypeOrdering = function(){
			if(settings){
				return settings.deviceTabSortOrder;
			}
			console.error("there is no settings obj.");
		};

		/**
		*
		*   <ul>
		*   <li style='color:red;'>GlobalSettings.setDeviceTypeOrdering()로, GlobalSettings 객체의 Public Member Method이다.</li>
		*   <li>기기 타입의 순서를 리스트로 설정한다.</li>
		*   </ul>
		*
		*   @function setDeviceTypeOrdering
		*   @param {Array} orderedArray - 순서가 설정된 기기 타입 리스트
		*   @returns {void} - 리턴 값 없음
		*   @alias module:config
		*
		*/
		var setDeviceTypeOrdering = function(orderedArray){
			if(settings){
				settings.deviceTabSortOrder = orderedArray;
			}else{
				console.error("there is no settings obj.");
			}
		};

		//Deprecated
		var apply = function(){
			if(!settings){
				console.error("there is no loaded settings object.");
				return;
			}
			localStorage.setItem("settings", JSON.stringify(settings));
		};

		//Deprecated
		// function loadScript(url, callback) {
		//     var scriptEl = document.createElement('script');
		//     scriptEl.type = 'text/javascript';
		//     // IE에서는 onreadystatechange를 사용
		//     scriptEl.onload = function () {
		//         callback();
		//     };
		//     scriptEl.src = url;
		//         document.getElementsByTagName('body')[0].appendChild(scriptEl);
		// }

		// b.IoT 바이너리의 모델을 정의한다.
		var _setModel = function(model){
			if(settings) {
				if (model === "Lite") {
					settings.model = "Lite";
				} else {
					settings.model = "Enterprise";
				}
			} else {
				console.error("there is no settings obj.");
			}
		};

		// b.IoT 바이너리의 모델을 반환한다. - Enterprise, Lite
		var getModel = function(){
			if(settings) {
				return settings.model;
			}
			console.error("there is no settings obj.");
		};

		return {
			loadSettings : loadSettings,
			getLocale : getLocale,
			setLocale : setLocale,
			setTimezone : setTimezone,
			getTimezone : getTimezone,
			setTimeDisplay : setTimeDisplay,
			getTimeDisplay : getTimeDisplay,
			setWeather : setWeather,
			getWeather : getWeather,
			setTemperature : setTemperature,
			getTemperature : getTemperature,
			getPageSize : getPageSize,
			setPageSize : setPageSize,
			setPurposeOfFacility : setPurposeOfFacility,
			getPurposeOfFacility : getPurposeOfFacility,
			setDefaultViewType : setDefaultViewType,
			getDefaultViewType : getDefaultViewType,
			setDeviceTypeOrdering : setDeviceTypeOrdering,
			getDeviceTypeOrdering : getDeviceTypeOrdering,
			apply : apply,
			getModel: getModel
		};

	}());

})(window, jQuery);