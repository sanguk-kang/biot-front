<template>
    <div class="kendoSingleWindowPopWrapper">
        <div style="padding-bottom: 10px;">
            <button class="k-button" id="btn-single-pop">Open Single Window Pop</button>
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import "@/assets/kendo/js/lib/jquery.min.js"
import "@/assets/kendo/js/lib/kendo.all.min.js";
import "@/assets/kendo/js/lib/jquery.i18n.properties.js";

import "@/assets/kendo/js/app/widget/popup.js";

export default {
  name: "SingleWindowPop",
  props: [ 'dataId', 'dataList' ],
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

    $(".kendoSingleWindowPopWrapper").append("<div id='" + rst.dataId + "'></div>");

    $("#" + rst.dataId).kendoPopupSingleWindow({
      name: "PopupSingleWindow",
			resizable: false,
			draggable: false,
			data: rst.dataList,
      title: "kendoPopupSingleWindow-title",
      width: 1000,
      height: 800
    });

    $("#btn-single-pop").on("click", function() {
        $("#" + rst.dataId).data("kendoPopupSingleWindow").openWindowPopup();
    });
  }
}

</script>