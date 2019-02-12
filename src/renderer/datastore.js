import path from 'path'
// const path = require('path');
// const app = require('electron').remote.app
import { remote } from 'electron'

var statics;
if (process.env.NODE_ENV !== 'development') {
    statics = path.join(remote.app.getAppPath(), '../userData').replace(/\\/g, '\\\\')
} else {
    statics = path.join(remote.app.getAppPath(), './userData')
}
// var sqlite3 = require('sqlite3').verbose();
var sqlite3 = require('sqlite3');
console.log(statics)
var DB = DB || {};
DB.SqliteDB = function(data, callback) {
    console.log("here in datastore: we are going to use db: " + data);
    console.log("exe path is: " + remote.app.getPath('exe'));
    let dbpath = path.join(statics, data+'.db')
    console.log("db path is: " + dbpath);
    DB.db = new sqlite3.Database(dbpath, function(err){
        if(err){
            console.log("open database error if exists: ");
            console.log(err);
            callback(err);
            console.log("print sqlite db's db")
            console.log(DB.db);
            console.log("db status?: open? " + DB.db.open);

        }else{
            console.log("database is opened without errors")
            callback("done");
            // DB.SqliteDB.db = DB.db;
            console.log("print sqlite db's db")
            console.log(DB.db);
            console.log("db status?: open? " + DB.db.open);
        }
        console.log("callback in DB sqliteDB")
    });

};


DB.printErrorInfo = function(err) {
    console.log("Error Message:" + err);
};

DB.SqliteDB.prototype.createTable = function(sql) {
    return new Promise(function(resolve, reject) {
        DB.db.serialize(function() {
            DB.db.run(sql, function(err) {
                if (null != err) {
                    DB.printErrorInfo(err);
                    reject(err)
                    return;
                } else {
                    resolve(resolve)
                }
            });
        });
    })
};

/// tilesData format; [[level, column, row, content], [level, column, row, content]]
DB.SqliteDB.prototype.insertData = function(sql, objects) {
    return new Promise(function(resolve, reject) {
        DB.db.serialize(function() {
            var stmt = DB.db.prepare(sql);
            for (let i = 0; i < objects.length; ++i) {
                stmt.run(objects[i]);
            }
            stmt.finalize((err) => {
              resolve()
            });
        });
    })
};

DB.SqliteDB.prototype.queryData = function(sql) {
    return new Promise(function(resolve, reject) {
        DB.db.all(sql, function(err, rows) {
            console.log("db has all");
            if (null != err) {
              console.log(sql)
                DB.printErrorInfo(err);
                reject(err)
                return;
            } else {
                resolve(rows);
            }
        });
    })
};

DB.SqliteDB.prototype.executeSql = function(sql) {
    return new Promise(function(resolve, reject) {
        DB.db.run(sql, function(err, rows) {
            console.log(rows)
            if (null != err) {
                DB.printErrorInfo(err);
                reject(err)
            } else {
                resolve(rows)
            }
        });
    })
};

DB.SqliteDB.prototype.importSqlFile = function(sql) {
  return new Promise(function(resolve, reject){
    console.log('exec run sql string')
    console.log(DB)
    console.log("sql good")
    // console.log(sql);
      DB.db.exec(sql, function(err) {
          console.log("wa")
          console.log(err)
          if (null != err) {
              DB.printErrorInfo(err);
              reject(err)
          } else {
              resolve(err)
          }
      });
  })
};

DB.SqliteDB.prototype.close = function() {
    DB.db.close();
};

// exports SqliteDB
export default DB.SqliteDB;