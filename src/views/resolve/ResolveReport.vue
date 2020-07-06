<template>
    <div class="content">
        <div class="tab_page">
            <ul>
                <li class="active">
                    <span class="t-link">리포트</span>
                </li>
            </ul>
        </div>
        <div class="side_wrap">
            <!-- 정렬방식 및 검색 영역-->
            <div class="content_title_wrap">
                <ul class="right_area">
                    <li>
                        <button class="k-button" @click="openAddNewReport">생성</button>
                    </li>
                    <li>
                        <button class="k-button" :disabled="report.selected.length === 0" @click="download">다운로드</button>
                    </li>
                    <li>
                        <button class="k-button" :disabled="report.selected.length === 0" @click="deleteReports">삭제</button>
                    </li>
                    <li>
                        <div class="search_input_wrap">
                            <input
                                class="k-input"
                                type="text"
                                placeholder="검색 내용 입력"
                                v-model="filter.text"
                                v-on:keypress.enter="getReportList"
                            />
                            <span class="ic ic-bt-input-remove"></span>
                            <span class="ic ic-bt-input-search" @click="getReportList"></span>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="content_title_wrap">
                <ul class="flex_left">
                    <li>
                        <ul class="btn_list">
                            <li>
                                <button class="k-button active">Day</button>
                            </li>
                            <li>
                                <button class="k-button">Month</button>
                            </li>
                            <li>
                                <button class="k-button">Year</button>
                            </li>
                            <li>
                                <button class="k-button">Date</button>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <div class="alarm-timeselector">
                            <span class="timeselector-start">
                                <span class="k-widget k-datepicker k-header k-input" style>
                                    <span class="k-picker-wrap k-state-default">
                                        <input
                                            class="k-input"
                                            type="text"
                                            id="startDatePicker"
                                            data-role="commondatepicker"
                                            readonly="readonly"
                                            role="combobox"
                                            aria-expanded="false"
                                            aria-owns="startDatePicker_dateview"
                                            aria-disabled="false"
                                            style="width: 100%;"
                                        />
                                        <span
                                            unselectable="on"
                                            class="k-select"
                                            aria-label="select"
                                            role="button"
                                            aria-controls="startDatePicker_dateview"
                                        >
                                            <span class="ic ic-bt-input-calendar"></span>
                                        </span>
                                    </span>
                                </span>
                            </span>

                            <span class="timeselector-end">
                                <span class="k-widget k-datepicker k-header k-input" style>
                                    <span class="k-picker-wrap k-state-default">
                                        <input
                                            class="k-input"
                                            type="text"
                                            id="endDatePicker"
                                            data-role="commondatepicker"
                                            readonly="readonly"
                                            role="combobox"
                                            aria-expanded="false"
                                            aria-owns="endDatePicker_dateview"
                                            aria-disabled="false"
                                            style="width: 100%;"
                                        />
                                        <span
                                            unselectable="on"
                                            class="k-select"
                                            aria-label="select"
                                            role="button"
                                            aria-controls="endDatePicker_dateview"
                                        >
                                            <span class="ic ic-bt-input-calendar"></span>
                                        </span>
                                    </span>
                                </span>
                            </span>
                        </div>
                    </li>
                    <li>
                        <span class="ic-bar"></span>
                    </li>
                    <li>
                        <button class="k-button btn_w1" @click="getReportList">조회</button>
                    </li>
                    <li>
                        <issueDropdown v-model="filter.issuance"></issueDropdown>
                    </li>
                </ul>
                <ul class="right_area">
                    <li>
                        <span class="selected_text">{{ report.selected.length }} is selected.</span>
                    </li>
                </ul>
            </div>

            <div class="site-list-wrap">
                <!-- s: 컨텐츠 -->
                <section classa="content_view" style="width: 100%;">
                    <!-- D:Site List Area 가 나올시 가변 width값 필요함-->

                    <!-- s: 기본 list-->
                    <div class="g-table">
                        <table>
                            <colgroup>
                                <col style="width:5%" />
                                <col style="width:15%" />
                                <col style="width:30%" />
                                <col style="width:10%" />
                                <col style="width:12%" />
                                <col style="width:10%" />
                                <col style="width:12%" />
                                <col style="width:6%" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>
                                        <span class="checkLabel">
                                            <input
                                                type="checkbox"
                                                class="k-checkbox"
                                                name="ched"
                                                id="ched_all"
                                                v-model="selectAll"
                                            />
                                            <label class="k-checkbox-label" for="ched_all"></label>
                                        </span>
                                    </th>
                                    <th>
                                        생성시간
                                        <i class="ic_sort"></i>
                                    </th>
                                    <th>
                                        제목
                                        <i class="ic_sort"></i>
                                    </th>
                                    <th>
                                        발행주기
                                        <i class="ic_sort"></i>
                                    </th>
                                    <th>자동생성</th>
                                    <th>리포트</th>
                                    <th>종합의견</th>
                                    <th>정보</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="rpt in report.list" v-bind:key="rpt.idx">
                                    <td>
                                        <span class="checkLabel">
                                            <input
                                                type="checkbox"
                                                class="k-checkbox"
                                                name="report-idx"
                                                v-model="report.selected"
                                                :id="`report_${rpt.idx}`"
                                                :value="rpt.idx"
                                            />
                                            <label
                                                class="k-checkbox-label"
                                                :for="`report_${rpt.idx}`"
                                            ></label>
                                        </span>
                                    </td>
                                    <td>{{ rpt.created_date }}</td>
                                    <td>{{ rpt.title }}</td>
                                    <td>{{ rpt.cycle }}</td>
                                    <td>{{ rpt.auto_creation }}</td>
                                    <td>
                                        <button
                                            class="k-button btn_w1"
                                            @click="viewReport(rpt.idx)"
                                        >보기</button>
                                    </td>
                                    <td>
                                        <span @click="openOpinion(rpt.idx)" style="cursor:pointer">{{ rpt.opinion }}</span>
                                    </td>
                                    <td>
                                        <button
                                            class="ic ic-info"
                                            @click="openDetailReport(rpt.idx)"
                                        ></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- e: 기본 list-->
                </section>
                <!-- e:  컨텐츠-->
                <!-- s: Site List Area -->
                <section class="site-list" style="display: block;">


                </section>
                <!-- e: Site List Area -->

                <reportAddModal ref="reportAddModal"></reportAddModal>
                <comprehensiveOpinionModal ref="opinionModal"></comprehensiveOpinionModal>
                <reportDetailModal ref="reportDetailModal" :target="report.target"></reportDetailModal>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ResovleReport",
        components: {
            ComprehensiveOpinionModal: () => import("@/components/resolve/report/ComprehensiveOpinionModal"),
            ReportAddModal: () => import("@/components/resolve/report/ReportAddModal"),
            ReportDetailModal: () => import("@/components/resolve/report/ReportDetailModal"),
            IssueDropdown: () => import("@/components/resolve/report/IssuanceCycleDropdown"),
        },
        data() {
            return {
                report: {
                    target: -1,
                    selected: [],
                    list: [
                        {
                            idx: 4,
                            created_date: "2020-06-02 08:22",
                            title: "월간 레포트 2020.05",
                            cycle: "월간",
                            auto_creation: "매월 1일",
                            opinion: "2020-05-19"
                        },
                        {
                            idx: 3,
                            created_date: "2020-06-01 10:22",
                            title: "월간 레포트 2020.05",
                            cycle: "월간",
                            auto_creation: "매월 9일",
                            opinion: "2020-05-18"
                        },
                        {
                            idx: 2,
                            created_date: "2020-05-31 11:22",
                            title: "월간 레포트 2020.05",
                            cycle: "월간",
                            auto_creation: "매월 15일",
                            opinion: null
                        },
                        {
                            idx: 1,
                            created_date: "2020-05-30 12:22",
                            title: "월간 레포트 2020.05",
                            cycle: "월간",
                            auto_creation: "매월 10일",
                            opinion: "2020-05-19"
                        }
                    ]
                },
                filter: {
                    text: null,
                    startDate: null,
                    endDate: null,
                    issuance: null
                }
            };
        },
        methods: {
            getReportList() {
                // TODO: 필터 조건 포함 API 조회
                console.log(`issuance: ${this.filter.issuance},
    start date: ${this.filter.startDate},
    end date: ${this.filter.endDate},
    text: ${this.filter.text}`);
            },
            deleteReports() {
                this.$confirm("선택한 리포트를 삭제하시겠습니까?", "Warning",
                    {
                        title: "확인",
                        confirmButtonText: "예",
                        cancelButtonText: "아니오",
                        type: "",
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        dangerouslyUseHTMLString: true
                    }
                ).then(() => {
                    //TODO: API 호출 및 결과 확인
                    // 실패 시 처리 방안....
                    this.$alert('선택한 리포트가 삭제되었습니다.', 'Title', {
                        title: "알림",
                        confirmButtonText: 'OK',
                        dangerouslyUseHTMLString: true,
                        callback: action => {
                            console.log(action);
                        }
                    });
                }).catch(() => {
                    this.$alert('선택한 리포트 삭제가 취소되었습니다.', 'Title', {
                        title: "알림",
                        confirmButtonText: 'OK',
                        dangerouslyUseHTMLString: true,
                        callback: action => {
                            console.log(action);
                        }
                    });
                });
            },
            openAddNewReport() {
                this.$refs.reportAddModal.open();
            },
            openDetailReport(index) {
                this.$refs.reportDetailModal.open(index);
            },
            openOpinion(index) {
                this.$refs.opinionModal.open(index);
            },
            viewReport(index){
                console.log(`go to resport: ${index}`)
                const {href} = this.$router.resolve({ name: "ResolveReportMultiSiteViewer", params: { index }});
                window.open(href, "_blank");
            },
            download() {
                // TODO: 선택 다운로드
            }
        },
        computed: {
            selectAll: {
                get() {
                    return this.report.list.length > 0
                        ? this.report.selected.length === this.report.list.length
                        : false;
                },
                set(checked) {
                    this.report.selected = [];
                    if (checked) {
                        this.report.list.forEach(v =>
                            this.report.selected.push(v.idx)
                        );
                    }
                }
            }
        },
        watch: {
            "filter.issuance"(newValue, oldValue) {
                // TODO: 발행 주기 변경에 따른 목록 재조회
                if (newValue != oldValue){
                    console.log(newValue);
                    this.getReportList();
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
</style>
