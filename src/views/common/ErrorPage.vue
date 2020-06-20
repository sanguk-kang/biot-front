<template>
  <div>
      <h1>{{msg}}</h1>
  </div>
</template>

<script>
export default {
  name: "ErrorPage",
  data: function() {
    return {
     msg: "에러 페이지입니다."
    }
  },
  methods: {
    // search() {
    //   // api 호출('/api/users')
    //   axios.getApi('/api/users', '').then(res => {
    //     console.log('결과', res);
    //     this.resultData = res.data;
    //     this.totalData = this.resultData.total;
    //     this.dataList = this.resultData.data;
    //   }).catch(function (error) {
    //     if (error.response.status == 400) {
    //       console.log('에러 팝업 발생하기');
    //     }
    //   });
    // }
  },
  created() {
    console.log('error code', this.$route.params.code);
    this.msg = this.$route.params.code + " 에러 입니다.";
  }
}
</script>

<style lang="scss">

</style>