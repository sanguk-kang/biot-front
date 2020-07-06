<template>
    <sweet-modal ref="inspectionEditModal" overlay-theme="dark" id="sweet_modal_style" width="1240px">
        <!-- 모달 기본 스타일 S -->
        <div style="width:1180px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                점검 현황 결과 수정
            </div>
            <!-- 모달 제목 영역 E-->

            <!-- 모달 내용 영역 : 상세정보 S-->
            <div class="sweet_modal_content">
                <table class="pop_table view_type mgt">
                    <colgroup>
                        <col style="width: 210px;">
                        <col>
                    </colgroup>

                    <tbody>
                        <tr>
                            <th>서비스 번호</th>
                            <td>YYYYMMDD + random</td>
                        </tr>

                        <tr>
                            <th>카테고리</th>
                            <td>
                                <div class="radio_wrap ft_td">
                                    <span class="radioLabel">
                                        <input type="radio" class="k-radio" name="category" id="rd-edit-category1">
                                        <label class="k-radio-label" for="rd-edit-category1">일반출동</label>
                                    </span>

                                    <span class="radioLabel">
                                        <input type="radio" class="k-radio" name="category" id="rd-edit-category2">
                                        <label class="k-radio-label" for="rd-edit-category2">정기점검</label>
                                    </span>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th>접수 내용</th>
                            <td>
                                <div class="input_wrap  input_w3">
                                    <input type="text" class="k-input" v-bind:maxlength="300">
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th>서비스 기사</th>
                            <td>
                                <div class="input_wrap  input_w3">
                                    <input type="text" class="k-input" v-bind:maxlength="300">
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th>센터명</th>
                            <td>
                                <div class="input_wrap  input_w3">
                                    <input type="text" class="k-input" v-bind:maxlength="300">
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th>방문 일자</th>
                            <td>
                                <div>
                                    <el-date-picker ref="elStartDate" v-model="elStartDate" type="date"></el-date-picker>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th>완료 일자</th>
                            <td>
                                <div>
                                    <el-date-picker ref="elEndDate" v-model="elEndDate" type="date"></el-date-picker>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th>설명</th>
                            <td>
                                <div class="input_wrap  input_w3">
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
                                            <input type="checkbox" class="k-checkbox" name="revisit" id="chk-edit-revisit" v-model="isRevisited">
                                            <label class="k-checkbox-label" for="chk-edit-revisit">재방문</label>
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
                        <li><button class="k-button" v-on:click="addTr">추가</button></li>
                        <li><button class="k-button" v-on:click="deleteTr">삭제</button></li>
                    </ul>
                </div>

                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width: 60px;">
                            <col style="width: 60px;">
                            <col style="width: 150px;">
                            <col style="width: 150px;">
                            <col style="width: auto;">
                            <col style="width: 200px;">
                            <col style="width: 200px;">
                            <col style="width: 100px;">
                            <col style="width: 200px;">
                            <col style="width: 200px;">
                            <col style="width: 60px;">
                        </colgroup>

                        <thead>
                            <tr>
                                <th>
                                    <span class="checkLabel">
                                        <input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAll">
                                        <label class="k-checkbox-label" for="ched_all"></label>
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
                                <td>Installer</td>
                                <td>_ID</td>
                                <td>_Name</td>
                                <td>010-2525-6666</td>
                                <td>hong88@naver.com</td>
                                <td>_Corporate Name</td>
                                <td>_position</td>
                                <td>2020-03-20 14:54</td>
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
</template>


<script>
export default {
    name: "InspectionEditModal",
    components: {},
    props: [],
    data: function() {
        return {
            total: 0,
            checked: [],
            checkedCountText: '선택된 제품이 없습니다.',

            elStartDate: '',
            elEndDate: '',
            isRevisited: false
        }
    },
    methods: {
        openModal() {
            this.$refs.inspectionEditModal.open();
        },

        closeModal() {
            this.$refs.inspectionEditModal.close();
        },

        addTr: function() {
            alert("addTr");
        },

        deleteTr: function() {
            alert("deleteTr");
        },

        chkChange: function(event) {
            event.target.checked ? ++ this.total : -- this.total;
            this.checkedCountText = this.total > 0 ? this.total + '개의 제품이 선택되었습니다.' : '선택된 제품이 없습니다.';
        },
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

</style>