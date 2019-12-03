"use strict"

/*
    
    PeerApp



*/

window.PeerApp = class PeerApp extends App {
    
    initPrototype () {
        this.newSlots({
            name: "voluntary.app",
            version: [0, 5, 1, 0],
        
            // model
            about: null,
            localIdentities: null,
            network: null,
            dataStore: null,
            resources: null,
            
            atomNode: null,
        
            // views
            browser: null,
            shelf: null,
        
            atomNodeView: null,
        })
    }

    init () {
        super.init()
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

    setupAtom () {
        this.setAtomNode(AtomNode.clone())
        this.setAtomNodeView(AtomNodeView.clone().setNode(this.atomNode()))
        this.atomNodeView().setIsVertical(true).syncLayout()
        this.rootView().addSubview(this.atomNodeView())
    }

    // --- setup model ---

    setupModel () {

        // identities
        this.setLocalIdentities(this.defaultStore().rootInstanceWithPidForProto("_localIdentities", BMLocalIdentities))
        this.addLinkSubnode(this.localIdentities()).setTitle("Identities")

        // about 

        this.setAbout(BMStorableNode.clone().setTitle("Settings").setSubtitle(null).setNodeMinWidth(250))
        this.addSubnode(this.about())
		
        // --- about subnodes --------------------

        // network
        this.setNetwork(BMNetwork.shared())
        this.network().setLocalIdentities(this.localIdentities())
        this.addLinkSubnode(this.network()).setTitle("Network")

        // data store
        this.setDataStore(BMDataStore.clone())
        this.about().addSubnode(this.dataStore())

        // protos browser
        //const classBrowser = BMClassBrowser.clone()
        //this.about().addSubnode(classBrowser)

        this.network().servers().connect() // observe appDidInit instead?

        // --- graphics subnodes --------------------
		
        this.setResources(BMResources.shared())
        this.about().addSubnode(this.resources())
		
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
        window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
        return this
    }

    setupShelf () {
        this.setShelf(ShelfView.clone())
        this.rootView().addSubview(this.shelf())

        window.SyncScheduler.shared().scheduleTargetAndMethod(this.shelf(), "appDidInit", 10)

        return this        
    }

    appDidInit () {
        super.appDidInit()
        
        // ResourceLoaderPanel can't use notification as it's a boot object
        // what if we added a one-shot observation for it, or would that be more confusing?

        window.ResourceLoaderPanel.stop() 
    }
    
}.initThisClass()


