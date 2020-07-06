<template>
    <div class="side_wrap">
        <div class="content_title_wrap">
            <ul class="right_area icon_type">
                <li><button class="k-button" v-on:click="upload">점검현황 업로드</button></li>
                <li><button class="k-button" v-on:click="download('status')">점검현황 다운로드</button></li>
                <li><button class="k-button" v-on:click="download('template')">템플릿 다운로드</button></li>

                <li>
                    <div class="search_input_wrap">
                        <input class="k-input" type="text" placeholder="검색 내용 입력" v-model="query" v-on:keyup.enter="highlight(query)">
                        <span class="ic ic-bt-input-remove"></span>
                        <!-- 서비스번호, 디바이스 이름, 제조번호만 가능-->
                        <span class="ic ic-bt-input-search" id="ic-highlight" v-on:click="highlight(query)" style="cursor: pointer;"></span>
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
                    <el-select v-model="categoryCode" v-on:change="search">
                        <el-option v-for="item in categoryCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key"></el-option>
                    </el-select>
                </li>

                <li>
                    <el-select v-model="totalCostCode" v-on:change="search">
                        <el-option v-for="item in totalCostCodeList" v-bind:key="item.key" v-bind:label="item.value" v-bind:value="item.key"></el-option>
                    </el-select>
                </li>

                <li><span class="ic-bar"></span></li>

                <li>
                    <button class="k-button btn_w1" v-on:click="toExcel">내보내기</button>
                </li>
            </ul>

            <ul class="right_area icon_type">
                <li><span class="selected_text">{{ checkedCountText }}</span></li>

                <li><button class="k-button btn_w1" v-on:click="openEnrollPop">추가</button></li>
                <li><button class="k-button btn_w1" v-bind:disabled="total != 1 || checked.length != 1" v-on:click="openEditPop">편집</button></li>
                <li><button class="k-button" v-bind:disabled="total == 0 || checked.length == 0" v-on:click="openDetailPop($event)">상세정보</button></li>
            </ul>
        </div>

        <div class="site-list-wrap">
            <section class="content_view">
                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width:60px"><!-- chkbox -->
                            <col style="width:auto"><!-- 서비스 번호 -->
                            <col style="width:150px"><!-- 카테고리 -->
                            <col style="width:200px"><!-- 서비스 기사 -->
                            <col style="width:200px"><!-- 센터명 -->
                            <col style="width:100px"><!-- 재방문 -->
                            <col style="width:140px"><!-- 방문일-->
                            <col style="width:130px"><!-- 완료일-->
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
                                <th>서비스 번호</th>
                                <th>카테고리</th>
                                <th>서비스 기사</th>
                                <th>센터명</th>
                                <th>재방문</th>
                                <th>방문일</th>
                                <th>완료일</th>
                                <th>상세 정보</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="item in itemList" v-bind:key="'inspection' + item.id">
                                <td>
                                    <span class="checkLabel">
                                        <input type="checkbox" class="k-checkbox" name="ched" v-bind:id="'inspection' + item.id" v-bind:value="'inspection' + item.id" v-model="checked" v-on:click="chkChange($event)">
                                        <label class="k-checkbox-label single" v-bind:for="'inspection' + item.id"></label>
                                    </span>
                                </td>
                                <td>{{ item.serviceNumber }}</td>
                                <td>{{ item.category }}</td>
                                <td>{{ item.serviceArticle }}</td>
                                <td>{{ item.centerName }}</td>
                                <td>{{ item.isRevisited }}</td>
                                <td>{{ item.createdTime }}</td>
                                <td>{{ item.endTime }}</td>
                                <td><span class="ic ic-info" v-on:click="openDetailPop($event, item.id)"></span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <inspectionDetailModal ref="inspectionDetailModal" v-bind:itemList="itemList"></inspectionDetailModal>
        <inspectionEnrollModal ref="inspectionEnrollModal"></inspectionEnrollModal>
        <inspectionEditModal ref="inspectionEditModal" v-bind:itemList="itemList"></inspectionEditModal>
    </div>
</template>

<script>
import axios from "@/api/axios.js";
import moment from "moment";
import InspectionDetailModal from '@/components/maintain/InspectionDetailModal.vue';
import InspectionEnrollModal from '@/components/maintain/InspectionEnrollModal.vue';
import InspectionEditModal from '@/components/maintain/InspectionEditModal.vue';

