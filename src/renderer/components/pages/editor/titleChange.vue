<template>
  <div class="custom-tree-node-content">
    <!-- <span v-if="data.type == 2" v-loading='true' element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0)"></span> -->
    <span class="bookTreeList" v-if="data.type == 2">
      <!-- <i :class="node.expanded?'iconfont icon-folderopen':'iconfont icon-folder'" style="font-size:12px;"></i> -->
      <i :class="node.expanded? (treeload ? 'iconfont el-icon-loading': 'iconfont icon-folderopen'):'iconfont icon-folder'" style="font-size:12px;"></i>
      <!-- <img :src="node.expanded?treeImg.volume:treeImg.closeVolume"> -->
    </span>
    <span class="bookTreeList" v-else>
      <i class="iconfont icon-chapter" style="font-size:12px;"></i>
      <!-- <img :src="treeImg.chapter"> -->
    </span>
    <div  class="custom-tree-node-title">
      <div class="ellipsis" :title="data.title" v-if="changeType" @dblclick="changeTitle($event, data)">
        {{ data.title }}
      </div>
      <input :value="title" @input="title = $event.target.value" v-on:keyup.enter="blurChange($event, data)" v-focus @blur="blurChange($event, data)" class="custom-tree-node-title-input"  :style="changeError?'border-color: #e4393c;':''" typet="text" title="请输入只包含中文、英文、阿拉伯数字、逗号、问号、冒号、感叹号的字符"  v-else/>
    </div>
    <span v-if="data.hasConflict"><i class="iconfont icon-jinggao"></i></span>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapActions, mapGetters, mapMutations } from 'vuex'
