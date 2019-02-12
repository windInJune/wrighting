<template>
    <my-dialog :width="dialoginf.width" :height="dialoginf.height" :title="dialoginf.title" v-on:closeDialog="closeDialog">
        <div class="note-warp">
            <!-- 创建随笔 -->
            <div class="create-note" v-if="noteType==1">

                <div class="step1" v-if="step == 1">
                    <p>选择书籍名称</p>
                    <el-select v-model="book_uuid2" placeholder="请选择" size="small" @change="noteSelectChange">
                        <!-- <el-option v-for="item in GET_INFO_BOOK" :key="item.id" :label="item.title" :value="item.client_uuid"></el-option> -->
                        <el-option v-for="item in bookList" :key="item.id" :label="item.title" :value="item.client_uuid"></el-option>
                    </el-select>
                    <p style="margin-top:30px;">请选择灵感标签</p>
                    <ul class="tags">
                    <li v-for="(item,key,index) in tagsColor" :key="index">
                        <a @click="activeIndex(key)" href="javascript:;" v-bind:style="{ 'background-color': item.color,'box-shadow': activeColor==key? tagsColor[key].shadow:'' }"></a>
                    </li>
                    </ul>

                    <p>请填写灵感名称</p>
                    <el-input placeholder="请输入内容" size="small" v-model="insName" maxlength="20"></el-input>
                </div>

                <div class="step2" v-else>
                    <p style="margin-bottom:12px;"><span class="ins-bage" v-bind:style="{ 'background-color': tagsColor[activeColor].color }"></span>{{insName}}</p>
                    <el-input type="textarea" resize="none" :rows="9" placeholder="请输入内容" v-model="insContent" maxlength="10000"></el-input>
                </div>

                <div class="box-footer">
                    <el-button :style="{'float':'left'}" @click="step = 1;dialoginf.title='灵感随笔'" v-show="step == 2" size="small">上一步</el-button>
                    <el-button @click="closeDialog" size="small">取 消</el-button>
                    <el-button @click="saveNote(book_uuid2)" type="primary" size="small" :disabled="disabledState()">{{step==1?'下一步':'保存'}}</el-button>
                    <!-- <button class="button-a" href="javascript:;" :style="{'float':'left'}" @click="step = 1; dialoginf.title='灵感随笔'" v-show="step == 2" size="small">上一步</button> -->
                    <!-- <button class="button-a" href="javascript:;" @click="closeDialog" size="small">取 消</button> -->
                    <!-- <button class="button-a button-black" href="javascript:;" @click="saveNote(book_uuid2)" type="primary" size="small" :disabled="disabledState()">{{step==1?'下一步':'保存'}}</button> -->
                </div>

            </div>

            <!-- 选择随笔 -->
            <div class="select-note" v-if="noteType==2">
                <div class="note-list clearfix">
                    <div v-if="GET_NOTES.NOTE_LIST.length">
                    <div class="note-box" v-for="(item,index) in GET_NOTES.NOTE_LIST" :key="item.client_uuid" v-if="!item.is_deleted">
                    <div class="note-title">
                        <span class="note-name"><i :style="{'background-color': tagsColor[item.type_color].color}"></i>{{item.title}}</span>
                    </div>
                    <div class="note-card" :style="{'background-color': tagsColor[item.type_color].subColor}" @click="selectNote(index)" @dblclick="previewNote(index)">
                        <p v-html="item.content"></p>
                        <img class="img-select" :src="imgSelected" v-if="selectImgToggle[index]">
                        <img class="img-delete" :src="imgDelete" @click.stop="deleteNote(item)">
                    </div>
                    </div>
                    </div>
                </div>

                <div class="box-footer">
                    <el-button @click="selectNoteQuit" size="small">取 消</el-button>
                    <el-button @click="selectNoteSave" type="primary" size="small">确定</el-button>
                    <!-- <button class="button-a" href="javascript:;" @click="selectNoteQuit" size="small">取 消</button> -->
                    <!-- <button class="button-a button-black" href="javascript:;" @click="selectNoteSave" type="primary" size="small">确定</button> -->
                </div>

                
            </div>

            <!-- 预览/编辑随笔 -->
            <div class="view-note" v-if="noteType==3">
                <div v-if="GET_NOTES.NOTE_LIST.length">
                    <div class="note-title">
                    <span class="note-name"><i :style="{'background-color': tagsColor[(GET_NOTES.NOTE_LIST[viewNote?noteIndex:selectIndex]).type_color].color}"></i>{{ GET_NOTES.NOTE_LIST.length ==0 ? '':GET_NOTES.NOTE_LIST[viewNote?noteIndex:selectIndex].title }}</span>
                    <span @click="isEdit = true" class="edit-note"><img :src="imgEdit" alt="" srcset="">编辑灵感随笔</span>
                    </div>
                </div>
                <el-input :disabled="!isEdit" type="textarea" resize="none" :rows="9" placeholder="请输入内容" v-model="preEditContent" maxlength="10000">{{ insList.length ==0 ? '':insList[viewNote?noteIndex:selectIndex].insContent }}</el-input>
                <div class="box-footer" >
                    <el-button @click="prevStep" :style="{'float':'left'}" size="small" v-if="!viewNote">上一步</el-button>
                    <el-button @click="editQuit" size="small">取 消</el-button>
                    <el-button v-if="isEdit" @click="editSave" type="primary" size="small" :disabled="preEditContent == '' ">确定</el-button>
                    <!-- <button class="button-a" href="javascript:;" @click="editQuit" size="small">取 消</button> -->
                    <!-- <button v-if="isEdit" class="button-a button-black" href="javascript:;" @click="editSave" type="primary" size="small" :disabled="preEditContent == '' ">确定</button> -->
                </div>
            </div>
            


        </div>
    </my-dialog>
