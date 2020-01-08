
"use strict"

/*

    BMLocalIdentities
    
*/

window.BMLocalIdentities = class BMLocalIdentities extends BMStorableNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setTitle("My identities")
        
        this.setActions(["add"])
        this.setSubnodeProto(BMLocalIdentity)
        this.setNoteIsSubnodeCount(true)
        
        this._didChangeIdentitiesNote = NotificationCenter.shared().newNote().setSender(this).setName("didChangeIdentities")
        this.setNodeMinWidth(240)
        this.setNodeCanReorderSubnodes(true)
    }

    current () {
        if (this.subnodesCount() === 0) {
            this.add()
        }
        
        return this.subnodes().first()
    }
    
    idWithPublicKeyString (s) {
        return this.subnodes().detect(function (id) {            
            return id.publicKey().toString() === s
        })
    }

    idWithName (s) {
        return this.subnodes().detect(function (id) {            
            return id.name() === s
        })
    }
	
    names () {
        return this.subnodes().map((id) => { return id.name(); })
    }
	
    identities () {
	    return this.subnodes()
    }
	
    didChangeSubnodeList () {
        super.didChangeSubnodeList()
        if (this._didChangeIdentitiesNote) {
            this._didChangeIdentitiesNote.post()
        }
        return this
    }
    
    handleObjMsg (objMsg) {
        let result = false
        
        //console.log("========== this.identities() = ", this.identities().length)
        this.identities().forEach((id) => {
            console.log("local ------------- " + this.typeId() + " " + id.title() + ".handleObjMsg()")
            result |= id.handleObjMsg(objMsg)
        })
        return result
    }
    
}.initThisClass()
