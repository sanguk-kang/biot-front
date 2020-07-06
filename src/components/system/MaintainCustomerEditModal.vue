<template>
    <sweet-modal ref="maintainCustomerEditModal" overlay-theme="dark" id="sweet_modal_style">
        <!-- 1500사이즈 모달 스타일 시작 -->
        <div style="width:1500px; height:830px;">
            <!-- 모달 제목 영역 S-->
            <div class="sweet_modal_title">
                유지보수 고객정보 편집
            </div>
            <!-- 모달 내용 영역 : 상세정보 시작-->
            <div class="sweet_modal_content">
                <table class="pop_table view_type mgt">
                    <colgroup>
                        <col style="width: 210px;">
                        <col>
                        <col style="width: 210px;">
                        <col>
                    </colgroup>
                    <tbody>

                    <tr>
                        <th>사이트 이름</th>
                        <td>
                            <div class="input_wrap  input_w8">
                                <input type="text" class="k-input" value="" disabled="disabled" placeholder="" />
                                <i class="ic ic-bt-input-remove"></i>
                            </div>
                        </td>
                        <th>전화번호</th>
                        <td>
                            <div class="input_wrap  input_w8">
                                <input type="text" class="k-input" value="" disabled="disabled" placeholder="" />
                                <i class="ic ic-bt-input-remove"></i>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>구매 상품명</th>
                        <td>
                            <div class="input_wrap  input_w8">
                                <input type="text" class="k-input" value="" placeholder="" />
                                <i class="ic ic-bt-input-remove"></i>
                            </div>
                        </td>
                        <th>계약코드</th>
                        <td>
                            <div class="input_wrap  input_w8">
                                <input type="text" class="k-input" value="" placeholder="" />
                                <i class="ic ic-bt-input-remove"></i>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>만료일</th>
                        <td>
                <span class="timeselector-start">
                  <input class="k-input" type="text" id="startDatePicker">
                </span>
                        </td>
                        <th>프로젝트 코드</th>
                        <td>
                            <div class="input_wrap  input_w8">
                                <input type="text" class="k-input" value="" placeholder="" />
                                <i class="ic ic-bt-input-remove"></i>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th rowspan="2">유지보수 담당자</th>
                        <td rowspan="2" >
                            <ul class="flex_left">
                                <li>
                                    <div class="input_wrap input_w1">
                                        <!-- 20200520 input_w1 수정-->
                                        <input id="" name="" type="text" class="k-input" value="이름" disabled="disabled" placeholder=" ">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </li>
                                <li>
                                    <div class="input_wrap input_w1">
                                        <!-- 20200520 input_w1 수정-->
                                        <input id="" name="" type="text" class="k-input" value="전화번호" disabled="disabled" placeholder=" ">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </li>
                                <li><button class="k-button ic_search">조회</button></li>
                                <li><button class="k-button ic_minus">삭제</button></li>
                            </ul>

                            <ul class="flex_left add-mt">
                                <li>
                                    <div class="input_wrap input_w1">
                                        <!-- 20200520 input_w1 수정-->
                                        <input id="" name="" type="text" class="k-input" value="이름" disabled="disabled" placeholder=" ">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </li>
                                <li>
                                    <div class="input_wrap input_w1">
                                        <!-- 20200520 input_w1 수정-->
                                        <input id="" name="" type="text" class="k-input" value="전화번호" disabled="disabled" placeholder=" ">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </li>
                                <li><button class="k-button ic_search">조회</button></li>
                                <li><button class="k-button ic_minus">삭제</button></li>
                            </ul>
                            <ul class="flex_left add-mt btn_right">
                                <li><button class="k-button ic_add">추가</button></li>
                            </ul>
                        </td>
                        <th>현장 관리자</th>
                        <td>
                            <ul class="flex_left">
                                <!-- s:20200520 수정-->
                                <li>
                                    <div class="input_wrap input_w1">
                                        <input id="" name="" type="text" class="k-input" value="이름" placeholder=" ">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </li>
                                <li>
                                    <div class="input_wrap input_w1">
                                        <input id="" name="" type="text" class="k-input" value="전화번호" placeholder=" ">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </li>
                            </ul><!-- e:20200520 수정-->
                        </td>
                    </tr>
                    <tr>

                        <th>영업 관리자</th>
                        <td>
                            <ul class="flex_left">
                                <!-- s:20200520 수정-->
                                <li>
                                    <div class="input_wrap input_w1">
                                        <input id="" name="" type="text" class="k-input" value="이름" placeholder=" ">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </li>
                                <li>
                                    <div class="input_wrap input_w1">
                                        <input id="" name="" type="text" class="k-input" value="전화번호" placeholder=" ">
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </li>
                            </ul><!-- e:20200520 수정-->
                        </td>
                    </tr>
                    </tbody>
                </table>

                <!-- s: grid top filter-->
                <div class="content_title_wrap bot_line">
                    <!--s:total-->
                    <p class="total_num">유지보수 대상 기기</p>
                    <!--e:total-->
                    <ul class="right_area">
                        <li><button class="k-button">디바이스 선택</button></li>
                    </ul>
                </div>
                <!-- e: grid top filter-->

                <!-- s:grid-->
                <div id="grid"></div>
                <!-- e:grid-->
            </div>
            <!-- 모달 내용 영역 : 상세정보 끝-->
            <!-- 모달 전체 버튼 영역 S-->
            <div class="sweet_modal_buttongroup">
                <button type="button" @click="closeModal" class="k-button">닫기</button>
                <button type="button" @click="closeModal" class="k-button" >삭제</button>
                <button type="button" @click="closeModal" class="k-button" disabled="disabled">저장</button>
            </div>
        </div>
        <!-- 모달 기본 스타일 끝 -->
    </sweet-modal>
</template>

<script>
    export default {
        name: "MaintainCustomerEditModal",
        components: {},
        props: [ 'itemList' ],
        data: function() {
            return {

            }
        },
        methods: {
            openModal() {
                this.$refs.maintainCustomerEditModal.open();
            },

            closeModal() {
                this.$refs.maintainCustomerEditModal.close();
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