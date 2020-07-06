<template>
  <div class="my-modal" role="alert">
    <div>
      <span>{{modalData.message}}</span>
    </div>
    <div>
      <button type="button" v-for="(btnItem, idx) in modalData.btn" :key="'btn'+ idx">{{btnItem.name}}</button>
    </div>
  </div>
</template>

<script>


export default {
  name: 'Modal',
  props: {
    modalData: Object
  },
  data: function() {
    return {
     visible: true
    }
  },
  methods: {
    openAlert() {
      this.$alert('This is a message', 'Title', {
        title: "alert test",
        confirmButtonText: 'OK',
        dangerouslyUseHTMLString: true,
        callback: action => {
          console.log(action);
        }
      });
    },
    openConfirm() {
      this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
        title: "confirm test",
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: '',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        dangerouslyUseHTMLString: true
      }).then(() => {
        console.log('Delete completed');
      }).catch(() => {
        console.log('Delete canceled');       
      });
    }    
  }
}
</script>

<style lang="scss">

</style>