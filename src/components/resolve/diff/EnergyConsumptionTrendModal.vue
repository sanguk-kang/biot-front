<template>
    <div class="side_wrap">

        <div class="content_title_wrap">
          <ul class="dash_tab">
            <li class="active">소비 트렌드</li>
            <li>목표설정</li>
            <li>절감내역</li>
          </ul>
          <ul class="right_area icon_type">
            <li><button class="ic ic-view-graph active">차트보기</button></li>
            <li><button class="ic ic-list">목록보기</button></li>
          </ul>
        </div>

        <div class="content_title_wrap">
          <ul class="flex_left">
            <li>
              <ul class="btn_list">
                <li><button class="k-button active">Day</button></li>
                <li><button class="k-button">Month</button></li>
                <li><button class="k-button">Year</button></li>
                <li><button class="k-button">Date</button></li>
              </ul>
            </li>
            <li>
              <div class="calendar-input">
                <button class="ic ic-date-prev ">이전달</button>
                <button class="ic ic-date-current">2020-05</button>
                <button class="ic ic-date-next">다음달</button>
              </div>
            </li>
          </ul>
        </div>

        <div class="content_title_wrap">
          <ul class="flex_left">
            <li>
              <span title="" class="k-widget k-dropdown k-header" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="dropDownList1_listbox" aria-disabled="false" aria-busy="false" aria-activedescendant="46f86248-2e7d-4191-a259-f68377d44480" style=""><span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">알람 타입</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList1" data-role="dropdownlist" style="display: none;"></div></span>
            </li>
            <li>
              <span title="" class="k-widget k-dropdown k-header" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" aria-owns="dropDownList2_listbox" aria-disabled="true" aria-busy="false" aria-activedescendant="12faefcd-7246-4f03-a291-844edec3a711" style=""><span unselectable="on" class="k-dropdown-wrap k-state-disabled"><span unselectable="on" class="k-input">알람 타입</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList2" data-role="dropdownlist" disabled="disabled" style="display: none;"></div></span>
            </li>
            <li>
              <span title="" class="k-widget k-dropdown k-header" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="dropDownList3_listbox" aria-disabled="false" aria-busy="false" style=""><span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">전체</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList3" data-role="dropdowncheckbox" style="display: none;"></div></span>
            </li>
            <li>
              <span title="" class="k-widget k-dropdown k-header" unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="dropDownList4_listbox" aria-disabled="false" aria-busy="false" aria-activedescendant="03cbf6f7-3b8f-4ecc-973a-71706d9ad449" style=""><span unselectable="on" class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">알람 타입</span><span unselectable="on" class="k-select" aria-label="select"><span class="k-icon k-i-arrow-60-down"></span></span></span><div id="dropDownList4" data-role="dropdownlist" style="display: none;"></div></span>
            </li>
            <li><span class="ic-bar"></span></li>
            <li><button class="k-button btn_w1">내보내기</button></li>
          </ul>
          <ul class="right_area">
            <li><span class="selected_text">0 is selected.</span></li>
          </ul>
        </div>

        <div class="site-list-wrap">
          <!-- s: 컨텐츠 -->
          <section classa="content_view" style="width: 100%;">
            <!-- D:Site List Area 가 나올시 가변 width값 필요함-->
            <div class="chart_view">
              <!-- <img src="../../../assets/images/chart03.jpg" alt=""> -->
            </div>
          </section>
          <!-- e:  컨텐츠-->
          <!-- s: Site List Area -->
          <section class="site-list" style="display: none;">

          </section>
          <!-- e: Site List Area -->
        </div>



    </div>
</template>

<script>

export default {
    name : "energyConsumptionTrendModal",
    components : {
      
    },
    props : [],
    data : function()
    {
        return {
        }
    },
    methods: {
        download: function(target) {
            this.$emit("download", target);
        },

        toSamsungSite: function() {
            this.$emit("openSite");
        },

        openDetailPop: function() {
            this.$emit("openPop");
        },
      
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

#pop-target-detail {
    cursor: pointer;
    text-decoration: underline;
}

</style>