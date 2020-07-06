<template>
  <sweet-modal ref="ConfirmChangingPasswordModal" overlay-theme="dark" id="sweet_modal_style">
    <!-- 모달 기본 스타일 시작 -->
    <!-- 모달 제목 영역 S-->
    <div class="sweet_modal_title">비밀번호 재설정 완료</div>
    <div class="sweet_modal_content">
        <!-- DAFT : 작업영역 시작 -->
        <!-- 세로 가운데 정렬 일때 flex_al_center -->
                <br /><h3 class="find-contents-title">비밀번호 재설정 완료</h3>

                <p class="reset_end">{{userId}}님의 비밀번호가 성공적으로 재설정되었습니다.</p>

                <div class="signin-form-block">
                  <button
                    id="signin-login"
                    type="button"
                    class="k-button"
                    @click="movePage('Login')"
                  >로그인</button>
                </div>
                </div>
                        <!-- //DAFT : 작업영역 끝 -->
    <!-- 모달 기본 스타일 끝 -->
  </sweet-modal>
</template>

<script>

export default {
  name: "ConfirmChangingPasswordModal",

  data() {
    return {
      userDataList: [],
      lastName: "",
      firstName: "",
      userId: ""
    };
  },

  methods: {
    movePage(page) {
      this.$router.push({ name: page });
    },
    openModal() {
      this.$refs.ConfirmChangingPasswordModal.open();
    },
    closeModal() {
      this.$refs.ConfirmChangingPasswordModal.close();
    },
  },
  created() {
    this.lastName = JSON.parse(sessionStorage.getItem("userInfo")).lastName;
    this.firstName = JSON.parse(sessionStorage.getItem("userInfo")).firstName;
    console.log(JSON.parse(sessionStorage.getItem("userInfo")));
    console.log(this.lastName);
    console.log(this.firstName);
      this.userId = sessionStorage.getItem('userId');
  }
};
</script>