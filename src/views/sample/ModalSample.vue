<template>
  <sweet-modal
      ref="nameModal"
      overlay-theme="dark"
     
    >
      <div>
        모달 내용 들어가는곳
      </div>
      <button type="button" @click="closeModal" class="btn_normal">모달 닫기</button>
    </sweet-modal>
</template>

<script>
export default {
  name: "ModalSample",
  
  data() {
    return {
    
    }
  },
  methods: {
    openModal() {
      this.$refs.nameModal.open();
    },
    closeModal() {
      this.$refs.nameModal.close();
    },
    
  },
  created() {
  },
  mounted() {
  },
  destroyed() {
  }
}
</script>

<style lang="scss" scoped>
   .btn_normal{
    padding:10px;
    border:1px solid #ddd;
    cursor:pointer;
  }
</style>