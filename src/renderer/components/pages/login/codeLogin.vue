<template>
    <div class="login-wrap">
        <!--菜单栏-->
        <menuBar></menuBar>
        <div class="modal"></div>
        <div class="login-box">
            <div class="logo"><img src="../../../assets/img/img_6.png"  alt=""></div>
            <div :class="username.errFlag?'err-input-box phone':'input-box phone'">
                <input type="text" class="inputDiy" oninput = "value=value.replace(/[^\d]/g,'')" placeholder="请输入手机号" v-model.trim="formData.phone" >
                <div class="errText" v-if="username.errFlag">{{ username.message }}</div>
            </div>
            <div :class="code.errFlag?'err-input-box code':'input-box code'" >
                <input type="text" class="inputDiy"  placeholder="请输入图形验证码" v-model.trim="formData.imgCode" style="width:160px;">
                <div class="img-code" @click="changeCode">{{ codeValue}}</div>
                <div class="errText" v-if="imgcode.errFlag">{{ imgcode.message }}</div>
            </div>
            <div :class="code.errFlag?'err-input-box code':'input-box code'">
                <input type="text" class="inputDiy" oninput = "value=value.replace(/[^\d]/g,'')" placeholder="请输入短信验证码" v-model.trim="formData.code" style="width:160px;">
                <div  class="code-btn" @click="getCode()">
                    <span v-show="show">获取验证码</span>
                    <span v-show="!show">{{count}}</span>
                </div>
                <div class="errText" v-if="code.errFlag">{{ code.message }}</div>
            </div>
            <div class="check-box">
                <el-checkbox v-model="checked" style="color: #333333;font-size: 12px;" ></el-checkbox> &nbsp;自动登录
                <router-link to="/passwordLogin"><span class="passLogin">密码登录</span></router-link>
            </div>
            <button class="login-btn" @click="onSignUp()" :disabled="disabled" :style="disabled?'background-color: #a5a5a5; cursor: no-drop':''">登录/注册</button>
            <!-- <div class="third-login">
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
    import {isTel} from "../../../../js/ToPublic";
    import menuBar from '@/components/pages/menuBar/menuBar.vue'
    import {
            mapGetters,
            mapActions,
            mapState,
            mapMutations
    } from "vuex";
  const TIME_COUNT = 60;

  export default {
    name: 'Login',
    components:{ menuBar},
    data () {
        return {
            formData: {
                phone: '',
                code:"",
                imgCode:''
            },
            show: true,
            count: '',
            timer: null,
            checked:true,
            username:{errFlag:false,message:'请输入手机号'},
            code:{errFlag:false,message:'请输入验证码'},
            imgcode:{errFlag:false,message:'请输入图形验证码'},
            isget:true, //是否获取过验证码
            codeValue:'TYRJ',
            disabled: false,
            subscribe: ''
      }
    },
      computed:{
          ...mapGetters({
              SIGNUP_PHONE_REGIST_STATUS:"user/SIGNUP_PHONE_REGIST_STATUS",
              LOGIN_CODE_STATUS:'user/LOGIN_CODE_STATUS'
          })
      },
    methods: {
        ...mapActions([
            "getIsPhone"
        ]),
        ...mapActions({
            USER_CODE_SIGNIN: "user/USER_CODE_SIGNIN"
        }),
        getCode(){
            if(!this.formData.imgCode){
              this.imgcode.errFlag = true
              this.imgcode.message = '请输入图形验证码'
              return;
            }else if(this.formData.imgCode.toUpperCase() != this.codeValue.toUpperCase()){
              this.imgcode.errFlag = true
              this.imgcode.message = '请输入正确的图形验证码'
              return;
            }else{
              this.imgcode.errFlag = false
            }
            if(isTel(this.formData.phone)){
                this.getIsPhone({
                    loginName: this.formData.phone
                });
                this.isget = false
            }else{
                this.username.errFlag = true;
                this.username.message = '手机号格式不正确'
                return;
            }

            if (!this.timer) {
                this.count = TIME_COUNT;
                this.show = false;
                this.username.errFlag = false;
                this.timer = setInterval(() => {
                  if (this.count > 0 && this.count <= TIME_COUNT) {
                    this.count--;
                  } else {
                    this.show = true;
                    clearInterval(this.timer);
                    this.timer = null;
                  }
                }, 1000)
            }

        },
        onSignUp(){
            if(!this.formData.phone){
                this.username.errFlag = true;
                return;
            }else{
                if(!isTel(this.formData.phone)){
                    this.username.errFlag = true;
                    this.username.message = '手机号格式不正确'
                    return;
                }
                this.username.errFlag = false;
            }
            if(!this.formData.imgCode){
              this.imgcode.errFlag = true
              this.imgcode.message = '请输入图形验证码'
              return;
            }else if(this.formData.imgCode.toUpperCase() != this.codeValue.toUpperCase()){
              this.imgcode.errFlag = true
              this.imgcode.message = '请输入正确的图形验证码'
              return;
            }else{
              this.imgcode.errFlag = false
            }
            if(!this.formData.code){
                this.code.errFlag = true;
                return;
            }else{
                this.code.errFlag = false;

            }
            if(!this.SIGNUP_PHONE_REGIST_STATUS && !this.isget){
                this.$router.push({
                    name:'setNickname',
                    params: {
                        phone: this.formData.phone,
                        code: this.formData.code
                    }
                });
            }else{
              this.disabled = true
                var user = {
                    userTel: this.formData.phone,
                    code: this.formData.code,
                    autoLogin: this.checked
                };
                this.USER_CODE_SIGNIN(user)
            }
        },
        changeCode(){
            var result = '';
            for(var i=0;i<4;i++){
                var ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
                result+=String.fromCharCode(65+ranNum);
            }
            this.codeValue = result
        }
    },
  created() {
    let self = this;
    this.changeCode()
      this.subscribe = this.$store.subscribe((mutation, state) => {
        if(mutation.type == 'user/UP_LOGIN_PASSWORD_STATUS'){
          if(mutation.payload.status === 40101){
            self.code.errFlag = true;
            self.code.message = '用户名或密码错误'
          }else if(mutation.payload.status === 404504){
            self.code.errFlag = true;
            self.code.message = '网络异常'
          }else if(mutation.payload.status === 40110){
            self.code.errFlag = true;
            self.code.message = mutation.payload.message
          }else if(mutation.payload.status === 200){
            self.code.errFlag = false;
          }else{
            self.code.errFlag = true;
            self.code.message = '请重新登录'
          }
          self.disabled = false;
        }
      })
    },
    beforeDestroy() {
      if(this.subscribe){
        this.subscribe()
      }
    }
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
    .login-box{
        width: 350px;
        height: 530px;
        background: #FFFFFF;
        position: absolute;
        top:50%;
        left:50%;
        margin-left:-175px;
        margin-top: -265px;
        z-index: 9999;
        
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
        
    }
    
    .inputDiy{
        width: 240px;
        border: none;
        font-size: 14px;
        outline: none;
        margin-top:3px;
        
    }

    .phone{
        margin-top: 40px;
    }

    .code{
        margin-top: 35px;
        position: relative;
    }
    .code-btn{
        position: absolute;
        right: 0;top: 0;
        font-size: 12px;
        color:#999999; 
        background: none;
        cursor: pointer;
    }
    .check-box{
        width: 240px;
        height: 26px;
        margin: 0 auto;
        text-align: left;
        font-size: 12px;
        color:#333333;
        margin-top: 10px;
        margin-bottom: 40px;
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
    .third-login{
        width: 240px;
        overflow: hidden;
        font-size: 12px;
        color: #333333;
        margin: 0 auto;
        padding-top: 50px;
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
    .right-box{display: none}
    .img-code{
        width: 66px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        background-color: #d8d8d8;
        cursor: pointer;
        position: absolute;
        right:0;
        bottom:6px;
    }
</style>
