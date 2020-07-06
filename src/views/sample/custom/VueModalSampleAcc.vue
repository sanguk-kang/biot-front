<template>
  <sweet-modal
      ref="VueModalSampleAcc"
      overlay-theme="dark"
      id="sweet_modal_style"
  >
  <!-- 모달 기본 스타일 시작 -->
    <!-- 모달 제목 영역 S-->
    <div class="sweet_modal_title">
      모달 제목 나옵니다.
    </div>
    <!-- Accordion 모달 내용 영역 S-->
    <div class="sweet_modal_stitle">
      <p class="stitle">디테일 정보에 대한 소제목 나옵니다.</p>
      <p class="date">정상</p>
    </div>
    <div class="sweet_modal_content">
      <!-- s:scroll-->
      <!--s:list -->
      <div class="toggle_list">
          <ul>
            <!--반복되는 정보 리스트-->
              <li>
                  <div class="title open">홍길동(hong88)</div>
                  <table class="pop_table view_type">
                      <colgroup>
                          <col style="width: 210px;">
                          <col>
                      </colgroup>
                      <tbody>
                      <tr>
                          <th>사용자 타입</th>
                          <td><span title="" class="k-widget k-dropdown k-header select_w1" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" aria-owns="dropDownList2_listbox" aria-disabled="true" aria-busy="false" aria-activedescendant="8fccb7f4-f8f7-4e68-bbc9-f556742a0923" style=""><span unselectable="on" class="k-dropdown-wrap k-state-disabled"><span unselectable="on" class="k-input">알람 타입</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList2" class="select_w1" data-role="dropdownlist" disabled="disabled" style="display: none;"></div></span></td>
                      </tr>
                      <tr>
                          <th>이름</th>
                          <td>
                              <div class="input_wrap">
                                  <input id="" name="" type="text" class="k-input" value="홍" placeholder=" ">
                                  <i class="ic ic-bt-input-remove"></i>
                              </div>
                              <div class="input_wrap mt10">
                                  <input id="" name="" type="text" class="k-input" value="길동" placeholder=" ">
                                  <i class="ic ic-bt-input-remove"></i>
                              </div>
                          </td>
                      </tr>
                      <tr>
                          <th>ID</th>
                          <td>
                              <ul class="form_flex">
                                  <li>hong88</li>
                                  <li><button type="button " class="k-button ">비밀번호 초기화</button></li>
                              </ul>
                          </td>
                      </tr>
                      <tr>
                          <th>전화번호</th>
                          <td>
                              <div class="input_wrap">
                                  <input id="" name="" type="text" class="k-input" value="" placeholder=" ">
                                  <i class="ic ic-bt-input-remove"></i>
                              </div>
                          </td>
                      </tr>
                      <tr>
                          <th>이메일</th>
                          <td>
                              <div class="input_wrap">
                                  <input id="" name="" type="text" class="k-input" value="" placeholder=" ">
                                  <i class="ic ic-bt-input-remove"></i>
                              </div>
                          </td>
                      </tr>
                      <tr>
                          <th>가입일</th>
                          <td>2019-02-25 09:30</td>
                      </tr>
                      <tr>
                          <th>최근 로그인 시간</th>
                          <td>2020-03-02 20:46</td>
                      </tr>
                      </tbody>
                  </table>
              </li>
              <!--반복되는 정보 리스트-->
              <li>
                  <div class="title">박별동(hon688</div>
              </li>
          </ul>
      </div>
      <!--e:list-->
      <!-- e:scroll-->
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
      this.$refs.VueModalSampleAcc.open();
    },
    closeModal() {
      this.$refs.VueModalSampleAcc.close();
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