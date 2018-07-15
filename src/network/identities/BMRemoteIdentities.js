

"use strict"

window.BMRemoteIdentities = BMStorableNode.extend().newSlots({
    type: "BMRemoteIdentities",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("contacts")
        
        this.setActions(["add"]).setSubnodeProto(BMRemoteIdentity)
        this.setNoteIsSubnodeCount(true)
        //this.setShouldStoreSubnodes(false)
        //this.loadIfPresent()
        this._didChangeIdentitiesNote = NotificationCenter.shared().newNote().setSender(this.uniqueId()).setName("didChangeIdentities")
        this.watchIdentity()
        this.setNodeMinWidth(240)
    },

    didLoadFromStore: function() {
        BMStorableNode.didLoadFromStore.apply(this)
        this.setTitle("contacts")
        this.postChangeNote()
    },

    watchIdentity: function() {
        if (!this._idObs) {
	        this._idObs = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        }
    },
	
    didChangeIdentity: function(aNote) {
        if (aNote.info() == this) {
        	this.postChangeNote()
        }
    },
	
    postChangeNote: function() {
        this._didChangeIdentitiesNote.post()
    },
	
    validSubnodes: function() {
        return this.subnodes().select(function (id) {
            return id.isValid()
        })		
    },

    idWithPublicKeyString: function(publicKeyString) { // limits to valid nodes
        return this.validSubnodes().detect(function (id) {
            return id.publicKeyString().toString() == publicKeyString
        })
    },
    
    addIdWithPublicKeyString: function(publicKeyString) {
        var id = BMRemoteIdentity.clone().setPublicKeyString(publicKeyString)
        this.addSubnode(id)
        return id
    },

    idWithName: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.name() == s
        })
    },
	
    names: function() {
        return this.subnodes().map((id) => { return id.name(); })
    },
	
    publicKeyStrings: function() {
        return this.validSubnodes().map((id) => { return id.publicKeyString(); })
    },
	
    didChangeSubnodeList: function() {
        BMStorableNode.didChangeSubnodeList.apply(this)
        this._didChangeIdentitiesNote.post()
        return this
    },
    
    handleObjMsg: function(objMsg) {
        var result = false
        this.subnodes().forEach((id) => {
            console.log(" remote ------------- " + this.typeId() + " " + id.title() + ".handleObjMsg()")
            result |= id.handleObjMsg(objMsg)
        })
        return result
    },
    
    shelfIconName: function() {
        return "chat/contacts"
        //	    return "users-white"
    },
})
