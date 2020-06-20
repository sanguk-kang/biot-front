var fnSortList = function(field, reverse, primer){
	var key = primer ? 
    	function(x) {return primer(x[field])} : 
       	function(x) {return x[field]};

   	reverse = !reverse ? 1 : -1;

   	return function (a, b) {
       	return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
	} 
};
$(document).ready(function(){
	// JS 파일 로딩
	
	var main = $('#main');
	//main.empty();
	var setHeader = function(){
		var mainHeader = $('#main-header');
		//var mainHeader = $('<header>', {'id':'main-header'}).appendTo(main);
		var nav = $('<nav>',{'class': 'main-top-nav'}).appendTo(mainHeader);
		
		var span1 = $('<span>',{'class':'main-top-nav-text'}).html("Gangnam-gu, Seoul").appendTo(nav);
		var span2 = $('<span>',{'class': 'main-top-nav-weather sunny'}).html("3℃ / 8℃").appendTo(nav);
		var span3 = $('<span>',{'class': 'main-top-nav-text'}).html("Humidity  28%").appendTo(nav);
		var span4 = $('<span>',{'class': 'main-top-nav-text'}).html("Fine Dust  152").appendTo(nav);
		var span5 = $('<span>',{'class': 'main-top-nav-text'}).html("Ultrafine Dust  80").appendTo(nav);
		var span6 = $('<span>',{'class': 'main-top-nav-clean verybad'}).html("Very Bad").appendTo(nav);
		var span7 = $('<span>',{'class': 'main-top-nav-alarm error'}).html("999+").appendTo(nav);
		var span8 = $('<span>',{'class': 'main-top-nav-alarm warning'}).html("999+").appendTo(nav);
		var span9 = $('<span>',{'class': 'main-top-nav-alarm inefficiency'}).html("999+").appendTo(nav);
		var span10 = $('<span>',{'class': 'main-top-nav-alarm maintenance'}).html("999+").appendTo(nav);
		var span11 = $('<span>',{'class': 'main-top-nav-alram'}).appendTo(nav);
		var span11_1 = $('<i>', {'class':'main-top-nav-alram-icon'}).appendTo(span11);
		
		var span12 = $('<span>',{'class': 'main-top-nav-user'}).appendTo(nav);
		var span12_1 = $('<i>', {'class': 'main-top-nav-user-icon'}).appendTo(span12);
		
		var span13 = $('<span>',{'class': 'main-top-nav-superuser'}).appendTo(nav);
		var span13_1 = $('<i>', {'class': 'main-top-nav-super-icon'}).appendTo(span13);
		
		var div1 = $('<div>',{'id': 'main-top-nav-notification','class':'main-top-nav-noti'}).appendTo(nav);
		var div2 = $('<div>',{'class':'main-top-nav-noti-rule'}).appendTo(nav)
	}
	
	var setMenu = function(menuArr){
		//var sidebar = $('<div>',{'id':'main-sidebar'}).appendTo(main);
		var sidebar = $('#main-sidebar');
		
		var data = [
			{
				id: '2', name: '그래픽', parentId:'0', webUrl: '', viewType: '', menuSequence: 2
			},
			{
				id: '1', name: '대시보드', parentId:'0', webUrl: '', viewType: '', menuSequence: 1
			},
			{
				id: '3', name: '디바이스', parentId:'0', webUrl: '', viewType: '', menuSequence: 3
			},
			{
				id: '4', name: '운영관리', parentId:'0', webUrl: '', viewType: '', menuSequence: 4
			},
			{
				id: '5', name: '알람', parentId:'4', webUrl: '', viewType: '', menuSequence: 11
			},
			{
				id: '6', name: '스케쥴', parentId:'4', webUrl: '', viewType: '', menuSequence: 12
			},
			{
				id: '7', name: '제어로직', parentId:'4', webUrl: '', viewType: '', menuSequence: 13
			},
			{
				id: '8', name: '그룹', parentId:'4', webUrl: '', viewType: '', menuSequence: 14
			},
			{
				id: '9', name: '이력관리', parentId:'0', webUrl: '', viewType: '', menuSequence: 5
			},
			{
				id: '10', name: '리포트', parentId:'9', webUrl: '', viewType: '', menuSequence: 11
			},
			{
				id: '11', name: '트렌드 로그', parentId:'9', webUrl: '', viewType: '', menuSequence: 12
			},
			{
				id: '12', name: '시스템 로그', parentId:'9', webUrl: '', viewType: '', menuSequence: 13
			},
			{
				id: '13', name: '에너지관리', parentId:'0', webUrl: '', viewType: '', menuSequence: 6
			},
			{
				id: '14', name: '요약', parentId:'13', webUrl: '', viewType: '', menuSequence: 11
			},
			{
				id: '15', name: '소비량&목표', parentId:'13', webUrl: '', viewType: '', menuSequence: 12
			},
			{
				id: '16', name: '삼성 시스템 에어컨', parentId:'13', webUrl: '', viewType: '', menuSequence: 13
			},
			{
				id: '17', name: '관제영역 설정', parentId:'0', webUrl: '', viewType: '', menuSequence: 7
			},
			{
				id: '18', name: '빌딩', parentId:'17', webUrl: '', viewType: '', menuSequence: 11
			},
			{
				id: '19', name: '계정 설정', parentId:'0', webUrl: '', viewType: '', menuSequence: 8
			},
			{
				id: '20', name: '계정관리', parentId:'19', webUrl: '', viewType: '', menuSequence: 11
			},
			{
				id: '21', name: '권한설정', parentId:'19', webUrl: '', viewType: '', menuSequence: 12
			},
			{
				id: '22', name: '시스템설정', parentId: '0', webUrl: '', viewType: '', menuSequence: 13,
			},
			{
				id: '23', name: '공지사항등록', parentId: '22', webUrl: '/Frontend/front/systemsettings/createNotice.html', viewType: '', menuSequence: 11,
			}
		];
		
		var menuArr = [];
		
		function setLevelMenu(parentId){
			var rst = [];
			for(var i=0;i<data.length;i++){
				if(!data.child){
					data.child = [];
				}
				if(data[i].parentId == parentId){
					rst.push(data[i]);
				}
			}
			rst = rst.sort(fnSortList('menuSequence'), false, parseInt);
			return rst;
		}
		
		var menuData = setLevelMenu('0');
		
		for(var i=0;i<menuData.length;i++){
			var id = menuData[i].id;
			var menu2 = setLevelMenu(id);
			menuData[i].child = menu2
			menuArr.push(menuData[i])
		}
		
		var mainSidebarMenu = $('<div>',{'id': 'main-sidebar-menu'}).appendTo(sidebar);
		var mainSidebarTop = $('<div>',{'class': 'main-sidebar-top'}).appendTo(mainSidebarMenu);
		var h1 = $('<h1>', {'class':'main-sidebar-top-text'}).appendTo(mainSidebarTop);
		var logo1 = $('<img>').attr({src: '/Frontend/front/images/logo-white.png'}).appendTo(h1)
		
		var nav = $('<nav>',{'class':'main-sidebar-menu-list'}).appendTo(mainSidebarMenu);
		var ul = $('<ul>',{'class':'list'}).appendTo(nav);
		
		
		function setNavHeight(){
			setTimeout(function(){
				var h = $(window).height();
				var newH = parseInt(h) - 80 - 190;
				nav.css({height: newH+'px'});
			}, 500);
		}
		
		function setActiveMenu(li){
			li.on('click', function(e){
				var timing = 400 // ms Or fast or slow
				var _this = this;
				if($(this).hasClass('active')){
					$(this).find('ul').slideUp(timing, function(){
						$(this).parent().removeClass('active');
					});
				}
				else{
					$('.depth1').each(function(){
						if($(this).hasClass('active')){
							$(this).find('ul').slideUp(timing, function(){
								$(this).parent().removeClass('active');
							});
						}
					});
					$(this).find('ul').slideDown(timing, function(){
						$(this).parent().addClass('active');
					});
				}
			});
		}
		
		function setMoveMenu(li, webUrl){
			li.on('click', function(e){
				e.stopPropagation();
				e.preventDefault();
				if(webUrl){
					location.href = webUrl;
				}
			});
		}
		for(var i=0;i<menuArr.length;i++){
			var name = menuArr[i].name;
			var child = menuArr[i].child;
			var webUrl1 = menuArr[i].webUrl;
			var li1 = $('<li>',{'class':'main-sidebar-menu-item'}).appendTo(ul);
			li1.addClass('depth1');
			var a1 = $('<a>').html(name).appendTo(li1);
			setActiveMenu(li1);
			setMoveMenu(li1, webUrl1);
			
			// 하위메뉴
			if(child.length > 0){
				var arrow = $('<i>',{'class':'main-sidebar-menu-arrow'}).appendTo(li1);
				var ul2 = $('<ul>',{'class':'main-sidebar-menu-sub-list'}).appendTo(li1);
				for(var j=0;j<child.length;j++){
					var name2 = child[j].name;
					var webUrl2 = child[j].webUrl;
					var li2 = $('<li>', {'class':'main-sidebar-sub-menu-item'}).appendTo(ul2);
					li2.addClass('depth2');
					var a2 = $('<a>').html(name2).appendTo(li2);
					setMoveMenu(li2, webUrl2);
				}
			}
		}
		//setTimeout(function(){
		$(nav).mCustomScrollbar({
			theme: 'dark'
		});
		//}, 500);
		setNavHeight();
		$(window).on('resize', function(){
			setNavHeight();
		});
	} 
	
	
	var setMainContent = function(){
		//var mainContent = $('<div>',{'id': 'main-contents'}).appendTo(main);
	}
	
	var setFooter = function(){
		//var mainFooter = $('<div>',{'class': 'content_footer'}).appendTo(main);
		var mainFooter = $('.content_footer');
		var div1 = $('<div>',{'class':'copy'}).appendTo(mainFooter);
		var h1 = $('<h1>').appendTo(div1);
		var img = $('<img>').attr({src: '/Frontend/front/images/common/newwin_footer_logo.png', alt: 'samsung'}).appendTo(h1);
		var span1 = $('<span>',{'class':'copy'}).html("Copyright© Samsung Electronics Co., Ltd.").appendTo(div1);
		
		var div2 = $('<div>',{'class': 'util'}).appendTo(mainFooter);
		
	}
	
	
	setHeader();
	setMenu([]);
	setMainContent();
	setFooter();
});

