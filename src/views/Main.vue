<template>
  <div class="content">
      
  </div>
</template>

<script>
import stringUtils from "@/utils/stringUtils.js";
import { mapGetters } from 'vuex'

export default {
  name: "Main",
  components: {},
  props: [],
  watch: {
    getCodeIdList(val) {
      console.log('watch', val);
    }
  },
  computed: {
    ...mapGetters('app', ['getCodeIdList'])
  },
  data: function() {
    return {
     msg: "Main Page"
    }
  },
  methods: {
    movePage(page) {
      this.$router.push({name : page});
    },
    checkSession() {
      var userSession = stringUtils.isEmpty(sessionStorage.getItem("userInfo"));
      if (userSession) {
        this.movePage("Login");
      } else {
        // 권한 체크
        console.log(">>>> 권한 체크");
        this.movePage("Dashboard");
      }
      
    }
  },
  created() {
    this.checkSession();
    console.log('123', this.getCodeIdList)
  },
  mounted() {
  },
  destroyed() {
  }
}
</script>

<style lang="scss">

</style>