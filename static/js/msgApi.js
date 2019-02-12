const msgType = {
  // 插件箱提示
  show_lock_message: '当前已经处于锁定模式, 请先完成当前目标',
  // 本地文件操作提示
  chapter_success: '本地保存成功！',
  chapter_error: '本地保存失败！',
  show_file_message: '请耐心等待当前文件操作完成',
  try_spawn_warn: '当前网络异常，请导出本次编写的章节后重启软件以防丢失稿件！',
}
 const getMsg = (type) => {
  let msg = msgType[type];
  if(msg){
    return msg
  }else{
    return false
  }
}
export default getMsg;