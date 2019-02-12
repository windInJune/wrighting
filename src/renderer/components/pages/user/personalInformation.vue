<template>
   <div class="container personalInformation" style="padding-left: 60px;">
     <el-form label-position="left" ref="userFrom" :rules="userRules" :model="userData" label-width="130px">
      
      <div class="avatar">
          <span>更换头像</span>
          <div class="avatar-img" @click="toggleShow">
               <img :src="userData.avatar||defaultBigAvatar" :onerror="errorBigImg"  alt="" class="" >
                <!-- <input type="file" id="img-file-input" ref="imgInputFile" @change="changHeadImg" > -->
               <div class="vip-box"><img src="../../../assets/img/vip.png"  alt=""></div>
           </div>
       </div>
       <my-upload img-format="png" img-bgc="#fff"
				v-model="show"
				field="avatar"
                :width="100"
                :height="100"
                :noSquare="true"
				ki="0"
				@crop-success="cropSuccess"
				:no-rotate="false">
       </my-upload>
       <div class="space-box" >
               <span>云同步空间</span>
               <el-progress :percentage="progress" :show-text="false"  :stroke-width="8" color="#fbbd36"></el-progress>
               <span>{{userMb}}MB/1GB</span>
       </div>
       <el-form-item class="input-box" label="昵称" prop="nickname">
                <!-- <span>昵称</span> -->
                <el-input v-model="userData.nickname"  size="small" style="width:170px"></el-input>
       </el-form-item>
       <el-form-item class="input-box" label="性别">
                <!-- <span>性别</span> -->
                <!-- <el-input v-model="GET_USET_DATA.gender"  size="small" style="width:170px;margin-left: 72px;" ></el-input> -->
                <el-select v-model="userData.gender" style="width:170px" size="small" @change="genderChange">
                    <el-option
                    v-for="item in genders"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value" >
                    </el-option>
                </el-select>
       </el-form-item>
       <el-form-item class="input-box" label="生日" v-if="false">
                <!-- <span style="float:left">生日</span> -->
                <el-select v-model="userData.year" style="width:100px;float:left;margin-right:30px" size="small" @change="loadDay">
                    <el-option
                    v-for="item in years"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value" >
                    </el-option>
                </el-select>
                <el-select v-model="userData.month" style="width:100px;float:left;margin-right:30px" size="small" @change="loadDay">
                    <el-option
                    v-for="item in month"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value" >
                    </el-option>
                </el-select>
                <el-select v-model="userData.day" style="width:100px;float:left" size="small">
                    <el-option
                    v-for="item in day"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value" >
                    </el-option>
                </el-select>
       </el-form-item>
       <el-form-item class="input-box" label="地区" v-if="false">
                <!-- <span style="float:left">地区</span> -->
                <el-select
                       v-model="sheng"
                       @change="choseProvince"
                       placeholder="省级地区" style="width:100px;float:left;margin-right:30px" size="small">
                   <el-option
                           v-for="item in province"
                           :key="item.id"
                           :label="item.value"
                           :value="item.id">
                   </el-option>
               </el-select>
               <el-select
                       v-model="shi"
                       @change="choseCity"
                       placeholder="市级地区" style="width:100px;margin-right:30px;float:left" size="small">
                   <el-option
                           v-for="item in shi1"
                           :key="item.id"
                           :label="item.value"
                           :value="item.id">
                   </el-option>
               </el-select>
               <el-select
                       v-model="qu"
                       @change="choseBlock"
                       placeholder="区级地区" style="width:100px;float:left" size="small">
                   <el-option
                           v-for="item in qu1"
                           :key="item.id"
                           :label="item.value"
                           :value="item.id">
                   </el-option>
               </el-select>
       </el-form-item>
       <el-form-item class="input-box user-signature" label="个性签名" prop="signature">
           <!-- <span style="float:left">个性签名</span> -->
           <el-input
                   type="textarea"
                   :rows="5"
                   placeholder="请输入您的个性签名"
                   v-model="userData.signature" style="width:360px; height: 130px;float:left;font-family: '微软雅黑'" resize="none">
           </el-input>
       </el-form-item>
       <div style="clear: both;margin:115px 0 0 320px"><button type="button" class="login-btn" @click="onSubmit('userFrom')">保存</button></div>
     </el-form>
   </div>
    
        
