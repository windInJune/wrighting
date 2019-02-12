<template>
    <div class="containerBar" id="menuBar">
        <div class="menuBar">
            <ul v-if="client == 'darwin' || client == 'linux'" class="menuBar-top-ul">
                <li @click="close"><span><i class="el-icon-close"></i></span></li>
                <li @click="min"><span><i class="el-icon-minus"></i></span></li>
                <li @click="max"><span><i class="el-icon-d-caret"></i></span></li>
            </ul>
            <ul v-if="client == 'win32'" class="win-top-ul">
                <li><i @click="min" class="iconfont icon-zuixiaohua" style="font-size:13px"></i></li>
                <li><i @click="max" :class="isMax?'iconfont icon-zuidahua1':'iconfont icon-huanyuan1'" style="font-size:13px"></i></li>
                <li><i @click="close" class="iconfont icon-guanbichuangkou1" style="font-size:13px"></i></li>
                <!-- <li><img @click="min" v-bind:src="imgMin" alt="" srcset=""></li>
                <li><img @click="max" v-bind:src="imgMax" alt="" srcset=""></li>
                <li><img @click="close" v-bind:src="imgClose" alt="" srcset=""></li> -->
            </ul>
            <div class="right-box" v-if="GET_USET_DATA.token&&GET_USET_DATA.uid&&routeName&&shouldShow">
                <div class="nickname-box">
                  <span class="nickname" v-on:mouseenter="show=!show" v-on:mouseleave="show=!show">
                      {{GET_USET_DATA.nickname}}
                      <ul v-show="show">
                          <li @click="openUserDialog">个人中心</li>
                          <li @click="userLogout">退出账号</li>
                      </ul>
                  </span>
                </div>
                
                <img src="../../../assets/img/set.png" @click="openDialog" alt="" v-if="false">
                <span class="xian" v-if="showTheme"></span>
                <div class="settings-btn iconfont icon-shezhi" v-if="showSetting" @click="callSetting"></div>
                <div class="theme-btn" v-if="showTheme">
                  <i class="iconfont icon-pifu"></i>
                  <ul class="theme-list">
                    <li v-for="(value,key,index) in themes" :key="index" @click="settingTheme(key)">
                      <span :class="'theme-'+key"></span>
                      {{value.text}}
                    </li>
                  </ul>
                </div>
            </div>
            
            
        </div>
        <!--基础设置弹窗-->
        <settingsIndex :settingsFlag="settingsFlag" v-on:closeDialog="hiddenDialog" v-if="settingsFlag"></settingsIndex>
        <!--个人中心弹窗-->
        <userCenterIndex :userCenterFlag="userCenterFlag" v-on:closeDialog="userHiddenDialog" v-if="userCenterFlag" :showPluginBox="showPluginBox"></userCenterIndex>
    </div>

</template>
<script type="text/ecmascript-6">
import settingsIndex from "@/components/pages/settings/settingsIndex.vue";
import userCenterIndex from "@/components/pages/user/userCenterIndex.vue";
import { mapGetters, mapMutations } from "vuex";
import localStore from 'store/dist/store.modern';

