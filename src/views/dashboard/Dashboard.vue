<template>
    <!-- <div class="content"> -->
        <!-- s:dashboard contents -->
        <div id="dashboard-contents">
            <!-- s: location -->
            <div class="d-location">
                <div class="location_title_wrap">
                    <div class="step_list">
                        <a href="#" class="link">All (1,255)</a>
                        <span class="ic_arr"></span>
                        <a href="#" class="link ellipsis">...</a>
                        <!-- 말줄임 클릭시 노출
                        <div class="ell_full" style="left:85px;top:20px">
                            <a href="#" class="ell_link">Multi Site (201) </a>
                            <span class="ic_ell_arr"></span>
                            <a href="#" class="ell_link">Multi Site (128)</a>
                        </div>
                        -->
                        <span class="ic_arr"></span>
                        <a href="#" class="link">3Depth Multi Site (100)</a>
                        <span class="ic_arr"></span>
                        <a href="#" class="link">4Depth Multi Site (68)</a>
                        <span class="ic_arr"></span>
                        <a href="#" class="link">5Depth Multi Site (33)</a>
                    </div>
                    <ul class="right_area">
                        <li><button class="ic ic-loc active">지도보기</button></li>
                        <li><button class="ic ic-list" @click="showSiteList()">목록보기</button></li>
                    </ul>
                </div>
            </div>
            <!-- e: location -->
            <!-- s: content-->
            <div class="d-content">
                <!-- s: map -->
                <div class="map_wrap map_bgimg" id="googleMap" >
                    <div class="flag" style="left: 10px;top:30px;"><span class="title">Multi</span><span class="num">23</span></div>
                    <div class="flag warning " style="left: 100px;top:100px;"><span class="title">Multi</span><span class="num">23</span></div>
                    <div class="flag critical" style="left: 200px;top:200px;"><span class="title">Seoul MetriMetri</span><span class="num">23</span></div>

                    <div class="btn_area">
                        <a href="#" class="btn_full" @click="showExtendMap">펼쳐보기</a>
                    </div>
                </div>
                <!-- e: map -->

                <!-- siteInfo-->
                <div>
                    <siteInfo :propDataObj="dataObj"></siteInfo>
                </div>
                
                
            </div>
            <!-- e: content-->
            <MultiSiteInfo ref="multiSiteInfo" v-bind:popDataObj="modalDataObj"></MultiSiteInfo>
        </div>
        <!-- e:dashboard contents -->
    <!-- </div>     -->
</template>

