<template>
    <div class="side_wrap">
        <div class="content_title_wrap">
            <h3 class="content_title maint">시스템 에어컨 유지보수 서비스</h3>
        </div>

        <div class="site-list-wrap">
            <section class="content_view ">
                <div class="maint_fixed">
                    <p>체계화된 시스템으로 전담 엔지니어에 의한 정기점검, 365일 신속 서비스 대응, 원격관리 및 세척 서비스를 제공합니다.</p>

                    <ul class="flex_left mt30">
                        <li><button class="k-button" v-on:click="download('5')">카탈로그 다운로드</button></li>
                        <li><button class="k-button" v-on:click="download('5')">종합세척 안내</button></li>
                        <li><button class="k-button" v-on:click="toSamsungSite">견적문의</button></li>
                    </ul>

                    <div class="content_title_wrap bot_line">
                        <ul class="dash_tab">
                            <li v-for="item in subTabList" v-bind:key="item.name" v-on:click="toggleSubTab(item)" v-bind:class="{active:item.isActive}">
                                <a v-bind:href='item.tab'>{{ item.name }}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="maint_fixed_wrap">
                    <div class="content_title_wrap" id="tabcont1">
                        <h3 class="content_title maint">서비스 안내</h3>
                    </div>

                    <div class="ma_cont bg_gray">
                        <div class="th_img"><img src="@/assets/images/content/ma_info_img1.png" alt="비용절감, 쾌적한환경, 빠른서비스, 관리편의성"></div>
                        <div class="cont_text">
                            <p class="ma_title">주요 기능 및 기대효과</p>

                            <p class="ma_title2">비용절감</p>
                            <ul class="dot_list">
                                <li>열교환기/필터 세척으로 에어컨 "효율개선 및 전기료 절감"</li>
                            </ul>

                            <p class="ma_title2">쾌적한 환경</p>
                            <ul class="dot_list">
                                <li>16단계 체계적인 프로세스에 의한 "완벽분해, 정품세척"</li>
                                <li>냉동공조협회의 표준화 세척으로 신뢰성 인증</li>
                            </ul>

                            <p class="ma_title2">빠른 서비스</p>
                            <ul class="dot_list">
                                <li>전담 엔지니어에 의한 1:1 서비스 제공</li>
                            </ul>

                            <p class="ma_title2">관리 편의성</p>
                            <ul class="dot_list">
                                <li>정기방문 점검 및 서비스 이력관리" 사전 BS 진행</li>
                            </ul>
                        </div>
                    </div>

                    <div class="ma_cont ">
                        <div class="cont_text leftpd">
                            <p class="ma_title">서비스 상세 내용</p>

                            <p class="ma_title2">유지보수</p>
                            <ul class="dot_list">
                                <li>정기점검 : 성수기 도래 전 사전점검 서비스, 전담인력의 신속한 서비스 제공</li>
                                <li>원격관리 : DMS 사용고객 On-Line 서비스(원격모니터링 및 고장 사전 진단)</li>
                            </ul>

                            <p class="ma_title2">종합세척</p>
                            <ul class="dot_list">
                                <li>정품세척 : 16단계 체계적인 종합세척 시행 (오염물질 확실한 제거, 장비 파손 방지)</li>
                                <li>친환경 약품 : 세척력과 살균력 우수, 핀부식 방지, 인체무해 친환경 세척 약품 사용</li>
                                <li>사후관리 : 전문기술자격자의 세척서비스, 철저한 품질보증 및 사후 A/S 책임</li>
                            </ul>

                            <p class="ma_title2">에너지절감</p>
                            <ul class="dot_list">
                                <li>에너지 분석 : 비효율 운전, 누수 조건 검지, 통합관제센터 운영</li>
                            </ul>
                            <p class="ic_nt">친환경 약품 세척제 : special HD calclean(스페셜 HD카클린) / 표면보호제: 듀폰 테플론 / 탈위제: Bio-Fresh cd(바이오 프레쉬 cd)</p>
                        </div>
                        <div class="th_img"><img src="@/assets/images/content/ma_info_img2.png" alt="sms종합관리솔류션, 유지보수, 종합세척, 에너지절감"></div>
                    </div>

                    <div class="content_title_wrap bot_line maint_line " id="tabcont2">
                        <h3 class="content_title maint">유지보수</h3>
                    </div>

                    <div class="ma_cont bg_gray">
                        <div class="th_img"><img src="@/assets/images/content/ma_info_img3.png" alt="Maintenance"></div>
                        <div class="cont_text">
                            <p class="ma_title">365일 신속한 서비스 대응</p>
                            <ul class="text_list">
                                <li><strong>엔지니어에 의한 제품이력 관리 : </strong>고장 예측, 장비 보수 시점 분석, 고객과 비상 연락 체계 유지</li>
                                <li><strong>신속한 AS서비스 : </strong>원격진단, 출동 전 원인파악/자재수급</li>
                                <li><strong>정기적인 방문/점검 활동 : </strong>정기방문 사전점검, 고객 요청 시 점검 서비스</li>
                                <li><strong>원격관리(PC) :</strong>PC를 통한 원격관리</li>
                            </ul>
                        </div>
                    </div>

                    <div class="ma_cont mtt">
                        <div class="cont_text leftpd">
                            <p class="ma_title">전담 엔지니어의 역할 및 차별화 관리</p>
                            <p>장애 발생시, 전담 엔지니어의 On-Line, Off-Line 신속한 서비스를 제공하여 정기점검을 통한 초기 진단 및 고장 방지 등의 예방활동을 실시합니다.</p>

                            <p class="ma_title2 mt30">On-Line 서비스 : RM System을 통한 원격 모니터링</p>
                            <ul class="dot_list ">
                                <li>출동 전 원인파악 및 자재수급, 고객사의 제품 이력 관리</li>
                            </ul>

                            <p class="ma_title2">Off-Line 서비스 : 엔지니어의 정기방문 활동</p>
                            <ul class="dot_list">
                                <li>정기 방문하여 제품점검(年2회), 품질문제에 대한 초기 진단, 고객 VOC 청취 및 해결</li>
                            </ul>
                        </div>
                        <div class="th_img"><img src="@/assets/images/content/ma_info_img4.png" alt="off-line 서비스"></div>
                    </div>

                    <div class="content_title_wrap bot_line maint_line" id="tabcont3">
                        <h3 class="content_title maint">종합세척</h3>
                    </div>

                    <div class="ma_cont bg_gray">
                        <div class="th_img"><img src="@/assets/images/content/ma_info_img5.png" alt="Cleaning Process by Systematic Process"></div>
                        <div class="cont_text">
                            <p class="ma_title">체계적인 프로세스에 의한 세척과정</p>
                            <ul class="text_list">
                                <li>체계적인 세척으로 오염원을 확실히 제거하고, 제품을 최적의 상태로 유지합니다.</li>
                                <li>필터그릴 세척, 필터 세척, 프런트 판넬 세척, 드레인판 세척 PCB 먼지제거, 송풍팬 분해 세척,<br/> 열교환기 세척, 배수펌프 세척, 내부 오염제거</li>
                            </ul>
                        </div>
                    </div>

                    <div class="ma_cont ">
                        <div class="cont_text leftpd">
                            <p class="ma_title">전기료 절감 효과</p>

                            <ul class="text_list">
                                <li>시스템에어컨 세척으로 인한 실내외기 내부 먼지 및 오염물질 제거로 에너지 자체 효율상승은 물론 전기료 절감 효과까지 누릴 수 있습니다.</li>
                                <li class="mt30">필터 청소로 5% 이내 절전 효과와 풍량이 증가하며 희망온도 도달속도가 빨라집니다.
                                    <p class="ic_nt">출처 : 에너지관리 공단 보도자료 2012.05.30 </p></li>
                                <li class="mt30">열교환기 청소로 약 12% 에너지 절감 효과와 냉난방 효율은 증가 및 전기료 감소가 있습니다.
                                    <p class="ic_nt mt10">출처 : 당사 광주 상공회의소 실증 자료</p>
                                    <p class="ic_nt mt10">자사 실험치로, 실사용 환경에 따라 차이가 있을 수 있음.</p>
                                </li>
                            </ul>
                        </div>
                        <div class="th_img"><img src="@/assets/images/content/ma_info_img6.png" alt="Electric charge savings"></div>
                    </div>

                    <div class="ma_cont bg_gray bdb_line">
                        <div class="th_img"><img src="@/assets/images/content/ma_info_img7.png" alt="Implementing a pleasant indoor environment"></div>
                        <div class="cont_text">
                            <p class="ma_title">쾌적한 실내환경 구현</p>

                            <p>공인된 약품과 전용세척기로 실내외기의 미세먼지와 부식물 등 이물질 제거는 물론 뛰어난 살균력으로 깨끗하고 안전한 최적의 실내환경을 제공합니다.</p>

                            <p class="ma_title2 mt30">유해물질 세척</p>
                            <ul class="dot_list">
                                <li>정기점검 : 16단계 전체 분해 세척서비스로 눈에 보이지 않는 곳까지 내부 깊숙한 곳까지 세척</li>
                                <li>친환경 약품 사용 : 살균력이 높고, 열교환기 등 에어컨 구성품에 대한 부식발생은 없는 인체 무해한 약품을 사용</li>
                            </ul>

                            <p class="ma_title2">최적 실내환경 유지</p>
                            <ul class="dot_list">
                                <li>효율 최적화 : RM System을 통한 상시 사이클 이상여부 점검 및 정기점검을 통한 최적화로 온도성능 관리</li>
                                <li>풍량/소음 최적화 : 필터청소를 통해 풍량은 높이고, 소음은 줄여 쾌적한 실내환경 조성</li>
                            </ul>
                        </div>
                    </div>

                    <div class="content_title_wrap mtt2" id="tabcont4">
                        <h3 class="content_title maint">에너지 절감 솔루션 </h3>
                    </div>

                    <div class="ma_cont bg_gray ">
                        <div class="th_img"><img src="@/assets/images/content/ma_info_img8.png" alt="System Air Conditioning remotely, anytime, anywhere"></div>
                        <div class="cont_text">
                            <p class="ma_title">언제 어디서나 원격으로 시스템에어컨 유지관리</p>
                            <p>b.IoT Cloud는 Cloud 기반의 원격 관제 솔루션인 통해, 언제 어디서나 현장의 시스템 에어컨에 대한 관리 편의성을 제공합니다.<br/>
                                유지보수 계약 현장의 경우 Cloud 연계 시 보다 신속하고 체계적인 에어컨 관리가  가능하며,  실시간 운전 데이터 분석으로 에너지 관리,  실내 공기질 관리 편의 기능을  제공합니다.
                                <br/><br/>
                                또한 에어컨의 상태를 종합적으로 분석 및 정리한 정기 리포트를 제공하여, 항상 에어컨을 최적 관리할 수 있도록 지원합니다.
                            </p>

                            <ul class="text_list mt30">
                                <li><strong>유지보수 : </strong>신속한 서비스 대응, 고장 발생시 신속한 원인 파악</li>
                                <li><strong>에너지 관리 : </strong>에너지 사용량 모니터링, 사용자 패턴에 따른 최적화, 주간/월간 보고서</li>
                                <li><strong>Data 분석 : </strong>에어컨 운전, 온도 , 에너지 사용 데이터 분석</li>
                                <li><strong>제어/모니터링 : </strong>언제 어디서나 편리하게 에어컨 제어와 관리가 가능</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>

export default {
    name : "InfoUnjoinList",
    components : {},
    props : [],
    data : function()
    {
        return {
            /* tab variable */
            subTabList: [ { name: "서비스 안내", tab: "#tabcont1", isActive: true }, { name: "유지보수", tab: "#tabcont2", isActive: false }, { name: "종합세척", tab: "#tabcont3", isActive: false }, { name: "에너지 절감 솔루션", tab: "#tabcont4", isActive: false } ]
        }
    },
    methods: {
        toggleSubTab: function(item) {
            this.subTabList.forEach(function(subTab) {
                subTab.isActive = false;
            });

            item.isActive = true;
        },

        download: function(target) {
            this.$emit("download", target);
        },

        toSamsungSite: function() {
            this.$emit("openSite");
        },

        openDetailPop: function() {
            this.$emit("openPop");
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