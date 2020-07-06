<template>
    <div class="side_wrap">
        <!-- s:site lsit wrap -->
        <div class="site-list-wrap first">
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
                        <th>사이트 이름</th>
                        <td><div class="ft_td">_Site Name</div></td>
                    </tr>
                    <tr>
                        <th>사이트 ID</th>
                        <td><div class="ft_td">_Site ID</div></td>
                    </tr>
                    <tr>
                        <th>사이트 코드</th>
                        <td><div class="ft_td">_Site Code</div></td>
                    </tr>
                    <tr>
                        <th>사이트 생성일</th>
                        <td><div class="ft_td">2020-01-01</div></td>
                    </tr>
                    <tr>
                        <th>라이선스</th>
                        <td><div class="ft_td">유료 / 265일 남음</div></td>
                    </tr>
                    </tbody>
                </table>
                <!--e:form table-->
            </section>
        </div>
        <!-- e:site lsit wrap -->
    </div>
</template>

<script>

    export default {
        name : "DefectSiteInfo",
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