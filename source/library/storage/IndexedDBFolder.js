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
        })
        this.assertHasUniqueId()
        //this.requestPersistenceIfNeeded()
        //this.setIsDebugging(true)
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
        return (this.db() !== null) 
    }
    
    asyncOpenIfNeeded (callback) {
        if (this.db() === null) {
            this.asyncOpen(callback)
        }
    }
    
    asyncOpen (callback) {
        this.assertHasUniqueId()

        this.debugLog("asyncOpen")
		
        const request = window.indexedDB.open(this.path(), 2);
        
        request.onerror = (event) => {
            console.log(this.typeId() + " open db error ", event);
        };
         
        request.onupgradeneeded = (event) => { 
            console.log(this.typeId() + " onupgradeneeded - likely setting up local database for the first time")

            const db = event.target.result;

            db.onerror = function(event) {
                console.log("db error ", event)
            };

            this.setDb(db)

            const objectStore = db.createObjectStore(this.storeName(), { keyPath: "key" }, false);          
            objectStore.createIndex("key", "key", { unique: true });
        };

        request.onsuccess =  (event) => {
            //console.log(this.typeId() + " db open onsuccess ", event)
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
        const db = IndexedDBFolder.clone().setPath(this.path() + pathComponent + this.pathSeparator())
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
        const objectStore = this.db().transaction(this.storeName(), "readonly").objectStore(this.storeName());
        const request = objectStore.get(key);

        const stack = new Error().stack
        
        request.onerror = (event) => {
            console.log("asyncAt('" + key + "') onerror", event.target.error)
            callback(undefined)
        };
        
        request.onsuccess = (event) => {
            //console.log("asyncAt onsuccess ", event)
            // request.result is undefined if value not in DB
            try {
                if (!Type.isUndefined(request.result)) {
                    //console.log("asyncAt('" + key + "') onsuccess request.result = ", request.result)
                    const entry = request.result
                    const value = JSON.parse(entry.value)
                    callback(value)
                } else {
                    //console.log("asyncAt('" + key + "') onsuccess request.result = ", request.result)
                    callback(undefined)
                }
            } catch (e) {
                console.log(this.typeId() + " asyncAt('" +  key + "') caught stack ", stack)
            }
        };
        
        return this
    }
    */
    
    asyncAsJson (callback) {   
        //console.log("asyncAsJson start")
        this.assertHasUniqueId()

        const cursorRequest = this.db().transaction(this.storeName(), "readonly").objectStore(this.storeName()).openCursor()
        const dict = {}
    
        cursorRequest.onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                dict[cursor.value.key] = JSON.parse(cursor.value.value)
                cursor.continue();
            } else {
                //console.log(this.typeId() + " asyncAsJson returning dict ", JSON.stringify(dict))
                callback(dict)
            }
        };
        
        cursorRequest.onerror = (event) => {
            console.log(this.typeId() + " asyncAsJson cursorRequest.onerror ", event)
            throw newError("error requesting cursor")
        }
    }
    
    show () {
        this.asyncAsJson((json) => {
	        console.log(this.typeId() + " " + this.path() + " = " + JSON.stringify(json, null, 2))
        })
    }
    
    // removing
    
    asyncClear (callback, errorCallback) {
        const transaction = this.db().transaction([this.storeName()], "readwrite");

        transaction.onerror = function(event) {
            if (errorCallback) {
                console.log("db clear error")
                errorCallback(event)
            }
        };

        transaction.oncomplete = function(event) {
            console.log("db clear completed")
        }

        const objectStore = transaction.objectStore(this.storeName());
        const request = objectStore.clear();

        request.onsuccess = function(event) {
            if (callback) {
                console.log("db clear request success")
                callback(event)
            }
        };
    }
	
    asyncDelete () {
        const request = window.indexedDB.deleteDatabase(this.storeName())
		
        request.onerror = (event) => {
  			console.log(this.typeId() +  "Error deleting '" + this.storeName() + "'");
        }
 
        request.onsuccess = (event) => {
            console.log(this.typeId() + " deleted successfully '" + this.storeName()  + "'");
    	}
		
        this.setDb(null)
        return this
    }
    
    // test
    
    test () {
        const folder = IndexedDBFolder.clone()
        folder.asyncOpen(() => {
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
