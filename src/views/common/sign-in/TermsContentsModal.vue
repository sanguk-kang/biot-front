<template>
  <sweet-modal ref="TermsContentsModal" overlay-theme="dark" id="sweet_modal_style">
    <!-- 모달 기본 스타일 시작 -->
    <!-- 모달 제목 영역 S-->
    <div class="sweet_modal_title">개정안내</div>
    <!-- Accordion 모달 내용 영역 S-->
    다음과 같이 약관이 개정되어 안내 드립니다.

    <!-- 모달 전체 버튼 영역 S-->
    <div class="sweet_modal_buttongroup">
      <button type="button" @click="closeModal" class="k-button">OK</button>
      <button type="button" @click="moveToHome()" class="k-button">Close</button>
    </div>
    <!-- 모달 기본 스타일 끝 -->
  </sweet-modal>
</template>



<script>
// import axios from "@/api/axios.js";

export default {
  name: "TermsContentsModal",
  data() {
    return {
      termsDataList: []
    };
  },
  methods: {
    movePage(page) {
      this.$router.push({ name: page });
    },

    getTermsData() {
      // axios
      //   .getApi("ums/tos/revised", "")
      //   .then(res => {
      //     this.termsDataList = res.data;
      //     console.log("결과", this.termsDataList);
      //   })
      //   .catch(function(error) {
      //     if (error.response.status == 400) console.log("Error Status 400");
      //   });
    },

    openModal() {
      this.$refs.TermsContentsModal.open();
    },
    closeModal() {
      this.$refs.TermsContentsModal.close();
    },

    openAlert() {
      this.$alert(
        "본 개정에 동의하지 않으시는 경우 서비스를 이용할 수 없습니다.<br>자세한 사항은 관제센터로 문의하시기 바랍니다.",
        "Title",
        {
          title: "알림",
          confirmButtonText: "OK",
          dangerouslyUseHTMLString: true,
          callback: action => {
            console.log(action);
          }
        }
      );
    },


    // moveToHome() {
    //   var date = new Date();
    //   var today =
    //     date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
    //   var termsDataList = this.getTermsData();
    //   var formattedEffectiveDate =
    //     termsDataList.effectiveDate.getFullYear() +
    //     "-" +
    //     termsDataList.effectiveDate.getMonth() +
    //     "-" +
    //     termsDataList.effectiveDate.getDate();
    //   if (eval(formattedEffectiveDate) < eval(today)) {
    //     this.movePage("Login");
    //   } else {
    //     this.movePage("Login");
    //   }
    // }
  },
  created() {},
  mounted() {},
  destroyed() {}
};
</script>

<style lang="scss" scoped>
</style>