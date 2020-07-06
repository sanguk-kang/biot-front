<template>
    <div class="side_wrap">
        <!-- s:content title-->
        <div class="content_title_wrap">
            <ul class="right_area">
                <li><button class="k-button" disabled="disabled">저장</button></li>
            </ul>
        </div>
        <!-- e:content title-->

        <!-- s:site lsit wrap -->
        <div class="site-list-wrap">
            <!-- s: 컨텐츠 -->
            <section class="content_view">
                <!--s:form table-->
                <table class="form_table only_setting cont_title"> <!-- th가 컨텐츠 타이틀 클래스 cont_title -->
                    <colgroup>
                        <col style="width: 210px;">
                        <col style="">
                    </colgroup>
                    <tbody>
                    <tr>
                        <th>Language</th>
                        <td>
                            <vueDropdown v-bind:isCheckType='true' v-bind:selectboxData='errTypeList' v-bind:allValue='true' :allText="'언어 선택'"></vueDropdown>
                        </td>
                    </tr>
                    <tr>
                        <th>Temperature unit</th>
                        <td>
                            <div class="radio_wrap ft_td rd_wd120">
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList2" id="loadSchList21"><label class="k-radio-label" for="loadSchList21">Celsius (°C)</label></span>
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList2" id="loadSchList22"><label class="k-radio-label" for="loadSchList22">Fahrenheit (℉)</label></span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>Temperature control unit</th>
                        <td>
                            <div class="radio_wrap ft_td rd_wd120">
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList3" id="loadSchList31"><label class="k-radio-label" for="loadSchList31">0.5(°C)</label></span>
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList3" id="loadSchList32"><label class="k-radio-label" for="loadSchList32">1(°C)</label></span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>Time display</th>
                        <td>
                            <div class="radio_wrap ft_td rd_wd120">
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList4" id="loadSchList41"><label class="k-radio-label" for="loadSchList41">24 Hours</label></span>
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList4" id="loadSchList42"><label class="k-radio-label" for="loadSchList42">AM/PM</label></span>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <!--e:form table-->
            </section>
            <!-- e: 컨텐츠 -->
        </div>
        <!-- e:site lsit wrap -->

    </div>
</template>

<script>
    import VueDropdown from "@/components/custom/VueDropdown";

    export default {
        name : "DefectUnitSetting",
        components : {VueDropdown},
        props : [],
        data: function() {
            return {
                itemList: [
                    {
                        "key1":" 실내기",
                        "key2": "_Device Name",
                        "key3": "12343123",
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
                        "key3": "43253436",
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
                ]
            }
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