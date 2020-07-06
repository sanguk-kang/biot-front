<template>
  <div class="content">
    <div class="ExtendMap"/>
  </div>
</template>

<script>
import gmapsInit from '@/utils/gmaps';

export default {
  name: 'ExtendMap',
  async mounted() {
    try {
      const google = await gmapsInit();
      const geocoder = new google.maps.Geocoder();
      const map = new google.maps.Map(this.$el);
      const locations = [
        {
          position: {
            lat: 37.492057,
            lng: 127.029783,
          },
        },
        // {
        //   position: {
        //     lat: 48.174270,
        //     lng: 16.329620,
        //   },
        // },
        // ...
      ];
      geocoder.geocode({ address: 'Gangnam-daero, Seocho-gu, Seoul, Republic of Korea' }, (results, status) => {
        if (status !== 'OK' || !results[0]) {
          throw new Error(status);
        }
        map.setCenter(results[0].geometry.location);
        map.fitBounds(results[0].geometry.viewport);

      });
      // const markerClickHandler = (marker) => {
      //   map.setZoom(13);
      //   map.setCenter(marker.getPosition());
      // };

      locations.map(x => new google.maps.Marker({ ...x, map }));
      // const markers = locations.map((location) => {
      //     const marker = new google.maps.Marker({ ...location, map });
      //     marker.addListener('click', () => markerClickHandler(marker));

      //     return marker;
      //   });
      // new MarkerClusterer(map, markers, {});

    } catch (error) {
      console.error(error);
    }
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

.App {
  width: 100vw;
  height: 100vh;
}
</style>
