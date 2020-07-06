<template>
    <div class="side_wrap">
        <div class="content_title_wrap no_title">
            <ul class="flex_left">
                <li>
                    <div id="el_calendar">
                        <el-date-picker ref="elStartDate" v-model="elStartDate" type="date"></el-date-picker>
                        <span> ~ </span>
                        <el-date-picker ref="elEndDate" v-model="elEndDate" type="date"></el-date-picker>
                    </div>
                </li>
                <li>
                    <button class="k-button btn_w1" v-on:click="search">조회</button>
                </li>
                <li><span class="ic-bar"></span></li>
                <li>
                    <button class="k-button btn_w1" v-on:click="toExcel">내보내기</button>
                </li>
            </ul>
            <ul class="right_area">
                <li><span class="selected_text">{{checkedCountText}}</span></li>
                <li><button class="k-button" v-bind:disabled="total == 0 || checked.length == 0" v-on:click="openDetailPop($event)">상세정보</button></li>
            </ul>
        </div>
        <!-- 본문 내용-->
        <div class="site-list-wrap">
            <!-- s: 컨텐츠 -->
            <section class="content_view">
                <div class="g-table">
                    <table>
                        <colgroup>
                            <col style="width:60px"><!-- chkbox -->
                            <col style="width:100px"><!-- 알람 타입 -->
                            <col style="width:150px"><!-- 발생 시간 -->
                            <col style="width:150px"><!-- 해결 시간 -->
                            <col style="width:130px"><!-- 디바이스 타입 -->
                            <col style="width:130px"><!-- 디바이스 이름 -->
                            <col style="width:auto"><!-- 디바이스 ID-->
                            <col style="width:130px"><!-- 그룹 이름-->
                            <col style="width:120px"><!-- 코드-->
                            <col style="width:120px"><!-- 상세 정보-->
                        </colgroup>

                        <thead>
                            <tr>
                                <th>
                                    <span class="checkLabel">
                                        <input type="checkbox" class="k-checkbox" name="ched" id="ched_all" v-model="checkAll">
                                        <label class="k-checkbox-label single" for="ched_all"></label>
                                    </span>
                                </th>
                                <th>알람 타입  <i class="ic_sort"></i></th>
                                <th>발생 시간  <i class="ic_sort up"></i></th>
                                <th>해결 시간 <i class="ic_sort"></i></th>
                                <th>디바이스 타입  <i class="ic_sort"></i></th>
                                <th>디바이스 이름 <i class="ic_sort"></i></th>
                                <th>디바이스 ID <i class="ic_sort"></i></th>
                                <th>그룹 이름 <i class="ic_sort"></i></th>
                                <th>코드</th>
                                <th>상세 정보</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="item in itemList" v-bind:key="'operation' + item.id">
                                <td>
                                    <span class="checkLabel">
                                        <input type="checkbox" class="k-checkbox" name="ched" v-bind:id="'operation' + item.id" v-bind:value="'operation' + item.id" v-model="checked" v-on:click="chkChange($event)">
                                        <label class="k-checkbox-label single" v-bind:for="'operation' + item.id"></label>
                                    </span>
                                </td>
                                <td>{{ item.serviceNumber }}</td>
                                <td>{{ item.eventTime }}</td>
                                <td>{{ item.resolutionTime }}</td>
                                <td>{{ item.deviceType }}</td>
                                <td>{{ item.deviceName }}</td>
                                <td>{{ item.deviceRealId }}</td>
                                <td>{{ item.subGroupName }}</td>
                                <td>{{ item.errorCode }}</td>
                                <td><span class="ic ic-info" v-on:click="openDetailPop($event, item.id)"></span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <!-- e: 컨텐츠 -->
        </div>
        <OperationDetailModal ref="operationDetailModal" v-bind:itemList="detailItemList"></OperationDetailModal>
    </div>    
</template>

<script>
import axios from "@/api/axios.js";
import moment from "moment";
import OperationDetailModal from "./popup/OperationDetailModal";
import { mapState } from 'vuex'
export default {
  name: "OperationErrorList",
  components: {
      OperationDetailModal,
  },
  watch: {},
  data: function() {
    return {
        elStartDate: new Date().setTime(new Date().getTime()),
        elEndDate: moment().format('YYYY-MM-DD'),
        itemList: null,
        detailItemList: null,
        /* selected variable */
        total: 0,
        checked: [],
        checkedCountText: '선택된 알람이 없습니다.',
    }
  },
computed: {
    ...mapState('app', ['testData']),
    checkAll: {
        get: function () {
            return this.itemList ? this.checked.length == this.itemList.length : false;
        },
        set: function (value) {
            var checked = [];
            if (value) { this.itemList.forEach(function (item) { checked.push('operation' + item.id); }); }

            this.checked = checked;
            this.total = (this.checked.length > 0) ? this.checked.length : 0;
            this.checkedCountText = (this.checked.length > 0) ? this.checked.length + '개의 알람이 선택 되었습니다.' :  '선택된 알람이 없습니다.';
        }
    }
},
methods: {
openAlert (title, msg) {
    this.$alert(msg, 'Title', {
        title: title, confirmButtonText: 'OK', dangerouslyUseHTMLString: true
    });
},
chkChange (event) {
    event.target.checked ? ++ this.total : -- this.total;
    this.checkedCountText = this.total > 0 ? this.total + '개의 알람이 선택 되었습니다.' : '선택된 알람이 없습니다.';
},
search () {
    let params = {};
    params.alarmServiceType = '9G001';
    params.siteId= '20301';
    params.startDate = moment(this.elStartDate).format('YYYY-MM-DD');
    params.endDate = moment(this.elEndDate).format('YYYY-MM-DD');
    axios.getApi('/alarms', params).then(response => {
        this.itemList = response.data;
    }).catch(function (error) {
        var errCode = error.response.status;
        if(errCode >= 400) {
            alert.openAlert("알람", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
        }
    });
},
openDetailPop (event, id) {
    let alert = this;
    var list = [];
    var params = {};
    if(event.target.tagName == 'BUTTON') {
        for(var i = 0; i < this.checked.length; i++) {
            params.ids = this.checked[i].toString().replace("operation", "");
            list.push(params);
            params = {};
        }
    } else {
        params.ids = id;
        list.push(params);
    }
    list.push({'alarmServiceType' : '9G001'});
    list.push({'siteId' : '20301'});
    params = '';
    var total = list.length;
    list.forEach(function(item, index) {
        params += Object.entries(item).map(e => e.join('='));
        total == index + 1 ? params : params += '&';
    });

    axios.getApi('/alarms/detail?' + params).then(response => {
        this.detailItemList = response.data;
        response.data.length == 0 ? alert.openAlert("알람", "상세 정보가 존재하지 않습니다.") : this.$refs.operationDetailModal.openModal();
    }).catch(function (error) {
        var errCode = error.response.status;
        if(errCode >= 400) {
            alert.openAlert("알람", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
        }
    });
},
toExcel () {

},
},
created() {
},
mounted() {
    this.search();
},
destroyed() {
}

};
</script>


<style lang="scss" scoped>

</style>