export default {
    name: "InspectionList",
    components: { InspectionDetailModal, InspectionEnrollModal, InspectionEditModal },
    props: [],
    data: function() {
        return {
            /* selected variable */
            total: 0,
            checked: [],
            checkedCountText: '선택된 점검 현황이 없습니다.',

            /* search condition variable */
            elStartDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
            elEndDate: moment().format('YYYY-MM-DD'),
            categoryCode: '',
            totalCostCode: '',
            query: '',

            /* role variable */
            role: 'administrator',

            /* table, modal variable*/
            itemList: [],

             /* code variable */
            categoryCodeList: [
                { key: "", value: "전체 카테고리" }, { key: "64G001", value: "일반 출동" }, { key: "64G003ㄴ", value: "긴급 출동" }
            ],
            totalCostCodeList: [
                { key: "", value: "전체 비용" }, { key: "64G001", value: "무상" }, { key: "64G002", value: "유상" }, { key: "64G003ㄴ", value: "기타" }
            ]
        }
    },
    methods: {
        openAlert: function(title, msg) {
            this.$alert(msg, 'Title', {
                title: title, confirmButtonText: 'OK', dangerouslyUseHTMLString: true
            });
        },

        openDetailPop: function(event, id) {
            let alert = this;

            var list = [];
            var params = {};
            if(event.target.tagName == 'BUTTON') {
                for(var i = 0; i < this.checked.length; i++) {
                    params.id = this.checked[i].toString().replace("inspection", "");
                    list.push(params);
                    params = {};
                }
            } else {
                params.id = id;
                list.push(params);
            }

            params = '';
            var total = list.length;
            list.forEach(function(item, index) {
                params += Object.entries(item).map(e => e.join('='));
                total == index + 1 ? params : params += '&';
            });

            console.log("[ API ]  : (POP) 점검 현황 상세정보 (/sms/maintenance/getInspectionStatusDetail)", params);

            axios.getApi('/sms/maintenance/getFaultHistoryDetail?' + params).then(response => {
                this.detailItemList = response.data;
                response.data.length == 0 ? alert.openAlert("점검 현황", "상세 정보가 존재하지 않습니다.") : this.$refs.defectDetailModal.openModal();
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("점검 현황", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        },

        openEnrollPop: function() {
            this.$refs.inspectionEnrollModal.openModal();
        },

        openEditPop: function() {
            this.$refs.inspectionEditModal.openModal();
        },

        chkChange: function(event) {
            event.target.checked ? ++ this.total : -- this.total;
            this.checkedCountText = this.total > 0 ? this.total + '개의 점검 현황이 선택되었습니다.' : '선택된 점검 현황이 없습니다.';
        },

        search: function() {
            let alert = this;

            var params = {};
            params.startDate = moment(this.elStartDate).format('YYYYMMDD');
            params.endDate = moment(this.elEndDate).format('YYYYMMDD');
            params.categoryy = this.categoryCode;
            params.totalCost = this.totalCostCode;

            var diff = moment(params.endDate).diff(params.startDate);
            if(diff < 0) {
                alert.openAlert("점검 현황", "시작일이 종료일보다 빠르게 설정되었습니다.\n시작일과 종료일을 동일하게 맞추어 조회합니다.");''

                this.elStartDate = this.elEndDate;
                params.startDate = params.endDate;
            }

            console.log("[ API ]  : 점검현황 리스트 조회 (/api/sms/maintenance/getInspectionStatusList)", params);

            axios.getApi('/sms/maintenance/getInspectionStatusList', params).then(response => {
                this.itemList = response.data;
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("점검 현황", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        },

        highlight: function(query) {
            let alert = this;

            query = query.trim();

            if(query.length == 0 || typeof query === undefined) {
                alert.openAlert("점검 현황", "전체 검색");
            } else {
                alert.openAlert("점검 현황", query + " 검색");
            }
        },

        toExcel: function() {
            let alert = this;
            alert.openAlert("점검 현황", "엑셀 내보내기 기능");
        },

        upload: function() {
            let alert = this;
            alert.openAlert("점검 현황", "업로드 기능");
        },

        download: function(target) {
            let alert = this;
            alert.openAlert("점검 현황", target + " 다운로드 기능");
        }
    },
    computed: {
        checkAll: {
            get: function () {
                return this.itemList ? this.checked.length == this.itemList.length : false;
            },
            set: function (value) {
                var checked = [];
                if (value) { this.itemList.forEach(function (item) { checked.push('inspection' + item.id); }); }

                this.checked = checked;
                this.total = (this.checked.length > 0) ? this.checked.length : 0;
                this.checkedCountText = (this.checked.length > 0) ? this.checked.length + '개의 점검 현황이 선택되었습니다.' :  '선택된 점검 현황이 없습니다.';
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