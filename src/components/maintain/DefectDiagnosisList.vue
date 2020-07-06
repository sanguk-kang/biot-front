<template>
    <div class="side_wrap">
        <div class="content_title_wrap">
            <ul class="right_area icon_type">
                <li>
                    <div class="search_input_wrap">
                        <input class="k-input" type="text" placeholder="검색 내용 입력" v-model="query" v-on:keyup.enter="highlight(query)">
                        <span class="ic ic-bt-input-remove"></span>
                        <!-- 디바이스 이름, 제조번호,  에러코드만 가능-->
                        <span class="ic ic-bt-input-search" id="ic-highlight" v-on:click="highlight(query)"></span>
                    </div>
                </li>
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

                <li>
                    <el-select v-model="typeCode" v-on:change="search">
                        <el-option v-for="item in typeCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key"></el-option>
                    </el-select>
                </li>

                <li>
                    <el-select v-model="factorCode" v-on:change="search">
                        <el-option v-for="item in factorCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key"></el-option>
                    </el-select>
                </li>

                <li>
                    <el-select v-model="inspectionTypeCode" v-on:change="search">
                        <el-option v-for="item in inspectionTypeCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key"></el-option>
                    </el-select>
                </li>

                <li>
                    <el-select v-model="actionTypeCodeIdCode" v-on:change="search">
                        <el-option v-for="item in actionTypeCodeIdCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key"></el-option>
                    </el-select>
                </li>

                <li><span class="ic-bar"></span></li>

                <li>
                    <button class="k-button btn_w1" v-on:click="toExcel">내보내기</button>
                </li>
            </ul>

            <ul class="right_area icon_type">
                <li><span class="selected_text">{{ checkedCountText }}</span></li>
                <li><button class="k-button" v-bind:disabled="total == 0 || checked.length == 0" v-on:click="openDetailPop($event)">상세정보</button></li>
            </ul>
        </div>

        <div class="site-list-wrap">
            <section class="content_view">
                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width:60px"><!-- chkbox -->
                            <col style="width:150px"><!-- 진단코드 -->
                            <col style="width:auto"><!-- 디바이스 이름 -->
                            <col style="width:150px"><!-- 제조 번호 -->
                            <col style="width:130px"><!-- 에러 코드 -->
                            <col style="width:130px"><!-- 에러 타입 -->
                            <col style="width:120px" v-if="role == 'cloudAdmin' || role == 'maintenance'"><!-- 누적 회수-->
                            <col style="width:120px" v-if="role == 'cloudAdmin' || role == 'maintenance'"><!-- 진단 계수-->
                            <col style="width:140px"><!-- 발생 시간-->
                            <col style="width:130px"><!-- 조치 완료-->
                            <col style="width:120px"><!-- 출동 타입-->
                            <col style="width:120px"><!-- 확인 결과-->
                            <col style="width:120px"><!-- 상세 정보-->
                        </colgroup>

                        <thead>
                            <tr>
                                <th>
                                    <span class="checkLabel">
                                        <input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAll">
                                        <label class="k-checkbox-label single" for="ched_all"></label>
                                    </span>
                                </th>
                                <th>진단코드  <i class="ic_sort"></i></th>
                                <th>디바이스 이름  <i class="ic_sort up"></i></th>
                                <th>제조 번호 <i class="ic_sort"></i></th>
                                <th>에러 코드  <i class="ic_sort"></i></th>
                                <th>에러 타입 <i class="ic_sort"></i></th>
                                <th v-if="role == 'cloudAdmin' || role == 'maintenance'">누적 회수 <i class="ic_sort"></i></th>
                                <th v-if="role == 'cloudAdmin' || role == 'maintenance'">진단 계수 <i class="ic_sort"></i></th>
                                <th>발생 시간 <i class="ic_sort"></i></th>
                                <th>조치 완료 <i class="ic_sort"></i></th>
                                <th>출동 타입 <i class="ic_sort"></i></th>
                                <th>확인 결과 <i class="ic_sort"></i></th>
                                <th>상세 정보</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr  v-for="item in itemList" v-bind:key="item.diagnosticCode">
                                <td>
                                    <span class="checkLabel">
                                        <input type="checkbox" class="k-checkbox" name="ched" v-bind:id="'defect' + item.faultId" v-bind:value="'defect' + item.faultId" v-model="checked" v-on:click="chkChange($event)">
                                        <label class="k-checkbox-label single" v-bind:for="'defect' + item.faultId"></label>
                                    </span>
                                </td>

                                <td>{{ item.diagnosticCode }}</td>
                                <td>{{ item.deviceName }}</td>
                                <td>{{ item.serialNo }}</td>
                                <td>{{ item.deviceErrorCode }}</td>
                                <td>{{ item.deviceErrorTypeCode }}</td>
                                <td v-if="role == 'cloudAdmin' || role == 'maintenance'">{{ item.cumulativeNumber }}</td>
                                <td v-if="role == 'cloudAdmin' || role == 'maintenance'">{{ item.diagnosticCoefficient }}</td>
                                <td>{{ item.createdTime }}</td>

                                <td>
                                    <div v-if="item.resolutionTime == null || item.resolutionTime == ''">
                                        <button class="k-button btn_w1" v-on:click="openEnrollPop(item.faultId)">등록</button>
                                    </div>

                                    <div v-else>
                                        {{ item.resolutionTime }}
                                    </div>
                                </td>

                                <td>
                                    <span v-if="item.goOnsite">출동</span>
                                    <span v-else>비출동</span>
                                </td>

                                <td>{{ item.onsiteConfirmation }}</td>
                                <td><span class="ic ic-info" v-on:click="openDetailPop($event, item.faultId)"></span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <defectEnrollModal ref="defectEnrollModal" v-bind:key="faultId" v-bind:faultId="faultId"></defectEnrollModal>
        <defectDetailModal ref="defectDetailModal" v-bind:key="total" v-bind:searchType="searchType" v-bind:detailItemList.sync="detailItemList"></defectDetailModal>
    </div>
