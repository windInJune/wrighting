import localQuery from './query.js'
//used to compare local and online data
//用于比较线上线下信息 书卷章
const orderBy = require('lodash.orderby')
const capitalize = require('lodash.capitalize')

function isChanged(aData){
	//is_upload --0 未上传 1已上传 2 上传失败
	//so when is_upload equals 0 or 2 is changed 
	if(Number.isInteger(aData.is_upload)){
		if(aData.is_upload === 1){
			return false
		}else{
			return true
		}
	}else{
		return false;
	}

}

function isBook(aData){
	// if(aData.book_uuid){
	if(aData.type === 1){
		return true;
	}else{
		return false;
	}
}

function isVolume(aData){
	if(aData.type === 2){
		return true;
	}else{
		return false;
	}
}

function isChapter(aData){
	if(aData.type === 3){
		return true;
	}else{
		return false;
	}
}

//你可能想写个firstCharToUpperCase的函数
//you may want a to upper case function instead
function getType(aData){
	switch(aData.type){
		case 1: 
			return "book";
		case 2:
			return "volume"
		case 3:
			return "chapter"
		default:
			return "unknown"
	}
}

function careSort(sort){
	if(Array.isArray(sort) && sort.length > 0){
		return true;
	}else{
		return false;
	}
}

function formatUploadData(data){
	console.log("format upload data: ")
	console.log(data);
	if(isBook(data)){
		//书的data处理
		console.log("format data for book");
		let sendData = {
			resData: {
				book_uuid: data.data.client_uuid,
				book_detail: {
					title: data.data.title,
					summary: data.data.summary,
					goal_word_count: data.data.goal_word_count,
					word_count: data.data.word_count,
					creation_status: data.data.creation_status,
					is_deleted: data.data.is_deleted,
					book_type: data.data.book_type,
					version: data.data.version
				},
				volumes: [],
				chapters: {
					volumes: []
				},
				sorts: {}
			},
			token: data.token,
			type: 'book'
		}

		return sendData;
	}else{
		//卷的data处理
		console.log("format data for volume");
	}
}



