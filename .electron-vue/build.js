'use strict'

process.env.NODE_ENV = 'production'

const { say } = require('cfonts')
const chalk = require('chalk')
const del = require('del')
const packager = require('electron-packager')
const webpack = require('webpack')
const Multispinner = require('multispinner')

const buildConfig = require('./build.config') //–构建app
const mainConfig = require('./webpack.main.config')//打包主进程
const rendererConfig = require('./webpack.renderer.config') //打包渲染进程
const webConfig = require('./webpack.web.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

const fs = require('fs');
const path = require('path');

if (process.env.BUILD_TARGET === 'clean') clean()
else if (process.env.BUILD_TARGET === 'web') web()
else build()

function clean () {
  del.sync(['build/*', '!build/icons', '!build/icons/icon.*'])
  console.log(`\n${doneLog}\n`)
  process.exit()
}

function build () {
  greeting()

  del.sync(['dist/electron/*', '!.gitkeep'])

  const tasks = ['main', 'renderer']
  const m = new Multispinner(tasks, {
    preText: 'building',
    postText: 'process'
  })

  let results = ''

  m.on('success', () => {
    process.stdout.write('\x1B[2J\x1B[0f')
    console.log(`\n\n${results}`)
    console.log(`${okayLog}take it away ${chalk.yellow('`electron-packager`')}\n`)
    bundleApp()
  })

  //打包主进程
  pack(mainConfig).then(result => {
    results += result + '\n\n'
    m.success('main')
  }).catch(err => {
    m.error('main')
    console.log(`\n  ${errorLog}failed to build main process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })

  //打包渲染进程
  pack(rendererConfig).then(result => {
    results += result + '\n\n'
    m.success('renderer')

  }).catch(err => {
    m.error('renderer')
    console.log(`\n  ${errorLog}failed to build renderer process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })
}

function createUserDataFolder(){
  // console.log("dirname + ");
  // console.log(__dirname);
  // console.log("build config");
  // console.log(buildConfig);
  console.log("make a userData dir")
  if(process.platform === 'darwin') return false;
  fs.mkdirSync(path.join(__dirname, `../build/${buildConfig.win32metadata.ProductName}-${process.platform}-${buildConfig.arch}/resources/userData`))
  // console.log("copy app-update file")
  // fs.copyFileSync(path.join(__dirname, `../app-update.yml`) , path.join(__dirname, `../build/${buildConfig.win32metadata.ProductName}-${process.platform}-${buildConfig.arch}/resources/app-update.yml`));
}


function pack (config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
        let err = ''

        stats.toString({
          chunks: false,
          colors: true
        })
        .split(/\r?\n/)
        .forEach(line => {
          err += `    ${line}\n`
        })

        reject(err)
      } else {
        resolve(stats.toString({
          chunks: false,
          colors: true
        }))
      }
    })
  })
}
// 构建APP
function bundleApp () {
  packager(buildConfig, (err, appPaths) => {
    if (err) {
      console.log(`\n${errorLog}${chalk.yellow('`electron-packager`')} says...\n`)
      console.log(err + '\n')
    } else {
      console.log(`\n${doneLog}\n`)
      createUserDataFolder()
    }
  })
}

function web () {
  del.sync(['dist/web/*', '!.gitkeep'])
  webpack(webConfig, (err, stats) => {
    if (err || stats.hasErrors()) console.log(err)

    console.log(stats.toString({
      chunks: false,
      colors: true
    }))

    process.exit()
  })
}

function greeting () {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 85) text = 'lets-build'
  else if (cols > 60) text = 'lets-|build'
  else text = false

  if (text && !isCI) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold('\n  lets-build'))
  console.log()
}
