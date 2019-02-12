<template>
  <div id="editor" @click.left="mouseLeft($event)" @mouseleave="mouseup"  @mouseup="mouseup"   @mousedown="tragDown" @mousemove.stop="trag" :class="tragData.showCussor > 1?'showCussor':''" >
     <!--菜单栏-->
    <menu-bar :shouldShow="showUser" :showTheme='true' :showSetting='true' @show-setting-modal="showSetting"></menu-bar>
    <el-container>
      <el-aside class="chapter-box" v-show="!isFlodLeft"   ref="chapterBox">
        <div class="operate-book">
          <div class="operate-one">
            <a href="javascript:;" @click="dialogTableVisible = true">
              <i class="iconfont icon-dakai" title="打开书籍"></i>
              <!-- <img v-bind:src="imgDakai" title="打开书籍"> -->
              <span>打开书</span>
            </a>
            <span class="xian"></span>
            <a href="javascript:;" @click="newBook">
              <i class="iconfont icon-xinjian" title="新建书籍"></i>
              <!-- <img v-bind:src="imgXinjian" title="新建书籍"> -->
              <span>新建书</span>
            </a>
          </div>
          <div class="operate-new">
            <el-button type="primary" size="mini" @click="newVolume">新建卷</el-button>
            <el-button type="primary" size="mini" @click="newChapter">新建章</el-button>
            <!-- <a href="javascript:;" class="cre-chapter">新建</a>
            <div class="operate-hover">
              <a href="javascript:;" class="cre-chapter" @click="newVolume">新建卷</a>
              <a href="javascript:;" class="cre-chapter" @click="newChapter" style="margin-top:5px">新建章节</a>
            </div> -->
          </div>
          <!-- <el-button class="cre-chapter" type="info">新建章节</el-button> -->
        </div>
        <!-- <div class="chapter-list" v-if="filterBookItem"> -->
          <div class="multi-sel-bar">
            <span v-if="!treeConfig.showCheckbox" @click="toggleSelectionMode()">批量选择</span>
            <span v-else @click="toggleSelectionMode()">取消选择</span>
            <span class="to-right" @click="exportChapter">导出</span>
          </div>
          <p class="book-name"  v-if="filterBookItem">
            <i class="iconfont icon-book" style="font-size:14px;"></i>
            <!-- <img :src="imgBookIcon">  -->
           <span :title="filterBookItem.title">
             {{filterBookItem.title}} 
           </span>
            <!-- <i style="float:right;" class="el-icon-refresh" @click="updateBook"></i> -->
            <i style="float:right;font-size:18px;" class="iconfont icon-tongbu" @click="updateBook"></i>
          </p>
          <!-- :show-checkbox="treeConfig.showCheckbox" -->
          <el-tree v-if="filterBookItem"  ref="bookTree" :data="GET_CURRENT_BOOK_VOLUMES_L1"  empty-text="" :props="defaultProps" :default-expanded-keys="treeConfig.defaultExpanded" :lazy="true" @current-change="treeChange" @node-click="treeClick" @node-expand="volumeExpand" @node-contextmenu="showMenu" highlight-current node-key="client_uuid" show-checkbox :class="treeConfig.showCheckbox ? 'showBox': 'hideBox'">
          <!-- :show-checkbox="treeConfig.showCheckbox">       -->
              <div class="custom-tree-node" slot-scope="{ node, data }">
                <title-change :data="data" :node="node" :treeload='treeload' :ref="data.client_uuid"></title-change>
            </div>
          </el-tree>
      </el-aside>
      <el-container>
        <!-- <div class="tools-bar" v-if="this.GET_PLUGIN_SETTING.display"> -->
        <div class="tools-bar" v-show="true">
          <ul>
            <li>
              <a @click="openOutLine()" class="item" href="javascript:;"><img :src="imgOutline" alt="">
                <span>大纲</span>
              </a>
            </li>
            <!-- <li>
              <a class="item" href="javascript:;"><img :src="imgRandomLock" alt="">
                <span>随机锁定</span>
              </a>
            </li> -->
            <li v-if="this.GET_PLUGIN_SETTING.enable_coercion_lock">
              <a class="item" href="javascript:;" @click="forceLockClicked"><img :src="imgForceLock" alt="">
                <span>强制锁定</span>
              </a>
            </li>
            <li>
            <li v-if="this.GET_PLUGIN_SETTING.enable_random_name">
              <a @click="RandomNameVisible = true" id="random-name" class="item" href="javascript:;"><img :src="imgRandomName" alt="">
                <span>随机起名</span>
              </a>
            </li>
            <li v-if="this.GET_PLUGIN_SETTING.enable_senwords">
              <a @click="dialogWord = true" class="item" href="javascript:;"><img :src="imgSensitiveWord" alt="">
                <span>敏感词</span>
              </a>
            </li>
            <li v-if="this.GET_PLUGIN_SETTING.enable_notes" class="noteItem">
              <a @click="noteVisible = true; noteType=1; book_uuid = filterBookItem.client_uuid" class="item" href="javascript:;"><img :src="imgInspirationNote" alt="">
                <span>灵感随笔</span>
              </a>
                <ul class="noteOptions">
                  <li @click="noteVisible = true; book_uuid = filterBookItem.client_uuid">创建灵感随笔</li>
                  <li v-if="this.GET_NOTES.NOTE_LIST.length" @click="selectionNote">选择灵感随笔</li>
                </ul>
            </li>
            <!-- <li>
              <a class="item" href="javascript:;"><img :src="imgCoseForecast" alt="">
                <span>稿费预测</span>
              </a>
            </li>
            <li>
              <a class="item" href="javascript:;"><img :src="imgCollate" alt="">
                <span>校对</span>
              </a>
            </li>
            <li>
              <a class="item" href="javascript:;"><img :src="imgNightMode" alt="">
                <span>夜间模式</span>
              </a>
            </li> -->

            <!-- <li>
              <a @click="NOTE_SYNC" class="item" href="javascript:;">
                <span>批量同步随笔</span>
              </a>
            </li>
            <li>
              <a @click="GET_CLOUD_NOTES({book_uuid:'book-a002',page:0,update_time: GET_NOTES.UPDATE_TIME})" class="item" href="javascript:;">
                <span>获取云端随笔</span>
              </a>
            </li> -->
            
          </ul>
          <i class="el-icon-arrow-up btn-collapse" v-show="show"></i>
        </div>
        <div class="article-title">
          <div class="book-title-list">
            <ul>
              <li v-for="item in filterBookList" @click.stop="selectBook(item.client_uuid)" :key="item.client_uuid" :class="(item.client_uuid == reyDookid)? 'actived': ''" :title="item.title">
                <span class="ellipsis">{{item.title}}</span>
                <i class="iconfont icon-guanbichuangkou1" @click.stop="closeBook(item)"></i>
                <!-- <span>{{item.title}}</span>
                <i class="el-icon-close" @click.stop="closeBook(item)"></i> -->
              </li>
            </ul>
          </div>
          <i class="el-icon-arrow-up btn-collapse" v-show="show"></i>

        </div>
          <div class="writing-toolbar" id="toolbar" name="toolbar">
            <div class="toolbarCenter">
              <div class="overs">
                <el-select v-bind:value="setting.fontFamily" v-on:input="doFont" class="min-select fl" size="mini" placeholder="字体" title="字体">
                  <el-option
                    v-for="item in fontFamilyList"
                    :key="item.key"
                    :label="item.value"
                    :value="item.key">
                  </el-option>
                </el-select>
                <el-select v-bind:value="setting.fontSize" v-on:input="doSize" style="width:60px;" class="min-select fl" size="mini" placeholder="字号" title="字号">
                  <el-option
                    v-for="item in fontSizeList"
                    :key="item"
                    :label="item"
                    :value="item">
                  </el-option>
                </el-select>
                <el-select v-bind:value="setting.lineHeight" v-on:input="doLine" class="min-select fl" size="mini" placeholder="行间距" title="行间距">
                  <el-option
                    v-for="item in lineHeightList"
                    :key="item.key"
                    :label="item.value"
                    :value="item.key">
                  </el-option>
                </el-select>
              </div>
              <div class="overwrap" v-show="!isOverWrapUtil">
                <span :class="setting.fontWeight == 'bold'?'bold active':'bold'" title="加粗" @click="doBold">
                  <i class="iconfont icon-jiacu"></i>
                  <!-- <img :src="toolbarImg.bold"> -->
                </span>
                <span :class="setting.fontStyle == 'italic'?'italic active':'italic'" title="斜体" @click="doItalic">
                  <i class="iconfont icon-qingxie"></i>
                  <!-- <img :src="toolbarImg.italic"> -->
                </span>
                <span title="网格线" :class="setting.underline == true?'underline active':'underline'" @click="doUnderline">
                  <i class="iconfont icon-xiahuaxian"></i>
                  <!-- <img :src="toolbarImg.underline"> -->
                </span>
                <span class="divide" title="分割线" @click="divide">
                  <i class="iconfont icon-fengexian"></i>
                  <!-- <img :src="toolbarImg.fenge"> -->
                </span>
                <span :class="search.visible == true?'unSearch active':'unSearch'" title="搜索" @click="unSearch">
                  <i class="iconfont icon-search"></i>
                  <!-- <img :src="toolbarImg.chazhao"> -->
                </span>
                <span class="copy" title="复制" @click="copy">
                  <i class="iconfont icon-fuzhi"></i>
                  <!-- <img :src="toolbarImg.copy"> -->
                </span>
                <span class="paste" title="粘贴" @click="paste">
                  <i class="iconfont icon-zhantie"></i>
                  <!-- <img :src="toolbarImg.paste"> -->
                </span>
                <span class="cut" title="剪切" @click="cut">
                  <i class="iconfont icon-cut" style="font-size:14px;"></i>
                  <!-- <img :src="toolbarImg.cut"> -->
                </span>
                <span class="undo" title="撤销" @click="undo">
                  <i class="iconfont icon-chehui"></i>
                  <!-- <img :src="toolbarImg.cancel"> -->
                </span>
                <span class="redo" title="恢复" @click="redo">
                  <i class="iconfont icon-quxiaochehui" style="font-size:10px;"></i>
                  <!-- <img :src="toolbarImg.chongzuo"> -->
                </span>
                <span class="typesetting" :class="setting.typesetting == true?'typesetting active':'typesetting'" title="自动排版" @click="typesetting">
                  <i class="iconfont icon-paiban"></i>
                  <!-- <img :src="toolbarImg.paiban"> -->
                </span>
              </div>
              <div class="toolbarRighr">
                <span class="saveChapter" title="保存" @click="saveChapter(true)">
                  <i class="iconfont icon-baocun"></i>
                  <!-- <img :src="toolbarImg.save"> -->
                </span> 
                <span class="exportChapter" title="导出" @click="exportChapter">
                  <i class="iconfont icon-daochu"></i>
                  <!-- <img :src="toolbarImg.saveas"> -->
                </span> 
                <span class="importChapter" title="导入" @click="importChapter">
                  <i class="iconfont icon-daoru"></i>
                  <!-- <img :src="toolbarImg.putin"> -->
                </span> 
              </div>
            </div>
            <i class="el-icon-arrow-up btn-collapse" v-show="show"></i>
          </div>
        <el-container>
          <el-main class="edit-main" disabled>
            <!-- <p>编辑器</p> -->
             <!--  @doSize="doSize" @blur="blur" @doLine="doLine" @focus="focus" @doFont="doFont" @doBold="doBold" @doItalic="doItalic" @doUnderline="doUnderline" -->
             <div class="wraitingBox"  ref="writingbox" >
                <div class="cg-writing" >
                  <div class="writing-search" v-show="search.visible">
                    <div class="search-input">
                      <el-input
                        size="small"
                        placeholder="请输入内容"
                        v-model="search.searchText"
                        ref="searchText"
                        v-on:input="searchInputChanged">
                      </el-input>
                    </div>
                    <el-button-group class="miniBtnRow">
                      <el-button icon="el-icon-search"  class="miniBtn icon-search" @click="searchInputChanged(search.searchText)"></el-button>
                      <el-button icon="el-icon-caret-bottom"  class="miniBtn" @click="toNext()"></el-button>
                      <el-button icon="el-icon-caret-top"  class="miniBtn" @click="toPre()"></el-button>
                    </el-button-group>
                    <el-popover
                    width="251"
                    trigger="hover"
                    content='当查找有内容，而替换内容为空时，双击"替换"或"替换本章"即可将查找内容删除' 
                    popper-class="search-popover-center">
                      <el-button slot="reference" class="search-popover-title">?</el-button>
                    </el-popover>
                    <div class="search-input">
                      <el-input
                        size="small"
                        placeholder="请输入替换内容"
                        v-model="search.replaceText"
                        v-on:input="replaceInputChanged">
                      </el-input>
                    </div>
                    <el-button type="primary" class="maxBtn" @click="replace()">替换</el-button>
                    <el-button type="info" plain class="maxBtn replace-all" @click="replaceAll()">替换本章</el-button>
                  </div> 
                  <div class="utilwrap" v-show="isOverWrapUtil">
                    <span :class="setting.fontWeight == 'bold'?'bold active':'bold'" title="加粗" @click="doBold">
                      <i class="iconfont icon-jiacu"></i>
                      <!-- <img :src="toolbarImg.bold"> -->
                    </span>
                    <span :class="setting.fontStyle == 'italic'?'italic active':'italic'" title="斜体" @click="doItalic">
                      <i class="iconfont icon-qingxie"></i>
                      <!-- <img :src="toolbarImg.italic"> -->
                    </span>
                    <span title="网格线" :class="setting.underline == true?'underline active':'underline'" @click="doUnderline">
                      <i class="iconfont icon-xiahuaxian"></i>
                      <!-- <img :src="toolbarImg.underline"> -->
                    </span>
                    <span class="divide" title="分割线" @click="divide">
                      <i class="iconfont icon-fengexian"></i>
                      <!-- <img :src="toolbarImg.fenge"> -->
                    </span>
                    <span :class="search.visible == true?'unSearch active':'unSearch'" title="搜索" @click="unSearch">
                      <i class="iconfont icon-search"></i>
                      <!-- <img :src="toolbarImg.chazhao"> -->
                    </span>
                    <span class="copy" title="复制" @click="copy">
                      <i class="iconfont icon-fuzhi"></i>
                      <!-- <img :src="toolbarImg.copy"> -->
                    </span>
                    <span class="paste" title="粘贴" @click="paste">
                      <i class="iconfont icon-zhantie"></i>
                      <!-- <img :src="toolbarImg.paste"> -->
                    </span>
                    <span class="cut" title="剪切" @click="cut">
                      <i class="iconfont icon-cut" style="font-size:14px;"></i>
                      <!-- <img :src="toolbarImg.cut"> -->
                    </span>
                    <span class="undo" title="撤销" @click="undo">
                      <i class="iconfont icon-chehui"></i>
                      <!-- <img :src="toolbarImg.cancel"> -->
                    </span>
                    <span class="redo" title="恢复" @click="redo">
                      <i class="iconfont icon-quxiaochehui" style="font-size:10px;"></i>
                      <!-- <img :src="toolbarImg.chongzuo"> -->
                    </span>
                    <span class="typesetting" :class="setting.typesetting == true?'typesetting active':'typesetting'" title="自动排版" @click="typesetting">
                      <i class="iconfont icon-paiban"></i>
                      <!-- <img :src="toolbarImg.paiban"> -->
                    </span>
                  </div>
                  <!-- <el-button type="primary" class="maxBtn" @click="replace()">替换</el-button>
                  <el-button type="info" plain class="maxBtn replace-all" @click="replaceAll()">替换本章</el-button> -->
                  <writing ref="writing" :disabled="disabled" :content="chapter.content" :setting="setting" @unSearch="unSearch" @newChapter="newChapter" @typesetting="typesetting" @saveChapter="saveChapter(true)"  @change="editorChange($event)" @selection-change="selectionChange($event)" @imported="imported($event)" @toggle-waiting-modal="toggleWaitingModal($event)" @pasting-status="setPasteStatus($event)"></writing>
                  <span @click="isFlodLeft = !isFlodLeft" class="flod-btn flod-left">
                    <i :class="isFlodLeft?'iconfont icon-arrowright':'iconfont icon-arrowleft'"></i>
                  </span>
                  <span @click="isFlodRightFn" class="flod-btn flod-right">
                    <i :class="isFlodRight?'iconfont icon-arrowleft':'iconfont icon-arrowright'"></i>
                  </span>
                  <!-- <writing ref="writing" :disabled="disabled" :content="chapter.content" :setting="setting" @unSearch="unSearch" @newChapter="newChapter" @typesetting="typesetting" @saveChapter="saveChapter(true)"  @change="editorChange($event)" @input="input" @selection-change="selectionChange($event)" @imported="imported($event)" @toggle-waiting-modal="toggleWaitingModal($event)" @pasting-status="setPasteStatus($event)" @mouse-right="mouseRight($event)"></writing>
                  <span @click="isFlodLeft = !isFlodLeft" class="flod-btn flod-left">
                    <i :class="isFlodLeft?'iconfont icon-arrowright':'iconfont icon-arrowleft'"></i>
                  </span>
                  <span @click="isFlodRight = !isFlodRight" class="flod-btn flod-right">
                    <i :class="isFlodRight?'iconfont icon-arrowleft':'iconfont icon-arrowright'"></i>
                  </span> -->
                </div>
              </div>
          </el-main>

        <el-aside class="statistics-box" v-show="!isFlodRight">
            <div class="item-warp">
              <!-- <div class="item-box pluging-box" v-if="this.GET_PLUGIN_SETTING.display"> -->
              <div class="item-box pluging-box" v-if="!(this.GET_PLUGIN_SETTING.enable_coercion_lock==0 && this.GET_PLUGIN_SETTING.enable_senwords==0 && this.GET_PLUGIN_SETTING.enable_random_name==0 && this.GET_PLUGIN_SETTING.enable_notes==0)">
                <div class="item-title">
                  <span class="item-name">插件箱</span>
                </div>
                <ul>
                  <li v-if="this.GET_PLUGIN_SETTING.enable_coercion_lock" @click="forceLockClicked">
                    <!-- <img :src="imgRiForceLock" alt=""> -->
                    <i class="iconfont icon-lock"></i>
                    <p><span>强制<br>锁定</span></p>
                  </li>
                  <li v-if="this.GET_PLUGIN_SETTING.enable_senwords" @click="dialogWord = true">
                    <i class="iconfont icon-minganci"></i>
                    <!-- <img :src="imgRiSensitiveWord" alt=""> -->
                    <p><span>敏感<br>词</span></p>
                  </li>
                  <li v-if="this.GET_PLUGIN_SETTING.enable_random_name" @click="RandomNameVisible = true">
                    <i class="iconfont icon-suijiquming"></i>
                    <!-- <img :src="imgRiRandomName" alt=""> -->
                    <p><span>随机<br>取名</span></p>
                  </li>
                  <li class="noteItem2" v-if="this.GET_PLUGIN_SETTING.enable_notes" >
                    <i class="iconfont icon-linggan"></i>
                    <!-- <img :src="imgRiInspirationNote" alt=""> -->
                    <p @click="noteVisible = true; noteType=1; book_uuid = filterBookItem.client_uuid"><span>灵感<br>随笔</span></p>
                    <div  v-if="this.GET_NOTES.NOTE_LIST.length" class="noteOptions2" :style="{ left: this.GET_NOTES.NOTE_LIST.length==0?'0':'-50%'}">
                      <span @click="noteVisible = true; book_uuid = filterBookItem.client_uuid">创建</span>
                      <span @click="selectionNote">选择</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div class="item-box">
                <div class="item-title">
                  <span class="item-name">实时统计</span>
                  <!-- <a class="s-btn btn-hide" href="javascript:;">隐藏</a> -->
                </div>

                <div class="item-card">
                  <div class="sub-count">
                    <span class="sub-title">本次字数</span>
                    <span class="sub-num">{{wordCount}}</span>
                  </div>
                  <div class="sub-count">
                    <span class="sub-title">输入速度
                      <i>(字/时)</i>
                    </span>
                    <span class="sub-num">{{typeSpeed}}</span>
                  </div>
                </div>

                <div class="item-card">
                  <div class="sub-count">
                    <span class="sub-title">码字时间</span>
                    <span class="sub-num">{{typeTimeDisplay}}</span>
                  </div>
                  <div class="sub-count">
                    <span class="sub-title">空闲时间</span>
                    <!-- <span class="sub-num">{{idleTime}}</span> -->
                    <span class="sub-num">{{idleTimeDisplay}}</span>
                  </div>
                </div>
                <!-- 排行测试 -->
                <!-- <div class="item-card">
                  <el-button @click="statistics_sync">排行同步</el-button>
                </div> -->
                
              </div>

              
              <div class="item-box" v-if="false">
                <div class="item-title">
                  <span class="item-name">稿费预测</span>
                  <a class="s-btn btn-hide" href="javascript:;">隐藏</a>
                </div>
                <div class="item-card">
                  <div class="sub-count">
                    <span class="sub-title">本章稿费(元)</span>
                    <span class="sub-num">9999</span>
                  </div>
                </div>
                <div class="item-card">
                  <div class="sub-count">
                    <span class="sub-title">本次稿费(元)</span>
                    <span class="sub-num">99</span>
                  </div>
                </div>
              </div>
              <div v-if="GET_NOTES.NOTE_LIST.length">
                <div class="item-box item-idea" v-for="(item,index) in GET_NOTES.NOTE_LIST" :key="item.id" v-if="item.is_selected && !item.is_deleted">
                  <div class="item-title">
                    <span class="item-name">
                      <i :style="{'background-color': tagsColor[item.type_color].color}"></i>{{item.title}}</span>
                    <a class="s-btn btn-hide" href="javascript:;" @click="hideNote(index)">隐藏</a>
                  </div>
                  <div :class="'item-card '+'bg-'+item.type_color" @dblclick="previewNote(index)">
                    <p>{{item.content}}</p>
                  </div>
                </div>
              </div>
            </div>
          </el-aside>

        </el-container>

