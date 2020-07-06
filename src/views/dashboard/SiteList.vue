<template>
    <div class="content">
        <div class="side_wrap">
            <!-- 상단 정렬 및 검색 영역 시작-->
            <div class="content_title_wrap">
                <ul class="right_area icon_type">
                    <li><button class="ic ic-list active">목록보기</button></li>
                    <!-- <li><button class="ic ic-tile">타일보기</button></li> -->
                    <li>
                        <div class="search_input_wrap">
                            <input class="k-input" type="text" placeholder="검색 내용 입력">
                            <span class="ic ic-bt-input-remove"></span>
                            <span class="ic ic-bt-input-search"></span>
                        </div>
                    </li>
                </ul>
            </div>
            <!-- 상단 정렬 및 검색 영역 끝-->
            
            <!-- 검색 조건 영역 시작-->
            <div>통합관제 (1,225)</div>
            <!-- 검색 조건 영역 끝-->

            <!-- 하단 좌우영역 시작 -->
            <div class="site-list-wrap">
                <!-- s: 컨텐츠 : 검색 테이블 시작. -->
                <section class="content_view">
                    <!-- s: 기본 list-->
                    <div class="g-table">
                        <table>
                            <colgroup>
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                                <col style="width:10%">
                            </colgroup>
                            <thead>
                            <tr>
                                <th>사이트 명  <i class="ic_sort"></i></th>
                                <th>운전율  <i class="ic_sort up"></i></th>
                                <th>유지보수 검출 <i class="ic_sort"></i></th>
                                <th>에러 <i class="ic_sort"></i></th>
                                <th>경고 <i class="ic_sort"></i></th>
                                <th>비효율 <i class="ic_sort"></i></th>
                                <th>공기질  <i class="ic_sort"></i></th>
                                <th>조명 <i class="ic_sort"></i></th>
                                <th>전력소비량 <i class="ic_sort"></i></th>
                                <th>상세정보</th> 
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="item in dataObj" :key="item.key">
                                <!-- <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched2"><label class="k-checkbox-label single" for="ched2"></label></span></td> -->
                                <td>{{item.value.a}}</td>
                                <td>{{item.value.b}}</td>
                                <td>{{item.value.c}}</td>
                                <td>{{item.value.d}}</td>
                                <td>{{item.value.e}}</td>
                                <td>{{item.value.f}}</td>
                                <td><span class="ic_dot normal_on"></span>{{item.value.g}}</td>
                                <td>{{item.value.h}}</td>
                                <td>{{item.value.i}}</td>
                                <td>{{item.value.j}}</td>
                                <td><span class="ic ic-info"></span></td>
                            </tr>
                            <!-- <tr>
                                <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched2"><label class="k-checkbox-label single" for="ched2"></label></span></td>
                                <td>실내기</td>
                                <td class="tal">
                                    <p class="ellipsis">FCU_B3_11</p>
                                    <p class="ellipsis desc_text">00:FF:0D:02:1A:01:SNSG7788-632Y-31</p>
                                </td>
                                <td><span class="ic_dot normal_on"></span></td>
                                <td class="tal"><p class="ellipsis">Group Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1</p></td>
                                <td>X</td>
                                <td><span class="ic ic-info"></span></td>
                            </tr>
                            <tr>
                                <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched2"><label class="k-checkbox-label single" for="ched2"></label></span></td>
                                <td>실내기</td>
                                <td class="tal">
                                    <p class="ellipsis">FCU_B3_11</p>
                                    <p class="ellipsis desc_text">00:FF:0D:02:1A:01:SNSG7788-632Y-31</p>
                                </td>
                                <td><span class="ic_dot error"></span></td>
                                <td class="tal"><p class="ellipsis">Group Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1</p></td>
                                <td>O</td>
                                <td><span class="ic ic-info"></span></td>
                            </tr>
                            <tr>
                                <td><span class="checkLabel"><input type="checkbox" class="k-checkbox" name="ched" id="ched2"><label class="k-checkbox-label single" for="ched2"></label></span></td>
                                <td>실내기</td>
                                <td class="tal">
                                    <p class="ellipsis">FCU_B3_11</p>
                                    <p class="ellipsis desc_text">00:FF:0D:02:1A:01:SNSG7788-632Y-31</p>
                                </td>
                                <td><span class="ic_dot warning"></span></td>
                                <td class="tal"><p class="ellipsis">Group Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1roup Name1&gt;Group Name1-1</p></td>
                                <td>O</td>
                                <td><span class="ic ic-info"></span></td>
                            </tr> -->
                            </tbody>

                        </table>
                    </div>
                    <!-- e: 기본 list-->
                </section>
                <!-- e: 컨텐츠 : 검색 테이블 끝. -->
            </div>
            <!-- 하단 좌우영역 끝-->
        </div>
    </div>
</template>

<script>
export default {
    name: "SiteList",
    props: [],
    components: {
        
    },
    data() {
        return {
            dataObj: [
            {
                key: "1",
                value: {
                    a: "서울시교육청",
                    b:"45.7%",
                    c: 12,
                    d: 24,
                    e: 55,
                    f: 21,
                    g: "보통",
                    h: "조명",
                    i: "6,596 Kwh",
                    j: "",
                }
            },
            {
                key: "2",
                value: {
                    a: "서울시교육청",
                    b:"45.7%",
                    c: 12,
                    d: 24,
                    e: 55,
                    f: 21,
                    g: "매우나쁨",
                    h:"조명",
                    i:"6,596 Kwh",
                    j:"",
                }
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
