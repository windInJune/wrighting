<template>
  <div class="writing" id="scroll-this">
    <div class="writing-editor">
      <div class="cg-editor" ref="editor" id="real-editor" @paste="paste($event)" @keyup.enter="enterKey($event)" @click.right="mouseRight($event)">
        
          
      </div>
    </div>
   

  </div>
</template>

<script type="text/ecmascript-6">
// const docx = require("docx");
const fse = require('fs-extra');
const fs = require('fs');
const iconv = require('iconv-lite');
const chardet = require('chardet');
const path = require('path');
const htmlDocx = require('html-docx-js');
// import { setImmediate } from 'timers';
import { ipcRenderer, clipboardElectron } from "electron";
import _Quill from 'quill';
import Delta from 'quill-delta';
import { mapGetters,mapMutations} from 'vuex';
import { Document, Packer, Paragraph, TextRun } from 'docx';
// import { remote } from 'electron'
import { fnGetCpmisWords } from '../../../../../static/js/public.js'
const store = require('store/dist/store.modern');

const maxWordsPerChap = 20000;
const maxWordsPerChapDisplay = "两万";

const maxByteLengthPerChap = 80000;
//padding top of writing editor in pixel
const writingPaddingTop = 30;

//consider remove this after use quill 2.0.0
const Clipboard = _Quill.import('modules/clipboard')

class CustomClipboard extends Clipboard {
    onPaste(e) {
        if (e.defaultPrevented || !this.quill.isEnabled()) return;
        // const range = this.quill.getSelection(true);
        e.preventDefault();

        // const formats = this.quill.getFormat(this.quill.selection.savedRange.index);
        // // const html = e.clipboardData.getData('text/html');
        // const text = e.clipboardData.getData('text');

        // // console.log("formats: ");
        // // console.log(formats);
        // let delta = new Delta().retain(range.index);
        // // if (formats.hasOwnProperty("CodeBlock") && formats[CodeBlock.blotName]) {
        // //     delta.insert(text, {
        // //         [CodeBlock.blotName]: formats[CodeBlock.blotName],
        // //     });
        // // } else if (!html) {
        // delta.insert(text);
        // // } else {
        // //     const pasteDelta = this.convert(html);
        // //     delta = delta.concat(pasteDelta);
        // // }
        // delta.delete(range.length);
        // this.quill.updateContents(delta, _Quill.sources.USER);
        // // range.length contributes to delta.length()
        // this.quill.setSelection(
        //     delta.length() - range.length,
        //     _Quill.sources.SILENT,
        // );
        // this.quill.scrollIntoView();
    }
}

