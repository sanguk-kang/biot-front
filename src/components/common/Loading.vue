<template>
  <div>
      <h1>{{msg}}</h1>
  </div>
</template>

<script>
import EventBus from '@/utils/eventBus';

export default {
  name: "Loading",
  data: function() {
    return {
     msg: "Loading 화면",
     isLoading: false
    }
  },
  methods: {    
  },
  created() {
      // 구독 ()
      EventBus.$on('loading', (param)=>{
        this.isLoading = param;
        console.log('로딩 정보', this.isLoading);
      });
      // 호출 (다른화면에서 사용)
      EventBus.$emit('loading', true);
  }
}
</script>

<style lang="scss">

</style>