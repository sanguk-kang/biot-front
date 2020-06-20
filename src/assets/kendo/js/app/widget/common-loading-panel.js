/**
*
*   <ul>
*       <li>공용 Loading Panel</li>
*       <li>특정 부모 요소에 Append되어 로딩 에니메이션을 표시할 수 있도록한다.</li>
*       <li>Default는 "body"에 Append 된다.</li>
*       <li>인스턴스를 생성하여 관리될 수 있도록 한다.</li>
*   </ul>
*   @module app/widget/common-loading-panel
*   @requires lib/kendo.all
*
*/
(function(window, $){
	"use strict";

	var LoadingPanel = function(target){
		if(!target){
			target = $("body");
		}
		this.target = target;
		this.isOpened = false;
	};
	/**
	*   <ul>
	*   <li>Loading 에니메이션을 Open한다.</li>
	*   </ul>
	*   @function open
	*	@param {jQueryObject} target - 로딩 패널 대상.
	*   @returns {void}
	*   @alias module:app/widget/common-loading-panel
	*
	*/
	LoadingPanel.prototype.open = function(target){
		if(!target){
			target = this.target ? this.target : $("body");
		}
		if(this.isOpened){
			this.close();
		}
		this.element = $("<div/>").addClass("common-loading-panel-mask");
		this.loadingImage = $("<div/>").addClass("common-loading-panel-image");
		this.loadingColor = $("<div/>").addClass("common-loading-panel-color");
		this.element.append(this.loadingImage).append(this.loadingColor);
		this.element.appendTo(target);
		this.isOpened = true;
	};
	/**
	*   <ul>
	*   <li>Loading 에니메이션을 Close한다.</li>
	*   </ul>
	*   @function close
	*   @returns {void}
	*   @alias module:app/widget/common-loading-panel
	*
	*/
	LoadingPanel.prototype.close = function(){
		if(this.element) this.element.remove();
		this.isOpened = false;
	};

	window.CommonLoadingPanel = LoadingPanel;
	define("widget/common-loading-panel",function(){
		return LoadingPanel;
	});

})(window, jQuery);