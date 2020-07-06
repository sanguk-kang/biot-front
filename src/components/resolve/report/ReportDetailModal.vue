<template>
    <sweet-modal ref="reportDetailModal" overlay-theme="dark" id="sweet_modal_style">
        <div style="width:1020px">
            <div class="sweet_modal_title">상세 정보</div>
            <div class="sweet_modal_content">
                <div class="detail-dialog-content">
                    <div class="detail-dialog-detail-content">
                        <!-- s:scroll-->
                        <table class="pop_table view_type">
                            <colgroup>
                                <col style="width: 210px;" />
                                <col />
                            </colgroup>
                            <tbody>
                                <tr>
                                    <th>제목</th>
                                    <td v-if="isEdit">
                                        <div class="input_wrap">
                                            <input
                                                type="text"
                                                class="k-input"
                                                :value="detail.title"
                                                placeholder="리포트 제목을 입력하세요"
                                            />
                                            <i class="ic ic-bt-input-remove"></i>
                                        </div>
                                    </td>
                                    <td v-else>
                                        {{ detail.title }}
                                    </td>
                                </tr>
                                <tr>
                                    <th>발행 주기</th>
                                    <td>{{ detail.issuanceCycle }} (매월 {{ detail.issuedDate }})</td>
                                </tr>
                                <tr>
                                    <th>발행 기간</th>
                                    <td v-if="isEdit">
                                        <div class="input_wrap">
                                            <input
                                                type="text"
                                                class="k-input"
                                                :value="detail.issuanceTermEndDate"
                                                placeholder="종료일"
                                            />
                                            <i class="ic ic-bt-input-remove"></i>
                                        </div>
                                    </td>
                                    <td v-else>{{ detail.issuanceTermStartDate }} ~ {{ detail.issuanceTermEndDate }}</td>
                                </tr>

                                <tr>
                                    <th>리포트 구성</th>
                                    <td>
                                        <ReportCompositionSelector :disabled="!isEdit" v-model="detail.reportCompositions"></ReportCompositionSelector>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="content_title_wrap bot_line">
                            <ul class="flex_left">
                                <li>자동생성 리포트 목록</li>
                            </ul>
                            <ul class="right_area">
                                <li>
                                    <button class="k-button" :disabled="selected.length === 0" @click="download">다운로드</button>
                                </li>
                            </ul>
                        </div>

                        <!-- s:grid-->
                        <div class="g-table">
                            <table>
                                <colgroup>
                                    <col style="width:10%" />
                                    <col style="width:20%" />
                                    <col style="width:35%" />
                                    <col style="width:15%" />
                                    <col style="width:20%" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>
                                            <span class="checkLabel">
                                                <input
                                                    type="checkbox"
                                                    class="k-checkbox"
                                                    name="ched"
                                                    id="selectAll2"
                                                    v-model="selectAll2"
                                                />
                                                <label class="k-checkbox-label" for="selectAll2"></label>
                                            </span>
                                        </th>
                                        <th>
                                            발행시간
                                            <i class="ic_sort"></i>
                                        </th>
                                        <th>제목</th>
                                        <th>리포트</th>
                                        <th>종합의견</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in detail.reportList" :key="item.idx">
                                        <td>
                                            <span class="checkLabel">
                                                <input
                                                    type="checkbox"
                                                    class="k-checkbox"
                                                    name="report-detail-idx"
                                                    :v-model="selected"
                                                    :id="`report_detail_${item.idx}`"
                                                    :value="item.idx"
                                                />
                                                <label class="k-checkbox-label" :for="`report_detail_${item.idx}`"></label>
                                            </span>
                                        </td>
                                        <td>{{ item.issuedDate }}</td>
                                        <td>{{ item.title }}</td>
                                        <td>
                                            <button class="k-button btn_w1" @click="viewReport(item.idx)">보기</button>
                                        </td>
                                        <td>
                                            <a href class="btn_text" @click="viewOpinion(item.opinion.idx)">{{ item.opinion.createdDate }}</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- e:grid-->
                        <!-- e:scroll-->
                    </div>
                </div>
            </div>
            <div class="sweet_modal_buttongroup">
                <button type="button" class="k-button" @click="close">닫기</button>
                <button v-if="isEdit" type="button" class="k-button" @click="changeAction(false)">저장</button>
                <button v-else type="button" class="k-button" @click="changeAction(true)">수정</button>
            </div>
        </div>
    </sweet-modal>
</template>

<script>
    export default {
        name: "ReportAddModal",
        components: {
            ReportCompositionSelector: () => import("@/components/resolve/report/ReportCompositionSelector")
        },
        data() {
            return {
                isEdit: false,  // 수정모드 여부
                index: -1,      // 리포트 상세 정보 인덱스
                selected: [],   // 보고서 선택 인덱스 목록
                // TODO: SAMPLE
                detail: {
                    idx: 4,
                    title: "월간 보고서서 제목",
                    issuanceCycle: "monthly",
                    issuanceCycleDate: "16",
                    issuanceTermStartDate: "2020-04-01",
                    issuanceTermEndDate: "2020-10-01",
                    reportCompositions: [1,3,5],
                    reportList: [
                        {
                            idx: 11,
                            issuedDate: "2020-05-16 00:00",
                            title: "보고서 1",
                            opinion: {
                                idx: 32,
                                createdDate: "2020-05-12"
                            }

                        },
                        {
                            idx: 12,
                             issuedDate: "2020-06-16 00:00",
                            title: "보고서 2",
                            opinion: {
                                idx: 32,
                                createdDate: "2020-07-11"
                            }
                        },
                        {
                            idx: 13,
                            issuedDate: "2020-07-01 00:00",
                            title: "보고서 3",
                            opinion: {
                                idx: 44,
                                createdDate: "2020-06-15"
                            }
                        }
                    ]
                }
            };
        },
        methods: {
            getDetailReport(index){
                console.log(`target index: ${index}`);
            },
            changeAction(edit) {
                this.isEdit = edit;
            },
            download(){
                console.log(`download targets are ${this.selected}`);
            },
            viewReport(index) {
                console.log(`View Report index is ${index}`);
                const {href} = this.$router.resolve({name: "ResolveReportMultiSiteViewer", params: { index: index }});
                window.open(href, '_new', 'width=1000px;');
            },
            viewOpinion(index){
                console.log(`View Opinion index os ${index}`);
            },
            open(index) {
                this.index = index;
                this.$refs.reportDetailModal.open();
            },
            close() {
                this.$refs.reportDetailModal.close();
            }
        },
        computed: {
            selectAll2: {
                get() {
                    return this.detail.reportList.length > 0
                            ? this.selected.length === this.detail.reportList.length : false;
                },
                set(checked) {
                    this.selected = [];
                    if (checked) {
                        this.detail.reportList.forEach(v => this.selected.push(v.idx));
                    }
                }
            }
        },
        watch: {
            index(newValue, oldValue) {
                console.log(`new: ${newValue}, old: ${oldValue}`);
                //TODO: get a detail report info by index(newValue)
            },
            selected(newValue, oldValue){
                console.log(`new: ${newValue}, old: ${oldValue}`);
            }
        },
    };
</script>

<style lang="scss" scoped>
.g-table {
    overflow-x: hidden;
    overflow-y: auto;
}
</style>