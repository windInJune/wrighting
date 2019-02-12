<template>
    <div class="login-wrap">
        <!--菜单栏-->
        <menuBar></menuBar>
        <div class="modal"></div>
        <div class="login-box">
            <!--<div class="close"><img src="../../../assets/img/Close.png"  alt=""></div>-->
            <div class="logo"><img src="../../../assets/img/img_6.png"  alt=""></div>
            <div :class="username.errFlag?'err-input-box phone':'input-box phone'">
                <input type="text" class="inputDiy" placeholder="请输入手机号/橙瓜账号" @keyup.enter="login" v-model.trim="formData.username" >
                <div class="errText" v-if="username.errFlag">{{ username.message }}</div>
            </div>
            <div  :class="password.errFlag?'err-input-box code':'input-box code'">
                <input type="password" class="inputDiy" placeholder="请输入密码" v-model.trim="formData.password" @keyup.enter="login" style="width:200px" v-if="!ifDisplay">
                <input type="text" class="inputDiy" placeholder="请输入密码" v-model.trim="formData.password" @keyup.enter="login" style="width:200px" v-else>
                <img src="../../../assets/img/biyan.png" alt="" class="imgChange" v-show="!ifDisplay" @click="ifDisplay=!ifDisplay">
                <img src="../../../assets/img/zhengyan.png" alt="" class="imgChange" v-show="ifDisplay" @click="ifDisplay=!ifDisplay">
                <div class="errText" v-if="password.errFlag">{{ password.message }}</div>
            </div>
            <div class="check-box">
                <el-checkbox v-model="checked" style="color: #333333;font-size: 12px;" ></el-checkbox> &nbsp;自动登录
                <router-link to="/codeLogin"><span class="passLogin">验证码注册</span></router-link>
            </div>
            <button class="login-btn" @click="login" :disabled="disabled" :style="disabled?'background-color: #a5a5a5;cursor: no-drop':''">登录</button>
            <div class="forget-pd" @click="changePassword()">忘记密码？</div>
            <!-- <div class="third-login2">
                <span>第三方登录</span>
                <div class="wx-qq">
                    <img src="../../../assets/img/invalid-name.png"  alt="">
                    <img src="../../../assets/img/qq.png"  alt="">
                </div>
            </div> -->
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
  import menuBar from '@/components/pages/menuBar/menuBar.vue'
  import { mapActions, mapGetters, mapMutations } from "vuex";
  import { shell } from "electron";
  export default {
    name: 'Login',
    data () {
      return {
        formData: {
          username: '',
                password:''
            },
            checked:true,
            ifDisplay:false,
            disabled: false,
            subscribe: '',
            username:{errFlag:false,message:'请输入手机号'},
            password:{errFlag:false,message:'请输入密码'}
      }
    },
    computed:{
      ...mapGetters({
        LOGIN_PASSWORD_STATUS:'user/LOGIN_PASSWORD_STATUS'
        })
    },
    watch: {
      LOGIN_PASSWORD_STATUS: function (news) {
        
      }
    },
    methods: {
      ...mapActions({
        USER_SIGNIN: "user/USER_SIGNIN",
        VERIFY_TOKEN: 'user/VERIFY_TOKEN'
        }),
      changePassword(){
        shell.openExternal('http://www.chenggua.com/password/index/index.html')
      },
      login (){
            var user = {
                userTel: this.formData.username,
                userPwd: this.formData.password,
                autoLogin: this.checked
            };
            if(!this.formData.username){
              this.username.errFlag = true;
                return;
            }else{
              this.username.errFlag = false;
            }
            if(!this.formData.password){
              this.password.errFlag = true;
                return;
            }else{
              this.password.errFlag = false;
            }
            this.disabled = true
            this.USER_SIGNIN(user).then((res) => {
              console.log(res)
            });
        }
    },
    created() {
      this.$electron.ipcRenderer.on('VERIFY_TOKEN', () => {
        this.$alert('数据获取失败，请重新登录！！', '提示', {
          confirmButtonText: '确定',
          type: 'warning'
        }).then(() => {

        })
      })
      this.subscribe = this.$store.subscribe((mutation, state) => {
        console.log(mutation )
        if(mutation.type == 'user/UP_LOGIN_PASSWORD_STATUS'){
          if(mutation.payload.status === 40101){
            this.password.errFlag = true;
            this.password.message = '用户名或密码错误'
          }else if(mutation.payload.status === 404504){
            this.password.errFlag = true;
            this.password.message = '网络异常'
          }else if(mutation.payload.status === 200){
            this.password.errFlag = false;
          }else{
            this.password.errFlag = true;
            this.password.message = '请重新登录'
          }
          this.disabled = false;
        }
      })
        //验证token自动登录
        let userData = localStorage.getItem('user');
        if(userData && (userData !={})){
            let user = JSON.parse(userData)
            if((user.user.user_center.uid)&&(user.user.user_center.token)) {
                if(user.user.user_center.autoLogin){
                    // this.VERIFY_TOKEN({token:user.user.user_center.token})
                    this.VERIFY_TOKEN(user)
                }
            }
        }

    },
    beforeDestroy() {
      if(this.subscribe){
        this.subscribe()
      }
    },
    components:{ menuBar}


  }
