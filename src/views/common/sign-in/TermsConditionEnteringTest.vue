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
              <h2 class="find-contents-title">개정안내</h2>
              <button
                type="button"
                @click="openModalName()"
                class="btn_normal"
              >개정안내 보기</button>
              <TermsConditionModal ref="TermsConditionModal"></TermsConditionModal>
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
import TermsConditionModal from "@/views/common/sign-in/TermsConditionModal";

export default {
  name: "TermsConditionEnteringTest",

  components: {
    TermsConditionModal  
  },

  methods: {
      openModalName() {
          this.$refs.TermsConditionModal.openModal();
      }
  },
};
</script>