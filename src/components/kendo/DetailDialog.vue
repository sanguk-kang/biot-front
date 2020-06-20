<template>
    <div class="kendoDetailDialogWrapper">
        <div style="padding-bottom: 10px;">
            <button class="k-button" id="btn-detail-dialog">Open Detail Dialog</button>
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import "@/assets/kendo/js/lib/jquery.min.js"
import "@/assets/kendo/js/lib/kendo.all.min.js";
import "@/assets/kendo/js/lib/jquery.i18n.properties.js";

import "@/assets/kendo/js/app/widget/common-dialog.js";

export default {
  name: "DetailDailog",
  props: [ 'dataId', 'dataSchema', 'dataList' ],
  data: function() {
    return {
    }
  },
  methods: {
  },
  created() {
  },
  mounted() {

    let rst = this;

    $(".kendoDetailDialogWrapper").append("<div id='" + rst.dataId + "'></div>");

    $("#" + this.dataId).kendoDetailDialog({
        title: "kendoDetailDialog-title",
        dataSource: rst.dataList,
        hasDelete: false,
        height: 400,
        width: 500,
        scheme: rst.dataSchema,
        isCustomActions: true,
        actions: [{
            text: "저장",
            visible: true,
            action: function() {}
        }, {
            text: "수정",
            visible: true,
            action: function() {}
        }, {
            text: "취소",
            visible: true,
            action: function() {}
        }]
    });

    $("#btn-detail-dialog").on("click", function() {
        $("#" + rst.dataId).data("kendoDetailDialog").open();
    });
  }
}

</script>