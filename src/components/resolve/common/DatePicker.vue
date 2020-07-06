<template>
<!-- 
  사용 예시
  <div class="content_title_wrap">
    <DatePicker :isWithDTRange=false  
                :btnSelect.sync="{date/month/year/daterange 중 하나}" :elDate.sync="{yyyy-MM-dd 형식의 날짜}" ></DatePicker>
  </div>

  <div class="content_title_wrap">
    <DatePicker :isWithDTRange=true   :tableType.sync="{graph/list 중 하나}" 
                :btnSelect.sync="{date/month/year/daterange 중 하나}" :elDate.sync="{yyyy-MM-dd 형식의 날짜}" 
                :elDateStart.sync="{yyyy-MM-dd 형식의 기간 시작 날짜}" :elDateEnd.sync="{yyyy-MM-dd 형식의 기간 종료 날짜}"></DatePicker>
  </div>

  이슈 사항
    - 2020.07.03) el-date-picker 기능이 화면설계서와 가장 부합하지만 
      현재 Custom 되어 month/year 경우 이전/다음 버튼이 나오지 않음
      현재 날짜 이후 경고창 기능을 추가하여야 하는데 custom el-date-picker를 
      위 이슈로 인해 사용하지 않을 수 있어서 해당 기능을 추가할 수 없음
  
  TODO
    - 기간 선택(시작/종료 일자) 기능 추가
