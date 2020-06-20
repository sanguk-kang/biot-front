<template>
  <div id="main-contents">
    <div class="sample_content">
      <div>
        <strong>모달 샘플</strong>
      </div>
      <button type="button" @click="openModalName" class="btn_normal">모달 샘플 열기</button>
      <ModalSample ref="modalName"></ModalSample>
      
    </div>

    <!-- <div class="sample_content">
      <div>
        <strong>모달 샘플</strong>
      </div>
      <button type="button" @click="openAlert" class="btn_normal">모달 샘플 열기</button>
      <ModalAlert 
        ref="alertModal" 
        :modal-data="alert"
      >
      </ModalAlert>
      
    </div> -->
   
    <div class="sample_content">
      <div>
        <strong>날짜 샘플</strong>
      </div>
      <VueDatePick v-model="date" class="inp_calendar"></VueDatePick>
      <span> ~ </span>
      <VueDatePick v-model="dateEnd" class="inp_calendar"></VueDatePick>
    </div>

    <div class="sample_content">
      <div>
        <strong>셀렉트 샘플</strong>
      </div>
      <div class="selectbox">
        <div class="opt_more " :class="{'_open': isOpen}"><!-- _open 으로 활성화 -->
          <strong class="screen_out">검색 선택상자</strong>
          <button type="button" class="btn_select" @click="openSelect">{{selectChoiceText}}<span class="screen_out">선택됨</span></button>
          <div class="box_opt_menu">
            <div class="menu_item" v-for="(item, id) in selectData" :key="'select' + id">
              <span class="link_menu" v-if="isCheckType" >
                <input type="checkbox" @change="inpChange($event, item)" :value="item.type" :checked="checkData[item.type]"> {{item.name}}
              </span>
              <a href="javascript:void(0);" class="link_menu" @click="clickSelect(item)" v-else>{{item.name}}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import ModalSample from '@/views/sample/ModalSample';
// import ModalAlert from '@/components/common/Modal';
import VueDatePick from "vue-date-pick/src/vueDatePick";

export default {
  name: "Sample2",
  props: [],
  components: {
    ModalSample,
    VueDatePick,
    // ModalAlert
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
      },

      isCheckType: true,
      isOpen: false,
      selectChoiceText: '한라산',
      selectType: 'work',
      selectData: [
        {
          name: '힌라산',
          type: 'work'
        },
        {
          name: '참이슬',
          type: 'soju'
        }
      ],

      checkData: {
        work: true,
        soju: false,
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

    openSelect() {
      this.isOpen = !this.isOpen;
    },
    clickSelect(item) {
      this.selectChoiceText = item.name;
      this.selectType = item.type;
      this.isOpen = false;

      console.log(this.selectType)
    },
    inpChange(e, item) {
      this.checkData[item.type] = e.target.checked;
      
      console.log(this.checkData);
    }
    
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




  .opt_more{
  position:relative;
    .btn_select{
      cursor: pointer;
    }
    
    &._open{
      .box_opt_menu{
      
        display:block;
      }
    }
    .ico_arrow_toggle{
      margin:8px 0 0 4px;
    }

    .link_item{
      display:block;
      font-size:13px;
      color:#777;
      &button{
        &:focus{
          outline:none;
        }
      }
    }
  }



  
  .selectbox{
    position:relative;
    width:500px;
    .btn_select{
      position:relative;
      width:100%;
      height:36px;
      padding:0 30px 0 12px;
      border:1px solid #E1E1E1;
      border-radius:3px;
      background-color:#fff;
      text-decoration:none;
      text-align:left;
      .ico_comm{
        position: absolute;
        top:50%;
        right:12px;
        margin:-2px 0 0;
      }
    }
    ._open{
      .btn_select{
        border-color:#222;
      }
    }
    .opt_more{
      .box_opt_menu{
        min-width:0;
        top:40px;
      }
    }
  }

  .screen_out{
    overflow:hidden;position:absolute;width:0;height:0;line-height:0;text-indent:-9999px

  }
  .box_opt_menu{
    display:none;
    overflow-y:auto;
    position:absolute;
    left:0;
    z-index:10;
    width:100%;
    min-width:124px;
    max-height:280px;
    border:1px solid #222;
    border-radius:4px;
    background-color:#fff;
    box-shadow:0px 3px 2px rgba(0,0,0,0.04);
    box-sizing:border-box;
    &.posi_r{
      left:auto;
      right:0;
    }

    
    &.t_r{
      .menu_item{
        text-align:right;
      }
    }
    &.t_c{
      .menu_item{
        text-align:center;
      }
    }
    .menu_item{
      position:relative;
      text-align:left
    }
    .link_menu{
      display:block;
      height:40px;
      padding:10px 16px 0;
      font-size:13px;
      box-sizing:border-box;
      &:hover{
        text-decoration:none;
        background-color:#FFF8D9;
      }
    }
    .menu_line{
      border-top:1px solid #f2f2f2
    }
  }

</style>