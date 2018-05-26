"use strict"

window.BMContactLinks = BMStorableNode.extend().newSlots({
    type: "BMContactLinks",
    linkProto: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("contacts")
    },

    setParentNode: function (aNode) {
        BMStorableNode.setParentNode.apply(this, [aNode])
        if (aNode == null) {
            this.unwatchIdentities()
        } else {
            this.watchIdentities()
        }
    },

    finalize: function () {
        if (this.parentNode()) {
            this.updatedContacts()
        }
        this.setTitle("contacts")
    },

    loadFinalize: function () {
        this.updatedContacts()
    },

    watchIdentities: function () {
        if (!this._idsObservation) {
            this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        }
    },

    unwatchIdentities: function () {
        NotificationCenter.shared().removeObserver(this)
        this._idsObservation = null
    },

    didChangeIdentity: function (aNote) {
        //console.log(this.nodePathString() + ".didChangeIdentities() <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        SyncScheduler.scheduleTargetAndMethod(this, "updatedContacts")
    },

    chatApp: function () {
        return this.parentNode()
    },

    localIdentity: function () {
        return this.parentNodeOfType("BMLocalIdentity")
    },

    contactLinks: function () {
        return this.subnodes()
    },

    updatedContacts: function () {
        this.removeLinksWithNoContact()
        this.addLinkForEveryContact()
        this.sortSubnodes()
        //console.log(this.typeId() + " updateIdentities contactLinks " + this.subnodes().length)
        return this
    },

    chatTargetIds: function () {
        return this.localIdentity().remoteIdentities().validSubnodes()
    },

    addLinkForEveryContact: function () {
        this.chatTargetIds().forEach((rid) => {
            if (!this.linkForContact(rid)) {
                var link = this.linkProto().clone().setRemoteIdentity(rid)
                this.addSubnode(link)
            }
        })
        return this
    },

    removeLinksWithNoContact: function () {
        this.contactLinks().slice().forEach((link) => {
            if (!link.hasValidRemoteIdentity()) {
                console.log(this.typeId() + " removing invalid link ", link.title())
                this.removeSubnode(link)
            }
        })
        return this
    },

    linkForContact: function (rid) {
        this.prepareToAccess()
        return this.contactLinks().detect((link) => {
            return link.remoteIdentity() === rid
        })
    },

    sortSubnodes: function () {
        var contactLinks = this.contactLinks().slice()

        contactLinks.sort((linkA, linkB) => {
            return linkA.title().localeCompare(linkB.title())
        })

        contactLinks.sort((linkA, linkB) => {
            return linkA.mostRecentDate() - linkB.mostRecentDate()
        })

        if (!contactLinks.equals(this.contactLinks())) {
            this.setSubnodes(contactLinks)
        }

        return this
    },
})