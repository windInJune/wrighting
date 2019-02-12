<template>
    <div class="login-wrap">
        <!--菜单栏-->
        <menuBar></menuBar>
        <div class="modal"></div>
        <div class="login-box">
            <div class="title">请设置昵称和密码</div>
            <div :class="nickname.errFlag?'err-input-box code nickname':'input-box nickname'">
                <input type="text" class="inputDiy" placeholder="请取个好听的昵称" v-model.trim="formData.nickname" >
                <div class="errText" v-if="nickname.errFlag">{{ nickname.message }}</div>
            </div>
            <div :class="password.errFlag?'err-input-box code trow':'input-box trow'">
                <input type="password" class="inputDiy" placeholder="请输入密码" v-model.trim="formData.password" >
                <div class="errText" v-if="password.errFlag">{{ password.message }}</div>
            </div>
            <div :class="twoPassword.errFlag?'err-input-box code trow':'input-box trow'">
                <input type="password" class="inputDiy" placeholder="请再次输入密码" v-model.trim="formData.twoPassword" >
                <div class="errText" v-if="twoPassword.errFlag">{{ twoPassword.message }}</div>
            </div>
            <div class="input-box trow">
                <input type="text" class="inputDiy" placeholder="请输入邀请码，非必填" v-model.trim="formData.code" >
                <div class="errText" v-if="code.errFlag">{{ code.message }}</div>
            </div>
            <button class="login-btn" @click="register()">确定</button>
        </div>
    </div>
    
</template>
<script type="text/ecmascript-6">
    import menuBar from '@/components/pages/menuBar/menuBar.vue'
    import { mapActions, mapGetters, mapMutations } from "vuex";
  export default {
    name: 'Login',
    components:{ menuBar},
    data () {
        return {
            formData: {
                nickname: '',
                password:'',
                twoPassword:'',
                code:''
            },
            subscribe: '',
            nickname:{errFlag:false,message:'请输入昵称'},
            password:{errFlag:false,message:'请输入密码'},
            twoPassword:{errFlag:false,message:'请再次输入密码'},
            code:{errFlag:false,message:'请再次输入密码'}
      }
    },
    methods: {
        ...mapActions({
            USER_REGISTER: "user/USER_REGISTER"
        }),
        register (){
            var user = {
                username: this.$route.params.phone,
                password: this.formData.password,
                nickname: this.formData.nickname,
                gender: 0,
                code: this.$route.params.code,
            };
            if(this.maxNickname()&&this.passwordVerify()) this.USER_REGISTER(user);

        },
        maxNickname() {
         const reg = /[^x00-xff]+/g;
         let value = this.formData.nickname || '';
          // 最多七个中文字=14个英文字符=14个数字
          // 取出所有的中文字
          let chin = value.match(reg)||[];
          let other = value.length - chin.join('').length;
          if(!value){
            this.nickname.errFlag = true
            this.nickname.message = '请输入昵称'
            return false
          }else if((parseInt(chin.join('').length)*2+parseInt(other))> 14) {
            this.nickname.errFlag = true
            this.nickname.message = '昵称最多只能输入7个中文！'
            return false
          }else{
            this.nickname.errFlag = false
            return true
          }
       },
       passwordVerify(){
         if(!this.formData.password){
            this.password.errFlag = true
            this.password.message = '请输入密码'
            return false
         }else if(this.formData.password.length<6){
            this.password.errFlag = true
            this.password.message = '密码不得小于六位数'
            return false
         }else{
           this.password.errFlag = false
         }
         if(!this.formData.twoPassword){
            this.twoPassword.errFlag = true
            this.twoPassword.message = '请再次输入密码'
            return false
         }else if(this.formData.twoPassword != this.formData.password){
            this.twoPassword.errFlag = true
            this.twoPassword.message = '两次密码必须要相同'
            return false
         }else{
           this.twoPassword.errFlag = false
            return true
         }
       }
    },
    mounted() {
      this.subscribe = this.$store.subscribe((mutation, state) => {
        console.log(mutation )
        if(mutation.type == 'user/UP_LOGIN_PASSWORD_STATUS'){
          if(mutation.payload.status !== 200){
            this.nickname.errFlag = true;
            this.nickname.message = mutation.payload.message
          }else{
            this.nickname.errFlag = false            
          }
        }
      })
    },
    beforeDestroy() {
      if(this.subscribe){
        this.subscribe()
      }
    },
    computed: {
      
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
    .title{
       width: 240px;
       height: auto;
       margin: 0 auto;   
       text-align: center;  
       margin-top:54px;      
       overflow: hidden;
       font-size: 18px;
       color:#333333;
    }
   
    .input-box{
         width: 240px;
         height: 26px;
        border-bottom: 1px solid #D9D9D9;
        margin: 0 auto;
        font-family: "微软雅黑";
    }
    
    .inputDiy{
        width: 240px;
        border: none;
        font-size: 13px;
        outline: none;
        margin-top:3px;
        font-family: "微软雅黑";
    }

    .nickname{
        margin-top: 60px;
    }

    .trow{
        margin-top: 35px;
        position: relative;
    }

   
    .login-btn{
        width: 240px;
        height:40px;
        background: #3e4347;
        border-radius: 5px;
        outline: none;
        border: none;
        margin: 50px 0 0 55px;
        font-size: 16px;
        color:#FFFFFF;
        cursor: pointer;
        font-family: "微软雅黑";
    }
    .right-box{display: none}
</style>

