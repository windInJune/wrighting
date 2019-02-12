<template>
    <div class="container" v-if="flag">
        <div class="mask" id="masks"></div>
        <div class="inviting-box" id="drags" >
            <div class="close" @click="close"><img src="../../../assets/img/Close.png"  alt=""></div>
            <div class="inviting-top" id="moves" v-drag>修改密码</div>
            <div class="input-box phone"><input type="password" class="inputDiy"  placeholder="请输入原密码" v-model.trim="formData.password" ></div>
            <div class="input-box password"><input type="password" class="inputDiy"  placeholder="请输入新密码" v-model.trim="formData.newPassword" ></div>
            <div class="input-box password"><input type="password" class="inputDiy"  placeholder="请再次输入新密码" v-model.trim="formData.reNewPassword" ></div>
            <button class="subm-btn" @click="changePassword">确定</button>
        </div>
    </div>
    
    
        
</template>
<script>
  import axios from 'axios'
  import {editPassword } from './../../../store/API.js'
  export default {
    name: '',
    props: {
        flag: Boolean
    },
    data () {
        return {
            formData: {
                password:'',
                newPassword:'',
                reNewPassword:'',
            },
            
        }    
    },
    // 自定义指令
    directives:{

        drag(el){
            el.onmousedown = function(e){
                var oBox =document.getElementById('masks');
                var oDrag = document.getElementById('drags');
                var move = document.getElementById('moves');

                move.style.cursor = "move";
                //获取鼠标点击处分别与div左边和上边的距离：鼠标位置-div位置
                var divx = e.clientX - document.getElementById('drags').offsetLeft;
                var divy = e.clientY - document.getElementById('drags').offsetTop;
                //包含在onmousedown里，表示点击后才移动，为防止鼠标移出div，使用document.onmousemove
                document.onmousemove = function(e){
                    //获取移动后div的位置：鼠标位置-divx/divy
                    var left = e.clientX - divx;
                    var top = e.clientY - divy;
                    left<=200 && (left = 200);
                    top<=180 && (top = 180);
                    left>=(oBox.offsetWidth - oDrag.offsetWidth+200) && (left = oBox.offsetWidth - oDrag.offsetWidth +200);
                    top>=(oBox.offsetHeight - oDrag.offsetHeight +180) && (top = oBox.offsetHeight - oDrag.offsetHeight +180);
                    document.getElementById('drags').style.left=left+'px';
                    document.getElementById('drags').style.top=top+'px';
                }
                document.onmouseup = function(e){
                    document.onmousemove = null;
                    document.onmouseup = null;
                    move.style.cursor = "Default";
                }
        }
    }
},
    methods: {
                
        close () {
            this.$emit("closeDialog",false)
        },
        changePassword(){
            let _token = JSON.parse(localStorage.getItem('user')).user.user_center.token;
             if(this.formData.password != window.localStorage.getItem('yourpassword')){
                this.$message({ message: '旧密码输入错误', type: 'error'});
                return;
            }
            if(this.formData.reNewPassword !== this.formData.newPassword){
                this.$message({ message: '新密码请输入一致', type: 'error'});
                return;
            } 
            if(this.formData.reNewPassword.length < 6){
                this.$message({ message: '新密码不能少于6位数', type: 'error'});
                return;
            }
            axios.post(editPassword, {
              'token':_token,  
              'password':this.formData.reNewPassword,  
            }).then((res) => {
                console.log(res)
            })
        }   
    }
  }
</script>
<style scoped>
    .mask{
        position: absolute; 
        background-color: #666666;
        left: 0px;
        top: 0px;  
        width: 100%; 
        height: 100%;
        opacity: 0.2; 
        z-index: 999;  
    }
    .inviting-box{
        width: 400px;
        height:360px;
        background-color: #ffffff;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
        position: absolute;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
        z-index: 9999;
    }
    .inviting-top{
        width: 100%;
        height: 30px;
        line-height: 30px;
        border-bottom: 1px solid #d9d9d9;
        background-color: #e6e7e8;
        text-align: center;
        font-size: 12px;
        color:#333333;
    }
    
    
    
    .close{
        position: absolute;
        right: 5px;
        top:8px;
    }
    .close img{
        width: 15px;
        height:15px;
        cursor: pointer;
    }

    .input-box{
        width: 300px;
        height: 26px;
        border-bottom: 1px solid #D9D9D9;
        margin: 0 auto;
        
    }
    
    .inputDiy{
        width: 300px;
        border: none;
        font-size: 14px;
        outline: none;
        margin-top:3px;
        
    }

    .phone{
        font-size: 14px;
        color:#333333;
        margin-top: 50px;
    }

    .code,.newPhone,.password{
        margin-top: 35px;
        position: relative;
    }
    .code-btn{
        position: absolute;
        right: 0;top: -5px;
        font-size: 14px;
        color:#999999; 
        background: none;
        cursor: pointer;
    }
    .subm-btn{
        width: 300px;
        height:40px;
        background: #3e4347;
        border-radius: 5px;
        outline: none;
        border: none;
        margin: 50px 0 0 50px;
        font-size: 16px;
        color:#FFFFFF;

        cursor: pointer;
    }

</style>

