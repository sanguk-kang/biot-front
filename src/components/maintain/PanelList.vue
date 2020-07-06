<template>
    <div class="side_wrap">
        <div class="content_title_wrap">
            <ul class="right_area icon_type">
                <li><button class="k-button" v-on:click="setKakaoAlarm">카카오톡 알람 설정</button></li>
                <li><button class="k-button" v-on:click="purchase">종합세척 상품 구매</button></li>
            </ul>
        </div>

        <div class="content_title_wrap no_title">
            <ul class="flex_left">
                <li>
                    <div id="el_calendar">
                        <el-date-picker ref="elStartDate" v-model="elStartDate" type="date"></el-date-picker>
                        <span> ~ </span>
                        <el-date-picker ref="elEndDate" v-model="elEndDate" type="date"></el-date-picker>
                    </div>
                </li>

                <li>
                    <button class="k-button btn_w1" v-on:click="search">조회</button>
                </li>

                <li><span class="ic-bar"></span></li>

                <li style="width: 140px;">
                    <el-select v-model="statusCode" v-on:change="search">
                        <el-option v-for="item in statusCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key"></el-option>
                    </el-select>
                </li>
            </ul>
        </div>

        <div class="site-list-wrap">
            <section class="content_view">
                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width:auto"><!-- 디바이스 이름 -->
                            <col style="width:200"><!-- 그룹 이름 -->
                            <col style="width:200px"><!-- 필터 누적 사용 시간 -->
                            <col style="width:200px"><!-- 설명 -->
                            <col style="width:200px"><!-- 필터 세척 알람 -->
                            <col style="width:150px"><!-- 알람 예정-->
                            <col style="width:150px"><!-- 조치 완료-->
                        </colgroup>

                        <thead>
                            <tr>
                                <th>디바이스 이름 S</th>
                                <th>그룹 이름 S</th>
                                <th>필터 누적 사용 시간</th>
                                <th>설명</th>
                                <th>필터 세척 알람</th>
                                <th>알람 예정</th>
                                <th>조치 완료</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr  v-for="item in itemList" v-bind:key="item.deviceName">
                                <td>{{ item.deviceName }}</td>
                                <td>{{ item.groupName }}</td>
                                <td>{{ item.filterCumulativeUsageTime }}</td>
                                <td>{{ item.explanation }}</td>

                                <td>
                                    <el-select v-model="filterAlarmCode" v-on:change="search">
                                        <el-option v-for="item in filterAlarmCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key" v-on:change="setFilterAlarm(item.filterCleaningAlarm)"></el-option>
                                    </el-select>
                                </td>

                                <td>{{ item.alarmTime }}</td>
                                <td>
                                    <div v-if="item.endTime == null">
                                        <button class="k-button btn_w1" v-on:click="setEndTime(item.deviceName)">세척 완료</button>
                                    </div>

                                    <div v-else>
                                        {{ item.endTime }}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <!-- <panelKakaoAlarmlModal ref="panelKakaoAlarmlModal"></panelKakaoAlarmlModal> -->
    </div>
</template>

<script>
import axios from "@/api/axios.js";
import moment from "moment";

export default {
    name: "PanelList",
    components: { },
    props: [],
    data: function() {
        return {
            /* search condition variable */
            elStartDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
            elEndDate: moment().format('YYYY-MM-DD'),
            query: {},
            statusCode: '',
            filterAlarmCode: '',

            /* role variable */
            role: 'administrator',

            /* table, modal variable*/
            itemList: [],

            /* code variable */
            statusCodeList: [ { key: "", value: "전체 상태" }, { key: "65G001", value: "세척 대기" }, { key: "65G002", value: "세척 완료" } ],
            filterAlarmCodeList: [ { key: "", value: "전체 상태" }, { key: "71G001", value: "1주일 후 다시 알람" }, { key: "71G002", value: "알람 끄기" } ]
        }
    },
    methods: {
        openAlert: function(title, msg) {
            this.$alert(msg, 'Title', {
                title: title, confirmButtonText: 'OK', dangerouslyUseHTMLString: true
            });
        },

        search: function() {
            let alert = this;

            var params = {};
            params.startDate = moment(this.elStartDate).format('YYYYMMDD');
            params.endDate = moment(this.elEndDate).format('YYYYMMDD');
            params.statusCode = this.statusCode;

            var diff = moment(params.endDate).diff(params.startDate);
            if(diff < 0) {
                alert.openAlert("공청 판넬 세척", "시작일이 종료일보다 빠르게 설정되었습니다.\n시작일과 종료일을 동일하게 맞추어 조회합니다.");''

                this.elStartDate = this.elEndDate;
                params.startDate = params.endDate;
            }

            console.log("[ API ]  : 공청 판넬 세척 리스트 조회 (/api/sms/maintenance/getAirCleaningWashingList)", params);

            axios.getApi('/sms/maintenance/getAirCleaningWashingList', params).then(response => {
                this.itemList = response.data;
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("공청 판넬 세척", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        },

        setKakaoAlarm: function() {
            let alert = this;
            alert.openAlert("공청 판넬 세척", "Site admin : 운영 > 알람 > 유지보수 > 카톡 알람 설정 OP-1303 팝업 호출 \n Cloud admin : 운영 > 알람 > 관리자 알람 > 카톡 알람 설정 OP-1403 팝업 호출");
        },

        purchase: function() {
            let alert = this;
            alert.openAlert("공청 판넬 세척", "클릭 시 해당 링크로 새창 이동 > 연결 링크 수급 필요");

            //window.open("https://www.naver.com/", "_blank");
        },

        setFilterAlarm: function(params) {
            let alert = this;

            console.log("[ API ]  : 필터세척 알람 설정 (/api/sms/maintenance/filterCleaningAlarmSetting)", params);

            axios.postApi('/sms/maintenance/filterCleaningAlarmSetting', params).then(response => {
                if (response.status == 200) {
                    alert.openAlert("공청 판넬 세척", "필터 세척 알람이 설정되었습니다.");''
                }
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("공청 판넬 세척", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        },

        setEndTime: function(params) {
            let alert = this;

            console.log("[ API ]  : 조치완료 처리 (/api/sms/maintenance/ActionCompletionProcessing)", params);

            axios.postApi('/sms/maintenance/ActionCompletionProcessing', params).then(response => {
                if (response.status == 200) {
                    alert.openAlert("공청 판넬 세척", "세척 완료 처리되었습니다.");''
                }
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("공청 판넬 세척", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        }
    },
    computed: {
    },
    created() {
    },
    mounted() {
        this.search();
    },
    destroyed() {
    }
}

</script>

<style lang="scss">

.el-select {
    width: 150px;
}

.el-date-editor.el-input {
    width: 160px !important;
}

.el-icon-date {
    cursor: pointer;
}

</style>