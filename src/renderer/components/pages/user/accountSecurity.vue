<template>
   <div class="container">
        <div class="title">账号密码登录</div>
        <div class="row-box">
            <img src="../../../assets/img/id_phone.png"  alt="" class="">
            <span class="user-inf" >手机号/15158018787</span>
            <span class="edit-inf">绑定手机号/修改手机号</span>
        </div>
       <div class="row-box">
           <img src="../../../assets/img/id_password.png"  alt="" class="">
           <span class="user-inf" >密码/******</span>
           <span class="edit-inf" @click="closeDialog()">修改密码</span>
       </div>
       <div class="title" style="margin-top: 80px">第三方登录</div>
       <div class="row-box">
           <img src="../../../assets/img/id_weixin.png"  alt="" class="">
           <span class="user-inf" >微信/微信昵称</span>
           <span class="edit-inf">绑定/解除绑定</span>
       </div>
       <div class="row-box">
           <img src="../../../assets/img/id_qq.png"  alt="" class="">
           <span class="user-inf" >QQ/QQ昵称</span>
           <span class="edit-inf">绑定/解除绑定</span>
       </div>
       <updatePassword :flag="flag" @closeDialog="closeDialog"></updatePassword>
   </div>
    
        
</template>
<script>
  import updatePassword from '@/components/pages/security/updatePassword'
  export default {
    name: '',
    data () {
      return {
        flag: false
      }
    },
    methods: {
      closeDialog(){
        this.flag = !this.flag
      }
    },
    mounted (){

    },
    components:{
      updatePassword
    }
  }
</script>
<style scoped>

  .container{
      width: 100%;
      height:650px;
      box-sizing: border-box;
      overflow: hidden;
  }
  .title{
      font-size: 18px;
      color: #333333;
      margin: 55px 0 0 100px;
  }
    .row-box{
        width: auto;
        height: 28px;
        line-height: 28px;
        font-size: 14px;
        margin: 39px 0 0 100px;
    }
    .row-box img{
        vertical-align: middle;
        margin-top: -1px;
    }
    .row-box .user-inf{
        margin-left: 16px;
        color:#999999;
        display: inline-block;
        width: 280px;
        height: 28px;
        line-height: 28px;
    }
    .row-box .edit-inf{
        color:#333333;
        cursor: pointer;
    }
 
</style>

