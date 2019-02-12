<template>
    <div  id="outline" >
        <!--菜单栏-->
        <menuBar></menuBar>
        <!-- <el-tabs v-model="activeName" class="outlineIndex" style="height:100%;">
            <el-tab-pane label="文字大纲" name="textOutline" style="height:100%">
            </el-tab-pane>
            
            <el-tab-pane label="空白大纲" name="blankOutline" style="height:100%">
            </el-tab-pane>
        </el-tabs> -->
        <ul class="topCheckBox">
            <li :class="[leftCheck?'active':'']" @click="leftCheck = true">文字大纲</li>
            <li :class="[leftCheck?'':'active']" @click="leftCheck = false">空白大纲</li>
        </ul>
        <textOutline v-if="leftCheck"></textOutline>
        <blankOutline v-else></blankOutline>
    </div>
</template>
<script>
  import menuBar from '@/components/pages/menuBar/menuBar.vue'
  import textOutline from '@/components/pages/outline/textOutline.vue'
  import blankOutline from '@/components/pages/outline/blankOutline.vue'
  export default {
    name: '',
    props: {
        outlineIndexFlag: Boolean
    },
      components:{textOutline,menuBar,blankOutline},
      data () {
          return {
              dialoginf:{
                  width:950,
                  height:680,
                  title:"大纲"
              },
              active_id:'',
              activeName:'textOutline',
              leftCheck:true
          }
      },
    methods: {
        hiddenDialog (data){
            console.log(data)
            this.$emit("closeOpenOutLine",false)
        },
        activeIndex (event){
            event = window.event || event || e;
            var target = event.target || window.event.srcElement;
            // 下面是获取属性id，因为每个菜单项都有一个标识id，那么可以根据id来做不同的处理
            var id = target.getAttribute('id');
            this.active_id = id;
        }

    }
  }
</script>

<style lang="scss">
    @import url('../../../../../static/font/iconfont.css');
    .topCheckBox{
        height: 40px;
        line-height: 40px;
        position: fixed;
        top: 32px;
        left: 0;
        border-bottom:1px solid #d8d8d8;
        width: 100%;
        li{
            float: left;
            margin-left: 60px;
            text-align: center;
            position: relative;
            font-size: 14px;
            color: #999999;
            cursor: pointer;
            &.active{
                color: #000000;
            }
            &.active::before{
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                height: 4px;
                width: 100%;
                background-color: #fbbd36;
                border-radius: 4px;
            }
        }
    }
    #outline{
        height: 100%;
        box-sizing:border-box;
        overflow: hidden;
    }
    .container{
        font-family: "微软雅黑";
    }
    .outlineIndex .el-tabs--bottom .el-tabs__item.is-bottom:nth-child(2), .outlineIndex .el-tabs--bottom .el-tabs__item.is-top:nth-child(2), .outlineIndex .el-tabs--top .el-tabs__item.is-bottom:nth-child(2), .outlineIndex .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
        margin-left: 47px;
    }
    
    .el-tabs{
        box-sizing: border-box
    }
    .el-tabs__nav-wrap::after{
        height:1px;
        background-color: #e4e7ed;
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

    
    

</style>
<style>
    .outlineIndex .el-tabs__nav{
        margin: 0 60px;
    }
    .outlineIndex .el-tabs__header{
        margin: 0;
    }
    .el-tabs__content {
        height:100%;
    }
</style>

