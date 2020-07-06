<template>
  <sweet-modal
      ref="DetailGraphModal"
      overlay-theme="dark"
      id="sweet_modal_style"
  >
  <div style="width:1500px;height:100%">
    <div class="sweet_modal_title">{{groupName}}</div>
    <div id="chart_wrapper" class="sweet_modal_content" style="height:700px">
        <ResolveMixinsChart ref="ResolveMixinsChart"></ResolveMixinsChart>
    </div>
  </div>
  </sweet-modal>
</template>


<script>

//import Mixins from '@/views/sample/chart/MixinsChart';
//import { Line, Bar } from 'vue-chartjs'
import ResolveMixinsChart from '@/components/resolve/ResolveMixinsChart'

export default {
    name: "DetailGraphModal",
    // eslint-disable-next-line vue/no-unused-components
    components: { ResolveMixinsChart },
    props: {
        groupName: {
            type: String,
            require: true,
            default: ''
        },
        data: {
            type: Object,
            require: true,
            default: null
        },
        options: {
            type: Object,
            require: true,
            default: null
        }
    },
    watch: {},
    data() {
        return {
            chartData: {}
        }
    },
    methods: {
        getChartData() {
            //TODO : date 에 따른 데이터 변경
            this.$refs.ResolveMixinsChart.renderStart(this.data, this.options);
        },
        openModal() {
            this.$refs.DetailGraphModal.open();
            let _this = this;
            setTimeout(function() {
                console.log(document.getElementById('chart_wrapper').offsetHeight);
                _this.getChartData();
            }, 10);
        },
        closeModal() {
            this.$refs.DetailGraphModal.close();
        },
        
    },
    created() {
        
    },
    mounted() {
        console.log('mounted');
        console.log(document.getElementById('chart_wrapper').offsetHeight);
    },
    destroyed() {
    }
}
</script>

<style lang="scss" scoped>

</style>