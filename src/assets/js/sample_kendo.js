// 기본세팅 - config.js
(function(window, $) {
    $.i18n.properties({
        name: 'alarm', //테스툥으로 세팅
        path: '/front/config/locale-dev/',
        mode: 'both',
        language: 'ko',
        async: true,
        callback: function() {}
    });

    window.I18N = $.i18n;

    window.GlobalSettings = (function() {
        var settings;

        var getPageSize = function() {};

        return {
            getPageSize: getPageSize
        };

    }());

})(window, jQuery);

$(document).ready(function() {
    var targetNumericBox = $("#numericBox");


    var targetDownList1 = $("#dropDownList1");
    var targetDownList2 = $("#dropDownList2");
    var targetDownList3 = $("#dropDownList3");
    var targetDownList4 = $("#dropDownList4");
    var targetDownList5 = $("#dropDownList5");
    var targetDownList6 = $("#dropDownList6");
    var targetDownList7 = $("#dropDownList7");
    var targetDownList8 = $("#dropDownList8");
    var targetDownList9 = $("#dropDownList9");
    var targetDownList10 = $("#dropDownList10");
    var targetDownList11 = $("#dropDownList11");
    var targetDownList12 = $("#dropDownList12");
    var targetDownList13 = $("#dropDownList13");
    var targetDownList14 = $("#dropDownList14");
    var targetDownList15 = $("#dropDownList15");
    var targetDownList16 = $("#dropDownList16");
    var targetDropDownData = [];

    var nowDate = new Date();
    var selectedStartDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, nowDate.getDate(), 0, 0, 0); // 시작일자
    var selectedEndDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 23, 59, 59); // 종료일자
    var startDatePicker = $("#startDatePicker");
    var endDatePicker = $("#endDatePicker");

    var elemPopupDialog = $("#popup-confirm"),
        popupDialog;
    var elemPopupDetail = $('#popup-detail'),
        popupDetail;
    var targetPopupDetailData = [];

    // 초기화
    var init = function() {

        // NumericBox
        targetNumericBox.kendoCustomNumericBox({
            unit: "ms",
            placeholder: "100",
            format: "#",
            enable: true,
            blockKeyEvent: false,
            min: 100,
            max: 60000,
            showValueWhenDisabled: true
        });


        // DropDownList
        targetDownList1.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList2.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            enable: false,
            change: function() {}
        });

        // DropDownList check
        targetDownList3.kendoDropDownCheckBox({
            invisible: false,
            disabled: false, //비활성화 여부
            dataTextField: "text", //반영되지 않는 옵션의 경우 device-base.html 템플릿 수정 필요
            dataValueField: "value",
            selectAllText: "전체",
            animation: false,
            autoBind: true,
            showSelectAll: true,
            emptyText: "전체",
            dataSource: []
        });

        targetDownList4.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });

        targetDownList5.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList6.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList7.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList8.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList9.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList10.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList11.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList12.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList13.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList14.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList15.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });
        targetDownList16.kendoDropDownList({
            dataSource: [],
            dataTextField: "text",
            dataValueField: "value",
            change: function() {}
        });

        // kendoCommonDatePicker
        startDatePicker.kendoCommonDatePicker({
            value: selectedStartDate,
            isStart: true,
            change: function() {}
        });
        endDatePicker.kendoCommonDatePicker({
            value: selectedEndDate,
            isEnd: true,
            change: function() {}
        });

        // PopupDialog
        popupDialog = elemPopupDialog.kendoCommonDialog({
            type: 'confirm',
            height: 252,
            title: "PopupDialog",
            typeActions: {
                confirm: [{
                    text: "NO",
                    action: function(e) {
                        e.sender.close();
                    }
                }, {
                    text: "YES",
                    action: function(e) {
                        e.sender.close();
                    }
                }]
            }
        }).data('kendoCommonDialog');

        // PopupDialog
        popupDetail = elemPopupDetail.kendoDetailDialog({
            title: "PopupDialog", //다이얼로그 제목
            dataSource: [{
                name: "테스트",
                id: "TEST",
                phone: "010-0000-0000",
                addr: "서울특별시 강남구 서초동 테스트"
            }], //상세 팝업에 렌더링 할 데이터
            hasDelete: false, //삭제 버튼을 생성하지 않는다. 현재 상세 팝업은 Default로 조회모드에서 : 편집/삭제/닫기, 편집모드에서 : 저장/취소 버튼이 생성된다.
            height: 400, //다이얼로그 높이
            width: 500,
            scheme: { //데이터의 모델 정의
                id: "id", //REST API에서 Model의 ID의 Key 값은 모두 "id" 이다.
                fields: { //각 필드 별 정의
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
            isCustomActions: true,
            actions: [{
                text: "저장",
                visible: true,
                action: function() {}
            }, {
                text: "수정",
                visible: true,
                action: function() {}
            }, {
                text: "취소",
                visible: true,
                action: function() {}
            }]
        }).data("kendoDetailDialog");


        // Popup Window
        var popupWindow1 = $("#window1");
        popupWindow1.kendoPopupSingleWindow({
            title: "test",
            width: 1000,
            height: 800
        });
        $("#grid").kendoGrid({
            dataSource: {
                type: "odata",
                transport: {
                    read: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Customers"
                },
                pageSize: 5
            },
            height: 550,
            groupable: false,
            sortable: true,
            //pageable: {
            //    pageSizes: [5, 10, 20]
           // },
            columns: [{
                template: "<div class='customer-photo'" +
                    "style='background-image: url(https://demos.telerik.com/kendo-ui/content/web/Customers/#:data.CustomerID#.jpg);'></div>" +
                    "<div class='customer-name'>#: ContactName #</div>",
                field: "ContactName",
                title: "Contact Name",
                width: 240
            }, {
                field: "ContactTitle",
                title: "Contact Title"
            }, {
                field: "CompanyName",
                title: "Company Name"
            }, {
                field: "Country",
                width: 150
            }]
        });


        // action
        $("#btn-confirm").on("click", function(e) {
            popupDialog.message("변경 완료되었습니다.");
            popupDialog.open();
        });

        $("#btn-detail").on("click", function(e) {
            popupDetail.open();
        });

        $("#btn-window1").click(function() {
            popupWindow1.data("kendoPopupSingleWindow").openWindowPopup();
        });


    };

    // 데이터 바인딩
    var dataBind = function() {

        targetDropDownData = [{
            text: "알람 타입",
            value: "All Alarm Type"
        }, {
            text: "에러",
            value: "Critical"
        }, {
            text: "경고",
            value: "Warning"
        }, {
            text: "경고",
            value: "Warning"
        }, {
            text: "경고",
            value: "Warning"
        }, {
            text: "경고",
            value: "Warning"
        }, {
            text: "경고",
            value: "Warning"
        }, {
            text: "경고",
            value: "Warning"
        }];

        targetDownList1.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList2.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList3.data("kendoDropDownCheckBox").dataSource.data(targetDropDownData);
        targetDownList4.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList5.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList6.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList7.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList8.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList9.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList10.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList11.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList12.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList13.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList14.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList15.data("kendoDropDownList").dataSource.data(targetDropDownData);
        targetDownList16.data("kendoDropDownList").dataSource.data(targetDropDownData);
    };

    var getPageSize = function() {
        return 0;
    };

    init();
    dataBind();

});