"use strict"

/*

    BMRemoteIdentities
    
*/

window.BMRemoteIdentities = class BMRemoteIdentities extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setTitle("contacts")
        
        this.setActions(["add"])
        this.setSubnodeProto(BMRemoteIdentity)
        this.setCanDelete(true)

        this.setNoteIsSubnodeCount(true)
        //this.setShouldStoreSubnodes(false)
        this._didChangeIdentitiesNote = NotificationCenter.shared().newNote().setSender(this).setName("didChangeIdentities")
        this.watchIdentity()
        this.setNodeMinWidth(240)
    }

    didLoadFromStore () {
        super.didLoadFromStore()
        this.setTitle("contacts")
        this.postChangeNote()
    }

    watchIdentity () {
        if (!this._idObs) {
	        this._idObs = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        }
    }
	
    didChangeIdentity (aNote) {
        if (aNote.info() === this) {
        	this.postChangeNote()
        }
    }
	
    postChangeNote () {
        this._didChangeIdentitiesNote.post()
    }
	
    validSubnodes () {
        return this.subnodes().select(function (id) {
            return id.isValid()
        })		
    }

    idWithPublicKeyString (publicKeyString) { // limits to valid nodes
        return this.validSubnodes().detect(function (id) {
            return id.publicKeyString().toString() === publicKeyString
        })
    }
    
    addIdWithPublicKeyString (publicKeyString) {
        const id = BMRemoteIdentity.clone().setPublicKeyString(publicKeyString)
        this.addSubnode(id)
        return id
    }

    idWithName (s) {
        return this.subnodes().detect(function (id) {            
            return id.name() === s
        })
    }
	
    names () {
        return this.subnodes().map((id) => { return id.name(); })
    }
	
    publicKeyStrings () {
        return this.validSubnodes().map((id) => { return id.publicKeyString(); })
    }
	
    didChangeSubnodeList () {
        super.didChangeSubnodeList()
        this._didChangeIdentitiesNote.post()
        return this
    }
    
    handleObjMsg (objMsg) {
        let result = false
        this.subnodes().forEach((id) => {
            console.log(" remote ------------- " + this.typeId() + " " + id.title() + ".handleObjMsg()")
            result |= id.handleObjMsg(objMsg)
        })
        return result
    }
    
    shelfIconName () {
        return "chat/contacts"
        //	    return "users-white"
    }
    
}.initThisClass()