export default {
  name: "",
  components: { settingsIndex, userCenterIndex },
  props: ['shouldShow','showPluginBox','showTheme', 'showSetting'],
  data() {
    return {
      show: false,
      settingsFlag: false,
      userCenterFlag: false,

      client: process.platform,
      imgClose: 'static/imgs/menu_bar/closewindow.png',
      imgMax: 'static/imgs/menu_bar/max.png',
      imgMin: 'static/imgs/menu_bar/minimize.png',
      imgRecovery: 'static/imgs/menu_bar/huanyuan.png',
      isMax: true,
      themes:{
          default:{
            name: 'default',
            text: '默认模式',
            scheme: {
              '--colorPrimary': '#ffffff',
              '--colorTextDefault': '#333333',
              '--colorTextMinor': '#999999',
              '--colorBorderDefault': '#edeff3',
              '--navBg': '#e6e7e8',
              '--colorIcon': '#333333',
              '--colorBoxShadow': 'rgba(0,0,0,0.13)',
              '--colorHoverBg': '#f8f8f8',  
              '--colorOpenBookBarBg': '#f5f5f9',
              '--colorOpenBookBarFont': '#666666',
              '--colorOpenBookBarXian': '#d5d4d4',
              '--colorBookName': '#333333',
              '--colorChapter': '#999999',
              '--colorChapterBg': '#f0f0f0',
              '--colorChapterHoverBg': '#f5f7fa',
              '--scrollbarBg': 'rgba(195, 195, 195, 0.6)',
              '--scrollbarHoverBg': 'rgb(195, 195, 195)',
              '--pluginBtnBg': '#fff',
              '--editorIconActived': '#e9ebed',
              '--colorFooter': '#666666',
              '--editorBg': '#f5f5f9',
              '--btnDefaultBg': '#3e4347',
              '--btnDefaultColor': '#fff',
              '--navBarXianBg': '#cfcfcf',
              '--noteBgDarkGreen': '#EBFAEF',
              '--noteBgOrange': '#FAF2EB',
              '--noteBgDarkBlue': '#F0F4FD',
              '--noteBgLightBlue': '#f1fcfe',
              '--noteBgYellow': '#FFF9E7',
              '--noteBgRed': '#fff2f9',
              '--noteBgLightGreen': '#f4ffeb',
              '--themeListColor': '#666666',
              '--bodyBg': '#fff'
            }
          },
          night:{
            name: 'night',
            text: '夜间模式',
            scheme: {
              '--colorPrimary': '#222e3b',
              '--colorTextDefault': '#b2b2b2',
              '--colorTextMinor': 'rgba(255,255,255,0.9)',
              '--colorBorderDefault': '#2a3642',
              '--navBg': '#222e3b',
              '--colorIcon': 'rgba(255,255,255,0.9)',
              '--colorBoxShadow': 'rgba(0,0,0,0.36)',
              '--colorHoverBg': '#2e3a48',
              '--colorOpenBookBarBg': '#222e3b',
              '--colorOpenBookBarFont': 'rgba(255,255,255,0.9)',
              '--colorOpenBookBarXian': '#2a3642',
              '--colorBookName': 'rgba(255,255,255,0.9)',
              '--colorChapter': '#b2b2b2',
              '--colorChapterBg': '#2e3a48',
              '--colorChapterHoverBg': '#373f48',
              '--scrollbarBg': 'rgba(47,59,73,0.6)',
              '--scrollbarHoverBg': 'rgb(47,59,73)',
              '--pluginBtnBg': '#2e3a48',
              '--editorIconActived': '#2e3a48',
              '--colorFooter': '#b2b2b2',
              '--editorBg': '#202c36',
              '--btnDefaultBg': '#2e3a48',
              '--btnDefaultColor': 'rgba(255,255,255,0.9)',
              '--navBarXianBg': '#b2b2b2',
              '--noteBgDarkGreen': '#2e3a48',
              '--noteBgOrange': '#2e3a48',
              '--noteBgDarkBlue': '#2e3a48',
              '--noteBgLightBlue': '#2e3a48',
              '--noteBgYellow': '#2e3a48',
              '--noteBgRed': '#2e3a48',
              '--noteBgLightGreen': '#2e3a48',
              '--themeListColor': 'rgba(255,255,255,0.9)',
              '--bodyBg': '#222e3b'
            }
          },
          eyeshieldone:{
            name: 'eyeshieldone',
            text: '护眼模式',
            scheme: {
              '--colorPrimary': '#eef4e5',
              '--colorTextDefault': '#4f5d50',
              '--colorTextMinor': '#779279',
              '--colorBorderDefault': '#ceddcf',
              '--navBg': '#eef4e5',
              '--colorIcon': '#4f5d50',
              '--colorBoxShadow': 'rgba(0,0,0,0.14)',
              '--colorHoverBg': '#e2ead4',
              '--colorOpenBookBarBg': '#eef4e5',
              '--colorOpenBookBarFont': '#4f5d50',
              '--colorOpenBookBarXian': '#ceddcf',
              '--colorBookName': '#4f5d50',
              '--colorChapter': '#779279',
              '--colorChapterBg': '#e2ead4',
              '--colorChapterHoverBg': '#e7f1d5',
              '--scrollbarBg': 'rgba(189,202,185,0.6)',
              '--scrollbarHoverBg': 'rgb(189,202,185)',
              '--pluginBtnBg': '#e2ead4',
              '--editorIconActived': '#e2ead4',
              '--colorFooter': '#4f5d50',
              '--editorBg': '#e2ead4',
              '--btnDefaultBg': '#e2ead4',
              '--btnDefaultColor': '#4f5d50',
              '--navBarXianBg': '#ceddcf',
              '--noteBgDarkGreen': '#e2ead4',
              '--noteBgOrange': '#e2ead4',
              '--noteBgDarkBlue': '#e2ead4',
              '--noteBgLightBlue': '#e2ead4',
              '--noteBgYellow': '#e2ead4',
              '--noteBgRed': '#e2ead4',
              '--noteBgLightGreen': '#e2ead4',
              '--themeListColor': '#666666',
              '--bodyBg': '#eef4e5'
            }
          },
          eyeshieldtwo:{
            name: 'eyeshieldtwo',
            text: '护眼模式',
            scheme: {
              '--colorPrimary': '#dbe7d7',
              '--colorTextDefault': '#4f5d50',
              '--colorTextMinor': '#779279',
              '--colorBorderDefault': '#ceddcf',
              '--navBg': '#dbe7d7',
              '--colorIcon': '#4f5d50',
              '--colorBoxShadow': 'rgba(0,0,0,0.14)',
              '--colorHoverBg': '#ccd9c7',
              '--colorOpenBookBarBg': '#dbe7d7',
              '--colorOpenBookBarFont': '#4f5d50',
              '--colorOpenBookBarXian': '#ceddcf',
              '--colorBookName': '#4f5d50',
              '--colorChapter': '#779279',
              '--colorChapterBg': '#ccd9c7',
              '--colorChapterHoverBg': '#e7f1d5',
              '--scrollbarBg': 'rgba(189,202,185,0.6)',
              '--scrollbarHoverBg': 'rgb(189,202,185)',
              '--pluginBtnBg': '#ccd9c7',
              '--editorIconActived': '#ccd9c7',
              '--colorFooter': '#4f5d50',
              '--editorBg': '#ccd9c7',
              '--btnDefaultBg': '#ccd9c7',
              '--btnDefaultColor': '#4f5d50',
              '--navBarXianBg': '#ceddcf',
              '--noteBgDarkGreen': '#ccd9c7',
              '--noteBgOrange': '#ccd9c7',
              '--noteBgDarkBlue': '#ccd9c7',
              '--noteBgLightBlue': '#ccd9c7',
              '--noteBgYellow': '#ccd9c7',
              '--noteBgRed': '#ccd9c7',
              '--noteBgLightGreen': '#ccd9c7',
              '--themeListColor': '#666666',
              '--bodyBg': '#dbe7d7'
            }
          }
      }
    };
  },
  methods: {
    ...mapMutations({
      USER_LOGOUT: "user/USER_LOGOUT"
    }),
    min() {
      this.$electron.ipcRenderer.send("window-min");
    },
    max() {
      this.$electron.ipcRenderer.send("window-max");
    },
    close() {
      // this.$confirm('是否要关闭当前窗口', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      this.$electron.ipcRenderer.send("window-close");
        // }).catch(() => {
               
        // });
    },
    openDialog() {
      this.settingsFlag = true;
    },
    openUserDialog() {
      this.userCenterFlag = true;
    },
    hiddenDialog(data) {
      this.settingsFlag = false;
    },
    userHiddenDialog(data) {
      this.userCenterFlag = false;
      this.$emit('hidePluginBox',false)
      console.log(this.userCenterFlag);
    },
    userLogout() {
      // this.USER_LOGOUT();
      this.$electron.ipcRenderer.send("ipc-userLogout");
    },
    changeTheme(key){
      let theme = this.themes[key];
      Object.keys(theme.scheme).forEach(name => {
        let value = theme.scheme[name];
        document.documentElement.style.setProperty(name, value);
      });
    },
    settingTheme(key){
      this.changeTheme(key)

      var settingData = localStore.get('themeSetting') || {}
      settingData[this.GET_USET_DATA.uid] = {theme: key}
      localStore.set('themeSetting',settingData)
      // localStore.set('themeSetting',{theme:key})
    },
    callSetting(){
      this.$emit('show-setting-modal')      
    }
  },
  computed: {
    ...mapGetters({
      GET_USET_DATA: "user/GET_USET_DATA"
    }),
    classObject: function() {
      return {
        "menuBar-top-ul": process.platform == "darwin",
        "win-top-ul": process.platform == "win32",
        "linux-top-ul": process.platform == "linux"
      };
    },
    routeName: function () {
        return (this.$route.name == 'editor' || this.$route.name == 'user')
    }
  },
  mounted() {
    if(this.showTheme){
      var localTheme = localStore.get('themeSetting')
      if(localTheme){
        if(localTheme[this.GET_USET_DATA.uid]){
          this.changeTheme(localTheme[this.GET_USET_DATA.uid].theme)
        }
        
      }
    }
  },
  created() {
    this.$electron.ipcRenderer.send('isMaxOrUnmax')
    this.$electron.ipcRenderer.on('isUnmaximize',()=>{
      this.imgMax = 'static/imgs/menu_bar/max.png'
      this.isMax = true
    })
    this.$electron.ipcRenderer.on('isMaximize',()=>{
      this.imgMax = 'static/imgs/menu_bar/huanyuan.png'
      this.isMax = false
    })
  },
  watch: {
    showPluginBox: function(){
      if(this.showPluginBox){
        this.userCenterFlag = true;
      }
    }
  }
};
</script>
<style scoped>
.containerBar {
  overflow: hidden;
}
#menuBar {
  -webkit-app-region: drag;
}
.menuBar {
  width: 100%;
  height: 32px;
  line-height: 32px;
  background-color: var(--navBg);
  border-bottom: 1px solid var(--colorBorderDefault);
  box-sizing: border-box;
  /* padding-top: 1px; */
  position: fixed;
  top: 0;
  left: 0;
  -webkit-app-region: drag;
  margin-bottom: -31px;
  z-index: 999;
}
.right-box {
  float: right;
  margin-right: 25px;
  color: var(--colorTextDefault)
}
/* Mac */
.menuBar-top-ul {
  margin: 10px 0 0 15px;
  float: left;
  -webkit-app-region: no-drag;
}
.menuBar-top-ul li:first-child {
  background-color: var(--colorMacBarClose);
  margin-right: 6px;
}
.menuBar-top-ul:hover span{
    opacity: 1;
    top: 0;
}

