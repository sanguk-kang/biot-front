/**
*
*   <ul>
*       <li>단위 기능 별로 특정 Topic(Event Type)에 Subcribe/Publish를 하기 위한 모듈이다. (Observer Pattern)</li>
*       <li>메뉴 선택, 단위 기능의 시작, 종료. 그리고 Floor Navigation을 통한 빌딩/층 선택, Alarm Polling 등에 사용할 수 있는 모듈이다.</li>
*       <li>현재는 Floor Navigation의 빌딩/층 선택 이벤트에 사용되고 있다.</li>
*   </ul>
*   @module app/core/observer
*
*
*/
define("core/observer", function(){
	"use strict";

	var allTopics = {};
	/**
	*   <ul>
	*       <li>Topic의 Event Type을 정의한 ENUM STRING. ["alarm", "event", "onfloorchange", "onfloorchanged"]</li>
	*       <li>현재 "onfloorchange", "onfloorchanged" 만 유효하며, FNB의 빌딩/층 선택 시, 발생하는 이벤트 타입이다.</li>
	*   </ul>
	*   @type {Array}
	*   @name EVENT_CALLBACK_TYPE
	*   @alias module:app/core/observer
	*
	*/
	var EVENT_CALLBACK_TYPE = ["alarm", "event", "onfloorchange", "onfloorchanged"];

	/**
	*   <ul>
	*   <li>특정 단위기능의 Topic을 가져온다.</li>
	*   <li>해당 단위 기능의 Topic이 존재하지 않을 경우 EVENT_CALLBACK_TYPE의 Event Type을 가진 Topic들을 생성한다. </li>
	*   </ul>
	*
	*   @function get
	*   @param {String} namespace - 단위 기능의 namespace (e.g : "dashboard")
	*   @param {flags} flags - Observer 모듈에 사용되는 Flag 설정 값 (Observer 모듈은 jQuery.Callbacks를 기반으로 작성되었다. 그러므로, jQuey.Callbacks에서 사용하는 Flag 설정 값과 동일하다.)
	*   @returns {Object} - jQuery.Callbacks 인스턴스의 fire(publish), add(subscribe), remove(unsubscribe), empty(empty) 함수를 가진 객체
	*   @alias module:app/core/observer
	*
	*/
	var get = function(namespace, flags){
		var callbacks, topic, flag, eventType,
			moduleTopics = namespace && allTopics[ namespace ];
		var i, max;

		if ( !moduleTopics ) {
			max = EVENT_CALLBACK_TYPE.length;
			moduleTopics = {};
			for( i = 0; i < max; i++ ){
				eventType = EVENT_CALLBACK_TYPE[i];

				//jQuery Callback Flags Option
				if(flags && flags[eventType]){
					flag = flags[eventType];
				}

				callbacks = $.Callbacks(flag);

				topic = {
					publish : callbacks.fire,
					subscribe: callbacks.add,
					unsubscribe: callbacks.remove,
					empty : callbacks.empty
				};

				moduleTopics[eventType] = topic;
				flag = null;
			}

			if ( namespace ) {
				allTopics[namespace] = moduleTopics;
			}
		}

		return moduleTopics;
	};

	/**
	*   <ul>
	*   <li>특정 단위기능의 Topic을 Event Type에 따라 Publish 한다.</li>
	*   </ul>
	*
	*   @function publish
	*   @param {String} eventType - Event Type (e.g : "onfloorchanged")
	*   @param {Object|Function|Array|Boolean|Number|String} args 등록된 Callback 함수를 호출하며 전달될 인자
	*   @alias module:app/core/observer
	*   @returns {void} - 리턴 값 없음
	*
	*/
	var publish = function(eventType, args){
		var topic, namespace;
		for(namespace in allTopics){
			topic = allTopics[namespace];
			if(topic[eventType]){
				try{
					topic[eventType].publish(args);
				}catch(e){
					console.error(e);
				}
			}
		}
	};

	return {
		get : get,
		publish : publish,
		EVENT_CALLBACK_TYPE : EVENT_CALLBACK_TYPE
	};
});