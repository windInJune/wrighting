const path = require('path')
/**
 * `electron-packager` options
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
 */

let iconPath = process.platform === 'darwin' ? path.join(__dirname, '../static/imgs/Icon') : path.join(__dirname, '../static/imgs/logo.ico')

module.exports = {
    arch: 'ia32', //目标架构和平台
    asar: true,
    dir: path.join(__dirname, '../'), //打包目录
    icon: iconPath, //应用图标
    ignore: /(^\/(src|test|\.[a-z]+|README|yarn|static|dist\/web|userData|CONFIG))|\.gitkeep/, //忽略那些文件
    extraResource: [path.join(__dirname, '../userData'), path.join(__dirname, '../CONFIG')],
    out: path.join(__dirname, '../build'),
    overwrite: true, //覆盖模式打包
    platform: process.env.BUILD_TARGET || 'all', //目标架构和平台
    appCopyright: "Copyright (C) 2018 chenggua.com",
    win32metadata: {
    	CompanyName: "橙瓜",
    	FileDescription: "橙瓜码字编辑器",
    	OriginalFilename: "橙瓜码字",
    	ProductName: "橙瓜码字",
    	InternalName: "橙瓜码字",
    	"requested-execution-level": "requireAdministrator"
    }
}