//参数： 本地数据(数组), 线上数据(数组), 父级id, 用户id, 用户token, 排序(数组), 测试标记(非空字符串即可)
export default function compare(local, online, parentId, userId, token, sort, testFlag){

	// console.log("local data: ");
	// console.log(local);
	// console.log("online: ");
	// console.log(online);

	if(!local){
		console.log("local arr is not valid, make an empty one")
		local = []
	}

	if(!online){
		console.log("online arr is not valid, make an empty one")
		online = []
	}

	console.log("lets rock!")

	if(testFlag === "test"){
		// let resJson = `[{"volume_uuid":"db2e7e49-7b3f-48b8-8cc6-c3438fc7f17c","chapter_uuid":"a1f6253b-581f-40d1-99da-8c1e7f56eb59","type":3,"title":"鹅鹅鹅","word_count":979,"sort":0,"version":500,"chapter_unit_price":0,"is_deleted":0,"update_number":0,"created_at":1543393515,"updated_at":1547002754,"client_uuid":"a1f6253b-581f-40d1-99da-8c1e7f56eb59", "is_upload": 0},
		// {"volume_uuid":"db2e7e49-7b3f-48b8-8cc6-c3438fc7f17c","chapter_uuid":"a1f6253b-581f-40d1-99da-8c1e7f56eb59","type":3,"title":"鹅鹅鹅","word_count":979,"sort":0,"version":505,"chapter_unit_price":0,"is_deleted":0,"update_number":0,"created_at":1543393515,"updated_at":1547002754,"client_uuid":"a1f6253b-581f-40d1-99da-8c1e7f56eb59-online", "hasConflict":true, "conflict_id": "a1f6253b-581f-40d1-99da-8c1e7f56eb59"},
		// {"volume_uuid":"db2e7e49-7b3f-48b8-8cc6-c3438fc7f17c","chapter_uuid":"e03a2e87-df84-429c-a3a2-6f1244391149","type":3,"title":"但是当时","word_count":19743,"sort":0,"version":92,"chapter_unit_price":0,"is_deleted":0,"update_number":0,"created_at":1543410025,"updated_at":1546667064,"client_uuid":"e03a2e87-df84-429c-a3a2-6f1244391149"}]`
		// let resArr = JSON.parse(resJson);
		// return resArr
		online = `[{"volume_uuid":"cdaa1020-1e3f-4f86-836d-0e573874ace3","chapter_uuid":"a1f6253b-581f-40d1-99da-8c1e7f56eb59","type":3,"title":"鹅鹅鹅","word_count":979,"sort":0,"version":505,"chapter_unit_price":0,"is_deleted":0,"update_number":0,"created_at":1543393515,"updated_at":1547002754,"client_uuid":"a1f6253b-581f-40d1-99da-8c1e7f56eb59", "is_upload": 0},
		{"volume_uuid":"cdaa1020-1e3f-4f86-836d-0e573874ace3","chapter_uuid":"e03a2e87-df84-429c-a3a2-6f1244391149","type":3,"title":"但是当时","word_count":19743,"sort":0,"version":92,"chapter_unit_price":0,"is_deleted":0,"update_number":0,"created_at":1543410025,"updated_at":1546667064,"client_uuid":"e03a2e87-df84-429c-a3a2-6f1244391149"},
		{"volume_uuid":"cdaa1020-1e3f-4f86-836d-0e573874ace3","chapter_uuid":"onlinene-df84-429c-a3a2-6f1244391149","type":3,"title":"线上特殊章","word_count":19743,"sort":0,"version":92,"chapter_unit_price":0,"is_deleted":0,"update_number":0,"created_at":1543410025,"updated_at":1546667064,"client_uuid":"onlinene-df84-429c-a3a2-6f1244391149"}]`

		online = JSON.parse(online);

		local = `[{"volume_uuid":"cdaa1020-1e3f-4f86-836d-0e573874ace3","type":3,"title":"鹅鹅鹅","word_count":979,"sort":0,"version":500,"chapter_unit_price":0,"is_deleted":0,"update_number":0,"created_at":1543393515,"updated_at":1547002754,"client_uuid":"a1f6253b-581f-40d1-99da-8c1e7f56eb59", "is_upload": 0},
		{"volume_uuid":"cdaa1020-1e3f-4f86-836d-0e573874ace3","type":3,"title":"但是当时","word_count":19743,"sort":0,"version":92,"chapter_unit_price":0,"is_deleted":0,"update_number":0,"created_at":1543410025,"updated_at":1546667064,"client_uuid":"e03a2e87-df84-429c-a3a2-6f1244391149"}]`

		local = JSON.parse(local);
	}

	if(testFlag === "bookTest"){
	online = `[{"book_uuid":"b9636ae2-ec9b-4409-8057-5bcea1dea779","type":1,"title":"daf这个版本应该是3","summary":"","goal_word_count":0,"word_count":0,"creation_status":0,"book_type":"","sort":0,"version":3,"is_deleted":0,"created_at":1545289021,"updated_at":1545289021},
	{"book_uuid":"33eddf31-d09f-4891-b091-eb94e2e3813b","type":1,"title":"ggggggggg","summary":"","goal_word_count":0,"word_count":100161,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757345,"updated_at":1544775443},
	{"book_uuid":"b4d670e0-f09f-42a5-b190-f1b561fddcfe","type":1,"title":"bg","summary":"","goal_word_count":0,"word_count":174,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757258,"updated_at":1546396114},
	{"book_uuid":"onlinee0-f09f-42a5-b190-f1b561fddcfe","type":1,"title":"onlineOnlyBook","summary":"","goal_word_count":0,"word_count":174,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757258,"updated_at":1546396114}]`

	online = JSON.parse(online);

	local = `[{"client_uuid":"b9636ae2-ec9b-4409-8057-5bcea1dea779","type":1,"title":"daf","summary":"","goal_word_count":0,"word_count":0,"creation_status":0,"book_type":"","sort":0,"version":1,"is_deleted":0,"created_at":1545289021,"updated_at":1545289021},
	{"client_uuid":"33eddf31-d09f-4891-b091-eb94e2e3813b","type":1,"title":"ggggggggg","summary":"","goal_word_count":0,"word_count":100161,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757345,"updated_at":1544775443, "is_upload": 0},
	{"client_uuid":"b4d670e0-f09f-42a5-b190-f1b561fddcfe","type":1,"title":"bg","summary":"","goal_word_count":0,"word_count":174,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757258,"updated_at":1546396114, "is_upload": 1},
	{"client_uuid":"locale0-f09f-42a5-b190-f1b561fddcfe","type":1,"title":"localOnlyBook","summary":"","goal_word_count":0,"word_count":174,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757258,"updated_at":1546396114}]`
	local = JSON.parse(local);
	}

	//卷的测试，只能用 101272265 下的21的那本书，或者自己拿相应的打开书下的卷做假数据， 不然找不到相应的书会出错
	if(testFlag === "volumeTest"){
		online = `[{"volume_uuid":"cdaa1020-1e3f-4f86-836d-0e573874ace3","type":2,"title":"第一卷","sort":0,"word_count":0,"version":1,"is_deleted":0,"created_at":1544756587,"updated_at":1544756587},
		{"volume_uuid":"online-online-4f86-836d-0e573874ace3","type":2,"title":"线上特殊卷","sort":0,"word_count":0,"version":1,"is_deleted":0,"created_at":1544756587,"updated_at":1544756587}]`
		online = JSON.parse(online)

		local = `[{"client_uuid":"cdaa1020-1e3f-4f86-836d-0e573874ace3","type":2,"title":"第一卷","sort":0,"word_count":0,"version":1,"is_deleted":0,"created_at":1544756587,"updated_at":1544756587}]`
		local = JSON.parse(local)
	}

	//比对后的结果数组
	let resArr = null;
	//比对后的操作数组，用于调用同步
	let operArr = [];

	//是否考虑sort参数
	let ifSort = careSort(sort);


	if(ifSort){
		//考虑sort 情况下，新创建长度为sort数组长度的数组，值当前全为undefined
		resArr = new Array(sort.length);
	}else{
		resArr = [];
	}

	let tempConflictArr = [];
	let tempLeftOnlineArr = [];


	for(let onlineIndex = 0; onlineIndex < online.length; onlineIndex++){

		// if(online[onlineIndex].is_deleted){
		// 	//删除了的目前不考虑
		// 	//TODO: 之后加入了回收站概念后再考虑

		// 	//TODO: 20190116, 本地删除线上未删除的情况

		// 	//is_deleted 也要关注, 挪动到找到对应章节后
		// 	continue;
		// }

		let hitIndex = -1;
		// console.log("book:!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ");
		// console.log(online[onlineIndex].title);
		for(let localIndex = 0; localIndex < local.length; localIndex++){
			// console.log("local book!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
			// console.log(online[onlineIndex].book_uuid);
			// console.log(local[localIndex].book_uuid);
			// console.log(online[onlineIndex].book_uuid);
			// console.log(local[localIndex].client_uuid);

			//get certain type _uuid like chapter/volume/book
			//线上接口数据都是 book_uuid, volumes_uuid, chapter_uuid
			if(online[onlineIndex][`${getType(online[onlineIndex])}_uuid`] === local[localIndex].client_uuid){
				//same book
				//同一本书

				hitIndex = localIndex;
				local[localIndex].updated_at = online[onlineIndex].updated_at

				if(online[onlineIndex].is_deleted && local[localIndex].is_deleted){
					//线上线下皆为删除不考虑,直接跳过下一个
					local.splice(hitIndex, 1);
					break;
				}



				// console.log("uuid is: " + online[onlineIndex][`${getType(online[onlineIndex])}_uuid`])
				// console.log("online version: " + online[onlineIndex].version);
				// console.log("local version: " + local[localIndex].version);
				if(online[onlineIndex].version > local[localIndex].version){
					//线上版本新,有冲突
					// console.log("online version is larger, go check conflict operation")

					if(!isChapter(online[onlineIndex])){
						//书和卷的情况下，只是使用最新的线上的名字
						let changedProps = [];
						local[localIndex].title = online[onlineIndex].title;
						// local[localIndex].title = online[onlineIndex].title;
						local[localIndex].word_count = online[onlineIndex].word_count;
						local[localIndex].version = online[onlineIndex].version;
						local[localIndex].is_deleted = online[onlineIndex].is_deleted;
						local[localIndex].book_type = online[onlineIndex].book_type;
						local[localIndex].goal_word_count = online[onlineIndex].goal_word_count;
						local[localIndex].summary = online[onlineIndex].summary;

						if(isBook(online[onlineIndex])){
							changedProps.push('title', 'word_count', 'version', 'is_deleted', 'book_type', 'goal_word_count', 'summary');
						}else{
							changedProps.push('title', 'word_count', 'version', 'is_deleted');
						}
						if(!ifSort){
							resArr.push(local[localIndex]);
						}else{
							let index = sort.findIndex((value) => { return value === local[localIndex].client_uuid})
							if(index >= 0){
								resArr[index] = local[localIndex];
							}else{
								// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")
							}
						}
						console.log("try to update item in db!!!")
						console.log(local[localIndex]);
						localQuery.updateItemInDB({data: local[localIndex], changedProps: changedProps, tableName: 'book_category'});
						// localQuery.deleteItemInDB({data: local[localIndex]});

					}else{
						//章需要特殊处理
						if(isChanged(local[localIndex])){
							//本地有修改，产生冲突了
							if(!ifSort){
								resArr.push(local[localIndex]);
								// online[onlineIndex].client_uuid = online[onlineIndex].client_uuid + "conflict";
								online[onlineIndex].hasConflict = 'online';
								resArr.push(online[onlineIndex]);

								//这里is_deleted已经不需要特殊标记了，标记已经是好的了

								// console.log("chapter conflict test enter: ")
								// console.log(local[localIndex])
								// localQuery.insertChapterContentToDB({data: local[localIndex], content: "这是测试用插入的content", uid: userId, needUpload: false});

							}else{
								//TODO: add conflict chaps to the right place
								let index = sort.findIndex((value) => { return value === local[localIndex].client_uuid})
								if(index >= 0){
									local[localIndex].hasConflict = 'local';
									resArr[index] = local[localIndex]
									// online[onlineIndex].client_uuid = online[onlineIndex].client_uuid + "conflict";
									online[onlineIndex].hasConflict = 'online';
									online[onlineIndex].conflictHelperIndex = index;
									tempConflictArr.push(online[onlineIndex]);
								}else{
									// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")									
									local[localIndex].hasConflict = 'local';
									tempLeftOnlineArr.push(local[localIndex]);
									online[onlineIndex].client_uuid = online[onlineIndex].client_uuid + "conflict";
									online[onlineIndex].hasConflict = 'online';
									online[onlineIndex].conflictHelperIndex = index;
									tempLeftOnlineArr.push(online[onlineIndex])

								}
							}


						}else{
							//本地未修改线上高，用线上
							if(!ifSort){
								resArr.push(online[onlineIndex])
							}else{
								let index = sort.findIndex((value) => { return value === online[onlineIndex].client_uuid})
								if(index >= 0){
									resArr[index] = online[onlineIndex];
								}else{
									// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")									
									tempLeftOnlineArr.push(online[onlineIndex])
								}
							}						
						}
					}




				}else if(online[onlineIndex].version < local[localIndex].version){
					//线下版本新,用线下版本，这个情况基本不可能发生。。除非掉库
					// console.log("local version is larger, impossible case")
				}else{
					//版本号一致,查询是否本地有修改,通过调用isChanged
					// console.log("local and online version match");
					// console.log("local data's is_upload: " +local[localIndex].is_upload);
					if(isChanged(local[localIndex])){
						//本地有修改
						if(!ifSort){
							resArr.push(local[localIndex]);
						}else{
							let index = sort.findIndex((value) => { return value === local[localIndex].client_uuid})
							if(index >= 0){
								resArr[index] = local[localIndex];
							}else{
								// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")
								//线下的新，余留数组里直接推个线下
								tempLeftOnlineArr.push(local[localIndex])
							}
						}
						//还需要触发同步
						// console.log("local data is changed");

						//TODO: 20190117 触发同步

						//小洲： 当前做法是抛出一个操作数组, 在book.js里进行同步

						if(isBook(local[localIndex])){
							local[localIndex].bookId = local[localIndex].book_uuid;
						}

						operArr.push(local[localIndex]);

						// if(isChapter(local[localIndex])){
						// 	//章级别只需要触发一次内容同步即可
						// 	console.log("比较中，章节需要同步的情况")

						// }else{
						// 	//书、卷级别需要组织数据调用同步接口
						// 	console.log("比较中，书卷级别需要同步的情况")
						// 	console.log(local[localIndex]);
						// 	let uploadData = formatUploadData({data: local[localIndex], token: token});
						// 	console.log("this is the window in compare")
						// 	console.log(window);
						// }



					}else{
						//本地未修改 安全的情况
						if(!ifSort){
							resArr.push(local[localIndex]);
						}else{
							console.log("local: ");
							console.log(local[localIndex]);
							console.log("sort： ");
							console.log(sort);
							let index = sort.findIndex((value) => { return value === local[localIndex].client_uuid})
							console.log("index is: " + index);
							if(index >= 0){
								resArr[index] = local[localIndex];
							}else{
								tempLeftOnlineArr.push(local[localIndex]) // console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")
							}
						}
						// console.log("local data not changed");
					}
				}
				break;

			}
		}

		if(hitIndex >= 0){
			//这里会减少local的长度，移除了被发现了有相应的线上数据的本地数据
			local.splice(hitIndex, 1);
			// console.log("after splice local length is: " + local.length);
		}else{
			//本地数据中找不到的线上数据, 直接入DB库, 并且本地插入临时的剩下的线上数组
			// resArr.push(online[onlineIndex])
			if(ifSort){
				let index = sort.findIndex((value) => { return value === online[onlineIndex].client_uuid})
				if(index >= 0){
					resArr[index] = online[onlineIndex];
				}
			}else{
				tempLeftOnlineArr.push(online[onlineIndex]);
			}
			//ToRao: 这里调用插入库, 根据不同类型调用不同的插入方法
			let dataType = capitalize(getType(online[onlineIndex]))

			localQuery[`insert${dataType}ToDB`]({data: online[onlineIndex], user: userId, parentId: parentId});
			// localQuery.insertBookToDB({book: online[onlineIndex], user: userId});

		}
	}

	// console.log("res Arr is: ");
	// console.log(resArr);
	if(tempConflictArr.length > 0){
		//冲突临时数组有章节，需在对应节点进行插入
		let orderedArr = orderBy(tempConflictArr, 'conflictHelperIndex');
		for(let orderIndex = 0; orderIndex < orderedArr.length; orderIndex++){
			//+1用于在原数据后插入， +orderIndex 是因为经过插入，原有的位置发生了向后推移
			resArr.splice(orderedArr[orderIndex].conflictHelperIndex+ 1 + orderIndex, 0, orderedArr[orderIndex]);
		}

	}

	if(tempLeftOnlineArr.length > 0){
		//循环处理完成，如果临时的线上库里有数据，说明未找到相应本地匹配，直接插入DB库
		for(let leftOnlineIndex = 0; leftOnlineIndex < tempLeftOnlineArr.length; leftOnlineIndex++){
			if(!tempLeftOnlineArr.is_deleted) resArr.push(tempLeftOnlineArr[leftOnlineIndex]);
		}
	}

	// console.log("res arr after deal with online arr is: " + resArr.length);
	// console.log("local length is: " + local.length);
	// console.log(JSON.parse(JSON.stringify(local)));
	if(local.length > 0){
		//线上数据处理完成，如果本地仍残留数据，考虑直接插入
		for(let leftLocalIndex = 0; leftLocalIndex < local.length; leftLocalIndex++){
			if(!local[leftLocalIndex].is_deleted) resArr.push(local[leftLocalIndex]);
		}
	}

	console.log("after all resArr is: ");
	console.log(resArr);

	return {resArr: resArr, operArr: operArr};
}



