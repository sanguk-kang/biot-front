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
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='selectboxData' :allValue='true' :allText="'전체 국가'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='selectboxData' :allValue='true' :allText="'전체 시/도'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='selectboxData' :allValue='true' :allText="'전체 업종'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-model="selectValue" :isCheckType='true' :selectboxData='selectboxData' :allValue='true' :allText="'전체 상태'"></vueDropdown>
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
                            <col style="width:150px"><!-- 사이트 이름 -->
                            <col style="width:auto"><!-- 사이트 ID -->
                            <col style="width:150px"><!-- 업종 -->
                            <col style="width:130px"><!-- 구매 상품평 -->
                            <col style="width:130px"><!-- 계약 코드 -->
                            <col style="width:130px"><!-- 프로젝트 코드 -->
                            <col style="width:140px"><!-- 상태 -->
                            <col style="width:130px"><!-- 만료일 -->
                        </colgroup>

                        <thead>
                        <tr>
                            <th>
                                <span class="checkLabel">
                                    <input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAll">
                                    <label class="k-checkbox-label single" for="ched_all"></label>
                                </span>
                            </th>
                            <th>사이트이름  <i class="ic_sort"></i></th>
                            <th>사이트 ID  <i class="ic_sort up"></i></th>
                            <th>업종 <i class="ic_sort"></i></th>
                            <th>구매 상품평  <i class="ic_sort"></i></th>
                            <th>계약 코드 <i class="ic_sort"></i></th>
                            <th>프로젝트 코드 <i class="ic_sort"></i></th>
                            <th>상태 <i class="ic_sort"></i></th>
                            <th>만료일</th>
                        </tr>
                        </thead>

                        <tbody>
                        <tr  v-for="item in itemList" v-bind:key="item.siteId">
                            <td>
                                <span class="checkLabel">
                                    <input type="checkbox" class="k-checkbox" name="ched" v-bind:id="item.siteId" v-bind:value="item.siteId" v-model="checked" v-on:click="chkChange($event)">
                                    <label class="k-checkbox-label single" v-bind:for="item.siteId"></label>
                                </span>
                            </td>
                            <td>{{ item.siteName }}</td>
                            <td>{{ item.siteId }}</td>
                            <td>{{ item.industryCode }}</td>
                            <td>{{ item.productName }}</td>
                            <td>{{ item.contractCode }}</td>
                            <td>{{ item.projectCode }}</td>
                            <td>{{ item.status }}</td>
                            <td>{{ item.endTime }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <maintainCustomerAddModal ref="maintainCustomerAddModal" v-bind:itemList="itemList"></maintainCustomerAddModal>
        <maintainCustomerEditModal ref="maintainCustomerEditModal" v-bind:itemList="itemList"></maintainCustomerEditModal>

    </div>
</template>

<script>
    import VueDropdown from "@/components/custom/VueDropdown";
    import MaintainCustomerAddModal from '@/components/system/MaintainCustomerAddModal.vue';
    import MaintainCustomerEditModal from '@/components/system/MaintainCustomerEditModal.vue';
    import axios from "@/api/axios.js";

    export default {
        name: "MaintainCustomerInfo",
        components: { VueDropdown, MaintainCustomerAddModal, MaintainCustomerEditModal },
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
                selectboxData: [
                    {
                        value: '스타벅스',
                        key: 'starbucks'
                    },
                    {
                        value: '커피빈',
                        key: 'coffeebean'
                    },
                    {
                        value: '투썸플레이스',
                        key: 'twosome'
                    }
                ],
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
                ]
            }
        },
        methods: {
            openAddPop: function() {
                this.$refs.maintainCustomerAddModal.openModal();
            },

            openEditPop: function() {
                this.$refs.maintainCustomerEditModal.openModal();
            },

            chkChange: function(event) {
                event.target.checked ? ++ this.total : -- this.total;
                this.checkedCountText = this.total > 0 ? this.total + '개의 디바이스가 선택되었습니다.' : '선택된 디바이스가 없습니다.';
            },

            getMaintainInfo: function() {
                let alert = this;

                var params = {};
//                params.countryCode = "";
               /*params.industryCode = "";
                params.page = 1;
                params.regionId = "";
                params.size = 10;
                params.status = "";
*/


                axios.getApi('/sms/maintenance/maintenanceCustomerList',params).then(response => {
                    this.itemList = response.data;
                    console.log(this.itemList)
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("고객 정보", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
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
            //this.getMaintainInfo();
        },
        destroyed() {
        }
    }

</script>