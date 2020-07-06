/**
 *
 *   <ul>
 *       <li>캘린더 팝업 내에서 날짜를 선택하여 입력 칸에 반영할 수 있다.</li>
 *       <li>Kendo UI의 Calendar 위젯을 상속받아 커스터마이징</li>
 *   </ul>
 *   @module app/widget/device-selecter
 *   @requires app/main
 */
(function(window, $){
	var kendo = window.kendo, ui = kendo.ui, Widget = ui.Widget;
	var Util = window.Util;

	var TEMPLATE = "<div class='grid-style-dropdownlist-container'>" +
				"<div class='ddl-box' data-bind='visible: isVisible'>" +
					"<input id='grid-style-dropdownlist' class='ddl-component' data-role='dropdownlist' data-auto-bind='false'" +
					"'data-value-primitive='true' data-text-field='text' data-value-field='value' style='width: 100%;' " +
					"data-bind='source: dataSource, events: { change: onChange }' ></input >" +
				"</div>" +
				"<div class='device-item-wrap' data-bind='invisible: isVisible'>" +
					"<div class='device-item-header'>" +
						"<div class='detail-text'>" +
							"<span class='name' data-bind='text: text'></span>" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</div>";

	var GridStyleDropDownList = Widget.extend({
		options: {
			name: "GridStyleDropDownList",
			dataSource: []
		},
		/**
		 *
		 *   위젯을 초기화하며 캘린더 팝업 및 내부 버튼 UI요소를 생성한다. - 최초 1번 실행
		 *
		 *   @function init
		 *	 @param {HTMLElement} element - 엘리먼트.
		 *	 @param {Object} options - 캘린더 위젯 초기 옵션 객체.
		 *   @returns {void} - 리턴 값 없음.
		 *   @alias module:common-calender
		 *
		 */
		init: function(element, options){
			var that = this;
			options = $.extend({}, that.options, options);
			Widget.fn.init.call(that, element, options);
			that.dataSource = options.dataSource;
			that.viewModel = null;
			that.isVisible = options.isVisible || false;
			that._initDOM();
			that._parseDataSource();
			// that._initComponent();
			// that._attchEvent();
		},
		_parseDataSource: function(){
			this.setDataSource(this.dataSource);
		},
		_initDOM: function(){
			this.element.html(TEMPLATE);
			this.element.addClass('grid-style-dropdownlist');
			this._initBinding();
		},
		_initBinding: function(){
			var that = this;
			var elem = that.element.find('.grid-style-dropdownlist-container');
			that.viewModel = kendo.observable({
				text: '',
				isVisible: that.isVisible,
				dataSource: [],
				filter: { field: "selected", operator: "eq", value: false },
				onChange: function(e) {
					var dataSource = e.sender.dataSource;
					var data = dataSource.data();
					var selectedIndex = e.sender.selectedIndex;
					that.resetSelected(data);
					if (selectedIndex >= 0) dataSource.view()[selectedIndex].set('selected', true);
					dataSource.filter({ field: "selected", operator: "eq", value: false });
					that.trigger('onChange', { event : e });
				}
			});
			kendo.bind(elem, that.viewModel);
		},
		resetSelected: function(data) {
			for(var i = 0, max = data.length; i < max; i++) {
				data[i].selected = false;
			}
		},
		setDataSource: function(dataSource) {
			var that = this;
			if (!dataSource) that.dataSource = [];
			if (dataSource.total || dataSource.length) {
				if (dataSource.total() > 1) {
					that.viewModel.set('dataSource', dataSource.data());
					that.viewModel.set('isVisible', true);
				} else {
					that.viewModel.set('isVisible', false);
					if (dataSource.at(0)) that.viewModel.set('text', dataSource.at(0).text);
				}
			}
		}
	});

	ui.plugin(GridStyleDropDownList);
})(window, jQuery);
//# sourceURL=GridStyle-DropDownList.js
