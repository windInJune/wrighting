<template>
      <myDialog :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title" v-on:closeDialog="offSubmit">
      <div class="bookNew">
          <div class="bookInfo">
            <el-form label-position="top" :model="formLabelAlign" :hide-required-asterisk="true" :rules="rules" ref="formLabel" class="bookInfo-from">
              <!-- <el-form-item>
                <div  v-if="formLabelAlign.avatar && formLabelAlign.avatar !=''">
                  <img @click="toggleShow" :src="formLabelAlign.avatar" alt="">
                </div>
                <div  v-else>
                  <img @click="toggleShow" src="../../../assets/img/book_bg.png" alt="">
                  <span>{{formLabelAlign.title.slice(0,1)}}</span>
                </div>
                 <my-upload img-format="png" img-bgc="#fff"
                    v-model="show"
                    field="avatar"
                    :width="110"
                    :height="140"
                    :noCircle="true"
                    ki="0"
                    @crop-success="cropSuccess"
                    :no-rotate="false">
                  </my-upload>
              </el-form-item> -->
              <el-form-item label="书本名称" prop="title">
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
              </el-form-item>
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
  import { mapActions, mapGetters, mapMutations } from "vuex";
  import localQuery from '@/helper/query.js';
  import myDialog from "@/components/pages/dialog/dialog";
  import { putb64 } from 'static/js/public.js'
  import myUpload from '../../../assets/vue-image-crop-upload/upload-2';
  export default {
    props: {
      book_uuid: {
        type: String,
        value: ''
      },

      //openDialogPurpose: 
      //new 新建书本
      //change 修改书本
      openDialogPurpose: {
        type: String,
        value: ''
      },

      triggerWindow: {
        type: String,
        value: ''
      }
    },
    data() {
      return {
        show: false,
        imgDataUrl: '', // the datebase64 url of created image
        formLabelAlign: {
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
          height: 680,
          title: this.openDialogPurpose === 'new' ? "新建书籍":"修改书籍信息"//"新建书本"
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
      ...mapActions(["ADD_BOOK","USER_CHANGE_BOOK","SYNC_UPDATE_BOOK_CONTENT_L1", "CREATE_NEW_BOOK_L1"]),
      ...mapMutations(['SET_BOOK_CONTENT_L1', 'ADD_BOOK_L1']),
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
      //如果speedFlag 标记为true直接进去走新建, 这是主窗口的快速创建
      onSubmit(formName, speedFlag) {
        var slef = this;
        this.$refs[formName].validate(valid => {
          if (valid || speedFlag) {
            console.log('onSubmit send ADD_BOOK');
            console.log(slef.formLabelAlign)
            // return false;
            // 如果不转换成JSON string类型，在vuex中修改目参数值，会导致vue中数据变更，从而改变界面数据
            this.newBookType = true
            // let formLabelAlign = JSON.stringify(slef.formLabelAlign);
            let formLabelAlign = {...slef.formLabelAlign, ...{goal_word_count: slef.formLabelAlign.goal_word_count*10000}}
            console.log(formLabelAlign)
            // return false;
            // if(this.book_uuid){
            if(this.openDialogPurpose === 'change'){
              localQuery.updateItemInDB({data: {title: formLabelAlign.title, goal_word_count: formLabelAlign.goal_word_count,summary: formLabelAlign.summary, book_type: formLabelAlign.book_type, is_upload: '0', client_uuid: this.book_uuid}, changedProps: ['goal_word_count', 'summary','book_type','title','is_upload'], tableName: 'book_category'}).then(() => {
                console.log('数据库修改成功1111111111111')
                let sendData =localQuery.backSendTitleData({changeList:[formLabelAlign],token: slef.GET_USET_DATA.token, book_uuid: this.book_uuid });
                // mainWindow  主窗口标志，VUEX获取书本列表数据区分。
                sendData.view = 'mainWindow'
                console.log("wow!!!!!!!!!!!!!!!!")
                console.log(sendData)
                this.SYNC_UPDATE_BOOK_CONTENT_L1(sendData).then((res) => {
                  let resData = res.data;
                  console.log(resData)
                  if(resData.result){
                    let book_detail = resData.result.book_detail
                    resData.result.view = 'mainWindow'
                    if(book_detail.code === 200){
                      localQuery.updateItemInDB({data: {version: book_detail.version, is_upload: '1', client_uuid: resData.result.book_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                      this.SET_BOOK_CONTENT_L1(resData.result)
                      slef.$message({showClose: true, message: `书籍修改成功~~`, type: 'success', customClass: 'bookWarning'})
                      this.offSubmit();
                    }
                  }else{
                      slef.$message({showClose: true, message: resData.message, type: 'warn', customClass: 'bookWarning'})
                  }
                  
                  console.log(res)
                })
              })
              // this.USER_CHANGE_BOOK({ book: formLabelAlign, uid: slef.GET_USET_DATA.uid,token: slef.GET_USET_DATA.token, book_uuid: this.book_uuid  })
            }else if(this.openDialogPurpose === 'new' || speedFlag){
              console.log("new book data: ");
              console.log(formLabelAlign);

              this.CREATE_NEW_BOOK_L1({formLabelAlign: formLabelAlign, user: slef.GET_USET_DATA.uid, token: slef.GET_USET_DATA.token, view: this.triggerWindow});

              return;

              // let aNewBook = localQuery.makeBook(formLabelAlign);
              // console.log("created new book is: ");
              // console.log(aNewBook)
              // let aNewVolume = localQuery.makeVolume({bookId: aNewBook.bookId, volumeCount: 0});
              // console.log("created new volume is: ");
              // console.log(aNewVolume);
              // let aNewChapter = localQuery.makeChapter({bookId: aNewBook.bookId, volume_uuid: aNewVolume.volume_uuid,  chapterCount: 0});

              // Promise.all([localQuery.insertBookToDB({data: aNewBook, user: slef.GET_USET_DATA.uid}), 
              //   localQuery.insertVolumeToDB({data: aNewVolume, user: slef.GET_USET_DATA.uid}),
              //   localQuery.insertChapterToDB({data: aNewChapter, user: slef.GET_USET_DATA.uid})]).then((res) => {
              //     console.log("insert book+volume+chapter done")
              //     console.log(res);

              //     //插入vuex 使其在页面上展示
              //     let bookForVuex = { ...aNewBook };

              //     console.log("book for vuex: ");
              //     console.log(bookForVuex);

              //     this.ADD_BOOK_L1(bookForVuex, 'main');

              //     //同步相关
              //     let tempArr = [aNewBook, aNewVolume, aNewChapter];
              //     let chaptersSort = [aNewChapter.chapter_uuid];
              //     let sendData = localQuery.backSendTitleData({changeList: tempArr,token: slef.GET_USET_DATA.token, book_uuid: aNewBook.book_uuid });

              //     sendData.view = 'mainWindow'

              //     sendData.resData.sorts = {
              //       volumes_sort: {
              //         volumes: [aNewVolume.volume_uuid]
              //       },
              //       chapters_sort: [{
              //         volume_uuid: aNewVolume.volume_uuid,
              //         chapters: [aNewChapter.chapter_uuid]
              //       }]
              //     }



              //     this.SYNC_UPDATE_BOOK_CONTENT_L1(sendData).then((res) => {
              //       console.log(res)
              //       let result = res.data.result
              //       if(result.book_detail.code === 200){
              //         aNewBook.version = result.book_detail.version;
              //         aNewBook.is_upload = '1';
              //         if(result.volumes.length > 0 && result.volumes[0].code === 200){

              //           aNewVolume.version = result.volumes[0].version;
              //           aNewVolume.is_upload = '1';

              //           if(result.chapters.volumes.length > 0){
              //             if(result.chapters.volumes[0].chapters.length > 0 && result.chapters.volumes[0].chapters[0].code === 200){
              //               aNewChapter.version = result.chapters.volumes[0].chapters[0].version;
              //               aNewChapter.is_upload = '1';
              //             }
              //           }
                      
              //         }

              //         let tempArr = []

              //         let updatedBook = { ...bookForVuex }
              //         updatedBook.updated_at = result.update_time;
              //         this.SET_BOOK_CONTENT_L1({book_detail: updatedBook, view: 'mainWindow', book_uuid: updatedBook.book_uuid});



              //         localQuery.updateItemInDB({data: aNewBook, changedProps: ['version', 'is_upload'], tableName: 'book_category'})
              //         localQuery.updateItemInDB({data: aNewVolume, changedProps: ['version', 'is_upload'], tableName: 'book_category'})
              //         localQuery.updateItemInDB({data: aNewChapter, changedProps: ['version', 'is_upload'], tableName: 'book_category'})

              //         this.offSubmit();
              //       }

              //       // let book_detail = resData.result.book_detail
              //       // resData.result.view = 'mainWindow'
              //       // if(book_detail.code === 200){
              //       //   localQuery.updateItemInDB({data: {version: book_detail.version, is_upload: '1', client_uuid: resData.result.book_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
              //       //   this.SET_BOOK_CONTENT_L1(resData.result)
              //       //   slef.$message({showClose: true, message: `书籍修改成功~~`, type: 'success', customClass: 'bookWarning'})
              //       //   this.offSubmit();
              //       // }

              //     })


              //   }).catch((err) => {
              //     console.log("something error occurs during insert book+volume+chapter");
              //     console.log(err)
              //   })


              // // localQuery.insertBookToDB({data: aNewBook, user: slef.GET_USET_DATA.uid}).then((res) => {
              // //   this.ADD_BOOK_L1(aNewBook, 'main');
              // //   localQuery.backSendTitleData()
              // //   this.SYNC_UPDATE_BOOK_CONTENT_L1(sendData).then((res) => {
              // //     //同步打到服务器了
              // //   }, (err) => {
              // //     //出错了
              // //   })
              // // }, (err) => {
              // //   console.log("failed to insert book to db via new book, err: ");
              // //   console.log(err)
              // // });

              // return;
              // // slef.ADD_BOOK({ book: formLabelAlign, uid: slef.GET_USET_DATA.uid,token: slef.GET_USET_DATA.token  })
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
      console.log("mounted! whatis purpose: " + this.openDialogPurpose);

      slef.subscribe = slef.$store.subscribe((mutation, state) => {
        if((mutation.type == 'GET_BOOK_MESSAGE') && (mutation.payload.status == 200)){
          console.log('书籍创建成功开始发送消息')

          console.log(mutation);
          if(mutation.payload.view === 'editorWindow'){
            slef.$electron.ipcRenderer.send('ipc-addBook', {book: mutation.payload.book, view: mutation.payload.view})
          }

          // if(this.$route.name == "editor"){
          // slef.$electron.ipcRenderer.send('ipc-updateBook', {pathName: this.$route.name});
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
