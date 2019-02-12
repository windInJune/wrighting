<template>
   <div class="container" style="padding-bottom:25px">
        <div class="row-plugin" style="margin-top: 50px" v-show="false">
            <div class="plugin-name">大纲</div>
            <div class="plugin-text">多种大纲写作方式可以挑选，模板大纲分为本书大纲、情节大纲以及人物设置，可帮您理清故事脉络。</div>
            <el-switch v-model="setting.enable_syllabus" active-color="#fbbd36" :width="switchWidth" style="height: 30px"></el-switch>
        </div>
       <div class="row-plugin" >
           <div class="plugin-name">强制锁定</div>
           <div class="plugin-text">可通过设置时间、字数等条件进入强制码字模式，助您专心创作；字数、时间有上限设置，防止您误操作无法从小黑屋出来耽误其他重要事情。</div>
           <el-switch v-model="setting.enable_coercion_lock" active-color="#fbbd36" :width="switchWidth" style="height: 30px" @change="changeSwitch"></el-switch>
       </div>
       <div class="row-plugin" v-show="false">
           <div class="plugin-name">随机锁定</div>
           <div class="plugin-text">在一定字数之间随机锁定后进入强制码字页面，达到系统设置的字数后才可从小黑屋中出来。</div>
           <el-switch v-model="setting.enable_random_lock" active-color="#fbbd36" :width="switchWidth" style="height: 30px"></el-switch>
       </div>
       <div class="row-plugin" >
           <div class="plugin-name">随机起名</div>
           <div class="plugin-text">支持人名、地名、功法秘籍、以及天材地宝等名字的随机生成；并有收藏列表可收藏您喜欢的名字。</div>
           <el-switch v-model="setting.enable_random_name" active-color="#fbbd36" :width="switchWidth" style="height: 30px" @change="changeSwitch"></el-switch>
       </div>
       <div class="row-plugin" >
           <div class="plugin-name">敏感词</div>
           <div class="plugin-text">具有强大且实时更新的敏感词库，并可自定义敏感词，且有多种敏感词替换方式。写作完成后，使用敏感词插件，可对文章中的敏感词进行检测并修改，以帮助您通过章节审核。</div>
           <el-switch v-model="setting.enable_senwords" active-color="#fbbd36" :width="switchWidth" style="height: 30px" @change="changeSwitch"></el-switch>
       </div>
       <div class="row-plugin" >
           <div class="plugin-name">灵感随笔</div>
           <div class="plugin-text">每本书都可以创建灵感随笔，有了灵感随时记录，还可给不同的灵感做标签，并可以在码字编辑页查看编辑灵感。</div>
           <el-switch v-model="setting.enable_notes" active-color="#fbbd36" :width="switchWidth" style="height: 30px" @change="changeSwitch"></el-switch>
       </div>
       <div class="row-plugin" v-show="false">
           <div class="plugin-name">稿费预测</div>
           <div class="plugin-text">针对不同书籍可以设置不同的稿费，开启后可看到自己每次码字和每章的预测稿费。</div>
           <el-switch v-model="setting.ebable_forecast_pay" active-color="#fbbd36" :width="switchWidth" style="height: 30px"></el-switch>
       </div>
       <div class="row-plugin" v-show="false">
           <div class="plugin-name">校对</div>
           <div class="plugin-text">通过大纲插件可以掌握故事脉络</div>
           <el-switch v-model="setting.enable_proofread" active-color="#fbbd36" :width="switchWidth" style="height: 30px"></el-switch>
       </div>
       <div class="row-plugin" style="border-bottom: none" v-show="false">
           <div class="plugin-name">夜间模式</div>
           <div class="plugin-text">晚上写作，开启夜间模式，减少对眼睛的伤害，保护视力，安心写作。</div>
           <el-switch v-model="setting.enable_night_mode" active-color="#fbbd36" :width="switchWidth" style="height: 30px"></el-switch>
       </div>
   </div>
    
        