<!--         <el-dialog :visible=true width="30%" center modal :show-close=false>
          <i class="el-icon-loading"></i>
        </el-dialog>
 -->
        <waiting v-if="waitingVisible" :waitingMessage="waitingMessage" :waitingType="waitingType" :importFileDetail="importFileDetail" @toggle-waiting-modal="toggleWaitingModal($event)"></waiting>
         <!-- :closeModal="toggleWaitingModal(false)" -->
        <!-- //:closeWaiting="toggleWaitingModal(false) -->

        <el-footer>
          <p class="all-count" v-if="filterBookItem">全书字数：
            <!-- <span>{{wholeBookWordCount}}</span> -->
            <span>{{filterBookItem.word_count}}</span>
          </p>
          <p class="chapter-count" v-if="chapter.chapter_uuid">本章字数：
            <span class="select-length" v-if="selectTextLength"><i>{{selectTextLength}}</i> / </span><span>{{chapter.wordNum}}</span>
          </p>
          <p class="clock-count" v-if="wordGoal > 0">锁定字数：
            <span>{{wordProgress}}字/{{wordGoal}}字</span>
          </p>
          <p class="time-count" v-if="timeGoal > 0">锁定时间：
            <span>{{lockTimeDisplay}}分钟/{{timeGoal}}分钟</span>
          </p>
          <p class="time-now">
            <span>{{timeDate}}</span>
          </p>
          <p class="time-now">
            <span v-html="chapter_status"></span>  
          </p>
        </el-footer>

      </el-container>

    </el-container>

    <!-- 随机取名 -->
    <random-name @closeOpenRandomName="closeOpenRandomName" :userCenterFlag="RandomNameVisible" v-if="RandomNameVisible"></random-name>
    <force-lock @closeForceLock="closeForceLock" :userCenterFlag="forceLockVisible" v-if="forceLockVisible"></force-lock>
    <settings :userCenterFlag="settingsVisible" v-if="settingsVisible" @closeSettings="closeSettings"></settings>
    <!-- 选择书本弹出层 -->
    <!-- <el-dialog class="book-open-cla" title="打开书籍" :visible.sync="dialogTableVisible" width="540px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false"> -->
    <book-open @closeOpenWindow="closeOpenWindow" :userCenterFlag="dialogTableVisible" v-if="dialogTableVisible"></book-open>
    <!-- </el-dialog> -->
    <!-- 新建书本弹出层 -->
    <book-new @closeOpenBookNew="closeOpenBookNew" :userCenterFlag="bookNewVisible" :openDialogPurpose="openDialogPurpose" :triggerWindow="currentWindowName" v-if="bookNewVisible"></book-new>        
    <!-- 敏感词 -->
    <sensitive-word @closeDialogWord="closeDialogWord" :userCenterFlag="dialogWord" v-if="dialogWord"></sensitive-word>
    <!-- 灵感随笔 -->
    <inspiration-note @closeOpenNote="closeOpenNote" @changeNoteType="changeNoteType" :noteType="noteType" :noteIndex="noteIndex" :viewNote="viewNote" :book_uuid="book_uuid"  v-if="noteVisible"></inspiration-note>
    <!-- 大纲 -->
    <outline @closeOpenOutLine="closeOpenOutLine" :userCenterFlag="outlineVisible" v-if="outlineVisible"></outline>
    <bubble v-if="bubbleVisible"></bubble>
    <water-mark v-if="waterMarkVisible"></water-mark>
    <ul class="mouse-right" id="mouseright" v-show="mouseShow">
      <li @click="copy">复制</li>
      <li @click="paste">粘贴</li>
      <li @click="cut">剪切</li>
      <li @click="selectAll">全选</li>
      <li @click="unSearch">查找替换</li>
      <li @click="typesetting">一键排版</li>
    </ul>
  </div>
</template>

<script>
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

import bookOpen from '@/components/pages/bookOpen/bookOpen';
import bookNew from '@/components/pages/bookNew/bookNew';
import writing from '@/components/pages/editor/writing';
import sensitiveWord from '@/components/plugins/sensitiveWord/sensitiveWord'
import randomName from '@/components/plugins/randomName/randomName'
import titleChange from '@/components/pages/editor/titleChange'
import menuBar from '@/components/pages/menuBar/menuBar.vue'
import inspirationNote from '@/components/plugins/inspirationNote/inspirationNote'
import forceLock from '@/components/plugins/forceLock/forceLock'
import bubble from '@/components/pages/music/bubble'
import waiting from '@/components/pages/dialog/waiting';
import settings from '@/components/plugins/settings/settings';
import waterMark from '@/components/plugins/waterMark/waterMark';
import outline from '@/components/pages/outline/outlineIndex';

import {chapter_content} from './../../../store/API.js'
import { Container,Header,Aside,Main,Button,Dialog,Select,Input } from "element-ui";
import { ipcRenderer, remote, MenuItem, Menu, ipcMain } from "electron";
import {mapActions,mapMutations, mapGetters} from 'vuex'
import path,{ resolve, relative } from "path";
import uuid from 'uuid-random'
// import { setTimeout } from 'timers';
import getMsg from 'static/js/msgApi.js'
import { fnGetCpmisWords } from '../../../../../static/js/public.js'

import Delta from 'quill-delta';
import localQuery from '@/helper/query.js';
import compareData from '@/helper/compare.js';

const store = require('store/dist/store.modern');
const chardet = require('chardet');
const fs = require('fs');
const iconv = require('iconv-lite');

let BrowserWindow =remote.BrowserWindow;
let time = null;

//todo: make an standard error module
const tooLongOperation = ",已为你导入并保留2万字。";
const failedOperation = ",未进行导入。"
const tooLongError = "超过2万字";

