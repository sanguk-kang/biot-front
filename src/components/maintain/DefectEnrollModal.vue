<template>
    <sweet-modal ref="defectEnrollModal" overlay-theme="dark" id="sweet_modal_style" width="600px">
        <!-- 모달 기본 스타일 S -->
        <div style="width:540px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                조치 결과 등록
            </div>
            <!-- 모달 제목 영역 E-->

            <!-- 모달 내용 영역 : 상세정보 S-->
            <div class="sweet_modal_content">
                <table class="pop_table view_type mgt">
                    <colgroup>
                        <col style="width: 200px;">
                        <col>
                    </colgroup>

                    <tbody>
                        <tr>
                            <th>출동 타입</th>
                            <td>
                                <div class="radio_wrap ft_td">
                                    <span class="radioLabel">
                                        <input type="radio" class="k-radio" name="rd-goOnsite" id="rd-goOnsite-t" v-bind:value="true" v-model="goOnsite">
                                        <label class="k-radio-label" for="rd-goOnsite-t">출동</label>
                                    </span>

                                    <span class="radioLabel">
                                        <input type="radio" class="k-radio" name="rd-goOnsite" id="rd-goOnsite-f" v-bind:value="false" v-model="goOnsite">
                                        <label class="k-radio-label" for="rd-goOnsite-f">비출동</label>
                                    </span>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th>현장 확인</th>
                            <td>
                                <div class="radio_wrap ft_td">
                                    <span class="radioLabel">
                                        <input type="radio" class="k-radio" name="rd-onsiteConfirmation" id="rd-onsiteConfirmation-t" v-bind:value="true" v-model="onsiteConfirmation">
                                        <label class="k-radio-label" for="rd-onsiteConfirmation-t">진성</label>
                                    </span>

                                    <span class="radioLabel">
                                        <input type="radio" class="k-radio" name="rd-onsiteConfirmation" id="rd-onsiteConfirmation-f" v-bind:value="false" v-model="onsiteConfirmation">
                                        <label class="k-radio-label" for="rd-onsiteConfirmation-f">가성</label>
                                    </span>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th>조치 결과</th>
                            <td>
                                <el-select v-model="resolutionResult">
                                    <el-option v-for="item in resultCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.value"></el-option>
                                </el-select>
                            </td>
                        </tr>

                        <tr>
                            <th>조치 완료일</th>
                            <td>
                                <el-date-picker ref="resolutionTime" v-model="resolutionTime" type="date"></el-date-picker>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- 모달 내용 영역 : 상세정보 E-->

            <!-- 모달 전체 버튼 영역 S-->
            <div class="sweet_modal_buttongroup">
                <button type="button"  v-on:click="closeModal" class="k-button">취소</button>
                <button type="button"  v-on:click="save" class="k-button">저장</button>
            </div>
            <!-- 모달 전체 버튼 영역 E-->
        </div>
        <!-- 모달 기본 스타일 E -->
    </sweet-modal>
</template>

<script>
import axios from "@/api/axios.js";
import moment from "moment";

export default {
    name: "DefectEnrollModal",
    components: {},
    props: [ 'faultId' ],
    data: function() {
        return {
            /* field variable */
            goOnsite: '',
            onsiteConfirmation: '',
            resolutionResult: '',
            resolutionTime: moment().format('YYYY-MM-DD'),

            /* code variable */
            resultCodeList: [ { key: "refair", value: "수리" } , { key: "replace", value: "교체" } , { key: "service", value: "상담" } ]
        }
    },
    methods: {
        openAlert: function(title, msg) {
            this.$alert(msg, 'Title', {
                title: title, confirmButtonText: 'OK', dangerouslyUseHTMLString: true
            });
        },

        openModal: function() {
            this.$refs.defectEnrollModal.open();
        },

        closeModal: function() {
            this.$refs.defectEnrollModal.close();
        },

        save: function() {
            let alert = this;

            if(this.resolutionResult == '' || this.resolutionTime == '') {
                this.openAlert("진단 현황", "출동타입, 현장확인, 조치결과, 조치완료일은 필수값입니다.");''
                return false;
            }

            var params = {};
            params.faultId = this.faultId;
            params.goOnsite = this.goOnsite;
            params.onsiteConfirmation = this.onsiteConfirmation;
            params.resolutionResult = this.resolutionResult;
            params.resolutionTime = this.resolutionTime;

            console.log("[ API ]  : 조치완료 처리 (/api/sms/maintenance/diagnosticStatusAdd)", params);

            axios.postApi('/sms/maintenance/diagnosticStatusAdd', params).then(response => {
                if (response.status == 201) {
                    alert.openAlert("진단 현황", "조치 결과 등록이 완료되었습니다.");''
                    this.closeModal() ;
                }
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("진단 현황", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
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