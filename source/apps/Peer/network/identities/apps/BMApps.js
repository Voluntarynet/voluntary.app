"use strict"

/*

    BMApps

    A per-identity instantiated collection of apps.

*/

window.BMApps = class BMApps extends BMStorableNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setTitle("apps")
        this.setShouldStore(true)
        this.addApps()
    }

    didLoadFromStore () {
        this.addApps()
        return this
    }

    appProtos () {
        return [BMChat] //BMMail, BMTwitter, BMGroupChat] //, BMChat, BMClassifieds, BMBitcoinWallet]
    }

    addApps () {
        this.addAnyMisingApps()
        this.removeAnyExtraApps()
        return this
    }

    removeAnyExtraApps () {
        // remove any apps not in appProtos
        const types = this.appProtos().map(proto => proto.type())
        const matches = this.apps().filter(app => types.contains(app.type()) )
        this.copySubnodes(matches)
    }

    addAnyMisingApps () {
        this.appProtos().forEach((appProto) => {
            this.addAppTypeIfMissing(appProto)
        })
        return this
    }

    addAppTypeIfMissing (appProto) {
        //this.debugLog(".addAppTypeIfMissing(" + appProto.type() + ")")
        if (this.hasAppType(appProto) === false) {
            this.addSubnode(appProto.clone())
        }
        return this
    }

    hasAppType (appProto) {
        return this.apps().detect(app => app.type() === appProto.type()) != null
    }

    apps () {
        return this.subnodes()
    }

    appNamed (name) {
        return this.firstSubnodeWithTitle(name)
    }

    handleAppMsg (aMessage) {
        this.subnodes().forEach(app => app.handleAppMsg(aMessage) )
    }
    
}.initThisClass()

