<template>
  <div class="content">
      <TabPage></TabPage>
      <div class="side_wrap">

          <SubMenu></SubMenu>

          <div class="content_title_wrap">
            <DatePicker :isWithDTRange=true :btnSelect.sync="filter.term" :elDate.sync="filter.date" 
            :elDateStart.sync="filter.dateStart" :elDateEnd.sync="filter.dateEnd"></DatePicker>
          </div>
          <!-- 
            사용 예시
            <div class="content_title_wrap">
              <DatePicker :isWithDTRange=false  :btnSelect.sync="{date/month/year/daterange 중 하나}" :elDate.sync="{yyyy-MM-dd 형식의 날짜}" ></DatePicker>
            </div>
          -->

          <div class="content_title_wrap">
            <ul class="flex_left">
              <li>
                <!-- 셀렉트 박스 시작 -->
                <el-select v-model="typeSelect" placeholder="Select">
                  <el-option
                      v-for="item in typeList"
                      :key="item.value"
                      :label="item.key"
                      :value="item.value">
                  </el-option>
                </el-select>
                <!-- 셀렉트 박스 끝 -->
              </li>
              <li><span class="ic-bar"></span></li>
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
                <div class="k-dropdown">
                  <!-- 드랍다운(체크박스) 시작 -->
                  <VueDropdown v-model="devices" :selectboxData='deviceList' :isCheckType="true" :allText="'전체 실외기'"></VueDropdown>
                  <!-- 드랍다운(체크박스) 끝 -->
                </div>
              </li>
              <li><span class="ic-bar"></span></li>
              <li><button class="k-button btn_w1">조회</button></li>
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
              <!-- s:grid-->
              <div class="g-table">
                <table>
                  <colgroup>
                    <col style="width:12%">
                    <col style="width:12%">
                    <col style="width:10%">
                    <col style="width:10%">
                    <col style="width:14%">
                    <col style="width:14%">
                    <col style="width:14%">
                    <col style="width:14%">
                  </colgroup>
                  <thead>
                    <tr>
                      <th rowspan="2">날짜<i class="ic_sort"></i></th>
                      <th rowspan="2">평균 실외 온도 (℃)<i class="ic_sort"></i></th>
                      <th colspan="2">평균 실내 온도 (℃)</th>
                      <th rowspan="2">평균 설정 온도 (℃)<i class="ic_sort"></i></th>
                      <th rowspan="2">운전율 (%)<i class="ic_sort"></i></th>
                      <th rowspan="2">사용 전력량 (kWh)<i class="ic_sort"></i></th>
                      <th rowspan="2">절감율 (%)<i class="ic_sort"></i></th>
                    </tr>
                    <tr>
                      <th>켜짐<i class="ic_sort"></i></th>
                      <th>꺼짐<i class="ic_sort"></i></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="total_area">
                      <td>합계</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>17.0</td>
                    </tr>
                    <tr>
                      <td>00:00 ~ 00:59</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>17.0</td>
                    </tr>
                    <tr>
                      <td>01:00 ~ 01:59</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>17.0</td>
                    </tr>
                    <tr>
                      <td>02:00 ~ 02:59</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>17.0</td>
                    </tr>
                    <tr>
                      <td>03:00 ~ 03:59</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>17.0</td>
                    </tr>
                    <tr>
                      <td>04:00 ~ 04:59</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>500.0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>17.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- e:grid-->
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
import DatePicker from '@/components/resolve/common/DatePicker';
import VueDropdown from "@/components/custom/VueDropdown";

export default {
    name : "EnergySavingHistory",
    components : {
      TabPage,
      SubMenu,
      DatePicker,
      VueDropdown
    },
    props : [],
    data : function()
    {
        return {
          filter: {
            term: 'date',
            date: '2020-05-28',
            dateStart: '2020-03-01',
            dateEnd: '2020-06-01'
          },
          typeSelect: 'default',
          typeList: [
            {key: '전체보기', value:'default'}
          ],
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
          devices: [],
          deviceList: [
            {key: '실외기A', value:'dv001'},
            {key: '실외기B', value:'dv002'},
            {key: '실외기C', value:'dv003'},
            {key: '실외기D', value:'dv004'},
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