</template>
<script>
  import axios from 'axios'
  import { mapGetters, mapActions } from 'vuex'
  import { putb64 } from 'static/js/public.js'
  import myUpload from '../../../assets/vue-image-crop-upload/upload-2';
  export default {
    name: '',
    data () {
        return {
            show: false,
			imgDataUrl: '', // the datebase64 url of created image
            userData: {
                avatar: '',
                nickname:'cracks_',
                gender: '',
                signature:'1',
                year:'2014',
                month:'2',
                day:'10',
                phone:""
            },
            genders: [{
              value: 0,
              label: '女'
            }, {
              value: 1,
              label: '男'
            }, {
              value: 2,
              label: '未知'
            }],
            userRules:{
              nickname: [
                { validator: this.verifNickname, trigger: "blur" },
                { validator: this.maxNickname, trigger: "blur" }
              ],
              signature: [
                { min: 0, max: 200, message: "个性签名不能超过200字", trigger: "blur" }
              ]
            },
            progress: 0,
            userMb: 0,
            years: [],
            month: [],
            day:[],
            activeName:'finished',
            textarea:'',
            mapJson:'../static/json/map.json',
            province:'',
            sheng: '',
            shi: '',
            shi1: [],
            qu: '',
            qu1: [],
            city:'',
            block:'',
            subscribe: '',
            defaultBigAvatar: "static/imgs/user/touxiang_big.png",
            errorBigImg: 'this.src="' + require('../../../../../static/imgs/user/touxiang_big.png') + '"',
      }
    },
    components: {
	    'my-upload': myUpload
	},
    methods: {
      ...mapActions({
        USER_CHANGE_DATA: 'user/USER_CHANGE_DATA'
       }),
       	cropSuccess(data, field, key) {
            let that = this;
            putb64(data).then(res => {
                that.userData.avatar = "http://img.chenggua.com/"+ res.data.key;
            })
		},
        toggleShow() {
		    this.show = !this.show;
	    },
        handleClick(tab, event) {
            console.log(tab, event);
        },
        loadDay () {
            var year=this.userData.year; //表示需要查找的年份
            var month=this.userData.month;//表示需要查找的月份
            var curMonthDays=new Date(year,month,0).getDate(); //0表示3月的第0天，上月的最后一天,月份从0开始记数
            this.day = [];
            for(var i=1;i<=curMonthDays;i++){
                this.day.push({value:i,label:i})
            }
        },
        genderChange(e){
          this.userData.gender = e
        },
        // 加载china地点数据，三级
        getCityData:function(){
            var that = this;
            axios.get(this.mapJson).then(function(response){
                if (response.status==200) {
                    var data = response.data
                    that.province = []
                    that.city = []
                    that.block = []
                    // 省市区数据分类
                    for (var item in data) {
                        if (item.match(/0000$/)) {//省
                            that.province.push({id: item, value: data[item], children: []})
                        } else if (item.match(/00$/)) {//市
                            that.city.push({id: item, value: data[item], children: []})
                        } else {//区
                            that.block.push({id: item, value: data[item]})
                        }
                    }
                    // 分类市级
                    for (var index in that.province) {
                        for (var index1 in that.city) {
                            if (that.province[index].id.slice(0, 2) === that.city[index1].id.slice(0, 2)) {
                                that.province[index].children.push(that.city[index1])
                            }
                        }
                    }
                    // 分类区级
                    for(var item1 in that.city) {
                        for(var item2 in that.block) {
                            if (that.block[item2].id.slice(0, 4) === that.city[item1].id.slice(0, 4)) {
                                that.city[item1].children.push(that.block[item2])
                            }
                        }
                    }

                }
                else{
                    console.log(response.status)
                }
            }).catch(function(error){console.log(typeof+ error)})
        },
        // 选省
        choseProvince:function(e) {
            console.log(e)
            for (var index2 in this.province) {
                if (e === this.province[index2].id) {
                    this.shi1 = this.province[index2].children
                    this.shi = this.province[index2].children[0].value
                    this.qu1 =this.province[index2].children[0].children
                    this.qu = this.province[index2].children[0].children[0].value
                    this.E = this.qu1[0].id
                }
            }
        },
        // 选市
        choseCity:function(e) {
            for (var index3 in this.city) {
                if (e === this.city[index3].id) {
                    this.qu1 = this.city[index3].children
                    this.qu = this.city[index3].children[0].value
                    this.E = this.qu1[0].id
                    // console.log(this.E)
                }
            }
        },
        // 选区
        choseBlock:function(e) {
            this.E=e;
            // console.log(this.E)
        },
        verifNickname: (rule, value, callback) => {
          const reg = new RegExp(
            "[`~@#$^&*()=|{}';'\\[\\].<>/~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"
          );
          if (value == "") {
            callback(new Error("请输入昵称名称！"));
          } else if (reg.test(value)) {
            callback(new Error("请不要输入特殊字符"));
          } else{
            callback();
          }
       },
       maxNickname:(rule, value, callback) => {
         const reg = /[^x00-xff]+/g;
          // 最多七个中文字=14个英文字符=14个数字
          // 取出所有的中文字
          let chin = value.match(reg)||[];
          let other = value.length - chin.join('').length;
          if ((parseInt(chin.join('').length)*2+parseInt(other))> 14) {
            callback(new Error("昵称最多只能输入7个中文！"));
          } else{
            callback();
          }
       },
       onSubmit: function(formName) {
          var slef = this;
          this.$refs[formName].validate(valid => {
            if (valid) {
              let sendData = {
                token: slef.GET_USET_DATA.token,
                // nickname: slef.userData.nickname,
                'profile': {
                  'avatar':slef.userData.avatar,
                  'gender': slef.userData.gender,
                  'signature': slef.userData.signature
                }
              }
              if(slef.userData.nickname != slef.GET_USET_DATA.nickname){
                sendData.profile['nickname'] = slef.userData.nickname
              }
              slef.USER_CHANGE_DATA(sendData).then(res => {
                  slef.subscribe = slef.$store.subscribe((mutation, state) => {
                    if(mutation.type == 'user/USER_CHANGE_DATA'){
                      if(mutation.payload.status){
                        this.$message({ message: mutation.payload.message, type: 'warning' ,customClass: 'personalInformationWarning'});
                      }else{
                        this.$message({ message: '修改成功', type: 'success' ,customClass: 'personalInformationWarning'});
                      }

                    }
                  })
              // slef.ADD_BOOK({ book: slef.formLabelAlign, uid: slef.GET_USET_DATA.uid,token: slef.GET_USET_DATA.token  })
                // .then(res => {
                //   slef.subscribe = slef.$store.subscribe((mutation, state) => {
                    
                //   })
                  // slef.offSubmit();
                });
            } else {
              console.log("error submit!!");
              return false;
            }
          });
       }
    },
    computed: {
      ...mapGetters({
        GET_USET_DATA: 'user/GET_USET_DATA'
      })
    },
    created(){
      this.userData.avatar = this.GET_USET_DATA.avatar
      this.userData.signature = this.GET_USET_DATA.signature
      this.userData.gender = parseInt(this.GET_USET_DATA.gender)
      this.userData.phone = this.GET_USET_DATA.phone
      this.userData.nickname = this.GET_USET_DATA.nickname
      this.$sqliteDB.queryData(`select * from chapter_content where is_deleted = 0 and uid='${this.GET_USET_DATA.uid}'`).then((res) => {
        let chapterList = res.length;
        if(chapterList){
          let mb = chapterList*100/1024
          this.userMb = mb.toFixed(2)
          this.progress = Number((parseInt(chapterList)*100)/1048576)
        }
      })
    },
    mounted (){
        var date = new Date();
        var myyear = date.getFullYear();
        for(var i=1940;i<=myyear;i++){
            this.years.push({value:i,label:i})
        }
        for(var i=1;i<=12;i++){
            this.month.push({value:i,label:i})
        }
        this.loadDay()
        this.getCityData()
    },
    beforeDestroy() {
    if(this.subscribe){
      this.subscribe()
    }
  },
  }
