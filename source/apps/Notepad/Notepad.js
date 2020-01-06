"use strict"

/*
    
    Notepad


*/

window.Notepad = class Notepad extends App {
    
    initPrototype () {
        // model
        this.newSlot("settings", null)
        this.newSlot("resources", null)
        this.newSlot("dataStore", null)

        // view
        this.newSlot("browser", null)
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
        let root = this.defaultStore().rootObject()
        console.log("App.setupModel rooObject.subnodes = ", root.subnodes().map(sn => sn.title()).join(",") )
        //root.removeAllSubnodes()

        const myLists = this.defaultStore().rootInstanceWithPidForProto("Notepad", BMMenuNode);
        myLists.setTitle("Notepad")
        this.addLinkSubnode(myLists)


        const prototypes = this.defaultStore().rootInstanceWithPidForProto("Prototypes", BMMenuNode);
        prototypes.setTitle("Prototypes")
        prototypes.setNodeCanReorderSubnodes(true)
        this.addLinkSubnode(prototypes)

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


