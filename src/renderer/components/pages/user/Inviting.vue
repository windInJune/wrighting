<template>
    <myDialog :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title" :flag="codeFlag" v-on:closeDialog="hiddenDialog">
        <div class="inviting-content-title">您的邀请码</div>
        <div class="inviting-content-code" >BIGBAN</div>
        <div class="inviting-content-text">邀请用户可享更多特权</div>
        <button  class="inviting-contentCode" >复制</button>
    </myDialog>
</template>
<script type="text/ecmascript-6">
  import myDialog from '@/components/pages/dialog/dialog.vue'
  export default {
    name: 'Inviting',
      props: {
          codeFlag: Boolean
      },
    components:{myDialog},
    data () {
        return {
            dialoginf:{
                width:350,
                height:350,
                title:"邀请好友"
            }

        }
    },
    methods: {
        hiddenDialog (data){
            this.$emit("closeDialog",false)
        }

    }
  }
</script>
<style scoped>
    .inviting-content-title{
        width: 100%;
        height: auto;
        text-align: center;
        font-size: 14px;
        color:#333333;
        margin-top: 50px;

    }

    .inviting-content-code{
        width: 100%;
        height: auto;
        text-align: center;
        font-size: 44px;
        color:#333333;
        margin-top: 5px;

    }

    .inviting-content-text{
        width: 100%;
        height: auto;
        text-align: center;
        font-size: 14px;
        color:#999999;
        margin-top: 50px;
    }
    .inviting-contentCode{
         width: 270px;
        height: 40px;
        border-radius: 4px;
        background-color: #f3f3f3;
        border: solid 1px #dddddd;
        outline: none;
        font-size: 16px;
        color:#666666;
        cursor: pointer;
        margin: 15px 0 0 40px;
        font-family:'微软雅黑';
    }


</style>