_Quill.register('modules/clipboard', CustomClipboard, true);
//consider remove this after use quill 2.0.0


  const Quill = window.Quill || _Quill
  // pollfill
  if (typeof Object.assign != 'function') {
    Object.defineProperty(Object, 'assign', {
      value(target, varArgs) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object')
        }
        const to = Object(target)
        for (let index = 1; index < arguments.length; index++) {
          const nextSource = arguments[index]
          if (nextSource != null) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey]
              }
            }
          }
        }
        return to
      },
      writable: true,
      configurable: true
    })
  }
  // export
  export default {
    name: 'quill-editor',
    data() {
      return {
        duringComp: false,
        quillOptions: {
          theme: 'snow',
          modules: {
            toolbar: '#toolbar',
            'history': {
              'userOnly': true,
              'maxStack': 100 ,
              "delay": 500
            } 
          },
          scrollingContainer: 'scroll-this',  //'#real-editor',
          placeholder: '欢迎使用橙瓜码字',
          readOnly: true,
        },
        quill: '',
        _options: {
          
        },
        contents: '',
        moveCursor: null,
        // setting: {
        //   fontFamily: '微软雅黑',
        //   fontSize: '10',
        //   fontWeight: 'normal',
        //   lineHeight: 1
        // },

        //the holy callback function which takes chapter content back
        dataCarrier: null,
        lineHeightInPixel: (this.setting.lineHeight*2) * parseInt(this.setting.fontSize),
        //no scroll after user normal typing input
        noScroll: false,
        clearChapData: false,
        insertIndex: '',
        typeWriting: '',
        firstLineIndex: false
      }
    },
    props: {
      content: String,
      disabled: {
        type: Boolean,
        default: false
      },
      setting: {
        type: Object,
        required: false,
        default: () =>({
          fontFamily: '宋体',
          fontSize: '16',
          fontWeight: 'normal',
          lineHeight: 1,
          typesetting: false
        })
      },
      options: {
        type: Object,
        required: false,
        default: () => ({})
      },
      globalOptions: {
        type: Object,
        required: false,
        default: () => ({})
      }
    },
    computed: {
      ...mapGetters({
        GET_USET_DATA: 'user/GET_USET_DATA',
        GET_TYPE_SETTING: 'GET_TYPE_SETTING'
      }),


      settings() {
        let settings = {
          "font-family": this.setting.fontFamily,
          "font-size": this.setting.fontSize+'px',
          "font-weight": this.setting.fontWeight,
          "line-height": this.setting.lineHeight * 2,
          "font-style": this.setting.fontStyle,
        }
        if(this.setting.underline){
          let height =  2 * (this.setting.fontSize * this.setting.lineHeight);
          let svgLine = "<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='" + height + "'><line x1='0' y1='" + (height - 1) + "' x2='100%' y2='" + (height - 1) + "' stroke='" + (this.setting.nightmode ? "#5B6787" : "#efefef") + "'></line></svg>";
          settings.background = "url(\"data:image/svg+xml;utf8," + svgLine + "\")"
        }else{
          settings.background=''
        }
        return settings
      }
    },
    methods: {
      ...mapMutations({
            UPDATE_TYPE_SETTING: 'UPDATE_TYPE_SETTING'
        }),
      getChapData(chapObj, dataCb){
        console.log("dataCb?");
        console.log(dataCb);
        if(!dataCb){
          if(!this.dataCarrier){
            this.dataCarrier = dataCb ? dataCb : null;
          }
        }else{
          this.dataCarrier = dataCb;
        }
        console.log("chapobj");
        console.log(chapObj);
          return this.$sqliteDB.queryData(`select * from chapter_content where chapter_uuid='${chapObj.uuid}' and is_deleted = 0 and uid='${this.GET_USET_DATA.uid}'`).then((res) => {
              console.log("got chap data");
              console.log(res);
              console.log(this.dataCarrier);
              this.dataCarrier(res);
            }, (err) => { 
              console.log("got chap data failed!!");
              console.log(err)
            });
      },

      getChapterLengthLimit(){
        return {maxWordPerChap: maxWordsPerChap, maxBytePerChap: maxByteLengthPerChap}
      },
      paste($event) {
        // this.quill.history.options.userOnly = false;
        this.$emit('pasting-status', true)
        console.log($event);
        // console.log("paste event data is: " + $event.clipboardData.getData('text'));
        $event.preventDefault();
        $event.stopPropagation();
        // this.quill.focus();

        console.log(this.quill.getSelection());
        let clipboardData = $event.clipboardData.getData('text');
        // console.log("clipboardData: " + clipboardData);
        let insertSelection = this.quill.getSelection();
        let insertedIndexStart = insertSelection.index;
        // console.log("inserted start is: " + insertedIndexStart);
        let deleteSelectionLen = insertSelection.length;


        //之后可以考虑 说这里可以直接调用一个属性 而不是重新计算一次
        let oldLen = fnGetCpmisWords(this.quill.getText());
        let leftLen = maxWordsPerChap - oldLen;
        let clipLen = fnGetCpmisWords(clipboardData);

        let selectionOffset = clipboardData.replace(/\r\n/g, "\n").length;
        // console.log("selection offset is: " + selectionOffset);

        if(clipLen <= leftLen + deleteSelectionLen){
          //do this, caz paste will trigger a 'user' text change as well
          //otherwise it will delete the inserted text
          // process.nextTick(() => {
            // this.quill.insertText(insertedIndexStart, clipboardData, 'api');
          this.quill.updateContents(new Delta()
            .retain(insertedIndexStart)
            .delete(deleteSelectionLen)
            .insert(clipboardData)
            , 'user');
          // });
        }else{
          let endIndex = this.findChopIndex(clipboardData, leftLen+deleteSelectionLen);
          selectionOffset = endIndex;
          // process.nextTick(() => {
            // this.quill.insertText(insertedIndexStart, clipboardData.substr(0, endIndex), 'api');
          this.quill.updateContents(new Delta()
            .retain(insertedIndexStart)
            .delete(deleteSelectionLen)
            .insert(clipboardData.substr(0, endIndex))
            , 'user');
          // });
          this.$message({showClose: true, message: `每章最多输入${maxWordsPerChapDisplay}字`,type: 'error'});       
        }

        //add a next tick to make paste stable
        // process.nextTick(() => {
        this.quill.setSelection({index: insertedIndexStart + selectionOffset, length: 0}, 'api');
        // });

        // this.$emit('pasting-status', false)
        // this.quill.history.options.userOnly = true;
      },
      resetStyle(){
        if (this.$el){
          let settings = this.settings;
          let _this = this;
          let editorDom = document.getElementsByClassName('cg-editor')
          Object.keys(settings).forEach(e => {
            editorDom[0].style[e] = settings[e]
          });
        }
      },
      findChopIndex(aString, targetNum){
        //this string is inserted, only use this when its too long > 20K words
        console.log("target num is: " + targetNum);
        let suber = aString.substr(0, targetNum);
        // console.log("!!!!!!!!!suber");
        // console.log(suber);
        let suberCount = fnGetCpmisWords(suber);
        // console.log("!!!!!!!!suberCount:");
        // console.log(suberCount)
        let wordLack = targetNum - suberCount;
        // console.log("wordlack: ");
        // console.log(wordLack);
        let endIndex = targetNum;
        // console.log("endIndex is: ");
        // console.log(endIndex);

        // console.log("target num is: " + targetNum);



        while(wordLack > 0 && endIndex < aString.length){
          console.log("try to find!!!!!");
          suber = aString.substr(endIndex, wordLack);
          // console.log("suber is: ");
          // console.log(fnGetCpmisWords(suber));
          endIndex = endIndex + wordLack;
          // console.log("endIndex is: ");
          // console.log(endIndex);


          suberCount = suberCount + fnGetCpmisWords(suber);
          // console.log("suberCount is: ");
          // console.log(suberCount);
          wordLack = targetNum - suberCount;
          // console.log("wordlack: ");
          // console.log(wordLack);

        }
        //todo: later we can return an obj with endIndex and wordCount
        // console.log("suber count: " + suberCount);
        // console.log("word count is: ");
        // console.log(fnGetCpmisWords(aString.substr(0, endIndex)));
        return endIndex;
      },
      initialize() {
        if (this.$el) {
          // Options
          this._options = Object.assign({}, this.globalOptions, this.options, this.quillOptions)
          // Instance
          this.quill = new Quill(this.$refs.editor, this._options)

          this.quill.enable(false)
          // Set editor content
          if (this.content) {
            this.quill.pasteHTML(this.content)
          }
          // Disabled editor
          if (!this.disabled) {
            this.quill.enable(true)
          }
          // Mark model as touched if editor lost focus
          // source     用户操作返回的API。
          // range      range对象
          this.quill.on('selection-change', (range, oldRange, source) => {
            // console.log("quill problem");
            // console.log('selection-change',range)
            if (!range) {
              this.$emit('blur', this.quill)
            } else {
              this.$emit('focus', this.quill)
              this.$emit('selection-change', {range, oldRange, source})
            }
          })
          // Update model if text changes
          this.quill.on('text-change', (delta, oldDelta, source) => {
            // console.log("delta change")
            
            // console.log("old")
            // console.log('oldDelta',oldDelta);
            // console.log("new")
            // console.log('delta',delta);
            // console.log('source is: ' + source);
            let wordCount = 0;
            // let text = "";
            if(source === 'user'){

              this.toggleIfScroll(false);
              // if(this.duringComp){
              //   // this.duringComp = false;
              //   console.log("blocked?")
              //   return;
              //   console.log("pass???")
              // }

              //deal with quill IME Chinese input first character taken as english character
              //real stupid
              // if(oldDelta.ops.length === 1 && this.duringComp){
              //   // console.log("case1111111?")
              //   if(delta.ops.length === 2){
              //     let retainIndex = null;
              //     let insertChar = '';
              //     if(delta.ops[0].hasOwnProperty("retain") && delta.ops[1].hasOwnProperty("insert")){
              //       // console.log("gogogogo");
              //       retainIndex = delta.ops[0].retain;
              //       insertChar = delta.ops[1].insert;
              //       this.quill.updateContents(new Delta()
              //         .retain(retainIndex)
              //         .delete(1)
              //         , 'silent');

              //       this.$nextTick(() => {
              //         this.quill.setSelection(retainIndex, 0, 'api');
              //       })
              //     }
              //   }
              // } 
              // console.log("delta ops length:" + delta.ops.length)
              // console.log('delta',delta);
              if(delta.ops.length === 1){
                if(delta.ops[0].hasOwnProperty("insert")){
                    // console.log("delta:",delta.ops)
                    console.log("delta:",'首行输入')
                    console.log("delta insertIndex",this.insertIndex)
                    this.firstLineIndex = true;

                        

                    // console.log("AAAAA")
                    wordCount = fnGetCpmisWords(this.quill.getText());        
                    // wordCount = fnGetCpmisWords(delta.ops[0].insert);                    
                    if(wordCount > maxWordsPerChap){
                      this.$message({showClose: true, message: `每章最多输入${maxWordsPerChapDisplay}字`,type: 'error'});

                      let chopIndex = this.findChopIndex(delta.ops[0].insert, maxWordsPerChap);
                      console.log("chopIndex is: " + chopIndex);
                      this.quill.updateContents(new Delta()
                        .retain(chopIndex)
                        .delete(delta.ops[0].insert.length - (chopIndex-1))
                        , 'api');
                      // console.log("2222222222222");
                      // this.quill.setSelection(this.quill.getLength()-1, 0, 'api');
                      wordCount = maxWordsPerChap;
                      return;
                    }
                }else if(delta.ops[0].hasOwnProperty("delete")){
                  // console.log("BBBBB")
                  // console.log("interesting case");
                  wordCount = fnGetCpmisWords(this.quill.getText());
                }else if(delta.ops[0].hasOwnProperty("retain")){

                  wordCount = fnGetCpmisWords(this.quill.getText());
                }

              }else{
                // console.log("CCCCC")
                let quillText = this.quill.getText();
                let pendingTextCounts = fnGetCpmisWords(quillText);
                wordCount = pendingTextCounts;
                // console.log("normal case~~~~~~~~~~~~~~~~")
                if(pendingTextCounts > maxWordsPerChap){
                  // console.log("should not enter this part!!!!!!!!!!!");
                  let operArray = ["retain", "insert", "delete"];
                  let operCounts = {
                    retainChar: 0,
                    insertChar: '',
                    deleteChar: 0
                  }
                  for(let i = 0; i < delta.ops.length; i++){
                    operArray.forEach((oneOper) => {
                      if(delta.ops[i].hasOwnProperty(oneOper)){
                        //注意 insert char 实际上是个字符串
                          operCounts[`${oneOper}Char`] += delta.ops[i][`${oneOper}`];
                      }
                    })
                  }

                  let oldText = "";
                  oldDelta.ops.forEach((oneOps) =>{
                    oldText += oneOps.insert ? oneOps.insert : "";
                  });
                  let formerPart = oldText.substr(0, operCounts.retainChar-operCounts.deleteChar);
                  //oldDelta.ops[0].insert.substr(0, operCounts.retainChar-operCounts.deleteChar);
                  // console.log("former part: " + formerPart);
                  let laterPart = oldText.substr(operCounts.retainChar);
                  //oldDelta.ops[0].insert.substr(operCounts.retainChar);
                  // console.log("later part: " + laterPart);
                  let formattedOldPart = formerPart + laterPart;
                  // console.log("formatted old part: " + formattedOldPart);
                  let oldWords = fnGetCpmisWords(formattedOldPart);
                  console.log("old words: " + oldWords);
                  let wordLack = maxWordsPerChap - oldWords;
                  // console.log("word lack: " + wordLack);

                  if(wordLack >= 0){
                    // console.log("DDDDD111111111111")
                    let chopIndex = this.findChopIndex(operCounts.insertChar, wordLack);
                    let realInsert = operCounts.insertChar.substr(0, chopIndex);
                    // do{
                    //   console.log("word lack is: " + wordLack);
                    //   let tempInsert = operCounts.insertChar.substr(0, wordLack);
                    //   let tempCount = fnGetCpmisWords(tempInsert);
                    //   wordLack = wordLack - tempCount;
                    //   realInsert = realInsert + tempInsert;
                    //   // console.log("real insert is: " + realInsert);
                    // }while(wordLack > 0)
                    // console.log("real insert is: " + realInsert);
                    // let deleteInsertLength = operCounts.insertChar.length - realInsert.length;

                    // console.log("operCounts: ");
                    // console.log(operCounts);

                    this.quill.updateContents(new Delta()
                      .retain(operCounts.retainChar)
                      .delete(operCounts.insertChar.length)
                      .insert(realInsert)
                      , 'silent');

                    //to do: after this, if there is a english connected problem, there maybe 1 word lack, could
                    //consider to add this after the operation above

                    // console.log("selection: ");
                    // console.log(this.quill.getSelection());
                    this.$message({showClose: true, message: `每章最多输入${maxWordsPerChapDisplay}字`,type: 'error'});

                    // console.log("delete length is: " + deleteInsertLength);

                    // this.moveCursor = {direction: "back", length: deleteInsertLength};
                    this.$nextTick(() => {
                    // process.nextTick(() => {
                      console.log("retain: " + operCounts.retainChar);
                      console.log("real insert length is: " + realInsert.length);
                      console.log("set selection to: " + operCounts.retainChar + realInsert.length);
                      // console.log("3333333333");
                      console.log("fffffff")
                      this.quill.setSelection(operCounts.retainChar + realInsert.length, 0, 'api');
                    });

                    // console.log("operCounts: ");
                    // console.log(operCounts);
                  }else{
                    // console.log("DDDDD2222222")
                    //word lack <= 0
                    //this is a special case when use IME input, text-change only works after composition ends and a /uFEFF character's inserted
                    //in this case, composition words already inserted, so we need to delete them
                    let deleteLength = oldWords - maxWordsPerChap;
                    this.quill.updateContents(new Delta()
                      .retain(operCounts.retainChar - deleteLength)
                      .delete(deleteLength)
                     , 'silent' )
                    process.nextTick(() => {
                      console.log("ah!");
                      this.quill.setSelection(operCounts.retainChar - deleteLength, 0, 'api');
                    })
                    this.$message({showClose: true, message: `每章最多输入${maxWordsPerChapDisplay}字`,type: 'error'});
                  }

                  wordCount = maxWordsPerChap;


                  //do delete option
                }


                // let totalCounts = operCounts.retainChar + operCounts.insertChar.length + operCounts.deleteChar;

                // if(totalCounts > maxWordsPerChap){
                //   this.$message({showClose: true, message: `单章节限定${maxWordsPerChap}字`,type: 'error'});
                //   this.quill.updateContents(new Delta()
                //     .retain(maxWordsPerChap)
                //     .delete(totalCounts - maxWordsPerChap)
                //     // .insert("Quill")
                //   , 'api');
                //   this.quill.setSelection(this.quill.getLength()-1, 0);
                // }
              }
              // console.log("FFFFF");
            }else{
                // console.log("EEEEE")
                let quillText = this.quill.getText();
                wordCount = fnGetCpmisWords(quillText); 
            }
            
            // console.log("GGGGG")
            let html = this.$refs.editor.children[0].innerHTML
            // const quill = this.quill
            let text = this.quill.getText()
            // console.log(text.replace(/\\n/gm,"<br/>"))
            // if (html === '<p><br></p>') html = '';
            this.contents = html
            // this.$emit('input', this.contents)
            // console.log("text is: " + text);
            // console.log("wordcount is: " + wordCount);
            this.$emit('change', { html, text, source, wordCount })
          })
          
          // Emit ready event
          this.$emit('ready', this.quill);
          // 样式初始化
          this.resetStyle()

        }
      },
      insert(str){
        var _this = this;
        if(_this.quill){
          let selection = _this.quill.getSelection(true);
          console.log("4444444"); 
          (selection)&&(-1<selection.index)&&(_this.quill.insertText(selection.index, str, 'user')),_this.quill.setSelection(selection.index + str.length, 0)
        }
      },
      enterKey($event){
        // console.log("enter hit");
        // console.log($event);
        var formatType =  (this.GET_TYPE_SETTING.line ? '\n' : '') + (this.GET_TYPE_SETTING.indent ? '\u2003\u2003' : '');
        var formatIndex = 3
        if(this.GET_TYPE_SETTING.indent==true && this.GET_TYPE_SETTING.line==true){
          formatIndex = 3
        }else if(this.GET_TYPE_SETTING.indent==true && this.GET_TYPE_SETTING.line==false){
          formatIndex = 2
        }else if(this.GET_TYPE_SETTING.indent==false && this.GET_TYPE_SETTING.line==true){
          formatIndex = 1
        }else if(this.GET_TYPE_SETTING.indent==false && this.GET_TYPE_SETTING.line==false){
          formatIndex = 0
        }
        let selection = this.quill.getSelection();
        // if(this.setting.typesetting){
        this.quill.updateContents(new Delta()
          .retain(selection.index)
          .insert(formatType)
          , 'user');
          // process.nextTick(() => {
        this.quill.setSelection({index: selection.index + formatIndex, length: 0}, 'silent');  
          // });
        // }else{
        //    this.quill.updateContents(new Delta()
        //     .retain(selection.index)
        //     .insert('\uFEFF')
        //     , 'user');
        // }

        // this.quill.updateContents(new Delta()
        //   .retain(selection.index)
        //   .insert(' ')
        //   , 'user');
        // this.quill.updateContents(new Delta()
        //   .retain(selection.index)
        //   .delete(1)
        //   , 'user');
        // this.scrollSearch(selection.index, 'normal');
        // let bounds = this.quill.getBounds({index: selection.index});
        // console.log("bounds: ");
        // console.log(bounds);
        // if(this.inView(bounds.top + bounds.height, 'normal')){
        //   //just do nothing
        // }else{
        //   console.log("should go scrolllllllllllllllllll");
        //   //let scrollOffset = this.setting.fontSize * (this.setting.lineHeight + 1);
        //   console.log(this.lineHeightInPixel)
        //   this.scrollEditor(this.lineHeightInPixel, 'normal');
       
        // }
      },
      mouseRight($event){
        let realEditor = document.getElementById('real-editor')
        this.$emit('mouse-right',{'event':$event,'width':realEditor.clientWidth})
        // console.log('mouseRight',$event)
        // let mouseRight = document.getElementById("mouseright");
        // mouseRight.style.left = $event.clientX+'px';
        // mouseRight.style.top = $event.clientY+'px';
        // this.mouseShow = true
        // console.log('mouseright',this.quill.getSelection())
      },
      
      toggleIfScroll(aBool){
        this.noScroll = aBool;
      },
      scrollSearch(pos, type){
        if(!this.noScroll && type !== 'normal') return;
        let bounds = this.quill.getBounds({index: pos});
        let inView = this.inView(bounds.top + bounds.height, 'normal');
        if(inView){
          console.log("in view");
          //add this to deal with scroll jump issue cause by quill
          //consider remove this after using quill 2.0.0
          let scrollEle = document.getElementById("scroll-this");
          this.scrollEditor(scrollEle.scrollTop, 'persist');
        }else{
          //should scroll
          console.log("go scroll~~~~~~~~~~~~");
          //30 padding
          let scrollOffset = 0;
          if(type === 'normal'){
            scrollOffset = this.lineHeightInPixel;
          }else{
            scrollOffset = bounds.top+bounds.height;
          }
          // this.scrollEditor(bounds.top+bounds.height, type);
          this.scrollEditor(scrollOffset, type); 
        }
      },
      inView(locTop, type){
        //scroll this element
        let scrollEle = document.getElementById("scroll-this");
        console.log(scrollEle);
        console.log("scrollTop: " + scrollEle.scrollTop);
        console.log("clientHeight: " + scrollEle.clientHeight);
        console.log("loc Top is: " + locTop);
        if(type === 'normal'){ 
          if(locTop < scrollEle.scrollTop){
            //in the front of
            return false;
          }else if(locTop > (scrollEle.scrollTop + scrollEle.clientHeight - writingPaddingTop)){
            //at the end of
            return false;
          }else{
            //in view
            return true;
          }
        }else if(type === 'search'){
          console.log("this is a search case, deprecated: use normal for now")
        }  
      },
      scrollEditor(scrollOffset, type){
        // console.log("user typing?: " + this.noScroll);
        if(!this.noScroll && type !== 'normal') return;
        // console.log("run TYPE: " + type);
        let scrollEle = document.getElementById("scroll-this");
        let oldTop = scrollEle.scrollTop;
        process.nextTick(() => {
          if(type === 'normal'){
            scrollEle.scrollTop += scrollOffset;
          }else if(type === 'persist'){
            //FUCK QUILL JUMPING
            scrollEle.scrollTop = scrollOffset;
          }else{ //search case
            scrollEle.scrollTop = scrollOffset - 0.5*scrollEle.clientHeight
          }
        })
      },
      editorKeyDown(event){
        if(((event.metaKey)&&(event.keyCode === 83))||((event.ctrlKey)&&(event.keyCode === 83))){
          // console.log(`触发保存操作~`)
          this.$emit('saveChapter')
        }else if(((event.metaKey)&&(event.keyCode === 78))||((event.ctrlKey)&&(event.keyCode === 78))){
          // console.log(`触发新建操作`)
          this.$emit('newChapter')
        }
        else if(((event.metaKey)&&(event.keyCode === 70))||((event.ctrlKey)&&(event.keyCode === 70))){
          this.$emit('unSearch')
          // console.log(`触发搜索操作`)
        }
          

        // else if(((event.metaKey)&&(event.keyCode === 67))||((event.ctrlKey)&&(event.keyCode === 67))){
        //   console.log("copy key down: ")
        //   console.log(event);
        //   // event.preventDefault();
        //   // console.log("try to overwrite copy")
        // }
      },
    },
    watch: {
      // Watch content change
      content(newVal, oldVal) {
        if (this.quill) {
          if (newVal && newVal !== this.contents) {
            console.log("you are called !!!!!!!!!!!!!!!!")
            this.contents = newVal
            // this.quill.setText('')
            this.clearChapData = true;
            this.quill.setText(newVal)
            this.clearChapData = false;
            // this.quill.pasteHTML(newVal)
            // this.quill.history.clear();
            // console.log("watch here~!!!!!!!!")
            // console.log(this.quill.history)
          } else if(!newVal) {
            if(!this.clearChapData){
              this.quill.setText('', 'silent')
              this.quill.history.clear();
            }
          }
        }
      },
      // Watch disabled change
      disabled(newVal, oldVal) {
        if (this.quill) {
          this.quill.enable(!newVal)
        }
      },
      settings(newVal, oldVal){
        this.resetStyle();
        this.lineHeightInPixel = (this.setting.lineHeight*2) * parseInt(this.setting.fontSize);
      },
      'setting.typesetting': function(newVal, oldVal){
        let lines = this.quill.getLines();
        console.log(lines)
        // console.log(lines[13].children.head)
        // this.quill.formatText(1, 3, '\u2003\u2003', 'user')
        // for(let i = 0; i<liens.length; i++){
        //   if(liens[i].children.head)
        // }
      }
    },
    mounted() {
      var typeSetting = store.get('typeSetting')
        if(typeSetting){
            if(typeSetting[this.GET_USET_DATA.uid]){
                this.UPDATE_TYPE_SETTING({indent: typeSetting[this.GET_USET_DATA.uid].indent, line: typeSetting[this.GET_USET_DATA.uid].line})
            }
            
        }
      document.getElementById('real-editor').addEventListener('keydown', this.editorKeyDown)

      document.addEventListener('copy', function(e){
        console.log("on copy event: ");
        console.log(e);

        console.log("clipboard data types: " + e.clipboardData.types);
        // let plain = e.clipboardData.getData('text/plain');
        // let html = e.clipboardData.getData('text/html');
        // let uri = e.clipboardData.getData('text/uri-list');
        // let csv = e.clipboardData.getData('text/csv');
        // let jsonObj = e.clipboardData.getData('application/json');
        // let xml = e.clipboardData.getData('application/xml');
        // let xmlText = e.clipboardData.getData('text/xml');

        // console.log("plain: " + plain);
        // console.log("html: " + html);
        // console.log("uri: " + uri);
        // console.log("csv: " + csv);
        // console.log("json: " + jsonObj);
        // console.log("xml: " + xml);
        // console.log("xmlText: " + xmlText);        

        // console.log("go go up:")
        let copyData = window.getSelection().toString();
        copyData = copyData.replace(/\uFEFF/g, "");
        // copyData.replace(/\uFFFE/g, "");
        copyData = copyData.replace(/\n/g, "\r\n");
        copyData = copyData.replace(" ", "\u00a0");
        // console.log(copyData.toString());
        // console.log(e.clipboardData.getData('text'));
        e.clipboardData.setData('text/plain', copyData);
        // e.clipboardData.setData('text/html', copyData);
        // e.clipboardData.setData('text/uri-list', copyData);
        // e.clipboardData.setData('text/css', copyData);
        // e.clipboardData.setData('text/csv', copyData);
        // e.clipboardData.setData('application/json', copyData);
        // e.clipboardData.setData('application/xml', copyData);
        e.clipboardData.setData('text/xml', copyData);
        // e.clipboardData.setData('image/svg+xml', copyData);
        e.preventDefault();
      })

      // 初始化样式值
      this.initialize();

      // this.global.addEventListener('compositionstart', () => {
      //   this.global.classList.add('ql-composition');
      // });

      // this.root.addEventListener('compositionend', () => {
      //   this.global.classList.remove('ql-composition');
      // });

      // $(document).on('compositionstart', 'editor', () => {
      //   console.log("go add!!!!!!!!!!!!!");
      //   $(this).addClass('my-ql-composition');
      // });
      // $(document).on('compositionend', 'editor', () => {
      //   $(this).removeClass('my-ql-composition');
      // });      
      // document.on()
      // let editorEle = document.getElementById('editor');
      // editorEle.addEventListener('compositionstart', () => {
      //   editorEle.addClass('my-ql-composition');
      // });
      // editorEle.addEventListener('compositionend', () => {
      //   editorEle.removeClass('my-ql-composition');
      // });

      this.quill.scroll.domNode.addEventListener('input', () => {
        console.log("delta comp input");
        console.log('delta comp firstLineIndex', this.firstLineIndex)
        if(this.typeWriting != 'chinese'){
          this.typeWriting = 'english'
          this.insertIndex = this.quill.getSelection().index
          console.log('delta comp index', this.insertIndex)
          let insertSelection = this.quill.getSelection();
          if(this.GET_TYPE_SETTING.indent && this.insertIndex==1 && this.firstLineIndex == true){
            this.quill.updateContents(new Delta()
            .retain(0)
            .insert('\u2003\u2003')
            , 'user');
            process.nextTick(() => {
              this.quill.setSelection({index: insertSelection.index+2, length: 0}, 'api');  
            });
          }

        }
        this.firstLineIndex = false;

      });

      this.quill.scroll.domNode.addEventListener('compositionstart', () => {
        this.typeWriting = 'chinese'
        console.log("comp start!1111");
        this.insertIndex = this.quill.getSelection().index

        console.log("comp start at",this.insertIndex);
        // console.log("comp start!1111");
        // this.duringComp = true;

        // this.quill.scroll.domNode.add('ql-composition');
      });
      this.quill.scroll.domNode.addEventListener('compositionend', () => {
        console.log("comp end!22222222222222");

        this.duringComp = false;
        let insertSelection = this.quill.getSelection();

        //stupid code to get rid of insert Chinese chars problem
        //text-change event fired before composition-end

        //行首缩进
        if(this.GET_TYPE_SETTING.indent && this.insertIndex==0){
          this.quill.updateContents(new Delta()
          .retain(0)
          .insert('\u2003\u2003')
          , 'user');
          process.nextTick(() => {
            this.quill.setSelection({index: insertSelection.index+2, length: 0}, 'api');  
          });
        }
        this.typeWriting = '' 
        // // console.log("comp end!22222222222222");
        // this.duringComp = false;
        // let insertSelection = this.quill.getSelection();

        // //stupid code to get rid of insert Chinese chars problem
        // //text-change event fired before composition-end
        // this.quill.updateContents(new Delta()
        //   .retain(insertSelection.index)
        //   .insert(' ')
        //   , 'user');
        // this.quill.updateContents(new Delta()
        //   .retain(insertSelection.index)
        //   .delete(1)
        //   , 'user');
      });

      ipcRenderer.on('export-chapter', (event, arg, chapters) => {
        console.log('tada');
        this.$emit('toggle-waiting-modal', {value:true, type: 'export'});
        var _this = this;
        var ext = path.extname(arg);
        console.log("chapters: ");
        console.log(chapters);
        console.log("arg: " + arg);
        let doc = null;
        let para = null;
        // const packer = new docx.Packer();
        let fdInt = 0;
        // const packer;
        console.log("doc is: " + doc);

        // fdInt = fs.openSync(arg, 'a');


        // return;
        if(ext === '.txt'){
          let i = 0;
          let fdInt = null;
          let volumeTitle = "";
          let volumeUuid = "";
          this.getChapData(chapters[i], function(data){
            console.log("data come to control!");
            console.log(data);
            if(!fdInt){
              fdInt = fs.openSync(arg, "w+");
            }

            if(i === 0){
              fs.writeFileSync(fdInt, `${chapters[i].bookTitle}\r\n`, {encoding: 'utf8', flag:'a'});
            }

            if(volumeUuid !== chapters[i].volume_uuid){
              volumeUuid = chapters[i].volume_uuid
              volumeTitle = chapters[i].volumeTitle;
              fs.writeFileSync(fdInt, `${chapters[i].volumeTitle}\r\n`, {encoding: 'utf8', flag:'a'});
            }

            fs.writeFileSync(fdInt, `${chapters[i].title}\r\n`, {encoding: 'utf8', flag:'a'});
            let writeContent = (data.length > 0 && data[0].content && data[0].content !== '\n') ? data[0].content.replace(/\n/g, "\r\n") : "本章为空\r\n";

            writeContent = writeContent.replace(/\uFEFF/g, "");

            fs.writeFile(fdInt, writeContent, {encoding: 'utf8', flag:'a'}, (err) => {
              if(err){
               _this.$message({showClose: true, message: '导出出错了, 请检查该文件是否被其它软件打开',type: 'error'});
               fs.closeSync(fdInt);
               console.log("blah")
               this.$emit('toggle-waiting-modal', {value:false, type: 'export'});

               i = 0;
               fdInt = null;
               return;
              }else{
                i++;
                if(i < chapters.length){
                  console.log("get more chaps: " + i);
                  this.getChapData(chapters[i]);
                }else{
                  console.log("write txt done!")
                  fs.closeSync(fdInt);
                  i = 0;
                  fdInt = null;
                  volumeTitle = "";
                  _this.$message({showClose: true, message: '导出成功',type: 'success'})
                  console.log("rara")
                  this.$emit('toggle-waiting-modal', {value:false, type: 'export'});
                }
              }
            });


          })

        }else if(ext === '.docx'){
          // console.log("docx is: ");
          // console.log(docx);
          // console.log("lines are: ");
          let i = 0;
          let volumeTitle = "";
          let volumeUuid = "";

          console.log("volume titie is: " + volumeTitle);
          this.getChapData(chapters[i], function(data){
            console.log("data come to control!");
            console.log(data);

            if(!doc){
              console.log("we here?");
              doc = new Document();
            }

            console.log("volume titie is: " + volumeTitle);

            if(i === 0){
              para = new Paragraph();
              para.addRun(new TextRun(`${chapters[0].bookTitle}`).bold().font("宋体").size(40));
              doc.addParagraph(para.left());
              para = new Paragraph();
              doc.addParagraph(para);
              volumeTitle = chapters[0].volumeTitle;
              volumeUuid = chapters[0].volume_uuid

              para = new Paragraph();
              console.log("before add run volumeTitle is: " + volumeTitle);
              para = para.addRun(new TextRun(`${volumeTitle}`).bold().font("宋体").size(32));
              doc.addParagraph(para.left());
              para = new Paragraph();
              doc.addParagraph(para);
            }

            if(volumeUuid !== chapters[i].volume_uuid){
              volumeUuid = chapters[i].volume_uuid
              volumeTitle = chapters[i].volumeTitle;
              para = new Paragraph();
              para = para.addRun(new TextRun(`${volumeTitle}`).bold().font("宋体").size(32));
              doc.addParagraph(para.left());
              para = new Paragraph();
              doc.addParagraph(para);                
            }

            para = new Paragraph();
            para = para.addRun(new TextRun(`${chapters[i].title}`).bold().font("宋体").size(28));
            doc.addParagraph(para.left());
            para = new Paragraph();
            doc.addParagraph(para);  

            let startIndex = 0;
            let chopIndexesArr = [];
            if(data.length > 0 && data[0].content){
              data[0].content = data[0].content.replace(/\uFEFF/g, "");
              // data[0].content = data[0].content.replace(/\s/g, "\u2003");
              // data[0].content = data[0].content.replace(/\n/g, "\u000A\u000D");
              // data[0].content = data[0].content.replace(/\s/g, "\u00a0");
              while(startIndex < data[0].content.length){
                let findIndex = data[0].content.indexOf("\n", startIndex);
                // console.log("find index: " + findIndex);
                if(findIndex === -1){
                  para = new Paragraph(data[0].content.substr(startIndex)); //.replace(/\s/g, "\u2003"));// + '\u000A\u000D')  // + '\r');
                  // console.log("para: ");
                  // console.log(para);
                  // para = '<p>' + para + '</p>'
                  doc.addParagraph(para);
                  // para = new Paragraph();
                  // doc.addParagraph(para);
                  startIndex = data[0].content.length;
                }else{
                  //+1 for \r\n, length is 2
                  // console.log("content");
                  // console.log(data[0].content);
                  // console.log("start index: " + startIndex);
                  // console.log("find index: " + findIndex);
                  // console.log("picked data: " + data[0].content.substr(startIndex, findIndex-startIndex));
                  if((startIndex - findIndex) !== 0){
                    para = new Paragraph(data[0].content.substr(startIndex, findIndex-startIndex)); //.replace(/\s/g, "\u2003"))// + '\u000A\u000D')   //+ '\r');
                    // console.log("para: ");
                    // console.log(para);
                    // para = '<p>' + para + '</p>'
                    doc.addParagraph(para);
                  }else{
                    //case: only 1 char in this line, means its a return after return
                    para = new Paragraph();
                    doc.addParagraph(para);
                  }

                  startIndex = findIndex+1;
                  chopIndexesArr.push(findIndex);

                }
              }
            }else{
              para = new Paragraph("本章为空");
              doc.addParagraph(para);
              para = new Paragraph();
              doc.addParagraph(para);
            }


            // console.log("chop index is: " + chopIndexesArr);

            // para = new Paragraph(data[0].content);
            // console.log("doc");
            // console.log(doc);
            // console.log("para");
            // console.log(para);
            // doc.addParagraph(para);

            i++;
            if(i < chapters.length){
              console.log("get more chaps")
              this.getChapData(chapters[i]);
            }else{
              console.log("all chap clear")
              let packer = new Packer();
              // exporter.pack("My Test Docx");
              packer.toBuffer(doc).then((buffer) => {
                try{
                  fs.writeFileSync(arg, buffer);
                  _this.$message({showClose: true, message: '导出成功',type: 'success'})
                   // (err) => {
                   //  console.log("1223")
                   //  if(err) console.log(err);
                   //  if(!err) _this.$message({showClose: true, message: '导出成功',type: 'success'})
                  // }）;
                }catch(e){
                  console.log("catch error: ");
                  console.log(e);
                  _this.$message({showClose: true, message: '导出出错了, 请检查该文件是否被其它软件打开',type: 'error'})
                }
                //reset status after finish
                this.$emit('toggle-waiting-modal', {value:false, type: 'export'});
                doc = null;
                i = 0;
                volumeTitle = "";
              });
            }
          }); 

          return;

        }else{
          _this.$message({showClose: true, message: '只支持txt 和 doc文件',type: 'error', iconClass: "none"})
          return;
        }
      })
    },
    beforeDestroy() {
      this.quill = null
      delete this.quill
    },
    components: {
    }
  }
</script>
<style>
.search-popover-center{
  font-size: 12px;
  box-sizing: border-box;
  line-height: 1.5;
  text-align: left;
  padding: 8px 14px 10px 10px;
  text-align: left;
  text-align: justify;
}
.writing-editor .ql-editor{
  height: auto;
  padding: 0 0 10em;
  line-height: inherit;
  overflow: inherit;
  font-weight: inherit;
  word-break: break-word;
  position: relative;
}
.ql-editor.ql-blank::before{
  font-style: normal !important;
  color: var(--colorTextDefault) !important;
  left: 0 !important;
}

</style>

<style scoped>
.writing{
  display: flex;
  flex: 1;  
  overflow: overlay;
}
.writing-editor{
  flex: 1;
}
.writing-editor{
  width: 100%;
  padding: 30px 40px 0;
  box-sizing: border-box;
  /* display: flex */
}
.writing-editor .cg-editor{
  height: auto;
  min-height: 100%;
  border: none;
  flex: 1;
}

.min-select{
  width: 100px;
}

</style>