</script>
<style>
.personalInformation .el-form .el-form-item__label{
  font-size: 14px;
  color: #999
}
.personalInformationWarning{
  top: 80px
}

</style>

<style scoped>
    .el-progress__text{
        display: none
    }
  .container{
      width: 100%;
      height:650px;

      box-sizing: border-box;
      overflow: hidden;
  }
    .login-btn{

        width: 88px;
        height:36px;
        background: #3e4347;
        border-radius: 5px;
        outline: none;
        border: none;
        margin: 0px 0 0 55px;
        font-size: 14px;
        color:#FFFFFF;
        cursor: pointer;
        font-family: "微软雅黑";

    }
  .avatar{
      width: 100%;
      height: 72px;
      line-height: 72px;
      margin-top: 30px;
      color: #999999;
  }
  .avatar span{
      color: #999;
      font-size: 14px;
      float: left;
      cursor: pointer;
  }
  .avatar-img{
      width: 72px;
      height: 72px;
      float: left;
      margin-left: 42px;
      position: relative;
      cursor: pointer;
  }
  .avatar-img > img:nth-child(1){
        width: 72px;
        height:72px;
        border-radius: 50%;
  }
  .vip-box{
        width: 22px;
        height: 22px;
        background: #ffffff;
        position: absolute;
        right: -5px;
        top:45px;
        line-height: normal;
        border-radius: 50%;
  }
  .vip-box img{
      width: 18px;
      height:18px;
      margin: 2px 0 0 2px;
  }
  .space-box{
      clear: both;
      font-size: 14px;
      color: #999999;
      margin-top: 35px;
      overflow: hidden;
  }
  .space-box span{
      float: left;
  }
  .space-box span:nth-of-type(2){
      float: left;
      margin-left: 15px;
      margin-top:2px
  }
  .el-progress{
      width: 360px;
      float: left;
      margin: 5px 0 0 30px;
  }
  .input-box{
      /* height:30px; */
      line-height: 30px;
      margin-top: 30px;
  }
  .input-box span{
      font-size: 14px;
      color: #999999;
  }
  #img-file-input{
      position: absolute;
      left: 0;
      top:0;
      width:100%;
      height: 100%;
      opacity: 0;
  }

</style>
