"use strict"

/*
    
    PeerApp



*/

window.PeerApp = App.extend().newSlots({
    type: "PeerApp",

    // model

    about: null,
    localIdentities: null,
    network: null,
    dataStore: null,

    // views

    browser: null,
    shelf: null,

}).setSlots({

    init: function () {
        App.init.apply(this)
    },

    setup: function () {
        App.setup.apply(this)

        // setup model
        
        this.setName("NT3P")
        this.setupSubnodes()

        // setup views

        this.setupBrowser()
        //this.setupShelf()

        // finish

        this.appDidInit()

        return this
    },

    // setup model

    setupSubnodes: function () {

        // ids

        this.setLocalIdentities(NodeStore.shared().rootInstanceWithPidForProto("_localIdentities", BMLocalIdentities))
        this.addSubnode(this.localIdentities())

        // about 

        this.setAbout(BMNode.clone().setTitle("Settings").setSubtitle(null))
        this.addSubnode(this.about())

        // --- about subnodes --------------------

        // network

        this.setNetwork(BMNetwork.shared())
        this.network().setLocalIdentities(this.localIdentities())
        this.about().addSubnode(this.network())

        // data store

        this.setDataStore(BMDataStore.clone())
        this.about().addSubnode(this.dataStore())

        // archive
        var archive = BMArchiveNode.clone()
        this.about().addSubnode(archive)

        // protos
        var protoNode = BMProtoNode.clone()
        this.about().addSubnode(protoNode)

        this.network().servers().connect() // observe appDidInit instead?

        return this
    },

    // --- setup views ---
        
    setupBrowser: function() {	
        this.setBrowser(BrowserView.clone())
    
        this.browser().hideAndFadeIn()
        this.browser().setNode(this)
                
        this.rootView().addSubview(this.browser())
        this.browser().scheduleSyncFromNode()
        
        return this
    },

    setupShelf: function() {
        this.setShelf(ShelfView.clone())
        this.rootView().addSubview(this.shelf())

        /*
        this.shelf().appDidInit()
        this.shelf().unhide() 
        */

        setTimeout(() => {  // without this delay, shelf doesn't see identities?
            this.shelf().appDidInit() 
            this.shelf().unhide() 
        }, 100)

        return this        
    },

    appDidInit: function () {
        App.appDidInit.apply(this)
        window.LoadProgressBar.stop()
        window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
    },
})

