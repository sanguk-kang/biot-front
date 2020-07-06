<template>
  <div class="content">
    <TabPage></TabPage>
    <div class="side_wrap">
      <SubMenu></SubMenu>
      <div class="content_title_wrap">
        <ul class="flex_left">
          <li>
            <DatePicker :isWithDTRange=false :btnSelect.sync="filter.term" :elDate.sync="filter.date"></DatePicker>
            <!-- 
            사용 예시
            <div class="content_title_wrap">
            <DatePicker :isWithDTRange=false  :btnSelect.sync="{date/month/year/daterange 중 하나}" :elDate.sync="{yyyy-MM-dd 형식의 날짜}" ></DatePicker>
            </div>
            -->
          </li>
          <li><div class="temper-blank"></div></li>


          <li>
            <div class="checkLabel">
              <input v-model="ineffectCheck" type="checkbox" class="k-checkbox" name="ineffectCheck" id="ineffectCheck" checked="">
              <label class="k-checkbox-label" for="ineffectCheck">비효율</label>
            </div>
          </li>
          <li>
            <!-- 셀렉트 박스 시작 -->
            <el-select v-model="ineffectRange" placeholder="Select" :disabled="!ineffectCheck">
              <el-option
                  v-for="item in ineffectRangeList"
                  :key="item.value"
                  :label="item.key"
                  :value="item.value">
              </el-option>
            </el-select>
            <!-- 셀렉트 박스 끝 -->
          </li>

          <li v-show="ineffectRange == 'range'">
            <div class="input_wrap input_w12 input_text" :class="{'disabled': !ineffectCheck}">
              <input type="text" class="k-input" placeholder="0" maxlength="3" :disabled="!ineffectCheck">
              <em>℃</em>
            </div>
          </li>
          <li v-show="ineffectRange == 'range'">
            <div class="input_wrap input_w12 input_text" :class="{'disabled': !ineffectCheck}">
              <input type="text" class="k-input" placeholder="0" maxlength="3" :disabled="!ineffectCheck">
              <em>℃</em>
            </div>
          </li>

          <li v-show="ineffectRange != 'range'">
            <div class="input_wrap input_w12 input_text" :class="{'disabled': !ineffectCheck}">
              <input type="text" class="k-input" placeholder="0" maxlength="3" :disabled="!ineffectCheck">
              <em>℃</em>
            </div>
            <label class="k-label"> {{ ineffectRange == "greater" ? "이상" : "이하" }} </label>
          </li>
          <li><button class="k-button btn_w1">조회</button></li>
        </ul>

        <ul class="right_area icon_type" style="margin-right:20px">
          <li @click="changeViewType('graph')"><button class="ic ic-view-graph"
              :class="{active: selectedViewType === 'graph'}">차트보기</button></li>
          <li @click="changeViewType('list')"><button class="ic ic-list"
              :class="{active: selectedViewType === 'list'}">목록보기</button></li>
        </ul>
      </div>
      
      <div class="content_title_wrap">
        <ul class="flex_left">
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
          <li><span class="ic-bar"></span></li>
          <li>
            <!-- 셀렉트 박스 시작 -->
            <el-select v-model="indoor" placeholder="Select">
              <el-option
                  v-for="item in indoorList"
                  :key="item.value"
                  :label="item.key"
                  :value="item.value">
              </el-option>
            </el-select>
            <!-- 셀렉트 박스 끝 -->
          </li>
        </ul>
      </div>

      <div class="site-list-wrap">
        <section v-if="selectedViewType==='list'" classa="content_view" style="width: 100%;">
          <!-- D:Site List Area 가 나올시 가변 width값 필요함-->
          <div class="g-table">
            <table>
              <thead>
                <tr>
                  <th rowspan="2">날짜<i class="ic_sort"></i></th>
                  <th colspan="2">비효율 운전 (EA)</th>
                  <th colspan="7">비효율 운전항목 (EA)</th>
                </tr>
                <tr>
                  <th>전체<i class="ic_sort"></i></th>
                  <th>사이트 그룹 평균 <i class="ic_sort"></i></th>
                  <th>단열불량<i class="ic_sort"></i></th>
                  <th>부하변동<i class="ic_sort"></i></th>
                  <th>실내 온도 이상<i class="ic_sort"></i></th>
                  <th>설정 온도 이상<i class="ic_sort"></i></th>
                  <th>시간초과<i class="ic_sort"></i></th>
                  <th>반복제어<i class="ic_sort"></i></th>
                  <th>끄기 잊음<i class="ic_sort"></i></th>
                </tr>
              </thead>
              <tbody v-if="data.length > 0">
                <tr class="total_area">
                  <td>합계</td>
                  <td>70</td>
                  <td>70</td>
                  <td>10</td>
                  <td>10</td>
                  <td>10</td>
                  <td>10</td>
                  <td>10</td>
                  <td>10</td>
                  <td>10</td>
                </tr>
                <tr v-for="(item, index) in data" v-bind:key="index">
                  <td>{{item['date']}}</td>
                  <td>{{item['total']}}</td>
                  <td>{{item['avg']}}</td>
                  <td>{{item['a']}}</td>
                  <td>{{item['b']}}</td>
                  <td>{{item['c']}}</td>
                  <td>{{item['d']}}</td>
                  <td>{{item['e']}}</td>
                  <td>{{item['f']}}</td>
                  <td>{{item['g']}}</td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td :colspan="columnList.length+3" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지
                    않습니다.</td>
                </tr>
              </tbody>

            </table>
          </div>
        </section>

        <section v-else classa="content_view" style="width: 100%;">
          <!-- chart -->
          <div id="chart_wrapper">
            <ResolveMixinsChart ref="ResolveMixinsChart"></ResolveMixinsChart>
          </div>
        </section>

        <section class="site-list"></section>
      </div>
    </div>
  </div>
