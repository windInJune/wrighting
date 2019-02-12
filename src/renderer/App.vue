<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'clectron-vue-demo'
  }
</script>

<style>
  /* CSS */
  html,body{
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    background: var(--bodyBg);
    transition: all .5s ease;
  }
  body{
    overflow-x: hidden;
  }
  #app{
    height: 100%;
  }
  html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, menu, nav, output, ruby, section, summary, time, mark, audio, video, input {
    margin: 0;
    padding: 0;
    border: 0;
    /* font-weight: normal; */
    vertical-align: baseline;
    /* 文字不能被选中*/
    -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
  }
  li,ol{
    list-style: none;
  }
  a{
    text-decoration: none;
  }
  .el-button{
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  }
  /* 自定义滚动条 */
::-webkit-scrollbar {
  width: 4px;
  height: 2px;
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: var(--scrollbarBg);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbarHoverBg);
}


  /* 修改placeholder字体颜色 */
  input::-webkit-input-placeholder{
    color:#CCCCCC;
  }

  button:hover{
    opacity: 0.9;
  }

  /* 单行字体超出省略展示 */
.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal;
    word-break: keep-all;
}
/*flex两边居中*/
.flex_between{
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  -webkit-justify-content: space-between;
}
/*居中*/
.flex_align{
  display: flex;
  display: -webkit-flex;
  align-items: center;
  -webkit-align-items: center;
}
/*box-size*/
.boxSize{
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

:root {
    --colorPrimary: #ffffff;
    --colorTextDefault: #333333;
    --colorTextMinor: #999999;
    --colorBorderDefault: #edeff3;
    --navBg: #e6e7e8;
    --colorMacBarClose: #ee4d4d;
    --colorMacBarMax: #f5a623;
    --colorMacBarMin: #1eca23;
    --colorMacBarText: #3e4347;
    --colorUserDropDownListBg: var(--colorPrimary);
    --colorIcon: #333333;
    --colorBoxShadow: rgba(0,0,0,0.13);
    --colorHoverBg: #f8f8f8; 
    --colorOpenBookBarBg: #f5f5f9;
    --colorOpenBookBarFont: #666666;
    --colorOpenBookBarXian: #d5d4d4;
    --colorBookName: #333333;
    --colorChapter: #999999;
    --colorChapterBg: #f0f0f0;
    --colorChapterHoverBg: #f5f7fa;
    --scrollbarBg: rgba(195, 195, 195, 0.6);
    --scrollbarHoverBg: rgb(195, 195, 195);
    --pluginBtnBg: #fff;
    --editorIconActived: #e9ebed;
    --editorBg: #f5f5f9;
    --colorFooter: #666666;
    --btnDefaultBg: #3e4347;
    --btnDefaultColor: #fff;
    --btnDefaultBorder: #E1E5E9;
    --navBarXianBg: #cfcfcf;

    --noteBgDarkGreen: #EBFAEF;
    --noteBgOrange: #FAF2EB;
    --noteBgDarkBlue: #F0F4FD;
    --noteBgLightBlue: #f1fcfe;
    --noteBgYellow: #FFF9E7;
    --noteBgRed: #fff2f9;
    --noteBgLightGreen: #f4ffeb;

    --themeColorDefault: #e7e7e7;
    --themeColorNight: #2e3a48;
    --themeColorEyeshieldOne: #ceddcf;
    --themeColorEyeshieldTwo: #779279;
    --themeListColor: #666666;
    --fontFamily: "Helvetica Neue",Helvetica,"PingFang SC","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    --bodyBg: #fff;
    
}

</style>
