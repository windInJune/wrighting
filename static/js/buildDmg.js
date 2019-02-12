const createDMG = require('electron-installer-dmg');
const path = require('path');
let rootPath = path.join(__dirname, '..', '..')
var opts = {
  appPath: path.join(rootPath, 'build', '橙瓜码字-darwin-x64', '橙瓜码字.app'),
  name: '橙瓜码字',
  title: '橙瓜码字',
  // background: path.join(rootPath, 'static', 'imgs', 'IconPng.png'),
  icon: path.join(rootPath, 'static', 'imgs', 'Icon.icns'),
  overwrite: true, 
  out: path.join(rootPath, 'build', '橙瓜码字-darwin-x64'),
}
console.log(opts)
createDMG(opts,  function done (err) { 
  console.log(err)
})