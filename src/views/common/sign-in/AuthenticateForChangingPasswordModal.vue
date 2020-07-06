<template>
  <sweet-modal ref="AuthenticateForChangingPasswordModal" overlay-theme="dark" id="sweet_modal_style">
    <!-- 모달 기본 스타일 시작 -->
    <!-- 모달 제목 영역 S-->
    <div class="sweet_modal_title">비밀번호 재설정</div>

    <!-- DAFT : 작업영역 시작 -->
    <!-- 세로 가운데 정렬 일때 flex_al_center -->
    <br />
    <h3 class="find-contents-title">비밀번호 재설정</h3>

    <form>
      <fieldset class="signin-contents-formfieldset">
        <ul class="find-idpw-block">
          <li>
            <div class="input_wrap">
              <div class="search_input_wrap">
                <input id="inputId" name="id" class="k-input" type="text" v-model="id" placeholder="ID" />
                <span class="ic ic-bt-input-remove" style="display:block;"></span>
              </div>
            </div>
          </li>
          <li>
            <div class="input_wrap">
              <div class="search_input_wrap">
                <input
                  id="inputEmail"
                  name="email"
                  class="k-input"
                  type="email"
                  v-model="email"
                  placeholder="Email"
                />
                <span class="ic ic-bt-input-remove" style="display:block;"></span>
              </div>
            </div>
          </li>
          <li>
            <button
              id="btnSendAuthenticationEmail"
              type="button"
              class="k-button"
              @click="sendAuthenticationEmail()"
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

              @click="openModalName()"
            >비밀번호 설정</button>
            <ChangePasswordModal ref="ChangePasswordModal"></ChangePasswordModal>
          </li>
        </ul>
      </fieldset>
    </form>
    <!-- //DAFT : 작업영역 끝 -->
    <!-- 모달 기본 스타일 끝 -->
  </sweet-modal>
</template>

<script>
import ChangePasswordModal from "@/views/common/sign-in/ChangePasswordModal";
export default {
  name: "AuthenticateForChangingPasswordModal",

components: {
ChangePasswordModal
},

  data() {
    return {
      id: "",
      email: ""

    };
  },


  methods: {
    movePage(page) {
      this.$router.push({ name: page });
    },
    openModal() {
      this.$refs.AuthenticateForChangingPasswordModal.open();
    },
    closeModal() {
      this.$refs.AuthenticateForChangingPasswordModal.close();
    },
        openModalName() {
      this.$refs.ChangePasswordModal.openModal();
      // this.$refs.AuthenticateForChangingPassword.closeModal();
    },
    openConfirm() {
      this.$confirm(
        "비밀번호 재설정을 취소하시겠습니까?<br>확인 시 로그인 화면으로 이동합니다.",
        "Warning",
        {
          title: "Confirm",
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "",
          closeOnClickModal: false,
          closeOnPressEscape: false,
          dangerouslyUseHTMLString: true
        }
      )
        .then(() => {
          this.movePage("Login");
          console.log("Returning to Sign-in completed");
        })
        .catch(() => {
          console.log("Returning to Sign-in canceled");
        });
    },
    // checkInputBox() {
    //     var inputId = document.getElementById('inputId');
    //     var inputEmail = document.getElementById('inputEmail');
    //     if(inputId != "" && inputEmail != "") {
    //     }
    // },

    created() {
      this.lastName = JSON.parse(sessionStorage.getItem("userInfo")).lastName;
      this.firstName = JSON.parse(sessionStorage.getItem("userInfo")).firstName;
      console.log(JSON.parse(sessionStorage.getItem("userInfo")));
      console.log(this.lastName);
      console.log(this.firstName);
    }
  }
};
</script>