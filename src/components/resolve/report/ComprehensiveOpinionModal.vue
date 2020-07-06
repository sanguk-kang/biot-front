<template>
    <sweet-modal ref="opinionModal" overlay-theme="dark" id="sweet_modal_style">
        <!-- <div class="k-widget k-dialog k-window pop-confirm alarm-dialog" style="width:660px;height:830px;left: 900px;top:50%; transform: translate(-50%, -50%); z-index: 10007;"> -->
        <div style="width:600px">
            <div class="sweet_modal_title">리포트 종합 의견</div>
            <div class="sweet_modal_stitle">
                <p class="stitle">{{ opinionDetail.title }}</p>
            </div>
            <!-- <div class="k-window-titlebar k-dialog-titlebar k-header">
            <span class="k-window-title k-dialog-title">리포트 종합의견</span>
            </div>-->
            <div class="sweet_modal_content" style="height:600px">
                <!-- <div data-role="detaildialog" class="k-content"> -->
                <!-- <div class="detail-dialog-content"> -->
                <!-- <div class="title-status-bar">
                        <p class="title">레포트 제목</p>
                </div>-->

                <div class="detail-dialog-detail-content">
                    <!-- s:scroll-->
                    {{ opinionDetail.content }}
                    <!-- e:scroll-->
                </div>

                <!-- </div> -->
                <!-- </div> -->
            </div>
            <div class="sweet_modal_buttongroup">
                <button type="button" class="k-button" @click="close">닫기</button>
            </div>
        </div>
    </sweet-modal>
</template>

<script>
    export default {
        name: "ComprehensiveOpinionModal",
        components: {},
        data() {
            return {
                target: -1,
                opinionDetail: {
                    title: "이번달 보고서 종합의견",
                    content: "나랏말쌈이 듕극에 달아~ fuck~~"
                }
            };
        },
        methods: {
            getOpinion(index){
                console.log(`Getting comprehensive opinion of target index: ${index}`)
            },
            open(index) {
                this.target = index;
                this.$refs.opinionModal.open();
            },
            close() {
                this.$refs.opinionModal.close();
            }
        },
        watch: {
            target(newValue) {
                this.getOpinion(newValue);
            }
        },
    };
</script>

<style lang="scss" scoped>
</style>