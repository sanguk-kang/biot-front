define("hmi/hmi-create", ["hmi/hmi-util", "hmi/config/popup-config", "hmi/view-model/hmi-create-vm", "hmi/hmi-common"], function(HmiUtil, PopupConfig, CreateViewModel, HmiCommon){

	var kendo = window.kendo;
	var MainWindow = window.MAIN_WINDOW;
	var I18N = window.I18N;

	var confirmDialog = PopupConfig.confirmDialog, msgDialog = PopupConfig.msgDialog;

	var createTab = $("#hmi-create-tab");
	var closeBtn = $("#hmi-create-close-btn");
	var hmiMonitoring, createViewModel;
	var loadedGraphicId, loadedGraphic, loadedGraphicName, loadedGraphicFile;

	var init = function(){
		MainWindow.disableFloorNav(true);
		initComponent();
		initTabContentViewModel(0);
		attachEvent();
		require(["hmi/hmi"], function(HmiMonitoring){
			hmiMonitoring = HmiMonitoring;
		});
	};

	var initComponent = function(){
		// createTab = createTab.kendoCommonTabStrip().data("kendoCommonTabStrip");
		createViewModel = new CreateViewModel.ViewModelClass(createTab, { editable : true });
	};

	var attachEvent = function(){
		closeBtn.on("click", createViewModel.clickExitBtnEvt.bind(createViewModel));
	};

	var clickExitBtnEvt = function(e){
		close();
	};

	var clickSaveBtnEvt = function(e){
		var id = e.id;
		if (typeof id == "string" && id.indexOf(HmiCommon.DEFAULT_EMPTY_TAB_PREFIX) != -1) id = null;
		createViewModel.save(id);
	};

	//파일 정보를 설정하여 생성 화면에서 저장 시, PUT으로 요청할 수 있도록 한다.
	var setGraphicFileInfo = function(graphicData, graphicFile){
		var tab = createViewModel.tab;
		var currentTabInfo = tab.getCurrentTabCanvasInfo();
		if (currentTabInfo.id == loadedGraphicId) {
			loadedGraphic = graphicData;
			loadedGraphicId = graphicFile.id;
			loadedGraphicName = graphicFile.name;
		}
		var newTabInfo = {id: graphicFile.id, name: graphicFile.name};
		createViewModel.setCanvasInfo(newTabInfo);
		createViewModel.setCanvasInfoCurrentTab(newTabInfo);
	};

	var hide = function(){
		createViewModel.hide();
	};

	var show = function(){
		createViewModel.show();
	};

	var close = function(){
		createViewModel.clear();
		//편집화면의 전체 화면 모드를 모니터링 화면에서 그대로 따라간다.
		hmiMonitoring.setFullScreen(createViewModel._isFullScreen);
		hide();
		hmiMonitoring.show(loadedGraphicId, loadedGraphicName);
	};

	//생성 또는 편집하기
	var open = function(id, file, data, isNew){
		createViewModel.clear();
		var canvasInfo;
		loadedGraphic = null;
		loadedGraphicId = null;
		hmiMonitoring.hide();
		//모니터링의 전체화면 모드를 그대로 따라간다.
		createViewModel.setFullScreen(hmiMonitoring.monitoringViewModel._isFullScreen);
		show();
		//캔버스의 정보를 입력한다.
		//새 파일 생성시 id가 empty-0 로 생성되며, 저장시 모니터링으로 전환시 저장된 id를 모니터링으로 전달
		var fileId = id ? id : (HmiCommon.DEFAULT_EMPTY_TAB_PREFIX + '1');
		var fileName = file.name ? file.name : I18N.prop('HMI_NEW_FILE') + ' 1';
		loadedGraphic = data;
		loadedGraphicId = fileId;
		loadedGraphicName = fileName;
		canvasInfo = {id: fileId, name: fileName, isNew: isNew, zoomLevel: 100};
		createViewModel.setCanvasInfo(canvasInfo);
		createViewModel.setCanvasInfoCurrentTab(canvasInfo);
		if(fileName && data){
			createViewModel.load(file, data, isNew);
		}else{
			createViewModel.create(file, isNew);
		}
	};

	var setTabText = function(text){
		var tabUl = createTab.tabGroup[0];
		$(tabUl).find(".tab-title").text(text);
	};

	var load = function(file, data){
		createViewModel.load(file, data);
	};

	var setFullScreen = function(isEnabled){
		createViewModel.setFullScreen(isEnabled);
	};

	var initTabContentViewModel = function(index){
		// var element = createTab.contentElement(index);
		// createViewModel = new CreateViewModel.ViewModelClass(element, { editable : true, type : "create" });
		attachEventFromViewModel();
	};

	var attachEventFromViewModel = function(){
		createViewModel.bind("click", "exit", clickExitBtnEvt);
		createViewModel.bind("click", "save", clickSaveBtnEvt);
	};

	return {
		init : init,
		hide : hide,
		show : show,
		open : open,
		close : close,
		load : load,
		setFullScreen : setFullScreen,
		setGraphicFileInfo : setGraphicFileInfo
	};
});
//# sourceURL=hmi/hmi-create.js
