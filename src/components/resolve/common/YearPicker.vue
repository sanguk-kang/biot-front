<template>
<!-- 
  사용 예시
  <div class="content_title_wrap">
    <DatePicker :isWithDTRange=false  :btnSelect.sync="{date/month/year/daterange 중 하나}" :elDate.sync="{yyyy-MM-dd 형식의 날짜}" ></DatePicker>
  </div>

  <div class="content_title_wrap">
    <DatePicker :isWithDTRange=true  :btnSelect.sync="{date/month/year/daterange 중 하나}" :elDate.sync="{yyyy-MM-dd 형식의 날짜}" 
                :elDateStart.sync="{yyyy-MM-dd 형식의 기간 시작 날짜}" :elDateEnd.sync="{yyyy-MM-dd 형식의 기간 종료 날짜}"></DatePicker>
  </div>

  이슈 사항
    - 2020.07.03) el-date-picker 기능이 화면설계서와 가장 부합하지만 
      현재 Custom 되어 month/year 경우 이전/다음 버튼이 나오지 않음
      현재 날짜 이후 경고창 기능을 추가하여야 하는데 custom el-date-picker를 
      위 이슈로 인해 사용하지 않을 수 있어서 해당 기능을 추가할 수 없음
  
  TODO
    - 현재 일자 이후 선택 불가능 기능 추가
    - 기간 선택(시작/종료 일자) 기능 추가
-->
  <div>
    <div class="calendar-input" >
      <button class="ic ic-date-prev" @click="clickPre()">이전</button>
      <el-date-picker
            class="resolve-datepicker"
            v-model="dtPick"
            value-format="yyyy"
            type="year"
      >
      </el-date-picker>
      <button class="ic ic-date-next" @click="clickNext()">다음</button>
    </div>
  </div>
</template>



<script>
import moment from "moment";

export default {
  name: "DatePicker",
  
  data() {
    return {
      dtPick: "2020",

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
    elYear: {
      type: String,
      require: false,
      default: moment().format('YYYY')
    },
  },
  methods: {
    
    clickPre() {
      let param = "y"
      let dt = moment(this.elYear + "-01-01");
      let dtPre = moment(dt).add(-1, param);
      this.dtPick = moment(dtPre).format("YYYY")
    },
    clickNext() {
      let param = "y"
      let dt = moment(this.elYear + "-01-01");
      let dtPre = moment(dt).add(+1, param);
      this.dtPick = moment(dtPre).format("YYYY")
    }
  },
  watch: {
    dtPick(newVal) {
      this.$emit('update:elYear', newVal);
    },

  },
  created() {
    this.dtPick = this.elYear;

  },
  mounted() {
  },
  destroyed() {
  }
}
</script>

<style lang="scss">
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