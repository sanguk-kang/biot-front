<template>
  <div id="main-contents">
      <div style="width: 100%; height: 100%; padding: 10px;">
        <ul class="flex_left" style="padding-bottom: 10px;">
            <li>
              <!-- sample - kendoDropDown-->
              <!-- <dropDown :dataId="dropDownId1" :dataList="dropDownList1" @setDropdown="getDropdown"></dropDown>
              <dropDown :dataId="dropDownId2" :dataList="dropDownList2" @setDropdown="getDropdown"></dropDown> -->
            </li>

            <li>
              <!-- sample - kendoDropDownCheckBox-->
              <!-- <dropDownChk :dataId="dropDownChkId1" :dataList="dropDownChkList1" @setDropdown="getDropdown"></dropDownChk>
              <dropDownChk :dataId="dropDownChkId2" :dataList="dropDownChkList2" @setDropdown="getDropdown"></dropDownChk> -->
            </li>

            <li>
              <!-- sample - kendoDropDownCheckBox-->
              <!-- <datePicker></datePicker> -->
            </li>
        </ul>

        <div>
          <!-- sample - kendoDetailDialog-->
          <!-- <detailDialog :dataId="detailDialogId" :dataSchema="detailSchema" :dataList="detailDialogList"></detailDialog> -->

          <!-- sample - kendoCommonDialog-->
          <!-- <commonDialog :dataId="commonDialogId" :dataMsg="commonDialogMsg"></commonDialog> -->

          <!-- sample - kendoPopupSingleWindow-->
          <!-- <singleWindowPop :dataId="singleWindowPopId" :dataList="singleWindowPopList"></singleWindowPop> -->
        </div>

        <!-- sample - kendoGrid-->
        <div>
          <!-- <grid :dataId="gridId" :dataColumns="gridColumns" :dataList="gridList"></grid> -->
        </div>
      </div>
  </div>
</template>

<script>
// import dropDown from "@/components/kendo/DropDown.vue";
// import dropDownChk from "@/components/kendo/DropDownChk.vue";
// import datePicker from "@/components/kendo/DatePicker.vue";
// import detailDialog from "@/components/kendo/DetailDialog.vue";
// import commonDialog from "@/components/kendo/CommonDialog.vue";
// import singleWindowPop from "@/components/kendo/SingleWindowPop.vue";
// import grid from "@/components/kendo/Grid.vue";

