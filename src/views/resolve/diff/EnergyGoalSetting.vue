<template>
  <div class="content">
    <TabPage></TabPage>

    <div class="side_wrap">
      <SubMenu></SubMenu>
      <div class="content_title_wrap">
        <ul class="flex_left">
          <li>
            <!-- 셀렉트 박스 시작 -->
            <el-select v-model="energyGroupSelect" placeholder="Select">
              <el-option
                  v-for="item in energyGroup"
                  :key="item.value"
                  :label="item.key"
                  :value="item.value">
              </el-option>
            </el-select>
            <!-- 셀렉트 박스 끝 -->
          </li>
          <li>
            <div class="k-dropdown">
              <!-- 드랍다운(체크박스) 시작 -->
              <VueDropdown v-model="groupMain" :selectboxData='groupMainList' :isCheckType="true" :allText="'전체그룹'"></VueDropdown>
              <!-- 드랍다운(체크박스) 끝 -->
            </div>
          </li>
          <li v-show="groupMain.length === 1">
            <div class="k-dropdown">
            <!-- 드랍다운(체크박스) 시작 -->
            <VueDropdown v-model="groupSub" :selectboxData='groupSubList' :isCheckType="true" :allText="'서브그룹'" :disabled="false"></VueDropdown>
            <!-- 드랍다운(체크박스) 끝 -->
            </div>
          </li>
          <li v-show="groupMain.length != 1" >
            <span unselectable="on" role="listbox" aria-haspopup="true" aria-expanded="false" aria-owns="dropDownList2_listbox" aria-disabled="true" aria-busy="false" class="k-widget k-dropdown k-header">
              <span unselectable="on" class="k-dropdown-wrap k-state-disabled">
                <span unselectable="on" class="k-input">
                  서브그룹
                </span>
                <span unselectable="on" aria-label="select" class="k-select"><span class="k-icon k-i-arrow-60-down"></span></span></span>
            </span>
          </li>
          <li>
            <YearPicker :elYear.sync="filter.year"></YearPicker>
          </li>
          <li><span class="ic-bar"></span></li>
          <li><button class="k-button btn_w1">조회</button></li>
        </ul>
        <ul class="right_area">
          <li><button class="k-button btn_w1">편집</button></li>
        </ul>
      </div>

      <div class="site-list-wrap">
        <!-- s: 컨텐츠 -->
        <section classa="content_view" style="width: 100%;">
          <!-- D:Site List Area 가 나올시 가변 width값 필요함-->
          <div class="content_title_wrap">
            <h2 class="content_title">목표 에너지 소비량</h2>
          </div>
          <!-- s:grid-->
          <div class="g-table">
            <table>
              <colgroup>
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
              </colgroup>
              <thead>
                <tr>
                  <th colspan="2">목표소비량</th>
                  <th>1월</th>
                  <th>2월</th>
                  <th>3월</th>
                  <th>4월</th>
                  <th>5월</th>
                  <th>6월</th>
                  <th>7월</th>
                  <th>8월</th>
                  <th>9월</th>
                  <th>10월</th>
                  <th>11월</th>
                  <th>12월</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="tal">
                    hong88
                  </td>
                  <td class="tar">
                    134,550 kWh<br>
                    <span class="highlighted-ing">20% 감소</span>
                  </td>
                  <td>11,700</td>
                  <td>11,700</td>
                  <td>11,700</td>
                  <td>11,700</td>
                  <td>11,700</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
                <tr class="set_height">
                  <td class="tal">
                    hong88
                  </td>
                  <td class="tar">
                    <input type="text" class="k-input input_w12"> kWh<br>
                    <span class="highlighted-ing">20% 감소</span>
                  </td>
                  <td><input type="text" class="k-input input_w12" disabled="disabled"></td>
                  <td><input type="text" class="k-input input_w12" disabled="disabled"></td>
                  <td><input type="text" class="k-input input_w12" disabled="disabled"></td>
                  <td><input type="text" class="k-input input_w12" disabled="disabled"></td>
                  <td><input type="text" class="k-input input_w12" disabled="disabled"></td>
                  <td><input type="text" class="k-input input_w12"></td>
                  <td><input type="text" class="k-input input_w12"></td>
                  <td><input type="text" class="k-input input_w12"></td>
                  <td><input type="text" class="k-input input_w12"></td>
                  <td><input type="text" class="k-input input_w12"></td>
                  <td><input type="text" class="k-input input_w12"></td>
                  <td><input type="text" class="k-input input_w12"></td>
                </tr>
              </tbody>

            </table>
          </div>
          <!-- e:grid-->

          <div class="content_title_wrap">
            <h2 class="content_title">에너지 소비량</h2>
          </div>
          <!-- s:grid-->
          <div class="g-table">
            <table>
              <colgroup>
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
                <col style="width:7%">
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <span title="" class="k-widget k-dropdown k-header select_w4" unselectable="on" role="listbox"
                      aria-haspopup="true" aria-expanded="false" tabindex="0" aria-owns="dropDownList4_listbox"
                      aria-disabled="false" aria-busy="false"
                      aria-activedescendant="aa772929-a6df-4225-a7fa-d18e6975307a" style=""><span unselectable="on"
                        class="k-dropdown-wrap k-state-default"><span unselectable="on" class="k-input">알람
                          타입</span><span unselectable="on" class="k-select" aria-label="select"><span
                            class="k-icon k-i-arrow-60-down"></span></span></span>
                      <div id="dropDownList4" class="select_w4" data-role="dropdownlist" style="display: none;"></div>
                    </span>
                  </th>
                  <th class="tar">215,780 kWh</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                  <th>12,400</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="tal">2020</td>
                  <td class="tar">134,550 kWh</td>
                  <td>
                    <span class="highlighted-error">11,700</span>
                  </td>
                  <td>
                    <span class="highlighted-ing">11,700</span>
                  </td>
                  <td>11,700</td>
                  <td>11,700</td>
                  <td>11,700</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
              </tbody>

            </table>
          </div>
          <!-- e:grid-->

          <div class="chart_view">
            <!-- <img src="../../../assets/images/chart04.jpg" alt=""> -->
          </div>
        </section>
        <!-- e:  컨텐츠-->
        <!-- s: Site List Area -->
        <section class="site-list">

        </section>
        <!-- e: Site List Area -->
      </div>

    </div>
  </div>
</template>

<script>
import TabPage from "@/components/resolve/diff/DiffTab";
import SubMenu from "@/components/resolve/diff/DiffTabEnergy";
import YearPicker from "@/components/resolve/common/YearPicker";
import VueDropdown from "@/components/custom/VueDropdown";

export default {
    name : "EnergyGoalSetting",
    components : {
      TabPage,
      SubMenu,
      YearPicker,
      VueDropdown
    },
    props : [],
    data : function()
    {
        return {
          filter:{
            year: "2019"
          },
          energyGroupSelect: 'power',
          energyGroup: [
            {key: '전력량계', unit:'kWh', value:'power'},
            {key: '가스', unit:'m3', value:'gas'},
            {key: '수도', unit:'L', value:'water'}
          ],
          groupMain: [],
          groupMainList: [
            {
              value: '그룹A',
              key: 'g001'
            },
            {
              value: '그룹B',
              key: 'g002'
            },
            {
              value: '그룹C',
              key: 'g003'
            }
          ],
          groupSub: [],
          groupSubList: [
            {
              value: '서브그룹a',
              key: 'sub001'
            },
            {
              value: '서브그룹b',
              key: 'sub002'
            },
            {
              value: '서브그룹c',
              key: 'sub003'
            }
          ],

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