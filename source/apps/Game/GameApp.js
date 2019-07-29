"use strict"

/*
    
    GameApp



*/

App.newSubclassNamed("GameApp").newSlots({
    name: "game test",
    version: [0, 0, 0, 0],

    // model
    about: null,
    about: null,

    // views
    browser: null,
    shelf: null,

    atomNodeView: null,

}).setSlots({

    init: function () {
        //this.setName("voluntary.app")

        App.init.apply(this)

    },

    setup: function () {
        App.setup.apply(this)
        

        if (false) {
            this.setupAtom()
        } else {
            
            this.setupModel()
            this.setupViews()
        }

        this.appDidInit()
        return this
    },

    setupAtom: function() {
        this.setAtomNode(AtomNode.clone())
        this.setAtomNodeView(AtomNodeView.clone().setNode(this.atomNode()))
        this.atomNodeView().setIsVertical(true).syncLayout()
        this.rootView().addSubview(this.atomNodeView())
    },

    // --- setup model ---

    setupModel: function () {

        // about 

        this.setAbout(BMStorableNode.clone().setTitle("Settings").setSubtitle(null).setNodeMinWidth(250))
        this.addSubnode(this.about())
		
        // --- about subnodes --------------------

        /*
        // data store
        this.setDataStore(BMDataStore.clone())
        this.about().addSubnode(this.dataStore())
        */

        // game
        const gameNode = GameNode.clone()
        this.about().addSubnode(gameNode)

        // --- graphics subnodes --------------------
		
        this.setResources(BMResources.shared())
        this.about().addSubnode(this.resources())
		
        return this
    },

    // --- setup views ---
    
    setupViews: function() {
        this.setupBrowser()
        //this.setupShelf()
    },

    isBrowserCompatible: function() {
        if (WebBrowserWindow.agentIsSafari()) {
            return false
        }
        return true
    },
    
    setupBrowser: function() {	
        this.setBrowser(BrowserView.clone())
    
        this.browser().hideAndFadeIn()
        this.browser().setNode(this)
                
        this.rootView().addSubview(this.browser())
        this.browser().scheduleSyncFromNode()
        this.browser().scheduleSelfFor("syncFromHashPath", 10)
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
        return this
    },

    setupShelf: function() {
        this.setShelf(ShelfView.clone())
        this.rootView().addSubview(this.shelf())

        //this.shelf().scheduleSelfFor("appDidInit", 10)
        window.SyncScheduler.shared().scheduleTargetAndMethod(this.shelf(), "appDidInit", 10)
        return this        
    },

    appDidInit: function () {
        App.appDidInit.apply(this)
        window.ResourceLoaderPanel.stop() 
    },
})

GameApp.showVersion()

