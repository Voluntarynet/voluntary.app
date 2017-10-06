var bitcore = require("bitcore-lib")
var BitcoreMessage = require('bitcore-message');
var ECIES = require('bitcore-ecies');
var Buffer = bitcore.deps.Buffer;

"use strict"

window.BMLocalIdentity = BMKeyPair.extend().newSlots({
    type: "BMLocalIdentity",
    name: "",
	privateKeyString: "",
}).setSlots({
    
    init: function () {
        BMKeyPair.init.apply(this)
		this.setShouldStore(true)
		//this.setShouldStoreSubnodes(false)
        this.setNodeTitleIsEditable(true)
 
        this.initStoredSubnodeSlotWithProto("apps", BMApps)
        this.initStoredSubnodeSlotWithProto("profile", BMProfile)
        this.initStoredSubnodeSlotWithProto("remoteIdentities", BMRemoteIdentities)
        
		this.addStoredSlots(["name", "privateKeyString"])
		
        this.setName("Untitled")

		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
		//console.log("is editable = ", this.profile().fieldNamed("publicKeyString").valueIsEditable())
		this.generatePrivateKey()
        this.addAction("delete")

    },

	finalize: function() {
		console.log(this.typeId() + ".finalize()")
		NotificationCenter.shared().newNotification().setSender(this.uniqueId()).setName("didChangeIdentity").setInfo(this).post()
	},
	
	didLoadFromStore: function() {
		//console.log(this.typeId() + " didLoadFromStore")
		BMKeyPair.didLoadFromStore.apply(this)
		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
	},
    
    title: function () {
        return this.name()
    },
    
    setTitle: function (s) {
        this.setName(s)
        return this
    }, 
 
    handleObjMsg: function(objMsg) {
        //console.log(this.typeId() + " " + this.name() + " handleObjMsg ", objMsg)
        var senderId = this.remoteIdentities().idWithPublicKeyString(objMsg.senderPublicKeyString()) 
        if (senderId) {
            return senderId.handleObjMsg(objMsg)
        }
        return false
    },

	handleAppMsg: function(appMsg) {	
		return this.apps().handleAppMsg(appMsg)
	},
	
	allIdentitiesMap: function() { // only uses valid remote identities
		var ids = Map.clone()
		ids.atPut(this.publicKeyString(), this)
		
		this.remoteIdentities().subnodes().forEach((rid) => { 
		    ids.merge(id.allIdentitiesMap())
		})
		
		this.apps().subnodes().forEach((app) => { 
		    ids.merge(app.allIdentitiesMap())
		})
		
		return ids
	},
	
})	