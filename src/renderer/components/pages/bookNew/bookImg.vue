<template>
      <myDialog :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title" v-on:closeDialog="offSubmit">
      <div class="bookNew">
          <div class="bookInfo">
            <el-form label-position="top" :model="formLabelAlign" :hide-required-asterisk="true" :rules="rules" ref="formLabel" class="bookInfo-from">
              <el-form-item>
                <div class="imgBox"  v-if="formLabelAlign.avatar && formLabelAlign.avatar !='' && formLabelAlign.avatar !='null'">
                  <img @click="toggleShow" :src="formLabelAlign.avatar" alt="">
                </div>
                <div class="imgBox"  v-else>
                  <img @click="toggleShow" src="../../../assets/img/book_bg.png" alt="">
                  <span @click="toggleShow">{{formLabelAlign.title.slice(0,1)}}</span>
                </div>
                 <my-upload img-format="png" img-bgc="#fff"
                    v-model="show"
                    field="avatar"
                    :borderadius="borderadius"
                    :width="110"
                    :height="140"
                    :noCircle="true"
                    ki="0"
                    @crop-success="cropSuccess"
                    :no-rotate="false">
                  </my-upload>
              </el-form-item>
                <!-- <el-form-item label="书本名称" prop="title">
                <el-input v-model="formLabelAlign.title" placeholder="请输入书本名称"></el-input>
              </el-form-item>
              <el-form-item label="目标字数(万)" prop="goal_word_count">
                <el-input :value="formLabelAlign.goal_word_count" @change="changeCount" maxlength="10" placeholder="请输入目标字数"></el-input>
              </el-form-item>
              <el-form-item label="书籍类型" prop="book_type">
                <el-input v-model="formLabelAlign.book_type" placeholder="请输入书籍类型"></el-input>
              </el-form-item>
              <el-form-item label="书籍简介" prop="summary">
                <el-input type="textarea" v-model="formLabelAlign.summary" placeholder="请输入书籍简介"></el-input>
              </el-form-item> -->
              <el-form-item class="el-form-item-right" style="margin-bottom:0">
                <el-button class="el-button-off" @click="offSubmit('formLabel')">取消</el-button>
                <el-button class="el-button-sure" @click="onSubmit('formLabel')" :disabled="newBookType">确定</el-button>
              </el-form-item>
            </el-form>
          </div>
      </div>
    </myDialog>
</template>

<script type="text/ecmascript-6">
import { mapActions, mapGetters } from "vuex";
import myDialog from "@/components/pages/dialog/dialog";
  import { putb64 } from 'static/js/public.js'
  import myUpload from '../../../assets/vue-image-crop-upload/upload-2';
