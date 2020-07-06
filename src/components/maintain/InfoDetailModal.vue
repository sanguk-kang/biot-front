<template>
    <sweet-modal ref="infoDetailModal" overlay-theme="dark" id="sweet_modal_style" width="1240px">
        <!-- 모달 기본 스타일 S -->
        <div style="width:1180px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                유지보수 대상기기
            </div>
            <!-- 모달 제목 영역 E-->

            <!-- 모달 내용 영역 : 상세정보 S-->
            <div class="sweet_modal_content">
                <div data-role="grid" class="k-grid k-widget" style="height: 550px;">
                    <div class="k-grid-header" style="padding-right: 17px;">
                        <div class="k-grid-header-wrap k-auto-scrollable">
                            <table role="grid">
                                <colgroup>
                                    <col style="width:240px">
                                    <col>
                                    <col>
                                    <col style="width:150px">
                                    <col>
                                </colgroup>

                                <thead role="rowgroup">
                                    <tr role="row">
                                        <th class="k-header" scope="col"><a class="k-link" href="#">디바이스 타입</a></th>
                                        <th class="k-header" scope="col"><a class="k-link" href="#">디바이스 ID</a></th>
                                        <th class="k-header" scope="col"><a class="k-link" href="#">디바이스 이름</a></th>
                                        <th class="k-header" scope="col"><a class="k-link" href="#">그룹 이름</a></th>
                                        <th class="k-header" scope="col"><a class="k-link" href="#">제조 번호</a></th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>

                    <div class="k-grid-content k-auto-scrollable">
                        <table role="grid" style="height: auto;">
                            <colgroup>
                                <col style="width:240px">
                                <col>
                                <col>
                                <col style="width:150px">
                            </colgroup>

                            <tbody role="rowgroup">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <!-- 모달 내용 영역 : 상세정보 E-->

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
    name: "InfoDetailModal",
    components : {},
    props : [],
    data: function() {
        return {
        }
    },
    methods: {
        openModal() {
            this.$refs.infoDetailModal.open();
        },

        closeModal() {
            this.$refs.infoDetailModal.close();
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