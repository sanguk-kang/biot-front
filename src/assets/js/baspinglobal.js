String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
}
String.prototype.replaceDate = function(date){
	
}


var BaspinGlobal = {};

BaspinGlobal.ajax = function(option){
    var options = {
        method  : 'GET',
        url     : '', // 필수
        data    : '',
        success	: function(data){}, // 필수
        error	: function(textStatus){},
        mimeType: '',
        async   : true,
        use     : true,
        scope	: null,
        contentType: 'application/vnd.samsung.biot.v1.page+json;charset=UTF-8'
        //crossOrigin: true
    };

    options = $.extend({}, options, option || {});

    var arr = {
        type    : options.method,
        data    : options.data,
        async   : options.async,
        success : function(data, textStatus, jqXHR) {
            if((typeof(options.success)).toLowerCase() == 'function') {
                // this 변경이 필요한지 scope 영역 추후 검토 필요
                options.success.call(options.scope, data);
            }
        },
        error   : function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR, textStatus, errorThrown);
            if((typeof(options.error)).toLowerCase() == 'function') {
            	options.error.call(options.scope, textStatus);
            }
            
        }
    }

    if(options.mimeType == 'form'){
        arr.mimeType	= "multipart/form-data";
        arr.contentType	= false;
        arr.cache		= false;
        arr.processData	= false;
        arr.dataType	= 'json';
    }
    else{
        arr.beforeSend = function(request){
            /*
                // ie 일 경우 ==> 확인 필요
                if(is_ie){
                    arr.headers = {
                	    'Accept': 'application/json',
                		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                	};
                }
            */
            request.setRequestHeader('Accept', options.contentType);
            request.setRequestHeader('Content-Type', options.contentType);
            request.setRequestHeader('Authorization', '');
        }
    }

    if(options.use){
        arr.url = BaspinGlobal.apiList(options.url)
    }
    else{
        arr.url = options.url;
    }
    $.ajax(arr);
};
BaspinGlobal.apiList = function(name){
    var putUrl = "http://10.30.227.215:8888";
    var list = {
        noticeList: putUrl+'/api/ums/notice/list/paging',
        noticeInsert: putUrl+'/api/ums/notice/insert',
    }

    if(list[name]){
        return list[name];
    }
    else{
        alert("이름이 등록되어 있지 않은 API 입니다.");
    }

};

BaspinGlobal.paging = function(obj, options){
    var totalSize	= parseInt(obj.totalSize); // 필수 !!
    var curPage		= parseInt(obj.curPage) || 1;
    var pageListMax = parseInt(obj.pageListMax) || 10;
    var row			= parseInt(obj.row) || 10;

    var totalPage = Math.ceil(totalSize/row);
    var prevPage = curPage-1;
    var nextPage = curPage+1;

    var startPage = parseInt((parseInt((curPage-1)/pageListMax)*pageListMax))+1;
    var endPage = startPage + (pageListMax - 1);

    if (endPage >= totalPage) {
        endPage = totalPage;
    }

    var retValue1 = $('<div>').css({textAlign: 'center'});
    var retValue2 = $('<div>').css({display: 'inline-block'}).appendTo(ret_value1);
    var retValue3 = $('<ul>',{'class':'pageLst clear'}).appendTo(ret_value2)

    var beginPage = 1;
    if (curPage == 1) {
        beginPage = -1;
    }

    function setNewPageAsync(page, total, count){

        var max_page = Math.ceil(total/count);

        if(page<1){
            alert("첫번째 페이지 입니다.");
            return;
        }
        else if(page > maxPage){
            alert("마지막 페이지 입니다.");
            return;
        }
        $('.paging_no').removeClass('on');
        $('.paging_no').each(function(){
            var pagingNo = $(this).attr('paging_no');
            if(pagingNo == page){
                $(this).addClass('on');
            }
        });
        if(!options){
            obj.fn(page);
        }
        else{
            obj.fn(page, options);
        }

        if(obj.fn2 && (typeof(obj.fn2)).toLowerCase() == 'function') {
            obj.fn2();
        }


    }
    function setPageMove(number, number_box){
        numberBox.on('click', function(){
            setNewPageAsync(number, totalSize, row);
        });
    }


    var retValue4 = $('<li>',{'class':'fLeft'}).appendTo(retValue3);
    setPageMove(beginPage, retValue4);

    var retValue5 = $('<div>',{'class':'paging_arrow_first'}).appendTo(retValue4);

    var retValue6 = $('<li>',{'class':'fLeft'}).appendTo(retValue3);
    setPageMove(prevPage, retValue6);

    var retValue7 = $('<div>',{'class':'paging_arrow1'}).appendTo(retValue6);

    if(totalPage > 0){
        for(var k=startPage;k<=endPage;k++){
            var retValue8 = $('<li>',{'class':'fLeft paging_no pointer mLeft5'}).attr({pagingNo: k}).html(k).appendTo(retValue3);
            if(k==startPage){
                retValue8.removeClass('mLeft20');
                retValue8.addClass('mLeft15');
            }
            setPageMove(k, retValue8);
            if(curPage == k){
                retValue8.addClass('on');
            }
        }
    }

    var retValue9 = $('<li>',{'class':'fLeft pointer mLeft5'}).appendTo(retValue3);
    setPageMove(nextPage, retValue9);

    var retValue10 = $('<div>',{'class':'paging_arrow2'}).appendTo(retValue9);

    if(totalPage == curPage){
        totalPage = totalPage + 1;
    }

    var retValue11 = $('<li>',{'class':'fLeft'}).appendTo(retValue3);
    setPageMove(totalPage, retValue11);

    var retValue12 = $('<div>',{'class':'paging_arrow_last'}).appendTo(retValue11);

    var retValue13 = $('<li>',{'class':'clear'}).appendTo(retValue3);

    return retValue1;
};


