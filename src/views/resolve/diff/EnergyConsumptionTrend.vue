<template>
<div class="content">
<TabPage></TabPage>

<div class="side_wrap">
  <SubMenu></SubMenu>
  <div class="content_title_wrap">
    <DatePicker :isWithDTRange=false :btnSelect.sync="filter.term" :elDate.sync="filter.date"></DatePicker>
  </div>

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
        <!-- 셀렉트 박스 시작 -->
        <el-select v-model="categorySelect" placeholder="Select">
          <el-option
              v-for="item in categoryList"
              :key="item.value"
              :label="item.key"
              :value="item.value">
          </el-option>
        </el-select>
        <!-- 셀렉트 박스 끝 -->
      </li>
      <li><span class="ic-bar"></span></li>
      <li><button class="k-button btn_w1">내보내기</button></li>
    </ul>
    <ul class="right_area">
      <li v-if="consumptionData.groupCount > 0"><span class="selected_text">{{consumptionData.groupCount + " 개의 " + (energyGroup.find(n => n.value==energyGroupSelect)).key + "가 선택되었습니다."}}</span></li>
      <li v-else><span class="selected_text">{{"선택된 " + (energyGroup.find(n => n.value==energyGroupSelect)).key + "가 없습니다."}}</span></li>
    </ul>
  </div>
  
  <div class="site-list-wrap">
    
    <section classa="content_view" style="width: 100%;">
      <!-- legend -->
      <div class="content_title_wrap bob_line">
        <ul class="right_area">
            <li><!-- 운전시간-->
            <div class="color_leg">
              <span class="color_text">Low</span>
              <span class="color_drive_lv1"></span>
              <span class="color_drive_lv2"></span>
              <span class="color_drive_lv3"></span>
              <span class="color_drive_lv4"></span>
              <span class="color_drive_lv5"></span>
              <span class="color_drive_lv6"></span>
              <span class="color_drive_lv7"></span>
              <span class="color_drive_lv8"></span>
              <span class="color_drive_lv9"></span>
              <span class="color_drive_lv10"></span>
              <span class="color_text">High</span>
            </div>
          </li>
          </ul>
      </div>

      <!-- table -->
      <section>
        <div class="g-table">
          <table>
            <colgroup>
                <col style="width:10%">
                
              </colgroup>
            <thead>
                <tr>
                    <th rowspan="2"></th>
                    <th rowspan="2">목표 소비량 (kWh)<i class="ic_sort"></i></th>
                    <th :colspan="columnList.length+1">에너지 소비량 > SAC / 조명 / 기타(kWh)</th> 
                </tr>
                <tr>
                    <th>합계<i class="ic_sort"></i></th>
                    <th v-for="col in columnList" v-bind:key="col">{{col}}<i class="ic_sort"></i></th>
                </tr>
            </thead>
            <tbody v-if="consumptionData.groupCount > 0">
                <tr>
                    <td>사이트 합계</td>
                    <td>{{consumptionData.groupConsumTotalGoal}}</td>
                    <td>{{consumptionData.groupConsumTotal}}</td>
                    <td v-for="(col, idx) in consumptionData.groupConsumTotalDetails" v-bind:key="idx">{{col}}</td> 
                </tr>
                <tr>
                    <td>사이트 그룹 평균</td>
                    <td>{{consumptionData.groupConsumAvgGoal}}</td>
                    <td>{{consumptionData.groupConsumAvg}}</td>
                    <td v-for="(col, idx) in consumptionData.groupConsumAvgDetails" v-bind:key="idx">{{col}}</td>
                </tr>
                <tr v-for="item in consumptionData.groupList" v-bind:key="item['groupName']">
                    <td @click="viewDetailGraph(item['groupName'])">{{item['groupName']}}</td>
                    <td>{{item['groupGoal']}}</td>
                    <td>{{item['groupTotal']}}</td>
                    <td v-for="val in item['groupDetails']" v-bind:key="val.section" :class="'color_drive_lv' + val.level">{{val.value}}</td>
                </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td :colspan="columnList.length+3" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지 않습니다.</td>
              </tr>
            </tbody>
          </table>
                  
        </div>
      </section>

      <DetailGraphModal ref="DetailGraphModal" :groupName="selectPopupGroupName" :data="datacollection" :options="options"></DetailGraphModal>
    </section>

    <section class="site-list"></section>
  </div>
</div>
</div>
</template>

<script>
import TabPage from '@/components/resolve/diff/DiffTab'
import SubMenu from "@/components/resolve/diff/DiffTabEnergy";
import DatePicker from '@/components/resolve/common/DatePicker';
import DetailGraphModal from '@/components/resolve/DetailGraphModal';
import VueDropdown from "@/components/custom/VueDropdown";

