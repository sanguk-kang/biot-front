/**
 *
 *    ui 
 *
 *
 */
$(document).ready(function() {

    $.fn.signBgFooter()
});

$(window).resize(function() {
    $.fn.signBgFooter()
});



// 회원가입시 컨텐츠가 길 경우 배경과 푸터 위치 제어
$.fn.signBgFooter = function() {

    var winHeight = $(window).height();
    var signCont = $('.signin-contents-block').outerHeight();



    if (signCont > winHeight) {
        $('body').addClass('sign-background');
        console.log(test);

    } else {
        $('body').removeClass('sign-background');

    }
};

//kendo