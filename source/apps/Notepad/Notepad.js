"use strict"

/*
    
    Notepad


*/

window.Notepad = class Notepad extends App {
    
    initPrototype () {
        this.newSlots({        
            // model
            settings: null,
            resources: null,
            dataStore: null,
            // views
            browser: null,
        })
    }

    init () {
        super.init()
        this.setName("Notepad")
        this.setVersion([0, 0, 0, 0])
        return this
    } 

    setup () {
        super.setup()        

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

    setupModel () {     
        this.defaultStore().setName(this.name())

        const myLists = this.defaultStore().rootInstanceWithPidForProto("_menuNode", BMMenuNode);
        myLists.setTitle("Notepad")
        this.addLinkSubnode(myLists)

        this.setupSettings()
        return this
    }

    setupSettings () {
        // settings
        this.setSettings(BMStorableNode.clone().setTitle("Settings").setSubtitle(null).setNodeMinWidth(250))
        this.addSubnode(this.settings())

        // resources
        this.setResources(BMResources.shared())
        this.settings().addSubnode(this.resources())
        
        // data store
        this.setDataStore(BMDataStore.clone())
        this.settings().addSubnode(this.dataStore())
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

    appDidInit () {
        super.appDidInit()
        
        // ResourceLoaderPanel can't use notification as it's a boot object
        // what if we added a one-shot observation for it, or would that be more confusing?

        window.ResourceLoaderPanel.stop() 
    }
}.initThisClass()


