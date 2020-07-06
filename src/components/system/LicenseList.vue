<template>
    <div class="side_wrap">
        <div class="content_title_wrap no_title">
            <ul class="flex_left">

                <li>
                    <vueDropdown v-bind:isCheckType='true' v-bind:selectboxData='errTypeList' v-bind:allValue='true' :allText="'전체 유형'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-bind:isCheckType='true' v-bind:selectboxData='errTypeList' v-bind:allValue='true' :allText="'전체 상태'"></vueDropdown>
                </li>

            </ul>

            <ul class="right_area icon_type">
                <li><button class="k-button" v-on:click="openAddPop($event)">추가</button></li>
            </ul>
        </div>

        <div class="site-list-wrap">
            <section class="content_view">
                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width:150px"><!-- 라이선스 키 -->
                            <col style="width:auto"><!-- 유형 -->
                            <col style="width:150px"><!-- 시작일 -->
                            <col style="width:130px"><!-- 종료일 -->
                            <col style="width:130px"><!-- 상태 -->
                            <col style="width:140px"><!-- 적용 디바이스-->
                            <col style="width:130px"><!-- 설정-->
                        </colgroup>

                        <thead>
                        <tr>
                            <th>라이선스 키  <i class="ic_sort"></i></th>
                            <th>유형 <i class="ic_sort"></i></th>
                            <th>시작일  <i class="ic_sort"></i></th>
                            <th>종료일 <i class="ic_sort"></i></th>
                            <th>상태 <i class="ic_sort"></i></th>
                            <th>적용 디바이스 <i class="ic_sort"></i></th>
                            <th>설정</th>
                        </tr>
                        </thead>

                        <tbody>
                        <tr  v-for="item in itemList" v-bind:key="item.key3">
                            <td>{{ item.key1 }}</td>
                            <td>{{ item.key2 }}</td>
                            <td>{{ item.key3 }}</td>
                            <td>{{ item.key4 }}</td>
                            <td>{{ item.key5 }}</td>
                            <td>{{ item.key8 }}</td>
                            <td>{{ item.key9 }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <licenseAddModal ref="licenseAddModal" v-bind:itemList="itemList"></licenseAddModal>
    </div>
</template>

<script>
    import VueDropdown from "@/components/custom/VueDropdown";
    import LicenseAddModal from '@/components/system/LicenseAddModal.vue';
    import axios from "@/api/axios.js";

    export default {
        name: "LicenseList",
        components: { VueDropdown, LicenseAddModal },
        props: [],
        data: function() {
            return {
                total: 0,
                checked: [],
                checkedCountText: '선택된 디바이스가 없습니다.',

                role: 'administrator',

                itemList: [
                    {
                        "key1":" 실내기",
                        "key2": "_Device Name",
                        "key3": "12343123",
                        "key4": "Dev_101",
                        "key5": "통신에러",
                        "key6": "5",
                        "key7": "10",
                        "key8": "2020-03-20 14:55",
                        "key9": "2020-03-20",
                    },
                    {
                        "key1":" 실내기",
                        "key2": "_Device Name",
                        "key3": "43253436",
                        "key4": "Dev_523",
                        "key5": "옵션기기",
                        "key6": "42",
                        "key7": "15.2",
                        "key8": "2020-11-20 04:35",
                        "key9": "2020-12-11",
                    },

                    {
                        "key1":" 실내기",
                        "key2": "_Device Name",
                        "key3": "346536",
                        "key4": "Dev_523",
                        "key5": "옵션기기",
                        "key6": "42",
                        "key7": "15.2",
                        "key8": "2020-11-20 04:35",
                        "key9": "2020-12-11",
                    }
                ],
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
                ]
            }
        },
        methods: {
            openAddPop: function() {
                this.$refs.licenseAddModal.openModal();
            },

            chkChange: function(event) {
                event.target.checked ? ++ this.total : -- this.total;
                this.checkedCountText = this.total > 0 ? this.total + '개의 디바이스가 선택되었습니다.' : '선택된 디바이스가 없습니다.';
            },

            search: function() {
                let alert = this;

                var params = {};
                params.siteId = 'D99E1A2645';
                /*params.startDate = moment(this.elStartDate).format('YYYYMMDD');
                params.endDate = moment(this.elEndDate).format('YYYYMMDD');
                params.type = this.typeCode;
                params.factor = this.factorCode;
                params.inspectionType = this.inspectionTypeCode;*/

                console.log("[ API ]  : 진단 현황 리스트 조회 (/sms/maintenance/getFaultHistoryList)", params);

                axios.getApi('/sms/license/licenseListGet', params).then(response => {
                    this.itemList = response.data;
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("진단 현황", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
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
            //this.search()
        },
        destroyed() {
        }
    }

</script>