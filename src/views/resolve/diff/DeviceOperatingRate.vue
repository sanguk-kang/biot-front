<template>
  <div class="content">
    <TabPage></TabPage>
    <div class="side_wrap">
      <SubMenu></SubMenu>
      <div class="content_title_wrap">
        <DatePicker :isWithDTRange=false></DatePicker>
        <ul class="flex_left">
          <li>
            <span class="checkLabel" style="padding-right=5px">
              <input type="checkbox" class="k-checkbox" name="ched" id="ched3">
              <label class="k-checkbox-label single" for="ched3" style="margin-right:7px;"></label>
              가동률
            </span>
          </li>
          <li>
            <el-select v-model="selectSection" placeholder="선택">
              <el-option
                v-for="item in sectionRange"
                :key="item.key"
                :label="item.value"
                :value="item.key">
              </el-option>
            </el-select>
          </li>
          <li>
            <div>
              <input type="number" class="k-input sub_filter_input" placeholder="0" min="0" max="24">
              <em style="margin-left: -38px;">시간</em>
            </div>
          </li>
          <li style="padding-left: 10px">
            <div v-if="selectSection === 'range'">
              <input type="number" class="k-input sub_filter_input" placeholder="0" min="0" max="24">
              <em style="margin-left: -38px;">시간</em>
            </div>
            <span v-else-if="selectSection === 'moreThan'">이상</span>
            <span v-else>이하</span>
          </li>
        </ul>
      </div>

      <div class="site-list-wrap">
        <section classa="content_view" style="width: 100%;">
          <!-- 
          사용 예시
          <div class="content_title_wrap">
            <DatePicker :isWithDTRange=false  :btnSelect.sync="{date/month/year/daterange 중 하나}" :elDate.sync="{yyyy-MM-dd 형식의 날짜}" ></DatePicker>
          </div>
          -->

          <!-- filter -->
          <div>
            <input type="radio" class="k-radio type-radio" name="radio" v-model="checkedDeviceType" :value="DEVICE_TYPE.GROUP" id="radio1" checked=""> 
            <label class="k-radio-label" for="radio1" style="margin-right: 30px;">디바이스 그룹</label>
            <input type="radio" class="k-radio type-radio" name="radio" v-model="checkedDeviceType" :value="DEVICE_TYPE.TYPE" id="radio2">
            <label class="k-radio-label" for="radio2">디바이스 타입</label>
          </div>
          <div class="content_title_wrap filter_wrap">
            <el-select class="mr_10" v-model="selectGroup" placeholder="선택" :disabled="checkedDeviceType===DEVICE_TYPE.TYPE">
              <el-option value="all" label="전체그룹"></el-option>
              <el-option
                v-for="item in groupList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>

            <!-- TODO : 서브그룹 선택할 수 있는데 선택안하고 조회하는 경우 ??? -->
            <el-select class="mr_10" v-model="selectSubGroup" placeholder="서브그룹" :disabled="subGroupList.length===0">
              <el-option
                v-for="item in subGroupList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>

            <el-select v-model="selectDevice" placeholder="기기종류 선택" :disabled="checkedDeviceType===DEVICE_TYPE.GROUP">
              <el-option
                v-for="item in deviceTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>

            <span class="ic-bar"></span>
            <button class="k-button btn_w1">조회</button>

          </div>

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
                    <th rowspan="2">기기대수<i class="ic_sort"></i></th>
                    <th :colspan="columnList.length+1">가동률(%)</th>
                  </tr>
                  <tr>
                    <th>평균<i class="ic_sort"></i></th>
                    <th v-for="col in columnList" v-bind:key="col">{{col}}<i class="ic_sort"></i></th>
                  </tr>
                </thead>
                <tbody v-if="operatingRateData.length > 0">
                  <tr>
                    <td>사이트 합계</td>
                    <td>125</td>
                    <td>18.2</td>
                    <td v-for="col in columnList" v-bind:key="col">18.2</td>
                  </tr>
                  <tr>
                    <td>사이트 그룹 평균</td>
                    <td>100.5</td>
                    <td>18.2</td>
                    <td v-for="col in columnList" v-bind:key="col">18.2</td>
                  </tr>
                  <tr v-for="item in operatingRateData" v-bind:key="item['name']">
                    <td @click="viewDetailGraph(item['name'])">{{item['name']}}</td>
                    <td>10</td>
                    <td>{{item['count']}}</td>
                    <td v-for="(val, idx) in item['list']" v-bind:key="idx.toString()">{{val}}</td>
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

          <DetailGraphModal ref="DetailGraphModal" :groupName="selectPopupGroupName" :data="datacollection"
            :options="options"></DetailGraphModal>
        </section>

        <section class="site-list"></section>
      </div>
    </div>

  </div>
