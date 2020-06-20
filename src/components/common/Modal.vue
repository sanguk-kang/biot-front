<template>
  <div class="my-modal" role="alert">
    <div>
      <span>{{modalData.message}}</span>
    </div>
    <div>
      <button type="button" v-for="(btnItem, idx) in modalData.btn" :key="'btn'+ idx">{{btnItem.name}}</button>
    </div>
  </div>
</template>

<script>
// import { AlertPlugin } from 'bootstrap-vue'
// Vue.use(ModalPlugin)

export default {
  name: 'Modal',
  props: {
    modalData: Object
  },
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