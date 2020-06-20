<template>
    <div class="kendoGridWrapper">
    </div>
</template>

<script>
import $ from "jquery";
import "@/assets/kendo/js/lib/jquery.min.js"
import "@/assets/kendo/js/lib/kendo.all.min.js";
import "@/assets/kendo/js/lib/jquery.i18n.properties.js";

export default {
  name: "Grid",
  props: [ 'dataId', 'dataColumns', 'dataList' ],
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

    $(".kendoGridWrapper").append("<div id='" + rst.dataId + "'></div>")

    $("#" + rst.dataId).kendoGrid({
        dataSource: {
            data: rst.dataList,
            schema: {
                model: {
                    fields: {
                        ProductName: { type: "string" },
                        UnitPrice: { type: "number" },
                        UnitsInStock: { type: "number" },
                        Discontinued: { type: "boolean" }
                    }
                }
            },
        },
        height: 550,
        scrollable: true,
        sortable: true,
        filterable: true,
        columns: rst.dataColumns
    });
  }
}

</script>