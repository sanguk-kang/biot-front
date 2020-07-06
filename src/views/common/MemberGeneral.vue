<template>
    <div class="content">
        <div id="sign_main">
            <div id="signin-container" class="flex_al_center">
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
                                                <input id="" name="" type="text" class="k-input"  v-model="email" :class="errorEmail.css" @keyup="checkEmail()" @mousedown="mouseDownCheck()" placeholder="Email" />
                                                <i class="ic_ess"></i>
                                                <span v-if="errorEmail.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorEmail.msg }}</span>
                                                <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                <span v-show="step==2 || step==3" class="k-tooltip-validation k-success-msg" data-for="signin-id">Email authentication complete</span>
                                            </div>
                                        </li>

                                    </ul>

                                    <a v-show="step==0" href="#" class="btn_text" @click="sendMail()">Send authentication mail</a>

                                    <div v-show="step==1">
                                        <div class="text_area">
                                            <p class="q_text">Didn't you get the authentication number?</p>
                                            <p><a href="#" @click="sendMail()" class="btn_text">Re-transfer authentication number</a></p>
                                            <VueModalSample ref="modalName"></VueModalSample>
                                        </div>

                                        <ul class="flex_both_right">
                                            <li>
                                                <div class="input_wrap">
                                                    <input id="" name="" type="text" v-model="mailConfirmData" :class="errorMailConfirmData.css" @keyup="checkMailConfirmData()" class="k-input" placeholder="인증번호를 입력하세요." />
                                                    <i class="signin-input-remove ic ic-bt-input-remove time-limt" ></i>
                                                    <span class="time-limt">
                                                        
                                                    </span>
                                                    <span v-if="errorMailConfirmData.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorMailConfirmData.msg }}</span>
                                                </div>
                                            </li>
                                            <li><button id="" type="button" class="k-button" @click="mailConfirm()">Check</button></li>
                                        </ul>
                                    </div>
                                    <div v-show="step==2 || step==3">
                                        <ul class="find-idpw-block wd_380 bk_side">
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
                                                    <input id="" name="" type="password" class="k-input" v-model="password" :class="errorPassword.css" @keyup="checkPassword()" placeholder="Password" />
                                                    <i class="ic_ess"></i>
                                                    <span v-if="errorPassword.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorPassword.msg }}</span>
                                                    <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <input id="" name="" type="password" class="k-input" v-model="confirmPassword"  :class="errorConfirmPassword.css" @keyup="checkConfirmPassword()" placeholder="Confirm Password" />
                                                    <i class="ic_ess"></i>
                                                    <span v-if="errorConfirmPassword.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorConfirmPassword.msg }}</span>
                                                    <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <input id="" name="" v-model="mobile" @keyup="checkMobile()" :class="errorMobile.css" type="text" class="k-input" placeholder="Include '-' of mobile prosperity" />
                                                    <i class="ic_ess"></i>
                                                    <span v-if="errorMobile.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorMobile.msg }}</span>
                                                    <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <div id="dropDownList1" class="line_type">
                                                        <el-select v-model="userRoleValue">
                                                            <el-option v-for="item in userRoleData" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key"></el-option>
                                                        </el-select>
                                                        <span v-if="errorUserRole.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorUserRole.msg }}</span>
                                                    </div>
                                                    <i class="ic_ess"></i>
                                                </div>
                                            </li>
                                            <li>
                                                <!--s:# User Role  ‘Manager or Guest’ 선택 시-->
                                                <ul class="flex_both_right" v-show="userRole=='Manager' || userRole=='Guest'">
                                                    <li>
                                                        <div class="input_wrap">
                                                            <input v-model="siteCode" id="" name="" :class="errorSiteCode.css" @keyup="checkSiteCode()" type="text" class="k-input" value="" placeholder="FDFE12" />
                                                            <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                            <span v-if="errorSiteCode.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorSiteCode.msg }}</span>
                                                            <span v-show="siteName!=''" class="k-tooltip-validation k-success-msg" data-for="signin-id">{{siteName}} confirmed</span>
                                                            <i class="ic_ess "></i>
                                                        </div>
                                                    </li>
                                                    <li><button id="" @click="siteCheck('SiteCode')" type="button" :disabled="siteCodeBoolean==false" class="k-button">Verification</button></li>
                                                </ul>
                                                <!--e:# User Role  ‘Manager or Guest’ 선택 시-->
                                            </li>
                                            <!--s:co-3103 20200420  -->
                                            <li v-show="userRole=='Site Admin'">  
                                                <div class="radio_wrap ft_td">
                                                    <span class="radioLabel"><input type="radio" v-model="loadSchList" class="k-radio" name="loadSchList" value="loadSchList1" id="loadSchList1"><label class="k-radio-label" for="loadSchList1">신규 사이트 신청</label></span>
                                                    <span class="radioLabel"><input type="radio" v-model="loadSchList" class="k-radio" name="loadSchList" value="loadSchList2" id="loadSchList2"><label class="k-radio-label" for="loadSchList2">사이트 ID 입력</label></span>
                                                </div>
                                            </li>
                                            <!--e:co-3103 20200420  -->
                                        </ul>
                                    </div>
                                    <div v-show="loadSchList=='loadSchList1'">
                                        <!--s:co-3103 20200420  신규 사이트 신청 -->
                                        <ul class="find-idpw-block wd_380 bk_side2">
                                            <li>
                                                <div class="input_wrap">
                                                    <input id="" name="" type="text" class="k-input" v-model="newSiteName" :class="errorNewSiteName.css" @keyup="checkNewSiteName()" placeholder="Site Name" />
                                                    <i class="ic_ess"></i>
                                                    <span v-if="errorNewSiteName.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorNewSiteName.msg }}</span>
                                                    <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <div id="dropDownList2" class="line_type">
                                                    <el-select v-model="industryCode" placeholder="Enter the industry">
                                                        <el-option
                                                        v-for="item in industryData"
                                                        :key="item.value"
                                                        :label="item.key"
                                                        :value="item.value">
                                                        </el-option>
                                                    </el-select>
                                                    <span v-if="errorIndustry.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorIndustry.msg }}</span>
                                                    <!-- <SelectBox :isCheckType='true' :selectboxData='industryData' :allValue='true'></SelectBox> -->
                                                    </div>
                                                    <i class="ic_ess"></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <div id="dropDownList3" class="line_type">   
                                                    <el-select v-model="countryCode" placeholder="Enter the country's name">
                                                        <el-option
                                                        v-for="item in countryData"
                                                        :key="item.value"
                                                        :label="item.key"
                                                        :value="item.value">
                                                        </el-option>
                                                    </el-select>
                                                    <span v-if="errorCountry.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorCountry.msg }}</span>
                                                    </div>
                                                    <i class="ic_ess"></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <div id="dropDownList4" class="line_type">
                                                    <VueDropdown v-model="weekends" placeholder="Weekend settings" :selectboxData='weekendsData' :isCheckType="true"></VueDropdown>
                                                    <!-- <VueDropdown :isCheckType='false' :selectboxData='WeekendData' :allValue='true'></VueDropdown> -->
                                                    </div>
                                                    <i class="ic_ess"></i>
                                                    <span v-if="errorWeekends.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorWeekends.msg }}</span>
                                                </div>
                                                <span v-for="item in weekends" :key="item.key">{{item.key}}요일 </span>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <input v-model="telephoneNumber" :class="errorTelephoneNumber.css" @keyup="checkTelephoneNumber()" id="" name="" type="text" class="k-input" placeholder="Enter the telephone number" />
                                                    <i class="ic_ess"></i>
                                                    <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                    <span v-if="errorTelephoneNumber.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorTelephoneNumber.msg }}</span>
                                                </div>
                                            </li>
                                            <li>
                                                <ul class="flex_both_right">
                                                    <li>
                                                        <div class="input_wrap">
                                                            <input id="" name="" type="text" class="k-input" disabled="disabled" value="" placeholder="Zip Code" />
                                                            <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                            <i class="ic_ess "></i>
                                                        </div>
                                                    </li>
                                                    <li><button id="" type="button" class="k-button">Zip Code</button></li>
                                                </ul>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <input id="" name="" type="text" class="k-input" disabled="disabled" placeholder="Address 1" />
                                                    <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                </div>
                                                <div class="input_wrap">
                                                    <input id="" name="" type="text" class="k-input"  placeholder="Address 2" />
                                                    <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                </div>
                                            </li>
                                        </ul>
                                        <!--e:co-3103 20200420  신규 사이트 신청-->
                                    </div>
                                    <div v-show="loadSchList=='loadSchList2'">
                                        <!--s:co-3103 20200420  사이트 ID 입력 -->
                                        <ul class="find-idpw-block wd_380 bk_side">
                                            <li>
                                                <ul class="flex_both_right">
                                                    <li>
                                                        <div class="input_wrap">
                                                            <input id="" v-model="siteId" :class="errorSiteId.css" @keyup="checkSiteId()" name="" type="text" class="k-input"  value="" placeholder="D99E1A2645" />
                                                            <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                                            <span v-if="errorSiteId.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorSiteId.msg }}</span>
                                                            <span v-show="siteName!=''" class="k-tooltip-validation k-success-msg" data-for="signin-id">{{siteName}} confirmed</span>
                                                            <i class="ic_ess "></i>
                                                        </div>
                                                    </li>
                                                    <li><button id="" @click="siteCheck('SiteId')" type="button" :disabled="siteIdBoolean==false" class="k-button">검증</button></li>
                                                </ul>
                                            </li>
                                            <li>
                                                <div class="input_wrap">
                                                    <div id="dropDownList5" class="line_type">
                                                        <SelectBox v-model="reasonValue" :isCheckType='true' :selectboxData='reasonData' :allValue='true'></SelectBox>
                                                    </div>
                                                    <i class="ic_ess"></i>
                                                </div>
                                            </li>
                                            <li><textarea v-model="changeAdminReasonContents" id="schedule-description" :class="errorReason.css" data-bind="" class="k-input k-valid" placeholder="(Required) Enter detailed reason" style="width:100%;height:92px;"></textarea></li>
                                            <span v-if="errorReason.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorReason.msg }}</span>

                                        </ul>
                                        <!--e:co-3103 20200420  사이트 ID 입력-->
                                    </div>
                                    
                                    <div class="text_area" v-show="userRole=='Site Admin'">
                                        <p class="k-checkbox-wrapper">
                                            <input v-model="KakaoAgree" @click="kakaoAlert()" type="checkbox" id="signinremember3" name="remember" class="k-checkbox">
                                            <label for="signinremember3" class="k-checkbox-label"><span class="signin-remember-label">I agree to receive Kakao Talk messages.</span></label>
                                            <i class="ic_ess"></i>
                                        </p>
                                    </div>

                                    <div v-show="KakaoAgree==true">
                                        <div class="input_wrap">
                                            <input v-model="kakao" id="" @keyup="checkKakao()" :class="errorKakao.css" name="" type="text" class="k-input" placeholder="인증번호 6자리" />
                                            <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                                            <span v-if="errorKakao.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorKakao.msg }}</span>
                                            <span class="time-limt">03:00</span>
                                        </div>
                                        <div class="text_area pb0">
                                            <p class="q_text">Didn't you get the authentication numbdropDownList1er?</p>
                                            <p><a href="#" @click="kakaoAlert2()" class="btn_text">Re-transfer authentication numbdropDownList1er</a></p>

                                        </div>
                                    </div>

                                        <!--<ul class="find-idpw-block wd_380 bk_side">
                                            <li><span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList" id="loadSchList1" ><label class="k-radio-label" for="loadSchList1">Changing the person</label></span></li>
                                            <li><span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList" id="loadSchList2"><label class="k-radio-label" for="loadSchList2">The resignation of one's</label></span></li>
                                            <li><span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList" id="loadSchList3"><label class="k-radio-label" for="loadSchList3">Etc.</label></span></li>
                                            <li><textarea id="schedule-description" data-bind="" class="k-input k-valid" placeholder="(Required) Enter detailed reason" style="width:100%;height:92px;"></textarea></li>
                                        </ul>-->

                                        <!--<div class="text_area pb0">
                                            <p class="k-checkbox-wrapper">
                                                <input type="checkbox" id="signinremember4" name="remember" class="k-checkbox">
                                                <label for="signinremember4" class="k-checkbox-label"><span class="signin-remember-label">I agree to receive Kakao Talk messages.</span></label>
                                                <i class="ic_ess"></i>
                                            </p>
                                        </div>-->

                                    <ul class="find-idpw-button">
                                        <li><button id="" @click="move('Agreement')" type="button" class="k-button">Cancel</button></li>
                                        <li><button id="" @click="move('JoinComplet')" type="button" class="k-button" >Sign Up</button></li>
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
import SelectBox from "@/components/custom/VueDropdown";
import VueDropdown from "@/components/custom/VueDropdown";
import VueModalSample from '@/views/sample/custom/VueModalSample';
import stringUtils from "@/utils/stringUtils.js";
import commonCode from "@/utils/commonCode.js";
import dataRegex from "@/utils/dataRegex.js";
import axios from '@/api/axios.js';
export default {
  name: "MemberGeneral",
  components: {
    SelectBox,
    VueDropdown,
    VueModalSample
  },
  data: function() {
    return {
        step: 0,
        loadSchList: "",
        signup:{
            // address1:"",
            // address2:"",
            firstName:"",
            lastName:"",
            userRole: "",
            created: false,
            id:"",
            siteName:"",
            industry: "",
            country:""
        },
        sendData:{
            termOfUseList:[],
            firstName:"",
            lastName:"",
            email:"",
            password:"",
            phoneNumber:"",
            role:0,
            //SiteAdmin-신규 사이트 신청
            siteRequest:{
                address1:"",
                address2:"",
                countryCode: "", //공통 코드
                created : false,
                industryCode: "", //공통 코드
                //latitude : 0.0,
                //longtitude : 0.0,
                siteId:"",
                siteName:"",
                weekends:[], //공통 코드
                telephoneNumber:""
                // zipCode:0
            },
            //SiteAdmin-사이트 ID 입력
            changeAdminReasonType:"",
            changeAdminReasonContents:"",
            //SiteAdmin-신규 사이트 신청/사이트 ID 입력 공통
            kakaoTalkAgreement: false,
        },
        id:"", //parameter
        errorId: {
            status: false,
            msg: "",
            css: "k-input"
        },
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
        userRole: "",
        errorUserRole: {
            status: false,
            msg: "",
            css: "k-input"
        },
        userRoleValue: {},
        userRoleData: [
            {
                value: 'Manager',
                key: 'Manager'
            },
            {
                value: 'Guest',
                key: 'Guest'
            },
            {
                value: 'Site Admin',
                key: 'Site Admin'
            }
        ],
        newSiteName: "",
        errorNewSiteName: {
            status: false,
            msg: "",
            css: "k-input"
        },
        industryCode:"",
        industryData: [],
        errorIndustry: {
            status: false,
            msg: "",
            css: "k-input"
        },
        countryCode:"",
        countryData: [],
        errorCountry: {
            status: false,
            msg: "",
            css: "k-input"
        },
        weekends:[],
        weekendsData: [],
        errorWeekends: {
            status: false,
            msg: "",
            css: "k-input"
        },
        telephoneNumber:"",
        errorTelephoneNumber: {
            status: false,
            msg: "",
            css: "k-input"
        },
        siteId: "",
        siteIdBoolean: false,
        errorSiteId: {
            status: false,
            msg: "",
            css: "k-input"
        },
        siteCode: "",
        siteCodeBoolean: false,
        errorSiteCode: {
            status: false,
            msg: "",
            css: "k-input"
        },
        siteName: "",
        reason: {},
        reasonValue: {},
        errorReason: {
            status: false,
            msg: "",
            css: "k-input"
        },
        changeAdminReasonContents:"",
        reasonData: [],
        KakaoAgree : "",
        kakao:"",
        errorKakao: {
            status: false,
            msg: "",
            css: "k-input"
        }
    }
  },
  watch: {
      reasonValue(val) {
          this.reason=val.value;
          if(this.reason=="전체"){
            this.errorReason.css = "k-input k-invalid";
            this.errorReason.status = true;
            this.errorReason.msg = "Error Massage";
          }
      },
      userRoleValue(val) {
        this.userRole=val;

        this.errorUserRole.css = "k-input";
        this.errorUserRole.status = false;
        this.errorUserRole.msg = "";
        this.loadSchList="";
        this.siteId= "";
        this.siteName= "";
        this.siteCode= "";
        this.siteCodeBoolean= false;
        this.siteIdBoolean= false;
      },
      industryCode(val) {
        console.log(val);
        this.errorIndustry.css = "k-input";
        this.errorIndustry.status = false;
        this.errorIndustry.msg = "";
      },
      countryCode(val) {
        console.log(val);
        this.errorCountry.css = "k-input";
        this.errorCountry.status = false;
        this.errorCountry.msg = "";
      },
      weekends(val) {
        console.log(val);
        this.errorWeekends.css = "k-input";
        this.errorWeekends.status = false;
        this.errorWeekends.msg = "";
      }
  },
  methods: {
    mouseDownCheck(){
        if(this.step!=0){
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
        }

        this.id="";
        this.loadSchList="";
        this.mailConfirmData="";
        this.password="";
        this.confirmPassword="";
        this.siteId= "";
        this.siteName= "";
        this.siteCode= "";
        this.siteCodeBoolean= false;
        this.siteIdBoolean= false;
        this.mobile= "";
        this.step=0;
        this.KakaoAgree="";
        this.userRole ="";
        this.reason="";
        this.errorMailConfirmData.status=false;
        this.errorMailConfirmData.msg="";
        this.errorMailConfirmData.css="k-input";
        this.errorPassword.status=false;
        this.errorPassword.msg="";
        this.errorPassword.css="k-input";
        this.errorConfirmPassword.status=false;
        this.errorConfirmPassword.msg="";
        this.errorConfirmPassword.css="k-input";
        this.errorMobile.status=false;
        this.errorMobile.msg="";
        this.errorMobile.css="k-input";
        this.errorSiteId.status=false;
        this.errorSiteId.msg="";
        this.errorSiteId.css="k-input";
        this.errorReason.status=false;
        this.errorReason.msg="";
        this.errorReason.css="k-input";
        this.errorSiteCode.status=false;
        this.errorSiteCode.msg="";
        this.errorSiteCode.css="k-input";
    },
    siteCheck(type){
        let api = this;
        var params = {};
        if(type=='SiteCode'){
            params.siteCode = this.siteCode;
            axios.getApi('/ums/site/siteCode/check', params, "").then(res => {
                // 정상
                this.siteName=res.data.siteName;
                this.siteId=res.data.siteId;
            }).catch(function (error) {
            // TO-DO 에러 처리하기
                if (error.response.status == 400) {
                    api.errorSiteCode.css = "k-input k-invalid";
                    api.errorSiteCode.status = true;
                    api.errorSiteCode.msg = "사용할 수 없는 사이트코드 입니다.";
                    api.siteCodeBoolean = false;
                }
            });
        }else{
            params.siteId = this.siteId;
            axios.getApi('/ums/site/'+this.siteId, "").then(res => {
                // 정상
                this.siteName=res.data.siteName;
            }).catch(function (error) {
                // TO-DO 에러 처리하기
                console.log('Login user error', error);
                // 승인대기 및 라이선스
            });
        }
    },
    kakaoAlert() {
        if(this.mobile==""){
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "휴대폰 번호는 필수 입력항목 입니다.";
            this.KakaoAgree=false;
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
    emailAlert() {
      this.$alert('회원가입을 위한 인증코드가 재발송 되었습니다.', 'Title', {
        title: "Notice",
        confirmButtonText: 'OK',
        dangerouslyUseHTMLString: true,
        callback: action => {
          console.log(action);
        }
      });
    },
    openModalName() {
        this.$refs.modalName.openModal();
    },
    move(page){
        var api=this;
        if(page=="JoinComplet"){
            if(!this.checkFirstName()){
                return;
            }
            if(!this.checkLastName()){
                return;
            }
            if(!this.checkEmail()){
                return;
            }
            if(!this.checkMailConfirmData()){
                return;
            }
            if(!this.checkId()){
                return;
            }
            if(!this.checkPassword()){
                return;
            }
            if(!this.checkConfirmPassword()){
                return;
            }
            if(!this.checkMobile()){
                return;
            }
            if(stringUtils.isEmpty(this.userRole)){
                this.errorUserRole.css = "k-input k-invalid";
                this.errorUserRole.status = true;
                this.errorUserRole.msg = "User Role을 입력하세요.";
                return;
            }
            if(this.userRole=='Manager' || this.userRole=='Guest'){
                if(!api.checkSiteCode()){
                    return;
                }
            }else{
                if(api.loadSchList=='loadSchList1'){
                    if(!api.checkNewSiteName()){
                        return;
                    }
                    if(stringUtils.isEmpty(this.industryCode)){
                        this.errorIndustry.css = "k-input k-invalid";
                        this.errorIndustry.status = true;
                        this.errorIndustry.msg = "업종을 선택하세요.";
                        return;
                    }
                    if (stringUtils.isEmpty(this.countryCode)) {
                        this.errorCountry.css = "k-input k-invalid";
                        this.errorCountry.status = true;
                        this.errorCountry.msg = "국가를 선택하세요.";
                        return;
                    }
                    if(this.weekends.length==0){
                        this.errorWeekends.css = "k-input k-invalid";
                        this.errorWeekends.status = true;
                        this.errorWeekends.msg = "주말을 선택하세요.";
                        return;
                    }
                    if(!api.checkTelephoneNumber()){
                        return;
                    }
                    
                }else{
                    if(!api.checkSiteId()){
                        return;
                    }
                    if(!api.checkSiteId()){
                        return;
                    }
                }
            }


            // this.sendData.termOfUseList = JSON.parse(sessionStorage.getItem('termList'));
            this.sendData.password = this.password;
            this.sendData.firstName=this.firstName;
            this.sendData.lastName=this.lastName;
            this.sendData.email=this.email;
            this.sendData.phoneNumber=this.mobile;
            this.sendData.role=commonCode.userRoleCode(this.userRole);
            this.sendData.siteRequest.industryCode = this.industryCode;
            this.sendData.siteRequest.countryCode = this.countryCode;
            if(this.loadSchList=='loadSchList1'){
                this.sendData.siteRequest.created = true;
            }
            this.sendData.siteRequest.siteId = this.siteId;
            this.sendData.siteRequest.siteName = this.siteName;
            for(var i in this.weekends){
                console.log(this.weekends[i].value);
                this.sendData.siteRequest.weekends.push(this.weekends[i].value);
            }
            this.sendData.changeAdminReasonType = this.reasonValue;
            this.sendData.changeAdminReasonContents = this.changeAdminReasonContents;
            
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
            this.signup.userRole=this.userRole;
            this.signup.created=this.sendData.siteRequest.created;
            this.signup.id=this.id;
            this.signup.siteName=this.siteName;
            if(this.loadSchList=='loadSchList1'){
                this.signup.siteName=this.newSiteName;
            }
            this.signup.industry=commonCode.industry(this.industryCode);
            this.signup.country=commonCode.country(this.countryCode);

            console.log(this.sendData);
            sessionStorage.setItem('signUpInfo', JSON.stringify(this.signup));
            this.$router.push({name : page});
            return;
        }

        this.$router.push({name : page});   
    },
    sendMail(){
        if(!this.checkEmail()){
            return;
        }
        var params = {};
        params.mailType = 1;
        params.to  = this.email;
        params.userName = this.firstName + this.lastName;

        this.step = 1;
        // axios.getApi('/ums/user/email/send', params, "").then(res => {
        //     if(this.step==1){
        //         api.emailAlert();
        //     }
        //     console.log(res.data);
        //     this.step = 1;
        // }).catch(function (error) {
        //     console.log(error)
        // });
    },
    mailConfirm(){
        // let api = this;
        if(!this.checkMailConfirmData()){
            return;
        }
        var params = {};
        params.certNumber = this.mailConfirmData;
        params.key = this.email;
        params.type = 1;
        this.step = 2;
        // axios.getApi('/ums/certNumber/verify', params, "").then(res => {
        //     console.log(res.data);
        //     this.step = 2;
        // }).catch(function (error) {
        //     console.log(error)
        //     api.errorMailConfirmData.css = "k-input k-invalid";
        //     api.errorMailConfirmData.status = true;
        //     api.errorMailConfirmData.msg = "인증번호가 잘못되었습니다.";
        // });
    },
    checkFirstName(){
        if (stringUtils.isEmpty(this.firstName)) {
            console.log(this.firstName);
            this.errorFirstName.css = "k-input k-invalid";
            this.errorFirstName.status = true;
            this.errorFirstName.msg = "이름을 입력하세요.";
            return false;
        }
        if (this.firstName.length > 30) {
            this.errorFirstName.css = "k-input k-invalid";
            this.errorFirstName.status = true;
            this.errorFirstName.msg = "30자까지만 입력할 수 있습니다.";
            return false;
        }
        // 초기화
        this.errorFirstName.css = "k-input";
        this.errorFirstName.status = false;
        this.errorFirstName.msg = "";
        return true;
    },
    checkLastName(){
        if (stringUtils.isEmpty(this.lastName)) {
            this.errorLastName.css = "k-input k-invalid";
            this.errorLastName.status = true;
            this.errorLastName.msg = "성을 입력하세요.";
            return false;
        }
        if (this.lastName.length > 30) {
            this.errorLastName.css = "k-input k-invalid";
            this.errorLastName.status = true;
            this.errorLastName.msg = "30자까지만 입력할 수 있습니다.";
            return false;
        }
        // 초기화
        this.errorLastName.css = "k-input";
        this.errorLastName.status = false;
        this.errorLastName.msg = "";
        return true;
    },
    checkEmail(){
        if (stringUtils.isEmpty(this.email)) {
            this.errorEmail.css = "k-input k-invalid";
            this.errorEmail.status = true;
            this.errorEmail.msg = "이메일을 입력하세요.";
            return false;
        }
        if (this.email.length > 50) {
            this.errorEmail.css = "k-input k-invalid";
            this.errorEmail.status = true;
            this.errorEmail.msg = "50자까지만 입력할 수 있습니다.";
            return false;
        }
        if (!dataRegex.validEmail(this.email)) {
            this.errorEmail.css = "k-input k-invalid";
            this.errorEmail.status = true;
            this.errorEmail.msg = "Email 주소를 잘못 입력하셨습니다.";
            return false;
        }
        // 초기화
        this.errorEmail.css = "k-input";
        this.errorEmail.status = false;
        this.errorEmail.msg = "";
        return true;
    },
    checkMailConfirmData(){
        if (stringUtils.isEmpty(this.mailConfirmData)) {
            this.errorMailConfirmData.css = "k-input k-invalid";
            this.errorMailConfirmData.status = true;
            this.errorMailConfirmData.msg = "인증번호를 입력하세요.";
            return false;
        }
        if (this.mailConfirmData.length !=6 ) {
            this.errorMailConfirmData.css = "k-input k-invalid";
            this.errorMailConfirmData.status = true;
            this.errorMailConfirmData.msg = "인증번호 6자리를 입력하세요.";
            return false;
        }
        // 초기화
        this.errorMailConfirmData.css = "k-input";
        this.errorMailConfirmData.status = false;
        this.errorMailConfirmData.msg = "";
        return true;

    },
    checkId(){
        if (stringUtils.isEmpty(this.id)) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "아이디를 입력하세요.";
            return false;
        }
        if (this.id.length > 16) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "16자까지만 입력할 수 있습니다.";
            return false;
        }
        if (this.id.length < 6) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "5자 이상 입력하셔야 합니다.";
            return false;
        }
        if (dataRegex.validKor(this.id)||dataRegex.validSpc(this.id)) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            //허용되지 않은 문자 – 한글, 특수문자
            this.errorId.msg = "허용하지 않는 문자를 입력하셨습니다.";
            return false;
        }
        // 초기화
        this.errorId.css = "k-input";
        this.errorId.status = false;
        this.errorId.msg = "";
        return true;
    },
    checkPassword(){
        if (stringUtils.isEmpty(this.password)) {
            this.errorPassword.css = "k-input k-invalid";
            this.errorPassword.status = true;
            this.errorPassword.msg = "비밀번호를 입력하세요.";
            return false;
        }
        if (this.password.length > 20) {
            this.errorPassword.css = "k-input k-invalid";
            this.errorPassword.status = true;
            this.errorPassword.msg = "20자까지만 입력할 수 있습니다.";
            return false;
        }
        if (this.password.length < 9) {
            this.errorPassword.css = "k-input k-invalid";
            this.errorPassword.status = true;
            this.errorPassword.msg = "8자 이상 입력하셔야 합니다.";
            return false;
        }
        if(!dataRegex.validPassword(this.password)) {
            this.errorPassword.css = "k-input k-invalid";
            this.errorPassword.status = true;
            this.errorPassword.msg = "비밀번호는 영문, 숫자, 특수문자의 조합으로 입력하셔야 합니다.";
            return false;
        }
        this.errorPassword.css = "k-input";
        this.errorPassword.status = false;
        this.errorPassword.msg = "";
        return true;
    },
    checkConfirmPassword(){
        if (stringUtils.isEmpty(this.confirmPassword)) {
            this.errorConfirmPassword.css = "k-input k-invalid";
            this.errorConfirmPassword.status = true;
            this.errorConfirmPassword.msg = "비밀번호 재입력을 입력하세요.";
            return false;
        }
        if(this.password!=this.confirmPassword) {
            this.errorConfirmPassword.css = "k-input k-invalid";
            this.errorConfirmPassword.status = true;
            this.errorConfirmPassword.msg = "비밀번호가 불일치 합니다.";
            return false;
        }
        this.errorConfirmPassword.css = "k-input";
        this.errorConfirmPassword.status = false;
        this.errorConfirmPassword.msg = "";
        return true;
    },
    checkMobile(){
        if (stringUtils.isEmpty(this.mobile)) {
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "전화번호를 입력하세요.";
            return false;
        }
        if (this.mobile.length > 25) {
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "25자까지만 입력할 수 있습니다.";
            return false;
        }
        if (this.mobile.length < 5) {
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "4자 이상 입력하셔야 합니다.";
            return false;
        }
        if (!dataRegex.validMobile(this.mobile)) {
            this.errorMobile.css = "k-input k-invalid";
            this.errorMobile.status = true;
            this.errorMobile.msg = "허용하지 않는 문자를 입력하셨습니다.";
            return false;
        }
        this.errorMobile.css = "k-input";
        this.errorMobile.status = false;
        this.errorMobile.msg = "";
        return true;
    },
    checkNewSiteName(){
        if (stringUtils.isEmpty(this.newSiteName)) {
            this.errorNewSiteName.css = "k-input k-invalid";
            this.errorNewSiteName.status = true;
            this.errorNewSiteName.msg = "사이트명을 입력하세요.";
            return false;
        }
        if (this.newSiteName.length > 50) {
            this.errorNewSiteName.css = "k-input k-invalid";
            this.errorNewSiteName.status = true;
            this.errorNewSiteName.msg = "50자까지만 입력할 수 있습니다.";
            return false;
        }
        this.errorNewSiteName.css = "k-input";
        this.errorNewSiteName.status = false;
        this.errorNewSiteName.msg = "";
        return true;
    },
    checkTelephoneNumber(){
        if (stringUtils.isEmpty(this.telephoneNumber)) {
            this.errorTelephoneNumber.css = "k-input k-invalid";
            this.errorTelephoneNumber.status = true;
            this.errorTelephoneNumber.msg = "전화번호를 입력하세요.";
            return false;
        }
        if (this.telephoneNumber.length > 25) {
            this.errorTelephoneNumber.css = "k-input k-invalid";
            this.errorTelephoneNumber.status = true;
            this.errorTelephoneNumber.msg = "25자까지만 입력할 수 있습니다.";
            return false;
        }
        if (this.telephoneNumber.length < 5) {
            this.errorTelephoneNumber.css = "k-input k-invalid";
            this.errorTelephoneNumber.status = true;
            this.errorTelephoneNumber.msg = "4자 이상 입력하셔야 합니다.";
            return false;
        }
        if (!dataRegex.validMobile(this.telephoneNumber)) {
            this.errorTelephoneNumber.css = "k-input k-invalid";
            this.errorTelephoneNumber.status = true;
            this.errorTelephoneNumber.msg = "허용하지 않는 문자를 입력하셨습니다.";
            return false;
        }
        this.errorTelephoneNumber.css = "k-input";
        this.errorTelephoneNumber.status = false;
        this.errorTelephoneNumber.msg = "";
        return true;
    },
    checkSiteCode(){
        if (stringUtils.isEmpty(this.siteCode)) {
            this.errorSiteCode.css = "k-input k-invalid";
            this.errorSiteCode.status = true;
            this.errorSiteCode.msg = "사이트코드를 입력하세요.";
            this.siteCodeBoolean = false;
            return false;
        }
        // if (this.siteCode.length!=10) {
        //     this.errorSiteCode.css = "k-input k-invalid";
        //     this.errorSiteCode.status = true;
        //     this.errorSiteCode.msg = "사이트코드 10자리를 입력하셔야 합니다.";
        //     this.siteCodeBoolean = false;
        //     return;
        // }
        // if (dataRegex.validKor(this.siteCode)||dataRegex.validSpc(this.siteCode)) {
        //     this.errorSiteCode.css = "k-input k-invalid";
        //     this.errorSiteCode.status = true;
        //     //허용되지 않은 문자 – 한글, 특수문자
        //     this.errorSiteCode.msg = "허용하지 않는 문자를 입력하셨습니다.";
        //     this.siteCodeBoolean = false;
        //     return;
        // }
        // 초기화
        this.siteName='';
        this.errorSiteCode.css = "k-input";
        this.errorSiteCode.status = false;
        this.errorSiteCode.msg = "";
        this.siteCodeBoolean = true;
        return true;
    },
    checkSiteId(){
        if (stringUtils.isEmpty(this.siteId)) {
            this.errorSiteId.css = "k-input k-invalid";
            this.errorSiteId.status = true;
            this.errorSiteId.msg = "사이트 ID를 입력하세요.";
            this.siteIdBoolean = false;
            return false;
        }
        // if (this.siteId.length!=10) {
        //     this.errorSiteId.css = "k-input k-invalid";
        //     this.errorSiteId.status = true;
        //     this.errorSiteId.msg = "사이트 ID 10자리를 입력하셔야 합니다.";
        //     this.siteIdBoolean = false;
        //     return;
        // }
        // if (dataRegex.validKor(this.siteId)||dataRegex.validSpc(this.siteId)) {
        //     this.errorSiteId.css = "k-input k-invalid";
        //     this.errorSiteId.status = true;
        //     //허용되지 않은 문자 – 한글, 특수문자
        //     this.errorSiteId.msg = "허용하지 않는 문자를 입력하셨습니다.";
        //     this.siteIdBoolean = false;
        //     return;
        // }
        // 초기화
        this.siteName="";
        this.errorSiteId.css = "k-input";
        this.errorSiteId.status = false;
        this.errorSiteId.msg = "";
        this.siteIdBoolean = true;
        return true;
    },
    checkKakao(){
        if (stringUtils.isEmpty(this.kakao)) {
            this.errorKakao.css = "k-input k-invalid";
            this.errorKakao.status = true;
            this.errorKakao.msg = "인증번호를 입력하세요.";
            return false;
        }
        if (this.kakao.length < 7) {
            this.errorKakao.css = "k-input k-invalid";
            this.errorKakao.status = true;
            this.errorKakao.msg = "인증번호 6자리를 입력하세요.";
            return false;
        }
        this.errorKakao.css = "k-input";
        this.errorKakao.status = false;
        this.errorKakao.msg = "";
        return true;
    },
  },
  created() {
    //   this.sendData.termOfUseList = sessionStorage.getItem('termList');
    this.industryData = commonCode.industryData();
    this.countryData = commonCode.countryData();
    this.weekendsData = commonCode.weekendsData();
    this.reasonData = commonCode.reasonData();
  }
}
</script>

<style lang="scss">

</style>