<script>
import axios from '@/api/axios.js';
import gmapsInit from '@/utils/gmaps';
import siteInfo from "@/components/dashboard/dashboardSiteInfo";
import MultiSiteInfo from "@/components/dashboard/dashboardSiteInfoPop";
export default {
    name: "Dashboard",
    props: [],
    components: {
        siteInfo,
        MultiSiteInfo
    },
    data: function() {
        return {
            dataObj: [{
                key: "1",
                name: "종합현황",
                id: "tabSingleTotal",
                value: {
                        type: "all",
                        a: "All Site Status",
                        b:"45.7%",
                        c: "(150)",
                        d: "Operation Rate",
                        e: "50.2%",
                        f: "(1036/1097)",
                        g: "ON/OFF",
                        h: "1,058,241",
                        i: "10,999",
                        j: "10,999",
                        k: "10,999",
                        l: "10,999",
                        m: "Good",
                        n: "Normal",
                        lat: null,
                        lng: null
                    }
            },
            {
                key: "2",
                name: "운전현황",
                id: "tabSingleMovement",
                value: {
                        type: "multi",
                        a: "서울시교육청",
                        b:"45.8%",
                        c: "(151)",
                        d: "ON/OFF",
                        e: "50.2%",
                        f: "(1036/1097)",
                        g: "ON/OFF",
                        h: "1,058,241",
                        i: "10,999",
                        j: "10,999",
                        k: "10,999",
                        l: "10,999",
                        m: "Poor",
                        n: "Normal",
                        lat: 37.570377,
                        lng: 126.967184,                    
                    }
            },
            {
                key: "3",
                name: "에너지",
                id: "tabSingleEnergy",
                value: {
                        type: "single",
                        a: "인천시교육청",
                        b:"45.9%",
                        c: "(152)",
                        d: "ON/OFF",
                        e: "50.2%",
                        f: "(1036/1097)",
                        g: "ON/OFF",
                        h: "1,058,241",
                        i: "10,999",
                        j: "10,999",
                        k: "10,999",
                        l: "10,999",
                        m: "Good",
                        n: "Normal",
                        lat: 37.492057,
                        lng: 127.029783,                     
                    }
            },
            {
                key: "4",
                name: "공기질",
                id: "tabSingleAir",
                value: {
                        type: "single",
                        a: "경기도교육청",
                        b:"45.0%",
                        c: "(153)",
                        d: 24,
                        e: "50.2%",
                        f: "(1036/1097)",
                        g: "ON/OFF",
                        h: "1,058,241",
                        i: "10,999",
                        j: "10,999",
                        k: "10,999",
                        l: "10,999",
                        m: "Bad",
                        n: "Normal",
                        lat: 37.482057,
                        lng: 127.029783,                     
                    }
            }],
            modalDataObj: [{
                key: "1",
                name: "종합현황",
                id: "tabSingleTotal",
                value: {
                        type: "single",
                        a: "경기도교육청",
                        b:"45.7%",
                        c: "(150)",
                        d: "Operation Rate",
                        e: "50.2%",
                        f: "(1036/1097)",
                        g: "ON/OFF",
                        h: "1,058,241",
                        i: "10,999",
                        j: "10,999",
                        k: "10,999",
                        l: "10,999",
                        m: "Good",
                        n: "Normal",
                        lat: 37.482057,
                        lng: 127.029783
                    }
            }]
        }
    },
    computed: {
    },
    methods: {
        search() {
            console.log("[Dashboard API]");
            
            // var apiHeader = {
            //     headers: {
            //         'accept': 'application/vnd.samsung.biot.v1+json;charset=UTF-8',
            //     }
            // }

            var params =
            {
                "userId": "webadmin",
            };

            axios.getApi('/ums/user/'+params.userId+'/dashboard/multi/sites',params).then(res => {
                // 정상
                if(res.status == 200)
                {
                    console.log("[API] : 정상 ");
                    // var deviceGroupData = [];
                    // var resultList = res.data;
                    // resultList.forEach(function(rowData){
                    //     deviceGroupData.push({
                    //         "key": rowData.id,
                    //         "value": rowData.name,
                    //         "checked": false,
                    //     });
                    // });

                }
            }).catch(function (error)
            {
                // TO-DO 에러 처리하기
                var errCode = error.response.status;
                    if(errCode == 401) {
                        this.alert.openAlert("API", "[ errorCode : " + errCode + " ]\n오류가 발생하였습니다.");''
                }
            });
        },
        showSiteList() {
            // if (arg == 'all'){
                this.$router.push({name : "SiteList"});
            // }
            //window.open("http://localhost:8080/singlesitetap", "_blank");
        },
        showExtendMap() {
            this.$router.push({name : "ExtendMap"});
        },
        openDetailPop: function() {
            
            this.$refs.multiSiteInfo.openModal();
        }
        // addMarker(){
        //     for (var i = 0 ; i < this.dataObj.length ; i++) {
        //         if (this.dataObj[i].value.lat){
        //             var data = [] ;
        //             data ={"idx": i,"lat":this.dataObj[i].value.lat ,"lng":this.dataObj[i].value.lng}  ;
        //             console.log(data);
        //             this.locations.push(data);
        //         }
        //     }
           // console.log("addListener this.locations: "+this.locations[0].lat);
        //}
    },
    created() {
        //조회
        this.search();
    },
    async mounted() {
        try {
            const google = await gmapsInit();
            //지도 
            var options = {
                zoom:1,
                center:{lat:37.4837121,lng:127.0324112},
                disableDefaultUI: true
                /* center: myLatlng,
                mapTypeControl: false,
                draggable: false,
                scaleControl: false,
                scrollwheel: false,
                navigationControl: false, */
                /* streetViewControl: false, */
            }
            const map = new google.maps.Map(document.getElementById('googleMap'), options);

            //마커
            //locations.map(x => new google.maps.Marker({ ...x, map }));
//            this.addMarker();
            var content =[];
            var coordinates = [];
            var infoWindow = new google.maps.InfoWindow();
            var bounds = new google.maps.LatLngBounds();
            for (var idx = 0 ; idx < this.dataObj.length ; idx++) {

                content.push(this.dataObj[idx].value.a);
                
                if (this.dataObj[idx].value.lat){
                    var marker = new google.maps.Marker({  // 
                    position: {lat:this.dataObj[idx].value.lat,lng:this.dataObj[idx].value.lng}, //{"lat":this.dataObj[i].value.lat ,"lng":this.dataObj[i].value.lng} 
                    map:map,
                    title: this.dataObj[idx].value.a,
                    index:idx,
                    icon: {
                        url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
                        anchor: new google.maps.Point(20, 10),
                        scaledSize: new google.maps.Size(13, 20)
                    }
                    /* icon: */
                    });

                    

                    var info = new google.maps.InfoWindow({
                        // content:'<a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+this.dataObj[idx].value.a+'</a>'
                        content:this.dataObj[idx].value.a
                            /*   '<h4>여의도동 여의대방로 67길11</h4>' */
                    });
                    info.open(map, marker);

                    //좌표 거리계산
                    var latlng = new google.maps.LatLng(this.dataObj[idx].value.lat, this.dataObj[idx].value.lng);
                    coordinates.push(latlng);

                    //마커 클릭시
                    let call =  this ;
                    google.maps.event.addListener(marker, 'click', (function(marker,idx) {
                        return function() {
                            infoWindow.setContent(content[idx]);
                            //infoWindow.open(map, marker);
                            call.openDetailPop();
                        }
                    })(marker, idx));
                    
                    if(marker){
                        marker.addListener('click', function() {
                            map.setZoom(15);
                            map.setCenter(this.getPosition());
                        });
                    }
                    
                }
            }
            
            //맵 사이즈 변경
            for (var i=0; i < coordinates.length; i++) {
                bounds.extend(coordinates[i]);
            }
            map.fitBounds(bounds);

        } catch (error) {
        console.error(error);
        }
    },
    destroyed() {
    }
}
</script>

<style lang="scss">

</style>