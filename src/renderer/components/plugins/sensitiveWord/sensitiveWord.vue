<template>
  <my-dialog :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title" v-on:closeDialog="closeDialog">
    <div class="sensitive-word">
        <el-tabs class="plugins_sensitiveWord" v-model="activeName" @tab-click="handleClick" :before-leave="beforeLeave">
            <el-tab-pane label="敏感词检测" name="testing">
                <div class="checkContent">
                    <div class="checkFail view">
                        <div v-if="isChecked">
                            <p class="tip" v-if="hasSensWord"><span>共查找出<span class="result">{{sensWordsNum}}</span>个敏感词，已完成替换</span></p>
                            <p class="tip" v-else><span>暂未发现敏感词！</span></p>
                        </div>

                        <div class="inputlabel">选择替换方式</div>
                        <div class="radioContainer">
                            <input type="radio" name="replace" id="highlight" value="highlight" checked >
                            <label for="highlight">不修改敏感词，仅字体颜色高亮显示</label>
                            <br>
                            <input type="radio" name="replace" id="split" value="split">
                            <label for="split">增加分隔线，符号间隔敏感词，如"霸气"替换后为"霸-气"</label>
                            <br>
                            <input type="radio" name="replace" id="pinyin" value="pinyin">
                            <label for="pinyin">替换为汉语拼音全拼，如"霸气"替换为"baqi"</label>
                            <br>
                            <input type="radio" name="replace" id="abbreviation" value="abbreviation">
                            <label for="abbreviation">替换为首字母大写缩写，如"霸气"替换为"BQ"</label>
                            <br>
                            <input type="radio" name="replace" id="asterisk" value="asterisk">
                            <label for="asterisk">将敏感词替换为" * "</label>
                            <br>
                            </div>
                            <div class="box-footer">
                                <!-- <button type="button" class="cancelBtn" @click="closeDialogWord">取&nbsp;消</button> -->
                                <!-- <button type="button" class="inspectBtn" @click="changeSensitiveWords">检&nbsp;测</button> -->
                                <el-button @click="closeDialogWord" size="small">取 消</el-button>
                                <el-button @click="changeSensitiveWords" type="primary" size="small">检 测</el-button>
                            </div>
                        </div>
                    </div>
            </el-tab-pane>
            <el-tab-pane label="敏感词设置" name="setting">
              <div class="checkContent">
                <span @click="isEdit = false" class="edit-note"><img :src="imgEdit">编辑自定义敏感词</span>
                <el-input :disabled="isEdit" v-model="customWords" type="textarea" resize="none" :rows="9" placeholder="敏感词1、敏感词2、敏感词3"></el-input>
                <div class="box-footer" v-if="!isEdit">
                    <!-- <button type="button" class="cancelBtn" @click="closeDialogWord">取&nbsp;消</button> -->
                    <!-- <button type="button" class="inspectBtn" @click="saveSensitiveWords">保&nbsp;存</button> -->
                    <el-button @click="cancelEdit" size="small">取 消</el-button>
                    <el-button @click="saveSensitiveWords" type="primary" size="small">保 存</el-button>

                </div>
              </div>
            </el-tab-pane>
        </el-tabs>
    </div>
  </my-dialog>
</template>

<script>
import {Tabs,Button,Input} from "element-ui";
// import sensitiveWords from "./sensitive-words.json";
import pinyin from './pinyin';
// import fs from 'fs';
import myDialog from "@/components/pages/dialog/dialog";
// import path from 'path';
import {mapActions,mapGetters} from 'vuex'

