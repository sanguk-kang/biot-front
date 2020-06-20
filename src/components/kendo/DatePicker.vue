<template>
    <div class="alarm-timeselector">
        <span class="timeselector-start">
            <input class="k-input" type="text" id="startDatePicker">
        </span>
        <span class="timeselector-end">
            <input class="k-input" type="text" id="endDatePicker">
        </span>
    </div>
</template>

<script>
import $ from "jquery";
import "@/assets/kendo/js/lib/jquery.min.js"
import "@/assets/kendo/js/lib/kendo.all.min.js";
import "@/assets/kendo/js/lib/jquery.i18n.properties.js";
import "@/assets/kendo/js/lib/moment-with-locales.js";
import "@/assets/kendo/js/lib/moment-timezone-with-data-2012-2022.js";

import "@/assets/kendo/js/app/widget/common-date-picker.js";

export default {
  name: "DatePicker",
  data: function() {
    return {
    }
  },
  methods: {
  },
  created() {
  },
  mounted() {

     $.i18n.properties({
        name: 'alarm',
        path: '/front/config/locale-dev/',
        mode: 'both',
        language: 'ko',
        async: true,
        callback: function() {}
    });

    window.I18N = $.i18n;

    var nowDate = new Date();
    var selectedStartDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, nowDate.getDate(), 0, 0, 0);
    var selectedEndDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 23, 59, 59);

    var startDatePicker = $("#startDatePicker");
    var endDatePicker = $("#endDatePicker");

    startDatePicker.kendoCommonDatePicker({
        value: selectedStartDate,
        isStart: true,
        change: function() {}
    });
    endDatePicker.kendoCommonDatePicker({
        value: selectedEndDate,
        isEnd: true,
        change: function() {}
    });
  }
}

</script>