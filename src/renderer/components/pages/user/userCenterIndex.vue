<template>
    <myDialog :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title" :flag="userCenterFlag" v-on:closeDialog="hiddenDialog">
        <el-container>
            <el-aside width="200px" class="el-aside-userCnt">
                <ul @click="activeIndex($event)">
                    <li :class="active_id == 'information' ? 'active default' : 'default'" id="information">个人信息</li>
                    <li :class="active_id == 'security' ? 'active default' : 'default'" id="security" v-show="false">账号安全</li>
                    <li :class="active_id == 'statistics' ? 'active default' : 'default'" id="statistics" v-show="false">码字统计</li>
                    <li :class="active_id == 'unit' ? 'active default' : 'default'" id="unit" v-show="false">插件箱</li>
                    <!--<li :class="active_id == 'submission' ? 'active default' : 'default'" id="submission">投稿网站信息</li>-->
                    <li :class="active_id == 'activity' ? 'active default' : 'default'" id="activity" v-show="false">橙瓜活动</li>
                </ul>
            </el-aside>
            <el-main class="el-main-userCent">
                <personalInformation v-show="active_id == 'information'"></personalInformation>
                <accountSecurity v-show="active_id == 'security'"></accountSecurity>
                <plugin v-show="active_id == 'unit'"></plugin>
                <activity v-show="active_id == 'activity'"></activity>
            </el-main>
        </el-container>

    </myDialog>



        
</template>
<script>
    import myDialog from '@/components/pages/dialog/dialog.vue'
    import personalInformation from '@/components/pages/user/personalInformation.vue'
    import accountSecurity from '@/components/pages/user/accountSecurity.vue'
    import plugin from '@/components/pages/user/plugin.vue'
    import activity from '@/components/pages/user/activity.vue'
  export default {
    name: '',
    props: {
        userCenterFlag: Boolean,
        showPluginBox: Boolean
    },
      components:{myDialog,personalInformation,accountSecurity,plugin,activity},
      data () {
          return {
              dialoginf:{
                  width:950,
                  height:680,
                  title:"个人中心"
              },
              active_id: this.showPluginBox ? 'unit':'information'
            //   active_id: 'unit'

          }
      },
    methods: {
        hiddenDialog (data){
            console.log(data)
            this.$emit("closeDialog",false)
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
<style scoped>
    .container{
        font-family: "微软雅黑";
    }
    .el-aside-userCnt {
        color: #333;
        height: 650px;
        border-right: solid 1px #edeff3;
    }
    .el-aside-userCnt ul{
        margin: 40px 0 0 56px;
    }
    .el-aside-userCnt ul li{
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
    .el-main-userCent {
        color: #333;
        height: 650px;
        padding: 0
    }



    

</style>

