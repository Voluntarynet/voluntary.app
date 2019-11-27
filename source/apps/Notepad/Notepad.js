"use strict"

/*
    
    Notepad


*/

window.Notepad = class Notepad extends App {
    
    initPrototype () {
        this.newSlots({
            name: "Notepad",
            version: [0, 0, 0, 0],
        
            // model
            flexNode: null,
            settings: null,
            resources: null,
            dataStore: null,
        
            // views
            browser: null,
        })
    }

    init () {
        super.init()
        return this
    } 

    setup  () {
        App.setup.apply(this)
        

        if (false) {
            this.setupAtom()
        } else {
            
            this.setupModel()
            this.setupViews()
        }

        this.appDidInit()

        return this
    }

    // --- setup model ---

    setupModel  () {        
        // flex
        const myLists = this.defaultStore().rootInstanceWithPidForProto("_menuNode", BMMenuNode);
        myLists.setTitle("Notepad")
        this.addSubnode(myLists)

        // about 
        this.setSettings(BMStorableNode.clone().setTitle("Settings").setSubtitle(null).setNodeMinWidth(250))
        this.addSubnode(this.settings())

        // resources
        this.setResources(BMResources.shared())
        this.settings().addSubnode(this.resources())
        
        // data store
        this.setDataStore(BMDataStore.clone())
        this.settings().addSubnode(this.dataStore())

        return this
    }

    // --- setup views ---
    
    setupViews () {
        this.setupBrowser()
        //this.setupShelf()
    }

    isBrowserCompatible () {
        if (WebBrowserWindow.shared().agentIsSafari()) {
            return false
        }
        return true
    }
    
    setupBrowser () {	
        this.setBrowser(BrowserView.clone())
    
        this.browser().hideAndFadeIn()
        this.browser().setNode(this)
                
        this.rootView().addSubview(this.browser())
        this.browser().scheduleSyncFromNode()
        this.browser().scheduleMethod("syncFromHashPath", 10)
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
        return this
    }

    appDidInit  () {
        App.appDidInit.apply(this)
        
        // ResourceLoaderPanel can't use notification as it's a boot object
        // what if we added a one-shot observation for it, or would that be more confusing?

        window.ResourceLoaderPanel.stop() 
    }
}.initThisClass()

Notepad.showVersion()

