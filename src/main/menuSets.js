module.exports = [
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  // {
  //   label: 'View',
  //   submenu: [
  //     {role: 'reload'},
  //     {role: 'forcereload'},
  //     {role: 'toggledevtools'},
  //     {type: 'separator'},
  //     {role: 'resetzoom'},
  //     {role: 'zoomin'},
  //     {role: 'zoomout'},
  //     {type: 'separator'},
  //     {role: 'togglefullscreen'}
  //   ]
  // },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  // {
  //   role: 'help',
  //   submenu: [
  //     {
  //       label: 'Learn More',
  //       click () { require('electron').shell.openExternal('https://electronjs.org') }
  //     }
  //   ]
  // },
  // {
  //   label: '测试',
  //   click: (menuItem, browserWindow, event) => {
  //     console.log(menuItem, browserWindow, event)
  //   },
  //   submenu: [
  //     {
  //       label: '测试列表',
  //       click () { alert(1) }
  //     },
  //     {
  //       label: '测试列表',
  //       enabled: false,
  //       click () { alert(1) }
  //     }
  //   ]
  // }
]
