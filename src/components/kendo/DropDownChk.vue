<template>
  <div class="kendoDropDownChkWrapper"></div>
</template>

<script>
import $ from "jquery";
import "@/assets/kendo/js/lib/jquery.min.js";
import "@/assets/kendo/js/lib/kendo.all.min.js";
import "@/assets/kendo/js/lib/jquery.i18n.properties.js";

import "@/assets/kendo/js/app/widget/control-dropdown-checkbox.js";

export default {
  name: "DropDownChk",
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

    $(".kendoDropDownChkWrapper").append("<div id='" + rst.dataId + "'></div>");

   $("#" + rst.dataId).kendoDropDownCheckBox({
        invisible: false,
        disabled: false,
        selectAllText: "전체",
        animation: false,
        autoBind: true,
        showSelectAll: true,
        emptyText: "전체",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: rst.dataList
    });
  }
}

</script>