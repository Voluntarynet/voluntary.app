"use strict"

/*
    
    AtomApp



*/

window.AtomApp = App.extend().newSlots({
    type: "AtomApp",

    name: "atom",
    version: [0, 0, 1, 0],

    atomNode: null,
    atomNodeView: null,

}).setSlots({

    init: function () {
        App.init.apply(this)
    },

    setup: function () {
        App.setup.apply(this)
        
        this.setupAtom()
        //Mouse.shared()
        this.appDidInit()
        return this
    },

    setupAtom: function() {
        this.setAtomNode(AtomNode.clone())
        this.setAtomNodeView(AtomNodeView.clone().setNode(this.atomNode()))
        this.atomNodeView().setIsVertical(true).syncLayout()
        this.rootView().addSubview(this.atomNodeView())
    },

    
    isBrowserCompatible: function() {
        if (WebBrowserWindow.agentIsSafari()) {
            return false
        }
        return true
    },

    appDidInit: function () {
        App.appDidInit.apply(this)
        window.ResourceLoaderPanel.stop() 
    },
})

window.AtomApp.showVersion()

