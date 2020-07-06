/**
*
*   <ul>
*       <li>기본 jQuery $.ajax를 오버라이딩한다.</li>
*       <li>jQuery를 전역으로 로딩하므로 jQuery.ajax 사용을 위해 RequireJS 대신 전역으로 오버라이딩한다.</li>
*   </ul>
*   @module app/core/ajax
*   @requires lib/xssFilter
*   @requires app/core/session
*
*
*/
(function(window, $){
	var XssFilter = window.xssFilter;
	var xssFilter = new XssFilter();
	// var xssFilter = new window.xssFilter();

	var Session = window.Session;
	var authToken = Session.getAuthToken();

	var DEFAULT_ACCEPT_TYPE = "application/vnd.samsung.biot.v1+json";
	var PAGENATION_ACCEPT_TYPE = "application/vnd.samsung.biot.v1.page+json";
	// var JSON_CONTENT_TYPE = "application/vnd.samsung.quaduron.v1+json";
	// var MULTIPART_CONTENT_TYPE = "multipart/form-data";

	var defaultAjax = $.ajax;

	/**
	*
	*   xssFilter 라이브러리를 통하여 XSS 공격을 방어하기 위하여 서버에서 치환된 문자열을 재치환한다.
	*
	*   @function reXssFilter
	*   @param {String} data - Ajax하여 서버로부터 응답된 Raw Text 데이터
	*   @param {String} type - Ajax하여 서버로부터 응답된 Raw 데이터의 타입 (text, binary). 이미지일 경우 binary이다.
	*   @returns {String} - 치환된 문자열을 재치환한 Raw Text Data
	*   @alias module:app/core/ajax
	*
	*/
	var reXssFilter = function(data, type){
		if(data && type != "binary"){
			//JSON Parse가 수행되기 전의 raw data로 \ 는 \\ 로 치환해주어야한다.
			data = data.replace(/&amp;/g, "&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#x2F;/g, "/").replace(/&#x5C;/g, "\\\\");
		}
		return data;
	};

	$.ajax = function(options){
		if(!options){
			options = {};
		}

		if(!options.headers){
			options.headers = {};
		}

		if(!options.headers.Accept || options.headers.Accept == "*/*"){
			options.headers.Accept = DEFAULT_ACCEPT_TYPE;
		}

		if(!options.headers.Authorization && authToken){
			options.headers.Authorization = "Bearer " + Session.getAuthToken();
		}

		if(!options.headers["b.IoT-Version"] && window.BUILD_DATE){
			options.headers["b.IoT-Version"] = window.BUILD_DATE;
		}

		if(!options.contentType || options.contentType == "application/json"){
			if(!options.isFileUpload){
				options.contentType = DEFAULT_ACCEPT_TYPE;
			}
		}

		if(!options.method){
			options.method = "GET";
		}

		if(options.method == "GET"){
			if(options.data
			   && (options.data.page || options.data.size)
			   && (options.pagenation != false)){
				options.headers.Accept = PAGENATION_ACCEPT_TYPE;
			}
			if(options.url
			   && (options.url.indexOf("page=") != -1
			   || options.url.indexOf("size=") != -1)
			   && (options.pagenation != false)){
				options.headers.Accept = PAGENATION_ACCEPT_TYPE;
			}

			if(options.dataType == "base64" || options.isImage){
				options.dataType = "text";
			}

			if(options.dataType == "binary"){
				options.processData = false;
			}

		}else if(options.data){
			if($.isPlainObject(options.data) || $.isArray(options.data)){
				options.data = JSON.stringify(options.data);
			}

			if(typeof options.data == "string"){
				options.data = xssFilter.filter(options.data);
			}

			if(options.isFileUpload){
				options.processData = false;
				options.contentType = false;
				options.cache = false;
			}
		}

		//XSS 필터 역치환 추가
		options.dataFilter = reXssFilter;

		return defaultAjax(options);

		/*return defaultAjax(options).fail(function(xhq){
			if(globalMessageDialogProcess(xhq)){
				//throw("Global Ajax Exception : "+xhq.responseText);
				return {};
			}
		});*/
	};

	//후처리 전역 Callback
	//$( window.document ).ajaxError(function( event, jqxhr, settings, thrownError ) {
	//console.info(arguments);
	//if(jqxhr.status == "401"){
	//토큰 값 삭제
	//Session.clearToken();
	//토큰 만료 또는 인증 실패 Popup 출력 및 로그인 화면으로 이동
	//console.error("UNAUTHORIZED RESPONSE");
	//}
	//});

	// use this transport for "binary" data type
	$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
		// check for conditions and support for blob / arraybuffer response type
		if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof window.ArrayBuffer) || (window.Blob && options.data instanceof Blob))))){
			return {
				// create new XMLHttpRequest
				send: function(headers, callback){
					// setup all variables
					var xhr = new XMLHttpRequest();
					var url = options.url, type = options.type;
					var async = options.async || true;
					// blob or arraybuffer. Default is blob
					var dataType = options.responseType || "blob",
						data = options.data || null,
						username = options.username || null,
						password = options.password || null;

					xhr.addEventListener('load', function(){
						var obj = {};
						obj[options.dataType] = xhr.response;
						// make callback and send obj
						var status = xhr.status;
						//Error 처리. Blob 객체로 응답되므로 Blob 객체를 다시 변환하여 메시지를 파싱한다.
						if(status >= 400){
							var fileReader = new FileReader();
							fileReader.onload = function(e){
								var result = e.target.result;
								jqXHR.responseText = result;
								try{
									jqXHR.responseJSON = JSON.parse(result);
								}catch(err){
									console.error(err);
								}
								callback(xhr.status, xhr.statusText, obj, xhr.getAllResponseHeaders());
							};
							fileReader.readAsText(xhr.response);
						}else{
							callback(xhr.status, xhr.statusText, obj, xhr.getAllResponseHeaders());
						}
					});

					xhr.open(type, url, async, username, password);

					// setup custom headers
					for (var i in headers ) {
						xhr.setRequestHeader(i, headers[i] );
					}

					xhr.responseType = dataType;
					xhr.send(data);
				},
				abort: function(){
					jqXHR.abort();
				}
			};
		}
	});
	/*전역 처리*/
	/*$.ajaxSetup({
	});*/

	/**
	*
	*   401 Unauthorized 응답등에 대한 전역 처리를 위하여 현재 Open 된 Document 내 모든 공용 Dialog를 Close 한다.
	*
	*   @function closeAllMsgDialog
	*   @returns {void} - 없음
	*   @alias module:app/core/ajax
	*
	*/
	function closeAllMsgDialog(){
		$(".k-dialog.pop-confirm [data-role='commondialog']").each(function(){
			var d = $(this).data("kendoCommonDialog");
			if(d && d.options.type == "message"){
				d.close();
			}
		});
	}

	/**
	*
	*   401 Unauthorized 응답등에 대한 전역 처리를 위하여 공용 Dialog를 생성한다.
	*
	*   @function createGlobalMessageDialog
	*   @param {String} msg - 메시지 Dialog에 표시할 Text
	*   @returns {kendojQueryWidget} - kendoCommonDialog 인스턴스를 리턴한다.
	*   @alias module:app/core/ajax
	*   @requires config
	*
	*/
	function createGlobalMessageDialog(msg){
		var I18N = window.I18N;
		var dialog = $("<div/>").kendoCommonDialog({
			timeout : 0,
			action : [{
				text : I18N.prop("COMMON_BTN_OK"),
				action : function(e){
					e.sender.destroy();
					e.sender.element.remove();
				}
			}]
		}).data("kendoCommonDialog");
		dialog.message(msg);
		//Close All Dialog
		closeAllMsgDialog();
		return dialog;
	}

	/**
	*
	*   <ul>
	*   <li>AJAX로 응답된 Raw Text 데이터를 체크하여 권한 없음, 토큰 만료, 유효하지 않은 토큰 등으로 응답받을 경우</li>
	*   <li>전역으로 해당 Case에 대한 메시지 Dialog를 팝업하고, 강제 로그아웃한다.</li>
	*   </ul>
	*   @function globalMessageDialogProcess
	*   @param {jQueryXHRObject} jqxhr - jQuery Ajax 응답 객체
	*   @returns {Boolean} - 로그인유지/로그아웃 액션에 대한 플래그
	*   @alias module:app/core/ajax
	*   @requires config
	*
	*/
	function globalMessageDialogProcess(jqxhr){
		if(jqxhr && jqxhr.responseText){
			var I18N = window.I18N;
			var util = window.Util;
			var MainWindow = window.MAIN_WINDOW;
			var SIGNIN_MENU_KEY = 'signin';
			var response = jqxhr.responseText;
			var dialog;
			if(response.indexOf("Permission") != -1){
				dialog = createGlobalMessageDialog(I18N.prop("COMMON_NOT_AUTHORIZED"));
				dialog.open();
				return true;
			}else if(response.indexOf("invalid_token") != -1 || response.indexOf("Full authentication is required") != -1){
				dialog = createGlobalMessageDialog(I18N.prop("COMMON_SESSION_EXPIRED"));
				dialog.setActions(0, {
					action : function(e){
						//Close All Dialog
						e.sender.destroy();
						e.sender.element.remove();
						closeAllMsgDialog();
						MainWindow.logout();
					}
				});
				dialog.setCloseAction(function(e){
					e.sender.destroy();
					e.sender.element.remove();
					closeAllMsgDialog();
					MainWindow.logout();
				});
				dialog.open();
				return true;
			}else if(response.indexOf("Missing authorization header") != -1 && typeof MainWindow != "undefined") {
				dialog = createGlobalMessageDialog(util.parseFailResponse(jqxhr));
				dialog.setActions(0, {
					action : function(e){
						//Close All Dialog
						e.sender.destroy();
						e.sender.element.remove();
						closeAllMsgDialog();
						MainWindow.goToMenu(SIGNIN_MENU_KEY);
					}
				});
				dialog.setCloseAction(function(e){
					e.sender.destroy();
					e.sender.element.remove();
					closeAllMsgDialog();
					MainWindow.goToMenu(SIGNIN_MENU_KEY);
				});
				dialog.open();
				return true;
			}
		}
		return false;
	}

	/**
	*
	*   <ul>
	*   <li>AJAX로 응답된 Raw Text 데이터를 체크하여 권한 없음, 토큰 만료, 유효하지 않은 토큰 등으로 응답받을 경우</li>
	*   <li>전역으로 해당 Case에 대한 메시지 Dialog를 팝업하고, 강제 로그아웃한다.</li>
	*   </ul>
	*   @callback jQuery.ajaxError
	*   @param {jQueryEventObject} event
	*   @param {jQueryXHRObject} jqhxr
	*   @param {jQueryAjaxSettingsObject} settings
	*   @param {jQueryAjaxErrorObject} thrownError
	*   @alias module:app/core/ajax
	*
	*
	*/

	// $(document).ajaxError(function(event, jqxhr, settings, thrownError){
	$(document).ajaxError(function(event, jqxhr){
		globalMessageDialogProcess(jqxhr);
	});

})(window, jQuery);