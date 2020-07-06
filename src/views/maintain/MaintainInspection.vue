<template>
    <div class="content">
        <!--s: tabmenu -->
        <inspectionTab></inspectionTab>
        <!--e: tabmenu -->

        <!--s: main contents -->
        <inspectionList></inspectionList>
        <!-- e:main contents -->
    </div>
</template>

<script>
import InspectionTab from "@/components/maintain/InspectionTab";
import InspectionList from "@/components/maintain/InspectionList";

export default {
    name: "MaintainInspection",
    components: { InspectionTab, InspectionList },
    props: [],
    data: function() {
        return {
            total: 0,
            checked: [],
            checkedCountText: '선택된 디바이스가 없습니다.',

            startDate: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
            endDate: new Date().setDate(new Date().getDate()-30),

            elStartDate: '',
            elEndDate: '',

            InspectionList: [
                {
                    "key1":" 실내기",
                    "key2": "_Device Name",
                    "key3": "123123",
                    "key4": "Dev_101",
                    "key5": "통신에러",
                    "key6": "5",
                    "key7": "10",
                    "key8": "2020-03-20 14:55",
                    "key9": "2020-03-20",
                },
                {
                    "key1":" 실내기",
                    "key2": "_Device Name",
                    "key3": "432536",
                    "key4": "Dev_523",
                    "key5": "옵션기기",
                    "key6": "42",
                    "key7": "15.2",
                    "key8": "2020-11-20 04:35",
                    "key9": "2020-12-11",
                },

                {
                    "key1":" 실내기",
                    "key2": "_Device Name",
                    "key3": "346536",
                    "key4": "Dev_523",
                    "key5": "옵션기기",
                    "key6": "42",
                    "key7": "15.2",
                    "key8": "2020-11-20 04:35",
                    "key9": "2020-12-11",
                }
            ],
            errTypeList: [
                {
                    key: "MCU",
                    value: "mcu"
                },
                {
                    key: "GHP",
                    value: "ghp"
                },
                {
                    key: "EHS",
                    value: "ehs"
                }
            ],
            factorList: [
                {
                    key: "MCU",
                    value: "mcu"
                },
                {
                    key: "GHP",
                    value: "ghp"
                },
                {
                    key: "EHS",
                    value: "ehs"
                }
            ],
        }
    },
    methods: {
        chkChange: function(event) {
            event.target.checked ? ++ this.total : -- this.total;
            console.log(this.total);
            if(this.total > 0) {
                this.checkedCountText = this.total + '개의 디바이스가 선택되었습니다.';
            } else {
                this.checkedCountText = '선택된 디바이스가 없습니다.';
            }
        },

        search: function() {
            alert("search : " + this.elStartDate + " ~ " + this.elEndDate);
        },

        toExcel: function() {
            alert("toExcel");
        }
    },
    computed: {
        checkAll: {
            get: function () {
                return this.InspectionList ? this.checked.length == this.InspectionList.length : false;
            },
            set: function (value) {
                var checked = [];
                if (value) {
                    this.InspectionList.forEach(function (item) {
                        checked.push(item.key3);
                    });
                }

                this.checked = checked;

                if(this.checked.length > 0) {
                    this.total = this.checked.length;
                    this.checkedCountText = this.checked.length + '개의 디바이스가 선택되었습니다.';
                } else {
                    this.total = 0;
                    this.checkedCountText = '선택된 디바이스가 없습니다.';
                }
            }
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