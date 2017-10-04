"use strict"

/*
    BaseApp is a singleton that represents the application
    For your application, create a subclass called App and implement
    a custom setup method.
*/

// ---

window.BaseApp = BMNode.extend().newSlots({
    type: "BaseApp",
    name: null,
    browser: null,
    shelf: null,
    about: null,
    isDebugging: true,
    version: "0.0",
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
		NodeStore.shared().asyncOpen( () => { this.didOpenStore() })
        this.clearAppLog()
    },

	didOpenStore: function() {
	    SyncScheduler.scheduleTargetAndMethod(this, "setup")
	},
    
	appDidInit: function() {
		// unused
	},
	
    setup: function() {
        //console.log("baseSetup")
        //this.fixElectronDropBehavior()
        //this.watchAllAppEvents()
        this.setupBrowser()
        return this        
    },
    
    rootView: function() {
        return  WebBrowserWindow.documentBody()
    },
    
    setupBrowser: function() {	
        this.setBrowser(BrowserView.clone())
       
        this.browser().setNode(this)
		this.browser().setOpacity(0)
		this.browser().setTransition("all 0.5s")
                
  
        //document.body.appendChild(this.browser().element())  
        this.rootView().addSubview(this.browser())
          
		this.browser().scheduleSyncFromNode() // this.browser().syncFromNode()

	    SyncScheduler.scheduleTargetAndMethod(this, "fadeInBrowser")
		
        // this.setupShelf()
        return this
    },
    
    setupShelf: function() {
	    this.setShelf(ShelfView.clone())
        this.rootView().addSubview(this.shelf())
		setTimeout(() => { 
		    this.shelf().appDidInit()
		    this.shelf().unhide() 
		}, 100)
        return this        
    },

	fadeInBrowser: function() {
		this.browser().setOpacity(1)
	},
    
    shared: function() {        
        if (!this._shared) {
            this._shared = App.clone();
        }
        return this._shared;
    },
    
    mainWindow: function () {
        return Window
    },

    setName: function(aString) {
        this._name = aString
		WebBrowserWindow.setTitle(this.name())
        return this
    },
    
	// --- app log ---
	
    clearAppLog: function() {
        //this.appLogFile().setContents("")
    },
    
    appLog: function(aString) {
        console.log("app logging: " + aString)
        //this.appLogFile().appendString(aString)
        return this
    },

    versionsString: function() {
        var parts = [1]
        /*
        var process = require('remote').require("process")
        var parts = [
            this.name() + " v" + this.version() ,
            "Electron v" + process.versions['electron'], 
            "Chrome v" + process.versions['chrome']
        ]
        */
        return parts.join("\n")
    },
        
    showVersions: function() {
        console.log(this.versionsString())
    }
})
