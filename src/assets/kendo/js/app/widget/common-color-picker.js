(function(window, $){
	var kendo = window.kendo;
	var localStorage = window.localStorage;
	var PANEL_TEMPLATE = "<div class='wrapper'>" +
		"<div class='inner'>" +
			"<div class='container recent'>" +
				"<div class='content recent'>" +
					"<div class='title'>Recent Colors</div>" +
					"<div class='item'>" +
						"<div class='inner'>" +
							"<div class='common-recent-palette'></div>" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</div>" +
			"<div class='common-color-picker-tab container picker common-tab-strip'>" +
				"<ul>" +
					"<li class='k-state-active' tab-name='default'>Default Color</li>" +
					"<li tab-name='custom'>Custom Color</li>" +
				"</ul>" +
				"<div class='content default'>" +
					"<div class='item'>" +
						"<div class='inner'>" +
							"<div class='common-default-palette'></div>" +
						"</div>" +
					"</div>" +
				"</div>" +
				"<div class='content custom'>" +
					"<div class='item'>" +
						"<div class='inner'>" +
							"<div class='common-custom-picker'></div>" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</div>" +
		"</div>" +
	"</div>";

	var OPACITY_INPUT_TEMPLATE = '<div class="opacity-control-wrapper"><input class="k-input" /></div>';
	var _getCalculatedCenterPos = function(wrapper){
		return {
			top: $('body').height() / 2 - wrapper.height() / 2,
			left: $('body').width() / 2 - wrapper.width() / 2
		};
	};

	var CLASS_COMMON_COLORPICKER_CELL_TRANSPARENT = 'common-colorpicker-cell-transparent';
	var COLOR_TRANSPARENT = 'transparent';
	var CLASS_USE_TRANSPARENT_COLOR = 'use-transparent-color';
	var LOCALSTORAGE_ID_RECENT_PALETTE = 'colorPicker_recentPalette';
	var OPACITY_COLOR_PICKER_HEIGHT = 489;
	var ITEMSELECTEDCLASS = 'k-state-selected';
	var STATEDISABLED = "k-state-disabled";
	var ns = '.kendoNumericTextBox';
	var MOUSELEAVE = 'mouseleave' + ns;
	var HOVEREVENTS = 'mouseenter' + ns + ' ' + MOUSELEAVE;
	var DEFAULT = 'k-state-default';
	var DISABLED = 'disabled';
	var SELECTED = 'k-state-selected';
	var ARIA_DISABLED = 'aria-disabled';
	var READONLY = 'readonly';
	var ARROW_DOWN = "k-i-arrow-60-down", ARROW_UP = "k-i-arrow-60-up";
	var BACKGROUNDCOLOR = 'background-color';
	var proxy = $.proxy;
	var Color = kendo.Color;

	function buttonHtml(direction, text) {
		var className = 'k-i-arrow-' + (direction === 'increase' ? '60-up' : '60-down');
		return '<span unselectable="on" class="k-link k-link-' + direction + '" aria-label="' + text + '" title="' + text + '">' + '<span unselectable="on" class="k-icon ' + className + '"></span>' + '</span>';
	}

	// ColorPicker 내 Palltte 커스텀
	var ColorPalette = kendo.ui.ColorPalette;
	var CustomedColorPalette = ColorPalette.extend({
		options: {
			name: 'CustomedColorPickerPalette',
			opacity: false
		},
		init: function (element, options) {
			var that = this;
			// that.options.opacity = true;
			ColorPalette.fn.init.call(that, element, options);
		},
		_template: kendo.template('<table class="k-palette k-reset testttest" role="presentation"><tr role="row">' + '# for (var i = 0; i < colors.length; ++i) { #' + '# var selected = colors[i].equals(value); #' + '# if (i && i % columns == 0) { # </tr><tr role="row"> # } #' + '<td role="gridcell test" unselectable="on" style="background-color:#= colors[i].toCssRgba() #"' + '#= selected ? " aria-selected=true" : "" # ' + '#=(id && i === 0) ? "id=\\""+id+"\\" " : "" # ' + 'class="k-item#= selected ? " ' + ITEMSELECTEDCLASS + '" : "" #" ' + 'aria-label="#= colors[i].toCssRgba() #"></td>' + '# } #' + '</tr></table>')
	});
	kendo.ui.plugin(CustomedColorPalette);

	// ColorPicker 내 FlatColorPicker 커스텀
	var FlatColorPicker = kendo.ui.FlatColorPicker;
	var CustomFlatColorPicker = FlatColorPicker.extend({
		options: {
			name: 'CustomFlatColorPicker'
		},
		init: function (element, options) {
			var that = this;
			FlatColorPicker.fn.init.call(that, element, options);
		},
		_updateUI: function (color, dontChangeInput) {
			var that = this, rect = that._hsvRect;
			if (!color) {
				return;
			}
			this._colorAsText.removeClass('k-state-error');
			that._selectedColor.css(BACKGROUNDCOLOR, color.toDisplay());
			if (!dontChangeInput) {
				// that._colorAsText.val(that._opacitySlider ? color.toCssRgba() : color.toCss());
				that._colorAsText.val(color.toCss());
			}
			that._triggerSelect(color);
			color = color.toHSV();
			that._hsvHandle.css({
				left: color.s * rect.width() + 'px',
				top: (1 - color.v) * rect.height() + 'px'
			});
			that._hueElements.css(BACKGROUNDCOLOR, Color.fromHSV(color.h, 1, 1, 1).toCss());
			that._hueSlider.value(color.h);
			if (that._opacitySlider) {
				that._opacitySlider.value(100 * color.a);
			}
		}
	});
	kendo.ui.plugin(CustomFlatColorPicker);

	// ColorPicker 내 Opacity NumericBox 커스텀
	var numericTextBox = kendo.ui.NumericTextBox;
	var CustomNumericBox = kendo.ui.CustomNumericBox;
	var CustomColorPickerNumericBox = CustomNumericBox.extend({
		options: {
			name: 'CustomColorPickerNumericBox',
			events: [
				'spinstart',
				'spinend'
			]
		},
		init: function (element, options) {
			var that = this;
			CustomNumericBox.fn.init.call(that, element, options);

			that._spinStartValue = 100;
		},
		_editable: function (options) {
			var that = this, element = that.element, disable = options.disable, readonly = options.readonly, text = that._text.add(element), wrapper = that._inputWrapper.off(HOVEREVENTS);
			that._toggleText(true);
			that._upArrowEventHandler.unbind('press');
			that._downArrowEventHandler.unbind('press');
			element.off('keydown' + ns).off('keypress' + ns).off('paste' + ns);
			if (!readonly && !disable) {
				wrapper.addClass(DEFAULT).removeClass(STATEDISABLED).on(HOVEREVENTS, that._toggleHover);
				text.removeAttr(DISABLED).removeAttr(READONLY).attr(ARIA_DISABLED, false);
				that._upArrowEventHandler.bind('press', function (e) {
					e.preventDefault();

					if (!that._upArrow.hasClass(SELECTED)) {
						that._spinStartValue = that.value();
						that.trigger('spinstart');
					}
					that.trigger('spinstart');
					that._spin(1);
					that._upArrow.addClass(SELECTED);
				});
				that._downArrowEventHandler.bind('press', function (e) {
					e.preventDefault();

					if (!that._downArrow.hasClass(SELECTED)) {
						that._spinStartValue = that.value();
						that.trigger('spinstart');
					}
					that._spin(-1);
					that._downArrow.addClass(SELECTED);
				});
				that.element.on('keydown' + ns, proxy(that._keydown, that)).on('keypress' + ns, proxy(that._keypress, that)).on('paste' + ns, proxy(that._paste, that));
			} else {
				wrapper.addClass(disable ? STATEDISABLED : DEFAULT).removeClass(disable ? DEFAULT : STATEDISABLED);
				text.attr(DISABLED, disable).attr(READONLY, readonly).attr(ARIA_DISABLED, disable);
			}
		},
		_arrows: function () {
			var wrapper = this.wrapper;
			var that = this, arrows, _release = function (e) {
					var startSpinValue = that._spinStartValue;
					var min = that.min(), max = that.max();
					var canTrigger = true;
					var btn = e.target;
					clearTimeout(that._spinning);
					arrows.removeClass(SELECTED);
					if (btn.is(arrows.eq(0))) {
						canTrigger = (startSpinValue >= min && startSpinValue !== 100);
					} else if (btn.is(arrows.eq(1))) {
						canTrigger = (startSpinValue <= max && startSpinValue !== 0);
					}
					// console.log(startSpinValue, canTrigger);
					if (canTrigger) {
						that._spinStartValue = that.value();
						that.trigger('spinend');
					}
	            }, options = that.options, spinners = options.spinners, element = that.element;
	        arrows = element.siblings('.k-icon');
	        if (!arrows[0]) {
	            arrows = $(buttonHtml('increase', options.upArrowText) + buttonHtml('decrease', options.downArrowText)).insertAfter(element);
	            arrows.wrapAll('<span class="k-select"/>');
	        }
	        if (!spinners) {
	            arrows.parent().toggle(spinners);
	            that._inputWrapper.addClass('k-expand-padding');
	        }
	        that._upArrow = arrows.eq(0);
	        that._upArrowEventHandler = new kendo.UserEvents(that._upArrow, { release: _release });
	        that._downArrow = arrows.eq(1);
	        that._downArrowEventHandler = new kendo.UserEvents(that._downArrow, { release: _release });

			var btnDown = wrapper.find("." + ARROW_DOWN);
			if(btnDown.length > 0){
				btnDown.removeClass(ARROW_DOWN);
				btnDown.addClass("c-i-arrow-60 down");
			}

			var btnUp = wrapper.find("." + ARROW_UP);
			if(btnUp.length > 0){
				btnUp.removeClass(ARROW_UP);
				btnUp.addClass("c-i-arrow-60 up");
			}
	    },
		value : function(value){
			var self = this;

			if(typeof value !== 'undefined'){
				//				if(self.options.unit === "℉") value = self._getFahrenheit(value);
				var btnUp = self._upArrow;
				var btnDown = self._downArrow;

				self._setUpbind(btnUp, true);
				self._setDownbind(btnDown, true);

				if(value >= self.max()){
					self._setUpbind(btnUp, false);
					value = self.max();
				}else if(value <= self.min()){
					self._setDownbind(btnDown, false);
					value = self.min();
				}
				self.options.oriValue = value;

				if(!self.options.showValueWhenDisabled) {
					if(!self.options.enable){
						value = "";
					}
				}
				self._spinStartValue = value;
			}
			return numericTextBox.fn.value.call(self, value);
		},
		_setUpbind: function(view, isBind) {
			var self = this;
			self._upArrowEventHandler.unbind("press");
			if(isBind){
				view.removeClass(STATEDISABLED);
				self._upArrowEventHandler.bind("press", function(e) {
					e.preventDefault();

					if (!self._upArrow.hasClass(SELECTED)) {
						self.trigger('spinstart');
					}
					self._spin(1);
					self._upArrow.addClass(SELECTED);
				});
			}else{
				view.addClass(STATEDISABLED);
			}
		},
		_setDownbind : function(view, isBind){
			var self = this;
			self._downArrowEventHandler.unbind("press");
			if(isBind){
				view.removeClass(STATEDISABLED);
				self._downArrowEventHandler.bind("press", function(e) {
					e.preventDefault();

					if (!self._downArrow.hasClass(SELECTED)) {
						self.trigger('spinstart');
					}
					self._spin(-1);
					self._downArrow.addClass(SELECTED);
				});
			}else{
				view.addClass(STATEDISABLED);
			}
		},
		_spin: function(step, timeout) {
			var self = this;
			if(self.element.prop("disabled")){
				return;
			}
			var old = self.value();
			numericTextBox.fn._spin.call(self, step, timeout);
			var value = self.value();
			if(value === old){
				return;
			}

			var btnUp = self._upArrow;
			var btnDown = self._downArrow;

			if(value > old){
				if(value == self.max()){
					self._setUpbind(btnUp, false);
				}
				if(btnDown.hasClass(STATEDISABLED)){
					self._setDownbind(btnDown, true);
				}
			}else if(value < old){
				if(value == self.min()){
					self._setDownbind(btnDown, false);
				}
				if(btnUp.hasClass(STATEDISABLED)){
					self._setUpbind(btnUp, true);
				}
			}

			self._focusout();
			self.trigger("change");
			self.options.oriValue = value;
		}
	});
	kendo.ui.plugin(CustomColorPickerNumericBox);

	// ColorPicker Dialog 위젯
	var Popup = kendo.ui.Dialog;
	var widget = Popup.extend({
		options: {
			name: 'CommonColorPicker',
			width: 278,
			height: 380,
			title: false,
			animation: false,
			draggable: false,
			resizable: false,
			visible: false,
			modal: false,
			opacity: false,
			activeSelector: null,
			actions: [{
				text: 'Cancel',
				action: null
			},{
				text: 'Ok',
				action: null
			}],
			events: [
				'change',
				'select',
				'cancelChanged',
				'open'
			],
			palette: {
				recent: [],
				default: ['#4c8158', '#28b061', '#21a388', '#70c789', '#83cfba',
			              '#344b60', '#285681', '#4484c5', '#3599d6', '#69bbd0',
					      '#c53b2d', '#eb4e3e', '#e30613', '#ce67a7', '#80669c',
					      '#815433', '#d08653', '#e98022', '#f89f1f', '#f1c812',
					      '#000000', '#848484', '#dbdbdb', '#ffffff', null],
				transparent: ['#4c8158', '#28b061', '#21a388', '#70c789', '#83cfba',
				          '#344b60', '#285681', '#4484c5', '#3599d6', '#69bbd0',
					      '#c53b2d', '#eb4e3e', '#e30613', '#ce67a7', '#80669c',
					      '#815433', '#d08653', '#e98022', '#f89f1f', '#f1c812',
					      '#000000', '#848484', '#dbdbdb', '#ffffff', '#ffffff']
			},
			columns: {
				recent: 5,
				default: 5
			},
			content: PANEL_TEMPLATE,
			tileSize: {
				width: 35,
				height: 34
			},
			position: null,
			value: null,
			hasTransparent: false,
			_doChangeRecentPalette: false
		},
		init: function(element, options){
			var self = this;

			self._selectedColor = '#000';
			self._originColor = null;
			self._isCentered = true;
			self._isOpened = false;
			self._isClosed = true;
			self._isBindedCloseEvt = false;
			self._activeTab = null;
			self._recentPaletteColorArr = [];
			self._transparentItemInDefaultPalette = null;
			self._recentSelectedId = null;
			self._defaultSelectedId = null;
			self._opacityInputElem = null;
			self._isSpinningOnOpacityNumeric = null;

			// 이벤트 등록
			self._initActions();

			// Opacity 사용 여부에 따른 height 정의
			if (self.options.opacity) {
				self.options.height = OPACITY_COLOR_PICKER_HEIGHT;
			}

			Popup.fn.init.call(self, element, options);

			self._position = _getCalculatedCenterPos(self.wrapper);
			if (self.options.position) {
				self._position = $.extend(self._position, self.options.position);
			}

			if (self.options.palette) {
				var plt = self.options.palette;
				for (var key in plt) {
					self.options.palette[key] = plt[key];
				}
			}

			// Opacity 설정
			if (self.options.opacity) {
				self.wrapper.addClass("use-opacity");
			}

			self._hasTransparent = self.options.hasTransparent;
			if(self._hasTransparent){
				self.wrapper.addClass(CLASS_USE_TRANSPARENT_COLOR);
			}
			self._activeSelector = self.options.activeSelector;

			// DOM 생성
			self._initDOM();

			// Component 초기화
			self._initComponent();

			self._attachCustomPaletteMouseEvent();
		},
		_initDOM: function() {
			var self = this,
				wrapper = self.wrapper;

			// 템플릿 생성 및 DOM 부착
			wrapper.attr('tabindex', -1).addClass('common-color-picker');

			// x 아이콘 커스터마이징
			var closeIconHtml = "<span class='ic ic-close'><span>";
			wrapper.find('.k-dialog-action.k-dialog-close').append(closeIconHtml);

			// 버튼 숨김
			wrapper.find('.k-dialog-buttongroup').hide();
		},
		_isInit: function(){
			var elem = $('.common-color-picker');
			if (elem.length > 0){
				return true;
			}
			return false;
		},
		_setDialogHeight: function () {
			if (!this.options.opacity) return;
			var that = this, wrapper = that.wrapper;
			var activatedTabIndex = that.tab.getActivatedTabIndex();

			if (activatedTabIndex === 0) { // Default
				wrapper.css('height', 380);
			} else { // Custom
				wrapper.css('height', OPACITY_COLOR_PICKER_HEIGHT);
			}
		},
		_initComponent: function(){
			var self = this;
			self._createRecentPalette();
			self._createDefaultPalette();
			self._createCustomPicker();
			self._bindChangeEvt();
			self._createTab();

			// Palette 테이블 td 내 span 요소 삽입
			self.recentPalette.wrapper.find('.k-palette').find('td.k-item').append('<span class="selected-cell"></span>');
			self.defaultPalette.wrapper.find('.k-palette').find('td.k-item').append('<span class="selected-cell"></span>');
		},
		_createRecentPalette: function(){
			var self = this,
				I18N = window.I18N,
				wrapper = self.wrapper,
				options = self.options,
				palette = options.palette,
				tileSize = options.tileSize;
			var elemRecentPalette = wrapper.find('.common-recent-palette');
			var localStorageRecentArr = localStorage.getItem(LOCALSTORAGE_ID_RECENT_PALETTE);
			var elemTitle = wrapper.find('.content.recent').find('.title');
			var cells = null, paletteItem;

			elemTitle.text(I18N.prop('COMMON_COLOR_PICKER_RECENT_COLOR'));

			// Recent Palette 초기화
			if(palette.recent.length < 1) {//옵션 설정 하지 않은 경우 localStorage 사용
				if(localStorageRecentArr !== null) {
					palette.recent = JSON.parse(localStorageRecentArr);
				}else{
					palette.recent = [];
				}
			}
			// localStorage.removeItem(LOCALSTORAGE_ID_RECENT_PALETTE);

			// Recent palette 초기화
			self.recentPalette = elemRecentPalette.kendoCustomedColorPickerPalette({
				opacity: self.options.opacity,
				tileSize: tileSize,
				palette: palette.recent,
				columns: options.columns.recent,
				value: null
			}).data('kendoCustomedColorPickerPalette');

			cells = self.recentPalette.element.find('.k-palette').find('td.k-item[role=gridcell]');
			for (var i = 0; i < palette.recent.length; i++){
				paletteItem = palette.recent[i];
				if(paletteItem == COLOR_TRANSPARENT){
					self._convertTransparentCell(cells.eq(i));
				}
			}

			self._recentSelectedId = self.recentPalette._selectedID;
			self._recentPaletteColorArr = palette.recent;
		},
		_createDefaultPalette: function(){
			var self = this,
				wrapper = self.wrapper,
				options = self.options,
				palette = options.palette.default, paletteLength = palette.length,
				tileSize = options.tileSize,
				value = options.value;
			var elemDefaultPalette = wrapper.find('.common-default-palette');

			// 투명 지원인 경우 palette 교체
			if(self._hasTransparent){
				palette = options.palette.transparent;
				paletteLength = palette.length;
			}

			// Default Palette 초기화
			self.defaultPalette = elemDefaultPalette.kendoColorPalette({
				tileSize: tileSize,
				palette: palette,
				columns: options.columns.default,
				value: value
			}).data('kendoColorPalette');
			self._defaultSelectedId = self.defaultPalette._selectedID;

			// 투명 지원
			if(self._hasTransparent){
				self._transparentItemInDefaultPalette = self.defaultPalette.element.find('table.k-palette').find('[role=gridcell]').eq(paletteLength - 1);
				self._convertTransparentCell(self._transparentItemInDefaultPalette);
			}
		},
		_createCustomPicker: function(){
			var self = this,
				wrapper = self.wrapper,
				value = self.options.value;
			var elemCustomPicker = wrapper.find('.common-custom-picker');
			var opacity = self.options.opacity;

			// Custom color picker 초기화
			self.customPicker = elemCustomPicker.kendoCustomFlatColorPicker({
				preview: true,
				value: value,
				opacity: opacity,
				change: function(e){
					e.sender.element.find('.k-selected-color').removeClass('selected-color-transparent');
				}
			}).data('kendoCustomFlatColorPicker');

			// Opacity Input 필드 삽입
			if (opacity) {
				var opacitySlideWrapper = self.customPicker.wrapper.find('.k-widget.k-transparency-slider');
				var opacitySettingTitleText = window.I18N.prop('COMMON_OPACITY');
				var opacitySettingTitleElem = $('<div class="opacity-control-title">' + opacitySettingTitleText + '</div>');
				var opacityInputElem = $(OPACITY_INPUT_TEMPLATE);

				opacitySettingTitleElem.insertBefore(opacitySlideWrapper);
				self.customPicker.element.append(opacityInputElem);
				self._opacityInputElem = self.customPicker.element.find('.opacity-control-wrapper .k-input');
				// self._opacityInputElem.val(100);
				if (!self._opacityInputElem.data('kendoCustomColorPickerNumericBox')){
					self._opacityInputElem.kendoCustomColorPickerNumericBox({
						unit: '%',
						placeholder: '',
						format: '#',
						enable: true,
						blockKeyEvent: false,
						value: 100,
						step: 1,
						min: 0,
						max: 100
					});
				}
			}

			// 투명한 경우 표시할 아이콘 DOM 생성 및 부착
			var divSelectedColor = self.customPicker.element.find('.k-selected-color');
			var spanTransparent = $('<span class="ic ic-transparent-big"></span>');
			if(divSelectedColor.find('.ic.ic-transparent-big').length < 1){
				divSelectedColor.append(spanTransparent);
			}
		},
		_createTab: function(){
			var self = this,
				I18N = window.I18N,
				wrapper = self.wrapper,
				elemPickerTab = wrapper.find('.common-color-picker-tab');

			// Title
			elemPickerTab.find('li[tab-name=default]').text(I18N.prop('COMMON_COLOR_PICKER_DEFAULT_COLOR'));
			elemPickerTab.find('li[tab-name=custom]').text(I18N.prop('COMMON_COLOR_PICKER_CUSTOM_COLOR'));

			// Tab
			self.tab = elemPickerTab.kendoCommonTabStrip({
				isTopMenu: false,
				activate: function(e){
					var tab = e.sender;
					self._activeTab = tab.select();
					if(self._activeTab.attr('tab-name') == 'custom'){
						self.customPicker.value(self._selectedColor);
						if(self._selectedColor == COLOR_TRANSPARENT){
							self.customPicker._colorAsText.val(I18N.prop('COMMON_COLOR_PICKER_NO_FILL'));
							self.customPicker.element.find('.k-selected-color').addClass('selected-color-transparent');
						}else{
							self.customPicker.element.find('.k-selected-color').removeClass('selected-color-transparent');
						}
					}
					self._setDialogHeight();
				}
			}).data('kendoCommonTabStrip');
		},
		_refreshRecentPalette: function(color){
			var self = this, options = self.options,
				recentPalette = self.recentPalette,
				paletteItem = null,
				elemRecentPalette = recentPalette.element,
				max = self.options.columns.recent,
				recentCb = null, cells = null;
			var i;

			if(color && color != COLOR_TRANSPARENT){
				// recent Palette 배열 갱신
				if(self._recentPaletteColorArr.length == max) {
					self._recentPaletteColorArr.splice(max - 1, 1);
				}
				self._recentPaletteColorArr.unshift(color);

				// 로컬 스토리지 저장
				localStorage.setItem(LOCALSTORAGE_ID_RECENT_PALETTE, JSON.stringify(self._recentPaletteColorArr));
				self._recentPaletteColorArr = JSON.parse(localStorage.getItem(LOCALSTORAGE_ID_RECENT_PALETTE));
			}else{
				self._recentPaletteColorArr = JSON.parse(localStorage.getItem(LOCALSTORAGE_ID_RECENT_PALETTE));
				if(!self._recentPaletteColorArr){
					self._recentPaletteColorArr = [];
				}else if(!self._hasTransparent){
					for(i = 0; i < self._recentPaletteColorArr.length; i++){
						if(self._recentPaletteColorArr[i] == COLOR_TRANSPARENT){
							self._recentPaletteColorArr[i] = options.palette.default[options.palette.default.length - 1];
						}
					}
				}
			}

			// recentPalette 위젯 소멸
			elemRecentPalette.empty();
			recentPalette.destroy();

			// recentPalette 위젯 재초기화
			self.recentPalette = elemRecentPalette.kendoCustomedColorPickerPalette({
				opacity: self.options.opacity,
				tileSize: options.tileSize,
				palette: self._recentPaletteColorArr,
				columns: options.columns.recent,
				value: self._selectedColor
			}).data('kendoCustomedColorPickerPalette');

			// 투명 이미지 적용 가능한 cell로 변환
			cells = self.recentPalette.element.find('.k-palette').find('td.k-item[role=gridcell]');
			for (i = 0; i < self._recentPaletteColorArr.length; i++){
				paletteItem = self._recentPaletteColorArr[i];
				if(paletteItem == COLOR_TRANSPARENT){
					self._convertTransparentCell(cells.eq(i));
				}
			}

			recentCb = self._setRecentPaletteChangeEvt.bind(self);
			self.recentPalette.bind('change', recentCb);
			self.recentPalette.value(null);
		},
		_bindChangeEvt: function(){
			var self = this;
			var recentCb = self._setRecentPaletteChangeEvt.bind(self),
				deefaultCb = self._setDefaultPaletteChangeEvt.bind(self),
				customCb = self._setCustomPickerChangeEvt.bind(self);

			this.recentPalette.bind('change', recentCb);
			this.defaultPalette.bind('change', deefaultCb);
			this.customPicker.bind('change', customCb);

			if (self.options.opacity && self._opacityInputElem) {
				var opacityNumericWidget = self._opacityInputElem.data('kendoCustomColorPickerNumericBox');
				opacityNumericWidget.unbind('change', self._onChangeOpacityNumeric.bind(self));
				opacityNumericWidget.bind('change', self._onChangeOpacityNumeric.bind(self));

				opacityNumericWidget.bind('spinstart', function () {
					self._isSpinningOnOpacityNumeric = true;
				});
				opacityNumericWidget.bind('spinend', function () {
					self._isSpinningOnOpacityNumeric = false;
					opacityNumericWidget.trigger('change');
				});
			}
		},
		_getConvertedRGBCss: function (color) {
			var c = color;
			var parsedColor = null;

			if (!this.options.opacity) {
				return color;
			}

			if (c === '' || typeof c === 'undefined' || c === null) {
				c = null;
			}
			parsedColor = kendo.parseColor(c).toCssRgba();
			return parsedColor;
		},
		_setRecentPaletteChangeEvt: function(e){
			var self = this,
				selectedCell = $('#' + e.sender._selectedID);

			if(selectedCell.length < 0){
				selectedCell = e.sender.element.find('td[aria-selected=true]');
			}

			self._selectedColor = e.value;

			if(selectedCell.hasClass(CLASS_COMMON_COLORPICKER_CELL_TRANSPARENT)){
				self._selectedColor = COLOR_TRANSPARENT;
			}

			self.defaultPalette.value(null);
			self.customPicker.value(self._selectedColor);
			self._setOpacityNumericValue();
			if(self._isOpened){
				self.trigger('change', {value: self._getConvertedRGBCss(self._selectedColor)});
			}
		},
		_setDefaultPaletteChangeEvt: function(e){
			var self = this;

			self._transparentItemInDefaultPalette = e.sender.element.find('td[aria-selected=true]');
			self._selectedColor = e.value;

			if(self._transparentItemInDefaultPalette.hasClass(CLASS_COMMON_COLORPICKER_CELL_TRANSPARENT)){
				self._selectedColor = COLOR_TRANSPARENT;
			}
			self.customPicker.value(self._selectedColor);

			if(self._isOpened && !self._doChangeRecentPalette){
				self._refreshRecentPalette(self._selectedColor);
				self._createRecentPaletteGrid();
				self.trigger('change', {value: self._getConvertedRGBCss(self._selectedColor)});
			}
			self.recentPalette.value(null);
			self._setOpacityNumericValue();
		},
		_setCustomPickerChangeEvt: function(e){
			var self = this;

			self._selectedColor = e.value;
			self.recentPalette.value(null);
			self.defaultPalette.value(e.value);

			if(self.options.opacity){
				self._setOpacityNumericValue();
			}

			if(self._isOpened){
				self.trigger('change', {value: self._getConvertedRGBCss(self._selectedColor)});
			}
		},
		_onChangeOpacityNumeric: function(e) {
			var self = this;
			if (!self.options.opacity) return;

			if (!self._isSpinningOnOpacityNumeric) {
				self._setColorPickerValueByOpacityNumeric();
			}
		},
		// Opacity Numeric Widget에 의해 변경된 값을 Color picker 값으로 set 한다.
		_setColorPickerValueByOpacityNumeric: function () {
			if (!this.options.opacity) return;
			var self = this;
			var numericWidget = this._opacityInputElem.data('kendoCustomColorPickerNumericBox');
			var selectedColor = this.value();
			var parsedColor = kendo.parseColor(selectedColor);
			var alpha = numericWidget.value();
			var color = null;

			parsedColor.a = alpha / 100;
			color = parsedColor.toCssRgba();

			self.customPicker.value(color);
			self._refreshRecentPalette(color);
			self._createRecentPaletteGrid();
			self._setCustomPickerChangeEvt({ value: color });
		},
		// 현재 선택된 컬러 값을 Opacity Numeric 위젯에 set 한다.
		_setOpacityNumericValue: function () {
			if (!this.options.opacity) return;

			var numericWidget = this._opacityInputElem.data('kendoCustomColorPickerNumericBox');
			var selectedColor = this._selectedColor;
			var parsedColor = kendo.parseColor(selectedColor);
			var alpha = Number(parsedColor.a);

			numericWidget.value(alpha * 100);
		},
		_convertTransparentCell: function(cell){
			cell.addClass(CLASS_COMMON_COLORPICKER_CELL_TRANSPARENT)
				.css('background-color', 'transparent')
				.attr('aria-label', '#ffffff00');
		},
		_initActions: function(){
			var self = this,
				options = self.options;

			// Cancel
			options.actions[0].action = function(e) {
				self.trigger('cancelChanged');
				// self.value(self._originColor);
			};

			// Ok
			options.actions[1].action = function(e) {
				console.info(e);
				self._refreshRecentPalette(e.sender._selectedColor);
				self.trigger('select', {value: e.sender._selectedColor});
			};
		},
		_attachCustomPaletteMouseEvent: function(){
			var self = this;
			var wrapper = this.customPicker.wrapper,
				// inputColor = wrapper.find('.k-color-value'),
				hsvRect = wrapper.find('.k-hsv-rectangle'),
				sliderTrack = wrapper.find('.k-slider-track'),
				dragger = sliderTrack.find('.k-draghandle');

			//input 필드 - key up
			// inputColor.on('keyup', function(e){
			// 	var value = self._selectedColor;
			// 	self._refreshRecentPalette(value);
			// 	self._createRecentPaletteGrid();
			// 	// console.info(value);
			// 	// console.info('::KEYUP-INPUTCOLOR');
			// });

			//hsv rectangle - Mouse Up
			hsvRect.on('mouseup', function(e){
				var value = self._selectedColor;
				self._refreshRecentPalette(value);
				self._createRecentPaletteGrid();
			});
			hsvRect.on('mousedown', function(e){
				e.stopPropagation();
			});
			hsvRect.on('pointerdown', function(e){
				e.stopPropagation();
			});

			//dragger - Mouse Up
			dragger.on('mouseup', function(e){
				var value = self._selectedColor;
				self._refreshRecentPalette(value);
				self._createRecentPaletteGrid();
			});
			sliderTrack.on('mousedown', function(e){
				e.stopPropagation();
			});
			sliderTrack.on('pointerdown', function(e){
				e.stopPropagation();
			});
		},
		_attachClosePopupEvent: function(){
			var self = this;

			self._closePopupEvent = self._closePopup.bind(self);
			$(document).off('click', self._closePopupEvent);
			$(document).on('click', self._closePopupEvent);
		},
		_dettachClosePopupEvent: function(){
			var self = this;
			$(document).off('click', self._closePopupEvent);
		},
		_closePopup: function(e){
			var target = $(e.target),
				isInPopup = target.closest('.common-color-picker').length > 0,
				isInArea = null;

			if(this._activeSelector){
				isInArea = target.closest(this._activeSelector).length > 0;
			}else{
				isInArea = false;
			}

			if(this._isOpened && !isInPopup){
				if(isInArea){
					return;
				}
				// console.info('::CLOSE');
				this.close();
				// this._isBindedCloseEvt = false;
				return;
			}
			// this._isBindedCloseEvt = true;
		},
		_createRecentPaletteGrid: function(){
			var palette = this.recentPalette,
				paletteArr = this._recentPaletteColorArr,
				elemSelectedCell = palette.element.find('.selected-cell');

			if (paletteArr.length > 0) {
				if (elemSelectedCell.length > 0) {
					elemSelectedCell.remove();
				}
				palette.element.find('.k-palette').find('td.k-item').append('<span class="selected-cell"></span>');
			}
		},
		position: function(pos){
			if (!pos) {
				this._isCentered = true;
				return this._position;
			}
			// 특정 위치에 패널을 고정시켜야 할 경우 사용
			this._isCentered = false;
			this._position = $.extend(this._position, pos);
			this.wrapper.css(this._position);
		},
		value: function(color, doChangeRecentPalette){
			var self = this;

			// 인자 없는 경우 선택된 값 리턴
			if(!color || typeof color == 'undefined'){
				return self._getConvertedRGBCss(self._selectedColor);
			}

			self._doChangeRecentPalette = doChangeRecentPalette;

			// 인스턴스의 color 값 set
			self._selectedColor = color;
			self.recentPalette.trigger('change', {value: color});
			self.defaultPalette.trigger('change', {value: color});
			self.customPicker.trigger('change', {value: color});


			if(this.options.hasTransparent && color == 'transparent'){
				self.defaultPalette.element.find('.k-item').eq(self.options.palette.transparent.length - 1).addClass('k-state-selected');
			}

			self._doChangeRecentPalette = false;
		},
		isOpened: function(){
			return this._isOpened;
		},
		setOriginValue: function(color){
			this._originColor = color;
		},
		open: function(){
			var activateToTab = null;
			this._attachClosePopupEvent(); //팝업 클로즈 이벤트
			this._isOpened = true;
			this._isClosed = false;
			this._originColor = this._selectedColor;

			Popup.fn.open.call(this);

			if(this.options.hasTransparent){
				this.wrapper.addClass(CLASS_USE_TRANSPARENT_COLOR);
			}else{
				this.wrapper.removeClass(CLASS_USE_TRANSPARENT_COLOR);
			}

			this.position(this._position);
			this._refreshRecentPalette();
			this._createRecentPaletteGrid();
			this.customPicker.value(this._selectedColor);
			activateToTab = this.tab.element.find('li[tab-name=default]');
			this.tab.activateTab(activateToTab);
			this._setDialogHeight();
		},
		close: function(){
			this._isOpened = false;
			this._isClosed = true;
			// this.trigger('close', {value: this._selectedColor});
			Popup.fn.close.call(this);
			this._dettachClosePopupEvent();
		},
		destroy: function(){
			this._dettachClosePopupEvent();
			Popup.fn.destroy.call(this);
		}
	});

	kendo.ui.plugin(widget);
})(window, window.kendo.jQuery);