<template>
    <div>
        <sweet-modal ref="inspectionEnrollModal" overlay-theme="dark" id="sweet_modal_style" width="1500px">
            <!-- 모달 기본 스타일 S -->
            <div style="width:1440px;">
                <!-- 모달 제목 영역 S-->
                <div class="sweet_modal_title">
                    점검 현황 결과 등록
                </div>
                <!-- 모달 제목 영역 E-->

                <!-- 모달 내용 영역 : 상세정보 S-->
                <div class="sweet_modal_content">
                    <table class="pop_table view_type">
                        <colgroup>
                            <col style="width: 210px;">
                            <col>
                        </colgroup>

                        <tbody>
                            <tr>
                                <th>카테고리</th>
                                <td>
                                    <div class="radio_wrap ft_td">
                                        <span class="radioLabel">
                                            <input type="radio" class="k-radio" name="category" id="rd-enroll-category1">
                                            <label class="k-radio-label" for="rd-enroll-category1">일반출동</label>
                                        </span>

                                        <span class="radioLabel">
                                            <input type="radio" class="k-radio" name="category" id="rd-enroll-category2">
                                            <label class="k-radio-label" for="rd-enroll-category2">정기점검</label>
                                        </span>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th>접수 내용</th>
                                <td>
                                    <div class="input_wrap input_w3">
                                        <input type="text" class="k-input" v-bind:maxlength="300">
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th>서비스기사</th>
                                <td>
                                    <div class="input_wrap input_w3">
                                        <input type="text" class="k-input" v-bind:maxlength="300">
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th>센터명</th>
                                <td>
                                    <div class="input_wrap input_w3">
                                        <input type="text" class="k-input" v-bind:maxlength="300">
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th>방문 일자</th>
                                <td>
                                    <el-date-picker ref="elStartDate" v-model="elStartDate" type="date"></el-date-picker>
                                </td>
                            </tr>

                            <tr>
                                <th>완료 일자</th>
                                <td>
                                    <el-date-picker ref="elEndDate" v-model="elEndDate" type="date"></el-date-picker>
                                </td>
                            </tr>

                            <tr>
                                <th>설명</th>
                                <td>
                                    <div class="input_wrap input_w3">
                                        <input type="text" class="k-input" v-bind:maxlength="300">
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th>재방문</th>
                                <td>
                                    <ul class="flex_left">
                                        <li>
                                            <div class="checkLabel">
                                                <input type="checkbox" class="k-checkbox" name="revisit" id="chk-enroll-revisit" v-model="isRevisited">
                                                <label class="k-checkbox-label" for="chk-enroll-revisit">재방문</label>
                                            </div>
                                        </li>

                                        <li>
                                            <div class="input_wrap input_w2">
                                                <input type="text" class="k-input" v-bind:maxlength="300" v-bind:disabled="!isRevisited">
                                            </div>
                                        </li>
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="content_title_wrap bot_line">
                        <h2 class="content_title">제품 종류</h2>
                        <ul class="right_area">
                            <li><span class="selected_text">{{ checkedCountText }}</span></li>
                            <li><button class="k-button" v-on:click="$refs.inspectionAddModal.open()">추가</button></li>
                            <li><button class="k-button" >삭제</button></li>
                        </ul>
                    </div>

                    <div class="g-table" id="tbl-inspection-enroll">
                        <table>
                            <colgroup>
                                <col style="width: 60px;">
                                <col style="width: 60px;">
                                <col style="width: 100px;">
                                <col style="width: auto;">
                                <col style="width: 150px;">
                                <col style="width: 150px;">
                                <col style="width: 100px;">
                                <col style="width: 100px;">
                                <col style="width: 60px;">
                                <col style="width: 100px;">
                                <col style="width: 100px;">
                                <col style="width: 60px;">
                            </colgroup>

                            <thead>
                                <tr>
                                    <th>
                                        <span class="checkLabel">
                                            <input type="checkbox" class="k-checkbox" name="ched" id="chk-enroll-all" v-model="checkAll">
                                            <label class="k-checkbox-label" for="chk-enroll-all"></label>
                                        </span>
                                    </th>

                                    <th>NO</th>
                                    <th>기기 타입</th>
                                    <th>기기 이름</th>
                                    <th>모델명</th>
                                    <th>제조 번호</th>
                                    <th>자재 코드</th>
                                    <th>자재명</th>
                                    <th>비용</th>
                                    <th>접수 내용</th>
                                    <th>처리 내용</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>
                                        <span class="checkLabel">
                                            <input type="checkbox" class="k-checkbox" name="ched" id="ched1" v-model="checked" v-on:click="chkChange($event)">
                                            <label class="k-checkbox-label" for="ched1"></label>
                                        </span>
                                    </td>
                                    <td>1</td>
                                    <td>실내기</td>
                                    <td>_Device Name</td>
                                    <td>_Model Name</td>
                                    <td>_Serial No</td>
                                    <td><input type="text" class="k-input"></td>
                                    <td><input type="text" class="k-input"></td>
                                    <td><input type="text" class="k-input"></td>
                                    <td><input type="text" class="k-input"></td>
                                    <td><input type="text" class="k-input"></td>
                                    <td>
                                        <span class="ic ic-bt-input-search" v-on:click="$refs.inspectionFindModal.open()" style="cursor: pointer;"></span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- 모달 내용 영역 : 상세정보 E-->

                <!-- 모달 전체 버튼 영역 S-->
                <div class="sweet_modal_buttongroup">
                    <button type="button"  v-on:click="closeModal" class="k-button">취소</button>
                    <button type="button"  v-on:click="closeModal" class="k-button">저장</button>
                </div>
                <!-- 모달 전체 버튼 영역 E-->
            </div>
            <!-- 모달 기본 스타일 E -->
        </sweet-modal>

        <sweet-modal ref="inspectionAddModal" overlay-theme="dark" id="sweet_modal_style" width="1400px">
            <!-- 모달 기본 스타일 S -->
            <div style="width:1340px;">
                <!-- 모달 제목 영역 S-->
                <div class="sweet_modal_title">
                    제품 추가 (점검현황 결과 등록/편집 > '추가' 버튼 클릭)
                </div>
                <!-- 모달 제목 영역 E-->

                <!-- 모달 내용 영역 : 상세정보 S-->
                <div class="sweet_modal_content">
                    <div class="content_title_wrap no_title">
                        <ul class="dash_tab">
                            <li class="active"><a href="#" >기기이름 직접 입력</a></li>
                            <li><a href="#">고장이력에서 선택 </a></li>
                        </ul>
                    </div>

                    <div class="detail-dialog-detail-content">
                        <table class="pop_table view_type">
                            <colgroup>
                                <col style="width: 210px;">
                                <col>
                            </colgroup>

                            <tbody>
                                <tr>
                                    <th>기기 이름</th>
                                    <td>
                                        <div class="input_wrap input_w3">
                                            <input type="text" class="k-input" v-bind:maxlength="50" v-model="deviceName">
                                            <i class="ic ic-bt-input-remove"></i>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th>모델명</th>
                                    <td>
                                        <div class="input_wrap input_w3">
                                            <input type="text" class="k-input" v-bind:maxlength="20" v-model="modelCode">
                                            <i class="ic ic-bt-input-remove"></i>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th>제조번호</th>
                                    <td>
                                        <ul class="flex_left">
                                            <li>
                                                <div class="input_wrap input_w3">
                                                    <input type="text" class="k-input" v-bind:maxlength="20" v-model="manufacturingNumber">
                                                    <i class="ic ic-bt-input-remove"></i>
                                                </div>
                                            </li>

                                            <li><button class="k-button btn_w1" v-bind:disabled="deviceName.length == 0 && modelCode.length == 0 && manufacturingNumber.length == 0" v-on:click="searchByDevice">조회</button></li>
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="tb_both_wrap">
                            <div class="left">
                                <div class="g-table">
                                    <table>
                                        <colgroup>
                                            <col style="width:5%">
                                            <col style="width:20%">
                                            <col style="width:20%">
                                            <col style="width:20%">
                                            <col style="width:15%">
                                            <col style="width:20%">
                                        </colgroup>

                                        <thead>
                                            <tr>
                                                <th>
                                                    <span class="checkLabel">
                                                        <input type="checkbox" class="k-checkbox" name="ched" id="chk-device-lt-all" v-model="checkedDeviceLtAll">
                                                        <label class="k-checkbox-label" for="chk-device-lt-all"></label>
                                                    </span>
                                                </th>
                                                <th>디바이스 타입<i class="ic_sort"></i></th>
                                                <th>디바이스 이름<i class="ic_sort up"></i></th>
                                                <th>그룹<i class="ic_sort"></i></th>
                                                <th>모델명<i class="ic_sort"></i></th>
                                                <th>제조 번호<i class="ic_sort"></i></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr v-for="item in deviceList" v-bind:key="item.deviceId">
                                                <td>
                                                    <span class="checkLabel">
                                                        <input type="checkbox" class="k-checkbox" name="ched" v-bind:id="item.deviceId" v-bind:value="item.deviceId" v-model="checkedDeviceLt" v-on:click="chkChangeDeviceLt($event)">
                                                        <label class="k-checkbox-label" v-bind:for="item.deviceId"></label>
                                                    </span>
                                                </td>

                                                <td>{{ item.deviceType }}</td>
                                                <td>{{ item.deviceName }}</td>
                                                <td>{{ item.gorupName }}</td>
                                                <td>{{ item.modelName }}</td>
                                                <td>{{ item.manufacturingNumber }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="move_btn">
                                <button type="button " class="k-button ic_arrow_next" v-on:click="deviceToRight">좌측가기</button>
                                <button type="button" class="k-button ic_arrow_pre" v-on:click="deviceToLeft">우측가기</button>
                            </div>

                            <div class="right">
                                <div class="g-table">
                                    <table>
                                        <colgroup>
                                            <col style="width:5%">
                                            <col style="width:20%">
                                            <col style="width:20%">
                                            <col style="width:20%">
                                            <col style="width:15%">
                                            <col style="width:20%">
                                        </colgroup>

                                        <thead>
                                            <tr>
                                                <th>
                                                    <span class="checkLabel">
                                                        <input type="checkbox" class="k-checkbox" name="ched" id="chk-device-rt-all" v-model="checkedDeviceRt">
                                                        <label class="k-checkbox-label" for="chk-device-rt-all"></label>
                                                    </span>
                                                </th>
                                                <th>디바이스 타입<i class="ic_sort"></i></th>
                                                <th>디바이스 이름<i class="ic_sort up"></i></th>
                                                <th>그룹<i class="ic_sort"></i></th>
                                                <th>모델명<i class="ic_sort"></i></th>
                                                <th>제조 번호<i class="ic_sort"></i></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 모달 내용 영역 : 상세정보 E-->

                <!-- 모달 전체 버튼 영역 S-->
                <div class="sweet_modal_buttongroup">
                    <button type="button"  v-on:click="closeAddModal" class="k-button">Close</button>
                    <button type="button"  v-on:click="closeAddModal" class="k-button" disabled="disabled">Save</button>
                </div>
                <!-- 모달 전체 버튼 영역 E-->
            </div>
            <!-- 모달 기본 스타일 E -->
        </sweet-modal>

        <sweet-modal ref="inspectionFindModal" overlay-theme="dark" id="sweet_modal_style" width="1240px">
            <!-- 모달 기본 스타일 S -->
            <div style="width:1180px">
                <!-- 모달 제목 영역 S-->
                <div class="sweet_modal_title">
                    제품 찾기 (점검현황 결과 등록/편집 > '찾기' 아이콘 클릭)
                </div>
                <!-- 모달 제목 영역 E-->

                <!-- 모달 내용 영역 : 상세정보 S-->
                <div class="sweet_modal_content">
                    <div class="content_title_wrap no_title">
                        <ul class="dash_tab">
                            <li class="active"><a href="#" >유지보수 이력에서 선택</a></li>
                        </ul>
                    </div>

                    <table class="pop_table view_type">
                        <colgroup>
                            <col style="width: 210px;">
                            <col>
                        </colgroup>

                        <tbody>
                            <tr>
                                <th>접수번호</th>
                                <td>
                                    <div class="input_wrap input_w3">
                                        <input type="text" class="k-input" v-bind:maxlength="20">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th>모델명</th>
                                <td>
                                    <div class="input_wrap input_w3">
                                        <input type="text" class="k-input" v-bind:maxlength="20">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th>제조번호</th>
                                <td>
                                    <ul class="flex_left">
                                        <li>
                                            <div class="input_wrap input_w3">
                                                <input type="text" class="k-input" v-bind:maxlength="20">
                                                <i class="ic ic-bt-input-remove"></i>
                                            </div>
                                        </li>
                                        <li><button class="k-button btn_w1" disabled="disabled">추가</button></li>
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="content_title_wrap bot_line">
                        <ul class="right_area">
                            <li><span class="selected_text">선택된 유지보수 이력에서  N 개 있습니다.</span></li>
                        </ul>
                    </div>

                    <div class="g-table">
                        <table>
                            <colgroup>
                                <col style="width:5%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:5%">
                                <col style="width:10%">
                                <col style="width:10%">
                            </colgroup>

                            <thead>
                                <tr>
                                    <th>
                                        <span class="checkLabel">
                                            <input type="checkbox" class="k-checkbox" name="ched" id="chk-maintain-rt-all">
                                            <label class="k-checkbox-label" for="chk-maintain-rt-all"></label>
                                        </span>
                                    </th>

                                    <th>접수 번호</th>
                                    <th>센터명</th>
                                    <th>유지보수 담당자</th>
                                    <th>제조 번호</th>
                                    <th>모델명</th>
                                    <th>자재 코드</th>
                                    <th>자재명</th>
                                    <th>비용</th>
                                    <th>접수 내용</th>
                                    <th>처리 내용</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr >
                                    <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched1"><label class="k-checkbox-label" for="ched1"></label></span></td>
                                    <td>Installer</td>
                                    <td>_ID</td>
                                    <td>_Name</td>
                                    <td>010-2525-6666</td>
                                    <td>hong88@naver.com</td>
                                </tr>
                                <tr>
                                    <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched1"><label class="k-checkbox-label" for="ched1"></label></span></td>
                                    <td>Installer</td>
                                    <td>_ID</td>
                                    <td>_Name</td>
                                    <td>010-2525-6666</td>
                                    <td>hong88@naver.com</td>
                                </tr>
                                <tr>
                                    <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched1"><label class="k-checkbox-label" for="ched1"></label></span></td>
                                    <td>Installer</td>
                                    <td>_ID</td>
                                    <td>_Name</td>
                                    <td>010-2525-6666</td>
                                    <td>hong88@naver.com</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- 모달 내용 영역 : 상세정보 E-->

                <!-- 모달 전체 버튼 영역 S-->
                <div class="sweet_modal_buttongroup">
                    <button type="button"  v-on:click="closeFindModal" class="k-button">취소</button>
                    <button type="button"  v-on:click="closeFindModal" class="k-button">찾기</button>
                </div>
                    <!-- 모달 전체 버튼 영역 E-->
            </div>
                <!-- 모달 기본 스타일 E -->
        </sweet-modal>
    </div>
</template>

<script>
import axios from "@/api/axios.js";

export default {
    name: "InspectionEnrollModal",
    components: {},
    props: [],
    data: function() {
        return {
            total: 0,
            checked: [],
            checkedCountText: '선택된 제품이 없습니다.',

            totalDeviceLt: 0,
            checkedDeviceLt: [],

            totalDeviceRt: 0,
            checkedDeviceRt: [],

            elStartDate: '',
            elEndDate: '',
            isRevisited: false,

            // add modal
            deviceList: [],
            deviceName: '',
            modelCode: '',
            manufacturingNumber: ''
        }
    },
    methods: {
        openModal() {
            this.$refs.inspectionEnrollModal.open();
        },

        closeModal: function() {
            this.$refs.inspectionEnrollModal.close();
        },

        closeAddModal: function() {
            this.$refs.inspectionAddModal.close();
        },

        closeFindModal: function() {
            this.$refs.inspectionFindModal.close();
        },

        chkChange: function(event) {
            event.target.checked ? ++ this.total : -- this.total;
            this.checkedCountText = this.total > 0 ? this.total + '개의 제품이 선택되었습니다.' : '선택된 제품이 없습니다.';
        },

        chkChangeDeviceLt: function(event) {
            event.target.checked ? ++ this.totalDeviceLt : -- this.totalDeviceLt;
        },

        searchByDevice: function() {
            console.log("[ API ]  : 디바이스 리스트 조회 (/api/sms/maintenance/getProductAddDeviceList)");

            var params = {};
            params.deviceName = this.deviceName;
            params.modelCode = this.modelCode;
            params.manufacturingNumber = this.manufacturingNumber;

            axios.getApi('/sms/maintenance/getProductAddDeviceList', params).then(response => {
                this.deviceList = response.data;

                this.deviceList = [
                    {
                        "deviceName": "디바3이스이름",
                        "deviceType": "실내3기",
                        "gorupName": "groupName",
                        "modelName": "모3델명",
                        "manufacturingNumber": "제3조번호",
                        "deviceId": "wqr1221d"
                    },
                    {
                        "deviceName": "디바2이스이름",
                        "deviceType": "실내기",
                        "gorupName": "grou2pName",
                        "modelName": "모델2명",
                        "manufacturingNumber": "제조번2",
                        "deviceId": "234234235"
                    },
                    {
                        "deviceName": "디바이스이름1",
                        "deviceType": "실내기1",
                        "gorupName": "groupName1",
                        "modelName": "모델명1",
                        "manufacturingNumber": "제조번호1",
                        "deviceId": "46353453"
                    }
                ]
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    this.alert.openAlert("API", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        },

        deviceToRight: function() {
            console.log(this.checkedDeviceLt);

            // this.checkedDeviceLt = this.checkedDeviceLt.filter(function(obj) {
            //     return obj.headerText !== "0-22"; // Or whatever value you want to use
            // });
        },

        deviceToLeft: function() {

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
                    this.itemList.forEach(function (item) { checked.push(item.serviceNumber); });
                }

                this.checked = checked;
                this.total = (this.checked.length > 0) ? this.checked.length : 0;
                this.checkedCountText = (this.checked.length > 0) ? this.checked.length + '개의 제품이 선택되었습니다.' :  '선택된 제품이 없습니다.';
            }
        },

        checkedDeviceLtAll: {
            get: function () {
                return this.deviceList ? this.checkedDeviceLt.length == this.deviceList.length : false;
            },
            set: function (value) {
                var checked = [];
                if (value) {
                    this.deviceList.forEach(function (item) { checked.push(item.deviceId); });
                }

                this.checkedDeviceLt = checked;
                this.totalDeviceLt = (this.checkedDeviceLt.length > 0) ? this.checkedDeviceLt.length : 0;
            }
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
#tbl-inspection-enroll tbody td {
    padding-left: 2px;
    padding-right: 2px;
}
</style>