</template>
<script>
  import axios from 'axios'
  import {mapActions,mapMutations, mapGetters} from 'vuex'
  import localStore from 'store/dist/store.modern'
  import { ipcRenderer } from "electron";
// import { setTimeout, clearTimeout } from 'timers';
  

  export default {
    name: '',
    data () {
        return {
            setting:{
                enable_syllabus: true,      //大纲
                enable_coercion_lock: true,     //强制锁定
                enable_random_name: true,      //随机取名
                enable_notes: true,        //灵感随笔
                enable_random_lock: true,      //随机锁定
                enable_proofread: true,        //校对
                ebable_forecast_pay: true,     //稿费预测
                enable_night_mode: true,       //夜间模式
                enable_senwords: true,         //敏感词
            },
            localSetting: {},
            switchWidth:60,
            timer: null
      }
    },
    methods: {
        ...mapActions({
            PLUGIN_SETTING: 'PLUGIN_SETTING',
            UPDATE_PLUGIN_SETTING: 'UPDATE_PLUGIN_SETTING'
        }),
        changeSwitch(val){
            if(this.timer){
                clearTimeout(this.timer)
            }
            this.timer = setTimeout(() => {
                this.updateSetting()
            }, 1000);
        },
        updateSetting(){
            this.localSetting = localStore.get('setting')  //重新赋值，带上版本号
            for (let key in this.setting) {
                this.localSetting[key] = Number(this.setting[key])      //true，false转化为 1，0
            }
            localStore.set('setting',this.localSetting)
            ipcRenderer.send('ipc-pluginsSetting')
            this.UPDATE_PLUGIN_SETTING(this.localSetting)
        }
    },
    computed: {
        ...mapGetters({
            GET_PLUGIN_SETTING: 'GET_PLUGIN_SETTING',
            GET_USET_DATA: 'user/GET_USET_DATA'
        })
    },
    mounted (){
        
    },
    created() {
        this.localSetting = localStore.get('setting')
        for (let key in this.setting) {
            if (this.localSetting[key]) {
                this.setting[key] = true;
            }else{
                this.setting[key] = false;
            }

        }
        
    },
    watch:{

    },
    destroyed() {
        // var toggle = false;
        // for (let key in this.setting) {
        //     if(this.setting[key] != this.localSetting[key]){        //有修改时才更改值
        //         this.localSetting[key] = Number(this.setting[key])      //true，false转化为 1，0
                
        //         if(!toggle){
        //             toggle = true
        //         }
        //     }

        // }

        // if(toggle){     //有更改时才同步
        //     localStore.set('setting',this.localSetting)
        //     ipcRenderer.send('ipc-pluginsSetting')
        //     this.UPDATE_PLUGIN_SETTING(this.localSetting)
        // }
        
    },
  }
</script>
<style scoped>

  .container{
      width: 100%;
      /* height:650px; */
      box-sizing: border-box;
      overflow: hidden;
  }
  .row-plugin{
      width: 639px;
      height: auto;
      border-bottom: solid 1px #edeff3;
      margin: 18px 0 0 60px;
      position: relative;
  }
    .plugin-name{
        font-size: 18px;
        color: #333333;
    }
    .plugin-text{
        width: 550px;
        font-size: 12px;
        color: #999999;
        margin: 6px 0 14px 0;
        line-height: 1.4em;
    }
    .el-switch{
        position: absolute;
        right: 0;
        top:15px;
    }
  .el-switch.is-checked .el-switch__core {
      border-color: #fbbd36;
      background-color: #fbbd36;
  }
  .el-switch__core{
      height:30px;
      border-radius: 18.5px;
  }

  .el-switch__core:after {
      content: "";
      position: absolute;
      top: 2px;
      right: 5px;
      border-radius: 100%;
      transition: all .3s;
      width: 24px;
      height: 24px;
      background-color: #fff;
  }
  .el-switch.is-checked .el-switch__core::after {
      left: 100%;
      margin-left: -26px;
  }
</style>


