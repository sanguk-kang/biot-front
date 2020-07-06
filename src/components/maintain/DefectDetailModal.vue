<template>
    <sweet-modal ref="defectDetailModal" overlay-theme="dark" id="sweet_modal_style" width="1240px">
        <!-- 모달 기본 스타일 S -->
        <div style="width:1180px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                상세정보
            </div>
            <!-- 모달 제목 영역 E-->

            <!-- Accordion 모달 내용 영역 S-->
            <div class="sweet_modal_stitle">
                <p class="stitle">{{ itemList.length }}개의
                    <span v-if="searchType ==0">고장 이력</span>
                    <span v-else>진단 코드</span>
                    선택
                </p>
            </div>

            <div class="sweet_modal_content">
                <div class="toggle_list">
                    <ul>
                        <li  v-for="item in itemList" v-bind:key="item.faultId">
                            <div class="title open">{{ item.faultId }}</div>

                            <table class="pop_table view_type">
                                <colgroup>
                                    <col style="width: 210px;">
                                    <col>
                                </colgroup>

                                <tbody>
                                    <tr class="pop_table_subtitle">
                                        <th>디바이스 정보</th>
                                    </tr>

                                    <tr>
                                        <th>사이트</th>
                                        <td>{{ item.siteName }}</td>
                                    </tr>

                                    <tr>
                                        <th>디바이스 타입</th>
                                        <td>{{ item.deviceType }}</td>
                                    </tr>

                                    <tr>
                                        <th>디바이스 ID</th>
                                        <td>{{ item.deviceId }}</td>
                                    </tr>

                                    <tr>
                                        <th>제조 번호</th>
                                        <td>{{ item.manufacturingNumber }}</td>
                                    </tr>

                                    <tr>
                                        <th>그룹 이름</th>
                                        <td>{{ item.gorupName }}</td>
                                    </tr>

                                    <tr class="pop_table_subtitle">
                                        <th>에러</th>
                                    </tr>

                                    <tr>
                                        <th>에러코드</th>
                                        <td>{{ item.deviceErrorCode }}</td>
                                    </tr>

                                    <tr>
                                        <th>구분</th>
                                        <td>{{ item.deviceErrorType }}</td>
                                    </tr>

                                    <tr>
                                        <th>설명</th>
                                        <td>{{ item.message }}</td>
                                    </tr>

                                    <tr>
                                        <th>누적 회수</th>
                                        <td>{{ item.cumulativeNumber }}</td>
                                    </tr>

                                    <tr>
                                        <th>진단 계수</th>
                                        <td>{{ item.diagnosticCoefficient }}</td>
                                    </tr>

                                    <tr>
                                        <th>발생 시간</th>
                                        <td>{{ item.createdTime }}</td>
                                    </tr>

                                    <tr v-if="searchType == 0">
                                        <th>해결일</th>
                                        <td>{{ item.endTime }}</td>
                                    </tr>

                                    <tr>
                                        <th>대응방법</th>
                                        <td>{{ item.actionTypeCodeId }}</td>
                                    </tr>

                                    <tr class="pop_table_subtitle" v-if="searchType == 1">
                                        <th>조치 결과</th>
                                    </tr>

                                    <tr v-if="searchType == 1">
                                        <th>진단 코드</th>
                                        <td>{{ item.diagnosticCode }}</td>
                                    </tr>

                                    <tr v-if="searchType == 1">
                                        <th>조치 결과</th>
                                        <td>{{ item.actionResult }}</td>
                                    </tr>

                                    <tr v-if="searchType == 1">
                                        <th>조치 완료일</th>
                                        <td>{{ item.actionCompletionDate }}</td>
                                    </tr>

                                    <tr v-if="searchType == 1">
                                        <th>전수 번호</th>
                                        <td>{{ item.serviceNumber }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- Accordion 모달 내용 영역 E-->

            <!-- 모달 전체 버튼 영역 S-->
            <div class="sweet_modal_buttongroup">
                <button type="button"  v-on:click="closeModal" class="k-button">닫기</button>
            </div>
            <!-- 모달 전체 버튼 영역 E-->
        </div>
        <!-- 모달 기본 스타일 E -->
    </sweet-modal>
</template>

<script>
export default {
    name: "DefectDetailModal",
    components: {},
    props: [ 'searchType', 'detailItemList' ],
    data: function() {
        return {
            itemList: this.detailItemList,
            idList : []
        }
    },
    watch: {
        detailItemList: {
            handler: function() {
                this.init();
            },
            immediate: true,
        }
    },
    methods: {
        openAlert: function(title, msg) {
            this.$alert(msg, 'Title', {
                title: title, confirmButtonText: 'OK', dangerouslyUseHTMLString: true
            });
        },

        openModal: function() {
            this.$refs.defectDetailModal.open();
            this.init();
        },

        closeModal: function() {
            this.$refs.defectDetailModal.close();
        },

        init: function() {
            if (this.detailItemList.length  > 0) {
                this.itemList = this.detailItemList;
            }
        }
    },
    created() {
        this.init();
    },
    mounted() {
    },
    destroyed() {
    }
}
</script>

<style lang="scss" scoped>

tr.pop_table_subtitle > th {
    color: #000000;
    font-weight: bold;
}

</style>