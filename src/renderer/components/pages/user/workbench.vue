<template>
    <div class="container containerWorke">
        <div class="btn-box">
            <button>同步书籍</button>
            <button>新建书籍</button>
        </div>
         <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="未完结" name="finished">
                <ul class="finished-ul">
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div><img src="../../../assets/img/group-copy.png" alt=""></div>
                        <div>最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div><img src="../../../assets/img/group-copy.png" alt=""></div>
                        <div>最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div><img src="../../../assets/img/group-copy.png" alt=""></div>
                        <div>最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div><img src="../../../assets/img/group-copy.png" alt=""></div>
                        <div>最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div><img src="../../../assets/img/group-copy.png" alt=""></div>
                        <div>最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div><img src="../../../assets/img/group-copy.png" alt=""></div>
                        <div>最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                </ul>

            </el-tab-pane>
            <el-tab-pane label="已完结" name="unfinished">
                <ul class="finished-ul">
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>
                    <li>
                        <div>九天星辰决</div>
                        <div>目前字数9999</div>
                        <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                        <div style="margin-top:5px;">最后保存时间</div>
                        <div>2018-08-14  10:30</div>
                    </li>

                </ul>

            </el-tab-pane>
        </el-tabs>
    </div>
    
    
        
</template>
<script>
  export default {
    name: '',
    data () {
        return {
            activeName:'finished'
            
      }
    },
    methods: {
        handleClick(tab, event) {
            console.log(tab, event);
        }

    }
  }
</script>
<style scoped>
    .btn-box{
        width: 100%;
        height: auto;
        margin-top: 24px;

    }
    .btn-box button{
        width: 120px;
        height: 36px;
        border-radius: 18px;
        background-color: #3e4347;
        outline: none;
        border: none;
        font-size: 14px;
        color:#ffffff;
        cursor: pointer;
    }
    .btn-box button:nth-child(1){
        margin-left: 40px;
    }
    .btn-box button:nth-child(2){
        margin-left: 20px;
    }


 .containerWorke .el-tabs--bottom .el-tabs__item.is-bottom:nth-child(2), .containerWorke .el-tabs--bottom .el-tabs__item.is-top:nth-child(2), .containerWorke .el-tabs--top .el-tabs__item.is-bottom:nth-child(2), .containerWorke .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
    margin-left: 47px;
}
    .el-tabs__content {
        width: 100%;
        margin-top: -15px;
        height:580px;
        overflow-y: scroll;
    }
    .el-tabs{
        margin-top:22px;
    }
    .el-tabs__nav-wrap::after{
        height:1px;
        background-color: #e4e7ed;
    }
    .containerWorke .el-tabs__active-bar:nth-child(1),.containerWorke .el-tabs__active-bar:nth-child(2){
         margin-left: 47px;
    }
   
    .el-tabs__active-bar{
        height: 4px;
        border-radius: 2px;
        background-color: #fbbd36;
    }
    .el-tabs__item.is-active {
        color: #333333;
        font-size: 14px;
    }
    .el-tabs__item {
        color: #999999;
    }

    .el-tabs__item:hover{

        color: #333333;
    }
    .finished-ul{
        margin: 0px 0 0 40px;

    }
    .finished-ul li{
        width:186px;
        height: 250px;
        margin-right: 25px;
        border-radius: 6px;
        background-color: #ffffff;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
        border: 1px solid rgba(0, 0, 0, 0.04);
        text-align: center;
        float: left;
        cursor: pointer;
        margin-top: 30px;
    }
    .finished-ul li:hover{
        background-color: #f8f8f8;
    }
    .finished-ul li div:nth-of-type(1){
        font-size: 16px;
        color: #333333;
        margin-top: 15px;
    }
    .finished-ul li div:nth-of-type(2){
        font-size: 12px;
        color: #666666;
        margin-top: 3px;
    }

    .finished-ul li div:nth-of-type(3){
        margin-top: 26px;

    }
    .finished-ul li div:nth-of-type(4){
        font-size: 12px;
        color:#999999;
        margin-top: 12px;

    }

    .finished-ul li div:nth-of-type(5){
        font-size: 12px;
        color:#999999;
        margin-top: 3px;

    }
</style>

