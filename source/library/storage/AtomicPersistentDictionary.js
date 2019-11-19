"use strict"

/*

    AtomicPersistentDictionary

    An atomic persistent dictionary implemented as 
    a read & write cache on top of IndexedDB so we can do synchronous reads and writes
    instead of dealing with IndexedDB's async API.

	On open, it reads the entire db into a dictionary.
    - keys and values are assumed to be strings

    - at(key) returns a value from the cach

    - begin() shallow copies the current cache
    
    - commit() constructs a transaction using changedKeys 

	- at(key) first checks the writeCache beforing checking the readCache
	
	- begin() - writes can only be done after calling begin() or an exception is raised
    - atPut(key, value) & removeAt(key)
        writes/removes are to the writeCache 
        writeCache format is: "key" -> { _value: "", _isDelete: aBool }
	- commit() flushes writeCache to indexedDBFolder, and updates readCache
	
	- any exception between begin and commit should halt the app and require a restart to ensure consistency
	
    TODO: auto sweep after a write if getting full?
    TODO: update keys, values and size method to use writeCache? Or just assert they are out of tx?

    Atomic Storage protocol:

    	asyncOpen()
		isOpen()
		begin()
		commit()
		at(key) // return dict
		atPut(key, dict)
		removeAt(key)
        clear()
        
*/

window.AtomicPersistentDictionary = class AtomicDictionary extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            name: "AtomicPersistentDictionary", // default name
            idb: null,
            isOpen: false,
            changedKeys: null,
        })

        this.setChangedKeys(new Set())
        this.setIdb(IndexedDBFolder.clone())
    }

    setName (aName) {
        this.idb().setPath(aName)
        return this
    }

    // open

    assertAccessible () {
        super.assertAccessible()
        this.assertOpen()
    }

    asyncOpen (callback) {
        this.idb().asyncOpenIfNeeded( () => { this.onOpen(callback) })
        return this
    }
	
    onOpen (callback) {
        // load the cache
        //console.log("AtomicPersistentDictionary didOpen() - loading cache")
		
        this.idb().asyncAsJson( (dict) => {
            //	console.log("AtomicPersistentDictionary didOpen() - loaded cache")
            this.setJsDict(dict)
            this.setIsOpen(true)
            if (callback) {
                callback()
            }
            //this.verifySync()
        })
    }
	
    assertOpen () {
        assert(this.isOpen())
        return this
    }
	
    // read

		
    clear () {
        //throw new Error("AtomicPersistentDictionary clear")
        this.setJsDict({})
        this.idb().asyncClear() // TODO: lock until callback?
    }
	
    verifySync () {
        this._isSynced = false
        this.idb().asyncAsJson( (json) => {	
            const isSynced = json.isEqual(this.jsDict())
			
            if (!isSynced) {
                //console.log("adding sync timeout")
                setTimeout( () => {
                    this.verifySync()
                }, 1000)
                //console.log("idb/sdb SYNCING")
            } else {
                console.log("AtomicPersistentDictionary SYNCED")
                this._isSynced = true
                //this.idb().show()
                //console.log("syncdb idb json: ", JSON.stringify(json, null, 2))
            }
        })
    }
		
    // transactions

    begin() {
        super.begin()
        this.changedKeys().clear()
        return this
    }
	
    commit () { // public
	    // push to indexedDB tx 
	    // TODO: lock until IndexedDB's tx complete callback is received,
        // ::: super.commit() is at end of method

	    this.assertInTx()
	    const tx = this.idb().newTx()
	    tx.begin()
        tx.setIsDebugging(this.isDebugging())
        
	    let count = 0
        
        this.keysChanged().keysArray().forEach((k) => {
            const isDelete = !this.jsDict().hasOwnProperty(k)

            if (isDelete) {
                tx.removeAt(k)
            } else {
                const isUpdate = this.oldVersion().hasOwnProperty(k)
                const v = this.jsDict()[k]
                
                if (isUpdate) {
                    tx.atUpdate(k, v)
                } else {
                    tx.atAdd(k, v)
                }                
            }
            count ++
        })
		
		 // indexeddb commits on next event loop but this "commit" is 
		 // a sanity check - it raises exception if we attempt to write more to the same tx 
		 
        tx.commit() 
		
        if (this.isDebugging()) {
            console.log("---- " + this.type() + " committed tx with " + count + " writes ----")
        }
		
        // TODO: use commit callback to clear writeCache instead of assuming it
        // will complete and setting it to null here

        super.commit()
        return count
    }
	
    atPut (key, value) {
        if (this.at(key) !== value) { 
            super.atPut(key, value)
            this.changedKeys().add(key)
        }
        return this
    }
	
    removeAt (key) {
        if (this.hasKey(key)) {
            super.removeAt(key)
            this.changedKeys().add(key)
        }
        return this
    }
}
    
window.AtomicPersistentDictionary.registerThisClass()
