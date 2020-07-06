<template>
    <div class="content">
        <div id="sign_main">
            <div id="signin-container" >
                <section class="signin-brand-visual"><span class="ir">배경비주얼</span></section>

                <section class="signin-contents">
                    <div class="signin-contents-block">
                        <h1 class="signin-contents-title"><img src="@/assets/images/common/logo.png" class="signin-logo-img" /></h1>
                        <div class="signin-contents-form">
                            <h2 class="find-contents-title">Application for membership completed</h2>

                            <div class="resutl_text">Membership registration is completed only when approved by the administrator. Approval of membership shall be made within one business day of application. If you are not approved within three days of the registration date, please
                                contact the control center.</div>
                            <!-- s: co-3105 20200420 추가 및 수정-->
                            <div class="end_tb" v-show="userRole=='Site Admin' && created==true">
                                <p class="sub_title">사이트 신청 정보</p>
                                <table>
                                    <colgroup>
                                        <col style="width:150px ;" />
                                        <col />
                                    </colgroup>
                                    <tr>
                                        <th>Site Name</th>
                                        <td>{{siteName}}</td>
                                    </tr>
                                    <tr>
                                        <th>industry</th>
                                        <td>{{industry}}</td>
                                    </tr>
                                    <tr>
                                        <th>country's name</th>
                                        <td>{{country}}</td>
                                    </tr>
                                    <tr>
                                        <th>Address</th>
                                        <td>(12345) 기본주소 + 상세주소기본주소 + 상세주소기본주소 + 상세주소</td>
                                    </tr>
                                </table>

                                <p class="sub_title bdt">가입 정보</p>
                                <table>
                                    <colgroup>
                                        <col style="width:108px ;" />
                                        <col />
                                    </colgroup>
                                    <tr>
                                        <th>Name</th>
                                        <td>{{userName}}</td>
                                    </tr>
                                    <tr>
                                        <th>ID</th>
                                        <td>{{id}}</td>
                                    </tr>
                                    <tr>
                                        <th>User Role</th>
                                        <td>{{userRole}}</td>
                                    </tr>
                                </table>
                            </div>
                            <!-- e: co-3105 20200420 추가 및 수정-->

                            <!-- s: 가입완료 내용이 하나 일 경우-->
                            <div class="end_tb" v-show="userRole=='Manager' || userRole=='Guest' || (userRole=='Site Admin' && created==false) || userRole=='Maintainer'">
                                <table>
                                    <colgroup>
                                        <col style="width:150px ;" />
                                        <col />
                                    </colgroup>
                                    <tr v-show="userRole!='Maintainer'">
                                        <th>Site Name</th>
                                        <td>{{siteName}}</td>
                                    </tr>
                                    <tr>
                                        <th>Name</th>
                                        <td>{{userName}}</td>
                                    </tr>
                                    <tr>
                                        <th>ID</th>
                                        <td>{{id}}</td>
                                    </tr>
                                    <tr>
                                        <th>User Role</th>
                                        <td>{{userRole}}</td>
                                    </tr>
                                </table>
                            </div>
                            <!-- e: 가입완료 내용이 하나 일 경우-->

                            <div class="end_bot">Control Center Inquiry <a href="#" class="btn_text">bcloud.sec@samsung.com</a></div>

                            <footer class="signin-footer">Copyright© Samsung Electronics Co., Ltd.</footer>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "JoinComplet",
  data: function() {
    return {
        signup:{},
        userName:"",
        userRole:"",
        created:false,
        id:"",
        siteName:"",
        industry:"",
        country:""
    }
  },
  methods: {
  },
  created() {
      this.signup = sessionStorage.getItem("signUpInfo");
      this.userName=JSON.parse(this.signup).firstName + JSON.parse(this.signup).lastName;
      this.userRole=JSON.parse(this.signup).userRole;
      this.created=JSON.parse(this.signup).created;
      this.id=JSON.parse(this.signup).id;
      this.siteName=JSON.parse(this.signup).siteName;
      this.industry=JSON.parse(this.signup).industry;
      this.country=JSON.parse(this.signup).country;
  }
}
</script>

<style lang="scss">

</style>