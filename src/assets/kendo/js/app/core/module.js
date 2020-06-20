/**
*
*   <ul>
*       <li>단위 기능이 실행 될 때, 인자로 전달될 Core Module 인스턴스 생성한다.</li>
*       <li>각 단위 기능은 해당 모듈 인스턴스의 on, off, trigger 메소드를 통해 FNB(Floor Navigation Bar)의 빌딩, 층 변경 이벤트를 수신하는 Callback 함수를 등록, 삭제, 실행할 수 있다.</li>
*   </ul>
*   @module app/core/module
*   @requires app/core/observer
*
*
*/
define("core/module", ["core/observer"], function(globalObserver){
	"use strict";

	window.Modules = {};

	var kendo = window.kendo;
	/**
	*
	*   새로운 모듈을 생성한다. namespace와 observer 객체외 다른 변수들은 <b>deprecated</b> 상태다.
	*   @class Module
	*   @memberof module:app/core/module
	*   @param {String} namespace - 단위 모듈의 Namespace (이름)
	*   @param {flags} flags - Observer 모듈에 사용되는 Flag 설정 값 (Observer 모듈은 jQuery.Callbacks를 기반으로 작성되었다. 그러므로, jQuey.Callbacks에서 사용하는 Flag 설정 값과 동일하다.)
	*/
	var Module = function(namespace, flags){
		window.Modules[namespace] = this;
		this.namespace = namespace;
		this.observer = globalObserver.get(namespace, flags);
		this.templateViews = {};
		this.templateData = {};
		this.templateUseWidthBlock = true;
		this.templateViewModel = {};
		this.router = new kendo.Router({ root : namespace, pushState : true });
	};

	/**
	*
	*   "on", "off", "trigger" 등 Callback 함수 처리 방식과 해당 Callback에 대한 이벤트 타입에 따라 Observer 모듈을 실행한다.
	*
	*   @function callbackProcess
	*   @param {String} type - "on" : Callback 등록, "off" : Callback 삭제, "trigger" : Callback 수행
	*   @param {String} eventType - 해당 Callback이 실행될 이벤트의 형식 (e.g : "onfloorchanged")
	*   @param {Object|String|Number|Boolean|Array|Function} arg - type이 "on" 또는 "off"이고, arg가 Function일 경우 해당 함수를 Callback으로 등록/삭제하며, 다른 타입일 경우 trigger로 Callback 함수 호출 시, 해당 함수에 인자로 전달한다.
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/core/module
	*
	*/
	var callbackProcess = function(type, eventType, arg){
		console.info(this);
		console.info(this.observer);
		var topic = this.observer[eventType];
		if(!topic){
			console.error("'" + eventType + "' is invalid event type. valid observer events are " + globalObserver.EVENT_CALLBACK_TYPE);
			return;
		}

		if(type == "on"){
			if($.isFunction(arg)){
				topic.subscribe(arg);
			}else{
				console.error("invalid callback function argument.");
			}
		}else if(type == "off"){
			if($.isFunction(arg)){
				topic.unsubscribe(arg);
			}else{
				console.error("invalid callback function argument.");
			}
		}else if(type == "trigger"){
			topic.publish(arg);
		}
	};

	/*jQuery on(), off(), trigger() 문법*/
	/*기능 실행 및 종료 시 이벤트, Floor Navigation 컨트롤, 알람 및 이벤트 수신*/

	/**
	*
	*   특정 Event Type에 호출되는 Callback 함수를 등록한다
	*
	*   @method on
	*   @param {String} eventType - Callback 함수가 등록되고 호출될 Event Type (e.g :  "onfloorchanged")
	*   @param {Function} funcArg - 특정 Event 발생 시, 호출된 Callback 함수
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/module.Module
	*
	*/

	Module.prototype.on = function(eventType, funcArg){
		callbackProcess.call(this, "on", eventType, funcArg);
	};

	/**
	*
	*   특정 Event Type에 호출되는 Callback 함수를 삭제한다
	*
	*   @method off
	*   @param {String} eventType - Callback 함수가 삭제될 Event Type (e.g :  "onfloorchanged")
	*   @param {Function} funcArg - 삭제될 기등록 된 Callback 함수
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/module.Module
	*
	*/

	Module.prototype.off = function(eventType, funcArg){
		callbackProcess.call(this, "off", eventType, funcArg);
	};

	/**
	*
	*   특정 Event Type의 Callback 함수를 호출한다.
	*
	*   @method trigger
	*   @param {String} eventType - Callback 함수가 호출될 Event Type (e.g :  "onfloorchanged")
	*   @param {Function} triggerArg - 호출되는 Callback 함수에 전달될 인자
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/module.Module
	*
	*/

	Module.prototype.trigger = function(eventType, triggerArg){
		callbackProcess.call(this, "trigger", eventType, triggerArg);
	};

	/*New Instance Return*/
	return Module;
});