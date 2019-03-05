"use strict"

/* 

    IndexedDBFolder

*/

window.IndexedDBFolder = class IndexedDBFolder extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            path: "/", // path should end with pathSeparator
            pathSeparator: "/",
            db: null,
            didRequestPersistence: false,
            debug: false,
        })
        this.assertHasUniqueId()
    }

    requestPersistenceIfNeeded () {
        if (!IndexedDBFolder.didRequestPersistence()) {
            this.requestPersistence()
        }
        return this
    }
	
    requestPersistence () {
        if (navigator.storage && navigator.storage.persist)
		  navigator.storage.persist().then((granted) => {
		    if (granted)
		      alert("Storage will not be cleared except by explicit user action");
		    else
		      alert("Storage may be cleared by the UA under storage pressure.");
		  });
		
        IndexedDBFolder.setDidRequestPersistence(true)
		
        return this
    }
    
    storeName () {
        return this.path()
    }
    
    root () {
        if (!IndexedDBFolder._root) {
            IndexedDBFolder._root = IndexedDBFolder.clone()
            // IndexedDBFolder._root.rootShow()
        }
        return IndexedDBFolder._root
    }
    
    isOpen () {
        return (this.db() != null) 
    }
    
    asyncOpenIfNeeded (callback) {
        if (this.db() == null) {
            this.asyncOpen(callback)
        }
    }
    
    asyncOpen (callback) {
        this.assertHasUniqueId()

        if (this.debug()) {
            console.log(this.type() + " asyncOpen")
        }
		
        let request = window.indexedDB.open(this.path(), 2);
        
        request.onerror = (event) => {
            console.log(this.type() + " open db error ", event);
        };
         
        request.onupgradeneeded = (event) => { 
            console.log(this.type() + " onupgradeneeded - likely setting up local database for the first time")

            let db = event.target.result;

            db.onerror = function(event) {
                console.log("db error ", event)
            };

            this.setDb(db)

            let objectStore = db.createObjectStore(this.storeName(), { keyPath: "key" }, false);          
            objectStore.createIndex("key", "key", { unique: true });
        };

        request.onsuccess =  (event) => {
            //console.log(this.type() + " db open onsuccess ", event)
            this.setDb(event.target.result)
            if (callback) {
                callback()
            }
        };
        
        return this
    }
    
    // paths
    
    folderAt (pathComponent) { 
        assert(!pathComponent.contains(this.pathSeparator())) 
        let db = IndexedDBFolder.clone().setPath(this.path() + pathComponent + this.pathSeparator())
        return db
    }
    
    pathForKey (key) {
        //assert(!key.contains(this.pathSeparator()))
        return this.path() + key
    }
            
    // writing
    /*
    asyncAt (key, callback) {
        //console.log("asyncAt ", key)
        let objectStore = this.db().transaction(this.storeName(), "readonly").objectStore(this.storeName());
        let request = objectStore.get(key);

        let stack = new Error().stack
        
        request.onerror = (event) => {
            console.log("asyncAt('" + key + "') onerror", event.target.error)
            callback(undefined)
        };
        
        request.onsuccess = (event) => {
            //console.log("asyncAt onsuccess ", event)
            // request.result is undefined if value not in DB
            try {
                if (typeof(request.result) != "undefined") {
                    //console.log("asyncAt('" + key + "') onsuccess request.result = ", request.result)
                    let entry = request.result
                    let value = JSON.parse(entry.value)
                    callback(value)
                } else {
                    //console.log("asyncAt('" + key + "') onsuccess request.result = ", request.result)
                    callback(undefined)
                }
            } catch (e) {
                console.log(this.type() + " asyncAt('" +  key + "') caught stack ", stack)
            }
        };
        
        return this
    }
*/

    
    asyncAsJson (callback) {   
        //console.log("asyncAsJson start")
        this.assertHasUniqueId()

        let cursorRequest = this.db().transaction(this.storeName(), "readonly").objectStore(this.storeName()).openCursor()
        let dict = {}
    
        cursorRequest.onsuccess = (event) => {
            let cursor = event.target.result;

            if (cursor) {
                dict[cursor.value.key] = JSON.parse(cursor.value.value)
                cursor.continue();
            } else {
                //console.log(this.type() + " asyncAsJson returning dict ", JSON.stringify(dict))
                callback(dict)
            }
        };
        
        cursorRequest.onerror = (event) => {
            console.log(this.type() + " asyncAsJson cursorRequest.onerror ", event)
            throw newError("error requesting cursor")
        }
    }
    
    show () {
        this.asyncAsJson((json) => {
	        console.log(this.type() + " " + this.path() + " = " + JSON.stringify(json, null, 2))

        })
    }
    
    // removing
    
    asyncClear (callback, errorCallback) {
        let transaction = this.db().transaction([this.storeName()], "readwrite");

        transaction.onerror = function(event) {
            if (errorCallback) {
                errorCallback(event)
            }
        };

        let objectStore = transaction.objectStore(this.storeName());
        let request = objectStore.clear();

        request.onsuccess = function(event) {
            if (callback) {
                callback(event)
            }
        };
    }
	
    asyncDelete () {
        let request = window.indexedDB.deleteDatabase(this.storeName())
		
        request.onerror = (event) => {
  			console.log(this.type() +  "Error deleting '" + this.storeName() + "'");
        }
 
        request.onsuccess = (event) => {
            console.log(this.type() + " deleted successfully '" + this.storeName()  + "'");
    	}
		
        this.setDb(null)
		
        return this
    }
    
    // test
    
    test () {
        let folder = IndexedDBFolder.clone()
        folder.asyncOpen(function() {
            folder.atPut("test", "x")
            
            folder.asyncAsJson(function (dict) {
                console.log("db dict = ", dict)
            })
            
            folder.asyncAt("test", function (value) {  
                console.log("read ", value)
            })
        })
        
    }
    
    newTx () {
        return window.IndexedDBTx.clone().setDbFolder(this)
    }
}


window.IndexedDBFolder.registerThisClass()

