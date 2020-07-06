/**
 * 
 * @param {*} str 
 */
function validEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
/**
 * 
 * @param {*} str 
 * 영문, 숫자, 특수문자 조합
 */
function validPassword(password) { 
      var re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{6,}$/;
      return re.test(password);
}

function validMobile(mobile) {  
    var re = /^\d{2,3}-\d{3,4}-\d{4}$/;
    return re.test(mobile);
    
}

// 한글
function validKor(str) { 
    var re = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return re.test(str);
}

// 특수문자
function validSpc(str) { 
    var re = /[~!@#$%^&*()_+|<>?:{}]/;
    return re.test(str);
}

//숫자
function validNum(num) {  
    var re = /[0-9]/;
    return re.test(num);
    
}

// 문자(영어)
function validEng(num) {  
    var re = /[a-zA-Z]/;
    return re.test(num);
    
}


// function validNum(num) {  
//     var re = /[^0-9]/g;
//     return re.test(num);
    
// }

export default {
    validEmail,
    validPassword,
    validNum,
    validMobile,
    validKor,
    validSpc,
    validEng
};