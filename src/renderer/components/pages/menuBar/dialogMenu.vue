<template>
  <div class="dialogMenu">
    <div class="menuBar">
            <ul class="menuBar-top-ul">
                <li @click="close"></li>
                <li @click="max"></li>
                <li @click="min"></li>
            </ul>
            <!-- <div class="right-box" >
                <span class="nickname" v-on:mouseenter="show=!show" v-on:mouseleave="show=!show">
                    cracks_
                    <ul v-show="show">
                        <li @click="openUserDialog">个人中心</li>
                        <li>退出账号</li>
                    </ul>

                    <div class="to-top" v-show="show"></div>
                </span>
                <img src="../../../assets/img/set.png" @click="openDialog" alt="" >
            </div> -->
        </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  data() {
    return {
    };
  },
  computed: {},
  methods: {
    min(){
            this.$electron.ipcRenderer.send('window-min');
        },
        max(){
            this.$electron.ipcRenderer.send('window-max');
        },
        close(){
            this.$electron.ipcRenderer.send('window-close');
        },
        openDialog () {
            this.settingsFlag = true;
        },
        openUserDialog () {
            this.userCenterFlag = true;
        },
        hiddenDialog (data){
            this.settingsFlag = false;
        },
        userHiddenDialog (data){
            this.userCenterFlag = false;
        }
  },
  created() {},
  components: {}
};
</script>

<style scoped>

#menuBar{
    -webkit-app-region: drag;
}
    .menuBar{
        width: 100%;
        height: 30px;
        line-height: 30px;
        background-color: #e6e7e8;
        border-bottom: 1px solid #CCCCCC;
        padding-top: 1px;
        position: fixed;
        top:0;
        left:0;
        -webkit-app-region: drag;
        margin-bottom: -31px;
        z-index: 99999;
    }
    .right-box{
        float: right;
        position: relative;
    }
    .menuBar-top-ul{
       margin: 9px 0 0 15px;
        float: left ;
        -webkit-app-region: no-drag;
    }
    .menuBar-top-ul li:first-child{
        background-color: #ee4d4d;
    }

    .menuBar-top-ul li:nth-of-type(2){
             background-color: #f5a623;
    }
    .menuBar-top-ul li:nth-of-type(3){
             background-color: #1eca23;
    }
    .menuBar-top-ul li{
        float: left ;
        width: 10px;
        height: 10px;
        border-radius: 100%;
        background-color: #c5c5c4;
        margin-right: 6px;
        vertical-align: top;
        cursor:pointer;
    }
    .right-box .nickname{
        display: inline-block;
        width: 120px;
        text-align: center;
        height: 40px;
        vertical-align: top;
        font-size: 12px;
        color:#333333;
        cursor: pointer;overflow: hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        -webkit-app-region: no-drag;
    }

    .right-box img{
        margin-top: 6px;
        margin-right:18px;
        cursor: pointer;
        -webkit-app-region: no-drag;
    }

    .right-box ul{
        width:90px;
        height:64px;
        background-color: #ffffff;
        box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.13);
        position: absolute;
        left: 0px;
        top:28px;
        z-index: 999;
    }
    .right-box ul li{
        display: block;
        width: 100%;
        height:32px;
        line-height: 32px;
        text-align: center;
        font-size: 12px;
        color: #333333;
        cursor: pointer;
    }
    .right-box ul li:hover{
        background: #f8f8f8
    }
    .to-top{
        position: absolute;
        top: 60%;
        left:30%;
        width: 0;height: 0;
        border-bottom: 5px solid #fff;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
    }
</style>
