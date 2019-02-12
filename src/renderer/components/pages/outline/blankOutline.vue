<template>
    <div style="height:100%;" id="kongbaiMain">
       <el-container style="padding-top:72px;">
            <el-aside width="220px" class="set-el-aside" style="padding-bottom:100px">
                <div class="outline-img-box" @click="dialogTableVisible = true">
                   <span>选择书籍</span>
                </div>
                <el-tree
                ref="outlinetree"
                :data="datas"
                node-key="client_uuid"
                :accordion="true"
                :default-expanded-keys="firstListBook"  highlight-current   @node-contextmenu="showMenu" @node-click="checkFn" @check-change="chackChange" @current-change="currentChange">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span :style="data.type==1?'font-weight: bold':''" v-if="data.changeType"   :title="data.label"  @dblclick="changeTitle($event, data)">
                        <i v-if="data.type == 2 && data.category == 101" class="iconfonts icon-dagang_dagang" style="font-size:12px;"></i>
                        <i v-else-if="data.type == 2 && data.category == 102" class="iconfonts icon-dagang_plot" style="font-size:12px;"></i>
                        <i v-else-if="data.type == 2 && data.category == 103" class="iconfonts icon-dagang_character" style="font-size:12px;"></i>
                        <i v-else class="" style="font-size:12px;"></i>
                        {{ data.label }}
                    </span>
                    <input  v-if="!data.changeType && data.type==3" :value="data.label" @input="data.label = $event.target.value" v-on:keyup.enter="blurChange($event, data)" v-focus @blur="blurChange($event, data)" class="custom-tree-node-title-input" :maxlength="20" typet="text" title="请输入只包含中文、英文、阿拉伯数字、逗号、问号、冒号、感叹号的字符" />
                    <span v-if="data.label == '情节大纲' || data.label == '人物设置'">
                        <el-button
                            type="text"
                            size="mini"
                            @click.stop="() => append(data)" class="iconfonts icon-dagang_add">
                        </el-button>
                    </span>

                </span>
                </el-tree>
            </el-aside>
            <el-main class="set-el-main">
                <div class="textarea-box">
                    <el-input type="textarea" :disabled="!nodeData.content.topData.canEdit" :maxlength="maxLength" v-model="nodeData.content.topData.content" resize="none" change="contentlg" style="height:100%" placeholder="可在此输入本书的情节、梗概、故事介绍等"></el-input>
                    <div class="wordsnum">{{ nodeData.content.topData.content.length }}/10000</div>
                </div>
                <div class="button-box" v-if="nodeData.content.topData.canEdit">
                    <el-button size="medium " @click="nodeData.content.topData.canEdit = false">取消</el-button>
                    <el-button type="info" size="medium " @click="saveData">保存</el-button>
                </div>
                 <div class="button-box" v-if="!nodeData.content.topData.canEdit">
                    <el-button size="medium " @click="nodeData.content.topData.canEdit = true">编辑</el-button>
                </div> 
            </el-main>
            <book-open @closeOpenWindow="closeOpenWindow(false)" :userCenterFlag="dialogTableVisible" v-if="dialogTableVisible"></book-open>
        </el-container>
    </div>  
