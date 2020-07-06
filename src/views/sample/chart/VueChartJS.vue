<template>
<div class="content">
    <div style='width:500px; height: 100px;'>
        <!-- <h1>Demo examples of vue-chartjs</h1> -->
        <h3>Mixins Chart</h3>
        <Mixins></Mixins>

        <h3>HorizontalBar Chart</h3>
        <HorizontalBar></HorizontalBar>

        <h3>Radar Chart</h3>
        <Radar></Radar>

        <h3>Doughnut Chart</h3>
        <Doughnut></Doughnut>

        <h3>Line Chart</h3>
        <LineChart></LineChart>
    
        <h3>Bar Chart</h3>
        <BarChart></BarChart>

        <h3>Bubble Chart</h3>
        <BubbleChart></BubbleChart>
    </div>
</div>
</template>

<script>
import Mixins from '@/views/sample/chart/MixinsChart';
import HorizontalBar from '@/views/sample/chart/HorizontalBarChart';
import Radar from '@/views/sample/chart/RadarChart';
import Doughnut from '@/views/sample/chart/DoughnutChart';
import LineChart from '@/views/sample/chart/LineChart';
import BarChart from '@/views/sample/chart/BarChart';
import BubbleChart from '@/views/sample/chart/BubbleChart';

  export default {
    name: 'VueChartJS',
    components: {
        Mixins
        ,HorizontalBar
        ,Radar
        ,Doughnut
        ,LineChart
        ,BarChart
        ,BubbleChart
        // ,Reactive
    }

  }
</script>
