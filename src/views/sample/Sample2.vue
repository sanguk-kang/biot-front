<template>
  <div id="main-contents">
    <div class="sample_content">
      <div>
        <strong>모달 샘플</strong>
      </div>
      <button type="button" @click="openModalName" class="btn_normal">모달 샘플 열기</button>
      <ModalSample ref="modalName"></ModalSample>
      
    </div>

    <div class="sample_content">
      <div>
        <strong>모달 샘플</strong>
      </div>
      <button type="button" @click="openAlert" class="btn_normal">모달 샘플 열기</button>
      <ModalAlert 
        ref="alertModal" 
        :modal-data="alert"
      >
      </ModalAlert>
      
    </div>
   
    <div class="sample_content">
      <div>
        <strong>날짜 샘플</strong>
      </div>
      <VueDatePick v-model="date" class="inp_calendar"></VueDatePick>
      <span> ~ </span>
      <VueDatePick v-model="dateEnd" class="inp_calendar"></VueDatePick>
    </div>

  </div>
</template>

<script>
import ModalSample from '@/views/sample/ModalSample';
import ModalAlert from '@/components/common/Modal';
import VueDatePick from "vue-date-pick/src/vueDatePick";

export default {
  name: "Sample2",
  props: [],
  components: {
    ModalSample,
    VueDatePick,
    ModalAlert
  },
  data() {
    return {
      date: '',
      dateEnd: '',
      alert:{
        message:'오늘은 참이슬 소주다',
        btn: [
          {
            name:'취소'          
          },
          {
            name:'확인'
          }
        ]
      }
    }
  },
  methods: {
    openModalName() {
      console.log('모달 클릭');
      this.$refs.modalName.openModal();
    },
    openAlert() {
      console.log('알럿 클릭');
      this.$refs.alertModal.openModal();
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
  .sample_content{
    margin-top:30px;
    text-align:center;
    &:first-child{
      margin-top:50px;
    }
  }
  .inp_calendar{
    border:1px solid #ddd;
  }
</style>