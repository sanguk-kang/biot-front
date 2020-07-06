<template>
    <sweet-modal ref="inspectionDetailModal" overlay-theme="dark" id="sweet_modal_style" width="1240px">
        <!-- 모달 기본 스타일 S -->
        <div style="width:1180px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                상세정보
            </div>
            <!-- 모달 제목 영역 E-->

            <!-- Accordion 모달 내용 영역 S-->
            <div class="sweet_modal_stitle">
                <p class="stitle">{{ itemList.length }}개의 점검 현황 선택</p>
                <!-- <p class="date">정상</p> -->
            </div>

            <div class="sweet_modal_content">
                <div class="toggle_list">
                    <ul>
                        <li  v-for="item in itemList" v-bind:key="item.serviceNumber">
                            <div class="title open">{{ item.serviceNumber }}</div>

                            <table class="pop_table view_type">
                                <colgroup>
                                    <col style="width: 210px;">
                                    <col>
                                </colgroup>

                                <tbody>
                                    <tr class="pop_table_subtitle">
                                        <th>일반</th>
                                    </tr>

                                    <tr>
                                        <th>서비스 번호</th>
                                        <td>{{ item.key1 }}</td>
                                    </tr>

                                    <tr>
                                        <th>카테고리</th>
                                        <td>{{ item.key2 }}</td>
                                    </tr>

                                    <tr>
                                        <th>서비스 기사</th>
                                        <td>{{ item.key3 }}</td>
                                    </tr>

                                    <tr>
                                        <th>센터명</th>
                                        <td>{{ item.key4 }}</td>
                                    </tr>

                                    <tr>
                                        <th>재방문</th>
                                        <td>{{ item.key5 }}</td>
                                    </tr>

                                    <tr>
                                        <th>방문 일자</th>
                                        <td>{{ item.key1 }}</td>
                                    </tr>

                                    <tr>
                                        <th>완료 일자</th>
                                        <td>{{ item.key1 }}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="pop_table_subtitle">제품 종류</div>

                            <div data-role="grid" class="k-grid k-widget">
                                <div class="k-grid-header" style="padding-right: 17px;">
                                    <div class="k-grid-header-wrap k-auto-scrollable">
                                        <table role="grid">
                                            <colgroup>
                                                <col style="width: 60px;">
                                                <col style="width: 150px;">
                                                <col style="width: 150px;">
                                                <col style="width: auto;">
                                                <col style="width: 200px;">
                                                <col style="width: 200px;">
                                                <col style="width: 200px;">
                                                <col style="width: 100px;">
                                                <col style="width: 200px;">
                                                <col style="width: 200px;">
                                            </colgroup>

                                            <thead role="rowgroup">
                                                <tr role="row">
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">NO</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">디바이스 타입</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">디바이스 이름</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">제조 번호</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">모델 코드</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">자재 코드</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">자재명</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">비용</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">접수 내용</a></th>
                                                    <th class="k-header" scope="col"><a class="k-link" href="#">처리 내용</a></th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div class="k-grid-content k-auto-scrollable">
                                <table role="grid" style="height: auto;">
                                    <colgroup>
                                        <col style="width: 60px;">
                                        <col style="width: 150px;">
                                        <col style="width: 150px;">
                                        <col style="width: auto;">
                                        <col style="width: 200px;">
                                        <col style="width: 200px;">
                                        <col style="width: 200px;">
                                        <col style="width: 100px;">
                                        <col style="width: 200px;">
                                        <col style="width: 200px;">
                                    </colgroup>

                                    <tbody role="rowgroup">
                                        <tr  v-for="(item, index) in itemList" v-bind:key="item.key3">
                                            <td>{{ index + 1 }}</td>
                                            <td>{{ item.deviceType }}</td>
                                            <td>{{ item.deviceName }}</td>
                                            <td>{{ item.deviceName }}</td>
                                            <td>{{ item.modelCode }}</td>
                                            <td>{{ item.materialCode }}</td>
                                            <td>{{ item.materialName }}</td>
                                            <td>{{ item.cost }}</td>
                                            <td>{{ item.receptionContents }}</td>
                                            <td>{{ item.processingContents }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
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
    name: "InspectionDetailModal",
    components: {},
    props: [ 'itemList' ],
    data: function() {
        return {

        }
    },
    methods: {
        openModal() {
            this.$refs.inspectionDetailModal.open();
        },

        closeModal() {
            this.$refs.inspectionDetailModal.close();
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

tr.pop_table_subtitle > th {
    color: #000000;
    font-weight: bold;
}

div.pop_table_subtitle {
    padding: 10px 0;
    font-weight: bold;
}

</style>