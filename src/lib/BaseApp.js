/*
    BaseApp is a singleton that represents the application
    For your application, create a subclass called App and implement
    a custom setup method.
*/

// ---

BaseApp = BMNavNode.extend().newSlots({
    type: "BaseApp",
    name: null,
    browser: null,
    about: null,
    isDebugging: true,
    version: "0.0",
}).setSlots({
    init: function () {
        BMNavNode.init.apply(this)
        this.setNodeMinWidth(150)
		NodeStore.shared().asyncOpen( () => { this.didOpenStore() })
        this.clearAppLog()
    },

	didOpenStore: function() {
		//NodeStore.shared().clear()
        this.setup() 
        //console.log("app didOpenStore\n")	
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

    setupBrowser: function() {
        this.setBrowser(BrowserView.clone().setColumnGroupCount(4).selectFirstColumn())
     
        this.browser().setNode(this).syncFromNode()
		this.browser().setOpacity(0)
		this.browser().setTransition("all 0.5s")

        var windowContent = document.getElementById('body');
        windowContent.appendChild(this.browser().element())    
 
		setTimeout(() => {
			this.browser().setOpacity(1)
			setTimeout(() => { this.browser().setTransition("") }, 1000)
		}, 0)
		
        return this
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
        document.title = this.name()
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
