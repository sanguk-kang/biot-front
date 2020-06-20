<template>
  <div id="main-contents">
      <div>{{msg}}</div>

  </div>
</template>

<script>
export default {
  name: "SampleCustom",
  props: [],
  data: function() {
    return {
      msg: "SampleCustom view",
      dropDownList1: [
        {
          text: "밍밍1",
          value: "miing1"
        },
        {
          text: "에러",
          value: "Critical"
        },
        {
          text: "경고",
          value: "Warning"
        }
      ]
    }
  },
  methods: {
  },
  created() {
  },
  mounted() {
  },
  destroyed() {
  }
}
</script>

<style lang="scss">

</style>