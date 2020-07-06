<template>
    <sweet-modal ref="electricDetailModal" overlay-theme="dark" id="sweet_modal_style">
        <!-- 모달 기본 스타일 시작 -->
        <div style="width:660px;"><!-- 모달창 사이즈 조절 부부입니다.-->
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                상세정보
            </div>
            <!-- Accordion 모달 내용 영역 S-->
            <div class="sweet_modal_stitle">
                <p class="stitle">{{ itemList.length }}개의 점검 현황 선택</p>
            </div>
            <div class="sweet_modal_content">
                <!-- s:scroll-->
                <!--s:list -->
                <div class="toggle_list">
                    <ul>
                        <li>
                            <div class="title-status-bar arrow">
                                <!-- 우측 화살 나올시 arrow 추가-->
                                <p class="title open"><span class="detail-img On Heat "></span> FCU_B13_02</p>
                                <p class="date">정상</p>
                            </div>
                            <table class="pop_table view_type">
                                <colgroup>
                                    <col style="width: 210px;">
                                    <col>
                                </colgroup>
                                <tbody>
                                <tr>
                                    <th>디바이스 타입</th>
                                    <td>에너지 미터</td>
                                </tr>
                                <tr>
                                    <th>디바이스 ID</th>
                                    <td>991310-8388627</td>
                                </tr>
                                <tr>
                                    <th>디바이스 이름</th>
                                    <td>_Device Name</td>
                                </tr>
                                <tr>
                                    <th>에너지 미터 타입</th>
                                    <td>전력량계</td>
                                </tr>
                                <tr>
                                    <th>소비 카테고리 타입</th>
                                    <td>SAC</td>
                                </tr>
                                <tr>
                                    <th>SAC 연결 타입</th>
                                    <td>실외기</td>
                                </tr>
                                <tr>
                                    <th>상태</th>
                                    <td><span class="circle-icon detail-popup Normal-On"></span>정상</td>
                                </tr>
                                <tr>
                                    <th>현재 소비량</th>
                                    <td>0kWh</td>
                                </tr>
                                <tr>
                                    <th>그룹</th>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th>제조사</th>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th>모델</th>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th>펌웨어 버전</th>
                                    <td>2016-12-22</td>
                                </tr>
                                <tr>
                                    <th>설명</th>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <th>연결기기</th>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <div class="dropdown_tree_list close">
                                            <!-- 닫힘 상태일때 close 추가-->
                                            <div class="no_item ">There is no items in the list.</div>
                                            <!--<ul class="depth1" >
                                                                  <li><div class="ic_fold open"><span class="name">Group 1</span></div>
                                                                      <ul class="depth2">
                                                                          <li><div class="ic_fold open"><span class="name">Group 1-1</span></div>
                                                                              <ul class="depth3">
                                                                                  <li><div class="ic_fold no_fold"><span class="name">Device Name</span></div></li>
                                                                                  <li><div class="ic_fold no_fold"><span class="name">Device Name</span></div></li>
                                                                              </ul>
                                                                          </li>
                                                                          <li  class="active"><div class="ic_fold "><span class="name">Group 1-2</span></div></li>
                                                                          <li><div class="ic_fold no_fold"><span class="name">Group 1-3</span></div></li>
                                                                      </ul>
                                                                  </li>
                                                                  <li><div class="ic_fold open"><span class="name">Group 2</span></div>
                                                                      <ul class="depth2">
                                                                          <li><div class="ic_fold no_fold"><span class="name">Device Name</span></div></li>
                                                                      </ul>
                                                                  </li>
                                                                  <li><div class="ic_fold "><span class="name">Group 2</span></div>
                                                                      <ul class="depth2">
                                                                          <li><div class="ic_fold no_fold"><span class="name">Device Name</span></div></li>
                                                                      </ul>
                                                                  </li>
                                                              </ul>-->
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </li>
                        <li>
                            <div class="title-status-bar arrow">
                                <p class="title"><span class="detail-img On Heat "></span> FCU_B13_02</p>
                                <p class="date">정상</p>
                            </div>
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
        </div>
        <!-- 모달 기본 스타일 E -->
    </sweet-modal>
</template>

<script>
    export default {
        name: "ElectricDetailModal",
        components: {},
        props: [ 'itemList' ],
        data: function() {
            return {

            }
        },
        methods: {
            openModal() {
                this.$refs.electricDetailModal.open();
            },

            closeModal() {
                this.$refs.electricDetailModal.close();
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

</style>