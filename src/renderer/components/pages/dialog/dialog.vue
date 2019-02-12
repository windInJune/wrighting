<template>
    <div class="container" v-show="true">
        <div class="mask" id="mask" ></div>
        <div class="inviting-boxs" id="drag" :style="{width:width+'px',height:height+'px'}">
            <!--<div class="close" @click="close"><img src="../../../assets/img/Close.png"  alt=""></div>-->
            <div class="inviting-top" id="move" v-drag="{width,height}" :style="{width:width+'px'}">
                <ul class="inviting-top-ul" v-if="client == 'darwin' || client == 'linux'">
                    <li @click="close"><span><i class="el-icon-close"></i></span></li>
                    <li></li>
                    <li></li>
                </ul>
                <ul v-if="client == 'win32'" class="win-top-ul">
                    <li><img @click="close" v-bind:src="imgClose" alt="" srcset=""></li>
                </ul>
                <span>{{title}}</span>
            </div>
            <slot></slot>

        </div>
    </div>



</template>
<script type="text/ecmascript-6">
  /*import {mapGetters,mapMutations} from 'vuex'*/
  export default {
    name: '',
    props: {
        width: Number,
        height:Number,
        title:String,
        flag:Boolean
    },
    data () {
        return {
            imgClose: 'static/imgs/menu_bar/closewindow.png',
            client: process.platform
        }
    },
    // 自定义指令
    directives:{

        drag(el,binding){
            el.onmousedown = function(e){
                var width = binding.value.width/2;
                var height = binding.value.height/2;
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
                    left<=width && (left = width);
                    top<=height+move.offsetHeight && (top = height+move.offsetHeight);
                    left>=(oBox.offsetWidth - oDrag.offsetWidth+width) && (left = oBox.offsetWidth - oDrag.offsetWidth +width);
                    top>=(oBox.offsetHeight - oDrag.offsetHeight +height) && (top = oBox.offsetHeight - oDrag.offsetHeight +height);
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
    computed:{
        /*...mapGetters({
            POPUPS_STATUS:"POPUPS_STATUS"
        })*/
    },
    methods: {
        /*...mapMutations({
            IS_POPUPS:"IS_POPUPS"
        }),*/
        close () {
            /*this.IS_POPUPS()*/
            console.log("dialog close triggerd")
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
    .inviting-boxs{
        /*width: 350px;
        height:350px;*/
        background-color: #ffffff;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
        position: absolute;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
        z-index: 999;
    }
    .inviting-top{
        /*width: 350px;*/
        height: 30px;
        line-height: 30px;
        box-sizing: border-box;
        border-bottom: 1px solid #d9d9d9;
        background-color: #e6e7e8;
        text-align: center;
        font-size: 12px;
        color:#333333;
    }
    .content-title{
        width: 100%;
        height: auto;
        text-align: center;
        font-size: 14px;
        color:#333333;
        margin-top: 50px;

    }


    .inviting-top-ul{
        position: absolute;
        left: 15px;
        top:10px;
    }
    .inviting-top-ul li:first-child:hover span{
        opacity: 1;
        top: 0;
    }

    .inviting-top-ul li:first-child{
        background-color: #ee4d4d;
    }
    .inviting-top-ul li:not(:last-child){
        margin-right: 4px;
    }
    .inviting-top-ul li span{
        display: inline-block;
        position: absolute;
        width: 12px;
        height: 12px;
        line-height: 12px;
        text-align: center;
        top: 5px;
        left: 0.5px;
        font-size: 10px;
        color: #3e4347;
        opacity: 0;
        transition: all .5s;
    }
    .inviting-top-ul span i{
        width: 12px;
        height: 12px;
        line-height: 12px;
        text-align: center;
        font-size: 10px;
        font-weight: bold;
    }

    .inviting-top-ul li{
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 100%;
        background-color: #c5c5c4;
        vertical-align: top;
        cursor:pointer;
        position: relative;
        overflow: hidden;
    }
    /* win */
    .win-top-ul {
        position: absolute;
        right: 15px;
    }
    .win-top-ul li{
        display: inline-block;
        width: 12px;
        height: 30px;
        margin-right: 4px;
    }
    .win-top-ul li img{
        cursor:pointer;
        vertical-align: middle;
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
</style>

