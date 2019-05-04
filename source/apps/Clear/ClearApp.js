"use strict"

/*
    
    ClearApp


*/

window.ClearApp = App.extend().newSlots({
    type: "ClearApp",
    name: "Clear.app",
    version: [0, 0, 0, 0],

    // model
    flexNode: null,
    settings: null,
    resources: null,

    // views
    browser: null,
}).setSlots({

    init: function () {
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

    // --- setup model ---

    setupModel: function () {
	
        // flex
        const myLists = NodeStore.shared().rootInstanceWithPidForProto("_flexNode", BMFlexNode);
        myLists.setTitle("MyLists")
        this.addSubnode(myLists)

        // about 
        this.setSettings(BMStorableNode.clone().setTitle("Settings").setSubtitle(null).setNodeMinWidth(250))
        this.addSubnode(this.settings())

        // resources
        this.setResources(BMResources.shared())
        this.settings().addSubnode(this.resources())
		
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
        window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
        return this
    },

    appDidInit: function () {
        App.appDidInit.apply(this)
        
        // ResourceLoaderPanel can't use notification as it's a boot object
        // what if we added a one-shot observation for it, or would that be more confusing?

        window.ResourceLoaderPanel.stop() 
    },
})

ClearApp.showVersion()

