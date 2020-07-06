/**
*
*   <ul>
*       <li>Websocket을 연결하고, Websocket으로 부터 응답된 JSON 데이터를 수신 가능하게 한다. </li>
*   </ul>
*   @module app/core/websocket
*   @requires app/core/session
*
*/
(function(window, $){
	"user strict";
	var EVENT_CALLBACK_TYPE = ["open", "receive", "close", "error"];
	var Session = window.Session;
	var serverHost = window.SERVER_HOST;
	var edgeUrl = "/edge/notification";
	var webSocketUrl = window.location.protocol == "http:" ? "ws://" : "wss://";
	var serverPort = window.location.protocol == "http:" ? "80" : "443";
	var authed = false;
	var topics = {};
	var webSocket;

	/**
	*
	*   각 이벤트 타입("opn", "recieve", "close", "error") 별로 jQuery.Callbacks 인스턴스를 생성한다.
	*   @function createEvtCallbacks
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/websocket
	*
	*/
	var createEvtCallbacks = function(){
		var i, callbacks, topic, max = EVENT_CALLBACK_TYPE.length;
		for( i = 0; i < max; i++ ){
			callbacks = $.Callbacks();
			topic = {
				publish : callbacks.fire,
				subscribe: callbacks.add,
				unsubscribe: callbacks.remove,
				empty : callbacks.empty
			};
			topics[EVENT_CALLBACK_TYPE[i]] = topic;
		}
	};

	/**
	*
	*   Websocket 연결을 할 서버 URL을 설정한다.
	*
	*   @function setWsUrl
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/websocket
	*
	*/
	var setWsUrl = function(){
		//DEVELOPMENT : serverHost is 192.168.0.2
		//DEPLOY : serverHost is localhost
		serverHost = serverHost == "localhost" ? window.location.hostname : serverHost;
		webSocketUrl += (serverHost + ":" + serverPort + edgeUrl);
	};

	/**
	*
	*   <ul>
	*   <li>Native Websocket 이벤트를 단위 기능에서 사용할 수 있도록 Callback 인스턴스에 연결한다. (Pub/Sub)</li>
	*   <li>window.Websocket.prototype.onopen -> "open"</li>
	*   <li>window.Websocket.prototype.onmesseage -> "receive"</li>
	*   <li>window.Websocket.prototype.onclose -> "close"</li>
	*   <li>window.Websocket.prototype.onerror -> "error"</li>
	*   </ul>
	*   @function attachEvent
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/websocket
	*
	*/

	var attachEvent = function(){
		webSocket.onopen = function(evt){
			if(!authed){
				var authToken = Session.getAuthToken();
				webSocket.send(JSON.stringify({ access_token : authToken }));
				authed = true;
			}
			topics["open"].publish(evt);
		};
		webSocket.onmessage = function(evt){
			if(evt.data){
				var data = JSON.parse(evt.data);
				console.info(data);
				topics["receive"].publish(data);
			}
		};

		webSocket.onclose = function(evt){
			console.info('WEBSOCKET::CLOSED');
			topics["close"].publish(evt);
		};

		webSocket.onerror = function(evt){
			topics["error"].publish(evt);
		};
	};

	/**
	*
	*   <ul>
	*   <li>WebSocket 인스턴스를 생성하고, WebSocket을 연결한다.</li>
	*   </ul>
	*   @function connect
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/websocket
	*
	*/

	var connect = function(){
		webSocket = new WebSocket(webSocketUrl);
		attachEvent();
	};


	/**
	*
	*   <ul>
	*   <li>WebSocket을 연결해제한다.</li>
	*   </ul>
	*   @function close
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/websocket
	*
	*/
	// var close = function(){
	//     webSocket.close();
	// };

	/**
	*
	*   <ul>
	*   <li>Websocket Event Type에 따라 Callback  함수를 등록한다.</li>
	*   </ul>
	*   @function subscribe
	*   @param {String} evtType - 이벤트 타입, "open" : Websocket 연결, "receive" : Websocket으로부터 메시지 수신, "close" : Websocket 연결해제, "error" : Websocket 에러
	*   @param {String} arg - 이벤트 타입에 따라 호출될 Callback 함수
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/websocket
	*
	*/
	var subscribe = function(evtType, arg){
		var topic = topics[evtType];
		if(topic && $.isFunction(arg)){
			topic.subscribe(arg);
		}else{
			console.error("there is no eventType or callback argument is not function");
		}
	};

	/**
	*
	*   <ul>
	*   <li>Websocket Event Type에 따라 등록된 Callback 함수를 삭제한다.</li>
	*   </ul>
	*   @function unsubscribe
	*   @param {String} evtType - 이벤트 타입, "open" : Websocket 연결, "receive" : Websocket으로부터 메시지 수신, "close" : Websocket 연결해제, "error" : Websocket 에러
	*   @param {String} arg - 기등록된 Callback 함수
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/websocket
	*
	*/
	var unsubscribe = function(evtType, arg){
		var topic = topics[evtType];
		if(topic && $.isFunction(arg)){
			topic.unsubscribe(arg);
		}else if(topic){
			topic.empty();
		}else{
			console.error("there is no eventType or callback argument is not function");
		}
	};

	var clear = function(evtType, arg){
		var topic = topics[evtType];
		if(topic && $.isFunction(arg)){
			topic.empty();
		}else{
			console.error("there is no eventType or callback argument is not function");
		}
	};

	// Websocket 인스턴스를 통해 특정 메시지를 전달할 수 있는 메소드
	var send = function(msg){
		if(!(typeof msg == "string")){
			msg = JSON.stringify(msg);
		}
		webSocket.send(msg);
	};

	/**
	*
	*   <ul>
	*   <li>Websocket 모듈을 초기화한다.</li>
	*   </ul>
	*   @function init
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/websocket
	*
	*/
	var init = function(){
		createEvtCallbacks();
		setWsUrl();
	};

	init();

	window.CommonWebSocket = {
		connect : connect,
		on : subscribe,
		off : unsubscribe,
		clear : clear,
		send : send
	};

})(window, jQuery);