-->
  <div>
    <ul class="flex_left">
      <li>
        <ul class="btn_list">
          <li v-for="btn in btnList" :key=btn.id>
            <button class="k-button" v-if="isWithDTRange || btn.id !=='daterange'" :class="{'active': btnSelect == btn.id}" @click="clickBtn(btn.id)">{{btn.name}}</button>
          </li>
        </ul>
      </li>
      <li v-show="btnSelect !== 'daterange'">
        <div class="calendar-input" >
          <button class="ic ic-date-prev" @click="clickPre(btnSelect)">이전</button>
          <el-date-picker
                class="resolve-datepicker"
                v-model="dtPick"
                value-format="yyyy-MM-dd"
                :editable="false"
                :type="btnSelect"
          >
          </el-date-picker>
          <button class="ic ic-date-next" @click="clickNext(btnSelect)" :disabled="!isNextClickable">다음</button>
        </div>
      </li>

      <li v-if="isWithDTRange" v-show="btnSelect === 'daterange'">
        <div class="calendar-input rs-width-160" >
          <el-date-picker
                class="resolve-datepicker-range"
                v-model="dtPickStart"
                value-format="yyyy-MM-dd"
                type="date"
                :editable="false"
                :clearable="false"
          >
          </el-date-picker>
        </div>
      </li>
      <li v-if="isWithDTRange" v-show="btnSelect === 'daterange'">
        <div class="calendar-input rs-width-160" >
          <el-date-picker
                class="resolve-datepicker-range"
                v-model="dtPickEnd"
                value-format="yyyy-MM-dd"
                type="date"
                :editable="false"
                :clearable="false"
          >
          </el-date-picker>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "DatePicker",
  
  data() {
    return {
      dtPick: "2020-01-01",
      dtPickStart: "2020-01-01",
      dtPickEnd: "2020-01-01",
      btnList: [
        {
          id: 'date',
          name: '일'
        },
        {
          id: 'month',
          name: '월'
        },
        {
          id: 'year',
          name: '년'
        },
        {
          id: 'daterange',
          name: '기간'
        }
      ],
    }
  },
  props: {
    isWithDTRange: {
      type: Boolean,
      require: false,
      default: true
    },
    tableType: {
      type: String,
      required: false,
      default: 'list'  // 'graph' or 'list' 
    },
    btnSelect: {
      type: String,
      require: false,
      default: 'date'
    },
    elDate: {
      type: String,
      require: false,
      default: moment().format('YYYY-MM-DD')
    },
    elDateStart: {
      type: String,
      require: false,
      default: moment().format('YYYY-MM-DD')
    },
    elDateEnd: {
      type: String,
      require: false,
      default: moment().format('YYYY-MM-DD')
    },
  },
  methods: {
    clickBtn(btnId) {
      this.$emit('update:btnSelect', btnId);
    },
    clickPre(btnId) {
      let param = "d"
      if (btnId === "month")
        param = "M"
      else if (btnId === "year")
        param = "y"

      let dt = moment(this.dtPick);
      let dtPre = moment(dt).add(-1, param);
      this.dtPick = moment(dtPre).format("YYYY-MM-DD")

    },
    clickNext(btnId) {
      let param = "d"
      if (btnId === "month")
        param = "M"
      else if (btnId === "year")
        param = "y"

      let dt = moment(this.dtPick);
      let dtPre = moment(dt).add(+1, param);
      this.dtPick = moment(dtPre).format("YYYY-MM-DD")
    },
    
  },
  watch: {
    btnSelect(newVal) {
      if (newVal == "month") {
        let newDt = `${this.elDate.substring(0, 7)}-01`
        this.dtPick = newDt
      } else if (newVal == "year") {
        let newDt = `${this.elDate.substring(0, 4)}-01-01`
        this.dtPick = newDt
      }

      if (newVal == 'daterange') {
        this.dtPickEnd = this.dtPick;
        let dt = moment(this.dtPick);
        let dtPre3M = moment(dt).add(-3, 'M');
        this.dtPickStart = moment(dtPre3M).format("YYYY-MM-DD")
      }

      this.$emit('update:btnSelect', newVal);
    },
    dtPick(newVal) {
      if (this.dtLast < newVal) {
        let _this = this
        this.$alert('미래일자는 선택할 수 없습니다.', 'Title', {
          title: "알림",
          confirmButtonText: 'OK',
          dangerouslyUseHTMLString: true,
          callback: function() {
            newVal = _this.dtLast;
            _this.dtPick = newVal;
          }
        });
      } else {
        this.$emit('update:elDate', newVal);
      }
    },
    dtPickStart(newVal) {
      let diffM = 12
      let diffMStr = "1년"
      if (this.tableType == 'graph') {
        diffM = 6
        diffMStr = "6개월"
      }
      let diffDtStart = moment(moment(this.dtPickEnd)).add(-1 * diffM, 'M').format('YYYY-MM-DD');
      
      if (newVal > this.dtPickEnd) {
        this.dtPickStart = this.dtPickEnd;
      } else if (newVal < diffDtStart) {
        let _this = this
          this.$alert('조회기간은 ' + diffMStr + '을 넘을 수 없습니다.', 'Title', {
            title: "알림",
            confirmButtonText: 'OK',
            dangerouslyUseHTMLString: true,
            callback: function() {
              _this.dtPickStart = diffDtStart;
            }
          });
      } else {
        this.$emit('update:elDateStart', newVal);
      }
    },
    dtPickEnd(newVal) {
      let diffM = 12
      let diffMStr = "1년"
      if (this.tableType == 'graph') {
        diffM = 6
        diffMStr = "6개월"
      }
      let diffDtEnd = moment(moment(this.dtPickStart)).add(diffM, 'M').format('YYYY-MM-DD');

      if (newVal > this.dtLast) {
        this.dtPickEnd = newVal;
      } else if (newVal < this.dtPickStart) {
        this.dtPickEnd = newVal;
        this.dtPickStart = newVal;
      } else if (newVal > diffDtEnd) {
        let _this = this
        this.$alert('조회기간은 ' + diffMStr + '을 넘을 수 없습니다.', 'Title', {
          title: "알림",
          confirmButtonText: 'OK',
          dangerouslyUseHTMLString: true,
          callback: function() {
            let diffDtStart = moment(moment(newVal)).add(-1 * diffM, 'M').format('YYYY-MM-DD');
            _this.dtPickStart = diffDtStart;
            _this.dtPickEnd = newVal;
          }
        });
      } else {
        this.$emit('update:elDateEnd', newVal);
      }
    }
  },
  computed: {
    dtLast: {
      get() {
        let dtLast = moment().format("YYYY-MM-DD");
        if (this.btnSelect === "month")
          dtLast = dtLast.substring(0, 7) + "-01"
        else if (this.btnSelect === "year")
          dtLast = dtLast.substring(0, 4) + "-01-01"
        
        return dtLast
      }
    },
    isNextClickable: {
      get() {
        return this.dtPick < this.dtLast
      }
    }, 
  },
  created() {
    this.dtPick = this.elDate;
    this.dtPickStart = this.elDateStart;
    this.dtPickEnd = this.elDateEnd;
  },
  mounted() {
  },
  destroyed() {
  }
}
</script>

<style lang="scss">
.rs-width-160 {
  max-width: 160px;
}
.resolve-datepicker-range {
  width: 100%;
}
.resolve-datepicker > input, .resolve-datepicker-range > input {
  background-color: #fff !important;
  padding: 0 10px 0 10px;
  text-align: center;
  z-index: 999;
}

.resolve-datepicker-range > span.el-input__prefix {
  max-width: 36px;
  left: 150px;
}

.resolve-datepicker-range > span.el-input__suffix > span > i {
  display: none;
}

.resolve-datepicker > span, .resolve-datepicker-range > span {
  max-width: 5px;
}

.resolve-datepicker > span > i.el-icon-date, 
.resolve-datepicker > span > span > i.el-icon-circle-close{
  display: none;
}

</style>