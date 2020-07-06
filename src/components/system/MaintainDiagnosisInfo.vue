<template>
    <div class="side_wrap">
        <!-- s:Sub content title-->
        <div class="content_title_wrap">
            <ul class="right_area">
                <li>
                    <div class="search_input_wrap">
                        <input class="k-input" type="text" placeholder="검색 내용 입력">
                        <span class="ic ic-bt-input-remove"></span>
                        <span class="ic ic-bt-input-search"></span>
                    </div>
                </li>
            </ul>
        </div>
        <!-- e:Sub content title-->
        <div class="content_title_wrap no_title">
            <ul class="flex_left">
                <li>
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='divisionCommon' :allValue='true' :allText="'전체 구분'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='causeCommon' :allValue='true' :allText="'전체 요인'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='checkDivisionCommon' :allValue='true' :allText="'전체 점검구분'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='importanceCommon' :allValue='true' :allText="'전체 중요도'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='responseCommon' :allValue='true' :allText="'전체 대응'"></vueDropdown>
                </li>
            </ul>

            <ul class="right_area icon_type">
                <li><span class="selected_text">{{ checkedCountText }}</span></li>
                <li><button class="k-button btn_w1" v-on:click="openAddPop($event)">추가</button></li>
                <li><button class="k-button btn_w1"  v-bind:disabled="total == 0 || checked.length == 0" v-on:click="openEditPop($event)">편집</button></li>
                <li><button class="k-button btn_w1"  v-bind:disabled="total == 0 || checked.length == 0" v-on:click="''">삭제</button></li>

            </ul>
        </div>

        <div class="site-list-wrap">
            <section class="content_view">
                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width:60px"><!-- chkbox -->
                            <col style="width:150px"><!-- 코드 -->
                            <col style="width:auto"><!-- 구분 -->
                            <col style="width:150px"><!-- 요인 -->
                            <col style="width:130px"><!-- 중요도 -->
                            <col style="width:130px"><!-- 중요도 Factor -->
                            <col style="width:130px"><!-- 발생빈도 Factor -->
                            <col style="width:140px"><!-- 심각도 Factor -->
                            <col style="width:130px"><!-- 누적회수 -->
                            <col style="width:130px"><!-- 진단계수 -->
                            <col style="width:130px"><!-- 상태정보 -->
                        </colgroup>

                        <thead>
                        <tr>
                            <th>
                                <span class="checkLabel">
                                    <input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAll">
                                    <label class="k-checkbox-label single" for="ched_all"></label>
                                </span>
                            </th>
                            <th>코드  <i class="ic_sort"></i></th>
                            <th>구분  <i class="ic_sort up"></i></th>
                            <th>요인 <i class="ic_sort"></i></th>
                            <th>중요도  <i class="ic_sort"></i></th>
                            <th>중요도 Factor <i class="ic_sort"></i></th>
                            <th>발생빈도 Factor <i class="ic_sort"></i></th>
                            <th>심각도 Factor <i class="ic_sort"></i></th>
                            <th>누적회수</th>
                            <th>진단계수</th>
                            <th>상태정보</th>
                        </tr>
                        </thead>

                        <tbody>
                        <tr  v-for="item in itemList" v-bind:key="item.key3">
                            <td>
                                <span class="checkLabel">
                                    <input type="checkbox" class="k-checkbox" name="ched" v-bind:id="item.key3" v-bind:value="item.key3" v-model="checked" v-on:click="chkChange($event)">
                                    <label class="k-checkbox-label single" v-bind:for="item.key3"></label>
                                </span>
                            </td>
