define("hmi/view-model/hmi-create-vm", ["hmi/hmi-common", "hmi/hmi-util", "hmi/model/hmi-model", "hmi/hmi-api", "hmi/config/popup-config", "hmi/config/palette-config", "hmi/view-model/base-vm",
	"hmi/hmi-canvas"], function(HmiCommon, HmiUtil, HmiModel, HmiApi, PopupConfig, PaletteConfig, BaseViewModel, HmiCanvas){
	var I18N = window.I18N, Util = window.Util;
	var msgDialog = PopupConfig.msgDialog, confirmDialog = PopupConfig.confirmDialog;
	var toastPopup = HmiCommon.toastPopup;
	var BaseClass = BaseViewModel.BaseViewModelClass;
	var getImageUrl = PaletteConfig.getIconUrl;
	var LoadingPanel = window.CommonLoadingPanel, Loading = new LoadingPanel();

	var ToolbarButton = function(config){
		return BaseViewModel.extendConfig(BaseViewModel.ToolbarButtonConfig, config);
	};

	var ELEMENT_TAB_INDEX = 0;
	var LIBRARY_TAB_INDEX = 1;
	var BINDING_TAB_INDEX = 2;


	var zoomLevelDataSource = [{ id : 200, name : "200%" }, { id : 175, name : "175%" }, { id : 150, name : "150%" }, { id : 125, name : "125%" }, { id : 100, name : "100%" },
		{ id : 75, name : "75%" }, { id : 50, name : "50%" }, { id : 25, name : "25%" }];
	/*var shapeDataSource = [{ id : "LineToolPolicy", name : I18N.prop("HMI_POLY_LINE"), imageName : "polyline"}, { id : "CurveToolPolicy", name : I18N.prop("HMI_CURVE"), imageName : "curve"},
						  { id : "RectangleToolPolicy", name : I18N.prop("HMI_RECTANGLE"), imageName : "rect"}, { id : "RoundRectangleToolPolicy", name : I18N.prop("HMI_ROUNDED_RECTANGLE"), imageName : "rounded"},
						  { id : "ParallelogramToolPolicy", name : I18N.prop("HMI_PARALLELOGRAM"), imageName : "paralle"}, { id : "CircleToolPolicy", name : I18N.prop("HMI_ELLIPSE"), imageName : "ellp"},
						  { id : "TriangleToolPolicy", name : I18N.prop("HMI_TRIANGLE"), imageName : "tri"}, { id : "ImageToolPolicy", name : I18N.prop("HMI_IMAGE"), imageName : "img"}];*/

	var textHAlignDataSource = [{ id : "left", name : I18N.prop("HMI_TOOLBAR_TEXT_ALIGN_HORIZONTAL_LEFT"), className : "ic-text-align-left", selected : false },
						        { id : "center", name : I18N.prop("HMI_TOOLBAR_TEXT_ALIGN_HORIZONTAL_CENTER"), className : "ic-text-align-center", selected : false },
						        { id : "right", name : I18N.prop("HMI_TOOLBAR_TEXT_ALIGN_HORIZONTAL_RIGHT"), className : "ic-text-align-right", selected : false }];

	var textVAlignDataSource = [{ id : "top", name : I18N.prop("HMI_TOOLBAR_TEXT_ALIGN_VERTICAL_TOP"), className : "ic-text-align-top", selected : false },
						        { id : "middle", name : I18N.prop("HMI_TOOLBAR_TEXT_ALIGN_VERTICAL_MIDDLE"), className : "ic-text-align-middle", selected : false },
						        { id : "bottom", name : I18N.prop("HMI_TOOLBAR_TEXT_ALIGN_VERTICAL_BOTTOM"), className : "ic-text-align-bottom", selected : false }];

	var lineWidthDataSource = HmiCommon.lineWidthDataSource;

	var tableInsertionDataSource = [
		{ id : "left", name : I18N.prop("HMI_TOOLBAR_TABLE_INSERTION_COLUMN_LEFT"), className : "ic-table-insert-left" },
		{ id : "right", name : I18N.prop("HMI_TOOLBAR_TABLE_INSERTION_COLUMN_RIGHT"), className : "ic-table-insert-right" },
		{ id : "above", name : I18N.prop("HMI_TOOLBAR_TABLE_INSERTION_ROW_ABOVE"), className : "ic-table-insert-above" },
		{ id : "below", name : I18N.prop("HMI_TOOLBAR_TABLE_INSERTION_ROW_BELOW"), className : "ic-table-insert-below" }
	];

	var tableDeleteDataSource = [
		{ id : "column", name : I18N.prop("HMI_TOOLBAR_TABLE_DELETE_COLUMN"), className : "ic-table-delete-col" },
		{ id : "row", name : I18N.prop("HMI_TOOLBAR_TABLE_DELETE_ROW"), className : "ic-table-delete-row" },
		{ id : "table", name : I18N.prop("HMI_TOOLBAR_TABLE_DELETE_TABLE"), className : "ic-table-delete-table" }
	];

	var createViewModelClass = BaseClass.extend({
		//아래 리스트 형태는 MVVM 바인딩 시, HTML Template을 렌더링하기 위함이며, 초기화 시, 위 객체에 Key Value로 매핑하여 바로 버튼 ViewModel을 찾을 수 있게 한다.
		viewModel : {
			buttons : {
				"0" : [
					ToolbarButton({ id : "hmi-tool-undo", name : "undo", cssClass : "ic-undo group", disabled : true, title : I18N.prop("HMI_TOOLBAR_UNDO") }),
					ToolbarButton({ id : "hmi-tool-redo", name : "redo", cssClass : "ic-redo", disabled : true, title : I18N.prop("HMI_TOOLBAR_REDO") }),
					ToolbarButton({ id : "hmi-tool-binding", name : "binding", cssClass : "ic-clip", disabled : true, title : I18N.prop("HMI_TOOLBAR_BINDING") }),
					ToolbarButton({ id : "hmi-tool-lock", name : "lock", cssClass : "ic-lock", disabled : true, title : I18N.prop("HMI_TOOLBAR_LOCK") }),
					ToolbarButton({ id : "hmi-tool-template", name : "background", cssClass : "ic-template", disabled : false, title : I18N.prop("HMI_TOOLBAR_BACKGROUND"), hasVerticalLine : true }),
					ToolbarButton({ id : "hmi-tool-fill", name : "fill", cssClass : "ic-fill", disabled : true, title : I18N.prop("HMI_TOOLBAR_FILL") }),
					ToolbarButton({ id : "hmi-tool-linecolor", name : "lineColor", cssClass : "ic-linecolor", disabled : true, title : I18N.prop("HMI_TOOLBAR_LINE_COLOR")}),
					ToolbarButton({ id : "hmi-tool-linewidth", name : "lineWidth", cssClass : "ic-linewidth", hasVerticalLine : true, disabled : true, title : I18N.prop("HMI_TOOLBAR_LINE_WIDTH"),
						dropDownList : BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig,
							{ id : "hmi-tool-line-width-drop", name : "line-width-dropdown", value : null, dataSource : lineWidthDataSource, invisible : true, template: "hmi-line-width-dropdownlist-template" })
					}),
					ToolbarButton({ id : "hmi-tool-select", name : "select", cssClass : "ic-select", title : I18N.prop("HMI_TOOLBAR_SELECT"), hasVerticalLine : true }),
					ToolbarButton({ id : "hmi-tool-group", name : "group", cssClass : "ic-group group", disabled : true, title : I18N.prop("HMI_TOOLBAR_GROUP") }),
					ToolbarButton({ id : "hmi-tool-ungroup", name : "ungroup", cssClass : "ic-ungroup group", disabled : true, title : I18N.prop("HMI_TOOLBAR_UNGROUP") }),
					ToolbarButton({ id : "hmi-tool-zone", name : "zone", cssClass : "ic-group-bundle", title : I18N.prop("SPACE_ZONE"), value : "SPACE_ZONE", hasVerticalLine : true }),

					/*ToolbarButton({ id : "hmi-tool-shape", name : "shape", cssClass : "ic-shape", hasVerticalLine : true,
						dropDownList : BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig,
							{ id : "hmi-tool-shape-drop", name : "shape-dropdown", value : null, dataSource : shapeDataSource, invisible : true, template: "hmi-basic-graphic-dropdownlist-template" })
					}),*/
					ToolbarButton({ id : "hmi-tool-text", name : "text", cssClass : "ic-basic-text group", title : I18N.prop("HMI_TEXT"), value : "HMI_TEXT" }),
					ToolbarButton({ id : "hmi-tool-rect", name : "rect", cssClass : "ic-basic-rect group", title : I18N.prop("HMI_RECTANGLE"), value : "HMI_RECTANGLE" }),
					ToolbarButton({ id : "hmi-tool-rounded", name : "rounded", cssClass : "ic-basic-rounded group", title : I18N.prop("HMI_ROUNDED_RECTANGLE"), value : "HMI_ROUNDED_RECTANGLE" }),
					ToolbarButton({ id : "hmi-tool-parall", name : "parall", cssClass : "ic-basic-parall group", title : I18N.prop("HMI_PARALLELOGRAM"), value : "HMI_PARALLELOGRAM" }),
					ToolbarButton({ id : "hmi-tool-trapez", name : "trapez", cssClass : "ic-basic-trapez group", title : I18N.prop("HMI_TRAPEZOID"), value : "HMI_TRAPEZOID" }),
					ToolbarButton({ id : "hmi-tool-tri", name : "tri", cssClass : "ic-basic-tri group", title : I18N.prop("HMI_TRIANGLE"), value : "HMI_TRIANGLE" }),
					ToolbarButton({ id : "hmi-tool-circle", name : "circle", cssClass : "ic-basic-circle group", title : I18N.prop("HMI_ELLIPSE"), value : "HMI_ELLIPSE" }),
					ToolbarButton({ id : "hmi-tool-straight", name : "straight", cssClass : "ic-basic-straight group", title : I18N.prop("HMI_STRAIGHT"), value : "HMI_STRAIGHT" }),
					ToolbarButton({ id : "hmi-tool-line", name : "line", cssClass : "ic-basic-line group", title : I18N.prop("HMI_POLY_LINE"), value : "HMI_POLY_LINE" }),
					ToolbarButton({ id : "hmi-tool-curve", name : "curve", cssClass : "ic-basic-curve", title : I18N.prop("HMI_CURVE"), value : "HMI_CURVE", hasVerticalLine : true }),
					ToolbarButton({ id : "hmi-tool-table", name : "table", cssClass : "ic-basic-table group", title : I18N.prop("HMI_TABLE"), value : "HMI_TABLE" }),
					ToolbarButton({ id : "hmi-tool-picture", name : "picture", cssClass : "ic-basic-picture group", title : I18N.prop("HMI_IMAGE"), value : "HMI_IMAGE" }),
					ToolbarButton({ id : "hmi-tool-link", name : "link", cssClass : "ic-basic-link", title : I18N.prop("HMI_LINK"), value : "HMI_LINK", hasVerticalLine : true }),
					ToolbarButton({ id : "hmi-tool-zoomin", name : "zoomin", cssClass : "ic-zoomin group", title : I18N.prop("HMI_TOOLBAR_ZOOM_IN")}),
					ToolbarButton({ id : "hmi-tool-zoomout", name : "zoomout", cssClass : "ic-zoomout group", title : I18N.prop("HMI_TOOLBAR_ZOOM_OUT")}),
					ToolbarButton(BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig,
						{ id : "hmi-tool-zoomlevel", name : "zoomlevel", cssClass : "toolbar-zoomlevel",
							value : HmiCommon.DEFAULT_ZOOM_LEVEL, dataSource : zoomLevelDataSource, title : I18N.prop("HMI_TOOLBAR_ZOOM_LEVEL"), dataValueField : "id"
						})),
					ToolbarButton({ id : "hmi-tool-create-fullscreen", name : "fullscreen", cssClass : "ic-map-full-screen", title : I18N.prop("COMMON_FULL_SCREEN") })
					/*ToolbarButton({ id : "hmi-tool-cell-merge", name : "tableMerge", cssClass : "ic-rotate-right group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ROTATION_RIGHT") }),
					ToolbarButton({ id : "hmi-tool-cell-seperate-horizontal", name : "tableHSeperate", cssClass : "ic-rotate-left group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ROTATION_LEFT") }),
					ToolbarButton({ id : "hmi-tool-cell-seperate-vertical", name : "tableVSeperate", cssClass : "ic-rotate-left", disabled : true, title : I18N.prop("HMI_TOOLBAR_ROTATION_LEFT") })*/
				],
				"1" : [
					BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig,
						{
							id : "hmi-tool-fontsize", name : "fontSize", cssClass : "toolbar-fontsize",
							dataTextField : "", dataValueField : "", dataSource : HmiCommon.fontSizeDataSource, value : HmiCommon.DEFAULT_FONT_SIZE,
							disabled : true, title : I18N.prop("HMI_TOOLBAR_FONT_SIZE")
						}
					),
					ToolbarButton({ id : "hmi-tool-bold", name : "bold", cssClass : "ic-bold", disabled : true, title : I18N.prop("HMI_TOOLBAR_FONT_BOLD")}),
					ToolbarButton({ id : "hmi-tool-italic", name : "italic", cssClass : "ic-italic", disabled : true, title : I18N.prop("HMI_TOOLBAR_FONT_ITALIC")}),
					ToolbarButton({ id : "hmi-tool-fontcolor", name : "fontColor", cssClass : "ic-textcolor", disabled : true, hasVerticalLine : true, title : I18N.prop("HMI_TOOLBAR_FONT_COLOR")}),
					ToolbarButton({ id : "hmi-tool-text-Halign", name : "textHAlign", cssClass : "ic-text-align-left group", disabled : true, title : I18N.prop("HMI_TOOLBAR_TEXT_ALIGN_HORIZONTAL"),
						dropDownList : BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig,
							{ id : "hmi-tool-text-halign-drop", name : "text-halign-dropdown", value : null, dataSource : textHAlignDataSource, invisible : true, template: "hmi-text-align-dropdownlist-template" })
					}),
					ToolbarButton({ id : "hmi-tool-text-Valign", name : "textVAlign", cssClass : "ic-text-align-top", disabled : true, title : I18N.prop("HMI_TOOLBAR_TEXT_ALIGN_VERTICAL"), hasVerticalLine : true,
						dropDownList : BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig,
							{ id : "hmi-tool-text-valign-drop", name : "text-valign-dropdown", value : null, dataSource : textVAlignDataSource, invisible : true, template: "hmi-text-align-dropdownlist-template" })
					}),
					ToolbarButton({ id : "hmi-tool-bring-foward", name : "bringTop", cssClass : "ic-above-all group", disabled : true, title : I18N.prop("HMI_TOOLBAR_BRING_TOP") }),
					ToolbarButton({ id : "hmi-tool-send-backward", name : "sendBottom", cssClass : "ic-below-all group", disabled : true, title : I18N.prop("HMI_TOOLBAR_SEND_BOTTOM") }),
					ToolbarButton({ id : "hmi-tool-bring-top", name : "bringForward", cssClass : "ic-above group", disabled : true, title : I18N.prop("HMI_TOOLBAR_BRING_FORWARD") }),
					ToolbarButton({ id : "hmi-tool-send-bottom", name : "sendBackward", cssClass : "ic-below", disabled : true, title : I18N.prop("HMI_TOOLBAR_SEND_BACKWARD"), hasVerticalLine : true}),
					ToolbarButton({ id : "hmi-tool-match-size", name : "matchSize", cssClass : "ic-justify-both group", disabled : true, title : I18N.prop("HMI_TOOLBAR_MATCH_SIZE") }),
					ToolbarButton({ id : "hmi-tool-match-width", name : "matchWidth", cssClass : "ic-justify-horz group", disabled : true, title : I18N.prop("HMI_TOOLBAR_MATCH_WIDTH") }),
					ToolbarButton({ id : "hmi-tool-match-height", name : "matchHeight", cssClass : "ic-justify-vert", disabled : true, title : I18N.prop("HMI_TOOLBAR_MATCH_HEIGHT"), hasVerticalLine : true}),
					ToolbarButton({ id : "hmi-tool-align-left", name : "alignLeft", cssClass : "ic-align-left group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ALIGH_LEFT")}),
					ToolbarButton({ id : "hmi-tool-align-hcenter", name : "alignHcenter", cssClass : "ic-align-center group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ALIGH_HCENTER") }),
					ToolbarButton({ id : "hmi-tool-align-right", name : "alignRight", cssClass : "ic-align-right group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ALIGH_RIGHT")}),
					ToolbarButton({ id : "hmi-tool-align-top", name : "alignTop", cssClass : "ic-align-top group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ALIGH_TOP")}),
					ToolbarButton({ id : "hmi-tool-align-vcenter", name : "alignVcenter", cssClass : "ic-align-middle group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ALIGH_VCENTER")}),
					ToolbarButton({ id : "hmi-tool-align-bottom", name : "alignBottom", cssClass : "ic-align-bottom", disabled : true, title : I18N.prop("HMI_TOOLBAR_ALIGH_BOTTOM"), hasVerticalLine : true}),
					ToolbarButton({ id : "hmi-tool-align-hgap", name : "alignHGap", cssClass : "ic-equal-gap-h group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ALIGN_HGAP")}),
					ToolbarButton({ id : "hmi-tool-align-vgap", name : "alignVGap", cssClass : "ic-equal-gap-v", disabled : true, title : I18N.prop("HMI_TOOLBAR_ALIGN_VGAP"), hasVerticalLine : true}),
					ToolbarButton({ id : "hmi-tool-filp-v", name : "flipV", cssClass : "ic-align-flip-v group", disabled : true, title : I18N.prop("HMI_TOOLBAR_FLIP_H") }),
					ToolbarButton({ id : "hmi-tool-filp-h", name : "flipH", cssClass : "ic-align-flip-h group", disabled : true, title : I18N.prop("HMI_TOOLBAR_FLIP_V") }),
					ToolbarButton({ id : "hmi-tool-rotation-right", name : "rotationRight", cssClass : "ic-rotate-right group", disabled : true, title : I18N.prop("HMI_TOOLBAR_ROTATION_RIGHT") }),
					ToolbarButton({ id : "hmi-tool-rotation-left", name : "rotationLeft", cssClass : "ic-rotate-left", disabled : true, title : I18N.prop("HMI_TOOLBAR_ROTATION_LEFT"), hasVerticalLine : true }),
					ToolbarButton({ id : "hmi-tool-rotation", name : "rotation", cssClass : "ic-rotate", disabled : true, title : I18N.prop("HMI_TOOLBAR_ROTATION"), hasVerticalLine : true,
						popupInvisible : true, change : function(){}, onClose : function(){},
						template : "<div class='hmi-tool-popup hmi-tool-rotation' data-bind='invisible:popupInvisible'><div class='hmi-tool-title'>" + I18N.prop("HMI_TOOLBAR_ROTATION") + "</div>" +
								"<div class='hmi-tool-body'><input class='hmi-tool-rotation-numeric' data-role='numerictextbox' data-bind='events:{change : change, spin : change}' type='number' min='0' max='360' data-format='#°' class='hmi-tool-rotation' placeholder='" + I18N.prop("HMI_TOOLBAR_INPUT_ANGLE") + "'/></div></div>"
					}),

					ToolbarButton({ id : "hmi-tool-table-insertion", name : "tableInsertion", cssClass : "ic-table-insert group", disabled : true, title : I18N.prop("HMI_TOOLBAR_TABLE_INSERTION"),
						dropDownList : BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig,
							{ id : "hmi-tool-table-insertion-drop", name : "table-insertion-dropdown", value : null, dataSource : tableInsertionDataSource, invisible : true, template: "hmi-table-dropdownlist-template" })
					}),
					ToolbarButton({ id : "hmi-tool-table-delete", name : "tableDelete", cssClass : "ic-table-delete", disabled : true, title : I18N.prop("HMI_TOOLBAR_TABLE_DELETE"),
						dropDownList : BaseViewModel.extendConfig(BaseViewModel.DropDownListConfig,
							{ id : "hmi-tool-table-delete-drop", name : "table-delete-dropdown", value : null, dataSource : tableDeleteDataSource, invisible : true, template: "hmi-table-dropdownlist-template" })
					}),
					ToolbarButton({ id : "hmi-tool-table-merge-cell", name : "mergeCell", cssClass : "ic-table-merge group", disabled : true, title : I18N.prop("HMI_TOOLBAR_TABLE_MERGE_CELL") }),
					ToolbarButton({ id : "hmi-tool-table-unmerge-cell", name : "unmergeCell", cssClass : "ic-table-unmerge", disabled : true, title : I18N.prop("HMI_TOOLBAR_TABLE_UNMERGE_CELL") })
				]
			},
			filters : [
				BaseViewModel.extendConfig({
					type : "template",
					template : "<label class='hmi-create-label'>" + I18N.prop("HMI_FILE_NAME") + "</label>"
				}),
				BaseViewModel.extendConfig(BaseViewModel.ValidatorConfig, {
					id : "hmi-create-name",
					name : "name",
					placeholder : I18N.prop("HMI_FILE_NAME"),
					validatorOptions : {
						type : "hmiGraphicName",
						required : true
					}
				})
				// BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
				// 	id : "hmi-create-fullscreen",
				// 	name : "fullscreen",
				// 	text : I18N.prop("HMI_FULL_SCREEN_START")
				// })
			],
			actions : [
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-create-export-btn",
					name : "export",
					text : I18N.prop("COMMON_BTN_EXPORT")
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-create-import-btn",
					name : "import",
					text : I18N.prop("COMMON_BTN_IMPORT")
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-create-save-btn",
					name : "save",
					text : I18N.prop("COMMON_BTN_SAVE"),
					disabled : true
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-create-exit-btn",
					name : "exit",
					text : I18N.prop("COMMON_BTN_EXIT"),
					invisible : true
				}),
				BaseViewModel.extendConfig(BaseViewModel.ButtonConfig, {
					id : "hmi-create-exit-btn",
					name : "cancel",
					text : I18N.prop("COMMON_BTN_EXIT")
				})
			],
			backgroundImages : {
				invisible : true,
				images : [{ name : "remove", src : Util.addBuildDateQuery(getImageUrl("backgroundthumb/blank.jpg")) },
						  { name : "1", src : Util.addBuildDateQuery(getImageUrl("backgroundthumb/1.png")) },
						  { name : "2", src : Util.addBuildDateQuery(getImageUrl("backgroundthumb/2.png")) },
						  { name : "3", src : Util.addBuildDateQuery(getImageUrl("backgroundthumb/3.png")) },
						  { name : "4", src : Util.addBuildDateQuery(getImageUrl("backgroundthumb/4.png")) },
						  { name : "5", src : Util.addBuildDateQuery(getImageUrl("backgroundthumb/5.png")) }],
				size : "",
				clickSelectBackground : function(){}
			}
		},
		init : function(element){
			var that = this;
			BaseClass.fn.init.call(that, element, { type : "create" });
			that.initCanvas();
			that.initPalette().always(function(){
				HmiApi.getComponents({includeComponent : true}).done(function(components){
					components = HmiModel.createLibraryDataSource(components);
					that.libraryPanelBar = that.libraryPanelBar.kendoHmiLibraryPalette({ canvas : that.canvas, dataSource : components }).data("kendoHmiLibraryPalette");
					that.initColorPicker();
					that.attachPaletteEvt();
					that.attachToolbarEvt();
					that.attachBackgroundSelectorEvt();
				});
			});
		},
		initCanvas : function(){
			var that = this;
			var currentTabIndex = that.tab.getCurrentTabIndex();
			var canvasElement = that.element.find(".hmi-create-canvas").eq(currentTabIndex);
			var canvasWrapper = canvasElement.parent();
			that.canvas = new HmiCanvas(canvasElement, { editable : true, createView : that, wrapper : canvasWrapper });
		},
		initPalette : function(){
			var that = this;
			that.panelElement = $(".hmi-create-panel-wrapper");
			that.panelTab = that.panelElement.find(".hmi-create-panel-tab").kendoCommonTabStrip({ isTopMenu : false, useScrollButton : false }).data("kendoCommonTabStrip");
			that.elementPanelBar = that.panelElement.find(".hmi-create-palette");
			that.libraryPanelBar = that.panelElement.find(".hmi-create-library");
			that.bindingPanelBar = that.panelElement.find(".hmi-create-binding");

			//File List 접근을 위한 변수 추가
			that.monitoringPanelElement = $(".hmi-monitoring-file-control-wrapper");
			that.fileList = that.monitoringPanelElement.find(".hmi-monitoring-file-list").data("kendoHmiFileList");

			return PaletteConfig.getPaletteDataSource().done(function(paletteDataSource){
				that.elementPanelBar = that.elementPanelBar.kendoHmiPalette({ canvas : that.canvas, dataSource : paletteDataSource }).data("kendoHmiPalette");
				that.bindingPanelBar = that.bindingPanelBar.kendoHmiBinding().data("kendoHmiBinding");
			});
		},
		initColorPicker : function(){
			var that = this;
			that.colorPicker = $("<div id='hmi-create-colorpicker'/>").kendoCommonColorPicker({
				hasTransparent : true,
				opacity : true
			}).data("kendoCommonColorPicker");
		},
		attachPaletteEvt : function(){
			var that = this;
			var dropEvt = that.drop.bind(that);
			var dblClickEvt = that.onPaletteDoubleClick.bind(that);
			var clickEvt = that.onPaletteClick.bind(that);
			that.elementPanelBar.bind("drop", dropEvt);
			that.elementPanelBar.bind("dblclick", dblClickEvt);
			that.elementPanelBar.bind("click", clickEvt);
			that.libraryPanelBar.bind("drop", dropEvt);
			that.libraryPanelBar.bind("dblclick", dblClickEvt);
			//that.libraryPanelBar.bind("click", clickEvt);
			that.libraryPanelBar.bind("save", that.librarySaveEvt.bind(that));
			that.libraryPanelBar.bind("delete", that.libraryDeleteEvt.bind(that));
			that.libraryPanelBar.bind("sort", that.librarySortEvt.bind(that));
			that.panelTab.bind("select", that._selectPanelTabEvt.bind(that));
		},
		_selectPanelTabEvt : function(e){
			var that = this;
			var item = e.item;
			if(item){
				var tabIndex = $(item).index();
				var hmiCanvas = that.canvas, canvas = hmiCanvas.canvas;
				if(canvas && tabIndex == BINDING_TAB_INDEX) canvas.binding();
			}
		},
		enableBindingTab : function(isEnabled){
			var that = this;
			//바인딩 탭 활성화/비활성화
			that.panelTab.disableTab(BINDING_TAB_INDEX, !isEnabled);
			var activeIndex = that.panelTab.getActivatedTabIndex();
			if(activeIndex == BINDING_TAB_INDEX && isEnabled){
				var hmiCanvas = that.canvas, canvas = hmiCanvas.canvas;
				if(canvas) canvas.binding();
			}
		},
		activateBindingTab : function(){
			var that = this;
			that.panelTab.activateTabFromIndex(BINDING_TAB_INDEX);
		},
		attachBackgroundSelectorEvt : function(){
			var that = this;
			that.element.find(".hmi-create-background-selector").on("click",
				".hmi-create-background-images .hmi-create-background-selector-item", that.clickBuiltInBgImgEvt.bind(that));
			var bgViewModel = that.viewModel.backgroundImages;
			bgViewModel.set("clickSelectBackground", that.clickBackgroundBtnEvt.bind(that));
		},
		clickBuiltInBgImgEvt : function(e){
			var that = this, target = $(e.target);
			var bgViewModel = that.viewModel.backgroundImages;
			var imgElem = target.closest(".hmi-create-background-selector-item").find("img");
			var name = imgElem.data("name");
			if(name == "remove"){
				that.canvas.setBackground(null);
				bgViewModel.set("size", "");
				bgViewModel.set("invisible", true);
				return;
			}
			var src = imgElem.attr("src");
			HmiUtil.getImageInfoFromUrl(src).always(function(imageInfo){
				that.setBackground(imageInfo);
			});
		},
		clickBackgroundBtnEvt : function(e){
			var that = this;
			var bgViewModel = that.viewModel.backgroundImages;
			bgViewModel.set("invisible", false);
			HmiUtil.getImageInfoFromFile('background-select', 10 * 1024 * 1024).done(function(imageInfo){
				that.setBackground(imageInfo);
			}).fail(function(msg){
				msgDialog.message(msg);
				msgDialog.open();
			});
		},
		setBackground : function(imageInfo){
			var that = this;
			var bgViewModel = that.viewModel.backgroundImages;
			var width = imageInfo.width, height = imageInfo.height, dataUrl = imageInfo.dataUrl;
			if(width < that.canvas.width) width = that.canvas.width;
			if(height < that.canvas.height) height = that.canvas.height;
			var sizeInfo = I18N.prop("HMI_SIZE") + " : " + width + " x " + height;
			bgViewModel.set("size", sizeInfo);
			that.canvas.setBackground(dataUrl);
			bgViewModel.set("invisible", true);
		},
		drop : function(e){
			var that = this;
			that.canvas.onDrop(e);
		},
		onPaletteClick : function(e){
			var that = this;
			that.canvas.onPaletteClick(e);
		},
		onPaletteDoubleClick : function(e){
			var that = this;
			that.canvas.onPaletteDoubleClick(e);
		},
		librarySortEvt : function(e){
			var item = e.item;
			var reOrderedItems = e.reOrderedItems;
			Loading.open();
			HmiApi.patchComponents([item].concat(reOrderedItems)).done(function(){
				e.success();
			}).fail(function(){
				e.fail();
			}).always(function(){
				Loading.close();
			});
		},
		librarySaveEvt : function(e){
			var that = this, item = e.item, libraryPanelBar = that.libraryPanelBar;
			Loading.open(libraryPanelBar.popup.element);
			var ajax;
			if(item._isNew){
				ajax = libraryPanelBar.apiPostComponent(item);
			}else{
				ajax = libraryPanelBar.apiPutComponent(item);
			}

			ajax.done(function(result){
				libraryPanelBar.closePopup();
				toastPopup.show(I18N.prop("HMI_LIBRARY_SAVED"));
			}).fail(function(msg){
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		},
		libraryDeleteEvt : function(e){
			var item = e.item;
			confirmDialog.message(I18N.prop("HMI_LIBRARY_DELETE_POPUP"));
			confirmDialog.setConfirmActions({
				yes : function(){
					Loading.open();
					HmiApi.deleteComponent(item.id).done(function(){
						e.success();
						//Order 전체 업데이트 필요
						toastPopup.show(I18N.prop("HMI_LIBRARY_DELETE_CONFIRM_POPUP"));
					}).fail(function(msg){
						e.fail();
						msgDialog.message(msg);
						msgDialog.open();
					}).always(function(){
						Loading.close();
					});
				},
				no : function(){}
			});
			confirmDialog.open();
		},
		load : function(file, data, isNew){
			var that = this;
			that.setFileName(file.name, true);
			that.tab.setCurrentTabCanvasInfo({id: file.id, name: file.name});
			that._tabCanvasInfo[file.id] = {
				canvas : that.canvas
			};

			that.canvas.load(file, data);
			that.canvas._isNew = isNew;
			that.updateUndoRedoButtonState(false, false);
		},
		setFileName : function(fileName, updateState){
			var that = this;
			var fileNameField = that.getViewModelWidget("name");
			fileNameField.element.val(fileName);
			that._currentFileName = fileName;
			that.updateEditState(updateState);
		},
		create : function(file, isNew){
			var that = this;
			that.tab.setCurrentTabCanvasInfo({id: file.id, name: file.name});
			that.setFileName(file.name, true);
			that.canvas.create();
			that.canvas._isNew = isNew;
		},
		save : function(id){
			var that = this;
			var fileNameField = that.getViewModelWidget("name");
			var fileName = fileNameField.element.val();
			if(fileName) fileName = $.trim(fileName);
			that.canvas.save(id, fileName).done(function(){
				that.setFileName(fileName, true);
				that.tab.setCurrentTabCanvasInfo({id : id, name : fileName});
				toastPopup.show(I18N.prop('HMI_FILE_SAVED'));
				that.canvas._isNew = false;
				that.canvas._isSaved = true;
			});
		},
		clear : function(){
			var that = this;
			that.canvas.clear();
			that.clearTabCanvasInfo();
			if(that.elementPanelBar) that.elementPanelBar.collapse(".k-item", false);
		},
		attachEvent : function(){
			var that = this;

			// var fullScreenBtn = that.getFilterViewModel("fullscreen");
			// fullScreenBtn.set("click", that.clickFullScreenBtnEvt.bind(that));

			var exportBtn = that.getActionViewModel("export");
			exportBtn.set("click", that.clickExportBtnEvt.bind(that));

			var importBtn = that.getActionViewModel("import");
			importBtn.set("click", that.clickImportBtnEvt.bind(that));

			var saveBtn = that.getActionViewModel("save");
			saveBtn.set("click", that.clickSaveBtnEvt.bind(that));

			var exitBtn = that.getActionViewModel("exit");
			exitBtn.set("click", that.clickExitBtnEvt.bind(that));

			var cancelBtn = that.getActionViewModel("cancel");
			cancelBtn.set("click", that.clickCancelBtnEvt.bind(that));

			//파일 이름 키 입력 이벤트. 저장 버튼/활성화 비활성화 한다.
			var nameValidator = that.getViewModelWidget("name");
			nameValidator.element.on("keyup", that.updateSaveButtonState.bind(that));
		},
		attachToolbarEvt : function(){
			var that = this;
			//Toolbar 버튼 이벤트
			var button = that.getToolbarViewModel("undo");
			button.set("click", that.callInnerCanvasFunction.bind(that, "undo"));

			button = that.getToolbarViewModel("redo");
			button.set("click", that.callInnerCanvasFunction.bind(that, "redo"));

			button = that.getToolbarViewModel("binding");
			button.set("click", that.callInnerCanvasFunction.bind(that, "binding", null));

			button = that.getToolbarViewModel("lock");
			button.set("click", that.lock.bind(that, "lock"));
			button.set("setState", that.setButtonState.bind(that));

			//배경 이미지
			button = that.getToolbarViewModel("background");
			button.set("click", that.clickBackgroundToolBtnEvt.bind(that));
			button.set("closePopup", that.closeBackgroundToolBtnEvt.bind(that));

			button = that.getToolbarViewModel("fill");
			//ColorPicker 열기
			button.set("click", that.clickColorPickerToolBtnEvt.bind(that, "fill"));
			button.set("setState", that.setButtonState.bind(that));

			button = that.getToolbarViewModel("select");
			button.set("click", that.callInnerCanvasFunction.bind(that, "select"));

			/*button = that.getToolbarViewModel("shape");
			//도형 선택
			button.set("click", that.clickDropDownToolBtnEvt.bind(that, "shape"));
			button.dropDownList.set("select", that.selectBasicShapeEvt.bind(that));
			button.dropDownList.set("close", that.closeBasicShapeEvt.bind(that));*/

			//텍스트 수평 정렬
			button = that.getToolbarViewModel("textHAlign");
			//정렬 버튼 선택
			button.set("click", that.clickDropDownToolBtnEvt.bind(that, "textHAlign"));
			button.set("setState", that.setButtonState.bind(that));
			button.dropDownList.set("select", that.selectTextAlignEvt.bind(that));
			button.dropDownList.set("close", that.closeDropDownEvt.bind(that));

			//텍스트 수직 정렬
			button = that.getToolbarViewModel("textVAlign");
			//정렬 버튼 선택
			button.set("click", that.clickDropDownToolBtnEvt.bind(that, "textVAlign"));
			button.set("setState", that.setButtonState.bind(that));
			button.dropDownList.set("select", that.selectTextAlignEvt.bind(that));
			button.dropDownList.set("close", that.closeDropDownEvt.bind(that));

			//기본그래픽
			button = that.getToolbarViewModel("text");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "text"));

			button = that.getToolbarViewModel("rect");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "rect"));

			button = that.getToolbarViewModel("rounded");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "rounded"));

			button = that.getToolbarViewModel("parall");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "parall"));

			button = that.getToolbarViewModel("trapez");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "trapez"));

			button = that.getToolbarViewModel("tri");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "tri"));

			button = that.getToolbarViewModel("circle");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "circle"));

			button = that.getToolbarViewModel("straight");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "straight"));

			button = that.getToolbarViewModel("line");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "line"));

			button = that.getToolbarViewModel("curve");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "curve"));

			button = that.getToolbarViewModel("table");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "table"));

			button = that.getToolbarViewModel("picture");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "picture"));

			button = that.getToolbarViewModel("link");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "link"));

			button = that.getToolbarViewModel("zone");
			button.set("click", that.clickBasicShapeToolBtnEvt.bind(that, "zone"));

			//zoom
			button = that.getToolbarViewModel("zoomin");
			button.set("click", that.callInnerCanvasFunction.bind(that, "zoomIn"));

			button = that.getToolbarViewModel("zoomout");
			button.set("click", that.callInnerCanvasFunction.bind(that, "zoomOut"));

			button = that.getToolbarViewModel("zoomlevel");
			button.set("select", that.callInnerCanvasFunction.bind(that, "setZoomLevel"));
			button.set("close", that.callInnerCanvasFunction.bind(that, "setDefaultZoomLevel"));

			button = that.getToolbarViewModel("fullscreen");
			button.set("click", that.clickFullScreenBtnEvt.bind(that));

			/*button = that.getToolbarViewModel("tableMerge");
			button.set("click", that.callInnerCanvasFunction.bind(that, "cellMerge"));

			button = that.getToolbarViewModel("tableVSeperate");
			button.set("click", that.callInnerCanvasFunction.bind(that, "cellSeperate", "vertical"));

			button = that.getToolbarViewModel("tableHSeperate");
			button.set("click", that.callInnerCanvasFunction.bind(that, "cellSeperate", "horizontal"));*/

			button = that.getToolbarViewModel("fontSize");
			//폰트 사이즈 선택
			button.set("select", that.callInnerCanvasFunction.bind(that, "setFontSize"));
			button.set("setState", that.setButtonState.bind(that));

			button = that.getToolbarViewModel("bold");
			button.set("click", that.bold.bind(that, "bold"));
			button.set("setState", that.setButtonState.bind(that));

			button = that.getToolbarViewModel("italic");
			button.set("click", that.italic.bind(that, "italic"));
			button.set("setState", that.setButtonState.bind(that));

			button = that.getToolbarViewModel("fontColor");
			//ColorPicker 열기
			button.set("click", that.clickColorPickerToolBtnEvt.bind(that, "fontColor"));
			button.set("setState", that.setButtonState.bind(that));

			button = that.getToolbarViewModel("lineColor");
			//ColorPicker 열기
			button.set("click", that.clickColorPickerToolBtnEvt.bind(that, "lineColor"));
			button.set("setState", that.setButtonState.bind(that));

			button = that.getToolbarViewModel("lineWidth");
			//굵기 선택
			button.set("click", that.clickDropDownToolBtnEvt.bind(that, "lineWidth"));
			button.set("setState", that.setButtonState.bind(that));
			button.dropDownList.set("select", that.selectLineWidthEvt.bind(that));
			button.dropDownList.set("close", that.closeDropDownEvt.bind(that));

			button = that.getToolbarViewModel("bringTop");
			button.set("click", that.callInnerCanvasFunction.bind(that, "bringToTop"));

			button = that.getToolbarViewModel("sendBottom");
			button.set("click", that.callInnerCanvasFunction.bind(that, "sendToBottom"));

			button = that.getToolbarViewModel("bringForward");
			button.set("click", that.callInnerCanvasFunction.bind(that, "increaseZOrder"));

			button = that.getToolbarViewModel("sendBackward");
			button.set("click", that.callInnerCanvasFunction.bind(that, "decreaseZOrder"));

			button = that.getToolbarViewModel("matchSize");
			button.set("click", that.callInnerCanvasFunction.bind(that, "matchSize"));

			button = that.getToolbarViewModel("matchWidth");
			button.set("click", that.callInnerCanvasFunction.bind(that, "matchWidth"));

			button = that.getToolbarViewModel("matchHeight");
			button.set("click", that.callInnerCanvasFunction.bind(that, "matchHeight"));

			button = that.getToolbarViewModel("alignLeft");
			button.set("click", that.callInnerCanvasFunction.bind(that, "alignFigure", "left"));

			button = that.getToolbarViewModel("alignRight");
			button.set("click", that.callInnerCanvasFunction.bind(that, "alignFigure", "right"));

			button = that.getToolbarViewModel("alignTop");
			button.set("click", that.callInnerCanvasFunction.bind(that, "alignFigure", "top"));

			button = that.getToolbarViewModel("alignBottom");
			button.set("click", that.callInnerCanvasFunction.bind(that, "alignFigure", "bottom"));

			button = that.getToolbarViewModel("alignHcenter");
			button.set("click", that.callInnerCanvasFunction.bind(that, "alignFigure", "center_h"));

			button = that.getToolbarViewModel("alignVcenter");
			button.set("click", that.callInnerCanvasFunction.bind(that, "alignFigure", "center_v"));

			button = that.getToolbarViewModel("alignHGap");
			button.set("click", that.callInnerCanvasFunction.bind(that, "equalGap", "horizontal"));

			button = that.getToolbarViewModel("alignVGap");
			button.set("click", that.callInnerCanvasFunction.bind(that, "equalGap", "vertical"));

			button = that.getToolbarViewModel("flipV");
			button.set("click", that.callInnerCanvasFunction.bind(that, "vFlip"));

			button = that.getToolbarViewModel("flipH");
			button.set("click", that.callInnerCanvasFunction.bind(that, "hFlip"));

			button = that.getToolbarViewModel("group");
			button.set("click", that.callInnerCanvasFunction.bind(that, "group"));

			button = that.getToolbarViewModel("ungroup");
			button.set("click", that.callInnerCanvasFunction.bind(that, "ungroup"));

			button = that.getToolbarViewModel("rotationRight");
			button.set("click", that.callInnerCanvasFunction.bind(that, "rotation", "right"));

			button = that.getToolbarViewModel("rotationLeft");
			button.set("click", that.callInnerCanvasFunction.bind(that, "rotation", "left"));

			button = that.getToolbarViewModel("rotation");
			button.set("click", that.clickRotationToolBtnEvt.bind(that, "rotation"));
			button.set("change", that.callInnerCanvasFunction.bind(that, "rotation"));
			button.set("onClose", that.onCloseRotationToolBtnEvt.bind(that, "rotation"));
			that.attachKeyupEvtRotationToolBtn(button);
			button.set("closePopup", that.closeToolbarPopupEvt.bind(button));

			button = that.getToolbarViewModel("tableInsertion");
			button.set("click", that.clickDropDownToolBtnEvt.bind(that, "tableInsertion"));
			button.dropDownList.set("select", that.selectTableInsertionEvt.bind(that));
			button.dropDownList.set("close", that.closeDropDownEvt.bind(that));

			button = that.getToolbarViewModel("tableDelete");
			button.set("click", that.clickDropDownToolBtnEvt.bind(that, "tableDelete"));
			button.dropDownList.set("select", that.selectTableDeleteEvt.bind(that));
			button.dropDownList.set("close", that.closeDropDownEvt.bind(that));


			button = that.getToolbarViewModel("mergeCell");
			button.set("click", that.callInnerCanvasFunction.bind(that, "tableAction", "mergeCell"));

			button = that.getToolbarViewModel("unmergeCell");
			button.set("click", that.callInnerCanvasFunction.bind(that, "tableAction", "unmergeCell"));
		},
		callInnerCanvasFunction : function(functionName, arg1, arg2){
			var that = this;
			var hmiCanvas = that.canvas;
			var canvas = hmiCanvas.canvas;
			var canvasFunction = canvas[functionName];
			if (!canvasFunction) {
				console.error("There is no function '" + functionName + "' in canvas.");
				return;
			}
			if (functionName == 'zoomIn' || functionName == 'zoomOut') arg1 = null;
			canvasFunction.call(canvas, arg1, arg2);
		},
		clickDropDownToolBtnEvt : function(buttonName){
			var that = this, button = that.getToolbarViewModel(buttonName);
			that._openDropDownList(button);
		},
		clickBasicShapeToolBtnEvt : function(buttonName){
			var that = this, button = that.getToolbarViewModel(buttonName);
			var value = button.get("value");
			var item = PaletteConfig.getData(value);
			if (this._activeBasicShapeBtn) that.clearBasicShapeBtnActive();
			that._activeBasicShapeBtn = $('#' + button.id).addClass('active');
			that.canvas.onPaletteClick({ item : item, buttonName : buttonName });
		},
		clearBasicShapeBtnActive : function(){
			if (this._activeBasicShapeBtn) {
				this._activeBasicShapeBtn.removeClass('active');
				this._activeBasicShapeBtn = null;
			}
		},
		selectTextAlignEvt : function(e){
			var that = this, dataItem = e.dataItem;
			that.canvas.textAlign(dataItem.id);
			var button, value = dataItem.id, className = dataItem.className;
			if(value == "left" || value == "center" || value == "right"){
				button = that.getToolbarViewModel("textHAlign");
			}else{
				button = that.getToolbarViewModel("textVAlign");
			}
			that.switchButtonClass(button.id, "text-align", className);
			that.selectDropDownListData(button, 'ic-text-align-' + value);
		},
		selectBasicShapeEvt : function(e){
			var that = this, dataItem = e.dataItem;
			that.canvas.createbasicShape(dataItem.id);
		},
		closeDropDownEvt : function(e){
			//드롭 다운 리스트 선택 상태 초기화
			e.sender.select(-1);
		},
		_openDropDownList : function(button){
			var buttonElement = $("#" + button.id);
			var dropDownList = $("#" + button.dropDownList.id).data("kendoDropDownList");
			var offset = buttonElement.offset();
			var height = buttonElement.height();
			offset.top = offset.top + height + 10;
			//shapeDropDownList._isOpened = true;
			dropDownList.open(offset);
		},
		selectLineWidthEvt : function(e){
			var that = this, dataItem = e.dataItem;
			that.canvas.setLineWidth(dataItem.id);
			that.selectDropDownListData(e.data, dataItem.id);
		},
		selectTableInsertionEvt : function(e){
			var dataItem = e.dataItem;
			var hmiCanvas = this.canvas || {};
			var canvas = hmiCanvas.canvas;
			if (!canvas) {
				console.error("There is no Canvas Instance.");
				return;
			}
			canvas.tableAction('add', dataItem.id);
		},
		selectTableDeleteEvt : function(e){
			var dataItem = e.dataItem;
			var hmiCanvas = this.canvas || {};
			var canvas = hmiCanvas.canvas;
			if (!canvas) {
				console.error("There is no Canvas Instance.");
				return;
			}
			canvas.tableAction('remove', dataItem.id);
		},
		clickRotationToolBtnEvt : function(toolName){
			var that = this;
			var button = that.getToolbarViewModel(toolName);
			button.set("popupInvisible", false);
			that._closeToolbarPopupEvt = that.closeToolbarPopupEvt.bind(button);
			$(document).on("click", that._closeToolbarPopupEvt);
			return false;
		},
		onCloseRotationToolBtnEvt : function(toolName){
			var that = this;
			var button = that.getToolbarViewModel(toolName);
			var id = button.id;
			var buttonElement = $("#" + id);
			var numericElement = buttonElement.closest("li").find(".hmi-tool-rotation-numeric[data-role='numerictextbox']");
			var numeric = numericElement.data("kendoNumericTextBox");
			numeric.value(null);
		},
		attachKeyupEvtRotationToolBtn : function(button){
			var id = button.id;
			var buttonElement = $("#" + id);
			var numericElement = buttonElement.closest("li").find(".hmi-tool-rotation-numeric[data-role='numerictextbox']");
			var numeric = numericElement.data("kendoNumericTextBox");
			numeric.element.on("keyup", function(e){
				var max = numeric.options.max;
				var min = numeric.options.min;
				var value = $(this).val();
				value = Number(value);
				if(value > max){
					$(this).val(max);
					value = max;
				}else if(value < min){
					$(this).val(min);
					value = min;
				}
				clearTimeout(button.timeout);
				button.timeout = setTimeout(function(){
					button.change(value);
				}, 500);
			});
		},
		closeToolbarPopupEvt : function(e){
			var that = this;
			var target = $(e.target);
			if(target.closest(".hmi-tool-popup").length < 1){
				that.set("popupInvisible", true);
				$(document).off("click", that._closeToolbarPopupEvt);
				if(that.onClose) that.onClose({ sender : that });
				return true;
			}
			return false;
		},
		clickColorPickerToolBtnEvt : function(toolName){
			var that = this;
			var button = that.getToolbarViewModel(toolName);
			var currentColor = that.canvas.getColor(button);
			var buttonElement = $("#" + button.id);
			var colorPicker = that.colorPicker;
			this.setColorPickerOpenState(true);
			colorPicker.close();
			colorPicker.value(currentColor);
			button.set("color", currentColor);
			colorPicker.unbind("change");
			colorPicker.bind("change", function(e){
				var color = e.value;
				//버튼 라인 색상 변경 이벤트
				button.set("color", color);
				//선택한 그래픽 객체의 색상 변경
				that.canvas.changeColor(button, color);
			});
			if (!that._closeColorPickerEvt) that._closeColorPickerEvt = that.closeColorPickerEvt.bind(that);
			colorPicker.unbind("close", that._closeColorPickerEvt);
			colorPicker.bind("close", that._closeColorPickerEvt);
			var position = buttonElement.offset();
			var height = buttonElement.height();
			var left = position.left;
			var top = position.top + height + 10;

			colorPicker.position({ top : top, left : left });
			colorPicker.open();
			return false;
		},
		clickBackgroundToolBtnEvt : function(e){
			var that = this;
			var bgViewModel = that.viewModel.backgroundImages;
			bgViewModel.set("invisible", false);
			//if(that._closeBgSelector) $(document).off("click", that._closeBgSelector);
			that._closeBgSelector = that.closeBackgroundSelector.bind(that);
			$(document).on("click", that._closeBgSelector);
			return false;
		},
		closeBackgroundToolBtnEvt : function(e){
			var that = this;
			var bgViewModel = that.viewModel.backgroundImages;
			if(!bgViewModel.invisible) bgViewModel.set("invisible", true);
		},
		closeBackgroundSelector : function(e){
			var that = this;
			var bgViewModel = that.viewModel.backgroundImages;
			var target = $(e.target);
			if(target.hasClass("image-info-input")){	//배경 이미지 찾아보기 버튼 클릭할 시의 예외처리
				return true;
			}
			if(target.closest(".hmi-create-background-selector").length < 1){
				bgViewModel.set("invisible", true);
				$(document).off("click", that._closeBgSelector);
				return true;
			}

			return false;
		},
		setColorPickerOpenState : function(isOpened){
			this._isOpenedColorPicker = isOpened;
		},
		closeColorPickerEvt : function(e){
			this.setColorPickerOpenState(false);
		},
		getColorPickerOpenedState : function(){
			return this._isOpenedColorPicker;
		},
		clickFullScreenBtnEvt : function(e){
			var that = this;
			that.setFullScreen(!that._isFullScreen);
		},
		setFullScreen : function(isEnabled){
			var that = this, btn = that.getToolbarViewModel("fullscreen");
			that._isFullScreen = isEnabled;
			if(isEnabled){
				that.element.addClass("full-screen");
				btn.set("title", I18N.prop("HMI_FULL_SCREEN_END"));
			}else{

				that.element.removeClass("full-screen");
				btn.set("title", I18N.prop("HMI_FULL_SCREEN_START"));
			}
		},
		clickExportBtnEvt : function(){
			var that = this;
			var fileNameField = that.getViewModelWidget("name");
			var fileName = fileNameField.element.val();
			that.canvas.export(fileName);
		},
		clickImportBtnEvt : function(){
			var that = this;
			var fileNameField = that.getViewModelWidget("name");
			var canvas = that.canvas;
			var hasModels = canvas.hasModels();
			if (!hasModels) {
				canvas.import(fileNameField).done(function(){
					that.updateEditState(false);
				});
			} else {
				confirmDialog.message(I18N.prop("HMI_IMPORT_NEW_TAB"));
				confirmDialog.setConfirmActions({
					yes : function(){
						that._isImportFile = true;
						that.tab.addTab();
					},
					no : function(){
						canvas.import(fileNameField).done(function(){
							that.updateEditState(false);
						});
					}
				});
				confirmDialog.open();
			}
		},
		clickExitBtnEvt : function(){
			var that = this;
			//var saveBtn = that.getActionViewModel("save");
			var fileNameField = that.getViewModelWidget("name");
			if(that._isSaved){ //아무것도 수정이 되지 않았을 경우와 Save 된 직후 체크
				that.trigger("click", "exit");
				fileNameField.hideMessages();
			}else{
				confirmDialog.message(I18N.prop("HMI_CANCEL_MSG"));
				confirmDialog.setConfirmActions({
					yes : function(){
						that.trigger("click", "exit");
						fileNameField.hideMessages();
					},
					no : function(){}
				});
				confirmDialog.open();
			}
		},
		clickCancelBtnEvt : function(e){
			var that = this;
			var tab = that.tab;
			var currentIndex = typeof e.index == "number" ? e.index : tab.getCurrentTabIndex();
			var scrollArea = $(tab.scrollbar.scrollArea[0]);
			var closeBtn = scrollArea.find('.ic-close').eq(currentIndex);
			var id = e.id || tab.getCurrentTabCanvasInfo().id;
			var canvasInfo = that.getCanvasInfo(id);
			var isSaved = canvasInfo ? canvasInfo.canvas._isSaved : that._isSaved;
			var isNew = canvasInfo ? canvasInfo.canvas._isNew : that.canvas._isNew;

			if (isSaved){
				closeBtn.trigger('click');
			} else {
				confirmDialog.message(I18N.prop("HMI_CANCEL_MSG"));
				confirmDialog.setConfirmActions({
					yes : function(){
						if (!isNew){ //새로 생성된 파일이 아닐 경우
							if (canvasInfo) canvasInfo.canvas._isSaved = true;
							else that.updateEditState(true);
							closeBtn.trigger('click');
						} else { //새로 생성된 파일일 경우
							that.deleteFileBeforeCloseTab(closeBtn, id);
						}
					},
					no : function(){}
				});
				confirmDialog.open();
			}
		},
		clickSaveBtnEvt : function(){
			var that = this;
			var canvasInfo = that.tab.getCurrentTabCanvasInfo();
			that.trigger("click", "save", canvasInfo);
		},
		//새 파일을 저장하지 않고 종료 할 경우 다시 파일을 삭제한다
		deleteFileBeforeCloseTab : function(closeBtn, id) {
			var that = this;
			Loading.open();
			that.fileList.apiDeleteFile({ id : id }).done(function(){
				//
				that._tabCanvasInfo[id].canvas._isNew = false;
				var canvasInfo = that.getCanvasInfo(id);
				canvasInfo.canvas._isNew = false;
				canvasInfo.canvas._isSaved = true;
				closeBtn.trigger('click');
			}).fail(function(msg){
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});

		},
		getToolbarViewModel : function(name){
			var that = this;
			var key, buttons = that.viewModel.buttons;
			var i, length, row, button;
			for( key in buttons ){
				row = buttons[key];
				//Key가 Number인 것만 처리한다.
				if(isNaN(Number(key))) continue;
				length = row.length;
				for( i = 0; i < length; i++ ){
					button = row[i];
					if(button.name == name) return button;
				}
			}
			return null;
		},
		updateEditState : function(isSaved){
			var that = this;
			if(!that.isAbleChangeButtonState()) return;
			that._isSaved = isSaved;
			var saveBtn = that.getActionViewModel("save");
			saveBtn.set("disabled", isSaved);
			var cancelBtn = that.getActionViewModel("cancel");
			var btnText = isSaved ? I18N.prop("COMMON_BTN_EXIT") : I18N.prop("COMMON_BTN_CANCEL");
			cancelBtn.set("text", btnText);
			var id = that.tab.getCurrentTabCanvasInfo().id;
			var canvasInfo = that.getCanvasInfo(id);
			canvasInfo.canvas._isSaved = isSaved;
		},
		updateSaveButtonState : function(){
			var that = this;
			var nameValidator = that.getViewModelWidget("name");
			var saveBtn = that.getActionViewModel("save");
			//var hmiCanvas = that.canvas;
			//var isValidate = nameValidator.validate() && hmiCanvas.hasGraphicElements();
			var isValidate = nameValidator.validate();
			var changedName = nameValidator.element.val();
			var isChangedName = isValidate && (that._currentFileName != changedName);

			if(!that.isAbleChangeButtonState()) return;

			if(isChangedName){	//편집 시, 파일 이름 변경 시에 저장 버튼 활성화
				that._currentFileName = changedName;
				// saveBtn.set("disabled", !isChangedName);
				that.updateEditState(!isChangedName);
			}else{	//생성, 편집 시 그래픽 객체 추가/삭제/이동 시에 활성화
				saveBtn.set("disabled", !(!that._isSaved && isValidate));
			}
		},
		isAbleChangeButtonState : function(){
			var canvas = this.canvas;
			if (!canvas) return false;
			var innerCanvas = canvas.canvas;
			return !(innerCanvas._isGraphicLoading || innerCanvas._isPollingUpdate || innerCanvas._isClearing);
		},
		updateToolbarButtonState : function(){
			var that = this;
			var canvas = that.canvas;
			if(canvas){	//Canvas가 Init 완료 되기 전에 호출되는 것에 대한 예외 처리
				var toolbarButtonDisabled = canvas.getToolbarButtonDisabledState();
				that.updateButtonDisableState(toolbarButtonDisabled);
				that.colorPicker.close();
			}
		},
		updateUndoRedoButtonState : function(isUndoEnabled, isRedoEnabled){
			var that = this;
			var canvas = that.canvas;
			var innerCanvas = canvas.canvas || {};
			if (innerCanvas._isGraphicLoading || innerCanvas._isPollingUpdate) return;
			var button = that.getToolbarViewModel("undo");
			button.set("disabled", !isUndoEnabled);
			button = that.getToolbarViewModel("redo");
			button.set("disabled", !isRedoEnabled);
		},
		updateButtonDisableState : function(buttonObj){
			var that = this, button, buttonName, disabled, buttonState;
			for( buttonName in buttonObj ){
				button = that.getToolbarViewModel(buttonName);
				if(button){
					disabled = button.get("disabled");
					buttonState = buttonObj[buttonName];
					if(typeof buttonState === "object") button.setState(button, buttonState);
					else if(disabled != buttonState) button.set("disabled", buttonState);
					if(button.closePopup) button.closePopup({ sender : button });	//캔버스 클릭 시, 그래픽 객체 선택은 풀리는데 document "click" 이벰트가 트리거되지 않는 현상으로 인하여 만들어진 콜백
				}
			}
		},
		setButtonState : function(button, state){
			var that = this, name = button.name, disabled = state.disabled, value = state.value, id = button.id;
			button.set("disabled", disabled);
			if(name == "textVAlign" || name == "textHAlign"){
				if(!value){
					if(name == "textVAlign") value = "top";
					else value = "left";
				}
				value = "ic-text-align-" + value;
				that.switchButtonClass(id, "text-align", value);
				that.selectDropDownListData(button, value);
			}else if(name == "fontSize"){
				if(!value) value = HmiCommon.DEFAULT_FONT_SIZE;
				button.set("value", value);
			}else if(name == "bold" || name == "italic" || name == "lock"){
				var removeClass, addClass;
				if(value) addClass = "active";
				else removeClass = "active";
				that.switchButtonClass(id, removeClass, addClass);
			}else if(name == "lineWidth"){
				that.selectDropDownListData(button, value);
			}else if(name == "fill" || name == "lineColor" || name == "fontColor"){
				button.set("color", that.canvas.getColor(button));
			}
		},
		setZoomButtonState : function(zoomlevel){
			var button = this.getToolbarViewModel("zoomlevel");
			if (button) button.set("value", zoomlevel);
		},
		selectDropDownListData : function(button, value){
			var dropDownList = button.dropDownList, ds = dropDownList.dataSource;
			ds.forEach(function(data){
				data.set('selected', (data.className == value || data.id == value) ? 'k-state-selected' : '');
			});
		},
		lock : function(name){
			var that = this;
			var button = that.getToolbarViewModel(name);
			var id = button.id;
			var element = $("#" + id);
			element.toggleClass("active");
			var hmiCanvas = that.canvas, canvas = hmiCanvas.canvas;
			canvas.lock.call(canvas);
		},
		bold : function(name){
			var that = this;
			var button = that.getToolbarViewModel(name);
			var id = button.id;
			var element = $("#" + id);
			var isBold;
			if(element.hasClass("active")) {
				element.removeClass("active");
				isBold = false;
			} else {
				element.addClass("active");
				isBold = true;
			}
			var hmiCanvas = that.canvas, canvas = hmiCanvas.canvas;
			canvas.bold.call(canvas, isBold);
		},
		italic : function(name){
			var that = this;
			var button = that.getToolbarViewModel(name);
			var id = button.id;
			var element = $("#" + id);
			var isItalic;
			if(element.hasClass("active")) {
				element.removeClass("active");
				isItalic = false;
			} else {
				element.addClass("active");
				isItalic = true;
			}
			var hmiCanvas = that.canvas, canvas = hmiCanvas.canvas;
			canvas.italic.call(canvas, isItalic);
		},
		switchButtonClass : function(id, removeClassName, className){
			var element, i, max, classList;
			element = $("#" + id);
			element = element.get(0);
			classList = element.classList;
			max = classList.length;
			if(removeClassName){
				for( i = 0; i < max; i++ ){
					if(classList[i].indexOf(removeClassName) != -1){
						classList.remove(classList[i]);
						break;
					}
				}
			}

			if(className) classList.add(className);
		},
		beforeTabChangeEvt : function(e){
			BaseClass.fn.beforeTabChangeEvt.call(this, e);
			var saveBtn = this.getActionViewModel("save");
			var saveBtnDisabled = saveBtn.get("disabled");
			var tabCanvasInfo = this._tabCanvasInfo[e.id] || {};
			tabCanvasInfo["saveBtnDisabled"] = saveBtnDisabled;
			tabCanvasInfo["currentFileName"] = this._currentFileName || tabCanvasInfo.name;
		},
		afterTabChangeEvt : function(e){
			BaseClass.fn.afterTabChangeEvt.call(this, e);
			var canvasInfo = this.tab.getCurrentTabCanvasInfo();
			var currentTabCanvasInfo = this._tabCanvasInfo[canvasInfo.id] || {};
			var saveBtnDisabled = currentTabCanvasInfo.saveBtnDisabled;
			if(typeof saveBtnDisabled == "undefined") saveBtnDisabled = true;
			this.setFileName(currentTabCanvasInfo.currentFileName, saveBtnDisabled);
			if(this.elementPanelBar) this.elementPanelBar.updateDroppableCanvas();
			if(this.libraryPanelBar) this.libraryPanelBar.updateDroppableCanvas();
			// this.palette.options.canvas = this.canvas;
		},
		setCanvasInfoCurrentTab : function(canvasInfo) {
			this._isInitCreateCanvas = true;
			BaseClass.fn.setCanvasInfoCurrentTab.call(this, canvasInfo);
			var tabCanvasInfo = this.getCanvasInfo(canvasInfo.id);
			if (tabCanvasInfo.canvas) tabCanvasInfo.canvas._isNew = canvasInfo.isNew;
			this._isInitCreateCanvas = false;
		},
		// 새 탭이 생성될 때 fileList에서 addFile 후 apiPostFile 호출하여 파일 정보를 먼저 저장한다.
		addTabEvt : function(e){
			var that = this;
			//캔버스를 초기화 중이거나 새 파일을 생성중이라면 그대로 진행한다
			if (!that._isInitCreateCanvas && !that._isAddNewFile) {
				e.preventDefault();
			} else return;

			that._isAddNewFile = true;
			var fileList = that.fileList;
			var newFile = fileList.addFile();
			Loading.open();
			fileList.apiPostFile(newFile).done(function(resultFile){
				that.tab.addTab(resultFile.name, resultFile.id);
				that.canvas._isNew = true;
				that._isAddNewFile = false;
			}).fail(function(msg){
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});

		},
		addedTabEvt : function(canvasInfo){
			var that = this;
			BaseClass.fn.addedTabEvt.call(that, canvasInfo);
			that.setFileName(canvasInfo.name, false);
			if (that._isImportFile){
				var canvas = that.canvas;
				var fileNameField = that.getViewModelWidget("name");
				canvas.import(fileNameField).done(function(){
					that.updateEditState(false);
				});
				that._isImportFile = false;
			}
		},
		deleteTabEvt : function(e){
			BaseClass.fn.deleteTabEvt.call(this, e);
			var tabCanvasInfo = this.getCanvasInfo(e.id);
			var isSaved = tabCanvasInfo.canvas._isSaved;
			var isNew = tabCanvasInfo.canvas._isNew;
			if (!isSaved) {
				e.preventDefault();
				this.clickCancelBtnEvt(e);
				return;
			}
			//삭제하려는 탭이 새로 생성된 탭(파일)이라면 삭제 API를 요청한다.
			if (isNew) {
				e.preventDefault();
				this.deleteFileBeforeCloseTab($(e.currentTarget), e.id);
			}
		},
		deletedTabEvt : function(id){
			BaseClass.fn.deletedTabEvt.call(this, id);
			var len = this.tab.contentElements.length;
			if (len == 0) {
				// this.clickExitBtnEvt();
				this.trigger("click", "exit");
			}
		},
		setCurrentTabZoomLevel : function(level){
			BaseClass.fn.setCurrentTabZoomLevel.call(this, level);
			this.setZoomButtonState(level);
		},
		show : function(){
			this.element.show();
			this.tab.show();
			this.panelElement.show();
			this.setZoomButtonState(100);
		},
		hide : function(){
			this.element.hide();
			this.tab.hide();
			this.panelElement.hide();
		}
	});

	return {
		ViewModelClass : createViewModelClass
	};
});
//# sourceURL=hmi/view-model/hmi-create-vm.js