</template>

<script>
import TabPage from '@/components/resolve/diff/DiffTab'
import SubMenu from '@/components/resolve/diff/DiffTabDeviceOperating'
import DatePicker from '@/components/resolve/common/DatePicker'
import DetailGraphModal from '@/components/resolve/DetailGraphModal'
//import moment from 'moment'

export default {
  name: "DeviceOperatingRate",
  components: { TabPage, SubMenu, DatePicker, DetailGraphModal },
  watch: {
    periodType() {
      this.generateColList();
    },
    selectGroup() {
      this.getFindSubGroupList();
    },
    // checkedDeviceType() {
    //   console.log(this.checkedDeviceType);
    // }
  },
  data: function() {
    return {
        DEVICE_TYPE: {
          GROUP: 'group',
          TYPE: 'type'
        },
        checkedDeviceType: 'group', 
        selectSection: 'range',
        selectGroup: 'all',
        selectSubGroup: '',
        selectDevice: '',

        // filter data
        sectionRange: [
          {value: '구간', key: 'range'},
          {value: '>=', key: 'moreThan'},
          {value: '<=', key: 'lessThan'},
        ],
        groupList: [
          {
            name: '그룹 A',
            id: 'groupa',
            sub: [
              {name: '서브 그룹 1', id: 'subgroup1'},
              {name: '서브 그룹 2', id: 'subgroup2'},
              {name: '서브 그룹 3', id: 'subgroup3'}
            ]
          },
          {
            name: '그룹 B',
            id: 'groupb',
            sub: [
              {name: '서브 그룹 4', id: 'subgroup4'},
              {name: '서브 그룹 5', id: 'subgroup5'},
              {name: '서브 그룹 6', id: 'subgroup6'}
            ]
          },
          {
            name: '그룹 C',
            id: 'groupc',
            sub: []
          }  
        ],    
        subGroupList: [],  
        // TODO : get device list                                                          
        deviceTypeList: [
          {id: 'device1', name: 'device'},
          {id: 'device2', name: 'device A'},
          {id: 'device3', name: 'device B'},
          {id: 'device4', name: 'device C'},
          {id: 'device5', name: 'device D'}
        ],
        columnList: [],
        operatingRateData: [],
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
    getFindSubGroupList() {
      let _this = this;
      let findGroupList = this.groupList.filter(function(item){
        return (item.id === _this.selectGroup)
      });
      this.subGroupList = findGroupList[0].sub;
    },
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
      this.operatingRateData = [
        {
          'name': 'group name 1',
          'count': '125',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        },
        {
          'name': 'group name 2',
          'count': '100.5',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        },
        {
          'name': 'group name 3',
          'count': '35',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        },
        {
          'name': 'group name 4',
          'count': '15',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        },
        {
          'name': 'group name 5',
          'count': '5',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        }
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
.flex_left > li {
  align-self: center;
}

.filter_wrap {
  display: flex;
  justify-content: start;
}

.sub_filter_input {height: 40px;width: 90px;}

.mr_10 { margin-right: 10px;}

button {
  height: 40px;
  margin-right: 10px;
}

.legend {
  margin-right: 10px;
  display: flex;
  float: right;
}
.legend > li {
  width: 20px;
  height: 20px;
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