"use strict"

/*

    App

    A singleton that represents the application.
    It's superclass, BaseApp will set up the NodeStore and call App. after it's initialized.
    After setup, appDidInit is called.
*/

window.App = BaseApp.extend().newSlots({
    type: "App",
    localIdentities: null,
    network: null,
    dataStore: null,
}).setSlots({
    init: function () {
        BaseApp.init.apply(this)
        this.setName("NT3P")
    },

    shared: function() {        
        if (!App._shared) {
            App._shared = App.clone();
        }
        return App._shared;
    },

    setup: function () {
        BaseApp.setupUI.apply(this)
        //window.app = this
        this.setupPageTitle()
        this.setupSubnodes()
        return this
    },

    setupPageTitle: function () {
        var name = WebBrowserWindow.shared().urlHostname()

        if (name != "") {
            name = name.before(".").replaceAll("-", " ").toUpperCase()
        } else {
            name = "-"
        }

        this.setName(name)
        this.setTitle(name)
        return this
    },

    setupSubnodes: function () {

        // ids

        this.setLocalIdentities(NodeStore.shared().rootInstanceWithPidForProto("_localIdentities", BMLocalIdentities))
        this.addSubnode(this.localIdentities())

        // about 

        this.setAbout(BMNode.clone().setTitle("Settings").setSubtitle(null))
        this.about()
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

        this.appDidInit()

        try {
            this.network().servers().connect()
        } catch (e) {
            console.warn("App setupSubnodes caught exception: ", e)
        }

        return this
    },

    appDidInit: function () {
        //console.log("App.appDidInit() --------------------------------")
        BaseApp.appDidInit.apply(this)
        window.LoadProgressBar.stop()
        window.SyncScheduler.shared().scheduleTargetAndMethod(this.browser(), "syncFromHashPath", 10)
    },
})

