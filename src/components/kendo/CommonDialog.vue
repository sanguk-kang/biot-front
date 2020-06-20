<template>
    <div class="kendoCommonDialogWrapper">
        <div style="padding-bottom: 10px;">
            <button class="k-button" id="btn-common-dialog">Open Common Dialog</button>
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
  name: "CommonDailog",
  props: [ 'dataId', 'dataMsg' ],
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

    $(".kendoCommonDialogWrapper").append("<div id='" + rst.dataId + "'></div>");

    $("#" + rst.dataId).kendoCommonDialog({
      type: 'confirm',
      height: 252,
      title: "kendoCommonDialog-title",
      message: rst.dataMsg,
      typeActions: {
          confirm: [{
              text: "NO",
              action: function(e) {
                  e.sender.close();
              }
          }, {
              text: "YES",
              action: function(e) {
                  e.sender.close();
              }
          }]
      }
    });

    $("#btn-common-dialog").on("click", function() {
        $("#" + rst.dataId).data("kendoCommonDialog").open();
    });
  }
}

</script>