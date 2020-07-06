<template>
    <div class="content">
        <div id="sign_main">
            <div id="signin-container">
                <section class="signin-brand-visual"><span class="ir">배경비주얼</span></section>

                <section class="signin-contents ">
                    <div class="signin-contents-block">

                        <h1 class="signin-contents-title"><img src="@/assets/images/common/logo.png" class="signin-logo-img" /></h1>
                        <div class="signin-contents-form">
                            <h2 class="find-contents-title">Entering member information</h2>
                            <form>
                                <fieldset class="signin-contents-formfieldset">
                                    <div class="ess_top"><i class="ic_ess"></i>Mandatory field</div>
                                    <ul class="find-idpw-block wd_380">
                                        <li>
                                            <div class="input_wrap">
                                                <input id="" name="" type="text" v-model="firstName" :class="errorFirstName.css" @keyup="checkFirstName()" class="k-input" placeholder="First Name" />
                                                <i class="ic_ess"></i>
                                                <span v-if="errorFirstName.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorFirstName.msg }}</span>
                                                <i class="signin-input-remove ic ic-bt-input-remove show" data-target=""></i>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="input_wrap">
                                                <input id="" name="" type="text" v-model="lastName" :class="errorLastName.css" @keyup="checkLastName()" class="k-input" placeholder="Last Name" />
                                                <i class="ic_ess"></i>
                                                <span v-if="errorLastName.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorLastName.msg }}</span>
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="input_wrap">
                                                <div id="dropDownList1" class="line_type"></div>
                                                <i class="ic_ess"></i>
                                            </div>
                                        </li>
                                        <li>
                                            <ul class="flex_both_right">
                                                <li>
                                                    <div class="input_wrap">
                                                        <input v-model="codeCheck" id="" name="" :class="errorCodeCheck.css" @keyup="keyUpCheck()" @mousedown="mouseDownCheck()" type="text" class="k-input" lue="" placeholder="Privilege verification code(1231294eda)" />
                                                        <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                        <span v-if="errorCodeCheck.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorCodeCheck.msg }}</span>
                                                        <span v-show="privilege!=''" class="k-tooltip-validation k-success-msg" data-for="signin-id">{{privilege}} 확인</span>
                                                        <i class="ic_ess "></i>
                                                    </div>
                                                </li>
                                                <li><button :disabled="codeCheckBoolean==false" id="" @click="verificationCheck()" type="button" class="k-button">Check</button></li>
                                            </ul>
                                        </li>
                                    </ul>
                                    
                                    <ul class="find-idpw-block wd_380 bk_side" v-show="step==1">
                                        <li>
                                            <div class="input_wrap">
                                                <input id="" name="" v-model="id" type="text" :class="errorId.css" @keyup="checkId()" class="k-input" placeholder="ID" />
                                                <i class="ic_ess"></i>
                                                <span v-if="errorId.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorId.msg }}</span>
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="input_wrap">
                                                <input v-model="password" :class="errorPassword.css" @keyup="checkPassword()" id="" name="" type="password" class="k-input" placeholder="Password" />
                                                <i class="ic_ess"></i>
                                                <span v-if="errorPassword.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorPassword.msg }}</span>
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="input_wrap">
                                                <input v-model="confirmPassword" id="" name="" type="password" :class="errorConfirmPassword.css" @keyup="checkConfirmPassword()" class="k-input" placeholder="Confirm Password" />
                                                <i class="ic_ess"></i>
                                                <span v-if="errorConfirmPassword.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorConfirmPassword.msg }}</span>
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="input_wrap">
                                                <input v-model="mobile" @keyup="checkMobile()" :class="errorMobile.css" id="" name="" type="text" class="k-input" placeholder="Phone" />
                                                <i class="ic_ess"></i>
                                                <span v-if="errorMobile.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorMobile.msg }}</span>
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="input_wrap">
                                                <input v-model="email" @keyup="checkEmail()" :class="errorEmail.css" id="" name="" type="text" class="k-input" placeholder="E-mail" />
                                                <span v-if="errorEmail.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorEmail.msg }}</span>
                                                <i class="ic_ess"></i>
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="input_wrap">
                                                <input v-model="companyName" @keyup="checkCompanyName()" :class="errorCompanyName.css" id="" name="" type="text" class="k-input" placeholder="Corporate name" />
                                                <span v-if="errorCompanyName.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorCompanyName.msg }}</span>
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="input_wrap">
                                                <input v-model="position" @keyup="checkPosition()" :class="errorPosition.css" id="" name="" type="text" class="k-input" placeholder="Position" />
                                                <span v-if="errorPosition.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorPosition.msg }}</span>
                                                <!-- <i class="ic_ess"></i> -->
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            </div>
                                        </li>
                                    </ul>
                                        <div class="text_area " v-show="step==1">
                                            <p class="k-checkbox-wrapper">
                                                <input v-model="kakaoAgree" @click="kakaoAlert()" type="checkbox" id="signinremember4" name="remember" class="k-checkbox">
                                                <label for="signinremember4" class="k-checkbox-label"><span class="signin-remember-label">I agree to receive Kakao Talk messages.</span></label>
                                                <i class="ic_ess"></i>
                                            </p>
                                        </div>

                                    <div v-show="kakaoAgree==true" >
                                        <div class="input_wrap">
                                            <input v-model="kakao" id="" @keyup="checkKakao()" :class="errorKakao.css" name="" type="text" class="k-input" placeholder="인증번호 6자리" />
                                            <span v-if="errorKakao.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorKakao.msg }}</span>
                                            <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            <span class="time-limt">03:00</span>
                                        </div>
                                        <div class="text_area pb0">
                                            <p class="q_text">Didn't you get the authentication numbdropDownList1er?</p>
                                            <p><a href="#" @click="kakaoAlert2()" class="btn_text">Re-transfer authentication numbdropDownList1er</a></p>
                                        </div>
                                    </div>

                                    <!-- <ul class="find-idpw-block wd_380 bk_side">
                                        <li><span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList" id="loadSchList1" ><label class="k-radio-label" for="loadSchList1">Changing the person</label></span></li>
                                        <li><span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList" id="loadSchList2"><label class="k-radio-label" for="loadSchList2">The resignation of one's</label></span></li>
                                        <li><span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList" id="loadSchList3"><label class="k-radio-label" for="loadSchList3">Etc.</label></span></li>
                                        <li><textarea id="schedule-description" data-bind="" class="k-input k-valid" placeholder="(Required) Enter detailed reason" style="width:100%;height:92px;"></textarea></li>
                                    </ul> -->

                                    <ul class="find-idpw-button">
                                        <li><button id="" type="button" class="k-button" @click="move('Agreement')">Cancel</button></li>
                                        <li><button id="" type="button" class="k-button" @click="move('JoinComplet')">Sign Up</button></li>
                                    </ul>
                                </fieldset>
                            </form>
                            <footer class="signin-footer">Copyright© Samsung Electronics Co., Ltd.</footer>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import axios from '@/api/axios.js';
