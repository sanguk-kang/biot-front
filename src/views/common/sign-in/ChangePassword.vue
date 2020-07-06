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
              <h2 class="find-contents-title">비밀번호 입력</h2>
              <form>
                <fieldset class="signin-contents-formfieldset">
                  <ul class="find-idpw-block">
                    <li>
                      <div class="input_wrap">
                        <input
                          id="password"
                          name
                          type="password"
                          :class="errorPwd.css"
                          placeholder="Password"
                          v-model="password"
                          @keyup="checkPassword"
                          autofocus
                        />
                        <span
                          v-if="errorPwd.status"
                          class="k-tooltip-validation k-invalid-msg"
                          data-for
                        >{{ errorPwd.msg }}</span>
                        <i class="signin-input-remove ic ic-bt-input-remove" data-target></i>
                      </div>
                    </li>
                    <li>
                      <div class="input_wrap">
                        <input
                          id="confirmPassword"
                          name
                          type="password"
                          class="k-input"
                          placeholder="Confirm Password"
                          v-model="confirmPassword"
                          @keyup="checkConfirmPassword"
                        />
                        <span
                          v-if="errorPwd.status"
                          class="k-tooltip-validation k-invalid-msg"
                          data-for
                        >{{ errorPwd.msg }}</span>
                        <i class="signin-input-remove ic ic-bt-input-remove" data-target></i>
                      </div>
                    </li>
                  </ul>

                  <ul class="find-idpw-button">
                    <li>
                      <button
                        id="btnCancel"
                        type="button"
                        class="k-button"
                        @click="openConfirm()"
                      >취소</button>
                    </li>
                    <li>
                      <button
                        id="btnChange"
                        type="button"
                        class="k-button"
                        disabled="disabled"
                        @click="saveChangedPasswordAndReturnToSignInPage()"
                      >변경하기</button>
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
import stringUtils from "@/utils/stringUtils.js";

export default {
  name: "ChangePassword",

  data() {
    return {
      password: "",
      confirmPassword: "",
      userId: "",
      errorPwd: {
        status: false,
        msg: "",
        css: "k-input"
      }
    };
  },

  methods: {
    movePage(page) {
      this.$router.push({ name: page });
    },

        openConfirm() {
        this.$confirm('비밀번호 재설정을 취소하시겠습니까?<br>확인 시 로그인 화면으로 이동합니다.', 'Warning', {
          title: "Confirm",
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: '',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          dangerouslyUseHTMLString: true
        }).then(() => {
          this.movePage('Login');
          console.log('Returning to Sign-in completed');
        }).catch(() => {
          console.log('Returning to Sign-in canceled');
        });
      },

    checkPassword() {
      var regType = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[#?!@$%^&*-])[A-Za-z\d#?!@$%^&*-]$/;
      if (stringUtils.isEmpty(this.password)) {
        this.errorPwd.css = "k-input k-invalid";
        this.errorPwd.status = true;
        this.errorPwd.msg = "비밀번호를 입력하세요.";
        document
          .getElementById("btnChange")
          .setAttribute("disabled", "disabled");
        return;
      }
      if (this.password.length < 8) {
        this.errorPwd.css = "k-input k-invalid";
        this.errorPwd.status = true;
        this.errorPwd.msg = "8자 이상 입력하셔야 합니다.";
        document
          .getElementById("btnChange")
          .setAttribute("disabled", "disabled");

        return;
      }
      if (this.password.length > 20) {
        this.errorPwd.css = "k-input k-invalid";
        this.errorPwd.status = true;
        this.errorPwd.msg = "20자까지만 입력할 수 있습니다.";
        document
          .getElementById("btnChange")
          .setAttribute("disabled", "disabled");

        return;
      }
      if (regType.test(document.getElementById("password").value) === false) {
        // #?!@$%^&*-
        this.errorPwd.css = "k-input k-invalid";
        this.errorPwd.status = true;
        this.errorPwd.msg =
          "비밀번호는 영문, 숫자, 특수문자의 조합으로 입력하셔야 합니다.";
        document
          .getElementById("btnChange")
          .setAttribute("disabled", "disabled");

        return;
      }
      if (
        document.getElementById("password").value !=
        document.getElementById("confirmPassword").value
      ) {
        this.errorPwd.css = "k-input k-invalid";
        this.errorPwd.status = true;
        this.errorPwd.msg = "비밀번호가 불일치합니다.";
        document
          .getElementById("btnChange")
          .setAttribute("disabled", "disabled");

        return;
      }
      if (
        document.getElementById("password").value ===
        document.getElementById("confirmPassword").value
      ) {
        document.getElementById("btnChange").removeAttribute("disabled");
      }
      this.errorPwd.css = "k-input";
      this.errorPwd.status = false;
      this.errorPwd.msg = "";
    },

    checkConfirmPassword() {
      if (
        document.getElementById("password").value !=
        document.getElementById("confirmPassword").value
      ) {
        this.errorPwd.css = "k-input k-invalid";
        this.errorPwd.status = true;
        this.errorPwd.msg = "비밀번호가 불일치합니다.";
        document
          .getElementById("btnChange")
          .setAttribute("disabled", "disabled");

        return;
      }
      if (
        document.getElementById("password").value ===
        document.getElementById("confirmPassword").value
      ) {
        document.getElementById("btnChange").removeAttribute("disabled");
        return;
      }
      this.errorPwd.css = "k-input";
      this.errorPwd.status = false;
      this.errorPwd.msg = "";
    },

    saveChangedPasswordAndReturnToSignInPage() {
      // var param = {
      //   "password": this.confirmPassword,
      //   "userId": this.id
      // };
      // axios.postApi("/ums/user/" + param.userId + "/password", param, "");

      this.movePage("ConfirmChangingPassword");
    }
  },

  created() {
    // this.id = JSON.parse(sessionStorage.getItem('userInfo')).id;
    // console.log(this.id);
    this.userId = sessionStorage.getItem('userId')
  }
};
</script>