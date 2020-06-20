<template>
  <div id="main-sidebar">
    <div id="main-sidebar-menu">
      <div class="main-sidebar-top">
        <h1 class="main-sidebar-top-text">
          <img src="../../assets/kendo/images/logo-white.png" />
        </h1>
      </div>
      <!--s:text list-->
      <nav class="main-sidebar-menu-list">
        <ul class="list">
          <li data-name="dashboard" class="main-sidebar-menu-item ">
            <a>대시보드</a>
          </li>
          <li data-name="hmi" class="main-sidebar-menu-item">
            <a>그래픽</a>
          </li>
          <li data-name="device" class="main-sidebar-menu-item ">
            <a>디바이스</a>
          </li>
          <li data-name="operation" class="main-sidebar-menu-item active">
            <a>운영관리</a>
            <i class="main-sidebar-menu-arrow"></i>
            <ul class="main-sidebar-menu-sub-list" style="">
              <li data-name="alarm" class="main-sidebar-sub-menu-item ">
                <a>알람</a>
              </li>
              <li
                data-name="schedule"
                class="main-sidebar-sub-menu-item active"
              >
                <a>스케줄</a>
              </li>
              <li data-name="rule" class="main-sidebar-sub-menu-item ">
                <a>제어로직</a>
              </li>
              <li data-name="group" class="main-sidebar-sub-menu-item ">
                <a>그룹</a>
              </li>
            </ul>
          </li>
          <li data-name="history" class="main-sidebar-menu-item ">
            <a>이력관리</a>
            <i class="main-sidebar-menu-arrow"></i>
            <ul class="main-sidebar-menu-sub-list" style="">
              <li data-name="report" class="main-sidebar-sub-menu-item ">
                <a>리포트</a>
              </li>
              <li data-name="trendlog" class="main-sidebar-sub-menu-item ">
                <a>트렌드 로그</a>
              </li>
              <li data-name="systemlog" class="main-sidebar-sub-menu-item ">
                <a>시스템 로그</a>
              </li>
            </ul>
          </li>
          <li data-name="controlareasettings" class="main-sidebar-menu-item ">
            <a>관제영역 설정</a>
            <i class="main-sidebar-menu-arrow"></i>
            <ul class="main-sidebar-menu-sub-list" style="">
              <li data-name="building" class="main-sidebar-sub-menu-item ">
                <a>빌딩</a>
              </li>
            </ul>
          </li>
          <li data-name="accountsettings" class="main-sidebar-menu-item ">
            <a>계정 설정</a>
            <i class="main-sidebar-menu-arrow"></i>
            <ul class="main-sidebar-menu-sub-list" style="">
              <li data-name="accountmgmt" class="main-sidebar-sub-menu-item ">
                <a>계정관리</a>
              </li>
              <li data-name="authmgmt" class="main-sidebar-sub-menu-item ">
                <a>권한설정</a>
              </li>
            </ul>
          </li>
          <li data-name="devicesettings" class="main-sidebar-menu-item ">
            <a>디바이스 설정</a>
            <i class="main-sidebar-menu-arrow"></i>
            <ul class="main-sidebar-menu-sub-list" style="">
              <li data-name="controller" class="main-sidebar-sub-menu-item ">
                <a>Controller</a>
              </li>
              <li data-name="bacnet" class="main-sidebar-sub-menu-item ">
                <a>BACnet</a>
              </li>
              <li
                data-name="deviceregistration"
                class="main-sidebar-sub-menu-item "
              >
                <a>디바이스 등록</a>
              </li>
              <li data-name="virtualpoint" class="main-sidebar-sub-menu-item ">
                <a>가상관제점</a>
              </li>
            </ul>
          </li>
          <li data-name="energysettings" class="main-sidebar-menu-item ">
            <a>에너지 설정</a>
            <i class="main-sidebar-menu-arrow"></i>
            <ul class="main-sidebar-menu-sub-list" style="">
              <li
                data-name="energydistribution"
                class="main-sidebar-sub-menu-item "
              >
                <a>에너지 분배 설정</a>
              </li>
            </ul>
          </li>
          <li data-name="systemsettings" class="main-sidebar-menu-item ">
            <a>시스템설정</a>
            <i class="main-sidebar-menu-arrow"></i>
            <ul class="main-sidebar-menu-sub-list" style="">
              <li data-name="webportal" class="main-sidebar-sub-menu-item ">
                <a>관리자포털</a>
              </li>
              <li data-name="license" class="main-sidebar-sub-menu-item ">
                <a>라이선스</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <!--e:text list-->
      <!--s:icon list-->
      <div class="main-sidebar-hidden">
        <div class="top-info">
          <span class="icon"></span>
        </div>
        <div class="logo">
          <img
            src="../../assets/kendo/images/icon/ic-hidden-sidebar-logo.png"
            alt="logo_small"
          />
        </div>
        <nav class="main-sidebar-menu-icon-list">
          <!--<div class="main-sidebar-menu-list-line first"></div>-->
          <ul class="list">
            <li
              data-name="dashboard"
              tooltip-name="대시보드"
              class="main-sidebar-menu-icon-item "
            >
              <a class="ic ic-dashboard"></a>
            </li>
            <li
              data-name="hmi"
              tooltip-name="그래픽"
              class="main-sidebar-menu-icon-item"
            >
              <a class="ic ic-hmi"></a>
            </li>
            <li
              data-name="device"
              tooltip-name="디바이스"
              class="main-sidebar-menu-icon-item "
            >
              <a class="ic ic-device"></a>
            </li>
            <li
              data-name="operation"
              tooltip-name="운영관리"
              class="main-sidebar-menu-icon-item active"
            >
              <a class="ic ic-operation"></a>
            </li>
            <li
              data-name="history"
              tooltip-name="이력관리"
              class="main-sidebar-menu-icon-item "
            >
              <a class="ic ic-history"></a>
            </li>
            <li
              data-name="controlareasettings"
              tooltip-name="관제영역 설정"
              class="main-sidebar-menu-icon-item "
            >
              <a class="ic ic-controlareasettings"></a>
            </li>
            <li
              data-name="accountsettings"
              tooltip-name="계정 설정"
              class="main-sidebar-menu-icon-item "
            >
              <a class="ic ic-accountsettings"></a>
            </li>
            <li
              data-name="devicesettings"
              tooltip-name="디바이스 설정"
              class="main-sidebar-menu-icon-item "
            >
              <a class="ic ic-devicesettings"></a>
            </li>
            <li
              data-name="energysettings"
              tooltip-name="에너지 설정"
              class="main-sidebar-menu-icon-item "
            >
              <a class="ic ic-energysettings"></a>
            </li>
            <li
              data-name="systemsettings"
              tooltip-name="시스템설정"
              class="main-sidebar-menu-icon-item "
            >
              <a class="ic ic-systemsettings"></a>
            </li>
          </ul>
          <!--<div class="main-sidebar-menu-list-line last"></div>-->
        </nav>
      </div>
      <!--e:icon list-->
      <span
        class="main-sidebar-menu-icon-item-tag"
        style="display: none;"
      ></span>
      <div class="btn-util" style="display: block;">
        <div class="btn-box">
          <span class="btn hide" event-name="hide"></span>
          <span class="btn show" event-name="show"></span>
        </div>
      </div>
    </div>
  </div>
  <!--</div>-->
</template>

<script>
export default {
  name: "Nav",
  components: {},
  props: [],
  data: function() {
    return { }
  },
  methods: {
    menuMove(list) {
      if (this.$route.name != list.path) {
        this.$router.push({name : list.path});
      }
    }
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