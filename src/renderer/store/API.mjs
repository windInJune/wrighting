// const host = window.location.host;
// const LOCA = /(127\.0\.)|(192\.168\.)|(localhost)/.test(host);
const loginHost = 'http://doc.chenggua.com';
var hostAPI;
const urlVersion = '/v1'
if(process.env.NODE_ENV == 'development'){
   hostAPI = 'http://doc.chenggua.com'
}else{
   hostAPI = 'https://mazi.chenggua.com'
}
//用户查询图书列表
export const bookList = hostAPI + '/mazimodule' + urlVersion +'/book/list'
//用户同步图书目录
export const catalogueSync = hostAPI + '/mazimodule' + urlVersion +'/book/catalogue/sync'
// 查询图书目录列表
export const catalogueList = hostAPI + '/mazimodule' + urlVersion +'/book/catalogue/list'
// 用户同步卷下图书内容列表
export const chapterContentSync = hostAPI + '/mazimodule' + urlVersion +'/book/volume/chapter/content/list/sync'

//user.js
//账号密码登录
export const USER_SIGNIN = loginHost + '/maziuser/login'
//快捷登录（验证码登录）
export const USER_CODE_SIGNIN = loginHost + '/maziuser/quick-login'
//验证手机是否注册
export const getIsPhone = loginHost + '/verify/phone'
// 获取验证码
export const getCode = loginHost  + '/maziuser/sms/login'
//用户普通注册
export const USER_REGISTER = loginHost  + '/maziuser/register'
//下载用户sql
export const USER_DOWNLOAD_SQL = hostAPI  + '/mazimodule' + urlVersion +'/sql/download'
//修改个人资料
export const USER_CHANGE_DATA= loginHost  + '/maziuser/edit/profile'




//灵感随笔
export const noteSync = hostAPI + '/mazimodule' + urlVersion +'/book/notes/list/sync' //post
export const noteList = hostAPI + '/mazimodule' + urlVersion +'/book/notes/list' //get
//随机取名
export const randomNameSync = hostAPI + '/mazimodule' + urlVersion +'/randomname/collection/list/sync' //post
export const randomNameList = hostAPI + '/mazimodule' + urlVersion +'/randomname/collection/list' //get
//敏感词
export const sensitiveWordSync = hostAPI + '/mazimodule' + urlVersion +'/custom/sensitivewords/sync' //post
export const sensitiveWordGet = hostAPI + '/mazimodule' + urlVersion +'/common/sensitivewords' //get  获取公共部分及版本号  &types=version
export const sensitiveWordSearch = hostAPI + '/mazimodule' + urlVersion +'/custom/sensitivewords' //get  查询版本是否冲突



// 书本结构目录
export const book_category = 'client_uuid,parent_client_uuid,type,title,summary,chapter_unit_price,goal_word_count,word_count,book_type,creation_status,uid,book_json,is_deleted,is_upload,version'
export const module_record = 'id, client_uuid, category, update_time'
export const chapter_content = 'chapter_uuid,category_id,uid,content,version,is_deleted,is_upload' 
export const category = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109]