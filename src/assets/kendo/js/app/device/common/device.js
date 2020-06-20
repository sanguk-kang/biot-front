/**
*
*   <ul>
*       <li>기기 타입 별 탭을 제공한다.</li>
*       <li>기기 타입 별 Statistic, List, Map, Grid View를 제공한다.</li>
*       <li>기기들을 등록/등록해제하고, 모니터링 및 제어한다.</li>
*   </ul>
*   @module app/device
*   @param {Object} CoreModule - main 모듈로부터 전달받은 모듈로 FNB의 층 변경 이벤트를 수신가능하게한다.
*   @param {Object} DeviceConfig - 각 기기 타입의 View 설정 정보
*   @param {Object} DeviceApi - /dms 호출을 위한 API Utility
*   @param {Object} DeviceUtil - Device 기능을 위한 Utility
*   @param {Object} DeviceController - 각 기기 타입의 View Controller
*   @requires app/main
*   @requires app/widget/common-device-panel
*   @requires app/device/common/config/device-config
*   @requires app/device/common/device-api
*   @requires app/device/common/device-util
*   @requires app/device/common/controller/device-controller
*/
define("device/common/device", ["device/common/config/device-config",
	"device/common/device-api",
	"device/common/device-util",
	"device/common/controller/device-controller"],
function(DeviceConfig, DeviceApi, DeviceUtil, DeviceController){
	"use strict";

	var MainWindow = window.MAIN_WINDOW;
	var deviceTabPanel, deviceTabPanelElem = $("#device-tab-panel");
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();
	var msgDialog, msgDialogElem = $("<div/>");
	var currentDeviceController;
	var isFloorChangedEvtBind = false;
	var CoreModule;

	/**
	*
	*   Device 기능을 초기화한다.
	*
	*   @function init
	*   @param {Object} coreModule -
	*   @param {boolean} containsAllView -
	*   @param {boolean} isMonitoringView -
	*   @param {boolean} isRegisterView -
	*   @returns {void}
	*   @alias module:app/device/common
	*
	*/
	var init = function(coreModule, containsAllView, isMonitoringView, isRegisterView){
		Loading.open();
		CoreModule = coreModule;
		msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");

		var tabConfigList = DeviceConfig.getTabConfigList(containsAllView, isMonitoringView, isRegisterView);
		if(tabConfigList.length < 1){
			var I18N = window.I18N;
			msgDialog.message(I18N.prop("FACILITY_DEVICE_NO_INSTALLED_TYPES"));
			msgDialog.open();
			Loading.close();
			return false;
		}
		deviceTabPanel = deviceTabPanelElem.kendoDeviceTabPanel({
			tabLayouts : tabConfigList
		}).data("kendoDeviceTabPanel");
		deviceTabPanel.bind("activate", tabActivate);
		deviceTabPanel.bind("select", tabSelected);
		deviceTabPanel.bind("destroy", tabDestroyed);

		//Dashboard 카드 등에서 페이지 접근 시, 특정 기기 탭에 접근하기 위하여 LocalStorage를 이용한다.
		var deviceTypeTab = window.localStorage.getItem("deviceTypeTab");
		var index = 0;
		if(deviceTypeTab){
			window.localStorage.removeItem("deviceTypeTab");
			var i, max = tabConfigList.length;
			for( i = 0; i < max; i++ ){
				if(tabConfigList[i].key == deviceTypeTab){
					index = i;
					break;
				}
			}
		}

		//층 네비게이션 이벤트를 바인딩한다.
		CoreModule.on("onfloorchange", floorChanged);

		//탭 선택하여 시작
		deviceTabPanel.selectTab(index);
	};

	//탭 클릭 이벤트. 탭 컨텐츠가 로딩되기 전에 호출된다.
	var tabSelected = function(e){

	};

	//탬플릿이 렌더링 되고, View Model 바인딩, SPA, Widget 생성이 완료된 시점의 콜백
	//탭 컨텐츠 영역 내 화면이 전부 로딩되면 데이터를 셋한다.
	/**
	*
	*   <ul>
	*   <li>특정 Tab의 컨텐츠가 로딩되고 난 후에 호출되는 Callback</li>
	*   <li>해당 Tab의 기기타입에 해당하는 Controller를 초기화(init)한다.</li>
	*   </ul>
	*   @function tabActivate
	*	@param {Object}	e -
	*   @returns {void}
	*   @alias module:app/device/common
	*/
	var tabActivate = function(e){
		Loading.close();

		//선택한 탭의 기기 타입에 해당하는 Controller 인스턴스를 생성한다.
		var activatedTabLayoutOption = e.tabLayout;
		var activatedDeviceType = activatedTabLayoutOption.key;
		var Controller = DeviceController.getDeviceController(activatedDeviceType);

		if(Controller) currentDeviceController = new Controller(e);

		//기능이 시작하여 최초 탭 활성화 시에는 main.js에서 floorChanged 함수를 호출해주고, Flag 값을 True로 변경한다.
		//기능 시작 이후 기기 탭을 변경하여 기기 탭들이 활성화 될 시에는 main.js에서 호출되지 않으므로 강제로 호출해준다.
		if(isFloorChangedEvtBind) currentDeviceController.onFloorChanged(MainWindow.getCurrentFloor());
		else isFloorChangedEvtBind = true;
	};

	/**
	*
	*   <ul>
	*   <li>특정 Tab의 컨텐츠가 삭제되고 난 후에 호출되는 Callback</li>
	*   <li>해당 Tab의 기기타입에 해당하는 Controller의 소멸자(destroy) 함수를 호출한다.</li>
	*   </ul>
	*   @function tabDestroyed
	*	@param {Object}	e -
	*   @returns {void}
	*   @alias module:app/device/common
	*/
	var tabDestroyed = function(e){
		if(currentDeviceController) currentDeviceController.destroy(e);
	};

	//FNB 변경 시, 각 기기 탭 컨트롤러의 onFloorChanged 함수를 호출해준다.
	var floorChanged = function(data){
		if(currentDeviceController) currentDeviceController.onFloorChanged(data);
	};

	return {
		init : init
	};
});


//For Debug
//# sourceURL=device/common/device.js