export default {
    name : "EnergyConsumptionTrend",
    components : {
      TabPage,
      SubMenu,
      DatePicker,
      DetailGraphModal,
      VueDropdown
    },
    props : [],
    data : function() {
        return {
          filter: {
            term: 'date',
            date: '2020-05-28'
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
          categorySelect: 'default',
          categoryList: [
            {key: '전체', value:'default'},
            {key: 'SAC', value:'gas'},
            {key: '조명', value:'light'},
            {key: '기타', value:'etc'}
          ],

          columnList: [],
          consumptionData: [],
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
          switch (this.filter.term) {
            case 'date':
              for(let i=0; i<24; i++) {
                if(i < 10){
                  this.columnList.push('0'+i+'시');
                } else {
                  this.columnList.push(i+'시');
                }
              }
              break;
            case 'month':
              for(let i=1; i<32; i++) {
                this.columnList.push(i+'일');
              }
              break;
            case 'year':
              for(let i=1; i<13; i++) {
                this.columnList.push(i+'월');
              }
              break;
          }
        },
        getFilterResult() {
          /* result = {
           *   filterTerm: 'date'
           *   groupCount: 10
           *   groupConsumTotal: 500.0
           *   groupConsumTotalGoal: 500.0
           *   groupConsumTotalDetails: [...]
           *   groupConsumAvg: 50.0
           *   groupConsumAvgGoal: 50.0
           *   groupConsumAvgDetails: [...]
           *   groupList: [
           *     {
           *       groupName: 'G001',
           *       groupGoal: 100.0,
           *       groupTotal: 70.0,
           *       groupDetails: [
           *         {section: 1, value: 21.0, level:3},
           *         {section: 2, value: 21.0, level:3},
           *         ...
           *       ]
           *     },
           *     ...
           *   ]
           * }
           */
          
          let tempResult = {}
          tempResult['filterTerm'] = this.filter.term;
          tempResult['groupCount'] = Math.floor(Math.random() * 7);
          tempResult['groupConsumTotal'] = 0.0;
          tempResult['groupConsumTotalGoal'] = 0.0;
          tempResult['groupConsumTotalDetails'] = []
          tempResult['groupConsumAvg'] = 0.0;
          tempResult['groupConsumAvgGoal'] = 0.0;
          tempResult['groupConsumAvgDetails'] = []
          if (this.filter.term === 'date') {
            for(let i=0; i<24; i++) {tempResult['groupConsumTotalDetails'].push(0.0); tempResult['groupConsumAvgDetails'].push(0.0)}
          } else if (this.filter.term === 'month') {
            for(let i=0; i<31; i++) {tempResult['groupConsumTotalDetails'].push(0.0); tempResult['groupConsumAvgDetails'].push(0.0)}
          } else if (this.filter.term === 'year') {
            for(let i=0; i<12; i++) {tempResult['groupConsumTotalDetails'].push(0.0); tempResult['groupConsumAvgDetails'].push(0.0)}
          }
          tempResult['groupList'] = []
          for(let r=0; r<tempResult['groupCount']; r++) {
            let tempData = {};
            tempData['groupName'] = 'group name ' + (r + 1);
            tempData['groupGoal'] = (Math.floor(Math.random() * 3) + 7) *  10.0;
            tempData['groupTotal'] = 0.0;
            tempData['groupDetails'] = []
            if (this.filter.term === 'date') {
              for(let i=0; i<24; i++) {
                  let tempDataDetail = {};
                  tempDataDetail['section'] = i
                  tempDataDetail['value'] = Math.floor(Math.random() * 10) * 7.0
                  tempDataDetail['level'] = Math.floor(Math.random() * 10) + 1

                  tempData['groupTotal'] += tempDataDetail['value']
                  tempResult['groupConsumTotal'] += tempDataDetail['value']
                  tempResult['groupConsumTotalDetails'][i] += tempDataDetail['value']
                  tempData['groupDetails'].push(tempDataDetail)
                }
            } else if (this.filter.term === 'month') {
              for(let i=0; i<31; i++) {
                  let tempDataDetail = {};
                  tempDataDetail['section'] = i
                  tempDataDetail['value'] = Math.floor(Math.random() * 10) * 4.0
                  tempDataDetail['level'] = Math.floor(Math.random() * 10)

                  tempData['groupTotal'] += tempDataDetail['value']
                  tempData['groupConsumTotal'] += tempDataDetail['value']
                  tempResult['groupConsumTotalDetails'][i] += tempDataDetail['value']
                  tempData['groupDetails'].push(tempDataDetail)
                }
            } else if (this.filter.term === 'year') {
              for(let i=0; i<12; i++) {
                  let tempDataDetail = {};
                  tempDataDetail['section'] = i
                  tempDataDetail['value'] = Math.floor(Math.random() * 10) * 11.0
                  tempDataDetail['level'] = Math.floor(Math.random() * 10)

                  tempData['groupTotal'] += tempDataDetail['value']
                  tempData['groupConsumTotal'] += tempDataDetail['value']
                  tempResult['groupConsumTotalDetails'][i] += tempDataDetail['value']
                  tempData['groupDetails'].push(tempDataDetail)
                }
            }

            tempResult['groupList'].push(tempData);
          }

          
          this.consumptionData = tempResult;
        },
        viewDetailGraph(name) {
          this.selectPopupGroupName = name;
          this.$refs.DetailGraphModal.openModal();
        }                         
      
    },
    watch: {
      'filter.term': function() {
        this.columnList = [];
        this.consumptionData = [];
        this.generateColList();
        this.getFilterResult();
      }
    },
    created() {
      this.generateColList();
      this.getFilterResult();
    },
    mounted() {
    },
    destroyed() {
    }
}

</script>

<style lang="scss" scope>
.eg-colorbar {
  display: flex; float: right;
}
.eg-table-colname {
  width:180px
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