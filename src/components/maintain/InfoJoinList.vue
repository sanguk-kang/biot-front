<template>
    <div class="side_wrap">
        <div class="content_title_wrap">
            <h3 class="content_title maint">유지보수  가입정보</h3>
        </div>

        <div class="site-list-wrap">
            <section class="content_view ">
                <table class="form_table maint_table">
                    <colgroup>
                        <col style="width: 260px;">
                        <col>
                    </colgroup>

                    <tbody>
                        <tr>
                            <th>구매 상품명</th>
                            <td>{{ itemList.productName }}</td>
                        </tr>
                        <tr>
                            <th>계약코드</th>
                            <td>{{ itemList.contractCode }}</td>
                        </tr>
                        <tr>
                            <th>만료일</th>
                            <td>{{ itemList.expiredDate }}</td>
                        </tr>
                        <tr>
                            <th>유지보수 대상 기기</th>
                            <td v-on:click="openDetailPop"><span style="cursor: pointer; text-decoration: underline;">{{ itemList.equipmentMaintenance }}</span></td>
                        </tr>
                        <tr>
                            <th>유지보수 담당자</th>
                            <td>
                                <span v-for="sub in itemList.maintainerUserInfo" v-bind:key="sub.mobilePhoneNumber">
                                    {{ sub.userName }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="content_title_wrap mt40">
                    <h3 class="content_title maint">유지보수 이용안내</h3>
                </div>

                <div class="ma_cont">
                    <div class="int_wrap">
                        <p class="title">365일 신속한 서비스 대응</p>
                        <ul class="text_list">
                            <li><strong>전담 엔지니어에 의한 제품이력 관리 :</strong>고장 예측, 장비 보수 시점 분석, 고객과 비상 연락 체계 유지</li>
                            <li><strong>신속한 AS서비스 : </strong>원격진단, 출동 전 원인파악/자재수급</li>
                            <li><strong>정기적인 방문/점검 활동 :</strong>정기방문 사전점검, 고객 요청 시 점검 서비스</li>
                        </ul>

                        <ul class="flex_left mt30">
                            <li><button class="k-button" v-on:click="download('5')">카탈로그 다운로드</button></li>
                            <li><button class="k-button" v-on:click="download('5')">종합세척 안내</button></li>
                            <li><button class="k-button" v-on:click="toSamsungSite">견적문의</button></li>
                        </ul>
                    </div>

                    <div class="int_wrap">
                        <p class="title">삼성전자 비즈니스 전용 서비스 콜센터</p>
                        <p class="ic_imc"></p>
                        <p class="tell">1588-3773</p>
                        <p class="etc">(09:00~21:00) www.samsungsvc.co.kr</p>
                    </div>
                </div>

                <div class="content_title_wrap mt40">
                    <h3 class="content_title maint">타사 디바이스 이용안내</h3>
                </div>

                <div class="data-table mb100">
                    <table>
                        <colgroup>
                            <col style="width:380px">
                            <col style="width:600px">
                            <col style="width:600px">
                        </colgroup>

                        <thead>
                            <tr>
                                <th class="tal">Device Type </th>
                                <th class="tal">Company Name</th>
                                <th class="tal">Service Center Contact</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td rowspan="3">Lighting</td>
                                <td>Company Name</td>
                                <td>1566-0000, _email address_</td>
                            </tr>
                            <tr>
                                <td>Company Name</td>
                                <td>1566-0000</td>
                            </tr>
                            <tr>
                                <td>Company Name</td>
                                <td>1566-0000</td>
                            </tr>
                            <tr>
                                <td rowspan="3">Air quality Center</td>
                                <td>Company Name</td>
                                <td>1566-0000, _email address_</td>
                            </tr>
                            <tr>
                                <td>Company Name</td>
                                <td>1566-0000</td>
                            </tr>
                            <tr>
                                <td>Company Name</td>
                                <td>1566-0000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import axios from "@/api/axios.js";

export default {
    name : "InfoJoinList",
    components : {},
    props : [],
    data : function()
    {
        return {
            /* table variable */
            itemList: []
        }
    },
    methods: {
        openAlert: function(title, msg) {
            this.$alert(msg, 'Title', {
                title: title, confirmButtonText: 'OK', dangerouslyUseHTMLString: true
            });
        },

        download: function(target) {
            this.$emit("download", target);
        },

        toSamsungSite: function() {
            this.$emit("openSite");
        },

        openDetailPop: function() {
            this.$emit("openPop");
        },

        search: function() {
            let alert = this;

            // TODO
            var params = {};
            params.siteId = 20301;

            console.log("[ API ]  : 서비스센터 정보 조회 (/sms/maintenance/productinformation)", params);

            axios.getApi('/sms/maintenance/productinformation', params).then(response => {
                this.itemList = response.data;
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("안내", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
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