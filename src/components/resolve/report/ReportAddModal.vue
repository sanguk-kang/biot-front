<template>
    <sweet-modal ref="reportAddModal" overlay-theme="dark" id="sweet_modal_style">
        <div style="width:1020px">
            <div class="sweet_modal_title">새 리포트 작성</div>
            <div class="sweet_modal_content" style="height:600px">
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
                                <td>
                                    <div class="input_wrap">
                                        <input
                                            id
                                            name
                                            type="text"
                                            class="k-input"
                                            value
                                            placeholder="리포트 제목을 입력하세요"
                                        />
                                        <i class="ic ic-bt-input-remove"></i>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>발행 주기</th>
                                <td>
									<issueDropdown></issueDropdown>
                                </td>
                            </tr>
                            <tr>
                                <th>발행 기간</th>
                                <td>
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
                                                        style="width: 100%;"/>
													<span
                                                        unselectable="on"
                                                        class="k-select"
                                                        aria-label="select"
                                                        role="button"
                                                        aria-controls="startDatePicker_dateview"
                                                    ><span class="ic ic-bt-input-calendar"></span>
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                        <span class="alarm-bar">~</span>
                                        <span class="timeselector-end">
                                            <span
                                                class="k-widget k-datepicker k-header k-input"
                                                style
                                            >
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
                                </td>
                            </tr>

                            <tr>
                                <th>리포트 구성</th>
                                <td>
									<reportCompositionSelector v-model="compositionSelected"></reportCompositionSelector>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <!-- e:scroll-->
                </div>

                <!-- </div> -->
                <!-- </div> -->
            </div>
            <div class="sweet_modal_buttongroup">
                <button type="button" class="k-button" @click="close">닫기</button>
                <button type="button" class="k-button" @click="saveNewReport">저장</button>
            </div>
        </div>
    </sweet-modal>
</template>

<script>
    export default {
        name: "ReportAddModal",
        components: {
			IssueDropdown: () => import("@/components/resolve/report/IssuanceCycleDropdown"),
			ReportCompositionSelector: () => import("@/components/resolve/report/ReportCompositionSelector")
		},
        props: [],
        data() {
            return {
				compositionSelected: [],
				newItem: {
					title: null,
					issuanceCycle: null,
					startDate: null,
					endDate: null,
					compositionItems: []
				}
			};
        },
        methods: {
            saveNewReport() {
				alert('새로 저장되었습니다.');
			},
            open() {
                this.$refs.reportAddModal.open();
            },
            close() {
                this.$refs.reportAddModal.close();
            }
		},
    };
</script>

<style lang="scss" scoped>
</style>