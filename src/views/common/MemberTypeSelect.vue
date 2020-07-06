<template>
    <div class="content">
        <div id="sign_main">
            <div id="signin-container" class="flex_al_center">
                <section class="signin-brand-visual"><span class="ir">배경비주얼</span></section>
                <section class="signin-contents ">
                    <div class="signin-contents-block wd_auto">
                        <h1 class="signin-contents-title"><img src="@/assets/images/common/logo.png" class="signin-logo-img" /></h1>
                        <div class="signin-contents-form">
                            <h2 class="find-contents-title">Sign up / Create new ID</h2>

                            <p class="reset_end">Welcome to b.IoT Cloud</p>

                            <ul class="find-result-block creat-id">
                                <li>
                                    <p class="resutl_id">General member</p>
                                    <p class="resutl_date">Sign up for site managers, operators, and visiting customers</p>
                                    <p><button id="signin-login" type="button" class="k-button" @click="move('Agreement', 'MemberGeneral')">Create account</button></p>
                                </li>
                                <li>
                                    <p class="resutl_id">Members of Samsung Electronics Affiliates</p>
                                    <p class="resutl_date">Installers and dedicated engineers Member registration for</p>
                                    <p><button id="signin-login" type="button" class="k-button"  @click="move('Agreement', 'MemberPartner')">Create account</button></p>
                                </li>
                                <li>
                                    <p class="info_text">There is a difference in the subscription process according to the member type, so please select a member type.</p>
                                    <p>
                                        <a  @click="move('Login')" class="btn_text" target="_self">Previous Screen Shortcuts</a>
                                    </p>
                                </li>
                            </ul>
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
  name: "MemberTypeSelect",
  data: function() {
    return {
     msg: "MemberTypeSelect"
    }
  },
  methods: {
      move(page, param){
          sessionStorage.setItem('signUpMemberType', param);
          this.$router.push({name : page});
      }
  },
  created() {
  }
}
</script>

<style lang="scss">

</style>