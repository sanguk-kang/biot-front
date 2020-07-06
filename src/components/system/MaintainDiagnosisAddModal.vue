<template>
    <sweet-modal
            ref="maintainDiagnosisAddModal"
            overlay-theme="dark"
            id="sweet_modal_style"
    >
        <div style="width:820px;height:830px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                추가
            </div>
            <!-- 모달 내용 영역 : 상세정보 시작-->
            <div class="sweet_modal_content">
                <div class="detail-dialog-detail-content">
                    <!-- s:scroll-->
                    <table class="pop_table view_type">
                        <colgroup>
                            <col style="width: 210px;">
                            <col>
                        </colgroup>
                        <tbody>
                        <tr class="side_line">
                            <th>Error Code</th>
                            <td>
                                <ul class="flex_left">
                                    <li>
                                        <div class="input_wrap">
                                            <input id="" name="" type="text" class="k-input" value="12345"  placeholder=" ">
                                            <i class="ic ic-bt-input-remove"></i>
                                        </div>
                                    </li>
                                    <li><button class="k-button btn_w1">Search</button></li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <th>Error Classification</th>
                            <td>
                                <div class="input_wrap">
                                    <input id="" name="" type="text" class="k-input" value="" disabled="disabled" placeholder=" ">
                                    <i class="ic ic-bt-input-remove"></i>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Error Content</th>
                            <td>
                                <div class="input_wrap">
                                    <input id="" name="" type="text" class="k-input" value="" disabled="disabled" placeholder=" ">
                                    <i class="ic ic-bt-input-remove"></i>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Factor</th>
                            <td>
                                <div class="input_wrap">
                                    <input id="" name="" type="text" class="k-input" value="" disabled="disabled" placeholder=" ">
                                    <i class="ic ic-bt-input-remove"></i>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Inspection Classification</th>
                            <td>
                                <div class="input_wrap">
                                    <input id="" name="" type="text" class="k-input" value="" disabled="disabled" placeholder=" ">
                                    <i class="ic ic-bt-input-remove"></i>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Importance</th>
                            <td>
                                <div id="dropDownList1" class="select_w2"></div>
                            </td>
                        </tr>
                        <tr>
                            <th>Severity Factor</th>
                            <td>
                                <ul class="flex_left">
                                    <li>
                                        <div class="input_wrap input_w0">
                                            <input id="" name="" type="text" class="k-input" value=""  placeholder=" ">
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
                                <p class="desc">Criticality Factor x Frequency Factor = Severity Factor</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Diagnostic Factor</th>
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
                                <p class="desc">Cumulative count x severity factor = diagnostic factor</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Response Method</th>
                            <td>
                                <div id="dropDownList2" class="select_w2"></div>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <!-- e:scroll-->
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
        name: "MaintainDiagnosisAddModal",
        components: {},
        props: [ 'itemList' ],
        data: function() {
            return {

            }
        },
        methods: {
            openModal() {
                this.$refs.maintainDiagnosisAddModal.open();
            },

            closeModal() {
                this.$refs.maintainDiagnosisAddModal.close();
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