export default {
    props: ['dialogWord'],
    data() {
        return {
            dialoginf: {
              width: 680,
              height: 520,
              title: "敏感词"
            },
            activeName: "testing",
            imgEdit: 'static/imgs/note/edit.png',
            isEdit: true,
            hasSensWord: false,
            isChecked: false,
            sensWordsNum: '',
            customWords: ''
        };
    },
    methods: {
        ...mapActions({
            SENSITIVE_WORDS: 'SENSITIVE_WORDS',
            UPDATE_SENSITIVE_WORDS_CONTENT: 'UPDATE_SENSITIVE_WORDS_CONTENT',
        }),
        handleClick(tab, event) {
            this.customWords = this.GET_SENSITIVE_WORDS.USER.content

            //   console.log(tab, event);
            //   console.log($('.ql-editor').text() );
            //   console.log(sensitiveWords[123857])
        },
        beforeLeave(){
            if(!this.isEdit){
                this.$confirm('确认，不保存并退出编辑？').then(_ => {
                    this.isEdit = true;
                }).catch(_ => {});
                return false
            }
        },
        //拼接敏感词
        concatLocalData(e) {
            // let sensitiveWords
            // let t = fs.readFileSync(path.join(__dirname, "sensitive-words.json"), "utf8");
            // sensitiveWords = JSON.parse(t);

            // (localSensitiveWords = JSON.parse(t)[email]).base = localSensitiveWords.base || "", 
            // localSensitiveWords.own = localSensitiveWords.own || "";

            // let i, n = sensitiveWords.base.split("、"), s = sensitiveWords.own.split("、");
            let baseSensitiveWord = this.GET_SENSITIVE_WORDS.BASE.content || '',userSensitiveWord = this.GET_SENSITIVE_WORDS.USER.content || '';    //增加初始状态用户敏感词为null的处理
            let i, n = baseSensitiveWord.split('、'), s = userSensitiveWord.split('、');
            return i = n.concat(s), i;
            // return "object" == typeof e && e.msg || !e ? i = n.concat(s) : e && (localSensitiveWords.base !== e.join("、") && (localSensitiveWords.base = e.join("、"), reWriteSensitiveWords(localSensitiveWords)), i = e.concat(s)), i
        },
        //给匹配的敏感词加样式并返回匹配个数
        checkSensitiveWords(e) {
            e = [...new Set(e)];
            // let contHtml = Editor.getEditorHtml(),
            let contHtml = $('.ql-editor').html();
            let i = 0; //匹配的敏感词数量
            for (let n of e) {
                let e = function (e) {
                        return e = e.replace(/\.|\*|\+/, function () {
                            return `\\${arguments[0]}`
                        })
                    }(n),
                    s = new RegExp(`${e}`, "g"),
                    o = new RegExp(`([^>|^<]*)${e}([^>|^<]*)(?=<[^>]+>)`, "g");
                n && n.trim().length && (contHtml = contHtml.replace(o, function () {
                    console.log(arguments[0]);
                    let e = arguments[0].replace(s, `<span class="sensitive" style="color:red;">${n}</span>`);
                    return arguments[0].match(s) && (i += arguments[0].match(s).length), e
                }))
            }
            i > 0 ? this.hasSensWord = true : this.hasSensWord = false;
            return $('.ql-editor').html(contHtml), console.log('i', i), i
        },
        changeSensitiveWords() {
            this.sensWordsNum = this.checkSensitiveWords(this.concatLocalData());
            this.isChecked = true;
            var type = $('input[type=radio]:checked').val()
            console.log(type)
            let i = {
                split: function () {
                    let e = $(this).text().split("").join("-");
                    this.outerHTML = e
                },
                pinyin: function () {
                    let e = $(this).text(),
                        t = pinyin.getFullChars(e);
                    this.outerHTML = t
                },
                abbreviation: function () {
                    let e = $(this).text(),
                        t = pinyin.getCamelChars(e);
                    this.outerHTML = t
                },
                asterisk: function () {
                    let e = $(this).text().replace(/./g, '*');
                    this.outerHTML = e
                },
                highlight: function () {
                    $(this).addClass("highlight")
                    console.log($(this))
                },
                cancel: function () {
                    let e = $(this).text();
                    this.outerHTML = e
                }
            };
            $(".sensitive").each(function () {
                i[type].call(this)
            })
            // flag = !1
        },
        // reWriteSensitiveWords(e) {
        //     let t = {};
        //     t = e, fs.writeFileSync(path.join(__dirname, "sensitive-words.json"), JSON.stringify(t), "utf8")
        // },
        closeDialogWord() {
            this.$emit('closeDialogWord', false);
        },
        cancelEdit(){
            this.$confirm('确认，不保存并退出编辑？').then(_ => {
               this.isEdit = true;
            }).catch(_ => {});
        },
        saveSensitiveWords() {
            // let sensitiveWords
            // let t = fs.readFileSync(path.join(__dirname, "sensitive-words.json"), "utf8");
            // sensitiveWords = JSON.parse(t);
            // sensitiveWords.own = this.customWords
            // this.reWriteSensitiveWords(sensitiveWords)

            this.UPDATE_SENSITIVE_WORDS_CONTENT({content: this.customWords, version: this.GET_SENSITIVE_WORDS.USER.version})
            this.isEdit = true
            // this.$emit('closeDialogWord', false);  
        },
        closeDialog() {
            if(!this.isEdit){
                this.$confirm('确认，不保存并退出？').then(_ => {
                    this.$emit("closeDialogWord", false);
                }).catch(_ => {});
            }else{
                this.$emit("closeDialogWord", false);
            }
          
        }

    },
    computed: {
      ...mapGetters({
        GET_SENSITIVE_WORDS: 'GET_SENSITIVE_WORDS'
        })
    },
    mounted() {
      
      },
    watch: {
      dialogWord: function () {
        if (this.dialogWord == false) {
          //   this.$destroy()
                // Object.assign(this.$data, this.$options.data())

                //初始化
                this.activeName = "testing",
                this.isEdit = true,
                this.hasSensWord = false,
                this.isChecked = false,
                this.sensWordsNum = '',
                $('#highlight').prop('checked', true)
            }
        }
    },
    created() {
      // this.INSET_USER_SENSITIVE_WORDS()
        this.SENSITIVE_WORDS();
    },
    components: {
        myDialog
    },
};
</script>
<style>
/* < !-- 更改element样式 --> */