<!--                            createdTime: ""-->
<!--                            diagnosticFactor: ""-->
<!--                            diagnosticType: ""-->
<!--                            errorCode: ""-->
<!--                            frequencyFactor: 0.1-->
<!--                            importanceFactor: 5-->
<!--                            importanceType: "32G002"-->
<!--                            inspectionType: ""-->
<!--                            responseType: ""-->
<!--                            severityFactor: 1-->
                            <td>{{ item.key1 }}</td>
                            <td>{{ item.key2 }}</td>
                            <td>{{ item.key3 }}</td>
                            <td>{{ item.importanceType }}</td>
                            <td>{{ item.key5 }}</td>
                            <td>{{ item.key6 }}</td>
                            <td>{{ item.key7 }}</td>
                            <td>{{ item.key8 }}</td>
                            <td>{{ item.key9 }}</td>
                            <td>{{ item.key10 }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <maintainDiagnosisAddModal ref="maintainDiagnosisAddModal" v-bind:itemList="itemList"></maintainDiagnosisAddModal>
        <maintainDiagnosisEditModal ref="maintainDiagnosisEditModal" v-bind:itemList="itemList"></maintainDiagnosisEditModal>

    </div>
</template>

<script>
    import VueDropdown from "@/components/custom/VueDropdown";
    import MaintainDiagnosisAddModal from '@/components/system/MaintainDiagnosisAddModal.vue';
    import MaintainDiagnosisEditModal from '@/components/system/MaintainDiagnosisEditModal.vue';
    import axios from "@/api/axios.js";

    export default {
        name: "MaintainDiagnosisInfo",
        components: { VueDropdown, MaintainDiagnosisAddModal, MaintainDiagnosisEditModal },
        props: [],
        watch: {
            selectValue(val) {
                console.log('watch selectValue:', val);
            },
        },
        data: function() {
            return {
                // select 변수
                selectValue: {},
                dropDownValue: [],
                dropIconValue: {},
                total: 0,
                checked: [],
                checkedCountText: '선택된 디바이스가 없습니다.',

                role: 'administrator',

                itemList: [],
                errTypeList: [
                    {
                        key: "MCU",
                        value: "mcu"
                    },
                    {
                        key: "GHP",
                        value: "ghp"
                    },
                    {
                        key: "EHS",
                        value: "ehs"
                    }
                ],
                divisionCommon: [],
                causeCommon: [],
                checkDivisionCommon:[],
                importanceCommon:[],
                responseCommon:[],
            }
        },
        methods: {
            openAddPop: function() {
                this.$refs.maintainDiagnosisAddModal.openModal();
            },

            openEditPop: function() {
                this.$refs.maintainDiagnosisEditModal.openModal();
            },


            chkChange: function(event) {
                event.target.checked ? ++ this.total : -- this.total;
                this.checkedCountText = this.total > 0 ? this.total + '개의 디바이스가 선택되었습니다.' : '선택된 디바이스가 없습니다.';
            },

            getMaintainInfo: function() {
                let alert = this;

                var params = {};

                axios.getApi('/sms/diagnostic/list',params).then(response => {
                    this.itemList = response.data;
                    console.log(this.itemList)
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("진단 계수 관리", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                    }
                });
            },

            getDivisionCommon() {
                //진단계수 구분
                let alert = this;
                var id = 29;

                axios.getApi('/sms/common/codeGroup/'+id).then(response => {
                    this.divisionCommon = response.data.commonCodes;
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("진단 계수 관리", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                    }
                });
            },
            getCauseCommon() {
                //진단계수 요인
                let alert = this;
                var id = 30;

                axios.getApi('/sms/common/codeGroup/'+id).then(response => {
                    this.causeCommon = response.data.commonCodes;
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("진단 계수 관리", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                    }
                });
            },
            getCheckDivisionCommon() {
                //진단계수 점검구분
                let alert = this;
                var id = 31;

                axios.getApi('/sms/common/codeGroup/'+id).then(response => {
                    this.checkDivisionCommon = response.data.commonCodes;
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("진단 계수 관리", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                    }
                });
            },
            getImportanceCommonCommon() {
                //중요도
                let alert = this;
                var id = 32;

                axios.getApi('/sms/common/codeGroup/'+id).then(response => {
                    this.importanceCommon = response.data.commonCodes;
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("진단 계수 관리", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                    }
                });
            },
            getResponseCommonCommon() {
                //대응
                let alert = this;
                var id = 33;

                axios.getApi('/sms/common/codeGroup/'+id).then(response => {
                    this.responseCommon = response.data.commonCodes;
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("진단 계수 관리", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                    }
                });
            }

        },
        computed: {
            checkAll: {
                get: function () {
                    return this.itemList ? this.checked.length == this.itemList.length : false;
                },
                set: function (value) {
                    var checked = [];
                    if (value) {
                        this.itemList.forEach(function (item) { checked.push(item.key3); });
                    }

                    this.checked = checked;

                    if(this.checked.length > 0) {
                        this.total = this.checked.length;
                        this.checkedCountText = this.checked.length + '개의 디바이스가 선택되었습니다.';
                    } else {
                        this.total = 0;
                        this.checkedCountText = '선택된 디바이스가 없습니다.';
                    }
                }
            }
        },
        created() {
        },
        mounted() {
            /*this.getDivisionCommon();
            this.getCauseCommon();
            this.getCheckDivisionCommon();
            this.getImportanceCommonCommon();
            this.getResponseCommonCommon();
            this.getMaintainInfo();*/
        },
        destroyed() {
        }
    }

</script>