</script>
<style scoped>

    .login-wrap{
        width: 100%;
        height: 100%;
        background: url("../../../assets/img/img_6.png") no-repeat;
        background-size: cover;
        background-attachment: fixed;
    }

    .modal{
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        outline: 0;
        -webkit-overflow-scrolling: touch;
        background-color: rgb(0, 0, 0);  
        filter: alpha(opacity=80);  
        background-color: rgba(0, 0, 0, 0.5); 
        z-index: 998;

    }
    .login-box{
        width: 350px;
        height: 530px;
        background: #FFFFFF;
        position: absolute;
        top:50%;
        left:50%;
        margin-left:-175px;
        margin-top: -265px;
        z-index: 999;
        
    }
    .logo{
       width: 240px;
       height:66px;   
       margin: 0 auto;   
       text-align: center;  
        margin-top:56px;      
       overflow: hidden;
    }
    .logo img{
        width: 66px;
        height:66px;
        border-radius: 50%;
    }
    .input-box{
         width: 240px;
         height: 26px;
        border-bottom: 1px solid #D9D9D9;
        margin: 0 auto;
        position: relative;
    }
    .err-input-box{
        width: 240px;
        height: 26px;
        border-bottom: 1px solid #fbbd36;
        margin: 0 auto;
        position: relative;
    }
    .errText{
        width: auto;
        height: 20px;
        line-height: 20px;
        padding: 0 15px;
        border-radius: 13.5px;
        background-color: #e9ebed;
        position: absolute;
        right:0;
        top:30px;
        font-size: 11px;
        color: #666666;
    }
    .inputDiy{
        width: 240px;
        border: none;
        font-size: 14px;
        outline: none;
        margin-top:3px;
        
    }

    .phone{
        margin-top: 62px;
    }

    .code{
        margin-top: 35px;
        position: relative;
    }
    
    .check-box{
        width: 240px;
        height: 26px;
        margin: 0 auto;
        text-align: left;
        font-size: 12px;
        color:#333333;
        margin-top: 10px;
        margin-bottom: 60px;
    }
    .passLogin{
        float: right;
        color:#999999;
        cursor:pointer;
    }
    .login-btn{
        width: 240px;
        height:40px;
        background: #3e4347;
        border-radius: 5px;
        outline: none;
        border: none;
        margin: 0px 0 0 55px;
        font-size: 16px;
        color:#FFFFFF;
        font-family: "微软雅黑";
        cursor: pointer;
    }
    .third-login2{
        width: 240px;
        overflow: hidden;
        font-size: 12px;
        color: #333333;
        margin: 0 auto;
        padding-top: 5px;
    }
    .wx-qq{
        float:right;
    }
    .wx-qq img{
        margin-top: -3px;
        cursor: pointer;
    }
    .wx-qq img:last-child{
        margin-left:8px;
    }
    .imgChange{
        position: absolute;
        right:0;
        top:3px;
        cursor: pointer;
    }

    .forget-pd{
        width: 240px;
        margin: 0 auto;
        text-align: left;
        font-size: 12px;
        color:#999999;
        padding-top: 20px;
        cursor: pointer;
    }
    .close{
        position: absolute;
        right: 20px;
        top:20px;
    }
    .right-box{display: none}

</style>