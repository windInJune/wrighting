<template>
   <div class="container" >
        <div class="activity-box">
            <div class="activity-box-text">
                <div class="activity-title">心源计划</div>
                <div class="activity-text">心源计划 是面向于基层文学作者的一个梦想支持计划，寓意是爱心公益，源源不断。掌阅与轻松筹联合发起文学领域首个对平台内全部签约作家的健康保障公益计划。</div>
            </div>
            <div class="activity-box-img">
                <img src="../../../assets/img/img_6.png"  alt="" class="">
            </div>
        </div>
       <div class="activity-box">
           <div class="activity-box-text">
               <div class="activity-title">心源计划</div>
               <div class="activity-text">心源计划 是面向于基层文
                   作者的一个梦想支持计划，寓意是爱心公益，源源不断。掌阅与轻松筹联合发起文学领域首个对平台内全部签约作家的健康保障公益计划。</div>
           </div>
           <div class="activity-box-img">
               <img src="../../../assets/img/img_6.png"  alt="" class="">
           </div>

       </div>
   </div>
    
        
</template>
<script>
  import axios from 'axios'
  export default {
    name: '',
    data () {
        return {

      }
    },
    methods: {


    },
    mounted (){

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
    .activity-box{
        width: 650px;
        height: auto;
        margin-left: 50px;
        margin-top: 50px;
        overflow: hidden;
        padding-bottom: 40px;
        border-bottom: solid 1px #edeff3;
    }
    .activity-box:last-child{
        border-bottom:none;
    }
    .activity-box-text{
        width: 286px;
        height: auto;
        float: left;
    }
  .activity-box-img{
      width: 260px;
      height: auto;
      float: right;
  }
  .activity-box-img img{
      width: 260px;
      height:160px;
      border-radius: 8px;
  }
  .activity-box-text  .activity-title{
      font-size: 18px;
      color: #333333;
  }
  .activity-box-text  .activity-text{
      font-size: 14px;
      color: #999999;
      margin-top: 12px;
      line-height: 1.5em;
  }
</style>

