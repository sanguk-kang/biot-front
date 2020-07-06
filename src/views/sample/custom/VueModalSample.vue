<template>
  <sweet-modal
      ref="nameModal"
      overlay-theme="dark"
      id="sweet_modal_style"
  >
  <!-- 모달 기본 스타일 시작 -->
    <!-- 모달 제목 영역 S-->
    <div class="sweet_modal_title">
      모달 제목 나옵니다.
    </div>
    <!-- 모달 내용 영역 S-->
    <div class="sweet_modal_content">
      모달 내용 들어가는곳
    </div>
    <!-- 모달 전체 버튼 영역 S-->
    <div class="sweet_modal_buttongroup">
        <button type="button"  @click="closeModal" class="k-button">OK</button>
        <button type="button"  @click="closeModal" class="k-button">Close</button>
    </div>
  <!-- 모달 기본 스타일 끝 -->
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

</style>