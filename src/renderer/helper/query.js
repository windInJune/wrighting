import * as api from '../store/API'
import { resolve } from 'dns';
const values = require('lodash.values');
const pick = require('lodash.pick');
import { sqliteDBStrongDecode, arabiaToSimplifiedChinese } from '../../../static/js/public.js'
import uuid from 'uuid-random';
var localQuery = {
	listLocalBooks: function(data){
		//this is binded to window, so we can access to it via sqliteDB directly
		// console.log(sqliteDB);
		console.log("api book book_category is available in list local book? ");
		console.log(api.book_category);


		return sqliteDB.queryData(`select * from book_category WHERE type = 1 AND uid='${data.uid}'`);
		// return new Promise((resolve, reject) => {
		// 	sqliteDB.queryData(`select * from book_category WHERE type = 1 AND is_deleted = 0 AND uid='${data.uid}'`).then((res) => {
		// 		console.log("res in query");
		// 		console.log(res);
		// 	}, (err) => {
		// 		console.log("err in query");
		// 		console.log(err);
		// 	})
		// })

	},

	listLocalVolumes: function(data){
		//list a certain book's local volumes
		//ToRao: 参考Info_book 里面是循环了一下拿回来了
		console.log("list local volumes");
		console.log(data);
		return sqliteDB.queryData(`select * from book_category WHERE type = 2 AND parent_client_uuid='${data.client_uuid}'`);
	},

	listLocalChapters: function(data){
		//list a certain vol's local chapters
		//ToRao: 列出指定卷的所有章节
		console.log("list local chapters");
		return sqliteDB.queryData(`select * from book_category WHERE type = 3 AND parent_client_uuid='${data.client_uuid}'`);
	},

	queryBookItem: function(data){
	   return sqliteDB.queryData(`select * from book_category where client_uuid = '${data.client_uuid}' AND uid = ${data.uid}`)
	},

	queryChapterContent: function(data){
		return sqliteDB.queryData(`select * from chapter_content where chapter_uuid = '${data.chapter_uuid}' AND uid = ${data.uid}`)
	},

	//更新本地数据库中的卷章节信息, data 中的两个属性为 data: 一个书/卷/章的信息, changedProps: 需要修改的参数的字段
	updateItemInDB: function(data){
		console.log("update book in DB: ");
		console.log(data);
    let queryString = localQuery.makeQueryString(data);
    if(!queryString){
      return new Promise((resolve, reject) => {
        reject('缺少表名')
      })
    }
		console.log("result query string is: " + queryString);
		return sqliteDB.executeSql(
			`${queryString}`
		)
	},

	//标记本地数据库中的卷章节的信息为删除, 非真实删除, data中有一个属性 data: 一个书/卷/章的信息
	deleteItemInDB: function(data){
		console.log("try to mark an item in db as deleted");
		console.log(data);
		//设置is_delete 为1 已删除
		data.data.is_deleted = 1;
		console.log("after set it as deleted: ");
		console.log(data);
		localQuery.updateItemInDB({data: data.data, changedProps: ['is_deleted'], tableName: 'book_category'})
	},


	//TODO  20190123 之后考虑 直接 new Book 加几个class
	//TODO 201090123 client_uuid+book_uuid+bookId 太过冗余
	//依靠传入的数据, 补全uuid等信息生成一本书的数据实例
	makeBook: function(data){
		console.log("try to make a book");
		// console.log(data);
		let client_uuid = uuid();
		let book = {
			client_uuid: client_uuid,
			creation_status: 0,
			book_uuid: client_uuid,
			bookId: client_uuid,
			book_type: data.book_type ? data.book_type: '',
			goal_word_count: data.goal_word_count ? data.goal_word_count: 0,
			word_count: 0,
			is_deleted: 0,
			summary: data.summary ? data.summary: '',
			title: data.title,
			type: 1,
			version: 0,
			updated_at: 0
		}

		return book;
	},


	//创建一个新的卷的实例, 需提供所属的书id, 以及卷名或者建卷前的该书下的卷的数目(以此产生默认的卷名)
	makeVolume: function(data){
		if(!data.bookId){
			console.error("makeVolume: bookId is not provided")
			return;
		}
		let client_uuid = data.client_uuid ? data.client_uuid : uuid();
		let volume = {
			client_uuid: client_uuid,
			volume_uuid: client_uuid,

			parent_client_uuid: data.bookId,
			parentId: data.bookId,
			book_uuid: data.bookId,

			bookId: data.bookId,

			type: 2,
			title: data.volumeName ? data.volumeName : "第" + (arabiaToSimplifiedChinese(Number(data.volumeCount) + Number(1))) + "卷",

			word_count: 0,

			is_deleted: 0,
			is_upload: 0,
			version: 0			

		}

		return volume
	},
	//创建一个新的书的实例, 需提供所属的书和卷的id, 以及章名或者建章前的该卷下的章的数目(以此产生默认的章名)
	makeChapter: function(data){
		if(!data.volume_uuid || !data.bookId){
			console.error("makeChapter: volume_uuid or bookId is not provided")
			return;
		}
		let client_uuid = data.client_uuid ? data.client_uuid : uuid();
		let chapter = {
			client_uuid: client_uuid,
			chapter_uuid: client_uuid,

			parent_client_uuid: data.volume_uuid,
			parentId: data.volume_uuid,
			volume_uuid: data.volume_uuid,

			bookId: data.bookId,

			type: 3,

			title: data.chapterName ? data.chapterName : "第" + (arabiaToSimplifiedChinese(Number(data.chapterCount) + Number(1))) + "章",

			chapter_unit_price: 0,
			// goal_word_count: 0,
			word_count: 0,
			// creation_status: 0,

			is_deleted: 0,
			is_upload: 0,
			version: 0
			//这个时间不对的不要用
			// created_at: +new Date(),
		}

		return chapter;
	},


	//TODO: 2019/01/15
	//NI, RAO 可尝试合并 插入书卷章的口子


	//本地库插入书本，不需要线上同步，这里是用在本地比较后，插入线上没有的书
	insertBookToDB: function(data){
		//ToRao: 参考list_book 里的sqliteDB.insertData
		// return;
		console.log(data);
		console.warn("RAO FULLFIL: insert a book");
		if(!data.data.client_uuid){
			data.data.client_uuid = data.data.book_uuid
		}
		//组装数据，添加一些线上书籍没有的数据，之后在入库
		//book has no parent
		data.data.parent_client_uuid = '0';
		data.data.chapter_unit_price = 0;
		data.data.is_upload = 0;
		data.data.uid = data.user;
		data.data.conflict_uuid = data.data.conflict_uuid ? data.data.conflict_uuid : "0"

		console.log(data.data);
		console.log("lodash book pick arr")
		console.log(api.book_category_for_lodash_pick);
		let bookInfo = pick(data.data, api.book_category_for_lodash_pick)
		console.log("book info is: ")
		console.log(bookInfo)
		console.log("values of it:");
		console.log(values(bookInfo));
		//这里少插入了 book_json， 注意少了个问号, 额外注意这是个二维数组 []包裹了一个lodash.values数组
		return sqliteDB.insertData(`insert into book_category(${api.book_category_for_lodash_pick_string}) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [values(bookInfo)]);
	},

	//插入本地没有的卷
	insertVolumeToDB: function(data){
		console.log("insert a volume to db")
		console.log(data)

		if(!data.data.client_uuid){
			data.data.client_uuid = data.data.volume_uuid
		}

		data.data.parent_client_uuid = data.parentId ? data.parentId: data.data.parentId
		data.data.chapter_unit_price = 0;
		data.data.is_upload = 0;
		data.data.uid = data.user;
		data.data.conflict_uuid = data.data.conflict_uuid ? data.data.conflict_uuid : "0"

		console.log("data waiting for insert:")
		console.log(data.data);
		console.log("lodash pick arr: ");
		console.log(api.book_category_volume_and_chapter_for_lodash_pick);
		let volumeInfo = pick(data.data, api.book_category_volume_and_chapter_for_lodash_pick)
		console.log("volume info is: ");
		console.log(volumeInfo);
		console.log("values of it: ");
		console.log(values(volumeInfo));

		console.log("lodash pick str: ");
		console.log(api.book_category_volume_and_chapter_for_lodash_pick_string);

		return sqliteDB.insertData(`insert into book_category(${api.book_category_volume_and_chapter_for_lodash_pick_string}) values(?,?,?,?,?,?,?,?,?,?,?,?)`, [values(volumeInfo)])
	},

	//插入本地没有的章
	insertChapterToDB: function(data){
		console.log("insert a chapter to db")
		console.log(data)

		if(!data.data.client_uuid){
			data.data.client_uuid = data.data.chapter_uuid
		}

		data.data.parent_client_uuid = data.parentId ? data.parentId: data.data.parentId
		data.data.chapter_unit_price = 0;
		data.data.is_upload = 0;
		data.data.uid = data.user;
		data.data.conflict_uuid = data.data.conflict_uuid ? data.data.conflict_uuid : "0"

		console.log("data waiting for insert:")
		console.log(data.data);
		console.log("lodash pick arr: ");
		console.log(api.book_category_volume_and_chapter_for_lodash_pick);

		let chapterInfo = pick(data.data, api.book_category_volume_and_chapter_for_lodash_pick)
		console.log("chapter info is: ");
		console.log(chapterInfo);
		console.log("values of it: ");
		console.log(values(chapterInfo));

		console.log("lodash pick str: ");
		console.log(api.book_category_volume_and_chapter_for_lodash_pick_string);

		return sqliteDB.insertData(`insert into book_category(${api.book_category_volume_and_chapter_for_lodash_pick_string}) values(?,?,?,?,?,?,?,?,?,?,?,?)`, [values(chapterInfo)])		
	},


	//插入章节内容到本地库, 
	insertChapterContentToDB: function(data){
		console.log("try to insert chapter content into db");
		console.log(data);
		if(data.data.client_uuid){
			data.data.chapter_uuid = data.data.client_uuid;
		}
		if(data.data.bookId){
			data.data.category_id = data.data.bookId;
		}


		if(data.needUpload){
			//需要上传的情况下设定为 未上传
			data.data.is_upload = 0
		}else{
			//不需要上传的情况下 直接设定为已上传
			data.data.is_upload = 1
		}

		let chapterInfo = pick(data.data, api.chapter_content_for_lodash_pick)
		console.log('chapterInfo',chapterInfo)
		// chapterInfo.chapter_uuid = "special-insert";
		// chapterInfo.category_id = "special-insert";

		// console.log("xxxxxxxx chapterInfo: ");
		// console.log(chapterInfo);

		//获取所需要的章的信息后，在信息尾部再插入章节内容
		let valuesOfChapterInfo = values(chapterInfo)

		//添加 decode 解除'对sqlite语句的影响,
		//之后基本需要选一个sql safe 的编码。
		valuesOfChapterInfo.push(data.uid, sqliteDBStrongDecode(data.content, "'"));
		console.log('valuesOfChapterInfo',valuesOfChapterInfo)
		return sqliteDB.insertData(`insert into chapter_content(${api.chapter_content_for_lodash_pick_string}) values(?,?,?,?,?,?,?)`, [valuesOfChapterInfo])
	},

	//更新章节内容到本地库
	updateChapterContentInDB: function(data){
		console.log("chapter content: ")
		console.log(data.data.content);
		console.log("needUpload mark: ")
		console.log(data.data.needUpload);
		console.log("chapter uuid is: ")
		console.log(data.data.chapter_uuid)

		if(data.data.needUpload){
			//需要上传的情况下设定为 未上传
			data.data.is_upload = 0
		}else{
			//不需要上传的情况下 直接设定为已上传
			data.data.is_upload = 1
		}

		data.data.client_uuid = data.data.chapter_uuid;
		//设置需要更新的表名为chapter_content
		data.tableName = "chapter_content"
		data.changedProps = ['content', 'is_upload']

		return localQuery.updateItemInDB(data)

  },
  // 传入数组，数据实例，返回修改书,卷,章同步接口所须的数据格式
  backSendTitleData(data){
    let volumes = [],chapters = {"volumes": []},book_detail = {};
    data.changeList.forEach(item => {
      if(item.type === 2){
        // 卷名修改
        volumes.push({
                "volume_uuid": item.volume_uuid,
                "title": item.title,
                "sort": item.sort,
                "is_deleted":item.is_deleted,
                "version":item.version
              })
      }else if(item.type === 3){
        let index = chapters.volumes.findIndex((chapter) => {
          return chapter.volume_uuid === item.volume_uuid
        })
        if(index !== -1){
          chapters.volumes[index]['chapters'].push({
              "title": item.title,
              "chapter_uuid": item.chapter_uuid,
              "sort": item.sort,
              "version": item.version,
              "is_deleted":item.is_deleted,
              "word_count":item.word_count,
            })
        }else{
          chapters.volumes.push({
            "volume_uuid": item.volume_uuid,
            "chapters": [{
              "title": item.title,
              "chapter_uuid": item.chapter_uuid,
              "sort": item.sort,
              "version": item.version,
              "is_deleted":item.is_deleted,
              "word_count":item.word_count,
            }]
          })
        }
      }else{
        book_detail['title'] = item['title']
        book_detail['summary'] = item['summary']
        book_detail['goal_word_count'] = item['goal_word_count']
        book_detail['word_count'] = item['word_count']
        book_detail['creation_status'] = item['creation_status']
        book_detail['is_deleted'] = item['is_deleted']
        book_detail['version'] = item['version']
        // Object.keys(item).forEach((key, index) => {
        //     book_detail[key] = item[key]
        // })
        // book_detail.title = item.title;
        // book_detail.summary = item.summary;
        // book_detail.goal_word_count = item.goal_word_count;
        // book_detail.word_count = item.word_count;
        // book_detail.creation_status = item.creation_status;
        // book_detail.is_deleted = item.is_deleted;
        // book_detail.book_type = item.book_type;
        // book_detail.version = item.version;
      }
    });
    return {
      resData: {
        book_uuid: data.book_uuid,
        book_detail: book_detail,
        volumes: volumes,
        chapters: chapters,
        sorts: {},
      },
      token: data.token,
    }
  },
	makeQueryString: function(data){
    	if(!data.tableName){console.error('请传入表名');return false};
		//组装需要的query 属性， 服务于update数据相关的query
		console.log("make query string called, data is: ");
		console.log(data);
		let queryString = `update ${data.tableName} SET `;
		data.changedProps.forEach((aProp, index) => {
			console.log("this prop is: ");
			console.log(aProp);
			console.log("this prop's value is: ");
			console.log(data.data[aProp]);
			if(index !== 0){
				queryString += ','
			}

			if((aProp === 'title') || (aProp === 'summary') || (aProp === 'book_type')){
				//非空校验
				if(!data.data[aProp]){
					let decodedPropValue = sqliteDBStrongDecode(data.data[aProp], "'");
					queryString += `${aProp} = '${decodedPropValue}'`
				}else{
					queryString += `${aProp} = '${data.data[aProp]}'`
				}
			}else{
				queryString += `${aProp} = '${data.data[aProp]}'` 
			}
		})

		let queryTerm = 'unknown'
		if(data.tableName === 'book_category'){
			queryTerm = 'client_uuid'
		}else if(data.tableName === 'chapter_content'){
			queryTerm = 'chapter_uuid'
		}
		//按需要添加查询用的栏目的名称

		queryString += ` where ${queryTerm} = '${data.data.client_uuid}'`;
		return queryString;
	},
}



export default localQuery