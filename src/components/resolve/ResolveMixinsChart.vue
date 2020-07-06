<script>
  //Importing Bar class from the vue-chartjs wrapper
  import { Line, Bar } from 'vue-chartjs'
  //Exporting this so it can be used in other components
  export default {
    extends: Line, Bar,
    watch: {
        
    },
    data () {
      return {
        
      }
    },
    methods: {
        renderStart(data, option) {
          console.log(data);
          this.renderChart(data, option);
        }
    },
    mounted () {
      //renderChart function renders the chart with the datacollection and options object.
      
    }
  }
</script>