export default {
  props: {
    borderadius: {
      type: Boolean,
      value: true
    },
    book_uuid: {
      type: String,
      value: ''
    }
  },
  data() {
    return {
      show: false,
			imgDataUrl: '', // the datebase64 url of created image
      formLabelAlign: {
        avatar:'',
        title: "",
        goal_word_count: "",
        book_type: "",
        summary: "",
        version: 0,
        is_deleted: 0,
        creation_status: 0
      },
      rules: {
        title: [
          { validator: this.verifyName,required: true, trigger: "blur" },
          { min: 1, max: 50, message: "书名称不能超过50字", trigger: "blur" }
        ],
        goal_word_count: [
          { validator: this.verifyNum, trigger: "blur" }
          // { validator: this.verifyMax, trigger: 'blur' },
        ],
        book_type: [
          { validator: this.verifyType, trigger: "blur" },
          { min: 0, max: 20, message: "书籍类型不能超过20字", trigger: "blur" }
        ],
        summary: [
          // {
          //   validator: this.verifyDoc,
          //   message: "请输入书本简介",
          //   trigger: "blur"
          // },
          { min: 0, max: 500, message: "最多可填写500个字", trigger: "blur" }
        ]
      },
      dialoginf: {
        width: 540,
        height: 320,
        title: "修改封面"
      },
      subscribe: '',
      newBookType: false
    };
  },
  computed: {
    ...mapGetters({
      GET_USET_DATA: 'user/GET_USET_DATA'
    })
  },
  methods: {
    ...mapActions(["ADD_BOOK","USER_CHANGE_BOOK"]),
     toggleShow() {
		    this.show = !this.show;
      },
      	cropSuccess(data, field, key) {
            let that = this;
            putb64(data).then(res => {
                  that.formLabelAlign.avatar = "http://img.chenggua.com/"+ res.data.key;
            })
		},
    verifyNum(rule, value, callback) {
      let floor = String.prototype.split.call(value,'.')[1]||[];
      if (value == "") {
        callback();
      } else if (isNaN(Number(value))) {
        callback(new Error("请输入阿拉伯正整数。"));
      } else if (value.toString().length >= 15) {
        callback(new Error("最大不能超过10位数字!"));        
      }else if (floor.length>4) {
        callback(new Error("请输入正确的书本字数/万"));
      } else {
        callback();
      }
    },
    verifyType(rule, value, callback) {
      // const reg = /^[\\u4e00-\\u9fa5]{2,4}$/
      const reg = /^[\u4e00-\u9fa5]+$/;
      if (value == "") {
        callback();
      } else if (value && !reg.test(value)) {
        callback(new Error("只能输入中文！"));
      } else {
        callback();
      }
    },
    verifyName(rule, value, callback) {
      // const reg = new RegExp(
      //   "[~@#$^&*()=|{}';'\\[\\].<>~！@#￥……&*（）——|{}【】‘；：”“。，、？]"
      // );
      const reg = new RegExp(
          "[\-a-zA-Z0-9\d .·()（）“”,，？：!！\u4e00-\u9fa5]*"
      );
      let execObj = reg.exec(value)
      if (value == "") {
        callback(new Error("请输入书本名称！"));
      } else if ((execObj === null)||( execObj[0]!== execObj.input)) {
        callback(new Error("请不要输入特殊字符"));
      } else{
        callback();
      }
    },
    // verifyMax(rule, value, callback){

    // },
    verifyDoc(rule, value, callback) {
      if (value == "") {
        callback(new Error("请输入书本简介"));
      } else {
        callback();
      }
    },
    changeCount(value) {
      if (isNaN(Number(value))) {
        this.formLabelAlign.goal_word_count = value;
      } else {
        this.formLabelAlign.goal_word_count = Number(value);
      }
    },
    onSubmit(formName) {
      var slef = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          console.log('onSubmit send ADD_BOOK');
          console.log(slef.formLabelAlign)
          // return false;
          // 如果不转换成JSON string类型，在vuex中修改目参数值，会导致vue中数据变更，从而改变界面数据
          this.newBookType = true
          let formLabelAlign = JSON.stringify(slef.formLabelAlign);
          if(this.book_uuid){
            this.USER_CHANGE_BOOK({ book: formLabelAlign, uid: slef.GET_USET_DATA.uid,token: slef.GET_USET_DATA.token, book_uuid: this.book_uuid  })
          }else{
            slef.ADD_BOOK({ book: formLabelAlign, uid: slef.GET_USET_DATA.uid,token: slef.GET_USET_DATA.token  })
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    offSubmit() {
      this.$emit("closeOpenBookNew", false);
    }
  },
  mounted() {
    let slef = this;
    slef.subscribe = slef.$store.subscribe((mutation, state) => {
      if((mutation.type == 'GET_BOOK_MESSAGE') && (mutation.payload.status == 200)){
        console.log('书籍创建成功开始发送消息')
        // if(this.$route.name == "editor"){
        slef.$electron.ipcRenderer.send('ipc-updateBook', {pathName: this.$route.name});
        // }else if(this.$route.name == "user"){
        //   slef.$electron.ipcRenderer.send('ipc-updateBook');          
        // }
        slef.offSubmit();
        this.newBookType = false;
      }else if((mutation.type == 'GET_BOOK_MESSAGE') && (mutation.payload.status != 200)){
        this.newBookType = false;
        slef.$message({showClose: true, message: `code${mutation.payload.status}: ${mutation.payload.message}`, type: 'warning', customClass: 'bookWarning'})
      }else if((mutation.type == 'USER_CHANGE_BOOK') && (mutation.payload.status == 200)){
        console.log('书籍修改成功')
        slef.$electron.ipcRenderer.send('ipc-userChangeBook', {book_uuid: mutation.payload.book_uuid, uid: slef.GET_USET_DATA.uid})
        slef.$message({showClose: true, message: `书籍修改成功~~`, type: 'success', customClass: 'bookWarning'})
        // slef.$electron.ipcRenderer.send('ipc-updateBook', {pathName: this.$route.name});
        slef.offSubmit();
        this.newBookType = false;
      }else if((mutation.type == 'USER_CHANGE_BOOK') && (mutation.payload.status != 200)){
        this.newBookType = false;
        slef.$message({showClose: true, message: `code${mutation.payload.status}: ${mutation.payload.message}`, type: 'warning', customClass: 'bookWarning'})
      }
    })
  },
  created() {
    if(this.book_uuid){
      let slef = this;
        this.$sqliteDB.queryData(`select * from book_category where client_uuid='${this.book_uuid}' and is_deleted = 0 and uid='${this.GET_USET_DATA.uid}'`)
        .then((res) => {
          if(res[0]){
            let bookItem = res[0];
            console.log(bookItem)
            let formLabelAlign = slef.formLabelAlign
            formLabelAlign.title = bookItem.title
            formLabelAlign.avatar = bookItem.avatar
            formLabelAlign.goal_word_count = parseInt(bookItem.goal_word_count/10000)
            formLabelAlign.book_type = bookItem.book_type
            formLabelAlign.summary = bookItem.summary
            formLabelAlign.version = bookItem.version
            formLabelAlign.is_deleted = bookItem.is_deleted
            formLabelAlign.creation_status = bookItem.creation_status
          }
        })
    }
  },
  beforeDestroy() {
    if(this.subscribe){
      this.subscribe()
    }
  },
  components: {
    myDialog,
	  'my-upload': myUpload
  }
};
</script>

<style scoped>
.imgBox{
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.imgBox img{
  cursor: pointer;
}
.imgBox span{
  cursor: pointer;
    display: inline-block;
    color: #f5f0f0;
    font-size: 36px;
    font-weight: bold;
    position: absolute;
    line-height: 140px;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}
.bookNew {
  width: 100%;
  height: 650px;
}
.bookInfo {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  padding: 40px 30px 0;
  overflow-y: auto;
}
.bookWarning{
  top: 50px
}
</style>
<style>
.bookInfo-from .el-form-item__label {
  color: #333333;
  font-size: 14px;
  padding-bottom: 12px;
  line-height: 20px;
}
.bookInfo .el-form-item-right {
  font-size: 14px;
  text-align: right;
}
.bookInfo .el-form-item-right .el-button-off {
  background-color: #f3f3f3;
  color: #666666;
  padding: 10px 30px;
}
.bookInfo .el-form-item-right .el-button-sure {
  background-color: #3e4347;
  color: #ffffff;
  margin-left: 20px;
  padding: 10px 30px;
}
.bookInfo .el-form-item {
  margin-bottom: 30px;
}
.bookInfo-from .el-textarea .el-textarea__inner {
  height: 180px;
  resize: none;
}
</style>
