"use strict"

/*

    BMContactLinks

*/

window.BMContactLinks = class BMContactLinks extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("linkProto", null)
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setTitle("contacts")
    }

    setParentNode (aNode) {
        super.setParentNode(aNode)

        if (aNode === null) {
            this.unwatchIdentities()
        } else {
            this.watchIdentities()
        }
    }

    finalize () {
        super.finalize()

        if (this.parentNode()) {
            this.updatedContacts()
        }
        this.setTitle("contacts")
    }

    loadFinalize () {
        super.loadFinalize()
        this.updatedContacts()
    }

    watchIdentities () {
        if (!this._idsObservation) {
            this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        }
    }

    unwatchIdentities () {
        NotificationCenter.shared().removeObserver(this)
        this._idsObservation = null
    }

    didChangeIdentity (aNote) {
        //console.log(this.nodePathString() + ".didChangeIdentities() <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "updatedContacts")
    }

    chatApp () {
        return this.parentNode()
    }

    localIdentity () {
        return this.parentNodeOfType("BMLocalIdentity")
    }

    contactLinks () {
        return this.subnodes()
    }

    updatedContacts () {
        this.removeLinksWithNoContact()
        this.addLinkForEveryContact()
        //this.debugLog(" updateIdentities contactLinks " + this.subnodeCount())
        return this
    }

    chatTargetIds () {
        return this.localIdentity().remoteIdentities().validSubnodes()
    }

    addLinkForEveryContact () {
        this.chatTargetIds().forEach((rid) => {
            if (!this.linkForContact(rid)) {
                const link = this.linkProto().clone().setRemoteIdentity(rid)
                this.addSubnode(link)
            }
        })
        return this
    }

    removeLinksWithNoContact () {
        this.contactLinks().slice().forEach((link) => {
            if (!link.hasValidRemoteIdentity()) {
                this.debugLog(" removing invalid link ", link.title())
                this.removeSubnode(link)
            }
        })
        return this
    }

    linkForContact (rid) {
        return this.contactLinks().detect((link) => {
            return link.remoteIdentity() === rid
        })
    }

    /*
    sortSubnodes () {
        const contactLinks = this.contactLinks().slice()

        contactLinks.sort((linkA, linkB) => {
            return linkA.title().localeCompare(linkB.title())
        })

        contactLinks.sort((linkA, linkB) => {
            return linkA.mostRecentDate() - linkB.mostRecentDate()
        })

        if (!contactLinks.equals(this.contactLinks())) {
            this.copySubnodes(contactLinks)
        }

        return this
    }
    */
    
}.initThisClass()