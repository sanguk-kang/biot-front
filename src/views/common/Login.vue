<template>
    <!-- <div class="content">

    </div> -->
    <div id="signin-container">
      <section class="signin-brand-visual"><span class="ir">배경비주얼</span></section>
      <section class="signin-contents">
        <div class="signin-contents-block">
          <h1 class="signin-contents-title"><img src="@/assets/images/common/logo.png" class="signin-logo-img" /></h1>
          <div class="signin-contents-form">

            <form>
              <fieldset class="signin-contents-formfieldset">
                <!-- ID -->
                <div class="input_wrap">
                    <!-- 오류경우 input 클래스  k-invalid 추가-->
                    <input id="userId" name="userId" type="text" :class="errorId.css" placeholder="ID" 
                        v-model="userId" @keyup="checkId"/>
                    <!-- 오류있을 경우    -->
                    <span v-if="errorId.status" class="k-tooltip-validation k-invalid-msg" data-for="">{{ errorId.msg }}</span>
                    <i class="signin-input-remove ic ic-bt-input-remove "></i>
                    <!-- show 추가시 보여짐 -->
                </div>
                <!-- PWD -->
                <div class="input_wrap">
                    <!-- 오류경우 input 클래스  k-invalid 추가-->
                    <input id="userPassword" name="userPassword" type="password" :class="errorPwd.css" placeholder="PASSWORD" 
                        v-model="userPassword" @keyup="checkPassword"/>
                    <!-- 오류있을 경우 -->
                    <span v-if="errorPwd.status" class="k-tooltip-validation k-invalid-msg" data-for="signin-id">{{ errorPwd.msg }}</span>
                  <i class="signin-input-remove ic ic-bt-input-remove" data-target=""></i>
                </div>
                <div class="input_wrap checkid">
                  <span class="k-checkbox-wrapper">
                    <input type="checkbox" id="signinremember" name="remember" class="k-checkbox" checked="checked" v-model="checkValue">
                    <label for="signinremember" class="k-checkbox-label"><span class="signin-remember-label">Remember my ID</span></label>
                  </span>

                </div>
                <div class="signin-form-block">
                  <button id="signin-login" type="button" class="k-button" :disabled="btnDisabled" @click="apiOauthLogin">Sign in</button>
                </div>
                <div class="signin-form-block">
                  <ul class="textlink-list">
                    <li><a href="/front/signup" class="btn_text" target="_self">Find ID</a></li>
                    <li><a class="btn_text" target="_self" @click="movePage('AuthenticateForChangingPassword')" style="cursor: pointer;">Reset password</a></li>
                    <li><a class="btn_text" target="_self" @click="movePage('MemberTypeSelect')" style="cursor: pointer;">Sign up / Create new ID</a></li>
                  </ul>
                </div>
              </fieldset>
            </form>
            <footer class="signin-footer">Copyright© Samsung Electronics Co., Ltd.</footer>
          </div>
        </div>
      </section>
    </div>
</template>

<script>
import axios from '@/api/axios.js';
import stringUtils from "@/utils/stringUtils.js";

