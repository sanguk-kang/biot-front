<template>
  <div class="my-modal" v-if="visible" role="alert">
    aaa
  </div>
</template>

<script>
// import { AlertPlugin } from 'bootstrap-vue'
// Vue.use(ModalPlugin)

export default {
  name: 'Modal',
  props: [],
  data: function() {
    return {
     visible: true
    }
  },
  methods: {   
    
  }
}
</script>

<style lang="scss">

</style>