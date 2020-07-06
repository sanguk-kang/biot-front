<template>
    <div class="layout_wrap_side">
        <!-- 카드영역 시작 -->
        <div class="drawer_wrap">
            <!-- 1X1 시작 -->
            <div class="d_card w1 h1">
                <div class="d_card_name">
                    Site name 1
                </div>
                <div class="d_card_con">
                    <ul class="d_card_info">
                        <li>
                            <span class="stit">Outdoor Temp.</span>
                            <span class="info" data-content="℃">7.36</span>
                        </li>
                        <li>
                            <span class="stit">Outdoor Hum.</span>
                            <span class="info" data-content="%">30 </span>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 1X1 끝 -->

            <!-- 1X1 시작 -->
            <div class="d_card w1 h1">
                <div class="d_card_name">
                    Outdoor temperature
                </div>
                <div class="d_card_con">
                    <ul class="d_card_info one">
                        <li>
                            <p class="stit">Temperature Sensor</p>
                            <p class="info"><strong>7.36 </strong>˚c</p>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 1X1 끝 -->

            <!-- 2X2 시작 -->
            <div class="d_card w2 h2">
                <div class="d_card_name">
                    Used Time Top 5 of Day : 2X2
                </div>
                <div class="d_card_con">
                    <!-- 그래프 영역 -->
                    <!-- <img src="../../assets/images/dashboard/2002_2.png" alt="샘플이미지"> -->
                </div>
            </div>
            <!-- 2X2 끝 -->
        </div>
        <!-- 카드영역 끝 -->
        
        <div class="content_title_wrap no_title">
            <ul class="flex_left">
                <li><VueDropdown :isCheckType='true' :selectboxData='selectboxData' style="width:200px"></VueDropdown></li>
                <li><VueDropdown2 :isCheckType='false' :selectboxData='selectboxData2' style="width:150px"></VueDropdown2></li>
                <li><VueDropdown3 :isCheckType='false' :selectboxData='selectboxData3' style="width:150px"></VueDropdown3></li>
                <li><a href="#" class="btn_legend">Legend</a></li>
            </ul>
        </div>
    </div>
</template>

<script>
import VueDropdown from "@/components/custom/VueDropdown";
import VueDropdown2 from "@/components/custom/VueDropdown";
import VueDropdown3 from "@/components/custom/VueDropdown";

export default {
    name: "SingleEnergy",
    props: [],
    components: {
        VueDropdown,
        VueDropdown2,
        VueDropdown3
    },
    data() {
        return {
        // select 변수
        selected: '',
        selectboxData: [
            {
            value: '전체그룹',
            key: 'aa'
            },
            {
            value: '스타벅스',
            key: 'bb'
            },
            {
            value: '커피빈',
            key: 'cc'
            },
            {
            value: '투썸플레이스',
            key: 'dd'
            }
        ],
        selectboxData2: [
            {
            value: '서브그룹',
            key: 'aa'
            },
            {
            value: '스타벅스',
            key: 'bb'
            },
            {
            value: '커피빈',
            key: 'cc'
            },
            {
            value: '투썸플레이스',
            key: 'dd'
            }
        ],
        selectboxData3: [
            {
            value: '높은순',
            key: 'aa'
            },
            {
            value: '스타벅스',
            key: 'bb'
            },
            {
            value: '커피빈',
            key: 'cc'
            },
            {
            value: '투썸플레이스',
            key: 'dd'
            }
        ]
        }
    },
    computed: {
    },
    methods: {
    },
    created() {
    },
    mounted() {
    },
    destroyed() {
    }
}
</script>