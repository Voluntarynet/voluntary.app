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
        
        this.setName("NT3P")
        this.setupModel()
        this.setupViews()
        this.appDidInit()

        return this
    },

    // --- setup model ---

    setupModel: function () {

        // identities
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
    
    setupViews: function() {
        this.setupBrowser()
        //this.setupShelf()
    },

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

        window.SyncScheduler.shared().scheduleTargetAndMethod(this.shelf(), "appDidInit", 10)

        return this        
    },

    appDidInit: function () {
        App.appDidInit.apply(this)
        
        // LoadProgressBar can't use notification as it's a boot object
        // what if we added a one-shot observation for it, or would that be more confusing?

        window.LoadProgressBar.stop() 

        window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
    },
})