import localQuery from '@/helper/query.js';
export default {
  props:{
    data:{
      type: Object
    },
    node:{
      type: Object
    },
    treeload: Boolean
  },
  data () {
    return {
      treeImg: {
        chapter: "static/imgs/middle/chapter_blk.png",
        volume: "static/imgs/middle/fileopen_blk.png",
        closeVolume: "static/imgs/middle/fileclose.png"
      },
      changeType: true,
      changeError: false,
      title: ''
    }
  },
  directives: {
    focus: {
      inserted: function (el, {value}) {
        console.log('触发发focus操作')
        // console.log(value)
        // if (value) {
          el.focus()
        // }
      }
    }
  },
  methods: {
    ...mapActions({
      CHANGE_TITLE_BOOK: 'CHANGE_TITLE_BOOK',
      SYNC_UPDATE_BOOK_CONTENT_L1: 'SYNC_UPDATE_BOOK_CONTENT_L1',
    }),
    ...mapMutations({
      SET_BOOK_CONTENT_L1: 'SET_BOOK_CONTENT_L1'
    }),
    changeTitle(e, data){
      this.changeType = false;
    },
    blurChange(e, data){
      let reg = new RegExp('[\-a-zA-Z0-9\d .·()（）“”,，？：!！\u4e00-\u9fa5]*')
      // const reg = new RegExp(
      //   "[~@#$^&*()=|{}';'\\[\\].<>~！@#￥……&*（）——|{}【】‘；：”“。，、？]"
      // );
      let value = e.target.value
      // 防止回车之后会触发blur事件，导致该函数触发两次
      if(this.changeType) return false;
      if((!this.title)||(this.data.title === this.title)){
        this.changeType = true
        return false;
      }
      let execObj = reg.exec(value)
      if(this.title.length>20){
        this.changeError = true
        this.$message({showClose: true, message: '名称必须限制在二十个字内!', type: 'warning', customClass: 'bookWarning'})
        }else if(!((execObj === null)||( execObj[0]!== execObj.input))){
        this.changeError = false
        this.changeType = true
        // this.sendTitle({title: this.title})
        // let sendData = Object.assign(this.data, {title: this.title});
        let sendData = {...this.data, ...{title: this.title}};
        // console.log(sendData)
        this.sendTitle(sendData)
        // this.sendTitle(this.backSendTitleData({changeList:[sendData],token: this.GET_USET_DATA.token, book_uuid: this.data.bookId}))
        // this.UPDATE_ACTION_BOOK_1({title: this.title, type: this.data.chapter_uuid?'chapter':'volume', data: this.data, token: this.GET_USET_DATA.token, uid: this.GET_USET_DATA.uid})
        // this.CHANGE_TITLE_BOOK({title: this.title, type: this.data.chapter_uuid?'chapter':'volume', data: this.data, token: this.GET_USET_DATA.token, uid: this.GET_USET_DATA.uid})
      }else{
        this.changeError = true
        this.$message({showClose: true, message: '请不要使用特殊字符!', type: 'warning', customClass: 'bookWarning'})
      }
    },
    sendTitle(data){
      localQuery.updateItemInDB({data: {title: data.title,is_upload: '0', client_uuid: data.client_uuid}, changedProps: ['title','is_upload'], tableName: 'book_category'}).then(() => {
        this.SYNC_UPDATE_BOOK_CONTENT_L1(localQuery.backSendTitleData({changeList:[data],token: this.GET_USET_DATA.token, book_uuid: this.data.bookId})).then((res) => {
          let resData = res.data;
          let volumes = resData.result.volumes;
          let chapters = resData.result.chapters;
          console.log(resData)
          if(volumes){
            for(let i = 0; i < volumes.length; i++){
              if(volumes[i].code === 200){
                this.SET_BOOK_CONTENT_L1(resData.result)
                localQuery.updateItemInDB({data: {version: volumes[i].version, is_upload: '1', client_uuid: volumes[i].volume_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
              }else{
                console.error(`status 状态异常:${JSON.stringify(volumes[i])}`)
              }
            }
          }
          if(chapters.volumes){
            // for(let i = 0; i < chapters.volumes.length; i++){
              let newChapterList = chapters.volumes[0].chapters.filter((item, index) => {
                if(item.code === 200){
                  localQuery.updateItemInDB({data: {version: item.version, is_upload: '1', client_uuid: item.chapter_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                  return item;
                }
              })
              chapters.volumes[0].chapters = newChapterList
              console.log('章节过滤后数据,newChapterList:',newChapterList)
              // if(chapters.volumes[0].chapters[0].code === 200){
                this.SET_BOOK_CONTENT_L1(resData.result)
              //   console.log(chapters.volumes[0].chapters[0].version)
              //   localQuery.updateItemInDB({data: {version: chapters.volumes[0].chapters[0].version, is_upload: '1', client_uuid: chapters.volumes[0].chapters[0].chapter_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
              // }else{
              //   console.error(`status 状态异常:${JSON.stringify(chapters.volumes)}`)
              // }
            }
          // }
        }).catch((err) => {
          console.log(err)
        })
      })
  
      console.log(data)
      console.log(this.data)
      console.log(this.node)
    }
  },
computed:{
  ...mapGetters({
    GET_USET_DATA: 'user/GET_USET_DATA'
  })
},
created() {
  this.title = this.data.title
  if(this.data.createType){
    this.changeType = false;
  }
},
components: {

}
}
</script>

<style scoped>
.iconfont{
  color: var(--colorChapter)
}
.chapter-box
  .el-tree
  .el-tree-node__content
  .custom-tree-node
  .custom-tree-node-title {
  /* width: 36px;
  height: 16px; */
  height: 100%;
  width: 70%;
  font-size: 12px;
  color: var(--colorChapter);
  display: inline-block;
  vertical-align: middle;
}
.chapter-box
  .el-tree
  .el-tree-node__content
  .custom-tree-node
  .custom-tree-node-title .custom-tree-node-title-input{
    width: 70%;
    height: 20px;
    border-radius: 2px;
    border: solid 1px var(--colorBorderDefault);
    outline: none;
    box-sizing: border-box;
  }


  .chapter-box .el-tree .el-tree-node__content .bookTreeList{
  margin-right: 5px;
  height: 100%;
  display: inline-block;
}
.chapter-box .el-tree .el-tree-node__content .bookTreeList img{
  width: 18px;
  height: 18px;
  vertical-align: middle;
}
</style>