.sensitive-word .plugins_sensitiveWord .el-tabs__active-bar {
    background-color: #fbbd36;
    height: 4px;
    border-radius: 4px;
}
.sensitive-word .plugins_sensitiveWord .el-tabs__nav-scroll .el-tabs__nav{
  height: 50px;
  margin: 0 60px
}
.sensitive-word .plugins_sensitiveWord .checkContent{
  padding: 0 60px
}
.sensitive-word .plugins_sensitiveWord .el-tabs__item.is-top:nth-child(2),.plugins_sensitiveWord .el-tabs__item.is-top:last-child{
  margin-left: 0 !important
}
/*  */
.sensitive-word .plugins_sensitiveWord .el-tabs__item {
  height: 50px;
  line-height: 50px;
    color: #999999;
}

.sensitive-word .plugins_sensitiveWord .el-tabs__item:hover {
    color: #333333;
}

.sensitive-word .plugins_sensitiveWord .el-tabs__item.is-active {
    color: #333333;
}

.sensitive-word .plugins_sensitiveWord .el-dialog__body {
    padding: 0 20px 20px !important;
}
</style>

<style scoped>
.sensitive-word {
    color: #333333;
}

.tip {
    display: inline-block;
    padding: 0 16px;
    font-weight: bold;
    margin: 5px 0 10px 6px;
    height: 40px;
    line-height: 40px;
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.09);
}

.tip span.result {
    font-weight: bold;
}

.inputlabel {
    font-size: 18px;
    line-height: 24px;
    margin: 15px 0 10px;
}

.radioContainer input {
    vertical-align: middle;
}

.radioContainer label {
    height: 42px;
    line-height: 42px;
    vertical-align: middle;
}

.box-footer {
    text-align: right;
    margin-top: 40px;
}
.box-footer button{
  width: 88px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  font-size:14px
}
.box-footer .cancelBtn{
  border: solid 1px #dddddd;
  background-color: #f3f3f3;
  margin-right:20px;
  color: #666666;
}
.box-footer .inspectBtn{
  border: none;
  background-color: #3e4347;
  color: #ffffff;
}
input[type=radio] {
    -webkit-appearance: none;
    margin-right: 6px;
    position: relative;
    width: 12px;
    height: 12px;
    border: 1px solid #d9d9d9;
    border-radius: 50%;
    background: rgb(255, 255, 255);
    vertical-align: middle;
    box-sizing: border-box;
    outline: none;
}

input[type=radio]:checked:after {
    content: '';
    display: block;
    position: absolute;
    top: -1px;
    left: -1px;
    width: 4px;
    height: 4px;
    border: 4px solid #fbbd36;
    border-radius: 50%;
    background-color: #fff;
}

.edit-note {
    color: #666666;
    font-size: 12px;
    height: 37px;
    line-height: 37px;
    margin-top:30px;
    cursor: pointer;
    display: inline-block;
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
