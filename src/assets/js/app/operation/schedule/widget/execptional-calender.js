/**
 *
 *   <ul>
 *       <li>캘린더 팝업 내에서 날짜를 선택하여 입력 칸에 반영할 수 있다.</li>
 *       <li>Kendo UI의 Calendar 위젯을 상속받아 커스터마이징</li>
 *   </ul>
 *   @module app/widget/common-calender
 *   @requires app/main
 */
(function($){
	var kendo = window.kendo, support = kendo.support, ui = kendo.ui, Widget = ui.Widget, keys = kendo.keys, parse = kendo.parseDate, adjustDST = kendo.date.adjustDST, weekInYear = kendo.date.weekInYear, extractFormat = kendo._extractFormat, template = kendo.template, getCulture = kendo.getCulture, transitions = kendo.support.transitions, transitionOrigin = transitions ? transitions.css + 'transform-origin' : '', cellTemplate = template('<td#=data.cssClass# role="gridcell"><a tabindex="-1" class="k-link" href="\\#" data-#=data.ns#value="#=data.dateString#">#=data.value#</a></td>', { useWithBlock: false }), emptyCellTemplate = template('<td role="gridcell">&nbsp;</td>', { useWithBlock: false }), weekNumberTemplate = template('<td class="k-alt">#= data.weekNumber #</td>', { useWithBlock: false }), browser = kendo.support.browser, isIE8 = browser.msie && browser.version < 9, outerHeight = kendo._outerHeight, outerWidth = kendo._outerWidth, ns = '.kendoCalendar', CLICK = 'click' + ns, KEYDOWN_NS = 'keydown' + ns, ID = 'id', MIN = 'min', LEFT = 'left', SLIDE = 'slideIn', MONTH = 'month', CENTURY = 'century', CHANGE = 'change', NAVIGATE = 'navigate', VALUE = 'value', HOVER = 'k-state-hover', DISABLED = 'k-state-disabled', FOCUSED = 'k-state-focused', OTHERMONTH = 'k-other-month', OTHERMONTHCLASS = ' class="' + OTHERMONTH + '"', TODAY = 'k-nav-today', CELLSELECTOR = 'td:has(.k-link)', BLUR = 'blur' + ns, FOCUS = 'focus', FOCUS_WITH_NS = FOCUS + ns, MOUSEENTER = support.touch ? 'touchstart' : 'mouseenter', MOUSEENTER_WITH_NS = support.touch ? 'touchstart' + ns : 'mouseenter' + ns, MOUSELEAVE = support.touch ? 'touchend' + ns + ' touchmove' + ns : 'mouseleave' + ns, MS_PER_MINUTE = 60000, MS_PER_DAY = 86400000, PREVARROW = '_prevArrow', NEXTARROW = '_nextArrow', ARIA_DISABLED = 'aria-disabled', ARIA_SELECTED = 'aria-selected', proxy = $.proxy, extend = $.extend, DATE = Date, views = {
		month: 0,
		year: 1,
		decade: 2,
		century: 3
	};
	var MAX_YEAR = 2099;
	var moment = window.moment;

	var uiCalendar = ui.Calendar;

	function restrictValue(value, min, max) {
		var today = getToday();
		if (value) {
			today = new DATE(+value);
		}
		if (min > today) {
			today = new DATE(+min);
		} else if (max < today) {
			today = new DATE(+max);
		}
		return today;
	}
	function getToday() {
		var today = new DATE();
		return new DATE(today.getFullYear(), today.getMonth(), today.getDate());
	}
	function isEqualDate(oldValue, newValue) {
		if (oldValue instanceof Date && newValue instanceof Date) {
			oldValue = oldValue.getTime();
			newValue = newValue.getTime();
		}
		return oldValue === newValue;
	}

	var execptionalCalender = uiCalendar.extend({
		options: {
			name: "ExecptionalCalender"
		},
		init: function(element, options){
			var that = this;
			uiCalendar.fn.init.call(that, element, options);
		},
		_header: function () {
			var that = this, element = that.element, links;
			if (!element.find('.k-header')[0]) {
				element.html('<div class="k-header">' + '<a href="#" role="button" class="k-link k-nav-prev"><span class="k-icon k-i-arrow-60-left"></span></a>' + '<a href="#" role="button" aria-live="assertive" aria-atomic="true" class="k-link k-nav-fast"></a>' + '<a href="#" role="button" class="k-link k-nav-next"><span class="k-icon k-i-arrow-60-right"></span></a>' + '</div>');
			}
			links = element.find('.k-link');
			that._title = links.eq(1);
			that[PREVARROW] = links.eq(0);
			that[NEXTARROW] = links.eq(2);
		},
		_click: function (link) {
			var that = this, options = that.options, currentValue = new Date(+that._current), value = that._toDateObject(link);
			adjustDST(value, 0);
			if (that._view.name == 'month' && that.options.disableDates(value)) {
				value = that._value;
			}
			if (moment(currentValue).format('M') === moment(value).format('M')) that._view.setDate(currentValue, value);
			that.navigateDown(restrictValue(currentValue, options.min, options.max));
		},
		navigateDown: function (value) {
			var that = this, index = that._index, depth = that.options.depth;
			if (!value) {
				return;
			}
			if (index === views[depth]) {
				if (!isEqualDate(that._value, that._current) || !isEqualDate(that._value, value)) {
					that.value(value);
					that.trigger(CHANGE);
				}

			}
			// that.navigate(value, --index);
		},
		_footer: function () {
		},
		_move: function () {
		},
		_toDateObject: function (link) {
			var value = $(link).attr(kendo.attr(VALUE)).split('/');
			value = new DATE(value[0], value[1], value[2]);
			return value;
		}
	});
	ui.plugin(execptionalCalender);

	var TEMPLATE;

	var execptionalCalenderList = Widget.extend({
		options: {
			name: "ExecptionalCalenderList"
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
			// var I18N = window.I18N;
			var that = this;
			Widget.fn.init.call(that, element, options);

			this.wrapper = this.element;
			this.data = [];
			this.dataSource = [];
			this.calenderList = [];
			this.selectedDate = null;
			this.execptionalDate = [];
			this.mapDate = {};

			this._initMapDate();
			this._parseDataSource();
			this._initDOM();
			this._initComponent();
			this._attchEvent();
			this._todayCalender();
		},
		_initMapDate: function() {
			var mapDate = this.mapDate;
			var yearIndex, monthIndex, dayIndex, currentMonthDayCount;
			for(yearIndex = 2019; yearIndex <= 2099; yearIndex++) {
				mapDate[yearIndex] = {};
				for(monthIndex = 1; monthIndex <= 12; monthIndex++){
					mapDate[yearIndex][monthIndex] = {};
					currentMonthDayCount = moment(yearIndex + "-" + monthIndex, "YYYY-M").daysInMonth();
					for(dayIndex = 1; dayIndex <= currentMonthDayCount; dayIndex++) {
						mapDate[yearIndex][monthIndex][dayIndex] = { execptional: false, selected: false };
					}
				}
			}
		},
		_parseDataSource: function(){
			console.log('execptional-calender: _parseDataSource');
			var startM, endM, item, countRepeatYear;
			if (!this.data.data) return;
			var data = this.data.data();
			this.execptionalDate = [];
			for(var i = 0, max = data.length; i < max; i++) {
				item = data[i];
				startM = moment(item.startDate);
				endM = moment(item.endDate);
				if (item.repeatYear) {
					countRepeatYear = MAX_YEAR - startM.format('YYYY');
					var index = 0;
					while (index < countRepeatYear) {
						this._parseMapDate(startM, endM);
						startM.add(1, 'year');
						endM.add(1, 'year');
						index++;
					}
				} else {
					this._parseMapDate(startM, endM);
				}
			}
		},
		_parseMapDate: function(startM, endM, type) {
			var countDay, date;
			var filterType = type === 'selected' ? 'selected' : 'execptional';
			var yearMonthDay = null;
			countDay = endM.diff(startM, 'days') + 1;
			for (var j = 0; j < countDay; j++) {
				date = moment(startM).add(j, 'days').format('YYYY/M/D');
				yearMonthDay = date.split('/');
				this.mapDate[yearMonthDay[0]][yearMonthDay[1]][yearMonthDay[2]][filterType] = true;
			}
		},
		_uniqArray: function(array){
			return array.reduce(function(a,b){if(a.indexOf(b) < 0)a.push(b); return a;},[]);
		},
		_setRepeatYearDate: function() {

		},
		_initDOM: function(){
			console.log('execptional-calender: _initDOM');
			var I18N = window.I18N;
			// var options = this.options, cssOpts = {};
			TEMPLATE = "<div class='calender-slider-wrapper'>" +
					"<div class='calender-contents first'><div class='calender'></div></div>" +
					"<div class='calender-contents second'><div class='calender'></div></div>" +
					"<div class='calender-contents third'><div class='calender'></div></div>" +
				"</div>" +
				"<a class='ic arr-prev'></a>" +
				"<a class='ic arr-next'></a>" +
				"<a role='button' class='btn-today k-button'>" + I18N.prop('FACILITY_SCHEDULE_TODAY') + "</a>" +
			"</div>";
			this.element.append($(TEMPLATE));
			this.wrapper.addClass('execptional-calender-list');
		},
		_initComponent: function(){
			console.log('execptional-calender: _initComponent');
			this._initCalender();
		},
		_initCalender: function(){
			var that = this;
			var divCalenderContents = this.wrapper.find('.calender-contents'),
				elList = [],
				optsObj = {
					month: {
						content: $('#execptional-calender-cell-template').html()
					},
					change: function() {
						that.selectedDate = this.value();
						that._onChangeDate();
					}
				};

			kendo.culture().calendar.firstDay = 0;

			for(var i = 0; i < divCalenderContents.length; i++) {
				elList.push($(divCalenderContents[i]).find('.calender'));
				elList[i].empty();
				this.calenderList.push(elList[i].kendoExecptionalCalender(optsObj).data('kendoExecptionalCalender'));
				for (var j = 0; j < i; j++) {
					this.calenderList[i].navigateToFuture();
				}
				this._setExecptionalDate(this.calenderList[i]);
			}
		},
		_setExecptionalDate: function(calenderList, type){
			var item, execptionalDate, filterExecptionalDate;
			var addClassName = type === 'selected' ? 'selected' : 'execptional';
			filterExecptionalDate = this._setFilterCurrentDate(type);
			for (var i = 0, max = filterExecptionalDate.length; i < max; i++) {
				execptionalDate = kendo.toString(new Date(moment(filterExecptionalDate[i])), "D");
				item = calenderList.element.find('td:not(.k-other-month) [title="' + execptionalDate + '"]');
				if (item[0]) {
					item.parent().addClass(addClassName);
				}
			}
		},
		_setFilterCurrentDate: function(type){
			var calenderList = this.calenderList;
			var filterType = type === 'selected' ? 'selected' : 'execptional';
			var currentDateList = [];
			var fristCurrentDate = calenderList[0].current();
			var currentMonthDayCount, yearIndex, monthIndex, dayIndex, calendarDate;
			var mapDate = this.mapDate;
			for(var i = 0, max = 3; i < max; i++) {
				calendarDate = moment(fristCurrentDate).add(i, 'month');
				yearIndex = calendarDate.format('YYYY');
				monthIndex = calendarDate.format('M');
				currentMonthDayCount = moment(calendarDate).daysInMonth();
				for(dayIndex = 1; dayIndex <= currentMonthDayCount; dayIndex++) {
					if (mapDate[yearIndex][monthIndex][dayIndex][filterType]) currentDateList.push(yearIndex + '-' + monthIndex + '-' + dayIndex);
				}
			}
			return currentDateList;
		},
		_onChangeDate: function(){
			var current, selectDate;
			for (var i = 0, max = this.calenderList.length; i < max; i++) {
				current = moment(this.calenderList[i].current()).format('M');
				selectDate = moment(this.selectedDate).format('M');
				if (current !== selectDate) this.calenderList[i].value(null);
			}
		},
		_attchEvent: function(){
			var that = this,
				wrapper = that.wrapper,
				btnPrev = wrapper.find('.arr-prev'),
				btnNext = wrapper.find('.arr-next'),
				btnToday = wrapper.find('.btn-today');
			btnPrev.on('click', that._prevCalender.bind(that));
			btnNext.on('click', that._nextCalender.bind(that));
			btnToday.on('click', that._todayCalender.bind(that));
		},
		_removeTodayExcludingCurrentMonths: function() {
			var calenderList = this.calenderList;
			var todayMonth = moment().format('M');
			var wrapper;
			for(var i = 0, max = calenderList.length; i < max; i++) {
				if (todayMonth === moment(calenderList[i].current()).format('M')) continue;
				wrapper = calenderList[i].wrapper;
				wrapper.find('.k-today').removeClass('k-today');
			}
		},
		_calenderNavigateTo: function(type){
			var calenderList = this.calenderList;
			for(var i = 0, max = calenderList.length; i < max; i++) {
				for (var j = 0; j < 3; j++) {
					if (type === 'prev') this.calenderList[i].navigateToPast();
					else this.calenderList[i].navigateToFuture();
				}
			}
			this._setCalenderExecptionDate();
			this._setCalenderSelectedExecptionDate();
			this._removeTodayExcludingCurrentMonths();
		},
		_setCalenderExecptionDate: function(){
			var calenderList = this.calenderList;
			for(var i = 0, max = calenderList.length; i < max; i++) {
				this._setExecptionalDate(this.calenderList[i]);
				this.calenderList[i].value(null);
			}
		},
		_prevCalender: function(){
			this._calenderNavigateTo('prev');
		},
		_nextCalender: function(){
			this._calenderNavigateTo('next');
		},
		_todayCalender: function(){
			var calenderList = this.calenderList;
			var dateCountNum = 0;
			var date = new Date(moment().subtract(1, 'months'));
			var currentDate = moment(this.calenderList[0].current()).format('YYYY-M');
			if (currentDate === moment(date).format('YYYY-M')) return;
			for(var i = 0, max = calenderList.length; i < max; i++) {
				this.calenderList[i].value(new Date(moment(date).add(dateCountNum, 'months')));
				this.calenderList[i].value(null);
				this._setExecptionalDate(this.calenderList[i]);
				this.setSelectedData(this.data, true);
				dateCountNum++;
			}
			this._removeTodayExcludingCurrentMonths();
		},
		_resetExecptional: function(){
			var execptional = this.wrapper.find('.execptional');
			for(var i = 0, max = execptional.length; i < max; i++){
				$(execptional[i]).removeClass('execptional');
			}
		},
		_parseSelectedData: function(data){
			var item, startM, endM, countRepeatYear;
			var that = this;
			var parserData = data.filter(function(val) { return val.checked; });
			for(var i = 0, max = parserData.length; i < max; i++) {
				item = parserData[i];
				startM = moment(item.startDate);
				endM = moment(item.endDate);
				if (item.repeatYear) {
					countRepeatYear = MAX_YEAR - startM.format('YYYY');
					var index = 0;
					while (index < countRepeatYear) {
						that._parseMapDate(startM, endM, 'selected');
						startM.add(1, 'year');
						endM.add(1, 'year');
						index++;
					}
				} else {
					that._parseMapDate(startM, endM, 'selected');
				}
			}
		},
		_resetSelectedMapDate: function() {
			var mapDate = this.mapDate;
			var yearIndex, monthIndex, dayIndex, currentMonthDayCount;
			for(yearIndex = 2019; yearIndex <= 2099; yearIndex++) {
				for(monthIndex = 1; monthIndex <= 12; monthIndex++){
					currentMonthDayCount = moment(yearIndex + "-" + monthIndex, "YYYY-M").daysInMonth();
					for(dayIndex = 1; dayIndex <= currentMonthDayCount; dayIndex++) {
						mapDate[yearIndex][monthIndex][dayIndex].selected = false;
					}
				}
			}
		},
		_resetMapDate: function() {
			var mapDate = this.mapDate;
			var yearIndex, monthIndex, dayIndex, currentMonthDayCount, item;
			for(yearIndex = 2019; yearIndex <= 2099; yearIndex++) {
				for(monthIndex = 1; monthIndex <= 12; monthIndex++){
					currentMonthDayCount = moment(yearIndex + "-" + monthIndex, "YYYY-M").daysInMonth();
					for(dayIndex = 1; dayIndex <= currentMonthDayCount; dayIndex++) {
						item = mapDate[yearIndex][monthIndex][dayIndex];
						item.selected = false;
						item.execptional = false;
					}
				}
			}
		},
		resetSelectedExecptional: function(redraw){
			var execptional = this.wrapper.find('.selected');
			for(var i = 0, max = execptional.length; i < max; i++){
				$(execptional[i]).removeClass('selected');
			}
			if (!redraw) this._resetSelectedMapDate();
		},
		_setCalenderSelectedExecptionDate: function(){
			var calenderList = this.calenderList;
			for(var i = 0, max = calenderList.length; i < max; i++) {
				this._setExecptionalDate(this.calenderList[i], 'selected');
				this.calenderList[i].value(null);
			}
		},
		setDataSource: function(data){
			if(!data){
				data = [];
			}
			this.data = data;
			this._resetExecptional();
			this._resetMapDate();
			this._parseDataSource();
			this._setCalenderExecptionDate();
		},
		setSelectedData: function(data, redraw){
			if(!data){
				data = [];
			}
			this.resetSelectedExecptional(redraw);
			if (!redraw) this._parseSelectedData(data);
			this._setCalenderSelectedExecptionDate();
		}
	});

	ui.plugin(execptionalCalenderList);
})(jQuery);
//# sourceURL=schedule/widget/execptional-calender.js