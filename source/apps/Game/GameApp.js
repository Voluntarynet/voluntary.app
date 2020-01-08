"use strict"

/*
    
    GameApp



*/

window.GameApp = class GameApp extends App {
    
    initPrototype () {
        this.newSlot("name", "game test")
        this.newSlot("version", [0, 0, 0, 0])

        // model
        this.newSlot("about", null)

        // views
        this.newSlot("browser", null)
        this.newSlot("shelf", null)
        this.newSlot("atomNodeView", null)
    }

    init () {
        super.init()
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

    setupAtom () {
        this.setAtomNode(AtomNode.clone())
        this.setAtomNodeView(AtomNodeView.clone().setNode(this.atomNode()))
        this.atomNodeView().setIsVertical(true).syncLayout()
        this.rootView().addSubview(this.atomNodeView())
    }

    // --- setup model ---

    setupModel () {

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
        this.browser().scheduleSelfFor("syncFromHashPath", 10)
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
        return this
    }

    setupShelf () {
        this.setShelf(ShelfView.clone())
        this.rootView().addSubview(this.shelf())

        //this.shelf().scheduleSelfFor("appDidInit", 10)
        window.SyncScheduler.shared().scheduleTargetAndMethod(this.shelf(), "appDidInit", 10)
        return this        
    }

    appDidInit () {
        super.appDidInit()
        window.ResourceLoaderPanel.stop() 
    }
}.initThisClass()

GameApp.showVersion()