// 이메일 검증 함수, 리턴이 false 라면 invalid mail
BaspinGlobal.checkEmail = function(email){
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if(email != '' && email != 'undefined' && re.test(email)){
        return true;
    }
    else{
        return false;
    }
};

// 숫자 형태 체크
BaspinGlobal.isNumber = function(text){
    var regNumber = /^[0-9]*$/;
    if(!regNumber.test(text)) {
        return false;
    }
    else{
    	return true;
    }
};

// 파일 업로드시 이미지 파일 확장자 체크 함수
// ex) 확장자 다르게 써야 할시 imgExtList 에 (obj,  ['jpg', 'gif', 'png', 'jpeg', 'pdf']) 등으로 호출
BaspinGlobal.imgFileCheck = function(obj, imgExtList /* [] */){
    var imgExtList = imgExtList || ['jpg', 'gif', 'png', 'jpeg'];
    var pathpoint = obj.value.lastIndexOf('.');
    var filepoint = obj.value.substring(pathpoint+1,obj.length);
    var filetype = filepoint.toLowerCase();

    if($.inArray(filetype, imgExtList) > -1){
    	return true;
    }
    else{
    	return false;
    }
};

// 페이지 링크 함수
BaspinGlobal.pageMove = function(page, pageOpt){
	var commonURL = '/Frontend/front/' // 임시
    var url = location.protocol+"//"+location.host+commonURL;
    var pageOpt = pageOpt || true;
    if(pageOpt){
        location.href = url+page;
    }
    else{
        location.href = url+pageList(page);
    }
};

// 공백 제거 함수
BaspinGlobal.trim = function(str){
	str = str.replace(/(^\s*)|(\s*$)/g,"");
	return str;
};

// 스크롤 이벤트 제거 함수
BaspinGlobal.scrollEvtX = function(){
	$('html,body').css({overflowY: 'hidden'});
};

// 스크롤 이벤트 복귀 함수
BaspinGlobal.scrollEvtO = function(){
	$('html,body').css({overflowY: ''});
};

// iOs 체크
BaspinGlobal.checkiOS = function(){
	var ua = navigator.userAgent;
	var mobileList = ['iPhone', 'iPad', 'iPod'];
	var returnValue = false;
	for(var i=0;i<mobileList.length;i++){
		if(ua.indexOf(mobileList[i]) != -1){
			returnValue = true;
			break;
		}
	}
	// true 이면 ios
	return returnValue;
};

// 모바일 체크
BaspinGlobal.isMobile = function(){
	var ua = navigator.userAgent;
	var mobileList = ['Android', 'BlackBerry', 'iPhone', 'iPad', 'iPod', 'Opera Mini', 'IEMobile'];
	var returnValue = false;
	for(var i=0;i<mobileList.length;i++){
		if(ua.indexOf(mobileList[i]) != -1){
			returnValue = true;
			break;
		}
	}
	// true 이면 모바일
	return returnValue;
};

// iE 체크
BaspinGlobal.isIe = function() {
	if(navigator.userAgent.toLowerCase().indexOf("chrome") != -1) return false;
	if(navigator.userAgent.toLowerCase().indexOf("msie") != -1) return true;
	if(navigator.userAgent.toLowerCase().indexOf("windows nt") != -1) return true;
	return false;
};

// 자바스크립트 inlcude
BaspinGlobal.addJavascript = function(jsname) {
	var th = document.getElementsByTagName('head')[0];
	var s = document.createElement('script');
	s.setAttribute('type','text/javascript');
	s.setAttribute('src',jsname);
	th.appendChild(s);
};

// 자릿수에 맞는 난수 생성 디폴트는 6자리
BaspinGlobal.getRandNumber = function(digit){
	var digit = digit || 6;
	var str = '';
	for(var i=0;i<digit;i++){
		str += ''+(Math.floor((Math.random() * 10) + 1));
	}
	return str;
};

// 프로토콜 가져오기
BaspinGlobal.getProtocol = function(){
	return location.protocol;
};

BaspinGlobal.numberStyle = {
    type1: function(x){ // 숫자를 , 형태로 변경 ( 1000 => 1,000 ... )
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    type2: function(x){ // 숫자 형태를 기본 상태로 바꾸어줌 ( 1,000 => 10000 )
        return parseInt(x.split(",").join(""));
    }
};


/* design.js */
BaspinGlobal.signBgFooter = function(){
	var winHeight = $(window).height();
	var signCont = $('.signin-contents-block').outerHeight();
	
	if (signCont > winHeight) {
	    $('body').addClass('sign-background');
	}
	else{
	    $('body').removeClass('sign-background');
	}
}

$(document).ready(function(){
	BaspinGlobal.signBgFooter();
});
$(window).on('resize', function(){
	BaspinGlobal.signBgFooter();
});
