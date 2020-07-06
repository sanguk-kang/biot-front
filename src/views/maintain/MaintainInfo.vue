<template>
    <div class="content">
        <!--s: tabmenu -->
        <infoTab></infoTab>
        <!--e: tabmenu -->

        <!--s: main contents -->
        <infoJoinList v-if="status == 1" @download="download(5)" @openSite="toSamsungSite" @openPop="openDetailPop"></infoJoinList>
        <infoUnjoinList v-else-if="status == 0" @download="download(5)" @openSite="toSamsungSite" @openPop="openDetailPop"></infoUnjoinList>
        <div v-else></div>
        <!-- e:main contents -->

        <infoDetailModal ref="infoDetailModal"></infoDetailModal>
    </div>
</template>

<script>
import axios from "@/api/axios.js";
import InfoTab from '@/components/maintain/InfoTab.vue';
import InfoJoinList from '@/components/maintain/InfoJoinList.vue';
import InfoUnjoinList from '@/components/maintain/InfoUnjoinList.vue';
import InfoDetailModal from '@/components/maintain/InfoDetailModal.vue';

export default {
    name: 'MaintainInfo',
    components: { InfoTab, InfoJoinList, InfoUnjoinList, InfoDetailModal },
    props: [],
    data: function() {
        return {
            /* api variable */
            status: 2
        }
    },
    methods: {
        openAlert: function(title, msg) {
            this.$alert(msg, 'Title', {
                title: title, confirmButtonText: 'OK', dangerouslyUseHTMLString: true
            });
        },

        openDetailPop: function() {
            this.$refs.infoDetailModal.openModal();
        },

        download: function(target) {
            let alert = this;

            axios.postApi('/sms/maintenance/fileDownload/' + target).then(response => {
                if (response.status == 200) {
                    alert.openAlert("안내", "다운로드가 완료되었습니다.");''
                }
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("안내", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });

            // TODO
            // axios.fileUploadApi('/sms/maintenance/fileDownload', 'application/octet-stream', target).then(response => {
            //     console.log(response.data)
            // }).catch(function (error) {
            //     var errCode = error.response.status;
            //     if(errCode >= 400) {
            //         alert.openAlert("안내", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
            //     }
            // });
        },

        toSamsungSite: function() {
            window.open("https://www.samsung.com/sec/business/maintenance-service/sms/", "_blank");
        },

        search: function() {
            let alert = this;

            var params = {};
            params.siteId = 20301;

            console.log("[ API ]  : 유지보수 안내(가입자/미가입자 체크)  (/api/sms/maintenance/getMaintenanceJoinStatus)", params);

            axios.getApi('/sms/maintenance/getMaintenanceJoinStatus', params).then(response => {
                this.status = response.data.status;
            }).catch(function (error) {
                var errCode = error.response.status;
                if(errCode >= 400) {
                    alert.openAlert("안내", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        }
    },
    created() {
        this.search();
    },
    mounted() {
    },
    destroyed() {
    }
}
</script>