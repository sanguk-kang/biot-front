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
                <br /><h3 class="find-contents-title">비밀번호 재설정 완료</h3>

                <p class="reset_end">{{this.userId}}님의 비밀번호가 성공적으로 재설정되었습니다.</p>

                <div class="signin-form-block">
                  <button
                    id="signin-login"
                    type="button"
                    class="k-button"
                    @click="movePage('Login')"
                  >로그인</button>
              <footer class="signin-footer">Copyright© Samsung Electronics Co., Ltd.</footer>
            </div>
          </div>
          </div>
        </section>
      </div>
      <!-- //DAFT : 작업영역 끝 -->
    </div>
  </div>
</template>

<script>

export default {

  name: "ConfirmChangingPassword",

 data() {
    return {
      lastName: "",
      firstName: "",
      userId: ""
    };
  },

  methods: {
    movePage(page) {
      this.$router.push({ name: page });
    },
     created() {
    this.lastName = JSON.parse(sessionStorage.getItem("userInfo")).lastName;
    this.firstName = JSON.parse(sessionStorage.getItem("userInfo")).firstName;
    console.log(JSON.parse(sessionStorage.getItem("userInfo")));
    console.log(this.lastName);
    console.log(this.firstName);
    this.userId = sessionStorage.getItem('userId');
    console.log('userId : ' + this.userId);
     }
  }
};
</script>