</template>

<script>
import { Tabs, Button, Input } from "element-ui";
import myDialog from "@/components/pages/dialog/dialog";
import { mapActions, mapGetters } from "vuex";
const store = require('store/dist/store.modern');

export default {
  props: ["noteType","noteIndex","viewNote","book_uuid"],
  data() {
    return {
      dialoginf: {
        width: 540,
        height: 450,
        title: "灵感随笔"
      },
      activeName: "testing",
      imgEdit: "static/imgs/note/edit.png",
      // isEdit: true,
      hasSensWord: false,
      isChecked: false,
      sensWordsNum: "",
      customWords: "",
      
      imgSelected: "static/imgs/note/selected.png",
      imgDelete: "static/imgs/note/delete.png",
      // 颜色标签
      tagsColor: {
        darkGreen: {
          color: "#5bc377",
          subColor: "#EBFAEF",
          shadow: "0 3px 6px 0 rgba(91, 195, 119, 0.9)"
        },
        orange: {
          color: "#ff8833",
          subColor: "#FAF2EB",
          shadow: "0 3px 6px 0 rgba(255, 136, 51, 0.9)"
        },
        darkBlue: {
          color: "#598cff",
          subColor: "#F0F4FD",
          shadow: "0 3px 6px 0 rgba(89, 140, 255, 0.9)"
        },
        lightBlue: {
          color: "#62baef",
          subColor: "#f1fcfe",
          shadow: "0 3px 6px 0 rgba(98, 186, 239, 0.9)"
        },
        yellow: {
          color: "#dfb32b",
          subColor: "#FFF9E7",
          shadow: "0 3px 6px 0 rgba(223, 179, 43, 0.9)"
        },
        red: {
          color: "#fc6c7e",
          subColor: "#fff2f9",
          shadow: "0 3px 6px 0 rgba(252, 108, 126, 0.9)"
        },
        lightGreen: {
          color: "#7ac82b",
          subColor: "#f4ffeb",
          shadow: "0 3px 6px 0 rgba(122, 200, 43, 0.9)"
        }
      },
      selectImgToggle: [],
      activeColor: 'darkGreen',
      step: 1,
      insName: '',
      insContent: '',
      preEditContent: '',
      insList: [],
      selectIndex: 0,
      selectInsList: [],
      isEdit: false,
      book_uuid2: '',
      bookName: '',
      bookList: []
    };
  },
  methods: {
    ...mapActions({

      NOTE_LIST: 'NOTE_LIST',
      DELETE_NOTE: 'DELETE_NOTE',
      ADD_NOTE: 'ADD_NOTE',
      UPDATE_NOTE_CONTENT: 'UPDATE_NOTE_CONTENT',
      UPDATE_NOTE_SELECTED: 'UPDATE_NOTE_SELECTED',
      NOTE_SYNC: 'NOTE_SYNC',
      GET_CLOUD_NOTES: 'GET_CLOUD_NOTES',
      // SENSITIVE_WORDS: 'SENSITIVE_WORDS',
      // UPDATE_SENSITIVE_WORDS_CONTENT: 'UPDATE_SENSITIVE_WORDS_CONTENT',
    }),
    closeDialog() {
      if (this.noteType==3) {
        if(this.isEdit){
          this.$confirm('确认，不保存并退出？')
          .then(_ => {
            this.$emit("closeOpenNote", false);
          })
          .catch(_ => {});
        }else{
            this.$emit("closeOpenNote", false);
        }
        
      }else if(this.noteType==1) {
        this.$confirm('确认，不保存并退出？')
          .then(_ => {
            this.$emit("closeOpenNote", false);
          })
          .catch(_ => {});
      }else if(this.noteType == 2){
            this.$emit("closeOpenNote", false);
      }
      // this.$emit("closeOpenNote", false);
    },
    //创建随笔
    activeIndex(key) {
      this.activeColor = key;
    },
    noteSelectChange(k){
      // let bookList = this.GET_INFO_BOOK
      for(let i = 0;i<this.bookList.length;i++){
        if(this.bookList[i].client_uuid == k){
          this.bookName = this.bookList[i].title;
          return false
        }
      }
    },
    saveNote(bookuuid) {
      if(this.step == 1){
        this.step = 2;
        this.dialoginf.title = this.bookName
      }else{
        this.ADD_NOTE({
          client_uuid: '',
          uid: this.GET_USET_DATA.uid,
          book_uuid: bookuuid,
          title: this.insName,
          content: this.insContent,
          type_color: this.activeColor,
          is_selected: 0,
          is_deleted: 0,
          version: 0
        })

        this.$emit("closeOpenNote", false);
        this.$message({showClose: true, message: '创建成功!', type: 'success'})
      }
    },
    disabledState(){
      if (this.step == 1) {
        return this.bookName == '' || this.insName == ''
      }else{
        return this.insContent == ''
      }
    },
    //选择灵感随笔
    selectNote(index){
        this.$nextTick(() => {
          for (let i = 0; i < this.selectImgToggle.length; i++) {
            if(i===index){
              this.selectImgToggle[i] ? this.selectImgToggle.splice(index,1,0):this.selectImgToggle.splice(index,1,1)
            } 
          }
        })
    },
    previewNote(index){
      this.$emit('changeNoteType',3)
      this.selectIndex = index;
      //取消修改保留初始值
      this.preEditContent = this.GET_NOTES.NOTE_LIST[index].content
    },
    deleteNote(data){
      this.$confirm('确认删除？')
        .then(_ => {
          this.DELETE_NOTE(data)
          this.insList.splice(index,1);
          this.selectImgToggle.splice(index,1)
        })
        .catch(_ => {});
    },
    selectNoteQuit(){
      this.$emit("closeOpenNote", false);
      this.selectImgToggle = []
    },
    selectNoteSave(){
      
      for (let i = 0; i < this.selectImgToggle.length; i++) {
        if(this.selectImgToggle[i]){
          this.UPDATE_NOTE_SELECTED({is_selected: 1, client_uuid: this.GET_NOTES.NOTE_LIST[i].client_uuid})

          // this.insList[i].isSelected = true
        }else{
          this.UPDATE_NOTE_SELECTED({is_selected: 0, client_uuid: this.GET_NOTES.NOTE_LIST[i].client_uuid})

          // this.insList[i].isSelected = false
        }
      }
      this.$emit("closeOpenNote", false);
      this.selectImgToggle = []
    },
    //编辑随笔
    editQuit(){
      if(this.isEdit){
        this.$confirm('确认，不保存并退出编辑？')
          .then(_ => {
              this.isEdit = false;
              if(this.viewNote){    //取消编辑，内容重置未编辑前内容
                this.preEditContent = this.GET_NOTES.NOTE_LIST[this.noteIndex].content
              }else{
                this.preEditContent = this.GET_NOTES.NOTE_LIST[this.selectIndex].content
              }
            // this.$emit("closeOpenNote", false);

            // if(this.viewNote){
            //   this.$emit("closeOpenNote", false);
            // }else{
            //   this.$emit('changeNoteType',2);
            //   this.isEdit = false;
            // }
          })
          .catch(_ => {});
      }else{
          this.$emit("closeOpenNote", false);

        // if(this.viewNote){
        //   this.$emit("closeOpenNote", false);
        // }else{
        //   this.$emit('changeNoteType',2);
        //   this.isEdit = false;
        // }
      }
      
      
    },
    prevStep(){
      if(this.isEdit){
        this.$confirm('确认，不保存并退出编辑？')
          .then(_ => {
              this.$emit('changeNoteType',2);
              this.isEdit = false;
          })
          .catch(_ => {});
      }else{
          this.$emit('changeNoteType',2);
          this.isEdit = false;
      }
    },
    editSave(){
      var selectNote = this.GET_NOTES.NOTE_LIST[this.selectIndex];
      this.UPDATE_NOTE_CONTENT({
        book_uuid: selectNote.book_uuid,
        client_uuid: selectNote.client_uuid, 
        title: selectNote.title,
        type_color: selectNote.type_color,
        content: this.preEditContent,
        is_deleted: selectNote.is_deleted,
        version: selectNote.version
      })
      if(this.viewNote){
        // this.$emit("closeOpenNote", false);
        this.$emit('changeNoteType',3);
        this.isEdit = false;
      }else{
        this.$emit('changeNoteType',3);
        this.isEdit = false;
      }

    },



  },
  computed: {
    ...mapGetters({
      GET_INFO_BOOK: 'GET_INFO_BOOK',
      GET_NOTES: 'GET_NOTES',
      GET_USET_DATA: 'user/GET_USET_DATA',
      GET_EDITOR_BOOKS_L1: 'GET_EDITOR_BOOKS_L1',
      GET_CURRENT_BOOK_ID_L1: 'GET_CURRENT_BOOK_ID_L1'
    })


  },
  mounted() {

  },
  watch: {

  },
  created() {
    this.book_uuid2 = this.GET_CURRENT_BOOK_ID_L1
    // let bookList = this.GET_INFO_BOOK
    let bookList = store.get('book-list')
    let newBookList = []
    console.log('booklist',store.get('book-list'))
    for(let i = 0;i<bookList.length;i++){
      if(bookList[i].client_uuid == this.book_uuid2){
        this.bookName = bookList[i].title;
      }
      if(!bookList[i].is_deleted){
        newBookList.push(bookList[i])
      }
    }
    this.bookList = newBookList

    if(this.viewNote){
      this.selectIndex = this.noteIndex
      this.preEditContent = this.GET_NOTES.NOTE_LIST[this.noteIndex].content
    }
    // this.SENSITIVE_WORDS();
    for(let i=0; i<this.GET_NOTES.NOTE_LIST.length; i++){
        this.selectImgToggle.push(this.GET_NOTES.NOTE_LIST[i].is_selected)
    }
  },
  components: {
    myDialog
  }
};
</script>
<style scoped>
/* 灵感随笔 */
.note-warp{
    padding: 20px 20px 20px;
}
.tags {
  height: 60px;
}
.tags li {
  float: left;
  margin-right: 42px;
}
.tags li a {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
}
.step1 p {
  margin-bottom: 12px;
}
.box-footer {
  text-align: right;
  margin-top: 30px;
}
.button-a{
  display: inline-block;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  border: solid 1px #dddddd;
  background-color: #f3f3f3;
  color: #666666;
  padding: 0 20px;
  font-size: 12px;
  text-align: center;
}
button.button-a{
  outline: 0;
  margin: 0;
  box-sizing: content-box;
  display: inline-block;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  border: solid 1px #dddddd;
  background-color: #f3f3f3;
  color: #666666;
  padding: 0 20px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  font-family: '微软雅黑'
}
button.button-a:disabled{
    color: #fff;
    background-color: #9fa1a3;
    border-color: #9fa1a3;
    cursor: not-allowed;
}
button.button-black{
  background-color: #3e4347;
  color: #fff;
}
.ins-bage {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}

