<template>
  <sweet-modal ref="TermsConditionModal" overlay-theme="dark" id="sweet_modal_style">
    <!-- 모달 기본 스타일 시작 -->
    <!-- 모달 제목 영역 S-->
    <div class="sweet_modal_title">개정안내</div>
    <!-- Accordion 모달 내용 영역 S-->
    <br />다음과 같이 약관이 개정되어 안내 드립니다.
    <br />공지기간 동안은 동의 없이 b.IoT Cloud 이용이 가능하지만, 효력이 발생하는 시행일 이후는
    동의 후 이용하실 수 있습니다.
    <br />개정된 사항은 다음과 같습니다.
    <br />
    <br />
    <div v-for="item in termsDataList" :key="item.id">
      <div v-if="item.type===3001">
        <h3>이용약관 개정</h3>
        <br />
        공지일 : {{item.notifyDate}}
        <br />
        시행일 : {{item.effectiveDate}}
        <br />
        <br />상세한 개정내용은 신구 대조표와
        <a href="openModalName()">약관전문보기</a>를 확인하시기 바랍니다.
        <TermsContentsModal ref="termsContentsModal"></TermsContentsModal>
        <br />
        <br />
        <p class="k-checkbox-wrapper">
          <input type="checkbox" id="termsRemember3" name="remember" class="k-checkbox" />
          <label for="termsRemember3" class="k-checkbox-label">
            <span class="terms-remember-label">동의합니다.</span>
          </label>
          <i class="ic_ess"></i>
        </p>
        <br />
      </div>
      <div v-else-if="item.type===3002">
        <h3>개인정보 처리방침 개정</h3>
        <br />
        공지일 : {{item.notifyDate}}
        <br />
        시행일 : {{item.effectiveDate}}
        <br />
        <br />상세한 개정내용은 신구 대조표와
        <a @click="openModalName()">약관전문보기</a>를 확인하시기 바랍니다.
        <TermsContentsModal ref="TermsContentsModal"></TermsContentsModal>
        <br />
        <br />
        <p class="k-checkbox-wrapper">
          <input type="checkbox" id="termsRemember3" name="remember" class="k-checkbox" />
          <label for="termsRemember3" class="k-checkbox-label">
            <span class="terms-remember-label">동의합니다.</span>
          </label>
          <i class="ic_ess"></i>
        </p>
        <br />
      </div>
      <br />
    </div>
    <br />이의제기 및 문의
    <br />-개정약관 내용에 대한 문의와 이의제기는 관제센터
    <a href="mailto:bcloud.sec@samsung.com">(bcloud.sec@samsung.com)</a>로 문의해 주십시오.
    <br />-개정약관에 동의하지 않으시는 경우, 회원탈퇴를 요청하실 수 있습니다.
    <br />
    <br />
    <br />감사합니다.
    <!-- 모달 전체 버튼 영역 S-->
    <div class="sweet_modal_buttongroup">
      <button type="button" @click="closeModal" class="k-button">OK</button>
      <button type="button" @click="openModal" class="k-button">Close</button>
    </div>
    <!-- 모달 기본 스타일 끝 -->
  </sweet-modal>
</template>



<script>
import axios from "@/api/axios.js";
import TermsContentsModal from "@/views/common/sign-in/TermsContentsModal";

export default {
  name: "TermsConditionModal",
  components: {
    TermsContentsModal
  },

  data() {
    return {
      id: "",
      termsDataList: []
    };
  },
  methods: {
    movePage(page) {
      this.$router.push({ name: page });
    },

    getTermsData() {
      // this.id = JSON.parse(sessionStorage.getItem('userInfo')).id;
      // console.log(this.id);
      // axios
      // .getApi('/ums/tos/revised?userId=',"")
      axios
        .getApi("/ums/tos/revised?userId=testGuest", "")
        .then(res => {
          this.termsDataList = res.data;
          console.log("결과", this.termsDataList);
        })
        .catch(function(error) {
          if (error.response.status == 400) {
            console.log("Error Status 400");
            this.movePage("ErrorPage");
          }
        });
    },

    openModal() {
      this.$refs.TermsConditionModal.open();
    },
    closeModal() {
      this.$refs.TermsConditionModal.close();
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
    openModalName() {
      this.$refs.TermsConditionModal.openModal();
    }

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


  created() {
    this.getTermsData();
  },
  mounted() {},
  destroyed() {}
};
</script>

<style lang="scss" scoped>
</style>