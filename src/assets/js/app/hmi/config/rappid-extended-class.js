define("hmi/config/rappid-extended-class", ["hmi/hmi-common"], function(HmiCommon){

	var _ = window._, joint = window.joint, g = window.g, V = window.V, Util = window.Util, kendo = window.kendo;
	var Graph = joint.dia.Graph, Paper = joint.dia.Paper;
	var normalizeEvent = joint.util.normalizeEvent;

	//Graph는 Backbone Model, Paper는 Backbone View를 상속 받아 구현되어있다. 아래와 같이 상속하여 구현 가능
	var ExtendedGraph = Graph.extend({
		initialize : function(options){
			Graph.prototype.initialize.apply(this, arguments);
		},
		toJSON : function(){
			var json = Graph.prototype.toJSON.apply(this, arguments);
			var paper = this._paper;
			//배경 화면 이미지 정보를 저장한다.
			if(paper && paper._canvas){
				var canvas = paper._canvas;
				var backgroundImageData = canvas.backgroundImageData;
				if(backgroundImageData) json.backgroundImageData = backgroundImageData;
				//버전 마킹
				var version = canvas.version;
				if(version) json.orginalVersion = version;
				else json.version = HmiCommon.CURRENT_HMI_VERSION;
			}

			return json;
		},
		fromJSON : function(json, opt){
			var paper = this._paper;
			//배경 화면 설정
			if(paper && paper._canvas){
				var canvas = paper._canvas;
				var backgroundImageData = json.backgroundImageData;
				if(backgroundImageData) canvas.setBackground(backgroundImageData);
				//버전 마킹
				var version = json.version ? json.version : json.originalVersion;
				if(version) canvas.setVersion(version);
			}

			var that = Graph.prototype.fromJSON.apply(this, arguments);
			//fromJSON으로 호출 시, add 이벤트가 발생하지 않으므로 임의 처리.
			var i, max, model, models, cells = that.get("cells");
			if(cells){
				models = cells.models;
				max = models.length;
				for( i = 0; i < max; i++ ){
					model = models[i];
					model.trigger("graph:add", model, model.collection, {add: true, remove: false, merge: false});
				}
			}
		},
		getCellsBBox: function(cells, opt) {
			opt || (opt = {});
			return joint.util.toArray(cells).reduce(function(memo, cell) {
				var rect = cell.getBBox(opt);
				if (!rect) { return memo; }
				var angle = cell.angle();
				//회전 무시한 크기
				if (angle && !opt.ignoreRotate) { rect = rect.bbox(angle); }
				if (memo) {
					return memo.union(rect);
				}
				return rect;
			}, null);
		}
	});

	var ExtendedPaper = Paper.extend({
		initialize : function(options){
			Paper.prototype.initialize.call(this, options);
		},
		sortViewsExact: function() {
			var $cells = $(this.cells).children('[model-id]');
			var cells = this.model.get('cells');

			joint.util.sortElements($cells, function(a, b) {
				var cellA = cells.get(a.getAttribute('model-id'));
				var cellB = cells.get(b.getAttribute('model-id'));
				if (!cellA || !cellB) return 0;
				var zA = cellA.attributes.z || 0;
				var zB = cellB.attributes.z || 0;
				if (zA === zB) return 0;
				return (zA < zB) ? -1 : 1;
			});
		}
	});

	var ExtendedFreeTransform = joint.ui.FreeTransform.extend({
		events: {
			'mousedown .resize': 'startResizing',
			'mousedown .rotate': 'startRotating',
			'touchstart .resize': 'startResizing',
			'touchstart .rotate': 'startRotating',
			'mousedown .change': 'startPointChanging',
			'touchstart .change': 'startPointChanging',
			'mousedown .new-point': 'addNewZonePoint'
		},
		renderHandles: function() {
			var $handleTemplate = $('<div/>').prop('draggable', false);
			var $rotateHandle = $handleTemplate.clone().addClass('rotate');
			var $resizeHandles, $changeHandles;
			var cell = this.options.cell, binding = cell.get('binding') || {};
			var key = binding.key;

			$resizeHandles = this.POSITIONS.map(function(position) {
				return $handleTemplate.clone().addClass('resize').attr('data-position', position);
			});

			if (key === "HMI_POLY_LINE" || key === "HMI_CURVE" || key === "HMI_STRAIGHT" || key === "SPACE_ZONE") {
				var refPoints = cell.getRefPoints();
				var bbox = cell.getBBox();
				$changeHandles = refPoints.map(function(point, index) {
					return $handleTemplate.clone().addClass('change').attr('data-index', index).css({
						'left': 'calc(' + (point.x / bbox.width * 100) + '% - 5px)',
						'top': 'calc(' + (point.y / bbox.height * 100) + '% - 5px)'
					});
				});
				$resizeHandles = $resizeHandles.concat($changeHandles);
			}

			if (key === "HMI_TABLE") this.$el.empty().append($resizeHandles); // 표 회전 방지
			else this.$el.empty().append($resizeHandles, $rotateHandle);
		},
		/*
			객체에 맞추기 위해 오버라이딩
		*/
		update: function() {
			var viewportCTM = this.options.paper.matrix();

			var bbox = this.options.cell.getBBox();

			bbox.x *= viewportCTM.a;
			bbox.x += viewportCTM.e;
			bbox.y *= viewportCTM.d;
			bbox.y += viewportCTM.f;
			bbox.width *= viewportCTM.a;
			bbox.height *= viewportCTM.d;

			var angle = g.normalizeAngle(this.options.cell.get('angle') || 0);

			var transformVal =  'rotate(' + angle + 'deg)';

			this.$el.css({
				'width': bbox.width - 2,
				'height': bbox.height - 2,
				'left': bbox.x,
				'top': bbox.y,
				'transform': transformVal,
				'-webkit-transform': transformVal, // chrome + safari
				'-ms-transform': transformVal // IE 9
			});

			var shift = Math.floor(angle * (this.DIRECTIONS.length / 360));

			if (shift != this._previousDirectionsShift) {
				var directions = this.DIRECTIONS.slice(shift).concat(this.DIRECTIONS.slice(0, shift));
				this.$('.resize').removeClass(this.DIRECTIONS.join(' ')).each(function(index, el) {
					$(el).addClass(directions[index]);
				});

				this._previousDirectionsShift = shift;
			}

			var cell = this.options.cell, binding = cell.get('binding') || {};
			var key = binding.key;

			if (key === "HMI_POLY_LINE" || key === "HMI_CURVE" || key === "HMI_STRAIGHT" || key === "SPACE_ZONE") {
				var refPoints = cell.getRefPoints();
				var lineBbox = cell.getBBox();
				var $changeHandles = this.$el.find('.change');
				var $changeHandle;
				refPoints.map(function(point, index) {
					$changeHandle = $changeHandles.eq(index);
					$changeHandle.css({
						'left': 'calc(' + (point.x / lineBbox.width * 100) + '% - 5px)',
						'top': 'calc(' + (point.y / lineBbox.height * 100) + '% - 5px)'
					});
				});
			}
		},

		renderZoneNewPointHandle: function(data) {
			var cell = this.options.cell;
			var bbox = cell.getBBox();
			var $newPointHandle = $('<div/>').addClass('new-point').attr('data-index', data.sp).css({
				'left': 'calc(' + (data.cp.x / bbox.width * 100) + '% - 5px)',
				'top': 'calc(' + (data.cp.y / bbox.height * 100) + '% - 5px)'
			});
			this.$el.append($newPointHandle);
		},
		removeZoneNewPointHandle: function() {
			var $newPointHandle = this.$el.find('.new-point');
			$newPointHandle.remove();
		},
		addNewZonePoint: function(evt) {
			var model = this.options.cellView.model;
			if (!model.prop('binding/locked')) {
				var clientCoords = this.options.paper.snapToGrid(evt.clientX, evt.clientY);
				var dataIndex = $(evt.target).data('index');
				model.addPoint({offsetX: clientCoords.x, offsetY: clientCoords.y}, dataIndex);
				this.renderHandles();
			}
		},
		startResizing: function(evt) {
			var model = this.options.cellView.model;
			ExtendedTextEditor.close();
			var binding = model.prop('binding');
			if (!binding.locked && binding.type != "Indoor") {
				joint.ui.FreeTransform.prototype.startResizing.call(this, evt);
			}
		},
		startRotating: function(evt) {
			var model = this.options.cellView.model;
			ExtendedTextEditor.close();
			if (!model.prop('binding/locked')) {
				joint.ui.FreeTransform.prototype.startRotating.call(this, evt);
			}
		},
		startPointChanging: function(evt) {
			ExtendedTextEditor.close();
			if (this.options.cellView.model.prop('binding/locked')) return;
			evt.stopPropagation();

			this.options.graph.startBatch('free-transform', { freeTransform: this.cid });

			var model = this.options.cellView.model;
			var index = $(evt.target).data('index');

			if (model.prop('binding/type') == 'Zone' && evt.shiftKey) {
				model.removeRefPoint(index);
				this.renderHandles();
				return;
			}

			this._initial = {
				index: index
			};
			this._action = 'change';
			this.startOp(evt.target);
		},
		remove: function() {
			if (this.options.createView && this.options.createView.getColorPickerOpenedState && this.options.createView.getColorPickerOpenedState()) return;
			joint.ui.FreeTransform.prototype.remove.apply(this, arguments);
		},
		onRemove: function() {
			$(document.body).off("mousemove touchmove", this.pointermove);
			$(document).off("mouseup touchend", this.pointerup);
			ExtendedFreeTransform.unregisterInstanceFromPaper(this, this.options.paper);
		},
		pointermove: function(evt) {

			evt = normalizeEvent(evt);
			var shiftKey = evt.shiftKey;

			var options = this.options;
			var clientCoords = options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
			var model = options.cell;

			if (!this._action) {
				if (model && model.prop('binding/type') == 'Zone') {
					this.removeZoneNewPointHandle();
					if (!model.isPointAroundContainsPoints(clientCoords)) {
						var result = model.isPointOnLine(clientCoords);
						if (result) this.renderZoneNewPointHandle(result);
					}
				}
				return;
			}

			// var gridSize = options.paper.options.gridSize;
			var gridSize = shiftKey ? 1 : options.paper.options.gridSize;
			var i = this._initial;

			switch (this._action) {

			case 'resize':
				var currentRect = model.getBBox();

				// The requested element's size has to be find on the unrotated element. Therefore we
				// are rotating a mouse coordinates back (coimageCoords) by an angle the element is rotated by and
				// with the center of rotation equals to the center of the unrotated element.
				var coimageCoords = g.point(clientCoords).rotate(currentRect.center(), i.angle);

				// The requested size is the difference between the fixed point and coimaged coordinates.
				var requestedSize = coimageCoords.difference(currentRect[i.selector]());

				// Calculate the new dimensions. `resizeX`/`resizeY` can hold a zero value if the resizing
				// on x-axis/y-axis is not allowed.
				var width = i.resizeX ? requestedSize.x * i.resizeX : currentRect.width;
				var height = i.resizeY ? requestedSize.y * i.resizeY : currentRect.height;

				// Fitting into a grid
				width = g.snapToGrid(width, gridSize);
				height = g.snapToGrid(height, gridSize);
				// Minimum
				var minWidth;
				if(typeof options.minWidth !== "undefined" && options.minWidth !== null) minWidth = options.minWidth;
				else minWidth = gridSize;
				var minHeight;
				if(typeof options.minHeight !== "undefined" && options.minHeight !== null) minHeight = options.minHeight;
				else minHeight = gridSize;

				width = Math.max(width, minWidth);
				height = Math.max(height, minHeight);
				// Maximum
				width = Math.min(width, options.maxWidth);
				height = Math.min(height, options.maxHeight);

				var diffW = currentRect.width - width, diffH = currentRect.height - height;
				var isDiagonal = i.relativeDirection.indexOf('-') != -1;

				// if (options.preserveAspectRatio || (shiftKey && diffW && diffH)) {
				if (options.preserveAspectRatio || (shiftKey && isDiagonal)) {

					var candidateWidth = currentRect.width * height / currentRect.height;
					var candidateHeight = currentRect.height * width / currentRect.width;

					candidateWidth > width ? (height = candidateHeight) : (width = candidateWidth);
				}

				//대칭리사이징
				var isSymmetricResizing = shiftKey && !isDiagonal;

				// Resize the element only if the dimensions are changed.
				if (currentRect.width != width || currentRect.height != height) {

					model.resize(width, height, {
						freeTransform: this.cid,
						direction: i.direction,
						relativeDirection: i.relativeDirection,
						trueDirection: i.trueDirection,
						ui: true,
						// The rest of properties are important for the Snapline plugin.
						minWidth: options.minWidth,
						minHeight: options.minHeight,
						maxWidth: options.maxWidth,
						maxHeight: options.maxHeight,
						preserveAspectRatio: options.preserveAspectRatio || shiftKey,
						preventSetGridPoint : shiftKey || (i.angle !== 0)
					});

					// 대칭 리사이징 시에는 요소의 중심 좌표가 변하지 않으므로 회전 여부와 상관 없이 TopLeft 좌표를 이동한다.
					if (isSymmetricResizing) {
						minWidth = model.prop('binding/minWidth');
						minHeight = model.prop('binding/minHeight');
						if(typeof minWidth === "undefined" || minWidth === null) minWidth = HmiCommon.GRAPHIC_MIN_WIDTH;
						if(typeof minHeight === "undefined" || minHeight === null) minHeight = HmiCommon.GRAPHIC_MIN_HEIGHT;

						var newX = width > (minWidth - diffW) ? currentRect.x + (diffW / 2) : currentRect.x;
						var newY = height > (minHeight - diffH) ? currentRect.y + (diffH / 2) : currentRect.y;
						model.position(newX, newY, {preventSetGridPoint : true});
					}
				}

				break;

			case 'rotate':
				// Calculate an angle between the line starting at mouse coordinates, ending at the centre
				// of rotation and y-axis and deduct the angle from the start of rotation.
				// paper의 snapToGrid가 gridSize를 기본으로 잡아주기 때문에 clientToLocalPoint로 clientCoords를 다시 선언한다.
				clientCoords = options.paper.clientToLocalPoint(evt.clientX, evt.clientY);
				var theta = i.startAngle - g.point(clientCoords).theta(i.centerRotation);

				var newAngle = g.snapToGrid(i.modelAngle + theta, shiftKey ? options.rotateAngleGrid : 1);
				model.rotate(newAngle, true);
				model.trigger('transform:rotate', model, newAngle);
				break;
			case 'change':
				model.changeRefPoint({ offsetX: clientCoords.x, offsetY: clientCoords.y }, i.index);
				var refPoints = model.getRefPoints();
				var bbox = model.getBBox();
				var $changeHandles = this.$el.find('.change');
				var $changeHandle;
				$changeHandles.each(function(idx, el) {
					$changeHandle = $(el);
					$changeHandle.css({
						'left': 'calc(' + (refPoints[idx].x / bbox.width * 100) + '% - 5px)',
						'top': 'calc(' + (refPoints[idx].y / bbox.height * 100) + '% - 5px)'
					});
				});
				break;
			default:
			}
		},
		stopOp: function() {
			joint.ui.FreeTransform.prototype.stopOp.call(this);
			if (this._action == 'resize') {
				var options = this.options || {};
				var model = options.cell;
				if (!model) return;
				var ra = model.getRestrictedAreaWithRotate();
				var angle = model.angle() || 0;
				var bbox = model.getBBox();
				var rotateBbox = bbox.bbox(angle);

				var x = bbox.x, y = bbox.y;
				if (x < ra.x) x = ra.x;
				if (y < ra.y) y = ra.y;
				if ((rotateBbox.x + rotateBbox.width) > (ra.x + ra.width)) x = (ra.x * 2) + ra.width - rotateBbox.width;
				if ((rotateBbox.y + rotateBbox.height) > (ra.y + ra.height)) y = (ra.y * 2) + ra.height - rotateBbox.height;

				if (bbox.x != x || bbox.y != y) model.position(x, y, {preventSetGridPoint: true});
			}
		}
	}, {
		removeInstancesForPaper: function(paper) {
			this.removeActiveStatusFromPaper(paper);
			joint.util.invoke(this.getInstancesForPaper(paper), "remove");
		},
		// cellView의 active 상태를 해제 후 제거
		removeActiveStatusFromPaper: function(paper) {
			var activeFreeTrans = this.getActiveInstancesFromPaper(paper);
			if (activeFreeTrans) {
				activeFreeTrans.$el.removeClass('active');
				activeFreeTrans.options.cellView.$el.removeClass('active');
			}
		},
		registerInstanceToPaper: function(freeTransformInstance, paper) {
			var instancesByPaper = this.instancesByPaper, curPaperInstance;
			// 등록된 paper 인스턴스가 없는 경우 새로 생성
			if (!instancesByPaper[paper.cid]) instancesByPaper[paper.cid] = {};
			curPaperInstance = instancesByPaper[paper.cid];

			// 기등록된 cellView의 active 상태를 전부 해제
			this.removeActiveStatusFromPaper(paper);

			// 새로 등록할 cellView의 active 상태 추가, 인스턴스 등록
			curPaperInstance[freeTransformInstance.cid] = freeTransformInstance;
			this.setActiceStatusFromPaperInstance(instancesByPaper, freeTransformInstance);
		},
		// 현재 active 상태인 freeTransform 인스턴스를 가져온다.
		getActiveInstancesFromPaper: function(paper) {
			var instancesByPaper = this.instancesByPaper, curPaperInstance;
			curPaperInstance = instancesByPaper[paper.cid];
			if (!curPaperInstance) return null;

			var cid, freeTrans = null;
			for (cid in curPaperInstance) {
				freeTrans = curPaperInstance[cid];
				if (freeTrans && freeTrans.$el && freeTrans.$el.hasClass('active')) break;
			}
			return freeTrans;
		},
		// freeTransformInstance의 active를 설정. 없는 경우 해당 paper의 마지막 freeTransformInstance에 부여
		setActiceStatusFromPaperInstance: function(paperInstance, freeTransformInstance) {
			if (!freeTransformInstance) {
				Object.entries(paperInstance).forEach(function(obj) {
					if (obj[1]) freeTransformInstance = obj[1];
				});
			}
			if (!freeTransformInstance) return;
			freeTransformInstance.$el.addClass('active');
			freeTransformInstance.options.cellView.$el.addClass('active');
		},
		unregisterInstanceFromPaper: function(freeTransformInstance, paper) {
			var instancesByPaper = this.instancesByPaper[paper.cid];
			if (instancesByPaper) {
				// cellView의 active 상태를 해제
				this.removeActiveStatusFromPaper(paper);
				instancesByPaper[freeTransformInstance.cid] = null;
				this.setActiceStatusFromPaperInstance(instancesByPaper);
			}
		}
	});

	var ExtendedSelection = joint.ui.Selection.extend({

		events: {
			'mousedown .selection-box': 'onSelectionBoxPointerDown',
			'touchstart .selection-box': 'onSelectionBoxPointerDown',
			'mousedown .handle': 'onHandlePointerDown',
			'touchstart .handle': 'onHandlePointerDown',
			//Selection 상태에서 Paper로 이벤트가 전달되지 않는 현상이 존재하여 이벤트 추가
			'mouseup .selection-box': 'onSelectionMouseEvents',
			'dblclick .selection-box': 'onSelectionMouseEvents',
			'click .selection-box': 'onSelectionMouseEvents',
			'contextmenu .selection-box': 'onSelectionMouseEvents',
			'hover .selection-box': 'onSelectionMouseEvents',
			'mousemove .selection-box': 'onSelectionMouseEvents',
			'mouseenter .selection-box': 'onSelectionMouseEvents',
			'mouseleave .selection-box': 'onSelectionMouseEvents'
		},
		translateSelectedElements: function(dx, dy) {
			// var isLocked = false;
			// this.model.each(function(element) {
			// 	if (element.prop('isLocked')) isLocked = true;
			// });
			// if (!isLocked) joint.ui.Selection.prototype.translateSelectedElements.call(this, dx, dy);
			// This hash of flags makes sure we're not adjusting vertices of one link twice.
			// This could happen as one link can be an inbound link of one element in the selection
			// and outbound link of another at the same time.
			var processedCells = {};

			this.model.each(function(element) {

				// TODO: snap to grid.
				// isLocked 속성이 있으면 이동을 막음.
				if (processedCells[element.id] || element.prop('binding/locked')) return;

				// Make sure that selection won't update itself when not necessary
				var opt = { selection: this.cid };

				// Translate the element itself.
				element.translate(dx, dy, opt);

				element.getEmbeddedCells({ deep: true }).forEach(function(embed) {
					processedCells[embed.id] = true;
				});

				// Translate link vertices as well.
				var connectedLinks = this.options.graph.getConnectedLinks(element);

				connectedLinks.forEach(function(link) {

					if (processedCells[link.id]) return;

					link.translate(dx, dy, opt);

					processedCells[link.id] = true;
				});

			}.bind(this));
		},
		stopSelecting: function(evt) {
			var startPoint, paper = this.options.paper;
			switch (this._action) {
			case "selecting":
				var offset = this.$el.offset(), width = this.$el.width(), height = this.$el.height();
				startPoint = paper.pageToLocalPoint(offset.left, offset.top);
				var scale = paper.scale();
				width /= scale.sx;
				height /= scale.sy;
				var area = g.rect(startPoint.x, startPoint.y, width, height),
					cells = this.getElementsInSelectedArea(area),
					filters = this.options.filter;
				if (Array.isArray(filters)) {
					cells = cells.filter(function(cellView) {
						return !filters.includes(cellView.model) && !filters.includes(cellView.model.get("type"));
					});
				} else if (joint.util.isFunction(filters)){
					cells = cells.filter(function(cellView) {
						return !filters(cellView.model);
					});
				}
				// Group된 객체는 선택하지 않음
				cells = cells.filter(function(cellView) {
					return !cellView.model.parent();
				});

				var freeTransform;
				var createView = this.options.createView;
				var models = cells.map(function(cellView) {
					freeTransform = new ExtendedFreeTransform({
						cellView: cellView,
						clearAll: false,
						createView: createView
					});
					freeTransform.render();
					return cellView.model;
				});
				this.model.reset(models, {
					ui: true
				});
				break;
			case "translating":
				this.options.graph.stopBatch("selection-translate");
				startPoint = paper.snapToGrid({
					x: evt.clientX,
					y: evt.clientY
				});
				this.notify("selection-box:pointerup", evt, startPoint.x, startPoint.y);
				break;
			default:
				this._action || this.cancelSelection();
			}
			this._action = null;
		},
		cancelSelection: function () {
			ExtendedFreeTransform.clear(this.options.paper);
			this.options.paper.trigger('selection:cancelSelection');
			joint.ui.Selection.prototype.cancelSelection.call(this);
		},
		onSelectionBoxPointerDown : function(evt){
			evt.stopPropagation();
			evt = normalizeEvent(evt);

			// Start translating selected elements.
			if (this.options.allowTranslate) {
				this.startTranslatingSelection(evt);
			}

			var elementView = this.getCellView(evt.target);
			this.eventData(evt, {
				activeElementView: elementView
			});
			var localPoint = this.options.paper.snapToGrid(evt.clientX, evt.clientY);
			this.notify('selection-box:pointerdown', evt, localPoint.x, localPoint.y);
			var isLocked = elementView && elementView.model && elementView.model.prop('binding/locked');
			// 잠긴 객체 위에서 shiftKey 동작시 위임하지 않음
			if (!isLocked || !evt.shiftKey) this.delegateDocumentEvents(null, evt.data);

			var cellView = this._activeElementView;
			if(cellView){
				var view = cellView && cellView.findView && cellView.findView(this.options.paper);
				localPoint = this.options.paper.snapToGrid(evt.clientX, evt.clientY);
				cellView.trigger("event:pointerdown", view, evt, localPoint);
			}
		},
		onSelectionMouseEvents : function(evt){
			//Selection 상태에서 selection-box로 받은 이벤트를 Element로 전달.
			var type = evt.type;
			var evtName;
			if(type == "mouseup") evtName = "event:pointerup";
			else if(type == "click") evtName = "event:pointerclick";
			else if(type == "dblclick") evtName = "event:pointerdblclick";
			else if(type == "contextmenu") evtName = "event:contextmenu";
			else if(type == "mousemove") evtName = "event:pointermove";
			else if(type == "hover") evtName = "event:mouseover";
			else if(type == "mouseenter") evtName = "event:mouseenter";
			else if(type == "mouseleave") evtName = "event:mouseout";

			var cellView = this.getCellView(evt.target);
			var localPoint = this.options.paper.snapToGrid(evt.clientX, evt.clientY);
			if(evtName && cellView){
				var element = cellView.model;
				if(element){
					evt.target = cellView.el;
					element.trigger(evtName, cellView, evt, localPoint);
				}
				if (evtName === "event:pointerdblclick") this.options.paper.trigger('element:pointerdblclick', cellView, evt, localPoint);
			}
		},
		adjustSelection: function(evt) {

			evt = normalizeEvent(evt);

			var dx;
			var dy;

			var data = this.eventData(evt);
			var action = data.action;

			switch (action) {

			case 'selecting':

				dx = evt.clientX - data.clientX;
				dy = evt.clientY - data.clientY;

				var left = parseInt(this.$el.css('left'), 10);
				var top = parseInt(this.$el.css('top'), 10);

				this.$el.css({
					left: dx < 0 ? data.offsetX + dx : left,
					top: dy < 0 ? data.offsetY + dy : top,
					width: Math.abs(dx),
					height: Math.abs(dy)
				});
				break;

			case 'translating':

				var snappedClientCoords = this.options.paper.snapToGrid(evt.clientX, evt.clientY);
				var snappedClientX = Math.max(0, snappedClientCoords.x);
				var snappedClientY = Math.max(0, snappedClientCoords.y);

				if (this._activeElementView && this._activeElementView.attributes.type == 'hmi.Table') {
					break;
				}

				dx = snappedClientX - data.snappedClientX;
				dy = snappedClientY - data.snappedClientY;

				// restrict to area
				var restrictedArea = this.options.paper.getRestrictedArea();
				if (restrictedArea) {

					var elements = this.model.toArray();
					var selectionBBox = this.options.graph.getCellsBBox(elements);

					// restrict movement to ensure that all elements within selection stay inside restricted area
					var minDx = restrictedArea.x - selectionBBox.x;
					var minDy = restrictedArea.y - selectionBBox.y;
					var maxDx = (restrictedArea.x + restrictedArea.width) - (selectionBBox.x + selectionBBox.width);
					var maxDy = (restrictedArea.y + restrictedArea.height) - (selectionBBox.y + selectionBBox.height);

					if (dx < minDx) { dx = minDx; }
					if (dy < minDy) { dy = minDy; }

					if (dx > maxDx) { dx = maxDx; }
					if (dy > maxDy) { dy = maxDy; }
				}

				if (dx || dy) {

					this.translateSelectedElements(dx, dy);

					if (!this.boxesUpdated) {

						var paperScale = this.options.paper.scale();

						// Translate each of the `selection-box` and `selection-wrapper`.
						this.$el.children('.selection-box').add(this.$selectionWrapper)
							.css({
								left: '+=' + (dx * paperScale.sx),
								top: '+=' + (dy * paperScale.sy)
							});

					} else if (this.model.length > 1) {

						// If there is more than one cell in the selection, we need to update
						// the selection boxes again. e.g when the first element went over the
						// edge of the paper, a translate event was triggered, which updated the selection
						// boxes. After that all remaining elements were translated but the selection
						// boxes stayed unchanged.
						this.updateSelectionBoxes();
					}

					data.snappedClientX = snappedClientX;
					data.snappedClientY = snappedClientY;
				}

				this.notify('selection-box:pointermove', evt, snappedClientX, snappedClientY);
				break;

			default:
				if (action) {
					this.pointermove(evt);
				}
				break;
			}

			this.boxesUpdated = false;
			evt.preventDefault();
		},
		onRemoveElement : function(element) {
			joint.ui.Selection.prototype.onRemoveElement.apply(this, arguments);
			this._activeElementView = null;
			this.options.paper.trigger('selection:changed');
		},
		onResetElements : function(element) {
			joint.ui.Selection.prototype.onResetElements.apply(this, arguments);
			// var view = element && element.findView && element.findView(this.options.paper);
			// this._activeElementView = view;
			this.options.paper.trigger('selection:changed');
		},
		onAddElement : function(element) {
			joint.ui.Selection.prototype.onAddElement.apply(this, arguments);
			// var view = element && element.findView && element.findView(this.options.paper);
			// this._activeElementView = view;
			this.options.paper.trigger('selection:changed');
		}
	});

	//createView.updateUndoRedoButtonState를 사용하기 위해 CommandManager 확장
	//options에 createView 추가 및 커맨드 추가/실행 후 updateUndoRedoButtonState 실행
	var ExtendedCommandManager = joint.dia.CommandManager.extend({
		defaults: {
			cmdBeforeAdd: null,
			cmdNameRegex: /^(?:add|remove|change:\w+)$/,
			applyOptionsList: ['propertyPath'],
			revertOptionsList: ['propertyPath'],
			createView: null
		},
		initialize: function(options) {

			joint.util.bindAll(this, 'initBatchCommand', 'storeBatchCommand');

			this.graph = options.graph;
			this.createView = options.createView;

			this.reset();
			this.listen();
		},
		push: function(cmd) {
			var type = cmd.data && cmd.data.type || '';
			if (type == 'hmi.Table') {
				var propertyPath = cmd.options && cmd.options.propertyPath || '';
				if (propertyPath.indexOf('highlighted') != -1) return;
			}
			var action = cmd.action || '';
			if (action.indexOf('version') != -1) return;

			this.redoStack = [];
			if (!cmd.batch) {
				this.undoStack.push(cmd);
				if(this.createView) this.createView.updateUndoRedoButtonState(this.hasUndo(), this.hasRedo());
				this.trigger('add', cmd);
			} else {
				this.lastCmdIndex = Math.max(this.lastCmdIndex, 0);
				// Commands possible thrown away. Someone might be interested.
				this.trigger('batch', cmd);
			}
		},
		storeBatchCommand: function() {

			// In order to store batch command it is necesary to run storeBatchCommand as many times as
			// initBatchCommand was executed
			if (this.batchCommand && this.batchLevel <= 0) {

				var batchCommand = this.filterBatchCommand(this.batchCommand);
				// checking if there is any valid command in batch
				// for example: calling `initBatchCommand` immediately followed by `storeBatchCommand`
				if (batchCommand.length > 0) {

					this.redoStack = [];

					this.undoStack.push(batchCommand);
					if(this.createView) this.createView.updateUndoRedoButtonState(this.hasUndo(), this.hasRedo());
					this.trigger('add', batchCommand);
				}

				this.batchCommand = null;
				this.lastCmdIndex = null;
				this.batchLevel = null;

			} else if (this.batchCommand && this.batchLevel > 0) {

				// low down batch command level, but not store it yet
				this.batchLevel--;
			}
		},
		undo: function(opt) {

			var command = this.undoStack.pop();

			if (command) {

				this.revertCommand(command, opt);
				this.redoStack.push(command);
				if(this.createView) this.createView.updateUndoRedoButtonState(this.hasUndo(), this.hasRedo());
				var models = this.getModelsFromCommand(command);
				this.graph._paper.trigger('afterCommand', models);
			}
		},

		redo: function(opt) {

			var command = this.redoStack.pop();

			if (command) {

				this.applyCommand(command, opt);
				this.undoStack.push(command);
				if(this.createView) this.createView.updateUndoRedoButtonState(this.hasUndo(), this.hasRedo());
				var models = this.getModelsFromCommand(command);
				this.graph._paper.trigger('afterCommand', models);
			}
		},
		getModelsFromCommand: function(command) {
			var model, models = [], graph = this.graph;
			var i, len = command.length;
			var cmd, ids = {};
			for (i = 0; i < len; i++) {
				cmd = command[i];
				if (!cmd.data || !cmd.data.id) continue;
				ids[cmd.data.id] = true;
			}

			$.each(ids, function(id) {
				model = graph.getCell(id);
				if (model) models.push(model);
			});
			return models;
		}
	});

	var ExtendedTextEditor = joint.ui.TextEditor.extend({
		//Text Editor 최초 Render 시, 요소 타입이 Label인 경우
		//TextWrap으로 자동 줄바꿈 되기 전의 원본 데이터를 Text 편집으로 가져온다.
		render: function(root) {
			var that = this, options = that.options, min = options.min, max = options.max, isEditableCanvas = options.isEditableCanvas;
			// The caret (cursor), displayed as a thin <div> styled in CSS.
			this.$caret = $('<div>', { 'class': 'caret' });

			// The container for selection boxes.
			this.$selection = $('<div>');
			// One selection box covering one character.
			this.$selectionBox = $('<div>', { 'class': 'char-selection-box' });
			this.$el.append(this.$caret, this.$selection);

			this.$textareaContainer = $('<div>', { 'class': 'textarea-container' });

			this.$textarea = $('<textarea>', this.options.textareaAttributes);
			this.textarea = this.$textarea[0];
			if(options.model && options.model.prop("binding/type") == "Label"){
				this._textContent = this.textarea.value = options.model.prop("binding/beforeWrapText");
			}else{
				this._textContent = this.textarea.value = this.getTextContent();
			}
			this._textareaValueBeforeInput = this.textarea.value;
			this.$textareaContainer.append(this.textarea);

			if (this.options.focus) {
				this.$el.append(this.$textareaContainer);
			}

			// First add the container element to the `<body>`, otherwise
			// the `focus()` called afterwords would not work.
			$(root || document.body).append(this.$el);

			var bbox = V(this.options.text).bbox();

			this.$textareaContainer.css({
				left: bbox.x,
				top: bbox.y
			});

			this.focus();

			// TODO: This should be optional?
			V(this.options.text).attr('cursor', 'text');

			this.selectAll();

			//Text 입력 시 처리에 대한 추가 구현 내용
			//모니터링 시에는 숫자만 입력 가능해야한다.
			var KEY_CODE_ENTER = 13;
			var KEY_CODE_DELETE = 46;
			var KEY_CODE_NUMBER_0 = 48;
			var KEY_CODE_NUMBER_9 = 57;
			var KEY_CODE_ESCAPE = 27;
			var KEY_CODE_MINUS = 189;
			var KEY_CODE_DOT = 190;
			var KEY_CODE_BACKSPACE = 8;
			var KEY_CODE_NUMBER_0_KEYPAD = 96;
			var KEY_CODE_NUMBER_9_KEYPAD = 105;

			if(!isEditableCanvas){
				that.$textarea.off("keydown");
				that.$textarea.on("keydown", function(e){
					var charCode = (e.which) ? e.which : event.keyCode;
					//ESC 입력 시, 입력 종료
					if(charCode == KEY_CODE_ESCAPE) ExtendedTextEditor.close();

					var value = this.value;
					if(!isNaN(Number(value))){
						var num = Number(value);
						if(num >= min && num <= max) this._beforeValue = value;
					}

					//음수 처리
					//음수는 맨 앞에만 붙을 수 있다.
					if(charCode == KEY_CODE_MINUS && value.length > 0) return false;

					//소수점 처리
					if(charCode == KEY_CODE_DOT){
						//점은 맨 앞에 붙을 수 없다
						if(value.length == 0) return false;
						//점은 2개 이상 붙을 수 없다.
						if(value.indexOf(".") != -1) return false;
					}
					//Enter 입력 시, 닫기
					if(charCode == KEY_CODE_ENTER) ExtendedTextEditor.close(true);
					//삭제, -, . 허용.
					if(charCode == KEY_CODE_DELETE || (options.isAllowNegative && charCode == KEY_CODE_MINUS) || (options.isAllowDot && charCode == KEY_CODE_DOT)) return true;
					if(charCode > KEY_CODE_ESCAPE
						&& (charCode < KEY_CODE_NUMBER_0
							|| (charCode > KEY_CODE_NUMBER_9 && charCode < KEY_CODE_NUMBER_0_KEYPAD)
							|| charCode > KEY_CODE_NUMBER_9_KEYPAD)){
						return false;
					}
					return true;
				});
				that.$textarea.off("keyup");
				that.$textarea.on("keyup", function(e){
					var value = this.value;
					if(options.isAllowDot){
						var dotIndex = value.indexOf(".");
						//점이 가장 뒤에 있을 경우는 소수점 입력으로 허용
						if(dotIndex == value.length - 1) return true;
					}

					//-만 있을 경우는 음수 입력으로 허용
					if(options.isAllowNegative && value == '-') return true;

					if(isNaN(Number(value))){
						this.value = $.trim(this._beforeValue);
						that.setCaret(this.value.length);
					}else if(Number(value) < min){
						this.value = min;
						that.setCaret(this.value.length);
					}else if(Number(value) > max){
						this.value = max;
						that.setCaret(this.value.length);
					}
				});
			}else if(options.model){
				var binding = options.model.prop("binding");
				if(binding.type == "Label"){
					that.$textarea.off("keydown");
					that.$textarea.on("keydown", function(e){
						var value = this.value;
						var length = Util.getStringLength(value);
						var charCode = (e.which) ? e.which : event.keyCode;

						//ESC 입력 시, 입력 종료
						if(charCode == KEY_CODE_ESCAPE) ExtendedTextEditor.close();

						if(length >= HmiCommon.DEFAULT_TEXT_MAX_LENGTH){
							if(charCode <= kendo.keys.DOWN || charCode == kendo.keys.DELETE) return true;
							//Ctrl, Command 허용
							if(e.ctrlKey || charCode == 0){
								//C, X 허용 (복사/오려두기)
								if(charCode == 67 || charCode == 88) return true;
							}
							return false;
						}
					});
				}
			}

			return this;
		},
		//텍스트가 전부 지워졌을 경우 fontSize만큼 y좌표 값을 계산하지 못하는 이슈가 있어 함수 전체 오버라이딩
		//코드의 상세 주석은 rappid.js 코드 참조
		setCaret: function(charNum, opt) {
	        if (joint.util.isObject(charNum)) {
	            opt = charNum;
	            charNum = void 0;
	        }
	        opt = opt || {};

	        var elText = this.options.text;
	        var numberOfChars = this.getNumberOfChars();
	        var selectionStart = this.selection.start;
	        var text = this.textarea.value;

	        if (typeof charNum !== 'undefined') {
	            charNum = Math.min(Math.max(charNum, 0), numberOfChars);
	            selectionStart = this.selection.start = this.selection.end = charNum;
	        }

	        if (!opt.silent) {
	            this.trigger('caret:change', selectionStart);
	        }

	        this.setTextAreaSelection(selectionStart, selectionStart);

	        if (this.options.debug) {
	            console.log('setCaret(', charNum, opt, ')', 'selectionStart', selectionStart, 'isLineEnding', this.isLineEnding(selectionStart), 'isEmptyLineUnderSelection', this.isEmptyLineUnderSelection(selectionStart), 'svgCharNum', this.selectionStartToSvgCharNum(selectionStart), 'nonEmptyLinesBefore', this.nonEmptyLinesBefore(selectionStart));
	        }

	        var caretPosition;
	        try {
	            var charIndex;
	            if (!this.isEmptyLineUnderSelection(selectionStart) && (this.isLineEnding(selectionStart) || text.length === selectionStart)) {
	                charIndex = this.selectionStartToSvgCharNum(selectionStart) - 1;
	                caretPosition = elText.getEndPositionOfChar(charIndex);
	            } else {
	                charIndex = this.selectionStartToSvgCharNum(selectionStart);
	                caretPosition = elText.getStartPositionOfChar(charIndex);
	            }
	        } catch (e) {
	            this.trigger('caret:out-of-range', selectionStart);
	            caretPosition = {
	                x: 0,
	                y: 0
	            };
	        }

	        var caretScreenPosition = this.localToScreenCoordinates(caretPosition);
	        var t = this.getTextTransforms();
	        var angle = t.rotation;
	        var fontSize = this.getFontSize() * t.scaleY;

	        if (this.options.placeholder) {
	            this.$caret.toggleClass('placeholder', numberOfChars === 0);
	        }

	        this.$caret.css({
	            left: caretScreenPosition.x,
	            //top: caretScreenPosition.y + (numberOfChars ? -fontSize : 0),
				top: caretScreenPosition.y - fontSize,
	            height: fontSize,
	            'line-height': fontSize + 'px',
	            'font-size': fontSize + 'px',
	            '-webkit-transform': 'rotate(' + angle + 'deg)',
	            '-webkit-transform-origin': '0% 100%',
	            '-moz-transform': 'rotate(' + angle + 'deg)',
	            '-moz-transform-origin': '0% 100%'
	        }).attr({
	            'text-anchor': this.getTextAnchor()
	        }).show();

	        this.$textareaContainer.css({
	            left: caretScreenPosition.x,
	            top: caretScreenPosition.y + (numberOfChars ? -fontSize  : 0)
	        });

	        // Always focus. If the caret was set as a reaction on
	        // mouse click, the textarea looses focus in FF.
	        this.focus();

	        return this;
	    }
	}, {
		//edit() 호출 시, 확장된 Text Editor로 초기화하기 위하여 함수 전체 오버라이딩
		//코드의 상세 주석은 rappid.js 코드 참조
		edit : function(el, opt) {
			var that = this;
	        opt = opt || {};
	        var update = opt.update !== false;
	        this.options = joint.util.assign({}, opt, { update: update });
	        var textElement = this.getTextElement(el);
	        if (!textElement) {
	            if (this.options.debug) {
	                console.log('ui.TextEditor: cannot find a text element.');
	            }
	            return (void 0);
	        }
	        this.close();
	        this.ed = new ExtendedTextEditor(joint.util.assign({ text: textElement }, opt));

	        this.ed.on('all', this.trigger, this);
	        var target;
	        if (opt.cellView) {
	            target = opt.cellView.paper.el;
	            this.cellViewUnderEdit = opt.cellView;
	            this.cellViewUnderEditInteractiveOption = this.cellViewUnderEdit.options.interactive;
	            this.cellViewUnderEdit.options.interactive = false;
	            if (opt.annotationsProperty && !this.ed.getAnnotations()) {
	                var annotations = this.cellViewUnderEdit.model.prop(opt.annotationsProperty);
	                if (annotations) {
	                    this.ed.setAnnotations(this.deepCloneAnnotations(annotations));
	                }
	            }
	        } else {
	            var svg = V(textElement).svg();
	            target = svg.parentNode;
	        }

	        if (update) {
	            this.ed.on('text:change', function(newText, oldText, annotations) {
	                if (opt.cellView) {

	                    var originalLabelIndex = null;
	                    if (opt.textProperty) {
	                        if (opt.cellView.model.isLink() && opt.textProperty.substr(0, 'labels'.length) === 'labels') {
	                            originalLabelIndex = V($(V(textElement).node).closest('.label')[0]).index();
	                        }
							//한글 입력 방지 처리를 위한 textValidation 옵션 전달
							if(opt.textValidation && $.isFunction(opt.textValidation)){
								newText = opt.textValidation(newText);
								that.ed.textarea.value = newText;
							}

							if(opt.model){
								var binding = opt.model.prop("binding");
								if(binding && binding.type == "Label"){
									//문자가 1000개 초과할 경우 자른다.
									var length = Util.getStringLength(newText);
									if(length >= HmiCommon.DEFAULT_TEXT_MAX_LENGTH){
										newText = newText.substring(0, HmiCommon.DEFAULT_TEXT_MAX_LENGTH);
										that.ed.textarea.value = newText;
									}
								}
							}
	                        opt.cellView.model.prop(opt.textProperty, newText, { textEditor: this.ed.cid });
	                    }
	                    if (opt.annotationsProperty) {
	                        opt.cellView.model.prop(opt.annotationsProperty, this.deepCloneAnnotations(annotations), { rewrite: true, textEditor: this.ed.cid });
	                    }
	                    if (originalLabelIndex !== null) {
	                        var labelElements = V(opt.cellView.el).find('.label');
	                        textElement = labelElements[originalLabelIndex].findOne('text');
	                        this.ed.setTextElement(textElement.node);
	                    }
	                } else {
	                    V(textElement).text(newText, annotations);
	                }
	            }, this);
	        }
	        this.ed.render(target);
	        return this;
		},
		close : function(isEnter){
			var that = this;
			var editor = this.ed;
			joint.ui.TextEditor.close.apply(that, arguments);
			var opt = this.options;
			//편집 후에 닫히는 것을 체크하기 위하여 editor 존재 유무 체크
			if(opt && editor){
				var cellView = opt.cellView;
				if(cellView && cellView.model){
					var element = cellView.model;
					element.trigger("event:texteditorclose", that, isEnter);
				}
			}
		}
	});

	var ExtendedPaperScroller = joint.ui.PaperScroller.extend({
		events: {
			'mousewheel .paper-scroller-background': 'onMousewheel'
		},
		onMousewheel: function(evt) {
			this.trigger('scroller:mousewheel', evt);
		},
		stopPanning: function(evt) {
			$(document.body).off('.panning');
			$(window).off('.panning');
			this.$el.removeClass('is-panning');
			this.trigger('pan:stop', {scrollTop : this.el.scrollTop, scrollLeft : this.el.scrollLeft});
		},
		onResize: function() {
			//paper scroller의 영역이 축소될 때 잉여 공간이 남아서 overiding하여 동작을 지움
		}
	});

	return {
		Graph : ExtendedGraph,
		Paper : ExtendedPaper,
		FreeTransform : ExtendedFreeTransform,
		Selection : ExtendedSelection,
		CommandManager : ExtendedCommandManager,
		TextEditor : ExtendedTextEditor,
		PaperScroller : ExtendedPaperScroller
	};
});
//# sourceURL=hmi/config/rappid-extended-class.js
