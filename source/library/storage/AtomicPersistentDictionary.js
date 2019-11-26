"use strict"

/*

    AtomicPersistentDictionary

    An atomic persistent dictionary implemented as 
    a read & write cache on top of IndexedDB.
    
    On open, it reads the entire db into a dictionary
    so we can do synchronous reads and writes (avoiding IndexedDB's async API),
    and then call the async commit at the end of the event loop.

    - keys and values are assumed to be strings

    - at(key) returns a value from the internal dict
    - begin() shallow copies the current internal dict
    - atPut(key, value) & removeAt(key)
        applies normal op and adds key to changedKeys
    - revert()
        not supported yet
    - commit() constructs a transaction using changedKeys 
	- at(key) first checks the writeCache beforing checking the readCache
	
	- any exception between begin and commit should halt the app and require a restart to ensure consistency
	
    TODO: auto sweep after a write if getting full?
        
*/

window.AtomicPersistentDictionary = class AtomicPersistentDictionary extends ideal.AtomicDictionary {
    static initClass () {
        this.newSlots({
            name: "AtomicPersistentDictionary", // default name
            idb: null,
            isOpen: false,
            changedKeys: null,
        })
    }

    init() {
        super.init()
        this.setChangedKeys(new Set())
        this.setIdb(IndexedDBFolder.clone())
        this.setIsDebugging(true)
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
        this.idb().asyncOpenIfNeeded( () => this.onOpen(callback) )
        return this
    }
	
    onOpen (callback) {
        // load the cache
        //this.debugLog("" onOpen() - loading cache")
		
        this.idb().asyncAsJson( (dict) => {
            //	this.debugLog(" onOpen() - loaded cache")
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
	
    // ----
		
    clear () {
        //throw new Error("AtomicPersistentDictionary clear")
        this.setJsDict({})
        this.idb().asyncClear() // TODO: lock until callback?
    }
		
    // transactions

    begin() {
        this.debugLog(this.type() + " begin ---")

        super.begin()
        this.changedKeys().clear()
        return this
    }

    revert() {
        super.revert()
        this.changedKeys().clear()
        return this
    }
	
    commit () { // public
        this.debugLog(this.type() + " commit ---")
	    // push to indexedDB tx 
	    // TODO: lock until IndexedDB's tx complete callback is received,
        // ::: super.commit() is at end of method

	    this.assertInTx()
	    const tx = this.idb().newTx()
	    tx.begin()
        tx.setIsDebugging(this.isDebugging())
        
	    let count = 0
        
        this.changedKeys().keysArray().forEach((k) => {
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
		
        // indexeddb commits on next event loop automatically
        // this tx.commit() is just a sanity check -  marks the tx as committed so it raises exception 
        // if we attempt to write more to the same tx 
		 
        tx.commit() // TODO: lock until commit callback?
		
        this.debugLog(() => "---- " + this.type() + " committed tx with " + count + " writes ----")

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

    // --- helpers ---

    verifySync () {
        this.idb().asyncAsJson( (json) => {	 // BUG: we want to compare strings not json
            const isSynced = json.isEqual(this.jsDict())
            if (!isSynced) {
                //this.idb().show()
                //console.log("syncdb idb json: ", JSON.stringify(json, null, 2))
                throw new Error(this.type() + " verifySync failed")
            }
        })
    }
}.initThisClass()

