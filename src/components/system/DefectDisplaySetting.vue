<template>
    <div class="side_wrap">
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
                    <tr >
                        <th>Logo</th>
                        <td>
                            <div class="radio_wrap ft_td rd_wd120">
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList2" id="loadSchList21" checked><label class="k-radio-label" for="loadSchList21">Default</label></span>
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList2" id="loadSchList22"><label class="k-radio-label" for="loadSchList22">Logo change</label></span>
                            </div>
                            <div class="setting_logo_wrap">
                                <ul class="form_flex">
                                    <li>
                                        <p>Large SIZE (200 x 44 pixels)</p>
                                        <div class="logo_wrap large">
                                            <div class="dotline"><img src="@/assets/images/content/setting_logo_dot1.png" alt="" /></div>
                                            <div class="logo_img"><img src="@/assets/images/content/setting_logo_t1.png" alt="" /></div>
                                        </div>
                                        <!-- <ul class="form_flex" >
                                             <li><button  class="k-button wd_130" >Upload</button></li>
                                             <li><button  class="k-button wd_130" disabled="disabled">Delete</button></li>
                                         </ul>-->
                                    </li>
                                    <li>
                                        <p>Small SIZE (44 x 44 pixels)</p>
                                        <div class="logo_wrap small">
                                            <div class="dotline"><img src="@/assets/images/content/setting_logo_dot2.png" alt="" /></div>
                                            <div class="logo_img"><img src="@/assets/images/content/setting_logo_t2.png" alt="" /></div>
                                        </div>
                                        <!--<ul class="form_flex">
                                            <li><button  class="k-button wd_130" >Upload</button></li>
                                            <li><button  class="k-button wd_130" disabled="disabled">Delete</button></li>
                                        </ul>-->
                                    </li>
                                </ul>
                            </div>

                            <!--<ul class="bull_list2">
                                <li>큰 사이즈, 작은 사이즈의 로고 이미지를 모두 등록하여야 합니다.</li>
                                <li>로고 사이즈는 기준선을 넘기지 마세요.</li>
                                <li>PNG 파일만 가능하며, 파일의 크기는 최대 300KB 까지만 지원합니다.</li>
                            </ul>-->
                        </td>
                    </tr>
                    <tr>
                        <th>Multi-site view type</th>
                        <td>
                            <div class="radio_wrap ft_td rd_wd120">
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList3" id="loadSchList31"><label class="k-radio-label" for="loadSchList31"><i class="ic ic-location"></i> Map</label></span>
                                <span class="radioLabel"><input type="radio" class="k-radio" name="loadSchList3" id="loadSchList32"><label class="k-radio-label" for="loadSchList32"><i class="ic ic-view-list"></i> List</label></span>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <!--e:form table-->
            </section><!-- s:site lsit wrap -->
        </div>
    </div>
</template>

<script>

    export default {
        name : "DefectDisplaySetting",
        components : {},
        props : [],
        data: function() {
            return {
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