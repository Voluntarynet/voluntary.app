"use strict"

/*
    App 
    
    A singleton that represents the application. For your application, 
    create a subclass called App and implement a custom setup method.

    Handles starting up persistence system.

*/

window.App = class App extends BMNode {
    
    initPrototype () {
        this.newSlot("name", "App")
        this.newSlot("version", [0, 0])
        this.newSlot("nodeStoreDidOpenObs", null)
    }

    init () {
        super.init()

        //Documentation.shared().show()
        //console.log(ProtoClass.subclassesDescription())

        this.setNodeStoreDidOpenObs(window.NotificationCenter.shared().newObservation())
        this.nodeStoreDidOpenObs().setName("nodeStoreDidOpen").setObserver(this).setTarget(this.defaultStore())
        this.setIsDebugging(true)
    }

    title () {
        return this.name()
    }
    
    // run and setup sequence in order of which methods are called
    // 1. setup NodeStore

    isBrowserCompatible () {
        // subclasses can override to do their own checks
        return true
    }

    run () {
        if (!this.isBrowserCompatible()) {
            window.ResourceLoaderPanel.setError("Sorry, this app only works on<br>Chrome, FireFox, and Brave browsers.")
            //this.showBrowserCompatibilityPanel()
            return this
        }

        this.nodeStoreDidOpenObs().watch()
        this.defaultStore().setName(this.name()).asyncOpen() 
    }

    showBrowserCompatibilityPanel () {
        console.log("showing panel")
        const panel = window.PanelView.clone()
        this.rootView().addSubview(panel)
        panel.setTitle("Sorry, this app only works on<br>Chrome, FireFox, and Brave browsers.")
        panel.orderFront()
        panel.setZIndex(100)
        console.log("showed panel")
    }

    // 2. setup 

    nodeStoreDidOpen (aNote) {
        this.nodeStoreDidOpenObs().stopWatching()
        this.defaultStore().rootOrIfAbsentFromClosure(() => BMStorableNode.clone())
        this.setup()
    }

    setup () {
        return this        
    }

    appDidInit () {
        this.showVersion()

        //this.postNoteNamed("appDidInit")
        const note = NotificationCenter.shared().newNote().setSender(this).setName("appDidInit")
        note.post()

        if (this.runTests) {
		    this.runTests()
        }

        //Documentation.shared().show()

        //this.registerServiceWorker() // not working yet
    }
	
    rootView () {
        return DomView.rootView()
        //return  WebBrowserWindow.shared().documentBody()
    }

    mainWindow () {
        return Window
    }

    setName (aString) {
        this._name = aString
        this.setTitle(aString)
        WebBrowserWindow.shared().setTitle(aString)
        return this
    }
    
    // --- version ---

    versionsString () {
        return this.version().join(".")
    }

    showVersion () {
        console.log("Application '" + this.name() + "' version " + this.versionsString())
    }

    // --- server worker ---

    registerServiceWorker () {
        // doesn't work
        // "srsourcec/ServiceWorker.js"
        // "/source/ServiceWorker.js"
        // "../ServiceWorker.js"
        const path = "ServiceWorker.js"
        console.log("registering service worker '" + path + "'")
        const promise = navigator.serviceWorker.register(path); //{ scope: ""../"}

        promise.then(function (registration) {
            console.log("Service worker successfully registered on scope", registration.scope);
        }).catch(function (error) {
            console.log("Service worker failed to register:\n",
                "  typeof(error): ", typeof(error), "\n", 
                "  message:", error.message, "\n",
                "  fileName:", error.fileName, "\n",
                "  lineNumber:", error.lineNumber,  "\n",
                "  stack:", error.stack,  "\n"
                //"  JSON.stringify(error):", JSON.stringify(error),  "\n",
                //"  toString:", error.toString()
            );
        });
    }

}.initThisClass()