</template>
<script>
    import { mapGetters,mapActions } from 'vuex';
    import uuid from 'uuid-random'
    import { sqliteDBStrongDecode, arabiaToSimplifiedChinese, arrayReachJson } from '../../../../../static/js/public.js'
    import { ipcRenderer, remote, MenuItem, Menu, ipcMain } from "electron";
    import axios from 'axios'
    import * as api from '../../../store/API.js'
    import { hmac256,timestamp } from "../../../../../static/js/public.js";
    import bookOpen from '@/components/pages/bookOpen/outlineBookOpens';
    let id = 1000;
  export default {
    name: '', 
      components:{bookOpen},
      props: {
          settingsFlag: Boolean
      },
    data () {
        
        return {
            dialogTableVisible: false,
             targitChange:true,
             treeImg: {
                book: "static/imgs/outline/4-copy-3.png",
                volume: "static/imgs/outline/group-14-copy-2.png",
                closeVolume: "static/imgs/outline/group-14-copy-2.png"
            },
            datas: [],
            maxLength:10000,
            formData:{
                storySubject:'',
                storyStyle:'',
                storyLine:'',
                storyBright:'',
                storyCharacter:'',
                storyBackground:'',
                storyCore:''
            },
            bookId:'',
            listBook:[],
            firstListBook:[],

            active_id:'conventional',
            dialoginf:{
                width:750,
                height:450,
                title:"基础设置"
            },
            checked:false,
            
            defaultProps: {
                children: 'children',
                label: 'label'
            },
            formData:{
                content:'',
            },
            bookId:'',
            nodeData:{
                category:101,
                content:{
                    topData:{
                        content:''
                    }
                }
            },
            staticData:{
              //默认本书大纲数据集（创建新的时候使用）
              storyData:{
                types: 101,
                allEdit:true,
                topData:{
                    title:'本书大纲',
                    content:'',
                    canEdit:true

                }
              },
              //情节默认数据集（创建新的时候使用）
              plotData:{
                types: 102,
                allEdit:true,
                topData:{
                    title:'情节大纲',
                    content:'',
                    canEdit:true

                }
              },
              //情节默认数据集（创建新的时候使用）
              personData:{
                types: 103,
                allEdit:true,
                topData:{
                    title:'人物设置',
                    content:'',
                    canEdit:true

                }
              },
            },

        }
    },
    computed: {
        ...mapGetters({
            GET_INFO_BOOK: 'GET_INFO_BOOK',
            GET_USET_DATA: 'user/GET_USET_DATA'
        })
        
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
             OUTLINE_TEXT: "outline/OUTLINE_TEXT",
        }),
        chackChange(e,ischeck,hascheck){
           
        },
        currentChange(e,ndos){
             console.log(e)
            if(e.type == 3 || (e.type == 2 && e.category == 101)){
              this.nodeData = e;
            }
        },
        closeOpenWindow(type){
            this.dialogTableVisible = type
        },
        changeTitle(e,data){
            if(data.type == 3){
              let _arrIndex = data.category == 102?1:2;
                let _index =  this.listBook.findIndex(function(value, index, arr) {
                            return value == data.bookid;
                }) //查找当前书籍在节点中的
                this.datas[_index].children[_arrIndex].children = this.datas[_index].children[_arrIndex].children.map(function(item,index){
                    if(item.client_uuid == data.client_uuid){
                        item.changeType = false;
                    }
                    return item;
                })
                this.targitChange = false;
            }
           
        },
         //失去焦点改变
        blurChange(e,data){
            if(this.targitChange) return;
            if(e.target.value == ""){
                this.targitChange = false;
                return false;
            }
            this.targitChange = true;
            this.change(data.category,e.target.value,data.client_uuid,data.bookid,data.content)
        },
        //添加方法
        append(data) {
            let client_uuid = uuid();
            let _name = "";
            if(data.category == 102){
                _name = "情节"+arabiaToSimplifiedChinese(Number(data.children.length) + Number(1))
            }else if(data.category == 103){
                _name = "人物"+arabiaToSimplifiedChinese(Number(data.children.length) + Number(1))
            }   
            let  staticCont = "";
            data.category == 102? staticCont = JSON.parse(JSON.stringify(this.staticData.plotData))  : staticCont = JSON.parse(JSON.stringify(this.staticData.personData));
            const newChild = {category:data.category ,bookid:data.bookid, client_uuid: client_uuid,type:3,content:staticCont, label: _name,title:_name,changeType:true,version:1, children: [] };
            this.save(client_uuid,data.category,_name,newChild,staticCont,data)
        },
        //显示右键菜单
        showMenu(event, data, node, dom) {
            ipcRenderer.send("ipc-outlines", data);
        },
        //保存新子节点方法
        save (client_uuid,category,title,newChild,staticCont,data){
            let that = this;
            let userData = JSON.parse(localStorage.getItem('user'));
            let token = userData.user.user_center.token
            let time = timestamp();
            var parameters = {
                    "book_uuid": data.bookid,
                    "syllabuses": [
                        {
                            "client_uuid": client_uuid,
                            "content": JSON.stringify(staticCont),
                            "category": category,
                            "title": title,
                            "garbish":false,
                            "version": 0
                        }
                    ]
                }
            axios.post(
            api.OUTLINE_TEXT + `?token=${token}&timestamp=${time}`, 
            parameters,
            {
                headers: {
                    'x-sign-id': hmac256(token,api.OUTLINE_TEXT,time,parameters)
                }
            }
            ).then(res => {
                if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                    if (!data.children) {
                      that.$set(data, 'children', []);
                    }
                    data.children.push(newChild);
                    // that.$message({showClose: true, message: `添加成功`, type: 'success'})
                }else{
                    that.$message({showClose: true, message: `添加失败`, type: 'error'})
                }
            })
        },
        delete (category,title,client_uuid,bookid){
            let that = this;
            let userData = JSON.parse(localStorage.getItem('user'));
            let token = userData.user.user_center.token
            let time = timestamp();
            var parameters = {
                    "book_uuid": bookid,
                    "syllabuses": [
                        {   "is_deleted":1,
                            "client_uuid": client_uuid,
                            "content": "",
                            "category": category,
                            "title": title,
                            "garbish":false,
                            "version": 0
                        }
                    ]
                }
            axios.post(
            api.OUTLINE_TEXT + `?token=${token}&timestamp=${time}`, 
            parameters,
            {
            headers: {
                'x-sign-id': hmac256(token,api.OUTLINE_TEXT,time,parameters)
            }
            }
          ).then(res => {
              if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                    if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                        let _arrIndex = category == 102?1:2;
                        // let _length = 
                         let _index =  that.listBook.findIndex(function(value, index, arr) {
                            return value == bookid;
                        }) //查找当前书籍在节点中的
                      
                        that.datas[_index].children[_arrIndex].children = that.datas[_index].children[_arrIndex].children.filter(function(item,index){
                            return item.client_uuid != client_uuid;
                        })
                        // that.$message({showClose: true, message: `删除成功`, type: 'success'})
                    }else{
                        that.$message({showClose: true, message: `删除失败`, type: 'error'})
                    }
              }
          })
        },
        //修改方法
        change (category,title,client_uuid,bookid,content){
            let that = this;
            let userData = JSON.parse(localStorage.getItem('user'));
            let token = userData.user.user_center.token
            let time = timestamp();
            var parameters = {
                    "book_uuid": bookid,
                    "syllabuses": [
                        {
                            "client_uuid": client_uuid,
                            "content": JSON.stringify(content),
                            "category": category,
                            "title": title,
                            "garbish":false,
                            "version": 0
                        }
                    ]
                }
            axios.post(
            api.OUTLINE_TEXT + `?token=${token}&timestamp=${time}`, 
            parameters,
            {
            headers: {
                'x-sign-id': hmac256(token,api.OUTLINE_TEXT,time,parameters)
            }
            }
            ).then(res => {
                if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                      let _arrIndex = category == 102?1:2;
                      let _index =  that.listBook.findIndex(function(value, index, arr) {
                            return value == bookid;
                        }) //查找当前书籍在节点中的
                        that.datas[_index].children[_arrIndex].children = that.datas[_index].children[_arrIndex].children.filter(function(item,index){
                            item.changeType = true;
                            return item;
                        })
                }else{
                    that.$message({showClose: true, message: `修改失败`, type: 'error'})
                }
                that.targitChange = false;
            })
        },
        checkFn($event, data){
            //console.log(this.$refs.outlinetree.getCurrentNode())
        },
        //初始化左侧栏
        showOutLine(bookInfo){
                console.log(111111)
                console.log(bookInfo)
                let userData = JSON.parse(localStorage.getItem('user'));
                let time = timestamp();
                let that = this;
                let _datas = {
                        category:200,
                        client_uuid:uuid(),
                        label: bookInfo.title,
                        bookid:bookInfo.book_uuid,
                        type:1,
                        changeType:true,
                        children: [{
                            label: '本书大纲',
                            client_uuid:bookInfo.book_uuid,
                            bookid:bookInfo.book_uuid,
                            children: [],
                            content:JSON.parse(JSON.stringify(that.staticData.storyData)),
                            category:101,
                            type:2,
                            changeType:true
                        },
                        {
                            label: '情节大纲',
                            bookid:bookInfo.book_uuid,
                            changeType:true,
                            children: [],
                            type:2,
                            client_uuid:uuid(),
                            category:102
                        },
                        {
                            label: '人物设置',
                            bookid:bookInfo.book_uuid,
                            changeType:true,
                            children: [],
                            client_uuid:uuid(),
                            type:2,
                            category:103
                        }]
                    }
                    axios({
                        url: api.outline_get + `?token=${userData.user.user_center.token}&timestamp=${time}&book_uuid=${bookInfo.book_uuid}&types=1`,
                        method: 'GET',
                        
                        headers: {
                            'x-sign-id': hmac256(userData.user.user_center.token, api.outline_get, time, '')
                        }
                    }).then(res => {
                           if(res.data.result.blanks){
                                let _data = res.data.result.blanks.map(function(item,index){
                                //102 情节大纲 103 人物设置 101本书大纲
                                if(item.category == 102){
                                    item.type = 3;
                                    item.changeType = true;
                                    item.content = JSON.parse(item.content);
                                    item.label = item.title;
                                    item.bookid = bookInfo.book_uuid;
                                    _datas.children[1].children.push(item)
                                }
                                if(item.category == 103){
                                    item.type = 3;
                                    item.changeType = true;
                                    item.content = JSON.parse(item.content);
                                    item.label = item.title;
                                    item.bookid = bookInfo.book_uuid;
                                    _datas.children[2].children.push(item)
                                }
                                if(item.category == 101){
                                    item.type = 2;
                                    item.changeType = true;
                                    item.label = item.title;
                                    item.bookid = bookInfo.book_uuid;
                                    _datas.children[0].content = JSON.parse(item.content);
                                }
                            })
                        }
                        that.datas.push(_datas)
                        if(that.bookId == bookInfo.bookId){
                             that.nodeData = _datas.children[0]; //初始化当前节点数据
                        }
                    })
        },
        //右侧保存按钮
        saveData(){
            let that = this;
            let client_uuid = this.nodeData.client_uuid;
            let userData = JSON.parse(localStorage.getItem('user'));
            let token = userData.user.user_center.token
            let time = timestamp();
            if(this.nodeData.content.topData.content.length == 0){
                that.$message({showClose: true, message: `请输入本书的情节、梗概、故事介绍等内容`, type: 'error'})
                return;
            }
           
            this.nodeData.content.topData.canEdit = false
            var parameters = {
                    "book_uuid": this.nodeData.bookid,
                    "syllabuses": [
                        {
                            "client_uuid": client_uuid,
                            "content": JSON.stringify(this.nodeData.content),
                            "category": this.nodeData.category,
                            "title": this.nodeData.label,
                            "garbish":false,
                            "version": 0
                        }
                    ]
                }
            axios.post(
            api.OUTLINE_TEXT + `?token=${token}&timestamp=${time}`, 
            parameters,
            {
                headers: {
                    'x-sign-id': hmac256(token,api.OUTLINE_TEXT,time,parameters)
                }
            }
            ).then(res => {
                if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                    that.$message({showClose: true, message: `保存成功`, type: 'success'})
                }else{
                    that.$message({showClose: true, message: `保存失败`, type: 'error'})
                }
            })
        },
        
        contentlg(){
            if(this.nodeData.content.topData.content.length > 10000){
                that.$message({showClose: true, message: `内容字数长度最大为10000字！`, type: 'error'})
            }
        }
    },
    created() {
        var bookInfo =JSON.parse(localStorage.getItem("filterBookItem"));
        let that = this;
        this.bookId = bookInfo.bookId;
        this.listBook.push(bookInfo.bookId)
        this.firstListBook.push(bookInfo.bookId)
        this.showOutLine(bookInfo)
        ipcRenderer.on("change-outline-titles", (event, arg) => {
            let _arrIndex = arg.category == 102?1:2;
                let _index =  that.listBook.findIndex(function(value, index, arr) {
                            return value == arg.bookid;
                        }) //查找当前书籍在节点中的
            that.datas[_index].children[_arrIndex].children = that.datas[_index].children[_arrIndex].children.map(function(item,index){
                if(item.client_uuid == arg.client_uuid){
                    item.changeType = false;
                }
                return item;
            })
            this.targitChange = false;
        });
        ipcRenderer.on("outline-dels", (event, arg) => {
            this.delete(arg.category,arg.title,arg.client_uuid,arg.bookid)
        });
        ipcRenderer.on("outline-new-books", (event, arg) => {
            let hasOpenBook =  this.listBook.some(function(item, index, array){
                return item == arg.book.book_uuid
            })
            if(!hasOpenBook){
                this.listBook.push(arg.book.book_uuid)
                this.showOutLine(arg.book)
            }
        });
        
    },
    mounted(){
       let that = this;
        setTimeout(() => {
            that.$refs.outlinetree.setCurrentKey(that.bookId)
        }, 1000);
    }
  }
