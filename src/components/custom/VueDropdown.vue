<template>
  <div class="selectbox">
    <div class="opt_more" tabindex="0" :class="{'_open': isOpen}" @blur="outFocus">
      <strong class="screen_out">검색 선택상자</strong>
      <div type="button" class="btn_select" @click="openSelect">{{selectedText}}<span class="screen_out">선택됨</span></div>
      <div class="box_opt_menu">
        <div class="menu_item" v-for="(item, id) in dataList" :key="'select' + id">
          <label class="link_menu _check" v-if="item.checked"><!-- 체크된 경우만 사용됩니다._check -->
            <input type="checkbox" @change="chkChange($event, item)"  @blur="outFocus"  :value="item.key" :checked="item.checked"><span>{{item.value}}</span>
          </label>
          <label class="link_menu" v-else><!-- 체크가 아닌경우 -->
            <input type="checkbox" @change="chkChange($event, item)"  @blur="outFocus"  :value="item.key" :checked="item.checked"><span>{{item.value}}</span>
          </label>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import stringUtils from "@/utils/stringUtils.js";

export default {
    name: "VueDropdown",
    components: {},
    /**
     * selectboxData: Data object
     * allText : 전체 문구
     */
    props: [ 'isCheckType', 'selectboxData', 'allText' ],
    data: function() {
      return {
              isOpen: false,
              selectedText: '',
              dataList: [],
              allTextName: ''
          }
    },
    watch: {
      selectboxData() {
        this.init();
      }
    },
    methods: {
        outFocus () {
          // div 내부 포커스가 아닌 경우 닫기
          if (stringUtils.isEmpty(event.relatedTarget) || event.relatedTarget.className == "opt_more") {
            this.isOpen = false;
          }
        },
        // parent page v-model 데이터 전달
        emitData(item) {
            this.$emit('input', item);
            this.$emit('change', item);
        },
        openSelect() {
            this.isOpen = !this.isOpen;
        },
        selClick: function(e, item) {
            this.selectedText = stringUtils.isEmpty(item.key) ? this.allTextName : item.value;
            this.isOpen = false;
            // emit Data
            this.emitData(item);
            return item.key;
        },
        chkChange(e, item) {
            var resultArry = [];
            // 전체 또는 개별 선택 적용(checked 속성)
            if (item.key === "" || item.key === null) {
                this.dataList.forEach(function (list) {
                    list.checked = e.target.checked;
                });
            } else {
                var chkIndex = this.dataList.findIndex(x => x.key === item.key);
                this.dataList[chkIndex].checked = e.target.checked;
            }

            // 선택된 아이템을 배열에 push 및 카운팅
            var selectedArr = [];
            var selectedCount = 0;
            this.dataList.forEach(function (list) {
                if(list.checked) {
                    if (list.key != "") { // 전체 제거
                      resultArry.push({"key": list.key, "value": list.value, ...list});  //key, value 이외 속성 키값들도 사용 emitData
                    }
                    selectedArr.push(list.value);
                    selectedCount ++;
                }
            });

            // 선택된 배열 및 카운팅을 전체와 비교하여 속성 수정
            var totalCount = this.dataList.length;
            // 선택한 갯수가 전체 갯수와 같을 때 or ( '전체'를 제외한 나머지 아이템을 클릭했을 때)
            if(totalCount == selectedCount || (totalCount - 1 == selectedCount && this.dataList[0].checked == false)) {
                this.dataList[0].checked = true;

                selectedArr = [this.allTextName];
                selectedCount = totalCount - 1;
            } else {
                this.dataList[0].checked = false;

                var index = selectedArr.indexOf(this.allTextName);
                if (index !== -1)  {
                    selectedArr.splice(index, 1);
                    selectedCount -- ;
                }
            }

            // 실제 selectbox button에 적용
            if (selectedCount <= 0) {
              // dataList
              this.selectedText = "선택 없음";
            } else if(selectedCount == 1){
              this.selectedText = selectedArr[0];
            } else {
              this.selectedText = selectedCount + "개 선택";
            }
            // this.selectedText = selectedArr.join(",") + "  [ " + selectedCount + " ] is selected.";

            // emit Data
            this.emitData(resultArry);
        },
        addAllValue() {
            // default name
            this.allTextName = stringUtils.isEmpty(this.allText) ? "전체" : this.allText;
            // 전체 값 추가
            this.dataList.unshift({key: "", value: this.allTextName});

            // 전체 checked
            this.dataList.forEach(element => {
              element.checked = true;
            });
        },
        init() {
            if (this.selectboxData.length  > 0) {
              // data clone
              this.dataList = JSON.parse(JSON.stringify(this.selectboxData));
              
              this.addAllValue();

              // default text
              this.selectedText = this.dataList[0].value;
              this.dataList[0].checked = true;
            }
        }
    },
    created() {
        this.init();
    },
    mounted() {
    },
    destroyed() {
    }
}
</script>