</template>

<script>
import TabPage from '@/components/resolve/diff/DiffTab';
import SubMenu from '@/components/resolve/diff/DiffTabDeviceOperating';
import DatePicker from '@/components/resolve/common/DatePicker';
import ResolveMixinsChart from '@/components/resolve/ResolveMixinsChart';
import VueDropdown from "@/components/custom/VueDropdown";

export default {
  name: "DeviceOperatingInefficiency",
  components: { TabPage, SubMenu, DatePicker, ResolveMixinsChart, VueDropdown },
  watch: { },
  data: function() {
    return {
        filter: {
          term: 'date',
          date: '2020-05-28'
        },
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
        indoor: 'all',
        indoorList: [
          { key: '전체', value: 'all'},
          { key: '실내기A', value: 'd001'},
          { key: '실내기B', value: 'd002'},
          { key: '실내기C', value: 'd003'},
        ],

        ineffectCheck: false,
        ineffectRange: 'range',
        ineffectRangeList:[
          {key: '구간', value:'range'},
          {key: '>=', value:'greater'},
          {key: '<=', value:'smaller'}
        ],


        selectedViewType: 'graph',  // list or graph
        datacollection: {
          //Data to be represented on x-axis
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          datasets: [
            {
                type:'line',
              label: 'Data One',
              fill: false,
              borderColor: '#249EBF',
              //backgroundColor: '#f87979',
              //posssintBackgroundColor: 'white',
              //borderWidth: 1,
              //pointBorderColor: '#249EBF',
              //Data to be represented on y-axis
              data: [40, 20, 30, 50, 90, 10, 20, 40, 50, 70, 90, 100],
              order: 1
            },
            {
                type:'bar',
              label: 'Data two',
              backgroundColor: '#f87979',
              //pointBackgroundColor: 'white',
              //borderWidth: 1,
              //pointBorderColor: '#249EBF',
              //Data to be represented on y-axis
              data: [40, 20, 30, 50, 90, 10, 20, 40, 50, 70, 90, 100],
              order: 2
            }
          ]
        },
        //Chart.js options that controls the appearance of the chart
        options: {
            scales: {
                yAxes: [{
                ticks: {
                    beginAtZero: true
                },
                gridLines: {
                    display: false
                }
                }],
                xAxes: [ {
                gridLines: {
                    display: false
                }
                }]
            },
            legend: {
                display: true
            },
            responsive: true,
            maintainAspectRatio: false
        }
    }
  },
  methods: {
    changeViewType(type) {
        this.selectedViewType = type;

        let _this = this;
        setTimeout(function() {
            //console.log(document.getElementById('chart_wrapper').offsetHeight);
            _this.$refs.ResolveMixinsChart.renderStart(_this.datacollection, _this.options);
        }, 10);
    },
    getFilterResult() {
        this.data = [
            {
            'date': '2020-05-01',
            'total': '7', 'avg': '7',
            'a': '1', 'b': '1', 'c': '1', 'd': '1', 'e': '1', 'f': '1', 'g': '1'
            },
            {
            'date': '2020-05-02',
            'total': '7', 'avg': '7',
            'a': '1', 'b': '1', 'c': '1', 'd': '1', 'e': '1', 'f': '1', 'g': '1'
            },
            {
            'date': '2020-05-03',
            'total': '7', 'avg': '7',
            'a': '1', 'b': '1', 'c': '1', 'd': '1', 'e': '1', 'f': '1', 'g': '1'
            },
            {
            'date': '2020-05-04',
            'total': '7', 'avg': '7',
            'a': '1', 'b': '1', 'c': '1', 'd': '1', 'e': '1', 'f': '1', 'g': '1'
            },
            {
            'date': '2020-05-05',
            'total': '7', 'avg': '7',
            'a': '1', 'b': '1', 'c': '1', 'd': '1', 'e': '1', 'f': '1', 'g': '1'
            },
            
        ];
    },
  },
  created() {
    this.getFilterResult();
  },
  mounted() {
      if(this.selectedViewType === 'graph'){
          let _this = this;
          setTimeout(function() {
              //console.log(document.getElementById('chart_wrapper').offsetHeight);
              _this.$refs.ResolveMixinsChart.renderStart(_this.datacollection, _this.options);
          }, 10);
      }
  }
};
</script>


<style lang="scss" scoped>
.temper-blank {
  min-width: 100px;
}
</style>