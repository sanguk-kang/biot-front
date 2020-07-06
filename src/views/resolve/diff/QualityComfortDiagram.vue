<template>
<div class="content">
  <TabPage></TabPage>
  <div class="side_wrap">
    <SubMenu></SubMenu>

    <div class="content_title_wrap">
      <DatePicker :isWithDTRange=false></DatePicker>
    </div>
    <!-- 
      사용 예시
      <div class="content_title_wrap">
        <DatePicker :isWithDTRange=false  :btnSelect.sync="{date/month/year/daterange 중 하나}" :elDate.sync="{yyyy-MM-dd 형식의 날짜}" ></DatePicker>
      </div>
    -->

    <div class="content_title_wrap filter_wrap">
      <el-select v-model="selectGroupByType" placeholder="선택">
        <el-option
          v-for="item in groupOrDeviceList"
          :key="item.key"
          :label="item.value"
          :value="item.key">
        </el-option>
      </el-select>

      <span class="ic-bar"></span>

      <el-select class="mr_10" v-model="selectGroup" placeholder="선택">
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

      <el-select v-model="selectDevice" placeholder="선택" :disabled="selectGroupByType==='group'"
        multiple
        collapse-tags>
        <el-option
          v-for="item in deviceList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>

      <span class="ic-bar"></span>

      <el-select v-model="selectDataType" placeholder="선택">
        <el-option
          v-for="item in dataTypeList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>

      <span class="ic-bar"></span>

      <button class="k-button btn_w1">조회</button>
      <button class="k-button btn_w1">내보내기</button>
    </div>

    <div class="site-list-wrap">
      <section class="cotent_view" style="width:100%">
        <!-- legend -->
        <section>
          <div>
            <ul class="legend_list table_top">
              <li><span class="ic_dot powerc"></span>쾌적(Comfortable)</li>
              <li><span class="ic_dot normal_on"></span>보통 (Normal)</li>
              <li><span class="ic_dot error"></span>불쾌적 (Uncomfortable)</li>
              <li><span class="ic_dot normal_off"></span>미제공 (None)</li>
            </ul>
          </div>
        </section>

        <!-- table -->
        <section>
          <div class="g-table">
            <table>
              <thead>
                  <tr>
                    <th rowspan="2"></th>
                    <th :colspan="columnList.length+1">쾌적도</th>
                  </tr>
                  <tr>
                      <th>평균<i class="ic_sort"></i></th>
                      <th v-for="col in columnList" v-bind:key="col">{{col}}<i class="ic_sort"></i></th>
                  </tr>
              </thead>
              <tbody v-if="qualityData.length > 0">
                  <tr>
                      <td>사이트 합계</td>
                      <td>125</td>
                      <td v-for="col in columnList" v-bind:key="col">18.2</td>
                  </tr>
                  <tr>
                      <td>사이트 그룹 평균</td>
                      <td>100.5</td>
                      <td v-for="col in columnList" v-bind:key="col">18.2</td>
                  </tr>
                  <tr v-for="item in qualityData" v-bind:key="item['name']">
                      <td>{{item['name']}}</td>
                      <td>{{item['total']}}</td>
                      <td v-for="(val, idx) in item['list']" v-bind:key="idx.toString()">{{val}}</td>
                  </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td :colspan="columnList.length+2" class="no-records-text" style="height: 300px;">리스트에 표시할 데이터가 존재하지 않습니다.</td>
                </tr>
              </tbody>
            </table>
                    
          </div>
        </section>
      </section>

      <section class="site-list"></section>
    </div>
  </div>

</div>
</template>

<script>
import TabPage from '@/components/resolve/diff/DiffTab'
import SubMenu from '@/components/resolve/diff/DiffTabQuality'
import DatePicker from '@/components/resolve/common/DatePicker'

export default {
  name: "QualityComfortDiagram",
  components: { TabPage, SubMenu, DatePicker },
  watch: {
    selectGroup() {
      this.getFindSubGroupList();
    }
  },
  data: function() {
    return {
        selectGroupByType: 'group',
        selectGroup: 'all',
        selectSubGroup: '',
        selectDevice: 'allDevice',
        selectDataType: 'comfort',

        // filter data
        groupOrDeviceList: [
        {
          value: '그룹별 보기',
          key: 'group'
        },
        {
          value: '기기별 보기',
          key: 'device'
        }
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
      deviceList: [
        {id: 'allDevice', name: '전체기기'},
        {id: 'allSensor', name: '전체 센서 타입'},
        {id: 'filtration', name: '실내기 센서'},
        {id: 'airPurifier', name: '공기청정기'},
        {id: 'airQualitySensor', name: '공기질 센서'}
      ],
      dataTypeList: [ 
        {id: 'comfort', name: '쾌적도 보기'},
        {id: 'hitting', name: '온열감 보기'},
      ],
      columnList: [],
      qualityData: [],
      periodType: 'YEAR',
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
      this.qualityData = [
        {
          'name': 'group name 1',
          'total': '08.32',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        },
        {
          'name': 'group name 2',
          'total': '12.00',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        },
        {
          'name': 'group name 3',
          'total': '05.35',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        },
        {
          'name': 'group name 4',
          'total': '00.00',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        },
        {
          'name': 'group name 5',
          'total': '06.36',
          'list': ['06:00', '00:00','06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00', '06:00', '00:00']
        }
      ];
    }
  },
  created() {
    this.generateColList();
    this.getFilterResult();
  }
};
</script>


<style lang="scss" scoped>
    .filter_wrap {
        display: flex;
        justify-content: start;
    }

    .mr_10 {
        margin-right: 10px;
    }

    .table_top {
        float: right;
        width: auto;
    }

    button {
      height: 40px;
      margin-right: 10px;
    }
</style>
