<template>
  <header id="main-header">
    <nav class="main-top-nav" data-role="mainnavtooltip">
      <span class="main-top-nav-text">Gangnam-gu, Seoul</span>
      <span class="main-top-nav-weather sunny">3℃ / 8℃</span>
      <span class="main-top-nav-text">Humidity 28%</span>
      <span class="main-top-nav-text">
        Fine Dust
        <span class="st_verypoor">Very Poor</span>
      </span>
      <span class="main-top-nav-text">
        Ultrafine Dust
        <span class="st_normal">Normal</span>
      </span>
      <span class="main-top-nav-clean verybad">Very Bad</span>
      <span class="main-top-nav-alarm error" title="에러" data-type="critical">999+</span>
      <span class="main-top-nav-alarm warning" title="경고" data-type="warning">999+</span>
      <span class="main-top-nav-alarm inefficiency" title="비효율" data-type="inefficiency">999+</span>
      <span class="main-top-nav-alarm maintenance" title="유지보수" data-type="maintenance">999+</span>
      <span class="main-top-nav-alram">
        <i class="main-top-nav-alram-icon"></i>
      </span>
      <!-- <span class="main-top-nav-user">
        <i class="main-top-nav-user-icon" @click="openModalName()"></i>
        <AuthenticateForChangingPassword ref="AuthenticateForChangingPassword"></AuthenticateForChangingPassword>
      </span> -->
      <!-- 내 메뉴 시작 -->
      <el-dropdown>
          <span class="main-top-nav-user el-dropdown-link"><i class="main-top-nav-user-icon"></i></span>
          <!-- 툴팁 - 내 메뉴 사용 시작 -->
          <el-dropdown-menu slot="dropdown">
              <div class="topnavi_alarm_wrap">
                  <div class="top_arr"></div>
                  <div class="profile_list">
                      <ul>
                          <li>
                              <a @click="openModalName()" style="cursor: pointer;">My profile</a>
                              <!-- <AuthenticateForChangingPassword ref="AuthenticateForChangingPassword"></AuthenticateForChangingPassword> -->
                          </li>
                          <li>
                              <a @click="logout()" style="cursor: pointer;">Sign Out</a>
                          </li>
                      </ul>
                  </div>
              </div>                
          </el-dropdown-menu>
          <!-- 툴팁 - 내 메뉴 사용 끝 -->
      </el-dropdown>
      <!-- 내 메뉴 끝 -->

      <span class="main-top-nav-superuser"><i class="main-top-nav-super-icon"></i></span>
      <div id="main-top-nav-notification" class="main-top-nav-noti"></div>
      <div class="main-top-nav-noti-rule"></div>
      
      <div id="main-user-profile">
        <div class="detail-dialog-content">
          <div class="detail-dialog-header"></div>
          <div class="detail-dialog-detail-content" style="overflow:hidden;"></div>
          <ul>
            <li class="detail-dialog-content-field-item">
              <span class="detail-dialog-content-field-name"></span>
              <span class="detail-dialog-content-field-value my-profile-leave"></span>
            </li>
          </ul>
        </div>
      </div>
      <div
        id="profile-change-password-confirm-content"
        class="detail-dialog-detail-content"
        style="display:none;"
      >
        <ul class="detail-dialog-detail-content-field-list">
          <li class="detail-dialog-content-field-item">
            <div class="detail-dialog-content-field-name">현재 비밀번호</div>
            <div class="detail-dialog-content-field-value">
              <span class="editable">
                <input
                  type="password"
                  id="profile-oldPassword"
                  name="oldPassword"
                  class="profile-reset-password-confirm-input k-input"
                  data-key="oldPassword"
                  required
                  style="width:100%;"
                />
              </span>
            </div>
          </li>
          <li class="detail-dialog-content-field-item">
            <div class="detail-dialog-content-field-name">새 비밀번호</div>
            <div class="detail-dialog-content-field-value">
              <span class="editable">
                <input
                  type="password"
                  data-old-password="profile-oldPassword"
                  id="profile-password"
                  name="password"
                  class="profile-reset-password-confirm-input k-input"
                  data-key="password"
                  required
                  style="width:100%;"
                />
              </span>
            </div>
          </li>
          <li class="detail-dialog-content-field-item">
            <div class="detail-dialog-content-field-name">새 비밀번호 재확인</div>
            <div class="detail-dialog-content-field-value">
              <span class="editable">
                <input
                  type="password"
                  id="profile-passwordRetype"
                  name="passwordRetype"
                  class="profile-reset-password-confirm-input k-input"
                  data-key="passwordRetype"
                  data-retype-for="profile-password"
                  required
                  style="width:100%;"
                />
              </span>
            </div>
          </li>
        </ul>
        <p style="margin-top:20px;">비밀번호 변경 후에는 비밀번호 복구가 불가능합니다.</p>
      </div>
    </nav>
  </header>
  <!-- e:Navigation -->
</template>

<script>
// import AuthenticateForChangingPassword from "@/views/common/sign-in/AuthenticateForChangingPassword";
import axios from '@/api/axios.js';

export default {
  name: "Header",
  components: {
      // AuthenticateForChangingPassword
  },
  data: function() {
    return {};
  },
  methods: {
    openModalName() {
      // 임시 팝업
      this.$alert('작업진행중', 'Title', {
          title: "알람",
          confirmButtonText: 'OK',
          dangerouslyUseHTMLString: true,
          callback: action => {
              console.log(action);
          }
      });
      // this.$refs.AuthenticateForChangingPassword.openModal();
    },
    logout() {
      console.log('>>> 로그아웃');
      // 임시
      // sessionStorage.clear();
      // this.$router.push({name : "Main"});
      this.apiLogout();
    },
    apiLogout() {
      console.log(">> 로그아웃 호출");
      // token
      var tokenInfo = JSON.parse(sessionStorage.getItem("tokenInfo"));
      var sessionToken = tokenInfo.token;
      var sessionTokenType = tokenInfo.tokenType;
      // header
      var apiHeader = {
          headers: {
              'accept': 'application/json',
              'authorization': sessionTokenType + " " + sessionToken           
          }
      }
      // api 호출
      let api = this;
      axios.postApi('/api/logout', "", apiHeader).then(res => {
          console.log('res', res);
          // 정상
          // 세션 스토리지 삭제
          sessionStorage.clear();
          // 화면 이동
          api.$router.push({name : "Main"});
      }).catch(function (error) {
          // TO-DO 에러 처리하기
          console.log('Login user error', error);
      });

    }
  },
  created() {},
  mounted() {},
  destroyed() {}
};
</script>

<style lang="scss">
</style>