export default {
  name: "Login",
  components: {},
  props: [],
  data: function() {
    return {
        msg: "Login Page",
        userId: "",
        userPassword: "",
        errorId: {
            status: false,
            msg: "",
            css: "k-input"
        },
        errorPwd: {
            status: false,
            msg: "",
            css: "k-input"
        },
        btnDisabled: true,
        checkValue: false,
        myIp: '',
        myLatitude: '',
        myLongitude: ''
    }
  },
  methods: {
    movePage(page) {
      this.$router.push({name : page});
    },
    checkBtnValidation() {
        // 입력값 확인
        if (stringUtils.isEmpty(this.userId) || stringUtils.isEmpty(this.userPassword)) {
            this.btnDisabled = true;
            return;
        }
        // 에러코드 확인
        if (!this.errorId.status && !this.errorPwd.status) {
            this.btnDisabled = false;   // 정상
        } else {
            this.btnDisabled = true;    // 실패
        }
        // 정상인 경우 엔터 로그인
        if (!this.btnDisabled) {
            this.enterInput();
        }
    },
    checkId() {
        // 에러 체크
        if (stringUtils.isEmpty(this.userId)) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "ID를 입력하세요.";
            return;
        } if (this.userId.length < 5) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "5자 이상 입력하셔야 합니다.";
            return;
        } if (this.userId.length > 16) {
            this.errorId.css = "k-input k-invalid";
            this.errorId.status = true;
            this.errorId.msg = "16자까지만 입력할 수 있습니다.";
            return;
        }
        // 초기화
        this.errorId.css = "k-input";
        this.errorId.status = false;
        this.errorId.msg = "";
        this.checkBtnValidation();
    },
    checkPassword() {
        // 에러 체크
        if (stringUtils.isEmpty(this.userPassword)) {
            this.errorPwd.css = "k-input k-invalid";
            this.errorPwd.status = true;
            this.errorPwd.msg = "비밀번호를 입력하세요.";
            return;
        } if (this.userPassword.length < 8) {
            this.errorPwd.css = "k-input k-invalid";
            this.errorPwd.status = true;
            this.errorPwd.msg = "8자 이상 입력하셔야 합니다.";
            return;
        } if (this.userPassword.length > 20) {
            this.errorPwd.css = "k-input k-invalid";
            this.errorPwd.status = true;
            this.errorPwd.msg = "20자까지만 입력할 수 있습니다.";
            return;
        }
        // 초기화
        this.errorPwd.css = "k-input";
        this.errorPwd.status = false;
        this.errorPwd.msg = "";
        this.checkBtnValidation();
    },
    enterInput() {
        if(event.keyCode == 13) {
            this.apiOauthLogin();
        }
    },
    setUserCookies() {
        // 쿠키 처리
        if (this.checkValue) {
            this.$cookies.set('checked', this.checkValue);
            this.$cookies.set('userId', this.userId);
        } else {
            this.$cookies.remove('checked');
            this.$cookies.remove('userId');
        }
    },
    apiOauthLogin() {
        // 쿠키 셋팅
        this.setUserCookies();
        // base64 Encoding
        var baseEncoding = btoa(this.userId + ":" + this.userPassword);
        // 로그인 header 셋팅
        var apiHeader = {
            headers: {
                'accept': 'application/json',
                'authorization': 'Basic ' + baseEncoding            
            }
        }
        
        let api = this;
        // 로그인 api 호출('/api/users')
        axios.postApi('/api/login', "", apiHeader).then(res => {
            // 정상
            if (res.status == 200) {
                //  token 저장
                var tokenInfo = {
                    'token': res.data.access_token,
                    'tokenType': res.data.token_type
                }
                sessionStorage.setItem('tokenInfo', JSON.stringify(tokenInfo));
                // user 로그인
                api.loginUserInfo();
            }
        }).catch(function (error) {
            // TO-DO 에러 처리하기
            if (error.response.status == 400) {
                sessionStorage.removeItem('tokenInfo');
                // 에러 팝업
                api.$alert('로그인 에러', 'Title', {
                    title: "알람",
                    confirmButtonText: 'OK',
                    dangerouslyUseHTMLString: true,
                    callback: action => {
                        console.log(action);
                    }
                });
            }
            console.log('Login error', error.response);
        });
    },
    loginUserInfo() {
      // ip 정보 조회
        this.getMyIpInfo()
        let win = this;
        setTimeout(function() {
          console.log('settime test', win.myIp);
          win.getMyPosition(); // 위치 확인
        }, 3000);
        console.log('>>> check', this.myIp);
        // 위도 경도
    },
    apiUserInfo() {
        let api = this;
        console.log('apiUserInfo >>>>', this.myLatitude, this.myLongitude);
        axios.getApi('/ums/user/'+this.userId, "").then(res => {
            // 정상
            console.log("테스트 조회", res);
            sessionStorage.setItem('userInfo', JSON.stringify(res.data));
            api.saveSessionStorage(res.data);
            // 임시 화면 이동
            api.movePage('Main');
        }).catch(function (error) {
            // TO-DO 에러 처리하기
            console.log('Login user error', error);
            // 승인대기 및 라이선스
        });
    },
    saveSessionStorage(info) {
        var tempMenu = [];
        info.userToRoles.forEach(element => {
            // main
            if (element.roleId === info.mainRole) {
                tempMenu = JSON.parse(JSON.stringify(element.roleMenus));
            }
        });
        // sessionStorage 추가
        sessionStorage.setItem('menuInfo', JSON.stringify(tempMenu));
    },
    initLogin() {
        // cookies
        if (!stringUtils.isEmpty(this.$cookies.get('checked'))) {
            this.checkValue = this.$cookies.get('checked');
        }
        // Remember my ID
        if (!stringUtils.isEmpty(this.$cookies.get('userId'))) {
            this.userId = this.$cookies.get('userId');
        }
    },
    getMyIpInfo() {
      // ip 갖고오기
      var head = document.getElementsByTagName('head')[0];
      var script= document.createElement('script');
      let win = this;
      window.getIP = function(json) {
        win.myIp = json.ip; // ip info
      };
      script.type= 'text/javascript';
      script.src= 'https://api.ipify.org?format=jsonp&callback=getIP';
      head.appendChild(script);
    },
    getMyPosition() {
      // 로그인 위도 경도 체크
      let win = this;
      navigator.geolocation.getCurrentPosition(function(pos) {
        win.myLatitude = pos.coords.latitude;
        win.myLongitude = pos.coords.longitude;
        console.log('getMyPosition result', win.myLatitude, win.myLongitude);
        win.apiUserInfo();
      }, function(error) {   
        console.log('Error getMyPosition. Error code: ' + error.code);
        win.apiUserInfo();
      });
    }
  },
  created() {
      this.initLogin();
  },
  mounted() {
  },
  destroyed() {
  }
}
</script>

<style lang="scss">

</style>