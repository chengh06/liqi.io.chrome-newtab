/* eslint-disable no-console */
/* global console: false; */

'use strict'

/**
 * @file indexedDb操作库
 *
 * @type {Object}
 */
function IDB() {
    this.db = {}; // db object
    this.dbName = 'ideaPumps'; // Database name

    // Database version
    // The version number is an unsigned long long number,
    // which means that it can be a very big integer.
    // It also means that you can't use a float,
    // otherwise it will be converted to the closest lower integer and the transaction may not start, nor the upgradeneeded event trigger
    this.dbVersion = 5;
    this.tableName = 'idea_quato'; // Table name
}

IDB.prototype.open = function () {
    var self = this;

    // 实例化IndexDB数据上下文，这边根据浏览器类型来做选择
    window.indexedDB = window.indexedDB || window.webkitIndexedDB;

    if (!window.indexedDB) {
        window.alert('Your browser doesn\'t support a stable version of IndexedDB.');
    }

    // The call to the open() function returns an IDBOpenDBRequest object
    // with a result (success) or error value that you handle as an event
    var idbOpenDBRequest = window.indexedDB.open(this.dbName, this.dbVersion);

    // event of initing the database
    idbOpenDBRequest.onupgradeneeded = function (e) {
        // Fetch the IDBDatabase
        self.db = e.target.result;

        console.log(self.db);
        // Create the instance of db
        self.createObjectStore();
    };

    // Error Callback Handler
    idbOpenDBRequest.onerror = function (e) {
        console.log(e.target.errorCode);
    };

    // Success Callback Handler
    idbOpenDBRequest.onsuccess = function (e) {
        // 获取数据库对象
        // 因为上面的初始化事件未必会被调用到，这里当然也得获取一次
        self.db = e.target.result;
        // self.createObjectStore();
    };
};

IDB.prototype.createObjectStore = function () {
    // Create an objectStore to hold information about our ideaQuatos. We're
    // going to use "id" as our key path because it's guaranteed to be
    // unique - or at least that's what I was told during the kickoff meeting.
    var objectStore = this.db.createObjectStore('ideaQuatos', {keyPath: 'id'});

    // Create an index to search ideaQuatos by name. We may have duplicates
    // so we can't use a unique index.
    objectStore.createIndex('id', 'id', {unique: true});

    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = function (event) {
        console.log('objectStore.transaction.oncomplete');
        // var ideaQuatoData = [
        //     {
        //         id: 3153,
        //         type: 'elm_texts',
        //         slug: 'guling-3',
        //         url: 'http://liqi.io/randomizer/guling-3/',
        //         status: 'publish',
        //         title: 'guling',
        //         content: '<p>很多人对远程工作比较好奇，比如一个人在家时间长了会不会寂寞之类的，当然是会的，所以有些时候我会跑到咖啡馆去，混在人群里面干活。<br />\n<br /></br><br />\n——<a href=\"http://liqi.io/guling\" target=\"_blank\">古灵｜Tower 后端工程师</a></p>\n',
        //         excerpt: '<p>很多人对远程工作比较好奇，比如一个人在家时间长了会不会寂寞之类的，当然是会的，所以有些时候我会跑到咖啡馆去，混 [&hellip;]</p>\n',
        //         date: '2016-03-30 21:27:03',
        //         modified: '2016-04-28 16:37:23'
        //     }
        // ];

        // // Store values in the newly created objectStore.
        // // this is what our ideaQuatos data looks like.
        // var ideaQuatoObjectStore = this.db.transaction(['ideaQuatos'], 'readwrite').objectStore('ideaQuatos');

        // for (var i = 0; i < ideaQuatoData.length; i++) {
        //     ideaQuatoObjectStore.add(ideaQuatoData[i]);
        // }
    };
};

IDB.prototype.randomRecord = function (done) {
    var self = this;

    var timer = setInterval(function () {
        if (self.db.name === 'ideaPumps') {
            clearInterval(timer);
            var store = self.db.transaction('ideaQuatos').objectStore('ideaQuatos');

            var request = store.count();
            request.onsuccess = function (e) {
                var count = e.target.result;
                var randomNum = parseInt(Math.random() * count, 10);
                console.log('randomNum: ' + randomNum);
                self.stepThrough(randomNum, done);
            };
        }
    });
};

IDB.prototype.stepThrough = function (idx, done) {
    var self = this;
    var timer = setInterval(function () {
        if (self.db.name === 'ideaPumps') {
            clearInterval(timer);
            var objectStore = self.db.transaction('ideaQuatos').objectStore('ideaQuatos');
            var index = 0;
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    if (index === idx) {
                        done(cursor.value);
                    }
                    else {
                        cursor.continue();
                    }
                }
                else {
                    console.log('No more entries!');
                }
                index++;
            };
        }
    }, 50);
};

IDB.prototype.addData = function (data) {
    var self = this;
    var timer = setInterval(function () {
        if (self.db.name === 'ideaPumps') {
            clearInterval(timer);
            var transaction = self.db.transaction(['ideaQuatos'], 'readwrite');

            var ideaQuatoObjectStore = transaction.objectStore('ideaQuatos');
            for (var i = 0; i < data.length; i++) {
                var request = ideaQuatoObjectStore.add(data[i]);
                request.onsuccess = function (e) {
                    console.log(e);
                    // event.target.result == data[i].ssn;
                };
                request.onerror = function (e) {
                    console.log(e);
                    // event.target.result == data[i].ssn;
                };
            }

            // Do something when all the data is added to the database.
            transaction.oncomplete = function (event) {
                console.log('All done!');
            };

            transaction.onerror = function (event) {
                console.log('errors');
                // Don't forget to handle errors!
            };
        }
    }, 50);
};

// 打开数据库操作的事件对象 -> 数据库对象 -> 存储对象
/* eslint-enable no-console */

if (typeof define !== 'undefined') {
    define(function (require) {
        return IDB;
    });
}