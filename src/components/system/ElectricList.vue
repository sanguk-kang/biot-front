<template>
    <div class="side_wrap">
        <div class="content_title_wrap no_title">
            <ul class="flex_left">
                <li>
                    <vueDropdown v-bind:isCheckType='true' v-bind:selectboxData='errTypeList' v-bind:allValue='true' :allText="'전체 에너지 미터 타입'"></vueDropdown>
                </li>

                <li>
                    <vueDropdown v-bind:isCheckType='true' v-bind:selectboxData='errTypeList' v-bind:allValue='true' :allText="'전체 상태'"></vueDropdown>
                </li>

            </ul>

            <ul class="right_area icon_type">
                <li><span class="selected_text">{{ checkedCountText }}</span></li>
                <li><button class="k-button" v-bind:disabled="total == 0 || checked.length == 0" v-on:click="openEditPop($event)">편집</button></li>
                <li><button class="k-button" v-bind:disabled="total == 0 || checked.length == 0" v-on:click="openDetailPop($event)">상세정보</button></li>
            </ul>
        </div>

        <div class="site-list-wrap">
            <section class="content_view">
                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width:60px"><!-- chkbox -->
                            <col style="width:150px"><!-- 에너지 미터 타입 -->
                            <col style="width:auto"><!-- 디바이스 이름 -->
                            <col style="width:150px"><!-- 디바이스 ID -->
                            <col style="width:130px"><!-- 그룹이름 -->
                            <col style="width:130px"><!-- 상태 -->
                            <col style="width:120px"><!-- 상세 정보 -->
                        </colgroup>

                        <thead>
                        <tr>
                            <th>
                                <span class="checkLabel">
                                    <input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAll">
                                    <label class="k-checkbox-label single" for="ched_all"></label>
                                </span>
                            </th>
                            <th>에너지 미터 타입  <i class="ic_sort"></i></th>
                            <th>디바이스 이름  <i class="ic_sort up"></i></th>
                            <th>디바이스 ID <i class="ic_sort"></i></th>
                            <th>그룹이름  <i class="ic_sort"></i></th>
                            <th>상태 <i class="ic_sort"></i></th>
                            <th>상세 정보</th>
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
                            <td>{{ item.key1 }}</td>
                            <td>{{ item.key2 }}</td>
                            <td>{{ item.key3 }}</td>
                            <td>{{ item.key4 }}</td>
                            <td>{{ item.key5 }}</td>
                            <td>{{ item.key8 }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <electricDetailModal ref="electricDetailModal" v-bind:itemList="itemList"></electricDetailModal>
        <electricEditModal ref="electricEditModal" v-bind:itemList="itemList"></electricEditModal>

    </div>
</template>

<script>
    import VueDropdown from "@/components/custom/VueDropdown";
    import ElectricDetailModal from '@/components/system/ElectricDetailModal.vue';
    import ElectricEditModal from '@/components/system/ElectricEditModal.vue';
    import axios from "@/api/axios.js";

    export default {
        name: "ElectricList",
        components: { VueDropdown, ElectricDetailModal, ElectricEditModal },
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
                        "key3": "12312323",
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
                        "key3": "4323536",
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
                        "key3": "3465136",
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
            openDetailPop: function() {
                this.$refs.electricDetailModal.openModal();
            },

            openEditPop: function() {
                this.$refs.electricEditModal.openModal();
            },

            chkChange: function(event) {
                event.target.checked ? ++ this.total : -- this.total;
                this.checkedCountText = this.total > 0 ? this.total + '개의 디바이스가 선택되었습니다.' : '선택된 디바이스가 없습니다.';
            },

            search: function() {
                let alert = this;

                // TODO
                var params = {};
               // params.siteId = 20301;

                console.log("[ API ]  : 서비스센터 정보 조회 (/sms/maintenance/productinformation)", params);

                axios.getApi('/sms/electricmeter/listView', params).then(response => {
                    this.itemList = response.data;
                    console.log(this.itemList)
                }).catch(function (error) {
                    var errCode = error.response.status;
                    if(errCode >= 400) {
                        alert.openAlert("안내", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
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
           // this.search();
        },
        destroyed() {
        }
    }

</script>