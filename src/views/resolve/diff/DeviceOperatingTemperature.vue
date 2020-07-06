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
              <input v-model="tmperCheck" type="checkbox" class="k-checkbox" name="tmperCheck" id="tmperCheck" checked="">
              <label class="k-checkbox-label" for="tmperCheck">{{ (temperTypeList.find(n => n.value==temperType)).key }}</label>
            </div>
          </li>
          <li>
            <!-- 셀렉트 박스 시작 -->
            <el-select v-model="temperRange" placeholder="Select" :disabled="!tmperCheck">
              <el-option
                  v-for="item in temperRangeList"
                  :key="item.value"
                  :label="item.key"
                  :value="item.value">
              </el-option>
            </el-select>
            <!-- 셀렉트 박스 끝 -->
          </li>
          <li v-show="temperRange == 'range'">
            <div class="input_wrap input_w12 input_text" :class="{'disabled': !tmperCheck}">
              <input type="text" class="k-input" placeholder="0" maxlength="3" :disabled="!tmperCheck">
              <em>℃</em>
            </div>
          </li>
          <li v-show="temperRange == 'range'">
            <div class="input_wrap input_w12 input_text" :class="{'disabled': !tmperCheck}">
              <input type="text" class="k-input" placeholder="0" maxlength="3" :disabled="!tmperCheck">
              <em>℃</em>
            </div>
          </li>

          <li v-show="temperRange != 'range'">
            <div class="input_wrap input_w12 input_text" :class="{'disabled': !tmperCheck}">
              <input type="text" class="k-input" placeholder="0" maxlength="3" :disabled="!tmperCheck">
              <em>℃</em>
            </div>
            <label class="k-label"> {{ temperRange == "greater" ? "이상" : "이하" }} </label>
          </li>
          <li><button class="k-button btn_w1">조회</button></li>
        </ul>
        

        


      </div>

      <div class="content_title_wrap">
        <ul class="flex_left">
          <li>
            <!-- 셀렉트 박스 시작 -->
            <el-select v-model="type" placeholder="Select">
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
          <li v-show="type=='device'">
            <!-- 셀렉트 박스 시작 -->
            <el-select v-model="deviceMain" placeholder="Select">
              <el-option
                  v-for="item in deviceMainList"
                  :key="item.value"
                  :label="item.key"
                  :value="item.value">
              </el-option>
            </el-select>
            <!-- 셀렉트 박스 끝 -->
          </li>
          <li v-show="type=='device'">
            <!-- 셀렉트 박스 시작 -->
            <el-select v-model="deviceSub" placeholder="Select">
              <el-option
                  v-for="item in deviceSubList"
                  :key="item.value"
                  :label="item.key"
                  :value="item.value">
              </el-option>
            </el-select>
            <!-- 셀렉트 박스 끝 -->
          </li>
          <li v-show="type=='device'"><span class="ic-bar"></span></li>
          <li>
            <!-- 셀렉트 박스 시작 -->
            <el-select v-model="temperType" placeholder="Select">
              <el-option
                  v-for="item in temperTypeList"
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
        <section classa="content_view" style="width: 100%;">
          <!-- D:Site List Area 가 나올시 가변 width값 필요함-->

          <!-- legend -->
          <section>
            <ul class="legend mt10">
              <span style="margin-right:10px">Low</span>
              <li class="low_1"></li>
              <li class="low_2"></li>
              <li class="low_3"></li>
              <li class="low_4"></li>
              <li class="low_5"></li>
              <li class="high_1"></li>
              <li class="high_2"></li>
              <li class="high_3"></li>
              <li class="high_4"></li>
              <li class="high_5"></li>
              <span style="margin-left:10px">High</span>
            </ul>
          </section>

          <!-- table -->
          <section>
            <div class="g-table">
              <table>
                <thead>
                  <tr>
                    <th rowspan="2"></th>
                    <th :colspan="columnList.length+1">현재온도(C) or 설정온도(C) or 온도차</th>
                  </tr>
                  <tr>
                    <th>합계<i class="ic_sort"></i></th>
                    <th v-for="col in columnList" v-bind:key="col">{{col}}<i class="ic_sort"></i></th>
                  </tr>
                </thead>
                <tbody v-if="temperatureData.length > 0">
                  <tr>
                    <td>사이트 평균</td>
                    <td>18.2</td>
                    <td v-for="col in columnList" v-bind:key="col">18.2</td>
                  </tr>
                  <tr>
                    <td>사이트 그룹평균</td>
                    <td>18.2</td>
                    <td v-for="col in columnList" v-bind:key="col">18.2</td>
                  </tr>
                  <tr v-for="item in temperatureData" v-bind:key="item['name']">
                    <td @click="viewDetailGraph(item['name'])">{{item['name']}}</td>
                    <td>{{item['total']}}</td>
                    <td v-for="(val, idx) in item['list']" v-bind:key="idx.toString()">{{val}}</td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td :colspan="columnList.length+2" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지
                      않습니다.</td>
                  </tr>
                </tbody>
              </table>

            </div>
          </section>

          <DetailGraphModal ref="DetailGraphModal" :groupName="selectPopupGroupName" :data="datacollection"
            :options="options"></DetailGraphModal>
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
import DetailGraphModal from '@/components/resolve/DetailGraphModal';
import VueDropdown from "@/components/custom/VueDropdown";

