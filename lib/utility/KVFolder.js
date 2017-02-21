/*
    A folder that with transactional group atomic full file writes.
    
    This is usefull as a simple key/value database when the values can fit in small/medium size files. 
        
    Example use:
    
        // open 
    
            var kv = KVFolder.clone().setFolder(Folder.clone().setPath("<path>"))
    
        // read a key
        // note: Reads are on uncommitted version until commit is complete.
    
            var aString = kv.at(key)
        
       // manual transaction     
       
            kv.begin()
            kv.atPut(k1, v1) 
            kv.atPut(k2, v2) 
            ...
            kv.commit()
    
        // automatic transaction
    
            kv.withinTx(callbackFunction) 
        
        // which handles commit and (on disk) rollback on exception for you
    
            withinTx: function(callback) {
                try {
                    this.begin()
                    callback()
                    this.commit()
                } catch (error) {
                    this.rollback()
                }
                return this
            },
    

    How it works:
    
        Most filesystems don't support transactions within files, but they 
        usually support the following:
        
            1. atomic file write complete on sync close
            2. atomic file move
            3. atomic folder rename  
            
        So we use these to provide atomic group full file writes.
    
        at()s reads are from "store" folder 
        atPut()s go to "uncommittedTxs" folder
        
        on commit():
            "uncommittedTxs" folder is renamed "committedTxs" 
            "committedTxs" files are moved to "store" folder
            then "committedTxs" folder is renamed to "uncommittedTxs"
            
        If on opening the DB, a "committedTxs"  folder is found, we finish moving to "store" folder.
        If a non-empty txs folder is found, delete as there was no commit (or move to a failed txs folder).
        
*/


var fs = require('fs');
var path = require('path')


KVFolder = ideal.Proto.extend().newSlots({
    type: "KVFolder",
    folder: null,
    txsFolder: null,
    storeFolder: null,
    baseFolder: null,
    hasBegun: false,
}).setSlots({
    init: function () {
        
    },
    
    setBaseFolder: function(aFolder) {
        // TODO: clone the folder
        this._baseFolder = aFolder
        this.setTxsFolder(aFolder.folderNamed("uncommittedTxs"))
        this.setStoreFolder(aFolder.folderNamed("store"))
        
        this.commitIfCommittedFolderExists()
        return this
    },
 
    fileForKey: function(key) {
        return this.storeFolder().fileNamed(key)
    },
    
    has: function(key) {
        return this.fileForKey(key).exists()
    },
    
    at: function(key) {
        return this.fileForKey(key).contents()
    },
    
    withinTx: function(callback) {
        try {
            this.begin()
            callback()
            this.commit()
        } catch (error) {
            this.rollback()
        }
        return this
    },
    
    begin: function() {
        if (this.hasBegun()) {
            throw "attempt to begin within in a transaction"
        }
        
        this.setHasBegun(true)
    },
    
    atPut: function(key, value) {
        if (!this.hasBegun()) {
            throw "attempt to write outside of a transaction"
        }        
        
        this.fileForKey(key).setContents(value)
        return this
    },
    
    hasUncommittedTxs: function() {
        return this.baseFolder().folderNamed("uncommittedTxs").hasFiles()
    },
    
    commit: function() {
        try {
            this.txsFolder().rename("committedTxs")
            this.commitIfCommittedFolderExists()
        } catch (error) {
            console.error(error)
        }
        
        this.setHasBegun(false)
        
        return this
    },
    
    commitIfCommittedFolderExists: function() {
        if (this.storeFolder().folderNamed("committedTxs").exists()) {
            this.txsFolder().moveFilesToFolder(this.storeFolder())
            this.txsFolder().rename("uncommittedTxs")
        }
        return this        
    },
    
    rollback: function() {
        // this will need to be integrated with 
        // persistence layer for in-memory record rollback
        // for now, just delete uncommitted txs
        
        this.txsFolder().removeFiles()        
        this.setHasBegun(false)
        return this
    },
 
})