export default {
  data() {
    return {
      isOverWrapUtil:false,//换行
      
      tragData:{
        showCussor:false,
        isDown:false
      },
      chapter:{
        content:"",
        recordContent: "",
        chapter_uuid: "",
        version: "",
        // 同步状态 0:真正同步 1:同步成功 2:同步失败
        is_upload: 1,
        wordNum: 0
      },
      selectTextLength: 0,
      reyDookid: '',
      // 书籍列表控制
      treeConfig:{
        defaultExpanded: [],
        showCheckbox: false,
      },
      treeload: false,
      defaultProps: {
        children: "chapters",
        label: "title",
        isLeaf: function (data, node){
          // console.log('isleaf',data)
          if(data.type == 2){
            return false
          }else{
            return true
          }
        }
      },
      toolbarImg:{
        bold: 'static/imgs/middle/toolbar/bold.png',
        cancel: 'static/imgs/middle/toolbar/cancel.png',
        chazhao: 'static/imgs/middle/toolbar/chazhao.png',
        chongzuo: 'static/imgs/middle/toolbar/chongzuo.png',
        copy: 'static/imgs/middle/toolbar/copy.png',
        cut: 'static/imgs/middle/toolbar/cut.png',
        fenge: 'static/imgs/middle/toolbar/fenge.png',
        italic: 'static/imgs/middle/toolbar/italic.png',
        paiban: 'static/imgs/middle/toolbar/paiban.png',
        paste: 'static/imgs/middle/toolbar/paste.png',
        save: 'static/imgs/middle/toolbar/save.png',
        saveas: 'static/imgs/middle/toolbar/saveas.png',
        underline: 'static/imgs/middle/toolbar/underline.png',
        putin: 'static/imgs/middle/toolbar/putin.png',
      },
      imgDakai: "static/imgs/left/openbook.png",
      imgXinjian: "static/imgs/left/xinjianbook.png",
      imgOutline: "static/imgs/middle/outline.png",
      imgForceLock: "static/imgs/middle/force_lock.png",
      imgRandomLock: "static/imgs/middle/random_lock.png",
      imgRandomName: "static/imgs/middle/random_name.png",
      imgSensitiveWord: "static/imgs/middle/sensitive_word.png",
      imgInspirationNote: "static/imgs/middle/inspiration_note.png",
      imgCoseForecast: "static/imgs/middle/cose_forecast.png",
      imgCollate: "static/imgs/middle/collate.png",
      imgNightMode: "static/imgs/middle/night_mode.png",
      imgClose: "static/imgs/middle/close.png",
      imgBookIcon: "static/imgs/left/book.png",
      imgBookTrue: "static/imgs/left/fail.png",
      //插件箱
      imgRiForceLock: "static/imgs/middle/lock@2x.png",
      imgRiSensitiveWord: "static/imgs/middle/minganci@2x.png",
      imgRiRandomName: "static/imgs/middle/quming@2x.png",
      imgRiInspirationNote: "static/imgs/middle/linggan@2x.png",
      //面板折叠
      imgFlodLeft: "static/imgs/middle/fold_left.png",
      imgFlodRight: "static/imgs/middle/fold_right.png",
      isFlodLeft: false,
      isFlodRight: false,
      isFlodRightWidth:190,
      //灵感随笔模块
      // imgSelected: "static/imgs/note/selected.png",
      // imgDelete: "static/imgs/note/delete.png",
      // imgEdit: 'static/imgs/note/edit.png',
      // dialogVisible: false,
      // dialogVisible2: false,
      // innerVisible: false,
      // selectImgToggle: [],
      // deleteImgToggle: false,
      dialogWord: false,
      book_uuid: "",
      //看起来 这个book_uuid没有用啊
      curBookUuid: "",


      // bookName: '',

      //a flag tells if user has input some char
      userInputStarted: false,
      wordCount: 0,
      // accumulate only
      formerWordCount: 0,
      typeSpeed: 0,
      typeTime: 0,
      totalTime: 0,
      idleState: false,
      idleTime: 0,
      totalTimeDisplay: '00:00:00',
      idleTimeDisplay: '00:00:00',
      typeTimeDisplay: '00:00:00',
      timeInterval: null,
      // lastKeyUp: (new Date()).getTime(),
      // looks like we dont need to get time stamp, this would save some calculations
      lastKeyUpTime: 0,
      // afk pending time 5secs, if exceeds 5secs, pend it as idle
      afkPendingTime: 5,
      // idle status: true for idle |  false for typing
      isIdle: false,
      // current chapter counter when open
      curChapCountOnOpen: 0,
      // curBookCountOnOpen: 0,
      // wholeBookWordCount: 0,
      realChapterOnOpen: 0,

      showUser: true,
      waitingMessage: "导出中...",
      waitingType: "",
      importFileDetail: [], 
      //[{name:'第一个', error: '太长', operation: ',已为你导入并保留2万字。'}, {name:'第二个', error: '太短', operation: ',已为你导入并保留2万字。'}],

      // force lock data
      wordGoal: 0,
      wordProgress: 0,
      formerWordProgress: 0,
      wordGoalStarter: 0,
      timeGoal: 0,
      timeProgress: 0,
      lockTimeDisplay: 0,
      locked: '',

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

      // //标签选中下标
      // activeColor: 'darkGreen',
      // step: 1,
      // insName: '',
      // insContent: '',
      // preEditContent: '',
      // insList: [],
      // selectIndex: 0,
      // selectInsList: [],
      // isEdit: false,

      noteVisible: false,
      noteType: 1,
      noteIndex: 0,
      viewNote: false,

      // 选择书本弹出层
      dialogTableVisible: false,
      // 新建书本弹出层
      bookNewVisible: false,
      // 随机取名弹出层
      RandomNameVisible: false,
      forceLockVisible: false,
      waitingVisible: false,
      settingsVisible: false,
      waterMarkVisible: true,
      bubbleVisible: false,
      outlineVisible: false,
      bookList: this.GET_BOOKS_L1,
      // 编辑器设置
      disabled: true,
      setting: {
          fontFamily: 'SimSun',
          fontSize: '16',
          fontWeight: 'normal',
          fontStyle: 'normal',
          lineHeight: 1,
          nightmode: false,
          underline: false,
          typesetting: false
      },
      fontFamilyList: [{value: "宋体", key: "SimSun"}, {value: "微软雅黑", key:"Microsoft Yahei"}, {value: "黑体", key:"SimHei"}, {value: "仿宋", key: "FangSong"}, {value: "华文黑体", key: "STHeiti"},{value: "华文楷体", key: "STKaiti"}],
      fontSizeList: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
      lineHeightList: [{value: "0.5倍行距",key: 0.5}, {value:"0.75倍行距",key: 0.75}, {value:"1倍行距", key: 1}, {value:"1.25倍行距",key:1.25},{value: "1.5倍行距",key: 1.5},{value:"1.75倍行距",key: 1.75},{value: "2倍行距",key: 2},{value: "2.5倍行距",key: 2.5},{value:"3倍行距",key: 3}],

      notes: this.NOTE_LIST,

      subscribe: '',

      // 搜索模块
      search:{
        visible: false,
        searchText: "",
        replaceText: "",
        curPos: 0,
        resultIndexArray: []
      },
      // 时间展示模块
      timeDate: '',
      show: false,
      // newType 用于锁定新建卷新建章的按钮, 以防点击过快，如果duringImport 为true，则无效
      newType: true,
      // 是否处于批量导入中，如果处于批量导入，忽略newType
      duringImport: false, 
      // 是否触发当关闭当前窗口
      closewindow: false,
      // 是否显示章节多选框
      // showMultiSelectionButton: true,
      // 事实同步章节内容判断
      syncChapterConfig: {
        tackTime: 0,
        maxTime: 10,
        markRedo: 0,
        markUndo: 0,
        lastTime: 0
      },
      //实时数据统计
      statisticsTime: 0,
      //导入用章节数组
      chaptersWaitForImport: [],
      totalChaptersForImport: 0,
      failedChaptersForImport: 0,

      maxWordPerChap: 0,
      maxBytePerChap: 0,

      duringPaste: false,
      typePaste: true,
      // 保存本地文件，是否提示结果
      operateFiletype: false,
      //鼠标右键菜单
      mouseShow: false,

      openDialogPurpose: 'new',
      currentWindowName: 'editorWindow'
      
    };
  },
  methods: {
    ...mapActions({
      CREATE_NEW_VOLUME_L1: 'CREATE_NEW_VOLUME_L1',
      CREATE_NEW_CHAPTER_L1: 'CREATE_NEW_CHAPTER_L1',
      INFO_BOOK: 'INFO_BOOK',
      VOLUME_ADD_BOOK: 'VOLUME_ADD_BOOK',
      CHAPTER_ADD_BOOK: 'CHAPTER_ADD_BOOK',
      CHAPTER_DEL_BOOK: 'CHAPTER_DEL_BOOK',
      VOLUME_DEL_BOOK: 'VOLUME_DEL_BOOK',
      CHAPTER_UP_BOOK: 'CHAPTER_UP_BOOK',
      OPEN_BOOK: 'OPEN_BOOK',

      NOTE_LIST: 'NOTE_LIST',
      DELETE_NOTE: 'DELETE_NOTE',
      ADD_NOTE: 'ADD_NOTE',
      UPDATE_NOTE_CONTENT: 'UPDATE_NOTE_CONTENT',
      UPDATE_NOTE_SELECTED: 'UPDATE_NOTE_SELECTED',
      NOTE_SYNC: 'NOTE_SYNC',
      GET_CLOUD_NOTES: 'GET_CLOUD_NOTES',

      CLIENT_LIST_BOOK: 'CLIENT_LIST_BOOK',
      LIST_BOOK: 'LIST_BOOK',
      LIST_VOLUMES: 'LIST_VOLUMES',
      LIST_LOCAL_AND_ONLINE_CHAPTERS: 'LIST_LOCAL_AND_ONLINE_CHAPTERS',
      LIST_VOLUMES_O_L: 'LIST_LOCAL_AND_ONLINE_VOLUMES',
      CHAPTER_CONTENT_SYNC: 'CHAPTER_CONTENT_SYNC',
      PLUGIN_SETTING: 'PLUGIN_SETTING',
      UPDATE_PLUGIN_SETTING: 'UPDATE_PLUGIN_SETTING',
      LOCAL_PLUGIN_SETING: 'LOCAL_PLUGIN_SETING',
      SYNC_USER_CHANGE_BOOK: 'SYNC_USER_CHANGE_BOOK',
      GET_CHAPTER_CONTENT_L1: 'GET_CHAPTER_CONTENT_L1',
      SYNC_UPDATE_BOOK_CONTENT_L1: 'SYNC_UPDATE_BOOK_CONTENT_L1',

      INSERT_CONFLICT_CHAPTER_L1: 'INSERT_CONFLICT_CHAPTER_L1'
    }),
    ...mapMutations({
      SELECT_BOOK: 'SELECT_BOOK',
      CLOSE_BOOK: 'CLOSE_BOOK',
      SET_BOOKS_L1: 'SET_BOOKS_L1',
      ADD_OPEN_BOOK_TO_EDITOR_L1: 'ADD_OPEN_BOOK_TO_EDITOR_L1',
      SET_CURRENT_BOOK_ID_L1: 'SET_CURRENT_BOOK_ID_L1',
      SET_BOOK_CONTENT_L1: 'SET_BOOK_CONTENT_L1',
      SET_CHAPTERS_TO_VOLUME_IN_EDITOR_L1: 'SET_CHAPTERS_TO_VOLUME_IN_EDITOR_L1'
    }),
    tragDown(e){
      if(this.tragData.showCussor > 1) this.tragData.isDown = true;
    },
    isFlodRightFn(){
      if(this.isFlodRight && this.isFlodRightWidth <=30){
        document.querySelector('.statistics-box').style.width = '190px';
      }
      this.isFlodRight = !this.isFlodRight;
    },
    trag(e){
      let that = this;
      let _x = e.clientX;
      let _box_width = document.querySelector('#editor').clientWidth; //总宽度
      let _main_width = document.querySelector('.edit-main').clientWidth; //编辑区宽度
      let _left_box_width = document.querySelector('.chapter-box').clientWidth; //左边区宽度
      let _right_box_width = document.querySelector('.statistics-box').clientWidth; //右边区宽度
      let _bar_box_width = document.querySelector('#toolbar').clientWidth; //右边区宽度
      if(this.tragData.isDown && this.tragData.showCussor > 1){
        if(this.tragData.showCussor == 2){
          if( _x <= 179){
            setTimeout(() => {
              document.querySelector('.chapter-box').style.width = '179px';
            }, 0);

            return;
          }
          if(_box_width - _x <= 440){
             return;
          }
            setTimeout(() => {
             document.querySelector('.chapter-box').style.width = _x +'px';
            }, 0);

        }else if(this.tragData.showCussor == 3){
          let isMaxRightWidth = _box_width - 440 - _left_box_width;
          let setRightWidth = _box_width - _x
          if(setRightWidth >= isMaxRightWidth && _x < (440 + _left_box_width)){
            setTimeout(() => {
              that.isFlodRightWidth = isMaxRightWidth;
              document.querySelector('.statistics-box').style.width = isMaxRightWidth +'px';
            }, 0);
            return;
          }
          if(_x >= _box_width - 30){
            this.isFlodRight = true
            this.isFlodRightWidth = 0;
            this.tragData.isDown = false
          }else{
            setTimeout(() => {
              document.querySelector('.statistics-box').style.width = setRightWidth +'px';
              that.isFlodRightWidth = setRightWidth;
            }, 0);
          }
        
        }
        if(_bar_box_width <= 720){
          this.isOverWrapUtil = true;
        }else{
          this.isOverWrapUtil = false;
        }
        return;
      }
      let _left = _x - _left_box_width; 
      let _right = _x - _main_width - _left_box_width;
      if(_left <= 2 && _left >= -2){
        this.tragData.showCussor = 2;
      }else if(_right <= 2 && _right >= -2){
        this.tragData.showCussor = 3;
      }else{
        this.tragData.showCussor = 1;
      }
    },
    mouseup(e){
      this.tragData.isDown = false;
      // if($event.button == 0){
      //   let selectLength = window.getSelection().toString()
      //   console.log(selectLength)
      //   if(selectLength.length > 0){
      //     this.selectTextLength = fnGetCpmisWords(selectLength)
      //   }else{
      //     this.selectTextLength = 0
      //   }
      //   // fnGetCpmisWords(window.getSelection().toString())
      // }
      
    },
    nativeClick() {
      console.log("native clicked triggered in editor")
    },

    showSetting() {
      console.log("should show setting modal");
      this.openSettingsModal();
    },

    openSettingsModal(){
      console.log("try to open settings modal");
      this.settingsVisible = true;
    },  
    openOutLine (data) {
      localStorage.setItem("filterBookItem",JSON.stringify(this.filterBookItem));
       console.log(JSON.stringify(localStorage.getItem("filterBookItem")))
      ipcRenderer.send('ipc-openOutLine', {path: '#/outlineIndex'})
    },
    randomName() {
      let win = new BrowserWindow({
        width: 950,
        height: 680,
        titleBarStyle: "hidden",
        autoHideMenuBar: !0,
        show: false
      });
      win.on("close", function() {
        win = null;
      });
      let path = `file://${__dirname}/index.html`
      // win.loadURL(path+'#/bename')
      win.loadURL("http://localhost:9080/#/bename");
      // win.webContents.openDevTools()
      win.show();
    },
    searchInputChanged(value, type) {
      this.$nextTick(() => {
        // console.log("source is: " + type);
        // console.log("search input changed called");
        let textString = this.editor.getText();
        this.search.searchText = value;
        // this.search.text = value;
        if(type !== "keep-color"){
          this.editor.formatText(0, textString.length, {
            'background-color': 'transparent'
          }, 'silent');
        }

        if(type === "search-text-no-change"){
          this.$refs.writing.toggleIfScroll(false)
        }else{
          this.$refs.writing.toggleIfScroll(true)
        }

        let persistIndex = 0;
        if(type === "replace-persist")
        {
            persistIndex = this.search.curPos;
            // console.log("persist index is:" + persistIndex);
        }

        if(!value){
          return;
        }

        // console.log("search input event is:");
        // console.log(value);

        // console.log("textString is: " + textString);

        // let posArray = [];
        this.search.resultIndexArray = [];
        this.search.curPos = 0;
        let pos = -1;
        let gotHighlighted = false;

        do{
          pos = textString.indexOf(value, pos+1);
          // console.log("pos is: " + pos);
          if(pos >= 0){
            this.search.resultIndexArray.push(pos);
            let useColor = "#FBBD36";
            if(persistIndex){
              if(this.search.resultIndexArray.length === (persistIndex+1)){
                console.log("interesting place");
                useColor = "#FF8833";
                gotHighlighted = true;
                this.search.curPos = persistIndex;
                
                this.$refs.writing.scrollSearch(pos, 'search')
                // let bounds = this.editor.getBounds({index: pos});
                // let inView = this.$refs.writing.inView(bounds.top + bounds.height, 'normal');
                // if(inView){
                //   console.log("in view");
                // }else{
                //   //should scroll
                //   console.log("go scroll~~~~~~~~~~~~");
                //   //30 padding
                //   this.$refs.writing.scrollEditor(bounds.top+bounds.height, 'search'); 
                // }



              }
            }else{
              if(this.search.resultIndexArray.length === 1){
                useColor = "#FF8833";
                gotHighlighted = true;
                this.$refs.writing.scrollSearch(pos, 'search');

                // let bounds = this.editor.getBounds({index: pos});
                // let inView = this.$refs.writing.inView(bounds.top + bounds.height, 'normal');
                // if(inView){
                //   console.log("in view");
                // }else{
                //   //should scroll
                //   console.log("go scroll~~~~~~~~~~~~");
                //   //30 padding
                //   this.$refs.writing.scrollEditor(bounds.top+bounds.height, 'search'); 
                // }
              }
            }
            // console.log("do coloring @pos: " + pos);
            // console.log("length is: " + value.length);
            // console.log("color is: " + useColor);
            this.editor.formatText(pos, value.length, {
              'background-color': useColor
            }, 'silent')
          }
        }while (-1 !== pos);
        // console.log("result array： " + this.search.resultIndexArray);
        if(!gotHighlighted){
          if(this.search.resultIndexArray.length > 0){
            this.editor.formatText(this.search.resultIndexArray[0], value.length, {
              'background-color': "#FF8833"
            }, 'silent')
          }else{
            // console.log("not found anything");
            this.$message({showClose: true, message: '没有找到匹配的字段', type: 'warning'})           
          }
        }
      })

    },
    toNext(){
      // console.log("try to get editor ele：");
      // let edEle = document.getElementById("scroll-this");
      // console.log(edEle);
      // edEle.scrollTop = 350;
      // edEle.scrollIntoView();
      this.$refs.writing.toggleIfScroll(true);
      console.log("before: " + this.search.curPos);
      let oldPos = this.search.curPos;
      console.log("to next clicked");
      this.search.curPos++;
      if((this.search.curPos) >= this.search.resultIndexArray.length){
        this.search.curPos = 0;
      }
      console.log("curPos is: " + this.search.curPos);

      this.editor.formatText(this.search.resultIndexArray[oldPos], this.search.searchText.length, {'background-color': "#FBBD36"}, 'silent');
      this.editor.formatText(this.search.resultIndexArray[this.search.curPos], this.search.searchText.length, {'background-color': "#FB8833"}, 'silent');
      // process.nextTick(() => {
        console.log("AAAAAAAAAAAAAAAA")
        // this.editor.focus();
        this.editor.setSelection({index: this.search.resultIndexArray[this.search.curPos] + this.search.searchText.length, length: 0}, 'api');
      // })
      // console.log(this.$refs.writing.inView);
      this.$refs.writing.scrollSearch(this.search.resultIndexArray[this.search.curPos] + this.search.searchText.length, 'search');
      // let bounds = this.editor.getBounds({index: this.search.resultIndexArray[this.search.curPos] + this.search.searchText.length});
      // let inView = this.$refs.writing.inView(bounds.top + bounds.height, 'normal');
      // if(inView){
      //   console.log("in view");
      // }else{
      //   //should scroll
      //   console.log("go scroll~~~~~~~~~~~~");
      //   //30 padding
      //   this.$refs.writing.scrollEditor(bounds.top+bounds.height, 'search'); 
      // }
    },
    toPre(){
      this.$refs.writing.toggleIfScroll(true);
      console.log("to prev: " + this.search.curPos);
      let oldPos = this.search.curPos;
      this.search.curPos--;
      if(this.search.curPos < 0){
        this.search.curPos = this.search.resultIndexArray.length-1;
      }
      this.editor.formatText(this.search.resultIndexArray[oldPos], this.search.searchText.length, {'background-color': "#FBBD36"}, 'silent');
      this.editor.formatText(this.search.resultIndexArray[this.search.curPos], this.search.searchText.length, {'background-color': "#FB8833"}, 'silent');
      process.nextTick(() => {
        console.log("bbbbbbbbb")
        this.editor.setSelection({index: this.search.resultIndexArray[this.search.curPos] + this.search.searchText.length, length: 0}, 'api');          
      })

      this.$refs.writing.scrollSearch(this.search.resultIndexArray[this.search.curPos] + this.search.searchText.length, 'search')
      // let bounds = this.editor.getBounds({index: this.search.resultIndexArray[this.search.curPos] + this.search.searchText.length});
      // let inView = this.$refs.writing.inView(bounds.top + bounds.height, 'normal');
      // if(inView){
      //   console.log("in view");
      // }else{
      //   //should scroll
      //   console.log("go scroll~~~~~~~~~~~~");
      //   //30 padding
      //   this.$refs.writing.scrollEditor(bounds.top+bounds.height, 'search'); 
      // }      
    },
    replace(){
      if(this.search.resultIndexArray.length === 0){
        console.log("just return");
        return;
      }

      let headString = this.editor.getText().substr(0, this.search.resultIndexArray[this.search.curPos]);
      let tailString = this.editor.getText().substr(this.search.resultIndexArray[this.search.curPos]);
      console.log("headString is: " + headString);
      console.log("tailString is: " + tailString);
      console.log("search text is: " + this.search.searchText);
      console.log("replace text is: " + this.search.replaceText);
      let newTailString = tailString.replace((new RegExp(this.search.searchText)), this.search.replaceText);
      console.log("tailString after is: " + newTailString);
      let replacedString = headString.concat(newTailString);
      this.editor.setContents([
        {insert: replacedString}
      ], 'api');
      console.log("cccccccc")
      this.editor.setSelection({index: this.search.resultIndexArray[this.search.curPos] + this.search.replaceText.length, length: 0}, 'api');
      // this.editor.formatText(0, this.editor.getText().length, {
      //   'background-color': 'white' 
      // }, 'silent'); 
      this.$nextTick(() => {
        this.searchInputChanged(this.search.searchText, "replace-persist");
      });
    },
    replaceAll(){
      if(this.search.resultIndexArray.length === 0){
        console.log("just return");
        return;
      }

      let fullString = this.editor.getText();
      let replacedString = fullString.replace((new RegExp(this.search.searchText, 'g')), this.search.replaceText);
      this.editor.setContents([
        {insert: replacedString}
      ], 'silent')
      this.searchInputChanged(this.search.searchText);
    },
    replaceInputChanged(value){
        this.search.replaceText = value;
        console.log("replace text is: " + this.search.replaceText);
    },

    getLocalAndOnlineVolumes(){
      console.log("try to get local and online volumes");
      let localVols = [];
      let onlineVols = [];
      console.log("cur book uuid is: " + this.curBookUuid);
      localQuery.listLocalVolumes({client_uuid: this.curBookUuid}).then((res) =>{
        console.log("list vols res:")
        console.log(res);
      }, (err) => {
        console.log("list vols err:")
        console.log(err);
      }).finally(() => {
        this.LIST_VOLUMES({book_uuid: this.curBookUuid, token: this.GET_USET_DATA.token}).then((onlineRes) => {
          console.log("list vols online res: ");
          console.log(onlineRes);
        })
      })
    },
    selectionNote(){
      this.noteVisible = true;
      this.noteType = 2;
    },
    volumeExpand(data, node, dom){
      return new Promise((resolve, reject)=>{
      
      this.treeload = true;

      console.log("expand node!");
      console.log(data);
      console.log(node);
      console.log(dom);
      this.LIST_LOCAL_AND_ONLINE_CHAPTERS({volume_uuid: data.client_uuid, book_uuid: data.parent_client_uuid, token: this.GET_USET_DATA.token, uid: this.GET_USET_DATA.uid})
      .then((res)=>{
        console.log('章节加载完成',res)
        resolve(res)
        this.treeload = false;
        //当前卷为选中状态时，展开此卷勾选子节点
        if(this.treeConfig.showCheckbox){
          let checkKeys = this.$refs.bookTree.getCheckedKeys()
          if(checkKeys.indexOf(data.client_uuid) > -1){
            this.$refs.bookTree.setChecked(data.client_uuid,true,true)
          }

        }
      })
      // console.log('wancheng',p)
      })
    },
    treeClick(data, node, dom){
      // console.log(this.$refs[data.client_uuid]
      // return ;
      let chapter = this.chapter;
      let history = this.editor.history.stack||{redo:[], undo: []};
        // if(history.redo.length||history.undo.length){
      let _this = this;
      // 校验点击是否是章节，是否是当前正在编写的章节(解决双击修改名称，会触发两次click事件)
      if((node.level != 2)||(data.chapter_uuid === chapter.chapter_uuid)){
        // this.LIST_LOCAL_AND_ONLINE_CHAPTERS({volume_uuid: data.client_uuid, book_uuid: data.parent_client_uuid, token: this.GET_USET_DATA.token})
        return false
      }

      console.log("this history in editor");
      console.log(this.editor.history);

      // if(data.hasConflict && data.hasConflict=='online'){   //点击线上冲突章时，奖线上内容插入到对应章，此时无需同步
      //   let conflictData = this.GET_CHAPTER_CONTENT_L1({chapter_uuids:[data.chapter_uuid],token: this.GET_USET_DATA.token})
      //   console.log('conflictData',conflictData)
      //   conflictData.then((res)=>{
      //     if(res.data.status==200){
      //       let chapterArry = res.data.result.chapters
      //       let chapterCont = chapterArry[0].chapter_detail
      //       this.info_chapter({chapter_uuid: chapterArry[0].chapter_uuid, volume_uuid: data.volume_uuid, content: chapterCont.content, recordContent: '', version: chapterCont.version, wordNum: chapterCont.word_count})

      //       localQuery.updateItemInDB({data: {version: chapterCont.version, is_upload: '1', content: chapterCont.content, client_uuid: chapterCont.chapter_uuid }, changedProps: ['is_upload','content','version'], tableName: 'chapter_content'})

      //     }
      //     console.log('conflictData',res)
      //   })
      // }else if(data.hasConflict && data.hasConflict=='local'){  //点击本地冲突章时，读取新插入章内容（镜像章，chapterid已更改）并同步章内容
        
      // }else{

      // }
      
      this.$sqliteDB.queryData(`select * from chapter_content where chapter_uuid='${data.chapter_uuid}' and is_deleted = 0 and uid='${this.GET_USET_DATA.uid}'`).then((res) => {
        console.log("res: ");
        console.log(res);
        if(res[0]){
          let chapterData = chapter.chapter_uuid?_this.$refs.bookTree.getNode(chapter.chapter_uuid).data:''
          console.log('chapterdata',chapterData)
          if((_this.chapter.chapter_uuid)&&(history.redo.length||history.undo.length)&&(chapter.chapter_uuid != data.client_uuid)){
            // 判断是否多次切换章节状态，内容已被修改，所点击不是当前章
            console.info(JSON.stringify(chapterData))
            // return false;
            console.log('多次打开章准备同步')
            _this.sync_chapter_content({chapter: chapterData})
            this.editor.history.clear();
            this.init_spawn_sync()
            console.log("tree click: ");
            console.log(data.volume_uuid);
            this.info_chapter({chapter_uuid: res[0].chapter_uuid, volume_uuid: data.volume_uuid, content: res[0].content, recordContent: '', version: res[0].version, wordNum: chapterData.wordNum})
          }else if ((_this.chapter.chapter_uuid)&&(history.redo.length||history.undo.length)&&(chapter.chapter_uuid == data.client_uuid)){
            // 判断是否多次切换章节状态，内容已被修改，所点击的是当前章
            console.log('点击当前的章保存')
            _this.sync_chapter_content({chapter: chapterData})
          }else{
            // 初次激活状态初始化内容
            console.log("tree click: ");
            console.log(data.volume_uuid);
            _this.info_chapter({chapter_uuid: res[0].chapter_uuid, volume_uuid: data.volume_uuid, content: res[0].content, recordContent: '', version: res[0].version, wordNum: chapterData.wordNum})
          }
        }else{
          console.log('本地没有该章节内容，拉取线上并插库')
          this.disabled= true;
          let onlineData = this.GET_CHAPTER_CONTENT_L1({chapter_uuids:[data.chapter_uuid],token: this.GET_USET_DATA.token})
          onlineData.then((res)=>{
            if(res.data.status==200){
              let chapterArry = res.data.result.chapters
              if(chapterArry){
                let chapterCont = chapterArry[0].chapter_detail
                this.info_chapter({chapter_uuid: chapterArry[0].chapter_uuid, volume_uuid: data.volume_uuid, content: chapterCont.content, recordContent: '', version: chapterCont.version, wordNum: chapterCont.word_count})
            //     localQuery.insertChapterToDB({data: chapterData, user: data.uid, parentId: chapterData.volume_uuid});
                chapterCont['bookId'] = data.bookId;
                chapterCont['client_uuid'] = data.chapter_uuid;
                
                console.log('onlineData',chapterCont)

                localQuery.insertChapterContentToDB({data: chapterCont, uid: this.GET_USET_DATA.uid, needUpload: false, content: chapterCont.content}).then((res) => {
                  this.disabled= false;
                })
              }else{
                _this.create_chapter_content(data.client_uuid);
              }
              
            }
          })


        }
      });
    console.log('触发点击章节，更新chapter数据')
    console.log(JSON.stringify(this.chapter))
    },
    create_chapter_content(chapter_uuid){
      let uuid = this.uuid();
      let uid = this.GET_USET_DATA.uid
      let intoBook = [chapter_uuid, uuid, uid, '', 0, 0, 0]
      let chapter = this.chapter;
      let history = this.editor.history.stack||{redo:[], undo: []};
      // this.chapter.chapter_uuid = chapter_uuid;
      this.$sqliteDB.insertData(
        `insert into chapter_content(${chapter_content}) values (?,?,?,?,?,?,?)`,
        [intoBook]
      )
      if((chapter.chapter_uuid)&&(chapter.chapter_uuid != chapter_uuid)&&(history.redo.length||history.undo.length)){
        console.log('创建章内容-开始同步修改章内容')
        let treeData = this.$refs.bookTree.getNode(chapter.chapter_uuid).data
        this.sync_chapter_content({chapter: treeData, wordCount: chapter.wordNum})
        this.disabled= true;
        // this.info_chapter({chapter_uuid: chapter_uuid, content: '', recordContent: ''})
      }
      // else{
      //   // this.info_chapter({chapter_uuid: chapter_uuid, content: '', recordContent: ''})
      // }
      this.info_chapter({chapter_uuid: chapter_uuid, content: '', recordContent: '', version: 0, wordNum: 0})
      this.disabled= false;
    },
    sync_chapter_word_count(data){
      let bookitem = this.filterBookList.filter((item) => {
        if(item.client_uuid ===data.chapter.bookId){
          return item
        }
      })
      console.log('修改章节字数和全书字数；')
      let wordNum = data.wordCount || this.chapter.wordNum;
      console.log('当前章字数为：'+wordNum);
      let changeNum = wordNum - data.chapter.word_count;
      console.log('修改之前的章节字数为：'+data.chapter.word_count)
      let bookNewCount = (Number(bookitem[0].word_count) + Number(changeNum)) > 0 ? (Number(bookitem[0].word_count) + Number(changeNum)) : 0;
      console.log('当前改变字数： '+changeNum)
      console.log('old book word_count: '+bookitem[0].word_count)
      console.log('new book word_count: '+bookNewCount)
      localQuery.updateItemInDB({data: {word_count: wordNum,is_upload: '0', client_uuid: data.chapter.client_uuid}, changedProps: ['word_count','is_upload'], tableName: 'book_category'})
      localQuery.updateItemInDB({data: {word_count: bookNewCount,is_upload: '0', client_uuid: data.chapter.bookId}, changedProps: ['word_count','is_upload'], tableName: 'book_category'})
      console.log(bookitem)
      let senddata = localQuery.backSendTitleData({changeList:[{...data.chapter, ...{word_count: wordNum}}, {...bookitem[0], ...{word_count: bookNewCount}}],token: this.GET_USET_DATA.token, book_uuid: data.chapter.bookId})
      console.info('同步章节信息数据： ')
      console.log(JSON.stringify(senddata))
      this.SYNC_UPDATE_BOOK_CONTENT_L1(senddata).then((res) => {
        let resData = res.data;
        let book_detail = resData.result.book_detail
        let chapters = resData.result.chapters;
        console.log(res)
        if(book_detail.code === 200){
          localQuery.updateItemInDB({data: {version: book_detail.version, is_upload: '1', client_uuid: resData.result.book_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
        }
        if(chapters.volumes[0].chapters[0].code === 200){
          localQuery.updateItemInDB({data: {version: chapters.volumes[0].chapters[0].version, is_upload: '1', client_uuid: chapters.volumes[0].chapters[0].chapter_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
        }
        this.SET_BOOK_CONTENT_L1(resData.result)
      })
    },
    sync_chapter_content(data){
      console.log('sync read, data:')
      console.log(data)
      console.log('触发章节内容的同步1111111111')
      console.log(JSON.stringify(this.chapter))
      let treeNode = this.$refs.bookTree.getNode(data.chapter.chapter_uuid);
      let chapterPath = {}
      chapterPath.paths = path.join(`${this.filterBookItem.title}-${this.filterBookItem.client_uuid}`,`${treeNode.parent.data.title}-${treeNode.parent.data.client_uuid}`)
      chapterPath.fileName = `${treeNode.data.title}-${treeNode.data.client_uuid}`
      // return false;
      let sendData ={
        bodyData: {
          "book_uuid": data.chapter.bookId,
          "volume_uuid": data.chapter.volume_uuid,
          "chapters": [
              {
                  "chapter_uuid": data.chapter.chapter_uuid,
                  // "content": data.hasOwnProperty("content") ? data.content: this.chapter.recordContent,
                  // "content": data.addEntrance === 'import' ? data.content : this.editor.getText(),
                  "content": data.addEntrance === 'import' || data.hasOwnProperty("content") ? data.content : this.chapter.recordContent,

                  "update_number": this.chapter.version||0
              }
          ]
        },
        uid: this.GET_USET_DATA.uid,
        token: this.GET_USET_DATA.token,
        sync_type: data.sync_type||'',
        wordNum: data.wordCount || this.chapter.wordNum,
        // bookNewCount: this.wholeBookWordCount
      }
      sendData.chapterPath = chapterPath
      sendData.insertDB = data.insertDB
      console.log(sendData)
      console.log('发送同步')
      // 章节开始同步
      this.chapter.is_upload = 0
      // console.log(sendData)
      this.CHAPTER_CONTENT_SYNC(sendData);
      this.sync_chapter_word_count(data)
      if(this.closewindow){
        this.$message({showClose: true, message: '同步成功!!!!', type: 'success', customClass: 'bookWarning'})
        setTimeout(() => {
          ipcRenderer.send('closewindow')
        }, 1000)
      }
    },
    info_chapter(data){
      this.formerWordCount = this.wordCount;
      this.formerWordProgress = this.wordProgress;
      let history = this.editor.history;
      // if (!this.totalTime){
      //   this.totalTime = 1;
      //   this.startTimeRecord();
      // }
      if(data.chapter_uuid){
        this.disabled= false;
        // // let length = this.editor.getLength();

      }else{
        // console.log("amazing place222222")
        history.clear();
        this.disabled= true;        
      }
      this.chapter.chapter_uuid = data.chapter_uuid;
      console.log("chapter data: ");
      console.log(data);
      this.chapter.volume_uuid = data.volume_uuid;
      this.chapter.content = data.content;
      // this.chapter.wordNum = fnGetCpmisWords(data.content);
      this.chapter.wordNum = data.wordNum||0
      this.wordGoalStarter = this.chapter.wordNum;

      //use content as text when open
      this.curChapCountOnOpen = fnGetCpmisWords(data.content);
      this.chapter.recordContent = data.recordContent;
      this.chapter.version = data.version;
      if(this.search.visible){
        this.search.visible = false;
        this.search.searchText = "";
        this.search.replaceText = "";
        this.search.curPos = 0;
        this.search.resultIndexArray = [];
      }
      this.$nextTick(() => {
        // this.editor.focus();
        console.log("ddddddd")
        this.editor.setSelection({index: 0, length: 0}, 'api');
      });
    },
    //clear chapter display func, used to clear all data on page
    //do no use this for clearing an existing chapter's data
    clearChapterDisplay(){
      console.log("clear chapter hit: ");
      this.chapter.chapter_uuid = null;
      this.chapter.content = "";
      this.chapter.wordNum = 0;
      this.chapter.recordContent = "";
      this.chapter.version = 0;      
    },
    treeChange(data, node){
      // console.log(this.$refs.bookTree.getCurrentNode())
      // console.log(data, node)
      // console.log(data, node, dom)
    // },
    // deleteNote(data){
    //   this.$confirm('确认删除？')
    //     .then(_ => {
    //       this.DELETE_NOTE(data)
    //       this.insList.splice(index,1);
    //       this.selectImgToggle.splice(index,1)
    //     })
    //     .catch(_ => {});
    },
    previewNote(index){
      clearTimeout(time);
      this.noteVisible = true;
      this.noteType = 3;
      this.noteIndex = index;
      this.viewNote = true;
      console.log(this.noteIndex)

      this.selectIndex = index;

      //取消修改保留初始值
      // this.preEditContent = this.GET_NOTES.NOTE_LIST[index].content
    },
    
    hideNote(index){
        this.UPDATE_NOTE_SELECTED({is_selected: 0, client_uuid: this.GET_NOTES.NOTE_LIST[index].client_uuid})
      // this.insList[index].isSelected = false;
    },
    closeDialogWord(type){
      this.dialogWord = type;
    },
    closeOpenNote(type){
      this.noteVisible = type;
      this.viewNote = false;
      this.noteType = 1;
    },
    changeNoteType(res){
      this.noteType = res
    },
    updateBook(){
      this.action_spawn_sync()
    },
    selectBook(id){
      if(id != this.filterBookItem.client_uuid){
        this.curBookUuid = id
        // 更换书籍打开状态
        this.SELECT_BOOK({id: id})
        this.updateSelectBookData(id)
      }
    },
    closeBook(data){
      console.log('closebook',data)
      let reData = {
        close: '',
        open: '',
      },filterBookList = this.filterBookList;
      if(filterBookList.length <= 1){
        this.$confirm('关闭该书后，将会关闭码字窗口，所有内容将会同步保存，是否确认关闭？', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          this.$electron.ipcRenderer.send("window-close");
        }).catch(() => {
               
        });
        // this.$message({showClose: true, message: '至少要打开一本书！',type: 'warning'})
      }
      if(data.act_type == 2){
        reData.close = data.client_uuid;
        this.CLOSE_BOOK(reData)
        // this.updateSelectBookData(data.client_uuid)
      }else{
        // reData.open = data.client_uuid;
        // this.CLOSE_BOOK(reData)
        for(let i =0;i<filterBookList.length;i++){
          if(filterBookList[i].client_uuid === data.client_uuid){
            reData.open = data.client_uuid;
            let bookId;
            if(i !== 0 ){
              bookId = filterBookList[0].client_uuid
            }else{
              bookId = filterBookList[1].client_uuid              
            }
            this.CLOSE_BOOK(reData)
            this.updateSelectBookData(bookId)
            break;
          }
        }
      }
    },
    updateSelectBookData(id){
      console.log('更新bookItem 清除chapter内存储数据！！！！！！！')
      // 拉取卷数据
      this.saveChapter()
      this.LIST_VOLUMES_O_L({book_uuid: id, token: this.GET_USET_DATA.token, uid: this.GET_USET_DATA.uid})
      this.SET_CURRENT_BOOK_ID_L1(id)
      this.NOTE_LIST({book_uuid: id})
      this.clearChapterDisplay()
    },
    newBook() {
      this.bookNewVisible = true;
      // ipcRenderer.send("ipc-newBook", "/#/bookNew");
    },
    showMenu(event, data, node, dom) {
      let brother = $('.el-tree').children('.el-tree-node.is-focusable');
      let brotherMax = brother.length;
      let DOM = $(event.target).parents('.el-tree-node.is-focusable')
      let index = brother.index(DOM);
      let last;
      if(index == -1){
        DOM = DOM.parents('.el-tree-node.is-focusable')
        index = brother.index(DOM);
      }
      last =((index+1) == brotherMax)
      if(data.type == '3'){
        let Cbrother = $(event.target).parents('.el-tree-node__children').children('.el-tree-node.is-focusable')
        let CbrotherMax = Cbrother.length
        let CDOM = $(event.target).parents('.el-tree-node.is-focusable')
        let CIndex = Cbrother.index(CDOM);
        last = ((CIndex+1) == CbrotherMax)
        data['CIndex'] = CIndex;
      }
      data['index'] = index;
      data['last'] = last;
      // this.$set(data, 'index', index)
      // this.$set(data, 'last', last)
      ipcRenderer.send("ipc-showMenu", data);

    },
    tabIndex(target, nodeList){
      for(let i = 0;i<nodeList; i++){
        if(target===nodeList[i]){
          return i
        }
      }
    },
    compare(obj1, obj2) {
      let val1 = obj1.sort;
      let val2 = obj2.sort;
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        0;
      }
    },
    volumeAdd() {},
    closeOpenWindow(type){
      this.dialogTableVisible = type
    },
    closeOpenBookNew(type){
      this.bookNewVisible = type
    },
    closeOpenRandomName(type){
      this.RandomNameVisible = type
    },
    closeOpenOutLine(type){
      this.outlineVisible = type
    },
    closeForceLock(type, data){
      console.log("force lock data: ");
      console.log(data);
      // this.showUser = false;
      console.log("show user: " + this.showUser);
      if(data.type === 'word' || data.type === 'time'){
        this[`${data.type}Goal`] = data[`${data.type}Limit`];
        store.set(`${data.type}Goal`, data[`${data.type}Limit`]);
        this.locked = data.type;
        if(data.type === 'word'){
          this.wordGoalStarter = this.chapter.wordNum
          this.curChapCountOnOpen = this.chapter.wordNum
        }

        ipcRenderer.send('lock-editor');
        this.bubbleVisible = true;
        this.showUser = false;

      }
      this.forceLockVisible = type
    },
    closeSettings(){
      this.settingsVisible = false;
    },
    cloneObj(obj){
      for(var key in obj){
          if(typeof obj[key] == 'object'){
              this.cloneObj(obj[key]);
          }else if(key == 'title'){
              obj['bookId'] = this.reyDookid;
          }
      }
      return obj; 
    },
    newVolume(){
      if(!this.newType) return false;
      this.changeNewType()
      let curVolumes = this.GET_CURRENT_BOOK_VOLUMES_L1;
      let volumeCount = curVolumes.length;
      let tempSorts = []
      curVolumes.forEach((aVol) => {
        tempSorts.push(aVol.volume_uuid);
      })

      // console.log("volumes sorts!!!!!!!!!!!");
      // console.log(curVolumes);
      // console.log(tempSorts);


      //let chapter = this.filterBookItem.SubCategories.length
      let arg = {bookId: this.GET_CURRENT_BOOK_ID_L1, user: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token, volumeCount: volumeCount, view: 'editorWindow', volumesSort: tempSorts }
      //let arg = {bookId: this.filterBookItem.client_uuid, uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token}
      this.CREATE_NEW_VOLUME_L1(arg)
      //this.VOLUME_ADD_BOOK({arg, chapter})
    },
    newChapter(addChapterEntrance, chapName){
      addChapterEntrance = addChapterEntrance ? addChapterEntrance : 'create'
      let CurrentNode = this.$refs.bookTree.getCurrentNode();
      if(!CurrentNode){
        // console.log("wrong hit")
        this.newVolume()
      }else{
        // console.log("good hit?")
        // console.log("new type?: ")
        // console.log(!this.newType);
        if(!this.duringImport && !this.newType) return false;
        this.changeNewType()
        let volumes = this.GET_CURRENT_BOOK_VOLUMES_L1;
        for(let i = 0;i<volumes.length;i++){
          if(volumes[i].volume_uuid == CurrentNode.volume_uuid){
            let chapterCount = volumes[i].chapters.length;
            let tempSorts = []
            volumes[i].chapters.forEach((aChapter) => {
              tempSorts.push(aChapter.chapter_uuid);
            })

            console.log("tempSorts: ");
            console.log(tempSorts);

            CurrentNode['token'] = this.GET_USET_DATA.token
            CurrentNode['uid'] = this.GET_USET_DATA.uid
            CurrentNode['index'] = i
            let chapterName = null;
            if(chapName) chapterName = path.basename(chapName, '.txt');
            console.log('新建书籍')
            this.CREATE_NEW_CHAPTER_L1({arg:CurrentNode, chapterCount: chapterCount, chapterName: chapterName, addChapterEntrance: addChapterEntrance, user: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token, bookId: this.GET_CURRENT_BOOK_ID_L1, view: 'editorWindow', chaptersSort: tempSorts})

            // this.CHAPTER_ADD_BOOK({arg:CurrentNode, chapter, chapterName, addChapterEntrance});
            return false
          }
        }
      }
    },
    changeNewType(){
      let slef = this;
      slef.newType = false
      setTimeout(function(){
        slef.newType = true
      },800)
    },
    toggleSelectionMode(){
      console.log("toggle selection mode clicked: showMultiSelectionButton: " + this.treeConfig.showCheckbox);
      console.log(this.treeConfig.showCheckbox);
      // // this.showMultiSelectionButton = !this.showMultiSelectionButton;

      // let checkboxes = document.getElementsByClassName("el-checkbox__input");
      // console.log(checkboxes);
      // let displayString = ""
      // let visiString = ""
      // let width = "0px";
      // if(this.treeConfig.showCheckbox){
      //   displayString = "inline-block"
      //   // visiString = "hidden";
      //   // width = "0px";
      //   this.$refs.bookTree.setCheckedNodes([]);
      // }else{
      //   // visiString = "visible";
      //   // width = "14px"

      //   displayString = "none"
      // }
      // for(let i = 0; i< checkboxes.length; i++){
      //   checkboxes[i].style.display = displayString;
      //   // checkboxes[i].style.visibility = visiString;
      //   checkboxes[i].style.width = width;

      // }
      this.treeConfig.showCheckbox = !this.treeConfig.showCheckbox;
      if(!this.treeConfig.showCheckbox){
        this.$refs.bookTree.setCheckedNodes([]); 
      }else{
        let selectedNode = this.$refs.bookTree.getCurrentNode();
        this.$refs.bookTree.setCheckedNodes([selectedNode]);
        if(selectedNode){
          this.treeConfig.defaultExpanded = [selectedNode['client_uuid']];
        }
      }
    },
    forceLockClicked(){
      console.log("force lock clicked");
      if(this.wordGoal || this.timeGoal){
        this.$message({showClose: true, message: '当前已经处于锁定模式, 请先完成当前目标',type: 'success', iconClass: "none"});
      }else{
        this.forceLockVisible = true
      }
    },
    startTimeRecord(){
      console.log("time recording should start");
      this.timeInterval = setInterval(() => {
        this.totalTime = this.totalTime + 1;
        let timeElapsed = this.totalTime - this.lastKeyUpTime;
        if(timeElapsed >= this.afkPendingTime){
          this.idleTime = this.idleTime + 1;
          this.idleState = true;
          this.formatTime('idle');
        }else{
          this.idleState = false;
          if(this.timeGoal){
            if(this.timeProgress === this.timeGoal*60){
              this.timeGoal = 0;
              this.timeProgress = 0;
              this.lockTimeDisplay = 0;
              store.set("timeGoal", 0);
              store.set("timeProgress", 0);
              this.unlock("time");
            }else{
              this.timeProgress = this.timeProgress + 1;
              store.set("timeProgress", this.timeProgress);
              this.lockTimeDisplay = parseFloat(this.timeProgress/60.0).toFixed(2);
            }
          }
          this.typeTime = this.typeTime + 1;
          this.formatTime('type');

          // let text = this.editor.getText();
          // let tempCount = fnGetCpmisWords(text) - this.curChapCountOnOpen;
          // this.wordCount = tempCount > 0 ? tempCount+this.formerWordCount: this.formerWordCount;
          // this.wholeBookWordCount = (this.curBookCountOnOpen + tempCount) > 0 ? this.curBookCountOnOpen + tempCount : 0;
          //
          // this.typeSpeed = parseInt((this.wordCount*3600)/this.typeTime);
        }
          this.typeSpeed = parseInt((this.wordCount*3600)/this.totalTime);
          this.action_spawn_sync()
          this.action_statistics_sync()
      }, 1000);
      return null;
    },
    action_spawn_sync(){
       let syncChapterConfig = this.syncChapterConfig
        if(syncChapterConfig.maxTime === syncChapterConfig.tackTime){
          // let stack = this.editor.history.stack||{redo:[], undo: []};
          // if((stack.redo.length != syncChapterConfig.markRedo)||(stack.undo.length != syncChapterConfig.markUndo)){
          //   console.log('校验通过同步章节内容')
          //   syncChapterConfig.markRedo = stack.redo.length
          //   syncChapterConfig.markUndo = stack.undo.length
          //   let chapterData = this.chapter.chapter_uuid?this.$refs.bookTree.getNode(this.chapter.chapter_uuid).data:''
          //   this.sync_chapter_content({chapter: chapterData})
          // }
          this.saveChapter()
        }else{
          syncChapterConfig.tackTime +=1
        }
    },
    action_statistics_sync(){
      if(this.statisticsTime >= 60){
        this.statistics_sync()

        this.statisticsTime = 0
      }else{
        this.statisticsTime += 1
      }
    },
    statistics_sync(){
      let bookUuid = this.filterBookItem.client_uuid
      let localStatis = store.get('statistics')
      console.log('上次',localStatis)

      let statistics = {}
      let statisticsData = {
        book_uuid: bookUuid,
        pure_times: this.typeTime,
        // pure_times: 0,
        pure_words: this.wordCount,
        delete_words: 0,
        rest_time: this.idleTime,
        // rest_time: 0,
        total_words: this.filterBookItem.word_count,
        version: 0
      }
      statistics[bookUuid] = statisticsData
      statistics['total_pure_times'] = this.typeTime
      statistics['total_rest_time'] = this.idleTime
      statistics['total_time'] = this.totalTime
      statistics['total_words'] = this.wordCount

      if(!localStatis){   //没有本地存储时，存储当前实时统计的数据
        store.set('statistics', statistics )
        ipcRenderer.send('ipc-syncStatistics',JSON.stringify(
          { 
            data: {
                "statistics": [
                    statistics[bookUuid]
                ]
            },
            token: this.GET_USET_DATA.token  
          }
        ))
      }else{    //有本地存储时，存储增量数据

        //比较当前数据与上次存储的数据的差值
        let sub_word = this.wordCount - localStatis.total_words
        let sub_total_time = this.totalTime - localStatis.total_time
        let sub_pure_times = this.typeTime - localStatis.total_pure_times
        let sub_rest_time = this.idleTime - localStatis.total_rest_time
        //实时本地存储当前最新数据
        localStatis['total_pure_times'] = this.typeTime
        localStatis['total_rest_time'] = this.idleTime
        localStatis['total_time'] = this.totalTime
        localStatis['total_words'] = this.wordCount

        //本地替换存储增量数据
        // statisticsData.total_words = this.filterBookItem.word_count
        if(sub_total_time > 0){   //没有关闭编辑器，增量为计算值减上一次存储值
          statisticsData.pure_times = sub_pure_times
          statisticsData.rest_time = sub_rest_time
        }else{    //重新打开了编辑器，增量为原始计算值
          statisticsData.pure_times = this.typeTime
          statisticsData.rest_time = this.idleTime
        }

        if(sub_word > 0){
          statisticsData.pure_words = sub_word
          statisticsData.delete_words = 0
        }else if(sub_word < 0){
          statisticsData.pure_words = 0
          statisticsData.delete_words = Math.abs(sub_word)
        }else{
          statisticsData.pure_words = 0
          statisticsData.delete_words = 0
        }
        
        if( localStatis[bookUuid] ){  //有该书时修改版本号
          // localStatis[bookUuid].book_uuid = bookUuid
          statisticsData.version = localStatis[bookUuid].version
        }
        localStatis[bookUuid] = statisticsData
        console.log('本次',localStatis)
        store.set('statistics', localStatis )

        if(sub_pure_times>0){   //空闲时不发送请求
          console.log('sub_pure_times',sub_pure_times)
          ipcRenderer.send('ipc-syncStatistics',JSON.stringify({ 
            data: {
                "statistics": [
                    localStatis[bookUuid]
                ]
            },
            token: this.GET_USET_DATA.token  
          }) )
        }
        

      }
    },
    localSaveEditSetting(){
      var settingData = store.get('editorSetting') || {}
      settingData[this.GET_USET_DATA.uid] = this.setting
      store.set('editorSetting',  settingData)
    },
    init_spawn_sync(){
      // 初始化章节同步状态数据
        let syncChapterConfig = this.syncChapterConfig;
        syncChapterConfig.markRedo = 0
        syncChapterConfig.markUndo = 0
        syncChapterConfig.tackTime = 0
        syncChapterConfig.lastTime = 0
    },
    // return a string for hr or min or sec
    addZero(anInt){
      if(anInt < 10){
        return '0' + anInt;
      }else{
        return '' + anInt;
      }
    },

    formatTime(timeType){
      let hr = parseInt(this[`${timeType}Time`]/3600);
      let min = parseInt((this[`${timeType}Time`]%3600)/60);
      let sec = parseInt(this[`${timeType}Time`]%60);
      this[`${timeType}TimeDisplay`] = `${this.addZero(hr)}:${this.addZero(min)}:${this.addZero(sec)}`;
    },

    blur(){

    }, 
    focus(){

    },
    // input(contents){
    //   //this is not in use
    // //   console.log(contents)
    // },
    unlock(type){
      this.$message({showClose: true, message: '达到目标已退出强制锁定模式',type: 'success'});
      this[`${type}Goal`] = 0;
      this.locked = '';
      this.showUser = true;
      ipcRenderer.send('unlock-editor');
      // this.bubbleVisible = false;
    },
    // confirmModal(){
    //   this.toggleWaitingModal(false);
    // },
    setPasteStatus(e){

      console.log("set paste status to " + e);
      this.duringPaste = e;
    },
    mouseRight(e){
      let mouseRight = document.getElementById("mouseright");
      let clientHeight = document.getElementById("editor").clientHeight;
      if(e.width-e.event.offsetX<60){
        mouseRight.style.left = e.event.clientX-100+'px';
      }else{
        mouseRight.style.left = e.event.clientX+'px';
      }
      if(clientHeight-e.event.clientY<266){
        mouseRight.style.top = e.event.clientY-230+'px';
      }else{
        mouseRight.style.top = e.event.clientY+'px';
      }
      this.mouseShow = true;
      // console.log('mouseright',e)
    },
    mouseLeft($event){
      // console.log('mouseup',$event)
      this.mouseShow = false
    },
  
    toggleWaitingModal(e){
      console.log("toggleWaitingModal received: " + e);
      console.log(e);
      console.log("type?: " + e.type);
      if(e.value === false){
        let that = this;
        if(e.type === 'export'){
          this.waitingMessage = "导出成功"
          this.waitingType = "exported"
          ipcRenderer.send('import-or-export-finished')
        }
        // no need of this, as this is trigger after click the confirm button
        // in import case
        // }else if(e.type === 'import'){
        //   this.waitingMessage = "导入成功"
        // }

        if(e.type !== 'confirm'){
          setTimeout(() => {
            this.waitingVisible = e.value;
            // console.log("setFalse")
          }, 1000)
        }else{
          //deal with click button close, close directly
          this.importFileDetail.splice(0, this.importFileDetail.length);
          this.waitingVisible = e.value;
        }
      }else{
        // console.log("set ano")
        this.waitingVisible = e.value;
      }

    },
    editorChange(e){
      // console.log("editor changed: ");
      // console.log(e);
      // console.log("see here");
      // console.log(this.editor);

      console.log("quill history");
      console.log(this.editor.history);
      this.selectTextLength = 0;
      this.mouseShow = false;
      if(!this.duringPaste && e.source === "user"){
          // console.log("wordCount is: " + e.wordCount);
          this.lastKeyUpTime = this.totalTime;
          if(!this.userInputStarted){
            this.userInputStarted = true;
          }
          if (this.userInputStarted && !this.totalTime){
            this.totalTime = 1;
            this.startTimeRecord();
          }

          if(this.search.visible && this.search.searchText) this.searchInputChanged(this.search.searchText, 'search-text-no-change')
          // if(this.idleState) this.searchInputChanged(this.search.searchText, 'search-text-no-change'); 
      }

          // let text = this.editor.getText();
          // let tempCount = fnGetCpmisWords(text) - this.curChapCountOnOpen;
          // this.wordCount = tempCount > 0 ? tempCount+this.formerWordCount: this.formerWordCount;


      let removeHtmlTagReg = new RegExp(/<[^<>]+>/g);
      // console.time("document redraw used time")
      this.chapter.recordContent = e.text
      this.chapter.content = e.html   //e.text.replace(removeHtmlTagReg, '');//e.html
      // console.timeEnd("document redraw used time");
      if(e.wordCount >= 0){
        // console.log("set word count to: " + e.wordCount);
        console.log("during paste" + this.duringPaste);
        console.log("source is: " + e.source);

        if(!this.duringPaste && e.source === "user" && this.typePaste){
          // console.log('editor change :')
          // console.log(e.wordCount)
          // console.log(this.curChapCountOnOpen)
          // console.log(this.formerWordCount)
          let tempWordCount = e.wordCount - this.curChapCountOnOpen;
          // if(tempCount <= 0){
          //   this.curChapCountOnOpen = e.wordCount;
          // }


          if((tempWordCount + this.formerWordCount) > 0){
            this.wordCount = (tempWordCount + this.formerWordCount) > 0 ? tempWordCount + this.formerWordCount: this.formerWordCount;
          }else{
            //clear nearly everything, we typed words/this time hit 0 
            this.wordCount = 0;
            this.formerWordCount = 0;
            this.curChapCountOnOpen = e.wordCount;
          }

          let tempProgressCount = e.wordCount - this.wordGoalStarter;
          // console.log("wordGoalStarter： " + this.wordGoalStarter);
          // console.log("wordCount: " + e.wordCount);
          // if(tempProgressCount > 0){
            // console.log("former word progress is: " + this.formerWordProgress);
            // console.log("temp count is: " + tempCount);
          if(this.wordGoal !== 0){
            if((tempProgressCount + this.formerWordProgress) > 0){
              // console.log("ah");
              this.wordProgress = (tempProgressCount + this.formerWordProgress) > 0 ? tempProgressCount + this.formerWordProgress : this.formerWordProgress;
            }else{
              // console.log("bh");
              this.wordProgress = 0;
              this.formerWordProgress = 0;
              this.wordGoalStarter = e.wordCount;
            }
            // this.wordProgress = this.formerWordProgress + tempProgressCount;
            store.set("wordProgress", this.wordProgress);
          }
          if(this.wordGoal !== 0  && this.wordProgress >= this.wordGoal){
            console.log("should unlock word lock");
            this.wordProgress = 0;
            this.wordGoal = 0;
            store.set("wordProgress", 0);
            store.set("wordGoal", 0);
            this.unlock("word");
            }
          // }

        }else if(this.duringPaste || e.source === "api"){
          // console.log("good to know!!!!!!!!!!!!!")
          this.curChapCountOnOpen = e.wordCount;
          this.formerWordCount = this.wordCount;
          this.wordGoalStarter = e.wordCount;
          this.formerWordProgress = this.wordProgress;
        }



        // console.log("on editor side: " + e.wordCount);
        this.chapter.wordNum = e.wordCount;
        // let bookNewCount = this.curBookCountOnOpen + tempCount;
        // let bookNewCount = this.wholeBookWordCount + this.chapter.wordNum - this.realChapterOnOpen;
        // this.wholeBookWordCount = (bookNewCount > 0) ? bookNewCount : 0
      }
      // else{
      //   this.chapter.wordNum = e.wordCount;
      // }
      // this.searchInputChanged(this.search.searchText);

      this.duringPaste = false;
      this.typePaste = true;

    },
    imported(e){
      console.log("one file imported: arg is: ");
      console.log(e);
    },
    selectionChange(range){
      console.log("selection changed");
      // console.log('selection changed',range);
      if(range.range.length>0){
        this.selectTextLength = fnGetCpmisWords(window.getSelection().toString())
      }else{
        this.selectTextLength = 0
      }

      // this.editor.formatText(e.range.index, 0,  {
      //   'background-color': 'green' 
      // });
    },
    isInView(rangeEnd){
      console.log("if this is in view: ");
      console.log(rangeEnd);
    },
    insert(str){
        var _this = this;
        if(_this.editor){
          let selection = _this.editor.getSelection(true);
          console.log("555555555555");
          (selection)&&(-1<selection.index)&&(_this.editor.insertText(selection.index, str, 'user')),_this.editor.setSelection(selection.index + str.length, 0)
        }
      },
    doBold(data){
      // this.fontWeight = 
      this.setting.fontWeight = (this.setting['fontWeight'] == 'normal'?'bold':'normal')
      this.localSaveEditSetting()
    },
    doItalic(data){
      this.setting.fontStyle = (this.setting['fontStyle'] == 'normal'?'italic':'normal')
      this.localSaveEditSetting()
    },
    doUnderline(data){
      this.setting.underline =  (this.setting['underline'] == true?false:true)
      this.localSaveEditSetting()
    },
    doFont(data){
      this.setting.fontFamily = data
      this.localSaveEditSetting()
    },
    doSize(data){
      this.setting.fontSize = data
      this.localSaveEditSetting()
    },
    doLine(data){
      console.log(data)
      this.setting.lineHeight = data
      this.localSaveEditSetting()
    },
    divide(){
        this.insert('\n-------------------------------------\n');
      },
    copy(){
        let selection = this.editor.getSelection()|| '';
        selection.length ? ((document.execCommand('copy',false)), this.$message({showClose: true, message: '复制成功',type: 'success', iconClass: "none"}) ): this.$message({showClose: true, message: '请选择要复制的内容',type: 'warning', iconClass: "none"});
    },
    paste(){
        document.execCommand('paste',false)
    },
    selectAll(){
      this.editor.setSelection(0,this.editor.getLength())
      // document.getElementById('editor').select()
    },
    cut(){
        let selection = this.editor.getSelection()|| '';
        selection.length ? ((document.execCommand('cut',false)), this.$message({showClose: true, message: '剪切成功',type: 'success', iconClass: "none"}) ): this.$message({showClose: true, message: '请选择要剪切的内容',type: 'warning', iconClass: "none"});
      },
      unSearch(){
        this.search.visible ? this.initSearch() : (this.search.visible=true,this.$nextTick(() => {
          this.$refs.searchText.$el.children[0].focus()
        }))
      },
      initSearch(){
        console.log("init search!")
        this.search = Object.assign(this.search,{
          visible: false
        });
        this.search.searchText = "";
        this.search.resultIndexArray = [];
        this.search.curPos = 0;
        this.search.replaceText = "";

        this.editor.formatText(0, this.editor.getText().length, {
          'background-color': 'transparent' 
        }, 'silent'); 

      // search:{
      //   visible: false,
      //   text: "",
      //   replaceText: "",
      //   curPos: 0,
      //   resultIndexArray: []
      // },        
      },
      undo(){
        this.editor.history.undo()
      },
      redo(){
        this.editor.history.redo()
      },
      typesetting(){
        this.typePaste = false;
        // var localTypeSetting = store.get('typeSetting')
        var indentFormat = this.GET_TYPE_SETTING.indent ? '\u2003\u2003' : '';
        var lineFormat = this.GET_TYPE_SETTING.line ? '\n\n' : '\n';
         
        // if(localTypeSetting){
        //   if(localTypeSetting[this.GET_USET_DATA.uid]){
        //     indentFormat = localTypeSetting[this.GET_USET_DATA.uid].indent ? '\u2003\u2003' : '';
        //     lineFormat = localTypeSetting[this.GET_USET_DATA.uid].line ? '\n\n' : '\n';
        //   }
        // }
        console.log('getContents',this.editor.getContents())
        var content = this.editor.getContents().ops[0].insert;
        var contentLength = this.editor.getLength();

        // ----------------------
        var contentArry = content.split('\n')
        // console.log(contentArry)
        var newContentArry = []
        for (let i = 0; i < contentArry.length; i++) {
          var element = contentArry[i];
          var newarr = element.trim()
          if(newarr.length!=0){   //去掉多余空行
            newContentArry.push(contentArry[i].replace(/(^\s*)/g, indentFormat).concat(lineFormat))   //左边替换为2个空格，右边追加2个换行符
          }
        }
        var formatContent = newContentArry.join('')
        // console.log(formatContent)
        this.editor.deleteText(0,this.editor.getLength(), 'user');
        this.editor.insertText(0, formatContent, 'user');

        // this.editor.setSelection({index: 0, length: 0}, 'silent');
        //-----------------------

        // var startIndex = 0;
        // while (startIndex < this.editor.getLength()) {
        //   var content = this.editor.getContents().ops[0].insert
        //   var findIndex = content.indexOf('\n',startIndex)
        //   console.log('\\n',findIndex)
        //   if(findIndex === -1){
        //     startIndex = this.editor.getLength()
        //   }else{
        //     // this.editor.updateContents(new Delta().retain(findIndex).insert('\n'), 'user');
        //     startIndex = findIndex+2  //加上追加的换行符
        //   }
        //     this.editor.updateContents(new Delta().retain(findIndex+1).insert('\n'), 'user');

        // }
        

        
        // this.setting.typesetting = !this.setting.typesetting
      },
      //this is used for import file when there is no chapter selected
      prepareImport(chapData){
        console.log("should prepare for import: data is: ");
        console.log(chapData);
        console.log("chapters waiting for import: ");
        console.log(this.chaptersWaitForImport);

        let maxLimitObj = this.$refs.writing.getChapterLengthLimit()

        //TODO: later bind this to an event in writing's mounted hook
        if(!this.maxWordPerChap){
          this.maxWordPerChap = maxLimitObj.maxWordPerChap
        }

        if(!this.maxBytePerChap){
          this.maxBytePerChap = maxLimitObj.maxBytePerChap
        }

        console.log("max word and byte: ");
        console.log(this.maxWordPerChap);
        console.log(this.maxBytePerChap);

        if(this.chaptersWaitForImport.length > 0){
          chardet.detectFile(this.chaptersWaitForImport[0], (err, encoding)=>{
              console.log("detect file encoding here: ");
              console.log(err);
              console.log(encoding);
              let dataEncoding = encoding;

              fs.readFile(this.chaptersWaitForImport[0], (err, data) =>{
                console.log("read in data:")
                console.log(data);
                console.log("data byte length: ")
                console.log(data.byteLength);

                let croppedBuffer = null;
                let titleName = path.basename(this.chaptersWaitForImport[0], 'txt');
                
                let alreadyPushed = false;

                if(data.byteLength > this.maxBytePerChap){
                  console.log("chap byte length exceeds, will crop")
                  croppedBuffer = data.slice(0, this.maxBytePerChap)

                  if(titleName.length >= 9){
                    titleName = titleName.substr(0, 8) + '...'
                  }
                  alreadyPushed = true;
                  this.importFileDetail.push({name: titleName, error: tooLongError, operation: tooLongOperation}), 
                  console.log("croppedBuffer length: " + croppedBuffer.byteLength);
                }else{
                  croppedBuffer = data;
                }
                // console.log("ascii: " + data.toString('ascii'));
                // console.log("utf8: " + data.toString('utf8'));
                // console.log("utf16le: " + data.toString('utf16le'));
                // console.log("base64: " + data.toString('base64'));
                // console.log("latin1: " + data.toString('latin1'));
                // console.log("hex: " + data.toString('hex'));
                let decodedData = "";
                if((dataEncoding === "Shift-JIS")||(dataEncoding === "GB18030")||(dataEncoding === "ISO-8859-1")){
                  decodedData = iconv.decode(croppedBuffer, 'GBK');
                }else if(dataEncoding === "UTF-16LE"){
                  decodedData = croppedBuffer.toString('utf16le');
                }else if(dataEncoding === "UTF-16BE"){
                  decodedData = iconv.decode(croppedBuffer, 'UTF-16BE');
                }else if(dataEncoding === "UTF-8"){
                  decodedData = croppedBuffer.toString('utf8');
                }

                let endIndex = this.$refs.writing.findChopIndex(decodedData, this.maxWordPerChap);
                if(!alreadyPushed && endIndex < decodedData.length){
                  this.importFileDetail.push({name: titleName, error: tooLongError, operation: tooLongOperation}) 
                }
                console.log("end index is: " + endIndex);
                decodedData = decodedData.substr(0, endIndex);

                let tempCount = fnGetCpmisWords(decodedData);

                console.log("decoded data is: !!!!!!!!!!!!!!!!!!!!!!!!!");
                console.log(decodedData);
                this.sync_chapter_content({chapter: chapData.obj, content: decodedData, wordCount: tempCount, addEntrance: 'import', insertDB: true});
                this.chaptersWaitForImport.shift();
                this.importController();
              })


              // let dataBuffer = "";// Buffer.alloc(60000);

              // let writeStream = fs.createWriteStream(dataBuffer);
              // let readStream = fs.createReadStream(this.chaptersWaitForImport[0]);

              // readStream.pipe(writeStream);

              // writeStream.on('error', (err) => {
              //   console.log("write error:!!" + err);
              // })

              // writeStream.on('finish', () => {
              //   console.log("write chap data finished");
              //   console.log(dataBuffer);
              // })

              // fse.readFile(path, (err, data) => {
              //   var that = this;
              //   if(err){
              //     return err
              //   }
              //   let decodedString = "";
              //   if((dataEncoding == "Shift-JIS")||(dataEncoding == "GB18030")){
              //     //ansi txt file is treated as Shift_JIS, just decode it as gbk
              //     decodedString = iconv.decode(data, 'GBK');
              //   }else if(dataEncoding == "UTF-16LE"){
              //     decodedString = iconv.decode(data, 'UTF-16');
              //   }else{
              //     decodedString = iconv.decode(data, 'UTF8');
              //   }
              //   console.log("decoded string is：" + decodedString);
              //   _this.quill.setContents([
              //     {insert: decodedString}
              //   ], 'silent')
                
              //   this.$emit('imported', {path: arg[0] });

              // })
          }) 
        }       
        // fs.read
        // this.sync_chapter_content({chapter: data.arg, content: })
        // let parentNode = this.$refs.bookTree.getNode(data.obj.volume_uuid);
        // parentNode.store.nodesMap[data.obj.volume_uuid].expanded = true;
        // console.log("parent node is: ");
        // this.$nextTick(() => {
        //   this.$refs.bookTree.setCurrentKey(data.obj.client_uuid);
        //   this.info_chapter({chapter_uuid: data.obj.client_uuid, content: '', recordContent: '', version: data.obj.version});
        //   ipcRenderer.send('ipc-importChapter', `${this.filterBookItem.title}-${this.$refs.bookTree.getCurrentNode().title}`)
        // })
      },
      saveChapter(userType){
        let chapterData = this.chapter.chapter_uuid ? this.$refs.bookTree.getNode(this.chapter.chapter_uuid).data : '';
        let history = this.editor.history;
        history.stack||(history.stack={redo:[], undo: []})
        let syncChapterConfig = this.syncChapterConfig;
        syncChapterConfig.tackTime = 0;
        console.log(history)
        console.log(syncChapterConfig)
        if((history.lastRecorded!==syncChapterConfig.lastTime)&&chapterData){
          syncChapterConfig.markRedo = history.redo.length
          syncChapterConfig.markUndo = history.undo.length
          syncChapterConfig.lastTime = history.lastRecorded
          console.log('写了点东西，保存~')
          // 判断是否是用户手动触发保存
          console.log(userType)
          if(userType){
            this.operateFiletype = true
          }
          this.sync_chapter_content({chapter: chapterData, sync_type: 'currentChapter'})
        }else{
          console.log('求求你写点什么吧！！！')
        }
      },
      getMusicWindow(){
        console.log("try to get a music window");
        ipcRenderer.send('create-music-window');
      },
      importChapter(){
        console.log("try to import: ");
        if(this.locked){
          this.$message({showClose: true, message: '强制锁定模式下不可导入',type: 'error', customClass: 'top-message'});
          return;
        }
        if(!navigator.onLine){
          this.$message({showClose: true, message: '您的网络连接有问题, 请检查网络链接',type: 'error', customClass: 'top-message'});
          return
        }
        let curChap = this.$refs.bookTree.getCurrentNode();
        console.log(curChap);
        if(curChap){
          ipcRenderer.send('ipc-importChapter')
          //this.newChapter('import');
        }else{
          this.$message({showClose: true, message: '请先指定一卷或一章再进行导入',type: 'error'});
        }
        // if(curChap){
        //   if(curChap.type === 3){
        //     // no need to prepare for this, as this chap exists before import operation
        //     ipcRenderer.send('ipc-importChapter', `${this.filterBookItem.title}-${this.$refs.bookTree.getCurrentNode().title}`)
        //   }else{
        //     this.newChapter('import');
        //     // this.$nextTick(() => {
        //     //   console.log(this.filterBookItem.SubCategories[1].SubCategories);
        //     //   for(let i =0; i<this.filterBookItem.SubCategories.length; i++){
        //     //     if(this.filterBookItem.SubCategories[i].client_uuid === this.$refs.bookTree.getCurrentKey()){
        //     //       console.log("the right one: " + this.filterBookItem.SubCategories[i].title);
        //     //       console.log("this SubCategories length is: " + this.filterBookItem.SubCategories[i].SubCategories.length);
        //     //       // use length rather than length - 1, as this is after a new chapter operation 
        //     //       this.info_chapter({chapter_uuid: this.filterBookItem.SubCategories[i].SubCategories[this.filterBookItem.SubCategories[i].SubCategories.length-1].chapter_uuid,content: '', recordContent: '', version: 1});
        //     //       console.log("got chapter info place!");
        //     //       this.$refs.bookTree.setCurrentKey(this.filterBookItem.SubCategories[i].SubCategories[this.filterBookItem.SubCategories[i].SubCategories.length-1].client_uui);
        //     //       break;
        //       //   }
        //       // }


        //     // })
        //   }
        // }else{
        //   // this.$message({showClose: true, message: '请先选定要导入的章节再进行导入操作',type: 'error'});
        //   let curVol = this.filterBookItem;
        //   if (curVol) {
        //     // this.newChapter
        //   }else{
        //     console.log("no vol selected");
        //   }
        // }
      },
      importController(){
        console.log("import chapter called, chapters left: ");
        console.log(this.chaptersWaitForImport);
        if(this.chaptersWaitForImport.length){ 
          console.log("do this?????");
          this.duringImport = true;
          this.waitingType = "import"
          this.waitingMessage = "导入中..."
          this.toggleWaitingModal({value: true, type: 'import'});
          this.newChapter('import', this.chaptersWaitForImport[0]);
        }else{
          if(this.duringImport){
            if(this.totalChaptersForImport === this.failedChaptersForImport){
              this.waitingMessage = `导入失败${this.failedChaptersForImport}章`;
              // this.$message({showClose: true, message: '导入失败',type: 'error'});
            }else{
              let succeedChaptersForImport = this.totalChaptersForImport - this.failedChaptersForImport;
              this.waitingMessage = `导入成功${succeedChaptersForImport}章`
              if(this.failedChaptersForImport > 0){
                this.waitingMessage = `${this.waitingMessage}, 导入失败${this.failedChaptersForImport}章`
              }
              // this.$message({showClose: true, message: '导入成功',type: 'success'});
            }
            this.waitingType = "imported"
            ipcRenderer.send('import-or-export-finished')
            this.totalChaptersForImport = 0;
            this.failedChaptersForImport = 0;
          }
          this.duringImport = false;
          // this.toggleWaitingModal({value: false, type: 'import'});
        }
      },
      exportChapter(){
        this.waitingType = "export"
        this.waitingMessage = "导出中..."
        // console.log("selected chapters: ");
        // console.log(this.$refs.bookTree.getCheckedNodes());
        // console.log("current chapter: ");
        // console.log(this.$refs.bookTree.getCurrentNode());
        // console.log("show check box: " + this.treeConfig.showCheckbox);
        // return;
        if(this.locked){
          this.$message({showClose: true, message: '强制锁定模式下不可导出',type: 'error'});
          return;
        }

        let chapArr = [];
        if(this.treeConfig.showCheckbox){
          this.saveChapter();
          console.log("show check box go all checked nodes");
          var checkedNodesBefore = JSON.stringify(this.$refs.bookTree.getCheckedNodes());
          console.log('checkedNodesBefore',checkedNodesBefore)
          var checkedNodesAfter = JSON.parse(checkedNodesBefore)
          console.log('checkedNodesAfter',checkedNodesAfter)
          if(checkedNodesAfter.length === 0){
            this.$message({showClose: true, message: '请选择需要导出的章节',type: 'error'});
            return;
          }
          // let title = "";
          // let client_uuid = "";
          let _this = this
          loadChapters(0,checkedNodesAfter)
         async function loadChapters(x, arry) {
            console.log('x',x)

            if(arry[x].type === 2 && arry[x].chapters.length == 0){
              console.log('选中卷，没有章数据')
              await _this.LIST_LOCAL_AND_ONLINE_CHAPTERS({volume_uuid: arry[x].client_uuid, book_uuid: arry[x].parent_client_uuid, token: _this.GET_USET_DATA.token, uid: _this.GET_USET_DATA.uid}).then((res)=>{
                console.log('返回',res)
                if(res&&res.length!=0){
                  for (let index = 0; index < res.length; index++) {
                    let element = res[index];
                    let {title, client_uuid} = _this.$refs.bookTree.getNode(element.volume_uuid).data;
                    chapArr.push({title: element.title, volumeTitle: title, bookTitle: _this.filterBookItem.title, uuid: element.chapter_uuid, volume_uuid: element.volume_uuid});
                  }
                }

               x++;
                if(x<arry.length){
                  loadChapters(x, arry)
                }
              })
               
            }else if(arry[x].type === 2 && arry[x].chapters.length > 0){
                console.log('选中卷，已有章数据')
                if((x == arry.length-1) || (arry[x+1] && arry[x+1].volume_uuid != arry[x].client_uuid)){
                  console.log(x == arry.length-1?'末尾拼接':'中途拼接')
                  for (let index = 0; index < arry[x].chapters.length; index++) {
                    let element = arry[x].chapters[index];
                    chapArr.push({title: element.title, volumeTitle: arry[x].title, bookTitle: _this.filterBookItem.title, uuid: element.chapter_uuid, volume_uuid: element.volume_uuid});
                  }
                }
                
                 x++;
                if(x<arry.length){
                  loadChapters(x, arry)
                }
            }else if(arry[x].type === 3){
              console.log('选中章')
              let {title, client_uuid} = _this.$refs.bookTree.getNode(arry[x].volume_uuid).data;
              chapArr.push({title: arry[x].title, volumeTitle: title, bookTitle: _this.filterBookItem.title, uuid: arry[x].chapter_uuid, volume_uuid: arry[x].volume_uuid});
              x++;
              if(x<arry.length){
                loadChapters(x, arry)
              }
            }

          }

          // let checkedNodesAfter = this.$refs.bookTree.getCheckedNodes();
          // console.log('checkedNodesAfter',checkedNodesAfter)
          
          // checkedNodesAfter.forEach((aNode) => {
          //   console.log('aNode',aNode);

          //   if(aNode.type === 3){

          //     let {title, client_uuid} = this.$refs.bookTree.getNode(aNode.volume_uuid).data;
          //     // let {title, client_uuid} = this.$refs.bookTree.getNode(aNode.parent_client_uuid).data;
              
          //     console.log("title is: " + title);
          //     console.log("volume uuid is: " + client_uuid);

          //     chapArr.push({title: aNode.title, volumeTitle: title, bookTitle: this.filterBookItem.title, uuid: aNode.chapter_uuid});
          //   }
          // });

          console.log('chapArr',chapArr);
          setTimeout(() => {
            ipcRenderer.send('ipc-exportChapter', chapArr);
          }, 500);
          return;
        }else{
          this.saveChapter();
          console.log("no checked box, go current node: arr: ");
          let curNode = this.$refs.bookTree.getCurrentNode();
          console.log('curNode',curNode)
          if(curNode && curNode.type === 3){
            let parNode = this.$refs.bookTree.getNode(curNode.volume_uuid);
            // let parNode = this.$refs.bookTree.getNode(curNode.parent_client_uuid);
            console.log(parNode);
            chapArr.push({title: curNode.title, volumeTitle: parNode.data.title, bookTitle: this.filterBookItem.title, uuid: curNode.chapter_uuid});

            //wait for 500 milisec, so that saveChapter can finish its local sync work
            //then the content exported will match the content in db 
            setTimeout(() => {
              ipcRenderer.send('ipc-exportChapter', chapArr);
            }, 500);
            console.log(chapArr);
          }else{
            this.$message({showClose: true, message: '请先选定要导出的章节再进行导出操作',type: 'error'});
          }
        }
      },
      padDate (value){
        return value <10 ? '0' + value:value;
      },
      formatDate:function (value) {
        var date = new Date(value);
        var year = date.getFullYear();
        var month = this.padDate(date.getMonth()+1);
        var day = this.padDate(date.getDate());
        var hours = this.padDate(date.getHours());
        var minutes = this.padDate(date.getMinutes());
        var seconds = this.padDate(date.getSeconds());
        return year + '-' + month + '-' + day  + ' ' + hours + ':' + minutes + ':' + seconds;
      },
      sendBookList(){
        this.LIST_BOOK({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token});
      },

      uuid
  },
  watch: {
    filterBookItem:function (after, before) {
      // 判断是否是切换书籍after和before重client_uuid值不同，或是否该页面第一次打开before无数据
      console.log(after,before)
      if((after&&before&&(after.client_uuid !== before.client_uuid))||(!before&&after.client_uuid)){
        if(this.$refs.bookTree&&this.$refs.bookTree.getCurrentKey()){
          this.$refs.bookTree.setCurrentKey(null);
        }
        // console.log(this.$refs.bookTree.getCurrentNode())
        console.log('after',after)
        if(!after.SubCategories) return;
        if (after.SubCategories[0]&&after.SubCategories[0].SubCategories.length){
            this.treeConfig.defaultExpanded = [after.SubCategories[0].client_uuid];
            this.$nextTick(() => {
              let current_data = after.SubCategories[0].SubCategories[0];
              this.$refs.bookTree.setCurrentKey(current_data.client_uuid);
              let current_node = this.$refs.bookTree.getNode(current_data.client_uuid)
              console.log(current_node)
              this.treeClick(current_data, current_node)
              // console.log("wa???????????")
              // process.nextTick(() => {
              //   this.editor.focus();
              //   this.editor.setSelection({index: 0, length: 0}, 'api');
              // });
            })
          }
          console.log("ha?: ");
          console.log(after.client_uuid);
          this.NOTE_LIST({book_uuid:after.client_uuid})
      }
      if(after&&before&&(after.client_uuid !== before.client_uuid)){
        // 初始化history ,当stack中无修改记录时可能返回的是 undefined，也有可能返回objeck对象，包含redo和undo,的栈
        let history = this.editor.history.stack||{redo:[], undo: []};
        if(history.redo.length||history.undo.length){
          let volume_uuid = this.$refs.bookTree.getNode(this.chapter.chapter_uuid).data.volume_uuid
          let data = {
            chapter:{
              bookId: before.client_uuid,
              volume_uuid: volume_uuid,
              chapter_uuid: this.chapter.chapter_uuid,
            }
          }
          console.log('filterBookItem change sync book read')
          this.init_spawn_sync();
          // console.log("amazing place33333")
          this.editor.history.clear()
          this.sync_chapter_content(data)
        }
        // this.$nextTick(() => {
        // })
        this.info_chapter({
          content:"",
          recordContent: "",
          chapter_uuid: "",
          version: ""
        })
      }
    }
  },
  computed: {
    ...mapGetters({
      GET_INFO_BOOK: 'GET_INFO_BOOK',
      GET_EDITOR_BOOKS_L1: 'GET_EDITOR_BOOKS_L1',
      GET_BOOK_VOLUMES_L1: 'GET_BOOK_VOLUMES_L1',
      GET_CURRENT_BOOK_VOLUMES_L1: 'GET_CURRENT_BOOK_VOLUMES_L1',
      GET_CURRENT_BOOK_ID_L1: 'GET_CURRENT_BOOK_ID_L1',
      // GET_CURRENT_BOOK_L1: 'GET_CURRENT_BOOK_L1',
      GET_NOTES: 'GET_NOTES',
      GET_USET_DATA: 'user/GET_USET_DATA',
      GET_PLUGIN_SETTING: 'GET_PLUGIN_SETTING',
      GET_TYPE_SETTING: 'GET_TYPE_SETTING'
    }),
    editor(){
      return this.$refs.writing.quill
    },
    filterBookList(){
      console.log("trigger a get editor opened book")
      return this.GET_EDITOR_BOOKS_L1.filter((item) => {
        if(item.act_type != 0){
          return item
        }
      })
      // return this.GET_INFO_BOOK.filter((item) => {
      //   if(item.act_type != 0){
      //     return item
      //   }
      // })
    },
    filterBookItem(){
      // this.reyDookid = this.filterBookList[0].client_uuid
      // this.cloneObj(this.filterBookList[0])
      // return this.filterBookList[0];
      /**
       * 逻辑后期代做修改
       * */ 
      for(let i =0; i<this.filterBookList.length; i++){
        if(this.filterBookList[i].act_type == 1){
          this.reyDookid = this.filterBookList[i].client_uuid
          return this.cloneObj(this.filterBookList[i])
        }
      }
    },

    // getVolumes(){
    //   console.log("get current")
    //   return this.GET_EDITOR_BOOKS_L1.filter((item) => {
    //     if(item.client_uuid === this.GET_CURRENT_BOOK_ID_L1) return item
    //   }).volumes
    //   // return this.GET_CURRENT_BOOK_VOLUMES_L1.volumes;
    // },

    getNotes(){
      return this.GET_NOTES.NOTE_LIST
    },
    chapter_status(){
      let status = this.chapter.is_upload;
      if(status === 0){
        return '正在同步'
      }else if(status === 1){
        return '同步成功'
      }else if(status === 2){
        return '同步失败'
      }
    },
    get_chapter_path(uuid){
      return this.$refs.bookTree.getNode(uuid)
    }
  },
  mounted() {
    console.log("editor mounted !!!!!!!!!!!!!!");
    var _this = this;

    // setTimeout(() => {
    //   console.log("wo?")
    //   console.log(JSON.stringify(_this.getVolumes));
    //   console.log(JSON.stringify(this.GET_BOOK_VOLUMES_L1("33eddf31-d09f-4891-b091-eb94e2e3813b")))
    // }, 5000)

    document.querySelector('.chapter-box').style.width = 180 +'px';
    document.querySelector('.statistics-box').style.width = 230 +'px';
    document.getElementById("toolbar").onmousedown = function(e){
      console.log("toolbar mousedown");
      e.preventDefault();
    }

    // setTimeout(() => {
    //   this.toggleSelectionMode();
    // }, 500);

    // ipcRenderer.on('selectNoteMessage', (event, arg) => {
    //   this.dialogVisible2 = true;
    //   for(let i=0; i<this.GET_NOTES.NOTE_LIST.length; i++){
    //     this.selectImgToggle.push(this.GET_NOTES.NOTE_LIST[i].is_selected)
    //   }
    // });
    // ipcRenderer.on('createNoteMessage', (event, arg) => {
    //   this.dialogVisible = true;
    // });

    this.wordGoal = store.get('wordGoal');
    this.timeGoal = store.get('timeGoal');

    if(this.wordGoal || this.timeGoal){
      this.wordProgress = store.get('wordProgress');
      this.timeProgress = store.get('timeProgress');
      this.$message({showClose: true, message: '进入强制锁定模式',type: 'warning'});      
      ipcRenderer.send('lock-editor');
      this.bubbleVisible = true;
    }

    // ipcRenderer.on('show-lock-message', (event, arg) => {
    //     this.$message({showClose: true, message: '当前已经处于锁定模式, 请先完成当前目标',type: 'success', iconClass: "none"});      
    // });
    ipcRenderer.on('msg', (event, arg) => {
      console.log(getMsg(arg.type))
      if(arg.type === 'show_lock_message'){
        this.$message({showClose: true, message: getMsg(arg.type) ,type: 'success', iconClass: "none"});              
      }else if(arg.type === 'chapter_success'){
        if(this.operateFiletype){
          this.operateFiletype = false
          this.$message({showClose: true, message: getMsg(arg.type) ,type: 'success', iconClass: "none"}); 
        }             
      }else if(arg.type === 'show_file_message'){
        if(this.operateFiletype){
          this.operateFiletype = false
          this.$message({showClose: true, message: getMsg(arg.type),type: 'error', iconClass: "none"}); 
        }
      }else if(arg.type === 'chapter_error'){
        this.$message({showClose: true, message: getMsg(arg.type),type: 'error', iconClass: "none"}); 
      }
    })
    ipcRenderer.on('TRY_SPAWN_WARN', (event, data) => {
      this.$alert(getMsg(data.type), '', {
          confirmButtonText: '好的',
          callback: action => {
            // this.$message({
            //   type: 'info',
            //   message: `action: ${ action }`
            // });
          }
        });
    })
    // ipcRenderer.on('show-file-message', (event, arg) => {
    //     this.$message({showClose: true, message: '请耐心等待当前文件操作完成',type: 'error', iconClass: "none"}); 
    // });
    ipcRenderer.on('hide-bubble', () => {
      this.bubbleVisible = false;
    })


    ipcRenderer.on('tester-unlock', (event, arg) => {
      this.wordGoal = 0;
      this.wordProgress = 0;
      this.timeGoal = 0;
      this.timeProgress = 0;
      this.lockTimeDisplay = 0;
      store.set("wordGoal", 0);
      store.set("wordProgress", 0);
      store.set("timeGoal", 0);
      store.set("timeProgress", 0);      
      this.locked = '';
      this.showUser = true;
      // this.bubbleVisible = false;
    });
    ipcRenderer.on('worker-error', (event, data) => {
      _this.chapter.is_upload  =  2;
      console.log('接收到子进程同步失败的消息1111111111111111111111111111111111111111111')
      let chapter_uuid = this.chapter.chapter_uuid;
      if(data&&(data.code === 409)){
        let chapterNode = this.$refs.bookTree.getNode(data.client_uuid);
        console.log(chapterNode.data)
        let onlineData = {...chapterNode.data, ...{hasConflict:"online"}}
        let localData = {...chapterNode.data, ...{hasConflict:"local"}}
        console.log('onlineData', onlineData)
        console.log('localData', localData)
        let arr = [localData, onlineData];
        this.disabled= false;
        // {x:0, arry:newChapter, uid:data.uid, token: data.token}
        this.INSERT_CONFLICT_CHAPTER_L1({arry: arr, x:0, uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token}).then((res) => {
          console.log('发现了冲突，数据库插入成功了，开始修改vuex数据')
          console.log(arr)
          this.SET_CHAPTERS_TO_VOLUME_IN_EDITOR_L1({book_uuid: chapterNode.data.bookId, volume_uuid: chapterNode.data.volume_uuid, chapters: arr, partUpdate: true})
          // this.$nextTick(() => {
            setTimeout(function(){
              if(chapter_uuid === onlineData.client_uuid){
                  _this.$refs.bookTree.setCurrentKey(localData.client_uuid);
                 _this.$sqliteDB.queryData(`select * from chapter_content where chapter_uuid='${localData.chapter_uuid}' and is_deleted = 0 and uid='${_this.GET_USET_DATA.uid}'`).then((res) => {
                    _this.init_spawn_sync()
                    this.disabled= false;
                    _this.info_chapter({chapter_uuid: res[0].chapter_uuid, volume_uuid: localData.volume_uuid, content: res[0].content, recordContent: '', version: res[0].version, wordNum: localData.word_count})
                 })
              }
            },1000)
          // })
        })
      }
    });
    ipcRenderer.on('worker-success', (event, data) => {
      _this.chapter.is_upload = 1;
    });
    // ipcRenderer.on('chapter-success', (event, data) => {
    //   if(this.operateFiletype){
    //     this.operateFiletype = false
    //     this.$message({showClose: true, message: data, type: 'success', customClass: 'bookWarning'});         
    //   }
    // });
    // ipcRenderer.on('chapter-error', (event, data) => {
    //   if(this.operateFiletype){
    //     this.operateFiletype = false
    //     this.$message({showClose: true, message: data, type: 'error', iconClass: "none"}); 
    //   }
    // });
    ipcRenderer.on('import-chapter', (event, arg) => {
      console.log("we need to import files: ");
      console.log(arg);
      if(arg){
        this.chaptersWaitForImport = arg;
        this.totalChaptersForImport = arg.length;
      }
      this.importController();
    });
    // ipcRenderer.on('action-updateBook', (event) => {
    //   console.log(`action-updateBook 收到了消息，开始更新书本！！`)
    //   this.sendBookList()
    // })
    ipcRenderer.on('ipc-userChangeBook', (event, data) => {
      console.log(data)
      if(data.book_uuid){
        this.SYNC_USER_CHANGE_BOOK(data)
      }
    })
    ipcRenderer.on('operate-file-err', (event, arg) => {
      if(arg.message){
        this.$message({showClose: true, message: arg.message, type: 'error', iconClass: "none"}); 
      }else{
        this.$message({showClose: true, message: '本地文件修改失败!',type: 'error', iconClass: "none"});         
      }
    })

    this.timer = setInterval(function(){
      _this.timeDate = _this.formatDate(new Date()); //修改数据date
    },1000)
    //加载用户编辑器设置
    var editorSetting = store.get('editorSetting')
    if(editorSetting){
      if(editorSetting[this.GET_USET_DATA.uid]){
        this.setting = editorSetting[this.GET_USET_DATA.uid]
      }
    }

    this.waterMarkVisible = store.get("use-db") ? true : false;
    
    //拖拽
   
  },
  created() {
    // 书本章节列表初始化
    var slef = this;
    // this.$store.subscribe((mutation, state) => {
    //     if(mutation.type == "INFO_BOOK"){
    //       console.log(mutation)
    //     }
    ipcRenderer.on('changeChapterContent', (event, data) => {
      console.log(data)
      if(data.chapter_uuid === slef.chapter.chapter_uuid){
        slef.chapter.version = data.version
      }
    })
    //打开编辑器时重置计数
    var initLocalStatistics = store.get('statistics')
    if(initLocalStatistics){
      initLocalStatistics.total_words = 0
      initLocalStatistics.total_time = 0
      initLocalStatistics.total_pure_times = 0
      initLocalStatistics.total_rest_time = 0
      store.set('statistics',initLocalStatistics)
    }
    
    //回写统计版本号
    ipcRenderer.on('changeStatisticsVersion', (event, data) => {
      console.log('changeStatisticsVersion请求返回数据',data)
      var newData = data.result.statistics
      var newLocalStatistics = store.get('statistics')
      if(data.status==200){
        if(typeof newData == 'object'){
          if( typeof newData.length == 'number' ){
            newData.map((item, index, arr)=>{
              newLocalStatistics[item.book_uuid].version = item.version
            })
            store.set('statistics',newLocalStatistics)
          }else{
            
          }
        }
      }
      

      
      
    })
    // });
      /**
       * 监听回调添加本地卷
       * **/ 
    ipcRenderer.on("volume-add", (event, arg) => {
      let chapter = slef.filterBookItem.SubCategories.length
      arg['token'] = this.GET_USET_DATA.token
      arg['uid'] = this.GET_USET_DATA.uid
      slef.VOLUME_ADD_BOOK({arg, chapter})
    });
    ipcRenderer.on("chapter-add", (event, arg) => {
      let chapter = slef.filterBookItem.SubCategories[arg.index]['SubCategories'].length
      arg['token'] = this.GET_USET_DATA.token
      arg['uid'] = this.GET_USET_DATA.uid
      console.log("chapter-add in use?");
      slef.CHAPTER_ADD_BOOK({arg, chapter})
    });
    ipcRenderer.on("chapter-del", (event, arg) => {
      console.log("chapter-del: ")
      console.log(arg);
      this.$confirm('删除本章会将本章下的所有内容都删除，确定删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let filterBookItem = slef.filterBookItem;
          console.log(filterBookItem)
          let word_count = parseInt(filterBookItem.word_count - arg.word_count);
          Promise.all([
            localQuery.updateItemInDB({data: {word_count: word_count, is_upload: '0', client_uuid: filterBookItem.client_uuid}, changedProps: ['word_count','is_upload'], tableName: 'book_category'}),
            localQuery.updateItemInDB({data: {is_deleted: '1', is_upload: '0', client_uuid: arg.client_uuid}, changedProps: ['is_deleted','is_upload'], tableName: 'book_category'})
          ]).then(() => {
            let volumeNode = this.$refs.bookTree.getNode(arg.volume_uuid);
            let chapters_sort = [{
              volume_uuid: volumeNode.data.client_uuid,
              chapters: [

              ]
            }]
            volumeNode.childNodes.forEach((item) => {
              if(item.data.client_uuid !== arg.client_uuid){
                chapters_sort[0].chapters.push(item.data.client_uuid)
              }
            })
            console.log('sorte排序之后', chapters_sort)
            let sendData =localQuery.backSendTitleData({changeList:[{...arg, ...{is_deleted: 1, is_upload: 0}}, {...filterBookItem, ...{word_count: word_count}}],token: slef.GET_USET_DATA.token, book_uuid: arg.bookId });
            sendData.resData.sorts.chapters_sort = chapters_sort
            console.log(sendData)
            this.SYNC_UPDATE_BOOK_CONTENT_L1(sendData).then((res) => {
              let resData = res.data;
              let chapters = resData.result.chapters;
              let book_detail = resData.result.book_detail
              console.log('http 请求结束返回结果:  ')
              console.log(resData)
              let newChapterList = chapters.volumes[0].chapters.filter((item, index) => {
                if(item.code === 200){
                  localQuery.updateItemInDB({data: {version: item.version, is_upload: '1', client_uuid: item.chapter_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                  return item;
                }
              })
              if(book_detail.code === 200){
                  localQuery.updateItemInDB({data: {version: book_detail.version, is_upload: '1', client_uuid: resData.result.book_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
              }
              this.SET_BOOK_CONTENT_L1(resData.result)
            })
          })
            // slef.SET_BOOK_CONTENT_L1(sendData.resData)
          // slef.CHAPTER_DEL_BOOK(arg).then((res) => {
          //   this.$message({
          //     type: 'success',
          //     message: '删除成功!'
          //   });
          //   if(arg.chapter_uuid === this.chapter.chapter_uuid){
          //     this.clearChapterDisplay()              
          //   }
          // })
        }).catch(() => {
          console.log('失败')
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    });
    ipcRenderer.on("volume-del", (event, arg) => {
      console.log("volume_uuid: ");
      console.log(this.chapter);
      console.log(arg);
      slef.$confirm('删除本卷会将本卷下的所有章节都删除，确定删除吗', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // arg['uid'] =slef.GET_USET_DATA.uid
          // arg['token'] =slef.GET_USET_DATA.token
          // slef.VOLUME_DEL_BOOK(arg).then((res) => {
          //   slef.$message({
          //     type: 'success',
          //     message: '删除成功!'
          //   });
          // },(err) => {
          //   console.log(err)
          // })
           arg.is_deleted = 1;
          let sendData =localQuery.backSendTitleData({changeList:[arg],token: slef.GET_USET_DATA.token, book_uuid: arg.bookId });
          // arg['token'] = this.GET_USET_DATA.token
          // arg['uid'] = this.GET_USET_DATA.uid
          console.log(sendData)
          

          localQuery.updateItemInDB({data: {is_deleted: '1', is_upload: '0', client_uuid: arg.client_uuid}, changedProps: ['is_deleted','is_upload'], tableName: 'book_category'})
          .then(()=>{
              this.SYNC_UPDATE_BOOK_CONTENT_L1(sendData).then((res) => {
                let resData = res.data;
                let volumes = resData.result.volumes;
                console.log('http 请求结束返回结果:  ')
                console.log(resData)
                let newVolume = volumes.filter((item, index) => {
                  if(item.code === 200){
                    localQuery.updateItemInDB({data: {version: item.version, is_upload: '1', client_uuid: item.volume_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                    return item;
                  }
                })
                // this.SET_BOOK_CONTENT_L1(resData.result)
                slef.SET_BOOK_CONTENT_L1(sendData.resData)
                console.log(this.GET_CURRENT_BOOK_VOLUMES_L1)
              })
          })

          


          // slef.SET_BOOK_CONTENT_L1(sendData.resData)
          if(arg.volume_uuid === this.chapter.volume_uuid){
            this.clearChapterDisplay();
          }

        }).catch((e) => {
          console.log('取消删除')
          console.log(e)
          slef.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    });
    ipcRenderer.on("chapter-up", (event, arg) => {
      // if(index == 0){
      //   return false
      // }
      // let index = arg.CIndex;
      // let Upsort = arg.sort;
      // let parentData = slef.data[arg.index].children;
      // slef.$sqliteDB.executeSql(`UPDATE bookList SET sort = ${parentData[index].sort} WHERE id = ${parentData[index-1].id};UPDATE bookList SET sort = ${parentData[index-1].sort} WHERE id = ${parentData[index].id}`).then((res) => {
      //   parentData[index].sort = parentData[index-1].sort;
      //   parentData[index-1].sort = Upsort;
      //   [parentData[index], parentData[index-1]] = [parentData[index-1], parentData[index]]
      // })
      slef.CHAPTER_UP_BOOK(arg).then(() => {
        let keys = this.$refs.bookTree.getCheckedKeys();
        console.log(keys)
        slef.$refs.bookTree.updateKeyChildren(keys,slef.filterBookItem.children)
      })
    });
    ipcRenderer.on('book-open', (event, arg) => {
      console.log("book open got, check book_uuid");
      console.log(arg.book);
      this.curBookUuid = arg.book.client_uuid;
      console.log("this curBookUuid is: " + this.curBookUuid);

      this.ADD_OPEN_BOOK_TO_EDITOR_L1({book: arg.book});
      this.SET_CURRENT_BOOK_ID_L1(arg.book.book_uuid);
      this.NOTE_LIST({book_uuid: arg.book.book_uuid})

      setTimeout(() => {
        //给点时间绑库，之后再进行本地查询
        // this.getLocalAndOnlineVolumes();
        this.LIST_VOLUMES_O_L({book_uuid: this.curBookUuid, token: this.GET_USET_DATA.token, uid: this.GET_USET_DATA.uid})
      }, 50);

      if((!this.filterBookItem)||(arg.book.client_uuid !== this.filterBookItem.client_uuid)){
        this.CLIENT_LIST_BOOK({uid: this.GET_USET_DATA.uid}).then(() => {
          console.log('read send OPEN_BOOK')
          this.OPEN_BOOK({update_time: 0, uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token, book: arg.book})
        })
      }
    });
    //插件箱消息
    ipcRenderer.on('pluginsChanged',(event, arg) => {
      console.log('插件箱更改')
      this.PLUGIN_SETTING({uid: this.GET_USET_DATA.uid})
      
      this.LOCAL_PLUGIN_SETING(store.get('setting'))

      // this.UPDATE_PLUGIN_SETTING(store.get('setting'))
    });
    ipcRenderer.on('editorClose', (event) => {
      ipcRenderer.send('closewindow')
      console.log("hitXXXXXXXXX");
      let chapter = slef.chapter;
      let history = slef.editor.history.stack||{redo:[], undo: []};
      slef.closewindow = true;
      if((slef.chapter.chapter_uuid)&&(history.redo.length||history.undo.length)){
        if(slef.$refs){
          let chapterData = chapter.chapter_uuid?slef.$refs.bookTree.getNode(chapter.chapter_uuid).data:''
          slef.sync_chapter_content({chapter: chapterData})
          slef.statistics_sync()
        }
      }else{
        ipcRenderer.send('closewindow')
      }
    })
    // 校验书本是否处于打开状态
    ipcRenderer.on('book-state-list', (event, data) => {
      console.log(data)
      let bookType = false;
      slef.filterBookList.forEach((item) => {
        if(item.client_uuid === data.uuid){
          bookType = true;
          return false;
        }
      })
      ipcRenderer.send('send-book-state-list', {bookType: bookType, book_uuid: data.uuid})
    })
    this.$electron.ipcRenderer.on('change-title', (event, data) => {
      console.log(this.$refs)
      this.$refs[data.client_uuid].changeTitle()
      // if(data.client_uuid == this.data.client_uuid){
      //   this.changeType = true
      // }
    })
    // this.INFO_BOOK({sql:'select * from bookList where parent_id = ', id: 0})
    slef.subscribe = slef.$store.subscribe((mutation, state) => {
      console.log('mutation',mutation)
      if(mutation.type == "VOLUME_ADD_BOOK"){
        let data = mutation.payload.obj
        console.log('subscribe VOLUME_ADD_BOOK data: ')
        console.log(data)
        slef.$refs.bookTree.append(data)
        data.createType = true;
        slef.$refs.bookTree.getNode(data.client_uuid).expanded = true
        // this.$nextTick(() => {
        //   let boxClientRect = this.$refs.bookTree.$el.getBoundingClientRect();
        //   let clientRect = this.$refs[data.client_uuid].getBoundingClientRect();
        //   console.log(`viewHeight: `)
        //   console.log(boxClientRect)
        //   console.log(clientRect)
        //   if((clientRect.top>=boxClientRect.bottom)||(clientRect.bottom<=boxClientRect.top)){
        //     slef.$refs[data.client_uuid].scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
        //   }else{
        //     console.log('新加的卷在视口之内！')
        //   }
        // })
      }else if(mutation.type === 'SET_VOLUMES_TO_BOOK_IN_EDITOR_L1'){
        console.log("SET VOLUMES DONE: ");
        console.log(mutation);
        console.log(slef.GET_CURRENT_BOOK_VOLUMES_L1)

        let data = mutation.payload.volumes
        if(data&&data.length>0){
          let firstVolumeId = data[0] ? data[0].client_uuid:data[1].client_uuid
          slef.volumeExpand({client_uuid: firstVolumeId,parent_client_uuid: mutation.payload.book_uuid}).then((res)=>{
            slef.treeConfig.defaultExpanded = [firstVolumeId];
            let chapters = res
            if(chapters&&chapters.length>0){
              slef.treeClick(chapters[0], {level: 2})
              slef.$refs.bookTree.setCurrentKey(chapters[0].client_uuid)
            }
          })
          
          

        }
        // let curId = this.GET_CURRENT_BOOK_ID_L1;
        // console.log(curId);
      }else if(mutation.type === 'CREATE_CHAPTER_RESULT_L1'){
        console.log("wow in editor");
        console.log(mutation);
        let data = mutation.payload.obj
        let payload = mutation.payload

        if(payload.error){
          // this.importFileDetail.push({name: payload, error: tooLongError, operation: tooLongOperation})
          if(payload.obj.title.length >= 9){
            payload.obj.title = payload.obj.title.substr(0, 8) + '...'
          }          
          this.importFileDetail.push({name: payload.obj.title, error: payload.error.message, operation: failedOperation})
          this.failedChaptersForImport += 1;
          this.chaptersWaitForImport.shift();
          this.importController();
          return false
        }        

        data.createType = true;
        // this.$refs.bookTree.append(data, data.volume_uuid)
        if(payload.addEntrance !== "import"){
          data.createType = true;
          slef.$refs.bookTree.getNode(data.volume_uuid).expanded = true
        } else if(payload.addEntrance === "import"){
          console.log("chapter_add_book mutation done: ");
          console.log(mutation);
          // ipcRenderer.send('ipc-importChapter', `${this.filterBookItem.title}-${this.$refs.bookTree.getCurrentNode().title}`)
          this.prepareImport(payload);
          return false
        }


      }else if(mutation.type === 'CHAPTER_ADD_BOOK'){
        console.log("wow in editor");
        console.log(mutation);
        let data = mutation.payload.obj
        let payload = mutation.payload

        if(payload.error){
          // this.importFileDetail.push({name: payload, error: tooLongError, operation: tooLongOperation})
          if(payload.obj.title.length >= 9){
            payload.obj.title = payload.obj.title.substr(0, 8) + '...'
          }          
          this.importFileDetail.push({name: payload.obj.title, error: payload.error.message, operation: failedOperation})
          this.failedChaptersForImport += 1;
          this.chaptersWaitForImport.shift();
          this.importController();
          return false
        }

        data.createType = true;
        this.$refs.bookTree.append(data, data.volume_uuid)
        if(payload.addEntrance !== "import"){
          data.createType = true;
          slef.$refs.bookTree.getNode(data.volume_uuid).expanded = true
        } else if(payload.addEntrance === "import"){
          console.log("chapter_add_book mutation done: ");
          console.log(mutation);
          // ipcRenderer.send('ipc-importChapter', `${this.filterBookItem.title}-${this.$refs.bookTree.getCurrentNode().title}`)
          this.prepareImport(payload);
          return false
        }
        // 打开新建章所在的卷
        // setTimeout(() => {
        //   let boxClientRect = this.$refs.bookTree.$el.getBoundingClientRect();
        //   let clientRect = this.$refs[data.client_uuid].getBoundingClientRect();
        //   console.log(this.$refs[data.client_uuid])
        //   console.log(`viewHeight: `)
        //   console.log(boxClientRect)
        //   console.log(clientRect)
        //   if((clientRect.top>=boxClientRect.bottom)||(clientRect.bottom<=boxClientRect.top)){
        //     slef.$refs[data.client_uuid].scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
        //   }else{
        //     console.log('新加的章节在视口之内！')
        //   }
        // }, 300)
        // this.$nextTick(() => {
          // debugger
          // console.log(slef.$refs[data.volume_uuid])
          // console.log(slef.$refs.bookTree.getNode(data.volume_uuid).expanded)
          // slef.$refs[data.client_uuid].scrollIntoViewIfNeeded(false)
        // })
      }else if(mutation.type == 'VOLUME_DEL_BOOK'){
        console.log(mutation.payload)
        console.log("del vol")
        let node = slef.$refs.bookTree.getNode(mutation.payload.client_uuid);
        let curNode = slef.$refs.bookTree.getCurrentNode();
        console.log("del node: ");
        console.log(node);
        console.log("cur node: ");
        console.log(curNode);

        slef.$refs.bookTree.remove(node);
        if(curNode.volume_uuid === node.data.client_uuid){
          console.log("case1")
          if(slef.filterBookItem.SubCategories.length > 0){
            console.log("caseA")
            if(slef.filterBookItem.SubCategories[0].SubCategories){
              console.log("caseB")
              if(slef.filterBookItem.SubCategories[0].SubCategories.length > 0){
                console.log("caseC")
                let swapToChapNode = this.$refs.bookTree.getNode(slef.filterBookItem.SubCategories[0].SubCategories[0].client_uuid);
                this.treeClick(swapToChapNode.data, swapToChapNode);
                let parentNode = this.$refs.bookTree.getNode(swapToChapNode.data.volume_uuid);
                this.treeConfig.defaultExpanded = [parentNode.data['client_uuid']];

                this.$refs.bookTree.setCurrentKey(swapToChapNode.data.client_uuid);
              }
            }else{
              console.log("caseD")
              let swapToVolNode = this.$refs.bookTree.getNode(slef.filterBookItem.SubCategories[0].client_uuid);
              this.treeClick(swapToVolNode.data, swapToVolNode);
              this.$refs.bookTree.setCurrentKey(swapToVolNode.data.client_uuid);
            }
          }else{
            //do nothing, no chap left
          }

        }


      }else if(mutation.type == 'CHAPTER_DEL_BOOK'){
        let node = slef.$refs.bookTree.getNode(mutation.payload.client_uuid);
        let curKey = slef.$refs.bookTree.getCurrentKey();
        if(curKey === mutation.payload.client_uuid){
          // console.log("del chap, left vols are: ")
          // console.log(slef.filterBookItem.SubCategories)
          let parentNode = slef.$refs.bookTree.getNode(mutation.payload.volume_uuid);
          // console.log("pay load: ");
          // console.log(mutation.payload);
          // console.log("par node: ");
          // console.log(parentNode);
          slef.$refs.bookTree.remove(node);
          if(parentNode.data.SubCategories.length > 0){
            let swapToChapNode = this.$refs.bookTree.getNode(parentNode.data.SubCategories[0].client_uuid);
            this.treeClick(swapToChapNode.data, swapToChapNode)
            this.$refs.bookTree.setCurrentKey(parentNode.data.SubCategories[0].client_uuid);
          }else{
            this.treeClick(parentNode.data, parentNode)
            this.$refs.bookTree.setCurrentKey(parentNode.data.client_uuid)
          }
        }
      }else if(mutation.type == "OPEN_BOOK"){
        console.log("open book listener: ");
        console.log(mutation);
        // console.log(slef.filterBookItem);
        // console.log(slef.filterBookItem.title);
        // this.curBookCountOnOpen = slef.filterBookItem.word_count;
        console.log(slef.filterBookItem)
        this.bookName = mutation.payload.data.book.title
        console.log("this book name: " + this.bookName);
        // slef.filterBookItem.title

        console.log(this.GET_BOOKS_L1);
        // mutation.payload.data.book.act_type = 1;
        // this.ADD_OPEN_BOOK_TO_EDITOR_L1({book: mutation.payload.data.book});
        console.log(this.filterBookList);
        // this.NOTE_LIST({book_uuid: mutation.payload.data.book.client_uuid})
      }else if((mutation.type == 'GET_BOOK_MESSAGE') && (mutation.payload.status != 200)){
        slef.$message({showClose: true, message: mutation.payload.message, type: 'warning', customClass: 'bookWarning'})
      }else if(mutation.type === 'CHAPTER_CONTENT_SYNC'){
        this.$alert(`错误提示：${mutation.payload}\n\r;写入磁盘失败，为防止丢稿，请导出该章。重新新启动软件，如若不能解决，请尝试重启电脑！`, '警告', {
          confirmButtonText: '确定',
        });
      }
    })

    this.PLUGIN_SETTING({uid: this.GET_USET_DATA.uid})

  },
  beforeMount() {
    // ipcRenderer.send("ipc-bookInfo", );
    console.log('beforeMount')
  },
  beforeDestroy() {
    console.log('beforeDestroy in editor')
    if(this.subscribe){
      this.subscribe()
    }
    if(this.timer){
        clearInterval(this.timer); //在Vue实例销毁前，清除我们的定时器
    }

    document.getElementById("toolbar").onmousedown = null
 
  },
  components: {
    bookOpen,
    writing,
    titleChange,
    sensitiveWord,
    bookNew,
    menuBar,
    randomName,
    inspirationNote,
    forceLock,
    waiting,
    bubble,
    settings,
    waterMark,
    outline
  }
};
</script>
<style>

.book-open-cla .el-dialog__body {
  padding: 0 0 40px;
}
.chapter-box .el-tree{
  background: var(--bodyBg)
}
.chapter-box .el-tree .el-tree-node__content .custom-tree-node {
  flex-grow: 1;
  line-height: 22px;
}

.chapter-box .hideBox .el-tree-node .el-tree-node__content .el-checkbox .el-checkbox__input{
  display: none;
  /*visibility: hidden;*/
  /*width: 14px;*/
}
.chapter-box .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content{
  background-color: var(--colorChapterBg);
}
.chapter-box .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content .custom-tree-node .custom-tree-node-content .custom-tree-node-title{
  color: var(--colorBookName);
}
.chapter-box .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content .custom-tree-node .custom-tree-node-content .iconfont{
  color: var(--colorBookName);
}
.chapter-box  .el-tree-node__content:hover{
  background-color: var(--colorChapterHoverBg);
}

.chapter-box .el-tree .el-tree-node__content .custom-tree-node .custom-tree-node-title {
  /* width: 36px;
  height: 16px; */
  height: 100%;
  width: 80px;
  font-size: 12px;
  /* color: #999999; */
  display: inline-block;
  vertical-align: middle;
}
.chapter-box .el-tree .el-tree-node__content .custom-tree-node .custom-tree-node-title>div.ellipsis{
  height: 22px;
}
.chapter-box .el-tree .el-tree-node__content .custom-tree-node .custom-tree-node-title .custom-tree-node-title-input{
    width: 80px;
    height: 20px;
    border-radius: 2px;
    border: solid 1px var(--colorBorderDefault);
    outline: none;
    box-sizing: border-box;
  }
.writing-toolbar .min-select .el-input--mini .el-input__inner{
  height: 24px;
  line-height: 24px;
  background-color: var(--editorBg);
  border: 1px solid var(--colorBorderDefault);
  color: var(--colorBookName);
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
}
.writing-toolbar .min-select .el-input--mini .el-input__icon{
  line-height: 24px
}
.writing-search .el-input--small .el-input__inner{
  /* height: 24px; */
  /* line-height: 24px; */
  background-color: var(--colorHoverBg);
  border: 1px solid var(--colorBorderDefault);
  color: var(--colorBookName);
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
}
.writing-search .el-input--small ::-webkit-input-placeholder{
  color: var(--colorTextMinor);
}
.el-message{
    top: 50px !important;
  }
.el-message-box .el-button{
    border: solid 1px #dddddd;
    background-color: #f3f3f3;
}
.el-message-box .el-button--primary{
  background-color: #3e4347;
  border-color: #3e4347;
}
.el-message-box .el-button:hover {
    /* color: #606266 !important; */
    border-color: none;
    background-color: none;
}
</style>

<style scoped>
.iconfont{
  color: var(--colorIcon)
}
#editor {
  height: 100%;
  padding-top: 32px;
  box-sizing: border-box;
  background-color: var(--bodyBg);
}
#editor .mouse-right{
  width: 100px;
  padding: 10px 0;
  position: fixed;
  background-color: var(--colorUserDropDownListBg);
  box-shadow: 0 0 6px 0 var(--colorBoxShadow);
  border-radius: 3px;
  z-index: 999;
  font-size: 14px;
  overflow: hidden;
}
#editor .mouse-right li{
  color: var(--themeListColor);
  height: 35px;
  line-height: 35px;
  cursor: default;
  text-align: center;
}
#editor .mouse-right li:hover{
  background: var(--colorHoverBg);
}


a {
  display: inline-block;
}
.chapter-box {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--colorBorderDefault);
  overflow: hidden;
  box-sizing: border-box;
  transition: width .3s;
}
.operate-book {
  background: var(--bodyBg);
  text-align: center;
  /* margin-bottom: 30px; */
  min-width: 179px;
}
.operate-book .operate-one {
  height: 38px;
  background-color: var(--colorOpenBookBarBg);
  /* padding: 20px 0; */
  font-size: 0;
  display: flex;
  align-items: center;
  flex-direction: row;
}
.operate-book .operate-one .xian{
  display:inline-block;
  width:1px;
  height:20px;
  background: var(--colorOpenBookBarXian);
  margin: 0 14px;
}
.operate-book .operate-one a {
  font-size: 12px;
  color: var(--colorOpenBookBarFont);
  display: inline-block;
  /* width: 40px; */
  height: 38px;
  line-height: 38px;
}
.operate-book .operate-one a:first-child{
  margin-left:16px;
}
/* .operate-book .operate-one a img{
  vertical-align: middle;
  margin-right: 6px;
} */
.operate-book .operate-one a .iconfont{
  vertical-align: middle;
  margin-right: 6px;
}
.operate-book .operate-one a span{
  vertical-align: middle;
}
.operate-book .operate-new{
    position: relative;
    padding-top: 20px;
    padding-bottom: 10px;
    width:179px;
}
.operate-book .operate-new .el-button--primary{
    color: var(--btnDefaultColor);
    background-color: var(--btnDefaultBg);
    border-color: transparent;
}
/* .operate-book .operate-new:hover .operate-hover{
  opacity: 1;
  z-index: 1;
}
.operate-book .operate-new .operate-hover{
  height: 75px;
  width: 160px;
  position: absolute;
  right: -160px;
  top: 0;  
  opacity: 0;
  z-index: -1;
} */
/* .cre-chapter {
  display: inline-block;
  color: #fff;
  width: 160px;
  height: 34px;
  line-height: 34px;
  font-size: 12px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background-color: #3e4347;
} */
.chapter-box .book-name {
  min-width: 179px;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  margin-bottom: 15px;
  cursor: default;
}
.chapter-box .book-name span{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    width: 98px;
    vertical-align: middle;
    color: var(--colorBookName);
}
.chapter-box .book-name .iconfont{
  margin: 0 10px;
  vertical-align: middle;
}
/* .chapter-box .book-name img {
  margin: 0 10px;
  vertical-align: middle;
} */
.chapter-box .book-name i {
  line-height: 20px;
  /* font-size: 18px; */
  /* color: #333; */
  /* font-weight: bold; */
  margin-right: 8px;
  cursor: pointer;
}

.chapter-box .multi-sel-bar{
  min-width: 179px;
  height: 44px;
  box-sizing: border-box;
  border-top: 1px solid var(--colorBorderDefault);
  padding: 10px 13px;
  font-size: 12px;
  color: var(--colorOpenBookBarFont);
  cursor: pointer;

}

.chapter-box .multi-sel-bar .to-right{
  float: right;
}


/* .chapter-box .multi-sel-bar span:hover{
  color: #333;
} */

.el-container {
  height: 100%;
}

.tools-bar {
  height: 80px;
  padding-top: 15px;
  min-width:420px;
  padding-left: 20px;
  box-sizing: border-box;
  color: #333;
  text-align: left;
  border-bottom: solid 1px #edeff3;
  flex-shrink: 0;
  position: relative;
}
.tools-bar li {
  float: left;
}
.tools-bar .item {
  text-align: center;
  margin-right: 35px;
  font-size: 0;
}
.tools-bar .item:hover {
  background-color: #ecf5ff;
}
.tools-bar .item span {
  display: block;
  font-size: 12px;
  color: #333;
  margin-top: 6px;
}

.article-title {
  height: 29px;
  padding: 0;
  font-size: 12px;
  border-bottom: solid 1px var(--colorBorderDefault);
  flex-shrink: 0;
  position: relative;
}
.article-title .book-title-list{
  width:95%;
  height: 100%;
}
.article-title ul{
  height: 31px;
  overflow: hidden;
  white-space: nowrap;
  /* box-shadow: 0 1px 2px rgba(0,0,0,.1); */
  overflow-x: scroll;
  overflow-y: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
  -webkit-overflow-scrolling: touch;
  text-align: justify;
  box-sizing: border-box;
}
.article-title li {
  height: 30px;
  max-width: 270px;
  min-width: 100px;
  line-height: 30px;
  list-style: none;
  color: var(--colorChapter);
  display:inline-block;
  cursor: pointer;
  border-right: solid 1px var(--colorBorderDefault);
}
.article-title span {
  max-width: 230px;
  padding-left: 11px;
  display: inline-block;
  margin-right:5px;
}
.article-title li i {
  float: right;
  display:inline-block;
  line-height: 30px;
  margin-right: 5px;
  font-size: 10px;
  font-weight: bold;
}
.article-title li.actived {
  background-color: var(--colorHoverBg);
  font-size: 13px;
  color: var(--colorBookName);
}

.btn-collapse {
  width: 18px;
  font-size: 18px;
  position: absolute;
  /* left: 0; */
  right: 14px;
  top: 0;
  bottom: 0;
  margin: auto;
}

.statistics-box {
  box-sizing: border-box;
  padding-top: 20px;
  border-left: 1px solid var(--colorBorderDefault);
  transition: width .3s;
  color: var(--colorTextDefault);
}



.statistics-box .item-warp {
  padding:0 20px;
  min-width: 190px;
}

.statistics-box .item-box {
  margin-bottom: 20px;
  min-width: 190px;
}
.statistics-box .item-idea i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 7px;
}

.statistics-box .idea-green i {
  background-color: #5bc377;
}
.statistics-box .idea-green .item-card {
  background-color: #ebfaef;
}
.statistics-box .idea-orange i {
  background-color: #ff8833;
}
.statistics-box .idea-orange .item-card {
  background-color: #faf2eb;
}

.statistics-box .item-idea .item-card {
  color: var(--colorFooter);
}
.s-btn {
  display: inline-block;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}
.statistics-box .item-title .item-name {
  font-size: 12px;
  max-width: 120px;
  overflow: hidden;
}
.statistics-box .btn-hide {
  background-color: var(--editorIconActived);
  color: var(--colorFooter);
  float: right;
}
.statistics-box .el-button--mini {
  padding: 3px 7px;
  float: right;
}
.statistics-box .el-button--mini span {
  font-size: 12px;
}
.statistics-box .pluging-box ul{
  /* display: flex; */
  /* justify-content: space-between; */
  /* justify-content: flex-start; */
  margin: 10px 0;
  font-size: 0;
}
.statistics-box .pluging-box ul li{
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 6px;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.08);
  background-color: var(--pluginBtnBg);
  cursor: pointer;
  position: relative;
  /* overflow: hidden; */
}
.statistics-box .pluging-box ul li:last-child{
  margin-right: 0;
}
/* .statistics-box .pluging-box ul li::not(:last-child){
  margin-right: 10px;
} */
.statistics-box .pluging-box ul li p{
  width: 40px;
  height: 40px;
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
  color: var(--colorBookName);
  background-color: var(--pluginBtnBg);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  opacity: 0;
  transition: all .3s;
}
.statistics-box .pluging-box ul li p span{
  display: inline-block;
  text-align: left;
  line-height: 16px;
  padding-top: 4px;
}
.statistics-box .pluging-box ul li:hover p{
  opacity: 1;
}

.statistics-box .pluging-box ul li img{
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin: auto;
}
.statistics-box .pluging-box ul li .iconfont{
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin: auto;
  text-align: center;
  line-height: 40px;
  font-size: 22px;
}
.statistics-box .item-box .item-card {
  margin: 10px 0;
  padding: 8px 10px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  font-size: 12px;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.08);
  background-color: var(--pluginBtnBg);
  cursor: pointer;
}
.statistics-box .item-box .item-card.bg-darkGreen{
  background-color: var(--noteBgDarkGreen);
}
.statistics-box .item-box .item-card.bg-orange{
  background-color: var(--noteBgOrange);
}
.statistics-box .item-box .item-card.bg-darkBlue{
  background-color: var(--noteBgDarkBlue);
}
.statistics-box .item-box .item-card.bg-lightBlue{
  background-color: var(--noteBgLightBlue);
}
.statistics-box .item-box .item-card.bg-yellow{
  background-color: var(--noteBgYellow);
}
.statistics-box .item-box .item-card.bg-red{
  background-color: var(--noteBgRed);
}
.statistics-box .item-box .item-card.bg-lightGreen{
  background-color: var(--noteBgLightGreen);
}
.statistics-box .item-box .item-card p {
  word-break: break-all;
  white-space: pre-wrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 10;
}

.statistics-box .item-box .item-card .sub-count {
  flex-grow: 1;
}
.statistics-box .item-box .item-card .sub-count .sub-title {
  font-size: 12px;
  color: var(--colorChapter);
  height: 16px;
  line-height: 16px;
  display: block;
  margin-bottom: 4px;
}
.statistics-box .item-box .item-card .sub-count .sub-num {
  font-size: 18px;
  color: var(--colorBookName);
  height: 24px;
  line-height: 24px;
}

.edit-main{
  background-color: var(--editorBg);
  color: var(--colorTextDefault);
  text-align: center;
  padding: 0;
  min-width: 440px;
}
.el-footer {
  text-align: left;
  height: 36px !important;
  line-height: 35px;
  /* box-sizing: border-box; */
  font-size: 12px;
  color: var(--colorFooter);
  border-top: solid 1px var(--colorBorderDefault);
  flex-shrink: 0;
}
.el-footer p {
  display: inline-block;
}
.el-footer p span {
  margin-right: 20px;
}
.el-footer .time-now {
  margin-left: 30px;
  float: right;
}
.el-footer .time-now span {
  margin-right: 0;
}
.el-footer .select-length{
  margin-right: 0;
}
.el-footer .select-length i{
  color: #ff8833;
  font-style: normal;
}


.cg-writing{
  height: auto;
  min-height: 100%;
  max-height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}
.cg-writing .flod-btn{
  display: inline-block;
  font-size: 0;
  position: absolute;
  cursor: pointer;
  bottom: 78px;
}
.cg-writing .flod-btn .iconfont{
  font-size: 20px;
  color: var(--colorChapter)
}
.cg-writing .flod-left{
  left: 10px;
}
.cg-writing .flod-right{
  right: 10px;
}
.writing-search{
  width:100%;
  padding: 10px;
  height: 54px;
  display: flex;
  font-size: 12px;
  display: -webkit-flex;
  flex-shrink: 0;
  box-sizing: border-box;
  /* border-top: solid 1px var(--colorBorderDefault); */
  border-bottom: solid 1px var(--colorBorderDefault);
  background-color: var(--bodyBg);
}
.writing-search .el-button--primary{
  color: var(--btnDefaultColor);
  background-color: var(--btnDefaultBg);
  border-color: transparent;
}
.writing-search .el-button--info{
  color: var(--btnDefaultColor);
  background-color: var(--btnDefaultBg);
  border-color: transparent;
}
.writing-search .miniBtnRow{
  width: 195px;
  height: 30px;
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--btnDefaultBg);
  flex-direction: column;
  border: 1px solid var(--colorBorderDefault);
  position: relative;
  margin-right:33px;
}
.writing-search .miniBtnRow::after{
    font-family: element-icons !important;
    speak: none;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    content: "\E621";
    position: absolute;
    -moz-transform:rotate(-90deg); 
    -webkit-transform:rotate(-90deg);
    top: 5px;
    right: -24px;
    color: var(--colorOpenBookBarXian);
}
.writing-search .search-input{
  width: 150px;
  height: 30px;
  border-radius: 4px;
  margin-right: 10px
  /* border: solid 1px #d9d9d9; */
}
.writing-search .search-popover-title{
    width: 20px;
    height: 20px;
    padding: 0;
    background-color: var(--colorHoverBg);
    box-shadow: 0 0 6px 0 var(--colorBoxShadow);
    border: none;
    border-radius: 50%;
    margin-right: 10px;
    font-size: 12px;
    color: var(--colorTextDefault);
    font-weight: bold;
    margin-top: 5px;
}
.writing-search .miniBtn{
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  color: var(--btnDefaultColor);
  background: transparent
}
.writing-search .icon-search{
  position: relative
}
.writing-search .icon-search::before{
  content: ''
}
.writing-search .icon-search::after{
    font-family: element-icons!important;
    speak: none;
    font-style: normal;
    font-weight: 400;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    content: "\E621";
    position: absolute;
    -moz-transform:rotate(-90deg); 
    -webkit-transform:rotate(-90deg);
    color: var(--btnDefaultColor);
}
.writing-search .maxBtn{
  width: 90px;
  height: 30px;
  border-radius: 4px;
  padding: 0
}
/* .writing-search .replace-all{
  border: 1px solid black;
  color: black;
}  */


.book-open-cla .box-footer {
  padding-left: 30px;
  padding-right: 30px;
}
.chapter-box .el-tree{
      flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}
/* .chapter-list .el-tree .is-current{
     color: #333333;
     background-color: #f8f8f8;
   } */
.chapter-box .el-tree .el-tree-node__content .bookItemSyncType {
  float: right;
  margin-right: 7px;
}
.chapter-box .el-tree .el-tree-node__content .bookItemSyncType img {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

.article-title li i:hover{
  -webkit-animation: animationFrames linear .5s;
  -webkit-animation-iteration-count: 1;
  -webkit-transform-origin: 50% 50%;
}

@-webkit-keyframes animationFrames {
  0% {
    -webkit-transform:  rotate(0deg) ;
  }
  100% {
    -webkit-transform:  rotate(180deg) ;
  }
}

#toolbar{
  position: relative;
  padding:0;
  padding-right:100px;
  height: auto;
  line-height:40px;
  min-width:442px;
  min-height:40px;
}
.el-container .writing-toolbar{
  height: 40px;
  border: none;
  border-bottom: 1px solid var(--colorBorderDefault);
  text-align: left;
  position: relative;
}
.el-container .writing-toolbar .btn-collapse{
  top: 10px
}
.el-container .toolbarCenter{
  width: 100%;
  height: 40px;
  display: flex;
  align-items:center;
  padding-left:5px;
}
.el-container .toolbarCenter .toolbarRighr{
  position:absolute;
  right: 0;
  top:0px;
  height: 40px;
  line-height:40px;
}
.el-container .toolbarCenter .active,.utilwrap .active{
  background-color: var(--editorIconActived)
}
.el-container .writing-toolbar span:not(.active):active ,.utilwrap span:not(.active):active{
  background-color: var(--editorIconActived)  
}
.el-container .writing-toolbar span,.utilwrap span{
  width:20px;
  display: inline-block;
  margin: 0 5px;
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
}
.el-container .writing-toolbar span>img,.utilwrap span>img{
  vertical-align: middle;
}
.el-container .writing-toolbar span> .iconfont,.utilwrap span> .iconfont{
  vertical-align: middle;
}

.writing-toolbar .min-select{
  width: 115px;
  margin: 0 5px
}
/* .chapter-box:hover{
  overflow: inherit;
} */
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
  word-break: break-all;
  position: relative;
}

/**灵感水笔菜单样式**/
.noteItem{
position: relative;
}
.noteItem:hover .noteOptions{
  display: block;
}
.noteItem .noteOptions{
  width:90px;
  /* height:64px; */
  display: none;
  background-color: #ffffff;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.13);
  position: absolute;
  left: -18px;
  top: 38px;
  z-index: 999;
}
.noteItem .noteOptions li {
   display: block;
    width: 100%;
    height:32px;
    line-height: 32px;
    text-align: center;
    font-size: 12px;
    color: #333333;
    cursor: pointer;
}
.noteItem .noteOptions li:hover{
    background: #f8f8f8
}

.noteItem2{
  position: relative;
}
.noteItem2:hover .noteOptions2{
  display: flex;
}
.noteItem2 .noteOptions2{
  /* width: 80px; */
  display: none;
  background-color: var(--bodyBg);
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.13);
  position: absolute;
  /* left: -50%; */
  top: -32px;
  z-index: 999;
  font-size: 0;
}
.noteItem2 .noteOptions2 span {
  display: inline-block;
  float: left;
  width: 40px;
  height:32px;
  line-height: 32px;
  text-align: center;
  font-size: 12px;
  color: var(--colorBookName);
  cursor: pointer;
}
.noteItem2 .noteOptions2 span:hover{
    background: var(--colorHoverBg)
}
.showCussor{
  cursor: e-resize;
}
.wraitingBox{
  height: 100%;
  overflow-x:hidden;
}
.overs{
  display:flex;
  align-items:center;
  justify-content: center;
  clear: both;
  overflow: hidden;
}
.fl{
  float: left;
}
.overwrap{
  min-width: 440px;
}
.overwrap span{
  height: 20px;
  line-height:20px;
}
.utilwrap{
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    padding:0 5px;
    display: flex;
    font-size: 12px;
    display: -webkit-flex;
    flex-shrink: 0;
    box-sizing: border-box;
    /* border-top: solid 1px var(--colorBorderDefault); */
    border-bottom: solid 1px var(--colorBorderDefault);
    background-color: var(--bodyBg);
}
</style>
