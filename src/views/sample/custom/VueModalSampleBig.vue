<template>
  <sweet-modal
      ref="VueModalSampleBig"
      overlay-theme="dark"
      id="sweet_modal_style"
  >
  <!-- 1860사이즈 모달 스타일 시작 -->
  <div style="width:1800px;">
    <!-- 모달 제목 영역 S-->
    <div class="sweet_modal_title">
      모달 제목 나옵니다.
    </div>
    <!-- 모달 내용 영역 : 상세정보 시작-->
    <div class="sweet_modal_content">
        <div data-role="detaildialog" class="k-content">
        <div class="detail-dialog-content">
            <table class="pop_table view_type table_notitle mgt">
                <colgroup>
                    <col style="width: 210px;">
                    <col>
                </colgroup>
                <tbody>
                <tr>
                    <th>Site Name</th>
                    <td>Site Name(Site ID)</td>
                </tr>
                </tbody>
            </table>

            <div class="content_title_wrap">
                <h2 class="content_title">Enable Kakaotalk Alerts</h2>
            </div>

            <div class="data-table">
                <table>
                    <colgroup>
                        <col style="width:300px">
                        <col style="width:500px">
                        <col style="width:500px">
                        <col style="width:500px">
                    </colgroup>
                    <thead>
                    <tr>
                        <th>Type</th>
                        <th>Fault Diagnosis Alarm</th>
                        <th>Regular Inspection Alarm</th>
                        <th>Filter Cleaning Alarm</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Enable Kakaotalk Alerts</td>
                        <td><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Use</label></div></td>
                        <td><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched2" id="ched1_2" checked=""><label class="k-checkbox-label" for="ched1_2">Use</label></div></td>
                        <td><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched3" id="ched1_3"><label class="k-checkbox-label" for="ched1_3">Use</label></div></td>
                    </tr>
                    <tr>
                        <td>Set alarm time allowed</td>
                        <td>
                            <ul class="flex_left">
                                <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Use</label></div></li>
                                <li><div id="dropDownList1" class="select_w4"></div></li>
                                <li><span class="ic-fe">~</span></li>
                                <li><div id="dropDownList2" class="select_w4"></div></li>
                            </ul>
                        </td>
                        <td>
                            <ul class="flex_left">
                                <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Use</label></div></li>
                                <li><div id="dropDownList3" class="select_w4"></div></li>
                                <li><span class="ic-fe">~</span></li>
                                <li><div id="dropDownList4" class="select_w4"></div></li>
                            </ul>
                        </td>
                        <td>
                            <ul class="flex_left">
                                <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" disabled="disabled"><label class="k-checkbox-label" for="ched1_1">Use</label></div></li>
                                <li><div id="dropDownList5" class="select_w4"></div></li>
                                <li><span class="ic-fe">~</span></li>
                                <li><div id="dropDownList6" class="select_w4"></div></li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>Set the day of the week to allow alarms</td>
                        <td>
                            <ul class="flex_left td_wk">
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="sun" disabled="disabled"><label class="k-checkbox-label" for="sun">SUN</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="mon" checked=""><label class="k-checkbox-label" for="mon">MON</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="tue" checked=""><label class="k-checkbox-label" for="tue">TUE</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="wed" checked=""><label class="k-checkbox-label" for="wed">WED</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="thu" checked=""><label class="k-checkbox-label" for="thu">THU</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="fri" checked=""><label class="k-checkbox-label" for="fri">FRI</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="sat" checked=""><label class="k-checkbox-label" for="sat">SAT</label></div>
                                </li>
                            </ul>
                        </td>
                        <td>
                            <ul class="flex_left td_wk">
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="sun" checked=""><label class="k-checkbox-label" for="sun">SUN</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="mon" disabled="disabled"><label class="k-checkbox-label" for="mon">MON</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="tue" checked=""><label class="k-checkbox-label" for="tue">TUE</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="wed" checked=""><label class="k-checkbox-label" for="wed">WED</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="thu" checked=""><label class="k-checkbox-label" for="thu">THU</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="fri" checked=""><label class="k-checkbox-label" for="fri">FRI</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="sat" checked=""><label class="k-checkbox-label" for="sat">SAT</label></div>
                                </li>
                            </ul>
                        </td>
                        <td>
                            <ul class="flex_left td_wk">
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="sun" checked=""><label class="k-checkbox-label" for="sun">SUN</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="mon" disabled="disabled"><label class="k-checkbox-label" for="mon">MON</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="tue" checked=""><label class="k-checkbox-label" for="tue">TUE</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="wed" checked=""><label class="k-checkbox-label" for="wed">WED</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="thu" checked=""><label class="k-checkbox-label" for="thu">THU</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="fri" checked=""><label class="k-checkbox-label" for="fri">FRI</label></div>
                                </li>
                                <li>
                                    <div class="checkLabel "><input type="checkbox" class="k-checkbox" name="Weekend" id="sat" checked=""><label class="k-checkbox-label" for="sat">SAT</label></div>
                                </li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>Alarm Receive Target</td>
                        <td>
                            <ul class="td_list">
                                <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" disabled="disabled"><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong1 (Site Admin)</label></div></li>
                                <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong2 (Manager)</label></div></li>
                                <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong3 (Site Admin)</label></div></li>
                                <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong4 (Manager)</label></div></li>
                            </ul>
                        </td>
                        <td class="td_list">
                            <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" disabled="disabled"><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong1 (Site Admin)</label></div></li>
                            <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong2 (Manager)</label></div></li>
                            <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong3 (Site Admin)</label></div></li>
                            <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong4 (Manager)</label></div></li>
                        </td>
                        <td class="td_list">
                            <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" disabled="disabled"><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong1 (Site Admin)</label></div></li>
                            <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" disabled="disabled"><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong2 (Manager)</label></div></li>
                            <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong3 (Site Admin)</label></div></li>
                            <li><div class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched1" id="ched1_1" checked=""><label class="k-checkbox-label" for="ched1_1">Hong Gil-dong4 (Manager)</label></div></li>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div class="tb_bot_text">* When an alarm occurs during a timeout, the alarm ends and sends it in batches.</div>
            </div>
        </div>
    </div>
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
      this.$refs.VueModalSampleBig.open();
    },
    closeModal() {
      this.$refs.VueModalSampleBig.close();
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