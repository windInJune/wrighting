<template>
    <div class="container" v-show="flag">
        <div class="mask" id="mask" ></div>
        <div class="inviting-box" id="drag" >
            <div class="close" @click="close"><img src="../../../assets/img/Close.png"  alt=""></div>
            <div class="inviting-top" id="move" v-drag>绑定手机号</div>
            <div class="input-box phone"><input type="text" class="inputDiy" placeholder="请输入手机号" v-model.trim="formData.phone" ></div>
            <div class="input-box code">
                <input type="text" class="inputDiy" placeholder="请输入短信验证码" v-model.trim="formData.code" style="width:160px;">
                <div  class="code-btn" @click="getCode(formData)">
                    <span v-show="show">获取验证码</span>
                    <span v-show="!show">{{count}}s</span>
                </div>
            </div>
            <button class="subm-btn">确定</button>
            <div class="skip">跳过</div>
        </div>
    </div>
    
    
        
</template>
<script>
  const TIME_COUNT = 60;
  export default {
    name: '',
    props: {
        flag: Boolean
    },
    data () {
        return {
            formData: {
                phone: '',
                password:'',
            },
            show: true,
            count: '',
            timer: null,
        }    
    },
    // 自定义指令
    directives:{

        drag(el){
            el.onmousedown = function(e){
                var oBox =document.getElementById('mask');
                var oDrag = document.getElementById('drag');
                var move = document.getElementById('move');

                move.style.cursor = "move";
                //获取鼠标点击处分别与div左边和上边的距离：鼠标位置-div位置
                var divx = e.clientX - document.getElementById('drag').offsetLeft;
                var divy = e.clientY - document.getElementById('drag').offsetTop;
                //包含在onmousedown里，表示点击后才移动，为防止鼠标移出div，使用document.onmousemove
                document.onmousemove = function(e){
                    //获取移动后div的位置：鼠标位置-divx/divy
                    var left = e.clientX - divx;
                    var top = e.clientY - divy;
                    left<=200 && (left = 200);
                    top<=160 && (top = 160);
                    left>=(oBox.offsetWidth - oDrag.offsetWidth+200) && (left = oBox.offsetWidth - oDrag.offsetWidth +200);
                    top>=(oBox.offsetHeight - oDrag.offsetHeight +160) && (top = oBox.offsetHeight - oDrag.offsetHeight +160);
                    document.getElementById('drag').style.left=left+'px';
                    document.getElementById('drag').style.top=top+'px';
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
        getCode(formData){
            if (!this.timer) {
                this.count = TIME_COUNT;
                this.show = false;
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
        close () {
            this.$emit("closeDialog",false)
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
        height:320px;
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
    
    .skip{
        width: 300px;
        height: auto;
        margin: 0 auto;
        text-align: right;
        font-size: 14px;
        color: #999999;
        margin-top: 10px;

        cursor: pointer;
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

