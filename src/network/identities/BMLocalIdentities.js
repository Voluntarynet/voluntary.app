
"use strict"

/*

    BMLocalIdentities
    
*/

window.BMLocalIdentities = BMStorableNode.extend().newSlots({
    type: "BMLocalIdentities",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("My identities")
        
        this.setActions(["add"])
        this.setSubnodeProto(BMLocalIdentity)
        this.setNoteIsSubnodeCount(true)
        
        //this.setPidSymbol("_localIdentities")  
        this._didChangeIdentitiesNote = NotificationCenter.shared().newNote().setSender(this.uniqueId()).setName("didChangeIdentities")
        this.setNodeMinWidth(240)
        this.setNodeCanReorder(true)
    },

    current: function() {
        if (this.subnodesCount() === 0) {
            this.add()
        }
        
        return this.subnodes()[0]
    },
    
    idWithPublicKeyString: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.publicKey().toString() == s
        })
    },

    idWithName: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.name() == s
        })
    },
	
    names: function() {
        return this.subnodes().map((id) => { return id.name(); })
    },
	
    identities: function() {
	    return this.subnodes()
    },
	
    didChangeSubnodeList: function() {
        BMStorableNode.didChangeSubnodeList.apply(this)
        this._didChangeIdentitiesNote.post()
        return this
    },
    
    handleObjMsg: function(objMsg) {
        let result = false
        
        //console.log("========== this.identities() = ", this.identities().length)
        this.identities().forEach((id) => {
            console.log("local ------------- " + this.typeId() + " " + id.title() + ".handleObjMsg()")
            result |= id.handleObjMsg(objMsg)
        })
        return result
    },
})
