<template>
  <div class="content newWin">
      <section class="cont_wrap">
        <div class="cont al_center ic_err">
          <!-- 403 에러 -->
          <div v-if="errorCode == 403">
            <p class="head_text">요청하신 페이지의 접근권한이 없습니다. </p>
            <p class="err_text">페이지 권한이 있는지 확인해 주십시오. <br/> 동일한 문제가 지속적으로 발생할 경우 관제센터로 문의해 주십시오. </p>
          </div>
          <!-- 404 에러 -->
          <div v-else-if="errorCode == 404">
            <p class="head_text">The page you requested could not be found.</p>
            <p class="err_text">Please check the page address again.<br/> If the same problem persists, please contact the control center.</p>
          </div>
          <!-- 5XX 에러 -->
          <div v-else>
            <p class="head_text">일시적인 장애로 서비스가 중단되었습니다.</p>
            <p class="err_text">잠시 뒤 다시 이용해 주십시오.<br/> 동일한 문제가 지속적으로 발생할 경우 관제센터로 문의해 주십시오.</p>
          </div>
          <!-- home 버튼 -->
          <p><button id="" type="button" class="k-button" @click="goHome">Go Home</button></p>
          <!-- 링크 -->
          <div class="bot_text">Control Center Inquiry
            <a href="#" class="btn_text">bcloud.sec@samsung.com</a>
          </div>
        </div>
    </section>
  </div>
</template>

<script>
import stringUtils from "@/utils/stringUtils.js";

export default {
  name: "ErrorPage",
  data: function() {
    return {
      errorCode: 0
    }
  },
  methods: {
    goHome() {
      this.$router.push({name : "Main"});
    }
  },
  created() {
    console.log('error code', this.$route.params.code);
    this.msg = this.$route.params.code + " 에러 입니다.";
    this.errorCode = stringUtils.isEmpty(this.$route.params.code) ? 404 : this.$route.params.code;
  }
}
</script>

<style lang="scss">

</style>