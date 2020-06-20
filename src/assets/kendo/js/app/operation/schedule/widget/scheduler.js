(function(window, $){
	"use strict";
	var kendo = window.kendo;
	var TOOLBARTEMPLATE = kendo.template('<div class="k-floatwrap k-header k-scheduler-toolbar grid-scheduler-toolbar"><ul class="k-reset k-header k-scheduler-views k-scheduler-navigation"><li class="k-current-view-dropdownlist"><input id="toolbar-dropdownlist-btn" data-role="dropdownlist" data-text-field="text" data-value-field="value" data-bind="disabled: dateTypeFilter.disabled, source: dateTypeFilter.options.dataSource, events: {select: dateTypeFilter.options.select}"></input></li>' + '<li class="k-state-default k-header k-nav-today" data-action="today"><button data-role="button" class="k-button" data-bind="disabled: todayButton.disabled, events: {click: todayButton.options.click}"><span data-bind="text:todayButton.text"></span></button></li>' + '</ul><ul class="k-reset k-scheduler-navigation"><li class="k-state-default k-header k-nav-prev" data-action="previous"><a role="button" class="k-link"><span class="ic ic-date-prev"></span></a></li><li class="k-state-default k-nav-current" data-action="nav-current"><a role="button" class="k-link"><span class="k-icon k-i-calendar"></span><span class="k-sm-date-format" data-bind="text: formattedShortDate" style="display:block;">2017-04-23 ~ 2017-04-29</span></a><i class="ic ic-error-calendar" style="display:none;"></i></li><li class="k-state-default k-header k-nav-next" data-action="next"><a role="button" class="k-link"><span class="ic ic-date-next"></span></a></li></ul><ul class="k-reset k-header k-scheduler-views legend"><li class="k-current-view" data-name="week"><a role="button" class="k-link">Week</a></li></ul></div>');

	var MOBILETOOLBARTEMPLATE = kendo.template('<div class="k-floatwrap k-header k-scheduler-toolbar">' + '<ul class="k-reset k-header k-scheduler-navigation">' + '<li class="k-state-default k-nav-today"><a role="button" href="\\#" class="k-link">${messages.today}</a></li>' + '</ul>' + '#if(viewsCount === 1){#' + '<a role="button" data-#=ns#name="#=view#" href="\\#" class="k-link k-scheduler-refresh">' + '<span class="k-icon k-i-reload"></span>' + '</a>' + '#}else{#' + '<ul class="k-reset k-header k-scheduler-views">' + '#for(var view in views){#' + '<li class="k-state-default k-view-#= view.toLowerCase() #" data-#=ns#name="#=view#"><a role="button" href="\\#" class="k-link">${views[view].title}</a></li>' + '#}#' + '</ul>' + '#}#' + '</div>' + '<div class="k-floatwrap k-header k-scheduler-toolbar">' + '<ul class="k-reset k-header k-scheduler-navigation">' + '<li class="k-state-default k-nav-prev"><a role="button" href="\\#" class="k-link"><span class="k-icon k-i-arrow-60-left"></span></a></li>' + '<li class="k-state-default k-nav-current">' + '<span class="k-sm-date-format" data-#=ns#bind="text: formattedShortDate"></span>' + '<span class="k-lg-date-format" data-#=ns#bind="text: formattedDate"></span>' + '</li>' + '<li class="k-state-default k-nav-next"><a role="button" href="\\#" class="k-link"><span class="k-icon k-i-arrow-60-right"></span></a></li>' + '</ul>' + '</div>');
	var CLICK = 'click', NS = '.kendoScheduler', MS_PER_DAY = kendo.date.MS_PER_DAY;

	var ui = kendo.ui;
	var Scheduler = ui.Scheduler;
	var SchedulerView = ui.SchedulerView;

	var MS_PER_MINUTE = kendo.date.MS_PER_MINUTE, setTime = kendo.date.setTime,
		outerHeight = kendo._outerHeight, outerWidth = kendo._outerWidth;

	var originalDs;

	function shiftArray(array, idx) {
		return array.slice(idx).concat(array.slice(0, idx));
	}

	function addContinuousEvent(group, range, element, isAllDay) {
		var events = group._continuousEvents;
		var lastEvent = events[events.length - 1];
		var startDate = getDate(range.start.startDate()).getTime();
		if (isAllDay && lastEvent && getDate(lastEvent.start.startDate()).getTime() == startDate) {
			var idx = events.length - 1;
			for (; idx > -1; idx--) {
				if (events[idx].isAllDay || getDate(events[idx].start.startDate()).getTime() < startDate) {
					break;
				}
			}
			events.splice(idx + 1, 0, {
				element: element,
				isAllDay: true,
				uid: element.attr(kendo.attr('uid')),
				start: range.start,
				end: range.end
			});
		} else {
			events.push({
				element: element,
				isAllDay: isAllDay,
				uid: element.attr(kendo.attr('uid')),
				start: range.start,
				end: range.end
			});
		}
	}

	function toInvariantTime(date) {
		var staticDate = new Date(1980, 1, 1, 0, 0, 0);
		if (date) {
			staticDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
		}
		return staticDate;
	}

	function adjustDST(date, hours) {
		if (hours === 0 && date.getHours() === 23) {
			date.setHours(date.getHours() + 2);
			return true;
		}
		return false;
	}

	function getDate(date) {
		date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
		adjustDST(date, 0);
		return date;
	}

	function getMilliseconds(date) {
		return date.getTime() - getDate(date);
	}

	function isInDateRange(value, min, max) {
		return value >= min && value <= max;
	}

	function getWorkDays(options) {
		var workDays = [];
		var dayIndex = options.workWeekStart;
		workDays.push(dayIndex);
		while (options.workWeekEnd != dayIndex) {
			if (dayIndex > 6) {
				dayIndex -= 7;
			} else {
				dayIndex++;
			}
			workDays.push(dayIndex);
		}
		return workDays;
	}

	var Popup = ui.Popup, Calendar = ui.Calendar;
	var widget = Scheduler.extend({
		options: {
			name : "CustomScheduler"
		},
		currentSelectedDayElem: null,
		currentSelectedDay: null,
		currentSelectedDaySchedules: [],
		listWidget: null,
		events : [
			"more"
		],
		init : function(element, options){
			var self = this;

			Scheduler.fn.init.call(this, element, options);
			element.on(CLICK + NS, '.k-scheduler-content .month-day-wrap', self._selectDayEvt.bind(self));
		},
		_toolbar: function () {
			var that = this;
			var options = that.options;
			var commands = [];
			if (options.toolbar) {
				commands = $.isArray(options.toolbar) ? options.toolbar : [options.toolbar];
			}
			var template = this._isMobilePhoneView() ? MOBILETOOLBARTEMPLATE : TOOLBARTEMPLATE;

			var I18N = window.I18N;

			var toolbar = $(template({
				messages: options.messages,
				dateTypeFilter: {value: 'all', options: { dataSource: [{text:I18N.prop("FACILITY_SCHEDULE_ALL_SCHEDULE") ,value: 'all'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_MONTH") ,value: 'month'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_WEEK") ,value: 'week'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_DAY") ,value: 'day'}], select: function(e) { that._model.dateTypeFilter.set('value', e.dataItem.value); that.trigger('selectDateType', {value: e.dataItem.value}); } }},
				pdf: $.grep(commands, function (item) {
					return item == 'pdf' || item.name == 'pdf';
				}).length > 0,
				ns: kendo.ns,
				views: that.views,
				viewsCount: that._viewsCount
			}));
			that.wrapper.append(toolbar);
			that.toolbar = toolbar;

			// 스케줄 리스트뷰/캘린더뷰 에서 사용하는 액션 모델 설정 부분.
			that._model.set('selectedText', I18N.prop("FACILITY_SCHEDULE_NO_SELECTED"));
			that._model.set('dateTypeFilter', {disabled: false, value: 'all', options: { dataSource: [{text:I18N.prop("FACILITY_SCHEDULE_ALL_SCHEDULE") ,value: 'all'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_MONTH") ,value: 'month'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_WEEK") ,value: 'week'}, {text:I18N.prop("FACILITY_SCHEDULE_BY_DAY") ,value: 'day'}], select: function(e) { that._model.dateTypeFilter.set('value', e.dataItem.value); that.trigger('selectDateType', {value: e.dataItem.value}); } }});
			that._model.set('todayButton', {text: I18N.prop("FACILITY_SCHEDULE_TODAY"), disabled: true, options: {click: function () {var date = new Date(); that.date(date); that.trigger("selectDateType"); }} } );

			kendo.bind(that.toolbar, that._model);

			toolbar.on(CLICK + NS, '.k-pdf', function (e) {
				e.preventDefault();
				that.saveAsPDF();
			});
			toolbar.on(CLICK + NS, '.k-scheduler-navigation li', function (e) {
				var li = $(this);
				var date = new Date(that.date());
				var action = '';
				e.preventDefault();
				if (li.hasClass('k-state-disabled')) {
					return;
				}
				if (li.hasClass('k-nav-today')) {
					action = 'today';
					date = new Date();
				} else if (li.hasClass('k-nav-next')) {
					action = 'next';
					date = that.view().nextDate();
				} else if (li.hasClass('k-nav-prev')) {
					action = 'previous';
					date = that.view().previousDate();
				} else if (li.hasClass('k-nav-current') && !that._isMobilePhoneView()) {
					that._showCalendar();
					return;
				}
				if (!that.trigger('navigate', {
					view: that._selectedViewName,
					action: action,
					date: date
				})) {
					that.date(date);
				}
			});
			toolbar.on(CLICK + NS, '.k-scheduler-views li, .k-scheduler-refresh', function (e) {
				e.preventDefault();
				var name = $(this).attr(kendo.attr('name'));
				if (!that.trigger('navigate', {
					view: name,
					action: 'changeView',
					date: that.date()
				})) {
					that.view(name);
					that.element.find('.k-state-expanded').removeClass('k-state-expanded');
				}
			});
			toolbar.on(CLICK + NS, '.k-scheduler-views li.k-current-view', function () {
				that.element.find('.k-scheduler-views').toggleClass('k-state-expanded');
			});
			toolbar.find('li').hover(function () {
				$(this).addClass('k-state-hover');
			}, function () {
				$(this).removeClass('k-state-hover');
			});
		},
		_selectView: function (name) {
			var that = this;
			if (name && that.views[name]) {
				if (that._selectedView) {
					that._unbindView(that._selectedView);
				}
				that._selectedView = that._renderView(name);
				that._selectedViewName = name;
			}
		},
		_bindView: function (view) {
			Scheduler.fn._bindView.call(this, view);
			view.bind('more', this._viewMoreHandler.bind(this));
		},
		_viewMoreHandler : function(e){
			this.trigger("more", e);
		},
		rebind: function () {
			this.dataSource.fetch();
			if(this.currentSelectedDay !== null) {
				var date = moment(this.currentSelectedDay).format("YYYY-MM-DD");
				var targetElem = this.element.find('div[data-date="' + date + '"].month-day-wrap')[0];

				if(targetElem) {
					targetElem.parentElement.classList.add('selected-day');
					this.currentSelectedDayElem = targetElem;
				}
				this.trigger("change");
			}
		},
		_selectDayEvt : function(e) {
			var self = this;
			var target = e.currentTarget;
			var targetParent = target.parentElement;
			var date = new Date($(target).data('date'));

			// 이전 선택 day 해제
			if(self.currentSelectedDayElem !== null)
			   self.currentSelectedDayElem.parentElement.classList.remove('selected-day');

			targetParent.classList.add('selected-day');
			self.currentSelectedDay = date;
			self.currentSelectedDayElem = target;

			// 선택 스케줄 재설정.
			self.currentSelectedDaySchedules = [];
			self.dataSource.data().forEach(function(item) {
				if(date >= item.start && date <= item.end) self.currentSelectedDaySchedules.push(item);
			});
			self.trigger("change");
		},
		_showCalendarAtListView: function () {
			var target = $("#schedule-scheduler-grid .k-nav-current");
			var that = this, html = $('<div class="k-calendar-container at-list-view"><div class="k-scheduler-calendar"/></div>');

			if (!that.popupAtLisView) {
				that.popupAtLisView = new Popup(html, {
					anchor: target,
					open: function () {
						if (!that.calendarAtListView) {
							that.calendarAtListView = new Calendar(this.element.find('.k-scheduler-calendar'), {
								change: function () {
									var date = this.value();
									if (!that.trigger('navigate', {
										view: that._selectedViewName,
										action: 'changeDate',
										date: date
									})) {
										that.date(date);
										that.trigger('selectDateType', {value: that._model.dateTypeFilter.get('value')});
										that.popupAtLisView.close();
									}
								},
								min: that.options.min,
								max: that.options.max
							});
						}
						that.calendarAtListView.value(that.date());
					},
					copyAnchorStyles: false
				});
			}
			that.popupAtLisView.open();
		}
	});

	function getOccurrenceByUid(data, uid) {
		var length = data.length, idx = 0, event;
		for (; idx < length; idx++) {
			event = data[idx];
			if (event.uid === uid) {
				return event;
			}
		}
	}

	 //jQuery를 통해 요소에서 호출할 수 있도록 플러그인 등록
	kendo.ui.plugin(widget);

	var moment = window.moment;
	var TreeList = kendo.ui.TreeList;
	var proxy = $.proxy;
	var EXPAND = 'expand';
	var COLLAPSE = 'collapse';
	var classNames = {
		wrapper: 'k-treelist k-grid k-widget',
		header: 'k-header',
		button: 'k-button',
		alt: 'k-alt',
		editCell: 'k-edit-cell',
		group: 'k-treelist-group',
		gridToolbar: 'k-grid-toolbar',
		gridHeader: 'k-grid-header',
		gridHeaderWrap: 'k-grid-header-wrap',
		gridContent: 'k-grid-content',
		gridContentWrap: 'k-grid-content',
		gridFilter: 'k-grid-filter',
		footerTemplate: 'k-footer-template',
		loading: 'k-i-loading',
		refresh: 'k-i-reload',
		retry: 'k-request-retry',
		selected: 'k-state-selected',
		status: 'k-status',
		link: 'k-link',
		withIcon: 'k-with-icon',
		filterable: 'k-filterable',
		icon: 'k-icon',
		iconFilter: 'k-i-filter',
		iconCollapse: 'k-i-collapse',
		iconExpand: 'k-i-expand',
		iconHidden: 'k-i-none',
		iconPlaceHolder: 'k-icon k-i-none',
		input: 'k-input',
		dropPositions: 'k-i-insert-up k-i-insert-down k-i-plus k-i-insert-middle',
		dropTop: 'k-i-insert-up',
		dropBottom: 'k-i-insert-down',
		dropAdd: 'k-i-plus',
		dropMiddle: 'k-i-insert-middle',
		dropDenied: 'k-i-cancel',
		dragStatus: 'k-drag-status',
		dragClue: 'k-drag-clue',
		dragClueText: 'k-clue-text'
	};

	var SchedulerTreeList = TreeList.extend({
		options: {
			name : "SchedulerTreeList"
		},
		expandedFolderIds: [],
		originFolders: [],
		checkedFolderNames: [],
		emptyFolders:[],
		init : function(element, options){
			var self = this;
			options.dataSource = this.createScheduleDs(options.dataSource);
			self.originFolders = options.folderData;
			TreeList.fn.init.call(this, element, options);

			// self.bind("dataBound", self._dataBoundEvt.bind(self));
		},
		setDataSource : function(dataSource, isSetDate){
			if(!isSetDate){
				dataSource = this.createScheduleDs(dataSource);
			}
			TreeList.fn.setDataSource.call(this, dataSource);
		},
		createScheduleDs : function(dataSource){
			if(!(dataSource instanceof kendo.data.DataSource)){
				dataSource = new kendo.data.DataSource({
					data : dataSource
				});
				dataSource.read();
			}
			this.originalDs = dataSource;
			this.originalDs.bind("change", this._changeOriginalDsEvt.bind(this));
			return dataSource;
		},
		_changeOriginalDsEvt : function(e){
			// console.log(e);
			//add 미지원
			var gridItem, item, i, j, length, max;
			// var id;                    //[13-04-2018]안쓰는 코드 주석 -jw.lim
			var gridDs, gridData;
			if(e.action == "remove"){
				if(e.items){
					max = e.items.length;
					gridDs = this.dataSource;
					// var targetData;            //[13-04-2018]안쓰는 코드 주석 -jw.lim
					gridData = gridDs.data();

					for( i = 0; i < max; i++ ){
						item = e.items[i];
						length = gridData.length;
						for( j = length - 1; j >= 0; j--){
							gridItem = gridData[j];
							if(item.id == gridItem.originalid){
								gridData.splice(j, 1);
							}
						}
					}

					gridDs.fetch();
				}
			}else if(e.action == "itemchange"){
				if(e.items && e.field){
					var field = e.field;
					max = e.items.length;
					gridDs = this.dataSource;
					gridData = gridDs.data();
					length = gridData.length;
					for( i = 0; i < max; i++ ){
						item = e.items[i];
						for( j = 0; j < length; j++){
							gridItem = gridData[j];
							if(item.id == gridItem.originalid){
								gridItem[field] = item[field];
							}
						}
					}
					gridDs.fetch();
				}
			}
		},
		setDate : function(queryStartDate, queryEndDate){
			var self = this;
			var dataSource = this.originalDs;
			var data = dataSource.data();
			var startDate, endDate, i, max = data.length;
			var daySize;
			var isStartBetween = false;
			var isEndBetween = false;
			queryStartDate = moment(queryStartDate);
			queryEndDate = moment(queryEndDate);

			var schedule, start, mStart, scheduleData, scheduleDataArr = [];

			// var ds = new kendo.data.DataSource({
			// 	data : []
			// });

			// 시작일과 종료일이 정해지지 않은 경우, 전체 스케줄
			if(queryStartDate === null && queryEndDate === null) {
				for( i = 0; i < max; i++ ) {
					schedule = $.extend(true, {}, data[i]);
					scheduleDataArr.push(schedule);
				}
			} else {
				for( i = 0; i < max; i++ ){
					startDate = data[i].startDate;
					endDate = data[i].endDate;
					startDate = moment(startDate);
					endDate = moment(endDate);
					isStartBetween = startDate.isBetween(queryStartDate, queryEndDate, null, '[]');
					isEndBetween = endDate.isBetween(queryStartDate, queryEndDate, null, '[]');
					schedule = $.extend(true, {}, data[i]);
					// console.log(schedule.name);
					if(isStartBetween && isEndBetween){
						//start date / end date 전부
						daySize = endDate.diff(startDate, 'days');
						start = startDate.date();
						console.info("query start date ~ query end date");
						console.info(start);
						console.info(daySize);

					}else if(isStartBetween && !isEndBetween){
						//start date 부터 query end date
						daySize = queryEndDate.diff(startDate, 'days');
						start = startDate.date();
						console.info("query start date ~schedule end date");
						console.info(start);
						console.info(daySize);

					}else if(!isStartBetween && isEndBetween){
						//query start date 부터 end date
						daySize = endDate.diff(queryStartDate, 'days');
						start = queryStartDate.date();
						console.info("schedule start date ~ queryend date");
						console.info(start);
						console.info(daySize);
					}else{
						isStartBetween = queryStartDate.isBetween(startDate, endDate, null, '[]');
						isEndBetween = queryEndDate.isBetween(startDate, endDate, null, '[]');
						if(isStartBetween && isEndBetween){
							daySize = queryEndDate.diff(queryStartDate, 'days');
							start = queryStartDate.date();
						}else{
							continue;
						}
					}
					schedule.originalid = schedule.id;
					scheduleDataArr.push(schedule);
				}
			}

			// empty folder (스케줄이 없는 폴더) 의 더미 스케줄 아이템 추가
			this._addEmptyFolders(scheduleDataArr);

			var ds = new kendo.data.DataSource({
				data : scheduleDataArr,
				group: {
					field: "folder.groupName",
					dir: "desc"
				}
			});
			ds.fetch();

			this.setDataSource(ds, true);

			// 폴더에 속하지 않는 스케줄 업데이트 날짜 순으로 정렬 하기 위한 정렬 수행
			this.dataSource.sort({
				field:'updated',
				dir: 'desc',
				compare: function(a, b, descending) {
					var a_value, b_value;
					var treelist = $("#schedule-scheduler-grid").data("kendoSchedulerTreeList");
					if(!treelist) return 0;

					a_value = a.field == "folder.groupName" && typeof a.value != 'undefined' ? treelist.dataSource.data().find(function(item) { return item.folder && item.folder.updated && item.folder.groupName == a.value; }).folder.updated : a.updated;
					b_value = b.field == "folder.groupName" && typeof b.value != 'undefined' ? treelist.dataSource.data().find(function(item) { return item.folder && item.folder.updated && item.folder.groupName == b.value; }).folder.updated : b.updated;
					// 폴더 노드들과 스케줄 파일 노드들을 상하로 분리하기 위한 부분.
					if(typeof a_value == "undefined" || typeof b_value == "undefined") {
						if(!(typeof a_value == "undefined" && typeof b_value == "undefined")) {
							if(descending) return typeof a_value != "undefined" ? 1 : -1;
							return typeof a_value != "undefined" ? -1 : 1;
						}
						return 0;
					}

					a_value = moment(a_value.date);
					b_value = moment(b_value.date);

					if(b_value > a_value) {
						return -1;
					} else if (b_value == a_value) {
						return 0;
					}
					return 1;
				}
			});

			this.dataSource.fetch();

			var that = this;
			var checkedItems = that.getCheckedData(), chItem = null;
			var maxCh = checkedItems.length;
			var targetIds = [];
			for(i = 0; i < maxCh; i++){
				chItem = checkedItems[i];
				targetIds.push(chItem.id);
			}

			that.checkByIds(targetIds,true);
			that._checkFolderByNames(that.checkedFolderNames);
		},
		updateExpandedFolderId: function(folderId, isCollapsed) {
			// 기존 배열에 존재하지 않았다면, 추가.
			this._setExpandedFolderIds(folderId, isCollapsed);
			this._render();
		},
		_setExpandedFolderIds: function(folderId, isCollapsed) {
			var expandedFolderIds = this.expandedFolderIds;
			var isEmptyFolder = this._isEmptyFolder(folderId);

			if(isEmptyFolder) {
				// 비어있는 폴더의 경우, 무조건 expandedFolderIds 에서 제거, collapsed 처리
				this.expandedFolderIds = expandedFolderIds.filter(function(expandedFolderId){
					return expandedFolderId != folderId;
				});
				return;
			}
			if(!isCollapsed) {
				if(expandedFolderIds.indexOf(folderId + "") == -1)  {
					this.expandedFolderIds.push(folderId);
				}
			} else if(expandedFolderIds.indexOf(folderId + "") != -1) {
				this.expandedFolderIds = expandedFolderIds.filter(function(expandedFolderId){
					return expandedFolderId != folderId;
				});
			}
		},
		_isEmptyFolder: function(folderId) {
			var originFolders = this.originFolders;
			var emptyFolders = [];
			var emptyFolderIds = null;

			emptyFolders = originFolders.filter(function(item) {
				return item.schedules_ids.length == 0;
			});
			emptyFolderIds = emptyFolders.map(function(folder) { return folder.id + ""; });

			if(emptyFolderIds === null) emptyFolderIds = [];
			return emptyFolderIds.indexOf(folderId + "") != -1 ? true : false;
		},
		_checkFolderByNames: function(names) {
			var self = this;
			var ds = self.dataSource;
			ds.data().forEach(function(item) {
				if(item.field === 'folder.groupName' && names.indexOf(item.value) != -1) {
					item.checked = true;
				}
			});
			ds.fetch();
		},
		_addEmptyFolders: function(scheduleDataArr) {
			var self = this;
			var emptyFolders;
			var originFolders = self.originFolders;

			emptyFolders = originFolders.filter(function(item) {
				return item.schedules_ids.length == 0;
			});

			emptyFolders.forEach(function(item) {
				var createDummyScheduleItem = function() {
					var dummyScheduleItem = {
						'name': 'dumy',
						'isDummyScheduleItem': true,
						'folder': item
					};
					return dummyScheduleItem;
				};

				scheduleDataArr.push(createDummyScheduleItem());
				this._setExpandedFolderIds(item.id, true);
			}.bind(this));
		},
		getCurrentDisplayFolderItem: function() {
			var res = [], self = this;

			self.dataSource.view().forEach(function(item) {
				if(item.field == "folder.groupName" && typeof item.value != 'undefined') {
					var folderItem = self.createFolderItemDataFromTreeListModel(item);
					res.push(folderItem);
				}
			});

			return res;
		},
		createFolderItemDataFromTreeListModel: function(model) {
			var separators = {
				name: ':name:',
				id: ':id:'
			};
			var folderItem = {
				name: null,
				id: null
			};
			var folderGroupName = model.value + "";

			if(typeof model.value === 'undefined') return folderItem;
			Object.keys(separators).forEach(function(key){
				var separator = separators[key];
				var index = folderGroupName.indexOf(separator);
				folderItem[key] = folderGroupName.slice(index + separators[key].length);
				folderGroupName = folderGroupName.replace(separators[key] + folderItem[key], '');
			});
			return folderItem;
		},
		//Scheduler 전용으로 Customizing
		_checkItemFromCheckbox : function(e){
			var checkboxElem = e.checkbox;
			if(checkboxElem === null)return;
			var checked = checkboxElem.prop("checked");
			var data;
			var origDs = this.originalDs;
			var origItem;

			if(e.item === null){
				data = this.dataSource.data();
			}else if(typeof e.item.data === 'undefined'){
				data = [e.item];
			}else{
				data = e.item.data;
			}

			var originalid;
			for(var i = 0; i < data.length; i++){
				originalid = data[i].originalid;
				if(typeof  originalid === 'undefined')continue;
				origItem = origDs.get(originalid);
				origItem.checked = checked;
			}
		},
		getCheckedFolder: function() {
			var self = this;
			var res = [];
			var checkedFolders = self.dataSource.data().filter(function(item) {
				return item.hasChildren && item.checked;
			});
			var separators = {
				name: ':name:',
				id: ':id:'
			};
			checkedFolders.forEach(function(folder){
				var folderItem = {
					name: null,
					id: null
				};
				if (folder.value) {
					var folderGroupName = folder.value + "";
					Object.keys(separators).forEach(function(key){
						var separator = separators[key];
						var index = folderGroupName.indexOf(separator);
						folderItem[key] = folderGroupName.slice(index + separators[key].length);
						folderGroupName = folderGroupName.replace(separators[key] + folderItem[key], '');
					});
					res.push(folderItem);
				}
			});
			return res;
		},
		getOriginalDsCheckedData : function(){
			var ds = this.originalDs;
			var data = ds.data();
			var checkedData = new kendo.data.Query(data).filter({
				logic : 'and',
				filters : [{ field : "checked", operator : "eq", value : true}]
			}).toArray();

			return checkedData;
		},
		_toggleChildren: function (e) {
			var icon = $(e.currentTarget);
			var options = this.options;
			var model = this.dataItem(icon);
			var event = !model.expanded ? EXPAND : COLLAPSE;
			if (!this.trigger(event, { model: model })) {
				//console.log(this._currentExpandedModel);
				var lastLevel = options.onceExpandParentLevel ? options.onceExpandParentLevel : this.lastParentLevel;
				if(options.isGroupListMode && model.level >= lastLevel){
					var currentExpandedModel = this._currentExpandedModel;
					var level = model.level;
					if(currentExpandedModel[level] && currentExpandedModel[level] !== model){
						var i, parent, ds = this.dataSource;
						// currentExpandedModel[level].expanded = false;
						currentExpandedModel[level] = model;
						parent = model;
						for( i = level - 1; i >= 0; i-- ){
							parent = ds.parentNode(parent);
							if(currentExpandedModel[i] !== parent){
								// currentExpandedModel[i].expanded = false;
								currentExpandedModel[i] = parent;
							}
						}
					}
				}
				this._toggle(model);
			}
			e.preventDefault();
		},
		_trs: function (options) {
			var model, attr, className, hasChildren, childNodes, i, j, size, count, length, hasCheckedChild;
			var rows = [];
			var widgetOptions = this.options;
			var hasSelectedModel = widgetOptions.hasSelectedModel;
			var hasCheckedModel = widgetOptions.hasCheckedModel;
			var isGroupListMode = widgetOptions.isGroupListMode;
			var currentExpandedModel = this._currentExpandedModel, expandedModel,
				lastParentLevel = widgetOptions.onceExpandParentLevel ? widgetOptions.onceExpandParentLevel : this.lastParentLevel, level = options.level;
			var data = options.data;
			var dataSource = this.dataSource, dv = dataSource.flatView(), index;
			var aggregates = dataSource.aggregates() || {};
			var columns = options.columns;
			var field, modelAggregates;
			for (i = 0, length = data.length; i < length; i++) {
				className = [];
				model = data[i];
				childNodes = model.loaded() && dataSource.childNodes(model);
				hasChildren = childNodes && childNodes.length;
				attr = { 'role': 'row' };
				attr[kendo.attr('uid')] = model.uid;
				if(model.id) attr['data-id'] = model.id;
				if(typeof model.level !== "undefined" && model.level !== null){
					attr['data-level'] = model.level;
				}

				//자식 노드들의 첫번째와 마지막을 체크
				if(model.parent_id){
					var parentModel = this.dataSource.get(model.parent_id);
					className.push("child");
					if(typeof parentModel.value == "undefined") className.push("none-folder");
					if(i == 0) className.push("children-first-item");
					if(i == length - 1) className.push("children-last-item");
				}

				if (hasChildren) {
					dataSource.data().forEach(function(item) {
						if(model.id == item.parent_id && item.isDummyScheduleItem)
							className.push("empty-folder");
					});

					attr['aria-expanded'] = !!model.expanded;
					if(model.field) attr['data-field'] = model.field;
					if(model.value) {
						attr['data-value'] = model.value;
					} else {
						attr['data-value'] = 'none-folder';
					}
					hasCheckedChild = model.hasCheckedChild;
					if((hasCheckedModel || hasSelectedModel) && hasCheckedChild) className.push("has-checked-child");
					modelAggregates = model.aggregates;
					field = model.field;
					if(modelAggregates && modelAggregates[field] && modelAggregates[field].count){
						//실제 View에 표시되는 자식 노드 사이즈 계산
						index = dv.indexOf(model);
						size = dv.length;
						count = 0;
						if(index !== -1){
							for( j = index + 1; j < size; j++ ){
								if(!dv[j].hasChildren) count++;
								else if(dv[j].level == model.level) break;
							}
						}
						modelAggregates[field].count = count;
					}
				}
				if (options.visible) {
					if (this._absoluteIndex % 2 !== 0) {
						className.push(classNames.alt);
					}
					this._absoluteIndex++;
				} else {
					attr.style = { display: 'none' };
				}

				if(hasSelectedModel){
					if(model.selected) className.push("k-state-selected");
				}else if(hasCheckedModel){
					if(model.checked) className.push("k-state-checked");
				}else if ($.inArray(model.uid, options.selected) >= 0) {
					className.push(classNames.selected);
				}

				if (hasChildren) {
					className.push(classNames.group);
				}
				if (model._edit) {
					className.push('k-grid-edit-row');
				}
				attr.className = className.join(' ');
				rows.push(this._tds({
					model: model,
					attr: attr,
					level: level
				}, columns, proxy(this._td, this)));

				if (hasChildren) {
					if(currentExpandedModel) expandedModel = currentExpandedModel[model.level];
					// 폴더가 열려있는 아에팀만 row 추가 (이후에 dom 성능 이슈 문제 방지)
					if (model.expanded) {
						rows = rows.concat(this._trs({
							columns: columns,
							aggregates: aggregates,
							selected: options.selected,
							visible: options.visible && !!model.expanded,
							data: childNodes,
							level: level + 1
						}));
					}
				}
			}
			if (this._hasFooterTemplate()) {
				attr = {
					className: classNames.footerTemplate,
					'data-parentId': model.parentId
				};
				if (!options.visible) {
					attr.style = { display: 'none' };
				}
				rows.push(this._tds({
					model: aggregates[model.parentId],
					attr: attr,
					level: level
				}, columns, this._footerTd));
			}
			return rows;
		},
		_render: function (options) {
			options = options || {};
			var messages = this.options.messages;
			var hasSelectedModel = this.options.hasSelectedModel;
			var hasCheckedModel = this.options.hasCheckedModel;
			var data = this.dataSource.rootNodes();
			var uidAttr = kendo.attr('uid');

			var expandedFolderIds = this.expandedFolderIds;
			// 스케줄 트리 리스트 에서 열려있는 폴더 (rootNodes) 설정 하기 위한 부분.
			data.forEach(function(item) {
				var folderData = this.createFolderItemDataFromTreeListModel(item);
				// 폴더가 없는 그룹의 경우,
				if(folderData.id === null) {
					item.expanded = true;
				} else if(expandedFolderIds.indexOf(folderData.id + '') != -1) {
					item.expanded = true;
				} else {
					item.expanded = false;
				}
			}.bind(this));

			var selected;
			if(!hasSelectedModel && !hasCheckedModel){
				selected = this.select().removeClass('k-state-selected').map(function (_, row) {
					return $(row).attr(uidAttr);
				});
			}else{
				selected = [];
			}

			this._absoluteIndex = 0;
			this._angularItems('cleanup');
			this._angularFooters('cleanup');
			this._flushCache();
			if (options.error) {
				this._showStatus(kendo.template('#: messages.requestFailed # ' + '<button class=\'#= buttonClass #\'>#: messages.retry #</button>')({
					buttonClass: [
						classNames.button,
						classNames.retry
					].join(' '),
					messages: messages
				}));
			} else if (!data.length) {
				this._showStatus(kendo.htmlEncode(messages.noRows));
			} else {
				this._hideStatus();
				this._contentTree.render(this._trs({
					columns: this._nonLockedColumns(),
					aggregates: options.aggregates,
					selected: selected,
					data: data,
					visible: true,
					level: 0
				}));
				if (this._hasLockedColumns) {
					this._absoluteIndex = 0;
					this._lockedContentTree.render(this._trs({
						columns: this._lockedColumns(),
						aggregates: options.aggregates,
						selected: selected,
						data: data,
						visible: true,
						level: 0
					}));
				}
			}
			if (this._touchScroller) {
				this._touchScroller.contentResized();
			}
			this._muteAngularRebind(function () {
				this._angularItems('compile');
				this._angularFooters('compile');
			});

			if(!hasSelectedModel && !hasCheckedModel){
				this.items().filter(function () {
					return $.inArray($(this).attr(uidAttr), selected) >= 0;
				}).addClass('k-state-selected');
			}

			this._adjustRowsHeight();
		},
		setSubGroupCheckbox : function(item, isOnlyData){
			var ds = this.dataSource;
			var checkedState, isChecked, hasCheckedChild, checkbox, tr, parent, id = item.id, parentId = item.parent_id;
			checkedState = this.isCheckedAllGroup(item);
			isChecked = checkedState.isCheckedAll;
			hasCheckedChild = checkedState.hasCheckedChild;

			item.checked = isChecked;
			if(!isOnlyData){
				checkbox = this.getGroupCheckbox(id);
				checkbox.prop("checked", isChecked);
				tr = checkbox.closest("tr");
				if(hasCheckedChild) tr.addClass("has-checked-child");
				else tr.removeClass("has-checked-child");
			}

			if(parentId){
				parent = ds.get(parentId);
				this.setSubGroupCheckbox(parent, isOnlyData);
			}
		},
		_attachCheckedModelEvt : function(){
			var that = this;
			var elem = $(this.element);
			elem.off("click");

			// 트리 리스트 폴더가 아닌 아이템 클릭 이벤트 핸들링
			elem.on("click", "tr:not(.k-treelist-group) .grid-checkbox-cell .k-checkbox", function(e){
				var self = $(this);
				var trElem = self.closest('tr');
				var item = that._findItemFromCheckbox(self);
				var checked = self.prop("checked");
				var checkedLimit = that.options.checkedLimit;
				//최대 체크 가능한 값을 넘을 경우 체크되지 않도록한다.
				if(checkedLimit !== false && checkedLimit != 0 && checked){
					var checkedData = that.getCheckedData();
					if(checkedData.length >= checkedLimit){
						return false;
					}
				}

				item.checked = checked;
				trElem.toggleClass('k-state-checked');
				// var parent;
				// if(item && item.parent_id){
				// 	parent = that.dataSource.get(item.parent_id);
				// 	that.setGroupCheckbox(parent);
				// }
				// that.setHeaderCheckbox();

				that.trigger("checked", { isHeader : false, item : item, checkbox : self });
			});

			// 트리 리스트 전체 체크 박스 선택/해제
			elem.on("click", ".grid-checkbox-header .k-checkbox", function(e){
				var self = $(this);
				var checked = self.prop("checked");
				var checkedLimit = that.options.checkedLimit;

				//최대 체크 가능한 값을 넘을 경우 체크되지 않도록한다.
				if(checkedLimit !== false && checkedLimit != 0 && checked){
					var checkedData = that.getCheckedData();
					if(checkedData.length >= checkedLimit){
						return false;
					}
				}

				that.trigger("dataBinding");
				if(checked){
					that.checkAll(true);
					var checkedFolderNames = [];
					that.dataSource.data().forEach(function(item) {
						if(item.field === 'folder.groupName' && checkedFolderNames.indexOf(item.value) === -1) {
							checkedFolderNames.push(item.value);
						}
					});
					that.checkedFolderNames = checkedFolderNames;

				}else{
					that.uncheckAll();
					that.checkedFolderNames = [];
				}
				that.trigger("checked", { isHeader : true, item : null, checkbox : self });
			});

			// 트리 리스트 folder 체크 박스 클릭 이벤트 핸들링
			elem.on("click", "tr.k-treelist-group .grid-checkbox-cell .k-checkbox", function(e){
				var self = $(this);
				var item = that._findItemFromCheckbox(self);
				var checked = self.prop("checked");

				// folder icon label elem 클릭시, 체크 박스 동작이 아닌, expand 동작 되도록 분기 처리 (폴더 아이콘: 가상선택자 클릭시, 이벤트 트리거된 위치 통해 분기 처리)
				if(e.offsetX > 434) {
					var folderItemData = that.createFolderItemDataFromTreeListModel(item);
					var isCollapsed = !item.expanded;
					self.prop("checked", !checked); // 체크박스 변경 이전 상태로 업데이트.
					that.updateExpandedFolderId(folderItemData.id, !isCollapsed);
					return;
				}

				item.checked = checked;
				that.trigger("dataBinding");

				// 체크된 폴더 이름 배열에 저장.
				var idx = that.checkedFolderNames.indexOf(item.value);
				if(checked) {
					if(idx === -1 ) that.checkedFolderNames.push(item.value);
				} else if(idx !== -1) that.checkedFolderNames.splice(idx, 1);


				that.dataSource.fetch();
				var evt = { isGroupHeader : true, item : {data: [item]}, checkbox : self, checked : checked };
				that.trigger("dataBound", evt);
				that.trigger("checked", evt);
			});

			this.bind("dataBound", function(e){
				this.setHeaderCheckbox();
			});
		},
		checkByIds : function(idList, isChecked, maxLength, isView){
			var that = this;
			var ds = that.dataSource;
			//var dv = ds.flatView();
			var dv = ds.data();
			if(isView){
				if(ds.pageSize()){
					var query = new kendo.data.Query(ds.data());
					var filter = ds.filter();
					if(filter) query = query.filter(filter);
					var sort = ds.sort();
					if(sort) query = query.sort(sort);
					dv = query.toArray();
					//console.log(dv.length);
				}else{
					dv = ds.flatView();
				}
			}
			var options = that.options;
			var checkedLimit = options.checkedLimit;
			if(checkedLimit !== false && checkedLimit != 0){
				maxLength = checkedLimit;
			}

			var lastLevelChildren = new kendo.data.Query(dv).filter({ field : "hasChildren", operator : "eq", value : false }).toArray();
			var child, lastLevelSize = lastLevelChildren.length;

			var checkedData = new kendo.data.Query(lastLevelChildren).filter({ field : "checked", operator : "eq", value : true}).toArray();
			if(checkedData.length && maxLength) maxLength -= checkedData.length;

			maxLength = (maxLength >= lastLevelSize) ? lastLevelSize : maxLength;
			var i, max = maxLength ? maxLength : lastLevelSize;
			var j, idListSize = idList.length;
			var parentIds = [];
			for( i = 0; i < max; i++ ){
				child = lastLevelChildren[i];
				for(j = 0; j < idListSize; j++){
					if(child.id == idList[j]){
						child.checked = isChecked;
						if(parentIds.indexOf(child.parent_id) == -1) parentIds.push(child.parent_id);
					}
				}
			}
			// max = parentIds.length;
			// var parentId, parent;
			// for( i = 0; i < max; i++ ){
			// 	parentId = parentIds[i];
			// 	parent = ds.get(parentId);
			// 	if(parent) this.setSubGroupCheckbox(parent, true);
			// }
			ds.fetch();
		},
		filterForSearch : function(obj){
			var filter = obj;
			this.searchFilter = filter;
			/*var appliedFilter = this.dataSource.filter();
			if(appliedFilter){
				if(!filter.logic){
					filter = { logic : "and", filters : [filter]};
				}
				if($.isArray(appliedFilter)){
					filter = appliedFilter.push(filter);
				}else if($.isArray(appliedFilter.filters)){
					filter = [appliedFilter, filter];
				}
			}*/
			this.isSearching = true;
			this.dataSource.filter(filter);
			this.isSearching = false;
			this.searchFilter = null;
		}
	});

	kendo.ui.plugin(SchedulerTreeList);

	/*Scheduler Grid*/

	// var kendo = window.kendo;			//[13-04-2018]중복된 코드 주석 -jw.lim
	var Grid = kendo.ui.Grid;
	var moment = window.moment;
	// var Util = window.Util;				//[13-04-2018]중복된 코드 주석 -jw.lim

	var SchedulerGrid = Grid.extend({
		options: {
			name : "SchedulerGrid"
		},
		init : function(element, options){
			options.dataSource = this.createScheduleDs(options.dataSource);
			Grid.fn.init.call(this, element, options);
		},
		setDataSource : function(dataSource, isSetDate){
			if(!isSetDate){
				dataSource = this.createScheduleDs(dataSource);
			}
			Grid.fn.setDataSource.call(this, dataSource);
		},
		createScheduleDs : function(dataSource){
			if(!(dataSource instanceof kendo.data.DataSource)){
				dataSource = new kendo.data.DataSource({
					data : dataSource
				});
				dataSource.read();
			}
			this.originalDs = dataSource;
			this.originalDs.bind("change", this._changeOriginalDsEvt.bind(this));
			return dataSource;
		},
		_changeOriginalDsEvt : function(e){
			// console.log(e);
			//add 미지원
			var gridItem, item, i, j, length, max;
			// var id;					//[13-04-2018]안쓰는 코드 주석 -jw.lim
			var gridDs, gridData;
			if(e.action == "remove"){
				if(e.items){
					max = e.items.length;
					gridDs = this.dataSource;
					// var targetData;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
					gridData = gridDs.data();

					for( i = 0; i < max; i++ ){
						item = e.items[i];
						length = gridData.length;
						for( j = length - 1; j >= 0; j--){
							gridItem = gridData[j];
							if(item.id == gridItem.id){
								gridData.splice(j, 1);
							}
						}
					}

					gridDs.fetch();
				}
			}else if(e.action == "itemchange"){
				if(e.items && e.field){
					var field = e.field;
					max = e.items.length;
					gridDs = this.dataSource;
					gridData = gridDs.data();
					length = gridData.length;
					for( i = 0; i < max; i++ ){
						item = e.items[i];
						for( j = 0; j < length; j++){
							gridItem = gridData[j];
							if(item.id == gridItem.id){
								gridItem[field] = item[field];
							}
						}
					}
					gridDs.fetch();
				}
			}
		},
		setDate : function(queryStartDate, queryEndDate, newDataSource){
			var dataSource = this.originalDs;
			var data;
			var startDate, endDate, i, max;
			var j, daySize;
			var isStartBetween = false;
			var isEndBetween = false;
			queryStartDate = moment(queryStartDate);
			queryEndDate = moment(queryEndDate);

			var schedule, start, mStart, daysSchedule;
			// var end, mEnd;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
			var ds = new kendo.data.DataSource({
				data : []
			});
			if (!newDataSource) {
				data = dataSource.data();
			} else {
				data = newDataSource.view();
			}
			max = data.length;

			//var newDatas = [];
			for( i = 0; i < max; i++ ){
				startDate = data[i].startDate;
				endDate = data[i].endDate;
				startDate = moment(startDate);
				endDate = moment(endDate);
				isStartBetween = startDate.isBetween(queryStartDate, queryEndDate, null, '[]');
				isEndBetween = endDate.isBetween(queryStartDate, queryEndDate, null, '[]');
				schedule = data[i];
				// console.log(schedule.name);
				if(isStartBetween && isEndBetween){
					//start date / end date 전부
					daySize = endDate.diff(startDate, 'days');
					start = startDate.date();
					console.info("query start date ~ query end date");
					console.info(start);
					console.info(daySize);

				}else if(isStartBetween && !isEndBetween){
					//start date 부터 query end date
					daySize = queryEndDate.diff(startDate, 'days');
					start = startDate.date();
					console.info("query start date ~schedule end date");
					console.info(start);
					console.info(daySize);

				}else if(!isStartBetween && isEndBetween){
					//query start date 부터 end date
					daySize = endDate.diff(queryStartDate, 'days');
					start = queryStartDate.date();
					console.info("schedule start date ~ queryend date");
					console.info(start);
					console.info(daySize);
				}else{
					isStartBetween = queryStartDate.isBetween(startDate, endDate, null, '[]');
					isEndBetween = queryEndDate.isBetween(startDate, endDate, null, '[]');
					if(isStartBetween && isEndBetween){
						daySize = queryEndDate.diff(queryStartDate, 'days');
						start = queryStartDate.date();
					}else{
						continue;
					}
				}

				mStart = moment(queryStartDate);
				mStart.date(j);
				// console.log(mStart.date());
				daysSchedule = $.extend(true, {}, schedule);
				ds.add(daysSchedule);
			}
			//console.info(newDatas);

			//ds.read();
			// console.info(ds.data());

			this.setDataSource(ds, true);

			// 폴더에 속하지 않는 스케줄 업데이트 날짜 순으로 정렬 하기 위한 정렬 수행
			this.dataSource.sort({
				field:'updated',
				dir: 'desc',
				compare: function(a, b, descending) {
					var a_value, b_value;
					var grid = $("#schedule-scheduler-grid").data("kendoSchedulerGrid");
					if(!grid) return 0;

					a_value = a.field == "name" && typeof a.value != 'undefined' ? grid.dataSource.data().find(function(item) { return item.folder && item.folder.updated && item.name == a.value; }).folder.updated : a.updated;
					b_value = b.field == "name" && typeof b.value != 'undefined' ? grid.dataSource.data().find(function(item) { return item.folder && item.folder.updated && item.name == b.value; }).folder.updated : b.updated;

					if(typeof a_value == "undefined" || typeof b_value == "undefined") {
						if(descending) return typeof a_value != "undefined" ? 1 : 0;
						return typeof a_value != "undefined" ? -1 : 0;
					}

					a_value = moment(a_value.date);
					b_value = moment(b_value.date);

					if(b_value > a_value) {
						return -1;
					} else if (b_value == a_value) {
						return 0;
					}
					return 1;
				}
			});
		},
		_attachCheckedModelEvt : function(){
			var that = this;
			var elem = $(this.element);
			elem.on("click", "tr .grid-checkbox-cell .k-checkbox", function(e){
				var self = $(this);
				var item = that._checkItemFromCheckbox(self);
				that.setGroupCheckbox();
				that.setHeaderCheckbox();
				that.dataSource.fetch();

				that.trigger("checked", { isHeader : false, item : item, checkbox : self });
			});

			elem.on("click", ".grid-checkbox-cell .k-radio, .grid-checkbox-cell .k-radio-label", function(e){
				var self = $(this);
				var item = that._findItemFromCheckbox(self);
				var checked = self.prop("checked");
				item.checked = checked;
				that.setRadioBtn(item);
				that.trigger("checked", { isHeader : false, isRadio : true, item : item, checkbox : self });
			});

			elem.on("click", ".grid-checkbox-header .k-checkbox", function(e){
				var self = $(this);
				var checked = self.prop("checked");
				that.trigger("dataBinding");
				if(checked){
					that.checkAll(true, null, true);
				}else{
					that.uncheckAll(null, true);
				}
				that._setOrigDs();
				// that.trigger("dataBound");
				that.trigger("checked", { isHeader : true, item : null, checkbox : self });
			});


			elem.on("click", ".grid-group-row .grid-group-row-checkbox", function(evt){			//[13-04-2018]중복된 변수 변환 : e -> evt -jw.lim
				var self = $(this);
				var checked = self.prop("checked");
				var field = self.data("field");
				var value = self.data("value");
				var results;
				//var dv = ds.view();
				//var i, max = dv.length;
				that.trigger("dataBinding");
				if(checked){
					results = that.checkGroup(true, field, value, true);
				}else{
					results = that.checkGroup(true, field, value, false);
				}

				that.setHeaderCheckbox();
				var e = { isGroupHeader : true, field : field, value : value, item : results, checkbox : self, checked : checked };
				that.trigger("dataBound", e);
				that.trigger("checked", e);
			});

			this.bind("dataBound", function(e){
				this.setHeaderCheckbox();
				this.setGroupCheckbox();
				this.syncExpandedGroupRow();
				this._checkedRow(e);
			});
		},
		_setOrigDs: function() {
			var data = this.dataSource.data();
			var i, item, id, checked, origItem, max = data.length;
			var origDs = this.originalDs;

			for (i = 0; i < max; i++) {
				item = data[i];
				id = item.id;
				checked = item.checked;
				origItem = origDs.get(id);
				origItem.checked = checked;
			}
		},
		_checkedRow: function(e) {
			var self = this;
			var data = self.dataSource.data();
			var i, item, el, checkedList = [], max = data.length;
			for (i = 0; i < max; i++) {
				item = data[i];
				if (item.checked) checkedList.push(item.id);
			}
			checkedList.forEach(function(checkId) {
				el = self.element.find('tr[data-id=' + checkId + ']');
				el.toggleClass('k-state-checked');
			});
			// tr.toggleClass('k-state-checked');
		},
		//Scheduler 전용으로 Customizing
		_checkItemFromCheckbox : function(checkboxElem){
			var checked = checkboxElem.prop("checked");

			var ds = this.dataSource;
			var tr = checkboxElem.closest("tr");
			var uid = tr.data("uid");
			var item = ds.getByUid(uid);
			var id = item.id;

			//Checked View
			var data, datas = ds.data();
			var i, max = datas.length;
			for( i = 0; i < max; i++ ){
				data = datas[i];
				if(id == data.id){
					data.checked = checked;
				}
			}

			var origDs = this.originalDs;
			var origItem = origDs.get(id);
			origItem.checked = checked;

			return origItem;
		},
		filterForSearch : function(value, cols){
			var grid = this;
			var regexValue = value.replace(/[^\w\s]/gi, function(match){
				return '\\' + match;
			});
			var regex = new RegExp('(' + regexValue + ')+',"g");
			var colIndexList = [];
			cols.forEach(function(col) {
				colIndexList.push({ index: grid.thead.find("th[data-field='" + col + "']").index(), category: col });
			});
			grid.tbody.find('tr[data-uid]').each(function(e){
				var td, item, text, deviceCompare, device, that = this;
				colIndexList.forEach(function(colItem) {
					td = $(that).find('td:eq(' + colItem.index + ')');
					item = grid.dataItem(that);
					text = td.text();
					for (var index = 0, max = item.devices.length; index < max; index++) {
						device = item.devices[index];
						if (device.dms_devices_name.indexOf(value) !== -1 || device.dms_devices_id.indexOf(value) !== -1) {
							deviceCompare = true;
							break;
						}
					}
					if (colItem.category === 'devices' && deviceCompare && value !== '') td.html('<div class="grid-cell-two-line-ellipsis">' + '<span style="color:#0081c6">' + text + '</span>' + '</div>');
					else if (item[colItem.category]) td.html('<div class="grid-cell-two-line-ellipsis">' + text.replace(regex, '<span style="color:#0081c6">' + value + '</span>') + '</div>');
				});
			});
		}
	});

	kendo.ui.plugin(SchedulerGrid);

})(window, jQuery);

//For Debug
//# sourceURL=operation-scheduler.js
