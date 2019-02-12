# 橙瓜码字

# 目录

<!-- MDTOC maxdepth:5 firsth1:0 numbering:0 flatten:0 bullets:1 updateOnSave:1 -->

- [build setup](#build-setup)
- [代码规范](#代码规范)
- [file structure](#file-structure)
- [plugins prediction](#plugins-prediction)
- [sqlite init](#sqlite-init)

<!-- /MDTOC -->

## build setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

```

---


>[vue-electron:1.0.6](https://electron.org.cn/vue/getting_started.html)  

>[Electron](https://electronjs.org/docs)  

>[vue:2.3.3](https://cn.vuejs.org/)

>[electron-rebuild:1.82](https://www.npmjs.com/package/electron-rebuild)

## 代码规范

> electron代码规范请查看 https://electronjs.org/docs/development/coding-style

> vue代码规范请查看 https://cn.vuejs.org/v2/style-guide/#%E8%A7%84%E5%88%99%E5%BD%92%E7%B1%BB

> CSS等样式规范请查看 http://alloyteam.github.io/CodeGuide/

```
书写 标准 JavaScript 样式
文件名应使用 - 连接而不是 _, 例如. file-name.js 而不是 file_name.js, 因为在 github/atom中模块名通常是 module-name 形式. 此规则仅适用于 .js 文件。
酌情使用更新的 ES6 / ES2015 语法
```

## file structure

```
.
├── CONFIG #存放用户配置文件
├── build #打包后生成路径
├── dist
│   ├── electron
│   │   ├── fonts
│   │   ├── imgs
│   │   └── static
│   ├── fonts
│   ├── imgs
│   └── static
├── src
│   ├── main #主进程目录
│   │   ├── index.dev.js
│   │   ├── index.js
│   │   ├── ipcMain.js #ipc通信配置文件
│   │   └── menuSets.js #菜单项配置文件
│   └── renderer #渲染进程代码
│       ├── components 
│       │   ├── pages #页面模块
│       │   └── plugins #组件模块目录
│       ├── assets #资源目录
│       ├── router #路由配置
│       └── store #数据状态管理
│           └── modules
├── static #静态资源管理文件
├── test
│   ├── e2e
│   │   └── specs
│   └── unit
│       └── specs
└── userData #数据库初步存放路径后会修改

```

## plugins prediction

> sortablejs 轻量级的拖放排序列表的js插件

> jszip 文件压缩与解压

> decompress-zip 提取ZIP存档的内容file

> chardet/jschardet: 用来实现字符串/文件编码检测模板

> sortablejs：拖放排序组件

> vuedraggable:实现拖拽效果

> auto-launch:在启动/登录/启动时启动任何应用程序或可执行文件

> diff-match-patch 文件差异和补全

> html2rtf 将html转换为rtf格式

> fs-extra node文件操作的封装

## sqlite init

```
npm install --global windows-build-tools
npm install sqlite3 --save
npm install electron-rebuild --save
```

> 如果是mac系统的话，执行：

```
./node_modules/.bin/electron-rebuild
```

> 如果是win系统的话，执行：

```
.\node_modules\.bin\electron-rebuild.cmd
```