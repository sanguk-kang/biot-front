define("hmi/config/rappid-canvas", ["hmi/hmi-common", "hmi/hmi-util", "hmi/config/popup-config", "hmi/config/palette-config",
	"hmi/config/rappid-element", "hmi/config/rappid-extended-class"],
function(HmiCommon, HmiUtil, PopupConfig, PaletteConfig, RappidElement, RappidExtendedClass){
	"use strict";

	var msgDialog = PopupConfig.msgDialog;
	var kendo = window.kendo;
	var I18N = window.I18N;
	var Loading = HmiUtil.Loading;
	var localStorage = window.localStorage;
	var toastPopup = HmiCommon.toastPopup;

	//lodash
	var _ = window._;
	var g = window.g;
	var joint = window.joint;
	var normalizeEvent = joint.util.normalizeEvent;

	var Graph = RappidExtendedClass.Graph, Paper = RappidExtendedClass.Paper,
		Selection = RappidExtendedClass.Selection,
		CommandManager = RappidExtendedClass.CommandManager,
		FreeTransform = RappidExtendedClass.FreeTransform,
		TextEditor = RappidExtendedClass.TextEditor,
		PaperScroller = RappidExtendedClass.PaperScroller;

	//var Draw2DCanvas =  draw2d.Canvas.extend({
	var RappidCanvas = kendo.Class.extend({
		options : {
			editable : false,
			createView : null,
			wrapper : null
		},
		init : function(element, id, options){
			var that = this;
			that.options = $.extend(true, {}, that.options, options);
			that.element = element;
			that.isEditable = that.options.editable;
			that.createView = that.options.createView;
			that.baseCanvas = that.options.baseCanvas;
			that.wrapper = that.options.wrapper;

			/*
				Canvas 초기화
				Graph는 Model
				Paper는 View
			*/
			that.graph = this.options.model = that.options.model ? that.options.model : new Graph();
			var gridSize = that.options.gridSize ? that.options.gridSize : HmiCommon.DEFAULT_GRID_WIDTH;
			var width = that.options.width, height = that.options.height;
			var paper = that.paper = new Paper({
				el : that.element.get(0),
				model : that.graph,
				width : width,
				height : height,
				// interactive : that.isEditable,
				gridSize : gridSize,
				restrictTranslate : function() {
					return {
						x : 0,
						y : 0,
						width : HmiCommon.DEFAULT_CANVAS_WIDTH,
						height : HmiCommon.DEFAULT_CANVAS_HEIGHT
					};
				},
				drawGrid : that.isEditable ? "mesh" : null,
				interactive : false		// Selection에서 move, FreeTransform에서 resize, rotate를 하기 때문에 기본 액션을 막음.
				// interactive : function(cellView) {
				// 	if (!that.isEditable || cellView.model.prop('isLocked') || !cellView.model.prop('isSelected')) {
				// 		return {
				// 			elementMove: false
				// 		};
				// 	}
				// 	return true;
				// }
			});

			that.graph._paper = paper;
			paper._canvas = that;

			that.graph.on({
				'add': function () {
					that.reorderZOrder(this.getElements());
					that.updateSaveState();
				},
				'remove': function () {
					if(!that._isClearing){
						that.reorderZOrder(this.getElements());
						that.updateSaveState();
					}
				},
				'change': function () {
					if (!that._isPreventUpdate) that.updateSaveState();
				},
				'transform:rotate': function(elem, newAngle) {
					var prevAttr = elem._previousAttributes || {};
					var prevAngle = prevAttr.angle || 0;
					var deltaAngle = newAngle - prevAngle;
					var models = that.models;
					var angle;
					models.forEach(function(model){
						if(model == elem) return;
						angle = model.angle();
						model.rotate(angle + deltaAngle, true);
					});
				}
			});


			var paperScroller = that.paperScroller = new PaperScroller({
				paper: paper,
				// autoResizePaper: true,	// true 시 페이퍼 범위를 벗어나면 페이퍼 확장
				contentOptions: {
					allowNewOrigin : 'positive'	// 페이퍼 확장 방향 정의
				},
				cursor: 'grab',
				padding: {
					left: 0,
					top: 0,
					right: 0,
					bottom: 0
				}
			});
			//element.find('.paper-container').append(paperScroller.el);
			this.wrapper.append(paperScroller.el);
			paperScroller.render();

			paperScroller.on('scroller:mousewheel', function(evt) {
				evt.preventDefault();
				var offset = that.getPaperOffsetWithMouseEvent(evt);
				if (evt.deltaY < 0) that.zoomOut(offset);
				else if (evt.deltaY > 0) that.zoomIn(offset);
			});

			//마우스 드래그 시, 스크롤 이동
			paper.on('blank:pointerdown', function (evt) {
				//shift키 선택시 selection 활성화
				if (!evt.shiftKey) paperScroller.startPanning(evt);

				//텍스트 편집기 열려 있을 경우 닫기
				TextEditor.close();
			});

			paperScroller.on('pan:stop', function(evt) {
				var va = paperScroller.getVisibleArea();
				that._scrollTop = evt.scrollTop + (va.height / 2);
				that._scrollLeft = evt.scrollLeft + (va.width / 2);
			});

			if(that.isEditable){
				//객체 간 스냅 라인
				that.snaplines = new joint.ui.Snaplines({ paper: paper });

				paperScroller.center();
				//Rotation용 포인터
				// paper.on('cell:pointerdown', that.createSelectionPoint.bind(that));
				//도형 생성 중에는 freeTransform을 생성하지 않음
				that.isCreateShape = false;
				//도형 생성중 마우스 무브 이벤트 핸들용 변수
				that.isCreateMoving = false;

				that.selection = new Selection({
					paper : paper,
					strictSelection: true,
					useModelGeometry: true,
					filter: function (model) {
						return model.prop('binding/locked');
					},
					createView : that.createView
				});
				// selection의 collection, 선택된 element(model) 집합
				that.models = that.selection.collection;
				//Selection 설정
				paper.on('blank:pointerdown', function (evt) {
					if (that.createView.getColorPickerOpenedState()) return;
					// 도형 생성중이 아닐 때만 선택, shift 누르고 있을 때 에만
					if (!that.isCreateShape && evt.shiftKey) that.selection.startSelecting(evt);
					else if (!evt.shiftKey) {
						that.selection.cancelSelection();
					}
				});
				paper.on('element:pointerdown', function(cellView, evt) {
					if (that.createView.getColorPickerOpenedState()) return;
					var isLocked = cellView.model ? cellView.model.prop('binding/locked') : false;

					if (!that.isCreateShape && evt.shiftKey && isLocked) {
						that.selection.startSelecting(evt);
						return;
					}

					that.createSelectionPoint(cellView, evt);
					// shiftKey가 아닐 경우 collection 초기화
					if (!evt.shiftKey) {
						that.clearTableCellSelect();
						that.models.reset([]);
					}
					var modelsHasLocked = false;
					var models = that.models;
					if (!that.isCreateShape) {
						if (models.length == 0) models.add(cellView.model);
						else {
							models.forEach(function(model) {
								if (model.prop('binding/locked')) modelsHasLocked = true;
							});
							if (modelsHasLocked == isLocked) models.add(cellView.model);
						}
					}
				});
				// Selection 상태 변경시 툴바 버튼 상태 변경
				paper.on('selection:changed', function() {
					that.createView.updateToolbarButtonState();
					that.updateBindingTabState();
				});
				paper.on('selection:cancelSelection', that.clearTableCellSelect.bind(that, true));
				that.selection.on('selection-box:pointerdown', function(elementView, evt) {
					if (evt.shiftKey) {
						var model = elementView.model;
						that.models.remove(model);
						var isLocked = model.prop('binding/locked');
						if (isLocked) {
							that.selection.startSelecting(evt);

						}
					}
				});

				this.clipboard = new joint.ui.Clipboard();

				this.commandManager = new CommandManager({
					graph: that.graph,
					createView: that.createView,
					cmdBeforeAdd: function(cmdName, cell, graph, opts){
						var propertyPath = (opts && opts.propertyPath) || '';
						if (propertyPath.indexOf('info/href') != -1) return false;
						if (cmdName == 'change:series') return false;
						return !(that._isGraphicLoading || that._isPollingUpdate || that._isBackground || that._isClearing);
					}
				});

				/*
					Rappid JS
					Keyboard 이벤트
				*/
				this.keyboard = new joint.ui.Keyboard();
				this.attachKeyboardEvt();

				//table 셀 선택 이벤트
				paper.on('element:table-cell:click', function(elementView, evt){
					var model = elementView.model;
					if(model) model.trigger('element:table-cell:click', elementView, evt);
				});

				//table resize handle 선택 이벤트
				paper.on('element:table-resize:click', function(elementView, evt){
					var model = elementView.model;
					if(model) model.trigger('element:table-resize:click', elementView, evt);
				});

				paper.on('element:table-selection:changed', function(){
					that.createView.updateToolbarButtonState();
				});

				paper.on('element:zone-name:click', function(elementView, evt){
					var model = elementView.model;
					if(model) model.trigger('element:zone-name:click', elementView, evt);
				});
			}else{
				paper.on('element:pointerdown', function(elementView, evt){
					var model = elementView.model;
					var type = model.prop('binding/type');
					if (type != 'ScaleBar' && type != 'Zone') {
						paperScroller.startPanning(evt);
					} else {
						that._isDragging = model.prop('binding/type') != 'ScaleBar';
						that._dragStartEvt = evt;
					}
				});
				paper.on('element:pointermove', function(elementView, evt){
					if (that._isDragging && !that._isPanning &&
							Math.abs(that._dragStartEvt.clientX - evt.clientX) > 0.1 &&
							Math.abs(that._dragStartEvt.clientY - evt.clientY) > 0.1) {
						paperScroller.startPanning(that._dragStartEvt);
						that._isPanning = true;
					}
				});
				paper.on('element:pointerup', function(elementView){
					that._isDragging = false;
					var model = elementView.model;
					if (!that._isPanning && model.prop('binding/type') == 'Zone') {
						model.toggleZoneSelect();
					}
					that._isPanning = false;

				});
			}
			that._attachCanvasEvt();

		},
		setBackground : function(source){
			var that = this;
			if(!source || source == "none"){
				that.backgroundImageData = null;
				var backgroundColor = that.isEditable ? "#ffffff" : "#f1f1f1";
				that.paper.drawBackground({
					image : null,
					color : backgroundColor,
					position : {x : 0, y: 0}
				});
			}else{
				//리팩토링 이전 생성된 파일들과의 호환성을 위함
				source = HmiUtil.updateOldImagePath(source);
				if(source.indexOf("url(") !== -1){
					source = source.replace('url("', '');
					source = source.replace('")', '');
					source = source.replace("../../src/main/resources/static-dev/asset/icons", "../../src/main/resources/static-dev/images/icon");
				}
				that.backgroundImageData = source;
				that.paper.drawBackground({
					image : this.backgroundImageData
				});
				that.updateSaveState();
			}
		},
		updateSaveState : function(isSaved){
			var that = this;
			var isEditable = that.isEditable, createView = that.createView;
			if(isEditable){
				createView.updateEditState(isSaved);
				createView.updateSaveButtonState();
			}
		},
		setVersion : function(version){
			var that = this;
			that.version = version;
			//console.log("this graphic file version is " + version);
		},
		_attachCanvasEvt : function(){
			//Paper에서 받은 마우스 이벤트를 해당 Element로 전달한다.
			var that = this;
			that.paper.on("element:pointerclick", function(cellView, evt){
				var element = cellView.model;
				if(element) element.trigger("event:pointerclick", cellView, evt);
			});
			that.paper.on("element:pointerdblclick", function(cellView, evt){
				var element = cellView.model;
				if(element) element.trigger("event:pointerdblclick", cellView, evt);
			});
			that.paper.on("element:pointerdown", function(cellView, evt){
				var element = cellView.model;
				var localPoint = that.paper.snapToGrid(evt.clientX, evt.clientY);
				if(element) element.trigger("event:pointerdown", cellView, evt, localPoint);
			});
			that.paper.on("element:contextmenu", function(cellView, evt){
				var element = cellView.model;
				if(element) element.trigger("event:contextmenu", cellView, evt);
			});
			that.paper.on("element:pointermove", function(cellView, evt){
				var element = cellView.model;
				var localPoint = that.paper.snapToGrid(evt.clientX, evt.clientY);
				if(element) element.trigger("event:pointermove", cellView, evt, localPoint);
			});
			that.paper.on("element:pointerup", function(cellView, evt){
				var element = cellView.model;
				if(element) element.trigger("event:pointerup", cellView, evt);
			});
			that.paper.on("element:mouseover", function(cellView, evt){
				var element = cellView.model;
				if(element) element.trigger("event:mouseover", cellView, evt);
			});
			that.paper.on("element:mouseout", function(cellView, evt){
				var element = cellView.model;
				if(element) element.trigger("event:mouseout", cellView, evt);
			});
			that.paper.on("element:mouseenter", function(cellView, evt){
				var element = cellView.model;
				if(element) element.trigger("event:mouseenter", cellView, evt);
			});

			//hyperlink event
			that.paper.on("event:hyperlink:click", function(cellView){
				if(that.isEditable) {
					// console.log('하이퍼링크 편집 팝업 띄움');
				}else{
					var model = cellView.model;
					var file = model.prop('binding/file');
					// that.createView.onHyperLinkClickEvt({id: evt.id, name: evt.name});
					that.createView.onHyperLinkClickEvt(file);
				}
			});

			//zone event
			// that.paper.on("event:zoneclick", function(cellView, evt){
			// 	if(!that.isEditable) setTimeout(function(){
			// 		if(!that._isDragging) cellView.model.toggleZoneSelect();
			// 	}, 100);
			// });

			//after command
			that.paper.on("afterCommand", function(models){
				if (that.commandManager) that.commandManager.stopListening();
				that.models.reset([]);
				that.selection.cancelSelection();
				var i, max = models.length, model;
				for ( i = 0; i < max; i++) {
					model = models[i];
					that.createSelectionPoint(model.findView(that.paper), {shiftKey: true});
					that.models.add(model);
				}
				if (that.commandManager) that.commandManager.listen();
			});
		},
		attachKeyboardEvt : function() {
			var that = this;
			this.keyboard.off();
			this.keyboard.on({
				'shift+left': function (e) {
					that.unitResize('left');
				},
				'shift+up': function (e) {
					that.unitResize('up');
				},
				'shift+right': function (e) {
					that.unitResize('right');
				},
				'shift+down': function (e) {
					that.unitResize('down');
				},
				'left': function (e) {
					that.moveLeft();
				},
				'up': function (e) {
					that.moveUp();
				},
				'right': function (e) {
					that.moveRight();
				},
				'down': function (e) {
					that.moveDown();
				},
				'F2': function (e) {
					e.preventDefault();
					var activeModel = that.getActiveModel();
					if (!activeModel) return;
					if (activeModel.prop('binding/type') != 'Label') return;
					var cellView = activeModel.findView(that.paper);
					activeModel.edit(cellView, cellView.el);
				},
				//실행취소
				'ctrl+z command+z': function (e) {
					if (!that.commandManager.hasUndo()) return;
					that.undo(e);
				},
				//다시실행
				'ctrl+y command+y': function (e) {
					if (!that.commandManager.hasRedo()) return;
					that.redo(e);
				},
				//복사
				'ctrl+c command+c': function (e) {
					that.copyClipboard();
				},
				//잘라내기
				'ctrl+x command+x': function (e) {
					that.copyClipboard();
					that.remove();
				},
				//붙여넣기
				'ctrl+v command+v': function (e) {
					that.pasteClipboard();
				},
				'ctrl+d command+d': function (e) {
					e.preventDefault();
					that.copyClipboard();
					that.pasteClipboard();
				},
				//그룹화
				'ctrl+g command+g': function (e) {
					e.preventDefault();
					that.group();
				},
				//그룹해제
				'ctrl+u command+u': function (e) {
					e.preventDefault();
					that.ungroup();
				},
				//전체 선택
				'ctrl+a command+a': function (e) {
					e.preventDefault();
					that.selectAll();
				},
				//잠금
				'ctrl+l command+l': function (e) {
					e.preventDefault();
					if (that.models && that.models.length > 0) that.changeLock(true);
				},
				//잠금 해제
				'ctrl+o command+o': function (e) {
					e.preventDefault();
					if (that.models && that.models.length > 0) that.changeLock(false);
				},
				//저장
				'ctrl+s command+s': function (e) {
					e.preventDefault();
					that.createView.clickSaveBtnEvt();
				},

				'delete': function (e) {
					that.remove();
				}
			});
		},
		setDimension : function(width, height){
			this.paper.setDimensions(width, height);
		},
		load : function(fileName, data){
			var that = this;
			that._isGraphicLoading = true;
			if(data.cells) that.graph.fromJSON(data);
			var cm = that.commandManager;
			if (cm) cm.reset();
			that._isGraphicLoading = false;
		},
		save : function(){
			var that = this, dfd = new $.Deferred();
			var json = that.graph.toJSON();
			dfd.resolve(json);
			return dfd.promise();
		},
		exportPNG : function(){
			/*
				Rappid JS
				쓰이지 않는 코드 이나
				https://resources.jointjs.com/docs/rappid/v2.4/format.html#format.Raster
				로 가능할 것으로 보임.
			*/
		},
		exportSVG : function(){
			/*
				Rappid JS
				쓰이지 않는 코드 이나
				https://resources.jointjs.com/docs/rappid/v2.4/format.html#format.SVG
				로 가능할 것으로 보임.
			*/
		},
		saveBackgroundImageData : function(json){
			json.backgroundImageData = that.backgroundImageData;
			var that = this;
		},
		getGraphicDeviceInfo : function(){	//현재 Canvas의 그래픽 객체 정보를 얻는다.
			var that = this;
			var cntBindingObjects = 0, cntVectorGraphicObjects = 0, cntRotatedObjects = 0, cntGroupedObjects = 0;
			var hmiCanvas = localStorage.getItem('hmiCanvas') || '{}';
			var cells;
			var id = $(this.element).attr('id');

			if (this._isBackground) {
				hmiCanvas = JSON.parse(hmiCanvas);
				cells = hmiCanvas[id] && hmiCanvas[id].cells || [];
			} else {
				cells = that.graph.get("cells");
				cells = cells.models || [];
			}

			var i, type, angle, binding, device, max = cells.length, ids = [];
			cells.forEach(function(cell){
				type = cell.get && cell.get("type") || cell.type;
				binding = cell.prop && cell.prop("binding") || cell.binding;
				angle = typeof cell.angle == "function" ?  cell.angle() : cell.angle;
				device = binding.device;
				if(type == "hmi.Group"){
					cntGroupedObjects++;
				}else if(device && device.id){
					cntBindingObjects++;
					ids.push(device.id);
				}else if(angle != 0){
					cntRotatedObjects++;
				}else{
					cntVectorGraphicObjects++;
				}
			});
			return {
				ids : ids,
				cntBindingObjects : cntBindingObjects,
				cntVectorGraphicObjects : cntVectorGraphicObjects,
				cntGroupedObjects : cntGroupedObjects,
				cntRotatedObjects : cntRotatedObjects,
				totalFiguresSize : (cntBindingObjects + cntVectorGraphicObjects + cntGroupedObjects + cntRotatedObjects)
			};
		},
		updateCanvasInPolling : function(devices){
			var deviceId, deviceInfo, oldValue, value, cells, hasDevice;
			var binding, bindingDevice, type;
			var hmiCanvas = localStorage.getItem('hmiCanvas') || '{}';
			var id = $(this.element).attr('id');
			var isBackground = this._isBackground;
			this._isPollingUpdate = true;
			//탭이 비활성화 되어있는 경우 localStorage에서 graph 정보를 가져옴
			if (isBackground) {
				hmiCanvas = JSON.parse(hmiCanvas);
				cells = hmiCanvas[id] && hmiCanvas[id].cells || [];
			} else {
				cells = this.graph.get('cells');
				cells = cells.models || [];
			}

			cells.forEach(function(cell){
				type = cell.get && cell.get("type") || cell.type;
				if(type == "hmi.Group") return true;

				binding = cell.prop && cell.prop("binding") || cell.binding;
				bindingDevice = cell.prop && cell.prop("binding/device") || binding.device || {};
				hasDevice = false;
				$.each(devices, function(index, device){
					deviceId = device.id;
					deviceInfo = HmiUtil.getDeviceInfo(device);
					value = deviceInfo.value;
					//등록되어있지 않을 경우 controlPoint Value를 0으로 처리하여 그래픽 객체를 업데이트 시킨다.
					device.invalid = HmiUtil.isInvalidDevice(device);
					if(bindingDevice.id == deviceId){
						hasDevice = true;
						if(binding.type == "Indoor"){	//Indoor(실내기)는 Device를 업데이트한다.
							if (isBackground) binding.device = device;
							else cell.prop("binding/device", device);
						}else{
							oldValue = cell.getValue && cell.getValue() || window.Util.convertNumberFormat(binding.value);
							//값이 이전 값과 같을 경우 Trigger 시키는 옵션 true로 전달
							if(cell.setValue) cell.setValue(value, true);
							else binding.value = value;
						}
						//바인딩 오류
						if (isBackground) binding.device.invalid = device.invalid;
						else cell.prop("binding/device/invalid", device.invalid);

						return false;
					}
				});

				//요소에 설정된 바인딩 디바이스가 기기 리스트에 존재하지 않음.
				if(!hasDevice) {
					if (isBackground) binding.device.invalid = true;
					else cell.prop("binding/device/invalid", true);
				}
			});

			if (this._isBackground) {
				if (!hmiCanvas[id]) hmiCanvas[id] = {};
				hmiCanvas[id].cells = cells;
				localStorage.setItem('hmiCanvas', JSON.stringify(hmiCanvas));
			}
			this._isPollingUpdate = false;
		},
		import : function(fileInputWidget){
			var that = this;
			var dfd = new $.Deferred();
			HmiUtil.getJSONFileData(Loading).done(function(file, fileData){
				var fileName = file.name;
				if (!fileName.match(".json$", "i")){
					msgDialog.message(I18N.prop("HMI_UNSUPPORTED_JSON_TYPE"));
					msgDialog.open();
				}

				fileInputWidget.element.val(fileName);
				try{
					var jsonData = JSON.parse(fileData);
					/*
						Rappid JS
					*/
					that.graph.fromJSON(jsonData);
					//that.JSONReader.unmarshal(that, jsonData);
					dfd.resolve();
				}catch(e){
					//console.error(e);
					msgDialog.message(I18N.prop("HMI_UNSUPPORTED_JSON_TYPE"));
					msgDialog.open();
					dfd.reject();
				}
			});
			return dfd.promise();
		},
		export : function(fileName){
			var that = this;
			Loading.open();
			var json = that.graph.toJSON();
			var jsonString = JSON.stringify(json);

			if(!fileName) fileName = "file";
			fileName += ".json";

			var blob = new Blob([jsonString], { type : "application/json"});
			kendo.saveAs({
				dataURI : blob,
				fileName : fileName
			});
			Loading.close();
		},
		onDrop : function(e){
			var that = this, paletteItem = e.item;
			//console.log(e);
			if(paletteItem){
				if(!paletteItem.clickable) that.addPaletteItem(e, paletteItem);
			}else{
				console.error("there is no palette item when drag & drop.");
			}
		},
		addPaletteItem : function(e, item){
			var that = this;
			var palette = e.sender;
			//Palette Widget에 Focus가 유지되는 현상. 유지되어 Enter 등 키보드 이벤트 시, 팔레트가 활성화 되므로 Blur 처리한다.
			palette.element.blur();
			//인스턴스 생성 후 초기화
			var className = item.className;
			// var options = item.options ? item.options : {};
			// if(options instanceof kendo.data.ObservableObject) options = options.toJSON();

			var ItemClass = RappidElement[className];
			if(!ItemClass){
				console.error("there is no Element class " + className);
				return;
			}

			that.selection.cancelSelection();
			if (that.cancelCreateBasicShape) that.cancelCreateBasicShape();
			that.cancelCreateBasicShape = null;

			that.commandManager.initBatchCommand();
			var offset = that.getPaperOffsetWithMouseEvent(e);
			var constructorOptions = $.extend({}, e.options, { paletteItem : item, offset : offset });
			var element = new ItemClass(constructorOptions);
			element.addTo(that.graph);
			element.trigger("graph:add", element, element.collection, {add : true, remove : false, merge : false });
			var bbox = element.getBBox();
			var x = bbox.x, y = bbox.y;
			if (x + bbox.width > HmiCommon.DEFAULT_CANVAS_WIDTH) x = HmiCommon.DEFAULT_CANVAS_WIDTH - bbox.width;
			if (y + bbox.height > HmiCommon.DEFAULT_CANVAS_HEIGHT) y = HmiCommon.DEFAULT_CANVAS_HEIGHT - bbox.height;
			if (x != bbox.x || y != bbox.y) element.position(x, y, {preventSetGridPoint: true});

			that.commandManager.storeBatchCommand();

			return element;
		},
		onPaletteClick : function(e){
			var that = this, paletteItem = e.item;
			//console.log(e);

			if(paletteItem.groupName == "basicShape"){
				that.createbasicShape(paletteItem);
			}else{
				console.error("there is no palette item when drag & drop.");
			}
		},
		onPaletteDoubleClick : function(e){
			var that = this, paletteItem = e.item;
			//console.log(e);
			//console.log("dbclick");
			var groupName = paletteItem.groupName;
			var isChangeable = groupName == "facilityGraphicImage" || groupName == "facilityGraphicAnmiation"/* || groupName == "CustomComponent"*/;
			var models = that.models.models;
			var newModel;
			that.commandManager.initBatchCommand();
			if(paletteItem && isChangeable && models.length > 0){

				//선택된 아이템 가져오기
				var activeModel = that.getActiveModel();
				var activeModelBBox = activeModel.getBBox();
				var x = activeModelBBox.x;
				var y = activeModelBBox.y;
				var binding = activeModel.prop('binding');
				var optionBinding = e.options ? e.options.binding : {};
				var bindingData = $.extend(true, {}, binding, optionBinding);
				e.pos = { x : x, y : y };
				e.options = {
					angle : activeModel.angle(),
					size : {
						width : activeModelBBox.width,
						height : activeModelBBox.height
					},
					position : { x : x, y : y },
					binding : bindingData
				};
				activeModel.remove();

				that.addPaletteItem(e, paletteItem);

			}else{
				// console.error("there is no palette item when drag & drop.");
				if(e.options) e.options.position = {x: 0, y: 0};
				else e.options = { position : {x: 0, y: 0} };

				newModel = that.addPaletteItem(e, paletteItem);
				var newModelPosition = that.getNewModelPosition(newModel);
				newModel.position(newModelPosition.x, newModelPosition.y);
			}
			// that.createSelectionPoint(that.paper.findViewByModel(newModel));
			// that.models.reset([newModel]);

			that.commandManager.storeBatchCommand();
		},
		getNewModelPosition : function(model){
			var curPaperSize = {
				width: HmiCommon.DEFAULT_CANVAS_WIDTH,
				height: HmiCommon.DEFAULT_CANVAS_HEIGHT
			};
			if (!this._newModelcenterX) {
				this._newModelcenterX = curPaperSize.width / 2;
			} else {
				this._newModelcenterX += 20;
			}
			if (!this._newModelcenterY) {
				this._newModelcenterY = curPaperSize.height / 2;
			} else {
				this._newModelcenterY += 20;
			}

			var bbox = model.getBBox();
			var posX = this._newModelcenterX - (bbox.width / 2);
			var posY = this._newModelcenterY - (bbox.height / 2);
			if ((posX + bbox.width) >= (curPaperSize.width - 1) || (posY + bbox.height) >= (curPaperSize.height - 1) || posX < 1 || posY < 1) {
				this._newModelcenterX = (bbox.width / 2) + 1;
				this._newModelcenterY = (bbox.height / 2) + 1;
				posX = 1;
				posY = 1;
			}

			return {x: posX, y: posY};
		},
		setCursor:function(cursor){
			var that = this;
			if(cursor == "crosshair"){
				that.paperScroller.setCursor(cursor);
			}else if(cursor){
				that.paperScroller.setCursor("url(../../src/main/resources/static-dev/images/icon/cursors/" + cursor + ") 0 0, default");
			}else{
				that.paperScroller.setCursor("default");
			}
		},
		getToolbarButtonDisabledState : function(){
			var that = this;
			var activeModel = that.getActiveModel();
			var models = that.models || [], modelsCount = models.length;
			var modelsType = [];
			models.forEach(function(model){
				var type = model.prop('binding/type');
				if (modelsType.indexOf(type) == -1) modelsType.push(type);
			});

			var btnState = {
				"binding" : true,
				"lock" : { disabled : true, value : false },
				"background" : false,

				"fill" : { disabled : true },
				"lineColor" : { disabled : true },
				"lineWidth" : { disabled : true, value : 1 },

				"group" : true,
				"ungroup" : true,

				"fontSize" : { disabled : true, value : HmiCommon.DEFAULT_FONT_SIZE },
				"bold" : { disabled : true, value : false },
				"italic" : { disabled : true, value : false },
				"fontColor" : { disabled : true },

				"textHAlign" : { disabled : true, value : HmiCommon.DEFAULT_TEXT_H_ALIGN },
				"textVAlign" : { disabled : true, value : HmiCommon.DEFAULT_TEXT_V_ALIGN },

				"bringForward" : true,
				"sendBackward" : true,
				"bringTop" : true,
				"sendBottom" : true,

				"matchSize" : true,
				"matchWidth" : true,
				"matchHeight" : true,

				"alignLeft" : true,
				"alignHcenter" : true,
				"alignRight" : true,
				"alignTop" : true,
				"alignVcenter" : true,
				"alignBottom" : true,

				"alignHGap" : true,
				"alignVGap" : true,

				"flipV" : true,
				"flipH" : true,
				"rotationRight" : true,
				"rotationLeft" : true,

				"rotation" : true,

				"tableInsertion" : true,
				"tableDelete" : true,
				"mergeCell" : true,
				"unmergeCell" : true
			};

			if (modelsCount == 0) return btnState;

			//단일 선택 시 활성화 되는 버튼
			var singleSelectEnableBtns = [
				"binding"
			];

			//한 개 이상 선택 시 활성화 되는 버튼
			var overOneSelectEnableBtns = [
				"fill", "lineColor", "lineWidth", "fontSize", "bold", "italic", "fontColor",
				"bringForward", "sendBackward", "bringTop", "sendBottom",
				"alignLeft", "alignHcenter", "alignRight", "alignTop", "alignVcenter", "alignBottom",
				"rotationRight", "rotationLeft", "rotation"
			];

			//두 개 이상 선택 시 활성화 되는 버튼
			var overTwoSelectedEnableBtns = [
				"group", "matchSize", "matchWidth", "matchHeight"
			];

			//세 개 이상 선택 시 활성화 되는 버튼
			var overThreeSelectedEnableBtns = [
				"alignHGap", "alignVGap"
			];

			//버튼별 선택된 타입이 있는 경우 활성화 되는 버튼
			var enableTypes = {
				"ungroup" : ["Group"],
				"textHAlign" : ["Label", "Table", "HyperLink", "ExtLabel"],
				"textVAlign" : ["Label", "Table", "HyperLink", "ExtLabel"],
				"flipV" : ["BasicShape", "Line", "ImportImage", "Image", "Animation", "Custom"],
				"flipH" : ["BasicShape", "Line", "ImportImage", "Image", "Animation", "Custom"]
			};

			//버튼별 비활성화 되는 타입 목록
			var singleDisableTypes = {
				"fill" : ["Line", "ImportImage", "Button", "Image", "Animation", "Group", "Indoor", "RectangleGraphic"],
				"lineColor" : ["Button", "Group", "Indoor", "Image", "Animation"],
				"lineWidth" : ["Button", "Group", "Indoor", "Image", "Animation"],
				"fontSize" : ["BasicShape", "Line", "ImportImage", "Zone", "Image", "Animation", "Group", "Indoor"],
				"bold" : ["BasicShape", "Line", "ImportImage", "Zone", "Image", "Animation", "Group", "Indoor"],
				"italic" : ["BasicShape", "Line", "ImportImage", "Zone", "Image", "Animation", "Group", "Indoor"],
				"fontColor" : ["BasicShape", "Line", "ImportImage", "Zone", "Image", "Animation", "Group", "Indoor"],
				"rotationRight" : ["Table"],
				"rotationLeft" : ["Table"],
				"rotation" : ["Table"]
			};

			//선택될 경우 무조건 비활성화 되는 타입 목록
			var disableTypes = {
				"binding" : ["Label", "BasicShape", "Line", "Zone", "Table", "ImportImage", "HyperLink", "Group"],
				"group" : ["Indoor"]
			};

			var activeModelBinding = activeModel ? activeModel.prop('binding') : {};
			var activeModelLocked = activeModel ? activeModelBinding.locked : false;
			var activeModelType = activeModel ? activeModelBinding.type : '';
			if (modelsCount > 0) btnState.lock.disabled = false;

			if (activeModelLocked) {
				btnState.lock.value = true;
				return btnState;
			}

			var setButtonStateEnable = function(btnName){
				var state = btnState[btnName];
				if (typeof state === "object") state.disabled = false;
				else btnState[btnName] = false;
			};

			var setButtonStateDisable = function(btnName){
				var state = btnState[btnName];
				if (typeof state === "object") state.disabled = true;
				else btnState[btnName] = true;
			};

			if (modelsCount == 1) {
				singleSelectEnableBtns.forEach(setButtonStateEnable);
			}
			if (modelsCount >= 3) {
				overThreeSelectedEnableBtns.forEach(setButtonStateEnable);
			}
			if (modelsCount >= 2) {
				overTwoSelectedEnableBtns.forEach(setButtonStateEnable);
			}
			if (modelsCount >= 1) {
				overOneSelectEnableBtns.forEach(setButtonStateEnable);
			}

			$.each(enableTypes, function(btnName, types){
				types.forEach(function(type){
					if (modelsType.indexOf(type) != -1) setButtonStateEnable(btnName);
				});
			});

			$.each(singleDisableTypes, function(btnName, types){
				var containsOtherType = false;
				var i, type, len = modelsType.length;
				for (i = 0; i < len; i++) {
					type = modelsType[i];
					containsOtherType = containsOtherType || types.indexOf(type) == -1;
				}
				if (!containsOtherType) setButtonStateDisable(btnName);
			});

			$.each(disableTypes, function(btnName, types){
				modelsType.forEach(function(type){
					if (types.indexOf(type) != -1) setButtonStateDisable(btnName);
				});
			});

			if (singleDisableTypes.lineWidth.indexOf(activeModelType) == -1) btnState.lineWidth.value = activeModelBinding.strokeWidth || 1;
			if (singleDisableTypes.bold.indexOf(activeModelType) == -1) {
				var isBold = activeModelType == 'Table' ? activeModel.getFontWeight() : activeModelBinding.fontWeight;
				var isItalic = activeModelType == 'Table' ? activeModel.getFontStyle() : activeModelBinding.fontStyle;
				btnState.bold.value = isBold === 'Bold';
				btnState.italic.value = isItalic === 'Italic';
			}
			if (singleDisableTypes.fontSize.indexOf(activeModelType) == -1) btnState.fontSize.value = activeModelBinding.fontSize;
			if (enableTypes.textHAlign.indexOf(activeModelType) != -1) btnState.textHAlign.value = activeModel.getTextAlign('hAlign');
			if (enableTypes.textVAlign.indexOf(activeModelType) != -1) btnState.textVAlign.value = activeModel.getTextAlign('vAlign');
			if (activeModelType == 'Table') {
				var highlightedCells = activeModel.getHighlightedCells();
				btnState.tableInsertion = highlightedCells.length != 1;
				btnState.tableDelete = highlightedCells.length == 0;
				btnState.mergeCell = !activeModel.isMergeable();
				btnState.unmergeCell = !activeModel.isUnmergeable();
			}

			return btnState;
		},
		moveLeft : function(){
			var that = this;
			var models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function(model){
				var isLocked = model.prop("binding/locked");
				if(!isLocked) model.translate(-1, 0, {preventSetGridPoint: true});
			});
			that.commandManager.storeBatchCommand();
			return false;
		},
		moveUp : function(){
			var that = this;
			var models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function(model){
				var isLocked = model.prop("binding/locked");
				if(!isLocked) model.translate(0, -1, {preventSetGridPoint: true});
			});
			that.commandManager.storeBatchCommand();
			return false;
		},
		moveRight : function(){
			var that = this;
			var models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function(model){
				var isLocked = model.prop("binding/locked");
				if(!isLocked) model.translate(1, 0, {preventSetGridPoint: true});
			});
			that.commandManager.storeBatchCommand();
			return false;
		},
		moveDown : function(){
			var that = this;
			var models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function(model){
				var isLocked = model.prop("binding/locked");
				if(!isLocked) model.translate(0, 1, {preventSetGridPoint: true});
			});
			that.commandManager.storeBatchCommand();
			return false;
		},
		copyClipboard : function(){
			var models = this.models;
			var totalEmbeddedCells = [];
			var embeddedCells;
			var i, model, len = models.length, type;
			for(i = 0; i < len; i++) {
				model = models.at(i);
				type = model.prop('binding/type');
				if (type == 'Group') {
					embeddedCells = model.getEmbeddedCells();
					totalEmbeddedCells = totalEmbeddedCells.concat(embeddedCells);
				}
			}
			models.unshift(totalEmbeddedCells);
			this.clipboard.copyElements(models, this.graph);
			models.remove(totalEmbeddedCells);
			this.pastedCount = 1;
			return false;
		},
		pasteClipboard : function(){
			var that = this;
			that.commandManager.initBatchCommand();
			var pastedCells = this.clipboard.pasteCells(this.graph, {
	            // translate: { dx: 10, dy: 10 },
	            useLocalStorage: true
	        });

	        var elements = _.filter(pastedCells, function(cell){
	            return cell.isElement() && !cell.parent();
	        });

	        // Make sure pasted elements get selected immediately. This makes the UX better as
	        // the user can immediately manipulate the pasted elements.
	        this.models.reset(elements);

			FreeTransform.clear(this.paper);
			var dt = (that.pastedCount++) * 10;
			elements.forEach(function(element){
				//복사 붙여넣기 되어 추가된 요소에 graph:add 이벤트 trigger
				//reset()에서 호출되지 않으므로.
				element.translate(dt, dt);
				element.trigger("graph:add", element, element.collection, {add : true, remove : false, merge : false });
				var cellView = that.paper.findViewByModel(element);
				var freeTransform = new FreeTransform({
					cellView: cellView,
					clearAll: false,
					createView: that.createView
				});
				freeTransform.render();
			});
			if (that.isEditable) that.createView.updateToolbarButtonState && that.createView.updateToolbarButtonState();
			that.commandManager.storeBatchCommand();

			return false;
		},
		undo : function(e){
			var that = this;
			this.commandManager.undo();
			//수정 사항을 모두 Undo 했을 경우, Save 버튼을 비활성화한다.
			var isEditable = that.isEditable;
			var createView = that.createView;
			that.clearTableCellSelect(true);
			if(isEditable) createView.updateToolbarButtonState();
			//if(isEditable && stack.undostack && stack.undostack.length == 0){
			if(isEditable && !this.commandManager.hasUndo()){
				that.updateSaveState(true);
			}
			//파일 이름이 Ctrl + Z 되어 되돌리기 되는 현상 방지
			e.preventDefault();
			return false;
		},
		redo : function(){
			var that = this;
			this.commandManager.redo();
			var isEditable = that.isEditable;
			var createView = that.createView;
			that.clearTableCellSelect(true);
			if(isEditable) createView.updateToolbarButtonState();
			that.updateSaveState();
		},
		select : function(){
			var that = this;
			if (that.cancelCreateBasicShape) that.cancelCreateBasicShape();
			that.cancelCreateBasicShape = null;
			if (that.selection) that.selection.cancelSelection();
		},
		binding : function(selectedElement){
			var that = this, selection = that.selection, collection = selection.collection,
				element = selectedElement ? selectedElement : collection.at(0);

			if(element){
				var device = element.prop("binding/device");

				if(device.id && device.type){
					Loading.open();
					HmiUtil.DeviceApi.getDeviceWithID(device.id).done(function(data){
						//element.prop("binding/device", data);
						var bindingDevice = element.prop("binding/device");
						$.extend(bindingDevice, data);
						//미등록 기기 정보일 경우 취소선 표시
						//	-> 팝업에서 처리 필요
						bindingDevice.invalid = HmiUtil.isInvalidDevice(data);

						that.setBinding(element);
					}).fail(function(){
						//존재하지 않는 기기일 경우 취소선 표시
						var bindingDevice = element.prop("binding/device");
						bindingDevice.invalid = true;
						if(bindingDevice.locations){
							bindingDevice.locations.length = 0;
						}
						that.setBinding(element);
					}).always(function(){
						Loading.close();
					});
				}else{
					that.setBinding(element);
				}
			}
		},
		updateBindingTabState : function(){
			var that = this, createView = that.createView;
			if(createView){
				var collection = that.selection.collection;
				var selectedElement, size = collection.size();
				if(size == 1){
					selectedElement = collection.at(0);
					var bindingData = selectedElement.prop("binding");
					createView.enableBindingTab((HmiUtil.canBindingType(bindingData.type) && !bindingData.locked));
					that.binding(selectedElement);
				}else{
					that._bindingElement = null;
					createView.enableBindingTab(false);
				}
			}
		},
		setBinding : function(element){
			//console.log(data);
			var that = this;
			var data = element.getGraphicBindingPopupData();
			console.error(data);
			var createView = that.createView;
			var binding = element.prop("binding");
			if(createView && (HmiUtil.canBindingType(binding.type) && !binding.locked)){
				that._bindingElement = element;
				createView.activateBindingTab();
				if(!that._bindingSaveEvt) that._bindingSaveEvt = that.bindingSave.bind(that);
				createView.bindingPanelBar.unbind("save", that._bindingSaveEvt);
				createView.bindingPanelBar.bind("save", that._bindingSaveEvt);
				createView.bindingPanelBar.setActiveCanvas(that);
				createView.bindingPanelBar.setBindingData(data);
			}else{
				console.error("there is no create view in this canvas.");
			}
		},
		//현재 바인딩 탭이 열려있는 상태에서 그래픽 객체의 위치, 사이즈가 변하였을 때 업데이트
		updateBinding : function(data){
			var that = this;
			if(that._bindingElement){
				var element = that._bindingElement;
				if(!data) data = element.getGraphicBindingPopupData();
				var createView = that.createView;
				var binding = element.prop("binding");
				if(createView && (HmiUtil.canBindingType(binding.type) && !binding.locked)){
					createView.bindingPanelBar.updateBindingData(data);
				}else{
					console.error("there is no create view in this canvas.");
				}
			}
		},
		bindingSave : function(e){
			var that = this, item = e.item;

			var selection = that.selection, collection = selection.collection;
			var element = collection.at(0);
			if(!element) return;
			//var selectedData = popup.getSelectedData();

			console.log("binding save data");
			console.log(item);
			that.commandManager.initBatchCommand();
			element.setBindingData(item);
			that.commandManager.storeBatchCommand();
		},
		zoomIn : function(offset){
			var that = this;
			var zoomLevel = that.getZoomLevel();
			if (zoomLevel >= HmiCommon.DEFAULT_MAX_ZOOM_LEVEL) return false;
			zoomLevel = zoomLevel + HmiCommon.DEFAULT_ZOOM_FACTOR;
			that.setZoomLevel(zoomLevel, false, offset);
			return true;
		},
		zoomOut : function(offset){
			var that = this;
			var zoomLevel = that.getZoomLevel();
			if (zoomLevel <= HmiCommon.DEFAULT_MIN_ZOOM_LEVEL) return false;
			zoomLevel = zoomLevel - HmiCommon.DEFAULT_ZOOM_FACTOR;
			that.setZoomLevel(zoomLevel, false, offset);
			return true;
		},
		defaultZoom : function(){
			var that = this;
			that.setZoomLevel(100);
		},
		setZoomLevel : function(e, preventTrigger, offset){
			var that = this;
			var isDropDownListEvt = e.dataItem ? true : false;
			var zoom = isDropDownListEvt ? e.dataItem.id : e;
			that._zoomLevel = zoom;
			var createView = that.createView;
			var zoomInBtn = createView.getToolbarViewModel("zoomin");
			var zoomOutBtn = createView.getToolbarViewModel("zoomout");
			var isMaxZoom = that._zoomLevel >= HmiCommon.DEFAULT_MAX_ZOOM_LEVEL;
			var isMinZoom = that._zoomLevel <= HmiCommon.DEFAULT_MIN_ZOOM_LEVEL;
			that._isPreventUpdate = true;
			if (that.commandManager) that.commandManager.stopListening();
			zoomInBtn.set("disabled", isMaxZoom);
			zoomOutBtn.set("disabled", isMinZoom);

			if(isMaxZoom) that._zoomLevel = zoom = HmiCommon.DEFAULT_MAX_ZOOM_LEVEL;
			if(isMinZoom) that._zoomLevel = zoom = HmiCommon.DEFAULT_MIN_ZOOM_LEVEL;

			toastPopup.show(zoom + '%');
			if (!preventTrigger) createView.setCurrentTabZoomLevel(zoom);
			zoom = zoom / 100;
			//that.setZoom(zoom, true);
			that.paperScroller.zoom(zoom, { absolute: true });
			// console.log('paper zoom : ' + zoom);
			if (!preventTrigger) that.triggerIndoorDeviceElements("element:changeZoom", { zoom : zoom });

			if (!offset) offset = { offsetX : HmiCommon.DEFAULT_CANVAS_WIDTH / 2, offsetY : HmiCommon.DEFAULT_CANVAS_HEIGHT / 2 };
			var paperScroller = that.paperScroller;
			var model = that.getActiveModel();
			var curCanvasElement = that.element;
			var curWidth = curCanvasElement.width(), curHeight = curCanvasElement.height();
			var va = paperScroller.getVisibleArea();
			var ra = {width : va.width * zoom, height : va.height * zoom};

			if (curWidth <= ra.width) offset.offsetX = HmiCommon.DEFAULT_CANVAS_WIDTH / 2;	//캔버스 너비가 뷰 너비보다 작을 경우 중앙으로
			else if (offset.offsetX < (va.width / 2)) offset.offsetX = va.width / 2;	//좌측 영역 여백이 생길 경우 여백 없앰
			else if (offset.offsetX > HmiCommon.DEFAULT_CANVAS_WIDTH - (va.width / 2)) offset.offsetX = HmiCommon.DEFAULT_CANVAS_WIDTH - (va.width / 2);	//우측 영역 여백이 생길 경우 여백 없앰

			if (curHeight <= ra.height) offset.offsetY = HmiCommon.DEFAULT_CANVAS_HEIGHT / 2;	//캔버스 높이가 뷰 높이보다 작을 경우 중앙으로
			else if (offset.offsetY < (va.height / 2)) offset.offsetY = va.height / 2;	//상단 영역 여백이 생길 경우 여백 없앰
			else if (offset.offsetY > HmiCommon.DEFAULT_CANVAS_HEIGHT - (va.height / 2)) offset.offsetY = HmiCommon.DEFAULT_CANVAS_HEIGHT - (va.height / 2);	//하단 영역 여백이 생길 경우 여백 없앰

			if (that.isEditable && model) paperScroller.centerElement(model);	//편집상태에서 선택된 요소가 있을 때 요소 중심으로 줌
			else paperScroller.center(offset.offsetX, offset.offsetY);

			zoom = zoom - 1;

			if (that.editable){
				var zoomLevelDropDownList = createView.getToolbarViewModel("zoomlevel");
				var zoomLevelDropDown = $("#" + zoomLevelDropDownList.id).data("kendoDropDownList");
				if(!isDropDownListEvt) zoomLevelDropDown.text(that._zoomLevel + "%");
				else zoomLevelDropDown.value(that._zoomLevel);
			}
			if (that.commandManager) that.commandManager.listen();
			that._isPreventUpdate = false;
		},
		setDefaultZoomLevel : function(e){
			var sender = e.sender;
			var value = sender.value();
			var text = sender.text();
			//Zoom In/Out 버튼을 통해 DataSource에 없는 값을 Text로 표시하고, 드롭다운리스트를 열었다가 포커스를 벗어날때 빈 텍스트로 표시되는 현상을 방지하기 위함.
			if(!value){
				sender.value(null);
				sender.text(text);
			}
		},
		getZoomLevel : function(){
			var that = this;
			var zoom = that._zoomLevel ? that._zoomLevel : 100;
			return zoom;
		},
		lock : function(){
			var that = this, isLocked;
			that.commandManager.initBatchCommand();
			that.models.forEach(function(model){
				isLocked = model.prop('binding/locked') ? true : false;
				model.prop("binding/locked", !isLocked);
			});
			that.commandManager.storeBatchCommand();
			var isEditable = that.isEditable, createView = that.createView;
			if(isEditable){
				that.updateBindingTabState();
				createView.updateToolbarButtonState();
			}
		},
		changeLock : function(locked) {
			var that = this;
			var models = that.models || [];
			var isLocked;
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				isLocked = model.prop('binding/locked');
				if (locked != isLocked) model.prop('binding/locked', locked);
			});
			that.commandManager.storeBatchCommand();
			var isEditable = that.isEditable, createView = that.createView;
			if(isEditable){
				that.updateBindingTabState();
				createView.updateToolbarButtonState();
			}
		},
		group : function(){
			var that = this;
			var models = that.models || [];
			if (models.length < 2) return;
			that.commandManager.initBatchCommand();
			var group = new joint.shapes.hmi.Group();
			group.addTo(that.graph);

			models.forEach(function(model){
				group.embed(model);
			});
			that.commandManager.storeBatchCommand();

			//셀렉션 초기화 후 선택
			that.selection.cancelSelection();
			that.createSelectionPoint(that.paper.findViewByModel(group));
			models.add(group);

			var isEditable = that.isEditable, createView = that.createView;
			if(isEditable) createView.updateToolbarButtonState();
		},
		ungroup : function(){
			var that = this;
			var models = that.models || {}, model;
			var isEditable = that.isEditable, createView = that.createView;
			var i, j, max, len = models.length;
			var cells;

			that.commandManager.initBatchCommand();

			models = models.models;
			for ( j = len - 1; j >= 0; j--) {
				model = models[j];
				if(model instanceof joint.shapes.hmi.Group){
					cells = model.getEmbeddedCells();
					max = cells.length;
					for( i = 0; i < max; i++ ){
						model.unembed(cells[i]);
					}
					that.createSelectionPoint(model.findView(that.paper), {shiftKey: true});
					model.remove();
					models.splice(j, 1);

					for(i = 0; i < max; i++){
						that.createSelectionPoint(that.paper.findViewByModel(cells[i]), {shiftKey: true});
						that.models.add(cells[i]);
					}
				}
			}
			if(isEditable) createView.updateToolbarButtonState();

			that.commandManager.storeBatchCommand();
		},
		bold : function(isBold){
			var that = this;
			TextEditor.close();
			that.commandManager.initBatchCommand();
			var fontWeight;
			that.models.forEach(function(element){
				if(!isBold) fontWeight = "Normal";
				else fontWeight = "Bold";

				element.setFontWeight(fontWeight);
			});
			that.commandManager.storeBatchCommand();
		},
		italic : function(isItalic){
			var that = this;
			TextEditor.close();
			that.commandManager.initBatchCommand();
			var fontWeight;
			that.models.forEach(function(element){
				if(!isItalic) fontWeight = "Normal";
				else fontWeight = "Italic";

				element.setFontStyle(fontWeight);
			});
			that.commandManager.storeBatchCommand();
		},
		getActiveModel : function() {
			var that = this;
			var models = this.models || [];
			var activeModel = null, cellView = null;
			models.forEach(function(model) {
				cellView = that.paper.findViewByModel(model);
				if (cellView && cellView.$el.hasClass('active')) activeModel = model;
			});
			return activeModel;
		},
		matchSize : function(){
			var that = this;
			var models = that.models;
			var activeModel = that.getActiveModel();
			var activeModelBBox = activeModel.getBBox();
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				model.resize(activeModelBBox.width, activeModelBBox.height);
			});
			that.commandManager.storeBatchCommand();
		},
		matchWidth : function(){
			var that = this;
			var models = that.models;
			var activeModel = that.getActiveModel();
			var activeModelBBox = activeModel.getBBox();
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				model.resize(activeModelBBox.width, model.getBBox().height);
			});
			that.commandManager.storeBatchCommand();
		},
		matchHeight : function(){
			var that = this;
			var models = that.models;
			var activeModel = that.getActiveModel();
			var activeModelBBox = activeModel.getBBox();
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				model.resize(model.getBBox().width, activeModelBBox.height);
			});
			that.commandManager.storeBatchCommand();
		},
		hFlip : function(){
			var that = this, models = that.models;
			var hFliped;
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				hFliped = model.prop('binding/hFliped') ? true : false;
				model.prop('binding/hFliped', !hFliped);
			});
			that.commandManager.storeBatchCommand();
		},
		vFlip : function(){
			var that = this, models = that.models;
			var vFliped;
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				vFliped = model.prop('binding/vFliped') ? true : false;
				model.prop('binding/vFliped', !vFliped);
			});
			that.commandManager.storeBatchCommand();
		},
		rotation : function(direction){
			var that = this, models = that.models;
			var angle, newAngle;

			that.commandManager.initBatchCommand();
			models.forEach(function (model) {
				angle = model.angle();
				if (direction === 'left') newAngle = angle - 90;
				else if (direction === 'right') newAngle = angle + 90;
				else if (direction.sender) newAngle = direction.sender.value();		//임의의 회전 값 Change Event
				else if (typeof direction === 'number') newAngle = direction;		//임의의 회전 값 Enter Key Event

				newAngle = newAngle % 360;
				model.rotate(newAngle, true);
			});
			that.commandManager.storeBatchCommand();
		},
		centerAlign : function(direction){
			var that = this, models = that.models, size = models.length;
			var activeModel = that.getActiveModel(), activeModelBBox, modelBBox;
			var mid = 0, target;
			var canvasSize = that.paper.getArea();
			var canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

			that.commandManager.initBatchCommand();

			activeModelBBox = activeModel.getBBox();
			if (size === 1) {
				if (direction === 'center_v') {
					mid = canvasHeight / 2;
					target = mid - (activeModelBBox.height / 2);
					activeModel.translate(0, target - activeModelBBox.y);
				} else {
					mid = canvasWidth / 2;
					target = mid - (activeModelBBox.width / 2);
					activeModel.translate(target - activeModelBBox.x, 0);
				}
			} else if (size > 1) {
				models.forEach(function (model) {
					modelBBox = model.getBBox();
					if (direction === 'center_v') {
						mid = activeModelBBox.y + (activeModelBBox.height / 2);
						target = mid - (modelBBox.height / 2);
						model.translate(0, target - modelBBox.y);
					} else {
						mid = activeModelBBox.x + (activeModelBBox.width / 2);
						target = mid - (modelBBox.width / 2);
						model.translate(target - modelBBox.x, 0);
					}
				});
			}
			that.commandManager.storeBatchCommand();
		},
		sortZOrder : function(models) {
			var sortedModels = [];
			models.forEach(function(model) {
				sortedModels.push(model);
			});
			sortedModels.sort(function (a, b) {
				return a.get('z') - b.get('z');
			});

			return sortedModels;
		},
		reorderZOrder : function(models) {
			var that = this, reorderedModels = that.sortZOrder(models), i = 1;
			reorderedModels.forEach(function (model) {
				model.set('z', i++);
			});
			return reorderedModels;
		},
		increaseZOrder : function(){
			var that = this, models = that.models, totalElements = that.graph.getElements(), element, nextElement;
			var selectedModelsId = {};
			var i, size = totalElements.length;
			that.commandManager.initBatchCommand();
			models.forEach(function (model) {
				selectedModelsId[model.id] = true;
			});

			totalElements = that.sortZOrder(totalElements);
			for (i = size - 2; i >= 0; i--) {
				var nextIndex = i + 1;
				element = totalElements[i];
				do {
					nextElement = totalElements[nextIndex++];
				} while(nextIndex < size && selectedModelsId[nextElement.id]);
				if (selectedModelsId[nextElement.id]) continue;
				if (!selectedModelsId[element.id]) continue;
				nextElement.set('z', i + 1);
				element.set('z', i + 2);
			}

			that.commandManager.storeBatchCommand();
		},
		decreaseZOrder : function(){
			var that = this, models = that.models, totalElements = that.graph.getElements(), element, prevElement;
			var selectedModelsId = {};
			var i, size = totalElements.length;
			that.commandManager.initBatchCommand();
			models.forEach(function (model) {
				selectedModelsId[model.id] = true;
			});

			totalElements = that.sortZOrder(totalElements);
			for (i = 1; i < size; i++) {
				var prevIndex = i - 1;
				element = totalElements[i];
				do {
					prevElement = totalElements[prevIndex--];
				} while(prevIndex >= 0 && selectedModelsId[prevElement.id]);
				if (selectedModelsId[prevElement.id]) continue;
				if (!selectedModelsId[element.id]) continue;
				prevElement.set('z', i + 1);
				element.set('z', i);
			}

			that.commandManager.storeBatchCommand();
		},
		sendToBottom : function(){
			var that = this, models = that.models, sortedModels = that.sortZOrder(models);
			var minZ = that.graph.minZIndex();
			var i, size = sortedModels.length, model;
			that.commandManager.initBatchCommand();
			for (i = 0; i < size; i++) {
				model = sortedModels[i];
				model.set('z', minZ - size + i);
			}
			that.reorderZOrder(that.graph.getElements());
			that.commandManager.storeBatchCommand();
		},
		bringToTop : function(){
			var that = this, models = that.models, sortedModels = that.sortZOrder(models);
			var maxZ = that.graph.maxZIndex();
			var i, size = sortedModels.length, model;
			that.commandManager.initBatchCommand();
			for (i = 0; i < size; i++) {
				model = sortedModels[i];
				model.set('z', maxZ + i + 1);
			}
			that.reorderZOrder(that.graph.getElements());
			that.commandManager.storeBatchCommand();
		},
		alignFigure : function(direction){
			var that = this, models = that.models, size = models.length;
			var activeModel = that.getActiveModel(), activeModelBBox = activeModel.getBBox();
			var canvasSize = that.paper.getArea();
			var baseX, baseY, newX, newY;

			switch(direction) {
			case 'center_v':
				that.centerAlign('center_v');
				return;
			case 'center_h':
				that.centerAlign('center_h');
				return;
			case 'left':
				baseX = (size !== 1) ? (activeModelBBox.x) : (0);
				break;
			case 'right':
				baseX = (size !== 1) ? (activeModelBBox.x + activeModelBBox.width) : (canvasSize.width);
				break;
			case 'top':
				baseY = (size !== 1) ? (activeModelBBox.y) : (0);
				break;
			case 'bottom':
				baseY = (size !== 1) ? (activeModelBBox.y + activeModelBBox.height) : (canvasSize.height);
				break;
			default:
			}

			that.commandManager.initBatchCommand();
			var modelBBox;

			models.forEach(function (model) {
				modelBBox = model.getBBox();
				if (direction === 'left') {
					newX = baseX;
					newY = modelBBox.y;
				} else if (direction === 'right') {
					newX  = baseX - modelBBox.width;
					newY = modelBBox.y;
				} else if (direction === 'top') {
					newX = modelBBox.x;
					newY = baseY;
				} else if (direction === 'bottom') {
					newX = modelBBox.x;
					newY = baseY - modelBBox.height;
				}
				model.translate(newX - modelBBox.x, newY - modelBBox.y, {preventSetGridPoint: true});
			});
			that.commandManager.storeBatchCommand();
		},
		equalGap : function(direction){
			var that = this, models = that.models, sortedModels = [];
			var gap = 0, pos = 0, len;

			that.commandManager.initBatchCommand();

			models.forEach(function(model){
				var modelBBox = model.getBBox();
				sortedModels.push({
					model: model,
					center: modelBBox.center()
				});
			});

			sortedModels.sort(function(a, b){
				if (direction === 'horizontal') return a.center.x - b.center.x;
				return a.center.y - b.center.y;
			});

			len = sortedModels.length;

			if (direction === 'horizontal') {
				gap = (sortedModels[len - 1].center.x - sortedModels[0].center.x) / (len - 1);
				pos = sortedModels[0].center.x;
				sortedModels.forEach(function(obj) {
					var model = obj.model;
					model.translate(pos - obj.center.x, 0, {preventSetGridPoint: true});
					pos += gap;
				});
			} else if (direction === 'vertical') {
				gap = (sortedModels[len - 1].center.y - sortedModels[0].center.y) / (len - 1);
				pos = sortedModels[0].center.y;
				sortedModels.forEach(function(obj) {
					var model = obj.model;
					model.translate(0, pos - obj.center.y, {preventSetGridPoint: true});
					pos += gap;
				});
			}

			that.commandManager.storeBatchCommand();
		},
		getColor : function(name){
			var model = this.getActiveModel();
			var color = 'transparent';
			if (!model) return color;

			if (name === 'lineColor') color = model.getStrokeColor();
			else if (name === 'fill') color = model.getFillColor();
			else if (name === 'fontColor') color = model.getFontColor();

			return color;
		},
		changeColor : function(name, color){
			var that = this, models = that.models, funcName, colorFunc;
			if (name === 'lineColor') funcName = 'setStrokeColor';
			else if (name === 'fill') funcName = 'setFillColor';
			else if (name === 'fontColor') funcName = 'setFontColor';

			that.commandManager.initBatchCommand();
			models.forEach(function (model) {
				colorFunc = model[funcName];
				colorFunc.call(model, color);
			});
			that.commandManager.storeBatchCommand();
		},
		clickOutOfCanvasAreaEvt : function(e){
			if (!this.isHyperLinkCreate && this.cancelCreateBasicShape) this.cancelCreateBasicShape();
		},
		clickCanvasElementEvt : function(e){
			//body click 이벤트 전파 방지
			e.stopPropagation();
		},
		createbasicShape : function(item){
			var that = this;
			var graph = that.graph;
			// 선택된 모양에 따라 생성자 변경
			var className = item.className;
			var BasicShape = RappidElement[className], basicShape = null;
			// var BasicShape = joint.shapes.hmi[className], basicShape = null;
			var topLeftPoint = null, lastClickedTime = new Date().getTime();

			that.isStartCreate = true;
			if (that.cancelCreateBasicShape) that.cancelCreateBasicShape();
			//canvas 영역 밖 클릭 이벤트
			if (!that._onClickBodyEvt) that._onClickBodyEvt = that.clickOutOfCanvasAreaEvt.bind(that);
			$('body').off('mousedown', that._onClickBodyEvt);
			$('body').on('mousedown', that._onClickBodyEvt);
			if (!that._onClickCanvasElementEvt) that._onClickElementEvt = that.clickCanvasElementEvt.bind(that);
			that.element.off('mousedown', that._onClickElementEvt);
			that.element.on('mousedown', that._onClickElementEvt);

			that.cancelCreateBasicShape = null;
			that.selection.cancelSelection();

			that.isCreateShape = true;

			that.setCursor("crosshair");

			//사각형, 둥근사각형, 마름모, 타원, 삼각형 mouseup 이벤트
			var onMouseUpPolygonCreate = function(evt){
				evt = normalizeEvent(evt);
				var paperOffset = that.getPaperOffsetWithMouseEvent(evt);
				if (topLeftPoint) {
					that.isCreateMoving = false;
					if (className == 'Text') {
						var cellView = basicShape.findView(that.paper);
						basicShape.attr('body/stroke', 'transparent');
						basicShape.edit(cellView, cellView.el);
					}
					topLeftPoint = null;
					basicShape = null;
					that.commandManager.storeBatchCommand();
					that.cancelCreateBasicShape();
				} else {
					that.commandManager.initBatchCommand();
					topLeftPoint = {x: paperOffset.offsetX, y: paperOffset.offsetY};
					basicShape = new BasicShape({paletteItem: item});
					basicShape.resize(2, 2);
					basicShape.position(topLeftPoint.x, topLeftPoint.y);
					if (className == 'Text') {
						basicShape.attr('body/stroke', '#000000');
					}
					basicShape.addTo(graph);
					that.isCreateMoving = true;
				}
			};

			//사각형, 둥근사각형, 마름모, 타원, 삼각형 mousemove 이벤트
			var onMouseMovePolygonCreate = function(evt){
				evt = normalizeEvent(evt);
				if (!that.isCreateMoving || !basicShape) return;
				var isShiftKey = evt.shiftKey;
				var paperOffset = that.getPaperOffsetWithMouseEvent(evt);
				var direction = [];
				var gridSize = that.paper.options.gridSize || HmiCommon.DEFAULT_GRID_WIDTH;
				var dx = paperOffset.offsetX - topLeftPoint.x, dy = paperOffset.offsetY - topLeftPoint.y,
					posX = topLeftPoint.x, posY = topLeftPoint.y;
				dx = g.snapToGrid(dx, gridSize);
				dy = g.snapToGrid(dy, gridSize);
				if (dx < 0) {
					dx *= -1;
					posX = paperOffset.offsetX;
					direction.push('left');
				} else {
					direction.push('right');
				}
				if (dy < 0) {
					dy *= -1;
					posY = paperOffset.offsetY;
					direction.push('up');
				} else {
					direction.push('down');
				}
				direction = direction.join('-');

				if ((className === 'Rectangle' || className === 'Triangle' || className === 'Circle') && isShiftKey) {
					if (className === 'Triangle') {
						var height = dx * Math.sqrt(3) / 2;
						if (height > dy) dy = height;
						else dx = dy * 2 / Math.sqrt(3);
					} else if (dx > dy) dy = dx;
					else dx = dy;


					if (direction.indexOf('left') != -1) posX = topLeftPoint.x - dx;
					if (direction.indexOf('up') != -1) posY = topLeftPoint.y - dy;
				}
				basicShape.position(posX, posY);
				basicShape.resize(dx, dy);
			};

			//꺾은선, 곡선 mouseup 이벤트
			var onMouseUpPathCreate = function(evt){
				evt = normalizeEvent(evt);
				var paperOffset = that.getPaperOffsetWithMouseEvent(evt);
				var currentTime = new Date().getTime();

				//더블클릭시 선 생성 종료
				if (currentTime - lastClickedTime < 250) {
					if (basicShape.getRefPoints().length < 1) return;
					that.isCreateMoving = false;
					topLeftPoint = null;
					basicShape.removeRefPoint(-1);
					basicShape = null;
					that.commandManager.storeBatchCommand();
					lastClickedTime = currentTime;
					that.cancelCreateBasicShape();
					return;
				}
				lastClickedTime = currentTime;

				if (!topLeftPoint) {
					that.commandManager.initBatchCommand();
					topLeftPoint = {x: paperOffset.offsetX, y: paperOffset.offsetY};
					basicShape = new BasicShape({paletteItem: item});
					basicShape.addRefPoints(paperOffset);
					basicShape.addTo(graph);
					that.isCreateMoving = true;
				}
				basicShape.addRefPoints(paperOffset);
			};

			//꺾은선, 곡선, 선 mousemove 이벤트
			var onMouseMovePathCreate = function(evt){
				evt = normalizeEvent(evt);
				var paperOffset = that.getPaperOffsetWithMouseEvent(evt);
				if (evt.shiftKey) {
					var refPoints = basicShape.getRefPoints();
					var beforeLastPoint = refPoints[refPoints.length - 2];
					var pos = basicShape.position();
					var dx = Math.abs(paperOffset.offsetX - beforeLastPoint.x - pos.x), dy = Math.abs(paperOffset.offsetY - beforeLastPoint.y - pos.y);
					if (dx >= dy) paperOffset.offsetY = beforeLastPoint.y + pos.y;
					else paperOffset.offsetX = beforeLastPoint.x + pos.x;
				}
				if (that.isCreateMoving) basicShape.changeRefPoint(paperOffset, -1);
			};

			//선 mouseup 이벤트
			var onMouseUpStraightCreate = function(evt){
				evt = normalizeEvent(evt);
				var paperOffset = that.getPaperOffsetWithMouseEvent(evt);
				if (topLeftPoint) {
					that.isCreateMoving = false;
					topLeftPoint = null;
					basicShape = null;
					that.commandManager.storeBatchCommand();
					that.cancelCreateBasicShape();
					return;
				}

				that.commandManager.initBatchCommand();
				topLeftPoint = {x: paperOffset.offsetX, y: paperOffset.offsetY};
				basicShape = new BasicShape({paletteItem: item});
				basicShape.addRefPoints(paperOffset);
				basicShape.addTo(graph);
				that.isCreateMoving = true;

				basicShape.addRefPoints(paperOffset);
			};

			//테이블 mouseup 이벤트
			var onMouseUpTableCreate = function(evt){
				evt = normalizeEvent(evt);
				var paperOffset = that.getPaperOffsetWithMouseEvent(evt);
				var tableInsertDialog = PopupConfig.tableInsertDialog;
				tableInsertDialog.open();
				tableInsertDialog.unbind('onSaved');
				tableInsertDialog.bind('onSaved', function(e) {
					var result = e.result;
					var items = [], r, c, row = result.row, col = result.col, newCol;
					that.commandManager.initBatchCommand();
					for (c = 0; c < col; c++) {
						newCol = [];
						for (r = 0; r < row; r++) {
							newCol.push({
								id: 'col' + (c + 1) + '-row' + (r + 1),
								label: '',
								width: HmiCommon.DEFAULT_TABLE_COLUMN_WIDTH,
								height: HmiCommon.DEFAULT_TABLE_ROW_HEIGHT
							});
						}
						items.push(newCol);
					}
					basicShape = new BasicShape({paletteItem: item});
					basicShape.position(paperOffset.offsetX, paperOffset.offsetY);
					basicShape.set('items', items);

					basicShape.addTo(graph);
					that.commandManager.storeBatchCommand();
					if (that.cancelCreateBasicShape) that.cancelCreateBasicShape();
					that.cancelCreateBasicShape = null;
				});
			};

			//텍스트 mouseup 이벤트
			var onMouseUpTextCreate = function(evt){
				evt = normalizeEvent(evt);
				var paperOffset = that.getPaperOffsetWithMouseEvent(evt);

				that.commandManager.initBatchCommand();
				basicShape = new BasicShape({paletteItem: item});
				basicShape.position(paperOffset.offsetX, paperOffset.offsetY);
				basicShape.addTo(graph);

				that.commandManager.storeBatchCommand();
				that.cancelCreateBasicShape();
			};

			//이미지 이벤트
			var onMouseUpImageCreate = function(evt){
				evt = joint.util.normalizeEvent(evt);
				var ImportImage = BasicShape;
				HmiUtil.getImageInfoFromFile('basic-image-create', 1024 * 1024).done(function(file){
					that.commandManager.initBatchCommand();
					var f = file.file;
					var width = file.width;
					var height = file.height;
					var clientCoords = that.paper.clientToLocalPoint(evt.clientX, evt.clientY);
					var x = clientCoords.x;
					var y = clientCoords.y;
					basicShape = new ImportImage({paletteItem: item, widthFactor: width / 50, heightFactor: height / 50});
					basicShape.addTo(graph);
					basicShape.position(x, y, {preventSetGridPoint: true});
					var binding = basicShape.prop('binding');
					basicShape.fileName = binding.name = f.name;
					basicShape.fileData = binding.image = file.dataUrl;
					basicShape.attr('body/href', basicShape.fileData);
					basicShape.resize(width, height, {preventSetGridPoint: true});
					basicShape.setImageTransform();
					that.commandManager.storeBatchCommand();
				}).fail(function(msg){
					msgDialog.message(msg);
					msgDialog.open();
				});
				that.cancelCreateBasicShape();
			};

			//하이퍼링크 이벤트
			var onMouseUpHyperLinkCreate = function(evt) {
				var hyperLinkPopup = PopupConfig.hyperLinkPopup;
				if (!that._onSaveHyperLinkEvt) that._onSaveHyperLinkEvt = that.createHyperLinkOnSavedEvt.bind({
					sender : that,
					BasicShape : BasicShape,
					paletteItem : item
				});
				if (!that._onCloseHyperLinkEvt) that._onCloseHyperLinkEvt = function(){
					that.isHyperLinkCreate = false;
					if (that.cancelCreateBasicShape) that.cancelCreateBasicShape();
				};
				that._clientCoords = that.paper.clientToLocalPoint(evt.clientX, evt.clientY);
				that.isHyperLinkCreate = true;
				hyperLinkPopup.unbind('onSaved', that._onSaveHyperLinkEvt);
				hyperLinkPopup.bind('onSaved', that._onSaveHyperLinkEvt);
				hyperLinkPopup.unbind('onClosed', that._onCloseHyperLinkEvt);
				hyperLinkPopup.bind('onClosed', that._onCloseHyperLinkEvt);
				hyperLinkPopup.setDataSource({id : 0, name : '-'});
				hyperLinkPopup.open();
			};

			var onMouseUpZoneCreate = function(evt) {
				evt = normalizeEvent(evt);
				var paperOffset = that.getPaperOffsetWithMouseEvent(evt);

				that.commandManager.initBatchCommand();
				basicShape = new BasicShape({paletteItem: item});
				basicShape.position(paperOffset.offsetX, paperOffset.offsetY);
				basicShape.addTo(graph);
				if (that.cancelCreateBasicShape) that.cancelCreateBasicShape();
				that.cancelCreateBasicShape = null;
				that.commandManager.storeBatchCommand();
			};

			var mouseUpEvent, mouseMoveEvent;
			var imageOver;
			if (className === 'Line' || className === 'Curve') {
				mouseUpEvent = onMouseUpPathCreate;
				mouseMoveEvent = onMouseMovePathCreate;
			} else if (className === 'Straight') {
				mouseUpEvent = onMouseUpStraightCreate;
				mouseMoveEvent = onMouseMovePathCreate;
			} else if (className === 'Table') {
				mouseUpEvent = onMouseUpTableCreate;
			// } else if (className === 'Text') {
			// 	mouseUpEvent = onMouseUpTextCreate;
			} else if (className === 'ImportImage') {
				var cells = that.graph.getCells();
				var count = 0;
				cells.forEach(function(cell){
					if (cell.prop('binding/type') == className) count++;
				});
				if (count >= 100) {
					msgDialog.message(I18N.prop('HMI_OVER_IMAGE_COUNT'));
					msgDialog.open();
					imageOver = true;
				}
				 mouseUpEvent = onMouseUpImageCreate;
			} else if (className === 'HyperLink') {
				mouseUpEvent = onMouseUpHyperLinkCreate;
			} else if (className === 'Zone') {
				mouseUpEvent = onMouseUpZoneCreate;
			} else {
				mouseUpEvent = onMouseUpPolygonCreate;
				mouseMoveEvent = onMouseMovePolygonCreate;
			}
			if (mouseMoveEvent) that.element.on('mousemove', mouseMoveEvent);
			if (mouseUpEvent) that.element.on('mouseup', mouseUpEvent);

			that.cancelCreateBasicShape = function(){
				that.keyboard.off('esc');
				that.setCursor(null);
				if (that.isCreateMoving) {
					that.isCreateMoving = false;
					if (className !== 'Line' && className !== 'Curve' && className !== 'Straight') basicShape.remove();
					that.commandManager.storeBatchCommand();
				}
				that.isCreateShape = false;
				if (!that.isStartCreate) that.createView.clearBasicShapeBtnActive();
				if (that._onClickBodyEvt) $('body').off('mousedown', that._onClickBodyEvt);
				if (that._onClickElementEvt) that.element.off('mousedown', that._onClickElementEvt);

				if (mouseMoveEvent) that.element.off('mousemove', mouseMoveEvent);
				if (mouseUpEvent) that.element.off('mouseup', mouseUpEvent);

				that.cancelCreateBasicShape = null;
			};
			that.keyboard.on('esc', that.cancelCreateBasicShape);
			that.isStartCreate = false;

			if (imageOver) that.cancelCreateBasicShape();
		},
		createHyperLinkOnSavedEvt : function(e){
			var that = this.sender;
			if (!that || !that.isHyperLinkCreate) return;
			var item = e.result;
			var clientCoords = that._clientCoords;
			that.commandManager.initBatchCommand();
			var basicShape = new this.BasicShape({paletteItem : this.paletteItem});
			basicShape.position(clientCoords.x, clientCoords.y);
			basicShape.prop('binding/file', item);
			var label = item.name;
			if(label && label.length > HmiCommon.DEFAULT_LABEL_MAX_LENGTH){
				label = label.substring(0, HmiCommon.DEFAULT_LABEL_MAX_LENGTH);
			}
			basicShape.prop('binding/label', label);
			basicShape.addTo(that.graph);
			if (that.cancelCreateBasicShape) that.cancelCreateBasicShape();
			that.commandManager.storeBatchCommand();
			that.isHyperLinkCreate = false;
		},
		getPaperOffsetWithMouseEvent : function(event) {
			var paperElement = $(this.paper.el);
			var paperOffset = paperElement.offset();
			var paperScrollLeft = paperElement.scrollLeft();
			var paperScrollTop = paperElement.scrollTop();
			var offsetX, offsetY;
			var scale = this.paper.scale();

			offsetX = event.clientX - paperOffset.left + window.pageXOffset + paperScrollLeft;
			offsetY = event.clientY - paperOffset.top + window.pageYOffset + paperScrollTop;

			offsetX = offsetX > 0 ? offsetX : 1;
			offsetY = offsetY > 0 ? offsetY : 1;

			return {
				offsetX: offsetX / scale.sx,
				offsetY: offsetY / scale.sy
			};
		},
		textAlign : function(align){
			var that = this, models = that.models, propertyName;
			if(align === 'top' || align === 'middle' || align === 'bottom') propertyName = 'binding/vAlign';
			else if (align === 'left' || align === 'center' || align === 'right') propertyName = 'binding/hAlign';
			TextEditor.close();
			that.commandManager.initBatchCommand();
			models.forEach(function(model){
				model.setTextAlign(propertyName, align);
			});
			that.commandManager.storeBatchCommand();
		},
		setLineWidth : function(width){
			var that = this, models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function (model) {
				model.setStrokeWidth(width);
			});
			that.commandManager.storeBatchCommand();
		},
		setLineDasharray : function(value){
			var that = this, models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				if (model instanceof joint.shapes.hmi.Line) model.setDasharray(value);
			});
			that.commandManager.storeBatchCommand();
		},
		setLineSourceMarker : function(value){
			var that = this, models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				if (model instanceof joint.shapes.hmi.Line) model.setSourceMarker(value);
			});
			that.commandManager.storeBatchCommand();
		},
		setLineTargetMarker : function(value){
			var that = this, models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				if (model instanceof joint.shapes.hmi.Line) model.setTargetMarker(value);
			});
			that.commandManager.storeBatchCommand();
		},
		setOpacity : function(value){
			var that = this, models = that.models;
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				model.setOpacity(value);
			});
			that.commandManager.storeBatchCommand();
		},
		setFontSize : function(e){
			var that = this, size = e.dataItem, models = that.models;
			TextEditor.close();
			that.commandManager.initBatchCommand();
			models.forEach(function(model) {
				model.setFontSize(size);
			});
			that.commandManager.storeBatchCommand();
		},
		tableAction : function(type, arg) {
			var model = this.getActiveModel();
			if (model.prop('binding/type') !== 'Table') return;
			switch(type) {
			case 'mergeCell':
				model.mergeCell();
				break;
			case 'unmergeCell':
				model.unmergeCell();
				break;
			case 'add':
				if (arg == 'left' || arg == 'right') model.addColumn(arg);
				else model.addRow(arg);
				break;
			case 'remove':
				if (arg == 'column') model.removeColumn();
				else if (arg == 'row') model.removeRow();
				else model.remove();
				break;
			default:
			}
		},
		unitResize : function(dir) {
			var that = this;
			var models = that.models || [];

			that.commandManager.initBatchCommand();
			var bbox, nw, nh;
			models.forEach(function(model) {
				bbox = model.getBBox();
				nw = bbox.width;
				nh = bbox.height;
				switch(dir){
				case "left":
					nw--;
					break;
				case "up":
					nh--;
					break;
				case "right":
					nw++;
					break;
				case "down":
					nh++;
					break;
				default:
				}
				model.resize(nw, nh, {preventSetGridPoint : true});
			});
			that.commandManager.storeBatchCommand();
		},
		remove : function() {
			var that = this;
			var models = that.models || [];
			if (models.length == 0) return;
			that.commandManager.initBatchCommand();
			that.ungroup();
			models.forEach(function(model) {
				if (!model.prop('binding/locked')) model.remove();
			});

			that.selection.cancelSelection();
			that.reorderZOrder(that.graph.getElements());
			that.commandManager.storeBatchCommand();
		},
		selectAll : function() {
			var that = this;
			var graph = that.graph;
			var paper = graph._paper;
			var models = that.models;
			var cells = graph ? graph.getCells() : [];
			models.reset([]);
			cells.forEach(function(cell) {
				if (cell.prop('binding/locked')) return;
				if (cell.parent && cell.parent()) return;
				that.createSelectionPoint(cell.findView(paper), {shiftKey: true});
				that.models.add(cell);
			});
		},
		createSelectionPoint : function(cellView, evt) {
			// 도형 생성 중에는 핸들 생성x
			if (this.isCreateShape) return;
			evt = evt ? evt : {};
			var models = this.models, isLockedElementExist = false;
			var isShiftKey = evt.shiftKey;
			if (models.length > 0) {
				models.forEach(function (model) {
					if (model.prop('binding/locked')) isLockedElementExist = true;
				});
			}
			if (cellView.model && cellView.model.prop('binding/locked')) isLockedElementExist = true;
			// 잠긴 도형이 있을 때 멀티 선택x
			if (isLockedElementExist && isShiftKey) return;
			// 한 개 이상의 모델을 선택 한 상태에서 멀티 선택으로 잠긴 도형 선택x
			if (models.length > 0 && isShiftKey && cellView.model.prop('binding/locked')) return;
			// Group 된 단일 객체 선택x
			if (cellView.model && cellView.model.parent()) return;
			var freeTransform = new FreeTransform({
				cellView: cellView,
				clearAll: !isShiftKey,
				createView: this.createView
			});
			freeTransform.render();
		},
		canvasCenterAlign : function(dir) {
			if (!dir) dir = "x";
			var paperScroller = this.paperScroller;
			if (!paperScroller) return;
			if (dir == "all") {
				paperScroller.center();
			} else if (dir == "x") {
				var computedSize = this.paper.getComputedSize();
				var curVisibleArea = paperScroller.getVisibleArea();
				var posY = curVisibleArea.y + (curVisibleArea.height / 2);
				paperScroller.scroll(computedSize.width / 2, posY);
			}
		},
		clearTableCellSelect : function(allCells){
			var that = this;
			var models = allCells ? that.graph.getCells() : that.models;
			models.forEach(function(model) {
				var type = model.prop('binding/type');
				if (type == 'Table') model.clearHighlighted();
			});
		},
		clear : function(){
			var that = this;
			//Clear 시, Zoom Level 초기화
			if(that.isEditable){
				that.baseCanvas.detachBeforeUnloadEvt();
				that.keyboard.off();
			}
			that.select();
			that.setBackground(null);
			that.setZoomLevel(100, true);
			//that.setCursor(null);
			// if (that.paperScroller) {
			// 	if(!that.isEditable) that.paperScroller.center();
			// 	else that.paperScroller.scroll(0, 0);
			// }

			var paper = that.paper;
			var graph = that.graph;
			that._isClearing = true;
			graph.clear();
			paper.fitToContent(that.options.width, that.options.height);
			that._isClearing = false;
			//that._super();
		},
		hide : function(){
			var scrollWrapper = $(this.paperScroller.el);
			scrollWrapper.hide();
		},
		show : function(){
			var scrollWrapper = $(this.paperScroller.el);
			scrollWrapper.show();
		},
		getSelectedIndoorDevices : function(){
			var that = this, graph = that.graph, cells = graph.getCells();
			var binding, results = [];
			cells.forEach(function(model) {
				binding = model.prop("binding");
				if (binding.type == "Indoor"){
					if(binding.selected && binding.device.id){
						results.push(binding.device);
					}
				}
			});
			return results;
		},
		getZones : function(){
			var that = this, graph = that.graph, cells = graph.getCells();
			var type, results = [];
			cells.forEach(function(model) {
				type = model.prop('binding/type');
				if (type == 'Zone') results.push(model);
			});
			return results;
		},
		triggerIndoorDeviceElements : function(evtName, arg){
			var that = this, graph = that.graph, cells = graph.getCells();
			var binding;
			if(!arg) arg = {};
			cells.forEach(function(model) {
				binding = model.prop("binding");
				if (binding.type == "Indoor"){
					arg.model = model;
					model.trigger(evtName, arg);
				}
			});
		},
		selectIndoorDevice : function(device){
			var that = this;
			if(!that.isEditable && that.createView){
				if (device) {
					var zones = that.getZones();
					zones.forEach(function(zone) {
						zone.setZoneSelectedByInnerIndoorsSelected();
					});
				}
				that.createView.onSelectIndoorDevice({ item : device, items : that.getSelectedIndoorDevices() });
			}
		},
		panningScroll : function(){
			var scrollTop = this._scrollTop;
			var scrollLeft = this._scrollLeft;
			if (typeof scrollTop != 'undefined') this.paperScroller.scroll(scrollLeft, scrollTop);
			else this.paperScroller.center();
		}
	});


	var Canvas = {
		RappidCanvas : RappidCanvas
	};

	window.RappidCanvas = RappidCanvas;

	return Canvas;
});
//# sourceURL=hmi/config/rappid-canvas.js