import dataRegex from "@/utils/dataRegex.js";
import stringUtils from "@/utils/stringUtils.js";
// import SelectBox from "@/components/custom/VueDropdown";
// import VueDropdown from "@/components/custom/VueDropdown";
export default {
  name: "memberGeneral",
  components: {
    // SelectBox,
    // VueDropdown
  },
  data: function() {
    return {
        id:"", //parameter
        errorId: {
            status: false,
            msg: "",
            css: "k-input"
        },
        sendData:{
            //,termOfUseList:{} ??
            firstName:"",
            lastName:"",
            role:0,
            password:"",
            phoneNumber:"",
            email:"",
            companyName:"",
            position:"",
            kakaoTalkAgreement: false,
            created:false
        },
        signup:{
            firstName:"",
            lastName:"",
            userRole: "",
            id:""
        },
        step:0,
        firstName: "",
        errorFirstName: {
            status: false,
            msg: "",
            css: "k-input"
        },
        lastName:"",
        errorLastName: {
            status: false,
            msg: "",
            css: "k-input"
        },
        email:"",
        errorEmail: {
            status: false,
            msg: "",
            css: "k-input"
        },
        mailConfirmData:"",
        errorMailConfirmData: { 
            status: false,
            msg: "",
            css: "k-input"
        },
        password:"",
        errorPassword: {
            status: false,
            msg: "",
            css: "k-input"
        },
        confirmPassword:"",
        errorConfirmPassword: {
            status: false,
            msg: "",
            css: "k-input"
        },
        mobile:"",
        errorMobile: {
            status: false,
            msg: "",
            css: "k-input"
        },
        privilege:"",
        codeCheck:"",
        codeCheckBoolean: false,
        errorCodeCheck: {
            status: false,
            msg: "",
            css: "k-input"
        },
        companyName:"",
        errorCompanyName: {
            status: false,
            msg: "",
            css: "k-input"
        },
        position:"",
        errorPosition: {
            status: false,
            msg: "",
            css: "k-input"
        },
        kakaoAgree:"",
        kakao:"",
        errorKakao: {
            status: false,
            msg: "",
            css: "k-input"
        }
    }
  },
  methods: {
    mouseDownCheck(){
        if(this.step==1){
            this.$confirm('검증코드 변경(삭제) 시 입력정보가 모두 초기화됩니다. 검증코드를 변경(삭제) 하시겠습니까?', 'Warning', {
            title: "confirm test",
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: '',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            dangerouslyUseHTMLString: true
            }).then(() => {
            console.log('Delete completed');
            }).catch(() => {
            console.log('Delete canceled');
            });

            //ok일경우
            this.step=0;
            this.privilege="";
            this.codeCheckBoolean= false;
        }
    },
    keyUpCheck(){
        console.log(this.codeCheck.length);
        if (stringUtils.isEmpty(this.codeCheck)) {
            this.errorCodeCheck.css = "k-input k-invalid";
            this.errorCodeCheck.status = true;
            this.errorCodeCheck.msg = "검증코드를 입력하세요";
            this.codeCheckBoolean = false;
            return;
        }
        if (this.codeCheck.length!=6) {
            this.errorCodeCheck.css = "k-input k-invalid";
            this.errorCodeCheck.status = true;
            this.errorCodeCheck.msg = "검증코드 6자리를 입력하세요";
            // this.codeCheckBoolean = false;
            this.codeCheckBoolean = true;
            return;
        }
        // 초기화
        this.errorCodeCheck.css = "k-input";
        this.errorCodeCheck.status = false;
        this.errorCodeCheck.msg = "";
        this.codeCheckBoolean = true;
    },
    move(page){
        if(page=="JoinComplet"){
            // this.sendData.termOfUseList = JSON.parse(sessionStorage.getItem('termList'));
            this.sendData.firstName=this.firstName;
            this.sendData.lastName=this.lastName;
            this.sendData.role=201;
            this.sendData.password = this.password;
            this.sendData.phoneNumber=this.mobile;
            this.sendData.email=this.email;
            this.sendData.companyName=this.companyName;
            this.sendData.position=this.position;
            console.log(this.sendData);
            // axios.postApi('/ums/user/' + this.id, this.sendData, "").then(res => {
            //     // 정상
            //     if (res.status == 200) {
            //         console.log("성공");
            //     }
            // }).catch(function (error) {
            //     console.log('error', error.response);
            // });
            this.signup.firstName=this.firstName;
            this.signup.lastName=this.lastName;
            this.signup.userRole='Maintainer';
            this.signup.id=this.id;

            sessionStorage.setItem('signUpInfo', JSON.stringify(this.signup));
            this.$router.push({name : page});
            return;
        }

        this.$router.push({name : page});   
    },
    verificationCheck(){
        var api = this;
        var params = {};
        params.siteAuthCode = this.codeCheck;
        //api 호출
        axios.getApi('/ums/site/siteAuthCode/check', params, "").then(res => {
            console.log(res.data);
            this.codeCheckBoolean = true;
            this.errorCodeCheck.css = "k-input";
            this.errorCodeCheck.status = false;
            this.errorCodeCheck.msg = "";
            this.privilege="Maintainer";
            this.step = 1;
        }).catch(function (error) {
            if(error.response.status==400){
                api.errorCodeCheck.css = "k-input k-invalid";
                api.errorCodeCheck.status = true;
                api.errorCodeCheck.msg = "권한검증코드를 잘못 입력했어요.";
                api.privilege="";
            }

        });
    }, 
    checkFirstName(){
        if (stringUtils.isEmpty(this.firstName)) {
            this.errorFirstName.css = "k-input k-invalid";
            this.errorFirstName.status = true;
            this.errorFirstName.msg = "이름을 입력하세요.";
            return;
        }
        if (this.firstName.length > 30) {
            this.errorFirstName.css = "k-input k-invalid";
            this.errorFirstName.status = true;
            this.errorFirstName.msg = "30자까지만 입력할 수 있습니다.";
            return;
        }
        this.errorFirstName.css = "k-input";
        this.errorFirstName.status = false;
        this.errorFirstName.msg = "";
    },
    checkLastName(){
        if (stringUtils.isEmpty(this.lastName)) {
            this.errorLastName.css = "k-input k-invalid";
            this.errorLastName.status = true;
            this.errorLastName.msg = "성을 입력하세요.";
            return;
        }
        if (this.lastName.length > 30) {
            this.errorLastName.css = "k-input k-invalid";
            this.errorLastName.status = true;
            this.errorLastName.msg = "30자까지만 입력할 수 있습니다.";
            return;
        }
        this.errorLastName.css = "k-input";
        this.errorLastName.status = false;
        this.errorLastName.msg = "";
    },
    checkId(){
        if (stringUtils.isEmpty(this.id)) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "아이디를 입력하세요.";
            return;
        }
        if (this.id.length > 16) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "16자까지만 입력할 수 있습니다.";
            return;
        }
        if (this.id.length < 6) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "5자 이상 입력하셔야 합니다.";
            return;
        }
        if (dataRegex.validKor(this.id)||dataRegex.validSpc(this.id)) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            //허용되지 않은 문자 – 한글, 특수문자
            this.errorId.msg = "허용하지 않는 문자를 입력하셨습니다.";
            return;
        }
        // 초기화
        this.errorId.css = "k-input";
        this.errorId.status = false;
        this.errorId.msg = "";
    },
    checkPassword(){
        if (stringUtils.isEmpty(this.password)) {
            this.errorPassword.css = "k-input k-invalid";
            this.errorPassword.status = true;
            this.errorPassword.msg = "비밀번호를 입력하세요.";
            return;
        }
        if (this.password.length > 20) {
            this.errorPassword.css = "k-input k-invalid";
            this.errorPassword.status = true;
            this.errorPassword.msg = "20자까지만 입력할 수 있습니다.";
            return;
        }
        if (this.password.length < 9) {
            this.errorPassword.css = "k-input k-invalid";
            this.errorPassword.status = true;
            this.errorPassword.msg = "8자 이상 입력하셔야 합니다.";
            return;
        }
        if(!dataRegex.validPassword(this.password)) {
            this.errorPassword.css = "k-input k-invalid";
            this.errorPassword.status = true;
            this.errorPassword.msg = "비밀번호는 영문, 숫자, 특수문자의 조합으로 입력하셔야 합니다.";
            return;
        }
        this.errorPassword.css = "k-input";
        this.errorPassword.status = false;
        this.errorPassword.msg = "";
    },
    checkConfirmPassword(){
        if (stringUtils.isEmpty(this.confirmPassword)) {
            this.errorConfirmPassword.css = "k-input k-invalid";
            this.errorConfirmPassword.status = true;
            this.errorConfirmPassword.msg = "비밀번호 재입력을 입력하세요.";
            return;
        }
        if(this.password!=this.confirmPassword) {
            this.errorConfirmPassword.css = "k-input k-invalid";
            this.errorConfirmPassword.status = true;
            this.errorConfirmPassword.msg = "비밀번호가 불일치 합니다.";
            return;
        }
        this.errorConfirmPassword.css = "k-input";
        this.errorConfirmPassword.status = false;
        this.errorConfirmPassword.msg = "";
    },
    checkMobile(){
        if (stringUtils.isEmpty(this.mobile)) {
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "전화번호를 입력하세요.";
            return;
        }
        if (this.mobile.length > 25) {
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "25자까지만 입력할 수 있습니다.";
            return;
        }
        if (this.mobile.length < 5) {
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "4자 이상 입력하셔야 합니다.";
            return;
        }
        if (!dataRegex.validMobile(this.mobile)) {
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "허용하지 않는 문자를 입력하셨습니다.";
            return;
        }
        this.errorMobile.css = "k-input";
        this.errorMobile.status = false;
        this.errorMobile.msg = "";
    },
    checkEmail(){
        if (stringUtils.isEmpty(this.email)) {
            this.errorEmail.css = "k-input k-invalid";
            this.errorEmail.status = true;
            this.errorEmail.msg = "이메일을 입력하세요.";
            return;
        }
        if (this.email.length > 50) {
            this.errorEmail.css = "k-input k-invalid";
            this.errorEmail.status = true;
            this.errorEmail.msg = "50자까지만 입력할 수 있습니다.";
            return;
        }
        if (!dataRegex.validEmail(this.email)) {
            this.errorEmail.css = "k-input k-invalid";
            this.errorEmail.status = true;
            this.errorEmail.msg = "Email 주소를 잘못 입력하셨습니다.";
            return;
        }
        this.errorEmail.css = "k-input";
        this.errorEmail.status = false;
        this.errorEmail.msg = "";
    },
    checkMailConfirmData(){
        this.errorMailConfirmData.css = "k-input";
        this.errorMailConfirmData.status = false;
        this.errorMailConfirmData.msg = "";
    },
    checkCompanyName(){
        if (this.companyName.length > 50) {
            this.errorCompanyName.css = "k-input k-invalid";
            this.errorCompanyName.status = true;
            this.errorCompanyName.msg = "50자까지만 입력할 수 있습니다.";
            return;
        }
        this.errorCompanyName.css = "k-input";
        this.errorCompanyName.status = false;
        this.errorCompanyName.msg = "";
    },
    checkPosition(){
        if (this.position.length > 20) {
            this.errorPosition.css = "k-input k-invalid";
            this.errorPosition.status = true;
            this.errorPosition.msg = "20자까지만 입력할 수 있습니다.";
            return;
        }
        this.errorPosition.css = "k-input";
        this.errorPosition.status = false;
        this.errorPosition.msg = "";
    },
    checkKakao(){
        if (stringUtils.isEmpty(this.kakao)) {
            this.errorKakao.css = "k-input k-invalid";
            this.errorKakao.status = true;
            this.errorKakao.msg = "인증번호를 입력하세요.";
            return;
        }
        if (this.kakao.length!=6) {
            this.errorKakao.css = "k-input k-invalid";
            this.errorKakao.status = true;
            this.errorKakao.msg = "인증번호 6자리를 입력하세요.";
            return;
        }
        this.errorKakao.css = "k-input";
        this.errorKakao.status = false;
        this.errorKakao.msg = "";
    },
    kakaoAlert() {
        if(this.mobile==""){
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "휴대폰 번호는 필수 입력항목 입니다.";
            this.kakaoAgree=false;
            return;
        }

        this.$alert('카카오톡 메시지로 인증번호가 발송되었습니다.', 'Title', {
            title: "알림",
            confirmButtonText: 'OK',
            dangerouslyUseHTMLString: true,
            callback: action => {
                console.log(action);
            }
        });
    },
    kakaoAlert2() {
        this.$alert('카카오 메시지로 인증번호가 재발송 되었습니다.', 'Title', {
            title: "알림",
            confirmButtonText: 'OK',
            dangerouslyUseHTMLString: true,
            callback: action => {
                console.log(action);
            }
        });
    },
  },
  created() {
  }
}
</script>

<style lang="scss">

</style>