<template>
    <sweet-modal
            ref="licenseAddModal"
            overlay-theme="dark"
            id="sweet_modal_style"
    >
        <!-- 모달 기본 스타일 시작 -->
        <div style="width:560px;"><!-- 모달창 사이즈 조절 부부입니다.-->
            <div class="sweet_modal_title">
                라이선스  등록
            </div>
            <div class="sweet_modal_content">
                <div id="popup-confirm" data-role="commondialog" class="k-content">
                    <div class="pop-confirm-contbox ">
                        <div class="pop-confirm-detailbox ">
                            <p class="d1_text">발급받은 라이선스 키를 입력하세요.</p>
                            <table class="pop_table mt10">
                                <colgroup>
                                    <col style="width: 150px; ">
                                    <col>
                                </colgroup>
                                <tbody>
                                <tr>
                                    <th>라이선스 키</th>
                                    <td>
                                        <div class="input_wrap">
                                            <input id="" name="" type="text" class="k-input" value=" " placeholder=" ">
                                            <i class="ic ic-bt-input-remove"></i>
                                            <!-- 오류있을 경우-->
                                            <span class="k-tooltip-validation k-invalid-msg" data-for="">invalid characters are used</span>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sweet_modal_buttongroup">
                <button type="button" @click="closeModal" class="k-button">닫기</button>
                <button type="button" @click="closeModal" class="k-button">저장</button>
            </div>
        </div>
        <!-- 모달 기본 스타일 끝 -->
    </sweet-modal>
</template>

<script>
    export default {
        name: "LicenseAddModal",
        components: {},
        props: [ 'itemList' ],
        data: function() {
            return {

            }
        },
        methods: {
            openModal() {
                this.$refs.licenseAddModal.open();
            },

            closeModal() {
                this.$refs.licenseAddModal.close();
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