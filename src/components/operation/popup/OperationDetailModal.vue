<template>
    <sweet-modal ref="deviceDetailModal" overlay-theme="dark" id="sweet_modal_style">
        <!-- 모달 기본 스타일 S -->
        <div style="width:820px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                상세정보
            </div>
            <!-- 모달 제목 영역 E-->

            <!-- Accordion 모달 내용 영역 S-->
            <div class="sweet_modal_stitle">
                <p class="stitle">개의 디바이스 선택</p>
                <!-- <p class="date">정상</p> -->
            </div>

            <div class="sweet_modal_content">
                <div class="toggle_list">
                    <ul>
                        <li v-for="item in itemList" v-bind:key="item.id">
                            <div class="title open">
                                음..
                            </div>

                            <table class="pop_table view_type">
                                <colgroup>
                                    <col style="width: 210px;">
                                    <col>
                                </colgroup>

                                <tbody>
                                    <tr>
                                        <th>알람 타입</th>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th>발생 시간</th>
                                        <td>{{ item.eventTime }}</td>
                                    </tr>
                                    <tr>
                                        <th>해결 시간</th>
                                        <td>{{ item.resolutionTime }}</td>
                                    </tr>
                                    <tr>
                                        <th>기기 타입</th>
                                        <td>{{ item.deviceType }}</td>
                                    </tr>
                                    <tr>
                                        <th>기기 ID</th>
                                        <td>{{ item.deviceRealId }}</td>
                                    </tr>
                                    <tr>
                                        <th>기기 이름</th>
                                        <td>{{ item.deviceName }}</td>
                                    </tr>
                                    <tr>
                                        <th>그룹</th>
                                        <td>{{ item.subGroupName }}</td>
                                    </tr>
                                    <tr>
                                        <th>알람 코드</th>
                                        <td>{{ item.errorCode }}</td>
                                    </tr>
                                    <tr>
                                        <th>설명</th>
                                        <td>-</td>
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
// import axios from "@/api/axios.js";
export default {
    name: "DeviceDetailModal",
    components: {},
    props: [ 'itemList' ],
    data: function() {
        return {
            detailList: [],
            rowData : {},
            /* 에너지미터 타입 - Meter_WattHour, Meter_Gas, Meter_Water */
        }
    },
    watch: {
    },
    methods: {
        init() {
            this.detailList = this.deviceDetailList;
        },
        openModal() {
            console.log("*** openModal");
            this.$refs.deviceDetailModal.open();
            //this.search();
        },
        closeModal() {
            this.$refs.deviceDetailModal.close();
        },
    },
    created() {
        console.log("DeviceDetailModal.vue created() call!!");
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