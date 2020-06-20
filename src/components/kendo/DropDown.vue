<template>
  <div class="kendoDropDownWrapper"></div>
</template>

<script>
import $ from "jquery";
import "@/assets/kendo/js/lib/kendo.all.min.js";

export default {
  name: "DropDown",
  props: [ 'dataId', 'dataList' ],
  data: function() {
    return {
    }
  },
  methods: {
    changeEvent(param) {
      this.$emit("setDropdown", this.dataId, param);
    }
  },
  created() {
  },
  mounted() {

    let rst = this;

    $(".kendoDropDownWrapper").append("<div id='" + rst.dataId + "'></div>")

    $("#" + rst.dataId).kendoDropDownList({
      dataTextField: "text",
      dataValueField: "value",
      dataSource: rst.dataList,
      change: function() {
        var result = {};
        result.text = this.text();
        result.value = this.value();
        rst.changeEvent(result);
      }
    });
  }
}

</script>