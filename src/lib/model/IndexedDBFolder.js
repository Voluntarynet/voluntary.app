
IndexedDBFolder = ideal.Proto.extend().newSlots({
    type: "IndexedDBFolder",
    path: "/", // path should end with pathSeparator
    pathSeparator: "/",
    //debug: true,
    db: null,
    //objectStore: null,
}).setSlots({
    init: function () {

    },
    
    storeName: function() {
        return this.path()
    },
    
    root: function() {
        if (!IndexedDBFolder._root) {
            IndexedDBFolder._root = IndexedDBFolder.clone()
           // IndexedDBFolder._root.rootShow()
        }
        return IndexedDBFolder._root
    },
    
    asyncOpenIfNeeded: function(callback) {
        if (this.db() == null) {
            this.asyncOpen(callback)
        }
    },
    
    asyncOpen: function(callback) {
        var request = window.indexedDB.open(this.path(), 2);
        
        var self = this
        
        request.onerror = function(event) {
            console.log("open db error ", event);
        };
         
        request.onupgradeneeded = function(event) { 
          console.log("onupgradeneeded ", event)
          var db = event.target.result;
          
          db.onerror = function(event) {
              console.log("db error ", event)
          };
          
          self.setDb(db)
          
          var objectStore = db.createObjectStore(self.storeName(), { keyPath: "key" }, false);          
          //self.setObjectStore(objectStore);
          objectStore.createIndex("key", "key", { unique: true });
        };

        request.onsuccess = function (event) {
              //console.log("db open onsuccess ", event)
              self.setDb(event.target.result)
              if (callback) {
                  callback()
              }
        };
        return this
    },
    
    // paths
    
    folderAt: function(pathComponent) { 
        assert(!pathComponent.contains(this.pathSeparator())) 
        var db = IndexedDBFolder.clone().setPath(this.path() + pathComponent + this.pathSeparator())
        return db
    },
    
    pathForKey: function(key) {
        //assert(!key.contains(this.pathSeparator()))
        return this.path() + key
    },
            
    // writing
    
    atPut: function(key, object) {
        var v = JSON.stringify(object)
        //console.log("atPut ", key, v)
        var entry = { key: key, value: v }
        var objectStore = this.db().transaction(this.storeName(), "readwrite").objectStore(this.storeName());
        objectStore.add(entry);
        return this
    },
    
    
    
    // reading

    asyncAt: function(key, callback) {
        //console.log("asyncAt ", key)
        var objectStore = this.db().transaction(this.storeName()).objectStore(this.storeName());
        var request = objectStore.get(key);
        
        request.onerror = function(event) {
            console.log("asyncAt onerror", event)
            callback(null)
        };
        
        request.onsuccess = function(event) {
            //console.log("asyncAt onsuccess ", event)
            if (request.result) {
                //console.log("asyncAt onsuccess request.result ", request.result)
                var entry = request.result
                var value = JSON.parse(entry.value)
                callback(value)
            } else {
                callback(null)
            }
        };
        
        return this
    },
 
    /*
    values: async function() {
        console.log("folder values start ")
        var result = await this.valuesPromise();
        console.log("folder values done = ", result)
        return result
    },
 
    valuesPromise: function() {
        var self = this;
        var promise = new Promise(function(resolve, reject) {
            console.log("valuesPromise resolving")
            resolve("test")
            //self.asyncValues(resolve)
        });
        console.log("valuesPromise returning")
        return promise
    },
    */

    asyncKeys: function(callback) {
        this.asyncAsJson(function (dict) {
            
            var keys = []
            for (var k in dict) {
                if (dict.hasOwnProperty(k)) {
                    keys.push(k)
                }
            }
            
            callback(keys)
                        
        })
        return this
    },
    
    asyncValues: function(callback) {
        //console.log("asyncValues start")
        this.asyncAsJson(function (dict) {
            
            var values = []
            for (var k in dict) {
                if (dict.hasOwnProperty(k)) {
                    values.push(dict[k])
                }
            }
            //console.log("asyncValues done callback")
            callback(values)

        })
        //console.log("asyncValues returning")
    },
    
    asyncAsJson: function(callback) {   
        //console.log("asyncAsJson start")
        var self = this
             
        this.asyncOpenIfNeeded(function () {
            //console.log("asyncOpenIfNeeded start")

            var cursorRequest = self.db().transaction(self.storeName()).objectStore(self.storeName()).openCursor()
            var dict = {}
        
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;

                if (cursor) {
                    dict[cursor.value.key] = JSON.parse(cursor.value.value)
                    cursor.continue();
                } else {
                    //console.log("asyncAsJson returning dict ", dict)
                    callback(dict)
                }
            };
            
            cursorRequest.onerror = function(event) {
                throw "error requesting cursor"
            }
        
        })        
        //console.log("asyncAsJson returning")
    },
    
    show: function() {
        //console.log(this.type() + " " + this.path() + " = ", this.asJson())
        //asyncAsJson
    },
    
    // removing

    asyncRemoveAt: function(key, callback) {
        var request = db.transaction(this.storeName(), "readwrite").objectStore(this.storeName()).delete(key);
            
        request.onsuccess = function(event) {
           callback()
        };

        return this
    },
    
    asyncClear: function() {
        
        var cursorRequest = this.db().transaction(this.storeName()).objectStore(this.storeName()).openCursor()
        cursorRequest.onsuccess = function(event) {
            var cursor = event.target.result;
            
        }
/*        
        IDBCursor.continue()
Advances the cursor to the next position along its direction, to the item whose key matches the optional key parameter.
IDBCursor.delete()
*/
        var self = this
        this.keys().forEach(function (key) {
            self.asyncRemoveAt(key)
        })
        return this
    },
    
    // root
    
    rootShow: function() {
        throw "not implemented"
    },
    
    rootJson: function() {
        throw "not implemented"
    },
    
    rootClear: function() {
        throw "not implemented"
    },
    
    test: function() {
        var folder = IndexedDBFolder.clone()
        folder.asyncOpen(function() {
            folder.atPut("test", "x")
            
            folder.asyncAsJson(function (dict) {
                console.log("db dict = ", dict)
            })
            
            folder.asyncAt("test", function (value) {  
                console.log("read ", value)
            })
        })
        
    },
})

//IndexedDBFolder.test()