.menuBar-top-ul li:nth-of-type(2) {
  background-color: var(--colorMacBarMax);
  margin-right: 6px;
}

.menuBar-top-ul li:nth-of-type(3) {
  background-color: var(--colorMacBarMin);
}
.menuBar-top-ul li span{
    display: inline-block;
    position: absolute;
    width: 12px;
    height: 12px;
    line-height: 12px;
    text-align: center;
    font-size: 10px;
    top: 5px;
    left: 0;
    color: var(--colorMacBarText);
    opacity: 0;
    transition: all .5s;
}
.menuBar-top-ul span i{
    width: 12px;
    height: 12px;
    line-height: 12px;
    text-align: center;
    font-size: 10px;
    font-weight: bold;
}

.menuBar-top-ul li {
  float: left;
  width: 12px;
  height: 12px;
  border-radius: 100%;
  /* background-color: #c5c5c4; */
  vertical-align: top;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
/* Windows */
.win-top-ul {
  /* margin: 9px 0 0 15px; */
  height: 32px;
  float: right;
  -webkit-app-region: no-drag;
}
.win-top-ul li:first-child {
  /* background-color: #ee4d4d; */
}

.win-top-ul li:nth-of-type(2) {
  /* background-color: #f5a623; */
}
.win-top-ul li:nth-of-type(3) {
  /* background-color: #1eca23; */
}
.win-top-ul li {
  float: left;
  width: 12px;
  height: 32px;
  font-size: 0;
  /* border-radius: 100%; */
  /* background-color: #c5c5c4; */
  margin-right: 14px;
  vertical-align: top;
}
.win-top-ul li img{
    display: inline;
    vertical-align: middle;
    cursor: pointer;
}
.win-top-ul li .iconfont{
  display: inline;
  vertical-align: middle;
  cursor: pointer;
  color: var(--colorIcon);
}

.right-box .nickname-box{
  display: inline-block;
  position: relative;
}
.right-box .nickname {
  display: inline-block;
  max-width: 120px;
  min-width: 32px;
  text-align: center;
  height: 32px;
  vertical-align: top;
  font-size: 12px;
  /* color: var(--colorTextDefault); */
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-app-region: no-drag;
}

.right-box .xian{
  display: inline-block;
  width: 1px;
  height: 12px;
  border-radius: 0.5px;
  background-color: var(--navBarXianBg);
  margin: 0 14px;
}
.right-box .theme-btn{
  display: inline-block;
  position: relative;
  -webkit-app-region: no-drag;
}


.right-box .settings-btn{
  display: inline-block;
  position: relative;
  -webkit-app-region: no-drag;
  margin-right: 10px;
  cursor: pointer;
}

.right-box .theme-btn:hover .theme-list{
  display: block;
}
.right-box .theme-btn .iconfont{
  color: var(--colorTextDefault);
  cursor: pointer;
}
.right-box .theme-btn ul.theme-list{
  width: 150px;
  left: inherit;
  right: -16px;
  margin-left: 0;
  display: none;
}
.right-box .theme-btn ul.theme-list li{
  height: 44px;
  display: flex;
  align-items: center;
  font-size: 12px;
  justify-content: center;
  color: var(--themeListColor);
}
.right-box .theme-btn ul.theme-list li span{
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  margin-right: 14px;
}
.right-box .theme-btn ul.theme-list li span.theme-default{
  background-color: var(--themeColorDefault);
}
.right-box .theme-btn ul.theme-list li span.theme-night{
  background-color: var(--themeColorNight);
}
.right-box .theme-btn ul.theme-list li span.theme-eyeshieldone{
  background-color: var(--themeColorEyeshieldOne);
}
.right-box .theme-btn ul.theme-list li span.theme-eyeshieldtwo{
  background-color: var(--themeColorEyeshieldTwo);
}

.right-box img {
  margin-top: 6px;
  margin-right: 18px;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.right-box ul {
  width: 90px;
  /* height: 64px; */
  background-color: var(--colorUserDropDownListBg);
  box-shadow: 0 0 6px 0 var(--colorBoxShadow);
  position: absolute;
  left: 50%;
  top: 30px;
  margin-left: -45px;
  z-index: 999;
}
.right-box ul li {
  display: block;
  width: 100%;
  height: 32px;
  line-height: 32px;
  text-align: center;
  font-size: 12px;
  /* color: #333333; */
  cursor: pointer;
}
.right-box ul li:hover {
  background: var(--colorHoverBg);
}
.right-box ul::after{
  content: "";
  position: absolute;
  top: -5px;
  left: 50%;
  margin-left: -5px;
  width: 0;
  height: 0;
  border-bottom: 5px solid var(--colorUserDropDownListBg);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
}
.right-box ul.theme-list::after{
  left: 84%;
}

</style>