</template>

<script>
import axios from "@/api/axios.js";
import moment from "moment";
import DefectDetailModal from '@/components/maintain/DefectDetailModal.vue';
import DefectEnrollModal from '@/components/maintain/DefectEnrollModal.vue';

export default {
    name: "DefectDiagnosisList",
    components: { DefectDetailModal, DefectEnrollModal },
    props: [],
    data: function() {
        return {
            /* selected variable */
            total: 0,
            checked: [],
            checkedCountText: '선택된 진단 코드가 없습니다.',

            /* search condition variable */
            elStartDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
            elEndDate: moment().format('YYYY-MM-DD'),
            searchType: 1,
            typeCode: '',
            factorCode: '',
            inspectionTypeCode: '',
            actionTypeCodeIdCode: '',
            query: '',

            /* role variable */
            role: 'administrator',

            /* table, modal variable*/
            itemList: [],
            detailIdList: [],
            detailItemList: [],
            faultId: '',

             /* code variable */
            typeCodeList: [
                { key: "", value: "전체 에러 타입" }, { key: "61G001", value: "통신에러" }, { key: "61G002", value: "실내기" }, { key: "61G003", value: "MCU" }, { key: "61G004", value: "실외기" }, { key: "61G005", value: "옵션기기" }, { key: "61G006", value: "GHP" }, { key: "61G007", value: "EHS" }
            ],
            factorCodeList: [
                { key: "", value: "전체 요인" }, { key: "62G001", value: "설치불량/외부요인" }, { key: "62G0010", value: "인버터고장검지모드" }, { key: "62G0011", value: "엔진고장(GHP)" }, { key: "62G002", value: "설치불량" }, { key: "62G003", value: "센서고장" }, { key: "62G004", value: "밸브고장" }, { key: "62G005", value: "전장부품고장" }
            ],
            inspectionTypeCodeList: [
                { key: "", value: "전체 점검 구분" }, { key: "63G001", value: "설치/옵션설정 이상" }, { key: "63G0010", value: "실외기 압축기 이상" }, { key: "63G002", value: "GHP 엔진 이상" }, { key: "63G003", value: "실내기 센서류 이상" }, { key: "63G004", value: "실내기 밸브류 이상" }, { key: "63G005", value: "실내기팬/모터 이상" }, { key: "63G007", value: "운전조건/기능설명" }
            ],
            actionTypeCodeIdCodeList: [
                { key: "", value: "전체 대응 방법" }, { key: "64G001", value: "설치 점검" }, { key: "64G002", value: "방문 점검" }, { key: "64G003ㄴ", value: "사용 설명" }
            ]
        }
    },
    methods: {
        openAlert: function(title, msg) {
            this.$alert(msg, 'Title', {
                title: title, confirmButtonText: 'OK', dangerouslyUseHTMLString: true
            });
        },

        openEnrollPop: function(id) {
            this.faultId = id;
            this.$refs.defectEnrollModal.openModal();
        },

        openDetailPop: function(event, id) {
            let alert = this;

            var list = [];
            var params = {};
            if(event.target.tagName == 'BUTTON') {
                for(var i = 0; i < this.checked.length; i++) {
                    params.faultId = this.checked[i].toString().replace("defect", "");
                    list.push(params);
                    params = {};
                }
            } else {
                params.faultId = id;
                list.push(params);
            }

            params = '';
            var total = list.length;
            list.forEach(function(item, index) {
                params += Object.entries(item).map(e => e.join('='));
                total == index + 1 ? params : params += '&';
            });

            console.log("[ API ]  : (POP) 진단 현황 상세정보 (/sms/maintenance/getFaultHistoryDetail)", params);

            axios.getApi('/sms/maintenance/getFaultHistoryDetail?' + params).then(response => {
                this.detailItemList = response.data;
                response.data.length == 0 ? alert.openAlert("진단 현황", "상세 정보가 존재하지 않습니다.") : this.$refs.defectDetailModal.openModal();
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("진단 현황", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        },

        chkChange: function(event) {
            event.target.checked ? ++ this.total : -- this.total;
            this.checkedCountText = this.total > 0 ? this.total + '개의 진단 코드가 선택되었습니다.' : '선택된 진단 코드가 없습니다.';
        },

        search: function() {
            let alert = this;

            var params = {};
            params.searchType = this.searchType;
            params.startDate = moment(this.elStartDate).format('YYYYMMDD');
            params.endDate = moment(this.elEndDate).format('YYYYMMDD');
            params.type = this.typeCode;
            params.factor = this.factorCode;
            params.inspectionType = this.inspectionTypeCode;
            params.actionTypeCodeId = this.actionTypeCodeIdCode;

            var diff = moment(params.endDate).diff(params.startDate);
            if(diff < 0) {
                alert.openAlert("진단 현황", "시작일이 종료일보다 빠르게 설정되었습니다.\n시작일과 종료일을 동일하게 맞추어 조회합니다.");''

                this.elStartDate = this.elEndDate;
                params.startDate = params.endDate;
            }

            console.log("[ API ]  : 진단 현황 리스트 조회 (/sms/maintenance/getFaultHistoryList)", params);

            axios.getApi('/sms/maintenance/getFaultHistoryList', params).then(response => {
                this.itemList = response.data;
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("진단 현황", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        },

        highlight: function(query) {
            let alert = this;

            query = query.trim();

            if(query.length == 0 || typeof query === undefined) {
                alert.openAlert("진단 현황", "전체 검색");
            } else {
                alert.openAlert("진단 현황", query + " 검색");
            }
        },

        toExcel: function() {
            let alert = this;
            alert.openAlert("진단 현황", "엑셀 내보내기 기능");
        }
    },
    computed: {
        checkAll: {
            get: function () {
                return this.itemList ? this.checked.length == this.itemList.length : false;
            },
            set: function (value) {
                var checked = [];
                if (value) { this.itemList.forEach(function (item) { checked.push('defect' + item.faultId); }); }

                this.checked = checked;
                this.total = (this.checked.length > 0) ? this.checked.length : 0;
                this.checkedCountText = (this.checked.length > 0) ? this.checked.length + '개의 진단 코드이 선택되었습니다.' :  '선택된 진단 코드이 없습니다.';
            }
        }
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

#ic-highlight {
    cursor: pointer;
}

</style>