</script>


<style lang="scss">
#kongbaiMain{
    .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
        background-color: #f8f8f8;
    }
    .el-textarea__inner{
        height:100%;
        border:none;
    }
     .custom-tree-node-title-input{
    width: 120px;
    height: 20px;
    border-radius: 2px;
    border: solid 1px var(--colorBorderDefault);
    outline: none;
    box-sizing: border-box;
  }
}
.is-current>div>span{
        color: #000 !important;
    }
    .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
        background-color: #f8f8f8;
    }
    .textarea-box{
        width:100%;height:80%;
        position: relative;
        border:none;
    }
    .button-box{
        width:100%;height:100px;text-align:right;
        margin-top:5%;
    }
    .wordsnum{
        font-size: 15px;
        color: #cccccc;
        position:absolute;
        right:0;
        bottom:10px;
    }
    .el-tabs__content{
        height:100%;  
    }
    .container{
        font-family: "微软雅黑";

    }
    .set-el-aside {
        color: #333;
        border-right: solid 1px #edeff3;
    }
    .outline-img-box{
        width: 100%;
        height: 40px;
        line-height:40px;
        text-align:center;
        font-size:14px;
        background:#f8f8f8;
        overflow: hidden;
        cursor: pointer;
    }
    .outline-img-box{
        width: 100%;
        height: auto;
        overflow: hidden;
    }
    .outline-img-box img{
        float: left;
        cursor: pointer;
    }
    .outline-img-box img:first-child{
        margin-left: 40px;
    }
    .outline-img-box img:nth-of-type(2){
        margin-left: 46px;
    }
    .set-el-main > .text-title {
        width: 100%;
        height:auto;
        overflow: hidden;
        overflow-y: scroll;
    }
    .set-el-main > .text-title .cont-title{
        font-size: 14px;
        height: 19px;
        line-height: 19px;
        padding: 20px 0 12px;
    }
    .set-el-main > .text-title > span{
        font-size: 14px;
        color:#333333;
        font-weight: bold;
    }
    .set-el-main > .text-title > ul{
        float: right;
        margin-right: -12px;
    }
    .set-el-main > .text-title > ul >li{
        float: left;
        font-size: 12px;
        color: #666666;
        width: 50px;
        text-align: center;
        cursor: pointer;
    }
    .set-el-main > .text-title > ul >li:hover{
        color: #333333;
    }
    .set-el-main > .text-title > ul >li:first-child{
        width: 80px;
        border-right: 1px solid #edeff3;
    }
    .el-container {
        height: 100%;
        }
        .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .el-tree--highlight-current>div>div>span,.is-expanded>.el-tree-node__content>span{
      color: #000;
  }
</style>

    