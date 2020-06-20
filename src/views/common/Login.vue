<template>
  <div class="login">
      <h1>{{msg}}</h1>
      <button type="button" class="btn btn-secondary" @click="test">Sample</button>
  </div>
</template>

<script>
export default {
  name: "Login",
  components: {},
  props: [],
  data: function() {
    return {
     msg: "Login Page"
    }
  },
  methods: {
    test() {
      this.$router.push({name : "Sample"});
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

<style lang="scss">

html, body {
  height: 100%;
}

.login {
  width: calc(100% - 600px);
  height: 100%;
  display: table;
}

.login > h1 {
  height: 100%;
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}

</style>