<template>
  <div class="content">
    <div id="sign_main" class>
      <!-- DAFT : 작업영역 시작 -->
      <!-- 세로 가운데 정렬 일때 flex_al_center -->
      <div id="signin-container" class="flex_al_center">
        <section class="signin-brand-visual">
          <span class="ir">배경비주얼</span>
        </section>
        <section class="signin-contents">
          <div class="signin-contents-block">
            <h1 class="signin-contents-title">
              <img src="@/assets/images/common/logo.png" class="signin-logo-img" />
            </h1>
            <div class="signin-contents-form">
                  <br />
    <h3 class="find-contents-title">비밀번호 재설정</h3>

    <form>
      <fieldset class="signin-contents-formfieldset">
        <ul class="find-idpw-block">
          <li>
            <div class="input_wrap">
              <div class="search_input_wrap">
                <input id="inputId" name="inputId" class="k-input" type="text" placeholder="ID" />
                <span class="ic ic-bt-input-remove" @click="eraseId()" style="display:block;"></span>
              </div>
            </div>
          </li>
          <li>
            <div class="input_wrap">
              <div class="search_input_wrap">
                <input
                  id="inputEmail"
                  name="inputEmail"
                  class="k-input"
                  type="email"
                  placeholder="Email"
                />
                <span class="ic ic-bt-input-remove" @click="eraseEmail()" style="display:block;"></span>
              </div>
            </div>
          </li>
          <li>
            <button
              id="btnSendAuthenticationEmail"
              type="button"
              class="k-button"
              disabled="disabled"
              
             >인증메일 발송</button>
            </li>
        </ul>

        <ul class="find-idpw-button">
          <li>
            <button id="btnCancel" type="button" class="k-button" @click="openConfirm()">취소</button>
          </li>
          <li>
            <button
              id="btnChange"
              type="button"
              class="k-button"

              @click="movePageTo('ChangePassword')"
            >비밀번호 설정</button>
          </li>
        </ul>
      </fieldset>
    </form>
              <footer class="signin-footer">Copyright© Samsung Electronics Co., Ltd.</footer>
            </div>
          </div>
        </section>
      </div>
      <!-- //DAFT : 작업영역 끝 -->
    </div>
  </div>
</template>

<script>
// import axios from "@/api/axios.js";

export default {
  name: "AuthenticateForChangingPassword",

  data() {
    return {
      userId: "",
      userDataList: []
    }
  },

  methods: {
     movePage(page) {
      this.$router.push({name : page});
    },

    movePageTo(page) {
sessionStorage.setItem('userId', document.getElementById('inputId').value);
      this.movePage(page);
    },
    
    checkEmailForm(email) {
      var regex= /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(document.getElementById('inputId').value != "" && document.getElementById('inputEmail').value != "" && regex.test(email)) {
          document.getElementById('btnSendAuthenticationEmail').removeAttribute('disabled');
      }
      else {
                  document.getElementById('btnSendAuthenticationEmail').setAttribute('disabled', 'disabled');

      }
    },

    // checkAuthentication() {
    //   var inputId = document.getElementById('inputId').value;
    //   axios.getApi('/ums/user/' + inputId).then(res => {
    //         this.userDataList = res.data;
    //                     console.log("테스트 조회", this.userDataList);
    //     }).catch(function (error) {
    //        if (error.response.status == 400) {
    //         console.log("Error Status 400");
    //         this.movePage("ErrorPage");
    //        }
    //     });
    //     if(this.userDataList === inputId) {
    //       // document.getElementById('btnSendAuthenticationEmail').removeAttribute('disabled');
    //     }
    // },
    eraseId() {
      document.getElementById('inputId').value = ""; 
    },
    eraseEmail() {
      document.getElementById('inputEmail').value = "";
    }
  },

created() {
      this.checkEmailForm(document.getElementById('inputEmail').value);
},
  
};
</script>