export default {
  name: "DeviceOperatingTemperature",
  components: { TabPage, SubMenu, DatePicker, DetailGraphModal, VueDropdown },
  watch: {
    periodType() {
      this.generateColList();
    }
  },
  data: function() {
    return {
        filter: {
          term: 'date',
          date: '2020-05-28'
        },
        tmperCheck: false,
        temperRange: 'range',
        temperRangeList: [
          {key: '구간', value:'range'},
          {key: '>=', value:'greater'},
          {key: '<=', value:'smaller'}
        ],
        type: 'device',
        typeList: [
          {key: '기기별 보기', value:'device'},
          {key: '그룹별 보기', value:'group'}
        ],

        deviceMain: 'indoor',
        deviceMainList: [
          {key: '실내기', value:'indoor'},
          {key: '쇼케이스', value:'showcase'},
          {key: '냉동고', value:'freezer'}
        ],
        deviceSub: 'all',
        deviceSubList: [
          {key: '전체 실내기', value:'all'},
          {key: '기기A', value:'d001'},
          {key: '기기B', value:'d002'},
          {key: '기기C', value:'d003'}
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

        temperType: 'diffTemper',
        temperTypeList: [
          {key: '현재 온도', value:'currentTemper'},
          {key: '설정 온도', value:'settingTemper'},
          {key: '온도차', value:'diffTemper'}
        ],
        


        columnList: [],
        temperatureData: [],
        periodType: 'YEAR',
        searchPeriod: '',
        selectPopupGroupName: '',
        //TODO : 추후 api data 로 변경
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
    generateColList() {
        switch (this.periodType.toUpperCase()) {
            case 'DAY':
                for(let i=0; i<24; i++) {
                    if(i < 10){
                        this.columnList.push('0'+i+'시');
                    }else {
                        this.columnList.push(i+'시');
                    }
                }
                break;
            case 'MONTH':
                //let days = moment('2020-07', 'YYYY-MM').daysInMonth();
                for(let i=1; i<32; i++) {
                    this.columnList.push(i+'일');
                }
                break;
            case 'YEAR':
                for(let i=1; i<13; i++) {
                    this.columnList.push(i+'월');
                }
                break;
        }
    },
    getFilterResult() {
        this.temperatureData = [
            {
                'name': 'group name 1',
                'total': '28.32',
                'list': ['20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3']
            },
            {
                'name': 'group name 2',
                'total': '28.32',
                'list': ['20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3']
            },
            {
                'name': 'group name 3',
                'total': '28.32',
                'list': ['20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3']
            },
            {
                'name': 'group name 4',
                'total': '28.32',
                'list': ['20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3']
            },
            {
                'name': 'group name 5',
                'total': '28.32',
                'list': ['20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3', '20.3', '24.3', '20.3']
            },
        ];
    },
    viewDetailGraph(name) {
        this.selectPopupGroupName = name;
        this.$refs.DetailGraphModal.openModal();
    }
  },
  created() {
    this.generateColList();
    this.getFilterResult();
  }
};
</script>


<style lang="scss" scoped>
.legend {
  margin-right: 10px;
  display: flex;
  float: right;
}
.legend > li {
  width: 20px;
  height: 20px;
}

.temper-blank {
  min-width: 100px;
}

.temper-width-160 {
  min-width: 160px;
}

.low_1 { background-color: #ffcccc; }
.low_2 { background-color: #ffcc99; }
.low_3 { background-color: #ffcc33; }
.low_4 { background-color: #cc9966; }
.low_5 { background-color: #006699; }
.high_1 { background-color: #3399cc; }
.high_2 { background-color: #66ccff; }
.high_3 { background-color: #99ff00; }
.high_4 { background-color: #cc0033; }
.high_5 { background-color: #ff3366; }
</style>