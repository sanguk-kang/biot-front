<template>
  <div id="main-sidebar">
    <div id="main-sidebar-menu">
      <div class="main-sidebar-top">
        <h1 class="main-sidebar-top-text">
          <img src="@/assets/images/logo-white.png" />
        </h1>
      </div>
      <!-- s:text list test -->
      <nav class="main-sidebar-menu-list">
          <ul class="list" v-if="parentList.length > 0">
              <li v-for="list in parentList" :key="list.menuId" :id="list.menuId" class="main-sidebar-menu-item" @click='clickMenu($event, list)'>
                <a>{{list.name}}</a>
                <!-- s:text sub menu -->
                <span v-if="list.webUrl == ''">
                  <i class="main-sidebar-menu-arrow"></i>
                  <ul class="main-sidebar-menu-sub-list" style="">
                    <span v-for="item in childList" :key="item.menuId">
                      <span v-if="item.parentId == list.menuId">
                        <li :id="item.menuId" class="main-sidebar-sub-menu-item" @click='clickMenu($event, item)'>
                          <a>{{item.name}}</a>
                        </li>
                      </span>
                    </span>
                  </ul>
                </span>
                <!-- e:text sub menu -->
              </li>
         </ul>
      </nav>
      <!-- e:text list test-->

      <!--s:icon list-->
      <div class="main-sidebar-hidden">
        <div class="top-info">
          <span class="icon"></span>
        </div>
        <div class="logo">
          <img
            src="@/assets/images/icon/ic-hidden-sidebar-logo.png"
            alt="logo_small"
          />
        </div>
        <nav class="main-sidebar-menu-icon-list">
          <!--<div class="main-sidebar-menu-list-line first"></div>-->
          <ul class="list">
            <!-- icon menu list -->
            <el-tooltip v-for="icon in menuIconList" :key="icon.key" effect="dark" :content="icon.name" placement="right">
              <li
                :id="'icon' + icon.key"
                :data-name="icon.key"
                class="main-sidebar-menu-icon-item"
                @click="iconMenuClick(icon)"
              >
                <a :class="icon.value"></a>
              </li>
            </el-tooltip>
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
          <span class="btn hide" @click="slideMenu(true)"></span>
          <span class="btn show" @click="slideMenu(false)"></span>
        </div>
      </div>
    </div>
  </div>
  <!--</div>-->
</template>

<script>
import stringUtils from "@/utils/stringUtils.js";
import commonCode from "@/utils/commonCode.js";