export default {
  name: "Sample",
  // components: { dropDown, dropDownChk, datePicker, detailDialog, commonDialog, singleWindowPop, grid },
  props: [],
  data: function() {
    return {
      gridId: "sample-grid",
      gridList: [
        {
          ProductID : 1,
          ProductName : "Chai",
          SupplierID : 1,
          CategoryID : 1,
          QuantityPerUnit : "10 boxes x 20 bags",
          UnitPrice : 18.0000,
          UnitsInStock : 39,
          UnitsOnOrder : 0,
          ReorderLevel : 10,
          Discontinued : false,
          Category : {
              CategoryID : 1,
              CategoryName : "Beverages",
              Description : "Soft drinks, coffees, teas, beers, and ales"
          }
        },
        {
          ProductID : 2,
          ProductName : "Chang",
          SupplierID : 1,
          CategoryID : 1,
          QuantityPerUnit : "24 - 12 oz bottles",
          UnitPrice : 19.0000,
          UnitsInStock : 17,
          UnitsOnOrder : 40,
          ReorderLevel : 25,
          Discontinued : false,
          Category : {
              CategoryID : 1,
              CategoryName : "Beverages",
              Description : "Soft drinks, coffees, teas, beers, and ales"
          }
        },
        {
          ProductID : 3,
          ProductName : "Aniseed Syrup",
          SupplierID : 1,
          CategoryID : 2,
          QuantityPerUnit : "12 - 550 ml bottles",
          UnitPrice : 10.0000,
          UnitsInStock : 13,
          UnitsOnOrder : 70,
          ReorderLevel : 25,
          Discontinued : false,
          Category : {
              CategoryID : 2,
              CategoryName : "Condiments",
              Description : "Sweet and savory sauces, relishes, spreads, and seasonings"
          }
        },
        {
          ProductID : 4,
          ProductName : "Chef Anton's Cajun Seasoning",
          SupplierID : 2,
          CategoryID : 2,
          QuantityPerUnit : "48 - 6 oz jars",
          UnitPrice : 22.0000,
          UnitsInStock : 53,
          UnitsOnOrder : 0,
          ReorderLevel : 0,
          Discontinued : false,
          Category : {
              CategoryID : 2,
              CategoryName : "Condiments",
              Description : "Sweet and savory sauces, relishes, spreads, and seasonings"
          }
        },
        {
          ProductID : 5,
          ProductName : "Chef Anton's Gumbo Mix",
          SupplierID : 2,
          CategoryID : 2,
          QuantityPerUnit : "36 boxes",
          UnitPrice : 21.3500,
          UnitsInStock : 0,
          UnitsOnOrder : 0,
          ReorderLevel : 0,
          Discontinued : true,
          Category : {
              CategoryID : 2,
              CategoryName : "Condiments",
              Description : "Sweet and savory sauces, relishes, spreads, and seasonings"
          }
        }
      ],
      gridColumns: [
          "ProductName",
          { field: "UnitPrice", title: "Unit Price", format: "{0:c}", width: "200px" },
          { field: "UnitsInStock", title: "Units In Stock", width: "200px" },
          { field: "Discontinued", width: "200px" }
      ],

      singleWindowPopId: "single-window-pop",
      singleWindowPopList: [{
            name: "밍밍2팝업",
            id: "MING",
            phone: "010-6394-7412",
            addr: "서울특별시 강남구 서초동 테스트"
      }],

      commonDialogId: "dialog-common",
      commonDialogMsg: "밍밍이가 뷰를한다 야호",

      detailDialogId: "dialog-detail",
      detailSchema: {
          id: "id",
          fields: {
              name: {
                  type: "text",
                  name: "이름"
              },
              id: {
                  type: "text",
                  name: "아이디"
              },
              phone: {
                  type: "text",
                  name: "연락처"
              },
              addr: {
                  type: "text",
                  name: "주소"
              }
          }
      },
      detailDialogList: [{
            name: "밍밍2",
            id: "MING",
            phone: "010-6394-7412",
            addr: "서울특별시 강남구 서초동 테스트"
      }],

      dropDownList1: [
        {
          text: "밍밍1",
          value: "miing1"
        },
        {
          text: "에러",
          value: "Critical"
        },
        {
          text: "경고",
          value: "Warning"
        }
      ],

      dropDownList2: [
        {
          text: "밍밍2",
          value: "ming2"
        },
        {
          text: "에러",
          value: "Critical"
        },
        {
          text: "경고",
          value: "Warning"
        }
      ],

      dropDownChkList1: [
        {
          text: "밍밍1",
          value: "miing1"
        },
        {
          text: "에러",
          value: "Critical"
        },
        {
          text: "경고",
          value: "Warning"
        }
      ],

      dropDownChkList2: [
        {
          text: "밍밍2",
          value: "ming2"
        },
        {
          text: "에러",
          value: "Critical"
        },
        {
          text: "경고",
          value: "Warning"
        }
      ],

      dropDownId1: "dropDownId1",
      dropDownId2: "dropDownId2",

      dropDownChkId1: "dropDownChkId1",
      dropDownChkId2: "dropDownChkId2",

      selectVal: "All Alarm Type"
    }
  },
  methods: {
    /**
     * selectbox 선택 결과 받는 함수
     *
     * @result id 화면 호출 id
     * @result param 선택한 object 결과
     */
    getDropdown(id, param) {
      console.log("parent data : ", id, param);
    }
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

</style>