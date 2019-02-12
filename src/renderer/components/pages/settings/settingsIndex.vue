<template>

    <myDialog :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title"
               :flag="settingsFlag" v-on:closeDialog="hiddenDialog">
        <el-container>
            <el-aside width="200px" class="set-el-aside">
                <ul @click="activeIndex($event)">
                    <li :class="active_id == 'conventional' ? 'active default' : 'default'" id="conventional">常规设置</li>
                    <li :class="active_id == 'typography' ? 'active default' : 'default'" id="typography">排版格式</li>
                    <li :class="active_id == 'typing' ? 'active default' : 'default'" id="typing">打字特效</li>
                    <li :class="active_id == 'saveSetting' ? 'active default' : 'default'" id="saveSetting">保存设置</li>
                </ul>
            </el-aside>
            <el-main class="set-el-main">
                <div style="margin: 50px 0 0 60px" v-show="active_id == 'conventional'">
                    <div class="checkbox-row"><el-checkbox v-model="checked" >始终在屏幕黄金分隔点处码字</el-checkbox></div>
                    <div class="checkbox-row"><el-checkbox v-model="checked" >选中文字时不显示选中字数</el-checkbox></div>
                    <div class="checkbox-row"><el-checkbox v-model="checked" >打开时默认全屏显示</el-checkbox></div>
                    <div class="checkbox-row"><el-checkbox v-model="checked" >开启版本自动更新</el-checkbox></div>
                </div>
                <div  style="margin: 50px 0 0 60px" v-show="active_id == 'typography'">
                    <div class="checkbox-row"><el-checkbox v-model="checked" >行首自动空两个字</el-checkbox></div>
                    <div class="checkbox-row"><el-checkbox v-model="checked" >段落之间自动空一行</el-checkbox></div>
                </div>
                <div style="margin: 50px 0 0 60px" v-show="active_id == 'typing'">
                    <div class="checkbox-row"><el-checkbox v-model="checked" >开启打字多彩效果</el-checkbox></div>
                </div>
                <div style="margin: 50px 0 0 60px" v-show="active_id == 'saveSetting'">
                    <div class="saveTitle">未设置时系统将会实时保存</div>
                    <div class="checkbox-row"><el-checkbox v-model="checked" >设置保存时间</el-checkbox></div>
                    <div class="interval">
                        每隔<input type="text" class="custom-text" disabled style="background: #f5f7f9"/> 分钟进行自动保存
                    </div>
                    <div class="location-box">
                        <span>文件保存位置</span>
                        <input type="text" class="location-text" disabled style="background: #f5f7f9"/>
                        <span>查看</span>
                    </div>
                </div>
            </el-main>
        </el-container>
    </myDialog>

    
    
        
</template>
<script>
    import myDialog from '@/components/pages/dialog/dialog.vue'
  export default {
    name: '',
      components:{myDialog},
      props: {
          settingsFlag: Boolean
      },
    data () {
        return {
            active_id:'conventional',
            dialoginf:{
                width:750,
                height:450,
                title:"基础设置"
            },
            checked:false

        }
    },

    methods: {

        activeIndex (event){
            event = window.event || event || e;
            var target = event.target || window.event.srcElement;
            // 下面是获取属性id，因为每个菜单项都有一个标识id，那么可以根据id来做不同的处理
            var id = target.getAttribute('id');
            this.active_id = id;

        },
        hiddenDialog (data){
            this.$emit("closeDialog",false)
        }
    }
  }
</script>
<style scoped>
    .container{
        font-family: "微软雅黑";
    }
    .set-el-aside {
        color: #333;
        height: 420px;
        border-right: solid 1px #edeff3;
    }
    .set-el-aside ul{
        margin: 40px 0 0 56px;
    }
    .set-el-aside ul li{
        font-size: 14px;
        display: block;
        width: auto;
        height: 50px;
        line-height: 50px;
        position: relative;
        cursor: pointer;
    }
    .default{
        color: #999999;
    }
    .active{
        color:#333333;
    }
    .active:after{
        content: "";
        height: 10px;
        width: 10px;
        background: #fbbd36;
        border-radius: 50%;
        display: block;
        clear: both;
        position: absolute;
        left: -18px;
        top:19px;
    }
    .set-el-main {
        color: #333;
        height: 420px;
        padding: 0;
    }




    .el-checkbox{
        color: #333333;
        font-size: 14px;
    }
    .el-checkbox__input.is-checked+.el-checkbox__label {
        color: #333333;
        font-size: 14px;
    }
    .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        background-color: #fbbd36;
        border-color: #fbbd36;
    }
    .el-checkbox__input.is-focus .el-checkbox__inner{
        border-color: #d9d9d9;
    }


    .el-checkbox__inner{
        width: 18px;
        height:18px;

    }
    .el-checkbox__inner::after {
        -webkit-box-sizing: content-box;
        box-sizing: content-box;
        content: "";
        border: 1px solid #fff;
        border-left: 0;
        border-top: 0;
        height: 9px;
        left: 6px;
        position: absolute;
        top: 2px;
    }
    .el-checkbox__inner:hover{
        border: 1px solid #d9d9d9;
    }
    .checkbox-row:first-child{
        margin-top: 0;
    }

    .checkbox-row{
        margin-top: 25px;
    }
    .saveTitle{
        color: #333333;
        font-size: 18px;
    }
    .custom-text{
        width: 45px;
        height: 20px;
        border: solid 1px #d9d9d9;
        outline: none;
        border-radius: 4px;
        text-align: center;
        margin: 0 4px 0 7px;
    }
    .location-text{
        width: 200px;
        height:28px;
        border: solid 1px #d9d9d9;
        outline: none;
        border-radius: 4px;
        margin-left: 12px;
    }
    .interval{
        font-size: 14px;
        margin-left: 30px;
        margin-top: 15px;
    }
    .location-box{
        margin-top: 50px;
    }
    .location-box span:first-child{
        font-size: 14px;
        color: #999999;
    }
    .location-box span:nth-of-type(2){
        font-size: 14px;
        color: #333333;
        cursor: pointer;
        margin-left: 10px;
    }
</style>

