"use strict"

/*
    App 
    
    A singleton that represents the application. For your application, 
    create a subclass called App and implement a custom setup method.

    Handles starting up NodeStore.

*/

window.App = BMNode.extend().newSlots({
    type: "App",
    name: "App",
    isDebugging: true,
    version: [0, 0],
    nodeStoreDidOpenObs: null,
    appDidInitNote: null,
}).setSlots({

    shared: function() {   
        return this.sharedInstanceForClass(App)
    },

    init: function () {
        BMNode.init.apply(this)
        this.setAppDidInitNote(window.NotificationCenter.shared().newNote().setSender(this).setName("appDidInit"))
        this.setNodeStoreDidOpenObs(window.NotificationCenter.shared().newObservation())
        this.nodeStoreDidOpenObs().setName("nodeStoreDidOpen").setObserver(this).setTarget(NodeStore.shared())
    },

    // run and setup sequence in order of which methods are called
    // 1. setup NodeStore

    run: function() {

        if (!this.isBrowserCompatible()) {
            window.LoadProgressBar.setError("Sorry, this app only works on<br>Chrome, FireFox, and Brave browsers.")
            //this.showBrowserCompatibilityPanel()
            return this
        }

        this.nodeStoreDidOpenObs().watch()
        NodeStore.shared().asyncOpen() 
    },

    // 2. setup 

    nodeStoreDidOpen: function() {
        this.nodeStoreDidOpenObs().stopWatching()
        this.setup()
    },

    setup: function() {
        return this        
    },

    appDidInit: function() {
        this.appDidInitNote().post()

        if (this.runTests) {
		    this.runTests()
        }
    },
	
    rootView: function() {
        return DivView.rootView()
        //return  WebBrowserWindow.shared().documentBody()
    },

    mainWindow: function () {
        return Window
    },

    setName: function(aString) {
        this._name = aString
        this.setTitle(aString)
        WebBrowserWindow.shared().setTitle(aString)
        return this
    },
    
    // --- version ---

    versionsString: function() {
        return this.version().join(".")
    },

    showVersion: function() {
        console.log("Application '" + this.name() + "' version " + this.versionsString())
    },
})

