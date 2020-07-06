<template>
  <sweet-modal
      ref="VueModalSampleView"
      overlay-theme="dark"
      id="sweet_modal_style"
  >
  <!-- 1500사이즈 모달 스타일 시작 -->
  <div style="width:1500px;">
    <!-- 모달 제목 영역 S-->
    <div class="sweet_modal_title">
      모달 제목 나옵니다.
    </div>
    <!-- 모달 내용 영역 : 상세정보 시작-->
    <div class="sweet_modal_content">
        <table class="pop_table view_type mgt">
          <colgroup>
            <col style="width: 210px;">
            <col>
          </colgroup>
          <tbody>
            <tr>
              <th>사이트 이름</th>
              <td>용인초등학교</td>
            </tr>
            <tr>
              <th>디바이스 ID</th>
              <td>
                <div class="input_wrap  input_w3">
                  <input type="text" class="k-input" value="SNSG7788-632Y-31" placeholder="">
                  <i class="ic ic-bt-input-remove"></i>
                </div>
              </td>
            </tr>
            <tr>
              <th>IP주소</th>
              <td>
                <div class="input_wrap  input_w3">
                  <input type="text" class="k-input" value="10.30.227.148" placeholder="">
                  <i class="ic ic-bt-input-remove"></i>
                </div>
              </td>
            </tr>
            <tr>
              <th>디바이스 이름 </th>
              <td>
                <div class="input_wrap  input_w3">
                  <input type="text" class="k-input" value="10.30.227.148" placeholder="">
                  <i class="ic ic-bt-input-remove"></i>
                </div>
              </td>
            </tr>
            <tr>
              <th>설명</th>
              <td colspan="3">
                <div class="input_wrap  ">
                  <input type="text" class="k-input" value="" placeholder="_Description_">
                  <i class="ic ic-bt-input-remove"></i>
                </div>
              </td>
            </tr>

          </tbody>
        </table>

        <!-- s: grid top filter-->
        <div class="content_title_wrap bot_line">
          <ul class="flex_left">
            <li>
              <span title="" class="k-widget k-dropdown k-header select_w1" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="dropDownList1_listbox" aria-disabled="false" aria-busy="false" aria-activedescendant="eafe4a60-7209-4b62-8ef9-e47c4902bc64" style=""><span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">알람 타입</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList1" class="select_w1" data-role="dropdownlist" style="display: none;"></div></span>
            </li>
          </ul>

        </div>
        <!-- e: grid top filter-->

        <!-- s:grid-->
        <div id="grid" data-role="grid" class="k-grid k-widget" style="height: 550px;"><div class="k-grid-header" style="padding-right: 17px;"><div class="k-grid-header-wrap k-auto-scrollable"><table role="grid"><colgroup><col style="width:240px"><col><col><col style="width:150px"></colgroup><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader" data-field="ContactName" aria-haspopup="true" rowspan="1" data-title="Contact Name" data-index="0" id="37576fbd-e169-43b0-887f-878fa6adcccf" class="k-header" data-role="columnsorter"><a class="k-link" href="#">Contact Name</a></th><th scope="col" role="columnheader" data-field="ContactTitle" aria-haspopup="true" rowspan="1" data-title="Contact Title" data-index="1" id="62715745-4788-45da-8a0c-7dfef2c0d51d" class="k-header" data-role="columnsorter"><a class="k-link" href="#">Contact Title</a></th><th scope="col" role="columnheader" data-field="CompanyName" aria-haspopup="true" rowspan="1" data-title="Company Name" data-index="2" id="ef4f04f2-be18-4040-9364-82ea8127195d" class="k-header" data-role="columnsorter"><a class="k-link" href="#">Company Name</a></th><th scope="col" role="columnheader" data-field="Country" aria-haspopup="true" rowspan="1" data-index="3" id="7e15fba7-7f2d-49c5-a785-139781c873ac" class="k-header" data-role="columnsorter"><a class="k-link" href="#">Country</a></th></tr></thead></table></div></div><div class="k-grid-content k-auto-scrollable" style="height: 291px;"><div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><span class="k-loading-text">Loading...</span><div class="k-loading-image"></div><div class="k-loading-color"></div></div><table role="grid" style="height: auto;"><colgroup><col style="width:240px"><col><col><col style="width:150px"></colgroup><tbody role="rowgroup"></tbody></table></div></div>
        <!-- e:grid-->
    </div>
    <!-- 모달 내용 영역 : 상세정보 끝-->
    <!-- 모달 전체 버튼 영역 S-->
    <div class="sweet_modal_buttongroup">
        <button type="button"  @click="closeModal" class="k-button">Close</button>
        <button type="button"  @click="closeModal" class="k-button" disabled="disabled">Save</button>
    </div>
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
      this.$refs.VueModalSampleView.open();
    },
    closeModal() {
      this.$refs.VueModalSampleView.close();
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