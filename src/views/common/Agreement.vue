<template>
    <div class="content">
        <div id="sign_main">
            <div id="signin-container" >
                <section class="signin-brand-visual"><span class="ir">배경비주얼</span></section>

                <section class="signin-contents">
                    <div class="signin-contents-block">
                        <h1 class="signin-contents-title"><img src="@/assets//images/common/logo.png" class="signin-logo-img" /></h1>
                        <div class="signin-contents-form">
                            <h2 class="find-contents-title">Agreement on Terms of Use</h2>

                            <p class="reset_end">Tap the links below and read the terms carefully. By proceeding, you acknowledge that you have read and agree to the following terms.</p>

                            <ul class="find-result-block agreement">
                                <li>
                                    <p class="k-checkbox-wrapper">
                                        <input v-model="signinremember" @click="agreeCheck2()" type="checkbox" id="signinremember" name="remember" class="k-checkbox">
                                        <label for="signinremember" class="k-checkbox-label">
                                            <!-- POPUP -->
                                            <a href="#" class="btn_text" @click='openModalName("2")'>이용약관</a>
                                            <VueModalSampleAcc ref='VueModalSampleAcc'></VueModalSampleAcc>
                                            <span class="signin-remember-label">에 동의합니다.</span>
                                        </label>

                                    </p>
                                    <div class="textbox_agr">
                                        <p><strong>Samsung Terms and Conditions</strong></p>
                                        <p>By creating an account or using our Services, you confirm that you accept these Terms. You also confirm that:</p>
                                    </div>
                                </li>
                                <li>
                                    <p class="k-checkbox-wrapper">
                                        <input v-model="signinremember2" @click="agreeCheck2()" type="checkbox" id="signinremember2" name="remember" class="k-checkbox">
                                        <label for="signinremember2" class="k-checkbox-label"><a href="#" class="btn_text">개인정보 수집 및 이용</a><span class="signin-remember-label">에 동의합니다.</span></label>
                                    </p>
                                    <div class="textbox_agr">
                                        <p><strong>Priavacy Policy</strong></p>
                                        <p>By creating an account or using our Services, you confirm that you accept these Terms. You also confirm that:</p>
                                    </div>
                                </li>
                                <!-- s: co-3102 20200507 추가-->
                                <li>
                                    <p class="k-checkbox-wrapper">
                                        <input v-model="signinremember3" @click="agreeCheck2()" type="checkbox" id="signinremember3" name="remember" class="k-checkbox">
                                        <label for="signinremember3" class="k-checkbox-label"><a href="#" class="btn_text">마케팅/홍보의 수집 및 이용 동의</a><span class="signin-remember-label">에 동의합니다. (선택)</span></label><!-- 20200520 문구추가-->
                                    </p>
                                    <div class="textbox_agr">
                                        <p><strong>Priavacy Policy</strong></p>
                                        <p>By creating an account or using our Services, you confirm that you accept these Terms. You also confirm that:</p>
                                    </div>
                                </li>
                                <!-- e: co-3102 20200507 추가-->
                                <li>
                                    <p class="k-checkbox-wrapper">
                                        <input v-model="signinremember4"  @click="agreeCheck()" type="checkbox" id="signinremember4" name="remember" class="k-checkbox">
                                        <label for="signinremember4" class="k-checkbox-label"><span class="signin-remember-label">I agree to all.</span></label>
                                    </p>
                                </li>
                            </ul>

                            <ul class="find-idpw-button">
                                <li><button @click="move('Login')" id="" type="button" class="k-button">Decline</button></li>
                                <li><button @click="move()" id="" name="checkButton" type="button" class="k-button" :disabled="signinremember==false || signinremember2==false">Agree</button></li>
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
import stringUtils from "@/utils/stringUtils.js";
// import VueModalSample from '@/views/sample/custom/VueModalSample';
import VueModalSampleAcc from '@/views/sample/custom/VueModalSampleAcc';
// import VueModalSampleView from '@/views/sample/custom/VueModalSampleView';
// import VueModalSampleBig from '@/views/sample/custom/VueModalSampleBig';

export default {
  name: "Agreement",
  components: {
    // VueModalSample,
    VueModalSampleAcc,
    // VueModalSampleView,
    // VueModalSampleBig,
  },
  data: function() {
    return {
     msg: "Agreement page.",
     signinremember2:"",
     signinremember3:"",
     signinremember4:"",
     signinremember:"",
     type:"",
     term:[]
    }
  },
  methods: {
    move(page){
        // var count=0;
        // if(this.signinremember==true){
        //     this.term[count]=1;
        //     count++;
        // }
        // if(this.signinremember2==true){
        //     this.term[count]=2;
        //     count++;
        // }
        // if(this.signinremember3==true){
        //     this.term[count]=3;
        //     count++;
        // }
        
        if(this.signinremember==true){
            this.term.push(1);
        }
        if(this.signinremember2==true){
            this.term.push(2);
        }
        if(this.signinremember3==true){
            this.term.push(3);
        }
        sessionStorage.setItem('termList', JSON.stringify(this.term));

        var tempPage = page;
        if (stringUtils.isEmpty(tempPage)) {
            tempPage = this.type;
        }
        this.$router.push({name : tempPage});   
    },
    agreeCheck(){
        //I agree to all.
        if(this.signinremember4==false){
            this.signinremember=true;
            this.signinremember2=true;
            this.signinremember3=true;
        }
        else{
            this.signinremember=false;
            this.signinremember2=false;
            this.signinremember3=false;
        }
    },
    agreeCheck2(){
        if((this.signinremember==true || this.signinremember2==true || this.signinremember3==true) && this.signinremember4==true){
            this.signinremember4=false;
        }
    },
    openModalName(param) {
        if (param === "1") {
            this.$refs.modalName.openModal();
        } else if (param === "2") {
            this.$refs.VueModalSampleAcc.openModal();
        } else if (param === "3") {
            this.$refs.VueModalSampleView.openModal();
        } else {
            this.$refs.VueModalSampleBig.openModal();
        } 
        console.log('모달 클릭');
    }
  },
  created() {
      this.type = sessionStorage.getItem('signUpMemberType');
  }
}
</script>

<style lang="scss">

</style>