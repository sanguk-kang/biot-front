<template>
    <sweet-modal
            ref="maintainDiagnosisEditModal"
            overlay-theme="dark"
            id="sweet_modal_style"
    >
        <!-- 1500사이즈 모달 스타일 시작 -->
        <div style="width:820px;height:830px;">

            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                상세정보
            </div>

            <div class="sweet_modal_stitle">
                <p class="stitle">{{ itemList.length }}개의 점검 현황 선택</p>
            </div>
            <!-- 모달 내용 영역 : 상세정보 시작-->
            <div class="sweet_modal_content">
                <div class="toggle_list">
                    <ul>
                        <li>
                            <div class="title open">Dev_101 통신 에러</div>
                            <table class="pop_table view_type">
                                <colgroup>
                                    <col style="width: 210px;">
                                    <col>
                                </colgroup>
                                <tbody>
                                <tr>
                                    <th>에러내용</th>
                                    <td>
                                        <div class="ft_td">DVM,DPM,DVS:실내외기 통신 에러 ( 실내기에서 수신하지 못한 경우 )</div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>요인</th>
                                    <td>
                                        <div class="ft_td">설치불량/외부요인</div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>점검구분</th>
                                    <td>
                                        <div class="ft_td">설치/옵션설정 이상</div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>중요도</th>
                                    <td>
                                        <div id="dropDownList3" class="select_w2"></div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>심각도 Factor</th>
                                    <td>
                                        <ul class="flex_left">
                                            <li>
                                                <div class="input_wrap input_w0">
                                                    <input id="" name="" type="text" class="k-input" value="" placeholder=" ">
                                                    <i class="ic ic-bt-input-remove"></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap input_w0">
                                                    <input id="" name="" type="text" class="k-input" value="" placeholder=" ">
                                                    <i class="ic ic-bt-input-remove"></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap input_w0">
                                                    <input id="" name="" type="text" class="k-input" value="" disabled="disabled" placeholder=" ">
                                                    <i class="ic ic-bt-input-remove"></i>
                                                </div>
                                            </li>
                                        </ul>
                                        <p class="desc">중요도 Factor x 발생빈도 Factor = 심각도 Factor</p>
                                    </td>
                                </tr>
                                <tr>
                                    <th>진단계수</th>
                                    <td>
                                        <ul class="flex_left">
                                            <li>
                                                <div class="input_wrap input_w0">
                                                    <input id="" name="" type="text" class="k-input" value="" placeholder=" ">
                                                    <i class="ic ic-bt-input-remove"></i>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="input_wrap input_w0">
                                                    <input id="" name="" type="text" class="k-input" value="" disabled="disabled" placeholder=" ">
                                                    <i class="ic ic-bt-input-remove"></i>
                                                </div>
                                            </li>
                                        </ul>
                                        <p class="desc">누적회수 x 심각도 Factor = 진단계수</p>
                                    </td>
                                </tr>
                                <tr>
                                    <th>대응방법</th>
                                    <td>
                                        <div id="dropDownList4" class="select_w2"></div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </li>
                        <li>
                            <div class="title">Dev_103 통신 에러</div>
                        </li>

                    </ul>
                </div>
            </div>

            <!-- 모달 내용 영역 : 상세정보 끝-->
            <!-- 모달 전체 버튼 영역 S-->
            <div class="sweet_modal_buttongroup">
                <button type="button"  @click="closeModal" class="k-button">취소</button>
                <button type="button"  @click="closeModal" class="k-button" disabled="disabled">추가</button>
            </div>
        </div>
        <!-- 모달 기본 스타일 끝 -->
    </sweet-modal>
</template>

<script>
    export default {
        name: "MaintainDiagnosisEditModal",
        components: {},
        props: [ 'itemList' ],
        data: function() {
            return {

            }
        },
        methods: {
            openModal() {
                this.$refs.maintainDiagnosisEditModal.open();
            },

            closeModal() {
                this.$refs.maintainDiagnosisEditModal.close();
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