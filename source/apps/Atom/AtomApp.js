"use strict"

/*
    
    AtomApp



*/


window.AtomApp = class AtomApp extends App {
    
    initPrototype () {
        this.newSlots({
            name: "atom",
            version: [0, 0, 1, 0],
        
            atomNode: null,
            atomNodeView: null,
        })
    }

    init () {
        super.init()
        return this
    } 

    setup () {
        super.setup()
        
        this.setupAtom()
        //Mouse.shared()
        this.appDidInit()
        return this
    }

    setupAtom () {
        this.setAtomNode(AtomNode.clone())
        this.setAtomNodeView(AtomNodeView.clone().setNode(this.atomNode()))
        this.atomNodeView().setIsVertical(true).syncLayout()
        this.rootView().addSubview(this.atomNodeView())
    }

    
    isBrowserCompatible () {
        if (WebBrowserWindow.agentIsSafari()) {
            return false
        }
        return true
    }

    appDidInit  () {
        super.appDidInit()
        window.ResourceLoaderPanel.stop() 
    }
    
}.initThisClass()