.note-list {
  /* overflow-y: scroll; */
  overflow: auto;
  margin-left: -30px;
  height: 316px;
}

.note-box {
  width: 190px;
  float: left;
  margin-left: 50px;
  margin-bottom: 20px;
}
.note-title .note-name {
  display: inline-block;
  height: 37px;
  line-height: 37px;
  font-size: 14px;
  color: #333;
  overflow: hidden;
}
.note-title .note-name i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 7px;
}
.note-card {
  width: 190px;
  height: 100px;
  box-sizing: border-box;
  color: #666666;
  padding: 8px 11px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
}
.note-card:hover .img-delete {
  display: inline-block;
}
.note-card .img-select {
  position: absolute;
  top: 0;
  right: 0;
}
.note-card .img-delete {
  position: absolute;
  bottom: 8px;
  right: 7px;
  display: none;
}
.note-card p {
  font-size: 12px;
  line-height: normal;
  word-break: break-all;
  white-space: pre-wrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}
.clearfix:after {
  display: block;
  clear: both;
  content: "";
  visibility: hidden;
  height: 0;
}
.clearfix {
  zoom: 1;
}
.edit-note {
  color: #666666;
  font-size: 12px;
  height: 37px;
  line-height: 37px;
  float: right;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.edit-note:hover {
  color: #333333;
}
.edit-note img {
  vertical-align: middle;
  margin-right: 8px;
}
</style>
