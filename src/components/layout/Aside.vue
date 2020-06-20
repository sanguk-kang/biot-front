<template>
  <div class="aside">
      <h1>{{msg}}</h1>
  </div>
</template>

<script>
export default {
  name: "Aside",
  components: {},
  props: [],
  data: function() {
    return {
     msg: "Aside Page"
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

<style lang="scss">

.aside {
  width: 300px;
  height: 100%;
  display: table;
  background-color: yellow;
}

.aside > h1 {
  height: 100%;
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}

</style>