export default {
  name: "Nav",
  components: {},
  props: ['menuType'],
  watch: {
    menuType(val) {
      console.log('>>> 사이드바 변경', val);
      if (val === "sidelist") {
        // this.menuTreeView(this.$route.name);
      } else {
        this.iconMenuTreeView(this.$route.name);
      }
      
    }
  },
  data: function() {
    return {
        navList: [
                  // 1. 대시보드
                  {
                      "menuId": 1,				// 메뉴 아이디
                      "depth": 1,				// 메뉴 댑스
                      "parentId": "",			// 상위 메뉴 아이디
                      "webUrl": "Dashboard",	// 메뉴 주소
                      "menuSequence": 1,		// 메뉴 순서
                      "name": "대시보드",
                      "permission": "A"
                  },
                  // 2. 디바이스
                  {
                      "menuId": 2,
                      "depth": 1,
                      "parentId": "",
                      "webUrl": "",
                      "menuSequence": 2,
                      "name": "디바이스",
                      "permission": "A"
                  },
                  {
                      "menuId": 3,
                      "depth": 2,
                      "parentId": "2",
                      "webUrl": "DeviceMgmt",
                      "menuSequence": 1,
                      "name": "기기관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 4,
                      "depth": 2,
                      "parentId": 2,
                      "webUrl": "DeviceEnergy",
                      "menuSequence": 2,
                      "name": "신재생 에너지",
                      "permission": "A"
                  },
                  // 3. 에너지
                  {
                      "menuId": 5,
                      "depth": 1,
                      "parentId": "",
                      "webUrl": "",
                      "menuSequence": 3,
                      "name": "에너지",
                      "permission": "A"
                  },
                  {
                      "menuId": 6,
                      "depth": 2,
                      "parentId": "5",
                      "webUrl": "EnergyReduce",
                      "menuSequence": 1,
                      "name": "에너지절감제어",
                      "permission": "A"
                  },
                  {
                      "menuId": 7,
                      "depth": 2,
                      "parentId": "5",
                      "webUrl": "EnergyDetect",
                      "menuSequence": 2,
                      "name": "비효율운전감지",
                      "permission": "A"
                  },
                  // 4. 운영
                  {
                      "menuId": 8,
                      "depth": 1,
                      "parentId": "",
                      "webUrl": "",
                      "menuSequence": 4,
                      "name": "운영",
                      "permission": "A"
                  },
                  {
                      "menuId": 9,
                      "depth": 2,
                      "parentId": "8",
                      "webUrl": "OperationAlarm",
                      "menuSequence": 1,
                      "name": "알림",
                      "permission": "A"
                  },
                  {
                      "menuId": 10,
                      "depth": 2,
                      "parentId": "8",
                      "webUrl": "OperationSchedule",
                      "menuSequence": 2,
                      "name": "스케줄제어",
                      "permission": "A"
                  },
                  {
                      "menuId": 11,
                      "depth": 2,
                      "parentId": "8",
                      "webUrl": "OperationRuleCtrl",
                      "menuSequence": 3,
                      "name": "룰기반제어",
                      "permission": "A"
                  },
                  {
                      "menuId": 12,
                      "depth": 2,
                      "parentId": "8",
                      "webUrl": "OperationRuleAlert",
                      "menuSequence": 4,
                      "name": "룰기반알림",
                      "permission": "A"
                  },
                  {
                      "menuId": 13,
                      "depth": 2,
                      "parentId": "8",
                      "webUrl": "OperationGroup",
                      "menuSequence": 5,
                      "name": "그룹관리",
                      "permission": "A"
                  },
                  // 5. 분석
                  {
                      "menuId": 14,
                      "depth": 1,
                      "parentId": "",
                      "webUrl": "",
                      "menuSequence": 5,
                      "name": "분석",
                      "permission": "A"
                  },
                  {
                      "menuId": 15,
                      "depth": 2,
                      "parentId": "14",
                      "webUrl": "ResolveDiffDeviceOperatingTime",
                      "menuSequence": 1,
                      "name": "비교분석",
                      "permission": "A"
                  },
                  {
                      "menuId": 16,
                      "depth": 2,
                      "parentId": "14",
                      "webUrl": "ResolveHistory",
                      "menuSequence": 2,
                      "name": "이력조회",
                      "permission": "A"
                  },
                  {
                      "menuId": 17,
                      "depth": 2,
                      "parentId": "14",
                      "webUrl": "ResolveReport",
                      "menuSequence": 2,
                      "name": "리포트",
                      "permission": "A"
                  },
                  // 6. 유지보수
                  {
                      "menuId": 18,
                      "depth": 1,
                      "parentId": "",
                      "webUrl": "",
                      "menuSequence": 6,
                      "name": "유지보수",
                      "permission": "A"
                  },
                  {
                      "menuId": 19,
                      "depth": 2,
                      "parentId": "18",
                      "webUrl": "MaintainInfo",
                      "menuSequence": 1,
                      "name": "상품안내",
                      "permission": "A"
                  },
                  {
                      "menuId": 20,
                      "depth": 2,
                      "parentId": "18",
                      "webUrl": "MaintainDefect",
                      "menuSequence": 2,
                      "name": "고장진단",
                      "permission": "A"
                  },
                  {
                      "menuId": 21,
                      "depth": 2,
                      "parentId": "18",
                      "webUrl": "MaintainInspection",
                      "menuSequence": 2,
                      "name": "점검현황",
                      "permission": "A"
                  },
                  {
                      "menuId": 22,
                      "depth": 2,
                      "parentId": "18",
                      "webUrl": "MaintainPanel",
                      "menuSequence": 2,
                      "name": "공청필터세첵",
                      "permission": "A"
                  },
                  // 7. 시스템설정
                  {
                      "menuId": 23,
                      "depth": 1,
                      "parentId": "",
                      "webUrl": "",
                      "menuSequence": 7,
                      "name": "시스템설정",
                      "permission": "A"
                  },
                  {
                      "menuId": 24,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemDefault",
                      "menuSequence": 1,
                      "name": "기본설정",
                      "permission": "A"
                  },
                  {
                      "menuId": 25,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemElectric",
                      "menuSequence": 2,
                      "name": "전력량계관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 26,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemLicense",
                      "menuSequence": 3,
                      "name": "라이선스관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 27,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemConnection",
                      "menuSequence": 4,
                      "name": "기기연결관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 28,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemAccount",
                      "menuSequence": 5,
                      "name": "계정관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 29,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemAuth",
                      "menuSequence": 6,
                      "name": "권한관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 30,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemSite",
                      "menuSequence": 7,
                      "name": "사이트관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 31,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemPayment",
                      "menuSequence": 8,
                      "name": "전력요금제관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 32,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemContent",
                      "menuSequence": 9,
                      "name": "컨텐츠관리",
                      "permission": "A"
                  },
                  {
                      "menuId": 33,
                      "depth": 2,
                      "parentId": "23",
                      "webUrl": "SystemMaintain",
                      "menuSequence": 10,
                      "name": "유지보수정보관리",
                      "permission": "A"
                  },
                  // 8. 샘플
                  {
                      "menuId": 90,
                      "depth": 1,
                      "parentId": "",
                      "webUrl": "",
                      "menuSequence": 90,
                      "name": "샘플",
                      "permission": "A"
                  },
                  {
                      "menuId": 90,
                      "depth": 2,
                      "parentId": "90",
                      "webUrl": "Sample",
                      "menuSequence": 1,
                      "name": "샘플기본",
                      "permission": "A"
                  }
                ],
        parentList: [],
        childList: [],
        menuIconList: []
    }
  },
  methods: {
    iconMenuTreeView() {
      var currentRouteName = this.$route.name;
      var currentId = '';
      // 부모화면 검색 : 1depth
      var findParent = this.parentList.find(function (n) {
        return n.webUrl == currentRouteName;
      });
      // 부모 화면 class 적용
      if (!stringUtils.isEmpty(findParent)) {
        currentId = 'icon' + findParent.menuId;
      } else {
        var findChild = this.childList.find(function (n) {
          return n.webUrl == currentRouteName;
        });
        currentId = 'icon' + findChild.parentId;
      }
      // 메뉴 클로우즈
      this.menuIconList.forEach(element => {
      var el = document.getElementById('icon' + element.key);
        el.classList.remove("active");
      });
      // 메뉴 활성화
      var element = document.getElementById(currentId);
      element.classList.toggle("active");
    },
    iconMenuClick(icon) {
      console.log('>>> iconMenuClick', icon);
      this.slideMenu(false);
      this.removeClass(this.parentList);
      this.activeClass(icon.key);
    },
    // 화면 이동
    menuMove(page) {
      this.$router.push({name : page});
    },
    // 메뉴 슬라이드
    slideMenu(param) {
      this.$emit('change', param);
    },
    // 메뉴 클릭
    clickMenu(event, list) {
      console.log('>>> 클릭 메뉴', list);
      // 서브 메뉴 컨트롤 이벤트
      event.stopPropagation();
      // 서브 메뉴 오픈
      if (stringUtils.isEmpty(list.webUrl)) {       // 메뉴 제어
        var element = document.getElementById(list.menuId);
        var menuIndex = element.className.indexOf("active");
        this.removeClass(this.parentList);
        // 메뉴가 닫쳐있는 경우만 열기
        if (menuIndex < 0) {
          this.activeClass(list.menuId);
        }
      } else {                                      // 화면 링크
        if (this.$route.name != list.webUrl) {      // 동일한 주소 이동 불가
          this.menuTreeView(list.webUrl);
          this.menuMove(list.webUrl);
        }
      }
      
    },
    menuTreeView(routeName) {
      var currentRouteName = routeName;
      // 부모화면 검색 : 1depth
      var findParent = this.parentList.find(function (n) {
        return n.webUrl == currentRouteName;
      });
      // 부모 화면 class 적용
      if (!stringUtils.isEmpty(findParent)) {
        this.removeClass(this.parentList);
        this.removeClass(this.childList);
        this.activeClass(findParent.menuId);
      } else {
        var findChild = this.childList.find(function (n) {
          return n.webUrl == currentRouteName;
        });
        // 부모 메뉴
        this.removeClass(this.parentList);
        this.activeClass(findChild.parentId);
        // 자식 메뉴
        this.removeClass(this.childList);
        this.activeClass(findChild.menuId);
      }
    },
    activeClass(id) {
      var activeId = id;
      var element = document.getElementById(activeId);
      element.classList.toggle("active");
    },
    removeClass(list) {
      var removeList = list;
      removeList.forEach(element => {
        var el = document.getElementById(element.menuId);
        el.classList.remove("active");
      });
    },
    // 초기값 셋팅
    initMenu() {
      console.log('initMenu', this.navList);
      var tempMenuList = [];
      // 초기화
      this.parentList = [];
      this.childList = [];
      // 임시 메뉴
      if (!stringUtils.isEmpty(JSON.parse(sessionStorage.getItem('menuInfo')))) {
        tempMenuList = JSON.parse(sessionStorage.getItem('menuInfo'));
        // tempMenuList = this.navList;
      } else {
        tempMenuList = this.navList;
      }
      // 메뉴 셋팅
      tempMenuList.forEach(element => {
        if (element.depth == 1) { // 메인 메뉴
            this.parentList.push(JSON.parse(JSON.stringify(element)));  // 1depth
        } else { // 서브 메뉴
            this.childList.push(JSON.parse(JSON.stringify(element)));   // 2depth
        }
      });
      // sort list
      this.parentList.sort(function (a, b) { 
        return a.menuSequence < b.menuSequence ? -1 : a.menuSequence > b.menuSequence ? 1 : 0;  
      });
      this.childList.sort(function (a, b) { 
        return a.menuSequence < b.menuSequence ? -1 : a.menuSequence > b.menuSequence ? 1 : 0;  
      });
      console.log('parentList:', this.parentList, ', childList:', this.childList);
      this.initIconMenu();
    },
    initIconMenu() {
      var iconMuenuList = commonCode.menuIconData();
      var tmpIconList = [];
      // 중복 메뉴 아이콘
      for(let list of iconMuenuList){
        if(this.parentList.find((val) => val.menuId == parseInt(list.key)))tmpIconList.push(list);
      }
      
      this.menuIconList = tmpIconList;
    }
  },
  created() {
      this.initMenu();
  },
  mounted() {
    // 화면 메뉴 트리
    this.menuTreeView(this.$route.name);
  },
  destroyed() {
  }
}
</script>

<style lang="scss">

</style>